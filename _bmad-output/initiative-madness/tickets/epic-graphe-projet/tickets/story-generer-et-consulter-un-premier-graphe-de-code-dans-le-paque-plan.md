---
title: 'Générer et consulter un premier graphe de code dans le paquet'
type: 'feature'
ticket: '4'
created: '2026-11-04'
status: 'built'
baseline_revision: '9dc1d12e69b0bd9006af9c41ac491732f1bbd0ac'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/.impeccable/surfaces/src-renderer-src-app-tsx.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/EXPERIENCE.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/profil-g5.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le porteur ne peut toujours pas voir Graphify dans Madness. Les contrats, le runtime et le panneau fichiers existent, mais aucun parcours produit ne les relie.

**Approach:** Livrer maintenant un quatrième onglet Graphe : génération Graphify réelle et volontaire, dessin local avec zoom, recherche et relations, puis lecture du fichier original dans le panneau commun. Analyser une copie possédée des octets de code capturés, sans BMad installé, connexion IA, Git ou éditeur requis.

## Boundaries & Constraints

**Always:** Un seul but visible et une voie produit. Périmètre de code fixe affiché, exclusions et limites explicites ; capture physique native de la racine et de tout le périmètre, y compris sources non suivies, avant et après analyse. Copier les octets capturés dans un miroir neuf possédé, chemins relatifs identiques ; aucun fichier de configuration/instructions/hook ni lien copié. Graphify0.9.101 et assemblage4.1 revalidés, environnement enfant filtré, backend none, code-only, max-workers1, auto-refresh interdit, CWD/HOME/cache/output possédés. Tous les subprocess réseau/Git/autres refusés dans le worker ; les bibliothèques natives épinglées et hooks Python ne sont pas présentés comme sandbox OS. Contrat4.3 et oracles issus du corpus détenu, sens/confiance/provenance fidèles, lignes absentes inconnues. Sélection de fichier via original GraphCapture privé et autorité corpus2.8 ; revalidation physique avant lecture et effets. Fraîcheur datée observée/revérifiée ou ancienne/inconnue, jamais surveillance continue inventée. Dernier complet conservé, échec de sauvegarde explicite, restauration passive sans nouvelle autorité fichier ni analyse. Propriétaire Job natif, admission partagée et arrêt inconnu intégré à toutes les activités. Atelier, saisies/conversations/parcours et onglets existants conservés.

