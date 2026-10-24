import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Application } from '../src/core/application.ts'
import { emptyContext, emptySnapshot } from '../src/contracts/index.ts'
const contracts = await import('../src/contracts/connection.ts').catch(() => null)
const service = await import('../src/adapters/codex/connection.ts').catch(() => null)
const initial = { contractVersion: 1, sequence: 0, status: 'disconnected', accountStored: false, verifiedAt: null, errorCode: null, cliVersion: null, needsPlanAcknowledgement: false }
const credentials = { version: 1, clientId: 'oaiapp_testclient', subject: 'test-subject', accessToken: 'private-access', refreshToken: 'private-refresh', idToken: 'private-id', expiresAt: Date.now() + 600000, scopes: ['openid', 'profile', 'email', 'offline_access', 'resource.invoke', 'chatgpt.tokens.use.direct'], planAcknowledged: false }
test('le contrat connexion refuse secrets, URLs et commandes imprécises', () => {
  assert.ok(contracts, 'Le contrat de connexion doit exister')
  assert.equal(contracts.isConnectionState(initial), true)
  assert.equal(contracts.isConnectionState({ ...initial, accessToken: 'secret' }), false)
  assert.equal(contracts.isConnectionState({ ...initial, status: 'verified' }), false)
  for (const action of ['read', 'connect', 'verify', 'cancel', 'disconnect', 'acknowledge-plan', 'manage-usage']) assert.equal(contracts.isConnectionCommand({ contractVersion: 1, correlationId: 'request-001', action }), true)
  for (const input of [{ action: 'exec' }, { contractVersion: 1, correlationId: 'request-001', action: 'connect', url: 'https://evil.test' }, { contractVersion: 1, correlationId: 'request-001', action: 'connect', text: 'draft' }]) assert.equal(contracts.isConnectionCommand(input), false)
})
function fixture(overrides = {}) {
  assert.ok(service, 'Le service de connexion doit exister')
  let saved = null, oauthCalls = 0, probes = 0
  const events = []
  const vault = { read: async () => saved, write: async (value) => { saved = structuredClone(value) }, clear: async () => { saved = null }, registration: async () => ({ version: 1, hostId: 'urn:uuid:11111111-1111-4111-8111-111111111111', clientId: null }), saveClientId: async () => {} }
  const connection = new service.CodexConnection({ vault, oauth: async () => { oauthCalls++; return structuredClone(credentials) }, refresh: async (value) => value, probe: async () => { probes++; return { stopped: true, version: '0.1.0' } }, now: () => new Date('2026-10-24T12:00:00.000Z'), openUsage: async () => {}, ...overrides })
  connection.subscribe((event) => events.push(event))
  return { connection, events, vault, counts: () => ({ oauthCalls, probes }), saved: () => saved }
}
const settled = async (connection) => { for (let i = 0; i < 100; i++) { const s = await connection.read(); if (!['authorizing', 'verifying', 'stopping'].includes(s.status)) return s; await new Promise((r) => setTimeout(r, 5)) } throw Error('not settled') }
test('restaurer un compte ne lance aucun réseau et exige une vérification explicite', async () => {
  const f = fixture({ vault: { read: async () => credentials } })
  assert.equal((await f.connection.read()).status, 'registered')
  assert.deepEqual(f.counts(), { oauthCalls: 0, probes: 0 })
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
