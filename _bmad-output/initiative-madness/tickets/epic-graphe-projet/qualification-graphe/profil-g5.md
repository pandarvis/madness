# Profil Graphify Windows — spike4.1

Qualification hors produit du seul assemblage `graphifyy0.9.101` / CPython3.12.14 x64. Les rapprochements indépendants sont dans `runs/matrix-006/verification.json` et `final-verification.json`. G5 final, le contrat produit et l’interface restent ouverts.

## Assemblage et recette

`assembly-manifest.json` inventorie séparément735 fichiers de base et2340 fichiers de paquets tiers,31 wheels Windows x64 ou Python pur, leurs SHA-256 et notices. `requirements.lock` retient un seul hash de wheel par distribution, sans sdist ni extras. La wheel Graphify exacte vaut `be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c`. UV0.13.0 est contrôlé avant toute instruction. Les huit modules critiques téléchargés et ceux du commit primaire `8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b` sont identiques en octets (`source-comparison.json`). Aucun tiers n’est patché.

Le provisioning anonyme utilise TLS vérifié, les certificats système, un cache et un home possédés dans Temp. L’analyse est ensuite hors ligne, sans credential ni appel JWKS/OAuth/Codex/Claude. Runtime, paquets et témoins n’entrent pas dans le paquet Madness. Aucun outil n’est installé globalement.

```powershell
node --use-system-ca --experimental-strip-types _bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/qualify.mjs --mode=provision
node --experimental-strip-types _bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/qualify.mjs --mode=run --output=<nouveau-reçu>
node --experimental-strip-types _bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/qualify.mjs --mode=verify --output=<même-reçu>
```

`--case=<identifiant>` borne un diagnostic à un seul cas ; ce sous-ensemble ne satisfait pas le vérificateur final18cas. `--provision-owner=<Temp-possédé>` permet une reprise explicite du provisioning interrompu, avec recontrôle des hashes. Une sortie d’analyse non vide est refusée, y compris en présence d’un ancien `graph.json` sémantique.

## Contrôles et portée

Le processus UV est créé suspendu, assigné au Job kill-on-close puis repris. Le Python descendant lance le vrai `python -m graphify` via `runpy` avec les seuls chemins stdlib/DLL/paquets fermés, `-I -S -B -X utf8`, `--code-only --max-workers1 --out <analyse/out>`. HOME, USERPROFILE, APPDATA, LOCALAPPDATA, XDG et caches appartiennent à chaque analyse ; `GRAPHIFY_BACKEND=none`, `GRAPHIFY_NO_AUTO_REFRESH=1`, `GRAPHIFY_OUT=graphify-out` et PYTHONHASHSEED sont imposés dans cet enfant. La variable de seed évite la branche de réexécution ; elle ne rend pas le hash Python déterministe sous `-I`.

Des sondes négatives vérifient effectivement le refus du réseau, du sous-processus inconnu et d’une écriture projet avant le lancement Graphify. Leurs événements portent `control-probes` ; les événements de Graphify restent séparés. Les lectures Python sont bornées aux sources du témoin, au runtime, aux paquets et à l’analyse. Les écritures Python restent dans l’analyse. Les canaris de sources, instructions, hooks, skills, plugins et home sont comparés avant/après. Aucun module de source témoin n’est importé comme code ; le script canari lève une exception s’il devait être exécuté.

Git est le seul enfant éventuellement admis : exécutable/version/hash contrôlés, `config --path --get core.excludesFile`, `ls-files -z --cached` et `rev-parse HEAD`/`--show-toplevel`, racine/CWD contrôlés. Configurations système/globale ambiantes, hooks, fsmonitor et verrous optionnels sont désactivés dans l’enfant. Le `.git/config` local du profil témoin n’admet que les clés core inertes reconnues. L’exécutable Git est épinglé ; cela ne ferme pas son installation entière et ne promet pas la même observation pour des configurations Git arbitraires. Git n’est pas neutralisé par code-only.

Les hooks d’audit Python et le Job ne constituent pas un sandbox OS. L’absence de réseau et d’effets est une observation du chemin de code sélectionné, de sa fermeture, des appels Python surveillés et des canaris ; aucun filtrage réseau noyau ni traçage exhaustif des lectures natives n’est revendiqué. Les bibliothèques natives sont épinglées par leurs wheels. Les références extérieures et les liens ne deviennent jamais des cibles ouvrables. Une lecture de configuration refusée peut laisser un graphe partiel : ce fait ne doit pas être présenté comme une analyse complète.

