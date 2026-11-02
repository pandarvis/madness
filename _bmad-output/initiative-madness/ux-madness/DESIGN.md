---
name: Madness
description: "Parcours guidé pour comprendre et piloter BMad sur des projets locaux."
status: final
created: 2026-10-22
updated: 2026-11-02
sources:
  - ../initiative-madness.md
  - .memlog.md
  - ../../../PRODUCT.md
  - ../brief-madness/brief-madness.md
  - .working/design-capture/DESIGN.md
  - ../tickets/epic-boucle-codex/epic-boucle-codex.md
  - ../decision-personnelle-locale-2026-10-28.md
  - ../deferred-work.md
  - preparation-refonte-2026-10-28/preparation-refonte.md
  - ../tickets/epic-projets-bmad/epic-projets-bmad.md
  - ../tickets/epic-projets-bmad/qualification-profil-g2/profil-g2.md
colors:
  surface: '#211F1E'
  navigation: '#191817'
  panel: '#272423'
  text: '#F1EBE6'
  muted: '#BCB0A8'
  muted-lavender: '#B5AAA2'
  line: '#3A3430'
  control-line: '#82766E'
  hover: '#332E2A'
  active: '#423830'
  accent: '#E49B7A'
  accent-hover: '#EEAE8F'
  accent-active: '#CF896A'
  accent-text: '#231A15'
  accent-soft: '#392B25'
  link: '#9DC7E1'
  focus: '#9DC7E1'
  navigation-selected: '#293842'
  navigation-selected-text: '#B7D8EE'
  recommendation: '#272321'
  recommendation-line: '#5B4538'
  neutral: '#342F2B'
  neutral-text: '#D0C4BB'
  context-text: '#B7D8EE'
  waiting: '#40331F'
  waiting-text: '#EAC78D'
  success: '#24392E'
  success-text: '#A5D6B1'
  error: '#42262A'
  error-text: '#F0AEB5'
  selection: '#36576C'
  selection-text: '#F1EBE6'
  notification: '#EFE7E0'
  notification-text: '#211F1E'
light-colors:
  surface: '#FFFFFF'
  navigation: '#F4F3F7'
  panel: '#FDFCFE'
  text: '#29282E'
  muted: '#66636F'
  muted-lavender: '#75657F'
  line: '#E9E7EE'
  control-line: '#8A8291'
  hover: '#EFEDF3'
  active: '#E7E3EE'
  accent: '#654BB0'
  accent-hover: '#51368F'
  accent-active: '#432B7A'
  accent-text: '#FFFFFF'
  link: '#654BB0'
  focus: '#654BB0'
  accent-soft: '#F0EBFA'
  navigation-selected: '#E8E3F1'
  navigation-selected-text: '#533B80'
  recommendation: '#FCFBFF'
  recommendation-line: '#DED7EA'
  neutral: '#F1F0F4'
  neutral-text: '#5E596A'
  context-text: '#604392'
  waiting: '#FBF2DF'
  waiting-text: '#7B5519'
  success: '#EDF5EF'
  success-text: '#366147'
  error: '#FBECEE'
  error-text: '#9B3A43'
  notification: '#403348'
  notification-text: '#FFFFFF'
typography:
  headline:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  title:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: '-0.015em'
  subtitle:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.65
  conversation:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.75
  control:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.35
  navigation:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.35
  small:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.4
  code:
    fontFamily: 'Consolas, "Cascadia Code", monospace'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.65
rounded:
  sm: 5px
  md: 8px
  message: 9px
  group: 10px
  lg: 12px
  dialog: 15px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  page-x: 38px
  page-top: 24px
  page-mobile: 20px
  content-max: 1080px
  home-max: 1050px
