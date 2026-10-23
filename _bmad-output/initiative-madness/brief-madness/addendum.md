# Notes techniques — Madness

État : propositions et recherche documentaire du 22 octobre 2026. Aucun connecteur n'a encore été développé ou testé. Les capacités documentées ne constituent pas une validation sur les versions installées chez les utilisateurs.

## Prochaine preuve technique proposée

Sur Windows avec Codex, la première preuve doit ouvrir un projet BMad v7 existant, vérifier son installation, charger son aide et retrouver ses livrables. Faire produire une recommandation contextualisée avec l'invocation réelle et les fichiers qui la justifient, puis lancer une compétence et poursuivre son dialogue dans l'interface. Vérifier aussi une question utilisateur, une demande d'approbation et le cas d'une compétence absente ou incompatible. Aucun accès aux conversations externes n'est nécessaire pour démontrer ce parcours.

Pour le suivi externe, une seconde preuve restera nécessaire : identifier une session créée ailleurs par une interface officielle, recevoir un événement en direct puis répondre si le protocole le permet. Un succès sur VS Code ne valide pas Codex Desktop. Ces tests ne sont pas encore réalisés.

## Le minimum : l'aide BMad sur un projet existant

Ce minimum reste un parcours d'entrée, mais la V1 confirmée couvre désormais l'ensemble des compétences BMad v7 installées, leur lancement et le dialogue intégré via Codex sur Windows. Le catalogue et l'accompagnement contextuel font partie du produit dès sa première version.

Le besoin formulé comme « utiliser bmad-help pour savoir quoi faire » désigne une fonction produit : orienter le développeur dans le projet qu'il ouvre. L'intitulé visible peut être « Que faire ensuite ? ». Le périmètre confirmé est BMad v7 uniquement pour la V1 ; son point d'entrée est la compétence `bmad`.

La v7 installée dans ce dépôt utilise la compétence `bmad`. Son script `knowledge.py` fournit l'aide des modules ; le workflow lit aussi la configuration et les tickets ou artefacts pertinents pour contextualiser sa recommandation. Afficher un catalogue de compétences seul ne suffit donc pas à établir la prochaine étape. Charger l'aide est déterministe ; produire une recommandation avec un agent dépend du fournisseur choisi. L'interface doit distinguer le statut et les preuves du chargement de l'aide de ceux de la recommandation.

L'invocation proposée doit être visible et explicite. Les versions antérieures sont signalées comme non prises en charge ; aucun adaptateur ni migration v6 n'est prévu dans la V1. Une installation v7 inconnue ou incompatible est également signalée, car le numéro majeur seul ne garantit pas la présence des compétences et formats attendus.

## Accompagnement et catalogue BMad

L'utilisateur connaît peu BMad et souhaite un accompagnement actif. L'interface propose une action recommandée et son explication, les alternatives adaptées au contexte et un accès à tout le catalogue installé. La progression ne doit pas rendre les outils transversaux invisibles.

| Situation | Possibilités à expliquer selon le besoin et les compétences disponibles |
| --- | --- |
| Explorer ou éprouver une idée | `bmad-brainstorming`, `bmad-forge-idea`, `bmad-deep-recon`, `bmad-prfaq` |
| Cadrer le produit | `bmad-product-brief`, `bmad-prd`, analyste et product manager |
| Structurer le travail | Sofia avec `bmad-agent-po` : initiative, exigences, epics, stories et suivi |
| Définir l'expérience et les décisions communes | `bmad-ux`, `bmad-architecture`, agents UX et architecte |
| Réaliser et vérifier | `bmad-build`, `bmad-code-review`, `bmad-walkthrough`, tests end-to-end et rétrospective lorsqu'elle est installée |
| Approfondir pendant le parcours | `bmad-party-mode` pour confronter des points de vue, `bmad-advanced-elicitation` pour pousser une réflexion, `bmad-deep-recon` pour rechercher des faits, `bmad-review` lorsqu'une relecture est demandée |
| Adapter ou étendre BMad | `bmad-customize`, Toolsmith et `bmad-eval` lorsqu'ils sont installés |

Cette table illustre l'aide des modules installés ; elle ne définit ni une séquence obligatoire ni une liste figée dans le code. `party-mode` organise une discussion entre personas, pas une preuve de validation technique. Les compétences destinées aux exécutions sans présence humaine, comme `bmad-build-auto`, gardent leurs conditions propres.

Une compétence déclarée dans un module mais absente, telle que `bmad-retrospective` dans notre installation actuelle, apparaît comme indisponible avec son diagnostic. Les modules spécialisés supplémentaires sont découverts lorsqu'ils sont présents ; cette couverture ne promet pas leur installation ou leur fonctionnement sans vérification.

## Web ou desktop

