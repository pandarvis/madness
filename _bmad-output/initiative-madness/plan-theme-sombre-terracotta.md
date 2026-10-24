---
title: 'Thème sombre terracotta et bleu par défaut'
type: feature
ticket: ''
created: '2026-10-24'
status: built
baseline_revision: 'feb1ea4828df58c7b1c35fa13e4757fbbb0be543'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 1
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** la version actuelle affiche la base claire violette. Le porteur choisit un thème sombre par défaut avec terracotta orangé et bleu complémentaire, et autorise le travail Impeccable après présentation de cette suite.

**Approche :** appliquer cette palette à l'interface réelle, conserver la composition et permettre de revenir au clair. Proposer les teintes exactes comme choix de conception, puis montrer le résultat. La préférence est locale et la barre Windows suit le thème.

## Boundaries & Constraints

**Always :** préserver navigation rétractable, boutons Windows natifs, brouillons, connexion et échanges. Nouveau profil = sombre ; choix explicite conservé. Mode Operate : surfaces anthracite chaudes, actions terracotta, liens/focus et repères bleus. Texte lisible et états sémantiques distincts avec libellés. Base claire acceptée conservée. Utiliser Impeccable, vérification visuelle groupée bureau/compact, une confirmation au maximum après corrections.

**Never :** modifier le Snapshot v1 strict, migrer les conversations, accéder aux identifiants pour cet essai, envoyer un message agent, ajouter une dépendance, changer la disposition ou installer sur la fenêtre utilisateur ouverte. Aucun gate distribué ni ticket clos par cette amélioration.

## I/O & Edge-Case Matrix

| Situation | Entrée | Résultat attendu | Erreur |
|---|---|---|---|
| Premier démarrage | Préférence absente | Sombre et barre native assortie dès l'ouverture | Aucun |
| Choix utilisateur | Sombre/clair | Renderer, icônes et barre native cohérents ; choix retrouvé après relance | Aucun |
| Stockage indisponible | Lecture invalide ou écriture refusée | Sombre en secours ou choix de session ; avertissement accessible | Données métier préservées |
| Pont non fiable | Mauvais appelant ou valeur hors enum | Rejet sans changer le thème ni écrire | Aucun effet natif |

</frozen-after-approval>

## Code Map

- `src/renderer/src/styles.css` : tokens de couleur existants ; couleurs fixes restantes pour sélection, fonds modaux, ombres et logo noir à adapter. Disposition et breakpoints à conserver.
- `src/renderer/src/App.tsx`, `main.tsx`, `env.d.ts` : barre d'actions et amorçage ; ajouter une commande de thème avec icône et nom accessible, sans écran de réglages supplémentaire.
- `src/main/index.ts` : BrowserWindow et overlay natif fixes en blanc ; restaurer la préférence avant création de fenêtre, modifier seulement via pont validé.
- `src/preload/index.ts`, `src/contracts/appearance.ts` à créer : pont séparé ; `madness` garde exactement ses six méthodes. Amorçage via arguments natifs enum avant React.
- `src/adapters/persistence/appearance-store.ts` à créer : fichier de préférence distinct dans userData ; aucune modification du store métier strict.
- `tests/connection-ui.test.mjs` : fixture Electron renderer existante sans réseau ; réutiliser pour interactions et erreurs de thème. `scripts/qualification/windows.mjs` : contrôles natifs existants à réexécuter sans réécrire les preuves historiques.

## Tasks & Acceptance

**Execution :**
- [x] `src/contracts/appearance.ts`, `src/adapters/persistence/appearance-store.ts`, `tests/appearance.test.mjs` : enum, protocole étroit, restauration/écriture atomique et secours ; vérifier les refus et la conservation du Snapshot.
- [x] `src/main/index.ts`, `src/preload/index.ts` : restaurer et synchroniser l'apparence native ; amorçage sans flash de thème et validation de l'appelant.
- [x] `src/renderer/src/{main.tsx,App.tsx,env.d.ts,styles.css}`, `tests/connection-ui.test.mjs` : palette sombre, alternative claire, commande accessible et avertissement de sauvegarde ; aucun changement de flux agent.
- [x] `scripts/qualification/theme.mjs` : vérifier interface compilée et barre native, contrastes calculés, état clavier, texte/brouillon conservés et reprise ; captures bureau/compact et nettoyage du profil temporaire en finally.
- [x] `ux-madness/{DESIGN.md,EXPERIENCE.md,.memlog.md}`, `PRODUCT.md`, `AGENTS.md` : consigner palette proposée et résultat vérifié sans prétendre une acceptation humaine ni une installation.

