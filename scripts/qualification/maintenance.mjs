// Deux versions du programme, un seul profil SYNTHÉTIQUE possédé, aucun fournisseur.
import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,realpath,lstat,readdir,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash,randomUUID} from 'node:crypto'
import {JsonStore} from '../../src/adapters/persistence/json-store.ts'
import {WorkflowStore} from '../../src/adapters/persistence/workflow-store.ts'
import {QuestionStore} from '../../src/adapters/persistence/question-store.ts'
import {ApprovalStore} from '../../src/adapters/persistence/approval-store.ts'
import {RecoveryStore} from '../../src/adapters/persistence/recovery-store.ts'
import {AppearanceStore} from '../../src/adapters/persistence/appearance-store.ts'
import {holdWindowsFile} from '../../tests/helpers/windows-file-lock.mjs'
const require=createRequire(import.meta.url)
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const defaultOutput=join(repository,'_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-maintenance')
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
const marker='maintenance-workspace.json'
const timestamp='2026-10-27T12:00:00.000Z'
const draft='Brouillon enregistré sous A : été 日本語.\nAucun envoi.'

export function syntheticFixture(root){
 const project=join(root,'project'),other=join(root,'other-project')
 const context={projectId:'project-history',initiativeId:'initiative-temoin',conversationId:'conversation-history',providerId:'codex',connectionId:'synthetic-account'}
 const snapshot={schemaVersion:1,revision:1,projects:[{id:context.projectId,name:'Projet maintenance synthétique',rootPath:project,openedAt:timestamp},{id:'project-other',name:'Second projet synthétique',rootPath:other,openedAt:timestamp}],activeProjectId:context.projectId,drafts:[{projectId:context.projectId,text:'Saisie initiale non envoyée.',savedAt:timestamp}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'unknown',messages:[{id:'invocation-history',role:'user',text:'$bmad-forge-idea'},{id:'assistant-history',role:'assistant',text:'Résultat synthétique exact.\nÉté 日本語 ; acceptation humaine inconnue.'}]}]}
 const workflow={schemaVersion:1,conversationId:context.conversationId,context,invocation:'$bmad-forge-idea',capturedAt:timestamp,rootPath:project,outputBase:join(project,'_bmad-output/initiative-temoin'),contextDigest:'a'.repeat(64),fingerprint:'b'.repeat(64),skillPath:join(project,'.agents/skills/bmad-forge-idea/SKILL.md'),workspace:join(project,'_bmad-output/initiative-temoin/forge-temoin'),outcome:'CLARIFIED',observations:[{id:'observation-history',turnId:'old-turn',operation:'write',phase:'observed',at:timestamp,path:join(project,'livrable.md'),sha256:hash('Livrable synthétique conservé.\n'),bytes:Buffer.byteLength('Livrable synthétique conservé.\n')}]}
 const question={schemaVersion:1,id:'question-history',context,requestId:'request-history',turnId:'old-turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Direction',prompt:'Quelle direction synthétique ?',options:[],allowOther:true}],values:{answer:'Saisie de question conservée sans envoi.'},status:'waiting',reason:null,createdAt:timestamp,expiresAt:null,revision:1,storage:'stored'}
 const approval={schemaVersion:1,id:'approval-history',context,requestId:'request-approval',turnId:'old-turn',identity:{kind:'unknown'},mode:'file-approval',files:[{path:join(project,'livrable.md'),kind:'add',diff:'Livrable synthétique conservé.\n',beforeSha256:null,afterSha256:hash('Livrable synthétique conservé.\n')}],reason:'stopped',adjustment:'Ajustement historique distinct.',adjustmentStatus:'draft',status:'unknown',decision:'accept',transmission:'sent',effect:'unknown',result:null,createdAt:timestamp,expiresAt:1793103000000,revision:3,storage:'stored'}
 // Aucun PID prouvablement disparu : cet état reste réellement non réconciliable.
 const owner={schemaVersion:1,runId:'owned-history',status:'unknown',identity:null}
 return {snapshot,workflow,question,approval,owner}
}

