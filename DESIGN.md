---
name: "Madness — atelier des agents BMad"
description: "Atelier personnel illustré : conversation lisible, commandes explicites et identité sourcée."
colors:
  surface: "#211f1e"
  navigation: "#191817"
  panel: "#272423"
  text: "#f1ebe6"
  muted: "#bcb0a8"
  muted-lavender: "#b5aaa2"
  line: "#3a3430"
  control-line: "#82766e"
  hover: "#332e2a"
  active: "#423830"
  accent: "#e49b7a"
  accent-hover: "#eeae8f"
  accent-active: "#cf896a"
  accent-text: "#231a15"
  accent-soft: "#392b25"
  selected: "#293842"
  selected-text: "#b7d8ee"
  recommendation: "#272321"
  recommendation-line: "#5b4538"
  neutral: "#342f2b"
  neutral-text: "#d0c4bb"
  error: "#42262a"
  error-text: "#f0aeb5"
  success: "#24392e"
  success-text: "#a5d6b1"
  waiting: "#40331f"
  waiting-text: "#eac78d"
  link: "#9dc7e1"
  focus: "#9dc7e1"
  selection: "#36576c"
  selection-text: "#f1ebe6"
  tooltip: "#efe7e0"
  tooltip-text: "#211f1e"
  backdrop: "#0b0908ad"
  atelier-chrome: "#20343c"
  atelier-plate: "#294652"
  atelier-edge: "#bc8464"
  atelier-ink: "#111819"
  atelier-heading: "#f4dfc1"
  light-surface: "#f6f0e4"
  light-navigation: "#e8ddc8"
  light-panel: "#fff9ef"
  light-text: "#24211e"
  light-muted: "#62554b"
  light-muted-lavender: "#68584c"
  light-line: "#c8b9a4"
  light-control-line: "#8c7864"
  light-hover: "#e7dcc9"
  light-active: "#daceb8"
  light-accent: "#9b472c"
  light-accent-hover: "#80381f"
  light-accent-active: "#6d2e19"
  light-accent-soft: "#f0d8c7"
  light-selected: "#cfdee0"
  light-selected-text: "#234b59"
  light-recommendation: "#f0e6d5"
  light-recommendation-line: "#b49a7f"
  light-neutral: "#e8dece"
  light-neutral-text: "#574b40"
  light-error: "#f6dedd"
  light-error-text: "#903c38"
  light-success: "#e1ebdc"
  light-success-text: "#335c3e"
  light-waiting: "#f2e3c3"
  light-waiting-text: "#71501b"
  light-accent-text: "#fff9f0"
  light-link: "#1c5b76"
  light-focus: "#1c5b76"
  light-selection: "#c2d9df"
  light-selection-text: "#24211e"
  light-tooltip: "#20343c"
  light-tooltip-text: "#fff9f0"
  light-backdrop: "#18161280"
  light-atelier-chrome: "#e8ddc8"
  light-atelier-plate: "#d5dfdb"
  light-atelier-edge: "#9b472c"
  light-atelier-ink: "#6c5948"
  light-atelier-heading: "#314d57"
typography:
  display:
    fontFamily: "Barlow Condensed, Segoe UI, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    letterSpacing: "0.025em"
  headline:
    fontFamily: "Barlow Condensed, Segoe UI, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.005em"
  title:
    fontFamily: "Barlow Condensed, Segoe UI, sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.005em"
  agent-name:
    fontFamily: "Barlow Condensed, Segoe UI, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.005em"
  message-author:
    fontFamily: "Barlow Condensed, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 700
  command:
    fontFamily: "Barlow Condensed, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.015em"
  body:
    fontFamily: "Oxanium, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 450
    lineHeight: 1.6
  message:
    fontFamily: "Oxanium, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 450
    lineHeight: 1.65
  label:
    fontFamily: "Oxanium, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 450
    lineHeight: 1.55
  code:
    fontFamily: "Consolas, Cascadia Code, monospace"
    fontSize: "14px"
    lineHeight: 1.65
rounded:
  square: "0px"
  detail: "2px"
  surface: "3px"
  control: "4px"
  badge: "5px"
  tooltip: "7px"
