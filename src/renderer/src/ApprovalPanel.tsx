import {useLocale,useLocalText} from './Locale.tsx'
import type {ReactNode} from 'react'
import type {ApprovalRecord,ApprovalDecision} from '../../contracts/approvals.ts'
import {MAX_DRAFT_LENGTH} from '../../contracts/index.ts'
import {fr,metricsLabels} from './strings.ts'
export function ApprovalPanel({approval,adjustment,projectName,onChange,onDecide,onSendAdjustment,canAdjust=false,bridgeFailed=false,respondable=true,compactContext=false,metricChoice,sendPending=false}:{approval:ApprovalRecord;adjustment:string;projectName:string;onChange:(text:string)=>void;onDecide:(decision:ApprovalDecision)=>void;onSendAdjustment:()=>void;canAdjust?:boolean;bridgeFailed?:boolean;respondable?:boolean;compactContext?:boolean;metricChoice?:ReactNode;sendPending?:boolean}):ReactNode{
 const {words:fr,ui,locale,language}=useLocale()

 const active=approval.status==='waiting'&&respondable,editable=active||approval.status==='decided',id=approval.id
 const identity=approval.identity.kind==='attested'?approval.identity.name:fr.conversation.unknownAgent
 const effect=fr.approvals.effects[approval.effect],status=approval.status==='waiting'&&!respondable?fr.overview.targetGone:fr.approvals.status[approval.status]
 return <section className="approval-panel" data-approval-id={id} aria-labelledby={id+'-title'}>
  <h2 id={id+'-title'} tabIndex={-1}>{active?fr.approvals.title:fr.approvals.history}</h2>
  <h3 className="approval-recipient">{identity} · Codex</h3>
  <p className="small">{compactContext?<span title={projectName}>{ui.this_project}</span>:projectName} {ui.captured_initiative} {approval.context.initiativeId??ui.no_identified_initiative} {ui.captured_file_mode}</p>
  <p role="status" className="approval-status">{status}{approval.status==='decided'?' '+effect:''}{approval.reason==='expired'?ui.the_local_ten_minute_time_limit_was_exceeded:approval.reason==='reopened'?ui.inactive_history_no_engine_or_approval_restarted:''}</p>
  <p>{fr.approvals.scope}</p>
  {active&&<p className="small">{ui.local_deadline} {new Date(approval.expiresAt).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'})}{ui.at_the_deadline_the_turn_stops_without_transmitting_a_choice}</p>}
  <div className="approval-files">{approval.files.map(file=><section className="approval-file" key={file.path} aria-label={fr.approvals.kinds[file.kind]+' '+file.path}>
   <h3>{fr.approvals.kinds[file.kind]} <code>{file.path}</code></h3>
   <p className="small muted">{file.kind==='update'?ui.full_native_unified_diff:ui.full_native_content}</p>
   <pre tabIndex={0} aria-label={ui.proposal+file.path}>{file.diff||ui.empty_file}</pre>
  </section>)}</div>
  {approval.decision&&<p className="small">{ui.retained_choice} {approval.decision==='accept'?ui.allow_this_patch_once:ui.reject_this_patch}. {approval.transmission==='sent'?ui.transmission_saved:approval.transmission==='pending'?ui.transmission_pending:ui.transmission_unknown}</p>}
  <div className="approval-adjustment"><label htmlFor={id+'-adjustment'}>{ui.requested_adjustment}</label><textarea id={id+'-adjustment'} rows={3} maxLength={MAX_DRAFT_LENGTH} value={adjustment} readOnly={sendPending||!editable||approval.adjustmentStatus!=='draft'} aria-describedby={id+'-adjustment-help'} onChange={event=>onChange(event.target.value)}/><p className="small muted" id={id+'-adjustment-help'}>{fr.approvals.adjustment}</p></div>
  {sendPending&&<p role="status">{metricsLabels[language].adjustmentPending}</p>}
  <p className="small" role={bridgeFailed?'alert':undefined}>{bridgeFailed?ui.bridge_or_persistence_failed_your_input_remains_here_retry_saving:approval.storage==='stored'?ui.request_and_input_saved:ui.persistence_not_confirmed}</p>
  {bridgeFailed&&editable&&<button type="button" className="text-button" onClick={()=>onChange(adjustment)}>{ui.retry_saving_adjustment}</button>}
  {active&&<div className="approval-actions"><button type="button" className="secondary" disabled={sendPending||bridgeFailed||approval.storage!=='stored'} onClick={()=>onDecide('decline')}>{ui.reject_entire_patch}</button><button type="button" className="primary" disabled={sendPending||bridgeFailed||approval.storage!=='stored'} onClick={()=>onDecide('accept')}>{ui.allow_entire_patch_once}</button></div>}
  {approval.decision==='decline'&&approval.effect==='declined'&&approval.adjustmentStatus==='draft'&&editable&&<>{metricChoice}<button type="button" className="secondary" disabled={sendPending||!canAdjust||!adjustment.trim()||bridgeFailed} onClick={onSendAdjustment}>{ui.send_this_adjustment_to_mary}</button></>}
  {approval.adjustmentStatus!=='draft'&&<p className="small" role="status">{approval.adjustmentStatus==='sent'?ui.adjustment_sent_in_a_new_turn:approval.adjustmentStatus==='sending'?ui.new_adjustment_turn_in_progress:ui.adjustment_send_unknown_no_automatic_resend}</p>}
  {approval.result&&<details className="approval-result"><summary>{ui.native_result_and_reread_effects}</summary><p className="small">{effect} {ui.no_rollback_is_assumed}</p><ul>{approval.result.files.map(file=><li key={file.path}><code>{file.path}</code> : {file.matches?ui.expected_bytes_existence_reread:ui.different_or_unknown_effect} · <code>{file.sha256??ui.absent}</code></li>)}</ul><pre>{approval.result.raw}</pre></details>}
  {approval.identity.kind==='attested'&&<p className="small muted">{ui.attested_identity_source} <code>{approval.identity.source}</code></p>}
 </section>
}
