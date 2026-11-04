# Entrées de planification 4.1 — 4 novembre 2026

Éléments documentaires et lectures locales avant implémentation. Aucun Graphify, modèle ou analyse n’a été exécuté ; aucune qualification G5 acquise.

## Assemblage candidat

- CPython 3.12.14 x64 : métadonnées PE du cache runtime Codex ; le manifeste produit735 (693 Lib,37 DLLs,cinq fichiers racine) est une base large à recopier/revalider, pas une preuve de stdlib complet ni le manifeste final Graphify. Aucun site-packages tiers actuellement admis.
- UV0.13.0 : `2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162` ; options locales `pip compile --python-version --python-platform --generate-hashes --only-binary --output-file` vérifiées dans le help du binaire dont le hash a été contrôlé.
- [PyPI graphifyy0.9.101](https://pypi.org/pypi/graphifyy/0.9.101/json) : wheel `graphifyy-0.9.101-py3-none-any.whl`, SHA-256 `be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c`, non yanked. Le sdist n’est pas nécessaire au candidat ; aucune compilation locale ou installation globale implicite.
- Les dépendances de base, sans extras Leiden/LLM/tiktoken/Office/cloud, sont à résoudre pour Windows x64/CPython3.12, puis verrouiller par versions/wheels/hashes et inventorier dans un manifeste indépendant. Un exemple de wheel Windows existe pour [tree-sitter-swift0.7.4](https://pypi.org/pypi/tree-sitter-swift/0.7.4/json) ; cela ne qualifie pas l’ensemble des dépendances.

## Lecture primaire amont

Commit de recherche `8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b`, pas une équivalence déjà prouvée avec la wheel PyPI. Comparer les modules critiques réellement téléchargés ; si différents, réinstruire les faits concernés depuis les octets sélectionnés et consigner la divergence.

- [cli.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/cli.py#L3774) : extract absolu, --code-only, --out parent ; sortie effective graphify-out. Le profil clusterisé appelle build/cluster/score/analyze/to_json ; --no-cluster produit un raw edges sans estampillage schema1, donc profil distinct non admis par défaut.
- [cluster.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/cluster.py#L142) : absence des extras Leiden donne un fallback NetworkX local, seed42 ; aucun installateur/téléchargement repéré sur ce chemin.
- [__main__.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/__main__.py#L735) : refresh skill/plugin gardés par GRAPHIFY_NO_AUTO_REFRESH, mais vérification des skills subsiste ; re-exec Python si PYTHONHASHSEED absent. HOME/USERPROFILE/APPDATA/LOCALAPPDATA et caches doivent être possédés, seed présent pour éviter cette re-exécution (sans promettre un hashseed déterministe sous -I).
- [llm.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/llm.py#L44) : import même en code-only, get_encoding peut télécharger si tiktoken installé. Le profil fermé exclut réellement cet extra, plutôt que compter seulement sur backend=none.
- [detect.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/detect.py#L2346) : détection avant filtre code-only, conversion Office/cloud possible avec extras/variables héritées ; Git config/ls-files et ignores influencent le corpus. `.graphifyrc`, ts/jsconfig/extends et manifests sont également lus. Prouver les cas, ne pas présenter ces variables seules comme confinement.
- [extract.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/extract.py#L9667) : --max-workers1 retourne avant création du pool, même au seuil20 ; autres enfants Git/cpp conditionnels restent à traiter. [export.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/export.py#L402) et [paths.py](https://github.com/Graphify-Labs/graphify/blob/8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b/graphify/paths.py#L574) : schema1, graphify_version, nodes/links/hyperedges ; _src/_tgt prioritaires, sinon source→target malgré directed=false. source_location peut être L<n>, numérique, vide ou null ; confidence et score sont distincts, INFERRED existe aussi en code-only.

## Primitives locales lues par explorer

`resources/bmad-help/supervision.ps1` : BmadNativeProcess.Start suspendu→Job kill-on-close sans breakaway→Resume ; Invoke-BmadSupervised apporte annulation, timeout, sorties bornées, arrêt/drain et reçu. Le Job n’est pas un bac à sable du système de fichiers/réseau.

`preflight.ps1` : Assert-BmadChain/Assert-BmadClosedRuntime refusent liens/hardlinks, venv/pyvenv.cfg, extras/absents et hash divergents avant UV. Sa borne4096 correspond au profil actuel ; les paquets tiers exigent leur propre inventaire borné, pas une modification du produit.

`qualification-profil-g2/{prototype,runtime_guard,fixtures,evidence}.py` : primitives de capture/fraîcheur/handles, native_run, preservation/snapshot/seal. Réutiliser les primitives contrôlées par copie indépendante ; ne pas importer le projet consulté ni rejouer/promouvoir G2. `tests/helpers/help-native.mjs` hérite son environnement et ne contrôle pas le hash UV : ne pas le reprendre tel quel pour ce profil.

Deux lecteurs indépendants en lecture seule : graph41_native_map (repo) et graph41_upstream_map (amont primaire). Aucun lancement de helper/Graphify ou installation par eux. La latence de la garde produit mesurée en2.4 est un suivi séparé avant2.5 ; aucun correctif de performance produit n’est autorisé dans ce spike.
