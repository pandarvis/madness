import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {ActivityAdmission,LifecycleCoordinator} from '../src/core/lifecycle.ts'
import * as contract from '../src/contracts/bmad-initialization.ts'
import * as core from '../src/core/bmad-initialization.ts'
const sha=c=>c.repeat(64)
const entry=(path,kind='directory')=>kind==='directory'?{path,kind}:{path,kind,sha256:createHash('sha256').update('test').digest('hex'),bytes:4,contentId:'content-'+path}
const context=()=>({scope:'configuration',initiativeId:null,observation:{schemaVersion:1,projectId:'p',rootPath:'C:/work/p',rootIdentity:'volume:root',revision:sha('a'),observedAt:'2026-11-05T13:00:00.000Z',status:'absent',activeInitiative:null,activeStatus:'absent',sources:[],problems:[]}})
function plan(request={projectId:'p',attemptId:'attempt-1',generation:1,context:context()}){
 const o=request.context.observation
 return {schemaVersion:1,id:'plan-'+request.attemptId,revision:sha('b'),identity:{projectId:request.projectId,attemptId:request.attemptId,generation:request.generation,rootPath:o.rootPath,rootIdentity:o.rootIdentity,parentPath:'C:/work',parentIdentity:'volume:parent',contextRevision:o.revision,profileId:'local-6.13.0-next',sourceRevision:sha('d'),payloadRevision:sha('e')},observedAt:'2026-11-05T13:00:00.000Z',preconditions:{configurationRevision:o.revision,targetTreeRevision:sha('f'),parentTreeRevision:sha('1'),sourceRevision:sha('d'),payloadRevision:sha('e')},parameters:[{name:'project_name',value:'Projet matérialisé'}],additions:[entry('.agents'),entry('.agents/skills'),entry('.agents/skills/bmad'),entry('.agents/skills/bmad/SKILL.md','file'),entry('_bmad'),entry('_bmad-output')],preserved:[{path:'README.md',kind:'file',sha256:sha('2'),bytes:8}],excluded:[{path:'skills-lock.json',reason:'private-source-reference'}],limitations:['Sequential additions; no rollback or safe stop after effects.']}
}
const decide=(op,action='approve')=>({contractVersion:1,type:action,projectId:op.projectId,attemptId:op.attemptId,generation:op.generation,planId:op.plan.id,planRevision:op.plan.revision,...(action==='approve'?{confirmation:'initialize-exact-plan'}:{})})
function fixture(options={}){
 const calls={capture:0,fresh:0,prepare:0,recheck:0,apply:0,verify:0,inspect:0,content:0,save:0}
 let n=0,current=context(),invalidated=()=>{},failure=false,original,authority,lastFact
 const plans=new WeakMap(),facts=new WeakMap(),saved=[]
 const issue=(kind,values={})=>{
  const p=authority.plan,raw={schemaVersion:1,kind,identity:structuredClone(p.identity),planId:p.id,planRevision:p.revision,order:kind==='preconditions'?1:kind==='application'?2:3,...values}
  const token=structuredClone(raw);facts.set(token,structuredClone(raw));lastFact=token;return token
 }
 const admission=new ActivityAdmission(),lifecycle=new LifecycleCoordinator()
 const host={prepare:async request=>{
  calls.prepare++;const p=plan(request);options.modifyPlan?.(p);original=p
  authority={plan:structuredClone(p),
   recheck:async()=>{calls.recheck++;return options.recheck?options.recheck({issue,authority,calls}):issue('preconditions',{preconditions:structuredClone(p.preconditions),complete:true})},
   apply:async signal=>{calls.apply++;return options.apply?options.apply({issue,authority,calls,signal}):{}},
   verify:async raw=>{calls.verify++;return options.verify?options.verify({issue,authority,calls,raw}):issue('application',{outcome:'verified',observedAdditions:structuredClone(p.additions),unionVerified:true,preservedVerified:true,unverifiedPaths:[],stop:'confirmed',reason:null})},
   inspect:async()=>{calls.inspect++;return options.inspect?options.inspect({issue,authority,calls}):issue('inspection',{coverage:'complete',observedAdditions:[],unverifiedPaths:[],stop:'confirmed',reason:null})},
   content:async id=>{calls.content++;const e=p.additions.find(e=>e.contentId===id);return {contentId:id,path:e.path,sha256:e.sha256,bytes:e.bytes,encoding:'utf8',data:'test'}},
   fact:v=>facts.get(v)}
  plans.set(p,authority)
  return options.prepared?options.prepared(p):p
 },authority:v=>plans.get(v)}
 const deps={newId:()=> 'attempt-'+(++n),context:{capture:async(id,required,signal)=>{calls.capture++;assert.equal(required,false);signal.throwIfAborted();return structuredClone({...current,observation:{...current.observation,projectId:id}})},assertFresh:async captured=>{calls.fresh++;if(JSON.stringify(captured)!==JSON.stringify({...current,observation:{...current.observation,projectId:captured.observation.projectId}}))throw Error('changed')},subscribeInvalidation:fn=>{invalidated=fn;return()=>{invalidated=()=>{}}}},host,admission,lifecycle,store:{write:async(record,expected)=>{calls.save++;if(failure)throw Error('storage');saved.push({record:structuredClone(record),expected})}}}
 const service=new core.BmadInitialization(deps)
 return {service,calls,deps,host,admission,lifecycle,saved,issue,get original(){return original},get authority(){return authority},get lastFact(){return lastFact},set failure(v){failure=v},set current(v){current=v},invalidate:()=>invalidated('p','watching')}
}
const prepared=async f=>{const result=await f.service.prepare('p');assert.equal(result.ok,true,JSON.stringify(result));return result.value}
const apply=async f=>f.service.execute(decide(await prepared(f)))

