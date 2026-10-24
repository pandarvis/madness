---
name: Madness
description: "Parcours guidé pour comprendre et piloter BMad sur des projets locaux."
status: final
created: 2026-10-22
updated: 2026-10-24
sources:
  - ../initiative-madness.md
  - .memlog.md
  - ../../../PRODUCT.md
  - ../brief-madness/brief-madness.md
  - .working/design-capture/DESIGN.md
colors:
  surface: '#FFFFFF'
  navigation: '#F4F3F7'
  panel: '#FDFCFE'
  text: '#29282E'
  muted: '#66636F'
  muted-lavender: '#75657F'
  line: '#E9E7EE'
  control-line: '#D9D5E0'
  hover: '#EFEDF3'
  active: '#E7E3EE'
  accent: '#654BB0'
  accent-hover: '#51368F'
  accent-active: '#432B7A'
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
  page-top: 35px
  page-mobile: 20px
  content-max: 1080px
  home-max: 1050px
components:
  navigation:
    width: 222px
    compactWidth: 58px
    compactTarget: 40px
    drawerWidth: 240px
    drawerBreakpoint: 720px
    background: '{colors.navigation}'
    selectedBackground: '{colors.navigation-selected}'
    selectedText: '{colors.navigation-selected-text}'
  button:
    background: '{colors.accent}'
    text: '{colors.surface}'
    radius: '{rounded.md}'
    padding: '8px 11px'
    focusWidth: 2px
    focusOffset: 3px
  recommendation:
    background: '{colors.recommendation}'
    border: '{colors.recommendation-line}'
    radius: '{rounded.lg}'
    padding: 23px
  status:
    radius: '{rounded.sm}'
    typography: '{typography.label}'
    padding: '3px 6px'
  composer:
    radius: '{rounded.lg}'
    padding: '{spacing.3}'
    minTextHeight: 71px
    shadow: '0 3px 12px #42314908'
    focusShadow: '0 0 0 2px #EEE6F7'
  files:
    width: 318px
    overlayBreakpoint: 1080px
    mobileMaxWidth: 340px
    background: '{colors.panel}'
    overlayShadow: '-12px 0 36px #30223C14'
  dialog:
    maxWidth: 590px
    radius: '{rounded.dialog}'
    shadow: '0 18px 65px #24162F29'
  notification:
    background: '{colors.notification}'
    text: '{colors.surface}'
    radius: '{rounded.group}'
    shadow: '0 6px 22px #24172D2B'
---

## Brand & Style

Madness présente un espace de travail calme : navigation gris lavande, centre blanc, texte anthracite et violet réservé aux actions. Les listes plates et la hiérarchie typographique donnent la priorité au projet, à l'attente et à la prochaine action utile. Le parcours BMad reste un ensemble de possibilités explorables.

La composition « Parcours guidé » et sa navigation rétractable constituent la base UX acceptée le 23 octobre 2026. Les deux contrats sont finalisés pour cette première base. Cette acceptation porte sur une simulation de conception ; aucun connecteur Codex, accès aux dossiers ou choix de stack n'est validé. DESIGN.md et EXPERIENCE.md font foi en cas de conflit avec les maquettes ou imports.

La [référence Codex Desktop](imports/reference-codex-desktop.png) apporte la sobriété de l'espace, la conversation centrale et les panneaux de contexte. La [maquette cliquable](mockups/parcours-guide/index.html) matérialise cette traduction pour Madness ; son bandeau de simulation doit rester visible lorsqu'elle est présentée.

## Colors

| Rôle | Tokens et usage |
|---|---|
| Surfaces | `{colors.surface}` au centre, `{colors.navigation}` à gauche, `{colors.panel}` pour les fichiers. `{colors.line}` sépare les régions sans les enfermer dans des cartes. |
| Lecture | `{colors.text}` pour le principal ; `{colors.muted}` et `{colors.muted-lavender}` pour les explications et métadonnées. Une information nécessaire ne devient pas illisible pour paraître secondaire. |
| Action | `{colors.accent}`, `{colors.accent-hover}`, `{colors.accent-active}` pour action principale, liens et focus ; `{colors.accent-soft}` pour un contexte léger. |
| Sélection | `{colors.navigation-selected}` avec `{colors.navigation-selected-text}` ; `{colors.hover}` et `{colors.active}` rendent survol et pression visibles. |
| Recommandation | `{colors.recommendation}` et `{colors.recommendation-line}` l'isolent doucement du parcours. |
| États | Neutre `{colors.neutral}` / `{colors.neutral-text}` ; contexte `{colors.accent-soft}` / `{colors.context-text}` ; attente `{colors.waiting}` / `{colors.waiting-text}` ; diagnostic positif `{colors.success}` / `{colors.success-text}` ; erreur `{colors.error}` / `{colors.error-text}`. Toujours un libellé, jamais la couleur seule. |

