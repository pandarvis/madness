import {useEffect,useId,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import type {WorkOverviewState,OverviewTarget,ConversationOverview} from '../../core/work-overview.ts'
import {fr} from './strings.ts'

function Recap({value,onNavigate}:{value:ConversationOverview;onNavigate:(target:OverviewTarget)=>void}):ReactNode {
 const turn=value.turn,words=fr.overview
 const [open,setOpen]=useState(false)
 return <details className="turn-recap" data-recap-id={value.id} onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary><span>{words.recap} · {value.projectName} · {words.turnStates[turn?.phase??'historical']}</span><code className="recap-reference">{value.id}</code></summary>
  {open&&<div className="recap-body">
   <p>{turn?.phase==='completed'?words.completed:turn?words.turnUnfinished:words.historical}</p>
   <p className="small">{value.context.initiativeId??words.noInitiative} · {value.context.providerId??words.unknownProvider} · {words.connectionCaptured} <code>{value.context.connectionId??words.unknown}</code>{turn&&<> · {words.turn} <code>{turn.id}</code></>}</p>
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
   {value.workflow?<><p>{words.forgeOutcome} : {value.workflow.outcome==='open'?words.workflowOpen:value.workflow.outcome}. {words.noAcceptance}</p><p>{words.announcedScope} : <code>{value.workflow.workspace??value.workflow.outputBase}</code></p><ul>{value.workflow.observations.map((o,i)=><li key={i}><code>{o.path??words.noPath}</code> · {o.phase==='observed'?words.observedBytes:words.unconfirmedObservation} · {new Date(o.at).toLocaleString('fr-FR')}{o.sha256&&<><br/><code>SHA-256 {o.sha256}</code></>}</li>)}</ul><p className="small">{words.oldObservation}</p></>:<p>{words.noWorkflow}</p>}
   <p>{words.nextUnknown}</p>
   <button className="text-button" type="button" onClick={()=>onNavigate({kind:'conversation',id:value.id,context:value.context})}>{words.openConversation}</button>
  </div>}
 </details>
}

export function WorkOverview({overview,projectId,onNavigate,onConnection,compact=false,stopUnconfirmed=false}:{overview:WorkOverviewState;projectId:string|null;onNavigate:(target:OverviewTarget)=>void;onConnection:()=>void;compact?:boolean;stopUnconfirmed?:boolean}):ReactNode {
 const id=useId(),words=fr.overview
 const [announcement,setAnnouncement]=useState('')
 const previousWaits=useRef(new Map<string,{state:string;projectName:string|null;kind:string}>())
 const waits=overview.entries.filter(entry=>entry.target.kind==='question'||entry.target.kind==='approval')
 const waitSignature=JSON.stringify(waits.map(entry=>[entry.id,entry.state]))
 useEffect(()=>{
  const current=new Map(waits.map(entry=>[entry.id,{state:entry.state,projectName:entry.projectName,kind:entry.target.kind}]))
  const changes:string[]=[]
  for(const [key,entry] of previousWaits.current)if(!current.has(key))changes.push(words.waitClosed+' '+(entry.projectName??words.missingProject)+'.')
  for(const [key,entry] of current)if(previousWaits.current.get(key)?.state!==entry.state)changes.push((entry.state==='sending'?(entry.kind==='question'?words.answerSending:words.decisionSending):(entry.kind==='question'?words.questionArrived:words.approvalArrived))+' '+(entry.projectName??words.missingProject)+'.')
  previousWaits.current=current
  if(changes.length)setAnnouncement(changes.join(' '))
 },[waitSignature])
 const recaps=overview.conversations.filter(c=>projectId===null||c.context.projectId===projectId).slice().reverse()
 const scope=(entry:WorkOverviewState['entries'][number]):string=>compact&&projectId!==null&&entry.target.context.projectId===projectId?'ce projet':entry.projectName??words.globalScope
 function compactReason(entry:WorkOverviewState['entries'][number]):string{
  if(entry.target.kind==='session'&&entry.state==='recovery'&&stopUnconfirmed)return 'Arrêt Codex non confirmé · portée globale · nouveaux échanges bloqués'
  if(entry.state==='working')return 'Codex · '+fr.dialogueStatus[entry.activity!]+' · '+scope(entry)
  if(entry.target.kind==='question')return entry.state==='sending'?'Réponse en cours d’envoi · '+scope(entry):(entry.identity??fr.conversation.unknownAgent)+' attend votre réponse · '+scope(entry)
  if(entry.target.kind==='approval')return (entry.state==='sending'?'Décision en cours de transmission':'Opération à examiner')+' · '+scope(entry)
  if(entry.target.kind==='recovery')return 'Effet incertain · inspection nécessaire · '+scope(entry)
  return (entry.error==='NETWORK_UNAVAILABLE'?'Accès réseau indisponible':'Erreur ou arrêt à examiner')+' · '+scope(entry)
 }
 return <section className={'work-overview'+(compact?' is-compact':'')} aria-labelledby={id+'-title'}>
  <h2 id={id+'-title'} className="overview-heading">{overview.entries.length?words.title:'Activité'}</h2>
  <p className="overview-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  {overview.entries.length===0?<p className="small">{compact?'Aucune demande active connue.':words.noWaiting}</p>:<ul className="overview-list">{overview.entries.map(entry=><li className="question-return" key={entry.id} data-overview-id={entry.id}>
   <div><p>{compact||entry.target.kind==='session'&&entry.state==='recovery'&&stopUnconfirmed?compactReason(entry):entry.state==='working'?<>Codex · {fr.dialogueStatus[entry.activity!]} · {entry.projectName??words.globalScope}</>:entry.target.kind==='question'?(entry.state==='sending'?<>Réponse à {entry.identity??fr.conversation.unknownAgent} dans {entry.projectName??words.missingProject}. {fr.questions.sending}</>:<>{entry.identity??fr.conversation.unknownAgent} attend votre réponse dans {entry.projectName??words.missingProject}.</>):entry.target.kind==='approval'?(entry.state==='sending'?fr.approvals.status.sending:words.approvalWaiting+' '+entry.projectName+'.'):entry.target.kind==='recovery'?words.uncertainEffect+' · '+entry.projectName:entry.projectName?words.sessionRecovery+' · '+entry.projectName:words.globalRecovery}</p>{!compact&&entry.prompt&&<p className="small">{entry.prompt}</p>}{!compact&&entry.target.context.conversationId&&<p className="small">{words.conversation} <code>{entry.target.context.conversationId}</code></p>}</div>
   <button className="text-button" type="button" onClick={()=>onNavigate(entry.target)}>{entry.state==='working'?words.openActivity:entry.target.kind==='question'?'Retrouver la question':entry.target.kind==='approval'?'Retrouver l’opération':words.openRecovery}</button>
  </li>)}</ul>}
  <details className="overview-details"><summary>Connexion et récapitulatifs{recaps.length>0?' ('+recaps.length+')':''}</summary>
   {compact&&overview.entries.length>0&&<dl className="overview-destinations">{overview.entries.map(entry=><div key={entry.id}><dt>{entry.projectName??words.globalScope}</dt><dd>{entry.target.context.conversationId&&<code>{entry.target.context.conversationId}</code>}{entry.prompt&&<p>{entry.prompt}</p>}</dd></div>)}</dl>}
   <div className="overview-connection"><p className="small">{words.connection} : {fr.connectionStatus[overview.connection.status]}. {overview.connection.verifiedAt?words.verifiedAt+' '+new Date(overview.connection.verifiedAt).toLocaleString('fr-FR')+'.':words.noVerification} {words.localRead}</p><button className="text-button" type="button" onClick={onConnection}>{words.connectionPanel}</button></div>
   {recaps.length>0&&<div className="overview-recaps">{recaps.map(value=><Recap key={value.id} value={value} onNavigate={onNavigate}/>)}</div>}
  </details>
 </section>
}
