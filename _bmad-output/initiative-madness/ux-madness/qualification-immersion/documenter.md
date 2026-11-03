# Relevé documentaire — extension interactive de l’atelier

Date : 2 novembre 2026. Passe Impeccable Documenter en extension code-led du monde existant. La définition officielle `agents/impeccable_documenter.toml` et `reference/document.md` ont été lues. L’autorité est la direction atelier déjà approuvée et le candidat implémenté ; cette passe réconcilie les documents existants, sans nouveau choix d’identité visuelle.

## Sources relevées

- [PRODUCT.md](../../../../PRODUCT.md), [DESIGN.md racine](../../../../DESIGN.md), [sidecar](../../../../.impeccable/design.json) et [contrat de surface](../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md).
- [Référence approuvée](../atelier-agents-2026-11-02/atelier-reference-approuvee.png), [handoff](../atelier-agents-2026-11-02/handoff.json) et [provenance héritée](../atelier-agents-2026-11-02/images-provenance.json).
- [main.tsx](../../../../src/renderer/src/main.tsx), [styles.css](../../../../src/renderer/src/styles.css), [atelier-immersion.css](../../../../src/renderer/src/atelier-immersion.css) et le composant `MessageArticle` dans [App.tsx](../../../../src/renderer/src/App.tsx).
- Lots de qualification distincts : [round2](./round2/), [review-f1](./review-f1/), [review-author](./review-author/) et [presentation-author](./presentation-author/). Leur existence est vérifiée ; leurs captures et observations restent les preuves de leurs essais, pas une nouvelle qualification exécutée par le documenteur.

## Concordance avec le candidat

`main.tsx` importe la couche atelier après `styles.css`. Cette couche ne déclare aucune propriété personnalisée, ne charge aucune police et réutilise le raster `chrome-plate-frame.png`. La palette pétrole/terracotta/ivoire, Barlow Condensed et Segoe UI restent celles du monde établi.

Le centre de travail reprend les cartouches, les arêtes et les cadres sans couvrir les fonds de lecture. Le cartouche de message est conditionné par la présence du déclencheur de portrait de l’auteur attesté reconnu. Le nom et la source restent du texte HTML ; le nom attesté hors casting et l’identité inconnue conservent leurs contrats. L’en-tête d’auteur sticky est borné par l’article, et la source exacte reste après le message.

Le cadre raster de saisie emploie une bande de 22 px, un débord de 7 px et une marge latérale de 7 px ; son centre reste sans `fill`. Les messages assistant reçoivent un panneau calme bordé et un petit rappel de coin. Les onglets gardent leurs vrais boutons et leur focus entier, avec une hauteur minimale de 44 px. Les décisions principales et secondaires gardent une cible minimale de 40 px et adoptent le rayon de surface de 3 px.

En l’absence de question ou d’approbation active, le dialogue emploie la hauteur restante par flex ; l’historique absorbe l’espace et le compositeur garde son champ et son action dans le flux. Les formulaires actifs, y compris longs, gardent le flux naturel de page. Cette distinction remplace dans la documentation l’ancienne borne unique `min(36vh, 380px)` ; elle ne crée aucun nouvel état métier ni nouvel envoi implicite.

## Documents écrits

- `DESIGN.md` : extension du centre de travail, scroll et sticky par article, variantes de géométrie, cadre de saisie et valeurs de composants observées. Les blocs normatifs de couleur et de typographie sont strictement identiques à leur contenu avant cette passe.
- `.impeccable/design.json` : narration recopiée du DESIGN, règle du centre de travail, ombre de saisie et extraits autonomes des composants concernés. Dix composants conservés ; aucun raster importé dans les extraits du panneau. L’extrait de saisie indique explicitement cette limite et renvoie au cadre décrit dans le DESIGN.
- `.impeccable/surfaces/src-renderer-src-app-tsx.md` : cibles liées, direction de l’extension, première fenêtre et distinction dialogue ordinaire/demandes actives.
- Le présent rapport.

## Vérifications et limites

Les huit sections canoniques du DESIGN restent dans l’ordre attendu. Le sidecar reste en schéma 2 ; son overview correspond au DESIGN. Aucun token de couleur ou de typographie n’a été ajouté ou modifié. Les anciennes descriptions du trait entre messages, de la plaque de saisie de 2 px et du scroll unique ont été réconciliées avec la cascade réellement chargée.

Les anciennes déclarations CSS surchargées ne sont pas érigées en règles du système. Les variantes compactes sont documentées comme variantes de cette surface, sans devenir une nouvelle échelle globale. Aucun nouveau raster, promptscan ou relevé de provenance n’est créé : les assets et leur provenance sont hérités.

À l’entrée de cette passe, le parent avait confirmé types/build et sept contrôles d’apparence réussis, la matrice de quatorze contrôles après correction du cadre puis du défaut vertical F1, ainsi que le verdict F1 résolu. La régression d’auteur avait été corrigée par le sticky et sa revue restait en cours ; `presentation-author` était également en cours. Le documenteur ne réexécute pas ces essais et ne prononce pas leur verdict. Cette passe ne revendique ni ship, ni nouvelle suite globale réussie, ni story 2.2 built, ni validation humaine du rendu intégré.
