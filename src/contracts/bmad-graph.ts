/** Contrat normalisé uniquement : aucun décodage Graphify, accès disque ou API Node. */
export const GRAPH_CONTRACT_VERSION = 1 as const
export const GRAPH_PROFILE = 'graphifyy-0.9.101-windows-cpython312-code-only-local-spike-v1' as const

export type GraphScope = {projectId:string; rootPath:string; rootIdentity:string; scopeId:string; scopeRevision:string}
export type GraphIdentity = GraphScope & {analysisId:string; sourceRevision:string}
export type GraphSource = {relativePath:string; sha256:string; lineCount:number|null; kind:'file'|'link'|'unknown'}
export type GraphLine = {status:'known'; value:number}|{status:'unknown'; reason:'absent'|'unrecognized'}
export type GraphReference = {status:'known'; relativePath:string; line:GraphLine}|{status:'unknown'; reason:'absent'|'unrecognized'}
export type GraphNode = {id:string; label:string; kind:string; reference:GraphReference}
export type GraphRelation = {id:string; source:string; target:string; kind:string; directionSource:'explicit-markers'|'source-target'; confidence:'EXTRACTED'|'INFERRED'|'AMBIGUOUS'; score:number|null; reference:GraphReference}
export type GraphSnapshot = {
 schemaVersion:1; identity:GraphIdentity
 provenance:{profile:typeof GRAPH_PROFILE; tool:'graphifyy'; toolVersion:'0.9.101'; nativeSchemaVersion:1; artifact:'clustered-node-link'; nativeSha256:string; assemblyRevision:string; normalizerVersion:1}
 collectedAt:string|null
 coverage:{status:'complete'|'partial'; included:string[]; excluded:string[]; limitations:string[]}
 sources:GraphSource[]; nodes:GraphNode[]; relations:GraphRelation[]
}
export type GraphIssueCode = 'INVALID_DATA'|'INVALID_SHAPE'|'INCOMPATIBLE_VERSION'|'INCOMPATIBLE_PROFILE'|'DUPLICATE_ID'|'INVALID_REFERENCE'|'INVALID_CONFIDENCE'|'CONTEXT_MISMATCH'|'CORPUS_MISMATCH'|'SUPERSEDED'|'EVENT_ORDER'|'INVALID_TRANSITION'|'BUSY'|'STOP_UNCONFIRMED'
export type GraphIssue = {code:GraphIssueCode; messageKey:string; path:string}
export type GraphValidation<T> = {ok:true; value:T}|{ok:false; issues:GraphIssue[]}
/** Ces faits proviennent des propriétaires projet/corpus/ordre, jamais du candidat. */
export type ExpectedGraphContext = {
 identity:GraphIdentity; generation:number; correlationId:string; lastEventOrder:number
 corpus:GraphSource[]; coverage:{included:string[];excluded:string[]}; sourceState:'unchanged'|'changed'|'unknown'; observedAt:string|null
}
export type GraphCommand = {contractVersion:1; correlationId:string}&(
 {type:'read'}|{type:'generate'; projectId:string; scopeId:string}|
 {type:'interrupt'; projectId:string; scopeId:string; analysisId:string}|
 {type:'retry-save'; projectId:string; scopeId:string})
export type GraphFailure = {code:'ANALYSIS_FAILED'|'INCOMPATIBLE'|'STOP_UNCONFIRMED'; messageKey:string; outcome:'failed'|'unknown'; recovery:'retry-after-check'|'inspect-profile'|'check-stop'}
type GraphEventBase = {contractVersion:1; correlationId:string; identity:GraphIdentity; generation:number; order:number}
export type GraphAnalysisEvent = GraphEventBase & (
 {type:'started'}|{type:'progress'; phase:string|null}|
 {type:'result'; snapshot:GraphSnapshot}|
 {type:'failed'; error:GraphFailure}|
 {type:'stopped'; reason:'complete'|'partial'|'failed'|'incompatible'|'interrupted'|'timeout'; stop:'confirmed'|'unknown'})