**Never:** Modèle ou fournisseur, réseau implicite, installation d'outils dans le projet, code/hook/plugin/configuration utilisateur exécuté ou modifié ; pas de lecture des sources par Graphify hors du miroir. Pas de HTML/SVG tiers exécuté, payload natif au renderer, chemin/commande libre au bridge, hash seul promu en autorité physique, références d'un autre projet. Aucun graphe valide BMad. Pas de nouveau spike préalable, refonte générale, auto-refresh/retry/analyse au montage ou reprise, second stockage métier, migration Snapshotv1 ou installation personnelle implicite. Matrices étendues4.5–4.9, G4/G5 finaux, anglais global2.14 et gros dépôts non prétendus acquis. Tests externes bloqués consignés, pas de demande Zscaler/token/IT ni boucle de qualification indéfinie.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| T1 Premier graphe | Projet sansBMad/IA, code de référence et sources non suivies | Générer explicitement → copie capturée → vrai Graphify → snapshot admis → graphe local recherché → fichier original exact | Absence runtime/profil/source expliquée, aucune fausse génération |
| T2 Effets et périmètre | .git fichier/config/pièges/hooks/variables héritées, lien ou source refusée | Seuls octets code autorisés copiés ; tous subprocess refusés, aucune lecture projet par tiers ni écriture hors propriétaire | Refus/partiel explicite, zéro changement sources/configs ; aucune généralisation sandbox |
| T3 Publication et sens | Clusterisé schema1 exact, relations _src/_tgt ou source/target, confiance et lignes inconnues | Oracle indépendant du JSON, identité/révision exactes, références normalisées seules au renderer | Format étranger, référence hors corpus ou résultat tardif étranger refusés ; dernier complet gardé |
| T4 Révision | Ajout/retrait/remplacement/ancêtre modifié pendant capture/analyse puis lecture | Inventaire terminal complet, ancien/inconnu explicite ; ancien grant ne lit pas le nouveau fichier | Pas de résultat annoncé courant sans comparaison fraîche ; aucune relance automatique |
| T5 Exploration | Recherche/homonymes, sélection, zoom/déplacement/ajuster et changement de vue/projet | Dessin SVG local déterministe et liste de tous nœuds admis, relations orientées et confiance ; vue liée à identité complète | Pas de limite silencieuse ni réassociation par nom, pas d'analyse déclenchée par zoom/recherche |
| T6 Fichier/retour | Nœud avec source qualifiée ou inconnue, panneau commun dock/overlay | Source originale du bon projet lue et retour exact au graphe, sélection/recherche/zoom/draft conservés | Source non qualifiée sans action trompeuse ; réouverture requiert revalidation volontaire sans analyse |
| T7 Occupation/arrêt | Autre helper/moteur, annulation ou fermeture pendant vrai enfant | Admission unique, Job avant reprise, terminal/drain ou unknown persistant partagé ; parcours non possédé utilisable | Aucun nouveau travail après arrêt inconnu, aucun processus étranger tué |
| T8 Conservation | Résultat observé puis sauvegarde échouée, erreur ultérieure ou réouverture | Résultat session distinct de durable, dernier complet connu conservé, restauration unverified/passive | Retry-save écrit seulement, aucun moteur/collecte autorité ou replay implicite |
| T9 Variantes | Grand sombre, compact clair, clavier et zoom application200 | Quatre onglets accessibles, commandes nommées/atteignables, graphe et relations lisibles, état textuel et focus de retour | Repli sans perte de contexte, mouvement réduit, aucune conformité globale prétendue |

</frozen-after-approval>

## Code Map

