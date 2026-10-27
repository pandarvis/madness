import assert from 'node:assert/strict'
import {test,mock} from 'node:test'
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm,lstat,realpath,symlink,unlink} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,dirname,basename} from 'node:path'
import {createRequire,syncBuiltinESMExports} from 'node:module'
import {JsonStore} from '../src/adapters/persistence/json-store.ts'
import {Application} from '../src/core/application.ts'
import {AppearanceStore} from '../src/adapters/persistence/appearance-store.ts'
import {WorkflowStore} from '../src/adapters/persistence/workflow-store.ts'
import {QuestionStore} from '../src/adapters/persistence/question-store.ts'
import {ApprovalStore} from '../src/adapters/persistence/approval-store.ts'
import {RecoveryStore} from '../src/adapters/persistence/recovery-store.ts'
import {holdWindowsFile} from './helpers/windows-file-lock.mjs'
const maintenance=await import('../scripts/qualification/maintenance.mjs').catch(()=>null)
async function temporary(t){const root=await mkdtemp(join(tmpdir(),'madness-maintenance-test-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));return root}

test('le banc refuse un espace arbitraire et conserve son profil entre A et B',async t=>{
 assert.ok(maintenance,'Le banc permanent doit exister');const root=await temporary(t)
 await assert.rejects(maintenance.readWorkspace(root),/NOT_OWNED/)
 const workspace=await maintenance.createWorkspace();t.after(()=>maintenance.cleanupWorkspace(workspace))
 const fixture=await maintenance.readWorkspace(workspace)
 assert.equal(fixture.schemaVersion,1);assert.equal(fixture.state,'prepared')
 assert.equal((await new QuestionStore(join(workspace,'profile/questions-v1')).read()).length,1)
 assert.equal((await new WorkflowStore(join(workspace,'profile/workflows-v1')).read()).length,1)
})
test('les deux reçus exigent identités, ASAR et versions distinctes avant comparaison',()=>{
 assert.ok(maintenance)
 const a={runtime:{version:'0.1.0',name:'madness',packaged:true},artifactSha256:'a'.repeat(64),durable:[{path:'madness-state-v1.json',sha256:'x'}]}
 const b={...structuredClone(a),runtime:{...a.runtime,version:'0.1.1'},artifactSha256:'b'.repeat(64)}
 assert.doesNotThrow(()=>maintenance.compareReceipts(a,b))
 for(const invalid of [{...b,runtime:a.runtime},{...b,artifactSha256:a.artifactSha256},{...b,durable:[]},{...b,runtime:{...b.runtime,name:'foreign'}}])assert.throws(()=>maintenance.compareReceipts(a,invalid))
})
test('un exécutable de même version avec un autre ASAR est refusé avant lancement',()=>{
 assert.ok(maintenance);assert.equal(typeof maintenance.assertReleaseArtifact,'function')
 const a='072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1'
 const b='b'.repeat(64),runner='c'.repeat(64),manifest={version:'0.1.1',versions:{electron:'45.0.0'},identity:{name:'madness',appId:'fr.madness.desktop',productName:'Madness',executableName:'Madness'},artifacts:[{path:'win-unpacked/resources/app.asar',sha256:b},{path:'win-unpacked/resources/bmad-script-runner.py',sha256:runner}]}
 assert.doesNotThrow(()=>maintenance.assertReleaseArtifact('a',a))
 assert.doesNotThrow(()=>maintenance.assertReleaseArtifact('b',b,manifest,runner))
 assert.throws(()=>maintenance.assertReleaseArtifact('a',b),/A_ARTIFACT_MISMATCH/)
 assert.throws(()=>maintenance.assertReleaseArtifact('b',a,manifest,runner),/B_ARTIFACT_MISMATCH/)
 assert.throws(()=>maintenance.assertReleaseArtifact('b',b,{...manifest,identity:{...manifest.identity,appId:'changed'}},runner),/IDENTITY_MISMATCH/)
 assert.throws(()=>maintenance.assertReleaseArtifact('b',b,manifest,'d'.repeat(64)),/B_RUNNER_MISMATCH/)
 assert.throws(()=>maintenance.assertReleaseArtifact('b',b,manifest),/B_RUNNER_MISMATCH/)
 assert.doesNotThrow(()=>maintenance.assertReleaseRuntime({electron:'45.0.0'},manifest.versions.electron))
 assert.throws(()=>maintenance.assertReleaseRuntime({electron:'44.0.0'},manifest.versions.electron),/ELECTRON_RUNTIME_MISMATCH/)
})
test('les échecs précoces de création nettoient la racine possédée sans masquer leur cause',async t=>{
 const nativeFs=createRequire(import.meta.url)('node:fs/promises'),leftovers=[]
 t.after(async()=>{for(const root of leftovers){try{await lstat(root)}catch(e){if(e.code==='ENOENT')continue;throw e}assert.equal(dirname(await realpath(root)),await realpath(tmpdir()));assert.match(basename(root),/^madness-maintenance-qualification-/);await rm(root,{recursive:true,force:true,maxRetries:3})}})
 for(const failure of ['marker','profile','project']){
  const operation=failure==='marker'?'writeFile':'mkdir',original=nativeFs[operation],cause=new Error('early-'+failure);let root
  const mocked=mock.method(nativeFs,operation,async(path,...args)=>{
   if(basename(String(path))===(failure==='marker'?'maintenance-workspace.json':failure)){root=dirname(String(path));leftovers.push(root);throw cause}
   return original(path,...args)
  });syncBuiltinESMExports()
  try{await assert.rejects(maintenance.createWorkspace(),error=>error===cause)}finally{mocked.mock.restore();syncBuiltinESMExports()}
  assert.ok(root);await assert.rejects(lstat(root),{code:'ENOENT'})
 }
 const supplied=await mkdtemp(join(tmpdir(),'madness-maintenance-qualification-'));leftovers.push(supplied)
 await assert.rejects(maintenance.readWorkspace(supplied))
 await assert.rejects(maintenance.cleanupWorkspace(supplied))
 assert.equal((await lstat(supplied)).isDirectory(),true,'un workspace fourni incomplet reste refusé et intact')
})
test('les jonctions intermédiaires du coffre et de Chromium sont refusées avant lecture et lancement',async t=>{
 const workspace=await maintenance.createWorkspace(),outside=await temporary(t),profile=join(workspace,'profile')
 t.after(()=>maintenance.cleanupWorkspace(workspace))
 const contents={'Local State':'Local State synthétique extérieur','credentials.bin':'Coffre synthétique extérieur','registration.json':'Inscription synthétique extérieure'}
 for(const [name,content]of Object.entries(contents))await writeFile(join(outside,name),content)
 for(const name of ['chromium','codex-connection-v1']){
  const path=join(profile,name);await symlink(outside,path,process.platform==='win32'?'junction':'dir')
  try{
   await assert.rejects(maintenance.readWorkspace(workspace),/WORKSPACE_NOT_OWNED/)
   await assert.rejects(maintenance.durableFiles(workspace),/WORKSPACE_NOT_OWNED/)
   await assert.rejects(maintenance.launch('C:/synthetic-never-started.exe',workspace),/WORKSPACE_NOT_OWNED/)
  }finally{await unlink(path)}
  for(const [file,content]of Object.entries(contents))assert.equal(await readFile(join(outside,file),'utf8'),content)
 }
})
test('la matrice v1, futur, corruption et UTF-8 protège tous les fichiers métier',async t=>{
 assert.ok(maintenance);const root=await temporary(t),fixture=maintenance.syntheticFixture(root)
 const entries=[
  {file:'snapshot.json',value:fixture.snapshot,store:p=>new JsonStore(p),read:s=>s.read(),write:(s,v)=>s.write(v)},
  {file:'appearance.json',value:{schemaVersion:1,theme:'light'},store:p=>new AppearanceStore(p),read:s=>s.restore(),write:(s,v)=>s.save(v.theme),appearance:true},
  {file:'workflows/conversation-history.json',value:fixture.workflow,store:p=>new WorkflowStore(join(root,'workflows')),read:s=>s.read(),write:(s,v)=>s.write(v)},
  {file:'questions/question-history.json',value:fixture.question,store:p=>new QuestionStore(join(root,'questions')),read:s=>s.read(),write:(s,v)=>s.write(v)},
  {file:'approvals/approval-history.json',value:fixture.approval,store:p=>new ApprovalStore(join(root,'approvals')),read:s=>s.read(),write:(s,v)=>s.write(v)},
  {file:'owner.json',value:fixture.owner,store:p=>new RecoveryStore(p),read:s=>s.read(),write:(s,v)=>s.write(v)}
 ]
 for(const entry of entries){
  const path=join(root,entry.file);await mkdir(join(path,'..'),{recursive:true})
  const good=Buffer.from(JSON.stringify(entry.value));await writeFile(path,good);const valid=entry.store(path);await entry.read(valid);await entry.write(valid,entry.value)
  for(const bytes of [Buffer.from(JSON.stringify({...entry.value,schemaVersion:999})),Buffer.from('{cassé'),Buffer.from([0xc0,0x80])]){
   await writeFile(path,bytes);const store=entry.store(path)
   if(entry.appearance){assert.equal((await entry.read(store)).warning,'read-failed');assert.equal((await entry.write(store,entry.value)).warning,'save-failed')}
   else{await assert.rejects(entry.read(store));await assert.rejects(entry.write(store,entry.value))}
   assert.deepEqual(await readFile(path),bytes,entry.file+' intact')
  }
 }
})
test('un vrai refus Windows de rename conserve octets et révision, nettoie puis accepte un retry explicite',{skip:process.platform!=='win32'},async t=>{
 assert.ok(maintenance);const root=await temporary(t),path=join(root,'snapshot.json'),value=maintenance.syntheticFixture(root).snapshot
 await writeFile(path,JSON.stringify(value));const before=await readFile(path)
 const app=new Application({store:new JsonStore(path),chooseDirectory:async()=>null,newId:()=> 'unused',now:()=>new Date().toISOString()})
 const command={contractVersion:1,correlationId:'maintenance-lock',type:'save-draft',projectId:'project-history',text:'Saisie non durable été 日本語.'}
 const lock=await holdWindowsFile(path)
 try{const reply=await app.execute(command);assert.equal(reply.ok,false);assert.equal(reply.error.code,'STORAGE_WRITE_FAILED');assert.deepEqual(await readFile(path),before);assert.deepEqual(await readdir(root),['snapshot.json']);const state=await app.execute({contractVersion:1,correlationId:'maintenance-read',type:'read-state'});assert.equal(state.value.state.revision,value.revision)}finally{await lock.release()}
 assert.deepEqual(await readFile(path),before,'aucune reprise automatique après libération')
 assert.equal((await app.execute(command)).ok,true);const after=JSON.parse(await readFile(path));assert.equal(after.revision,value.revision+1);assert.equal(after.drafts[0].text,command.text)
})
test('le renderer garde la saisie non durable après le même refus Windows et attend un nouveau clic',{skip:process.platform!=='win32'},async()=>{
 assert.ok(maintenance)
 const result=await maintenance.qualifySaveFailure(createRequire(import.meta.url)('electron'))
 assert.equal(result.status,'passed');assert.ok(result.checks.includes('old-bytes-revision-and-unsaved-ui-preserved'))
})
test('un autre Electron réellement démarré est refusé puis fermé avant utilisation du profil',async t=>{
 const workspace=await maintenance.createWorkspace();t.after(()=>maintenance.cleanupWorkspace(workspace))
 await assert.rejects(maintenance.launch(createRequire(import.meta.url)('electron'),workspace,'44.0.0'),/ELECTRON_RUNTIME_MISMATCH/)
 assert.equal((await maintenance.readWorkspace(workspace)).state,'prepared')
})
