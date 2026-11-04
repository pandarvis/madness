---
title: 'Qualifier le runtime Graphify, ses formats et son confinement Windows'
type: 'feature'
ticket: 1
created: '2026-11-04'
status: 'built'
baseline_revision: 'dfb3e0faf3e05e5c4c638d5bfaab9ec22e2cc187'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/planning-inputs.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La V1 doit offrir le graphe Graphify du projet ouvert, mais aucun assemblage Windows ni profil code-only réel n’est encore qualifié. Une recherche de sources ne démontre ni l’absence de modèle ou d’effets sur les installations, ni la fidélité des relations.

**Approach:** Qualifier hors produit un assemblage exact dans des espaces possédés, générer de vrais graphes de code sur témoins et éprouver effets, formats, références, cycle de vie et ressources. Produire le profil et ses preuves pour Sally4.2 et le contrat4.3, sans anticiper l’intégration de4.4 ni G5 final.

## Boundaries & Constraints

**Always:** Base Windows/Codex1.11 et contexte2.3 construits ; REPLAN Sofia autorise ce spike indépendamment du parcours humain G4. Un seul profil code/dépendances, version/outillage/wheels/hashes explicités, runtime indépendant de celui du produit. Racine de fixture explicite, CWD/sorties/cache/home dans l’espace possédé par projet/analyse ; ressources et descendants attribuables avant nettoyage. Environnement enfant filtré avec --code-only, GRAPHIFY_BACKEND=none, GRAPHIFY_NO_AUTO_REFRESH=1 et GRAPHIFY_OUT=graphify-out. Preuves d’absence de modèle/réseau d’analyse et d’effets hors portée, et non simple présence de flags. Sources/configurations/skills/hooks/plugins témoins préservés ; identités, sens, provenance, confiance et inconnus fidèles aux octets. Mesures réelles sans quota de performance inventé, limites et refus explicites. Les règles de possession, arrêt inconnu, TLS, secrets et préconditions restent applicables.

**Never:** Modifier src, tests, scripts ou ressources du produit, ses pins, le paquet installé, le profil personnel, l’architecture ou les spines UX ; patcher silencieusement un tiers, installer globalement Graphify/skills/plugins/hooks, utiliser un modèle ou des credentials, appeler JWKS/OAuth/Codex/Claude, modifier Zscaler ou proposer l’IT. Aucun HTML Graphify exécuté, graphe déduit des seuls documents, contrat GraphSnapshot produit ou UI anticipés. Ni fixtures synthétiques, ni refus attendus, ni lecture primaire ne valent qualification G5 finale ou acceptation humaine. Aucun nettoyage d’un propriétaire dont l’arrêt n’est pas établi.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat observable | Refus / limite |
|---|---|---|---|
| G1 assemblage | CPython, wheel et dépendances Windows identifiés, puis absence/hash/extra importable altérés | Inventaire fermé indépendant et lock reproductible ; imports depuis cette seule fermeture, graphe nominal réellement produit | Aucun sdist/build implicite, site-packages utilisateur ou version de repli cachée |
| G2 nominal | Projets Python/TS/JS/C# connus, Unicode/espaces, appels/imports/dépendances explicites et inférés | JSON réel identifié outil/type/schéma, relations attendues et fichiers/lignes vérifiés ; code-only peut garder INFERRED | Pas de confiance ou plage de lignes devinées ; langage non prouvé explicitement inconnu |
| G3 effets hérités | Anciens skills/plugins dans home témoin, overrides absolus, ancien graph.json sémantique et caches | Recette impose home/env/sortie fraîche possédés ; fingerprints sources/intégrations inchangés, aucune fusion sémantique héritée | Refuser une sortie réutilisée non admise ; aucune mutation de l’environnement parent |
| G4 corpus/config | Git/non-commités/non-suivis/ignores, .graphifyrc, tsconfig extérieur, lien hors racine, corpus Office/Workspace/PDF | Portée et limites réellement observées ; aucune exécution de source, conversion/cloud/modèle implicite ou référence fichier utilisable hors portée | Erreur/partiel/refus nommés, pas d’absence silencieusement complète ; Git/config observés séparément |
| G5 formats | Export clusterisé, variante raw edges, sens _src/_tgt contre source/target, schéma/référence/confiance altérés | Profil retenu et corpus natif versionnés ; champs réellement disponibles et priorités documentés pour4.3/5 | Raw non estampillé ne devient pas schema1 ; format inconnu non admis |
| G6 isolation | Deux projets et deux analyses, changement non commité puis mutation pendant collecte | Racines/révisions/sorties séparées et identité de chaque reçu ; mutation ne fournit jamais une preuve actuelle | Pas de publication produit ou de réattribution d’un ancien résultat |
| G7 descendants | Au moins20 fichiers, max-workers1, Git/cpp/re-exec potentiels, annulation/timeout/échec | Processus réellement vus, Job avant reprise, arrêt/drain/terminal et préservation vérifiés | Limite de phase exacte si arrêt avant parsing ; inconnu conserve le témoin sans faux cleanup |
| G8 ressources | Génération représentative possédée et erreur/artefact incomplet | Durée/mémoire et taille/compte observés, dernier artefact complet distingué des partiels | Mesures bornées à ce profil, pas de seuil arbitraire ni d’annonce V1 complète |

