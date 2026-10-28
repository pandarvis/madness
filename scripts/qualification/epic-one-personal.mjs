// Le parent appelle explicitement runPersonal ; aucune action personnelle à l'import.
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir,readdir,lstat,realpath,open,rename} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {randomUUID} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import {check,sha256,samePath,inside,noLinks,claimOutput,verifyArtifact,personalEnvironment,assertNoApplication,assertProfileClosed,bounded,delay,publicFailure,assertClosed,archiveWitnessData,treeDigests} from './epic-one-support.mjs'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {FORGE_MANIFEST} from '../../src/adapters/bmad/forge-manifest.ts'
import {assertQuestionRuntime} from '../../src/adapters/codex/dialogue.ts'
import {findNativeExecutable} from '../../src/adapters/codex/probe.ts'
import {harnessProvenance,historicalDigests} from './epic-one-provenance.mjs'
import {installControlTraceRuntime,observedForgeOperations} from './epic-one-control-trace.mjs'
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const snapshot=state=>{const {capabilities,lifecycle,...value}=state;return value}
const active=['starting','running','waiting-question','waiting-approval','ready','stopping']
const terminalTurn=s=>s.status==='ready'&&s.turn?.phase==='completed'
export function assertApprovalEvidence({decision,record,observed}){
 const expected=decision==='accept'?'completed':'declined'
 check(record.transmission==='sent'&&record.effect===(decision==='accept'?'succeeded':'declined')&&record.result?.nativeStatus===expected&&Array.isArray(record.files)&&record.files.length>0&&record.result.files.length===record.files.length&&record.files.every(file=>record.result.files.some(f=>samePath(f.path,file.path)&&f.matches&&f.sha256===(decision==='accept'?file.afterSha256:file.beforeSha256)))&&observed?.nativeStatus===expected&&observed.grantRootAbsent,'APPROVAL_RESULT_UNPROVEN')
 const available=typeof record.result.raw==='string'&&record.result.raw.length>0
 if(available)check(observed.rawSha256===sha256(record.result.raw),'APPROVAL_RAW_MISMATCH')
 return {nativeStatus:expected,verifiedFiles:record.result.files.length,raw:{status:available?'exact':'unavailable',observedHashPresent:typeof observed.rawSha256==='string'}}
}

