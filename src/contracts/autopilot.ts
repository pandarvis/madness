import { isCorrelationId, isRecord } from './index.ts'

export const AUTOPILOT_COMMAND_CHANNEL = 'madness:autopilot:command:v1'
export const AUTOPILOT_EVENT_CHANNEL = 'madness:autopilot:event:v1'

export type AutopilotProvider = 'claude-code' | 'codex'
export type AutopilotStepStatus = 'pending' | 'running' | 'done' | 'skipped' | 'failed'
export type AutopilotStep = {
  id: string; kind: 'phase' | 'story'; title: string; epic: string | null; epicTitle: string | null; storyId: number | null
  skill: string; status: AutopilotStepStatus; startedAt: string | null; durationMs: number; tokens: number; attempts: number; summary: string | null
}
export type AutopilotStatus = 'preparing' | 'ready' | 'running' | 'paused' | 'stopped' | 'done'
export type AutopilotPauseReason = 'interrupted' | 'quota' | 'tests' | 'failure'
export type AutopilotRun = {
  schemaVersion: 1; projectId: string; provider: AutopilotProvider; status: AutopilotStatus; pauseReason: AutopilotPauseReason | null
  detail: string | null; recap: string | null; steps: AutopilotStep[]; startedAt: string | null; updatedAt: string; resumeAt: string | null
}
export type AutopilotState = { contractVersion: 1; sequence: number; runs: AutopilotRun[] }
export type AutopilotCommand = { contractVersion: 1; correlationId: string } & (
  { type: 'read' } | { type: 'prepare'; projectId: string; provider: AutopilotProvider } | { type: 'start' | 'resume' | 'stop' | 'dismiss'; projectId: string })
export interface AutopilotBridge {
  read(): Promise<AutopilotState>
  prepare(projectId: string, provider: AutopilotProvider): Promise<AutopilotState>
  start(projectId: string): Promise<AutopilotState>
  resume(projectId: string): Promise<AutopilotState>
  stop(projectId: string): Promise<AutopilotState>
  dismiss(projectId: string): Promise<AutopilotState>
  onChanged(listener: (state: AutopilotState) => void): () => void
}

export const initialAutopilotState = (): AutopilotState => ({ contractVersion: 1, sequence: 0, runs: [] })
const identifier = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value)
const exact = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
export function isAutopilotCommand(value: unknown): value is AutopilotCommand {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false
  const base = ['contractVersion', 'correlationId', 'type']
  if (value.type === 'read') return exact(value, base)
  if (value.type === 'prepare') return exact(value, [...base, 'projectId', 'provider']) && identifier(value.projectId) && (value.provider === 'claude-code' || value.provider === 'codex')
  return ['start', 'resume', 'stop', 'dismiss'].includes(String(value.type)) && exact(value, [...base, 'projectId']) && identifier(value.projectId)
}
export function isAutopilotState(value: unknown): value is AutopilotState {
  return isRecord(value) && value.contractVersion === 1 && Number.isSafeInteger(value.sequence) && Array.isArray(value.runs)
    && value.runs.every(run => isRecord(run) && identifier(run.projectId) && typeof run.status === 'string' && Array.isArray(run.steps))
}
