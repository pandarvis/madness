import {createContext,useCallback,useContext,useEffect,useId,useLayoutEffect,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import {initialUsMetricsState,isUsMetricsState} from '../../contracts/us-metrics.ts'
import type {MetricOperation,MetricObservation,MetricsProject,MetricsSummary,StoryOccurrence,UsMetricsState} from '../../contracts/us-metrics.ts'
import type {ContextRef} from '../../contracts/index.ts'
import {sameContext} from '../../core/work-overview.ts'
import {metricsLabels} from './strings.ts'
const words=metricsLabels.fr
export const MetricsContext=createContext<{state:UsMetricsState;error:string|null}>({state:initialUsMetricsState(),error:null})
export function useUsMetrics(projectId:string|undefined):{state:UsMetricsState;error:string|null;project:MetricsProject|undefined}{
 const [state,setState]=useState(initialUsMetricsState),[error,setError]=useState<string|null>(null),sequence=useRef(-1)
 const accept=useCallback((value:UsMetricsState):void=>{if(!isUsMetricsState(value))throw Error('INVALID_METRICS');if(value.sequence>=sequence.current){sequence.current=value.sequence;setState(value);setError(null)}},[])
 useEffect(()=>{if(!projectId)return;let live=true;const bridge=window.madnessUsMetrics;if(!bridge){setError(words.failed);return}
 const receive=(s:UsMetricsState):void=>{if(live)try{accept(s)}catch{setError(words.failed)}}
 const off=bridge.onChanged(receive);void bridge.read(projectId).then(receive).catch(()=>{if(live)setError(words.failed)});return()=>{live=false;off()}
 },[projectId,accept])
 return {state,error,project:state.projects.find(p=>p.projectId===projectId)}
}
// Only unit formatting; measurements, groups and sums are supplied by the core.
export const metricRawMs=(ms:number):string=>new Intl.NumberFormat(words.locale,{maximumSignificantDigits:21}).format(ms)+' '+words.ms
export const metricDuration=(ms:number):string=>{
 const number=(value:number):string=>new Intl.NumberFormat(words.locale,{maximumSignificantDigits:21}).format(value)
 if(ms<1000)return metricRawMs(ms)
 if(ms<60000)return number(ms/1000)+' '+words.seconds
 const minutes=Math.floor(ms/60000),remainder=ms%60000
 return number(minutes)+' '+words.minutes+(remainder?' '+number(remainder/1000)+' '+words.seconds:'')
}
function Summary({value}:{value:MetricsSummary}):ReactNode{return <div className="metric-summary"><p><strong>{words.total}</strong> · <span>{value.knownMs===null?words.unavailable:words.known+' : '+metricDuration(value.knownMs)}</span></p>{value.knownMs!==null&&<details className="metric-raw"><summary>{words.rawValue}</summary><p>{words.exactValue} : {metricRawMs(value.knownMs)}</p></details>}<p>{words.identified} : {value.identified} · {value.known} {value.known===1?words.knownTurn:words.knownTurns} · {value.unknown} {value.unknown===1?words.unknownTurn:words.unknownTurns} · {value.coverage==='partial'?words.partial:value.coverage==='complete'?words.complete:value.coverage==='none'?words.none:words.unavailable}</p><p>{value.overlap==='known'?words.overlap:value.overlap==='unknown'?words.unknownOverlap:words.noOverlap}</p><p>{words.usage}</p><p>{words.cost}</p><p>{words.native} : {words.unavailableValue}</p></div>}
function StoryHeader({story}:{story:StoryOccurrence}):ReactNode{return <><p>{words.story} {story.ticketId} · {story.title} · {words.occurrence} <code>{story.id}</code></p><p className="small">{story.projectId} · {words.initiative} {story.initiativeId}{!story.active?' · '+words.historical:''}</p></>}
function StoryFacts({story}:{story:StoryOccurrence}):ReactNode{return <><StoryHeader story={story}/><dl className="metric-facts"><dt>{words.projectRoot}</dt><dd>{story.projectId} · <code>{story.rootPath}</code><br/><code>{story.rootIdentity}</code></dd><dt>{words.initiative}</dt><dd>{story.initiativeId} · <code>{story.initiativePath}</code></dd><dt>{words.containerId}</dt><dd><code>{story.container}</code> · {story.ticketId}</dd><dt>{words.proofRevisions}</dt><dd>{words.contextRevision} <code>{story.contextRevision}</code><br/>{words.proofRevision} <code>{story.proofRevision}</code></dd></dl>{story.sources.map(source=><p className="small" key={source.sourceId}>{words.sourceStory} · {words[source.kind]} · <code>{source.path}</code> · {words.lines} {source.line}/{source.typeLine}<br/>SHA-256 <code>{source.sha256}</code> · {source.bytes} {words.bytes} · {words.physicalIdentity} <code>{source.identity}</code></p>)}</>}
const reasons={known:words.knownBounds,conflicting:words.conflict,'missing-ack':words.missingAck,'missing-end':words.missingEnd,'clock-domain':words.clockDomain,'invalid-order':words.invalidOrder}
function Observation({value,project}:{value:MetricObservation;project:MetricsProject}):ReactNode{
 const records=value.members?.recordIds.map(id=>project.archive.turns.find(t=>t.id===id)).filter(t=>t!==undefined),currentSource=project.archive.occurrences.find(o=>o.id===value.storyRef)
 return <details className="metric-observation"><summary>{words.details} · {value.localIds.join(', ')} · {value.durationMs===null?words.unknown:metricDuration(value.durationMs)}</summary><p>{words.local} · {value.durationMs===null?words.unknown+' : '+reasons[value.reason]:words.known+' : '+metricDuration(value.durationMs)}</p><p>{words.assignment} : {value.storyRef?words.occurrence+' '+value.storyRef:words.unassigned}{value.reason==='conflicting'?' · '+words.conflict:''}</p>{currentSource?.active===false&&<p>{words.historical}</p>}{value.durationMs!==null&&<p className="small">{words.exactValue} : {metricRawMs(value.durationMs)}</p>}<p>{words.context} : {value.context.projectId} · {value.context.initiativeId??words.noInitiative} · <code>{value.context.conversationId}</code> · {value.context.providerId} · <code>{value.context.connectionId}</code></p><p>{value.durable?words.stored:words.session}. {words.functionalOutcome} : {value.outcomes.map(o=>({completed:words.completed,failed:words.failedOutcome,interrupted:words.interrupted})[o]).join(', ')||words.unknownOutcome}. {words.noAcceptance}</p>{records?.length?records.map(record=><details key={record.id}><summary>{words.member} <code>{record.id}</code> · {words.localTurn} <code>{record.localTurnId}</code></summary><p>{words.request} <code>{record.requestId}</code> · {words.contextRevision} <code>{JSON.stringify(record.context)}</code></p>{record.story?<><StoryFacts story={record.story}/>{record.story.id!==value.storyRef&&project.archive.occurrences.find(o=>o.id===record.story!.id)?.active===false&&<p>{words.historical}</p>}</>:<p>{words.unassigned}</p>}{record.receipts.map((receipt,index)=><dl className="metric-facts" key={index}><dt>{words.bound} {words[receipt.phase]}</dt><dd>{receipt.at} {words.ms} · {words.monotonicDomain} <code>{receipt.domain}</code> · {receipt.outcome?({completed:words.completed,failed:words.failedOutcome,interrupted:words.interrupted})[receipt.outcome]:words.ack}</dd><dt>{words.correlatedIdentity}</dt><dd>{words.run} <code>{receipt.runId}</code> · {words.sessionId} <code>{receipt.sessionId}</code> · {words.thread} <code>{receipt.threadId}</code> · {words.nativeTurn} <code>{receipt.nativeTurnId}</code></dd><dt>{words.provenance}</dt><dd>{words.receiptVersion}{receipt.schemaVersion} · SHA-256 <code>{receipt.payloadDigest}</code></dd></dl>)}</details>):<p>{words.legacy}</p>}</details>
}
function Method():ReactNode{return <details className="metric-method"><summary>{words.definition}</summary><p>{words.methodBounds}</p><p>{words.methodScope}</p><p>{words.unit} : {words.methodSource}</p></details>}
function Storage({project}:{project:MetricsProject}):ReactNode{
 const [error,setError]=useState('')
 return <><p className="small">{words.annexVersion}{project.archive.schemaVersion} · {words.revision} {project.archive.revision} · {words.durableRevision} {project.durableRevision} · {project.storage==='stored'?words.savedAnnex:project.storage==='unreadable'?words.unreadableAnnex:words.session}</p>{project.error&&<p role="status">{words.storageUnconfirmed} · <code>{project.error}</code>. {words.sessionBounds}</p>}{project.storage==='failed'&&<button type="button" className="text-button" onClick={()=>{setError('');void window.madnessUsMetrics.retrySave(project.projectId).catch(()=>setError(words.retryFailed))}}>{words.retry}</button>}{error&&<p role="status">{error}</p>}</>
}
export function MetricsForConversation({context,turnId}:{context:ContextRef;turnId?:string}):ReactNode{
 const {state,error}=useContext(MetricsContext),project=state.projects.find(p=>p.projectId===context.projectId)
 if(!project)return <p className="small">{error??words.notLoaded} {words.cost}</p>
 const observations=project.observations.filter(o=>sameContext(o.context,context)),summary=project.observations.filter(o=>o.context.conversationId===context.conversationId).every(o=>sameContext(o.context,context))?project.conversations.find(c=>c.conversationId===context.conversationId)?.summary:undefined
 return <section className="metric-reading" aria-label={words.conversationMeasures}><p>{words.scope} : {words.conversation} <code>{context.conversationId}</code> · {words.initiative} {context.initiativeId??words.unknownInitiative}</p>{error&&<p role="status">{error} {words.cachedMeasures}</p>}{project.storage==='unreadable'&&<p>{words.unreadable}</p>}{summary&&<Summary value={summary}/>}<Storage project={project}/>{!observations.length&&project.storage!=='unreadable'&&<p>{words.history} · {words.none}. {words.cost}</p>}{observations.map((o,index)=><Observation key={o.members?.recordIds.join(':')??index} value={o} project={project}/>)}{turnId&&!observations.some(o=>o.localIds.includes(turnId))&&<p>{words.thisTurn} : {project.storage==='unreadable'?words.unreadable:words.history+' · '+words.unknown}.</p>}<Method/></section>
}
export function StoryMetrics({projectId,storyRef}:{projectId:string;storyRef:string}):ReactNode{
 const {state,error}=useContext(MetricsContext),project=state.projects.find(p=>p.projectId===projectId),story=project?.archive.occurrences.find(o=>o.id===storyRef),summary=project?.stories.find(s=>s.storyRef===storyRef)?.summary
 if(!project||!story||!summary)return <p>{error??words.failed}</p>
 return <div className="metric-reading"><StoryHeader story={story}/><p>{words.scope} : {words.storyScope}</p><Summary value={summary}/><Storage project={project}/><details className="metric-provenance"><summary>{words.proofDetails}</summary><StoryFacts story={story}/></details>{project.observations.filter(o=>o.storyRef===storyRef).map((o,index)=><Observation key={o.members?.recordIds.join(':')??index} value={o} project={project}/>)}<Method/></div>
}
type Selection={storyRef:string|null;scope:string;proof:string;error:string|null;invalidated:boolean}
const proof=(p:MetricsProject|undefined,ref:string|null):string=>{const o=p?.archive.occurrences.find(o=>o.id===ref),candidate=p?.candidates.find(c=>c.storyRef===ref);return o?.active&&candidate?.reason==='qualified'?JSON.stringify([o.id,o.projectId,o.rootPath,o.rootIdentity,o.initiativeId,o.initiativePath,o.container,o.ticketId,o.contextRevision,o.proofRevision,o.sources]):''}
export function useStoryChoices(project:MetricsProject|undefined,scope:string,eligibility:(key:string,o:StoryOccurrence)=>string|null):{slot:(key:string,disabled?:boolean)=>ReactNode;resolve:(key:string,projectId:string,conversationId:string|null,text:string|null,operation:MetricOperation,requestId?:string)=>Promise<{requestId:string;choiceRef:string}|null>;clear:(key:string)=>void}{
 const [selections,setSelections]=useState<Record<string,Selection>>({}),latest=useRef({project,scope,selections,eligibility});latest.current={project,scope,selections,eligibility}
 const clear=(key:string):void=>setSelections(s=>({...s,[key]:{storyRef:null,scope,proof:'',error:null,invalidated:false}}))
 const invalid=(key:string,s:Selection|undefined):boolean=>!!s?.storyRef&&(s.invalidated||s.scope!==scope||s.proof!==proof(project,s.storyRef)||!project?.archive.occurrences.some(o=>o.id===s.storyRef&&eligibility(key,o)===null))
 // Once an observed context/proof change revokes a selection it stays revoked,
 // even if the same bytes or navigation scope later return. Identical reads are inert.
 useLayoutEffect(()=>{setSelections(current=>{
  let changed=false;const next={...current}
  for(const [key,selection] of Object.entries(current))if(!selection.invalidated&&invalid(key,selection)){next[key]={...selection,invalidated:true};changed=true}
  return changed?next:current
 })})
 async function resolve(key:string,projectId:string,conversationId:string|null,text:string|null,operation:MetricOperation,requestId:string=crypto.randomUUID()):Promise<{requestId:string;choiceRef:string}|null>{
  const selected=selections[key];if(!selected?.storyRef)return null
  const fail=():never=>{setSelections(s=>s[key]===selected||s[key]?.invalidated?{...s,[key]:{...s[key],error:words.refused}}:s);throw Error('METRIC_CHOICE_REFUSED')}
  if(invalid(key,selected)||!window.madnessUsMetrics||typeof window.madnessDialogue[operation.type==='send'?'sendMeasured':operation.type==='send-adjustment'?'adjustMeasured':'launchMeasured']!=='function')return fail()
  try{const value=await window.madnessUsMetrics.choose(projectId,conversationId,requestId,selected.storyRef,text,operation),now=latest.current
   if(!isUsMetricsState(value)||value.error||!value.choiceRef||now.scope!==scope||proof(now.project,selected.storyRef)!==selected.proof||now.selections[key]!==selected||now.selections[key]?.invalidated||!now.project?.archive.occurrences.some(o=>o.id===selected.storyRef&&now.eligibility(key,o)===null))return fail()
   clear(key);return {requestId,choiceRef:value.choiceRef}
  }catch{return fail()}
 }
 function slot(key:string,disabled=false):ReactNode{
  const selected=selections[key],outdated=invalid(key,selected),ref=outdated?null:selected?.storyRef??null,story=project?.archive.occurrences.find(o=>o.id===ref)
  const change=(storyRef:string|null):void=>setSelections(s=>({...s,[key]:{storyRef,scope,proof:proof(project,storyRef),error:null,invalidated:false}}))
  return <MetricChoice key={key} choiceKey={key} project={project} story={story} value={ref} eligible={o=>eligibility(key,o)} disabled={disabled} error={selected?.error??(outdated?words.stale:null)} onChange={change} onClear={()=>clear(key)}/>
 }
 return {slot,resolve,clear}
}
function MetricChoice({choiceKey,project,story,value,eligible,disabled,error,onChange,onClear}:{choiceKey:string;project:MetricsProject|undefined;story:StoryOccurrence|undefined;value:string|null;eligible:(o:StoryOccurrence)=>string|null;disabled:boolean;error:string|null;onChange:(ref:string|null)=>void;onClear:()=>void}):ReactNode{
 const id=useId(),summary=useRef<HTMLElement>(null),bridgeError=useContext(MetricsContext).error,options=project?.candidates??[]
 return <details className="metric-choice" data-metric-choice={choiceKey}><summary ref={summary}>{words.choice} · {story?story.ticketId+' · '+story.title:words.unassigned}</summary><fieldset disabled={disabled}><legend>{words.choose}</legend><label><input type="radio" name={id} value="" checked={value===null} onChange={()=>onChange(null)}/>{words.unassigned}</label>{options.map((candidate,index)=>{const o=project?.archive.occurrences.find(o=>o.id===candidate.storyRef),allowed=candidate.reason==='qualified'&&!!o&&o.active&&eligible(o)===null;return <label key={index}><input type="radio" name={id} value={candidate.storyRef??'unqualified-'+index} disabled={!allowed} checked={allowed&&value===candidate.storyRef} onChange={()=>onChange(candidate.storyRef)}/><span>{candidate.ticketId??words.identifierUnknown} · {candidate.title} · {candidate.initiativeId}{allowed?' · '+words.occurrence+' '+o!.id:' · '+(candidate.reason==='ambiguous'?words.ambiguous:candidate.reason==='historical'?words.historical:candidate.reason==='qualified'&&o?(eligible(o)??words.sourceUnavailable):words.type)}</span></label>})}{!project&&bridgeError&&<p role="status">{bridgeError}</p>}{!options.some(c=>c.reason==='qualified')&&<p>{words.noType}. {words.qualifyGuidance}</p>}</fieldset>{story&&<details><summary>{words.contextDetails}</summary><StoryFacts story={story}/></details>}{error&&<p className="metric-choice-error" role="status">{error}</p>}{(value!==null||error)&&<button type="button" className="text-button" disabled={disabled} onClick={()=>{onClear();requestAnimationFrame(()=>summary.current?.focus({preventScroll:true}))}}>{error?words.continue:words.clear}</button>}</details>
}
