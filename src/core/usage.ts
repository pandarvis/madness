// What every piece of work cost, in tokens and time, kept per project and per BMad initiative:
// autopilot steps, Madness's own decisions, and conversations with the agents.
export type UsageKind = 'decision' | 'action' | 'story' | 'conversation'
export type UsageEntry = {
  projectId: string; initiative: string | null; kind: UsageKind; at: string; tokens: number; ms: number
  /** The story the work belongs to, when known; an action that built stories is split across them. */
  epic?: string | null; epicTitle?: string | null; storyId?: number | null; title: string
}
export type UsageLine = { label: string; tokens: number; ms: number }
export type UsageStory = UsageLine & { storyId: number | null }
export type UsageEpic = UsageLine & { epic: string; stories: UsageStory[] }
export type UsageInitiative = { initiative: string | null; tokens: number; ms: number; epics: UsageEpic[]; other: UsageLine[] }

const OTHER_LABELS: Record<Exclude<UsageKind, 'story'>, string> = { decision: 'Décisions de Madness', conversation: 'Conversations avec les agents', action: 'Autres actions BMad' }

export function summarizeUsage(entries: readonly UsageEntry[], projectId: string): UsageInitiative[] {
  const groups = new Map<string, UsageInitiative>()
  for (const entry of entries) {
    if (entry.projectId !== projectId) continue
    const key = entry.initiative ?? ''
    const group = groups.get(key) ?? { initiative: entry.initiative, tokens: 0, ms: 0, epics: [], other: [] }
    groups.set(key, group)
    group.tokens += entry.tokens; group.ms += entry.ms
    if (entry.epic) {
      let epic = group.epics.find(item => item.epic === entry.epic)
      if (!epic) { epic = { epic: entry.epic, label: entry.epicTitle ?? entry.epic, tokens: 0, ms: 0, stories: [] }; group.epics.push(epic) }
      epic.tokens += entry.tokens; epic.ms += entry.ms
      let story = epic.stories.find(item => item.storyId === (entry.storyId ?? null))
      if (!story) { story = { storyId: entry.storyId ?? null, label: entry.title, tokens: 0, ms: 0 }; epic.stories.push(story) }
      story.tokens += entry.tokens; story.ms += entry.ms
      continue
    }
    const label = OTHER_LABELS[entry.kind === 'story' ? 'action' : entry.kind]
    let line = group.other.find(item => item.label === label)
    if (!line) { line = { label, tokens: 0, ms: 0 }; group.other.push(line) }
    line.tokens += entry.tokens; line.ms += entry.ms
  }
  for (const group of groups.values()) group.epics.forEach(epic => epic.stories.sort((a, b) => (a.storyId ?? 0) - (b.storyId ?? 0)))
  return [...groups.values()]
}

/** An action that built several stories: its cost is shared between them, so every story carries its part. */
export function splitAcross<T extends { epic: string; epicTitle: string; storyId: number; title: string }>(base: Omit<UsageEntry, 'epic' | 'epicTitle' | 'storyId' | 'title'> & { title: string }, stories: readonly T[]): UsageEntry[] {
  if (!stories.length) return [{ ...base }]
  const count = stories.length
  return stories.map((story, index) => ({ ...base, kind: 'story', epic: story.epic, epicTitle: story.epicTitle, storyId: story.storyId, title: story.title,
    tokens: Math.floor(base.tokens / count) + (index < base.tokens % count ? 1 : 0), ms: Math.floor(base.ms / count) + (index < base.ms % count ? 1 : 0) }))
}
