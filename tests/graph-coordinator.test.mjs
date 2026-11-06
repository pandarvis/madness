import test from 'node:test'
import assert from 'node:assert/strict'
import {GraphCoordinator} from '../src/core/graph-coordinator.ts'
import {validateGraphState,isGraphWorkspace,GRAPH_PROFILE} from '../src/contracts/bmad-graph.ts'
const hash='a'.repeat(64),scope={projectId:'p',rootPath:'C:/p',rootIdentity:'physical-root',scopeId:'code',scopeRevision:hash},corpus=[{relativePath:'a.ts',sha256:hash,lineCount:2,kind:'file'}]
const capture={...scope,revision:hash,observedAt:'2026-11-04T12:00:00.000Z',sources:[{id:'source-a',path:'C:/p/a.ts',sha256:hash,bytes:20}],corpus,excluded:[]}
function setup(persistence,guard=async()=>'clear'){let fail=false,analyses=0,captures=0,stored=null,accepted=0;const runtime={scopeRevision:hash,coverage:{included:['code'],excluded:['config']},capture:async()=>{captures++;return capture},facts:()=>({sourceState:'unchanged',observedAt:capture.observedAt}),analyze:async(r,observe)=>{analyses++;const snapshot={schemaVersion:1,identity:r.identity,provenance:{profile:GRAPH_PROFILE,tool:'graphifyy',toolVersion:'0.9.101',nativeSchemaVersion:1,artifact:'clustered-node-link',nativeSha256:hash,assemblyRevision:hash,normalizerVersion:1},collectedAt:capture.observedAt,coverage:{...r.coverage,status:'complete',limitations:[]},sources:corpus,nodes:[{id:'a',label:'a',kind:'function',reference:{status:'known',relativePath:'a.ts',line:{status:'unknown',reason:'absent'}}}],relations:[]};const base={contractVersion:1,correlationId:r.correlationId,identity:r.identity,generation:r.generation};observe({...base,type:'result',order:1,snapshot});observe({...base,type:'stopped',order:2,reason:'complete',stop:'confirmed'})},shutdown:async()=>'stopped'};const store=persistence??{list:async()=>stored?[stored]:[],write:async v=>{if(fail)throw Error('DISK_FULL');stored=structuredClone(v)}};const application={dialogueProject:async()=>({id:'p',rootPath:'C:/p'})};const coordinator=new GraphCoordinator({application,runtime,store,files:{accept:()=>accepted++,invalidate:()=>{}},guard});return {coordinator,fail:v=>fail=v,counts:()=>({analyses,captures,accepted}),stored:()=>stored,runtime,application}}
const command=type=>({contractVersion:1,correlationId:'test-'+type,type,...(type==='read'?{}:{projectId:'p',scopeId:'code'})})
test('generation admits the original corpus only after normalized result and keeps unsaved session distinct',async()=>{const f=setup();f.fail(true);await f.coordinator.execute(command('generate'));let s=f.coordinator.read().projects[0];assert.equal(s.result.status,'complete');assert.equal(s.activity.stop,'confirmed');assert.equal(s.preservation.status,'failed');assert.equal(f.stored(),null);assert.deepEqual(f.counts(),{analyses:1,captures:1,accepted:1});f.fail(false);await f.coordinator.execute(command('retry-save'));s=f.coordinator.read().projects[0];assert.equal(s.preservation.status,'stored');assert.equal(f.stored().lastComplete.identity.analysisId,s.lastComplete.identity.analysisId);assert.deepEqual(f.counts(),{analyses:1,captures:1,accepted:1});await f.coordinator.shutdown()})
test('restoration stays passive and historical without granting any file authority',async()=>{const f=setup();await f.coordinator.execute(command('generate'));const disk=f.stored(),counts=f.counts();const c=new GraphCoordinator({application:{dialogueProject:async()=>({id:'p',rootPath:'C:/p'})},runtime:{...f.runtime,capture:()=>{throw Error('passive capture')}},store:{list:async()=>[disk],write:()=>{throw Error('passive write')}},files:{accept:()=>{throw Error('passive grant')},invalidate:()=>{}},guard:async()=>'clear'});await c.execute(command('read'));const s=c.read().projects[0];assert.equal(s.activity.phase,'historical');assert.equal(s.freshness.status,'unverified');assert.deepEqual(f.counts(),counts);await c.shutdown();await f.coordinator.shutdown()})
test('foreign terminal result cannot gain corpus authority and previous complete remains',async()=>{const f=setup();await f.coordinator.execute(command('generate'));const previous=f.coordinator.read().projects[0].lastComplete;f.runtime.analyze=async(r,observe)=>{observe({contractVersion:1,correlationId:r.correlationId,identity:{...r.identity,projectId:'foreign'},generation:r.generation,type:'stopped',order:1,reason:'complete',stop:'confirmed'})};await f.coordinator.execute(command('generate'));assert.equal(f.coordinator.read().projects[0].lastComplete.identity.analysisId,previous.identity.analysisId);assert.equal(f.counts().accepted,1);await f.coordinator.shutdown()})

