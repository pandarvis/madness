import {randomUUID} from 'node:crypto'
import {initialProjectFilesState,isProjectFilesCommand} from '../contracts/project-files.ts'
import type {FileProducer,ProjectFileReference,ProjectFilesState,FilePreview,FileResult} from '../contracts/project-files.ts'
/** Host-only port. Its authority must originate from a native capture, never a GraphSnapshot. */
export type FileAuthority={refusal?:string;producer:FileProducer;projectId:string;rootPath:string;rootIdentity:string;initiativeId?:string|null;revision:string;observedAt:string;sources:{id:string;path:string;sha256:string;bytes:number}[];read(sourceId:string,signal:AbortSignal):Promise<{path:string;sha256:string;bytes:number;text:string}>;verify(sourceId:string,signal:AbortSignal):Promise<{path:string;sha256:string;bytes:number}>}
type Dependencies={application:{dialogueProject(id:string):Promise<{id:string;rootPath:string}>};authority(original:object):FileAuthority|undefined;clipboard:{writeText(text:string):void|Promise<void>;readText():string|Promise<string>};editor?:(uri:string)=>Promise<void>;admission:{enter(kind:'helper'):()=>void}}
const canonical=(s:string)=>s.replaceAll('\\','/').replace(/\/$/,'').toLowerCase()
export function vscodeFileUri(path:string):string{
 const p=path.replaceAll('\\','/')
 if(!/^[A-Za-z]:\//.test(p)||p.slice(2).includes(':')||/[\u0000-\u001f\u007f]/.test(p)||p.split('/').some(s=>s==='.'||s==='..')||p.includes('//'))throw Error('EDITOR_PATH_REFUSED')
 const uri='vscode://file/'+p.slice(0,2)+p.slice(2).split('/').map(s=>encodeURIComponent(s)).join('/')
 if(uri.length>2081)throw Error('EDITOR_URI_LIMIT')
 return uri
}
const reasons:Record<string,string>={BUSY:'Une activité possède déjà les outils locaux. Réessayez après sa fin.',STOP_UNCONFIRMED:'Arrêt non confirmé — vérifiez son arrêt avant une nouvelle demande.',PREVIEW_TYPE:'Format d’aperçu non pris en charge. Aucun contenu affiché.',PREVIEW_UTF8:'Format UTF-8 invalide — aperçu refusé.',PREVIEW_BINARY:'Contenu binaire — aperçu refusé.',FILE_LIMIT:'Lecture trop volumineuse — aucune troncature affichée.',APP_CLOSING:'Fermeture en cours — demande détachée.',EDITOR_UNKNOWN:'Résultat de la demande d’ouverture inconnu — ouverture non confirmée. Aucun nouvel envoi automatique.',EDITOR_FAILED:'Demande d’ouverture échouée — vous pouvez copier le chemin.'}
export class ProjectFilesCoordinator{
 private deps:Dependencies;private state=initialProjectFilesState();private listeners=new Set<(s:ProjectFilesState)=>void>();private grants=new Map<string,FileAuthority>();private jobs=new Set<Promise<unknown>>();private controllers=new Set<AbortController>();private closing=false;private busy=false
 constructor(deps:Dependencies){this.deps=deps}
 read():ProjectFilesState{return structuredClone(this.state)}
 subscribe(fn:(s:ProjectFilesState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private emit():void{this.state.sequence++;for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private preview(p:FilePreview):void{this.state.previews=[...this.state.previews.filter(v=>v.referenceId!==p.referenceId),p].slice(-32);this.trim();this.emit()}
 private result(r:FileResult):void{this.state.results=[...this.state.results.filter(v=>v.correlationId!==r.correlationId),r].slice(-32);this.emit()}
 private trim():void{const keep=new Set(this.state.previews.map(p=>p.referenceId));this.state.references=this.state.references.filter(r=>r.current||keep.has(r.id));for(const id of this.grants.keys())if(!this.state.references.some(r=>r.id===id&&r.current))this.grants.delete(id)}
 /** Call only after accepting the producer's original validated object. Clones carry no grant. */
 accept(original:object,producer:FileProducer):void{
  if(this.closing)return;const authority=this.deps.authority(original);if(!authority||authority.producer!==producer)return
  const value=original as Partial<FileAuthority>;if(value.projectId!==authority.projectId||value.rootPath!==authority.rootPath||value.rootIdentity!==authority.rootIdentity||value.revision!==authority.revision||value.observedAt!==authority.observedAt||(value.initiativeId??null)!==(authority.initiativeId??null)||!Array.isArray(value.sources)||!authority.sources.every(source=>value.sources!.some(v=>v.id===source.id&&v.path===source.path&&v.sha256===source.sha256&&v.bytes===source.bytes)))return
  const same=this.state.references.filter(r=>r.projectId===authority.projectId&&r.producer===producer&&r.current)
  if(same.length&&same.every(r=>r.revision===authority.revision&&r.rootIdentity===authority.rootIdentity&&r.initiativeId===(authority.initiativeId??null)))return
  this.invalidate(authority.projectId,producer)
  this.state.issues=this.state.issues.filter(i=>i.projectId!==authority.projectId||i.producer!==producer)
  if(authority.refusal||authority.sources.length>2048||this.state.references.filter(r=>r.current).length+authority.sources.length>4064){this.state.issues.push({projectId:authority.projectId,producer,revision:authority.revision,reason:authority.refusal??'Limite technique de la session de fichiers — aperçu indisponible pour cette observation. Les sources restent consultables dans leur fiche.'});this.state.issues=this.state.issues.slice(-3000);this.emit();return}
  for(const source of authority.sources){const r:ProjectFileReference={id:'ref-'+randomUUID(),producer,projectId:authority.projectId,rootPath:authority.rootPath,rootIdentity:authority.rootIdentity,initiativeId:authority.initiativeId??null,revision:authority.revision,sourceId:source.id,path:source.path,sha256:source.sha256,bytes:source.bytes,observedAt:authority.observedAt,current:true};this.state.references.push(r);this.grants.set(r.id,authority)}this.emit()
 }
 invalidate(projectId:string,producer?:FileProducer):void{let changed=false;for(const r of this.state.references)if(r.projectId===projectId&&(!producer||r.producer===producer)&&r.current){r.current=false;this.grants.delete(r.id);changed=true;const p=this.state.previews.find(p=>p.referenceId===r.id);if(p){p.status='stale';p.reason='Aperçu ancien — la source ou son contexte a changé.'}}if(changed){this.trim();this.emit()}}
 async execute(input:unknown):Promise<ProjectFilesState>{if(!isProjectFilesCommand(input)||input.type==='read'||this.closing)return this.read();const work=this.perform(input);this.jobs.add(work);try{await work;return this.read()}finally{this.jobs.delete(work)}}
 private async handoff(uri:string,signal:AbortSignal):Promise<void>{let timer:ReturnType<typeof setTimeout>|undefined;let abort:()=>void=()=>{};try{await Promise.race([this.deps.editor!(uri).catch(()=>{throw Object.assign(Error('EDITOR_FAILED'),{code:'EDITOR_FAILED'})}),new Promise<never>((_,reject)=>{abort=()=>reject(Error('EDITOR_UNKNOWN'));signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();timer=setTimeout(()=>reject(Error('EDITOR_UNKNOWN')),15000)})])}finally{clearTimeout(timer);signal.removeEventListener('abort',abort)}}
 private async perform(command:{correlationId:string;type:'preview'|'copy'|'editor';referenceId:string}):Promise<void>{
  const ref=this.state.references.find(r=>r.id===command.referenceId),authority=this.grants.get(command.referenceId),controller=new AbortController();let release:(()=>void)|undefined,effected=false
  const active=()=>!this.closing&&!controller.signal.aborted&&!!ref?.current&&this.grants.get(command.referenceId)===authority
  const assert=()=>{if(!active())throw Error('STALE')}
  const check=async()=>{assert();const project=await this.deps.application.dialogueProject(ref!.projectId);assert();if(canonical(project.rootPath)!==canonical(ref!.rootPath))throw Error('STALE')}
  const previous=this.state.previews.find(p=>p.referenceId===command.referenceId)
  if(this.busy){if(command.type==='preview'&&ref)this.preview({referenceId:ref.id,status:previous?.text!==null&&previous?.text!==undefined?'stale':'refused',text:previous?.text??null,reason:reasons.BUSY});else if(command.type!=='preview')this.result({correlationId:command.correlationId,referenceId:command.referenceId,action:command.type,status:'failed',reason:reasons.BUSY});return}
  this.busy=true;this.controllers.add(controller)
  if(command.type==='preview'&&ref)this.preview({referenceId:ref.id,status:'reading',text:previous?.text??null,reason:null})
  if(command.type!=='preview')this.result({correlationId:command.correlationId,referenceId:command.referenceId,action:command.type,status:'pending',reason:null})
  try{
   await check();if(!authority||!ref)throw Error('STALE')
   if(command.type!=='preview')await check()
   const result=command.type==='preview'?await authority.read(ref.sourceId,controller.signal):await authority.verify(ref.sourceId,controller.signal)
   if(command.type==='preview')await check();else assert()
   if(result.path!==ref.path||result.sha256!==ref.sha256||result.bytes!==ref.bytes)throw Error('STALE')
   if(command.type==='preview'){if(!('text' in result)||typeof result.text!=='string'||Buffer.byteLength(result.text,'utf8')!==ref.bytes)throw Error('PREVIEW_UTF8');this.preview({referenceId:ref.id,status:'ready',text:result.text,reason:null});return}
   release=this.deps.admission.enter('helper');assert()
   if(command.type==='copy'){
    await this.deps.clipboard.writeText(result.path);effected=true;assert();const copied=await this.deps.clipboard.readText();assert();release();release=undefined
    await check();await authority.verify(ref.sourceId,controller.signal);assert()
    this.result({correlationId:command.correlationId,referenceId:ref.id,action:'copy',status:copied===result.path?'copied':'failed',reason:copied===result.path?'Chemin copié.':'Copie impossible — sélectionnez le texte.'})
   }else{
    if(!this.deps.editor){this.result({correlationId:command.correlationId,referenceId:ref.id,action:'editor',status:'unavailable',reason:'Éditeur indisponible — vous pouvez copier le chemin.'});return}
    const uri=vscodeFileUri(result.path);assert();effected=true
    await this.handoff(uri,controller.signal);assert();release();release=undefined
    await check();await authority.verify(ref.sourceId,controller.signal);assert()
    this.result({correlationId:command.correlationId,referenceId:ref.id,action:'editor',status:'transmitted',reason:'Demande transmise à l’éditeur. Ouverture non confirmée.'})
   }
  }catch(e){const code=String((e as {code?:string;message?:string}).code??(e as Error).message),cause=reasons[code]??(code==='STALE'?'Référence ancienne ou non vérifiée — relisez les preuves.':command.type==='editor'?effected?'La vérification finale de la demande n’a pas abouti.':'Demande d’ouverture échouée — vous pouvez copier le chemin.':'Lecture ou accès refusé — la source doit être examinée de nouveau.'),reason=effected&&command.type==='editor'&&code!=='EDITOR_FAILED'&&code!=='STALE'?reasons.EDITOR_UNKNOWN+(code==='EDITOR_UNKNOWN'?'':' '+cause):cause
   if(!this.closing){if(ref&&['PROFILE_CHANGED','RESOLVER_FAILED'].includes(code)){ref.current=false;this.grants.delete(ref.id)}if(ref&&command.type==='preview')this.preview({referenceId:ref.id,status:previous?.text!==null&&previous?.text!==undefined?'stale':'refused',text:previous?.text??null,reason});else if(command.type!=='preview')this.result({correlationId:command.correlationId,referenceId:command.referenceId,action:command.type,status:code==='STALE'?'stale':effected&&(command.type==='copy'||code!=='EDITOR_FAILED')?'unknown':'failed',reason:effected&&command.type==='copy'&&code!=='STALE'?'Chemin écrit au presse-papiers ; vérification finale non confirmée. '+reason:reason})}
  }finally{release?.();this.controllers.delete(controller);this.busy=false}
 }
 async shutdown():Promise<void>{this.closing=true;for(const r of this.state.references)r.current=false;this.grants.clear();for(const result of this.state.results)if(result.status==='pending'){result.status='unknown';result.reason='Demande détachée pendant la fermeture — ouverture non confirmée.'}for(const preview of this.state.previews)if(preview.status==='reading'){preview.status='stale';preview.reason='Lecture interrompue pendant la fermeture.'}this.emit();for(const controller of this.controllers)controller.abort();await Promise.allSettled([...this.jobs]);this.listeners.clear()}
}
