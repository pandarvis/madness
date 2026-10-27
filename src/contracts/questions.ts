import {isRecord,MAX_DRAFT_LENGTH} from './index.ts'
import type {ContextRef} from './index.ts'
import {isMessageIdentity} from './dialogue.ts'
import type {MessageIdentity} from './dialogue.ts'

export const MAX_QUESTIONS=500
export type QuestionField={id:string;header:string;prompt:string;options:{label:string;description:string}[];allowOther:boolean}
export type QuestionValues=Record<string,string>
export type QuestionRecord={schemaVersion:1;id:string;context:ContextRef;requestId:string;turnId:string;identity:MessageIdentity;fields:QuestionField[];values:QuestionValues;status:'waiting'|'sending'|'sent'|'inactive'|'unknown';reason:'resolved'|'expired'|'stopped'|'reopened'|'failed'|null;createdAt:string;expiresAt:number|null;revision:number;storage:'pending'|'stored'|'failed'}
export const questionIdentifier=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v)
const exact=(v:Record<string,unknown>,keys:string[]):boolean=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k))
const text=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length>0&&v.length<=max&&!v.includes('\0')
export function isQuestionValues(v:unknown,complete=false):v is QuestionValues{return isRecord(v)&&Object.keys(v).length<=3&&Object.entries(v).every(([k,x])=>questionIdentifier(k)&&typeof x==='string'&&x.length<=MAX_DRAFT_LENGTH&&(!complete||!!x.trim()))&&Object.values(v).reduce<number>((n,x)=>n+String(x).length,0)<=MAX_DRAFT_LENGTH}
export function isQuestionFields(v:unknown):v is QuestionField[]{return Array.isArray(v)&&v.length>0&&v.length<=3&&new Set(v.map(f=>f?.id)).size===v.length&&v.every(f=>isRecord(f)&&exact(f,['id','header','prompt','options','allowOther'])&&questionIdentifier(f.id)&&text(f.header,100)&&text(f.prompt,10000)&&typeof f.allowOther==='boolean'&&Array.isArray(f.options)&&f.options.length<=10&&new Set(f.options.map(o=>o?.label)).size===f.options.length&&f.options.every(o=>isRecord(o)&&exact(o,['label','description'])&&text(o.label,500)&&typeof o.description==='string'&&o.description.length<=2000))}
export function validQuestionValues(fields:QuestionField[],values:unknown,complete:boolean):values is QuestionValues{
 if(!isQuestionValues(values,complete)||Object.keys(values).some(k=>!fields.some(f=>f.id===k))||complete&&fields.some(f=>!Object.hasOwn(values,f.id)))return false
 return fields.every(f=>!values[f.id]?.trim()||!f.options.length||f.allowOther||f.options.some(o=>o.label===values[f.id]))
}
export function isQuestionRecord(v:unknown):v is QuestionRecord{
 return isRecord(v)&&exact(v,['schemaVersion','id','context','requestId','turnId','identity','fields','values','status','reason','createdAt','expiresAt','revision','storage'])&&v.schemaVersion===1&&questionIdentifier(v.id)&&isRecord(v.context)&&exact(v.context,['projectId','initiativeId','conversationId','providerId','connectionId'])&&Object.values(v.context).every(x=>x===null||questionIdentifier(x))&&v.context.projectId!==null&&v.context.conversationId!==null&&text(v.requestId,100)&&questionIdentifier(v.turnId)&&isMessageIdentity(v.identity)&&isQuestionFields(v.fields)&&validQuestionValues(v.fields,v.values,false)&&['waiting','sending','sent','inactive','unknown'].includes(String(v.status))&&(v.reason===null||['resolved','expired','stopped','reopened','failed'].includes(String(v.reason)))&&text(v.createdAt,100)&&Number.isFinite(Date.parse(v.createdAt))&&(v.expiresAt===null||typeof v.expiresAt==='number'&&Number.isSafeInteger(v.expiresAt)&&v.expiresAt>0)&&Number.isSafeInteger(v.revision)&&Number(v.revision)>0&&['pending','stored','failed'].includes(String(v.storage))
}