- `qualification-graphe/{worker.py,runner.ps1,fixtures.py}` sous cet epic : runner0.9.101 exécuté sur nominal **nonGit**73nœuds/57relations. Réutiliser contrôles read/write/paths/audit et extraction, pas préflight ancien. Le nouveau miroir code-only omet configs/manifests : sélection/résolution d'alias peut différer ; affichage représente ce corpus, pas tout le dépôt selon ses configs. Les appels rev-parse HEAD sont optionnels et attrapent Exception ; supprimer exigence Git du launcher, refuser tous Popen avant toute consultation Git. Ce profil sansGit doit être exercé dans ce Build, pas déclaré qualifié par lecture.
- Assemblage source existant `C:/Users/UP60066553/AppData/Local/Temp/mg41-9NPKXq/{runtime,packages,wheels}` et reconstruction `mg41-BYMYFo`, manifests dans qualification-graphe : CPython3.12.14/735, packages2340,31wheels fermées ; Graphifyy0.9.101 wheel be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c. Vérifier original exact avant copie. Nouveau `scripts/assemble-graphify.mjs`, ressources `resources/graphify/{worker.py,launcher.ps1,assembly.json,requirements.lock,notices...}` et assemblage généré local ignoré, sans résolution réseau durant utilisation. Manifestes/lock et préparation reproductible fournis ; pas de chemins Temp persistés dans le produit. `electron-builder.yml` livre runtime/packages/ressources/notices locaux dans le candidat ; `src/adapters/analysis/graphify-manifest.ts` épingle les ressources de contrôle.
- `resources/bmad-help/{preflight,supervision,ownership}.ps1`, `src/adapters/bmad/help-owned-run.ts` : primitives physiques et Job qualifiées. Préflight produit vérifie handles/hash/inventaire, mais sa validation de packages présume Lib/site-packages ; adapter explicitement pour le nouvel assemblage, sans affaiblir le défaut BMad. Réutiliser supervision avant reprise/annulation/terminal. Registre/purpose/génération Graph distincts, jamais bmad-readonly rebaptisé ou secours d'identité libre. Nouveau owner Graph si cela préserve mieux le contrat existant qu'une extraction commune.
- `resources/bmad-help/{capture,files}.py` et `src/adapters/bmad/help.ts` : captured chain/stamp/handle avant premier read, texte borné, grants privés. Nouveaux modules natifs Graph pour capture/copie/recapture terminale et lecture/verify, uniquement via même propriétaire/admission. Produire OriginalGraphCapture {projectId/rootPath/rootIdentity/revision/observedAt/sources{id,path,sha256,bytes}} avec sourceId→original privé et FileAuthority WeakMap ; ne pas prendre snapshot.sources comme oracle. Réutiliser la frontière fichiers2.8 host-only, pas API de registration au renderer. Périmètre explicite des extensions code admises par profil, métadonnées/dépendances/sorties ignorées et refus/taille expliqués sans troncature.
- Nouveaux `src/adapters/analysis/{graph-corpus,graphify,graphify-normalize}.ts` : capture native/port GraphAnalysisPort, validation assemblage/opérations, décodeur initial clusterisé/schema1. `_src/_tgt` ensemble prioritaires sinon source→target même directedfalse ; EXTRACTED/INFERRED/AMBIGUOUS et score0.85 déduit nonprobabilité, lignes inconnues. Chemins natifs relatifs au miroir confrontés à table capturée ; HTML jamais chargé. SHA natif calculé sur vrais octets, pas archive native dupliquée en stockage métier.
- `src/contracts/bmad-graph.ts`, `src/core/{bmad-graph,bmad-graph-port}.ts` : conserver policy4.3, ajouter seulement enveloppe métier de bridge/liste d'états si nécessaire. Nouveau `src/core/graph-coordinator.ts` : propriétaire des états projet/périmètre, séquence/ordre/génération, capture attendue, port, sauvegardes et arrêts. Corpus complet avant/terminal détecte aussi ajouts/suppressions ; labels observés datés et restoreGraphState unverified, sans auto-watch courant inventé. `application.ts::dialogueProject` résout le projet enregistré sans dépendance Codex.
- Nouveau `src/adapters/persistence/graph-store.ts`, port dans module Graph : annexe atomique via adaptateur de persistance existant, comme bmad-context-store ; uniquement états normalisés validés et dernier complet, pas duplication de projets/conversations ni Snapshotv1 migration. Écriture ratée ne remplace pas le dernier durable, retry-save ne régénère pas.
- `src/main/index.ts`142–169/280 : injecter GraphAdapter/owner/coordinator/store ; composer recovery Codex+Help+Graph, préconditions d'admission de toutes activités et fichiers. ActivityAdmission n'a pas de latch unknown : owner Graph doit rejoindre récupération et refus des autres helpers, pas juste release. Composer filesAuthority Graph puisHelp et accept(original,'corpus') seulement après admission du résultat/contextes. Lifecycle arrête/drain/écritures ; arrêt prouvé ou inconnu, pas Promise seule. `src/preload/index.ts`, env : API métier gelée, caller/corrélation/guards exacts, aucun payload natif ni chemin libre.
- `src/renderer/src/{App.tsx,GraphPanel.tsx,graph.css,graph-strings.ts}` : ajouter quatrième onglet après catalogue, WorkOverview compact et wrap/repli quatreonglets. Première représentation **SVG local déterministe**, dessin et liste équivalents, recherche, sélection, relations/sens/confiance, zoom+/−/ajuster/réinitialiser et déplacement, pas simulation continue ni nouvelle dépendance. Projection et nombre représenté explicites ; liste tous nœuds admis, aucune omission silencieuse. Vue session par identité complète séparée de l'initiative ; contenu/résultats viennent de GraphState. `FilePreview`/FilesContext unique, grants corpus par sourceId privé, pas référence fabriquée depuis GraphSnapshot. Mise à jour copie « graphe à venir » uniquement puisqu'il devient réellement disponible.
- Réconcilier **dans ce Build avant UI**, pas nouveau projet : `ux-graphe/{DESIGN,EXPERIENCE,handoff}.md` troisième→quatrièmeonglet, choix premier rendu4.4 et approfondissement4.8, panneau2.8 livré, anciennes dépendances2.14/3.9 remplacées par replan ; ancien constat flèches déjàcorrigé. Ajouter Graphe/destinations/retour aux spines partagés UX. Conserver rootDESIGN/palette/fonts et champs historiques nonliés, pas migration stylistique. Sally4.2 réellement activée reste source comportementale ; ne pas prétendre nouvelle activation sans l'exécuter.
- `tests/graphify*.test.mjs`, `tests/graph-coordinator.test.mjs`, cas ciblés `tests/connection-ui.test.mjs`, `scripts/qualification/graph-project.mjs` : cas T1–T9 significatifs, native sansGit réelle, mêmes tests/fixtures pour frontières. Un seul banc vertical candidat réel (projet sansBMad, génération, recherche/relation/fichier, mutation, stop/reopen) avec attentes synchrones sur événement/état ; pas Promise truthy. Retenir échecs exacts/arrêts/nettoyage, pas copies répétées de toute arborescence pour chaque tentative. Version0.2.12 package+lock racine, dépendances JS inchangées.

