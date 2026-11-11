import type { ReactNode } from 'react'
import madnessMark from '../../../resources/branding/madness-64.png'

/** Madness speaking as the conductor: its logo and name, ahead of a recap, a decision or a handover. */
export function MadnessVoice({ children }: { children?: ReactNode }): ReactNode {
  return <span className="madness-voice"><img src={madnessMark} alt="" width="22" height="22" /><strong>Madness</strong>{children ? <span className="madness-voice-text">{children}</span> : null}</span>
}
