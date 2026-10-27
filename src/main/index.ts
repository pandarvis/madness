import {ApprovalStore} from '../adapters/persistence/approval-store.ts'
import { app, BrowserWindow, clipboard, dialog, ipcMain, nativeTheme, protocol, net, session, Menu, safeStorage, shell } from 'electron'
import { realpath, stat, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { basename, isAbsolute, join, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Application } from '../core/application.ts'
import { JsonStore } from '../adapters/persistence/json-store.ts'
import { COMMAND_CHANNEL, EVENT_CHANNEL, failure, isCommand, emptyContext } from '../contracts/index.ts'
import { CONNECTION_COMMAND_CHANNEL, CONNECTION_EVENT_CHANNEL, PUBLIC_KEYS_URL, initialConnectionState, isConnectionCommand, isConnectionState } from '../contracts/connection.ts'
import { DialogueCoordinator } from '../core/dialogue.ts'
import { qualifyBmadProfile, resolveBmad } from '../adapters/bmad/profile.ts'
import { openCodexDialogue } from '../adapters/codex/dialogue.ts'
import { DIALOGUE_COMMAND_CHANNEL, DIALOGUE_EVENT_CHANNEL, initialDialogueState, isDialogueCommand, isDialogueState } from '../contracts/dialogue.ts'
import { CodexVault } from '../adapters/codex/vault.ts'
import { CodexConnection } from '../adapters/codex/connection.ts'
import { authorize, createTransport, refreshCredentials } from '../adapters/codex/oauth.ts'
import { probeCodex } from '../adapters/codex/probe.ts'
import { isTrustedCaller } from './boundary.ts'
import { AppearanceStore } from '../adapters/persistence/appearance-store.ts'
import { WorkflowStore } from '../adapters/persistence/workflow-store.ts'
import {QuestionStore} from '../adapters/persistence/question-store.ts'
import { qualifyForge } from '../adapters/bmad/forge.ts'
import { APPEARANCE_CHANNEL, isAppearanceCommand } from '../contracts/appearance.ts'
import type { AppearanceState, AppearanceReply, Theme } from '../contracts/appearance.ts'

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
let connection: CodexConnection | null = null
let dialogueCoordinator: DialogueCoordinator | null = null
let readyToQuit = false
let appearanceClosing = false

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
    const appearanceStore = new AppearanceStore(join(app.getPath('userData'), 'appearance-v1.json'))
    let appearance = await appearanceStore.restore()
    let appearanceQueue: Promise<unknown> = Promise.resolve()
    const nativeColors = (theme: Theme): { color: string; symbolColor: string; height: number } => ({ color: theme === 'dark' ? '#211F1E' : '#FFFFFF', symbolColor: theme === 'dark' ? '#F1EBE6' : '#29282E', height: 56 })
    nativeTheme.themeSource = appearance.theme
    application.lifecycle.register({ id: 'appearance', context: emptyContext(), stop: async () => { await appearanceQueue; return 'stopped' } })
    ipcMain.handle(APPEARANCE_CHANNEL, (event, input: unknown): Promise<AppearanceReply> | AppearanceReply => {
      const rejected = (error: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND' | 'APP_CLOSING'): AppearanceReply => ({ contractVersion: 1, correlationId: 'rejected-request', ok: false, error, state: appearance })
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return rejected('UNTRUSTED_CALLER')
      if (!isAppearanceCommand(input)) return rejected('INVALID_COMMAND')
      if (appearanceClosing) return rejected('APP_CLOSING')
      const result = appearanceQueue.then(async (): Promise<AppearanceReply> => {
        // La lecture partage la file des changements, sans relire le fichier ni réappliquer l’amorce.
        if ('theme' in input) {
          const next: AppearanceState = await appearanceStore.save(input.theme)
          appearance = next
          nativeTheme.themeSource = next.theme
          if (window && !window.isDestroyed()) { window.setBackgroundColor(nativeColors(next.theme).color); window.setTitleBarOverlay(nativeColors(next.theme)) }
        }
        return { contractVersion: 1, correlationId: input.correlationId, ok: true, state: appearance }
      })
      appearanceQueue = result.catch(() => undefined)
      return result
    })
    const connectionRoot = join(app.getPath('userData'), 'codex-connection-v1')
    const vault = new CodexVault(connectionRoot, {
      isEncryptionAvailable: () => process.platform === 'win32' && safeStorage.isEncryptionAvailable(),
      encryptString: (value) => safeStorage.encryptString(value),
      decryptString: (value) => safeStorage.decryptString(value)
    })
    const transport = createTransport(net.fetch.bind(net) as typeof fetch)
    connection = new CodexConnection({
      vault,
      oauth: (options) => authorize({ ...options, transport, openExternal: (url) => shell.openExternal(url), saveClientId: (value) => vault.saveClientId(value) }),
      refresh: (value, signal) => refreshCredentials(value, { signal, transport }),
      probe: (value, signal) => probeCodex(value, signal, { root: join(connectionRoot, 'probes'), appData: app.getPath('appData'), repository: app.getAppPath(), environment: process.env }),
      now: () => new Date(),
      openUsage: () => shell.openExternal('https://chatgpt.com/settings/usage'),
      openPublicKeys: () => shell.openExternal(PUBLIC_KEYS_URL),
      copyPublicKeys: async () => { clipboard.writeText(PUBLIC_KEYS_URL) }
    })
    application.lifecycle.register({ id: 'codex-connection', context: { ...emptyContext(), providerId: 'codex' }, stop: () => connection!.shutdown() })
    dialogueCoordinator = new DialogueCoordinator({
      application,
      workflows:new WorkflowStore(join(app.getPath('userData'),'workflows-v1')),
      approvals:new ApprovalStore(join(app.getPath('userData'),'approvals-v1')),
      questions:new QuestionStore(join(app.getPath('userData'),'questions-v1')),
      copyText:async text=>{await clipboard.writeText(text);if(await clipboard.readText()!==text)throw Error('COPY_FAILED')},
      qualifyForge:(root,signal)=>qualifyForge(root,signal,app.isPackaged?join(process.resourcesPath,'bmad-script-runner.py'):join(app.getAppPath(),'resources/bmad-script-runner.py')),
      qualify: async (root, signal) => {
        const profile = await qualifyBmadProfile(root)
        await resolveBmad(profile, 'agent', signal); await resolveBmad(profile, 'config', signal)
        return profile
      },
      open: (profile, signal, activity) => openCodexDialogue(profile, signal, activity, connection!, { root: join(connectionRoot, 'dialogues'), appData: app.getPath('appData'), repository: app.getAppPath(),dataRoot:app.getPath('userData'), environment: process.env, runner:app.isPackaged?join(process.resourcesPath,'bmad-script-runner.py'):join(app.getAppPath(),'resources/bmad-script-runner.py') })
    })
    application.lifecycle.register({ id: 'bmad-dialogue', context: { ...emptyContext(), providerId: 'codex' }, stop: () => dialogueCoordinator!.shutdown() })
    ipcMain.handle(DIALOGUE_COMMAND_CHANNEL, async (event, input: unknown) => {
      const rejected = (code: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND') => ({ contractVersion: 1, correlationId: 'rejected-request', state: { ...initialDialogueState(), status: 'error', errorCode: code } })
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return rejected('UNTRUSTED_CALLER')
      if (!isDialogueCommand(input)) return rejected('INVALID_COMMAND')
      const state = await dialogueCoordinator!.execute(input)
      if (!isDialogueState(state)) return rejected('INVALID_COMMAND')
      return { contractVersion: 1, correlationId: input.correlationId, state }
    })
    dialogueCoordinator.subscribe((state) => { if (isDialogueState(state) && window && !window.isDestroyed() && window.webContents.mainFrame.url === rendererUrl) window.webContents.send(DIALOGUE_EVENT_CHANNEL, state) })
    ipcMain.handle(CONNECTION_COMMAND_CHANNEL, async (event, input: unknown) => {
      const rejected = (code: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND') => ({ contractVersion: 1, correlationId: 'rejected-request', state: { ...initialConnectionState(), status: 'error', errorCode: code } })
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return rejected('UNTRUSTED_CALLER')
      if (!isConnectionCommand(input)) return rejected('INVALID_COMMAND')
      const state = await connection!.command(input.action)
      if (!isConnectionState(state)) return rejected('INVALID_COMMAND')
      return { contractVersion: 1, correlationId: input.correlationId, state }
    })
    connection.subscribe((state) => {
      if (isConnectionState(state) && window && !window.isDestroyed() && window.webContents.mainFrame.url === rendererUrl) window.webContents.send(CONNECTION_EVENT_CHANNEL, state)
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
      title: 'Madness', backgroundColor: nativeColors(appearance.theme).color, autoHideMenuBar: true,
      titleBarStyle: 'hidden', titleBarOverlay: nativeColors(appearance.theme),
      webPreferences: { preload: join(__dirname, '../preload/index.js'), additionalArguments: ['--madness-theme=' + appearance.theme, '--madness-appearance-warning=' + (appearance.warning ?? 'none')], contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, allowRunningInsecureContent: false, webviewTag: false, spellcheck: false }
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
    appearanceClosing = true
    void (application?.shutdown() ?? Promise.resolve()).finally(() => { readyToQuit = true; app.quit() })
  })
  app.on('window-all-closed', () => app.quit())
}
