import { parse } from 'smol-toml'
import type { OverrideEntries } from '../../core/kits/translate.ts'

// BMad reads only `<skill>.toml` and `<skill>.user.toml`, and TOML forbids declaring a table twice:
// Madness writes its entries in one delimited block, next to whatever the team wrote by hand.
export const KITS_BEGIN = '# madness:kits:begin — écrit par Madness, ne pas modifier'
const BEGIN_MARK = '# madness:kits:begin', END = '# madness:kits:end'
const KEYS = ['persistent_facts', 'principles', 'review_guidance'] as const
const quote = (value: string): string => JSON.stringify(value)

export function removeManagedBlock(text: string): string {
  const start = text.indexOf(BEGIN_MARK); if (start < 0) return text
  const end = text.indexOf(END, start); if (end < 0) throw Error('KIT_OVERRIDE_DAMAGED')
  let after = end + END.length; if (text[after] === '\n') after++
  return text.slice(0, start) + text.slice(after)
}

/** Writes Madness's entries into a BMad override; a key the team already set by hand is refused, never overwritten. */
export function applyManagedBlock(original: string, entries: OverrideEntries): string {
  const base = removeManagedBlock(original)
  const keys = KEYS.filter(key => entries[key].length)
  if (!keys.length) return base
  const existing = (base.trim() ? parse(base) : {}) as Record<string, Record<string, unknown> | undefined>
  const table = existing[entries.table]
  for (const key of keys) if (table && key in table) throw Error('KIT_OVERRIDE_CONFLICT: ' + key)
  const lines = keys.map(key => key + ' = [\n' + entries[key].map(value => '  ' + quote(value) + ',').join('\n') + '\n]')
  let text: string
  if (!table) text = base + (base && !base.endsWith('\n') ? '\n' : '') + KITS_BEGIN + '\n[' + entries.table + ']\n' + lines.join('\n') + '\n' + END + '\n'
  else {
    const header = new RegExp('^\\[' + entries.table + '\\][ \\t]*(#.*)?$', 'm').exec(base)
    if (!header) throw Error('KIT_OVERRIDE_CONFLICT: ' + entries.table)
    const at = header.index + header[0].length + 1
    text = base.slice(0, at) + KITS_BEGIN + '\n' + lines.join('\n') + '\n' + END + '\n' + base.slice(at)
  }
  parse(text)
  return text
}
