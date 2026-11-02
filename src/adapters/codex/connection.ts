import { connectionError, connectionFailure, initialConnectionState } from '../../contracts/connection.ts'
import type { ConnectionAction, ConnectionState,ConnectionErrorCode } from '../../contracts/connection.ts'
import type { ConnectionPort,RunRecoveryPort } from '../../core/ports.ts'
import type { Credentials, Registration, VaultPort } from './vault.ts'
import { dialogueFailure } from '../../contracts/dialogue.ts'
import { createHash } from 'node:crypto'
export type ConnectionDependencies = {
  recovery?:RunRecoveryPort
  admission?:{enter(kind:'provider'|'helper',nested?:boolean):()=>void}
  vault: VaultPort
  oauth(options: { registration: Registration; previous: Credentials | null; signal: AbortSignal }): Promise<Credentials>
  refresh(value: Credentials, signal: AbortSignal): Promise<Credentials>
  probe(value: Credentials, signal: AbortSignal): Promise<{ stopped: boolean; version: string }>
  now(): Date
  openUsage(): Promise<void>
  openPublicKeys(): Promise<void>
  copyPublicKeys(): Promise<void>
  checkPublicKeys?(signal:AbortSignal):Promise<void>
}
/** Travail long hors queue de persistance du cœur ; commandes IPC courtes et annulables. */
export class CodexConnection implements ConnectionPort {
  private state = initialConnectionState()
  private credentials: Credentials | null = null
  private restoredVaultError:ConnectionErrorCode|null=null
  private listeners = new Set<(value: ConnectionState) => void>()
  private ready: Promise<void>
  private active: { controller: AbortController; done: Promise<void> } | null = null
  private closing = false
  private mutation: Promise<void> | null = null
  private stopUnconfirmed = false
  private dialogueLease = false
  private leaseOwner:symbol|null=null
  private dialogueStopUnconfirmed=false
  private networkWork:{controller:AbortController;done:Promise<void>}|null=null
  private deps: ConnectionDependencies
  constructor(deps: ConnectionDependencies) { this.deps = deps; this.ready = this.restore() }
  private async restore(): Promise<void> {
    try { this.credentials = await this.deps.vault.read(); this.update({ status: this.credentials ? 'registered' : 'disconnected', accountStored: !!this.credentials, needsPlanAcknowledgement: !!this.credentials && !this.credentials.planAcknowledged, errorCode: null }) }
    catch (error) { this.restoredVaultError=connectionError(error,'VAULT_UNREADABLE');this.update({ status: 'error', errorCode: this.restoredVaultError }) }
    try{if(this.deps.recovery&&await this.deps.recovery.status()!=='stopped'){this.dialogueStopUnconfirmed=true;this.update({status:'unknown',errorCode:'STOP_UNCONFIRMED',verifiedAt:null})}}catch{this.dialogueStopUnconfirmed=true;this.update({status:'unknown',errorCode:'STOP_UNCONFIRMED',verifiedAt:null})}
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
    if(action==='cancel-public-keys'){this.networkWork?.controller.abort();return this.read()}
    if(action==='check-public-keys'){
      if(this.closing||this.networkWork)return this.read()
      const controller=new AbortController()
      this.update({network:{status:'checking',checkedAt:null,errorCode:null}})
      const work={controller,done:Promise.resolve()};this.networkWork=work
      const done=(async()=>{try{if(!this.deps.checkPublicKeys)throw connectionFailure('NETWORK_UNAVAILABLE');await this.deps.checkPublicKeys(controller.signal);controller.signal.throwIfAborted();this.update({network:{status:'accessible',checkedAt:this.deps.now().toISOString(),errorCode:null}})}catch(e){this.update({network:{status:controller.signal.aborted?'cancelled':'error',checkedAt:this.deps.now().toISOString(),errorCode:controller.signal.aborted?null:connectionError(e,'NETWORK_UNAVAILABLE')==='TIMEOUT'?'TIMEOUT':'NETWORK_UNAVAILABLE'}})}finally{if(this.networkWork?.controller===controller)this.networkWork=null}})()
      work.done=done;return this.read()
    }
    if (action === 'open-public-keys' || action === 'copy-public-keys') {
      try { if (this.closing) throw Error(); await (action === 'open-public-keys' ? this.deps.openPublicKeys() : this.deps.copyPublicKeys()); return this.read() }
      catch { throw new Error('PUBLIC_KEYS_SUPPORT_FAILED') }
    }
    if (this.closing) return this.read()
    if (this.dialogueLease && action !== 'manage-usage') return { ...this.state, status: 'error', errorCode: 'BUSY' }
    if (action === 'cancel') { if (this.active) { this.update({ status: 'stopping', verifiedAt: null }); this.active.controller.abort(connectionFailure('CANCELLED')) } return this.read() }
    if (this.active || this.mutation) return this.read()
    if (action === 'connect' || action === 'verify') {
      if (this.stopUnconfirmed||this.dialogueStopUnconfirmed) return this.read()
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
        if (action === 'disconnect') { await this.deps.vault.clear(); this.restoredVaultError=null;this.credentials = null; this.update({ status: this.stopUnconfirmed||this.dialogueStopUnconfirmed ? 'unknown' : 'disconnected', accountStored: false, errorCode: this.stopUnconfirmed||this.dialogueStopUnconfirmed ? 'STOP_UNCONFIRMED' : null, verifiedAt: null, cliVersion: null, needsPlanAcknowledgement: false }) }
        if (action === 'acknowledge-plan' && this.credentials) { const value = { ...this.credentials, planAcknowledged: true }; await this.deps.vault.write(value); this.credentials = value; this.update({ needsPlanAcknowledgement: false }) }
        if (action === 'manage-usage') await this.deps.openUsage()
      } catch (error) { this.update({ status: 'error', errorCode: connectionError(error, action === 'manage-usage' ? 'BROWSER_UNAVAILABLE' : 'VAULT_WRITE_FAILED') }) }
    })()
    this.mutation = mutation
    try { await mutation } finally { this.mutation = null }
    return this.read()
  }
  private async work(action: 'connect' | 'verify', signal: AbortSignal): Promise<void> {
    let admissionRelease:(()=>void)|undefined
    try {
      admissionRelease=this.deps.admission?.enter('provider')
      signal.throwIfAborted()
      if(this.deps.recovery&&await this.deps.recovery.status()!=='stopped'){this.dialogueStopUnconfirmed=true;throw connectionFailure('STOP_UNCONFIRMED')}
      if (action === 'connect') {
        const registration = await this.deps.vault.registration()
        signal.throwIfAborted()
        const value = await this.deps.oauth({ registration, previous: this.credentials, signal })
        signal.throwIfAborted()
        await this.deps.vault.saveClientId(value.clientId)
        await this.deps.vault.write(value)
        this.restoredVaultError=null;this.credentials = value
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
      if (code === 'STOP_UNCONFIRMED'&&!this.dialogueStopUnconfirmed) this.stopUnconfirmed = true
      this.update({ status: code === 'STOP_UNCONFIRMED' ? 'unknown' : signal.aborted ? 'cancelled' : 'error', errorCode: code, verifiedAt: null })
    }finally{admissionRelease?.()}
  }
  /** Accès interne à l’adaptateur : aucun jeton ne traverse le pont renderer. */
  async acquireDialogue(signal: AbortSignal): Promise<{ credentials: Credentials; connectionId: string; release(stopped?: boolean): void }> {
    await this.ready; signal.throwIfAborted()
    if (this.closing) throw dialogueFailure('APP_CLOSING')
    if (this.active || this.mutation || this.dialogueLease) throw dialogueFailure('CONNECTION_BUSY')
    if (this.stopUnconfirmed||this.dialogueStopUnconfirmed) throw dialogueFailure('STOP_UNCONFIRMED')
    if (!this.credentials) throw dialogueFailure('NO_ACCOUNT')
    if (!this.credentials.planAcknowledged) throw dialogueFailure('PLAN_ACK_REQUIRED')
    const admissionRelease=this.deps.admission?.enter('provider')
    this.dialogueLease = true
    const owner=Symbol('dialogue-lease');this.leaseOwner=owner
    try {
      if(this.deps.recovery&&await this.deps.recovery.status()!=='stopped')throw dialogueFailure('STOP_UNCONFIRMED')
      if (this.credentials.expiresAt <= this.deps.now().getTime() + 60000) { const value = await this.deps.refresh(this.credentials, signal); signal.throwIfAborted(); await this.deps.vault.write(value); this.credentials = value }
      const connectionId = 'c-' + createHash('sha256').update(this.credentials.clientId + '\0' + this.credentials.subject).digest('hex')
      return { credentials: structuredClone(this.credentials), connectionId, release: (stopped = true) => { if(this.leaseOwner!==owner)return;this.leaseOwner=null;this.dialogueLease = false;admissionRelease?.(); if (!stopped) { this.dialogueStopUnconfirmed = true; this.update({ status: 'unknown', errorCode: 'STOP_UNCONFIRMED', verifiedAt: null }) } } }
    } catch (error) { if(this.leaseOwner===owner){this.leaseOwner=null;this.dialogueLease = false;admissionRelease?.(); this.update({ status: 'error', errorCode: connectionError(error, 'PROBE_FAILED'), verifiedAt: null })} throw error }
  }
  async confirmDialogueStop():Promise<void>{if(this.deps.recovery&&await this.deps.recovery.status()!=='stopped'){this.dialogueStopUnconfirmed=true;this.update({status:'unknown',errorCode:'STOP_UNCONFIRMED',verifiedAt:null});return}if(!this.dialogueLease){this.dialogueStopUnconfirmed=false;if(!this.stopUnconfirmed&&this.state.errorCode==='STOP_UNCONFIRMED')this.update({status:this.restoredVaultError?'error':this.credentials?'registered':'disconnected',errorCode:this.restoredVaultError,verifiedAt:null})}}
  /** Main appelle uniquement après preuve de fermeture du propriétaire durable partagé. */
  async confirmRecoveryStop():Promise<void>{if(this.deps.recovery&&await this.deps.recovery.status()!=='stopped')return;if(!this.dialogueLease&&!this.active){this.stopUnconfirmed=false;await this.confirmDialogueStop()}}
  markRecoveryUnknown():void{this.dialogueStopUnconfirmed=true;this.update({status:'unknown',errorCode:'STOP_UNCONFIRMED',verifiedAt:null})}
  hasDialogueLease():boolean{return this.dialogueLease&&!this.dialogueStopUnconfirmed&&!this.stopUnconfirmed}
  hasOperation():boolean{return !!(this.active||this.dialogueLease||this.mutation)}
  async shutdown(): Promise<'stopped' | 'unknown'> {
    this.closing = true; this.update({ status: 'closing', verifiedAt: null })
    this.active?.controller.abort(connectionFailure('CANCELLED'))
    this.networkWork?.controller.abort()
    const pending = [this.active?.done, this.mutation,this.networkWork?.done].filter((value): value is Promise<void> => !!value)
    const outcome=async():Promise<'unknown'|'stopped'>=>{try{return this.stopUnconfirmed||this.dialogueStopUnconfirmed||this.deps.recovery&&await this.deps.recovery.status()!=='stopped'?'unknown':'stopped'}catch{return 'unknown'}}
    if (!pending.length) return outcome()
    let timer: ReturnType<typeof setTimeout> | undefined
    try { return await Promise.race([Promise.all(pending).then(outcome), new Promise<'unknown'>((resolve) => { timer = setTimeout(() => resolve('unknown'), 12000) })]) }
    finally { clearTimeout(timer) }
  }
}
