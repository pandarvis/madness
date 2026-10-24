import { connectionError, connectionFailure, initialConnectionState } from '../../contracts/connection.ts'
import type { ConnectionAction, ConnectionState } from '../../contracts/connection.ts'
import type { ConnectionPort } from '../../core/ports.ts'
import type { Credentials, Registration, VaultPort } from './vault.ts'
export type ConnectionDependencies = {
  vault: VaultPort
  oauth(options: { registration: Registration; previous: Credentials | null; signal: AbortSignal }): Promise<Credentials>
  refresh(value: Credentials, signal: AbortSignal): Promise<Credentials>
  probe(value: Credentials, signal: AbortSignal): Promise<{ stopped: boolean; version: string }>
  now(): Date
  openUsage(): Promise<void>
}
/** Travail long hors queue de persistance du cœur ; commandes IPC courtes et annulables. */
export class CodexConnection implements ConnectionPort {
  private state = initialConnectionState()
  private credentials: Credentials | null = null
  private listeners = new Set<(value: ConnectionState) => void>()
  private ready: Promise<void>
  private active: { controller: AbortController; done: Promise<void> } | null = null
  private closing = false
  private mutation: Promise<void> | null = null
  private stopUnconfirmed = false
  private deps: ConnectionDependencies
  constructor(deps: ConnectionDependencies) { this.deps = deps; this.ready = this.restore() }
  private async restore(): Promise<void> {
    try { this.credentials = await this.deps.vault.read(); this.update({ status: this.credentials ? 'registered' : 'disconnected', accountStored: !!this.credentials, needsPlanAcknowledgement: !!this.credentials && !this.credentials.planAcknowledged, errorCode: null }) }
    catch (error) { this.update({ status: 'error', errorCode: connectionError(error, 'VAULT_UNREADABLE') }) }
  }
  private update(change: Partial<ConnectionState>): void {
    if (this.closing && change.status !== 'closing') return
    this.state = { ...this.state, ...change, sequence: this.state.sequence + 1 }
    for (const listener of this.listeners) { try { listener({ ...this.state }) } catch { /* Aucun abonné ne possède le cycle de vie. */ } }
  }
  async read(): Promise<ConnectionState> { await this.ready; return { ...this.state } }
  subscribe(listener: (state: ConnectionState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  async command(action: ConnectionAction): Promise<ConnectionState> {
    await this.ready
    if (action === 'read') return this.read()
    if (this.closing) return this.read()
    if (action === 'cancel') { if (this.active) { this.update({ status: 'stopping', verifiedAt: null }); this.active.controller.abort(connectionFailure('CANCELLED')) } return this.read() }
    if (this.active || this.mutation) return this.read()
    if (action === 'connect' || action === 'verify') {
      if (this.stopUnconfirmed) return this.read()
      if (['ENCRYPTION_UNAVAILABLE', 'VAULT_UNREADABLE', 'REGISTRATION_INVALID'].includes(this.state.errorCode ?? '')) return this.read()
      if (action === 'verify' && !this.credentials) { this.update({ status: 'error', errorCode: 'NO_ACCOUNT' }); return this.read() }
      const controller = new AbortController()
      this.update({ status: action === 'connect' ? 'authorizing' : 'verifying', errorCode: null, verifiedAt: null, cliVersion: null })
      const done = Promise.resolve().then(() => this.work(action, controller.signal)).finally(() => { this.active = null })
      this.active = { controller, done }
      return { ...this.state }
    }
    const mutation = (async () => {
      try {
        if (action === 'disconnect') { await this.deps.vault.clear(); this.credentials = null; this.update({ status: this.stopUnconfirmed ? 'unknown' : 'disconnected', accountStored: false, errorCode: this.stopUnconfirmed ? 'STOP_UNCONFIRMED' : null, verifiedAt: null, cliVersion: null, needsPlanAcknowledgement: false }) }
        if (action === 'acknowledge-plan' && this.credentials) { const value = { ...this.credentials, planAcknowledged: true }; await this.deps.vault.write(value); this.credentials = value; this.update({ needsPlanAcknowledgement: false }) }
        if (action === 'manage-usage') await this.deps.openUsage()
      } catch (error) { this.update({ status: 'error', errorCode: connectionError(error, action === 'manage-usage' ? 'BROWSER_UNAVAILABLE' : 'VAULT_WRITE_FAILED') }) }
    })()
    this.mutation = mutation
    try { await mutation } finally { this.mutation = null }
    return this.read()
  }
  private async work(action: 'connect' | 'verify', signal: AbortSignal): Promise<void> {
    try {
      signal.throwIfAborted()
      if (action === 'connect') {
        const registration = await this.deps.vault.registration()
        signal.throwIfAborted()
        const value = await this.deps.oauth({ registration, previous: this.credentials, signal })
        signal.throwIfAborted()
        await this.deps.vault.saveClientId(value.clientId)
        await this.deps.vault.write(value)
        this.credentials = value
        this.update({ status: 'verifying', accountStored: true, needsPlanAcknowledgement: !value.planAcknowledged })
      }
      if (!this.credentials) throw connectionFailure('NO_ACCOUNT')
      signal.throwIfAborted()
      if (this.credentials.expiresAt <= this.deps.now().getTime() + 60000) {
        const value = await this.deps.refresh(this.credentials, signal)
        signal.throwIfAborted()
        await this.deps.vault.write(value); this.credentials = value
      }
      const result = await this.deps.probe(this.credentials, signal)
      if (!result.stopped) throw connectionFailure('STOP_UNCONFIRMED')
      signal.throwIfAborted()
      this.update({ status: 'verified', verifiedAt: this.deps.now().toISOString(), cliVersion: result.version, errorCode: null })
    } catch (error) {
      const code = connectionError(error, 'PROBE_FAILED')
      if (code === 'STOP_UNCONFIRMED') this.stopUnconfirmed = true
      this.update({ status: code === 'STOP_UNCONFIRMED' ? 'unknown' : signal.aborted ? 'cancelled' : 'error', errorCode: code, verifiedAt: null })
    }
  }
  async shutdown(): Promise<'stopped' | 'unknown'> {
    this.closing = true; this.update({ status: 'closing', verifiedAt: null })
    this.active?.controller.abort(connectionFailure('CANCELLED'))
    const pending = [this.active?.done, this.mutation].filter((value): value is Promise<void> => !!value)
    if (!pending.length) return this.stopUnconfirmed ? 'unknown' : 'stopped'
    let timer: ReturnType<typeof setTimeout> | undefined
    try { return await Promise.race([Promise.all(pending).then(() => this.stopUnconfirmed ? 'unknown' as const : 'stopped' as const), new Promise<'unknown'>((resolve) => { timer = setTimeout(() => resolve('unknown'), 12000) })]) }
    finally { clearTimeout(timer) }
  }
}
