import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AutopilotRun } from '../../contracts/autopilot.ts'
import { useLocale } from './Locale.tsx'
import { autopilotBuilding, currentStep } from './AutopilotPanel.tsx'
import './journey.css'

type Step = { id: 'brief' | 'requirements' | 'ux' | 'architecture' | 'epics' | 'stories'; done: boolean; document: string | null; detail: string | null }
type Next = { title: string; hint: string; label: string; act: () => void } | null
const journeyBridge = (): { read(projectId: string): Promise<Step[]>; open(projectId: string, path: string): Promise<unknown> } => ({
  read: projectId => (window as unknown as { madnessJourney: { read(id: string): Promise<Step[]> } }).madnessJourney.read(projectId),
  open: (projectId, path) => (window as unknown as { madnessJourney: { open(id: string, path: string): Promise<unknown> } }).madnessJourney.open(projectId, path),
})

/** Parcours: where the project stands in BMad, and the one thing to do next. */
export function ProjectJourney({ projectId, run, busy, onIdeation, onPrepare }: { projectId: string; run: AutopilotRun | undefined; busy: boolean; onIdeation: () => void; onPrepare: () => void }): ReactNode {
  const { language } = useLocale(), fr = language === 'fr'
  const [steps, setSteps] = useState<Step[] | null>(null)
  const active = currentStep(run)
  useEffect(() => { let alive = true; void journeyBridge().read(projectId).then(value => { if (alive) setSteps(value) }).catch(() => undefined); return () => { alive = false } }, [projectId, run?.status, active?.id, run?.steps.filter(step => step.status === 'done').length])
  const labels: Record<Step['id'], string> = fr ? { brief: 'Brief', requirements: 'Exigences', ux: 'UX', architecture: 'Architecture', epics: 'Epics', stories: 'Stories' } : { brief: 'Brief', requirements: 'Requirements', ux: 'UX', architecture: 'Architecture', epics: 'Epics', stories: 'Stories' }
  const runningId = active ? (active.kind === 'story' ? 'stories' : active.id) : null
  const bridge = window.madnessAutopilot
  const next: Next = !steps ? null
    : autopilotBuilding(run) ? { title: fr ? 'Laisser le pilote finir' : 'Let the autopilot finish', hint: fr ? 'Madness te préviendra quand ce sera prêt à essayer. Rien à faire d’ici là.' : 'Madness will tell you when it is ready to try.', label: fr ? 'Arrêter le chantier' : 'Stop', act: () => void bridge?.stop(projectId) }
    : run?.status === 'ready' ? { title: fr ? 'Valider le récap et lancer' : 'Approve the recap and go', hint: fr ? 'Le récapitulatif est prêt juste au-dessus.' : 'The recap is ready above.', label: 'Go', act: () => void bridge?.start(projectId) }
    : run?.status === 'paused' || run?.status === 'stopped' && run.steps.some(step => step.status === 'done') ? { title: fr ? 'Reprendre le chantier' : 'Resume the build', hint: run.detail ?? (fr ? 'Le chantier attend que tu le relances.' : 'The build is waiting.'), label: fr ? 'Reprendre' : 'Resume', act: () => void bridge?.resume(projectId) }
    : run?.status === 'done' ? { title: fr ? 'Essayer le projet' : 'Try the project', hint: fr ? 'Tout est construit et commité.' : 'Everything is built and committed.', label: fr ? 'Ouvrir le dossier' : 'Open folder', act: () => void bridge?.open(projectId) }
    : !steps[0].done ? { title: fr ? 'Commencer par l’idéation' : 'Start with ideation', hint: fr ? 'Décris ton idée à Mary : elle en tirera le brief du projet.' : 'Describe your idea to Mary.', label: fr ? 'Parler à Mary' : 'Talk to Mary', act: onIdeation }
    : { title: fr ? 'Résumer et lancer le projet' : 'Recap and launch', hint: fr ? 'Le brief est là : Madness résume le projet, puis construit les étapes suivantes tout seul après ton go.' : 'Madness recaps, then builds the next steps after your go.', label: fr ? 'Résumer et lancer' : 'Recap and launch', act: onPrepare }
  return <>
    <section className="journey" aria-labelledby="journey-title">
      <h2 id="journey-title" className="journey-label">{fr ? 'Où en est le projet' : 'Where the project stands'}</h2>
      <ol className="journey-steps">{(steps ?? []).map(step => {
        const state = step.id === runningId ? 'now' : step.done ? 'done' : 'todo'
        return <li key={step.id} className={'journey-step journey-' + state}>
          <h3>{labels[step.id]}</h3>
          <p>{state === 'now' ? (fr ? '● en cours' : '● running') : state === 'done' ? (fr ? '✓ fait' : '✓ done') : (fr ? 'à faire' : 'to do')}{step.detail ? ' · ' + step.detail : ''}</p>
          {step.document && <button type="button" className="journey-doc" title={step.document} onClick={() => void journeyBridge().open(projectId, step.document!)}>{step.document.split('/').pop()}</button>}
        </li>
      })}</ol>
    </section>
    {next && <section className="journey-next" aria-labelledby="journey-next-title">
      <div><h2 id="journey-next-title">{next.title}</h2><p>{next.hint}</p></div>
      <button type="button" className="primary" disabled={busy && !autopilotBuilding(run)} onClick={next.act}>{next.label}</button>
    </section>}
  </>
}
