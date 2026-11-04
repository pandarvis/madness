import type { MessageIdentity } from '../../contracts/dialogue.ts'

export type AgentPresentation = { name: string; role: string; description: string; specialty: string; image: string }
const portraits = import.meta.glob('./assets/atelier/*-bust.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const agent = (name: string, role: string, description: string, specialty: string): AgentPresentation => ({ name, role, description, specialty, image: portraits[`./assets/atelier/${name.toLowerCase()}-bust.png`] })
const cast: ReadonlyMap<string, AgentPresentation> = new Map([
  agent('Mary', 'Analyste', 'Explore le besoin et structure les informations utiles à la compréhension du projet.', 'Recherche · Besoins · Analyse'),
  agent('John', 'Product Manager', 'Clarifie les objectifs du produit et formalise ses exigences.', 'Produit · Exigences · Priorités'),
  agent('Sofia', 'Product Owner', 'Structure les initiatives, les epics et les stories pour préparer le travail.', 'Tickets · Découpage · Préparation'),
  agent('Winston', 'Architecte', 'Formule les décisions techniques et les frontières du système.', 'Architecture · Décisions · Cohérence'),
  agent('Sally', 'UX Designer', 'Conçoit les parcours, les interactions et les spécifications UX.', 'Parcours · Interfaces · Interactions'),
  agent('Amelia', 'Développeuse', 'Implémente les changements et vérifie leur comportement.', 'Code · Implémentation · Vérification'),
  agent('Smithy', 'Toolsmith', 'Construit et entretient les compétences, agents et modules BMad.', 'Compétences · Agents · Modules'),
].map(value => [value.name, value]))

// Deliberately accepts only the native item identity: no recipient, invocation or message text.
export function agentPresentation(identity: MessageIdentity | undefined): AgentPresentation | undefined {
  return identity?.kind === 'attested' ? cast.get(identity.name) : undefined
}