## Tasks & Acceptance

**Execution:**
- [x] `resources/graphify/*`, `scripts/assemble-graphify.mjs`, packaging/pins — assembler et relier réellement le profil fermé, capture miroir/Graphify/normalisation, propriétaire Job partagé et port fichier qualifié, sans outil installé chez le porteur.
- [x] `src/core/graph-coordinator.ts`, contrat/ports, `adapters/analysis/*`, `adapters/persistence/graph-store.ts`, Main/preload — raccorder contexte, résultat/conservation, publication et autorité corpus, arrêt/récupération partagés/passivité.
- [x] `ux-graphe/{DESIGN,EXPERIENCE,handoff}.md`, spines UX — réconcilier les seuls points répertoriés avant surface ; atelier et source Sally conservés.
- [x] `GraphPanel`, styles/strings/App/env — livrer le vrai quatrième onglet, premier dessin SVG/zoom/recherche/relations/fichier/retour et saisies préservées.
- [x] `tests/graphify*.test.mjs`, `tests/graph-coordinator.test.mjs`, UI ciblée et banc `graph-project.mjs` — rouges/verts pertinents T1–T9, exécution native code-only sansGit, vérification du paquet et ressources, un gel des entrées avant exécutions, captures groupées et nettoyage possédé.
- [x] Parent — revues indépendantes requises et Quick/rechecks ciblés, Impeccable deux lots maximum/un détecteur/finish/documenter, rapport bref et commit local. Fournir candidat utilisable ; tests externes bloqués différés explicitement, pas d'extension des qualifications sans défaut nouveau.

**Acceptance Criteria:**
- Given un dossier de code sansBMad ni connexion IA, when le porteur demande Générer dans Graphe, then un vrai résultat Graphify apparaît avec portée/provenance/fraîcheur et il peut rechercher, zoomer, lire une relation puis consulter son fichier original dans Madness.
- Given une mutation, erreur, résultat étranger ou arrêt en cours, when l'application reçoit le terminal ou le porteur reprend le travail, then source/révision/identité restent exactes, dernier complet et brouillons sont conservés et aucune permission/analyse ou réussite d'arrêt n'est inventée.
- Given le candidat Windows et son assemblage local exact, when il génère dans un témoin puis ferme/rouvre, then les effets restent possédés, aucun moteur/réseau/Git requis et le graphe restauré demeure historique sans reprise ; cette preuve étroite ne clôt pas toute V1/G5.

## Implementation Notes

## Plan Change Log

## Review Triage Log

