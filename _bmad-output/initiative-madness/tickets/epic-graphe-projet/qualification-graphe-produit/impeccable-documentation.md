# Relevé Impeccable — Graphe produit 4.4

Aucun changement du système visuel.

- Palette : pétrole, terracotta, anthracite chaud et ivoire hérités ; `graph.css` utilise les rôles existants, sans couleur primitive ajoutée.
- Typographie : Oxanium 450 à 16 px, métadonnées/code à 14 px, Barlow Condensed Bold pour titres et commandes ; aucun chargement de fonte supplémentaire.
- Formes : commandes en plaques à coins coupés héritées ; résultats textuels plats, champs natifs bordés, contours du dessin liés au thème.
- Lecture : fonds calmes, chemins repliables, liste HTML intégrale et détails lisibles hors SVG ; deux colonnes puis flux vertical sous 1001 px.
- États : dernière tentative, résultat conservé, sélection, focus et fraîcheur restent distincts ; sens, confiance et score sont du texte, sans probabilité ni état métier déduits du décor.

Relevé du 4 novembre 2026 par un substitut technique frais d’`impeccable_documenter`, rôle natif indisponible. Définition officielle, `reference/document.md` et `reference/operate.md` lus ; `impeccable context --target src/renderer/src/App.tsx` exécuté une fois, code 0. Ce fichier est le seul livrable écrit par ce passage. PRODUCT, DESIGN, sidecar, surface et spines ne sont pas modifiés.

## Extension observée

Graphe est la quatrième destination : **Parcours · Conversation · Toutes les possibilités · Graphe**, après le catalogue 2.6 et vers le panneau de fichiers 2.8. Les flèches/Début/Fin déplacent le focus des onglets ; le bouton natif s’active par Entrée/Espace. Le titre, les états datés, la portée code-only et les commandes volontaires précèdent la recherche. Le supplément Sally 4.2 sous `../ux-graphe/` est l’autorité de comportement réconciliée ; aucune nouvelle activation Sally n’est revendiquée.

La liste expose tous les nœuds admis, avec recherche nom/identifiant/chemin et sélection visible. Le détail offre relations entrantes/sortantes, filtre indépendant, origine → type → destination, confiance traduite et score Graphify séparé. Le SVG local est déterministe, trié par identifiant, avec flèches et boucle réflexive ; ses noms abrégés à 19 caractères restent des aides de dessin, sans remplacer la liste intégrale. Après F2, leurs labels sont compensés selon la transformation du viewport et le zoom local pour viser 14 CSSpx effectifs. Zoom local 25–300 % par pas de 25 points et pan de 60 unités ne modifient ni recherche ni texte de lecture. Le nombre représenté et le nombre dans le cadrage sont distincts.

La Map de vue est attachée à l’identité complète du résultat pendant la session renderer : requête, sélection, filtres, relation ouverte, défilement de liste, zoom/pan. Une nouvelle analyse ne reprend que la requête retrouvée pour le projet/racine ; ne pas annoncer une conservation durable de cette Map ou de tous les filtres. Le résultat métier et le dernier complet sont conservés dans l’annexe GraphStore, distincte du Snapshot v1. La restauration est passive et non revalidée ; aucun accès fichier n’est recréé par simple lecture. Un échec d’enregistrement garde son texte et son réessai séparés de l’analyse.

Voir le fichier exige le binding courant projet/racine/analyse/révision/chemin puis la référence privée `corpus` du panneau 2.8 ; le renderer n’accorde aucun accès depuis le libellé du nœud. Référence ancienne/inconnue garde son motif. Le retour au travail vérifie projet/racine/initiative/échange et restaure le déclencheur, la sélection de saisie et le défilement encore disponibles ; un contexte changé produit un refus de retour exact.

## Preuves et limites

Les cinq PNG `.impeccable/review/graph44-*.png` ont été ouverts ; leurs octets sont identiques aux cinq sources `vertical-005/` listées dans [candidate-manifest.json](candidate-manifest.json) : grand sombre général/relations, nœud→fichier sombre, compact clair, zoom natif application 200 % clair. Source : candidat 0.2.12, ASAR `2f7ab4a1c03c9ca6373d484956a29f315ec4393e1dfa63f04bf4412f353ee3f4`. Lors du relevé initial, les cinq fichiers UI ci-dessous correspondaient exactement à `vertical-005/inputs.json`. Ce lien conserve leur provenance historique ; les trois sources renderer modifiées par F1/F2 sont distinguées dans le complément ci-dessous, sans attribuer les corrections ultérieures au paquet005.

Les clés `graph-strings.ts` existent en FR/EN ; App n’active pas la variante anglaise, et des textes du graphe ainsi que FilePreview restent français. L’anglais global 2.14 et la matrice d’exploration 4.8 restent ouverts. Aucun nouveau test, rendu, serveur, détecteur, appel fournisseur/réseau, installation ou changement de profil n’a été exécuté par ce passage documentaire. Le détecteur unique existant [impeccable-detector.json](impeccable-detector.json) contient `[]` ; ce passage ne le rejoue pas. Les corrections de récupération inconnue/agrégation terminale et la qualification finale restent portées par le parent : aucun verdict global, statut built, acceptation humaine, conformité WCAG, G4 ou G5 n’est déduit.

