import { emptyContext, isCorrelationId, isRecord, MAX_DRAFT_LENGTH } from './index.ts'
import type { ContextRef } from './index.ts'
export const DIALOGUE_COMMAND_CHANNEL = 'madness:dialogue:command:v1'
export const DIALOGUE_EVENT_CHANNEL = 'madness:dialogue:event:v1'
export const dialogueErrors = ['INVALID_COMMAND', 'UNTRUSTED_CALLER', 'BUSY', 'APP_CLOSING', 'PROJECT_NOT_FOUND', 'CONTEXT_MISMATCH', 'PROFILE_ABSENT', 'PROFILE_UNRECOGNIZED', 'PROFILE_CHANGED', 'RESOLVER_FAILED', 'NO_ACCOUNT', 'PLAN_ACK_REQUIRED', 'CONNECTION_BUSY', 'PROVIDER_FAILED', 'UNSUPPORTED_INTERACTION', 'CANCELLED', 'STOP_UNCONFIRMED', 'STORAGE_READ_FAILED', 'STORAGE_WRITE_FAILED'] as const
export type DialogueErrorCode = typeof dialogueErrors[number]
export type DialogueStatus = 'idle' | 'qualifying' | 'qualified' | 'starting' | 'running' | 'ready' | 'stopping' | 'stopped' | 'error' | 'unknown'
export type DialogueState = { contractVersion: 1; sequence: number; status: DialogueStatus; context: ContextRef; invocation: '$bmad-agent-analyst'; profile: { fingerprint: string; skillPath: string } | null; acknowledged: boolean; errorCode: DialogueErrorCode | null; activities: string[] }
type Envelope = { contractVersion: 1; correlationId: string }
export type DialogueCommand = Envelope & ({ type: 'read' | 'stop' } | { type: 'qualify' | 'launch'; projectId: string } | { type: 'send'; projectId: string; conversationId: string; text: string })
export interface DialogueBridge { read(): Promise<DialogueState>; qualify(projectId: string): Promise<DialogueState>; launch(projectId: string): Promise<DialogueState>; send(projectId: string, conversationId: string, text: string): Promise<DialogueState>; stop(): Promise<DialogueState>; onChanged(listener: (state: DialogueState) => void): () => void }
export type DialogueReply = Envelope & { state: DialogueState }
export const initialDialogueState = (): DialogueState => ({ contractVersion: 1, sequence: 0, status: 'idle', context: emptyContext(), invocation: '$bmad-agent-analyst', profile: null, acknowledged: false, errorCode: null, activities: [] })
const identifier = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value)
const exact = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
export function isDialogueCommand(value: unknown): value is DialogueCommand {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false
  const keys = ['contractVersion', 'correlationId', 'type']
  if (value.type === 'read' || value.type === 'stop') return exact(value, keys)
  if (value.type === 'qualify' || value.type === 'launch') return exact(value, [...keys, 'projectId']) && identifier(value.projectId)
  return value.type === 'send' && exact(value, [...keys, 'projectId', 'conversationId', 'text']) && identifier(value.projectId) && identifier(value.conversationId) && typeof value.text === 'string' && !!value.text.trim() && value.text.length <= MAX_DRAFT_LENGTH
}
export function isDialogueState(value: unknown): value is DialogueState {
  if (!isRecord(value) || !exact(value, ['contractVersion', 'sequence', 'status', 'context', 'invocation', 'profile', 'acknowledged', 'errorCode', 'activities']) || value.contractVersion !== 1 || !Number.isSafeInteger(value.sequence) || Number(value.sequence) < 0 || !['idle', 'qualifying', 'qualified', 'starting', 'running', 'ready', 'stopping', 'stopped', 'error', 'unknown'].includes(String(value.status))) return false
  return isRecord(value.context) && exact(value.context, ['projectId', 'initiativeId', 'conversationId', 'providerId', 'connectionId']) && Object.values(value.context).every(v => v === null || identifier(v)) && value.invocation === '$bmad-agent-analyst' && typeof value.acknowledged === 'boolean' && (value.errorCode === null || dialogueErrors.includes(value.errorCode as DialogueErrorCode)) && (value.profile === null || isRecord(value.profile) && exact(value.profile, ['fingerprint', 'skillPath']) && typeof value.profile.fingerprint === 'string' && /^[a-f0-9]{64}$/.test(value.profile.fingerprint) && typeof value.profile.skillPath === 'string' && value.profile.skillPath.length <= 32767) && Array.isArray(value.activities) && value.activities.length <= 80 && value.activities.every(v => typeof v === 'string' && v.length <= 500)
}
export function isDialogueReply(value: unknown): value is DialogueReply { return isRecord(value) && exact(value, ['contractVersion', 'correlationId', 'state']) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && isDialogueState(value.state) }
export const dialogueFailure = (code: DialogueErrorCode): Error & { code: DialogueErrorCode } => Object.assign(new Error(code), { code })
export function dialogueError(error: unknown, fallback: DialogueErrorCode): DialogueErrorCode { const code = isRecord(error) || error instanceof Error ? (error as { code?: unknown }).code : undefined; return dialogueErrors.includes(code as DialogueErrorCode) ? code as DialogueErrorCode : fallback }
