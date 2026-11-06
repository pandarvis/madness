/**
 * Initialization v1 data boundary. These DTOs carry no execution authority.
 * Physical identity, exhaustive inventories and proof origin belong to the injected host.
 */
import type {CapturedBmadContext} from './bmad-context.ts'
export const INITIALIZATION_CONTRACT_VERSION=1 as const
export const INITIALIZATION_ATTEMPT_LIMIT=32
export type InitializationAttempt={projectId:string;attemptId:string;generation:number}
export type InitializationIdentity=InitializationAttempt&{
 rootPath:string;rootIdentity:string;parentPath:string;parentIdentity:string;contextRevision:string
 profileId:string;sourceRevision:string;payloadRevision:string
}
export type InitializationPreconditions={
 configurationRevision:string;targetTreeRevision:string;parentTreeRevision:string;sourceRevision:string;payloadRevision:string
}
export type InitializationEntry={path:string;kind:'directory'}|{path:string;kind:'file';sha256:string;bytes:number;contentId:string}
export type InitializationPreservedEntry={path:string;kind:'directory'}|{path:string;kind:'file';sha256:string;bytes:number}
export type InitializationPlan={
 schemaVersion:1;id:string;revision:string;identity:InitializationIdentity;observedAt:string
 preconditions:InitializationPreconditions;parameters:{name:string;value:string}[]
 additions:InitializationEntry[];preserved:InitializationPreservedEntry[]
 excluded:{path:string;reason:string}[];limitations:string[]
}
type FactBase={schemaVersion:1;identity:InitializationIdentity;planId:string;planRevision:string;order:number}
export type InitializationPreconditionFact=FactBase&{kind:'preconditions';preconditions:InitializationPreconditions;complete:true}
export type InitializationApplicationFact=FactBase&{
 kind:'application';outcome:'verified'|'failed-no-effect'|'partial'|'unknown'
 observedAdditions:InitializationEntry[];unionVerified:boolean;preservedVerified:boolean
 unverifiedPaths:string[];stop:'confirmed'|'unknown';reason:string|null
}
export type InitializationInspectionFact=FactBase&{
 kind:'inspection';coverage:'complete'|'partial'|'unknown';observedAdditions:InitializationEntry[];targetIntact?:true
 unverifiedPaths:string[];stop:'confirmed'|'unknown';reason:string|null
}
export type InitializationFact=InitializationPreconditionFact|InitializationApplicationFact|InitializationInspectionFact
export type InitializationOutcome='none'|'verified'|'failed-no-effect'|'partial'|'unknown'|'stale'|'refused'|'cancelled'|'preparation-failed'
export type InitializationOperation=InitializationAttempt&{
 schemaVersion:1;revision:number;plan:InitializationPlan|null
 phase:'preparing'|'ready'|'checking'|'applying'|'verifying'|'terminal'|'historical'
 decision:'none'|'consumed'|'inactive';lastFactOrder:number;stop:'not-observed'|'confirmed'|'unknown'
 result:{outcome:InitializationOutcome;receipt:InitializationApplicationFact|null;reason:string|null}
 inspection:InitializationInspectionFact|null
 preservation:{status:'unrecorded'|'pending'|'stored'|'failed'|'unreadable';durableRevision:number|null}
}
export type InitializationState={contractVersion:1;sequence:number;operations:InitializationOperation[]}
export type InitializationCommand={contractVersion:1;projectId:string;attemptId:string;generation:number;planId:string;planRevision:string}&(
 {type:'approve';confirmation:'initialize-exact-plan'}|{type:'close'|'cancel'|'refuse'})
export type InitializationContent={contentId:string;path:string;sha256:string;bytes:number;encoding:'utf8'|'base64';data:string}
export type InitializationIssueCode='INVALID_DATA'|'INVALID_SHAPE'|'INCOMPATIBLE_VERSION'|'INVALID_PATH'|'MANIFEST_CONFLICT'|'UNTRUSTED'|'CONTEXT_MISMATCH'|'STALE'|'BUSY'|'STOP_UNCONFIRMED'|'INVALID_TRANSITION'|'EVENT_ORDER'|'UNAVAILABLE'
export type InitializationValidation<T>={ok:true;value:T}|{ok:false;issues:{code:InitializationIssueCode;path:string;messageKey:string}[]}