test('C1 accepts and detaches complete v1 data without granting authority',()=>{
 assert.equal(typeof contract.validateInitializationPlan,'function')
 const input=plan(),r=contract.validateInitializationPlan(input);assert.equal(r.ok,true)
 input.additions[3].sha256=sha('9');input.parameters[0].value='changed'
 assert.equal(r.value.additions[3].sha256,createHash('sha256').update('test').digest('hex'));assert.equal(r.value.parameters[0].value,'Projet matérialisé')
})
test('C1 rejects unknown fields, versions, getters, cycles, special prototypes and invalid values',()=>{
 let reads=0
 const values=[{...plan(),schemaVersion:2},{...plan(),extra:true},Object.assign(Object.create({}),plan()),{...plan(),limitations:[NaN]},{...plan(),parameters:[{name:'x',value:undefined}]}]
 const getter=plan();Object.defineProperty(getter,'id',{get(){reads++;return 'x'},enumerable:true});values.push(getter)
 const cyclic=plan();cyclic.parameters[0].value=cyclic;values.push(cyclic)
 const symbolic=plan();symbolic[Symbol('foreign')]=1;values.push(symbolic)
 const sparse=plan();sparse.additions=Array(1000000);values.push(sparse)
 for(const value of values)assert.equal(contract.validateInitializationPlan(value).ok,false)
 assert.equal(reads,0)
})
for(const path of ['../escape','/root','C:/root','a\\b','a//b','a/./b','a:stream','a.','a ','CON','aux.txt','COM1.md','x?','x\u0001','a/../b'])test('C2 rejects Windows ambiguous or escaping path '+JSON.stringify(path),()=>{
 const p=plan();p.additions=[entry(path)];assert.equal(contract.validateInitializationPlan(p).ok,false)
})
test('C2 rejects collision, missing parents, file ancestors and excluded private lock',()=>{
 for(const additions of [[entry('A'),entry('a')],[entry('a/file','file')],[entry('a','file'),entry('a/b')],[entry('README.md','file')],[entry('skills-lock.json','file')]]){
  const p=plan();p.additions=additions;assert.equal(contract.validateInitializationPlan(p).ok,false)
 }
 const p=plan();p.identity.parentPath='C:/other';assert.equal(contract.validateInitializationPlan(p).ok,false)
})
test('C2 full inventory and content stay consultable and detached',async()=>{
 const f=fixture(),op=await prepared(f);assert.equal(op.plan.additions.length,6)
 const r=await f.service.content(op.attemptId,op.plan.additions[3].contentId);assert.equal(r.ok,true);assert.equal(r.value.data,'test')
 op.plan.additions.length=0;assert.equal(f.service.read().operations[0].plan.additions.length,6)
 assert.equal(f.calls.apply,0)
})
test('C3 explicit current confirmation consumes one approval and triggers one effect',async()=>{
 const f=fixture(),op=await prepared(f)
 assert.equal(f.calls.apply,0)
 const invalid=decide(op);delete invalid.confirmation;assert.equal((await f.service.execute(invalid)).ok,false)
 const r=await f.service.execute(decide(op));assert.equal(r.ok,true);assert.equal(r.value.result.outcome,'verified');assert.equal(r.value.decision,'consumed');assert.equal(r.value.stop,'confirmed')
 assert.equal((await f.service.execute(decide(op))).ok,false);assert.equal(f.calls.apply,1);assert.equal(f.calls.recheck,1);assert.ok(f.calls.fresh>=2)
})
test('C3 validated/cloned plan and mutated producer original create no capability',async()=>{
 for(const options of [{prepared:p=>structuredClone(p)},{prepared:p=>{p.parameters[0].value='changed after seal';return p}}]){
  const f=fixture(options),r=await f.service.prepare('p');assert.equal(r.ok,false);assert.equal(f.calls.apply,0)
 }
 const f=fixture(),op=await prepared(f),copy=fixture();assert.equal(copy.service.restore(op).ok,true)
 assert.equal((await copy.service.execute(decide(op))).ok,false);assert.equal(copy.calls.apply,0)
})
for(const field of ['projectId','rootPath','rootIdentity','parentIdentity','contextRevision','profileId','sourceRevision','payloadRevision','attemptId','generation'])test('C4 foreign recheck '+field+' refuses before effect',async()=>{
 const f=fixture({recheck:({issue})=>{const token=issue('preconditions',{preconditions:plan().preconditions,complete:true});const facts=f.authority.fact(token);facts.identity[field]=field==='generation'?55:'foreign';return token}})
 const r=await apply(f);assert.equal(r.value.result.outcome,'stale');assert.equal(f.calls.apply,0)
})
test('C4 exhaustive target/parent/source/payload checks are distinct from context freshness',async()=>{
 for(const field of ['targetTreeRevision','parentTreeRevision','sourceRevision','payloadRevision']){
  const f=fixture({recheck:({issue,authority})=>issue('preconditions',{preconditions:{...authority.plan.preconditions,[field]:sha('9')},complete:true})})
  const r=await apply(f);assert.equal(r.value.result.outcome,'stale');assert.equal(f.calls.apply,0);assert.ok(f.calls.fresh>0)
 }
 const f=fixture(),op=await prepared(f);f.current={...context(),observation:{...context().observation,revision:sha('9')}}
 const r=await f.service.execute(decide(op));assert.equal(r.value.result.outcome,'stale');assert.equal(f.calls.apply,0)
})
test('C4 mutation after admission cannot alter captured plan or execution expectation',async()=>{
 const f=fixture(),op=await prepared(f);f.original.additions[3].sha256=sha('9');f.authority.plan.identity.payloadRevision=sha('9')
 const r=await f.service.execute(decide(op));assert.equal(r.value.result.outcome,'stale');assert.equal(f.calls.apply,0)
})
for(const action of ['close','cancel','refuse'])test('C5 '+action+' leaves historical plan inactive and demands new preparation',async()=>{
 const f=fixture(),op=await prepared(f);assert.equal((await f.service.execute(decide(op,action))).ok,true)
 assert.equal((await f.service.execute(decide(op))).ok,false);assert.equal(f.calls.apply,0)
 assert.equal(f.service.read().operations[0].phase,'historical')
 const next=await prepared(f);assert.notEqual(next.attemptId,op.attemptId)
})
test('C5 context invalidation makes plan historical without automatic preparation',async()=>{
 const f=fixture(),op=await prepared(f);f.invalidate();assert.equal((await f.service.execute(decide(op))).ok,false)
 assert.equal(f.service.read().operations[0].result.outcome,'stale');assert.equal(f.calls.prepare,1);assert.equal(f.calls.apply,0)
})
test('C6 same physical target admits no second effect or queued launch while first checks',async()=>{
 let release
 const f=fixture({recheck:async({issue,authority})=>{await new Promise(r=>release=r);return issue('preconditions',{preconditions:authority.plan.preconditions,complete:true})}})
 const op=await prepared(f),work=f.service.execute(decide(op));while(!release)await new Promise(r=>setImmediate(r))
 assert.equal((await f.service.execute(decide(op))).ok,false);assert.equal((await f.service.prepare('other-project')).ok,false)
 release();assert.equal((await work).value.result.outcome,'verified');assert.equal(f.calls.apply,1)
})
test('C6 late original event stays on captured operation; foreign order/generation and clones refused',async()=>{
 const f=fixture(),op=await prepared(f);await f.service.execute(decide(op))
 const fact=f.lastFact;assert.equal(f.service.publish(op.attemptId,structuredClone(fact)).ok,false)
 assert.equal(f.service.publish(op.attemptId,fact).ok,false)
 const other=await prepared(f);const foreign=f.issue('application',{outcome:'unknown',observedAdditions:[],unionVerified:false,preservedVerified:false,unverifiedPaths:[],stop:'unknown',reason:'late'})
 assert.equal(f.service.publish(op.attemptId,foreign).ok,false);assert.equal(f.service.read().operations.find(o=>o.attemptId===other.attemptId).phase,'ready')
})
for(const finish of ['clone','json','exit','throw'])test('C7 '+finish+' is not proof of verified result or stop',async()=>{
 const f=fixture({verify:({issue,authority})=>{
  if(finish==='throw')throw Error('ambiguous')
  if(finish==='json')return {}
  if(finish==='exit')return {exitCode:0}
  return structuredClone(issue('application',{outcome:'verified',observedAdditions:authority.plan.additions,unionVerified:true,preservedVerified:true,unverifiedPaths:[],stop:'confirmed',reason:null}))
 }})
 const r=await apply(f);assert.equal(r.value.result.outcome,'unknown');assert.equal(r.value.stop,'unknown');assert.equal(f.admission.activity,'blocked');assert.equal(f.calls.apply,1)
 assert.equal((await f.service.prepare('p')).ok,false)
})
test('C7 proof must establish exact union and every preserved byte; partial is separate',async()=>{
 for(const change of [{unionVerified:false},{preservedVerified:false},{observedAdditions:[]},{unverifiedPaths:['README.md']}]){
  const f=fixture({verify:({issue,authority})=>issue('application',{outcome:'verified',observedAdditions:authority.plan.additions,unionVerified:true,preservedVerified:true,unverifiedPaths:[],stop:'confirmed',reason:null,...change})})
  const r=await apply(f);assert.notEqual(r.value.result.outcome,'verified')
 }
 for(const outcome of ['partial','unknown','failed-no-effect']){
  const f=fixture({verify:({issue})=>issue('application',{outcome,observedAdditions:[],unionVerified:false,preservedVerified:outcome==='failed-no-effect',unverifiedPaths:outcome==='failed-no-effect'?[]:['_bmad'],stop:'confirmed',reason:'host observation'})})
  const r=await apply(f);assert.equal(r.value.result.outcome,outcome);assert.equal(r.value.stop,'confirmed')
 }
})
test('C7 lifecycle close after possible effect is unknown; late proof retains old context',async()=>{
 let finish
 const f=fixture({verify:({issue,authority})=>new Promise(resolve=>{finish=()=>resolve(issue('application',{outcome:'verified',observedAdditions:authority.plan.additions,unionVerified:true,preservedVerified:true,unverifiedPaths:[],stop:'confirmed',reason:null}))})})
 const op=await prepared(f),work=f.service.execute(decide(op));while(!finish)await new Promise(r=>setImmediate(r))
 const stops=await f.lifecycle.shutdown();assert.equal(stops[0].outcome,'unknown');assert.equal(f.admission.activity,'blocked')
 finish();await work;const retained=f.service.read().operations[0];assert.equal(retained.projectId,'p');assert.equal(retained.phase,'historical');assert.equal(retained.decision,'inactive')
})
test('C8 storage retry is storage alone; restore active records passively without effect or approval',async()=>{
 const f=fixture({verify:()=>{f.failure=true;return terminalFact(f)}});const r=await apply(f);assert.equal(r.value.result.outcome,'verified');assert.equal(r.value.preservation.status,'failed')
 const before={...f.calls};f.failure=false;const saved=await f.service.retrySave(r.value.attemptId);assert.equal(saved.ok,true);assert.equal(saved.value.preservation.status,'stored')
 for(const key of ['capture','fresh','prepare','recheck','apply','verify','inspect'])assert.equal(f.calls[key],before[key])
 const other=fixture(),restored=other.service.restore(saved.value);assert.equal(restored.ok,true);assert.equal(restored.value.phase,'historical');assert.equal(restored.value.decision,'inactive')
 assert.deepEqual(other.calls,{capture:0,fresh:0,prepare:0,recheck:0,apply:0,verify:0,inspect:0,content:0,save:0})
 assert.equal((await other.service.execute(decide(saved.value))).ok,false)
 const inFlight=structuredClone(saved.value);inFlight.attemptId='interrupted';inFlight.plan.identity.attemptId='interrupted';inFlight.phase='applying';inFlight.result={outcome:'none',receipt:null,reason:null};inFlight.stop='not-observed'
 const rr=other.service.restore(inFlight);assert.equal(rr.ok,true);assert.equal(rr.value.result.outcome,'unknown');assert.equal(rr.value.stop,'unknown');assert.equal(other.calls.inspect,0)
})
test('C8 explicit inspection of uncertain effects cannot reapply or reactivate agreement',async()=>{
 const f=fixture({verify:()=>({exitCode:0})}),r=await apply(f),before=f.calls.apply
 const inspected=await f.service.inspect(r.value.attemptId);assert.equal(inspected.ok,true);assert.equal(inspected.value.inspection.coverage,'complete')
 assert.equal(inspected.value.result.outcome,'unknown');assert.equal(f.calls.apply,before);assert.equal((await f.service.execute(decide(r.value))).ok,false)
})

