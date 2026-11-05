import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import type {BmadConfigurationObservation} from '../../contracts/bmad-context.ts'
import {initializationNeedsInspection} from '../../contracts/bmad-initialization.ts'
import type {
 InitializationAttempt, InitializationCommand, InitializationContent, InitializationEntry, InitializationIssueCode,
 InitializationOperation, InitializationPlan, InitializationRequest, InitializationView
} from '../../contracts/bmad-initialization.ts'
import {useLocale} from './Locale.tsx'
import {formatCount,formatNumber} from './locale-format.ts'
import './initialization.css'

const copy = {
 fr: {
  diagnostic:'Diagnostic et initialisation', view:'Voir le diagnostic', viewPlan:'Voir le plan', activity:'Suivre l’opération', result:'Voir le résultat', back:'Revenir au travail',
  absent:'BMad absent', unavailable:'Initialisation indisponible', storage:'Reçus locaux illisibles',
  observed:'La préparation vérifie l’absence, le dossier physique et les octets du profil.',
  needsObservation:'L’absence de BMad doit être établie dans ce dossier.', refresh:'Actualiser le diagnostic',
  profile:'Source locale épinglée · 6.13.0-next', scope:'27 compétences et 3 records non invocables',
  missing:'Membre recommandé absent', preparing:'Préparation privée en cours — aucun ajout dans le projet',
  prepare:'Préparer l’initialisation', again:'Préparer de nouveau', cancel:'Annuler la préparation', close:'Fermer',
  title:'Plan d’initialisation', folder:'Dossier cible', plan:'Plan', file:'Fichier', directory:'Répertoire', directories:'répertoires',
  parents:'Identité du dossier et du parent', preconditions:'Préconditions et paramètres', payload:'Empreinte du contenu prévu',
  configuration:'Observation de configuration', source:'Empreinte de la source locale', target:'Inventaire avant application',
  parent:'État du parent', additions:'Voir tous les ajouts', preserved:'Données préservées', none:'Aucune entrée',
  preview:'Voir le contenu prévu', previewError:'Contenu indisponible pour ce plan', base64:'Contenu binaire (Base64)',
  preparation:'Madness prépare en privé les ajouts à partir du profil local embarqué. Aucun outil n’est exécuté dans le dossier cible.',
  limits:'Limites', limitProfile:'Dossiers locaux Windows et profil épinglé. Seuls les ajouts affichés sont autorisés.',
  limitBounds:'Nom de projet de 1 à 80 caractères. Arbre limité à 2 048 entrées, 20 niveaux, 1 Mio par fichier et 16 Mio au total.',
  limitWrites:'Écriture séquentielle, sans écrasement ni suppression. Le retour arrière et l’arrêt après un premier ajout restent incertains.',
  limitRaces:'Les contrôles de chemins réduisent les risques. Une modification concurrente externe peut produire un résultat partiel ou inconnu.',
  lock:'Le verrou local Skills est exclu de ce transfert.', historicalPlan:'Plan historique — décision inactive',
  historical:'Résultat historique — état actuel à inspecter',
  decision:'Ouvrir la décision', apply:'Initialiser BMad', refuse:'Refuser ce plan', only:'Autorise uniquement les ajouts du plan',
  checking:'Vérification avant application…', applying:'Application en cours — effets possibles', verifying:'Contrôle des ajouts en cours…',
  duplicate:'Opération déjà en cours pour ce dossier', saveFailed:'Résultat en session — enregistrement non confirmé',
  savePending:'Enregistrement en cours…', retrySave:'Réessayer l’enregistrement', previous:'Tentatives précédentes',
  observedAdditions:'Ajouts observés', unverified:'Entrées non vérifiées', preservation:'Données préexistantes vérifiées',
  yes:'Oui', unknown:'Inconnu', reason:'Motif',
  outcomes:{
   none:'',verified:'Ajouts vérifiés selon le plan','failed-no-effect':'Application échouée avant tout ajout',
   partial:'Résultat partiel — inspection requise',unknown:'Résultat inconnu — inspection requise',
   stale:'Plan périmé — préparer de nouveau',refused:'Plan refusé — aucun ajout dans le projet',
   cancelled:'Préparation annulée — aucun ajout dans le projet','preparation-failed':'Préparation échouée — aucun ajout dans le projet'
  }
 },
 en: {
  diagnostic:'Diagnostics and initialization', view:'View diagnostics', viewPlan:'View plan', activity:'View operation', result:'View result', back:'Return to work',
  absent:'BMad absent', unavailable:'Initialization unavailable', storage:'Local receipts unreadable',
  observed:'Preparation checks absence, the physical folder and the profile bytes.',
  needsObservation:'BMad absence must be established in this folder.', refresh:'Refresh diagnostics',
  profile:'Pinned local source · 6.13.0-next', scope:'27 skills and 3 non-invocable records',
  missing:'Recommended member missing', preparing:'Preparing privately — no additions to the project',
  prepare:'Prepare initialization', again:'Prepare again', cancel:'Cancel preparation', close:'Close',
  title:'Initialization plan', folder:'Target folder', plan:'Plan', file:'File', directory:'Directory', directories:'directories',
  parents:'Folder and parent identity', preconditions:'Preconditions and parameters', payload:'Planned contents fingerprint',
  configuration:'Configuration observation', source:'Local source fingerprint', target:'Inventory before applying',
  parent:'Parent state', additions:'View all additions', preserved:'Preserved data', none:'No entries',
  preview:'View planned contents', previewError:'Contents unavailable for this plan', base64:'Binary contents (Base64)',
  preparation:'Madness prepares the additions privately from the bundled local profile. No tool runs in the target folder.',
  limits:'Limits', limitProfile:'Local Windows folders and the pinned profile. Only the listed additions are authorized.',
  limitBounds:'Project names of 1 to 80 characters. Tree limited to 2,048 entries, 20 levels, 1 MiB per file and 16 MiB in total.',
  limitWrites:'Sequential additions with no overwriting or deletion. Rollback and stopping after the first addition remain uncertain.',
  limitRaces:'Path checks reduce risk. A concurrent external change can leave a partial or unknown result.',
  lock:'The local Skills lock is excluded from this transfer.', historicalPlan:'Historical plan — decision inactive',
  historical:'Historical result — inspect current state',
  decision:'Open decision', apply:'Initialize BMad', refuse:'Reject this plan', only:'Authorizes only the additions in plan',
  checking:'Checking before applying…', applying:'Applying — effects possible', verifying:'Checking additions…',
  duplicate:'An operation is already running for this folder', saveFailed:'Result kept for this session — save not confirmed',
  savePending:'Saving…', retrySave:'Retry save', previous:'Previous attempts',
  observedAdditions:'Observed additions', unverified:'Unverified entries', preservation:'Pre-existing data verified',
  yes:'Yes', unknown:'Unknown', reason:'Reason',
  outcomes:{
   none:'',verified:'Additions verified against the plan','failed-no-effect':'Application failed before any additions',
   partial:'Partial result — inspection required',unknown:'Outcome unknown — inspection required',
   stale:'Plan out of date — prepare again',refused:'Plan rejected — no additions to the project',
   cancelled:'Preparation cancelled — no additions to the project','preparation-failed':'Preparation failed — no additions to the project'
  }
 }
} as const
const attempt = (op:InitializationAttempt) => ({projectId:op.projectId,attemptId:op.attemptId,generation:op.generation})
const decision = (op:InitializationOperation,type:InitializationCommand['type']):InitializationRequest => ({
 type:'decision',projectId:op.projectId,
 command:{contractVersion:1,...attempt(op),planId:op.plan!.id,planRevision:op.plan!.revision,
  ...(type==='approve'?{type,confirmation:'initialize-exact-plan'}:{type})}
})
const preEffect = (op:InitializationOperation):boolean => ['preparing','ready','checking'].includes(op.phase)
const latest = (state:InitializationView|null):InitializationOperation|undefined =>
 state?.operations.reduce<InitializationOperation|undefined>((old,op)=>!old||op.generation>old.generation?op:old,undefined)

