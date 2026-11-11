import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AutopilotRun } from '../../contracts/autopilot.ts'
import { useLocale } from './Locale.tsx'
import { autopilotBuilding, currentStep } from './AutopilotPanel.tsx'
import './journey.css'
import { ProjectUsage } from './ProjectUsage.tsx'

type Step = { id: 'brief' | 'requirements' | 'ux' | 'architecture' | 'epics' | 'stories'; done: boolean; document: string | null; detail: string | null }
const JOURNEY_OF: Record<string, Step['id']> = { 'bmad-product-brief': 'brief', 'bmad-prfaq': 'brief', 'bmad-brainstorming': 'brief', 'bmad-forge-idea': 'brief', 'bmad-agent-analyst': 'brief', 'bmad-prd': 'requirements', 'bmad-agent-pm': 'requirements', 'bmad-ux': 'ux', 'bmad-agent-ux-designer': 'ux', 'bmad-architecture': 'architecture', 'bmad-agent-architect': 'architecture', 'bmad-agent-po': 'epics' }
const journeyStepOf = (skill: string): Step['id'] | null => JOURNEY_OF[skill] ?? (/build|dev|review|e2e/.test(skill) ? 'stories' : null)
type Next = { title: string; hint: string; label: string; act: () => void } | null
type JourneyBridge = { read(projectId: string): Promise<Step[]>; open(projectId: string, path: string): Promise<unknown>; pickSpec(projectId: string): Promise<Step[]>; pasteSpec(projectId: string, text: string): Promise<Step[]> }
const journeyBridge = (): JourneyBridge => (window as unknown as { madnessJourney: JourneyBridge }).madnessJourney

/** Parcours: where the project stands in BMad, and the one thing to do next. */
export function ProjectJourney({ projectId, run, busy, onIdeation, onPrepare }: { projectId: string; run: AutopilotRun | undefined; busy: boolean; onIdeation: () => void; onPrepare: () => void }): ReactNode {
  const { language } = useLocale(), fr = language === 'fr'
  const [steps, setSteps] = useState<Step[] | null>(null)
  // Second way in: a spec the user already has, picked as a file or pasted.
  const [specOpen, setSpecOpen] = useState(false), [specText, setSpecText] = useState(''), [specBusy, setSpecBusy] = useState(false)
  const importSpec = (job: Promise<Step[]>): void => { setSpecBusy(true); void job.then(value => { setSteps(value); if (value[0]?.done) setSpecOpen(false) }).catch(() => undefined).finally(() => setSpecBusy(false)) }
  const active = currentStep(run)
  useEffect(() => { let alive = true; void journeyBridge().read(projectId).then(value => { if (alive) setSteps(value) }).catch(() => undefined); return () => { alive = false } }, [projectId, run?.status, active?.id, run?.steps.filter(step => step.status === 'done').length])
  const labels: Record<Step['id'], string> = fr ? { brief: 'Brief', requirements: 'Exigences', ux: 'UX', architecture: 'Architecture', epics: 'Epics', stories: 'Stories' } : { brief: 'Brief', requirements: 'Requirements', ux: 'UX', architecture: 'Architecture', epics: 'Epics', stories: 'Stories' }
  // A chosen action lights the Parcours step it works on.
  const runningId = active ? (active.kind === 'story' ? 'stories' : active.kind === 'phase' ? active.id : journeyStepOf(active.skill)) : null
  const advice = run?.recommendation
  const bridge = window.madnessAutopilot
  const next: Next = !steps ? null
    : autopilotBuilding(run) ? { title: fr ? 'Laisser le pilote finir' : 'Let the autopilot finish', hint: fr ? 'Madness te préviendra quand ce sera prêt à essayer. Rien à faire d’ici là.' : 'Madness will tell you when it is ready to try.', label: fr ? 'Arrêter le chantier' : 'Stop', act: () => void bridge?.stop(projectId) }
    : run?.status === 'ready' ? { title: fr ? 'Valider le récap et lancer' : 'Approve the recap and go', hint: fr ? 'Le récapitulatif est prêt juste au-dessus.' : 'The recap is ready above.', label: 'Go', act: () => void bridge?.start(projectId) }
    : run?.status === 'paused' && run.pauseReason === 'guidance' && advice ? { title: (advice.agent ? advice.agent + ' a besoin de toi' : 'Madness a besoin de toi'), hint: (advice.question ?? advice.why), label: fr ? 'Répondre dans la conversation' : 'Answer in the conversation', act: onIdeation }
    : run?.status === 'paused' || run?.status === 'stopped' && run.steps.some(step => step.status === 'done') ? { title: fr ? 'Reprendre le chantier' : 'Resume the build', hint: run.detail ?? (fr ? 'Le chantier attend que tu le relances.' : 'The build is waiting.'), label: fr ? 'Reprendre' : 'Resume', act: () => void bridge?.resume(projectId) }
    : run?.status === 'done' ? { title: fr ? 'Essayer le projet' : 'Try the project', hint: advice?.question ? (fr ? 'Tout est construit et commité. Ensuite : ' : 'Everything is built and committed. Next: ') + advice.question : fr ? 'Tout est construit et commité.' : 'Everything is built and committed.', label: fr ? 'Ouvrir le dossier' : 'Open folder', act: () => void bridge?.open(projectId) }
    : !steps[0].done ? { title: fr ? 'Par où commencer ?' : 'Where to start?', hint: fr ? 'Décris ton idée à Mary pour en tirer le brief, ou donne à Madness la spec que tu as déjà.' : 'Describe your idea to Mary, or give Madness the spec you already have.', label: fr ? 'Parler à Mary' : 'Talk to Mary', act: onIdeation }
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
      <div className="journey-next-actions">{steps && !steps[0].done && !run && <button type="button" className="secondary" aria-expanded={specOpen} onClick={() => setSpecOpen(value => !value)}>{fr ? 'J’ai déjà une spec' : 'I already have a spec'}</button>}<button type="button" className="primary" disabled={busy && !autopilotBuilding(run)} onClick={next.act}>{next.label}</button></div>
    </section>}
    {specOpen && steps && !steps[0].done && <section className="journey-spec" aria-label={fr ? 'Importer une spec' : 'Import a spec'}>
      <p>{fr ? 'Madness range la spec dans le projet, puis BMad la valide et en tire la suite. S’il y manque quelque chose, l’agent concerné te pose la question.' : 'Madness stores the spec in the project; BMad validates it and takes it from there.'}</p>
      <textarea rows={6} value={specText} placeholder={fr ? 'Colle ici ta spec, ton cahier des charges ou tes notes…' : 'Paste your spec here…'} onChange={event => setSpecText(event.target.value)} />
      <div className="journey-next-actions"><button type="button" className="secondary" disabled={specBusy} onClick={() => importSpec(journeyBridge().pickSpec(projectId))}>{fr ? 'Choisir un fichier…' : 'Choose a file…'}</button><button type="button" className="primary" disabled={specBusy || !specText.trim()} onClick={() => importSpec(journeyBridge().pasteSpec(projectId, specText))}>{fr ? 'Utiliser ce texte' : 'Use this text'}</button></div>
    </section>}
    <ProjectUsage projectId={projectId} refresh={run?.updatedAt} />
  </>
}
