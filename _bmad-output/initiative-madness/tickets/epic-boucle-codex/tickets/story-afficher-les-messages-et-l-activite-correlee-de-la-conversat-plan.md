---
title: 'Afficher les messages et activité corrélée de la conversation'
type: 'feature'
ticket: '4'
created: '2026-10-26'
status: 'built'
baseline_revision: '2ceaf0b14f2699c812dafa517bb60f6270a71136'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le connecteur attend le texte final et attribue parfois Mary sans preuve.

**Approach:** Montrer les vrais retours progressifs, leur contexte et identité attestée ou inconnue ; conserver les textes via le port existant.

## Boundaries & Constraints

**Always:** Corréler contexte/demande/tour/message ; IDs natifs confinés au connecteur. Acquittement avant envoi annoncé. Identité sourcée, figée par message pendant la session, jamais tirée de prose. Durabilité confirmée après stockage. Snapshot v1 intact : état de tour transitoire ; historique et identité non attestés inconnus après redémarrage. Préserver Mary/Forge, observations, saisie, navigation et thèmes.

**Never:** Faux succès/validation, replay, autre facturation. Catalogue, 1.5–1.8, migration et clôture des gates exclus.

## I/O & Edge-Case Matrix

| Cas | Entrée | Attendu | Échec |
|---|---|---|---|
| Réception | Deltas/items complets | Ordre stable, sans doublon, terminal réel | Bornes contrôlées |
| Corrélation | Précoce, étranger ou tardif | Acquittement ; hors contexte ignoré | Flux incohérent refusé |
| Identité | Attestée ou absente | Identité sourcée ou inconnue, ancienne figée | Aucun défaut Mary |
| Défaillance | Coupure, arrêt, disque refusé | Texte connu gardé, partiel/inconnu explicite | Ni faux durable ni replay |
| Réouverture | Échanges et brouillon sauvegardés | Historique exact, état non attesté inconnu | Aucun moteur relancé |

</frozen-after-approval>

## Code Map

- `src/adapters/codex/dialogue.ts` : réemployer RPC, `accepted`, outils et drain. Schémas : delta threadId/turnId/itemId ; terminal threadId/turn.id ; ordre local.
- `src/core/{ports,dialogue,application}.ts`, `src/contracts/dialogue.ts` : tour/validation ; `dialoguePersist` sérialise disque/brouillon. Snapshot = id/role/text.
- `src/renderer/src/App.tsx` : articles, brouillons indexés, statut et résultats Forge ; attribution Mary implicite à supprimer.

## Tasks & Acceptance

**Execution:**
- [x] `src/adapters/codex/dialogue.ts` : retours typés corrélés ; réconcilier complet/deltas, borner les rafales, distinguer RPC/appel. Aucun dédoublonnage par égalité du texte.
- [x] `src/{contracts/dialogue,core/ports,core/dialogue,core/application}.ts` : projection bornée, contexte immuable, ordre local ; sérialiser/drainer avant terminal/arrêt. Upsert groupé borné via port, demande réelle ; pas d’écriture par fragment.
- [x] `src/renderer/src/{App.tsx,strings.ts,styles.css}` : article stable, identité/état partiel/conservation non confirmée ; transitions annoncées seules. Suivre le bas seulement s'il était visible ; préserver lecture/focus/saisie. Impeccable sans refonte.
- [x] `tests/{dialogue,dialogue-protocol,forge-protocol,connection-ui}.test.mjs` : matrice, multi-items, événements précoces/tardifs, rafales, collisions, disque et arrêt pendant écriture ; régressions Mary/Forge.
- [x] `scripts/qualification/conversation.mjs`, `qualification-conversation/` sous l'epic, `docs/development.md` : banc isolé compilé/paquet, captures, preuve native distincte ; nettoyage même en échec.

**Acceptance Criteria:**
- Given un tour réel, when reçu, then progression visible avant fin et texte restauré sans doublon.
- Given brouillon/lecture, when progression ou navigation, then saisie/focus/ancrage stables, aucun envoi induit.
- Given plusieurs fragments, when rendus, then annonces limitées aux transitions, historique Forge inchangé, aucune acceptation déduite.

## Implementation Notes

- Handoff step 03 : l’implémenteur possède toutes les tâches code/tests/bancs isolés du plan. Il n’est pas seul : préserver les changements d’autrui et s’y adapter. Le parent porte les revues/finition, la qualification native, l’installation et le commit ; aucune intervention dans le profil personnel par l’implémenteur.

- Vérifications de l’implémentation : 165 tests, types/build/installateur, 10 contrôles compilés + 10 paquet et 5 Windows réussis ; matrice automatisée auditée. Archive installée c75733cc…, données inchangées. Premier essai natif arrêté avant moteur ; diagnostic/essai propre encore en cours, aucune réussite native affirmée. Annexe Forge1.3 inchangée : références de preuve historiques distinctes du routage local des nouveaux messages. Retour humain : point UX global demandé après l’epic1 avant l’epic2, consigné dans deferred-work.md ; apparence non acceptée globalement.

## Plan Change Log

