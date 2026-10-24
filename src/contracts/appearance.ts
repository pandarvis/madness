import { isCorrelationId, isRecord } from './index.ts'

/** Préférence d’interface indépendante du Snapshot métier v1. */
export const APPEARANCE_CHANNEL = 'madness:appearance:v1'
export type Theme = 'dark' | 'light'
export type AppearanceWarning = 'read-failed' | 'save-failed' | null
export type AppearanceState = { theme: Theme; warning: AppearanceWarning }
export type AppearanceCommand = { contractVersion: 1; correlationId: string } & ({ theme: Theme } | { type: 'read' })
export type AppearanceReply = { contractVersion: 1; correlationId: string; state: AppearanceState } & ({ ok: true } | { ok: false; error: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND' | 'APP_CLOSING' })
export interface AppearanceBridge {
  readonly initial: AppearanceState
  read(): Promise<AppearanceState>
  setTheme(theme: Theme): Promise<AppearanceState>
}
const exact = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
export const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light'
export function isAppearanceState(value: unknown): value is AppearanceState {
  return isRecord(value) && exact(value, ['theme', 'warning']) && isTheme(value.theme) && (value.warning === null || value.warning === 'read-failed' || value.warning === 'save-failed')
}
export function isAppearanceCommand(value: unknown): value is AppearanceCommand {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false
  return exact(value, ['contractVersion', 'correlationId', 'type']) && value.type === 'read' || exact(value, ['contractVersion', 'correlationId', 'theme']) && isTheme(value.theme)
}
export function isAppearanceReply(value: unknown): value is AppearanceReply {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId) || !isAppearanceState(value.state)) return false
  return value.ok === true ? exact(value, ['contractVersion', 'correlationId', 'ok', 'state']) : value.ok === false && exact(value, ['contractVersion', 'correlationId', 'ok', 'state', 'error']) && ['UNTRUSTED_CALLER', 'INVALID_COMMAND', 'APP_CLOSING'].includes(String(value.error))
}
export function appearanceFromArguments(args: string[]): AppearanceState {
  const themes = args.filter(arg => arg.startsWith('--madness-theme=')), warnings = args.filter(arg => arg.startsWith('--madness-appearance-warning='))
  const theme = themes[0]?.slice('--madness-theme='.length), warning = warnings[0]?.slice('--madness-appearance-warning='.length)
  if (themes.length !== 1 || !isTheme(theme) || warnings.length > 1 || (warning !== undefined && warning !== 'none' && warning !== 'read-failed')) return { theme: 'dark', warning: 'read-failed' }
  return { theme, warning: warning === 'read-failed' ? warning : null }
}