test('C5 cancelling a pending private preparation ignores its late original plan',async()=>{
 let release
 const f=fixture({prepared:p=>new Promise(resolve=>{release=()=>resolve(p)})}),work=f.service.prepare('p')
 while(!release)await new Promise(r=>setImmediate(r))
 const pending=f.service.read().operations[0]
 const cancelled=await f.service.cancelPreparation(pending.projectId,pending.attemptId,pending.generation)
 assert.equal(cancelled.ok,true);assert.equal(cancelled.value.phase,'historical')
 release();assert.equal((await work).ok,false);assert.equal(f.calls.apply,0)
 assert.equal(f.service.read().operations[0].result.outcome,'cancelled')
})
test('C3 readiness releases helper admission while durable saving is pending',async()=>{
 let release
 const f=fixture();f.deps.store.write=()=>new Promise(resolve=>{release=resolve})
 const preparing=f.service.prepare('p');while(!release)await new Promise(r=>setImmediate(r))
 const op=f.service.read().operations[0]
 assert.equal(op.phase,'ready');assert.equal(f.admission.activity,'clear')
 const originalSave=release;f.deps.store.write=async()=>{}
 const applying=f.service.execute(decide(op));originalSave();await preparing
 assert.equal((await applying).value.result.outcome,'verified');assert.equal(f.calls.apply,1)
})
test('C8 restored uncertain target blocks a new application even with a fresh service',async()=>{
 const f=fixture({verify:()=>({exitCode:0})}),op=(await apply(f)).value,other=fixture()
 assert.equal(other.service.restore(op).ok,true);other.deps.newId=()=> 'after-restore'
 assert.equal((await other.service.prepare('p')).ok,false);assert.equal(other.calls.apply,0)
})
test('C8 restored uncertainty permits only voluntary original host inspection, never a grant',async()=>{
 const f=fixture({verify:()=>({exitCode:0})}),op=(await apply(f)).value,other=fixture(),facts=new WeakMap()
 other.host.inspect=async record=>{
  other.calls.inspect++;const proof={schemaVersion:1,identity:structuredClone(record.plan.identity),planId:record.plan.id,planRevision:record.plan.revision,order:record.lastFactOrder+1,kind:'inspection',coverage:'partial',observedAdditions:[],unverifiedPaths:['_bmad'],stop:'unknown',reason:'bounded observation'}
  facts.set(proof,structuredClone(proof));return proof
 }
 other.host.inspectionFact=original=>facts.get(original)
 assert.equal(other.service.restore(op).ok,true);assert.equal(other.calls.inspect,0)
 const r=await other.service.inspect(op.attemptId);assert.equal(r.ok,true);assert.equal(r.value.inspection.coverage,'partial');assert.equal(r.value.result.outcome,'unknown')
 assert.equal(other.calls.apply,0);assert.equal((await other.service.execute(decide(op))).ok,false)
})

