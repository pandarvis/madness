---
title: 'Retrouver les attentes et le récapitulatif depuis accueil et projet'
type: 'feature'
ticket: '8'
created: '2026-10-27'
status: 'built'
baseline_revision: 'cb3a8442c7a2372cd015c56b86e2862fc1eebbdb'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L’accueil ne montre pas toutes les attentes et les liens existants ne rejoignent pas précisément la conversation et la demande. Le résultat du tour reste dispersé.

**Approach:** Une projection factuelle commune sert l’accueil et le projet ; elle rejoint le contrôle existant et présente un récapitulatif sourcé, avec inconnus explicites.

## Boundaries & Constraints

**Always:** AD-2–8, contexte complet et identifiants capturés. Attente active seulement si demande/tour/conversation répondables et non expirés ; envoi en cours sans seconde action. Navigation vers conversation exacte, focus après montage, clics concurrents et retours tardifs isolés. Brouillons conservés dans leurs maps existantes. Récap : texte reçu exact comme résultat proposé, choix ponctuels transmis séparés de leurs effets, chemins annoncés séparés des observations. Fin de tour, résultat Forge, clôture et acceptation humaine restent distincts. Connexion réelle et fraîcheur expliquées. Un arrêt global sans contexte n’est attribué à aucun projet.

**Never:** Déduire synthèse, décision, action suivante ou validation depuis la prose, idle ou un texte complet ; réactiver une attente restaurée, inspecter ou relancer automatiquement un moteur. Aucun rejeu, nouveau droit, effet projet ou autorisation depuis l’accueil. Snapshot v1 et six méthodes madness inchangés. R32 temps/coût, Loop, catalogue général, graphe et refonte globale exclus ; palette et contrôles existants conservés.

## I/O & Edge-Case Matrix

| Cas | Entrée | Attendu | Échec |
|---|---|---|---|
| Attente | Question/approbation active | Même entrée accueil/projet ; lien au bon contrôle | Expiration/résolution : expliquer, aucun envoi |
| Contexte | Deux projets et conversations | Cible exacte et saisies distinctes | Sélection échouée/tardive : aucun mauvais focus |
| Récupération | Erreur/arrêt incertain | Action existante accessible, périmètre honnête | Connexion absente : données locales lisibles |
| Fin connue | Tour completed corrélé | Résultat, choix, effets, fichiers et suite connue | Synthèse/suite absente explicitement indiquée |
| Historique | Réouverture sans moteur | Texte/annexes conservés, tour/identité inconnus | Aucun contrôle ancien ni acceptation fabriquée |

</frozen-after-approval>

## Code Map

