# Story 2.2 — contrôle documentaire Impeccable

Date : 2 novembre 2026. Projet : `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness`.

## Mandat et résultat

Agent technique frais appliquant lui-même la définition officielle `skills/impeccable/agents/impeccable_documenter.toml` du plugin Impeccable 4.3.1, puis `skills/impeccable/reference/document.md` lu intégralement. Le rôle spécialisé n’est pas exposé par ce harnais ; ce passage n’est pas une activation de Sally. La définition est située sous le dossier du skill, et non sous `4.3.1/agents/`.

**Aucun changement du système documentaire.** L’aide de 2.2 est une extension ordinaire : ses règles réutilisées restent compatibles avec les décisions visuelles et comportementales existantes. Aucun nouveau monde visuel, aucune palette, aucune règle globale ni composant de système ne doit être ajouté pour attester ce passage. Seul ce rapport est créé ; `PRODUCT.md`, les deux spines et le sidecar historique restent préservés.

La consigne du parent fournit la résolution F1/F2/F3 par leur même reviewer et une disposition **ship limitée aux preuves synthétiques du paquet 003**. Le présent contrôle documentaire conserve cette portée ; il ne constitue ni une nouvelle revue de finition ni une nouvelle qualification native.

## Système observé et extension

| Axe | Système existant et constat dans le code de 2.2 |
|---|---|
| Palette | `styles.css` conserve les variables des spines : anthracite chaud, terracotta d’action et bleu de repérage au sombre ; blanc/lavande et violet au clair. `help.css` n’introduit aucune couleur littérale : filets `--line`, texte secondaire `--muted`, liens `--link`, focus `--focus`, fond des sources `--panel`, retour de problème `--waiting-text`. Les états ont leur texte et leur portée. |
| Typographie | Segoe UI et replis système hérités ; titres d’aide 19 px / 1,35 et sous-titres 15 px ; paragraphes 13 px / 1,65 et métadonnées 12 px issus de la feuille commune. Invocations et chemins utilisent Consolas/Cascadia Code 12 px / 1,65. Le texte brut en `pre` hérite la police de lecture, conserve ses lignes et reste sélectionnable. La mesure locale de lecture à 75 ch ne remplace pas celle de Conversation. |
| Composition | `HelpPanel` est rendu dans Parcours après l’activité. Titre « Que faire ensuite ? », lecture locale, couverture et préparation sont distincts. Région plate à filets de 1 px ; aucun panneau permanent, ombre, illustration ou carte supplémentaire. Marges et retraits de 4/8/12/16/20/24/32 px prolongent le rythme observé. Les 32 px de séparation sont une valeur locale, pas un nouveau token global. |
| Commandes et focus | Boutons communs : hauteur minimale 40 px, rayon 8 px, retrait 8 × 11 px. Les commandes de copie et de lancement restent séparées ; les `summary` ont une cible minimale de 40 px. Focus de 2 px décalé de 3 px. « Revenir au travail » referme l’aide et rend le focus à son déclencheur. Les mises à jour sont corrélées sans déplacer la saisie. |
| Densité et fenêtre étroite | En-tête et ligne d’invocation se replient. Sous 720 px, les métadonnées passent de deux colonnes à une ; chemins et texte brut se replient, région brute bornée à 420 px avec défilement propre. La fenêtre étroite reste une présentation Windows, sans nouvelle identité mobile. |
| États et provenance | Chargement initial nommé « Lecture locale en cours », ancien contenu nommé « Dernières aides conservées », couverture et premier problème présents avant les détails. Modules, documents réellement lus et références seules restent distincts. L’aide ne reçoit pas le traitement d’un message assistant. `HelpReceiptPanel` distingue transmission partielle/non confirmée et conservation ; le réessai d’enregistrement a son propre retour. Les raisons et alternatives restent celles de la réponse brute. |
| Navigation exacte | `App.tsx` retrouve l’échange par son contexte et son identifiant `bmad-receipt-<conversationId>`. La conversation courante et les conversations précédentes reçoivent leur propre reçu. Les aides chargées ne sont pas réattribuées à un autre projet lors de la consultation. |

Ces constats s’appuient sur `src/renderer/src/HelpPanel.tsx`, `help.css`, les points d’intégration d’`App.tsx`, la feuille commune `styles.css`, `PRODUCT.md`, `ux-madness/DESIGN.md` et les passages Aides chargées/Recommandation/conservation/focus du contrat `EXPERIENCE.md`. Ils décrivent le code et les vues disponibles, sans transformer la présence d’un contrat futur en capacité livrée.

## Preuves consultées

Rapport : `.impeccable/review/help22-finish/report.json`, SHA-256 `982db445894172967faa60f7c17a546e7aefd3ed49769fc817e1893bb3fcceaa`. Il indique `passed`, du `2026-11-02T11:39:54.344Z` au `2026-11-02T11:40:15.516Z`, dans le mode `synthetic-ui-finish-isolated-mutable-help-ipc`.