export async function createWorkspace(){
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-maintenance-qualification-')))
 const profile=join(root,'profile'),fixture=syntheticFixture(root)
 try{
  await writeFile(join(root,marker),JSON.stringify({schemaVersion:1,owner:'madness-maintenance',id:randomUUID(),state:'prepared'})+'\n')
  await mkdir(profile);await mkdir(join(root,'project'));await mkdir(join(root,'other-project'))
  await writeFile(join(root,'project/livrable.md'),'Livrable synthétique conservé.\n')
  await mkdir(fixture.workflow.workspace,{recursive:true})
  await writeFile(join(fixture.workflow.workspace,'.memlog.md'),'Journal synthétique exact.\n')
  await writeFile(join(fixture.workflow.workspace,'index.html'),'<!doctype html><title>Résultat synthétique</title><p>CLARIFIED</p>\n')
  await new JsonStore(join(profile,'madness-state-v1.json')).write(fixture.snapshot)
  await new WorkflowStore(join(profile,'workflows-v1')).write(fixture.workflow)
  await new QuestionStore(join(profile,'questions-v1')).write(fixture.question)
  await new ApprovalStore(join(profile,'approvals-v1')).write(fixture.approval)
  const recovery=new RecoveryStore(join(profile,'codex-owned-run-v1.json'));await recovery.read();await recovery.write(fixture.owner)
  await new AppearanceStore(join(profile,'appearance-v1.json')).save('light')
  return root
 }catch(error){
  // Seule cette racine vient du mkdtemp de cet appel : elle peut être incomplète.
  try{await rm(await ownedRoot(root),{recursive:true,force:true,maxRetries:3})}
  catch(cleanupError){throw new AggregateError([error,cleanupError],'WORKSPACE_CREATION_CLEANUP_FAILED',{cause:error})}
  throw error
 }
}

async function ownedRoot(root){
 root=resolve(root)
 const base=await realpath(tmpdir()),actual=await realpath(root)
 const info=await lstat(root)
 if(dirname(actual)!==base||!/^madness-maintenance-qualification-[A-Za-z0-9]+$/.test(basename(actual))||!info.isDirectory()||info.isSymbolicLink())throw Error('WORKSPACE_NOT_OWNED')
 return actual
}
export async function readWorkspace(root){
 const actual=await ownedRoot(root)
 const info=await lstat(join(actual,marker));if(!info.isFile()||info.isSymbolicLink()||info.size>2048)throw Error('WORKSPACE_NOT_OWNED')
 const value=JSON.parse(await readFile(join(actual,marker),'utf8'))
 if(value.schemaVersion!==1||value.owner!=='madness-maintenance'||!['prepared','a-closed','b-closed'].includes(value.state)||!/^[a-f0-9-]{36}$/.test(value.id))throw Error('WORKSPACE_NOT_OWNED')
 // Tous les chemins utilisés sont fixes et les liens intermédiaires sont refusés.
 for(const name of ['profile','project','other-project']){const info=await lstat(join(actual,name));if(!info.isDirectory()||info.isSymbolicLink())throw Error('WORKSPACE_NOT_OWNED')}
 for(const name of ['profile/chromium','profile/codex-connection-v1']){
  try{const info=await lstat(join(actual,name));if(!info.isDirectory()||info.isSymbolicLink())throw Error('WORKSPACE_NOT_OWNED')}
  catch(error){if(error.code!=='ENOENT')throw error}
 }
 return value
}
async function setPhase(root,state){const value=await readWorkspace(root);await writeFile(join(root,marker),JSON.stringify({...value,state})+'\n')}
export async function cleanupWorkspace(root){await readWorkspace(root);await rm(await realpath(root),{recursive:true,force:true,maxRetries:3});return true}

