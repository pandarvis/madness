# Impeccable Documenter — fichiers et éditeur 2.8

Relevé initial du 4 novembre 2026 à 14:51 UTC, depuis `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness`, HEAD/baseline `efbfdb6b5d16d541ccb866aca917ad316337486b`. **Aucun changement du système visuel.** Seul le présent relevé est écrit ; `PRODUCT.md`, `DESIGN.md`, son sidecar, la surface et les contrats UX restent préservés.

Le recontrôle post-Quick en fin de document actualise les trois sources produit modifiées depuis ce premier état ; les empreintes du premier relevé restent historiques et ne sont pas attribuées au candidat final. Les autorités du système restent inchangées.

## Définition et contexte réellement chargés

Substitut technique frais du rôle officiel `impeccable_documenter`, le rôle natif n’étant pas exposé. Définition lue directement dans `impeccable/4.3.1/skills/impeccable/agents/impeccable_documenter.toml`, puis `reference/document.md` et `SKILL.md`. Un seul appel officiel `scripts/impeccable.cmd context --target src/renderer/src/App.tsx`, exécuté dans le véritable dépôt : contexte résolu vers les autorités racine et `.impeccable/surfaces/src-renderer-src-app-tsx.md`, cible existante, plateforme `web` dans Electron/Windows. Mode **Operate**, extension **code-led** du monde atelier établi ; aucun nouvel entretien de direction ou seed. Aucun persona Sally activé par ce passage.

Le relevé suit la distinction du documenter : une extension ordinaire conserve le système ; une dimension propre à un composant ne devient pas automatiquement un token durable. Aucun nouveau raster, fonte, palette, règle globale ou extrait du sidecar n’est requis pour constater cette extension.

## Système conservé — cinq lignes

- Palette : anthracite/ivoire pour la lecture, pétrole pour le chrome, terracotta pour l’action et bleu pour les liens/focus ; le panneau utilise les variables du thème actif.
- Typographie : Oxanium locale 450 pour le courant 16 px et les métadonnées 14 px ; Barlow Condensed 700 pour titres/commandes ; chemins et contenu préformaté monospace.
- Formes et profondeur : aplats calmes, arête atelier, petits angles utilitaires et ombres diffuses ; les plaques de commandes héritées conservent leur silhouette et leur focus rectangulaire.
- Règles de lecture : **The Quiet Reading Rule**, **The Two Voices Rule** et **The Working Center Rule** ; le contenu demeure du texte réel, sélectionnable, sans texture ou décor nouveau.
- Règles de vérité : **The Explicit State Rule** ; provenance, révision, fraîcheur et résultat d’action restent textuels, sans succès ni acceptation déduits du décor.

## Extension observée dans les sources finales

`FilePreview.tsx` importe `files.css`. `App.tsx` place le panneau dans le corps de travail ; les entrées passent par les sources de `ProjectResume` et `CatalogPanel`. Le catalogue ferme sa fiche avant l’aperçu et transmet son déclencheur exact ainsi qu’un repli vers ses résultats. L’ouverture ferme la fiche d’agent, la connexion et le contexte flottant. La consultation en mémoire est indexée par projet/racine physique/initiative ; sa fermeture rend le focus au déclencheur connecté, sinon au repli ou au titre du projet avec annonce.

Le panneau de lecture reprend `--panel`, `--text`, `--muted`, `--line`, `--atelier-edge`, `--control-line`, `--panel-shadow` et `--backdrop`. `files.css` ne déclare aucune primitive de couleur ni famille de police. Son contour supérieur de 3 px et sa séparation latérale restent des usages locaux du vocabulaire existant. Le dock occupe 318 px ; à moins de 1080 px, ou après Agrandir, le même élément `<dialog>` devient modal. La superposition est bornée à `min(340px, calc(100vw - 32px))`, avec retraits de 16 px ; sous 721 px, retraits de 8 px et largeur utile. L’agrandissement est borné à 1000 px. Ces valeurs décrivent cette implémentation, sans créer une règle générale pour tous les panneaux ni confondre le seuil agent 1323 px.

