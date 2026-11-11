import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cp, mkdtemp, mkdir, rm, writeFile, access } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { bundledRuntimePaths } from '../src/adapters/bmad/runtime.ts'
import { activateKit } from '../src/adapters/kits/project.ts'

// A real BMad installation to copy; machines without it skip this check.
const SOURCE = 'C:/Sources/madness-tests/morpion-bmad'
test('BMad itself resolves the facts and principles Madness wrote', async t => {
  const runtime = bundledRuntimePaths()
  try { await access(runtime.uv); await access(join(SOURCE, '_bmad', 'scripts', 'resolve_customization.py')) } catch { t.skip('runtime BMad absent'); return }
  const base = await mkdtemp(join(tmpdir(), 'madness-kit-bmad-')); t.after(() => rm(base, { recursive: true, force: true, maxRetries: 3 }))
  const root = join(base, 'p'), kit = join(base, 'kit')
  for (const d of ['_bmad', '.agents']) await cp(join(SOURCE, d), join(root, d), { recursive: true, filter: src => !/[\\/]render([\\/]|$)/.test(src) })
  await mkdir(kit); await writeFile(join(kit, 'glossaire.md'), 'On dit adhérent, jamais client.')
  await writeFile(join(kit, 'madness-kit.toml'), '[kit]\nid = "acme"\nname = "Acme"\nversion = "1.0.0"\n[[piece]]\nkind = "glossary"\ntitle = "Vocabulaire"\npath = "glossaire.md"\nlevel = "impose"\nfor = ["ux"]\n')
  await activateKit(root, kit)
  const resolve = skill => JSON.parse(execFileSync(runtime.uv, ['run', '--python', join(runtime.python, 'python.exe'), join(root, '_bmad', 'scripts', 'resolve_customization.py'), '--skill', join(root, '.agents', 'skills', skill)], { encoding: 'utf8', cwd: root, env: { ...process.env, UV_CACHE_DIR: join(tmpdir(), 'madness-uv-cache') } }))
  const sally = JSON.stringify(resolve('bmad-agent-ux-designer'))
  assert.match(sally, /_bmad\/kits\/acme\/glossaire\.md/)
  assert.match(sally, /Respecter obligatoirement « Vocabulaire » du kit Acme/)
  assert.doesNotMatch(JSON.stringify(resolve('bmad-agent-dev')), /kits\/acme/)
})
