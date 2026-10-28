# Documentation après Q1 — 28 octobre 2026

**Disposition : conserver le système adopté ; continuité documentaire limitée au delta Q1 et aux éléments de rendu inchangés.** [DESIGN.md](../DESIGN.md) et [EXPERIENCE.md](../EXPERIENCE.md) restent les spines normatives. Aucun nouveau token, composant, règle visuelle ou système n’est nécessaire pour libérer l’état `pending` lors de « Préparer un échange ». Le seul fichier écrit par cette passe est le présent rapport ; [documentation.md](documentation.md) reste la preuve documentaire du candidat précédent.

Recheck par le même agent technique appliquant la définition officielle `impeccable_documenter.toml` et `reference/document.md`, déjà chargées. Cet agent n’est pas Sally. Le monde « Parcours guidé », le mode Operate/code-led, Segoe UI et les deux thèmes sont conservés.

## Provenance et comparaison embarquée

L’exécutable `dist/workspace-design-reviewed/win-unpacked/Madness.exe` existe. Le SHA-256 de son ASAR a été recalculé en lecture seule : `6664da10ba09364dd5e7584ad812848d48b7bb8f4c48508507434825770684c8`, pour 9 530 665 octets. Cette identité correspond à [candidate-reviewed-002/release-manifest.json](candidate-reviewed-002/release-manifest.json), [q1-artifact-comparison.json](q1-artifact-comparison.json) et [finish-verdict-q1.md](finish-verdict-q1.md).

Les douze entrées `src/renderer/` du manifeste courant ont été comparées au source : douze empreintes identiques. `App.tsx` porte désormais SHA-256 `0991c17b6504c32db73eeb31c1571adb654b7f1ca75c0b169cc99d9b1f6d97a5` ; les onze autres entrées renderer conservent leurs empreintes précédentes.

Les contenus suivants ont été lus directement dans les deux ASAR, sans extraction sur disque ni exécution :

| Fichier embarqué | Comparaison 367bc8… → 6664da… | SHA-256 commun |
|---|---|---|
| `out/main/index.js` | Identique, 256 147 octets | `1764d9554a76b2f70b543e1ba20e4743f125c6f32a28df66e96645226dd6c1d4` |
| `out/preload/index.js` | Identique, 30 519 octets | `896b68593af676e783f4d87a0b72393ac9f5d022c4e906122da29bd2dfc11ea4` |
| `out/renderer/assets/index-ro9ZzzgC.css` | Identique, 28 542 octets ; même empreinte que le CSS source vérifié | `843463920dcc7b250592be463ab0378cecb2fb9d1f5698bf6dd2fb1fb1c79faa` |
| `out/renderer/assets/chatgpt-mark-BSM5F-kM.svg` | Identique, 4 214 octets | `b8b9aba7ba591f54bf1805f422bc23f32c44ee993643cc378cc77f766061f7a1` |

Le HTML `out/renderer/index.html` est identique après normalisation de sa seule référence de bundle : `index-h2-Ljs0W.js` devient `index-DTur5RXN.js`. La comparaison intégrale des deux bundles JavaScript par préfixe/suffixe commun ne trouve aucune suppression et qu’une insertion de 21 caractères : `Pending(false);\n\t\tset`. Le découpage partage le mot `set` avec l’appel voisin ; le contexte embarqué reconstitue sans ambiguïté l’ajout de `setPending(false)` entre `setFocusTarget(null)` et `setTab("parcours")` dans `prepareExchange`. La ligne 360 du source courant porte ce même ajout. Les SHA-256 des bundles sont respectivement `40a5370f222e3bbce1503017071aebf3f79956add1b8acc21450166e9689ce14` et `1307db8ddf57c95aa967145fa43e0380a341f0e896f0ae816d36073f91cd2100`.

## Concordance et portée

