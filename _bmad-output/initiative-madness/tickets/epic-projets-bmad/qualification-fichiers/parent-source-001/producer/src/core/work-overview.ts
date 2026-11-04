import type {AppState, ContextRef} from '../contracts/index.ts'
import type {ConnectionState} from '../contracts/connection.ts'
import type {DialogueState, DialogueMessage, WorkflowRecord} from '../contracts/dialogue.ts'
import type {QuestionRecord} from '../contracts/questions.ts'
import type {ApprovalRecord} from '../contracts/approvals.ts'

export type OverviewTarget = {kind:'question'|'approval'|'recovery'|'conversation'|'session'; context:ContextRef; id:string}
export type OverviewEntry = {id:string;target:OverviewTarget;state:'waiting'|'sending'|'recovery'|'working';projectName:string|null;identity:string|null;prompt:string|null;error:DialogueState['errorCode'];activity?:DialogueState['status']}
export type ConversationOverview = {id:string;context:ContextRef;projectName:string;turn:DialogueState['turn'];results:{id:string;text:string;storage:DialogueMessage['storage']|'historical'}[];questions:QuestionRecord[];approvals:ApprovalRecord[];workflow:WorkflowRecord|null}
export type WorkOverviewState = {observedAt:number;connection:Pick<ConnectionState,'status'|'accountStored'|'verifiedAt'|'network'>;entries:OverviewEntry[];conversations:ConversationOverview[]}
export function sameContext(a:ContextRef,b:ContextRef):boolean {return (['projectId','initiativeId','conversationId','providerId','connectionId'] as const).every(key=>a[key]===b[key])}

/** Projection locale seule : aucune lecture de fichiers, interprétation de prose ou commande. */
export function projectWorkOverview(app:AppState,dialogue:DialogueState,connection:ConnectionState,now:number):WorkOverviewState {
 const knownConversation=(context:ContextRef)=>app.conversations.some(c=>c.id===context.conversationId&&sameContext(c.context,context))
 const live=(record:QuestionRecord|ApprovalRecord)=>record.reason===null&&knownConversation(record.context)&&sameContext(record.context,dialogue.context)&&!!dialogue.turn&&sameContext(record.context,dialogue.turn.context)&&record.turnId===dialogue.turn.id&&record.requestId===dialogue.turn.requestId&&dialogue.turn.phase==='streaming'&&['running','waiting-question','waiting-approval'].includes(dialogue.status)&&dialogue.recovery.stop==='clear'&&(record.expiresAt===null||record.expiresAt>now)
 const entries:OverviewEntry[]=[]
 for(const [kind,records] of [['question',dialogue.questions],['approval',dialogue.approvals]] as const)for(const record of records){
  if(!['waiting','sending'].includes(record.status)||!live(record))continue
  entries.push({id:kind+':'+record.id,target:{kind,context:{...record.context},id:record.id},state:record.status==='sending'?'sending':'waiting',projectName:app.projects.find(p=>p.id===record.context.projectId)?.name??null,identity:record.identity.kind==='attested'?record.identity.name:null,prompt:'fields' in record?record.fields.map(f=>f.prompt).join(' · '):null,error:null})
 }
 for(const approval of dialogue.approvals.filter(a=>a.decision==='accept'&&(['unknown','pending'].includes(a.effect)||a.storage!=='stored'))){
  entries.push({id:'recovery:'+approval.id,target:{kind:'recovery',id:approval.id,context:{...approval.context}},state:'recovery',projectName:app.projects.find(p=>p.id===approval.context.projectId)?.name??null,identity:null,prompt:null,error:null})
 }
 if(dialogue.recovery.stop==='unconfirmed'||dialogue.errorCode){
  // Une propriété de processus restaurée sans contexte ne devient pas celle du projet actif.
  entries.push({id:'session-recovery',target:{kind:'session',id:'session',context:{...dialogue.context}},state:'recovery',projectName:app.projects.find(p=>p.id===dialogue.context.projectId)?.name??null,identity:null,prompt:null,error:dialogue.errorCode})
 }
 if(!dialogue.errorCode&&dialogue.recovery.stop==='clear'&&['qualifying','starting','running','inspecting','stopping'].includes(dialogue.status)&&!entries.some(e=>e.state==='waiting'||e.state==='sending'))entries.push({id:'session-activity',target:{kind:'session',id:'activity',context:{...dialogue.context}},state:'working',projectName:app.projects.find(p=>p.id===dialogue.context.projectId)?.name??null,identity:null,prompt:null,error:null,activity:dialogue.status})
 const conversations=app.conversations.map(conversation=>{
  const context=conversation.context,turn=dialogue.turn&&sameContext(context,dialogue.turn.context)&&sameContext(context,dialogue.context)?structuredClone(dialogue.turn):null
  const messages=turn?dialogue.messages.filter(m=>sameContext(m.context,context)&&m.turnId===turn.id&&m.requestId===turn.requestId).sort((a,b)=>a.order-b.order):[]
  const results=turn?messages.map(m=>({id:m.id,text:m.text,storage:m.storage})):conversation.messages.filter(m=>m.role==='assistant').slice(-1).map(m=>({id:m.id,text:m.text,storage:'historical' as const}))
  return {id:conversation.id,context:{...context},projectName:app.projects.find(p=>p.id===context.projectId)?.name??'Projet capturé indisponible',turn,results,questions:structuredClone(dialogue.questions.filter(q=>sameContext(q.context,context))),approvals:structuredClone(dialogue.approvals.filter(a=>sameContext(a.context,context))),workflow:structuredClone(dialogue.workflows.find(w=>w.conversationId===conversation.id&&sameContext(w.context,context))??null)}
 })
 return {observedAt:now,connection:structuredClone({status:connection.status,accountStored:connection.accountStored,verifiedAt:connection.verifiedAt,network:connection.network}),entries,conversations}
}
