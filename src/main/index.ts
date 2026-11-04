import {BmadCatalogLaunchCoordinator,withCatalogQualification} from '../core/bmad-catalog-launch.ts'
import {BmadCatalogLaunchStore} from '../adapters/persistence/bmad-catalog-launch-store.ts'
import {CATALOG_LAUNCH_COMMAND_CHANNEL,CATALOG_LAUNCH_EVENT_CHANNEL,isCatalogLaunchCommand,isCatalogLaunchState,initialCatalogLaunchState} from '../contracts/bmad-catalog-launch.ts'
import {GraphifyAdapter} from '../adapters/analysis/graphify.ts'
import {GraphOwnedRun} from '../adapters/analysis/graph-owned-run.ts'
import {GraphStore} from '../adapters/persistence/graph-store.ts'
import {GraphCoordinator,graphAdmissionGuard} from '../core/graph-coordinator.ts'
import {GRAPH_COMMAND_CHANNEL,GRAPH_EVENT_CHANNEL,isGraphCommand,isGraphWorkspace,initialGraphWorkspace} from '../contracts/bmad-graph.ts'
import {ProjectFilesCoordinator} from '../core/project-files.ts'
import {PROJECT_FILES_COMMAND_CHANNEL,PROJECT_FILES_EVENT_CHANNEL,isProjectFilesCommand,isProjectFilesState,initialProjectFilesState} from '../contracts/project-files.ts'
import {BmadCatalogAdapter} from '../adapters/bmad/catalog.ts'
import {BmadCatalogCoordinator} from '../core/bmad-catalog.ts'
import {BMAD_CATALOG_COMMAND_CHANNEL,BMAD_CATALOG_EVENT_CHANNEL,isBmadCatalogCommand,isBmadCatalogState,initialBmadCatalogState} from '../contracts/bmad-catalog.ts'
import {BmadChangeObserver} from '../adapters/bmad/change-observer.ts'
import {BmadContextAdapter} from '../adapters/bmad/context.ts'
import {BmadProgressAdapter} from '../adapters/bmad/progress.ts'
import {BmadProgressCoordinator} from '../core/bmad-progress.ts'
import {BMAD_PROGRESS_COMMAND_CHANNEL,BMAD_PROGRESS_EVENT_CHANNEL,isBmadProgressCommand,isBmadProgressState,initialBmadProgressState} from '../contracts/bmad-progress.ts'
import {BmadContextStore} from '../adapters/persistence/bmad-context-store.ts'
import {BmadContextCoordinator} from '../core/bmad-context.ts'
import {BMAD_CONTEXT_COMMAND_CHANNEL,BMAD_CONTEXT_EVENT_CHANNEL,isBmadContextCommand,isBmadContextState,initialBmadContextState} from '../contracts/bmad-context.ts'
import {BmadHelpAdapter} from '../adapters/bmad/help.ts'
import {HelpOwnedRun} from '../adapters/bmad/help-owned-run.ts'
import {BmadHelpStore} from '../adapters/persistence/bmad-help-store.ts'
import {BmadHelpCoordinator} from '../core/bmad-help.ts'
import {ActivityAdmission} from '../core/lifecycle.ts'
import {HELP_COMMAND_CHANNEL,HELP_EVENT_CHANNEL,isHelpCommand,isHelpState,initialHelpState} from '../contracts/bmad-help.ts'
import {ApprovalStore} from '../adapters/persistence/approval-store.ts'
import {RecoveryStore} from '../adapters/persistence/recovery-store.ts'
import {OwnedRun} from '../adapters/codex/owned-run.ts'
import {inspectApprovalFiles} from '../adapters/codex/file-proposals.ts'
import { app, BrowserWindow, clipboard, dialog, ipcMain, nativeTheme, protocol, net, session, Menu, safeStorage, shell } from 'electron'
import { realpath, stat, access, mkdir } from 'node:fs/promises'
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
import { authorize, createTransport, refreshCredentials,checkPublicKeysAccess } from '../adapters/codex/oauth.ts'
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
        if (!file.startsWith(rendererRoot + sep) || !['.html', '.js', '.css', '.svg', '.png', '.ttf'].some((extension) => file.endsWith(extension))) return new Response(null, { status: 403 })
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
    const nativeColors = (theme: Theme): { color: string; symbolColor: string; height: number } => ({ color: theme === 'dark' ? '#20343C' : '#E8DDC8', symbolColor: theme === 'dark' ? '#F1EBE6' : '#24211E', height: 56 })
    const nativeCaptionColors = (theme: Theme): { color: string; symbolColor: string; height: number } => ({ ...nativeColors(theme), color: nativeTheme.shouldUseHighContrastColors ? nativeColors(theme).color : '#00000000' })
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
          if (window && !window.isDestroyed()) { window.setBackgroundColor(nativeColors(next.theme).color); window.setTitleBarOverlay(nativeCaptionColors(next.theme)) }
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
    await mkdir(app.getPath('userData'),{recursive:true})
    const ownedRun=new OwnedRun(new RecoveryStore(join(app.getPath('userData'),'codex-owned-run-v1.json')))
    // This owner is distinct from Codex/help; an unidentified lost batch stays unknown.
    const qualificationOwner=new OwnedRun(new RecoveryStore(join(app.getPath('userData'),'bmad-qualification-owned-v1.json')))
    let catalogQualification:BmadCatalogLaunchCoordinator|null=null
    const helperOwner=new HelpOwnedRun(join(app.getPath('userData'),'bmad-help-owned-v1.json'))
    const admission=new ActivityAdmission()
    const graphOwner=new GraphOwnedRun(join(app.getPath('userData'),'graph-owned-v1.json'))
    const recovery={status:async():Promise<'stopped'|'unknown'>=>{try{return (await Promise.all([ownedRun.status(),helperOwner.status(),graphOwner.status(),qualificationOwner.status()])).every(s=>s==='stopped')?'stopped':'unknown'}catch{return 'unknown'}},observeStop:async():Promise<'stopped'|'unknown'>=>{await catalogQualification?.stopQualification();await Promise.all([helperOwner.cancel().catch(()=>{}),graphOwner.cancel().catch(()=>{})]);const states=await Promise.all([ownedRun.observeStop(),helperOwner.observeStop(),graphOwner.observeStop(),qualificationOwner.observeStop()]);if(states.every(s=>s==='stopped')){await graphCoordinator.reconcileNativeStop(await graphOwner.stopProof());admission.clearBlock();return 'stopped'}return 'unknown'}}
    if(await recovery.status()!=='stopped')admission.block()
    const graphAdapter=new GraphifyAdapter({root:join(app.getPath('userData'),'graph-runs-v1'),resources:app.isPackaged?join(process.resourcesPath,'graphify'):join(app.getAppPath(),'resources/graphify'),owner:graphOwner,admission,admit:async()=>{if(connection?.hasOperation())throw Error('BUSY');if(await recovery.status()!=='stopped'){admission.block();throw Error('STOP_UNCONFIRMED')}},onUnknown:()=>{admission.block();dialogueCoordinator?.markRecoveryUnknown();connection?.markRecoveryUnknown()}})
    const helpAdapter=new BmadHelpAdapter({root:join(app.getPath('userData'),'bmad-help-runs-v1'),resources:app.isPackaged?join(process.resourcesPath,'bmad-help'):join(app.getAppPath(),'resources/bmad-help'),owner:helperOwner,admission,onUnknown:()=>{admission.block();dialogueCoordinator?.markRecoveryUnknown();connection?.markRecoveryUnknown()},admit:async internal=>{
      if(await graphOwner.status()!=='stopped'){admission.block();throw Object.assign(Error('STOP_UNCONFIRMED'),{code:'STOP_UNCONFIRMED'})}
      if(connection?.hasOperation()&&!(internal&&connection.hasDialogueLease()&&await ownedRun.healthyActive()))throw Object.assign(new Error('BUSY'),{code:'BUSY'})
      if(await ownedRun.status()!=='stopped'&&!(internal&&connection?.hasDialogueLease()&&await ownedRun.healthyActive()))throw Object.assign(new Error('STOP_UNCONFIRMED'),{code:'STOP_UNCONFIRMED'})
    }})
    const observation=new BmadChangeObserver(value=>helpAdapter.dependencies(value))
    application.lifecycle.register({id:'bmad-observation',context:emptyContext(),stop:async()=>{observation.shutdown();return 'stopped'}})
    const helpCoordinator=new BmadHelpCoordinator({observation,application,store:new BmadHelpStore(join(app.getPath('userData'),'bmad-help-v1')),prepare:(id,root,signal)=>helpAdapter.prepare(id,root,signal),profile:(id,signal)=>helpAdapter.profile(id,signal),copy:async value=>{await clipboard.writeText(value);if(await clipboard.readText()!==value)throw Error('COPY_FAILED')}})
    application.lifecycle.register({id:'bmad-help',context:emptyContext(),stop:async()=>{await helpCoordinator.shutdown();return helpAdapter.shutdown()}})
    ipcMain.handle(HELP_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isHelpCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:{...initialHelpState(),error:'INVALID_COMMAND'}}
      const state=await helpCoordinator.execute(input)
      if(!isHelpState(state))throw Error('INVALID_HELP_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    helpCoordinator.subscribe(state=>{if(isHelpState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(HELP_EVENT_CHANNEL,state)})
    const contextAdapter=new BmadContextAdapter(helpAdapter)
    const contextCoordinator=new BmadContextCoordinator({application,observation,projectIds:async()=>{if(!application)throw Error('APP_CLOSING');const reply=await application.execute({contractVersion:1,correlationId:'bmad-context-restore',type:'read-state'});if(!reply.ok)throw Error(reply.error.code);return reply.value.state.projects.map(project=>project.id)},observeConsultation:(id,root,signal)=>contextAdapter.consult(id,root,signal),store:new BmadContextStore(join(app.getPath('userData'),'bmad-context-v1')),observe:(id,root,signal)=>contextAdapter.observe(id,root,signal),observeConfiguration:(id,root,signal)=>contextAdapter.observeConfiguration(id,root,signal)})
    application.lifecycle.register({id:'bmad-context',context:emptyContext(),stop:async()=>{await contextCoordinator.shutdown();return 'stopped'}})
    ipcMain.handle(BMAD_CONTEXT_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isBmadContextCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialBmadContextState()}
      const state=await contextCoordinator.execute(input)
      if(!isBmadContextState(state))throw Error('INVALID_CONTEXT_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    contextCoordinator.subscribe(state=>{if(isBmadContextState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(BMAD_CONTEXT_EVENT_CHANNEL,state)})
    const projectFiles=new ProjectFilesCoordinator({application,authority:value=>graphAdapter.filesAuthority(value)??helpAdapter.filesAuthority(value),clipboard,admission,editor:uri=>shell.openExternal(uri)})
    application.lifecycle.register({id:'project-files',context:emptyContext(),stop:async()=>{await projectFiles.shutdown();return 'stopped'}})
    ipcMain.handle(PROJECT_FILES_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isProjectFilesCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialProjectFilesState()}
      const state=await projectFiles.execute(input)
      if(!isProjectFilesState(state))throw Error('INVALID_FILES_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    projectFiles.subscribe(state=>{if(isProjectFilesState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(PROJECT_FILES_EVENT_CHANNEL,state)})
    const graphCoordinator=new GraphCoordinator({application,runtime:graphAdapter,store:new GraphStore(join(app.getPath('userData'),'graph-state-v1')),files:projectFiles,guard:()=>graphAdmissionGuard(admission,recovery,connection?.hasOperation()??false)})
    application.lifecycle.register({id:'graph',context:emptyContext(),stop:()=>graphCoordinator.shutdown()})
    ipcMain.handle(GRAPH_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isGraphCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialGraphWorkspace()}
      const state=await graphCoordinator.execute(input);if(!isGraphWorkspace(state))throw Error('INVALID_GRAPH_STATE');return {contractVersion:1,correlationId:input.correlationId,state}
    })
    graphCoordinator.subscribe(state=>{if(isGraphWorkspace(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(GRAPH_EVENT_CHANNEL,state)})
    const progressAdapter=new BmadProgressAdapter(helpAdapter)
    const progressCoordinator=new BmadProgressCoordinator({application,observation,files:projectFiles,available:fn=>admission.subscribeAvailable(fn),contexts:contextCoordinator,collect:(id,root,selection,observation,signal)=>progressAdapter.collect(id,root,selection,observation,signal)})
    application.lifecycle.register({id:'bmad-progress',context:emptyContext(),stop:async()=>{await progressCoordinator.shutdown();return 'stopped'}})
    ipcMain.handle(BMAD_PROGRESS_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isBmadProgressCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialBmadProgressState()}
      const state=await progressCoordinator.execute(input)
      if(!isBmadProgressState(state))throw Error('INVALID_PROGRESS_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    progressCoordinator.subscribe(state=>{if(isBmadProgressState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(BMAD_PROGRESS_EVENT_CHANNEL,state)})
    const catalogAdapter=new BmadCatalogAdapter(helpAdapter)
    const catalogCoordinator=new BmadCatalogCoordinator({application,observation,files:projectFiles,available:fn=>admission.subscribeAvailable(fn),collect:(id,root,signal)=>catalogAdapter.collect(id,root,signal),clipboard})
    application.lifecycle.register({id:'bmad-catalog',context:emptyContext(),stop:async()=>{await catalogCoordinator.shutdown();return 'stopped'}})
    ipcMain.handle(BMAD_CATALOG_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isBmadCatalogCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialBmadCatalogState()}
      const state=await catalogCoordinator.execute(input)
      if(!isBmadCatalogState(state))throw Error('INVALID_CATALOG_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    catalogCoordinator.subscribe(state=>{if(isBmadCatalogState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(BMAD_CATALOG_EVENT_CHANNEL,state)})
    connection = new CodexConnection({
      admission,
      recovery,
      vault,
      oauth: (options) => authorize({ ...options, transport, openExternal: (url) => shell.openExternal(url), saveClientId: (value) => vault.saveClientId(value) }),
      refresh: (value, signal) => refreshCredentials(value, { signal, transport }),
      probe: (value, signal) => probeCodex(value, signal, { root: join(connectionRoot, 'probes'),ownedRun, appData: app.getPath('appData'), repository: app.getAppPath(), environment: process.env }),
      now: () => new Date(),
      openUsage: () => shell.openExternal('https://chatgpt.com/settings/usage'),
      openPublicKeys: () => shell.openExternal(PUBLIC_KEYS_URL),
      copyPublicKeys: async () => { await clipboard.writeText(PUBLIC_KEYS_URL);if(await clipboard.readText()!==PUBLIC_KEYS_URL)throw Error('COPY_FAILED') },
      checkPublicKeys:signal=>checkPublicKeysAccess(transport,signal)
    })
    application.lifecycle.register({ id: 'codex-connection', context: { ...emptyContext(), providerId: 'codex' }, stop: () => connection!.shutdown() })

    const qualifyMary=async(root:string,signal:AbortSignal)=>{const profile=await qualifyBmadProfile(root);await resolveBmad(profile,'agent',signal);await resolveBmad(profile,'config',signal);return profile}
    const qualifyNativeForge=(root:string,signal:AbortSignal)=>qualifyForge(root,signal,app.isPackaged?join(process.resourcesPath,'bmad-script-runner.py'):join(app.getAppPath(),'resources/bmad-script-runner.py'))
    const ownQualification=<T>(work:()=>Promise<T>):Promise<T>=>withCatalogQualification(admission,async()=>{if(connection?.hasOperation())throw Object.assign(Error('BUSY'),{code:'BUSY'});if(await recovery.status()!=='stopped')throw Object.assign(Error('STOP_UNCONFIRMED'),{code:'STOP_UNCONFIRMED'})},work,{owner:qualificationOwner,onUnknown:()=>{admission.block();dialogueCoordinator?.markRecoveryUnknown();connection?.markRecoveryUnknown()}})
    const catalogLaunch=new BmadCatalogLaunchCoordinator({catalog:catalogCoordinator,contexts:contextCoordinator,connectionIdentity:()=>connection!.catalogueIdentity(),store:new BmadCatalogLaunchStore(join(app.getPath('userData'),'catalog-launch-v1')),qualify:async(family,projectId,root,signal,previous)=>{
      if(connection?.hasOperation())throw Object.assign(Error('BUSY'),{code:'BUSY'})
      if(await recovery.status()!=='stopped')throw Object.assign(Error('STOP_UNCONFIRMED'),{code:'STOP_UNCONFIRMED'})
      if(family==='help'){
        if(!previous){await helpCoordinator.execute({contractVersion:1,correlationId:'catalog-help-prepare',type:'prepare',projectId});await helpCoordinator.settled()}
        const profile=await helpCoordinator.profile(projectId,signal),bundle=helpCoordinator.read().bundle
        if(!bundle||previous?.help?.bundleId&&previous.help.bundleId!==profile.help?.bundleId)throw Object.assign(Error('PROFILE_CHANGED'),{code:'PROFILE_CHANGED'})
        await helpAdapter.assertFresh(profile.help!.bundleId,signal)
        const source=bundle.sources.find(s=>s.snapshot===profile.skillPath)
        if(!source)throw Object.assign(Error('PROFILE_UNRECOGNIZED'),{code:'PROFILE_UNRECOGNIZED'})
        return {profile,source:{path:source.source,sha256:source.sha256,bytes:source.bytes}}
      }
      return ownQualification(async()=>{
        signal.throwIfAborted()
        const profile=await (family==='forge'?qualifyNativeForge:qualifyMary)(root,signal);signal.throwIfAborted()
        if(!profile.catalogSource)throw Object.assign(Error('PROFILE_UNRECOGNIZED'),{code:'PROFILE_UNRECOGNIZED'})
        return {profile,source:profile.catalogSource}
      })
    }})
    catalogQualification=catalogLaunch
    application.lifecycle.register({id:'bmad-qualification',context:emptyContext(),stop:async()=>{await catalogLaunch.stopQualification();await dialogueCoordinator?.settled();return qualificationOwner.observeStop()}})
    application.lifecycle.register({id:'catalog-launch',context:emptyContext(),stop:async()=>{await catalogLaunch.shutdown();return 'stopped'}})
    ipcMain.handle(CATALOG_LAUNCH_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isCatalogLaunchCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialCatalogLaunchState()}
      const state=await catalogLaunch.execute(input);if(!isCatalogLaunchState(state))throw Error('INVALID_CATALOG_LAUNCH_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    catalogLaunch.subscribe(state=>{if(isCatalogLaunchState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(CATALOG_LAUNCH_EVENT_CHANNEL,state)})
    dialogueCoordinator = new DialogueCoordinator({
      catalogLaunch,
      application,
      help:helpCoordinator,
      contexts:contextCoordinator,
      recovery:{status:()=>recovery.status(),observeStop:async()=>{const result=await recovery.observeStop();if(result==='stopped')await connection!.confirmRecoveryStop();return result}},
      inspectApproval:(root,files)=>inspectApprovalFiles(root,files,[connectionRoot,app.getPath('userData')]),
      workflows:new WorkflowStore(join(app.getPath('userData'),'workflows-v1')),
      approvals:new ApprovalStore(join(app.getPath('userData'),'approvals-v1')),
      questions:new QuestionStore(join(app.getPath('userData'),'questions-v1')),
      copyText:async text=>{await clipboard.writeText(text);if(await clipboard.readText()!==text)throw Error('COPY_FAILED')},
      qualifyForge:(root,signal)=>ownQualification(()=>qualifyNativeForge(root,signal)),
      qualify:(root,signal)=>ownQualification(()=>qualifyMary(root,signal)),
      open: (profile, signal, activity,assertContext) => openCodexDialogue(profile, signal, activity, connection!, { root: join(connectionRoot, 'dialogues'), appData: app.getPath('appData'), repository: app.getAppPath(),dataRoot:app.getPath('userData'),ownedRun,helpAdapter,assertContext,qualification:ownQualification, environment: process.env, runner:app.isPackaged?join(process.resourcesPath,'bmad-script-runner.py'):join(app.getAppPath(),'resources/bmad-script-runner.py') })
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
      icon: app.isPackaged ? join(process.resourcesPath, 'madness.ico') : join(app.getAppPath(), 'resources/branding/madness.ico'),
      width: 1320, height: 860, minWidth: 520, minHeight: 520, show: false,
      title: 'Madness', backgroundColor: nativeColors(appearance.theme).color, autoHideMenuBar: true,
      titleBarStyle: 'hidden', titleBarOverlay: nativeCaptionColors(appearance.theme),
      webPreferences: { preload: join(__dirname, '../preload/index.js'), additionalArguments: ['--madness-theme=' + appearance.theme, '--madness-appearance-warning=' + (appearance.warning ?? 'none')], contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, allowRunningInsecureContent: false, webviewTag: false, spellcheck: false }
    })
    window.on('focus',()=>{contextCoordinator.reconcile();helpCoordinator.reconcile();progressCoordinator.reconcile();catalogCoordinator.reconcile()})
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    window.webContents.on('will-navigate', (event) => event.preventDefault())
    window.webContents.on('will-redirect', (event) => event.preventDefault())
    window.webContents.on('will-attach-webview', (event) => event.preventDefault())
    window.once('ready-to-show', () => window?.show())
    nativeTheme.on('updated', () => { if (window && !window.isDestroyed()) window.setTitleBarOverlay(nativeCaptionColors(appearance.theme)) })
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
