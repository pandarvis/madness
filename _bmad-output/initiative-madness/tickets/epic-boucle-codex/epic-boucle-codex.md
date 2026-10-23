---
type: epic
title: "Dialoguer réellement avec Codex dans Madness"
parent: initiative-madness
covers: ["R12", "R13", "R14", "R15", "R16", "R17", "R18", "R22", "R25", "R27"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: false
risk: high
---
# Dialoguer réellement avec Codex dans Madness

## Description

Une première version Windows installable ouvre un dossier BMad de référence, lance un workflow avec Codex, permet questions et approbations, puis montre le résultat et les chemins produits. Elle qualifie G0/G1 et le profil BMad de référence nécessaire à cette preuve, possède les contrats partagés, la conservation locale et la procédure de reconstruction ; les capacités réelles et les limites sont visibles.

## Outcome

Un développeur dialogue réellement avec Codex dans un paquet Windows sur un projet BMad de référence, comprend l'activité et les attentes, puis retrouve ses échanges et son brouillon après réouverture.

## Done when

1. Un paquet Windows construit à partir du socle retenu démarre ; G0 établit les contrats de contexte, commandes/événements, cycle de vie et persistance avant leurs consommateurs, avec les frontières Electron d'AD-1.
2. G1 démontre une voie Codex officiellement utilisable par Madness, avec authentification et versions observées. Le profil BMad de référence requis pour ce premier workflow est qualifié ici ; une fenêtre, un login seul ou un export de schémas ne remplace pas cette preuve.
3. Dans l'application installée, un workflow BMad réel est invoqué au bon contexte avec invocation visible ; messages, question/réponse et approbation limitée à l'opération sont vérifiés, selon les conditions du workflow. Le résultat et les chemins concernés sont retrouvés.
4. Travail, attente, interruption, échec, fin de tour et résultat inconnu sont compréhensibles ; envoi et réessai suivent les confirmations réelles du connecteur, sans accord inventé ni rejeu automatique d'un effet incertain.
5. Projets, conversations et brouillons restent conservés localement après fermeture/réouverture, sans relance d'agent. Les activités et demandes historiques ne deviennent pas des attentes actives sans vérification.
6. Une procédure de montée de version, reconstruction et republication est vérifiée ; le remplacement du programme préserve ses données locales. Le paquet et les capacités qualifiées sont disponibles avec leurs limites explicites.

## Boundaries

- Possède le socle Electron/React/TypeScript, electron-vite, electron-builder, les contrats communs et leur propriété par le cœur, la coordination du cycle de vie, le stockage local et le connecteur Codex.
- Premier chemin intégré : dossier BMad de référence → invocation réelle → question et réponse → fin de tour et chemins produits → fermeture/réouverture. La qualification du profil de référence est incluse ; les cas étendus G2 appartiennent à epic-projets-bmad.
- Produit les contrats et capacités de lancement, dialogue, contexte et persistance consommés par epic-projets-bmad. Celui-ci fournit ensuite le catalogue, les fiches d'action et le guidage complet ; le connecteur reste propriétaire des événements et retours réels.
- La base UX française claire adoptée gouverne cette première boucle. Les variantes anglaise/sombre, le suivi multi-projet complet, le panneau de fichiers et l'éditeur appartiennent à epic-projets-bmad ; les contrats applicables d'accessibilité et de conservation du contexte restent respectés.
- Initialisation BMad : epic-initialisation-bmad. Graphe : epic-graphe-projet. Claude Code/Copilot et les conversations externes restent les extensions nommées dans l'initiative.

## References

- parent — [Initiative Madness](../../initiative-madness.md), `_bmad-output/initiative-madness/initiative-madness.md` ; Requirements R12, R13, R14, R15, R16, R17, R18, R22, R25, R27 ; Constraints C1–C8, Done when, Boundaries et Notes.
- architecture — [Contrat de Winston adopté](../../architecture-madness/architecture-madness.md) ; AD-1 à AD-9 ; G0 et G1 ; AD-10 pour la frontière des futures analyses. Companion conservé sans modification, AD stables ; les gates restent des preuves à produire.
- design — [Contrat visuel adopté](../../ux-madness/DESIGN.md) ; base française claire acceptée, extensions selon C5.
- experience — [Contrat comportemental adopté](../../ux-madness/EXPERIENCE.md) ; parcours, états et accessibilité, avec décisions récentes de l’initiative prévalant sur les mentions historiques A2/Q6.
- ordre — [Découpage approuvé](../tickets.toml) ; identifiant 1 et prérequis de capacités à reporter sur les stories qui les consommeront.

## Notes

- Decision: 2026-10-23 — Périmètre et position de premier epic validés par le porteur. Le socle et les contrats précèdent leurs consommateurs ; la première preuve porte sur une vraie boucle BMad/Codex et sur le profil de référence qu'elle utilise.

- Decision: 2026-10-23 — Enveloppe créée sans raffinement ni stories. L'authentification Codex et le protocole réel restent à qualifier dans cet epic, selon Q2/G1 de l'initiative.
