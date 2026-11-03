---
name: Madness
description: "Parcours guidé pour comprendre et piloter BMad sur des projets locaux."
status: final
created: 2026-10-22
updated: 2026-11-03
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
  - atelier-agents-2026-11-02/handoff.json
  - qualification-atelier/sally-final-reconciliation.md
  - ../../../.impeccable/surfaces/src-renderer-src-app-tsx.md
  - ../../../src/renderer/src/styles.css
  - ../../../src/renderer/src/AgentInfoPanel.tsx
  - ../../../src/renderer/src/WindowCaptionPlates.tsx
  - ../../../src/renderer/src/atelier-controls.css
  - ../../../src/main/index.ts
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
  atelier-chrome: '#20343C'
  atelier-plate: '#294652'
  atelier-edge: '#BC8464'
  atelier-ink: '#111819'
  atelier-heading: '#F4DFC1'
light-colors:
  surface: '#F6F0E4'
  navigation: '#E8DDC8'
  panel: '#FFF9EF'
  text: '#24211E'
  muted: '#62554B'
  muted-lavender: '#68584C'
  line: '#C8B9A4'
  control-line: '#8C7864'
  hover: '#E7DCC9'
  active: '#DACEB8'
  accent: '#9B472C'
  accent-hover: '#80381F'
  accent-active: '#6D2E19'
  accent-text: '#FFF9F0'
  accent-soft: '#F0D8C7'
  link: '#1C5B76'
  focus: '#1C5B76'
  navigation-selected: '#CFDEE0'
  navigation-selected-text: '#234B59'
  recommendation: '#F0E6D5'
  recommendation-line: '#B49A7F'
  neutral: '#E8DECE'
  neutral-text: '#574B40'
  context-text: '#234B59'
  waiting: '#F2E3C3'
  waiting-text: '#71501B'
  success: '#E1EBDC'
  success-text: '#335C3E'
  error: '#F6DEDD'
  error-text: '#903C38'
  selection: '#C2D9DF'
  selection-text: '#24211E'
  notification: '#20343C'
  notification-text: '#FFF9F0'
  atelier-chrome: '#E8DDC8'
  atelier-plate: '#D5DFDB'
  atelier-edge: '#9B472C'
  atelier-ink: '#6C5948'
  atelier-heading: '#314D57'
typography:
  headline:
    fontFamily: '"Barlow Condensed", "Segoe UI", sans-serif'
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '0.005em'
  title:
    fontFamily: '"Barlow Condensed", "Segoe UI", sans-serif'
    fontSize: 23px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '0.005em'
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
    fontSize: 14px
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
  md: 4px
  message: 3px
  group: 3px
  lg: 3px
  dialog: 4px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  page-x: 38px
  page-top: 20px
  page-mobile: 16px
  content-max: 1160px
  home-max: 1160px
components:
  titlebar:
    height: 56px
    target: 40px
    icon: 19px
  navigation:
    width: 240px
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
    padding: '14px 16px'
    minTextHeight: 71px
    shadow: '0 4px 12px #0B090824'
    focusBorder: '{colors.focus}'
  agent:
    portraitSize: 40px
    panelWidth: 320px
    wideWidth: 350px
    dockBreakpoint: 1323px
    wideBreakpoint: 1600px
    modalWidth: 400px
    modalInset: 16px
    smallInset: 8px
    bustHeight: 234px
    compactBustHeight: 180px
    attentionMaxHeight: 'min(44dvh, 240px)'
    revealDuration: 180ms
  chrome:
    frameSlice: 128
    frameWidth: 16px
    frameOutset: 6px
    frameFill: false
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

Madness est un atelier illustré personnel sous Windows : projet identifiable, conversation centrale, action attendue et preuves consultables. Le [handoff approuvé](atelier-agents-2026-11-02/handoff.json) et sa [référence critique](atelier-agents-2026-11-02/atelier-reference-approuvee.png) fixent la direction cel shading originale : anthracite chaud, plaques pétrole, terracotta, ivoire, contours encrés et matière peinte mate à usure mesurée. Ils ne fixent pas une reproduction au pixel. Les cadres portent le caractère ; messages, formulaires et décisions gardent un fond calme.

