# Documenter Impeccable — bibliothèque et reprise, story 2.9

Date : 4 novembre 2026. Mode : Operate, extension code-led de l’atelier existant, seed hérité `09fa5971`.

Passage réalisé par un substitut technique frais du rôle natif `impeccable_documenter`, non exposé dans cet environnement, après lecture intégrale de sa définition officielle et de `reference/document.md` / `reference/operate.md`. Écriture limitée à cette note. Les autorités et les spines ne sont pas réécrits ; les ajouts proposés ci-dessous sont à intégrer par le parent.

## Portée et sources

Le [finisher frais](impeccable-finish.md) a rendu `disposition: ship` pour l’extension bibliothèque, attentes/récapitulatifs, retour au travail et conservation du candidat logiciel **0.2.13**, ASAR `52a226b59023d456604a1b6c37992901177ae7a4615b34664dfd80762f82d0ea`. Ce verdict ne vaut ni validation humaine globale, ni qualification native nouvelle d’agent, de collecteur ou de Graphify.

Les sept sources échantillonnées sont `ProjectLibrary.tsx`, `library.css`, `core/project-library.ts`, `consultation-navigation.ts`, les passages de navigation/composition d’`App.tsx`, `WorkOverview.tsx` et `GraphPanel.tsx`. Leurs sept SHA-256 courants correspondent aux sept valeurs enregistrées dans `preservedInputs.sourceAndOutput` du [reçu final](native-visual-round2-001/completion-verification.json). Cette comparaison est une lecture d’empreintes, sans nouvelle exécution produit.

