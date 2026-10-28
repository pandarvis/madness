// Contrôle du remplacement personnel autorisé ; aucun contenu privé exporté.
import assert from 'node:assert/strict'
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {pathToFileURL} from 'node:url'
const repository=resolve(process.cwd())
const support=await import(pathToFileURL(join(repository,'scripts/qualification/epic-one-support.mjs')))
const {PersonalSession}=await import(pathToFileURL(join(repository,'scripts/qualification/epic-one-personal.mjs')))
const {assertProfileClosed,verifyArtifact,sha256,check,delay,noLinks}=support
const output=join(repository,'_bmad-output/initiative-madness/ux-madness/qualification-refonte/installation')
const manifest=join(repository,'_bmad-output/initiative-madness/ux-madness/qualification-refonte/candidate-reviewed-002/release-manifest.json')
const executable=join(process.env.LOCALAPPDATA,'Programs/Madness/Madness.exe')
const profile=join(process.env.APPDATA,'Madness')
const expectedOld='9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4'
const expectedNew='6664da10ba09364dd5e7584ad812848d48b7bb8f4c48508507434825770684c8'
const beforePath=join(output,'before.json')
async function digests(){
 await assertProfileClosed();await noLinks(profile)
 const files={}
 async function visit(relative){
  const path=join(profile,relative);let info
  try{info=await lstat(path)}catch(e){if(e.code==='ENOENT')return;throw e}
  check(!info.isSymbolicLink(),'PROFILE_LINK_REFUSED')
  if(info.isDirectory())for(const child of(await readdir(path)).sort())await visit(join(relative,child))
  else{check(info.isFile(),'PROFILE_FILE_REQUIRED');files[relative.replaceAll('\\','/')]=sha256(await readFile(path))}
 }
 for(const item of ['madness-state-v1.json','appearance-v1.json','codex-owned-run-v1.json','Local State','codex-connection-v1/credentials.bin','codex-connection-v1/registration.json','questions-v1','approvals-v1','workflows-v1','test-project-archives'])await visit(item)
 return files
}
async function save(name,value){await writeFile(join(output,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'})}
const mode=process.argv[2]
if(mode==='before'){
 const files=await digests();check(files['madness-state-v1.json']&&files['codex-connection-v1/credentials.bin'],'PERSONAL_DATA_REQUIRED')
 const oldAsarSha256=sha256(await readFile(join(process.env.LOCALAPPDATA,'Programs/Madness/resources/app.asar')));check(oldAsarSha256===expectedOld,'OLD_ARTIFACT_CHANGED')
 const candidate=await verifyArtifact(join(repository,'dist/workspace-design-reviewed/win-unpacked/Madness.exe'),manifest);check(candidate.asarSha256===expectedNew,'CANDIDATE_CHANGED')
 const installerSha256=sha256(await readFile(join(repository,'dist/workspace-design-reviewed/Madness-0.1.2-x64-setup.exe')));check(installerSha256==='8f0b4d3ce5591f04723ea70c5acb07f27ea5194df3c260a819766aca57e51539','INSTALLER_CHANGED')
 await assertProfileClosed();await save('before.json',{schemaVersion:1,observedAt:new Date().toISOString(),source:'closed-normal-personal-profile',files,oldAsarSha256,candidate,installerSha256})
 console.log(JSON.stringify({mode,status:'ready',criticalFiles:Object.keys(files).length,oldAsarSha256,candidateAsarSha256:candidate.asarSha256}))
}else if(mode==='after'){
 const before=JSON.parse(await readFile(beforePath)),files=await digests();assert.deepEqual(files,before.files,'REPLACEMENT_DATA_CHANGED')
 const artifact=await verifyArtifact(executable,manifest);check(artifact.asarSha256===expectedNew,'INSTALLED_ARTIFACT_MISMATCH')
 const session=new PersonalSession({artifact,output,runnerSha256:artifact.runnerSha256})
 const report={schemaVersion:1,status:'failed',checks:[],limits:['Fichiers chiffrés : empreintes seulement, aucun déchiffrement ni copie du coffre.','Aucun modèle, OAuth, test réseau ou nouveau projet demandé.','Absence d’activité spontanée mesurée trois secondes après instrumentation uniquement.','La qualification native1.11 reste attachée à son ancien ASAR ; ce contrôle ne la réattribue pas.'],artifact,preservedAtReplacement:Object.keys(files).length}
 const pass=name=>report.checks.push(name)
 pass('closed-profile-critical-bytes-identical-after-replacement')
 try{
  report.runtime=await session.launch();pass('installed-artifact-and-normal-runtime-match')
  const state=await session.state(),dialogue=await session.dialogue()
  check(dialogue.status==='idle'&&dialogue.turn===null&&dialogue.questions.every(q=>!['waiting','sending'].includes(q.status))&&dialogue.approvals.every(a=>!['waiting','sending'].includes(a.status)),'HISTORICAL_REQUEST_ACTIVE');pass('historical-requests-inactive')
  const connection=await session.page.evaluate(()=>window.madnessConnection.read());check(connection.state.accountStored&&!connection.state.needsPlanAcknowledgement,'ACCOUNT_UNAVAILABLE');report.accountReadable=true;pass('existing-account-readable')
  check(await session.page.locator('.topbar').count()===1,'TITLEBAR_MISSING')
  const open=await session.page.getByRole('button',{name:'Ouvrir un projet',exact:true}).count();check(open===1,'OPEN_ACTION_DUPLICATED');pass('new-titlebar-and-single-open-action-present')
  await delay(3000);const observed=await session.observe();check(observed.children.length===0&&observed.network===0,'SPONTANEOUS_ACTIVITY');pass('no-spontaneous-model-or-network-after-hook')
  report.projectNames=state.projects.map(p=>p.name);report.close=await session.close();pass('actual-main-and-owned-spaces-closed')
  const after=await digests(),{['Local State']:localStateBefore,...businessBefore}=before.files,{['Local State']:localStateAfter,...businessAfter}=after
  assert.deepEqual(businessAfter,businessBefore,'DURABLE_DATA_CHANGED_AFTER_REOPEN');report.preservedAfterReopen=Object.keys(businessAfter).length;report.localStateEqualAfterReopen=localStateBefore===localStateAfter;pass('durable-business-data-and-encrypted-account-identical-after-reopen')
  report.status='passed'
 }catch(error){report.failure=support.publicFailure(error);throw error}
 finally{if(session.app)try{report.close=await session.close()}catch{report.closeUnconfirmed=true}await save('report.json',report)}
 console.log(JSON.stringify({mode,status:report.status,checks:report.checks.length,preservedAtReplacement:report.preservedAtReplacement,projectNames:report.projectNames,accountReadable:report.accountReadable,installedAsarSha256:artifact.asarSha256}))
}else throw Error('BEFORE_OR_AFTER_REQUIRED')
