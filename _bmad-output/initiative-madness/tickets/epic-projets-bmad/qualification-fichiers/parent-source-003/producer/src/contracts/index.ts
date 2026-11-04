/** Contrat v1 possédé par le cœur. Aucun objet natif Electron ou fournisseur. */
export const CONTRACT_VERSION = 1 as const
export const MAX_DRAFT_LENGTH = 100_000
export const COMMAND_CHANNEL = 'madness:command:v1'
export const EVENT_CHANNEL = 'madness:event:v1'
export type ContextRef = { projectId: string | null; initiativeId: string | null; conversationId: string | null; providerId: string | null; connectionId: string | null }
export type ProjectContext = { id: string; name: string; rootPath: string; openedAt: string }
export type Conversation = { id: string; context: ContextRef; lastKnownActivity: 'idle' | 'running' | 'waiting' | 'interrupted' | 'unknown'; messages: { id: string; role: 'user' | 'assistant'; text: string }[] }
export type Draft = { projectId: string; text: string; savedAt: string }
export type Snapshot = { schemaVersion: 1; revision: number; projects: ProjectContext[]; activeProjectId: string | null; drafts: Draft[]; preferences: { navigationCollapsed: boolean }; conversations: Conversation[] }
export type ErrorCode = 'INVALID_COMMAND' | 'UNTRUSTED_CALLER' | 'PROJECT_NOT_FOUND' | 'DIRECTORY_UNAVAILABLE' | 'STORAGE_READ_FAILED' | 'STORAGE_WRITE_FAILED' | 'STORAGE_CORRUPT' | 'STORAGE_VERSION_UNSUPPORTED' | 'STORAGE_CONFLICT' | 'APP_CLOSING'
export type AppError = { code: ErrorCode; messageKey: ErrorCode; correlationId: string; context: ContextRef; outcome: 'failed' | 'unknown'; recovery: 'retry' | 'choose-directory' | 'preserve-storage' }
export type Capability = { available: false; reasonKey: 'codex.unqualified' }
export type AppState = Snapshot & { capabilities: { codex: Capability }; lifecycle: 'idle' | 'closing' }
type Envelope = { contractVersion: 1; correlationId: string }
export type Command = Envelope & (
  | { type: 'read-state' }
  | { type: 'choose-directory' }
  | { type: 'select-project'; projectId: string }
  | { type: 'save-draft'; projectId: string; text: string }
  | { type: 'set-navigation'; collapsed: boolean }
)
export type Effect = 'read' | 'cancelled' | 'saved'
export type Reply = Envelope & ({ ok: true; value: { state: AppState; effect: Effect } } | { ok: false; error: AppError })
export type DomainEvent = Envelope & { type: 'state-changed'; sequence: number; context: ContextRef; revision: number }
export interface MadnessBridge {
  readState(): Promise<Reply>
  chooseDirectory(): Promise<Reply>
  selectProject(projectId: string): Promise<Reply>
  saveDraft(projectId: string, text: string): Promise<Reply>
  setNavigation(collapsed: boolean): Promise<Reply>
  onStateChanged(listener: (event: DomainEvent) => void): () => void
}
export const emptyContext = (): ContextRef => ({ projectId: null, initiativeId: null, conversationId: null, providerId: null, connectionId: null })
export const emptySnapshot = (): Snapshot => ({ schemaVersion: 1, revision: 0, projects: [], activeProjectId: null, drafts: [], preferences: { navigationCollapsed: false }, conversations: [] })
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const exact = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
const id = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value)
const nullableId = (value: unknown): boolean => value === null || id(value)
const timestamp = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value))
export const isCorrelationId = (value: unknown): value is string => id(value) && value.length >= 8
export function isCommand(value: unknown): value is Command {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false
  const base = ['contractVersion', 'correlationId', 'type']
  switch (value.type) {
    case 'read-state': case 'choose-directory': return exact(value, base)
    case 'select-project': return exact(value, [...base, 'projectId']) && id(value.projectId)
    case 'save-draft': return exact(value, [...base, 'projectId', 'text']) && id(value.projectId) && typeof value.text === 'string' && value.text.length <= MAX_DRAFT_LENGTH
    case 'set-navigation': return exact(value, [...base, 'collapsed']) && typeof value.collapsed === 'boolean'
    default: return false
  }
}
function isContext(value: unknown): value is ContextRef {
  return isRecord(value) && exact(value, ['projectId', 'initiativeId', 'conversationId', 'providerId', 'connectionId']) && Object.values(value).every(nullableId)
}
export function isSnapshot(value: unknown): value is Snapshot {
  if (!isRecord(value) || !exact(value, ['schemaVersion', 'revision', 'projects', 'activeProjectId', 'drafts', 'preferences', 'conversations']) || value.schemaVersion !== 1 || !Number.isSafeInteger(value.revision) || Number(value.revision) < 0) return false
  if (!Array.isArray(value.projects) || value.projects.length > 1000 || !Array.isArray(value.drafts) || !Array.isArray(value.conversations) || value.conversations.length > 1000) return false
  const projects = value.projects
  if (!projects.every((p) => isRecord(p) && exact(p, ['id', 'name', 'rootPath', 'openedAt']) && id(p.id) && typeof p.name === 'string' && p.name.length > 0 && p.name.length <= 255 && typeof p.rootPath === 'string' && p.rootPath.length > 0 && p.rootPath.length <= 32767 && !p.rootPath.includes('\0') && timestamp(p.openedAt))) return false
  const ids = new Set(projects.map((p) => p.id))
  if (ids.size !== projects.length || (value.activeProjectId !== null && !ids.has(value.activeProjectId))) return false
  if (!isRecord(value.preferences) || !exact(value.preferences, ['navigationCollapsed']) || typeof value.preferences.navigationCollapsed !== 'boolean') return false
  if (value.drafts.length > projects.length || !value.drafts.every((d) => isRecord(d) && exact(d, ['projectId', 'text', 'savedAt']) && ids.has(d.projectId) && typeof d.text === 'string' && d.text.length <= MAX_DRAFT_LENGTH && timestamp(d.savedAt))) return false
  if (new Set(value.drafts.map((d) => d.projectId)).size !== value.drafts.length) return false
  return value.conversations.every((c) => isRecord(c) && exact(c, ['id', 'context', 'lastKnownActivity', 'messages']) && id(c.id) && isContext(c.context) && c.context.projectId !== null && ids.has(c.context.projectId) && c.context.conversationId === c.id && c.context.providerId !== null && c.context.connectionId !== null && ['idle', 'running', 'waiting', 'interrupted', 'unknown'].includes(String(c.lastKnownActivity)) && Array.isArray(c.messages) && c.messages.length <= 10000 && c.messages.every((m) => isRecord(m) && exact(m, ['id', 'role', 'text']) && id(m.id) && ['user', 'assistant'].includes(String(m.role)) && typeof m.text === 'string' && m.text.length <= MAX_DRAFT_LENGTH))
}
export function isDomainEvent(value: unknown): value is DomainEvent {
  return isRecord(value) && exact(value, ['contractVersion', 'correlationId', 'type', 'sequence', 'context', 'revision']) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && value.type === 'state-changed' && Number.isSafeInteger(value.sequence) && Number(value.sequence) > 0 && Number.isSafeInteger(value.revision) && Number(value.revision) >= 0 && isContext(value.context)
}
export function isReply(value: unknown): value is Reply {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false
  if (value.ok === false) {
    const error = value.error
    return exact(value, ['contractVersion', 'correlationId', 'ok', 'error']) && isRecord(error) && exact(error, ['code', 'messageKey', 'correlationId', 'context', 'outcome', 'recovery']) && ['INVALID_COMMAND', 'UNTRUSTED_CALLER', 'PROJECT_NOT_FOUND', 'DIRECTORY_UNAVAILABLE', 'STORAGE_READ_FAILED', 'STORAGE_WRITE_FAILED', 'STORAGE_CORRUPT', 'STORAGE_VERSION_UNSUPPORTED', 'STORAGE_CONFLICT', 'APP_CLOSING'].includes(String(error.code)) && error.messageKey === error.code && error.correlationId === value.correlationId && isContext(error.context) && ['failed', 'unknown'].includes(String(error.outcome)) && ['retry', 'choose-directory', 'preserve-storage'].includes(String(error.recovery))
  }
  if (value.ok !== true || !exact(value, ['contractVersion', 'correlationId', 'ok', 'value']) || !isRecord(value.value) || !exact(value.value, ['state', 'effect']) || !['read', 'cancelled', 'saved'].includes(String(value.value.effect))) return false
  const state = value.value.state
  if (!isRecord(state) || !exact(state, ['schemaVersion', 'revision', 'projects', 'activeProjectId', 'drafts', 'preferences', 'conversations', 'capabilities', 'lifecycle'])) return false
  const { capabilities, lifecycle, ...snapshot } = state
  return isSnapshot(snapshot) && ['idle', 'closing'].includes(String(lifecycle)) && isRecord(capabilities) && exact(capabilities, ['codex']) && isRecord(capabilities.codex) && exact(capabilities.codex, ['available', 'reasonKey']) && capabilities.codex.available === false && capabilities.codex.reasonKey === 'codex.unqualified'
}
export function failure(code: ErrorCode, correlationId: string, projectId: string | null = null): Reply {
  return { contractVersion: 1, correlationId, ok: false, error: { code, messageKey: code, correlationId, context: { ...emptyContext(), projectId }, outcome: 'failed', recovery: code === 'DIRECTORY_UNAVAILABLE' ? 'choose-directory' : ['STORAGE_CORRUPT', 'STORAGE_VERSION_UNSUPPORTED', 'STORAGE_CONFLICT'].includes(code) ? 'preserve-storage' : 'retry' } }
}
