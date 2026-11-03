---
title: 'Lire le parcours et ses preuves à la bonne révision'
type: 'feature'
ticket: 4
created: '2026-11-03'
status: 'built'
baseline_revision: '0056977abc1496aff0af5e38f291ef427fb80326'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Après ouverture d’un projet BMad en cours, Madness ne donne pas encore une reprise factuelle de son parcours : état, résultats et décisions retrouvables, récapitulatifs et travail restant. Le porteur veut un « Quick Resume » pour comprendre immédiatement sa progression sans devoir reconstituer le fil des agents.

**Approach:** Lire explicitement les artefacts locaux de l’initiative choisie et présenter une projection déterministe dans Parcours, avant l’aide et les préparations d’agents. Chaque assertion renvoie à sa source et sa révision ; les conversations internes fournissent leurs récapitulatifs factuels déjà conservés. Sally précise les contrats avant la nouvelle surface, en conservant le monde atelier approuvé.

## Boundaries & Constraints

**Always:** Contexte projet/racine/initiative choisi de2.3 ; la consultation beta peut coexister avec un dialogue capturé alpha. Garder distincts état déclaré, activité native et acceptation humaine. Sources entrée TOML, feuille, plan et tracker conservées séparément avant leur rapprochement ; une entrée sans feuille reste visible. Preuves chemin/portée/empreinte/révision/date issues des octets réellement lus. Faits, déductions et propositions nommés ; contradictions, couverture partielle, données anciennes et inconnues explicites. Racines canoniques, lecture bornée et refus du profil G2, ressources fermées/pinnées et possession/arrêt du helper préservés. Lecture locale indépendante du compte/Codex/réseau, sous les vraies gardes BUSY/STOP_UNCONFIRMED. Brouillons et historiques exacts ; sept parcours UX, fontes, casting et palettes conservés. Libellés FR/EN contractuels ; traduction générale2.14.

**Never:** Écrire/réinitialiser un projet consulté ; importer/exécuter son Python ou le banc de qualification ; transformer présence/absence de fichier, fin de tour, plan built/done ou statut déclaré en acceptation humaine ; jauge de progression fabriquée ; reconstruire une session externe ou produire une synthèse IA implicite. Pas de scan indiscriminé des preuves volumineuses, de préflight JWKS/OAuth/modèle à la consultation, de sélection implicite de l’initiative active, de changement des captures historiques ni contournement d’admission. Watchers2.5, catalogue2.6, aperçu/éditeur2.8 et bibliothèque multi-projet2.9 restent leurs lots propres ; aucun lancement de compétence supplémentaire ni nouveau provider.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat observable | Refus / limite |
|---|---|---|---|
| P1 nominal | Initiative choisie valide, arborescence G2 avec epics/entrées TOML, feuilles/plans et livrables | Reprise, parcours et registre de preuves rattachés au même projet/initiative et à une révision calculée sur les sources | Consultation seule, aucun fournisseur |
| P2 sans feuille | Entrée TOML sans feuille/plan, ou plan joint par ticket | Identité stable projet/racine/initiative/conteneur/id ; existence et déclarations exactes, absence explicitement inconnue | Aucun état terminé/restant déduit de l’absence |
| P3 contradictoire | Plan built, feuille in-progress, tracker done, ou doublons/refs orphelines/statut inconnu | Déclarations séparées, preuves opposées consultables et conflit nommé | Aucun « dernier fichier gagne », statut synthétique validé ou acceptation inventée |
| P4 résumé | Sections de résultats/décisions/travail restant et récapitulatifs sourcés, avec propositions d’agent | Extraits littéraux identifiables et récapitulatifs locaux corrélés, lien exact de retour à conversation | Texte non fiable rendu inerte ; absence de section = information non établie |
| P5 sélection | Aucune initiative choisie, choix disparu/racine changée, consultation beta alors que active alpha | Choix demandé ou limite précise ; beta n’est pas remplacée par alpha et les échanges gardent leur capture | Nouvelle lecture refusée si son contexte choisi est invalide |
| P6 collecte | Accès refusé, UTF-8/TOML/frontmatter invalide, limite atteinte, reparse/hardlink/hors portée ou mutation pendant lecture | Erreur ou observation partielle nommant la source/portée ; faits sûrs déjà établis restent identifiés | Aucune troncature ou couverture complète prétendue ; fichier externe inchangé |
| P7 concurrence | Lecture retardée puis changement projet/initiative, fermeture ou erreur | Résultat reste attaché à sa génération/contexte, ancien snapshot explicitement daté, saisie/navigation intactes | Aucun ancien résultat ne remplace la nouvelle destination ; arrêt possédé attesté |
| P8 hors ligne | Compte absent, fournisseur indisponible ou proxy inaccessible | Même lecture locale explicite et détails de preuves accessibles | Aucun appel OAuth/JWKS/modèle ; BUSY/STOP_UNCONFIRMED restent distincts |

