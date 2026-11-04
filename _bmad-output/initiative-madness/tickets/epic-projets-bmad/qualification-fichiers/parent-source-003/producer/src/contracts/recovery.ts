import {isRecord} from './index.ts'
import {approvalIdentifier} from './approvals.ts'
export const INSPECTION_MAX_AGE_MS = 60000
export type FileInspection = {outcome:'before'|'after'|'identical'|'mixed'|'diverged';files:{path:string;sha256:string|null;position:'before'|'after'|'identical'|'diverged'}[]}
export type RecoveryObservation = FileInspection & {approvalId:string;observedAt:string}
export type RecoveryState = {stop:'clear'|'unconfirmed';observations:RecoveryObservation[];capabilities:{resume:false;newConversation:true;inspectFiles:boolean}}
export const initialRecoveryState=():RecoveryState=>({stop:'clear',observations:[],capabilities:{resume:false,newConversation:true,inspectFiles:false}})
const exact=(v:Record<string,unknown>,keys:string[]):boolean=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k))
export function isRecoveryState(v:unknown):v is RecoveryState{
 return isRecord(v)&&exact(v,['stop','observations','capabilities'])&&['clear','unconfirmed'].includes(String(v.stop))&&isRecord(v.capabilities)&&exact(v.capabilities,['resume','newConversation','inspectFiles'])&&v.capabilities.resume===false&&v.capabilities.newConversation===true&&typeof v.capabilities.inspectFiles==='boolean'&&Array.isArray(v.observations)&&v.observations.length<=200&&new Set(v.observations.map(o=>o?.approvalId)).size===v.observations.length&&v.observations.every(o=>isRecord(o)&&exact(o,['approvalId','observedAt','outcome','files'])&&approvalIdentifier(o.approvalId)&&typeof o.observedAt==='string'&&Number.isFinite(Date.parse(o.observedAt))&&['before','after','identical','mixed','diverged'].includes(String(o.outcome))&&Array.isArray(o.files)&&o.files.length>0&&o.files.length<=50&&o.files.every(f=>isRecord(f)&&exact(f,['path','sha256','position'])&&typeof f.path==='string'&&f.path.length>0&&f.path.length<=32767&&!f.path.includes('\0')&&(f.sha256===null||typeof f.sha256==='string'&&/^[a-f0-9]{64}$/.test(f.sha256))&&['before','after','identical','diverged'].includes(String(f.position))))
}
/** Privé Main/adaptateur : jamais exposé dans une projection renderer. */
export type OwnedIdentity={pid:number;startedAt:string;executable:string}
export type OwnedRunRecord={schemaVersion:1;runId:string;status:'owned'|'unknown'|'stopped';identity:OwnedIdentity|null}
export function isOwnedRunRecord(v:unknown):v is OwnedRunRecord{return isRecord(v)&&exact(v,['schemaVersion','runId','status','identity'])&&v.schemaVersion===1&&approvalIdentifier(v.runId)&&['owned','unknown','stopped'].includes(String(v.status))&&(v.identity===null||isRecord(v.identity)&&exact(v.identity,['pid','startedAt','executable'])&&Number.isSafeInteger(v.identity.pid)&&Number(v.identity.pid)>0&&typeof v.identity.startedAt==='string'&&/^\d{1,30}$/.test(v.identity.startedAt)&&typeof v.identity.executable==='string'&&v.identity.executable.length>0&&v.identity.executable.length<=32767&&!v.identity.executable.includes('\0'))}