</frozen-after-approval>

## Code Map

- `resources/bmad-help/{runtime.json,preflight.ps1,supervision.ps1,launcher.ps1,bootstrap.py}` : références en lecture seule. Base CPython3.12.14 x64/735 fichiers et UV0.13.0 exact ; Assert-BmadChain/Assert-BmadClosedRuntime et BmadNativeProcess.Start (suspendu→Job→Resume), Invoke-BmadSupervised. Copier les primitives utiles dans la qualification, ne pas modifier ces sources/pins. Le loader simple .py actuel ne charge pas un paquet tiers ; -I/-S/-B, -X utf8 et chemin explicite des paquets qualifiés restent requis.
- `tickets/epic-projets-bmad/qualification-profil-g2/{prototype,runtime_guard,fixtures,evidence}.py` sous l’initiative : inspect_chain/read_safe/capture/fresh, native_run, preservation/snapshot/seal ; réutilisables comme primitives contrôlées, pas comme import du projet ou qualification G2 rejouée. `tests/helpers/help-native.mjs` hérite l’environnement et ne pinne pas UV : ne pas le reprendre tel quel.
- Nouveau `qualification-graphe/qualify.mjs` sous cet epic : commande de provisioning puis matrice hors ligne, root Temp court canonique, env filtré, reçus, empreintes/mesures et fermeture/cleanup vérifiés. Nouveau `qualification-graphe/runner.ps1` : ressources/préflight et Job indépendant par analyse. Nouveau `qualification-graphe/worker.py` : bootstrap/fermeture des imports, invocation du vrai paquet, observation/limites de fichiers, réseau et sous-processus, vérification des artefacts de fixtures ; aucun import de leurs sources comme code.
- Nouveaux `qualification-graphe/{fixtures.py,verify.py,requirements.lock,assembly-manifest.json,schema-profile.json,profil-g5.md}` : cas G1–G8, vérification indépendante, assemblage exact, corpus/source IDs et conclusions. Les wheels/runtime sont sous Temp ou .working locale ignorée, jamais committés en bloc ; manifests/hashes/fixtures expurgées et reçus nécessaires sont conservés.
- `qualification-graphe/planning-inputs.md` : sources primaires/ref exactes, effets identifiés et symboles. Référence amont : commit8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b, wheel graphifyy0.9.101 be7745d4… ; modules critiques à comparer aux octets effectivement provisionnés avant d’appliquer ces faits.
- Profil candidat CLI : `python -m graphify extract <racine> --code-only --max-workers 1 --out <analyse fraîche>`, export clusterisé schema1 avec fallback NetworkX local. Les seuls paquets base sont retenus ; tiktoken/LLM/Office/cloud/Leiden extras absents. HOME/USERPROFILE/APPDATA/LOCALAPPDATA/caches possédés ; PYTHONHASHSEED présent évite le re-exec sans promettre une seed déterministe sous -I. Git/config/ignores et cpp ne sont pas neutralisés par ces seuls flags : borner et vérifier leurs comportements, commandes admises et refus. Git est le seul programme externe éventuellement admis en analyse, à chemin/hash/version contrôlés, CWD borné et arguments de lecture issus des octets sélectionnés (config core.excludesFile, ls-files, rev-parse). Désactiver dans le seul enfant les hooks/fsmonitor/verrous optionnels et les configurations globales/système ambiantes ; toute autre tentative de sous-processus est refusée avant start et signalée. Les lectures de configuration/références ont une portée et des limites observées, pas une promesse de sandbox OS.

## Tasks & Acceptance

