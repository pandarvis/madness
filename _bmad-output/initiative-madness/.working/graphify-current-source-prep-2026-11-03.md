# Préparation documentaire Graphify — 3 novembre 2026

Lecture seule des sources amont pendant le Build2.4. Ce relevé prépare le futur raffinement/qualificationG5 : il ne démarre ni Build4, ni installation, ni analyse, ne modifie pas AD-10 et ne lève pas la dépendance à la baseWindows/Codex. Aucun appel fournisseur, aucune donnée du porteur transmise.

## Sources courantes

Branche amont observée `v8`, commit canonique `8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b` du2novembre2026. Le paquet déclaré est `graphifyy0.9.101`, Python>=3.10 ; l’architecture conserve son relevé historique0.9.94, à ne pas modifier comme si cette nouvelle version était qualifiée. Dépendances AST versionnées par plages, notamment tree-sitter>=0.25,<0.26 ; qualification Windows/wheels et fermeture du runtime restent nécessaires. [pyproject au commit](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/pyproject.toml#L5).

La [référence CLI](https://docs.graphify.com/open-source/configuration/cli) annonce le mode `extract <path> --code-only`, le répertoire `--out` et l’absence de modèle nécessaire au profil code. Ce sont des capacités documentées ; aucun comportement natif n’a été mesuré ici.

Les [variables documentées](https://docs.graphify.com/open-source/configuration/environment-variables) incluent `GRAPHIFY_BACKEND=none`, `GRAPHIFY_NO_AUTO_REFRESH=1` et `GRAPHIFY_OUT`. Leur portée doit être imposée dans le seul enfant, avec environnement filtré et espaces possédés, conformément àAD-10.

## Points de code à qualifier enG5

- [cli.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/cli.py#L3774) : chemin headless à partir de3774 ; flag code-only3892 ; racine explicite résolue3798 et sortie `out_root / GRAPHIFY_OUT`3984–3986. L’exclusion de la passe sémantique est visible4169–4179. Une sortie fraîche par analyse évite de reprendre une couche sémantique d’un ancien graphe : c’est une inférence de conception à éprouver, pas une garantie acquise.
- [__main__.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/__main__.py#L290) : les mises à jour automatiques de skills et de plugins possèdent chacune une garde `GRAPHIFY_NO_AUTO_REFRESH`, vers295 et430. Leur refus d’effets sur les installations réelles doit être testé avec témoins, sans lancer `graphify install`.
- [paths.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/paths.py#L574) : direction rétablie via `_src/_tgt`, sinon source/target ; le lecteur reconnaît les graphes `links` et la variante brute `edges`. Le futur adaptateur Madness doit normaliser ces formats sous une version prouvée et refuser les références hors projet.
- [export.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/export.py#L192) : `GRAPH_SCHEMA_VERSION=1` et métadonnées graph.schema_version/graphify_version autour508. Aucun JSON réel ni confiance/direction n’a encore été validé.

## Reprise future

Sofia raffine l’epic4 en conservant ses exigences et dépendances ; Winston/G5 choisissent ensuite le paquet/runtime exact à qualifier. Vérifier par essais possédés : zéro modèle/réseau au profil code, sorties/cache confinés et projet/home/instructions inchangés, schéma/direction/confiance, sources non commitées et mutation pendant analyse, annulation/arrêt descendant, erreurs, plusieurs projets, performances et accès fichier accessible. La vue sera native Madness avec ressources locales et liste de relations clavier, sans exécuter le HTML amont. Ce relevé n’est pas une preuve de disponibilité du graphe.
