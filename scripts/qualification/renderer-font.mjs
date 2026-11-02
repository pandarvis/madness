// Vrai Main/preload, profil synthétique ; aucune capture, aucun compte ni moteur.
import assert from 'node:assert/strict'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, readFile, readdir, realpath, lstat, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { benchOutput } from './epic-one-support.mjs'
import { windowsOwnedProcesses } from '../../src/adapters/codex/owned-run.ts'
import { closeWorkspaceSession, installWorkspaceObservationRuntime } from './workspace-design.mjs'

const repository = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const require = createRequire(import.meta.url), executable = require('electron')
const output = await benchOutput(null, process.argv.slice(2))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const report = { schemaVersion: 1, scope: 'compiled-real-main-isolated-font-and-protocol', startedAt: new Date().toISOString(), status: 'partial', checks: [], captures: [], cleanup: false, limits: ['Profil synthétique sans compte ni modèle. Aucun fichier de projet lu.', 'Compteurs réseau/app-server mesurés seulement après installation du hook. Aucun réseau externe demandé.'] }
const check = (name, passed, value) => report.checks.push({ name, passed, value })
let app, root, owned
try {
  assert.equal(process.platform, 'win32')
  root = await realpath(await mkdtemp(join(tmpdir(), 'madness-renderer-font-')))
  const profile = join(root, 'profile'); await mkdir(profile)
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH'].includes(key.toUpperCase())))
  app = await electron.launch({ executablePath: executable, args: [repository], cwd: repository, env: { ...env, MADNESS_DATA_HOME: profile, APPDATA: join(root, 'appdata'), LOCALAPPDATA: join(root, 'localappdata') }, timeout: 30000 })
  owned = { app, closeObserved: false }; app.once('close', () => { owned.closeObserved = true })
  const runtime = await app.evaluate(({ app }) => ({ pid: process.pid, executable: process.execPath, userData: app.getPath('userData') }))
  owned.main = await windowsOwnedProcesses.read(runtime.pid)
  assert.ok(owned.main && owned.main.pid === runtime.pid && resolve(owned.main.executable).toLowerCase() === resolve(executable).toLowerCase() && resolve(runtime.executable).toLowerCase() === resolve(executable).toLowerCase())
  assert.equal(resolve(runtime.userData), resolve(profile))
  owned.observationPath = join(output, 'native-observation.json')
  const observation = await app.evaluate(installWorkspaceObservationRuntime, owned.observationPath); owned.observationStartedAt = observation.startedAt
  assert.equal(observation.complete, true); assert.equal(observation.attached, true)
  report.main = owned.main
  const page = await app.firstWindow(); await page.waitForFunction(() => !!window.madnessAppearance && !!window.madnessDialogue)
  assert.equal(await page.evaluate(() => location.href), 'madness://app/index.html')
  check('synthetic-profile-no-account', !(await page.evaluate(() => window.madnessConnection.read())).state.accountStored)
  const assets = await readdir(join(repository, 'out/renderer/assets'))
  const fontFile = assets.find(file => /^BarlowCondensed-Bold-.+\.ttf$/.test(file)); assert.ok(fontFile)
  const fontUrl = 'madness://app/assets/' + fontFile, fontBytes = await readFile(join(repository, 'out/renderer/assets', fontFile))
  const cases = [
    // Chromium may normalize standard custom-scheme ports before the existing handler.
    // Retain the transport observation separately; this lot does not change that policy.
    { name: 'host-port', url: fontUrl.replace('://app/', '://app:1234/'), status: null },
    { name: 'embedded-ttf', url: fontUrl, status: 200 },
    { name: 'existing-index', url: 'madness://app/index.html', status: 200 },
    { name: 'foreign-host', url: fontUrl.replace('://app/', '://foreign/'), status: 403 },
    { name: 'query', url: fontUrl + '?file=outside', status: 403 },
    { name: 'head-method', url: fontUrl, method: 'HEAD', status: 403 },
    { name: 'post-method', url: fontUrl, method: 'POST', status: 403 },
    { name: 'outside-renderer-ttf', url: 'madness://app/..%2F..%2Foutside.ttf', status: 403 },
    { name: 'outside-renderer-js', url: 'madness://app/..%2Fmain%2Findex.js', status: 403 },
    { name: 'backslash', url: 'madness://app/assets%5C' + fontFile, status: 403 },
    { name: 'nul', url: fontUrl + '%00', status: 403 },
    { name: 'nonadmitted-json', url: 'madness://app/package.json', status: 403 },
    { name: 'nonadmitted-text', url: 'madness://app/assets/private.txt', status: 403 },
    { name: 'nonadmitted-woff', url: 'madness://app/assets/other.woff', status: 403 },
    { name: 'nonadmitted-otf', url: 'madness://app/assets/other.otf', status: 403 },
    { name: 'missing-embedded-ttf', url: 'madness://app/assets/not-shipped.ttf', status: 404 },
  ]
  const responses = await app.evaluate(async ({ net }, cases) => {
    const hash = value => process.getBuiltinModule('crypto').createHash('sha256').update(value).digest('hex')
    const results = []
    for (const item of cases) {
      try { const response = await net.fetch(item.url, { method: item.method ?? 'GET', cache: 'no-store' }), bytes = Buffer.from(await response.arrayBuffer()); results.push({ name: item.name, requestedUrl: item.url, parsedInputPort: new URL(item.url).port, responseUrl: response.url, status: response.status, bytes: bytes.length, sha256: hash(bytes), contentType: response.headers.get('content-type') }) }
      catch (error) { results.push({ name: item.name, error: String(error) }) }
    }
    return results
  }, cases)
  report.transportObservations = []
  for (const item of cases) { const result = responses.find(result => result.name === item.name); if (item.status === null) report.transportObservations.push(result); else check('protocol-' + item.name, result.status === item.status, { expected: item.status, ...result }) }
  report.limits.push('Le transport du port est observé séparément : le refus strict d’un port avant normalisation Chromium n’est pas qualifié par ce banc. La garde préexistante url.port reste inchangée.')
  const accepted = responses.find(result => result.name === 'embedded-ttf')
  check('embedded-font-exact-bytes', accepted.bytes === fontBytes.length && accepted.sha256 === hash(fontBytes), { expectedBytes: fontBytes.length, expectedSha256: hash(fontBytes), actualBytes: accepted.bytes, actualSha256: accepted.sha256 })
  const loaded = await page.evaluate(async () => {
    try { const faces = await document.fonts.load('700 32px "Barlow Condensed"'); await document.fonts.ready; return { ready: document.fonts.check('700 32px "Barlow Condensed"'), faces: faces.map(face => ({ family: face.family, weight: face.weight, status: face.status })), headingFamily: getComputedStyle(document.querySelector('h1')).fontFamily } }
    catch (error) { return { ready: false, error: String(error) } }
  })
  check('renderer-font-loaded-through-real-protocol-and-csp', loaded.ready && loaded.faces?.some(face => face.family === 'Barlow Condensed' && face.weight === '700' && face.status === 'loaded'), loaded)
  const activity = await app.evaluate(() => globalThis.__workspaceObservation.read())
  check('no-network-or-app-server-after-hook', activity.complete && activity.attached && activity.network === 0 && activity.appServerAttempts === 0 && activity.appServers === 0 && activity.appServerCloses === 0, activity)
  report.sources = []
  for (const file of ['src/main/index.ts', 'out/main/index.js', 'out/renderer/index.html', 'out/renderer/assets/' + fontFile]) { const bytes = await readFile(join(repository, file)); report.sources.push({ file, bytes: bytes.length, sha256: hash(bytes) }) }
  assert.ok(report.checks.every(check => check.passed), report.checks.filter(check => !check.passed).map(check => check.name).join(', '))
  report.status = 'passed'
} catch (error) { report.status = 'failed'; report.failure = error instanceof Error ? error.stack : String(error); process.exitCode = 1 }
finally {
  if (app) {
    try { report.close = await closeWorkspaceSession(owned); if (!report.close.cleanupSafe || report.close.closeError) throw Error('OWNED_CLOSE_UNCONFIRMED'); app = null }
    catch (error) { report.status = 'failed'; report.closeFailure = String(error); process.exitCode = 1 }
  }
  if (root && !app && report.close?.cleanupSafe) {
    const actual = await realpath(root), base = await realpath(tmpdir())
    if (dirname(actual) === base && /^madness-renderer-font-[A-Za-z0-9]+$/.test(basename(actual)) && !(await lstat(actual)).isSymbolicLink()) { await rm(actual, { recursive: true, force: true, maxRetries: 3 }); report.cleanup = true }
  }
  if (root && !report.cleanup) report.retainedWorkspace = root
  report.finishedAt = new Date().toISOString(); await writeFile(join(output, 'profile.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, failed: report.checks.filter(check => !check.passed), cleanup: report.cleanup, failure: report.failure ?? null }))
}
