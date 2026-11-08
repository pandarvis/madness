import {waitForPageCondition} from '../scripts/qualification/page-condition-wait.mjs'
import assert from 'node:assert/strict'
import { test, before, after } from 'node:test'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join,dirname,basename } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { isBmadContextState } from '../src/contracts/bmad-context.ts'
import {isBmadProgressSnapshot} from '../src/contracts/bmad-progress.ts'
import {isUsMetricsState} from '../src/contracts/us-metrics.ts'
import { isHelpState } from '../src/contracts/bmad-help.ts'
import { isDialogueMessage, isWorkflowRecord } from '../src/contracts/dialogue.ts'
import { setWorkspaceViewport } from '../scripts/qualification/workspace-design.mjs'
const require = createRequire(import.meta.url)
const repository = fileURLToPath(new URL('../', import.meta.url))
let root, app, page, bundle
before(async () => {
  // Seulement le renderer source : aucun build Main/paquet, réseau ou fournisseur.
  const result = await build({ root: repository, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'atelier-fixture-local-assets', enforce: 'pre', load: id => id.endsWith('-bust.png?url') ? 'export default '+JSON.stringify(pathToFileURL(id.split('?')[0]).href) : undefined }, react(), { name: 'connection-ui-fixture', resolveId: (id) => id === 'connection-ui-fixture' || id.replaceAll('\\', '/').endsWith('/connection-ui-fixture') ? '\0connection-ui-fixture' : undefined, load: (id) => id === '\0connection-ui-fixture' ? `import {createElement} from 'react'; import {createRoot} from 'react-dom/client'; import {App} from ${JSON.stringify(join(repository, 'src/renderer/src/App.tsx').replaceAll('\\', '/'))}; import {LocaleProvider} from ${JSON.stringify(join(repository,'src/renderer/src/Locale.tsx').replaceAll('\\','/'))}; import {metricDuration,metricRawMs} from ${JSON.stringify(join(repository,'src/renderer/src/UsMetrics.tsx').replaceAll('\\','/'))}; window.metricsFormatFixture={metricDuration,metricRawMs}; createRoot(document.getElementById('root')).render(createElement(LocaleProvider,null,createElement(App)));` : undefined }], build: { write: false, minify: false, lib: { entry: 'connection-ui-fixture', formats: ['iife'], name: 'ConnectionUIFixture' } } })
  bundle = (Array.isArray(result) ? result[0] : result).output.find((output) => output.type === 'chunk').code
  root = await realpath(await mkdtemp(join(tmpdir(), 'madness-ui-review-')))
  await writeFile(join(root, 'main.cjs'), `const {app,BrowserWindow,session}=require('electron'); app.setPath('userData',${JSON.stringify(join(root, 'profile'))}); app.whenReady().then(()=>{session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true})); const w=new BrowserWindow({show:false,width:600,height:800,webPreferences:{preload:${JSON.stringify(join(root, 'preload.cjs'))},contextIsolation:true,sandbox:true,nodeIntegration:false}});w.loadFile(${JSON.stringify(join(root, 'index.html'))});});`)
  await writeFile(join(root, 'index.html'), '<!doctype html><html lang="fr"><meta charset="utf-8"><div id="root"></div></html>')
  await writeFile(join(root, 'preload.cjs'), `const {contextBridge}=require('electron');
    let language={language:'fr',warning:null},languageFailure=null,languageDeferred=false,languageReleases=[],languageCalls=[],languageSettled=0;contextBridge.exposeInMainWorld('madnessLanguage',{initial:language,read:async()=>language,setLanguage:async value=>{languageCalls.push(value);if(languageDeferred)await new Promise(resolve=>languageReleases.push(resolve));if(languageFailure==='bridge')throw Error('BRIDGE');language={language:value,warning:languageFailure?'save-failed':null};languageSettled++;return language}});contextBridge.exposeInMainWorld('languageUIFixture',{fail:value=>languageFailure=value,defer:()=>languageDeferred=true,finish:index=>languageReleases[index]?.(),calls:()=>languageCalls,settled:()=>languageSettled});let appearanceFailure=false;contextBridge.exposeInMainWorld('madnessAppearance',{initial:{theme:'dark',warning:null},setTheme:async(theme)=>{if(appearanceFailure==='bridge')throw Error('BRIDGE_UNAVAILABLE');return {theme,warning:appearanceFailure?'save-failed':null}}});
    let state={network:{status:'idle',checkedAt:null,errorCode:null},contractVersion:1,sequence:0,status:'disconnected',accountStored:false,verifiedAt:null,errorCode:null,cliVersion:null,needsPlanAcknowledgement:false}, listeners=[],supportCalls=[],supportFailure=null,supportDeferred=false,finishSupport=null,verifies=0,cancels=0;
    const reply=()=>Promise.resolve({contractVersion:1,correlationId:'ui-fixture',state});
    const support=async(action)=>{supportCalls.push(action);if(supportFailure===action)throw Error('PUBLIC_KEYS_SUPPORT_FAILED');if(supportDeferred)await new Promise(resolve=>{finishSupport=resolve});return reply()};
    let snapshot={schemaVersion:1,revision:0,projects:[],activeProjectId:null,drafts:[],preferences:{navigationCollapsed:false},conversations:[],capabilities:{codex:{available:false,reasonKey:'codex.unqualified'}},lifecycle:'idle'}, stateListeners=[];
    let deferredSelections=false,selectionRequests=[];const selectProject=async(projectId)=>{if(deferredSelections)await new Promise((resolve,reject)=>selectionRequests.push({projectId,resolve,reject}));snapshot={...snapshot,revision:snapshot.revision+1,activeProjectId:projectId};return appReply()};
    const appReply=()=>Promise.resolve({ok:true,contractVersion:1,correlationId:'ui-fixture',value:{state:snapshot,effect:'read'}});let directoryChoices=0;
    contextBridge.exposeInMainWorld('madnessToolbarFixture',{directoryChoices:()=>directoryChoices});
    contextBridge.exposeInMainWorld('madness',{readState:appReply,chooseDirectory:async()=>{directoryChoices++;const reply=await appReply();return {...reply,value:{...reply.value,effect:'cancelled'}}},onStateChanged:listener=>{stateListeners.push(listener);return()=>{}},selectProject,saveDraft:async(projectId,text)=>{snapshot={...snapshot,revision:snapshot.revision+1,drafts:[{projectId,text,savedAt:new Date().toISOString()}]};return appReply()},setNavigation:async(collapsed)=>{snapshot={...snapshot,revision:snapshot.revision+1,preferences:{navigationCollapsed:collapsed}};return appReply()}});
    let dialogue={recovery:{stop:'clear',observations:[],capabilities:{resume:false,newConversation:true,inspectFiles:true}},contractVersion:1,sequence:0,status:'idle',context:{projectId:null,initiativeId:null,conversationId:null,providerId:null,connectionId:null},invocation:'$bmad-agent-analyst',profile:null,acknowledged:false,errorCode:null,activities:[],workflows:[],questions:[],approvals:[],mode:'read-only',turn:null,messages:[]},dialogueListeners=[],sent=[],copies=[],unknownOnStop=false;
    const notifyDialogue=()=>dialogueListeners.forEach(listener=>listener(dialogue));
    let asyncConflict=false;let launchFailure=false;let questionSaves=[],questionAnswers=[],approvalDecisions=[],adjustmentSends=[],observeStops=0;
    const saveQuestion=async(questionId,values)=>{questionSaves.push({questionId,values});dialogue={...dialogue,sequence:dialogue.sequence+1,questions:dialogue.questions.map(q=>q.id===questionId?{...q,values,storage:'stored'}:q)};notifyDialogue();return dialogue};
    const answerQuestion=async(questionId,values)=>{questionAnswers.push({questionId,values});dialogue={...dialogue,sequence:dialogue.sequence+1,questions:dialogue.questions.map(q=>q.id===questionId?{...q,values,status:'sending'}:q)};notifyDialogue();return dialogue};
    const qualifyForge=async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'qualified',errorCode:null,invocation:'$bmad-forge-idea',context:{...dialogue.context,projectId},profile:{fingerprint:'a'.repeat(64),skillPath:'C:/forge/.agents/skills/bmad-forge-idea/SKILL.md',outputBase:'C:/forge/_bmad-output/initiative-test'}};notifyDialogue();return dialogue};
    const launchForge=async(projectId)=>{if(asyncConflict){dialogue={...dialogue,sequence:dialogue.sequence+1,status:'starting',errorCode:null,invocation:'$bmad-forge-idea',context:{...dialogue.context,projectId}};return dialogue}if(launchFailure){dialogue={...dialogue,sequence:dialogue.sequence+1,status:'error',errorCode:'PROVIDER_FAILED'};notifyDialogue();return dialogue}dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',errorCode:null,invocation:'$bmad-forge-idea',context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-forge',providerId:'codex',connectionId:'account-1'},workflows:[{schemaVersion:1,conversationId:'conversation-forge',context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-forge',providerId:'codex',connectionId:'account-1'},invocation:'$bmad-forge-idea',capturedAt:new Date().toISOString(),rootPath:'C:/forge',outputBase:'C:/forge/_bmad-output/initiative-test',contextDigest:'b'.repeat(64),fingerprint:'a'.repeat(64),skillPath:'C:/forge/.agents/skills/bmad-forge-idea/SKILL.md',workspace:'C:/forge/_bmad-output/initiative-test/forge-ui-test',outcome:'open',observations:[]}]};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[...snapshot.conversations.filter(c=>c.id!=='conversation-forge'),{id:'conversation-forge',context:dialogue.context,lastKnownActivity:'idle',messages:[{id:'invocation-forge',role:'user',text:'$bmad-forge-idea'},{id:'welcome-forge',role:'assistant',text:'Quelle idée souhaitez-vous éprouver ? Fin du tour.'}]}]};stateListeners.forEach(listener=>listener({}));notifyDialogue();return dialogue};
    contextBridge.exposeInMainWorld('madnessDialogue',{sendMeasured:async(projectId,conversationId,text,requestId,choiceRef)=>{metricCalls.push({type:'send',projectId,conversationId,text,requestId,choiceRef});sent.push({projectId,conversationId,text});return dialogue},launchMeasured:async(kind,projectId,requestId,choiceRef,preparationId,mode)=>{metricCalls.push({type:kind,projectId,requestId,choiceRef,preparationId,mode});return dialogue},adjustMeasured:async(approvalId,requestId,choiceRef)=>{metricCalls.push({type:'send-adjustment',approvalId,requestId,choiceRef,capturedAdjustment:dialogue.approvals.find(a=>a.id===approvalId)?.adjustment});return dialogue},launchCatalog:(projectId,preparationId)=>launchCatalogUI(projectId,preparationId),observeStop:async()=>{observeStops++;dialogue={...dialogue,sequence:dialogue.sequence+1,status:'stopped',errorCode:null,recovery:{...dialogue.recovery,stop:'clear'}};notifyDialogue();state={...state,sequence:state.sequence+1,status:state.accountStored?'registered':'disconnected',errorCode:null};listeners.forEach(listener=>listener(state));return dialogue},saveApproval:async(approvalId,adjustment)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,approvals:dialogue.approvals.map(a=>a.id===approvalId?{...a,adjustment,storage:'stored'}:a)};notifyDialogue();return dialogue},decideApproval:async(approvalId,decision)=>{approvalDecisions.push({approvalId,decision});dialogue={...dialogue,sequence:dialogue.sequence+1,approvals:dialogue.approvals.map(a=>a.id===approvalId?{...a,decision,status:'sending',transmission:'pending'}:a)};notifyDialogue();return dialogue},sendAdjustment:async(approvalId)=>{adjustmentSends.push(approvalId);return dialogue},saveQuestion,answerQuestion,qualifyForge,launchForge,copyWorkflow:async(conversationId,target)=>{copies.push({conversationId,target});return dialogue},read:()=>Promise.resolve(dialogue),qualify:async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'qualified',context:{...dialogue.context,projectId}};notifyDialogue();return dialogue},launch:async(projectId,mode='read-only')=>{if(launchFailure){dialogue={...dialogue,sequence:dialogue.sequence+1,status:'error',errorCode:'PROVIDER_FAILED'};notifyDialogue();return dialogue}dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',errorCode:null,mode,invocation:'$bmad-agent-analyst',acknowledged:true,context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-1',providerId:'codex',connectionId:'account-1'},activities:['Tour terminé']};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[...snapshot.conversations.filter(c=>c.id!=='conversation-1'),{id:'conversation-1',context:dialogue.context,lastKnownActivity:'idle',messages:[{id:'hello',role:'assistant',text:'📊 Bonjour, je suis Mary. Voici mon menu.'}]}]};stateListeners.forEach(listener=>listener({}));notifyDialogue();return dialogue},send:async(projectId,conversationId,text)=>{sent.push({projectId,conversationId,text});dialogue={...dialogue,sequence:dialogue.sequence+1,status:'running',acknowledged:true};notifyDialogue();return dialogue},stop:async()=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:unknownOnStop?'unknown':'stopped',errorCode:unknownOnStop?'STOP_UNCONFIRMED':null,recovery:{...dialogue.recovery,stop:unknownOnStop?'unconfirmed':'clear'}};notifyDialogue();return dialogue},onChanged:listener=>{dialogueListeners.push(listener);return()=>{}}});
    contextBridge.exposeInMainWorld('madnessConnection',{read:reply,connect:reply,verify:()=>{verifies++;return reply()},cancel:()=>{cancels++;return reply()},disconnect:reply,manageUsage:reply,openPublicKeys:()=>support('openPublicKeys'),copyPublicKeys:()=>support('copyPublicKeys'),acknowledgePlan:()=>{state={...state,sequence:state.sequence+1,status:'error',errorCode:'VAULT_UNREADABLE'};listeners.forEach(listener=>listener(state));return reply()},onChanged:listener=>{listeners.push(listener);return()=>{listeners=listeners.filter(value=>value!==listener)}}});

    let metricState={contractVersion:1,sequence:0,projects:[],choiceRef:null,error:null},metricListeners=[],metricChoices=[],metricCalls=[],metricRefusal=false,metricDeferred=false,metricRelease;
    contextBridge.exposeInMainWorld('madnessUsMetrics',{read:async()=>metricState,onChanged:fn=>{metricListeners.push(fn);return()=>{}},retrySave:async projectId=>{metricCalls.push({type:'retry-save',projectId});return metricState},choose:async(projectId,conversationId,requestId,storyRef,text,operation)=>{metricChoices.push({projectId,conversationId,requestId,storyRef,text,operation});if(metricDeferred)await new Promise(r=>metricRelease=r);return {...metricState,choiceRef:metricRefusal?null:'choice-ui',error:metricRefusal?'PROFILE_CHANGED':null}}});
    contextBridge.exposeInMainWorld('metricsUIFixture',{set:value=>{metricState={...value,sequence:metricState.sequence+1};metricListeners.forEach(fn=>fn(metricState))},choices:()=>metricChoices,calls:()=>metricCalls,emitInvalid:()=>metricListeners.forEach(fn=>fn({contractVersion:99})),refuse:value=>metricRefusal=value,defer:()=>metricDeferred=true,finish:()=>{metricDeferred=false;metricRelease?.()}});
    let contextState={contractVersion:1,sequence:0,projects:[]},contextListeners=[],contextChoices=[],contextReads=0,contextSaveFailure=false,contextDeferred=false,contextReleases=[];
    const notifyContext=()=>contextListeners.forEach(fn=>fn(contextState));
    contextBridge.exposeInMainWorld('madnessBmadContext',{read:async()=>contextState,onChanged:fn=>{contextListeners.push(fn);return()=>{}},observe:async()=>{contextReads++;return contextState},choose:async(projectId,initiativeId,revision)=>{contextChoices.push({projectId,initiativeId,revision});if(contextDeferred)await new Promise(resolve=>contextReleases.push(resolve));contextState={...contextState,sequence:contextState.sequence+1,projects:contextState.projects.map(p=>p.projectId===projectId?{...p,status:'ready',selection:{schemaVersion:1,projectId,rootPath:p.observation.rootPath,rootIdentity:p.observation.rootIdentity,revision:(p.selection?.revision??0)+1,initiativeId},storage:contextSaveFailure?'failed':'stored',error:contextSaveFailure?'Choix conservé pour cette session — enregistrement échoué.':null}:p)};notifyContext();return contextState},retrySave:async()=>contextState});
    contextBridge.exposeInMainWorld('bmadContextUIFixture',{deferChoices:()=>{contextDeferred=true},finishChoice:()=>contextReleases.shift()?.(),set:value=>{contextState={...value,sequence:contextState.sequence+1};notifyContext()},choices:()=>contextChoices,reads:()=>contextReads,failSave:value=>contextSaveFailure=value,emitOld:value=>contextListeners.forEach(fn=>fn(value))});

    let catalogState={contractVersion:1,sequence:0,projects:[]},catalogListeners=[],catalogCalls=[],catalogCopies=[],catalogDeferred=false,catalogRelease,catalogFailure=false;
    contextBridge.exposeInMainWorld('madnessBmadCatalog',{read:async()=>catalogState,onChanged:fn=>{catalogListeners.push(fn);return()=>{}},collect:async projectId=>{catalogCalls.push(projectId);return catalogState},copy:async(projectId,itemId,revision)=>{catalogCopies.push({projectId,itemId,revision});if(catalogDeferred)await new Promise(resolve=>catalogRelease=resolve);catalogState={...catalogState,sequence:catalogState.sequence+1,projects:catalogState.projects.map(p=>p.projectId===projectId?{...p,copy:{correlationId:'catalog-ui-copy',projectId,itemId,revision,status:catalogFailure?'failed':'copied',reason:catalogFailure?'Copie impossible — sélectionnez le texte.':null}}:p)};catalogListeners.forEach(fn=>fn(catalogState));return catalogState}});
    contextBridge.exposeInMainWorld('bmadCatalogUIFixture',{set:value=>{catalogState={...value,sequence:catalogState.sequence+1};catalogListeners.forEach(fn=>fn(catalogState))},calls:()=>catalogCalls,copies:()=>catalogCopies,defer:()=>catalogDeferred=true,finish:()=>catalogRelease?.(),fail:value=>catalogFailure=value});

    let catalogLaunchState={contractVersion:1,sequence:0,status:'idle',preparation:null,records:[],error:null,errorCode:null},catalogLaunchListeners=[],catalogPrepared=null,catalogPrepareCalls=[],catalogNativeLaunches=[],catalogPrepareDeferred=false,catalogPrepareRelease,catalogPrepareRefusal=null;
    const notifyCatalogLaunch=()=>catalogLaunchListeners.forEach(fn=>fn(catalogLaunchState));
    const launchCatalogUI=async(projectId,preparationId)=>{catalogNativeLaunches.push({projectId,preparationId});dialogue={...dialogue,sequence:dialogue.sequence+1,status:'starting',acknowledged:false,errorCode:null};notifyDialogue();return dialogue};
    contextBridge.exposeInMainWorld('madnessCatalogLaunch',{read:async()=>catalogLaunchState,onChanged:fn=>{catalogLaunchListeners.push(fn);return()=>{}},prepare:async(projectId,itemId,revision,mode)=>{catalogPrepareCalls.push({projectId,itemId,revision,mode});if(catalogPrepareDeferred)await new Promise(r=>catalogPrepareRelease=r);catalogLaunchState={...catalogLaunchState,sequence:catalogLaunchState.sequence+1,status:catalogPrepareRefusal?'error':'prepared',preparation:catalogPrepareRefusal?null:catalogPrepared,error:catalogPrepareRefusal?'Refus synthétique du contexte.':null,errorCode:catalogPrepareRefusal};notifyCatalogLaunch();return catalogLaunchState},cancel:async id=>{if(catalogLaunchState.preparation?.id===id){catalogLaunchState={...catalogLaunchState,sequence:catalogLaunchState.sequence+1,status:'idle',preparation:null};notifyCatalogLaunch()}return catalogLaunchState},retrySave:async()=>catalogLaunchState});
    contextBridge.exposeInMainWorld('catalogLaunchUIFixture',{refuse:code=>catalogPrepareRefusal=code,configure:p=>catalogPrepared=p,calls:()=>({prepare:catalogPrepareCalls,launch:catalogNativeLaunches}),defer:()=>catalogPrepareDeferred=true,finishPrepare:()=>catalogPrepareRelease?.(),finish:(requestId=null,storage='stored')=>{const p=catalogPrepared,context={projectId:p.projectId,initiativeId:p.captured.initiativeId,conversationId:'catalog-new',providerId:'codex',connectionId:'account-1'},request=requestId??p.id;dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',context,invocation:'$'+p.itemId,mode:p.mode,acknowledged:true,turn:{id:'turn-catalog',requestId:request,context,phase:'completed'}};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[...snapshot.conversations.filter(c=>c.id!==context.conversationId),{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'catalog-command',role:'user',text:p.firstInput},{id:'catalog-response',role:'assistant',text:'Synthetic UI receipt; no native model.'}]}]};catalogLaunchState={...catalogLaunchState,sequence:catalogLaunchState.sequence+1,status:'idle',preparation:null,records:[{schemaVersion:1,conversationId:context.conversationId,context,requestId:request,preparation:p,transmission:'sent',turnId:'turn-catalog',storage}]};notifyCatalogLaunch();stateListeners.forEach(fn=>fn({}));notifyDialogue()}});
    let filesState={contractVersion:1,sequence:0,references:[],previews:[],results:[],issues:[]},filesListeners=[],filesCalls=[],filesDeferred=false,filesRelease,filesPreviewReason=null,filesEditorOutcome=null,filesText='<script>window.UNTRUSTED=true</script><a href="https://evil">link</a>';
    const notifyFiles=()=>filesListeners.forEach(fn=>fn(filesState));
    const filesAction=async(action,referenceId)=>{filesCalls.push({action,referenceId});if(filesDeferred)await new Promise(resolve=>filesRelease=resolve);filesState={...filesState,sequence:filesState.sequence+1,...(action==='preview'?{previews:[...filesState.previews.filter(p=>p.referenceId!==referenceId),{referenceId,status:filesPreviewReason?'refused':'ready',text:filesPreviewReason?null:filesText,reason:filesPreviewReason}]}:{results:[...filesState.results.filter(r=>r.referenceId!==referenceId||r.action!==action),{correlationId:'ui-files-'+filesCalls.length,referenceId,action,status:action==='copy'?'copied':filesEditorOutcome?.status??'transmitted',reason:action==='copy'?'Chemin copié.':filesEditorOutcome?.reason??'Demande transmise à l’éditeur. Ouverture non confirmée.'}]})};notifyFiles();return filesState};
    contextBridge.exposeInMainWorld('projectFiles',{read:async()=>filesState,onChanged:fn=>{filesListeners.push(fn);return()=>{}},preview:id=>filesAction('preview',id),copy:id=>filesAction('copy',id),editor:id=>filesAction('editor',id)});
    contextBridge.exposeInMainWorld('projectFilesUIFixture',{set:value=>{filesState={...value,sequence:filesState.sequence+1};notifyFiles()},state:()=>filesState,calls:()=>filesCalls,defer:()=>filesDeferred=true,finish:()=>{filesDeferred=false;filesRelease?.()},text:value=>filesText=value,previewRefusal:value=>filesPreviewReason=value,editorOutcome:(status,reason)=>filesEditorOutcome={status,reason}});
    let progressState={contractVersion:1,sequence:0,projects:[]},progressListeners=[],progressCalls=[],progressDeferred=false,progressReleases=[];
    const notifyProgress=()=>progressListeners.forEach(fn=>fn(progressState));
    contextBridge.exposeInMainWorld('madnessBmadProgress',{read:async()=>progressState,onChanged:fn=>{progressListeners.push(fn);return()=>{}},collect:async(projectId)=>{progressCalls.push(projectId);if(progressDeferred)await new Promise(resolve=>progressReleases.push(resolve));return progressState}});
    contextBridge.exposeInMainWorld('bmadProgressUIFixture',{set:value=>{progressState={...value,sequence:progressState.sequence+1};notifyProgress()},calls:()=>progressCalls,defer:()=>progressDeferred=true,finish:()=>progressReleases.shift()?.(),emitOld:value=>progressListeners.forEach(fn=>fn(value))});
    let helpState={contractVersion:1,sequence:0,status:'idle',freshness:'none',monitoring:'unarmed',projectId:null,bundle:null,records:[],error:null},helpListeners=[],helpCalls=[];
    contextBridge.exposeInMainWorld('madnessHelp',{read:async()=>helpState,onChanged:listener=>{helpListeners.push(listener);return()=>{}},prepare:async(projectId)=>{helpCalls.push('prepare');helpState={...helpState,projectId,sequence:helpState.sequence+1};return helpState},copy:async()=>{helpCalls.push('copy');return helpState},retrySave:async(conversationId)=>{helpCalls.push('retry-save:'+conversationId);helpState={...helpState,sequence:helpState.sequence+1,records:helpState.records.map(record=>record.conversationId===conversationId?{...record,storage:'stored'}:record)};return helpState}});
    contextBridge.exposeInMainWorld('connectionUIFixture',{emitDialogue:value=>dialogueListeners.forEach(listener=>listener(value)),asyncConflict:value=>asyncConflict=value,cancels:()=>cancels,helpCalls:()=>helpCalls,setHelp:value=>{helpState={...value,sequence:helpState.sequence+1};helpListeners.forEach(listener=>listener(helpState))},failLaunch:value=>{launchFailure=value},deferSelections:()=>{deferredSelections=true},selectionCount:()=>selectionRequests.length,finishSelection:index=>selectionRequests[index].resolve(),failSelection:index=>selectionRequests[index].reject(Error('SELECTION_FAILED')),observeStops:()=>observeStops,approvalDecisions:()=>approvalDecisions,adjustmentSends:()=>adjustmentSends,questionSaves:()=>questionSaves,questionAnswers:()=>questionAnswers,failAppearance:value=>{appearanceFailure=value},setState:value=>{state={...state,...value,sequence:state.sequence+1};listeners.forEach(listener=>listener(state))},setSnapshot:value=>{snapshot={...snapshot,...value};stateListeners.forEach(listener=>listener({}))},setDialogue:value=>{dialogue={...dialogue,...value,sequence:dialogue.sequence+1};notifyDialogue()},sent:()=>sent,copies:()=>copies,unknownOnStop:()=>{unknownOnStop=true},supportCalls:()=>supportCalls,verifies:()=>verifies,failSupport:action=>{supportFailure=action},deferSupport:()=>{supportDeferred=true},finishSupport:()=>{supportDeferred=false;finishSupport?.()}});
  `)
})
after(async () => {
  if (app) { await app.close(); app=null }
  if (!root) return
  const ownedPath=root.replaceAll("'","''"),script="$ErrorActionPreference='Stop'; $ownedRoot='"+ownedPath+"'; $found=@(Get-CimInstance Win32_Process -Filter \"Name='electron.exe'\" | Where-Object {$_.CommandLine -and $_.CommandLine.IndexOf($ownedRoot,[StringComparison]::OrdinalIgnoreCase) -ge 0} | ForEach-Object {@{pid=$_.ProcessId;parentPid=$_.ParentProcessId;executable=$_.ExecutablePath}}); ConvertTo-Json -Compress -InputObject $found"
  const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:15000})
  const remaining=JSON.parse(stdout.trim())
  assert.deepEqual(remaining,[],'Synthetic profile retained: real Main or descendants still reference '+root)
  const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^madness-ui-review-[A-Za-z0-9]+$/)
  console.log(JSON.stringify({fixtureClosure:{bootstrap:join(root,'main.cjs'),profile:join(root,'profile'),ownedMainAndDescendantsRemaining:remaining,cleanup:'verified-before-delete'}}))
  await rm(actual,{recursive:true,force:true})
})
async function settingsLanguage(){const panel=page.locator('#codex-connection-panel');if(!await panel.count())await page.locator('.settings-trigger').click();await panel.waitFor();return panel.locator('.language-toggle')}
async function closeSettings(){if(await page.locator('#codex-connection-panel').count())await page.locator('.settings-trigger').click()}
async function launch(state = {}, initial = {}) {
  if (app) { await app.close(); app = null }
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP'].includes(key.toUpperCase())))
  app = await electron.launch({ executablePath: require('electron'), args: [join(root, 'main.cjs')], env: { ...env, APPDATA: join(root, 'appdata'), LOCALAPPDATA: join(root, 'localappdata') }, timeout: 30000 })
  const native=await app.evaluate(({app},bootstrap)=>({pid:process.pid,executable:process.execPath,profile:app.getPath('userData'),bootstrapAttested:process.argv.includes(bootstrap)}),join(root,'main.cjs'))
  assert.equal(native.bootstrapAttested,true);assert.equal(native.profile,join(root,'profile'));assert.equal(native.executable.toLowerCase(),require('electron').toLowerCase())
  page = await app.firstWindow()
  await page.waitForFunction(() => !!window.connectionUIFixture)
  // Each fixture starts at 100%: Chromium persists per-origin zoom in this shared synthetic profile.
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1))
  await page.evaluate((value) => window.connectionUIFixture.setState(value), state)
  await page.evaluate(initial=>{if(initial.snapshot)window.connectionUIFixture.setSnapshot(initial.snapshot);if(initial.context)window.bmadContextUIFixture.set(initial.context)},initial)
  const css=(await readFile(join(repository,'src/renderer/src/files.css'),'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/styles.css'), 'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/help.css'), 'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/atelier-immersion.css'), 'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/atelier-controls.css'), 'utf8'))+'\n'+(await readFile(join(repository,'src/renderer/src/initiatives.css'),'utf8'))
  await page.addStyleTag({ content: css.replaceAll("url('./assets/atelier/", "url('"+pathToFileURL(join(repository,'src/renderer/src/assets/atelier')+'/').href) })
  await page.addStyleTag({content:await readFile(join(repository,'src/renderer/src/progress.css'),'utf8')})
  await page.addStyleTag({content:await readFile(join(repository,'src/renderer/src/catalog.css'),'utf8')})
  await page.addStyleTag({content:await readFile(join(repository,'src/renderer/src/library.css'),'utf8')})
  await page.addScriptTag({ content: bundle })
  await page.getByRole('heading', { name: initial.snapshot?.activeProjectId ? initial.snapshot.projects.find(p=>p.id===initial.snapshot.activeProjectId).name : 'Vos projets, au même endroit', exact: true }).waitFor()
  await page.evaluate(()=>document.fonts.ready)
}
async function workspaceRequestFixture({longHistory=false}={}){
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'p-priority',initiativeId:'initiative-test',conversationId:'c-priority',providerId:'codex',connectionId:'account-1'}
 const question={schemaVersion:1,id:'q-priority',context,requestId:'request-priority',turnId:'turn-priority',identity:{kind:'unknown'},fields:[{id:'answer',header:'Direction',prompt:'Quelle direction pour cette demande précise ?',allowOther:true,options:[]}],values:{answer:'Réponse propre à la demande'},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:Date.now()+600000,revision:1,storage:'stored'}
 const approval={schemaVersion:1,id:'a-priority',context,requestId:question.requestId,turnId:question.turnId,identity:{kind:'unknown'},mode:'file-approval',files:[{path:'C:/priority/proposition.md',kind:'add',diff:'Patch natif complet à examiner.',beforeSha256:null,afterSha256:'a'.repeat(64)}],reason:null,adjustment:'Ajustement conservé',adjustmentStatus:'draft',status:'waiting',decision:null,transmission:'none',effect:'pending',result:null,createdAt:new Date().toISOString(),expiresAt:Date.now()+600000,revision:1,storage:'stored'}
 await page.evaluate(({context,question,approval,longHistory})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet personnel de qualification avec un nom réellement très long pour garder le contexte visible',rootPath:'C:/priority',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[{id:'history-priority',role:'assistant',text:longHistory?'Ancien échange conservé.\n'.repeat(150):'Une phrase historique conservée.'}]}]});window.connectionUIFixture.setDialogue({status:'waiting-question',context,acknowledged:true,turn:{id:question.turnId,requestId:question.requestId,context,phase:'streaming'},questions:[{...question,id:'q-old',requestId:'old-request',turnId:'old-turn',status:'inactive',reason:'reopened'},question],approvals:[{...approval,id:'a-old',requestId:'old-request',turnId:'old-turn',status:'inactive',reason:'reopened',adjustment:'Ancien ajustement exact'}]})},{context,question,approval,longHistory})
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 return {context,question,approval}
}
async function atelierFixture(width=1440){
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await app.evaluate(({BrowserWindow},width)=>BrowserWindow.getAllWindows()[0].setContentSize(width,920),width)
 const context={projectId:'p-atelier',initiativeId:'initiative-test',conversationId:'c-atelier',providerId:'codex',connectionId:'account-1'}
 const names=['Mary','John','Sofia','Winston','Sally','Amelia','Smithy']
 const messages=names.map((name,order)=>({id:'portrait-'+name,context,requestId:'request-atelier',turnId:'turn-atelier',order:order+1,revision:1,text:'Message de présentation synthétique '+name,phase:'complete',storage:'stored',identity:{kind:'attested',name,source:'source-native-'+name}}))
 messages.push(...[{kind:'unknown'},{kind:'attested',name:'Mary bis',source:'source-hors-casting'},{kind:'attested',name:'mary',source:'source-minuscule'}].map((identity,i)=>({...messages[0],id:'unknown-'+i,order:8+i,identity,text:'Mary $bmad-agent-analyst Forge $bmad — ce texte ne prouve aucun auteur.'})))
 assert.ok(messages.every(isDialogueMessage),'Atelier projections must satisfy the real per-message contract.')
 await page.evaluate(({context,messages})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet atelier',rootPath:'C:/atelier',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'historical-unknown',role:'assistant',text:'Mary dans un historique sans projection.'}]}]});window.connectionUIFixture.setDialogue({status:'ready',context,messages,invocation:'$bmad-forge-idea'})},{context,messages})
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 return {context,messages,names}
}

async function initiativeFixture({question=false,long=false}={}){
 if(question)await workspaceRequestFixture();else{
  await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false});
  await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'p-context',name:'Projet initiatives',rootPath:'C:/project',openedAt:new Date().toISOString()}]}))
  await page.locator('.project-row').first().click()
 }
 const projectId=question?'p-priority':await page.evaluate(async()=>{const r=await window.madness.readState();return r.value.state.activeProjectId})
 const name=long?'beta-'+('initiative-avec-nom-long-'.repeat(7)):'beta'
 const fixtureState=await page.evaluate(({projectId,name})=>{
  const project={projectId,status:'ready',freshness:'current',monitoring:'watching',storage:'stored',error:null,selection:{schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:1,initiativeId:'alpha'},observation:{schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:'a'.repeat(64),observedAt:new Date().toISOString(),status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:['alpha',name].map(id=>({id:id.length<=80?id:null,name:id,path:'C:/project/_bmad-output/'+id,source:'C:/project/_bmad-output/'+id+'/'+id+'.md',revision:'b'.repeat(64)})),sources:[],problems:[]}}
  const state={contractVersion:1,sequence:1,projects:[project]};window.bmadContextUIFixture.set(state);return state
 },{projectId,name})
 assert.ok(isBmadContextState(fixtureState),'Initiative UI fixture must satisfy the shipped contract')
 await page.locator('.initiative-control').getByText('alpha',{exact:true}).waitFor()
 return {projectId,name}
}

