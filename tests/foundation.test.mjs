import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, writeFile, rm, mkdir, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const contracts = await import('../src/contracts/index.ts').catch(() => null)
const persistence = await import('../src/adapters/persistence/json-store.ts').catch(() => null)
const core = await import('../src/core/application.ts').catch(() => null)
const boundary = await import('../src/main/boundary.ts').catch(() => null)

test('les frontières refusent un payload imprécis avant tout effet', () => {
  assert.ok(contracts, 'Le contrat métier G0 doit exister')
  assert.equal(contracts.isCommand({ type: 'read-state', correlationId: 'request-001', contractVersion: 1 }), true)
  for (const command of [null, {}, { type: 'exec', correlationId: 'request-001', contractVersion: 1 },
    { type: 'choose-directory', correlationId: 'request-001', contractVersion: 1, path: 'C:/secret' },
    { type: 'save-draft', correlationId: 'request-001', contractVersion: 1, projectId: 'p1', text: 12 },
    { type: 'read-state', correlationId: '../x', contractVersion: 1 }]) {
    assert.equal(contracts.isCommand(command), false)
  }
})

test('le pont ne reconnaît que la fenêtre et la frame exacte autorisées', () => {
  assert.ok(boundary, 'La garde IPC G0 doit exister')
  const wc = {}, frame = { url: 'madness://app/index.html' }
  const event = { sender: wc, senderFrame: frame }
  assert.equal(boundary.isTrustedCaller(event, { webContents: wc, mainFrame: frame }, frame.url), true)
  assert.equal(boundary.isTrustedCaller({ ...event, sender: {} }, { webContents: wc, mainFrame: frame }, frame.url), false)
  assert.equal(boundary.isTrustedCaller({ ...event, senderFrame: { ...frame } }, { webContents: wc, mainFrame: frame }, frame.url), false)
  assert.equal(boundary.isTrustedCaller(event, { webContents: wc, mainFrame: frame }, frame.url + '?unexpected'), false)
})

