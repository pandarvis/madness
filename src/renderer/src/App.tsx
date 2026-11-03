import {InitiativeSelector,InitiativeContext,useBmadContext} from './InitiativeSelector.tsx'
import {ProjectResume,useBmadProgress} from './ProjectResume.tsx'
import {HelpPanel,HelpReceiptPanel,useBmadHelp} from './HelpPanel.tsx'
import {agentPresentation} from './agentPresentation.ts'
import {AgentPortrait} from './AgentPortrait.tsx'
import {AgentInfoPanel} from './AgentInfoPanel.tsx'
import madnessMark from '../../../resources/branding/madness-64.png'
import {WindowCaptionPlates} from './WindowCaptionPlates.tsx'
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
import { fr } from './strings.ts'
import { initialConnectionState } from '../../contracts/connection.ts'
import type { ConnectionState, ConnectionBridge } from '../../contracts/connection.ts'
import chatgptMark from './assets/chatgpt-mark.svg'
import { initialDialogueState } from '../../contracts/dialogue.ts'
import type { DialogueMessage, DialogueState, WorkflowRecord } from '../../contracts/dialogue.ts'
import type { AppearanceState } from '../../contracts/appearance.ts'
import {QuestionPanel} from './QuestionPanel.tsx'
import type {QuestionRecord,QuestionValues} from '../../contracts/questions.ts'
const questionRecipient=(question:QuestionRecord):string=>question.identity.kind==='attested'?question.identity.name:fr.conversation.unknownAgent

function MessageArticle({message,projection,onConsult}:{message:Conversation['messages'][number];projection?:DialogueMessage;onConsult:(message:DialogueMessage,trigger:HTMLButtonElement)=>void}):ReactNode {
  const identity=projection?.identity
  const agent=agentPresentation(identity)
  const name=identity?.kind==='attested'?identity.name:fr.conversation.unknownAgent
  const phase=projection?.phase==='streaming'?fr.conversation.streaming:projection?.phase==='complete'?fr.conversation.complete:projection?.phase==='interrupted'?fr.conversation.partial:fr.conversation.unknownPhase
  const storage=projection?.storage==='pending'||projection?.storage==='failed'?fr.conversation.notStored:fr.conversation.stored
  return <article data-message-id={message.id} className={'dialogue-message '+message.role}>
    <div className="message-author">{message.role==='assistant'&&(agent&&projection?<button className="agent-portrait-trigger" type="button" aria-label={'Fiche de '+agent.name} onClick={event=>onConsult(projection,event.currentTarget)}><AgentPortrait agent={agent}/></button>:<AgentPortrait/>)}<h3>{message.role==='user'?'Vous':name+' · Codex'}</h3>{message.role==='assistant'&&agent&&projection&&<button className="agent-info-link text-button" type="button" aria-label={'Fiche de '+agent.name+' · message '+message.id} onClick={event=>onConsult(projection,event.currentTarget)}>Fiche agent</button>}</div>
    {message.role==='assistant'&&<p className={'message-state '+(projection?.storage==='failed'?'message-storage-failed':'')}>{projection?phase+' · '+storage:fr.conversation.historical}</p>}
    <div className="message-text">{message.text}</div>
    {message.role==='assistant'&&identity?.kind==='attested'&&<p className="message-provenance">Identité attestée · source : <code>{identity.source}</code></p>}
  </article>
}
type ReadingPosition={top:number;follow:boolean}
function ConversationMessages({conversation,projections,positions,onConsult}:{conversation:Conversation;projections:DialogueMessage[];positions:Map<string,ReadingPosition>;onConsult:(message:DialogueMessage,trigger:HTMLButtonElement)=>void}):ReactNode {
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
  return <div className="conversation-messages" ref={container} tabIndex={0} aria-label="Messages de la conversation" onScroll={event=>{const e=event.currentTarget;reading.current={top:e.scrollTop,follow:e.scrollHeight-e.clientHeight-e.scrollTop<=24};positions.set(conversation.id,{...reading.current})}}>
    {merged.map(message=><MessageArticle key={message.id} message={message} projection={metadata.get(message.id)} onConsult={onConsult}/>)}
  </div>
}

function ProjectMark({ name }: { name: string }): ReactNode {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? []
  const letters = words.length > 1 ? words.slice(0, 2).map(word => Array.from(word)[0]).join('') : Array.from(words[0] ?? '').slice(0, Array.from(words[0] ?? '').length <= 3 ? 3 : 2).join('')
  return <span className="project-mark" aria-hidden="true"><span>{letters ? letters.toUpperCase() : <Icon name="folder" />}</span></span>
}

