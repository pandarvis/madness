import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LifecycleCoordinator } from '../src/core/lifecycle.ts'
import { emptyContext, emptySnapshot } from '../src/contracts/index.ts'
import { Application } from '../src/core/application.ts'

test('le coordinateur ne démarre rien et clôt uniquement les opérations enregistrées', async () => {
  const coordinator = new LifecycleCoordinator()
  assert.deepEqual(await coordinator.shutdown(), [])
  assert.equal(coordinator.state, 'closing')
  assert.throws(() => coordinator.register({ id: 'late', context: emptyContext(), stop: async () => 'stopped' }))
  const active = new LifecycleCoordinator()
  let stops = 0
  active.register({ id: 'one', context: emptyContext(), stop: async () => { stops++; return 'stopped' } })
  active.register({ id: 'two', context: emptyContext(), stop: async () => { throw Error('secret') } })
  active.register({ id: 'done', context: emptyContext(), stop: async () => { throw Error('ne doit pas être appelé') } })
  active.complete('done')
  assert.throws(() => active.register({ id: 'one', context: emptyContext(), stop: async () => 'stopped' }))
  const outcomes = await active.shutdown()
  assert.equal(stops, 1)
  assert.deepEqual(outcomes.map((result) => [result.id, result.outcome]), [['one', 'stopped'], ['two', 'unknown']])
  assert.equal(JSON.stringify(outcomes).includes('secret'), false)
})

test('restaurer une activité la rend historique et ne lance aucun connecteur', async () => {
  const snapshot = { ...emptySnapshot(), projects: [{ id: 'p1', rootPath: 'C:\\essai', name: 'essai', openedAt: '2026-10-23T12:00:00.000Z' }], activeProjectId: 'p1', conversations: [{ id: 'c1', context: { ...emptyContext(), projectId: 'p1', conversationId: 'c1', providerId: 'codex', connectionId: 'connection-1' }, lastKnownActivity: 'waiting', messages: [] }] }
  const app = new Application({ store: { read: async () => snapshot, write: async () => { throw Error('La lecture ne doit pas écrire') } }, chooseDirectory: async () => { throw Error('La lecture ne doit pas ouvrir le dialogue') }, newId: () => 'new', now: () => '2026-10-23T12:00:00.000Z' })
  const restored = await app.execute({ type: 'read-state', contractVersion: 1, correlationId: 'restore-001' })
  assert.equal(restored.value.state.conversations[0].lastKnownActivity, 'unknown')
  assert.equal(restored.value.state.capabilities.codex.available, false)
  await app.shutdown()
  const after = await app.execute({ type: 'read-state', contractVersion: 1, correlationId: 'after-close' })
  assert.equal(after.error.code, 'APP_CLOSING')
})
