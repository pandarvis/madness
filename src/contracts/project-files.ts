import {isRecord,isCorrelationId} from './index.ts'
export const PROJECT_FILES_COMMAND_CHANNEL='madness:project-files:command'
export const PROJECT_FILES_EVENT_CHANNEL='madness:project-files:changed'
export type FileProducer='progress'|'catalog'|'corpus'
export type ProjectFileReference={id:string;producer:FileProducer;projectId:string;rootPath:string;rootIdentity:string;initiativeId:string|null;revision:string;sourceId:string;path:string;sha256:string;bytes:number;observedAt:string;current:boolean}
export type FilePreview={referenceId:string;status:'reading'|'ready'|'stale'|'refused';text:string|null;reason:string|null}
export type FileResult={correlationId:string;referenceId:string;action:'copy'|'editor';status:'pending'|'copied'|'transmitted'|'failed'|'unavailable'|'unknown'|'stale';reason:string|null}
export type ProjectFilesState={contractVersion:1;sequence:number;references:ProjectFileReference[];previews:FilePreview[];results:FileResult[];issues:{projectId:string;producer:FileProducer;revision:string;reason:string}[]}
export type ProjectFilesCommand={contractVersion:1;correlationId:string}&({type:'read'}|{type:'preview'|'copy'|'editor';referenceId:string})
export interface ProjectFilesBridge{read():Promise<ProjectFilesState>;preview(referenceId:string):Promise<ProjectFilesState>;copy(referenceId:string):Promise<ProjectFilesState>;editor(referenceId:string):Promise<ProjectFilesState>;onChanged(listener:(state:ProjectFilesState)=>void):()=>void}
const exact=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k))
const text=(v:unknown,max=32767,empty=false):v is string=>typeof v==='string'&&(empty||v.length>0)&&v.length<=max&&!v.includes('\0')
const id=(v:unknown):v is string=>text(v,255)&&/^[A-Za-z0-9_-]+$/.test(v)
const sha=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)
export const initialProjectFilesState=():ProjectFilesState=>({contractVersion:1,sequence:0,references:[],previews:[],results:[],issues:[]})
export function isProjectFilesCommand(v:unknown):v is ProjectFilesCommand{return isRecord(v)&&v.contractVersion===1&&isCorrelationId(v.correlationId)&&(v.type==='read'&&exact(v,['contractVersion','correlationId','type'])||['preview','copy','editor'].includes(String(v.type))&&exact(v,['contractVersion','correlationId','type','referenceId'])&&id(v.referenceId))}
export function isProjectFilesState(v:unknown):v is ProjectFilesState{
 if(!isRecord(v)||!exact(v,['contractVersion','sequence','references','previews','results','issues'])||v.contractVersion!==1||!Number.isSafeInteger(v.sequence)||Number(v.sequence)<0)return false
 if(!Array.isArray(v.references)||v.references.length>4096||!v.references.every(r=>isRecord(r)&&exact(r,['id','producer','projectId','rootPath','rootIdentity','initiativeId','revision','sourceId','path','sha256','bytes','observedAt','current'])&&id(r.id)&&['progress','catalog','corpus'].includes(String(r.producer))&&id(r.projectId)&&text(r.rootPath)&&text(r.rootIdentity,1000)&&(r.initiativeId===null||id(r.initiativeId))&&sha(r.revision)&&id(r.sourceId)&&text(r.path)&&sha(r.sha256)&&Number.isSafeInteger(r.bytes)&&Number(r.bytes)>=0&&Number(r.bytes)<=1048576&&text(r.observedAt,100)&&Number.isFinite(Date.parse(r.observedAt))&&typeof r.current==='boolean')||new Set(v.references.map(r=>r.id)).size!==v.references.length)return false
 const refs=new Set(v.references.map(r=>r.id))
 if(!Array.isArray(v.issues)||v.issues.length>3000||!v.issues.every(i=>isRecord(i)&&exact(i,['projectId','producer','revision','reason'])&&id(i.projectId)&&['progress','catalog','corpus'].includes(String(i.producer))&&sha(i.revision)&&text(i.reason,4000)))return false
 return Array.isArray(v.previews)&&v.previews.length<=32&&v.previews.every(p=>isRecord(p)&&exact(p,['referenceId','status','text','reason'])&&refs.has(p.referenceId)&&['reading','ready','stale','refused'].includes(String(p.status))&&(p.text===null||text(p.text,1048576,true))&&(p.reason===null||text(p.reason,4000)))&&new Set(v.previews.map(p=>p.referenceId)).size===v.previews.length&&Array.isArray(v.results)&&v.results.length<=32&&v.results.every(r=>isRecord(r)&&exact(r,['correlationId','referenceId','action','status','reason'])&&isCorrelationId(r.correlationId)&&id(r.referenceId)&&['copy','editor'].includes(String(r.action))&&['pending','copied','transmitted','failed','unavailable','unknown','stale'].includes(String(r.status))&&(r.reason===null||text(r.reason,4000)))
}