async function resumeFixture(){
 const {projectId}=await initiativeFixture()
 const captured={projectId,initiativeId:'alpha',conversationId:'resume-alpha',providerId:'codex',connectionId:'captured-account'}
 await page.evaluate(({projectId,captured})=>{window.connectionUIFixture.setState({status:'disconnected',accountStored:false,needsPlanAcknowledgement:false});window.connectionUIFixture.setSnapshot({drafts:[{projectId,text:'Brouillon exact de reprise 🧭',savedAt:'2026-11-03T10:00:00Z'}],conversations:[{id:captured.conversationId,context:captured,lastKnownActivity:'idle',messages:[{id:'resume-message',role:'assistant',text:'Texte local reçu pour alpha, sans relance.'}]}]});const observation={schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:'a'.repeat(64),observedAt:'2026-11-03T10:00:00Z',status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:['alpha','beta'].map(id=>({id,name:id,path:'C:/project/_bmad-output/'+id,source:'C:/project/_bmad-output/'+id+'/'+id+'.md',revision:'b'.repeat(64)})),sources:[],problems:[]};window.bmadContextUIFixture.set({contractVersion:1,sequence:2,projects:[{projectId,status:'ready',freshness:'current',monitoring:'watching',storage:'stored',error:null,observation,selection:{schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:2,initiativeId:'beta'}}]})},{projectId,captured})
 const snapshot={schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',initiativeId:'beta',initiativePath:'C:/project/_bmad-output/beta',contextRevision:'a'.repeat(64),revision:'c'.repeat(64),observedAt:'2026-11-03T10:01:00Z',coverage:'partial',sources:[{id:'source-1',kind:'entry',path:'C:/project/_bmad-output/beta/tickets/epic-a/tickets/tickets.toml',relativePath:'tickets/epic-a/tickets/tickets.toml',sha256:'d'.repeat(64),bytes:200,modifiedAt:'2026-11-03T09:00:00Z'},{id:'source-2',kind:'plan',path:'C:/project/_bmad-output/beta/tickets/epic-a/tickets/story-plan.md',relativePath:'tickets/epic-a/tickets/story-plan.md',sha256:'e'.repeat(64),bytes:300,modifiedAt:'2026-11-03T09:00:00Z'}],declarations:[{sourceId:'source-1',container:'tickets/epic-a',ticketId:'1',title:'Entrée sans feuille',field:'status',value:'in-progress',line:4},{sourceId:'source-2',container:'tickets/epic-a',ticketId:'1',title:'Entrée sans feuille',field:'status',value:'built',line:5}],excerpts:[{sourceId:'source-2',category:'decisions',heading:'Décisions locales',text:'Proposition <script>window.evidenceExecuted=true</script> littérale.\n',startLine:8,endLine:8}],problems:['Qualification volumineuse hors portée ; information non établie.']}
 assert.ok(isBmadProgressSnapshot(snapshot))
 return {snapshot,projectId,captured,set:async(value=snapshot,status='ready')=>page.evaluate(({snapshot,status})=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:1,projects:[{projectId:snapshot.projectId,generation:1,status,freshness:status==='ready'?'current':'stale',monitoring:'watching',queued:false,snapshot,errorCode:null,error:null}]}),{snapshot:value,status})}
}
test('reprise: hors ligne, declarations exactes, preuves inertes et retour capture alpha conservent la saisie',async()=>{
 const f=await resumeFixture(),region=page.getByRole('region',{name:'Reprise du projet',exact:true})
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)})
 const viewport=await setWorkspaceViewport(app,page,{width:1440,height:920});assert.ok(Math.abs(viewport.actual.width-1440)<=1);assert.ok(viewport.actual.queries.every(query=>query.matches===query.expected));console.log(JSON.stringify({resumeUiViewport:{case:'offline-captured-conversation',viewport}}))
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[])
 const read=region.getByRole('button',{name:'Lire les preuves du projet',exact:true});await page.waitForFunction(()=>document.querySelector('.resume-heading button')?.disabled===false);await read.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>window.bmadProgressUIFixture.calls().length===1);assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[f.projectId])
 await f.set();await region.locator('.resume-states > summary').click();await region.getByText('Déclarations contradictoires — chaque source est conservée séparément.',{exact:true}).waitFor();await region.getByText('Travail restant non établi',{exact:true}).waitFor()
 await region.locator('summary').filter({hasText:'Voir la preuve de Décisions locales'}).click();await region.getByText('Proposition <script>window.evidenceExecuted=true</script> littérale.',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>window.evidenceExecuted),undefined)
 assert.equal(await region.locator('code').filter({hasText:'e'.repeat(64)}).count()>0,true)
 await region.getByRole('button',{name:'Rejoindre l’échange · alpha',exact:true}).click();await page.getByRole('tab',{name:'Conversation',exact:true}).getAttribute('aria-selected').then(value=>assert.equal(value,'true'));assert.equal(await page.locator('textarea#draft').inputValue(),'Brouillon exact de reprise 🧭')
 await page.locator('textarea#draft').fill('Brouillon modifié sans envoi 🧭');await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('textarea#draft').inputValue(),'Brouillon modifié sans envoi 🧭');assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
})
test('reprise: Q2 identite de fichier ne se presente pas comme id natif',async()=>{
 const f=await resumeFixture(),value=structuredClone(f.snapshot),region=page.getByRole('region',{name:'Reprise du projet',exact:true})
 value.sources[0]={...value.sources[0],kind:'leaf',path:value.initiativePath+'/tickets/epic-a/tickets/story-demo.md',relativePath:'tickets/epic-a/tickets/story-demo.md'}
 value.declarations.forEach(d=>{d.ticketId='@file:'+'b'.repeat(64);d.title='story-demo'})
 await f.set(value);await region.locator('.resume-states > summary').click()
 await region.getByRole('heading',{name:'story-demo · Identité de fichier · id natif inconnu',exact:true}).waitFor()
 assert.equal(await region.getByRole('heading',{level:4}).textContent(),'story-demo · Identité de fichier · id natif inconnu');assert.equal(await region.locator('.resume-ticket li code').allTextContents().then(values=>values.join(',')),'in-progress,built')
})

test('reprise: Q3 retour de conversation restaure preuves recap et position de la meme capture seulement',async()=>{
 const f=await resumeFixture();await f.set();const region=page.getByRole('region',{name:'Reprise du projet',exact:true})
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)})
 await setWorkspaceViewport(app,page,{width:1440,height:920})
 await region.locator('.resume-states > summary').click()
 const proof=region.locator('.resume-ticket .resume-proof');await proof.locator('summary').click()
 const literal=region.locator('.resume-proof').filter({has:page.locator('summary').filter({hasText:'Voir la preuve de Décisions locales'})});await literal.locator('summary').click()
 const recap=region.locator('.turn-recap');await recap.locator('summary').first().click();await recap.getByText('Résultat proposé',{exact:true}).waitFor()
 const open=recap.getByRole('button',{name:'Retrouver la conversation',exact:true});await open.scrollIntoViewIfNeeded()
 const top=await page.locator('main').evaluate(e=>e.scrollTop);assert.ok(top>100)
 await open.click();await page.getByRole('tab',{name:'Conversation',exact:true}).getAttribute('aria-selected').then(value=>assert.equal(value,'true'))
 assert.equal(await page.getByRole('region',{name:'Reprise du projet',exact:true}).count(),0);assert.equal(await page.locator('textarea#draft').inputValue(),'Brouillon exact de reprise 🧭')
 await page.locator('textarea#draft').fill('Brouillon de retour exact 🧭');await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 await region.waitFor();assert.equal(await region.locator('.resume-states').evaluate(e=>e.open),true);assert.equal(await proof.evaluate(e=>e.open),true);assert.equal(await literal.evaluate(e=>e.open),true);assert.equal(await recap.evaluate(e=>e.open),true)
 await recap.getByText('Résultat proposé',{exact:true}).waitFor();assert.ok(Math.abs(await page.locator('main').evaluate(e=>e.scrollTop)-top)<=2)
 assert.equal(await region.getByRole('navigation',{name:'Accès aux informations de reprise',exact:true}).getByRole('button').count(),4)
 // Sally 2.5: arriving revision retains reading until the explicit switch; another root closes it.
 await region.getByRole('button',{name:'Rejoindre l’échange · alpha',exact:true}).click();const next={...structuredClone(f.snapshot),revision:'f'.repeat(64)};await f.set(next);await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 assert.equal(await region.locator('.resume-states').evaluate(e=>e.open),true);assert.equal(await region.locator('.turn-recap').evaluate(e=>e.open),true)
 const show=region.getByRole('button',{name:'Afficher la nouvelle observation',exact:true});await show.click();assert.equal(await region.locator('.resume-states').evaluate(e=>e.open),false);assert.equal(await show.evaluate(e=>e===document.activeElement),true)
 await page.getByRole('tab',{name:'Conversation',exact:true}).click();await f.set();await page.evaluate(({projectId})=>window.connectionUIFixture.setSnapshot({projects:[{id:projectId,name:'Racine remplacée',rootPath:'C:/replaced',openedAt:'2026-11-03T10:00:00Z'}]}),{projectId:f.projectId});await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 assert.equal(await region.locator('.resume-states').evaluate(e=>e.open),false);assert.equal(await region.locator('.turn-recap').evaluate(e=>e.open),false)
 await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('textarea#draft').inputValue(),'Brouillon de retour exact 🧭');await page.getByText('Texte local reçu pour alpha, sans relance.',{exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[]);assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
})

test('reprise: captures anciennes, details clavier, deux themes, compact et zoom 200 sans debordement',async()=>{
 const f=await resumeFixture();await f.set();const region=page.getByRole('region',{name:'Reprise du projet',exact:true})
 await page.evaluate(({projectId})=>{window.bmadContextUIFixture.set({contractVersion:1,sequence:20,projects:[{projectId,status:'idle',freshness:'none',monitoring:'unarmed',storage:'stored',error:null,observation:null,selection:{schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:3,initiativeId:'alpha'}}]})},{projectId:f.projectId})
 await region.getByText(/Dernière observation.*beta.*Observation ancienne/).waitFor()
 await region.locator('.resume-states > summary').focus();await page.keyboard.press('Enter')
 const proof=region.locator('summary').filter({hasText:'Voir la preuve de Entrée sans feuille'});await proof.focus();await page.keyboard.press('Enter');assert.equal(await proof.evaluate(e=>e.parentElement.open),true);await page.keyboard.press('Enter');assert.equal(await proof.evaluate(e=>e.parentElement.open),false)
 for(const theme of ['dark','light'])for(const [width,zoom] of [[1440,1],[720,1],[1440,2]]){
  await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)})
  const viewportAt100=await setWorkspaceViewport(app,page,{width,height:920});assert.ok(viewportAt100.actual.queries.every(query=>query.matches===query.expected))
  await app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom);await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme)
  await page.waitForFunction(({width,zoom})=>Math.abs(innerWidth-width/zoom)<=1&&Math.abs(innerHeight-920/zoom)<=1,{width,zoom})
  const geometry=await region.evaluate(e=>({width:innerWidth,height:innerHeight,compact:matchMedia('(max-width: 720px)').matches,docked:matchMedia('(min-width: 1323px)').matches,scroll:document.documentElement.scrollWidth,region:e.getBoundingClientRect().width,client:e.clientWidth,scrollRegion:e.scrollWidth,font:getComputedStyle(e).fontFamily}));assert.ok(Math.abs(geometry.width-width/zoom)<=1);assert.ok(Math.abs(geometry.height-920/zoom)<=1);assert.equal(geometry.compact,width/zoom<=720);assert.equal(geometry.docked,width/zoom>=1323);assert.ok(geometry.scroll<=geometry.width+1,JSON.stringify({theme,width,zoom,geometry}));assert.ok(geometry.scrollRegion<=geometry.client+1);assert.match(geometry.font,/Oxanium/);console.log(JSON.stringify({resumeUiViewport:{theme,width,zoom,viewportAt100,geometry}}))
 }
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('reprise: annonce du projet precedent effacee dans une destination sans projection',async()=>{
 const f=await resumeFixture();await f.set(f.snapshot,'reading');const region=page.getByRole('region',{name:'Reprise du projet',exact:true})
 await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent.includes('Lecture locale en cours'))
 await f.set();
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)})
 await setWorkspaceViewport(app,page,{width:1440,height:920})
 await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent.includes('Lecture locale terminée'))
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'p-context',name:'Projet initiatives',rootPath:'C:/project',openedAt:'2026-11-03T10:00:00Z'},{id:'project-other',name:'Projet sans projection',rootPath:'C:/other',openedAt:'2026-11-03T10:00:00Z'}]}))
 await page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet Projet sans projection',exact:true}).click()
 await region.getByText('Les preuves du projet n’ont pas été lues dans cette session.',{exact:true}).waitFor()
 assert.equal(await region.locator('.resume-announcement').textContent(),'')
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[])
})
test('reprise: passive mount and initiative change clear late announcements; language change never reads',async()=>{
 const f=await resumeFixture();await f.set();const notice=page.locator('.resume-announcement')
 await page.waitForFunction(()=>document.querySelector('.resume-observation')?.textContent.includes('beta'));assert.equal(await notice.textContent(),'')
 await f.set(f.snapshot,'reading');await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent.includes('Lecture locale en cours'))
 await page.evaluate(async()=>{const state=await window.madnessBmadContext.read();state.projects[0].selection.initiativeId='alpha';window.bmadContextUIFixture.set(state)})
 await page.waitForFunction(()=>document.querySelector('.resume-heading .small')?.textContent.includes('alpha'));assert.equal(await notice.textContent(),'')
 await f.set();await page.waitForFunction(()=>!document.querySelector('.resume-activity'));assert.equal(await notice.textContent(),'')
 await (await settingsLanguage()).click();await page.waitForFunction(()=>document.documentElement.lang==='en');assert.equal(await notice.textContent(),'')
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('reprise: queued invalidations and the aborted old read stay silent before the real new read completes',async()=>{
 const f=await resumeFixture();await f.set();const region=page.getByRole('region',{name:'Reprise du projet',exact:true}),notice=region.locator('.resume-announcement'),heading=region.getByRole('heading',{name:'Reprise du projet',exact:true}),settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
 await region.locator('.resume-observation').waitFor();assert.equal(await notice.textContent(),'','passive ready stays silent');await f.set(f.snapshot,'reading');await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent.includes('Lecture locale en cours'));await heading.focus()
 const queued={projectId:f.projectId,generation:2,status:'reading',freshness:'stale',monitoring:'unarmed',queued:true,snapshot:f.snapshot,errorCode:null,error:null}
 await page.evaluate(async value=>{const context=await window.madnessBmadContext.read();context.projects[0].selection={...context.projects[0].selection,initiativeId:'alpha',revision:3};window.bmadContextUIFixture.set(context);window.bmadProgressUIFixture.set({contractVersion:1,sequence:20,projects:[value]})},queued);await settle()
 assert.equal(await notice.textContent(),'','context reset must not adopt the old queued read');assert.equal(await heading.evaluate(e=>e===document.activeElement),true)
 await page.evaluate(value=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:21,projects:[value]}),{...queued,generation:3});await settle()
 assert.equal(await notice.textContent(),'','another queued invalidation must not start an announcement batch')
 await page.evaluate(value=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:22,projects:[value]}),{...queued,generation:3,status:'error',errorCode:'READ_REFUSED',error:'Lecture locale refusée ou périmée — les preuves précédentes restent historiques.'});await settle()
 assert.equal(await notice.textContent(),'','aborted old operation must not announce its failure');assert.equal(await heading.evaluate(e=>e===document.activeElement),true)
 const current={...queued,generation:4,status:'reading',queued:false,errorCode:null,error:null}
 await page.evaluate(value=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:23,projects:[value]}),current);await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent==='Lecture locale en cours…')
 const snapshot={...structuredClone(f.snapshot),initiativeId:'alpha',initiativePath:'C:/project/_bmad-output/alpha',revision:'f'.repeat(64),sources:f.snapshot.sources.map(source=>({...source,path:source.path.replace('/beta/','/alpha/')}))};assert.ok(isBmadProgressSnapshot(snapshot))
 await page.evaluate(value=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:24,projects:[value]}),{...current,status:'ready',freshness:'current',snapshot});await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent==='Lecture locale terminée · 2 sources')
 assert.match(await region.locator('.resume-observation').textContent(),/beta/);assert.equal(await region.locator('.resume-collection > code').textContent(),f.snapshot.revision);assert.equal(await heading.evaluate(e=>e===document.activeElement),true)
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[]);assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('reprise: entering another project or initiative already reading announces only its own real completion',async()=>{
 const f=await resumeFixture();await f.set();const region=page.getByRole('region',{name:'Reprise du projet',exact:true}),notice=region.locator('.resume-announcement')
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)});await setWorkspaceViewport(app,page,{width:1440,height:920});await region.locator('.resume-observation').waitFor();assert.equal(await notice.textContent(),'','passive ready mount stays silent')
 await f.set(f.snapshot,'reading');await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent.includes('Lecture locale en cours'))
 const b=structuredClone(f.snapshot);b.projectId='resume-reading-b';b.rootPath='C:/reading-b';b.rootIdentity='root-reading-b';b.initiativeId='gamma';b.initiativePath=b.rootPath+'/_bmad-output/gamma';b.revision='f'.repeat(64);b.sources=b.sources.slice(0,1).map(source=>({...source,path:b.initiativePath+'/'+source.relativePath}));b.declarations=b.declarations.filter(d=>d.sourceId===b.sources[0].id);b.excerpts=[];assert.ok(isBmadProgressSnapshot(b))
 const states=await page.evaluate(async({a,b})=>{
  const context=await window.madnessBmadContext.read(),original=context.projects[0],observation={...original.observation,projectId:b.projectId,rootPath:b.rootPath,rootIdentity:b.rootIdentity,activeInitiative:'gamma',initiatives:['gamma','delta'].map(id=>({id,name:id,path:b.rootPath+'/_bmad-output/'+id,source:'fixture-only',revision:'b'.repeat(64)}))},next={...original,projectId:b.projectId,observation,selection:{...original.selection,projectId:b.projectId,rootPath:b.rootPath,rootIdentity:b.rootIdentity,initiativeId:'gamma'}}
  window.connectionUIFixture.setSnapshot({projects:[{id:a.projectId,name:'Projet initiatives',rootPath:a.rootPath,openedAt:a.observedAt},{id:b.projectId,name:'Projet B déjà en lecture',rootPath:b.rootPath,openedAt:b.observedAt}]})
  const contextState={...context,projects:[original,next]};window.bmadContextUIFixture.set(contextState)
  const value=(snapshot,status,generation)=>({projectId:snapshot.projectId,generation,status,freshness:status==='ready'?'current':'stale',monitoring:'watching',queued:false,snapshot:status==='reading'&&snapshot.projectId===b.projectId?null:snapshot,errorCode:null,error:null})
  const projects=[value(a,'reading',1),value(b,'reading',2)];window.bmadProgressUIFixture.set({contractVersion:1,sequence:20,projects});return {contextState,projects}
 },{a:f.snapshot,b});assert.ok(isBmadContextState(states.contextState))
 await page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet Projet B déjà en lecture',exact:true}).click();await region.locator('.resume-heading .small').filter({hasText:'gamma'}).waitFor();await region.locator('.resume-activity').waitFor()
 assert.match(await notice.textContent(),/Lecture locale en cours/,'entering B during its real read announces reading')
 await page.waitForFunction(()=>document.querySelector('.project-heading h1')===document.activeElement);const heading=region.getByRole('heading',{name:'Reprise du projet',exact:true});await heading.focus()
 const aReady={...states.projects[0],status:'ready',freshness:'current'},bReading=states.projects[1]
 await page.evaluate(projects=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:21,projects}),[aReady,bReading]);assert.match(await notice.textContent(),/Lecture locale en cours/,'late A completion cannot finish B');assert.equal(await heading.evaluate(e=>e===document.activeElement),true)
 const bReady={...bReading,status:'ready',freshness:'current',snapshot:b};await page.evaluate(projects=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:22,projects}),[aReady,bReady]);await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent==='Lecture locale terminée · 1 source');assert.equal(await heading.evaluate(e=>e===document.activeElement),true)
 await page.evaluate(async projects=>{const context=await window.madnessBmadContext.read();context.projects.find(p=>p.projectId==='resume-reading-b').selection.initiativeId='delta';window.bmadContextUIFixture.set(context);window.bmadProgressUIFixture.set({contractVersion:1,sequence:23,projects})},[aReady,{...bReady,status:'reading',freshness:'stale',generation:3}]);await page.waitForFunction(()=>document.querySelector('.resume-heading .small')?.textContent.includes('delta'));assert.match(await notice.textContent(),/Lecture locale en cours/,'new-generation read survives an initiative switch with its previous snapshot retained')
 const deltaPath=b.rootPath+'/_bmad-output/delta',delta={...b,initiativeId:'delta',initiativePath:deltaPath,revision:'e'.repeat(64),sources:[...b.sources.map(source=>({...source,path:deltaPath+'/'+source.relativePath})),...['second','third'].map(name=>({...b.sources[0],id:'source-delta-'+name,kind:'document',relativePath:name+'.md',path:deltaPath+'/'+name+'.md'}))]};assert.ok(isBmadProgressSnapshot(delta))
 await page.evaluate(projects=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:24,projects}),[aReady,{...bReady,generation:3,snapshot:delta}]);await page.waitForFunction(()=>document.querySelector('.resume-announcement')?.textContent.includes('Lecture locale terminée'));assert.equal(await notice.textContent(),'Lecture locale terminée · 3 sources','completion counts the newly read sources, not the retained presentation');assert.match(await region.locator('.resume-observation').textContent(),/gamma/);assert.equal(await region.locator('.resume-observation').textContent().then(text=>text.includes('delta')),false);assert.equal(await region.locator('.resume-collection > code').textContent(),b.revision);assert.equal(await region.getByRole('button',{name:'Afficher la nouvelle observation',exact:true}).getAttribute('aria-disabled'),'false');assert.equal(await heading.evaluate(e=>e===document.activeElement),true)
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('reprise: liste longue repliee et acces clavier aux quatre groupes avant les tickets',async()=>{
 const f=await resumeFixture(),value=structuredClone(f.snapshot),region=page.getByRole('region',{name:'Reprise du projet',exact:true})
 value.declarations.push(...Array.from({length:120},(_,index)=>({sourceId:'source-1',container:'tickets/epic-a',ticketId:String(index+3),title:'Entrée de qualification '+(index+3),field:'existence',value:'entry',line:4})))
 value.excerpts.push({sourceId:'source-2',category:'remaining',heading:'Travail restant de qualification',text:'Reste connu de la fixture, sans synthèse.',startLine:10,endLine:10})
 assert.ok(isBmadProgressSnapshot(value));await f.set(value)
 const access=region.getByRole('navigation',{name:'Accès aux informations de reprise',exact:true});assert.equal(await access.count(),1)
 const states=region.locator('.resume-states');assert.equal(await states.evaluate(e=>e.open),false);assert.equal(await region.locator('.resume-ticket:visible').count(),0)
 const buttons=access.getByRole('button');assert.equal(await buttons.count(),4);await buttons.first().focus();await page.keyboard.press('Tab');assert.equal(await buttons.nth(1).evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter')
 assert.equal(await region.getByRole('heading',{name:'Résultats et décisions connus',exact:true}).evaluate(e=>e===document.activeElement),true);assert.equal(await states.evaluate(e=>e.open),false)
 await access.getByRole('button',{name:'Récapitulatifs disponibles',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await region.getByRole('heading',{name:'Récapitulatifs disponibles',exact:true}).evaluate(e=>e===document.activeElement),true)
 await region.getByText('Contexte capturé : alpha · resume-alpha',{exact:true}).waitFor()
 await access.getByRole('button',{name:'Travail restant connu',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await region.getByRole('heading',{name:'Travail restant connu',exact:true}).evaluate(e=>e===document.activeElement),true)
 const remaining=region.locator('summary').filter({hasText:'Voir la preuve de Travail restant de qualification'});await remaining.focus();await page.keyboard.press('Enter');await region.getByText('Reste connu de la fixture, sans synthèse.',{exact:true}).waitFor();assert.equal(await states.evaluate(e=>e.open),false)
 await states.locator('summary').first().focus();await page.keyboard.press('Enter');assert.equal(await region.locator('.resume-ticket').count(),121);await region.getByText('Déclarations contradictoires — chaque source est conservée séparément.',{exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('initiatives: restauration et changement de projet restent passifs, observation explicite conservée',async()=>{
 const ids=['project-a','project-b']
 const initial={snapshot:{projects:ids.map(id=>({id,name:id,rootPath:'C:/'+id,openedAt:new Date().toISOString()})),activeProjectId:'project-a'},context:{contractVersion:1,sequence:1,projects:ids.map((projectId,index)=>({projectId,status:'idle',freshness:'none',monitoring:'unarmed',observation:null,selection:{schemaVersion:1,projectId,rootPath:'C:/'+projectId,rootIdentity:'root-'+projectId,revision:1,initiativeId:index===0?'alpha':'beta'},storage:'stored',error:null}))}}
 assert.ok(isBmadContextState(initial.context))
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false},initial)
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920))
 const trigger=page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true})
 await trigger.getByText('alpha',{exact:true}).waitFor()
 assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),0)
 await page.getByRole('button',{name:'Contexte du projet',exact:true}).click()
 await page.locator('#project-context-panel').getByText('Profil BMad non observé',{exact:true}).waitFor()
 await page.locator('#project-context-panel').getByRole('button',{name:'Fermer le contexte du projet',exact:true}).click()
 await page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet project-b',exact:true}).click();await trigger.getByText('beta',{exact:true}).waitFor()
 assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),0)
 await page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet project-a',exact:true}).click();await trigger.getByText('alpha',{exact:true}).waitFor()
 assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),0)
 await trigger.click();const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true});await modal.waitFor()
 assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),1)
 await modal.getByRole('button',{name:'Actualiser les initiatives',exact:true}).click()
 assert.equal(await page.evaluate(()=>window.bmadContextUIFixture.reads()),2)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.helpCalls()),[])
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.keyboard.press('Escape')
})

test('initiatives: diagnostics explicites dans le choix et le contexte même sans problems',async()=>{
 await initiativeFixture()
 for(const theme of ['dark','light']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme)
  for(const [status,label] of [['absent','Installation BMad non repérée'],['legacy-observed','Traces d’une ancienne installation BMad'],['unknown','Profil BMad non identifié'],['incompatible','Lecture du profil BMad refusée'],['partial','Observation BMad partielle'],['candidate-observed','Profil BMad candidat observé']]){
   const state=await page.evaluate(async status=>{const state=await window.madnessBmadContext.read(),p=state.projects[0];p.observation.status=status;p.observation.problems=[];window.bmadContextUIFixture.set(state);return state},status)
   assert.ok(isBmadContextState(state))
   await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
   const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true});await modal.getByText(label,{exact:true}).waitFor({timeout:4000})
   await page.keyboard.press('Escape');await modal.waitFor({state:'detached'})
   await page.getByRole('button',{name:'Contexte du projet',exact:true}).click()
   const panel=page.locator('#project-context-panel');await panel.getByText(label,{exact:true}).waitFor({timeout:4000})
   await panel.getByRole('button',{name:'Fermer le contexte du projet',exact:true}).click()
  }
 }
})

test('initiatives: conflit asynchrone reçu par abonnement vise seulement le projet courant',async()=>{
 const {projectId}=await initiativeFixture()
 await page.evaluate(()=>window.connectionUIFixture.asyncConflict(true))
 await page.getByRole('button',{name:'Préparer Forge',exact:true}).click()
 await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()
 await page.getByRole('button',{name:/Lancer Forge/}).click()
 await page.evaluate(async projectId=>{const current=await window.madnessDialogue.read();window.connectionUIFixture.emitDialogue({...current,sequence:0,status:'error',errorCode:'CONTEXT_MISMATCH',context:{...current.context,projectId}})},projectId)
 assert.equal(await page.locator('.initiative-dialog[open]').count(),0)
 await page.evaluate(projectId=>window.connectionUIFixture.setDialogue({status:'error',errorCode:'CONTEXT_MISMATCH',invocation:'$bmad-forge-idea',context:{projectId,initiativeId:'alpha',conversationId:null,providerId:null,connectionId:null}}),projectId)
 const modal=page.getByRole('dialog',{name:'Contexte à vérifier',exact:true});await modal.waitFor({timeout:4000})
 await page.keyboard.press('Escape')
 await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'error',errorCode:'CONTEXT_MISMATCH',invocation:'$bmad-forge-idea',context:{projectId:'foreign-project',initiativeId:'alpha',conversationId:null,providerId:null,connectionId:null}}))
 assert.equal(await page.locator('.initiative-dialog[open]').count(),0)
})
test('initiatives: choix tardif après fermeture ne reprend ni focus ni nouvelle ouverture',async()=>{
 for(const reopen of [false,true]){
  await initiativeFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
  await page.evaluate(()=>window.bmadContextUIFixture.deferChoices())
  const trigger=page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
  let modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true})
  await modal.getByRole('button',{name:/^beta/}).click();await page.keyboard.press('Escape');await modal.waitFor({state:'detached'})
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
  if(reopen){await trigger.click();modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true});await modal.getByRole('button',{name:'Fermer le choix d’initiative',exact:true}).focus()}
  else{await page.locator('.composer textarea').fill('Saisie conservée après annulation');assert.equal(await page.locator('.composer textarea').evaluate(e=>e===document.activeElement),true)}
  await page.evaluate(()=>window.bmadContextUIFixture.finishChoice())
  await page.waitForFunction(async()=>{const s=await window.madnessBmadContext.read();return s.projects[0].selection?.initiativeId==='beta'})
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
  if(reopen){assert.equal(await modal.count(),1);assert.equal(await modal.getByRole('button',{name:'Fermer le choix d’initiative',exact:true}).evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape')}
  else{assert.equal(await page.locator('.composer textarea').evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('.composer textarea').inputValue(),'Saisie conservée après annulation')}
 }
})
test('initiatives: choix local, focus et brouillon conservés sans lancement ni réattribution',async()=>{
 const {projectId}=await initiativeFixture()
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const draft=page.locator('.composer textarea');await draft.fill('Mon brouillon reste ici.')
 const trigger=page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
 const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true})
 await modal.waitFor();assert.equal(await modal.locator('[aria-pressed="true"]').evaluate(e=>e===document.activeElement),true)
 await modal.getByRole('button',{name:/^beta/}).click();await modal.waitFor({state:'detached'})
 assert.equal(await trigger.evaluate(e=>e===document.activeElement),true)
 assert.equal(await draft.inputValue(),'Mon brouillon reste ici.')
 assert.deepEqual(await page.evaluate(()=>window.bmadContextUIFixture.choices().map(c=>({projectId:c.projectId,initiativeId:c.initiativeId}))),[{projectId,initiativeId:'beta'}])
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await trigger.click();await page.keyboard.press('Escape');await modal.waitFor({state:'detached'})
 assert.equal(await trigger.evaluate(e=>e===document.activeElement),true)
})
test('initiatives: consultation beta garde la demande alpha et sa réponse exacte',async()=>{
 await initiativeFixture({question:true})
 const trigger=page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
 await page.getByRole('dialog',{name:'Choisir une initiative',exact:true}).getByRole('button',{name:/^beta/}).click()
 const question=page.locator('[data-question-id="q-priority"]')
 assert.match(await question.innerText(),/initiative-test/)
 await question.getByRole('button',{name:'Envoyer cette réponse',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[{questionId:'q-priority',values:{answer:'Réponse propre à la demande'}}])
})
test('initiatives: conservation échouée et ancien résultat restent honnêtes',async()=>{
 const {projectId}=await initiativeFixture();await page.evaluate(()=>window.bmadContextUIFixture.failSave(true))
 await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
 await page.getByRole('dialog',{name:'Choisir une initiative',exact:true}).getByRole('button',{name:/^beta/}).click()
 await page.getByText('Choix de session — non enregistré',{exact:true}).waitFor()
 await page.evaluate(()=>window.bmadContextUIFixture.emitOld({contractVersion:1,sequence:0,projects:[]}))
 await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
 const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true})
 await modal.getByRole('button',{name:'Réessayer l’enregistrement',exact:true}).waitFor()
 assert.match(await modal.innerText(),/beta/)
 await page.keyboard.press('Escape')
})
test('initiatives: clavier, noms longs, compact, deux thèmes et zoom200 sans fuite horizontale',async()=>{
 for(const [theme,width,zoom] of [['dark',720,1],['light',1440,2]]){
  await initiativeFixture({long:true})
  await app.evaluate(({BrowserWindow},{width,zoom})=>{const w=BrowserWindow.getAllWindows()[0];w.setContentSize(width,920);w.webContents.setZoomFactor(zoom)},{width,zoom})
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme)
  await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
  const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true})
  const layout=await modal.evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth,width:e.getBoundingClientRect().width,viewport:innerWidth}))
  assert.ok(layout.scroll<=layout.client+1,JSON.stringify(layout));assert.ok(layout.width<=layout.viewport,JSON.stringify(layout))
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).evaluate(e=>e===document.activeElement),true)
 }
})


