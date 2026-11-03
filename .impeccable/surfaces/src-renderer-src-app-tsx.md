---
version: 1
slug: "src-renderer-src-app-tsx"
primary_target: "src/renderer/src/App.tsx"
related_targets: ["src/renderer/src/styles.css","src/renderer/src/atelier-immersion.css","src/renderer/src/atelier-controls.css","src/renderer/src/main.tsx","src/renderer/src/HelpPanel.tsx","src/renderer/src/help.css","src/renderer/src/AgentInfoPanel.tsx"]
---

# Espace de travail Madness

Mode: Operate. Surface: application locale Windows/Electron, projets, parcours et conversation. Public: le porteur développeur, en séances longues ; sombre anthracite par défaut sous éclairage de bureau et clair alternatif pour la lumière ambiante forte.

## Direction contract

THESIS: Un atelier illustré où le projet, le dialogue, l’action attendue et leurs preuves se lisent immédiatement ; une conversation ample dans un cadre de travail reconnaissable qui se prolonge jusque dans le centre de travail.

OWN-WORLD: Anthracite chaud et ivoire dans les zones de lecture, plaques bleu pétrole, commandes/cartouches terracotta, contours encrés et angles coupés. Matière peinte mate et usure retenue dans le chrome. Barlow Condensed Bold locale pour titres courts et commandes ; Oxanium variable locale, graisse 450, pour messages, explications et métadonnées ; Segoe UI en repli, code monospace conservé. Bustes originaux édités en casting v2, expressions théâtrales et accessoires de rôle décalés ; décors natifs séparés et SVG géométriques sobres pour les commandes.

STORY: Retrouver le projet, lire le dialogue et les demandes corrélées, répondre explicitement. Reconnaître un auteur seulement depuis sa preuve ; ouvrir sa fiche pour comprendre le rôle puis la refermer. Chargement, transmission, conservation et inconnue restent distincts.

FIRST VIEWPORT: Barre native56px, rail rétractable sur axe28px et navigation environ240px en mode large. Projet/onglets puis conversation centrale sur toute la largeur disponible, texte de travail16px et métadonnées14px, lignes65–75ch, portraits40px réservés. CommandesBarlow70019px sur plaques encrées à deux couches ; onglets à 21 px, 20 px sous 721 px, y compris dans Conversation, avec cibles de 44 px minimum. Fiche de rôle autour de320px à droite seulement à la demande ; fermeture rend l’espace au dialogue. Bandeau d’atelier mesuré dans le contexte, réduit aux tailles étroites/zoom ; cartouches des auteurs attestés reconnus et en-tête sticky borné par article, source exacte après le texte. Messages assistant encadrés sur fond calme, saisie et commande ensemble dans la fenêtre pour le dialogue ordinaire grâce au flex ; demandes longues conservées dans le flux naturel. Commande d’ouverture unique à icône40px. Les messages, sources et boutons sont du HTML réel.

FORM: Extension code-led et raffinement de la composition établie, palette et famille display conservées. Le mandat du 3 novembre autorise Oxanium locale pour le texte courant et les éditions des sept bustes, sans créer de nouvelle identité métier. Atelier déjà fixé par le porteur, référence atelier-reference-approuvee.png et handoff du2novembre. Préférence code-led existante copiée depuis .impeccable/config.json. Seed09fa5971, affectation5, deux appels escaladés dégradés : catalogue/QUALITY BAR indisponibles, aucun challenger. L’affectation est reconnue ; la direction expressément approuvée prime et l’image sert de référence critique, conformément au chemin code-led et au handoff qui laisse les pixels/composants à décliner. Interaction signature : fiche de l’auteur qui s’ouvre depuis le message et rend sa largeur à la fermeture, sans appel métier ; mouvement court avec réduction respectée. Aucun nouveau tour de choix ni comp produit.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Contraintes

Conserver préparation/envoi, questions/accords, brouillons, récupération, identités inconnues et comportements2.17/2.2. Cette refonte ne clôt pas la qualification native2.2 ni ne livre2.3. Pas de bouton ou fichier fictif de la maquette. La couleur native peut suivre les tokens ; stockage, permissions et connexion restent hors de ce lot.

## Extension interactive — 2 novembre 2026

