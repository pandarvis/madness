import test from 'node:test'
import assert from 'node:assert/strict'
import {validateGraphSnapshot} from '../src/contracts/bmad-graph.ts'
const sha=c=>c.repeat(64)
const identity=()=>({projectId:'project-a',rootPath:'C:/project-a',rootIdentity:'volume-a:file-42',scopeId:'code',scopeRevision:sha('a'),analysisId:'analysis:001',sourceRevision:sha('b')})
const sources=()=>[{relativePath:'src/client.ts',sha256:sha('c'),lineCount:12,kind:'file'},{relativePath:'src/service.ts',sha256:sha('d'),lineCount:8,kind:'file'}]
const known=(relativePath,line)=>({status:'known',relativePath,line:line===null?{status:'unknown',reason:'absent'}:{status:'known',value:line}})
const snapshot=()=>({schemaVersion:1,identity:identity(),provenance:{profile:'graphifyy-0.9.101-windows-cpython312-code-only-local-spike-v1',tool:'graphifyy',toolVersion:'0.9.101',nativeSchemaVersion:1,artifact:'clustered-node-link',nativeSha256:sha('e'),assemblyRevision:sha('f'),normalizerVersion:1},collectedAt:'2026-11-04T10:00:00.000Z',coverage:{status:'complete',included:['code','dependencies'],excluded:['documents','semantic-enrichment'],limitations:[]},sources:sources(),nodes:[{id:'typed_client_useservice',label:'useService',kind:'function',reference:known('src/client.ts',4)},{id:'typed_service_service_act',label:'Service.act',kind:'method',reference:known('src/service.ts',3)}],relations:[{id:'calls:001',source:'typed_client_useservice',target:'typed_service_service_act',kind:'calls',directionSource:'explicit-markers',confidence:'INFERRED',score:0.85,reference:known('src/client.ts',4)}]})
test('C1 normalized code-only witness retains directed INFERRED 0.85 and independent copies',()=>{
 const input=snapshot(),result=validateGraphSnapshot(input)
 assert.equal(result.ok,true)
 assert.deepEqual(result.value,input)
 input.nodes[0].label='changed outside'; result.value.relations[0].score=0
 assert.equal(result.value.nodes[0].label,'useService')
 assert.equal(input.relations[0].score,0.85)
})
for(const [name,mutate] of [
 ['version',s=>s.schemaVersion=2],['profile',s=>s.provenance.profile='unknown'],['tool',s=>s.provenance.toolVersion='0.9.94'],['raw',s=>s.provenance.artifact='raw'],['schema',s=>s.provenance.nativeSchemaVersion=2],['extra payload',s=>s.native={graph:{}}],['duplicate nodes',s=>s.nodes.push({...s.nodes[0]})],['duplicate relations',s=>s.relations.push({...s.relations[0]})],['endpoint',s=>s.relations[0].target='missing'],['direction',s=>s.relations[0].directionSource='one-marker'],['confidence',s=>s.relations[0].confidence='CERTAIN'],['boolean score',s=>s.relations[0].score=true],['nan score',s=>s.relations[0].score=NaN],['infinite score',s=>s.relations[0].score=Infinity],['large score',s=>s.relations[0].score=1.01],['missing value',s=>delete s.coverage.status],['line zero',s=>s.nodes[0].reference.line.value=0],['line out of corpus',s=>s.nodes[0].reference.line.value=13],['fractional line',s=>s.nodes[0].reference.line.value=1.5],['unattested line',s=>s.sources[0].lineCount=null],['declared link',s=>s.sources[0].kind='link'],['unknown file',s=>s.nodes[0].reference.relativePath='src/absent.ts'],['duplicate sources',s=>s.sources.push({...s.sources[0]})],['complete with omissions',s=>s.coverage.limitations.push('missing source')],
 ...['../outside.ts','/absolute.ts','C:/outside.ts','src\\file.ts','src/../outside.ts','./src/client.ts','src//client.ts','src/a:b.ts'].map(path=>[path,s=>s.sources[0].relativePath=path]),
])test('C3/C4 refuses '+name+' without altering input',()=>{const s=snapshot();mutate(s);const before=structuredClone(s);const result=validateGraphSnapshot(s);assert.deepEqual(s,before);assert.equal(result.ok,false);assert.ok(result.issues[0].code);assert.ok(result.issues[0].path.startsWith('$'));assert.ok(result.issues[0].messageKey.startsWith('graph.error.'))})
test('C3 cycles, accessors, prototypes and hostile values have controlled refusals without getter calls',()=>{
 let calls=0;const accessor=snapshot();Object.defineProperty(accessor.nodes[0],'label',{enumerable:true,get(){calls++;throw Error('getter')}})
 const cyclic=snapshot();cyclic.nodes[0].reference=cyclic
 const inherited=Object.assign(Object.create({hidden:true}),snapshot())
 const poisoned=snapshot();poisoned.nodes[0].toJSON=()=>{calls++;throw Error('serialize')}
 for(const value of [null,undefined,1,true,[],cyclic,accessor,inherited,poisoned,new Proxy({},{ownKeys(){throw Error('proxy')}})]){assert.doesNotThrow(()=>assert.equal(validateGraphSnapshot(value).ok,false))}
 assert.equal(calls,0)
})
test('C4 all three levels, unknown file/line and absent score remain explicit without promotion',()=>{
 for(const confidence of ['EXTRACTED','INFERRED','AMBIGUOUS']){const s=snapshot();s.relations[0].confidence=confidence;s.relations[0].score=null;s.nodes[0].reference=known('src/client.ts',null);s.nodes[1].reference={status:'unknown',reason:'unrecognized'};const r=validateGraphSnapshot(s);assert.equal(r.ok,true);assert.equal(r.value.relations[0].confidence,confidence);assert.equal(r.value.relations[0].score,null);assert.deepEqual(r.value.nodes[1].reference,{status:'unknown',reason:'unrecognized'})}
})
test('C1 multiple proofs between identical endpoints keep ids, source direction and opaque native ids',()=>{const s=snapshot();s.nodes[0].id='opaque vendor / id 🧭:'.repeat(20);s.relations[0].source=s.nodes[0].id;s.relations.push({...s.relations[0],id:'proof:002',directionSource:'source-target',confidence:'AMBIGUOUS',score:0});const r=validateGraphSnapshot(s);assert.equal(r.ok,true);assert.equal(r.value.relations.length,2);assert.equal(r.value.relations[1].target,'typed_service_service_act')})

