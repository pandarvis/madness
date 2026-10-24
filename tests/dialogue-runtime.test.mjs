import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const runtime = await import('../src/adapters/bmad/runtime.ts').catch(() => null)
test('le runtime choisi est hors projet et une copie binaire altérée ne peut pas être exécutée', async () => {
  assert.ok(runtime, 'Le runtime externe qualifié doit exister')
  const trusted = await runtime.bmadRuntime()
  assert.equal(trusted.python.includes('C:\\Sources\\madness'), false)
  assert.equal(trusted.python.includes('.venv'), false)
  const root = await mkdtemp(join(tmpdir(), 'madness-runtime-'))
  try { await writeFile(join(root, 'uv.exe'), 'changed'); await assert.rejects(runtime.verifyRuntimeFile(join(root, 'uv.exe'), '0'.repeat(64)), { code: 'RESOLVER_FAILED' }) }
  finally { await rm(root, { recursive: true, force: true }) }
})