/** Host-only capabilities: keep them in Main/core, never serialize or expose them to a renderer.
 * authority/fact MUST resolve only producer-owned originals from a private WeakMap or equivalent.
 * prepare/recheck/apply/verify run under the core's helper lease; do not acquire it twice.
 * content/inspect are voluntary bounded reads admitted by the host's existing read/recovery owner.
 * recheck is exhaustive (target/ancestors/parent/source/payload); assertFresh alone is insufficient.
 * The host owns private-preparation helpers through the existing lifecycle owner; this policy's
 * lifecycle entry guards target dispatch, not proof that arbitrary private helpers have stopped.
 * apply performs additions only; verify attests final tree union, bytes and owned stop separately.
 * A resolved Promise, parsed receipt or exit code is never such an attestation.
 */
export interface InitializationPlanAuthority {
 readonly plan:InitializationPlan
 recheck(signal:AbortSignal):Promise<object>
 apply(signal:AbortSignal):Promise<object>
 verify(application:object,signal:AbortSignal):Promise<object>
 inspect(signal:AbortSignal,operation:InitializationOperation):Promise<object>
 content(contentId:string,signal:AbortSignal):Promise<InitializationContent>
 fact(original:object):InitializationFact|undefined
}
export interface InitializationHostPort {
 prepare(request:InitializationAttempt&{context:CapturedBmadContext},signal:AbortSignal):Promise<object>
 authority(original:object):InitializationPlanAuthority|undefined
 /** Voluntary bounded read of historical effects. This must never issue a plan grant.
  * The host reuses the existing recovery owner's read admission; it cannot clear its stop guard.
  */
 inspect?(operation:InitializationOperation,signal:AbortSignal):Promise<object>
 inspectionFact?(original:object):InitializationInspectionFact|undefined
}
/** Detached v1 record, per-attempt CAS, exclusive temporary + sync/rename.
 * Resolve only after durable commit; reject conflicts/unreadable versions without overwriting.
 */
export interface InitializationStorePort {
 write(record:InitializationOperation,expectedDurableRevision:number|null):Promise<void>
}

type Data=Record<string,unknown>
class InvalidInitialization extends Error {
 code:InitializationIssueCode;path:string
 constructor(code:InitializationIssueCode,path:string){super(code);this.code=code;this.path=path}
}
const refuse=(code:InitializationIssueCode,path:string):never=>{throw new InvalidInitialization(code,path)}
/** Descriptor-only copy, no getters/toJSON; no coupling to Graph DTOs.
 * Like the existing boundary, this is not a sandbox against active Proxy traps.
 */
