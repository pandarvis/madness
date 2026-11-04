---
title: "Établir le port d'analyse et GraphSnapshot du cœur"
type: 'feature'
ticket: 3
created: '2026-11-04'
status: 'built'
baseline_revision: 'e7713cc9c56d48bc7366be04a02afe4dd0fe5b73'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/handoff.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/schema-profile.json'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/profil-g5.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le graphe réel et son UX sont qualifiés/précisés, mais aucun contrat commun ne permet encore au cœur d'admettre des résultats sans confusion de projet, format ou fraîcheur. Brancher directement l'export tiers à la UI propagerait ses références et états sans autorité commune.

**Approach:** Établir des modules isolés du cœur : GraphSnapshot versionné, commandes/événements/erreurs et port d'analyse déclaratif, validation et règles pures d'admission/publication/restauration. Vérifier ces règles en banc de contrats avant leur raccordement unique en4.4.

## Boundaries & Constraints

**Always:** AD-10 et UX4.2 gouvernent ; snapshot lié à projet/racine/périmètre/analyse/révision des sources, comprenant les modifications non commitées. Profil4.1 exact, sens et provenance préservés, niveaux EXTRACTED/INFERRED/AMBIGUOUS et score distinct, fichiers/lignes connus ou inconnus explicites. Axes activité/résultat/couverture/fraîcheur/conservation séparés, dernier complet identifiable. Admission comparée à un contexte attendu détenu par le cœur, pas aux seules déclarations du candidat ; aucun résultat étranger/tardif ne remplace l'affichage courant. Restauration et lecture ne démarrent ni analyse, agent, connexion ou écriture. Données de sortie indépendantes des objets entrants.

**Never:** Modifier fichiers existants des contrats/cœur/coordinator/store, leurs barrels, Main/preload/renderer, ressources/pins/package/configuration, architecture/spines/UX4.2/profil4.1 ou profil personnel. Aucun adaptateur Graphify, décodage natif de production, CLI/processus, réseau/modèle/OAuth/JWKS, second coordinateur/stockage, IPC câblé ou UI. Ne pas assimiler forme valide à confinement filesystem, fraîcheur actuelle, résultat durable, arrêt physique ou G5 intégré. Aucun plafond de graphe arbitraire ni montant/coût inventé.

## I/O & Edge-Case Matrix

| Cas | Entrée / état | Résultat attendu du banc pur | Refus / limite |
|---|---|---|---|
| C1 nominal | Snapshot normalisé versionné et contexte/corpus attendu connus | Admission fidèle, identités exactes, nœuds/relations/references/sens/confidence conservés et copie indépendante | Pas de JSON/HTML natif accepté comme contrat UI ou de certitude ajoutée |
| C2 identités | Autre projet/racine/périmètre/analyse/révision, ancienne réponse datée plus récemment | Refus de publication au contexte courant et ancien résultat préservé ; graphes indépendants des initiatives de consultation | IDs opaques, révision numérique de sélection et empreinte source non confondues ; l'horloge ne fait pas autorité |
| C3 formes | Version/profil/schéma incompatibles, discriminants/valeurs absents/invalides, doublons et endpoints absents, objets malformés/cycliques | Résultat de validation contrôlé et erreurs stables/localisables, sans exception non gérée, coercition ou mutation d'entrée | Format inconnu ou payload natif refusé ; pas de promesse de sandbox contre objets JS actifs |
| C4 sources/incertitudes | Références relatives du corpus, hors portée/absolues/traversantes/liées déclarées, ligne absente/invalidée, score0.85/booléen/non fini et confiance inconnue | Seules références et lignes attestées admissibles ; inconnus conservés ; sens orienté et trois niveaux distincts, score non probabiliste | Validation structurelle ne prouve pas existence/canonicalité/disque ; fait fichier/corpus attendu vient de son propriétaire qualifié |
| C5 publication | Nouveau complet, partiel/échec/incompatible, mutation pendant collecte, ancienne analyse tardive | Dernier complet conservé sauf nouveau complet admis du même contexte ; partiel consultable séparément, mutation jamais actuelle | Admission, résultat observé et persistance réussie distincts ; pas de promotion par lecture/navigation |
| C6 restauration | Valeurs sauvegardées valides/incompatibles, ancienne tentative active ou arrêt inconnu | Projection passive validée, état historique/fraîcheur non revalidée et issue incertaine gardées ; zéro intention de lancement/rejeu | Nouveau départ concerné reste gardé sur arrêt inconnu, sans contourner les gardes globales du propriétaire existant |
| C7 commandes/port | Demandes explicites et événements corrélés, mauvais discriminant/corrélation, abonné/effet factice | Déclarations v1 et validations cohérentes ; pure policy consomme contexte attendu/ordre détenus par le cœur | Le port n'a aucun exécuteur concret, propriétaire de Job ou storage ; contrats seuls ne valent autorisation humaine ou effet réel |
| C8 isolation | Mutation du candidat/retour après validation et répétition de décisions pures | Aucune altération croisée de snapshots, entrées ou dernier complet ; résultats déterministes pour mêmes faits | Aucun appel I/O/port/modèle lors des validations/restaurations, pas d'état métier global parallèle |

