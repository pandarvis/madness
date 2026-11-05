---
id: 3
type: story
title: "Consulter le coût en dollars par epic et par US"
parent: none
covers: []
after: []
refined: false
hitl: false
risk: high
---

# Consulter le coût en dollars par epic et par US

## Description

Afficher dans Madness un montant en USD par US et un total par epic pour le projet ouvert. Donner la source et la couverture de chaque montant. Rattacher les dépenses observées à leur US et à son epic d’origine et compter une seule fois chaque dépense.

## Requirements

Verify: des reçus USD qualifiés, dont un zéro explicite, se rapprochent des montants de leurs US et de l’epic. Un doublon ou une dépense sans rattachement fiable ne gonfle aucun total. Un epic avec des coûts manquants indique que le montant est partiel ou indisponible. Un changement de projet ne réattribue aucun coût.

## References

- Produit — `_bmad-output/initiative-madness/initiative-madness.md`, R32.
- Qualification — `_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md`, provenance et disponibilité du montant par US.

## Notes

- Decision: 2026-11-05 — Le porteur demande un montant USD par epic et US dans Madness. La mesure concerne les projets ouverts. Le périmètre actuel de la connexion SIWC n’a pas livré de montant attribuable qualifié. Un tarif API ne fournit pas un montant facturé pour un abonnement ChatGPT.
- Open question: quelle source fournit un montant attribuable en USD ou une conversion attestée, et faut-il afficher séparément une estimation quand les entrées nécessaires sont disponibles ? L’estimation reste une décision distincte.
- Contrôle high : rapprochement des reçus sources, des rattachements et des agrégats après réouverture, avec doublons, couverture partielle et absence de montant.
