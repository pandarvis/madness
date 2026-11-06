---
title: 'Capturer le code de Madness avec Graphify'
type: 'bugfix'
ticket: ''
created: '2026-11-06'
status: 'built'
baseline_revision: '48ed83f254dc6440a44b895a0a66c6e0b1dc3310'
route: 'oneshot'
route_source: 'pinned'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La capture du dépôt réel atteint 16 Mio en comptant l’assemblage local généré de Graphify et le lanceur remplace le motif par un état de processus.

**Approach:** Ignorer uniquement l’assemblage généré au chemin exact dont le manifeste physique correspond à celui du runtime. Continuer à capturer les sources ordinaires et à appliquer les limites. Transmettre les seuls refus de périmètre reconnus sous forme de codes fermés et les expliquer en français et en anglais. Vérifier une génération réelle et conserver les contrôles de fermeture.

</frozen-after-approval>

## Implementation Notes

One-shot borné à la capture et au diagnostic. L’essai 0.2.19 échoue avant analyse, puis le diagnostic natif isole SOURCE_TOTAL_LIMIT.

## Plan Change Log

## Review Triage Log

## Verification

Relecture Quick avec recontrôles. Les preuves et les limites sont détaillées dans la [vérification 0.2.21](./tickets/epic-graphe-projet/qualification-paquet-graphe/verification-madness-0.2.21.md).
