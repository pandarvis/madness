import type { Snapshot } from '../contracts/index.ts'
import type { ConnectionAction, ConnectionState } from '../contracts/connection.ts'
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
