import { isCorrelationId, isRecord } from './index.ts'

/** Préférence d’interface indépendante du Snapshot métier v1. */
export const LANGUAGE_CHANNEL = 'madness:language:v1'
export type Language = 'fr' | 'en'
export type LanguageWarning = 'read-failed' | 'save-failed' | null
export type LanguageState = { language: Language; warning: LanguageWarning }
export type LanguageCommand = { contractVersion: 1; correlationId: string } & ({ language: Language } | { type: 'read' })
export type LanguageReply = { contractVersion: 1; correlationId: string; state: LanguageState } & ({ ok: true } | { ok: false; error: 'UNTRUSTED_CALLER' | 'INVALID_COMMAND' | 'APP_CLOSING' })
export interface LanguageBridge {
  readonly initial: LanguageState
  read(): Promise<LanguageState>
  setLanguage(language: Language): Promise<LanguageState>
}
const exact = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
export const isLanguage = (value: unknown): value is Language => value === 'fr' || value === 'en'
export function isLanguageState(value: unknown): value is LanguageState {
  return isRecord(value) && exact(value, ['language', 'warning']) && isLanguage(value.language) && (value.warning === null || value.warning === 'read-failed' || value.warning === 'save-failed')
}
export function isLanguageCommand(value: unknown): value is LanguageCommand {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false
  return exact(value, ['contractVersion', 'correlationId', 'type']) && value.type === 'read' || exact(value, ['contractVersion', 'correlationId', 'language']) && isLanguage(value.language)
}
export function isLanguageReply(value: unknown): value is LanguageReply {
  if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId) || !isLanguageState(value.state)) return false
  return value.ok === true ? exact(value, ['contractVersion', 'correlationId', 'ok', 'state']) : value.ok === false && exact(value, ['contractVersion', 'correlationId', 'ok', 'state', 'error']) && ['UNTRUSTED_CALLER', 'INVALID_COMMAND', 'APP_CLOSING'].includes(String(value.error))
}
export function languageFromArguments(args: string[]): LanguageState {
  const languages = args.filter(arg => arg.startsWith('--madness-language=')), warnings = args.filter(arg => arg.startsWith('--madness-language-warning='))
  const language = languages[0]?.slice('--madness-language='.length), warning = warnings[0]?.slice('--madness-language-warning='.length)
  if (languages.length !== 1 || !isLanguage(language) || warnings.length > 1 || (warning !== undefined && warning !== 'none' && warning !== 'read-failed')) return { language: 'fr', warning: 'read-failed' }
  return { language, warning: warning === 'read-failed' ? warning : null }
}
