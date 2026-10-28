---
id: 1
type: spike
title: "Qualifier le cache des clés et la récupération réseau sans modifier Zscaler"
parent: none
covers: []
after: []
refined: true
hitl: false
risk: high
---

# Qualifier le cache des clés et la récupération réseau sans modifier Zscaler

## Description

Le porteur demande le28octobre de qualifier un cache des clés publiques OpenAI et la récupération réseau pour limiter les validations Zscaler, puis de reprendre2.1. Les reçus existants prouvent une redirection307 vers Zscaler puis un GETMain200 après acquittement, sans mesurer sa portée ou durée. La connexion actuelle recharge les clés avant un renouvellement ; la possibilité de réduire ces requêtes sans affaiblir identité, rotation et conservation reste à prouver.

Ce spike autonome fournit une réponse à la suite de fiabilité ;2.1 est le travail demandé ensuite, sans dépendance technique artificielle à un cache. L’epic1 reste clos, les17entrées de l’epic2 et les contrats adoptés restent intacts. Réponse et preuves dans `_bmad-output/initiative-madness/qualification-cache-reseau/rapport.md`.

## Approach

1. Relever le comportement actuel et comparer les options : absence de cache, cache mémoire, cache persistant borné et revalidation. Sources normatives et bibliothèque effectivement installée, nombre de GET/POST mesuré sur scénarios locaux représentatifs ; aucun acquittement humain automatiquement simulé.
2. Prototyper hors des sources produit les règles de fraîcheur/rotation et les transitions de récupération ; horloge et réponses locales contrôlées, compteurs et traces expurgés. Définir les bornes candidates avec leur justification et préserver les garanties JWT/OAuth.
3. Examiner coupure avant/après rotation du refresh token, clé inconnue, cache altéré/périmé et restauration. Évaluer la réduction des requêtes et ses limites ; ni fréquence de clics humains ni accès du processus Codex ne sont déduits du seul GET des clés.
4. Faire relire indépendamment la sécurité et les preuves. Sofia acte la conclusion sous mandat ; un résultat négatif ou conditionnel est acceptable s’il délimite le prochain lot. Fin du spike quand la matrice ci-dessous et sa relecture sont complètes, sans durée de développement ou budget inventé.

## Acceptance Criteria

1. **Les options sont comparées sur la réduction des accès et la conservation des garanties.**
   Verify: le rapport distingue cache applicatif/HTTP, mémoire/persistance, expiration et rotation ; ses références sont ouvertes et les traces actuelles sont séparées des simulations.
2. **Le prototype mesure les cas décisifs.**
   Verify: rapport exécutable localement avec absence/fraîcheur/expiration du cache, horloge incohérente, clé connue/inconnue/retirée, réponses malformées/HTML, redirection307, timeout/annulation et requêtes concurrentes. Résultats GET/POST comptés sans secret et sans modèle.
3. **La récupération ne réémet pas un effet incertain.**
   Verify: les scénarios couvrent échec avant POST, réponse perdue après POST et nouvelle clé après rotation ; aucun POST de refresh, message, accord ou tour n’est rejoué automatiquement. Réseau accessible et identité validée restent distincts. Les lectures locales et brouillons sont conservés ; le contrôle réseau explicite traverse réellement le transport, même avec un cache frais.
4. **La conclusion est bornée, relue et transmise.**
   Verify: décision qualifié/conditionnel/non retenu pour chaque option, limites du prototype et des garanties non prouvées, contrôle indépendant sans constat bloquant. Le code produit, le paquet personnel, le coffre et la connexion SIWC n’ont pas été modifiés. Un éventuel lot d’intégration est explicitement séparé ; le prochain workflow autorisé est2.1.

## References

- architecture — `_bmad-output/initiative-madness/architecture-madness/architecture-madness.md`, AD-4, AD-5, AD-7, AD-9 ; les mentions historiques de distribution sont subordonnées à la décision personnelle locale.
- exploitation — `AGENTS.md` et `_bmad-output/initiative-madness/deferred-work.md`, précision du porteur du28octobre : Zscaler inchangé et aucune intervention IT.
- preuve — `_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/public-current-002/report.json` et `public-current-003/report.json`, GET Main strict307 puis200, sans durée d’acquittement mesurée.
- suite — `_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/tickets.toml`, entrée1 et `qualification-readiness/README.md` sous cet epic.

## Notes

- Decision: 2026-10-28 — Demande humaine explicite de qualification puis2.1 sous le mandat autonome existant ; critères et risque arrêtés sous cette délégation, sans checkpoint conversationnel routinier ni nouvelle exigence produit. Le risque est high : une clé périmée ou une rotation rejouée peut invalider la connexion ou faire accepter une identité erronée.
- Contrôle supplémentaire high : revue indépendante des frontières de confiance, de la rotation/révocation des clés et de l’issue inconnue du POST ; contre-exemples adverses au-delà du parcours nominal.
- Boundaries: aucun changement/contournement de Zscaler, cookie partagé, exception TLS, OAuth ou modèle réel, copie/déchiffrement du coffre, remplacement du paquet personnel ou cache intégré au produit. Les prototypes sont isolés et ne sont jamais importés par l’application.
- Open question: quelles bornes de fraîcheur et stratégie de revalidation apportent un bénéfice mesurable sans promettre la disparition de tous les clics, et quelles garanties supplémentaires seraient nécessaires avant intégration ?