</frozen-after-approval>

## Code Map

- `src/contracts/bmad-context.ts` : `BmadContextObservation`, `BmadSelection`, `selectionValidity()` et validateurs stricts. `src/core/bmad-context.ts::BmadContextCoordinator` : restauration passive, sélections/racines/générations. Réutiliser une observation et sélection valides pour consulter ; ne pas détourner `capture(true)`, qui exige sélection=active pour une invocation.
- `src/adapters/bmad/{context,help}.ts` : lecture locale sérialisée et `BmadHelpAdapter.run()` avec admission, Job, annulation et arrêt prouvé. `resources/bmad-help/{capture,worker}.py` : `inspect_chain`, `confined_output`, `read_safe`, `capture`, `public_receipt`, `fresh`, `sha`, `identity`. Ajouter une opération interne fermée pour la projection ; `context_observation()` ne lit pas les tickets et `prepare()/read()` sont réservés au bundle d’aide.
- `qualification-profil-g2/prototype.py::ticket_proofs()` sous l’epic : modèle qualifié de capture séparée entries/leaves/plans/trackers/files, texte et SHA. `_bmad/method/scripts/tickets.py::{parse_frontmatter,load_breakdown,load_folder,join_plans,load_tree,classify}` : formats existants à reprendre dans une copie maîtrisée des seules fonctions nécessaires. Ne pas importer le banc ni la copie du projet ouvert ; `join_plans()` écrase des statuts, donc conserver les preuves avant rapprochement. `built` classe review, jamais acceptation humaine.
- Nouveau `resources/bmad-help/progress.py`, `src/adapters/bmad/progress.ts`, `src/contracts/bmad-progress.ts`, `src/core/bmad-progress.ts` : collecte locale bornée, enveloppe strictement validée et projection déterministe. Identités fichiers/US et sources consommables par2.5/8/9/10. `help-manifest.ts::helpResourcePins`, fermeture `bootstrap.py` et manifestes du lanceur à maintenir pour toute ressource admise.
- `src/core/work-overview.ts::projectWorkOverview()` et `src/renderer/src/WorkOverview.tsx` : résultats/attentes/récapitulatifs des conversations locales et destinations exactes déjà qualifiés, à réutiliser sans interpréter de prose.
- `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts` : nouveau bridge métier typé, trusted caller, autorité cœur sur projet/racine ; jamais un chemin de lecture libre accepté du renderer. `src/renderer/src/App.tsx` : `initiativeContext`, `overview`, `navigateOverview`, tabpanel Parcours avant `HelpPanel` ; attentes/récupérations gardent priorité.
- Nouveau `src/renderer/src/ProjectResume.tsx` et styles locaux : région Reprise du projet, groupes textuels, détails natifs des preuves ; tokens/style existants. `strings.ts` pour libellés. Root `DESIGN.md` est autorité visuelle actuelle Oxanium45016 px/Barlow/castingv2, deux spines sous ux-madness sont les contrats comportementaux à compléter par Sally.
- `tests/connection-ui.test.mjs` : vrai App sous fixture Electron, styles/cascade réels, blocage HTTP(S), primitives de fermeture possédée. Nouveaux tests dédiés projection/contrats/helper Windows et banc local Main en profil Temp possédé ; réutiliser les primitives de qualification existantes, sans profil personnel ni test modèle.

## Tasks & Acceptance

