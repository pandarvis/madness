---
title: "Établir le contrat d’opération d’initialisation sous l’autorité du cœur"
type: 'feature'
ticket: '3'
created: '2026-11-05'
status: 'built'
baseline_revision: 'a3030287c98dfff0a1b30cc5cb6d913543491ef5'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '_bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation/profil-g3.md'
---

<frozen-after-approval reason="mandat explicite d’autonomie complète, checkpoints délégués">

## Intent

**Problem:** L’UX et le profil d’initialisation existent, mais le cœur n’a pas de contrat propre pour relier un plan exact, ses préconditions et un accord ponctuel. Les permissions Mary et une simple charge JSON ne peuvent pas autoriser ces effets.

**Approach:** Ajouter un contrat versionné et son admission/transitions sous autorité du cœur, derrière des ports hôtes injectés. Un banc de doubles démontre accord exact, invalidations, résultats et restauration passive ; le tracer3.4 branchera ensuite la voie produit réelle.

## Boundaries & Constraints

**Always:** Plan/opération/préconditions/accord/résultat ont des identités capturées concordantes : projet/racine physique/parent, contexte/révision, profil/source/payload et tentative/génération. Manifeste exhaustif des ajouts, paramètres matérialisés, données préservées et limites consultables ; données affichables séparées des capacités privées d’exécution. Un validateur ou DTO cloné/restauré ne crée aucune autorité. Accord explicite ponctuel, relire les préconditions au point d’effet ; fermeture/refus/annulation avant accord rend l’ancien plan historique et exige préparation nouvelle selon3.2. Aucune mutation/appel tardif n’est réattribué au projet actif. Succès vérifié, échec avant effet prouvé, partiel/inconnu et conservation sont distincts ; Promise/exit0/objet JSON ne suffisent pas à prouver réussite ou arrêt. Restaurer ne relance rien et ne réactive aucun accord. Réutiliser les propriétaires de contexte/cycle de vie/persistance ; annexe future indépendante de Snapshotv1.

**Never:** Initialiser réellement un projet, exécuter Skills/setup/Node enfant/uv/modèle/réseau ou fabriquer une preuve native. Aucun adaptateur fichier/processus/persistance réel, Main/preload/renderer/ressource/paquet/auth/profil personnel nouveau ; ils restent aux stories3.4/3.6/3.7. Ne pas étendre les approbations Mary .agents/_bmad/50fichiers/100K ni les contrats Graph existants pour contourner leur portée. Aucun second coordinateur global, chemin renderer libre comme pouvoir d’écriture, reprise d’effet incertain, rollback promis ou G2–G5 déclaré acquis. Pas de campagne globale/Electron/éditeur/native/NSIS/captures : tests de ce contrat et types seulement, aucun installateur pour ce lot.

## I/O & Edge-Case Matrix

| Cas | Entrée/état | Comportement attendu | Refus/limite |
|---|---|---|---|
| C1 données | DTOv1 complet puis version/champs/prototype/getter/cycle/valeur invalides | Données validées/détachées ; charge invalide refusée sans appeler le port d’effet | Forme correcte ne signifie pas autorité ou succès vérifié |
| C2 plan exact | Manifeste répertoires/fichiers et identité/préconditions/source/payload | Plan capturé immuable/détaché, tous ajouts identifiables ; contenu consultable via données ou port détenu | Traversée/absolu/ambiguïté/collision de chemins Windows et manifeste incohérent refusés ; pas d’inventaire tronqué |
| C3 accord | Plan courant original et même contexte, confirmation explicite | Autorisation ponctuelle liée au plan exact, effet de double admis seulement après recontrôle correspondant | Aucun accord issu d’une validation JSON seule |
| C4 mutation | Autre projet/racine/parent/profil/payload/révision ou plan changé entre préparation/accord/effet | Refus avant port d’effet, plan périmé/inactif et préparation nouvelle | Une vérification de configuration ne remplace pas l’arbre exhaustif de l’hôte futur |
| C5 fermeture/refus | Plan prêt fermé, annulé ou refusé puis ancien accord rejoué | Historique sans autorité, nouvelle préparation explicite ; aucun effet | Pas de réactivation par relire/copie/restauration |
| C6 doublon/tardif | Même cible physique, accord consommé, ancienne génération/événement d’un autre contexte | Pas de second effet ni file automatique ; observations conservées sous bonne identité ou refusées | Pas de réattribution au projet sélectionné après coup |
| C7 résultat | Fait hôte admissible puis copie/charge étrangère et fin ambiguë après effet possible | Seul fait original corrélé aux attentes peut produire résultat vérifié ; sinon partiel/inconnu, échec sans effet seulement si attesté | Promise résolue/exit0 ne deviennent pas preuve d’arrêt ni de l’union cible/payload |
| C8 conservation | Données durables restaurées ou échec de sauvegarde puis retry | État passif/historique, résultat et conservation séparés ; retry stockage seul, zéro application/accord/inspection automatique | Aucune implémentation du stockage réel ou reconstitution d’effet |