export type GraphActivity = {
 phase:'idle'|'running'|'stop-requested'|'terminal'|'historical'
 analysisId:string|null; sourceRevision:string|null; correlationId:string|null; generation:number
 outcome:'none'|'complete'|'partial'|'failed'|'incompatible'|'interrupted'|'timeout'|'unknown'
 stop:'not-observed'|'confirmed'|'unknown'
}
export type GraphFreshness = {status:'unverified'|'changed'|'observed'; sourceRevision:string|null; observedAt:string|null}
export type GraphState = {
 contractVersion:1; scope:GraphScope; lastEventOrder:number; activity:GraphActivity
 result:{status:'absent'|'complete'|'partial'|'failed'|'incompatible'; snapshot:GraphSnapshot|null; error:GraphFailure|null}
 lastComplete:GraphSnapshot|null; freshness:GraphFreshness
 preservation:{status:'unrecorded'|'pending'|'stored'|'failed'|'unreadable'; durableAnalysisId:string|null}
}

type DataRecord = Record<string,unknown>
class InvalidGraph {
 readonly issue:GraphIssue; constructor(issue:GraphIssue){this.issue=issue}
}
function refuse(code:GraphIssueCode,path:string):never {throw new InvalidGraph({code,path,messageKey:'graph.error.'+code.toLowerCase()})}

/**
 * Copie itérative d'un arbre de données par descripteurs, sans appeler getters/toJSON.
 * Cycles, fonctions, prototypes spéciaux et propriétés non-JSON sont refusés.
 * Un Proxy actif peut encore exécuter ses traps : ceci n'est pas un sandbox JS.
 */
