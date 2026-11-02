import type {ApprovalFile,ApprovalResult,ApprovalRecord,ApprovalDecision,DialogueMode} from '../contracts/approvals.ts'
import type { Snapshot } from '../contracts/index.ts'
import type { ConnectionAction, ConnectionState } from '../contracts/connection.ts'
import type { MessageIdentity, WorkflowRecord, WorkflowObservation } from '../contracts/dialogue.ts'
import type {QuestionField,QuestionRecord,QuestionValues} from '../contracts/questions.ts'
export interface RunRecoveryPort {status():Promise<'stopped'|'unknown'>;observeStop():Promise<'stopped'|'unknown'>}
export interface ApprovalPort {read():Promise<ApprovalRecord[]>;write(record:ApprovalRecord):Promise<void>}
export type ApprovalResponder={decide(decision:ApprovalDecision):Promise<void>;invalidated:Promise<void>;result:Promise<ApprovalResult>}
export type ApprovalObserver=(approval:{files:ApprovalFile[];identity:MessageIdentity;expiresAt:number},responder:ApprovalResponder)=>Promise<void>
export interface QuestionPort {read():Promise<QuestionRecord[]>;write(record:QuestionRecord):Promise<void>}
export type DialogueQuestion={id:string;fields:QuestionField[];identity:MessageIdentity;expiresAt:number|null}
export type QuestionResponder={answer(values:QuestionValues):Promise<void>;invalidated:Promise<void>}
export type QuestionObserver=(question:DialogueQuestion,responder:QuestionResponder)=>Promise<void>
export type BmadProfile = { rootPath: string; mode?:DialogueMode; skillPath: string; fingerprint: string; kind?: 'forge'|'help'; help?:{bundleId:string;initiativeId:string|null}; forge?: { outputBase: string; initiativeId: string | null; contextDigest: string } }
export interface WorkflowPort { read(): Promise<WorkflowRecord[]>; write(record: WorkflowRecord): Promise<void> }
/** Les identifiants de cette projection sont locaux au connecteur, jamais ceux du fournisseur. */
export type DialogueMessageUpdate = { id: string; order: number; text: string; completed: boolean; identity: MessageIdentity }
export interface DialogueSession { context: { connectionId: string; initiativeId: string | null }; help?:{nativeTurn?():{threadId:string;turnId:string}|null;bundle:import('../contracts/bmad-help.ts').HelpBundle;bind(observer:(r:import('../contracts/bmad-help.ts').HelpToolReceipt)=>Promise<void>):void}; workflow?: { outputBase: string; contextDigest: string; bind(observer: (observation: WorkflowObservation, workspace?: string, outcome?: WorkflowRecord['outcome']) => Promise<void>): void }; turn(text: string | null, accepted: () => Promise<void>, observe?: (message: DialogueMessageUpdate) => void,onQuestion?:QuestionObserver,onApproval?:ApprovalObserver): Promise<string>; stop(): Promise<'stopped' | 'unknown'> }
export interface ConnectionPort {
  read(): Promise<ConnectionState>
  command(action: ConnectionAction): Promise<ConnectionState>
  subscribe(listener: (state: ConnectionState) => void): () => void
  shutdown(): Promise<'stopped' | 'unknown'>
}
export interface PersistencePort { read(): Promise<Snapshot>; write(snapshot: Snapshot): Promise<void> }
export interface DirectoryPort { rootPath: string; name: string }
export interface ApplicationDependencies {
  store: PersistencePort
  chooseDirectory(): Promise<DirectoryPort | null>
  newId(): string
  now(): string
}