</frozen-after-approval>

## Code Map

- Nouveaux `src/contracts/bmad-graph.ts`, `src/core/bmad-graph.ts`, `src/core/bmad-graph-port.ts` : chemins absents au relevé explorer graph43_core_map. Contrat/guards de données normalisées, politique pure d'admission/publication/restauration, interface de port d'analyse propre. Le module contrats demeure consommable sans API Node spécifique ; les politiques sont pures, sans accès disque. Import direct entre nouveaux modules, sans ajout aux anciens barrels/ports ni instanciation dans application.ts. Le renderer futur ne reçoit pas le payload tiers ;4.5 possède décodage/normalisation amont,4.4 les raccordements.
- Références lecture seule `src/contracts/bmad-context.ts`5/6/14 : BmadContextObservation (projectId/rootPath/rootIdentity/revision), BmadSelection ajoute initiative et révision numérique, contextId limite les IDs applicatifs ; ne pas appliquer aveuglément cette limite à tous les identifiants du tiers. `contracts/index.ts`6/12/24/25 : ContextRef nullable insuffisant seul ; Reply/DomainEvent et outcome failed/unknown, isRecord/isCorrelationId réutilisables avec leurs limites.
- `src/contracts/bmad-progress.ts`8/22–28 : précédent version/snapshot/clé exactes/SHA/uniques/références/cohérence. Helpers locaux privés : ne pas exporter/modifier pour le graphe. isRecord n'assure pas objet JSON simple ; validators par JSON.stringify peuvent jeter sur cycles/getters. Le nouveau validateur doit retourner un refus contrôlé sur entrées malformées/cycliques sans les convertir par sérialisation aveugle ni invoquer leurs getters volontairement. Les objets JS actifs/proxies ne constituent pas un format ou une sandbox revendiqués.
- `src/core/bmad-progress.ts`19/33–37 : copie en lecture, identité/génération/destination avant publication et conservation de snapshot en erreur ; `core/application.ts`35 et `core/bmad-help.ts`15 : restauration passive/pending→unknown. Réutiliser principes, pas sélection d'initiative du projet comme identité du graphe. Cohérence Windows : canonicalité attendue provenant du propriétaire projet, ne pas déduire confinement filesystem d'une comparaison de chaîne. `core/ports.ts`19 montre read/command/subscribe en lecture seule, aucune modification.
- Profil4.1 et UX E1–E8/H1–H6 déjà chargés : vendor0.9.101/schema1 clusterisé, raw non estampillé refusé, _src/_tgt ensemble puis source→target malgré directed:false avant normalisation, INFERRED0.85 reste déduit ; lignes absentes/inconnues sans plage devinée. Le contrat normalisé exprime le sens reçu sans demander au renderer de décoder ces champs natifs. Un fait source reconnu est confronté au corpus attendu vérifié, pas à une liste auto-déclarée dans l'artefact. Les captures/mutations/Jobs natifs restent ceux de4.1, pas une preuve du présent banc pur.
- Nouveau `tests/bmad-graph.test.mjs` et si utile `tests/fixtures/bmad-graph/` : Node test/assert strict/imports directs .ts, données et ports factices. Modèle connu normalisé fidèlement avec provenance de fixture et variantes C1–C8 ; aucun Graphify ou projet réel lu/exécuté par ces tests. Précédent `tests/bmad-progress.test.mjs`. Les globs tsconfig.node incluent déjà les nouveaux modules, npm test inclut le nouveau .test.mjs : pas de config/package/lock à éditer.
- Nouveau `contrat-graphe/{handoff.md,verification.*}` sous cet epic : schéma/publication/passivité, sémantique des champs/versions/erreurs, points à brancher en4.4/4.6/4.7 et limites. Décrire données projet/corpus/arrêt vérifiées à fournir par les propriétaires actuels ; ces déclarations seules n'établissent pas les faits physiques. Avant code, suivre TDD applicable sur ce périmètre pur ; un seul implémenteur exécute le plan approuvé, pas de nouvelle invocation Build imbriquée.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/bmad-graph.ts` — définir contrat normalisé versionné, identités/couverture/fraîcheur/provenance/références/confiance et enveloppes commandes/événements/erreurs ; guards stricts et sûrs aux frontières, sans payload tiers ni changement d'anciens contrats.
- [x] `src/core/bmad-graph.ts`, `bmad-graph-port.ts` — règles pures d'admission/publication/restauration et port déclaratif, confrontés au contexte attendu/corpus/ordre détenus par le cœur. Préserver dernier complet, inconnu et copies ; aucune I/O, exécution, subscription réelle ou stockage nouveau.
- [x] `tests/bmad-graph.test.mjs`, fixtures éventuelles — exécuter C1–C8, premier échec comportemental puis vert, aucun cas sauté. Altérer identités/formes/références/confidence/ordre et mutation d'objets ; prouver restauration sans appel d'un moteur factice ni commande dérivée. Ne pas se limiter à l'existence de types/interfaces.
- [x] `contrat-graphe/handoff.md`, `verification.*` — documenter consommateur4.4 et propriétaires de données/effets, commande/versions/erreurs, limites du banc et raccordements différés. Vérifier tests/types/build et empreintes des anciens fichiers ; audit indépendant high des frontières/publication puis Quick/rechecks sous autorité parent, avant commit local.

