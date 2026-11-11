// Agent replies arrive with colour emojis (BMad personas use them a lot). They clash with the
// cockpit's look, so status emojis become plain typographic signs and decorative ones are dropped.
const SIGNS: Record<string, string> = {
  '✅': '✓', '✔': '✓', '☑': '✓', '❌': '✗', '✖': '✗', '❎': '✗',
  '⚠': '⚠︎', '❗': '!', '❕': '!', '❓': '?', '❔': '?',
  '➡': '→', '⬅': '←', '⬆': '↑', '⬇': '↓', '👉': '→', '🔜': '→',
  '⭐': '★', '🌟': '★', '🔴': '●', '🟠': '●', '🟡': '●', '🟢': '●', '🔵': '●', '⚪': '○', '⚫': '●',
}
// A whole emoji: base pictograph with optional variation selector, skin tone and ZWJ-joined parts,
// keycaps (1️⃣), and flags (pairs of regional indicators).
const EMOJI = /(?:[0-9#*]️?⃣|[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}️?[\u{1F3FB}-\u{1F3FF}]?(?:‍\p{Extended_Pictographic}️?[\u{1F3FB}-\u{1F3FF}]?)*)/gu
// Symbols such as ©, ®, ™, ↔ are Extended_Pictographic too but read as text: keep them.
const TEXT_SYMBOLS = new Set(['©', '®', '™', '↔', '↕', '↩', '↪', '‼', '⁉', '〰', '〽', '℗', 'ℹ'])

export function soberText(text: string): string {
  return text.replace(EMOJI, match => {
    const base = match.replace(/[️‍\u{1F3FB}-\u{1F3FF}]/gu, '')
    if (TEXT_SYMBOLS.has(base)) return base
    return SIGNS[[...base][0] ?? ''] ?? (match.length && /^[0-9#*]/.test(match) ? match[0] + '.' : '\u0000')
  })
    // A dropped emoji leaves no double space and no space at the start of a line or before punctuation.
    .replace(/ ?\u0000 ?/g, (gap, offset: number, whole: string) => {
      const before = whole[offset - 1], after = whole[offset + gap.length]
      return gap.startsWith(' ') && gap.endsWith(' ') && before && after && before !== '\n' && after !== '\n' ? ' ' : ''
    })
}
