import assert from 'node:assert/strict'
import { test } from 'node:test'
import { summarizeUsage, splitAcross } from '../src/core/usage.ts'

const at = '2026-11-11T10:00:00.000Z'
test('usage adds up per initiative, per epic and story, with decisions and conversations apart', () => {
  const entries = [
    { projectId: 'p', initiative: 'initiative-a', kind: 'decision', at, tokens: 100, ms: 10, title: 'x' },
    { projectId: 'p', initiative: 'initiative-a', kind: 'story', at, tokens: 50, ms: 5, epic: 'e1', epicTitle: 'Liste', storyId: 2, title: 'Supprimer' },
    { projectId: 'p', initiative: 'initiative-a', kind: 'story', at, tokens: 30, ms: 3, epic: 'e1', epicTitle: 'Liste', storyId: 1, title: 'Ajouter' },
    { projectId: 'p', initiative: 'initiative-a', kind: 'story', at, tokens: 20, ms: 2, epic: 'e1', epicTitle: 'Liste', storyId: 1, title: 'Ajouter' },
    { projectId: 'p', initiative: 'initiative-a', kind: 'conversation', at, tokens: 7, ms: 1, title: 'John' },
    { projectId: 'p', initiative: 'initiative-b', kind: 'action', at, tokens: 9, ms: 9, title: 'PRD' },
    { projectId: 'other', initiative: 'initiative-a', kind: 'decision', at, tokens: 999, ms: 999, title: 'x' },
  ]
  const [a, b] = summarizeUsage(entries, 'p')
  assert.equal(a.initiative, 'initiative-a'); assert.equal(a.tokens, 207); assert.equal(a.ms, 21)
  assert.deepEqual(a.epics, [{ epic: 'e1', label: 'Liste', tokens: 100, ms: 10, stories: [{ storyId: 1, label: 'Ajouter', tokens: 50, ms: 5 }, { storyId: 2, label: 'Supprimer', tokens: 50, ms: 5 }] }])
  assert.deepEqual(a.other, [{ label: 'Décisions de Madness', tokens: 100, ms: 10 }, { label: 'Conversations avec les agents', tokens: 7, ms: 1 }])
  assert.deepEqual(b.other, [{ label: 'Autres actions BMad', tokens: 9, ms: 9 }])
})

test('an action that built several stories is shared between them without losing a token', () => {
  const parts = splitAcross({ projectId: 'p', initiative: 'i', kind: 'action', at, tokens: 101, ms: 10, title: 'Construction' }, [{ epic: 'e', epicTitle: 'E', storyId: 1, title: 'Un' }, { epic: 'e', epicTitle: 'E', storyId: 2, title: 'Deux' }])
  assert.deepEqual(parts.map(p => [p.kind, p.storyId, p.tokens, p.ms]), [['story', 1, 51, 5], ['story', 2, 50, 5]])
  assert.equal(splitAcross({ projectId: 'p', initiative: 'i', kind: 'action', at, tokens: 3, ms: 1, title: 'PRD' }, [])[0].kind, 'action')
})
