import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AgentPresentation } from './agentPresentation.ts'
import { PERSONA_BY_NAME } from './sober-text.ts'
import type { Persona } from './sober-text.ts'
import { PersonaGlyph } from './PersonaGlyph.tsx'

// Portrait when the agent is known; otherwise the persona glyph its reply announced, or a neutral figure.
export function AgentPortrait({ agent, persona, large = false }: { agent?: AgentPresentation; persona?: Persona | null; large?: boolean }): ReactNode {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const glyph = persona ?? (agent ? PERSONA_BY_NAME[agent.name] : undefined)
  return <span className={'agent-portrait' + (large ? ' is-large' : '') + (glyph ? ' has-glyph' : '')} aria-hidden="true">
    {agent?.image && failedImage !== agent.image ? <img src={agent.image} alt="" width="1254" height="1254" decoding="async" onError={() => setFailedImage(agent.image)} />
      : glyph ? <PersonaGlyph persona={glyph} />
      : <svg viewBox="0 0 24 24"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2Z" /></svg>}
  </span>
}
