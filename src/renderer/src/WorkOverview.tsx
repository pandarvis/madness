import {formatNumber} from './locale-format.ts'
import {useLocale,useLocalText} from './Locale.tsx'
import {MetricsForConversation} from './UsMetrics.tsx'
import {useEffect,useId,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import type {WorkOverviewState,OverviewTarget,ConversationOverview} from '../../core/work-overview.ts'
import {fr} from './strings.ts'

export function Recap({value,onNavigate,idPrefix=''}:{idPrefix?:string;value:ConversationOverview;onNavigate:(target:OverviewTarget)=>void}):ReactNode {
 const {words:fr,locale}=useLocale()

 const turn=value.turn,words=fr.overview
 const [open,setOpen]=useState(false)
 return <details className="turn-recap" data-recap-id={idPrefix+value.id} onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary><span>{words.recap} · {value.projectName} · {words.turnStates[turn?.phase??'historical']}</span><code className="recap-reference">{value.id}</code></summary>
  {open&&<div className="recap-body">
   <p>{turn?.phase==='completed'?words.completed:turn?words.turnUnfinished:words.historical}</p>
   <p className="small">{value.context.initiativeId??words.noInitiative} · {value.context.providerId??words.unknownProvider} · {words.connectionCaptured} <code>{value.context.connectionId??words.unknown}</code>{turn&&<> · {words.turn} <code>{turn.id}</code></>}</p>
   <MetricsForConversation context={value.context} turnId={turn?.id}/>
   <h3>{words.proposedResult}</h3>
   <p className="small">{words.noSynthesis}</p>
   {value.results.length?value.results.map(result=><details className="recap-text" key={result.id}><summary>{words.receivedText}{result.storage==='historical'?' · '+words.historicalText:result.storage!=='stored'?' · '+fr.conversation.notStored:''}</summary><div className="message-text">{result.text}</div></details>):<p>{words.noResult}</p>}
   <h3>{words.choices}</h3>
   {!value.questions.some(q=>q.status==='sent')&&!value.approvals.some(a=>a.decision)&&<p>{words.noChoice}</p>}
   {value.questions.filter(q=>q.status==='sent').map(q=><details key={q.id}><summary>{words.answerSent} · <code>{q.id}</code> · {words.turn} <code>{q.turnId}</code>{turn&&turn.id!==q.turnId?' · '+words.otherTurn:''}</summary>{q.fields.map(field=><p key={field.id}>{field.header} : <span className="message-text">{q.values[field.id]}</span></p>)}</details>)}
   {value.approvals.filter(a=>a.decision).map(a=><p key={a.id}><code>{a.id}</code> · {words.turn} <code>{a.turnId}</code>{turn&&turn.id!==a.turnId?' · '+words.otherTurn:''} · {a.decision==='accept'?words.acceptOnce:words.declineOnce} · {words.transmission} : {fr.overview.transmissions[a.transmission]} · {words.effect} : {fr.approvals.effects[a.effect]} {a.storage!=='stored'&&fr.conversation.notStored}</p>)}
   <p className="small">{words.noAcceptance}</p>
   <h3>{words.files}</h3>
   {value.approvals.length>0&&<details><summary>{words.announcedPatch}</summary><ul>{value.approvals.flatMap(a=>a.files.map(file=><li key={a.id+':'+file.path}><code>{file.path}</code> · {fr.approvals.kinds[file.kind]} · {words.announced} · {words.turn} <code>{a.turnId}</code></li>))}</ul></details>}
   {value.approvals.filter(a=>a.result).map(a=><details key={a.id}><summary>{words.patchObservation} · <code>{a.id}</code></summary><ul>{a.result!.files.map(file=><li key={file.path}><code>{file.path}</code> · {file.matches?words.observedBytes:words.unconfirmedObservation} · <code>{file.sha256??words.absent}</code></li>)}</ul><p className="small">{words.oldObservation}</p></details>)}
   {value.workflow?<><p>{words.forgeOutcome} : {value.workflow.outcome==='open'?words.workflowOpen:value.workflow.outcome}. {words.noAcceptance}</p><p>{words.announcedScope} : <code>{value.workflow.workspace??value.workflow.outputBase}</code></p><ul>{value.workflow.observations.map((o,i)=><li key={i}><code>{o.path??words.noPath}</code> · {o.phase==='observed'?words.observedBytes:words.unconfirmedObservation} · {new Date(o.at).toLocaleString(locale)}{o.sha256&&<><br/><code>SHA-256 {o.sha256}</code></>}</li>)}</ul><p className="small">{words.oldObservation}</p></>:<p>{words.noWorkflow}</p>}
   <p>{words.nextUnknown}</p>
   <button className="text-button" type="button" onClick={()=>onNavigate({kind:'conversation',id:value.id,context:value.context})}>{words.openConversation}</button>
  </div>}
 </details>
}

export function WorkOverview({overview,projectId,onNavigate,onConnection,compact=false,stopUnconfirmed=false}:{overview:WorkOverviewState;projectId:string|null;onNavigate:(target:OverviewTarget)=>void;onConnection:()=>void;compact?:boolean;stopUnconfirmed?:boolean}):ReactNode {
 const {words:fr,ui,locale,language}=useLocale()

 const id=useId(),words=fr.overview
 const [announcementEvents,setAnnouncementEvents]=useState<{closed:boolean;state:string;kind:string;projectName:string|null}[]>([])
 const announcement=announcementEvents.map(entry=>(entry.closed?words.waitClosed:entry.state==='sending'?(entry.kind==='question'?words.answerSending:words.decisionSending):(entry.kind==='question'?words.questionArrived:words.approvalArrived))+' '+(entry.projectName??words.missingProject)+'.').join(' ')
 const previousWaits=useRef(new Map<string,{state:string;projectName:string|null;kind:string}>())
 const waits=overview.entries.filter(entry=>entry.target.kind==='question'||entry.target.kind==='approval')
 const waitSignature=JSON.stringify(waits.map(entry=>[entry.id,entry.state]))
 useEffect(()=>{
  const current=new Map(waits.map(entry=>[entry.id,{state:entry.state,projectName:entry.projectName,kind:entry.target.kind}]))
  const changes:{closed:boolean;state:string;kind:string;projectName:string|null}[]=[]
  for(const [key,entry] of previousWaits.current)if(!current.has(key))changes.push({...entry,closed:true})
  for(const [key,entry] of current)if(previousWaits.current.get(key)?.state!==entry.state)changes.push({...entry,closed:false})
  previousWaits.current=current
  if(changes.length)setAnnouncementEvents(changes)
 },[waitSignature])
 const recaps=overview.conversations.filter(c=>projectId===null||c.context.projectId===projectId).slice().reverse()
 const providerName=(entry:WorkOverviewState['entries'][number]):string=>entry.target.context.providerId==='claude-code'?'Claude Code':'Codex'
 const scope=(entry:WorkOverviewState['entries'][number]):string=>compact&&projectId!==null&&entry.target.context.projectId===projectId?ui.this_project_2:entry.projectName??words.globalScope
 function compactReason(entry:WorkOverviewState['entries'][number]):string{
  if(entry.target.kind==='session'&&entry.state==='recovery'&&stopUnconfirmed)return entry.target.context.providerId==='claude-code'?ui.claude_stop_unconfirmed:ui.codex_stop_not_confirmed_global_scope_new_exchanges_blocked
  if(entry.state==='working')return providerName(entry)+' · '+fr.dialogueStatus[entry.activity!]+' · '+scope(entry)
  if(entry.target.kind==='question')return entry.state==='sending'?ui.sending_response_2+scope(entry):(entry.identity??fr.conversation.unknownAgent)+ui.needs_your_response+scope(entry)
  if(entry.target.kind==='approval')return (entry.state==='sending'?ui.transmitting_decision:ui.operation_to_inspect)+' · '+scope(entry)
  if(entry.target.kind==='recovery')return ui.uncertain_effect_inspection_needed+scope(entry)
  return (entry.error==='NETWORK_UNAVAILABLE'?ui.network_access_unavailable:ui.error_or_stop_to_inspect)+' · '+scope(entry)
 }
 return <section className={'work-overview'+(compact?' is-compact':'')} aria-labelledby={id+'-title'}>
  <h2 id={id+'-title'} className="overview-heading">{overview.entries.length?words.title:ui.activity}</h2>
  <p className="overview-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  {overview.entries.length===0?<p className="small">{compact?ui.no_known_active_request:words.noWaiting}</p>:<ul className="overview-list">{overview.entries.map(entry=><li className="question-return" key={entry.id} data-overview-id={entry.id}>
   <div><p>{compact||entry.target.kind==='session'&&entry.state==='recovery'&&stopUnconfirmed?compactReason(entry):entry.state==='working'?<>{providerName(entry)} · {fr.dialogueStatus[entry.activity!]} · {entry.projectName??words.globalScope}</>:entry.target.kind==='question'?(entry.state==='sending'?<>{ui.response_to} {entry.identity??fr.conversation.unknownAgent} {ui.in} {entry.projectName??words.missingProject}. {fr.questions.sending}</>:<>{entry.identity??fr.conversation.unknownAgent} {ui.needs_your_response_in} {entry.projectName??words.missingProject}.</>):entry.target.kind==='approval'?(entry.state==='sending'?fr.approvals.status.sending:words.approvalWaiting+' '+entry.projectName+'.'):entry.target.kind==='recovery'?words.uncertainEffect+' · '+entry.projectName:entry.projectName?words.sessionRecovery+' · '+entry.projectName:words.globalRecovery}</p>{!compact&&entry.prompt&&<p className="small">{entry.prompt}</p>}{!compact&&entry.target.context.conversationId&&<p className="small">{words.conversation} <code>{entry.target.context.conversationId}</code></p>}</div>
   <button className="text-button" type="button" onClick={()=>onNavigate(entry.target)}>{entry.state==='working'?words.openActivity:entry.target.kind==='question'?ui.open_question:entry.target.kind==='approval'?ui.open_operation:words.openRecovery}</button>
  </li>)}</ul>}
  <details className="overview-details"><summary>{ui.connection_and_recaps}{recaps.length>0?' ('+formatNumber(recaps.length,language)+')':''}</summary>
   {compact&&overview.entries.length>0&&<dl className="overview-destinations">{overview.entries.map(entry=><div key={entry.id}><dt>{entry.projectName??words.globalScope}</dt><dd>{entry.target.context.conversationId&&<code>{entry.target.context.conversationId}</code>}{entry.prompt&&<p>{entry.prompt}</p>}</dd></div>)}</dl>}
   <div className="overview-connection"><p className="small">{words.connection} : {fr.connectionStatus[overview.connection.status]}. {overview.connection.verifiedAt?words.verifiedAt+' '+new Date(overview.connection.verifiedAt).toLocaleString(locale)+'.':words.noVerification} {words.localRead}</p><button className="text-button" type="button" onClick={onConnection}>{words.connectionPanel}</button></div>
   {recaps.length>0&&<div className="overview-recaps">{recaps.map(value=><Recap key={value.id} value={value} onNavigate={onNavigate}/>)}</div>}
  </details>
 </section>
}
