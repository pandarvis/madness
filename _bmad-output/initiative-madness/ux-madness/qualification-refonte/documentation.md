# Documentation de la refonte — 28 octobre 2026

**Disposition : conserver le système adopté.** Cette extension locale du monde « Parcours guidé » ne demande ni nouvelle identité ni nouveaux tokens normatifs. [DESIGN.md](../DESIGN.md) et [EXPERIENCE.md](../EXPERIENCE.md), actualisés par Sally, restent les spines faisant autorité. Aucun de ces fichiers n’est modifié par cette passe ; le seul fichier écrit est le présent rapport.

Passe réalisée par un agent technique frais appliquant la définition officielle `impeccable_documenter.toml`, chargée avec `reference/document.md` de la version Impeccable 4.3.1. Cet agent n’est pas Sally. La définition demande de décrire le build effectivement terminé, de préserver le système d’une extension ordinaire et de signaler les dérives préexistantes sans les réparer implicitement.

## Provenance vérifiée

L’exécutable séparé `dist/workspace-design-final/win-unpacked/Madness.exe` existe. Le SHA-256 de son `resources/app.asar`, recalculé en lecture seule, est `367bc8842b56b8ffe28f0b303ea6dbab9c5b458e65de7cc5fd639c6b308e96cc` pour 9 530 644 octets. Il correspond à [candidate-final-001/release-manifest.json](candidate-final-001/release-manifest.json), à l’identité consignée dans [packaged-visual-round-2/profile.json](packaged-visual-round-2/profile.json) et à celle de [finish-review.md](finish-review.md).

Les douze entrées `src/renderer/` du manifeste ont été comparées aux fichiers courants : douze empreintes identiques. Cette comparaison inclut `App.tsx`, les composants de question, d’approbation, de récupération et de synthèse, `strings.ts`, `styles.css` et le signe SVG ChatGPT. Le CSS a également été lu directement dans l’ASAR, sans extraction sur disque : `out/renderer/assets/index-ro9ZzzgC.css` et `src/renderer/src/styles.css` sont identiques octet pour octet, 28 542 octets, SHA-256 `843463920dcc7b250592be463ab0378cecb2fb9d1f5698bf6dd2fb1fb1c79faa`.

Les empreintes de référence des spines préservées sont :

- DESIGN.md : `f03da3396840471d9771977636ce0fdf5d22b71afb97ee36064988ba0a5bb990`.
- EXPERIENCE.md : `3cbd893aee20bc67d53b16042f7b33ed1df1fbc2c9a14c985e04ce9d93fbdaf3`.

## Concordance du build et du système

Lecture directe : `PRODUCT.md`, `AGENTS.md`, les deux spines, [direction.md](direction.md), [finish-review.md](finish-review.md), la feuille de style complète et un échantillon des composants applicatifs. Les points ci-dessous proviennent du CSS embarqué et des sources reliées au manifeste ; le verdict visuel appartient à la revue de finition, qui a ouvert les douze PNG. Cette passe ne revendique pas une nouvelle inspection de ces images.

