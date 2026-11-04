import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,rm} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {OwnedRun} from '../src/adapters/codex/owned-run.ts'
import {RecoveryStore} from '../src/adapters/persistence/recovery-store.ts'
import {ActivityAdmission} from '../src/core/lifecycle.ts'
import {withCatalogQualification} from '../src/core/bmad-catalog-launch.ts'
import {catalogFixture} from './helpers/catalog-launch-fixture.mjs'
const pause=()=>new Promise(r=>setImmediate(r))
test('qualification uses its own durable preflight batch; unknown survives restart and foreign stop proof',async()=>{
 const root=await mkdtemp(join(tmpdir(),'mcatalog-qualification-owner-')),path=join(root,'qualification.json')
 try{
  const admission=new ActivityAdmission(),owner=new OwnedRun(new RecoveryStore(path)),other=new OwnedRun(new RecoveryStore(join(root,'codex-other.json')))
  const foreign=await other.begin();await other.closed(foreign,true)
  let guardCalls=0
  assert.equal(await withCatalogQualification(admission,async()=>{guardCalls++;assert.equal(await owner.status(),'stopped')},async()=>{assert.equal(JSON.parse(await readFile(path,'utf8')).status,'unknown');assert.equal(admission.activity,'busy');return 'qualified'},{owner,onUnknown:()=>admission.block()}),'qualified')
  assert.equal(guardCalls,1);assert.equal(await owner.status(),'stopped')
  let writingUnknown,releaseWrite;const original=owner.closed.bind(owner)
  owner.closed=async(id,confirmed)=>{if(!confirmed){writingUnknown=true;await new Promise(r=>releaseWrite=r)}return original(id,confirmed)}
  const failure=withCatalogQualification(admission,async()=>assert.equal(await owner.status(),'stopped'),async()=>{throw Object.assign(Error('native stop lost'),{code:'STOP_UNCONFIRMED'})},{owner,onUnknown:()=>admission.block()})
  while(!writingUnknown)await pause();assert.equal(admission.activity,'blocked')
  const restored=new OwnedRun(new RecoveryStore(path));assert.equal(await restored.status(),'unknown');assert.equal(await restored.closed(foreign,true),false);assert.equal(await restored.observeStop(),'unknown');assert.equal(await other.observeStop(),'stopped')
  assert.throws(()=>admission.enter('helper'),{code:'STOP_UNCONFIRMED'});assert.throws(()=>admission.enter('provider'),{code:'STOP_UNCONFIRMED'})
  releaseWrite();await assert.rejects(failure,{code:'STOP_UNCONFIRMED'});assert.equal(await owner.status(),'unknown');assert.equal(await owner.observeStop(),'unknown')
 }finally{await rm(root,{recursive:true,force:true})}
})
for(const stopKnown of [true,false])test('live qualification recovery aborts and drains its own work before a private stop result '+stopKnown,async()=>{
 const root=await mkdtemp(join(tmpdir(),'mcatalog-qualification-drain-')),path=join(root,'qualification.json'),owner=new OwnedRun(new RecoveryStore(path)),admission=new ActivityAdmission()
 const f=await catalogFixture();let started=false,aborted=false,releaseStop,finished=false
 f.deps.qualify=async(_family,_id,_root,signal)=>withCatalogQualification(admission,async()=>assert.equal(await owner.status(),'stopped'),async()=>{started=true;await new Promise(r=>signal.addEventListener('abort',()=>{aborted=true;releaseStop=r},{once:true}));throw Object.assign(Error('qualification cancelled'),{code:stopKnown?'CANCELLED':'STOP_UNCONFIRMED'})},{owner,onUnknown:()=>admission.block()})
 try{
  const preparing=f.prepare();while(!started)await pause()
  const recovery=f.launch.stopQualification().then(()=>finished=true);while(!aborted)await pause();assert.equal(finished,false);assert.equal(await owner.status(),'unknown')
  releaseStop();await recovery;await preparing;assert.equal(finished,true);assert.equal(f.counts().opens,0);assert.equal(await owner.status(),stopKnown?'stopped':'unknown')
  const restored=new OwnedRun(new RecoveryStore(path));assert.equal(await restored.observeStop(),stopKnown?'stopped':'unknown');assert.equal(admission.activity,stopKnown?'clear':'blocked')
 }finally{await f.shutdown();await rm(root,{recursive:true,force:true})}
})

test('native Mary/Forge open routes its prequalification through the private owner before any profile read',async()=>{
 const {openCodexDialogue}=await import('../src/adapters/codex/dialogue.ts')
 for(const kind of [undefined,'forge']){
  let wrapped=0,acquired=0
  const profile={rootPath:'C:/not-read-by-test',skillPath:'C:/not-read-by-test/SKILL.md',fingerprint:'a'.repeat(64),...(kind?{kind,forge:{outputBase:'C:/not-read-by-test/out',initiativeId:null,contextDigest:'b'.repeat(64)}}:{})}
  await assert.rejects(openCodexDialogue(profile,new AbortController().signal,()=>{},{acquireDialogue:async()=>{acquired++;throw Error('MUST_NOT_ACQUIRE')}},{root:'C:/isolated',appData:'C:/isolated',repository:'C:/repo',environment:{},qualification:async work=>{wrapped++;assert.equal(typeof work,'function');throw Object.assign(Error('private qualification blocked'),{code:'STOP_UNCONFIRMED'})}}),{code:'STOP_UNCONFIRMED'})
  assert.equal(wrapped,1);assert.equal(acquired,0)
 }
})
test('native help open retains its existing helper owner instead of borrowing qualification identity',async()=>{
 const {openCodexDialogue}=await import('../src/adapters/codex/dialogue.ts');let wrapped=0,helpChecks=0
 await assert.rejects(openCodexDialogue({rootPath:'C:/help',skillPath:'C:/help/SKILL.md',fingerprint:'a'.repeat(64),kind:'help',help:{bundleId:'help-only',initiativeId:null}},new AbortController().signal,()=>{},{},{root:'C:/isolated',appData:'C:/isolated',repository:'C:/repo',environment:{},qualification:async()=>{wrapped++;throw Error('MUST_NOT_BORROW')},helpAdapter:{host:()=>({assertFresh:async()=>{helpChecks++;throw Object.assign(Error('owned helper refuses'),{code:'PROFILE_CHANGED'})}})}}),{code:'PROFILE_CHANGED'})
 assert.equal(wrapped,0);assert.equal(helpChecks,1)
})