components:
  titlebar:
    height: 56px
    target: 40px
    icon: 19px
  navigation:
    width: 222px
    compactWidth: 58px
    compactTarget: 40px
    iconAxisX: 28px
    drawerWidth: 240px
    drawerBreakpoint: 720px
    background: '{colors.navigation}'
    selectedBackground: '{colors.navigation-selected}'
    selectedText: '{colors.navigation-selected-text}'
  button:
    background: '{colors.accent}'
    text: '{colors.accent-text}'
    radius: '{rounded.md}'
    padding: '8px 11px'
    focusWidth: 2px
    focusOffset: 3px
  recommendation:
    background: '{colors.recommendation}'
    border: '{colors.recommendation-line}'
    radius: '{rounded.lg}'
    padding: 16px
  status:
    radius: '{rounded.sm}'
    typography: '{typography.label}'
    padding: '3px 6px'
  composer:
    radius: '{rounded.lg}'
    padding: '{spacing.3}'
    minTextHeight: 71px
    shadow: '0 3px 12px #0B090824'
    focusBorder: '{colors.focus}'
  files:
    width: 318px
    overlayBreakpoint: 1080px
    mobileMaxWidth: 340px
    background: '{colors.panel}'
    overlayShadow: '-12px 0 36px #0B09085C'
  dialog:
    maxWidth: 590px
    radius: '{rounded.dialog}'
    shadow: '0 18px 65px #0B09085C'
  notification:
    background: '{colors.notification}'
    text: '{colors.notification-text}'
    radius: '{rounded.group}'
    shadow: '0 6px 22px #0B09085C'
---

## Brand & Style

Madness est un espace de travail personnel Windows : projet identifiable, conversation centrale et contexte consultable. Le sombre anthracite chaud, la terracotta pour agir et le bleu pour se repérer suivent le choix du porteur du 24 octobre 2026. `colors` conserve cette palette ; `light-colors` conserve le clair alternatif accepté comme première base. Segoe UI, listes plates, filets et commandes compactes portent la hiérarchie.

La composition « Parcours guidé » et sa navigation rétractable sont acceptées depuis le 23 octobre. La refonte demandée après les lots fonctionnels de l’epic 1 réorganise leur présentation selon la [préparation Sally et trois expertises](preparation-refonte-2026-10-28/preparation-refonte.md) : projet et onglets d’abord, échange et réponse au premier plan, préparation et contexte en second plan. Elle conserve les contrôles et les preuves du produit. La direction s’inspire de ChatGPT Desktop ; la [référence historique Codex Desktop](imports/reference-codex-desktop.png) et la [maquette Parcours guidé](mockups/parcours-guide/index.html) restent des repères de composition.

La refonte est livrée et installée selon sa [qualification](qualification-refonte/parent-verification.md) ; son acceptation visuelle humaine globale reste inconnue. L’Update Sally du 2 novembre définit les compléments de guidage et de fichiers de l’epic 2 sous mandat autonome, en mode Impeccable Operate : composition, tokens et thèmes conservés. Ces compléments sont des contrats à implémenter, sans nouvelle capture ou preuve native. La [qualification du thème](../qualification-theme/README.md) reste une preuve historique ciblée. DESIGN.md et EXPERIENCE.md font foi en cas de conflit avec les maquettes ou imports ; la maquette garde son bandeau de simulation. Les décisions antérieures restent traçables dans [.memlog.md](.memlog.md).

## Colors

