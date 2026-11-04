import {initialBmadProgressState,isBmadProgressCommand,isBmadProgressSnapshot} from '../contracts/bmad-progress.ts'
import type {BmadProgressState,BmadProgressProject,BmadProgressSnapshot,ProgressDeclaration} from '../contracts/bmad-progress.ts'
import {selectionValidity} from '../contracts/bmad-context.ts'
import type {BmadContextState,BmadContextProject,BmadContextObservation,BmadSelection} from '../contracts/bmad-context.ts'
import {dialogueFailure} from '../contracts/dialogue.ts'
const canonical=(path:string)=>path.replaceAll('\\','/').replace(/\/$/,'').toLowerCase()
const classified:Record<string,string>={'draft':'backlog','ready-for-dev':'backlog','in-progress':'in-progress','blocked':'in-progress','in-review':'review','built':'review','done':'done','dropped':'dropped','backlog':'backlog','review':'review'}
/** Declarations are retained before joining. This projection never decides acceptance. */
export function projectBmadProgress(snapshot:BmadProgressSnapshot):{tickets:{key:string;container:string;ticketId:string|null;title:string;declarations:ProgressDeclaration[];conflict:boolean;hasLeaf:boolean;humanAcceptance:'unknown'}[];excerpts:BmadProgressSnapshot['excerpts']}{
 const tickets=new Map<string,{key:string;container:string;ticketId:string|null;title:string;declarations:ProgressDeclaration[];conflict:boolean;hasLeaf:boolean;humanAcceptance:'unknown'}>()
 for(const declaration of snapshot.declarations){const key=[snapshot.projectId,snapshot.rootIdentity,snapshot.initiativeId,declaration.container,declaration.ticketId??'@'+declaration.sourceId].join(':');let ticket=tickets.get(key);if(!ticket){ticket={key,container:declaration.container,ticketId:declaration.ticketId,title:declaration.title,declarations:[],conflict:false,hasLeaf:false,humanAcceptance:'unknown'};tickets.set(key,ticket)}ticket.declarations.push(declaration);ticket.hasLeaf ||= snapshot.sources.some(s=>s.id===declaration.sourceId&&s.kind==='leaf')}
 for(const ticket of tickets.values()){const states=ticket.declarations.filter(d=>d.field!=='existence').map(d=>classified[d.value]??'unknown:'+d.value),literalStatuses=ticket.declarations.filter(d=>d.field==='status').map(d=>d.value);ticket.conflict=new Set(literalStatuses).size>1||new Set(states).size>1}
 return {tickets:[...tickets.values()],excerpts:structuredClone(snapshot.excerpts)}
}
import type {ObservationPort,ObservationLease,MonitoringHealth} from './bmad-observation.ts'
type Dependencies={application:{dialogueProject(id:string):Promise<{id:string;rootPath:string}>};observation?:ObservationPort;available?:(fn:()=>void)=>()=>void;contexts:{subscribeInvalidation?(fn:(id:string,health:MonitoringHealth)=>void):()=>void;subscribe?(fn:(state:BmadContextState)=>void):()=>void;read():Pick<BmadContextState,'projects'>;consultSelection?(id:string,signal:AbortSignal):Promise<BmadContextProject>};collect(id:string,root:string,selection:BmadSelection,observation:BmadContextObservation,signal:AbortSignal):Promise<BmadProgressSnapshot>}
export class BmadProgressCoordinator{
 private tail:Promise<void>=Promise.resolve();
 private state=initialBmadProgressState();private listeners=new Set<(s:BmadProgressState)=>void>();private controllers=new Map<string,AbortController>();private jobs=new Map<string,Promise<void>>();private leases=new Map<string,ObservationLease>();private pending=new Set<string>();private armed=new Set<string>();private closing=false;private off:(()=>void)[]=[];private scopes=new Map<string,string>()
 private deps:Dependencies
 constructor(deps:Dependencies){this.deps=deps;for(const p of deps.contexts.read().projects)this.scopes.set(p.projectId,JSON.stringify([p.selection?.revision,p.selection?.initiativeId,p.observation?.rootIdentity]));
  if(deps.contexts.subscribeInvalidation)this.off.push(deps.contexts.subscribeInvalidation((id,health)=>this.invalidate(id,health)))
  if(deps.available)this.off.push(deps.available(()=>{for(const id of this.pending)if(!this.jobs.has(id))this.schedule(id)}))
  if(deps.contexts.subscribe)this.off.push(deps.contexts.subscribe(state=>{for(const p of state.projects){const scope=JSON.stringify([p.selection?.revision,p.selection?.initiativeId,p.observation?.rootIdentity]);const old=this.scopes.get(p.projectId);this.scopes.set(p.projectId,scope);const previous=old?JSON.parse(old) as [number|null,string|null,string|null]:null;const initialDiscovery=previous&&previous[2]===null&&previous[0]===(p.selection?.revision??null)&&previous[1]===(p.selection?.initiativeId??null);if(old&&old!==scope&&!initialDiscovery&&this.armed.has(p.projectId)){this.leases.get(p.projectId)?.close();this.leases.delete(p.projectId);this.controllers.get(p.projectId)?.abort();this.invalidate(p.projectId,'unarmed')}}}))
 }
 read():BmadProgressState{return structuredClone(this.state)}
 subscribe(fn:(s:BmadProgressState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private project(id:string):BmadProgressProject{return this.state.projects.find(p=>p.projectId===id)??{projectId:id,generation:0,status:'idle',freshness:'none',monitoring:'unarmed',queued:false,snapshot:null,errorCode:null,error:null}}
 private update(id:string,change:Partial<BmadProgressProject>):void{this.state={contractVersion:1,sequence:this.state.sequence+1,projects:[...this.state.projects.filter(p=>p.projectId!==id),{...this.project(id),...change}]};for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private context(id:string):BmadContextProject|undefined{return this.deps.contexts.read().projects.find(p=>p.projectId===id)}
 invalidate(id:string,health:MonitoringHealth='watching'):void{
  if(this.closing||!this.armed.has(id))return
  const previous=this.project(id);this.pending.add(id);this.update(id,{generation:previous.generation+1,freshness:health==='unavailable'?'uncertain':'stale',monitoring:health,queued:true})
  if(health!=='unavailable')this.schedule(id)
 }
 private schedule(id:string):void{queueMicrotask(()=>{if(!this.closing&&!this.jobs.has(id)&&this.pending.has(id))void this.start(id)})}
 /** Called on window focus only; restored projects are never armed implicitly. */
 reconcile():void{for(const [id,lease] of this.leases)void lease.reconcile().then(fresh=>{if(!fresh&&!this.closing)this.schedule(id)})}
 async execute(input:unknown):Promise<BmadProgressState>{
  if(!isBmadProgressCommand(input)||input.type==='read'||this.closing)return this.read()
  const id=input.projectId;this.armed.add(id);this.pending.add(id)
  if(this.jobs.has(id)){this.invalidate(id);return this.read()}
  await this.start(id);return this.read()
 }
 private start(id:string):Promise<void>{
  const existing=this.jobs.get(id);if(existing)return existing
  // Register the flight before the first await. At most one dirty trailing pass.
  const work=this.tail.then(async()=>{for(let pass=0;pass<2&&!this.closing;pass++){
   this.pending.delete(id);const generation=this.project(id).generation+1,controller=new AbortController();this.controllers.set(id,controller);this.update(id,{generation,status:'reading',queued:false,error:null,errorCode:null})
   let lease:ObservationLease|undefined,defer=false
   try{
    const project=await this.deps.application.dialogueProject(id);controller.signal.throwIfAborted()
    const context=this.deps.contexts.consultSelection?await this.deps.contexts.consultSelection(id,controller.signal):this.context(id)
    if(!context||selectionValidity(context)!=='valid'||!context.selection||!context.observation||canonical(project.rootPath)!==canonical(context.selection.rootPath))throw dialogueFailure('CONTEXT_MISMATCH')
    const selection=structuredClone(context.selection),observation=structuredClone(context.observation)
    const result=await this.deps.collect(id,project.rootPath,selection,observation,controller.signal);controller.signal.throwIfAborted()
    if(!isBmadProgressSnapshot(result)||result.projectId!==id||canonical(result.rootPath)!==canonical(project.rootPath)||result.rootIdentity!==selection.rootIdentity||result.initiativeId!==selection.initiativeId||result.contextRevision!==observation.revision||canonical(result.initiativePath)!==canonical(observation.initiatives.find(i=>i.id===selection.initiativeId)!.path))throw dialogueFailure('PROFILE_CHANGED')
    lease=await this.deps.observation?.attach(result,health=>this.invalidate(id,health));controller.signal.throwIfAborted()
    const reconciled=lease?await lease.reconcile():true
    const destination=await this.deps.application.dialogueProject(id);controller.signal.throwIfAborted()
    const current=this.context(id),same=canonical(destination.rootPath)===canonical(result.rootPath)&&!!current&&selectionValidity(current)==='valid'&&current.selection?.revision===selection.revision&&current.selection?.initiativeId===selection.initiativeId&&current.observation?.revision===observation.revision&&this.project(id).generation===generation
    if(this.closing)break
    if(same&&reconciled){this.leases.get(id)?.close();if(lease)this.leases.set(id,lease);lease=undefined;this.update(id,{snapshot:result,status:'ready',freshness:'current',monitoring:this.leases.get(id)?.health??'unarmed',error:null,errorCode:null})}
    else{this.update(id,{status:'stale',freshness:reconciled?'stale':'uncertain'});if(!this.project(id).snapshot)this.update(id,{snapshot:result})}
   }catch(e){if(!this.closing){const code=String((e as {code?:string}).code??'READ_REFUSED');defer=code==='BUSY'||code==='STOP_UNCONFIRMED';if(defer)this.pending.add(id);this.update(id,{status:'error',freshness:this.project(id).monitoring==='unavailable'?'uncertain':this.project(id).snapshot?'stale':'none',queued:defer||this.pending.has(id),errorCode:code,error:code==='BUSY'?'Une activité possède déjà les outils locaux.':code==='STOP_UNCONFIRMED'?'Arrêt non confirmé — récupération requise.':code==='CONTEXT_MISMATCH'?'Choisissez une initiative valide ; la sélection précédente et les preuves anciennes sont conservées.':'Lecture locale refusée ou périmée — les preuves précédentes restent historiques.'})}}
   finally{lease?.close();if(this.controllers.get(id)===controller)this.controllers.delete(id)}
   if(defer||!this.pending.has(id)||this.project(id).monitoring==='unavailable')break
  }})
  this.tail=work.catch(()=>{});this.jobs.set(id,work);void work.finally(()=>{if(this.jobs.get(id)===work)this.jobs.delete(id)});return work
 }
 async settled():Promise<void>{while(this.jobs.size)await Promise.all([...this.jobs.values()])}
 async shutdown():Promise<void>{this.closing=true;for(const off of this.off)off();for(const lease of this.leases.values())lease.close();this.leases.clear();this.pending.clear();for(const controller of this.controllers.values())controller.abort();await this.settled()}
}