**Acceptance Criteria :**
- Étant donné un profil neuf, quand Madness s'ouvre, alors le thème sombre terracotta/bleu et les contrôles Windows sont cohérents.
- Étant donné un brouillon saisi, quand le thème change puis la fenêtre se redimensionne, alors le texte et le contexte restent présents et la navigation fonctionne.
- Étant donné une préférence claire enregistrée, quand l'application redémarre, alors elle retrouve le clair et sa barre native sans relancer d'agent.
- Étant donné les deux palettes, quand les couples calculés de texte, actions, focus et états sont mesurés, alors les seuils AA applicables sont atteints ; les états ne reposent pas sur la couleur seule.

## Implementation Notes

- Mandat autonome du porteur pour validations nécessaires conservé ; pas de nouvelle permission intermédiaire. Les fichiers non suivis d'installation BMad/Impeccable sont préexistants et préservés ; aucun changement suivi au départ. Route full estimée à plus de 100 lignes ; risque moyen lié à la persistance et au pont natif.
- Exploration indépendante confirme la nécessité d'un fichier UI et d'un pont distincts pour ne pas invalider le Snapshot v1. Pas de changement du cœur Application.
- Le worker est propriétaire de tous les fichiers d'implémentation, tests, banc et documentation de ce plan ; le parent coordonne et relit, sans modifications concurrentes. Lire les références Impeccable `reference/colorize.md` et `reference/operate.md`, puis `reference/craft-floor.md` immédiatement avant les edits UI, sous `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/`. Le contexte Impeccable est déjà chargé dans cette session ; ne pas relancer le launcher. Lire les contrats UX existants ; captures natives de référence dans `qualification-barre-titre/`. Le fichier d'apparence invalide doit être préservé, pas réécrit silencieusement. Nettoyer les profils témoins en fin d'essai.
- Réconciliation de revue : les arguments natifs sont une amorce, pas la vérité après rechargement du renderer. Avant chaque montage React, relire l'apparence courante en Main par une commande strictement validée en lecture seule. Cette lecture doit attendre les changements déjà en file, ne doit ni sauvegarder ni réappliquer une ancienne valeur et conserve les avertissements de session. Le renderer attend cette restauration avant montage. Ajouter un contrôle compilé : clair choisi, renderer rechargé, clair encore cohérent avec Main, fichier de préférence et Snapshot inchangés. Ne pas ajouter de nouvelle ronde de captures ni de nouvelle esthétique.
- Reprise : seuls les cinq fichiers d'amorçage Main/preload/App/env/main.tsx ont été remis au baseline ; leurs parties positives sont dans `C:/Users/UP60066553/AppData/Local/Temp/madness-terracotta-741aba8c44df43d88d8398364e3320a2.diff`. Les autres parties KEEP sont toujours présentes dans le dépôt. Le worker de reprise possède ces fichiers, le contrat d'apparence, les tests/banc et les notes nécessaires ; pas de commit ni paquet. Implémenter la réconciliation puis types/build, tests ciblés et banc sans capture ; le parent reprend la revue et la livraison.

## Plan Change Log

- Itération 1 — La revue Quick constate une amorce périmée après rechargement du renderer (`additionalArguments` statiques). Le plan doit demander une lecture courante avant montage, protégée par la même frontière et ordonnée avec les changements. Réviser l'amorçage Main/preload/renderer ; conserver (KEEP) palette, CSS, disposition, store séparé atomique, validations enum/caller, avertissements, preuves et contrôles déjà réussis. Le diff antérieur est conservé temporairement pour restitution des parties positives.

## Review Triage Log

- R1 : medium / bad_plan — confirmé : le preload reparcourt les arguments de création, immuables, alors que Main a changé l'apparence. Un reload Vite recrée React avec l'ancien thème. La conception d'amorçage doit être amendée, sans changement d'intention utilisateur ; contrôle de reload à ajouter.
- R1 résolu après réconciliation : lecture courante ordonnée avec les changements, montage React après réponse ; contrôle de reload, absence d'écriture et avertissement de session réussis. Suite complète de 121 tests réussie après réconciliation.
- R2 : medium / patch — seconde revue Quick : avant la lecture IPC, le document sans data-theme hérite du fond sombre alors que Main peut être clair. Le cas atteint l'amorce du reload. Correction locale du canevas avant amorçage, sans nouvelle surface publique, avec contrôle ciblé des deux fonds natifs ; aucune nouvelle ronde visuelle.
- R2 résolu : canevas sans data-theme transparent et color-scheme normal, fond natif conservé dans les deux thèmes. Régression constatée puis onze contrôles compilés et onze paquet réussis. Deux constats réels corrigés, aucune correction différée.

