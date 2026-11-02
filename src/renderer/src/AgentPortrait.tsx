import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AgentPresentation } from './agentPresentation.ts'

export function AgentPortrait({ agent, large = false }: { agent?: AgentPresentation; large?: boolean }): ReactNode {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  return <span className={'agent-portrait' + (large ? ' is-large' : '')} aria-hidden="true">
    {agent?.image && failedImage !== agent.image ? <img src={agent.image} alt="" width="1254" height="1254" decoding="async" onError={() => setFailedImage(agent.image)} /> : <svg viewBox="0 0 24 24"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2Z" /></svg>}
  </span>
}