spacing:
  tight: "4px"
  compact: "6px"
  control: "8px"
  related: "10px"
  group: "12px"
  field: "14px"
  section: "16px"
  reading: "20px"
  panel: "24px"
  large: "28px"
  page-end: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-text}"
    typography: "{typography.command}"
    rounded: "{rounded.detail}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-text}"
  button-primary-active:
    backgroundColor: "{colors.accent-active}"
    textColor: "{colors.accent-text}"
  button-secondary:
    backgroundColor: "{colors.atelier-plate}"
    textColor: "{colors.text}"
    typography: "{typography.command}"
    rounded: "{rounded.detail}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  button-text:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.link}"
    typography: "{typography.command}"
    rounded: "{rounded.detail}"
    padding: "9px 14px"
  navigation-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.surface}"
    padding: "8px 10px"
  project-tab-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-text}"
    padding: "8px 22px"
  badge:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.badge}"
    padding: "3px 6px"
  recommendation:
    backgroundColor: "{colors.recommendation}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "24px"
  composer:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "18px 20px"
  agent-portrait:
    backgroundColor: "{colors.atelier-plate}"
    textColor: "{colors.muted}"
    rounded: "{rounded.surface}"
    size: "40px"
  agent-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    width: "320px"
  agent-nameplate:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-text}"
    typography: "{typography.agent-name}"
    padding: "5px 24px 7px 14px"
  help-preparation:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.detail}"
    padding: "22px"
---

# Design System: Madness

## Overview

**Creative North Star: "Atelier de travail illustré des agents BMad"**

Un atelier personnel, chaleureux et expressif encadre le travail BMad : plaques bleu pétrole, commandes terracotta, contours encrés, angles coupés et matière peinte mate à usure retenue. Les sept visages originaux, édités en casting v2 à encrage franc, ombres en aplats, expressions théâtrales et accessoires de rôle décalés, donnent un repère aux messages dont l’identité native est attestée. La conversation, ses décisions et ses preuves occupent le centre ; l’illustration reste discrète pendant la lecture.

L’anthracite chaud est le thème par défaut ; l’ivoire est son alternative claire. Les titres condensés portent le caractère du lieu, tandis qu’Oxanium porte les messages et les explications ; Barlow Condensed Bold porte aussi les commandes explicites. Le décor se prolonge du chrome au centre de travail : cartouches d’auteur attesté, cadres de message et bordure raster de saisie. Les fonds de conversation et de saisie demeurent calmes. La navigation reste une bande pétrole dans les deux thèmes de lecture. Ce système transpose la direction humaine approuvée le 2 novembre 2026 ; il décrit le candidat implémenté, sans valoir acceptation humaine du candidat 0.2.5. La validation humaine du candidat 0.2.3 reste acquise.

**Key Characteristics:**

- Conversation dominante et lecture longue sur fonds calmes.
- Chrome peint/encré, onglets de dossier coupés et cartouches terracotta.
- Titres et commandes Barlow Condensed Bold locaux ; texte courant Oxanium.
- Portrait expressif compact et fiche informative ouverte à la demande.
- État, provenance et décisions exprimés par du texte réel.

Le frontmatter porte les primitives de palette et les rôles typographiques et formes effectivement utilisés dans la cascade du candidat 0.2.5 (version du runtime, distincte des stories). Les clés sans préfixe décrivent le sombre ; `light-*` fournit les remplacements de `data-theme="light"`. Dans `main.tsx`, `styles.css` est suivi de `atelier-immersion.css`, puis de `atelier-controls.css`. La dernière couche affine les commandes, la lisibilité et l’espace utile avec les primitives de palette et les familles de titres existantes ; le candidat 0.2.3 ajoute Oxanium locale pour le texte courant, les tailles de texte et les valeurs de composants sont réconciliées ci-dessous. Les composants du frontmatter illustrent le sombre ; le renderer et les extraits du sidecar se lient aux propriétés CSS du thème actif. Les nuances de rampe du sidecar sont des aides de palette synthétisées, pas de nouvelles couleurs du produit. Les contrats comportementaux restent dans [ux-madness/DESIGN.md](./_bmad-output/initiative-madness/ux-madness/DESIGN.md) et [EXPERIENCE.md](./_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md).

## Colors

Terracotta d’action et bleu de repérage accompagnent des neutres chauds ; le chrome reçoit le pétrole sans colorer tout le texte de travail.

