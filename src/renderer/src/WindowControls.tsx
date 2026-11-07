import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocale } from './Locale.tsx'

type WindowBridge = { command(action: 'minimize' | 'toggle-maximize' | 'close' | 'state'): Promise<boolean>; onState(listener: (maximized: boolean) => void): () => void }

const glyphs = {
  minimize: <path d="M5 12h14" />,
  maximize: <rect width="14" height="14" x="5" y="5" rx="1" />,
  restore: <><rect width="11" height="11" x="5" y="8" rx="1" /><path d="M8 8V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
} as const

/** Madness draws its own caption buttons so their plates and hover match the other title bar commands. */
export function WindowControls(): ReactNode {
  const bridge = (window as unknown as { madnessWindow?: WindowBridge }).madnessWindow
  const { language } = useLocale()
  const fr = language === 'fr'
  const [maximized, setMaximized] = useState(false)
  useEffect(() => {
    if (!bridge) return
    void bridge.command('state').then(setMaximized).catch(() => undefined)
    return bridge.onState(setMaximized)
  }, [bridge])
  if (!bridge) return null
  const button = (action: 'minimize' | 'toggle-maximize' | 'close', glyph: keyof typeof glyphs, label: string): ReactNode =>
    <button className={'toolbar-toggle command-control window-control window-' + action} type="button" aria-label={label} onClick={event => { event.currentTarget.blur(); void bridge.command(action) }}>
      <svg className="topbar-icon" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{glyphs[glyph]}</svg>
      <span className="command-tooltip" aria-hidden="true">{label}</span>
    </button>
  return <div className="window-controls">
    {button('minimize', 'minimize', fr ? 'Réduire' : 'Minimize')}
    {button('toggle-maximize', maximized ? 'restore' : 'maximize', maximized ? (fr ? 'Restaurer' : 'Restore') : (fr ? 'Agrandir' : 'Maximize'))}
    {button('close', 'close', fr ? 'Fermer' : 'Close')}
  </div>
}