Le vert exprime le résultat précis d'un diagnostic, jamais une validation humaine implicite. L'ambre signifie qu'une intervention est attendue, sans transformer tout brouillon en erreur.

Objectifs d'implémentation : contraste de texte ≥ 4,5:1, grand texte ≥ 3:1 ; indicateurs nécessaires et focus ≥ 3:1 avec les couleurs adjacentes. Les filets pâles structurent le contenu mais ne suffisent pas seuls à identifier un contrôle. Ces cibles relèvent du socle d'accessibilité à vérifier, pas d'un audit déjà passé.

## Typography

Segoe UI suit le contexte Windows ; les replis système évitent une dépendance à une police distante. Consolas ou Cascadia Code distingue les invocations et chemins. Les rôles sont définis dans le frontmatter : `headline` pour l'accueil, `title` et `subtitle` pour les niveaux internes, `body` pour les explications, `conversation` pour le dialogue, `control` et `navigation` pour agir, `small` et `label` pour le contexte.

Les textes fonctionnels ne descendent pas sous `{typography.label.fontSize}`. Ne pas reprendre les exceptions à 10 px encore présentes dans quelques sélecteurs de la maquette. La lecture courante reste à 65–70 caractères par ligne ; les chemins peuvent se replier. Un titre de projet peut se réduire à 23–24 px et la recommandation passe de 21 à 19 px dans une fenêtre compacte, sans créer de nouveau rôle typographique.

## Layout & Spacing

Sous une barre d’action commune à toute la largeur : Navigation latérale, contenu flexible, Panneau de fichiers. Le centre utilise `{spacing.content-max}`, l'accueil `{spacing.home-max}`, avec `{spacing.page-x}` sur les côtés et `{spacing.page-top}` en haut à la largeur de référence. L'échelle 4 / 8 / 12 / 16 / 20 / 24 px distingue relations proches et sections. Les régions défilent séparément sans masquer l'en-tête et ses commandes.

L'en-tête identifie le projet et l'initiative active lorsqu'elle est connue. Ces deux niveaux restent lisibles lorsque la navigation est repliée ; les fichiers et l'action proposée gardent le même contexte. La forme de présentation des autres initiatives reste à préciser dans les exigences, sans imposer de nouvel écran.

Amendement du 24 octobre 2026, précisé après prise en main : la barre supérieure intègre la barre de titre Windows. La bascule de navigation à gauche et les contrôles natifs réduire, agrandir/restaurer et fermer sont sur la même ligne. Une seule commande « Ouvrir un projet » reste accessible depuis l’accueil et le projet ; ces commandes ne sont pas répétées dans la colonne gauche ni dans le contenu d’accueil. La zone native des contrôles est réservée par la géométrie Window Controls Overlay. Le fond libre permet de déplacer la fenêtre ; les boutons, dialogues et leur fond modal restent interactifs. En fenêtre étroite, la bascule ouvre le tiroir ; l’ouverture de projet garde son nom accessible lorsque seul son SVG est visible. Les anciennes captures restent historiques ; cette règle prévaut pour l’application.

La [feuille de style de la maquette](mockups/parcours-guide/styles.css) conserve la composition observée et ses adaptations de fenêtre.

| Largeur de fenêtre | Composition de référence |
|---|---|
| ≥ 1 600 px | Navigation déployée 240 px, fichiers 350 px, retraits centraux 52 px. |
| 1 281–1 599 px | Navigation déployée `{components.navigation.width}`, fichiers `{components.files.width}`. |
| 1 081–1 280 px | Navigation déployée 194 px, fichiers 278 px, retraits centraux 26 px. |
| 721–1 080 px | Navigation déployée 184 px ; fichiers en panneau superposé sur demande, largeur 304 px. |
| ≤ 720 px | Navigation en tiroir avec libellés ; contenu à `{spacing.page-mobile}` ; fichiers sur demande, largeur maximale `{components.files.mobileMaxWidth}` bornée par la fenêtre. |

