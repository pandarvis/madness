import {BmadInitializationHost,assertInitializationOutsideStorage} from '../adapters/bmad/initialization.ts'
import {BmadInitializationStore} from '../adapters/persistence/bmad-initialization-store.ts'
import {BmadInitialization} from '../core/bmad-initialization.ts'
import {INITIALIZATION_ATTEMPT_LIMIT,INITIALIZATION_COMMAND_CHANNEL,INITIALIZATION_EVENT_CHANNEL,isInitializationReply,isInitializationView,validateInitializationRequest} from '../contracts/bmad-initialization.ts'
import type {InitializationAttempt,InitializationContent,InitializationIssueCode,InitializationView} from '../contracts/bmad-initialization.ts'
import {UsMetricsCoordinator} from '../core/us-metrics.ts'
import {UsMetricsStore} from '../adapters/persistence/us-metrics-store.ts'
import {US_METRICS_COMMAND_CHANNEL,US_METRICS_EVENT_CHANNEL,isUsMetricsCommand,isUsMetricsState,initialUsMetricsState} from '../contracts/us-metrics.ts'
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
import {BMAD_CONTEXT_COMMAND_CHANNEL,BMAD_CONTEXT_EVENT_CHANNEL,isBmadConfigurationObservation,isBmadContextCommand,isBmadInitializationObservationCommand,isBmadContextState,initialBmadContextState} from '../contracts/bmad-context.ts'
import {BmadHelpAdapter} from '../adapters/bmad/help.ts'
import {HelpOwnedRun} from '../adapters/bmad/help-owned-run.ts'
import {BmadHelpStore} from '../adapters/persistence/bmad-help-store.ts'
import {BmadHelpCoordinator} from '../core/bmad-help.ts'
import {ActivityAdmission} from '../core/lifecycle.ts'
import {HELP_COMMAND_CHANNEL,HELP_EVENT_CHANNEL,isHelpCommand,isHelpState,initialHelpState} from '../contracts/bmad-help.ts'
import {ApprovalStore} from '../adapters/persistence/approval-store.ts'
import {RecoveryStore} from '../adapters/persistence/recovery-store.ts'
import {OwnedRun} from '../adapters/codex/owned-run.ts'
import {openClaudeDialogue} from '../adapters/claude/dialogue.ts'
import {configureBundledRuntime} from '../adapters/bmad/runtime.ts'
import {createInitiative,writeActiveInitiative} from '../adapters/bmad/active-initiative.ts'
import {checkForUpdates} from './updates.ts'
import {AutopilotCoordinator} from '../core/autopilot.ts'
import {AutopilotStore,ensureActiveInitiative,readProjectPlan,runProjectTests} from '../adapters/autopilot/project-plan.ts'
import {claudeAgentTurn} from '../adapters/claude/dialogue.ts'
import {AUTOPILOT_COMMAND_CHANNEL,AUTOPILOT_EVENT_CHANNEL,isAutopilotCommand,isAutopilotState,initialAutopilotState} from '../contracts/autopilot.ts'
import {inspectApprovalFiles} from '../adapters/codex/file-proposals.ts'
import { app, BrowserWindow, clipboard, dialog, ipcMain, nativeTheme, Notification, protocol, net, session, Menu, safeStorage, shell } from 'electron'
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
import { LanguageStore } from '../adapters/persistence/language-store.ts'
import { LANGUAGE_CHANNEL, isLanguageCommand } from '../contracts/language.ts'
import type { LanguageState, LanguageReply } from '../contracts/language.ts'
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
let language: LanguageState = {language: 'fr', warning: null}

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
        const chosen = await dialog.showOpenDialog(window, { title: language.language === 'en' ? 'Open a project' : 'Ouvrir un projet', properties: ['openDirectory', 'dontAddToRecent'] })
        if (chosen.canceled || chosen.filePaths.length !== 1) return null
        const rootPath = await realpath(chosen.filePaths[0])
        if (!(await stat(rootPath)).isDirectory()) throw new Error('DIRECTORY_UNAVAILABLE')
        await access(rootPath, constants.R_OK)
        return { rootPath, name: basename(rootPath) || rootPath }
      }
    })
    const appearanceStore = new AppearanceStore(join(app.getPath('userData'), 'appearance-v1.json'))
    let appearance = await appearanceStore.restore()
    // Dark only since the 2026-11-07 owner decision: a stored light choice is kept on disk but no longer applied.
    appearance = { ...appearance, theme: 'dark' }
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
          if (window && !window.isDestroyed()) { window.setBackgroundColor(nativeColors(next.theme).color) }
        }
        return { contractVersion: 1, correlationId: input.correlationId, ok: true, state: appearance }
      })
      appearanceQueue = result.catch(() => undefined)
      return result
    })
    const languageStore = new LanguageStore(join(app.getPath('userData'), 'language-v1.json'))
    language = await languageStore.restore()
    let languageQueue: Promise<unknown> = Promise.resolve()
    application.lifecycle.register({ id: 'language', context: emptyContext(), stop: async () => { await languageQueue; return 'stopped' } })
    ipcMain.handle(LANGUAGE_CHANNEL, (event, input: unknown): Promise<LanguageReply> | LanguageReply => {
      const rejected = (error: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND' | 'APP_CLOSING'): LanguageReply => ({ contractVersion: 1, correlationId: 'rejected-request', ok: false, error, state: language })
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return rejected('UNTRUSTED_CALLER')
      if (!isLanguageCommand(input)) return rejected('INVALID_COMMAND')
      if (appearanceClosing) return rejected('APP_CLOSING')
      const result = languageQueue.then(async (): Promise<LanguageReply> => {
        // La lecture partage la file des changements, sans relire le fichier ni réappliquer l’amorce.
        if ('language' in input) {
          const next: LanguageState = await languageStore.save(input.language)
          language = next
        }
        return { contractVersion: 1, correlationId: input.correlationId, ok: true, state: language }
      })
      languageQueue = result.catch(() => undefined)
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
    const claudeOwner=new OwnedRun(new RecoveryStore(join(app.getPath('userData'),'claude-owned-run-v1.json')))
    const qualificationOwner=new OwnedRun(new RecoveryStore(join(app.getPath('userData'),'bmad-qualification-owned-v1.json')))
    let catalogQualification:BmadCatalogLaunchCoordinator|null=null
    const helperOwner=new HelpOwnedRun(join(app.getPath('userData'),'bmad-help-owned-v1.json'))
    const admission=new ActivityAdmission()
    let initialization:BmadInitialization|undefined
    const graphOwner=new GraphOwnedRun(join(app.getPath('userData'),'graph-owned-v1.json'))
    const recovery={status:async():Promise<'stopped'|'unknown'>=>{try{return (await Promise.all([ownedRun.status(),claudeOwner.status(),helperOwner.status(),graphOwner.status(),qualificationOwner.status()])).every(s=>s==='stopped')&&!initialization?.hasUnconfirmedStop()?'stopped':'unknown'}catch{return 'unknown'}},observeStop:async():Promise<'stopped'|'unknown'>=>{await catalogQualification?.stopQualification();await Promise.all([helperOwner.cancel().catch(()=>{}),graphOwner.cancel().catch(()=>{})]);const states=await Promise.all([ownedRun.observeStop(),claudeOwner.observeStop(),helperOwner.observeStop(),graphOwner.observeStop(),qualificationOwner.observeStop()]);if(states.every(s=>s==='stopped')&&!initialization?.hasUnconfirmedStop()&&await graphCoordinator.reconcileNativeStop(await graphOwner.stopProof())){admission.clearBlock();return 'stopped'}return 'unknown'}}
    if(await recovery.status()!=='stopped')admission.block()
    const markGraphStopUnknown=():void=>{admission.block();dialogueCoordinator?.markRecoveryUnknown();connection?.markRecoveryUnknown()}
    configureBundledRuntime(app.isPackaged?process.resourcesPath:join(app.getAppPath(),'resources'))
    // Test profiles must stay offline and must never replace the build under test.
    if(app.isPackaged&&!process.env.MADNESS_DATA_HOME)checkForUpdates()
    const graphAdapter=new GraphifyAdapter({root:join(app.getPath('userData'),'graph-runs-v1'),resources:app.isPackaged?join(process.resourcesPath,'graphify'):join(app.getAppPath(),'resources/graphify'),owner:graphOwner,admission,admit:async()=>{if(connection?.hasOperation())throw Error('BUSY');if(await recovery.status()!=='stopped'){admission.block();throw Error('STOP_UNCONFIRMED')}},onUnknown:markGraphStopUnknown})
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
      await afterContextReads((input as {type?:unknown}).type)
      const state=await helpCoordinator.execute(input)
      if(!isHelpState(state))throw Error('INVALID_HELP_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    helpCoordinator.subscribe(state=>{if(isHelpState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(HELP_EVENT_CHANNEL,state)})
    // A running agent captured the current BMad configuration: changing it would end that session.
    // The initiative read at project opening holds the local tools for a few seconds: actions wait for it instead of failing.
    const afterContextReads=async(kind:unknown):Promise<void>=>{if(!['read','stop','observe-stop','cancel'].includes(String(kind)))await contextCoordinator.settled()}
    const assertNoLiveDialogue=(root:string):void=>{if(autopilot.isBusyAt(root)||['starting','running','waiting-question','waiting-approval','ready','stopping'].includes(dialogueCoordinator?.read().status??'idle'))throw Object.assign(Error('BUSY'),{code:'BUSY'})}
    const contextAdapter=new BmadContextAdapter(helpAdapter)
    const contextCoordinator=new BmadContextCoordinator({application,observation,projectIds:async()=>{if(!application)throw Error('APP_CLOSING');const reply=await application.execute({contractVersion:1,correlationId:'bmad-context-restore',type:'read-state'});if(!reply.ok)throw Error(reply.error.code);return reply.value.state.projects.map(project=>project.id)},observeConsultation:(id,root,signal)=>contextAdapter.consult(id,root,signal),store:new BmadContextStore(join(app.getPath('userData'),'bmad-context-v1')),observe:(id,root,signal)=>contextAdapter.observe(id,root,signal),observeConfiguration:(id,root,signal)=>contextAdapter.observeConfiguration(id,root,signal),writeActive:async(root,initiativeId)=>{assertNoLiveDialogue(root);await writeActiveInitiative(root,initiativeId)},createInitiative:async(root,title)=>{assertNoLiveDialogue(root);return createInitiative(root,title)}})
    application.lifecycle.register({id:'bmad-context',context:emptyContext(),stop:async()=>{await contextCoordinator.shutdown();return 'stopped'}})
    const initializationHost=new BmadInitializationHost(join(app.isPackaged?process.resourcesPath:join(app.getAppPath(),'resources'),'bmad-init','payload-v1.json.gz'))
    const captureInitialization=async(id:string,signal:AbortSignal)=>{
      const project=await application!.dialogueProject(id)
      await assertInitializationOutsideStorage(project.rootPath,app.getPath('userData'))
      signal.throwIfAborted()
      const observation=await initializationHost.observeAbsence(project.id,project.rootPath,signal)
      const current=await application!.dialogueProject(id)
      signal.throwIfAborted()
      if(current.rootPath!==project.rootPath)throw Error('TARGET_CHANGED')
      if(!isBmadConfigurationObservation(observation))throw Error('INITIALIZATION_CONTEXT_CHANGED')
      return {scope:'configuration' as const,observation,initiativeId:null}
    }
    ipcMain.handle(BMAD_CONTEXT_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl))return {contractVersion:1,correlationId:'rejected-request',state:initialBmadContextState()}
      if(isBmadInitializationObservationCommand(input)){
        const capture=await captureInitialization(input.projectId,new AbortController().signal)
        return {contractVersion:1,correlationId:input.correlationId,observation:capture.observation}
      }
      if(!isBmadContextCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialBmadContextState()}
      const state=await contextCoordinator.execute(input)
      if(!isBmadContextState(state))throw Error('INVALID_CONTEXT_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    contextCoordinator.subscribe(state=>{if(isBmadContextState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(BMAD_CONTEXT_EVENT_CHANNEL,state)})
    const initializationStore=new BmadInitializationStore(join(app.getPath('userData'),'bmad-initialization-v1'))
    const initializationService=new BmadInitialization({context:{
      capture:(id,_requiresInitiative,signal)=>captureInitialization(id,signal),
      subscribeInvalidation:listener=>contextCoordinator.subscribeInvalidation(listener),
      assertFresh:async(captured,signal)=>{
        const current=await captureInitialization(captured.observation.projectId,signal)
        if(current.observation.rootPath!==captured.observation.rootPath||
           current.observation.rootIdentity!==captured.observation.rootIdentity)throw Error('TARGET_CHANGED')
        if(current.observation.problems.includes('RESERVED_COLLISION'))throw Error('RESERVED_COLLISION')
        if(current.observation.status!=='absent'||current.observation.revision!==captured.observation.revision)throw Error('INITIALIZATION_CONTEXT_CHANGED')
      }
    },host:initializationHost,
      store:initializationStore,admission,lifecycle:application.lifecycle,newId:randomUUID})
    initialization=initializationService
    let initializationAvailability:InitializationView['availability']='available'
    try {
      for (const record of await initializationStore.list()) {
        if (!initializationService.restore(record).ok) throw Error('INITIALIZATION_STORE_UNREADABLE')
      }
    } catch { initializationAvailability='storage-unreadable' }
    if (initializationService.hasUnconfirmedStop()) admission.block()
    let initializationClosing=false
    const initializationRequests=new Set<Promise<unknown>>()
    const pendingPreparations=new Map<string,{projectId:string;controller:AbortController}>()
    application.lifecycle.register({id:'bmad-initialization',context:emptyContext(),stop:async()=>{
      initializationClosing=true
      await initializationService.shutdown()
      await initializationHost.shutdown()
      await Promise.allSettled(initializationRequests)
      await initializationStore.drain()
      return initializationService.hasUnconfirmedStop()?'unknown':'stopped'
    }})
    const initializationView=(projectId:string):InitializationView=>({...initializationService.read(projectId),projectId,availability:initializationAvailability})
    ipcMain.handle(INITIALIZATION_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if (initializationClosing || !window || !isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)) throw Error('INITIALIZATION_UNTRUSTED')
      const parsed=validateInitializationRequest(input)
      if (!parsed.ok) throw Error('INVALID_INITIALIZATION_COMMAND')
      const command=parsed.value, {projectId,correlationId}=command
      // Claim the prepare correlation before resolving the project. An immediate close can
      // cancel this exact request even while the project lookup has not returned.
      const reservation=command.type==='prepare'&&!pendingPreparations.has(command.requestId)&&
        pendingPreparations.size<INITIALIZATION_ATTEMPT_LIMIT?{projectId,controller:new AbortController()}:null
      if(reservation)pendingPreparations.set(correlationId,reservation)
      const pending=command.type==='cancel-prepare-request'?pendingPreparations.get(command.requestId):undefined
      const cancelledPending=pending?.projectId===projectId
      if(cancelledPending)pending.controller.abort()
      const work=(async()=>{
        const project=await application!.dialogueProject(projectId)
        if (initializationClosing || project.id!==projectId) throw Error('INITIALIZATION_UNAVAILABLE')
        let issue:InitializationIssueCode|null=null, content:InitializationContent|null=null, preparedAttempt:InitializationAttempt|null=null
        if (command.type!=='read') {
          if (initializationAvailability!=='available') issue='UNAVAILABLE'
          else if(command.type==='prepare'&&!reservation)issue='BUSY'
          else if(command.type==='decision'&&command.command.type==='approve'&&
             pendingPreparations.get(command.command.attemptId)?.projectId===projectId)issue='BUSY'
          else {
            const operation='attemptId' in command?initializationService.read(projectId).operations.find(op=>
              op.attemptId===command.attemptId&&op.generation===command.generation):undefined
            let inspectRootMatches=false
            if(command.type==='inspect'&&operation?.plan?.id===command.planId&&
               operation.plan.revision===command.planRevision&&operation.plan.identity.rootPath===project.rootPath){
              try{
                await assertInitializationOutsideStorage(project.rootPath,app.getPath('userData'))
                const current=await application!.dialogueProject(projectId)
                inspectRootMatches=current.id===projectId&&current.rootPath===project.rootPath
              }catch{/* A missing or excluded target must stay uninspected. */}
            }
            const result=command.type==='prepare'&&reservation
              ?await initializationService.prepare(projectId,command.requestId,reservation.controller.signal):
              command.type==='decision'?await initializationService.execute(command.command):
              command.type==='cancel-prepare-request'?await initializationService.cancelPreparationRequest(projectId,command.requestId):
              command.type==='cancel-preparation'?await initializationService.cancelPreparation(projectId,command.attemptId,command.generation):
              command.type==='retry-save'&&operation?await initializationService.retrySave(operation.attemptId):
              command.type==='inspect'&&operation&&inspectRootMatches?await initializationService.inspect(operation.attemptId):null
            if (result&&!result.ok) {
              if(!cancelledPending)issue=result.issues[0].code
            }
            else if (command.type==='content') {
              if (operation?.plan?.id!==command.planId||operation?.plan.revision!==command.planRevision) issue='CONTEXT_MISMATCH'
              else {
                const preview=await initializationService.content(operation.attemptId,command.contentId)
                if (preview.ok) content=preview.value
                else issue=preview.issues[0].code
              }
            } else if (!result) issue='CONTEXT_MISMATCH'
            else if (command.type==='prepare'&&result.ok) {
              const {projectId,attemptId,generation}=result.value
              preparedAttempt={projectId,attemptId,generation}
            }
          }
        }
        const reply={contractVersion:1,correlationId,state:initializationView(projectId),issue,content,preparedAttempt}
        if (!isInitializationReply(reply,command)) throw Error('INVALID_INITIALIZATION_REPLY')
        return reply
      })()
      initializationRequests.add(work)
      try { return await work } finally {
        if(reservation)pendingPreparations.delete(correlationId)
        initializationRequests.delete(work)
      }
    })
    initializationService.subscribe(state=>{
      if (initializationClosing||!window||window.isDestroyed()||window.webContents.mainFrame.url!==rendererUrl) return
      const projects=new Map<string,InitializationView>()
      for (const operation of state.operations) {
        let view=projects.get(operation.projectId)
        if (!view) {
          view={...state,projectId:operation.projectId,availability:initializationAvailability,operations:[]}
          projects.set(operation.projectId,view)
        }
        view.operations.push(operation)
      }
      for (const view of projects.values()) if (isInitializationView(view)) window.webContents.send(INITIALIZATION_EVENT_CHANNEL,view)
    })
    const projectFiles=new ProjectFilesCoordinator({application,authority:value=>graphAdapter.filesAuthority(value)??helpAdapter.filesAuthority(value),clipboard,admission,editor:uri=>shell.openExternal(uri)})
    application.lifecycle.register({id:'project-files',context:emptyContext(),stop:async()=>{await projectFiles.shutdown();return 'stopped'}})
    ipcMain.handle(PROJECT_FILES_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isProjectFilesCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialProjectFilesState()}
      const state=await projectFiles.execute(input)
      if(!isProjectFilesState(state))throw Error('INVALID_FILES_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    projectFiles.subscribe(state=>{if(isProjectFilesState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(PROJECT_FILES_EVENT_CHANNEL,state)})
    const graphCoordinator=new GraphCoordinator({application,runtime:graphAdapter,store:new GraphStore(join(app.getPath('userData'),'graph-state-v1')),files:projectFiles,guard:()=>graphAdmissionGuard(admission,recovery,connection?.hasOperation()??false),onUnknown:markGraphStopUnknown})
    application.lifecycle.register({id:'graph',context:emptyContext(),stop:()=>graphCoordinator.shutdown()})
    ipcMain.handle(GRAPH_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isGraphCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialGraphWorkspace()}
      const state=await graphCoordinator.execute(input);if(!isGraphWorkspace(state))throw Error('INVALID_GRAPH_STATE');return {contractVersion:1,correlationId:input.correlationId,state}
    })
    graphCoordinator.subscribe(state=>{if(isGraphWorkspace(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(GRAPH_EVENT_CHANNEL,state)})
    const metrics=new UsMetricsCoordinator({store:new UsMetricsStore(join(app.getPath('userData'),'us-metrics-v1')),newId:randomUUID,assertStory:async(story,signal)=>{
      const p=contextCoordinator.read().projects.find(p=>p.projectId===story.projectId)
      if(!p?.observation||p.selection?.initiativeId!==story.initiativeId||p.selection.rootIdentity!==story.rootIdentity||p.observation.rootPath!==story.rootPath||p.observation.revision!==story.contextRevision)throw Object.assign(Error('PROFILE_CHANGED'),{code:'PROFILE_CHANGED'})
      await contextCoordinator.assertFresh({scope:'initiatives',observation:p.observation,initiativeId:story.initiativeId},signal)
      const current=contextCoordinator.read().projects.find(p=>p.projectId===story.projectId)
      if(current?.selection?.revision!==p.selection.revision)throw Object.assign(Error('PROFILE_CHANGED'),{code:'PROFILE_CHANGED'})
    }})
    ipcMain.handle(US_METRICS_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isUsMetricsCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:{...initialUsMetricsState(),error:'INVALID_COMMAND'}}
      await application!.dialogueProject(input.projectId)
      const state=await metrics.execute(input);if(!isUsMetricsState(state))throw Error('INVALID_METRICS_STATE');return {contractVersion:1,correlationId:input.correlationId,state}
    })
    metrics.subscribe(state=>{if(isUsMetricsState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(US_METRICS_EVENT_CHANNEL,state)})
    const progressAdapter=new BmadProgressAdapter(helpAdapter)
    const progressCoordinator=new BmadProgressCoordinator({metrics:{accept:original=>metrics.accept(original,helpAdapter.storyAuthority(original))},application,observation,files:projectFiles,available:fn=>admission.subscribeAvailable(fn),contexts:contextCoordinator,collect:(id,root,selection,observation,signal)=>progressAdapter.collect(id,root,selection,observation,signal)})
    application.lifecycle.register({id:'bmad-progress',context:emptyContext(),stop:async()=>{await progressCoordinator.shutdown();return 'stopped'}})
    ipcMain.handle(BMAD_PROGRESS_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isBmadProgressCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialBmadProgressState()}
      await afterContextReads((input as {type?:unknown}).type)
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
      await afterContextReads((input as {type?:unknown}).type)
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
      await afterContextReads((input as {type?:unknown}).type)
      const state=await catalogLaunch.execute(input);if(!isCatalogLaunchState(state))throw Error('INVALID_CATALOG_LAUNCH_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    catalogLaunch.subscribe(state=>{if(isCatalogLaunchState(state)&&window&&!window.isDestroyed()&&window.webContents.mainFrame.url===rendererUrl)window.webContents.send(CATALOG_LAUNCH_EVENT_CHANNEL,state)})
    dialogueCoordinator = new DialogueCoordinator({
      metrics,
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
      qualifyClaude:async(root,signal)=>{signal.throwIfAborted();return qualifyBmadProfile(root)},
      openClaude:(profile,captured,signal,assertContext,history,agentic)=>openClaudeDialogue(profile,captured,signal,assertContext,{history,agentic,
        home:app.getPath('home'),appData:app.getPath('appData'),localAppData:join(app.getPath('home'),'AppData','Local'),
        temp:app.getPath('temp'),environment:process.env,owner:claudeOwner,
        admit:()=>admission.enter('provider'),
        assertRecovery:async()=>{if(await recovery.status()!=='stopped')throw Object.assign(Error('STOP_UNCONFIRMED'),{code:'STOP_UNCONFIRMED'})},
        onUnknown:()=>admission.block()
      }),
      open: (profile, signal, activity,assertContext) => openCodexDialogue(profile, signal, activity, connection!, { root: join(connectionRoot, 'dialogues'), appData: app.getPath('appData'), repository: app.getAppPath(),dataRoot:app.getPath('userData'),ownedRun,helpAdapter,assertContext,qualification:ownQualification, environment: process.env, runner:app.isPackaged?join(process.resourcesPath,'bmad-script-runner.py'):join(app.getAppPath(),'resources/bmad-script-runner.py') })
    })
    application.lifecycle.register({ id: 'bmad-dialogue', context: { ...emptyContext(), providerId: 'codex' }, stop: () => dialogueCoordinator!.shutdown() })
    const autopilot=new AutopilotCoordinator({
      store:new AutopilotStore(join(app.getPath('userData'),'autopilot-v1.json')),
      project:async id=>{const project=await application!.dialogueProject(id);return {name:basename(project.rootPath),rootPath:project.rootPath}},
      // Claude Code only: Codex's Windows sandbox blocks BMad, and it must not run without one.
      runner:()=>input=>claudeAgentTurn({home:app.getPath('home'),appData:app.getPath('appData'),localAppData:join(app.getPath('home'),'AppData','Local'),environment:process.env},input),
      ensureInitiative:ensureActiveInitiative,plan:readProjectPlan,tests:runProjectTests,now:()=>new Date(),
      canRun:id=>{const dialogue=dialogueCoordinator?.read();return !(dialogue&&dialogue.context.projectId===id&&['qualifying','starting','running','waiting-question','waiting-approval','ready','stopping'].includes(dialogue.status))},
      notify:(title,body)=>{if(Notification.isSupported())new Notification({title,body}).show()}
    })
    await autopilot.restore()
    application.lifecycle.register({id:'autopilot',context:emptyContext(),stop:async()=>{await autopilot.shutdown();return 'stopped'}})
    autopilot.subscribe(state=>{if(window&&!window.isDestroyed()&&window.webContents&&!window.webContents.isDestroyed())window.webContents.send(AUTOPILOT_EVENT_CHANNEL,state)})
    ipcMain.handle(AUTOPILOT_COMMAND_CHANNEL,async(event,input:unknown)=>{
      if(!window||!isTrustedCaller(event,{webContents:window.webContents,mainFrame:window.webContents.mainFrame},rendererUrl)||!isAutopilotCommand(input))return {contractVersion:1,correlationId:'rejected-request',state:initialAutopilotState()}
      const state=await autopilot.execute(input);if(!isAutopilotState(state))throw Error('INVALID_AUTOPILOT_STATE')
      return {contractVersion:1,correlationId:input.correlationId,state}
    })
    ipcMain.handle(DIALOGUE_COMMAND_CHANNEL, async (event, input: unknown) => {
      const rejected = (code: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND') => ({ contractVersion: 1, correlationId: 'rejected-request', state: { ...initialDialogueState(), status: 'error', errorCode: code } })
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return rejected('UNTRUSTED_CALLER')
      if (!isDialogueCommand(input)) return rejected('INVALID_COMMAND')
      // Two agents writing in the same repository would overwrite each other.
      if ('projectId' in input && typeof input.projectId === 'string' && autopilot.isBusy(input.projectId) && /^launch/.test(input.type)) return { contractVersion: 1, correlationId: input.correlationId, state: { ...dialogueCoordinator!.read(), errorCode: 'BUSY' as const } }
      await afterContextReads(input.type)
      const state = await dialogueCoordinator!.execute(input)
      if (!isDialogueState(state)) return rejected('INVALID_COMMAND')
      return { contractVersion: 1, correlationId: input.correlationId, state }
    })
    dialogueCoordinator.subscribe((state) => { if (isDialogueState(state) && window && !window.isDestroyed() && window.webContents.mainFrame.url === rendererUrl) window.webContents.send(DIALOGUE_EVENT_CHANNEL, state) })
    ipcMain.handle(CONNECTION_COMMAND_CHANNEL, async (event, input: unknown) => {
      const rejected = (code: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND') => ({ contractVersion: 1, correlationId: 'rejected-request', state: { ...initialConnectionState(), status: 'error', errorCode: code } })
      if (!window || !isTrustedCaller(event, { webContents: window.webContents, mainFrame: window.webContents.mainFrame }, rendererUrl)) return rejected('UNTRUSTED_CALLER')
      if (!isConnectionCommand(input)) return rejected('INVALID_COMMAND')
      if (input.action === 'connect' || input.action === 'verify') await afterContextReads(input.action)
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
      webPreferences: { preload: join(__dirname, '../preload/index.js'), additionalArguments: ['--madness-language=' + language.language, '--madness-language-warning=' + (language.warning ?? 'none'), '--madness-theme=' + appearance.theme, '--madness-appearance-warning=' + (appearance.warning ?? 'none'), ...(process.argv.includes('--madness-splash-demo') ? ['--madness-splash-demo'] : [])], contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, allowRunningInsecureContent: false, webviewTag: false, spellcheck: false }
    })
    window.on('focus',()=>{contextCoordinator.reconcile();helpCoordinator.reconcile();progressCoordinator.reconcile();catalogCoordinator.reconcile()})
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    window.webContents.on('will-navigate', (event) => event.preventDefault())
    window.webContents.on('will-redirect', (event) => event.preventDefault())
    window.webContents.on('will-attach-webview', (event) => event.preventDefault())
    // Open maximized; automated runs (remote debugging) keep the sizes they set themselves.
    window.once('ready-to-show', () => { if (!app.commandLine.hasSwitch('remote-debugging-port')) window?.maximize(); window?.show() })
    // Read-only presence check for the first-step card: no helper process, no local tools lock.
    ipcMain.handle('madness:bmad-present', async (event, projectId: unknown): Promise<boolean | null> => {
      if (!window || window.isDestroyed() || event.sender !== window.webContents || typeof projectId !== 'string' || !application) return null
      try {
        const { rootPath } = await application.dialogueProject(projectId)
        const exists = (name: string): Promise<boolean> => access(join(rootPath, name)).then(() => true, () => false)
        if (!await exists('.')) return null
        return (await Promise.all([exists('_bmad'), exists('.agents')])).some(Boolean)
      } catch { return null }
    })
    nativeTheme.on('updated', () => { if (window && !window.isDestroyed()) window.setTitleBarOverlay(nativeCaptionColors(appearance.theme)) })
    ipcMain.handle('madness:reload', (event): void => { if (window && !window.isDestroyed() && event.sender === window.webContents) window.webContents.reload() })
    window.on('closed', () => { window = null })
    await window.loadURL(rendererUrl)
  }).catch(() => {
    dialog.showErrorBox(language.language==='en'?'Madness could not start':'Madness ne peut pas démarrer',language.language==='en'?'The local foundation is unavailable. Check program files then retry. Your data was not reset.':'Le socle local est indisponible. Réessayez après avoir vérifié les fichiers du programme. Vos données n’ont pas été réinitialisées.')
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