Le candidat atelier 0.2.1 est décrit par la [réconciliation Sally](qualification-atelier/sally-final-reconciliation.md) et le contrat de surface Impeccable code-led. Le clair devient ivoire/terracotta/pétrole et remplace le blanc/violet historique. Barlow Condensed Bold locale porte titres courts et noms, Segoe UI la lecture et les décisions. Les sept bustes originaux sont utilisés en vignette et dans une fiche à la demande ; aucun portrait ne prouve identité, activité ou disponibilité.

Les repères historiques restent consultables : [préparation précédente](preparation-refonte-2026-10-28/preparation-refonte.md), [qualification de la refonte installée](qualification-refonte/parent-verification.md), [Codex Desktop](imports/reference-codex-desktop.png), [Parcours guidé simulé](mockups/parcours-guide/index.html) et [qualification du thème](../qualification-theme/README.md). Ils ne qualifient pas les pixels du nouveau candidat. DESIGN.md et EXPERIENCE.md font foi face aux maquettes ; parcours de 2.17 et limites de 2.2 conservés, sans clôture de gate, installation ou acceptation visuelle humaine globale déduite. Les changements sont tracés dans [.memlog.md](.memlog.md).

## Colors

| Rôle | Tokens et usage |
|---|---|
| Surfaces | `{colors.surface}` au centre, `{colors.navigation}` à gauche, `{colors.panel}` pour les panneaux. `{colors.line}` sépare les régions sans les enfermer toutes dans des cartes. |
| Lecture | `{colors.text}` pour le principal ; `{colors.muted}` et `{colors.muted-lavender}` pour les explications et métadonnées. Une information nécessaire reste lisible. |
| Action et repérage | `{colors.accent}`, `{colors.accent-hover}`, `{colors.accent-active}` avec `{colors.accent-text}` pour l’action pertinente ; `{colors.link}` et `{colors.focus}` pour liens et focus ; `{colors.accent-soft}` pour un contexte léger. |
| Sélection | `{colors.navigation-selected}` avec `{colors.navigation-selected-text}` ; `{colors.hover}` et `{colors.active}` rendent survol et pression visibles. |
| Chrome atelier | {colors.atelier-chrome}, {colors.atelier-plate}, {colors.atelier-edge} et {colors.atelier-ink} pour plaques et arêtes ; {colors.atelier-heading} pour la marque. Les rasters de cadre restent décoratifs. |
| Recommandation | `{colors.recommendation}` et `{colors.recommendation-line}` distinguent la suggestion de son environnement. |
| États | Neutre `{colors.neutral}` / `{colors.neutral-text}` ; contexte `{colors.accent-soft}` / `{colors.context-text}` ; attente `{colors.waiting}` / `{colors.waiting-text}` ; succès borné `{colors.success}` / `{colors.success-text}` ; erreur `{colors.error}` / `{colors.error-text}`. Toujours un libellé et une portée. |

Le vert exprime un résultat vérifié précis, jamais une validation humaine implicite. L’ambre signale une intervention ; un brouillon n’est pas une erreur. L’ouverture d’un projet déjà ouvert et les préparations secondaires restent discrètes.

Cibles à vérifier dans l’application : texte ≥ 4,5:1, grand texte ≥ 3:1 ; indicateurs nécessaires, contours de contrôle et focus ≥ 3:1 avec les couleurs adjacentes. Les filets pâles seuls n’identifient pas un contrôle. La qualification historique du thème a calculé 32 couples par palette : minima de texte 6,05:1 sombre / 4,84:1 clair, focus et contours 3,50:1 / 3,35:1. Ces valeurs ne constituent ni mesure de la refonte ni audit WCAG complet.

## Typography

Barlow Condensed Bold locale, avec repli Segoe UI, porte titres, noms et onglets. Segoe UI reste la police des messages, menus, formulaires et décisions ; Consolas ou Cascadia Code distingue invocations et chemins. La conversation utilise {typography.conversation}, soit 14 px et interligne 1,75, texte jusqu’à 72ch dans un article jusqu’à 75ch. Aucun texte de travail n’est peint dans les images.

