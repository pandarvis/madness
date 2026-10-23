import { emptyContext, failure, isCommand, isSnapshot } from '../contracts/index.ts'
import type { AppState, Command, DomainEvent, ErrorCode, Reply, Snapshot } from '../contracts/index.ts'
import type { ApplicationDependencies } from './ports.ts'
import { LifecycleCoordinator } from './lifecycle.ts'

export class Application {
  private deps: ApplicationDependencies
  private snapshot: Snapshot | null = null
  private queue: Promise<unknown> = Promise.resolve()
  private listeners = new Set<(event: DomainEvent) => void>()
  private sequence = 0
  readonly lifecycle = new LifecycleCoordinator()
  constructor(dependencies: ApplicationDependencies) { this.deps = dependencies }
  subscribe(listener: (event: DomainEvent) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  execute(input: unknown): Promise<Reply> {
    if (!isCommand(input)) return Promise.resolve(failure('INVALID_COMMAND', 'invalid-request'))
    const result = this.queue.then(() => this.handle(input))
    this.queue = result.catch(() => undefined)
    return result
  }
  private projection(): AppState {
    return structuredClone({ ...this.snapshot!, capabilities: { codex: { available: false, reasonKey: 'codex.unqualified' } }, lifecycle: this.lifecycle.state }) as AppState
  }
  private success(command: Command, effect: 'read' | 'cancelled' | 'saved'): Reply {
    return { contractVersion: 1, correlationId: command.correlationId, ok: true, value: { state: this.projection(), effect } }
  }
  private async handle(command: Command): Promise<Reply> {
    if (this.lifecycle.state === 'closing') return failure('APP_CLOSING', command.correlationId)
    if (!this.snapshot) {
      try {
        const restored = await this.deps.store.read()
        if (!isSnapshot(restored)) return failure('STORAGE_CORRUPT', command.correlationId)
        // Restaurer n'autorise jamais la reprise d'une activité ni d'une attente.
        this.snapshot = { ...restored, conversations: restored.conversations.map((c) => ({ ...c, lastKnownActivity: c.lastKnownActivity === 'idle' ? 'idle' : 'unknown' })) }
      } catch (error) { return failure(this.errorCode(error, 'STORAGE_READ_FAILED'), command.correlationId) }
    }
    if (command.type === 'read-state') return this.success(command, 'read')
    const next = structuredClone(this.snapshot)
    let projectId: string | null = null
    switch (command.type) {
      case 'choose-directory': {
        let directory
        try { directory = await this.deps.chooseDirectory() }
        catch { return failure('DIRECTORY_UNAVAILABLE', command.correlationId) }
        if (!directory) return this.success(command, 'cancelled')
        const existing = next.projects.find((p) => p.rootPath.toLocaleLowerCase('en-US') === directory.rootPath.toLocaleLowerCase('en-US'))
        projectId = existing?.id ?? this.deps.newId()
        if (existing) existing.openedAt = this.deps.now()
        else next.projects.push({ id: projectId, ...directory, openedAt: this.deps.now() })
        next.activeProjectId = projectId
        break
      }
      case 'select-project':
      case 'save-draft': {
        projectId = command.projectId
        if (!next.projects.some((p) => p.id === projectId)) return failure('PROJECT_NOT_FOUND', command.correlationId, projectId)
        if (command.type === 'select-project') next.activeProjectId = projectId
        else {
          const draft = { projectId, text: command.text, savedAt: this.deps.now() }
          next.drafts = [...next.drafts.filter((d) => d.projectId !== projectId), draft]
        }
        break
      }
      case 'set-navigation': next.preferences.navigationCollapsed = command.collapsed; break
    }
    next.revision++
    if (!isSnapshot(next)) return failure('INVALID_COMMAND', command.correlationId, projectId)
    try { await this.deps.store.write(next) }
    catch (error) { return failure(this.errorCode(error, 'STORAGE_WRITE_FAILED'), command.correlationId, projectId) }
    this.snapshot = next
    const event: DomainEvent = { contractVersion: 1, type: 'state-changed', correlationId: command.correlationId, sequence: ++this.sequence, context: { ...emptyContext(), projectId }, revision: next.revision }
    for (const listener of this.listeners) { try { listener(event) } catch { /* Un observateur ne change pas l'accusé durable. */ } }
    return this.success(command, 'saved')
  }
  private errorCode(error: unknown, fallback: ErrorCode): ErrorCode {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
    return ['STORAGE_CORRUPT', 'STORAGE_VERSION_UNSUPPORTED', 'STORAGE_CONFLICT'].includes(String(code)) ? code as ErrorCode : fallback
  }
  async shutdown(): Promise<void> { await this.queue; await this.lifecycle.shutdown() }
}