function copyData(input:unknown):unknown {
 const holder:DataRecord = {}
 const active = new WeakSet<object>()
 type Task = {value:unknown; parent:DataRecord|unknown[]; key:string; path:string}|{exit:object}
 const stack:Task[] = [{value:input,parent:holder,key:'value',path:'$'}]
 while(stack.length){
  const task=stack.pop()!
  if('exit' in task){active.delete(task.exit);continue}
  const {value,parent,key,path}=task
  let copy:unknown=value
  if(value===null||typeof value==='string'||typeof value==='boolean'){}
  else if(typeof value==='number'){if(!Number.isFinite(value))refuse('INVALID_DATA',path)}
  else if(typeof value==='object'){
   if(active.has(value))refuse('INVALID_DATA',path)
   const array=Array.isArray(value),prototype=Object.getPrototypeOf(value)
   if(array?prototype!==Array.prototype:prototype!==Object.prototype&&prototype!==null)refuse('INVALID_DATA',path)
   const descriptors=Object.getOwnPropertyDescriptors(value)
   if(Reflect.ownKeys(descriptors).some(k=>typeof k!=='string'))refuse('INVALID_DATA',path)
   copy=array?[]:{}
   active.add(value);stack.push({exit:value})
   const names=Object.keys(descriptors)
   if(array){
    const length=descriptors.length?.value
    if(!Number.isSafeInteger(length)||length<0||names.length!==length+1)refuse('INVALID_DATA',path)
    // Dense arrays only; never loop to a declared sparse-array length.
    if(names.some(k=>k!=='length'&&(!/^(0|[1-9][0-9]*)$/.test(k)||Number(k)>=length)))refuse('INVALID_DATA',path)
   }
   for(let i=names.length-1;i>=0;i--){
    const name=names[i],descriptor=descriptors[name]
    if(array&&name==='length')continue
    if(!('value' in descriptor)||!descriptor.enumerable)refuse('INVALID_DATA',path+'.'+name)
    stack.push({value:descriptor.value,parent:copy as DataRecord,key:name,path:path+'.'+name})
   }
  } else refuse('INVALID_DATA',path)
  Object.defineProperty(parent,key,{value:copy,writable:true,enumerable:true,configurable:true})
 }
 return holder.value
}
function validate<T>(input:unknown,guard:(v:unknown)=>void):GraphValidation<T>{
 try{const value=copyData(input);guard(value);return {ok:true,value:value as T}}
 catch(error){return {ok:false,issues:[error instanceof InvalidGraph?error.issue:{code:'INVALID_DATA',path:'$',messageKey:'graph.error.invalid_data'}]}}
}
function record(v:unknown,keys:string[],path:string):DataRecord{
 if(v===null||typeof v!=='object'||Array.isArray(v))refuse('INVALID_SHAPE',path)
 const value=v as DataRecord
 if(Object.keys(value).length!==keys.length||!keys.every(k=>Object.hasOwn(value,k)))refuse('INVALID_SHAPE',path)
 return value
}
function text(v:unknown,path:string):asserts v is string{if(typeof v!=='string'||!v.length||v.includes('\0'))refuse('INVALID_SHAPE',path)}
function integer(v:unknown,path:string,min=0):asserts v is number{if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min)refuse('INVALID_SHAPE',path)}
function sha(v:unknown,path:string):void{if(typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v))refuse('INVALID_SHAPE',path)}
function one(v:unknown,values:readonly unknown[],path:string,code:GraphIssueCode='INVALID_SHAPE'):void{if(!values.includes(v))refuse(code,path)}
function date(v:unknown,path:string):void{if(v!==null&&(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v))refuse('INVALID_SHAPE',path)}
function array(v:unknown,path:string,check:(item:unknown,path:string)=>void):void{if(!Array.isArray(v))refuse('INVALID_SHAPE',path);v.forEach((item,i)=>check(item,path+'.'+i))}
function strings(v:unknown,path:string):void{array(v,path,text);unique((v as string[]),path)}
function unique(v:string[],path:string):void{if(new Set(v).size!==v.length)refuse('DUPLICATE_ID',path)}
function relative(v:unknown,path:string):void{
 text(v,path)
 if(/[\\:\x00-\x1f\x7f]/.test(v)||v.split('/').some(s=>!s||s==='.'||s==='..'))refuse('INVALID_REFERENCE',path)
}
const scopeKeys=['projectId','rootPath','rootIdentity','scopeId','scopeRevision']
const identityKeys=[...scopeKeys,'analysisId','sourceRevision']
function scope(input:unknown,path:string,full=false):void{
 const v=record(input,full?identityKeys:scopeKeys,path)
 for(const key of ['projectId','rootPath','rootIdentity','scopeId'])text(v[key],path+'.'+key)
 if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v.projectId as string))refuse('INVALID_SHAPE',path+'.projectId')
 sha(v.scopeRevision,path+'.scopeRevision')
 if(full){text(v.analysisId,path+'.analysisId');sha(v.sourceRevision,path+'.sourceRevision')}
}
function source(input:unknown,path:string):void{
 const v=record(input,['relativePath','sha256','lineCount','kind'],path)
 relative(v.relativePath,path+'.relativePath');sha(v.sha256,path+'.sha256')
 if(v.lineCount!==null)integer(v.lineCount,path+'.lineCount')
 one(v.kind,['file','link','unknown'],path+'.kind')
}
function corpus(input:unknown,path:string):void{
 array(input,path,source)
 unique((input as GraphSource[]).map(v=>v.relativePath),path)
}
function reference(input:unknown,path:string,sources:Map<string,GraphSource>):void{
 if(input===null||typeof input!=='object')refuse('INVALID_REFERENCE',path)
 const status=(input as DataRecord).status
 if(status==='unknown'){const v=record(input,['status','reason'],path);one(v.reason,['absent','unrecognized'],path+'.reason');return}
 const v=record(input,['status','relativePath','line'],path)
 one(v.status,['known'],path+'.status');relative(v.relativePath,path+'.relativePath')
 const file=sources.get(v.relativePath as string)
 if(!file||file.kind!=='file')refuse('INVALID_REFERENCE',path+'.relativePath')
 const line=v.line as DataRecord
 if(line?.status==='unknown'){const l=record(line,['status','reason'],path+'.line');one(l.reason,['absent','unrecognized'],path+'.line.reason')}
 else {const l=record(line,['status','value'],path+'.line');one(l.status,['known'],path+'.line.status');integer(l.value,path+'.line.value',1);if(file.lineCount===null||l.value>file.lineCount)refuse('INVALID_REFERENCE',path+'.line.value')}
}
function snapshot(input:unknown,path:string):void{
 const v=record(input,['schemaVersion','identity','provenance','collectedAt','coverage','sources','nodes','relations'],path)
 one(v.schemaVersion,[1],path+'.schemaVersion','INCOMPATIBLE_VERSION');scope(v.identity,path+'.identity',true)
 const p=record(v.provenance,['profile','tool','toolVersion','nativeSchemaVersion','artifact','nativeSha256','assemblyRevision','normalizerVersion'],path+'.provenance')
 for(const [key,value] of Object.entries({profile:GRAPH_PROFILE,tool:'graphifyy',toolVersion:'0.9.101',nativeSchemaVersion:1,artifact:'clustered-node-link',normalizerVersion:1}))one(p[key],[value],path+'.provenance.'+key,'INCOMPATIBLE_PROFILE')
 sha(p.nativeSha256,path+'.provenance.nativeSha256');sha(p.assemblyRevision,path+'.provenance.assemblyRevision');date(v.collectedAt,path+'.collectedAt')
 const c=record(v.coverage,['status','included','excluded','limitations'],path+'.coverage')
 one(c.status,['complete','partial'],path+'.coverage.status')
 for(const key of ['included','excluded','limitations'])strings(c[key],path+'.coverage.'+key)
 if((c.included as string[]).some(s=>(c.excluded as string[]).includes(s))||c.status==='complete'&&(c.limitations as string[]).length!==0||c.status==='partial'&&(c.limitations as string[]).length===0)refuse('INVALID_SHAPE',path+'.coverage')
 corpus(v.sources,path+'.sources')
 const sources=new Map((v.sources as GraphSource[]).map(s=>[s.relativePath,s]))
 array(v.nodes,path+'.nodes',(input,path)=>{
  const n=record(input,['id','label','kind','reference'],path)
  for(const key of ['id','label','kind'])text(n[key],path+'.'+key)
  reference(n.reference,path+'.reference',sources)
 })
 unique((v.nodes as GraphNode[]).map(n=>n.id),path+'.nodes')
 const ids=new Set((v.nodes as GraphNode[]).map(n=>n.id))
 array(v.relations,path+'.relations',(input,path)=>{
  const r=record(input,['id','source','target','kind','directionSource','confidence','score','reference'],path)
  for(const key of ['id','source','target','kind'])text(r[key],path+'.'+key)
  if(!ids.has(r.source as string)||!ids.has(r.target as string))refuse('INVALID_REFERENCE',path)
  one(r.directionSource,['explicit-markers','source-target'],path+'.directionSource')
  one(r.confidence,['EXTRACTED','INFERRED','AMBIGUOUS'],path+'.confidence','INVALID_CONFIDENCE')
  if(r.score!==null&&(typeof r.score!=='number'||!Number.isFinite(r.score)||r.score<0||r.score>1))refuse('INVALID_CONFIDENCE',path+'.score')
  reference(r.reference,path+'.reference',sources)
 })
 unique((v.relations as GraphRelation[]).map(r=>r.id),path+'.relations')
}
export function validateGraphSnapshot(input:unknown):GraphValidation<GraphSnapshot>{return validate(input,v=>snapshot(v,'$'))}
export function isGraphSnapshot(input:unknown):input is GraphSnapshot{return validateGraphSnapshot(input).ok}
export function validateGraphScope(input:unknown):GraphValidation<GraphScope>{return validate(input,v=>scope(v,'$'))}
export function validateExpectedGraphContext(input:unknown):GraphValidation<ExpectedGraphContext>{
 return validate(input,input=>{
  const v=record(input,['identity','generation','correlationId','lastEventOrder','corpus','coverage','sourceState','observedAt'],'$')
  scope(v.identity,'$.identity',true);integer(v.generation,'$.generation',1);text(v.correlationId,'$.correlationId');integer(v.lastEventOrder,'$.lastEventOrder')
  const coverage=record(v.coverage,['included','excluded'],'$.coverage');strings(coverage.included,'$.coverage.included');strings(coverage.excluded,'$.coverage.excluded');if((coverage.included as string[]).some(x=>(coverage.excluded as string[]).includes(x)))refuse('INVALID_SHAPE','$.coverage');corpus(v.corpus,'$.corpus');one(v.sourceState,['unchanged','changed','unknown'],'$.sourceState');date(v.observedAt,'$.observedAt')
  if(v.sourceState==='unchanged'&&v.observedAt===null)refuse('INVALID_SHAPE','$.observedAt')
 })
}
function command(input:unknown):void{
 if(input===null||typeof input!=='object')refuse('INVALID_SHAPE','$')
 const type=(input as DataRecord).type,base=['contractVersion','correlationId','type']
 const keys=type==='read'?base:type==='interrupt'?[...base,'projectId','scopeId','analysisId']:[...base,'projectId','scopeId']
 const v=record(input,keys,'$');one(v.contractVersion,[1],'$.contractVersion','INCOMPATIBLE_VERSION');text(v.correlationId,'$.correlationId')
 one(type,['read','generate','interrupt','retry-save'],'$.type')
 if(type!=='read'){text(v.projectId,'$.projectId');if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v.projectId as string))refuse('INVALID_SHAPE','$.projectId');text(v.scopeId,'$.scopeId')}
 if(type==='interrupt')text(v.analysisId,'$.analysisId')
}
export function validateGraphCommand(input:unknown):GraphValidation<GraphCommand>{return validate(input,command)}
export function isGraphCommand(input:unknown):input is GraphCommand{return validateGraphCommand(input).ok}
function failure(input:unknown,path:string):void{
 const v=record(input,['code','messageKey','outcome','recovery'],path)
 const facts={ANALYSIS_FAILED:['failed','retry-after-check'],INCOMPATIBLE:['failed','inspect-profile'],STOP_UNCONFIRMED:['unknown','check-stop']} as const
 one(v.code,Object.keys(facts),path+'.code')
 const pair=facts[v.code as keyof typeof facts]
 one(v.outcome,[pair[0]],path+'.outcome');one(v.recovery,[pair[1]],path+'.recovery')
 one(v.messageKey,['graph.error.'+(v.code as string).toLowerCase()],path+'.messageKey')
}
function sameIdentity(a:GraphIdentity,b:GraphIdentity):boolean{return identityKeys.every(k=>a[k as keyof GraphIdentity]===b[k as keyof GraphIdentity])}
export function sameGraphScope(a:GraphScope,b:GraphScope):boolean{return scopeKeys.every(k=>a[k as keyof GraphScope]===b[k as keyof GraphScope])}
export function validateGraphAnalysisEvent(input:unknown):GraphValidation<GraphAnalysisEvent>{
 return validate(input,input=>{
  if(input===null||typeof input!=='object')refuse('INVALID_SHAPE','$')
  const type=(input as DataRecord).type,base=['contractVersion','correlationId','identity','generation','order','type']
  const extra=type==='progress'?['phase']:type==='result'?['snapshot']:type==='failed'?['error']:type==='stopped'?['reason','stop']:[]
  const v=record(input,[...base,...extra],'$')
  one(v.contractVersion,[1],'$.contractVersion','INCOMPATIBLE_VERSION');one(type,['started','progress','result','failed','stopped'],'$.type')
  text(v.correlationId,'$.correlationId');scope(v.identity,'$.identity',true);integer(v.generation,'$.generation',1);integer(v.order,'$.order',1)
  if(type==='progress'&&v.phase!==null)text(v.phase,'$.phase')
  if(type==='result'){snapshot(v.snapshot,'$.snapshot');if(!sameIdentity(v.identity as GraphIdentity,(v.snapshot as GraphSnapshot).identity))refuse('CONTEXT_MISMATCH','$.snapshot.identity')}
  if(type==='failed')failure(v.error,'$.error')
  if(type==='stopped'){one(v.reason,['complete','partial','failed','incompatible','interrupted','timeout'],'$.reason');one(v.stop,['confirmed','unknown'],'$.stop')}
 })
}
export function isGraphAnalysisEvent(input:unknown):input is GraphAnalysisEvent{return validateGraphAnalysisEvent(input).ok}
export function validateGraphState(input:unknown):GraphValidation<GraphState>{
 return validate(input,input=>{
  const v=record(input,['contractVersion','scope','lastEventOrder','activity','result','lastComplete','freshness','preservation'],'$')
  one(v.contractVersion,[1],'$.contractVersion','INCOMPATIBLE_VERSION');scope(v.scope,'$.scope');integer(v.lastEventOrder,'$.lastEventOrder')
  const a=record(v.activity,['phase','analysisId','sourceRevision','correlationId','generation','outcome','stop'],'$.activity')
  one(a.phase,['idle','running','stop-requested','terminal','historical'],'$.activity.phase')
  one(a.outcome,['none','complete','partial','failed','incompatible','interrupted','timeout','unknown'],'$.activity.outcome')
  one(a.stop,['not-observed','confirmed','unknown'],'$.activity.stop');integer(a.generation,'$.activity.generation')
  if(a.phase==='idle'){if(a.analysisId!==null||a.sourceRevision!==null||a.correlationId!==null||a.generation!==0||a.outcome!=='none'||a.stop!=='not-observed'||v.lastEventOrder!==0)refuse('INVALID_SHAPE','$.activity')}
  else{
   text(a.analysisId,'$.activity.analysisId');sha(a.sourceRevision,'$.activity.sourceRevision');text(a.correlationId,'$.activity.correlationId');integer(a.generation,'$.activity.generation',1)
   if(a.outcome==='none'||(a.phase==='running'||a.phase==='stop-requested')&&(!['unknown','failed','incompatible'].includes(a.outcome as string)||a.stop!=='not-observed')||(a.phase==='terminal'||a.phase==='historical')&&a.stop==='not-observed')refuse('INVALID_SHAPE','$.activity')
   if(a.stop==='unknown'&&a.outcome!=='unknown')refuse('INVALID_SHAPE','$.activity.outcome')
  }
  const r=record(v.result,['status','snapshot','error'],'$.result')
  one(r.status,['absent','complete','partial','failed','incompatible'],'$.result.status')
  if((a.outcome==='failed'||a.outcome==='incompatible')&&r.status!==a.outcome)refuse('INVALID_SHAPE','$.result.status')
  if(r.snapshot!==null){snapshot(r.snapshot,'$.result.snapshot');if(!sameGraphScope(v.scope as GraphScope,(r.snapshot as GraphSnapshot).identity))refuse('CONTEXT_MISMATCH','$.result.snapshot.identity')}
  if(r.error!==null)failure(r.error,'$.result.error')
  if(r.status==='complete'||r.status==='partial'){
   if(r.snapshot===null||(r.snapshot as GraphSnapshot).coverage.status!==r.status||r.error!==null)refuse('INVALID_SHAPE','$.result')
  }else if(r.snapshot!==null||r.status==='absent'&&r.error!==null||r.status!=='absent'&&(r.error===null||r.status==='incompatible'!==(r.error as GraphFailure).code.includes('INCOMPATIBLE')))refuse('INVALID_SHAPE','$.result')
  if(a.outcome==='complete'||a.outcome==='partial'){
   const result=r.snapshot as GraphSnapshot|null
   if(r.status!==a.outcome||result===null)refuse('INVALID_SHAPE','$.result')
   if(result.identity.analysisId!==a.analysisId||result.identity.sourceRevision!==a.sourceRevision)refuse('CONTEXT_MISMATCH','$.result.snapshot.identity')
  }
  if(v.lastComplete!==null){snapshot(v.lastComplete,'$.lastComplete');if((v.lastComplete as GraphSnapshot).coverage.status!=='complete'||!sameGraphScope(v.scope as GraphScope,(v.lastComplete as GraphSnapshot).identity))refuse('CONTEXT_MISMATCH','$.lastComplete')}
  const f=record(v.freshness,['status','sourceRevision','observedAt'],'$.freshness')
  one(f.status,['unverified','changed','observed'],'$.freshness.status');if(f.sourceRevision!==null)sha(f.sourceRevision,'$.freshness.sourceRevision');date(f.observedAt,'$.freshness.observedAt')
  if(f.status==='observed'&&(f.sourceRevision===null||f.observedAt===null||r.snapshot===null||f.sourceRevision!==(r.snapshot as GraphSnapshot).identity.sourceRevision))refuse('INVALID_SHAPE','$.freshness')
  const p=record(v.preservation,['status','durableAnalysisId'],'$.preservation')
  one(p.status,['unrecorded','pending','stored','failed','unreadable'],'$.preservation.status');if(p.durableAnalysisId!==null)text(p.durableAnalysisId,'$.preservation.durableAnalysisId')
 })
}