**Execution:**
- [x] Deux spines UX adoptés — Sally étend Reprise du projet/lecture de preuves/libellés FR-EN avant code, en gardant sept parcours et charte actuelle.
- [x] `src/contracts/bmad-progress.ts`, cœur et tests — définir preuves, identités, états de collecte/projection et commandes strictes ; pin P2/P3/P5/P7/P8 dans des tests rouges puis verts.
- [x] `resources/bmad-help/progress.py`, worker/adaptateur/pins et tests — collecter uniquement les sources utiles de l’initiative choisie (racine, conteneurs tickets et artefacts documentaires reconnus), séparer états avant jointure, borner octets/nombre/profondeur et vérifier la cohérence de capture. Éprouver P1/P2/P3/P6 avec vrai helper Windows possédé, refus et fermeture, sans code du projet exécuté.
- [x] `src/core/bmad-progress.ts` et adaptateur — projeter état, résultats/décisions, récapitulatifs et travail restant littéralement sourcés ; garder la couverture manquante et les contradictions. Extraits nommés des sections, pas de résumé libre. P3/P4/P7, anciens résultats et générations prouvés ; lecture explicite, restauration sans nouveau helper implicite.
- [x] Main/preload/App/ProjectResume/styles/strings — brancher la lecture locale, contexte, détails de preuves et retour à conversation exacte ; préserver focus/brouillon, labels et états accessibles. Tests UI P4/P5/P7/P8, clavier, deux thèmes, compact et zoom200, compte indisponible et saisie conservée.
- [x] Qualification locale/candidat et documentation — types/build, helper/Main réels en Temp, réouverture passive des données témoins, ressources/pins/ASAR exacts, aucun modèle/réseau ; deux tours visuels bornés maximum, un détecteur et finitions Impeccable coordonnées par le parent. Audit indépendant high des preuves contradictoires/absentes/révisions différentes puis revue Quick et rechecks des corrections.

**Acceptance Criteria:**
- Given deux initiatives avec entrées TOML, plans, feuilles et un historique partiel, when je lis leur reprise, then chaque état/résultat/décision/travail restant affiché renvoie aux octets de son contexte et l’absence reste inconnue sans changer les projets.
- Given déclarations de statuts contradictoires et un plan built, when je consulte les preuves, then chaque déclaration reste consultable à sa révision, le conflit est expliqué et aucune validation humaine ou réussite globale n’est fabriquée.
- Given un récapitulatif local réellement conservé et une conversation capturée alpha, when je le rejoins depuis la reprise de beta ou de son projet, then le contexte exact est retrouvé et les brouillons/historiques demeurent inchangés sans relance automatique.
- Given fournisseur déconnecté et réseau indisponible, when je lis la progression puis ferme/rouvre un profil témoin, then la consultation locale reste utilisable, aucun appel fournisseur n’est fait et aucun choix/contenu ancien n’est réattribué.
- Given scan refusé ou réponse tardive après navigation, when je poursuis ma saisie, then le brouillon persiste, la couverture/ancienneté est explicite et aucune ancienne preuve n’est annoncée actuelle dans la nouvelle destination.

## Implementation Notes

Lecture locale `progress` ajoutée au helper fermé/pinné ; consultation beta distincte de l’initiative active, statuts séparés avant jointure, canoniques v7 dans initiative et epics reconnus. Projection sans synthèse ni acceptation ; quatre accès et détails textuels dans Parcours. Sally a étendu les spines avant code. Voir [vérification parent](../qualification-reprise-projet/parent-verification.md), [portée finale](../qualification-reprise-projet/final-scope-handoff.md) et [audit documentaire](../qualification-reprise-projet/impeccable-documentation.md).

Contrôles finaux : 17/17 cœur/natifs (21+28+8 contrôles Windows), 6/6 UI, extracteur de reçus 1/1, types/build/NSIS, paquet 12 contrôles ; audit 203 inputs/19 sorties/14 ressources. Intention gelée inchangée. Candidat distinct project-resume-reviewed-002/0.2.7 non installé ; ASAR a336b3ade742a2bc825bcc41b7336221c29747742fffc4642212aa045eefe18b. High H1–H3/F4 résolus, finish F1 résolu et ship limité ; Quick Q1–Q3 corrigés et recontrôlés résolus par le même relecteur. Aucun réseau/modèle personnel ni validation humaine globale déduit.

## Plan Change Log

## Review Triage Log


