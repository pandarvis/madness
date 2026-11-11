import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocale } from './Locale.tsx'

type Option = { id: string; label: string }
export type ModelsState = { choice: { claude: string; codex: string | null }; claude: Option[]; preferredCodex: string; codex?: Option[]; ownCodexLogin?: boolean }
type Bridge = { read(): Promise<ModelsState>; list(): Promise<ModelsState>; set(provider: 'claude-code' | 'codex', model: string | null): Promise<ModelsState> }
const bridge = (): Bridge | undefined => (window as unknown as { madnessModels?: Bridge }).madnessModels

/** Shared by the settings and the provider island: the models BMad agents use, per provider. */
export function useModels(): [ModelsState | null, (provider: 'claude-code' | 'codex', model: string | null) => void, () => void] {
  const [state, setState] = useState<ModelsState | null>(null)
  useEffect(() => { void bridge()?.read().then(setState).catch(() => undefined) }, [])
  const set = (provider: 'claude-code' | 'codex', model: string | null): void => { void bridge()?.set(provider, model).then(next => setState(current => ({ ...next, codex: current?.codex }))).catch(() => undefined) }
  const load = (): void => { void bridge()?.list().then(setState).catch(() => undefined) }
  return [state, set, load]
}
export const modelLabel = (state: ModelsState | null, provider: 'claude-code' | 'codex'): string | null => {
  if (!state) return null
  if (provider === 'claude-code') return state.claude.find(option => option.id === state.choice.claude)?.label ?? state.choice.claude
  const id = state.choice.codex ?? state.preferredCodex
  return state.codex?.find(option => option.id === id)?.label ?? id
}

export function ModelPicker({ state, set, load }: { state: ModelsState | null; set: (provider: 'claude-code' | 'codex', model: string | null) => void; load: () => void }): ReactNode {
  const { language } = useLocale(), fr = language === 'fr'
  useEffect(load, [])
  if (!state) return null
  const codexOptions = state.codex ?? []
  return <div className="settings-section model-picker"><h3>{fr ? 'Modèles des agents BMad' : 'BMad agent models'}</h3>
    <label>Claude Code <select value={state.choice.claude} onChange={event => set('claude-code', event.target.value)}>{state.claude.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
    <label>Codex <select value={state.choice.codex ?? ''} onChange={event => set('codex', event.target.value || null)}>
      <option value="">{(fr ? 'Recommandé · ' : 'Recommended · ') + (codexOptions.find(option => option.id === state.preferredCodex)?.label ?? state.preferredCodex)}</option>
      {codexOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select></label>
    {!codexOptions.length && <p className="small">{fr ? 'La liste Codex vient de ta connexion Codex habituelle : connecte-toi dans l’appli Codex pour la voir.' : 'The Codex list comes from your own Codex sign-in.'}</p>}
  </div>
}
