import assert from 'node:assert/strict'
import { test } from 'node:test'
import { onlyMadnessBlock } from '../src/adapters/bmad/profile.ts'

test('a Mary override is accepted only when Madness wrote all of it', () => {
  const block = '# madness:kits:begin — écrit par Madness, ne pas modifier\n[agent]\npersistent_facts = [\n  "x",\n]\n# madness:kits:end\n'
  assert.equal(onlyMadnessBlock(block), true)
  assert.equal(onlyMadnessBlock('# note\n\n' + block), true)
  assert.equal(onlyMadnessBlock('[agent]\nicon = "x"\n' + block), false)
  assert.equal(onlyMadnessBlock('[agent]\nicon = "x"\n'), false)
  assert.equal(onlyMadnessBlock('# madness:kits:begin\n[agent]\n'), false)
})