export async function createWitness(){
 const parent=join(repository,'.g0-qualification');await mkdir(parent,{recursive:true});await noLinks(parent)
 const id=randomUUID(),root=join(parent,'epic-one-'+id);await mkdir(root)
 await writeFile(join(root,'.epic-one-witness.json'),JSON.stringify({schemaVersion:1,owner:'madness-epic-one',id,createdAt:new Date().toISOString()})+'\n',{flag:'wx'})
 for(const [name,expected]of Object.entries(FORGE_MANIFEST)){const bytes=await readFile(inside(repository,join(repository,name)));check(sha256(bytes)===expected,'BMAD_MANIFEST_CHANGED');const target=inside(root,join(root,name));await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'})}
 await writeFile(join(root,'_bmad/config.toml'),'[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="initiative-temoin-1-11"\n',{flag:'wx'})
 const output=join(root,'_bmad-output/initiative-temoin-1-11/essais');await mkdir(output,{recursive:true})
 const accept=join(output,'accord.md'),decline=join(output,'refus.md');await writeFile(accept,'Avant accord 1.11.\n',{flag:'wx'});await writeFile(decline,'Avant refus 1.11.\n',{flag:'wx'})
 return {root,id,accept,decline}
}

// Les arguments/env sont transmis inchangés. Les seules valeurs conservées sont
// identités, compteurs, hashes et comparaisons de reçus. Aucun bearer ni stderr.
export async function installPassiveObservation(app,eventsPath,runnerSha256){
 check(await app.evaluate(installControlTraceRuntime,{manifestPaths:Object.keys(FORGE_MANIFEST)}),'CONTROL_TRACE_SETUP_FAILED')
 return app.evaluate(({session},options)=>{
  const cp=process.getBuiltinModule('child_process'),mod=process.getBuiltinModule('module'),fs=process.getBuiltinModule('fs'),crypto=process.getBuiltinModule('crypto'),util=process.getBuiltinModule('util'),{StringDecoder}=process.getBuiltinModule('string_decoder')
  const original=cp.spawn,children=[],questions=[],approvals=[],turns=new Map();let network=0,overflow=false,restored=false
  const hash=value=>crypto.createHash('sha256').update(value).digest('hex')
  const ref=value=>typeof value==='string'||typeof value==='number'?hash(typeof value+':'+String(value)):null
  const read=()=>({startedAt,attached:!restored,overflow,network,children:children.map(c=>({pid:c.pid,executable:c.executable,workspace:c.workspace,closed:c.closed,code:c.code,signal:c.signal,runnerSha256:c.hash,tlsConfigSafe:c.tlsConfigSafe})),questions:questions.map(q=>({threadRef:ref(q.threadId),turnRef:ref(q.turnId),itemRef:ref(q.itemId),nonSecret:q.nonSecret,expected:q.expected!==null,exact:q.exact,outputs:q.outputs})),approvals:approvals.map(a=>({itemRef:ref(a.itemId),grantRootAbsent:a.grantRootAbsent,nativeStatus:a.nativeStatus,rawSha256:a.rawSha256})),turns:[...turns.values()].map(t=>({threadRef:ref(t.threadId),turnRef:ref(t.turnId),deltas:t.deltas,deltaBeforeTerminal:t.deltaBeforeTerminal,terminal:t.terminal})),controlTrace:globalThis.__epicOneControlTrace.read()})
  const persist=()=>{try{fs.writeFileSync(options.eventsPath,JSON.stringify(read())+'\n',{mode:0o600})}catch{overflow=true}}
  globalThis.__epicOneControlTrace.setOnChange(persist)
  const startedAt=new Date().toISOString()
  const wrapped=function(file,args,settings){
   const child=Reflect.apply(original,this,arguments)
   if(Array.isArray(args)&&args[0]==='app-server'&&args.includes('stdio://')){
    const config=args.filter((_,i)=>args[i-1]==='-c'),env=settings?.env??{}
    const c={pid:child.pid,executable:file,workspace:settings.cwd,closed:false,code:null,signal:null,hash:null,tlsConfigSafe:config.includes('model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"')&&config.includes('model_providers.openai_chatgpt_plan.wire_api="responses"')&&config.includes('model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"')&&env.NODE_TLS_REJECT_UNAUTHORIZED!=='0'&&!env.NODE_OPTIONS}
    try{c.hash=hash(fs.readFileSync(file))}catch{overflow=true}children.push(c);persist();globalThis.__epicOneControlTrace.attach(child,child.pid)
    child.once('close',(code,signal)=>{c.closed=true;c.code=code;c.signal=signal;persist()})
    let buffer='';const decoder=new StringDecoder('utf8')
    child.stdout?.on('data',chunk=>{
     buffer+=typeof chunk==='string'?chunk:decoder.write(chunk)
     if(buffer.length>2097152){buffer='';overflow=true;persist();return}
     while(buffer.includes('\n')){
      const end=buffer.indexOf('\n'),line=buffer.slice(0,end);buffer=buffer.slice(end+1);let m
      try{m=JSON.parse(line)}catch{continue}const p=m.params??{},item=p.item
      if(m.method==='item/tool/requestUserInput'&&Array.isArray(p.questions))questions.push({threadId:p.threadId,turnId:p.turnId,itemId:p.itemId,fields:p.questions.map(f=>f.id),nonSecret:p.questions.every(f=>f.isSecret!==true),expected:null,exact:false,outputs:0})
      if(m.method==='item/fileChange/requestApproval')approvals.push({itemId:p.itemId,grantRootAbsent:p.grantRoot===null||p.grantRoot===undefined,nativeStatus:null,rawSha256:null})
      if(m.method==='item/completed'&&item?.type==='fileChange'){const a=approvals.find(a=>a.itemId===item.id);if(a&&['completed','failed','declined'].includes(item.status))a.nativeStatus=item.status}
      if(m.method==='rawResponseItem/completed'&&item?.type==='custom_tool_call_output'){const a=approvals.find(a=>a.itemId===item.call_id);if(a&&typeof item.output==='string')a.rawSha256=hash(item.output)}
      if(m.method==='rawResponseItem/completed'&&item?.type==='function_call_output'){
       const q=questions.find(q=>q.threadId===p.threadId&&q.turnId===p.turnId&&q.itemId===item.call_id)
       if(q){q.outputs++;let actual;try{actual=JSON.parse(item.output)}catch{}if(q.expected){const expected={answers:Object.fromEntries(q.fields.map((id,i)=>[id,{answers:[q.expected['field-'+(i+1)]]}]))};q.exact=util.isDeepStrictEqual(actual,expected)}}
      }
      if(typeof p.turnId==='string'){
       const key=p.threadId+'|'+p.turnId;let t=turns.get(key);if(!t){t={threadId:p.threadId,turnId:p.turnId,deltas:0,deltaBeforeTerminal:false,terminal:false};turns.set(key,t)}
       if(m.method==='item/agentMessage/delta'){t.deltas++;if(!t.terminal)t.deltaBeforeTerminal=true}
      }
      if(m.method==='turn/completed'&&typeof p.turn?.id==='string'){const key=p.threadId+'|'+p.turn.id;let t=turns.get(key);if(!t){t={threadId:p.threadId,turnId:p.turn.id,deltas:0,deltaBeforeTerminal:false,terminal:false};turns.set(key,t)}t.terminal=true}
      if(Object.hasOwn(m,'id')||typeof m.method!=='string'||!/delta$/i.test(m.method))persist()
     }
    })
   }
   return child
  }
  cp.spawn=wrapped;mod.syncBuiltinESMExports();session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>{network++;persist();callback({})})
  globalThis.__epicOne={read,expectQuestion:values=>{const q=questions.at(-1);if(!q||q.expected!==null||q.outputs)return false;q.expected=values;persist();return true},restore:()=>{if(cp.spawn!==wrapped)return false;cp.spawn=original;mod.syncBuiltinESMExports();session.defaultSession.webRequest.onBeforeRequest(null);restored=true;const controlRestored=globalThis.__epicOneControlTrace.restore();persist();return controlRestored}}
  persist();return cp.spawn===wrapped
 },{eventsPath,runnerSha256})
}

