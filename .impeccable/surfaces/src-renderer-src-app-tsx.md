---
version: 1
slug: "src-renderer-src-app-tsx"
primary_target: "src/renderer/src/App.tsx"
related_targets: ["src/renderer/src/styles.css","src/renderer/src/atelier-immersion.css","src/renderer/src/main.tsx","src/renderer/src/HelpPanel.tsx","src/renderer/src/help.css","src/renderer/src/AgentInfoPanel.tsx"]
---

# Espace de travail Madness

Mode: Operate. Surface: application locale Windows/Electron, projets, parcours et conversation. Public: le porteur développeur, en séances longues ; sombre anthracite par défaut sous éclairage de bureau et clair alternatif pour la lumière ambiante forte.

## Direction contract

THESIS: Un atelier illustré où le projet, le dialogue, l’action attendue et leurs preuves se lisent immédiatement ; une conversation ample dans un cadre de travail reconnaissable qui se prolonge jusque dans le centre de travail.

OWN-WORLD: Anthracite chaud et ivoire dans les zones de lecture, plaques bleu pétrole, commandes/cartouches terracotta, contours encrés et angles coupés. Matière peinte mate et usure retenue dans le chrome. Barlow Condensed Bold locale pour titres courts ; Segoe UI pour messages et décisions. Bustes originaux, décors natifs séparés et SVG géométriques sobres pour les commandes.

STORY: Retrouver le projet, lire le dialogue et les demandes corrélées, répondre explicitement. Reconnaître un auteur seulement depuis sa preuve ; ouvrir sa fiche pour comprendre le rôle puis la refermer. Chargement, transmission, conservation et inconnue restent distincts.

FIRST VIEWPORT: Barre native56px, rail rétractable sur axe28px et navigation environ240px en mode large. Projet/onglets puis conversation centrale, texte65–75ch, portraits40px réservés. Fiche de rôle autour de320px à droite seulement à la demande ; fermeture rend l’espace au dialogue. Bandeau d’atelier mesuré dans le contexte, réduit aux tailles étroites/zoom ; cartouches des auteurs attestés reconnus et en-tête sticky borné par article, source exacte après le texte. Messages assistant encadrés sur fond calme, saisie et commande ensemble dans la fenêtre pour le dialogue ordinaire grâce au flex ; demandes longues conservées dans le flux naturel. Commande d’ouverture unique à icône40px. Les messages, sources et boutons sont du HTML réel.

FORM: Extension code-led et raffinement de la composition établie, sans nouveau monde, palette, police ou raster. Atelier déjà fixé par le porteur, référence atelier-reference-approuvee.png et handoff du2novembre. Préférence code-led existante copiée depuis .impeccable/config.json. Seed09fa5971, affectation5, deux appels escaladés dégradés : catalogue/QUALITY BAR indisponibles, aucun challenger. L’affectation est reconnue ; la direction expressément approuvée prime et l’image sert de référence critique, conformément au chemin code-led et au handoff qui laisse les pixels/composants à décliner. Interaction signature : fiche de l’auteur qui s’ouvre depuis le message et rend sa largeur à la fermeture, sans appel métier ; mouvement court avec réduction respectée. Aucun nouveau tour de choix ni comp produit.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Contraintes

Conserver préparation/envoi, questions/accords, brouillons, récupération, identités inconnues et comportements2.17/2.2. Cette refonte ne clôt pas la qualification native2.2 ni ne livre2.3. Pas de bouton ou fichier fictif de la maquette. La couleur native peut suivre les tokens ; stockage, permissions et connexion restent hors de ce lot.

## Extension interactive — 2 novembre 2026

`main.tsx` charge `atelier-immersion.css` après `styles.css`. Cette couche prolonge les plaques, cartouches et cadres dans le travail central ; elle réutilise les tokens et `chrome-plate-frame.png` existants. Le cadre de saisie garde un centre non rempli, un débord et une marge de 7 px. Les petites vignettes restent réservées aux auteurs attestés reconnus ; le sticky ne change ni l’identité ni la source, et s’arrête avec son article. La fiche et son focus conservent leur contrat local.

La mise en page ajustée à la fenêtre s’applique seulement en l’absence de formulaire de question ou d’approbation actif : historique flexible, compositeur et action dans le flux. Les formulaires actifs gardent toute leur hauteur et le défilement naturel de page. Les mesures de `round2/`, `review-f1/` et `review-author/` sont des preuves de candidat distinctes ; le présent relevé ne vaut ni ship, ni validation humaine du rendu intégré, ni story 2.2 built. Voir [documenter](../../_bmad-output/initiative-madness/ux-madness/qualification-immersion/documenter.md).
