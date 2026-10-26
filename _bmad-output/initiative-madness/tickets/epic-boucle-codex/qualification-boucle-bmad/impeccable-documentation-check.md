# Vérification documentaire Impeccable — extension Forge

Date : 26 octobre 2026. Statut : **cohérence avec le système existant confirmée dans le périmètre inspecté ; contrats et sidecar préservés**.

## Mandat et méthode

Handoff du rôle officiel `impeccable_documenter`, exécuté par un sous-agent technique chargé de sa définition `agents/impeccable_documenter.toml` et de `reference/document.md` dans Impeccable 4.3.1. Ce rôle n'est ni Sally ni un agent BMad. Il s'agit d'une extension ordinaire du produit, sans nouvelle direction visuelle ni changement du système adopté.

Lecture de `PRODUCT.md`, des contrats `ux-madness/DESIGN.md` et `EXPERIENCE.md`, du système historique `ux-madness/.working/design-capture/DESIGN.md` et de son sidecar, puis examen de `src/renderer/src/styles.css`, des composants Forge/résultat/session/historique de `App.tsx` et des états/prérequis de `strings.ts`. Les six captures finales indiquées ci-dessous ont été ouvertes et inspectées visuellement. La comparaison avec `git show HEAD:src/renderer/src/styles.css` a servi uniquement à vérifier l'antériorité de deux écarts documentaires.

Unique fichier écrit : le présent rapport. Aucun code, ticket, contrat ou fichier de configuration n'a été modifié par ce passage ; aucun build, test, moteur ou fournisseur n'a été lancé.

## Système observé — cinq lignes

1. **Palette :** anthracite chaud `#211F1E`, navigation `#191817`, panneau `#272423`, action terracotta `#E49B7A`, liens/focus bleus `#9DC7E1` ; variante claire conservée dans le CSS.
2. **Typographie :** Segoe UI et replis système ; titres 26/19 px, corps et conversation 13 px, contexte 12/11 px ; Consolas/Cascadia Code pour invocations, chemins et empreintes.
3. **Composition :** barre de 56 px, contenu flexible, rail replié de 58 px sur bureau, panneau de contexte latéral ; en fenêtre étroite, navigation en tiroir et panneau latéral masqué selon les règles déjà présentes.
4. **Forme et profondeur :** sections plates séparées par des filets, rythme 4/8/12/16/20/24 px, boutons arrondis à 8 px, champ à 12 px ; aucune nouvelle ombre ni nouvelle couleur introduite par Forge.
5. **Règles maintenues :** action explicite, état accompagné de texte, observation datée distincte de l'acceptation humaine, chemins repliables, détails techniques dépliables et historique conservé sans relance annoncée.

## Confrontation aux artefacts finis

Les nouveaux sélecteurs `.forge-launch`, `.forge-preparation` et `.workflow-observations` utilisent les variables existantes, une largeur de lecture de `75ch`, des séparations par `--line` et des espacements déjà employés. Ils ne créent pas de token de système. Les commandes reprennent les variantes `.primary`, `.secondary` et `.text-button`. Les chemins longs peuvent se replier ; les listes d'observations reprennent la hiérarchie courante sans ajouter de cartes ou de surtitres décoratifs.

La préparation inline nomme l'invocation réelle, le projet destinataire, les effets autorisés, le chemin de sortie vérifié et le coût du forfait. Le prérequis de compte ou d'acquittement est relié au lancement avec `aria-describedby` et offre une action de récupération visible. Le composant résultat distingue clôture native et acceptation humaine inconnue ; les détails expliquent que les octets observés ne garantissent pas l'état courant du fichier. L'historique garde l'attribution Forge/Mary, la portée de la session et le brouillon. Ces points sont vérifiés dans la source ; une image statique ne démontre pas leur fonctionnement interactif.

| Capture inspectée | Constat visuel |
|---|---|
| `review-preparation-desktop.png` | Palette commune, rail sans monogramme, contexte latéral, chemins longs repliés, lancement indisponible avec prérequis de compte et lien d'accès au panneau Codex. |
| `review-preparation-compact.png` | Même vocabulaire visuel, commandes de préparation lisibles sur une ligne, chemins repliés et prérequis dans le flux ; aucune collision visible. |
| `review-result-desktop.png` | Résultat, portée de l'acceptation, invocation et copie, chemin et observations datées lisibles ; empreintes en monospace et séparation par filets. |
| `review-result-compact.png` | Même hiérarchie, retour à la ligne des chemins et empreintes, liste d'observations lisible sans débordement horizontal visible. |
| `review-history-desktop.png` | Historique explicitement conservé sans moteur, auteur Forge attribué, message humain sur fond sombre, brouillon et commande d'enregistrement dans le champ existant. |
| `review-history-compact.png` | Conversation et champ restent dans la largeur disponible ; actions du champ redistribuées selon la règle compacte existante. |