| Constat | Verdict et preuve parent | Route |
|---|---|---|
| Q1 | high — result.status failed exige snapshot null et freshness observed exige snapshot nonnull, contradiction exacte lue dans validateGraphState245–261 et revalidationcoordinator23. Le bridge rejette ensuite cet état. | patch : garder les axes existants validables, aucune nouvelle API/permission/transition métier. |
| Q2 | medium — capture admet les six extensions, files-read les refuse effectivement à TEXT_TYPES. Fichiers attendus dans usage courant. | patch : six ajouts d’extensions au seul helperGraph, pins/tests existants. |
| Q3 | medium — launcher jette GRAPH_CHILD_timeout ; catch adapter nonabort émet toujours failed si ownerstopped. E2 et contrat timeout préexistent. | patch : conversion exacte du diagnostic connu, garde inconnue conservée. |
| Q4 | medium — snapshot=result.snapshot??lastComplete n’offre aucun basculement lorsque les deux existent et diffèrent ; E2 le demande. | patch : présentation locale des deux snapshots déjà publics/admis, sans nouveau bridge/API métier/permission ; contrôle direct de la vue, état démontré partial-after-complete. |
| Q5 | high — inventory saute le répertoire avant traversée et sans le nommer dans couverture ; code packages/resources n’est ni configuration ni sortie générée par son seul nom. | patch : enlever ces deux noms trop généraux, conserver bornes et vraies exclusions. |

Tous les constats vérifiés individuellement, aucune déduplication ni rejet. Ces corrections directes de branches/listes et présentation existante n’ajoutent pas d’API métier et ne gardent aucun état non démontré. Ni intentgap ni badplan/loopback ; review_loop_iteration reste0. Même implémenteur réengagé avec le promptpatch prescrit ; mêmes Quick et finish pour recontrôles bornés ensuite. Pas de nouveau lot visuel ou détecteur.

## Design Notes

Un but unique traversant native/core/UI, full auto bien au-delà100lignes, risquehigh du ticket maintenu (sources exposées/effets/histoire erronée). Aucun intent gap humain après trois recherches ciblées ; préférences/checkpoints techniques délégués et replan4.4 déjà adopté. Aucun seuil de tokens. Choix technique miroir possédé : il conserve octets/lignes et évite la dépendance à Git/config du dépôt ; affichage annonce clairement code capturé/exclusions/alias nonrésolus. Le graphe global peut proposer une projection ciblée pour lecture, mais l'étendue exacte est nommée et la liste conserve tous les nœuds admis.

Dernier retour humain : 8h sans fonction visible. Priorité au chemin vertical et candidat concret ; aucune nouvelle étude/spike ou refonte avant ce résultat. Relectures ciblées sur vrais risques, exécutions répétées seulement après défaut/changement pertinent. Capsules/manifeste d'entrées suffisants, pas de duplication de tous les anciens fichiers par passage. Ne pas convertir un test externe différé en vert.

Tu n'es pas seul. Racine réelle C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, hostcwd ancienatelier-ui obsolète ; shellpwsh/loginfalse/workdirabsolu/require_escalated. Branche codex/bmad-initiatives-2-3, baseline9dc1d12e69b0bd9006af9c41ac491732f1bbd0ac. Préserver stat/EOL-only boundaries et managed/untracked, aucun reset/stash/stage/commit par worker. Parent possède gel/header/statuts/revues/commit ; implémentation possède les chemins produit/tests/banc/notes désignés avec exécution séquentielle par un seul implémenteur. Une invocation Build est déjà active : ne pas relancer bmad-build, planifier un autre Build ni lancer de sous-agents de production ; exécuter ce plan séquentiellement. Pas de profil/app personnel, aucun modèle, Zscaler/IT, fermeture d'app étrangère ou installation personnelle implicite. F6clipboard positif2.8 reste différé2.16 ; le graphe n'en dépend pas.

