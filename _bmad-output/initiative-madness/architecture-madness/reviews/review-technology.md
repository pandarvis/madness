# Revue de finalisation — technologies et preuves

Date : 23 octobre 2026. Lentille `finalize_reviewers` de `bmad-architecture`.

## Verdict

**PASS — aucun écart bloquant ni affirmation technique inexacte établi dans le spine.** Les versions relevées, les choix adoptés et les capacités encore candidates sont distingués. G0–G4 bloquent explicitement les annonces qui nécessitent une réalisation ou une preuve intégrée. Cette revue valide la qualité du contrat de recherche ; elle ne qualifie aucun assemblage ni connecteur.

## Périmètre et méthode

Lecture intégrale du [spine](../architecture-madness.md), des sept pièces demandées sous `.working/`, et de la [preuve d'installation BMad](../.working/bmad-installation-observee.json). Contrôles ciblés supplémentaires sur les sources officielles du preload du starter, de la sécurité Electron, de la distribution electron-vite et des connexions Codex, Claude Code et Copilot. Aucun scaffold, installation, build, packaging, authentification, tour de modèle ou accès à des jetons n'a été effectué. Aucun fichier hors de ce rapport n'a été modifié par cette lentille.

Le porteur autorise les previews. Le contexte personnel exécuté dans un environnement professionnel ne crée pas une exigence de versions exclusivement stables, de certification entreprise ou de licence open source.

## Constats principaux

### T1 — Les versions du registre sont des candidats explicitement soumis à G0

**Statut : conforme ; aucune correction requise.** Le tableau Stack reproduit le [relevé npm du 23 octobre](../.working/versions-registre.json) : Electron 45.0.0, electron-vite 6.0.0, electron-builder 26.15.3, TypeScript 7.0.2, React/react-dom 19.3.1, Vite 8.3.5 et create-electron 1.0.31. L'origine est le registre npm configuré lors de la recherche ; ces valeurs ne sont pas des dépendances résolues dans Madness.

Le spine évite de présenter TypeScript 7 comme une combinaison déjà acceptée par tout l'outillage. Le starter demeure sur TypeScript `^5.9.3` ; G0 exige explicitement types, compatibilité, build et paquet Windows, avec choix explicite d'une autre version si nécessaire. C'est un candidat récent conforme au souhait du porteur. L'absence actuelle d'un build est une limite déclarée, pas une fausse validation.

Les métadonnées relevées donnent des versions Node compatibles avec le Node de développement 24.13.0 observé pour les contraintes publiées : Electron requiert `>=22.12.0`, electron-vite et Vite `^20.19.0 || >=22.12.0`. Elles ne prouvent ni la compatibilité de tous les plugins et configurations TypeScript, ni celle du Node embarqué par Electron. Le dossier distingue déjà ces deux runtimes.

### T2 — Les defaults du starter sont correctement décrits et ne sont pas les règles de sécurité retenues

**Statut : conforme ; preuve complémentaire recueillie.** Les [sources archivées du starter](../.working/starter-verifie.json) montrent Electron `^44.7.2`, TypeScript `^5.9.3` et `sandbox: false`. Le [preload officiel consulté pendant cette revue](https://github.com/alex8088/quick-start/blob/master/packages/create-electron/playground/react-ts/src/preload/index.ts), blob SHA `2d1852475c0367b48a094e2110b4d32bc40a8174`, importe `electronAPI` depuis `@electron-toolkit/preload` et l'expose dans `window.electron`. L'affirmation du spine sur le pont Electron générique est donc étayée.

AD-1 et G0 demandent de remplacer ce pont par des opérations métier, d'activer le sandbox et l'isolation de contexte, de désactiver l'intégration Node dans le renderer et de valider les appels IPC. Ces règles sont cohérentes avec les [recommandations officielles Electron](https://www.electronjs.org/docs/latest/tutorial/security). Le starter est une base à adapter ; aucune conformité de sa simple copie n'est affirmée.

La documentation [electron-vite Distribution](https://electron-vite.org/guide/distribution) décrit le raccordement à electron-builder. La chaîne retenue est distincte du plugin Vite d'Electron Forge. Le code observé utilise un serveur de développement puis des fichiers compilés en production ; le spine décrit correctement cette distinction.

### T3 — Codex reste une piste expérimentale et sa voie d'authentification n'est pas inventée

**Statut : conforme ; G1 demeure nécessaire.** Le [résumé local du protocole](../.working/codex-protocol-summary.json) ne prouve que l'export de 267 schémas par le CLI 0.144.6. Les paramètres de threads, tours, interruption, reprise, questions et approbations y figurent. Le spine n'en déduit pas le fonctionnement de ces capacités dans Madness.

La [documentation officielle app-server](https://learn.chatgpt.com/docs/app-server) confirme JSONL sur stdio par défaut, les schémas propres à chaque version et le caractère expérimental de la commande. Elle distingue une surface stable et des méthodes/champs expérimentaux nécessitant opt-in. Elle présente aussi des voies d'authentification différentes, avec des conditions propres aux applications locales et aux services commerciaux ou hébergés. La [documentation Sign in with ChatGPT pour app-server](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) fournit une piste supplémentaire, sans établir l'éligibilité de Madness.

Le spine maintient précisément cette qualification ouverte en G1. Il ne déduit aucune autorisation d'un abonnement, ne prétend pas que « gratuit » signifie « open source », ne remplace pas l'abonnement par une API payante et ne revendique pas l'accès aux conversations d'une autre application. Aucune nouvelle restriction générale d'authentification n'est à ajouter sur la seule base de cette recherche.

### T4 — Les connexions futures gardent leurs différences de droits et de facturation

**Statut : conforme ; aucune promesse de parité.** Pour Claude Code, les [conditions officielles](https://code.claude.com/docs/en/legal-and-compliance) distinguent l'offre d'une connexion claude.ai dans une application tierce et l'exécution du binaire natif non modifié avec la connexion propre de l'utilisateur. Le spine conserve cette distinction et demande de qualifier la voie native avant disponibilité. Il n'affirme ni interdiction générale de l'abonnement dans ce binaire, ni autorisation d'en collecter ou d'en relayer les jetons.

La [documentation Bedrock](https://code.claude.com/docs/en/amazon-bedrock) décrit AWS et l'accès aux modèles comme un mode spécifique ; le contrat le distingue de l'abonnement direct. La [documentation Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk/auth/authenticate) décrit l'identité déjà connectée au CLI et les applications OAuth avec abonnement utilisateur, et un mode BYOK séparé. Le choix d'un SDK officiel pour une cible ultérieure est étayé ; les versions et capacités intégrées ne sont pas présentées comme qualifiées.

### T5 — Le profil BMad observé est compatible avec l'appellation preview sans plage universelle inventée

**Statut : conforme ; G2–G3 correctement placés.** La [preuve locale](../.working/bmad-installation-observee.json) relève `core-tools`, `method` et `toolsmith` en `6.13.0-next`, avec 27 compétences invocables et un inventaire sans problème signalé. Le spine demande des profils de formats et de capacités, plutôt qu'un contrôle limité au major `7`. Il ne transforme pas ce seul dépôt en certification de toutes les previews BMad v7.

La [recherche de compatibilité](../.working/compatibilite-bmad.md) n'établit pas qu'un diagnostic officiel produise un plan exhaustif de changements. G3 demande justement de prouver le plan exact, l'accord, l'annulation et les préconditions sur des dossiers de test avant de rendre l'initialisation disponible. Le catalogue, les aides et les workflows restent issus de l'installation effectivement utilisée ; les métadonnées ne deviennent pas des invocations.

## Vérification des décisions restantes

| Décision | Contrôle de cette lentille |
|---|---|
| Monolithe modulaire, cœur et ports | Choix architectural interne cohérent avec l'intégration de processus locaux ; aucune dépendance à une API tierce non démontrée n'est cachée dans le cœur. |
| Contrats communs versionnés | À établir en G0 avant leurs consommateurs. Le spine n'affirme pas qu'ils existent déjà. |
| Persistance locale | Moteur et migrations différés explicitement ; séparation des données et binaires imposée. Aucun stockage concret n'est annoncé vérifié. |
| Langues et thèmes | Français/anglais et clair/sombre décidés ; base française claire acceptée ; compléments UX requis avant implémentation. Aucune maquette sombre ou anglaise supposée existante. |
| Maintenance | Lockfile et reconstruction demandés, versions non figées par l'architecture, previews explicites. La référence DIA est une expérience locale, sans extrapolation au réseau des futurs connecteurs. |
| Réseau | Processus fournisseurs à vérifier séparément d'Electron ; aucune propagation automatique du proxy ou des certificats supposée. |
| Distribution | Packaging Windows à démontrer en G0 et G4 ; outils distribués ou requis, architectures, signature, licence et canal explicitement ouverts avant diffusion. Aucun auto-updater V1 ajouté. |
| Résultats et attentes | Exigences comportementales à vérifier en G1–G4 ; le texte ne les confond pas avec les capacités démontrées par les schémas. |

## Triage

- Critique / élevé : aucun constat.
- Moyen : aucun constat.
- Faible : aucun correctif requis sur le spine.
- Complément facultatif de traçabilité : `starter-verifie.json` archive package/config/main mais pas le preload. Le lien et le SHA consignés dans T2 comblent ce manque pour cette revue ; ajouter ultérieurement ce contenu à la pièce de recherche faciliterait une relecture entièrement hors ligne. Cette amélioration n'affecte ni l'exactitude du spine ni son adoption.

Les pièces initiales conservent l'ordre des investigations, dont une proposition Forge antérieure à l'adoption d'electron-vite. Le spine et la note de maintenance présentent clairement le choix final ; cette chronologie n'est pas un arbitrage concurrent.

Prochaine action de la finalisation : maintenir les gates dans le contrat remis à Sofia. La première preuve d'assemblage appartient à G0 ; la connexion Codex utilisable à G1 ; les formats/actions BMad à G2–G3 ; la livraison intégrée à G4. Rien dans cette revue ne permet de les marquer déjà franchis.
