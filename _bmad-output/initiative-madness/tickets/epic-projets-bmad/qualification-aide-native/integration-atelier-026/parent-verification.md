# Reprise de la 2.2 après livraison de la refonte atelier

État au 3 novembre 2026 : intégration conservée, **2.2 in-review**, M14 ouvert. Aucun nouveau modèle, OAuth, installation ou changement réseau n'est engagé par ce lot.

## Jonction des branches

La livraison UI finale `ac71fc91209a10969482f0f1f5aba5f78b458949` (atelier-immersion, version 0.2.6) a été réunie avec le checkpoint 2.2 `0cafbec` et le cadrage Quick Resume `4d6e869`. Merges locaux `c439810`, puis `5e4777b` ; aucun conflit. Le diff Git des arbres produit, ressources, qualification, tests et configuration vers `ac71fc9` est vide. Les portraits v2, Oxanium/Barlow, rail et commandes de fenêtre livrés sont conservés. Aucun travail 2.3 lancé.

L'invocation BMad Build reste `8008c73bb807d364d02b`, baseline `a93f50a0b0e8a5d1b094ddca77ec5d57ee3b6e18`, Step4. Aucun nouveau Build de la 2.2 ni réécriture de son intention approuvée.

## Contrôles de l'intégration

- `build.log` : typechecks et compilation réussis sur la branche réunie.
- `help-targeted.log` : 13/13 tests du protocole d'aide et des courses de persistance, sans saut.
- `ui-targeted.log` : 7/7 contrôles ciblés (barre, HelpBridge synthétique strict, portée et récupération réseau), sans saut ; profil de test fermé et supprimé par son banc. Aucun dialogue réel n'est simulé comme preuve M14.
- `artifact-audit.json` : ASAR installé 0.2.6 `a138493835f8912d0f0091fa9131db7e84aa55737db10dd9d0d7be44f817a157`, identique au manifeste de livraison. Les 175 sources du worktree de livraison correspondent exactement à ce manifeste ; la branche réunie a 138 fichiers identiques en octets et 37 textes UTF-8 équivalents après seule normalisation CRLF/LF. Treize ressources natives BMad, Main et preload compilés identiques en octets au paquet installé.

Les deux premiers audits restent rouges et conservés (`artifact-audit-first.json`, `artifact-audit-second.json`, `audit-first.mjs`). Le premier utilisait des chemins ASAR avec séparateurs `/` sous Windows et exigeait les mêmes fins de ligne de checkout. Après correction de ces erreurs du banc, trois sorties renderer ne sont toujours pas identiques en octets : CSS avec fins de ligne différentes, JS avec chemins de commentaires de dépendances différents, HTML avec noms d'assets différents. L'audit final ne prétend pas une équivalence globale des sorties renderer : `compiledAllByteIdentical:false` reste explicite. Les preuves visuelles et personnelles de la livraison 0.2.6 restent celles de son propre Build ; aucune recapture, approbation humaine ou qualification M14 n'est inventée ici.

## Réseau et prochaine preuve réelle

`public-main-get.json` mesure, depuis le vrai Main installé 0.2.6 et le profil normal, une redirection HTTP307 vers Zscaler le 3 novembre à13:50:33UTC. Zéro helper, enfant fournisseur ou tour ; fermeture normale et trace complète. Son libellé hérité « candidat préliminaire » reste brut : le champ artifact identifie bien la version livrée, sans en faire une réussite M14.

`public-dotnet-get.json` mesure aussi307 vers Zscaler à14:07:34UTC avec un client .NET utilisant le transport système, sans redirection ni cookies. C'est un diagnostic hors produit ; il ne remplace pas le GET Main, ne prouve pas la portée de l'acquittement du navigateur et ne modifie aucun réglage. Les acquittements précédents restent acquis. Aucune question de clic, JSON, jeton, reconnexion ou intervention IT n'est en attente.

La reprise fournisseur reste conditionnée à un GET strict Main200. Ensuite : nouveau témoin possédé, observation bornée de la requête exacte si `UNSUPPORTED_INTERACTION` réapparaît, réponse et alternatives natives réellement reçues, arrêt et réouverture passive, archivage du seul témoin après contrôles. Les échecs et succès des anciens ASAR restent historiques. M14 ouvert : aucun statut built, aucune story2.3 et aucun succès transféré de l'ancien candidat005 à0.2.6.

## Exécution BMad locale après jonction

`native-local-short-proof.json` : `nativeReady:true`, trois documents de modules, knowledge/config natifs exacts et lecture du lot required-context réussis ; helper `stopped`. Le diagnostic connu « method: missing bmad-retrospective » reste présent, sans module prétendu complet. Les cinq reçus d'opération sont dans `native-local-short-operations.json` : chaque exécution0/completed et Job0/terminal. `native-local-short-cleanup.json` prouve ensuite la suppression du seul dossier synthétique temporaire, sans profil personnel ni fournisseur.

Le premier essai plaçait ce runtime dans le chemin documentaire profond du dépôt : Python échoue à initialiser ses codecs et ne produit pas de JSON, exit2. Reçus et stderr conservés dans `native-long-path-failure/`, Job0 confirmé avant suppression. La même qualification, avec pour seule variation sa racine synthétique dans Temp, réussit. Cette différence de chemin explique le choix d'un banc court ; aucune compatibilité Python avec tous les chemins longs ni correction produit n'est revendiquée. L'échec initial reste rouge, sans augmentation des délais ni modification des pins/runtime.

Cette preuve locale ne remplace pas l'échange SIWC de M14, la réponse réelle du modèle ou sa réouverture passive.

## Relecture du checkpoint

Quick frais : aucun nouveau constat ; voir [le reçu](quick-review.md). Statut in-review et limites M14 conservés.
