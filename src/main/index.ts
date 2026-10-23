import { app, BrowserWindow, dialog, ipcMain, protocol, net, session, Menu } from 'electron'
import { realpath, stat, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { basename, isAbsolute, join, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Application } from '../core/application.ts'
import { JsonStore } from '../adapters/persistence/json-store.ts'
import { COMMAND_CHANNEL, EVENT_CHANNEL, failure, isCommand } from '../contracts/index.ts'
import { isTrustedCaller } from './boundary.ts'

protocol.registerSchemesAsPrivileged([{ scheme: 'madness', privileges: { standard: true, secure: true, supportFetchAPI: true } }])
// Profils de développement/qualification isolés ; aucune lecture du profil usuel si défini.
if (process.env.MADNESS_DATA_HOME) {
  if (!isAbsolute(process.env.MADNESS_DATA_HOME)) throw new Error('DATA_HOME_MUST_BE_ABSOLUTE')
  app.setPath('userData', process.env.MADNESS_DATA_HOME)
  app.setPath('sessionData', join(process.env.MADNESS_DATA_HOME, 'chromium'))
}
const requestedDevUrl = !app.isPackaged ? process.env.ELECTRON_RENDERER_URL : undefined
const devUrl = ['http://127.0.0.1:5173', 'http://127.0.0.1:5173/'].includes(requestedDevUrl ?? '') ? 'http://127.0.0.1:5173/' : undefined
const devNonce = devUrl && /^[a-f0-9]{32}$/.test(process.env.MADNESS_DEV_CSP_NONCE ?? '') ? process.env.MADNESS_DEV_CSP_NONCE : undefined
const rendererUrl = devUrl ?? 'madness://app/index.html'
let window: BrowserWindow | null = null
let application: Application | null = null
let readyToQuit = false

if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => { window?.restore(); window?.focus() })
  app.whenReady().then(async () => {
    app.setAppUserModelId('fr.madness.desktop')
    Menu.setApplicationMenu(null)
    const rendererRoot = resolve(__dirname, '../renderer')
    protocol.handle('madness', async (request) => {
      try {
        const url = new URL(request.url)
        const pathname = decodeURIComponent(url.pathname)
        if (request.method !== 'GET' || url.hostname !== 'app' || url.port || url.search || url.hash || pathname.includes('\\') || pathname.includes('\0')) return new Response(null, { status: 403 })
        const file = resolve(rendererRoot, '.' + pathname)
        if (!file.startsWith(rendererRoot + sep) || !['.html', '.js', '.css', '.svg', '.png'].some((extension) => file.endsWith(extension))) return new Response(null, { status: 403 })
        return await net.fetch(pathToFileURL(file).href)
      } catch { return new Response(null, { status: 404 }) }
    })
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false))
    session.defaultSession.setPermissionCheckHandler(() => false)
    session.defaultSession.on('will-download', (event) => event.preventDefault())
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const connect = devUrl ? "'self' ws://127.0.0.1:5173" : "'none'"
      const scriptsAndStyles = devNonce ? `'self' 'nonce-${devNonce}'` : "'self'"
      callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [`default-src 'none'; script-src ${scriptsAndStyles}; style-src ${scriptsAndStyles}; img-src 'self'; font-src 'self'; connect-src ${connect}; base-uri 'none'; form-action 'none'; frame-src 'none'; object-src 'none'`] } })
    })
    application = new Application({
      store: new JsonStore(join(app.getPath('userData'), 'madness-state-v1.json')),
      newId: randomUUID,
      now: () => new Date().toISOString(),
      chooseDirectory: async () => {
        if (!window) return null
        const chosen = await dialog.showOpenDialog(window, { title: 'Ouvrir un projet', properties: ['openDirectory', 'dontAddToRecent'] })
        if (chosen.canceled || chosen.filePaths.length !== 1) return null
        const rootPath = await realpath(chosen.filePaths[0])
        if (!(await stat(rootPath)).isDirectory()) throw new Error('DIRECTORY_UNAVAILABLE')
        await access(rootPath, constants.R_OK)
        return { rootPath, name: basename(rootPath) || rootPath }
      }
    })
    ipcMain.handle(COMMAND_CHANNEL, async (event, input: unknown) => {
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return failure('UNTRUSTED_CALLER', 'untrusted-request')
      if (!isCommand(input)) return failure('INVALID_COMMAND', 'invalid-request')
      return application!.execute(input)
    })
    application.subscribe((event) => {
      if (window && !window.isDestroyed() && window.webContents.mainFrame.url === rendererUrl) window.webContents.send(EVENT_CHANNEL, event)
    })
    window = new BrowserWindow({
      width: 1320, height: 860, minWidth: 520, minHeight: 520, show: false,
      title: 'Madness', backgroundColor: '#FFFFFF', autoHideMenuBar: true,
      webPreferences: { preload: join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, allowRunningInsecureContent: false, webviewTag: false, spellcheck: false }
    })
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    window.webContents.on('will-navigate', (event) => event.preventDefault())
    window.webContents.on('will-redirect', (event) => event.preventDefault())
    window.webContents.on('will-attach-webview', (event) => event.preventDefault())
    window.once('ready-to-show', () => window?.show())
    window.on('closed', () => { window = null })
    await window.loadURL(rendererUrl)
  }).catch(() => {
    dialog.showErrorBox('Madness ne peut pas démarrer', 'Le socle local est indisponible. Réessayez après avoir vérifié les fichiers du programme. Vos données n’ont pas été réinitialisées.')
    readyToQuit = true
    app.quit()
  })
  app.on('before-quit', (event) => {
    if (readyToQuit) return
    event.preventDefault()
    void (application?.shutdown() ?? Promise.resolve()).finally(() => { readyToQuit = true; app.quit() })
  })
  app.on('window-all-closed', () => app.quit())
}
