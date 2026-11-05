import {waitForPageCondition} from './page-condition-wait.mjs'
import assert from 'node:assert/strict'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, lstat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname, basename, relative, isAbsolute, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
const require = createRequire(import.meta.url)
const repository = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const output = join(repository, '_bmad-output/initiative-madness/qualification-connexion-codex')
const live = process.argv.includes('--live')
const capture = !process.argv.includes('--no-captures')
const packaged = process.argv.includes('--packaged')
const report = { schemaVersion: 1, observedAt: new Date().toISOString(), mode: live ? 'live-human-consent' : 'isolated-no-provider-network', status: 'partial', checks: [], screenshots: [], liveProof: 'missing', cleanup: false, limits: ['Aucun parcours BMad, gate G1 distribué ou audit WCAG qualifié.', 'Le consentement réel est humain ; les fixtures ne prouvent pas le forfait.'] }
let running, root
const pass = (name) => report.checks.push(name)
const connection = async (page) => (await page.evaluate(() => window.madnessConnection.read())).state
async function stop() { if (!running) return; const owned = running, child = owned.process(); await owned.close(); assert.notEqual(child.exitCode, null); running = undefined }
async function launch(profile) {
  const names = ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', ...(live ? ['APPDATA', 'LOCALAPPDATA', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'SSL_CERT_FILE', 'SSL_CERT_DIR'] : [])]
  const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => names.includes(name.toUpperCase())))
  running = await electron.launch({ executablePath: packaged ? join(repository, 'dist/win-unpacked/Madness.exe') : require('electron'), args: packaged ? [] : [repository], cwd: repository, env: { ...env, MADNESS_DATA_HOME: profile, ...(!live ? { APPDATA: join(profile, 'appdata'), LOCALAPPDATA: join(profile, 'localappdata') } : {}) }, timeout: 30000 })
  const page = await running.firstWindow(); await page.waitForFunction(() => Boolean(window.madnessConnection))
  await waitForPageCondition(page,async () => (await window.madness.readState()).ok)
  return page
}
async function main() {
  await mkdir(output, { recursive: true })
  const temporaryBase = await realpath(tmpdir()), distance = relative(repository, temporaryBase)
  if (!distance || !isAbsolute(distance) && distance !== '..' && !distance.startsWith('..' + sep)) throw Error('TEMPORARY_ROOT_IN_REPOSITORY')
  root = await mkdtemp(join(temporaryBase, 'madness-connection-'))
  const profile = join(root, 'profile')
  try {
    let page = await launch(profile)
    assert.equal((await connection(page)).status, 'disconnected')
    assert.equal((await page.evaluate(() => window.madness.readState())).value.state.capabilities.codex.available, false)
    const icon = page.getByRole('button', { name: 'Connexion Codex : non connecté', exact: true })
    assert.equal(await icon.count(), 1, 'Une seule icône Codex accessible doit remplacer le statut textuel')
    assert.equal(await page.locator('.topbar .connection').count(), 0)
    assert.equal(await page.getByRole('button', { name: 'Ouvrir un projet', exact: true }).count(), 1)
    pass('cold-start-single-icon-and-project-command')
    await icon.focus(); await page.keyboard.press('Enter')
    const panel = page.getByRole('dialog', { name: 'Connexion Codex', exact: true }); await panel.waitFor()
    assert.equal(await panel.getAttribute('aria-modal'), 'false')
    assert.equal(await page.getByRole('heading', { name: 'Connexion Codex', exact: true }).evaluate((element) => element === document.activeElement), true)
    await page.keyboard.press('Escape'); assert.equal(await icon.evaluate((element) => element === document.activeElement), true)
    await icon.click(); pass('keyboard-panel-escape-focus-return')
    report.runtime = await running.evaluate(({ app, safeStorage }) => ({ electron: process.versions.electron, chromium: process.versions.chrome, packaged: app.isPackaged, encryptionAvailable: safeStorage.isEncryptionAvailable() }))
    assert.equal(report.runtime.encryptionAvailable, true)
    if (live) {
      console.log('Consentement réel attendu dans Madness : Continuer avec ChatGPT. Le témoin utilise le forfait. Aucun clic automatique.')
      await waitForPageCondition(page,async () => { const { state } = await window.madnessConnection.read(); return ['verified', 'error', 'unknown', 'cancelled'].includes(state.status) }, null, { timeout: 660000 })
      const state = await connection(page)
      report.liveProof = state.status === 'verified' ? 'signed-oauth-and-native-probe-confirmed' : 'not-confirmed'
      report.connection = { status: state.status, errorCode: state.errorCode, verifiedAt: state.verifiedAt, cliVersion: state.cliVersion, accountStored: state.accountStored }
      assert.equal(state.status, 'verified')
      if (state.needsPlanAcknowledgement) { console.log('Connexion vérifiée : acquittez maintenant le rappel d’usage du forfait dans Madness.'); await waitForPageCondition(page,async () => !(await window.madnessConnection.read()).state.needsPlanAcknowledgement, null, { timeout: 120000 }) }
      pass('live-signed-oauth-native-turn-and-confirmed-stop')
    } else {
      await running.evaluate(({ shell, session }) => {
        globalThis.__madnessQualification = { browserOpens: 0, requests: 0 }
        shell.openExternal = async (url) => { if (new URL(url).origin !== 'https://auth.openai.com') throw Error('fixed-authorization-only'); globalThis.__madnessQualification.browserOpens++ }
        session.defaultSession.webRequest.onBeforeRequest({ urls: ['https://auth.openai.com/*', 'https://api.openai.com/*'] }, (_details, callback) => { globalThis.__madnessQualification.requests++; callback({ cancel: true }) })
      })
      await page.getByRole('button', { name: 'Continuer avec ChatGPT', exact: true }).click()
      await waitForPageCondition(page,async () => (await window.madnessConnection.read()).state.status === 'authorizing')
      await page.getByRole('button', { name: 'Annuler la connexion', exact: true }).click()
      await waitForPageCondition(page,async () => (await window.madnessConnection.read()).state.status === 'cancelled')
      const observation = await running.evaluate(() => globalThis.__madnessQualification)
      assert.equal(observation.requests, 0); assert.equal(observation.browserOpens, 1)
      pass('explicit-system-browser-only-and-cancel-without-provider-network')
      const foreign = await running.evaluate(async ({ BrowserWindow }, preload) => {
        const other = new BrowserWindow({ show: false, webPreferences: { preload, sandbox: true, contextIsolation: true, nodeIntegration: false } })
        try { await other.loadURL('madness://app/index.html'); return await other.webContents.executeJavaScript('window.madnessConnection.connect()') } finally { other.destroy() }
      }, join(repository, 'out/preload/index.js'))
      assert.equal(foreign.state.errorCode, 'UNTRUSTED_CALLER'); pass('foreign-window-rejected-before-oauth')
      report.visualChecks = await panel.evaluate((element) => {
        const style = getComputedStyle(element), tokens = getComputedStyle(document.documentElement)
        const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number)
        const luminance = (values) => values.map((v) => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
        const contrast = (left, right) => { const a = luminance(rgb(left)), b = luminance(rgb(right)); return Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2)) }
        const color = (name) => { const probe = document.createElement('span'); probe.style.color = tokens.getPropertyValue(name); element.append(probe); const result = getComputedStyle(probe).color; probe.remove(); return result }
        return { padding: style.padding, radius: style.borderRadius, bodySize: getComputedStyle(element.querySelector('p')).fontSize, titleSize: getComputedStyle(element.querySelector('h2')).fontSize, contrast: { body: contrast(color('--text'), style.backgroundColor), muted: contrast(color('--muted'), style.backgroundColor), error: contrast(color('--error-text'), color('--error')), primary: contrast(color('--surface'), color('--accent')), focus: contrast(color('--accent'), style.backgroundColor) } }
      })
      for (const value of Object.values(report.visualChecks.contrast)) assert.ok(value >= 4.5)
      for (const size of [{ width: 1320, height: 860, name: 'desktop' }, { width: 600, height: 800, name: 'compact' }]) {
        await running.evaluate(({ BrowserWindow }, value) => BrowserWindow.getAllWindows()[0].setContentSize(value.width, value.height), size)
        if (!await panel.isVisible()) await page.getByRole('button', { name: /^Connexion Codex :/ }).click()
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
        const box = await panel.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= size.width)
        if (capture) { const filename = 'connection-' + size.name + '.png'; await page.screenshot({ path: join(output, filename) }); report.screenshots.push(filename) }
      }
      pass('desktop-compact-and-panel-bounds')
      await stop()
      const credentialRoot = join(profile, 'codex-connection-v1'); await mkdir(credentialRoot, { recursive: true })
      // Fixture chiffrée synthétique : aucune identité réelle ni jeton fournisseur.
      const fixture = { version: 1, clientId: 'oaiapp_qualification', subject: 'synthetic-subject', accessToken: 'synthetic-access', refreshToken: 'synthetic-refresh', idToken: 'synthetic-id', expiresAt: Date.now() + 3600000, scopes: ['openid', 'profile', 'email', 'offline_access', 'resource.invoke', 'chatgpt.tokens.use.direct'], planAcknowledged: false }
      page = await launch(profile)
      const encrypted = await running.evaluate(({ safeStorage }, text) => Array.from(safeStorage.encryptString(text)), JSON.stringify(fixture))
      await stop(); await writeFile(join(credentialRoot, 'credentials.bin'), Buffer.from(encrypted))
      page = await launch(profile)
      assert.equal((await connection(page)).status, 'registered')
      assert.equal((await connection(page)).verifiedAt, null)
      pass('dpapi-restore-registered-without-probe-or-network')
      const confirmation = page.getByRole('dialog', { name: 'Vous utilisez votre forfait ChatGPT', exact: true })
      await confirmation.waitFor()
      await page.getByRole('button', { name: 'J’ai compris', exact: true }).click()
      await waitForPageCondition(page,async () => !(await window.madnessConnection.read()).state.needsPlanAcknowledgement)
      await stop(); page = await launch(profile)
      assert.equal((await connection(page)).needsPlanAcknowledgement, false)
      assert.equal(await page.getByRole('dialog', { name: 'Vous utilisez votre forfait ChatGPT', exact: true }).isVisible(), false)
      pass('first-plan-confirmation-acknowledged-once')
      await page.evaluate(() => window.madnessConnection.disconnect())
      assert.equal((await connection(page)).status, 'disconnected')
      await assert.rejects(readFile(join(credentialRoot, 'credentials.bin')), { code: 'ENOENT' })
      pass('explicit-local-disconnect-clears-encrypted-credentials')
      await stop(); await writeFile(join(credentialRoot, 'credentials.bin'), 'invalid-vault-fixture')
      page = await launch(profile)
      assert.equal((await connection(page)).errorCode, 'VAULT_UNREADABLE')
      assert.equal(await readFile(join(credentialRoot, 'credentials.bin'), 'utf8'), 'invalid-vault-fixture')
      pass('corrupt-vault-preserved')
    }
    report.artifacts = []
    for (const file of packaged ? ['dist/win-unpacked/Madness.exe', 'dist/win-unpacked/resources/app.asar'] : ['out/main/index.js', 'out/preload/index.js']) { const bytes = await readFile(join(repository, file)); report.artifacts.push({ file, bytes: bytes.byteLength, sha256: createHash('sha256').update(bytes).digest('hex') }) }
    report.status = live ? 'live-connection-confirmed' : 'automated-checks-passed-live-missing'
  } catch { report.failureCode = 'qualification-check-failed'; report.failureAfter = report.checks.at(-1) ?? 'startup'; process.exitCode = 1 }
  finally {
    try { await stop() } catch { report.failureCode = 'owned-process-stop-unconfirmed'; process.exitCode = 1 }
    if (root && !running) {
      const actual = await realpath(root), base = await realpath(tmpdir())
      if (dirname(actual) === base && /^madness-connection-[a-zA-Z0-9]+$/.test(basename(actual)) && !(await lstat(root)).isSymbolicLink()) { await rm(actual, { recursive: true, force: true, maxRetries: 3 }); report.cleanup = true }
    }
    await writeFile(join(output, live ? 'live-profile.json' : packaged ? 'packaged-profile.json' : 'profile.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(`Connexion Codex : ${report.status} ; ${report.checks.length} contrôles ; preuve live ${report.liveProof} ; nettoyage ${report.cleanup}.`)
  }
}
await main()