export function useInitialization(projectId:string|undefined):[InitializationView|null,(value:InitializationView)=>void] {
 const [state,setState] = useState<InitializationView|null>(null)
 const activeProject=useRef(projectId)
 useLayoutEffect(()=>{activeProject.current=projectId},[projectId])
 useEffect(()=>{
  const bridge=window.madnessBmadInitialization
  if (!projectId||!bridge) return
  let alive=true
  const accept=(value:InitializationView):void=>{
   if (alive&&value.projectId===projectId) setState(old=>old?.projectId===projectId&&old.sequence>value.sequence?old:value)
  }
  const unsubscribe=bridge.onChanged(accept)
  void bridge.request({type:'read',projectId}).then(reply=>accept(reply.state)).catch(()=>{})
  return ()=>{alive=false;unsubscribe()}
 },[projectId])
 return [state?.projectId===projectId?state:null,value=>{
  if(value.projectId===activeProject.current)setState(old=>old?.projectId===value.projectId&&old.sequence>value.sequence?old:value)
 }]
}

export function InitializationEntryPoint({state,onOpen}:{state:InitializationView|null;onOpen:(element:HTMLElement,attemptId:string|null)=>void}):ReactNode {
 const {language}=useLocale(), words=copy[language], operation=latest(state)
 const message=operation&&status(operation,words)
 const label=!operation?words.view:operation.result.outcome!=='none'?words.result:operation.plan&&
  (operation.phase==='ready'||operation.phase==='historical')?words.viewPlan:words.activity
 return <div className="initialization-entry">
  {message&&<span role="status">{message}{operation.preservation.status==='failed'?' · '+words.saveFailed:''}</span>}
  <button className="text-button" type="button" onClick={event=>onOpen(event.currentTarget,operation?.attemptId??null)}>{label}</button>
 </div>
}
type Words = typeof copy[keyof typeof copy]
function status(op:InitializationOperation,words:Words):string {
 switch(op.phase){
  case 'preparing':return words.preparing
  case 'checking':return words.checking
  case 'applying':return words.applying
  case 'verifying':return words.verifying
  case 'ready':return words.title
  case 'historical':return op.plan&&op.result.outcome==='none'?words.historicalPlan:words.outcomes[op.result.outcome]
  default:return words.outcomes[op.result.outcome]
 }
}
function failureReason(reason:string,language:keyof typeof copy):string {
 const fr=language==='fr'
 if (reason==='RESERVED_COLLISION') return fr
  ? 'Collision avec un nom réservé parmi .agents, _bmad, _bmad-output et skills-lock.json.'
  : 'Collision with a reserved name among .agents, _bmad, _bmad-output and skills-lock.json.'
 if (reason==='PROJECT_NAME_REFUSED') return fr?'Nom de dossier hors du profil admissible.':'Folder name outside the supported profile.'
 if (reason.startsWith('TREE_LIMIT')) return fr?'Arbre hors limites ou noms en collision.':'Tree limit or name collision.'
 if (reason.startsWith('UNSAFE_')) return fr?'Type ou chemin non admis dans l’inventaire.':'An inventory entry has an unsupported path or type.'
 if (reason==='RESOURCE_MISSING') return fr?'Profil local introuvable. Vérifiez les ressources de Madness avant de préparer de nouveau.':'Local profile missing. Check the Madness resources before preparing again.'
 if (reason==='RESOURCE_SEAL') return fr?'Intégrité du profil local non vérifiée. Vérifiez les ressources de Madness avant de préparer de nouveau.':'Local profile integrity could not be verified. Check the Madness resources before preparing again.'
 if (reason==='RESOURCE_CHANGED') return fr?'Le profil local a changé. Préparez un nouveau plan.':'The local profile changed. Prepare a new plan.'
 if (['TARGET_CHANGED','TARGET_TREE_CHANGED','PHYSICAL_TARGET_CHANGED','PARENT_CHANGED','DIRECTORY_CHANGED','SOURCE_CHANGED','STALE'].includes(reason)) return fr?'Le dossier ou ses entrées ont changé. Vérifiez le diagnostic avant de préparer de nouveau.':'The folder or its entries changed. Check the diagnostics before preparing again.'
 if (reason==='application-not-verified') return fr?'L’union finale et le profil n’ont pas été vérifiés ensemble.':'Final union and profile were not both verified.'
 if (reason.includes('durably recorded')) return fr?'L’accord n’a pas pu être enregistré avant application.':'Approval could not be saved before applying.'
 return fr?'Le dossier, les préconditions ou le reçu n’ont pas pu être établis.':'The folder, preconditions or receipt could not be established.'
}

