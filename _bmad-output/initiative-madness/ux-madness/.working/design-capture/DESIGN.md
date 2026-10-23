---
name: "Madness — capture du prototype"
description: "Choix visuels observés dans la maquette HTML du Parcours guidé, à confirmer après prise en main."
status: draft
colors:
  accent: "#654bb0"
  accent-dark: "#51368f"
  accent-active: "#432b7a"
  accent-soft: "#f0ebfa"
  white: "#fff"
  navigation: "#f4f3f7"
  panel: "#fdfcfe"
  anthracite: "#29282e"
  muted: "#66636f"
  muted-lavender: "#75657f"
  line: "#e9e7ee"
  hover: "#efedf3"
  active: "#e7e3ee"
  secondary-hover: "#f7f5fa"
  secondary-line: "#d9d5e0"
  navigation-active: "#e8e3f1"
  navigation-active-text: "#533b80"
  recommendation: "#fcfbff"
  recommendation-line: "#ded7ea"
  badge-neutral: "#f1f0f4"
  badge-neutral-text: "#5e596a"
  badge-purple-text: "#604392"
  badge-amber: "#fbf2df"
  badge-amber-text: "#7b5519"
  badge-green: "#edf5ef"
  badge-green-text: "#366147"
  badge-red: "#fbecee"
  badge-red-text: "#9b3a43"
  warning: "#845d1f"
  danger: "#a53d43"
typography:
  headline:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  control:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
  navigation:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.35
  small:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
  code:
    fontFamily: 'Consolas, "Cascadia Code", monospace'
    fontSize: "12px"
    fontWeight: 400
rounded:
  compact: "5px"
  control: "8px"
  content: "9px"
  group: "10px"
  container: "12px"
  dialog: "15px"
spacing:
  tight: "4px"
  small: "8px"
  control: "10px"
  medium: "12px"
  standard: "16px"
  section: "20px"
  large: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
  button-primary-active:
    backgroundColor: "{colors.accent-active}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.anthracite}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-ghost:
    textColor: "{colors.anthracite}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  sidebar-item:
    typography: "{typography.navigation}"
    rounded: "{rounded.control}"
    padding: "10px"
    width: "100%"
  sidebar-item-active:
    backgroundColor: "{colors.navigation-active}"
    textColor: "{colors.navigation-active-text}"
  search-field:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 12px 11px 38px"
    width: "100%"
  badge:
    backgroundColor: "{colors.badge-neutral}"
    textColor: "{colors.badge-neutral-text}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "3px 6px"
  badge-purple:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.badge-purple-text}"
  badge-amber:
    backgroundColor: "{colors.badge-amber}"
    textColor: "{colors.badge-amber-text}"
  badge-green:
    backgroundColor: "{colors.badge-green}"
    textColor: "{colors.badge-green-text}"
  badge-red:
    backgroundColor: "{colors.badge-red}"
    textColor: "{colors.badge-red-text}"
  recommendation:
    backgroundColor: "{colors.recommendation}"
    rounded: "{rounded.container}"
    padding: "23px"
  composer:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.container}"
    padding: "12px"
---

# Madness — capture visuelle du prototype

## Overview

**Capture du prototype, à confirmer après prise en main.** Cette extraction décrit la maquette HTML « Parcours guidé » dans `../prototype/`. Elle ne remplace pas les spines BMad `../../DESIGN.md` et `../../EXPERIENCE.md`, toujours en Discovery. Les tokens restent provisoires.

L’inspiration Codex Desktop se traduit par un espace blanc, une navigation gris lavande, du texte anthracite et un violet d’action. La densité est celle d’un outil de travail : listes plates, filets légers, titres courts et panneaux latéraux.

**Caractéristiques observées :**

- Palette claire et états accompagnés de libellés.
- Segoe UI pour l’interface ; Consolas pour le code.
- Séparation par les fonds et les filets avant les ombres.
- Panneaux consultables à la demande en fenêtre étroite.

Les données et opérations sont simulées : aucune connexion Codex, lecture de dossier ou exécution réelle. Cette capture n’adopte ni stack, ni packaging, ni système visuel final. Aucun raster livré.

## Colors

### Primary

`accent` porte les actions, liens et focus ; `accent-dark` et `accent-active` rendent le survol et la pression. `accent-soft` accompagne les badges de contexte.

### Neutral

`white` porte le centre, `navigation` le rail gris lavande et `panel` les fichiers. `anthracite` porte le texte principal ; `muted` et `muted-lavender` hiérarchisent le secondaire. `line` sépare les zones. Les fonds de survol et de sélection rendent les interactions visibles.

### États observés

Les badges neutre, violet, ambre, vert et rouge associent fond pâle et libellé sombre. L’ambre accompagne l’attente, le vert la détection illustrée de BMad et le rouge l’erreur récupérable. Ces teintes ne prouvent aucun diagnostic réel.