**Execution:**
- [x] `qualification-graphe/qualify.mjs`, `requirements.lock`, `assembly-manifest.json` — provisionner uniquement dans l’espace possédé le candidat exact CPython3.12.14/base735 revalidée + graphifyy0.9.101 wheel SHAbe7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c et dépendances binaires Windows verrouillées. Vérifier distributions/imports/notices ; inventaire tiers indépendant, pas735 supposé final. Comparer les modules critiques au relevé de recherche ; recontrôler toute divergence depuis les vrais octets, sans patch tiers.
- [x] `qualification-graphe/runner.ps1`, `worker.py` — exécuter la recette fermée sur root explicite, CWD/home/cache/sortie neufs ; Job avant start, contrôle UV/Python/module et imports paquet adaptés, sorties bornées, réseau d’analyse/sous-processus observés. Réutiliser les gardes plutôt que faire confiance au Job comme sandbox ; contrôler préconditions et état final des canaris. Aucun credential/projet réel utilisé.
- [x] `qualification-graphe/fixtures.py` et corpus — épingler G1–G8 dans des tests exécutables, reproduire les variantes hostiles identifiées et les refus ; obtenir au moins un graphe réel exploitable du profil retenu. Source Python/TS/JS/C# connue, au moins20 fichiers, old plugins/skills/overrides/sémantique, configs/ignores, non-commit/mutation/deux projets, erreurs et fermeture. Chaque cas indique ce qu’il démontre réellement, sans skip promu en succès.
- [x] `qualification-graphe/verify.py`, `schema-profile.json`, `profil-g5.md` — rapprocher indépendamment invocations, versions/wheels/fingerprints, graphes source/sens/confidence/lignes, effets et Job, mesures et inconnus. Faire l’audit high indépendant runtime/effets/provenance, puis Quick/rechecks sous autorité parent ; fournir limites, recette reproductible et capacités réellement prouvées à4.2/3, G5 restant ouvert.

**Acceptance Criteria:**
- Given l’assemblage verrouillé Windows, when les témoins sont analysés hors ligne, then des graphes réels du profil retenu possèdent les relations attendues, leur sens, provenance et incertitude vérifiés face au code et aux octets natifs.
- Given home/intégrations/overrides et corpus mixtes témoins, when la recette contrôlée s’exécute, then aucune requête modèle/réseau d’analyse ni mutation hors espace autorisé n’est observée ; fichiers de projet et intégrations restent identiques et les conditions de ce résultat sont explicitement délimitées.
- Given deux analyses et des mutations/annulations/erreurs, when leurs reçus sont vérifiés, then identités, état connu/inconnu et arrêt réel restent distincts ; aucun résultat modifié n’est déclaré actuel ni témoin non fermé nettoyé.
- Given les preuves finales et un audit indépendant, when4.2/4.3 les consomment, then elles identifient exactement assemblage, formats admis/refusés, limitations et mesures ; elles ne peuvent confondre recherche, spike local et module intégré/G5 final.

## Implementation Notes

Implémentation hors produit dans `qualification-graphe/` : provisioning Node, CPython3.12.14/735fichiers et paquets2340 indépendants,31wheels binaires verrouillées ; runner Job-before-Resume, worker audit/refus, corpus et vérificateurs indépendants. Les trois contextes frontmatter ont été chargés avant code. Huit modules critiques identiques au commit primaire ; aucune installation globale, sdist, compilation ou patch tiers. Aucun src/test/script/ressource produit, pin produit, architecture, UX, paquet installé ou profil personnel modifié. Le fichier tests préexistant reste hors lot ; aucun reset/staging/commit par l’implémenteur.

Provisioning initial/reprise0 ; matrice `runs/matrix-006`0 (18cas sans skip), compléments ciblés `G3-inherited,G4-valid-config,G7-cancel`0 dans `supplement-007` ; reconstruction depuis lock/31wheels locales0 sans re-résolution ni nouveau Graphify. Re-vérification des mêmes18reçus0 :7839assertions techniques. `verify-final.py`0 :13975assertions de rapprochement ; aucun de ces nombres ne vaut autant de parcours. Les copies JSON parsées sont identiques aux octets `graphify-out/graph.json` du ZIP natif et à son inventaire SHA, dans matrice et compléments.

Sources archivées/scellées001 pour matrice,002 pour compléments,003 pour provisioning/vérification finale ; runner/worker/préflight/supervision inchangés. Quatre appels Python/TS/JS/C# et imports rapprochés du code/lignes ; TS useService→Service.act reste INFERRED0.85. Raw non estampillé distinct, huit mutants de format refusés, sens _src/_tgt et inconnus de lignes conservés. Ancien graphe schema1 sémantique plausible au chemin exact de l’override et canaris sources/home/intégrations intacts ; rc valide key=value effectivement exercée par configured.tpl. Git/non-commités/non-suivis/ignore, références extérieures, junction native, corpus mixte et SQL optionnel absent observés séparément, sans complétude inventée.

Mutation pendant collecte sourceUnchanged=false, jamais actuelle. Annulation/timeout à l’entrée réelle extract sur33fichiers, avant parsing : Job3→0 ; complément observe UV41320, Python21856, conhost44608. Aucun arrêt au milieu d’un parseur natif ni sandbox/traçage exhaustif OS revendiqué. Nominal final73nœuds/57liens ; worker25,734s/pic77815808octets, lanceur51,203s. Dix graphes clusterisés :21,187–27,922s, pics77201408–78688256octets, artefacts69650–75016octets ; aucune cible V1 inventée. Reconstruction runtime735/huit modules critiques identiques,2243/2340fichiers tiers identiques ;97différences limitées aux métadonnées/launchers générés, sans équivalence globale revendiquée.