Ces captures sont des témoins synthétiques, scrolés vers les surfaces concernées. Elles n'attestent ni une session fournisseur réelle ni une acceptation humaine. La géométrie Windows est corroborée par le CSS ; le comportement des contrôles natifs n'a pas été réévalué ici.

## Écarts préexistants consignés, sans réparation

- **Portée du sidecar :** aucun `.impeccable/design.json` à la racine du projet. Le seul sidecar trouvé est `ux-madness/.working/design-capture/.impeccable/design.json`, daté du 23 octobre, explicitement `draft` et limité au prototype clair. Ses métadonnées et snippets violet/blanc ne décrivent pas le renderer sombre actuel. Il reste une preuve historique ; ce passage ne le convertit pas en système courant.
- **Portabilité documentaire :** le contrat BMad final utilise notamment les sections `Brand & Style` et `Layout & Spacing`, ainsi que des propriétés de composants telles que `background`, `radius` et `focusWidth`. Elles diffèrent de la structure et des huit propriétés canoniques de `reference/document.md`. Cet écart de forme existait avant Forge ; aucun lint de schéma n'a été exécuté et le contrat BMad accepté conserve son autorité.
- **Champ de réponse :** le contrat indique `components.composer.minTextHeight: 71px`, tandis que le renderer utilise `min-height: 100px`. La même valeur de 100 px est déjà présente dans `HEAD` ; elle n'est ni introduite par Forge ni inscrite comme nouvelle règle par ce rapport.
- **Panneau de fichiers compact :** le contrat prévoit un panneau sur demande sous 1 080 px ; le renderer actuel masque `.context-panel` à ce seuil. La même règle existe dans `HEAD`. Les captures compactes confirment l'absence du panneau, sans démontrer une ouverture sur demande. Cet écart du socle ne devient pas une règle de conception Forge.
- **Chronologie des contrats :** des passages historiques du pilote Mary parlent encore de base claire et de thèmes futurs, alors que les amendements d'apparence et `PRODUCT.md` décrivent le sombre installé. Les amendements datés gouvernent la comparaison ; aucune réécriture historique n'est faite.

Aucun défaut observé dans l'extension Forge ne justifie de canoniser un nouveau style, d'abaisser le plancher de lisibilité ou de réparer ces écarts au titre de ce handoff.

## Traçabilité et limites

Empreintes SHA-256 des sources inspectées :

| Source | SHA-256 |
|---|---|
| `src/renderer/src/App.tsx` | `55EA4850546926D9AF4529FBBA649972363111084C16B1B1667400E46D1E65AE` |
| `src/renderer/src/styles.css` | `607A5030668B1B3FB1ACCD8CBCF6DE99B069CCC46BB9D07C5C3B790DD6C2A81E` |
| `src/renderer/src/strings.ts` | `D9AFDF378C0E492EDF1FB2371A68EB12EB3665889889E2C6D7ED65C14E8CA0B0` |

Empreintes des documents préservés, relevées lors du passage puis recontrôlées après écriture du rapport :

| Document | SHA-256 |
|---|---|
| `ux-madness/DESIGN.md` | `1333ACA6F1659E4A3C91980C8FBF2BF2166DACE3EAC800F6A520D5C9D664F1F4` |
| `ux-madness/.working/design-capture/DESIGN.md` | `673889EB9A558C68498EBF8909B6D8110E9E4070E08597A16FFCBDD84506B7E1` |
| `ux-madness/.working/design-capture/.impeccable/design.json` | `33B4E84B1A0AF4300ECCB724368E86EC756E5C70980CDB7FF71C286C7A96FEE3` |

La vérification porte sur la cohérence documentaire, la source et les six images fournies. Les 151 tests, le build, les huit contrôles paquet et les cinq contrôles Windows mentionnés dans le handoff sont des résultats rapportés par le parent, non réexécutés ni certifiés par ce documenter. Aucun calcul de contraste, essai clavier, lecteur d'écran, inspection de style calculé en session active ou validation visuelle humaine n'est ajouté. Le thème clair n'est confronté qu'au CSS, pas à une nouvelle capture. Le verdict de revue finale et les qualifications fonctionnelles restent distincts de ce rapport.