Titre 25 px, nom du fichier 20 px, métadonnées/statut/texte préformaté 14 px ; commandes locales 17 px avec hauteur minimale 40 px, fermeture 40 px. Ces exceptions de consultation sont relevées telles qu’implémentées ; elles ne remplacent pas les commandes système 19 px/44 px du DESIGN racine. Le corps défile, les chemins longs et le contenu peuvent revenir à la ligne, les métadonnées et le contenu restent sélectionnables. Les sélecteurs forcés ajoutent un bord CanvasText sans nouvelle palette.

Le titre, la fraîcheur, le contexte, la provenance, le chemin complet, la révision, SHA-256, l’observation et la taille précèdent le contenu. Celui-ci est interpolé dans `<pre>` : ce composant ne crée ni lien actif ni HTML exécutable depuis le fichier. Les états ancien/lecture/observation datée/non lu restent distincts. Copier et demander l’éditeur sont deux actions explicites ; les commandes d’effet sont désactivées pour référence ancienne, demande en cours ou lecture active. La nouvelle révision est une proposition explicite, non une substitution silencieuse. Échap réduit d’abord l’agrandissement, puis ferme le panneau. La sélection/position de consultation sont en mémoire ; aucune conservation durable à la réouverture n’est promue ici.

Les libellés FR/EN existent dans `file-strings.ts`, mais la consommation est actuellement `fileLabels.fr` et l’aperçu accessible est libellé en français fixe. Cela ne prouve pas une variante anglaise produit ; la qualification 2.14 reste distincte.

## Autorités et dérives laissées en place

Le [DESIGN racine](../../../../../DESIGN.md), son [sidecar](../../../../../.impeccable/design.json) et la [surface App](../../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md) portent le monde courant. Les spines partagés [DESIGN](../../../ux-madness/DESIGN.md) et [EXPERIENCE](../../../ux-madness/EXPERIENCE.md), notamment parcours 6, portent l’identité exacte du fichier, la lecture inerte, l’agrandissement et les reçus d’éditeur. Le [handoff Graphe H3/H4](../../epic-graphe-projet/ux-graphe/handoff.md), le supplément D5 et E6 décrivent un futur raccord 4.4/4.8 ; aucun producteur Graphe n’est raccordé par cette UI.

Dérives préexistantes non réparées : le spine conserve Segoe UI/corps 13 px/conversation 14 px, certaines anciennes bornes de contenu et des mentions de panneau « futur » ; le DESIGN racine et son sidecar gardent des références temporelles au candidat 0.2.5 ; la surface et le handoff Graphe portent leurs étapes documentaires antérieures. L’anglais produit n’est pas réalisé par les seules paires de chaînes. Aucun de ces états n’est transformé en règle neuve, aucun cliché historique n’est actualisé par déclaration. Les mesures 17 px/40 px, la borne agrandie 1000 px et la densité 12 px restent des faits locaux, sans canonisation en primitives. Aucun kicker, glyphe-icône ou ombre dure n’est ajouté au système par ce relevé.

## Provenance du premier relevé — 14:51 UTC

Les dix sources UI ci-dessous correspondent octet pour octet à [parent-source-002/producer-manifest.json](parent-source-002/producer-manifest.json), horodaté `2026-11-04T14:21:27.269448+00:00`. La comparaison de ses 122 entrées présentes dans le dépôt relève un seul écart : le test de focus mentionné ensuite. Aucun écart produit dans ce gel. La vérification `git diff` contre la baseline n’a retourné aucun changement pour les trois feuilles globales, `main.tsx`, les autorités racine et `.impeccable`.

| Source UI lue au premier relevé | SHA-256 du premier relevé = gel 002 |
|---|---|
| `src/renderer/src/App.tsx` | `ba16154dd6cb28f92825013d69ece3454bf0e3b0eecdd95f7cd7096f26bf01b3` |
| `src/renderer/src/FilePreview.tsx` | `9e7d5b151fbbbead8fe6dab706849efc88df8495e9553929d812cae693f1590f` |
| `src/renderer/src/files.css` | `aaab3c8c65684def6821bbca29cffdea911fb3868bce89591c9eb33ec2a6bb6e` |
| `src/renderer/src/file-strings.ts` | `5404f3394c451a04b28ef1ff8a8e5b3d58e58bd1a04be3b24ac44d44bfa831c5` |
| `src/renderer/src/ProjectResume.tsx` | `fbe0b489eb3d56a8afb1ea1c8cac65fb37a4f433b9f7b6ce2e8f087570ae6c02` |
| `src/renderer/src/CatalogPanel.tsx` | `aad9439eef38831c2798cd3d65ee34be931cd38bff7c8f2f45b97d93db995041` |
| `src/renderer/src/main.tsx` | `65d669d6fc3590fa320a46775c5a2a616101b04ee0fe769753e293917abf7b76` |
| `src/renderer/src/styles.css` | `88368815862483a1ceb3350ab44ff2955948e9fc834bc2f262b2a0ec7e15b91a` |
| `src/renderer/src/atelier-immersion.css` | `4f1ed5e84745667f33fc74f74e2271f2fc58043bf4459fa29cd80fb6ba41236d` |
| `src/renderer/src/atelier-controls.css` | `7cc7b3738ae1cc892d5938069b361aedee08d7f46b15ce1c901f85a507519570` |

