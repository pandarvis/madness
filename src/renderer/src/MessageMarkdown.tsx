import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { soberText } from './sober-text.ts'

// Small safe subset for agent replies: builds React nodes only, never HTML from model text.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <code key={index}>{part.slice(1, -1)}</code>
    return <Fragment key={index}>{part}</Fragment>
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

export function MessageMarkdown({ text }: { text: string }): ReactNode {
  return blocks(soberText(text)).map((block, index) => {
    if (block.kind === 'rule') return <hr key={index} />
    if (block.kind === 'heading') return <p key={index} className="message-heading"><strong>{inline(block.text)}</strong></p>
    if (block.kind === 'list') {
      const items = block.items.map((item, position) => <li key={position}>{inline(item)}</li>)
      return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>
    }
    return <p key={index}>{block.lines.map((line, position) => <Fragment key={position}>{position > 0 && <br />}{inline(line)}</Fragment>)}</p>
  })
}