Les variantes de titre sont 32 px en général, 28 px dans le bandeau projet, 24 px dans Conversation et 26 px pour un bandeau étroit ; demandes à 22 px, connexion à 25 px et nom de fiche à 36 px. Les capitales sont réservées aux courts repères.

Les textes fonctionnels restent au moins à `{typography.label.fontSize}`. Réduire cadres, répétitions et espacements avant de réduire la taille du texte. Le projet et l’onglet actif dominent les métadonnées techniques ; les statuts importants restent explicites.

Objectif et indisponibilité se lisent en texte courant ; invocation, chemin et identifiant utilisent `{typography.code}` sans traduction. Noms longs et anglais peuvent occuper plusieurs lignes. Seul un aperçu de chemin peut être abrégé : sa version intégrale est sélectionnable dans Détails de contexte ou Panneau de fichiers. Ne jamais abréger l’invocation à copier, la portée d’un accord, le motif d’un refus ou les deux initiatives en conflit. Révision abrégée avec libellé reste ouvrable vers la preuve intégrale ; date d’observation et fraîcheur ne sont pas confondues.

## Layout & Spacing

Les bandeaux illustrés servent l’accueil et Parcours. Conversation retire l’image du bandeau projet pour préserver demande et saisie ; l’image est aussi retirée sous 720 px et à faible hauteur. Le décor latéral disparaît dans le rail compact et à faible hauteur.

La barre d’action et de titre commune occupe `{components.titlebar.height}` sur toute la largeur ; les contrôles Windows natifs disposent de leur espace Window Controls Overlay. Navigation latérale et centre commencent dessous. Le centre utilise `{spacing.content-max}`, l’accueil `{spacing.home-max}`, avec `{spacing.page-x}` latéral et `{spacing.page-top}` supérieur à la largeur de référence. L’échelle 4 / 8 / 12 / 16 / 20 / 24 px distingue relations proches et sections.

Ordre de lecture du projet : en-tête projet et initiative connue → onglets → courte bande de récupération si nécessaire → contenu de l’onglet. Dans Conversation, l’échange sélectionné ou son état vide, la demande pertinente et le point de réponse sont identifiables dès le premier écran de référence. Une conversation longue reste défilante ; toutes ses lignes n’ont pas à tenir à l’écran. Préparer un nouvel échange est secondaire et ne précède pas systématiquement l’historique. Les détails techniques se déplient sur demande ; arrêt inconnu, blocage global et besoin d’inspection restent lisibles lorsqu’ils s’appliquent.

Le Sélecteur d’initiative suit le projet dans l’en-tête ; « Sélection Madness » et « Active dans BMad » restent deux lignes nommées si elles diffèrent. Dans Parcours, attentes et récupérations précèdent Reprise du projet, son Registre des preuves puis le guidage secondaire ; la reprise reste avant les aides et la préparation Mary/Forge. « Que faire ensuite ? » ouvre ce guidage dans Parcours ; « Toutes les possibilités » ouvre le Catalogue des compétences dans un onglet du même projet. Aides chargées et Recommandation ont des titres séparés ; seule la réponse reçue de l’agent entre dans Conversation. L’aide ne reçoit pas le traitement d’un message assistant.

Pour la Reprise du projet de 2.4, le [DESIGN racine](../../../DESIGN.md) reste l’autorité visuelle courante : atelier/jeu adopté, palettes pétrole/terracotta/ivoire, Oxanium pour le texte courant, Barlow pour les titres courts et casting approuvé conservés. Cette extension ne répare pas les anciennes valeurs du présent spine. La région réemploie les fonds de lecture calmes et des groupes textuels extensibles : État connu, Résultats et décisions connus, Récapitulatifs disponibles, Travail restant connu. Projet, initiative consultée, date d’observation et révision encadrent leur lecture ; aucun pourcentage d’avancement ni nouvel onglet. Les preuves de 2.4 se consultent dans des détails textuels nommés ; le Panneau de fichiers et son aperçu restent futurs en 2.8.