function copyData(input:unknown,maxNodes:number):unknown{
 const holder:Data={},active=new WeakSet<object>()
 type Task={value:unknown;parent:Data|unknown[];key:string;path:string}|{exit:object}
 const stack:Task[]=[{value:input,parent:holder,key:'value',path:'$'}]
 let visited=0
 while(stack.length){
  if(++visited>maxNodes)refuse('INVALID_SHAPE','$')
  const task=stack.pop()!
  if('exit' in task){active.delete(task.exit);continue}
  const {value,parent,key,path}=task;let copy:unknown=value
  if(value===null||typeof value==='string'||typeof value==='boolean'){}
  else if(typeof value==='number'){if(!Number.isFinite(value))refuse('INVALID_DATA',path)}
  else if(typeof value==='object'){
   if(active.has(value))refuse('INVALID_DATA',path)
   const isArray=Array.isArray(value),prototype=Object.getPrototypeOf(value)
   if(isArray?prototype!==Array.prototype:prototype!==Object.prototype&&prototype!==null)refuse('INVALID_DATA',path)
   const descriptors=Object.getOwnPropertyDescriptors(value)
   if(Reflect.ownKeys(descriptors).some(key=>typeof key!=='string'))refuse('INVALID_DATA',path)
   const names=Object.keys(descriptors);copy=isArray?[]:{}
   if(names.length+visited>maxNodes)refuse('INVALID_SHAPE',path)
   if(isArray){
    const length=descriptors.length?.value
    if(!Number.isSafeInteger(length)||length<0||names.length!==length+1||names.some(name=>name!=='length'&&(!/^(0|[1-9][0-9]*)$/.test(name)||Number(name)>=length)))refuse('INVALID_DATA',path)
   }
   active.add(value);stack.push({exit:value})
   for(let i=names.length-1;i>=0;i--){
    const name=names[i],descriptor=descriptors[name]
    if(isArray&&name==='length')continue
    if(!('value' in descriptor)||!descriptor.enumerable)refuse('INVALID_DATA',path+'.'+name)
    stack.push({value:descriptor.value,parent:copy as Data,key:name,path:path+'.'+name})
   }
  }else refuse('INVALID_DATA',path)
  Object.defineProperty(parent,key,{value:copy,writable:true,enumerable:true,configurable:true})
 }
 return holder.value
}
function validate<T>(input:unknown,check:(value:unknown,path:string)=>void,maxNodes=1000000):InitializationValidation<T>{
 try{const value=copyData(input,maxNodes);check(value,'$');return {ok:true,value:value as T}}
 catch(error){const e=error instanceof InvalidInitialization?error:new InvalidInitialization('INVALID_DATA','$');return {ok:false,issues:[{code:e.code,path:e.path,messageKey:'initialization.error.'+e.code.toLowerCase()}]}}
}
function record(input:unknown,keys:string[],path:string):Data{
 if(!input||typeof input!=='object'||Array.isArray(input))return refuse('INVALID_SHAPE',path)
 const v=input as Data
 if(Object.keys(v).length!==keys.length||!keys.every(key=>Object.hasOwn(v,key)))refuse('INVALID_SHAPE',path)
 return v
}
function text(v:unknown,path:string,empty=false):asserts v is string{
 if(typeof v!=='string'||(!empty&&!v.length)||v.includes('\0'))refuse('INVALID_SHAPE',path)
}
function number(v:unknown,path:string,min=0):asserts v is number{if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min)refuse('INVALID_SHAPE',path)}
function one(v:unknown,values:readonly unknown[],path:string):void{if(!values.includes(v))refuse('INVALID_SHAPE',path)}
function version(v:unknown,path:string):void{if(v!==1)refuse('INCOMPATIBLE_VERSION',path)}
function sha(v:unknown,path:string):void{if(typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v))refuse('INVALID_SHAPE',path)}
function id(v:unknown,path:string):void{if(typeof v!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v))refuse('INVALID_SHAPE',path)}
function nullableText(v:unknown,path:string):void{if(v!==null)text(v,path)}
function array(v:unknown,path:string,check:(v:unknown,path:string)=>void):void{if(!Array.isArray(v))return refuse('INVALID_SHAPE',path);v.forEach((item,i)=>check(item,path+'.'+i))}
function unique(values:string[],path:string):void{if(new Set(values).size!==values.length)refuse('MANIFEST_CONFLICT',path)}
function relative(v:unknown,path:string):void{
 text(v,path)
 if(/[\\:<>"|?*\x00-\x1f\x7f]/.test(v)||v.split('/').some(part=>!part||part==='.'||part==='..'||/[. ]$/.test(part)||/^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(part)))refuse('INVALID_PATH',path)
}
function absolute(v:unknown,path:string):string{
 text(v,path)
 const normalized=v.replaceAll('\\','/')
 if(!/^[A-Za-z]:\//.test(normalized))refuse('INVALID_PATH',path)
 if(normalized.length>3)relative(normalized.slice(3),path)
 return normalized
}
function attempt(v:Data,path:string):void{id(v.projectId,path+'.projectId');id(v.attemptId,path+'.attemptId');number(v.generation,path+'.generation',1)}
function identity(input:unknown,path:string):void{
 const v=record(input,['projectId','attemptId','generation','rootPath','rootIdentity','parentPath','parentIdentity','contextRevision','profileId','sourceRevision','payloadRevision'],path)
 attempt(v,path)
 const root=absolute(v.rootPath,path+'.rootPath'),parent=absolute(v.parentPath,path+'.parentPath')
 for(const key of ['rootIdentity','parentIdentity','profileId'])text(v[key],path+'.'+key)
 for(const key of ['contextRevision','sourceRevision','payloadRevision'])sha(v[key],path+'.'+key)
 const slash=root.lastIndexOf('/'),expected=slash===2?root.slice(0,3):root.slice(0,slash)
 if(root.length<=3||parent!==expected)refuse('INVALID_PATH',path+'.parentPath')
}
function preconditions(input:unknown,path:string):void{
 const v=record(input,['configurationRevision','targetTreeRevision','parentTreeRevision','sourceRevision','payloadRevision'],path)
 for(const key of Object.keys(v))sha(v[key],path+'.'+key)
}
function entry(input:unknown,path:string,content=true):void{
 const kind=(input as Data)?.kind,keys=kind==='directory'?['path','kind']:['path','kind','sha256','bytes',...(content?['contentId']:[])]
 const v=record(input,keys,path);one(v.kind,['file','directory'],path+'.kind');relative(v.path,path+'.path')
 if(kind==='file'){sha(v.sha256,path+'.sha256');number(v.bytes,path+'.bytes');if(content)text(v.contentId,path+'.contentId')}
}
function entries(input:unknown,path:string,content=true):void{
 array(input,path,(v,p)=>entry(v,p,content));unique((input as InitializationEntry[]).map(e=>e.path.toLowerCase()),path)
}
function paths(input:unknown,path:string):void{array(input,path,relative);unique((input as string[]).map(p=>p.toLowerCase()),path)}
function plan(input:unknown,path:string):void{
 const v=record(input,['schemaVersion','id','revision','identity','observedAt','preconditions','parameters','additions','preserved','excluded','limitations'],path)
 version(v.schemaVersion,path+'.schemaVersion');text(v.id,path+'.id');sha(v.revision,path+'.revision');identity(v.identity,path+'.identity')
 if(typeof v.observedAt!=='string'||!Number.isFinite(Date.parse(v.observedAt))||new Date(v.observedAt).toISOString()!==v.observedAt)refuse('INVALID_SHAPE',path+'.observedAt')
 preconditions(v.preconditions,path+'.preconditions')
 const i=v.identity as InitializationIdentity,p=v.preconditions as InitializationPreconditions
 if(i.contextRevision!==p.configurationRevision||i.sourceRevision!==p.sourceRevision||i.payloadRevision!==p.payloadRevision)refuse('CONTEXT_MISMATCH',path+'.preconditions')
 array(v.parameters,path+'.parameters',(input,path)=>{const p=record(input,['name','value'],path);text(p.name,path+'.name');text(p.value,path+'.value',true)})
 unique((v.parameters as {name:string}[]).map(p=>p.name),path+'.parameters')
 entries(v.additions,path+'.additions');entries(v.preserved,path+'.preserved',false)
 const additions=v.additions as InitializationEntry[],preserved=v.preserved as InitializationPreservedEntry[]
 if(!additions.length)refuse('INVALID_SHAPE',path+'.additions')
 const all=[...additions,...preserved],byPath=new Map(all.map(e=>[e.path.toLowerCase(),e]))
 unique(all.map(e=>e.path.toLowerCase()),path+'.additions')
 unique(additions.flatMap(e=>e.kind==='file'?[e.contentId]:[]),path+'.additions.contentId')
 for(const e of all){
  const parts=e.path.split('/')
  for(let k=1;k<parts.length;k++)if(byPath.get(parts.slice(0,k).join('/').toLowerCase())?.kind!=='directory')refuse('MANIFEST_CONFLICT',path+'.additions')
 }
 array(v.excluded,path+'.excluded',(input,path)=>{const e=record(input,['path','reason'],path);relative(e.path,path+'.path');text(e.reason,path+'.reason')})
 const excluded=v.excluded as {path:string;reason:string}[]
 unique(excluded.map(e=>e.path.toLowerCase()),path+'.excluded')
 if(!excluded.some(e=>e.path==='skills-lock.json')||additions.some(e=>e.path.toLowerCase()==='skills-lock.json'||excluded.some(x=>e.path.toLowerCase()===x.path.toLowerCase()||e.path.toLowerCase().startsWith(x.path.toLowerCase()+'/'))))refuse('MANIFEST_CONFLICT',path+'.excluded')
 array(v.limitations,path+'.limitations',text)
 if(!(v.limitations as string[]).length)refuse('INVALID_SHAPE',path+'.limitations')
}
const factBase=['schemaVersion','kind','identity','planId','planRevision','order']
function fact(input:unknown,path:string):void{
 const kind=(input as Data)?.kind
 const extra=kind==='preconditions'?['preconditions','complete']:kind==='application'?['outcome','observedAdditions','unionVerified','preservedVerified','unverifiedPaths','stop','reason']:['coverage','observedAdditions','unverifiedPaths','stop','reason']
 if(kind==='inspection'&&Object.hasOwn(input as object,'targetIntact'))extra.push('targetIntact')
 const v=record(input,[...factBase,...extra],path);version(v.schemaVersion,path+'.schemaVersion');one(kind,['preconditions','application','inspection'],path+'.kind')
 identity(v.identity,path+'.identity');text(v.planId,path+'.planId');sha(v.planRevision,path+'.planRevision');number(v.order,path+'.order',1)
 if(kind==='preconditions'){preconditions(v.preconditions,path+'.preconditions');one(v.complete,[true],path+'.complete');return}
 entries(v.observedAdditions,path+'.observedAdditions');paths(v.unverifiedPaths,path+'.unverifiedPaths');one(v.stop,['confirmed','unknown'],path+'.stop');nullableText(v.reason,path+'.reason')
 if(kind==='application'){
  one(v.outcome,['verified','failed-no-effect','partial','unknown'],path+'.outcome');one(v.unionVerified,[true,false],path+'.unionVerified');one(v.preservedVerified,[true,false],path+'.preservedVerified')
  if(v.outcome==='verified'&&(!v.unionVerified||!v.preservedVerified||v.stop!=='confirmed'||(v.unverifiedPaths as string[]).length))refuse('INVALID_SHAPE',path)
  if(v.outcome==='failed-no-effect'&&((v.observedAdditions as unknown[]).length||!v.preservedVerified||v.unionVerified||v.stop!=='confirmed'||(v.unverifiedPaths as string[]).length))refuse('INVALID_SHAPE',path)
 }else{
  one(v.coverage,['complete','partial','unknown'],path+'.coverage')
  if(Object.hasOwn(v,'targetIntact')){
   one(v.targetIntact,[true],path+'.targetIntact')
   if(v.coverage!=='complete'||v.stop!=='confirmed'||(v.observedAdditions as unknown[]).length)refuse('INVALID_SHAPE',path)
  }else if(v.coverage==='complete'&&(v.unverifiedPaths as string[]).length)refuse('INVALID_SHAPE',path)
 }
}
export function sameInitializationData(a:unknown,b:unknown):boolean{
 const canonical=(v:unknown):string=>JSON.stringify(v,(_key,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):value)
 return canonical(a)===canonical(b)
}
export function validateInitializationPlan(input:unknown):InitializationValidation<InitializationPlan>{return validate(input,plan)}
export function validateInitializationFact(input:unknown):InitializationValidation<InitializationFact>{return validate(input,fact)}
export function validateInitializationContent(input:unknown):InitializationValidation<InitializationContent>{
 return validate(input,(input,path)=>{const v=record(input,['contentId','path','sha256','bytes','encoding','data'],path);text(v.contentId,path+'.contentId');relative(v.path,path+'.path');sha(v.sha256,path+'.sha256');number(v.bytes,path+'.bytes');one(v.encoding,['utf8','base64'],path+'.encoding');text(v.data,path+'.data',true);if((v.bytes as number)>1048576||(v.data as string).length>1398104)refuse('INVALID_SHAPE',path)})
}
export function validateInitializationCommand(input:unknown):InitializationValidation<InitializationCommand>{
 return validate(input,(input,path)=>{
  const type=(input as Data)?.type,v=record(input,['contractVersion','type','projectId','attemptId','generation','planId','planRevision',...(type==='approve'?['confirmation']:[])],path)
  version(v.contractVersion,path+'.contractVersion');one(type,['approve','close','cancel','refuse'],path+'.type');attempt(v,path);text(v.planId,path+'.planId');sha(v.planRevision,path+'.planRevision')
  if(type==='approve')one(v.confirmation,['initialize-exact-plan'],path+'.confirmation')
 })
}
export function validateInitializationOperation(input:unknown):InitializationValidation<InitializationOperation>{
 return validate(input,(input,path)=>{
  const v=record(input,['schemaVersion','projectId','attemptId','generation','revision','plan','phase','decision','lastFactOrder','stop','result','inspection','preservation'],path)
  version(v.schemaVersion,path+'.schemaVersion');attempt(v,path);number(v.revision,path+'.revision',1);number(v.lastFactOrder,path+'.lastFactOrder')
  one(v.phase,['preparing','ready','checking','applying','verifying','terminal','historical'],path+'.phase');one(v.decision,['none','consumed','inactive'],path+'.decision');one(v.stop,['not-observed','confirmed','unknown'],path+'.stop')
  const p=v.plan as InitializationPlan|null
  if(p!==null){plan(p,path+'.plan');if(p.identity.projectId!==v.projectId||p.identity.attemptId!==v.attemptId||p.identity.generation!==v.generation)refuse('CONTEXT_MISMATCH',path+'.plan')}
  else if(v.phase!=='preparing'&&v.phase!=='terminal'&&v.phase!=='historical')refuse('INVALID_SHAPE',path+'.plan')
  const result=record(v.result,['outcome','receipt','reason'],path+'.result')
  one(result.outcome,['none','verified','failed-no-effect','partial','unknown','stale','refused','cancelled','preparation-failed'],path+'.result.outcome');nullableText(result.reason,path+'.result.reason')
  const correlated=(value:unknown):void=>{fact(value,path+'.result');const f=value as InitializationFact;if(!p||f.planId!==p.id||f.planRevision!==p.revision||!sameInitializationData(f.identity,p.identity)||f.order>Number(v.lastFactOrder))refuse('CONTEXT_MISMATCH',path+'.result')}
  if(result.receipt!==null){
   correlated(result.receipt);const r=result.receipt as InitializationFact
   if(r.kind!=='application'||r.outcome!==result.outcome||!p||r.observedAdditions.some(e=>!p.additions.some(a=>sameInitializationData(a,e))))refuse('CONTEXT_MISMATCH',path+'.result.receipt')
   if(r.kind==='application'&&r.outcome==='verified'&&p&&!sameEntries(r.observedAdditions,p.additions))refuse('MANIFEST_CONFLICT',path+'.result.receipt')
  }else if(['verified','partial','failed-no-effect'].includes(String(result.outcome)))refuse('INVALID_SHAPE',path+'.result.receipt')
  if(v.inspection!==null){
   correlated(v.inspection)
   const inspection=v.inspection as InitializationFact, receipt=result.receipt as InitializationApplicationFact|null
   if(inspection.kind!=='inspection'||!p||!initializationInspectionMatchesPlan(inspection,p)||
      !['partial','unknown'].includes(String(result.outcome))||!['terminal','historical'].includes(String(v.phase))||
      inspection.stop!==v.stop||inspection.stop!==(receipt?.stop??'unknown')||
      receipt&&inspection.order<=receipt.order||inspection.targetIntact&&inspection.order!==v.lastFactOrder)
    refuse('CONTEXT_MISMATCH',path+'.inspection')
  }
  const preservation=record(v.preservation,['status','durableRevision'],path+'.preservation')
  one(preservation.status,['unrecorded','pending','stored','failed','unreadable'],path+'.preservation.status')
  if(preservation.durableRevision!==null){number(preservation.durableRevision,path+'.preservation.durableRevision',1);if(preservation.durableRevision>Number(v.revision))refuse('INVALID_SHAPE',path+'.preservation')}
  if(preservation.status==='stored'&&preservation.durableRevision!==v.revision)refuse('INVALID_SHAPE',path+'.preservation')
  if(v.phase==='historical'&&v.decision!=='inactive'||v.phase==='ready'&&(v.decision!=='none'||result.outcome!=='none')||['checking','applying','verifying'].includes(String(v.phase))&&v.decision!=='consumed')refuse('INVALID_SHAPE',path+'.decision')
 })
}
export function sameEntries(a:InitializationEntry[],b:InitializationEntry[]):boolean{
 return a.length===b.length&&a.every(e=>b.some(other=>sameInitializationData(e,other)))
}

export function initializationInspectionMatchesPlan(inspection:InitializationInspectionFact,plan:InitializationPlan):boolean {
 const expected=new Map(plan.additions.map(entry=>[entry.path,entry]))
 const observed=new Set(inspection.observedAdditions.map(entry=>entry.path))
 return inspection.observedAdditions.every(entry=>sameInitializationData(expected.get(entry.path),entry))&&
  inspection.unverifiedPaths.every(path=>expected.has(path)&&!observed.has(path))&&
  (inspection.coverage!=='complete'||observed.size+inspection.unverifiedPaths.length===expected.size)
}

export function initializationCanInspect(operation:InitializationOperation):boolean {
 return operation.plan!==null&&['partial','unknown'].includes(operation.result.outcome)&&!operation.inspection?.targetIntact
}
export function initializationNeedsInspection(operation:InitializationOperation):boolean {
 if(operation.stop==='unknown')return true
 if(!['partial','unknown'].includes(operation.result.outcome))return false
 return !(operation.stop==='confirmed'&&operation.inspection?.targetIntact&&
  operation.preservation.status==='stored'&&operation.preservation.durableRevision===operation.revision)
}

export const INITIALIZATION_COMMAND_CHANNEL = 'madness:bmad-initialization:command'
export const INITIALIZATION_EVENT_CHANNEL = 'madness:bmad-initialization:changed'
export type InitializationRequest =
 | {type:'read';projectId:string}
 | {type:'prepare'|'cancel-prepare-request';projectId:string;requestId:string}
 | (InitializationAttempt & {type:'cancel-preparation'|'retry-save'})
 | {type:'decision';projectId:string;command:InitializationCommand}
 | (InitializationAttempt & {type:'content';planId:string;planRevision:string;contentId:string})
 | (InitializationAttempt & {type:'inspect';planId:string;planRevision:string})
export type InitializationView = InitializationState & {projectId:string;availability:'available'|'storage-unreadable'}
export type InitializationReply = {contractVersion:1;correlationId:string;state:InitializationView;issue:InitializationIssueCode|null;content:InitializationContent|null;preparedAttempt:InitializationAttempt|null}
export interface InitializationBridge {
 request(input:InitializationRequest):Promise<InitializationReply>
 onChanged(listener:(value:InitializationView)=>void):()=>void
}
export function validateInitializationRequest(input:unknown):InitializationValidation<InitializationRequest&{contractVersion:1;correlationId:string}> {
 return validate(input,(input,path)=>{
  const type=(input as Data)?.type
  const extras=type==='decision'?['command']:type==='content'?['attemptId','generation','planId','planRevision','contentId']:
   type==='inspect'?['attemptId','generation','planId','planRevision']:
   type==='cancel-preparation'||type==='retry-save'?['attemptId','generation']:
   type==='prepare'||type==='cancel-prepare-request'?['requestId']:[]
  const v=record(input,['contractVersion','correlationId','type','projectId',...extras],path)
  version(v.contractVersion,path+'.contractVersion');id(v.correlationId,path+'.correlationId');id(v.projectId,path+'.projectId')
  one(type,['read','prepare','cancel-prepare-request','cancel-preparation','retry-save','decision','content','inspect'],path+'.type')
  if(extras.includes('requestId'))id(v.requestId,path+'.requestId')
  if(type==='prepare'&&v.requestId!==v.correlationId)refuse('CONTEXT_MISMATCH',path+'.requestId')
  if(type==='decision'){
   const command=validateInitializationCommand(v.command)
   if(!command.ok||command.value.projectId!==v.projectId)refuse('CONTEXT_MISMATCH',path+'.command')
  }
  if(extras.includes('attemptId'))attempt(v,path)
  if(type==='content'||type==='inspect'){id(v.planId,path+'.planId');sha(v.planRevision,path+'.planRevision')}
  if(type==='content')sha(v.contentId,path+'.contentId')
 },32)
}
export function isInitializationView(input:unknown):input is InitializationView {
 if(!input||typeof input!=='object'||!Array.isArray((input as InitializationView).operations)||
    (input as InitializationView).operations.length>INITIALIZATION_ATTEMPT_LIMIT)return false
 return validate(input,(input,path)=>{
  const v=record(input,['contractVersion','sequence','operations','projectId','availability'],path)
  version(v.contractVersion,path+'.contractVersion');number(v.sequence,path+'.sequence');id(v.projectId,path+'.projectId')
  one(v.availability,['available','storage-unreadable'],path+'.availability')
  const ids:string[]=[]
  array(v.operations,path+'.operations',(item,p)=>{
   const operation=validateInitializationOperation(item)
   if(!operation.ok)return refuse('INVALID_SHAPE',p)
   if(operation.value.projectId!==v.projectId)return refuse('CONTEXT_MISMATCH',p)
   ids.push(operation.value.attemptId)
  })
  unique(ids,path+'.operations')
 }).ok
}
export function isInitializationReply(
 input:unknown,request:Pick<InitializationRequest,'type'|'projectId'>&{correlationId:string}
):input is InitializationReply {
 if(!input||typeof input!=='object'||Object.keys(input).length!==6||
    !['contractVersion','correlationId','state','issue','content','preparedAttempt'].every(key=>Object.hasOwn(input,key)))return false
 const v=input as InitializationReply
 if(v.contractVersion!==1||typeof v.correlationId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v.correlationId)||
    v.correlationId!==request.correlationId||!isInitializationView(v.state)||v.state.projectId!==request.projectId||
    (v.content!==null&&!validateInitializationContent(v.content).ok)||
    (v.issue!==null&&!['INVALID_DATA','INVALID_SHAPE','INCOMPATIBLE_VERSION','INVALID_PATH','MANIFEST_CONFLICT','UNTRUSTED','CONTEXT_MISMATCH','STALE','BUSY','STOP_UNCONFIRMED','INVALID_TRANSITION','EVENT_ORDER','UNAVAILABLE'].includes(v.issue)))return false
 if(request.type!=='prepare'||v.issue!==null)return v.preparedAttempt===null
 const prepared=validate<InitializationAttempt>(v.preparedAttempt,(value,path)=>{
  attempt(record(value,['projectId','attemptId','generation'],path),path)
 },5)
 if(!prepared.ok)return false
 const {projectId,attemptId,generation}=prepared.value
 return projectId===request.projectId&&attemptId===request.correlationId&&v.state.operations.some(op=>op.plan!==null&&
  op.projectId===projectId&&op.attemptId===attemptId&&op.generation===generation)
}
