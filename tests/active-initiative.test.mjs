import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createInitiative, initiativeFolderName, withActiveInitiative, writeActiveInitiative } from '../src/adapters/bmad/active-initiative.ts'

test('active_initiative is added under core and keeps the other settings', () => {
  assert.equal(withActiveInitiative('', 'initiative-a'), '[core]\nactive_initiative = "initiative-a"\n')
  assert.equal(withActiveInitiative('[core]\nuser_name = "K"\n\n[other]\nx = 1\n', 'initiative-a'), '[core]\nactive_initiative = "initiative-a"\nuser_name = "K"\n\n[other]\nx = 1\n')
  assert.equal(withActiveInitiative('[other]\nx = 1\n', 'initiative-a'), '[other]\nx = 1\n\n[core]\nactive_initiative = "initiative-a"\n')
})
test('an existing value is replaced in place, only inside core, and CRLF survives', () => {
  assert.equal(withActiveInitiative('[other]\nactive_initiative = "keep"\n[core]\nactive_initiative = "old"\n', 'initiative-b'), '[other]\nactive_initiative = "keep"\n[core]\nactive_initiative = "initiative-b"\n')
  assert.equal(withActiveInitiative('[core]\r\nactive_initiative = "old"\r\n', 'initiative-b'), '[core]\r\nactive_initiative = "initiative-b"\r\n')
})
test('folder names are kebab-case without accents and refuse an empty name', () => {
  assert.equal(initiativeFolderName('  Essai Codex été !'), 'initiative-essai-codex-ete')
  assert.throws(() => initiativeFolderName('!!!'))
})
test('writing and creating stay inside BMad conventions', async t => {
  const root = await mkdtemp(join(tmpdir(), 'madness-initiative-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, '_bmad'))
  await writeFile(join(root, '_bmad/config.toml'), '[core]\noutput_folder = "{project-root}/sorties"\n')
  const name = await createInitiative(root, 'Mon "Chantier"')
  assert.equal(name, 'initiative-mon-chantier')
  assert.equal(await readFile(join(root, 'sorties', name, name + '.md'), 'utf8'), '---\ntype: initiative\ntitle: "Mon \\"Chantier\\""\nparent: none\n---\n')
  await writeFile(join(root, 'sorties', name, name + '.md'), 'kept')
  await createInitiative(root, 'Mon Chantier')
  assert.equal(await readFile(join(root, 'sorties', name, name + '.md'), 'utf8'), 'kept')
  await writeActiveInitiative(root, name)
  assert.equal(await readFile(join(root, '_bmad/custom/config.user.toml'), 'utf8'), '[core]\nactive_initiative = "initiative-mon-chantier"\n')
})
