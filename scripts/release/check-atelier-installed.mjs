import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, realpath, lstat, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright-core'
import { windowsOwnedProcesses } from '../../src/adapters/codex/owned-run.ts'
import { installWorkspaceObservationRuntime, closeWorkspaceSession } from '../qualification/workspace-design.mjs'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const personal = process.argv.includes('--personal')
const directory = resolve(root, process.argv.find(arg => arg.startsWith('--directory='))?.slice(12) ?? 'dist/atelier-logo-final')
const executable = personal ? 'C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe' : join(directory, 'win-unpacked/Madness.exe')
const output = resolve(root, process.argv.find(arg => arg.startsWith('--output='))?.slice(9) ?? '_bmad-output/initiative-madness/ux-madness/qualification-logo-installation')
await mkdir(output, { recursive: true })
const temporary = personal ? null : await realpath(await mkdtemp(join(tmpdir(), 'madness-icon-')))
const expectedProfile = personal ? 'C:/Users/UP60066553/AppData/Roaming/Madness' : temporary
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => ['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH','APPDATA','LOCALAPPDATA'].includes(key.toUpperCase())))
if (!personal) Object.assign(env, { MADNESS_DATA_HOME: temporary, APPDATA: join(temporary, 'appdata'), LOCALAPPDATA: join(temporary, 'localappdata') })
const report = { status: 'partial', mode: personal ? 'personal-passive-reopen' : 'synthetic-icon-check', checks: [], limits: ['Observation réseau et moteur après instrumentation seulement.', 'Aucun consentement, vérification fournisseur ou message envoyé.'] }
let owned
try {
  const app = await electron.launch({ executablePath: executable, args: [], cwd: dirname(executable), env, timeout: 30000 })
  owned = { app, closeObserved: false }
  app.once('close', () => { owned.closeObserved = true })
  const runtime = await app.evaluate(({ app }) => ({ pid: process.pid, executable: process.execPath, userData: app.getPath('userData'), appPath: app.getAppPath(), version: app.getVersion() }))
  owned.main = await windowsOwnedProcesses.read(runtime.pid)
  assert.ok(owned.main); assert.equal(resolve(runtime.executable).toLowerCase(), resolve(executable).toLowerCase())
  assert.equal(resolve(runtime.userData).toLowerCase(), resolve(expectedProfile).toLowerCase())
  owned.observationPath = join(output, personal ? 'personal-observation.json' : 'icon-observation.json')
  const observation = await app.evaluate(installWorkspaceObservationRuntime, owned.observationPath)
  owned.observationStartedAt = observation.startedAt
  assert.ok(observation.complete && observation.attached)
  const page = await app.firstWindow()
  await page.waitForFunction(() => !!window.madnessDialogue)
  await page.locator('h1').waitFor()
  const reply = await page.evaluate(() => window.madness.readState())
  assert.ok(reply.ok)
  const dialogue = await page.evaluate(() => window.madnessDialogue.read())
  assert.equal(dialogue.turn, null); assert.equal(dialogue.status, 'idle')
  const account = await page.evaluate(() => window.madnessConnection.read())
  if (personal) assert.ok(account.state.accountStored && !account.state.needsPlanAcknowledgement, 'EXISTING_ACCOUNT_UNREADABLE')
  report.accountReadable = personal ? true : null
  report.projectNames = reply.value.state.projects.map(project => project.name)
  report.runtime = runtime
  report.checks.push('exact-executable-and-normal-profile', 'dialogue-inactive-no-turn', 'local-state-readable')
  const icon = await app.evaluate(async ({ app }) => {
    const image = await app.getFileIcon(process.execPath, { size: 'large' })
    const pixels=image.toBitmap();let warm=0,cool=0,opaque=0
    for(let i=0;i<pixels.length;i+=4){const b=pixels[i],g=pixels[i+1],r=pixels[i+2],a=pixels[i+3];if(a>128){opaque++;if(r>120&&r>g*1.25&&g>b*1.1)warm++;if(b>r*1.15&&g>r*1.1)cool++}}
    return { size: image.getSize(), empty: image.isEmpty(), warmRatio:warm/opaque,coolRatio:cool/opaque,png: image.toPNG().toString('base64') }
  })
  assert.equal(icon.empty, false)
  await writeFile(join(output, personal ? 'installed-executable-icon.png' : 'candidate-executable-icon.png'), Buffer.from(icon.png, 'base64'))
  report.iconSize = icon.size; report.checks.push('native-executable-icon-extracted')
  report.iconPalette={warmRatio:icon.warmRatio,coolRatio:icon.coolRatio}
  assert.ok(icon.warmRatio>.1&&icon.coolRatio>.05,'WINDOWS_ICON_NOT_THE_WORKSHOP_LOGO');report.checks.push('native-icon-matches-workshop-palette')
  const stylesheet = await page.evaluate(() => [...document.styleSheets].some(sheet => { try { return [...sheet.cssRules].some(rule => rule.cssText.includes('message-author') && rule.cssText.includes('sticky')) } catch { return false } }))
  assert.ok(stylesheet, 'ATELIER_STYLE_NOT_LOADED'); report.checks.push('atelier-finish-loaded')
  if(process.argv.includes('--controls')){
    const controls=await page.evaluate(()=>({drag:getComputedStyle(document.querySelector('.topbar')).getPropertyValue('app-region'),paragraphSize:parseFloat(getComputedStyle(document.querySelector('p:not([class])')??document.querySelector('p')).fontSize),projectMarks:[...document.querySelectorAll('.project-glyph,.project-avatar')].map(e=>({text:e.textContent.trim(),drawn:!!e.querySelector('.project-mark')})),projectLabels:[...document.querySelectorAll('.project-link')].map(e=>e.getAttribute('aria-label'))}))
    assert.equal(controls.drag,'no-drag');assert.ok(controls.paragraphSize>=16);assert.ok(controls.projectMarks.every(value=>value.drawn));assert.ok(controls.projectLabels.every(value=>!!value))
    report.controls=controls;report.checks.push('controls-skin-readable-type-named-project-marks-and-drag-separated')
  }
  if(process.argv.includes('--type')){
    report.typography=await page.evaluate(async()=>{const loaded=await document.fonts.load('450 16px "Oxanium"','Été, œuvre, cœur, où, façade — 0123456789.');await document.fonts.ready;return {family:getComputedStyle(document.body).fontFamily,weight:getComputedStyle(document.body).fontWeight,loaded:loaded.some(face=>face.family.includes('Oxanium')&&face.status==='loaded')}})
    assert.ok(report.typography.family.startsWith('Oxanium'));assert.equal(report.typography.weight,'450');assert.equal(report.typography.loaded,true)
    report.checks.push('local-oxanium-loaded-reading-weight-450')
  }
  await page.screenshot({ path: join(output, personal ? 'installed-home.png' : 'candidate-home.png') })
  const value = await app.evaluate(() => globalThis.__workspaceObservation.read())
  assert.ok(value.complete && value.attached); assert.equal(value.network, 0); assert.equal(value.appServerAttempts, 0)
  report.observation = value; report.checks.push('no-network-or-engine-after-hook')
  report.status = 'passed'
} catch (error) {
  report.status = 'failed'; report.failure = error.stack; process.exitCode = 1
} finally {
  if (owned) {
    report.close = await closeWorkspaceSession(owned)
    if (!report.close.cleanupSafe) { report.status = 'failed'; process.exitCode = 1 }
  }
  if (temporary && report.close?.cleanupSafe) {
    const actual = await realpath(temporary), base = await realpath(tmpdir())
    assert.equal(dirname(actual), base); assert.match(basename(actual), /^madness-icon-[A-Za-z0-9]+$/); assert.equal((await lstat(actual)).isSymbolicLink(), false)
    await rm(actual, { recursive: true, force: true }); report.syntheticCleanup = true
  }
  await writeFile(join(output, personal ? 'personal-reopen.json' : 'candidate-check.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, accountReadable: report.accountReadable, closed: report.close?.cleanupSafe, failure: report.failure }))
}