### Primary

- **Terracotta d’action** (`accent`, `accent-hover`, `accent-active`, `accent-text`, `accent-soft`) : décisions principales, sélection d’onglet et cartouche du nom. Les états survol et pression ont chacun leur couleur.

### Secondary

- **Bleu de repérage** (`link`, `focus`, `selected`, `selected-text`, `selection`, `selection-text`) : liens, contour clavier, contexte sélectionné et sélection de texte. Le focus ne prend pas le sens d’une approbation.
- **Plaques pétrole et arêtes cuivre** (`atelier-chrome`, `atelier-plate`, `atelier-edge`, `atelier-ink`, `atelier-heading`) : barre de fenêtre, cadres, onglets, contours encrés et marque d’atelier. Le clair emploie des plaques pâles et une encre brune dans le travail ; le rail et le tiroir gardent leur propre surface pétrole, texte ivoire, sélection terracotta et focus bleu clair. Les alias `rail-*` reprennent les primitives existantes sans nouvelle palette.

### Neutral

- **Anthracite de lecture / ivoire de lecture** (`surface`, `navigation`, `panel`, `text`) : page, surfaces et texte courant selon le thème ; le rail et le tiroir utilisent la palette pétrole fixe décrite ci-dessus.
- **Texte secondaire chaud** (`muted`, `muted-lavender`) : provenance, chemins, explications et légendes. Le nom historique `muted-lavender` ne désigne plus une direction violette.
- **Traits et interaction** (`line`, `control-line`, `hover`, `active`) : séparations discrètes, contours utiles et retour d’interaction.
- **Conteneurs et info-bulles** (`recommendation`, `recommendation-line`, `neutral`, `neutral-text`, `tooltip`, `tooltip-text`, `backdrop`) : recommandation, badge factuel, aide ponctuelle et voile de dialogue.
- **États sémantiques** (`waiting`, `waiting-text`, `error`, `error-text`, `success`, `success-text`) : attente ambrée, erreur rose/brique et succès vert. Chaque paire garde un libellé et une portée explicites ; la couleur ne crée aucun état métier.

**The Quiet Reading Rule.** La matière reste sur les contours et les zones de contexte ; les messages et les champs de décision gardent un fond calme.

**The Explicit State Rule.** Une couleur ou un portrait ne remplace jamais le texte d’une attente, d’un refus, d’une erreur ou d’une identité inconnue.

## Typography

**Display Font:** Barlow Condensed Bold, police locale sous SIL OFL 1.1 ; repli Segoe UI, sans-serif.

**Body Font:** Oxanium variable locale (graisses 200–800), rôle courant à 450, puis Segoe UI et sans-serif en repli.

**Label/Mono Font:** Oxanium à 14 px pour les métadonnées et info-bulles ; Consolas puis Cascadia Code pour les chemins, sources et identifiants.

**Character:** une voix condensée et franche pour repérer, une voix régulière pour lire et décider. Les polices locales sont chargées avec `font-display: swap` ; aucun fournisseur de police distant n’est requis. Oxanium est distribuée sous SIL OFL 1.1, avec [provenance](./resources/fonts/provenance.json) et [licence](./resources/fonts/Oxanium-OFL.txt).

### Hierarchy

- **Display** : marque d’atelier ; nom d’agent court en cartouche, variante `agent-name`.
- **Headline** : titre général à 36 px ; titres de contexte adaptés par surface. Dans Conversation, le bandeau garde 24 px en dialogue ordinaire et passe à 25 px sous 721 px. Les titres de section généraux sont à 28 px ; l’aide prend 30 px.
- **Title** : sous-titres généraux à 22 px, demandes natives autour de 22 px, en-tête de fiche et connexion à 25 px, sous-titres d’aide à 23 px.
- **Command** : Barlow Condensed Bold à 19 px, interligne 1,2 ; la consultation de fiche depuis un message utilise 17 px. Les onglets sont à 21 px, y compris dans Conversation, avec variante à 20 px sous 721 px et hauteur minimale de 44 px.
- **Body** : paragraphes à 16 px, interligne 1,6 ; messages et saisie à 16 px. Le message assistant conserve l’interligne 1,8 de son panneau spécifique. Paragraphes bornés à 70 ch et messages à 72 ch dans un article de 75 ch maximum.
- **Label** : métadonnées, état, source, légendes, aide et info-bulles à 14 px ; la portée de connexion et l’aide réseau conservent cette taille. Les badges factuels hérités gardent leur taille compacte distincte.
- **Message author** : nom court à 19 px, variante utilisateur à 17 px. Les définitions de rôle de la fiche emploient 19 px et leurs descriptions 16 px.

