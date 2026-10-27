import assert from 'node:assert/strict'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, lstat, readdir, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir, release } from 'node:os'
import { basename, dirname, join, resolve, relative, sep, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { releaseVersion } from '../../src/adapters/release-version.ts'
const require = createRequire(import.meta.url)
const repository = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const output = join(repository, '_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-g0')
const report = { schemaVersion: 1, observedAt: new Date().toISOString(), gate: 'G0', status: 'partial', platform: { os: process.platform, architecture: process.arch, release: release(), node: process.versions.node }, runtime: {}, checks: {}, screenshots: [], cleanup: false, limits: ['Sélection du dialogue OS contrôlée par le banc ; aucun parcours humain revendiqué.', 'Installateur construit mais non installé. Signature et proxy non qualifiés.', 'Aucun fournisseur lancé ; G1, G2, G3, G4 et G5 non qualifiés.', 'Aucun audit WCAG ni lecteur d’écran effectué.'] }
const skipScreenshots = process.argv.includes('--skip-screenshots')
const uiRegressionsOnly = process.argv.includes('--ui-regressions-only')
let root, base, running
const passed = (key) => { report.checks[key] = true }
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
async function buildInputsDigest() {
  async function filesIn(directory) {
    const entries = await readdir(join(repository, directory), { withFileTypes: true })
    const groups = await Promise.all(entries.filter((entry) => entry.name !== 'node_modules').map((entry) => entry.isDirectory() ? filesIn(directory + '/' + entry.name) : [directory + '/' + entry.name]))
    return groups.flat()
  }
  const files = [...await filesIn('src'), 'package.json', 'package-lock.json', 'electron.vite.config.ts', 'electron-builder.yml', 'tsconfig.json', 'tsconfig.node.json', 'tsconfig.web.json', 'resources/THIRD-PARTY-NOTICES.md'].sort()
  const digest = createHash('sha256')
  for (const file of files) { digest.update(file + '\0'); digest.update(await readFile(join(repository, file))); digest.update('\0') }
  return { algorithm: 'sha256-path-and-bytes', digest: digest.digest('hex'), fileCount: files.length }
}

export async function cleanWorkspace(path, temporaryBase) {
  const actual = await realpath(path), parent = await realpath(temporaryBase)
  if (actual !== resolve(path) || dirname(actual) !== parent || !/^madness-g0-[A-Za-z0-9]+$/.test(basename(actual)) || (await lstat(path)).isSymbolicLink()) throw new Error('UNSAFE_CLEANUP')
  await rm(actual, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
}
export function childEnvironment(source, profile) {
  if (source.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('TLS_DISABLED')
  const names = ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH']
  const env = Object.fromEntries(Object.entries(source).filter(([name]) => names.includes(name.toUpperCase())))
  return { ...env, MADNESS_DATA_HOME: profile, APPDATA: join(profile, 'appdata'), LOCALAPPDATA: join(profile, 'localappdata') }
}
async function stop() {
  if (!running) return
  const owned = running
  const child = owned.process()
  try { await owned.close() }
  finally { if (child.exitCode !== null) running = undefined }
  assert.equal(child.exitCode !== null, true)
}
async function launch(executablePath, args, profile) {
  assert.equal(running, undefined)
  running = await electron.launch({ executablePath, args, cwd: repository, env: childEnvironment(process.env, profile), timeout: 30000 })
  const page = await running.firstWindow({ timeout: 30000 })
  await page.waitForFunction(() => Boolean(window.madness))
  const actual = await running.evaluate(({ app }) => app.getPath('userData'))
  assert.equal(resolve(actual), resolve(profile))
  assert.equal(await page.evaluate(() => location.href), 'madness://app/index.html')
  await page.waitForFunction(() => document.querySelector('.open-project')?.matches(':enabled'))
  return page
}
async function inspectRuntime(label, page) {
  const runtime = await running.evaluate(({ BrowserWindow, app }) => {
    const window = BrowserWindow.getAllWindows()[0]
    const preferences = window.webContents.getLastWebPreferences()
    const metric = app.getAppMetrics().find((item) => item.pid === window.webContents.getOSProcessId())
    return { electron: process.versions.electron, chromium: process.versions.chrome, node: process.versions.node, packaged: app.isPackaged, sandbox: preferences.sandbox, rendererSandboxed: metric?.sandboxed ?? 'unknown', contextIsolation: preferences.contextIsolation, nodeIntegration: preferences.nodeIntegration, webSecurity: preferences.webSecurity }
  })
  assert.equal(runtime.sandbox, true); assert.equal(runtime.contextIsolation, true); assert.equal(runtime.nodeIntegration, false); assert.equal(runtime.webSecurity, true)
  assert.equal(runtime.rendererSandboxed, true)
  const surface = await page.evaluate(() => ({ process: typeof window.process, require: typeof window.require, bridge: Object.keys(window.madness).sort() }))
  assert.equal(surface.process, 'undefined'); assert.equal(surface.require, 'undefined')
  assert.deepEqual(surface.bridge, ['chooseDirectory', 'onStateChanged', 'readState', 'saveDraft', 'selectProject', 'setNavigation'])
  const connection = await page.evaluate(async () => ({ methods: Object.keys(window.madnessConnection).sort(), state: (await window.madnessConnection.read()).state }))
  assert.deepEqual(connection.methods, ['acknowledgePlan', 'cancel', 'connect', 'copyPublicKeys', 'disconnect', 'manageUsage', 'onChanged', 'openPublicKeys', 'read', 'verify'])
  assert.equal(connection.state.status, 'disconnected')
  assert.equal(connection.state.accountStored, false)
  assert.equal(connection.state.verifiedAt, null)
  report.runtime[label] = runtime
  passed(label + '.isolated-business-preload')
}
async function choose(page, path) {
  await running.evaluate(({ dialog }, selected) => { dialog.showOpenDialog = async () => ({ canceled: selected === null, filePaths: selected === null ? [] : [selected] }) }, path)
  await page.getByRole('button', { name: 'Ouvrir un projet', exact: true }).click()
}
async function state(page) { const reply = await page.evaluate(() => window.madness.readState()); assert.equal(reply.ok, true); return reply.value.state }
async function save(page, value) {
  await page.getByLabel('Brouillon pour', { exact: false }).fill(value)
  await page.getByRole('button', { name: 'Enregistrer le brouillon', exact: true }).click()
  await page.waitForFunction((text) => document.getElementById('draft-status')?.textContent === 'Brouillon enregistré localement.' && document.querySelector('textarea')?.value === text, value)
}
async function skipToMain(page) {
  await page.keyboard.press('Tab')
  assert.equal(await page.getByRole('link', { name: 'Aller au contenu', exact: true }).evaluate((element) => element === document.activeElement), true)
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => location.href), 'madness://app/index.html')
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main')
  await state(page)
}
async function projectMarkers(page) {
  return page.locator('.sidebar .project-link').evaluateAll((buttons) => buttons.map((button) => ({
    label: button.getAttribute('aria-label'), title: button.getAttribute('title'), marker: button.querySelector('.project-glyph')?.textContent
  })))
}
async function globalActions(page) {
  const header = page.locator('.app-shell > header.topbar')
  assert.equal(await header.count(), 1, 'Les commandes globales sont au-dessus des colonnes')
  assert.equal(await page.getByRole('button', { name: 'Ouvrir un projet', exact: true }).count(), 1)
  assert.equal(await header.getByRole('button', { name: 'Ouvrir un projet', exact: true }).count(), 1)
  assert.equal(await header.getByRole('button', { name: /^(Réduire|Déployer|Ouvrir) la navigation$/ }).count(), 1)
  const bounds = await header.boundingBox()
  const area = await page.evaluate(() => { const overlay = navigator.windowControlsOverlay, rect = overlay?.getTitlebarAreaRect(); return { visible: overlay?.visible ?? false, x:rect?.x, y:rect?.y, width:rect?.width, height:rect?.height, viewport:innerWidth } })
  assert.equal(area.visible, true, 'La barre partage la ligne des contrôles Windows natifs')
  assert.ok(area.width > 0 && area.width < area.viewport, 'La zone des contrôles Windows reste réservée')
  assert.equal(Math.round(bounds.x), Math.round(area.x)); assert.equal(Math.round(bounds.y), Math.round(area.y))
  assert.equal(Math.round(bounds.width), Math.round(area.width)); assert.equal(Math.round(bounds.height), Math.round(area.height))
  assert.equal(await header.evaluate(element => getComputedStyle(element).getPropertyValue('app-region')), 'drag')
  for (const button of await header.getByRole('button').all()) {
    if (!await button.isVisible()) continue
    const control = await button.boundingBox()
    assert.ok(control.x >= area.x && control.x + control.width <= area.x + area.width + 1)
    assert.ok(control.y >= area.y && control.y + control.height <= area.y + area.height + 1)
    assert.equal(await button.evaluate(element => getComputedStyle(element).getPropertyValue('app-region')), 'no-drag')
  }
}
async function main() {
  try {
    assert.equal(process.platform, 'win32')
    base = await realpath(tmpdir())
    const distance = relative(await realpath(repository), base)
    assert.ok(distance && (isAbsolute(distance) || distance === '..' || distance.startsWith('..' + sep)))
    root = await mkdtemp(join(base, 'madness-g0-'))
    const profile = join(root, 'profile'), project = join(root, 'projet-essai'), secondProject = join(root, 'projet-second')
    await mkdir(profile); await mkdir(project); await mkdir(secondProject)
    const sentinel = 'Dossier de test. Madness ne doit pas modifier ce fichier.\n'
    await writeFile(join(project, 'temoin.txt'), sentinel)
    if (!uiRegressionsOnly) await mkdir(output, { recursive: true })
    const explicit = process.argv.find(value => value.startsWith('--executable='))
    const compiled = explicit ? resolve(explicit.slice('--executable='.length)) : require('electron'), compiledArgs = explicit ? [] : [repository], packaged = join(repository, 'dist/win-unpacked/Madness.exe')
    if (!uiRegressionsOnly) await access(packaged)
    let page = await launch(compiled, compiledArgs, profile)
    await skipToMain(page)
    await globalActions(page)
    if (!uiRegressionsOnly) {
      await inspectRuntime('compiled', page)
      assert.equal((await state(page)).projects.length, 0)
      await choose(page, null)
      await page.getByRole('status').filter({ hasText: 'Ouverture annulée' }).waitFor()
      assert.equal((await state(page)).projects.length, 0)
      await assert.rejects(access(join(profile, 'madness-state-v1.json')))
      passed('cancel.no-snapshot-or-project')
    }
    await choose(page, project)
    await page.getByRole('heading', { name: 'projet-essai', exact: true }).waitFor()
    const initial = await state(page)
    assert.equal(initial.projects[0].rootPath, await realpath(project))
    await choose(page, secondProject)
    await page.getByRole('heading', { name: 'projet-second', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Ouvrir le projet projet-essai', exact: true }).first().click()
    await page.getByRole('heading', { name: 'projet-essai', exact: true }).waitFor()
    const markersBefore = await projectMarkers(page)
    assert.equal(markersBefore.length, 2)
    assert.equal(new Set(markersBefore.map((project) => project.marker)).size, 2)
    assert.deepEqual(markersBefore.map((project) => project.label), ['Ouvrir le projet projet-essai', 'Ouvrir le projet projet-second'])
    assert.ok(markersBefore.every((project) => project.title?.includes('projet-')))
    await page.evaluate(() => { window.qualificationEvents = []; window.madness.onStateChanged((event) => window.qualificationEvents.push(event)) })
    await save(page, 'Brouillon témoin G0 — conservé après redémarrage.')
    await page.getByLabel('Brouillon pour', { exact: false }).fill('Saisie conservée pendant le repli')
    await page.getByRole('button', { name: 'Réduire la navigation', exact: true }).focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(async () => (await window.madness.readState()).value.state.preferences.navigationCollapsed)
    assert.equal(await page.getByLabel('Brouillon pour', { exact: false }).inputValue(), 'Saisie conservée pendant le repli')
    assert.equal(await page.getByRole('button', { name: 'Déployer la navigation', exact: true }).evaluate((element) => element === document.activeElement), true)
    await page.getByLabel('Brouillon pour', { exact: false }).fill('Brouillon témoin G0 — conservé après redémarrage.')
    await globalActions(page)
    passed('ui.global-toolbar-single-open')
    const events = await page.evaluate(() => window.qualificationEvents)
    assert.ok(events.length >= 2 && events.every((event, index) => event.contractVersion === 1 && typeof event.correlationId === 'string' && (index === 0 || event.sequence > events[index - 1].sequence)))
    passed('events.correlated-ordered')
    passed('ui.skip-link-keyboard-keeps-ipc-and-events')
    if (uiRegressionsOnly) {
      assert.equal(await page.locator('.app-shell').evaluate((element) => element.classList.contains('nav-compact')), true)
      for (const marker of await page.locator('.sidebar .project-glyph').all()) assert.equal(await marker.isVisible(), true)
      for (const size of [{width:1320,height:860},{width:600,height:800}]) {
        await running.evaluate(({BrowserWindow},size) => BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
        await page.waitForFunction(width => innerWidth === width && navigator.windowControlsOverlay.getTitlebarAreaRect().width > 0, size.width)
        await globalActions(page)
        if (size.width > 720) {
          for (let count=0;count<2;count++) { await page.locator('.toolbar-toggle.desktop-menu').click(); await page.waitForFunction(() => document.querySelector('.toolbar-toggle.desktop-menu')?.getAttribute('aria-disabled') === 'false') }
        } else {
          await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click()
          assert.equal(await page.locator('#navigation-drawer').evaluate(element => getComputedStyle(element).getPropertyValue('app-region')),'no-drag')
          await page.getByRole('button',{name:'Fermer la navigation',exact:true}).click()
        }
        await page.getByRole('button',{name:/^Connexion Codex :/}).click()
        await page.getByRole('dialog',{name:'Connexion Codex',exact:true}).waitFor(); await page.keyboard.press('Escape')
        assert.equal(await page.getByLabel('Brouillon pour',{exact:false}).inputValue(),'Brouillon témoin G0 — conservé après redémarrage.')
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true)
      }
      passed('ui.native-titlebar-geometry-and-actions-desktop-compact')
      await stop()
      page = await launch(compiled, compiledArgs, profile)
      assert.deepEqual(await projectMarkers(page), markersBefore)
      passed('ui.same-initial-project-markers-survive-reopen')
      report.status = 'focused-ui-regressions-passed'
      return
    }
    const invalid = await page.evaluate(() => window.madness.saveDraft('missing', 'ne pas écrire'))
    assert.equal(invalid.ok, false); assert.equal(invalid.error.code, 'PROJECT_NOT_FOUND')
    const malformed = await page.evaluate(() => window.madness.setNavigation('invalid'))
    assert.equal(malformed.ok, false); assert.equal(malformed.error.code, 'INVALID_COMMAND')
    passed('ipc.invalid-payload-and-scope-rejected')
    const foreignCaller = await running.evaluate(async ({ BrowserWindow }, preloadPath) => {
      const other = new BrowserWindow({ show: false, webPreferences: { preload: preloadPath, sandbox: true, contextIsolation: true, nodeIntegration: false } })
      try {
        await other.loadURL('madness://app/index.html')
        return await other.webContents.executeJavaScript('(async () => { try { return await window.madness.chooseDirectory() } catch (error) { return { diagnostic: String(error), bridge: typeof window.madness } } })()')
      } finally { other.destroy() }
    }, join(repository, 'out/preload/index.js'))
    assert.equal(foreignCaller.ok, false, JSON.stringify(foreignCaller)); assert.equal(foreignCaller.error.code, 'UNTRUSTED_CALLER')
    passed('ipc.foreign-window-rejected-before-dialog')
    assert.equal((await state(page)).capabilities.codex.available, false)
    await stop()
    page = await launch(compiled, compiledArgs, profile)
    assert.equal((await state(page)).drafts[0].text, 'Brouillon témoin G0 — conservé après redémarrage.')
    assert.equal((await state(page)).preferences.navigationCollapsed, true)
    assert.deepEqual(await projectMarkers(page), markersBefore)
    passed('ui.same-initial-project-markers-survive-reopen')
    passed('compiled.reopen-context-draft-preference')
    await stop()
    page = await launch(packaged, [], profile)
    await inspectRuntime('packaged', page)
    await globalActions(page)
    assert.equal(report.runtime.packaged.packaged, true)
    assert.equal((await state(page)).drafts[0].text, 'Brouillon témoin G0 — conservé après redémarrage.')
    await save(page, 'Brouillon du paquet Windows — écriture par le vrai preload.')
    // Navigation et redimensionnement conservent aussi la saisie non enregistrée.
    await page.getByLabel('Brouillon pour', { exact: false }).fill('Saisie locale non enregistrée')
    await page.getByRole('button', { name: 'Accueil', exact: true }).first().click()
    await globalActions(page)
    await page.getByRole('button', { name: 'Ouvrir le projet projet-essai', exact: true }).first().click()
    assert.equal(await page.getByLabel('Brouillon pour', { exact: false }).inputValue(), 'Saisie locale non enregistrée')
    await page.getByLabel('Brouillon pour', { exact: false }).fill('Brouillon du paquet Windows — écriture par le vrai preload.')
    const widths = [{ width: 1320, height: 860, name: 'desktop' }, { width: 600, height: 800, name: 'compact' }]
    for (const size of widths) {
      await running.evaluate(({ BrowserWindow }, bounds) => BrowserWindow.getAllWindows()[0].setContentSize(bounds.width, bounds.height), size)
      if (size.name === 'compact') {
        await page.getByRole('button', { name: 'Ouvrir la navigation', exact: true }).click()
        await page.getByRole('dialog').waitFor()
        await page.keyboard.press('Escape')
        assert.equal(await page.getByRole('button', { name: 'Ouvrir la navigation', exact: true }).evaluate((element) => element === document.activeElement), true)
      }
      await globalActions(page)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.mouse.move(size.width - 30, 20)
      await page.keyboard.press('Escape')
      const file = 'packaged-' + size.name + '.png'
      if (!skipScreenshots) await page.screenshot({ path: join(output, file) })
      else await access(join(output, file))
      report.screenshots.push(file)
    }
    passed('ui.navigation-draft-focus-and-responsive')
    const snapshotPath = join(profile, 'madness-state-v1.json'), before = await readFile(snapshotPath, 'utf8')
    await writeFile(snapshotPath, '{"schemaVersion":999}')
    await page.getByLabel('Brouillon pour', { exact: false }).fill('Saisie gardée après erreur')
    await page.getByRole('button', { name: 'Enregistrer le brouillon', exact: true }).click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.getByLabel('Brouillon pour', { exact: false }).inputValue(), 'Saisie gardée après erreur')
    assert.equal(await readFile(snapshotPath, 'utf8'), '{"schemaVersion":999}')
    passed('packaged.future-schema-kept-and-input-retained')
    await stop()
    // La réparation est propre à cette fixture du banc, jamais un comportement produit.
    await writeFile(snapshotPath, before)
    page = await launch(packaged, [], profile)
    const restored = await state(page)
    assert.equal(restored.drafts[0].text, 'Brouillon du paquet Windows — écriture par le vrai preload.')
    assert.equal(restored.preferences.navigationCollapsed, true)
    assert.deepEqual(restored.conversations, [])
    passed('packaged.reopen-without-provider')
    assert.deepEqual(await readdir(project), ['temoin.txt'])
    assert.equal(hash(await readFile(join(project, 'temoin.txt'))), hash(sentinel))
    passed('project.unchanged')
    report.snapshot = { schemaVersion: restored.schemaVersion, revision: restored.revision, projectCount: restored.projects.length, draftCount: restored.drafts.length, navigationCollapsed: restored.preferences.navigationCollapsed, textMatchesExpected: true, pathsRedacted: true }
    await access(join(repository, `dist/Madness-${releaseVersion}-x64-setup.exe`))
    passed('installer.built-not-installed')
    report.buildInputs = await buildInputsDigest()
    report.captureMode = skipScreenshots ? 'existing-files-not-recaptured' : 'captured-this-run'
    report.artifacts = []
    for (const file of [`Madness-${releaseVersion}-x64-setup.exe`, 'win-unpacked/Madness.exe', 'win-unpacked/resources/app.asar']) {
      const bytes = await readFile(join(repository, 'dist', file))
      report.artifacts.push({ file, bytes: bytes.byteLength, sha256: hash(bytes) })
    }
    report.status = 'local-technical-checks-passed'
  } catch (error) {
    report.failureCode = error?.code === 'ENOENT' ? 'artifact-missing' : 'check-failed'
    // Sortie diagnostique bornée : le profil sauvegardé ne contient ni chemins ni texte natif.
    console.error('Échec du contrôle :', error instanceof Error ? error.message.slice(0, 600) : 'unknown')
    process.exitCode = 1
  } finally {
    try { await stop() } catch { report.failureCode = 'owned-process-stop-unconfirmed'; process.exitCode = 1 }
    if (root && !running) { try { await cleanWorkspace(root, base); report.cleanup = true } catch { report.failureCode = 'cleanup-failed'; process.exitCode = 1 } }
    if (!report.cleanup) report.status = 'partial'
    if (!uiRegressionsOnly) {
      await mkdir(output, { recursive: true })
      await writeFile(join(output, 'profile.json'), JSON.stringify(report, null, 2) + '\n')
    }
    console.log(`G0 : ${report.status} ; contrôles : ${Object.keys(report.checks).length} ; nettoyage : ${report.cleanup}.`)
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
