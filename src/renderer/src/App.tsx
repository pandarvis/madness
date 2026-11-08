import {InitializationEntryPoint,InitializationPanel,useInitialization} from './InitializationPanel.tsx'
import type {InitializationArrival} from './InitializationPanel.tsx'
import {formatNumber,formatCount} from './locale-format.ts'
import {presentProductText} from './product-copy.ts'
import {useLocale,useLocalText,LanguageControl} from './Locale.tsx'
import {MetricsContext,useUsMetrics,useStoryChoices} from './UsMetrics.tsx'
import {CatalogLaunchPanel,CatalogOrigin,useCatalogLaunch} from './CatalogLaunchPanel.tsx'
import type {CatalogPreparation} from '../../contracts/bmad-catalog-launch.ts'
import {ProjectLibrary} from './ProjectLibrary.tsx'
import {projectLibrary} from '../../core/project-library.ts'
import {consultationKey,navigationCurrent} from './consultation-navigation.ts'
import type {ConsultationPosition,WorkTab} from './consultation-navigation.ts'
import {GraphPanel,useGraph,useGraphPreparationStop} from './GraphPanel.tsx'
import type {GraphView} from './GraphPanel.tsx'
import {FilePreview,FilesContext,restoreFileConsultationFocus,useProjectFiles} from './FilePreview.tsx'
import type {FileConsultation} from './FilePreview.tsx'
import {CatalogPanel,useBmadCatalog} from './CatalogPanel.tsx'
import type {CatalogView} from './CatalogPanel.tsx'
import {InitiativeSelector,InitiativeContext,useBmadContext} from './InitiativeSelector.tsx'
import {ProjectResume,useBmadProgress} from './ProjectResume.tsx'
import {HelpPanel,HelpReceiptPanel,useBmadHelp} from './HelpPanel.tsx'
import {agentPresentation} from './agentPresentation.ts'
import {AgentPortrait} from './AgentPortrait.tsx'
import {AgentInfoPanel} from './AgentInfoPanel.tsx'
import madnessMark from '../../../resources/branding/madness-64.png'
import { WindowControls } from './WindowControls.tsx'
import type {AgentConsultation} from './AgentInfoPanel.tsx'
import {NetworkHelp} from './NetworkHelp.tsx'
import {WorkOverview} from './WorkOverview.tsx'
import {projectWorkOverview,sameContext} from '../../core/work-overview.ts'
import type {OverviewTarget} from '../../core/work-overview.ts'
import {RecoveryPanel} from './RecoveryPanel.tsx'
import {ApprovalPanel} from './ApprovalPanel.tsx'
import type {ApprovalRecord,ApprovalDecision,DialogueMode} from '../../contracts/approvals.ts'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Conversation, Reply } from '../../contracts/index.ts'
import { MAX_DRAFT_LENGTH } from '../../contracts/index.ts'
import { fr,metricsLabels } from './strings.ts'
import { initialConnectionState } from '../../contracts/connection.ts'
import type { ConnectionState, ConnectionBridge } from '../../contracts/connection.ts'
import { TopbarIcon } from './TopbarIcon.tsx'
import { ProviderIsland, readNextProvider, saveNextProvider, type ProviderId } from './ProviderIsland.tsx'
import { initialDialogueState } from '../../contracts/dialogue.ts'
import type { DialogueMessage, DialogueState, WorkflowRecord } from '../../contracts/dialogue.ts'
import type { AppearanceState } from '../../contracts/appearance.ts'
import {QuestionPanel} from './QuestionPanel.tsx'
import type {QuestionRecord,QuestionValues} from '../../contracts/questions.ts'
const questionRecipient=(question:QuestionRecord,unknownAgent:string):string=>question.identity.kind==='attested'?question.identity.name:unknownAgent

function MessageArticle({message,projection,providerId,onConsult}:{message:Conversation['messages'][number];projection?:DialogueMessage;providerId:string|null;onConsult:(message:DialogueMessage,trigger:HTMLButtonElement)=>void}):ReactNode {
 const {words:fr,ui,language}=useLocale()

  const identity=projection?.identity
  const agent=agentPresentation(identity,language)
  const name=identity?.kind==='attested'?identity.name:fr.conversation.unknownAgent
  const phase=projection?.phase==='streaming'?fr.conversation.streaming:projection?.phase==='complete'?fr.conversation.complete:projection?.phase==='interrupted'?fr.conversation.partial:fr.conversation.unknownPhase
  const storage=projection?.storage==='pending'||projection?.storage==='failed'?fr.conversation.notStored:fr.conversation.stored
  return <article data-message-id={message.id} className={'dialogue-message '+message.role}>
    <div className="message-author">{message.role==='assistant'&&(agent&&projection?<button className="agent-portrait-trigger" type="button" aria-label={ui.details_for+agent.name} onClick={event=>onConsult(projection,event.currentTarget)}><AgentPortrait agent={agent}/></button>:<AgentPortrait/>)}<h3>{message.role==='user'?ui.you:providerId==='claude-code'?'Claude Code':name+' · Codex'}</h3>{message.role==='assistant'&&agent&&projection&&<button className="agent-info-link text-button" type="button" aria-label={ui.details_for+agent.name+' · message '+message.id} onClick={event=>onConsult(projection,event.currentTarget)}>{ui.agent_details}</button>}</div>
    {message.role==='assistant'&&<p className={'message-state '+(projection?.storage==='failed'?'message-storage-failed':'')}>{projection?phase+' · '+storage:fr.conversation.historical}</p>}
    <div className="message-text">{message.text}</div>
    {message.role==='assistant'&&identity?.kind==='attested'&&<p className="message-provenance">{ui.attested_identity_source} <code>{identity.source}</code></p>}
  </article>
}
type ReadingPosition={top:number;follow:boolean}
function ConversationMessages({conversation,projections,positions,onConsult}:{conversation:Conversation;projections:DialogueMessage[];positions:Map<string,ReadingPosition>;onConsult:(message:DialogueMessage,trigger:HTMLButtonElement)=>void}):ReactNode {
 const {ui}=useLocale()

  const container=useRef<HTMLDivElement>(null),reading=useRef<ReadingPosition>(positions.get(conversation.id)??{top:0,follow:true})
  const merged=conversation.messages.map(m=>({...m})),byId=new Map(merged.map((m,i)=>[m.id,i]))
  const current=projections.filter(m=>sameContext(m.context,conversation.context)),metadata=new Map(current.map(m=>[m.id,m]))
  for(const message of current){const index=byId.get(message.id),value={id:message.id,role:'assistant' as const,text:message.text};if(index===undefined){byId.set(message.id,merged.length);merged.push(value)}else merged[index]=value}
  useLayoutEffect(()=>{
    const element=container.current;if(!element)return
    element.scrollTop=reading.current.follow?element.scrollHeight:reading.current.top
    reading.current.top=element.scrollTop
  })
  useLayoutEffect(()=>()=>{positions.set(conversation.id,{...reading.current})},[conversation.id,positions])
  return <div className="conversation-messages" ref={container} tabIndex={0} aria-label={ui.conversation_messages} onScroll={event=>{const e=event.currentTarget;reading.current={top:e.scrollTop,follow:e.scrollHeight-e.clientHeight-e.scrollTop<=24};positions.set(conversation.id,{...reading.current})}}>
    {merged.map(message=><MessageArticle key={message.id} message={message} projection={metadata.get(message.id)} providerId={conversation.context.providerId} onConsult={onConsult}/>)}
  </div>
}

function ProjectMark({ name }: { name: string }): ReactNode {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? []
  const letters = words.length > 1 ? words.slice(0, 2).map(word => Array.from(word)[0]).join('') : Array.from(words[0] ?? '').slice(0, Array.from(words[0] ?? '').length <= 3 ? 3 : 2).join('')
  return <span className="project-mark" aria-hidden="true"><span>{letters ? letters.toUpperCase() : <Icon name="folder" />}</span></span>
}

function Icon({ name }: { name: 'home' | 'folder' | 'panel' | 'close' | 'message' | 'arrow' | 'refresh' | 'external' | 'logout' | 'copy' | 'sun' | 'moon' | 'settings' }): ReactNode {
  const paths = { settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.5 4-.1-1.3 2-1.6-2-3.4-2.4.9a8 8 0 0 0-2.2-1.3L15.4 3h-3.8l-.4 2.3A8 8 0 0 0 9 6.6l-2.4-.9-2 3.4 2 1.6L6.5 12l.1 1.3-2 1.6 2 3.4 2.4-.9a8 8 0 0 0 2.2 1.3l.4 2.3h3.8l.4-2.3a8 8 0 0 0 2.2-1.3l2.4.9 2-3.4-2-1.6Z', home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z', folder: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z', panel: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 3v18m6-13-3 4 3 4', close: 'm6 6 12 12M6 18 18 6', message: 'M4 4h16v12H9l-5 4V4Z', arrow: 'M5 12h14m-5-5 5 5-5 5', refresh: 'M20 7v5h-5M20 12a8 8 0 1 0-2 5', external: 'M14 4h6v6m0-6-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5', logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4m4-12 4 4-4 4m-4-4h12',copy:'M9 9h12v12H9V9ZM5 15H3V3h12v2',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M20.5 13.1A8.5 8.5 0 0 1 10.9 3.5a8.5 8.5 0 1 0 9.6 9.6Z' }
  const cutPaths = { home: 'M3 10 12 3l9 7v9l-2 2h-5v-7h-4v7H5l-2-2Z', folder: 'M3 8V4h7l3 3h8v12l-2 2H3Zm0 2h18', panel: 'M5 3h14l2 2v14l-2 2H3V5Zm4 0v18m7-13-4 4 4 4', sun: 'M16 9v6l-4 2-4-2V9l4-2ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2', moon: 'M20 14a8 8 0 0 1-10-10l-5 3-2 5 2 6 5 3 6-1Z' }
  const face = { home: 'M3 10 12 3l9 7v9l-2 2h-5v-7h-4v7H5l-2-2Z', folder: 'M3 10h18v9l-2 2H3Z', panel: 'M5 3h4v18H3V5Z', sun: 'M16 9v6l-4 2-4-2V9l4-2Z', moon: 'M20 14a8 8 0 0 1-10-10l-5 3-2 5 2 6 5 3 6-1Z' }
  const key = name in cutPaths ? name as keyof typeof cutPaths : null
  return <svg className="workshop-icon" aria-hidden="true" viewBox="0 0 24 24">{key && <path className="icon-face" d={face[key]} />}<path d={key ? cutPaths[key] : paths[name]} /></svg>
}

function WorkflowResult({workflow,onCopy}:{workflow:WorkflowRecord;onCopy:(conversationId:string,target:'invocation'|'workspace')=>Promise<DialogueState>}):ReactNode {
 const {ui,locale,language}=useLocale()

  const [copyNotice,setCopyNotice]=useLocalText<string>('')
  async function copy(target:'invocation'|'workspace'):Promise<void>{
    try{const next=await onCopy(workflow.conversationId,target);setCopyNotice(l=>next.errorCode?l.ui.copy_failed_select_the_displayed_text_to_copy_it_manually:target==='invocation'?l.ui.invocation_copied:l.ui.path_copied)}
    catch{setCopyNotice(l=>l.ui.copy_failed_select_the_displayed_text_to_copy_it_manually)}
  }
  const titleId='workflow-title-'+workflow.conversationId
  return <section className="workflow-observations" aria-labelledby={titleId}>
    <h2 id={titleId}>{ui.observed_forge_result}</h2>
    <p>{workflow.outcome==='open'?ui.workflow_open_or_interrupted_final_result_not_observed:ui.native_closure_observed+workflow.outcome+'.'} {ui.human_acceptance_unknown}</p>
    <p className="small">{ui.context_captured_at} {new Date(workflow.capturedAt).toLocaleString(locale)} · {workflow.context.initiativeId??ui.no_initiative} · {workflow.context.connectionId}</p>
    <p><code>{workflow.invocation}</code> <button className="text-button" type="button" onClick={()=>void copy('invocation')}>{ui.copy_invocation}</button></p>
    <p><code>{workflow.workspace??workflow.outputBase}</code>{workflow.workspace&&<button className="text-button" type="button" onClick={()=>void copy('workspace')}>{ui.copy_path}</button>}</p>
    <p className="small" role="status">{copyNotice}</p>
    <details><summary>{ui.durable_observations}{formatNumber(workflow.observations.length,language)})</summary><p className="small">{ui.these_dated_observations_describe_bytes_reread_at_that_instant_th}</p><ol>{workflow.observations.map((o,i)=><li key={i}>{o.operation} · {o.phase==='observed'?ui.bytes_reread:o.phase==='pending'?ui.operation_announced_awaiting_confirmation:o.phase==='unknown'?ui.unknown_effect:ui.failure} · {new Date(o.at).toLocaleString(locale)}<br/><code>{o.path}</code>{o.sha256&&<><br/><code>SHA-256 {o.sha256}</code> · {o.bytes===null?ui.unknown_2:formatCount(o.bytes,'byte',language)}</>}</li>)}</ol><p className="small">{ui.profile} <code>{workflow.fingerprint}</code><br/>{ui.context} <code>{workflow.contextDigest}</code><br/>{ui.captured_folder} <code>{workflow.rootPath}</code></p></details>
  </section>
}

