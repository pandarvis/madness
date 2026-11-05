import {createHash} from 'node:crypto'
import {
 validateInitializationPlan,validateInitializationFact,validateInitializationOperation,
 validateInitializationCommand,validateInitializationContent,sameInitializationData,sameEntries
} from '../contracts/bmad-initialization.ts'
import type {
 InitializationAttempt,InitializationOperation,InitializationState,InitializationValidation,
 InitializationIssueCode,InitializationFact,InitializationPlanAuthority,
 InitializationHostPort,InitializationStorePort,InitializationContent
} from '../contracts/bmad-initialization.ts'
import type {CapturedBmadContext} from '../contracts/bmad-context.ts'
import type {BmadContextCoordinator} from './bmad-context.ts'
import type {ActivityAdmission,LifecycleCoordinator} from './lifecycle.ts'

type Dependencies={
 context:Pick<BmadContextCoordinator,'capture'|'assertFresh'|'subscribeInvalidation'>
 host:InitializationHostPort;admission:Pick<ActivityAdmission,'enter'|'block'>
 lifecycle:Pick<LifecycleCoordinator,'register'|'complete'>
 store:InitializationStorePort;newId():string
}
type Entry={
 operation:InitializationOperation;controller:AbortController;captured:CapturedBmadContext|null
 original:object|null;producer:InitializationPlanAuthority|null;authority:InitializationPlanAuthority|null;effectRequested:boolean
 busy:boolean;target:string|null;writes:Promise<void>
}
const rejected=<T>(code:InitializationIssueCode,path='$'):InitializationValidation<T>=>({ok:false,issues:[{code,path,messageKey:'initialization.error.'+code.toLowerCase()}]})
const copied=<T>(value:T):T=>structuredClone(value)
const freeze=<T>(value:T):T=>{
 if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value)}
 return value
}
/** Passive admission of durable data; it creates neither a host grant nor a command.
 * Durable verified receipts remain historical evidence, never current execution authority.
 */
export function restoreInitializationOperation(input:unknown):InitializationValidation<InitializationOperation>{
 const valid=validateInitializationOperation(input)
 if(!valid.ok)return valid
 const op=valid.value
 if(['checking','applying','verifying'].includes(op.phase)){
  op.result={outcome:'unknown',receipt:null,reason:'Reopened without a terminal receipt.'};op.stop='unknown'
 }else if(op.phase==='preparing'){
  op.result={outcome:'cancelled',receipt:null,reason:'Preparation was not resumed.'};op.stop='confirmed'
 }
 op.phase='historical';op.decision='inactive'
 return {ok:true,value:op}
}

/**
 * Per-operation policy service on existing context/admission/lifecycle owners.
 * No filesystem/process/store adapter, global scheduler, provider or renderer bridge is created.
 * Only host-issued ORIGINAL plans/facts confer authority; all outward values are detached DTOs.
 */
