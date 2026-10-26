import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Reply } from '../../contracts/index.ts'
import { MAX_DRAFT_LENGTH } from '../../contracts/index.ts'
import { fr } from './strings.ts'
import { PUBLIC_KEYS_URL, initialConnectionState } from '../../contracts/connection.ts'
import type { ConnectionState, ConnectionBridge } from '../../contracts/connection.ts'
import chatgptMark from './assets/chatgpt-mark.svg'
import { initialDialogueState } from '../../contracts/dialogue.ts'
import type { DialogueState, WorkflowRecord } from '../../contracts/dialogue.ts'
import type { AppearanceState } from '../../contracts/appearance.ts'

function Icon({ name }: { name: 'home' | 'folder' | 'panel' | 'close' | 'message' | 'arrow' | 'refresh' | 'external' | 'logout' | 'copy' | 'sun' | 'moon' }): ReactNode {
  const paths = { home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z', folder: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z', panel: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 3v18m6-13-3 4 3 4', close: 'm6 6 12 12M6 18 18 6', message: 'M4 4h16v12H9l-5 4V4Z', arrow: 'M5 12h14m-5-5 5 5-5 5', refresh: 'M20 7v5h-5M20 12a8 8 0 1 0-2 5', external: 'M14 4h6v6m0-6-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5', logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4m4-12 4 4-4 4m-4-4h12',copy:'M9 9h12v12H9V9ZM5 15H3V3h12v2',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M20.5 13.1A8.5 8.5 0 0 1 10.9 3.5a8.5 8.5 0 1 0 9.6 9.6Z' }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></svg>
}

function WorkflowResult({workflow,onCopy}:{workflow:WorkflowRecord;onCopy:(conversationId:string,target:'invocation'|'workspace')=>Promise<DialogueState>}):ReactNode {
  const [copyNotice,setCopyNotice]=useState('')
  async function copy(target:'invocation'|'workspace'):Promise<void>{
    try{const next=await onCopy(workflow.conversationId,target);setCopyNotice(next.errorCode?'La copie a échoué. Sélectionnez le texte affiché pour le copier manuellement.':target==='invocation'?'Invocation copiée.':'Chemin copié.')}
    catch{setCopyNotice('La copie a échoué. Sélectionnez le texte affiché pour le copier manuellement.')}
  }
  const titleId='workflow-title-'+workflow.conversationId
  return <section className="workflow-observations" aria-labelledby={titleId}>
    <h2 id={titleId}>Résultat observé de Forge</h2>
    <p>{workflow.outcome==='open'?'Workflow ouvert ou interrompu · résultat final non observé.':'Clôture native observée : '+workflow.outcome+'.'} Acceptation humaine inconnue.</p>
    <p className="small">Contexte capturé le {new Date(workflow.capturedAt).toLocaleString('fr-FR')} · {workflow.context.initiativeId??'sans initiative'} · {workflow.context.connectionId}</p>
    <p><code>{workflow.invocation}</code> <button className="text-button" type="button" onClick={()=>void copy('invocation')}>Copier l’invocation</button></p>
    <p><code>{workflow.workspace??workflow.outputBase}</code>{workflow.workspace&&<button className="text-button" type="button" onClick={()=>void copy('workspace')}>Copier le chemin</button>}</p>
    <p className="small" role="status">{copyNotice}</p>
    <details><summary>Observations durables ({workflow.observations.length})</summary><p className="small">Ces observations datées décrivent les octets relus à cet instant. Elles ne garantissent pas leur état courant. Une opération restée en attente a un effet inconnu.</p><ol>{workflow.observations.map((o,i)=><li key={i}>{o.operation} · {o.phase==='observed'?'octets relus':o.phase==='pending'?'opération annoncée, confirmation attendue':o.phase==='unknown'?'effet inconnu':'échec'} · {new Date(o.at).toLocaleString('fr-FR')}<br/><code>{o.path}</code>{o.sha256&&<><br/><code>SHA-256 {o.sha256}</code> · {o.bytes} octets</>}</li>)}</ol><p className="small">Profil : <code>{workflow.fingerprint}</code><br/>Contexte : <code>{workflow.contextDigest}</code><br/>Dossier capturé : <code>{workflow.rootPath}</code></p></details>
  </section>
}

export function App({ initialAppearance = window.madnessAppearance.initial, appearanceReadFailed = false }: { initialAppearance?: AppearanceState; appearanceReadFailed?: boolean } = {}): ReactNode {
  const [state, setState] = useState<AppState | null>(null)
  const [page, setPage] = useState<'home' | 'project'>('home')
  const [tab, setTab] = useState<'parcours' | 'conversation'>('parcours')
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [collapsed, setCollapsed] = useState(false)
  const [preferenceUnsaved, setPreferenceUnsaved] = useState(false)
  const [appearance, setAppearance] = useState<AppearanceState>(initialAppearance)
  const [appearancePending, setAppearancePending] = useState(false)
  const [appearanceBridgeError, setAppearanceBridgeError] = useState<'read' | 'change' | null>(appearanceReadFailed ? 'read' : null)
  const appearanceBusy = useRef(false)
  const themeLabel = appearance.theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'
  useEffect(() => { document.documentElement.dataset.theme = appearance.theme }, [appearance.theme])
  async function toggleTheme(): Promise<void> {
    if (appearanceBusy.current) return
    const theme = appearance.theme === 'dark' ? 'light' : 'dark'
    appearanceBusy.current = true; setAppearancePending(true)
    try { setAppearance(await window.madnessAppearance.setTheme(theme)); setAppearanceBridgeError(null) }
    catch { setAppearanceBridgeError('change') }
    finally { appearanceBusy.current = false; setAppearancePending(false) }
  }
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
  const [supportPending, setSupportPending] = useState(false)
  const [supportNotice, setSupportNotice] = useState<string | null>(null)
  const [supportError, setSupportError] = useState<string | null>(null)
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
  const [dialogue, setDialogue] = useState<DialogueState>(initialDialogueState)
  const [dialoguePending, setDialoguePending] = useState(false)
  const [dialogueBridgeError, setDialogueBridgeError] = useState(false)
  const [forgePreparation,setForgePreparation]=useState(false)
  const sending = useRef(false)
  const dialogueHere = dialogue.context.projectId === project?.id
  const dialogueBusy = ['qualifying', 'starting', 'running', 'stopping'].includes(dialogue.status)
  const sessionPresent = ['starting', 'running', 'ready', 'stopping'].includes(dialogue.status)
  const projectConversations = state?.conversations.filter(c => c.context.projectId === project?.id) ?? []
  const conversation = projectConversations.find(c => c.id === dialogue.context.conversationId) ?? projectConversations.at(-1)
  const canReply = dialogueHere && dialogue.status === 'ready' && conversation?.id === dialogue.context.conversationId
  const workflow=dialogue.workflows.find(w=>w.conversationId===conversation?.id)
  const recipient=dialogue.invocation==='$bmad-forge-idea'?'Forge':'Mary'
  const forgePrerequisite=!connection.accountStored?'account':connection.needsPlanAcknowledgement?'plan':null
  const sessionFeedback=!!(sessionPresent||dialogueBusy||((dialogueHere||dialogue.status==='unknown')&&dialogue.errorCode)||dialogueBridgeError||(dialogueHere&&dialogue.profile))
  const conversationAgent=(id:string):string=>dialogue.workflows.some(w=>w.conversationId===id)?'Forge · Codex':'Mary · Codex'
  useEffect(()=>{setForgePreparation(false)},[project?.id])

  function accept(reply: Reply): boolean {
    if (!reply.ok) { setError(fr.errors[reply.error.messageKey]); setNotice(''); return false }
    setState(current => current && current.revision > reply.value.state.revision ? current : reply.value.state)
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
  useEffect(() => window.madness.onStateChanged?.(() => { void window.madness.readState().then(accept).catch(() => setError('Le contexte du dialogue ne peut pas être relu. Votre saisie reste disponible.')) }), [])
  function acceptDialogue(next: DialogueState): void { setDialogue(current => next.sequence >= current.sequence ? next : current) }
  useEffect(() => {
    if (!window.madnessDialogue) { setDialogueBridgeError(true); return }
    const unsubscribe = window.madnessDialogue.onChanged(acceptDialogue)
    void window.madnessDialogue.read().then(acceptDialogue).catch(() => setDialogueBridgeError(true))
    return unsubscribe
  }, [])
  async function dialogueAction(action: 'qualify' | 'launch' | 'stop' | 'qualifyForge' | 'launchForge'): Promise<void> {
    if (dialoguePending) return
    const projectId = project?.id
    if (action !== 'stop' && !projectId) return
    setDialoguePending(true)
    try { const next = action === 'stop' ? await window.madnessDialogue.stop() : await window.madnessDialogue[action](projectId!); acceptDialogue(next); setDialogueBridgeError(false); if (action === 'launch'||action==='launchForge') setTab('conversation') }
    catch { setDialogueBridgeError(true) }
    finally { setDialoguePending(false) }
  }
  async function copyWorkflow(conversationId:string,target:'invocation'|'workspace'):Promise<DialogueState>{
    const next=await window.madnessDialogue.copyWorkflow(conversationId,target);acceptDialogue(next);return next
  }
  async function sendToMary(): Promise<void> {
    if (!project || !conversation || !canReply || !text.trim() || sending.current) return
    const projectId = project.id, conversationId = conversation.id, captured = text
    sending.current = true; setDialoguePending(true)
    try {
      const savedReply = await window.madness.saveDraft(projectId, captured)
      if (!accept(savedReply)) return
      acceptDialogue(await window.madnessDialogue.send(projectId, conversationId, captured)); setDialogueBridgeError(false)
    } catch { setDialogueBridgeError(true) }
    finally { sending.current = false; setDialoguePending(false) }
  }
  function acceptConnection(next: ConnectionState): void { setConnection((current) => next.sequence >= current.sequence ? next : current) }
  async function connectionAction(action: keyof Omit<ConnectionBridge, 'onChanged' | 'openPublicKeys' | 'copyPublicKeys'>): Promise<void> {
    setConnectionPending(true)
    try { acceptConnection((await window.madnessConnection[action]()).state); setConnectionBridgeError(false) }
    catch { setConnectionBridgeError(true) }
    finally { setConnectionPending(false) }
  }
  async function connectionSupport(action: 'openPublicKeys' | 'copyPublicKeys'): Promise<void> {
    if (supportPending) return
    setSupportPending(true); setSupportNotice(null); setSupportError(null)
    try { await window.madnessConnection[action](); setSupportNotice(action === 'copyPublicKeys' ? fr.networkHelp.copied : fr.networkHelp.opened) }
    catch { setSupportError(action === 'copyPublicKeys' ? fr.networkHelp.copyFailed : fr.networkHelp.openFailed) }
    finally { setSupportPending(false) }
  }
  useEffect(() => { if (connection.errorCode !== 'NETWORK_UNAVAILABLE') { setSupportNotice(null); setSupportError(null) } }, [connection.errorCode])
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
        <button className="toolbar-toggle theme-toggle" type="button" aria-label={themeLabel} title={themeLabel} aria-disabled={appearancePending} onClick={() => void toggleTheme()}><Icon name={appearance.theme === 'dark' ? 'sun' : 'moon'} /></button>
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
      {connection.errorCode === 'NETWORK_UNAVAILABLE' && <section className="connection-network-help" aria-labelledby="network-help-title">
        <h3 id="network-help-title">{fr.networkHelp.title}</h3><p>{fr.networkHelp.description}</p>
        <div className="network-help-address"><code>{PUBLIC_KEYS_URL}</code><button className="copy-public-keys" type="button" aria-label={fr.networkHelp.copy} title={fr.networkHelp.copy} onClick={() => void connectionSupport('copyPublicKeys')} disabled={supportPending}><Icon name="copy" /></button></div>
        <button className="text-button network-help-open" type="button" onClick={() => void connectionSupport('openPublicKeys')} disabled={supportPending}><Icon name="external" />{fr.networkHelp.open}</button>
        {supportNotice && <p className="network-help-feedback" role="status">{supportNotice}</p>}
        {supportError && <p className="network-help-feedback network-help-error" role="alert">{supportError}</p>}
      </section>}
      {connectionBridgeError && <p className="connection-error" role="alert">Le pont de connexion ne répond pas. Rouvrez le panneau ou redémarrez Madness. Vos projets et brouillons sont conservés.</p>}
      <p className="connection-consumption">La vérification envoie un court message témoin et consomme votre forfait ChatGPT. Les limites de ce forfait s’appliquent.</p>
      <div className="connection-actions">
        {connectionBusy ? <button className="secondary" type="button" onClick={() => void connectionAction('cancel')} disabled={connectionPending || ['stopping', 'closing'].includes(connection.status)}><Icon name="close" />Annuler la connexion</button> : <>
          {connection.accountStored && <button className={connection.status === 'verified' ? 'connection-check' : 'primary'} type="button" onClick={() => void connectionAction('verify')} disabled={connectionPending || connectionBlocked || connection.status === 'unknown'}><Icon name="refresh" />Vérifier la connexion</button>}
          {!connectionBlocked && <button className={connection.accountStored ? 'connection-reconnect' : 'primary'} type="button" onClick={() => void connectionAction('connect')} disabled={connectionPending || connection.status === 'unknown'}><Icon name="external" />{connection.accountStored ? 'Reconnecter avec ChatGPT' : 'Continuer avec ChatGPT'}</button>}
          {(connection.accountStored || connection.errorCode === 'VAULT_UNREADABLE') && <button className="connection-disconnect" type="button" onClick={() => void connectionAction('disconnect')} disabled={connectionPending}><Icon name="logout" />Déconnecter localement</button>}
        </>}
      </div>
      <div className="connection-scope"><p>Ce contrôle vérifie la connexion locale au forfait. Une session BMad se lance depuis un projet, après qualification de ses fichiers. Vos brouillons attendent toujours un envoi explicite.</p><button className="text-button" type="button" onClick={() => void connectionAction('manageUsage')} disabled={connectionPending}>Gérer l’usage dans ChatGPT</button></div>
    </section>}
    <div className="app-body">
    <aside className="sidebar" aria-label="Navigation principale" onMouseLeave={() => setTooltipsDismissed(false)} onFocusCapture={() => setTooltipsDismissed(false)}>
      <div className="brand"><span className="brand-label">{fr.app}</span></div>
      <nav id="project-navigation" aria-label="Projets">{navigation}</nav>
      <p className="sidebar-bottom nav-label">Données locales<br />Français · thème {appearance.theme === 'dark' ? 'sombre' : 'clair'}</p>
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
              <p className="context-note">{conversation?.context.initiativeId ? 'Initiative capturée : ' + conversation.context.initiativeId : 'Initiative non identifiée'} · pilotes locaux Mary et Forge</p>
              <div className="project-tabs" role="tablist" aria-label="Vues du projet">{(['parcours', 'conversation'] as const).map((item) => <button key={item} id={'tab-' + item} type="button" role="tab" aria-selected={tab === item} aria-controls={'panel-' + item} tabIndex={tab === item ? 0 : -1} onClick={() => setTab(item)} onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = item === 'parcours' ? 'conversation' : 'parcours'; const selected = event.key === 'Home' ? 'parcours' : event.key === 'End' ? 'conversation' : next; setTab(selected); document.getElementById('tab-' + selected)?.focus() } }}>{item === 'parcours' ? 'Parcours' : 'Conversation'}</button>)}</div>
              <section id={'panel-' + tab} role="tabpanel" aria-labelledby={'tab-' + tab}>
                {tab === 'parcours' && <div className="recommendation"><h2>Discuter de votre projet avec Mary</h2><p>Mary, l’analyste BMad installée dans ce dossier, peut vous accueillir puis échanger librement avec vous.</p><p className="reason"><strong>Pourquoi maintenant ?</strong> Un premier échange permet de préciser votre idée avant de choisir un workflow.</p><button className="secondary" onClick={() => { setTab('conversation'); setTimeout(() => document.getElementById('mary-launch')?.focus(), 0) }}><Icon name="message" />Préparer le dialogue</button></div>}
                <section className="forge-launch" aria-labelledby="forge-title">
                  <div className="dialogue-heading"><h2 id="forge-title">Mettre une idée à l’épreuve</h2>{dialogueHere&&dialogue.invocation==='$bmad-forge-idea'&&<span className="badge" role="status">Forge · {fr.dialogueStatus[dialogue.status]}</span>}</div>
                  <p>Forge confronte une nouvelle idée à plusieurs points de vue, puis conserve un journal et un rapport. Chaque tour utilise votre forfait ChatGPT.</p>
                  <button className="secondary" type="button" aria-expanded={forgePreparation} aria-controls="forge-preparation" onClick={()=>setForgePreparation(v=>!v)}>Préparer Forge</button>
                  {forgePreparation&&<div id="forge-preparation" className="forge-preparation">
                    <p><code>$bmad-forge-idea</code> · Forge natif installé · Codex</p>
                    <dl><dt>Projet destinataire</dt><dd>{project.name} · <code>{project.rootPath}</code></dd><dt>Effets autorisés</dt><dd>Une nouvelle session <code>forge-{'{slug}'}</code> dans la sortie BMad résolue de ce projet. Journal natif et HTML obligatoires ; Markdown supplémentaire si l’idée est renforcée (HARDENED).</dd><dt>Sortie vérifiée</dt><dd>{dialogueHere&&dialogue.invocation==='$bmad-forge-idea'&&dialogue.profile?.outputBase?<code>{dialogue.profile.outputBase}</code>:'Vérifiez le profil pour connaître le chemin exact.'}</dd></dl>
                    <p className="small muted">Le lancement transmet uniquement l’invocation, jamais votre brouillon. Codex reste en lecture seule ; seules les commandes de cette session peuvent écrire. Hooks, reprise, autres workflows et interactions structurées indisponibles bloquent l’action. Le HTML reste un fichier, sans exécution dans Madness.</p>
                    <div className="dialogue-actions"><button className="secondary" type="button" onClick={()=>void dialogueAction('qualifyForge')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'||dialogueBridgeError}>Vérifier le profil Forge</button><button id="forge-launch" className="primary" type="button" aria-describedby={forgePrerequisite?'forge-launch-prerequisite':undefined} onClick={()=>void dialogueAction('launchForge')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status!=='qualified'||!dialogueHere||dialogue.invocation!=='$bmad-forge-idea'||!connection.accountStored||connection.needsPlanAcknowledgement||connectionBusy||dialogueBridgeError}>Lancer Forge avec Codex</button></div>
                    {forgePrerequisite&&<p id="forge-launch-prerequisite" className="small">{fr.dialoguePrerequisites[forgePrerequisite]}{' '}{forgePrerequisite==='account'?<button className="text-button" type="button" onClick={()=>setConnectionOpen(true)}>Ouvrir le panneau Codex</button>:<button className="text-button" type="button" onClick={()=>planConfirmation.current?.showModal()}>Relire le rappel du forfait</button>}</p>}
                  </div>}
                </section>
                <div className="dialogue-launch" aria-labelledby="mary-title">
                  <div className="dialogue-heading"><h2 id="mary-title">Mary <span>Analyste BMad · Codex</span></h2>{dialogueHere&&dialogue.invocation==='$bmad-agent-analyst' && <span className="badge" role="status">Mary · {fr.dialogueStatus[dialogue.status]}</span>}</div>
                  <p><code>$bmad-agent-analyst</code></p>
                  <p>Le lancement vérifie les vrais fichiers BMad puis demande l’accueil de Mary. Chaque tour utilise votre forfait ChatGPT. Le projet reste en lecture seule.</p>
                  <p className="small muted">Pilote de discussion libre. Les workflows du menu, les écritures et les approbations ne sont pas pris en charge.</p>
                  <div className="dialogue-actions">
                    <button id="mary-launch" className="primary" type="button" onClick={() => void dialogueAction('launch')} disabled={dialoguePending || dialogueBusy || sessionPresent || dialogue.status === 'unknown' || !connection.accountStored || connection.needsPlanAcknowledgement || connectionBusy || dialogueBridgeError}><Icon name="message" />Lancer Mary avec Codex</button>
                    <button className="secondary" type="button" onClick={() => void dialogueAction('qualify')} disabled={dialoguePending || dialogueBusy || sessionPresent || dialogue.status === 'unknown' || dialogueBridgeError}>Vérifier ce projet</button>
                  </div>
                  {!connection.accountStored && <p className="small">{fr.dialoguePrerequisites.account}</p>}
                  {connection.needsPlanAcknowledgement && <p className="small">{fr.dialoguePrerequisites.plan}</p>}
                </div>
                {sessionFeedback&&<section className="dialogue-session" aria-labelledby="dialogue-session-title">
                  <h2 id="dialogue-session-title">Session {dialogue.context.projectId?recipient:'BMad'} · Codex</h2>
                  {(sessionPresent||dialogueBusy)&&<div className="dialogue-actions"><button className="secondary" type="button" onClick={()=>void dialogueAction('stop')} disabled={dialoguePending||dialogue.status==='stopping'}><Icon name="close"/>Arrêter Codex</button></div>}
                  {!dialogueHere && sessionPresent && <p className="small">{recipient} est active dans {state.projects.find(p => p.id === dialogue.context.projectId)?.name ?? 'un autre projet'}. Retrouvez ce projet pour lui répondre, ou arrêtez Codex.</p>}
                  {(dialogueHere || dialogue.status === 'unknown') && dialogue.errorCode && <div className="connection-error" role="alert"><p>{fr.dialogueErrors[dialogue.errorCode]}</p>{!dialogueHere && dialogue.context.projectId && <button className="text-button" type="button" onClick={() => select(dialogue.context.projectId!)} disabled={pending}>Retrouver {state.projects.find(p => p.id === dialogue.context.projectId)?.name ?? 'le projet de la session'}</button>}</div>}
                  {dialogueBridgeError && <p className="connection-error" role="alert">Le pont du dialogue ne répond pas. Votre brouillon est conservé ; redémarrez Madness après avoir vérifié l’arrêt de Codex.</p>}
                  {dialogueHere && dialogue.profile && <details className="dialogue-proof"><summary>Profil BMad vérifié</summary><p><code>{dialogue.profile.skillPath}</code></p><p className="small">Empreinte : <code>{dialogue.profile.fingerprint}</code></p></details>}
                </section>}
                {workflow&&<WorkflowResult key={workflow.conversationId} workflow={workflow} onCopy={copyWorkflow}/>}
                {tab === 'conversation' && (conversation ? <div className="conversation-history" aria-label="Échanges BMad">
                  {!canReply && !dialogueBusy && <p className="history-note">Historique conservé. Aucun moteur n’est relancé. Un lancement explicite ouvre une nouvelle conversation ; la reprise Forge est indisponible.</p>}
                  {projectConversations.length > 1 && <details className="previous-conversations"><summary>Conversations précédentes ({projectConversations.length - 1})</summary>{projectConversations.filter(c => c.id !== conversation.id).map(c => <section key={c.id} aria-label="Conversation historique">{c.messages.map(m => <article key={m.id} className={'dialogue-message ' + m.role}><h3>{m.role === 'user' ? 'Vous' : conversationAgent(c.id)}</h3><div className="message-text">{m.text}</div></article>)}{dialogue.workflows.filter(w=>w.conversationId===c.id).map(w=><WorkflowResult key={w.conversationId} workflow={w} onCopy={copyWorkflow}/>)}</section>)}</details>}
                  {conversation.messages.map(m => <article key={m.id} className={'dialogue-message ' + m.role}><h3>{m.role === 'user' ? 'Vous' : conversationAgent(conversation.id)}</h3><div className="message-text">{m.text}</div></article>)}
                  {dialogueHere && <p className="turn-status" role="status">{recipient} · {fr.dialogueStatus[dialogue.status]}{dialogue.status === 'running' && (dialogue.acknowledged ? ' · envoi acquitté et enregistré' : ' · accusé d’envoi attendu')}{dialogue.status === 'ready' && ' · tour terminé, prochaine action : votre réponse. La fin du tour ne valide aucun livrable.'}</p>}
                </div> : <div className="conversation-empty"><h2>Aucun échange enregistré</h2><p>Un lancement explicite ouvre une session sans envoyer votre brouillon.</p></div>)}
                {dialogueHere && dialogue.activities.length > 0 && <details className="dialogue-activity"><summary>Activité du dialogue ({dialogue.activities.length})</summary><ol>{dialogue.activities.map((entry, index) => <li key={index}>{entry}</li>)}</ol></details>}
                <form className="composer" onSubmit={(event) => { event.preventDefault(); const projectId = project.id; const value = text; void run(() => window.madness.saveDraft(projectId, value), () => setNotice(fr.saved)) }}>
                  <label htmlFor="draft">{canReply || dialogueHere && sessionPresent ? 'Votre réponse à '+recipient : 'Brouillon pour ' + project.name}</label>
                  <textarea id="draft" value={text} onChange={(event) => setTexts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={MAX_DRAFT_LENGTH} aria-describedby="draft-status draft-limit" placeholder="Notez ce que vous souhaitez reprendre dans ce projet…" />
                  <div className="composer-bottom"><p id="draft-status">{dirty ? fr.unsaved : saved ? fr.saved : fr.noDraft}</p><div className="composer-actions"><button className="secondary" type="submit" disabled={pending || !dirty}>{pending ? fr.saving : fr.save}</button>{dialogueHere && sessionPresent && <button className="primary" type="button" onClick={() => void sendToMary()} disabled={!canReply || dialoguePending || !text.trim()}><Icon name="arrow" />Envoyer à {recipient}</button>}</div></div>
                  <p className="small muted" id="draft-limit">{canReply ? 'Seul « Envoyer à '+recipient+' » transmet ce texte. Le brouillon est enregistré avant l’envoi et reste disponible.' : 'Saisie conservée localement · aucun envoi automatique'} · 100 000 caractères maximum</p>
                </form>
              </section>
            </>}
            {preferenceUnsaved && <p className="preference-note">Le choix de navigation s’applique à cette session ; sa sauvegarde n’est pas confirmée.</p>}
            {appearance.warning && <p className="appearance-warning" role="status" aria-live="polite">{appearance.warning === 'read-failed' ? 'La préférence de thème ne peut pas être lue. Le thème sombre est utilisé ; le fichier existant est conservé.' : 'Le thème choisi s’applique à cette session ; sa sauvegarde n’est pas confirmée. Le fichier existant est conservé.'}</p>}
            {appearanceBridgeError && <p className="appearance-warning" role="status" aria-live="polite">{appearanceBridgeError === 'read' ? 'Le thème n’a pas pu être restauré. Réessayez avec la commande de thème ; votre contexte reste disponible.' : 'Le thème n’a pas pu être changé. Réessayez ; votre contexte et votre saisie sont conservés.'}</p>}
            <p className="status-line" role="status" aria-live="polite">{notice}</p>
          </div>
        </main>
        {page === 'project' && project && <aside className="context-panel" aria-label="Contexte du projet"><h2>Contexte du projet</h2><p>Source : dossier choisi via Windows.</p><dl><dt>Dossier canonique</dt><dd><code>{project.rootPath}</code></dd><dt>Initiative capturée</dt><dd>{conversation?.context.initiativeId ?? 'Non identifiée'}</dd><dt>Conservation</dt><dd>Échanges, observations et brouillon dans les données locales de Madness.</dd><dt>Activité</dt><dd>{dialogueHere ? fr.dialogueStatus[dialogue.status] : 'Aucun agent actif dans ce projet'}</dd><dt>Fournisseur</dt><dd>Codex · connexion propre à Madness</dd><dt>Fichiers du projet</dt><dd>{workflow?'Écritures bornées à la nouvelle session Forge capturée.':'Mary en lecture seule ; Forge exige une préparation explicite.'}</dd></dl><p className="small">Pilote local ; la distribution et les gates historiques restent à qualifier.</p></aside>}
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