| Constat Quick | Verdict | Vérification et route |
|---|---|---|
| Q1 — statuts distincts masqués par classe | medium | Vérifié core lignes7/12 : in-progress/blocked et draft/ready-for-dev deviennent une même classe avant le test de conflit. Les octets distincts sont conservés mais le désaccord n’est pas nommé, contrairement à P3. Patch privé du calcul, sans nouveau contrat/état, sur déclarations existantes démontrées. |
| Q2 — feuille sans id et plan par stem séparés | medium | Vérifié progress.py : la table leaves n’est alimentée que si ticket non null ; tickets.py load_folder conserve la feuille sans id et join_plans la joint par file. Patch privé des identités de fichier déjà requises en P2, sous le schéma existant : rapprochement sourcé, id natif toujours inconnu, aucun id US inventé. |
| Q3 — retour échange perd preuve/position | medium | Vérifié App condition tab=parcours : le composant est démonté, sans conservation des details ni du scroll ; EXPERIENCE lignes224/228/254 impose le retour conservé. Patch de session privé sur ces états démontrés, sans nouvelle commande/bridge ou extension de parcours. |

Les trois routes restent des patches locaux de comportements déjà décidés ; aucun changement d’intention, de surface publique ou de plan n’est leur correctif. Les mêmes implémenteur puis reviewer Quick prennent corrections et rechecks. Le candidat 001 demeure la preuve de son ancien code ; il ne sera pas attribué au code corrigé.

## Design Notes

Sous mandat humain full autonomie, choix retenus : projection déterministe et lecture explicite locale, détails textuels de preuves en2.4 avant aperçu2.8, pas de persistance nouvelle obligatoire pour les projections (les sélections2.3 et conversations existantes gardent leur stockage ; après réouverture aucune collecte implicite). Les sections reconnues/extraits sont bornés et présentés comme déclarations du document, jamais comme une vérification externe. Les faits agrégés gardent leurs preuves et leur périmètre, les statuts de sources ne sont pas écrasés. Les décisions propres à la mise en œuvre, non aux exigences humaines, peuvent être précisés sans réécrire ce bloc gelé.

Une seule implémentation possède code/tests/bancs de 2.4 ; parent gère statut/revues/proofs/commits et Sally les deux spines seulement. Tous travaillent dans le dépôt actuel bmad-help-2-2 ; ne pas basculer vers atelier ni annuler les éditions des autres. Ancienne variation EOL tests/bmad-help-boundaries.test.mjs sans diff de contenu est préexistante et à préserver. Ne pas faire de reset global en revue. Version logicielle du prochain candidat distincte0.2.8 si nécessaire, sans lien avec l’identifiant story2.8. Aucun paquet personnel réinstallé pour chaque tâche locale.

## Verification

**Commands:**
- `node --experimental-strip-types --test tests/bmad-progress.test.mjs` — P1–P8 applicables à la projection et au cœur, aucune inférence d’acceptation ni conflit masqué.
- `node --experimental-strip-types --test tests/bmad-progress-protocol.test.mjs` — vrais helpers Windows, refus/frontères, octets et arrêt Job attestés ; aucun témoin externe modifié.
- `node --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` — tests UI ciblés sans saut, contexte/focus/saisie, thèmes/zoom et réseau bloqué.
- `npm run typecheck` puis `npm run build` — aucun type/build erroné.
- Banc Main local et paquet Windows dédiés — commandes exactes/artefact/reçus à consigner dans qualification-reprise-projet/parent-verification.md ; ressources et sources auditées, aucun profil personnel/modèle/réseau requis.

## Résultat final

Les trois patches Quick restent sous le schéma existant : statuts littéraux comparés avant classes, identité de fichier @file explicitement distincte d’un id natif, état privé de lecture conservé à la même capture puis invalidé si sa portée change. Recheck du même Quick : trois résolus, aucune régression directe relevée. Le paquet 002 passe 12 contrôles, huit Jobs terminés à zéro, huit opérations avant/après réouverture sans nouvelle opération et Snapshot exact. Voir les reçus versionnés002 ;001 et Main004 ne sont pas promus au code final. Aucun fix fonctionnel de revue restant. La latence de la garde runtime existante est observée et reste à qualifier avant2.5 ; suivi dans deferred-work.md, aucune performance optimisée prétendue.
