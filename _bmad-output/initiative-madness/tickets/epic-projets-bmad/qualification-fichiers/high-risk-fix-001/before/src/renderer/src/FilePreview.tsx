import {createContext,useContext,useEffect,useLayoutEffect,useRef,useState,useId} from 'react'
import type {ReactNode} from 'react'
import {initialProjectFilesState,isProjectFilesState} from '../../contracts/project-files.ts'
import type {ProjectFileReference,ProjectFilesState,FileProducer} from '../../contracts/project-files.ts'
import {fileLabels} from './file-strings.ts'
import './files.css'
export type FileConsultation={reference:ProjectFileReference;trigger:HTMLElement;fallback:HTMLElement|null;top?:number;expanded?:boolean;requested?:boolean}
export const FilesContext=createContext<{state:ProjectFilesState;open:(c:FileConsultation)=>void}>({state:initialProjectFilesState(),open:()=>{}})
export function useProjectFiles():[ProjectFilesState,(value:ProjectFilesState)=>void]{
 const [state,setState]=useState(initialProjectFilesState),sequence=useRef(-1)
 const accept=(next:ProjectFilesState):void=>{if(isProjectFilesState(next)&&next.sequence>=sequence.current){sequence.current=next.sequence;setState(next)}}
 useEffect(()=>{const bridge=window.projectFiles;if(!bridge)return;const off=bridge.onChanged(accept);void bridge.read().then(accept).catch(()=>{});return off},[])
 return [state,accept]
}
export function FileAvailabilityNotice({projectId,producer,revision}:{projectId:string;producer:FileProducer;revision:string|undefined}):ReactNode{const {state}=useContext(FilesContext),issue=state.issues.find(i=>i.projectId===projectId&&i.producer===producer&&i.revision===revision);return issue?<p className="small" role="status">{issue.reason}</p>:null}
export function FilePreviewButton({producer,projectId,revision,sourceId,beforeOpen}:{producer:FileProducer;projectId:string;revision:string;sourceId:string;beforeOpen?:()=>{trigger:HTMLElement;fallback:HTMLElement|null;top?:number;expanded?:boolean;requested?:boolean}|null}):ReactNode{
 const {state,open}=useContext(FilesContext),ref=state.references.find(r=>r.producer===producer&&r.projectId===projectId&&r.revision===revision&&r.sourceId===sourceId&&r.current)
 if(!ref)return null
 return <button type="button" className="text-button file-preview-trigger" aria-label={'Aperçu · '+ref.path} onClick={event=>{const target=beforeOpen?.();open({reference:ref,trigger:target?.trigger??event.currentTarget,fallback:target?.fallback??event.currentTarget.closest('section')?.querySelector<HTMLElement>('h2,h3')??null})}}>Aperçu</button>
}
export function FilePreview({consultation,state,accept,onClose}:{consultation:FileConsultation;state:ProjectFilesState;accept:(s:ProjectFilesState)=>void;onClose:(restore?:boolean)=>void}):ReactNode{
 const w=fileLabels.fr,id=useId(),panel=useRef<HTMLDialogElement>(null),title=useRef<HTMLHeadingElement>(null),body=useRef<HTMLDivElement>(null),reading=useRef(consultation.top??0),expandButton=useRef<HTMLButtonElement>(null),lastMode=useRef({modal:false,expanded:false}),alive=useRef(true),token=useRef(0)
 const [narrow,setNarrow]=useState(()=>!window.matchMedia('(min-width: 1080px)').matches),[expanded,setExpanded]=useState(consultation.expanded??false),[priority,setPriority]=useState(false),[localError,setLocalError]=useState(''),[pending,setPending]=useState(false)
 const ref=state.references.find(r=>r.id===consultation.reference.id)??{...consultation.reference,current:false},preview=state.previews.find(p=>p.referenceId===ref.id),result=state.results.filter(r=>r.referenceId===ref.id).at(-1),modal=narrow||expanded
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;token.current++}},[])
 useEffect(()=>{const query=window.matchMedia('(min-width: 1080px)'),change=():void=>setNarrow(!query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[])
 useLayoutEffect(()=>{const update=():void=>setPriority(!!document.querySelector('.plan-confirmation[open],.navigation-drawer[open],.initiative-dialog[open],.catalog-dialog[open]'));update();const observer=new MutationObserver(update);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});return()=>observer.disconnect()},[])
 useLayoutEffect(()=>{const el=panel.current;if(!el||priority)return;const previous=document.activeElement instanceof HTMLElement&&el.contains(document.activeElement)?document.activeElement:null;if(el.open)el.close();if(modal)el.showModal();else el.show();const before=lastMode.current;lastMode.current={modal,expanded};const target=expanded&&!before.expanded||modal&&!before.modal?title.current:!expanded&&before.expanded?expandButton.current:previous??title.current;target?.focus({preventScroll:true});if(body.current)body.current.scrollTop=reading.current},[modal,priority,expanded])
 const request=async(action:'preview'|'copy'|'editor',referenceId=ref.id):Promise<void>=>{if(pending)return;const n=++token.current;setPending(true);setLocalError('');try{if(!window.projectFiles)throw Error();const next=await window.projectFiles[action](referenceId);accept(next)}catch{if(alive.current&&n===token.current)setLocalError(w.bridgeFailed)}finally{if(alive.current&&n===token.current)setPending(false)}}
 // Exactly one explicit preview per selection. No collection/replay on availability or restoration.
 useEffect(()=>{if(!consultation.requested){consultation.requested=true;void request('preview')}return()=>{token.current++}},[consultation.reference.id])
 const next=state.references.find(r=>r.current&&r.producer===ref.producer&&r.projectId===ref.projectId&&r.rootIdentity===ref.rootIdentity&&r.initiativeId===ref.initiativeId&&r.path===ref.path&&r.id!==ref.id)
 const newRevision=():void=>{if(!next)return;onClose(false);const value={...consultation,reference:next};context.open(value)}
 const context=useContext(FilesContext)
 return <dialog ref={panel} data-reference-id={ref.id} data-preview-status={preview?.status??'none'} data-reference-current={String(ref.current)} className={'file-preview '+(modal?'is-modal':'is-docked')+(expanded?' is-expanded':'')} role={modal?'dialog':'region'} aria-modal={modal?'true':undefined} aria-labelledby={id+'-title'} onCancel={e=>{e.preventDefault();e.stopPropagation();if(expanded){consultation.expanded=false;setExpanded(false)}else onClose()}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(expanded){consultation.expanded=false;setExpanded(false)}else onClose()}}}>
  <header className="file-preview-heading"><h2 id={id+'-title'} ref={title} tabIndex={-1}>{w.title}</h2><button type="button" aria-label={w.close} onClick={()=>onClose()}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
  <div className="file-preview-body" ref={body} onScroll={e=>{reading.current=e.currentTarget.scrollTop;consultation.top=reading.current}}>
   <h3>{ref.path.replaceAll('\\','/').split('/').at(-1)}</h3><p className="file-preview-freshness" role="status">{!ref.current||preview?.status==='stale'?w.old:preview?.status==='reading'?w.reading:preview?.status==='ready'?w.observed:w.notRead}</p>
   <dl className="file-preview-facts"><dt>{w.project}</dt><dd>{ref.projectId} · <code>{ref.rootPath}</code></dd>{ref.initiativeId&&<><dt>{w.initiative}</dt><dd>{ref.initiativeId}</dd></>}<dt>{w.source}</dt><dd>{ref.producer} · <code>{ref.sourceId}</code></dd><dt>{w.path}</dt><dd><code>{ref.path}</code></dd><dt>{w.revision}</dt><dd><code>{ref.revision}</code></dd><dt>SHA-256</dt><dd><code>{ref.sha256}</code></dd><dt>{w.date}</dt><dd>{new Date(ref.observedAt).toLocaleString('fr-FR')}</dd><dt>{w.size}</dt><dd>{ref.bytes} {w.bytes}</dd></dl>
   <div className="file-preview-actions"><button ref={expandButton} type="button" className="text-button" onClick={()=>{consultation.expanded=!expanded;setExpanded(!expanded)}}>{expanded?w.reduce:w.expand}</button><button type="button" data-file-action="editor" className="text-button" disabled={!ref.current||pending||preview?.status==='reading'} onClick={()=>void request('editor')}>{w.editor}</button><button type="button" data-file-action="copy" className="text-button" disabled={!ref.current||pending||preview?.status==='reading'} onClick={()=>void request('copy')}>{w.copy}</button>{next&&<button type="button" className="secondary" disabled={pending} onClick={newRevision}>{w.newRevision}</button>}</div>
   <p className="file-preview-notice" role="status" aria-live="polite">{localError||preview?.reason||result?.reason||(pending?w.waiting:'')}</p>
   {preview?.text!==null&&preview?.text!==undefined&&<section className="file-preview-content" aria-label={w.content}><pre tabIndex={0}>{preview.text}</pre></section>}
  </div>
 </dialog>
}
