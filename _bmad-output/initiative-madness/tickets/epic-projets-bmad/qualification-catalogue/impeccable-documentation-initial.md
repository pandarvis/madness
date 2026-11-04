# Catalogue 2.6 — relevé documentaire Impeccable

Date : 4 novembre 2026. Racine contrôlée : `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness`.

## Rôle et portée

Cette passe est exécutée par un **substitut technique frais du rôle officiel Impeccable documenter**, dont la définition `agents/impeccable_documenter.toml` a été chargée directement depuis Impeccable 4.3.1, avec `reference/document.md` lu intégralement. Le rôle natif n’est pas exposé par ce harness ; aucune persona Sally n’est revendiquée.

`impeccable.cmd context --target src/renderer/src/App.tsx` a été exécuté exactement une fois dans cette session, avec code de sortie 0 et résolution de cette racine. Mode **Operate**, extension **code-led** du monde atelier existant ; aucun nouveau monde, seed, choix de composition ou contrat approuvé n’est créé.

Le relevé porte sur le code fini et ses autorités. Le mandat parent identifie le nouveau candidat logiciel 0.2.10 par ASAR `be41bfdbacb89919c45396497e9c04be0f0d976b5048d2d9627f1d96a78be6d7`, non installé. Cette identité est fournie par le parent ; aucun paquet n’a été reconstruit ou exécuté par cette passe. Le `final-manifest.json` et le `worker-handoff.md` présents décrivent encore le reçu antérieur ASAR `ba7e5a5a02d33c9cedf6de830b020e492d4ecd2bd1058a28cc8879345910fe4a` : leurs preuves ne sont pas attribuées implicitement au nouveau candidat.

## Conclusion documentaire