## Design Notes

Proposition de conception : fond `#211F1E`, navigation `#191817`, panneau `#272423`, texte `#F1EBE6`, secondaire `#BCB0A8`. Accent terracotta `#E49B7A` avec texte sombre `#231A15` ; bleu complémentaire `#9DC7E1` pour liens et focus. Le thème clair garde sa palette acceptée. Les contrastes calculés et l'inspection décideront des ajustements avant présentation.

## Verification

Exécution du 24 octobre : types/build réussis ; 121 tests réussis ; sept contrôles compilés dans `qualification-theme/profile.json` ; cinq régressions Windows ciblées réussies avec nettoyage. Deux passages visuels groupés au total : inspection des trois variantes puis unique confirmation du cadrage, sans correction CSS. 32 couples calculés par palette, minima texte sombre 6,05:1 / clair 4,84:1 et focus/contours 3,50:1 / 3,35:1. Aucun compte ni agent dans les bancs, aucune installation. Le sandbox Windows refuse les renommages atomiques dans son Temp ; l’exécution hors sandbox autorisée a confirmé les six tests d’apparence. Revue et paquet final restent à coordonner par le parent ; aucun commit effectué par le worker.

- `npm run build` : types et compilation réussis.
- `npm test` : suites existantes et nouvelles réussies ; tests sans réseau ni fournisseur.
- `node scripts/qualification/theme.mjs` : profil isolé, contrastes, interaction, persistance, native overlay et captures ; cleanup confirmé.
- `node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots` : contrôles Windows existants, aucune preuve historique réécrite.
- Revue indépendante, corrections justifiées et commit local sans push. Fournir l'aperçu ; installation distincte après fermeture humaine si nécessaire.

Reprise après R1 : cinq fichiers d’amorçage restitués depuis le diff conservé, puis ajout d’une commande `read` d’apparence strictement validée et protégée par le même contrôle d’appelant. Main répond depuis son état de session dans la file des changements ; cette lecture ne restaure pas le fichier, ne sauvegarde pas et ne réapplique pas l’amorce native. React attend la lecture et reçoit son résultat au montage. Le secours natif reste accompagné d’un avertissement si le pont est indisponible.

Validation de reprise : le contrôle clair choisi puis reload a d’abord échoué sur l’ancienne amorce (RED, nettoyage confirmé), puis passe après correction. `npm run build` réussit ; `node --test tests/appearance.test.mjs tests/connection-ui.test.mjs` réussit avec 17 tests ; `node scripts/qualification/theme.mjs --skip-screenshots` réussit avec neuf contrôles et nettoyage confirmé. La lecture attend un changement en file ; le reload conserve le clair, le Snapshot et la préférence sans nouvelle écriture ni appel overlay ; un avertissement `save-failed` et le choix de session survivent aussi au reload, et une fenêtre étrangère est refusée en lecture comme en écriture. Aucune nouvelle capture, esthétique, installation, dépendance, migration, modification du Snapshot ou des six méthodes `madness`. Suite complète, revue et paquet restent au parent ; aucun commit par le worker.

Clôture technique : après R2, types/build et les 121 tests passent à nouveau, puis les cinq régressions Windows ciblées et les onze contrôles du paquet final réussissent. Les profils temporaires sont nettoyés. Installateur distinct dans `dist/terracotta-pilot/`, empreintes et résultats dans `qualification-theme/verification.json`. Deux relectures Quick, deux constats corrigés, aucun correctif différé. Palette et captures déjà inspectées conservées ; aucune nouvelle ronde visuelle. L'installation personnelle et le retour visuel humain restent distincts ; aucun ticket/gate distribué n'est clos.

Clôture de livraison personnelle : après confirmation explicite de fermeture, l’installateur a remplacé la version précédente (code de sortie 0). L’archive installée correspond au paquet qualifié ; le snapshot et le compte chiffré sont inchangés après installation et réouverture. La fenêtre est ouverte normalement et répondante, avec configuration sombre par défaut. Aucune connexion, aucun témoin fournisseur ni débogueur n’est lancé pour cette vérification ; aucune nouvelle inspection visuelle des données personnelles. Preuve `qualification-theme/installation.json`. L’acceptation visuelle humaine reste à recueillir.
