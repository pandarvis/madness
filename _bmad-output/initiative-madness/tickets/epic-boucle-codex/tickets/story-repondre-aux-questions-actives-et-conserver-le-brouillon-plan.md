---
title: 'Répondre aux questions actives et conserver le brouillon'
type: 'feature'
ticket: '5'
created: '2026-10-26'
status: 'built'
baseline_revision: 'cd75383511fe98d63158fabc79a433179293f75a'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/protocol-spike.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les questions natives sont refusées ; le dialogue libre ne permet pas d’y répondre.

**Approach:** Montrer la demande réelle, son destinataire et ses champs ; répondre explicitement à cette seule demande et conserver sa saisie.

## Boundaries & Constraints

**Always:** Contexte/demande/tour immuables, IDs natifs confinés au connecteur. Verrou avant await, réponses vides refusées. Brouillon distinct lié à sa demande, conservé pendant navigation/invalidation ; après réouverture, historique non répondable sans relance. « Envoyée » seulement après preuve native positive et écriture durable. Préserver Mary/Forge, flux1.4, Snapshotv1 et six méthodes madness.

**Never:** Réponse par défaut, replay, redirection vers une nouvelle question, autre facturation, secret conservé. Approbations1.6, récupération1.7, refonte globale et graphe exclus.

## I/O & Edge-Case Matrix

| Cas | Entrée | Attendu | Échec |
|---|---|---|---|
| Question | Champs/options réels | Destinataire/contexte visibles, saisie conservée | Profil non couvert refusé |
| Envoi | Réponse valide/vide/double | Un seul envoi à la demande capturée | Aucun faux acquittement |
| Invalidation | Résolution, délai, arrêt, changement | Ancienne réponse gardée, contrôle invalidé | Jamais réaffectée |
| Restauration | Disque refusé/coupure/réouverture | Durabilité exacte, historique inactif | Aucun moteur relancé |

</frozen-after-approval>

## Code Map