Au premier relevé, le seul delta était `tests/connection-ui.test.mjs` : gel `8f9058a8f93d5a19e630af3ce680dc9f2d88a0556fce18d8fe5f0efd8d98bf5b`, actuel `951feaa00977c60e47a992d69c881731cb74a054dfa3d002b8fa149d876700c4`. Diff textuel relu : le test capture le bouton exact avant Fermer, attend le retour de focus programmé puis contrôle ce même élément et libère son handle. Aucun changement produit dans ce delta ; aucun résultat de test n’est produit par ce passage.

| Autorité ou reçu lu | SHA-256 |
|---|---|
| `PRODUCT.md` | `0da5e5d8a8833cc7989c357dfd85a4c26abb92d7ab92c96069ec92fe715e5558` |
| `DESIGN.md` | `66dde2622bd66a24542987ff61656304dc6e3fb1e6370c40049e12383052c1e9` |
| `.impeccable/design.json` | `91c057fa0734124969403a97135c9ac038613bfa7e9f0c4f4ad6c5b932fcb827` |
| `.impeccable/surfaces/src-renderer-src-app-tsx.md` | `b03a739d7410a1b5c96d1a3856872d763849027e772c1ecf635940b924809df9` |
| `ux-madness/DESIGN.md` | `f17296a2d923e14a3837ca4fbcabf98d4c57f03cb2c93787d9534028916e7e51` |
| `ux-madness/EXPERIENCE.md` | `ac3874e6680bef5356a537f36ae1e00d504643cd075788921babb838dd82c9cf` |
| `epic-graphe-projet/ux-graphe/DESIGN.md` | `6b51044a49810cc28be094d687fcb27c8fa27ae079819ba9c8d539857fffc61c` |
| `epic-graphe-projet/ux-graphe/EXPERIENCE.md` | `a2363df06532ab99464ac05aeb0a01945e58a3a715893b43c0345716ff466d52` |
| `epic-graphe-projet/ux-graphe/handoff.md` | `66ddd2daad9847e281852139bc14eb408c1555a72070b3636e17b7d84d058ab4` |
| `parent-source-002/producer-manifest.json` | `a0d602a804de4ad3717a0bcf2fb83daccff1b8e34983d183b022327117cf7a44` |
| `parent-audit-002.json` | `3440799cd5c3154943899e84e6428312a9f81888c88c8c32261885bbb7ceb8c7` |

`parent-audit-002.json` relie le candidat logiciel 0.2.11 à l’ASAR `689656002d07550c1b3fe86db6b8a0adf344f5fa30d31be99c4842714ad5c21e` et à l’installateur `09d96f40ce895caedf346fefc04394ca572dcd9fd91c9bf5476d9d00b65aa2ed`. Candidat non installé au mandat. Le documenter n’a ni reconstruit ni exécuté ce paquet.

## Portée du premier passage

Lecture de code, autorités et empreintes seulement ; aucune application, test, build, installation, capture, fournisseur, réseau, détecteur ou sous-agent lancé. Le contexte signale le détecteur manuel : sa passe unique relève du flux parent, elle n’est pas dupliquée ici. Les corrections high H1/H2 sont présentes dans le gel déclaré par le parent ; la revue Quick et le vrai Main002 étaient en cours au mandat, sans verdict importé ici. Main001/ASAR `efcacb8…` reste historique et partiel, avec frames de lecture et reçu brut d’éditeur absent : aucune réussite actuelle n’en est déduite. Aucun ship global, activation Sally, accord humain du présent panneau, conformité WCAG, gate G2–G5 ou statut built n’est prononcé par ce relevé.
## Recontrôle ciblé post-Quick — 4 novembre 2026, 15:21 UTC