test('C4 producer mutation after consumed intent is stored still refuses before dispatch',async()=>{
 const f=fixture(),op=await prepared(f)
 const unsubscribe=f.service.subscribe(state=>{
  const current=state.operations.find(o=>o.attemptId===op.attemptId)
  if(current?.phase==='checking'&&current.preservation.status==='stored')f.original.parameters[0].value='mutated after checking intent was saved'
 })
 const r=await f.service.execute(decide(op));unsubscribe()
 assert.equal(f.calls.apply,0);assert.equal(r.value.result.outcome,'stale')
})
test('C7 mutating an admitted original result cannot rewrite retained evidence',async()=>{
 const f=fixture(),r=await apply(f),before=structuredClone(r.value.result)
 f.lastFact.observedAdditions.length=0
 f.authority.fact(f.lastFact).identity.projectId='foreign-after-publication'
 assert.deepEqual(f.service.read().operations[0].result,before)
 assert.equal(contract.validateInitializationOperation(f.service.read().operations[0]).ok,true)
})

test('C3 context owner can use its helper admission without a nested competing lease',async()=>{
 const f=fixture(),capture=f.deps.context.capture,fresh=f.deps.context.assertFresh
 f.deps.context.capture=async(...args)=>{const release=f.admission.enter('helper');try{return await capture(...args)}finally{release()}}
 f.deps.context.assertFresh=async(...args)=>{const release=f.admission.enter('helper');try{return await fresh(...args)}finally{release()}}
 const r=await apply(f);assert.equal(r.ok,true);assert.equal(r.value.result.outcome,'verified');assert.equal(f.calls.apply,1)
})

