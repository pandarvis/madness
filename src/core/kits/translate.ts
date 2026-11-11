import type { Kit } from './manifest.ts'
import { skillsFor } from './roles.ts'

export type OverrideEntries = { table: 'agent' | 'workflow'; persistent_facts: string[]; principles: string[]; review_guidance: string[] }
// Pieces Madness copies into the project and hands to BMad as files; the others come in later steps.
const TEXT_KINDS = ['docs', 'glossary', 'rules', 'assets']

/** Active kits → what each installed BMad skill must receive. `tables` maps installed skills to their customize table. */
export function translateKits(kits: readonly Kit[], tables: Record<string, 'agent' | 'workflow'>): Record<string, OverrideEntries> {
  const out: Record<string, OverrideEntries> = {}
  const entry = (skill: string): OverrideEntries | null => {
    const table = tables[skill]; if (!table) return null
    return out[skill] ??= { table, persistent_facts: [], principles: [], review_guidance: [] }
  }
  for (const kit of kits) {
    for (const piece of kit.pieces) {
      if (!TEXT_KINDS.includes(piece.kind) || !piece.path) continue
      const fact = 'file:{project-root}/_bmad/kits/' + kit.id + '/' + piece.path
      for (const skill of skillsFor(piece.for)) {
        const target = entry(skill); if (!target) continue
        target.persistent_facts.push(fact)
        if (piece.level !== 'impose') continue
        if (target.table === 'agent') target.principles.push('Respecter obligatoirement « ' + piece.title + ' » du kit ' + kit.name + '.')
        if (skill === 'bmad-review') target.review_guidance.push(fact)
      }
    }
    for (const rule of kit.rules) for (const skill of skillsFor(rule.for)) {
      const target = entry(skill); if (!target) continue
      target.persistent_facts.push((rule.level === 'impose' ? 'OBLIGATOIRE' : 'Recommandé') + ' (kit ' + kit.name + ') : ' + rule.text)
      if (rule.level === 'impose' && target.table === 'agent') target.principles.push(rule.text)
      if (rule.level === 'impose' && skill === 'bmad-review') target.review_guidance.push(rule.text)
    }
  }
  return out
}
