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
    fontSize: "32px"
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
  body:
    fontFamily: "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  message:
    fontFamily: "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  code:
    fontFamily: "Consolas, Cascadia Code, monospace"
    fontSize: "12px"
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
    rounded: "{rounded.surface}"
    padding: "8px 11px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-text}"
  button-primary-active:
    backgroundColor: "{colors.accent-active}"
    textColor: "{colors.accent-text}"
  button-secondary:
    backgroundColor: "{colors.atelier-chrome}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "8px 11px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.link}"
    rounded: "{rounded.control}"
    padding: "6px 0"
  navigation-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.selected-text}"
    rounded: "{rounded.surface}"
    padding: "10px"
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
    backgroundColor: "{colors.recommendation}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "16px"
---

# Design System: Madness

## Overview

**Creative North Star: "Atelier de travail illustré des agents BMad"**

Un atelier personnel, chaleureux et expressif encadre le travail BMad : plaques bleu pétrole, commandes terracotta, contours encrés, angles coupés et matière peinte mate à usure retenue. Les sept visages originaux donnent un repère aux messages dont l’identité native est attestée. La conversation, ses décisions et ses preuves occupent le centre ; l’illustration reste discrète pendant la lecture.

L’anthracite chaud est le thème par défaut ; l’ivoire est son alternative claire. Les titres condensés portent le caractère du lieu, tandis que Segoe UI porte les messages, les menus et les décisions. Le décor se prolonge du chrome au centre de travail : cartouches d’auteur attesté, cadres de message et bordure raster de saisie. Les fonds de conversation et de saisie demeurent calmes. Ce système transpose la direction humaine approuvée le 2 novembre 2026 ; il décrit le candidat implémenté, sans valoir acceptation humaine de l’application intégrée.

**Key Characteristics:**

- Conversation dominante et lecture longue sur fonds calmes.
- Chrome peint/encré, onglets de dossier coupés et cartouches terracotta.
- Titres Barlow Condensed Bold locaux ; texte courant Segoe UI.
- Portrait compact et fiche informative ouverte à la demande.
- État, provenance et décisions exprimés par du texte réel.

Le frontmatter porte les primitives effectivement déclarées dans `src/renderer/src/styles.css` et les formes réutilisées. Les clés sans préfixe décrivent le sombre ; `light-*` fournit les remplacements de `data-theme="light"`. La feuille `src/renderer/src/atelier-immersion.css`, chargée après `styles.css` dans `main.tsx`, affine les composants sans ajouter de palette, de police ni d’asset. Les composants du frontmatter illustrent le sombre ; le renderer et les extraits du sidecar se lient aux propriétés CSS du thème actif. Les nuances de rampe du sidecar sont des aides de palette synthétisées, pas de nouvelles couleurs du produit. Les contrats comportementaux restent dans [ux-madness/DESIGN.md](./_bmad-output/initiative-madness/ux-madness/DESIGN.md) et [EXPERIENCE.md](./_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md).

## Colors

Terracotta d’action et bleu de repérage accompagnent des neutres chauds ; le chrome reçoit le pétrole sans colorer tout le texte de travail.

### Primary

- **Terracotta d’action** (`accent`, `accent-hover`, `accent-active`, `accent-text`, `accent-soft`) : décisions principales, sélection d’onglet et cartouche du nom. Les états survol et pression ont chacun leur couleur.

### Secondary

- **Bleu de repérage** (`link`, `focus`, `selected`, `selected-text`, `selection`, `selection-text`) : liens, contour clavier, contexte sélectionné et sélection de texte. Le focus ne prend pas le sens d’une approbation.
- **Plaques pétrole et arêtes cuivre** (`atelier-chrome`, `atelier-plate`, `atelier-edge`, `atelier-ink`, `atelier-heading`) : barre de fenêtre, cadres, onglets, contours encrés et marque d’atelier. Le clair emploie des plaques pâles et une encre brune ; le cadre raster conserve sa matière pétrole.

### Neutral

