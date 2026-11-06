---
title: 'Observer une preuve d’usage Codex pour la qualification USD'
type: 'feature'
ticket: 1
created: '2026-11-06'
status: 'built'
baseline_revision: '21b3cb239acf019066ea97a4c7eca6865aad96e0'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L’absence d’un reçu USD qualifié ne permet pas d’afficher un prix. La notification d’usage connue est filtrée avant les mesures, donc le prochain échange utile ne peut pas servir de témoin de réception.

**Approach:** Observer et conserver le premier échantillon Codex valide par tour possédé après son ACK natif, par paire fil/tour, dans le registre de mesures existant. Un seul échantillon par tour suffit à prouver la réception et borne la persistance. Les compteurs projetés restent une observation ponctuelle, distincte du total par tour et du coût. Aucun envoi, changement de compte, appel réseau dédié ou release.

La validation couvre le trajet RPC vers stockage, la corrélation d’un événement tardif, les événements non corrélés et mal formés, le doublon, les zéros attestés par le message, le cloisonnement des champs, et la réouverture d’un registre ancien ou enrichi.

</frozen-after-approval>

## Implementation Notes

- Base déjà relevée. Le fichier de test historique modifié avant cette intervention ne présente aucun changement hors fin de ligne et reste hors du diff.
- Le canal de mesures de durée est indépendant. L’archive v1 accepte la preuve facultative, avec validation des seuls compteurs sélectionnés, identité native rattachée à l’ACK et empreinte du contenu projeté.

## Plan Change Log

## Review Triage Log

- Quick, six constats résolus au recontrôle : réassocier par identifiant après restauration, valider les seuls compteurs déclarés, rendre le cas pré-ACK distinct dans le test, isoler la durabilité de la durée, réserver 512 Kio aux échantillons indépendamment des 8 Mio de mesures, et revérifier le SHA-256 à l’écriture et à la lecture. Le test de transport couvre la durabilité et la modification de compteur refusée.
- Le spike se clôt sur une conclusion de disponibilité négative. Il prépare l’observation native sans qualifier un reçu monétaire ni lever les dépendances de 5.2.

## Verification

- node --test tests/us-metrics-protocol.test.mjs tests/us-metrics.test.mjs
- npm run typecheck