export class PersonalSession{
 constructor({artifact,output,runnerSha256,signal}){this.artifact=artifact;this.output=output;this.runnerSha256=runnerSha256;this.signal=signal;this.children=new Map();this.launchCount=0;this.closeReceipts=[];this.profile=join(process.env.APPDATA,'Madness')}
 async launch(){
  check(!this.app,'SESSION_ALREADY_OPEN');check(!this.signal?.aborted,'RUN_INTERRUPTED');await assertNoApplication(this.artifact.executable);await assertProfileClosed()
  const {_electron}=await import('playwright-core');this.closeObserved=false
  this.app=await _electron.launch({executablePath:this.artifact.executable,args:[],cwd:repository,env:personalEnvironment(),timeout:30000});this.app.once('close',()=>{this.closeObserved=true})
  const runtime=await bounded(()=>this.app.evaluate(({app})=>({pid:process.pid,executable:process.execPath,version:app.getVersion(),electron:process.versions.electron,chromium:process.versions.chrome,node:process.versions.node,packaged:app.isPackaged,appPath:app.getAppPath(),userData:app.getPath('userData'),appData:app.getPath('appData'),sessionData:app.getPath('sessionData')})),20000)
  this.main=await windowsOwnedProcesses.read(runtime.pid)
  check(this.main&&samePath(this.main.executable,this.artifact.executable)&&runtime.packaged&&runtime.version===this.artifact.version&&runtime.electron===this.artifact.electron&&samePath(runtime.appPath,join(dirname(this.artifact.executable),'resources/app.asar')),'PERSONAL_RUNTIME_MISMATCH')
  check(samePath(runtime.userData,this.profile)&&samePath(runtime.appData,process.env.APPDATA)&&samePath(runtime.sessionData,this.profile),'NORMAL_PERSONAL_PATHS_REQUIRED')
  this.runtime={mainPid:runtime.pid,wrapperPid:this.app.process().pid,version:runtime.version,electron:runtime.electron,chromium:runtime.chromium,node:runtime.node,packaged:true,normalUserData:true,normalSessionData:true}
  this.eventsPath=join(this.output,'native-events-'+ ++this.launchCount+'.json');check(await installPassiveObservation(this.app,this.eventsPath,this.runnerSha256),'OBSERVER_REQUIRED')
  this.page=await this.app.firstWindow();this.page.setDefaultTimeout(20000);await this.page.waitForFunction(()=>!!window.madness&&!!window.madnessDialogue&&!!window.madnessConnection)
  return this.runtime
 }
 async state(){const reply=await bounded(()=>this.page.evaluate(()=>window.madness.readState()),20000);check(reply.ok,'STATE_READ_REFUSED');return reply.value.state}
 async dialogue(){return bounded(()=>this.page.evaluate(()=>window.madnessDialogue.read()),20000)}
 async command(method,...args){check(['read','qualify','launch','qualifyForge','launchForge','send','saveQuestion','answerQuestion','saveApproval','decideApproval','stop','observeStop','inspectApproval'].includes(method),'PERSONAL_COMMAND_REFUSED');check(!this.signal?.aborted||['read','stop','observeStop'].includes(method),'RUN_INTERRUPTED');return bounded(()=>this.page.evaluate(({method,args})=>window.madnessDialogue[method](...args),{method,args}),20000)}
 async observe(){
  const value=await bounded(()=>this.app.evaluate(()=>globalThis.__epicOne.read()),10000)
  for(const c of value.children)if(!this.children.has(c.pid)){const identity=await windowsOwnedProcesses.read(c.pid);check(identity&&samePath(identity.executable,c.executable),'NATIVE_IDENTITY_MISSING');check(c.runnerSha256===this.runnerSha256,'NATIVE_RUNNER_MISMATCH');check(c.tlsConfigSafe,'CHILD_TLS_CONFIG_REFUSED');const parent=dirname(c.workspace);check(samePath(dirname(parent),join(this.profile,'codex-connection-v1/dialogues'))&&/^dialogue-/.test(basename(parent)),'NATIVE_WORKSPACE_REFUSED');this.children.set(c.pid,{identity,workspace:parent})}
  check(!value.overflow,'OBSERVER_INCOMPLETE');return value
 }
 async wait(predicate,{maximum=600000,idle=200000,allowError=false}={}){
  const start=Date.now();let last=Date.now(),signature=''
  for(;;){check(!this.signal?.aborted,'RUN_INTERRUPTED');const state=await this.dialogue();await this.observe();if(predicate(state))return state
   this.lastDiagnostic={status:state.status,errorCode:state.errorCode,turnPhase:state.turn?.phase??null,questionCount:state.questions.length,approvalCount:state.approvals.length}
   if(!allowError)check(!['error','unknown'].includes(state.status)&&!state.errorCode,'DIALOGUE_FAILED')
   const next=JSON.stringify([state.sequence,state.status,state.turn?.phase,state.messages?.map(m=>[m.id,m.revision,m.text.length]),state.questions?.map(q=>[q.id,q.revision]),state.approvals?.map(a=>[a.id,a.revision])]);if(next!==signature){signature=next;last=Date.now()}
   check(Date.now()-start<maximum&&Date.now()-last<idle,'DIALOGUE_TIMEOUT');await delay(200)
  }
 }
 async selectWitness(witness){
  check(!(await this.state()).projects.some(p=>samePath(p.rootPath,witness.root)),'WITNESS_ALREADY_LINKED')
  await this.app.evaluate(({dialog},root)=>{const previous=dialog.showOpenDialog;let used=false;globalThis.__epicOneFolderRestore=()=>{dialog.showOpenDialog=previous};dialog.showOpenDialog=async(...args)=>{const options=args.at(-1);if(used||options.title!=='Ouvrir un projet'||!options.properties.includes('openDirectory'))throw Error('FOLDER_SCOPE_REFUSED');used=true;return {canceled:false,filePaths:[root]}}},witness.root)
  let selected
  try{const reply=await this.page.evaluate(()=>window.madness.chooseDirectory());check(reply.ok,'WITNESS_OPEN_REFUSED');selected=reply.value.state.projects.find(p=>samePath(p.rootPath,witness.root));check(selected,'WITNESS_PROJECT_MISSING')}
  finally{await this.app.evaluate(()=>globalThis.__epicOneFolderRestore?.())}
  this.projectId=selected.id;await this.page.getByRole('tab',{name:'Conversation',exact:true}).click();return selected.id
 }
 async stop(){
  if(!this.app)return;await this.command('stop');const state=await this.wait(s=>s.status==='stopped',{maximum:30000,idle:30000,allowError:true});check(!state.errorCode||state.errorCode==='CANCELLED','STOP_FAILED');const observed=await this.observe();check(observed.children.every(c=>c.closed),'NATIVE_CLOSE_MISSING');return state
 }
 async close(){
  if(!this.app)return null
  // Ne pas désinstaller le hook avant shutdown : conserver les événements close.
  let observationAvailable=true
  try{await this.observe()}catch{observationAvailable=false}
  const app=this.app,main=this.main
  try{await bounded(()=>app.close(),30000,'APP_CLOSE_TIMEOUT')}catch{try{await bounded(()=>app.evaluate(({app})=>{app.quit();return true}),5000)}catch{}}
  const start=Date.now();while(Date.now()-start<5000&&main&&await windowsOwnedProcesses.read(main.pid)!==null)await delay(100)
  const mainGone=!!main&&await windowsOwnedProcesses.read(main.pid)===null
  let native;try{native=JSON.parse(await readFile(this.eventsPath,'utf8'))}catch{native=null}
  let childrenGone=observationAvailable&&!!native&&native.children.every(c=>c.closed),spacesAbsent=true
  for(const {identity,workspace}of this.children.values()){const current=await windowsOwnedProcesses.read(identity.pid);childrenGone=childrenGone&&(current===null||!isDeepStrictEqual(current,identity));try{await lstat(workspace);spacesAbsent=false}catch(e){if(e.code!=='ENOENT')throw e}}
  const receipt={mainGone,childrenGone,closeObserved:this.closeObserved,spacesAbsent,native};this.closeReceipts.push(receipt)
  assertClosed(receipt);check(spacesAbsent,'NATIVE_WORKSPACE_REMAINS');this.app=null;this.page=null;this.children.clear();return receipt
 }
}

