function helpError(e:unknown):string{const code=(e as {code?:string}).code,detail=(e as {detail?:string}).detail;const reason=code==='PROFILE_CHANGED'?'Préparation périmée — actualisez les aides avant de demander BMad.':code==='STOP_UNCONFIRMED'?'Arrêt de l’outil local ou de Codex non confirmé — nouveaux échanges bloqués.':code==='BUSY'?'Une activité possède déjà les outils locaux. Réessayez après sa fin.':'Lecture locale impossible — le travail précédent est conservé.';return (reason+(typeof detail==='string'?' '+detail:'')).slice(0,4000)}
import {initialHelpState,isHelpCommand,isHelpBundle,isHelpRecord,requiredHelpSources,validHelpContextText} from '../contracts/bmad-help.ts'
import type {HelpState,HelpBundle,HelpRecord,HelpToolReceipt} from '../contracts/bmad-help.ts'
import type {ContextRef} from '../contracts/index.ts'
import type {BmadProfile} from './ports.ts'
import type {Application} from './application.ts'
import {dialogueFailure} from '../contracts/dialogue.ts'
type Dependencies={application:Application;store:{read():Promise<HelpRecord[]>;write(r:HelpRecord):Promise<void>};prepare(id:string,root:string,signal:AbortSignal):Promise<HelpBundle>;profile(id:string,signal:AbortSignal):Promise<BmadProfile>;copy(text:string):Promise<void>}
export class BmadHelpCoordinator{
 private recordVersions=new Map<string,number>();private storageWarning='Envoyé, conservation locale non confirmée — réessayez uniquement l’enregistrement.';private deps:Dependencies;private state=initialHelpState();private listeners=new Set<(s:HelpState)=>void>();private ready:Promise<void>|null=null;private active:Promise<void>|null=null;private controller:AbortController|null=null;private closing=false;private writes:Promise<unknown>=Promise.resolve()
 constructor(deps:Dependencies){this.deps=deps}
 read():HelpState{return structuredClone(this.state)}
 subscribe(fn:(s:HelpState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private update(change:Partial<HelpState>):void{this.state={...this.state,...change,sequence:this.state.sequence+1};for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private restore():Promise<void>{return this.ready??=(async()=>{const records=await this.deps.store.read();if(!records.every(isHelpRecord))throw dialogueFailure('STORAGE_READ_FAILED');this.update({records:records.map(r=>({...r,outcome:r.outcome==='pending'?'unknown':r.outcome}))})})()}
 async execute(input:unknown):Promise<HelpState>{
  if(!isHelpCommand(input))return {...this.read(),error:'INVALID_COMMAND'}
  try{await this.restore()}catch{return {...this.read(),status:'error',error:'Lecture des aides conservées impossible ; les fichiers existants sont préservés.'}}
  if(input.type==='read')return this.read()
  if(this.closing)return {...this.read(),error:'APP_CLOSING'}
  if(input.type==='retry-save'){const r=this.state.records.find(r=>r.conversationId===input.conversationId);if(r)try{await this.save(r)}catch{};return this.read()}
  if(input.type==='copy'){try{await this.deps.copy('$bmad');this.update({error:null})}catch{this.update({error:'Copie impossible — sélectionnez le texte.'})}return this.read()}
  if(this.active)return {...this.read(),error:'BUSY'}
  this.controller=new AbortController();this.update({status:'reading',projectId:input.projectId,error:null})
  this.active=(async()=>{try{const project=await this.deps.application.dialogueProject(input.projectId);const bundle=await this.deps.prepare(project.id,project.rootPath,this.controller!.signal);if(!isHelpBundle(bundle))throw dialogueFailure('PROFILE_UNRECOGNIZED');this.update({status:'ready',bundle})}catch(e){this.update({status:'error',error:helpError(e)})}finally{this.active=null}})()
  return this.read()
 }
 async settled():Promise<void>{await this.active;await this.writes}
 async profile(projectId:string,signal:AbortSignal):Promise<BmadProfile>{await this.restore();if(this.active||this.state.status!=='ready'||this.state.bundle?.projectId!==projectId)throw dialogueFailure('PROFILE_CHANGED');return this.deps.profile(this.state.bundle.id,signal)}
 private project(record:HelpRecord):void{
  this.recordVersions.set(record.conversationId,(this.recordVersions.get(record.conversationId)??0)+1)
  this.update({records:this.state.records.some(r=>r.conversationId===record.conversationId)?this.state.records.map(r=>r.conversationId===record.conversationId?record:r):[...this.state.records,record]})
 }
 private acknowledgeStorage(conversationId:string,version:number,storage:HelpRecord['storage']):void{
  if((this.recordVersions.get(conversationId)??0)!==version)return
  const current=this.state.records.find(r=>r.conversationId===conversationId)
  if(!current)return
  this.update({records:this.state.records.map(r=>r.conversationId===conversationId?{...current,storage}:r)})
  if(storage==='stored'&&this.state.error===this.storageWarning)this.update({error:null})
 }
 private save(record:HelpRecord):Promise<void>{
  const conversationId=record.conversationId
  const work=this.writes.then(async()=>{
   // A queued retry writes the current complete body, never its old caller snapshot.
   const current=this.state.records.find(r=>r.conversationId===conversationId)
   if(!current)throw dialogueFailure('CONTEXT_MISMATCH')
   const version=this.recordVersions.get(conversationId)??0
   const candidate={...structuredClone(current),storage:'stored' as const}
   try{await this.deps.store.write(candidate);this.acknowledgeStorage(conversationId,version,'stored')}
   catch(error){this.acknowledgeStorage(conversationId,version,'failed');this.update({error:this.storageWarning});throw error}
  })
  this.writes=work.catch(()=>{})
  return work
 }

 async begin(bundle:HelpBundle,context:ContextRef):Promise<void>{await this.restore();const record:HelpRecord={schemaVersion:1,conversationId:context.conversationId!,context:structuredClone(context),invocation:'$bmad',bundle:structuredClone(bundle),turns:[],localTurnId:null,nativeThreadId:null,nativeTurnId:null,transmission:'none',tools:[],response:null,outcome:'pending',storage:'pending'};this.project(record);await this.save(record)}
 async tool(conversationId:string,receipt:HelpToolReceipt):Promise<void>{
  const current=this.state.records.find(r=>r.conversationId===conversationId);if(!current)throw dialogueFailure('CONTEXT_MISMATCH')
  const tools=[...current.tools,structuredClone(receipt)]
  const knowledge=tools.some(t=>t.operation==='knowledge'),config=tools.some(t=>t.operation==='config')
  const required=requiredHelpSources(current.bundle).map(s=>s.id)
  const batch=tools.some(t=>t.operation==='read'&&t.reference==='required-context'&&validHelpContextText(t.raw,current.bundle))
  const transmitted=knowledge&&config&&(batch||required.every(id=>tools.some(t=>t.operation==='read'&&t.reference===id))&&tools.some(t=>t.reference==='inventories'))
  const next={...current,nativeThreadId:receipt.threadId,nativeTurnId:receipt.turnId,transmission:transmitted?'transmitted' as const:'partial' as const,tools,storage:'pending' as const};this.project(next);await this.save(next)
 }
 async response(conversationId:string,localTurnId:string,text:string,native?:{threadId:string;turnId:string}|null):Promise<void>{const r=this.state.records.find(r=>r.conversationId===conversationId);if(!r||r.transmission!=='transmitted')throw dialogueFailure('PROVIDER_FAILED');const threadId=native?.threadId??r.nativeThreadId,nativeId=native?.turnId??r.nativeTurnId;if(!threadId||!nativeId)throw dialogueFailure('PROVIDER_FAILED');const next={...r,turns:[...r.turns,{localId:localTurnId,nativeId,threadId,response:text}],nativeThreadId:threadId,nativeTurnId:nativeId,localTurnId,response:text,outcome:'received' as const,storage:'pending' as const};this.project(next);await this.save(next)}
 async shutdown():Promise<'stopped'|'unknown'>{this.closing=true;this.controller?.abort();await this.active;await this.writes;this.update({status:'closing'});return 'stopped'}
}
