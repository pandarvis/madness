import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdir, mkdtemp, realpath, rm, access } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { childEnvironment, cleanWorkspace } from '../scripts/qualification/windows.mjs'

test('le banc Windows isole le profil et ne transmet pas les identifiants ou options Node', () => {
  const env = childEnvironment({ PATH: 'tools', SYSTEMROOT: 'Windows', CODEX_HOME: 'private', OPENAI_API_KEY: 'secret', NODE_OPTIONS: '--require=private', ELECTRON_RUN_AS_NODE: '1', ELECTRON_RENDERER_URL: 'http://untrusted' }, 'C:\\owned-profile')
  assert.equal(env.MADNESS_DATA_HOME, 'C:\\owned-profile')
  assert.equal(env.PATH, 'tools')
  assert.equal(env.NODE_OPTIONS, undefined)
  assert.equal(env.ELECTRON_RUN_AS_NODE, undefined)
  assert.equal(env.OPENAI_API_KEY, undefined)
  assert.equal(env.CODEX_HOME, undefined)
  assert.equal(env.ELECTRON_RENDERER_URL, undefined)
  assert.throws(() => childEnvironment({ NODE_TLS_REJECT_UNAUTHORIZED: '0' }, 'C:\\owned-profile'), /TLS_DISABLED/)
})

test('le nettoyage Windows refuse un parent arbitraire et retire son seul espace créé', async () => {
  const base = await realpath(tmpdir()), parent = await mkdtemp(join(base, 'madness-harness-test-'))
  try {
    const owned = await mkdtemp(join(parent, 'madness-g0-'))
    const unrelated = join(parent, 'unrelated')
    await mkdir(unrelated)
    await assert.rejects(cleanWorkspace(parent, base), /UNSAFE_CLEANUP/)
    await assert.rejects(cleanWorkspace(unrelated, parent), /UNSAFE_CLEANUP/)
    await assert.rejects(cleanWorkspace(owned, base), /UNSAFE_CLEANUP/)
    await cleanWorkspace(owned, parent)
    await assert.rejects(access(owned), { code: 'ENOENT' })
    await access(unrelated)
  } finally { await rm(parent, { recursive: true, force: true }) }
})
