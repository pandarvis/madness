import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { JsonStore } from '../src/adapters/persistence/json-store.ts'
import { emptySnapshot } from '../src/contracts/index.ts'

function snapshot(text) {
  const timestamp = '2026-10-23T12:00:00.000Z'
  return { ...emptySnapshot(), projects: [{ id: 'p1', name: 'Essai', rootPath: 'C:\\essai', openedAt: timestamp }], activeProjectId: 'p1', drafts: [{ projectId: 'p1', text, savedAt: timestamp }] }
}

test('le JSON contenant des octets UTF-8 invalides est refusé sans remplacement', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'madness-utf8-test-'))
  try {
    const path = join(directory, 'snapshot.json')
    const [before, after] = JSON.stringify(snapshot('__INVALID__')).split('__INVALID__')
    for (const invalid of [Buffer.from([0x80]), Buffer.from([0xc0, 0xaf]), Buffer.from([0xe2, 0x82])]) {
      const original = Buffer.concat([Buffer.from(before), invalid, Buffer.from(after)])
      await writeFile(path, original)
      await assert.rejects(new JsonStore(path).read(), { code: 'STORAGE_CORRUPT' })
      await assert.rejects(new JsonStore(path).write(snapshot('Nouveau brouillon')), { code: 'STORAGE_CORRUPT' })
      assert.deepEqual(await readFile(path), original)
    }
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test('un caractère U+FFFD encodé correctement reste un brouillon valide', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'madness-utf8-test-'))
  try {
    const path = join(directory, 'snapshot.json'), store = new JsonStore(path)
    await writeFile(path, JSON.stringify(snapshot('Texte \uFFFD valide')), 'utf8')
    const restored = await store.read()
    assert.equal(restored.drafts[0].text, 'Texte \uFFFD valide')
    await store.write({ ...restored, revision: 1 })
    assert.equal((await new JsonStore(path).read()).drafts[0].text, 'Texte \uFFFD valide')
    assert.equal((await readFile(path)).includes(Buffer.from([0xef, 0xbf, 0xbd])), true)
  } finally { await rm(directory, { recursive: true, force: true }) }
})
