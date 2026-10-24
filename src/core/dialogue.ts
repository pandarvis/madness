import { dialogueError, dialogueFailure, initialDialogueState, isDialogueCommand } from '../contracts/dialogue.ts'
import type { DialogueCommand, DialogueState } from '../contracts/dialogue.ts'
import type { BmadProfile, DialogueSession } from './ports.ts'
import type { Application } from './application.ts'
type Dependencies = { application: Application; qualify(rootPath: string, signal: AbortSignal): Promise<BmadProfile>; open(profile: BmadProfile, signal: AbortSignal, activity: (text: string) => void): Promise<DialogueSession> }
/** Une seule session native possédée. Les travaux longs ne monopolisent jamais la queue disque. */
export class DialogueCoordinator {
  private state = initialDialogueState()
  private listeners = new Set<(state: DialogueState) => void>()
  private active: Promise<void> | null = null
  private controller: AbortController | null = null
  private session: DialogueSession | null = null
  private closing = false
  private blocked = false
  private deps: Dependencies
  constructor(deps: Dependencies) { this.deps = deps }
  read(): DialogueState { return structuredClone(this.state) }
  subscribe(listener: (state: DialogueState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private update(change: Partial<DialogueState>): void { this.state = { ...this.state, ...change, sequence: this.state.sequence + 1 }; for (const listener of this.listeners) { try { listener(this.read()) } catch { /* Observer sans posséder le travail. */ } } }
  private activity = (text: string): void => { this.update({ activities: [...this.state.activities, text.slice(0, 500)].slice(-80) }) }
  async execute(input: unknown): Promise<DialogueState> {
    if (!isDialogueCommand(input)) return { ...this.read(), errorCode: 'INVALID_COMMAND' }
    if (input.type === 'read') return this.read()
    if (this.closing) return { ...this.read(), errorCode: 'APP_CLOSING' }
    if (input.type === 'stop') { if (!this.active && !this.session) return this.read(); this.controller?.abort(); this.update({ status: 'stopping' }); if (!this.active) this.schedule(() => this.stop()); return this.read() }
    if (this.blocked) return { ...this.read(), errorCode: 'STOP_UNCONFIRMED' }
    if (this.active) return { ...this.read(), errorCode: 'BUSY' }
    if (input.type === 'send') {
      if (!this.session || input.projectId !== this.state.context.projectId || input.conversationId !== this.state.context.conversationId || this.state.status !== 'ready') return { ...this.read(), errorCode: 'CONTEXT_MISMATCH' }
      this.update({ status: 'running', acknowledged: false, errorCode: null })
      this.schedule(() => this.turn(input))
    } else if (input.type === 'qualify' || input.type === 'launch') {
      if (this.session) return { ...this.read(), errorCode: 'BUSY' }
      this.controller = new AbortController()
      this.update({ status: 'qualifying', context: { ...initialDialogueState().context, projectId: input.projectId }, acknowledged: false, errorCode: null, profile: null, activities: [] })
      this.schedule(() => this.launch(input))
    }
    return this.read()
  }
  private schedule(work: () => Promise<void>): void { this.active = Promise.resolve().then(async () => { await work(); if (this.controller?.signal.aborted && this.session) await this.stop() }).catch(async error => {
    const code = dialogueError(error, this.controller?.signal.aborted ? 'CANCELLED' : 'PROVIDER_FAILED')
    let stopped = await this.stopSession()
    if (code === 'STOP_UNCONFIRMED') stopped = 'unknown'
    if (stopped === 'unknown') this.blocked = true
    this.update({ status: stopped === 'unknown' ? 'unknown' : code === 'CANCELLED' ? 'stopped' : 'error', errorCode: stopped === 'unknown' ? 'STOP_UNCONFIRMED' : code })
    await this.persistActivity(stopped === 'unknown' ? 'unknown' : 'interrupted').catch(() => this.update({ status: 'unknown', errorCode: 'STORAGE_WRITE_FAILED' }))
  }).finally(() => { this.active = null }) }
  private async launch(input: Extract<DialogueCommand, { type: 'qualify' | 'launch' }>): Promise<void> {
    const project = await this.deps.application.dialogueProject(input.projectId)
    const profile = await this.deps.qualify(project.rootPath, this.controller!.signal)
    this.controller!.signal.throwIfAborted()
    this.update({ status: 'qualified', profile: { fingerprint: profile.fingerprint, skillPath: profile.skillPath } })
    this.activity('Profil Mary et dépendances vérifiés · lecture seule')
    if (input.type === 'qualify') return
    this.update({ status: 'starting' })
    this.session = await this.deps.open(profile, this.controller!.signal, this.activity)
    this.controller!.signal.throwIfAborted()
    const conversation = await this.deps.application.dialoguePersist(project.id, null, value => { value.lastKnownActivity = 'running' }, this.session.context)
    this.update({ context: conversation.context })
    await this.turn(null)
  }
  private async turn(input: Extract<DialogueCommand, { type: 'send' }> | null): Promise<void> {
    const { projectId, conversationId } = this.state.context
    if (!projectId || !conversationId || !this.session) throw dialogueFailure('CONTEXT_MISMATCH')
    await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.lastKnownActivity = 'running' })
    const text = await this.session.turn(input?.text ?? null, async () => {
      await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.messages.push({ id: input?.correlationId ?? 'mary-invocation', role: 'user', text: input?.text ?? '$bmad-agent-analyst' }) })
      this.update({ status: 'running', acknowledged: true }); this.activity('Envoi acquitté par Codex · conversation capturée')
    })
    if (!text.trim()) throw dialogueFailure('PROVIDER_FAILED')
    await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.messages.push({ id: (input?.correlationId ?? 'mary-invocation').slice(0, 72) + '-reply', role: 'assistant', text }); value.lastKnownActivity = 'idle' })
    if (this.controller?.signal.aborted) return
    this.update({ status: 'ready', errorCode: null }); this.activity('Tour terminé · réponse enregistrée · à vous de répondre')
  }
  private async persistActivity(activity: 'idle' | 'interrupted' | 'unknown'): Promise<void> { const { projectId, conversationId } = this.state.context; if (projectId && conversationId) await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.lastKnownActivity = activity }) }
  private async stopSession(): Promise<'stopped' | 'unknown'> { const session = this.session; this.session = null; let outcome: 'stopped' | 'unknown' = this.blocked ? 'unknown' : 'stopped'; try { if (session) outcome = await session.stop() } catch { outcome = 'unknown' } if (outcome === 'unknown') this.blocked = true; return outcome }
  private async stop(): Promise<void> { const outcome = await this.stopSession(); await this.persistActivity(outcome === 'stopped' ? 'idle' : 'unknown'); this.update({ status: outcome, errorCode: outcome === 'unknown' ? 'STOP_UNCONFIRMED' : null }); this.activity(outcome === 'stopped' ? 'Processus Codex arrêté' : 'Arrêt Codex non confirmé') }
  async settled(): Promise<void> { await this.active }
  async shutdown(): Promise<'stopped' | 'unknown'> { this.closing = true; this.controller?.abort(); await this.active; await this.stop(); return this.blocked ? 'unknown' : 'stopped' }
}
