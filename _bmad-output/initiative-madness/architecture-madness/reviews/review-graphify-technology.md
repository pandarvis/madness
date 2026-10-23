# Revue de finalisation — delta Graphify, technologies et preuves

Date : 23 octobre 2026. Lentille technologique du Reviewer Gate `bmad-architecture`, limitée à AD-10, G5 et leurs ajouts associés.

## Verdict

**PASS avec une réserve ciblée P2 : le profil du processus enfant doit neutraliser les effets implicites du CLI et les overrides de sortie hérités.** Les invariants d'AD-10 sont réalisables selon les sources consultées, et G5 identifie correctement les preuves restant à produire. Aucun Graphify n'a été installé ou exécuté ; cette revue ne prouve ni le packaging Windows ni un fonctionnement intégré.

La réserve porte sur un comportement amont effectivement présent dans le code, pas sur l'absence assumée de la future qualification G5. Le renforcement proposé ne requiert ni nouvelle capacité produit ni arbitrage du porteur.

## Périmètre et preuves

Lecture du [spine courant](../architecture-madness.md), du [cadrage Graphify](../.working/recherche-graphify.md) et du [registre des sources](../.working/graphify-sources.json). Relecture ciblée du code primaire via le connecteur GitHub : `pyproject.toml`, `ARCHITECTURE.md`, `graphify/__main__.py`, `graphify/export.py`, `graphify/exporters/html.py` et `tests/test_extract_cache_location.py`. Leurs SHA correspondent tous au registre existant.

Deux fichiers complémentaires ont été lus sans exécution pour suivre le CLI réel et ses chemins :

| Fichier | Blob SHA observé |
|---|---|
| [graphify/cli.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/cli.py) | `6d65b1603858a4fef7a430728c9871308168a283` |
| [graphify/paths.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/paths.py) | `0834fa001c51a5ef17cee9c90f96aa47828ea36b` |

Ces deux SHA sont consignés dans cette revue seulement ; les autres pièces et la baseline technologique n'ont pas été modifiées.

## Constat correctif

### GT-1 — P2 : CWD et `--out` seuls ne bornent pas tous les effets du CLI

**Localisation :** profil d'exécution AD-10 et confinement G5. **Disposition : autofix documentaire du profil, puis qualification G5.**