- Vérification post-patch : expiration unique173 tests sur le scénario clavier/thème, isolé réussi sans changement. Course du setup reproduite : focus différé de navigation reprenant celui du bouton. Synchronisation du test sur le focus du titre, puis assertion du bouton avant Entrée ; aucun délai ni modification produit. Un ciblé réussi, suite complète relancée.

## Review Triage Log
### Passe 1 — Quick et finition Impeccable reçus avant triage

- Q1 — high, patch : `DialogueRpc.fail` renseigne error et `next` la lève avant la file. Des deltas valides déjà analysés mais non projetés sont perdus ; le drain du cœur ne peut pas les récupérer. Réfutation cherchée : la file reste bornée mais aucun appelant ne la vide après erreur. Correction minimale : livrer les notifications déjà admises avant de propager la défaillance, sans permettre un faux terminal réussi ; test erreur/arrêt avec plusieurs deltas dans un même bloc.
- Q2 — high, patch : `item/started` vide réserve un ordre dans le Map du connecteur sans le publier. B peut alors arriver au cœur avec order2 avant A/order1 et rencontrer le garde strict `updates.size+1`. Aucun autre chemin ne publie A avant B. Correction minimale : publier le commencement vide pour réserver le même ordre au cœur ; tester deux items entrelacés et leur identité figée.
- Q3 — medium, patch : la coalescence du RPC échoue au-delà de MAX_DRAFT_LENGTH avant le filtrage thread/tour du protocole. Deux notifications étrangères ou tardives sous les bornes de transport peuvent donc arrêter le tour valide. Correction minimale : conserver une file/coalescence bornée sans appliquer à un contenu non corrélé la borne de message du tour courant ; tester ancien tour/thread étranger puis tour courant réussi.
- Constats distincts : aucune fusion. Trois corrections locales dans le même adaptateur et ses tests, aucune surface publique ni état produit ajouté, intention et architecture inchangées.
- Impeccable — ship dans la portée1.4, aucun material_fix ; quatre captures examinées et détecteur unique conservé. Le verdict ne qualifie ni le moteur natif encore bloqué ni l’acceptation visuelle globale du porteur.

- Résolution Q1/Q2/Q3 : correctifs locaux et huit régressions en place ; suite complète post-correction173/173, exit 0 (`tests-confirmed.log`). Aucun constat Quick restant. Le seul ajustement UI est la synchronisation du setup de test, produit inchangé.

## Design Notes

Sally activée : recommandations intégrées, contrats préservés. Risque medium relevé à high : corrélation/stockage concurrents exposent l’historique. Plus de 100 lignes/cinq fichiers : full.

## Verification

Tests ciblés, `npm test`, build Windows `dist/conversation-pilot/`, banc compilé/paquet et régressions Windows. Captures groupées, une confirmation, finition Impeccable. Preuve native installée : progression puis arrêt/réouverture sans moteur. Fermeture personnelle confirmée ; coffre, anciens plans/preuves/blocages préservés.

### Premiers essais natifs bloqués

La tentative installée c75733cc… a atteint la qualification du profil Mary, puis `acquireDialogue` a échoué avec `NETWORK_UNAVAILABLE` avant tout processus Codex. Zéro delta natif ; aucun tour créé. Le statut reste blocked, sans clôture1.4, en attendant la vérification humaine de la page publique ouverte dans le navigateur système. Computer Use a cessé après impossibilité de vérifier l’URL courante ; aucun contournement réseau, de certificat ou de garde de navigation. Les erreurs de capacité des autres outils restent un diagnostic distinct et non confirmé.

Les trois patchs Quick sont appliqués ; huit tests reproduits en RED puis corrigés, 26 ciblés protocole/Forge réussis. La suite complète et la reconstruction post-revue sont en cours. Le contrôle visuel ne change pas : aucune source renderer touchée par ces patchs, comparaison des empreintes après build prévue.

### Clôture technique

173/173 tests, types/build/installateur,10 contrôles compilés + 10 paquet + 5 Windows passent après les patchs. FinitionImpeccable ship dans la portée1.4, renderer byte-identical ; aucun correctif Quick différé. Archive3f7186d6122e412bafbbb5c5027b4c9d5daee756442ecc49e36d92b631f0c97b installée avec conservation des données.

Le contrôle natif requis du plan (progression avant fin puis arrêt/réouverture) est réussi sur le premier tour réel. Trois tours distincts terminent ; les mesures progressives supplémentaires des suivis 2/3 restent non concluantes et leurs assertions de banc sont conservées. Aucun échantillon inventé, replay ou changement de facturation. Les étapes supplémentaires du live-protocol ne sont pas assimilées à un succès complet : seule la partie mesure préterminale des suivis reste limitée. Cette limite de banc ne change pas l’intention ni le produit ; elle est explicitée plutôt que transformée en défaut ou réussite supposée.

Arrêt confirmé, réouverture exacte sans moteur/réseau, historique et ancienForge préservés ; identité/tour restaurés inconnus. Anciens gates,distribution,1.1/1.2 et acceptation visuelle humaine inchangés. Passage Sally + Impeccable après l’epic 1, avant l’epic 2 consigné dans deferred-work.md.