Au-dessus de `{components.navigation.drawerBreakpoint}`, l'utilisateur peut réduire la navigation à `{components.navigation.compactWidth}`. Le rail conserve les icônes, les repères de projets distincts et l'attente ; ses cibles mesurent `{components.navigation.compactTarget}`. Les libellés deviennent des infobulles au survol et au focus, hors de la zone rognée. La [référence de navigation repliée](imports/reference-navigation-repliee.png) apporte ce gain de place ; les captures [rail](mockups/navigation-repliee.png), [menu déployé](mockups/navigation-deployee.png) et [tiroir étroit](mockups/navigation-mobile.png) en montrent les états Madness.

## Elevation & Depth

Les fonds et filets portent la hiérarchie. Les ombres servent uniquement la séparation du Champ de réponse, du Dialogue, de la Notification et des panneaux superposés ; les valeurs réutilisables figurent dans les tokens de composants. Le Dialogue n'ajoute pas de bordure à son ombre. Éviter les ombres sur chaque ligne de liste.

Les seules transitions observées durent 180 ms : rotation du chevron d'intention et apparition de la Notification par opacité et translation de 5 px. Les indicateurs d'activité restent statiques. La réduction de mouvement supprime transitions, animations et défilement animé.

## Shapes

`{rounded.sm}` pour états et code ; `{rounded.md}` pour contrôles et sélection ; `{rounded.message}` pour messages ; `{rounded.group}` pour propositions ; `{rounded.lg}` pour grandes zones ; `{rounded.dialog}` pour le Dialogue. Les filets font généralement 1 px. Le focus utilise `{components.button.focusWidth}` avec un décalage de `{components.button.focusOffset}`.

Les icônes sont des SVG en trait, base 19 px et trait 1,65, avec extrémités arrondies. Les lettres M/A distinguent les deux projets de démonstration ; le produit doit conserver des repères distincts pour ses projets réels. Le signe de branche du prototype n'est pas un logo de marque validé.

## Components

Les mêmes noms désignent les règles de comportement dans EXPERIENCE.md.

| Composant | Spécification visuelle |
|---|---|
| Barre d’action et de titre commune | Surface blanche, filet inférieur, contexte et commandes globales ; bande de 56 px partagée avec les contrôles Windows natifs, cibles de navigation et d’ouverture d’au moins 40 px. |
| Navigation latérale | Fond et dimensions du groupe `components.navigation` ; sélection lavande, graisse 600 ; rail à icônes, projets identifiables, infobulles sombres. |
| Bouton | Principal violet/blanc, secondaire blanc avec `{colors.control-line}`, discret sans fond. Arrondi `{rounded.md}`, retrait `{components.button.padding}` ; survol, pression, focus visible ; indisponibilité observée par opacité 0,5 avec explication accessible. |
| Ligne de projet ou d'attente | Liste plate, filets, libellé puis contexte et chemin ; repère de projet ou symbole d'attente, état à droite. La ligne entière exprime la même destination. |
| Onglets du projet | Parcours, Conversation, Toutes les possibilités ; sélection en graisse 600 et soulignement violet 2 px. Compteur compact uniquement lorsqu'une attente existe. |
| Recommandation | Titre, objectif, raison séparée par filet, action principale puis détails ; fond et retrait du groupe `components.recommendation`. Pas de surtitre décoratif avant le titre. |
| Groupe d'intentions | Ligne extensible avec icône, intention, contexte et chevron ; liste d'actions dans le retrait du contenu. Ni barre de progression ni numérotation obligatoire. |
| Catalogue des compétences | Champ de recherche bordé avec loupe, filtres compacts puis lignes plates ; nom, objectif et invocation monospace ; nombre de résultats textuel. |
| Fiche compétence | Dans le Dialogue : objectif, catégorie, invocation copiable, entrées, résultat et conditions ; action de lancement explicite en pied. |
| Indicateur d'état | Libellé dans un badge compact ou bandeau de session ; teinte selon Colors ; le statut reste lisible sans le point coloré. |
| Conversation | Identité de l'agent et fournisseur en tête, invocation monospace, messages à `{typography.conversation.lineHeight}` ; réponses humaines sur fond léger, sans masquer le contexte du projet. |
| Champ de réponse | Libellé visible, zone redimensionnable, minimum `{components.composer.minTextHeight}`, envoi explicite ; contour du conteneur au focus, ombre légère `{components.composer.shadow}`. |
| Proposition d'approbation | Groupe bordé, `{rounded.group}`, changement annoncé puis effets/fichiers et choix explicites ; séparation claire des messages ordinaires. |
| Récapitulatif de tour | Bloc sobre : fin de tour, résultat proposé, décision humaine, fichiers et prochaine action ; statut du workflow distinct. |
| Panneau de fichiers | Fond `{components.files.background}`, lignes sélectionnables, aperçu lisible, statut, provenance et chemin ; actions d'agrandissement et d'ouverture dans l'éditeur. |
| Diagnostic et initialisation | Colonne bornée à 680 px ; résultat de diagnostic puis prérequis, changements prévus et action de confirmation ; mêmes états sémantiques que le projet. |
| Dialogue | Largeur maximale `{components.dialog.maxWidth}` bornée par la fenêtre, fond blanc, rayon `{components.dialog.radius}` et ombre `{components.dialog.shadow}` ; titre et fermeture, contenu défilant, pied d'actions. |
| Notification | Fond `{components.notification.background}`, texte `{components.notification.text}`, rayon `{components.notification.radius}` et ombre `{components.notification.shadow}` ; message bref au bas du centre, sans recouvrir une décision durable. |