Le catalogue utilise des lignes plates : nom et objectif, module et invocation, puis disponibilité textuelle. Recherche et filtres précèdent les résultats ; détail dans Fiche compétence. Ni grille de grandes cartes ni nouveau panneau permanent. Le Registre des preuves rassemble libellé, nature du constat, statut sourcé, fraîcheur et accès au fichier ; les détails complets sont dépliables. Le Panneau de fichiers occupe la colonne prévue, jamais la place du champ de réponse. Son agrandissement emploie un Dialogue de lecture borné à la fenêtre ; fermer retrouve la même sélection et position de travail.

La commande unique « Ouvrir un projet » est un dossier SVG de `{components.titlebar.icon}` dans une cible de `{components.titlebar.target}`, au même niveau que thème et connexion. La bascule reste sur la ligne des contrôles Windows, centrée sur `{components.navigation.iconAxisX}` depuis le bord gauche comme les icônes du rail. Le titre conserve la zone de déplacement ; groupes de commandes, commandes et surfaces modales restent hors drag. Le rail compact réutilise désormais le logo M existant comme signature basse ; le raffinement 0.2.4 est installé (commit fd78875), sans nouvelle fonction.

| Largeur de fenêtre | Composition de référence |
|---|---|
| ≥ 1 600 px | Navigation 240 px ; fiche agent {components.agent.wideWidth} si ouverte ; retraits 52 px, ou 24 px avec fiche dockée. |
| 1 323–1 599 px | Navigation {components.navigation.width} ; fiche agent {components.agent.panelWidth} dockée si ouverte ; retraits 24 px avec fiche. |
| 1 281–1 322 px | Navigation 240 px ; fiche agent modale sur demande, largeur au plus {components.agent.modalWidth}. |
| 1 081–1 280 px | Navigation 194 px ; fiche agent modale ; retraits centraux 26 px. |
| 721–1 080 px | Navigation 184 px ; fiche agent modale bornée à la fenêtre. |
| ≤ 720 px | Navigation en tiroir avec libellés ; contenu à {spacing.page-mobile} ; fiche modale à {components.agent.smallInset} des bords. |

La fiche agent se docke à {components.agent.dockBreakpoint}, indépendamment du futur Panneau de fichiers : celui-ci conserve {components.files.overlayBreakpoint}, largeurs 318/278/350 px et superposition prévue. La fiche ne livre pas ces capacités de fichiers.

Au-dessus de `{components.navigation.drawerBreakpoint}`, le rail replié mesure `{components.navigation.compactWidth}` et conserve les repères distincts des projets et des attentes. Cibles `{components.navigation.compactTarget}`, infobulles au survol et au focus hors rognage. La [référence repliée](imports/reference-navigation-repliee.png), les captures [rail](mockups/navigation-repliee.png), [déployée](mockups/navigation-deployee.png) et [tiroir](mockups/navigation-mobile.png) montrent la base historique ; elles ne prouvent pas les nouvelles positions. La [feuille de style historique](mockups/parcours-guide/styles.css) décrit la simulation, sans spécifier la nouvelle hiérarchie.

## Elevation & Depth

Les plaques peintes et arêtes encrées donnent leur profondeur au chrome. Le cadre raster local de fiche est appliqué en neuf tranches : slice {components.chrome.frameSlice}, largeur {components.chrome.frameWidth}, débord {components.chrome.frameOutset}, sans remplissage central. Décor non interactif sous le contenu/focus, il ne couvre ni texte, ni champ, ni décision. Rail et tiroir conservent leur bande pétrole installée en 0.2.4, sans cadre raster. Ombres réservées à la saisie, aux Dialogues et aux panneaux superposés.

Les transitions brèves durent 180 ms : révélation, retour d’état ou dossier au survol/focus, sans boucle ni animation de chargement décorative. L’animation du dossier accompagne la même action au clavier et au pointeur. En mode de mouvement réduit, le dossier reste statique ; les transitions et défilements animés sont supprimés.

## Shapes

{rounded.sm} demeure le rayon de badge ; boutons à {rounded.md}, messages et décisions à {rounded.message}/{rounded.group}, saisie à {rounded.lg}, Dialogues à {rounded.dialog}. La fiche dockée garde des angles droits. Filets internes sobres, séparations structurantes de 2 ou 3 px. Les coupes des onglets appartiennent au pseudo-élément décoratif, pas à la cible ni au focus. Focus {components.button.focusWidth}, décalage {components.button.focusOffset}.

