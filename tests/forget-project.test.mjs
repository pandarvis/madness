import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Application } from '../src/core/application.ts'
import { emptySnapshot, isCommand } from '../src/contracts/index.ts'

test('forgetting a project drops it, its drafts and conversations, and nothing else', async () => {
  let snapshot = emptySnapshot(), counter = 0
  const folders = ['C:\\a', 'C:\\b']
  const application = new Application({ store: { read: async () => structuredClone(snapshot), write: async s => { snapshot = structuredClone(s) } }, newId: () => 'project-' + ++counter, now: () => '2026-11-11T12:00:00.000Z', chooseDirectory: async () => { const rootPath = folders.shift(); return { rootPath, name: rootPath.slice(3) } } })
  const command = (type, extra = {}) => application.execute({ contractVersion: 1, correlationId: 'corr-' + Math.random().toString(16).slice(2, 10), type, ...extra })
  await command('choose-directory'); await command('choose-directory')
  await command('save-draft', { projectId: 'project-1', text: 'brouillon' })
  assert.equal(isCommand({ contractVersion: 1, correlationId: 'corr-12345678', type: 'forget-project', projectId: 'project-1' }), true)
  const reply = await command('forget-project', { projectId: 'project-1' })
  assert.equal(reply.ok, true)
  assert.deepEqual(snapshot.projects.map(p => p.id), ['project-2'])
  assert.deepEqual(snapshot.drafts, [])
  assert.equal(snapshot.activeProjectId, 'project-2')
  const missing = await command('forget-project', { projectId: 'project-1' })
  assert.equal(missing.ok, false)
})
