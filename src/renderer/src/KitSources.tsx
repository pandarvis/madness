import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { FoundKit } from '../../contracts/kits.ts'

type Library = { source: string; kits: FoundKit[] }[]
type Bridge = { library(): Promise<Library>; addSource(): Promise<Library>; removeSource(folder: string): Promise<Library>; draft(name: string): Promise<{ folder: string; text: string } | null>; saveDraft(folder: string, text: string): Promise<{ ok: boolean; errors?: string[] }> }
const bridge = (): Bridge | undefined => (window as unknown as { madnessKits?: Bridge }).madnessKits
const imposed = (found: Extract<FoundKit, { ok: true }>): number => found.kit.pieces.filter(piece => piece.level === 'impose').length + found.kit.rules.filter(rule => rule.level === 'impose').length

/** Settings › Kits: where the team's references come from, what each kit holds, and a helper to write one. */
export function KitSources(): ReactNode {
  const [library, setLibrary] = useState<Library>([]), [draft, setDraft] = useState<{ folder: string; text: string } | null>(null), [errors, setErrors] = useState<string[]>([])
  useEffect(() => { void bridge()?.library().then(setLibrary).catch(() => undefined) }, [])
  if (!bridge()) return null
  const save = (): void => { if (!draft) return; void bridge()!.saveDraft(draft.folder, draft.text).then(result => { if (result.ok) { setDraft(null); setErrors([]); void bridge()!.library().then(setLibrary) } else setErrors(result.errors ?? []) }) }
  return <section className="kit-sources" aria-labelledby="kit-sources-title">
    <h3 id="kit-sources-title">Kits</h3>
    <p className="small muted">Les références de ton équipe (charte, conventions, vocabulaire, règles) que les agents BMad reçoivent sur les projets où tu les actives.</p>
    {library.map(group => <div key={group.source} className="kit-source">
      <p className="kit-source-path"><code>{group.source}</code> <button type="button" className="text-button" onClick={() => void bridge()!.removeSource(group.source).then(setLibrary)}>Retirer</button></p>
      {group.kits.length === 0 ? <p className="small muted">Aucun manifeste <code>madness-kit.toml</code> trouvé ici.</p> : <ul>{group.kits.map(found => <li key={found.folder}>{found.ok
        ? <><strong>{found.kit.name}</strong> <span className="muted">{found.kit.version} · {found.kit.pieces.length} pièce(s), {found.kit.rules.length} règle(s), {imposed(found)} élément(s) imposé(s)</span>{found.notices.map(notice => <span key={notice} className="small muted kit-notice">{notice}</span>)}</>
        : <span className="connection-error">{found.folder.split(/[\\/]/).at(-1)} : {found.errors.join(' · ')}</span>}</li>)}</ul>}
    </div>)}
    <div className="kit-actions">
      <button type="button" className="secondary" onClick={() => void bridge()!.addSource().then(setLibrary)}>Ajouter une source…</button>
      <button type="button" className="secondary" onClick={() => void bridge()!.draft('').then(value => { if (value) { setDraft(value); setErrors([]) } })}>Créer un kit depuis un dossier…</button>
    </div>
    {draft && <div className="kit-draft">
      <p className="small">Proposition pour <code>{draft.folder}</code> : ajuste les niveaux (<code>impose</code> ou <code>consulte</code>) et les rôles, puis enregistre. Le fichier <code>madness-kit.toml</code> est écrit dans ce dossier, prêt à commiter.</p>
      <textarea rows={16} value={draft.text} spellCheck={false} onChange={event => setDraft({ ...draft, text: event.target.value })} />
      {errors.length > 0 && <p role="alert" className="connection-error">{errors.join(' · ')}</p>}
      <div className="kit-actions"><button type="button" className="primary" onClick={save}>Enregistrer le kit</button><button type="button" className="text-button" onClick={() => setDraft(null)}>Annuler</button></div>
    </div>}
  </section>
}
