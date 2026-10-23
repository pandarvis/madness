---
title: "Madness — rendre BMad visible et pilotable"
status: draft
created: 2026-10-22
updated: 2026-10-22
---

# Madness — brief produit

## Intention et utilisateurs

Madness est une interface graphique destinée aux développeurs qui utilisent ou découvrent BMad sur des projets locaux. Le produit doit être distribuable à d'autres développeurs. Sa première version cible **Windows, Codex et BMad v7 uniquement**.

Le problème à résoudre : dans une conversation avec un agent, l'utilisateur ne sait pas toujours quel workflow BMad est actif, où en est le projet, quelles actions sont possibles et quels fichiers portent les résultats. Madness relie le parcours, la conversation et les livrables pour rendre le travail compréhensible et pilotable.

## Priorité : l'expérience utilisateur

L'UX est la priorité absolue exprimée par le porteur du projet et le premier critère des arbitrages de périmètre, d'architecture et d'interaction. L'utilisateur doit pouvoir avancer sans connaître les commandes BMad au préalable.

Madness recommande une prochaine action et explique pourquoi, propose les alternatives pertinentes et donne accès au catalogue complet. Les possibilités sont découvertes progressivement ; elles ne forment pas une succession d'étapes obligatoires. La première interface s'inspire de Codex Desktop ; Impeccable accompagne sa conception.

## Périmètre confirmé de la V1

- **Projets locaux** : ouvrir un ou plusieurs projets et retrouver leurs initiatives, leurs étapes et les fichiers associés. Reprendre le suivi d'un projet déjà en cours à partir de ses artefacts BMad.
- **Premier démarrage accompagné** : lorsqu'un dossier ne contient pas BMad, expliquer les prérequis et les changements prévus, puis initialiser BMad v7 avec l'accord de l'utilisateur. Aider à comprendre et corriger un problème de configuration.
- **Possibilités BMad complètes** : découvrir l'ensemble des compétences v7 installées et permettre leur invocation avec Codex. Cela comprend la méthode, les outils transversaux et les autres modules présents, sans privilégier un workflow particulier. Respecter les conditions propres à chaque workflow ; signaler les compétences absentes ou incompatibles.
- **Guidage contextuel** : utiliser la compétence `bmad`, l'aide des modules et le contexte du projet pour répondre à « Que faire ensuite ? ». Pour chaque action, rendre accessibles son objectif, son invocation réelle, les entrées nécessaires et les livrables ou effets attendus.
- **Dialogue intégré** : lancer les workflows, afficher les retours des agents et permettre de répondre aux questions et aux demandes d'approbation dans Madness.
- **État compréhensible** : montrer le workflow actif, les fichiers pertinents, les attentes et les résultats connus. Distinguer un état déduit, une proposition et une décision acceptée. L'existence d'un fichier ou la fin d'une exécution ne prouve pas sa validation.
- **Continuité** : prendre en compte les modifications externes des fichiers BMad. Indiquer clairement si l'agent travaille, attend une réponse ou termine un tour, avec un récapitulatif utile et la prochaine action attendue.

La V1 ne prend pas en charge les versions antérieures à BMad v7 ni leur migration. La compatibilité des installations v7 doit être vérifiée : leur numéro majeur seul ne garantit pas la présence des compétences et formats attendus.

## Parcours de référence et critères de réussite

Un développeur choisit un dossier, retrouve son projet ou est accompagné pour initialiser BMad, puis comprend l'état connu et les livrables disponibles. Il reçoit une recommandation expliquée, découvre les alternatives et lance une action. Il poursuit le dialogue avec Codex et retrouve son résultat dans le parcours du projet.

La première version doit permettre de vérifier que l'utilisateur peut :

1. Comprendre où en est le projet et accéder aux fichiers qui justifient l'état affiché.
2. Choisir une action pertinente sans mémoriser les commandes, tout en ayant accès au catalogue installé.
3. Initialiser BMad v7 dans un dossier non équipé avec des changements expliqués et acceptés.
4. Exécuter les workflows installés, poursuivre leur dialogue et retrouver leurs résultats, en couvrant leurs différentes formes d'interaction.
5. Identifier une attente, une fin de tour ou un problème, et comprendre comment continuer.
6. Retrouver une modification externe des artefacts sans que Madness invente l'état de la conversation qui l'a produite.

La validation UX inclura un utilisateur peu familier de BMad sur ces parcours. Aucun test utilisateur ni connecteur n'a encore été réalisé ; les critères détaillés seront définis dans le travail UX et les exigences.

## Extensions et décisions pour les étapes suivantes

GitHub Copilot, Claude Code avec Bedrock ou abonnement lorsque la voie d'intégration le permet, les autres systèmes d'exploitation et le suivi en direct des conversations lancées dans d'autres outils restent des extensions après la V1.

Le choix Electron ou interface web avec service local, le framework UI, les modalités d'intégration Codex et la détection fiable des états restent à instruire. Electron est une recommandation technique actuelle, pas une décision approuvée. Les compositions visuelles et autres pistes du party-mode restent des propositions à éprouver dans le travail UX.

Les sources, comparaisons techniques et pistes détaillées sont conservées dans `addendum.md`. Ce brief est proposé à validation ; il ne constitue pas une architecture approuvée.
