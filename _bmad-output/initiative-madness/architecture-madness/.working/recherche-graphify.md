# Graphify dans Madness — cadrage du 23 octobre 2026

## Besoin confirmé

Le porteur demande Graphify comme outil de graphe de la solution locale ouverte. Il choisit de commencer par le code, les modules, les fichiers et leurs dépendances, puis confirme son inclusion dans la V1 après la base Windows/Codex, comme outil optionnel à utiliser. Les liens sémantiques vers les documents BMad ne font pas partie de cette première intégration. Une indisponibilité du graphe ne bloque pas les parcours BMad, mais la clôture du périmètre V1 exige sa qualification G5.

## Faisabilité constatée sur les sources

La branche par défaut est `v8`, mais le [paquet Python](https://github.com/Graphify-Labs/graphify/blob/v8/pyproject.toml) se nomme `graphifyy` et affiche `0.9.94`, avec Python ≥ 3.10. Il expose les commandes `graphify` et `graphify-mcp`. La [notice](https://github.com/Graphify-Labs/graphify/blob/v8/NOTICE) indique Apache-2.0 et conserve les contributions MIT antérieures ; leurs textes et attributions devront être pris en compte au packaging.

Le [README](https://github.com/Graphify-Labs/graphify/blob/v8/README.md) décrit l'analyse AST locale du code sans modèle. Les documents et médias utilisent une autre passe, qui peut appeler un fournisseur. Pour le mode retenu, proposer `--code-only` et `GRAPHIFY_BACKEND=none` dans l'environnement du processus Graphify, afin de désactiver aussi les replis de labellisation par modèle. Cela ne nécessite pas de connexion Codex, Claude ou Copilot pour calculer le graphe.

Le [CLI](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/__main__.py) documente `extract <path> --code-only` et `--out DIR` / `--output DIR`, qui écrit dans `<DIR>/graphify-out/`. La commande affichée par Madness devra refléter exactement la version et les arguments qualifiés ; aucune commande n'est exécutée par cette recherche.

Le CLI peut aussi actualiser des skills utilisateur et d'anciens plugins OpenCode avant de lancer `extract`. Le profil enfant doit imposer `GRAPHIFY_NO_AUTO_REFRESH=1` pour neutraliser ces deux mécanismes. [`paths.py`](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/paths.py) accepte par ailleurs un `GRAPHIFY_OUT` relatif ou absolu ; le fixer à `graphify-out` empêche un override hérité de détourner `--out`. Ces variables restent propres au processus enfant. Les [preuves techniques de relecture](../reviews/review-graphify-technology.md) consignent les SHA et les emplacements observés.

L'[architecture Graphify](https://github.com/Graphify-Labs/graphify/blob/v8/ARCHITECTURE.md) rend l'usage autonome de sa bibliothèque possible. Elle signale toutefois un contexte global de scan dans certains modules : recommander un processus isolé par analyse plutôt que partager cet état entre projets. Fournir explicitement la racine du projet, distincte du répertoire de travail et du cache.

## Données à respecter

L'[export JSON](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/export.py) produit `nodes` et `links`, ainsi que `graph.schema_version` et `graph.graphify_version`. Le schéma courant observé vaut `1`. L'extraction brute et le graphe exporté ne sont pas le même format.

L'[architecture Graphify](https://github.com/Graphify-Labs/graphify/blob/v8/ARCHITECTURE.md) documente une particularité : malgré `directed: false`, les arcs ont un sens ; `_src` / `_tgt` priment lorsqu'ils existent, sinon `source` → `target`. Conserver aussi les niveaux `EXTRACTED`, `INFERRED` et `AMBIGUOUS`, les relations et les références de fichiers/lignes. Une déduction n'est pas une dépendance certaine ni une validation BMad.

L'[exporteur HTML](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/exporters/html.py) charge actuellement vis-network depuis un CDN. Recommander une vue React qui consomme des données normalisées, avec ses ressources livrées dans Madness, plutôt qu'exécuter cet HTML dans l'aperçu des livrables. Le composant graphique précis reste à choisir selon les besoins UX et les mesures.

## Proposition d'intégration

- Vue projet « Graphe » : groupes/fichiers en entrée, recherche, filtres et voisinage à la demande, puis sélection d'un nœud pour ouvrir le panneau de fichier existant. Le graphe ne présente pas tous les symboles d'un grand dépôt simultanément par défaut. Sally devra préciser et vérifier ce parcours avec Impeccable.
- Adaptateur d'analyse Graphify derrière un port du cœur. Graphify n'est pas un quatrième fournisseur d'agents ni une étape obligatoire de BMad. Une indisponibilité du module n'empêche pas les parcours BMad.
- Génération et actualisation à la demande. Le coordinateur du cœur suit l'analyse, l'interruption et le résultat ; aucun hook Git, skill « always-on » ou changement d'instructions n'est installé pour obtenir cette visualisation.
- Répertoire de travail, sorties et cache distincts par projet et par analyse, gérés dans les données Madness ; le cœur vérifie le rattachement du résultat avant publication. Les [tests amont du cache](https://github.com/Graphify-Labs/graphify/blob/v8/tests/test_extract_cache_location.py) prévoient un cache distinct de la source : vérifier les effets réels du CLI retenu et l'absence de mutation des instructions, skills, hooks, plugins et configurations du projet ou de l'utilisateur, même si des intégrations Graphify anciennes sont déjà installées.
- Contrat `GraphSnapshot` commun, possédé par le cœur et normalisé par l'adaptateur : projet/racine, version d'outil et de schéma, périmètre analysé, révision des sources, nœuds et arcs orientés avec provenance. La UI ne dépend pas du JSON natif de Graphify.
- Dernier graphe conservé pendant une nouvelle analyse ; résultats partiels ou schéma incompatible explicités. Une modification de source marque le graphe comme ancien. Le commit seul ne suffit pas à établir sa fraîcheur : prendre aussi les fichiers non commités et les changements pendant l'analyse en compte.
- Clavier, recherche et liste de relations accessibles complètent la visualisation ; thèmes et langues suivent les contrats Madness. Aucun nouvel écran ni graphe interactif n'est encore maquetté.

## Qualification à prévoir avant disponibilité

Tester le runtime et le paquet Windows, l'analyse sans modèle, le confinement des écritures/caches par analyse et l'absence d'effets sur les installations utilisateur, avec des skills/plugins anciens et un override `GRAPHIFY_OUT` dans l'environnement parent. Vérifier le profil de schéma, le sens et la confiance des liens, plusieurs projets, les modifications non commitées, l'annulation et les erreurs. Mesurer durée, mémoire et lisibilité sur un dépôt représentatif ; le nombre de langages annoncé par Graphify n'est pas une preuve de couverture de chaque solution ouverte.

Les [sources et SHA relevés](graphify-sources.json) sont une preuve documentaire. Aucun Graphify installé, aucun graphe généré, aucun appel de modèle, aucune instruction de projet modifiée. L'extension est à transmettre à Sofia ; les R1–R24 existants n'ont pas été réécrits par cette recherche.