import * as contracts from '../src/contracts/bmad-graph.ts'
import * as policy from '../src/core/bmad-graph.ts'
const scope=()=>{const {analysisId,sourceRevision,...rest}=identity();return rest}
const expected=(extra={})=>({identity:identity(),generation:1,correlationId:'graph-test',lastEventOrder:0,corpus:sources(),coverage:{included:['code','dependencies'],excluded:['documents','semantic-enrichment']},sourceState:'unchanged',observedAt:'2026-11-04T10:00:01.000Z',...extra})
const event=(type,extra={})=>({contractVersion:1,correlationId:'graph-test',identity:identity(),generation:1,order:1,type,...extra})
const initial=()=>{const r=policy.createGraphState(scope());assert.equal(r.ok,true);return r.value}
const running=(ctx=expected(),state=initial())=>{const r=policy.beginGraphAttempt(state,ctx,'clear');assert.equal(r.ok,true);return r.value}
const observed=(value=snapshot(),ctx=expected(),state=running(ctx))=>{const r=policy.publishGraphEvent(state,event('result',{snapshot:value,identity:ctx.identity,generation:ctx.generation,correlationId:ctx.correlationId,order:state.lastEventOrder+1}),{...ctx,lastEventOrder:state.lastEventOrder});assert.equal(r.ok,true);return r.value}
const completed=()=>{const state=observed();const r=policy.publishGraphEvent(state,event('stopped',{order:2,reason:'complete',stop:'confirmed'}),expected({lastEventOrder:1}));assert.equal(r.ok,true);return r.value}
test('C2 candidate claims cannot override independently held expected identities, manifest or generation',()=>{
 for(const key of Object.keys(identity())){const s=snapshot(),ctx=expected();s.identity[key]=key.endsWith('Revision')?sha('1'):s.identity[key]+'other';s.collectedAt='2099-01-01T00:00:00.000Z';const r=policy.admitGraphSnapshot(s,ctx);assert.equal(r.ok,false,key);assert.equal(r.issues[0].code,'CONTEXT_MISMATCH')}
 for(const change of [c=>c.corpus[0].sha256=sha('1'),c=>c.corpus[0].kind='link',c=>c.corpus[0].lineCount=3,c=>c.corpus.pop()]){const ctx=expected();change(ctx);assert.equal(policy.admitGraphSnapshot(snapshot(),ctx).ok,false)}
 assert.equal(policy.admitGraphSnapshot(snapshot(),expected()).ok,true)
})
test('C2 a newer wall clock never publishes an older attempt or different scope/project',()=>{
 const state=completed(),copy=structuredClone(state),ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'}}),active=running(ctx,state)
 for(const change of [e=>e.generation=1,e=>e.correlationId='other',e=>e.identity.projectId='project-b',e=>e.identity.rootIdentity='other',e=>e.identity.scopeId='elsewhere']){const e=event('result',{generation:2,identity:ctx.identity,snapshot:{...snapshot(),identity:ctx.identity,collectedAt:'2099-01-01T00:00:00.000Z'}});change(e);assert.equal(policy.publishGraphEvent(active,e,ctx).ok,false)}
 assert.deepEqual(state,copy);assert.equal(active.lastComplete.identity.analysisId,'analysis:001')
})
test('C5 observing a complete result does not prove terminal stop, persistence or a new last complete',()=>{
 const s=observed()
 assert.equal(s.result.status,'complete');assert.equal(s.lastComplete,null);assert.equal(s.activity.phase,'running');assert.equal(s.preservation.status,'unrecorded')
 assert.equal(policy.beginGraphAttempt(s,expected({generation:2}),'clear').issues[0].code,'BUSY')
 const final=completed();assert.equal(final.lastComplete.identity.analysisId,'analysis:001');assert.equal(final.activity.stop,'confirmed');assert.equal(final.preservation.status,'unrecorded')
})
test('C5 partial, failure, incompatible and changed-during-collection preserve previous complete',()=>{
 const previous=completed(),ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'}})
 const partial={...snapshot(),identity:ctx.identity,coverage:{...snapshot().coverage,status:'partial',limitations:['unreadable file']}}
 const p=observed(partial,ctx,running(ctx,previous));assert.equal(p.result.status,'partial');assert.equal(p.lastComplete.identity.analysisId,'analysis:001')
 for(const [code,status] of [['ANALYSIS_FAILED','failed'],['INCOMPATIBLE','incompatible']]){const error={code,messageKey:'graph.error.'+code.toLowerCase(),outcome:'failed',recovery:code==='INCOMPATIBLE'?'inspect-profile':'retry-after-check'};const r=policy.publishGraphEvent(running(ctx,previous),event('failed',{identity:ctx.identity,generation:2,error}),ctx);assert.equal(r.ok,true);assert.equal(r.value.result.status,status);assert.equal(r.value.lastComplete.identity.analysisId,'analysis:001');assert.equal(r.value.activity.phase,'running')}
 const changed={...ctx,sourceState:'changed'},s=observed({...snapshot(),identity:ctx.identity},changed,running(changed,previous))
 const final=policy.publishGraphEvent(s,event('stopped',{identity:ctx.identity,generation:2,order:2,reason:'complete',stop:'confirmed'}),{...changed,lastEventOrder:1})
 assert.equal(final.ok,true);assert.equal(final.value.freshness.status,'changed');assert.equal(final.value.lastComplete.identity.analysisId,'analysis:001')
})
test('C5 terminal order and owned attempt are checked against core facts, without promotion on stop request',()=>{
 let state=running();const stop={contractVersion:1,correlationId:'stop-1',type:'interrupt',projectId:'project-a',scopeId:'code',analysisId:'analysis:001'}
 const wrong={...stop,analysisId:'other'};assert.equal(policy.requestGraphStop(state,wrong).ok,false)
 state=policy.requestGraphStop(state,stop).value
 assert.equal(state.activity.phase,'stop-requested');assert.equal(policy.publishGraphEvent(state,event('result',{snapshot:snapshot()}),expected()).ok,false)
 const unknown=policy.publishGraphEvent(state,event('stopped',{reason:'interrupted',stop:'unknown'}),expected())
 assert.equal(unknown.ok,true);assert.equal(unknown.value.activity.stop,'unknown');assert.equal(unknown.value.activity.outcome,'unknown');assert.equal(unknown.value.lastComplete,null)
 assert.equal(policy.beginGraphAttempt(unknown.value,expected({generation:2}),'clear').issues[0].code,'STOP_UNCONFIRMED')
})
test('C6 restoration is historical, non-revalidating and starts no fictitious port or derived command',()=>{
 const counts={analyze:0,stop:0,subscribe:0,write:0}
 const fake={analyze(){counts.analyze++},stop(){counts.stop++},subscribe(){counts.subscribe++},write(){counts.write++}}
 for(const active of [running(),policy.requestGraphStop(running(),{contractVersion:1,correlationId:'stop',type:'interrupt',projectId:'project-a',scopeId:'code',analysisId:'analysis:001'}).value]){
  const r=policy.restoreGraphState(active,scope(),fake)
  assert.equal(r.ok,true);assert.equal(r.value.activity.phase,'historical');assert.equal(r.value.activity.outcome,'unknown');assert.equal(r.value.activity.stop,'unknown')
  assert.equal(r.value.freshness.status,'unverified');assert.equal(policy.beginGraphAttempt(r.value,expected({generation:2}),'clear').issues[0].code,'STOP_UNCONFIRMED');assert.equal(Object.hasOwn(r,'commands'),false)
 }
 const prior=completed();prior.preservation={status:'failed',durableAnalysisId:'older-durable'}
 const restored=policy.restoreGraphState(prior,scope());assert.equal(restored.ok,true);assert.equal(restored.value.freshness.status,'unverified');assert.equal(restored.value.preservation.status,'failed');assert.equal(restored.value.preservation.durableAnalysisId,'older-durable')
 assert.equal(policy.restoreGraphState(prior,{...scope(),projectId:'project-b'}).ok,false)
 const invalid=structuredClone(prior);invalid.lastComplete.provenance.nativeSchemaVersion=2;assert.equal(policy.restoreGraphState(invalid,scope()).ok,false)
 assert.deepEqual(counts,{analyze:0,stop:0,subscribe:0,write:0})
})
test('C7 command declarations reject paths, native effects, invalid discriminants/correlation and unknown versions',()=>{
 for(const type of ['read','generate','interrupt','retry-save']){const value={contractVersion:1,correlationId:'graph-command',type,...(type==='read'?{}:{projectId:'project-a',scopeId:'code'}),...(type==='interrupt'?{analysisId:'analysis:001'}:{})};assert.equal(contracts.validateGraphCommand(value).ok,true);for(const extra of [{path:'C:/secret'},{native:true},{contractVersion:2},{correlationId:''},{type:'refresh-native'}])assert.equal(contracts.isGraphCommand({...value,...extra}),false)}
})
test('C7 event validation rejects correlation/discriminant/identity incoherence and controls replay order',()=>{
 const state=running()
 for(const extra of [{correlationId:''},{type:'native'},{contractVersion:2},{order:0},{order:1.5},{phase:undefined}])assert.equal(contracts.isGraphAnalysisEvent(event('started',extra)),false)
 const e=event('result',{snapshot:snapshot()});e.snapshot.identity.analysisId='foreign';assert.equal(contracts.validateGraphAnalysisEvent(e).ok,false)
 const progressed=policy.publishGraphEvent(state,event('progress',{phase:'extracting'}),expected());assert.equal(progressed.ok,true)
 assert.equal(policy.publishGraphEvent(progressed.value,event('progress',{phase:null}),expected({lastEventOrder:1})).issues[0].code,'EVENT_ORDER')
 assert.equal(policy.publishGraphEvent(progressed.value,event('progress',{phase:null,order:2}),expected()).issues[0].code,'EVENT_ORDER')
 for(const guard of ['busy','stop-unconfirmed'])assert.equal(policy.beginGraphAttempt(initial(),expected(),guard).ok,false)
 const terminal=completed();assert.equal(policy.publishGraphEvent(terminal,event('progress',{order:3,phase:null}),expected({lastEventOrder:2})).ok,false)
})
test('C8 all pure decisions detach candidate, expected corpus, previous result and returned last complete',()=>{
 const previous=completed(),before=structuredClone(previous),ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'}}),candidate={...snapshot(),identity:ctx.identity}
 const a=observed(candidate,ctx,running(ctx,previous)),b=observed(candidate,ctx,running(ctx,previous))
 assert.deepEqual(a,b);candidate.nodes[0].label='candidate change';ctx.corpus[0].lineCount=1;a.result.snapshot.nodes[0].label='output change';a.lastComplete.nodes[1].label='old output change'
 assert.equal(b.result.snapshot.nodes[0].label,'useService');assert.equal(b.lastComplete.nodes[1].label,'Service.act');assert.deepEqual(previous,before)
 const final=completed();final.result.snapshot.nodes[0].label='display change';assert.equal(final.lastComplete.nodes[0].label,'useService')
})


