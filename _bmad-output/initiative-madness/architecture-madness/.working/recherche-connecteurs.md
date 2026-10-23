# Connexions des fournisseurs — vérification du 23 octobre 2026

Décision du porteur : prévoir les trois fournisseurs dans l'architecture et les livrer progressivement, en commençant par Codex. Cette décision ne valide aucun connecteur de bout en bout. Aucun compte, jeton, abonnement ou configuration AWS n'a été modifié pendant cette recherche.

| Connexion cible | Ce que les sources établissent | Ce qui reste à démontrer pour Madness |
|---|---|---|
| Codex | L'app-server est une piste pour le dialogue structuré. Le CLI local 0.144.6 exporte les schémas de démarrage, reprise, interruption, questions et approbations. | Authentification adaptée à l'application distribuée, compatibilité effective et parcours réel complet. L'export de schémas n'est pas une preuve d'exécution. Voir les [investigations initiales](investigations-initiales.md). |
| GitHub Copilot | Le [SDK officiel](https://docs.github.com/en/copilot/how-tos/copilot-sdk/auth/authenticate) documente l'authentification de l'utilisateur déjà connecté au CLI et la connexion par application OAuth ; ces modes utilisent un abonnement Copilot. Les applications desktop sont un cas d'usage décrit. | Distribution et versions du runtime, chargement des compétences BMad, dialogue, autorisations et reprise dans Madness. La connexion BYOK est distincte de l'abonnement Copilot. |
| Claude Code via Bedrock | La [documentation officielle](https://code.claude.com/docs/en/amazon-bedrock) décrit une connexion avec accès aux modèles, région et autorisations AWS. Les identifiants AWS et l'accès aux modèles sont propres à ce mode. | Intégration des échanges et des autorisations, compatibilité du runtime et vérification avec un compte AWS autorisé. Ce mode n'est pas l'abonnement Claude direct. |
| Claude Code via abonnement direct | La [documentation du SDK](https://code.claude.com/docs/en/agent-sdk/overview) ne permet pas de supposer qu'une application tierce puisse proposer la connexion claude.ai et ses quotas. Les [conditions d'intégration de Claude Code](https://code.claude.com/docs/en/legal-and-compliance) décrivent séparément l'exécution du binaire natif non modifié et l'authentification de chaque utilisateur par les voies du fournisseur. | Qualifier la voie native et les conditions applicables à Madness avant de promettre ce mode. Ne pas collecter les jetons de session ni remplacer silencieusement l'abonnement demandé par une connexion API facturée séparément. |

## Découpage adopté par le porteur

Le porteur adopte une application locale modulaire : interface commune, cœur local des projets BMad et connecteur par fournisseur. L'historique d'une conversation reste lié au fournisseur d'origine. La gestion des projets doit rester indépendante des protocoles des moteurs ; un socle commun d'événements et de capacités réelles reste à préciser, sans supposer que questions, approbations, interruption et reprise sont identiques.

Une conversation conserve son fournisseur et sa connexion d'origine. La continuité entre fournisseurs n'est pas établie par une API commune. Une fonction de transfert ou de synthèse vers une nouvelle conversation reste hors des capacités démontrées ; elle n'est pas adoptée par ce découpage.

Le porteur confirme la conservation locale des projets, conversations et brouillons, sans relance automatique au redémarrage. Le format de stockage reste à choisir. Les fichiers du projet restent les preuves BMad ; un historique d'interface ne constitue pas une validation humaine ni une reconstruction de sessions lancées ailleurs.