function Icon({ name }: { name: 'home' | 'folder' | 'panel' | 'close' | 'message' | 'arrow' | 'refresh' | 'external' | 'logout' | 'copy' | 'sun' | 'moon' }): ReactNode {
  const paths = { home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z', folder: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z', panel: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 3v18m6-13-3 4 3 4', close: 'm6 6 12 12M6 18 18 6', message: 'M4 4h16v12H9l-5 4V4Z', arrow: 'M5 12h14m-5-5 5 5-5 5', refresh: 'M20 7v5h-5M20 12a8 8 0 1 0-2 5', external: 'M14 4h6v6m0-6-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5', logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4m4-12 4 4-4 4m-4-4h12',copy:'M9 9h12v12H9V9ZM5 15H3V3h12v2',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M20.5 13.1A8.5 8.5 0 0 1 10.9 3.5a8.5 8.5 0 1 0 9.6 9.6Z' }
  const cutPaths = { home: 'M3 10 12 3l9 7v9l-2 2h-5v-7h-4v7H5l-2-2Z', folder: 'M3 8V4h7l3 3h8v12l-2 2H3Zm0 2h18', panel: 'M5 3h14l2 2v14l-2 2H3V5Zm4 0v18m7-13-4 4 4 4', sun: 'M16 9v6l-4 2-4-2V9l4-2ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2', moon: 'M20 14a8 8 0 0 1-10-10l-5 3-2 5 2 6 5 3 6-1Z' }
  const face = { home: 'M3 10 12 3l9 7v9l-2 2h-5v-7h-4v7H5l-2-2Z', folder: 'M3 10h18v9l-2 2H3Z', panel: 'M5 3h4v18H3V5Z', sun: 'M16 9v6l-4 2-4-2V9l4-2Z', moon: 'M20 14a8 8 0 0 1-10-10l-5 3-2 5 2 6 5 3 6-1Z' }
  const key = name in cutPaths ? name as keyof typeof cutPaths : null
  return <svg className="workshop-icon" aria-hidden="true" viewBox="0 0 24 24">{key && <path className="icon-face" d={face[key]} />}<path d={key ? cutPaths[key] : paths[name]} /></svg>
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
  const [helpState,acceptHelp]=useBmadHelp()
  const [progressState,acceptProgress]=useBmadProgress()
  const [initiativeConflict,setInitiativeConflict]=useState(false)
  const [state, setState] = useState<AppState | null>(null)
  const [bmadContext,acceptBmadContext]=useBmadContext(state?.activeProjectId??undefined)
  const [page, setPage] = useState<'home' | 'project'>('home')
  const navigationToken=useRef(0)
  const pendingLaunch=useRef<{token:number;projectId:string;previousConversationId:string|null;sequence:number}|null>(null)
  const [conversationSelections,setConversationSelections]=useState<Record<string,string>>({})
  const [focusTarget,setFocusTarget]=useState<{token:number;target:OverviewTarget}|null>(null)
  const [overviewClock,setOverviewClock]=useState(0)
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
  const connectionTrigger = useRef<HTMLButtonElement>(null)
  const connectionPanel = useRef<HTMLElement>(null)
  const connectionHeading = useRef<HTMLHeadingElement>(null)
  const planConfirmation = useRef<HTMLDialogElement>(null)
  const planConfirmationDismissed = useRef(false)
  const connectionBusy = ['authorizing', 'verifying', 'stopping', 'closing'].includes(connection.status)
  const connectionBlocked = ['ENCRYPTION_UNAVAILABLE', 'VAULT_UNREADABLE', 'REGISTRATION_INVALID'].includes(connection.errorCode ?? '')
  const connectionLabel = 'Connexion Codex : ' + fr.connectionStatus[connection.status]
  const project = state?.projects.find((p) => p.id === state.activeProjectId)
  const initiativeContext=bmadContext.projects.find(p=>p.projectId===project?.id)
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
  const [questionDrafts,setQuestionDrafts]=useState<Record<string,QuestionValues>>({})
  const [questionFailures,setQuestionFailures]=useState<Record<string,boolean>>({})
  const sendingQuestions=useRef(new Set<string>())
  const readingPositions=useRef(new Map<string,ReadingPosition>())
  const requestFocus=useRef<{kind:'question'|'approval';id:string;element:HTMLElement;live:boolean;respondable:boolean}|null>(null)
  const [forgePreparation,setForgePreparation]=useState(false)
  const [preparationFocus,setPreparationFocus]=useState<{token:number;projectId:string}|null>(null)
  const [contextOpen,setContextOpen]=useState(false)
  const [agentConsultation,setAgentConsultation]=useState<AgentConsultation|null>(null)
  const agentFocusReturn=useRef<HTMLElement|null>(null)
  const contextTrigger=useRef<HTMLButtonElement>(null)
  const contextHeading=useRef<HTMLHeadingElement>(null)
  const sending = useRef(false)
  const dialogueHere = dialogue.context.projectId === project?.id
  const dialogueBusy = ['qualifying', 'inspecting', 'starting', 'running','waiting-question','waiting-approval', 'stopping'].includes(dialogue.status)
  const sessionPresent = ['starting', 'running','waiting-question','waiting-approval', 'ready', 'stopping'].includes(dialogue.status)
  const projectConversations = state?.conversations.filter(c => c.context.projectId === project?.id) ?? []
  const conversation = projectConversations.find(c=>c.id===conversationSelections[project?.id??'']) ?? projectConversations.find(c => c.id === dialogue.context.conversationId) ?? projectConversations.at(-1)
  const dialogueConversationHere=!!conversation&&sameContext(conversation.context,dialogue.context)
  const overview=state?projectWorkOverview(state,dialogue,connection,Date.now()):null
  const respondable=(kind:'question'|'approval',id:string):boolean=>!!overview?.entries.some(e=>e.target.kind===kind&&e.target.id===id&&e.state==='waiting')
  const currentRequest=(kind:'question'|'approval',id:string):boolean=>!!overview?.entries.some(e=>e.target.kind===kind&&e.target.id===id&&(e.state==='waiting'||e.state==='sending'))
  const conversationQuestions=dialogue.questions.filter(q=>conversation&&sameContext(q.context,conversation.context))
  const conversationApprovals=dialogue.approvals.filter(a=>conversation&&sameContext(a.context,conversation.context))
  const historicalQuestions=conversationQuestions.filter(q=>!currentRequest('question',q.id))
  const historicalApprovals=conversationApprovals.filter(a=>!currentRequest('approval',a.id))
  const nativeAwaiting=dialogueConversationHere&&['waiting-question','waiting-approval'].includes(dialogue.status)
  const canReply = dialogueConversationHere && dialogue.status === 'ready'
  const workflow=dialogue.workflows.find(w=>w.conversationId===conversation?.id)
  const recipient=dialogue.invocation==='$bmad'?'BMad':dialogue.invocation==='$bmad-forge-idea'?'Forge':'Mary'
  const activeQuestion=dialogue.questions.find(q=>overview?.entries.some(e=>e.target.kind==='question'&&e.target.id===q.id)&&sameContext(q.context,dialogue.context))
  const activeApproval=dialogue.approvals.find(a=>overview?.entries.some(e=>e.target.kind==='approval'&&e.target.id===a.id)&&sameContext(a.context,dialogue.context))
  const displayedRecipient=activeApproval?(activeApproval.identity.kind==='attested'?activeApproval.identity.name:fr.conversation.unknownAgent):activeQuestion?questionRecipient(activeQuestion):recipient
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
    setAgentConsultation({message:structuredClone(message),trigger,viewConversationId:conversation?.id??null})
  }
  useEffect(()=>{
    if(!agentConsultation)return
    const source=dialogue.messages.find(message=>message.id===agentConsultation.message.id&&sameContext(message.context,agentConsultation.message.context))
    const identity=agentConsultation.message.identity
    if(page!=='project'||tab!=='conversation'||conversation?.id!==agentConsultation.viewConversationId||project?.id!==agentConsultation.message.context.projectId||!state?.conversations.some(c=>sameContext(c.context,agentConsultation.message.context))||!source||source.identity.kind!=='attested'||identity.kind!=='attested'||source.identity.name!==identity.name||source.identity.source!==identity.source){setNotice('La fiche a été fermée : son contexte de consultation n’est plus affiché.');closeAgentInfo()}
  },[page,tab,project?.id,conversation?.id,dialogue.messages,state,agentConsultation])
  useEffect(()=>{setForgePreparation(false)},[project?.id])
  useEffect(()=>{setContextOpen(false)},[project?.id,page])
  useEffect(()=>{if(contextOpen)contextHeading.current?.focus()},[contextOpen])
  useLayoutEffect(()=>{
    if(!preparationFocus||preparationFocus.token!==navigationToken.current)return
    if(page!=='project'||project?.id!==preparationFocus.projectId||tab!=='parcours')return
    const element=document.getElementById('mary-title');if(!element)return
    element.focus();element.scrollIntoView({block:'center'});setPreparationFocus(null)
  })
  useEffect(()=>{
    const launch=pendingLaunch.current;if(!launch)return
    if(dialogue.sequence<=launch.sequence)return
    if(launch.token!==navigationToken.current||dialogue.errorCode||['error','unknown','stopped'].includes(dialogue.status)){pendingLaunch.current=null;return}
    const context=dialogue.context
    if(context.projectId!==launch.projectId||!context.conversationId||context.conversationId===launch.previousConversationId||!(dialogue.status==='ready'||dialogue.acknowledged&&['running','waiting-question','waiting-approval'].includes(dialogue.status)))return
    if(!state?.conversations.some(c=>c.id===context.conversationId&&sameContext(c.context,context)))return
    pendingLaunch.current=null
    setConversationSelections(current=>({...current,[launch.projectId]:context.conversationId!}));setTab('conversation')
  },[dialogue,state])
  useEffect(()=>{const now=Date.now(),expiry=[...dialogue.questions,...dialogue.approvals].filter(q=>q.status==='waiting'||q.status==='sending').map(q=>q.expiresAt).filter((v):v is number=>v!==null&&v>now).sort((a,b)=>a-b)[0];if(!expiry)return;const timer=setTimeout(()=>setOverviewClock(v=>v+1),Math.min(2147483647,Math.max(1,expiry-now)));return()=>clearTimeout(timer)},[dialogue,overviewClock])
  useLayoutEffect(()=>{
    if(!focusTarget||focusTarget.token!==navigationToken.current)return
    const target=focusTarget.target
    if(target.context.projectId!==null&&(page!=='project'||project?.id!==target.context.projectId||tab!=='conversation'||target.context.conversationId!==null&&(!conversation||!sameContext(conversation.context,target.context))))return
    const element=target.kind==='question'?document.getElementById(target.id+'-title'):target.kind==='approval'?document.getElementById(target.id+'-title'):target.kind==='recovery'?document.getElementById('recovery-'+target.id):target.kind==='session'?document.getElementById(target.id==='activity'||target.context.projectId!==null&&dialogue.recovery.stop==='clear'?'dialogue-session-title':'overview-session-recovery'):document.getElementById(target.id.startsWith('bmad-receipt-')?target.id:'conversation-heading')
    if(!element)return
    if((target.kind==='question'||target.kind==='approval')&&!overview?.entries.some(e=>e.target.kind===target.kind&&e.target.id===target.id))setNotice(fr.overview.targetGone)
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
  function acceptDialogue(next: DialogueState): void { if(next.sequence<dialogueSequence.current)return;dialogueSequence.current=next.sequence;setDialogue(next);const launch=pendingLaunch.current;if(next.errorCode==='CONTEXT_MISMATCH'&&next.status==='error'&&launch&&next.sequence>launch.sequence&&launch.token===navigationToken.current&&launch.projectId===currentProjectId.current&&(next.context.projectId===null||next.context.projectId===launch.projectId)&&(next.invocation==='$bmad'||next.invocation==='$bmad-forge-idea'))setInitiativeConflict(true) }
  function changeApproval(approval:ApprovalRecord,adjustment:string):void{
    const id=approval.id;setApprovalDrafts(current=>({...current,[id]:adjustment}))
    const previous=approvalWrites.current.get(id)??Promise.resolve()
    const saving=previous.catch(()=>{}).then(async()=>{try{const next=await window.madnessDialogue.saveApproval(id,adjustment);acceptDialogue(next);setApprovalFailures(current=>({...current,[id]:!!next.errorCode}))}catch{setApprovalFailures(current=>({...current,[id]:true}))}})
    approvalWrites.current.set(id,saving)
  }
  async function approvalAction(approval:ApprovalRecord,decision?:ApprovalDecision):Promise<void>{
    const id=approval.id;if(sendingApprovals.current.has(id))return;sendingApprovals.current.add(id)
    try{await approvalWrites.current.get(id);const next=decision?await window.madnessDialogue.decideApproval(id,decision):await window.madnessDialogue.sendAdjustment(id);acceptDialogue(next);setApprovalFailures(current=>({...current,[id]:!!next.errorCode}))}catch{setApprovalFailures(current=>({...current,[id]:true}))}finally{sendingApprovals.current.delete(id)}
  }
  function approvalPanel(a:ApprovalRecord):ReactNode{return <ApprovalPanel key={a.id} approval={a} respondable={respondable('approval',a.id)} adjustment={approvalDrafts[a.id]??a.adjustment} projectName={project?.name??'Projet capturé'} compactContext onChange={text=>changeApproval(a,text)} onDecide={decision=>void approvalAction(a,decision)} onSendAdjustment={()=>void approvalAction(a)} canAdjust={dialogueHere&&dialogue.status==='ready'&&sameContext(a.context,dialogue.context)} bridgeFailed={approvalFailures[a.id]??false}/>}
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
  async function dialogueAction(action: 'qualify' | 'launch' | 'stop' | 'observeStop' | 'qualifyForge' | 'launchForge' | 'launchHelp'): Promise<void> {
    if (dialoguePending) return
    const projectId = project?.id
    if (action !== 'stop' && action !== 'observeStop' && !projectId) return
    const launching=action==='launch'||action==='launchForge'||action==='launchHelp'
    if((action==='launchForge'||action==='launchHelp')&&initiativeContext?.observation?.activeInitiative&&initiativeContext.selection?.initiativeId!==initiativeContext.observation.activeInitiative){setInitiativeConflict(true);return}
    const launch=launching?{token:++navigationToken.current,projectId:projectId!,previousConversationId:dialogue.context.conversationId,sequence:dialogue.sequence}:null
    if(launch){pendingLaunch.current=launch;setFocusTarget(null)}
    setDialoguePending(true)
    try { const next = action === 'stop'||action==='observeStop' ? await window.madnessDialogue[action]() : action==='launch'?await window.madnessDialogue.launch(projectId!,maryMode):await window.madnessDialogue[action](projectId!); acceptDialogue(next); setDialogueBridgeError(false) }
    catch { if(launch&&pendingLaunch.current===launch)pendingLaunch.current=null;setDialogueBridgeError(true) }
    finally { setDialoguePending(false) }
  }
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
    if (!connection.needsPlanAcknowledgement || !connection.accountStored) planConfirmationDismissed.current = false
    if (connection.needsPlanAcknowledgement && connection.accountStored && !planConfirmationDismissed.current && !['authorizing', 'verifying', 'stopping', 'closing'].includes(connection.status) && !planConfirmation.current?.open) planConfirmation.current?.showModal()
    if (!connection.needsPlanAcknowledgement && planConfirmation.current?.open) { planConfirmation.current.close(); if (connectionOpen) connectionHeading.current?.focus(); else connectionTrigger.current?.focus() }
  }, [connection.needsPlanAcknowledgement, connection.accountStored, connection.status, connectionOpen])
  function closeDrawer(): void { drawer.current?.close(); drawerTrigger.current?.focus() }
  function home(): void { const token=++navigationToken.current;setPending(false);setFocusTarget(null);setPage('home'); closeDrawer(); setTimeout(() => {if(token===navigationToken.current)heading.current?.focus()}, 0) }
  function open(): void {
    const token=++navigationToken.current;setFocusTarget(null)
    closeDrawer()
    void run(() => window.madness.chooseDirectory(), (reply) => {
      if (!reply.ok||token!==navigationToken.current) return
      if (reply.value.effect === 'cancelled') setNotice('Ouverture annulée. Aucun projet ajouté.')
      else { setPage('project'); setNotice('Contexte du dossier enregistré localement.'); setTimeout(() => {if(token===navigationToken.current)heading.current?.focus()}, 0) }
    })
  }
  function select(projectId: string): void {
    const token=++navigationToken.current;setFocusTarget(null)
    closeDrawer()
    void run(() => window.madness.selectProject(projectId), () => { if(token!==navigationToken.current)return;setPage('project'); setNotice('Projet retrouvé. Aucun agent n’a été relancé.'); setTimeout(() => {if(token===navigationToken.current)heading.current?.focus()}, 0) })
  }
  async function navigateOverview(target:OverviewTarget):Promise<void>{
    const token=++navigationToken.current;setFocusTarget(null);closeDrawer()
    if(target.context.projectId===null){setPage('home');setFocusTarget({token,target});return}
    setPending(true)
    try{
      const reply=await window.madness.selectProject(target.context.projectId)
      if(token!==navigationToken.current)return
      if(!reply.ok){accept(reply);setNotice(fr.overview.selectionFailed);return}
      const captured=target.context.conversationId===null||reply.value.state.conversations.some(c=>c.id===target.context.conversationId&&sameContext(c.context,target.context))
      if(!captured||reply.value.state.activeProjectId!==target.context.projectId){setNotice(fr.overview.selectionFailed);return}
      accept(reply);setPage('project');setTab('conversation')
      if(target.context.conversationId)setConversationSelections(current=>({...current,[target.context.projectId!]:target.context.conversationId!}))
      setFocusTarget({token,target});setNotice('Contexte capturé retrouvé. Aucun message ni accord transmis.')
    }catch{if(token===navigationToken.current)setNotice(fr.overview.selectionFailed)}
    finally{if(token===navigationToken.current)setPending(false)}
  }
  function toggleNavigation(): void {
    if (pending || !state) return
    const next = !collapsed
    setCollapsed(next)
    setPreferenceUnsaved(true)
    void run(() => window.madness.setNavigation(next), () => { setPreferenceUnsaved(false); setNotice('Préférence de navigation enregistrée.') })
  }
  function chooseTab(value:'parcours'|'conversation'):void {navigationToken.current++;setFocusTarget(null);setPending(false);setTab(value)}
  function prepareExchange():void {if(!project)return;const token=++navigationToken.current;setFocusTarget(null);setPending(false);setTab('parcours');setPreparationFocus({token,projectId:project.id})}
  function closeContext():void {setContextOpen(false);contextTrigger.current?.focus()}
  const navigation = <>
    <button className={'nav-button ' + (page === 'home' ? 'selected' : '')} aria-label={fr.home} aria-current={page === 'home' ? 'page' : undefined} title={fr.home} onClick={home}><Icon name="home" /><span className="nav-label">{fr.home}</span></button>
    <h2 className="nav-section nav-label">{fr.recent}</h2>
    {state?.projects.map(p => <button key={p.id} className={'nav-button project-link ' + (page === 'project' && p.id === project?.id ? 'selected' : '')} aria-label={'Ouvrir le projet ' + p.name} aria-current={page === 'project' && p.id === project?.id ? 'page' : undefined} title={p.name + '\n' + p.rootPath} disabled={pending} onClick={() => select(p.id)}><span className="project-glyph" aria-hidden="true"><ProjectMark name={p.name} /></span><span className="nav-label truncate">{p.name}</span></button>)}
    {!state?.projects.length && <p className="nav-note nav-label">Vos dossiers ouverts apparaîtront ici.</p>}
  </>
  return <div className={'app-shell ' + (agentConsultation ? 'agent-info-open ' : '') + (collapsed ? 'nav-compact ' : '') + (tooltipsDismissed ? 'tooltips-dismissed' : '')} onFocusCapture={event=>captureRequestFocus(event.target)} onPointerDownCapture={event=>{if(!(event.target instanceof HTMLElement)||!event.target.closest('[data-question-id],[data-approval-id]'))requestFocus.current=null}} onKeyDown={(event) => { if (event.key === 'Escape') { setTooltipsDismissed(true); if (drawer.current?.open||planConfirmation.current?.open||document.querySelector('.initiative-dialog[open]')) return; if(agentConsultation){event.preventDefault();event.stopPropagation();closeAgentInfo()}else if(contextOpen){event.preventDefault();event.stopPropagation();closeContext()}else if (connectionOpen) { event.preventDefault();event.stopPropagation(); closeConnection() } } }}>
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>Aller au contenu</a>
    <header className="topbar" onMouseLeave={()=>setTooltipsDismissed(false)} onFocusCapture={()=>setTooltipsDismissed(false)}>
      <div className="breadcrumb">
        <button className="toolbar-toggle command-control desktop-menu" type="button" aria-label={collapsed ? 'Déployer la navigation' : 'Réduire la navigation'} aria-expanded={!collapsed} aria-controls="project-navigation" onClick={toggleNavigation} aria-disabled={pending || !state}><Icon name="panel" /></button>
        <button className="toolbar-toggle command-control mobile-menu" type="button" ref={drawerTrigger} aria-label="Ouvrir la navigation" aria-haspopup="dialog" aria-controls="navigation-drawer" onClick={() => drawer.current?.showModal()}><Icon name="panel" /><span className="command-tooltip" aria-hidden="true">Ouvrir la navigation</span></button>
        <span title={page === 'project' && project ? project.name : fr.home}>{page === 'project' && project ? project.name : fr.home}</span>
      </div>
      <div className="topbar-actions">
        <button className="toolbar-toggle command-control open-project" type="button" aria-label={fr.open} onClick={open} disabled={pending || !state}><Icon name="folder" /><span className="command-tooltip" aria-hidden="true">{fr.open}</span></button>
        <button className="toolbar-toggle command-control theme-toggle" type="button" aria-label={themeLabel} aria-disabled={appearancePending} onClick={() => void toggleTheme()}><Icon name={appearance.theme === 'dark' ? 'sun' : 'moon'} /><span className="command-tooltip" aria-hidden="true">{themeLabel}</span></button>
        <button className={'codex-trigger ' + (connection.status === 'verified' ? 'codex-verified' : '')} type="button" ref={connectionTrigger} aria-label={connectionLabel} title={connectionLabel} aria-expanded={connectionOpen} aria-controls="codex-connection-panel" aria-haspopup="dialog" onClick={() => { if (connectionOpen) closeConnection(); else openConnection() }}><img src={chatgptMark} alt="" /><span className="connection-tooltip" aria-hidden="true">{connectionLabel}</span></button>
      </div>
    </header>
    <WindowCaptionPlates />
    {connectionOpen && <section id="codex-connection-panel" className="connection-panel" role="dialog" aria-modal="false" aria-labelledby="codex-connection-title" ref={connectionPanel}>
      <div className="connection-heading"><h2 id="codex-connection-title" ref={connectionHeading} tabIndex={-1}>Connexion Codex</h2><button type="button" aria-label="Fermer la connexion Codex" onClick={closeConnection}><Icon name="close" /></button></div>
      <p className={'connection-state ' + (connection.status === 'verified' ? 'is-verified' : '')} role="status">{fr.connectionStatus[connection.status]}</p>
      {connection.status === 'verified' ? <p>Un tour témoin Codex a réussi et son processus est arrêté.{connection.verifiedAt && <> Vérifié le {new Date(connection.verifiedAt).toLocaleString('fr-FR')}.</>}{connection.cliVersion && <> Codex {connection.cliVersion}.</>}</p> : connection.accountStored ? <p>Votre compte est enregistré dans le coffre chiffré Windows. Il reste à vérifier pour cet usage ; aucune conversation n’est relancée.</p> : <p>Connectez votre compte ChatGPT dans le navigateur Windows. Madness conserve ses propres accès chiffrés sur cet ordinateur.</p>}
      {connection.status === 'authorizing' && <p>Terminez l’autorisation dans votre navigateur. L’attente expire après dix minutes.</p>}
      {connection.status === 'verifying' && <p>Un petit tour de vérification est en cours. Le résultat attend la fin du tour et l’arrêt confirmé de Codex.</p>}
      {connection.status === 'stopping' && <p>Arrêt de l’attente et du moteur Codex lancé par Madness. Aucun nouveau témoin n’est envoyé.</p>}
      {connection.errorCode && <p className={connection.errorCode === 'CANCELLED' ? 'connection-cancelled' : 'connection-error'} role={connection.status === 'error' || connection.status === 'unknown' ? 'alert' : undefined}>{fr.connectionErrors[connection.errorCode]}</p>}
      {connection.errorCode === 'NETWORK_UNAVAILABLE' && <NetworkHelp connection={connection} onChanged={acceptConnection}/>}
      {connectionBridgeError && <p className="connection-error" role="alert">Le pont de connexion ne répond pas. Rouvrez le panneau ou redémarrez Madness. Vos projets et brouillons sont conservés.</p>}
      <p className="connection-consumption">La vérification envoie un court message témoin et consomme votre forfait ChatGPT. Les limites de ce forfait s’appliquent.</p>
      <div className="connection-actions">
        {connection.errorCode==='STOP_UNCONFIRMED'&&<button className="secondary" type="button" onClick={()=>void dialogueAction('observeStop')} disabled={dialoguePending||dialogueBusy||connectionBusy}>{fr.recovery.observeStop}</button>}
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
      <div className="rail-signature" aria-hidden="true"><img src={madnessMark} alt="" width="28" height="28" /></div>
      <p className="sidebar-bottom nav-label">Données locales<br />Français · thème {appearance.theme === 'dark' ? 'sombre' : 'clair'}</p>
    </aside>
    <div className="workspace">
      <div className="workspace-body">
        <main id="main" tabIndex={-1}>
          <div className="main-inner">
            {error && <div className="error-message" role="alert"><strong>L’opération n’a pas abouti</strong><p>{error}</p>{!state && <button className="secondary" onClick={() => void load()} disabled={pending}>Relire le contexte local</button>}</div>}
            {state&&(page==='home'||!project?<div className="page-intro atelier-header"><div><h1 ref={heading} tabIndex={-1}>Vos projets, au même endroit</h1><p>Retrouvez un dossier et préparez la suite de votre travail.</p></div></div>:<><div className="atelier-header project-banner"><div className="project-heading"><h1 ref={heading} tabIndex={-1}>{project.name}</h1><button className="toolbar-toggle command-control context-trigger" type="button" ref={contextTrigger} aria-label="Contexte du projet" aria-expanded={contextOpen} aria-controls="project-context-panel" aria-haspopup="dialog" onFocus={()=>setTooltipsDismissed(false)} onMouseLeave={()=>setTooltipsDismissed(false)} onClick={()=>{if(contextOpen)closeContext();else{closeAgentInfo(false);setConnectionOpen(false);setContextOpen(true)}}}><Icon name="panel"/><span className="command-tooltip" aria-hidden="true">Contexte du projet</span></button></div>
              <InitiativeSelector key={project.id} projectId={project.id} project={initiativeContext} accept={acceptBmadContext} onOpen={()=>{closeAgentInfo(false);setConnectionOpen(false);setContextOpen(false)}} priority={!!planConfirmation.current?.open||!!drawer.current?.open} conflict={initiativeConflict} onDismissConflict={()=>setInitiativeConflict(false)}/>
              {conversation&&<p className="context-note">Initiative capturée par cet échange : {conversation.context.initiativeId??'non identifiée'}</p>}
              </div>
              <div className="project-tabs" role="tablist" aria-label="Vues du projet">{(['parcours', 'conversation'] as const).map((item) => <button key={item} id={'tab-' + item} type="button" role="tab" aria-selected={tab === item} aria-controls={'panel-' + item} tabIndex={tab === item ? 0 : -1} onClick={() => chooseTab(item)} onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = item === 'parcours' ? 'conversation' : 'parcours'; const selected = event.key === 'Home' ? 'parcours' : event.key === 'End' ? 'conversation' : next; chooseTab(selected); document.getElementById('tab-' + selected)?.focus() } }}>{item === 'parcours' ? 'Parcours' : 'Conversation'}</button>)}</div>
</>)}
            {overview&&<WorkOverview overview={overview} projectId={page==='project'?project?.id??null:null} compact={page==='project'&&tab==='conversation'} stopUnconfirmed={dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED'} onNavigate={target=>void navigateOverview(target)} onConnection={openConnection}/>}
            {dialogue.context.projectId===null&&(dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode)&&<details className="recovery-details global-recovery"><summary>Détails de la récupération globale</summary><section id="overview-session-recovery" tabIndex={-1} aria-label="Récupération globale"><RecoveryPanel state={dialogue} projectId={null} busy={dialoguePending||dialogueBusy} sessionPresent={sessionPresent} onObserveStop={()=>void dialogueAction('observeStop')} onInspect={()=>{}} onPrepare={()=>{}}/>{dialogue.errorCode&&<p className="connection-error">{fr.dialogueErrors[dialogue.errorCode]}</p>}{dialogue.errorCode==='NETWORK_UNAVAILABLE'&&<NetworkHelp connection={connection} onChanged={acceptConnection}/>}</section></details>}
            {!state ? <section className="empty-state"><h1 ref={heading} tabIndex={-1}>Retrouver votre espace de travail</h1><p>{pending ? 'Lecture du contexte local…' : 'Le contexte local est indisponible. Utilisez le message ci-dessus pour réessayer.'}</p></section> : page === 'home' || !project ? <>

              {state.projects.length === 0 ? <section className="welcome"><h2>Commencez par un dossier</h2><p>Ouvrez un projet local pour conserver son contexte et y préparer un brouillon. Le dossier reste intact.</p><p className="reason"><strong>Pourquoi maintenant ?</strong> Madness doit connaître le projet auquel rattacher votre saisie.</p></section> : <section aria-labelledby="recent-heading"><h2 id="recent-heading">{fr.recent}</h2><div className="project-list">{state.projects.map(p => <button className="project-row" key={p.id} onClick={() => select(p.id)} disabled={pending}><span className="project-avatar" aria-hidden="true"><ProjectMark name={p.name} /></span><span className="project-info"><strong>{p.name}</strong><code>{p.rootPath}</code><small>Contexte conservé localement</small></span><Icon name="arrow" /></button>)}</div></section>}
              <div className="home-note"><h2>Connectez votre compte depuis le logo Codex</h2><p>{fr.codexReason} Les preuves BMad se lisent dans Parcours, sans connexion. L’initialisation et le graphe restent à venir.</p></div>
            </> : <>
              <section id={'panel-' + tab} role="tabpanel" aria-labelledby={'tab-' + tab}>
                <div hidden={tab!=='parcours'}><ProjectResume active={tab==='parcours'} rootPath={project.rootPath} projectId={project.id} context={initiativeContext} value={progressState.projects.find(p=>p.projectId===project.id)} overview={overview} accept={acceptProgress} onNavigate={target=>void navigateOverview(target)} onChoose={()=>document.querySelector<HTMLButtonElement>('.initiative-trigger')?.click()} busy={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'} stopUnconfirmed={dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED'}/></div>
                {tab==='parcours'&&<HelpPanel stopUnconfirmed={dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED'} state={helpState} onChanged={acceptHelp} onOpen={record=>void navigateOverview({kind:'conversation',context:record.context,id:'bmad-receipt-'+record.conversationId})} onObserveStop={()=>void dialogueAction('observeStop')} projectId={project.id} busy={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'} allowed={connection.accountStored&&!connection.needsPlanAcknowledgement&&!connectionBusy&&!dialogueBridgeError} onLaunch={()=>void dialogueAction('launchHelp')}/>}
                {tab === 'parcours' && <div className="exchange-preparation"><p className="preparation-intro">Préparez un échange avec Mary pour préciser votre projet, ou avec Forge pour éprouver une nouvelle idée. Qualification et lancement restent explicites.</p><section className="forge-launch" aria-labelledby="forge-title">
                  <div className="dialogue-heading"><h2 id="forge-title">Mettre une idée à l’épreuve</h2>{dialogueHere&&dialogue.invocation==='$bmad-forge-idea'&&<span className="badge" role="status">Forge · {displayedDialogueStatus}</span>}</div>
                  <p>Forge confronte une nouvelle idée à plusieurs points de vue, puis conserve un journal et un rapport. Chaque tour utilise votre forfait ChatGPT.</p>
                  <button className="secondary" type="button" aria-expanded={forgePreparation} aria-controls="forge-preparation" onClick={()=>setForgePreparation(v=>!v)}>Préparer Forge</button>
                  {forgePreparation&&<div id="forge-preparation" className="forge-preparation">
                    <p><code>$bmad-forge-idea</code> · Forge natif installé · Codex</p>
                    <dl><dt>Projet destinataire</dt><dd>{project.name} · <code>{project.rootPath}</code></dd><dt>Effets autorisés</dt><dd>Une nouvelle session <code>forge-{'{slug}'}</code> dans la sortie BMad résolue de ce projet. Journal natif et HTML obligatoires ; Markdown supplémentaire si l’idée est renforcée (HARDENED).</dd><dt>Sortie vérifiée</dt><dd>{dialogueHere&&dialogue.invocation==='$bmad-forge-idea'&&dialogue.profile?.outputBase?<code>{dialogue.profile.outputBase}</code>:'Vérifiez le profil pour connaître le chemin exact.'}</dd></dl>
                    <p className="small muted">Le lancement transmet uniquement l’invocation, jamais votre brouillon. Codex reste en lecture seule ; seules les commandes de cette session peuvent écrire. Hooks, reprise, autres workflows et approbations indisponibles bloquent l’action. Le HTML reste un fichier, sans exécution dans Madness.</p>
                    <div className="dialogue-actions"><button className="secondary" type="button" onClick={()=>void dialogueAction('qualifyForge')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status==='unknown'||dialogueBridgeError}>Vérifier le profil Forge</button><button id="forge-launch" className="primary" type="button" aria-describedby={forgePrerequisite?'forge-launch-prerequisite':undefined} onClick={()=>void dialogueAction('launchForge')} disabled={dialoguePending||dialogueBusy||sessionPresent||dialogue.status!=='qualified'||!dialogueHere||dialogue.invocation!=='$bmad-forge-idea'||!connection.accountStored||connection.needsPlanAcknowledgement||connectionBusy||dialogueBridgeError}>Lancer Forge avec Codex</button></div>
                    {forgePrerequisite&&<p id="forge-launch-prerequisite" className="small">{fr.dialoguePrerequisites[forgePrerequisite]}{' '}{forgePrerequisite==='account'?<button className="text-button" type="button" onClick={openConnection}>Ouvrir le panneau Codex</button>:<button className="text-button" type="button" onClick={()=>planConfirmation.current?.showModal()}>Relire le rappel du forfait</button>}</p>}
                  </div>}
                </section>
                <div className="dialogue-launch" aria-labelledby="mary-title">
                  <div className="dialogue-heading"><h2 id="mary-title" tabIndex={-1}>Mary <span>Analyste BMad · Codex</span></h2>{dialogueHere&&dialogue.invocation==='$bmad-agent-analyst' && <span className="badge" role="status">Mary · {displayedDialogueStatus}</span>}</div>
                  <p><code>$bmad-agent-analyst</code></p>
                  <p>Le lancement vérifie les vrais fichiers BMad puis demande l’accueil de Mary. Chaque tour utilise votre forfait ChatGPT.</p>
                  <label className="approval-mode"><input type="checkbox" checked={sessionPresent&&dialogueHere&&dialogue.invocation==='$bmad-agent-analyst'?dialogue.mode==='file-approval':maryMode==='file-approval'} disabled={dialoguePending||dialogueBusy||sessionPresent} onChange={event=>setMaryMode(event.target.checked?'file-approval':'read-only')}/>Proposer des modifications avec approbation</label>
                  <p className="small">{sessionPresent&&dialogueHere?'Mode capturé : '+(dialogue.mode==='file-approval'?'fichiers avec accord ponctuel.':'lecture seule.') : maryMode==='file-approval'?'Mary pourra proposer un patch complet à autoriser ou refuser. Shell désactivé ; aucun accord global.':'Lecture seule par défaut ; aucune écriture native autorisée.'}</p>
                  <p className="small muted">Les workflows du menu restent indisponibles dans ce pilote. Le mode fichiers ajoute seulement des patches natifs avec accord ponctuel ; chaque nouvelle proposition demande un nouveau choix.</p>
                  <div className="dialogue-actions">
                    <button id="mary-launch" className="primary" type="button" onClick={() => void dialogueAction('launch')} disabled={dialoguePending || dialogueBusy || sessionPresent || dialogue.status === 'unknown' || !connection.accountStored || connection.needsPlanAcknowledgement || connectionBusy || dialogueBridgeError}><Icon name="message" />Lancer Mary avec Codex</button>
                    <button className="secondary" type="button" onClick={() => void dialogueAction('qualify')} disabled={dialoguePending || dialogueBusy || sessionPresent || dialogue.status === 'unknown' || dialogueBridgeError}>Vérifier ce projet</button>
                  </div>
                  {!connection.accountStored && <p className="small">{fr.dialoguePrerequisites.account}</p>}
                  {connection.needsPlanAcknowledgement && <p className="small">{fr.dialoguePrerequisites.plan}</p>}
                </div>
                </div>}

                {((dialogueHere&&dialogue.errorCode==='NETWORK_UNAVAILABLE')||dialogue.errorCode==='NETWORK_UNAVAILABLE'&&dialogue.context.projectId===null)&&<NetworkHelp connection={connection} onChanged={acceptConnection}/>}
                {sessionFeedback&&!(tab==='conversation'&&(dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode==='STOP_UNCONFIRMED')&&!sessionPresent&&!dialogueBusy)&&<section className="dialogue-session" aria-labelledby="dialogue-session-title">
                  <h2 id="dialogue-session-title" tabIndex={-1}>Session {dialogue.context.projectId?displayedRecipient:'BMad'} · Codex</h2>
                  {(sessionPresent||dialogueBusy)&&<div className="dialogue-actions"><button className="secondary" type="button" onClick={()=>void dialogueAction('stop')} disabled={dialoguePending||dialogue.status==='stopping'}><Icon name="close"/>Arrêter Codex</button></div>}
                  {!dialogueHere && sessionPresent && <p className="small">{displayedRecipient} · {displayedDialogueStatus} dans {state.projects.find(p => p.id === dialogue.context.projectId)?.name ?? 'un autre projet'}. Retrouvez ce projet pour consulter la session, ou arrêtez Codex.</p>}
                  {(dialogueHere || dialogue.status === 'unknown') && dialogue.errorCode && <div className="connection-error" role="alert"><p>{fr.dialogueErrors[dialogue.errorCode]}</p>{!dialogueHere && dialogue.context.projectId && <button className="text-button" type="button" onClick={() => select(dialogue.context.projectId!)} disabled={pending}>Retrouver {state.projects.find(p => p.id === dialogue.context.projectId)?.name ?? 'le projet de la session'}</button>}</div>}
                  {dialogueBridgeError && <p className="connection-error" role="alert">Le pont du dialogue ne répond pas. Votre brouillon est conservé ; redémarrez Madness après avoir vérifié l’arrêt de Codex.</p>}
                  {dialogueHere && dialogue.profile && <details className="dialogue-proof"><summary>Profil BMad vérifié</summary><p><code>{dialogue.profile.skillPath}</code></p><p className="small">Empreinte : <code>{dialogue.profile.fingerprint}</code></p></details>}
                </section>}

                {tab === 'conversation' && (conversation ? <div className="conversation-history" aria-label="Échanges BMad"><h2 id="conversation-heading" tabIndex={-1}>Conversation <code className="conversation-reference">{conversation.id}</code></h2>
                  {!canReply && !dialogueBusy && <p className="history-note">Historique conservé. Aucun moteur n’est relancé. Un lancement explicite ouvre une nouvelle conversation ; la reprise Forge est indisponible.</p>}

                  {conversationQuestions.filter(q=>currentRequest('question',q.id)).map(q=><QuestionPanel key={q.id} question={q} respondable={respondable('question',q.id)} values={questionDrafts[q.id]??q.values} projectName={project.name} compactContext onChange={values=>changeQuestion(q,values)} onSend={()=>void answerQuestion(q)} bridgeFailed={questionFailures[q.id]??false}/>)}
                  {conversationApprovals.filter(a=>currentRequest('approval',a.id)).map(approvalPanel)}
                  <ConversationMessages key={conversation.id} conversation={conversation} projections={dialogue.messages??[]} positions={readingPositions.current} onConsult={consultAgent}/>


                  {dialogueConversationHere && <p className="turn-status" role="status">{displayedRecipient} · {displayedDialogueStatus}{dialogue.status === 'running' && !activeQuestion && !activeApproval && (dialogue.acknowledged ? ' · envoi acquitté et enregistré' : ' · accusé d’envoi attendu')}{dialogue.status === 'ready' && ' · tour terminé, prochaine action : votre réponse. La fin du tour ne valide aucun livrable.'}</p>}
                </div> : <div className="conversation-empty"><h2>Aucun échange enregistré</h2><p>Un lancement explicite ouvre une session sans envoyer votre brouillon.</p></div>)}

                {tab==='conversation'&&<form className="composer" onSubmit={(event) => { event.preventDefault(); const projectId = project.id; const value = text; void run(() => window.madness.saveDraft(projectId, value), () => setNotice(fr.saved)) }}>
                  <label htmlFor="draft">{nativeAwaiting?'Brouillon libre pour ce projet':canReply || dialogueConversationHere && sessionPresent ? 'Votre réponse à '+recipient : 'Brouillon pour ' + project.name}</label>
                  <textarea id="draft" value={text} onChange={(event) => setTexts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={MAX_DRAFT_LENGTH} aria-describedby="draft-status draft-limit" placeholder="Notez ce que vous souhaitez reprendre dans ce projet…" />
                  <div className="composer-bottom"><p id="draft-status">{dirty ? fr.unsaved : saved ? fr.saved : fr.noDraft}</p><div className="composer-actions"><button className="secondary" type="submit" disabled={pending || !dirty}>{pending ? fr.saving : fr.save}</button>{dialogueConversationHere && sessionPresent && <button className="primary" type="button" onClick={() => void sendToMary()} disabled={!canReply || dialoguePending || !text.trim()}><Icon name="arrow" />Envoyer à {recipient}</button>}</div></div>
                  <p className="small muted" id="draft-limit">{nativeAwaiting?'La réponse ou la décision se donne dans le formulaire de la demande corrélée lorsqu’elle est active. Ce brouillon libre se sauvegarde séparément, sans envoi.':canReply ? 'Seul « Envoyer à '+recipient+' » transmet ce texte. Le brouillon est enregistré avant l’envoi et reste disponible.' : 'Saisie conservée localement · aucun envoi automatique'} · 100 000 caractères maximum</p>
                </form>}
                {tab==='conversation'&&<button className="text-button prepare-exchange" type="button" onClick={prepareExchange}>Préparer un échange</button>}
                {(dialogue.recovery.stop==='unconfirmed'||dialogue.approvals.some(a=>a.context.projectId===project.id&&a.decision==='accept'&&(['unknown','pending'].includes(a.effect)||a.storage!=='stored')))&&<details className="recovery-details"><summary>Détails de récupération et inspection</summary><div id={dialogue.context.projectId!==null?"overview-session-recovery":undefined} tabIndex={-1}><RecoveryPanel state={dialogue} projectId={project.id} busy={dialoguePending||dialogueBusy} sessionPresent={sessionPresent} onObserveStop={()=>void dialogueAction('observeStop')} onInspect={id=>void inspectApproval(id)} onPrepare={prepareExchange}/></div></details>}
                {tab==='conversation'&&(historicalQuestions.length>0||historicalApprovals.length>0)&&<details className="request-history"><summary>Demandes conservées · inactives ({historicalQuestions.length+historicalApprovals.length})</summary>{historicalQuestions.map(q=><QuestionPanel key={q.id} question={q} respondable={respondable('question',q.id)} values={questionDrafts[q.id]??q.values} projectName={project.name} compactContext onChange={values=>changeQuestion(q,values)} onSend={()=>void answerQuestion(q)} bridgeFailed={questionFailures[q.id]??false}/>)}{historicalApprovals.map(approvalPanel)}</details>}
                  {tab==='conversation'&&conversation&&projectConversations.length > 1 && <details className="previous-conversations"><summary>Conversations précédentes ({projectConversations.length - 1})</summary>{projectConversations.filter(c => c.id !== conversation.id).map(c => <section key={c.id} aria-label="Conversation historique"><HelpReceiptPanel record={helpState.records.find(r=>r.conversationId===c.id)} onChanged={acceptHelp}/><ConversationMessages key={c.id} conversation={c} projections={dialogue.messages??[]} positions={readingPositions.current} onConsult={consultAgent}/>{dialogue.questions.filter(q=>q.context.conversationId===c.id).map(q=><QuestionPanel key={q.id} question={q} respondable={respondable('question',q.id)} values={questionDrafts[q.id]??q.values} projectName={project.name} compactContext onChange={values=>changeQuestion(q,values)} onSend={()=>void answerQuestion(q)} bridgeFailed={questionFailures[q.id]??false}/>)}{dialogue.approvals.filter(a=>a.context.conversationId===c.id).map(approvalPanel)}{dialogue.workflows.filter(w=>w.conversationId===c.id).map(w=><WorkflowResult key={w.conversationId} workflow={w} onCopy={copyWorkflow}/>)}</section>)}</details>}
                {tab==='conversation'&&conversation&&<HelpReceiptPanel record={helpState.records.find(r=>r.conversationId===conversation.id)} onChanged={acceptHelp}/>}
                {workflow&&<WorkflowResult key={workflow.conversationId} workflow={workflow} onCopy={copyWorkflow}/>}
                {dialogueHere && dialogue.activities.length > 0 && <details className="dialogue-activity"><summary>Activité du dialogue ({dialogue.activities.length})</summary><ol>{dialogue.activities.map((entry, index) => <li key={index}>{entry}</li>)}</ol></details>}
              </section>
            </>}
            {preferenceUnsaved && <p className="preference-note">Le choix de navigation s’applique à cette session ; sa sauvegarde n’est pas confirmée.</p>}
            {appearance.warning && <p className="appearance-warning" role="status" aria-live="polite">{appearance.warning === 'read-failed' ? 'La préférence de thème ne peut pas être lue. Le thème sombre est utilisé ; le fichier existant est conservé.' : 'Le thème choisi s’applique à cette session ; sa sauvegarde n’est pas confirmée. Le fichier existant est conservé.'}</p>}
            {appearanceBridgeError && <p className="appearance-warning" role="status" aria-live="polite">{appearanceBridgeError === 'read' ? 'Le thème n’a pas pu être restauré. Réessayez avec la commande de thème ; votre contexte reste disponible.' : 'Le thème n’a pas pu être changé. Réessayez ; votre contexte et votre saisie sont conservés.'}</p>}
            <p className="status-line" role="status" aria-live="polite">{notice}</p>
          </div>
        </main>
        {agentConsultation&&<AgentInfoPanel key={agentConsultation.message.context.conversationId+':'+agentConsultation.message.id} consultation={agentConsultation} entries={overview?.entries??[]} onClose={()=>closeAgentInfo()} onNavigate={target=>{closeAgentInfo(false);void navigateOverview(target)}}/>}
      </div>
    </div>
    </div>
        {contextOpen && page === 'project' && project && <section id="project-context-panel" className="context-panel" role="dialog" aria-modal="false" aria-labelledby="project-context-title"><div className="connection-heading"><h2 id="project-context-title" ref={contextHeading} tabIndex={-1}>Contexte du projet</h2><button type="button" aria-label="Fermer le contexte du projet" onClick={closeContext}><Icon name="close"/></button></div><p>Source : dossier choisi via Windows.</p><dl><dt>Dossier canonique</dt><dd><code>{project.rootPath}</code></dd><dt>Conversation sélectionnée</dt><dd><code>{conversation?.id??'Aucune'}</code></dd><InitiativeContext project={initiativeContext}/><dt>Initiative capturée par la conversation</dt><dd>{conversation?conversation.context.initiativeId??'Non identifiée':'Aucune conversation sélectionnée'}</dd><dt>Conservation</dt><dd>Échanges, observations et brouillon dans les données locales de Madness.</dd><dt>Activité</dt><dd>{dialogueHere ? displayedDialogueStatus : 'Aucun agent actif dans ce projet'}</dd><dt>Fournisseur</dt><dd>Codex · connexion propre à Madness</dd><dt>Fichiers du projet</dt><dd>{workflow?'Écritures bornées à la nouvelle session Forge capturée.':'Mary en lecture seule par défaut ; mode fichiers avec approbation à activer avant lancement.'}</dd></dl></section>}
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