| Rôle | Tokens et usage |
|---|---|
| Surfaces | `{colors.surface}` au centre, `{colors.navigation}` à gauche, `{colors.panel}` pour les panneaux. `{colors.line}` sépare les régions sans les enfermer toutes dans des cartes. |
| Lecture | `{colors.text}` pour le principal ; `{colors.muted}` et `{colors.muted-lavender}` pour les explications et métadonnées. Une information nécessaire reste lisible. |
| Action et repérage | `{colors.accent}`, `{colors.accent-hover}`, `{colors.accent-active}` avec `{colors.accent-text}` pour l’action pertinente ; `{colors.link}` et `{colors.focus}` pour liens et focus ; `{colors.accent-soft}` pour un contexte léger. |
| Sélection | `{colors.navigation-selected}` avec `{colors.navigation-selected-text}` ; `{colors.hover}` et `{colors.active}` rendent survol et pression visibles. |
| Recommandation | `{colors.recommendation}` et `{colors.recommendation-line}` distinguent la suggestion de son environnement. |
| États | Neutre `{colors.neutral}` / `{colors.neutral-text}` ; contexte `{colors.accent-soft}` / `{colors.context-text}` ; attente `{colors.waiting}` / `{colors.waiting-text}` ; succès borné `{colors.success}` / `{colors.success-text}` ; erreur `{colors.error}` / `{colors.error-text}`. Toujours un libellé et une portée. |

Le vert exprime un résultat vérifié précis, jamais une validation humaine implicite. L’ambre signale une intervention ; un brouillon n’est pas une erreur. L’ouverture d’un projet déjà ouvert et les préparations secondaires restent discrètes.

Cibles à vérifier dans l’application : texte ≥ 4,5:1, grand texte ≥ 3:1 ; indicateurs nécessaires, contours de contrôle et focus ≥ 3:1 avec les couleurs adjacentes. Les filets pâles seuls n’identifient pas un contrôle. La qualification historique du thème a calculé 32 couples par palette : minima de texte 6,05:1 sombre / 4,84:1 clair, focus et contours 3,50:1 / 3,35:1. Ces valeurs ne constituent ni mesure de la refonte ni audit WCAG complet.

## Typography

Les rôles du frontmatter gouvernent les titres, la lecture, les commandes et le contexte. Segoe UI et ses replis système évitent une dépendance distante ; Consolas ou Cascadia Code distingue invocations et chemins. La conversation utilise `{typography.conversation}` ; sa mesure de lecture vise 65–70 caractères par ligne. Les chemins peuvent se replier et rester intégralement consultables.

Les textes fonctionnels restent au moins à `{typography.label.fontSize}`. Réduire cadres, répétitions et espacements avant de réduire la taille du texte. Le projet et l’onglet actif dominent les métadonnées techniques ; les statuts importants restent explicites.

Objectif et indisponibilité se lisent en texte courant ; invocation, chemin et identifiant utilisent `{typography.code}` sans traduction. Noms longs et anglais peuvent occuper plusieurs lignes. Seul un aperçu de chemin peut être abrégé : sa version intégrale est sélectionnable dans Détails de contexte ou Panneau de fichiers. Ne jamais abréger l’invocation à copier, la portée d’un accord, le motif d’un refus ou les deux initiatives en conflit. Révision abrégée avec libellé reste ouvrable vers la preuve intégrale ; date d’observation et fraîcheur ne sont pas confondues.

## Layout & Spacing

La barre d’action et de titre commune occupe `{components.titlebar.height}` sur toute la largeur ; les contrôles Windows natifs disposent de leur espace Window Controls Overlay. Navigation latérale et centre commencent dessous. Le centre utilise `{spacing.content-max}`, l’accueil `{spacing.home-max}`, avec `{spacing.page-x}` latéral et `{spacing.page-top}` supérieur à la largeur de référence. L’échelle 4 / 8 / 12 / 16 / 20 / 24 px distingue relations proches et sections.

Ordre de lecture du projet : en-tête projet et initiative connue → onglets → courte bande de récupération si nécessaire → contenu de l’onglet. Dans Conversation, l’échange sélectionné ou son état vide, la demande pertinente et le point de réponse sont identifiables dès le premier écran de référence. Une conversation longue reste défilante ; toutes ses lignes n’ont pas à tenir à l’écran. Préparer un nouvel échange est secondaire et ne précède pas systématiquement l’historique. Les détails techniques se déplient sur demande ; arrêt inconnu, blocage global et besoin d’inspection restent lisibles lorsqu’ils s’appliquent.