export class BmadInitialization{
 #deps:Dependencies;#entries=new Map<string,Entry>();#generations=new Map<string,number>()
 #targets=new Map<string,Entry>();#preparing=new Set<string>();#usedFacts=new WeakSet<object>()
 #listeners=new Set<(state:InitializationState)=>void>();#sequence=0;#closing=false;#unsubscribe:()=>void
 constructor(deps:Dependencies){
  this.#deps=deps
  this.#unsubscribe=deps.context.subscribeInvalidation(id=>this.invalidate(id))
 }
 read():InitializationState{return {contractVersion:1,sequence:this.#sequence,operations:[...this.#entries.values()].map(e=>copied(e.operation))}}
 subscribe(listener:(state:InitializationState)=>void):()=>void{this.#listeners.add(listener);return()=>this.#listeners.delete(listener)}
 #emit():void{this.#sequence++;for(const listener of this.#listeners)try{listener(this.read())}catch{}}
 #touch(e:Entry,notify=true):void{
  e.operation.revision++
  if(e.operation.preservation.status==='stored')e.operation.preservation.status='unrecorded'
  if(notify)this.#emit()
 }
 #value(e:Entry):InitializationValidation<InitializationOperation>{return {ok:true,value:copied(e.operation)}}
 #active(e:Entry):boolean{return !this.#closing&&!e.controller.signal.aborted&&this.#generations.get(e.operation.projectId)===e.operation.generation}
 #assert(e:Entry):void{if(!this.#active(e))throw Error('STALE')}
 #releaseTarget(e:Entry):void{if(e.target&&this.#targets.get(e.target)===e)this.#targets.delete(e.target)}
 #settle(e:Entry):void{
  if(e.operation.stop==='confirmed')this.#deps.lifecycle.complete(e.operation.attemptId)
  if(['verified','failed-no-effect','stale','refused','cancelled','preparation-failed'].includes(e.operation.result.outcome)&&e.operation.stop==='confirmed')this.#releaseTarget(e)
 }
 #beforeEffect(e:Entry,outcome:'stale'|'refused'|'cancelled'|'preparation-failed',reason:string):void{
  e.operation.phase='historical';e.operation.decision='inactive';e.operation.stop='confirmed'
  e.operation.result={outcome,receipt:null,reason};e.controller.abort();this.#touch(e);this.#settle(e)
 }
 #unknown(e:Entry,reason:string):void{
  if(e.operation.result.receipt)return
  e.operation.result={outcome:'unknown',receipt:null,reason};e.operation.stop='unknown'
  if(e.operation.phase!=='historical')e.operation.phase='terminal'
  this.#deps.admission.block();this.#touch(e)
 }
 #stop(e:Entry):'stopped'|'unknown'{
  if(e.effectRequested){
   if(e.operation.stop!=='confirmed')this.#unknown(e,'Owned stop is not confirmed.')
   e.operation.phase='historical';e.operation.decision='inactive';e.controller.abort();this.#touch(e)
   return e.operation.stop==='confirmed'?'stopped':'unknown'
  }
  this.#beforeEffect(e,'cancelled','Closed before application; prepare a new plan.')
  return 'stopped'
 }
 invalidate(projectId:string):void{
  for(const e of this.#entries.values()){
   if(e.operation.projectId!==projectId||e.operation.phase==='historical'||e.operation.phase==='terminal')continue
   if(!e.effectRequested)this.#beforeEffect(e,'stale','Context changed; prepare a new plan.')
   // Changes after dispatch cannot establish no effect or cancel an admitted application.
  }
 }
 #boundPlan(e:Entry):boolean{
  if(!e.original||!e.producer||!e.operation.plan)return false
  const raw=validateInitializationPlan(e.original),owned=validateInitializationPlan(e.producer.plan)
  return raw.ok&&owned.ok&&sameInitializationData(raw.value,e.operation.plan)&&sameInitializationData(owned.value,e.operation.plan)
 }
 #fact(e:Entry,original:object,resolver:((original:object)=>InitializationFact|undefined)|undefined=e.authority?.fact):InitializationValidation<InitializationFact>{
  if(!resolver||!e.operation.plan||!original||typeof original!=='object'||this.#usedFacts.has(original))return rejected('UNTRUSTED')
  let owned:unknown
  try{owned=resolver(original)}catch{return rejected('UNTRUSTED')}
  const source=validateInitializationFact(original),valid=validateInitializationFact(owned)
  if(!source.ok||!valid.ok||!sameInitializationData(source.value,valid.value))return rejected('UNTRUSTED')
  const fact=valid.value,p=e.operation.plan
  if(!sameInitializationData(fact.identity,p.identity)||fact.planId!==p.id||fact.planRevision!==p.revision)return rejected('CONTEXT_MISMATCH')
  if(fact.order<=e.operation.lastFactOrder)return rejected('EVENT_ORDER')
  return valid
 }
 async prepare(projectId:string):Promise<InitializationValidation<InitializationOperation>>{
  if(this.#closing)return rejected('UNAVAILABLE')
  if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(projectId))return rejected('INVALID_SHAPE')
  if(this.#preparing.has(projectId))return rejected('BUSY')
  const previous=[...this.#entries.values()].find(e=>e.operation.projectId===projectId&&e.operation.phase!=='historical'&&e.operation.phase!=='terminal')
  if(previous){
   if(previous.effectRequested||previous.busy)return rejected('BUSY')
   this.#beforeEffect(previous,'cancelled','Superseded by an explicit new preparation.')
  }
  let release:(()=>void)|undefined
  const attempt:InitializationAttempt={projectId,attemptId:this.#deps.newId(),generation:(this.#generations.get(projectId)??0)+1}
  if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(attempt.attemptId)||this.#entries.has(attempt.attemptId)){return rejected('INVALID_SHAPE')}
  this.#generations.set(projectId,attempt.generation)
  const e:Entry={operation:{schemaVersion:1,...attempt,revision:1,plan:null,phase:'preparing',decision:'none',lastFactOrder:0,stop:'not-observed',result:{outcome:'none',receipt:null,reason:null},inspection:null,preservation:{status:'unrecorded',durableRevision:null}},controller:new AbortController(),captured:null,original:null,producer:null,authority:null,effectRequested:false,busy:false,target:null,writes:Promise.resolve()}
  this.#preparing.add(projectId);this.#entries.set(attempt.attemptId,e);this.#emit()
  try{
   this.#deps.lifecycle.register({id:attempt.attemptId,context:{projectId,initiativeId:null,conversationId:null,providerId:null,connectionId:null},stop:async()=>this.#stop(e)})
   const captured=await this.#deps.context.capture(projectId,false,e.controller.signal);this.#assert(e)
   e.captured=freeze(copied(captured))
   const observation=e.captured.observation
   if(captured.scope!=='configuration'||observation.projectId!==projectId||observation.status!=='absent')throw Error('CONTEXT_MISMATCH')
   const held=this.#targets.get(observation.rootIdentity)
   if(held&&held!==e)throw Error('BUSY')
   e.target=observation.rootIdentity;this.#targets.set(e.target,e)
   release=this.#deps.admission.enter('helper')
   const original=await this.#deps.host.prepare(freeze({...attempt,context:e.captured}),e.controller.signal);this.#assert(e)
   const authority=this.#deps.host.authority(original),raw=validateInitializationPlan(original),owned=validateInitializationPlan(authority?.plan)
   if(!authority||!raw.ok||!owned.ok||!sameInitializationData(raw.value,owned.value))throw Error('UNTRUSTED')
   const p=raw.value,i=p.identity
   if(i.projectId!==projectId||i.attemptId!==attempt.attemptId||i.generation!==attempt.generation||i.rootPath!==observation.rootPath||i.rootIdentity!==observation.rootIdentity||i.contextRevision!==observation.revision)throw Error('CONTEXT_MISMATCH')
   e.operation.plan=freeze(p);e.original=original;e.producer=authority
   // Capture method references and sealed data now, not a mutable host dispatch table later.
   e.authority=Object.freeze({plan:freeze(owned.value),recheck:authority.recheck.bind(authority),apply:authority.apply.bind(authority),verify:authority.verify.bind(authority),inspect:authority.inspect.bind(authority),content:authority.content.bind(authority),fact:authority.fact.bind(authority)})
   release();release=undefined
   // Configuration observation keeps its existing helper owner; do not nest its lease.
   await this.#deps.context.assertFresh(e.captured,e.controller.signal);this.#assert(e)
   if(!this.#boundPlan(e))throw Error('STALE')
   e.operation.phase='ready';e.operation.stop='confirmed';this.#touch(e)
   await this.#save(e);return this.#value(e)
  }catch(error){
   if(e.operation.phase!=='historical')this.#beforeEffect(e,'preparation-failed','Preparation refused before any target application.')
   return rejected((error as Error).message==='BUSY'?'BUSY':'UNTRUSTED')
  }finally{this.#preparing.delete(projectId);release?.()}
 }
 async execute(input:unknown):Promise<InitializationValidation<InitializationOperation>>{
  const valid=validateInitializationCommand(input);if(!valid.ok)return valid
  const command=valid.value,e=this.#entries.get(command.attemptId)
  if(!e||!e.operation.plan||this.#closing)return rejected('UNAVAILABLE')
  const op=e.operation,p=op.plan!
  if(command.projectId!==op.projectId||command.generation!==op.generation||command.planId!==p.id||command.planRevision!==p.revision)return rejected('CONTEXT_MISMATCH')
  if(command.type!=='approve'){
   // Once effects are possible, closing the consultation never interrupts or replays them.
   if(e.effectRequested)return this.#value(e)
   if(op.phase!=='ready'&&op.phase!=='preparing'&&op.phase!=='checking')return rejected('INVALID_TRANSITION')
   this.#beforeEffect(e,command.type==='refuse'?'refused':'cancelled','Decision inactive; explicit new preparation required.')
   await this.#save(e);return this.#value(e)
  }
  if(op.phase!=='ready'||op.decision!=='none'||e.busy||!e.authority||!e.captured)return rejected('INVALID_TRANSITION')
  e.busy=true;op.decision='consumed';op.phase='checking';op.stop='not-observed';this.#touch(e)
  let release:(()=>void)|undefined
  try{
   this.#assert(e);if(!this.#boundPlan(e))throw Error('STALE')
   const checkingRevision=op.revision
   const storedRevision=await this.#save(e)
   this.#assert(e)
   if(storedRevision!==checkingRevision||op.revision!==checkingRevision)throw Error('INTENT_NOT_SAVED')
   if(!this.#boundPlan(e))throw Error('STALE')
   await this.#deps.context.assertFresh(e.captured,e.controller.signal);this.#assert(e)
   release=this.#deps.admission.enter('helper')
   const original=await e.authority.recheck(e.controller.signal);this.#assert(e)
   const checked=this.#fact(e,original)
   if(!checked.ok||checked.value.kind!=='preconditions'||!sameInitializationData(checked.value.preconditions,p.preconditions))throw Error('STALE')
   this.#usedFacts.add(original);op.lastFactOrder=checked.value.order
   // Nothing asynchronous or observable runs between the final checks and dispatch.
   if(!this.#boundPlan(e))throw Error('STALE')
   this.#assert(e);op.phase='applying';this.#touch(e,false)
   e.effectRequested=true
   const application=e.authority.apply(e.controller.signal)
   this.#emit()
   const applied=await application
   if(e.operation.phase==='applying'){op.phase='verifying';this.#touch(e)}
   if(!this.#closing&&!op.result.receipt){
    const proof=await e.authority.verify(applied,e.controller.signal)
    const published=this.publish(op.attemptId,proof)
    if(!published.ok&&!this.#closing)this.#unknown(e,'Application or owned stop could not be verified.')
   }
  }catch(error){
   if(e.effectRequested){
    if(!this.#closing)this.#unknown(e,'Effects are possible; no automatic retry.')
   }else if(e.operation.phase!=='historical'){
    const reason=error instanceof Error&&error.message==='INTENT_NOT_SAVED'
     ?'Application refused because the consumed approval was not durably recorded.'
     :'Preconditions changed or could not be proved before application.'
    this.#beforeEffect(e,'stale',reason)
   }
  }finally{e.busy=false;release?.()}
  await this.#save(e);return this.#value(e)
 }
 /** Host events are routed by the captured attempt, never by the currently selected project.
  * Replays, serialized copies and observations from another producer/generation are refused.
  */
 publish(attemptId:string,original:object):InitializationValidation<InitializationOperation>{
  const e=this.#entries.get(attemptId)
  if(this.#closing||!e||!e.effectRequested||e.operation.result.receipt)return rejected('INVALID_TRANSITION')
  if(!['applying','verifying','historical'].includes(e.operation.phase))return rejected('INVALID_TRANSITION')
  const checked=this.#fact(e,original)
  if(this.#closing)return rejected('UNAVAILABLE')
  if(!checked.ok)return checked
  const fact=checked.value,p=e.operation.plan!
  if(fact.kind!=='application')return rejected('INVALID_TRANSITION')
  if(fact.observedAdditions.some(addition=>!p.additions.some(expected=>sameInitializationData(expected,addition))))return rejected('CONTEXT_MISMATCH')
  if(fact.outcome==='verified'&&!sameEntries(fact.observedAdditions,p.additions))return rejected('CONTEXT_MISMATCH')
  const op=e.operation
  this.#usedFacts.add(original);op.lastFactOrder=fact.order
  op.result={outcome:fact.outcome,receipt:fact,reason:fact.reason};op.stop=fact.stop
  if(op.phase!=='historical')op.phase='terminal'
  if(fact.stop==='unknown')this.#deps.admission.block()
  this.#touch(e);this.#settle(e);return this.#value(e)
 }
 async content(attemptId:string,contentId:string):Promise<InitializationValidation<InitializationContent>>{
  const e=this.#entries.get(attemptId),file=e?.operation.plan?.additions.find(entry=>entry.kind==='file'&&entry.contentId===contentId)
  if(!e?.authority||!file||file.kind!=='file'||this.#closing)return rejected('UNAVAILABLE')
  try{
   const result=validateInitializationContent(await e.authority.content(contentId,new AbortController().signal))
   if(!result.ok)return result
   const value=result.value,bytes=Buffer.from(value.data,value.encoding==='utf8'?'utf8':'base64')
   if(value.contentId!==contentId||value.path!==file.path||value.sha256!==file.sha256||value.bytes!==file.bytes||bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)return rejected('CONTEXT_MISMATCH')
   return result
  }catch{return rejected('UNAVAILABLE')}
 }
 async cancelPreparation(projectId:string,attemptId:string,generation:number):Promise<InitializationValidation<InitializationOperation>>{
  const e=this.#entries.get(attemptId)
  if(!e||e.operation.projectId!==projectId||e.operation.generation!==generation)return rejected('CONTEXT_MISMATCH')
  if(this.#closing||e.effectRequested||!['preparing','ready','checking'].includes(e.operation.phase))return rejected('INVALID_TRANSITION')
  this.#beforeEffect(e,'cancelled','Private preparation cancelled; a late plan remains inactive.')
  await this.#save(e);return this.#value(e)
 }
 async inspect(attemptId:string):Promise<InitializationValidation<InitializationOperation>>{
  const e=this.#entries.get(attemptId)
  if(!e||(!e.authority&&!this.#deps.host.inspect)||!e.operation.plan||this.#closing||e.busy||!['partial','unknown'].includes(e.operation.result.outcome))return rejected('INVALID_TRANSITION')
  e.busy=true
  try{
   // The owner may permit bounded inspection after recovery; it never clears another owner's block.
   // This host-only read does not call apply, recheck or reactivate an agreement.
   const original=e.authority?await e.authority.inspect(new AbortController().signal):await this.#deps.host.inspect!(freeze(copied(e.operation)),new AbortController().signal)
   if(this.#closing)return rejected('UNAVAILABLE')
   const checked=this.#fact(e,original,e.authority?.fact??this.#deps.host.inspectionFact?.bind(this.#deps.host))
   if(this.#closing)return rejected('UNAVAILABLE')
   if(!checked.ok)return checked
   if(checked.value.kind!=='inspection')return rejected('INVALID_TRANSITION')
   if(checked.value.observedAdditions.some(a=>!e.operation.plan!.additions.some(b=>sameInitializationData(a,b))))return rejected('CONTEXT_MISMATCH')
   this.#usedFacts.add(original);e.operation.lastFactOrder=checked.value.order;e.operation.inspection=checked.value
   this.#touch(e);await this.#save(e);return this.#value(e)
  }catch{return rejected('UNAVAILABLE')}finally{e.busy=false}
 }
 restore(input:unknown):InitializationValidation<InitializationOperation>{
  const restored=restoreInitializationOperation(input);if(!restored.ok)return restored
  const op=restored.value
  if(this.#closing||this.#entries.has(op.attemptId))return rejected('INVALID_TRANSITION')
  // No application/context/helper/inspection/storage port is touched by restoration.
  const target=op.plan&&(['partial','unknown'].includes(op.result.outcome)||op.stop==='unknown')?op.plan.identity.rootIdentity:null
  const e:Entry={operation:op,controller:new AbortController(),captured:null,original:null,producer:null,authority:null,effectRequested:false,busy:false,target,writes:Promise.resolve()}
  this.#entries.set(op.attemptId,e)
  if(target&&!this.#targets.has(target))this.#targets.set(target,e)
  this.#generations.set(op.projectId,Math.max(this.#generations.get(op.projectId)??0,op.generation));this.#emit()
  return {ok:true,value:copied(op)}
 }
 #save(e:Entry):Promise<number|null>{
  if(this.#closing)return Promise.resolve(null)
  const work=e.writes.then(async()=>{
   const op=e.operation
   if(op.preservation.status==='unreadable')return null
   const revision=op.revision,expected=op.preservation.durableRevision
   const candidate=copied(op);candidate.preservation={status:'stored',durableRevision:revision}
   op.preservation.status='pending';this.#emit()
   try{
    await this.#deps.store.write(candidate,expected)
    op.preservation.durableRevision=revision
    op.preservation.status=op.revision===revision?'stored':'unrecorded'
   }catch{
    op.preservation.status='failed';this.#emit()
    return null
   }
   this.#emit()
   if(op.revision!==revision&&e.writes===drain)void this.#save(e)
   return revision
  })
  const drain=work.then(()=>{},()=>{})
  e.writes=drain
  return work
 }
 async retrySave(attemptId:string):Promise<InitializationValidation<InitializationOperation>>{
  const e=this.#entries.get(attemptId)
  if(!e||this.#closing)return rejected('UNAVAILABLE')
  await this.#save(e);return this.#value(e)
 }
 /** Called by the host's existing shutdown sequence; never substitutes for native stop proof. */
 async shutdown():Promise<void>{
  this.#closing=true;this.#unsubscribe()
  for(const e of this.#entries.values())if(e.operation.phase!=='historical'&&e.operation.phase!=='terminal')this.#stop(e)
  await Promise.all([...this.#entries.values()].map(e=>e.writes));this.#listeners.clear()
 }
}
