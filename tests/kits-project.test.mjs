import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { activateKit, deactivateKit, activeKits } from '../src/adapters/kits/project.ts'

async function fixture(t) {
  const base = await mkdtemp(join(tmpdir(), 'madness-kit-')); t.after(() => rm(base, { recursive: true, force: true }))
  const kit = join(base, 'kit'), root = join(base, 'projet')
  await mkdir(join(kit, 'charte'), { recursive: true })
  await writeFile(join(kit, 'madness-kit.toml'), '[kit]\nid = "acme"\nname = "Acme"\nversion = "1.0.0"\n[[piece]]\nkind = "docs"\ntitle = "Charte"\npath = "charte/*.md"\nlevel = "impose"\nfor = ["ux"]\n')
  await writeFile(join(kit, 'charte', 'couleurs.md'), '# Couleurs')
  await writeFile(join(kit, 'notes-privees.txt'), 'hors kit')
  for (const [skill, table] of [['bmad-agent-ux-designer', 'agent'], ['bmad-ux', 'workflow'], ['bmad-agent-dev', 'agent']]) {
    await mkdir(join(root, '.agents', 'skills', skill), { recursive: true })
    await writeFile(join(root, '.agents', 'skills', skill, 'customize.toml'), '# x\n[' + table + ']\nicon = "a"\n')
  }
  await mkdir(join(root, '_bmad', 'custom'), { recursive: true })
  return { kit, root }
}
test('activation copies the kit, locks it and writes the overrides; deactivation undoes all of it', async t => {
  const { kit, root } = await fixture(t)
  const report = await activateKit(root, kit)
  assert.deepEqual(report.skills, ['bmad-agent-ux-designer', 'bmad-ux'])
  assert.equal(await readFile(join(root, '_bmad', 'kits', 'acme', 'charte', 'couleurs.md'), 'utf8'), '# Couleurs')
  await assert.rejects(access(join(root, '_bmad', 'kits', 'acme', 'notes-privees.txt')))
  assert.match(await readFile(join(root, '_bmad', 'custom', 'bmad-agent-ux-designer.toml'), 'utf8'), /principles = \[\n {2}"Respecter obligatoirement « Charte » du kit Acme\."/)
  await assert.rejects(access(join(root, '_bmad', 'custom', 'bmad-agent-dev.toml')))
  assert.deepEqual((await activeKits(root)).map(k => [k.id, k.version]), [['acme', '1.0.0']])
  await deactivateKit(root, 'acme')
  assert.deepEqual(await activeKits(root), [])
  await assert.rejects(access(join(root, '_bmad', 'kits')))
  await assert.rejects(access(join(root, '_bmad', 'custom', 'bmad-ux.toml')))
})
test('an invalid kit is refused with its reasons, the project stays untouched', async t => {
  const { kit, root } = await fixture(t)
  await writeFile(join(kit, 'madness-kit.toml'), '[kit]\nid = "x"\n')
  await assert.rejects(activateKit(root, kit), /kit.name est obligatoire/)
  assert.deepEqual(await activeKits(root), [])
})
test('a conflict with a hand-written override leaves the project as it was', async t => {
  const { kit, root } = await fixture(t)
  await writeFile(join(root, '_bmad', 'custom', 'bmad-ux.toml'), '[workflow]\npersistent_facts = ["à nous"]\n')
  await assert.rejects(activateKit(root, kit), /KIT_OVERRIDE_CONFLICT/)
  assert.deepEqual(await activeKits(root), [])
  await assert.rejects(access(join(root, '_bmad', 'kits', 'acme')))
  assert.equal(await readFile(join(root, '_bmad', 'custom', 'bmad-ux.toml'), 'utf8'), '[workflow]\npersistent_facts = ["à nous"]\n')
})