Amendement connexion locale du 24 octobre 2026 : le statut textuel Codex de la barre est remplacé par une seule cible de 40 px contenant le signe officiel ChatGPT de 21 px, grisé à froid, avec nom accessible et infobulle « Connexion Codex : [état] ». Le résultat vérifié utilise les tokens succès avec sa portée textuelle dans le panneau. Le panneau non modal est ancré sous la barre, à droite, largeur maximale 420 px bornée à la fenêtre, retrait 22 px, rayon 12 px et ombre douce décalée. Son titre, état, récupération et actions suivent la hiérarchie existante ; la couleur ne remplace aucun libellé. La première autorisation du forfait est rappelée dans un dialogue acquittable de 480 px maximum. Aucun autre choix de composition, thème ou langue n’est rouvert.

Retouche après essai du panneau : les actions sont alignées en une colonne, cibles de 40 px avec icônes de 17 px et libellés conservés. Une connexion déjà vérifiée propose la revérification sur un fond accent doux ; la reconnexion reste une ligne sans contour et la déconnexion utilise le texte atténué, avec un retrait vertical supplémentaire de 4 px. La première connexion et la vérification encore nécessaire gardent le bouton primaire. Les actions, leur ordre et leurs protections restent identiques.

Extension d’aide réseau du 24 octobre 2026 : lorsque le service est indisponible, une section sobre sous l’erreur conserve les tokens et la hiérarchie du panneau. Elle affiche la seule adresse publique des clés, en monospace et avec retour à la ligne possible, une cible de copie de 40 px avec SVG de 17 px, nom accessible/infobulle et focus visible, puis une ouverture textuelle dans le navigateur Windows. La confirmation accessible ou l’échec local reste près de l’adresse ; l’erreur réseau et l’aide ne disparaissent pas après copie. Aucun bloc n’est ajouté en état normal, aucune nouvelle carte ni modification des actions existantes.

## Do's and Don'ts

Amendement pilote Mary du 24 octobre 2026 : la composition, la navigation et la palette restent celles de la base française claire. Dans le projet, un bloc sobre identifie Mary, Codex, l’invocation et la consommation du forfait avant « Lancer Mary avec Codex ». Qualification et arrêt sont des actions distinctes. La conversation reprend les messages humains sur fond lavande léger et les réponses de Mary en lecture centrale, avec une largeur de lecture bornée ; un état textuel montre l’accusé, le travail et la fin du tour. L’activité et l’empreinte du profil sont consultables dans des détails. Le champ conserve son action d’enregistrement et ajoute « Envoyer à Mary » seulement pour la session capturée. La réduction de navigation et la fenêtre compacte conservent saisie et contexte. Le pilote ne remplace ni le catalogue ni les extensions de langue/thème encore attendues.

| Faire | Éviter |
|---|---|
| Garder état, preuve et prochaine action lisibles près de la conversation. | Un tableau de bord décoratif ou un pourcentage global déduit des fichiers. |
| Associer chaque état à un libellé et sa portée. | Un vert interprétable comme « tout est validé ». |
| Conserver les listes légères, les surfaces et les tokens communs. | Multiplier cartes, ombres, couleurs et petites exceptions typographiques. |
| Garder focus, infobulles clavier et mouvement réduit. | Des actions accessibles seulement au survol ou une activité pulsante. |
| Montrer les limites de la maquette et les intégrations futures. | Présenter les données simulées comme un diagnostic ou une exécution réelle. |
