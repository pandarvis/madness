---
title: 'Banderole de génération du graphe'
type: 'feature'
ticket: ''
created: '2026-11-06'
status: 'built'
baseline_revision: '48ed83f254dc6440a44b895a0a66c6e0b1dc3310'
route: 'oneshot'
route_source: 'pinned'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Une génération Graphify peut durer plusieurs minutes et l’état actuel se fond dans le texte du panneau.

**Approach:** Dans le panneau du projet concerné, remplacer la ligne active par une banderole de chantier dans la charte atelier. Les bandes se déplacent brièvement au changement de phase, puis la banderole reste visible. Préparation, analyse et arrêt demandé suivent les états du moteur, en français et en anglais. La réduction de mouvement et l’arrêt demandé présentent un ruban fixe. Les résultats et l’action d’interruption restent consultables.

</frozen-after-approval>

## Implementation Notes

One-shot de présentation. Une annonce existante, aucun pourcentage simulé. Animation finie sur une bande étroite et décorative.

## Plan Change Log

## Review Triage Log

## Verification

Relecture Quick avec recontrôles. Les preuves et les limites sont détaillées dans la [vérification 0.2.21](./tickets/epic-graphe-projet/qualification-paquet-graphe/verification-madness-0.2.21.md).
