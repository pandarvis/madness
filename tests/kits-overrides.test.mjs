import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parse } from 'smol-toml'
import { applyManagedBlock, removeManagedBlock } from '../src/adapters/kits/overrides.ts'

const entries = { table: 'agent', persistent_facts: ['file:{project-root}/_bmad/kits/acme/g.md'], principles: ['Aucune couleur en dur.'], review_guidance: [] }
test('a missing file gets a whole managed block', () => {
  const text = applyManagedBlock('', entries)
  assert.deepEqual(JSON.parse(JSON.stringify(parse(text).agent)), { persistent_facts: ['file:{project-root}/_bmad/kits/acme/g.md'], principles: ['Aucune couleur en dur.'] })
  assert.equal(removeManagedBlock(text), '')
})
test('hand-written settings stay untouched, and removal restores the file byte for byte', () => {
  const manual = '# Réglage de l’équipe\n[agent]\nicon = "🧭"\n\n[other]\nx = 1\n'
  const text = applyManagedBlock(manual, entries)
  assert.equal(parse(text).agent.icon, '🧭'); assert.deepEqual(parse(text).agent.principles, ['Aucune couleur en dur.'])
  assert.equal(removeManagedBlock(text), manual)
  assert.equal(applyManagedBlock(text, entries), applyManagedBlock(manual, entries))
})
test('a key already set by hand is refused, never overwritten', () => {
  assert.throws(() => applyManagedBlock('[agent]\nprinciples = ["Le nôtre"]\n', entries), /KIT_OVERRIDE_CONFLICT: principles/)
})
test('empty entries remove the block', () => {
  const text = applyManagedBlock('', entries)
  assert.equal(applyManagedBlock(text, { table: 'agent', persistent_facts: [], principles: [], review_guidance: [] }), '')
})