test('contexte, brouillon et préférence survivent à une nouvelle instance', async () => {
  assert.ok(persistence, 'La persistance G0 doit exister')
  assert.ok(core, 'Le cœur G0 doit exister')
  const dir = await mkdtemp(join(tmpdir(), 'madness-g0-test-'))
  try {
    const store = new persistence.JsonStore(join(dir, 'snapshot.json'))
    let picks = 0
    const deps = { store, chooseDirectory: async () => { picks++; return { rootPath: 'C:\\essai', name: 'essai' } }, newId: () => 'project-1', now: () => '2026-10-23T12:00:00.000Z' }
    const app = new core.Application(deps)
    const cmd = (type, extra = {}) => app.execute({ type, contractVersion: 1, correlationId: 'request-001', ...extra })
    assert.equal((await cmd('read-state')).value.state.projects.length, 0)
    assert.equal((await cmd('choose-directory')).ok, true)
    assert.equal(picks, 1)
    assert.equal((await cmd('save-draft', { projectId: 'project-1', text: 'Brouillon conservé' })).ok, true)
    assert.equal((await cmd('set-navigation', { collapsed: true })).ok, true)
    const restored = new core.Application({ ...deps, store: new persistence.JsonStore(join(dir, 'snapshot.json')), chooseDirectory: async () => { throw Error('Aucune reprise OS automatique') } })
    const result = await restored.execute({ type: 'read-state', contractVersion: 1, correlationId: 'restore-001' })
    assert.equal(result.value.state.drafts[0].text, 'Brouillon conservé')
    assert.equal(result.value.state.preferences.navigationCollapsed, true)
    assert.equal(result.value.state.activeProjectId, 'project-1')
    assert.equal(result.value.state.capabilities.codex.available, false)
    assert.deepEqual(result.value.state.conversations, [])
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('annuler le dialogue ne crée ni projet ni fichier', async () => {
  assert.ok(core)
  const dir = await mkdtemp(join(tmpdir(), 'madness-g0-test-'))
  try {
    const path = join(dir, 'snapshot.json')
    const app = new core.Application({ store: new persistence.JsonStore(path), chooseDirectory: async () => null, newId: () => 'p1', now: () => '2026-10-23T12:00:00.000Z' })
    const result = await app.execute({ contractVersion: 1, correlationId: 'cancel-001', type: 'choose-directory' })
    assert.equal(result.value.effect, 'cancelled')
    assert.equal(result.value.state.projects.length, 0)
    await assert.rejects(readFile(path), { code: 'ENOENT' })
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('stockage corrompu et schéma futur refusent une écriture et préservent les octets', async () => {
  assert.ok(persistence)
  const dir = await mkdtemp(join(tmpdir(), 'madness-g0-test-'))
  try {
    const path = join(dir, 'snapshot.json')
    for (const bytes of ['{cassé', '{"schemaVersion":999}', '{"schemaVersion":1,"projects":[]}']) {
      await writeFile(path, bytes)
      const store = new persistence.JsonStore(path)
      await assert.rejects(store.read())
      await assert.rejects(store.write(contracts.emptySnapshot()))
      assert.equal(await readFile(path, 'utf8'), bytes)
    }
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('sauvegarde échouée et portée erronée ne revendiquent aucun succès durable', async () => {
  assert.ok(core)
  let writes = 0
  const snapshot = { ...contracts.emptySnapshot(), projects: [{ id: 'p1', name: 'Essai', rootPath: 'C:\\essai', openedAt: '2026-10-23T12:00:00.000Z' }], activeProjectId: 'p1' }
  const app = new core.Application({ store: { read: async () => snapshot, write: async () => { writes++; throw Error('token=secret C:/private') } }, chooseDirectory: async () => null, newId: () => 'p2', now: () => '2026-10-23T12:00:00.000Z' })
  const bad = await app.execute({ contractVersion: 1, correlationId: 'scope-001', type: 'save-draft', projectId: 'missing', text: 'saisie' })
  assert.equal(bad.ok, false)
  assert.equal(writes, 0)
  const result = await app.execute({ contractVersion: 1, correlationId: 'draft-001', type: 'save-draft', projectId: 'p1', text: 'saisie' })
  assert.equal(result.ok, false)
  assert.equal(result.error.code, 'STORAGE_WRITE_FAILED')
  assert.equal(JSON.stringify(result).includes('secret'), false)
  assert.equal((await app.execute({ contractVersion: 1, correlationId: 'read-001', type: 'read-state' })).value.state.drafts.length, 0)
})

test('les écritures concurrentes du cœur sont cohérentes et la révision progresse', async () => {
  assert.ok(core)
  const dir = await mkdtemp(join(tmpdir(), 'madness-g0-test-'))
  try {
    const store = new persistence.JsonStore(join(dir, 'snapshot.json'))
    const app = new core.Application({ store, chooseDirectory: async () => ({ rootPath: 'C:\\essai', name: 'essai' }), newId: () => 'p1', now: () => '2026-10-23T12:00:00.000Z' })
    await app.execute({ contractVersion: 1, correlationId: 'open-001', type: 'choose-directory' })
    const results = await Promise.all([app.execute({ contractVersion: 1, correlationId: 'draft-001', type: 'save-draft', projectId: 'p1', text: 'réponse' }), app.execute({ contractVersion: 1, correlationId: 'pref-001', type: 'set-navigation', collapsed: true })])
    assert.ok(results.every((result) => result.ok))
    const saved = await store.read()
    assert.equal(saved.drafts[0].text, 'réponse')
    assert.equal(saved.preferences.navigationCollapsed, true)
    assert.equal(saved.revision, 3)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('une cible non inscriptible produit une erreur stable sans remplacer la cible', async () => {
  assert.ok(persistence)
  const dir = await mkdtemp(join(tmpdir(), 'madness-g0-test-'))
  try {
    const path = join(dir, 'snapshot.json')
    await mkdir(path)
    await assert.rejects(new persistence.JsonStore(path).write(contracts.emptySnapshot()))
    assert.equal((await stat(path)).isDirectory(), true)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('une modification externe valide est préservée au lieu d’être remplacée', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'madness-g0-test-'))
  try {
    const path = join(dir, 'snapshot.json'), store = new persistence.JsonStore(path)
    await store.read()
    const external = JSON.stringify({ ...contracts.emptySnapshot(), revision: 4 })
    await writeFile(path, external)
    await assert.rejects(store.write({ ...contracts.emptySnapshot(), revision: 1 }), { code: 'STORAGE_CONFLICT' })
    assert.equal(await readFile(path, 'utf8'), external)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('le preload valide aussi les réponses et les événements reçus', () => {
  assert.equal(typeof contracts.isReply, 'function', 'La réponse doit être validée à la frontière preload')
  const reply = { contractVersion: 1, correlationId: 'request-001', ok: true, value: { state: { ...contracts.emptySnapshot(), capabilities: { codex: { available: false, reasonKey: 'codex.unqualified' } }, lifecycle: 'idle' }, effect: 'read' } }
  assert.equal(contracts.isReply(reply), true)
  assert.equal(contracts.isReply({ ...reply, value: { ...reply.value, state: { ...reply.value.state, capabilities: { codex: { available: true } } } } }), false)
  assert.equal(contracts.isReply({ ...reply, value: { ...reply.value, effect: 'sent' } }), false)
  assert.equal(contracts.isDomainEvent({ contractVersion: 1, correlationId: 'request-001', type: 'state-changed', sequence: 0, revision: 1, context: contracts.emptyContext() }), false)
})
