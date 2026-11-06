import type {Language} from '../../contracts/language.ts'
import {fr,en} from './strings.ts'
/** Closed presenters, called only for product-owned slots. Never messages, source fields or raw receipts. */
const owned = {
 "library": {
  "Sélection absente, disparue ou racine remplacée — contexte courant non établi.": "Selection missing or root replaced — current context not established.",
  "Choix conservé pour cette session — enregistrement échoué.": "Choice kept for this session — save failed.",
  "Observation d’un autre contexte ou d’une ancienne racine — historique seulement.": "Observation from another context or an old root — history only.",
  "Observation précédente — fraîcheur non garantie.": "Previous observation — freshness not guaranteed.",
  "Observation locale datée — aucune fraîcheur continue garantie.": "Dated local observation — continuous freshness not guaranteed.",
  "Preuves du projet non lues ou indisponibles — état et travail restant non établis.": "Project evidence unread or unavailable — state and remaining work not established.",
  "Proposition littérale au contexte capturé — ni prochaine action structurée ni acceptation humaine.": "Literal proposal in the captured context — no structured next action or human acceptance.",
  "Le bundle ne prouve ni l’identité physique de la racine ni la révision du contexte courant.": "The bundle proves neither physical root identity nor current context revision.",
  "Réponse partielle ou issue non confirmée.": "Partial response or outcome not confirmed.",
  "Conservation locale non confirmée.": "Local persistence not confirmed.",
  "Sélection Madness conservée": "Saved Madness selection",
  "Aucune sélection valide": "No valid selection"
 },
 "file": {
  "Une activité possède déjà les outils locaux. Réessayez après sa fin.": "An activity already owns local tools. Retry after it ends.",
  "Arrêt non confirmé — vérifiez son arrêt avant une nouvelle demande.": "Stop not confirmed — check it before a new request.",
  "Format d’aperçu non pris en charge. Aucun contenu affiché.": "Preview format unsupported. No content displayed.",
  "Format UTF-8 invalide — aperçu refusé.": "Invalid UTF-8 format — preview refused.",
  "Contenu binaire — aperçu refusé.": "Binary content — preview refused.",
  "Lecture trop volumineuse — aucune troncature affichée.": "Content too large — no truncation displayed.",
  "Fermeture en cours — demande détachée.": "Closing — request detached.",
  "Résultat de la demande d’ouverture inconnu — ouverture non confirmée. Aucun nouvel envoi automatique.": "File opening request outcome unknown — opening not confirmed. No automatic resend.",
  "Demande d’ouverture échouée — vous pouvez copier le chemin.": "Editor request failed — you can copy the path.",
  "Limite technique de la session de fichiers — aperçu indisponible pour cette observation. Les sources restent consultables dans leur fiche.": "File session technical limit — preview unavailable for this observation. Sources remain available in their details.",
  "Aperçu ancien — la source ou son contexte a changé.": "Stale preview — source or context changed.",
  "Chemin copié.": "Path copied.",
  "Copie impossible — sélectionnez le texte.": "Could not copy — select the text.",
  "Éditeur indisponible — vous pouvez copier le chemin.": "Editor unavailable — you can copy the path.",
  "Demande transmise à l’éditeur. Ouverture non confirmée.": "Request sent to editor. Opening not confirmed.",
  "Référence ancienne ou non vérifiée — relisez les preuves.": "Stale or unverified reference — read evidence again.",
  "La vérification finale de la demande n’a pas abouti.": "Final request verification did not complete.",
  "Lecture ou accès refusé — la source doit être examinée de nouveau.": "Read or access refused — inspect the source again.",
  "Demande détachée pendant la fermeture — ouverture non confirmée.": "Request detached while closing — opening not confirmed.",
  "Lecture interrompue pendant la fermeture.": "Reading interrupted while closing."
 },
 "effects": {
  "Nouvelle session Forge uniquement dans sa sortie qualifiée ; recherche des sessions existantes obligatoire. Aucune reprise.": "New Forge session only in its qualified output; existing session search required. No resume.",
  "Mary ; chaque patch complet exige un accord ponctuel. Aucun accord global.": "Mary; each complete patch requires a one-time approval. No global approval.",
  "Lecture seule ; questions non secrètes et discussion du profil natif uniquement.": "Read-only; non-secret questions and native profile discussion only."
 },
 "activity": {
  "Invocation copiée.": "Invocation copied.",
  "Chemin copié.": "Path copied.",
  "Inspection locale datée · résultat natif historique toujours inconnu": "Dated local inspection · historical native outcome still unknown",
  "Aides BMad, contexte et sources vérifiés · lecture seule": "BMad help, context and sources checked · read-only",
  "Profil Forge, roster, hooks, sorties et dépendances vérifiés": "Forge profile, roster, hooks, outputs and dependencies checked",
  "Profil Mary et dépendances vérifiés · lecture seule": "Mary profile and dependencies checked · read-only",
  "Envoi acquitté par Codex · conversation capturée": "Send acknowledged by Codex · conversation captured",
  "Tour terminé · réponse enregistrée · à vous de répondre": "Turn complete · response saved · your turn to respond",
  "Ressources possédées arrêtées": "Owned resources stopped",
  "Arrêt de Codex ou de l’outil local non confirmé": "Codex or local tool stop not confirmed",
  "Lecture d’un fichier du profil BMad qualifié": "Reading a file from the qualified BMad profile",
  "Codex app-server · forfait ChatGPT · profil isolé · lecture seule": "Codex app-server · ChatGPT plan · isolated profile · read-only",
  "uv run · resolve_customization.py --key agent": "uv run · resolve_customization.py --key agent",
  "uv run · resolve_config.py --key core.output_folder --key core.active_initiative": "uv run · resolve_config.py --key core.output_folder --key core.active_initiative"
 },
 "diagnostic": {
  "Conservation du graphe illisible — aucune analyse relancée.": "Graph storage unreadable — no analysis restarted.",
  "Référence ancienne ou non vérifiée — sources modifiées ou accès refusé.": "Stale or unverified reference — sources changed or access refused.",
  "Graphify signale une couverture limitée.": "Graphify reports limited coverage.",
  "Résultat étranger ou incompatible refusé — dernier complet conservé.": "Foreign or incompatible result refused — last complete graph retained.",
  "Arrêt non confirmé — vérifiez l’arrêt dans la récupération commune.": "Stop not confirmed — check the stop in shared recovery.",
  "Analyse interrompue avant publication.": "Analysis interrupted before publication.",
  "Arrêt confirmé par la récupération commune. Aucun graphe relancé ; le résultat reste historique.": "Stop confirmed by shared recovery. No graph restarted; the result remains historical.",
  "HELP_BRIDGE_READ_FAILED": "Saved help could not be read.",
  "Fiche absente de cette observation.": "Skill details missing from this observation.",
  "Source gagnante refusée ou invocation non admise ; aucune copie masquée ne peut la remplacer.": "Winning source refused or invocation not admitted; no hidden copy can replace it.",
  "Version installée inconnue ou non qualifiée.": "Installed version unknown or not qualified.",
  "Aucun profil natif qualifié pour cette compétence.": "No qualified native profile for this skill.",
  "Préparation périmée — relisez la fiche puis préparez de nouveau.": "Preparation stale — reread details then prepare again.",
  "Sélection Madness et initiative active doivent concorder pour ce profil.": "Madness selection and active initiative must match for this profile.",
  "Les outils sont occupés — attendez la fin de l’activité avant de préparer.": "Tools are busy — wait for activity to finish before preparing.",
  "Arrêt non confirmé — récupération requise avant tout lancement.": "Stop not confirmed — recovery required before any launch.",
  "Profil natif ou dépendance obligatoire absent — consultez la source puis préparez de nouveau.": "Native profile or required dependency missing — read the source then prepare again.",
  "Runtime local ou résolveurs épinglés non vérifiés — consultation et copie restent distinctes ; relisez la fiche avant une nouvelle préparation.": "Local runtime or pinned resolvers unverified — reading and copying remain separate; reread details before preparing again.",
  "Ce mode ou cette opération n’est pas admis par le profil natif ; aucune permission ajoutée.": "This mode or operation is not admitted by the native profile; no permission added.",
  "La source gagnante, ses octets ou ses personnalisations ne correspondent pas au profil natif admis. Consultez la source puis préparez de nouveau.": "The winning source, its bytes or customizations do not match the admitted native profile. Read the source then prepare again.",
  "Préparation périmée — actualisez les aides avant de demander BMad.": "Preparation stale — refresh help before asking BMad.",
  "Arrêt de l’outil local ou de Codex non confirmé — nouveaux échanges bloqués.": "Local tool or Codex stop not confirmed — new exchanges blocked.",
  "Une activité possède déjà les outils locaux. Réessayez après sa fin.": "An activity already owns local tools. Retry after it ends.",
  "Lecture locale impossible — le travail précédent est conservé.": "Local reading failed — previous work is kept.",
  "Envoyé, conservation locale non confirmée — réessayez uniquement l’enregistrement.": "Sent, local persistence not confirmed — retry saving only.",
  "Lecture des aides conservées impossible ; les fichiers existants sont préservés.": "Saved help could not be read; existing files are preserved.",
  "Copie impossible — sélectionnez le texte.": "Could not copy — select the text.",
  "Les outils locaux sont occupés ; la lecture attend leur libération.": "Local tools are busy; reading awaits their release.",
  "Arrêt non confirmé — récupération requise.": "Stop not confirmed — recovery required.",
  "Inventaire indisponible — lecture locale refusée ou périmée. Les données précédentes restent historiques.": "Inventory unavailable — local reading refused or stale. Previous data remain historical.",
  "La fiche est inconnue ou périmée ; actualisez le catalogue.": "Skill details unknown or stale; refresh the catalogue.",
  "Sélection locale illisible ou de version inconnue — fichier préservé ; choix de session seulement.": "Local selection unreadable or unknown version — file preserved; session choice only.",
  "Choix conservé pour cette session — annexe illisible préservée.": "Choice kept for this session — unreadable annex preserved.",
  "Choix conservé pour cette session — enregistrement échoué. Réouverture non garantie.": "Choice kept for this session — save failed. Reopening not guaranteed.",
  "Sources modifiées pendant la lecture — nouvelle lecture requise.": "Sources changed while reading — read again.",
  "Une activité possède déjà les outils locaux.": "An activity already owns local tools.",
  "Lecture périmée ou refusée — actualisez les initiatives. Le choix précédent est conservé.": "Reading stale or refused — refresh initiatives. Previous choice kept.",
  "Choisissez une initiative valide ; la sélection précédente et les preuves anciennes sont conservées.": "Choose a valid initiative; previous selection and historical evidence are kept.",
  "Lecture locale refusée ou périmée — les preuves précédentes restent historiques.": "Local reading refused or stale — previous evidence remains historical.",
  "Limite technique du reçu de fichiers — aperçu indisponible pour cette observation. Le catalogue et les preuves restent consultables.": "File receipt technical limit — preview unavailable for this observation. Catalogue and evidence remain available.",
  "Configuration invalide: core doit être une table TOML.": "Invalid configuration: core must be a TOML table.",
  "Configuration core invalide.": "Invalid core configuration.",
  "Identifiant initiative active non représentable — contexte inconnu.": "Active initiative identifier cannot be represented — context unknown.",
  "Contexte requis invalide: initiative active": "Invalid required context: active initiative",
  "BMad configuration absent": "BMad configuration absent",
  "Native bmad skill/help source not qualified for this profile": "Native bmad skill/help source not qualified for this profile"
 }
} as const
const runtimeDiagnostic = {
 "SKILL source missing or refused": {
  "fr": "Source SKILL absente ou refusée",
  "en": "SKILL source missing or refused"
 },
 "Reciprocal module membership not established": {
  "fr": "Appartenance réciproque au module non établie",
  "en": "Reciprocal module membership not established"
 },
 "Exact SKILL name does not match winning folder": {
  "fr": "Le nom exact de SKILL ne correspond pas au dossier prioritaire",
  "en": "Exact SKILL name does not match winning folder"
 },
 "Folder name has no qualified exact invocation": {
  "fr": "Le nom du dossier ne possède pas d’invocation exacte qualifiée",
  "en": "Folder name has no qualified exact invocation"
 },
 "General launch is not qualified for this profile": {
  "fr": "Lancement général non qualifié pour ce profil",
  "en": "General launch is not qualified for this profile"
 },
 "BMad configuration absent": {
  "fr": "Configuration BMad absente",
  "en": "BMad configuration absent"
 },
 "Native bmad skill/help source not qualified for this profile": {
  "fr": "Source de compétence/aide bmad native non qualifiée pour ce profil",
  "en": "Native bmad skill/help source not qualified for this profile"
 },
 "CATALOG_DETAILS_UNKNOWN": {
  "fr": "Fiche inconnue",
  "en": "Unknown details"
 }
} as const
const diagnosticPrefixes = [
 {original:'Analyse locale indisponible ou refusée : ',fr:'Analyse locale indisponible ou refusée : ',en:'Local analysis unavailable or refused: '},
 {
  "original": "Aide indisponible (fichier non chargé): ",
  "fr": "Aide indisponible (fichier non chargé) : ",
  "en": "Help unavailable (file not loaded): "
 },
 {
  "original": "Configuration invalid: ",
  "fr": "Configuration invalide : ",
  "en": "Invalid configuration: "
 },
 {
  "original": "Configuration structure invalid: ",
  "fr": "Structure de configuration invalide : ",
  "en": "Invalid configuration structure: "
 },
 {
  "original": "Configuration output refused: ",
  "fr": "Sortie de configuration refusée : ",
  "en": "Configuration output refused: "
 },
 {
  "original": "Contexte requis indisponible: ",
  "fr": "Contexte requis indisponible : ",
  "en": "Required context unavailable: "
 },
 {
  "original": "Active initiative absent: ",
  "fr": "Initiative active absente : ",
  "en": "Active initiative missing: "
 },
 {
  "original": "Marqueur ancien observé (présence seulement, contenu non lu): ",
  "fr": "Marqueur ancien observé (présence seulement, contenu non lu) : ",
  "en": "Legacy marker observed (presence only, content not read): "
 },
 {
  "original": "Présence ancienne indéterminée: ",
  "fr": "Présence ancienne indéterminée : ",
  "en": "Legacy presence undetermined: "
 },
 {
  "original": "Configuration: ",
  "fr": "Configuration : ",
  "en": "Configuration: "
 },
 {
  "original": "Native profile version not qualified: ",
  "fr": "Version du profil natif non qualifiée : ",
  "en": "Native profile version not qualified: "
 },
 {
  "original": "Configuration refusée: ",
  "fr": "Configuration refusée : ",
  "en": "Configuration refused: "
 },
 {
  "original": "Sortie refusée: ",
  "fr": "Sortie refusée : ",
  "en": "Output refused: "
 },
 {
  "original": "Source initiative absente: ",
  "fr": "Source d’initiative absente : ",
  "en": "Initiative source missing: "
 },
 {
  "original": "Identifiant initiative non représentable: ",
  "fr": "Identifiant d’initiative non représentable : ",
  "en": "Initiative identifier cannot be represented: "
 },
 {
  "original": "FILE_COUNT_LIMIT: ",
  "fr": "Limite du nombre de fichiers : ",
  "en": "File count limit: "
 },
 {
  "original": "Source non chargee: ",
  "fr": "Source non chargée : ",
  "en": "Source not loaded: "
 },
 {
  "original": "Declaration non scalaire: ",
  "fr": "Déclaration non scalaire : ",
  "en": "Non-scalar declaration: "
 },
 {
  "original": "Declaration hors limite: ",
  "fr": "Déclaration hors limite : ",
  "en": "Declaration exceeds limit: "
 },
 {
  "original": "Statut inconnu conserve: ",
  "fr": "Statut inconnu conservé : ",
  "en": "Unknown status retained: "
 },
 {
  "original": "Section non chargee integralement (limite): ",
  "fr": "Section non chargée intégralement (limite) : ",
  "en": "Section not fully loaded (limit): "
 },
 {
  "original": "Identite native inconnue; reference de fichier conservee: ",
  "fr": "Identité native inconnue ; référence de fichier conservée : ",
  "en": "Native identity unknown; file reference retained: "
 },
 {
  "original": "Reference orpheline ou identite inconnue: ",
  "fr": "Référence orpheline ou identité inconnue : ",
  "en": "Orphaned reference or identity unknown: "
 },
 {
  "original": "Portee documentaire de conteneur partielle: ",
  "fr": "Portée documentaire du conteneur partielle : ",
  "en": "Partial container document scope: "
 },
 {
  "original": "Provenance detaillee des entrees non etablie: ",
  "fr": "Provenance détaillée des entrées non établie : ",
  "en": "Detailed entry provenance not established: "
 },
 {
  "original": "Identite entree inconnue: ",
  "fr": "Identité d’entrée inconnue : ",
  "en": "Entry identity unknown: "
 },
 {
  "original": "Entrees dupliquees: ",
  "fr": "Entrées dupliquées : ",
  "en": "Duplicate entries: "
 },
 {
  "original": "Ligne de declaration non etablie: ",
  "fr": "Ligne de déclaration non établie : ",
  "en": "Declaration line not established: "
 },
 {
  "original": "TOML invalide: ",
  "fr": "TOML invalide : ",
  "en": "Invalid TOML: "
 },
 {
  "original": "Feuilles dupliquees: ",
  "fr": "Feuilles dupliquées : ",
  "en": "Duplicate leaves: "
 },
 {
  "original": "Plans dupliques conserves: ",
  "fr": "Plans dupliqués conservés : ",
  "en": "Duplicate plans retained: "
 },
 {
  "original": "Plan orphelin conserve: ",
  "fr": "Plan orphelin conservé : ",
  "en": "Orphaned plan retained: "
 },
 {
  "original": "Conteneur non etabli: ",
  "fr": "Conteneur non établi : ",
  "en": "Container not established: "
 },
 {
  "original": "Conteneur refuse: ",
  "fr": "Conteneur refusé : ",
  "en": "Container refused: "
 },
 {
  "original": "DOCUMENT_DEPTH_LIMIT: ",
  "fr": "Limite de profondeur documentaire : ",
  "en": "Document depth limit: "
 },
 {
  "original": "Dossier documentaire refuse: ",
  "fr": "Dossier documentaire refusé : ",
  "en": "Document folder refused: "
 },
 {
  "original": "Document canonique non retrouve: ",
  "fr": "Document canonique non retrouvé : ",
  "en": "Canonical document not found: "
 },
 {
  "original": "Portee documentaire partielle: ",
  "fr": "Portée documentaire partielle : ",
  "en": "Partial document scope: "
 },
 {
  "original": "Portee documentaire v7 partielle: ",
  "fr": "Portée documentaire v7 partielle : ",
  "en": "Partial v7 document scope: "
 },
 {
  "original": "Portee tickets partielle: ",
  "fr": "Portée des tickets partielle : ",
  "en": "Partial ticket scope: "
 }
] as const
export type ProductSlot=keyof typeof owned
export function presentProductText(slot:ProductSlot,original:string|null|undefined,language:Language):string{
 if(!original)return ''
 if(slot==='diagnostic'){
  const known=runtimeDiagnostic as Readonly<Record<string,{fr:string;en:string}>>
  if(Object.hasOwn(known,original))return known[original][language]
  const missingOutput='Contexte requis indisponible: sortie absente pour initiative active '
  if(original.startsWith(missingOutput))return (language==='fr'?'Contexte requis indisponible : sortie absente pour l’initiative active ':'Required context unavailable: output missing for active initiative ')+original.slice(missingOutput.length)
  for(const prefix of diagnosticPrefixes)if(original.startsWith(prefix.original))return prefix[language]+original.slice(prefix.original.length)
  const member=original.match(/^([A-Za-z0-9_.-]{1,255}): (missing registered skill|contradictory membership|missing dependency|missing) (.+)$/)
  if(member){const labels:Record<string,{fr:string;en:string}>={'missing registered skill':{fr:'compétence déclarée absente',en:'missing registered skill'},'contradictory membership':{fr:'appartenance contradictoire',en:'contradictory membership'},'missing dependency':{fr:'dépendance absente',en:'missing dependency'},missing:{fr:'absent',en:'missing'}};return member[1]+': '+labels[member[2]][language]+' '+member[3]}
  const required=original.match(/^([A-Za-z0-9_.-]{1,255}): invalid required_skills$/);if(required)return required[1]+(language==='fr'?': required_skills invalide':': invalid required_skills')
  const purpose=original.match(/^([A-Za-z0-9_.-]{1,255}): purpose syntax absent or unknown$/);if(purpose)return purpose[1]+(language==='fr'?': syntaxe d’objectif absente ou inconnue':': purpose syntax absent or unknown')
  const missingRecord=': SKILL without BMad skill record (not a host capability)';if(original.endsWith(missingRecord))return original.slice(0,-missingRecord.length)+(language==='fr'?': SKILL sans déclaration BMad (aucune capacité hôte)':missingRecord)
 }
 const table:Readonly<Record<string,string>>=owned[slot]
 if(original==='HELP_BRIDGE_READ_FAILED'&&slot==='diagnostic')return language==='fr'?'Lecture des aides conservées impossible.':table[original]
 if(Object.hasOwn(table,original))return language==='fr'?original:table[original]
 if(slot==='diagnostic')for(const section of ['errors','dialogueErrors','connectionErrors'] as const){
  const source:Readonly<Record<string,string>>=fr[section],target:Readonly<Record<string,string>>=en[section]
  if(Object.hasOwn(target,original))return language==='fr'?source[original]:target[original]
  for(const [code,value] of Object.entries(source))if(value===original)return language==='fr'?original:target[code]
 }
 if(slot==='activity'&&original.startsWith('Forge natif · '))return (language==='fr'?'Forge natif · ':'Native Forge · ')+original.slice('Forge natif · '.length)
 if(slot==='library')return presentProductText('diagnostic',original,language)
 return (language==='fr'?'Détail technique non traduit — ':'Untranslated technical detail — ')+original
}