## Typography

Les piles exactes sont dans le frontmatter. Le prototype n’utilise pas de police d’affiche.

- `headline` : accueil ; titres de projet adaptés localement entre 23 et 24 px.
- `title` et `subtitle` : sections ; recommandation à 21 px, puis 19 px en fenêtre réduite.
- `body` : introductions et recommandation ; conversation à interligne 1,75.
- `control` et `navigation` : boutons et rail ; `small` et `label` : explications compactes et états.
- `code` : base monospace. Les exceptions locales des chemins et extraits ne créent pas une nouvelle échelle.

Les textes de lecture sont limités à 65–70 caractères selon la zone. Les petits textes fonctionnels sont généralement à 11 ou 12 px.

## Layout

Le modèle observé assemble navigation, contenu flexible et fichiers. Au format de base, les panneaux mesurent 222 et 318 px ; le centre est limité à 1 080 px, avec un retrait de 35 px en haut et 38 px latéralement. L’accueil est limité à 1 050 px. Le contenu et les panneaux défilent séparément.

Après retour utilisateur, la navigation desktop peut se réduire à un rail de 58 px, au-delà du seuil de 720 px. Le bouton de panneau dans l’en-tête permet de réduire ou déployer le menu. Les icônes, les initiales M/A des projets et l’indicateur d’attente restent visibles ; les noms apparaissent au survol et au focus dans une infobulle hors du conteneur défilant. Cette préférence est mémorisée localement et ne change ni la vue ni la saisie en cours. Le tiroir mobile conserve ses libellés complets. Voir la [référence utilisateur](../../imports/reference-navigation-repliee.png).

Les seuils CSS sont capturés dans le sidecar : élargissement à 1 600 px, densification jusqu’à 1 280 px, fichiers à la demande jusqu’à 1 080 px, puis navigation à la demande jusqu’à 720 px. Dans ce dernier cas, le centre conserve 20 px de marge latérale et les fichiers prennent au plus 340 px. Ce comportement reste à éprouver avec l’utilisateur.

Les listes de projets, attentes, compétences et étapes restent des lignes séparées. Les espacements réutilisés figurent dans le frontmatter.

## Elevation & Depth

Les fonds proches et les filets dominent. Les ombres observées servent le champ de réponse, le dialogue, la notification et les panneaux superposés ; leurs valeurs exactes figurent dans le sidecar. Le dialogue a une bordure nulle.

Le chevron d’étape pivote en 180 ms. La notification apparaît en 180 ms avec une translation de 5 px. Les indicateurs d’activité ne pulsent pas. `prefers-reduced-motion: reduce` neutralise animations, transitions et défilement animé.

## Shapes

Les arrondis compacts servent badges et code ; les contrôles, messages, groupes et conteneurs utilisent les paliers du frontmatter. Le dialogue est plus arrondi. Les filets mesurent généralement 1 px ; le focus violet mesure 2 px, décalé de 3 px.

Les icônes sont des SVG en trait : base de 19 px, trait de 1,65, extrémités arrondies. Le signe de branche près de Madness reste un élément de maquette, sans identité approuvée.

## Components

- **Boutons :** principal violet et blanc, secondaire blanc bordé, discret sans fond au repos. Survol, pression et focus sont capturés ; indisponibilité par opacité 0,5. Le bouton de recommandation utilise un retrait de 10 px sur 14 px.
- **Badges :** libellés informatifs, retrait de 3 px sur 6 px, teinte selon l’état ; aucune interaction.
- **Champs :** recherche bordée avec loupe SVG ; champ de réponse arrondi, zone de texte redimensionnable et focus porté par son conteneur.
- **Navigation :** sélection lavande et graisse 600 ; onglets de projet soulignés par un trait violet de 2 px.
- **Recommandation :** titre, explication, raison séparée par un filet, actions et détails dépliables. Les étapes dessous forment une liste plate et extensible.
- **Dialogue et notification :** dialogue natif avec fond de scène et pied d’actions ; notification anthracite au bas du centre.

Le sidecar contient sept échantillons HTML/CSS autonomes issus de ces composants. Ils représentent leur aspect ; ils ne lancent aucun workflow.

## Do's and Don'ts

### Do:

- **Do** conserver les libellés d’état et de simulation.
- **Do** garder le focus clavier visible et respecter la réduction de mouvement.
- **Do** conserver les états interactifs lors de la reprise des composants.

### Don't:

- **Don't** transformer cette capture en validation du système final.
- **Don't** présenter la simulation comme une opération réelle.
- **Don't** réintroduire le surtitre retiré de la recommandation ou la pulsation d’activité.
- **Don't** généraliser les exceptions typographiques locales.
