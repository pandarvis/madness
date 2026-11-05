import type {Language} from '../../contracts/language.ts'
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

const english:Record<string,Pick<AgentPresentation,'role'|'description'|'specialty'>>={
 Mary:{role:'Analyst',description:'Explores needs and structures information useful for understanding the project.',specialty:'Research · Needs · Analysis'},
 John:{role:'Product Manager',description:'Clarifies product goals and formalizes requirements.',specialty:'Product · Requirements · Priorities'},
 Sofia:{role:'Product Owner',description:'Structures initiatives, epics and stories to prepare work.',specialty:'Tickets · Slicing · Preparation'},
 Winston:{role:'Architect',description:'Defines technical decisions and system boundaries.',specialty:'Architecture · Decisions · Consistency'},
 Sally:{role:'UX Designer',description:'Designs journeys, interactions and UX specifications.',specialty:'Journeys · Interfaces · Interactions'},
 Amelia:{role:'Developer',description:'Implements changes and verifies their behavior.',specialty:'Code · Implementation · Verification'},
 Smithy:{role:'Toolsmith',description:'Builds and maintains BMad skills, agents and modules.',specialty:'Skills · Agents · Modules'}
}
// Only an attested native item supplies the name. Local descriptions are product copy.
export function agentPresentation(identity:MessageIdentity|undefined,language:Language='fr'):AgentPresentation|undefined{
 const value=identity?.kind==='attested'?cast.get(identity.name):undefined
 return value&&language==='en'?{...value,...english[value.name]}:value
}
