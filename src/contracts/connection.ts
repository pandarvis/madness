import { isCorrelationId, isRecord } from './index.ts'
/** Surface dédiée : aucun secret ni identifiant de compte ne traverse ce contrat. */
export const CONNECTION_COMMAND_CHANNEL = 'madness:connection:command:v1'
export const CONNECTION_EVENT_CHANNEL = 'madness:connection:event:v1'
export const PUBLIC_KEYS_URL = 'https://auth.openai.com/.well-known/jwks.json'
export const connectionStatuses = ['disconnected', 'registered', 'authorizing', 'verifying', 'stopping', 'verified', 'error', 'cancelled', 'unknown', 'closing'] as const
export const connectionErrors = ['INVALID_COMMAND', 'UNTRUSTED_CALLER', 'ENCRYPTION_UNAVAILABLE', 'VAULT_UNREADABLE', 'VAULT_WRITE_FAILED', 'REGISTRATION_INVALID', 'NETWORK_UNAVAILABLE', 'OAUTH_INVALID', 'CONSENT_DENIED', 'SCOPES_MISSING', 'IDENTITY_CHANGED', 'CANCELLED', 'TIMEOUT', 'BROWSER_UNAVAILABLE', 'CODEX_MISSING', 'CODEX_INVALID', 'PROBE_FAILED', 'STOP_UNCONFIRMED', 'APP_CLOSING', 'BUSY', 'NO_ACCOUNT'] as const
export type ConnectionErrorCode = typeof connectionErrors[number]
export type ConnectionStatus = typeof connectionStatuses[number]
export type ConnectionState = { contractVersion: 1; sequence: number; status: ConnectionStatus; accountStored: boolean; verifiedAt: string | null; errorCode: ConnectionErrorCode | null; cliVersion: string | null; needsPlanAcknowledgement: boolean }
export const connectionActions = ['read', 'connect', 'verify', 'cancel', 'disconnect', 'acknowledge-plan', 'manage-usage', 'open-public-keys', 'copy-public-keys'] as const
export type ConnectionAction = typeof connectionActions[number]
export type ConnectionCommand = { contractVersion: 1; correlationId: string; action: ConnectionAction }
export type ConnectionReply = { contractVersion: 1; correlationId: string; state: ConnectionState }
export interface ConnectionBridge {
  read(): Promise<ConnectionReply>
  connect(): Promise<ConnectionReply>
  verify(): Promise<ConnectionReply>
  cancel(): Promise<ConnectionReply>
  disconnect(): Promise<ConnectionReply>
  acknowledgePlan(): Promise<ConnectionReply>
  manageUsage(): Promise<ConnectionReply>
  openPublicKeys(): Promise<ConnectionReply>
  copyPublicKeys(): Promise<ConnectionReply>
  onChanged(listener: (state: ConnectionState) => void): () => void
}
const exact = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
export function isConnectionCommand(value: unknown): value is ConnectionCommand {
  return isRecord(value) && exact(value, ['contractVersion', 'correlationId', 'action']) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && connectionActions.includes(value.action as ConnectionAction)
}
export function isConnectionState(value: unknown): value is ConnectionState {
  if (!isRecord(value) || !exact(value, ['contractVersion', 'sequence', 'status', 'accountStored', 'verifiedAt', 'errorCode', 'cliVersion', 'needsPlanAcknowledgement'])) return false
  return value.contractVersion === 1 && Number.isSafeInteger(value.sequence) && Number(value.sequence) >= 0 && connectionStatuses.includes(value.status as ConnectionStatus) && typeof value.accountStored === 'boolean' && typeof value.needsPlanAcknowledgement === 'boolean' && (!value.needsPlanAcknowledgement || value.accountStored) && (value.errorCode === null || connectionErrors.includes(value.errorCode as ConnectionErrorCode)) && (value.cliVersion === null || typeof value.cliVersion === 'string' && /^\d+\.\d+\.\d+(?:[-.a-zA-Z0-9]+)?$/.test(value.cliVersion)) && (value.verifiedAt === null || typeof value.verifiedAt === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.verifiedAt) && Number.isFinite(Date.parse(value.verifiedAt))) && (value.status !== 'verified' || value.accountStored && value.verifiedAt !== null && value.errorCode === null) && (value.status !== 'registered' || value.accountStored) && (value.status !== 'disconnected' || !value.accountStored)
}
export function isConnectionReply(value: unknown): value is ConnectionReply {
  return isRecord(value) && exact(value, ['contractVersion', 'correlationId', 'state']) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && isConnectionState(value.state)
}
export const initialConnectionState = (): ConnectionState => ({ contractVersion: 1, sequence: 0, status: 'disconnected', accountStored: false, verifiedAt: null, errorCode: null, cliVersion: null, needsPlanAcknowledgement: false })
export function connectionFailure(code: ConnectionErrorCode): Error & { code: ConnectionErrorCode } { return Object.assign(new Error(code), { code }) }
export function connectionError(error: unknown, fallback: ConnectionErrorCode): ConnectionErrorCode {
  return isRecord(error) && connectionErrors.includes(error.code as ConnectionErrorCode) ? error.code as ConnectionErrorCode : error instanceof Error && connectionErrors.includes((error as Error & { code?: ConnectionErrorCode }).code!) ? (error as Error & { code: ConnectionErrorCode }).code : fallback
}