Même substitut technique officiel et même périmètre documentaire. Aucun nouvel appel context, craft, détecteur, capture ou activation Sally ; seule cette note est actualisée. Le mandat parent borne le delta produit à `src/core/project-files.ts`, `src/renderer/src/FilePreview.tsx` et `src/renderer/src/ProjectResume.tsx`. Diffs relus contre les octets du gel `parent-source-002`, sans confondre les différences de fins de ligne avec les modifications fonctionnelles.

- **Revalidation au point d’effet.** Dans `project-files.ts`, les contrôles asynchrones du contexte précèdent la dernière vérification physique ; après cette vérification, les assertions de possession restent synchrones avant écriture du chemin ou handoff éditeur. La vérification de retour adopte le même ordre contexte puis physique. Le texte `EDITOR_UNKNOWN` annonce explicitement un résultat inconnu, une ouverture non confirmée et l’absence de nouvel envoi automatique ; un rejet connu conserve son libellé d’échec. Ce relevé de code n’atteste pas un reçu OS.
- **Résultats distincts et persistants dans le panneau.** `FilePreview` sélectionne désormais le dernier résultat de copie et le dernier résultat d’éditeur séparément. Quatre paragraphes `role="status"`/`aria-live="polite"`, dans le flux existant et avec la même classe de notice, portent respectivement le motif de lecture, le reçu d’éditeur, celui de copie et l’erreur locale/attente. Un motif de lecture ne masque plus les résultats d’effet ; une copie ne remplace plus visuellement le résultat d’éditeur. Leur texte garde les distinctions connu/inconnu/refusé. Aucun nouveau toast, décor ou composant système n’est introduit.
- **Repli réellement focalisable.** L’aperçu ne retient par défaut qu’un titre `h2[tabindex]`/`h3[tabindex]` comme repli local. Le titre existant de `ProjectResume` reçoit `tabIndex={-1}` : il accepte le retour programmatique lorsque le déclencheur n’existe plus, sans devenir une étape Tab supplémentaire. Les destinations du catalogue et le mécanisme de retour d’`App` restent ceux du premier relevé.

**Verdict documentaire : aucun changement du système visuel.** Palette, fontes, dimensions, seuils, contenus inertes, formes et mouvement restent ceux déjà décrits. `files.css`, `App.tsx` et `file-strings.ts` gardent exactement les SHA du premier tableau ; les neuf autorités produit/design/sidecar/surface/spines/supplément Graphe ont été réempreintées et restent identiques au tableau du premier passage. Les valeurs de consultation 17 px/40 px et 318 px/1080 px ne sont toujours pas élevées au rang de règles globales. Les dérives historiques et la consommation française fixe ne sont ni réparées ni canonisées.

| Source relue après Quick | SHA-256 à 15:21 UTC |
|---|---|
| `src/core/project-files.ts` | `d07eecee0b67ee41d670d9b88d4df4fae3e0be9c43fe063c9d3f881db208b419` |
| `src/renderer/src/FilePreview.tsx` | `68fe036a2b3e1fd0318199570e8fb06f023b792f5096c08f0395fa86e50f4d7e` |
| `src/renderer/src/ProjectResume.tsx` | `b347250260812825edb7ac0af8c62b0e07203b2e8a70c01c3e841e088acbd91d` |

Le parent signale 60 cas backend, 16 cas UI et le build frais réussis ; ce passage ne les réexécute pas et n’en produit pas de validation indépendante. Les preuves natives finales, le paquet exact post-Quick et la finition restent à établir par leur flux propre. Le contrôle positif du presse-papiers demeure en attente de disponibilité externe : le témoin direct Electron standard renvoie une chaîne vide selon le constat parent. Ni « Chemin copié » réel ni faux tout-vert ne sont déduits des cas synthétiques ou de la lecture du code. L’ASAR `689656…` du premier passage ne se voit attribuer ni ces nouvelles sources ni une qualification post-Quick par ce document. Aucun statut built, ship global, accord humain, WCAG ou gate G2–G5 n’est prononcé.