test('C7 port requests are versioned data: authority and live effects cannot enter through payloads',()=>{
 const request={contractVersion:1,identity:identity(),generation:1,correlationId:'graph-test',corpus:sources(),coverage:expected().coverage}
 assert.equal(contracts.validateGraphAnalysisRequest(request).ok,true)
 for(const extra of [{contractVersion:2},{generation:false},{identity:{...identity(),sourceRevision:1}},{corpus:[{...sources()[0],relativePath:'../secret'}]},{sourceState:'unchanged'},{executable:'python'},{subscribe:()=>{throw Error('effect')}}])assert.equal(contracts.validateGraphAnalysisRequest({...request,...extra}).ok,false)
 const stop={contractVersion:1,identity:identity(),generation:1,correlationId:'graph-test'}
 assert.equal(contracts.validateGraphStopRequest(stop).ok,true)
 assert.equal(contracts.validateGraphStopRequest({...stop,killPid:42}).ok,false)
})
test('C2 source revision captured at start cannot be silently reassigned by later expected facts',()=>{
 const state=running(),ctx=expected();ctx.identity.sourceRevision=sha('9')
 const r=policy.publishGraphEvent(state,event('result',{identity:ctx.identity,snapshot:{...snapshot(),identity:ctx.identity}}),ctx)
 assert.equal(r.ok,false)
})
test('C3/C6 malformed expected facts and historical stop ambiguity cannot be repaired or used as permission',()=>{
 for(const transform of [e=>e.generation=true,e=>e.generation=1.5,e=>e.lastEventOrder=-1,e=>e.identity.sourceRevision=1,e=>e.observedAt=null,e=>e.corpus[0].relativePath='/absolute',e=>e.coverage.included=['code','code']]){
  const e=expected();transform(e);assert.equal(policy.admitGraphSnapshot(snapshot(),e).ok,false)
 }
 const saved=completed();saved.activity.phase='historical';saved.activity.stop='not-observed';saved.activity.outcome='unknown'
 assert.equal(policy.restoreGraphState(saved,scope()).ok,false)
 const cyclic=completed();cyclic.scope=cyclic
 assert.equal(policy.restoreGraphState(cyclic,scope()).ok,false)
})
test('C5 unknown source observation is never promoted, and terminal corpus is checked again',()=>{
 const previous=completed(),ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'},sourceState:'unknown',observedAt:null})
 const state=observed({...snapshot(),identity:ctx.identity},ctx,running(ctx,previous))
 const r=policy.publishGraphEvent(state,event('stopped',{identity:ctx.identity,generation:2,order:2,reason:'complete',stop:'confirmed'}),{...ctx,lastEventOrder:1})
 assert.equal(r.ok,true);assert.equal(r.value.lastComplete.identity.analysisId,'analysis:001');assert.equal(r.value.freshness.status,'unverified')
 const changed={...ctx,sourceState:'unchanged',observedAt:'2026-11-04T10:00:02.000Z',corpus:sources(),lastEventOrder:1};changed.corpus[0].sha256=sha('8')
 assert.equal(policy.publishGraphEvent(state,event('stopped',{identity:ctx.identity,generation:2,order:2,reason:'complete',stop:'confirmed'}),changed).ok,false)
})
test('C5 complete, partial, failures, timeout and interruption each require coherent terminal observations',()=>{
 for(const reason of ['timeout','interrupted']){
  const r=policy.publishGraphEvent(running(),event('stopped',{reason,stop:'confirmed'}),expected())
  assert.equal(r.ok,true);assert.equal(r.value.activity.outcome,reason);assert.equal(r.value.activity.stop,'confirmed');assert.equal(r.value.lastComplete,null)
 }
 assert.equal(policy.publishGraphEvent(running(),event('stopped',{reason:'complete',stop:'confirmed'}),expected()).ok,false)
 const error={code:'STOP_UNCONFIRMED',messageKey:'graph.error.stop_unconfirmed',outcome:'unknown',recovery:'check-stop'}
 const r=policy.publishGraphEvent(running(),event('failed',{error}),expected());assert.equal(r.ok,true);assert.equal(r.value.activity.stop,'unknown');assert.equal(policy.beginGraphAttempt(r.value,expected({generation:2}),'clear').issues[0].code,'STOP_UNCONFIRMED')
})
test('C4 expected scope disclosure, uncommitted revision and missing line facts stay distinct',()=>{
 const ctx=expected();ctx.coverage.included=['other'];assert.equal(policy.admitGraphSnapshot(snapshot(),ctx).ok,false)
 const s=snapshot();s.relations[0].reference={status:'unknown',reason:'absent'}
 const admitted=policy.admitGraphSnapshot(s,expected());assert.equal(admitted.ok,true);assert.equal(admitted.value.snapshot.relations[0].reference.status,'unknown')
 const partial={...snapshot(),coverage:{...snapshot().coverage,status:'partial',limitations:['optional module missing']}}
 assert.equal(contracts.isGraphSnapshot(partial),true)
 for(const score of [-0.1,'0.85',false]){const value=snapshot();value.relations[0].score=score;assert.equal(contracts.validateGraphSnapshot(value).ok,false)}
})


