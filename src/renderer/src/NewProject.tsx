import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocale } from './Locale.tsx'

type Bridge = { place(): Promise<{ parent: string }>; pickPlace(): Promise<{ parent: string }>; create(name: string): Promise<{ root: string }> }
const bridge = (): Bridge | undefined => (window as unknown as { madnessNewProject?: Bridge }).madnessNewProject

/** One gesture for a new project: Madness creates the folder and git, then opens it to install BMad. */
export function NewProject({ onCreated, disabled }: { onCreated: () => void; disabled: boolean }): ReactNode {
  const { language } = useLocale(), fr = language === 'fr'
  const [open, setOpen] = useState(false), [name, setName] = useState(''), [parent, setParent] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null)
  useEffect(() => { if (open) void bridge()?.place().then(value => setParent(value.parent)).catch(() => undefined) }, [open])
  if (!bridge()) return null
  const create = (): void => {
    setBusy(true); setError(null)
    void bridge()!.create(name.trim()).then(() => { setOpen(false); setName(''); onCreated() })
      .catch((reason: unknown) => setError(String(reason).includes('PROJECT_EXISTS') ? (fr ? 'Un dossier de ce nom existe déjà et n’est pas vide : choisis un autre nom.' : 'A non-empty folder with this name exists: pick another name.') : (fr ? 'Le projet n’a pas pu être créé.' : 'The project could not be created.')))
      .finally(() => setBusy(false))
  }
  if (!open) return <button type="button" className="primary new-project-trigger" disabled={disabled} onClick={() => setOpen(true)}>{fr ? 'Nouveau projet' : 'New project'}</button>
  return <form className="new-project" onSubmit={event => { event.preventDefault(); if (name.trim()) create() }}>
    <label>{fr ? 'Nom du projet' : 'Project name'} <input type="text" autoFocus maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder={fr ? 'Ma liste de tâches' : 'My task list'} /></label>
    <p className="new-project-place">{fr ? 'Créé dans ' : 'Created in '}<code>{parent}</code> <button type="button" className="text-button" onClick={() => void bridge()!.pickPlace().then(value => setParent(value.parent))}>{fr ? 'Changer…' : 'Change…'}</button></p>
    {error && <p role="alert" className="connection-error">{error}</p>}
    <div className="new-project-actions"><button type="submit" className="primary" disabled={busy || !name.trim()}>{fr ? 'Créer le projet' : 'Create project'}</button><button type="button" className="text-button" onClick={() => setOpen(false)}>{fr ? 'Annuler' : 'Cancel'}</button></div>
  </form>
}