</frozen-after-approval>

## Code Map

- `src/contracts/bmad-initialization.ts` à créer : typesDTO versionnés, erreurs/états/préconditions/plan/opération/résultat, validations et ports métier. Suivre exact-shape/copiedonnées de `src/contracts/bmad-graph.ts` (copyData privé, ne pas l’exporter/coupler à GraphSnapshot) et `src/contracts/bmad-context.ts`. Garder champs inconnus/getters/cycles/prototypes non admis, noms de chemins et données projet non traduits. Validation syntaxique != preuve physique.
- `src/core/bmad-initialization.ts` à créer : autorité originale privée, admission et transitions/coordination isolées sur ports doubles, faits attendus détenus séparément. Réemployer le principe WeakMap de `src/adapters/analysis/graphify.ts` et accept(original,producer) de `src/core/project-files.ts` ; pas de propriété booléenne/symbole sérialisable comme seul sceau. Le renderer futur ne détient que DTO/ids, Main/cœur retrouveront leur capacité privée correspondante ; ne pas exiger qu’une copie IPC transporte une autorité originale.
- `src/core/bmad-context.ts` : capture(id,false,signal) permet l’absence d’initiative ; assertFresh recontrôle configuration/racine/révision, mais pas tout l’inventaire cible/parent/payload. Le port d’initialisation distingue ce recontrôle exhaustif de celui de configuration. Réutiliser types/abstractions existants ; modifier ces modules partagés seulement si une vraie lacune minimale l’impose, jamais pour rendre une charge étrangère admissible.
- `src/core/bmad-graph.ts` : beginGraphAttempt/publishGraphEvent/restoreGraphState illustrent génération/ordre/faits attendus/restauration passive. `src/core/lifecycle.ts` possède ActivityAdmission.enter('helper'), block et LifecycleCoordinator register/complete/shutdown ; définir raccordement à ce propriétaire, aucun coordinateur concurrent. `src/adapters/analysis/graph-owned-run.ts` illustre preuve d’arrêt originale, jamais déduite d’un DTO.
- `src/adapters/persistence/graph-store.ts` : modèle d’annexe CAS/version/temporaire exclusif/sync/rename ; définir le port et les statuts de conservation maintenant, son adaptateur réel en3.6. Snapshotv1, comptes, conversations et brouillons inchangés.
- `tests/bmad-initialization-contract.test.mjs` à créer : doubles hôtes sans effets fichiers/processus ; style de tests `bmad-graph.test.mjs`, `project-files.test.mjs`, `lifecycle.test.mjs`. Tous C1–C8 doivent être couverts par comportement réellement exécuté, sans lancer ces autres suites inchangées.
- [UX3.2](../../../ux-madness/EXPERIENCE.md#epic3-initialisation) : phases préparation privée/plan/accord/application/contrôle et13états ; fermeture avant accord exige préparation nouvelle, inspection après incertitude volontaire, conservation indépendante. [Profil3.1](../qualification-initialisation/profil-g3.md) : source locale6.13.0-next v7-shaped,27compétences+3records, ajouts seulement, lock privé exclu, pas de transaction/rollback/concurrence native universels qualifiés.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/bmad-initialization.ts` — définir et valider la frontière métier complète pour le plan exact, accord, résultat et conservation/inspection ; inclure ports d’hôte et raccordements, sans natif réel. Données seules restent inertes.
- [x] `src/core/bmad-initialization.ts` — lier les capacités originales et les états/événements au contexte/tentative ; recontrôle avant effet, accord consommé, fermeture/péremption/historique et restauration passive. Doubles seulement pour l’hôte, aucun effet nouveau intégré.
- [x] `tests/bmad-initialization-contract.test.mjs` — vérifier C1–C8 avec compteurs d’appels/identités et charges hostiles ; absence d’effet sur refus/restauration et succès uniquement via faits admissibles, y compris mutation des objets après admission.
- [x] `qualification-contrat-initialisation/parent-verification.md` — bref relevé commandes/résultats/matrice et limites de cette preuve isolée ; pas de gros harnais ou duplication des historiques. Parent complète revues/commit.

**Acceptance Criteria:**
- Given un plan préparé par un hôte double admissible, when le même contexte l’approuve puis ses préconditions sont recontrôlées, then le seul effet attendu est déclenché une fois ; changer plan/contexte/préconditions ou cloner l’autorité interdit cet effet.
- Given fermeture/refus/doublon ou restauration de données, when un accord ancien ou événement tardif revient, then l’historique garde son identité sans autorité ni relance, et une nouvelle intention nécessite une préparation explicite.
- Given fin ambiguë ou stockage échoué, when le résultat est lu ou la sauvegarde retentée, then l’inconnu et la conservation restent distincts sans réapplication ; les gardes Mary et le produit non raccordé sont inchangés.

## Implementation Notes

Worker livré deux modules + test et relevé, sans partagé ni produit raccordé.54/54sansskip et deuxprojetsTS0 selon sa vérification finale. Rouges initiaux et corrections de fixtures explicités ; régressions annulation pending/admission, inspection historique et mutation synchrone reproduites/corrigées. Parent a lu le diff complet84208caractères en quatre segments et rapproche C1–C8 des tests enregistrés réellement rapportés verts ; aucune suite globale ou native. DTO/capacités, cible incertaine, conservation et restauration passives inspectés ; preuve limitée aux doubles.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Route | Preuve avant correction |
|---|---|---|---|
| Q1 — autorité originale mutée | high | patch | Le plan gelé du wrapper est relu alors que les méthodes liées opèrent sur le producteur original mutable. Modifier seulement le plan du producteur n'est pas détecté. |
| Q2 — marqueur durable avant effet | high | patch | Le stockage reste sur ready avant apply. Une interruption après l'effet restaure un historique sans verrou d'incertitude. Le test initial fabriquait un état applying. |
| Q3 — fait original et continuation | medium | patch | Un fait admissible publié pendant apply ou verify peut être écrasé par la reprise de la Promise, un doublon ou une erreur. |
| Q4 — notification synchrone | medium | patch | Le callback pending peut modifier l'opération entre capture de la révision et copie. Le DTO candidat ne passe plus sa propre validation. |
| R1 — racine native Windows | medium | patch | Le banc parent montre INVALID_PATH pour realpath.native et admission pour le contrôle à barres obliques, sans effet. Voir parent-path-probe.json. |
| R2 — inspection après fermeture | medium | patch | Le banc parent montre zéro écriture au retour de shutdown, puis une écriture tardive après résolution du double. Voir parent-close-probe.json. |

Recontrôle après correctifs : Q1–Q4 résolus par le relecteur Quick d’origine. R1–R2 résolus par le parent sur le code et les cas ciblés natif syntaxique/inspection en attente. Vérification parent : 64/64 sans skip et les deux projets TypeScript passent. Aucun constat différé.

## Design Notes

Un résultat : contrat/cœur d’initialisation utilisable par le tracer, pas une installation produit. Risque high hérité car autorité/fausse preuve peut entraîner de mauvais effets futurs. Route full, plusieurs centaines de lignes cohérentes. REPLAN Sofia a303028 permet source2.15+3.2,39inputs préservés et relecture fraîche sans constat ;2.16/3.9/3.10/4.11 demeurent ouverts. Carte actuelle du code par init32_ux_map, modules inchangés depuis source2.15 : ne pas refaire cette exploration large. Les décisions d’implémentation se prennent dans les propriétaires existants et les limites ci-dessus ; aucune question de besoin ouverte, checkpoints délégués, aucun seuil de tokens.

Worker possède les deux nouveaux modules et leur test, plus le bref dossier qualification-contrat-initialisation/ sous cet epic. Parent seul plan/AGENTS/statuts/git. Tu n’es pas seul : préserver les edits d’autrui, notamment tests/bmad-help-boundaries.test.mjs M/EOL-only. Pas de sous-Build ni d’agents supplémentaires, pas de commit. Exec même lecture : pwsh/login:false/workdir C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/require_escalated, py -X utf8, UTF8/LF ; Git -c core.longpaths=true. Pas de modification source partagé sans nécessité démontrée/rapportée, aucune extension de périmètre pour faire passer un test.

## Verification

**Commands:**
- `node --test tests/bmad-initialization-contract.test.mjs` — tous cas C1–C8 exécutés, zéro skip, aucun natif/processus/moteur/fichier de projet réel.
- `npm run typecheck` — les deux projets TypeScript acceptent la frontière ; aucune compilation/installation/NSIS pour cette story.
- `git -c core.longpaths=true diff --check` sur les fichiers possédés — correction courte seulement, pas de suite globale.

**Manual checks:**
- Lire la séparation DTO/capacités privées, l’origine des faits et le chemin mutation→refus sans effet. Marquer natif, concurrence physique, interruptions et stockage réels encore à qualifier dans leurs stories ; pas d’équivalence entre ce double et G3.
