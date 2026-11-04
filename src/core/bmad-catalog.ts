import {initialBmadCatalogState,isBmadCatalogCommand,isBmadCatalogSnapshot} from '../contracts/bmad-catalog.ts'
import type {BmadCatalogState,BmadCatalogProject,BmadCatalogSnapshot,CatalogCopyResult} from '../contracts/bmad-catalog.ts'
import type {ObservationPort,ObservationLease,MonitoringHealth} from './bmad-observation.ts'
import {dialogueFailure} from '../contracts/dialogue.ts'
const canonical=(p:string)=>p.replaceAll('\\','/').replace(/\/$/,'').toLowerCase()
export function filterCatalog<T extends {sources?:{id:string;text:string}[];items:{name:string;module:string|null;invocation:string|null;sourceId?:string|null;documentation?:{value:string}[];fields:{purpose:{value:string}|null}}[]}>(s:T,query:string,module:string):T['items']{const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);return s.items.filter(i=>{const source=s.sources?.find(source=>source.id===i.sourceId)?.text;const searchable=[i.name,i.invocation,i.fields.purpose?.value,source,...(i.documentation??[]).map(f=>f.value)].filter(Boolean).join(' ').toLocaleLowerCase();return (!module||i.module===module)&&terms.every(t=>searchable.includes(t))})}
type Dependencies={files?:{accept(original:object,producer:'catalog'):void;invalidate(projectId:string,producer:'catalog'):void};application:{dialogueProject(id:string):Promise<{id:string;rootPath:string}>};observation?:ObservationPort;available?:(fn:()=>void)=>()=>void;collect(id:string,root:string,signal:AbortSignal):Promise<BmadCatalogSnapshot>;clipboard:{writeText(text:string):void|Promise<void>;readText():string|Promise<string>}}
export class BmadCatalogCoordinator{
 private state=initialBmadCatalogState();private listeners=new Set<(s:BmadCatalogState)=>void>();private controllers=new Map<string,AbortController>();private jobs=new Map<string,Promise<void>>();private leases=new Map<string,ObservationLease>();private pending=new Set<string>();private armed=new Set<string>();private closing=false;private availability=0;private tail:Promise<void>=Promise.resolve();private off:(()=>void)[]=[];private deps:Dependencies
 constructor(deps:Dependencies){this.deps=deps;if(deps.available)this.off.push(deps.available(()=>{this.availability++;for(const id of this.pending)if(!this.jobs.has(id))this.schedule(id)}))}
 read():BmadCatalogState{return structuredClone(this.state)}
 subscribe(fn:(s:BmadCatalogState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private project(id:string):BmadCatalogProject{return this.state.projects.find(p=>p.projectId===id)??{projectId:id,generation:0,status:'idle',freshness:'none',monitoring:'unarmed',queued:false,snapshot:null,copy:null,errorCode:null,error:null}}
 private update(id:string,change:Partial<BmadCatalogProject>):void{this.state={contractVersion:1,sequence:this.state.sequence+1,projects:[...this.state.projects.filter(p=>p.projectId!==id),{...this.project(id),...change}]};for(const fn of this.listeners)try{fn(this.read())}catch{}}
 invalidate(id:string,health:MonitoringHealth='watching'):void{if(this.closing||!this.armed.has(id))return;this.deps.files?.invalidate(id,'catalog');this.pending.add(id);this.update(id,{generation:this.project(id).generation+1,freshness:health==='unavailable'?'uncertain':'stale',monitoring:health,queued:true});if(health!=='unavailable')this.schedule(id)}
 private schedule(id:string):void{if(this.project(id).errorCode==='STOP_UNCONFIRMED')return;queueMicrotask(()=>{if(!this.closing&&!this.jobs.has(id)&&this.pending.has(id)&&this.project(id).errorCode!=='STOP_UNCONFIRMED')void this.start(id)})}
 reconcile():void{for(const id of this.armed)void Promise.resolve(this.leases.get(id)?.reconcile()??false).then(fresh=>{if(!this.closing&&!this.jobs.has(id)&&(!fresh||this.pending.has(id)||this.project(id).freshness==='uncertain')){this.pending.add(id);this.schedule(id)}}).catch(()=>this.invalidate(id,'unavailable'))}
 async execute(input:unknown):Promise<BmadCatalogState>{if(!isBmadCatalogCommand(input)||input.type==='read'||this.closing)return this.read();if(input.type==='copy'){await this.copy(input);return this.read()}const id=input.projectId;this.armed.add(id);this.pending.add(id);if(this.jobs.has(id)){this.invalidate(id);return this.read()}await this.start(id);return this.read()}
 private start(id:string):Promise<void>{const existing=this.jobs.get(id);if(existing)return existing;let deferredAt:number|null=null;const work=this.tail.then(async()=>{for(let pass=0;pass<2&&!this.closing;pass++){
  this.pending.delete(id);const generation=this.project(id).generation+1,controller=new AbortController();this.controllers.set(id,controller);const availabilityAtStart=this.availability;this.update(id,{generation,status:'reading',queued:false,error:null,errorCode:null});let lease:ObservationLease|undefined,defer=false
  try{
   const project=await this.deps.application.dialogueProject(id);controller.signal.throwIfAborted();if(this.closing||this.project(id).generation!==generation)continue
   const result=await this.deps.collect(id,project.rootPath,controller.signal);controller.signal.throwIfAborted()
   if(!isBmadCatalogSnapshot(result)||result.projectId!==id||canonical(result.rootPath)!==canonical(project.rootPath))throw dialogueFailure('PROFILE_CHANGED')
   if(this.closing||this.project(id).generation!==generation)continue
   let attaching=true,degraded=false
   lease=await this.deps.observation?.attach(result,health=>{if(this.closing)return;if(attaching&&health==='unavailable'){degraded=true;this.update(id,{monitoring:'unavailable',freshness:'uncertain'})}else this.invalidate(id,health)});controller.signal.throwIfAborted()
   const reconciled=lease?await lease.reconcile():true;controller.signal.throwIfAborted()
   const destination=await this.deps.application.dialogueProject(id);controller.signal.throwIfAborted();attaching=false
   if(this.closing)break
   if(this.project(id).generation!==generation||canonical(destination.rootPath)!==canonical(result.rootPath)){this.pending.add(id);this.update(id,{status:'stale',freshness:'stale'});continue}
   this.leases.get(id)?.close();this.leases.delete(id);if(lease)this.leases.set(id,lease);lease=undefined
   if(reconciled&&!degraded)this.deps.files?.accept(result,'catalog');else this.deps.files?.invalidate(id,'catalog')
   this.update(id,{snapshot:result,status:'ready',freshness:reconciled&&!degraded?'current':'uncertain',monitoring:this.leases.get(id)?.health??'unarmed',error:null,errorCode:null})
  // Unknown stop requires explicit collect under admission; BUSY retains earlier external availability.
  }catch(e){if(!this.closing){const code=String((e as {code?:string}).code??'READ_REFUSED');defer=code==='BUSY'||code==='STOP_UNCONFIRMED';if(defer){this.pending.add(id);deferredAt=code==='BUSY'?availabilityAtStart:this.availability}this.update(id,{status:'error',freshness:this.project(id).monitoring==='unavailable'?'uncertain':this.project(id).snapshot?'stale':'none',queued:defer||this.pending.has(id),errorCode:code,error:code==='BUSY'?'Les outils locaux sont occupés ; la lecture attend leur libération.':code==='STOP_UNCONFIRMED'?'Arrêt non confirmé — récupération requise.':'Inventaire indisponible — lecture locale refusée ou périmée. Les données précédentes restent historiques.'})}}
  finally{lease?.close();if(this.controllers.get(id)===controller)this.controllers.delete(id)}
  if(defer||!this.pending.has(id)||this.project(id).monitoring==='unavailable')break
 }});this.tail=work.catch(()=>{});this.jobs.set(id,work);void work.finally(()=>{if(this.jobs.get(id)===work)this.jobs.delete(id);if(this.pending.has(id)&&(deferredAt!==null?this.availability!==deferredAt:this.project(id).monitoring!=='unavailable'))this.schedule(id)});return work}
 private async copy(command:{correlationId:string;projectId:string;itemId:string;revision:string}):Promise<void>{const work=this.tail.then(async()=>{
  const {projectId:id,itemId,revision}=command,p=this.project(id),generation=p.generation,snapshot=p.snapshot;let result:CatalogCopyResult={correlationId:command.correlationId,projectId:id,itemId,revision,status:'stale',reason:'La fiche est inconnue ou périmée ; actualisez le catalogue.'}
  const current=()=>!this.closing&&this.project(id).generation===generation&&this.project(id).freshness==='current'&&this.project(id).snapshot?.revision===revision
  try{
   if(!snapshot||snapshot.revision!==revision||!current())throw Error('STALE')
   const item=snapshot.items.find(i=>i.id===itemId);if(!item?.copyable||!item.invocation)throw Error('STALE')
   const lease=this.leases.get(id);if(!lease||!await lease.reconcile()||!current())throw Error('STALE')
   const project=await this.deps.application.dialogueProject(id);if(!current()||canonical(project.rootPath)!==canonical(snapshot.rootPath)||!await lease.reconcile()||!current())throw Error('STALE')
   await this.deps.clipboard.writeText(item.invocation)
   const copied=await this.deps.clipboard.readText();if(!current())throw Error('STALE')
   const destination=await this.deps.application.dialogueProject(id);if(!current()||canonical(destination.rootPath)!==canonical(snapshot.rootPath)||!await lease.reconcile()||!current())throw Error('STALE')
   result={...result,status:copied===item.invocation?'copied':'failed',reason:copied===item.invocation?null:'Copie impossible — sélectionnez le texte.'}
  }catch(e){result={...result,status:String((e as Error).message)==='STALE'?'stale':'failed',reason:String((e as Error).message)==='STALE'?result.reason:'Copie impossible — sélectionnez le texte.'}}
  if(!this.closing)this.update(id,{copy:result})
 });this.tail=work.catch(()=>{});await work}
 /** Resolve current winning references without clipboard or a new collection. */
 async capture(projectId:string,itemId:string,revision:string,signal:AbortSignal):Promise<{snapshot:BmadCatalogSnapshot;generation:number}>{
  const p=this.project(projectId),generation=p.generation,snapshot=p.snapshot,lease=this.leases.get(projectId)
  const current=()=>{signal.throwIfAborted();const now=this.project(projectId);if(this.closing||!snapshot||now.generation!==generation||now.freshness!=='current'||now.status!=='ready'||now.snapshot?.revision!==revision)throw dialogueFailure('PROFILE_CHANGED')}
  current();if(!snapshot||snapshot.revision!==revision||!snapshot.items.some(i=>i.id===itemId)||!lease)throw dialogueFailure('PROFILE_CHANGED')
  if(!await lease.reconcile())throw dialogueFailure('PROFILE_CHANGED');current()
  const destination=await this.deps.application.dialogueProject(projectId);current()
  if(canonical(destination.rootPath)!==canonical(snapshot.rootPath)||!await lease.reconcile())throw dialogueFailure('PROFILE_CHANGED');current()
  return {snapshot:structuredClone(snapshot),generation}
 }
 async settled():Promise<void>{await this.tail;while(this.jobs.size)await Promise.all([...this.jobs.values()])}
 async shutdown():Promise<void>{this.closing=true;for(const off of this.off)off();for(const lease of this.leases.values())lease.close();this.leases.clear();this.pending.clear();for(const c of this.controllers.values())c.abort();await this.settled()}
}