test('initiatives: couleurs locales lisibles et métadonnées alignées dans le thème clair',async()=>{
 await initiativeFixture();await page.evaluate(()=>document.documentElement.dataset.theme='light')
 await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
 const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true})
 await page.evaluate(async()=>{
  const state=await window.madnessBmadContext.read();state.projects[0].error='Choix conservé pour cette session — enregistrement échoué.';state.projects[0].storage='failed';window.bmadContextUIFixture.set(state)
 })
 await modal.getByRole('alert').waitFor()
 const styles=await modal.evaluate(el=>{
  const first=el.querySelector('p'),status=el.querySelector('p[role="status"]'),error=el.querySelector('[role="alert"]'),option=el.querySelector('.initiative-option'),meta=option.querySelector('span')
  const css=e=>getComputedStyle(e)
  return {background:css(el).backgroundColor,intro:css(first).color,status:css(status).color,error:css(error).color,errorBackground:css(error).backgroundColor,alignment:css(option).alignItems,textAlign:css(option).textAlign,metadataFont:css(meta).fontFamily,metadataWeight:css(meta).fontWeight}
 })
 const luminance=value=>{const parts=value.match(/[0-9.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*parts[0]+.7152*parts[1]+.0722*parts[2]}
 const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05)}
 assert.ok(contrast(styles.intro,styles.background)>=4.5,JSON.stringify(styles))
 assert.ok(contrast(styles.status,styles.background)>=4.5,JSON.stringify(styles))
 assert.ok(contrast(styles.error,styles.errorBackground)>=4.5,JSON.stringify(styles))
 assert.equal(styles.alignment,'flex-start');assert.equal(styles.textAlign,'left')
 assert.match(styles.metadataFont,/Oxanium/);assert.equal(styles.metadataWeight,'450')
 assert.equal(await modal.locator('.initiative-option :is(button,a,summary,input)').count(),0)
 await page.keyboard.press('Escape')
})
test('initiatives: seul un échange porte le libellé de capture, indépendamment du choix local',async()=>{
 const {projectId}=await initiativeFixture()
 assert.equal(await page.locator('.project-banner > .context-note').count(),0)
 const context={projectId,initiativeId:'alpha',conversationId:'captured-conversation',providerId:'codex',connectionId:'account-1'}
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[]}]}),context)
 await page.getByText('Initiative capturée par cet échange : alpha',{exact:true}).waitFor()
 await page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
 await page.getByRole('dialog',{name:'Choisir une initiative',exact:true}).getByRole('button',{name:/^beta/}).click()
 await page.getByText('Initiative capturée par cet échange : alpha',{exact:true}).waitFor()
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({conversations:[{id:context.conversationId,context:{...context,initiativeId:null},lastKnownActivity:'idle',messages:[]}]}),context)
 await page.getByText('Initiative capturée par cet échange : non identifiée',{exact:true}).waitFor()
})
test('initiatives: choix courant focalisé sans masquer titre et fermeture au compact et zoom200',async()=>{
 for(const [width,zoom] of [[600,1],[1440,2]]){
  await initiativeFixture()
  await app.evaluate(({BrowserWindow},{width,zoom})=>{const w=BrowserWindow.getAllWindows()[0];w.setContentSize(width,820);w.webContents.setZoomFactor(zoom)},{width,zoom})
  await page.evaluate(async()=>{
   const state=await window.madnessBmadContext.read(),p=state.projects[0],template=p.observation.initiatives[0]
   p.observation.initiatives=[template,...Array.from({length:30},(_,n)=>{const id='initiative-'+(n+1);return {...template,id,name:id,path:'C:/project/_bmad-output/'+id,source:'C:/project/_bmad-output/'+id+'/'+id+'.md'}})]
   p.selection.initiativeId='initiative-30';window.bmadContextUIFixture.set(state)
  })
  const trigger=page.locator('.initiative-control').getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
  const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true}),selected=modal.locator('[aria-pressed="true"]')
  assert.equal(await selected.evaluate(e=>e===document.activeElement),true)
  const bounds=await modal.evaluate(el=>{
   const box=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}}
   return {modal:box(el),title:box(el.querySelector('h2')),close:box(el.querySelector('[aria-label="Fermer le choix d’initiative"]')),selected:box(el.querySelector('[aria-pressed="true"]')),height:innerHeight}
  })
  assert.ok(bounds.title.top>=bounds.modal.top&&bounds.title.bottom<=bounds.height,JSON.stringify(bounds))
  assert.ok(bounds.close.top>=bounds.modal.top&&bounds.close.bottom<=bounds.height,JSON.stringify(bounds))
  assert.ok(bounds.selected.top>=bounds.title.bottom,JSON.stringify(bounds))
  const details=selected.locator('..').locator('.initiative-evidence')
  assert.equal(await details.evaluate(e=>e.open),false)
  await details.locator('summary').click()
  assert.match(await details.innerText(),/Révision/)
  assert.equal(await modal.getByRole('button',{name:'Fermer le choix d’initiative'}).isVisible(),true)
  await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(e=>e===document.activeElement),true)
 }
})

const portraitButton=name=>page.getByRole('button',{name:'Fiche de '+name,exact:true})

test('barre : les emprises de déplacement sont séparées des quatre commandes',async t=>{
 await launch();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,900))
 const overlaps=await page.evaluate(()=>{
  const regions=[...document.querySelectorAll('.topbar,.topbar *')].filter(e=>getComputedStyle(e).getPropertyValue('app-region')==='drag').map(e=>({name:e.className||e.tagName,box:e.getBoundingClientRect()}))
  return [...document.querySelectorAll('.topbar button')].filter(e=>e.getClientRects().length).flatMap(e=>{const b=e.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;return regions.filter(r=>x>=r.box.left&&x<=r.box.right&&y>=r.box.top&&y<=r.box.bottom).map(r=>({button:e.getAttribute('aria-label'),dragRegion:r.name}))})
 });t.diagnostic(JSON.stringify(overlaps));assert.deepEqual(overlaps,[])
 await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click();await page.getByRole('button',{name:'Déployer la navigation',exact:true}).waitFor()
 await page.locator('.topbar').getByRole('button',{name:'Ouvrir un projet',exact:true}).click();assert.equal(await page.evaluate(()=>window.madnessToolbarFixture.directoryChoices()),1)
 await page.getByRole('button',{name:/^Connexion Codex :/}).click();await page.getByRole('dialog',{name:'Connexion Codex',exact:true}).waitFor()
 assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
})
test('atelier : disposition compacte, buste complet et conteneurs confinés dans le thème sombre',async t=>{
 await atelierFixture()
 const projectName='Projet personnel de qualification de la refonte avec un nom réellement très long sans abréviation'
 await page.evaluate(projectName=>window.connectionUIFixture.setSnapshot({projects:[{id:'p-atelier',name:projectName,rootPath:'C:/atelier',openedAt:new Date().toISOString()}]}),projectName)
 await portraitButton('Sally').click()
 for(const size of [{width:1600,height:1000},{width:1440,height:920},{width:720,height:820},{width:600,height:820}]){
  await setWorkspaceViewport(app,page,size)
  for(const theme of ['dark']){
   await page.locator('.agent-bust img').evaluate(e=>e.decode())
   await page.evaluate(async()=>{await Promise.allSettled(document.getAnimations().filter(a=>a.playState==='running'&&Number.isFinite(a.effect?.getTiming().iterations)).map(a=>a.finished))})
   const geometry=await page.evaluate(()=>{
    const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}},title=document.querySelector('.project-heading h1'),banner=document.querySelector('.project-banner'),image=document.querySelector('.agent-bust img'),bust=document.querySelector('.agent-bust')
    return {viewport:{width:innerWidth,height:innerHeight},title:{text:title.textContent,scrollWidth:title.scrollWidth,clientWidth:title.clientWidth},titleBox:box(title),contextAction:box(banner.querySelector('.context-trigger')),banner:{...box(banner),backgroundImage:getComputedStyle(banner).backgroundImage},tabs:[...document.querySelectorAll('.project-tabs button')].map(box),bust:box(bust),image:{...box(image),objectFit:getComputedStyle(image).objectFit,transform:getComputedStyle(image).transform,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight},containers:[...document.querySelectorAll('html,body,#root,.app-shell,.app-body,.workspace,.workspace-body,.sidebar,main,.main-inner,[role="tabpanel"],.conversation-messages,.agent-info-panel[open],.agent-panel-heading,.agent-panel-body')].filter(e=>e.getClientRects().length).map(e=>({element:e.id?'#'+e.id:e.className||e.tagName.toLowerCase(),...box(e),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth}))}
   })
   t.diagnostic(JSON.stringify({size,theme,...geometry}))
   assert.equal(geometry.title.text,projectName);assert.ok(geometry.title.scrollWidth<=geometry.title.clientWidth+1);assert.equal(geometry.banner.backgroundImage,'none');assert.ok(geometry.titleBox.y>=geometry.banner.y&&geometry.titleBox.bottom<=geometry.banner.bottom);assert.ok(geometry.contextAction.y>=geometry.banner.y&&geometry.contextAction.bottom<=geometry.banner.bottom);assert.ok(geometry.contextAction.height>=40);assert.ok(geometry.tabs.every(tab=>tab.y>=geometry.banner.bottom))
   for(const tab of geometry.tabs)assert.ok(tab.height>=40&&tab.height<=44)
   assert.ok(geometry.bust.height<=234);assert.ok(geometry.image.naturalWidth>0&&geometry.image.naturalHeight>0);assert.equal(geometry.image.objectFit,'contain');assert.equal(geometry.image.transform,'none')
   assert.ok(geometry.image.x>=geometry.bust.x&&geometry.image.y>=geometry.bust.y&&geometry.image.right<=geometry.bust.right&&geometry.image.bottom<=geometry.bust.bottom)
   for(const element of geometry.containers)assert.ok(element.scrollWidth<=element.clientWidth+1,JSON.stringify(element))
  }
 }
})
test('atelier : seuls les sept auteurs attestés exacts ont un portrait, les replis gardent nom et provenance',async()=>{
 const {names}=await atelierFixture()
 for(const name of names){const article=page.locator('[data-message-id="portrait-'+name+'"]');assert.equal(await article.locator('img').count(),1);assert.match(await article.textContent(),new RegExp(name+' · Codex'));assert.match(await article.textContent(),new RegExp('source-native-'+name));assert.equal(await portraitButton(name).count(),1)}
 for(const id of ['historical-unknown','unknown-0','unknown-1','unknown-2']){const article=page.locator('[data-message-id="'+id+'"]');assert.equal(await article.locator('img,button').count(),0);assert.equal(await article.locator('.agent-portrait svg').count(),1)}
 assert.match(await page.locator('[data-message-id="unknown-1"]').textContent(),/Mary bis · Codex.*source-hors-casting/s)
 await page.locator('[data-message-id="portrait-Mary"] img').dispatchEvent('error');assert.equal(await portraitButton('Mary').locator('img').count(),0);assert.equal(await portraitButton('Mary').locator('svg').count(),1)
})
test('atelier : fiche dockée locale, provenance stable, fermeture restitue largeur, focus et saisie sans effet métier',async()=>{
 const {context,messages}=await atelierFixture();await page.locator('#draft').fill('Brouillon exact été 日本語')
 await page.locator('#draft').evaluate(e=>{e.setSelectionRange(3,11)})
 const before=await page.locator('main').evaluate(e=>e.clientWidth)
 await portraitButton('Mary').click();const panel=page.getByRole('region',{name:'Fiche de Mary',exact:true});await panel.waitFor()
 assert.equal(await panel.evaluate(e=>e.matches('dialog[open]')&&!e.matches(':modal')),true)
 assert.match(await panel.textContent(),/source-native-Mary/);assert.equal(await panel.getByRole('button').count(),1)
 assert.ok(await page.locator('main').evaluate(e=>e.clientWidth)<before)
 await page.evaluate(({context,messages})=>window.connectionUIFixture.setDialogue({messages:[...messages,{...messages[4],id:'new-Sally',order:20,revision:1,text:'Nouvel auteur sans retarget'}]}),{context,messages})
 assert.equal(await page.getByRole('region',{name:'Fiche de Mary',exact:true}).count(),1)
 await page.keyboard.press('Escape');await panel.waitFor({state:'detached'})
 assert.equal(await portraitButton('Mary').evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('main').evaluate(e=>e.clientWidth),before)
 assert.deepEqual(await page.locator('#draft').evaluate(e=>({text:e.value,start:e.selectionStart,end:e.selectionEnd})),{text:'Brouillon exact été 日本語',start:3,end:11})
 assert.deepEqual(await page.evaluate(()=>({sent:window.connectionUIFixture.sent(),decisions:window.connectionUIFixture.approvalDecisions(),answers:window.connectionUIFixture.questionAnswers(),cancels:window.connectionUIFixture.cancels(),verifies:window.connectionUIFixture.verifies(),help:window.connectionUIFixture.helpCalls()})),{sent:[],decisions:[],answers:[],cancels:0,verifies:0,help:[]})
})
test('atelier : modale étroite inerte, seuil conservé, Échap unique et connexion engagée jamais annulée par consultation',async t=>{
 await atelierFixture(720);await page.locator('#draft').fill('Saisie préservée')
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(720,650))
 await page.evaluate(()=>window.connectionUIFixture.setState({status:'authorizing'}))
 await page.getByRole('button',{name:/^Connexion Codex/}).click();await page.waitForFunction(()=>document.activeElement?.id==='codex-connection-title')
 await portraitButton('Sally').click();const panel=page.getByRole('dialog',{name:'Fiche de Sally',exact:true});await panel.waitFor()
 assert.equal(await panel.evaluate(e=>e.matches(':modal')),true);assert.equal(await page.locator('#codex-connection-panel').count(),0)
 await page.locator('#draft').evaluate(e=>e.focus());assert.equal(await page.locator('#draft').evaluate(e=>e===document.activeElement),false)
 const beforeScroll=await panel.locator('.agent-panel-body').evaluate(e=>{e.scrollTop=70;return {top:e.scrollTop,devicePixelRatio:window.devicePixelRatio}})
 assert.ok(beforeScroll.top>0)
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1600,650));await page.getByRole('region',{name:'Fiche de Sally',exact:true}).waitFor()
 const afterScroll=await page.locator('.agent-panel-body').evaluate(e=>e.scrollTop)
 t.diagnostic(JSON.stringify({requestedScrollTop:70,beforeScrollTop:beforeScroll.top,afterScrollTop:afterScroll,devicePixelRatio:beforeScroll.devicePixelRatio}))
 assert.equal(afterScroll,beforeScroll.top)
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(600,650));await page.getByRole('dialog',{name:'Fiche de Sally',exact:true}).waitFor()
 await page.keyboard.press('Escape');assert.equal(await portraitButton('Sally').evaluate(e=>e===document.activeElement),true)
 assert.equal(await page.locator('#draft').inputValue(),'Saisie préservée');assert.equal(await page.evaluate(()=>window.connectionUIFixture.cancels()),0)
 await portraitButton('Mary').click();await page.keyboard.press('Escape');await page.getByRole('button',{name:/^Connexion Codex/}).click();await page.waitForFunction(()=>document.activeElement?.id==='codex-connection-title')
 assert.equal(await page.locator('.agent-info-panel').count(),0);assert.equal(await page.evaluate(()=>window.connectionUIFixture.cancels()),0)
 await portraitButton('Mary').click();await page.evaluate(()=>window.connectionUIFixture.setState({status:'registered',needsPlanAcknowledgement:true}))
 await page.waitForFunction(()=>document.querySelector('.plan-confirmation')?.matches(':modal'))
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1600,650));await page.waitForFunction(()=>document.querySelector('.agent-info-panel')?.getAttribute('role')==='region')
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(720,650));await page.waitForFunction(()=>document.querySelector('.agent-info-panel')?.getAttribute('role')==='dialog')
 assert.equal(await page.locator('.plan-confirmation').evaluate(e=>e.contains(document.activeElement)),true)
 assert.equal(await page.locator('.plan-confirmation').evaluate(e=>e.matches(':modal')),true)
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.plan-confirmation')?.open&&document.querySelector('.agent-info-panel')?.matches(':modal')&&document.activeElement?.id==='agent-info-title')
 assert.equal(await page.locator('.agent-info-panel').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('.agent-info-panel').count(),0);assert.equal(await page.evaluate(()=>window.connectionUIFixture.cancels()),0)
})
test('atelier : source disparue ferme la fiche vers le titre neutre, contexte et thème préservent le brouillon',async()=>{
 const {messages}=await atelierFixture();await page.locator('#draft').fill('Texte indépendant de la fiche')
 await portraitButton('Mary').click();await page.evaluate(messages=>window.connectionUIFixture.setDialogue({messages:messages.filter(m=>m.id!=='portrait-Mary')}),messages)
 await page.waitForFunction(()=>document.activeElement?.id==='conversation-heading');assert.equal(await page.locator('.agent-info-panel').count(),0)
 await portraitButton('Sally').click();assert.equal(await page.getByRole('region',{name:'Fiche de Sally',exact:true}).isVisible(),true)
 await page.getByRole('button',{name:'Contexte du projet',exact:true}).click();assert.equal(await page.locator('.agent-info-panel').count(),0)
 await page.keyboard.press('Escape');assert.equal(await page.locator('#draft').inputValue(),'Texte indépendant de la fiche')
})
test('atelier : arrivée question, approbation et récupération gardent le focus, expiration rejoint seulement son historique exact',async()=>{
 const {context}=await atelierFixture(720);await portraitButton('Mary').click();const panel=page.getByRole('dialog',{name:'Fiche de Mary',exact:true})
 const question={schemaVersion:1,id:'q-atelier',context,requestId:'request-atelier',turnId:'turn-atelier',identity:{kind:'unknown'},fields:[{id:'answer',header:'Direction',prompt:'Demande atelier exacte',allowOther:true,options:[]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 const approval={schemaVersion:1,id:'a-atelier',context,requestId:question.requestId,turnId:question.turnId,identity:{kind:'unknown'},mode:'file-approval',files:[{path:'C:/atelier/test.md',kind:'add',diff:'Patch complet',beforeSha256:null,afterSha256:'a'.repeat(64)}],reason:null,adjustment:'',adjustmentStatus:'draft',status:'waiting',decision:null,transmission:'none',effect:'pending',result:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({context,question,approval})=>window.connectionUIFixture.setDialogue({status:'waiting-question',turn:{id:'turn-atelier',requestId:'request-atelier',context,phase:'streaming'},questions:[question],approvals:[approval]}),{context,question,approval})
 await panel.getByRole('status').getByText(/Réponse attendue.*Approbation attendue/).waitFor();assert.equal(await page.evaluate(()=>document.activeElement?.id),'agent-info-title')
 await page.evaluate(()=>{const e=document.querySelector('.agent-attention-announcement');window.__atelierAnnouncements=[];new MutationObserver(()=>window.__atelierAnnouncements.push(e.textContent)).observe(e,{subtree:true,childList:true,characterData:true})})
 await page.evaluate(question=>window.connectionUIFixture.setDialogue({questions:[{...question,status:'inactive',reason:'expired'}]}),question)
 await panel.getByRole('button',{name:'Voir cet historique',exact:true}).waitFor();assert.equal(await page.evaluate(()=>document.activeElement?.id),'agent-info-title');assert.deepEqual(await page.evaluate(()=>window.__atelierAnnouncements),[])
 await panel.getByRole('button',{name:'Voir cet historique',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='q-atelier-title')
 assert.equal(await page.locator('[data-question-id="q-atelier"] button[type="submit"]').count(),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[])
 await portraitButton('Mary').click();await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'unknown',errorCode:'STOP_UNCONFIRMED',recovery:{stop:'unconfirmed',observations:[],capabilities:{resume:false,newConversation:true,inspectFiles:true}}}))
 await page.getByRole('dialog',{name:'Fiche de Mary',exact:true}).getByRole('button',{name:'Voir cette récupération',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='dialogue-session-title'||document.activeElement?.id==='overview-session-recovery')
 assert.equal(await page.evaluate(()=>window.connectionUIFixture.observeStops()),0)
})
test('atelier : arrivée visible au-dessus du rôle à600×650 et zoom200 sans déplacement de focus ni décision',async t=>{
 for(const zoom of [1,2]){
  const {context}=await atelierFixture(600)
  await app.evaluate(({BrowserWindow},zoom)=>{const w=BrowserWindow.getAllWindows()[0];w.setContentSize(600,650);w.webContents.setZoomFactor(zoom)},zoom)
  await portraitButton('Mary').click();const panel=page.getByRole('dialog',{name:'Fiche de Mary',exact:true})
  await panel.locator('.agent-panel-body').evaluate(e=>{e.scrollTop=0})
  const question={schemaVersion:1,id:'q-visible',context,requestId:'visible-request',turnId:'visible-turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Direction',prompt:'Question visible exacte',allowOther:true,options:[]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
  await page.evaluate(({context,question})=>window.connectionUIFixture.setDialogue({status:'waiting-question',turn:{id:question.turnId,requestId:question.requestId,context,phase:'streaming'},questions:[question]}),{context,question})
  await panel.getByRole('status').getByText(/Réponse attendue/).waitFor()
  const position=await panel.evaluate(e=>{const box=element=>{const r=element.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height}},status=e.querySelector('.agent-attention-announcement'),button=e.querySelector('.agent-attention button'),body=e.querySelector('.agent-panel-body');return {height:innerHeight,status:box(status),button:box(button),body:box(body),bodyScroll:body.scrollTop,focus:document.activeElement?.id}})
  t.diagnostic(JSON.stringify({zoom,...position}));assert.equal(position.focus,'agent-info-title');assert.equal(position.bodyScroll,0);assert.ok(position.status.top>=0&&position.status.bottom<=position.height);assert.ok(position.button.top>=position.status.bottom&&position.button.bottom<=position.body.top&&position.button.bottom<=position.height)
  await page.locator('#draft').evaluate(e=>e.focus());assert.equal(await page.evaluate(()=>document.activeElement?.id),'agent-info-title')
  await panel.getByRole('button',{name:'Rejoindre cette demande',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='q-visible-title')
  assert.deepEqual(await page.evaluate(()=>({sent:window.connectionUIFixture.sent(),answers:window.connectionUIFixture.questionAnswers(),decisions:window.connectionUIFixture.approvalDecisions(),cancels:window.connectionUIFixture.cancels()})),{sent:[],answers:[],decisions:[],cancels:0})
 }
})
test('atelier : chaque nouvelle demande identique est annoncée une fois et conserve sa destination après expiration',async()=>{
 const {context,messages}=await atelierFixture(600);await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(600,650));await portraitButton('Mary').click()
 const panel=page.getByRole('dialog',{name:'Fiche de Mary',exact:true})
 await page.evaluate(()=>{const region=document.querySelector('.agent-attention-announcement');window.__arrivalAnnouncements=[];new MutationObserver(()=>window.__arrivalAnnouncements.push(region.textContent)).observe(region,{childList:true,subtree:true,characterData:true})})
 const first={schemaVersion:1,id:'q-first-exact',context,requestId:'request-first',turnId:'turn-first',identity:{kind:'unknown'},fields:[{id:'answer',header:'Réponse',prompt:'Première question exacte',allowOther:true,options:[]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(first=>window.connectionUIFixture.setDialogue({status:'waiting-question',turn:{id:first.turnId,requestId:first.requestId,context:first.context,phase:'streaming'},questions:[first]}),first)
 await page.waitForFunction(()=>window.__arrivalAnnouncements.length===1)
 const second={...first,id:'q-second-exact',requestId:'request-second',turnId:'turn-second',fields:[{...first.fields[0],prompt:'Deuxième question exacte'}]}
 await page.evaluate(({first,second})=>window.connectionUIFixture.setDialogue({turn:{id:second.turnId,requestId:second.requestId,context:second.context,phase:'streaming'},questions:[{...first,status:'inactive',reason:'resolved'},second]}),{first,second})
 await page.waitForFunction(()=>window.__arrivalAnnouncements.length===2)
 const announcements=await page.evaluate(()=>window.__arrivalAnnouncements);assert.notEqual(announcements[0],announcements[1]);assert.match(announcements[0],/Signalement 1/);assert.match(announcements[1],/Signalement 2/)
 await page.evaluate(({first,second,messages})=>{window.connectionUIFixture.setDialogue({questions:[{...first,status:'inactive',reason:'resolved'},{...second,status:'inactive',reason:'expired'}]});for(let revision=2;revision<6;revision++)window.connectionUIFixture.setDialogue({messages:messages.map(message=>({...message,revision,text:message.text+' delta'+revision}))})},{first,second,messages})
 await panel.locator('.agent-attention > div').first().getByRole('button',{name:'Voir cet historique',exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>window.__arrivalAnnouncements),announcements);assert.equal(await page.evaluate(()=>document.activeElement?.id),'agent-info-title')
 await panel.locator('.agent-attention > div').first().getByRole('button',{name:'Voir cet historique',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='q-second-exact-title')
 assert.equal(await page.locator('[data-question-id="q-first-exact"]').getByText('Première question exacte',{exact:true}).count(),1);assert.equal(await page.locator('[data-question-id="q-second-exact"] button[type="submit"]').count(),0)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[])
})
test('atelier : aides partielles et reçus non conservés utilisent un HelpBridge synthétique strict, sans transmission',async()=>{
 const {context}=await atelierFixture();await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 const bundle={schemaVersion:1,id:'bundle-atelier',projectId:context.projectId,rootPath:'C:/atelier',observedAt:new Date().toISOString(),revision:'a'.repeat(64),diagnostic:'partial',nativeReady:false,problems:['Source requise absente'],documents:[{id:'doc-help',source:'C:/atelier/help.md',snapshot:'help.md',sha256:'b'.repeat(64),bytes:21,text:'Aide locale intégrale',module:'bmm',skills:[]}],references:[{module:'bmm',path:'references-only.md'}],sources:[],activeInitiative:null,selectedInitiative:null,outputPath:null,inventories:[],knowledgeRaw:'{}',configRaw:'{}',skillPath:'C:/atelier/bmad/SKILL.md'}
 const record={schemaVersion:1,conversationId:context.conversationId,context,invocation:'$bmad',bundle,turns:[],localTurnId:null,nativeThreadId:null,nativeTurnId:null,transmission:'partial',tools:[],response:'Réponse brute sans auteur attesté',outcome:'unknown',storage:'failed'}
 const help={contractVersion:1,sequence:1,status:'ready',freshness:'current',monitoring:'watching',projectId:context.projectId,bundle,records:[record],error:null};assert.equal(isHelpState(help),true)
 await page.evaluate(help=>window.connectionUIFixture.setHelp(help),help);await page.getByRole('button',{name:'Voir les aides',exact:true}).click()
 assert.equal(await page.getByRole('button',{name:'Demander à BMad',exact:true}).isDisabled(),true);await page.getByText('Recommandation native non qualifiée pour ce profil — voir les capacités concernées.',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Revenir au travail',exact:true}).click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const receipt=page.getByRole('region',{name:'Reçus BMad',exact:true});assert.match(await receipt.textContent(),/Transmission partielle.*Conservation locale non confirmée/s)
 await receipt.getByRole('button',{name:'Réessayer l’enregistrement',exact:true}).click();await receipt.getByText(/Annexe enregistrée/).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.helpCalls()),['retry-save:'+context.conversationId]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('une question corrélée et sa saisie restent visibles avant les demandes conservées et un long échange',async()=>{
 const {question}=await workspaceRequestFixture({longHistory:true})
 for(const size of [{width:1320,height:920},{width:720,height:820}]){
  await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
  await page.locator('main').evaluate(e=>{e.scrollTop=0})
  const field=page.locator('[data-question-id="q-priority"] textarea')
  assert.equal(await field.evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=56&&r.bottom<=innerHeight-12}),true)
  assert.equal(await page.locator('[data-question-id="q-old"]').isVisible(),false)
  assert.equal(await page.locator('[data-approval-id="a-old"]').isVisible(),false)
 }
 await page.getByLabel('Brouillon libre pour ce projet',{exact:true}).fill('Brouillon libre indépendant')
 assert.equal(await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).isDisabled(),true)
 assert.match(await page.locator('#draft-limit').textContent(),/formulaire.*demande|demande.*formulaire/)
 await page.locator('.request-history > summary').click();assert.equal(await page.locator('[data-question-id="q-old"] textarea').inputValue(),question.values.answer);assert.equal(await page.locator('[data-approval-id="a-old"] textarea').inputValue(),'Ancien ajustement exact')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('une approbation corrélée montre sa portée et son patch avant tout ancien formulaire',async()=>{
 const {approval}=await workspaceRequestFixture({longHistory:true});await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,920))
 await page.evaluate(approval=>window.connectionUIFixture.setDialogue({status:'waiting-approval',questions:([]),approvals:[{...approval,id:'a-old',status:'inactive',reason:'reopened'},approval]}),approval)
 await page.locator('main').evaluate(e=>{e.scrollTop=0})
 const panel=page.locator('[data-approval-id="a-priority"]'),patch=panel.locator('pre').first()
 assert.equal(await patch.evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=56&&r.top<innerHeight-40}),true)
 assert.equal(await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).evaluate((e,patchBottom)=>e.getBoundingClientRect().top>=patchBottom,await patch.evaluate(e=>e.getBoundingClientRect().bottom)),true)
 assert.equal(await page.locator('[data-approval-id="a-old"]').isVisible(),false)
 assert.equal(await page.getByLabel('Brouillon libre pour ce projet',{exact:true}).count(),1)
})
test('un historique simple avec nom long garde le point de saisie libre repérable au premier écran',async t=>{
 await workspaceRequestFixture();await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'idle',questions:[],approvals:[]}))
 await page.locator('[data-question-id="q-priority"]').waitFor({state:'detached'})
 for(const size of [{width:1440,height:920},{width:720,height:820}]){await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size);await page.waitForFunction(size=>innerWidth===size.width&&innerHeight===size.height,size);await page.locator('main').evaluate(e=>{e.scrollTop=0});const position=await page.locator('#draft').evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,mainScroll:document.querySelector('main').scrollTop,requests:document.querySelectorAll('.conversation-history [data-question-id]').length}});t.diagnostic(JSON.stringify({requested:size,...position}));assert.equal(position.top>=56&&position.bottom<=position.height-12,true,JSON.stringify({requested:size,...position}))}
})
test('atelier : la saisie et son action restent ensemble au premier écran',async t=>{
 await workspaceRequestFixture();await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'idle',questions:[],approvals:[]}))
 await page.locator('[data-question-id="q-priority"]').waitFor({state:'detached'})
 for(const language of ['fr','en'])for(const theme of ['dark','light'])for(const size of [{width:1440,height:920},{width:720,height:820}]){
  await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
  await page.waitForFunction(size=>innerWidth===size.width&&innerHeight===size.height,size)
  if(await page.evaluate(()=>document.documentElement.lang)!==language){await (await settingsLanguage()).click();await closeSettings();await page.waitForFunction(language=>document.documentElement.lang===language,language)}
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme)
  await page.locator('main').evaluate(e=>{e.scrollTop=0})
  const reading=await page.locator('.composer').evaluate(e=>({fieldTop:e.querySelector('textarea').getBoundingClientRect().top,actionBottom:e.querySelector('button[type="submit"]').getBoundingClientRect().bottom,fieldHeight:e.querySelector('textarea').getBoundingClientRect().height,actionHeight:e.querySelector('button[type="submit"]').getBoundingClientRect().height,actionMinimum:parseFloat(getComputedStyle(e.querySelector('button[type="submit"]')).minHeight),messagesBottom:document.querySelector('.conversation-messages').getBoundingClientRect().bottom,composerTop:e.getBoundingClientRect().top,composerBottom:e.getBoundingClientRect().bottom,footerTop:document.querySelector('.status-line').getBoundingClientRect().top,messagesHeight:document.querySelector('.conversation-messages').getBoundingClientRect().height,layout:[...document.querySelectorAll('.main-inner > *, #panel-conversation > *, .conversation-history > *')].map(x=>({name:x.tagName+'.'+x.className,y:x.getBoundingClientRect().y,height:x.getBoundingClientRect().height,min:getComputedStyle(x).minHeight,margin:getComputedStyle(x).margin,flex:getComputedStyle(x).flex})),horizontal:document.documentElement.scrollWidth>innerWidth+1,height:innerHeight,dpr:devicePixelRatio,insetToleranceCssPx:1/devicePixelRatio,scroll:document.querySelector('main').scrollTop}))
  t.diagnostic(JSON.stringify({language,theme,requested:size,...reading}))
  assert.ok(reading.fieldHeight>=64);assert.ok(reading.actionHeight>=43.99);assert.ok(reading.actionMinimum>=44);assert.ok(reading.messagesBottom<=reading.composerTop+0.01);assert.ok(reading.messagesHeight>=160);assert.ok(reading.composerBottom<=reading.footerTop);assert.equal(reading.horizontal,false);assert.equal(reading.scroll,0);assert.ok(reading.dpr>0&&Number.isFinite(reading.insetToleranceCssPx));assert.ok(reading.actionBottom<=reading.height,JSON.stringify(reading));assert.ok(reading.fieldTop>=56&&reading.actionBottom<=reading.height-12+reading.insetToleranceCssPx,JSON.stringify(reading))
 }
})