- **Anthracite de lecture / ivoire de lecture** (`surface`, `navigation`, `panel`, `text`) : page, rail, panneaux et texte courant selon le thème.
- **Texte secondaire chaud** (`muted`, `muted-lavender`) : provenance, chemins, explications et légendes. Le nom historique `muted-lavender` ne désigne plus une direction violette.
- **Traits et interaction** (`line`, `control-line`, `hover`, `active`) : séparations discrètes, contours utiles et retour d’interaction.
- **Conteneurs et info-bulles** (`recommendation`, `recommendation-line`, `neutral`, `neutral-text`, `tooltip`, `tooltip-text`, `backdrop`) : recommandation, badge factuel, aide ponctuelle et voile de dialogue.
- **États sémantiques** (`waiting`, `waiting-text`, `error`, `error-text`, `success`, `success-text`) : attente ambrée, erreur rose/brique et succès vert. Chaque paire garde un libellé et une portée explicites ; la couleur ne crée aucun état métier.

**The Quiet Reading Rule.** La matière reste sur les contours et les zones de contexte ; les messages et les champs de décision gardent un fond calme.

**The Explicit State Rule.** Une couleur ou un portrait ne remplace jamais le texte d’une attente, d’un refus, d’une erreur ou d’une identité inconnue.

## Typography

**Display Font:** Barlow Condensed Bold, police locale sous SIL OFL 1.1 ; repli Segoe UI, sans-serif.

**Body Font:** Segoe UI, puis le système et les replis déclarés dans le frontmatter.

**Label/Mono Font:** Segoe UI pour les métadonnées ; Consolas puis Cascadia Code pour les chemins, sources et identifiants.

**Character:** une voix condensée et franche pour repérer, une voix régulière pour lire et décider. La police locale est chargée avec `font-display: swap` ; aucun fournisseur de police distant n’est requis.

### Hierarchy

- **Display** : marque d’atelier ; le nom d’agent emploie la variante `agent-name` en cartouche et en capitales. Cette expression reste courte.
- **Headline** : titre de page. Le bandeau de projet passe à une taille plus compacte (28 px). Dans Conversation il garde une plaque calme à 28 px, réduite à 24 px sous 721 px et dans le dialogue ordinaire ajusté à la fenêtre. Le titre général du bandeau passe à 28 px sous 1081 px, puis 26 px sous 721 px.
- **Title** : titres de section ; demandes natives autour de 22 px, en-tête de fiche à 23 px, connexion à 25 px.
- **Body** : paragraphes et informations ; les messages et la saisie prennent la variante `message`. Les paragraphes sont bornés à 70 ch, les messages à 72 ch dans un article de 75 ch maximum ; le message assistant reçoit un interligne de 1,8.
- **Label** : état, provenance, légende et aide ; les badges factuels et info-bulles utilisent une taille compacte (11 px).
- **Message author** : identité courte ; le nom utilisateur a une variante à 17 px. Les onglets emploient Barlow Condensed à 19 px, 18 px dans Conversation, 20 px sous 721 px.

**The Two Voices Rule.** Barlow Condensed Bold donne leur caractère aux titres courts et aux noms ; Segoe UI porte les textes longs et les décisions.

## Layout

La fenêtre est une colonne de hauteur `100dvh` avec barre native d’au moins 56 px, puis un corps en flex : navigation, travail central et fiche éventuelle. La commande d’ouverture est une seule cible carrée de 40 px ; le rail replié garde 58 px et l’axe de la bascule à 28 px. Le panneau de contexte et la connexion sont consultables à la demande.

La navigation déployée mesure 240 px au format courant ; elle passe à 194 px sous 1281 px et 184 px sous 1081 px. Dès 721 px, elle peut se replier en rail. Sous 721 px, le tiroir natif remplace la barre latérale ; sa largeur est bornée à 240 px et à celle de la fenêtre. Les groupes suivent surtout le rythme 8 / 12 / 16 / 20 / 24 px du frontmatter, sans imposer une grille nouvelle à toutes les anciennes surfaces.

