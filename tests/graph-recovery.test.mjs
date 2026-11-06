import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {realpathSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {GraphOwnedRun} from '../src/adapters/analysis/graph-owned-run.ts'
import {GraphCoordinator} from '../src/core/graph-coordinator.ts'
import {validateGraphState} from '../src/contracts/bmad-graph.ts'
const fixture=async()=>{const s=JSON.parse(await readFile('tests/fixtures/bmad-graph/known-normalized.json','utf8')).snapshot,{analysisId,sourceRevision,...scope}=s.identity;return {contractVersion:1,scope,lastEventOrder:2,activity:{phase:'terminal',analysisId,sourceRevision,correlationId:'unknown-attempt',generation:3,outcome:'unknown',stop:'unknown'},result:{status:'partial',snapshot:s,error:null},lastComplete:null,freshness:{status:'changed',sourceRevision,observedAt:null},preservation:{status:'stored',durableAnalysisId:analysisId}}}
const attempt=s=>({contractVersion:1,identity:{...s.scope,analysisId:s.activity.analysisId,sourceRevision:s.activity.sourceRevision},generation:s.activity.generation,correlationId:s.activity.correlationId})
function coordinator(saved,options={}){let disk=structuredClone(saved);const calls={capture:0,analyze:0,accept:0,write:0};const c=new GraphCoordinator({application:{dialogueProject:async id=>({id,rootPath:saved.scope.rootPath})},runtime:{capture:()=>{calls.capture++;throw Error('NO_REPLAY')},analyze:()=>{calls.analyze++;throw Error('NO_REPLAY')},shutdown:async()=>'stopped'},store:{list:async()=>[disk],write:async s=>{calls.write++;if(options.rejectWrite)throw Error('DISK_FULL');disk=structuredClone(s)}},files:{accept:()=>calls.accept++,invalidate:()=>{}},guard:async()=>'clear',onUnknown:options.onUnknown});return {c,calls,disk:()=>disk}}
async function proof(owner,root,value,jobActive=0){const folder=join(root,'run-'+Math.random().toString(16).slice(2)),generation=await owner.begin(folder,value);await writeFile(join(folder,'terminal.json'),JSON.stringify({schemaVersion:1,generation,purpose:'graph-code-only',terminal:true,jobAssigned:true,jobActive,neverStarted:false}));return {generation,folder}}
test('HIGH-1 explicit native recovery reconciles the matching restored unknown without replay, freshness promotion or file authority',async()=>{const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-recovery-')));try{const saved=await fixture();assert.equal(validateGraphState(saved).ok,true);const owner=new GraphOwnedRun(join(root,'owner.json'));const native=await proof(owner,root,attempt(saved));assert.equal(await owner.observeStop(),'stopped');const recovered=await owner.stopProof();assert.equal(recovered.nativeGeneration,native.generation);assert.deepEqual(await new GraphOwnedRun(join(root,'owner.json')).stopProof(),recovered);assert.equal(Object.isFrozen(recovered.attempt.identity),true);const f=coordinator(saved);await f.c.execute({contractVersion:1,correlationId:'read',type:'read'});const before=f.c.read().projects[0];await f.c.reconcileNativeStop(recovered);const after=f.c.read().projects[0];assert.equal(after.activity.stop,'confirmed');assert.equal(after.activity.phase,'historical');assert.equal(after.activity.outcome,'unknown');assert.deepEqual(after.result,before.result);assert.deepEqual(after.lastComplete,before.lastComplete);assert.deepEqual(after.freshness,before.freshness);assert.deepEqual(f.calls,{capture:0,analyze:0,accept:0,write:1});assert.equal(f.disk().activity.stop,'confirmed');await f.c.shutdown()}finally{await rm(root,{recursive:true,force:true})}})
test('HIGH-1 unconfirmed or foreign native generations cannot unlock another logical attempt',async()=>{const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-recovery-')));try{const saved=await fixture(),owner=new GraphOwnedRun(join(root,'owner.json'));const native=await proof(owner,root,attempt(saved),null);assert.equal(await owner.observeStop(),'unknown');assert.equal(await owner.stopProof(),null);await writeFile(join(native.folder,'terminal.json'),JSON.stringify({schemaVersion:1,generation:native.generation,purpose:'graph-code-only',terminal:true,jobAssigned:true,jobActive:0,neverStarted:false}));assert.equal(await owner.observeStop(),'stopped');const recovered=await owner.stopProof();const forged=coordinator(saved);await forged.c.execute({contractVersion:1,correlationId:'read',type:'read'});await forged.c.reconcileNativeStop({...recovered,nativeGeneration:'graph-22222222-2222-2222-2222-222222222222'});assert.equal(forged.c.read().projects[0].activity.stop,'unknown');assert.equal(forged.calls.write,0);await forged.c.shutdown();for(const change of [s=>s.scope.projectId='foreign',s=>s.activity.generation++,s=>s.activity.analysisId='foreign',s=>s.activity.correlationId='foreign']){const other=structuredClone(saved);change(other);if(other.result.snapshot){other.result.snapshot.identity={...other.scope,analysisId:other.activity.analysisId,sourceRevision:other.activity.sourceRevision}}const f=coordinator(other);await f.c.execute({contractVersion:1,correlationId:'read',type:'read'});await f.c.reconcileNativeStop(recovered);assert.equal(f.c.read().projects[0].activity.stop,'unknown');assert.equal(f.calls.write,0);await f.c.shutdown()}}finally{await rm(root,{recursive:true,force:true})}})

test('stale native cancel and confirm cannot affect another generation', async () => {
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-stale-stop-')))
 try {
  const owner=new GraphOwnedRun(join(root,'owner.json')), state=await fixture()
  const first=await proof(owner,root,attempt(state))
  assert.equal(await owner.confirm(first.generation),'stopped')
  const folder=join(root,'new-attempt'), second=await owner.begin(folder,attempt(state))
  await owner.cancel(first.generation)
  await assert.rejects(readFile(join(folder,'cancel')), {code:'ENOENT'})
  await writeFile(join(folder,'terminal.json'), JSON.stringify({schemaVersion:1,generation:second,purpose:'graph-code-only',terminal:true,jobAssigned:true,jobActive:0}))
  assert.equal(await owner.confirm(second),'stopped')
  assert.equal(await owner.confirm(first.generation),'unknown')
 } finally {await rm(root,{recursive:true,force:true})}
})

test('restored logical unknown requests recovery and remains locked until its exact confirmation is saved', async () => {
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-durable-stop-')))
 try {
  const saved=await fixture(),owner=new GraphOwnedRun(join(root,'owner.json'))
  const native=await proof(owner,root,attempt(saved))
  assert.equal(await owner.confirm(native.generation),'stopped')
  const exact=await owner.stopProof()
  let unknown=0
  const options={rejectWrite:true,onUnknown:()=>{unknown++}}
  const f=coordinator(saved,options)
  await f.c.execute({contractVersion:1,correlationId:'read',type:'read'})
  assert.equal(unknown,1)
  assert.equal(await f.c.reconcileNativeStop(exact),false)
  assert.equal(f.c.read().projects[0].activity.stop,'unknown')
  assert.equal(f.c.read().projects[0].preservation.status,'failed')
  assert.equal(f.disk().activity.stop,'unknown')
  await f.c.execute({contractVersion:1,correlationId:'new',type:'generate',projectId:'other',scopeId:'code'})
  assert.equal(f.calls.capture,0)
  assert.equal((await owner.stopProof()).nativeGeneration,native.generation)
  options.rejectWrite=false
  assert.equal(await f.c.reconcileNativeStop(exact),true)
  assert.equal(f.disk().activity.stop,'confirmed')
  assert.equal(f.c.read().projects[0].activity.stop,'confirmed')
  await f.c.shutdown()
 } finally {await rm(root,{recursive:true,force:true})}
})
