---
type: architecture-review
lens: adversary
scope: Graphify delta AD-10/G5
reviewed: architecture-madness.md
reviewed_on: 2026-10-23
verdict: no-conclusive-incompatibility
---

# Relecture adversaire — Delta Graphify

## Verdict

Aucune paire concluante de deux unités de niveau feature conformes à toutes les règles et néanmoins incompatibles n’a été établie. Aucun blocage architectural retenu sur ce delta. Deux précisions rédactionnelles non bloquantes permettraient de rendre les frontières déjà choisies plus immédiatement exécutables lors du découpage.

La revue ne réouvre pas AD-1 à AD-9. Elle les utilise seulement lorsqu’AD-10 s’appuie explicitement sur leurs frontières, leurs contrats ou leurs autorités. Elle ne réclame ni installation, ni exécution Graphify, ni preuve G5 à ce stade : G5 reste une qualification de réalisation. La vue Graphe appartient bien à la V1 après la base Windows/Codex ; son utilisation est optionnelle, sa qualification conditionne la clôture du périmètre V1.

## Sources examinées et règle de décision

- `architecture-madness.md`, en particulier AD-10, les conventions, G5 et les reports Graphify.
- `.working/recherche-graphify.md`, notamment la séparation source/CWD/cache, les répertoires par projet/analyse, les formats et la fraîcheur.
- `.working/graphify-sources.json`, qui consigne les sources et leurs SHA ainsi que l’absence d’installation et d’exécution.

Une paire n’est concluante que si chaque unité respecte le contrat commun possédé par le cœur et établi avant ses consommateurs. Inventer deux définitions indépendantes de `GraphSnapshot`, exploiter directement le JSON dans le renderer ou ignorer une obligation de fraîcheur ne satisfait pas ce test. Les détails de schéma restent à définir par le propriétaire désigné ; leur absence dans le spine n’est pas, à elle seule, une divergence permise.

## Attaques examinées

| Paire d’unités tentée | Incompatibilité recherchée | Règle qui empêche une paire conforme |
|---|---|---|
| Analyse Graphify et vue de projet | L’adaptateur retourne `nodes/links` natifs ; la vue traite l’extraction brute ou le HTML comme le graphe exporté. | AD-10 exige validation de l’outil, du type d’artefact et du schéma, normalisation vers `GraphSnapshot`, puis consommation du seul contrat commun. Les scripts HTML natifs ne sont pas une voie de projection autorisée. |
| Deux analyses de projets différents et publication de leur snapshot | Un contexte global de scan ou un résultat de l’autre racine fournit les nœuds du mauvais projet. | Un processus isolé par analyse, la racine explicite, le rattachement projet/racine/périmètre/révision et les répertoires séparés par projet/analyse du cadrage empêchent cette construction. La précision rédactionnelle n° 1 rapproche le spine de ce cadrage. |
| Analyse et indicateur de fraîcheur | Le commit est inchangé mais un fichier local modifié rend le graphe caduc ; l’indicateur annonce pourtant un résultat actuel. | AD-10 exige une révision incluant les changements non commités et une fraîcheur explicite. Le cadrage précise qu’une modification de source marque le graphe comme ancien. Le commit seul est explicitement insuffisant. |
| Analyse longue et publication finale | Des fichiers changent pendant le scan ; le dernier résultat est présenté comme l’état actuel du dépôt. | AD-10 interdit expressément qu’un changement pendant l’analyse produise un résultat présenté comme actuel. Un simple hachage au départ ne constituerait pas une implémentation conforme. Le mécanisme concret appartient au contrat et à l’adaptateur. |
| Rafraîchissement/interruption et vue/persistance | Un échec ou un résultat partiel efface le dernier graphe complet, ou un état interrompu devient « disponible » sans distinction. | AD-10 impose la conservation du dernier snapshot complet avec sa fraîcheur, distingue partiel, ancien, incompatible et échec, et rattache le processus au coordinateur du cœur. Remplacer silencieusement le complet par un partiel ne respecte pas cette règle. |
| Normalisation et rendu des relations | Le renderer suit `directed: false`, inverse les arcs ou transforme `INFERRED` en dépendance extraite certaine. | AD-10 donne la priorité `_src`/`_tgt`, puis `source` vers `target`, et exige la conservation de la provenance et des niveaux `EXTRACTED`, `INFERRED`, `AMBIGUOUS`. Le rendu ne peut redéfinir la normalisation. |
| Sélection d’un nœud et panneau de fichiers | Après navigation vers B, une référence d’un snapshot A est ouverte dans B, ou un chemin natif non vérifié devient un accès privilégié. | AD-10 rattache l’ouverture au projet du snapshot et impose la vérification de la référence ; AD-1 conserve à Main la validation des paramètres et de la portée. Une ouverture fondée seulement sur le projet courant ou sur une chaîne native non contrôlée est donc non conforme. |

