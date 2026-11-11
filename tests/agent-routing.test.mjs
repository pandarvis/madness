import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agentForStage } from '../src/renderer/src/agent-routing.ts'

const steps = done => ['brief', 'requirements', 'ux', 'architecture', 'epics', 'stories'].map((id, index) => ({ id, done: index < done }))

test('the agent owning the first unfinished step answers', () => {
  assert.equal(agentForStage(null), 'bmad-agent-analyst')
  assert.equal(agentForStage(steps(0)), 'bmad-agent-analyst')
  assert.equal(agentForStage(steps(1)), 'bmad-agent-pm')
  assert.equal(agentForStage(steps(2)), 'bmad-agent-ux-designer')
  assert.equal(agentForStage(steps(3)), 'bmad-agent-architect')
  assert.equal(agentForStage(steps(4)), 'bmad-agent-po')
  assert.equal(agentForStage(steps(5)), 'bmad-agent-dev')
})

test('a finished project goes to the developer, a skipped step is still owed', () => {
  assert.equal(agentForStage(steps(6)), 'bmad-agent-dev')
  const skipped = steps(6).map(step => step.id === 'ux' ? { ...step, done: false } : step)
  assert.equal(agentForStage(skipped), 'bmad-agent-ux-designer')
})
