import assert from 'node:assert/strict'
import { test } from 'node:test'
import { leadingPersona, soberText } from '../src/renderer/src/sober-text.ts'

test('status emojis become plain signs', () => {
  assert.equal(soberText('Brief prêt ✅'), 'Brief prêt ✓')
  assert.equal(soberText('❌ Échec'), '✗ Échec')
  assert.equal(soberText('⚠️ Attention'), '⚠︎ Attention')
  assert.equal(soberText('Étape 1️⃣ puis 2️⃣'), 'Étape 1. puis 2.')
  assert.equal(soberText('🟢 en ligne'), '● en ligne')
})

test('decorative emojis disappear without leaving stray spaces', () => {
  assert.equal(soberText('🧪 Murat, testeur'), 'Murat, testeur')
  assert.equal(soberText('Bonjour Kévin 👋 !'), 'Bonjour Kévin !')
  assert.equal(soberText('On y va 🚀'), 'On y va')
  assert.equal(soberText('Équipe 👩🏽‍💻 prête'), 'Équipe prête')
  assert.equal(soberText('🔥\nObjectif'), '\nObjectif')
  assert.equal(soberText('Drapeau 🇫🇷 ici'), 'Drapeau ici')
})

test('ordinary text and text-like symbols stay untouched', () => {
  assert.equal(soberText('Version 2.1 © 2026 → suite, 3 * 4 # 1'), 'Version 2.1 © 2026 → suite, 3 * 4 # 1')
  assert.equal(soberText('- **gras** et `code`'), '- **gras** et `code`')
})

test('BMad persona emojis become markers for Madness glyphs', () => {
  assert.equal(soberText('📊 Mary et 🏗️ Winston'), 'analyst Mary et architect Winston')
  assert.equal(leadingPersona('📊 Bonjour'), 'analyst')
  assert.equal(leadingPersona('  ⚒️ Forge'), 'toolsmith')
  assert.equal(leadingPersona('Bonjour 📊'), null)
  assert.equal(leadingPersona('🚀 Go'), null)
})
