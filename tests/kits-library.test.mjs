import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { KitSources, scanSource } from '../src/adapters/kits/library.ts'
import { draftManifest } from '../src/adapters/kits/draft.ts'
import { parseKitManifest } from '../src/core/kits/manifest.ts'

test('a source lists its kits (root or kits/*), with errors for broken ones', async t => {
  const base = await mkdtemp(join(tmpdir(), 'madness-src-')); t.after(() => rm(base, { recursive: true, force: true }))
  await mkdir(join(base, 'kits', 'ok'), { recursive: true }); await mkdir(join(base, 'kits', 'casse'), { recursive: true })
  await writeFile(join(base, 'kits', 'ok', 'madness-kit.toml'), '[kit]\nid = "ok"\nname = "OK"\nversion = "1.0.0"\n')
  await writeFile(join(base, 'kits', 'casse', 'madness-kit.toml'), '[kit]\nid = "casse"\n')
  const found = await scanSource(base)
  assert.deepEqual(found.map(k => [k.folder.split(/[\\/]/).at(-1), k.ok]), [['casse', false], ['ok', true]])
  const sources = new KitSources(join(base, 'sources.json'))
  await sources.add(base); await sources.add(base)
  assert.deepEqual(await sources.list(), [base]); await sources.remove(base); assert.deepEqual(await sources.list(), [])
})

test('a folder becomes a valid draft manifest, classified by file names', async t => {
  const base = await mkdtemp(join(tmpdir(), 'madness-draft-')); t.after(() => rm(base, { recursive: true, force: true }))
  await mkdir(join(base, 'charte')); await writeFile(join(base, 'charte', 'couleurs.md'), '#'); await writeFile(join(base, 'charte', 'tokens.json'), '{}')
  await mkdir(join(base, 'skills', 'creer-composant'), { recursive: true }); await writeFile(join(base, 'skills', 'creer-composant', 'SKILL.md'), '#')
  await writeFile(join(base, 'Glossaire métier.md'), '#'); await writeFile(join(base, 'conventions-dotnet.md'), '#'); await writeFile(join(base, 'notes.md'), '#'); await writeFile(join(base, 'logo.png'), '')
  const result = parseKitManifest(await draftManifest(base, 'Socle Acme'))
  assert.equal(result.ok, true)
  assert.equal(result.kit.id, 'socle-acme')
  assert.deepEqual(result.kit.pieces.map(p => [p.kind, p.path, p.level, p.for.join(' ')]), [
    ['docs', 'charte/*', 'impose', 'ux dev review'],
    ['docs', 'conventions-dotnet.md', 'impose', 'dev review'],
    ['glossary', 'Glossaire métier.md', 'impose', 'all'],
    ['docs', 'notes.md', 'consulte', 'all'],
    ['skill', 'skills/creer-composant', 'consulte', 'dev'],
  ])
})
