import {randomUUID} from 'node:crypto'
import {initialCatalogLaunchState,isCatalogLaunchCommand,isCatalogPreparation,isCatalogLaunchRecord,catalogUnavailable,catalogFamily} from '../contracts/bmad-catalog-launch.ts'
import type {CatalogLaunchState,CatalogPreparation,CatalogLaunchRecord,CatalogFamily} from '../contracts/bmad-catalog-launch.ts'
import type {BmadProfile} from './ports.ts'
import type {ContextRef} from '../contracts/index.ts'
import type {BmadCatalogCoordinator} from './bmad-catalog.ts'
import type {BmadContextCoordinator} from './bmad-context.ts'
import {dialogueFailure,dialogueError} from '../contracts/dialogue.ts'
export type QualifiedCatalogProfile={profile:BmadProfile;source:{path:string;sha256:string;bytes:number}}
export type ResolvedCatalogLaunch={preparation:CatalogPreparation;profile:BmadProfile;connectionId:string|null;assertFresh():Promise<void>}
type Dependencies={catalog:BmadCatalogCoordinator;contexts:BmadContextCoordinator;connectionIdentity():Promise<string|null>;qualify(family:CatalogFamily,projectId:string,rootPath:string,signal:AbortSignal,previous?:BmadProfile):Promise<QualifiedCatalogProfile>;store:{read():Promise<CatalogLaunchRecord[]>;write(record:CatalogLaunchRecord):Promise<void>}}
const canonical=(p:string)=>p.replaceAll('\\','/').toLowerCase()
const reason=(e:unknown)=>{const code=dialogueError(e,'PROFILE_UNRECOGNIZED');return code==='PROFILE_CHANGED'?'Préparation périmée — relisez la fiche puis préparez de nouveau.':code==='CONTEXT_MISMATCH'?'Sélection Madness et initiative active doivent concorder pour ce profil.':code==='BUSY'||code==='CONNECTION_BUSY'?'Les outils sont occupés — attendez la fin de l’activité avant de préparer.':code==='STOP_UNCONFIRMED'?'Arrêt non confirmé — récupération requise avant tout lancement.':code==='PROFILE_ABSENT'?'Profil natif ou dépendance obligatoire absent — consultez la source puis préparez de nouveau.':code==='RESOLVER_FAILED'?'Runtime local ou résolveurs épinglés non vérifiés — consultation et copie restent distinctes ; relisez la fiche avant une nouvelle préparation.':code==='UNSUPPORTED_INTERACTION'?'Ce mode ou cette opération n’est pas admis par le profil natif ; aucune permission ajoutée.':'La source gagnante, ses octets ou ses personnalisations ne correspondent pas au profil natif admis. Consultez la source puis préparez de nouveau.'}
/** Owns evidence, never a native session. Only DialogueCoordinator consumes a preparation. */
export class BmadCatalogLaunchCoordinator{
 private state=initialCatalogLaunchState();private listeners=new Set<(s:CatalogLaunchState)=>void>();private restoring:Promise<void>|null=null;private busy=false;private closing=false;private controller:AbortController|null=null;private work:Promise<unknown>|null=null;private writes:Promise<unknown>=Promise.resolve();private resolved:{preparation:CatalogPreparation;profile:BmadProfile;connectionId:string|null}|null=null;private deps:Dependencies
 constructor(deps:Dependencies){this.deps=deps}
 read():CatalogLaunchState{return structuredClone(this.state)}
 subscribe(fn:(s:CatalogLaunchState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private update(change:Partial<CatalogLaunchState>):void{this.state={...this.state,...change,sequence:this.state.sequence+1};for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private restore():Promise<void>{return this.restoring??=(async()=>{const records=await this.deps.store.read();if(records.length>200||!records.every(isCatalogLaunchRecord))throw dialogueFailure('STORAGE_READ_FAILED');this.update({records:records.map(r=>({...r,transmission:r.transmission==='none'?'unknown':r.transmission}))})})()}
 async execute(input:unknown):Promise<CatalogLaunchState>{
  if(!isCatalogLaunchCommand(input))return {...this.read(),error:'Commande de lancement refusée.',errorCode:'INVALID_COMMAND'}
  try{await this.restore()}catch{return {...this.read(),status:'error',error:'Origines conservées illisibles — fichiers préservés ; lancement indisponible.',errorCode:'STORAGE_READ_FAILED'}}
  if(input.type==='read'||this.closing)return this.read()
  if(input.type==='retry-save'){try{await this.save(input.conversationId)}catch{};return this.read()}
  if(input.type==='cancel'){if(this.resolved?.preparation.id===input.preparationId&&this.state.status!=='launching'){this.resolved=null;this.controller?.abort();this.update({status:'idle',preparation:null,error:null})}return this.read()}
  if(this.busy||this.state.status==='launching')return {...this.read(),error:'Une préparation est déjà en cours.'}
  this.busy=true;this.resolved=null;this.controller=new AbortController();const signal=this.controller.signal
  this.update({status:'preparing',preparation:null,error:null,errorCode:null})
  const work=(async()=>{
   try{
    const selectionAtStart=this.selection(input.projectId),connectionId=await this.deps.connectionIdentity()
    const {snapshot,generation}=await this.deps.catalog.capture(input.projectId,input.itemId,input.revision,signal),unavailable=catalogUnavailable(snapshot,input.itemId)
    if(unavailable){this.update({status:'error',error:unavailable,errorCode:'PROFILE_UNRECOGNIZED'});return}
    const family=catalogFamily(input.itemId)!;if(input.mode==='file-approval'&&family!=='mary')throw dialogueFailure('UNSUPPORTED_INTERACTION')
    const native=await this.deps.qualify(family,input.projectId,snapshot.rootPath,signal),profile={...native.profile,mode:input.mode}
    this.match(snapshot,input.itemId,native)
    const required=(profile.kind==='forge'&&profile.forge?.initiativeId!=null)||(profile.kind==='help'&&profile.help?.initiativeId!=null)
    const captured=await this.deps.contexts.capture(input.projectId,required,signal)
    if((profile.kind==='forge'&&profile.forge?.initiativeId!==captured.initiativeId)||(profile.kind==='help'&&profile.help?.initiativeId!==captured.initiativeId))throw dialogueFailure('PROFILE_CHANGED')
    const preparation:CatalogPreparation={schemaVersion:1,id:'catalog-'+randomUUID(),projectId:input.projectId,itemId:input.itemId,generation,snapshot,captured,selectionRevision:selectionAtStart,nativeContext:{outputBase:profile.forge?.outputBase??null,contextDigest:profile.forge?.contextDigest??null,bundleId:profile.help?.bundleId??null},family,mode:input.mode,fingerprint:profile.fingerprint,skillPath:profile.skillPath,firstInput:family==='help'?'$bmad\nQue faire ensuite ?':'$'+input.itemId,effects:family==='forge'?'Nouvelle session Forge uniquement dans sa sortie qualifiée ; recherche des sessions existantes obligatoire. Aucune reprise.':input.mode==='file-approval'?'Mary ; chaque patch complet exige un accord ponctuel. Aucun accord global.':'Lecture seule ; questions non secrètes et discussion du profil natif uniquement.',preparedAt:new Date().toISOString()}
    if(!isCatalogPreparation(preparation))throw dialogueFailure('PROFILE_UNRECOGNIZED')
    const resolved={preparation,profile,connectionId};await this.assert(resolved,signal);signal.throwIfAborted()
    if(this.closing)return
    this.resolved=resolved;this.update({status:'prepared',preparation,errorCode:null})
   }catch(e){if(!this.closing)this.update({status:'error',preparation:null,error:reason(e),errorCode:dialogueError(e,'PROFILE_UNRECOGNIZED')})}
   finally{this.busy=false}
  })();this.work=work;await work;return this.read()
 }
 private selection(id:string):number|null{return this.deps.contexts.read().projects.find(p=>p.projectId===id)?.selection?.revision??null}
 private match(snapshot:CatalogPreparation['snapshot'],itemId:string,native:QualifiedCatalogProfile):void{
  const item=snapshot.items.find(i=>i.id===itemId),source=snapshot.sources.find(s=>s.id===item?.sourceId)
  if(!source||canonical(native.profile.rootPath)!==canonical(snapshot.rootPath)||canonical(native.source.path)!==canonical(source.path)||native.source.sha256!==source.sha256||native.source.bytes!==source.bytes||native.profile.kind!==(catalogFamily(itemId)==='mary'?undefined:catalogFamily(itemId)))throw dialogueFailure('PROFILE_UNRECOGNIZED')
 }
 private async assert(value:NonNullable<BmadCatalogLaunchCoordinator['resolved']>,signal:AbortSignal):Promise<void>{
  const p=value.preparation
  const current=()=>{signal.throwIfAborted();if(this.closing||this.selection(p.projectId)!==p.selectionRevision)throw dialogueFailure('PROFILE_CHANGED')}
  current()
  if(await this.deps.connectionIdentity()!==value.connectionId)throw dialogueFailure('PROFILE_CHANGED');current()
  const c=await this.deps.catalog.capture(p.projectId,p.itemId,p.snapshot.revision,signal);current()
  if(c.generation!==p.generation||c.snapshot.rootIdentity!==p.snapshot.rootIdentity)throw dialogueFailure('PROFILE_CHANGED')
  await this.deps.contexts.assertFresh(p.captured,signal);current()
 }
 async consume(projectId:string,preparationId:string,signal:AbortSignal):Promise<ResolvedCatalogLaunch>{
  await this.restore();const value=this.resolved
  if(this.busy||!value||this.state.status!=='prepared'||value.preparation.id!==preparationId||value.preparation.projectId!==projectId)throw dialogueFailure('PROFILE_CHANGED')
  this.resolved=null;this.update({status:'launching',error:null})
  try{
   await this.assert(value,signal)
   const p=value.preparation,native=await this.deps.qualify(p.family,p.projectId,p.snapshot.rootPath,signal,value.profile);this.match(p.snapshot,p.itemId,native)
   if(JSON.stringify({...native.profile,mode:p.mode})!==JSON.stringify(value.profile))throw dialogueFailure('PROFILE_CHANGED')
   await this.assert(value,signal)
   return {preparation:structuredClone(p),profile:structuredClone(value.profile),connectionId:value.connectionId?.split(':')[0]??null,assertFresh:()=>this.assert(value,signal)}
  }catch(e){this.update({status:'error',preparation:null,error:reason(e),errorCode:dialogueError(e,'PROFILE_UNRECOGNIZED')});throw e}
 }
 async begin(preparation:CatalogPreparation,context:ContextRef,requestId:string):Promise<void>{
  if(this.state.records.length>=200||context.projectId!==preparation.projectId||context.initiativeId!==preparation.captured.initiativeId)throw dialogueFailure('OUTPUT_REFUSED')
  const record:CatalogLaunchRecord={schemaVersion:1,conversationId:context.conversationId!,context:structuredClone(context),requestId,preparation:structuredClone(preparation),transmission:'none',turnId:null,storage:'pending'}
  if(!isCatalogLaunchRecord(record))throw dialogueFailure('CONTEXT_MISMATCH')
  this.update({records:[...this.state.records,record]});await this.save(record.conversationId)
 }
 async acknowledge(conversationId:string,requestId:string,turnId:string):Promise<void>{
  const r=this.state.records.find(r=>r.conversationId===conversationId)
  if(!r||r.requestId!==requestId||r.transmission!=='none')throw dialogueFailure('CONTEXT_MISMATCH')
  this.update({records:this.state.records.map(r=>r.conversationId===conversationId?{...r,transmission:'sent',turnId,storage:'pending'}:r),status:'idle',preparation:null});await this.save(conversationId)
 }
 async failed(conversationId:string|null):Promise<void>{if(conversationId){const r=this.state.records.find(r=>r.conversationId===conversationId);if(r?.transmission==='none'){this.update({records:this.state.records.map(v=>v===r?{...r,transmission:'unknown',storage:'pending'}:v)});try{await this.save(conversationId)}catch{}}}if(this.state.status==='launching')this.update({status:'error',preparation:null,error:'Lancement interrompu ou refusé ; aucun nouvel envoi automatique. Préparez de nouveau.'})}
 private save(id:string):Promise<void>{const work=this.writes.then(async()=>{const current=this.state.records.find(r=>r.conversationId===id);if(!current)return;const candidate={...structuredClone(current),storage:'stored' as const};try{await this.deps.store.write(candidate);if(this.state.records.find(r=>r.conversationId===id)===current)this.update({records:this.state.records.map(r=>r===current?candidate:r),error:null})}catch(e){if(this.state.records.find(r=>r.conversationId===id)===current)this.update({records:this.state.records.map(r=>r===current?{...current,storage:'failed'}:r),error:'Origine ou reçu conservé pour cette session — enregistrement échoué. Réessayez seulement l’enregistrement.'});throw e}});this.writes=work.catch(()=>{});return work}
 /** Recovery cancels and drains only this coordinator's live preparation. */
 async stopQualification():Promise<void>{if(this.busy){this.controller?.abort();await this.work}}
 async shutdown():Promise<void>{this.closing=true;this.controller?.abort();this.resolved=null;await this.work;await this.writes}
}
/** Reserve the shared slot and a distinct durable batch before any native qualifier runs. */
export async function withCatalogQualification<T>(
 admission:{enter(kind:'helper'):()=>void},guard:()=>Promise<void>,work:()=>Promise<T>,
 ownership?:{owner:{begin():Promise<string>;closed(runId:string,confirmed:boolean):Promise<boolean>};onUnknown():void}
):Promise<T>{
 const release=admission.enter('helper');let runId:string|undefined
 const unknown=():never=>{ownership?.onUnknown();throw dialogueFailure('STOP_UNCONFIRMED')}
 try{
  await guard()
  if(ownership)try{runId=await ownership.owner.begin()}catch{unknown()}
  let result:T
  try{result=await work()}
  catch(error){
   const uncertain=dialogueError(error,'PROVIDER_FAILED')==='STOP_UNCONFIRMED'
   if(uncertain)ownership?.onUnknown()
   if(runId)try{if(!await ownership!.owner.closed(runId,!uncertain))unknown()}catch{unknown()}
   throw error
  }
  if(runId)try{if(!await ownership!.owner.closed(runId,true))unknown()}catch{unknown()}
  return result
 }finally{release()}
}