async function ownedTree(root,path){
 const info=await lstat(path);if(info.isSymbolicLink())throw Error('WORKSPACE_NOT_OWNED')
 if(info.isFile())return [{path:path.slice(root.length+1).replaceAll('\\','/'),sha256:hash(await readFile(path)),bytes:info.size}]
 assert.equal(info.isDirectory(),true)
 return (await Promise.all((await readdir(path)).sort().map(name=>ownedTree(root,join(path,name))))).flat()
}
export async function durableFiles(root){
 await readWorkspace(root)
 const names=['profile/madness-state-v1.json','profile/appearance-v1.json','profile/workflows-v1','profile/questions-v1','profile/approvals-v1','profile/codex-owned-run-v1.json','profile/codex-connection-v1/credentials.bin','profile/codex-connection-v1/registration.json','profile/chromium/Local State','project','other-project']
 return (await Promise.all(names.map(name=>ownedTree(root,join(root,name))))).flat().sort((a,b)=>a.path.localeCompare(b.path))
}
export function compareReceipts(a,b){
 assert.equal(a.runtime.version,'0.1.0','A_VERSION_MISMATCH');assert.equal(b.runtime.version,'0.1.1','B_VERSION_MISMATCH')
 for(const r of [a,b]){assert.equal(r.runtime.name,'madness','IDENTITY_MISMATCH');assert.equal(r.runtime.packaged,true,'PACKAGED_REQUIRED');assert.match(r.artifactSha256,/^[a-f0-9]{64}$/)}
 assert.notEqual(a.artifactSha256,b.artifactSha256,'ARTIFACTS_NOT_DISTINCT')
 assert.deepEqual(b.durable,a.durable,'DURABLE_DATA_CHANGED')
}
export function assertReleaseArtifact(phase,sha256,manifest,runnerSha256){
 assert.ok(['a','b'].includes(phase),'INVALID_PHASE')
 if(phase==='a')return assert.equal(sha256,'072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1','A_ARTIFACT_MISMATCH')
 assert.equal(manifest?.version,'0.1.1','B_MANIFEST_MISMATCH')
 assert.deepEqual(manifest.identity,{name:'madness',appId:'fr.madness.desktop',productName:'Madness',executableName:'Madness'},'IDENTITY_MISMATCH')
 assert.equal(manifest.artifacts?.find(a=>a.path==='win-unpacked/resources/app.asar')?.sha256,sha256,'B_ARTIFACT_MISMATCH')
 assert.match(manifest.versions?.electron??'',/^\d+\.\d+\.\d+$/,'B_MANIFEST_MISMATCH')
 const expectedRunner=manifest.artifacts?.find(a=>a.path==='win-unpacked/resources/bmad-script-runner.py')?.sha256
 assert.match(expectedRunner??'',/^[a-f0-9]{64}$/,'B_RUNNER_MISMATCH')
 assert.equal(runnerSha256,expectedRunner,'B_RUNNER_MISMATCH')
}
export function assertReleaseRuntime(runtime,expectedElectron){
 assert.equal(runtime.electron,expectedElectron,'ELECTRON_RUNTIME_MISMATCH')
}

