import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Reply } from '../../contracts/index.ts'
import { MAX_DRAFT_LENGTH } from '../../contracts/index.ts'
import { fr } from './strings.ts'
import { initialConnectionState } from '../../contracts/connection.ts'
import type { ConnectionState, ConnectionBridge } from '../../contracts/connection.ts'
import chatgptMark from './assets/chatgpt-mark.svg'

function Icon({ name }: { name: 'home' | 'folder' | 'panel' | 'close' | 'message' | 'arrow' }): ReactNode {
  const paths = { home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z', folder: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z', panel: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 3v18m6-13-3 4 3 4', close: 'm6 6 12 12M6 18 18 6', message: 'M4 4h16v12H9l-5 4V4Z', arrow: 'M5 12h14m-5-5 5 5-5 5' }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></svg>
}

export function App(): ReactNode {
  const [state, setState] = useState<AppState | null>(null)
  const [page, setPage] = useState<'home' | 'project'>('home')
  const [tab, setTab] = useState<'parcours' | 'conversation'>('parcours')
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [collapsed, setCollapsed] = useState(false)
  const [preferenceUnsaved, setPreferenceUnsaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('Lecture du contexte local…')
  const [pending, setPending] = useState(false)
  const [tooltipsDismissed, setTooltipsDismissed] = useState(false)
  const drawer = useRef<HTMLDialogElement>(null)
  const drawerTrigger = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [connection, setConnection] = useState<ConnectionState>(initialConnectionState)
  const [connectionOpen, setConnectionOpen] = useState(false)
  const [connectionPending, setConnectionPending] = useState(false)
  const [connectionBridgeError, setConnectionBridgeError] = useState(false)
  const connectionTrigger = useRef<HTMLButtonElement>(null)
  const connectionPanel = useRef<HTMLElement>(null)
  const connectionHeading = useRef<HTMLHeadingElement>(null)
  const planConfirmation = useRef<HTMLDialogElement>(null)
  const planConfirmationDismissed = useRef(false)
  const connectionBusy = ['authorizing', 'verifying', 'stopping', 'closing'].includes(connection.status)
  const connectionBlocked = ['ENCRYPTION_UNAVAILABLE', 'VAULT_UNREADABLE', 'REGISTRATION_INVALID'].includes(connection.errorCode ?? '')
  const connectionLabel = 'Connexion Codex : ' + fr.connectionStatus[connection.status]
  const project = state?.projects.find((p) => p.id === state.activeProjectId)
  const saved = state?.drafts.find((d) => d.projectId === project?.id)
  const text = project ? texts[project.id] ?? saved?.text ?? '' : ''
  const dirty = text !== (saved?.text ?? '')

  function accept(reply: Reply): boolean {
    if (!reply.ok) { setError(fr.errors[reply.error.messageKey]); setNotice(''); return false }
    setState(reply.value.state)
    setError(null)
    return true
  }
  async function run(operation: () => Promise<Reply>, after?: (reply: Reply) => void): Promise<void> {
    setPending(true)
    try {
      const reply = await operation()
      if (accept(reply)) after?.(reply)
    } catch { setError('Le pont local ne répond pas. Votre saisie reste disponible ici. Réessayez.'); setNotice('') }
    finally { setPending(false) }
  }
  async function load(): Promise<void> {
    await run(() => window.madness.readState(), (reply) => {
      if (!reply.ok) return
      setCollapsed(reply.value.state.preferences.navigationCollapsed)
      setPage(reply.value.state.activeProjectId ? 'project' : 'home')
      setNotice('Contexte local chargé. Aucun agent n’a été relancé.')
    })
  }
  useEffect(() => { void load() }, [])
  function acceptConnection(next: ConnectionState): void { setConnection((current) => next.sequence >= current.sequence ? next : current) }
  async function connectionAction(action: keyof Omit<ConnectionBridge, 'onChanged'>): Promise<void> {
    setConnectionPending(true)
    try { acceptConnection((await window.madnessConnection[action]()).state); setConnectionBridgeError(false) }
    catch { setConnectionBridgeError(true) }
    finally { setConnectionPending(false) }
  }
  useEffect(() => {
    const unsubscribe = window.madnessConnection.onChanged(acceptConnection)
    void connectionAction('read')
    return unsubscribe
  }, [])
  function closeConnection(): void {
    if (connectionBusy && !['stopping', 'closing'].includes(connection.status)) void connectionAction('cancel')
    setConnectionOpen(false); connectionTrigger.current?.focus()
  }
  useEffect(() => { if (connectionOpen) connectionHeading.current?.focus() }, [connectionOpen])
  useEffect(() => {
    if (!connection.needsPlanAcknowledgement || !connection.accountStored) planConfirmationDismissed.current = false
    if (connection.needsPlanAcknowledgement && connection.accountStored && !planConfirmationDismissed.current && !['authorizing', 'verifying', 'stopping', 'closing'].includes(connection.status) && !planConfirmation.current?.open) planConfirmation.current?.showModal()
    if (!connection.needsPlanAcknowledgement && planConfirmation.current?.open) { planConfirmation.current.close(); if (connectionOpen) connectionHeading.current?.focus(); else connectionTrigger.current?.focus() }
  }, [connection.needsPlanAcknowledgement, connection.accountStored, connection.status, connectionOpen])
  function closeDrawer(): void { drawer.current?.close(); drawerTrigger.current?.focus() }
  function home(): void { setPage('home'); closeDrawer(); setTimeout(() => heading.current?.focus(), 0) }
  function open(): void {
    closeDrawer()
    void run(() => window.madness.chooseDirectory(), (reply) => {
      if (!reply.ok) return
      if (reply.value.effect === 'cancelled') setNotice('Ouverture annulée. Aucun projet ajouté.')
      else { setPage('project'); setNotice('Contexte du dossier enregistré localement.'); setTimeout(() => heading.current?.focus(), 0) }
    })
  }
  function select(projectId: string): void {
    closeDrawer()
    void run(() => window.madness.selectProject(projectId), () => { setPage('project'); setNotice('Projet retrouvé. Aucun agent n’a été relancé.'); setTimeout(() => heading.current?.focus(), 0) })
  }
  function toggleNavigation(): void {
    if (pending || !state) return
    const next = !collapsed
    setCollapsed(next)
    setPreferenceUnsaved(true)
    void run(() => window.madness.setNavigation(next), () => { setPreferenceUnsaved(false); setNotice('Préférence de navigation enregistrée.') })
  }
  const navigation = <>
    <button className={'nav-button ' + (page === 'home' ? 'selected' : '')} aria-label={fr.home} aria-current={page === 'home' ? 'page' : undefined} title={fr.home} onClick={home}><Icon name="home" /><span className="nav-label">{fr.home}</span></button>
    <h2 className="nav-section nav-label">{fr.recent}</h2>
    {state?.projects.map((p, index) => <button key={p.id} className={'nav-button project-link ' + (page === 'project' && p.id === project?.id ? 'selected' : '')} aria-label={'Ouvrir le projet ' + p.name} aria-current={page === 'project' && p.id === project?.id ? 'page' : undefined} title={p.name + '\n' + p.rootPath} disabled={pending} onClick={() => select(p.id)}><span className="project-glyph" aria-hidden="true">{(index + 1).toString(36).toUpperCase()}</span><span className="nav-label truncate">{p.name}</span></button>)}
    {!state?.projects.length && <p className="nav-note nav-label">Vos dossiers ouverts apparaîtront ici.</p>}
  </>
  return <div className={'app-shell ' + (collapsed ? 'nav-compact ' : '') + (tooltipsDismissed ? 'tooltips-dismissed' : '')} onKeyDown={(event) => { if (event.key === 'Escape') { setTooltipsDismissed(true); if (drawer.current?.open) return; if (connectionOpen && !planConfirmation.current?.open) { event.preventDefault(); closeConnection() } } }}>
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>Aller au contenu</a>
    <header className="topbar">
      <div className="breadcrumb">
        <button className="toolbar-toggle desktop-menu" type="button" aria-label={collapsed ? 'Déployer la navigation' : 'Réduire la navigation'} title={collapsed ? 'Déployer la navigation' : 'Réduire la navigation'} aria-expanded={!collapsed} aria-controls="project-navigation" onClick={toggleNavigation} aria-disabled={pending || !state}><Icon name="panel" /></button>
        <button className="toolbar-toggle mobile-menu" type="button" ref={drawerTrigger} aria-label="Ouvrir la navigation" title="Ouvrir la navigation" aria-haspopup="dialog" aria-controls="navigation-drawer" onClick={() => drawer.current?.showModal()}><Icon name="panel" /></button>
        <span title={page === 'project' && project ? project.name : fr.home}>{page === 'project' && project ? project.name : fr.home}</span>
      </div>
      <div className="topbar-actions">
        <button className={'codex-trigger ' + (connection.status === 'verified' ? 'codex-verified' : '')} type="button" ref={connectionTrigger} aria-label={connectionLabel} title={connectionLabel} aria-expanded={connectionOpen} aria-controls="codex-connection-panel" aria-haspopup="dialog" onClick={() => { if (connectionOpen) closeConnection(); else setConnectionOpen(true) }}><img src={chatgptMark} alt="" /><span className="connection-tooltip" aria-hidden="true">{connectionLabel}</span></button>
        <button className="primary open-project" type="button" aria-label={fr.open} title={fr.open} onClick={open} disabled={pending || !state}><Icon name="folder" /><span className="open-label">{fr.open}</span></button>
      </div>
    </header>
    {connectionOpen && <section id="codex-connection-panel" className="connection-panel" role="dialog" aria-modal="false" aria-labelledby="codex-connection-title" ref={connectionPanel}>
      <div className="connection-heading"><h2 id="codex-connection-title" ref={connectionHeading} tabIndex={-1}>Connexion Codex</h2><button type="button" aria-label="Fermer la connexion Codex" onClick={closeConnection}><Icon name="close" /></button></div>
      <p className={'connection-state ' + (connection.status === 'verified' ? 'is-verified' : '')} role="status">{fr.connectionStatus[connection.status]}</p>
      {connection.status === 'verified' ? <p>Un tour témoin Codex a réussi et son processus est arrêté.{connection.verifiedAt && <> Vérifié le {new Date(connection.verifiedAt).toLocaleString('fr-FR')}.</>}{connection.cliVersion && <> Codex {connection.cliVersion}.</>}</p> : connection.accountStored ? <p>Votre compte est enregistré dans le coffre chiffré Windows. Il reste à vérifier pour cet usage ; aucune conversation n’est relancée.</p> : <p>Connectez votre compte ChatGPT dans le navigateur Windows. Madness conserve ses propres accès chiffrés sur cet ordinateur.</p>}
      {connection.status === 'authorizing' && <p>Terminez l’autorisation dans votre navigateur. L’attente expire après dix minutes.</p>}
      {connection.status === 'verifying' && <p>Un petit tour de vérification est en cours. Le résultat attend la fin du tour et l’arrêt confirmé de Codex.</p>}
      {connection.status === 'stopping' && <p>Arrêt de l’attente et du processus possédé. Aucun nouveau témoin n’est envoyé.</p>}
      {connection.errorCode && <p className={connection.errorCode === 'CANCELLED' ? 'connection-cancelled' : 'connection-error'} role={connection.status === 'error' || connection.status === 'unknown' ? 'alert' : undefined}>{fr.connectionErrors[connection.errorCode]}</p>}
      {connectionBridgeError && <p className="connection-error" role="alert">Le pont de connexion ne répond pas. Rouvrez le panneau ou redémarrez Madness. Vos projets et brouillons sont conservés.</p>}
      <p className="connection-consumption">La vérification envoie un court message témoin et consomme votre forfait ChatGPT. Les limites de ce forfait s’appliquent.</p>
      <div className="connection-actions">
        {connectionBusy ? <button className="secondary" type="button" onClick={() => void connectionAction('cancel')} disabled={connectionPending || ['stopping', 'closing'].includes(connection.status)}>Annuler la connexion</button> : <>
          {connection.accountStored && <button className="primary" type="button" onClick={() => void connectionAction('verify')} disabled={connectionPending || connectionBlocked || connection.status === 'unknown'}>Vérifier la connexion</button>}
          {!connectionBlocked && <button className={connection.accountStored ? 'secondary' : 'primary'} type="button" onClick={() => void connectionAction('connect')} disabled={connectionPending || connection.status === 'unknown'}>{connection.accountStored ? 'Reconnecter avec ChatGPT' : 'Continuer avec ChatGPT'}</button>}
          {(connection.accountStored || connection.errorCode === 'VAULT_UNREADABLE') && <button className="secondary" type="button" onClick={() => void connectionAction('disconnect')} disabled={connectionPending}>Déconnecter localement</button>}
        </>}
      </div>
      <div className="connection-scope"><p>Ce contrôle vérifie uniquement la connexion locale au forfait. Le dialogue BMad reste indisponible ; vos brouillons ne sont jamais envoyés.</p><button className="text-button" type="button" onClick={() => void connectionAction('manageUsage')} disabled={connectionPending}>Gérer l’usage dans ChatGPT</button></div>
    </section>}
    <div className="app-body">
    <aside className="sidebar" aria-label="Navigation principale" onMouseLeave={() => setTooltipsDismissed(false)} onFocusCapture={() => setTooltipsDismissed(false)}>
      <div className="brand"><span className="brand-label">{fr.app}</span></div>
      <nav id="project-navigation" aria-label="Projets">{navigation}</nav>
      <p className="sidebar-bottom nav-label">Données locales<br />Français · thème clair</p>
    </aside>
    <div className="workspace">
      <div className="workspace-body">
        <main id="main" tabIndex={-1}>
          <div className="main-inner">
            {error && <div className="error-message" role="alert"><strong>L’opération n’a pas abouti</strong><p>{error}</p>{!state && <button className="secondary" onClick={() => void load()} disabled={pending}>Relire le contexte local</button>}</div>}
            {!state ? <section className="empty-state"><h1 ref={heading} tabIndex={-1}>Retrouver votre espace de travail</h1><p>{pending ? 'Lecture du contexte local…' : 'Le contexte local est indisponible. Utilisez le message ci-dessus pour réessayer.'}</p></section> : page === 'home' || !project ? <>
              <div className="page-intro"><div><h1 ref={heading} tabIndex={-1}>Vos projets, au même endroit</h1><p>Retrouvez un dossier et préparez la suite de votre travail.</p></div></div>
              {state.projects.length === 0 ? <section className="welcome"><h2>Commencez par un dossier</h2><p>Ouvrez un projet local pour conserver son contexte et y préparer un brouillon. Le dossier reste intact.</p><p className="reason"><strong>Pourquoi maintenant ?</strong> Madness doit connaître le projet auquel rattacher votre saisie.</p></section> : <section aria-labelledby="recent-heading"><h2 id="recent-heading">{fr.recent}</h2><div className="project-list">{state.projects.map((p, index) => <button className="project-row" key={p.id} onClick={() => select(p.id)} disabled={pending}><span className="project-avatar" aria-hidden="true">{(index + 1).toString(36).toUpperCase()}</span><span className="project-info"><strong>{p.name}</strong><code>{p.rootPath}</code><small>Contexte conservé localement</small></span><Icon name="arrow" /></button>)}</div></section>}
              <div className="home-note"><h2>Connectez votre compte depuis le logo Codex</h2><p>{fr.codexReason} L’analyse BMad, l’initialisation et le graphe ne sont pas disponibles dans ce socle.</p></div>
            </> : <>
              <div className="project-heading"><h1 ref={heading} tabIndex={-1}>{project.name}</h1><span className="badge">Dossier connu</span></div>
              <p className="project-path"><code>{project.rootPath}</code></p>
              <p className="context-note">Initiative non identifiée · aucun diagnostic BMad effectué</p>
              <div className="project-tabs" role="tablist" aria-label="Vues du projet">{(['parcours', 'conversation'] as const).map((item) => <button key={item} id={'tab-' + item} type="button" role="tab" aria-selected={tab === item} aria-controls={'panel-' + item} tabIndex={tab === item ? 0 : -1} onClick={() => setTab(item)} onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = item === 'parcours' ? 'conversation' : 'parcours'; const selected = event.key === 'Home' ? 'parcours' : event.key === 'End' ? 'conversation' : next; setTab(selected); document.getElementById('tab-' + selected)?.focus() } }}>{item === 'parcours' ? 'Parcours' : 'Conversation'}</button>)}</div>
              <section id={'panel-' + tab} role="tabpanel" aria-labelledby={'tab-' + tab}>
                {tab === 'parcours' ? <div className="recommendation"><h2>Préparez votre prochain échange</h2><p>Le contexte de ce dossier est enregistré. Vous pouvez rédiger et conserver un brouillon dès maintenant.</p><p className="reason"><strong>Pourquoi maintenant ?</strong> Vous retrouverez cette saisie à la prochaine ouverture, après son enregistrement explicite.</p><button className="primary" onClick={() => { setTab('conversation'); setTimeout(() => document.getElementById('draft')?.focus(), 0) }}><Icon name="message" />Préparer un brouillon</button></div> : <div className="conversation-empty"><h2>Aucune conversation ouverte</h2><p>{fr.codexReason}</p></div>}
                <form className="composer" onSubmit={(event) => { event.preventDefault(); const projectId = project.id; const value = text; void run(() => window.madness.saveDraft(projectId, value), () => setNotice(fr.saved)) }}>
                  <label htmlFor="draft">Brouillon pour {project.name}</label>
                  <textarea id="draft" value={text} onChange={(event) => setTexts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={MAX_DRAFT_LENGTH} aria-describedby="draft-status draft-limit" placeholder="Notez ce que vous souhaitez reprendre dans ce projet…" />
                  <div className="composer-bottom"><p id="draft-status">{dirty ? fr.unsaved : saved ? fr.saved : fr.noDraft}</p><button className="primary" type="submit" disabled={pending || !dirty}>{pending ? fr.saving : fr.save}</button></div>
                  <p className="small muted" id="draft-limit">Brouillon local uniquement · aucun envoi à Codex · 100 000 caractères maximum</p>
                </form>
              </section>
            </>}
            {preferenceUnsaved && <p className="preference-note">Le choix de navigation s’applique à cette session ; sa sauvegarde n’est pas confirmée.</p>}
            <p className="status-line" role="status" aria-live="polite">{notice}</p>
          </div>
        </main>
        {page === 'project' && project && <aside className="context-panel" aria-label="Contexte du projet"><h2>Contexte du projet</h2><p>Source : dossier choisi via Windows.</p><dl><dt>Dossier canonique</dt><dd><code>{project.rootPath}</code></dd><dt>Conservation</dt><dd>Contexte et brouillon dans les données locales de Madness.</dd><dt>Activité</dt><dd>Aucun agent lancé.</dd><dt>Fichiers du projet</dt><dd>Aucune modification effectuée.</dd></dl><p className="small">Les preuves BMad et les échanges fournisseur seront disponibles après leurs qualifications respectives.</p></aside>}
      </div>
    </div>
    </div>
    <dialog id="navigation-drawer" className="navigation-drawer" ref={drawer} aria-labelledby="drawer-title" onClose={() => drawerTrigger.current?.focus()} onClick={(event) => { if (event.target === drawer.current) closeDrawer() }}>
      <div className="drawer-heading"><h2 id="drawer-title">{fr.app}</h2><button aria-label="Fermer la navigation" onClick={closeDrawer}><Icon name="close" /></button></div><nav aria-label="Projets en fenêtre compacte">{navigation}</nav>
    </dialog>
    <dialog className="plan-confirmation" ref={planConfirmation} aria-labelledby="plan-confirmation-title" aria-describedby="plan-confirmation-description" onClose={() => { planConfirmationDismissed.current = connection.needsPlanAcknowledgement; if (connectionOpen) connectionHeading.current?.focus(); else connectionTrigger.current?.focus() }}>
      <h2 id="plan-confirmation-title">Vous utilisez votre forfait ChatGPT</h2>
      <p id="plan-confirmation-description">Vous avez autorisé Madness à utiliser votre forfait ChatGPT. Le court témoin de connexion et les futurs usages autorisés comptent dans ses limites.</p>
      {connectionBridgeError && <p className="connection-error" role="alert">La confirmation n’a pas pu être enregistrée. Réessayez.</p>}
      {connection.errorCode && <p className="connection-error" role="alert">{fr.connectionErrors[connection.errorCode]}</p>}
      <button className="primary" type="button" onClick={() => void connectionAction('acknowledgePlan')} disabled={connectionPending}>J’ai compris</button>
      {' '}<button className="secondary" type="button" onClick={() => planConfirmation.current?.close()}>Fermer</button>
    </dialog>
  </div>
}
