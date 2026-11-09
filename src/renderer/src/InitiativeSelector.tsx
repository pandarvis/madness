import {formatNumber,formatCount} from './locale-format.ts'
import {presentProductText} from './product-copy.ts'
import {useLocale,useLocalText,LanguageControl} from './Locale.tsx'
import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import {initialBmadContextState,selectionValidity} from '../../contracts/bmad-context.ts'
import type {BmadContextState,BmadContextProject} from '../../contracts/bmad-context.ts'
const contextDiagnostics=(ui:ReturnType<typeof useLocale>['ui'])=>({absent:ui.bmad_not_found,'legacy-observed':ui.legacy_bmad_installation_observed,unknown:ui.bmad_profile_not_identified,incompatible:ui.bmad_profile_reading_refused,partial:ui.partial_bmad_observation,'candidate-observed':ui.candidate_bmad_profile_observed} as const)
const SelectorIcon=({close=false}:{close?:boolean}):ReactNode=><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={close?'M6 6 18 18M18 6 6 18':'m5 9 7 7 7-7'}/></svg>

export function useBmadContext(projectId?:string):[BmadContextState,(s:BmadContextState)=>void]{
 const [state,setState]=useState(initialBmadContextState)
 const sequence=useRef(-1)
 const accept=(next:BmadContextState):void=>{if(next.sequence>=sequence.current){sequence.current=next.sequence;setState(next)}}
 useEffect(()=>{const bridge=window.madnessBmadContext;if(!bridge)return;return bridge.onChanged(accept)},[])
 useEffect(()=>{const bridge=window.madnessBmadContext;if(bridge)void bridge.read().then(accept).catch(()=>{})},[projectId])
 return [state,accept]
}
export function InitiativeContext({project,includeRevision=true}:{project:BmadContextProject|undefined;includeRevision?:boolean}):ReactNode{
 const {ui,language}=useLocale()

 const validity=project?selectionValidity(project):'unset'
 return <><dt>{ui.bmad_diagnostic}</dt><dd>{project?.observation?contextDiagnostics(ui)[project.observation.status]:ui.bmad_profile_not_observed}</dd><dt>{ui.madness_selection}</dt><dd>{project?.selection?.initiativeId??ui.no_initiative_selected}{validity==='missing'?ui.initiative_missing:validity==='root-changed'?ui.root_replaced_or_unverified:''}{project?.storage==='failed'||project?.storage==='unreadable'?ui.session_only:''}</dd><dt>{ui.active_in_bmad}</dt><dd>{project?.observation?.activeInitiative??ui.unknown_or_missing}{project?.observation&&project.observation.activeStatus!=='valid'?' — '+({absent:ui.missing,invalid:ui.invalid,unknown:ui.unknown,valid:''}[project.observation.activeStatus]):''}</dd>{includeRevision&&<><dt>{ui.context_revision}</dt><dd><code>{project?.observation?.revision??ui.not_observed}</code></dd></>}</>
}
// Other BMad folders with a same-named document (brief-x, architecture-x) are not initiatives.
const isInitiativeFolder=(name:string):boolean=>!/^(brief|architecture|ux|prd|research|market|domain)-/.test(name)
export const initiativeLabel=(id:string):string=>id.replace(/^initiative-/,'')
export function InitiativeSelector({projectId,project,accept,onOpen,priority=false,conflict=false,onDismissConflict,bmadReady=false,locked=false}:{projectId:string;project:BmadContextProject|undefined;accept:(s:BmadContextState)=>void;onOpen:()=>void;priority?:boolean;conflict?:boolean;onDismissConflict:()=>void;bmadReady?:boolean;locked?:boolean}):ReactNode{
 const {ui,language}=useLocale()

 const trigger=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null),title=useRef<HTMLHeadingElement>(null)
 const opening=useRef(0),openNow=useRef(false)
 const [open,setOpen]=useState(false),[pending,setPending]=useState(false),[error,setError]=useLocalText<string|null>(null)
 const active=project?.observation?.activeInitiative
 const selected=project?.selection?.initiativeId
 const different=!!selected&&!!active&&selected!==active
 const canChooseActive=project?.observation?.activeStatus==='valid'&&!!active
 const [newName,setNewName]=useState('')
 const observedOnce=useRef<string|null>(null),followed=useRef<string|null>(null),followRetries=useRef(0),lockedNow=useRef(locked)
 lockedNow.current=locked
 const initiatives=project?.observation?.initiatives.filter(i=>isInitiativeFolder(i.name))??[],initiativeCount=initiatives.filter(i=>i.id!==null).length
 // A project shows its initiative as soon as it opens, without waiting for the dialog.
 useEffect(()=>{if(!bmadReady||locked||observedOnce.current===projectId||!window.madnessBmadContext)return
  // Another tool can hold the local runtime for a few seconds at opening: try again instead of giving up.
  let cancelled=false,tries=0,timer:ReturnType<typeof setTimeout>
  const attempt=():void=>{if(lockedNow.current){observedOnce.current=null;return}observedOnce.current=projectId;const retry=():void=>{if(cancelled)return;if(tries++<6)timer=setTimeout(attempt,2500);else observedOnce.current=null}
   void window.madnessBmadContext.observe(projectId).then(next=>{accept(next);if(next.projects.find(p=>p.projectId===projectId)?.status==='error')retry()}).catch(retry)}
  timer=setTimeout(attempt,400)
  return()=>{cancelled=true;clearTimeout(timer)}},[projectId,bmadReady,locked])
 // One notion: Madness follows BMad's active initiative, and fills it in when the answer is obvious.
 useEffect(()=>{const observed=project?.observation;if(locked||!observed||project?.status!=='ready'||project.freshness!=='current'||!window.madnessBmadContext)return
  const identified=observed.initiatives.filter(i=>i.id!==null&&isInitiativeFolder(i.name)),activeId=observed.activeStatus==='valid'?observed.activeInitiative:null
  const target=activeId??(selected&&identified.some(i=>i.id===selected)?selected:identified.length===1?identified[0].id:null)
  if(!target||target===selected&&target===activeId)return
  const key=observed.revision+':'+target;if(followed.current===key)return;followed.current=key
  const again=():void=>{followed.current=null;if(followRetries.current++<6)setTimeout(()=>{void window.madnessBmadContext.observe(projectId).then(next=>{accept(next);if(next.projects.find(p=>p.projectId===projectId)?.status==='error')again()}).catch(again)},2500)}
  void window.madnessBmadContext.choose(projectId,target,observed.revision).then(next=>{accept(next);if(next.projects.find(p=>p.projectId===projectId)?.status==='error')again()}).catch(again)},[project?.observation?.revision,project?.status,project?.freshness,selected,locked,projectId])
 const create=async():Promise<void>=>{const name=newName.trim();if(!name||pending||!window.madnessBmadContext)return;setPending(true);try{const next=await window.madnessBmadContext.createInitiative(projectId,name);accept(next);setNewName('');const updated=next.projects.find(p=>p.projectId===projectId);if(updated?.status==='ready')close();else setError(l=>l.ui.reading_refused_retry_reading_previous_choice_kept)}catch{setError(l=>l.ui.reading_refused_retry_reading_previous_choice_kept)}finally{setPending(false)}}
 const close=():void=>{const version=++opening.current;openNow.current=false;setOpen(false);onDismissConflict();dialog.current?.close();requestAnimationFrame(()=>{if(opening.current===version&&!openNow.current)trigger.current?.focus()})}
 const read=async():Promise<void>=>{const version=opening.current;if(!window.madnessBmadContext){setError(l=>l.ui.initiative_reading_unavailable);return}setPending(true);try{accept(await window.madnessBmadContext.observe(projectId));if(opening.current===version&&openNow.current)setError(null)}catch{if(opening.current===version&&openNow.current)setError(l=>l.ui.reading_refused_retry_reading_previous_choice_kept)}finally{if(opening.current===version&&openNow.current)setPending(false)}}
 const show=():void=>{opening.current++;openNow.current=true;onOpen();setOpen(true);void read()}
 useEffect(()=>{opening.current++;openNow.current=false;setOpen(false);setError(null);setPending(false);return()=>{opening.current++;openNow.current=false}},[projectId])
 useEffect(()=>{if(conflict&&!priority){opening.current++;openNow.current=true;setPending(false);onOpen();setOpen(true)}},[conflict,priority])
 useLayoutEffect(()=>{const el=dialog.current;if(!open||!el||priority)return;el.showModal();const current=el.querySelector<HTMLButtonElement>('[aria-pressed="true"]');(current??title.current)?.focus();return()=>{if(el.open)el.close()}},[open,priority])
 const choose=async(id:string):Promise<void>=>{const revision=project?.observation?.revision;if(!revision||pending||!window.madnessBmadContext)return;const version=opening.current;setPending(true);try{const next=await window.madnessBmadContext.choose(projectId,id,revision);accept(next);const updated=next.projects.find(p=>p.projectId===projectId);if(opening.current===version&&openNow.current&&dialog.current?.open&&updated?.status==='ready'&&updated.selection?.initiativeId===id)close()}catch{if(opening.current===version&&openNow.current)setError(l=>l.ui.choice_not_confirmed_refresh_initiatives)}finally{if(opening.current===version&&openNow.current)setPending(false)}}
 return <div className="initiative-control">
  <button ref={trigger} type="button" className="initiative-trigger text-button" aria-label={ui.choose_an_initiative} aria-haspopup="dialog" aria-expanded={open} onClick={show}><span>{selected?initiativeLabel(selected):ui.choose_an_initiative}</span>{initiativeCount!==1&&<SelectorIcon/>}</button>
  {project?.storage==='failed'||project?.storage==='unreadable'?<span className="small">{ui.session_choice_not_saved}</span>:null}
  {open&&<dialog className="initiative-dialog" ref={dialog} aria-labelledby="initiative-dialog-title" onCancel={e=>{e.preventDefault();close()}}>
   <div className="connection-heading initiative-dialog-header"><h2 ref={title} tabIndex={-1} id="initiative-dialog-title">{conflict?ui.context_to_check:ui.choose_an_initiative}</h2><LanguageControl/><button type="button" aria-label={ui.close_initiative_choice} onClick={close}><SelectorIcon close/></button></div>
   <div className="initiative-dialog-body">
   {(different||conflict)&&<div className="initiative-conflict"><p>{ui.selected} {selected??ui.not_selected}{ui.active_in_bmad_2} {active??ui.unknown}{ui.this_action_requires_a_matching_context}</p><div className="initiative-actions">{canChooseActive&&<button type="button" className="secondary" disabled={pending} onClick={()=>void choose(active!)}>{ui.select_active_initiative}</button>}<button type="button" className="text-button" onClick={close}>{ui.keep_this_selection}</button>{conflict&&<button type="button" className="text-button" onClick={close}>{ui.cancel_launch}</button>}</div></div>}
   <p role="status" aria-live="polite">{pending||project?.status==='reading'?ui.reading_initiatives:project?.observation?formatCount(initiatives.length,'initiative',language):ui.initiatives_not_observed}</p>
   {(project?.freshness==='stale'||project?.freshness==='uncertain'||project?.status==='error')&&project.observation&&<p>{ui.previous_observation_read_again_before_an_action}</p>}
   {project?.monitoring==='unavailable'&&<p>{ui.monitoring_unavailable_freshness_not_guaranteed}</p>}
   {(error||project?.error)&&<p role="alert" className="connection-error">{error??presentProductText('diagnostic',project?.error,language)}</p>}
   {project?.storage==='failed'&&<button type="button" className="text-button" disabled={pending} onClick={()=>void window.madnessBmadContext.retrySave(projectId).then(accept)}>{ui.retry_save}</button>}
   {!!project?.observation?.problems.length&&<details><summary>{ui.limits_and_sources}</summary><ul>{project.observation.problems.map((problem,i)=><li key={i}>{presentProductText('diagnostic',problem,language)}</li>)}</ul></details>}
   {project?.observation&&initiatives.length===0&&<p>{ui.no_initiative_found_independent_tools_remain_subject_to_their_own}</p>}
   <form className="initiative-create" onSubmit={event=>{event.preventDefault();void create()}}><input type="text" maxLength={80} value={newName} placeholder={ui.new_initiative_placeholder} aria-label={ui.new_initiative_placeholder} disabled={pending||locked} onChange={event=>setNewName(event.target.value)}/><button type="submit" className="secondary" disabled={pending||locked||!/[\p{L}\p{N}]/u.test(newName)}>{ui.create_initiative}</button></form>
   <ul className="initiative-list">{initiatives.map(i=><li key={i.name}>
    <button type="button" className="initiative-option" aria-pressed={i.id!==null&&i.id===selected} disabled={i.id===null} aria-disabled={pending||i.id===null} onClick={()=>i.id&&void choose(i.id)}><strong>{initiativeLabel(i.name)}</strong><span className="initiative-markers">{i.id===null?ui.identifier_cannot_be_represented:''}</span></button>
    <details className="initiative-evidence"><summary>{ui.source_and_revision_of} {i.name}</summary><dl><dt>{ui.source}</dt><dd><code>{i.source}</code></dd><dt>{ui.revision}</dt><dd><code>{i.revision}</code></dd></dl></details>
   </li>)}</ul>
   <div className="initiative-actions"><button type="button" className="secondary" disabled={pending} onClick={()=>void read()}>{ui.refresh_initiatives}</button><button type="button" className="text-button" onClick={close}>{ui.cancel}</button></div>
   </div>
  </dialog>}
 </div>
}