SVG en trait, base 19 px et trait 1,65, extrémités arrondies ; cible indépendante du dessin. Les repères réels des projets restent distincts. Le signe de branche du prototype ne devient pas un logo adopté.

## Components

Les mêmes noms désignent les règles de comportement dans EXPERIENCE.md. Les capacités futures y sont identifiées ; leur présence dans ces tables ne les rend pas exécutables.

| Composant | Spécification visuelle |
|---|---|
| Barre d’action et de titre commune | Bande et commandes selon Layout & Spacing ; dossier, soleil/lune et connexion de même poids visuel, cibles de 40 px, aide visible au focus/survol et nom accessible. |
| Navigation latérale | Plaque et cadre peints, tokens components.navigation ; sélection {colors.navigation-selected}, repère terracotta et graisse 600. Rail et tiroir conservent noms accessibles et cibles ; le décor ne remplace aucun libellé. |
| Bouton | Principal accent, secondaire avec `{colors.control-line}`, discret sans fond ; `{rounded.md}`, `{components.button.padding}`. États survol, pression, focus, attente et indisponibilité explicites. Cible d’au moins 40 px, y compris question, approbation et récupération. |
| Ligne de projet ou d’attente | Liste plate : projet, initiative de la demande, nature et état ; repère identifiable. Le compteur complète la raison textuelle. Lien de destination explicite ; aucune commande sensible sur toute la ligne. |
| Onglets du projet | Parcours, Conversation puis catalogue futur ; dossiers à coins coupés, Barlow Condensed et fond {colors.atelier-plate}. Sélection {colors.accent}/{colors.accent-text}, sans rogner le focus. Noms longs repliables. |
| Sélecteur d’initiative | Commande compacte à libellé, nom et chevron ; liste dans un Dialogue. Sélection locale marquée « Sélection Madness », actif BMad nommé séparément. Conflit textuel avec les deux noms, pas deux badges de couleur indifférenciés. |
| Reprise du projet | Région dans Parcours, après les attentes/récupérations et avant les aides et préparations ; quatre groupes textuels sobres, lignes extensibles et détails de preuve à la demande. Observation datée, source et révision restent repérables ; contradictoire, partiel, ancien et inconnu sont des libellés, sans coche de validation ni jauge. Héritage visuel du DESIGN racine ; aucune nouvelle illustration. |
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
| Conversation | Lecture Segoe UI 14 px ; auteur Barlow Condensed, portrait compact quand attesté et source textuelle conservée. Messages humains sur {colors.navigation-selected}, filet et angles 3 px ; historique inactif explicite. |
| Portrait d’agent | Vignette {components.agent.portraitSize}, réservée avant chargement, issue du buste local. Nom/source textuels et image sans alternative redondante. Repli neutre si identité inconnue, nom hors casting ou image absente. |
| Fiche agent | À la demande : {components.agent.panelWidth}, {components.agent.wideWidth} au grand format, modal sous {components.agent.dockBreakpoint}. Titre/fermeture, buste complet contenu dans {components.agent.bustHeight}, cartouche terracotta et rôle lisible ; corps défilant. |
| Signalements de la fiche | Zone visible avant le corps du rôle, bornée à {components.agent.attentionMaxHeight} ; liste et annonce défilables séparément. Attentes/récupérations et historique inactif nommés avec accès exact. |
| Question de l’agent | Question et choix textuels, saisie et état corrélé réunis ; ancien contenu visuellement distinct d’une demande active. |
| Champ de réponse | Libellé destinataire, zone redimensionnable Segoe UI 14 px, minimum {components.composer.minTextHeight}, fond {colors.panel}, bord 2 px et angles {rounded.lg}. Enregistrer et Envoyer restent distincts ; focus {components.composer.focusBorder}. |
| Proposition d’approbation | Groupe `{rounded.group}`, opération, portée et patch complet avant les choix textuels. Ne pas remplacer autoriser/refuser par coche/croix. |
| Récapitulatif de tour | Bloc sobre : fin de tour, faits connus, décisions, chemins et action attendue ; valeurs inconnues explicites. |
| Connexion Codex | Signe officiel ChatGPT 21 px, grisé à froid, dans cible 40 px ; panneau non modal à droite, maximum 420 px borné à la fenêtre. Titre, état daté, portée, récupération et actions textuelles ; aide réseau sous l’erreur. |
| Panneau de fichiers | Fond `{components.files.background}`, en-tête fichier/contexte, statut sourcé et fraîcheur avant contenu ; chemin intégral sélectionnable et actions Agrandir/Ouvrir dans l’éditeur/Copier le chemin. Agrandissement dans Dialogue ; mêmes métadonnées en lecture. Erreur conserve l’en-tête et les commandes encore permises. |
| Diagnostic et initialisation | Colonne bornée à 680 px : état agrégé puis capacités indépendantes, couverture et refus sourcés. Partiel/inconnu/périmé visibles en texte. L’initialisation demeure future en epic 3 ; aucune commande de réparation ajoutée à ce diagnostic. |
| Dialogue | Maximum `{components.dialog.maxWidth}` borné à la fenêtre ; fond du thème, `{components.dialog.radius}`, `{components.dialog.shadow}`, contenu défilant et pied d’actions. |
| Notification | Feedback bref selon components.notification, sans recouvrir une décision durable. Les Signalements de la fiche forment une zone visible persistante distincte, pas une notification temporaire. |