Artefact déclaré et empreinte relue sur disque : `dist/bmad-help-final-003/win-unpacked/resources/app.asar`, SHA-256 **`81591937f9868bc6f5f00cbf132c9ab1326eb16d075d512a2a86ff1e1c56fc22`**. Aucun autre paquet ne reçoit ces preuves. L’empreinte vérifie la provenance de l’archive déclarée ; ce passage n’a pas extrait ni réexécuté son code.

Les 24 fichiers PNG du rapport existent ; leurs 24 SHA-256 correspondent. La matrice contient six scènes dans chacun des quatre couples largeur/thème : 1440 sombre, 1440 clair, 720 sombre et 720 clair. Les géométries enregistrées ne signalent aucun débordement horizontal de fenêtre. Les six scènes sont `ready`, `initial-reading`, `error-retained`, `historical-stored`, `partial-save-error` et `partial-retry-saved`.

Échantillon effectivement inspecté : `ready-1440-dark.png`, `ready-720-light.png`, `initial-reading-1440-light.png`, `error-retained-720-dark.png`, `historical-stored-1440-dark.png`, `partial-save-error-720-light.png` et `partial-retry-saved-1440-light.png`. Ces sept vues couvrent les six scènes, les deux thèmes et les deux largeurs. Il s’agit d’une lecture des captures existantes, sans nouvelle capture.

Le rapport contient 14 entrées de contrôle : matrice et focus historique exact, reçu propre à la conversation précédente, événement Main mutable avec brouillon/focus conservés, détails de provenance au clavier, retour au déclencheur, zoom 125 % aux deux largeurs, bascule du rail, changement de projet, consultation et réessai sans perte du brouillon/deux conversations, unicité des cibles de reçu. Ce sont les résultats du harnais synthétique existant, pas des essais réexécutés par ce documenteur. Le rapport constate la fermeture et le nettoyage de son environnement isolé ; ses observations réseau/processus commencent après instrumentation.

Le fichier existant `.working/help22-impeccable-detector.json` contient `[]` et son stderr est vide. Le détecteur n’a pas été relancé. Aucun test, build, modèle, accès réseau, lancement de l’application ni sous-agent n’a été effectué pour ce contrôle documentaire.

## Dérives antérieures préservées

- Le spine `DESIGN.md` conserve les titres historiques `Brand & Style` et `Layout & Spacing`, au lieu des titres canoniques `Overview` et `Layout` demandés par le format Impeccable actuel. Son frontmatter comprend notamment `light-colors` et des propriétés de composants dépassant les huit propriétés portables de la référence. Ce sont des écarts de format déjà présents dans le système reçu ; ce rapport ne prétend pas avoir exécuté un validateur de schéma.
- `.impeccable/design.json` n’existe pas à la racine de ce worktree. Le sidecar trouvé à `ux-madness/.working/design-capture/.impeccable/design.json` est daté du 23 octobre, titré « Madness — capture du prototype » et explicitement `draft`. Ses propres limites indiquent une simulation et précisent qu’il ne remplace pas les spines ; ses composants sont ceux du prototype clair. Il ne devient pas une représentation actuelle du paquet 003. Aucun sidecar racine n’a été créé, aucun fichier historique déplacé ou régénéré.
- Les mentions contractuelles de capacités futures dans les spines restent historiques à leur révision. Leur état de livraison ne peut pas être réécrit à partir des seules vues synthétiques de 2.2. Le français est le contenu implémenté ici ; les libellés anglais et leur livraison 2.14 ne sont pas déduits de ce passage.

**Non canonisé ni réparé :** ces écarts de format, d’emplacement/fraîcheur du sidecar et d’état contractuel restent signalés parce que le mandat porte sur une extension ordinaire et interdit une migration ou une réparation implicite. Les styles locaux de l’aide, dont le retour indisponible des boutons, ne deviennent pas de nouvelles règles globales. Aucune violation du plancher de qualité n’est convertie en règle de système pour faire disparaître un constat.

## Conservation des fichiers existants

Empreintes SHA-256 relevées à l’entrée du contrôle, puis identiques après la création de ce rapport :

| Fichier préservé | SHA-256 |
|---|---|
| `PRODUCT.md` | `83332a6f6e7434adf6e95bb8007942dbb5d72d2805bff359321d906df19b34f9` |
| `ux-madness/DESIGN.md` | `9e7321184ba6241b8cdb5da147fa745d9950f3dded83cdd21935b601baa5780e` |
| `ux-madness/EXPERIENCE.md` | `584dc0a4643e6406492533b872859b58abf6aadd1eb705f433b2f3049a4ba02b` |
| `ux-madness/.working/design-capture/.impeccable/design.json` | `fdea2372f36bf2f7358c9762165df60f813ad1f5e568b79efa1a20a24118936f` |

L’absence de `.impeccable/design.json` racine est également préservée. Aucun changement concurrent n’est révoqué. L’unique fichier écrit est `_bmad-output/initiative-madness/.working/help22-impeccable-documentation.md`.

## Système en cinq lignes

Palette : anthracite chaud, terracotta d’action et bleu de repérage au sombre ; clair lavande/violet existant.

Typographie : Segoe UI, titres 19/15 px, lecture 13 px, contexte et code 12 px ; invocations intégrales.