test('explicit source revalidation grants only the matching original revision without rerunning analysis',async()=>{const f=setup();await f.coordinator.execute(command('generate'));await f.coordinator.execute(command('revalidate-files'));assert.deepEqual(f.counts(),{analyses:1,captures:2,accepted:2});assert.equal(f.coordinator.read().fileBindings[0].sourceId,'source-a');await f.coordinator.shutdown()})

test('changed explicit revalidation removes old corpus bindings and marks freshness changed',async()=>{const f=setup();await f.coordinator.execute(command('generate'));f.runtime.capture=async()=>({...capture,revision:'b'.repeat(64)});await f.coordinator.execute(command('revalidate-files'));const w=f.coordinator.read();assert.equal(w.fileBindings.length,0);assert.equal(w.projects[0].freshness.status,'changed');await f.coordinator.shutdown()})

test('failed source revalidation has unknown freshness rather than claiming an observed mutation',async()=>{const f=setup();await f.coordinator.execute(command('generate'));f.runtime.capture=async()=>{throw Error('ACCESS_REFUSED')};await f.coordinator.execute(command('revalidate-files'));assert.equal(f.coordinator.read().projects[0].freshness.status,'unverified');await f.coordinator.shutdown()})

test('registered project changing during explicit source recapture cannot gain authority',async()=>{const f=setup();await f.coordinator.execute(command('generate'));let calls=0;f.application.dialogueProject=async()=>({id:'p',rootPath:++calls===1?'C:/p':'C:/other'});await f.coordinator.execute(command('revalidate-files'));assert.equal(f.counts().accepted,1);assert.equal(f.coordinator.read().fileBindings.length,0);await f.coordinator.shutdown()})

test('interrupting preparation cancels its owned capture without starting Graphify',{timeout:2000},async()=>{const f=setup();let started;const entered=new Promise(r=>started=r);f.runtime.capture=async(id,root,signal)=>new Promise((resolve,reject)=>{started();signal.addEventListener('abort',()=>reject(Error('ABORTED')),{once:true})});const generating=f.coordinator.execute(command('generate'));await entered;await f.coordinator.execute({...command('interrupt'),analysisId:'preparing'});await generating;assert.equal(f.counts().analyses,0);assert.ok(f.coordinator.read().issues[0].reason.includes('interrompue'));await f.coordinator.shutdown()})


test('complete then failed can revalidate only the retained complete without changing failure or starting analysis, and generate again',async()=>{const f=setup(),analyze=f.runtime.analyze;await f.coordinator.execute(command('generate'));const complete=f.coordinator.read().projects[0].lastComplete;let failedRequest;f.runtime.analyze=async(r,observe)=>{failedRequest=r;const base={contractVersion:1,correlationId:r.correlationId,identity:r.identity,generation:r.generation};observe({...base,type:'failed',order:1,error:{code:'ANALYSIS_FAILED',messageKey:'graph.error.analysis_failed',outcome:'failed',recovery:'retry-after-check'}});observe({...base,type:'stopped',order:2,reason:'failed',stop:'confirmed'})};await f.coordinator.execute(command('generate'));const failure=f.coordinator.read().projects[0],counts=f.counts();assert.equal(failure.result.status,'failed');assert.equal(failure.result.snapshot,null);assert.equal(failure.activity.generation,2);await f.coordinator.execute(command('revalidate-files'));const w=f.coordinator.read(),s=w.projects[0];assert.equal(validateGraphState(s).ok,true,JSON.stringify(validateGraphState(s)));assert.equal(isGraphWorkspace(w),true);assert.deepEqual(s.activity,failure.activity);assert.deepEqual(s.result,failure.result);assert.deepEqual(s.lastComplete,complete);assert.equal(s.freshness.status,'unverified');assert.equal(f.counts().analyses,counts.analyses);assert.equal(f.counts().captures,counts.captures+1);assert.ok(w.fileBindings.length);assert.ok(w.fileBindings.every(b=>b.analysisId===complete.identity.analysisId&&b.revision===complete.identity.sourceRevision&&b.analysisId!==failedRequest.identity.analysisId));f.runtime.analyze=analyze;await f.coordinator.execute(command('generate'));const next=f.coordinator.read().projects[0];assert.equal(next.activity.generation,3);assert.equal(next.result.status,'complete');assert.equal(isGraphWorkspace(f.coordinator.read()),true);await f.coordinator.shutdown()})

