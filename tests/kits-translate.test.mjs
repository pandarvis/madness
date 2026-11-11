import assert from 'node:assert/strict'
import { test } from 'node:test'
import { translateKits } from '../src/core/kits/translate.ts'

const kit = { id: 'acme', name: 'Acme', version: '1.0.0', description: '', pieces: [
  { kind: 'docs', title: 'Charte', path: 'charte/*.md', level: 'impose', for: ['ux', 'review'], source: null, name: null },
  { kind: 'glossary', title: 'Vocabulaire', path: 'glossaire.md', level: 'consulte', for: ['ux'], source: null, name: null },
  { kind: 'mcp', title: 'MCP', path: null, level: 'consulte', for: ['ux'], source: null, name: 'x' }],
  rules: [{ id: 'palette', text: 'Aucune couleur en dur.', level: 'impose', for: ['ux'] }] }
const tables = { 'bmad-agent-ux-designer': 'agent', 'bmad-ux': 'workflow', 'bmad-review': 'workflow', 'bmad-code-review': 'workflow' }

test('each target skill gets facts, agents get principles, bmad-review gets guidance', () => {
  const out = translateKits([kit], tables)
  assert.deepEqual(out['bmad-agent-ux-designer'], { table: 'agent',
    persistent_facts: ['file:{project-root}/_bmad/kits/acme/charte/*.md', 'file:{project-root}/_bmad/kits/acme/glossaire.md', 'OBLIGATOIRE (kit Acme) : Aucune couleur en dur.'],
    principles: ['Respecter obligatoirement « Charte » du kit Acme.', 'Aucune couleur en dur.'], review_guidance: [] })
  assert.deepEqual(out['bmad-review'].review_guidance, ['file:{project-root}/_bmad/kits/acme/charte/*.md'])
  assert.equal(out['bmad-agent-dev'], undefined)
})
test('skills that are not installed get nothing', () => {
  assert.deepEqual(Object.keys(translateKits([kit], { 'bmad-ux': 'workflow' })), ['bmad-ux'])
})
