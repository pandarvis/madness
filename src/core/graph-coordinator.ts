import {isGraphOwnedStopProof} from '../adapters/analysis/graph-owned-run.ts'
import type {GraphOwnedStopProof} from '../adapters/analysis/graph-owned-run.ts'
import {randomUUID} from 'node:crypto'
import {sameGraphScope,selectGraphRevalidationTarget,validateGraphCommand,initialGraphWorkspace,validateGraphState,validateGraphStopRequest} from '../contracts/bmad-graph.ts'
import type {GraphWorkspace,GraphState,GraphScope,ExpectedGraphContext,GraphAnalysisRequest,GraphAnalysisEvent} from '../contracts/bmad-graph.ts'
import {createGraphState,restoreGraphState,beginGraphAttempt,observeGraphSourceRevision,publishGraphEvent,requestGraphStop} from './bmad-graph.ts'
import type {GraphAnalysisPort} from './bmad-graph-port.ts'
import type {OriginalGraphCapture} from '../adapters/analysis/graph-corpus.ts'
type Runtime=GraphAnalysisPort&{scopeRevision:string;coverage:{included:string[];excluded:string[]};capture(id:string,root:string,signal:AbortSignal):Promise<OriginalGraphCapture>;facts(c:OriginalGraphCapture):{sourceState:'unchanged'|'changed'|'unknown';observedAt:string|null};shutdown():Promise<'stopped'|'unknown'>}
type Dependencies={application:{dialogueProject(id:string):Promise<{id:string;rootPath:string}>};runtime:Runtime;store:{list():Promise<GraphState[]>;write(s:GraphState):Promise<void>};files:{accept(original:object,producer:'corpus'):void;invalidate(id:string,producer:'corpus'):void};guard():Promise<'clear'|'busy'|'stop-unconfirmed'>;onUnknown?():void}
export async function graphAdmissionGuard(admission:{readonly activity:'blocked'|'busy'|'clear';block():void},recovery:{status():Promise<'stopped'|'unknown'>},operation:boolean):Promise<'clear'|'busy'|'stop-unconfirmed'>{if(admission.activity==='blocked')return 'stop-unconfirmed';if(admission.activity==='busy'||operation)return 'busy';if(await recovery.status()!=='stopped'){admission.block();return 'stop-unconfirmed'}return 'clear'}
const canonical=(v:string):string=>v.replaceAll(String.fromCharCode(92),'/').replace(/\/$/,'').toLowerCase()
function prerequisiteDiagnostic(error:unknown):string|null {
 const code=String(error)
 if(code.includes('GRAPH_POWERSHELL_REQUIRED'))return 'PowerShell 7.5.4 est requis pour le graphe. Vérifiez la version de l’outil .NET global puis réessayez.'
 if(code.includes('GRAPH_RESOURCE_CHANGED'))return 'Ressources Graphify manquantes ou modifiées. Réinstallez le paquet Madness identifié puis réessayez.'
 return null
}
export class GraphCoordinator{
 private deps:Dependencies;private state=initialGraphWorkspace();private listeners=new Set<(s:GraphWorkspace)=>void>();private active:{projectId:string;controller:AbortController;work:Promise<void>}|null=null;private loaded:Promise<void>|null=null;private closing=false;private saves=new Set<Promise<void>>()
 constructor(deps:Dependencies){this.deps=deps}
 read():GraphWorkspace{return structuredClone(this.state)}
 subscribe(fn:(s:GraphWorkspace)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private emit():void{this.state.sequence++;for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private put(s:GraphState):void{this.state.projects=[...this.state.projects.filter(p=>p.scope.projectId!==s.scope.projectId),s];this.emit()}
 private issue(projectId:string,reason:string):void{this.state.issues=[...this.state.issues.filter(i=>i.projectId!==projectId),{projectId,reason}];this.emit()}
 private load():Promise<void>{if(!this.loaded)this.loaded=(async()=>{try{for(const saved of await this.deps.store.list()){if(!validateGraphState(saved).ok)continue;let project;try{project=await this.deps.application.dialogueProject(saved.scope.projectId)}catch{continue}if(canonical(project.rootPath)!==canonical(saved.scope.rootPath))continue;const restored=restoreGraphState(saved,saved.scope);if(restored.ok)this.state.projects.push(restored.value)}}catch{this.issue('storage','Conservation du graphe illisible — aucune analyse relancée.')}if(this.state.projects.some(p=>p.activity.stop==='unknown'))this.deps.onUnknown?.();this.emit()})();return this.loaded}
 async execute(input:unknown):Promise<GraphWorkspace>{const parsed=validateGraphCommand(input);if(!parsed.ok||this.closing)return this.read();await this.load();if(this.closing)return this.read();const c=parsed.value;if(c.type==='read')return this.read();if(c.scopeId!=='code')return this.read()
  if((c.type==='generate'||c.type==='revalidate-files')&&this.state.projects.some(p=>p.activity.stop==='unknown')){
   this.issue(c.projectId,'Arrêt non confirmé — vérifiez l’arrêt dans la récupération commune.')
   return this.read()
  }
  if(c.type==='revalidate-files'){
   if(this.active)return this.read()
   const state=this.state.projects.find(p=>p.scope.projectId===c.projectId),snapshot=state?selectGraphRevalidationTarget(state):null
   if(!state||!snapshot)return this.read()
   const controller=new AbortController(),active={projectId:c.projectId,controller,work:Promise.resolve()}
   this.active=active;this.state.preparing=c.projectId;this.emit()
   active.work=(async()=>{
    let changedAt:string|null=null
    try{
     if(snapshot.identity.scopeRevision!==this.deps.runtime.scopeRevision)throw Error('REFERENCE_PROFILE_CHANGED')
     if(await this.deps.guard()!=='clear')throw Error('BUSY_OR_UNKNOWN')
     const project=await this.deps.application.dialogueProject(c.projectId)
     controller.signal.throwIfAborted()
     const original=await this.deps.runtime.capture(c.projectId,project.rootPath,controller.signal)
     const currentProject=await this.deps.application.dialogueProject(c.projectId)
     if(original.projectId!==c.projectId||canonical(currentProject.rootPath)!==canonical(project.rootPath)||canonical(currentProject.rootPath)!==canonical(original.rootPath))throw Error('PROJECT_CHANGED')
     controller.signal.throwIfAborted()
     if(original.rootIdentity!==snapshot.identity.rootIdentity||original.revision!==snapshot.identity.sourceRevision||JSON.stringify(original.corpus)!==JSON.stringify(snapshot.sources)){
      changedAt=original.observedAt
      throw Error('REFERENCE_CHANGED')
     }
     this.bind(original,snapshot.identity.analysisId)
     const wasChanged=state.freshness.status==='changed'
     state.freshness={status:state.result.snapshot?.identity.analysisId===snapshot.identity.analysisId?'observed':'unverified',sourceRevision:original.revision,observedAt:original.observedAt}
     this.state.issues=this.state.issues.filter(i=>i.projectId!==c.projectId)
     if(wasChanged)await this.save(state)
     else this.put(state)
    }catch(error){
     this.unbind(c.projectId)
     if(changedAt||state.freshness.status!=='changed'||state.freshness.sourceRevision!==snapshot.identity.sourceRevision){
      state.freshness={status:changedAt?'changed':'unverified',sourceRevision:snapshot.identity.sourceRevision,observedAt:changedAt}
     }
     if(changedAt)await this.save(state)
     else this.put(state)
     this.issue(c.projectId,prerequisiteDiagnostic(error)??'Référence ancienne ou non vérifiée — sources modifiées ou accès refusé.')
    }finally{if(this.active===active)this.active=null;this.state.preparing=null;this.emit()}
   })()
   await active.work
   return this.read()
  }
  if(c.type==='retry-save'){const s=this.state.projects.find(p=>p.scope.projectId===c.projectId);if(s&&!this.active&&!this.saves.size)await this.save(s);return this.read()}
  if(c.type==='interrupt'){const s=this.state.projects.find(p=>p.scope.projectId===c.projectId);if(c.analysisId==='preparing'&&this.active?.projectId===c.projectId&&this.state.preparing===c.projectId&&!['running','stop-requested'].includes(s?.activity.phase??'')){this.active.controller.abort();return this.read()}if(!s||this.active?.projectId!==c.projectId)return this.read();const next=requestGraphStop(s,c);if(!next.ok)return this.read();this.put(next.value);this.active.controller.abort();return this.read()}
  if(this.active){this.issue(c.projectId,'Une activité possède déjà les outils locaux. Réessayez après sa fin.');return this.read()}
  const controller=new AbortController(),active={projectId:c.projectId,controller,work:Promise.resolve()}
  this.active=active;this.state.preparing=c.projectId;this.emit()
  active.work=this.generate(c.projectId,c.correlationId,controller.signal).finally(()=>{if(this.active===active)this.active=null;this.state.preparing=null;this.emit()});await active.work;return this.read()
 }
 private async generate(id:string,correlationId:string,signal:AbortSignal):Promise<void>{let current:GraphState|undefined,expected:ExpectedGraphContext|undefined,original:OriginalGraphCapture|undefined
  try{
   const guard=await this.deps.guard();if(guard!=='clear')throw Error(guard==='busy'?'BUSY':'STOP_UNCONFIRMED')
   const project=await this.deps.application.dialogueProject(id);signal.throwIfAborted();original=await this.deps.runtime.capture(id,project.rootPath,signal);signal.throwIfAborted()
   const check=await this.deps.application.dialogueProject(id);if(original.projectId!==id||canonical(check.rootPath)!==canonical(original.rootPath))throw Error('PROJECT_CHANGED')
   const scope:GraphScope={projectId:id,rootPath:original.rootPath,rootIdentity:original.rootIdentity,scopeId:'code',scopeRevision:this.deps.runtime.scopeRevision}
   const previous=this.state.projects.find(p=>p.scope.projectId===id);const old=previous&&sameGraphScope(previous.scope,scope)?previous:createGraphState(scope)
   current='ok' in old?(old.ok?old.value:undefined):old;if(!current)throw Error('INVALID_SCOPE')
   expected={identity:{...scope,analysisId:'analysis-'+randomUUID(),sourceRevision:original.revision},generation:current.activity.generation+1,correlationId,lastEventOrder:0,corpus:original.corpus,coverage:this.deps.runtime.coverage,sourceState:'unchanged',observedAt:original.observedAt}
   const startGuard=await this.deps.guard()
   signal.throwIfAborted()
   const begun=beginGraphAttempt(current,expected,startGuard)
   if(!begun.ok){
    const comparable=previous&&previous.scope.scopeRevision===scope.scopeRevision&&canonical(previous.scope.rootPath)===canonical(scope.rootPath)?previous:current
    const observed=observeGraphSourceRevision(comparable,original.revision,original.observedAt)
    if(observed!==comparable){this.unbind(id);await this.save(observed)}
    throw Error(begun.issues[0].code)
   }
   current=begun.value;this.unbind(id);this.state.issues=this.state.issues.filter(i=>i.projectId!==id);this.put(current)
   const request:GraphAnalysisRequest={contractVersion:1,identity:expected.identity,generation:expected.generation,correlationId,corpus:expected.corpus,coverage:expected.coverage}
   let rejected=false
   const observe=(event:GraphAnalysisEvent):void=>{
    if(!current||!expected||!original||rejected)return
    const visible=this.state.projects.find(s=>s.scope.projectId===id)
    if(visible?.activity.phase==='stop-requested'&&visible.activity.analysisId===current.activity.analysisId)current=visible
    if(signal.aborted&&(event.type==='result'||event.type==='stopped'&&(event.reason==='complete'||event.reason==='partial')))return
    const facts=this.deps.runtime.facts(original);expected={...expected,...facts,lastEventOrder:current.lastEventOrder}
    const next=publishGraphEvent(current,event,expected);if(!next.ok){rejected=true;this.issue(id,'Résultat étranger ou incompatible refusé — dernier complet conservé.');return}
    current=next.value
    if(event.type==='stopped'&&event.stop==='confirmed'&&(event.reason==='complete'||event.reason==='partial')&&current.freshness.status==='observed')this.bind(original,expected.identity.analysisId)
    this.put(current)
   }
   try{await this.deps.runtime.analyze(request,observe,signal)}catch{/* Only an admitted terminal observation can establish stop. */}
   // A resolved Promise never proves termination. Missing/rejected terminal stays unknown.
   if(current.activity.phase==='running'||current.activity.phase==='stop-requested'){
    const event:GraphAnalysisEvent={contractVersion:1,identity:expected.identity,generation:expected.generation,correlationId,order:current.lastEventOrder+1,type:'stopped',reason:signal.aborted?'interrupted':'failed',stop:'unknown'}
    const next=publishGraphEvent(current,event,{...expected,lastEventOrder:current.lastEventOrder,sourceState:'unknown',observedAt:null});if(next.ok){current=next.value;this.put(current)}
   }
   if(current.activity.stop==='unknown'){
    this.deps.onUnknown?.()
    if(!rejected)this.issue(id,'Arrêt non confirmé — vérifiez l’arrêt dans la récupération commune.')
   }
   await this.save(current)
  }catch(e){
   const code=String(e)
   this.issue(id,prerequisiteDiagnostic(e)??(code.includes('STOP_UNCONFIRMED')?'Arrêt non confirmé — vérifiez l’arrêt dans la récupération commune.':code.includes('BUSY')?'Une activité possède déjà les outils locaux. Réessayez après sa fin.':signal.aborted?'Analyse interrompue avant publication.':'Analyse locale indisponible ou refusée : '+code.replace(/^Error: /,'').slice(0,400)))
  }
 }
 /** Host-only shared recovery. A physical stop receipt reconciles only its bound logical attempt. */
 async reconcileNativeStop(proof:GraphOwnedStopProof|null):Promise<boolean>{
  await this.load();await this.active?.work
  if(this.closing||this.saves.size)return false
  if(!this.state.projects.some(s=>s.activity.stop==='unknown'))return true
  if(!isGraphOwnedStopProof(proof)||!/^graph-[a-f0-9-]{36}$/.test(proof.nativeGeneration))return false
  const request=validateGraphStopRequest(proof.attempt);if(!request.ok)return false
  const p=request.value,s=this.state.projects.find(s=>s.scope.projectId===p.identity.projectId)
  if(!s||s.activity.stop!=='unknown'||s.activity.analysisId!==p.identity.analysisId||s.activity.sourceRevision!==p.identity.sourceRevision||s.activity.generation!==p.generation||s.activity.correlationId!==p.correlationId||!sameGraphScope(s.scope,p.identity))return false
  const candidate=structuredClone(s);candidate.activity={...candidate.activity,phase:'historical',stop:'confirmed'}
  const valid=validateGraphState(candidate);if(!valid.ok||!await this.save(valid.value,s))return false
  this.issue(s.scope.projectId,'Arrêt confirmé par la récupération commune. Aucun graphe relancé ; le résultat reste historique.')
  return !this.state.projects.some(state=>state.activity.stop==='unknown')
 }
 private unbind(projectId:string):void{
  this.deps.files.invalidate(projectId,'corpus')
  this.state.fileBindings=this.state.fileBindings.filter(b=>b.projectId!==projectId)
 }
 private bind(original:OriginalGraphCapture,analysisId:string):void{this.deps.files.accept(original,'corpus');this.state.fileBindings=this.state.fileBindings.filter(b=>b.projectId!==original.projectId);for(const source of original.corpus){const path=canonical(original.rootPath+'/'+source.relativePath),native=original.sources.find(s=>canonical(s.path)===path);if(native)this.state.fileBindings.push({projectId:original.projectId,rootIdentity:original.rootIdentity,analysisId,revision:original.revision,relativePath:source.relativePath,sourceId:native.id})}}
 private async save(s:GraphState,waiting=s):Promise<boolean>{
  const candidate=structuredClone(s)
  candidate.preservation={status:'stored',durableAnalysisId:candidate.lastComplete?.identity.analysisId??candidate.result.snapshot?.identity.analysisId??candidate.preservation.durableAnalysisId}
  waiting.preservation.status='pending'
  const work=Promise.resolve().then(()=>this.deps.store.write(candidate))
  this.saves.add(work)
  this.put(waiting)
  try{
   await work
   s.preservation=candidate.preservation
   this.put(s)
   return true
  }catch{
   waiting.preservation.status='failed'
   this.put(waiting)
   return false
  }finally{this.saves.delete(work)}
 }
 async shutdown():Promise<'stopped'|'unknown'>{this.closing=true;this.active?.controller.abort();await this.active?.work;await Promise.allSettled([...this.saves]);this.listeners.clear();return this.deps.runtime.shutdown()}
}