- `src/core/application.ts` : projection et file atomique ; toutes conversations disponibles. Ne pas confondre capabilities G0 et connexion personnelle.
- `src/core/dialogue.ts`, `src/contracts/{dialogue,questions,approvals,recovery}.ts` : lecture/abonnements, corrélation, annexes et gardes natives ; inspections éphémères.
- `src/contracts/index.ts`, `src/adapters/persistence/json-store.ts` : Snapshot v1 garde seulement contexte/messages simples/activité ; aucune corrélation restaurée à inventer.
- `src/renderer/src/App.tsx` : choix actuel implicite, select et focus h1, bandeaux partiels ; WorkflowResult réutilisable.
- `src/renderer/src/{QuestionPanel,ApprovalPanel,RecoveryPanel}.tsx` : contrôles uniques, focus de cible sans dupliquer leurs IDs.
- `tests/{dialogue,recovery,connection-ui}.test.mjs`, `scripts/qualification/recovery.mjs` : bancs existants, profils isolés et nettoyage.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/work-overview.ts` : projection pure depuis AppState/DialogueState/connexion réelle/heure injectée ; identités stables, états historiques et données manquantes explicites.
- [x] `src/renderer/src/WorkOverview.tsx`, `App.tsx`, panneaux existants si requis : listes communes accueil/projet, récapitulatif et navigation exacte avec jeton de cible ; réutiliser les commandes.
- [x] `src/renderer/src/strings.ts`, `styles.css` : libellés et actions compactes accessibles, longs textes et fenêtres compactes ; Impeccable ciblé.
- [x] `tests/work-overview.test.mjs`, tests UI existants : matrice, courses, expiration, choix transmis/effet inconnu, portée annoncée/chemin observé et restauration sans moteur.
- [x] `scripts/qualification/overview.mjs`, `docs/development.md` : banc compilé/paquet et loopback déterministe si nécessaire pour reçu natif ; preuves et nettoyage.

**Acceptance Criteria:**
- Given une attente active, when lien clavier depuis accueil puis réponse explicite dans le projet, then bonne conversation/demande focalisée, reçu exact et disparition commune après résolution, sans perte de saisie.
- Given fin ou données historiques, when consultation et réouverture, then le récap sépare faits/inconnus et ne transforme aucune permission en validation de livrable ; aucun moteur/réseau ne démarre.

## Implementation Notes

Projection partagée importée directement par le renderer, sans nouveau pont ni changement de Snapshot v1. Les attentes exigent contexte complet, requête/tour corrélés et échéance valide ; les états natifs de travail restent visibles hors attente. Navigation vers la conversation capturée avec jeton annulable et focus après montage ; les panneaux existants gardent leurs contrôles uniques. Les récapitulatifs conservent les textes exacts et identifient séparément le tour d’origine de chaque choix, sa transmission, ses effets et les chemins annoncés/relus.

Preuves d’implémentation dans `../qualification-overview/` : suite prescrite283/283, neuf tests de projection, six UI ciblés après gardes finales, compilé8/8, runner loopback4/4, cinq régressions Windows. Paquet séparé `dist/overview-pilot/` ; vérification du paquet final8/8 avec nettoyage confirmé. La revue Quick, la finition technique fraîche, la confirmation visuelle finale, l’installation personnelle et le commit appartiennent au parent ; aucun statut `built` ni accord visuel humain n’est déduit de ce lot d’implémentation.

Impeccable Operate : context chargé une fois, références harden/craft-floor appliquées. Première passe groupée bureau/compact sombre/clair inspectée ; interligne connexion et corrélation des choix corrigés ensemble. Détecteur unique sans constat (`[]`). Seconde passe visuelle gardée en réserve pour confirmer après revues ; bancs suivants exécutés avec `--no-captures`.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Preuve et route |
|---|---|---|
| Q1 — ancienne sélection conservée après lancement | medium | `conversationSelections` est prioritaire ; `dialogueAction` change seulement l’onglet après launch/launchForge. La session nouvelle est prête mais la conversation historique garde la vue et empêche l’envoi. `patch` : sélectionner la nouvelle conversation d’un lancement explicite réussi, sans modifier les saisies ni imposer le retour d’un lancement échoué. |
| Q2 — transition d’attente silencieuse à l’accueil | medium | Les bandeaux `role=status` disparaissent au profit d’une liste sans région live ; `acceptDialogue` ne modifie pas la notice annoncée et les autres statuts sont dans le projet. `patch` : annonce polie, concise et stable des transitions utiles, sans annoncer chaque fragment de texte. |

Finition Impeccable technique fraîche : disposition `fix`. F1 (interligne connexion) et F2 (rattachement des choix à leur tour) sont déjà corrigés en source mais attendent la confirmation visuelle. F3 demande un état lisible dans le résumé replié, identifiant secondaire, sans titre/date inventé : correction locale du même périmètre. Première passe quatre captures, détecteur unique ; seconde passe réservée au verdict du même relecteur. Aucun persona Sally ni accord visuel humain déduit.

Q1/Q2 corrigés par le même implémenteur, quatre tests UI ciblés exécutés et réussis ; le même Quick les recontrôle résolus par inspection, sans nouvelle chasse. F3 est corrigé et couvert par le test du résumé. La vérification finale parent et le verdict visuel restent distincts des preuves d’avant revue.

Première confirmation du même finisseur : F1/F2 résolus, F3 partiel car « Tour en cours » affirme une activité actuelle à partir d’une phase non terminée. Correction factuelle minimale du libellé en « Fin de tour non confirmée », avec régression demande expirée/inactive passée1/1. Le mandat autonome couvre cette correction nécessaire et sa confirmation ciblée supplémentaire ; ce contrôle dépasse les deux passes initialement prévues, sans nouvelle chasse visuelle, nouveau détecteur ni refonte. Le verdict `fix` reste applicable jusqu’au recontrôle du finisseur ; aucune réussite visuelle n’est inférée du seul code.

Verdict final du même finisseur : F1/F2/F3 résolus, `ship` limité à ces constats, aucune validation humaine globale. Documenteur frais : aucun changement des contrats adoptés. Vérification parent après la dernière correction :287/287 tests, types/build/installateur, compilé8/8, paquet8/8, natif loopback4/4, Windows5/5. Paquet `dist/overview-pilot/` installé, ASAR `072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1`, restauration personnelle6/6 et27 empreintes critiques identiques après fermeture ; compte lisible, aucun témoin ajouté. Anomalie d’override sessionData du banc corrigée sans changement produit ; échec initial conservé séparément. Détails dans `../qualification-overview/parent-verification.md`, `review-quick.md`, `impeccable-finish.md` et `overview-artifact.json`. Aucun correctif du lot différé, anciens gates et réserve d’arrêt pour1.10 inchangés.

## Design Notes

Mandat autonome : approbation du plan déléguée, sans nouvel arbitrage produit. Implémenteur propriétaire du code/tests/bancs/docs de ce lot ; parent seul pour revue, compte réel, installation et commit. Il n’est pas seul : préserver les autres éditions. Ne pas rerendre Build. Mode Impeccable Operate, extension du système existant ; lire le skill officiel `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/SKILL.md`, context une fois dans sa session puis harden/craft-floor avant UI. Deux tours visuels groupés maximum, un détecteur ; finition technique fraîche après, sans persona Sally. Aucun compte ou modèle externe requis par ce lot.

## Verification

Matrice et UI ciblées, suite `node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs`, `npm run typecheck`, `npm run build`, `npm run build:win` ; banc compilé puis paquet Windows desktop/compact sombre/clair et réouverture sans moteur. Distinguer fixtures d’affichage et vrai reçu du runner loopback. Parent contrôle journaux/artefacts et répète seulement après correction ou doute nouveau. Qualifier remplacement personnel après vérification fenêtre fermée, sans toucher récents/compte ; sinon conserver le paquet séparé. Préserver gates1.1/1.2 et10/11 ; aucun test d’arrêt historique corrigé hors1.10.
