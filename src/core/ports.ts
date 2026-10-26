import type { Snapshot } from '../contracts/index.ts'
import type { ConnectionAction, ConnectionState } from '../contracts/connection.ts'
import type { WorkflowRecord, WorkflowObservation } from '../contracts/dialogue.ts'
export type BmadProfile = { rootPath: string; skillPath: string; fingerprint: string; kind?: 'forge'; forge?: { outputBase: string; initiativeId: string | null; contextDigest: string } }
export interface WorkflowPort { read(): Promise<WorkflowRecord[]>; write(record: WorkflowRecord): Promise<void> }
export interface DialogueSession { context: { connectionId: string; initiativeId: string | null }; workflow?: { outputBase: string; contextDigest: string; bind(observer: (observation: WorkflowObservation, workspace?: string, outcome?: WorkflowRecord['outcome']) => Promise<void>): void }; turn(text: string | null, accepted: () => Promise<void>): Promise<string>; stop(): Promise<'stopped' | 'unknown'> }
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
