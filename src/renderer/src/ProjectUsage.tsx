import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UsageInitiative, UsageLine } from '../../core/usage.ts'
import { useLocale } from './Locale.tsx'
import { initiativeLabel } from './InitiativeSelector.tsx'

const duration = (ms: number): string => { const minutes = Math.round(ms / 60000); return minutes < 1 ? '< 1 min' : minutes < 60 ? minutes + ' min' : Math.floor(minutes / 60) + ' h ' + String(minutes % 60).padStart(2, '0') }
const tokens = (value: number, locale: string): string => value >= 1000 ? (value / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }) + ' k' : String(value)

/** What each initiative cost so far, in tokens and time: epics and stories, Madness's decisions, conversations. */
export function ProjectUsage({ projectId, refresh }: { projectId: string; refresh: unknown }): ReactNode {
  const { language } = useLocale(), fr = language === 'fr', locale = fr ? 'fr-FR' : 'en-GB'
  const [usage, setUsage] = useState<UsageInitiative[]>([])
  useEffect(() => {
    const bridge = (window as unknown as { madnessUsage?: { read(id: string): Promise<UsageInitiative[]> } }).madnessUsage
    if (!bridge) return
    let alive = true
    void bridge.read(projectId).then(value => { if (alive) setUsage(value) }).catch(() => undefined)
    return () => { alive = false }
  }, [projectId, refresh])
  if (!usage.length) return null
  const cells = (line: UsageLine): ReactNode => <><td>{tokens(line.tokens, locale)}</td><td>{duration(line.ms)}</td></>
  return <section className="usage" aria-labelledby="usage-title">
    <h2 id="usage-title" className="journey-label">{fr ? 'Ce que le projet a consommé' : 'What the project used'}</h2>
    {usage.map(group => <details key={group.initiative ?? ''} className="usage-initiative">
      <summary><span>{group.initiative ? (fr ? 'Initiative ' : 'Initiative ') + initiativeLabel(group.initiative) : (fr ? 'Hors initiative' : 'No initiative')}</span><span className="usage-total">{tokens(group.tokens, locale)} tokens · {duration(group.ms)}</span></summary>
      <table><thead><tr><th scope="col">{fr ? 'Travail' : 'Work'}</th><th scope="col">Tokens</th><th scope="col">{fr ? 'Temps' : 'Time'}</th></tr></thead>
        {group.epics.map(epic => <tbody key={epic.epic}><tr className="usage-epic"><th scope="rowgroup">{epic.label}</th>{cells(epic)}</tr>{epic.stories.map(story => <tr key={String(story.storyId)}><th scope="row">{story.label}</th>{cells(story)}</tr>)}</tbody>)}
        {group.other.length > 0 && <tbody>{group.other.map(line => <tr key={line.label}><th scope="row">{line.label}</th>{cells(line)}</tr>)}</tbody>}
      </table>
    </details>)}
  </section>
}