Impeccable : extension Operate code-led du monde établi, contexteApp une fois par session qui édite UI, craft-floor juste avant UI, pas nouvelle direction/assets/seed. Deux lots visuels groupés maximum sur vrai résultat (grand sombre avec relations, compact clair, zoom natif200, nœud→panneau/retour), détecteur unique puis substituts officiels frais finish/documenter si rôles natifs non exposés. Pas de claims humains/WCAG/G4/G5globaux.

## Verification

**Commands:**
- Tests Node ciblés nouveaux Graph/corpus/coordinator et dépendances réellement touchées : démonstration comportementale puis vert, zéro skip ; UI seulement parcours/onglets/fichiers affectés avec CSS réel et thèmes réellement affichés.
- `npm run build` puis `npx electron-builder --win nsis --x64 --config.directories.output=dist/graph-reviewed` : types/build/paquet et profil fermé/resources réellement livrés, pas connexion fournisseur.
- `node --experimental-strip-types scripts/qualification/graph-project.mjs --executable=dist/graph-reviewed/win-unpacked/Madness.exe` sur projet propre sansBMad/IA/Git : générer/rechercher/sélectionner source réelle, vérifier sens/confidence et absence d'effets, mutation/arrêt actif/Job0 et réouverture passive exacte. Ressources et ASAR identifiés ; nativeHTML jamais affiché ; métriques bornées de ce témoin, pas seuil deperformance inventé.
- Rapport `qualification-graphe-produit/parent-verification.md` et manifeste de candidat : preuve étroite/source/paquet, tests externes différés et condition de reprise, provenance des captures, revues corrigées/recontrôlées, aucun appel au porteur pour recopier JSON/jeton. Commit local puis reprise2.9 et backlog.


### Vérification supplémentaire Stage3 — 4 novembre

Auditeur high indépendant : HIGH-1/P2 (réconciliation logique après arrêt physique confirmé) et HIGH-2/P2 (dernier enfant omis de l’agrégat terminal après exception) confirmés, routepatch ; deux correctifs par même implémenteur, rouges ciblés puis19verts dont5processusPowerShell, recheck même auditeur résolu dans high-recheck.json. high-targeted002 porte la récupérationnative corrélée sur6c422… ;001timingrouge conservé. Pas d’intentgap ni boucleplan.

Finish Impeccable officiel frais retournefix : F1 statut tentative interrompue/timeout distinct du résultat conservé, F2 labelsSVG réellement trop petits aprèsFit. Patches ciblés dans même mandat UX, pas nouvelle refonte. Deux lots initiaux épuisés ; une passe de scoring demandée par ce rôle frais est autorisée, explicitement troisième lot et deux tentatives après défaut de fond/viewport du wrapper (premiers2PNG rejetés/préservés). Aucun nouveau détecteur. Le gel d’intention reste identique ; les preuves005 restent rattachées à2f7… et ne deviennent pas succès du futur paquet.

### Matrix Test Audit Stage3

T1–T9 couverts par tests exécutés/réussis, détails et limites dans qualification-graphe-produit/matrix-audit.md. HIGH1/2 résolus par même auditeur ; F1/F2 résolus par même finish, ship limité aux corrections scorées. Documentation des trois sources et ajout Components/related_targets, sans nouveau token. Les neuf rouges UI larges non attribués restent visibles ; aucun vert global. Gel31635… identique.

### Clôture vérifiée

Q1–Q5 patchés puis même Quick résolus ; parent24ciblés0skip, build/NSIS0,19sorties/10pins exacts, vertical006 du finalfe0d… huitgroupes/deuxfermetures/cleanuptrue et30inputs exacts, sans nouvelles captures. F1/F2 shipscoré historique +Q4 sources/tests favorables, documenteur étroit terminé. Aucun correctif produit du lot différé ; neuf divergencesUI nonattribuées2.15, clipboard2.16 et matrices/gates finaux restent ouverts. Planbuilt sous mandat autonome/checkpointsfalse ; aucun nouvel accord humain prétendu. Gel31635… identique, prochaine entrée2.9.