test('changed revision and mutation keep each project and prior complete separate through passive reopen', async () => {
 const disk = new Map()
 const persistence = {list: async () => [...disk.values()], write: async value => disk.set(value.scope.projectId, structuredClone(value))}
 const f = setup(persistence)
 let refreshed = false, phase = 'unchanged', during
 const revisedAt = '2026-11-05T12:00:00.000Z'
 f.application.dialogueProject = async id => ({id,rootPath:'C:/'+id})
 f.runtime.capture = async (id,rootPath) => ({
  ...capture, projectId:id, rootPath, rootIdentity:'physical-'+id,
  sources:[{...capture.sources[0],id:'source-'+id,path:rootPath+'/a.ts'}],
  revision:id==='p'&&refreshed?'b'.repeat(64):hash, observedAt:refreshed?revisedAt:capture.observedAt
 })
 f.runtime.facts = () => ({sourceState:phase,observedAt:refreshed?revisedAt:capture.observedAt})
 const analyze = f.runtime.analyze
 f.runtime.analyze = async (request,observe) => {
  if (refreshed) during = f.coordinator.read()
  await analyze(request,e => {
   if (refreshed && e.type==='result') phase = 'changed'
   observe(e)
   phase = 'unchanged'
  })
 }
 await f.coordinator.execute(command('generate'))
 await f.coordinator.execute({...command('generate'),projectId:'q'})
 const first = f.coordinator.read()
 const p = first.projects.find(s => s.scope.projectId==='p').lastComplete
 const q = first.projects.find(s => s.scope.projectId==='q').lastComplete
 refreshed = true
 await f.coordinator.execute(command('generate'))
 const current = f.coordinator.read()
 const currentP = current.projects.find(s => s.scope.projectId==='p')
 assert.equal(during.projects.find(s => s.scope.projectId==='p').freshness.status,'changed')
 assert.deepEqual(during.fileBindings.map(b => b.projectId),['q'])
 assert.deepEqual(current.fileBindings.map(b => b.projectId),['q'])
 assert.deepEqual(currentP.lastComplete,p)
 assert.deepEqual(current.projects.find(s => s.scope.projectId==='q').lastComplete,q)
 assert.equal(currentP.freshness.status,'changed')
 assert.notEqual(currentP.result.snapshot.identity.sourceRevision,p.identity.sourceRevision)
 const reopened = new GraphCoordinator({application:f.application,store:persistence,runtime:{
  ...f.runtime,capture:() => assert.fail('passive capture'),analyze:() => assert.fail('passive analysis')
 },files:{accept:() => assert.fail('passive grant'),invalidate:()=>{}},guard:async ()=>'clear'})
 const restored = await reopened.execute(command('read'))
 assert.deepEqual(restored.fileBindings,[])
 assert.equal(restored.projects.find(s=>s.scope.projectId==='p').freshness.status,'changed')
 assert.equal(restored.projects.find(s=>s.scope.projectId==='q').freshness.status,'unverified')
 assert.deepEqual(restored.projects.find(s=>s.scope.projectId==='p').lastComplete,p)
 await reopened.shutdown()
 await f.coordinator.shutdown()
})

test('an older stored scope is readable but cannot grant original files under a new runtime profile', async () => {
 const f = setup()
 await f.coordinator.execute(command('generate'))
 const older = f.stored()
 const restored = new GraphCoordinator({application:f.application,store:{list:async()=>[older]},runtime:{
  ...f.runtime,scopeRevision:'f'.repeat(64)
 },files:{accept:()=>assert.fail('older profile grant'),invalidate:()=>{}},guard:async ()=>'clear'})
 const result = await restored.execute(command('revalidate-files'))
 assert.equal(f.counts().captures,1)
 assert.deepEqual(result.fileBindings,[])
 assert.deepEqual(result.projects[0].lastComplete,older.lastComplete)
 await restored.shutdown()
 await f.coordinator.shutdown()
})

