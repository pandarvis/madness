# Madness

<!-- impeccable:product-schema 1 -->

## Platform

web

L'interface utilisera une technologie web dans une application Electron pour Windows, choix confirmé le 23 octobre 2026. `web` décrit ici la surface selon la nomenclature Impeccable.

## Stack

Electron + TypeScript, retenu après comparaison avec un navigateur accompagné d'un service local et avec Tauri. Le porteur adopte ensuite React, le starter electron-vite et electron-builder pour le packaging. Interface commune, cœur local et connecteurs séparés constituent le découpage adopté. Les versions exactes seront qualifiées et conservées par livraison ; les versions preview sont autorisées si utiles. Le format de stockage et la diffusion finale restent à préciser dans les lots concernés.

## Users

Développeurs travaillant sur un ou plusieurs projets locaux avec BMad. Le produit doit être distribuable à d'autres développeurs, gratuitement pour commencer. C'est un projet personnel, utilisable dans un environnement professionnel ; aucune politique d'entreprise imposant uniquement des versions stables n'est demandée. La licence n'est pas encore décidée.

## Product Purpose

Rendre le travail BMad visible et pilotable : comprendre où en est un projet, quelles étapes et commandes sont pertinentes, ce que font les agents et quels fichiers correspondent à leurs résultats.

## Positioning

Une interface de suivi et de pilotage centrée sur les workflows BMad et leurs livrables, reliée aux environnements d'agents utilisés par le développeur.

## Operating Context

Ouverture de dossiers locaux ; un ou plusieurs projets ; première version distribuée sur Windows avec Codex. La V1 reprend un projet BMad déjà en cours, guide le développeur parmi toutes les possibilités installées et permet de lancer les workflows et de dialoguer dans Madness. Le suivi en direct des sessions créées dans VS Code ou ChatGPT Desktop/Codex reste une cible complémentaire dont les modalités sont à démontrer.

La V1 accompagne aussi le premier démarrage dans un dossier qui ne contient pas BMad : diagnostic, explication des prérequis, présentation des changements et initialisation guidée de BMad v7 avec accord de l'utilisateur.

Après fermeture et réouverture, retrouver les projets, les conversations et les brouillons conservés localement, sans relancer automatiquement un agent. Le porteur a confirmé ce comportement le 23 octobre 2026 ; le format de stockage reste à définir dans l'architecture et l'implémentation.

## Capabilities and Constraints

- La V1 prend en charge BMad v7 uniquement. Les versions antérieures et leur migration sont hors périmètre ; la compatibilité de l'installation v7 reste à vérifier à l'ouverture du projet.
- Inclure l'initialisation guidée de BMad v7 dans un projet local qui ne le contient pas encore.
- Inclure dans la V1 un outil optionnel de graphe du projet ouvert fondé sur Graphify, après la base Windows/Codex : code, modules, fichiers et dépendances. Génération locale à la demande et vue intégrée sont en cadrage ; leur fonctionnement reste à qualifier. Les liens sémantiques vers les documents BMad sont reportés hors de ce premier profil.
- Afficher les étapes BMad, leur état connu, les invocations associées et les fichiers produits.
- Proposer « Que faire ensuite ? » à partir de la compétence `bmad`, de l'aide des modules v7 installés et du contexte du projet.
- Donner accès à l'ensemble du catalogue BMad v7 installé et permettre son invocation via Codex dès la V1, en respectant les conditions propres à chaque workflow.
- À chaque étape, recommander une action avec sa raison et proposer les alternatives pertinentes, y compris les outils transversaux. Montrer l'objectif, les entrées et les effets ou livrables attendus de chaque action. Aucun workflow particulier ne constitue le focus du produit ; `party-mode` est un exemple parmi les possibilités BMad.
- Afficher les retours des agents et permettre à l'utilisateur de répondre dans l'interface.
- L'architecture prévoit Codex, GitHub Copilot et Claude Code avec Bedrock ou abonnement direct ; la livraison sera progressive sur Windows, avec Codex d'abord. Chaque mode de connexion doit être qualifié avant d'être annoncé disponible.
- Distinguer les capacités de chaque connexion et les états déduits des états explicitement confirmés.
- Vérifier les interfaces officiellement disponibles, la compatibilité des versions et les voies d'authentification pour un produit distribué.
- Prévoir une interface et un cœur local communs, avec un connecteur distinct par fournisseur ; chaque conversation garde son fournisseur et sa connexion d'origine.
- Faciliter les mises à jour des dépendances et du runtime Electron, puis la reconstruction et la republication côté développeur. Le proxy accepte un runtime au-dessus d'un minimum ; la version minimale exacte reste à qualifier sur la machine cible. Une mise à jour automatique de l'application n'est pas requise par cette précision.
- Les autres systèmes d'exploitation restent des extensions après Windows.

## Brand Commitments

Nom de travail : Madness. Première interface inspirée de Codex Desktop, selon la capture fournie par l'utilisateur. Utiliser Impeccable pour le travail de conception. Le français est la langue de travail ; le porteur choisit le français et l'anglais, avec thèmes clair et sombre, pour la première version distribuée.

Décision du porteur le 24 octobre 2026 : le thème sombre sera le thème par défaut, avec un accent terracotta orangé et un bleu complémentaire. Le thème clair reste une alternative prévue. Les contrats UX acceptés et l'interface actuelle couvrent la base française claire ; la palette sombre précise, ses contrastes et son application aux composants restent à concevoir et vérifier avec Sally et Impeccable.

## Evidence on Hand

Besoin et réponses utilisateur des 22 et 23 octobre 2026 ; deux captures de Codex Desktop fournies dans le chat ; installation réelle BMad v7 preview dans ce dépôt ; recherche documentaire et brief sous `_bmad-output/initiative-madness/brief-madness/`.

La première base UX et la navigation rétractable du prototype « Parcours guidé » ont été acceptées le 23 octobre 2026. Les trois parcours ont été vérifiés dans une simulation HTML ; les contrats finalisés se trouvent dans `_bmad-output/initiative-madness/ux-madness/DESIGN.md` et `EXPERIENCE.md`. Cette prise en main ne constitue pas une étude utilisateur. Aucun connecteur ni parcours sur des projets réels n'a encore été testé.

## Product Principles

- L'expérience utilisateur est la priorité absolue exprimée par le porteur du projet et le premier critère d'arbitrage du périmètre, de l'architecture et des interactions.
- Le workflow, son état et ses livrables restent visibles à côté de la conversation.
- Montrer l'invocation réelle et les preuves qui justifient l'état affiché.
- Adapter le parcours BMad au besoin et à la version installée.
- Préserver l'intervention de l'utilisateur lorsque l'agent attend une réponse ou une approbation.
- Guider activement un développeur peu familier de BMad : proposer et expliquer les possibilités utiles, sans transformer le catalogue en succession d'étapes obligatoires.
- Rendre explicite le moment où l'agent travaille, attend une réponse ou termine un tour ; distinguer les propositions des décisions acceptées et indiquer la prochaine action attendue.
