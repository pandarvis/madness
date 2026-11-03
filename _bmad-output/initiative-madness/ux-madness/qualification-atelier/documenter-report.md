# Impeccable documenter — atelier intégré

Date : 2 novembre 2026. Substitut technique frais ; définition officielle `impeccable_documenter.toml` et `reference/document.md` lus intégralement par ce documenteur. Aucun rôle spécialisé natif prétendu.

## Résultat

Création du `DESIGN.md` racine et du sidecar `.impeccable/design.json` schemaVersion2 : les deux étaient absents. Pas de remplacement d’un système racine ni de nouvel entretien : métaphore, matériaux, thèmes et casting sont déjà autorisés par le handoff humain et le contrat de surface. Ajout limité à Brand Commitments de `PRODUCT.md`, reliant la direction2novembre à la norme visuelle actuelle ; paragraphes historiques conservés. Les spines imbriqués restent sous la responsabilité Sally, coordonnée séparément.

Frontmatter :78couleurs exactes clair/sombre, neuf rôles typographiques, formes/espacements observés et15variantes de composants. Seuls les groupes du schéma sont utilisés ; les composants restent dans les huit propriétés admises et leurs références sont résolubles. Sidecar : extensions, dix extraits autonomes HTML/CSS à variables de thème actives avec replis, SVG inline, états utiles et narrative issue du Markdown. Rampes OKLCH synthétiques en huit pas, explicitement non des couleurs supplémentaires livrées.

## Système en cinq lignes

1. Palette : anthracite/ivoire de lecture, terracotta d’action, bleu de lien/focus, plaques pétrole et états textuels.
2. Typographie : Barlow Condensed Bold locale pour titres/noms ; Segoe UI pour messages/décisions ; Consolas pour sources et chemins.
3. Composition : dialogue central ; rail rétractable ; fiche320/350px dockée dès1323px, modale en dessous ; largeur rendue à la fermeture.
4. Matière : cadre raster nine-slice128/36px/outset17px sans fill ; centres calmes, focus et contrôles au-dessus du décor.
5. Règles : Quiet Reading, Explicit State, Two Voices, Empty Center ; identité attestée seulement, sept rôles descriptifs, fiche locale et notifications persistantes.

## Preuves et limites

Candidat `dist/atelier-review-fixed`, version0.2.1 annoncée par le propriétaire. ASAR lu et haché ici : `486cfe44e26256729617b661bdd48e657a3d520c1efa77f21adfe180feaf3118`. Les captures correctives sont pilotées par le parent sous `.impeccable/review/atelier-review-fixed` ; cette passe ne les produit ni ne s’en attribue l’inspection. Les24anciennes captures de `qualification-atelier/captures` et leur revue portent l’ASAR`fa413388…` : aucune attribution au nouveau candidat, aucune validation visuelle/fournisseur/humaine/WCAG déduite. La documentation n’annonce pas2.2built.

Sources : contrat de surface, PRODUCT, handoff/préparation approuvés, styles/help, App, AgentInfoPanel, AgentPortrait, registre agentPresentation, manifeste/provenance des assets. Les gardes2.17/2.2, brouillons, demandes et inconnue sont conservés ; aucune capacité supplémentaire. Les attentes/récupérations restent consultables et les entrées inactives deviennent explicitement historiques.

Non canonisé :35pixels centraux à alpha1/255 subsistent dans le raster source. Cette limite de production n’est pas un style futur ; le centre nine-slice est omis. Carte QUALITY BAR indisponible ; la documentation n’invente ni mesure de rendu ni plafond atteint. Aucun défaut de finition ouvert transformé en token.

Empreintes SHA-256 des sources lues :

- `src/renderer/src/styles.css` : `6e890cd801f2e686f6e054e5957ad09617356a97a8fb32d5f54a81800f04fab3`.
- `src/renderer/src/help.css` : `7b5401902dc636eb547a30f911ecabefe438b3f887fe4322c6cbafe147e99c1b`.
- `src/renderer/src/AgentInfoPanel.tsx` : `ed3800f2c8b0dc9010639315981cb5ca62a3b992230169b88f30285befd88979`.
- `src/renderer/src/agentPresentation.ts` : `bf73185c548f84984c078adf75b4a7ae91c0d4dfa2aa53da80ab80907619358f`.
- `src/renderer/src/AgentPortrait.tsx` : `2bf0d3a8ef3b3b047ccee19e26035646370e390a9f4c16f6edb060a09a4ede02`.
- `src/renderer/src/App.tsx` : `d89a27adca1cdc529200e725a1cc184f3510663f7a1e7367716fbea2331e3138`.
- `notices/atelier-assets.json` : `d6bc6b018c08162e1b8f42ce364a43caa442f9f720def36d2b41e86afec8a774`.
- `notices/atelier-provenance/material.json` : `62c2ca9b2aa190d54cbcf93982156b6089c157a66d0a63def57c79ff1233cc7c`.

## Contrôle documentaire

Contrôle statique final réussi avec le parseur `js-yaml` déjà installé et des assertions correspondant au schéma de `reference/document.md` :78couleurs exactes, neuf typographies,15variantes, dix snippets, quatre règles et huit sections canoniques ; références, palette source, liens locaux et narrative concordants. Ce n’est pas une exécution du linter externe Stitch. Une première assertion du vérificateur comptait les accolades structurelles du JSON comme références ; elle a été corrigée sans changement documentaire, puis le contrôle entier est passé. Aucun test ou rendu produit réexécuté.

Fichiers écrits : `DESIGN.md`, `.impeccable/design.json`, seule section Brand Commitments de `PRODUCT.md`, ce rapport. Aucun source/runtime/test/asset/build/capture modifié ; aucun appel modèle/navigateur/compte, installation, staging ou commit.