Autorités comparées : `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` et `.impeccable/surfaces/src-renderer-src-app-tsx.md` ; [EXPERIENCE.md, parcours 5–7](../../../ux-madness/EXPERIENCE.md#epic2-p5) et [matrice L1–L8 du plan](../tickets/story-retrouver-son-travail-et-ses-attentes-entre-plusieurs-projet-plan.md). Les styles hérités ont été échantillonnés dans `styles.css` et `atelier-controls.css`. Les images retenues 01 et 07 ont aussi été ouvertes pour confronter l’accueil et la lecture littérale à ces sources ; ce passage n’est pas une seconde revue visuelle des sept cadres.

## Système conservé — cinq lignes

- **Palette :** anthracite chaud / ivoire pour lire, pétrole pour le rail, terracotta pour l’action ; attente ambrée et erreur textuelles utilisent les tokens existants.
- **Typographie :** Barlow Condensed Bold pour titres et commandes, Oxanium 450 pour lecture 16 px / métadonnées 14 px, Consolas/Cascadia pour chemins et révisions.
- **Quiet Reading :** la bibliothèque garde une surface calme ; aucune texture nouvelle ne passe derrière les passages ou les décisions.
- **Explicit State :** état déclaré, contradiction, fraîcheur, conservation et inconnue portent leur propre texte ; aucun portrait ou succès décoratif ne leur donne une autre autorité.
- **Two Voices / Working Center :** nom de projet à 23 px, sous-sections à 19 px et texte réel borné à 72 ch ; détails progressifs et retour explicite prolongent les composants existants.

`library.css` ajoute seulement de la composition locale : marge de section 24 px, séparations de 1 px avec `var(--line)`, remplissage vertical 16/24 px, résumé décalé de 20 px, détails espacés de 12 px et résumé ciblable avec remplissage vertical 8 px. Sous 721 px, l’indentation du résumé passe à 4 px et la ligne de projet se replie avec un écart de 8 px. Chemins, révisions et passages longs peuvent revenir à la ligne. Le survol, la pression, le focus externe et l’indisponibilité reprennent les règles des boutons/détails déjà présentes. Aucun token de couleur, famille de police, raster, pictogramme ou mouvement nouveau n’est extrait de ce lot.

## Champs, états et provenance constatés

| Surface | Données effectivement rendues et limites |
|---|---|
| Ligne du projet | Identifiant local pour la clé ; nom, racine exacte, repère nominal hérité, initiative établie ou inconnue et validité de la sélection. Deux noms identiques restent distinguables par leurs racines. Reprendre est désactivé pendant la navigation en attente. Sans projet, l’accueil explique l’ouverture d’un dossier. |
| État connu | Projection du snapshot propre au projet et à sa racine. Le caractère courant exige aussi identité racine, initiative, révision de contexte et fraîcheurs concordantes ; sinon la raison annonce observation précédente ou contexte historique. Date d’observation, couverture partielle, problèmes et erreurs restent visibles. Aucune date d’activité n’est calculée à partir de l’ordre des messages. |
| Déclarations | Trois tickets au maximum dans l’aperçu initial, avec annonce de cette sélection lorsqu’il en existe davantage ; toutes les déclarations restent dans les détails. Les valeurs contradictoires restent côte à côte. Champ, valeur, ligne, chemin source et SHA-256 sont présentés ; aucun état global arbitré ni acceptation humaine n’est fabriqué. |
| Résultats / décisions / restant / récapitulatifs sourcés | Passages littéraux de la projection existante, avec titre, chemin relatif, lignes, modification du fichier, chemin exact et révision. Une catégorie vide dit « Information non établie ». La date de modification n’est pas une date d’activité ou d’acceptation. Les détails de contexte exposent initiative, génération, couverture, racine, identité racine, révision du contexte et révision de collecte. |
| Récapitulatifs d’échange | Le composant Recap commun est réutilisé, préfixé `library-` pour ses repères. Il distingue texte reçu, réponses transmises, décisions ponctuelles, effets/observations de fichiers et contexte capturé. Les statuts historiques ou non conservés restent nommés. Rejoindre utilise l’identifiant et le contexte exacts ; le récapitulatif ne produit pas une synthèse nouvelle. |
| Suite proposée conservée | Réponse BMad et tours capturés sont affichés littéralement. Conversation, fournisseur, connexion, date et révision du bundle restent accessibles. Les limites distinguent proposition, action structurée et acceptation ; un reçu partiel ou une conservation non confirmée le dit. Le bundle ne prouve pas l’identité physique de la racine ni le contexte courant. Sans proposition, la prochaine action reste non établie. |
| Attentes / récupération | WorkOverview précède ProjectLibrary dans l’accueil ; demandes et erreurs gardent leurs destinations corrélées. Le nom natif inconnu reste inconnu. Le statut poli/atomique annonce les changements d’attentes. Une récupération globale avec arrêt non confirmé reste affichable sans projet. Consulter ne transmet ni réponse ni accord. |

La bibliothèque projette les données déjà présentes : elle n’ajoute ni collecte automatique ni nouvelle synthèse. La fraîcheur d’une observation locale datée ne devient jamais une garantie continue.

## Conservation, retour et réglages

**Mémoire de consultation en session.** `consultations`, `lastWork`, `workReturn`, `graphReturns` et `graphViews` sont des références/Maps du renderer ; `fileViews` et les sélections de conversations sont aussi des états de session. La clé de consultation associe projet, chemin normalisé et identité racine. Reprendre restaure l’onglet, l’échange et le défilement mémorisés puis met le focus au titre ; **Revenir au travail** vise en plus le point de saisie, la sélection de texte et le focus encore accessibles. Un jeton de navigation et le projet courant interdisent au retour tardif de détourner la vue ou le focus.

Le retour vérifie projet, racine et identité ; un projet absent ou une racine remplacée renvoie à l’accueil avec motif. Un échange supprimé n’est remplacé par aucun autre. Si l’enregistrement de la navigation échoue, la vue reste en session et le message dit que la réouverture n’est pas garantie. Les détails natifs de la bibliothèque ne sont pas un nouveau registre durable de dépliage.

**Graphe en session.** Le choix « dernier complet / partiel courant » est mémorisé par projet, racine, identité racine et périmètre/révision du périmètre. Recherche, élément sélectionné, direction et filtre de relations, relation ouverte, zoom, pan et défilement sont attachés à l’identité du graphe affiché. Lorsqu’une nouvelle identité compatible apparaît, seuls recherche et filtres compatibles sont repris : sélection et géométrie ne sont pas transplantées aveuglément. Le complet historique garde son identité et n’offre pas la revalidation destinée au partiel courant. Le retour du Graphe vérifie aussi initiative et conversation ; restauration et exploration ne lancent ni génération ni revalidation.

**Données durables et limites du banc.** Les projets, brouillons et annexes réellement stockés restent distincts de ces positions de session. Le [reçu package-003](package-003/verification.json) contient sept contrôles passifs ; la réouverture vérifie les projets persistés, le brouillon réel et les octets d’annexes, avec demandes historiques inactives. Les états contexte/progression/question active/Graphe sont des témoins synthétiques de présentation injectés en session. Leur présence dans une capture ne prouve aucune persistance durable nouvelle ni réussite native de ces producteurs. La portée réseau/enfant des reçus est **après installation du hook seulement**.

## Preuves retenues et conservation de leurs limites

La [sélection parent](visual-selection-parent.json) relie sept cadres natifs complets au même ASAR ; 06/07 sont explicitement des lectures après défilement et 02 atteint la demande après défilement. Le cadre 05 complet mesure 2063 × 1437 px, contenu natif réel 1650 × 1149, zoom 2, viewport CSS 825 × 575 et DPR effectif 2,5. L’ancien crop Playwright 1031 × 719 reste rejeté.

Deux lots et trois tentatives cumulées sont conservés, dont deux epochs dans le second lot ; sa première tentative échouée avant 05 ne devient pas un succès. Le reçu final déclare `package003Unchanged`, `sourceAndOutputUnchanged` et `asarUnchanged` vrais, pour 135 entrées source/sortie et huit fichiers package-003. Ses trois fermetures observées conservent leurs conditions de fin/cleanup ; ces déclarations sont citées depuis le reçu, sans nouvel audit intégral de ces ensembles ici. Le détecteur unique fourni est `[]` et n’a pas été relancé.

QUALITY BAR et référence critique séparée restent indisponibles selon le finisher ; aucun plafond comparatif n’est ajouté. Aucune nouvelle capture, qualification, installation personnelle, validation humaine, certification WCAG ou gate G2–G5 n’est déduite. La qualification 2.2 reste distincte.

## Petits ajouts proposés au parent

Sous `## Components` de `DESIGN.md`, ajouter seulement :

> ### Bibliothèque de projets et reprise
>
> L’accueil place les attentes et récupérations avant « Reprendre un projet ». Chaque ligne calme associe repère nominal, nom, racine exacte, initiative connue et action explicite ; les projets homonymes gardent leurs chemins distincts. État daté, couverture, contradiction et manque restent textuels. Résultats, décisions, récapitulatifs et suite proposée se lisent dans des détails progressifs avec leur contexte et provenance ; les passages restent littéraux et les inconnus ne deviennent pas une acceptation.
>
> Les noms reprennent le titre de projet, les passages restent bornés à 72 ch et les chemins longs reviennent à la ligne ; sous 721 px, la ligne se replie et les détails réduisent leur indentation. Revenir au travail restaure la consultation mémorisée en session, sans envoi implicite. Cette mémoire ne remplace pas la conservation durable des données locales.

Dans `related_targets` de `.impeccable/surfaces/src-renderer-src-app-tsx.md`, conserver toutes les entrées présentes et ajouter seulement :

- `src/renderer/src/ProjectLibrary.tsx`
- `src/renderer/src/library.css`
- `src/renderer/src/WorkOverview.tsx`
- `src/renderer/src/consultation-navigation.ts`
- `src/core/project-library.ts`

App est déjà la cible primaire ; GraphPanel est déjà référencé. Aucun nouveau primitif réutilisé ne justifie ici de régénérer palette, typographie ou sidecar.

**Dérive non canonisée / non réparée :** les mentions historiques de candidat 0.2.5 dans le système, les étapes préparatoires du contrat de surface et les anciens constats de PRODUCT restent leur historique ; elles ne sont pas promues en preuves 0.2.13. L’absence du composant bibliothèque et de ses cinq cibles est l’unique complément proposé, sans migration générale des autorités ni des spines.