Complément actif du 3 novembre 2026, candidat logiciel 0.2.5 : trois plaques décoratives aria-hidden et sans pointeur habillent Réduire, Agrandir/Restaurer et Fermer sous les glyphes et zones d’action Windows natifs. La position suit les variables env de Window Controls Overlay et ses changements de géométrie, sans largeur de commande fixée à 46 px ; hors overlay visible, le composant ne rend rien. Le fond natif de caption est transparent hors contraste élevé ; le contraste élevé garde son fond natif et le calque se retire en forced-colors. Aucun bouton HTML de substitution, nouveau pouvoir IPC ni changement de routine de fermeture.

Les cases et radios restent de vrais inputs, habillés à 20 px avec bord fin de 1 px, états coché/mixte/désactivé et focus clavier distincts. Le libellé et la décision corrélée restent la source du sens ; la coche ne remplace pas une autorisation ou un refus. En forced-colors, appearance:auto et retrait des marques décoratives préservent le contrôle natif. Les valeurs visuelles détaillées courantes sont relevées dans le [DESIGN racine](../../../DESIGN.md) ; ce complément conserve les contrats métier, les inconnues et les états des stories.

Portrait, fiche et signalements décrivent le candidat atelier ; catalogue, initiatives, preuves et fichiers conservent leur statut contractuel dans EXPERIENCE. Densité {spacing.2} entre éléments liés et {spacing.4} entre groupes ; lignes extensibles. Attente, erreur, périmé, sélection et acceptation gardent libellés et portée. Clair et sombre partagent les comportements et utilisent leurs tokens propres ; aucun rendu ou succès technique ne vaut acceptation humaine.

## Do's and Don'ts

| Faire | Éviter |
|---|---|
| Donner la priorité au projet, à l’échange et à l’action attendue. | Empiler préparation, états et grandes cartes avant le travail. |
| Garder arrêt inconnu, portée globale et inspection visibles. | Compacter en cachant un blocage critique dans des détails. |
| Réserver les icônes aux commandes familières avec nom et aide clavier. | Réduire une autorisation ou un refus à un pictogramme. |
| Décrire Mary et Forge selon leurs capacités réelles. | Présenter une phrase fixe comme une recommandation calculée. |
| Séparer aide chargée, réponse native et action qualifiée. | Rendre lançable une commande seulement copiable ou descriptive. |
| Nommer couverture, provenance, fraîcheur et sélection locale. | Faire d’un diagnostic partiel un refus global ou d’une sélection un changement BMad. |
| Illustrer une identité attestée ; conserver nom exact hors casting ou repli inconnu. | Déduire une activation, une compétence ou une activité d’un visage. |
| Conserver saisie, focus, provenance et mouvement réduit. | Présenter une simulation, un état historique ou un test technique comme une validation humaine. |