| Option | Ce qu'elle implique pour ce besoin | Évaluation provisoire |
| --- | --- | --- |
| Site web sans composant local | Ne peut pas à lui seul piloter les processus locaux des fournisseurs. Les permissions de fichiers d'un navigateur ne donnent pas une interface générale aux agents installés. | Insuffisant pour le besoin complet. |
| Interface web avec service local | Le service gère dossiers, processus et événements ; le navigateur affiche les données. Il faut distribuer et maintenir ce service, gérer son démarrage et contrôler l'accès à son interface locale. | Faisable ; intéressante si le navigateur devient un objectif produit. |
| Electron | Interface web et processus local Node.js dans une application distribuable. Le moteur peut rester indépendant de la fenêtre pour faciliter un autre client plus tard. | Recommandation initiale pour limiter la complexité d'intégration des SDK et processus Node. Coût : embarquer Chromium et maintenir l'application desktop. |
| Tauri avec processus compagnon | Interface web et accès natif ; les intégrations Node/CLI peuvent passer par un sidecar. | Faisable ; ajoute un mode de packaging et une frontière de runtime à justifier pour cette première version. |

Sources : [processus Electron](https://www.electronjs.org/docs/latest/tutorial/process-model), [sidecars Tauri](https://v2.tauri.app/develop/sidecar/).

La recommandation Electron est notre appréciation du besoin, pas une décision utilisateur. Aucun framework UI n'est encore retenu. L'interface ne devra pas accéder directement au système de fichiers ou aux secrets : le processus local expose des opérations définies et des événements.

## Fournisseurs et modes de connexion

| Fournisseur | Interface documentée | Point à démontrer |
| --- | --- | --- |
| Codex | App-server, échanges bidirectionnels, événements de tours, invocations de compétences et demandes d'approbation. | Compatibilité de version, connexion/authentification, flux réel et reprise. Le fait de créer notre app-server ne donne pas automatiquement accès aux sessions actives d'une autre application. |
| GitHub Copilot | SDK pilotant le CLI, événements et sessions ; authentification par identité connectée ou OAuth notamment. | Sessions locales existantes, concurrence entre clients et capacités effectivement exposées dans les versions ciblées. |
| Claude Code / Bedrock | Agent SDK et CLI programmables ; configuration Bedrock documentée avec identité AWS. | Chargement des compétences BMad dans le mode choisi, flux interactif et permissions ; connexion/reprise de sessions externes. |
| Claude Code / abonnement | L'utilisateur veut ce mode ; sa prise en charge reste à qualifier. | Anthropic indique que proposer la connexion claude.ai ou ses limites d'usage dans un produit tiers requiert son accord. Ne pas assimiler un abonnement Claude Code à une clé API interchangeable. |

Sources : [Codex app-server](https://learn.chatgpt.com/docs/app-server), [authentification Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/auth/authenticate), [compatibilité SDK/CLI Copilot](https://docs.github.com/en/enterprise-cloud%40latest/copilot/how-tos/copilot-sdk/troubleshooting/compatibility), [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview), [Claude Code Bedrock](https://code.claude.com/docs/en/amazon-bedrock).

Le statut expérimental de certaines interfaces, dont app-server selon la documentation actuelle, et les changements de schémas justifient des adaptateurs versionnés et une vérification au démarrage. Un simple retour de texte ne remplace pas les événements de session, les réponses utilisateur et les demandes d'approbation.

## Sessions démarrées ailleurs

Le besoin cible est confirmé ; l'utilisateur a ensuite accepté un socle sans suivi direct des conversations. La faisabilité de cette extension doit être vérifiée outil par outil. Trois niveaux doivent rester distincts :

1. **Artefacts externes** : observer les fichiers BMad d'un dossier et recalculer l'état connu.
2. **Observation de session** : obtenir officiellement messages, outils, questions et cycle de vie d'une session créée ailleurs.
3. **Pilotage de session** : répondre, approuver, interrompre ou reprendre, selon l'autorité et les garanties du protocole.

Piste identifiée dans la source officielle VS Code : [endpoint local de l'Agent Host Protocol](https://github.com/microsoft/vscode/blob/main/src/vs/platform/agentHost/LOCAL_ENDPOINT.md). Le document prévoit la découverte d'un endpoint par des applications locales du même utilisateur, notamment un named pipe sous Windows, avec authentification et négociation de version. La présence de ce protocole sur `main` ne prouve pas son activation par défaut ou sa couverture de toutes les sessions. La documentation [Agent Host de VS Code](https://code.visualstudio.com/docs/agents/concepts/agent-host) décrit la synchronisation entre clients et exclut les sessions Local ainsi que les anciennes sessions exécutées dans l'extension host.

Les reprises d'historique ne remplacent pas cette connexion partagée : [Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/features/session-persistence) ne garantit pas l'accès concurrent au même historique par plusieurs runtimes indépendants ; [Claude Code](https://code.claude.com/docs/en/ide-integrations#the-conversation-is-still-open-somewhere-else) avertit qu'une même conversation ouverte dans plusieurs processus peut mélanger les messages. La documentation Codex consultée ne garantit pas l'attachement automatique au serveur d'une application Desktop déjà ouverte.

Ne pas démarrer deux processus sur un même historique en supposant qu'ils partagent un flux actif. Ne pas promettre l'accès aux conversations privées de toutes les applications à partir d'un chemin de projet.

## Modèle d'état proposé

- **Projet** : chemin canonique, détection BMad/version, initiatives, fournisseurs détectés.
- **Action BMad** : compétence/workflow, entrées, fichiers attendus, invocation propre au connecteur et conditions d'exécution.
- **Étape** : état connu, preuves, date de lecture, décisions et questions ouvertes. L'état peut être inconnu ou déduit ; il ne doit pas paraître confirmé dans ce cas.
- **Session** : identifiant fournisseur, provenance interne/externe, version du connecteur, capacités et rattachement au projet/ticket.
- **Événement** : message, outil, modification, question, approbation, erreur, interruption ou fin d'exécution ; garder l'identifiant fournisseur pour réconciliation.

Une session reste attachée à son moteur. Changer de fournisseur nécessite une nouvelle session et un passage explicite du contexte ; ce n'est pas une migration transparente de l'historique.

## Direction UX à explorer avec Impeccable

Priorité confirmée par l'utilisateur : l'expérience utilisateur est le point d'honneur absolu du projet. La V1 inclut l'initialisation guidée de BMad v7 pour accompagner également les projets non équipés. Les choix de composition, de détails et d'architecture devront servir cette priorité.

La référence fournie est une capture de Codex Desktop. Nous en retenons la navigation latérale sobre, l'espace de travail central et les panneaux de contexte. Le produit ajoute sa propre information principale : le parcours BMad visible.

Composition proposée, non approuvée : projets et sessions à gauche ; parcours du projet et activité de l'étape sélectionnée au centre ; fichiers, livrables et invocation dans un inspecteur à droite. Le projet, le workflow actif, le fournisseur et l'attente éventuelle doivent être identifiables sans lire toute la conversation.

États à couvrir : projet sans BMad, compétences incompatibles, aucun workflow choisi, attente de réponse, demande d'approbation, session externe non accessible, artefact modifié ailleurs, connexion perdue, échec et reprise. Lorsque les informations sont insuffisantes, l'interface affiche un état inconnu plutôt qu'une progression fictive.

Un besoin de clarté a été observé dans notre propre échange : l'utilisateur ne savait pas si le premier tour du party-mode était terminé, s'il devait répondre immédiatement ou si un récapitulatif allait suivre. Le travail UX doit traiter explicitement ces transitions, la synthèse des propositions, leur distinction avec les décisions acceptées et l'action attendue de l'utilisateur. Les personas visibles ne suffisent pas à rendre l'interaction compréhensible.

Le moteur de contexte Impeccable n'a pas pu être chargé dans le bac à sable ; ses références `shape`, `init` et `new-work` ont été consultées. Aucune maquette ni interface codée n'a encore été produite.

## Pistes fonctionnelles à préciser dans le travail UX

Ces pistes restent des propositions de conception à confronter aux parcours et aux exigences :

- Un cadre d'exécution commun, avec des présentations adaptées aux conversations entre personas, aux recherches et aux livrables en cours de rédaction.
- Une vue des chantiers et de leur état permettant de représenter plusieurs travaux en parallèle, accompagnée d'une prochaine action recommandée.
- Pour chaque compétence, rendre visible la prise en charge du lancement, du dialogue, des questions, des approbations et du résultat. Un lancement réussi seul ne démontre pas la couverture du workflow complet.

## Premier avis de Sally sur le cadrage UX — propositions

Cette analyse du brief applique la persona UX BMad ; elle ne constitue ni un test utilisateur, ni une maquette, ni une validation du design. Le périmètre est l'ensemble des possibilités BMad installées. `party-mode` est un exemple de discussion, sans priorité fonctionnelle particulière.

- **Organiser l'entrée par intention** : partir de ce que le développeur veut accomplir et de l'état connu du projet. Les noms des compétences et leur invocation restent accessibles pour comprendre et reproduire les actions, sans être un prérequis pour choisir.
- **Rendre les interactions lisibles** : montrer qui agit, sur quel objet, ce qui est en cours et ce qui attend une réponse. Les questions, propositions, décisions acceptées et fins de tour doivent être visuellement identifiables ; le texte de conversation seul ne suffit pas.
- **Relier l'action à son résultat** : après une exécution, permettre de retrouver ce qui a été produit ou modifié, les fichiers concernés et la prochaine action proposée. Une forme de workflow de discussion ne doit pas dicter l'expérience de tous les autres workflows.
- **Concevoir les parcours difficiles dès le départ** : projet sans BMad, installation incompatible, connexion Codex manquante, interruption, erreur et reprise. Expliquer ce que l'utilisateur peut faire à partir de l'état réellement connu ; éviter les états qui semblent réussis ou bloqués sans explication.
- **Éprouver l'expérience par des tâches** : faire ouvrir un projet, comprendre son état, choisir et exécuter une action, puis retrouver son résultat par un utilisateur peu familier de BMad. La composition visuelle inspirée de Codex doit être évaluée sur ces tâches ; elle n'est pas encore choisie.

Recommandation : travailler les parcours avec `bmad-ux` et Impeccable avant de figer la composition des écrans et les choix techniques qui déterminent les interactions. Les critères et maquettes restent à produire puis à confronter aux utilisateurs.