`main.tsx` charge `atelier-immersion.css` après `styles.css`. Cette couche prolonge les plaques, cartouches et cadres dans le travail central ; elle réutilise les tokens et `chrome-plate-frame.png` existants. Le cadre de saisie garde un centre non rempli, un débord et une marge de 7 px ; la dernière couche réduit sa bande à 12 px. Les petites vignettes restent réservées aux auteurs attestés reconnus ; le sticky ne change ni l’identité ni la source, et s’arrête avec son article. La fiche et son focus conservent leur contrat local.

La mise en page ajustée à la fenêtre s’applique seulement en l’absence de formulaire de question ou d’approbation actif : récapitulatifs directs à hauteur naturelle sans compression flex, panneau au minimum de contenu, historique flexible à base/hauteur minimale de 240 px, compositeur et action dans le flux. Les formulaires actifs gardent toute leur hauteur et le défilement naturel de page. Les mesures de `round2/`, `review-f1/` et `review-author/` sont des preuves de candidat distinctes ; le présent relevé ne vaut ni ship, ni validation humaine du rendu intégré, ni story 2.2 built. Voir [documenter](../../_bmad-output/initiative-madness/ux-madness/qualification-immersion/documenter.md).

## Correction des commandes — 3 novembre 2026

Le [retour humain](../../_bmad-output/initiative-madness/ux-madness/qualification-controls/user-feedback.png) rejette les commandes génériques, le texte trop petit, l’espace peu utilisé et les cadres trop grossiers. Le candidat 0.2.2 conserve le monde atelier et charge `atelier-controls.css` après les deux feuilles existantes. La dernière couche fournit des commandes à deux polygones encrés à coins coupés de 6 px, avec un bouton réel et un focus entiers ; le principal, le secondaire, l’action textuelle et l’état indisponible restent distincts. Aucune fonction ou garde native n’est ajoutée.

Le centre occupe 100 % de la largeur disponible sans borne maximale : marges internes de 28 px, puis 22 px sous 1081 px et 16 px sous 721 px ; la fiche dockée conserve son cas spécifique à 24 px. L’aide met la préparation à gauche et le diagnostic/provenance à droite, puis devient une colonne sous 1081 px. Les cadres de navigation/tiroir/fiche emploient une bande de 16 px et un débord de 6 px. Un SVG de dossier remplace les numéros décoratifs des projets.

La barre réserve le déplacement à son titre ; parents de commande, groupes, boutons, descendants et pseudo-éléments sont en no-drag. Ses utilitaires restent40px et l’axe28px. L’info-bulle Codex disparaît lorsque la connexion est déployée ; les explications de portée restent à14px. Les contrôles de rectangles et actions renderer ne valent pas une injection Windows physique réussie. Voir [documenter du lot](../../_bmad-output/initiative-madness/ux-madness/qualification-controls/documenter.md) ; aucune qualification métier2.2 ni validation visuelle humaine globale n’en est déduite.

## Casting et lecture — 3 novembre 2026

Le candidat runtime 0.2.3 est distinct de la story 2.3, qui n’est pas lancée par ce lot. Oxanium variable200–800 est locale, chargée en swap : corps et messages16px/graisse450, petits textes et info-bulles14px, repliSegoe UI. Les titres et commandes Barlow700, le code Consolas/Cascadia, la palette et la géométrie de lecture sont conservés. Messages72ch maximum et interlignes spécifiques1,65–1,8 restent des règles de lecture ; la matière et les visages ne couvrent pas le texte.

Les sept éditions ImageGen sont demandées depuis les originaux et un guide Mary : encrage/contours plus francs, trois tons, expressions exagérées, costumes asymétriques et accessoires absurdes liés au rôle, mêmes sept adultes reconnaissables et fond alpha. Les sept bustes source intégrés ont été inspectés et leurs empreintes vérifiées avec la [provenance v2](../../resources/atelier-cast-v2/provenance.json) : PNG RGBA de 1254 × 1254 px, édition depuis la révision1a7100c et guideMary pour les six autres. Les portraits restent petits dans le dialogue et les fiches locales ; aucune activité native ne se déduit du nouveau dessin. Voir [documenter du lot](../../_bmad-output/initiative-madness/ux-madness/qualification-cast-type/documenter.md).

## Validation humaine — 3 novembre 2026

Après livraison de la version0.2.3, le porteur répond explicitement « JE VALIDE ». La typographie Oxanium/Barlow et les sept personnages du casting v2 deviennent la référence visuelle confirmée des prochaines itérations. [Reçu et portée](../../_bmad-output/initiative-madness/ux-madness/qualification-cast-type/human-approval.json). Les limites techniques et les statuts métier restent ceux de leurs preuves distinctes.
