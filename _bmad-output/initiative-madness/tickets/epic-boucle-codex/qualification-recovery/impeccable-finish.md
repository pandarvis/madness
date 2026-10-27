# Finition Impeccable 1.7 — constat documentaire

Rapport écrit : `_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-recovery/impeccable-finish.md`. Aucun changement à `DESIGN.md`, aux sidecars ou au produit. Agent technique frais documenter, définition officielle `agents/impeccable_documenter.toml` et référence `reference/document.md` lues intégralement ; aucun persona Sally.

Sources contrôlées : `PRODUCT.md` ; `_bmad-output/initiative-madness/ux-madness/DESIGN.md` ; `src/renderer/src/styles.css`, `RecoveryPanel.tsx`, `NetworkHelp.tsx`, `strings.ts` ; points d’intégration et composants échantillonnés dans `App.tsx` ; `implementation-validation.md`, `impeccable-finish-input.md` et `impeccable-review-initial.md` dans le présent dossier. Les valeurs ci-dessous proviennent du CSS et des composants, rapprochés du contrat existant.

## Système constaté — cinq lignes

1. **Palette** : sombre anthracite (`#211F1E`), navigation (`#191817`), panneaux (`#272423`), action terracotta (`#E49B7A`), liens/focus bleus (`#9DC7E1`) ; clair blanc/lavande/violet conservé en alternative.
2. **Typographie** : Segoe UI et replis système ; titres 26/19 px, paragraphes 13 px à 1,65, contexte 12 px, code Consolas/Cascadia Code 12 px ; titre d’opération à 1 rem, soit 14 px dans ce renderer.
3. **Composition** : Parcours guidé et navigation existants ; récupération dans le flux, filets 1 px et rythme 12/20/24 px ; actions réseau repliables à la largeur disponible et chemins sécables.
4. **Contrôles et profondeur** : secondaires bordés avec rayon 8 px, copie SVG à cible 40 px, focus 2 px décalé de 3 px ; aucune nouvelle carte ni ombre de récupération, détails de fichiers repliés.
5. **Règles de lecture** : état, preuve et action voisins ; couleur toujours accompagnée de texte ; inspection locale distincte du résultat natif historique inconnu, nouveau départ explicite, contrôle réseau distinct de Codex et sans modèle.

## Dérives non canonisées

Le contrat incumbent conserve ses sections historiques `Brand & Style` et `Layout & Spacing`, ainsi que `light-colors` et des sous-propriétés de composants hors du schéma portable actuel décrit par `reference/document.md`. Le renderer porte aussi des valeurs locales non présentes comme rôles dans le contrat, notamment le titre d’opération à 14 px. Ces écarts ne deviennent pas de nouvelles règles normatives : cette extension ordinaire n’autorise ni migration du contrat ni refonte du système ; aucune réparation ou normalisation documentaire effectuée. La police système de l’outil Windows reste un choix incumbent, sans nouvelle prescription de police display.

## Portée du verdict transmis

Disposition de finition **`ship`, limitée à F1 et F2**, selon la confirmation du finisher frais transmise au documenter après la deuxième et dernière inspection visuelle. Le source confirme F1 : renvoi stable à la section « Vérifier l’accès aux clés publiques » ; F2 : titre, explication et action d’arrêt nomment Codex et évitent le jargon « processus possédé ». La première revue `fix` demeure conservée comme preuve antérieure aux corrections.

Le documenter n’a effectué aucune nouvelle inspection d’image, capture, détection, navigation, exécution de test ou build. Les comptes de tests et les vérifications visuelles du rapport d’implémentation sont des preuves rapportées, pas de nouveaux contrôles de cette passe. Ce constat ne vaut ni acceptation visuelle humaine globale, ni clôture de la refonte prévue avec Sally et les experts, ni qualification de distribution ou des gates historiques. Aucune nouvelle direction visuelle ni règle globale n’est approuvée ici.

Après ce constat, la revue fonctionnelle Quick a ajouté l’accès à l’action existante « Vérifier et arrêter Codex » dans le panneau connexion lorsque STOP_UNCONFIRMED apparaît sans projet. Aucun token, palette ni règle CSS ajouté ; régression UI clavier ciblée réussie. Ce nouvel état fonctionnel n’a pas reçu de nouvelle capture ou de nouveau verdict visuel : le plafond de deux tours est conservé, et le ship ci-dessus demeure strictement limité à F1/F2.
