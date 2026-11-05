import {isTurnReceipt,isMetricsArchive,isUsMetricsCommand,initialUsMetricsState} from '../contracts/us-metrics.ts'
import type {TurnReceipt,StoryOccurrence,StorySource,MetricTurn,MetricsArchive,MetricsSummary,MetricsProject,UsMetricsState,MetricOperation,MetricObservation,StoryCandidate} from '../contracts/us-metrics.ts'
import type {BmadProgressSnapshot} from '../contracts/bmad-progress.ts'
import type {ContextRef} from '../contracts/index.ts'
import {dialogueFailure} from '../contracts/dialogue.ts'
export type StoryEvidence={schemaVersion:1;revision:string;rows:{sourceId:string;container:string;ticketId:string|null;kind:string;type:string|null;line:number;typeLine:number|null;identity:string}[]}
/** Only the adapter's original WeakMap object may provide this capability. */
export type StoryAuthority={evidence:StoryEvidence;verify(sourceId:string,signal:AbortSignal):Promise<void>}
export interface UsMetricsPort{read(id:string):Promise<MetricsArchive|null>;write(body:MetricsArchive):Promise<void>}
export type TurnInstrumentation={assertFresh():Promise<void>;receive(receipt:TurnReceipt):void}
const canonical=(v:unknown):string=>JSON.stringify(v,(_k,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value)
const unique=<T>(values:T[]):T[]=>[...new Map(values.map(v=>[canonical(v),v])).entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v)
const nativeKey=(t:MetricTurn,r:TurnReceipt)=>canonical([t.context.conversationId,t.context.providerId,t.context.connectionId,r.runId,r.sessionId,r.threadId,r.nativeTurnId])
type Normalized={records:MetricTurn[];story:StoryOccurrence|null;receipts:TurnReceipt[];conflicts:string[]}
/** Local aliases cannot create another native turn. Contradictions retain all originals. */
export function normalizeTurns(turns:MetricTurn[]):Normalized[]{
 const groups:{keys:Set<string>;records:MetricTurn[]}[]=[]
 for(const t of turns){const keys=new Set(t.receipts.filter(isTurnReceipt).map(r=>nativeKey(t,r)));if(!keys.size)keys.add(canonical(['local',t.context,t.id]));const hits=groups.filter(g=>[...keys].some(k=>g.keys.has(k))),records=[t,...hits.flatMap(g=>g.records)];for(const g of hits){groups.splice(groups.indexOf(g),1);for(const k of g.keys)keys.add(k)}groups.push({keys,records})}
 return groups.map(g=>{const records=unique(g.records),receipts=unique(records.flatMap(t=>t.receipts)),stories=unique(records.map(t=>t.story)),bindings=new Set(stories.map(s=>s?canonical([s.id,s.projectId,s.rootIdentity,s.initiativeId,s.initiativePath,s.container,s.ticketId]):'null')),conflicts:string[]=[]
  if(bindings.size>1)conflicts.push('attribution')
  if(new Set(records.map(t=>canonical(t.context))).size>1)conflicts.push('context')
  if(receipts.some(r=>!isTurnReceipt(r))||new Set(receipts.map(r=>canonical([r.runId,r.sessionId,r.threadId,r.nativeTurnId]))).size>1)conflicts.push('correlation')
  for(const phase of ['ack','terminal','close'])if(receipts.filter(r=>r.phase===phase).length>1)conflicts.push('receipt:'+phase)
  return {records,story:bindings.size===1?stories[0]:null,receipts,conflicts}
 }).sort((a,b)=>canonical(a).localeCompare(canonical(b)))
}
function interval(t:Normalized):{start:TurnReceipt;end:TurnReceipt;ms:number}|null{if(t.conflicts.length)return null;const a=t.receipts.find(r=>r.phase==='ack'),b=t.receipts.find(r=>r.phase==='terminal')??t.receipts.find(r=>r.phase==='close');return a&&b&&a.domain===b.domain&&b.at>=a.at&&Number.isFinite(b.at-a.at)?{start:a,end:b,ms:b.at-a.at}:null}
export function summarizeTurns(turns:MetricTurn[],storyId?:string,conversationId?:string):MetricsSummary{
 const all=normalizeTurns(turns),selected=all.filter(t=>(storyId===undefined||t.story?.id===storyId)&&(conversationId===undefined||t.records.every(r=>r.context.conversationId===conversationId))),intervals=selected.map(interval),known=intervals.filter(v=>v!==null),unknown=selected.length-known.length
 let overlap:MetricsSummary['overlap']=unknown?'unknown':'none'
 for(let i=0;i<known.length;i++)for(let j=i+1;j<known.length;j++){if(known[i].start.domain!==known[j].start.domain){if(overlap!=='known')overlap='unknown'}else if(Math.max(known[i].start.at,known[j].start.at)<Math.min(known[i].end.at,known[j].end.at))overlap='known'}
 const sum=known.reduce((n,v)=>n+v.ms,0)
 return {identified:selected.length,known:known.length,unknown,knownMs:known.length&&Number.isFinite(sum)?sum:null,coverage:!selected.length?'none':!known.length?'unavailable':unknown?'partial':'complete',overlap,nativeDuration:'unavailable',usage:'unavailable',cost:'unavailable'}
}
type Dependencies={store:UsMetricsPort;newId?():string;assertStory?(story:StoryOccurrence,signal:AbortSignal):Promise<void>}
type Choice={projectId:string;conversationId:string|null;requestId:string;text:string|null;operation:MetricOperation;story:StoryOccurrence|null;authority:StoryAuthority|null}
export class UsMetricsCoordinator{
 private state=initialUsMetricsState();private listeners=new Set<(s:UsMetricsState)=>void>();private restorations=new Map<string,Promise<void>>();private writes:Promise<unknown>=Promise.resolve();private authorities=new Map<string,StoryAuthority>();private choices=new Map<string,Choice>();private closing=false;private durable=new Map<string,MetricsArchive>();private deps:Dependencies
 constructor(deps:Dependencies){this.deps=deps}
 private id(prefix:string):string{return prefix+(this.deps.newId?.()??crypto.randomUUID())}
 read():UsMetricsState{const result=structuredClone(this.state);for(const p of result.projects){
  p.summary=summarizeTurns(p.archive.turns);p.stories=p.archive.occurrences.map(o=>({storyRef:o.id,summary:summarizeTurns(p.archive.turns,o.id)}));p.conversations=[...new Set(p.archive.turns.map(t=>t.context.conversationId!))].map(conversationId=>({conversationId,summary:summarizeTurns(p.archive.turns,undefined,conversationId)}))
  const saved=this.durable.get(p.projectId)
  p.observations=normalizeTurns(p.archive.turns).map(t=>{const value=interval(t),a=t.receipts.find(r=>r.phase==='ack'),b=t.receipts.find(r=>r.phase==='terminal')??t.receipts.find(r=>r.phase==='close');return {localIds:[...new Set(t.records.map(r=>r.localTurnId))].sort(),context:structuredClone(t.records[0].context),storyRef:t.story?.id??null,durationMs:value?.ms??null,reason:value?'known':t.conflicts.length?'conflicting':!a?'missing-ack':!b?'missing-end':a.domain!==b.domain?'clock-domain':'invalid-order',outcomes:[...new Set(t.receipts.flatMap(r=>r.phase==='terminal'&&r.outcome?[r.outcome]:[]))].sort(),durable:!!saved&&t.records.every(r=>saved.turns.some(s=>canonical(s)===canonical(r))) } satisfies MetricObservation})
  for(const c of p.candidates)if(c.storyRef&&!this.authorities.has(c.storyRef))c.reason='historical'
 }return result}
 subscribe(fn:(s:UsMetricsState)=>void):()=>void{this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 private emit():void{this.state.sequence++;for(const fn of this.listeners)try{fn(this.read())}catch{}}
 private project(id:string):MetricsProject{const p=this.state.projects.find(p=>p.projectId===id);if(!p)throw dialogueFailure('PROJECT_NOT_FOUND');return p}
 private async restore(id:string):Promise<void>{let job=this.restorations.get(id);if(!job){job=(async()=>{try{const archive=await this.deps.store.read(id)??{schemaVersion:1,projectId:id,revision:0,occurrences:[],turns:[]};if(!isMetricsArchive(archive))throw Error();this.durable.set(id,structuredClone(archive));this.state.projects.push({projectId:id,archive,durableRevision:archive.revision,storage:archive.revision?'stored':'unset',error:null,summary:summarizeTurns([]),observations:[],stories:[],conversations:[],candidates:[],unobservedActivity:'unknown'})}catch{this.state.projects.push({projectId:id,archive:{schemaVersion:1,projectId:id,revision:0,occurrences:[],turns:[]},durableRevision:0,storage:'unreadable',error:'STORAGE_READ_FAILED',summary:summarizeTurns([]),observations:[],stories:[],conversations:[],candidates:[],unobservedActivity:'unknown'})}this.emit()})();this.restorations.set(id,job)}await job}
 private save(id:string):Promise<void>{const p=this.project(id);if(p.storage==='unreadable')return Promise.reject(dialogueFailure('STORAGE_READ_FAILED'));const candidate=structuredClone(p.archive);p.storage='pending';this.emit();const result=this.writes.then(async()=>{try{await this.deps.store.write(candidate);this.durable.set(id,structuredClone(candidate));p.durableRevision=candidate.revision;if(p.archive.revision===candidate.revision){p.storage='stored';p.error=null}}catch(e){if(p.archive.revision===candidate.revision){p.storage='failed';p.error=String((e as {code?:string}).code??'STORAGE_WRITE_FAILED')}throw e}finally{this.emit()}});this.writes=result.catch(()=>{});return result}
 private changed(id:string):void{const p=this.project(id);p.archive.revision++;if(p.storage==='unreadable'){this.emit();return}void this.save(id).catch(()=>{})}
 async accept(snapshot:BmadProgressSnapshot,authority:StoryAuthority|undefined):Promise<void>{
  if(this.closing)return;await this.restore(snapshot.projectId);const p=this.project(snapshot.projectId);if(p.storage==='unreadable')return
  // Missing v1 authority is visible history, never proof of absence or type.
  p.candidates=p.candidates.filter(c=>c.initiativeId!==snapshot.initiativeId)
  const rawGroups=new Map<string,typeof snapshot.declarations>();for(const d of snapshot.declarations.filter(d=>d.field==='existence'&&['entry','leaf'].includes(d.value))){const key=canonical([d.container,d.ticketId]);rawGroups.set(key,[...rawGroups.get(key)??[],d])}
  const candidates:StoryCandidate[]=[...rawGroups.values()].map(g=>({initiativeId:snapshot.initiativeId,container:g[0].container,ticketId:g[0].ticketId,title:g[0].title||g[0].ticketId||'Unknown',storyRef:null,reason:new Set(g.map(d=>d.value)).size<g.length?'ambiguous':'type-unqualified'}));p.candidates.push(...candidates)
  if(snapshot.coverage!=='complete'||!authority||authority.evidence.schemaVersion!==1||authority.evidence.revision!==snapshot.revision){
   // Incomplete reads cannot exclude an unread conflicting declaration.
   // Revoke current capabilities without inventing a disappearance or changing history.
   const ids=new Set(p.archive.occurrences.filter(o=>o.initiativeId===snapshot.initiativeId).map(o=>o.id))
   for(const id of ids)this.authorities.delete(id)
   for(const [ref,choice] of this.choices)if(choice.story&&ids.has(choice.story.id)){this.choices.delete(ref);if(this.state.choiceRef===ref){this.state.choiceRef=null;this.state.error='PROFILE_CHANGED'}}
   this.emit();return
  }
  const previous=structuredClone(p.archive),previousAuthorities=new Map(this.authorities),rows=authority.evidence.rows,qualified:StoryOccurrence[]=[]
  const groups=new Map<string,typeof rows>();for(const r of rows){if(!r.ticketId||r.ticketId.startsWith('@')||!['entry','leaf'].includes(r.kind))continue;const key=canonical([r.container,r.ticketId]);groups.set(key,[...groups.get(key)??[],r])}
  for(const group of groups.values()){
   if(group.some(r=>r.type!=='story'||!r.typeLine)||new Set(group.map(r=>r.kind)).size!==group.length)continue
   const sources:StorySource[]=[];let valid=true
   for(const r of group){const source=snapshot.sources.find(s=>s.id===r.sourceId);const declaration=snapshot.declarations.find(d=>d.sourceId===r.sourceId&&d.container===r.container&&d.ticketId===r.ticketId&&d.field==='existence'&&d.value===r.kind&&d.line===r.line);if(!source||!declaration){valid=false;break}sources.push({sourceId:r.sourceId,path:source.path,sha256:source.sha256,bytes:source.bytes,identity:r.identity,kind:r.kind as 'entry'|'leaf',line:r.line,typeLine:r.typeLine!,type:'story'})}
   if(!valid)continue
   const first=group[0],title=snapshot.declarations.find(d=>d.sourceId===first.sourceId&&d.ticketId===first.ticketId)?.title||first.ticketId!,scope=(o:StoryOccurrence)=>o.active&&o.rootIdentity===snapshot.rootIdentity&&o.rootPath===snapshot.rootPath&&o.initiativeId===snapshot.initiativeId&&o.initiativePath===snapshot.initiativePath&&o.container===first.container&&o.ticketId===first.ticketId
   const old=p.archive.occurrences.find(scope),continuous=old&&sources.some(s=>old.sources.some(a=>a.kind===s.kind&&a.path===s.path&&a.identity===s.identity))&&!sources.some(s=>old.sources.some(a=>a.kind===s.kind&&(a.path!==s.path||a.identity!==s.identity)))
   if(old&&!continuous)old.active=false
   const occurrence:StoryOccurrence={id:continuous?old!.id:this.id('us-'),projectId:snapshot.projectId,rootPath:snapshot.rootPath,rootIdentity:snapshot.rootIdentity,initiativeId:snapshot.initiativeId,initiativePath:snapshot.initiativePath,container:first.container,ticketId:first.ticketId!,title,contextRevision:snapshot.contextRevision,proofRevision:snapshot.revision,sources,active:true}
   qualified.push(occurrence)
   // Equivalent complete proof keeps its capability; a new admission gets a fresh
   // private identity even if the adapter supplies a previously revoked object.
   if(!old||canonical(old)!==canonical(occurrence)||!this.authorities.has(occurrence.id))this.authorities.set(occurrence.id,{evidence:authority.evidence,verify:(id,signal)=>authority.verify(id,signal)})
  }
  for(const old of p.archive.occurrences){const inScope=old.rootIdentity===snapshot.rootIdentity&&old.rootPath===snapshot.rootPath&&old.initiativeId===snapshot.initiativeId&&old.initiativePath===snapshot.initiativePath;if(inScope&&!qualified.some(q=>q.id===old.id)&&(snapshot.coverage==='complete'||rows.some(r=>r.container===old.container&&r.ticketId===old.ticketId))){old.active=false;this.authorities.delete(old.id)}}
  for(const q of qualified){const at=p.archive.occurrences.findIndex(o=>o.id===q.id);if(at<0)p.archive.occurrences.push(q);else p.archive.occurrences[at]=q}
  for(const c of candidates){const o=qualified.find(o=>o.container===c.container&&o.ticketId===c.ticketId);if(o){c.storyRef=o.id;c.reason='qualified'}}
  if(!isMetricsArchive(p.archive)){p.archive=previous;this.authorities=previousAuthorities;p.error='OUTPUT_REFUSED';p.storage='failed';this.emit();return}
  this.changed(snapshot.projectId)
 }
 async execute(input:unknown):Promise<UsMetricsState>{if(!isUsMetricsCommand(input))return {...this.read(),error:'INVALID_COMMAND'};if(this.closing)return {...this.read(),error:'APP_CLOSING'};await this.restore(input.projectId);this.state.choiceRef=null;this.state.error=null
  try{if(input.type==='retry-save')await this.save(input.projectId);if(input.type==='choose'){
   if(this.choices.size>=256)throw dialogueFailure('OUTPUT_REFUSED');const story=input.storyRef===null?null:this.project(input.projectId).archive.occurrences.find(o=>o.id===input.storyRef&&o.active)??null,authority=story?this.authorities.get(story.id)??null:null
   if(input.storyRef!==null&&(!story||!authority))throw dialogueFailure('PROFILE_CHANGED')
   for(const [ref,old] of this.choices)if(old.projectId===input.projectId&&old.conversationId===input.conversationId&&old.requestId===input.requestId)this.choices.delete(ref)
   const ref=this.id('choice-');this.choices.set(ref,{projectId:input.projectId,conversationId:input.conversationId,requestId:input.requestId,text:input.text,operation:structuredClone(input.operation),story:structuredClone(story),authority});this.state.choiceRef=ref
  }}catch(e){this.state.error=String((e as {code?:string}).code??'STORAGE_WRITE_FAILED')}this.emit();return this.read()
 }
 async capture(context:ContextRef,requestId:string,localTurnId:string,text:string|null,choiceRef?:string,operation:MetricOperation=text===null?{type:'launch',mode:'read-only'}:{type:'send'},signal:AbortSignal=new AbortController().signal):Promise<TurnInstrumentation>{
  if(this.closing)throw dialogueFailure('APP_CLOSING');await this.restore(context.projectId!);const p=this.project(context.projectId!)
  const choice=choiceRef?this.choices.get(choiceRef):null;if(choiceRef){this.choices.delete(choiceRef);if(this.state.choiceRef===choiceRef)this.state.choiceRef=null}
  if(choiceRef&&(!choice||choice.projectId!==context.projectId||choice.conversationId!==null&&choice.conversationId!==context.conversationId||choice.requestId!==requestId||choice.text!==text||canonical(choice.operation)!==canonical(operation)||choice.story&&choice.story.initiativeId!==context.initiativeId))throw dialogueFailure('CONTEXT_MISMATCH')
  const story=choice?.story??null,authority=choice?.authority
  if(p.storage==='unreadable'&&story)throw dialogueFailure('STORAGE_READ_FAILED')
  const assertFresh=async():Promise<void>=>{signal.throwIfAborted();if(!story)return;const current=()=>p.archive.occurrences.find(o=>o.id===story.id),check=():void=>{signal.throwIfAborted();if(this.closing||!current()?.active||current()?.proofRevision!==story.proofRevision||!authority||this.authorities.get(story.id)!==authority)throw dialogueFailure('PROFILE_CHANGED')};check();await this.deps.assertStory?.(story,signal);check();await authority!.verify(story.sources[0].sourceId,signal);check()}
  await assertFresh()
  const record:MetricTurn={id:this.id('metric-'),context:structuredClone(context),requestId,localTurnId,story:structuredClone(story),receipts:[]};if(!isMetricsArchive({...p.archive,turns:[...p.archive.turns,record]})){if(choiceRef)throw dialogueFailure('OUTPUT_REFUSED');p.error='OUTPUT_REFUSED';this.emit();return {assertFresh:async()=>{},receive:()=>{}}}p.archive.turns.push(record);this.changed(context.projectId!)
  return {assertFresh,receive:r=>{if(!isTurnReceipt(r))return;if(record.receipts.some(v=>canonical(v)===canonical(r)))return;if(record.receipts.length>=64){p.error='OUTPUT_REFUSED';p.storage='failed';this.emit();return}const next=structuredClone(r);if(!isMetricsArchive({...p.archive,turns:p.archive.turns.map(t=>t.id===record.id?{...t,receipts:[...t.receipts,next]}:t)})){p.error='OUTPUT_REFUSED';p.storage='failed';this.emit();return}record.receipts.push(next);this.changed(context.projectId!)}}
 }
 async settled():Promise<void>{await Promise.all(this.restorations.values());await this.writes}
 async shutdown():Promise<void>{this.closing=true;this.choices.clear();await this.settled()}
}