| Règle adoptée | Preuve présente dans le candidat et ses sources | Portée |
|---|---|---|
| Sombre chaud, terracotta d’action, bleu de repérage ; clair alternatif | `:root` porte surface `#211f1e`, navigation `#191817`, panneau `#272423`, accent `#e49b7a`, lien/focus `#9dc7e1`. `[data-theme="light"]` conserve le blanc/lilas et l’accent `#654bb0`. | Correspondance des valeurs et rôles échantillonnés ; aucune nouvelle palette. |
| Segoe UI et hiérarchie fonctionnelle | Famille Segoe UI avec replis système ; h1 26 px/600/1,25, h2 19 px/600/1,35, corps 13 px/1,65, conversation 13 px/1,75, métadonnées 12 px, labels 11 px. Monospace Consolas/Cascadia Code pour code et chemins. | Fonte système explicitement choisie dans le monde hérité ; aucune nouvelle fonte d’affichage canonisée. |
| Barre d’action et de titre commune | Hauteur minimale 56 px, boutons de 40 px, SVG de 19 px et trait 1,65 ; une seule commande d’ouverture dans `App.tsx`, avec `aria-label` et aide au focus/survol. Zones de commandes hors drag. | Les positions rendues et l’axe à 28 px sont attestés par la revue/profil fournis, pas remesurés ici. |
| Navigation latérale et centre | Navigation 222 px de référence, rail 58 px au-dessus de 720 px, tiroir borné à 240 px en dessous ; variantes 184/194/240 px aux seuils conservés. Centre 1 080 px maximum et retraits de référence 24/38 px. | Fenêtre Windows compacte ; aucune plateforme mobile ajoutée. |
| Projet, onglets, puis travail | `App.tsx` place nom, initiative et onglets avant la synthèse compacte. Préparation Mary/Forge conditionnée à Parcours ; Conversation présente les demandes actives avant les messages, puis le champ de réponse et l’action secondaire de préparation. | Correspond à THESIS/FIRST VIEWPORT ; pas de catalogue complet ou recommandation calculée déduit de ces blocs. |
| Champ de réponse, focus et profondeur | Champ redimensionnable d’au moins 71 px, enveloppe arrondie 12 px, retrait 12 px ; contour/focus bleu, anneau général 2 px et décalage 3 px. Ombre douce de saisie et panneaux superposés ; listes et filets structurent le reste. | Ne généralise pas ces ombres à toutes les surfaces. |
| Question et Proposition d’approbation | `QuestionPanel.tsx` sépare demande active et contenu conservé ; `ApprovalPanel.tsx` place portée, échéance, chemins et patch intégral avant les choix textuels « Refuser tout le patch » / « Autoriser tout le patch une fois ». | La compacité conserve les décisions en texte. Aucun pictogramme de décision ni accord implicite introduit. |
| Bande de récupération | `WorkOverview.tsx` nomme « Arrêt Codex non confirmé · portée globale · nouveaux échanges bloqués » ; l’effet incertain conserve son besoin d’inspection. Les détails de `RecoveryPanel.tsx` restent consultables. | Une garde critique ne devient pas une simple métadonnée cachée. |
| Mouvement borné | Le dossier dispose d’une animation de 180 ms au survol/focus. La règle `prefers-reduced-motion: reduce` supprime animations, transitions et défilements animés. | Règles présentes dans le CSS embarqué ; rendu temporel non réexécuté. |

Les noms de composants, la distinction faits/décisions et les capacités futures restent ceux des spines. Les tokens de futurs catalogue, panneau de fichiers, diagnostic ou Dialogue ne sont pas réécrits à partir d’un contrôle actuel voisin. Une valeur résiduelle de CSS ou une occurrence isolée ne devient pas une règle durable par cette passe.

## Persistance et dérives non réparées

`C:/Sources/madness/DESIGN.md` est absent : c’est la dérive préexistante de découverte déjà identifiée dans l’entrée. Les sidecars `.impeccable/design.json` sont également absents à la racine et sous `ux-madness/`. Aucun fichier concurrent n’est créé pour prouver que la passe a eu lieu. Le système effectivement adopté reste explicitement accessible aux chemins des deux spines.

La structure BMad de DESIGN.md est antérieure à cette passe et diffère du format portable décrit par `reference/document.md` : titres `Brand & Style` et `Layout & Spacing`, groupe `light-colors`, propriétés de composants dépassant les huit propriétés du schéma Stitch. Les métadonnées propres au projet et les composants futurs sont conservés. Ce constat limite la lecture automatique par les outils Impeccable/Stitch ; il ne vaut ni nouveau défaut visuel ni autorisation de migrer le contrat. Aucun sidecar n’est régénéré puisque le DESIGN.md adopté n’est pas régénéré. Aucune correction normative indispensable à cette extension n’a été identifiée ; une éventuelle migration de format doit être traitée explicitement, sans déplacer silencieusement l’autorité.

Ne sont pas canonisés : fichiers de découverte manquants, incompatibilités de format et tokens futurs comme preuves de livraison. Aucun défaut de rendu supplémentaire n’a été établi par cet examen documentaire. Les règles visuelles restent celles du monde Windows choisi ; aucune interdiction nouvelle n’est ajoutée pour légitimer un résultat.

## Résumé du système

1. Palette : anthracite chaud, terracotta d’action et bleu liens/focus ; clair blanc/lilas conservé.
2. Typographie : Segoe UI, titres 26/19 px, corps et conversation 13 px, contexte 12 px ; monospace pour les identifiants.
3. Barre et Navigation latérale : bande 56 px, cibles 40 px, SVG 19 px, rail 58 px et tiroir à 720 px.
4. Conversation et Champ de réponse : échange central, préparation secondaire, surfaces planes et profondeur limitée aux saisies/superpositions.
5. Bande de récupération et Proposition d’approbation : portée et inconnus explicites, blocage visible et choix textuels après les effets intégraux.

Limites : aucun lancement d’application, test, build, détecteur, capture, accès réseau ou modèle par cette passe ; aucune écriture de source, de test, de spine, de memlog ou de cache. Le `ship` de finition fourni concerne ce candidat séparé. Ni installation personnelle, ni qualification intégrée 1.11/G1, ni conformité WCAG, ni acceptation visuelle humaine n’en sont déduites. Aucun relevé du temps ou du coût de notre développement n’est créé.