Le Sélecteur d’initiative suit le projet dans l’en-tête ; « Sélection Madness » et « Active dans BMad » restent deux lignes nommées si elles diffèrent. Dans Parcours, attentes puis faits et Registre des preuves précèdent le guidage secondaire. « Que faire ensuite ? » ouvre ce guidage dans Parcours ; « Toutes les possibilités » ouvre le Catalogue des compétences dans un onglet du même projet. Aides chargées et Recommandation ont des titres séparés ; seule la réponse reçue de l’agent entre dans Conversation. L’aide ne reçoit pas le traitement d’un message assistant.

Le catalogue utilise des lignes plates : nom et objectif, module et invocation, puis disponibilité textuelle. Recherche et filtres précèdent les résultats ; détail dans Fiche compétence. Ni grille de grandes cartes ni nouveau panneau permanent. Le Registre des preuves rassemble libellé, nature du constat, statut sourcé, fraîcheur et accès au fichier ; les détails complets sont dépliables. Le Panneau de fichiers occupe la colonne prévue, jamais la place du champ de réponse. Son agrandissement emploie un Dialogue de lecture borné à la fenêtre ; fermer retrouve la même sélection et position de travail.

La commande unique « Ouvrir un projet » est un dossier SVG de `{components.titlebar.icon}` dans une cible de `{components.titlebar.target}`, au même niveau que thème et connexion. La bascule reste sur la ligne des contrôles Windows, centrée sur `{components.navigation.iconAxisX}` depuis le bord gauche comme les icônes du rail. Les zones libres déplacent la fenêtre ; commandes et surfaces modales restent hors drag. Le monogramme de marque M et son emplacement ne reviennent pas dans le rail.

| Largeur de fenêtre | Composition de référence |
|---|---|
| ≥ 1 600 px | Navigation déployée 240 px ; panneau de fichiers futur 350 px ; retraits centraux 52 px. |
| 1 281–1 599 px | Navigation `{components.navigation.width}` ; panneau de fichiers futur `{components.files.width}`. |
| 1 081–1 280 px | Navigation déployée 194 px ; panneau futur 278 px ; retraits centraux 26 px. |
| 721–1 080 px | Navigation déployée 184 px ; panneau futur superposé sur demande, 304 px. |
| ≤ 720 px | Navigation en tiroir avec libellés ; contenu à `{spacing.page-mobile}` ; panneau futur borné à `{components.files.mobileMaxWidth}` et à la fenêtre. |

Au-dessus de `{components.navigation.drawerBreakpoint}`, le rail replié mesure `{components.navigation.compactWidth}` et conserve les repères distincts des projets et des attentes. Cibles `{components.navigation.compactTarget}`, infobulles au survol et au focus hors rognage. La [référence repliée](imports/reference-navigation-repliee.png), les captures [rail](mockups/navigation-repliee.png), [déployée](mockups/navigation-deployee.png) et [tiroir](mockups/navigation-mobile.png) montrent la base historique ; elles ne prouvent pas les nouvelles positions. La [feuille de style historique](mockups/parcours-guide/styles.css) décrit la simulation, sans spécifier la nouvelle hiérarchie.

## Elevation & Depth

Fonds et filets portent la hiérarchie ; ombres réservées au Champ de réponse, au Dialogue, à la Notification et aux panneaux superposés. Éviter les cadres et aplats répétés autour des métadonnées. Une décision de fichier conserve un groupe distinct et toute sa portée.

Les transitions brèves durent 180 ms : révélation, retour d’état ou dossier au survol/focus, sans boucle ni animation de chargement décorative. L’animation du dossier accompagne la même action au clavier et au pointeur. En mode de mouvement réduit, le dossier reste statique ; les transitions et défilements animés sont supprimés.

## Shapes