test('C5 a new session result never inherits a prior successful save acknowledgement',()=>{
 const previous=completed();previous.preservation={status:'stored',durableAnalysisId:'analysis:001'}
 const ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'}})
 const next=observed({...snapshot(),identity:ctx.identity},ctx,running(ctx,previous))
 assert.equal(next.preservation.status,'unrecorded');assert.equal(next.preservation.durableAnalysisId,'analysis:001')
 assert.equal(previous.preservation.status,'stored')
})


test('C1 qualified witness subset preserves actual labels, source-target orientation and known lines',async()=>{
 const {readFile}=await import('node:fs/promises')
 const fixture=JSON.parse(await readFile(new URL('./fixtures/bmad-graph/known-normalized.json',import.meta.url),'utf8'))
 const r=contracts.validateGraphSnapshot(fixture.snapshot);assert.equal(r.ok,true)
 assert.equal(r.value.provenance.nativeSha256,'6edacf27e2a860b218b4301f936ef5d4513afde9505335dbc3fd833028c56339')
 assert.deepEqual(r.value.nodes.map(n=>[n.label,n.reference.relativePath,n.reference.line.value]),[['useService()','typed/client.ts',2],['.act()','typed/service.ts',1]])
 assert.deepEqual(r.value.relations.map(r=>[r.source,r.target,r.kind,r.directionSource,r.confidence,r.score]),[['typed_client_useservice','typed_service_service_act','calls','source-target','INFERRED',0.85]])
 assert.equal(r.value.coverage.status,'partial')
})


