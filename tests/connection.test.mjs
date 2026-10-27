import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Application } from '../src/core/application.ts'
import { emptyContext, emptySnapshot } from '../src/contracts/index.ts'
const contracts = await import('../src/contracts/connection.ts').catch(() => null)
const service = await import('../src/adapters/codex/connection.ts').catch(() => null)
const initial = {network:{status:'idle',checkedAt:null,errorCode:null}, contractVersion: 1, sequence: 0, status: 'disconnected', accountStored: false, verifiedAt: null, errorCode: null, cliVersion: null, needsPlanAcknowledgement: false }
const credentials = { version: 1, clientId: 'oaiapp_testclient', subject: 'test-subject', accessToken: 'private-access', refreshToken: 'private-refresh', idToken: 'private-id', expiresAt: Date.now() + 600000, scopes: ['openid', 'profile', 'email', 'offline_access', 'resource.invoke', 'chatgpt.tokens.use.direct'], planAcknowledged: false }
test('le contrat connexion refuse secrets, URLs et commandes imprécises', () => {
  assert.ok(contracts, 'Le contrat de connexion doit exister')
  assert.equal(contracts.isConnectionState(initial), true)
  assert.equal(contracts.isConnectionState({ ...initial, accessToken: 'secret' }), false)
  assert.equal(contracts.isConnectionState({ ...initial, status: 'verified' }), false)
  for (const action of ['read', 'connect', 'verify', 'cancel', 'disconnect', 'acknowledge-plan', 'manage-usage', 'open-public-keys', 'copy-public-keys']) assert.equal(contracts.isConnectionCommand({ contractVersion: 1, correlationId: 'request-001', action }), true)
  assert.equal(contracts.PUBLIC_KEYS_URL, 'https://auth.openai.com/.well-known/jwks.json')
  for (const action of ['open-public-keys','copy-public-keys']) for (const extra of [{url:'https://foreign.test'},{text:'private-token'}]) assert.equal(contracts.isConnectionCommand({contractVersion:1,correlationId:'request-001',action,...extra}),false)
  for (const input of [{ action: 'exec' }, { contractVersion: 1, correlationId: 'request-001', action: 'connect', url: 'https://evil.test' }, { contractVersion: 1, correlationId: 'request-001', action: 'connect', text: 'draft' }]) assert.equal(contracts.isConnectionCommand(input), false)
})
function fixture(overrides = {}) {
  assert.ok(service, 'Le service de connexion doit exister')
  let saved = null, oauthCalls = 0, probes = 0
  const events = []
  const vault = { read: async () => saved, write: async (value) => { saved = structuredClone(value) }, clear: async () => { saved = null }, registration: async () => ({ version: 1, hostId: 'urn:uuid:11111111-1111-4111-8111-111111111111', clientId: null }), saveClientId: async () => {} }
  const connection = new service.CodexConnection({ vault, oauth: async () => { oauthCalls++; return structuredClone(credentials) }, refresh: async (value) => value, probe: async () => { probes++; return { stopped: true, version: '0.1.0' } }, now: () => new Date('2026-10-24T12:00:00.000Z'), openUsage: async () => {}, openPublicKeys:async()=>{},copyPublicKeys:async()=>{}, ...overrides })
  connection.subscribe((event) => events.push(event))
  return { connection, events, vault, counts: () => ({ oauthCalls, probes }), saved: () => saved }
}
const settled = async (connection) => { for (let i = 0; i < 100; i++) { const s = await connection.read(); if (!['authorizing', 'verifying', 'stopping'].includes(s.status)) return s; await new Promise((r) => setTimeout(r, 5)) } throw Error('not settled') }
test('ouvrir et copier les clés publiques restent des utilitaires sans argument pendant une lease',async()=>{
  const calls=[]
  const f=fixture({vault:{read:async()=>({...credentials,planAcknowledged:true})},probe:async()=>{throw Object.assign(Error(),{code:'NETWORK_UNAVAILABLE'})},openPublicKeys:async(...args)=>calls.push({action:'open',args}),copyPublicKeys:async(...args)=>calls.push({action:'copy',args})})
  await f.connection.command('verify');await settled(f.connection)
  const before=await f.connection.read(),eventCount=f.events.length
  const lease=await f.connection.acquireDialogue(new AbortController().signal)
  try {
    assert.deepEqual(await f.connection.command('open-public-keys'),before)
    assert.deepEqual(await f.connection.command('copy-public-keys'),before)
    assert.deepEqual(calls,[{action:'open',args:[]},{action:'copy',args:[]}])
    assert.equal(f.events.length,eventCount);assert.equal(lease.credentials.accessToken,'private-access')
    await assert.rejects(f.connection.acquireDialogue(new AbortController().signal),{code:'CONNECTION_BUSY'})
  } finally {lease.release()}
  assert.deepEqual(await f.connection.read(),before)
})
for(const action of ['open-public-keys','copy-public-keys'])test(`échec expurgé de ${action} conserve erreur réseau, compte et lease`,async()=>{
  const failed=async()=>{throw Error('private-native-output-with-url')}
  const f=fixture({vault:{read:async()=>({...credentials,planAcknowledged:true})},probe:async()=>{throw Object.assign(Error(),{code:'NETWORK_UNAVAILABLE'})},openPublicKeys:failed,copyPublicKeys:failed})
  await f.connection.command('verify');await settled(f.connection)
  const before=await f.connection.read(),eventCount=f.events.length
  const lease=await f.connection.acquireDialogue(new AbortController().signal)
  try{
    await assert.rejects(f.connection.command(action),{message:'PUBLIC_KEYS_SUPPORT_FAILED'})
    assert.deepEqual(await f.connection.read(),before);assert.equal(f.events.length,eventCount)
    assert.equal(lease.credentials.accessToken,'private-access')
    await assert.rejects(f.connection.acquireDialogue(new AbortController().signal),{code:'CONNECTION_BUSY'})
  }finally{lease.release()}
})
test('le dialogue utilise les credentials internes, exige le forfait acquitté et verrouille les mutations concurrentes', async () => {
  const missing = fixture()
  assert.equal(typeof missing.connection.acquireDialogue, 'function')
  await assert.rejects(missing.connection.acquireDialogue(new AbortController().signal), { code: 'NO_ACCOUNT' })
  const f = fixture({ vault: { read: async () => ({ ...credentials, planAcknowledged: true }) } })
  const lease = await f.connection.acquireDialogue(new AbortController().signal)
  assert.equal(lease.credentials.accessToken, 'private-access')
  assert.match(lease.connectionId, /^c-[a-f0-9]{64}$/)
  const other = fixture({ vault: { read: async () => ({ ...credentials, subject:'other-subject',planAcknowledged:true }) } })
  const otherLease = await other.connection.acquireDialogue(new AbortController().signal)
  assert.notEqual(otherLease.connectionId,lease.connectionId);otherLease.release()
  assert.equal((await f.connection.command('disconnect')).errorCode, 'BUSY')
  assert.equal((await f.connection.read()).accountStored, true)
  assert.equal(JSON.stringify(await f.connection.read()).includes('private-'), false)
  lease.release()
  const denied = fixture({ vault: { read: async () => credentials } })
  await assert.rejects(denied.connection.acquireDialogue(new AbortController().signal), { code: 'PLAN_ACK_REQUIRED' })
})
test('restaurer un compte ne lance aucun réseau et exige une vérification explicite', async () => {
  const f = fixture({ vault: { read: async () => credentials } })
  assert.equal((await f.connection.read()).status, 'registered')
  assert.deepEqual(f.counts(), { oauthCalls: 0, probes: 0 })
})
test('déconnexion refusée pendant le dialogue après témoin vérifié reste un état BUSY valide', async () => {
  const f = fixture({ vault: { read: async () => ({ ...credentials, planAcknowledged:true }) } })
  await f.connection.command('verify');await settled(f.connection)
  const verified = await f.connection.read()
  assert.equal(verified.status,'verified')
  const lease = await f.connection.acquireDialogue(new AbortController().signal)
  try {
    const refused = await f.connection.command('disconnect')
    assert.equal(refused.errorCode,'BUSY')
    assert.equal(contracts.isConnectionState(refused),true)
    assert.deepEqual(await f.connection.read(),verified)
    assert.equal(lease.credentials.accessToken,'private-access')
    await assert.rejects(f.connection.acquireDialogue(new AbortController().signal),{code:'CONNECTION_BUSY'})
  } finally { lease.release() }
})
test('échec du refresh au lancement publie NETWORK_UNAVAILABLE, conserve le compte et libère la lease',async()=>{
  const stored={...credentials,expiresAt:1,planAcknowledged:true}
  let value=structuredClone(stored),writes=0,refreshes=0,clears=0
  const f=fixture({vault:{read:async()=>value,write:async next=>{writes++;value=structuredClone(next)},clear:async()=>{clears++;value=null}},refresh:async()=>{refreshes++;throw Object.assign(Error('private-refresh-detail'),{code:'NETWORK_UNAVAILABLE'})}})
  await f.connection.read()
  await assert.rejects(f.connection.acquireDialogue(new AbortController().signal),{code:'NETWORK_UNAVAILABLE'})
  const state=await f.connection.read()
  assert.equal(state.status,'error');assert.equal(state.errorCode,'NETWORK_UNAVAILABLE');assert.equal(state.accountStored,true)
  assert.equal(contracts.isConnectionState(state),true);assert.deepEqual(f.events.at(-1),state)
  assert.equal(JSON.stringify(state).includes('private-'),false)
  assert.deepEqual(value,stored);assert.equal(writes,0);assert.equal(clears,0);assert.equal(refreshes,1)
  assert.equal((await f.connection.command('disconnect')).status,'disconnected')
  assert.equal(clears,1);assert.equal(refreshes,1)
})
test('connexion courte, compte enregistré et témoin arrêté précèdent le succès sans secret', async () => {
  let release
  const f = fixture({ probe: () => new Promise((resolve) => { release = resolve }) })
  await f.connection.read()
  const start = await f.connection.command('connect')
  assert.equal(start.status, 'authorizing')
  while (!release) await new Promise((r) => setTimeout(r, 1))
  assert.equal((await f.connection.read()).status, 'verifying')
  assert.equal(f.saved().accessToken, 'private-access')
  release({ stopped: true, version: '0.1.0' })
  const done = await settled(f.connection)
  assert.equal(done.status, 'verified'); assert.equal(done.needsPlanAcknowledgement, true)
  assert.ok(f.events.every(contracts.isConnectionState))
  assert.equal(JSON.stringify(f.events).includes('private-'), false)
  await f.connection.command('acknowledge-plan')
  assert.equal(f.saved().planAcknowledged, true)
})
test('OAuth seul ne prouve pas le forfait et un arrêt non confirmé produit inconnu', async () => {
  for (const stopped of [false, true]) {
    const f = fixture({ probe: async () => { if (stopped) throw Object.assign(Error('secret-native-output'), { code: 'PROBE_FAILED' }); return { stopped: false, version: '0.1.0' } } })
    await f.connection.read(); await f.connection.command('connect')
    const done = await settled(f.connection)
    assert.equal(done.status, stopped ? 'error' : 'unknown'); assert.equal(done.accountStored, true); assert.equal(done.verifiedAt, null)
    assert.equal(JSON.stringify(done).includes('secret'), false)
  }
})
test('annulation et fermeture interrompent le travail sans réessai automatique', async () => {
  let calls = 0
  const f = fixture({ oauth: ({ signal }) => new Promise((_, reject) => { calls++; signal.addEventListener('abort', () => reject(Object.assign(Error('cancelled'), { code: 'CANCELLED' })), { once: true }) }) })
  await f.connection.read(); await f.connection.command('connect')
  while (calls < 1) await new Promise((r) => setTimeout(r, 1))
  await f.connection.command('cancel')
  assert.equal((await settled(f.connection)).status, 'cancelled')
  await f.connection.command('connect')
  while (calls < 2) await new Promise((r) => setTimeout(r, 1))
  await f.connection.shutdown()
  assert.equal(calls, 2); assert.equal((await f.connection.read()).status, 'closing')
  await f.connection.command('connect'); assert.equal(calls, 2)
})
test('coffre illisible reste une erreur explicite sans reset et sans OAuth', async () => {
  const f = fixture({ vault: { read: async () => { throw Object.assign(Error('secret'), { code: 'VAULT_UNREADABLE' }) } } })
  assert.equal((await f.connection.read()).errorCode, 'VAULT_UNREADABLE')
  await f.connection.command('connect')
  assert.deepEqual(f.counts(), { oauthCalls: 0, probes: 0 })
})
test('fermer demande l’arrêt du connecteur avant de vider la queue de persistance', async () => {
  let release, stopped = false
  const app = new Application({ store: { read: () => new Promise((resolve) => { release = () => resolve(emptySnapshot()) }) }, chooseDirectory: async () => null, newId: () => 'unused', now: () => '' })
  app.lifecycle.register({ id: 'codex-connection', context: emptyContext(), stop: async () => { stopped = true; return 'stopped' } })
  const read = app.execute({ contractVersion: 1, correlationId: 'read-001', type: 'read-state' })
  while (!release) await new Promise((r) => setTimeout(r, 1))
  const shutdown = app.shutdown()
  assert.equal(stopped, true)
  release(); await read; await shutdown
})
test('fermeture conserve inconnu si le processus ne confirme pas son arrêt', async () => {
  let entered = false
  const f = fixture({ probe: (_value, signal) => new Promise((_, reject) => { entered = true; signal.addEventListener('abort', () => reject(Object.assign(Error('unconfirmed'), { code: 'STOP_UNCONFIRMED' })), { once: true }) }) })
  await f.connection.read(); await f.connection.command('connect')
  while (!entered) await new Promise((r) => setTimeout(r, 1))
  assert.equal(await f.connection.shutdown(), 'unknown')
})
test('deux demandes de fermeture attendent toutes deux le même arrêt en cours', async () => {
  let finishStop
  const app = new Application({ store: { read: async () => emptySnapshot() }, chooseDirectory: async () => null, newId: () => 'unused', now: () => '' })
  app.lifecycle.register({ id: 'codex-connection', context: emptyContext(), stop: () => new Promise((resolve) => { finishStop = resolve }) })
  const first = app.shutdown(), second = app.shutdown()
  try { assert.equal(await Promise.race([second.then(() => 'early'), new Promise((resolve) => setTimeout(() => resolve('pending'), 10))]), 'pending') }
  finally { finishStop('stopped'); await first; await second }
})
test('la fermeture conserve le brouillon déjà admis dans la queue et refuse les nouvelles commandes', async () => {
  let releaseRead, written
  const snapshot = { ...emptySnapshot(), projects: [{ id: 'project-1', name: 'Projet', rootPath: 'C:/fixture', openedAt: '2026-10-24T12:00:00.000Z' }], activeProjectId: 'project-1' }
  const app = new Application({ store: { read: () => new Promise((resolve) => { releaseRead = () => resolve(snapshot) }), write: async (value) => { written = value } }, chooseDirectory: async () => null, newId: () => 'unused', now: () => '2026-10-24T12:00:00.000Z' })
  const read = app.execute({ contractVersion: 1, correlationId: 'pending-read', type: 'read-state' })
  const save = app.execute({ contractVersion: 1, correlationId: 'queued-save', type: 'save-draft', projectId: 'project-1', text: 'Brouillon admis avant fermeture' })
  while (!releaseRead) await new Promise((resolve) => setTimeout(resolve, 1))
  const shutdown = app.shutdown()
  const late = app.execute({ contractVersion: 1, correlationId: 'late-save', type: 'save-draft', projectId: 'project-1', text: 'Trop tard' })
  releaseRead(); await read
  assert.equal((await save).ok, true)
  assert.equal((await late).error.code, 'APP_CLOSING')
  await shutdown; assert.equal(written.drafts[0].text, 'Brouillon admis avant fermeture')
})
test('déconnecter retire les credentials sans effacer l’arrêt inconnu ni autoriser un nouveau témoin', async () => {
  const f = fixture({ probe: async () => ({ stopped: false, version: '0.1.0' }) })
  await f.connection.read(); await f.connection.command('connect'); await settled(f.connection)
  const state = await f.connection.command('disconnect')
  assert.equal(f.saved(), null)
  assert.deepEqual({ status: state.status, errorCode: state.errorCode, accountStored: state.accountStored }, { status: 'unknown', errorCode: 'STOP_UNCONFIRMED', accountStored: false })
  assert.equal((await f.connection.command('connect')).status, 'unknown')
  assert.equal(f.counts().oauthCalls, 1)
})
for (const action of ['disconnect', 'acknowledge-plan']) test(`la fermeture attend la mutation coffre ${action} déjà engagée`, async () => {
  let releaseMutation, entered = false
  const pending = () => new Promise((resolve) => { entered = true; releaseMutation = resolve })
  const f = fixture({ vault: { read: async () => credentials, clear: pending, write: pending } })
  await f.connection.read()
  const command = f.connection.command(action)
  while (!entered) await new Promise((resolve) => setTimeout(resolve, 1))
  const stopping = f.connection.shutdown()
  try { assert.equal(await Promise.race([stopping.then(() => 'early'), new Promise((resolve) => setTimeout(() => resolve('pending'), 10))]), 'pending') }
  finally { releaseMutation(); await command; assert.equal(await stopping, 'stopped') }
})