test('atelier : le dernier message garde son auteur et du texte lisibles ensemble',async t=>{
 await workspaceRequestFixture();await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'idle',questions:[],approvals:[]}))
 await page.locator('[data-question-id="q-priority"]').waitFor({state:'detached'})
 for(const size of [{width:1440,height:920},{width:720,height:820}]){
  await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
  await page.waitForFunction(size=>innerWidth===size.width&&innerHeight===size.height,size)
  await page.locator('.conversation-messages').evaluate(e=>{e.scrollTop=e.scrollHeight})
  const reading=await page.locator('.conversation-messages .dialogue-message.assistant').last().evaluate(e=>{
   const author=e.querySelector('.message-author').getBoundingClientRect(),text=e.querySelector('.message-text').getBoundingClientRect(),clip=e.parentElement.getBoundingClientRect()
   return {authorVisible:Math.min(author.bottom,clip.bottom)-Math.max(author.top,clip.top),textVisible:Math.min(text.bottom,clip.bottom)-Math.max(text.top,author.bottom,clip.top)}
  })
  t.diagnostic(JSON.stringify({requested:size,...reading}));assert.ok(reading.authorVisible>=39&&reading.textVisible>=24,JSON.stringify(reading))
 }
})

test('le focus de réponse reste neutre pendant envoi puis historique, sans détourner une autre saisie',async()=>{
 const {question}=await workspaceRequestFixture()
 const panel=page.locator('[data-question-id="q-priority"]');await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).focus();await page.keyboard.press('Enter')
 await page.waitForFunction(()=>document.activeElement?.id==='q-priority-title')
 await page.evaluate(question=>window.connectionUIFixture.setDialogue({status:'ready',questions:[{...question,status:'sent'}]}),question)
 await page.waitForFunction(()=>document.activeElement?.id==='q-priority-title');assert.equal(await panel.isVisible(),true)
 await page.locator('#draft').focus();await page.evaluate(question=>window.connectionUIFixture.setDialogue({status:'waiting-question',questions:[{...question,status:'waiting',expiresAt:Date.now()-1}]}),question)
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'draft')
})
test('expiration et décision retirent leurs contrôles vers un titre neutre dans l’historique',async()=>{
 const {question,approval}=await workspaceRequestFixture()
 await page.locator('[data-question-id="q-priority"] textarea').focus();await page.evaluate(question=>window.connectionUIFixture.setDialogue({questions:[{...question,expiresAt:Date.now()+250}]}),question)
 await page.waitForFunction(()=>document.activeElement?.id==='q-priority-title');assert.equal(await page.locator('[data-question-id="q-priority"] button[type="submit"]').count(),0)
 await page.evaluate(approval=>window.connectionUIFixture.setDialogue({status:'waiting-approval',questions:[],approvals:[approval]}),approval)
 const panel=page.locator('[data-approval-id="a-priority"]');await panel.getByRole('button',{name:'Refuser tout le patch',exact:true}).focus();await page.keyboard.press('Enter')
 await page.waitForFunction(()=>document.activeElement?.id==='a-priority-title')
 await page.evaluate(approval=>window.connectionUIFixture.setDialogue({status:'ready',approvals:[{...approval,status:'decided',decision:'decline',effect:'declined',transmission:'sent'}]}),approval)
 await page.waitForFunction(()=>document.activeElement?.id==='a-priority-title');assert.equal(await panel.isVisible(),true);assert.equal(await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).count(),0)
 await page.evaluate(approval=>window.connectionUIFixture.setDialogue({status:'waiting-approval',approvals:[approval]}),approval);await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).focus();await page.evaluate(approval=>window.connectionUIFixture.setDialogue({approvals:[{...approval,status:'inactive',reason:'expired'}]}),approval);await page.waitForFunction(()=>document.activeElement?.id==='a-priority-title')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[{approvalId:'a-priority',decision:'decline'}])
})

test('la conversation donne accès au travail avant la préparation et conserve la saisie en consultant le contexte',async()=>{
 await launch()
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,900))
 const context={projectId:'p-workspace',initiativeId:'initiative-connue',conversationId:'c-workspace',providerId:'codex',connectionId:'account'}
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet de travail',rootPath:'C:/workspace/contexte-complet',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'work-message',role:'assistant',text:'Échange sélectionné conservé.'}]}]}),context)
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 await page.locator('main').evaluate(e=>{e.scrollTop=0})
 assert.equal(await page.locator('#draft').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),true)
 assert.equal(await page.getByText('Échange sélectionné conservé.',{exact:true}).isVisible(),true)
 assert.equal(await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).count(),0)
 await page.locator('#draft').fill('Saisie avant consultation et préparation')
 const contextButton=page.getByRole('button',{name:'Contexte du projet',exact:true});await contextButton.focus();await page.keyboard.press('Enter')
 await page.getByRole('dialog',{name:'Contexte du projet',exact:true}).getByText('C:/workspace/contexte-complet',{exact:true}).waitFor()
 await page.keyboard.press('Escape');assert.equal(await contextButton.evaluate(e=>e===document.activeElement),true)
 assert.equal(await page.locator('#draft').inputValue(),'Saisie avant consultation et préparation')
 await page.getByRole('button',{name:'Préparer un échange',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='mary-title')
 assert.equal(await page.getByRole('tab',{name:'Parcours',exact:true}).getAttribute('aria-selected'),'true')
 assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle')
 await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),'Saisie avant consultation et préparation')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[])
})

test('ouvrir Codex depuis la projection ferme le contexte et focalise le panneau visible',async()=>{
 await launch()
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'p-panels',name:'Projet panneaux',rootPath:'C:/panels',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.getByRole('button',{name:'Contexte du projet',exact:true}).click()
 await page.waitForFunction(()=>document.activeElement?.id==='project-context-title')
 await page.locator('.overview-details > summary').focus();await page.keyboard.press('Enter')
 await page.getByRole('button',{name:'Ouvrir le panneau Codex',exact:true}).focus();await page.keyboard.press('Enter')
 await page.waitForFunction(()=>document.activeElement?.id==='codex-connection-title')
 assert.equal(await page.getByRole('dialog',{name:'Contexte du projet',exact:true}).count(),0)
 assert.equal(await page.getByRole('dialog',{name:'Connexion Codex',exact:true}).isVisible(),true)
 assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('la portée globale reste visible après les onglets et les commandes compactes ont une aide clavier',async()=>{
 await launch();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,900))
 await page.evaluate(()=>{window.connectionUIFixture.setSnapshot({projects:[{id:'p-global',name:'Projet courant',rootPath:'C:/global',openedAt:new Date().toISOString()}]});window.connectionUIFixture.setDialogue({status:'unknown',errorCode:'STOP_UNCONFIRMED',recovery:{stop:'unconfirmed',observations:[],capabilities:{resume:false,newConversation:true,inspectFiles:true}}})})
 await page.locator('.project-row').click()
 const tabs=page.getByRole('tablist'),band=page.locator('[data-overview-id="session-recovery"]')
 assert.equal(await band.evaluate((e,tabBottom)=>e.getBoundingClientRect().top>=tabBottom,await tabs.evaluate(e=>e.getBoundingClientRect().bottom)),true)
 assert.equal(await band.isVisible(),true)
 assert.equal(await band.getByText(/Arrêt Codex non confirmé.*portée globale.*nouveaux échanges bloqués/).isVisible(),true)
 const open=page.locator('.topbar').getByRole('button',{name:'Ouvrir un projet',exact:true});assert.equal(await open.count(),1)
 await page.waitForFunction(()=>document.querySelector('.project-heading h1')===document.activeElement);await page.keyboard.press('Shift');await open.focus();await open.locator('.command-tooltip').waitFor({state:'visible'});assert.equal(await open.locator('.command-tooltip').isVisible(),true)
 await page.keyboard.press('Escape');assert.equal(await open.locator('.command-tooltip').isVisible(),false)
 assert.equal(await open.evaluate(e=>e.getBoundingClientRect().width),40)
 const toggle=page.getByRole('button',{name:'Réduire la navigation',exact:true});assert.equal(await toggle.evaluate(e=>e.getBoundingClientRect().x+e.getBoundingClientRect().width/2),28)
 assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).recovery.stop,'unconfirmed')
 await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'error',errorCode:'NETWORK_UNAVAILABLE',recovery:{stop:'clear',observations:[],capabilities:{resume:false,newConversation:true,inspectFiles:true}}}));await page.getByText(/Arrêt Codex non confirmé.*nouveaux échanges bloqués/).waitFor({state:'detached'});assert.equal(await page.getByText(/Arrêt Codex non confirmé.*nouveaux échanges bloqués/).count(),0)
})
async function revealRecaps(){const details=page.locator('.overview-details');if(!await details.evaluate(e=>e.open))await details.locator(':scope > summary').click()}
for(const recipient of ['Mary','Forge'])test('un lancement '+recipient+' rejoint sa nouvelle conversation et conserve la sélection historique lors d’un échec',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'p-launch',initiativeId:'initiative-test',conversationId:'c-history',providerId:'codex',connectionId:'account-1'}
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet lancement',rootPath:'C:/launch',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'old-message',role:'assistant',text:'Ancienne conversation conservée.'}]}]}),context)
 await revealRecaps();const recap=page.locator('[data-recap-id="c-history"]');await recap.locator(':scope > summary').click();await recap.getByRole('button',{name:'Retrouver la conversation',exact:true}).click();await page.waitForFunction(()=>document.getElementById('conversation-heading')?.textContent==='Conversation c-history')
 await page.locator('#draft').fill('Saisie conservée avant lancement')
 await page.getByRole('button',{name:'Préparer un échange',exact:true}).click()
 if(recipient==='Forge'){await page.getByRole('button',{name:'Préparer Forge',exact:true}).click();await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()}
 await page.evaluate(()=>window.connectionUIFixture.failLaunch(true));await page.getByRole('button',{name:'Lancer '+recipient+' avec Codex',exact:true}).click();await page.waitForFunction(async()=>(await window.madnessDialogue.read()).status==='error')
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation c-history');assert.equal(await page.locator('#draft').inputValue(),'Saisie conservée avant lancement')
 await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 await page.evaluate(()=>window.connectionUIFixture.failLaunch(false));if(recipient==='Forge')await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()
 await page.getByRole('button',{name:'Lancer '+recipient+' avec Codex',exact:true}).click();const expected=recipient==='Forge'?'conversation-forge':'conversation-1'
 await page.waitForFunction(expected=>document.getElementById('conversation-heading')?.textContent==='Conversation '+expected,expected)
 assert.equal(await page.locator('#draft').inputValue(),'Saisie conservée avant lancement');assert.equal(await page.getByRole('button',{name:'Envoyer à '+recipient,exact:true}).isEnabled(),true);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('les annonces polies de l’accueil couvrent arrivée, envoi et résolution sans annoncer les fragments',async()=>{
 await launch();const context={projectId:'p-live',initiativeId:null,conversationId:'c-live',providerId:'codex',connectionId:'account'},q={schemaVersion:1,id:'q-live',context,requestId:'request',turnId:'turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Réponse',prompt:'Texte détaillé de la question',allowOther:true,options:[]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 const region=page.locator('.overview-announcement');assert.equal(await region.getAttribute('aria-live'),'polite');assert.equal(await region.getAttribute('aria-atomic'),'true')
 await page.evaluate(()=>{const region=document.querySelector('.overview-announcement');window.__waitAnnouncements=[];window.__waitObserver=new MutationObserver(()=>window.__waitAnnouncements.push(region.textContent));window.__waitObserver.observe(region,{childList:true,characterData:true,subtree:true})})
 await page.evaluate(({context,q})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet annonces',rootPath:'C:/live',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({status:'waiting-question',context,turn:{id:'turn',requestId:'request',context,phase:'streaming'},questions:[q]})},{context,q})
 await region.getByText('Réponse attendue dans Projet annonces.',{exact:true}).waitFor()
 await page.evaluate(context=>{for(let revision=1;revision<=10;revision++)window.connectionUIFixture.setDialogue({messages:[{id:'stream',context,requestId:'request',turnId:'turn',order:1,revision,text:'Fragment '+revision,phase:'streaming',storage:'pending',identity:{kind:'unknown'}}]})},context)
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.deepEqual(await page.evaluate(()=>window.__waitAnnouncements),['Réponse attendue dans Projet annonces.'])
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({questions:[{...q,status:'sending'}]}),q);await region.getByText('Réponse en cours d’envoi dans Projet annonces.',{exact:true}).waitFor()
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({status:'ready',turn:{id:'turn',requestId:'request',context:q.context,phase:'completed'},questions:[{...q,status:'sent',values:{answer:'Réponse'}}]}),q);await region.getByText('L’attente n’est plus active dans Projet annonces.',{exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.__waitAnnouncements),['Réponse attendue dans Projet annonces.','Réponse en cours d’envoi dans Projet annonces.','L’attente n’est plus active dans Projet annonces.'])
})

test('les récapitulatifs repliés nomment le fait du tour et gardent leur identifiant secondaire',async()=>{
 await launch();const context={projectId:'p-recaps',initiativeId:null,conversationId:'c-current',providerId:'codex',connectionId:'account'},historical={...context,conversationId:'c-historical'}
 await page.evaluate(({context,historical})=>window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet récapitulatifs',rootPath:'C:/recaps',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[]},{id:historical.conversationId,context:historical,lastKnownActivity:'idle',messages:[]}]}),{context,historical})
 await revealRecaps();const summary=page.locator('[data-recap-id="c-current"] > summary');await page.locator('[data-recap-id="c-historical"] > summary').getByText(/Historique · état du tour inconnu/).waitFor()
 for(const [phase,label] of [['awaiting-ack','Envoi du tour en attente d’accusé'],['streaming','Fin de tour non confirmée'],['completed','Tour terminé'],['interrupted','Tour interrompu'],['unknown','État du tour inconnu']]){await page.evaluate(({context,phase})=>window.connectionUIFixture.setDialogue({context,turn:{id:'turn',requestId:'request',context,phase}}),{context,phase});await summary.getByText('Récapitulatif · Projet récapitulatifs · '+label,{exact:true}).waitFor();assert.equal(await summary.locator('.recap-reference').textContent(),'c-current');assert.equal(await summary.locator('.recap-reference').evaluate(e=>getComputedStyle(e).display),'block');assert.equal(await page.locator('[data-recap-id="c-current"]').evaluate(e=>e.open),false)}
 const expired={schemaVersion:1,id:'q-recap-expired',context,requestId:'request',turnId:'turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Réponse',prompt:'Demande expirée conservée',allowOther:true,options:[]}],values:{answer:'Saisie conservée'},status:'inactive',reason:'expired',createdAt:new Date().toISOString(),expiresAt:Date.now()-1,revision:1,storage:'stored'}
 await page.evaluate(({context,expired})=>window.connectionUIFixture.setDialogue({status:'waiting-question',context,turn:{id:'turn',requestId:'request',context,phase:'streaming'},questions:[expired]}),{context,expired})
 await summary.getByText('Récapitulatif · Projet récapitulatifs · Fin de tour non confirmée',{exact:true}).waitFor();assert.equal((await summary.textContent()).includes('Tour en cours'),false);assert.equal(await page.locator('[data-overview-id="question:q-recap-expired"]').count(),0);assert.equal(await page.locator('[data-overview-id="session-activity"]').count(),0)
 await summary.click();await page.locator('[data-recap-id="c-current"]').getByText('La fin de ce tour n’est pas confirmée.',{exact:true}).waitFor()

})

test('accueil rejoint la conversation exacte par clavier, préserve les saisies et retire l’attente résolue',async()=>{
 await launch()
 const context={projectId:'p-one',initiativeId:null,conversationId:'c-old',providerId:'codex',connectionId:'account-1'},other={...context,conversationId:'c-recent'},q={schemaVersion:1,id:'q-overview',context,requestId:'request',turnId:'turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Réponse',prompt:'Question exacte ancienne conversation',allowOther:true,options:[]}],values:{answer:'Saisie distincte'},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({context,other,q})=>{window.connectionUIFixture.setSnapshot({projects:[{id:'p-one',name:'Premier projet',rootPath:'C:/one',openedAt:new Date().toISOString()},{id:'p-two',name:'Second projet',rootPath:'C:/two',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]},{id:other.conversationId,context:other,lastKnownActivity:'idle',messages:[]}],drafts:[{projectId:'p-one',text:'Brouillon libre conservé',savedAt:new Date().toISOString()}]});window.connectionUIFixture.setDialogue({status:'waiting-question',context,turn:{id:'turn',requestId:'request',context,phase:'streaming'},questions:[q]})},{context,other,q})
 await page.getByRole('button',{name:'Retrouver la question',exact:true}).focus();await page.keyboard.press('Enter')
 await page.waitForFunction(()=>document.activeElement?.id==='q-overview-title')
 assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation c-old');assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre conservé')
 const panel=page.locator('[data-question-id="q-overview"]');await panel.getByLabel('Votre réponse',{exact:true}).fill('Réponse explicite 日本語')
 await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click();await page.getByRole('dialog',{name:'Madness',exact:true}).getByRole('button',{name:'Accueil',exact:true}).click();assert.equal(await page.locator('[data-overview-id="question:q-overview"]').count(),1)
 await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='q-overview-title');await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[{questionId:'q-overview',values:{answer:'Réponse explicite 日本語'}}])
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({status:'ready',turn:{id:q.turnId,requestId:q.requestId,context:q.context,phase:'completed'},questions:[{...q,status:'sent',values:{answer:'Réponse explicite 日本語'}}]}),q)
 await page.locator('[data-overview-id="question:q-overview"]').waitFor({state:'detached'});assert.equal(await page.locator('[data-overview-id="question:q-overview"]').count(),0);await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click();await page.getByRole('dialog',{name:'Madness',exact:true}).getByRole('button',{name:'Accueil',exact:true}).click();assert.equal(await page.locator('[data-overview-id="question:q-overview"]').count(),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('deux destinations concurrentes et retour tardif gardent le dernier contexte et focus demandés',async()=>{
 await launch()
 const one={projectId:'p-one',initiativeId:null,conversationId:'c-one',providerId:'codex',connectionId:'account'},two={...one,projectId:'p-two',conversationId:'c-two'}
 await page.evaluate(({one,two})=>{window.connectionUIFixture.setSnapshot({projects:[{id:'p-one',name:'Premier',rootPath:'C:/one',openedAt:new Date().toISOString()},{id:'p-two',name:'Second',rootPath:'C:/two',openedAt:new Date().toISOString()}],conversations:[{id:'c-one',context:one,lastKnownActivity:'idle',messages:[]},{id:'c-two',context:two,lastKnownActivity:'idle',messages:[]}]});window.connectionUIFixture.deferSelections()}, {one,two})
 await revealRecaps();for(const id of ['c-one','c-two']){await page.locator('[data-recap-id="'+id+'"] > summary').click();await page.locator('[data-recap-id="'+id+'"]').getByRole('button',{name:'Retrouver la conversation',exact:true}).click()}
 await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===2)
 await page.evaluate(()=>window.connectionUIFixture.finishSelection(1));await page.waitForFunction(()=>document.activeElement?.id==='conversation-heading'&&document.activeElement.textContent==='Conversation c-two')
 await page.evaluate(()=>window.connectionUIFixture.finishSelection(0));assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation c-two');assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Conversation c-two')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('préparer un échange annule une sélection différée et libère les commandes sans détour tardif',async()=>{
 await launch();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,920));await page.waitForFunction(()=>innerWidth===1320)
 const one={projectId:'p-prepare-one',initiativeId:null,conversationId:'c-prepare-one',providerId:'codex',connectionId:'account'},two={...one,projectId:'p-prepare-two',conversationId:'c-prepare-two'}
 const question={schemaVersion:1,id:'q-prepare-two',context:two,requestId:'request-prepare',turnId:'turn-prepare',identity:{kind:'unknown'},fields:[{id:'answer',header:'Réponse',prompt:'Question dans le second projet',allowOther:true,options:[]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({one,two,question})=>{window.connectionUIFixture.setSnapshot({projects:[{id:one.projectId,name:'Premier projet préparation',rootPath:'C:/prepare-one',openedAt:new Date().toISOString()},{id:two.projectId,name:'Second projet préparation',rootPath:'C:/prepare-two',openedAt:new Date().toISOString()}],conversations:[{id:one.conversationId,context:one,lastKnownActivity:'idle',messages:[]},{id:two.conversationId,context:two,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({status:'waiting-question',context:two,turn:{id:question.turnId,requestId:question.requestId,context:two,phase:'streaming'},questions:[question]})},{one,two,question})
 await page.locator('.project-row').first().click();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Saisie du premier projet conservée')
 await page.evaluate(()=>window.connectionUIFixture.deferSelections());await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===1)
 const open=page.getByRole('button',{name:'Ouvrir un projet',exact:true}),toggle=page.getByRole('button',{name:'Réduire la navigation',exact:true}),projectLink=page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet Second projet préparation',exact:true})
 assert.equal(await open.isDisabled(),true);assert.equal(await toggle.getAttribute('aria-disabled'),'true');assert.equal(await projectLink.isDisabled(),true)
 await page.getByRole('button',{name:'Préparer un échange',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='mary-title')
 assert.equal(await open.isEnabled(),true);assert.equal(await toggle.getAttribute('aria-disabled'),'false');assert.equal(await projectLink.isEnabled(),true)
 await page.evaluate(()=>window.connectionUIFixture.finishSelection(0));await page.waitForFunction(async()=>(await window.madness.readState()).value.state.activeProjectId==='p-prepare-two');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
 assert.equal(await page.getByRole('heading',{name:'Premier projet préparation',exact:true}).isVisible(),true);assert.equal(await page.getByRole('tab',{name:'Parcours',exact:true}).getAttribute('aria-selected'),'true');assert.equal(await page.evaluate(()=>document.activeElement?.id),'mary-title');assert.equal(await open.isEnabled(),true)
 await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),'Saisie du premier projet conservée')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[])
})

test('une attente expirée pendant la sélection conserve sa saisie et explique l’absence d’envoi',async()=>{
 await launch();const context={projectId:'p-expire',initiativeId:null,conversationId:'c-expire',providerId:'codex',connectionId:'account'},q={schemaVersion:1,id:'q-expire',context,requestId:'request',turnId:'turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Réponse',prompt:'Question bientôt inactive',allowOther:true,options:[]}],values:{answer:'Saisie gardée'},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({context,q})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Expiration',rootPath:'C:/expiration',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({status:'waiting-question',context,turn:{id:'turn',requestId:'request',context,phase:'streaming'},questions:[q]});window.connectionUIFixture.deferSelections()},{context,q})
 await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===1)
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({questions:[{...q,expiresAt:Date.now()-1}]}),q);await page.evaluate(()=>window.connectionUIFixture.finishSelection(0))
 await page.waitForFunction(()=>document.activeElement?.id==='q-expire-title');const panel=page.locator('[data-question-id="q-expire"]');assert.equal(await panel.getByLabel('Votre réponse',{exact:true}).inputValue(),'Saisie gardée');assert.equal(await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).count(),0);assert.equal(await page.locator('[data-overview-id="question:q-expire"]').count(),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[])
})