export function App({ initialAppearance = window.madnessAppearance.initial, appearanceReadFailed = false, onStartupSettled }: { initialAppearance?: AppearanceState; appearanceReadFailed?: boolean; onStartupSettled?: (restored: boolean) => void } = {}): ReactNode {
 const {words:fr,ui,locale,language}=useLocale()

  const [graphState,acceptGraph]=useGraph()
  const graphPreparationStop=useGraphPreparationStop(graphState.preparing)
  const graphViews=useRef(new Map<string,GraphView>())
  const graphReturns=useRef(new Map<string,{projectId:string;rootPath:string;tab:'parcours'|'conversation'|'catalogue';initiative:string|null;conversationId:string|null;trigger:HTMLElement|null;inputId:string|null;start:number|null;end:number|null;top:number}>())
  const workFocus=useRef<HTMLElement|null>(null)
  const [filesState,acceptFiles]=useProjectFiles()
  const [fileViews,setFileViews]=useState<Record<string,FileConsultation>>({})
  const [helpState,acceptHelp]=useBmadHelp()
  const [progressState,acceptProgress]=useBmadProgress()
  const [catalogState,acceptCatalog]=useBmadCatalog()
  const [catalogLaunch,acceptCatalogLaunch]=useCatalogLaunch()
  const [catalogPreparation,setCatalogPreparation]=useState<CatalogPreparation|null>(null)
  const catalogLaunchLock=useRef(false)
  const catalogViews=useRef(new Map<string,CatalogView>())
  const [initiativeConflict,setInitiativeConflict]=useState(false)
  const [initialRead, setInitialRead] = useState<boolean | null>(null)
  useLayoutEffect(() => {
    if (initialRead !== null) onStartupSettled?.(initialRead)
  }, [initialRead, onStartupSettled])
  const [state, setState] = useState<AppState | null>(null)
  const [displayedProjectId,setDisplayedProjectId]=useState<string|null>(null)
  const [bmadContext,acceptBmadContext]=useBmadContext(displayedProjectId??undefined)
  const consultations=useRef(new Map<string,ConsultationPosition>())
  const lastWork=useRef<ConsultationPosition|null>(null)
  const [workReturn,setWorkReturn]=useState<ConsultationPosition|null>(null)
  const [page, setPage] = useState<'home' | 'project'>('home')
  const navigationToken=useRef(0)
  const pendingLaunch=useRef<{token:number;projectId:string;previousConversationId:string|null;sequence:number;requestId?:string;catalog?:boolean;refreshRequested?:boolean}|null>(null)
  const [conversationSelections,setConversationSelections]=useState<Record<string,string>>({})
  const [focusTarget,setFocusTarget]=useState<{token:number;target:OverviewTarget}|null>(null)
  const [overviewClock,setOverviewClock]=useState(0)
  const [tab, setTab] = useState<'parcours' | 'conversation' | 'catalogue' | 'graphe'>('parcours')
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [collapsed, setCollapsed] = useState(false)
  const [preferenceUnsaved, setPreferenceUnsaved] = useState(false)
  const [appearance, setAppearance] = useState<AppearanceState>(initialAppearance)
  const [appearancePending, setAppearancePending] = useState(false)
  const [appearanceBridgeError, setAppearanceBridgeError] = useState<'read' | 'change' | null>(appearanceReadFailed ? 'read' : null)
  const appearanceBusy = useRef(false)
  const themeLabel = appearance.theme === 'dark' ? ui.switch_to_light_theme : ui.switch_to_dark_theme
  useEffect(() => { document.documentElement.dataset.theme = 'dark' }, [])
  async function toggleTheme(): Promise<void> {
    if (appearanceBusy.current) return
    const theme = appearance.theme === 'dark' ? 'light' : 'dark'
    appearanceBusy.current = true; setAppearancePending(true)
    try { setAppearance(await window.madnessAppearance.setTheme(theme)); setAppearanceBridgeError(null) }
    catch { setAppearanceBridgeError('change') }
    finally { appearanceBusy.current = false; setAppearancePending(false) }
  }
  const [error, setError] = useLocalText<string | null>(null)
  const [notice, setNotice] = useLocalText<string>(l=>l.ui.reading_local_context)
  const [pending, setPending] = useState(false)
  const [tooltipsDismissed, setTooltipsDismissed] = useState(false)
  const drawer = useRef<HTMLDialogElement>(null)
  const drawerTrigger = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [connection, setConnection] = useState<ConnectionState>(initialConnectionState)
  const [connectionOpen, setConnectionOpen] = useState(false)
  const [nextProvider, setNextProvider] = useState<ProviderId>(readNextProvider)
  const [devMode, setDevMode] = useState(()=>{try{return localStorage.getItem('madness.dev-mode')==='1'}catch{return false}})
  function changeDevMode(on:boolean):void{setDevMode(on);try{if(on)localStorage.setItem('madness.dev-mode','1');else localStorage.removeItem('madness.dev-mode')}catch{/* session-only choice */}}
  function replaySplash():void{try{sessionStorage.setItem('madness.replay-splash','1')}catch{return}void (window as unknown as {madnessWindow?:{command(action:'reload'):Promise<boolean>}}).madnessWindow?.command('reload')}
  const [connectionPending, setConnectionPending] = useState(false)
  const [connectionBridgeError, setConnectionBridgeError] = useState(false)
  const connectionTrigger = useRef<HTMLButtonElement>(null)
  const connectionPanel = useRef<HTMLElement>(null)
  const connectionHeading = useRef<HTMLHeadingElement>(null)
  const planConfirmation = useRef<HTMLDialogElement>(null)
  const planConfirmationDismissed = useRef(false)
  const connectionBusy = ['authorizing', 'verifying', 'stopping', 'closing'].includes(connection.status)
  const connectionBlocked = ['ENCRYPTION_UNAVAILABLE', 'VAULT_UNREADABLE', 'REGISTRATION_INVALID'].includes(connection.errorCode ?? '')
  const connectionLabel = ui.codex_connection_2 + fr.connectionStatus[connection.status]
  const project = state?.projects.find((p) => p.id === displayedProjectId)
  const initiativeContext=bmadContext.projects.find(p=>p.projectId===project?.id)
  const catalogSelectionChanged=!!catalogPreparation&&(initiativeContext?.selection?.revision??null)!==catalogPreparation.selectionRevision
  const fileScope=tab==='graphe'?JSON.stringify([project?.id,project?.rootPath,'corpus']):JSON.stringify([project?.id,project?.rootPath,initiativeContext?.selection?.rootIdentity,initiativeContext?.selection?.initiativeId])
  const fileConsultation=page==='project'?fileViews[fileScope]:undefined
  const fileScopeRef=useRef(fileScope);fileScopeRef.current=fileScope
  function closeFile(restore=true):void{const current=fileViews[fileScope];setFileViews(previous=>{const next={...previous};delete next[fileScope];return next});if(restore&&current){const scope=fileScope;requestAnimationFrame(()=>{if(fileScopeRef.current!==scope)return;if(!restoreFileConsultationFocus(current,heading.current))setNotice(l=>l.ui.returned_to_result_exact_trigger_unavailable)})}}
  function openFile(value:FileConsultation):void{closeAgentInfo(false);setConnectionOpen(false);setContextOpen(false);setFileViews(previous=>({...Object.fromEntries(Object.entries(previous).slice(-31)),[fileScope]:value}))}

  const currentProjectId=useRef<string|undefined>(undefined),dialogueSequence=useRef(-1)
  currentProjectId.current=page==='project'?project?.id:undefined
  useEffect(()=>{setInitiativeConflict(false)},[project?.id])
  const saved = state?.drafts.find((d) => d.projectId === project?.id)
  const text = project ? texts[project.id] ?? saved?.text ?? '' : ''
  const dirty = text !== (saved?.text ?? '')
  const [dialogue, setDialogue] = useState<DialogueState>(initialDialogueState)
  const [dialoguePending, setDialoguePending] = useState(false)
  const [dialogueBridgeError, setDialogueBridgeError] = useState(false)
  const [maryMode,setMaryMode]=useState<DialogueMode>('read-only')
  const [approvalDrafts,setApprovalDrafts]=useState<Record<string,string>>({})
  const [approvalFailures,setApprovalFailures]=useState<Record<string,boolean>>({})
  const approvalWrites=useRef(new Map<string,Promise<void>>())
  const sendingApprovals=useRef(new Set<string>())
  const [approvalSending,setApprovalSending]=useState<Record<string,boolean>>({})
  const [questionDrafts,setQuestionDrafts]=useState<Record<string,QuestionValues>>({})
  const [questionFailures,setQuestionFailures]=useState<Record<string,boolean>>({})
  const sendingQuestions=useRef(new Set<string>())
  const readingPositions=useRef(new Map<string,ReadingPosition>())
  const requestFocus=useRef<{kind:'question'|'approval';id:string;element:HTMLElement;live:boolean;respondable:boolean}|null>(null)
  const [forgePreparation,setForgePreparation]=useState(false)
  const [preparationFocus,setPreparationFocus]=useState<{token:number;projectId:string}|null>(null)
  const [contextOpen,setContextOpen]=useState(false)
  const [initializationArrival,setInitializationArrival]=useState<(InitializationArrival&{trigger:HTMLElement;tab:typeof tab})|null>(null)
  const initializationOpen=page==='project'&&!!initializationArrival&&
    initializationArrival.projectId===project?.id&&initializationArrival.tab===tab
  const [initializationState,acceptInitialization]=useInitialization(page==='project'?project?.id:undefined)
  // Ask once per project and after each initialization outcome whether BMad is missing, so the beginner sees one clear first step.
  const [bmadAbsent,setBmadAbsent]=useState<Record<string,boolean>>({})
  const initializationOutcome=initializationState?.operations.map(op=>op.attemptId+':'+op.result.outcome).join('|')??''
  useEffect(()=>{const id=page==='project'?project?.id:undefined;const probe=(window as unknown as {madnessProjectProbe?:{bmadPresent(id:string):Promise<boolean|null>}}).madnessProjectProbe;if(!id||!probe)return;let alive=true
    void probe.bmadPresent(id).then(present=>{if(alive)setBmadAbsent(c=>({...c,[id]:present===false}))}).catch(()=>undefined)
    return ()=>{alive=false}},[page,project?.id,initializationOutcome])
  const absentHere=page==='project'&&!!project&&bmadAbsent[project.id]===true&&!initializationState?.operations.some(op=>['preparing','checking','applying','verifying','ready'].includes(op.phase))
  const [agentConsultation,setAgentConsultation]=useState<AgentConsultation|null>(null)
  const agentFocusReturn=useRef<HTMLElement|null>(null)
  const contextTrigger=useRef<HTMLButtonElement>(null)
  const contextHeading=useRef<HTMLHeadingElement>(null)
  const sending = useRef(false)
  const dialogueHere = dialogue.context.projectId === project?.id
  const dialogueBusy = ['qualifying', 'inspecting', 'starting', 'running','waiting-question','waiting-approval', 'stopping'].includes(dialogue.status)
  const sessionPresent = ['starting', 'running','waiting-question','waiting-approval', 'ready', 'stopping'].includes(dialogue.status)
  const projectConversations = state?.conversations.filter(c => c.context.projectId === project?.id) ?? []
  const selectedConversation=conversationSelections[project?.id??'']
  const conversation = selectedConversation!==undefined?projectConversations.find(c=>c.id===selectedConversation):projectConversations.find(c => c.id === dialogue.context.conversationId) ?? projectConversations.at(-1)
  const metrics=useUsMetrics(project?.id)
  const metricScope=JSON.stringify([dialogue.profile?.fingerprint,page,project?.id,project?.rootPath,initiativeContext?.selection,initiativeContext?.observation?.revision,initiativeContext?.freshness,conversation?.context,maryMode,forgePreparation,catalogPreparation?.id,helpState.bundle?.id,helpState.bundle?.revision,progressState.projects.find(p=>p.projectId===project?.id)?.freshness,progressState.projects.find(p=>p.projectId===project?.id)?.snapshot?.coverage])
  const metricChoices=useStoryChoices(metrics.project,metricScope,(key,o)=>{
    const words=metricsLabels[language],observed=initiativeContext?.observation,selected=initiativeContext?.selection,prepared=key==='catalog'?catalogPreparation:null
    // Main's current source authority applies to every operation, including a captured catalogue preparation.
    if(!observed||!selected||initiativeContext?.freshness!=='current'||o.projectId!==project?.id||o.rootPath!==project?.rootPath||observed.rootPath!==o.rootPath||observed.rootIdentity!==o.rootIdentity||selected.initiativeId!==o.initiativeId||selected.rootIdentity!==o.rootIdentity||observed.revision!==o.contextRevision)return words.sourceUnavailable
    if(prepared&&(prepared.captured.observation.rootPath!==o.rootPath||prepared.captured.observation.rootIdentity!==o.rootIdentity))return words.sourceUnavailable
    let target:string|null|undefined
    if(key==='send')target=conversation?.context.projectId===project?.id?conversation.context.initiativeId:undefined
    else if(key.startsWith('adjust-'))target=dialogue.approvals.find(a=>a.id===key.slice(7)&&a.context.projectId===project?.id)?.context.initiativeId
    else if(key==='catalog')target=prepared?.projectId===project?.id?prepared.captured.initiativeId:undefined
    else if(key==='launchHelp')target=helpState.projectId===project?.id&&helpState.status==='ready'&&helpState.freshness==='current'&&helpState.bundle?.nativeReady?helpState.bundle.activeInitiative:undefined
    else if(key==='launch'||key==='launchForge'){
      target=observed?.activeStatus==='valid'?observed.activeInitiative:observed?.activeStatus==='absent'?null:undefined
      if(key==='launchForge'&&target!==undefined&&target!==null&&initiativeContext?.selection?.initiativeId!==target)return words.guardMismatch
    }
    return target===undefined?words.nativeContextUnknown:o.initiativeId===target?null:words.contextMismatch
  })
  const dialogueCurrent=useRef(dialogue);dialogueCurrent.current=dialogue
  const dialogueActionLock=useRef(false)
  const dialogueConversationHere=!!conversation&&sameContext(conversation.context,dialogue.context)
  const overview=state?projectWorkOverview(state,dialogue,connection,Date.now()):null
  const respondable=(kind:'question'|'approval',id:string):boolean=>!!overview?.entries.some(e=>e.target.kind===kind&&e.target.id===id&&e.state==='waiting')
  const currentRequest=(kind:'question'|'approval',id:string):boolean=>!!overview?.entries.some(e=>e.target.kind===kind&&e.target.id===id&&(e.state==='waiting'||e.state==='sending'))
  const conversationQuestions=dialogue.questions.filter(q=>conversation&&sameContext(q.context,conversation.context))
  const conversationApprovals=dialogue.approvals.filter(a=>conversation&&sameContext(a.context,conversation.context))
  const historicalQuestions=conversationQuestions.filter(q=>!currentRequest('question',q.id))
  const historicalApprovals=conversationApprovals.filter(a=>!currentRequest('approval',a.id))
  const nativeAwaiting=dialogueConversationHere&&['waiting-question','waiting-approval'].includes(dialogue.status)
  const claudeSession=dialogue.context.providerId==='claude-code'
  const canReply = dialogueConversationHere && dialogue.status === 'ready'
  const workflow=dialogue.workflows.find(w=>w.conversationId===conversation?.id)
  const recipient=dialogue.invocation==='$bmad'?'BMad':dialogue.invocation==='$bmad-forge-idea'?'Forge':'Mary'
  const activeQuestion=dialogue.questions.find(q=>overview?.entries.some(e=>e.target.kind==='question'&&e.target.id===q.id)&&sameContext(q.context,dialogue.context))
  const activeApproval=dialogue.approvals.find(a=>overview?.entries.some(e=>e.target.kind==='approval'&&e.target.id===a.id)&&sameContext(a.context,dialogue.context))
  const displayedRecipient=activeApproval?(activeApproval.identity.kind==='attested'?activeApproval.identity.name:fr.conversation.unknownAgent):activeQuestion?questionRecipient(activeQuestion,fr.conversation.unknownAgent):recipient
  const displayedDialogueStatus=activeApproval?(activeApproval.status==='sending'?fr.approvals.status.sending:fr.approvals.title):activeQuestion?(activeQuestion.status==='sending'?fr.questions.sending:fr.questions.title):['waiting-question','waiting-approval'].includes(dialogue.status)?fr.overview.requestInactive:fr.dialogueStatus[dialogue.status]
  const forgePrerequisite=!connection.accountStored?'account':connection.needsPlanAcknowledgement?'plan':null
  const sessionFeedback=!!(sessionPresent||dialogueBusy||((dialogueHere||dialogue.status==='unknown')&&dialogue.errorCode)||dialogueBridgeError||(dialogueHere&&dialogue.profile))
  function closeAgentInfo(restoreFocus=true):void {
    agentFocusReturn.current=restoreFocus?agentConsultation?.trigger??null:null
    setAgentConsultation(null)
  }
  useLayoutEffect(()=>{if(agentConsultation||!agentFocusReturn.current)return;const trigger=agentFocusReturn.current;agentFocusReturn.current=null;(trigger.isConnected?trigger:document.getElementById('conversation-heading')??heading.current)?.focus({preventScroll:true})},[agentConsultation])
  function consultAgent(message:DialogueMessage,trigger:HTMLButtonElement):void {
    if(!agentPresentation(message.identity))return
    setConnectionOpen(false);setContextOpen(false)
    closeFile(false)
    setAgentConsultation({message:structuredClone(message),trigger,viewConversationId:conversation?.id??null})
  }
  useEffect(()=>{
    if(!agentConsultation)return
    const source=dialogue.messages.find(message=>message.id===agentConsultation.message.id&&sameContext(message.context,agentConsultation.message.context))
    const identity=agentConsultation.message.identity
    if(page!=='project'||tab!=='conversation'||conversation?.id!==agentConsultation.viewConversationId||project?.id!==agentConsultation.message.context.projectId||!state?.conversations.some(c=>sameContext(c.context,agentConsultation.message.context))||!source||source.identity.kind!=='attested'||identity.kind!=='attested'||source.identity.name!==identity.name||source.identity.source!==identity.source){setNotice(l=>l.ui.details_closed_their_viewing_context_is_no_longer_displayed);closeAgentInfo()}
  },[page,tab,project?.id,conversation?.id,dialogue.messages,state,agentConsultation])
  useEffect(()=>{setForgePreparation(false)},[project?.id])
  useEffect(()=>{setContextOpen(false)},[project?.id,page])
  useEffect(()=>{
    if(!contextOpen)setInitializationArrival(null)
    else if(initializationArrival&&!initializationOpen){setContextOpen(false);setInitializationArrival(null)}
    else if(!initializationArrival)contextHeading.current?.focus()
  },[contextOpen,initializationArrival,initializationOpen])
  useLayoutEffect(()=>{
    if(!preparationFocus||preparationFocus.token!==navigationToken.current)return
    if(page!=='project'||project?.id!==preparationFocus.projectId||tab!=='parcours')return
    const element=document.getElementById('mary-title');if(!element)return
    element.focus();element.scrollIntoView({block:'center'});setPreparationFocus(null)
  })
  useEffect(()=>{
    const launch=pendingLaunch.current;if(!launch)return
    if(dialogue.sequence<=launch.sequence)return
    const completedClaude=dialogue.context.providerId==='claude-code'&&dialogue.status==='stopped'&&dialogue.turn?.phase==='completed'
    if(launch.token!==navigationToken.current||dialogue.errorCode||['error','unknown'].includes(dialogue.status)||dialogue.status==='stopped'&&!completedClaude){pendingLaunch.current=null;return}
    const context=dialogue.context
    if(launch.requestId&&dialogue.turn?.requestId!==launch.requestId)return
    if(launch.catalog&&!catalogLaunch.records.some(r=>r.requestId===launch.requestId&&r.context.conversationId===context.conversationId&&r.transmission==='sent'&&r.storage==='stored'))return
    if(context.projectId!==launch.projectId||!context.conversationId||context.conversationId===launch.previousConversationId||!(completedClaude||dialogue.status==='ready'||dialogue.acknowledged&&['running','waiting-question','waiting-approval'].includes(dialogue.status)))return
    if(!state?.conversations.some(c=>c.id===context.conversationId&&sameContext(c.context,context))){
      if(completedClaude&&!launch.refreshRequested){
        launch.refreshRequested=true
        void window.madness.readState().then(accept).catch(()=>setDialogueBridgeError(true))
      }
      return
    }
    pendingLaunch.current=null
    setConversationSelections(current=>({...current,[launch.projectId]:context.conversationId!}));setTab('conversation');if(launch.requestId)requestAnimationFrame(()=>{if(launch.token===navigationToken.current)document.getElementById('conversation-heading')?.focus()})
  },[dialogue,state,catalogLaunch])
  useEffect(()=>{const now=Date.now(),expiry=[...dialogue.questions,...dialogue.approvals].filter(q=>q.status==='waiting'||q.status==='sending').map(q=>q.expiresAt).filter((v):v is number=>v!==null&&v>now).sort((a,b)=>a-b)[0];if(!expiry)return;const timer=setTimeout(()=>setOverviewClock(v=>v+1),Math.min(2147483647,Math.max(1,expiry-now)));return()=>clearTimeout(timer)},[dialogue,overviewClock])
  useLayoutEffect(()=>{
    if(!focusTarget||focusTarget.token!==navigationToken.current)return
    const target=focusTarget.target
    if(target.context.projectId!==null&&(page!=='project'||project?.id!==target.context.projectId||tab!=='conversation'||target.context.conversationId!==null&&(!conversation||!sameContext(conversation.context,target.context))))return
    const element=target.kind==='question'?document.getElementById(target.id+'-title'):target.kind==='approval'?document.getElementById(target.id+'-title'):target.kind==='recovery'?document.getElementById('recovery-'+target.id):target.kind==='session'?document.getElementById(target.id==='activity'||target.context.projectId!==null&&dialogue.recovery.stop==='clear'?'dialogue-session-title':'overview-session-recovery'):document.getElementById(target.id.startsWith('bmad-receipt-')?target.id:'conversation-heading')
    if(!element){if(target.kind==='question'||target.kind==='approval'){setNotice(l=>l.ui.this_exact_request_is_unavailable_no_substitute_selected);setFocusTarget(null)}return}
    if((target.kind==='question'||target.kind==='approval')&&!overview?.entries.some(e=>e.target.kind===target.kind&&e.target.id===target.id))setNotice(l=>l.words.overview.targetGone)
    let parent=element.parentElement
    while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement}
    element.focus();element.scrollIntoView({block:'center'});setFocusTarget(null)
  })
  function captureRequestFocus(target:EventTarget|null):void{
    if(!(target instanceof HTMLElement)){requestFocus.current=null;return}
    const panel=target.closest<HTMLElement>('[data-question-id],[data-approval-id]')
    if(!panel){requestFocus.current=null;return}
    const kind=panel.dataset.questionId?'question':'approval',id=panel.dataset.questionId??panel.dataset.approvalId!
    requestFocus.current={kind,id,element:target,live:currentRequest(kind,id),respondable:respondable(kind,id)}
  }
  useLayoutEffect(()=>{
    const previous=requestFocus.current;if(!previous)return
    const focused=document.activeElement
    if(focused!==previous.element&&focused!==document.body&&focused!==null){requestFocus.current=null;return}
    const changed=!previous.element.isConnected||previous.element.matches(':disabled')||previous.respondable&&!respondable(previous.kind,previous.id)||previous.live&&!currentRequest(previous.kind,previous.id)
    if(!changed)return
    const target=document.getElementById(previous.id+'-title')??document.getElementById('conversation-heading')
    if(!target){requestFocus.current=null;return}
    let parent=target.parentElement;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement}
    target.focus()
  })

  function accept(reply: Reply): boolean {
    if (!reply.ok) { setError(l=>l.words.errors[reply.error.messageKey]); setNotice(''); return false }
    setState(current => current && current.revision > reply.value.state.revision ? current : reply.value.state)
    setError(null)
    return true
  }
  async function run(operation: () => Promise<Reply>, after?: (reply: Reply) => void): Promise<void> {
    const token=navigationToken.current
    setPending(true)
    try {
      const reply = await operation()
      const accepted=reply.ok?accept(reply):token===navigationToken.current?accept(reply):false
      if (accepted&&token===navigationToken.current) after?.(reply)
    } catch { if(token===navigationToken.current){setError(l=>l.ui.the_local_bridge_does_not_respond_your_input_remains_available_he); setNotice('')} }
    finally { if(token===navigationToken.current)setPending(false) }
  }
  async function load(initial = false): Promise<void> {
    let restored = false
    await run(() => window.madness.readState(), (reply) => {
      if (!reply.ok) return
      restored = true
      setCollapsed(reply.value.state.preferences.navigationCollapsed)
      setDisplayedProjectId(reply.value.state.activeProjectId)
      setPage(reply.value.state.activeProjectId ? 'project' : 'home')
      setNotice(l=>l.ui.local_context_loaded_no_agent_restarted)
    })
    if (initial) setInitialRead(restored)
  }
  useEffect(() => { void load(true) }, [])
  useEffect(() => window.madness.onStateChanged?.(() => { void window.madness.readState().then(accept).catch(() => setError(l=>l.ui.dialogue_context_could_not_be_reread_your_input_remains_available)) }), [])
  function acceptDialogue(next: DialogueState): void { if(next.sequence<dialogueSequence.current)return;dialogueSequence.current=next.sequence;setDialogue(next);const launch=pendingLaunch.current;if(next.errorCode==='CONTEXT_MISMATCH'&&next.status==='error'&&launch&&next.sequence>launch.sequence&&launch.token===navigationToken.current&&launch.projectId===currentProjectId.current&&(next.context.projectId===null||next.context.projectId===launch.projectId)&&(next.invocation==='$bmad'||next.invocation==='$bmad-forge-idea'))setInitiativeConflict(true) }
  function changeApproval(approval:ApprovalRecord,adjustment:string):void{
    const id=approval.id;if(sendingApprovals.current.has(id))return;setApprovalDrafts(current=>({...current,[id]:adjustment}))
    const previous=approvalWrites.current.get(id)??Promise.resolve()
    const saving=previous.catch(()=>{}).then(async()=>{try{const next=await window.madnessDialogue.saveApproval(id,adjustment);acceptDialogue(next);setApprovalFailures(current=>({...current,[id]:!!next.errorCode}))}catch{setApprovalFailures(current=>({...current,[id]:true}))}})
    approvalWrites.current.set(id,saving)
  }
  async function approvalAction(approval:ApprovalRecord,decision?:ApprovalDecision):Promise<void>{
    const id=approval.id;if(sendingApprovals.current.has(id))return;sendingApprovals.current.add(id);setApprovalSending(current=>({...current,[id]:true}))
    try{const captured=approvalDrafts[id]??approval.adjustment;await approvalWrites.current.get(id)
      let next:DialogueState
      if(decision)next=await window.madnessDialogue.decideApproval(id,decision)
      else{const durable=dialogueCurrent.current.approvals.find(a=>a.id===id);if(!durable||durable.adjustment!==captured||durable.storage!=='stored')return
        const chosen=await metricChoices.resolve('adjust-'+id,approval.context.projectId!,approval.context.conversationId,captured,{type:'send-adjustment',approvalId:id})
        next=chosen?await window.madnessDialogue.adjustMeasured(id,chosen.requestId,chosen.choiceRef):await window.madnessDialogue.sendAdjustment(id)
      }
      acceptDialogue(next);setApprovalFailures(current=>({...current,[id]:!!next.errorCode}))}catch(e){if(!(e instanceof Error&&e.message==='METRIC_CHOICE_REFUSED'))setApprovalFailures(current=>({...current,[id]:true}))}finally{sendingApprovals.current.delete(id);setApprovalSending(current=>({...current,[id]:false}))}
  }
  function approvalPanel(a:ApprovalRecord):ReactNode{return <ApprovalPanel key={a.id} approval={a} sendPending={approvalSending[a.id]??false} metricChoice={metricChoices.slot('adjust-'+a.id,dialoguePending||!!approvalSending[a.id])} respondable={respondable('approval',a.id)} adjustment={approvalDrafts[a.id]??a.adjustment} projectName={project?.name??ui.captured_project} compactContext onChange={text=>changeApproval(a,text)} onDecide={decision=>void approvalAction(a,decision)} onSendAdjustment={()=>void approvalAction(a)} canAdjust={dialogueHere&&dialogue.status==='ready'&&sameContext(a.context,dialogue.context)} bridgeFailed={approvalFailures[a.id]??false}/>}
  function changeQuestion(question:QuestionRecord,values:QuestionValues):void{
    const id=question.id;setQuestionDrafts(current=>({...current,[id]:values}))
    void window.madnessDialogue.saveQuestion(id,values).then(next=>{acceptDialogue(next);setQuestionFailures(current=>({...current,[id]:!!next.errorCode}))}).catch(()=>setQuestionFailures(current=>({...current,[id]:true})))
  }
  async function answerQuestion(question:QuestionRecord):Promise<void>{
    if(sendingQuestions.current.has(question.id))return
    sendingQuestions.current.add(question.id)
    const values=structuredClone(questionDrafts[question.id]??question.values)
    try{const next=await window.madnessDialogue.answerQuestion(question.id,values);acceptDialogue(next);setQuestionFailures(current=>({...current,[question.id]:!!next.errorCode}))}
    catch{setQuestionFailures(current=>({...current,[question.id]:true}))}
    finally{sendingQuestions.current.delete(question.id)}
  }
  useEffect(() => {
    if (!window.madnessDialogue) { setDialogueBridgeError(true); return }
    const unsubscribe = window.madnessDialogue.onChanged(acceptDialogue)
    void window.madnessDialogue.read().then(acceptDialogue).catch(() => setDialogueBridgeError(true))
    return unsubscribe
  }, [])
  async function dialogueAction(action: 'qualify' | 'launch' | 'stop' | 'observeStop' | 'qualifyForge' | 'launchForge' | 'launchHelp' | 'launchClaude'): Promise<void> {
    if (dialoguePending||dialogueActionLock.current) return
    const projectId = project?.id
    if (action !== 'stop' && action !== 'observeStop' && !projectId) return
    const codexLaunch=action==='launch'||action==='launchForge'||action==='launchHelp'
    const launching=codexLaunch||action==='launchClaude'
    if((action==='launchForge'||action==='launchHelp')&&initiativeContext?.observation?.activeInitiative&&initiativeContext.selection?.initiativeId!==initiativeContext.observation.activeInitiative){setInitiativeConflict(true);return}
    const launch=launching?{token:++navigationToken.current,projectId:projectId!,previousConversationId:dialogue.context.conversationId,sequence:dialogue.sequence}:null
    if(launch){pendingLaunch.current=launch;setFocusTarget(null)}
    dialogueActionLock.current=true;setDialoguePending(true)
    try { const chosen=codexLaunch?await metricChoices.resolve(action,projectId!,null,null,action==='launch'?{type:'launch',mode:maryMode}:action==='launchForge'?{type:'launch-forge'}:{type:'launch-help'}):null
      if(chosen&&launch)Object.assign(launch,{requestId:chosen.requestId})
      const next = chosen?await window.madnessDialogue.launchMeasured(action==='launchForge'?'launch-forge':action==='launchHelp'?'launch-help':'launch',projectId!,chosen.requestId,chosen.choiceRef,undefined,maryMode):action === 'stop'||action==='observeStop' ? await window.madnessDialogue[action]() : action==='launch'?await window.madnessDialogue.launch(projectId!,maryMode):await window.madnessDialogue[action](projectId!); acceptDialogue(next); setDialogueBridgeError(false) }
    catch(e) { if(launch&&pendingLaunch.current===launch)pendingLaunch.current=null;if(!(e instanceof Error&&e.message==='METRIC_CHOICE_REFUSED'))setDialogueBridgeError(true) }
    finally { dialogueActionLock.current=false;setDialoguePending(false) }
  }
  async function launchFromCatalog():Promise<void>{
    const p=catalogPreparation;if(!p||p.projectId!==project?.id||catalogLaunchLock.current||dialoguePending)return
    catalogLaunchLock.current=true;const launch={token:++navigationToken.current,projectId:p.projectId,previousConversationId:dialogue.context.conversationId,sequence:dialogue.sequence,requestId:p.id,catalog:true};pendingLaunch.current=launch;setDialoguePending(true)
    try{const chosen=await metricChoices.resolve('catalog',p.projectId,null,null,{type:'launch-catalog',preparationId:p.id},p.id);const next=chosen?await window.madnessDialogue.launchMeasured('launch-catalog',p.projectId,p.id,chosen.choiceRef,p.id):await window.madnessDialogue.launchCatalog(p.projectId,p.id);acceptDialogue(next);setDialogueBridgeError(false)}catch(e){if(pendingLaunch.current===launch)pendingLaunch.current=null;if(!(e instanceof Error&&e.message==='METRIC_CHOICE_REFUSED'))setDialogueBridgeError(true)}finally{catalogLaunchLock.current=false;setDialoguePending(false)}
  }
  function cancelCatalog():void{const p=catalogPreparation;if(!p)return;navigationToken.current++;pendingLaunch.current=null;setCatalogPreparation(null);void window.madnessCatalogLaunch.cancel(p.id).then(acceptCatalogLaunch).catch(()=>{});setTab('catalogue')}
  async function inspectApproval(id:string):Promise<void>{if(dialoguePending)return;setDialoguePending(true);try{acceptDialogue(await window.madnessDialogue.inspectApproval(id));setDialogueBridgeError(false)}catch{setDialogueBridgeError(true)}finally{setDialoguePending(false)}}
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
      const chosen=await metricChoices.resolve('send',projectId,conversationId,captured,{type:'send'});acceptDialogue(chosen?await window.madnessDialogue.sendMeasured(projectId,conversationId,captured,chosen.requestId,chosen.choiceRef):await window.madnessDialogue.send(projectId, conversationId, captured)); setDialogueBridgeError(false)
    } catch(e) { if(!(e instanceof Error&&e.message==='METRIC_CHOICE_REFUSED'))setDialogueBridgeError(true) }
    finally { sending.current = false; setDialoguePending(false) }
  }
  function acceptConnection(next: ConnectionState): void { setConnection((current) => next.sequence >= current.sequence ? next : current) }
  async function connectionAction(action: keyof Omit<ConnectionBridge, 'onChanged' | 'openPublicKeys' | 'copyPublicKeys'>): Promise<void> {
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
  function openConnection():void {closeAgentInfo(false);setContextOpen(false);setConnectionOpen(true)}
  useEffect(() => { if (connectionOpen) connectionHeading.current?.focus() }, [connectionOpen])
  useEffect(() => {
    if (onStartupSettled && (initialRead === null || !state)) return
    if (!connection.needsPlanAcknowledgement || !connection.accountStored) planConfirmationDismissed.current = false
    if (connection.needsPlanAcknowledgement && connection.accountStored && !planConfirmationDismissed.current && !['authorizing', 'verifying', 'stopping', 'closing'].includes(connection.status) && !planConfirmation.current?.open) planConfirmation.current?.showModal()
    if (!connection.needsPlanAcknowledgement && planConfirmation.current?.open) { planConfirmation.current.close(); if (connectionOpen) connectionHeading.current?.focus(); else connectionTrigger.current?.focus() }
  }, [connection.needsPlanAcknowledgement, connection.accountStored, connection.status, connectionOpen, initialRead, onStartupSettled, state])
  function closeDrawer(): void { drawer.current?.close(); drawerTrigger.current?.focus() }
  function rootIdentity(id:string,path:string):string|null {const value=bmadContext.projects.find(p=>p.projectId===id)?.observation;return value&&value.rootPath===path?value.rootIdentity:graphState.projects.find(p=>p.scope.projectId===id&&p.scope.rootPath===path)?.scope.rootIdentity??catalogState.projects.find(p=>p.projectId===id&&p.snapshot?.rootPath===path)?.snapshot?.rootIdentity??null}
  function remember():ConsultationPosition|null {
    if(page!=='project'||!project)return null
    const focus=workFocus.current,input=focus instanceof HTMLInputElement||focus instanceof HTMLTextAreaElement?focus:null
    const value:ConsultationPosition={projectId:project.id,rootPath:project.rootPath,rootIdentity:rootIdentity(project.id,project.rootPath),tab,conversationId:conversation?.id??null,conversationContext:conversation?{...conversation.context}:null,inputId:input?.id||null,start:input?.selectionStart??null,end:input?.selectionEnd??null,top:document.getElementById('main')?.scrollTop??0,focus}
    consultations.current.set(consultationKey(project.id,project.rootPath,value.rootIdentity),value);lastWork.current=value;return value
  }
  function restoreView(id:string):void {
    const p=state?.projects.find(p=>p.id===id);if(!p)return
    const identity=rootIdentity(p.id,p.rootPath),key=consultationKey(p.id,p.rootPath,identity)
    const priorKnown=[...consultations.current.keys()].some(k=>{const [pid,path,root]=JSON.parse(k) as [string,string,string|null];return pid===p.id&&path===JSON.parse(key)[1]&&root!==null})
    const value=consultations.current.get(key)??(identity!==null&&!priorKnown?consultations.current.get(consultationKey(p.id,p.rootPath,null)):undefined)
    setDisplayedProjectId(id);setPage('project');setTab(value?.tab??'parcours')
    if(value?.conversationId)setConversationSelections(current=>({...current,[id]:value.conversationId!}))
    const token=navigationToken.current
    requestAnimationFrame(()=>{if(!navigationCurrent({token,projectId:id},navigationToken.current,currentProjectId.current))return;const main=document.getElementById('main');if(main)main.scrollTop=value?.top??0})
  }
  function home(): void { remember();const token=++navigationToken.current;setPending(false);setFocusTarget(null);setPage('home'); closeDrawer(); setTimeout(() => {if(token===navigationToken.current)heading.current?.focus()}, 0) }
  function open(): void {
    // The native picker hands focus back to the trigger, which would keep its tooltip open.
    if (document.activeElement instanceof HTMLElement && document.activeElement.closest('.topbar')) document.activeElement.blur()
    remember();const token=++navigationToken.current;setFocusTarget(null);setWorkReturn(null)
    closeDrawer()
    void run(() => window.madness.chooseDirectory(), (reply) => {
      if (!reply.ok||token!==navigationToken.current) return
      if (reply.value.effect === 'cancelled') setNotice(l=>l.ui.opening_cancelled_no_project_added)
      else { setDisplayedProjectId(reply.value.state.activeProjectId);setTab('parcours');setPage('project'); setNotice(l=>l.ui.folder_context_saved_locally); setTimeout(() => {if(token===navigationToken.current)heading.current?.focus()}, 0) }
    })
  }
  function select(projectId: string): void {
    remember();const token=++navigationToken.current;setFocusTarget(null);setWorkReturn(null)
    closeDrawer();restoreView(projectId)
    void run(() => window.madness.selectProject(projectId), () => { if(token!==navigationToken.current)return;setNotice(l=>l.ui.project_restored_no_agent_restarted); setTimeout(() => {if(token===navigationToken.current)heading.current?.focus()}, 0) })
  }
  async function navigateOverview(target:OverviewTarget):Promise<void>{
    const origin=remember()??lastWork.current;if(!workReturn&&origin)setWorkReturn(origin)
    const token=++navigationToken.current;setFocusTarget(null);closeDrawer()
    if(target.context.projectId===null){setPending(false);setPage('home');setFocusTarget({token,target});return}
    setPending(true)
    try{
      const reply=await window.madness.selectProject(target.context.projectId)
      // Publishing durable facts never authorizes an obsolete navigation.
      if(reply.ok)accept(reply)
      if(token!==navigationToken.current)return
      if(!reply.ok){accept(reply);setNotice(l=>l.words.overview.selectionFailed);return}
      const captured=target.context.conversationId===null||reply.value.state.conversations.some(c=>c.id===target.context.conversationId&&sameContext(c.context,target.context))
      setDisplayedProjectId(target.context.projectId);setPage('project');setTab('conversation')
      if(target.context.conversationId)setConversationSelections(current=>({...current,[target.context.projectId!]:target.context.conversationId!}))
      if(!captured||reply.value.state.activeProjectId!==target.context.projectId){setNotice(l=>l.ui.exact_destination_missing_no_other_exchange_selected);return}
      setFocusTarget({token,target});setNotice(l=>l.ui.captured_context_restored_no_message_or_approval_transmitted)
    }catch{if(token===navigationToken.current)setNotice(l=>l.words.overview.selectionFailed)}
    finally{if(token===navigationToken.current)setPending(false)}
  }
  function returnToWork():void {
    const value=workReturn;if(!value)return
    remember();const token=++navigationToken.current;setPending(false);setFocusTarget(null);setWorkReturn(null)
    const p=state?.projects.find(p=>p.id===value.projectId)
    if(!p||p.rootPath!==value.rootPath||value.rootIdentity!==rootIdentity(p.id,p.rootPath)){setPage('home');setNotice(l=>l.ui.return_point_unavailable_project_missing_or_root_replaced);return}
    setDisplayedProjectId(p.id);setPage('project');setTab(value.tab)
    const exact=value.conversationContext===null||state?.conversations.some(c=>sameContext(c.context,value.conversationContext!))
    if(value.conversationId)setConversationSelections(current=>({...current,[p.id]:value.conversationId!}))
    setNotice(l=>exact?l.ui.work_restored_for_this_session_nothing_sent:l.ui.return_exchange_deleted_no_replacement_selected)
    void window.madness.selectProject(p.id).then(reply=>{if(reply.ok)accept(reply);else if(token===navigationToken.current){setError(l=>l.words.errors[reply.error.messageKey]);setNotice(l=>l.ui.navigation_kept_for_this_session_save_failed_reopening_is_not_gua)}}).catch(()=>{if(token===navigationToken.current)setNotice(l=>l.ui.navigation_kept_for_this_session_save_failed_reopening_is_not_gua)})
    requestAnimationFrame(()=>{
      if(!navigationCurrent({token,projectId:p.id},navigationToken.current,currentProjectId.current))return
      const input=exact&&value.inputId?document.getElementById(value.inputId):null,target=exact?(value.focus?.isConnected?value.focus:input??document.getElementById('tab-'+value.tab)):heading.current
      target?.focus({preventScroll:true});if((input instanceof HTMLInputElement||input instanceof HTMLTextAreaElement)&&value.start!==null&&value.end!==null)input.setSelectionRange(value.start,value.end)
      const main=document.getElementById('main');if(main)main.scrollTop=value.top
    })
  }
  function toggleNavigation(): void {
    if (pending || !state) return
    const next = !collapsed
    setCollapsed(next)
    setPreferenceUnsaved(true)
    void run(() => window.madness.setNavigation(next), () => { setPreferenceUnsaved(false); setNotice(l=>l.ui.navigation_preference_saved) })
  }
  function chooseTab(value:'parcours'|'conversation'|'catalogue'|'graphe'):void {
    if(value==='graphe'&&tab!=='graphe'&&project){const trigger=workFocus.current,input=trigger instanceof HTMLTextAreaElement||trigger instanceof HTMLInputElement?trigger:null;graphReturns.current.set(project.id,{projectId:project.id,rootPath:project.rootPath,tab,initiative:initiativeContext?.selection?.initiativeId??null,conversationId:conversation?.id??null,trigger,inputId:input?.id||null,start:input?.selectionStart??null,end:input?.selectionEnd??null,top:document.getElementById('main')?.scrollTop??0})}
    remember()
    navigationToken.current++;setFocusTarget(null);setPending(false);setTab(value);if(value==='catalogue'&&project&&!catalogState.projects.some(p=>p.projectId===project.id))void window.madnessBmadCatalog?.collect(project.id).then(acceptCatalog).catch(()=>{})
  }
  function returnFromGraph():void{if(!project)return;const target=graphReturns.current.get(project.id);if(!target||target.rootPath!==project.rootPath||target.initiative!==(initiativeContext?.selection?.initiativeId??null)||target.conversationId!==(conversation?.id??null)){setNotice(l=>l.ui.exact_return_unavailable_work_context_changed);heading.current?.focus();return}const token=++navigationToken.current,id=project.id;setFocusTarget(null);setPending(false);setTab(target.tab);requestAnimationFrame(()=>{if(!navigationCurrent({token,projectId:id},navigationToken.current,currentProjectId.current))return;const input=target.inputId?document.getElementById(target.inputId):null,element=target.trigger?.isConnected?target.trigger:input??document.getElementById('tab-'+target.tab)??heading.current;element?.focus({preventScroll:true});if((input instanceof HTMLTextAreaElement||input instanceof HTMLInputElement)&&target.start!==null&&target.end!==null)input.setSelectionRange(target.start,target.end);const main=document.getElementById('main');if(main)main.scrollTop=target.top})}

  function prepareExchange():void {if(!project)return;const token=++navigationToken.current;setFocusTarget(null);setPending(false);setTab('parcours');setPreparationFocus({token,projectId:project.id})}
  function openInitialization(trigger:HTMLElement,attemptId:string|null,autoPrepare=false):void {
    if(page!=='project'||!project||currentProjectId.current!==project.id)return
    closeAgentInfo(false);setConnectionOpen(false)
    setInitializationArrival({projectId:project.id,attemptId,trigger,tab,autoPrepare});setContextOpen(true)
  }
  function closeContext():void {
    const trigger=initializationOpen?initializationArrival?.trigger:null
    setContextOpen(false);setInitializationArrival(null)
    if(trigger?.isConnected&&!trigger.closest('#project-context-panel'))trigger.focus()
    else contextTrigger.current?.focus()
  }
  const navigation = <>
    <button className={'nav-button ' + (page === 'home' ? 'selected' : '')} aria-label={fr.home} aria-current={page === 'home' ? 'page' : undefined} title={fr.home} onClick={home}><Icon name="home" /><span className="nav-label">{fr.home}</span></button>
    <h2 className="nav-section nav-label">{fr.recent}</h2>
    {state?.projects.map(p => <button key={p.id} className={'nav-button project-link ' + (page === 'project' && p.id === project?.id ? 'selected' : '')} aria-label={ui.open_project + p.name} aria-current={page === 'project' && p.id === project?.id ? 'page' : undefined} title={p.name + '\n' + p.rootPath} disabled={pending} onClick={() => select(p.id)}><span className="project-glyph" aria-hidden="true"><ProjectMark name={p.name} /></span><span className="nav-label truncate">{p.name}</span></button>)}
    {!state?.projects.length && <p className="nav-note nav-label">{ui.your_opened_folders_will_appear_here}</p>}
  </>
  return <MetricsContext.Provider value={{state:metrics.state,error:metrics.error}}><FilesContext.Provider value={{state:filesState,open:openFile}}><div className={'app-shell ' + (agentConsultation ? 'agent-info-open ' : '') + (collapsed ? 'nav-compact ' : '') + (tooltipsDismissed ? 'tooltips-dismissed' : '')} onFocusCapture={event=>{captureRequestFocus(event.target);if(tab!=='graphe'&&event.target instanceof HTMLElement&&event.target.closest('main')&&!event.target.closest('.project-tabs,.file-preview,.work-overview,.project-library,.return-to-work'))workFocus.current=event.target}} onPointerDownCapture={event=>{if(!(event.target instanceof HTMLElement)||!event.target.closest('[data-question-id],[data-approval-id]'))requestFocus.current=null}} onKeyDown={(event) => { if (event.key === 'Escape') { setTooltipsDismissed(true); if (drawer.current?.open||planConfirmation.current?.open||document.querySelector('.initiative-dialog[open],.catalog-dialog[open]')) return; if(fileConsultation){event.preventDefault();event.stopPropagation();closeFile()}else if(agentConsultation){event.preventDefault();event.stopPropagation();closeAgentInfo()}else if(contextOpen){event.preventDefault();event.stopPropagation();closeContext()}else if (connectionOpen) { event.preventDefault();event.stopPropagation(); closeConnection() } } }}>
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>{ui.skip_to_content}</a>
    <header className="topbar" onMouseLeave={()=>setTooltipsDismissed(false)} onFocusCapture={()=>setTooltipsDismissed(false)}>
      <div className="breadcrumb">
        <button className="toolbar-toggle command-control desktop-menu" type="button" aria-label={collapsed ? ui.expand_navigation : ui.collapse_navigation} aria-expanded={!collapsed} aria-controls="project-navigation" onClick={toggleNavigation} aria-disabled={pending || !state}><TopbarIcon name="panel" /></button>
        <button className="toolbar-toggle command-control mobile-menu" type="button" ref={drawerTrigger} aria-label={ui.open_navigation} aria-haspopup="dialog" aria-controls="navigation-drawer" onClick={() => drawer.current?.showModal()}><TopbarIcon name="panel" /><span className="command-tooltip" aria-hidden="true">{ui.open_navigation}</span></button>
        <span title={page === 'project' && project ? project.name : fr.home}>{page === 'project' && project ? project.name : fr.home}</span>
      </div>
      <div className="topbar-actions">
        <button className="toolbar-toggle command-control open-project" type="button" aria-label={fr.open} onClick={open} disabled={pending || !state}><TopbarIcon name="folder" /><span className="command-tooltip" aria-hidden="true">{fr.open}</span></button>
        <ProviderIsland active={nextProvider} codex={connection.status==='verified'?'verified':connection.accountStored?'stored':'none'} onChoose={id=>{setNextProvider(id);saveNextProvider(id);if(id==='codex'&&!connection.accountStored)openConnection()}}/>
        <button className={'toolbar-toggle command-control codex-trigger settings-trigger ' + (connection.status === 'verified' ? 'codex-verified' : '')} type="button" ref={connectionTrigger} aria-label={connectionLabel + (language==='fr'?' · Réglages':' · Settings')} aria-expanded={connectionOpen} aria-controls="codex-connection-panel" aria-haspopup="dialog" onClick={() => { if (connectionOpen) closeConnection(); else openConnection() }}><TopbarIcon name="settings" /><span className="command-tooltip" aria-hidden="true">{language==='fr'?'Réglages':'Settings'}</span></button>
      </div>
      <WindowControls />
    </header>
    {connectionOpen && <section id="codex-connection-panel" className="connection-panel" role="dialog" aria-modal="false" aria-labelledby="codex-connection-title" ref={connectionPanel}>
      <p className="settings-eyebrow small muted">{language==='fr'?'Réglages':'Settings'}</p><div className="connection-heading"><h2 id="codex-connection-title" ref={connectionHeading} tabIndex={-1}>{ui.codex_connection}</h2><button type="button" aria-label={ui.close_codex_connection} onClick={closeConnection}><Icon name="close" /></button></div>
      <p className={'connection-state ' + (connection.status === 'verified' ? 'is-verified' : '')} role="status">{fr.connectionStatus[connection.status]}</p>
      {connection.status === 'verified' ? <p>{ui.a_codex_check_turn_succeeded_and_its_process_stopped}{connection.verifiedAt && <> {ui.verified_at} {new Date(connection.verifiedAt).toLocaleString(locale)}.</>}{connection.cliVersion && <> Codex {connection.cliVersion}.</>}</p> : connection.accountStored ? <p>{ui.your_account_is_saved_in_the_encrypted_windows_vault_it_still_nee}</p> : <p>{ui.connect_your_chatgpt_account_in_the_windows_browser_madness_keeps}</p>}
      {connection.status === 'authorizing' && <p>{ui.complete_authorization_in_your_browser_waiting_expires_after_ten_}</p>}
      {connection.status === 'verifying' && <p>{ui.a_small_check_turn_is_in_progress_its_result_awaits_turn_completi}</p>}
      {connection.status === 'stopping' && <p>{ui.stopping_waiting_and_the_codex_engine_launched_by_madness_no_new_}</p>}
      {connection.errorCode && <p className={connection.errorCode === 'CANCELLED' ? 'connection-cancelled' : 'connection-error'} role={connection.status === 'error' || connection.status === 'unknown' ? 'alert' : undefined}>{fr.connectionErrors[connection.errorCode]}</p>}
      {connection.errorCode === 'NETWORK_UNAVAILABLE' && <NetworkHelp connection={connection} onChanged={acceptConnection}/>}
      {connectionBridgeError && <p className="connection-error" role="alert">{ui.the_connection_bridge_does_not_respond_reopen_the_panel_or_restar}</p>}
      <p className="connection-consumption">{ui.checking_sends_a_short_test_message_and_uses_your_chatgpt_plan_it}</p>
      <div className="connection-actions">
        {connection.errorCode==='STOP_UNCONFIRMED'&&<button className="secondary" type="button" onClick={()=>void dialogueAction('observeStop')} disabled={dialoguePending||dialogueBusy||connectionBusy}>{fr.recovery.observeStop}</button>}
        {connectionBusy ? <button className="secondary" type="button" onClick={() => void connectionAction('cancel')} disabled={connectionPending || ['stopping', 'closing'].includes(connection.status)}><Icon name="close" />{ui.cancel_connection}</button> : <>
          {connection.accountStored && <button className={connection.status === 'verified' ? 'connection-check' : 'primary'} type="button" onClick={() => void connectionAction('verify')} disabled={connectionPending || connectionBlocked || connection.status === 'unknown'}><Icon name="refresh" />{ui.verify_connection}</button>}
          {!connectionBlocked && <button className={connection.accountStored ? 'connection-reconnect' : 'primary'} type="button" onClick={() => void connectionAction('connect')} disabled={connectionPending || connection.status === 'unknown'}><Icon name="external" />{connection.accountStored ? ui.reconnect_with_chatgpt : ui.continue_with_chatgpt}</button>}
          {(connection.accountStored || connection.errorCode === 'VAULT_UNREADABLE') && <button className="connection-disconnect" type="button" onClick={() => void connectionAction('disconnect')} disabled={connectionPending}><Icon name="logout" />{ui.disconnect_locally}</button>}
        </>}
      </div>
      <div className="connection-scope"><p>{ui.this_checks_the_local_connection_to_your_plan_a_bmad_session_laun}</p><button className="text-button" type="button" onClick={() => void connectionAction('manageUsage')} disabled={connectionPending}>{ui.manage_usage_in_chatgpt}</button></div>
      <div className="settings-section"><h3>{language==='fr'?'Langue':'Language'}</h3><LanguageControl/></div>
      <div className="settings-section"><h3>Claude Code</h3><p className="small">{language==='fr'?'Madness utilise la CLI officielle Claude Code et la connexion que vous y avez déjà faite. Elles sont vérifiées à chaque lancement ; aucun secret n’est stocké par Madness. Prérequis : Claude Code 2.1.318 (npm install -g @anthropic-ai/claude-code@2.1.318) et une connexion faite avec « claude auth login ».':'Madness uses the official Claude Code CLI and the sign-in you already made there. Both are checked at each launch; Madness stores no secret. Requires Claude Code 2.1.318 (npm install -g @anthropic-ai/claude-code@2.1.318) and a sign-in made with “claude auth login”.'}</p></div>
      <div className="settings-section"><h3>GitHub Copilot</h3><p className="small">{language==='fr'?'Bientôt disponible.':'Coming soon.'}</p></div>
      <div className="settings-section"><h3>{language==='fr'?'Mode développeur':'Developer mode'}</h3><label className="approval-mode"><input type="checkbox" checked={devMode} onChange={event=>changeDevMode(event.target.checked)}/>{language==='fr'?'Afficher les outils de développement':'Show development tools'}</label>{devMode&&<div className="dialogue-actions"><button className="secondary" type="button" onClick={replaySplash} disabled={sessionPresent||dialogueBusy}>{language==='fr'?'Rejouer l’écran de chargement':'Replay the loading screen'}</button></div>}</div>
    </section>}
    <div className="app-body">
    <aside className="sidebar" aria-label={ui.main_navigation} onMouseLeave={() => setTooltipsDismissed(false)} onFocusCapture={() => setTooltipsDismissed(false)}>
      <div className="brand"><span className="brand-label">{fr.app}</span></div>
      <nav id="project-navigation" aria-label={ui.projects}>{navigation}</nav>
      <div className="rail-signature" aria-hidden="true"><img src={madnessMark} alt="" width="28" height="28" /></div>
      <p className="sidebar-bottom nav-label">{ui.local_data}</p>
    </aside>
    <div className="workspace">
      <div className="workspace-body">
        <main id="main" tabIndex={-1}>
          <div className="main-inner">
            {error && <div className="error-message" role="alert"><strong>{ui.the_operation_did_not_complete}</strong><p>{error}</p>{!state && <button className="secondary" onClick={() => void load()} disabled={pending}>{ui.reread_local_context}</button>}</div>}
            {state&&(page==='home'||!project?<div className="page-intro atelier-header"><span className="atelier-glow" aria-hidden="true"/><div><h1 ref={heading} tabIndex={-1}>{ui.your_projects_in_one_place}</h1><p>{ui.find_a_folder_and_prepare_your_next_work}</p></div></div>:<><div className="atelier-header project-banner"><span className="atelier-glow" aria-hidden="true"/><div className="project-heading"><h1 ref={heading} tabIndex={-1}>{project.name}</h1><button className="toolbar-toggle command-control context-trigger" type="button" ref={contextTrigger} aria-label={ui.project_context} aria-expanded={contextOpen} aria-controls="project-context-panel" aria-haspopup="dialog" onFocus={()=>setTooltipsDismissed(false)} onMouseLeave={()=>setTooltipsDismissed(false)} onClick={()=>{if(contextOpen)closeContext();else{closeAgentInfo(false);setConnectionOpen(false);setContextOpen(true)}}}><Icon name="panel"/><span className="command-tooltip" aria-hidden="true">{ui.project_context}</span></button></div>
              <InitiativeSelector key={project.id} projectId={project.id} project={initiativeContext} accept={acceptBmadContext} onOpen={()=>{closeAgentInfo(false);setConnectionOpen(false);setContextOpen(false)}} priority={!!planConfirmation.current?.open||!!drawer.current?.open} conflict={initiativeConflict} onDismissConflict={()=>setInitiativeConflict(false)}/>
              {conversation&&<p className="context-note">{ui.initiative_captured_by_this_exchange} {conversation.context.initiativeId??ui.not_identified}</p>}
              </div>
              <div className="project-tabs" role="tablist" aria-label={ui.project_views}>{(['parcours','conversation','catalogue','graphe'] as const).map((item,index,tabs)=><button key={item} id={'tab-'+item} type="button" role="tab" aria-selected={tab===item} aria-controls={'panel-'+item} tabIndex={tab===item?0:-1} onClick={()=>chooseTab(item)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;document.getElementById('tab-'+tabs[next])?.focus()}}}>{item==='parcours'?ui.journey:item==='conversation'?'Conversation':item==='catalogue'?ui.all_possibilities:ui.graph}</button>)}</div>
</>)}
            {page==='project'&&project&&(tab==='parcours'||initializationState?.operations.length)
              ?<InitializationEntryPoint state={initializationState} onOpen={openInitialization}/>:null}
            {workReturn&&<button type="button" className="text-button return-to-work" onClick={returnToWork}>{ui.return_to_work} {state?.projects.find(p=>p.id===workReturn.projectId)?.name??ui.project_unavailable}</button>}
            {overview&&<WorkOverview overview={overview} projectId={page==='project'?project?.id??null:null} compact={page==='project'&&(tab==='conversation'||tab==='catalogue'||tab==='graphe')} stopUnconfirmed={dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED'} onNavigate={target=>void navigateOverview(target)} onConnection={openConnection}/>}
            {dialogue.context.projectId===null&&(dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode)&&<details className="recovery-details global-recovery"><summary>{ui.global_recovery_details}</summary><section id="overview-session-recovery" tabIndex={-1} aria-label={ui.global_recovery}><RecoveryPanel state={dialogue} projectId={null} busy={dialoguePending||dialogueBusy} sessionPresent={sessionPresent} onObserveStop={()=>void dialogueAction('observeStop')} onInspect={()=>{}} onPrepare={()=>{}}/>{dialogue.errorCode&&<p className="connection-error">{fr.dialogueErrors[dialogue.errorCode]}</p>}{dialogue.errorCode==='NETWORK_UNAVAILABLE'&&<NetworkHelp connection={connection} onChanged={acceptConnection}/>}</section></details>}
            {!state ? <section className="empty-state"><h1 ref={heading} tabIndex={-1}>{ui.restore_your_workspace}</h1><p>{pending ? ui.reading_local_context : ui.local_context_unavailable_use_the_message_above_to_retry}</p></section> : page === 'home' || !project ? <>

              {state.projects.length === 0 ? <section className="welcome"><h2>{ui.start_with_a_folder}</h2><p>{ui.open_a_local_project_to_keep_its_context_and_prepare_a_draft_the_}</p><p className="reason"><strong>{ui.why_now}</strong> {ui.madness_needs_to_know_which_project_your_input_belongs_to}</p><div className="welcome-actions"><button className="primary" type="button" onClick={open} disabled={pending || !state}><Icon name="folder" />{fr.open}</button></div></section> : <ProjectLibrary mark={name=><ProjectMark name={name}/>} entries={projectLibrary(state,bmadContext,progressState,helpState,overview!)} onSelect={select} onNavigate={target=>void navigateOverview(target)} pending={pending}/>}

              <div className="home-note"><h2>{ui.connect_your_account_from_the_codex_logo}</h2><p>{fr.codexReason} {ui.read_bmad_evidence_in_journey_without_a_connection_view_the_local}</p></div>
            </> : <>
              <section id={'panel-' + tab} role="tabpanel" aria-labelledby={'tab-' + tab}>
                {tab==='graphe'&&<GraphPanel language={language} key={project.id+':'+project.rootPath} projectId={project.id} rootPath={project.rootPath} workspace={graphState} accept={acceptGraph} views={graphViews.current} preparationStopState={graphPreparationStop} active={tab==='graphe'} onReturn={returnFromGraph} returnLabel={graphReturns.current.get(project.id)?.tab==='conversation'?'Conversation':graphReturns.current.get(project.id)?.tab==='catalogue'?ui.all_possibilities:ui.journey}/>}
                <div hidden={tab!=='catalogue'}><CatalogPanel key={project.id} projectId={project.id} rootPath={project.rootPath} value={catalogState.projects.find(p=>p.projectId===project.id)} accept={acceptCatalog} views={catalogViews.current} active={tab==='catalogue'} onPrepared={(p,next)=>{if(currentProjectId.current!==p.projectId)return;acceptCatalogLaunch(next);const destination={token:++navigationToken.current,projectId:p.projectId};setConversationSelections(current=>({...current,[p.projectId]:conversation?.id??''}));setCatalogPreparation(p);setTab('conversation');requestAnimationFrame(()=>{if(navigationCurrent(destination,navigationToken.current,currentProjectId.current))document.getElementById('catalog-launch-heading')?.focus()})}} onRefused={code=>{if(currentProjectId.current===project.id&&code==='CONTEXT_MISMATCH')setInitiativeConflict(true)}}/></div>
                {tab==='parcours'&&absentHere&&<section className="bmad-absent-card" aria-labelledby="bmad-absent-title"><h2 id="bmad-absent-title">{language==='fr'?'Ce dossier n’utilise pas encore BMad':'This folder does not use BMad yet'}</h2><p>{language==='fr'?'Madness peut l’installer pour vous : vous verrez la liste exacte des fichiers ajoutés avant de confirmer, et rien d’existant n’est modifié.':'Madness can install it for you: you will see the exact list of added files before confirming, and nothing existing is modified.'}</p><button className="primary" type="button" onClick={event=>openInitialization(event.currentTarget,null,true)}>{language==='fr'?'Initialiser BMad':'Initialize BMad'}</button></section>}
                <div hidden={tab!=='parcours'||absentHere}><ProjectResume active={tab==='parcours'} rootPath={project.rootPath} projectId={project.id} context={initiativeContext} value={progressState.projects.find(p=>p.projectId===project.id)} overview={overview} accept={acceptProgress} onNavigate={target=>void navigateOverview(target)} onChoose={()=>document.querySelector<HTMLButtonElement>('.initiative-trigger')?.click()} busy={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'} stopUnconfirmed={dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED'}/></div>
                {tab==='parcours'&&!absentHere&&<HelpPanel metricChoice={metricChoices.slot('launchHelp',dialoguePending||dialogueBusy||sessionPresent)} stopUnconfirmed={dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED'} state={helpState} onChanged={acceptHelp} onOpen={record=>void navigateOverview({kind:'conversation',context:record.context,id:'bmad-receipt-'+record.conversationId})} onObserveStop={()=>void dialogueAction('observeStop')} projectId={project.id} busy={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'} allowed={connection.accountStored&&!connection.needsPlanAcknowledgement&&!connectionBusy&&!dialogueBridgeError} onLaunch={()=>void dialogueAction('launchHelp')}/>}
                {tab === 'parcours' && !absentHere && <div className="exchange-preparation"><p className="preparation-intro">{ui.prepare_an_exchange_with_mary_to_clarify_your_project_or_with_for}</p><section className="forge-launch" aria-labelledby="forge-title">
                  <div className="dialogue-heading"><h2 id="forge-title">{ui.test_an_idea}</h2>{dialogueHere&&dialogue.invocation==='$bmad-forge-idea'&&<span className="badge" role="status">Forge · {displayedDialogueStatus}</span>}</div>
                  <p>{ui.forge_tests_a_new_idea_from_several_viewpoints_then_saves_a_journ}</p>
                  <button className="secondary" type="button" aria-expanded={forgePreparation} aria-controls="forge-preparation" onClick={()=>setForgePreparation(v=>!v)}>{ui.prepare_forge}</button>
                  {forgePreparation&&<div id="forge-preparation" className="forge-preparation">
                    <p><code>$bmad-forge-idea</code> {ui.native_forge_installed_codex}</p>
                    <dl><dt>{ui.recipient_project}</dt><dd>{project.name} · <code>{project.rootPath}</code></dd><dt>{ui.authorized_effects}</dt><dd>{ui.a_new_session} <code>forge-{'{slug}'}</code> {ui.in_this_project_s_resolved_bmad_output_native_journal_and_html_re}</dd><dt>{ui.verified_output}</dt><dd>{dialogueHere&&dialogue.invocation==='$bmad-forge-idea'&&dialogue.profile?.outputBase?<code>{dialogue.profile.outputBase}</code>:ui.check_the_profile_for_the_exact_path}</dd></dl>
                    <p className="small muted">{ui.launch_transmits_only_the_invocation_never_your_draft_codex_stays}</p>
                    {metricChoices.slot('launchForge',dialoguePending||dialogueBusy||sessionPresent)}
                    <div className="dialogue-actions"><button className="secondary" type="button" onClick={()=>void dialogueAction('qualifyForge')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'||dialogueBridgeError}>{ui.check_forge_profile}</button><button id="forge-launch" className="primary" type="button" aria-describedby={forgePrerequisite?'forge-launch-prerequisite':undefined} onClick={()=>void dialogueAction('launchForge')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status!=='qualified'||!dialogueHere||dialogue.invocation!=='$bmad-forge-idea'||!connection.accountStored||connection.needsPlanAcknowledgement||connectionBusy||dialogueBridgeError}>{ui.launch_forge_with_codex}</button></div>
                    {forgePrerequisite&&<p id="forge-launch-prerequisite" className="small">{fr.dialoguePrerequisites[forgePrerequisite]}{' '}{forgePrerequisite==='account'?<button className="text-button" type="button" onClick={openConnection}>{ui.open_codex_panel}</button>:<button className="text-button" type="button" onClick={()=>planConfirmation.current?.showModal()}>{ui.read_plan_reminder_again}</button>}</p>}
                  </div>}
                </section>
                {nextProvider==='claude-code'?<div className="dialogue-launch" aria-labelledby="mary-title"><div className="dialogue-heading"><h2 id="mary-title" tabIndex={-1}>Mary <span>{language==='fr'?'Analyste BMad · Claude Code':'BMad analyst · Claude Code'}</span></h2></div><p><code>$bmad-agent-analyst</code></p><p className="small" id="claude-mary-scope">{ui.claude_launch_scope}</p><div className="dialogue-actions"><button id="mary-launch" className="primary" type="button" aria-describedby="claude-mary-scope" onClick={()=>void dialogueAction('launchClaude')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'||connectionBusy||dialogueBridgeError}><Icon name="message" />{ui.launch_mary_with_claude_code}</button></div></div>:<div className="dialogue-launch" aria-labelledby="mary-title">
                  <div className="dialogue-heading"><h2 id="mary-title" tabIndex={-1}>Mary <span>{ui.bmad_analyst_codex}</span></h2>{dialogueHere&&dialogue.invocation==='$bmad-agent-analyst' && <span className="badge" role="status">Mary · {displayedDialogueStatus}</span>}</div>
                  <p><code>$bmad-agent-analyst</code></p>
                  <p>{ui.launch_checks_actual_bmad_files_then_requests_mary_s_welcome_each}</p>
                  <label className="approval-mode"><input type="checkbox" checked={sessionPresent&&dialogueHere&&dialogue.invocation==='$bmad-agent-analyst'?dialogue.mode==='file-approval':maryMode==='file-approval'} disabled={dialoguePending||dialogueBusy||sessionPresent} onChange={event=>setMaryMode(event.target.checked?'file-approval':'read-only')}/>{ui.propose_changes_with_approval}</label>
                  <p className="small">{sessionPresent&&dialogueHere?ui.captured_mode+(dialogue.mode==='file-approval'?ui.files_with_one_time_approval:ui.read_only) : maryMode==='file-approval'?ui.mary_can_propose_a_complete_patch_to_allow_or_reject_shell_disabl:ui.read_only_by_default_no_native_writes_authorized}</p>
                  <p className="small muted">{ui.menu_workflows_remain_unavailable_in_this_pilot_file_mode_only_ad}</p>
                  {metricChoices.slot('launch',dialoguePending||dialogueBusy||sessionPresent)}
                  <div className="dialogue-actions">
                    <button id="mary-launch" className="primary" type="button" onClick={() => void dialogueAction('launch')} disabled={dialoguePending || dialogueBusy || sessionPresent || dialogue.status === 'unknown' || !connection.accountStored || connection.needsPlanAcknowledgement || connectionBusy || dialogueBridgeError}><Icon name="message" />{ui.launch_mary_with_codex}</button>
                    <button className="secondary" type="button" onClick={() => void dialogueAction('qualify')} disabled={dialoguePending || dialogueBusy || sessionPresent || dialogue.status === 'unknown' || dialogueBridgeError}>{ui.check_this_project}</button>
                  </div>
                  {!connection.accountStored && <p className="small">{fr.dialoguePrerequisites.account}</p>}
                  {connection.needsPlanAcknowledgement && <p className="small">{fr.dialoguePrerequisites.plan}</p>}
                </div>}
                </div>}

                {((dialogueHere&&dialogue.errorCode==='NETWORK_UNAVAILABLE')||dialogue.errorCode==='NETWORK_UNAVAILABLE'&&dialogue.context.projectId===null)&&<NetworkHelp connection={connection} onChanged={acceptConnection}/>}
                {sessionFeedback&&!(tab==='conversation'&&(dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED')&&!sessionPresent&&!dialogueBusy)&&<section className="dialogue-session" aria-labelledby="dialogue-session-title">
                  <h2 id="dialogue-session-title" tabIndex={-1}>Session {dialogue.context.projectId?displayedRecipient:'BMad'} · {claudeSession?'Claude Code':'Codex'}</h2>
                  {(sessionPresent||dialogueBusy)&&<div className="dialogue-actions"><button className="secondary" type="button" onClick={()=>void dialogueAction('stop')} disabled={dialoguePending||dialogue.status==='stopping'}><Icon name="close"/>{claudeSession?ui.stop_claude_code:ui.stop_codex}</button></div>}
                  {!dialogueHere && sessionPresent && <p className="small">{displayedRecipient} · {displayedDialogueStatus} {ui.in} {state.projects.find(p => p.id === dialogue.context.projectId)?.name ?? ui.another_project}{claudeSession?ui.open_session_or_stop_claude_code:ui.open_this_project_to_view_the_session_or_stop_codex}</p>}
                  {(dialogueHere || dialogue.status === 'unknown') && dialogue.errorCode && <div className="connection-error" role="alert"><p>{fr.dialogueErrors[dialogue.errorCode]}</p>{!dialogueHere && dialogue.context.projectId && <button className="text-button" type="button" onClick={() => select(dialogue.context.projectId!)} disabled={pending}>{ui.open} {state.projects.find(p => p.id === dialogue.context.projectId)?.name ?? ui.the_session_s_project}</button>}</div>}
                  {dialogueBridgeError && <p className="connection-error" role="alert">{ui.the_dialogue_bridge_does_not_respond_your_draft_is_kept_restart_m}</p>}
                  {dialogueHere && dialogue.profile && <details className="dialogue-proof"><summary>{ui.bmad_profile_checked}</summary><p><code>{dialogue.profile.skillPath}</code></p><p className="small">{ui.fingerprint} <code>{dialogue.profile.fingerprint}</code></p></details>}
                </section>}

                {tab === 'conversation' && (conversation ? <div className="conversation-history" aria-label={ui.bmad_exchanges}><h2 id="conversation-heading" tabIndex={-1}>Conversation{conversation.context.providerId==='claude-code'?' · Claude Code':''} <code className="conversation-reference">{conversation.id}</code></h2>
                  {!canReply && !dialogueBusy && <p className="history-note">{ui.history_retained_no_engine_restarts_an_explicit_launch_opens_a_ne}</p>}

                  {conversationQuestions.filter(q=>currentRequest('question',q.id)).map(q=><QuestionPanel key={q.id} question={q} respondable={respondable('question',q.id)} values={questionDrafts[q.id]??q.values} projectName={project.name} compactContext onChange={values=>changeQuestion(q,values)} onSend={()=>void answerQuestion(q)} bridgeFailed={questionFailures[q.id]??false}/>)}
                  {conversationApprovals.filter(a=>currentRequest('approval',a.id)).map(approvalPanel)}
                  <ConversationMessages key={conversation.id} conversation={conversation} projections={dialogue.messages??[]} positions={readingPositions.current} onConsult={consultAgent}/>


                  {dialogueConversationHere && <p className="turn-status" role="status">{displayedRecipient} · {claudeSession&&dialogue.turn?.phase==='completed'&&dialogue.status==='stopped'?ui.claude_turn_saved:displayedDialogueStatus}{dialogue.status === 'running' && !activeQuestion && !activeApproval && (dialogue.acknowledged ? ui.send_acknowledged_and_saved : ui.awaiting_send_acknowledgement)}{dialogue.status === 'ready' && ui.turn_complete_next_action_your_response_turn_completion_does_not_}</p>}
                </div> : <div className="conversation-empty"><h2>{ui.no_saved_exchange}</h2><p>{ui.an_explicit_launch_opens_a_session_without_sending_your_draft}</p></div>)}

                {tab==='conversation'&&<form className="composer" onSubmit={(event) => { event.preventDefault(); const projectId = project.id; const value = text; void run(() => window.madness.saveDraft(projectId, value), () => setNotice(l=>l.words.saved)) }}>
                  <label htmlFor="draft">{nativeAwaiting?ui.free_draft_for_this_project:canReply || dialogueConversationHere && sessionPresent ? ui.your_response_to+recipient : ui.draft_for + project.name}</label>
                  <textarea id="draft" value={text} onChange={(event) => setTexts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={MAX_DRAFT_LENGTH} aria-describedby="draft-status draft-limit" placeholder={ui.note_what_you_want_to_resume_in_this_project} />
                  {canReply&&metricChoices.slot('send',dialoguePending)}
                  <div className="composer-bottom"><p id="draft-status">{dirty ? fr.unsaved : saved ? fr.saved : fr.noDraft}</p><div className="composer-actions"><button className="secondary" type="submit" disabled={pending || !dirty}>{pending ? fr.saving : fr.save}</button>{dialogueConversationHere && sessionPresent && <button className="primary" type="button" onClick={() => void sendToMary()} disabled={!canReply || dialoguePending || !text.trim()}><Icon name="arrow" />{ui.send_to} {recipient}</button>}</div></div>
                  <p className="small muted" id="draft-limit">{nativeAwaiting?ui.answer_or_decide_in_the_correlated_request_form_when_active_this_:canReply ? ui.only_send_to+recipient+ui.transmits_this_text_the_draft_is_saved_before_sending_and_remains : ui.input_kept_locally_no_automatic_send} {ui.label_100_000_characters_maximum}</p>
                </form>}
                {tab==='conversation'&&catalogPreparation?.projectId===project.id&&(catalogLaunch.preparation?.id===catalogPreparation.id||catalogLaunch.status==='error')&&<CatalogLaunchPanel metricChoice={metricChoices.slot('catalog',dialoguePending||dialogueBusy)} preparation={catalogPreparation} busy={dialoguePending||dialogueBusy||catalogLaunch.status==='launching'} stale={catalogSelectionChanged||catalogLaunch.status!=='prepared'||catalogState.projects.find(p=>p.projectId===project.id)?.freshness!=='current'||catalogState.projects.find(p=>p.projectId===project.id)?.snapshot?.revision!==catalogPreparation.snapshot.revision||catalogState.projects.find(p=>p.projectId===project.id)?.generation!==catalogPreparation.generation} selectionChanged={catalogSelectionChanged} error={catalogLaunch.error} onLaunch={()=>void launchFromCatalog()} onCancel={cancelCatalog}/>}
                {tab==='conversation'&&conversation&&<CatalogOrigin record={catalogLaunch.records.find(r=>r.conversationId===conversation.id&&sameContext(r.context,conversation.context))} onRetry={id=>void window.madnessCatalogLaunch.retrySave(id).then(acceptCatalogLaunch).catch(()=>setNotice(l=>l.ui.origin_could_not_be_saved_no_new_send))}/>}
                {tab==='conversation'&&<button className="text-button prepare-exchange" type="button" onClick={prepareExchange}>{ui.prepare_an_exchange}</button>}
                {tab==='conversation'&&nextProvider==='claude-code'&&<div className="dialogue-launch" aria-labelledby="claude-launch-title">
                  <h2 id="claude-launch-title">Claude Code</h2>
                  <p className="small" id="claude-launch-scope">{ui.claude_launch_scope}</p>
                  <div className="dialogue-actions">
                    <button id="claude-launch" className="secondary" type="button" aria-describedby="claude-launch-scope" onClick={()=>void dialogueAction('launchClaude')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'||connectionBusy||dialogueBridgeError}><Icon name="message"/>{ui.launch_mary_with_claude_code}</button>
                  </div>
                </div>}
                {(dialogue.recovery.stop==='unconfirmed'||dialogue.approvals.some(a=>a.context.projectId===project.id&&a.decision==='accept'&&(['unknown','pending'].includes(a.effect)||a.storage!=='stored')))&&<details className="recovery-details"><summary>{ui.recovery_and_inspection_details}</summary><div id={dialogue.context.projectId!==null?"overview-session-recovery":undefined} tabIndex={-1}><RecoveryPanel state={dialogue} projectId={project.id} busy={dialoguePending||dialogueBusy} sessionPresent={sessionPresent} onObserveStop={()=>void dialogueAction('observeStop')} onInspect={id=>void inspectApproval(id)} onPrepare={prepareExchange}/></div></details>}
                {tab==='conversation'&&(historicalQuestions.length>0||historicalApprovals.length>0)&&<details className="request-history"><summary>{ui.retained_requests_inactive}{formatNumber(historicalQuestions.length+historicalApprovals.length,language)})</summary>{historicalQuestions.map(q=><QuestionPanel key={q.id} question={q} respondable={respondable('question',q.id)} values={questionDrafts[q.id]??q.values} projectName={project.name} compactContext onChange={values=>changeQuestion(q,values)} onSend={()=>void answerQuestion(q)} bridgeFailed={questionFailures[q.id]??false}/>)}{historicalApprovals.map(approvalPanel)}</details>}
                  {tab==='conversation'&&conversation&&projectConversations.length > 1 && <details className="previous-conversations"><summary>{ui.previous_conversations}{formatNumber(projectConversations.length-1,language)})</summary>{projectConversations.filter(c => c.id !== conversation.id).map(c => <section key={c.id} aria-label={ui.historical_conversation}>{c.context.providerId==='claude-code'&&<p className="small">Claude Code</p>}<CatalogOrigin record={catalogLaunch.records.find(r=>r.conversationId===c.id&&sameContext(r.context,c.context))} onRetry={id=>void window.madnessCatalogLaunch.retrySave(id).then(acceptCatalogLaunch).catch(()=>{})}/><HelpReceiptPanel record={helpState.records.find(r=>r.conversationId===c.id)} onChanged={acceptHelp}/><ConversationMessages key={c.id} conversation={c} projections={dialogue.messages??[]} positions={readingPositions.current} onConsult={consultAgent}/>{dialogue.questions.filter(q=>q.context.conversationId===c.id).map(q=><QuestionPanel key={q.id} question={q} respondable={respondable('question',q.id)} values={questionDrafts[q.id]??q.values} projectName={project.name} compactContext onChange={values=>changeQuestion(q,values)} onSend={()=>void answerQuestion(q)} bridgeFailed={questionFailures[q.id]??false}/>)}{dialogue.approvals.filter(a=>a.context.conversationId===c.id).map(approvalPanel)}{dialogue.workflows.filter(w=>w.conversationId===c.id).map(w=><WorkflowResult key={w.conversationId} workflow={w} onCopy={copyWorkflow}/>)}</section>)}</details>}
                {tab==='conversation'&&conversation&&<HelpReceiptPanel record={helpState.records.find(r=>r.conversationId===conversation.id)} onChanged={acceptHelp}/>}
                {workflow&&<WorkflowResult key={workflow.conversationId} workflow={workflow} onCopy={copyWorkflow}/>}
                {dialogueHere && dialogue.activities.length > 0 && <details className="dialogue-activity"><summary>{ui.dialogue_activity}{formatNumber(dialogue.activities.length,language)})</summary><ol>{dialogue.activities.map((entry, index) => <li key={index}>{presentProductText('activity',entry,language)}</li>)}</ol></details>}
              </section>
            </>}
            {preferenceUnsaved && <p className="preference-note">{ui.navigation_choice_applies_to_this_session_persistence_not_confirm}</p>}
            {appearance.warning && <p className="appearance-warning" role="status" aria-live="polite">{appearance.warning === 'read-failed' ? ui.theme_preference_could_not_be_read_dark_theme_is_used_existing_fi : ui.chosen_theme_applies_to_this_session_persistence_not_confirmed_ex}</p>}
            {appearanceBridgeError && <p className="appearance-warning" role="status" aria-live="polite">{appearanceBridgeError === 'read' ? ui.theme_could_not_be_restored_retry_with_the_theme_command_your_con : ui.theme_could_not_be_changed_retry_your_context_and_input_are_kept}</p>}
            <p className="status-line" role="status" aria-live="polite">{notice}</p>
          </div>
        </main>
        {fileConsultation&&<FilePreview key={fileConsultation.reference.id} consultation={fileConsultation} state={filesState} accept={acceptFiles} onClose={closeFile}/>}
        {agentConsultation&&<AgentInfoPanel key={agentConsultation.message.context.conversationId+':'+agentConsultation.message.id} consultation={agentConsultation} entries={overview?.entries??[]} onClose={()=>closeAgentInfo()} onNavigate={target=>{closeAgentInfo(false);void navigateOverview(target)}}/>}
      </div>
    </div>
    </div>
        {contextOpen && (!initializationArrival||initializationOpen) && page === 'project' && project && <section id="project-context-panel" className={initializationOpen?"context-panel initialization-context":"context-panel"} role="dialog" aria-modal="false" aria-labelledby="project-context-title"><div className="connection-heading"><h2 id="project-context-title" ref={contextHeading} tabIndex={-1}>{ui.project_context}</h2><button type="button" aria-label={ui.close_project_context} onClick={closeContext}><Icon name="close"/></button></div><p>{ui.source_folder_chosen_through_windows}</p><dl><dt>{ui.canonical_folder}</dt><dd><code>{project.rootPath}</code></dd><dt>{ui.selected_conversation}</dt><dd><code>{conversation?.id??ui.none_2}</code></dd><InitiativeContext project={initiativeContext}/><dt>{ui.initiative_captured_by_the_conversation}</dt><dd>{conversation?conversation.context.initiativeId??ui.not_identified_2:ui.no_selected_conversation}</dd><dt>{ui.persistence}</dt><dd>{ui.exchanges_observations_and_draft_in_madness_local_data}</dd><dt>{ui.activity}</dt><dd>{dialogueHere ? displayedDialogueStatus : ui.no_active_agent_in_this_project}</dd><dt>{ui.provider}</dt><dd>{(conversation?.context.providerId??(dialogueHere?dialogue.context.providerId:nextProvider))==='claude-code'?'Claude Code':ui.codex_madness_owned_connection}</dd><dt>{ui.project_files}</dt><dd>{workflow?ui.writes_limited_to_the_captured_new_forge_session:ui.mary_read_only_by_default_file_mode_with_approval_must_be_enabled}</dd></dl>
         {initializationOpen&&initializationArrival?<InitializationPanel key={project.id} projectId={project.id} rootPath={project.rootPath} arrival={initializationArrival}
           state={initializationState} accept={acceptInitialization} onClose={closeContext}/>
           :<InitializationEntryPoint state={null} onOpen={openInitialization}/>}
        </section>}
    <dialog id="navigation-drawer" className="navigation-drawer" ref={drawer} aria-labelledby="drawer-title" onClose={() => drawerTrigger.current?.focus()} onClick={(event) => { if (event.target === drawer.current) closeDrawer() }}>
      <div className="drawer-heading"><h2 id="drawer-title">{fr.app}</h2><LanguageControl/><button aria-label={ui.close_navigation} onClick={closeDrawer}><Icon name="close" /></button></div><nav aria-label={ui.projects_in_a_compact_window}>{navigation}</nav>
    </dialog>
    <dialog className="plan-confirmation" ref={planConfirmation} aria-labelledby="plan-confirmation-title" aria-describedby="plan-confirmation-description" onClose={() => { planConfirmationDismissed.current = connection.needsPlanAcknowledgement; if (connectionOpen) connectionHeading.current?.focus(); else connectionTrigger.current?.focus() }}>
      <div className="connection-heading"><h2 id="plan-confirmation-title">{ui.you_are_using_your_chatgpt_plan}</h2><LanguageControl/></div>
      <p id="plan-confirmation-description">{ui.you_authorized_madness_to_use_your_chatgpt_plan_the_short_connect}</p>
      {connectionBridgeError && <p className="connection-error" role="alert">{ui.confirmation_could_not_be_saved_retry}</p>}
      {connection.errorCode && <p className="connection-error" role="alert">{fr.connectionErrors[connection.errorCode]}</p>}
      <button className="primary" type="button" onClick={() => void connectionAction('acknowledgePlan')} disabled={connectionPending}>{ui.i_understand}</button>
      {' '}<button className="secondary" type="button" onClick={() => planConfirmation.current?.close()}>{ui.close}</button>
    </dialog>
  </div></FilesContext.Provider></MetricsContext.Provider>
}