function PlanDetails({plan,preview}:{plan:InitializationPlan;preview:(entry:Extract<InitializationEntry,{kind:'file'}>)=>Promise<InitializationContent|null>}):ReactNode {
 const {language}=useLocale(), words=copy[language]
 const [file,setFile]=useState<{id:string;content:InitializationContent|null;pending:boolean}|null>(null)
 const counter=useRef(0)
 function select(entry:Extract<InitializationEntry,{kind:'file'}>):void {
  const id=++counter.current
  setFile({id:entry.contentId,content:null,pending:true})
  void preview(entry).then(content=>{if(counter.current===id)setFile({id:entry.contentId,content,pending:false})})
 }
 const files=plan.additions.filter(entry=>entry.kind==='file').length, directories=plan.additions.length-files
 const directoryLabel=new Intl.PluralRules(language).select(directories)==='one'?words.directory.toLowerCase():words.directories
 return <div className="initialization-plan">
  <dl><dt>{words.folder}</dt><dd><code>{plan.identity.rootPath}</code></dd>
   <dt>{words.plan}</dt><dd><code>{plan.id}</code><br/><code>{plan.revision}</code></dd>
   <dt>{words.profile}</dt><dd>{words.scope} · {words.missing} <code>bmad-retrospective</code></dd></dl>
  <p>{words.preparation}</p>
  <details><summary>{words.preconditions}</summary><dl>
   <dt>{words.parents}</dt><dd><code>{plan.identity.rootIdentity}</code><br/><code>{plan.identity.parentPath}</code><br/><code>{plan.identity.parentIdentity}</code></dd>
   <dt>{words.configuration}</dt><dd><code>{plan.observedAt}</code><br/><code>{plan.preconditions.configurationRevision}</code></dd>
   <dt>{words.source}</dt><dd><code>{plan.preconditions.sourceRevision}</code></dd>
   <dt>{words.payload}</dt><dd><code>{plan.preconditions.payloadRevision}</code></dd>
   <dt>{words.target}</dt><dd><code>{plan.preconditions.targetTreeRevision}</code></dd>
   <dt>{words.parent}</dt><dd><code>{plan.preconditions.parentTreeRevision}</code></dd>
   {plan.parameters.map(p=><div key={p.name}><dt>{p.name}</dt><dd><code>{p.value}</code></dd></div>)}
  </dl></details>
  <details><summary>{words.additions} · {formatCount(files,'file',language)} · {formatNumber(directories,language)} {directoryLabel}</summary>
   <ul className="initialization-inventory">{plan.additions.map(entry=><li key={entry.path}>
    <code>{entry.path}</code><small>{entry.kind==='directory'?words.directory:`${words.file} · ${formatCount(entry.bytes,'byte',language)}`}</small>
    {entry.kind==='file'&&<><code>{entry.sha256}</code>
     <button className="text-button" type="button" aria-label={words.preview+' · '+entry.path} onClick={()=>select(entry)}>{words.preview}</button>
     {file?.id===entry.contentId&&(file.pending?<small role="status">…</small>:file.content
      ?<><small>{file.content.encoding==='base64'?words.base64:entry.path}</small><pre tabIndex={0} aria-label={entry.path}>{file.content.data}</pre></>
      :<small role="status">{words.previewError}</small>)}</>}
   </li>)}</ul>
  </details>
  <details><summary>{words.preserved} · {formatNumber(plan.preserved.length,language)}</summary>
   {plan.preserved.length?<ul className="initialization-inventory">{plan.preserved.map(entry=><li key={entry.path}>
    <code>{entry.path}</code><small>{entry.kind==='directory'?words.directory:`${words.file} · ${formatCount(entry.bytes,'byte',language)}`}</small>
    {entry.kind==='file'&&<code>{entry.sha256}</code>}
   </li>)}</ul>:<p>{words.none}</p>}
  </details>
  <h4>{words.limits}</h4>
  <ul><li>{words.limitProfile}</li><li>{words.limitBounds}</li><li>{words.limitWrites}</li><li>{words.limitRaces}</li>
   {plan.excluded.map(entry=><li key={entry.path}><code>{entry.path}</code> · {words.lock}</li>)}</ul>
 </div>
}