**The Two Voices Rule.** Barlow Condensed Bold repère les titres courts, les noms et les commandes ; Oxanium porte les textes longs, les explications et les métadonnées ; Segoe UI reste un repli.

## Layout

La fenêtre est une colonne de hauteur `100dvh` avec barre native d’au moins 56 px, puis un corps en flex : navigation, travail central et fiche éventuelle. La commande d’ouverture est une seule cible carrée de 40 px ; le rail replié garde 58 px et l’axe de la bascule à 28 px. Le panneau de contexte et la connexion sont consultables à la demande.

La navigation déployée mesure 240 px au format courant ; elle passe à 194 px sous 1281 px et 184 px sous 1081 px. Dès 721 px, elle peut se replier en rail. Sous 721 px, le tiroir natif remplace la barre latérale ; sa largeur est bornée à 240 px et à celle de la fenêtre. Les groupes suivent surtout le rythme 8 / 12 / 16 / 20 / 24 px du frontmatter, sans imposer une grille nouvelle à toutes les anciennes surfaces.

Le contenu central occupe 100 % de la largeur disponible, sans largeur maximale. Son espacement horizontal est de 28 px au format courant, 22 px sous 1081 px et 16 px sous 721 px ; avec fiche dockée ouverte, le sélecteur de contexte conserve 24 px. Le bandeau illustré reste sur l’accueil et les vues de préparation ; il se réduit ou perd son image aux petits formats et aux fenêtres de moins de 701 px de haut. Dans Conversation, le bandeau projet est une plaque calme sans image. Le dialogue ordinaire, sans formulaire de question ou d’approbation actif, occupe la hauteur restante par flex : le titre, les onglets, les états et le compositeur gardent leur hauteur, tandis que les messages prennent la place disponible avec un minimum de 160 px. Le champ de rédaction garde au moins 64 px ; champ et action restent ensemble dans la fenêtre aux formats vérifiés. L’en-tête d’auteur est sticky au sommet du défilement, borné par son propre article ; la source exacte reste lisible après le texte.

Les récapitulatifs repliables directement rattachés au panneau de conversation conservent leur hauteur naturelle (`flex: none`) : leurs libellés ne se compriment pas sur le statut. Le panneau garde une base flex de 480 px mais un minimum de hauteur fondé sur le contenu (`min-content`) ; l’historique a une base et une hauteur de 240 px, avec un minimum fondé sur le contenu (`min-content`) et une croissance flexible. Cette règle de répartition locale conserve le texte du récapitulatif, l’état et la saisie sans chevauchement ; elle ne change pas le comportement de dépliage.

Lorsqu’une question ou une approbation est active, la page conserve son flux naturel afin de laisser toute sa hauteur au formulaire ou au patch. Le défilement des messages est alors borné à `clamp(240px, 44dvh, 640px)`, avec adaptations à 42dvh sous 721 px et 40dvh sous 701 px de haut. La position de lecture et le suivi existants sont conservés.

**The Working Center Rule.** Le décor encadre les noms, les messages et la saisie ; le texte réel, la source et les commandes explicites restent accessibles, y compris après défilement.

Dans l’aide chargée avec préparation, une grille partage la largeur entre préparation à gauche et diagnostic/provenance à droite : colonnes `minmax(0, 1.6fr)` et `minmax(280px, 1fr)`, écart horizontal de 24 px. Sous 1081 px, elle devient une seule colonne. Les raisons, les sources et les gardes natives restent présentes ; ce regroupement ne change ni disponibilité ni lancement.

La barre de fenêtre réserve le déplacement au libellé de titre. Les parents de commandes, les groupes, les boutons, leurs descendants et pseudo-éléments sont en `app-region: no-drag`. Les commandes à icône restent des cibles de 40 px sur l’axe établi ; aucun rectangle de déplacement ne doit les recouvrir.