Composition : régions plates et filets, espace par groupes, détails techniques à la demande, conversation centrale.

Règles confirmées : aide chargée, réponse native, transmission et conservation gardent des statuts distincts et sourcés.

Interaction : cibles 40 px, focus 2 px/3 px, retour à l’échange exact et au brouillon, repli à 720 px.

## Limites conservées

Les vues utilisent un IPC d’aide et des reçus synthétiques. Elles ne prouvent ni aide native réelle, transmission fournisseur, durabilité du réessai ou réussite d’un modèle. Elles n’établissent aucune nouvelle qualification du profil personnel. Le zoom documenté est 125 %, sans déduire un contrôle à 200 %, un audit WCAG ou une acceptation visuelle humaine. La disposition ship est celle fournie pour la finition du seul artefact 003 et reste bornée à ces preuves.

## Addendum — paquet 004 après corrections backend

Recheck documentaire demandé par le parent le 2 novembre 2026, sans nouvelle capture ni exécution de qualification. L’unique modification de ce passage est l’ajout du présent addendum au rapport existant.

L’audit parent `_bmad-output/initiative-madness/.working/help22-package-audit-final.json`, daté du `2026-11-02T12:40:20.497Z`, a été lu intégralement ; son SHA-256 relu est `d65c1c81f1aa7c225a2bd6b47c38cd1f0d193dcfe5bf8a04fa801fa4fdbdc93f`. Il désigne `dist/bmad-help-final-004` et l’ASAR **`2157976da5f17173889bde64b51ee21e9cb6c2a84441afa5c959b9e74c98600e`**. Cette empreinte a été recalculée sur `win-unpacked/resources/app.asar` et correspond.

Les 13 entrées de ressources de l’audit portent toutes `packageExact: true` et `stagedExact: true`. L’audit consigne cinq copies natives exactes, 735 entrées du runtime, le pin d’arbre `f0a980c65dfb91e4a7fc3e49d92786ccf5636dd270f2d049738fd4df57298de8`, le sceau figé `69afc7ca9d922429a2f00d0754df703469bffeb8581b7f422c251a4df486ca73`, les dépendances inchangées et le hash legacy qualifié embarqué. Ce sont les attestations de l’audit parent ; ce recheck documentaire n’a pas réextrait ni réexécuté les ressources ou les sources natives. La limite de l’audit reste explicite : contrôle des octets staged/paquet, sans preuve de signature ni de portabilité externe.

`presentationByteIdenticalTo003` énumère exhaustivement la présentation comparée par le parent :

- `out/preload/index.js` ;
- `out/renderer/assets/chatgpt-mark-BzeLsF5q.svg` ;
- `out/renderer/assets/index-a3rdRiTy.css` ;
- `out/renderer/assets/index-oD-NeTHM.js` ;
- `out/renderer/index.html`.

Les cinq SHA-256 de ces fichiers staged ont été relus directement et correspondent tous aux valeurs de l’audit. L’identité byte-à-byte de leurs entrées dans les archives 003/004 est celle attestée par cet audit parent. Les quatre sources de présentation échantillonnées lors du premier passage restent également exactes :

| Source préservée | SHA-256 identique au premier passage |
|---|---|
| `src/renderer/src/HelpPanel.tsx` | `1630088a8c5981e45d5f72cf9f9ce6feccd5ff0c0c6a0fc4df44b6cb8113922c` |
| `src/renderer/src/help.css` | `b64740977463fc16b58232ee5e1d4a7bb4f0c0dbb339553e27c0126266473f70` |
| `src/renderer/src/App.tsx` | `66adfc9379426e0f06d5c8ff8c430a0a18d03fb600a172dc7eb3a5938e28a795` |
| `src/renderer/src/styles.css` | `78671ac13bffb97749f1e754e9efd723f63e7218fa505e5351d471bec96dddba` |

`PRODUCT.md`, `DESIGN.md`, `EXPERIENCE.md` et le sidecar historique retrouvent les quatre empreintes déjà consignées dans ce rapport, avant et après cet addendum. L’absence de `.impeccable/design.json` racine est conservée. Aucun fichier de système ou changement concurrent n’est révoqué.

Selon le mandat parent, les changements de 004 concernent Main et le worker pour l’arrêt, le contexte, la taille, la question capturée et la compatibilité legacy. Leur correction fonctionnelle et leurs preuves natives/tests relèvent de la vérification du parent. L’identité des octets renderer/preload borne la continuité de présentation ; elle ne qualifie pas ces nouveaux comportements backend.

**Les 24 PNG, la résolution F1/F2/F3 et la disposition ship restent attribués à l’ASAR 003 `81591937f9868bc6f5f00cbf132c9ab1326eb16d075d512a2a86ff1e1c56fc22`. Aucune capture 004 n’est créée ou déduite.** Le système résumé en cinq lignes et les dérives antérieures restent inchangés, sans canonisation ni réparation. Aucun détecteur, test, build, modèle, réseau, lancement de l’application ou sous-agent n’a été effectué pour ce recheck ; aucune acceptation humaine ni conformité WCAG n’est ajoutée.