export async function launch(executable,root,expectedElectron='45.0.0'){
 await readWorkspace(root)
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH']
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>allowed.includes(key.toUpperCase())))
 const profile=join(root,'profile')
 const app=await electron.launch({executablePath:executable,args:executable===require('electron')?[repository]:[],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 try{
  const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await page.locator('h1').waitFor()
  const runtime=await app.evaluate(({app})=>({version:app.getVersion(),name:app.getName(),electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged,userData:app.getPath('userData'),sessionData:app.getPath('sessionData')}))
  assertReleaseRuntime(runtime,expectedElectron)
  assert.equal(resolve(runtime.userData),profile);assert.equal(resolve(runtime.sessionData),join(profile,'chromium'))
  assert.equal(resolve(await app.evaluate(({app})=>app.getAppPath())),executable===require('electron')?repository:join(dirname(executable),'resources/app.asar'))
  await app.evaluate(({session})=>{
   globalThis.__maintenanceNetwork=0;globalThis.__maintenanceSpawn=0
   session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_d,cb)=>{globalThis.__maintenanceNetwork++;cb({cancel:true})})
   const cp=process.getBuiltinModule('node:child_process'),original=cp.spawn;cp.spawn=function(...args){globalThis.__maintenanceSpawn++;return original.apply(this,args)}
  })
  return {app,page,runtime}
 }catch(error){await app.close();throw error}
}
async function close(running){if(!running)return;const child=running.app.process();await running.app.close();assert.notEqual(child.exitCode,null,'OWNED_PROCESS_STOP_UNCONFIRMED')}
async function encryptedAccount(app){
 // Données inventées du banc uniquement ; seul un booléen de lecture sort de Main.
 return app.evaluate(async({app,safeStorage})=>{
  const fs=process.getBuiltinModule('node:fs/promises'),path=process.getBuiltinModule('node:path'),root=path.join(app.getPath('userData'),'codex-connection-v1')
  if(!safeStorage.isEncryptionAvailable())throw Error('ENCRYPTION_UNAVAILABLE')
  await fs.mkdir(root,{recursive:true})
  const value={version:1,clientId:'oaiapp_maintenance',subject:'synthetic-maintenance',accessToken:'synthetic-access',refreshToken:'synthetic-refresh',idToken:'synthetic-id',expiresAt:1893456000000,scopes:['openid'],planAcknowledged:true}
  await fs.writeFile(path.join(root,'credentials.bin'),safeStorage.encryptString(JSON.stringify(value)),{mode:0o600})
  await fs.writeFile(path.join(root,'registration.json'),JSON.stringify({version:1,hostId:'urn:uuid:12345678-1234-4123-8123-123456789012',clientId:value.clientId}))
  return true
 })
}
async function inspectRestored(running,root){
 const {app,page}=running
 const state=await page.evaluate(()=>window.madness.readState());assert.equal(state.ok,true)
 const dialogue=await page.evaluate(()=>window.madnessDialogue.read())
 assert.equal(dialogue.turn,null);assert.equal(dialogue.recovery.stop,'unconfirmed');assert.equal(dialogue.errorCode,'STOP_UNCONFIRMED')
 assert.equal(dialogue.questions.length,1);assert.equal(dialogue.questions[0].status,'inactive')
 assert.equal(dialogue.approvals.length,1);assert.equal(dialogue.approvals[0].status,'unknown');assert.equal(dialogue.approvals[0].effect,'unknown')
 assert.deepEqual(dialogue.workflows,[syntheticFixture(root).workflow])
 const connection=(await page.evaluate(()=>window.madnessConnection.read())).state
 assert.equal(connection.status,'unknown');assert.equal(connection.errorCode,'STOP_UNCONFIRMED');assert.equal(connection.accountStored,true);assert.equal(connection.verifiedAt,null)
 const account=await app.evaluate(async({app,safeStorage})=>{
  const bytes=await process.getBuiltinModule('node:fs/promises').readFile(process.getBuiltinModule('node:path').join(app.getPath('userData'),'codex-connection-v1/credentials.bin'))
  const value=JSON.parse(safeStorage.decryptString(bytes));return value.subject==='synthetic-maintenance'&&value.planAcknowledged===true
 });assert.equal(account,true)
 return {state:state.value.state,dialogue}
}
async function verifyHistoricalUi(running){
 const {page}=running
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 await page.locator('#draft').waitFor();assert.equal(await page.locator('#draft').inputValue(),draft)
 assert.equal(await page.getByRole('button',{name:'Envoyer cette réponse',exact:true}).count(),0)
 assert.equal(await page.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).count(),0)
 await page.getByRole('tabpanel',{name:'Conversation',exact:true}).getByRole('region',{name:'Récupérer après une interruption',exact:true}).waitFor()
}

