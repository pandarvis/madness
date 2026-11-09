import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { AutopilotCoordinator, isQuotaFailure } from '../src/core/autopilot.ts'
import { orderStories, parseTomlTables, readProjectPlan } from '../src/adapters/autopilot/project-plan.ts'

const stories = [{ epic: 'epic-a', epicTitle: 'A', storyId: 1, title: 'Une', built: false }, { epic: 'epic-a', epicTitle: 'A', storyId: 2, title: 'Deux', built: false }]
function harness({ tests = async () => null, turn, plan } = {}) {
  const calls = []
  const coordinator = new AutopilotCoordinator({
    store: { read: async () => [], write: async () => {} }, project: async () => ({ name: 'p', rootPath: 'C:/p' }),
    runner: () => async input => { calls.push(input); return turn ? turn(input, calls.length) : { text: 'ok', sessionRef: 's' + calls.length, tokens: 10 } },
    ensureInitiative: async () => {}, plan: plan ?? (async () => ({ requirements: calls.some(c => c.text.includes('Rédige')), architecture: calls.some(c => c.text.includes('Conçois')), epics: calls.some(c => c.text.includes('Découpe')), stories: calls.some(c => c.text.includes('Découpe')) ? stories : [], initiative: 'initiative-p' })),
    tests, now: () => new Date('2026-11-09T10:00:00Z') })
  const command = (type, extra = {}) => coordinator.execute({ contractVersion: 1, correlationId: 'c-' + Math.random().toString(16).slice(2), type, projectId: 'p1', ...extra })
  const until = async status => { for (let i = 0; i < 500; i++) { const run = coordinator.read().runs[0]; if (run?.status === status) return run; await new Promise(r => setTimeout(r, 2)) } assert.fail('never reached ' + status + ': ' + coordinator.read().runs[0]?.status + ' ' + coordinator.read().runs[0]?.detail) }
  return { coordinator, calls, command, until }
}
const ready = async h => { await h.command('prepare', { provider: 'claude-code' }); return h.until('ready') }
const existing = list => async () => ({ requirements: true, architecture: true, epics: true, stories: list, initiative: 'i' })

test('recap comes first and nothing is built before go', async () => {
  const h = harness(); const run = await ready(h)
  assert.equal(run.recap, 'ok'); assert.equal(h.calls.length, 1); assert.equal(h.calls[0].skill, 'bmad-agent-analyst')
})
test('go runs every phase then each story, and sums tokens', async () => {
  const h = harness(); await ready(h); await h.command('start'); const run = await h.until('done')
  assert.deepEqual(h.calls.slice(1).map(c => c.skill), ['bmad-agent-po', 'bmad-agent-ux-designer', 'bmad-agent-architect', 'bmad-agent-po', 'bmad-agent-dev', 'bmad-agent-dev'])
  assert.deepEqual(run.steps.filter(s => s.kind === 'story').map(s => [s.storyId, s.status, s.tokens]), [[1, 'done', 10], [2, 'done', 10]])
})
test('a phase that produced nothing pauses instead of counting as done', async () => {
  const h = harness({ plan: async () => ({ requirements: false, architecture: false, epics: false, stories: [], initiative: 'i' }) })
  await ready(h); await h.command('start'); const run = await h.until('paused')
  assert.equal(run.pauseReason, 'failure'); assert.match(run.detail, /Exigences/); assert.equal(run.steps[0].status, 'failed')
})
test('red tests go back to the same session, and pause after three attempts', async () => {
  const h = harness({ tests: async () => ({ ok: false, output: 'boom' }), plan: existing(stories.slice(0, 1)) })
  await ready(h); await h.command('start'); const run = await h.until('paused')
  assert.equal(run.pauseReason, 'tests'); assert.equal(h.calls.length, 4); assert.equal(h.calls[3].sessionRef, 's3'); assert.match(h.calls[2].text, /boom/)
})
test('a subscription limit pauses and plans a resume; stop cancels it', async () => {
  const h = harness({ turn: (i, n) => { if (n > 1) throw Error('Claude usage limit reached'); return { text: 'r', sessionRef: 's', tokens: 1 } }, plan: existing(stories.slice(0, 1)) })
  await ready(h); await h.command('start'); const run = await h.until('paused')
  assert.equal(run.pauseReason, 'quota'); assert.equal(run.resumeAt, '2026-11-09T10:30:00.000Z'); assert.equal(run.steps.at(-1).status, 'pending')
  await h.command('stop'); assert.equal(h.coordinator.read().runs[0].status, 'stopped')
})
test('existing work is skipped, and an interrupted run comes back paused', async () => {
  const h = harness({ plan: existing([{ ...stories[0], built: true }, stories[1]]) })
  await ready(h); await h.command('start'); const run = await h.until('done')
  assert.equal(run.steps.filter(s => s.status === 'skipped').length, 5); assert.equal(h.calls.length, 2)
  const restored = new AutopilotCoordinator({ store: { read: async () => [{ ...run, status: 'running', pauseReason: null, recap: 'x', steps: [{ ...run.steps[0], status: 'running' }] }], write: async () => {} } })
  await restored.restore(); assert.equal(restored.read().runs[0].pauseReason, 'interrupted'); assert.equal(restored.read().runs[0].steps[0].status, 'pending')
})
test('quota wording and story order', () => {
  assert.equal(isQuotaFailure('You have hit your usage limit'), true); assert.equal(isQuotaFailure('syntax error'), false)
  assert.deepEqual(orderStories([{ id: 2, after: [1] }, { id: 3, after: [] }, { id: 1, after: [3] }]), [3, 1, 2])
})
test('the plan is read from BMad tickets and built plans', async t => {
  const root = await mkdtemp(join(tmpdir(), 'madness-plan-')); t.after(() => rm(root, { recursive: true, force: true }))
  const init = join(root, '_bmad-output/initiative-x'), epic = join(init, 'tickets/epic-a/tickets')
  await mkdir(epic, { recursive: true }); await mkdir(join(root, '_bmad-output/architecture-x')); await mkdir(join(root, '_bmad/custom'), { recursive: true })
  await writeFile(join(root, '_bmad/custom/config.user.toml'), '[core]\nactive_initiative = "initiative-x"\n')
  await writeFile(join(init, 'initiative-x.md'), '---\ntype: initiative\n---\n\n## R1\n')
  await writeFile(join(init, 'tickets/tickets.toml'), '[[epic]]\nid = 1\nslug = "epic-a"\ntitle = "Epic A"\n')
  await writeFile(join(epic, 'tickets.toml'), '[[entry]]\nid = 1\ntitle = "Une"\nafter = []\n\n[[entry]]\nid = 2\ntitle = "Deux"\nafter = [1]\n')
  await writeFile(join(epic, 'story-une-plan.md'), "---\nticket: '1'\nstatus: 'built'\n---\n")
  assert.equal(parseTomlTables('[[a]]\nx = 1\n[[b]]\ny = 2\n', 'a').length, 1)
  assert.deepEqual(await readProjectPlan(root), { requirements: true, architecture: true, epics: true, initiative: 'initiative-x', stories: [{ epic: 'epic-a', epicTitle: 'Epic A', storyId: 1, title: 'Une', built: true }, { epic: 'epic-a', epicTitle: 'Epic A', storyId: 2, title: 'Deux', built: false }] })
})