Le contenu central est borné à 1160 px. Son espacement horizontal est de 38 px au format courant, 26 px sous 1281 px, 16 px sous 721 px et 52 px dès 1600 px ; avec fiche dockée ouverte, il revient à 24 px. Le bandeau illustré reste sur l’accueil et les vues de préparation ; il se réduit ou perd son image aux petits formats et aux fenêtres de moins de 701 px de haut. Dans Conversation, le bandeau projet est une plaque calme sans image. Le dialogue ordinaire, sans formulaire de question ou d’approbation actif, occupe la hauteur restante par flex : le titre, les onglets, les états et le compositeur gardent leur hauteur, tandis que les messages prennent la place disponible avec un minimum de 160 px. Le champ de rédaction garde au moins 64 px ; champ et action restent ensemble dans la fenêtre aux formats vérifiés. L’en-tête d’auteur est sticky au sommet du défilement, borné par son propre article ; la source exacte reste lisible après le texte.

Lorsqu’une question ou une approbation est active, la page conserve son flux naturel afin de laisser toute sa hauteur au formulaire ou au patch. Le défilement des messages est alors borné à `clamp(240px, 44dvh, 640px)`, avec adaptations à 42dvh sous 721 px et 40dvh sous 701 px de haut. La position de lecture et le suivi existants sont conservés.

**The Working Center Rule.** Le décor encadre les noms, les messages et la saisie ; le texte réel, la source et les commandes explicites restent accessibles, y compris après défilement.

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

Le cadre `chrome-plate-frame.png` est un overlay décoratif sur navigation, tiroir et fiche : `border-image-slice: 128`, largeur de bande de 36 px, débord de 17 px et répétition étirée. Le mot-clé `fill` est absent. L’asset source garde 35 pixels centraux à alpha 1/255 ; le centre omis n’est jamais rendu. Cette limite de production reste dans sa provenance, sans prétendre que l’ouverture source est exactement vide. La saisie réutilise ce même raster avec une bande de 22 px et un débord de 7 px ; la marge latérale de 7 px contient son cadre dans le centre de travail. Les contrôles et les zones de lecture sont au-dessus du cadre et conservent leurs événements et leur focus.

## Shapes

Le langage est celui de plaques mates à angles nets : petits arrondis utilitaires, traits encrés et coupes géométriques visibles. Les contrôles prennent le rayon `control`, les surfaces de lecture et cartes le rayon `surface`, les détails de bustes le rayon `detail`. La fiche dockée est carrée ; les panneaux flottants ont le rayon de contrôle. L’info-bulle garde son arrondi spécifique.

Les onglets sont des silhouettes de dossier : un pseudo-élément reçoit les coins coupés de 10 px et la couleur de plaque. Le bouton réel reste entier afin que la coupe décorative ne rogne pas son focus. Le nom attesté reconnu reçoit un cartouche terracotta à coupe diagonale ; le nom de fiche reprend cette coupe dans son propre pseudo-élément. La forme décorative ne rogne pas le texte ou les cibles. Un petit coin terracotta dans le cadre de message rappelle l’arête sans remplacer une commande.

## Components

### Buttons

Commandes compactes et décisions lisibles. Hauteur minimale de 40 px, espacement intérieur et rayon dans le frontmatter ; les SVG utilitaires ordinaires font 19 px. Le principal emploie terracotta et texte contrasté, avec états survol et pression ; le secondaire est une plaque de panneau bordée par `control-line`. Le bouton sans fond et le lien textuel gardent leur rôle respectif. Le focus est un contour de 2 px avec décalage de 3 px. Dans le chrome encadré, un halo de panneau supplémentaire de 5 px protège sa visibilité. Désactivé : opacité 0,5 et curseur indisponible ; les boutons désactivés des aides gardent explicitement un texte atténué et l’opacité pleine.

### Chips

Le badge factuel est petit et neutre, avec le rayon `badge`, sans fonctionnement de filtre implicite. Une attente utilise la paire ambrée et un texte complet ; une coche ou un visage ne remplace pas sa décision.