/** Échec disque réel dans le renderer : aucune injection d’erreur ou faux accusé. */
export async function qualifySaveFailure(executable,output){
 const root=await createWorkspace();let running,lock
 try{
  running=await launch(executable,root);const {page}=running
  await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').waitFor()
  const path=join(root,'profile/madness-state-v1.json'),before=await readFile(path),revision=JSON.parse(before).revision
  lock=await holdWindowsFile(path)
  await page.locator('#draft').fill('Saisie visible non enregistrée : été 日本語.')
  await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click()
  await page.getByText('L’enregistrement local a échoué. Votre saisie reste disponible ici. Vérifiez l’espace et les droits d’accès puis réessayez.',{exact:true}).waitFor()
  await page.locator('#draft-status').getByText('Modification non enregistrée.',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).waitFor({state:'visible'})
  await page.waitForFunction(async()=>{const s=await window.madness.readState();return s.ok&&s.value.state.revision===1})
  assert.equal(await page.locator('#draft').inputValue(),'Saisie visible non enregistrée : été 日本語.')
  assert.deepEqual(await readFile(path),before)
  assert.equal((await readdir(join(root,'profile'))).some(n=>n.endsWith('.tmp')),false)
  if(output)await page.screenshot({path:join(output,'save-failure-synthetic.png')})
  await lock.release();lock=null;assert.deepEqual(await readFile(path),before)
  await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click()
  await page.locator('#draft-status').getByText('Brouillon enregistré localement.',{exact:true}).waitFor()
  const after=JSON.parse(await readFile(path));assert.equal(after.revision,revision+1);assert.equal(after.drafts[0].text,'Saisie visible non enregistrée : été 日本語.')
  return {status:'passed',checks:['real-windows-rename-refusal','old-bytes-revision-and-unsaved-ui-preserved','temporary-cleaned','explicit-retry-after-release']}
 }finally{if(lock)await lock.release();await close(running);await cleanupWorkspace(root)}
}