async function ownDurable(profile){
 const snapshotBytes=await readFile(join(profile,'madness-state-v1.json')),annexes={}
 for(const folder of ['questions-v1','approvals-v1','workflows-v1']){try{annexes[folder]=await treeDigests(join(profile,folder))}catch(e){if(e.code!=='ENOENT')throw e;annexes[folder]=[]}}
 return {snapshotBytes,annexes}
}
function preserve(initial,oldDialogue,current,dialogue){
 for(const name of ['projects','drafts','conversations'])for(const old of initial[name])check(isDeepStrictEqual(current[name].find(item=>name==='drafts'?item.projectId===old.projectId:item.id===old.id),old),'PRIVATE_DATA_CHANGED')
 for(const name of ['questions','approvals','workflows'])for(const old of oldDialogue[name])check(isDeepStrictEqual(dialogue[name].find(item=>name==='workflows'?item.conversationId===old.conversationId:item.id===old.id),old),'PRIVATE_ANNEX_CHANGED')
 check(isDeepStrictEqual(current.preferences,initial.preferences),'PRIVATE_PREFERENCE_CHANGED')
}
async function restoreSelection(session,initial){const current=await session.state();if(current.activeProjectId!==initial.activeProjectId){check(initial.activeProjectId!==null,'INITIAL_SELECTION_UNRESTORABLE');const r=await session.page.evaluate(id=>window.madness.selectProject(id),initial.activeProjectId);check(r.ok,'SELECTION_RESTORE_REFUSED')}}
async function send(session,text){await session.page.locator('#draft').fill(text);await session.page.getByRole('button',{name:'Envoyer à Mary',exact:true}).click()}