test('review Q1 changing only the producer authority plan refuses application',async()=>{
 const f=fixture(),op=await prepared(f)
 f.authority.plan.parameters[0].value='changed on producer only'
 const r=await f.service.execute(decide(op))
 assert.equal(f.calls.apply,0);assert.equal(r.value.result.outcome,'stale')
})
test('review Q2 the actually persisted consumed intent locks a restored target during application',async()=>{
 let finish
 const f=fixture({apply:()=>new Promise(resolve=>{finish=()=>resolve({})})}),op=await prepared(f)
 const work=f.service.execute(decide(op))
 while(!finish)await new Promise(r=>setImmediate(r))
 try{
  const durable=f.saved.at(-1).record
  assert.equal(durable.phase,'checking');assert.equal(durable.decision,'consumed')
  const restored=fixture();restored.deps.newId=()=> 'after-crash'
  const r=restored.service.restore(durable);assert.equal(r.ok,true);assert.equal(r.value.result.outcome,'unknown')
  assert.equal((await restored.service.prepare('p')).ok,false);assert.equal(restored.calls.prepare,0)
 }finally{finish();await work}
})
test('review Q2 failed pre-effect intent save performs no recheck or application',async()=>{
 const f=fixture(),op=await prepared(f)
 f.failure=true
 const r=await f.service.execute(decide(op))
 assert.equal(r.value.result.outcome,'stale');assert.equal(r.value.preservation.status,'failed')
 assert.equal(f.calls.recheck,0);assert.equal(f.calls.apply,0)
})
const terminalFact=(f,order=2)=>f.issue('application',{order,outcome:'verified',observedAdditions:f.authority.plan.additions,unionVerified:true,preservedVerified:true,unverifiedPaths:[],stop:'confirmed',reason:null})
test('review Q3 an admitted original while apply is pending survives its continuation',async()=>{
 let finish
 const f=fixture({apply:()=>new Promise(resolve=>{finish=()=>resolve({})})}),op=await prepared(f)
 const work=f.service.execute(decide(op))
 while(!finish)await new Promise(r=>setImmediate(r))
 const fact=terminalFact(f)
 assert.equal(f.service.publish(op.attemptId,fact).ok,true)
 finish();const r=await work
 assert.equal(r.value.phase,'terminal');assert.equal(r.value.result.outcome,'verified');assert.equal(r.value.stop,'confirmed')
 assert.equal(f.service.publish(op.attemptId,fact).ok,false)
})
for(const finishMode of ['duplicate','invalid','throw'])test('review Q3 '+finishMode+' verification cannot erase an admitted original terminal fact',async()=>{
 let finish
 const f=fixture({verify:()=>new Promise((resolve,reject)=>{finish=token=>finishMode==='throw'?reject(Error('late verification error')):resolve(finishMode==='duplicate'?token:{exitCode:0})})})
 const op=await prepared(f),work=f.service.execute(decide(op))
 while(!finish)await new Promise(r=>setImmediate(r))
 const fact=terminalFact(f)
 assert.equal(f.service.publish(op.attemptId,fact).ok,true)
 finish(fact);const r=await work
 assert.equal(r.value.phase,'terminal');assert.deepEqual(r.value.result.receipt,fact);assert.equal(r.value.stop,'confirmed');assert.equal(f.admission.activity,'clear')
})
test('review Q4 a synchronous pending listener cannot mix revisions in a durable snapshot',async()=>{
 const f=fixture(),writes=[]
 f.deps.store.write=async(record,expected)=>{
  assert.equal(contract.validateInitializationOperation(record).ok,true)
  assert.equal(expected,writes.at(-1)?.revision??null)
  writes.push(record)
 }
 let invalidated=false
 const unsubscribe=f.service.subscribe(({operations:[op]})=>{
  if(!invalidated&&op.phase==='ready'&&op.preservation.status==='pending'){invalidated=true;f.invalidate()}
 })
 await f.service.prepare('p')
 await new Promise(r=>setImmediate(r));unsubscribe()
 assert.deepEqual(writes.map(op=>op.phase),['ready','historical'])
 assert.equal(writes[1].result.outcome,'stale');assert.ok(writes[1].revision>writes[0].revision)
})
test('review R1 admits a native drive capture and plan while keeping the exact capture binding',async()=>{
 const native='C:\\work\\p',c=context(),capture={...c,observation:{...c.observation,rootPath:native}}
 const f=fixture({modifyPlan:p=>{p.identity.parentPath='C:\\work'}})
 f.current=capture
 const op=await prepared(f)
 assert.equal(op.plan.identity.rootPath,native);assert.equal(op.plan.identity.parentPath,'C:\\work')
 assert.equal((await f.service.execute(decide(op))).value.result.outcome,'verified')
 const other=fixture({modifyPlan:p=>{p.identity.rootPath='C:/work/p'}});other.current=capture
 assert.equal((await other.service.prepare('p')).ok,false);assert.equal(other.calls.apply,0)
})
test('review R2 shutdown drains admitted writes and refuses a late inspection and further saves',async()=>{
 let finishInspection,finishWrite
 const f=fixture({verify:()=>({exitCode:0}),inspect:({issue})=>new Promise(resolve=>{finishInspection=()=>resolve(issue('inspection',{coverage:'complete',observedAdditions:[],unverifiedPaths:[],stop:'confirmed',reason:null}))})})
 const op=(await apply(f)).value,inspection=f.service.inspect(op.attemptId)
 while(!finishInspection)await new Promise(r=>setImmediate(r))
 f.deps.store.write=async()=>{f.calls.save++;if(!finishWrite)await new Promise(resolve=>{finishWrite=resolve})}
 const saving=f.service.retrySave(op.attemptId)
 while(!finishWrite)await new Promise(r=>setImmediate(r))
 const writes=f.calls.save
 let closed=false
 const closing=f.service.shutdown().then(()=>{closed=true})
 await new Promise(r=>setImmediate(r));assert.equal(closed,false)
 finishWrite();await Promise.all([saving,closing])
 finishInspection();assert.equal((await inspection).ok,false)
 assert.equal(f.service.read().operations[0].inspection,null);assert.equal((await f.service.retrySave(op.attemptId)).ok,false)
 assert.equal(f.calls.save,writes)
})