## Recontrôle étroit F1/F2

Lecture limitée à [high-fixes-worker.md](high-fixes-worker.md), au delta des trois fichiers renderer et aux champs pertinents du [manifeste high-finish](candidate-high-finish-manifest.json), sans rechargement du contexte ni nouvelle inspection visuelle. Les trois empreintes courantes correspondent aux `rendererInputs` de ce manifeste, candidat 0.2.12, ASAR `fb688dfd8e8b0f70751d3f2c5564ade5b5c31f4cfd4cc6df234f7dc0e2743ed4`.

F1 : l’état de la dernière tentative précède le résultat conservé. Interruption et délai dépassé ont leurs propres libellés FR/EN ; « Arrêt confirmé » n’est ajouté que pour un arrêt confirmé, et l’inconnu garde sa formulation. L’identifiant de tentative et celui du graphe conservé sont affichés séparément. La présence d’un ancien résultat complet ne transforme donc plus une tentative interrompue/expirée en « Analyse terminée » ; couverture et fraîcheur restent celles du résultat affiché.

F2 : `ResizeObserver` mesure la région de dessin. La taille du label SVG est divisée par le facteur effectif du viewport et du zoom local afin de conserver environ 14 CSSpx visibles ; la grille, les flèches, la liste, la sélection, la recherche et le pan restent distincts de cette compensation. Fit/Reset reviennent toujours à zoom=1/X=0/Y=0 dans le viewBox qui cadre la projection ; cela ne constitue pas un nouvel algorithme de disposition. Le manifeste et la remise du worker rapportent 14,01 CSSpx minimum après Fit/Reset et 45/45 nœuds cadrés, sur un replay du graphe natif005 avec tentative synthétique. Ces mesures sont attribuées au worker, sans nouvel essai ou ouverture de capture par le documenteur.

Les deux images correctives du troisième lot, à quatre tentatives de capture cumulées, restent des preuves renderer rejouées ; elles ne remplacent ni les cinq captures005, ni leur ASAR, ni une qualification native globale. Les recontrôles high/finish et le statut final appartiennent au parent.

| Source courante du delta | SHA-256 |
|---|---|
| `src/renderer/src/GraphPanel.tsx` | `f925708a671ef11368cd50c71861a41e512675af45ae09c34807307b1b0931c8` |
| `src/renderer/src/graph.css` | `34cd5ce8905185aec506666238b08ad98fee7807e7957dff8fc381e8fc0d2187` |
| `src/renderer/src/graph-strings.ts` | `dd7ee7b5c1b42fc33d9e6a91c809e7bf1aad84bfd22086fbf9c816600d93f0f4` |
| `high-fixes-worker.md` | `8f6eec946acc13574608d7b5c34516263bec5ced65b82ffc61e0ef434c163180` |

## Réconciliation minimale proposée au parent

Aucune modification des primitives, palette, fontes, assets ou règles globales n’est nécessaire. L’extension peut être inscrite sous `## Components` du DESIGN racine et dans la surface Operate par ce seul résumé : « Graphe est la quatrième destination du projet. Une liste HTML intégrale et des relations textuelles accompagnent un SVG local déterministe ; sens, confiance, score et date d’observation restent explicites. La dernière tentative et le résultat conservé portent des états et identités séparés. Les labels du dessin compensent son échelle effective, sans réduire le texte de lecture. Recherche, sélection et zoom/pan sont locaux à l’identité de l’analyse en session ; l’accès aux fichiers rejoint le panneau 2.8 après revalidation. » L’ajout court sous `## Components` du DESIGN racine reste recommandé ; dans `related_targets` de la surface, ajouter exactement `src/renderer/src/GraphPanel.tsx`, `src/renderer/src/graph.css` et `src/renderer/src/graph-strings.ts`. Aucun nouveau token ou snippet de primitive n’est justifié ; préserver le sidecar tant que le système n’est pas régénéré.

Dérives non canonisées ni réparées : mentions historiques des candidats 0.2.3/0.2.5/0.2.6 et du chargement CSS dans DESIGN/surface ; elles ne décrivent pas une validation du paquet 0.2.12. La compensation de fonte F2 reste une règle locale du graphe, sans nouvelle primitive typographique globale. Ces limites restent explicites, sans réparation incidente.

## Empreintes du relevé initial, avant F1/F2

Chemins relatifs à la racine explicite `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness`. Les empreintes décrivent la lecture de ce passage, avant toute réconciliation documentaire du parent ; elles ne constituent pas un gel du dépôt.