La fiche est une vraie colonne dockée **dès 1323 px**, de largeur 320 px, puis 350 px dès 1600 px. En dessous de 1323 px, elle est un dialogue modal de largeur `min(400px, calc(100vw - 32px))` avec marges de 16 px ; sous 721 px, marges de 8 px. Le corps de fiche défile indépendamment. Le changement de seuil conserve sa sélection et sa position de lecture. La fermeture rend l’espace au dialogue ; une confirmation native ou le tiroir de navigation gardent leur priorité dans la pile modale.

## Elevation & Depth

La matière associe aplats calmes, contours encrés, arêtes terracotta et cadre peint natif. Les ombres sont diffuses : elles distinguent la saisie, les panneaux flottants, les dialogues et les info-bulles, sans produire de lèvre dure sous les commandes. Le bandeau illustré comporte un voile de contraste et un léger texte ombré ; cette aide de lecture n’est pas un style de texte en dégradé à généraliser.

### Shadow Vocabulary

- **Composer** : `0 6px 18px var(--composer-shadow)` ; attache diffuse du champ de rédaction.
- **Assistant message** : `0 4px 12px var(--composer-shadow)` ; légère distinction du panneau de lecture.
- **Floating panel** : `0 12px 42px var(--panel-shadow)` ; connexion, contexte et confirmation.
- **Agent modal** : `-12px 8px 40px var(--panel-shadow)` ; fiche superposée.
- **Drawer** : `15px 0 45px var(--panel-shadow)` ; navigation modale.
- **Rail tooltip** : `0 4px 14px var(--tooltip-shadow)` ; aide hors du rail.

Les encres d’ombre et les valeurs complètes clair/sombre sont portées par `extensions.shadows` du sidecar ; elles ne sont pas ajoutées comme groupe frontmatter.

**The Empty Center Rule.** Le cadre raster est découpé en neuf zones sans fill : son centre ne se peint jamais derrière un texte ou un formulaire.

Le cadre `chrome-plate-frame.png` reste un overlay décoratif sur la fiche : `border-image-slice: 128`, largeur de bande de 16 px, débord de 6 px et répétition étirée. Le rail et le tiroir ne rendent plus ce cadre raster ; une séparation de 1 px porte leur bord. Le mot-clé `fill` reste absent des usages conservés. L’asset source garde 35 pixels centraux à alpha 1/255 ; le centre omis n’est jamais rendu. Cette limite de production reste dans sa provenance, sans prétendre que l’ouverture source est exactement vide. La saisie réutilise ce même raster avec une bande de 12 px et un débord de 7 px ; la marge latérale de 7 px contient son cadre dans le centre de travail. Les contrôles et les zones de lecture sont au-dessus du cadre et conservent leurs événements et leur focus.

## Shapes

Le langage est celui de plaques mates à angles nets : petits arrondis utilitaires, traits encrés et coupes géométriques visibles. Les commandes en plaque prennent deux polygones superposés à coins coupés de 6 px, avec un bouton réel au rayon `detail` ; les utilitaires sans plaque conservent leur rayon propre. Les surfaces de lecture gardent le rayon `surface`, la préparation d’aide le rayon `detail`, et les détails de bustes leur rayon `detail`. La fiche dockée est carrée ; les panneaux flottants ont le rayon de contrôle. L’info-bulle garde son arrondi spécifique.

Les onglets sont des silhouettes de dossier : un pseudo-élément reçoit les coins coupés de 10 px et la couleur de plaque. Le bouton réel reste entier afin que la coupe décorative ne rogne pas son focus. Le nom attesté reconnu reçoit un cartouche terracotta à coupe diagonale ; le nom de fiche reprend cette coupe dans son propre pseudo-élément. La forme décorative ne rogne pas le texte ou les cibles. Un petit coin terracotta dans le cadre de message rappelle l’arête sans remplacer une commande.

## Components

### Graphe du projet

