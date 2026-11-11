import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseKitManifest } from '../src/core/kits/manifest.ts'
import { skillsFor } from '../src/core/kits/roles.ts'

const VALID = `
[kit]
id = "acme-socle"
name = "Socle Acme"
version = "1.4.0"
format = 1
[[piece]]
kind = "docs"
title = "Charte"
path = "charte/*.md"
level = "impose"
for = ["ux", "dev", "review"]
[[piece]]
kind = "glossary"
title = "Vocabulaire"
path = "glossaire.md"
for = ["all"]
[[rule]]
id = "palette"
text = "Aucune couleur en dur."
level = "impose"
for = ["ux", "dev"]
[[piece]]
kind = "mcp"
name = "acme-design"
command = "npx"
for = ["dev"]
`
test('a valid manifest is read with defaults, later-step pieces are kept but flagged', () => {
  const result = parseKitManifest(VALID)
  assert.equal(result.ok, true)
  assert.equal(result.kit.id, 'acme-socle')
  assert.equal(result.kit.pieces[1].level, 'consulte')
  assert.deepEqual(result.kit.rules[0], { id: 'palette', text: 'Aucune couleur en dur.', level: 'impose', for: ['ux', 'dev'] })
  assert.deepEqual(result.notices, ['La pièce « acme-design » (mcp) sera prise en charge dans une prochaine version de Madness.'])
})
test('invalid manifests explain every problem', () => {
  const result = parseKitManifest('[kit]\nid = "Bad Id"\nversion = "x"\nformat = 2\n[[piece]]\nkind = "docs"\npath = "../secret.md"\nfor = ["chef"]\n')
  assert.equal(result.ok, false)
  assert.deepEqual(result.errors, [
    'kit.id doit être en minuscules, chiffres et tirets.',
    'kit.name est obligatoire.',
    'kit.version doit être une version sémantique (1.4.0).',
    'format 2 inconnu : cette version de Madness lit le format 1.',
    'pièce 1 : le chemin « ../secret.md » sort du kit.',
    'pièce 1 : rôle « chef » inconnu (analyst, pm, ux, architect, po, dev, review, all).',
  ])
  assert.equal(parseKitManifest('pas = du = toml').ok, false)
})
test('roles map to BMad skills', () => {
  assert.deepEqual(skillsFor(['ux']), ['bmad-agent-ux-designer', 'bmad-ux'])
  assert.ok(skillsFor(['all']).includes('bmad-party-mode'))
})