Le [CLI principal](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/__main__.py#L822) exécute les opérations suivantes avant `dispatch_command(cmd)`, y compris pour `extract` :

```python
# __main__.py, lignes 846–848
if not _informational:
    _refresh_stale_skills()
    _refresh_v1_opencode_plugins()
```

`extract` n'est pas une commande informative et n'appartient pas aux exceptions de la ligne 833. Le premier mécanisme peut réécrire les copies Graphify déjà installées dans des répertoires de compétences utilisateur lorsque leur stamp est ancien. Les lignes 277–292 décrivent cette portée et la sauvegarde éventuelle de `SKILL.md` en `.bak`. Le second examine explicitement **CWD et le répertoire utilisateur**, et peut réécrire un ancien plugin OpenCode ainsi que sa configuration associée, lignes 408–432. Un CWD Madness distinct du projet protège donc ce projet de cette recherche de plugin, mais laisse le répertoire utilisateur accessible.

Les deux mécanismes disposent de la même désactivation explicite :

```python
# __main__.py, lignes 294–295 et 429–430
if os.environ.get("GRAPHIFY_NO_AUTO_REFRESH", "").strip().lower() in ("1", "true", "yes"):
    return
```

De plus, [`paths.py`, lignes 30–53](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/paths.py#L30) accepte `GRAPHIFY_OUT` comme chemin relatif ou absolu, lu à l'import. Le CLI calcule ensuite `graphify_out = out_root / _GRAPHIFY_OUT`, [`cli.py`, lignes 3869–3872](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/cli.py#L3869). Un override absolu hérité peut ainsi détourner la destination malgré `--out` ; un relatif avec traversée peut aussi sortir de l'espace prévu. La défense interne ne rejette pas tous ces cas : elle écarte surtout la valeur vide, `.` et les chemins constitués uniquement de `..`.

**Correction minimale recommandée :** préciser que le profil enfant définit `GRAPHIFY_NO_AUTO_REFRESH=1`, maîtrise `GRAPHIFY_OUT` — par exemple en le fixant à `graphify-out` — et borne les autres écritures de l'analyse à l'espace autorisé, sans modifier les sources, instructions, skills, hooks, plugins ou configurations du projet **ni ceux de l'utilisateur**. Les variables sont propres au processus enfant, sans changement global de l'environnement utilisateur. G5 doit vérifier l'absence d'effet avec des installations utilisateur Graphify/OpenCode antérieures et un override de sortie présent dans l'environnement parent.

Il ne s'agit pas de demander l'installation d'un hook ou d'un skill. L'adaptateur doit justement neutraliser cette automatisation amont. Une politique de refus si le confinement n'est pas assuré reste cohérente avec le contrat.

## Constats conformes

### GT-2 — Identité et runtime correctement distingués

Le [pyproject officiel](https://github.com/Graphify-Labs/graphify/blob/v8/pyproject.toml#L5), SHA `ef5cc326d7f1e1276815bf11a36943d6fbceb504`, déclare bien `graphifyy` version `0.9.94`, Python `>=3.10`, Apache-2.0 et les fichiers de licence/notice. `v8` est la branche consultée, sans déduction d'une version de paquet « 8 ». La Stack parle justement d'une version déclarée dans le dépôt : aucun paquet PyPI effectivement distribué ou installé n'est prétendu vérifié. Le runtime final, ses dépendances et Windows demeurent qualifiables en G5.

### GT-3 — Le mode code et l'isolation des racines sont supportés par le code

[`cli.py`](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/cli.py) accepte `--out` et `--output` aux lignes 3764–3770 et `--code-only` aux lignes 3777–3778. Il écrit dans `<out_root>/graphify-out/` lorsque l'override d'environnement est maîtrisé. Il passe séparément `root=target` et `cache_root=out_root` à l'extraction AST, ligne 4279. Les [tests amont de localisation du cache](https://github.com/Graphify-Labs/graphify/blob/v8/tests/test_extract_cache_location.py) vérifient cette séparation ; leur lecture n'est pas une exécution locale de ces tests.

Le chemin code-only vide les entrées sémantiques, lignes 4052–4066. Le traitement de `GRAPHIFY_BACKEND=none`, lignes 4148–4162, désactive le travail LLM et la déduplication par modèle plutôt que sélectionner silencieusement un fournisseur, pour le chemin sans backend explicitement fourni retenu ici. La paire imposée par AD-10 est donc techniquement étayée. Le lanceur doit conserver ce profil et refuser l'injection d'options élargissant le périmètre ; la preuve d'absence effective d'appel reste G5.

L'[architecture officielle](https://github.com/Graphify-Labs/graphify/blob/v8/ARCHITECTURE.md#L11) reconnaît un état global de scan dans certains modules et exige une racine explicite. Un processus par analyse évite de partager cet état entre projets. L'isolation par projet et analyse, le dernier snapshot complet et la fraîcheur des fichiers non commités sont des invariants que Madness peut ajouter autour de ce CLI ; leur réalisation n'est pas attribuée à Graphify.

### GT-4 — Le contrat distingue correctement extraction brute et graphe persisté

L'[architecture amont](https://github.com/Graphify-Labs/graphify/blob/v8/ARCHITECTURE.md#L50) décrit l'extraction brute en `nodes` et `edges`. L'[exporteur](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/export.py#L176) porte `GRAPH_SCHEMA_VERSION = 1` ; son export persisté utilise `nodes`/`links` et `graph.schema_version`, plus `graph.graphify_version` lorsque la version installée est disponible. Le profil doit donc valider le type d'artefact avant de l'interpréter, comme l'exige AD-10, plutôt que se fier au seul nom `graph.json`.

La [convention directionnelle amont](https://github.com/Graphify-Labs/graphify/blob/v8/ARCHITECTURE.md#L67) donne précisément priorité à `_src`/`_tgt`, puis à `source` → `target`, malgré `directed: false`. Les niveaux `EXTRACTED`, `INFERRED` et `AMBIGUOUS` sont documentés distinctement. Le snapshot normalisé peut conserver ces informations ; aucune certitude ni complétude non démontrée n'est promise. L'exigence de schéma et la validation des références de fichiers évitent un couplage direct de la UI au JSON tiers.

### GT-5 — La vue locale constitue une intégration réalisable, sans détour par le HTML CDN

L'[exporteur HTML](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/exporters/html.py#L733) charge `vis-network@9.1.6` depuis `unpkg.com`. Le choix d'une vue Madness alimentée par le snapshot et des ressources livrées localement évite de dépendre de cet export exécutable. Aucune bibliothèque de visualisation précise n'a besoin d'être fixée par ce contrôle technologique : elle ne pourra pas redéfinir les contrats communs, la provenance ni la direction des arcs.

Recherche, liste de relations, ouverture dans le panneau de fichiers, français/anglais, clair/sombre et accessibilité sont imposés ou transmis à Sally sans être présentés comme une interface déjà réalisée. G5 reste le passage approprié pour les performances, les erreurs, l'interruption, les projets multiples et la lisibilité. L'optionnalité à l'usage du module ne le sort pas du périmètre V1 confirmé par le porteur ; la base Windows/Codex précède sa réalisation, et G5 bloque explicitement la clôture de la V1 complète.

## Triage et suite

- Critique / élevé : aucun constat.
- Moyen : GT-1, précision du profil enfant et de la portée des effets, correction documentaire directe puis preuve en G5.
- Faible : aucun autre correctif technologique requis.

Après intégration de GT-1, le delta est prêt à être adopté dans le spine et transmis à Sofia pour les exigences et le découpage. Aucun résultat de cette revue ne permet de marquer G5 exécuté ou franchi.

## Recontrôle ciblé après correction de GT-1 — 23 octobre 2026

**Verdict courant : PASS — GT-1 résolu dans le contrat ; aucune contradiction induite relevée.** Le constat initial et ses preuves restent conservés ci-dessus comme historique de la revue.

Contrôle limité à GT-1 et aux passages concernés, sans réouverture de la revue générale, recherche supplémentaire, installation ni exécution de Graphify :

- **AD-10, ligne 100 :** le processus enfant impose désormais `GRAPHIFY_NO_AUTO_REFRESH=1` et `GRAPHIFY_OUT=graphify-out`, avec `GRAPHIFY_BACKEND=none` et `--code-only`. Les variables restent dans l'environnement enfant ; celui de l'utilisateur n'est pas modifié. Les deux mécanismes de refresh et l'override de sortie identifiés dans GT-1 sont donc explicitement neutralisés par le profil exigé.
- **AD-10, ligne 100 :** CWD, sorties et cache sont distincts par projet et analyse, sans partage entre analyses ; la publication vérifie leur identité. Le confinement couvre toutes les écritures et interdit les mutations des sources, instructions, skills, hooks, plugins et configurations du projet comme de l'utilisateur. Cette précision protège le dernier snapshot complet sans élargir le périmètre fonctionnel.
- **G5, ligne 191 :** la preuve future comprend expressément les anciennes installations de skills/plugins et les overrides de sortie hérités, ainsi que l'absence d'effet sur les installations utilisateur. L'exigence reste un passage à démontrer avant disponibilité ; aucune exécution n'est déclarée acquise.
- **Pièces de recherche :** `recherche-graphify.md` décrit maintenant les deux mécanismes et les deux variables. `graphify-sources.json` consigne les SHA `6d65b1603858a4fef7a430728c9871308168a283` pour `cli.py` et `0834fa001c51a5ef17cee9c90f96aa47828ea36b` pour `paths.py`, conformes aux lectures primaires déjà effectuées pendant cette revue.

La correction est compatible avec le fonctionnement amont observé et avec les invariants de confinement, d'exécution à la demande et d'absence de mutation des instructions. Aucune autre correction technologique n'est requise par ce recontrôle. G5 reste ouvert pour la réalisation et la preuve effective.
