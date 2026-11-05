import {formatNumber} from './locale-format.ts'
import {useLocale,useLocalText,LanguageControl} from './Locale.tsx'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { OverviewEntry, OverviewTarget } from '../../core/work-overview.ts'
import type { DialogueMessage } from '../../contracts/dialogue.ts'
import { agentPresentation } from './agentPresentation.ts'
import { AgentPortrait } from './AgentPortrait.tsx'

export type AgentConsultation = { message: DialogueMessage; trigger: HTMLButtonElement; viewConversationId: string | null }
export function AgentInfoPanel({ consultation, entries, onClose, onNavigate }: {
  consultation: AgentConsultation; entries: OverviewEntry[]; onClose: () => void; onNavigate: (target: OverviewTarget) => void
}): ReactNode {
 const {ui,language}=useLocale()

  const panel = useRef<HTMLDialogElement>(null), title = useRef<HTMLHeadingElement>(null)
  const body = useRef<HTMLDivElement>(null), reading = useRef(0)
  const [narrow, setNarrow] = useState(() => !window.matchMedia('(min-width: 1323px)').matches)
  const [priorityModal, setPriorityModal] = useState(false)
  const [attention, setAttention] = useState<OverviewEntry[]>([])
  const [announcement, setAnnouncement] = useLocalText<string>('')
  const seen = useRef(new Set<string>())
  const agent = agentPresentation(consultation.message.identity,language)!
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1323px)'), change = (): void => setNarrow(!query.matches)
    query.addEventListener('change', change); return () => query.removeEventListener('change', change)
  }, [])
  useLayoutEffect(() => {
    const update = (): void => setPriorityModal(!!document.querySelector('.plan-confirmation[open],.navigation-drawer[open]'))
    update()
    const observer = new MutationObserver(update); observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => {
    const element = panel.current; if (!element) return
    // Reopening a lower dialog disturbs the active native modal's focus/close handling.
    // Defer layout changes until that surface has closed; its native stack stays intact.
    if (priorityModal) return
    const scrollTop = reading.current
    const previous = document.activeElement instanceof HTMLElement && element.contains(document.activeElement) ? document.activeElement : null
    if (element.open) element.close()
    if (narrow) element.showModal(); else element.show()
    ;(previous ?? title.current)?.focus({ preventScroll: true })
    if (body.current) body.current.scrollTop = scrollTop
  }, [narrow, priorityModal])
  useEffect(() => {
    const arrivals = entries.filter(entry => (entry.state === 'waiting' || entry.state === 'recovery') && !seen.current.has(entry.id))
    if (!arrivals.length) return
    arrivals.forEach(entry => seen.current.add(entry.id))
    setAttention(current => [...arrivals, ...current])
    setAnnouncement(l=>l.ui.notice+formatNumber(seen.current.size,l.language)+' · '+arrivals.map(entry => (entry.state === 'recovery' ? l.ui.recovery_to_inspect : entry.target.kind === 'approval' ? l.ui.approval_needed : l.ui.response_needed) + (entry.projectName ? l.ui.in_2 + entry.projectName : '') + '.').join(' '))
  }, [entries])
  return <dialog ref={panel} className={'agent-info-panel' + (narrow ? ' is-modal' : ' is-docked')} role={narrow ? 'dialog' : 'region'} aria-modal={narrow ? 'true' : undefined} aria-labelledby="agent-info-title" onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose() }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() } }}>
    <div className="agent-panel-heading"><h2 id="agent-info-title" ref={title} tabIndex={-1}>{ui.details_for_2} {agent.name}</h2>{narrow&&<LanguageControl/>}<button type="button" aria-label={ui.close_agent_details} onClick={onClose}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6" /></svg></button></div>
    <div className="agent-attention-area">
      <div className="agent-attention-announcement" role="status" aria-live="polite" aria-atomic="true" tabIndex={announcement ? 0 : undefined}>{announcement}</div>
      {attention.length > 0 && <section className="agent-attention" aria-label={ui.work_requiring_attention}>{attention.map(entry => {
        const active = entries.some(current => current.id === entry.id)
        return <div key={entry.id}><p>{active ? entry.state === 'recovery' ? ui.recovery_to_inspect : entry.target.kind === 'approval' ? ui.approval_needed : ui.response_needed : ui.this_request_is_no_longer_active_history_retained}{entry.projectName && ' · ' + entry.projectName}</p><button type="button" className="text-button" onClick={() => onNavigate(entry.target)}>{active ? entry.state === 'recovery' ? ui.view_this_recovery : ui.open_this_request : ui.view_this_history}</button></div>
      })}</section>}
    </div>
    <div className="agent-panel-body" ref={body} onScroll={event => { reading.current = event.currentTarget.scrollTop }}>
      <div className="agent-bust"><AgentPortrait agent={agent} large /></div>
      <h3 className="agent-name">{agent.name}</h3><p className="agent-role">{agent.role}</p>
      <p>{agent.description}</p><dl><dt>{ui.role_specialty}</dt><dd>{agent.specialty}</dd><dt>{ui.this_message_s_provenance}</dt><dd>{ui.attested_identity} <code>{consultation.message.identity.kind === 'attested' ? consultation.message.identity.source : ''}</code></dd><dt>{ui.consulted_message}</dt><dd><code>{consultation.message.id}</code></dd></dl>
      <p className="agent-role-note">{ui.these_details_describe_the_bmad_role_the_illustration_proves_neit}</p>
    </div>
  </dialog>
}