### Cards / Containers

Recommandation et préparation d’aide : surfaces chaudes, contour propre à la recommandation et petit rayon. La première garde 24 px de remplissage, la préparation d’aide 16 px puis 12 px sous 721 px. Les messages assistant restent dans le flux séparé d’un trait ; les messages utilisateur sont légèrement contenus, alignés à droite et remplis avec `selected`.

### Inputs / Fields

La saisie est un panneau calme bordé d’une plaque de 2 px, à petit rayon, avec contour de focus hérité et bordure qui suit le focus intérieur. Le champ conserve le texte Segoe UI de message, une hauteur minimale de 71 px et un redimensionnement vertical borné. Les champs de question, les ajustements d’approbation et les blocs de patch gardent leur forme compacte ; rien n’est escamoté pour laisser place à un portrait. Les reçus natifs et l’état de conservation demeurent distincts.

### Navigation

La navigation choisie reçoit le fond `selected`, le texte associé, un contour interne utile et un petit repère terracotta. Les onglets sélectionnés reçoivent terracotta et un fond de dossier coupé ; leur survol suit l’accent approprié. Le repli garde les noms accessibles et les aides au survol/focus. Un projet garde son contexte et ses onglets avant le dialogue ; l’état du travail ne provient pas du décor.

### Portrait and role consultation

La vignette de conversation occupe exactement 40 × 40 px ; le buste réutilisé est recadré dans ce cadre. La fiche révèle le buste entier en `object-fit: contain` dans une zone de 234 px de haut, réduite à 180 px sous 701 px de haut. Les images sont décoratives pour l’accessibilité et un SVG neutre prend le relais en cas d’échec ; le nom et la provenance restent des textes HTML.

Le registre de présentation accepte uniquement l’identité native attestée et l’un des sept noms exacts : Mary (Analyste), John (Product Manager), Sofia (Product Owner), Winston (Architecte), Sally (UX Designer), Amelia (Développeuse), Smithy (Toolsmith). Une identité attestée hors casting garde son nom et le repère neutre ; l’identité inconnue reste inconnue, notamment à la restauration. La fiche décrit le rôle, la spécialité, la provenance du message et son identifiant. Elle n’atteste ni rôle activé, ni compétence installée, ni activité en cours.

L’ouverture place le focus au titre ; Échap ou Fermer referme la consultation et rend le focus au déclencheur s’il existe encore, sinon à un repère utile. Le mode docké reste une région nommée à Tab libre ; le mode superposé est un dialogue natif modal. Un changement de contexte ferme la consultation devenue étrangère. Ouvrir, fermer et redimensionner la fiche sont des gestes de consultation locale, sans appel fournisseur.

### Persistent attention in the role panel

La fiche garde une zone séparée pour les attentes et récupérations nouvellement observées. Leur liste reste présente pendant la consultation ; une entrée devenue inactive indique explicitement « historique conservé » et son action rejoint cet historique. Une zone de statut polie et atomique annonce les arrivées, sans minuterie de disparition. L’annonce et la liste peuvent défiler ; elles n’écrasent ni l’en-tête, ni Fermer, ni le corps de rôle. Rejoindre une demande ferme la fiche avant la navigation et ne répond pas à cette demande.

### Motion

Révélation de fiche et ouverture du dossier utilisent une seule durée brève (180 ms), avec `cubic-bezier(.16, 1, .3, 1)`. La fiche avance de 10 px en se révélant ; les portraits restent statiques. `prefers-reduced-motion: reduce` supprime animations, transitions et défilement animé. Aucun mouvement ne signifie une activité native supposée.

## Do's and Don'ts

### Do:

- Do garder la conversation et les demandes explicites au premier plan, puis rendre sa largeur à la conversation à la fermeture de la fiche.
- Do employer les rôles de couleur de la palette active ; conserver un texte de statut et sa portée en complément de la couleur.
- Do garder les cibles de commande de 40 px, les pictogrammes SVG sobres et un focus externe visible.
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
