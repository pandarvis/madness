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
import { isHelpState } from '../src/contracts/bmad-help.ts'
import { isDialogueMessage } from '../src/contracts/dialogue.ts'
import { setWorkspaceViewport } from '../scripts/qualification/workspace-design.mjs'
const require = createRequire(import.meta.url)
const repository = fileURLToPath(new URL('../', import.meta.url))
let root, app, page, bundle
before(async () => {
  // Seulement le renderer source : aucun build Main/paquet, réseau ou fournisseur.
  const result = await build({ root: repository, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'atelier-fixture-local-assets', enforce: 'pre', load: id => id.endsWith('-bust.png?url') ? 'export default '+JSON.stringify(pathToFileURL(id.split('?')[0]).href) : undefined }, react(), { name: 'connection-ui-fixture', resolveId: (id) => id === 'connection-ui-fixture' || id.replaceAll('\\', '/').endsWith('/connection-ui-fixture') ? '\0connection-ui-fixture' : undefined, load: (id) => id === '\0connection-ui-fixture' ? `import {createElement} from 'react'; import {createRoot} from 'react-dom/client'; import {App} from ${JSON.stringify(join(repository, 'src/renderer/src/App.tsx').replaceAll('\\', '/'))}; createRoot(document.getElementById('root')).render(createElement(App));` : undefined }], build: { write: false, minify: false, lib: { entry: 'connection-ui-fixture', formats: ['iife'], name: 'ConnectionUIFixture' } } })
  bundle = (Array.isArray(result) ? result[0] : result).output.find((output) => output.type === 'chunk').code
  root = await realpath(await mkdtemp(join(tmpdir(), 'madness-ui-review-')))
  await writeFile(join(root, 'main.cjs'), `const {app,BrowserWindow,session}=require('electron'); app.setPath('userData',${JSON.stringify(join(root, 'profile'))}); app.whenReady().then(()=>{session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true})); const w=new BrowserWindow({show:false,width:600,height:800,webPreferences:{preload:${JSON.stringify(join(root, 'preload.cjs'))},contextIsolation:true,sandbox:true,nodeIntegration:false}});w.loadFile(${JSON.stringify(join(root, 'index.html'))});});`)
  await writeFile(join(root, 'index.html'), '<!doctype html><html lang="fr"><meta charset="utf-8"><div id="root"></div></html>')
  await writeFile(join(root, 'preload.cjs'), `const {contextBridge}=require('electron');
    let appearanceFailure=false;contextBridge.exposeInMainWorld('madnessAppearance',{initial:{theme:'dark',warning:null},setTheme:async(theme)=>{if(appearanceFailure==='bridge')throw Error('BRIDGE_UNAVAILABLE');return {theme,warning:appearanceFailure?'save-failed':null}}});
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
    contextBridge.exposeInMainWorld('madnessDialogue',{observeStop:async()=>{observeStops++;dialogue={...dialogue,sequence:dialogue.sequence+1,status:'stopped',errorCode:null,recovery:{...dialogue.recovery,stop:'clear'}};notifyDialogue();state={...state,sequence:state.sequence+1,status:state.accountStored?'registered':'disconnected',errorCode:null};listeners.forEach(listener=>listener(state));return dialogue},saveApproval:async(approvalId,adjustment)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,approvals:dialogue.approvals.map(a=>a.id===approvalId?{...a,adjustment,storage:'stored'}:a)};notifyDialogue();return dialogue},decideApproval:async(approvalId,decision)=>{approvalDecisions.push({approvalId,decision});dialogue={...dialogue,sequence:dialogue.sequence+1,approvals:dialogue.approvals.map(a=>a.id===approvalId?{...a,decision,status:'sending',transmission:'pending'}:a)};notifyDialogue();return dialogue},sendAdjustment:async(approvalId)=>{adjustmentSends.push(approvalId);return dialogue},saveQuestion,answerQuestion,qualifyForge,launchForge,copyWorkflow:async(conversationId,target)=>{copies.push({conversationId,target});return dialogue},read:()=>Promise.resolve(dialogue),qualify:async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'qualified',context:{...dialogue.context,projectId}};notifyDialogue();return dialogue},launch:async(projectId,mode='read-only')=>{if(launchFailure){dialogue={...dialogue,sequence:dialogue.sequence+1,status:'error',errorCode:'PROVIDER_FAILED'};notifyDialogue();return dialogue}dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',errorCode:null,mode,invocation:'$bmad-agent-analyst',acknowledged:true,context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-1',providerId:'codex',connectionId:'account-1'},activities:['Tour terminé']};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[...snapshot.conversations.filter(c=>c.id!=='conversation-1'),{id:'conversation-1',context:dialogue.context,lastKnownActivity:'idle',messages:[{id:'hello',role:'assistant',text:'📊 Bonjour, je suis Mary. Voici mon menu.'}]}]};stateListeners.forEach(listener=>listener({}));notifyDialogue();return dialogue},send:async(projectId,conversationId,text)=>{sent.push({projectId,conversationId,text});dialogue={...dialogue,sequence:dialogue.sequence+1,status:'running',acknowledged:true};notifyDialogue();return dialogue},stop:async()=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:unknownOnStop?'unknown':'stopped',errorCode:unknownOnStop?'STOP_UNCONFIRMED':null};notifyDialogue();return dialogue},onChanged:listener=>{dialogueListeners.push(listener);return()=>{}}});
    contextBridge.exposeInMainWorld('madnessConnection',{read:reply,connect:reply,verify:()=>{verifies++;return reply()},cancel:()=>{cancels++;return reply()},disconnect:reply,manageUsage:reply,openPublicKeys:()=>support('openPublicKeys'),copyPublicKeys:()=>support('copyPublicKeys'),acknowledgePlan:()=>{state={...state,sequence:state.sequence+1,status:'error',errorCode:'VAULT_UNREADABLE'};listeners.forEach(listener=>listener(state));return reply()},onChanged:listener=>{listeners.push(listener);return()=>{listeners=listeners.filter(value=>value!==listener)}}});

    let contextState={contractVersion:1,sequence:0,projects:[]},contextListeners=[],contextChoices=[],contextReads=0,contextSaveFailure=false,contextDeferred=false,contextReleases=[];
    const notifyContext=()=>contextListeners.forEach(fn=>fn(contextState));
    contextBridge.exposeInMainWorld('madnessBmadContext',{read:async()=>contextState,onChanged:fn=>{contextListeners.push(fn);return()=>{}},observe:async()=>{contextReads++;return contextState},choose:async(projectId,initiativeId,revision)=>{contextChoices.push({projectId,initiativeId,revision});if(contextDeferred)await new Promise(resolve=>contextReleases.push(resolve));contextState={...contextState,sequence:contextState.sequence+1,projects:contextState.projects.map(p=>p.projectId===projectId?{...p,status:'ready',selection:{schemaVersion:1,projectId,rootPath:p.observation.rootPath,rootIdentity:p.observation.rootIdentity,revision:(p.selection?.revision??0)+1,initiativeId},storage:contextSaveFailure?'failed':'stored',error:contextSaveFailure?'Choix conservé pour cette session — enregistrement échoué.':null}:p)};notifyContext();return contextState},retrySave:async()=>contextState});
    contextBridge.exposeInMainWorld('bmadContextUIFixture',{deferChoices:()=>{contextDeferred=true},finishChoice:()=>contextReleases.shift()?.(),set:value=>{contextState={...value,sequence:contextState.sequence+1};notifyContext()},choices:()=>contextChoices,reads:()=>contextReads,failSave:value=>contextSaveFailure=value,emitOld:value=>contextListeners.forEach(fn=>fn(value))});

    let helpState={contractVersion:1,sequence:0,status:'idle',projectId:null,bundle:null,records:[],error:null},helpListeners=[],helpCalls=[];
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
async function launch(state = {}) {
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
  const css=(await readFile(join(repository, 'src/renderer/src/styles.css'), 'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/help.css'), 'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/atelier-immersion.css'), 'utf8'))+'\n'+(await readFile(join(repository, 'src/renderer/src/atelier-controls.css'), 'utf8'))+'\n'+(await readFile(join(repository,'src/renderer/src/initiatives.css'),'utf8'))
  await page.addStyleTag({ content: css.replaceAll("url('./assets/atelier/", "url('"+pathToFileURL(join(repository,'src/renderer/src/assets/atelier')+'/').href) })
  await page.addScriptTag({ content: bundle })
  await page.getByRole('heading', { name: 'Vos projets, au même endroit', exact: true }).waitFor()
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
  const project={projectId,status:'ready',storage:'stored',error:null,selection:{schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:1,initiativeId:'alpha'},observation:{schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision:'a'.repeat(64),observedAt:new Date().toISOString(),status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:['alpha',name].map(id=>({id:id.length<=80?id:null,name:id,path:'C:/project/_bmad-output/'+id,source:'C:/project/_bmad-output/'+id+'/'+id+'.md',revision:'b'.repeat(64)})),sources:[],problems:[]}}
  const state={contractVersion:1,sequence:1,projects:[project]};window.bmadContextUIFixture.set(state);return state
 },{projectId,name})
 assert.ok(isBmadContextState(fixtureState),'Initiative UI fixture must satisfy the shipped contract')
 return {projectId,name}
}

test('initiatives: diagnostics explicites dans le choix et le contexte même sans problems',async()=>{
 await initiativeFixture()
 for(const theme of ['dark','light']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme)
  for(const [status,label] of [['absent','Installation BMad non repérée'],['legacy-observed','Traces d’une ancienne installation BMad'],['unknown','Profil BMad non identifié'],['incompatible','Lecture du profil BMad refusée'],['partial','Observation BMad partielle'],['candidate-observed','Profil BMad candidat observé']]){
   const state=await page.evaluate(async status=>{const state=await window.madnessBmadContext.read(),p=state.projects[0];p.observation.status=status;p.observation.problems=[];window.bmadContextUIFixture.set(state);return state},status)
   assert.ok(isBmadContextState(state))
   await page.getByRole('button',{name:'Choisir une initiative',exact:true}).click()
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
  const trigger=page.getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
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
 const trigger=page.getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
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
 const trigger=page.getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
 await page.getByRole('dialog',{name:'Choisir une initiative',exact:true}).getByRole('button',{name:/^beta/}).click()
 const question=page.locator('[data-question-id="q-priority"]')
 assert.match(await question.innerText(),/initiative-test/)
 await question.getByRole('button',{name:'Envoyer cette réponse',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.questionAnswers()),[{questionId:'q-priority',values:{answer:'Réponse propre à la demande'}}])
})
test('initiatives: conservation échouée et ancien résultat restent honnêtes',async()=>{
 const {projectId}=await initiativeFixture();await page.evaluate(()=>window.bmadContextUIFixture.failSave(true))
 await page.getByRole('button',{name:'Choisir une initiative',exact:true}).click()
 await page.getByRole('dialog',{name:'Choisir une initiative',exact:true}).getByRole('button',{name:/^beta/}).click()
 await page.getByText('Choix de session — non enregistré',{exact:true}).waitFor()
 await page.evaluate(()=>window.bmadContextUIFixture.emitOld({contractVersion:1,sequence:0,projects:[]}))
 await page.getByRole('button',{name:'Choisir une initiative',exact:true}).click()
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
  await page.getByRole('button',{name:'Choisir une initiative',exact:true}).click()
  const modal=page.getByRole('dialog',{name:'Choisir une initiative',exact:true})
  const layout=await modal.evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth,width:e.getBoundingClientRect().width,viewport:innerWidth}))
  assert.ok(layout.scroll<=layout.client+1,JSON.stringify(layout));assert.ok(layout.width<=layout.viewport,JSON.stringify(layout))
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('button',{name:'Choisir une initiative',exact:true}).evaluate(e=>e===document.activeElement),true)
 }
})


test('initiatives: couleurs locales lisibles et métadonnées alignées dans le thème clair',async()=>{
 await initiativeFixture();await page.evaluate(()=>document.documentElement.dataset.theme='light')
 await page.getByRole('button',{name:'Choisir une initiative',exact:true}).click()
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
 await page.getByRole('button',{name:'Choisir une initiative',exact:true}).click()
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
  const trigger=page.getByRole('button',{name:'Choisir une initiative',exact:true});await trigger.click()
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
 await page.getByRole('button',{name:'Ouvrir un projet',exact:true}).click();assert.equal(await page.evaluate(()=>window.madnessToolbarFixture.directoryChoices()),1)
 await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='light')
 await page.getByRole('button',{name:/^Connexion Codex :/}).click();await page.getByRole('dialog',{name:'Connexion Codex',exact:true}).waitFor()
 assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
})
test('atelier : disposition compacte, buste complet et conteneurs confinés dans les deux thèmes',async t=>{
 await atelierFixture()
 const projectName='Projet personnel de qualification de la refonte avec un nom réellement très long sans abréviation'
 await page.evaluate(projectName=>window.connectionUIFixture.setSnapshot({projects:[{id:'p-atelier',name:projectName,rootPath:'C:/atelier',openedAt:new Date().toISOString()}]}),projectName)
 await portraitButton('Sally').click()
 for(const size of [{width:1600,height:1000},{width:1440,height:920},{width:720,height:820},{width:600,height:820}]){
  await setWorkspaceViewport(app,page,size)
  for(const theme of ['dark','light']){
   if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Passer au thème '+(theme==='dark'?'sombre':'clair'),exact:true}).click();await portraitButton('Sally').click()}
   await page.locator('.agent-bust img').evaluate(e=>e.decode())
   await page.evaluate(async()=>{await Promise.allSettled(document.getAnimations().filter(a=>a.playState==='running'&&Number.isFinite(a.effect?.getTiming().iterations)).map(a=>a.finished))})
   const geometry=await page.evaluate(()=>{
    const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}},title=document.querySelector('.project-heading h1'),banner=document.querySelector('.project-banner'),image=document.querySelector('.agent-bust img'),bust=document.querySelector('.agent-bust')
    return {viewport:{width:innerWidth,height:innerHeight},title:{text:title.textContent,scrollWidth:title.scrollWidth,clientWidth:title.clientWidth},banner:{...box(banner),backgroundImage:getComputedStyle(banner).backgroundImage},tabs:[...document.querySelectorAll('.project-tabs button')].map(box),bust:box(bust),image:{...box(image),objectFit:getComputedStyle(image).objectFit,transform:getComputedStyle(image).transform,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight},containers:[...document.querySelectorAll('html,body,#root,.app-shell,.app-body,.workspace,.workspace-body,.sidebar,main,.main-inner,[role="tabpanel"],.conversation-messages,.agent-info-panel[open],.agent-panel-heading,.agent-panel-body')].filter(e=>e.getClientRects().length).map(e=>({element:e.id?'#'+e.id:e.className||e.tagName.toLowerCase(),...box(e),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth}))}
   })
   t.diagnostic(JSON.stringify({size,theme,...geometry}))
   assert.equal(geometry.title.text,projectName);assert.ok(geometry.title.scrollWidth<=geometry.title.clientWidth+1);assert.equal(geometry.banner.backgroundImage,'none');assert.ok(geometry.banner.height<=130)
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
 await portraitButton('Sally').click();await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();assert.equal(await page.getByRole('region',{name:'Fiche de Sally',exact:true}).isVisible(),true)
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
 const help={contractVersion:1,sequence:1,status:'ready',projectId:context.projectId,bundle,records:[record],error:null};assert.equal(isHelpState(help),true)
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
 for(const size of [{width:1440,height:920},{width:720,height:820}]){
  await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
  await page.waitForFunction(size=>innerWidth===size.width&&innerHeight===size.height,size)
  await page.locator('main').evaluate(e=>{e.scrollTop=0})
  const reading=await page.locator('.composer').evaluate(e=>({fieldTop:e.querySelector('textarea').getBoundingClientRect().top,actionBottom:e.querySelector('button[type="submit"]').getBoundingClientRect().bottom,height:innerHeight,scroll:document.querySelector('main').scrollTop}))
  t.diagnostic(JSON.stringify({requested:size,...reading}))
  assert.equal(reading.scroll,0);assert.ok(reading.fieldTop>=56&&reading.actionBottom<=reading.height-12,JSON.stringify(reading))
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
 const open=page.getByRole('button',{name:'Ouvrir un projet',exact:true});assert.equal(await open.count(),1)
 await open.focus();assert.equal(await open.locator('.command-tooltip').isVisible(),true)
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
 await revealRecaps();await page.locator('[data-recap-id="conversation-new"] > summary').click();await page.locator('[data-recap-id="conversation-new"]').getByRole('button',{name:'Retrouver la conversation',exact:true}).click();await page.locator('.previous-conversations > summary').click();assert.equal(await page.locator('.previous-conversations [data-question-id="question-first"]').getByLabel('Autre réponse',{exact:true}).inputValue(),'Une autre voie explicite')
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
test('le thème change au clavier sans perdre le brouillon ni le contexte en fenêtre compacte', async () => {
  await launch()
  await page.evaluate(() => window.connectionUIFixture.setSnapshot({ projects:[{id:'project-theme',name:'Projet Thème',rootPath:'C:/theme',openedAt:new Date().toISOString()}] }))
  await page.locator('.project-row').click()
  await page.waitForFunction(() => document.activeElement?.matches('h1') && document.activeElement.textContent === 'Projet Thème')
  await page.getByRole('tab',{name:'Conversation',exact:true}).click()
  await page.getByLabel('Brouillon pour Projet Thème').fill('Une saisie à conserver')
  const toggle = page.getByRole('button', { name:'Passer au thème clair',exact:true })
  await toggle.focus()
  assert.equal(await toggle.evaluate(element=>element===document.activeElement),true)
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light')
  assert.equal(await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).evaluate(element=>element===document.activeElement),true)
  assert.equal(await page.getByLabel('Brouillon pour Projet Thème').inputValue(),'Une saisie à conserver')
  await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByLabel('Brouillon pour Projet Thème').inputValue(),'Une saisie à conserver')
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
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
for (const failure of [true,'bridge']) test(`un thème non sauvegardé garde un avertissement accessible et la saisie (${failure})`, async () => {
  await launch()
  await page.evaluate(value=>window.connectionUIFixture.failAppearance(value),failure)
  await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click()
  await page.getByRole('status').filter({hasText:failure==='bridge'?'Le thème n’a pas pu être changé':'Le thème choisi s’applique à cette session'}).waitFor({timeout:2000})
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),failure==='bridge'?'dark':'light')
  assert.equal(await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).isVisible(),true)
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
  const recovery=page.getByRole('alert').filter({hasText:'L’arrêt de Codex ou de l’outil local reste à confirmer'})
  await recovery.waitFor({timeout:1000})
  await page.getByRole('tab',{name:'Parcours',exact:true}).click()
  assert.equal(await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).isDisabled(),true)
  assert.equal(await page.getByRole('button',{name:'Vérifier ce projet',exact:true}).isDisabled(),true)
  await page.getByRole('button',{name:'Retrouver Projet A',exact:true}).click()
  await page.getByRole('heading',{name:'Projet A',exact:true}).waitFor()
  assert.equal(await recovery.isVisible(),true)
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