Premiers échecs conservés : sélecteur ABI3cp38 Swift, shim PowerShell, syntaxe du banc, copie de cache trop longue, faux positif credential sur TIKTOKEN_CACHE_DIR. Celui-ci corrigé/recontrôlé ; lien ZIP/JSON demandé en lecture parent ajouté puis7839assertions vertes sans relance Graphify. `profil-g5.md`, `schema-profile.json`, `final-verification.json`, `owners.json` et `deliverables-manifest.json` fournissent le handoff.203inputs2.4 exactement identiques avant/après. Propriétaires connus listés nettoyables après audit ; sans terminal gardés, aucun nettoyage d’inconnu.

Restent sous autorité parent : audit high indépendant, Quick/rechecks, statut et commit. G5 final, intégration4.4 et acceptation humaine restent ouverts.

Clôture parent : audit high indépendant favorable, Q1 Quick corrigé/recontrôlé résolu. Parent a réexécuté le test ciblé6cas et les deux vérificateurs sur les mêmes reçus :0,0,0 ; aucune nouvelle analyse nécessaire pour cette garde d’entrée. Sources004 du correctif scellées séparément ; aucun correctif différé. Voir [vérification parent](../qualification-graphe/parent-verification.md).

## Plan Change Log

## Review Triage Log

## Design Notes

Un seul livrable : profil Graphify Windows étayé, hors produit. Les fichiers de qualification dépasseront une petite modification mécanique ; route full et risque high (effets hors portée ou relations trompeuses consommées ensuite). Aucun gate de longueur de plan : décision explicite du porteur et custom BMad persistante. Checkpoints de plan/fin délégués par le mandat autonome et l’entrée ; aucun arbitrage humain nouveau nécessaire pour les choix techniques de ce spike.

Candidat retenu avant exécution : wheel PyPI0.9.101 exacte et base CPython3.12.14 x64 contrôlée ; résolution de dépendances binaires sans extras, puis lock/hash. Les téléchargements anonymes de provisioning autorisés sont distincts de l’analyse ensuite hors ligne ; TLS demeure vérifié et les caches sont possédés. Une dépendance inaccessible ou un test réseau bloqué conserve version/artefact/preuve/condition de reprise ; il n’est pas promu en profil fonctionnel. Aucun résultat purement documentaire ou refus universel ne remplace le graphe nominal exigé.

Le contexte déjà présent de 1.11/2.3 est une capacité consommable, pas une nouvelle qualification à rejouer. La branche actuelle poursuit l’initiative et vient de committer2.4 puis l’adoption3/4. Seule variation tracked préexistante : tests/bmad-help-boundaries.test.mjs, sans diff de contenu ; les outils BMad/caches/preuves privés déjà non suivis restent préservés/exclus du lot, aucun reset global. Une seule implémentation possède les nouveaux bancs ; parent possède approbation, statut, audit/revue et commit. Racine de travail unique : C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness ; le cwd hôte atelier-ui est obsolète. Garder ce workdir absolu dans exec et utiliser require_escalated pour accéder à la vraie copie. Tu n’es pas seul : préserver les autres changements, aucun reset/revert/staging/commit du dépôt de travail par l’implémenteur. Les dépôts Git témoins peuvent être préparés localement dans leurs espaces possédés avant protection des empreintes ; aucun Git distant. Ses seules écritures versionnables sont qualification-graphe et Implementation Notes du présent plan ; runtime/cache/fixtures dans les espaces possédés prévus restent autorisés ; parent possède frontmatter/frozen/revues. Aucune intervention dans un autre chantier UI.

## Verification

**Commands:**
- `node --experimental-strip-types _bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/qualify.mjs --mode=provision` — assemblage/wheels/notices/lock/hashes dans l’espace possédé ; pas d’installation globale ni exécution de projet.
- `node --experimental-strip-types _bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/qualify.mjs --mode=run --output=<répertoire de reçu unique>` — G1–G8 réellement exécutés, graphe nominal, limites/erreurs attendues et arrêt attestés ; aucun réseau/modèle d’analyse. Provisioning préalablement identifié.
- `node --experimental-strip-types _bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/qualify.mjs --mode=verify --output=<même répertoire>` — confrontation indépendante des reçus/corpus/empreintes/Job et production des conclusions de profil. Vérificateur séparé des assertions du worker.
- Empreintes des203 inputs du manifeste2.4 avant/après et diff ciblé — aucune source/ressource/test produit modifié ; pas de build/NSIS ou compte personnel requis pour ce spike. Les commandes réelles, codes, nombre de cas, zéro skip et chemins de reçus sont consignés par l’implémenteur, puis recontrôlés par le parent.