`{rounded.sm}` pour états et code ; `{rounded.md}` pour contrôles et sélection ; `{rounded.message}` pour messages ; `{rounded.group}` pour propositions ; `{rounded.lg}` pour zones de saisie ; `{rounded.dialog}` pour Dialogue. Filets de 1 px ; focus `{components.button.focusWidth}`, décalage `{components.button.focusOffset}`.

SVG en trait, base 19 px et trait 1,65, extrémités arrondies ; cible indépendante du dessin. Les repères réels des projets restent distincts. Le signe de branche du prototype ne devient pas un logo adopté.

## Components

Les mêmes noms désignent les règles de comportement dans EXPERIENCE.md. Les capacités futures y sont identifiées ; leur présence dans ces tables ne les rend pas exécutables.

| Composant | Spécification visuelle |
|---|---|
| Barre d’action et de titre commune | Bande et commandes selon Layout & Spacing ; dossier, soleil/lune et connexion de même poids visuel, cibles de 40 px, aide visible au focus/survol et nom accessible. |
| Navigation latérale | Tokens `components.navigation` ; sélection `{colors.navigation-selected}`, graisse 600 ; rail à repères distincts et tiroir à libellés. |
| Bouton | Principal accent, secondaire avec `{colors.control-line}`, discret sans fond ; `{rounded.md}`, `{components.button.padding}`. États survol, pression, focus, attente et indisponibilité explicites. Cible d’au moins 40 px, y compris question, approbation et récupération. |
| Ligne de projet ou d’attente | Liste plate : projet, initiative de la demande, nature et état ; repère identifiable. Le compteur complète la raison textuelle. Lien de destination explicite ; aucune commande sensible sur toute la ligne. |
| Onglets du projet | Parcours, Conversation puis Toutes les possibilités pour le catalogue prévu ; sélection graisse 600 et soulignement accent 2 px. Les noms se replient sans chevaucher le Sélecteur d’initiative. |
| Sélecteur d’initiative | Commande compacte à libellé, nom et chevron ; liste dans un Dialogue. Sélection locale marquée « Sélection Madness », actif BMad nommé séparément. Conflit textuel avec les deux noms, pas deux badges de couleur indifférenciés. |
| Aides chargées | Région sobre dans Parcours : titre, modules couverts, documents réellement chargés, références seules et problèmes distincts ; source, révision et fraîcheur accessibles. Lien vers le texte lu, sans bulle d’assistant ni faux bouton de lancement. |
| Recommandation | Dans Conversation : réponse native, raison et alternatives, puis actions disponibles selon leur capacité. Dans Parcours, simple lien vers cette réponse avec son contexte. Retrait `{components.recommendation.padding}` seulement si utile ; aucune promesse avant reçu. |
| Groupe d’intentions | Ligne extensible, intention et chevron ; actions dans le retrait. Pas de numérotation obligatoire ni mise en avant d’un workflow universel. |
| Catalogue des compétences | Recherche et filtres compacts avec libellés, lignes plates et invocation monospace ; couverture et diagnostic partiel visibles avant résultats. Disponibilité ne dépend ni d’une couleur ni d’une opacité réduite. |
| Fiche compétence | Dialogue : objectif, module, invocation intégrale, entrées, conditions, effets et provenance ; Copier distinct de Préparer le lancement. En pied, préparation ou motif précis d’indisponibilité et fermeture. Contenu long défilant, gardes lisibles avant action. |
| Registre des preuves | Liste plate dans Parcours : objet, fait/déduction/proposition/acceptation, source et révision, statut et fraîcheur. Sources contradictoires en lignes distinctes ; pas de coche de validation sur un fichier ou un statut built. |
| Indicateur d’état | Badge compact ou ligne textuelle ; activité présente distincte de l’historique et de la validation humaine. |
| Bande de récupération | Courte région durable sous les onglets, motif principal, portée et action. Rappels courts liés aux détails, sans répétition de grandes cartes. |
| Détails de contexte | Détails textuels dépliables ; identité connue ou inconnue, invocation et chemins repliables. Le chemin complet reste consultable. |
| Préparation d’un échange | Zone secondaire compacte : Mary ou Forge, objectif, qualification et lancement distincts, option fichiers explicite. |
| Conversation | Lecture centrale, auteur/fournisseur/provenance et contexte retrouvables ; messages humains sur fond léger. Un historique conservé est marqué inactif. |
| Question de l’agent | Question et choix textuels, saisie et état corrélé réunis ; ancien contenu visuellement distinct d’une demande active. |
| Champ de réponse | Libellé destinataire, zone redimensionnable, minimum `{components.composer.minTextHeight}`, envoi explicite et retour durable ; focus `{components.composer.focusBorder}`. |
| Proposition d’approbation | Groupe `{rounded.group}`, opération, portée et patch complet avant les choix textuels. Ne pas remplacer autoriser/refuser par coche/croix. |
| Récapitulatif de tour | Bloc sobre : fin de tour, faits connus, décisions, chemins et action attendue ; valeurs inconnues explicites. |
| Connexion Codex | Signe officiel ChatGPT 21 px, grisé à froid, dans cible 40 px ; panneau non modal à droite, maximum 420 px borné à la fenêtre. Titre, état daté, portée, récupération et actions textuelles ; aide réseau sous l’erreur. |
| Panneau de fichiers | Fond `{components.files.background}`, en-tête fichier/contexte, statut sourcé et fraîcheur avant contenu ; chemin intégral sélectionnable et actions Agrandir/Ouvrir dans l’éditeur/Copier le chemin. Agrandissement dans Dialogue ; mêmes métadonnées en lecture. Erreur conserve l’en-tête et les commandes encore permises. |
| Diagnostic et initialisation | Colonne bornée à 680 px : état agrégé puis capacités indépendantes, couverture et refus sourcés. Partiel/inconnu/périmé visibles en texte. L’initialisation demeure future en epic 3 ; aucune commande de réparation ajoutée à ce diagnostic. |
| Dialogue | Maximum `{components.dialog.maxWidth}` borné à la fenêtre ; fond du thème, `{components.dialog.radius}`, `{components.dialog.shadow}`, contenu défilant et pied d’actions. |
| Notification | Tokens `components.notification` ; feedback bref, sans recouvrir une décision durable. |