## Formats et fidélité

Le nominal final `runs/matrix-006/G2-nominal` a produit73nœuds/57relations en25,734s avec un pic working-set de77 815 808octets, avant coût de préflight/Job. Le ciblé historique `nominal-005` reste séparé. Quatre appels Python/TypeScript/JavaScript/C# et leurs imports sont rapprochés des sources et lignes. L’appel TS `useService`→`Service.act` conserve `INFERRED` et `confidence_score=0.85` même en code-only. Le fallback de clustering est NetworkX local, les extras Leiden étant absents. Ce sont des mesures sur témoins, sans quota ni budget de performance V1 déduit.

Le JSON clusterisé porte `graph.schema_version=1`, `graph.graphify_version=0.9.101`, `nodes` et `links`, avec `directed:false`. `_src/_tgt` priment lorsqu’ils existent ensemble, sinon le sens reste source→target. Confiance textuelle et score numérique restent distincts. Lignes absentes, nulles, vides ou de texte inconnu restent inconnues ; aucune fin de plage n’est créée. Le raw de `--no-cluster` est un autre format et ne devient pas schema1. `schema-profile.json` documente les champs/admissions, `verify.py` les contrôle sans importer Graphify ni le worker.

Les sorties natives sont conservées dans `native-output.zip` avec inventaire SHA de tous les artefacts. `native-graph.json` conserve les octets du JSON principal. Les fichiers HTML restent des artefacts non exécutés. Les corpus expurgés sont conservés séparément, y compris leurs modifications non commitées. Le vérificateur distingue les mutations synthétiques de format des vrais graphes générés.

## Cycle de vie et limites des preuves

La matrice comprend deux projets et des analyses distinctes, mutation pendant collecte, annulation et timeout. Le point d’arrêt instrumenté est l’entrée réelle de `graphify.extract.extract`, après détection, avant parsing, sur au moins20fichiers. Une interruption à ce point ne prouve pas l’interruption en plein appel d’un parseur natif. Un artefact incomplet n’est pas promu comme dernier graphe complet. Les deux identités et leurs empreintes ne sont jamais réattribuées.

Les témoins sont conservés jusqu’à vérification des reçus terminal/Job. Un lancement terminé n’est pas assimilé à un arrêt confirmé. Aucun propriétaire dont l’arrêt est inconnu n’est nettoyé. Les essais de debug initiaux sont séparés : sélection de wheel Swift ABI3cp38, shim PowerShell bloqué avant UV, erreur de syntaxe du banc et copie de cache dépassant la longueur Windows. Ils ne comptent pas comme cas réussis. Les témoins/documents synthétiques ne valent ni G5 intégré, ni accord humain.

## Résultats consolidés

Les18cas de `matrix-006` ont été exécutés, sans skip. Le vérificateur final des mêmes reçus réussit7 839assertions techniques, dont le rapprochement explicite des octets de `native-graph.json` avec `graphify-out/graph.json` du ZIP natif et son inventaire SHA. Ces assertions ne représentent pas7 839parcours. Les203inputs de livraison2.4 restent exactement identiques avant/après.

Trois compléments ciblés renforcent le lot sans rejouer la matrice : G3-inherited, G4-valid-config et G7-cancel. Les deux premiers génèrent de vrais graphes ; le troisième interrompt avant parsing. `.graphifyrc` valide (`language.tpl=typescript`, `viz_node_limit=0`) fait effectivement apparaître `configuredOnly()` depuis `configured.tpl`. Ses clés inconnues d’override absolu/backend restent sans effet sur le profil imposé. La variante JSON initiale est explicitement ignorée avec warning ; elle ne prouve pas l’admission d’une configuration valide.

L’ancien graphe schema1 au chemin exact de `GRAPHIFY_OUT` hérité est une variante témoin sémantique plausible, construite sans modèle. Ses octets et son document sont conservés après les trois compléments ; aucun nœud `legacy_semantic` n’est fusionné. Il ne s’agit pas d’une ancienne exécution de LLM.

