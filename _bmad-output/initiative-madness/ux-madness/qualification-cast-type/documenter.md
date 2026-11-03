# Relevé documentaire — casting et police courante

3 novembre 2026. Impeccable Documenter, définition officielle et référence de format déjà chargées. Le relevé décrit la police et les sept éditions de casting présentes dans les sources du candidat. Le candidat runtime 0.2.3 ne désigne pas la story 2.3 et ne lance aucune story.

## Police constatée

La feuille [atelier-controls.css](../../../../src/renderer/src/atelier-controls.css) déclare Oxanium variable 200–800 avec font-display:swap et une ressource locale. La racine emploie Oxanium, Segoe UI, sans-serif, graisse 450 à 16 px ; les info-bulles reprennent Oxanium 450 à 14 px. Les titres et commandes conservent Barlow Condensed Bold 700 ; le code conserve Consolas/Cascadia. Aucun nouveau fournisseur de police n’est chargé au runtime.

La [provenance](../../../../resources/fonts/provenance.json) et la [licence SIL OFL1.1](../../../../resources/fonts/Oxanium-OFL.txt) sont présentes. Le fichier livré compte exactement 43 536 octets ; son SHA-256 a été calculé directement : 2ce01d946e1e1ffc8d7eecfffbda8623bedd63eaf811a20488c4b69af45babb0. Ces deux contrôles confirment la ressource annoncée, pas son rendu dans une application installée.

Les rôles body/message/label du frontmatter et les extraits de lecture du sidecar sont réconciliés avec Oxanium 450. La palette, la famille display et les monos restent inchangés. La largeur de message de 72 ch et les interlignes de message spécifiques 1,65–1,8 sont conservés ; le paragraphe général garde sa règle CSS 1,6 et les métadonnées 1,55. Le relevé n’uniformise pas ces variantes.

## Casting intégré et inspecté

Le documenteur a ouvert les sept PNG livrés : Mary, Sally, Amelia, Winston, John, Sofia et Smithy. Les contours noirs et ombres franches, les costumes asymétriques et les accessoires absurdes forment un ensemble cohérent, avec sept adultes distincts. Les objets vus correspondent aux rôles représentés : loupes et cartes de Mary, outils de couleur de Sally, mécanique et soudure d’Amelia, plans/maquette de Winston, mégaphone/cartes de John, fiches/tampon de Sofia, étau et clés de Smithy. Cette lecture des illustrations ne prouve aucune identité native ou activité.

La [provenance du casting v2](../../../../resources/atelier-cast-v2/provenance.json) a été lue, prompts compris. Elle relie les sept éditions ImageGen intégré à leurs originaux de la révision 1a7100c, avec Mary-v2 comme guide des six autres. Pour chaque asset, le documenteur a relu les dimensions PNG 1254 × 1254, le type couleur 6 (RGBA), la taille et recalculé le SHA-256 : sept sur sept correspondent au manifeste. Le fond alpha est présent ; l’inspection ne prétend pas mesurer tous les pixels de transparence. Le brief demandait trois tons ; le résultat observé associe aplats, hachures et texture, sans prétendre limiter l’image à trois couleurs numériques.

Les fichiers *-bust.png remplacent explicitement les originaux dans les sources du candidat. Les couleurs accessoires des illustrations ne sont pas ajoutées à la palette des commandes. Les portraits restent petits dans le dialogue et leur fiche garde son contrat local. Aucun fichier historique de qualification n’est réécrit ni attribué à ces nouvelles empreintes.

## Écritures

Seuls [PRODUCT.md](../../../../PRODUCT.md), [DESIGN.md](../../../../DESIGN.md), le [sidecar](../../../../.impeccable/design.json), le [contrat de surface](../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md) et ce rapport sont attribués au documenteur. Les paragraphes datés antérieurs de PRODUCT et les preuves de qualification antérieures sont conservés ; la décision du 3 novembre précise ce qui les actualise. Aucun fichier source, test, package ou AGENTS n’est édité par cette passe.

Vérification documentaire : liens locaux des cinq fichiers résolus, huit sections canoniques du DESIGN, sidecar JSON valide en schéma 2 avec dix composants et narration identique. Bloc couleurs strictement identique à son contenu avant cette passe. git diff --check sur les cinq fichiers retourne 0 ; seul l’avertissement de conversion LF/CRLF du sidecar accompagne la commande.

## Limites

Le parent signale neuf contrôles natifs type-initial réussis avec Oxanium 450 correctement chargée ; leurs six captures utilisent encore l’ancien casting et restent préliminaires. Ils ne sont pas attribués aux nouveaux portraits. Le parent confirme aussi le build 0.2.3 avec les sept nouveaux rasters réussi ; la matrice native-final 15, les tests UI ciblés et NSIS étaient encore en cours au relevé initial, avant le complément F1 ci-dessous. Aucun résultat de ces épreuves finales, paquet final, installation, acceptation humaine du rendu intégré, conformité WCAG globale ou ship n’est déduit du relevé. Les inconnues de provenance native, les gardes de lancement et les contrats de questions/approbations restent inchangés. Les fichiers historiques décrivent leurs candidats respectifs ; leurs résultats ne sont pas réattribués à 0.2.3.

## Complément F1 — récapitulatifs de conversation

La règle locale de atelier-immersion.css a été relue après correction : panneau à min-height:min-content, base flex 480 px conservée, details directs à flex:none, historique à flex:1 1 240px avec hauteur et minimum 240 px. Les libellés de summary gardent ainsi leur hauteur au lieu de se comprimer sur le statut. DESIGN et contrat de surface décrivent cette répartition ; PRODUCT et sidecar restent inchangés à ce complément, car ni engagement produit, ni token, narration ou extrait de composant autonome n’a changé.

Le parent signale la régression rouge conservée sous overlap-red, puis f1-recheck 15 réussi sur les mêmes 31 vues, sans chevauchement, avec saisie au premier écran et contrôle du zoom 200. Ces résultats sont ceux de sa qualification native ; le documenteur ne les réexécute pas et ne les étend pas à une suite globale. Le paquet doit être reconstruit après cette correction ; aucune installation ni ship n’est déduit.