export type InitializationArrival={projectId:string;attemptId:string|null}
type PanelProps = {
 projectId:string;rootPath:string;state:InitializationView|null;arrival:InitializationArrival
 accept(value:InitializationView):void;onClose():void
}
export function InitializationPanel({projectId,rootPath,state,arrival,accept,onClose}:PanelProps):ReactNode {
 const {language}=useLocale(), words=copy[language]
 const [selectedId,setSelectedId]=useState(arrival.attemptId)
 const selected=state?.operations.find(op=>op.attemptId===selectedId)
 const recent=latest(state)
 const operation=selected??(recent&&(recent.phase==='historical'||recent.phase==='terminal')?recent:undefined)
 const consulted=useRef(selected)
 const current=useRef(operation), decisionRef=useRef<HTMLDialogElement>(null), title=useRef<HTMLHeadingElement>(null)
 const decisionTitle=useRef<HTMLHeadingElement>(null), trigger=useRef<HTMLElement|null>(null), resultTitle=useRef<HTMLHeadingElement>(null)
 const [modal,setModal]=useState<InitializationOperation|null>(null)
 const [issue,setIssue]=useState<InitializationIssueCode|null>(null), [observing,setObserving]=useState(false)
 const [requested,setRequested]=useState(false)
 const pendingRequest=useRef<string|null>(null), cancelledRequest=useRef<string|null>(null)
 const focusedArrival=useRef<InitializationArrival|null>(null)
 const locked=useRef(false), alive=useRef(true)
 const focusAfterDecision=useRef<'diagnostic'|'result'>('diagnostic')
 const observationRequest=useRef(0)
 const [observation,setObservation]=useState<BmadConfigurationObservation|null>(null)
 const running=!!state?.operations.some(op=>['preparing','checking','applying','verifying'].includes(op.phase))
 const active=running||!!state?.operations.some(op=>op.phase==='ready')
 const needsInspection=!!state?.operations.some(initializationNeedsInspection)
 const observationInvalidated=operation&&(operation.decision==='consumed'||
  ['failed-no-effect','stale','preparation-failed'].includes(operation.result.outcome))?operation.attemptId:null
 function invalidateObservation():void {
  observationRequest.current++
  setObservation(null)
 }
 useLayoutEffect(()=>{if(observationInvalidated)invalidateObservation()},[observationInvalidated])
 useLayoutEffect(()=>{current.current=operation;consulted.current=selected},[operation,selected])
 useLayoutEffect(()=>{
  if(arrival.projectId!==projectId||focusedArrival.current===arrival)return
  if(arrival.attemptId!==selectedId){setSelectedId(arrival.attemptId);return}
  focusedArrival.current=arrival
  const heading=current.current?.attemptId===arrival.attemptId?resultTitle.current:null
  const target=heading??title.current
  target?.focus({preventScroll:true})
  target?.scrollIntoView({block:'start'})
 },[arrival,projectId,selectedId])
 useLayoutEffect(()=>{
  alive.current=true
  return ()=>{
   alive.current=false
   const requestId=pendingRequest.current, op=consulted.current
   if(requestId)void window.madnessBmadInitialization?.request({type:'cancel-prepare-request',projectId,requestId}).catch(()=>{})
   else if(op&&preEffect(op))void window.madnessBmadInitialization?.request({...attempt(op),type:'cancel-preparation'}).catch(()=>{})
  }
 },[projectId])
 useLayoutEffect(()=>{
  if(modal&&decisionRef.current&&!decisionRef.current.open){decisionRef.current.showModal();decisionTitle.current?.focus()}
  if(!modal&&decisionRef.current?.open){
   decisionRef.current.close()
   const destination=focusAfterDecision.current==='result'?resultTitle.current??title.current:title.current
   destination?.focus()
  }
 },[modal])
 const activeDecision=modal&&!requested&&operation?.attemptId===modal.attemptId&&operation.phase==='ready'
 const modalOpen=!!modal
 useEffect(()=>{
  if(modalOpen&&!activeDecision&&!locked.current){
   focusAfterDecision.current='diagnostic'
   setModal(null)
  }
 },[modalOpen,activeDecision])
 async function send(input:InitializationRequest):Promise<InitializationView|null> {
  setIssue(null)
  try{
   const reply=await window.madnessBmadInitialization.request(input)
   accept(reply.state)
   const cancelled=input.type==='prepare'&&cancelledRequest.current===input.requestId
   if(alive.current&&!cancelled)setIssue(reply.issue)
   if(reply.preparedAttempt){
    const prepared=reply.preparedAttempt
    if(alive.current&&!cancelled){
     consulted.current=reply.state.operations.find(op=>op.attemptId===prepared.attemptId&&op.generation===prepared.generation)
     setSelectedId(prepared.attemptId)
    }else void window.madnessBmadInitialization.request({type:'cancel-prepare-request',projectId,requestId:prepared.attemptId}).catch(()=>{})
   }
   return reply.state
  }catch{
   if(alive.current)setIssue('UNAVAILABLE')
   return null
  }
 }
 function closeDecision(type:'close'|'refuse'|'cancel'|'approve'):void{
  if(!modal||locked.current)return
  locked.current=true
  const openedFrom=trigger.current, id=modal.attemptId
  focusAfterDecision.current=type==='close'||type==='cancel'?'diagnostic':'result'
  if(type==='approve')invalidateObservation()
  setModal(null)
  void send(decision(modal,type)).then(reply=>{
   locked.current=false
   if(!alive.current||!reply?.operations.some(op=>op.attemptId===id&&op.phase==='ready')||
      current.current?.attemptId!==id||current.current.phase!=='ready'||!openedFrom?.isConnected)return
   const focus=document.activeElement
   if(focus===title.current||focus===resultTitle.current)openedFrom.focus()
  })
 }
 const preview=(op:InitializationOperation)=>async(entry:Extract<InitializationEntry,{kind:'file'}>):Promise<InitializationContent|null>=>{
  try { const reply=await window.madnessBmadInitialization.request({
   type:'content',...attempt(op),planId:op.plan!.id,planRevision:op.plan!.revision,contentId:entry.contentId
  });return reply.content }catch{return null}
 }
 const visibleObservation=running?null:observation
 const absent=visibleObservation?.status==='absent'
 const canPrepare=absent&&state?.availability==='available'&&!active&&!observing&&!needsInspection
 function refreshObservation():void{
  if(active||requested||observing)return
  const request=++observationRequest.current
  setObserving(true)
  setIssue(null)
  void window.madnessBmadContext.observeInitialization(projectId).then(value=>{
   if(alive.current&&request===observationRequest.current)setObservation(value)
  }).catch(()=>{
   if(alive.current&&request===observationRequest.current){setObservation(null);setIssue('UNAVAILABLE')}
  }).finally(()=>{if(alive.current)setObserving(false)})
 }
 function prepare():void {
  if(pendingRequest.current||!canPrepare)return
  const requestId=crypto.randomUUID()
  pendingRequest.current=requestId
  setRequested(true);setSelectedId(null);title.current?.focus()
  void send({type:'prepare',projectId,requestId}).finally(()=>{
   pendingRequest.current=null
   if(alive.current)setRequested(false)
  })
 }
 function cancelPreparation():void {
  const requestId=pendingRequest.current
  if(requestId){
   cancelledRequest.current=requestId
   void send({type:'cancel-prepare-request',projectId,requestId})
  }else if(selected&&preEffect(selected))void send({...attempt(selected),type:'cancel-preparation'})
 }
 function showDecision(element:HTMLElement):void{
  if(!operation||operation.phase!=='ready'||pendingRequest.current||locked.current)return
  trigger.current=element;setModal(operation)
 }
 return <div className="initialization-diagnostic">
  <h3 ref={title} tabIndex={-1}>{words.diagnostic}</h3>
  <p>{words.folder} <code>{rootPath}</code></p>
  <p><strong>{words.profile}</strong> · {words.scope}. {words.missing} <code>bmad-retrospective</code>.</p>
  {!running&&<p>{absent?<><strong>{words.absent}</strong> · {words.observed}</>:words.needsObservation}</p>}
  {requested&&!selected&&<p role="status">{words.preparing}</p>}
  {visibleObservation?.problems.map(reason=><p key={reason} role="status">{failureReason(reason,language)}</p>)}
  {state?.availability==='storage-unreadable'&&<p role="status">{words.unavailable} · {words.storage}</p>}
  <div className="initialization-actions">
   {!active&&<button className="secondary" type="button" disabled={observing||requested} onClick={refreshObservation}>{words.refresh}</button>}
   {canPrepare&&<button className="secondary" type="button" disabled={requested} onClick={prepare}>{operation?words.again:words.prepare}</button>}
   {(requested||selected&&preEffect(selected))&&<button className="text-button" type="button" onClick={cancelPreparation}>{words.cancel}</button>}
  </div>
  {issue&&<p role="status">{issue==='BUSY'?words.duplicate:words.unavailable}</p>}
  {operation&&<>
   <h4 id="initialization-operation-title" ref={resultTitle} tabIndex={-1} aria-live="polite">{status(operation,words)}</h4>
   {operation.phase==='historical'&&['verified','unknown','partial'].includes(operation.result.outcome)&&<p>{words.historical}</p>}
   {operation.result.reason&&operation.result.outcome!=='cancelled'&&operation.result.outcome!=='refused'&&<p>{words.reason} · {failureReason(operation.result.reason,language)}</p>}
   {operation.result.receipt&&<Receipt operation={operation} words={words}/>}
   {operation.preservation.status==='pending'&&<p role="status">{words.savePending}</p>}
   {operation.preservation.status==='failed'&&<div className="initialization-actions"><p>{words.saveFailed}</p>
    <button className="secondary" type="button" onClick={()=>void send({...attempt(operation),type:'retry-save'})}>{words.retrySave}</button></div>}
   {operation.plan&&<PlanDetails key={operation.plan.id} plan={operation.plan} preview={preview(operation)}/>}
   {operation.phase==='ready'&&!requested&&<button className="secondary" type="button" onClick={event=>showDecision(event.currentTarget)}>{words.decision}</button>}
  </>}
  {state&&state.operations.some(op=>op!==operation&&(op.phase==='historical'||op.phase==='terminal'))&&<details><summary>{words.previous}</summary>{[...state.operations].reverse().filter(op=>op!==operation&&(op.phase==='historical'||op.phase==='terminal')).map(op=><details key={op.attemptId}>
   <summary>{status(op,words)||words.historical} · <code>{op.attemptId}</code></summary>
   {op.result.reason&&op.result.outcome!=='cancelled'&&op.result.outcome!=='refused'&&<p>{words.reason} · {failureReason(op.result.reason,language)}</p>}
   {op.result.receipt&&<Receipt operation={op} words={words}/>}
   {op.plan&&<PlanDetails plan={op.plan} preview={preview(op)}/>}
  </details>)}</details>}
  <div className="initialization-actions"><button className="text-button" type="button" onClick={onClose}>{words.back}</button></div>
  <dialog className="catalog-dialog initialization-dialog" ref={decisionRef} aria-labelledby="initialization-decision-title"
   onCancel={event=>{event.preventDefault();closeDecision('close')}}>
   {modal?.plan&&<>
    <header className="catalog-dialog-header"><h2 id="initialization-decision-title" ref={decisionTitle} tabIndex={-1}>{words.title}</h2>
     <button className="text-button" type="button" onClick={()=>closeDecision('close')}>{words.close}</button></header>
    <div className="catalog-dialog-body">
     <PlanDetails key={modal.plan.id} plan={modal.plan} preview={preview(modal)}/>
     <p>{words.only} <code>{modal.plan.id}</code> · <code>{modal.plan.identity.rootPath}</code>.</p>
     <div className="initialization-actions">
      <button className="primary" type="button" disabled={!activeDecision} onClick={()=>closeDecision('approve')}>{words.apply}</button>
      <button className="secondary" type="button" disabled={!activeDecision} onClick={()=>closeDecision('refuse')}>{words.refuse}</button>
      <button className="text-button" type="button" disabled={!activeDecision} onClick={()=>closeDecision('cancel')}>{words.cancel}</button>
     </div>
    </div>
   </>}
  </dialog>
 </div>
}
function Receipt({operation,words}:{operation:InitializationOperation;words:Words}):ReactNode {
 const receipt=operation.result.receipt!
 return <div>
  <p>{words.preservation} · {receipt.preservedVerified?words.yes:words.unknown}</p>
  <p>{words.observedAdditions} · {receipt.observedAdditions.length}</p>
  {!!receipt.unverifiedPaths.length&&<details><summary>{words.unverified} · {receipt.unverifiedPaths.length}</summary>
   <ul>{receipt.unverifiedPaths.map(path=><li key={path}><code>{path}</code></li>)}</ul>
  </details>}
 </div>
}