Ces composants étendent le contrat visuel ; les capacités de l’epic 2 restent non livrées. La densité conserve `{spacing.2}` entre éléments liés et `{spacing.4}` entre groupes ; les lignes grandissent avec le texte. Un état en attente garde son libellé et sa portée sans faux pourcentage. Échec et périmé gardent le contenu antérieur identifiable comme historique ; focus, sélection courante et acceptation humaine ont chacun leur libellé et leur traitement. Clair et sombre utilisent leurs tokens existants, avec les mêmes textes, contours de contrôle et ordre de lecture.

## Do's and Don'ts

| Faire | Éviter |
|---|---|
| Donner la priorité au projet, à l’échange et à l’action attendue. | Empiler préparation, états et grandes cartes avant le travail. |
| Garder arrêt inconnu, portée globale et inspection visibles. | Compacter en cachant un blocage critique dans des détails. |
| Réserver les icônes aux commandes familières avec nom et aide clavier. | Réduire une autorisation ou un refus à un pictogramme. |
| Décrire Mary et Forge selon leurs capacités réelles. | Présenter une phrase fixe comme une recommandation calculée. |
| Séparer aide chargée, réponse native et action qualifiée. | Rendre lançable une commande seulement copiable ou descriptive. |
| Nommer couverture, provenance, fraîcheur et sélection locale. | Faire d’un diagnostic partiel un refus global ou d’une sélection un changement BMad. |
| Conserver saisie, focus, provenance et mouvement réduit. | Présenter une simulation, un état historique ou un test technique comme une validation humaine. |