Q1 rétablit la disponibilité des commandes lorsque la préparation invalide une navigation différée ; cet état de disponibilité change volontairement. Il ne change ni JSX, texte, composition, palette, type, espacements, icônes, mouvement ou styles de focus. Le CSS embarqué identique conserve donc les valeurs comparées aux spines dans le rapport précédent : sombre chaud/terracotta/bleu et clair alternatif, Segoe UI, barre 56 px, cibles 40 px, SVG 19 px, rail 58 px, seuil de tiroir 720 px et champ de réponse minimal 71 px. La préparation secondaire et les décisions textuelles gardent la même structure.

[finish-verdict-q1.md](finish-verdict-q1.md), lu intégralement, déclare Q1 résolu et maintient un `ship` ciblé. Il rapporte les reçus comportementaux rouge, puis 3/3 ciblés et 355/355 globaux ; ces tests n’ont pas été réexécutés par le documenteur et leurs journaux ne sont pas revendiqués comme une vérification propre à cette passe. Le verdict n’exige aucune nouvelle capture pour ce delta fonctionnel. Cette passe documentaire confirme la comparaison de fichiers qui borne ce transfert ; elle n’effectue pas une nouvelle revue complète du rendu.

Les douze PNG de `packaged-visual-round-2/` restent exclusivement les captures de l’ASAR `367bc8842b56b8ffe28f0b303ea6dbab9c5b458e65de7cc5fd639c6b308e96cc`. Ils ne sont pas réattribués au candidat `6664da10ba09364dd5e7584ad812848d48b7bb8f4c48508507434825770684c8`. L’ancien rapport et `finish-review.md` restent historiques ; la carte QUALITY BAR distincte demeure absente.

## Persistance préservée et dérives

Les spines conservent les empreintes de la passe précédente : DESIGN.md `f03da3396840471d9771977636ce0fdf5d22b71afb97ee36064988ba0a5bb990` ; EXPERIENCE.md `3cbd893aee20bc67d53b16042f7b33ed1df1fbc2c9a14c985e04ce9d93fbdaf3`. Le rapport antérieur est préservé, SHA-256 `2beb36621277054ba7ef3a69ef5bf9c7e9f010259106908918a2924e3be351d9`.

Mêmes dérives préexistantes, vérifiées sans réparation : DESIGN.md absent à la racine et sidecars `.impeccable/design.json` absents à la racine et sous `ux-madness/`. La structure BMad des spines conserve ses titres non canoniques, `light-colors` et ses propriétés de composants hors du schéma portable décrit par `reference/document.md`. Leur découverte/portabilité automatique reste limitée ; aucune autorité concurrente, migration ou régénération incidente n’est créée pour Q1.

Ne sont pas canonisés : les absences de persistance, les incompatibilités de format, ni des captures anciennes comme preuve visuelle fraîche. Aucun défaut visuel nouveau n’est établi par cette comparaison ; aucun changement normatif indispensable au système n’est identifié.

## Résumé du système

1. Palette : anthracite chaud, terracotta d’action et bleu liens/focus ; clair blanc/lilas alternatif.
2. Typographie : Segoe UI, titres 26/19 px, corps/conversation 13 px, contexte 12 px ; monospace technique.
3. Barre et Navigation latérale : 56 px, cibles 40 px, SVG 19 px, rail 58 px et tiroir à 720 px.
4. Conversation et Champ de réponse : échange central, préparation secondaire ; libération de `pending` lors de la préparation Q1.
5. Bande de récupération et Proposition d’approbation : portée et inconnus visibles, choix textuels après les effets intégraux.

Limites : aucune application, aucun test, build, scan, détecteur, capture, réseau ou modèle lancé par cette passe ; aucune modification des sources, tests, spines, ancien rapport, memlog ou caches. Le verdict reste limité aux éléments de rendu inchangés et au correctif Q1. Ni installation personnelle, qualification intégrée 1.11/G1, conformité WCAG, résultat réseau/modèle ou acceptation visuelle humaine n’en sont déduits. Aucun relevé du temps/coût de notre développement n’est créé.