async function firstForgeDiagnostic(session,initial,initialDialogue,report,pass){
 report.limits.push('Diagnostic de la première activation Forge uniquement : aucun tour de suivi, aucune conclusion G1 ni archivage automatique du témoin.')
 await session.command('qualifyForge',session.projectId);await session.wait(s=>s.status==='qualified');pass('fresh-witness-forge-profile-qualified')
 await session.command('launchForge',session.projectId)
 const state=await session.wait(s=>terminalTurn(s)||['error','unknown','stopped','waiting-question','waiting-approval'].includes(s.status),{allowError:true})
 const conversationId=state.context.conversationId,conversation=(await session.state()).conversations.find(c=>c.id===conversationId),workflow=state.workflows.find(w=>w.conversationId===conversationId)
 report.conversations={forge:conversationId}
 report.forgeDiagnostic={firstActivationOnly:true,status:state.status,errorCode:state.errorCode,turnPhase:state.turn?.phase??null,invocationExact:conversation?.messages[0]?.text==='$bmad-forge-idea',workflow:workflow?{workspacePresent:workflow.workspace!==null,outcome:workflow.outcome,observationCount:workflow.observations.length,operations:observedForgeOperations(workflow.observations)}:null}
 report.native=await session.observe();report.forgeDiagnostic.activationEndSequence=report.native.controlTrace.events.at(-1)?.sequence??0;report.forgeDiagnostic.firstRefusal=report.native.controlTrace.events.find(event=>event.direction==='stdin'&&event.type==='refusal')??null
 check(report.native.controlTrace.complete,'CONTROL_TRACE_INCOMPLETE');check(report.native.children.length===1,'SINGLE_FORGE_ACTIVATION_REQUIRED');pass('first-forge-control-metadata-captured-no-follow-up')
 report.forgeDiagnostic.bridgeStopRequested=active.includes(state.status)
 if(report.forgeDiagnostic.bridgeStopRequested)await session.stop()
 preserve(initial,initialDialogue,await session.state(),await session.dialogue());await restoreSelection(session,initial)
 report.nativeAfterStop=await session.observe();check(report.nativeAfterStop.controlTrace.complete,'CONTROL_TRACE_INCOMPLETE')
 report.firstClose=await session.close();report.cleanup.closed=true
 const owner=JSON.parse(await readFile(join(session.profile,'codex-owned-run-v1.json'),'utf8'));report.durableOwner={status:owner.status,identityPresent:!!owner.identity};check(owner.status==='stopped','DURABLE_STOP_UNKNOWN');pass('forge-diagnostic-owned-close-and-spaces-absent')
 const finalTrace=report.firstClose.native.controlTrace;check(finalTrace.complete,'CONTROL_TRACE_INCOMPLETE')
 report.status=['error','unknown'].includes(state.status)||state.errorCode?'failed-forge-diagnostic-native':'diagnostic-captured-first-activation-only'
 if(report.status.startsWith('failed'))report.failure={code:'FORGE_FIRST_ACTIVATION_FAILED'}
}

