// Madness as the conductor: instead of a fixed pipeline, it asks BMad's own `bmad` skill, which knows
// every installed skill and when to pick it, what the project needs next, then runs it or hands over.
export type Decision = { done: boolean; skill: string; agent: string | null; why: string; autonomous: boolean; question: string | null }

// Skills that maintain BMad itself, or that only the user can drive by name: never chosen by the pilot.
// bmad-build-auto needs its own git branch, and the agents' sandbox keeps .git read-only: Madness commits after each step instead.
const NEVER = /^(bmad|bmod-.*|bmad-customize|bmad-eval|bmad-toolsmith|bmad-agent-toolsmith|bmad-walkthrough|bmad-build-auto)$/

export function decisionPrompt(skills: readonly string[], history: readonly string[], rules: readonly string[] = []): string {
  return [
    'Question de Madness, l’orchestrateur qui pilote ce projet BMad. Tu ne modifies AUCUN fichier.',
    'Analyse l’état réel du projet (documents de _bmad-output, tickets, code, tests) et choisis la prochaine action en suivant l’aide des modules installés.',
    'Prends le chemin le plus léger qui reste fidèle à la méthode : proportionne les documents à la taille du projet.',
    'L’utilisateur a validé le récapitulatif et lancé le chantier : les agents tranchent seuls et notent leurs décisions.',
    'Git : les agents ne peuvent ni créer de branche ni commiter, Madness commite lui-même après chaque étape ; ne fais jamais dépendre une action d’une écriture dans .git.',
    'Mets "autonomous" à false seulement pour ce qu’aucun agent ne peut faire : recette humaine dans un vrai navigateur ou appareil, choix produit lourd de conséquences absent des documents, compte, accès ou paiement externe.',
    'Mets "done" à true quand le livrable fonctionne et qu’il ne reste rien d’utile à faire pour les agents ; indique alors dans "skill" et "userQuestion" ce que l’utilisateur devrait faire ensuite, s’il y a lieu.',
    'Compétences disponibles : ' + skills.filter(skill => !NEVER.test(skill)).join(', ') + '.',
    history.length ? 'Déjà fait par le pilote dans ce chantier :\n' + history.map(line => '- ' + line).join('\n') : '',
    rules.length ? 'Règles imposées par les kits du projet, à faire respecter :\n' + rules.map(rule => '- ' + rule).join('\n') + '\nAvant de déclarer le chantier terminé, assure-toi qu’une relecture de conformité (bmad-review) les a vérifiées.' : '',
    'Réponds UNIQUEMENT par un bloc ```json contenant :',
    '{"done": false, "skill": "bmad-…", "agent": "prénom de l’agent ou null", "why": "une phrase en français", "autonomous": true, "userQuestion": null}',
  ].filter(Boolean).join('\n')
}

/** The last JSON object of the reply, checked against the installed skills. */
export function parseDecision(text: string, skills: readonly string[]): Decision | null {
  const blocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map(match => match[1]!)
  const candidates = blocks.length ? blocks : [text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)]
  for (const candidate of candidates.reverse()) {
    let value: unknown
    try { value = JSON.parse(candidate) } catch { continue }
    if (!value || typeof value !== 'object') continue
    const record = value as Record<string, unknown>
    const done = record.done === true, skill = typeof record.skill === 'string' ? record.skill.trim() : ''
    const why = typeof record.why === 'string' ? record.why.trim().slice(0, 600) : ''
    const question = typeof record.userQuestion === 'string' && record.userQuestion.trim() ? record.userQuestion.trim().slice(0, 600) : null
    const agent = typeof record.agent === 'string' && record.agent.trim() ? record.agent.trim().slice(0, 40) : null
    // A finished project may name no skill; any other decision must name a usable one.
    const usable = skills.includes(skill) && !NEVER.test(skill)
    if (!why || !done && !usable) continue
    return { done, skill: usable ? skill : '', agent, why, autonomous: record.autonomous !== false, question }
  }
  return null
}

const LABELS: Record<string, string> = {
  'bmad-product-brief': 'Brief produit', 'bmad-prfaq': 'PRFAQ', 'bmad-brainstorming': 'Brainstorming', 'bmad-forge-idea': 'Mise à l’épreuve de l’idée', 'bmad-deep-recon': 'Recherche',
  'bmad-prd': 'PRD', 'bmad-ux': 'Expérience utilisateur', 'bmad-architecture': 'Architecture', 'bmad-agent-po': 'Epics et stories', 'bmad-build': 'Construction', 'bmad-build-auto': 'Construction',
  'bmad-code-review': 'Revue de code', 'bmad-review': 'Relecture critique', 'bmad-qa-generate-e2e-tests': 'Tests de bout en bout', 'bmad-party-mode': 'Table ronde', 'bmad-project-context': 'Contexte du dépôt',
  'bmad-advanced-elicitation': 'Approfondissement', 'bmad-agent-analyst': 'Analyse', 'bmad-agent-pm': 'Exigences', 'bmad-agent-architect': 'Architecture', 'bmad-agent-ux-designer': 'Expérience utilisateur', 'bmad-agent-dev': 'Développement',
}
export const actionLabel = (skill: string): string => LABELS[skill] ?? skill.replace(/^bmad-/, '').replace(/-/g, ' ')
// Skills that change code: the project's tests must pass after them.
export const changesCode = (skill: string): boolean => /^(bmad-build|bmad-build-auto|bmad-agent-dev|bmad-qa-generate-e2e-tests|bmad-code-review)$/.test(skill)