Graphe est la quatrième destination du projet. Une liste HTML intégrale et des relations textuelles accompagnent un SVG local déterministe ; sens, confiance, score et date d’observation restent explicites. La dernière tentative et le résultat conservé portent des états et identités séparés. Si un partiel coexiste avec le dernier complet, une commande locale permet de consulter chacun avec son identité et ses réglages ; le complet historique ne propose pas une revalidation qui ciblerait le partiel. Les labels du dessin compensent son échelle effective, sans réduire le texte de lecture. Recherche, sélection et zoom/pan sont locaux à l’identité de l’analyse en session ; l’accès aux fichiers rejoint le panneau commun 2.8 après revalidation.

### Buttons

Les commandes principales, secondaires, textuelles et les bascules de barre adoptent deux plaques plates : une silhouette encrée extérieure et une face intérieure en retrait de 1 px, avec un trait clair en haut et un trait d’encre en bas. Les coins coupés de 6 px appartiennent aux pseudo-éléments ; le bouton et son focus restent rectangulaires et entièrement ciblables. Barlow Condensed Bold, taille 19 px et hauteur minimale de 44 px rendent les décisions lisibles ; les utilitaires à icône et les fermetures gardent 40 px.

Le principal suit les trois accents d’action ; le secondaire utilise la plaque pétrole, puis les fonds de survol et pression. L’action textuelle est une plaque de panneau à texte de lien, avec retour au survol. Désactivé : opacité pleine, face neutre et texte neutre associé ; l’indisponibilité fonctionnelle reste héritée. Le focus garde son contour de 2 px et son décalage de 3 px. L’info-bulle Codex se retire pendant l’ouverture du panneau de connexion.

### Native window caption

Trois plaques encrées à coins coupés prolongent le langage atelier sous Réduire, Agrandir/Restaurer et Fermer. `WindowCaptionPlates` ne rend que trois éléments décoratifs, masqués à l’accessibilité et sans événements de pointeur. Le composant suit la visibilité et les changements de géométrie de Window Controls Overlay ; hors overlay visible il ne rend rien. Main conserve les glyphes et zones d’action Windows, avec fond de caption transparent hors contraste élevé et retour au fond natif en contraste élevé. La fermeture suit la routine native existante.

La position et la largeur viennent des variables `env(titlebar-area-*)` ; les trois colonnes partagent l’espace natif restant, sans largeur de bouton supposée de 46 px. Les coupes, marges et contours suivent l’unité dérivée de la hauteur native, avec un contour fin d’une unité, soit 1 px à la hauteur de référence de 56 px. Les plaques et pseudo-éléments sont `pointer-events: none` et hors drag ; leur décor ne devient jamais une cible. Sous `forced-colors`, ce calque se cache pour laisser le contraste natif.

**The Native Window Actions Rule.** Les plaques des commandes de fenêtre décorent les contrôles Windows ; leurs glyphes, zones d’action et routine de fermeture restent natifs, sans bouton HTML ni nouveau gestionnaire métier.

### Choice controls

Cases et radios restent de vrais inputs HTML. Leur surface de 20 × 20 px a un contour de 1 px et un fond de panneau ; case à angles de 2 px, radio ronde. Coché ou mixte : face terracotta, marque d’encre (coche, trait mixte ou point). Le focus est un contour de 2 px décalé de 3 px ; désactivé, l’input conserve sa sémantique avec opacité 0,65 et curseur indisponible. Le champ, le libellé, le clavier et les décisions métier sont conservés. Sous `forced-colors`, `appearance: auto`, fond et bord natifs reprennent la main et les marques décoratives sont retirées.

### Chips

Le badge factuel est petit et neutre, avec le rayon `badge`, sans fonctionnement de filtre implicite. Une attente utilise la paire ambrée et un texte complet ; une coche ou un visage ne remplace pas sa décision.

### Cards / Containers

Recommandation et préparation d’aide : surfaces chaudes, contour propre à la recommandation et petit rayon. La première garde 24 px de remplissage, la préparation d’aide 22 px puis 18 px sous 721 px, sur le fond de panneau et avec une arête supérieure. Les messages assistant restent dans le flux sur un panneau calme bordé et ombré ; les messages utilisateur sont légèrement contenus, alignés à droite et remplis avec `selected`.

### Inputs / Fields

