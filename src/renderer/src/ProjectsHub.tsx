import type { ReactNode } from 'react'
import type { Conversation } from '../../contracts/index.ts'
import type { DialogueState } from '../../contracts/dialogue.ts'
import { useLocale } from './Locale.tsx'
import type { AutopilotRun, AutopilotState } from '../../contracts/autopilot.ts'
import { autopilotBuilding, currentStep } from './AutopilotPanel.tsx'
import './hub.css'

type Project = { id: string; name: string; rootPath: string }
type Tone = 'working' | 'waiting' | 'ready' | 'idle'
type Activity = { tone: Tone; label: string; detail: string | null }
const WORKING = ['qualifying', 'qualified', 'starting', 'running', 'stopping']
const AGENTS: Record<string, string> = { '$bmad-agent-analyst': 'Mary', '$bmad-agent-pm': 'John', '$bmad-agent-architect': 'Winston', '$bmad-agent-ux-designer': 'Sally', '$bmad-agent-po': 'Sofia', '$bmad-agent-dev': 'Amelia', '$bmad-forge-idea': 'Forge', '$bmad': 'BMad' }

function excerpt(conversation: Conversation | undefined): string | null {
  const message = conversation?.messages.filter(m => m.role === 'assistant').at(-1)
  if (!message) return null
  const text = message.text.replace(/[*#`]/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 140 ? text.slice(0, 140) + '…' : text
}

/** Home overview: every known project and, live, what its agent is doing right now. */
export function ProjectsHub({ projects, conversations, dialogue, initiative, autopilot, graphRunning, statusText, onOpen, pending }: {
  projects: readonly Project[]; conversations: readonly Conversation[]; dialogue: DialogueState; initiative: (projectId: string) => string | null; autopilot: AutopilotState
  graphRunning: (projectId: string) => boolean; statusText: (status: DialogueState['status']) => string
  onOpen: (projectId: string) => void; pending: boolean
}): ReactNode {
  const { language } = useLocale()
  const fr = language === 'fr'
  const agent = (AGENTS[dialogue.invocation ?? ''] ?? (fr ? 'Agent' : 'Agent')) + (dialogue.context.providerId === 'claude-code' ? ' · Claude Code' : ' · Codex')
  const progress = (run: AutopilotRun | undefined): string => {
    if (!run?.steps.length) return ''
    const done = run.steps.filter(step => step.status === 'done' || step.status === 'skipped').length, used = run.steps.reduce((sum, step) => sum + step.tokens, 0), minutes = Math.round(run.steps.reduce((sum, step) => sum + step.durationMs, 0) / 60000)
    return ' · ' + done + '/' + run.steps.length + ' · ' + Math.round(used / 1000) + ' k tokens · ' + minutes + ' min'
  }
  const activity = (project: Project): Activity => {
    const pilot = autopilot.runs.find(run => run.projectId === project.id)
    if (autopilotBuilding(pilot)) return { tone: 'working', label: fr ? 'En chantier' : 'Building', detail: (currentStep(pilot)?.title ?? (fr ? 'Préparation' : 'Preparing')) + progress(pilot) }
    if (pilot?.status === 'paused') return { tone: 'waiting', label: fr ? 'Chantier en pause' : 'Build paused', detail: pilot.detail }
    if (pilot?.status === 'done') return { tone: 'ready', label: fr ? 'Prêt à essayer' : 'Ready to try', detail: progress(pilot).slice(3) }
    if (dialogue.context.projectId === project.id) {
      if (dialogue.status === 'waiting-question' || dialogue.status === 'waiting-approval') return { tone: 'waiting', label: fr ? 'Attend ta réponse' : 'Waiting for you', detail: agent }
      if (WORKING.includes(dialogue.status)) return { tone: 'working', label: fr ? 'Agent au travail' : 'Agent working', detail: agent + ' · ' + statusText(dialogue.status) }
      if (dialogue.status === 'ready') return { tone: 'waiting', label: fr ? 'À toi de répondre' : 'Your turn', detail: agent }
    }
    if (graphRunning(project.id)) return { tone: 'working', label: fr ? 'Graphe en cours' : 'Graph running', detail: null }
    return { tone: 'idle', label: fr ? 'Aucun agent actif' : 'No active agent', detail: null }
  }
  const rows = projects.map(project => ({ project, now: activity(project), last: conversations.filter(c => c.context.projectId === project.id).at(-1) }))
  const order: Record<Tone, number> = { working: 0, waiting: 1, ready: 2, idle: 3 }
  rows.sort((a, b) => order[a.now.tone] - order[b.now.tone])
  const working = rows.filter(row => row.now.tone === 'working').length
  return <section className="projects-hub" aria-labelledby="projects-hub-title">
    <div className="hub-head"><h2 id="projects-hub-title">{fr ? 'Gestion de projet' : 'Project management'}</h2>
      <p className="hub-summary" role="status">{working === 0 ? (fr ? 'Aucun agent en cours' : 'No agent running') : working === 1 ? (fr ? '1 projet actif' : '1 active project') : working + (fr ? ' projets actifs' : ' active projects')}</p></div>
    <ul className="hub-grid">
      {rows.map(({ project, now, last }) => <li key={project.id} className={'hub-card hub-' + now.tone + (autopilotBuilding(autopilot.runs.find(run => run.projectId === project.id)) ? ' hub-building' : '')} data-hub-project={project.id}>
        <button type="button" className="hub-open" disabled={pending} title={project.rootPath} aria-label={(fr ? 'Aller au projet ' : 'Go to project ') + project.name + ' : ' + now.label} onClick={() => onOpen(project.id)}>
          {autopilotBuilding(autopilot.runs.find(run => run.projectId === project.id)) && <span className="hub-banner" aria-hidden="true" />}
          <span className="hub-name">{project.name}{initiative(project.id) && <span className="hub-initiative"> › {initiative(project.id)}</span>}</span>
          <span className="hub-state"><span className="hub-dot" aria-hidden="true" />{now.label}</span>
          {now.detail && <span className="hub-detail">{now.detail}</span>}
          <span className="hub-last">{excerpt(last) ?? (fr ? 'Aucun échange pour l’instant' : 'No exchange yet')}</span>
        </button>
      </li>)}
    </ul>
  </section>
}
