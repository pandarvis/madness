// Madness picks who answers in the conversation from where the project stands in BMad:
// the agent that owns the first unfinished step, as the autopilot would call it.
export type JourneyStep = { id: 'brief' | 'requirements' | 'ux' | 'architecture' | 'epics' | 'stories'; done: boolean }

const OWNER: Record<JourneyStep['id'], string> = {
  brief: 'bmad-agent-analyst',
  requirements: 'bmad-agent-pm',
  ux: 'bmad-agent-ux-designer',
  architecture: 'bmad-agent-architect',
  epics: 'bmad-agent-po',
  stories: 'bmad-agent-dev',
}

export function agentForStage(steps: readonly JourneyStep[] | null): string {
  if (!steps || steps.length === 0) return OWNER.brief
  const next = steps.find(step => !step.done)
  // Everything built: changes and fixes go to the developer.
  return next ? OWNER[next.id] : OWNER.stories
}
