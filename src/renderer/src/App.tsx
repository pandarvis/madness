import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Reply } from '../../contracts/index.ts'
import { MAX_DRAFT_LENGTH } from '../../contracts/index.ts'
import { fr } from './strings.ts'

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
    const next = !collapsed
    setCollapsed(next)
    setPreferenceUnsaved(true)
    void run(() => window.madness.setNavigation(next), () => { setPreferenceUnsaved(false); setNotice('Préférence de navigation enregistrée.') })
  }
  const navigation = <>
    <button className={'nav-button ' + (page === 'home' ? 'selected' : '')} aria-label={fr.home} aria-current={page === 'home' ? 'page' : undefined} title={fr.home} onClick={home}><Icon name="home" /><span className="nav-label">{fr.home}</span></button>
    <button className="nav-button" aria-label={fr.open} title={fr.open} onClick={open} disabled={pending || !state}><Icon name="folder" /><span className="nav-label">{fr.open}</span></button>
    <h2 className="nav-section nav-label">{fr.recent}</h2>
    {state?.projects.map((p, index) => <button key={p.id} className={'nav-button project-link ' + (page === 'project' && p.id === project?.id ? 'selected' : '')} aria-label={'Ouvrir le projet ' + p.name} aria-current={page === 'project' && p.id === project?.id ? 'page' : undefined} title={p.name + '\n' + p.rootPath} disabled={pending} onClick={() => select(p.id)}><span className="project-glyph" aria-hidden="true">{(index + 1).toString(36).toUpperCase()}</span><span className="nav-label truncate">{p.name}</span></button>)}
    {!state?.projects.length && <p className="nav-note nav-label">Vos dossiers ouverts apparaîtront ici.</p>}
  </>
  return <div className={'app-shell ' + (collapsed ? 'nav-compact ' : '') + (tooltipsDismissed ? 'tooltips-dismissed' : '')} onKeyDown={(event) => { if (event.key === 'Escape') setTooltipsDismissed(true) }}>
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>Aller au contenu</a>
    <aside className="sidebar" aria-label="Navigation principale" onMouseLeave={() => setTooltipsDismissed(false)} onFocusCapture={() => setTooltipsDismissed(false)}>
      <div className="brand"><span className="brand-label">{fr.app}</span></div>
      <button className="nav-button" aria-label={collapsed ? 'Déployer la navigation' : 'Réduire la navigation'} title={collapsed ? 'Déployer la navigation' : 'Réduire la navigation'} aria-expanded={!collapsed} onClick={toggleNavigation} disabled={pending || !state}><Icon name="panel" /><span className="nav-label">Réduire le menu</span></button>
      <nav aria-label="Projets">{navigation}</nav>
      <p className="sidebar-bottom nav-label">Données locales<br />Français · thème clair</p>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumb"><button className="mobile-menu" ref={drawerTrigger} aria-label="Ouvrir la navigation" onClick={() => drawer.current?.showModal()}><Icon name="panel" /></button><span>{page === 'project' && project ? project.name : fr.home}</span></div>
        <span className="connection" title={fr.codexReason}>{fr.codexUnavailable}</span>
      </header>
      <div className="workspace-body">
        <main id="main" tabIndex={-1}>
          <div className="main-inner">
            {error && <div className="error-message" role="alert"><strong>L’opération n’a pas abouti</strong><p>{error}</p>{!state && <button className="secondary" onClick={() => void load()} disabled={pending}>Relire le contexte local</button>}</div>}
            {!state ? <section className="empty-state"><h1 ref={heading} tabIndex={-1}>Retrouver votre espace de travail</h1><p>{pending ? 'Lecture du contexte local…' : 'Le contexte local est indisponible. Utilisez le message ci-dessus pour réessayer.'}</p></section> : page === 'home' || !project ? <>
              <div className="page-intro"><div><h1 ref={heading} tabIndex={-1}>Vos projets, au même endroit</h1><p>Retrouvez un dossier et préparez la suite de votre travail.</p></div><button className="primary" onClick={open} disabled={pending}><Icon name="folder" />{fr.open}</button></div>
              {state.projects.length === 0 ? <section className="welcome"><h2>Commencez par un dossier</h2><p>Ouvrez un projet local pour conserver son contexte et y préparer un brouillon. Le dossier reste intact.</p><p className="reason"><strong>Pourquoi maintenant ?</strong> Madness doit connaître le projet auquel rattacher votre saisie.</p></section> : <section aria-labelledby="recent-heading"><h2 id="recent-heading">{fr.recent}</h2><div className="project-list">{state.projects.map((p, index) => <button className="project-row" key={p.id} onClick={() => select(p.id)} disabled={pending}><span className="project-avatar" aria-hidden="true">{(index + 1).toString(36).toUpperCase()}</span><span className="project-info"><strong>{p.name}</strong><code>{p.rootPath}</code><small>Contexte conservé localement</small></span><Icon name="arrow" /></button>)}</div></section>}
              <div className="home-note"><h2>La connexion viendra ensuite</h2><p>{fr.codexReason} L’analyse BMad, l’initialisation et le graphe ne sont pas disponibles dans ce socle.</p></div>
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
    <dialog className="navigation-drawer" ref={drawer} aria-labelledby="drawer-title" onClose={() => drawerTrigger.current?.focus()} onClick={(event) => { if (event.target === drawer.current) closeDrawer() }}>
      <div className="drawer-heading"><h2 id="drawer-title">{fr.app}</h2><button aria-label="Fermer la navigation" onClick={closeDrawer}><Icon name="close" /></button></div><nav aria-label="Projets en fenêtre compacte">{navigation}</nav>
    </dialog>
  </div>
}
