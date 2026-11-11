import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { AutopilotCoordinator, isQuotaFailure } from '../src/core/autopilot.ts'
import { orderStories, parseTomlTables, readProjectPlan } from '../src/adapters/autopilot/project-plan.ts'
import { readCodexEvents } from '../src/adapters/codex/agent-turn.ts'

const stories = [{ epic: 'epic-a', epicTitle: 'A', storyId: 1, title: 'Une', built: false }, { epic: 'epic-a', epicTitle: 'A', storyId: 2, title: 'Deux', built: false }]
// The conductor's answers: by default BMad says the project is delivered.
const decided = value => ({ text: 'Analyse.\n```json\n' + JSON.stringify(value) + '\n```', sessionRef: 'd', tokens: 5 })
const delivered = () => ({ done: true, skill: '', why: 'Livré.', autonomous: true, userQuestion: null })
function harness({ tests = async () => null, turn, plan, neverBuilt = false, decide = delivered } = {}) {
  const calls = []
  const withBuilt = source => async () => { const value = await source(); return { ...value, stories: value.stories.map(story => ({ ...story, built: story.built || !neverBuilt && calls.some(call => call.text.includes('la story ' + story.storyId + ' ')) })) } }
  const coordinator = new AutopilotCoordinator({
    store: { read: async () => [], write: async () => {} }, project: async () => ({ name: 'p', rootPath: 'C:/p' }),
    runner: () => async input => { calls.push(input); if (input.skill === 'bmad' && !turn?.decisions) return decided(decide(calls)); return turn ? turn(input, calls.length) : { text: 'ok', sessionRef: 's' + calls.length, tokens: 10 } },
    skills: async () => ['bmad', 'bmad-prd', 'bmad-agent-po', 'bmad-build', 'bmad-code-review'],
    ensureInitiative: async () => {}, plan: withBuilt(plan ?? (async () => ({ requirements: calls.some(c => c.text.includes('Rédige')), architecture: calls.some(c => c.text.includes('Conçois')), epics: calls.some(c => c.skill === 'bmad-agent-po'), stories: calls.some(c => c.skill === 'bmad-agent-po') ? stories : [], initiative: 'initiative-p' }))),
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
test('go follows BMad: each chosen skill runs, new stories build before the next choice, tokens add up', async () => {
  const script = [{ skill: 'bmad-prd', agent: 'John', why: 'Écrire le PRD.', autonomous: true }, { skill: 'bmad-agent-po', agent: 'Sofia', why: 'Découper.', autonomous: true }, { done: true, skill: '', why: 'Livré.', autonomous: true }]
  const h = harness({ decide: calls => script[calls.filter(c => c.skill === 'bmad').length - 1] }); await ready(h); await h.command('start'); const run = await h.until('done')
  assert.deepEqual(h.calls.slice(1).map(c => c.skill), ['bmad', 'bmad-prd', 'bmad', 'bmad-agent-po', 'bmad-agent-dev', 'bmad-agent-dev', 'bmad'])
  assert.match(h.calls[2].text, /bmad-prd pour ceci : Écrire le PRD/)
  assert.deepEqual(run.steps.map(s => [s.kind, s.title]), [['decision', 'Madness choisit : PRD'], ['action', 'PRD'], ['decision', 'Madness choisit : Epics et stories'], ['action', 'Epics et stories'], ['story', 'Une'], ['story', 'Deux'], ['decision', 'Madness : chantier terminé']])
  assert.deepEqual(run.steps.filter(s => s.kind === 'story').map(s => [s.storyId, s.status, s.tokens]), [[1, 'done', 10], [2, 'done', 10]])
  assert.equal(run.steps[0].tokens, 5)
})
test('when BMad needs the user, the pilot hands over with the question, and resume asks again', async () => {
  let ask = true
  const h = harness({ decide: () => ask ? { skill: 'bmad-prd', agent: 'John', why: 'Choix produit.', autonomous: false, userQuestion: 'Quel public ?' } : delivered() })
  await ready(h); await h.command('start'); const run = await h.until('paused')
  assert.equal(run.pauseReason, 'guidance'); assert.equal(run.detail, 'Quel public ?'); assert.deepEqual(run.recommendation, { skill: 'bmad-prd', agent: 'John', why: 'Choix produit.', question: 'Quel public ?' })
  ask = false; await h.command('resume'); const done = await h.until('done')
  assert.equal(done.recommendation, null)
})
test('a delivered project keeps what the user should do next', async () => {
  const h = harness({ decide: () => ({ done: true, skill: 'bmad-walkthrough', agent: null, why: 'Tout est construit.', autonomous: false, userQuestion: 'Joue la recette dans ton navigateur.' }) })
  await ready(h); await h.command('start'); const run = await h.until('done')
  assert.equal(run.recommendation.question, 'Joue la recette dans ton navigateur.')
})
test('an unreadable or looping conductor pauses instead of guessing', async () => {
  const h = harness({ decide: () => ({ skill: 'bmad-inconnu', why: 'x' }) })
  await ready(h); await h.command('start'); const run = await h.until('paused')
  assert.match(run.detail, /prochaine action exploitable/); assert.equal(h.calls.filter(c => c.skill === 'bmad').length, 2)
  const loop = harness({ decide: () => ({ skill: 'bmad-code-review', why: 'Revoir.', autonomous: true }) })
  await ready(loop); await loop.command('start'); const stuck = await loop.until('paused')
  assert.match(stuck.detail, /sans que le projet avance/); assert.equal(loop.calls.filter(c => c.skill === 'bmad-code-review').length, 2)
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
  assert.equal(run.steps.filter(s => s.status === 'skipped').length, 1); assert.equal(h.calls.length, 3)
  const restored = new AutopilotCoordinator({ store: { read: async () => [{ ...run, status: 'running', pauseReason: null, recap: 'x', steps: [{ ...run.steps[0], status: 'running' }] }], write: async () => {} } })
  await restored.restore(); assert.equal(restored.read().runs[0].pauseReason, 'interrupted'); assert.equal(restored.read().runs[0].steps[0].status, 'pending')
})
test('resume retries a failed step instead of skipping it', async () => {
  let fail = true
  const h = harness({ tests: async () => fail ? { ok: false, output: 'x' } : { ok: true, output: '' }, plan: existing(stories.slice(0, 1)) })
  await ready(h); await h.command('start'); await h.until('paused'); fail = false
  await h.command('resume'); const run = await h.until('done')
  assert.equal(run.steps.at(-1).status, 'done')
})
test('a failed preparation goes back to launch with its reason, and never reports done', async () => {
  const h = harness({ turn: () => { throw Error('boom') } })
  await h.command('prepare', { provider: 'claude-code' }); const run = await h.until('stopped')
  assert.equal(run.detail, 'boom'); assert.equal(run.steps.length, 0)
})
test('a run cut off by its action limit continues in the same session', async () => {
  const h = harness({ plan: existing(stories.slice(0, 1)), turn: (i, n) => ({ text: 't', sessionRef: 's', tokens: 1, incomplete: n === 2 }) })
  await ready(h); await h.command('start'); await h.until('done')
  assert.equal(h.calls.length, 4); assert.match(h.calls[2].text, /Continue exactement/); assert.equal(h.calls[2].sessionRef, 's')
})
test('a story not marked built is sent back, then pauses', async () => {
  const h = harness({ neverBuilt: true, plan: existing(stories.slice(0, 1)), tests: async () => ({ ok: true, output: '' }) })
  await ready(h); await h.command('start'); const run = await h.until('paused')
  assert.match(run.detail, /marquée construite/); assert.equal(h.calls.length, 4)
})
test('stop during a turn cannot be overwritten, and no second run starts meanwhile', async () => {
  let release; const gate = new Promise(r => { release = r })
  const h = harness({ plan: existing(stories.slice(0, 1)), turn: async (i, n) => { if (n > 1) await gate; return { text: 't', sessionRef: 's', tokens: 1 } } })
  await ready(h); await h.command('start')
  for (let i = 0; i < 100 && h.calls.length < 2; i++) await new Promise(r => setTimeout(r, 2))
  await h.command('stop'); await h.command('resume')
  assert.equal(h.coordinator.read().runs[0].status, 'stopped'); assert.equal(h.calls.length, 2)
  release(); await new Promise(r => setTimeout(r, 20))
  assert.equal(h.coordinator.read().runs[0].status, 'stopped'); assert.equal(h.coordinator.read().runs[0].steps.at(-1).status, 'pending')
})
test('an open conversation holds the go button', async () => {
  const h = harness({ plan: existing(stories.slice(0, 1)) }); h.coordinator.deps.canRun = () => false
  await ready(h); await h.command('start')
  assert.equal(h.coordinator.read().runs[0].status, 'ready'); assert.match(h.coordinator.read().runs[0].detail, /conversation/)
})
test('quota wording and story order', () => {
  assert.equal(isQuotaFailure('You have hit your usage limit'), true); assert.equal(isQuotaFailure('syntax error'), false)
  assert.deepEqual(orderStories([{ id: 2, after: [1] }, { id: 3, after: [] }, { id: 1, after: [3] }]), [3, 1, 2])
  const out = ['noise', JSON.stringify({ type: 'thread.started', thread_id: 't1' }), JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'fini' } }), JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 100, cached_input_tokens: 40, output_tokens: 5 } })].join('\n')
  assert.deepEqual(readCodexEvents(out), { text: 'fini', threadId: 't1', tokens: 65, failure: null })
})
test('the plan is read from BMad tickets and built plans', async t => {
  const root = await mkdtemp(join(tmpdir(), 'madness-plan-')); t.after(() => rm(root, { recursive: true, force: true }))
  const init = join(root, '_bmad-output/initiative-x'), epic = join(init, 'tickets/epic-a/tickets')
  await mkdir(epic, { recursive: true }); await mkdir(join(root, '_bmad-output/architecture-x')); await writeFile(join(root, '_bmad-output/architecture-x/architecture-x.md'), '# A'); await mkdir(join(root, '_bmad/custom'), { recursive: true })
  await writeFile(join(root, '_bmad/custom/config.user.toml'), '[core]\nactive_initiative = "initiative-x"\n')
  await writeFile(join(init, 'initiative-x.md'), '---\ntype: initiative\n---\n\n## R1\n')
  await writeFile(join(init, 'tickets/tickets.toml'), '[[epic]]\nid = 1\nslug = "epic-a"\ntitle = "Epic A"\n')
  await writeFile(join(epic, 'tickets.toml'), '[[entry]]\nid = 1\ntitle = "Une"\nafter = []\n\n[[entry]]\nid = 2\ntitle = "Deux"\nafter = [1]\n')
  await writeFile(join(epic, 'story-une-plan.md'), "---\nticket: '1'\nstatus: 'built'\n---\n")
  assert.equal(parseTomlTables('[[a]]\nx = 1\n[[b]]\ny = 2\n', 'a').length, 1)
  assert.deepEqual(await readProjectPlan(root), { requirements: true, architecture: true, epics: true, initiative: 'initiative-x', stories: [{ epic: 'epic-a', epicTitle: 'Epic A', storyId: 1, title: 'Une', built: true }, { epic: 'epic-a', epicTitle: 'Epic A', storyId: 2, title: 'Deux', built: false }] })
})
test('every turn is counted under the initiative: decisions apart, a direct build shared between the stories it built', async () => {
  const usage = []; let built = false
  const script = [{ skill: 'bmad-build', agent: 'Amelia', why: 'Construire directement.', autonomous: true }, delivered()]
  const h = harness({ decide: calls => script[calls.filter(c => c.skill === 'bmad').length - 1], plan: async () => ({ requirements: false, architecture: false, epics: built, stories: built ? stories.map(s => ({ ...s, built: true })) : [], initiative: 'initiative-p' }),
    turn: input => { if (input.skill === 'bmad-build') built = true; return { text: 'ok', sessionRef: 's', tokens: 11 } } })
  h.coordinator.deps.usage = entries => usage.push(...entries)
  h.coordinator.deps.runner = () => async input => { h.calls.push(input); if (input.skill === 'bmad') return { text: '```json\n' + JSON.stringify(script[h.calls.filter(c => c.skill === 'bmad').length - 1]) + '\n```', sessionRef: 'd', tokens: 5 }; if (input.skill === 'bmad-build') built = true; return { text: 'ok', sessionRef: 's', tokens: 11 } }
  await ready(h); await h.command('start'); await h.until('done')
  assert.ok(usage.every(e => e.initiative === 'initiative-p' && e.projectId === 'p1'))
  assert.deepEqual(usage.filter(e => e.kind === 'story').map(e => [e.storyId, e.tokens]), [[1, 6], [2, 5]])
  assert.equal(usage.filter(e => e.kind === 'decision').reduce((sum, e) => sum + e.tokens, 0), 11 + 5 + 5)
})
