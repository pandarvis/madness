import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ActiveKit, FoundKit } from '../../contracts/kits.ts'

type ValidKit = Extract<FoundKit, { ok: true }>
type Bridge = { library(): Promise<{ source: string; kits: FoundKit[] }[]>; project(id: string): Promise<ActiveKit[]>; activate(id: string, folder: string): Promise<ActiveKit[]>; deactivate(id: string, kit: string): Promise<ActiveKit[]> }
const bridge = (): Bridge | undefined => (window as unknown as { madnessKits?: Bridge }).madnessKits
const reason = (error: unknown): string => String(error).replace(/^Error: (Error invoking remote method '[^']+': )?(Error: )?/, '')

/** The kits this project uses: one box per kit, its version, and an update when the library has a newer one. */
export function ProjectKits({ projectId }: { projectId: string }): ReactNode {
  const [kits, setKits] = useState<ValidKit[]>([]), [active, setActive] = useState<ActiveKit[]>([]), [error, setError] = useState<string | null>(null), [busy, setBusy] = useState(false)
  useEffect(() => {
    const b = bridge(); if (!b) return
    void b.library().then(library => setKits(library.flatMap(group => group.kits).filter((kit): kit is ValidKit => kit.ok))).catch(() => undefined)
    void b.project(projectId).then(setActive).catch(() => undefined)
  }, [projectId])
  if (!bridge() || (!kits.length && !active.length)) return null
  const toggle = (found: ValidKit, on: boolean): void => {
    setBusy(true); setError(null)
    void (on ? bridge()!.activate(projectId, found.folder) : bridge()!.deactivate(projectId, found.kit.id)).then(setActive).catch(failure => setError(reason(failure))).finally(() => setBusy(false))
  }
  const orphans = active.filter(entry => !kits.some(found => found.kit.id === entry.id))
  return <section className="project-kits" aria-labelledby="project-kits-title">
    <h2 id="project-kits-title" className="journey-label">Kits du projet</h2>
    <ul>
      {kits.map(found => { const current = active.find(entry => entry.id === found.kit.id); return <li key={found.folder}>
        <label><input type="checkbox" disabled={busy} checked={!!current} onChange={event => toggle(found, event.target.checked)} /> <strong>{found.kit.name}</strong> <span className="muted">{current ? current.version : found.kit.version}</span></label>
        {current && current.version !== found.kit.version && <span className="small"> · version {found.kit.version} disponible <button type="button" className="text-button" disabled={busy} onClick={() => toggle(found, true)}>Mettre à jour</button></span>}
      </li> })}
      {orphans.map(entry => <li key={entry.id}><strong>{entry.name}</strong> <span className="muted">{entry.version} · source introuvable, le kit reste actif tel qu’il a été copié</span></li>)}
    </ul>
    {error && <p role="alert" className="connection-error">{error}</p>}
  </section>
}