L’annulation ciblée observe, pendant la pause de33fichiers, UV41320, son Python21856 et conhost44608. Le Job compte trois processus avant arrêt, puis zéro ; le drain est borné et observé. L’annulation/timeout initiaux gardent leur nombre de processus mais n’avaient pas collecté l’identité de chaque descendant : cet inconnu historique n’est pas effacé par le complément. Le point de pause est avant le parsing, pas au milieu d’un parseur natif.

Les dix graphes clusterisés mesurés de la matrice prennent21,187–27,922s dans le worker, avec pics working-set77 201 408–78 688 256octets et69 650–75 016octets d’artefacts par analyse. Le nominal prend51,203s avec lanceur/préflight et capture. Ces bornes décrivent ce témoin multi-langages d’au moins20fichiers, sans extrapolation à un grand dépôt ni seuil V1 inventé. Le SQL optionnel absent produit un avertissement et un résultat explicitement partiel ; les formats Office/Workspace/PDF témoins ne constituent pas une qualification de conversion documentaire.

La reconstruction `assembly-reconstructed.json` consomme le lock existant et les31wheels locales vérifiées, sans résolution, téléchargement ni nouvel essai Graphify. Le runtime735 et huit modules critiques sont identiques. Les2340fichiers de paquets possèdent leur propre inventaire fermé ;2243sont identiques et97diffèrent seulement dans les launchers générés et métadonnées `RECORD`, `direct_url.json`, `uv_cache.json` dépendant de l’espace possédé. Les installations complètes ne sont pas déclarées byte-identiques (`reconstruction-differences.json`).

`final-verification.json` relie les sources archivées001 (matrice),002 (trois ciblés) et003 (provisioning corrigé/vérification finale), les quatre primitives natives inchangées, les octets ZIP/JSON et les deux fermetures. Ses13 975assertions de rapprochement ne s’ajoutent pas comme couverture fonctionnelle. Les preuves antérieures du faux positif de credential sur TIKTOKEN_CACHE_DIR restent dans `verification-initial.json`; le cache possédé est maintenant distingué d’une clé/token secret. Le recontrôle intermédiaire002 reste conservé.

`owners.json` liste les propriétaires nettoyables après revue et ceux à garder faute d’arrêt établi. Aucun propriétaire inconnu n’est supprimé. Aucun build/NSIS, compte ou paquet personnel n’a été modifié. L’audit high et Quick/rechecks restent sous autorité parent ; ce profil local ne vaut ni intégration4.4, ni G5 final, ni acceptation humaine.


## Commandes finales réellement exécutées

- Matrice : `node --experimental-strip-types .../qualify.mjs --mode=run --output=.../runs/matrix-006` →0 ;18cas.
- Compléments : `node --experimental-strip-types .../qualify.mjs --mode=run --case=G3-inherited,G4-valid-config,G7-cancel --output=.../runs/supplement-007` →0 ;trois exécutions ciblées.
- Reconstruction : `node --experimental-strip-types .../qualify.mjs --mode=provision --assembly=.../assembly-reconstructed.json --from-owner=C:/Users/UP60066553/AppData/Local/Temp/mg41-9NPKXq --receipt=lock-reconstruction-receipt` →0 ;31wheels sans re-résolution.
- Rapprochement des mêmes18reçus : `node --experimental-strip-types .../qualify.mjs --mode=verify --output=.../runs/matrix-006` →0 ;7 839assertions.
- Complément indépendant final : CPython3.12.14 possédé, `-I -S -B -X utf8 .../verify-final.py` →0 ;13 975assertions de rapprochement, sans Graphify exécuté.

Les `...` abrègent uniquement ici le dossier de qualification ; les commandes exactes, arguments et codes sont dans les reçus `*-command.json`, `lock-reconstruction-receipt.json` et les manifests/sceaux de sources.

## Clôture de revue

Audit high indépendant favorable. Quick Q1 a révélé le contrôle UV manquant avant le premier lancement externe du banc : garde chaîne/chemin/pin/SHA ajoutée, six cas interceptés reproduits par le parent, puis même Quick résolu. Sources004 et `uv-entry-guard-test.json` identifient ce correctif ; les analyses natives restent celles des sources001/002, la reconstruction celle de003. Aucun replay Graphify ni équivalence implicite de sources n’est déduit. Aucun correctif différé ; voir `parent-verification.md`. La règle Git locale préserve les octets scellés malgré core.autocrlf=true.
