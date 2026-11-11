import type { ReactNode } from 'react'
import type { Persona } from './sober-text.ts'

// Madness's own line glyphs for the BMad personas, drawn in the cockpit's stroke style
// instead of the colour emojis the agents put in their replies.
const DRAWINGS: Record<Persona, ReactNode> = {
  // Mary, analyst: rising bars on a baseline.
  analyst: <><path d="M3.5 20.5h17" /><path d="M7 17v-4" /><path d="M11 17v-7.5" /><path d="M15 17v-5.5" /><path d="M19 17V6" /><path d="m5.5 9.5 4-3.5 4 2.5 4-4.5" /></>,
  // John, product manager: clipboard with ticked items.
  pm: <><rect x="5" y="4.5" width="14" height="16.5" rx="1.5" /><rect x="9" y="2.75" width="6" height="3.5" rx="1" /><path d="m8 11 1.4 1.4L12 9.8" /><path d="M14 11.2h2" /><path d="m8 16.3 1.4 1.4 2.6-2.6" /><path d="M14 16.5h2" /></>,
  // Sofia, product owner: target with an arrow in the bull's eye.
  po: <><circle cx="11" cy="13" r="7.5" /><circle cx="11" cy="13" r="4" /><circle cx="11" cy="13" r=".9" fill="currentColor" /><path d="m11 13 8.5-8.5" /><path d="M16.5 4.5h3v3" /></>,
  // Sally, UX designer: palette with paint dots.
  ux: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.9-.9 1.5-2-.5-1.3.3-2.4 1.7-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9.1-8.5-9.1Z" /><circle cx="7.6" cy="11.2" r="1.1" fill="currentColor" /><circle cx="9.6" cy="7.4" r="1.1" fill="currentColor" /><circle cx="14.2" cy="7.2" r="1.1" fill="currentColor" /><circle cx="17" cy="10.6" r="1.1" fill="currentColor" /></>,
  // Winston, architect: pediment on columns.
  architect: <><path d="M3 9 12 4l9 5" /><path d="M4 9.5h16" /><path d="M6.5 9.5v8" /><path d="M10.2 9.5v8" /><path d="M13.8 9.5v8" /><path d="M17.5 9.5v8" /><path d="M3.5 20.5h17" /><path d="M5 17.5h14" /></>,
  // Amelia, developer: screen with a code chevron pair.
  dev: <><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M9 8.5 6.5 10.75 9 13" /><path d="m15 8.5 2.5 2.25L15 13" /><path d="m12.9 8-1.8 5.5" /><path d="M12 17v3.5" /><path d="M8.5 20.5h7" /></>,
  // Smithy, toolsmith: hammer over an anvil.
  toolsmith: <><path d="M3.5 11.5h15v1.5a2.5 2.5 0 0 1-2.5 2.5H8.5a5 5 0 0 1-5-4Z" /><path d="M10 15.5V18" /><path d="M14 15.5V18" /><path d="M7.5 20.5h9l-1.2-2.5H8.7Z" /><path d="m15.4 2.6 3.9 3.9-1.8 1.8-3.9-3.9Z" /><path d="m15.3 6.5-3.6 3.6" /></>,
}

export function PersonaGlyph({ persona, className }: { persona: Persona; className?: string }): ReactNode {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-persona={persona}>{DRAWINGS[persona]}</svg>
}
