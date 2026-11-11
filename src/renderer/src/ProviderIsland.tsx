import type { ReactNode } from 'react'
import chatgptMark from './assets/chatgpt-mark.svg'
import claudeMark from './assets/claude.svg?no-inline'
import copilotMark from './assets/githubcopilot.svg?no-inline'
import { useLocale } from './Locale.tsx'

export type ProviderId = 'codex' | 'claude-code' | 'github-copilot'
export type CodexReadiness = 'own' | 'verified' | 'stored' | 'none'

const STORAGE_KEY = 'madness.next-provider'

/** The next-exchange provider is a per-device convenience; existing conversations keep their own provider. */
export function readNextProvider(): ProviderId {
  try { const value = localStorage.getItem(STORAGE_KEY); return value === 'claude-code' ? 'claude-code' : 'codex' } catch { return 'codex' }
}
export function saveNextProvider(id: ProviderId): void {
  try { localStorage.setItem(STORAGE_KEY, id) } catch { /* session-only choice */ }
}

function Mark({ id }: { id: ProviderId }): ReactNode {
  return <img className={'provider-mark provider-' + id} src={id === 'codex' ? chatgptMark : id === 'claude-code' ? claudeMark : copilotMark} alt="" />
}

export function ProviderIsland({ active, codex, onChoose, models }: { active: ProviderId; codex: CodexReadiness; onChoose: (id: ProviderId) => void; models?: Partial<Record<ProviderId, string | null>> }): ReactNode {
  const { language } = useLocale()
  const fr = language === 'fr'
  const names: Record<ProviderId, string> = { codex: 'Codex', 'claude-code': 'Claude Code', 'github-copilot': 'GitHub Copilot' }
  const state = (id: ProviderId): { text: string; tone: 'ok' | 'warn' | 'off' } => {
    if (id === 'codex') return codex === 'own' ? { text: fr ? 'ta connexion habituelle' : 'your usual login', tone: 'ok' } : codex === 'verified' ? { text: fr ? 'connecté' : 'connected', tone: 'ok' } : codex === 'stored' ? { text: fr ? 'à vérifier' : 'to verify', tone: 'warn' } : { text: fr ? 'non configuré' : 'not set up', tone: 'off' }
    if (id === 'claude-code') return { text: fr ? 'ta connexion Claude Code' : 'your Claude Code login', tone: 'ok' }
    return { text: fr ? 'bientôt' : 'coming soon', tone: 'off' }
  }
  const current = state(active)
  const summary = (fr ? 'Fournisseur du prochain échange : ' : 'Next exchange provider: ') + names[active] + ', ' + current.text
  return <div className="provider-island" data-active={active}>
    <span className="provider-current" role="status" aria-label={summary} title={summary}>
      <Mark id={active} /><span className="provider-name">{names[active]}</span>{current.tone === 'warn' && <span className="provider-dot provider-warn" aria-hidden="true" />}
    </span>
    <div className="provider-options" role="group" aria-label={fr ? 'Choisir le fournisseur du prochain échange' : 'Choose the next exchange provider'}>
      {(['claude-code', 'codex', 'github-copilot'] as const).map(id => {
        const s = state(id), soon = id === 'github-copilot'
        return <button key={id} type="button" title={id === 'claude-code' ? (fr ? 'Utilise la CLI Claude Code 2.1.322 et la connexion faite avec « claude auth login »' : 'Uses the Claude Code CLI 2.1.322 and its « claude auth login »') : id === 'codex' && codex === 'own' ? (fr ? 'Utilise la connexion de ton application Codex' : 'Uses your Codex app login') : undefined} className={'provider-option' + (id === active ? ' is-active' : '')} aria-pressed={id === active} disabled={soon} onClick={() => onChoose(id)}>
          <Mark id={id} /><span className="provider-option-text"><span className="provider-name">{names[id]}</span><span className="provider-state">{models?.[id] ? models[id] + ' · ' + s.text : s.text}</span></span>{s.tone === 'warn' && <span className="provider-dot provider-warn" aria-hidden="true" />}
        </button>
      })}
    </div>
  </div>
}