test('activité native reste nommée à l’accueil et un échec de sélection ne déplace ni contexte ni focus',async()=>{
 await launch();const context={projectId:'p-running',initiativeId:null,conversationId:'c-running',providerId:'codex',connectionId:'account'}
 await page.evaluate(context=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet actif',rootPath:'C:/active',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({status:'running',context,turn:{id:'turn',requestId:'request',context,phase:'streaming'}});window.connectionUIFixture.deferSelections()},context)
 await page.locator('[data-overview-id="session-activity"]').getByText('Codex · L’agent travaille · Projet actif',{exact:true}).waitFor();const link=page.getByRole('button',{name:'Retrouver la session',exact:true});await link.click();await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===1);await page.evaluate(()=>window.connectionUIFixture.failSelection(0));await page.getByText('La destination ne peut pas être retrouvée. Votre contexte et vos saisies sont conservés.',{exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).isVisible(),true);assert.equal(await page.locator('#conversation-heading').count(),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('les articles progressifs gardent leur nœud, identité sourcée, lecture et saisie sans annoncer chaque fragment',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'project-stream',initiativeId:'initiative-test',conversationId:'conversation-stream',providerId:'codex',connectionId:'account-1'}
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet Flux',rootPath:'C:/stream',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]}),context)
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const message={id:'turn-1-message-1',context,requestId:'request-stream',turnId:'turn-1',order:1,revision:1,text:'Début reçu.',phase:'streaming',storage:'pending',identity:{kind:'unknown'}}
 await page.evaluate(({context,message})=>window.connectionUIFixture.setDialogue({status:'running',context,acknowledged:true,messages:[message],turn:{id:'turn-1',requestId:'request-stream',context,phase:'streaming'}}),{context,message})
 await page.getByText('Début reçu.',{exact:true}).waitFor()
 assert.equal(await page.getByRole('heading',{name:'Agent non identifié · Codex',exact:true}).count(),1)
 await page.locator('#draft').fill('Brouillon courant');await page.locator('#draft').focus()
 await page.evaluate(()=>{window.__streamArticle=document.querySelector('[data-message-id="turn-1-message-1"]');window.__turnStatus=document.querySelector('.turn-status').textContent})
 await page.evaluate(message=>window.connectionUIFixture.setDialogue({messages:[{...message,revision:2,text:'Début reçu. '+('Une ligne de lecture.\n'.repeat(150))}]}),message)
 assert.equal(await page.evaluate(()=>window.__streamArticle===document.querySelector('[data-message-id="turn-1-message-1"]')),true)
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'draft');assert.equal(await page.locator('#draft').inputValue(),'Brouillon courant')
 assert.equal(await page.evaluate(()=>document.querySelector('.turn-status').textContent===window.__turnStatus),true)
 assert.equal(await page.locator('.message-text[aria-live]').count(),0)
 await page.locator('.conversation-messages').evaluate(element=>{element.scrollTop=0;element.dispatchEvent(new Event('scroll'))})
 await page.evaluate(message=>window.connectionUIFixture.setDialogue({messages:[{...message,revision:3,text:'Début reçu. '+('Une ligne de lecture.\n'.repeat(200))}]}),message)
 assert.equal(await page.locator('.conversation-messages').evaluate(element=>element.scrollTop),0)
 await page.evaluate(message=>window.connectionUIFixture.setDialogue({status:'error',errorCode:'STORAGE_WRITE_FAILED',messages:[{...message,revision:4,text:'Début reçu.',phase:'interrupted',storage:'failed'}]}),message)
 await page.getByText('Réponse partielle · conservation non confirmée',{exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

test('le formulaire conserve chaque demande, annonce l’attente ailleurs et attend le reçu sans toucher au brouillon libre',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'project-questions',initiativeId:'initiative-test',conversationId:'conversation-questions',providerId:'codex',connectionId:'account-1'}
 const q={schemaVersion:1,id:'question-first',context,requestId:'question-request',turnId:'turn-1',identity:{kind:'unknown'},fields:[{id:'field-1',header:'Direction',prompt:'Quelle direction souhaitez-vous ?',allowOther:true,options:[{label:'Alpha',description:'Une première voie'},{label:'Beta',description:'Une seconde voie'}]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({context,q})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet Questions',rootPath:'C:/questions',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({status:'waiting-question',context,turn:{id:q.turnId,requestId:q.requestId,context,phase:'streaming'},questions:[q]})},{context,q})
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const panel=page.locator('[data-question-id="question-first"]'),send=panel.getByRole('button',{name:'Envoyer cette réponse',exact:true})
 await panel.waitFor();assert.equal(await panel.locator('input:checked').count(),0);assert.equal(await send.isDisabled(),true)
 await page.locator('#draft').fill('Brouillon libre à garder')
 await panel.getByLabel('Alpha',{exact:false}).check();assert.equal(await send.isEnabled(),true)
 await panel.getByLabel('Autre réponse',{exact:true}).fill('Une autre voie explicite');assert.equal(await panel.locator('input:checked').count(),0)
 await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('button',{name:'Retrouver la question',exact:true}).click()
 assert.equal(await panel.getByLabel('Autre réponse',{exact:true}).inputValue(),'Une autre voie explicite');assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre à garder')
 await send.dblclick();await panel.getByRole('status').filter({hasText:'Accusé natif et conservation attendus'}).waitFor()
 assert.equal(await panel.getByText('Réponse envoyée et enregistrée.',{exact:true}).count(),0)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[{questionId:'question-first',values:{'field-1':'Une autre voie explicite'}}])
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({questions:[{...q,status:'inactive',reason:'resolved',values:{'field-1':'Une autre voie explicite'}},{...q,id:'question-second',fields:[{...q.fields[0],prompt:'Une nouvelle question distincte ?'}]}]}),q)
 const next=page.locator('[data-question-id="question-second"]');assert.equal(await next.getByLabel('Autre réponse',{exact:true}).inputValue(),'');assert.equal(await next.getByRole('button',{name:'Envoyer cette réponse',exact:true}).isDisabled(),true)
 assert.equal(await panel.getByLabel('Autre réponse',{exact:true}).inputValue(),'Une autre voie explicite');assert.equal(await panel.getByLabel('Autre réponse',{exact:true}).getAttribute('readonly'),'')
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
 await page.evaluate(async context=>{const previous=(await window.madness.readState()).value.state.conversations,newContext={...context,conversationId:'conversation-new'};window.connectionUIFixture.setSnapshot({conversations:[...previous,{id:'conversation-new',context:newContext,lastKnownActivity:'idle',messages:[{id:'new-message',role:'assistant',text:'Nouvelle conversation indépendante.'}]}]});const questions=(await window.madnessDialogue.read()).questions.map(q=>({...q,status:'inactive',reason:'stopped'}));window.connectionUIFixture.setDialogue({context:newContext,status:'ready',questions})},context)
 await revealRecaps();await page.locator('.work-overview .overview-recaps [data-recap-id="conversation-new"] > summary').click();await page.locator('.work-overview .overview-recaps [data-recap-id="conversation-new"]').getByRole('button',{name:'Retrouver la conversation',exact:true}).click();await page.locator('.previous-conversations > summary').click();assert.equal(await page.locator('.previous-conversations [data-question-id="question-first"]').getByLabel('Autre réponse',{exact:true}).inputValue(),'Une autre voie explicite')
})

test('les indicateurs de question distinguent saisie et envoi et utilisent son destinataire réel',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'project-question-state',initiativeId:'initiative-test',conversationId:'conversation-question-state',providerId:'codex',connectionId:'account-1'}
 const q={schemaVersion:1,id:'question-state',context,requestId:'question-state-request',turnId:'turn-state',identity:{kind:'unknown'},fields:[{id:'field-1',header:'Voie',prompt:'Quelle voie ?',allowOther:true,options:[{label:'Alpha',description:'Voie A'},{label:'Beta',description:'Voie B'}]}],values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({context,q})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet attente',rootPath:'C:/question-state',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({invocation:'$bmad-forge-idea',status:'waiting-question',context,turn:{id:q.turnId,requestId:q.requestId,context,phase:'streaming'},questions:[q]})},{context,q})
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 await page.locator('.question-return').filter({hasText:'Agent non identifié attend votre réponse · ce projet'}).waitFor()
 assert.equal(await page.locator('.turn-status').textContent(),'Agent non identifié · Réponse attendue')
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({questions:[{...q,status:'sending',values:{'field-1':'Alpha'}}]}),q)
 await page.locator('.question-return').filter({hasText:'Réponse en cours d’envoi · ce projet'}).waitFor()
 assert.equal((await page.locator('.question-return').textContent()).includes('attend votre réponse'),false)
 assert.equal(await page.locator('.turn-status').textContent(),'Agent non identifié · Accusé natif et conservation attendus…')
 await page.getByRole('button',{name:'Contexte du projet',exact:true}).click()
 assert.equal(await page.locator('.context-panel dt').filter({hasText:'Activité'}).evaluate(element=>element.nextElementSibling.textContent),'Accusé natif et conservation attendus…')
 await page.keyboard.press('Escape')
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({questions:[{...q,id:'question-attested',identity:{kind:'attested',name:'Sally',source:'source-question-test'}}]}),q)
 await page.locator('.question-return').filter({hasText:'Sally attend votre réponse'}).waitFor();assert.equal(await page.locator('.turn-status').textContent(),'Sally · Réponse attendue')
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({status:'ready',questions:[{...q,status:'sent'}]}),q)
 assert.match(await page.locator('.turn-status').textContent(),/^Forge · Tour terminé/)
 await page.evaluate(()=>window.connectionUIFixture.setDialogue({invocation:'$bmad-agent-analyst'}));assert.match(await page.locator('.turn-status').textContent(),/^Mary · Tour terminé/)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[])
})
test('Forge prépare la portée inline, exige qualification et lancement explicites puis conserve le brouillon et le destinataire',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-forge',name:'Projet Forge',rootPath:'C:/forge',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Brouillon à conserver');await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 await page.getByRole('button',{name:'Préparer Forge',exact:true}).click()
 const start=page.getByRole('button',{name:'Lancer Forge avec Codex',exact:true});assert.equal(await start.isDisabled(),true)
 await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click();assert.equal(await start.isEnabled(),true)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.getByText('C:/forge/_bmad-output/initiative-test',{exact:true}).waitFor()
 await start.click();await page.getByLabel('Votre réponse à Forge',{exact:true}).waitFor()
 assert.equal(await page.locator('#draft').inputValue(),'Brouillon à conserver');assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.getByRole('heading',{name:'Résultat observé de Forge',exact:true}).waitFor()
 await page.getByRole('button',{name:'Copier l’invocation',exact:true}).click();await page.getByRole('status').filter({hasText:'Invocation copiée.'}).waitFor()
 await page.getByRole('button',{name:'Envoyer à Forge',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[{projectId:'project-forge',conversationId:'conversation-forge',text:'Brouillon à conserver'}])
})
for(const recipient of ['Forge','Mary'])test('les contrôles partagés sont attribués à la session '+recipient,async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-session',name:'Projet Session',rootPath:'C:/session',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click()
 if(recipient==='Forge'){await page.getByRole('button',{name:'Préparer Forge',exact:true}).click();await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()}
 await page.getByRole('button',{name:'Lancer '+recipient+' avec Codex',exact:true}).click()
 const skillPath='C:/session/.agents/skills/'+(recipient==='Forge'?'bmad-forge-idea':'bmad-agent-analyst')+'/SKILL.md'
 await page.evaluate(profile=>window.connectionUIFixture.setDialogue({profile}),{fingerprint:'a'.repeat(64),skillPath})
 const session=page.getByRole('region',{name:'Session '+recipient+' · Codex',exact:true}),mary=page.locator('[aria-labelledby="mary-title"]')
 assert.equal(await session.count(),1)
 assert.equal(await session.getByRole('button',{name:'Arrêter Codex',exact:true}).isVisible(),true)
 assert.equal(await mary.getByRole('button',{name:'Arrêter Codex',exact:true}).count(),0)
 await session.locator('.dialogue-proof > summary').click();assert.equal(await session.getByText(skillPath,{exact:true}).isVisible(),true)
 assert.equal(await mary.locator('.dialogue-proof').count(),0)
 for(const errorCode of ['BUSY','PROFILE_ABSENT','PLAN_ACK_REQUIRED','CONNECTION_BUSY']){
  await page.evaluate(errorCode=>window.connectionUIFixture.setDialogue({errorCode}),errorCode)
  const text=await session.getByRole('alert').textContent();assert.doesNotMatch(text,/lancer Mary|nécessaires à Mary/)
  assert.equal(await mary.getByRole('alert').count(),0)
 }
 await session.getByRole('button',{name:'Arrêter Codex',exact:true}).click()
 assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'stopped')
 assert.equal(await session.locator('.dialogue-proof').isVisible(),true)
})
for(const prerequisite of ['account','plan'])test('la préparation Forge explique le prérequis '+prerequisite+' et sa récupération en fenêtre compacte',async()=>{
 await launch({status:prerequisite==='account'?'disconnected':'registered',accountStored:prerequisite!=='account',needsPlanAcknowledgement:prerequisite==='plan'})
 if(prerequisite==='plan')await page.keyboard.press('Escape')
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-prerequisite',name:'Projet Prérequis',rootPath:'C:/prerequisite',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.getByRole('button',{name:'Préparer Forge',exact:true}).click();await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()
 const preparation=page.locator('#forge-preparation'),start=preparation.getByRole('button',{name:'Lancer Forge avec Codex',exact:true})
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.equal(await page.locator('.conversation-empty').getByText('Un lancement explicite ouvre une session sans envoyer votre brouillon.',{exact:true}).isVisible(),true)
 await page.getByRole('tab',{name:'Parcours',exact:true}).click()
 assert.equal(await start.isDisabled(),true)
 assert.equal(await preparation.locator('#forge-launch-prerequisite').count(),1)
 assert.equal(await start.getAttribute('aria-describedby'),'forge-launch-prerequisite')
 assert.match(await preparation.locator('#forge-launch-prerequisite').textContent(),prerequisite==='account'?/Connectez d’abord votre compte/:/Acquittez le rappel du forfait/)
 assert.equal(await page.evaluate(()=>innerWidth<=720),true);assert.equal(await preparation.evaluate(element=>element.scrollWidth<=element.clientWidth),true)
 if(prerequisite==='account'){
  await preparation.getByRole('button',{name:'Ouvrir le panneau Codex',exact:true}).click()
  await page.getByRole('dialog',{name:'Connexion Codex',exact:true}).getByRole('button',{name:'Continuer avec ChatGPT',exact:true}).waitFor()
 }else{
  await preparation.getByRole('button',{name:'Relire le rappel du forfait',exact:true}).click()
  await page.getByRole('dialog',{name:'Vous utilisez votre forfait ChatGPT',exact:true}).getByRole('button',{name:'J’ai compris',exact:true}).waitFor()
 }
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.conversations.length,0)
})
test('Forge historique après Mary conserve résultat, contexte, observations et copie du chemin correspondant',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-forge',name:'Projet Forge',rootPath:'C:/forge',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.getByRole('button',{name:'Préparer Forge',exact:true}).click()
 await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click();await page.getByRole('button',{name:'Lancer Forge avec Codex',exact:true}).click()
 await page.evaluate(async()=>{const w=(await window.madnessDialogue.read()).workflows[0],id='conversation-forge-older',older={...w,conversationId:id,context:{...w.context,conversationId:id},workspace:'C:/forge/_bmad-output/initiative-test/forge-older'};window.connectionUIFixture.setDialogue({workflows:[older,{...w,outcome:'CLARIFIED',observations:[{id:'observed-report',turnId:'turn-forge',operation:'write',phase:'observed',at:w.capturedAt,path:w.workspace+'/forge-report.html',sha256:'c'.repeat(64),bytes:123}]}]});const s=(await window.madness.readState()).value.state;window.connectionUIFixture.setSnapshot({conversations:[{id,context:older.context,lastKnownActivity:'idle',messages:[{id:'older-message',role:'assistant',text:'Historique Forge antérieur distinct.'}]},...s.conversations]})})
 await page.getByRole('button',{name:'Arrêter Codex',exact:true}).click();await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click()
 await page.getByLabel('Votre réponse à Mary',{exact:true}).fill('Brouillon après Mary, à conserver')
 await page.locator('.previous-conversations > summary').click()
 const history=page.locator('.previous-conversations > section').filter({hasText:'Quelle idée souhaitez-vous éprouver ? Fin du tour.'}),result=history.locator('.workflow-observations')
 assert.equal(await result.count(),1)
 assert.equal(await result.getByRole('heading',{name:'Résultat observé de Forge',exact:true}).isVisible(),true)
 assert.equal(await result.getByText('Clôture native observée : CLARIFIED.',{exact:false}).isVisible(),true)
 assert.match(await result.textContent(),/initiative-test.*account-1/)
 await result.locator('details > summary').click()
 assert.equal(await result.getByText('C:/forge/_bmad-output/initiative-test/forge-ui-test/forge-report.html',{exact:true}).isVisible(),true)
 await result.getByRole('button',{name:'Copier le chemin',exact:true}).click()
 assert.equal(await result.getByRole('status').textContent(),'Chemin copié.')
 const older=page.locator('.previous-conversations > section').filter({hasText:'Historique Forge antérieur distinct.'}).locator('.workflow-observations')
 assert.equal(await older.count(),1);assert.equal(await older.getByRole('status').textContent(),'')
 const titles=await page.locator('.workflow-observations h2').evaluateAll(elements=>elements.map(element=>element.id));assert.equal(new Set(titles).size,titles.length)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.copies()),[{conversationId:'conversation-forge',target:'workspace'}])
 assert.equal(await page.getByLabel('Votre réponse à Mary',{exact:true}).inputValue(),'Brouillon après Mary, à conserver')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('le rappel forfait affiche l’erreur connue et reste fermable après un échec durable', async () => {
  await launch({ status: 'registered', accountStored: true, needsPlanAcknowledgement: true })
  const confirmation = page.getByRole('dialog', { name: 'Vous utilisez votre forfait ChatGPT', exact: true })
  await confirmation.waitFor(); await page.getByRole('button', { name: 'J’ai compris', exact: true }).click()
  await confirmation.getByRole('alert').filter({ hasText: 'Le coffre local est illisible' }).waitFor({ timeout: 1000 })
  await page.keyboard.press('Escape')
  assert.equal(await confirmation.isVisible(), false)
  await page.getByRole('button', { name: /^Connexion Codex :/ }).click()
  assert.equal(await confirmation.isVisible(), false)
  assert.equal(await page.getByRole('button', { name: 'Déconnecter localement', exact: true }).isVisible(), true)
})
test('Échap ferme le tiroir compact actif et conserve le panneau Codex en arrière-plan', async () => {
  await launch()
  await page.getByRole('button', { name: /^Connexion Codex :/ }).click()
  const connection = page.getByRole('dialog', { name: 'Connexion Codex', exact: true })
  await page.getByRole('button', { name: 'Ouvrir la navigation', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#navigation-drawer').evaluate((element) => element.open), false)
  assert.equal(await connection.isVisible(), true)
})
test('Mary expose son invocation et son forfait puis envoie uniquement le brouillon capturé', async () => {
  await launch({ status: 'registered', accountStored: true })
  await page.evaluate(() => window.connectionUIFixture.setSnapshot({ activeProjectId:'project-1',projects:[{id:'project-1',name:'Projet Mary',rootPath:'C:/project',openedAt:new Date().toISOString()}] }))
  await page.locator('.project-row').waitFor({timeout:1000})
  await page.locator('.project-row').click()
  await page.getByRole('button', { name:'Lancer Mary avec Codex',exact:true }).waitFor({timeout:1000})
  await page.getByRole('button', { name:'Lancer Mary avec Codex',exact:true }).click()
  await page.getByText('📊 Bonjour, je suis Mary. Voici mon menu.',{exact:true}).waitFor()
  await page.getByLabel('Votre réponse à Mary').fill('Bonjour Mary, parlons de mon idée.')
  await page.getByRole('button', { name:'Envoyer à Mary',exact:true }).click()
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[{projectId:'project-1',conversationId:'conversation-1',text:'Bonjour Mary, parlons de mon idée.'}])
  assert.equal(await page.getByLabel('Votre réponse à Mary').inputValue(),'Bonjour Mary, parlons de mon idée.')
  assert.equal(await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).isDisabled(),true)
})
test('un arrêt inconnu depuis un autre projet garde le motif du blocage et le retour au propriétaire', async () => {
  await launch({ status:'registered',accountStored:true })
  await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-a',name:'Projet A',rootPath:'C:/a',openedAt:new Date().toISOString()},{id:'project-b',name:'Projet B',rootPath:'C:/b',openedAt:new Date().toISOString()}]}))
  await page.locator('.project-row').filter({hasText:'Projet A'}).click()
  await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click()
  await page.getByText('📊 Bonjour, je suis Mary. Voici mon menu.',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click()
  await page.getByRole('dialog',{name:'Madness',exact:true}).getByRole('button',{name:'Ouvrir le projet Projet B',exact:true}).click()
  await page.getByRole('heading',{name:'Projet B',exact:true}).waitFor()
  await page.evaluate(()=>window.connectionUIFixture.unknownOnStop())
  await page.getByRole('button',{name:'Arrêter Codex',exact:true}).click()
  await page.getByRole('tab',{name:'Parcours',exact:true}).click()
  const recovery=page.locator('[data-overview-id="session-recovery"]');await waitForPageCondition(page,async()=>(await window.madnessDialogue.read()).recovery.stop==='unconfirmed')
  await recovery.waitFor({timeout:1000})
  await page.getByRole('tab',{name:'Parcours',exact:true}).click()
  assert.equal(await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).isDisabled(),true)
  assert.equal(await page.getByRole('button',{name:'Vérifier ce projet',exact:true}).isDisabled(),true)
  await page.getByRole('button',{name:'Retrouver Projet A',exact:true}).click()
  await page.getByRole('heading',{name:'Projet A',exact:true}).waitFor()
  assert.equal(await recovery.isVisible(),true);assert.match(await recovery.textContent(),/Arrêt Codex non confirmé/);assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).recovery.stop,'unconfirmed')
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('l’aide aux clés publiques est absente sans erreur réseau',async()=>{
  await launch({status:'registered',accountStored:true})
  await page.getByRole('button',{name:/^Connexion Codex :/}).click()
  assert.equal(await page.locator('.connection-network-help').count(),0)
})
test('l’aide réseau ouvre ou copie l’unique URL publique sans masquer l’erreur ni relancer Codex',async()=>{
  await launch({status:'error',accountStored:true,errorCode:'NETWORK_UNAVAILABLE'})
  await page.getByRole('button',{name:/^Connexion Codex :/}).click()
  const help=page.locator('.connection-network-help')
  await help.waitFor({timeout:1000})
  assert.equal(await help.getByText('https://auth.openai.com/.well-known/jwks.json',{exact:true}).count(),1)
  const copy=help.getByRole('button',{name:'Copier l’adresse des clés publiques',exact:true})
  assert.equal(await copy.getAttribute('title'),'Copier l’adresse des clés publiques')
  await page.evaluate(()=>window.connectionUIFixture.deferSupport())
  await copy.click()
  assert.equal(await help.getByRole('status').count(),0)
  await page.evaluate(()=>window.connectionUIFixture.finishSupport())
  await help.getByRole('status').filter({hasText:'Adresse copiée.'}).waitFor()
  await help.getByRole('button',{name:'Ouvrir dans le navigateur Windows',exact:true}).click()
  await help.getByRole('status').filter({hasText:'Ouverture demandée dans votre navigateur Windows.'}).waitFor()
  assert.equal(await help.isVisible(),true)
  assert.equal(await page.getByRole('alert').filter({hasText:'Le service ne répond pas.'}).isVisible(),true)
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.supportCalls()),['copyPublicKeys','openPublicKeys'])
  assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
  assert.equal(await help.evaluate(element=>element.scrollWidth<=element.clientWidth),true)
  if(process.env.MADNESS_CAPTURE_SUPPORT==='1'){
    const output=join(repository,'.g0-qualification');await mkdir(output,{recursive:true})
    await page.evaluate(()=>{const label=document.createElement('p');label.className='small muted';label.textContent='Profil synthétique de qualification · aucune connexion réelle';document.getElementById('codex-connection-panel').prepend(label)})
    await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show())
    for(const size of [{width:1320,height:860,name:'desktop'},{width:600,height:800,name:'compact'}]){
      await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
      await page.locator('#codex-connection-panel').evaluate(element=>{element.scrollTop=0})
      await page.screenshot({path:join(output,'support-'+size.name+'.png')})
    }
  }
})
for(const [action,label,message] of [['copyPublicKeys','Copier l’adresse des clés publiques','La copie n’a pas abouti.'],['openPublicKeys','Ouvrir dans le navigateur Windows','Le navigateur Windows n’a pas pu être ouvert.']])test(`l’aide réseau garde une récupération locale après échec ${action}`,async()=>{
  await launch({status:'error',accountStored:true,errorCode:'NETWORK_UNAVAILABLE'})
  await page.getByRole('button',{name:/^Connexion Codex :/}).click()
  const help=page.locator('.connection-network-help');await help.waitFor({timeout:1000})
  await page.evaluate(action=>window.connectionUIFixture.failSupport(action),action)
  await help.getByRole('button',{name:label,exact:true}).click()
  await help.getByRole('alert').filter({hasText:message}).waitFor()
  assert.equal(await help.getByRole('status').count(),0)
  assert.equal(await page.getByRole('alert').filter({hasText:'Le service ne répond pas.'}).isVisible(),true)
  assert.equal(await help.isVisible(),true)
  assert.equal((await page.evaluate(()=>window.madnessConnection.read())).state.errorCode,'NETWORK_UNAVAILABLE')
  assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
})


test('approbation expose tout le patch sans choix présélectionné et sépare refus, ajustement et nouvel envoi',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'project-approvals',initiativeId:null,conversationId:'conversation-approvals',providerId:'codex',connectionId:'account-1'}
 const a={schemaVersion:1,id:'approval-ui',context,requestId:'approval-request',turnId:'turn-1',identity:{kind:'unknown'},mode:'file-approval',files:[{path:'C:/approvals/ajout.md',kind:'add',diff:'Contenu complet ajouté.\n',beforeSha256:null,afterSha256:'a'.repeat(64)},{path:'C:/approvals/retire.md',kind:'delete',diff:'Contenu complet supprimé.\n',beforeSha256:'b'.repeat(64),afterSha256:null}],reason:null,adjustment:'',adjustmentStatus:'draft',status:'waiting',decision:null,transmission:'none',effect:'pending',result:null,createdAt:new Date().toISOString(),expiresAt:Date.now()+600000,revision:1,storage:'stored'}
 await page.evaluate(({context,a})=>{window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet Approbations',rootPath:'C:/approvals',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]});window.connectionUIFixture.setDialogue({status:'waiting-approval',mode:'file-approval',context,turn:{id:a.turnId,requestId:a.requestId,context,phase:'streaming'},approvals:[a]})},{context,a})
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const panel=page.locator('[data-approval-id="approval-ui"]');await panel.waitFor()
 assert.equal(await panel.getByText('Contenu complet ajouté.',{exact:false}).count(),1);assert.equal(await panel.getByText('Contenu complet supprimé.',{exact:false}).count(),1)
 assert.equal(await panel.locator('input:checked').count(),0);assert.equal(await panel.getByRole('heading',{name:'Agent non identifié · Codex',exact:true}).count(),1)
 await page.locator('#draft').fill('Brouillon libre intact');await panel.getByLabel('Ajustement demandé',{exact:true}).fill('Créer seulement un résumé.')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.adjustmentSends()),[])
 await panel.getByRole('button',{name:'Refuser tout le patch',exact:true}).dblclick();assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[{approvalId:'approval-ui',decision:'decline'}])
 await panel.getByRole('status').filter({hasText:'Transmission et conservation attendues'}).waitFor();assert.equal(await panel.getByText('Effets vérifiés',{exact:true}).count(),0)
 await page.evaluate(a=>window.connectionUIFixture.setDialogue({status:'ready',approvals:[{...a,decision:'decline',status:'decided',transmission:'sent',effect:'declined',adjustment:'Créer seulement un résumé.'}]}),a)
 const history=page.locator('.request-history');await history.waitFor({state:'attached'});if(!await history.evaluate(e=>e.open))await history.locator(':scope > summary').click()
 await panel.getByRole('button',{name:'Envoyer cet ajustement à Mary',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.adjustmentSends()),['approval-ui']);assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre intact')
 await page.evaluate(a=>window.connectionUIFixture.setDialogue({status:'idle',mode:'read-only',approvals:[{...a,status:'inactive',reason:'reopened',adjustment:'Créer seulement un résumé.'}]}),a)
 assert.equal(await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).count(),0);assert.equal(await panel.getByLabel('Ajustement demandé',{exact:true}).inputValue(),'Créer seulement un résumé.');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
})

test('un arrêt du témoin connexion non confirmé expose la récupération explicite sans projet',async()=>{
 await launch({status:'verifying',accountStored:true});await page.getByRole('button',{name:/^Connexion Codex :/}).click()
 await page.evaluate(()=>window.connectionUIFixture.setState({status:'unknown',errorCode:'STOP_UNCONFIRMED'}))
 const panel=page.getByRole('dialog',{name:'Connexion Codex',exact:true}),recover=panel.getByRole('button',{name:'Vérifier les arrêts possédés',exact:true})
 await recover.waitFor();assert.equal(await recover.isEnabled(),true);assert.equal(await panel.getByRole('button',{name:'Vérifier la connexion',exact:true}).isDisabled(),true)
 assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.activeProjectId,null);assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).recovery.stop,'clear')
 await recover.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>window.connectionUIFixture.observeStops()===1)
 assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.equal((await page.evaluate(()=>window.madnessConnection.read())).state.status,'registered')
})


test('navigation: les infobulles projets restent peintes devant bannière et onglets',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.setContentSize(1320,900);w.showInactive()})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:['MIA','madness','Projet témoin dont le nom reste lisible malgré une longueur importante'].map((name,i)=>({id:'tooltip-'+i,name,rootPath:'C:/tooltip-'+i,openedAt:new Date().toISOString()}))}))
 await page.locator('.project-row').nth(2).click()
 await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click()
 await page.addStyleTag({content:'.sidebar .project-link[data-paint-probe]::after { pointer-events: auto !important }'})
 const results=[],proof=process.env.MADNESS_TOOLTIP_PROOF_DIRECTORY,phase=process.env.MADNESS_TOOLTIP_PROOF_PHASE==='red'?'red':'green',capture=proof&&process.env.MADNESS_TOOLTIP_SKIP_CAPTURES!=='1'
 if(proof)await mkdir(proof,{recursive:true})
 for(const theme of ['dark']){
  for(const name of ['MIA','madness','Projet témoin dont le nom reste lisible malgré une longueur importante']){
   const row=page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet '+name,exact:true})
   await row.hover()
   const observation=await row.evaluate(el=>{const rect=el.getBoundingClientRect(),pseudo=getComputedStyle(el,'::after');el.setAttribute('data-paint-probe','');const x=Number.parseFloat(pseudo.left)+60,y=rect.y+rect.height/2,hit=document.elementFromPoint(x,y);el.removeAttribute('data-paint-probe');return {name:el.getAttribute('aria-label'),content:pseudo.content,paintedInFront:hit===el,hit:hit?.className??null,x,y}})
   results.push({theme,...observation});if(proof)await writeFile(join(proof,phase+'-paint.json'),JSON.stringify(results,null,2)+'\n')
   if(capture&&name==='madness')await page.screenshot({path:join(proof,phase+'-'+theme+'.png'),timeout:10000})
  }
 }
 if(proof)await writeFile(join(proof,phase+'-paint.json'),JSON.stringify(results,null,2)+'\n')
 assert.equal(results.every(r=>r.content!=='none'&&r.paintedInFront),true,JSON.stringify(results))
 const row=page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet Projet témoin dont le nom reste lisible malgré une longueur importante',exact:true})
 await page.mouse.move(600,700);await row.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await row.evaluate(el=>el===document.activeElement),true);assert.notEqual(await row.evaluate(el=>getComputedStyle(el,'::after').content),'none')
 await page.keyboard.press('Escape');assert.equal(await row.evaluate(el=>getComputedStyle(el,'::after').content),'none')
 await page.getByRole('button',{name:'Déployer la navigation',exact:true}).click()
 assert.equal(await row.locator('.nav-label').isVisible(),true);assert.equal(await row.evaluate(el=>getComputedStyle(el,'::after').content),'none')
 await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click()
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(760,900))
 await page.getByRole('button',{name:'Contexte du projet',exact:true}).click();await page.locator('#project-context-panel').evaluate(e=>Promise.all(e.getAnimations().map(a=>a.finished)));await row.hover()
 const overlay=await row.evaluate(el=>{const panel=document.getElementById('project-context-panel'),rect=panel.getBoundingClientRect(),button=el.getBoundingClientRect();el.setAttribute('data-paint-probe','');const hit=document.elementFromPoint(rect.left+1,button.y+button.height/2);el.removeAttribute('data-paint-probe');const pseudo=getComputedStyle(el,'::after');return {panelOnTop:panel.contains(hit),tooltipPresent:pseudo.content!=='none',overlap:rect.left+1>Number.parseFloat(pseudo.left)&&rect.left+1<Number.parseFloat(pseudo.left)+Number.parseFloat(pseudo.width)}})
 assert.deepEqual(overlay,{panelOnTop:true,tooltipPresent:true,overlap:true},'Le panneau conserve sa priorité sur les infobulles du rail')
 if(capture)await page.screenshot({path:join(proof,phase+'-panel.png')})
 await page.getByRole('button',{name:'Fermer le contexte du projet',exact:true}).click()
 await page.locator('.project-banner').getByRole('button',{name:'Choisir une initiative',exact:true}).click()
 assert.equal(await page.getByRole('dialog',{name:'Choisir une initiative',exact:true}).isVisible(),true)
 const topLayer=await page.evaluate(()=>{const dialog=document.querySelector('.initiative-dialog[open]'),rect=dialog.getBoundingClientRect(),hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+30);return dialog.contains(hit)})
 assert.equal(topLayer,true);await page.keyboard.press('Escape')
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.helpCalls()),[])
})

test('actualisation: async stale/reading/error/new revision preserves displayed proof and composer focus',async()=>{
 const f=await resumeFixture();await f.set();const region=page.getByRole('region',{name:'Reprise du projet',exact:true});await region.locator('.resume-states > summary').click();const proof=region.locator('.resume-ticket .resume-proof');await proof.locator('summary').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click();const draft=page.locator('textarea#draft');await draft.fill('Saisie intacte pendant collecte 🧭');await draft.focus()
 await page.evaluate(snapshot=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:1,projects:[{projectId:snapshot.projectId,generation:2,status:'ready',freshness:'stale',monitoring:'watching',queued:true,snapshot,errorCode:null,error:null}]}),f.snapshot);assert.ok(!(await page.locator('.resume-announcement').textContent()).includes('terminée'));await f.set(f.snapshot,'reading');assert.equal(await draft.evaluate(e=>e===document.activeElement),true);await f.set(f.snapshot,'error');assert.equal(await draft.inputValue(),'Saisie intacte pendant collecte 🧭')
 const latest={...structuredClone(f.snapshot),revision:'f'.repeat(64),observedAt:'2026-11-04T14:00:00Z',declarations:f.snapshot.declarations.map(d=>({...d,value:'done'}))};await f.set(latest);assert.equal(await draft.evaluate(e=>e===document.activeElement),true);assert.equal(await draft.inputValue(),'Saisie intacte pendant collecte 🧭')
 await page.getByRole('tab',{name:'Parcours',exact:true}).click();assert.equal(await proof.evaluate(e=>e.open),true);await region.getByText('Nouvelle observation disponible',{exact:false}).waitFor();assert.equal(await region.locator('.resume-ticket code').first().textContent(),'in-progress');assert.ok((await region.locator('.resume-observation').textContent()).includes('Observation ancienne'));const show=region.getByRole('button',{name:'Afficher la nouvelle observation',exact:true});await show.click();assert.equal(await show.evaluate(e=>e===document.activeElement),true);assert.equal(await region.locator('.resume-states').evaluate(e=>e.open),false);assert.equal(await region.locator('.resume-ticket code').first().textContent(),'done');await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await draft.inputValue(),'Saisie intacte pendant collecte 🧭')
})

function catalogUIValue(id='catalog-a',revision='a'){
 const source={id:'catalog-source',path:'C:/'+id+'/skills/alpha/SKILL.md',sha256:'c'.repeat(64),bytes:30,text:'Mary explores documented intentions'}
 const snapshot={schemaVersion:1,projectId:id,rootPath:'C:/'+id,rootIdentity:'d'.repeat(64),revision:revision.repeat(64),observedAt:'2026-11-04T10:00:00Z',diagnostic:'partial',coverage:'partial',roots:['C:/'+id+'/skills'],sources:[source,{...source,id:'catalog-source-beta',path:'C:/'+id+'/skills/beta/SKILL.md',text:'Sally documents a long purpose with literal sources.'}],modules:[{code:'method',folder:'module',version:'6.13.0-next',sourceId:source.id}],items:[{id:'alpha',name:'alpha',module:'method',sourceId:source.id,manifestSourceId:source.id,invocation:'$alpha',presence:'present',copyable:true,copyReasons:[],documentation:[],launchable:false,launchReason:'General launch unqualified',fields:{purpose:{sourceId:source.id,startLine:1,endLine:1,value:'Mary explores documented intentions'},inputs:null,conditions:null,effects:null}},{id:'beta-long-skill-name-for-a-clear-documentary-view',name:'beta-long-skill-name-for-a-clear-documentary-view',module:'tools',sourceId:'catalog-source-beta',manifestSourceId:source.id,invocation:null,presence:'present',copyable:false,copyReasons:['Reciprocal membership not established'],documentation:[],launchable:false,launchReason:'Unqualified',fields:{purpose:{sourceId:'catalog-source-beta',startLine:1,endLine:1,value:'Sally documents a long purpose with literal sources.'},inputs:null,conditions:null,effects:null}}],problems:['method: missing registered skill absent']}
 return {projectId:id,generation:1,status:'ready',freshness:'current',monitoring:'watching',queued:false,snapshot,copy:null,errorCode:null,error:null}
}
async function catalogUIFixture(){const projects=['catalog-a','catalog-b'].map(id=>({id,name:id,rootPath:'C:/'+id,openedAt:'2026-11-04T10:00:00Z'}));await launch({}, {snapshot:{projects,activeProjectId:'catalog-a',drafts:[]}});await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)});await setWorkspaceViewport(app,page,{width:1440,height:920});const values=projects.map(p=>catalogUIValue(p.id));await page.evaluate(values=>window.bmadCatalogUIFixture.set({contractVersion:1,sequence:1,projects:values}),values);return values}
test('catalogue: manual four-tab keyboard navigation, literal search, filters, source details and confirmed copy',async()=>{
 await catalogUIFixture();const journey=page.getByRole('tab',{name:'Parcours',exact:true}),all=page.getByRole('tab',{name:'Toutes les possibilités',exact:true});await journey.focus();await journey.press('End');const graph=page.getByRole('tab',{name:'Graphe',exact:true});assert.equal(await graph.evaluate(e=>e===document.activeElement),true);assert.equal(await graph.getAttribute('aria-selected'),'false');await graph.press('Enter');await page.getByRole('heading',{name:'Graphe du projet',exact:true}).waitFor();await graph.press('ArrowLeft');assert.equal(await all.evaluate(e=>e===document.activeElement),true);assert.equal(await all.getAttribute('aria-selected'),'false');await all.press('Enter');await page.getByRole('heading',{name:'Toutes les possibilités',exact:true}).waitFor();const search=page.getByLabel('Rechercher une possibilité');await search.fill('Mary');assert.equal(await page.locator('.catalog-list li').count(),1);await page.getByLabel('Module',{exact:true}).selectOption('tools');await page.getByText('Aucun résultat pour cette recherche',{exact:true}).waitFor();await page.getByRole('button',{name:'Effacer les filtres',exact:true}).click();assert.equal(await search.inputValue(),'Mary');await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();const detail=page.getByRole('dialog',{name:'alpha',exact:true});await detail.waitFor();assert.equal(await detail.locator('h2').evaluate(e=>e===document.activeElement),true);assert.equal(await detail.getByRole('heading',{name:'Entrées',exact:true}).count(),1);await detail.getByRole('button',{name:'Copier l’invocation',exact:true}).click();await detail.getByText('Invocation copiée',{exact:true}).waitFor();await detail.press('Escape');assert.equal(await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).evaluate(e=>e===document.activeElement),true);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.helpCalls()),[]);assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[])
})
test('catalogue: old details survive refresh and latest observation requires voluntary switch',async()=>{
 const values=await catalogUIFixture();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByLabel('Rechercher une possibilité').fill('Mary');await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();const detail=page.getByRole('dialog',{name:'alpha',exact:true});const next=catalogUIValue('catalog-a','b');next.snapshot.items[0].fields.purpose.value='New source contents';await page.evaluate(values=>window.bmadCatalogUIFixture.set({contractVersion:1,sequence:2,projects:values}),[next,values[1]]);await detail.getByText('Observation précédente — fiche historique',{exact:true}).waitFor();assert.equal(await detail.locator('.catalog-field>p').filter({hasText:'Mary explores documented intentions'}).count(),1);assert.equal(await detail.getByRole('button',{name:'Copier l’invocation',exact:true}).isDisabled(),true);await detail.press('Escape');await page.getByRole('button',{name:'Afficher la nouvelle observation',exact:true}).click();assert.equal(await page.getByLabel('Rechercher une possibilité').inputValue(),'Mary');await page.getByLabel('Rechercher une possibilité').fill('');await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();await page.getByRole('dialog',{name:'alpha',exact:true}).getByText('New source contents',{exact:true}).waitFor();await page.keyboard.press('Escape');await page.getByLabel('Rechercher une possibilité').fill('Mary');await page.getByRole('button',{name:'Ouvrir le projet catalog-b',exact:true}).click();assert.equal(await page.getByLabel('Rechercher une possibilité').inputValue(),'');await page.getByRole('button',{name:'Ouvrir le projet catalog-a',exact:true}).click();assert.equal(await page.getByLabel('Rechercher une possibilité').inputValue(),'Mary')
})
test('catalogue: delayed copy cannot confirm another details view and failure keeps selectable invocation',async()=>{
 await catalogUIFixture();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();await page.evaluate(()=>window.bmadCatalogUIFixture.defer());await page.getByRole('button',{name:'Copier l’invocation',exact:true}).click();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Fiche compétence beta-long-skill-name-for-a-clear-documentary-view',exact:true}).click();await page.evaluate(()=>window.bmadCatalogUIFixture.finish());assert.equal(await page.getByRole('dialog').getByText('Invocation copiée',{exact:true}).count(),0);await page.keyboard.press('Escape');await page.evaluate(()=>window.bmadCatalogUIFixture.fail(true));await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();await page.getByRole('button',{name:'Copier l’invocation',exact:true}).click();await page.evaluate(()=>window.bmadCatalogUIFixture.finish());await page.getByText('Copie impossible — sélectionnez le texte.',{exact:true}).waitFor();assert.equal(await page.locator('.catalog-command').textContent(),'$alpha')
})
test('catalogue: compact two themes and native zoom200 preserve details controls without window overflow',async()=>{
 await catalogUIFixture();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();for(const [width,height,theme,zoom] of [[720,820,'dark',1],[1440,920,'dark',2]]){await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)});await setWorkspaceViewport(app,page,{width,height});if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:theme==='light'?'Passer au thème clair':'Passer au thème sombre',exact:true}).click();await app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom);await page.waitForFunction(({width,zoom})=>Math.abs(innerWidth-width/zoom)<=1,{width,zoom});await page.getByRole('button',{name:'Fiche compétence beta-long-skill-name-for-a-clear-documentary-view',exact:true}).click();assert.equal(await page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.getByRole('button',{name:'Fermer la fiche compétence',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Fiche compétence beta-long-skill-name-for-a-clear-documentary-view',exact:true}).evaluate(e=>e===document.activeElement),true)}
})

test('catalogue: voluntary observation switch retains keyboard focus and stays a no-op until another admissible capture',async()=>{const values=await catalogUIFixture();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();const next=catalogUIValue('catalog-a','b');await page.evaluate(values=>window.bmadCatalogUIFixture.set({contractVersion:1,sequence:2,projects:values}),[next,values[1]]);const show=page.getByRole('button',{name:'Afficher la nouvelle observation',exact:true});await show.waitFor();await show.focus();await show.evaluate(e=>window.catalogSwitchNode=e);await show.press('Enter');await page.getByText('Nouvelle observation affichée.',{exact:true}).waitFor();assert.equal(await show.count(),1);assert.equal(await show.evaluate(e=>e===window.catalogSwitchNode&&e===document.activeElement&&!e.disabled),true);assert.equal(await show.getAttribute('aria-disabled'),'true');await show.press('Enter');assert.equal(await page.locator('.catalog-observation code').first().textContent(),'b'.repeat(64));const pending=catalogUIValue('catalog-a','c');pending.freshness='stale';pending.status='reading';await page.evaluate(values=>window.bmadCatalogUIFixture.set({contractVersion:1,sequence:3,projects:values}),[pending,values[1]]);await page.waitForFunction(()=>document.querySelector('.catalog-observation button')?.getAttribute('aria-disabled')==='true');await show.press('Enter');assert.equal(await page.locator('.catalog-observation code').first().textContent(),'b'.repeat(64));pending.freshness='current';pending.status='ready';await page.evaluate(values=>window.bmadCatalogUIFixture.set({contractVersion:1,sequence:4,projects:values}),[pending,values[1]]);await page.waitForFunction(()=>document.querySelector('.catalog-observation button')?.getAttribute('aria-disabled')==='false');await show.press('Space');await page.waitForFunction(()=>document.querySelector('.catalog-observation code')?.textContent==='c'.repeat(64));assert.equal(await show.evaluate(e=>e===window.catalogSwitchNode&&e===document.activeElement),true);assert.equal(await show.getAttribute('aria-disabled'),'true')})

test('catalogue: first complete representative row is visible on arrival at1440x920 with source context intact',async()=>{await catalogUIFixture();await page.evaluate(()=>window.connectionUIFixture.setSnapshot({conversations:['catalog-a','catalog-b'].map(projectId=>({id:'history-'+projectId,context:{projectId,initiativeId:null,conversationId:'history-'+projectId,providerId:'codex',connectionId:'historical'},lastKnownActivity:'idle',messages:[{id:'historical-result-'+projectId,role:'assistant',text:'Exact historical text.'}]}))}));await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByText('Initiative capturée par cet échange : non identifiée',{exact:true}).waitFor();await page.locator('.catalog-list li').first().waitFor();await page.evaluate(async()=>{await document.fonts.load('700 28px "Barlow Condensed"');await document.fonts.load('450 16px Oxanium');await document.fonts.ready;document.querySelector('main').scrollTop=0});const geometry=await page.evaluate(()=>{const box=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}},panel=document.querySelector('.catalog-panel'),row=panel.querySelector('.catalog-list li');return {viewport:[innerWidth,innerHeight],scroll:document.querySelector('main').scrollTop,bannerNote:document.querySelector('.project-banner .context-note')?.textContent,banner:box(document.querySelector('.project-banner')),overview:box(document.querySelector('.work-overview')),panel:box(panel),observation:box(panel.querySelector('.catalog-observation')),filters:box(panel.querySelector('.catalog-filters')),row:box(row),purpose:row.querySelector('p').textContent,invocation:row.querySelector('code').textContent,observationText:panel.querySelector('.catalog-observation').textContent}});console.log(JSON.stringify({catalogueArrivalGeometry:geometry}));assert.deepEqual(geometry.viewport,[1440,920]);assert.equal(geometry.scroll,0);assert.equal(geometry.bannerNote,'Initiative capturée par cet échange : non identifiée');assert.ok(geometry.row.bottom<=geometry.viewport[1],'One complete catalogue result must be visible on arrival: '+JSON.stringify(geometry));assert.equal(geometry.purpose,'Mary explores documented intentions');assert.equal(geometry.invocation,'$alpha');assert.ok(geometry.observationText.includes('Couverture : Partielle'));assert.ok(geometry.observationText.includes('Observé le'));assert.ok(geometry.observationText.includes('a'.repeat(64)))})

