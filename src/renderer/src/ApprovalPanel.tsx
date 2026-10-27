import type {ReactNode} from 'react'
import type {ApprovalRecord,ApprovalDecision} from '../../contracts/approvals.ts'
import {MAX_DRAFT_LENGTH} from '../../contracts/index.ts'
import {fr} from './strings.ts'
export function ApprovalPanel({approval,adjustment,projectName,onChange,onDecide,onSendAdjustment,canAdjust=false,bridgeFailed=false,respondable=true}:{approval:ApprovalRecord;adjustment:string;projectName:string;onChange:(text:string)=>void;onDecide:(decision:ApprovalDecision)=>void;onSendAdjustment:()=>void;canAdjust?:boolean;bridgeFailed?:boolean;respondable?:boolean}):ReactNode{
 const active=approval.status==='waiting'&&respondable,editable=active||approval.status==='decided',id=approval.id
 const identity=approval.identity.kind==='attested'?approval.identity.name:fr.conversation.unknownAgent
 const effect=fr.approvals.effects[approval.effect],status=approval.status==='waiting'&&!respondable?fr.overview.targetGone:fr.approvals.status[approval.status]
 return <section className="approval-panel" data-approval-id={id} aria-labelledby={id+'-title'}>
  <h2 id={id+'-title'} tabIndex={-1}>{active?fr.approvals.title:fr.approvals.history}</h2>
  <h3 className="approval-recipient">{identity} · Codex</h3>
  <p className="small">{projectName} · {approval.context.initiativeId??'sans initiative identifiée'} · mode fichiers capturé</p>
  <p role="status" className="approval-status">{status}{approval.status==='decided'?' '+effect:''}{approval.reason==='expired'?' Le délai local de dix minutes est dépassé.':approval.reason==='reopened'?' Historique inactif : aucun moteur ni accord relancé.':''}</p>
  <p>{fr.approvals.scope}</p>
  {active&&<p className="small">Échéance locale : {new Date(approval.expiresAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}. À l’échéance, le tour sera arrêté sans transmettre de choix.</p>}
  <div className="approval-files">{approval.files.map(file=><section className="approval-file" key={file.path} aria-label={fr.approvals.kinds[file.kind]+' '+file.path}>
   <h3>{fr.approvals.kinds[file.kind]} <code>{file.path}</code></h3>
   <p className="small muted">{file.kind==='update'?'Diff unifié natif intégral':'Contenu natif intégral'}</p>
   <pre tabIndex={0} aria-label={'Proposition '+file.path}>{file.diff||'Fichier vide'}</pre>
  </section>)}</div>
  {approval.decision&&<p className="small">Choix conservé : {approval.decision==='accept'?'autoriser ce patch une fois':'refuser ce patch'}. {approval.transmission==='sent'?'Transmission enregistrée.':approval.transmission==='pending'?'Transmission attendue.':'Transmission inconnue.'}</p>}
  <div className="approval-adjustment"><label htmlFor={id+'-adjustment'}>Ajustement demandé</label><textarea id={id+'-adjustment'} rows={3} maxLength={MAX_DRAFT_LENGTH} value={adjustment} readOnly={!editable||approval.adjustmentStatus!=='draft'} aria-describedby={id+'-adjustment-help'} onChange={event=>onChange(event.target.value)}/><p className="small muted" id={id+'-adjustment-help'}>{fr.approvals.adjustment}</p></div>
  <p className="small" role={bridgeFailed?'alert':undefined}>{bridgeFailed?'Le pont ou la conservation a échoué. Votre saisie reste ici ; réessayez son enregistrement.':approval.storage==='stored'?'Demande et saisie enregistrées.':'Conservation non confirmée.'}</p>
  {bridgeFailed&&editable&&<button type="button" className="text-button" onClick={()=>onChange(adjustment)}>Réessayer l’enregistrement de l’ajustement</button>}
  {active&&<div className="approval-actions"><button type="button" className="secondary" disabled={bridgeFailed||approval.storage!=='stored'} onClick={()=>onDecide('decline')}>Refuser tout le patch</button><button type="button" className="primary" disabled={bridgeFailed||approval.storage!=='stored'} onClick={()=>onDecide('accept')}>Autoriser tout le patch une fois</button></div>}
  {approval.decision==='decline'&&approval.effect==='declined'&&approval.adjustmentStatus==='draft'&&editable&&<button type="button" className="secondary" disabled={!canAdjust||!adjustment.trim()||bridgeFailed} onClick={onSendAdjustment}>Envoyer cet ajustement à Mary</button>}
  {approval.adjustmentStatus!=='draft'&&<p className="small" role="status">{approval.adjustmentStatus==='sent'?'Ajustement envoyé dans un nouveau tour.':approval.adjustmentStatus==='sending'?'Nouveau tour de l’ajustement en cours.':'Envoi de l’ajustement inconnu ; aucun nouvel envoi automatique.'}</p>}
  {approval.result&&<details className="approval-result"><summary>Résultat natif et effets relus</summary><p className="small">{effect} Aucun rollback n’est supposé.</p><ul>{approval.result.files.map(file=><li key={file.path}><code>{file.path}</code> : {file.matches?'octets/existence attendus relus':'effet différent ou inconnu'} · <code>{file.sha256??'absent'}</code></li>)}</ul><pre>{approval.result.raw}</pre></details>}
  {approval.identity.kind==='attested'&&<p className="small muted">Identité attestée · source : <code>{approval.identity.source}</code></p>}
 </section>
}