**Aucune modification du système.** `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, le contrat de surface App et les deux spines UX sont préservés. L’extension ne crée ni palette, ni famille typographique, ni actif raster ou règle visuelle durable demandant une régénération du DESIGN et de son sidecar. Les différences locales de densité et de largeur ci-dessous restent des règles de cette surface, sans promotion au système global.

### Synthèse du système en cinq lignes

1. **Palette :** anthracite/ivoire de lecture, plaques pétrole, action terracotta et focus bleu ; le catalogue référence les propriétés CSS des thèmes existants.
2. **Typographie :** Barlow Condensed Bold pour titres/commandes ; Oxanium courant 16 px à 450, métadonnées 14 px ; chemins et invocation en Consolas/Cascadia Code.
3. **Lecture :** *The Quiet Reading Rule* et *The Working Center Rule* gardent les fonds calmes et le texte réel ; les résultats sont des lignes plates.
4. **État :** *The Explicit State Rule* associe libellés, couverture, observation et révision ; descriptif, copiable et lancement restent distincts.
5. **Interaction :** commandes atelier à cibles 44 px, fermeture 40 px, dialogue natif borné à la fenêtre et source sélectionnable ; aucune consultation ne vaut lancement.

## Concordance du code fini avec les autorités

| Sujet | Observation sourcée et portée |
|---|---|
| Intention produit et destination | `PRODUCT.md` demande l’accès au catalogue installé et des actions expliquées. `App.tsx:409,470,480` ajoute une destination unique « Toutes les possibilités » dans le projet, après Parcours/Conversation, sans nouvelle navigation permanente. La première ouverture demande une lecture locale de ce projet. Cela ne qualifie pas le lancement général. |
| Composition | `catalog.css:1–16` emploie des lignes plates séparées, recherche/module avant résultats, blocs extensibles et paragraphes jusqu’à 75 ch. La règle locale `.project-tabs { flex-wrap: wrap }` permet les trois libellés. Cela correspond au spine UX DESIGN:293–299,344–345 ; aucune grille de grandes cartes ni nouveau décor. |
| Primitives visuelles | `main.tsx` conserve l’ordre styles → immersion → controls puis feuilles d’extension, dont catalogue. `catalog.css` réutilise `--text`, `--panel`, `--surface`, `--line`, `--control-line`, `--muted`, `--backdrop`, `--panel-shadow`. Les classes secondary/text-button héritent des plaques, fontes et focus existants ; aucune valeur de couleur propre n’est ajoutée. |
| Typographie et géométrie locales | Les champs héritent de la fonte courante, hauteur minimale 44 px ; les résultats utilisent une commande à 21 px, le titre de fiche 28 px et l’invocation de fiche 16 px. Le dialogue de compétence est limité à 760 px, avec retraits de 16 px puis 8 px sous 721 px, hauteur bornée au viewport, en-tête sticky et corps extensible. Ces choix ne remplacent pas les dimensions propres à la fiche agent. L’ombre reprend `0 12px 42px var(--panel-shadow)` du vocabulaire flottant existant. |
| Provenance et inconnus | `CatalogPanel.tsx` rend les quatre champs objectif/entrées/conditions/effets, ou « Information non documentée — inconnue ». Chaque champ documenté expose chemin, SHA-256, lignes et extrait exact ; les sources complètes restent dépliables. Les notes documentaires restent distinctes des champs structurés. Le contrat `bmad-catalog.ts` relie champs/items à leurs sources et révisions ; aucun portrait ne sert de preuve de compétence. |
| Recherche, détail et retour | `filterCatalog` applique des termes littéraux et le module, sans quota de présentation. `CatalogPanel.tsx` conserve recherche/module, observation affichée, sélection et défilement par projet. Effacer les filtres retire le module et conserve le texte conformément à EXPERIENCE:345. Le dialogue place le focus au titre ; Échap/Fermer rend le focus au déclencheur exact, sinon au titre des résultats. Il reste une consultation native locale. |
| Fraîcheur et copie | Une nouvelle observation ne remplace pas silencieusement celle affichée ; bascule explicite, mention historique et révisions restent visibles. Les gardes `old/copying` bloquent la copie incertaine ; la confirmation exige le reçu corrélé item/révision. `src/core/bmad-catalog.ts:39–53` relit le presse-papiers et recontrôle destination/fraîcheur avant succès. Le texte reste sélectionnable en cas d’échec. Ce relevé décrit le code et ne remplace pas une preuve d’interaction exécutée. |
| Frontière 2.7/2.14 | `launchable:false` est invariant du contrat ; aucun bouton Lancer/Préparer le lancement général n’est ajouté. La fiche indique « Lancement général non qualifié pour ce profil » et « La copie ne lance aucune conversation ». Les libellés FR/EN existent dans `strings.ts`, mais le panneau consomme explicitement FR ; la langue globale reste 2.14. Les étapes ultérieures du parcours 3 restent contractuelles pour 2.7. |

## Dérives et limites conservées

- **Dérive antérieure du spine visuel :** `ux-madness/DESIGN.md:275–281` conserve Segoe UI pour les messages et 14 px de conversation ; son tableau responsive conserve notamment 52 px de retrait large. Le DESIGN racine, le contrat App et la cascade courante établissent Oxanium/16 px et retraits 28/22/16 px. Le spine reconnaît lui-même à sa section Reprise 2.4 que le DESIGN racine fait autorité et que ses anciennes valeurs ne sont pas réparées. Cette passe ne les canonise pas.
- **États historiques :** le début du spine EXPERIENCE porte encore le candidat 2.2 in-review/M14 ouvert, et le DESIGN racine/sidecar emploient le repère candidat 0.2.5. Ces phrases ne constituent pas une attestation du statut courant du catalogue ou du paquet 0.2.10. Aucune réécriture incidente.
- **Traçabilité de surface :** le contrat App reste le contrat général établi, sans `CatalogPanel.tsx`/`catalog.css` dans `related_targets`. Le présent relevé nomme ces fichiers et le parcours UX correspondant sans étendre cette autorité sous un mandat limité au rapport.
- **Non canonisé/non réparé :** les valeurs et états historiques ci-dessus, les dimensions ponctuelles de la fiche compétence et les variantes locales de texte ne deviennent pas des règles de toutes les surfaces. Aucun défaut de craft n’est légitimé par une nouvelle primitive. L’absence de composant catalogue dans le sidecar n’impose pas de régénérer son échantillon de primitives.
- Aucun test, build, détecteur, capture, tour visuel, installation, appel fournisseur ou nouveau workflow n’a été exécuté par cette passe. Le verdict visuel final est séparé ; aucun ship, accord humain, conformité WCAG globale ou nouvelle qualification native n’est déduit de ce rapport.

## Empreintes de lecture

SHA-256 des fichiers effectivement consultés lors du relevé. Ces empreintes bornent sa validité ; un correctif ultérieur exige un recheck ciblé. Les six premières lignes sont les autorités préservées.

| Fichier | SHA-256 |
|---|---|
| `PRODUCT.md` | `0da5e5d8a8833cc7989c357dfd85a4c26abb92d7ab92c96069ec92fe715e5558` |
| `DESIGN.md` | `66dde2622bd66a24542987ff61656304dc6e3fb1e6370c40049e12383052c1e9` |
| `.impeccable/design.json` | `91c057fa0734124969403a97135c9ac038613bfa7e9f0c4f4ad6c5b932fcb827` |
| `.impeccable/surfaces/src-renderer-src-app-tsx.md` | `b03a739d7410a1b5c96d1a3856872d763849027e772c1ecf635940b924809df9` |
| `_bmad-output/initiative-madness/ux-madness/DESIGN.md` | `f17296a2d923e14a3837ca4fbcabf98d4c57f03cb2c93787d9534028916e7e51` |
| `_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md` | `ac3874e6680bef5356a537f36ae1e00d504643cd075788921babb838dd82c9cf` |
| `src/renderer/src/App.tsx` | `b6f57a270bce98eed3c7744adb6bdf73f02c381643f469728d22669aa3473e80` |
| `src/renderer/src/CatalogPanel.tsx` | `1436ebe79d0e58dbcea6f1eb149955b8cc13f87a367272f21ca18c27f6e58cda` |
| `src/renderer/src/catalog.css` | `eb2e242f7af9e35c1f0799289f1f171dfc916f2a364e736091e05ff5ebf809a2` |
| `src/renderer/src/strings.ts` | `eda648ba76bf112ac4c8742e5f17622312040d026d02b1f2a8288901b029c557` |
| `src/renderer/src/main.tsx` | `65d669d6fc3590fa320a46775c5a2a616101b04ee0fe769753e293917abf7b76` |
| `src/renderer/src/styles.css` | `88368815862483a1ceb3350ab44ff2955948e9fc834bc2f262b2a0ec7e15b91a` |
| `src/renderer/src/atelier-immersion.css` | `4f1ed5e84745667f33fc74f74e2271f2fc58043bf4459fa29cd80fb6ba41236d` |
| `src/renderer/src/atelier-controls.css` | `7cc7b3738ae1cc892d5938069b361aedee08d7f46b15ce1c901f85a507519570` |
| `src/contracts/bmad-catalog.ts` | `17d507b104f37b0067442dfb464a280e118719b1e55762140f86a051e31a4d07` |
| `src/core/bmad-catalog.ts` | `44775df353d2aee0aa728535060f0844b6873262a283ef5d996358063af7e43b` |

Écriture autorisée et effectuée par cette passe : uniquement `_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-catalogue/impeccable-documentation.md`.
