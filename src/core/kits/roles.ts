// Kits address roles, not skill names, so they survive BMad renaming its skills.
export const KIT_ROLES = ['analyst', 'pm', 'ux', 'architect', 'po', 'dev', 'review', 'all'] as const
export type KitRole = typeof KIT_ROLES[number]
const SKILLS: Record<Exclude<KitRole, 'all'>, readonly string[]> = {
  analyst: ['bmad-agent-analyst', 'bmad-product-brief', 'bmad-prfaq', 'bmad-brainstorming', 'bmad-forge-idea', 'bmad-deep-recon'],
  pm: ['bmad-agent-pm', 'bmad-prd'],
  ux: ['bmad-agent-ux-designer', 'bmad-ux'],
  architect: ['bmad-agent-architect', 'bmad-architecture'],
  po: ['bmad-agent-po'],
  dev: ['bmad-agent-dev', 'bmad-build', 'bmad-build-auto', 'bmad-qa-generate-e2e-tests'],
  review: ['bmad-code-review', 'bmad-review'],
}
export function skillsFor(roles: readonly KitRole[]): string[] {
  const wanted = roles.includes('all') ? [...Object.values(SKILLS).flat(), 'bmad-party-mode'] : roles.flatMap(role => SKILLS[role as Exclude<KitRole, 'all'>])
  return [...new Set(wanted)].sort()
}