test('catalogue: compact overview keeps active question reachable and other tab presentation unchanged',async()=>{await workspaceRequestFixture();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();const overview=page.locator('.work-overview');assert.equal(await overview.evaluate(e=>e.classList.contains('is-compact')),true);await page.getByRole('button',{name:'Retrouver la question',exact:true}).waitFor();await page.getByRole('tab',{name:'Parcours',exact:true}).click();assert.equal(await overview.evaluate(e=>e.classList.contains('is-compact')),false);await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[role=tab][aria-selected=true]')?.textContent==='Conversation');assert.equal(await page.locator('[data-question-id="q-priority"] textarea').inputValue(),'Réponse propre à la demande');assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[])})

async function filesUIFixture(){const values=await catalogUIFixture();const refs=values.map((v,n)=>{const source=v.snapshot.sources[0];return {id:'ref-ui-'+n,producer:'catalog',projectId:v.projectId,rootPath:v.snapshot.rootPath,rootIdentity:v.snapshot.rootIdentity,initiativeId:null,revision:v.snapshot.revision,sourceId:source.id,path:source.path,sha256:source.sha256,bytes:source.bytes,observedAt:v.snapshot.observedAt,current:true}});await page.evaluate(refs=>window.projectFilesUIFixture.set({contractVersion:1,sequence:1,references:refs,previews:[],results:[],issues:[]}),refs);await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();return refs}
async function openFilesUI(){await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();await page.getByRole('dialog',{name:'alpha',exact:true}).getByText('Lire le texte source',{exact:true}).click();await page.getByRole('button',{name:/^Aperçu ·/}).first().click();await page.getByRole('heading',{name:'Panneau de fichiers',exact:true}).waitFor();return page.locator('.file-preview')}
test('fichiers: dock inert text, exact source metadata, expansion/reduction/focus and independent receipts',async()=>{await filesUIFixture();const panel=await openFilesUI();await panel.locator('pre').waitFor();assert.equal(await panel.evaluate(e=>e.querySelector('h2')===document.activeElement),true);assert.equal(await panel.evaluate(e=>e.matches(':modal')),false);assert.equal(await panel.locator('pre').textContent(),'<script>window.UNTRUSTED=true</script><a href="https://evil">link</a>');assert.equal(await panel.locator('script,a,iframe,webview,svg[onload]').count(),0);assert.equal(await page.evaluate(()=>window.UNTRUSTED),undefined);await panel.getByRole('button',{name:'Agrandir',exact:true}).click();assert.equal(await panel.evaluate(e=>e.matches(':modal')),true);await panel.getByRole('button',{name:'Réduire l’aperçu',exact:true}).click();assert.equal(await panel.evaluate(e=>e.matches(':modal')),false);await panel.getByRole('button',{name:'Copier le chemin',exact:true}).click();await panel.getByText('Chemin copié.',{exact:true}).waitFor();await panel.getByRole('button',{name:'Ouvrir dans l’éditeur',exact:true}).click();await panel.getByText('Demande transmise à l’éditeur. Ouverture non confirmée.',{exact:true}).waitFor();const returnTarget=await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).elementHandle();assert.ok(returnTarget);await panel.getByRole('button',{name:'Fermer le panneau de fichiers',exact:true}).click();await page.waitForFunction(target=>target.isConnected&&target===document.activeElement,returnTarget);assert.equal(await returnTarget.evaluate(e=>e===document.activeElement),true);await returnTarget.dispose();assert.deepEqual((await page.evaluate(()=>window.projectFilesUIFixture.calls())).map(c=>c.action),['preview','copy','editor']);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])})
test('fichiers: source invalidation keeps old text and geometry/themes/native zoom200 preserve controls',async()=>{const refs=await filesUIFixture();const panel=await openFilesUI();await panel.locator('pre').waitFor();await page.evaluate(refs=>{const s=window.projectFilesUIFixture.state();window.projectFilesUIFixture.set({...s,references:refs.map(r=>({...r,current:false})),previews:s.previews.map(p=>({...p,status:'stale',reason:'Aperçu ancien — la source ou son contexte a changé.'}))})},refs);await panel.getByText('Aperçu ancien — la source ou son contexte a changé.',{exact:true}).waitFor();assert.equal(await panel.getByRole('button',{name:'Copier le chemin',exact:true}).isDisabled(),true);assert.ok((await panel.locator('pre').textContent()).includes('<script>'));const themeEvidence=[];for(const [width,height,theme,zoom] of [[720,820,'dark',1],[1440,920,'dark',2]]){await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));await setWorkspaceViewport(app,page,{width,height});await page.evaluate(theme=>{if(document.documentElement.dataset.theme===theme)return;const button=document.querySelector('.theme-toggle'),label=theme==='light'?'Passer au thème clair':'Passer au thème sombre';if(!(button instanceof HTMLButtonElement)||button.getAttribute('aria-label')!==label)throw Error('THEME_APP_BUTTON_UNAVAILABLE');button.click()},theme);await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);await app.evaluate(({BrowserWindow},z)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(z),zoom);await page.waitForFunction(({width,zoom})=>Math.abs(innerWidth-width/zoom)<=1,{width,zoom});await page.waitForFunction(({height,zoom})=>Math.abs(innerHeight-height/zoom)<=1,{height,zoom});await page.waitForFunction(()=>document.querySelector('.file-preview')?.matches(':modal'));const actual=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,width:innerWidth,height:innerHeight,modal:document.querySelector('.file-preview')?.matches(':modal')}));assert.equal(actual.theme,theme);assert.equal(actual.modal,true);themeEvidence.push({...actual,interaction:'programmatic App theme button DOM.click under modal; state coverage, not physical pointer coverage'});assert.equal(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.equal(await panel.getByRole('button',{name:'Fermer le panneau de fichiers',exact:true}).isVisible(),true)}console.log(JSON.stringify({filesGeometryActualThemes:themeEvidence}));await panel.press('Escape');assert.equal(await page.locator('.file-preview').count(),0)})
test('fichiers: late A response never steals B focus and return does not replay a read',async()=>{await filesUIFixture();await page.evaluate(()=>{window.focusEvents=[];document.addEventListener('focusin',e=>window.focusEvents.push({id:e.target.id,tag:e.target.tagName,text:e.target.textContent?.slice(0,80),at:performance.now()}));window.projectFilesUIFixture.defer()});await openFilesUI();await page.getByRole('button',{name:'Ouvrir le projet catalog-b',exact:true}).focus();await page.getByRole('button',{name:'Ouvrir le projet catalog-b',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.project-heading h1')===document.activeElement);await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByLabel('Rechercher une possibilité').waitFor({state:'visible'});await page.getByLabel('Rechercher une possibilité').focus();await page.evaluate(()=>window.projectFilesUIFixture.finish());assert.equal(await page.locator('.file-preview').count(),0);console.log(JSON.stringify({lateFocusEvents:await page.evaluate(()=>({events:window.focusEvents,active:{id:document.activeElement.id,tag:document.activeElement.tagName,text:document.activeElement.textContent?.slice(0,80)}}))}));assert.equal(await page.getByLabel('Rechercher une possibilité').evaluate(e=>e===document.activeElement),true);await page.getByRole('button',{name:'Ouvrir le projet catalog-a',exact:true}).click();await page.locator('.file-preview pre').waitFor();assert.equal((await page.evaluate(()=>window.projectFilesUIFixture.calls())).length,1)})

test('fichiers: dense ready dock exposes representative text and every named command at arrival',async()=>{const projects=['catalog-a','catalog-b'].map(id=>({id,name:id,rootPath:'C:/Users/UP60066553/AppData/Local/Temp/mfiles-main-native-sized/'+id,openedAt:'2026-11-04T10:00:00Z'}));await launch({}, {snapshot:{projects,activeProjectId:'catalog-a',drafts:[]}});await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)});await setWorkspaceViewport(app,page,{width:1440,height:920});const values=projects.map(project=>{const value=catalogUIValue(project.id),s=value.snapshot,old=s.rootPath;s.rootPath=project.rootPath;s.roots=s.roots.map(p=>p.replace(old,project.rootPath+'/.agents'));s.sources=s.sources.map(source=>({...source,path:source.path.replace(old,project.rootPath+'/.agents')}));return value}),refs=values.map((v,n)=>{const source=v.snapshot.sources[0];return {id:'ref-ui-'+n,producer:'catalog',projectId:v.projectId,rootPath:v.snapshot.rootPath,rootIdentity:v.snapshot.rootIdentity,initiativeId:null,revision:v.snapshot.revision,sourceId:source.id,path:source.path,sha256:source.sha256,bytes:source.bytes,observedAt:v.snapshot.observedAt,current:true}});await page.evaluate(({values,refs})=>{window.bmadCatalogUIFixture.set({contractVersion:1,sequence:1,projects:values});window.projectFilesUIFixture.set({contractVersion:1,sequence:1,references:refs,previews:[],results:[],issues:[]})},{values,refs});await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();const panel=await openFilesUI();await page.waitForFunction(()=>document.querySelector('.file-preview pre')?.textContent.includes('<script>')&&!document.querySelector('.file-preview-freshness')?.textContent.includes('Lecture locale en cours'));const geometry=await panel.evaluate(el=>{const pre=el.querySelector('.file-preview-content pre'),body=el.querySelector('.file-preview-body'),rect=pre.getBoundingClientRect(),lineHeight=parseFloat(getComputedStyle(pre).lineHeight),buttons=[...el.querySelectorAll('.file-preview-actions button')].map(button=>({name:button.textContent,bottom:button.getBoundingClientRect().bottom,top:button.getBoundingClientRect().top}));return {viewport:[innerWidth,innerHeight],contentTop:rect.top,lineHeight,bodyTop:body.scrollTop,buttons,sha:el.querySelector('.file-preview-facts').textContent}});console.log(JSON.stringify({filesReadyDockGeometry:geometry}));assert.equal(geometry.bodyTop,0);assert.ok(geometry.contentTop+geometry.lineHeight<=geometry.viewport[1]-16,JSON.stringify(geometry));for(const button of geometry.buttons)assert.ok(button.top>=0&&button.bottom<=geometry.viewport[1]-16,JSON.stringify(button));assert.ok(geometry.sha.includes('c'.repeat(64)));await panel.getByRole('button',{name:'Agrandir',exact:true}).click();assert.equal(await panel.evaluate(el=>el.matches(':modal')),true);assert.equal(await panel.locator('h2').evaluate(el=>el===document.activeElement),true);await panel.getByRole('button',{name:'Réduire l’aperçu',exact:true}).click();assert.equal(await panel.getByRole('button',{name:'Agrandir',exact:true}).evaluate(el=>el===document.activeElement),true)})

test('fichiers: explicit new revision reads once and returning to its project never replays it',async()=>{const refs=await filesUIFixture();const panel=await openFilesUI();await page.waitForFunction(()=>document.querySelector('.file-preview')?.getAttribute('data-preview-status')==='ready');const next={...refs[0],id:'ref-ui-new',revision:'b'.repeat(64),sha256:'d'.repeat(64),bytes:24};await page.evaluate(({refs,next})=>{const s=window.projectFilesUIFixture.state();window.projectFilesUIFixture.set({...s,references:[...refs.map(r=>r.id===refs[0].id?{...r,current:false}:r),next],previews:s.previews.map(p=>({...p,status:'stale',reason:'Source modifiée — aperçu ancien.'}))});window.projectFilesUIFixture.text('EXACT NEW REVISION BYTES');window.projectFilesUIFixture.defer()},{refs,next});await panel.getByRole('button',{name:'Examiner la nouvelle révision',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.file-preview')?.getAttribute('data-reference-id')==='ref-ui-new');const calls=await page.evaluate(()=>window.projectFilesUIFixture.calls());assert.deepEqual(calls,[{action:'preview',referenceId:'ref-ui-0'},{action:'preview',referenceId:'ref-ui-new'}]);assert.equal(await panel.getAttribute('data-preview-status'),'none');await page.evaluate(()=>window.projectFilesUIFixture.finish());await page.waitForFunction(()=>document.querySelector('.file-preview')?.getAttribute('data-preview-status')==='ready');assert.equal(await panel.locator('pre').textContent(),'EXACT NEW REVISION BYTES');await page.getByRole('button',{name:'Ouvrir le projet catalog-b',exact:true}).click();assert.equal(await page.locator('.file-preview').count(),0);await page.getByRole('button',{name:'Ouvrir le projet catalog-a',exact:true}).click();await page.locator('.file-preview pre').waitFor();assert.equal(await page.locator('.file-preview pre').textContent(),'EXACT NEW REVISION BYTES');assert.deepEqual(await page.evaluate(()=>window.projectFilesUIFixture.calls()),calls)})

test('fichiers: Q3 refused preview keeps independent unknown/failed editor and confirmed copy outcomes readable',async()=>{await filesUIFixture();const previewReason='Une activité possède déjà les outils locaux. Réessayez après sa fin.';await page.evaluate(reason=>{window.projectFilesUIFixture.previewRefusal(reason);window.projectFilesUIFixture.editorOutcome('unknown','Résultat de la demande d’ouverture inconnu — ouverture non confirmée. Aucun nouvel envoi automatique.')},previewReason);const panel=await openFilesUI();await page.waitForFunction(()=>document.querySelector('.file-preview')?.getAttribute('data-preview-status')==='refused');await panel.getByRole('button',{name:'Ouvrir dans l’éditeur',exact:true}).click();await panel.getByText('Résultat de la demande d’ouverture inconnu — ouverture non confirmée. Aucun nouvel envoi automatique.',{exact:true}).waitFor();assert.equal(await panel.getByText(previewReason,{exact:true}).isVisible(),true);await panel.getByRole('button',{name:'Copier le chemin',exact:true}).click();await panel.getByText('Chemin copié.',{exact:true}).waitFor();assert.equal(await panel.getByText('Résultat de la demande d’ouverture inconnu — ouverture non confirmée. Aucun nouvel envoi automatique.',{exact:true}).isVisible(),true);await page.evaluate(()=>window.projectFilesUIFixture.editorOutcome('failed','Demande d’ouverture échouée — vous pouvez copier le chemin.'));await panel.getByRole('button',{name:'Ouvrir dans l’éditeur',exact:true}).click();await panel.getByText('Demande d’ouverture échouée — vous pouvez copier le chemin.',{exact:true}).waitFor();assert.equal(await panel.getByText('Chemin copié.',{exact:true}).isVisible(),true);assert.equal(await panel.getByText(previewReason,{exact:true}).isVisible(),true)})
test('fichiers: Q4 invalidation removes Progress preview trigger and returns focus to exact resume title',async()=>{const f=await resumeFixture();await f.set();const source=f.snapshot.sources[0],reference={id:'ref-progress-focus',producer:'progress',projectId:f.projectId,rootPath:f.snapshot.rootPath,rootIdentity:f.snapshot.rootIdentity,initiativeId:f.snapshot.initiativeId,revision:f.snapshot.revision,sourceId:source.id,path:source.path,sha256:source.sha256,bytes:source.bytes,observedAt:f.snapshot.observedAt,current:true};await page.evaluate(reference=>window.projectFilesUIFixture.set({contractVersion:1,sequence:1,references:[reference],previews:[],results:[],issues:[]}),reference);await page.getByRole('tab',{name:'Parcours',exact:true}).click();const region=page.getByRole('region',{name:'Reprise du projet',exact:true}),fallback=await region.getByRole('heading',{name:'Reprise du projet',exact:true}).elementHandle();assert.ok(fallback);const sourceRegistry=region.locator('.resume-registry').filter({has:page.getByRole('heading',{name:'Registre des preuves · '+f.snapshot.sources.length,exact:true})});assert.equal(await sourceRegistry.count(),1);await sourceRegistry.evaluate(el=>el.open=true);const proof=sourceRegistry.locator(':scope > .resume-proof').filter({has:page.getByText('Voir la preuve de '+source.relativePath,{exact:true})});assert.equal(await proof.count(),1);await proof.evaluate(el=>el.open=true);const trigger=await proof.getByRole('button',{name:'Aperçu · '+source.path,exact:true}).elementHandle();assert.ok(trigger);await trigger.click();await page.waitForFunction(()=>document.querySelector('.file-preview')?.getAttribute('data-preview-status')==='ready');await page.evaluate(()=>{const s=window.projectFilesUIFixture.state();window.projectFilesUIFixture.set({...s,references:s.references.map(r=>({...r,current:false})),previews:s.previews.map(p=>({...p,status:'stale',reason:'Source invalidée.'}))})});await page.waitForFunction(target=>!target.isConnected,trigger);await page.getByRole('button',{name:'Fermer le panneau de fichiers',exact:true}).click();await page.waitForFunction(target=>target.isConnected&&target===document.activeElement,fallback);assert.equal(await fallback.evaluate(el=>el===document.activeElement),true);assert.equal(await trigger.evaluate(el=>el.isConnected),false);await fallback.dispose();await trigger.dispose()})

test('library L1-L4: exact cross-project request and return preserve captured initiative, unsaved draft and cursor',async()=>{
 const f=await resumeFixture();await f.set();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920))
 const other={projectId:'p-library-b',initiativeId:'older-b',conversationId:'c-library-b',providerId:'codex',connectionId:'account-b'},q={schemaVersion:1,id:'q-library-b',context:other,requestId:'r-library',turnId:'t-library',identity:{kind:'unknown'},fields:[{id:'answer',header:'Direction',prompt:'Attente précise de B',options:[],allowOther:true}],values:{answer:'Brouillon demande B'},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 await page.evaluate(({other,q})=>{window.madness.readState().then(reply=>window.connectionUIFixture.setSnapshot({projects:[...reply.value.state.projects,{id:other.projectId,name:reply.value.state.projects[0].name,rootPath:'C:/library-b',openedAt:new Date().toISOString()}],conversations:[...reply.value.state.conversations,{id:other.conversationId,context:other,lastKnownActivity:'running',messages:[{id:'b-result',role:'assistant',text:'Résultat B conservé littéralement'}]}]}));window.connectionUIFixture.setDialogue({status:'waiting-question',context:other,turn:{id:q.turnId,requestId:q.requestId,context:other,phase:'streaming'},questions:[q]})},{other,q})
 await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Travail A non enregistré 日本語');await page.locator('#draft').evaluate(e=>{e.focus();e.setSelectionRange(8,12)})
 const before=await page.evaluate(()=>({context:window.bmadContextUIFixture.choices(),progress:window.bmadProgressUIFixture.calls(),files:window.projectFilesUIFixture.calls(),help:window.connectionUIFixture.helpCalls()}))
 await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='q-library-b-title');assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation c-library-b');assert.equal(await page.getByLabel('Votre réponse',{exact:true}).inputValue(),'Brouillon demande B')
 await page.evaluate(q=>window.connectionUIFixture.setDialogue({questions:[{...q,status:'inactive',reason:'expired'}]}),q)
 await page.getByRole('button',{name:/^Revenir au travail · /}).click();await page.waitForFunction(()=>document.activeElement?.id==='draft');assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation resume-alpha');assert.equal(await page.locator('#draft').inputValue(),'Travail A non enregistré 日本語');assert.deepEqual(await page.locator('#draft').evaluate(e=>[e.selectionStart,e.selectionEnd]),[8,12])
 assert.deepEqual(await page.evaluate(()=>({context:window.bmadContextUIFixture.choices(),progress:window.bmadProgressUIFixture.calls(),files:window.projectFilesUIFixture.calls(),help:window.connectionUIFixture.helpCalls()})),before);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[])
 await page.getByRole('button',{name:'Accueil',exact:true}).click();const entries=page.locator('.library-project');assert.equal(await entries.count(),2);assert.equal(await entries.nth(0).getByRole('heading',{name:'État connu',exact:true}).count(),1);assert.ok((await entries.nth(0).textContent()).includes('Preuves contradictoires'));assert.ok((await entries.nth(1).textContent()).includes('Information non établie.'))
 await entries.nth(1).locator('.project-row').click();assert.equal(await page.getByRole('tab',{name:'Conversation',exact:true}).getAttribute('aria-selected'),'true');assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation c-library-b');assert.equal(await page.locator('[data-overview-id="question:q-library-b"]').count(),0)
})

test('library L5: late ordinary selection and state event cannot replace home or a later displayed project',async()=>{
 await launch();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920))
 await page.evaluate(()=>{window.connectionUIFixture.setSnapshot({projects:[{id:'late-a',name:'Même nom',rootPath:'C:/late-a',openedAt:new Date().toISOString()},{id:'late-b',name:'Même nom',rootPath:'C:/late-b',openedAt:new Date().toISOString()}]});window.connectionUIFixture.deferSelections()})
 await page.locator('.project-row').first().click();await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===1);await page.getByRole('button',{name:'Accueil',exact:true}).click();await page.evaluate(()=>window.connectionUIFixture.finishSelection(0));await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).waitFor();assert.equal(await page.locator('.project-tabs').count(),0)
 await page.locator('.project-row').last().click();await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===2);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('B reste affiché');await page.evaluate(()=>window.connectionUIFixture.setSnapshot({activeProjectId:'late-a',revision:200}));await page.evaluate(()=>window.connectionUIFixture.finishSelection(1));await page.waitForFunction(()=>document.querySelector('#draft')?.value==='B reste affiché');assert.equal(await page.locator('.project-banner h1').textContent(),'Même nom');assert.ok((await page.locator('.sidebar .project-link[aria-current="page"]').getAttribute('title')).includes('late-b'));assert.equal(await page.getByRole('tab',{name:'Conversation',exact:true}).getAttribute('aria-selected'),'true')
})

test('library L6: file consultation survives another tab and project without a second preview',async()=>{
 await filesUIFixture();const panel=await openFilesUI();await page.waitForFunction(()=>document.querySelector('.file-preview')?.getAttribute('data-preview-status')==='ready');const calls=await page.evaluate(()=>window.projectFilesUIFixture.calls());await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.getByRole('button',{name:'Ouvrir le projet catalog-b',exact:true}).click();await page.getByRole('button',{name:'Ouvrir le projet catalog-a',exact:true}).click();assert.equal(await page.getByRole('tab',{name:'Conversation',exact:true}).getAttribute('aria-selected'),'true');await panel.locator('pre').waitFor();assert.deepEqual(await page.evaluate(()=>window.projectFilesUIFixture.calls()),calls);assert.equal(await panel.locator('pre a').count(),0)
})

test('library L4: deleted return conversation stays absent instead of selecting a newer conversation',async()=>{
 const f=await resumeFixture();await f.set();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920));await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('A conserver malgré suppression');await page.getByRole('button',{name:'Accueil',exact:true}).click();await page.locator('.library-recaps > summary').click();const recap=page.locator('[data-recap-id="library-resume-alpha"]');await recap.locator(':scope > summary').click();await recap.getByRole('button',{name:'Retrouver la conversation',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='conversation-heading')
 await page.evaluate(({projectId,captured})=>window.connectionUIFixture.setSnapshot({conversations:[{id:'replacement',context:{...captured,conversationId:'replacement'},lastKnownActivity:'idle',messages:[{id:'newer',role:'assistant',text:'Ne doit pas remplacer la cible supprimée'}]}]}),{projectId:f.projectId,captured:f.captured})
 await page.getByRole('button',{name:/^Revenir au travail · /}).click();await page.getByText('Échange de retour supprimé — aucun échange de remplacement sélectionné.',{exact:true}).waitFor();assert.equal(await page.locator('#conversation-heading').count(),0);assert.equal(await page.locator('#draft').inputValue(),'A conserver malgré suppression');assert.equal(await page.getByText('Ne doit pas remplacer la cible supprimée',{exact:true}).count(),0)
})

test('library review: preserve presented evidence and open details until the explicit observation switch',async()=>{
 const f=await resumeFixture();await f.set();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920));await page.getByRole('button',{name:'Accueil',exact:true}).click()
 const card=page.locator('.library-project').first(),registry=card.locator('.library-evidence');await registry.locator(':scope > summary').click();const proof=registry.locator('section > details').filter({has:page.locator('summary').filter({hasText:'Décisions locales'})});await proof.locator(':scope > summary').click();await proof.locator(':scope > summary').focus();const original=await proof.elementHandle()
 const next=structuredClone(f.snapshot);next.revision='f'.repeat(64);next.excerpts[0].text='Nouvelle décision littérale, toujours sans acceptation.';next.sources[1].sha256='9'.repeat(64)
 await f.set(next);const show=card.getByRole('button',{name:'Afficher la nouvelle observation',exact:true});await show.waitFor();assert.equal(await proof.evaluate(e=>e.open),true);assert.equal(await original.evaluate(e=>e.isConnected),true);assert.equal(await proof.locator('.message-text').textContent(),f.snapshot.excerpts[0].text);assert.equal(await proof.locator(':scope > summary').evaluate(e=>e===document.activeElement),true);assert.equal(await proof.getByText('Nouvelle décision littérale, toujours sans acceptation.',{exact:true}).count(),0);assert.ok((await card.locator('.library-displayed-observation').textContent()).includes(f.snapshot.revision));assert.ok((await card.locator('.library-new-observation').textContent()).includes(next.revision))
 await f.set(next,'stale');assert.equal(await show.getAttribute('aria-disabled'),'true');await show.evaluate(e=>e.click());assert.equal(await proof.locator('.message-text').textContent(),f.snapshot.excerpts[0].text)
 await f.set(next);await show.click();assert.equal(await registry.evaluate(e=>e.open),false);assert.equal(await show.evaluate(e=>e===document.activeElement),true);assert.ok((await card.locator('.library-displayed-observation').textContent()).includes(next.revision));await registry.locator(':scope > summary').click();await proof.locator(':scope > summary').click();assert.equal(await proof.locator('.message-text').textContent(),next.excerpts[0].text);assert.ok((await proof.textContent()).includes(next.sources[1].sha256))
 const replacement=structuredClone(next);replacement.rootIdentity='replacement-physical-root';replacement.revision='8'.repeat(64);replacement.excerpts[0].text='Ancienne preuve d’une autre racine, nommée historique.';await f.set(replacement);await card.locator('.library-displayed-observation').getByText(replacement.revision,{exact:true}).waitFor();assert.equal(await card.locator('.library-evidence').evaluate(e=>e.open),false);assert.ok((await card.textContent()).includes('Observation d’un autre contexte ou d’une ancienne racine — historique seulement.'));assert.equal(await card.getByRole('button',{name:'Afficher la nouvelle observation',exact:true}).count(),0);assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[]);await original.dispose()
})

test('library review: global recovery releases pending before an obsolete project selection completes',async()=>{
 await launch();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920));await page.evaluate(()=>{window.connectionUIFixture.setSnapshot({projects:[{id:'pending-global',name:'Projet de sélection différée',rootPath:'C:/pending-global',openedAt:new Date().toISOString()}]});window.connectionUIFixture.deferSelections()});await page.locator('.project-row').click();await page.waitForFunction(()=>window.connectionUIFixture.selectionCount()===1)
 const open=page.getByRole('button',{name:'Ouvrir un projet',exact:true});assert.equal(await open.isDisabled(),true);await page.evaluate(async()=>{const dialogue=await window.madnessDialogue.read();window.connectionUIFixture.setDialogue({status:'unknown',errorCode:'STOP_UNCONFIRMED',context:{projectId:null,initiativeId:null,conversationId:null,providerId:null,connectionId:null},recovery:{...dialogue.recovery,stop:'unconfirmed'}})})
 await page.getByRole('button',{name:'Retrouver la récupération',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='overview-session-recovery');assert.equal(await open.isEnabled(),true);assert.equal(await page.getByRole('button',{name:'Réduire la navigation',exact:true}).getAttribute('aria-disabled'),'false');assert.equal(await page.locator('.sidebar .project-link').isEnabled(),true)
 await page.evaluate(()=>window.connectionUIFixture.finishSelection(0));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).isVisible(),true);assert.equal(await open.isEnabled(),true);assert.equal(await page.evaluate(()=>document.activeElement?.id),'overview-session-recovery');assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

