# Documentation du correctif de commandes atelier

3 novembre 2026 — candidat source 0.2.2, monde atelier existant. La définition officielle Impeccable Documenter et son reference/document.md ont été relus. Cette passe réconcilie les documents avec le code chargé, sous le mandat de correction après rejet humain ; elle ne constitue pas une nouvelle approbation du rendu.

## Autorité et sources

Le [retour humain](./user-feedback.png) a été inspecté : aide surdimensionnée horizontalement, textes et commandes trop petits et génériques. La direction atelier approuvée reste celle de la [référence du 2 novembre](../atelier-agents-2026-11-02/atelier-reference-approuvee.png) et de PRODUCT.md. Le relevé porte sur [main.tsx](../../../../src/renderer/src/main.tsx), styles.css, atelier-immersion.css, la nouvelle [atelier-controls.css](../../../../src/renderer/src/atelier-controls.css), help.css et les documents existants. La capture [aide claire 1440](./visual-final/help-controls-light-1440.png) a également été inspectée ; les autres captures et essais restent sous leurs reçus propres.

## Concordance réconciliée

- Cascade : styles, immersion, puis controls ; version 0.2.2 confirmée dans package.json. Aucune nouvelle famille de police, primitive de palette ou illustration. Les paramètres locaux control-face/control-ink référencent les couleurs existantes ; ils ne créent pas de nouvelle palette.
- Commandes : Barlow Condensed Bold 19 px, hauteur minimale 44 px, deux polygones plats à coins coupés de 6 px. Le bouton réel et son focus restent entiers. États principal, secondaire, action textuelle et indisponible documentés ; texte désactivé à opacité pleine. Utilitaires à icône conservés à 40 px et axe 28 px.
- Lisibilité : corps/messages/saisie 16 px, métadonnées et portée de connexion 14 px ; aucune nouvelle fonte chargée. Les variantes spécifiques, dont l’interligne assistant 1,8, restent explicites.
- Largeur : centre 100 % sans borne maximale ; espaces horizontaux 28 / 22 / 16 px, exception de fiche dockée 24 px. Aide sur deux colonnes préparation/diagnostic-provenance, puis une colonne sous 1081 px. Aucune garde nativeReady, permission, transmission ou donnée métier modifiée par cette passe documentaire.
- Matière : cadres navigation/tiroir/fiche réduits à 16 px avec outset 6 px ; saisie 12 px avec son débord 7 px hérité, sans centre rempli. Aucun raster ajouté ; les provenances existantes restent applicables.
- Projets : SVG dossier dans la navigation et à l’accueil, sans numéro décoratif. Barre : titre seul déplaçable ; groupes/parents/boutons/descendants/pseudo-éléments no-drag. Info-bulle Codex masquée lorsque la connexion est ouverte.

## Écritures et contrôles

DESIGN.md conserve ses huit sections canoniques et son bloc couleurs intact. Les rôles typographiques et valeurs des composants sont mis à jour depuis la cascade ; les anciennes bornes de 1160 px, marges de 38 / 52 px, bandes de 36 px / outset de 17 px et opacité désactivée 0,5 ne sont plus prescrites. Le sidecar reste en schéma 2 avec dix extraits autonomes ; sa narration, ses règles et ses listes sont synchronisées avec le DESIGN. Aucun raster n’est importé dans les extraits du panneau. Le contrat de surface conserve les inconnues et les comportements métier, et référence ce lot.

Seuls DESIGN.md, .impeccable/design.json, .impeccable/surfaces/src-renderer-src-app-tsx.md et ce rapport sont modifiés par le documenteur. Aucun fichier source, test, paquet ou AGENTS.md n’est édité par cette passe.

## Portée des preuves

À l’entrée de cette passe, le parent signalait types/build, huit contrôles d’aide et quatorze contrôles de matrice réussis sur l’état antérieur aux petites corrections F1/F2. Le défaut de chevauchement avait été reproduit avec huit rectangles, puis ramené à zéro avec quatre actions renderer réussies. Cela vérifie la géométrie et les actions renderer ; une injection physique Windows n’a pas été démontrée, l’essai CUA ayant expiré. Cette limite reste entière.

La suite UI complète et le retest de l’onglet de 44 px restaient en cours à l’entrée du documenteur, après l’échec 46 > 44. Les lots [matrix-final](./matrix-final/) et [visual-final](./visual-final/) restent distincts de la validation finale du parent. Aucun nouveau global vert, ship, installation, validation visuelle humaine globale ou story 2.2 built n’est déduit de la documentation. Vérification documentaire finale : tous les liens locaux des quatre fichiers résolvent, JSON valide, narration identique au DESIGN et bloc de couleurs strictement conservé. `git diff --check` sur les fichiers attribués retourne 0 ; Git a signalé son fsmonitor indisponible et la conversion LF/CRLF du sidecar, sans constat d’espace fautif. Les anciennes déclarations CSS surchargées ne sont pas canonisées ; les contrats de provenance, de demande explicite et les inconnues restent conservés.

## Complément de cascade des onglets

La feuille controls reprend désormais le sélecteur spécifique de Conversation : les onglets emploient 21 px au format courant, 20 px sous 721 px et une hauteur minimale de 44 px dans les deux contextes. Le sélecteur et sa variante responsive ont été relus dans le CSS ; la réserve sur l’ancienne taille de 18 px est levée dans les documents. Le parent confirme un build 0.2.2 réussi après correction. Aucun verdict de retest UI ou de qualification finale supplémentaire n’est déduit de cette mise à jour.