Les scénarios ci-dessus sont des obligations de qualification à conserver pour G5, et non des tests déjà exécutés. Ils ne supposent aucune parité avec les futurs connecteurs d’agents.

## Précision n° 1 — Reporter la séparation par projet/analyse dans AD-10

**Sévérité : faible, non bloquante ; aucune paire conforme concluante.**

**Paire candidate :** une unité de lancement crée deux processus et leur fournit la même zone de travail Madness ; une unité de collecte relit un nom de sortie fixe dans cette zone. La première pourrait comprendre « espace Madness isolé » comme « isolé des sources », tandis que la seconde attend une sortie propre à son analyse. La course permettrait de lire la sortie du mauvais projet.

**Pourquoi ce n’est pas un trou retenu :** le cadrage cité par le spine demande déjà des répertoires de travail et de sortie séparés par projet/analyse. Une paire utilisant un répertoire commun ne respecte donc pas l’ensemble du cadrage examiné. Le snapshot doit également rester traçable jusqu’à sa racine et sa révision réelles.

**Modification minimale utile :** remplacer dans AD-10 « CWD et sorties/cache dans un espace Madness isolé » par « CWD et sorties/cache dans un espace Madness distinct par projet et par analyse, séparé des sources ». Cela remonte une décision déjà écrite, sans ajouter de stratégie de cache ni de nouvelle contrainte produit. Une éventuelle mutualisation de cache ultérieure devra préserver cette isolation logique et la provenance ; cette revue ne la prescrit pas.

## Précision n° 2 — Distinguer la propriété des règles et l’emplacement de la normalisation

**Sévérité : faible, non bloquante ; aucune paire conforme concluante.**

**Paire candidate :** une unité « contrat et cœur » lit dans Deferred que « la normalisation et le port partagés appartiennent au cœur » et y implémente le décodage Graphify ; une unité « adaptateur Graphify » suit AD-10 et la table Propriétaires et implémente aussi ce décodage. Les deux peuvent ensuite faire évoluer séparément les mêmes règles natives.

**Pourquoi ce n’est pas un trou retenu :** AD-10 charge clairement l’adaptateur de valider et produire le snapshot ; le contrat commun et ses règles appartiennent au cœur, avant les consommateurs. Une seconde autorité de projection contraire à ce contrat ne serait pas conforme. L’écart est une formulation qui pourrait faire perdre du temps au découpage, sans démontrer une incompatibilité autorisée.

**Modification minimale utile :** écrire dans Deferred : « Le contrat et les règles de projection partagés appartiennent au cœur ; la lecture du format natif et sa normalisation vers ce contrat sont réalisées par l’adaptateur Graphify. » Aucun schéma détaillé ni composant de rendu n’est imposé.

## Limites maintenues

Les sources attestent d’un examen documentaire, pas du fonctionnement du paquet Windows, de la couverture des langages, des caches, de l’interruption ou des performances. Le gate G5 et la définition UX par Sally portent déjà ces travaux avant disponibilité. Il n’y a pas lieu de les exiger comme acquis pour adopter les décisions d’architecture.

## Recontrôle ciblé du 23 octobre 2026 — clarifications appliquées

**Verdict : les deux précisions sont satisfaites ; aucune incompatibilité induite relevée dans ce périmètre.** La revue initiale ci-dessus est conservée comme historique.

1. **Isolation par projet/analyse : résolue.** AD-10 impose désormais des CWD, sorties et caches distincts par projet et par analyse, sans partage avec une autre analyse, puis la vérification de l’identité projet/analyse avant publication. La paire candidate « processus séparés mais nom de sortie commun » n’est plus permise, même en lisant le seul spine. G5 reprend le confinement par projet/analyse.
2. **Propriété de la normalisation : résolue.** AD-10 attribue au cœur le port, le contrat `GraphSnapshot` et ses règles communes avant consommateurs ; le décodage, la validation et la normalisation des artefacts tiers relèvent explicitement de l’adaptateur. Deferred emploie la même séparation. La duplication d’une autorité de décodage entre cœur et adaptateur n’est plus une lecture plausible du texte.

**Effet induit vérifié :** le profil enfant impose également `GRAPHIFY_NO_AUTO_REFRESH=1` et `GRAPHIFY_OUT=graphify-out` sans modifier l’environnement utilisateur. Les écritures sont confinées à l’espace de l’analyse et les instructions, skills, hooks, plugins et configurations du projet ou de l’utilisateur sont explicitement préservés ; G5 prévoit les installations utilisateur antérieures et l’override de sortie hérité. Ces précisions renforcent l’isolation sans déplacer la propriété du contrat ni créer un service ou une fonctionnalité supplémentaire. Ce recontrôle ne constitue pas une vérification d’exécution de ces mécanismes.

Aucune action supplémentaire demandée par cette lentille. Recontrôle limité aux deux clarifications et à leur effet induit ; baseline et autres scénarios non réouverts.