async function catalogLaunchUI(family='mary',decorate=null){
 const {catalogFixture}=await import('./helpers/catalog-launch-fixture.mjs'),f=await catalogFixture({family});const p=(await f.prepare()).preparation;await f.shutdown();decorate?.(p)
 const project={id:p.projectId,name:'Catalogue qualifié de préparation',rootPath:p.snapshot.rootPath,openedAt:p.preparedAt},other={id:'other-project',name:'Autre projet',rootPath:'C:/other',openedAt:p.preparedAt},context={projectId:p.projectId,initiativeId:null,conversationId:'catalog-old',providerId:'codex',connectionId:'old-account'}
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false},{snapshot:{projects:[project,other],conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'old-result',role:'assistant',text:'Historique exact avant préparation'}]}],drafts:[{projectId:project.id,text:'Brouillon libre intact 🧭',savedAt:p.preparedAt}]}})
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show()});await setWorkspaceViewport(app,page,{width:1440,height:920})
 await page.evaluate(p=>{window.catalogLaunchUIFixture.configure(p);window.bmadCatalogUIFixture.set({contractVersion:1,sequence:1,projects:[{projectId:p.projectId,generation:p.generation,status:'ready',freshness:'current',monitoring:'watching',queued:false,snapshot:p.snapshot,copy:null,errorCode:null,error:null}]})},p)
 await page.getByRole('button',{name:'Ouvrir le projet '+project.name,exact:true}).click();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByLabel('Rechercher une possibilité').fill(family==='mary'?'analyst':p.itemId);await page.getByRole('button',{name:'Fiche compétence '+p.itemId,exact:true}).click()
 return p
}
test('catalogue lancement: K1 K4 K7 prepare without send, exact draft/history and cancel returns the filtered fiche',async()=>{
 await catalogLaunchUI();await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click();await page.getByRole('heading',{name:'Préparation · bmad-agent-analyst',exact:true}).waitFor()
 assert.equal(await page.locator('#catalog-launch-heading').evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre intact 🧭');await page.getByText('Historique exact avant préparation',{exact:true}).waitFor()
 const calls=await page.evaluate(()=>window.catalogLaunchUIFixture.calls());assert.equal(calls.prepare.length,1);assert.equal(calls.launch.length,0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.getByRole('button',{name:'Annuler le lancement',exact:true}).click();await page.getByRole('dialog',{name:'bmad-agent-analyst',exact:true}).waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByLabel('Rechercher une possibilité').inputValue(),'analyst');assert.equal(await page.getByRole('button',{name:'Fiche compétence bmad-agent-analyst',exact:true}).evaluate(e=>e===document.activeElement),true)
})
test('catalogue lancement: K5 K6 exact ACK selects only its conversation and double click admits one request',async()=>{
 const p=await catalogLaunchUI();await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click();await page.getByRole('button',{name:'Lancer une nouvelle conversation',exact:true}).evaluate(e=>{e.click();e.click()})
 assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,1)
 await page.evaluate(()=>window.catalogLaunchUIFixture.finish('foreign-request'));await page.getByText('Historique exact avant préparation',{exact:true}).waitFor();assert.equal(await page.locator('#conversation-heading code').textContent(),'catalog-old')
 await page.evaluate(()=>window.catalogLaunchUIFixture.finish());await page.waitForFunction(()=>document.querySelector('#conversation-heading code')?.textContent==='catalog-new');assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre intact 🧭');await page.getByText('Origine catalogue · bmad-agent-analyst',{exact:true}).waitFor();await page.getByText('Origine catalogue · bmad-agent-analyst',{exact:true}).click();const origin=page.locator('.catalog-origin');assert.ok((await origin.textContent()).includes(p.snapshot.sources[0].path));assert.ok((await origin.textContent()).includes(p.snapshot.sources[0].sha256));await origin.getByText('Descripteur historique capturé',{exact:true}).click();assert.equal(await origin.locator('details pre').textContent(),p.snapshot.sources[0].text)
 assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch[0].preparationId,p.id)
})
test('catalogue lancement: K7 late preparation after navigation cannot move the view',async()=>{
 await catalogLaunchUI();await page.evaluate(()=>window.catalogLaunchUIFixture.defer());await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click();await page.keyboard.press('Escape');await page.getByRole('tab',{name:'Graphe',exact:true}).click();await page.evaluate(()=>window.catalogLaunchUIFixture.finishPrepare());await page.getByRole('heading',{name:'Graphe du projet',exact:true}).waitFor();assert.equal(await page.locator('#catalog-launch-heading').count(),0);assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,0)
})
test('catalogue lancement: K8 keyboard, two themes, compact and native zoom200 preserve decisions',async()=>{
 await catalogLaunchUI();await page.getByRole('button',{name:'Préparer le lancement',exact:true}).focus();await page.keyboard.press('Enter');await page.locator('#catalog-launch-heading').waitFor()
 for(const [width,height,theme,zoom] of [[720,820,'dark',1],[1440,920,'dark',2]]){
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));await setWorkspaceViewport(app,page,{width,height});if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:theme==='light'?'Passer au thème clair':'Passer au thème sombre',exact:true}).click();await app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom);await page.waitForFunction(({width,zoom})=>Math.abs(innerWidth-width/zoom)<=1,{width,zoom});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);const launch=page.getByRole('button',{name:'Lancer une nouvelle conversation',exact:true});await launch.scrollIntoViewIfNeeded();await launch.focus();assert.equal(await launch.evaluate(e=>e===document.activeElement&&e.getBoundingClientRect().width>0),true);assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre intact 🧭')
 }
 assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,0)
})

test('catalogue lancement: K3 typed context refusal opens the existing initiative conflict without sending',async()=>{
 const p=await catalogLaunchUI('forge')
 await page.evaluate(p=>{const root=p.snapshot.rootPath;window.bmadContextUIFixture.set({contractVersion:1,sequence:1,projects:[{projectId:p.projectId,status:'ready',freshness:'current',monitoring:'watching',storage:'stored',error:null,observation:{schemaVersion:1,projectId:p.projectId,rootPath:root,rootIdentity:p.snapshot.rootIdentity,revision:'a'.repeat(64),observedAt:p.preparedAt,status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:['alpha','beta'].map(id=>({id,name:id,path:root+'/'+id,source:root+'/'+id+'/'+id+'.md',revision:'b'.repeat(64)})),sources:[],problems:[]},selection:{schemaVersion:1,projectId:p.projectId,rootPath:root,rootIdentity:p.snapshot.rootIdentity,revision:1,initiativeId:'beta'}}]});window.catalogLaunchUIFixture.refuse('CONTEXT_MISMATCH')},p)
 await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click()
 const conflict=page.getByRole('dialog',{name:'Contexte à vérifier',exact:true});await conflict.waitFor();await conflict.getByRole('button',{name:'Sélectionner l’initiative active',exact:true}).waitFor();await conflict.getByRole('button',{name:'Rester sur cette sélection',exact:true}).waitFor();assert.equal(await page.locator('.catalog-dialog[open]').count(),0);assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,0)
})

test('catalogue lancement: copy and prepare exclude each other through delayed operations and handler races',async()=>{
 await catalogLaunchUI()
 const copy=page.getByRole('button',{name:'Copier l’invocation',exact:true}),prepare=page.getByRole('button',{name:'Préparer le lancement',exact:true})
 await page.evaluate(()=>window.bmadCatalogUIFixture.defer());await copy.click();assert.equal(await prepare.isDisabled(),true)
 await prepare.evaluate(e=>{e.disabled=false;e.click()});assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).prepare.length,0)
 await page.evaluate(()=>window.bmadCatalogUIFixture.finish());await page.getByText('Invocation copiée',{exact:true}).waitFor();assert.equal(await prepare.isDisabled(),false)
 await page.evaluate(()=>window.catalogLaunchUIFixture.defer());await prepare.click();assert.equal(await copy.isDisabled(),true)
 await copy.evaluate(e=>{e.disabled=false;e.click()});assert.equal((await page.evaluate(()=>window.bmadCatalogUIFixture.copies())).length,1)
 await page.evaluate(()=>window.catalogLaunchUIFixture.finishPrepare());await page.locator('#catalog-launch-heading').waitFor();await page.getByRole('button',{name:'Annuler le lancement',exact:true}).click();await page.getByRole('dialog',{name:'bmad-agent-analyst',exact:true}).waitFor()
 assert.equal(await copy.isDisabled(),false);assert.equal(await prepare.isDisabled(),false);assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,0)
})
test('catalogue lancement: selection revision changes disable the captured preparation before launch',async()=>{
 const p=await catalogLaunchUI();await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click();await page.locator('#catalog-launch-heading').waitFor()
 const start=page.getByRole('button',{name:'Lancer une nouvelle conversation',exact:true});assert.equal(await start.isDisabled(),false)
 await page.evaluate(p=>{const root=p.snapshot.rootPath;window.bmadContextUIFixture.set({contractVersion:1,sequence:1,projects:[{projectId:p.projectId,status:'ready',freshness:'current',monitoring:'watching',storage:'stored',error:null,observation:{schemaVersion:1,projectId:p.projectId,rootPath:root,rootIdentity:p.snapshot.rootIdentity,revision:'a'.repeat(64),observedAt:p.preparedAt,status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:[{id:'alpha',name:'alpha',path:root+'/alpha',source:root+'/alpha/alpha.md',revision:'b'.repeat(64)}],sources:[],problems:[]},selection:{schemaVersion:1,projectId:p.projectId,rootPath:root,rootIdentity:p.snapshot.rootIdentity,revision:1,initiativeId:'alpha'}}]})},p)
 await page.getByText('Sélection d’initiative modifiée — cette préparation est périmée. Retournez à la fiche puis préparez de nouveau.',{exact:true}).waitFor();assert.equal(await start.isDisabled(),true);assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,0)
 await (await settingsLanguage()).click();await closeSettings();await page.waitForFunction(()=>document.documentElement.lang==='en');await page.getByText('Initiative selection changed — this preparation is stale. Return to details then prepare again.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Start a new conversation',exact:true}).isDisabled(),true);assert.equal((await page.evaluate(()=>window.catalogLaunchUIFixture.calls())).launch.length,0);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})

async function metricsFixture(){
 const f=await initiativeFixture();const context={projectId:f.projectId,initiativeId:'alpha',conversationId:'metrics-c',providerId:'codex',connectionId:'account-1'};
 const source={sourceId:'source',path:'C:/project/_bmad-output/alpha/tickets/tickets.toml',sha256:'b'.repeat(64),bytes:12,identity:'source-physical',kind:'entry',line:1,typeLine:2,type:'story'};
 const story={id:'us-metrics',projectId:f.projectId,rootPath:'C:/project',rootIdentity:'root',initiativeId:'alpha',initiativePath:'C:/project/_bmad-output/alpha',container:'tickets/epic',ticketId:'13',title:'Durée synthétique',contextRevision:'a'.repeat(64),proofRevision:'c'.repeat(64),sources:[source],active:true};
 const receipt=(phase,at)=>({schemaVersion:1,runId:'run',sessionId:'session',threadId:'thread',nativeTurnId:'native',domain:'clock',phase,at,outcome:phase==='ack'?null:'failed',payloadDigest:'e'.repeat(64)});
 const record={id:'record-exact',context,requestId:'request-exact',localTurnId:'same-local',story,receipts:[receipt('ack',7),receipt('terminal',7)]};
 const summary={identified:1,known:1,unknown:0,knownMs:0,coverage:'complete',overlap:'none',nativeDuration:'unavailable',usage:'unavailable',cost:'unavailable'};
 const project={projectId:f.projectId,archive:{schemaVersion:1,projectId:f.projectId,revision:1,occurrences:[story],turns:[record]},durableRevision:1,storage:'stored',error:null,summary,observations:[{localIds:['same-local'],context,storyRef:story.id,durationMs:0,reason:'known',outcomes:['failed'],durable:true}],stories:[{storyRef:story.id,summary}],conversations:[{conversationId:context.conversationId,summary}],candidates:[{initiativeId:'alpha',container:story.container,ticketId:'13',title:story.title,storyRef:story.id,reason:'qualified'}],unobservedActivity:'unknown'};
 const state={contractVersion:1,sequence:1,projects:[project],choiceRef:null,error:null};assert.ok(isUsMetricsState(state));
 await page.evaluate(({state,context})=>{window.metricsUIFixture.set(state);window.connectionUIFixture.setSnapshot({conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[]}]});window.connectionUIFixture.setDialogue({status:'ready',context,acknowledged:true})},{state,context});return {state,project,story,context};
}
test('UI13 choix local, envoi exact et refus gardent le brouillon sans effet',async()=>{
 const f=await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Texte exact 🧭');
 await page.locator('[data-metric-choice="send"] summary').click();await page.locator('[data-metric-choice="send"] input[value="us-metrics"]').check();
 assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.choices()),[]);await page.evaluate(()=>window.metricsUIFixture.refuse(true));await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();
 await page.getByText('Choix refusé — la rédaction reste disponible. Choisissez de nouveau ou continuez sans attribution.',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);assert.equal(await page.locator('#draft').inputValue(),'Texte exact 🧭');
 await page.evaluate(()=>window.metricsUIFixture.refuse(false));await page.locator('[data-metric-choice="send"] input[value="us-metrics"]').check();await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);
 const {choices,calls}=await page.evaluate(()=>({choices:window.metricsUIFixture.choices(),calls:window.metricsUIFixture.calls()}));assert.equal(choices.at(-1).text,'Texte exact 🧭');assert.deepEqual(choices.at(-1).operation,{type:'send'});assert.equal(calls[0].requestId,choices.at(-1).requestId);assert.equal(calls[0].choiceRef,'choice-ui');assert.equal(await page.locator('[data-metric-choice="send"] input[value=""]').isChecked(),true);
})
test('UI13 lecture passive vrai zero, cout indisponible et ancienne liaison explicite',async()=>{
 const f=await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('.overview-details > summary').click();await page.locator('.turn-recap > summary').first().click();await page.locator('.metric-summary').first().getByText(/Durée connue : 0 ms/).waitFor();await page.getByText('Coût indisponible — aucun montant qualifié',{exact:true}).first().waitFor();
 await page.locator('.metric-observation > summary').first().click();await page.getByText('Liaison exacte des reçus indisponible pour cette ancienne projection.',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.choices()),[]);
})

test('UI13 invalidation de preuve, lecture equivalente et continuation volontaire sans attribution',async()=>{
 const f=await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Rédaction préservée');const choice=page.locator('[data-metric-choice="send"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();
 await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);assert.equal(await choice.locator('input[value="us-metrics"]').isChecked(),true);
 const changed=structuredClone(f.state);changed.projects[0].archive.occurrences[0].proofRevision='f'.repeat(64);await page.evaluate(value=>window.metricsUIFixture.set(value),changed);await choice.getByText('Choix périmé : contexte, préparation ou preuve modifiés.',{exact:true}).waitFor();await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);assert.equal(await page.locator('#draft').inputValue(),'Rédaction préservée');await choice.getByRole('button',{name:'Continuer sans attribution',exact:true}).click();await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();await page.waitForFunction(()=>window.connectionUIFixture.sent().length===1);assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.choices()),[]);
})
test('UI13 lancement Mary capture mode et requestId sans exiger un recu catalogue',async()=>{
 const f=await metricsFixture();await page.evaluate(()=>window.connectionUIFixture.setDialogue({status:'stopped',context:{projectId:'p-context',initiativeId:'alpha',conversationId:null,providerId:'codex',connectionId:'account-1'}}));
 await page.getByLabel('Proposer des modifications avec approbation',{exact:true}).check();const choice=page.locator('[data-metric-choice="launch"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);const call=await page.evaluate(()=>window.metricsUIFixture.calls()[0]);assert.equal(call.type,'launch');assert.equal(call.mode,'file-approval');assert.equal((await page.evaluate(()=>window.metricsUIFixture.choices()[0])).operation.mode,'file-approval');
 await page.evaluate(({call,context})=>{context={...context,conversationId:'new-measured'};window.connectionUIFixture.setSnapshot({conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[]}]});window.connectionUIFixture.setDialogue({status:'ready',context,turn:{id:'new-turn',requestId:call.requestId,context,phase:'completed'}})},{call,context:f.context});await page.waitForFunction(()=>document.getElementById('tab-conversation')?.getAttribute('aria-selected')==='true');assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation new-measured');
})
test('UI13 membres exacts, conservation echouee et retard conservent focus et perimetre',async()=>{
 const f=await metricsFixture();f.project.observations[0].members={schemaVersion:1,recordIds:['record-exact']};f.project.observations[0].durable=false;f.project.storage='failed';f.project.error='STORAGE_WRITE_FAILED';f.project.durableRevision=0;
 const other=structuredClone(f.project.archive.turns[0]);other.id='other-proof';other.context={...f.context,conversationId:'other-conversation'};other.requestId='other-request';other.receipts=other.receipts.map(r=>({...r,nativeTurnId:'other-native',payloadDigest:'f'.repeat(64)}));f.project.archive.turns.push(other);assert.ok(isUsMetricsState(f.state));await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);
 await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('.overview-details > summary').click();await page.locator('.turn-recap > summary').first().click();const reading=page.locator('.metric-reading').first();await reading.locator('.metric-observation > summary').click();await reading.getByText('Mesure conservée pour cette session — enregistrement non confirmé.',{exact:false}).first().waitFor();await reading.getByText(/Reçu membre.*record-exact/).waitFor();assert.equal(await reading.getByText(/Reçu membre.*other-proof/).count(),0);await page.locator('#draft').fill('Focus préservé');await page.locator('#draft').focus();await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);assert.equal(await page.evaluate(()=>document.activeElement.id),'draft');assert.equal(await page.locator('#draft').inputValue(),'Focus préservé');await reading.getByRole('button',{name:'Réessayer l’enregistrement',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[{type:'retry-save',projectId:f.context.projectId}]);
})

test('UI13 ajustement nouveau tour attend la saisie durable, decisions restent dans leur tour',async()=>{
 const f=await metricsFixture(),approval={schemaVersion:1,id:'metric-approval',context:f.context,requestId:'approval-request',turnId:'approval-turn',identity:{kind:'unknown'},mode:'file-approval',files:[{path:'C:/project/proposal.md',kind:'add',diff:'Proposition synthétique',beforeSha256:null,afterSha256:'a'.repeat(64)}],reason:null,adjustment:'Ancien ajustement',adjustmentStatus:'draft',status:'decided',decision:'decline',transmission:'sent',effect:'declined',result:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'};
 await page.evaluate(approval=>window.connectionUIFixture.setDialogue({approvals:[approval]}),approval);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('.request-history > summary').click();const panel=page.locator('[data-approval-id="metric-approval"]');await panel.locator('textarea').fill('Ajustement exact après écriture durable 🧭');const choice=panel.locator('[data-metric-choice="adjust-metric-approval"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();await panel.getByRole('button',{name:'Envoyer cet ajustement à Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);
 const {calls,choices}=await page.evaluate(()=>({calls:window.metricsUIFixture.calls(),choices:window.metricsUIFixture.choices()}));assert.equal(choices[0].text,'Ajustement exact après écriture durable 🧭');assert.deepEqual(choices[0].operation,{type:'send-adjustment',approvalId:approval.id});assert.equal(calls[0].type,'send-adjustment');assert.equal(calls[0].requestId,choices[0].requestId);
})
test('UI13 deux clics et choix tardif apres changement de conversation ne transmettent rien',async()=>{
 const f=await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Texte capturé avant retard');const choice=page.locator('[data-metric-choice="send"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();await page.evaluate(()=>window.metricsUIFixture.defer());await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).evaluate(e=>{e.click();e.click()});await page.waitForFunction(()=>window.metricsUIFixture.choices().length===1);
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({conversations:[{id:'other-conversation',context:{...context,conversationId:'other-conversation'},lastKnownActivity:'idle',messages:[]}]}),f.context);await page.locator('#conversation-heading code').filter({hasText:'other-conversation'}).waitFor();await page.evaluate(()=>window.metricsUIFixture.finish());await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);assert.equal(await page.locator('#draft').inputValue(),'Texte capturé avant retard');
})

test('UI13 batch availability distinguishes unassigned, not loaded, unreadable, cache and command refusal',async()=>{
 const f=await metricsFixture();const p=f.project;p.archive.occurrences=[];p.archive.turns[0].story=null;p.observations[0].storyRef=null;p.candidates=[];p.stories=[];assert.ok(isUsMetricsState(f.state));await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);
 const registry=page.locator('.metric-registry');await registry.locator(':scope > summary').click();await registry.getByText('Aucune occurrence d’US conservée. Les tours non attribués restent consultables dans les récapitulatifs de conversation.',{exact:true}).waitFor();assert.equal(await registry.getByText(/aucun tour identifié/i).count(),0);await registry.getByRole('button',{name:'Voir les récapitulatifs de conversation',exact:true}).click();assert.match(await page.evaluate(()=>document.activeElement.id),/-recaps$/);
 await page.locator('.resume-local-recap .turn-recap > summary').click();const recap=page.locator('.resume-local-recap .metric-reading');await recap.getByText('Durée connue : 0 ms',{exact:true}).waitFor();
 await page.evaluate(()=>window.metricsUIFixture.set({contractVersion:1,sequence:1,projects:[],choiceRef:null,error:null}));await registry.getByText('Mesures non chargées — durée et historique inconnus.',{exact:true}).waitFor();await page.locator('.resume-local-recap').getByText('Mesures non chargées — durée et historique inconnus.',{exact:false}).waitFor();assert.equal(await registry.getByText(/Historique non instrumenté/).count(),0);
 const unreadable=structuredClone(f.state);unreadable.projects[0].archive.turns=[];unreadable.projects[0].observations=[];unreadable.projects[0].conversations=[];unreadable.projects[0].summary={identified:0,known:0,unknown:0,knownMs:null,coverage:'none',overlap:'none',nativeDuration:'unavailable',usage:'unavailable',cost:'unavailable'};unreadable.projects[0].storage='unreadable';unreadable.projects[0].error='STORAGE_READ_FAILED';await page.evaluate(value=>window.metricsUIFixture.set(value),unreadable);await registry.getByText('Mesures indisponibles — annexe illisible. Durée et historique inconnus.',{exact:true}).waitFor();await recap.getByText('Mesures indisponibles — annexe illisible. Durée et historique inconnus.',{exact:true}).waitFor();assert.equal(await recap.getByText(/Historique non instrumenté/).count(),0);
 await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);await page.evaluate(()=>window.metricsUIFixture.emitInvalid());await registry.getByText('Lecture des mesures impossible — la rédaction reste disponible.',{exact:true}).waitFor();await recap.getByText('Durée connue : 0 ms',{exact:true}).waitFor();
 await page.evaluate(value=>window.metricsUIFixture.set({...value,error:'PROFILE_CHANGED'}),f.state);assert.equal(await registry.getByText('Lecture des mesures impossible — la rédaction reste disponible.',{exact:true}).count(),0);assert.equal(await recap.getByText('Lecture des mesures impossible — la rédaction reste disponible.',{exact:true}).count(),0);
})
test('UI13 batch historical turn uses captured member evidence instead of updated occurrence',async()=>{
 const f=await metricsFixture();f.project.observations[0].members={schemaVersion:1,recordIds:['record-exact']};const original=structuredClone(f.story);f.project.archive.turns[0].story=structuredClone(original);f.story.title='Titre courant différent';f.story.proofRevision='f'.repeat(64);f.story.sources[0].path='C:/project/new-current-evidence.toml';f.story.sources[0].sha256='f'.repeat(64);await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('.overview-details > summary').click();await page.locator('.turn-recap > summary').first().click();const observation=page.locator('.work-overview .metric-observation').first();await observation.locator(':scope > summary').click();await observation.locator('details > summary').first().click();const text=await observation.innerText();assert.ok(text.includes(original.title));assert.ok(text.includes(original.proofRevision));assert.ok(text.includes(original.sources[0].path));assert.equal(text.includes(f.story.title),false);assert.equal(text.includes(f.story.sources[0].path),false);
 delete f.project.observations[0].members;await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);await observation.locator(':scope > summary').click();await observation.getByText('Liaison exacte des reçus indisponible pour cette ancienne projection.',{exact:true}).waitFor();assert.equal((await observation.innerText()).includes(f.story.title),false);
})
test('UI13 batch sticky scope and proof roundtrips never restore attribution without rechoice',async()=>{
 const f=await metricsFixture();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920));await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Texte roundtrip');const choice=page.locator('[data-metric-choice="send"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();const changed=structuredClone(f.state);changed.projects[0].archive.occurrences[0].proofRevision='f'.repeat(64);await page.evaluate(value=>window.metricsUIFixture.set(value),changed);await choice.getByText('Choix périmé : contexte, préparation ou preuve modifiés.',{exact:true}).waitFor();await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);assert.equal(await choice.locator('input[value="us-metrics"]').isChecked(),false);await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);
 await choice.locator('input[value="us-metrics"]').check();await page.getByRole('button',{name:'Accueil',exact:true}).click();await page.locator('.project-row').first().click();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await choice.locator(':scope > summary').click();assert.equal(await choice.locator('input[value="us-metrics"]').isChecked(),false);await choice.getByRole('button',{name:'Continuer sans attribution',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.matches('[data-metric-choice="send"] > summary'));assert.equal(await page.locator('#draft').inputValue(),'Texte roundtrip');
})
test('UI13 batch outstanding choice cannot survive an observed proof roundtrip',async()=>{
 const f=await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Texte avant attente');const choice=page.locator('[data-metric-choice="send"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();await page.evaluate(()=>window.metricsUIFixture.defer());await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.choices().length===1);const changed=structuredClone(f.state);changed.projects[0].archive.occurrences[0].proofRevision='f'.repeat(64);await page.evaluate(value=>window.metricsUIFixture.set(value),changed);await choice.getByText('Choix périmé : contexte, préparation ou preuve modifiés.',{exact:true}).waitFor();await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);await page.evaluate(()=>window.metricsUIFixture.finish());await choice.getByText('Choix refusé — la rédaction reste disponible. Choisissez de nouveau ou continuez sans attribution.',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);assert.equal(await page.locator('#draft').inputValue(),'Texte avant attente');
})

test('UI13 batch readable durations retain exact zero and tiny positive precision',async()=>{
 await metricsFixture();const values=await page.evaluate(()=>[0,0.000000001,1500,600000,60001].map(value=>[window.metricsFormatFixture.metricDuration(value),window.metricsFormatFixture.metricRawMs(value)]));assert.deepEqual(values,[['0 ms','0 ms'],['0,000000001 ms','0,000000001 ms'],['1,5 s','1\u202f500 ms'],['10 min','600\u202f000 ms'],['1 min 0,001 s','60\u202f001 ms']]);
})
for(const kind of ['launch','launchForge','launchHelp'])test('UI13 wires attributed '+kind+' preserves operation request and default mode',async()=>{
 const f=await metricsFixture();await page.evaluate(context=>window.connectionUIFixture.setDialogue({status:'stopped',context:{...context,conversationId:null}}),f.context);
 if(kind==='launchForge'){await page.getByRole('button',{name:'Préparer Forge',exact:true}).click();await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()}
 if(kind==='launchHelp'){
  const bundle={schemaVersion:1,id:'bundle-metrics',projectId:f.context.projectId,rootPath:f.story.rootPath,observedAt:new Date().toISOString(),revision:'a'.repeat(64),diagnostic:'candidate-observed',nativeReady:true,problems:[],documents:[{id:'doc-help',source:'C:/project/help.md',snapshot:'help.md',sha256:'b'.repeat(64),bytes:21,text:'Aide locale intégrale',module:'bmm',skills:[]}],references:[],sources:[],activeInitiative:'alpha',selectedInitiative:'alpha',outputPath:null,inventories:[],knowledgeRaw:'{}',configRaw:'{}',skillPath:'C:/project/bmad/SKILL.md'};const help={contractVersion:1,sequence:1,status:'ready',freshness:'current',monitoring:'watching',projectId:f.context.projectId,bundle,records:[],error:null};assert.ok(isHelpState(help));await page.evaluate(help=>window.connectionUIFixture.setHelp(help),help);await page.getByRole('button',{name:'Voir les aides',exact:true}).click();
 }
 const choice=page.locator('[data-metric-choice="'+kind+'"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.calls()),[]);const name={launch:'Lancer Mary avec Codex',launchForge:'Lancer Forge avec Codex',launchHelp:'Demander à BMad'}[kind];await page.getByRole('button',{name,exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);
 const {calls,choices}=await page.evaluate(()=>({calls:window.metricsUIFixture.calls(),choices:window.metricsUIFixture.choices()}));const expected={launch:'launch',launchForge:'launch-forge',launchHelp:'launch-help'}[kind];assert.equal(calls[0].type,expected);assert.equal(calls[0].requestId,choices[0].requestId);assert.equal(calls[0].choiceRef,'choice-ui');assert.equal(choices[0].storyRef,f.story.id);assert.equal(choices[0].conversationId,null);assert.equal(choices[0].text,null);assert.deepEqual(choices[0].operation,kind==='launch'?{type:'launch',mode:'read-only'}:{type:expected});if(kind==='launch')assert.equal(calls[0].mode,'read-only');
})
test('UI13 wires attributed catalogue uses preparation request and durable origin gate',async()=>{
 const f=await metricsFixture();const initial=structuredClone(f.state);const p=await catalogLaunchUI('mary',p=>{
  const observation={schemaVersion:1,projectId:p.projectId,rootPath:p.snapshot.rootPath,rootIdentity:p.snapshot.rootIdentity,revision:'a'.repeat(64),observedAt:p.preparedAt,status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:[{id:'alpha',name:'alpha',path:p.snapshot.rootPath+'/_bmad-output/alpha',source:p.snapshot.rootPath+'/_bmad-output/alpha/alpha.md',revision:'b'.repeat(64)}],sources:[],problems:[]};p.captured={scope:'initiatives',observation,initiativeId:'alpha'};p.selectionRevision=1;
 });
 const project=initial.projects[0];project.projectId=p.projectId;project.archive.projectId=p.projectId;for(const story of project.archive.occurrences){story.projectId=p.projectId;story.rootPath=p.snapshot.rootPath;story.rootIdentity=p.snapshot.rootIdentity;story.initiativePath=p.snapshot.rootPath+'/_bmad-output/alpha'}for(const turn of project.archive.turns){turn.context.projectId=p.projectId;turn.story=project.archive.occurrences[0]}for(const observation of project.observations)observation.context.projectId=p.projectId;assert.ok(isUsMetricsState(initial));
 const bmadProject={projectId:p.projectId,status:'ready',freshness:'current',monitoring:'watching',storage:'stored',error:null,observation:p.captured.observation,selection:{schemaVersion:1,projectId:p.projectId,rootPath:p.snapshot.rootPath,rootIdentity:p.snapshot.rootIdentity,revision:1,initiativeId:'alpha'}};assert.ok(isBmadContextState({contractVersion:1,sequence:1,projects:[bmadProject]}));await page.evaluate(({initial,bmadProject})=>{window.metricsUIFixture.set(initial);window.bmadContextUIFixture.set({contractVersion:1,sequence:1,projects:[bmadProject]})},{initial,bmadProject});
 await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click();await page.locator('#catalog-launch-heading').waitFor();const choice=page.locator('[data-metric-choice="catalog"]');await choice.locator(':scope > summary').click();
 await page.evaluate(async()=>{const state=await window.madnessBmadContext.read();state.projects[0].selection.initiativeId='beta';window.bmadContextUIFixture.set(state)});await choice.getByText('Contexte ou autorité de source non courants — attribution facultative indisponible.',{exact:false}).first().waitFor();assert.equal(await choice.locator('input[value="us-metrics"]').isDisabled(),true);assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.choices()),[]);
 await page.evaluate(bmadProject=>window.bmadContextUIFixture.set({contractVersion:1,sequence:1,projects:[bmadProject]}),bmadProject);await page.waitForFunction(()=>document.querySelector('[data-metric-choice="catalog"] input[value="us-metrics"]')?.disabled===false);await choice.locator('input[value="us-metrics"]').check();await page.getByRole('button',{name:'Lancer une nouvelle conversation',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);const {calls,choices}=await page.evaluate(()=>({calls:window.metricsUIFixture.calls(),choices:window.metricsUIFixture.choices()}));assert.equal(calls[0].type,'launch-catalog');assert.equal(calls[0].preparationId,p.id);assert.equal(calls[0].requestId,p.id);assert.equal(choices[0].requestId,p.id);assert.deepEqual(choices[0].operation,{type:'launch-catalog',preparationId:p.id});
 await page.evaluate(()=>window.catalogLaunchUIFixture.finish(null,'failed'));await page.getByText('Historique exact avant préparation',{exact:true}).waitFor();assert.equal(await page.locator('#conversation-heading code').textContent(),'catalog-old');await page.evaluate(()=>window.catalogLaunchUIFixture.finish());await page.waitForFunction(()=>document.querySelector('#conversation-heading code')?.textContent==='catalog-new');assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre intact 🧭');
})

