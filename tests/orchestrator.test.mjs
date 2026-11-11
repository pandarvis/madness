import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decisionPrompt, parseDecision, actionLabel, changesCode } from '../src/core/orchestrator.ts'

const skills = ['bmad', 'bmad-build', 'bmad-prd', 'bmad-code-review', 'bmad-customize', 'bmod-method']

test('a fenced JSON decision is read and checked against installed skills', () => {
  const reply = 'Analyse faite.\n```json\n{"skill":"bmad-build","agent":"Amelia","why":"Corriger le bug.","autonomous":true,"userQuestion":null}\n```'
  assert.deepEqual(parseDecision(reply, skills), { done: false, skill: 'bmad-build', agent: 'Amelia', why: 'Corriger le bug.', autonomous: true, question: null })
})

test('a decision that needs the user keeps its question', () => {
  const decision = parseDecision('{"skill":"bmad-prd","agent":"John","why":"Choix produit.","autonomous":false,"userQuestion":"Quel public vises-tu ?"}', skills)
  assert.equal(decision?.autonomous, false)
  assert.equal(decision?.question, 'Quel public vises-tu ?')
})

test('unknown, maintenance or missing skills are refused unless the project is done', () => {
  assert.equal(parseDecision('```json\n{"skill":"bmad-unknown","why":"x","autonomous":true}\n```', skills), null)
  assert.equal(parseDecision('```json\n{"skill":"bmad-customize","why":"x","autonomous":true}\n```', skills), null)
  assert.equal(parseDecision('pas de json', skills), null)
  assert.deepEqual(parseDecision('```json\n{"done":true,"skill":"","why":"Livré.","autonomous":false,"userQuestion":"Fais la recette."}\n```', skills), { done: true, skill: '', agent: null, why: 'Livré.', autonomous: false, question: 'Fais la recette.' })
})

test('the last valid block wins over a quoted example', () => {
  const reply = 'Format : ```json\n{"skill":"bmad-…"}\n```\nDécision :\n```json\n{"skill":"bmad-code-review","why":"Revoir.","autonomous":true}\n```'
  assert.equal(parseDecision(reply, skills)?.skill, 'bmad-code-review')
})

test('the prompt lists only choosable skills and what was done', () => {
  const prompt = decisionPrompt(skills, ['Construction : story 1'])
  assert.match(prompt, /bmad-build, bmad-prd, bmad-code-review\./)
  assert.doesNotMatch(prompt, /bmad-customize|bmod-method/)
  assert.match(prompt, /- Construction : story 1/)
  assert.equal(actionLabel('bmad-prd'), 'PRD')
  assert.equal(changesCode('bmad-build'), true)
  assert.equal(changesCode('bmad-prd'), false)
})

test('imposed kit rules reach the conductor', () => {
  const prompt = decisionPrompt(['bmad-build'], [], ['Aucune couleur en dur. (kit Acme)'])
  assert.match(prompt, /Règles imposées par les kits du projet[^\n]*\n- Aucune couleur en dur\. \(kit Acme\)/)
  assert.match(prompt, /conformité/)
  assert.doesNotMatch(decisionPrompt(['bmad-build'], []), /Règles imposées/)
})