export async function runPersonal({executable,output,manifest,action,archive=false,signal}){
 check(['preflight','run','close-active','child-error','forge-diagnostic'].includes(action),'EXPLICIT_PERSONAL_ACTION_REQUIRED');check(action!=='forge-diagnostic'||!archive,'DIAGNOSTIC_ARCHIVE_REFUSED');personalEnvironment();check(process.platform==='win32'&&process.env.APPDATA,'NORMAL_WINDOWS_REQUIRED')
 const destination=await claimOutput(output),report={schemaVersion:1,source:'personal-siwc-existing-account',action,startedAt:new Date().toISOString(),status:'partial',checks:[],cleanup:{closed:false,archived:false},limits:['Période antérieure au hook non observée ; aucune capture personnelle ni lecture/copie du coffre.','Choix dossier piloté et accords synthétiques sous mandat ; aucune nouvelle acceptation humaine.','Succès HTTPS du child implique accès/confiance pour ces seules requêtes ; chaîne et CA non capturées. GET Main séparé.','G2–G5 étendus, catalogue, V1 complète et essai humain global non revendiqués.']}
 const save=()=>writeFile(join(destination,'report.json'),JSON.stringify(report,null,2)+'\n'),pass=code=>{report.checks.push(code);console.log('Epic 1 personnel : '+code)}
 let session,initial,initialDialogue,witness,reopened=false,guard,historicalBefore
 try{
  await save();report.artifact=await verifyArtifact(executable,manifest);report.harness=await harnessProvenance();historicalBefore=await historicalDigests();report.historicalBefore=historicalBefore
  const runner=await findNativeExecutable(process.env.APPDATA);await assertQuestionRuntime(runner);const runnerSha256=sha256(await readFile(runner));report.nativeRunner={version:'0.144.6',sha256:runnerSha256}
  session=new PersonalSession({artifact:report.artifact,output:destination,runnerSha256,signal});guard=setTimeout(()=>{void session.close().catch(()=>{})},1800000)
  report.runtime=await session.launch();initial=snapshot(await session.state());initialDialogue=await session.dialogue();check(initialDialogue.status==='idle'&&initialDialogue.turn===null,'ACTIVE_SESSION_AT_ENTRY')
  const account=await session.page.evaluate(()=>window.madnessConnection.read());check(account.state.accountStored&&!account.state.needsPlanAcknowledgement,'EXISTING_ACCOUNT_UNAVAILABLE');report.accountReadable=true;pass('normal-runtime-existing-account-no-authentication')
  if(action==='preflight'){await delay(3000);const observed=await session.observe();check(observed.children.length===0&&observed.network===0,'PREFLIGHT_STARTED_ENGINE_OR_NETWORK');pass('no-spontaneous-native-or-network-after-hook')}
  else{
   check(initial.activeProjectId!==null,'INITIAL_SELECTION_UNRESTORABLE');witness=await createWitness();report.witness={root:witness.root,id:witness.id,synthetic:true};await save();await session.selectWitness(witness)
   if(action==='forge-diagnostic'){await firstForgeDiagnostic(session,initial,initialDialogue,report,pass);return report}
   if(action==='run')await session.page.getByLabel('Proposer des modifications avec approbation',{exact:true}).check()
   await session.command('qualify',session.projectId);await session.wait(s=>s.status==='qualified');await session.command('launch',session.projectId,action==='run'?'file-approval':'read-only');let ready=await session.wait(terminalTurn)
   const conversationId=ready.context.conversationId;report.conversations={mary:conversationId};const conversation=(await session.state()).conversations.find(c=>c.id===conversationId);check(conversation?.messages[0]?.text==='$bmad-agent-analyst','MARY_INVOCATION_MISSING');pass('real-installed-mary-context-and-terminal')
   const foreign=await session.command('send','foreign-project',conversationId,'Commande de mauvais contexte, ne pas transmettre');check(foreign.errorCode==='CONTEXT_MISMATCH','FOREIGN_CONTEXT_NOT_REFUSED');pass('foreign-context-command-refused')
   if(action==='run'){
    await send(session,'Témoin technique synthétique 1.11 '+witness.id+'. Sans écriture ni autre workflow, appelle une seule fois request_user_input en mode Default : une question non secrète avec deux options « Alpha » et « Bêta ». Attends ma réponse native puis termine le tour sans nouvelle question. Ne remplace pas le formulaire par de la prose.')
    const waiting=await session.wait(s=>s.status==='waiting-question'&&s.questions.some(q=>q.context.conversationId===conversationId&&q.status==='waiting'&&q.storage==='stored')),question=waiting.questions.find(q=>q.context.conversationId===conversationId&&q.status==='waiting')
    check(question.fields.length===1,'QUESTION_PROFILE_UNEXPECTED');const field=question.fields[0],values={[field.id]:field.allowOther?'Réponse synthétique 1.11 '+witness.id:field.options[0]?.label};check(Object.values(values).every(v=>typeof v==='string'&&v),'QUESTION_VALUES_UNAVAILABLE')
    await session.command('saveQuestion',question.id,values);await session.wait(s=>s.questions.some(q=>q.id===question.id&&q.storage==='stored'&&isDeepStrictEqual(q.values,values)))
    check(await session.app.evaluate((_,values)=>globalThis.__epicOne.expectQuestion(values),values),'QUESTION_OBSERVER_MISMATCH');await session.command('answerQuestion',question.id,values)
    await session.wait(s=>terminalTurn(s)&&s.questions.some(q=>q.id===question.id&&q.status==='sent'&&q.storage==='stored'));check((await session.observe()).questions.at(-1)?.exact,'EXACT_QUESTION_RECEIPT_MISSING');pass('explicit-question-answer-exact-raw-receipt-and-continuation')
    for(const [decision,path,before,after]of [['accept',witness.accept,'Avant accord 1.11.\n','Après accord 1.11.\n'],['decline',witness.decline,'Avant refus 1.11.\n','Après refus 1.11.\n']]){
     const beforeTree=await treeDigests(witness.root)
     await send(session,'Témoin synthétique 1.11. Quitte le rôle Mary pour ce seul essai technique. Propose avec le vrai outil natif apply_patch un unique patch de mise à jour du fichier existant '+path+' : remplace exactement '+JSON.stringify(before)+' par '+JSON.stringify(after)+'. Aucun autre fichier, commande, outil externe ou workflow. Attends mon accord natif sans le choisir. Après le résultat, termine ce tour brièvement sans nouvel outil.')
     const state=await session.wait(s=>s.status==='waiting-approval'&&s.approvals.some(a=>a.context.conversationId===conversationId&&a.status==='waiting'&&a.storage==='stored')),approval=state.approvals.find(a=>a.context.conversationId===conversationId&&a.status==='waiting')
     check(approval.files.length===1&&samePath(approval.files[0].path,path)&&approval.files[0].kind==='update'&&approval.files[0].beforeSha256===sha256(before)&&approval.files[0].afterSha256===sha256(after),'PATCH_SCOPE_REFUSED');inside(witness.root,path)
     check(await readFile(path,'utf8')===before,'PATCH_PRECONDITION_CHANGED');await session.command('saveApproval',approval.id,'');await session.wait(s=>s.approvals.some(a=>a.id===approval.id&&a.storage==='stored'))
     await session.command('decideApproval',approval.id,decision);const final=await session.wait(s=>terminalTurn(s)&&s.approvals.some(a=>a.id===approval.id&&a.status==='decided'&&a.storage==='stored'))
     const result=final.approvals.find(a=>a.id===approval.id),observed=(await session.observe()).approvals.at(-1),expected=decision==='accept'?'completed':'declined'
     const evidence=assertApprovalEvidence({decision,record:result,observed});report.approvals??=[];report.approvals.push({id:approval.id,decision,...evidence})
     check(await readFile(path,'utf8')===(decision==='accept'?after:before),'PATCH_EFFECT_MISMATCH')
     const afterTree=await treeDigests(witness.root);assert.deepEqual(afterTree,beforeTree.map(f=>samePath(join(witness.root,f.path),path)&&decision==='accept'?{...f,sha256:sha256(after)}:f),'UNEXPECTED_WITNESS_EFFECT')
     const repeated=await session.command('decideApproval',approval.id,decision);check(repeated.errorCode==='CONTEXT_MISMATCH','LATE_APPROVAL_NOT_REFUSED');check((await session.observe()).approvals.length===(decision==='accept'?1:2),'LATE_APPROVAL_NATIVE_REPLAY');assert.deepEqual(await treeDigests(witness.root),afterTree,'LATE_APPROVAL_EFFECT');pass(decision==='accept'?'native-single-approval-all-effects-reread':'distinct-native-decline-no-effect')
    }
    const draft='Brouillon synthétique 1.11 '+witness.id;await session.page.locator('#draft').fill(draft);await session.page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click();check((await session.state()).drafts.some(d=>d.projectId===session.projectId&&d.text===draft),'DRAFT_NOT_SAVED')
    await session.stop();const late=await session.command('answerQuestion',question.id,values);check(late.errorCode==='CONTEXT_MISMATCH','LATE_QUESTION_NOT_REFUSED');pass('bridge-stop-and-late-command-refused-no-replay')
    await session.command('qualifyForge',session.projectId);await session.wait(s=>s.status==='qualified');await session.command('launchForge',session.projectId)
    // Forge reste le workflow installé. Il mène ses propres conditions ; les
    // réponses synthétiques ne réécrivent ni le skill ni ses conditions de sortie.
    let forge=await session.wait(terminalTurn),forgeConversation=forge.context.conversationId;report.conversations.forge=forgeConversation
    for(let turn=0;turn<8;turn++){
     const current=(await session.dialogue()).workflows.find(w=>w.conversationId===forgeConversation)
     if(current?.workspace&&current.observations.some(o=>o.operation==='write')&&current.outcome!=='open')break
     const text=turn===0?'Idée synthétique technique : un carnet local pour noter une idée et sa prochaine action. But : vérifier ce workflow natif et ses livrables dans ce témoin. Usage individuel, sans service ni synchronisation. Les conditions et commandes du skill installé font autorité.':turn<5?'Pour ce témoin, retiens la solution minimale : carnet individuel local, une idée et une prochaine action, sans réseau ni compte supplémentaire. Les hypothèses peuvent rester explicites. Réponds à la prochaine question du workflow avec cette direction ; aucune acceptation humaine du produit n’est déduite.':'Les limites du témoin sont acceptées comme hypothèses de travail synthétiques. Applique la conclusion permise par le workflow installé avec les informations présentes ; rédige ses livrables et son journal avec les outils hôte autorisés, sans inventer une validation humaine.'
     const sent=await session.command('send',session.projectId,forgeConversation,text);check(!sent.errorCode,'FORGE_SEND_REFUSED');forge=await session.wait(terminalTurn)
    }
    const workflow=(await session.dialogue()).workflows.find(w=>w.conversationId===forgeConversation);check(workflow?.workspace&&workflow.outcome!=='open'&&workflow.observations.some(o=>o.operation==='write'),'FORGE_DELIVERABLE_MISSING')
    const latest=new Map(workflow.observations.filter(o=>o.phase==='observed'&&typeof o.path==='string'&&o.sha256).map(o=>[o.path,o]))
    for(const observation of latest.values()){inside(witness.root,observation.path);check(sha256(await readFile(observation.path))===observation.sha256,'FORGE_OBSERVED_BYTES_CHANGED')}
    const memlog=await readFile(join(workflow.workspace,'.memlog.md'));check(memlog.length>0,'FORGE_JOURNAL_MISSING');report.forge={conversationId:forgeConversation,outcome:workflow.outcome,observationCount:workflow.observations.length,journalSha256:sha256(memlog)};pass('installed-forge-invocation-native-journal-and-deliverables-reread');await session.stop()
   }else{
    await send(session,'Témoin synthétique de fermeture 1.11 '+witness.id+'. Appelle request_user_input une fois maintenant : question non secrète avec deux options. Attends ma réponse native sans la choisir. Aucun fichier ni autre effet.')
    await session.wait(s=>s.status==='waiting-question');pass('native-activity-held-by-unanswered-question')
    if(action==='child-error'){
     const observed=await session.observe(),child=observed.children.find(c=>!c.closed);check(child&&session.children.has(child.pid),'OWNED_CHILD_REQUIRED');const identity=session.children.get(child.pid).identity;check(await windowsOwnedProcesses.stop(identity),'CONTROLLED_CHILD_STOP_FAILED');await session.wait(s=>['error','unknown','stopped'].includes(s.status),{allowError:true,maximum:30000,idle:30000});pass('controlled-owned-child-unexpected-exit-observed')
    }
   }
   preserve(initial,initialDialogue,await session.state(),await session.dialogue());await restoreSelection(session,initial)
  }
  const beforeClose=await session.observe();report.native=beforeClose;check(beforeClose.controlTrace.complete,'CONTROL_TRACE_INCOMPLETE')
  if(action!=='preflight'){
   check(beforeClose.children.length>0&&beforeClose.children.every(c=>c.tlsConfigSafe&&c.runnerSha256===runnerSha256),'NATIVE_TLS_OR_HASH_UNPROVEN');check(beforeClose.turns.some(t=>t.deltaBeforeTerminal&&t.terminal),'PROGRESS_BEFORE_TERMINAL_MISSING');pass('real-child-https-config-and-correlated-progress-before-terminal')
  }
  report.firstClose=await session.close();report.cleanup.closed=true;check(report.firstClose.native.controlTrace.complete,'CONTROL_TRACE_INCOMPLETE')
  if(action!=='preflight'){
   const owner=JSON.parse(await readFile(join(session.profile,'codex-owned-run-v1.json'),'utf8'));report.durableOwner={status:owner.status,identityPresent:!!owner.identity};check(owner.status==='stopped','DURABLE_STOP_UNKNOWN');pass(action==='close-active'?'active-app-shutdown-native-close-spaces-absent':'owned-close-durable-stop-spaces-absent')
   const durable=await ownDurable(session.profile);await session.launch();const restored=await session.state(),restoredDialogue=await session.dialogue();check(isDeepStrictEqual(snapshot(restored),JSON.parse(durable.snapshotBytes.toString('utf8'))),'REOPEN_SNAPSHOT_MISMATCH');check(restoredDialogue.status==='idle'&&restoredDialogue.turn===null&&restoredDialogue.questions.every(q=>!['waiting','sending'].includes(q.status))&&restoredDialogue.approvals.every(a=>!['waiting','sending'].includes(a.status)),'REOPEN_ACTIVE_REQUEST')
   preserve(initial,initialDialogue,restored,restoredDialogue);const restoredAccount=await session.page.evaluate(()=>window.madnessConnection.read());check(restoredAccount.state.accountStored&&!restoredAccount.state.needsPlanAcknowledgement,'REOPEN_ACCOUNT_UNAVAILABLE');await delay(3000);const observation=await session.observe();check(observation.children.length===0&&observation.network===0,'SPONTANEOUS_REOPEN_ACTIVITY');report.reopenObservation=observation;await session.close();report.cleanup.closed=true
   const finalDurable=await ownDurable(session.profile);check(isDeepStrictEqual(finalDurable.annexes,durable.annexes)&&finalDurable.snapshotBytes.equals(durable.snapshotBytes),'REOPEN_DURABLE_BYTES_CHANGED');reopened=true;pass('final-durable-exact-reopen-inactive-requests-account-readable-no-spontaneous-engine-or-network')
   if(archive){report.archive=await archiveWitnessData({profile:session.profile,witness:witness.root,projectId:session.projectId,closed:true,reopened,assertNoApp:()=>assertProfileClosed()});report.cleanup.archived=true;pass('only-owned-witness-archived-profile-closed')}
  }
  report.status=action==='preflight'?'passed-personal-preflight-only':'passed-personal-'+action
 }catch(error){report.status='failed-no-replay';report.failure=publicFailure(error);if(session?.lastDiagnostic)report.diagnostic=session.lastDiagnostic}
 finally{
  clearTimeout(guard)
  if(session?.app){try{if(initial)await restoreSelection(session,initial)}catch{report.cleanup.selectionUnconfirmed=true}try{report.finalClose=await session.close();report.cleanup.closed=true}catch(error){report.cleanup.closed=false;report.cleanup.failure=publicFailure(error);report.status='failed-no-replay'}}
  if(historicalBefore){try{report.historicalAfter=await historicalDigests();report.historicalUnchanged=isDeepStrictEqual(historicalBefore,report.historicalAfter);check(report.historicalUnchanged,'HISTORICAL_EVIDENCE_CHANGED')}catch(error){report.status='failed-no-replay';report.failure=publicFailure(error)}}
  report.finishedAt=new Date().toISOString();await save()
 }
 return report
}