**Acceptance Criteria:**
- Given un snapshot normalisé connu et les faits attendus d'un projet, when le cœur l'admet et l'expose, then les données restent fidèles/indépendantes et toute variante étrangère, incohérente ou hors profil est refusée sans effet.
- Given des tentatives complètes/partielles/anciennes ou arrêtées, when les règles pures de publication/restauration s'appliquent, then dernier complet, fraîcheur et résultat connu/inconnu restent distincts et aucune relance/durabilité/validation humaine n'est inventée.
- Given les nouveaux modules et le banc, when4.4 les consomme, then il dispose des contrats/guards/port et des points de raccordement testés, sans modification d'un fournisseur existant ni preuve d'intégration/arrêt physique/G5 déduite.

## Implementation Notes

Trois nouveaux modules isolés, banc pur C1–C8 et fixture partielle statique liée au témoin4.1 ; aucun raccordement. Versions/identités/corpus attendu, formes sûres, inconnus et copies indépendantes ; dernier complet admis seulement au terminal corrélé, sources recontrôlées. Restauration passive et port déclaratif sans I/O ou commande produite.

TDD rouge→vert conservé. H1 logique failed/incompatible corrigé par le même implémenteur, puis recontrôlé résolu par le même auditeur high ; BUSY reste jusqu'à l'arrêt connu. Parent final67/67, zéro skip, deux typechecks/build exit0.4446anciens fichiers identiques. La suite globale accidentelle97176 est terminée exit1(514/525), sources changées après son départ : diagnostic historique séparé, pas de vert global final. Preuves/remise dans contrat-graphe. Aucun stop physique, sauvegarde, paquet, UI, G5 ou acceptation humaine déduit.

## Plan Change Log

## Review Triage Log