export type GraphAnalysisRequest = {contractVersion:1;identity:GraphIdentity;generation:number;correlationId:string;corpus:GraphSource[];coverage:{included:string[];excluded:string[]}}
export type GraphStopRequest = {contractVersion:1;identity:GraphIdentity;generation:number;correlationId:string}
export function validateGraphAnalysisRequest(input:unknown):GraphValidation<GraphAnalysisRequest>{
 return validate(input,input=>{
  const v=record(input,['contractVersion','identity','generation','correlationId','corpus','coverage'],'$')
  one(v.contractVersion,[1],'$.contractVersion','INCOMPATIBLE_VERSION');scope(v.identity,'$.identity',true);integer(v.generation,'$.generation',1);text(v.correlationId,'$.correlationId');corpus(v.corpus,'$.corpus')
  const c=record(v.coverage,['included','excluded'],'$.coverage');strings(c.included,'$.coverage.included');strings(c.excluded,'$.coverage.excluded')
  if((c.included as string[]).some(x=>(c.excluded as string[]).includes(x)))refuse('INVALID_SHAPE','$.coverage')
 })
}
export function validateGraphStopRequest(input:unknown):GraphValidation<GraphStopRequest>{
 return validate(input,input=>{
  const v=record(input,['contractVersion','identity','generation','correlationId'],'$')
  one(v.contractVersion,[1],'$.contractVersion','INCOMPATIBLE_VERSION');scope(v.identity,'$.identity',true);integer(v.generation,'$.generation',1);text(v.correlationId,'$.correlationId')
 })
}
