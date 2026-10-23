---
type: epic
title: "Dialoguer réellement avec Codex dans Madness"
parent: initiative-madness
covers: ["R12", "R13", "R14", "R15", "R16", "R17", "R18", "R22", "R25", "R27"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: true
risk: high
---
# Dialoguer réellement avec Codex dans Madness

## Description

Une première version Windows installable ouvre un dossier BMad de référence, lance un workflow avec Codex, permet questions et approbations, puis montre le résultat et les chemins produits. Elle qualifie G0/G1 et le profil BMad de référence nécessaire à cette preuve, possède les contrats partagés, la conservation locale et la procédure de reconstruction ; les capacités réelles et les limites sont visibles.

## Outcome

Un développeur dialogue réellement avec Codex dans un paquet Windows sur un projet BMad de référence, comprend l'activité et les attentes, puis retrouve ses échanges et son brouillon après réouverture.

## Requirements

- R1 (parent R12) : Lancer depuis Madness les workflows du catalogue pris en charge avec Codex dans le projet et l'initiative indiqués, puis rejoindre leur conversation réelle ; respecter leurs conditions et formes d'interaction, y compris lorsqu'un usage autonome est prévu.

- R2 (parent R13) : Lire les retours de l'agent avec son identité connue, le fournisseur, l'invocation et le contexte, puis répondre aux questions et poursuivre les échanges dans Madness ; un retour de texte final seul ne tient pas lieu de dialogue intégré.

- R3 (parent R14) : Traiter les demandes d'approbation dans Madness en présentant opération, portée et effets ou fichiers avant le choix ; accepter autorise uniquement l'opération annoncée, demander un ajustement poursuit le dialogue, et navigation ou fermeture ne vaut pas accord.

- R4 (parent R15) : Rendre visibles travail en cours, réponse ou approbation attendue, interruption, erreur et fin de tour, avec l'action attendue et un retour accessible depuis le projet et l'accueil ; utiliser un libellé et une preuve connue, sans faux pourcentage ni attente limitée à une notification temporaire.

- R5 (parent R16) : Conserver la saisie pendant navigation, consultation de fichiers et interruption ; envoyer explicitement à l'agent identifié, refuser un envoi vide et un double lancement, et n'annoncer une réponse envoyée qu'après confirmation fiable de la connexion.

- R6 (parent R17) : Pouvoir interrompre et reprendre ou réessayer selon les capacités réelles, en conservant le dernier contexte connu ; distinguer succès, échec et résultat inconnu, puis vérifier ce dernier avant de rejouer une opération.

- R7 (parent R18) : À la fin d'un tour, présenter les résultats proposés, décisions humaines identifiables, fichiers concernés et prochaine action attendue ; rendre distincts fin du tour, clôture du workflow et validation des livrables.

- R8 (parent R22) : Identifier la connexion Codex, ses capacités réelles et son indisponibilité ; expliquer une opération impossible, conserver les informations déjà connues avec leur portée et proposer une récupération sans annoncer d'exécution autonome ou de reprise non prise en charge.

- R9 (parent R25) : Après fermeture et réouverture de Madness, retrouver les projets, conversations et brouillons conservés localement, sans relance automatique d'un agent ; présenter les activités et demandes restaurées comme historiques ou inconnues tant qu'elles ne sont pas vérifiées.

- R10 (parent R27) : Pouvoir mettre à jour les dépendances et le runtime, reconstruire puis republier une version Windows par une procédure vérifiable ; le remplacement du programme conserve les données locales, avec les versions et limites réellement testées consignées.

## Constraints

- C1 (parent C1) : L'expérience utilisateur est le premier critère d'arbitrage du périmètre, de l'architecture et des interactions ; les décisions doivent préserver compréhension, guidage et contrôle par un développeur qui découvre BMad.

- C2 (parent C2) : Le périmètre livré est Windows, Codex et BMad v7 uniquement ; une étiquette v7 ne suffit pas à garantir la compatibilité de ses formats et compétences.

- C3 (parent C3) : Les projets et leurs artefacts BMad locaux existants restent exploitables ; la reprise ne requiert ni migration d'une ancienne version ni reconstruction supposée de conversations externes.

- C4 (parent C4) : L'intégration retenue doit être vérifiée contre les interfaces, versions, capacités et modes d'authentification officiellement disponibles pour un produit distribué ; le choix d'un connecteur et sa preuve réelle restent à faire.

- C5 (parent C5) : DESIGN.md et EXPERIENCE.md sont les contrats visuel et comportemental adoptés et prévalent sur les maquettes ; la base française claire reste acceptée. Sally complète les contrats pour l'anglais, le sombre et la vue Graphe avec Impeccable avant les implémentations concernées ; leurs hypothèses et limites restent explicites, sans preuve d'intégration déduite de la simulation.

- C6 (parent C6) : Le socle retenu est Electron + React + TypeScript, starter electron-vite et packaging electron-builder. Le contrat d'architecture adopté gouverne les frontières, contrats partagés, autorités et profils qualifiés des lots ; ses décisions AD-1 à AD-10 gardent leurs identifiants. Les versions candidates restent à qualifier avant leurs consommateurs.

- C7 (parent C7) : La distribution est gratuite pour commencer, sans licence open source présumée. Projet personnel utilisable en environnement professionnel : les previews sont autorisées si choisies et signalées ; le runtime doit être acceptable par le proxy cible, sans exigence du tout dernier Chromium exact. La reconstruction et la republication doivent rester simples ; l'auto-updater n'est pas requis pour la V1.

## Done when

1. Un paquet Windows construit à partir du socle retenu démarre ; G0 établit les contrats de contexte, commandes/événements, cycle de vie et persistance avant leurs consommateurs, avec les frontières Electron d'AD-1 (R10 ; C6-C7).
2. G1 démontre une voie Codex officiellement utilisable par Madness, avec authentification et versions observées. Le profil BMad de référence requis pour ce premier workflow est qualifié ici ; une fenêtre, un login seul ou un export de schémas ne remplace pas cette preuve (R1, R2, R8 ; C2, C4).
3. Dans l'application installée, un workflow BMad réel est invoqué au bon contexte avec invocation visible ; messages, question/réponse et approbation limitée à l'opération sont vérifiés, selon les conditions du workflow. Le résultat et les chemins concernés sont retrouvés (R1-R3, R5).
4. Travail, attente, interruption, échec, fin de tour et résultat inconnu sont compréhensibles ; envoi et réessai suivent les confirmations réelles du connecteur, sans accord inventé ni rejeu automatique d'un effet incertain (R4-R8).
5. Projets, conversations et brouillons restent conservés localement après fermeture/réouverture, sans relance d'agent. Les activités et demandes historiques ne deviennent pas des attentes actives sans vérification (R5, R9).
6. Une procédure de montée de version, reconstruction et republication est vérifiée ; le remplacement du programme préserve ses données locales. Le paquet et les capacités qualifiées sont disponibles avec leurs limites explicites (R9-R10 ; C7).

## Boundaries

- Possède le socle Electron/React/TypeScript, electron-vite, electron-builder, les contrats communs et leur propriété par le cœur, la coordination du cycle de vie, le stockage local et le connecteur Codex.
- Premier chemin intégré : dossier BMad de référence → invocation réelle → question et réponse → fin de tour et chemins produits → fermeture/réouverture. La qualification du profil de référence est incluse ; les cas étendus G2 appartiennent à epic-projets-bmad.
- Produit les contrats et capacités de lancement, dialogue, contexte et persistance consommés par epic-projets-bmad. Celui-ci fournit ensuite le catalogue, les fiches d'action et le guidage complet ; le connecteur reste propriétaire des événements et retours réels.
- La base UX française claire adoptée gouverne cette première boucle. Les variantes anglaise/sombre, le suivi multi-projet complet, le panneau de fichiers et l'éditeur appartiennent à epic-projets-bmad ; les contrats applicables d'accessibilité et de conservation du contexte restent respectés.
- Initialisation BMad : epic-initialisation-bmad. Graphe : epic-graphe-projet. Claude Code/Copilot et les conversations externes restent les extensions nommées dans l'initiative.
- Les attentes de R4 sont accessibles dans le projet et l'accueil dès cet epic ; epic-projets-bmad complète ensuite les récents et le suivi multi-projet. Leur visibilité n'est pas différée à la livraison du catalogue.
- Lors de la préparation des stories, G0 et les contrats communs précèdent leurs consommateurs. La première incertitude à prouver en G1 est la voie Codex et le profil BMad de référence, avant d'élargir l'interface. Les choix de stockage, schéma et migrations relèvent de l'unité de persistance avant ses consommateurs, conformément aux Deferred et AD-5 de l'architecture.
- Les preuves sont obtenues dans la version intégrée ; la présence des exigences, le statut raffiné, les versions candidates et les données simulées ne valent pas passage de G0 ou G1.

## References

- parent — [Initiative Madness](../../initiative-madness.md), `_bmad-output/initiative-madness/initiative-madness.md` ; Requirements R12–R18, R22, R25, R27 ; lignes locales R1–R7 → parent R12–R18, R8 → R22, R9 → R25, R10 → R27 ; Constraints C1–C7, Done when, Boundaries et Notes. C8 concerne le futur graphe, hors cet epic.
- architecture — [Contrat de Winston adopté](../../architecture-madness/architecture-madness.md) ; AD-1 à AD-9 ; G0 et G1 ; AD-10 pour la frontière des futures analyses. Companion conservé sans modification, AD stables ; les gates restent des preuves à produire.
- design — [Contrat visuel adopté](../../ux-madness/DESIGN.md) ; base française claire acceptée, extensions selon C5.
- experience — [Contrat comportemental adopté](../../ux-madness/EXPERIENCE.md) ; parcours, états et accessibilité, avec décisions récentes de l’initiative prévalant sur les mentions historiques A2/Q6.
- ordre — [Découpage approuvé](../tickets.toml) ; identifiant 1 et prérequis de capacités à reporter sur les stories qui les consommeront.

## Notes

- Decision: 2026-10-23 — Périmètre et position de premier epic validés par le porteur. Le socle et les contrats précèdent leurs consommateurs ; la première preuve porte sur une vraie boucle BMad/Codex et sur le profil de référence qu'elle utilise.

- Decision: 2026-10-23 — Enveloppe créée sans raffinement ni stories. L'authentification Codex et le protocole réel restent à qualifier dans cet epic, selon Q2/G1 de l'initiative.

- Decision: 2026-10-23 — Le porteur demande le raffinement du premier epic après validation et commit des quatre enveloppes. Les dix lignes parent couvertes sont le seul input d'exigences ; elles sont reprises dans les mêmes mots avec identifiants locaux R1–R10. Les contraintes C1–C7 sont héritées, sans nouvelle exigence, nouveau choix produit ou changement de couverture.

- Decision: 2026-10-23 — Aucun arbitrage produit supplémentaire n'est nécessaire pour ce raffinement. G0/G1, le profil BMad de référence et les choix techniques de l'unité de persistance restent des travaux de réalisation dans les limites du contrat adopté ; les stories seront planifiées séparément.
