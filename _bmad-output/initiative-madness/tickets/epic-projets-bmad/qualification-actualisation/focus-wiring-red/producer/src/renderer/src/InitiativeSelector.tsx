import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import {initialBmadContextState,selectionValidity} from '../../contracts/bmad-context.ts'
import type {BmadContextState,BmadContextProject} from '../../contracts/bmad-context.ts'
const contextDiagnostics={absent:'Installation BMad non repérée','legacy-observed':'Traces d’une ancienne installation BMad',unknown:'Profil BMad non identifié',incompatible:'Lecture du profil BMad refusée',partial:'Observation BMad partielle','candidate-observed':'Profil BMad candidat observé'} as const
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
 const validity=project?selectionValidity(project):'unset'
 return <><dt>Diagnostic BMad</dt><dd>{project?.observation?contextDiagnostics[project.observation.status]:'Profil BMad non observé'}</dd><dt>Sélection Madness</dt><dd>{project?.selection?.initiativeId??'Aucune initiative choisie'}{validity==='missing'?' — initiative disparue':validity==='root-changed'?' — racine remplacée ou non vérifiée':''}{project?.storage==='failed'||project?.storage==='unreadable'?' — session seulement':''}</dd><dt>Active dans BMad</dt><dd>{project?.observation?.activeInitiative??'Inconnue ou absente'}{project?.observation&&project.observation.activeStatus!=='valid'?' — '+({absent:'absente',invalid:'invalide',unknown:'inconnue',valid:''}[project.observation.activeStatus]):''}</dd>{includeRevision&&<><dt>Révision du contexte</dt><dd><code>{project?.observation?.revision??'Non observée'}</code></dd></>}</>
}
export function InitiativeSelector({projectId,project,accept,onOpen,priority=false,conflict=false,onDismissConflict}:{projectId:string;project:BmadContextProject|undefined;accept:(s:BmadContextState)=>void;onOpen:()=>void;priority?:boolean;conflict?:boolean;onDismissConflict:()=>void}):ReactNode{
 const trigger=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null),title=useRef<HTMLHeadingElement>(null)
 const opening=useRef(0),openNow=useRef(false)
 const [open,setOpen]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<string|null>(null)
 const active=project?.observation?.activeInitiative
 const selected=project?.selection?.initiativeId
 const different=!!selected&&!!active&&selected!==active
 const canChooseActive=project?.observation?.activeStatus==='valid'&&!!active
 const close=():void=>{const version=++opening.current;openNow.current=false;setOpen(false);onDismissConflict();dialog.current?.close();requestAnimationFrame(()=>{if(opening.current===version&&!openNow.current)trigger.current?.focus()})}
 const read=async():Promise<void>=>{const version=opening.current;if(!window.madnessBmadContext){setError('Lecture des initiatives indisponible.');return}setPending(true);try{accept(await window.madnessBmadContext.observe(projectId));if(opening.current===version&&openNow.current)setError(null)}catch{if(opening.current===version&&openNow.current)setError('Lecture refusée — réessayez la lecture. Le choix précédent est conservé.')}finally{if(opening.current===version&&openNow.current)setPending(false)}}
 const show=():void=>{opening.current++;openNow.current=true;onOpen();setOpen(true);void read()}
 useEffect(()=>{opening.current++;openNow.current=false;setOpen(false);setError(null);setPending(false);return()=>{opening.current++;openNow.current=false}},[projectId])
 useEffect(()=>{if(conflict&&!priority){opening.current++;openNow.current=true;setPending(false);onOpen();setOpen(true)}},[conflict,priority])
 useLayoutEffect(()=>{const el=dialog.current;if(!open||!el||priority)return;el.showModal();const current=el.querySelector<HTMLButtonElement>('[aria-pressed="true"]');(current??title.current)?.focus();return()=>{if(el.open)el.close()}},[open,priority])
 const choose=async(id:string):Promise<void>=>{const revision=project?.observation?.revision;if(!revision||pending||!window.madnessBmadContext)return;const version=opening.current;setPending(true);try{const next=await window.madnessBmadContext.choose(projectId,id,revision);accept(next);const updated=next.projects.find(p=>p.projectId===projectId);if(opening.current===version&&openNow.current&&dialog.current?.open&&updated?.status==='ready'&&updated.selection?.initiativeId===id)close()}catch{if(opening.current===version&&openNow.current)setError('Choix non confirmé — actualisez les initiatives.')}finally{if(opening.current===version&&openNow.current)setPending(false)}}
 return <div className="initiative-control">
  <button ref={trigger} type="button" className="initiative-trigger text-button" aria-label="Choisir une initiative" aria-haspopup="dialog" aria-expanded={open} onClick={show}><span>{selected??'Choisir une initiative'}</span><SelectorIcon/></button>
  {project?.storage==='failed'||project?.storage==='unreadable'?<span className="small">Choix de session — non enregistré</span>:null}
  {open&&<dialog className="initiative-dialog" ref={dialog} aria-labelledby="initiative-dialog-title" onCancel={e=>{e.preventDefault();close()}}>
   <div className="connection-heading initiative-dialog-header"><h2 ref={title} tabIndex={-1} id="initiative-dialog-title">{conflict?'Contexte à vérifier':'Choisir une initiative'}</h2><button type="button" aria-label="Fermer le choix d’initiative" onClick={close}><SelectorIcon close/></button></div>
   <div className="initiative-dialog-body">
   <p>Le choix de consultation est local à Madness. Chaque échange garde son initiative capturée.</p>
   <dl className="initiative-summary"><InitiativeContext project={project} includeRevision={false}/></dl>
   <details className="initiative-context-evidence"><summary>Révision du contexte</summary><code>{project?.observation?.revision??'Non observée'}</code></details>
   {(different||conflict)&&<div className="initiative-conflict"><p>Sélection : {selected??'non choisie'}. Active dans BMad : {active??'inconnue'}. Cette action exige un contexte concordant.</p><div className="initiative-actions">{canChooseActive&&<button type="button" className="secondary" disabled={pending} onClick={()=>void choose(active!)}>Sélectionner l’initiative active</button>}<button type="button" className="text-button" onClick={close}>Rester sur cette sélection</button>{conflict&&<button type="button" className="text-button" onClick={close}>Annuler le lancement</button>}</div></div>}
   <p role="status" aria-live="polite">{pending||project?.status==='reading'?'Lecture des initiatives en cours…':project?.observation?project.observation.initiatives.length+' initiative(s) repérée(s)':'Initiatives non observées'}</p>
   {(project?.freshness==='stale'||project?.freshness==='uncertain'||project?.status==='error')&&project.observation&&<p>Observation précédente — nouvelle lecture requise avant une action.</p>}
   {project?.monitoring==='unavailable'&&<p>Surveillance indisponible — fraîcheur non garantie.</p>}
   {(error||project?.error)&&<p role="alert" className="connection-error">{error??project?.error}</p>}
   {project?.storage==='failed'&&<button type="button" className="text-button" disabled={pending} onClick={()=>void window.madnessBmadContext.retrySave(projectId).then(accept)}>Réessayer l’enregistrement</button>}
   {!!project?.observation?.problems.length&&<details><summary>Limites et sources</summary><ul>{project.observation.problems.map((problem,i)=><li key={i}>{problem}</li>)}</ul></details>}
   {project?.observation?.initiatives.length===0&&<p>Aucune initiative repérée. Les outils indépendants restent soumis à leurs propres conditions.</p>}
   <ul className="initiative-list">{project?.observation?.initiatives.map(i=><li key={i.name}>
    <button type="button" className="initiative-option" aria-pressed={i.id!==null&&i.id===selected} disabled={i.id===null} aria-disabled={pending||i.id===null} onClick={()=>i.id&&void choose(i.id)}><strong>{i.name}</strong><span className="initiative-markers">{i.id===selected?'Sélection Madness · ':''}{i.name===active?'Active dans BMad':''}{i.id===null?'Identifiant non représentable':''}</span><code>{i.path}</code></button>
    <details className="initiative-evidence"><summary>Source et révision de {i.name}</summary><dl><dt>Source</dt><dd><code>{i.source}</code></dd><dt>Révision</dt><dd><code>{i.revision}</code></dd></dl></details>
   </li>)}</ul>
   <div className="initiative-actions"><button type="button" className="secondary" disabled={pending} onClick={()=>void read()}>Actualiser les initiatives</button><button type="button" className="text-button" onClick={close}>Annuler</button></div>
   </div>
  </dialog>}
 </div>
}
