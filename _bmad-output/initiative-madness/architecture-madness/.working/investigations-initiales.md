# Investigations initiales — 23 octobre 2026

L'utilisateur retient un parcours accompagné, le contrat destiné au développement seul et une application locale distribuée gratuitement pour commencer. Cela ne décide pas d'une licence open source. Après la comparaison ci-dessous, il choisit Electron + TypeScript et une livraison progressive : architecture prévue pour Codex, Claude Code et GitHub Copilot, Codex livré d'abord. Les autres choix techniques restent à discuter.

## Protocole Codex constaté localement

`codex-cli 0.144.6`, Node de développement `24.13.0`, npm `11.6.2`. Le Node embarqué par une future application Electron n'est pas celui de ce relevé.

`codex app-server generate-json-schema` réussit et produit 267 fichiers sous `codex-schema/`. Le [résumé](codex-protocol-summary.json) conserve les messages nécessaires au démarrage, à la reprise, à l'interruption, aux compétences, aux approbations et aux questions. Les champs de ces dernières comprennent les identifiants de thread, tour et item ; la définition des questions est marquée expérimentale.

Ce contrôle ne lance aucun tour de modèle, connexion ou opération sur un projet. Il prouve la présence de structures de protocole dans la version installée, pas leur fonctionnement de bout en bout.

La [documentation app-server](https://learn.chatgpt.com/docs/app-server) présente une interface de client riche et distingue plusieurs modes d'authentification. Le caractère expérimental reste à traiter dans le connecteur ; la preuve réelle est ouverte.

## Authentification à qualifier

La documentation [Sign in with ChatGPT avec app-server](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) décrit une connexion avec jeton OAuth autorisé et renouvellement piloté par l'application. Ce n'est pas une capacité déjà activée pour Madness.

Les pages officielles distinguent [l'accès de partenaires commerciaux](https://developers.openai.com/siwc/request-client-id) et [l'enregistrement dynamique d'un client open source](https://developers.openai.com/siwc/token-sharing-open-source/sign-in). Le choix « gratuit et local » ne suffit pas à conclure à l'éligibilité de Madness à l'un ou l'autre parcours. Il faut qualifier la voie retenue ; aucun formulaire, changement de compte ou accès à des jetons n'est exécuté ici.

Les [limites de la preview](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) décrivent aussi la continuité de l'historique local et les restrictions de la route d'inférence. Elles devront être prises en compte si cette route est retenue. Aucun accès automatique aux sessions d'une autre application n'est établi.

## Premier arbitrage présenté

| Option | Base vérifiée | Analyse de Winston |
|---|---|---|
| Electron | [Processus principal Node et interface web séparée](https://www.electronjs.org/docs/latest/tutorial/process-model) ; [Forge et ses modèles officiels](https://www.electronforge.io/) | Recommandé pour réunir fenêtre Windows, fichiers et processus Codex dans une application installable ; runtime embarqué à prendre en compte. |
| Navigateur + service local | Le besoin R12 implique de piloter un programme local ; le service serait une composante de Madness. | Option viable ; il faut coordonner service et onglet et définir leur communication. Cette ligne est une analyse, pas une limite supposée de toute API de fichiers du navigateur. |
| Tauri | [Prérequis Rust, outils C++ et WebView2](https://v2.tauri.app/start/prerequisites/) ; [binaires externes](https://v2.tauri.app/develop/sidecar/) | Option viable ; ajoute une chaîne Rust et le raccordement des processus externes. |

La page officielle des [releases Electron](https://releases.electronjs.org/) indique le 23 octobre les versions stables 45.0.0, 44.9.3 et 43.8.3, publiées le 21 octobre 2026. Aucune n'est encore liée au projet. Aucun starter n'est exécuté, aucune dépendance applicative installée et aucun framework frontend choisi.

Electron + TypeScript est désormais adopté ; Forge reste recommandé sans template ni version choisis. Les informations ci-dessus alimentent le journal ; le contrat final sera distillé après les décisions et contrôles du workflow. Les modes des trois fournisseurs sont examinés dans [la recherche sur les connecteurs](recherche-connecteurs.md).