async function correctionContexts(){const f=await metricsFixture(),beta=structuredClone(f.story);beta.id='us-beta';beta.initiativeId='beta';beta.initiativePath='C:/project/_bmad-output/beta';beta.title='Story beta consultée';f.project.archive.occurrences.push(beta);f.project.candidates.push({initiativeId:'beta',container:beta.container,ticketId:beta.ticketId,title:beta.title,storyRef:beta.id,reason:'qualified'});f.project.stories.push({storyRef:beta.id,summary:{identified:0,known:0,unknown:0,knownMs:null,coverage:'none',overlap:'none',nativeDuration:'unavailable',usage:'unavailable',cost:'unavailable'}});assert.ok(isUsMetricsState(f.state));await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);await page.evaluate(async()=>{const state=await window.madnessBmadContext.read();state.projects[0].selection.initiativeId='beta';window.bmadContextUIFixture.set(state)});return f}
test('UI13 correction Q1 send requires current selected source and matching captured context',async()=>{
 const f=await correctionContexts();await page.getByRole('tab',{name:'Conversation',exact:true}).click();const choice=page.locator('[data-metric-choice="send"]');await choice.locator(':scope > summary').click();assert.equal(await choice.locator('input[value="us-metrics"]').isDisabled(),true);assert.equal(await choice.locator('input[value="us-beta"]').isDisabled(),true);await choice.getByText('Contexte ou autorité de source non courants — attribution facultative indisponible.',{exact:false}).first().waitFor();await choice.getByText('Cette US ne correspond pas au contexte capturé de cette opération.',{exact:false}).first().waitFor();await page.locator('#draft').fill('Réponse volontaire sans attribution');await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();await page.waitForFunction(()=>window.connectionUIFixture.sent().length===1);assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.choices()),[]);
 await page.evaluate(async()=>{const state=await window.madnessBmadContext.read();state.projects[0].selection={...state.projects[0].selection,initiativeId:'alpha',revision:2};state.projects[0].observation.revision='f'.repeat(64);window.bmadContextUIFixture.set(state);window.connectionUIFixture.setDialogue({status:'ready'})});await choice.locator(':scope > summary').waitFor();await choice.evaluate(e=>{if(!e.open)e.querySelector(':scope > summary').click()});await choice.getByText('Contexte ou autorité de source non courants — attribution facultative indisponible.',{exact:false}).first().waitFor();assert.equal(await choice.locator('input[value="us-metrics"]').isDisabled(),true);
 await page.evaluate(async()=>{const state=await window.madnessBmadContext.read();state.projects[0].observation.revision='a'.repeat(64);window.bmadContextUIFixture.set(state)});await page.waitForFunction(()=>document.querySelector('[data-metric-choice="send"] input[value="us-metrics"]')?.disabled===false);await choice.locator('input[value="us-metrics"]').check();await page.locator('#draft').fill('Réponse alpha après sélection et preuve concordantes');await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);assert.equal((await page.evaluate(()=>window.metricsUIFixture.choices()[0])).storyRef,f.story.id);
})
test('UI13 correction Q1 Mary requires both active and current selected source authority',async()=>{
 const f=await correctionContexts();await page.evaluate(context=>window.connectionUIFixture.setDialogue({status:'stopped',context:{...context,conversationId:null}}),f.context);const choice=page.locator('[data-metric-choice="launch"]');await choice.locator(':scope > summary').click();assert.equal(await choice.locator('input[value="us-metrics"]').isDisabled(),true);assert.equal(await choice.locator('input[value="us-beta"]').isDisabled(),true);await choice.getByText('Contexte ou autorité de source non courants — attribution facultative indisponible.',{exact:false}).first().waitFor();await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#tab-conversation')?.getAttribute('aria-selected')==='true');assert.deepEqual(await page.evaluate(()=>window.metricsUIFixture.choices()),[]);
 await page.evaluate(async context=>{const state=await window.madnessBmadContext.read();state.projects[0].selection={...state.projects[0].selection,initiativeId:'alpha',revision:2};window.bmadContextUIFixture.set(state);window.connectionUIFixture.setDialogue({status:'stopped',context:{...context,conversationId:null}})},f.context);await page.getByRole('tab',{name:'Parcours',exact:true}).click();await choice.locator(':scope > summary').click();await page.waitForFunction(()=>document.querySelector('[data-metric-choice="launch"] input[value="us-metrics"]')?.disabled===false);await choice.locator('input[value="us-metrics"]').check();await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);assert.equal((await page.evaluate(()=>window.metricsUIFixture.choices()[0])).storyRef,f.story.id);
 await page.evaluate(async()=>{const state=await window.madnessBmadContext.read();state.projects[0].observation.activeStatus='unknown';state.projects[0].observation.activeInitiative=null;window.bmadContextUIFixture.set(state)});await choice.getByText('Contexte natif non connu pour cette opération — attribution facultative indisponible.',{exact:false}).first().waitFor();assert.equal(await choice.locator('input[value="us-metrics"]').isDisabled(),true);
})
test('UI13 correction Q2 adjustment freezes durable A during choice and preserves it on refusal',async()=>{
 const f=await metricsFixture(),approval={schemaVersion:1,id:'metric-locked',context:f.context,requestId:'approval-request',turnId:'approval-turn',identity:{kind:'unknown'},mode:'file-approval',files:[{path:'C:/project/proposal.md',kind:'add',diff:'Proposition synthétique',beforeSha256:null,afterSha256:'a'.repeat(64)}],reason:null,adjustment:'Durable A',adjustmentStatus:'draft',status:'decided',decision:'decline',transmission:'sent',effect:'declined',result:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'};await page.evaluate(approval=>window.connectionUIFixture.setDialogue({approvals:[approval]}),approval);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('.request-history > summary').click();const panel=page.locator('[data-approval-id="metric-locked"]'),input=panel.locator('textarea'),choice=panel.locator('[data-metric-choice="adjust-metric-locked"]');await choice.locator(':scope > summary').click();await choice.locator('input[value="us-metrics"]').check();await page.evaluate(()=>window.metricsUIFixture.defer());await panel.getByRole('button',{name:'Envoyer cet ajustement à Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.choices().length===1);assert.equal(await input.getAttribute('readonly')!==null,true);await input.focus();await page.keyboard.type('B');assert.equal(await input.inputValue(),'Durable A');await page.evaluate(()=>window.metricsUIFixture.finish());await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1);const call=await page.evaluate(()=>window.metricsUIFixture.calls()[0]);assert.equal(call.capturedAdjustment,'Durable A');assert.equal((await page.evaluate(()=>window.metricsUIFixture.choices()[0])).text,'Durable A');
 await page.waitForFunction(()=>document.querySelector('[data-metric-choice="adjust-metric-locked"] input[value=""]')?.checked===true&&!document.querySelector('#metric-locked-adjustment')?.readOnly);await choice.locator('input[value="us-metrics"]').check();await page.evaluate(()=>{window.metricsUIFixture.defer();window.metricsUIFixture.refuse(true)});await panel.getByRole('button',{name:'Envoyer cet ajustement à Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.choices().length===2);await page.evaluate(()=>window.metricsUIFixture.finish());await choice.getByText('Choix refusé — la rédaction reste disponible. Choisissez de nouveau ou continuez sans attribution.',{exact:true}).waitFor();assert.equal(await input.inputValue(),'Durable A');assert.equal(await input.getAttribute('readonly'),null);assert.equal((await page.evaluate(()=>window.metricsUIFixture.calls())).length,1);
})
test('UI13 correction V1 F1 historical capture keeps old bytes and summary precedes collapsed provenance',async()=>{
 const f=await metricsFixture();f.project.observations[0].members={schemaVersion:1,recordIds:['record-exact']};f.project.archive.turns[0].story=structuredClone(f.story);f.story.active=false;f.story.title='Titre courant autre';f.story.sources[0].path='C:/project/current-only.toml';await page.evaluate(value=>window.metricsUIFixture.set(value),f.state);const registry=page.locator('.metric-registry');await registry.locator(':scope > summary').click();await registry.getByRole('combobox').selectOption(f.story.id);const reading=registry.locator('.metric-reading');assert.equal(await reading.locator('.metric-provenance').evaluate(e=>e.open),false);assert.equal(await reading.locator('.metric-summary').evaluate(e=>e.compareDocumentPosition(e.parentElement.querySelector('.metric-provenance'))&Node.DOCUMENT_POSITION_FOLLOWING),4);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('.overview-details > summary').click();await page.locator('.turn-recap > summary').first().click();const observation=page.locator('.work-overview .metric-observation').first();await observation.locator(':scope > summary').click();await observation.getByText('Source courante non qualifiée — reçu historique conservé',{exact:true}).waitFor();await observation.locator('details > summary').first().click();const text=await observation.innerText();assert.ok(text.includes('Durée synthétique'));assert.ok(text.includes('C:/project/_bmad-output/alpha/tickets/tickets.toml'));assert.equal(text.includes('C:/project/current-only.toml'),false);
})


test('langue : cadre anglais réactif et retour français sans effet natif', async () => {
 await launch()
 await settingsLanguage();await page.getByRole('button',{name:'Switch interface to English',exact:true}).click({timeout:10000})
 await page.getByRole('heading',{name:'Your projects, in one place',exact:true}).waitFor()
 assert.equal(await page.locator('html').getAttribute('lang'),'en')
 assert.deepEqual(await page.evaluate(()=>({sent:window.connectionUIFixture.sent(),help:window.connectionUIFixture.helpCalls(),support:window.connectionUIFixture.supportCalls()})),{sent:[],help:[],support:[]})
 await page.getByRole('button',{name:'Passer l’interface en français',exact:true}).click()
 await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).waitFor()
})


async function languageUI(value){
 const modal=page.locator('dialog:modal').last(),isModal=await modal.count()>0,control=isModal?modal.locator('.language-toggle'):await settingsLanguage()
 if(await page.locator('html').getAttribute('lang')!==value)await control.click()
 if(!isModal)await closeSettings()
 await page.waitForFunction(value=>document.documentElement.lang===value,value)
 assert.equal(await page.locator('html').getAttribute('lang'),value)
}
test('langue : question native, saisies Unicode, selection et anciens etats restent exacts',async()=>{
 const {question}=await workspaceRequestFixture();const textarea=page.locator('[data-question-id="q-priority"] textarea'),raw=question.fields[0].prompt
 await textarea.fill('Réponse δ 日本語 🧭');await textarea.evaluate(e=>{e.focus();e.setSelectionRange(3,9)});const handle=await textarea.elementHandle()
 const before=await page.evaluate(()=>({answers:window.connectionUIFixture.questionAnswers(),saves:window.connectionUIFixture.questionSaves(),sent:window.connectionUIFixture.sent()}))
 await languageUI('en');await page.getByRole('button',{name:'Send response',exact:true}).waitFor()
 assert.equal(await page.locator('[data-question-id="q-priority"]').getByText(raw,{exact:true}).count(),1);assert.equal(await textarea.inputValue(),'Réponse δ 日本語 🧭')
 assert.deepEqual(await handle.evaluate(e=>({same:e===document.querySelector('[data-question-id="q-priority"] textarea'),focused:e===document.activeElement,start:e.selectionStart,end:e.selectionEnd})),{same:true,focused:false,start:3,end:9})
 assert.deepEqual(await page.evaluate(()=>({answers:window.connectionUIFixture.questionAnswers(),saves:window.connectionUIFixture.questionSaves(),sent:window.connectionUIFixture.sent()})),before)
 await page.getByRole('button',{name:'Send response',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[{questionId:'q-priority',values:{answer:'Réponse δ 日本語 🧭'}}])
 await languageUI('fr');await handle.dispose()
})
test('langue : decisions anglaises gardent accept et decline et le patch brut',async()=>{
 const {context,approval}=await workspaceRequestFixture();await page.evaluate(({context,approval})=>window.connectionUIFixture.setDialogue({context,status:'waiting-approval',questions:[],approvals:[approval]}),{context,approval})
 await languageUI('en');const panel=page.locator('[data-approval-id="a-priority"]');assert.equal(await panel.locator('pre').first().textContent(),approval.files[0].diff)
 await panel.getByRole('button',{name:'Reject entire patch',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.approvalDecisions()),[{approvalId:approval.id,decision:'decline'}])
 await page.evaluate(approval=>window.connectionUIFixture.setDialogue({status:'waiting-approval',approvals:[{...approval,id:'a-second'}]}),approval)
 await page.locator('[data-approval-id="a-second"]').getByRole('button',{name:'Allow entire patch once',exact:true}).click()
 assert.deepEqual((await page.evaluate(()=>window.connectionUIFixture.approvalDecisions())).at(-1),{approvalId:'a-second',decision:'accept'})
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('langue : choix US et choose differe gardent scope preuve requete et texte',async()=>{
 await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Texte exact δ 🧭')
 await page.locator('[data-metric-choice="send"] summary').click();await page.locator('[data-metric-choice="send"] input[value="us-metrics"]').check();await languageUI('en')
 assert.equal(await page.locator('[data-metric-choice="send"] input[value="us-metrics"]').isChecked(),true)
 await page.evaluate(()=>window.metricsUIFixture.defer());await page.getByRole('button',{name:'Send to Mary',exact:true}).click();await page.waitForFunction(()=>window.metricsUIFixture.choices().length===1)
 const choice=await page.evaluate(()=>window.metricsUIFixture.choices()[0]);await languageUI('fr');assert.equal(await page.locator('#draft').inputValue(),'Texte exact δ 🧭');await page.evaluate(()=>window.metricsUIFixture.finish());await page.waitForFunction(()=>window.metricsUIFixture.calls().length===1)
 const calls=await page.evaluate(()=>window.metricsUIFixture.calls());assert.equal(calls.length,1);assert.equal(calls[0].requestId,choice.requestId);assert.equal(calls[0].choiceRef,'choice-ui');assert.equal(calls[0].text,choice.text);assert.deepEqual(choice.operation,{type:'send'})
})
test('langue : refus US deja affiche se represente sans nouvelle commande',async()=>{
 await metricsFixture();await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').fill('Toujours exact')
 await page.locator('[data-metric-choice="send"] summary').click();await page.locator('[data-metric-choice="send"] input[value="us-metrics"]').check();await page.evaluate(()=>window.metricsUIFixture.refuse(true));await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click();await page.locator('.metric-choice-error').waitFor()
 const before=await page.evaluate(()=>({choices:window.metricsUIFixture.choices(),calls:window.metricsUIFixture.calls()}));await languageUI('en')
 await page.getByText('Choice refused — your draft is kept. Choose again or continue unassigned.',{exact:true}).waitFor();assert.equal(await page.locator('#draft').inputValue(),'Toujours exact');assert.deepEqual(await page.evaluate(()=>({choices:window.metricsUIFixture.choices(),calls:window.metricsUIFixture.calls()})),before)
})
test('langue : apercu source et recherche catalogue restent montes sans nouvelle lecture',async()=>{
 await filesUIFixture();await page.getByLabel('Rechercher une possibilité').fill('alpha');const panel=await openFilesUI();await panel.locator('pre').waitFor();const raw=await panel.locator('pre').textContent(),before=await page.evaluate(()=>window.projectFilesUIFixture.calls()),handle=await panel.elementHandle()
 await languageUI('en');assert.equal(await panel.locator('h2').textContent(),'File panel');assert.equal(await panel.locator('pre').textContent(),raw);assert.equal(await handle.evaluate(e=>e===document.querySelector('.file-preview')),true);assert.deepEqual(await page.evaluate(()=>window.projectFilesUIFixture.calls()),before)
 await panel.getByRole('button',{name:'Close file panel',exact:true}).click();assert.equal(await page.getByLabel('Search possibilities').inputValue(),'alpha');await handle.dispose()
})
test('langue : preference refusee et reponses tardives ne remplacent pas le dernier choix',async()=>{
 const lang=value=>page.waitForFunction(value=>document.documentElement.lang===value,value)
 await launch();await page.evaluate(()=>window.languageUIFixture.fail('save'));const control=await settingsLanguage(),panel=page.locator('#codex-connection-panel');await control.click();await lang('en');await panel.getByText('Language kept for this session — save failed. Existing file preserved.',{exact:true}).waitFor();await page.getByRole('heading',{name:'Your projects, in one place',exact:true}).waitFor()
 await page.evaluate(()=>{window.languageUIFixture.fail(null);window.languageUIFixture.defer()});await control.click();await lang('fr');await control.click();await lang('en');await page.evaluate(()=>window.languageUIFixture.finish(0));await page.waitForFunction(()=>window.languageUIFixture.settled()===2);assert.equal(await page.locator('html').getAttribute('lang'),'en');await page.evaluate(()=>window.languageUIFixture.finish(1));await page.waitForFunction(()=>document.querySelector('#codex-connection-panel .language-toggle')?.getAttribute('aria-busy')==='false');assert.equal(await page.locator('html').getAttribute('lang'),'en')
})


test('langue : fiche acteur reouverte conserve source message portrait en traduisant le role local',async()=>{
 const f=await atelierFixture(1440);await portraitButton('Mary').click();const panel=page.locator('.agent-info-panel'),handle=await panel.elementHandle(),image=await panel.locator('img').getAttribute('src'),raw=await panel.locator('code').allTextContents();await handle.dispose()
 await languageUI('en');await page.locator('.agent-portrait-trigger[aria-label*="Mary"]').first().click();await panel.getByText('Analyst',{exact:true}).waitFor();assert.equal(await panel.locator('img').getAttribute('src'),image);assert.deepEqual(await panel.locator('code').allTextContents(),raw);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})


test('langue : activeStatus absent du contexte courant reste un contexte natif nul dans les deux langues',async()=>{
 await metricsFixture();const current=await page.evaluate(async()=>{const s=await window.madnessBmadContext.read();s.projects[0].observation.activeStatus='absent';s.projects[0].observation.activeInitiative=null;window.bmadContextUIFixture.set(s);window.connectionUIFixture.setDialogue({status:'stopped',context:{projectId:'p-context',initiativeId:null,conversationId:null,providerId:'codex',connectionId:'account-1'}});return s});assert.ok(isBmadContextState(current))
 const choice=page.locator('[data-metric-choice="launch"]');await choice.locator(':scope > summary').click()
 for(const value of ['fr','en']){await languageUI(value);assert.equal(await choice.locator('input[value="us-metrics"]').isDisabled(),true);assert.ok((await choice.innerText()).includes(value==='fr'?'Cette US ne correspond pas au contexte capturé de cette opération.':'This story does not match the captured context of this operation.'));assert.deepEqual(await page.evaluate(async()=>{const s=await window.madnessBmadContext.read();return {status:s.projects[0].observation.activeStatus,active:s.projects[0].observation.activeInitiative}}),{status:'absent',active:null})}
 assert.deepEqual(await page.evaluate(()=>({choose:window.metricsUIFixture.choices(),calls:window.metricsUIFixture.calls(),sent:window.connectionUIFixture.sent()})),{choose:[],calls:[],sent:[]})
})


test('langue : nouvelle observation de bibliotheque reste une copie locale bilingue',async()=>{
 const f=await resumeFixture();await f.set();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1440,920));await page.getByRole('button',{name:'Accueil',exact:true}).click();const card=page.locator('.library-project').first(),next=structuredClone(f.snapshot);next.revision='f'.repeat(64);await f.set(next);await card.locator('.library-new-observation').getByText(next.revision,{exact:true}).waitFor()
 for(const value of ['fr','en']){await languageUI(value);const text=await card.locator('.library-summary > p.small').first().textContent();assert.ok(text.startsWith(value==='fr'?'Observation précédente — nouvelle observation disponible.':'Previous observation — new observation available.'),text);assert.ok(!text.includes('non traduit')&&!text.includes('Untranslated'));assert.ok((await card.locator('.library-displayed-observation').textContent()).includes(f.snapshot.revision))}
 assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[])
})


async function modalLanguage(control, value, keyboard=false){
 assert.equal(await control.count(),1,'The active modal must expose the existing language command')
 if(keyboard){for(let n=0;n<40&&!await control.evaluate(e=>e===document.activeElement);n++)await page.keyboard.press('Tab');assert.equal(await control.evaluate(e=>e===document.activeElement),true,'Tab reaches the modal language command');await page.keyboard.press('Enter')}else await control.click()
 await page.waitForFunction(value=>document.documentElement.lang===value,value)
 assert.equal(await control.evaluate(e=>e.closest('dialog').matches(':modal')),true)
}
test('Q1 langue : vrais clics et clavier dans apercus et fiches acteur gardent consultation et selection',async()=>{
 for(const [width,expanded] of [[720,false],[1440,true]]){
  await filesUIFixture();await setWorkspaceViewport(app,page,{width,height:820});const panel=await openFilesUI();await panel.locator('pre').waitFor();if(expanded)await panel.getByRole('button',{name:'Agrandir',exact:true}).click();assert.equal(await panel.evaluate(e=>e.matches(':modal')),true)
  const handle=await panel.elementHandle(),raw=await panel.locator('pre').textContent(),before=await page.evaluate(()=>window.projectFilesUIFixture.calls());await panel.locator('pre').evaluate(e=>{const range=document.createRange();range.setStart(e.firstChild,2);range.setEnd(e.firstChild,17);const selection=getSelection();selection.removeAllRanges();selection.addRange(range)});const selected=await page.evaluate(()=>getSelection().toString())
  await modalLanguage(panel.locator('.language-toggle'),'en');assert.equal(await panel.locator('pre').textContent(),raw);assert.equal(await page.evaluate(()=>getSelection().toString()),selected);assert.equal(await handle.evaluate(e=>e===document.querySelector('.file-preview')),true);assert.equal(await panel.evaluate(e=>e.classList.contains('is-expanded')),expanded)
  await modalLanguage(panel.locator('.language-toggle'),'fr',true);assert.equal(await panel.locator('pre').textContent(),raw);assert.deepEqual(await page.evaluate(()=>window.projectFilesUIFixture.calls()),before);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.equal(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await handle.dispose()
 }
 for(const width of [720,1440]){
  await atelierFixture(width);await portraitButton('Mary').click();const panel=page.locator('.agent-info-panel'),handle=await panel.elementHandle(),raw=await panel.locator('code').allTextContents(),image=await panel.locator('img').getAttribute('src');if(width===1440){await setWorkspaceViewport(app,page,{width:1100,height:820});await page.waitForFunction(()=>document.querySelector('.agent-info-panel')?.matches(':modal'))}
  await modalLanguage(panel.locator('.language-toggle'),'en');await panel.getByText('Analyst',{exact:true}).waitFor();await modalLanguage(panel.locator('.language-toggle'),'fr',true);assert.deepEqual(await panel.locator('code').allTextContents(),raw);assert.equal(await panel.locator('img').getAttribute('src'),image);assert.equal(await handle.evaluate(e=>e===document.querySelector('.agent-info-panel')),true);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[]);assert.equal(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await handle.dispose()
 }
})
test('Q1 langue : commande accessible dans les autres modales sans choisir lancer ou acquitter',async()=>{
 await initiativeFixture();await page.locator('.initiative-trigger').click();let panel=page.locator('.initiative-dialog');const codes=await panel.locator('code').allTextContents();await modalLanguage(panel.locator('.language-toggle'),'en');await modalLanguage(panel.locator('.language-toggle'),'fr',true);assert.deepEqual(await panel.locator('code').allTextContents(),codes);assert.deepEqual(await page.evaluate(()=>window.bmadContextUIFixture.choices()),[]);await panel.press('Escape')
 await catalogUIFixture();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click();await page.getByLabel('Rechercher une possibilité').fill('Mary');await page.getByRole('button',{name:'Fiche compétence alpha',exact:true}).click();panel=page.locator('.catalog-dialog');const text=await panel.locator('.catalog-field').allTextContents();await modalLanguage(panel.locator('.language-toggle'),'en');assert.ok((await panel.innerText()).includes('Mary explores documented intentions'));await modalLanguage(panel.locator('.language-toggle'),'fr',true);assert.deepEqual(await panel.locator('.catalog-field').allTextContents(),text);await panel.press('Escape');assert.equal(await page.getByLabel('Rechercher une possibilité').inputValue(),'Mary');assert.deepEqual(await page.evaluate(()=>window.bmadCatalogUIFixture.calls()),[])
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:true});panel=page.locator('.plan-confirmation');await panel.waitFor({state:'visible'});await modalLanguage(panel.locator('.language-toggle'),'en');await modalLanguage(panel.locator('.language-toggle'),'fr',true);assert.equal((await page.evaluate(()=>window.madnessConnection.read())).state.needsPlanAcknowledgement,true);await panel.press('Escape')
 await setWorkspaceViewport(app,page,{width:720,height:820});await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click();panel=page.locator('.navigation-drawer');await modalLanguage(panel.locator('.language-toggle'),'en');await modalLanguage(panel.locator('.language-toggle'),'fr',true);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('Q3 langue : problemes structures et erreur directe de bibliotheque se presentent sans decouper les parametres',async()=>{
 const f=await resumeFixture();f.snapshot.problems=['Source non chargee: C:/é/δ · param.md: E_IO','E_UNKNOWN C:/é/δ · brut'];await page.evaluate(snapshot=>window.bmadProgressUIFixture.set({contractVersion:1,sequence:20,projects:[{projectId:snapshot.projectId,generation:1,status:'error',freshness:'stale',monitoring:'watching',queued:false,snapshot,errorCode:'READ_FAILED',error:'Sources modifiées pendant la lecture — nouvelle lecture requise.'}]}),f.snapshot);await setWorkspaceViewport(app,page,{width:1440,height:920});await page.getByRole('button',{name:'Accueil',exact:true}).click();const card=page.locator('.library-project').first();await card.getByText('Source non chargée : C:/é/δ · param.md: E_IO',{exact:true}).waitFor();await languageUI('en');await card.getByText('Source not loaded: C:/é/δ · param.md: E_IO',{exact:true}).waitFor();await card.getByText('Untranslated technical detail — E_UNKNOWN C:/é/δ · brut',{exact:true}).waitFor();await card.getByText('Sources changed while reading — read again.',{exact:true}).waitFor();assert.deepEqual(await card.locator('.library-summary > div.small li').allTextContents(),['Source not loaded: C:/é/δ · param.md: E_IO','Untranslated technical detail — E_UNKNOWN C:/é/δ · brut']);assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[])
 const newer=structuredClone(f.snapshot);newer.revision='f'.repeat(64);newer.problems=['Source non chargee: C:/nouveau · δ.md: E_NEW'];await f.set(newer);await card.getByText('Source not loaded: C:/nouveau · δ.md: E_NEW',{exact:true}).waitFor();assert.ok((await card.locator('.library-displayed-observation').textContent()).includes(f.snapshot.revision));assert.equal(await card.locator('.library-summary > div.small li').count(),1);assert.deepEqual(await page.evaluate(()=>window.bmadProgressUIFixture.calls()),[])
})


test('Q4 langue : aide singulier pluriel et octets localises gardent corps et nombres sources',async()=>{
 const {context}=await atelierFixture();const bundle={schemaVersion:1,id:'bundle-q4',projectId:context.projectId,rootPath:'C:/atelier',observedAt:new Date().toISOString(),revision:'a'.repeat(64),diagnostic:'partial',nativeReady:false,problems:['Source non chargee: C:/é.md'],documents:[{id:'doc-help',source:'C:/atelier/help.md',snapshot:'help.md',sha256:'b'.repeat(64),bytes:1,text:'Corps exact δ',module:'bmm',skills:[]}],references:[],sources:[],activeInitiative:null,selectedInitiative:null,outputPath:null,inventories:[],knowledgeRaw:'{}',configRaw:'{}',skillPath:'C:/atelier/bmad/SKILL.md'};const help={contractVersion:1,sequence:1,status:'ready',freshness:'current',monitoring:'watching',projectId:context.projectId,bundle,records:[],error:null};assert.ok(isHelpState(help));await page.evaluate(help=>window.connectionUIFixture.setHelp(help),help);await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('button',{name:'Voir les aides',exact:true}).click();await languageUI('en');const panel=page.locator('.help-panel').first();assert.ok((await panel.locator('.help-summary').innerText()).includes('1 document · Modules : bmm · 1 issue reported.'));await panel.getByText('View help and provenance',{exact:true}).click();await panel.locator('.help-source summary').click();await panel.getByText('SHA-256',{exact:false}).filter({hasText:'1 byte actually read'}).waitFor();assert.equal(await panel.locator('.help-source pre').textContent(),'Corps exact δ');assert.ok((await panel.locator('.help-bundle').innerText()).includes('1 document loaded ; 1 issue reported.'))
 help.bundle.documents[0].bytes=1234;help.bundle.documents.push({...help.bundle.documents[0],id:'doc-help-2'});help.bundle.problems.push('Source non chargee: C:/δ.md');await page.evaluate(help=>window.connectionUIFixture.setHelp(help),help);await panel.getByText('SHA-256',{exact:false}).filter({hasText:'1,234 bytes actually read'}).first().waitFor();assert.ok((await panel.locator('.help-summary').innerText()).includes('2 documents · Modules : bmm · 2 issues reported.'));await languageUI('fr');assert.ok((await panel.locator('.help-summary').innerText()).includes('2 documents · Modules : bmm · 2 problèmes signalés.'));assert.ok((await panel.locator('.help-bundle').innerText()).includes('1 234 octets réellement lus'));assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.helpCalls()),[]);assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})


test('Q4-r1 langue : observations Forge un octet et1234 octets et comptes gardent les sources exactes',async()=>{
 const {context}=await workspaceRequestFixture(),workflow={schemaVersion:1,conversationId:context.conversationId,context,invocation:'$bmad-forge-idea',capturedAt:'2026-11-05T08:00:00Z',rootPath:'C:/priority',outputBase:'C:/priority/_bmad-output/initiative-test',contextDigest:'b'.repeat(64),fingerprint:'a'.repeat(64),skillPath:'C:/priority/.agents/skills/bmad-forge-idea/SKILL.md',workspace:'C:/priority/_bmad-output/initiative-test/forge-exact',outcome:'CLARIFIED',observations:[1,1234].map((bytes,n)=>({id:'observed-'+n,turnId:'turn-exact',operation:'write',phase:'observed',at:'2026-11-05T08:00:00Z',path:'C:/priority/_bmad-output/initiative-test/forge-exact/δ-'+n+'.md',sha256:'c'.repeat(64),bytes}))};assert.ok(isWorkflowRecord(workflow))
 await page.evaluate(async({context,workflow})=>{const s=(await window.madness.readState()).value.state;window.connectionUIFixture.setSnapshot({conversations:[...s.conversations,{id:'previous-exact',context:{...context,conversationId:'previous-exact'},lastKnownActivity:'idle',messages:[{id:'previous-message',role:'assistant',text:'Contenu historique exact δ'}]}]});window.connectionUIFixture.setDialogue({workflows:[workflow],activities:['Invocation copiée.','Chemin copié.']})},{context,workflow});const panel=page.locator('.workflow-observations');await panel.locator(':scope > details > summary').click();const handle=await panel.elementHandle(),source=await page.evaluate(async()=>(await window.madnessDialogue.read()).workflows)
 for(const language of ['fr','en']){await languageUI(language);const rows=await panel.locator('ol li').allTextContents();assert.ok(rows[0].endsWith(language==='fr'?' · 1 octet':' · 1 byte'),rows[0]);assert.ok(rows[1].endsWith(language==='fr'?' · 1 234 octets':' · 1,234 bytes'),rows[1]);for(let n=0;n<2;n++){assert.ok(rows[n].includes(workflow.observations[n].path));assert.ok(rows[n].includes(workflow.observations[n].sha256))}assert.match(await panel.locator(':scope > details > summary').textContent(),/\(2\)$/);assert.match(await page.locator('.request-history > summary').textContent(),/\(2\)$/);assert.match(await page.locator('.previous-conversations > summary').textContent(),/\(1\)$/);assert.match(await page.locator('.dialogue-activity > summary').textContent(),/\(2\)$/);assert.equal(await handle.evaluate(e=>e===document.querySelector('.workflow-observations')),true);assert.deepEqual(await page.evaluate(async()=>(await window.madnessDialogue.read()).workflows),source)}
 assert.deepEqual(await page.evaluate(()=>({sent:window.connectionUIFixture.sent(),copy:window.connectionUIFixture.copies(),answers:window.connectionUIFixture.questionAnswers(),approvals:window.connectionUIFixture.approvalDecisions()})),{sent:[],copy:[],answers:[],approvals:[]});await handle.dispose()
})
test('Q4-r1 langue : source metrique un octet garde lignes identites et autorite dans les deux langues',async()=>{
 const f=await metricsFixture();f.story.sources[0].bytes=1;assert.ok(isUsMetricsState(f.state));await page.evaluate(state=>window.metricsUIFixture.set(state),f.state);const registry=page.locator('.metric-registry');await registry.locator(':scope > summary').click();await registry.getByRole('combobox').selectOption(f.story.id);const panel=registry.locator('.metric-reading'),facts=panel.locator('.metric-provenance');await facts.locator(':scope > summary').click();const source=await page.evaluate(()=>window.madnessUsMetrics.read('p-context')),handle=await facts.elementHandle()
 for(const language of ['fr','en']){await languageUI(language);const text=await facts.locator('p.small').last().textContent();assert.ok(text.includes(language==='fr'?' · 1 octet · ':' · 1 byte · '),text);assert.ok(text.includes('1/2'));assert.ok(text.includes(f.story.sources[0].path));assert.ok(text.includes(f.story.sources[0].sha256));assert.ok(text.includes(f.story.sources[0].identity));assert.equal(await handle.evaluate(e=>e===document.querySelector('.metric-provenance')),true);assert.deepEqual(await page.evaluate(()=>window.madnessUsMetrics.read('p-context')),source)}
 assert.deepEqual(await page.evaluate(()=>({choices:window.metricsUIFixture.choices(),calls:window.metricsUIFixture.calls(),sent:window.connectionUIFixture.sent()})),{choices:[],calls:[],sent:[]});await handle.dispose()
})
