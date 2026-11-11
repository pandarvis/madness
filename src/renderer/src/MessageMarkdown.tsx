import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { PERSONA_MARK, soberText } from './sober-text.ts'
import type { Persona } from './sober-text.ts'
import { PersonaGlyph } from './PersonaGlyph.tsx'

// Persona markers left by soberText become Madness's own glyphs.
function glyphs(text: string): ReactNode[] {
  return text.split(PERSONA_MARK).map((part, index) => index % 2 ? <PersonaGlyph key={index} persona={part as Persona} className="persona-glyph" /> : part).filter(part => part !== '')
}

// Small safe subset for agent replies: builds React nodes only, never HTML from model text.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g).filter(Boolean).map((part, index) => {
    // Links point at local BMad files: show their label, keep the path as a tooltip.
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link) return <span key={index} className="message-link" title={link[2]}>{glyphs(link[1]!)}</span>
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={index}>{glyphs(part.slice(2, -2))}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <code key={index}>{part.slice(1, -1).replace(PERSONA_MARK, '')}</code>
    return <Fragment key={index}>{glyphs(part)}</Fragment>
  })
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'rule' }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'paragraph'; lines: string[] }

function blocks(text: string): Block[] {
  const result: Block[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim(), last = result.at(-1)
    const heading = /^(#{1,6})\s+(.+)$/.exec(line), bullet = /^[-*]\s+(.+)$/.exec(line), numbered = /^\d+[.)]\s+(.+)$/.exec(line)
    if (!line) { result.push({ kind: 'paragraph', lines: [] }); continue }
    if (/^(-{3,}|\*{3,})$/.test(line)) result.push({ kind: 'rule' })
    else if (heading) result.push({ kind: 'heading', level: heading[1]!.length, text: heading[2]! })
    else if (bullet || numbered) {
      const ordered = !!numbered, item = (bullet ?? numbered)![1]!
      if (last?.kind === 'list' && last.ordered === ordered) last.items.push(item)
      else result.push({ kind: 'list', ordered, items: [item] })
    } else if (last?.kind === 'paragraph' && last.lines.length) last.lines.push(line)
    else result.push({ kind: 'paragraph', lines: [line] })
  }
  return result.filter(block => block.kind !== 'paragraph' || block.lines.length > 0)
}

export function MessageMarkdown({ text, keepLead = false }: { text: string; keepLead?: boolean }): ReactNode {
  const sober = soberText(text)
  // The persona that opens a reply is already shown by the author's portrait; a round table keeps each speaker's.
  return blocks(keepLead ? sober : sober.replace(/^\s*\uE000\w+\uE001\s*/, '')).map((block, index) => {
    if (block.kind === 'rule') return <hr key={index} />
    if (block.kind === 'heading') return <p key={index} className="message-heading"><strong>{inline(block.text)}</strong></p>
    if (block.kind === 'list') {
      const items = block.items.map((item, position) => <li key={position}>{inline(item)}</li>)
      return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>
    }
    return <p key={index}>{block.lines.map((line, position) => <Fragment key={position}>{position > 0 && <br />}{inline(line)}</Fragment>)}</p>
  })
}