La saisie est un panneau calme bordé d’une arête de 1 px et du cadre raster hérité sans centre rempli, à petit rayon, avec contour de focus hérité et bordure qui suit le focus intérieur. Le champ conserve le texte Oxanium à 16 px et graisse 450, une hauteur minimale de 88 px réduite à 64 px dans le dialogue ordinaire ou sous 701 px de haut, et un redimensionnement vertical borné. Les champs de question, les ajustements d’approbation et les blocs de patch gardent leur forme compacte ; rien n’est escamoté pour laisser place à un portrait. Les reçus natifs et l’état de conservation demeurent distincts.

### Navigation

Le rail et le tiroir restent pétrole, en clair comme en sombre, avec texte ivoire et métadonnées atténuées. Une ligne mesure au moins 52 px en mode déployé ; en rail compact, sa cible mesure 40 × 44 px dans la largeur de 58 px, avec l’axe de commande à 28 px conservé. En mode déployé, la sélection remplit la ligne en terracotta avec texte encre. En rail compact, la ligne sélectionnée garde le fond pétrole du rail, sans encadrement extérieur orange : seule la face du monogramme devient terracotta avec texte encre, entourée d’un trait de 1 px, et un repère latéral de 2 px indique la sélection. Le survol reste pétrole plus clair et le focus un contour bleu clair de 2 px décalé de 2 px. Les info-bulles compactes sont en Oxanium 450 à 14 px.

Le repère de projet reprend le nom : un mot de trois lettres/chiffres au plus est gardé, un mot plus long donne ses deux premiers caractères, plusieurs mots donnent les initiales des deux premiers. Le résultat est mis en capitales : MIA et Madness donnent MIA et MA. Sans lettre ni chiffre, un SVG de dossier sert de repli. Le même repère apparaît dans la navigation et sur les cartes d’accueil ; le nom complet accessible et les actions restent inchangés.

Les pictogrammes utilitaires ont des contours anguleux de 1,5 unité SVG et des faces partiellement remplies ; les commandes de barre restent à 40 px et la marque ChatGPT est conservée. Le logo M existant, issu du raster de 64 px, signe le bas du rail compact à 28 px ; cette réutilisation n’ajoute aucune image. Les onglets sélectionnés reçoivent terracotta et un fond de dossier coupé ; leur survol suit l’accent approprié. Le repli garde les noms accessibles et les aides au survol/focus. Un projet garde son contexte et ses onglets avant le dialogue ; l’état du travail ne provient pas du décor.

### Portrait and role consultation

La vignette de conversation occupe exactement 40 × 40 px ; le buste réutilisé est recadré dans ce cadre. La fiche révèle le buste entier en `object-fit: contain` dans une zone de 234 px de haut, réduite à 180 px sous 701 px de haut. Les images sont décoratives pour l’accessibilité et un SVG neutre prend le relais en cas d’échec ; le nom et la provenance restent des textes HTML.

Le casting v2 comprend sept PNG RGBA de 1254 × 1254 px, édités depuis les originaux de la révision `1a7100c` avec ImageGen intégré ; Mary sert de guide de style aux six autres. Les contours noirs, ombres franches, silhouettes asymétriques et objets de métier absurdes renforcent le caractère illustré. Les visages restent adultes et distincts : loupes et cartes pour Mary, outils de couleur pour Sally, mécanique pour Amelia, plans et maquette pour Winston, mégaphone et cartes pour John, fiches et tampon pour Sofia, étau et clés pour Smithy. Les [prompts et empreintes](./resources/atelier-cast-v2/provenance.json) relient les éditions à leurs sources. Le fond alpha laisse les composants et les textes réels porter la lecture ; les couleurs accessoires des illustrations ne deviennent pas des tokens UI.

Le registre de présentation accepte uniquement l’identité native attestée et l’un des sept noms exacts : Mary (Analyste), John (Product Manager), Sofia (Product Owner), Winston (Architecte), Sally (UX Designer), Amelia (Développeuse), Smithy (Toolsmith). Une identité attestée hors casting garde son nom et le repère neutre ; l’identité inconnue reste inconnue, notamment à la restauration. La fiche décrit le rôle, la spécialité, la provenance du message et son identifiant. Elle n’atteste ni rôle activé, ni compétence installée, ni activité en cours.

L’ouverture place le focus au titre ; Échap ou Fermer referme la consultation et rend le focus au déclencheur s’il existe encore, sinon à un repère utile. Le mode docké reste une région nommée à Tab libre ; le mode superposé est un dialogue natif modal. Un changement de contexte ferme la consultation devenue étrangère. Ouvrir, fermer et redimensionner la fiche sont des gestes de consultation locale, sans appel fournisseur.

