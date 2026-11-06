---
title: 'Réactiver le bouton d’arrêt Graphify après réouverture du panneau'
type: 'bugfix'
ticket: ''
created: '2026-11-06'
status: 'built'
baseline_revision: '6c98630eb6305f88714e20636b2ce673f60ec035'
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

Un refus asynchrone du pont d’arrêt pendant la préparation laisse le bouton désactivé si le panneau Graphe a été quitté puis rouvert. La demande en cours doit rester visible pendant la navigation. Si elle échoue, le panneau rouvert revient à la phase réelle et permet un nouvel arrêt. Le passage à une phase du moteur affiche toujours son état officiel.

</frozen-after-approval>

## Implementation Notes

Correctif local de la durée de vie de l’état optimiste dans le renderer. Le banc Electron exerce la navigation et une promesse de pont rejetée. Échec initial reproduit, puis deux tests Electron réussis. Le propriétaire React conserve le marqueur et compare l’identité de la requête avant de le retirer.

## Plan Change Log

## Review Triage Log

- Q1, faible, corrigé et recontrôlé. La phase officielle prime si le pont conserve simultanément un marqueur de préparation et une analyse active. Le banc a vérifié le libellé et le bouton actif dans cette projection.

## Verification

- `node --test tests/graph-ui.test.mjs` — le panneau remonté reste en arrêt demandé avant le refus puis réactive le bouton.
- `npm run typecheck` — types du renderer et de Main vérifiés.