for(const [code,status] of [['ANALYSIS_FAILED','failed'],['INCOMPATIBLE','incompatible']])test('Q1 '+code+' locks a failed attempt against late result and complete promotion until explicit fresh start',()=>{
 const previous=completed(),ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'}})
 const error={code,messageKey:'graph.error.'+code.toLowerCase(),outcome:'failed',recovery:code==='INCOMPATIBLE'?'inspect-profile':'retry-after-check'}
 const failed=policy.publishGraphEvent(running(ctx,previous),event('failed',{identity:ctx.identity,generation:2,error}),ctx)
 assert.equal(failed.ok,true);assert.equal(failed.value.activity.phase,'running');assert.equal(failed.value.activity.stop,'not-observed')
 const before=structuredClone(failed.value),nextCtx={...ctx,lastEventOrder:1}
 const late=policy.publishGraphEvent(failed.value,event('result',{identity:ctx.identity,generation:2,order:2,snapshot:{...snapshot(),identity:ctx.identity}}),nextCtx)
 assert.equal(late.ok,false);assert.equal(late.issues[0].code,'INVALID_TRANSITION')
 assert.deepEqual(failed.value,before);assert.equal(failed.value.result.status,status);assert.deepEqual(failed.value.result.error,error);assert.equal(failed.value.activity.outcome,status)
 const incoherent=structuredClone(failed.value);incoherent.result=previous.result;assert.equal(contracts.validateGraphState(incoherent).ok,false)
 assert.equal(policy.beginGraphAttempt(failed.value,expected({generation:3,identity:{...identity(),analysisId:'analysis:003'}}),'clear').issues[0].code,'BUSY')
 assert.equal(policy.publishGraphEvent(failed.value,event('stopped',{identity:ctx.identity,generation:2,order:3,reason:'complete',stop:'confirmed'}),nextCtx).ok,false)
 const stopped=policy.publishGraphEvent(failed.value,event('stopped',{identity:ctx.identity,generation:2,order:2,reason:status,stop:'confirmed'}),nextCtx)
 assert.equal(stopped.ok,true);assert.equal(stopped.value.activity.stop,'confirmed');assert.equal(stopped.value.result.status,status);assert.equal(stopped.value.lastComplete.identity.analysisId,'analysis:001')
 assert.equal(policy.publishGraphEvent(stopped.value,event('result',{identity:ctx.identity,generation:2,order:3,snapshot:{...snapshot(),identity:ctx.identity}}),{...ctx,lastEventOrder:2}).ok,false)
 const freshCtx=expected({generation:3,identity:{...identity(),analysisId:'analysis:003'}})
 const fresh=observed({...snapshot(),identity:freshCtx.identity},freshCtx,running(freshCtx,stopped.value))
 const final=policy.publishGraphEvent(fresh,event('stopped',{identity:freshCtx.identity,generation:3,order:2,reason:'complete',stop:'confirmed'}),{...freshCtx,lastEventOrder:1})
 assert.equal(final.ok,true);assert.equal(final.value.lastComplete.identity.analysisId,'analysis:003')
})


