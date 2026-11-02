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
  const panel = useRef<HTMLDialogElement>(null), title = useRef<HTMLHeadingElement>(null)
  const body = useRef<HTMLDivElement>(null), reading = useRef(0)
  const [narrow, setNarrow] = useState(() => !window.matchMedia('(min-width: 1323px)').matches)
  const [priorityModal, setPriorityModal] = useState(false)
  const [attention, setAttention] = useState<OverviewEntry[]>([])
  const [announcement, setAnnouncement] = useState('')
  const seen = useRef(new Set<string>())
  const agent = agentPresentation(consultation.message.identity)!
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
    setAnnouncement('Signalement '+seen.current.size+' · '+arrivals.map(entry => (entry.state === 'recovery' ? 'Récupération à examiner' : entry.target.kind === 'approval' ? 'Approbation attendue' : 'Réponse attendue') + (entry.projectName ? ' dans ' + entry.projectName : '') + '.').join(' '))
  }, [entries])
  return <dialog ref={panel} className={'agent-info-panel' + (narrow ? ' is-modal' : ' is-docked')} role={narrow ? 'dialog' : 'region'} aria-modal={narrow ? 'true' : undefined} aria-labelledby="agent-info-title" onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose() }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() } }}>
    <div className="agent-panel-heading"><h2 id="agent-info-title" ref={title} tabIndex={-1}>Fiche de {agent.name}</h2><button type="button" aria-label="Fermer la fiche agent" onClick={onClose}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6" /></svg></button></div>
    <div className="agent-attention-area">
      <div className="agent-attention-announcement" role="status" aria-live="polite" aria-atomic="true" tabIndex={announcement ? 0 : undefined}>{announcement}</div>
      {attention.length > 0 && <section className="agent-attention" aria-label="Points d’attention du travail">{attention.map(entry => {
        const active = entries.some(current => current.id === entry.id)
        return <div key={entry.id}><p>{active ? entry.state === 'recovery' ? 'Récupération à examiner' : entry.target.kind === 'approval' ? 'Approbation attendue' : 'Réponse attendue' : 'Cette demande n’est plus active — historique conservé'}{entry.projectName && ' · ' + entry.projectName}</p><button type="button" className="text-button" onClick={() => onNavigate(entry.target)}>{active ? entry.state === 'recovery' ? 'Voir cette récupération' : 'Rejoindre cette demande' : 'Voir cet historique'}</button></div>
      })}</section>}
    </div>
    <div className="agent-panel-body" ref={body} onScroll={event => { reading.current = event.currentTarget.scrollTop }}>
      <div className="agent-bust"><AgentPortrait agent={agent} large /></div>
      <h3 className="agent-name">{agent.name}</h3><p className="agent-role">{agent.role}</p>
      <p>{agent.description}</p><dl><dt>Spécialité du rôle</dt><dd>{agent.specialty}</dd><dt>Provenance de ce message</dt><dd>Identité attestée · <code>{consultation.message.identity.kind === 'attested' ? consultation.message.identity.source : ''}</code></dd><dt>Message consulté</dt><dd><code>{consultation.message.id}</code></dd></dl>
      <p className="agent-role-note">Cette fiche décrit le rôle BMad. L’illustration ne prouve ni activité en cours, ni compétence disponible dans ce projet.</p>
    </div>
  </dialog>
}
