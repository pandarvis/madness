/** Documentary spike 2.10 only. These private reducers must not be imported by product 2.11. */
import assert from 'node:assert/strict'
import {readFile, writeFile, mkdir, lstat, realpath, readdir, unlink} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {resolve, dirname, relative, isAbsolute, sep, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {isBmadProgressSnapshot} from '../../src/contracts/bmad-progress.ts'
import {projectBmadProgress} from '../../src/core/bmad-progress.ts'

const repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const base=join(repository,'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-mesures-us')
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
const json=async path=>JSON.parse(await readFile(path,'utf8'))
const same=(actual,expected,label)=>assert.deepStrictEqual(actual,expected,label)
const cases=[]
function check(id,matrix,kind,fn){const result=fn();cases.push({id,matrix,evidenceClass:kind,status:'passed'});return result}
const prospective='local-prospective-not-product'
const safePath=(parent,name)=>{const path=resolve(parent,name),part=relative(parent,path);assert(part&&!part.startsWith('..'+sep)&&part!=='..'&&!isAbsolute(part),'PATH_OUTSIDE_OWNED_ROOT');return path}
async function noLinks(path){let current=path;for(;;){const stat=await lstat(current);assert(!stat.isSymbolicLink(),'LINK_REFUSED');const parent=dirname(current);if(parent===current)break;current=parent}}
const pointer=(value,path)=>path.slice(1).split('/').reduce((v,k)=>v[k],value)
const methodWhitelist=new Set(['item/tool/call','item/tool/requestUserInput','item/fileChange/requestApproval','item/started','item/completed','rawResponseItem/completed','serverRequest/resolved','turn/started','turn/completed','thread/started','error','other'])
function historicalExtract(raw,sourceSha256){
 const trace=raw.controlTrace
 return {schemaVersion:1,evidenceClass:'historical-filtered-observer',sourceSha256,filter:{originalMethodWhitelist:'scripts/qualification/epic-one-control-trace.mjs:14',unknownMethod:'other',deltas:'suppressed',contentArgumentsPidsPathsRawIds:'omitted'},observer:Object.fromEntries(['complete','limits','droppedEvents','suppressedDeltas','incomplete'].map(k=>[k,trace[k]])),events:trace.events.map(e=>Object.fromEntries(['sequence','direction','type','rpcRef','threadRef','turnRef','method'].filter(k=>Object.hasOwn(e,k)).map(k=>[k,e[k]]))),turns:raw.turns.map(t=>Object.fromEntries(['threadRef','turnRef','deltas','deltaBeforeTerminal','terminal'].map(k=>[k,t[k]]))),metrics:{localDuration:'unavailable',nativeDuration:'not-preserved-by-filter',usage:'not-preserved-by-filter',cost:'unavailable',currency:null}}
}
function assertSanitized(fixture){
 const allowed=['sequence','direction','type','rpcRef','threadRef','turnRef','method']
 for(const e of fixture.events){assert(Object.keys(e).every(k=>allowed.includes(k)),'UNSAFE_EVENT_FIELD');assert(Number.isSafeInteger(e.sequence)&&e.sequence>0);assert(['stdin','stdout'].includes(e.direction));assert(['request','notification','refusal'].includes(e.type));for(const k of ['rpcRef','threadRef','turnRef'])assert(e[k]===undefined||e[k]===null||/^[a-f0-9]{64}$/.test(e[k]),'RAW_ID_REFUSED');assert(e.method===undefined||methodWhitelist.has(e.method),'UNFILTERED_METHOD')}
 for(const t of fixture.turns){same(Object.keys(t),['threadRef','turnRef','deltas','deltaBeforeTerminal','terminal']);for(const k of ['threadRef','turnRef'])assert(t[k]===null||/^[a-f0-9]{64}$/.test(t[k]))}
}
function identity(fixture){
 const {snapshot:s,selection:q}=fixture
 assert(isBmadProgressSnapshot(s),'INVALID_CURRENT_PROGRESS_FIXTURE')
 const fail=reason=>({eligible:false,reason,key:null,capture:null})
 if(!q.explicit||!q.beforeTurn)return fail('not-selected-before-turn')
 if(q.projectId!==s.projectId||q.rootIdentity!==s.rootIdentity||q.initiativeId!==s.initiativeId)return fail('context-mismatch')
 if(q.proofRevision!==s.revision||q.observation!=='current')return fail('stale-proof')
 if(q.type!=='story'||!s.sources.some(source=>source.id===q.typeSourceId))return fail('type-not-qualified')
 if(typeof q.ticketId!=='string'||q.ticketId.startsWith('@')||!q.ticketId)return fail('ambiguous-id')
 const rows=projectBmadProgress(s).tickets.filter(t=>t.container===q.container&&t.ticketId===q.ticketId)
 if(rows.length!==1||rows[0].declarations.filter(d=>d.field==='existence'&&d.value==='entry').length!==1||rows[0].declarations.filter(d=>d.field==='existence'&&d.value==='leaf').length>1)return fail('ambiguous-id')
 if(!rows[0].declarations.some(d=>d.sourceId===q.typeSourceId))return fail('type-not-qualified')
 if(typeof q.occurrenceId!=='string'||!q.occurrenceId)return fail('unknown-occurrence')
 const key=JSON.stringify([s.projectId,s.rootIdentity,s.initiativeId,q.container,q.ticketId,q.occurrenceId])
 return {eligible:true,reason:'eligible',key,capture:{projectId:s.projectId,rootPath:s.rootPath,rootIdentity:s.rootIdentity,initiativeId:s.initiativeId,initiativePath:s.initiativePath,container:q.container,ticketId:q.ticketId,type:q.type,typeSourceId:q.typeSourceId,occurrenceId:q.occurrenceId,contextRevision:s.contextRevision,proofRevision:s.revision,sources:structuredClone(s.sources)}}
}
const scopeKey=c=>JSON.stringify([c.scope.runId,c.scope.providerId,c.scope.connectionId,c.scope.threadId,c.scope.turnId,c.scope.conversationId])
function timeline(fixture,identities){
 const binding=identities.get(fixture.bindingRef),scope=structuredClone(fixture.scope)
 const result={id:fixture.id,scope,turnKey:scopeKey(fixture),bindingKey:binding?.eligible?binding.key:null,captured:binding?.eligible?{...structuredClone(binding.capture),context:{projectId:binding.capture.projectId,initiativeId:binding.capture.initiativeId,...scope}}:null,durationMs:null,reason:'missing-ack',interval:null}
 const seen=new Map(),events=[]
 for(const e of fixture.events){const payload=JSON.stringify(e);if(seen.has(e.id)){if(seen.get(e.id)!==payload)return {...result,reason:'event-conflict'};continue}seen.set(e.id,payload);events.push(e)}
 const unique=values=>[...new Map(values.map(e=>{const {id,...payload}=e;return [JSON.stringify(payload),e]})).values()]
 const starts=unique(events.filter(e=>e.kind==='accepted'))
 if(!starts.length)return result
 if(starts.length!==1)return {...result,reason:'boundary-conflict'}
 const ends=unique(events.filter(e=>e.kind==='terminal'&&e.received===true&&['completed','failed','interrupted'].includes(e.status)||e.kind==='stop-confirmed'&&e.confirmed===true))
 if(!ends.length)return {...result,reason:events.some(e=>e.kind==='stop-unknown')?'stop-unconfirmed':'missing-end'}
 if(ends.length!==1)return {...result,reason:'boundary-conflict'}
 const start=starts[0],end=ends[0]
 if(!Number.isSafeInteger(start.monoMs)||!Number.isSafeInteger(end.monoMs)||start.monoMs<0||end.monoMs<0)return {...result,reason:'invalid-boundary'}
 if(!start.durable||!end.durable)return {...result,reason:'undurable-boundary'}
 if(typeof start.clock!=='string'||!start.clock||start.clock!==end.clock)return {...result,reason:'clock-mismatch'}
 if(end.monoMs<start.monoMs)return {...result,reason:'non-monotone'}
 return {...result,durationMs:end.monoMs-start.monoMs,reason:'closed',interval:{clock:start.clock,start:start.monoMs,end:end.monoMs}}
}
function aggregate(fixtures,identities){
 const turns=new Map(),payloads=new Map()
 for(const fixture of fixtures){const key=scopeKey(fixture),payload=JSON.stringify({scope:fixture.scope,bindingRef:fixture.bindingRef,events:fixture.events});if(payloads.has(key)){if(payloads.get(key)!==payload){const previous=turns.get(key),incoming=timeline(fixture,identities),contradictoryBinding=previous.bindingKey!==incoming.bindingKey;turns.set(key,{...previous,...(contradictoryBinding?{bindingKey:null,captured:null}:{}),durationMs:null,reason:'turn-identity-conflict',interval:null})}continue}payloads.set(key,payload);turns.set(key,timeline(fixture,identities))}
 const all=[...turns.values()],known=all.filter(t=>t.durationMs!==null),unknown=all.length-known.length
 let overlapPairs=0,overlapUnknownPairs=0
 for(let i=0;i<known.length;i++)for(let j=i+1;j<known.length;j++){const a=known[i],b=known[j];if(a.scope.runId!==b.scope.runId||a.interval.clock!==b.interval.clock){overlapUnknownPairs++;continue}if(Math.max(a.interval.start,b.interval.start)<Math.min(a.interval.end,b.interval.end))overlapPairs++}
 const groups=new Map()
 for(const turn of all){const key=turn.bindingKey??'unassigned';const group=groups.get(key)??{key,knownDurationMs:null,knownTurns:0,unknownTurns:0,conversations:new Set()};if(turn.durationMs===null)group.unknownTurns++;else{group.knownDurationMs=(group.knownDurationMs??0)+turn.durationMs;group.knownTurns++}group.conversations.add(turn.scope.conversationId);groups.set(key,group)}
 return {knownDurationMs:known.length?known.reduce((sum,t)=>sum+t.durationMs,0):null,knownTurns:known.length,unknownTurns:unknown,coverage:!known.length?'unknown':unknown?'partial':'complete',overlapPairs,overlapUnknownPairs,usCount:[...groups.keys()].filter(k=>k!=='unassigned').length,groups:[...groups.values()].map(g=>({...g,conversations:[...g.conversations]})),turns:all}
}
async function protectedHashes(){const baseline=await json(join(base,'provenance/protected-inputs.json'));assert(Object.keys(baseline.files).length===161);const actual={};for(const name of Object.keys(baseline.files))actual[name]=digest(await readFile(safePath(repository,name)));same(actual,baseline.files,'PRODUCT_INPUT_CHANGED');const asar=digest(await readFile(safePath(repository,baseline.candidate.asar)));same(asar,baseline.candidate.sha256,'CANDIDATE_CHANGED');return {files:actual,candidate:baseline.candidate,allMatched:true}}

async function main(){
 const args=process.argv.slice(2);assert(args.length===1&&args[0].startsWith('--output='),'REQUIRE_ONE_NEW_OUTPUT')
 const output=resolve(repository,args[0].slice('--output='.length)),runs=join(base,'runs')
 safePath(runs,relative(runs,output));await mkdir(runs,{recursive:true});await noLinks(runs);same(await realpath(runs),runs,'NONPHYSICAL_OUTPUT_PARENT')
 // New direct child only: no path traversal, overwrite, unknown cleanup or product output.
 assert(dirname(output)===runs,'OUTPUT_MUST_BE_DIRECT_CHILD_OF_QUALIFICATION_RUNS')
 await mkdir(output);await writeFile(join(output,'.us-metrics-owner.json'),JSON.stringify({schemaVersion:1,owner:'madness-us-metrics-2.10',output:relative(repository,output),createdAt:new Date().toISOString()})+'\n',{flag:'wx'})
 const before=await protectedHashes(),index=await json(join(base,'fixtures/index.json'))
 for(const record of index.sources){same(digest(await readFile(safePath(repository,record.source))),record.sourceSha256,'SOURCE_CHANGED');if(record.copy)same(digest(await readFile(safePath(base,record.copy))),record.copySha256)}
 const inventory=await json(join(base,index.schemaExport.inventory));same(inventory.length,267)
 for(const record of inventory){const bytes=await readFile(safePath(repository,record.path));same(digest(bytes),record.sha256);JSON.parse(bytes)}
 same(digest(await readFile(safePath(repository,index.schemaExport.receipt))),index.schemaExport.receiptSha256)
 const historic=[]
 for(const entry of index.historical){
  const bytes=await readFile(safePath(repository,entry.source)),fixtureBytes=await readFile(safePath(base,entry.fixture));same(digest(bytes),entry.sourceSha256);same(digest(fixtureBytes),entry.fixtureSha256)
  const fixture=JSON.parse(fixtureBytes),raw=JSON.parse(bytes)
  check(entry.fixture,'M8','historical-filtered-observer',()=>{same(historicalExtract(raw,entry.sourceSha256),fixture);assertSanitized(fixture);assert(fixture.observer.complete&&!fixture.observer.droppedEvents&&!Object.values(fixture.observer.incomplete).some(Boolean));same(fixture.metrics.cost,'unavailable');same(fixture.metrics.currency,null)})
  historic.push({fixture:entry.fixture,events:fixture.events.length,turns:fixture.turns.length,completeWithinFilter:fixture.observer.complete,usage:'not-preserved-by-filter',duration:'not-preserved-by-filter'})
 }
 const schemaFixtures=[]
 for(const entry of index.schemas){
  const bytes=await readFile(safePath(repository,entry.source)),fixtureBytes=await readFile(safePath(base,entry.fixture));same(digest(bytes),entry.sourceSha256);same(digest(fixtureBytes),entry.fixtureSha256)
  const schema=JSON.parse(bytes),fixture=JSON.parse(fixtureBytes)
  check(entry.fixture,'M6','native-schema-only',()=>{same(fixture.receivedValues,false);same(fixture.declarations,entry.pointers.map(p=>({pointer:p,declaration:pointer(schema,p)})))})
  schemaFixtures.push(fixture)
 }
 check('schema-semantics','M6','native-schema-only',()=>{
  for(const f of schemaFixtures.filter(f=>f.declarations.some(d=>d.pointer==='/definitions/Turn/required'))){for(const name of ['startedAt','completedAt','durationMs']){const d=f.declarations.find(d=>d.pointer==='/definitions/Turn/properties/'+name).declaration;same(d.type,['integer','null']);same(d.format,'int64');assert(d.description.includes(name==='durationMs'?'milliseconds':'seconds'))}}
  const usage=schemaFixtures.find(f=>f.declarations.some(d=>d.declaration==='ThreadTokenUsageUpdatedNotification'))
  const definitions=usage.declarations.find(d=>d.pointer==='/definitions').declaration;same(definitions.ThreadTokenUsage.required,['last','total']);same(definitions.TokenUsageBreakdown.required,['cachedInputTokens','inputTokens','outputTokens','reasoningOutputTokens','totalTokens']);assert(Object.values(definitions.TokenUsageBreakdown.properties).every(d=>d.format==='int64'))
 })
 const identityData=await json(join(base,'fixtures/prospective/identity.json')),identities=new Map()
 for(const fixture of identityData.cases){const result=check(fixture.id,'M1',prospective,()=>{const value=identity(fixture);same({eligible:value.eligible,reason:value.reason},fixture.expected);return value});identities.set(fixture.id,result)}
 for(const pair of identityData.pairs)check('identity-pair:'+pair.left+'/'+pair.right,'M1',prospective,()=>{same(identities.get(pair.left).key===identities.get(pair.right).key,pair.same)})
 const timelineData=await json(join(base,'fixtures/prospective/timeline.json')),timelines=new Map(timelineData.cases.map(c=>[c.id,c])),local=[]
 for(const fixture of timelineData.cases){const result=check(fixture.id,fixture.matrix,prospective,()=>{const value=timeline(fixture,identities);same({durationMs:value.durationMs,reason:value.reason},fixture.expected);if(fixture.expectedBinding)same(value.bindingKey,identities.get(fixture.expectedBinding).key);if(value.captured){same(value.captured.context.conversationId,fixture.scope.conversationId);same(value.captured.sources,identities.get(fixture.bindingRef).capture.sources)}return value});local.push(result)}
 const aggregateData=await json(join(base,'fixtures/prospective/aggregate.json')),aggregates=[]
 for(const fixture of aggregateData.cases){const result=check(fixture.id,'M5',prospective,()=>{const value=aggregate(fixture.refs.map(ref=>timelines.get(ref)),identities);same(Object.fromEntries(Object.keys(fixture.expected).map(k=>[k,value[k]])),fixture.expected);if(fixture.expectedGroups)for(const expected of fixture.expectedGroups){const key=expected.bindingRef===null?'unassigned':identities.get(expected.bindingRef).key,actual=value.groups.find(g=>g.key===key),{bindingRef,...fields}=expected;same(Object.fromEntries(Object.keys(fields).map(k=>[k,actual[k]])),fields)}return value});aggregates.push({id:fixture.id,...result})}
 for(const fixture of aggregateData.conflictCases)check(fixture.id,'M3',prospective,()=>{
  const a=timelines.get(fixture.baseRef),b=structuredClone(a)
  if(Object.hasOwn(fixture.alternate,'bindingRef'))b.bindingRef=fixture.alternate.bindingRef
  if(Object.hasOwn(fixture.alternate,'terminalMs'))b.events.find(e=>e.kind==='terminal').monoMs=fixture.alternate.terminalMs
  const value=aggregate([a,b],identities)
  same(Object.fromEntries(Object.keys(fixture.expected).map(k=>[k,value[k]])),fixture.expected)
  same(value.turns[0].reason,fixture.expectedReason)
  same(value.turns[0].bindingKey,fixture.expectedBindingRef===null?null:identities.get(fixture.expectedBindingRef).key)
  if(fixture.expectedBindingRef===null)same(value.turns[0].captured,null)
  if(fixture.orderInvariant){same(aggregate([b,a],identities),value);same(aggregate([a,b,a],identities),value)}
 })
 check('no-retroactive-reassignment','M3',prospective,()=>{const a=timeline(timelines.get('late-after-navigation'),identities);same(a.bindingKey,identities.get('story-with-leaf').key);assert(a.bindingKey!==identities.get('other-project').key)})
 const availabilityData=await json(join(base,'fixtures/prospective/availability.json'))
 const availability=check('availability-remains-unavailable','M6',prospective,()=>{const f=availabilityData.facts;assert(f.schemaDeclared&&!f.receivedAttributedUsage&&!f.persistedUsage&&!f.receivedNativeDuration&&!f.currentLocalTiming&&f.currency===null&&f.price===null);const value={usage:'unavailable',cost:'unavailable',currency:null,nativeDuration:'schema-only',localDuration:'future-instrumentation'};same(value,availabilityData.expected);return value})
 check('schema-cannot-supply-attributable-money','M6','native-schema-only',()=>{
  const usage=schemaFixtures.find(f=>f.declarations.some(d=>d.declaration==='ThreadTokenUsageUpdatedNotification')),account=schemaFixtures.find(f=>f.declarations.some(d=>d.declaration==='GetAccountTokenUsageResponse'))
  const usageProperties=usage.declarations.find(d=>d.pointer==='/properties').declaration
  same(Object.keys(usageProperties),['threadId','tokenUsage','turnId'])
  const accountProperties=account.declarations.find(d=>d.pointer==='/properties').declaration
  same(Object.keys(accountProperties),['dailyUsageBuckets','summary'])
  const keys=value=>value&&typeof value==='object'?Object.entries(value).flatMap(([k,v])=>[k,...keys(v)]):[]
  assert(!keys(account.declarations).some(k=>['threadId','turnId','storyId','currency','price','cost'].includes(k)))
  assert(!keys(usage.declarations).some(k=>['currency','price','cost'].includes(k)))
 })
 check('sanitizer-counterexamples','M8','historical-filtered-observer',()=>{assert.throws(()=>assertSanitized({events:[{sequence:1,direction:'stdout',type:'notification',method:'other',arguments:'SECRET'}],turns:[]}));assert.throws(()=>assertSanitized({events:[{sequence:1,direction:'stdout',type:'notification',method:'other',threadRef:'raw-id'}],turns:[]}))})
 // Preserve/reopen synthetic documentary data only, with literal before/after projection equality.
 const persisted={evidenceClass:prospective,identities:identityData,timelines:timelineData,aggregates:aggregateData,availability:availabilityData}
 const reopen=join(output,'reopen-fixtures.json');await writeFile(reopen,JSON.stringify(persisted)+'\n',{flag:'wx'});const reread=await json(reopen)
 check('passive-documentary-reopen','M7',prospective,()=>{same(reread,persisted);const reids=new Map(reread.identities.cases.map(c=>[c.id,identity(c)]));same(reread.timelines.cases.map(c=>timeline(c,reids)),local);for(const fixture of reread.aggregates.cases){same(aggregate(fixture.refs.map(ref=>reread.timelines.cases.find(c=>c.id===ref)),reids),aggregates.find(c=>c.id===fixture.id)&&Object.fromEntries(Object.entries(aggregates.find(c=>c.id===fixture.id)).filter(([k])=>k!=='id')))}})
 const reopenedBytes=await readFile(reopen),owner=await json(join(output,'.us-metrics-owner.json'));same(owner.owner,'madness-us-metrics-2.10');same(owner.output,relative(repository,output));await noLinks(output);await unlink(reopen)
 const cleanup={onlyOwnedDuplicateReopenFixture:true,bytes:reopenedBytes.length,sha256:digest(reopenedBytes),removed:true,retained:'canonical fixtures and verification report'}
 const after=await protectedHashes();same(after,before)
 check('161-product-inputs-and-asar-identical','M7','scope',()=>{same(after.files,before.files);same(after.candidate,before.candidate)})
 const fixtureInventory=[]
 async function allJson(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const path=join(folder,entry.name);assert(!entry.isSymbolicLink());if(entry.isDirectory())await allJson(path);else if(entry.name.endsWith('.json')){const bytes=await readFile(path);JSON.parse(bytes);fixtureInventory.push({path:relative(base,path).replaceAll('\\','/'),sha256:digest(bytes)})}}}
 await allJson(join(base,'fixtures'));await allJson(join(base,'provenance'))
 const report={schemaVersion:1,scope:'documentary-spike-only-not-product-instrumentation',at:new Date().toISOString(),status:'passed',executedCases:cases.length,skipped:0,cases,matrix:Object.fromEntries(['M1','M2','M3','M4','M5','M6','M7','M8'].map(m=>[m,cases.filter(c=>c.matrix===m).map(c=>c.id)])),classCounts:Object.fromEntries([...new Set(cases.map(c=>c.evidenceClass))].map(k=>[k,cases.filter(c=>c.evidenceClass===k).length])),historical:historic,schema:{cliVersion:'0.144.6',inventoryCount:267,excerptCount:4,receivedUsage:false,receivedNativeTiming:false,monetaryValue:false},availability,localResults:local,aggregateResults:aggregates,cleanup,protected:{count:161,beforeMatched:true,afterMatched:true,candidate:after.candidate},fixtureInventory,passivity:{implementation:'fs,crypto,path,url,assert plus existing progress validators/projection; no provider/process/network code invoked',reopen:'only owned documentary fixture file; no app/profile or product persistence touched'},limitations:['Local fixtures describe future 2.11 instrumentation, not current product capability.','Old observers remove unlisted methods and deltas; they cannot prove native usage absence.','Native timing and usage are schema-only; receipt, semantics and durable storage remain unqualified.','Account aggregates cannot be allocated to stories; monetary cost and currency are unavailable.','Silent occurrence reuse without an observed discontinuity cannot universally be detected.','Cross-clock overlap comparisons are unknown; sums are distinct turn durations, not elapsed/human/CPU time.']}
 await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'})
 console.log(JSON.stringify({status:report.status,executedCases:report.executedCases,skipped:0,output:relative(repository,output),protected:161,asar:after.candidate.sha256}))
}
main().catch(error=>{console.error(error);process.exitCode=1})
