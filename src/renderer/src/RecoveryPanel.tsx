import {formatNumber,formatCount} from './locale-format.ts'
import {useLocale,useLocalText} from './Locale.tsx'
import {useId} from 'react'
import type {ReactNode} from 'react'
import type {DialogueState} from '../../contracts/dialogue.ts'
import {fr} from './strings.ts'
export function RecoveryPanel({state,projectId,busy,sessionPresent,onObserveStop,onInspect,onPrepare}:{state:DialogueState;projectId:string|null;busy:boolean;sessionPresent:boolean;onObserveStop:()=>void;onInspect:(approvalId:string)=>void;onPrepare:()=>void}):ReactNode{
 const {words:fr,ui,locale,language}=useLocale()

 const id=useId(),uncertain=state.approvals.filter(a=>a.context.projectId===projectId&&a.decision==='accept'&&(['unknown','pending'].includes(a.effect)||a.storage!=='stored')),blocked=state.recovery.stop==='unconfirmed'
 if(!blocked&&!uncertain.length)return null
 const needsInspection=uncertain.some(a=>{const o=state.recovery.observations.find(o=>o.approvalId===a.id);return !o||['mixed','diverged'].includes(o.outcome)})
 return <section className="recovery-panel" aria-labelledby={id+'-title'}>
  <h2 id={id+'-title'}>{fr.recovery.title}</h2>
  {blocked?<><p role="status">{fr.recovery.stopUnknown}</p><button className="secondary" type="button" onClick={onObserveStop} disabled={busy}>{fr.recovery.observeStop}</button></>:<p className="small">{fr.recovery.stopClear}</p>}
  {uncertain.map(a=>{const observation=state.recovery.observations.find(o=>o.approvalId===a.id);return <div className="recovery-operation" key={a.id}>
   <h3 id={'recovery-'+a.id} tabIndex={-1}>{fr.recovery.operation} · {formatCount(a.files.length,'file',language)}</h3><p className="small">{fr.recovery.nativeUnknown}</p>
   <button className="text-button" type="button" disabled={busy||sessionPresent||blocked||!state.recovery.capabilities.inspectFiles} onClick={()=>onInspect(a.id)}>{observation?fr.recovery.inspectAgain:fr.recovery.inspect}</button>
   {observation&&<div role="status" className="recovery-observation"><p>{fr.recovery.outcomes[observation.outcome]} · {new Date(observation.observedAt).toLocaleString(locale)}</p><details><summary>{fr.recovery.files}</summary><ul>{observation.files.map(f=><li key={f.path}><code>{f.path}</code><br/>{fr.recovery.positions[f.position]} · <code>{f.sha256??ui.absent}</code></li>)}</ul></details></div>}
  </div>})}
  <p className="small">{fr.recovery.newConversation}</p>
  {projectId&&!sessionPresent&&<button className="secondary" type="button" onClick={onPrepare} disabled={busy||blocked||needsInspection}>{fr.recovery.prepare}</button>}
 </section>
}