- `src/adapters/codex/dialogue.ts` : RPC0 valide ; résultat écrit avant attente du reçu. Flag Default qualifié, raw expérimental ; reçu = thread/turn/call_id + output JSON exactement soumis. resolved seul n’est pas un ACK ; interruption réfutée par le spike. Délai du tour suspendu pendant l’attente.
- `src/core/{dialogue,ports,application}.ts` : réponse admise avant garde active, sans remplacer la promesse du tour ; réutiliser file disque et arrêt.
- `src/adapters/persistence/workflow-store.ts` : modèle d’annexe atomique bornée ; Snapshotv1 strict ne porte pas plusieurs brouillons liés.
- `src/renderer/src/App.tsx` : formulaire via pont dialogue, saisie libre séparée.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/{dialogue,questions}.ts`, `src/core/{ports,dialogue}.ts` : demandes/réponses normalisées, verrous, états et invalidation ; aucune approbation.
- [x] `src/adapters/{codex/dialogue,persistence/question-store}.ts`, `src/main/index.ts`, `src/preload/index.ts` : reçu exact, annexe versionnée, pont validé, arrêt libérant les attentes sans choix automatique.
- [x] `src/renderer/src/{App,QuestionPanel}.tsx`, `strings.ts`, `styles.css` : attente inline accessible et persistante, champs sauvegardés, envoi discret explicite ; Impeccable sans refonte.
- [x] `tests/` : matrice RPC/cœur/annexe/UI, ACK retardé/absent, expiration pendant sauvegarde, collision et arrêt ; conserver les régressions1.4.
- [x] `scripts/qualification/questions.mjs`, `qualification-questions/`, `docs/development.md` : banc compilé/paquet, preuve réelle distincte et nettoyage.

**Acceptance Criteria:**
- Given une question native réelle, when réponse explicite, then seul le reçu corrélé confirme l’envoi et la conversation poursuit.
- Given une saisie ancienne, when nouvelle question/navigation/réouverture, then elle reste au contexte initial sans envoi induit.

## Implementation Notes

Implémenteur : toutes les tâches code/tests/bancs isolés. Parent : revues, live, installation, commit et mandat. Pas seul : préserver les edits d’autrui ; profil personnel et protocol-spike.* réservés au parent.

Précision du reçu qualifié : égalité structurelle du JSON, sans dépendance à l’ordre des clés ; ordre des valeurs conservé. RPC0 valide. Resolved et raw peuvent arriver dans les deux ordres. Un terminal/invalidation libère le pending avant drainRequests, sans choix automatique.

## Plan Change Log

## Review Triage Log

| Source / lieu | Verdict | Vérification et route |
|---|---|---|
| Quick Q1 — `src/core/dialogue.ts:104` | high | Confirmé par test parent rouge : invalidated puis rejet du reçu donne `unknown` en mémoire mais `inactive` dans l’annexe. La réouverture perd l’incertitude de transmission. Route patch : conserver atomiquement l’état inconnu et la saisie avec révision suivante, sans nouvel envoi ni surface publique. |
| Quick Q2 — `src/adapters/codex/dialogue.ts:243` | high | Confirmé par test parent rouge : question derrière resolver bloqué, terminal reçu avant projection ; après libération, le formulaire est offert et drain attend le choix. Route patch : invalider/refuser aussi une question encore en file lorsque le terminal du tour est déjà observé, avec régression bornée et sans réponse native automatique. |
| Impeccable F1 — `src/renderer/src/App.tsx:309,359` | medium | Confirmé par source et capture bureau : une demande `sending` reste annoncée « attend votre réponse » ; le pied déduit Mary de l’invocation alors que la demande porte une identité inconnue. Route patch : indicateurs périphériques dérivés du véritable état/destinataire de la demande, en conservant les labels de conversation hors attente. Aucun nouveau besoin produit ni refonte globale. |

Chaque constat est vérifié séparément avant groupement ; trois causes distinctes, trois patches. Aucun constat rejeté ni différé. Les fichiers parent temporaires reproduisent Q1/Q2 sans fournisseur ; les régressions seront intégrées dans les tests normaux puis ces copies retirées. Finition Impeccable : disposition `fix`, ses autres sections `persistence/fidelity/ceiling/keep` préservent l’incumbent et les trois captures. Après correction, refaire les mêmes captures et demander un verdict au même relecteur, sans second détecteur.

Résolution : même implémenteur réengagé,60 tests cœur/protocole et cinq UI ciblés verts. Parent : ses deux reproductions deviennent vertes, types/build réussis ; copies temporaires retirées après intégration des régressions. Même Quick relecteur : Q1 résolu (QuestionStore réel, restauration et refus disque), Q2 résolu (retrait avant drain/collision/handler, tour suivant couvert). Même finition Impeccable, correction round1 et les trois mêmes captures recapturées : F1 état résolu et provenance résolue, disposition `ship`, portée limitée au formulaire. Aucun nouveau détecteur ni chasse supplémentaire. Suite, paquet et parcours final après ces modifications sont consignés séparément dans Verification.

## Design Notes

Risque high : destinataire/accord et perte de saisie. Profil0.144.6 expérimental épinglé ; secrets refusés. Expiration native autonome non qualifiée : délai connu invalide localement et arrête sans répondre. Refonte après l’epic.

## Verification

Matrice puis `npm test`, types/build Windows, banc compilé/paquet sans compte ; captures groupées et finition Impeccable. Vrai fournisseur/formulaire, arrêt/réouverture exacte, distincts du spike simulé. Préserver les saisies personnelles ; pas de contrôle JSON répété sans nouvel écart. Données conservées, profils nettoyés, gates inchangés.

Exécuté au26–27 octobre :192 tests réussis, aucun ignoré, types/build, banc compilé10/10 et paquet10/10, cinq régressions Windows. Course arrêt/conservation du reçu reproduite puis corrigée avant revue, régression incluse. Bloc figé recontrôlé inchangé.

Parcours natif : Mary réelle, deux demandes distinctes, un envoi explicite avec raw exact puis poursuite, seconde saisie gardée après arrêt et tardif refusé. `live-profile.json` conserve six succès et un échec de comparaison d’activité à la fermeture ; cause `interrupted`→`idle` reproduite sur port mémoire, contenu inchangé. `reopen-profile.json` ajoute cinq contrôles réussis sans fournisseur : snapshot durable exact, transcription/questions/brouillons et Forge identiques, UI historique, zéro spawn/réseau pendant3175ms après hook, sélection/nav/taille restituées et fermeture confirmée. Synthèse et limites dans `../qualification-questions/qualification-summary.json` ; aucune preuve partielle renommée en réussite intégrale. ASAR final `b9383fe88ede47775b356cddf9414ec5620ea3c0ff5c8e08971eb6a94740583e`.

Final après revue,27 octobre : **196/196**, aucun test ignoré, types/build, compilé10/10, paquet10/10, Windows5/5. Main `ccb1513373d2641ec852da3b19260f72f73fc9afddd288128c7761dc76716830`, ASAR `3762c7decc4ea044024eaf8e7e6aed94c21bd76a36889632257f694e54c0c99b`. Nouveau témoin distinct, `live-final-profile.json` : huit contrôles natifs réussis jusqu’à arrêt/réouverture exacte sans moteur ; aucun replay. Version installée identique : six contrôles de restauration, compte chiffré lisible, puis remplacement contrôlé du même paquet avec quinze fichiers identiques avant/après. `installation.json` conserve aussi la réserve du premier remplacement sans relevé initial ; la preuve à deux versions1.9 reste hors de cette qualification. Processus possédés fermés, témoins liés gardés ; aucune acceptation humaine visuelle globale ou distribution déduite. Aucun constat correctif différé.
