// Parent-only controller. Import is passive; --run is required for personal work.
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir,lstat,unlink,readdir,realpath} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {execFile} from 'node:child_process'
import {promisify,isDeepStrictEqual} from 'node:util'
import {combinedControlSource,installCombinedTrace,installHelpObservation,sampleDialogueWithObservation} from './bmad-help-observation.mjs'
const repository=process.cwd(),load=p=>import(pathToFileURL(join(repository,p)).href)
const support=await load('scripts/qualification/epic-one-support.mjs')
const {check,sha256,samePath,claimOutput,bounded,delay,personalEnvironment,assertClosed,publicFailure,archiveWitnessData,noLinks}=support
const {PersonalSession,installPassiveObservation}=await load('scripts/qualification/epic-one-personal.mjs')
const {windowsOwnedProcesses}=await load('src/adapters/codex/owned-run.ts')
const {installControlTraceRuntime}=await load('scripts/qualification/epic-one-control-trace.mjs')
const execute=promisify(execFile)

// DIA is another active application. Its exact executable is classified separately;
// no DIA process is closed or changed. All other Electron owners remain uncertain.
export async function assertClosedProfile(){
 const script=`$ErrorActionPreference='Stop'; $owners=@(); foreach($p in Get-CimInstance Win32_Process){$kind=$null;if($p.Name -ieq 'Madness.exe'){$kind='madness'}elseif($p.Name -ieq 'electron.exe'){$kind='electron'}elseif($p.ExecutablePath){try{$product=[Diagnostics.FileVersionInfo]::GetVersionInfo($p.ExecutablePath).ProductName;if($product -ieq 'Madness'){$kind='madness-renamed'}elseif($product -ieq 'Electron'){$kind='electron-renamed'}}catch{}};if($kind){$owners+=@{pid=[int]$p.ProcessId;path=$p.ExecutablePath;kind=$kind}}}; ConvertTo-Json -InputObject @($owners) -Compress`
 const {stdout}=await execute('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:15000,maxBuffer:65536})
 const values=JSON.parse(stdout),dia=resolve('C:/Sources/DIA/apps/desktop/node_modules/electron/dist/electron.exe')
 check(Array.isArray(values),'PROFILE_INVENTORY_UNCERTAIN')
 for(const owner of values)check(typeof owner.path==='string'&&samePath(owner.path,dia)&&owner.kind==='electron','POSSIBLE_MADNESS_OWNER')
 return true
}

export class HelpPersonalSession extends PersonalSession{
 async launch(){
  check(!this.app,'SESSION_ALREADY_OPEN');await assertClosedProfile()
  const {_electron}=await import(pathToFileURL(join(repository,'node_modules/playwright-core/index.mjs')).href)
  this.closeObserved=false
  this.app=await _electron.launch({executablePath:this.artifact.executable,args:[],cwd:repository,env:personalEnvironment(),timeout:30000})
  this.app.once('close',()=>{this.closeObserved=true})
  const runtime=await bounded(()=>this.app.evaluate(({app})=>({pid:process.pid,executable:process.execPath,version:app.getVersion(),electron:process.versions.electron,chromium:process.versions.chrome,node:process.versions.node,packaged:app.isPackaged,appPath:app.getAppPath(),userData:app.getPath('userData'),sessionData:app.getPath('sessionData')})),20000)
  this.main=await windowsOwnedProcesses.read(runtime.pid)
  check(this.main&&samePath(this.main.executable,this.artifact.executable)&&runtime.packaged&&runtime.version===this.artifact.version&&runtime.electron===this.artifact.electron&&samePath(runtime.appPath,join(dirname(this.artifact.executable),'resources/app.asar')),'PERSONAL_RUNTIME_MISMATCH')
  check(samePath(runtime.userData,this.profile)&&samePath(runtime.sessionData,this.profile),'NORMAL_PERSONAL_PATHS_REQUIRED')
  this.runtime={mainPid:runtime.pid,version:runtime.version,electron:runtime.electron,chromium:runtime.chromium,node:runtime.node,packaged:true,normalUserData:true,normalSessionData:true,diaProcessesNotOperated:true}
  this.eventsPath=join(this.output,'native-events-'+ ++this.launchCount+'.json')
  check(await installPassiveObservation(this.app,this.eventsPath,this.runnerSha256),'PASSIVE_OBSERVER_REQUIRED')
  this.helpEventsPath=join(this.output,'help-events-'+this.launchCount+'.json')
  check(await this.app.evaluate(installHelpObservation,{outputPath:this.helpEventsPath}),'HELP_OBSERVER_REQUIRED')
  check(await this.app.evaluate(installCombinedTrace,{source:combinedControlSource(installControlTraceRuntime),eventsPath:this.eventsPath}),'COMBINED_OBSERVER_REQUIRED')
  this.page=await this.app.firstWindow();this.page.setDefaultTimeout(20000)
  await this.page.waitForFunction(()=>!!window.madness&&!!window.madnessHelp&&!!window.madnessDialogue&&!!window.madnessConnection)
  return this.runtime
 }
 async help(){return this.page.evaluate(()=>window.madnessHelp.read())}
 async helpTrace(){return this.app.evaluate(()=>globalThis.__help22Trace.read())}
}

async function helperDirectories(profile){try{return (await readdir(join(profile,'bmad-help-runs-v1'))).filter(n=>/^operation-[a-f0-9-]{36}$/.test(n)).sort()}catch(e){if(e.code==='ENOENT')return [];throw e}}
async function helperProof(profile,before){
 const root=join(profile,'bmad-help-runs-v1'),proofs=[]
 for(const name of (await helperDirectories(profile)).filter(n=>!before.includes(n))){
  const folder=join(root,name);await noLinks(folder);const terminalPath=join(folder,'terminal.json');await noLinks(terminalPath)
  const bytes=await readFile(terminalPath),terminal=JSON.parse(bytes)
  check(terminal.schemaVersion===1&&/^help-[a-f0-9-]{36}$/.test(terminal.generation)&&terminal.purpose==='bmad-readonly'&&terminal.terminal===true&&terminal.jobActive===0&&(terminal.jobAssigned===true||terminal.neverStarted===true),'HELPER_JOB_STOP_UNPROVEN')
  let execution=null
  try{const path=join(folder,'execution.json');await noLinks(path);const raw=JSON.parse(await readFile(path,'utf8'));execution={outcome:raw.outcome,exit:raw.exit,started:raw.started,jobAssignedBeforeResume:raw.job_assigned_before_resume,jobActiveAfterStop:raw.job_active_after_stop};check(raw.started!==true||raw.job_assigned_before_resume===true&&raw.job_active_after_stop===0,'HELPER_EXECUTION_STOP_UNPROVEN')}catch(e){if(e.code!=='ENOENT')throw e;check(terminal.neverStarted===true,'HELPER_EXECUTION_MISSING')}
  proofs.push({folder:name,terminal,terminalSha256:sha256(bytes),execution})
 }
 const path=join(profile,'bmad-help-owned-v1.json');await noLinks(path);const owner=JSON.parse(await readFile(path,'utf8'))
 check(owner.schemaVersion===1&&owner.purpose==='bmad-readonly'&&owner.status==='stopped'&&samePath(dirname(owner.folder),root),'HELPER_OWNER_STOP_UNPROVEN')
 if(proofs.length)check(proofs.some(p=>p.terminal.generation===owner.generation&&p.folder===basename(owner.folder)),'HELPER_OWNER_GENERATION_UNPROVEN')
 return {owner,proofs}
}

async function until(read,predicate,maximum=720000){const start=Date.now();for(;;){const value=await read();if(predicate(value))return value;check(Date.now()-start<maximum,'HELP_WAIT_TIMEOUT');await delay(250)}}
function preserve(initial,current){for(const name of ['projects','conversations','drafts'])for(const old of initial[name])assert.deepEqual(current[name].find(v=>name==='drafts'?v.projectId===old.projectId:v.id===old.id),old);assert.deepEqual(current.preferences,initial.preferences)}

export async function run({executable,manifest,output,witness,reuseLocalFailure}){
 check(witness&&typeof witness.root==='string'&&typeof witness.id==='string'&&typeof witness.initiative==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(witness.initiative),'OWNED_WITNESS_REQUIRED')
 witness={...witness,root:await realpath(witness.root)};await noLinks(witness.root)
 const markerPath=join(witness.root,'.epic-one-witness.json');await noLinks(markerPath);const marker=JSON.parse(await readFile(markerPath,'utf8'))
 check(marker.owner==='madness-epic-one'&&marker.id===witness.id,'OWNED_WITNESS_MARKER_REQUIRED')
 const destination=await claimOutput(resolve(output)),report={schemaVersion:1,source:'parent-personal-real-codex-siwc',startedAt:new Date().toISOString(),status:'partial',checks:[],limits:['Aucune acceptation humaine globale ni autonomie réseau garantie.','Observation après instrumentation seulement ; aucune lecture/copie du coffre ni capture personnelle.','DIA reconnu par son exécutable exact ; aucun processus DIA arrêté ou modifié.'],cleanup:{closed:false,archived:false}}
 const save=()=>writeFile(join(destination,'report.json'),JSON.stringify(report,null,2)+'\n'),pass=id=>{report.checks.push(id);console.log(id)}
 let session,initial,record,initialHelp,helperBefore
 try{
  await save();report.artifact=await support.verifyArtifact(resolve(executable),resolve(manifest))
  const {findNativeExecutable}=await load('src/adapters/codex/probe.ts'),runner=await findNativeExecutable(process.env.APPDATA)
  const runnerSha256=sha256(await readFile(runner));report.nativeRunnerSha256=runnerSha256
  session=new HelpPersonalSession({artifact:report.artifact,output:destination,runnerSha256})
  report.runtime=await session.launch();helperBefore=await helperDirectories(session.profile);initial=await session.state();initialHelp=await session.help()
  check((await session.dialogue()).status==='idle','EXISTING_ACTIVE_DIALOGUE');check(initialHelp.status==='idle','EXISTING_ACTIVE_HELP')
  const account=await session.page.evaluate(()=>window.madnessConnection.read());check(account.state.accountStored&&!account.state.needsPlanAcknowledgement,'EXISTING_ACCOUNT_UNAVAILABLE');report.accountReadable=true
  pass('normal-profile-account-readable-no-authentication')
  const linked=initial.projects.find(p=>samePath(p.rootPath,witness.root))
  if(linked){
    check(typeof reuseLocalFailure==='string','EXISTING_WITNESS_REQUIRES_PROVEN_LOCAL_FAILURE')
    const previousBytes=await readFile(resolve(reuseLocalFailure)),previous=JSON.parse(previousBytes)
    const localOnlyFailure=previous.failure?.code==='NATIVE_HELP_UNAVAILABLE'&&previous.failureClose?.native?.network===0
    const noModelNetworkFailure=previous.failure?.code==='REAL_HELP_DIALOGUE_FAILED'&&previous.dialogueDiagnostic?.status==='error'&&previous.dialogueDiagnostic?.errorCode==='NETWORK_UNAVAILABLE'&&previous.dialogueDiagnostic?.turnPhase===null&&previous.failureClose?.native?.network===1
    const priorObserverError=previous.failure?.code==='CONTROLLER_FAILED'&&previous.preparationDiagnostic?.status==='ready'&&previous.preparationDiagnostic?.nativeReady===true&&sha256(await readFile(join(dirname(resolve(reuseLocalFailure)),'controller-error-private.txt')))==='da7085a65feb993ee49822f5cab8bda756f9429d2fc9221f964903013458a5e7'
    check(previous.source==='parent-personal-real-codex-siwc'&&previous.status==='failed'&&(localOnlyFailure||noModelNetworkFailure||priorObserverError)&&previous.cleanup?.closed===true,'PRIOR_CLOSED_NO_MODEL_FAILURE_REQUIRED')
    assertClosed(previous.failureClose)
    check(previous.failureClose.native?.children?.length===0&&previous.failureClose.native?.turns?.length===0,'PRIOR_MODEL_ACTIVITY_REFUSED')
    check(!initial.conversations.some(c=>c.context.projectId===linked.id)&&!initialHelp.records.some(r=>r.context.projectId===linked.id),'EXISTING_EXCHANGE_MUST_NOT_BE_REPLAYED')
    check(initial.drafts.find(d=>d.projectId===linked.id)?.text==='Brouillon témoin conservé, jamais envoyé au lancement : '+witness.id,'OWNED_DRAFT_CHANGED')
    const marker=JSON.parse(await readFile(join(witness.root,'.epic-one-witness.json'),'utf8'));check(marker.owner==='madness-epic-one'&&marker.id===witness.id,'OWNED_WITNESS_MARKER_REQUIRED')
    const selected=await session.page.evaluate(id=>window.madness.selectProject(id),linked.id);check(selected.ok&&selected.value.state.activeProjectId===linked.id,'EXISTING_WITNESS_SELECTION_FAILED');session.projectId=linked.id
    report.reusedLocalFailure={path:resolve(reuseLocalFailure),sha256:sha256(previousBytes),kind:localOnlyFailure?'local-read-before-provider':priorObserverError?'observer-configuration-before-provider':'network-before-model',noPreviousModelOrExchange:true,priorNetworkRequests:previous.failureClose.native.network}
    initial={...initial,projects:initial.projects.filter(p=>p.id!==linked.id),drafts:initial.drafts.filter(d=>d.projectId!==linked.id),activeProjectId:initial.activeProjectId===linked.id?initial.projects.find(p=>p.id!==linked.id)?.id??linked.id:initial.activeProjectId}
    pass('owned-local-failure-reused-without-provider-replay')
  }else await session.selectWitness(witness)
  const witnessDraft='Brouillon témoin conservé, jamais envoyé au lancement : '+witness.id
  check((await session.page.evaluate(({id,text})=>window.madness.saveDraft(id,text),{id:session.projectId,text:witnessDraft})).ok,'WITNESS_DRAFT_SAVE_REFUSED')
  const discovered=await session.page.evaluate(id=>window.madnessBmadContext.observe(id),session.projectId),context=discovered.projects.find(p=>p.projectId===session.projectId)
  check(context?.status==='ready'&&context.observation?.activeStatus==='valid'&&context.observation.activeInitiative===witness.initiative,'EXPLICIT_WITNESS_CONTEXT_UNAVAILABLE')
  const chosen=await session.page.evaluate(({id,initiative,revision})=>window.madnessBmadContext.choose(id,initiative,revision),{id:session.projectId,initiative:context.observation.activeInitiative,revision:context.observation.revision}),selected=chosen.projects.find(p=>p.projectId===session.projectId)
  check(selected?.status==='ready'&&selected.storage==='stored'&&selected.selection?.initiativeId===witness.initiative,'EXPLICIT_WITNESS_SELECTION_UNAVAILABLE')
  report.contextSelection=selected.selection;pass('owned-witness-initiative-explicitly-selected-with-native-local-observation')
  const before=await session.observe();check(before.children.length===0&&before.network===0,'SPONTANEOUS_PROVIDER_OR_NETWORK')
  await session.page.evaluate(id=>window.madnessHelp.prepare(id),session.projectId)
  const loaded=await until(()=>session.help(),s=>['ready','error'].includes(s.status));report.preparationDiagnostic={status:loaded.status,error:loaded.error,nativeReady:loaded.bundle?.nativeReady??null,problems:loaded.bundle?.problems??[]};await save();check(loaded.status==='ready'&&loaded.bundle?.nativeReady,'NATIVE_HELP_UNAVAILABLE')
  for(const source of loaded.bundle.sources){const bytes=await readFile(source.source);check(bytes.length===source.bytes&&sha256(bytes)===source.sha256&&bytes.toString('utf8')===source.text,'ACTUAL_ORIGINAL_SOURCE_MISMATCH')}
  const observed=await session.observe();check(observed.children.length===0&&observed.network===0,'LOCAL_HELP_USED_PROVIDER_OR_NETWORK')
  report.preparation={revision:loaded.bundle.revision,diagnostic:loaded.bundle.diagnostic,documents:loaded.bundle.documents.map(d=>({module:d.module,sha256:d.sha256,bytes:d.bytes})),sources:loaded.bundle.sources.length,problems:loaded.bundle.problems,activeInitiative:loaded.bundle.activeInitiative}
  await session.app.evaluate((_electron,ids)=>globalThis.__help22Trace.setAllowedReferences(ids),loaded.bundle.sources.map(s=>s.id))
  pass('actual-native-help-loaded-locally-without-provider')
  await session.page.evaluate(id=>window.madnessDialogue.launchHelp(id),session.projectId)
  let lastIdentityObservation=0
  const ready=await until(async()=>{const sample=await sampleDialogueWithObservation(session,lastIdentityObservation);lastIdentityObservation=sample.observedAt;if(sample.observationError){report.identityObservationGaps??=[];if(report.identityObservationGaps.length<8)report.identityObservationGaps.push(publicFailure(sample.observationError))}return sample.state},s=>s.status==='ready'&&s.turn?.phase==='completed'||['error','unknown','stopped'].includes(s.status))
  report.dialogueDiagnostic={status:ready.status,errorCode:ready.errorCode,turnPhase:ready.turn?.phase??null}
  check(ready.status==='ready'&&!ready.errorCode,'REAL_HELP_DIALOGUE_FAILED')
  const help=await session.help();record=help.records.find(r=>r.conversationId===ready.context.conversationId)
  check(record?.transmission==='transmitted'&&record.outcome==='received'&&record.storage==='stored'&&record.response?.trim(),'NATIVE_RECEIPT_INCOMPLETE')
  const trace=await session.helpTrace();check(!trace.overflow&&trace.pending===0,'HELP_OBSERVER_INCOMPLETE')
  const input=trace.events.find(e=>e.type==='input');check(input?.skill==='bmad'&&input.parts===2&&input.textSha256===sha256('$bmad\nQue faire ensuite ?')&&record.bundle.skillPath===input.skillPath,'REAL_NATIVE_SKILL_INPUT_MISSING')
  for(const receipt of record.tools){const event=trace.events.find(e=>e.type==='tool'&&e.callId===receipt.callId&&e.threadId===receipt.threadId&&e.turnId===receipt.turnId);check(event?.success&&event.rawSha256===receipt.sha256&&sha256(receipt.raw)===receipt.sha256,'RAW_NATIVE_TRANSMISSION_MISMATCH')}
  check(record.tools.find(t=>t.operation==='knowledge')?.raw===record.bundle.knowledgeRaw&&record.tools.find(t=>t.operation==='config')?.raw===record.bundle.configRaw,'NATIVE_RAW_DIFFERS_FROM_CAPTURE')
  const grouped=record.tools.find(t=>t.operation==='read'&&t.reference==='required-context')
  if(grouped){const payload=JSON.parse(grouped.raw),required=record.bundle.sources.filter(s=>!s.snapshot.replaceAll('\\','/').includes('/skills-')||s.snapshot.replaceAll('\\','/').endsWith('/bmad/references/help.md'));assert.deepEqual(payload.sources,required.map(({id,sha256,text})=>({id,sha256,text})));assert.deepEqual(payload.inventories,record.bundle.inventories);for(const source of payload.sources)check(sha256(source.text)===source.sha256,'GROUPED_SOURCE_HASH_MISMATCH')}
  const conversation=(await session.state()).conversations.find(c=>c.id===record.conversationId);check(conversation?.messages[0]?.text==='$bmad\nQue faire ensuite ?','EXACT_HELP_REQUEST_MISSING')
  check(conversation.messages.filter(m=>m.role==='assistant').map(m=>m.text).join('\n\n')===record.response,'RESPONSE_NOT_EXACT')
  check((await session.state()).drafts.find(d=>d.projectId===session.projectId)?.text===witnessDraft,'WITNESS_DRAFT_CHANGED')
  report.conversationId=record.conversationId;report.response={sha256:sha256(record.response),characters:record.response.length,rawNative:true};report.receipts=record.tools.map(t=>({operation:t.operation,reference:t.reference,sha256:t.sha256}));report.helpTrace=trace
  await writeFile(join(destination,'native-response.txt'),record.response,{flag:'wx'})
  report.native=await session.observe();check(report.native.children.length===1,'SINGLE_NATIVE_PROVIDER_REQUIRED');check(report.native.controlTrace.complete,'CONTROL_TRACE_INCOMPLETE')
  pass('real-bmad-native-input-tools-raw-response-and-durable-receipts')
  preserve(initial,await session.state());await session.stop();await session.page.evaluate(id=>window.madness.selectProject(id),initial.activeProjectId)
  report.helperBeforeClose=await helperProof(session.profile,helperBefore);check(report.helperBeforeClose.proofs.length>0,'NO_HELPER_GENERATIONS_OBSERVED');report.firstClose=await session.close();assertClosed(report.firstClose);check(report.firstClose.native?.controlTrace.complete,'CLOSE_TRACE_INCOMPLETE');report.helperAfterClose=await helperProof(session.profile,helperBefore);assert.deepEqual(report.helperAfterClose,report.helperBeforeClose);pass('codex-and-each-helper-generation-closed-without-replay')
  report.reopenedRuntime=await session.launch();await delay(1500)
  const restoredContext=await session.page.evaluate(()=>window.madnessBmadContext.read());assert.deepEqual(restoredContext.projects.find(p=>p.projectId===session.projectId)?.selection,report.contextSelection)
  const restored=await session.help(),again=restored.records.find(r=>r.conversationId===record.conversationId)
  assert.deepEqual(again,record);for(const old of initialHelp.records)assert.deepEqual(restored.records.find(r=>r.conversationId===old.conversationId),old)
  const restoredConversation=(await session.state()).conversations.find(c=>c.id===record.conversationId)
  assert.deepEqual(restoredConversation?.messages,conversation.messages)
  assert.deepEqual(restoredConversation?.context,record.context)
  check((await session.page.evaluate(()=>window.madnessConnection.read())).state.accountStored,'RESTORED_ACCOUNT_UNAVAILABLE')
  preserve(initial,await session.state());const passive=await session.observe(),passiveHelp=await session.helpTrace();check(passive.children.length===0&&passive.network===0&&passiveHelp.spawns===0,'RESTORE_STARTED_HELPER_PROVIDER_OR_NETWORK')
  check((await session.state()).drafts.find(d=>d.projectId===session.projectId)?.text===witnessDraft,'WITNESS_DRAFT_RESTORE_CHANGED')
  pass('exact-passive-restoration-without-helper-model-or-network')
  report.finalClose=await session.close();assertClosed(report.finalClose);check(report.finalClose.native?.controlTrace.complete,'REOPEN_TRACE_INCOMPLETE');assert.deepEqual(await helperProof(session.profile,helperBefore),report.helperAfterClose);report.cleanup.closed=true
  const cleanup=await archiveWitnessData({profile:session.profile,witness:witness.root,projectId:session.projectId,closed:true,reopened:true,assertNoApp:assertClosedProfile})
  const annex=join(session.profile,'bmad-help-v1',record.conversationId+'.json');await noLinks(annex);const bytes=await readFile(annex),value=JSON.parse(bytes)
  check(isDeepStrictEqual(value,record),'CLEANUP_HELP_RECEIPT_CHANGED');await assertClosedProfile()
  const target=join(cleanup.archive,'bmad-help-v1');await mkdir(target)
  await writeFile(join(target,record.conversationId+'.json'),bytes,{flag:'wx',mode:0o600});check(sha256(await readFile(join(target,record.conversationId+'.json')))===sha256(bytes),'HELP_ARCHIVE_MISMATCH');await unlink(annex)
  const contextPath=join(session.profile,'bmad-context-v1',session.projectId+'.json');await noLinks(contextPath);const contextBytes=await readFile(contextPath);assert.deepEqual(JSON.parse(contextBytes),report.contextSelection);await assertClosedProfile();const contextTarget=join(cleanup.archive,'bmad-context-v1');await mkdir(contextTarget);await writeFile(join(contextTarget,session.projectId+'.json'),contextBytes,{flag:'wx',mode:0o600});check(sha256(await readFile(join(contextTarget,session.projectId+'.json')))===sha256(contextBytes),'CONTEXT_ARCHIVE_MISMATCH');await unlink(contextPath)
  report.cleanup={closed:true,archived:true,project:cleanup,helpAnnexes:1,contextAnnexes:1};pass('only-owned-witness-archived-real-projects-and-account-preserved')
  report.status='passed'
 }catch(error){await writeFile(join(destination,'controller-error-private.txt'),String(error?.stack??error),{flag:'wx',mode:0o600});report.failure=publicFailure(error);report.status='failed';if(session?.app){try{report.failureHelpTrace=await session.helpTrace()}catch{};try{report.failureClose=await session.close();report.cleanup.closed=true}catch(closeError){report.failureClose=session.closeReceipts.at(-1)??null;report.closeFailure=publicFailure(closeError);report.cleanup.closed=false}}}
 finally{report.finishedAt=new Date().toISOString();await save()}
 return report
}

if(process.argv.includes('--run')&&process.argv[1]&&samePath(process.argv[1],fileURLToPath(import.meta.url))){
 const option=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3)
 const witness=JSON.parse(await readFile(resolve(option('witness')),'utf8'))
 const result=await run({executable:option('executable'),manifest:option('manifest'),output:option('output'),witness,reuseLocalFailure:option('reuse-local-failure')})
 console.log(JSON.stringify({status:result.status,checks:result.checks.length,failure:result.failure??null,cleanup:result.cleanup}));if(result.status!=='passed')process.exitCode=1
}