- Q1 — medium / patch. src/core/bmad-graph.ts:102 : progress/unknown-stop with independently known changed sources retains observed freshness of current-attempt result. parent pure reproduction result→progress with sourceState changed: freshness observed unchanged; branches traced beyond result/complete terminal. Plus petit correctif sans surface publique, état démontré ; même implémenteur puis même Quick recontrôle résolu, parent67/67/types/build0.

- Q2 — medium / patch. src/contracts/bmad-graph.ts:247 : complete/partial outcome can restore a snapshot from a different analysis/source revision than activity. parent normal completed state then changing result.snapshot.identity.analysisId alone passes validateGraphState and restoreGraphState; only scope matched. Plus petit correctif sans surface publique, état démontré ; même implémenteur puis même Quick recontrôle résolu, parent67/67/types/build0.

- H1 — medium / patch. core/bmad-graph.ts87–99 : après failed(ANALYSIS_FAILED/INCOMPATIBLE), phase running garde correctement BUSY mais result tardif efface l’erreur ; stopped complete peut alors promouvoir lastComplete. Flux parent relu et reproduction Node pure indépendante confirmée. Plus petit correctif : garder l’échec logique verrouillé pour cette tentative, sans inventer arrêt physique, ni nouveau contrat public. Même implémenteur puis même auditeur : résolu sur empreintes finales ; deux séquences rouges devenues vertes, BUSY/arrêt et nouvelle tentative explicite préservés.

## Design Notes

Un seul but : frontière commune sûre pour le graphe, sans intégration. Route full (modules/types/tests dépassent100lignes) et risque high du ticket conservé : résultat ou fichier du mauvais projet pourrait tromper ou exposer le porteur à l'intégration. Aucun seuil de tokens. Tous checkpoints et choix techniques nécessaires sont délégués par le mandat humain d'autonomie complète ; aucun entretien répété, nouvelle question Zscaler, modèle ou donnée personnelle requis. Aucune acceptation humaine G4/G5 ne découle de cette délégation.

Racine réelle C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness ; exec avec workdir absolu et require_escalated, cwd hôte atelier-ui obsolète. Branche codex/bmad-initiatives-2-3 cohérente, HEAD e7713cc9c56d48bc7366be04a02afe4dd0fe5b73 ; plans4.1/4.2 built et mêmes spines inchangés. Le test tracked bmad-help-boundaries.test.mjs sans diff de contenu, managed caches et anciens untracked restent hors lot ; préserver, aucun reset/revert/staging/commit. Tu n'es pas seul : ownership worker uniquement nouveaux fichiers src/contracts/bmad-graph.ts, src/core/bmad-graph.ts, src/core/bmad-graph-port.ts, tests/bmad-graph.test.mjs, tests/fixtures/bmad-graph et contrat-graphe, plus Implementation Notes ; parent possède header/gel/statuts/revues/commit. Pas d'autre code/UI/runtime/config à toucher.

Les interfaces du port sont la séparation de dépendance, pas un nouveau service d'orchestration. La policy pure ne prouve ni activité réelle, ni contrôle de racine sur disque, ni sauvegarde ;4.4 joint ces décisions aux gardes du coordinateur/store existants et aux fournisseurs2.8/2.14/3.9,4.6/4.7 aux observations de fraîcheur et cycle de vie réels. Fenêtre/projet ou graphes changés ne s'associent jamais par nom ou date seuls. Les inconnus sont des valeurs métier explicites, pas des champs invalides arbitrairement réparés.

## Verification

**Commands:**
- `node --test tests/bmad-graph.test.mjs` — C1–C8 réellement exécutés, tous passent sans skip, altérations refusées et passivité/copies observées.
- `npm run typecheck` — deux configurations strictes passent, nouveaux modules inclus sans modification des anciennes déclarations.
- `npm run build` — compilation Electron habituelle passe sans consommation/effet du nouveau port ; aucun NSIS ou lancement d'application requis pour des modules non câblés.
- Audit de diff/empreintes des fichiers existants et des artefacts4.1/4.2 — seuls nouveaux fichiers possédés et Implementation Notes ont changé chez le worker ; conservations réelles, pas reset d'autrui. Aucune suite native/compte/réseau ou installation nécessaire ici.