for(const sourceState of ['changed','unknown'])for(const type of ['progress','stopped'])test('Q2 '+type+' reflects '+sourceState+' source facts for an already observed result',()=>{
 const ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002'}}),state=observed({...snapshot(),identity:ctx.identity},ctx,running(ctx,completed()))
 const before=structuredClone(state),facts={...ctx,lastEventOrder:1,sourceState,observedAt:sourceState==='unknown'?null:'2026-11-04T10:00:02.000Z'}
 const update=event(type,{identity:ctx.identity,generation:2,order:2,...(type==='progress'?{phase:'collecting'}:{reason:'interrupted',stop:'unknown'})})
 const r=policy.publishGraphEvent(state,update,facts)
 assert.equal(r.ok,true);assert.equal(r.value.freshness.status,sourceState==='changed'?'changed':'unverified');assert.equal(r.value.freshness.sourceRevision,state.result.snapshot.identity.sourceRevision)
 assert.deepEqual(r.value.result,before.result);assert.deepEqual(r.value.lastComplete,before.lastComplete);assert.deepEqual(state,before)
 if(type==='progress')assert.deepEqual(r.value.activity,before.activity)
 else {assert.equal(r.value.activity.phase,'terminal');assert.equal(r.value.activity.stop,'unknown');assert.equal(r.value.activity.outcome,'unknown')}
})
test('Q2 non-result events never promote an earlier or unverified result from current attempt facts',()=>{
 for(const sourceState of ['unchanged','changed','unknown']){
  const prior=policy.restoreGraphState(completed(),scope()).value,ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002',sourceRevision:sha('9')},sourceState,observedAt:sourceState==='unknown'?null:'2026-11-04T10:00:02.000Z'})
  const state=running(ctx,prior),r=policy.publishGraphEvent(state,event('progress',{identity:ctx.identity,generation:2,phase:'collecting'}),ctx)
  assert.equal(r.ok,true);assert.notEqual(r.value.freshness.status,'observed');assert.equal(r.value.freshness.sourceRevision,prior.result.snapshot.identity.sourceRevision)
  assert.deepEqual(r.value.result,prior.result);assert.deepEqual(r.value.lastComplete,prior.lastComplete)
 }
 const empty=policy.publishGraphEvent(running(),event('progress',{phase:'collecting'}),expected())
 assert.equal(empty.ok,true);assert.equal(empty.value.freshness.status,'unverified');assert.equal(empty.value.result.snapshot,null)
})
const terminalWithCoverage=status=>{
 if(status==='complete')return completed()
 const value=snapshot();value.coverage={...value.coverage,status:'partial',limitations:['unreadable file']}
 const state=observed(value),r=policy.publishGraphEvent(state,event('stopped',{order:2,reason:'partial',stop:'confirmed'}),expected({lastEventOrder:1}))
 assert.equal(r.ok,true);return r.value
}
for(const outcome of ['complete','partial'])for(const mismatch of ['analysis','source-revision','status'])test('Q3 '+outcome+' outcome rejects result '+mismatch+' mismatch on validation and restore',()=>{
 const saved=terminalWithCoverage(outcome);saved.freshness.status='unverified'
 if(mismatch==='analysis')saved.result.snapshot.identity.analysisId='foreign-analysis'
 else if(mismatch==='source-revision')saved.result.snapshot.identity.sourceRevision=sha('9')
 else saved.result={status:'absent',snapshot:null,error:null}
 const before=structuredClone(saved)
 assert.equal(contracts.validateGraphState(saved).ok,false);assert.equal(policy.restoreGraphState(saved,scope()).ok,false);assert.deepEqual(saved,before)
})
test('Q3 matching terminal and historical outcomes restore passively while a new running attempt may retain a previous result',()=>{
 for(const outcome of ['complete','partial']){
  const terminal=terminalWithCoverage(outcome),r=policy.restoreGraphState(terminal,scope())
  assert.equal(r.ok,true);assert.equal(r.value.activity.phase,'historical');assert.equal(r.value.activity.outcome,outcome);assert.equal(r.value.freshness.status,'unverified');assert.deepEqual(r.value.result,terminal.result)
  assert.equal(contracts.validateGraphState(r.value).ok,true);assert.equal(policy.restoreGraphState(r.value,scope()).ok,true)
  const ctx=expected({generation:2,identity:{...identity(),analysisId:'analysis:002',sourceRevision:sha('9')}}),next=running(ctx,terminal)
  assert.equal(contracts.validateGraphState(next).ok,true);assert.deepEqual(next.result,terminal.result)
  const restored=policy.restoreGraphState(next,scope());assert.equal(restored.ok,true);assert.equal(restored.value.activity.outcome,'unknown');assert.equal(restored.value.activity.stop,'unknown');assert.deepEqual(restored.value.result,terminal.result)
 }
})