### Persistent attention in the role panel

La fiche garde une zone séparée pour les attentes et récupérations nouvellement observées. Leur liste reste présente pendant la consultation ; une entrée devenue inactive indique explicitement « historique conservé » et son action rejoint cet historique. Une zone de statut polie et atomique annonce les arrivées, sans minuterie de disparition. L’annonce et la liste peuvent défiler ; elles n’écrasent ni l’en-tête, ni Fermer, ni le corps de rôle. Rejoindre une demande ferme la fiche avant la navigation et ne répond pas à cette demande.

### Motion

Révélation de fiche et ouverture du dossier utilisent une seule durée brève (180 ms), avec `cubic-bezier(.16, 1, .3, 1)`. La fiche avance de 10 px en se révélant ; les portraits restent statiques. `prefers-reduced-motion: reduce` supprime animations, transitions et défilement animé. Aucun mouvement ne signifie une activité native supposée.

### Bibliothèque de projets et reprise

L’accueil place les attentes et récupérations avant « Reprendre un projet ». Chaque ligne calme associe repère nominal, nom, racine exacte, initiative connue et action explicite ; les projets homonymes gardent leurs chemins distincts. État daté, couverture, contradiction et manque restent textuels. Résultats, décisions, récapitulatifs et suite proposée se lisent dans des détails progressifs avec leur contexte et provenance ; les passages restent littéraux et les inconnus ne deviennent pas une acceptation.

Les noms reprennent le titre de projet, les passages restent bornés à 72 ch et les chemins longs reviennent à la ligne ; sous 721 px, la ligne se replie et les détails réduisent leur indentation. Revenir au travail restaure la consultation mémorisée en session, sans envoi implicite. Cette mémoire ne remplace pas la conservation durable des données locales. Une nouvelle observation garde la version déjà lue et ses détails jusqu’à « Afficher la nouvelle observation » ; les révisions affichée et disponible restent distinctes.

## Do's and Don'ts

### Do:

- Do garder la conversation et les demandes explicites au premier plan, puis rendre sa largeur à la conversation à la fermeture de la fiche.
- Do employer les rôles de couleur de la palette active ; conserver un texte de statut et sa portée en complément de la couleur.
- Do garder les commandes de décision d’au moins 44 px et les utilitaires à icône de 40 px, les pictogrammes SVG sobres et un focus externe visible.
- Do réserver les petits portraits aux identités natives attestées reconnues ; conserver le nom attesté hors casting et le repère neutre pour l’inconnu.
- Do utiliser les bustes et décors originaux avec leur provenance, en gardant le centre du cadre nine-slice non rempli.
- Do conserver les brouillons, le clavier, les décisions natives et le mouvement réduit lors des changements de fiche, de largeur ou de thème.

### Don't:

- Don’t transformer le portrait ou sa fiche en preuve d’activité, d’activation de persona ou de compétence installée.
- Don’t déduire une identité du destinataire, d’une invocation ou du texte du message, ni reconstruire un visage nommé pour un historique inconnu.
- Don’t texturer les fonds de lecture et de saisie ni placer une image de maquette entière à la place de composants réels.
- Don’t faire d’un clic sur un portrait une transmission, un lancement, une approbation ou un changement d’agent.
- Don’t cacher une demande native, une récupération ou un échec de conservation derrière l’habillage ou une notification fugace.
- Don’t confondre la direction visuelle approuvée avec la validation du rendu intégré, la qualification native 2.2 ou une conformité WCAG globale.


## Infobulles du rail — 3 novembre 2026

Le rail reste isolé mais possède une priorité10 : ses noms de projet au survol/focus clavier passent devant le contenu ordinaire, y compris les auteurs sticky2, sous la barre40 et les panneaux70 ; les dialogues natifs gardent leur top-layer. L'info-bulle fixe conserve son style, le retour à la ligne des noms longs, son comportement Échap et les libellés du menu déployé. Aucun changement de charte, de dimensions ou de navigation. Voir [qualification ciblée](./_bmad-output/initiative-madness/ux-madness/qualification-tooltips-projets/parent-verification.md).