| Source | SHA-256 |
|---|---|
| `src/renderer/src/GraphPanel.tsx` | `f8e4854eeddc5757ced84a699db588d9b86c8c824e07f47faf584f1219f405de` |
| `src/renderer/src/graph.css` | `8246b7e2e090939efa617fb1c6cc797f79ea5181181fdeab196c24662d175245` |
| `src/renderer/src/graph-strings.ts` | `19c7d59a2ca63183df154dfce8b84b07a088458e8d65a3b5f4aa5c9019fe1274` |
| `src/renderer/src/App.tsx` | `22bd10cf2802f1bf99fc6bcdd301408fab4194f7f720d069742362ac28bb1dd7` |
| `src/renderer/src/FilePreview.tsx` | `014ccbd05f25d15dd72d7b253ad5bd17e1d1bc5bcf5f4b74b0f5a0a4b5d4d335` |
| `src/renderer/src/styles.css` | `88368815862483a1ceb3350ab44ff2955948e9fc834bc2f262b2a0ec7e15b91a` |
| `src/renderer/src/atelier-controls.css` | `7cc7b3738ae1cc892d5938069b361aedee08d7f46b15ce1c901f85a507519570` |
| `PRODUCT.md` | `0da5e5d8a8833cc7989c357dfd85a4c26abb92d7ab92c96069ec92fe715e5558` |
| `DESIGN.md` | `66dde2622bd66a24542987ff61656304dc6e3fb1e6370c40049e12383052c1e9` |
| `.impeccable/design.json` | `91c057fa0734124969403a97135c9ac038613bfa7e9f0c4f4ad6c5b932fcb827` |
| `.impeccable/surfaces/src-renderer-src-app-tsx.md` | `b03a739d7410a1b5c96d1a3856872d763849027e772c1ecf635940b924809df9` |
| `_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/DESIGN.md` | `da15476aa70ca59e7323909c89042c1ac15fb2beb260c02b1fec300ce7e14f20` |
| `_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/EXPERIENCE.md` | `97dfa69866f4ab7f9fff06a284faef45c4b98e92de7a36fad947c5282fdcc563` |
| `_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/handoff.md` | `c5a5a5535b1e45063815d5960df01c50ad5ee3ff535192c9cef78449a433eebe` |
| `src/contracts/bmad-graph.ts` | `74ab78ad78afd7820fc6c939f51a7a278f5e4d78bbc1ccf4f0f8be6581f77912` |
| `src/core/bmad-graph.ts` | `de8aee46dd4003e54320ecd93438b7fce1c07a80cd9a867b292c6a1a95851ee1` |
| `src/core/graph-coordinator.ts` | `12d1bd919ff7a68ec13047878e803be01f31d92c82ed6454c6264e302fdf99cd` |
| `src/adapters/persistence/graph-store.ts` | `7c83cc042a526d1f50bda286cf0e2dfae9a497f01c44a859616b2f08b9b44a59` |

## Complément Q4 — consultation du dernier complet

Recontrôle documentaire limité aux extraits pertinents de GraphPanel et de graph-strings, avec empreintes des trois fichiers renderer. Aucun contexte, test, capture ou détecteur rejoué. Les hashes courants ci-dessous remplacent, pour ce seul delta, la qualification de sources « courantes » du complément F1/F2 ; les sources et captures ASAR `fb688dfd8e8b0f70751d3f2c5564ade5b5c31f4cfd4cc6df234f7dc0e2743ed4` restent historiques. Aucun rendu Q4 n’est déduit ; les contrôles de tests du parent restent distincts de cette lecture source.

Lorsque le dernier résultat est partiel et qu’un dernier complet d’une autre analyse est conservé, une commande locale propose **Consulter le dernier complet**, puis **Revenir au résultat partiel**. Les deux libellés et **Graphe consulté** ont leurs paires anglaises. La bascule ne lance aucune analyse : elle choisit le snapshot affiché et utilise sa propre identité comme clé de vue ; liste, recherche, sélection, filtres et zoom/pan retrouvent ainsi leur mémoire de session respective. Cette consultation répond à l’exigence déjà portée par Sally 4.2, EXPERIENCE E2, sans nouvelle activation.

L’état de tentative continue de porter le résultat le plus récent, tandis que **Graphe consulté** identifie séparément le snapshot affiché. L’ancien complet porte explicitement la fraîcheur historique/non revalidée et sa date de collecte ; il n’emprunte pas la fraîcheur du partiel. La commande de revalidation des sources est absente pendant cette consultation : aucune intention de revalidation du dernier partiel n’est ainsi présentée comme visant l’ancien complet. Les bindings de fichier restent corrélés à l’identité affichée. F1/F2 et les règles globales restent inchangés ; ce complément n’ajoute aucun gate ni preuve visuelle, native ou humaine.

| Source après Q4 | SHA-256 |
|---|---|
| `src/renderer/src/GraphPanel.tsx` | `9dde45a086ec823d509d86bf4a0834abd67bd81b0b32106f3fa79e2206aa5188` |
| `src/renderer/src/graph-strings.ts` | `bc247ed2ba433282ff2548d955da83b4c83ea6d5e4741c7f5d592e9ea7798146` |
| `src/renderer/src/graph.css` | `34cd5ce8905185aec506666238b08ad98fee7807e7957dff8fc381e8fc0d2187` |
