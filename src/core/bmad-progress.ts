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
type Dependencies={application:{dialogueProject(id:string):Promise<{id:string;rootPath:string}>};contexts:{read():Pick<BmadContextState,'projects'>;consultSelection?(id:string,signal:AbortSignal):Promise<BmadContextProject>};collect(id:string,root:string,selection:BmadSelection,observation:BmadContextObservation,signal:AbortSignal):Promise<BmadProgressSnapshot>}
export class BmadProgressCoordinator{
 private deps:Dependencies;private state=initialBmadProgressState();private listeners=new Set<(s:BmadProgressState)=>void>();private controllers=new Map<string,AbortController>();private active=new Set<Promise<unknown>>();private closing=false
 constructor(deps:Dependencies){this.deps=deps}
 read():BmadProgressState{return structuredClone(this.state)}
 subscribe(fn:(s:BmadProgressState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private project(id:string):BmadProgressProject{return this.state.projects.find(p=>p.projectId===id)??{projectId:id,generation:0,status:'idle',snapshot:null,errorCode:null,error:null}}
 private update(id:string,change:Partial<BmadProgressProject>):void{this.state={contractVersion:1,sequence:this.state.sequence+1,projects:[...this.state.projects.filter(p=>p.projectId!==id),{...this.project(id),...change}]};for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private context(id:string):BmadContextProject|undefined{return this.deps.contexts.read().projects.find(p=>p.projectId===id)}
 async execute(input:unknown):Promise<BmadProgressState>{
  if(!isBmadProgressCommand(input)||input.type==='read'||this.closing)return this.read()
  const id=input.projectId,generation=this.project(id).generation+1,controller=new AbortController();this.controllers.get(id)?.abort();this.controllers.set(id,controller);this.update(id,{generation,status:'reading',error:null,errorCode:null})
  const work=(async()=>{try{
   const project=await this.deps.application.dialogueProject(id);controller.signal.throwIfAborted()
   const context=this.deps.contexts.consultSelection?await this.deps.contexts.consultSelection(id,controller.signal):this.context(id)
   if(!context||selectionValidity(context)!=='valid'||!context.selection||!context.observation||canonical(project.rootPath)!==canonical(context.selection.rootPath))throw dialogueFailure('CONTEXT_MISMATCH')
   const selection=structuredClone(context.selection),observation=structuredClone(context.observation)
   const result=await this.deps.collect(id,project.rootPath,selection,observation,controller.signal);controller.signal.throwIfAborted()
   if(!isBmadProgressSnapshot(result)||result.projectId!==id||canonical(result.rootPath)!==canonical(project.rootPath)||result.rootIdentity!==selection.rootIdentity||result.initiativeId!==selection.initiativeId||result.contextRevision!==observation.revision||canonical(result.initiativePath)!==canonical(observation.initiatives.find(i=>i.id===selection.initiativeId)!.path))throw dialogueFailure('PROFILE_CHANGED')
   const destination=await this.deps.application.dialogueProject(id);controller.signal.throwIfAborted()
   const current=this.context(id),same=canonical(destination.rootPath)===canonical(result.rootPath)&&!!current&&selectionValidity(current)==='valid'&&current.selection?.revision===selection.revision&&current.selection?.initiativeId===selection.initiativeId&&current.observation?.revision===observation.revision
   if(!this.closing&&this.project(id).generation===generation)this.update(id,{snapshot:result,status:same?'ready':'stale',error:null,errorCode:null})
  }catch(e){if(!this.closing&&this.project(id).generation===generation){const code=String((e as {code?:string}).code??'READ_REFUSED');this.update(id,{status:'error',errorCode:code,error:code==='BUSY'?'Une activité possède déjà les outils locaux.':code==='STOP_UNCONFIRMED'?'Arrêt non confirmé — récupération requise.':code==='CONTEXT_MISMATCH'?'Choisissez une initiative valide ; la sélection précédente et les preuves anciennes sont conservées.':'Lecture locale refusée ou périmée — les preuves précédentes restent historiques.'})}}finally{if(this.controllers.get(id)===controller)this.controllers.delete(id)}})()
  this.active.add(work);try{await work}finally{this.active.delete(work)}return this.read()
 }
 async settled():Promise<void>{await Promise.all([...this.active])}
 async shutdown():Promise<void>{this.closing=true;for(const controller of this.controllers.values())controller.abort();await this.settled()}
}