test('explicit revalidation persists the mismatch and its actual date', async () => {
 const f = setup()
 await f.coordinator.execute(command('generate'))
 const date = '2026-11-05T09:00:00.000Z'
 f.runtime.capture = async () => ({...capture,revision:'b'.repeat(64),observedAt:date})
 await f.coordinator.execute(command('revalidate-files'))
 assert.deepEqual(f.stored().freshness,{status:'changed',sourceRevision:hash,observedAt:date})
 assert.equal(f.counts().analyses,1)
 await f.coordinator.shutdown()
})

for(const replaced of [false,true])test('a busy analysis guard retains a proved revision change with '+(replaced?'replaced root':'same root'), async () => {
 let busy = false, guardCalls = 0
 const f = setup(undefined,async()=>busy&&++guardCalls===2?'busy':'clear')
 await f.coordinator.execute(command('generate'))
 const date = '2026-11-05T10:00:00.000Z'
 f.runtime.capture = async () => ({...capture,rootIdentity:replaced?'replacement':capture.rootIdentity,revision:'b'.repeat(64),observedAt:date})
 busy = true
 await f.coordinator.execute(command('generate'))
 assert.deepEqual(f.coordinator.read().fileBindings,[])
 assert.deepEqual(f.stored().freshness,{status:'changed',sourceRevision:hash,observedAt:date})
 assert.equal(f.stored().scope.rootIdentity,capture.rootIdentity)
 assert.equal(f.counts().analyses,1)
 await f.coordinator.shutdown()
})

test('an explicit interruption ignores a late result without dropping a confirmed stop', {timeout:4000}, async () => {
 const f = setup()
 await f.coordinator.execute(command('generate'))
 const prior = f.stored().lastComplete
 let ready, release
 const started = new Promise(resolve=>{ready=resolve}), pending = new Promise(resolve=>{release=resolve})
 const analyze = f.runtime.analyze
 f.runtime.analyze = async (request,observe) => {
  ready(request.identity.analysisId)
  await pending
  await analyze(request,e=>observe(e.type==='stopped'?{...e,reason:'interrupted'}:e))
 }
 const generating = f.coordinator.execute(command('generate'))
 const analysisId = await started
 try { await f.coordinator.execute({...command('interrupt'),analysisId}) } finally { release() }
 const result = await generating
 const state = result.projects[0]
 assert.deepEqual(state.result.snapshot,prior)
 assert.deepEqual(state.lastComplete,prior)
 assert.deepEqual(result.fileBindings,[])
 assert.deepEqual([state.activity.outcome,state.activity.stop],['interrupted','confirmed'])
 await f.coordinator.shutdown()
})

test('a rejected engine without a terminal persists an unknown stop and keeps the last complete', async () => {
 const f = setup()
 await f.coordinator.execute(command('generate'))
 const prior = f.stored().lastComplete
 f.runtime.analyze = async () => {throw Error('engine exited without receipt')}
 await f.coordinator.execute(command('generate'))
 assert.deepEqual([f.stored().activity.phase,f.stored().activity.stop,f.stored().activity.outcome],['terminal','unknown','unknown'])
 assert.deepEqual(f.stored().lastComplete,prior)
 const before = f.counts()
 await f.coordinator.execute(command('generate'))
 await f.coordinator.execute(command('revalidate-files'))
 await f.coordinator.execute({...command('generate'),projectId:'other'})
 assert.deepEqual(f.counts(),before)
 await f.coordinator.shutdown()
})

test('a queued command does not begin capture if shutdown wins while loading the sidecars', {timeout:4000}, async () => {
 let release
 const listed = new Promise(resolve=>{release=resolve})
 const f = setup({list:()=>listed,write:async()=>{}})
 const request = f.coordinator.execute(command('generate'))
 await f.coordinator.shutdown()
 release([])
 await request
 assert.deepEqual(f.counts(),{captures:0,analyses:0,accepted:0})
})

test('shutdown during the second guard does not dispatch the analysis', {timeout:4000}, async () => {
 let called=0, resolveGuard, markGuard
 const guardEntered = new Promise(resolve=>{markGuard=resolve})
 const f = setup(undefined,async()=>{
  if(++called!==2)return 'clear'
  markGuard()
  return new Promise(resolve=>{resolveGuard=resolve})
 })
 const request = f.coordinator.execute(command('generate'))
 await guardEntered
 const closed = f.coordinator.shutdown()
 resolveGuard('clear')
 await Promise.all([request,closed])
 assert.deepEqual(f.counts(),{captures:1,analyses:0,accepted:0})
})
