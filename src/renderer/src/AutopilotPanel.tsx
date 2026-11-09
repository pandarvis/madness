import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { initialAutopilotState } from '../../contracts/autopilot.ts'
import type { AutopilotProvider, AutopilotRun, AutopilotState, AutopilotStep } from '../../contracts/autopilot.ts'
import { useLocale } from './Locale.tsx'
import { MessageMarkdown } from './MessageMarkdown.tsx'
import './autopilot.css'

export function useAutopilot(): AutopilotState {
  const [state, setState] = useState(initialAutopilotState)
  useEffect(() => {
    const bridge = window.madnessAutopilot; if (!bridge) return
    const accept = (next: AutopilotState): void => setState(current => next.sequence >= current.sequence ? next : current)
    void bridge.read().then(accept).catch(() => undefined)
    return bridge.onChanged(accept)
  }, [])
  return state
}
export const autopilotBuilding = (run: AutopilotRun | undefined): boolean => run?.status === 'running' || run?.status === 'preparing'
export const currentStep = (run: AutopilotRun | undefined): AutopilotStep | undefined => run?.steps.find(step => step.status === 'running')

const duration = (ms: number): string => { const minutes = Math.round(ms / 60000); return minutes < 1 ? '< 1 min' : minutes < 60 ? minutes + ' min' : Math.floor(minutes / 60) + ' h ' + String(minutes % 60).padStart(2, '0') }
const tokens = (value: number, locale: string): string => value >= 1000 ? (value / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }) + ' k' : String(value)
const counted = (steps: AutopilotStep[]): AutopilotStep[] => steps.filter(step => step.status !== 'skipped')
const total = (steps: AutopilotStep[], key: 'durationMs' | 'tokens'): number => steps.reduce((sum, step) => sum + step[key], 0)

/** Project-level autopilot: recap and go, live progress, then tokens and time per epic and story. */
export function AutopilotPanel({ projectId, provider, run, blocked }: { projectId: string; provider: AutopilotProvider; run: AutopilotRun | undefined; blocked: boolean }): ReactNode {
  const { language } = useLocale(), fr = language === 'fr', locale = fr ? 'fr-FR' : 'en-GB', bridge = window.madnessAutopilot
  if (!bridge) return null
  const statusLabels: Record<string, string> = { pending: fr ? 'à faire' : 'to do', running: fr ? 'en cours' : 'running', done: fr ? 'fait' : 'done', skipped: fr ? 'déjà là' : 'existing', failed: fr ? 'échec' : 'failed' }
  const pauses: Record<string, string> = fr ? { interrupted: 'Madness a été fermé pendant le travail.', quota: 'Limite de l’abonnement atteinte : reprise automatique prévue.', tests: 'Les tests restent en échec.', failure: 'L’agent s’est arrêté sur une erreur.' } : { interrupted: 'Madness was closed during the work.', quota: 'Subscription limit reached: automatic resume planned.', tests: 'Tests keep failing.', failure: 'The agent stopped on an error.' }
  if (!run || run.status === 'stopped' && !run.steps.some(step => step.status === 'done')) return <section className="autopilot autopilot-idle" aria-label={fr ? 'Pilote automatique' : 'Autopilot'}>
    <div><h3>{fr ? 'Pilote automatique' : 'Autopilot'}</h3><p>{fr ? 'Une fois l’idéation faite, Madness résume le projet puis construit tout seul les epics, avec Claude Code.' : 'Once ideation is done, Madness recaps the project and builds the epics on its own.'}</p></div>
    <button type="button" className="primary" disabled={blocked} onClick={() => void bridge.prepare(projectId, provider)}>{fr ? 'Préparer le lancement' : 'Prepare launch'}</button>
  </section>
  const phases = counted(run.steps.filter(step => step.kind === 'phase')), stories = run.steps.filter(step => step.kind === 'story')
  const epics = [...new Set(stories.map(step => step.epic))].map(epic => ({ epic, steps: stories.filter(step => step.epic === epic) }))
  const active = currentStep(run), building = autopilotBuilding(run), done = run.steps.filter(step => step.status === 'done' || step.status === 'skipped').length
  const head = run.status === 'preparing' ? (fr ? 'Madness prépare le récapitulatif…' : 'Madness is preparing the recap…') : run.status === 'ready' ? (fr ? 'Récapitulatif' : 'Recap') : run.status === 'running' ? (fr ? 'En chantier' : 'Building') : run.status === 'paused' ? (fr ? 'En pause' : 'Paused') : run.status === 'done' ? (fr ? 'Prêt à essayer' : 'Ready to try') : (fr ? 'Arrêté' : 'Stopped')
  const row = (step: AutopilotStep): ReactNode => <tr key={step.id} className={'autopilot-' + step.status}><th scope="row">{step.title}</th><td>{statusLabels[step.status]}</td><td>{step.durationMs ? duration(step.durationMs) : '—'}</td><td>{step.tokens ? tokens(step.tokens, locale) : '—'}</td></tr>
  return <section className={'autopilot' + (building ? ' autopilot-building' : '')} aria-label={fr ? 'Pilote automatique' : 'Autopilot'}>
    <div className="autopilot-head"><div><h3>{head}</h3><p role="status">{active ? active.title : run.steps.length ? done + ' / ' + run.steps.length + (fr ? ' étapes' : ' steps') : ''}{run.steps.length ? ' · ' + tokens(total(run.steps, 'tokens'), locale) + ' tokens · ' + duration(total(run.steps, 'durationMs')) : ''}</p></div>
      <div className="autopilot-actions">
        {run.status === 'ready' && <button type="button" className="primary" onClick={() => void bridge.start(projectId)}>{fr ? 'Go' : 'Go'}</button>}
        {(run.status === 'paused' || run.status === 'stopped') && <button type="button" className="primary" onClick={() => void bridge.resume(projectId)}>{fr ? 'Reprendre' : 'Resume'}</button>}
        {(building || run.status === 'paused') && <button type="button" className="secondary" onClick={() => void bridge.stop(projectId)}>{fr ? 'Arrêter' : 'Stop'}</button>}
        {!building && <button type="button" className="text-button" onClick={() => void bridge.dismiss(projectId)}>{fr ? 'Effacer' : 'Clear'}</button>}
      </div></div>
    {run.status === 'paused' && <p className="autopilot-pause" role="alert">{run.pauseReason ? pauses[run.pauseReason] : ''} {run.detail}{run.resumeAt ? ' ' + new Date(run.resumeAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : ''}</p>}
    {run.recap && run.status === 'ready' && <div className="autopilot-recap"><MessageMarkdown text={run.recap} /></div>}
    {run.steps.length > 0 && <div className="autopilot-table"><table><thead><tr><th scope="col">{fr ? 'Étape' : 'Step'}</th><th scope="col">{fr ? 'État' : 'State'}</th><th scope="col">{fr ? 'Temps' : 'Time'}</th><th scope="col">Tokens</th></tr></thead>
      {phases.length > 0 && <tbody>{phases.map(row)}</tbody>}
      {epics.map(group => <tbody key={group.epic}><tr className="autopilot-epic"><th scope="rowgroup">{group.steps[0].epicTitle}</th><td /><td>{duration(total(group.steps, 'durationMs'))}</td><td>{tokens(total(group.steps, 'tokens'), locale)}</td></tr>{group.steps.map(row)}</tbody>)}
    </table></div>}
  </section>
}
