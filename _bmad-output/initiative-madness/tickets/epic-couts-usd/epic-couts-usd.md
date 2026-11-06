---
type: epic
title: "Consulter les coûts en dollars par epic et par US"
parent: initiative-madness
covers: ["R33"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: true
risk: high
---

# Consulter les coûts en dollars par epic et par US

## Description

Étendre les mesures par US de l’epic 2 aux coûts USD sourcés dans le projet ouvert. Qualifier une source monétaire avant de conserver et présenter les montants. Le relevé de qualification a commencé en lecture seule.

## Outcome

Dans Madness, le porteur retrouve les montants USD observés par US et par epic, leur provenance et la part du travail couverte.

## Requirements

- R1 (parent R33, demande du 5 novembre 2026) : Admettre un montant et une devise attestés, avec identité de reçu, portée et unité de facturation permettant un rapprochement indépendant. Un montant initialement dans une autre devise exige une conversion attestée. Conserver l’indisponibilité si la preuve manque.
- R2 (parent R33) : Associer chaque reçu admis au projet, à l’initiative, à l’occurrence d’US et à l’epic d’origine établis pour le travail. Compter chaque reçu une fois et conserver la preuve. Écarter du calcul les cas ambigus ou contradictoires. Un changement ultérieur de projet, de classement ou d’US ne réattribue aucune dépense.
- R3 (parent R33) : Présenter le coût observé par US et le total par epic du projet ouvert, avec preuve consultable et couverture explicite. Distinguer montant avec couverture complète du périmètre prouvé, montant partiel, indisponibilité et zéro attesté.

## Constraints

- C1 (parent C3, C4, C7) : Usage personnel Windows local, connexion SIWC et abonnement ChatGPT existants. La qualification initiale exploite code, schémas et témoins expurgés en lecture seule. Une observation externe éventuelle se greffe sur un échange utile autorisé. Le chantier courant exclut les essais de modèle, de compte ou de réseau, les changements d’authentification ou de facturation, et la préparation d’un installateur.
- C2 (parent C6) : Réutiliser les propriétaires et le rattachement de 2.11. Persistance atomique, calcul exact dans une unité qualifiée, arrondi réservé à la présentation et restauration passive. Les historiques restent lisibles avec un état inconnu.
- C3 (parent C1, C5) : Étendre le parcours des mesures de 2.12–2.14 avec Sally et Impeccable avant l’UI. Vérifier provenance, couverture, FR/EN, clavier et deux thèmes. Une estimation relève d’une décision distincte.

## Done when

1. La preuve native d’un montant attribuable indique source/version, montant/devise ou conversion attestée, unité, granularité, limites et clé de déduplication.
2. La matrice durable rapproche les reçus des bonnes US et de l’epic d’origine. Elle couvre zéro, doublons, retards, contradictions, échec de sauvegarde, rattachement absent, réouverture passive et changement de projet.
3. Dans l’application de développement, les montants affichés par US et par epic se rapprochent de cette matrice et leur couverture est explicite. Un scénario synthétique prouve le comportement de l’application. La disponibilité native exige la preuve de 5.1.

## Boundaries

- L’epic 2 possède R32, les mesures génériques et leur parcours. 5.1 consomme le dossier 2.10, 5.2 attend le rattachement de 2.11 et 5.3 le parcours de 2.13–2.14.
- Usage en tokens, limites ou crédits de compte et tarifs API restent distincts du coût USD attribuable sur SIWC. Le registre mesure le travail observé dans Madness.

## References

- [Initiative Madness, R33 et C1 à C7](../../initiative-madness.md)
- [Qualification 2.10, décisions D1 à D6](../epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md)
- [Règles de mesure par US](../../ux-madness/EXPERIENCE.md#epic2-metrics)
- [Relevé initial 5.1](qualification-source-usd.md)

## Notes

- Decision: 2026-11-06 — Le porteur demande de terminer le miroir puis d’ouvrir l’epic USD. 5.1 examine la source avant l’attribution durable 5.2. Le premier rapprochement de bout en bout, 5.3, reprend le backlog 3. La lecture locale démarre 5.1.
- Open question: Q5-1 — Quelle source autorisée fournit un montant USD vérifiable et attribuable sur SIWC ? La disponibilité native et le branchement monétaire attendent cette preuve.
- Open question: Q5-2 — Le porteur veut-il une estimation distincte si une méthode et des entrées fiables deviennent disponibles ?