export async function runPhase({phase,executable,workspace,output=defaultOutput,label=phase,keep=false,manifest=join(repository,'dist/maintenance-pilot/release-manifest.json')}){
 output=resolve(output);executable=resolve(executable);assert.match(label,/^[a-zA-Z0-9_-]{1,60}$/)
 await mkdir(output,{recursive:true});let running,root=workspace?resolve(workspace):undefined,artifactVerified=false,expectedElectron='45.0.0'
 const report={schemaVersion:1,phase,startedAt:new Date().toISOString(),status:'partial',checks:[],cleanup:false,limits:['Profil synthétique uniquement ; compte chiffré inventé, aucun consentement ni modèle.','Les conversations/annexes sont des fixtures identifiées ; A sérialise le snapshot complet par les ponts de projets, brouillons et préférences.','Instrumentation réseau/processus installée après démarrage ; aucune connectivité fournisseur fraîche n’est déduite.','L’exécutable est observé ; la preuve de remplacement NSIS doit être jointe séparément par le parent.']}
 try{
  const artifactSha256=hash(await readFile(join(dirname(executable),'resources/app.asar')))
  if(phase==='b'){
   const bytes=await readFile(resolve(manifest)),qualified=JSON.parse(bytes),runnerSha256=hash(await readFile(join(dirname(executable),'resources/bmad-script-runner.py')))
   assertReleaseArtifact(phase,artifactSha256,qualified,runnerSha256);expectedElectron=qualified.versions.electron
   report.manifestSha256=hash(bytes);report.runnerSha256=runnerSha256
  }
  else assertReleaseArtifact(phase,artifactSha256)
  artifactVerified=true
  if(phase==='a'){
   assert.equal(root,undefined,'A_REQUIRES_FRESH_WORKSPACE');root=await createWorkspace()
   running=await launch(executable,root,expectedElectron);assert.equal(running.runtime.version,'0.1.0','A_VERSION_MISMATCH')
   // Dialogue OS contrôlé par le banc ; le vrai Main et son pont enregistrent le projet.
   for(const [name,text]of [['other-project','Second brouillon enregistré sous A.'],['project',draft]]){
    await running.app.evaluate(({dialog},path)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[path]})},join(root,name))
    const chosen=await running.page.evaluate(()=>window.madness.chooseDirectory());assert.equal(chosen.ok,true)
    assert.equal((await running.page.evaluate(({id,text})=>window.madness.saveDraft(id,text),{id:chosen.value.state.activeProjectId,text})).ok,true)
   }
   assert.equal((await running.page.evaluate(()=>window.madness.setNavigation(true))).ok,true)
   assert.equal((await running.page.evaluate(()=>window.madnessAppearance.setTheme('light'))).warning,null)
   await encryptedAccount(running.app);await close(running);running=undefined
   running=await launch(executable,root,expectedElectron)
   report.checks.push('a-snapshot-projects-conversation-messages-drafts-preferences-saved-through-real-bridges','synthetic-safeStorage-account-written-and-reopened-under-a')
  }else{
   assert.equal(phase,'b');assert.ok(root,'B_REQUIRES_WORKSPACE');assert.equal((await readWorkspace(root)).state,'a-closed','A_NOT_CLOSED')
   const a=JSON.parse(await readFile(join(root,'phase-a.json'),'utf8'))
   assert.deepEqual(await durableFiles(root),a.durable,'DATA_CHANGED_BETWEEN_PHASES')
   running=await launch(executable,root,expectedElectron);assert.equal(running.runtime.version,'0.1.1','B_VERSION_MISMATCH')
  }
  const restored=await inspectRestored(running,root)
  report.runtime=running.runtime
  report.artifactSha256=artifactSha256
  const beforeNavigation=await durableFiles(root)
  if(phase==='b'){
   const a=JSON.parse(await readFile(join(root,'phase-a.json'),'utf8'))
   compareReceipts(a,{...report,durable:beforeNavigation})
   assert.deepEqual(restored.state,a.projection,'RESTORED_CONTEXT_CHANGED')
   assert.deepEqual(restored.dialogue,a.dialogueProjection,'RESTORED_ANNEX_PROJECTION_CHANGED')
   report.checks.push('same-complete-durable-bytes-before-navigation','distinct-versions-runtime-and-asar','same-context-and-historical-projections')
  }
  await verifyHistoricalUi(running)
  const counters=await running.app.evaluate(()=>({network:globalThis.__maintenanceNetwork,spawn:globalThis.__maintenanceSpawn}))
  assert.deepEqual(counters,{network:0,spawn:0});report.observedAfterStartup=counters
  await running.page.screenshot({path:join(output,label+'-synthetic.png')})
  report.checks.push('historical-question-and-approval-inactive-owner-still-unknown','synthetic-vault-readable-with-same-local-state','no-network-or-provider-process-after-instrumentation')
  await close(running);running=undefined
  report.durable=await durableFiles(root);assert.deepEqual(report.durable,beforeNavigation,'DATA_CHANGED_AFTER_CLOSE')
  report.projection=restored.state;report.dialogueProjection=restored.dialogue
  report.checks.push('exact-durable-bytes-after-navigation-and-close');report.status='passed'
  await setPhase(root,phase==='a'?'a-closed':'b-closed')
  await writeFile(join(root,'phase-'+phase+'.json'),JSON.stringify(report,null,2)+'\n')
  if(phase==='b'&&!keep){report.cleanup=await cleanupWorkspace(root)}
 }catch(error){report.status='failed';report.failure=error instanceof Error?error.stack:String(error);process.exitCode=1}
 finally{
  try{await close(running);running=undefined}catch{report.status='failed';report.stopUnconfirmed=true;process.exitCode=1}
  if(report.status==='failed'&&root&&artifactVerified&&!keep&&!running){try{report.cleanup=await cleanupWorkspace(root)}catch{report.cleanup=false}}
  report.workspace=root??null;report.finishedAt=new Date().toISOString()
  await writeFile(join(output,label+'.json'),JSON.stringify(report,null,2)+'\n')
 }
 return report
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const option=name=>process.argv.find(v=>v.startsWith('--'+name+'='))?.slice(name.length+3)
 const phase=option('phase'),workspace=option('workspace'),executable=option('executable'),output=option('output')??defaultOutput
 if(phase==='cleanup'){assert.ok(workspace);console.log(JSON.stringify({cleanup:await cleanupWorkspace(workspace)}))}
 else if(phase==='save-failure'){assert.ok(executable);await mkdir(output,{recursive:true});const report=await qualifySaveFailure(resolve(executable),resolve(output));await writeFile(join(output,'save-failure.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))}
 else{assert.ok(executable,'--executable requis');const report=await runPhase({phase,workspace,executable,output,label:option('label')??phase,keep:process.argv.includes('--keep'),...(option('manifest')?{manifest:option('manifest')}:{})});console.log(JSON.stringify({status:report.status,checks:report.checks.length,workspace:report.workspace,cleanup:report.cleanup,failure:report.failure??null}))}
}
