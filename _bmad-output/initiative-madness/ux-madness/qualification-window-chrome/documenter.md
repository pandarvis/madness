# Documentation du chrome de fenêtre

3 novembre 2026 — candidat logiciel 0.2.5, distinct des stories. Passe Impeccable Documenter : réconciliation depuis le code courant, sans nouvelle direction de palette, de fonte, de casting ou de rail.

## Sources et inspection

Les sources [WindowCaptionPlates.tsx](../../../../src/renderer/src/WindowCaptionPlates.tsx), [Main/index.ts](../../../../src/main/index.ts) et la fin de [atelier-controls.css](../../../../src/renderer/src/atelier-controls.css) ont été lues. Les quatre photos Windows ont été ouvertes : [clair normal](./native-window-light-normal.jpg), [clair maximisé](./native-window-light-maximized.jpg), [sombre normal](./native-window-dark-normal.jpg), [sombre maximisé](./native-window-dark-maximized.jpg). Elles montrent les plaques sous les symboles natifs ; elles ne sont pas une mesure de clic ou une qualification autonome de tous les états d’accessibilité.

Le [relevé de navigation](../qualification-navigation/parent-verification.md) confirme le lot 0.2.4 installé et son remplacement contrôlé. Le contrat de surface mentionne désormais ce statut et le commit fd78875, au lieu d’un simple candidat source. La validation humaine de la typographie/casting 0.2.3 reste acquise ; aucune validation humaine 0.2.5 n’est déduite.

## Concordance

Trois span décoratifs aria-hidden, sans handlers d’action, forment les plaques. Le composant ne rend rien si Window Controls Overlay n’est pas visible et suit geometrychange. Les variables env de géométrie positionnent le décor et partagent l’espace natif disponible en trois colonnes ; aucune largeur de commande de 46 px n’est postulée. Les coupes et contours sont proportionnels à la hauteur native, avec un contour d’une unité, soit 1 px à la référence 56 px. Le calque et ses pseudo-éléments sont sans pointeur et hors drag.

Main conserve les symboles, zones de clic et routine de fermeture Windows. Le fond titleBarOverlay est transparent hors contraste élevé ; le fond natif revient si shouldUseHighContrastColors est vrai. En forced-colors, le calque CSS est retiré. Le relevé décrit ces branches présentes dans le code, sans annoncer une nouvelle qualification physique du mode contraste élevé. Aucun faux bouton HTML de fenêtre, nouvel IPC ou nouvelle action métier n’est introduit.

Les checkbox/radio restent de vrais inputs 20 × 20 px, bord 1 px, marque checked/mixte/point distincte, focus 2 px décalé de 3 px et disabled à opacité 0,65. En forced-colors, appearance:auto, fond/bord revert et retrait des marques décoratives rendent la main aux contrôles natifs. Le sidecar inclut un spécimen autonome de ces inputs, sans action métier ; le pseudo-état :indeterminate est couvert par son CSS et non simulé au moyen d’un faux attribut HTML. Le calque caption est documenté comme règle ; aucun faux contrôle de fenêtre interactif n’est créé dans le panneau de design.

## Écritures

- [DESIGN.md racine](../../../../DESIGN.md) : candidat 0.2.5, composant caption natif et inputs de choix, règle de conservation des actions Windows.
- [.impeccable/design.json](../../../../.impeccable/design.json) : narration synchronisée, règle native et spécimen de choix ; schéma 2, onze composants. Les primitives de palette et de typographie restent inchangées.
- [Contrat de surface](../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md) : nouvelle surface native et statut installé de la navigation 0.2.4.
- [Spine UX DESIGN](../DESIGN.md) : règle des commandes natives et des vrais choix, retrait de l’ancienne interdiction du logo de rail, usage actuel du cadre sur fiche 16 / 6 ; contrats métier et histoires préservés.
- Le présent rapport.

Les autres valeurs visuelles historiques du spine, notamment sa typographie Segoe 14, ne sont pas migrées par cette passe. Elles ne sont ni reprises comme nouvelle règle ni utilisées pour modifier le produit ; le DESIGN racine porte le système visuel courant. Aucun reçu parent, source, test, package ou AGENTS n’est édité par le documenteur. Aucun nouveau raster, prompt ou provenance d’image livrée n’est nécessaire : les plaques sont du CSS et les photos sont des preuves.

## Preuves et limites

Le parent confirme build/types, sept contrôles d’apparence, un contrôle de barre, onze natifs et dix-sept de matrice, dans les deux thèmes et au zoom 200. Il indique les actions physiques sombres réduire/restaurer/maximiser/démaximiser/fermer enregistrées. Le défaut du banc lié à app.process disposed a été corrigé par capture de l’enfant, avec régression 4/4 et fermeture 5/5 ; le produit est resté intact dans cette correction du banc. Le documenteur ne réexécute ni n’élargit ces qualifications.

La revue indépendante est en cours au relevé ; paquet et installation du candidat restent à venir. Aucun succès de ces étapes, ship, story 2.2 built, M14 résolu, conformité WCAG globale ou accord humain 0.2.5 n’est revendiqué.

Vérification documentaire finale : tous les liens locaux des cinq fichiers résolvent ; huit sections canoniques dans le DESIGN racine, sidecar JSON valide en schéma 2 avec onze composants, overview identique. Les blocs normatifs de palette et typographie du DESIGN racine sont strictement identiques à leur contenu avant cette passe. git diff --check sur les cinq chemins retourne 0, accompagné seulement des avertissements de conversion LF/CRLF.
