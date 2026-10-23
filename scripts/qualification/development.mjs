import { mkdtemp, mkdir, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'vite'
import { _electron as electron } from 'playwright-core'
import { loadConfigFromFile } from 'electron-vite'
import assert from 'node:assert/strict'
import { childEnvironment, cleanWorkspace } from './windows.mjs'
const repository = resolve('.'), base = await realpath(tmpdir()), root = await mkdtemp(join(base, 'madness-g0-')), profile = join(root, 'profile')
await mkdir(profile)
let app, server
try {
  const { config } = await loadConfigFromFile({ command: 'serve', mode: 'development' }, undefined, repository)
  server = await createServer({ ...config.renderer, configFile: false, root: join(repository, 'src/renderer') })
  await server.listen()
  app = await electron.launch({ executablePath: join(repository, 'node_modules/electron/dist/electron.exe'), args: [repository], cwd: repository, env: { ...childEnvironment(process.env, profile), ELECTRON_RENDERER_URL: 'http://127.0.0.1:5173', MADNESS_DEV_CSP_NONCE: process.env.MADNESS_DEV_CSP_NONCE }, timeout: 15000 })
  const page = await app.firstWindow()
  page.on('pageerror', (error) => console.error(error.message))
  page.on('console', (message) => { if (message.type() === 'error') console.error(message.text()) })
  await page.getByRole('heading', { name: 'Vos projets, au même endroit', exact: true }).waitFor({ timeout: 10000 })
  assert.equal(await page.evaluate(() => location.href), 'http://127.0.0.1:5173/')
  const policy = await page.evaluate(async () => (await fetch(location.href)).headers.get('content-security-policy'))
  assert.ok(policy.includes("'nonce-" + process.env.MADNESS_DEV_CSP_NONCE + "'"))
  assert.equal(policy.includes('unsafe-inline'), false)
  assert.equal((await page.evaluate(() => window.madness.readState())).ok, true)
  console.log('Mode développement : React affiché avec le pont réel.')
} finally {
  if (app) await app.close()
  if (server) await server.close()
  await cleanWorkspace(root, base)
}
