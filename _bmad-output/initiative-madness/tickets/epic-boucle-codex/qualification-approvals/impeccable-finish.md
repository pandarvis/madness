# Story 1.6 — finition Impeccable ciblée

Rapport du 27 octobre 2026, limité à l’extension d’approbation dans l’interface existante. La disposition **`ship`** ci-dessous porte sur cette surface en mode **Operate** ; elle ne constitue ni livraison globale, ni acceptation visuelle humaine, ni qualification de distribution ou clôture des gates.

## Intervenants et périmètre

La finition fraîche est assurée par le sous-agent technique `/root/story16_impeccable_finish`, avec inspection des cinq vues et des sources. Le présent rapport est consigné séparément par `/root/story16_impeccable_documenter`, selon la définition officielle `impeccable_documenter.toml` et sa référence `reference/document.md`. Les rôles spécialisés n’étant pas exposés par l’hôte, ces noms identifient les définitions appliquées par des agents techniques génériques ; ils ne désignent pas des personas BMad. **Sally n’a pas été invoquée dans ce lot.**

Cette passe documentaire reprend le verdict transmis par le finisseur et les preuves existantes. Elle ne déclenche ni nouveau cycle visuel, ni revue de code, ni test, build ou passe detect. Son seul fichier écrit est ce rapport.

L’extension conserve la palette sombre terracotta/bleu, le clair alternatif et la composition existante. Elle ajoute le mode Mary opt-in, avec lecture seule par défaut, portée complète du patch natif, accord ou refus ponctuel du patch entier, puis ajustement distinct : refus de la proposition et nouvel envoi explicite. Aucun nouveau monde visuel ni changement de système n’est approuvé par ce lot.

## Références et preuves retenues

Les références existantes sont `PRODUCT.md`, `_bmad-output/initiative-madness/ux-madness/DESIGN.md` et `EXPERIENCE.md`. Elles sont préservées, ainsi que les fichiers `.impeccable` existants. Aucune QualityBar formelle ni nouveau `design.json` n’est créé. Les règles et tokens cités ci-dessous résument le système existant ; ils ne constituent pas une nouvelle extraction ou une réécriture normative.

Le dossier `qualification-approvals/` contient [la vérification de l’implémentation](implementation-validation.md), le résultat detect final [vide `[]`](impeccable-detect.json) et les captures synthétiques suivantes, inspectées par le finisseur :

| Vue | Géométrie et thème | Preuve |
| --- | --- | --- |
| Portée complète, bureau | 1320 × 900, sombre | [compiled-desktop-scope.png](compiled-desktop-scope.png) |
| Choix, bureau | 1320 × 900, sombre | [compiled-desktop-choice.png](compiled-desktop-choice.png) |
| Portée complète, compacte | 600 × 850, sombre | [compiled-compact-scope.png](compiled-compact-scope.png) |
| Choix, compacte | 600 × 850, sombre | [compiled-compact-choice.png](compiled-compact-choice.png) |
| Résultat inconnu, compacte | 600 × 850, clair | [compiled-unknown-light.png](compiled-unknown-light.png) |

Deux inspections groupées de l’implémenteur précèdent cette finition fraîche. Le premier lot a retiré un retour d’attente dupliqué, actualisé l’ancienne copie « approbations indisponibles » et aligné la checkbox sur le mode capturé ; la seconde passe a confirmé ces corrections et l’absence de débordement. Ce rapport ne compte pas une nouvelle inspection d’implémenteur.

La surface examinée correspond au renderer `out/renderer/assets/index-SrgEygvQ.js`, SHA-256 `3160529fff5dbf5cd354d70dba48ebdcba39d3f237ffbd33533550586fdbd608`. Cette identité borne les conclusions visuelles ; elle ne certifie pas les futures sorties de cœur ou de paquet.

## Verdict transmis par la finition fraîche

| Champ | Verdict et portée |
| --- | --- |
| `disposition` | **`ship`**, pour l’extension 1.6 dans l’interface existante uniquement. |
| `persistence` | **`pass`** : documentation, captures et résultat detect présents. |
| `fidelity` | **`match`** sur `TYPE`, `MATERIAL`, `GROUND`, la portée, le consentement, l’ajustement, l’incertitude et la transmission. |
| Adaptation compacte | Conforme sur les vues 600 × 850 retenues. |
| Plafond de finition | **`ceiling reached`** pour cette extension Operate ; aucun nouveau cycle visuel demandé. |
| `material_fixes` | Aucun. |

Les éléments à conserver sont la portée intégrale du patch, l’accord ponctuel sans choix par défaut, les deux actions explicites de l’ajustement et la distinction entre transmission, effets observés et historique. Le résultat inconnu garde sa portée ; une transmission ou un choix conservé ne devient pas une preuve d’effet ni une autorisation encore active.

## Résumé du système existant — cinq lignes

1. **Palette :** anthracite chaud, terracotta pour l’action, bleu pour liens/focus/repérage ; clair alternatif préservé.
2. **Typographie :** Segoe UI et replis système ; hiérarchie existante 26/19/15 px, lecture 13 px, commandes 14 px, contexte 12/11 px ; Consolas/Cascadia Code pour les chemins et invocations.
3. **Matière :** fonds et filets portent la hiérarchie ; groupes sobres et ombres réservées aux séparations déjà définies.
4. **Composition :** conversation centrale, portée avant décision et commandes explicites ; adaptation compacte et repli des chemins sans nouveau modèle de navigation.
5. **Règles :** état accompagné de son libellé et de sa portée ; aucun accord par défaut ; proposition, décision, transmission et effet restent distincts.

## Limites et suite de qualification

Les **217 tests**, **11/11 contrôles compilés**, **11/11 contrôles paquet** et **5/5 contrôles Windows** consignés dans `implementation-validation.md` précèdent la revue. Quatre correctifs de cœur/protocole sont ensuite confiés à l’implémenteur, sans demande de changement UI ; leurs vérifications finales de cœur et de paquet restent au passage parent. Les résultats antérieurs ne sont donc pas présentés comme la validation finale de ces correctifs.

L’essai personnel a rencontré `PROVIDER_FAILED` avant tout runner ou approbation. Le GET public JWKS est diagnostiqué séparément. Aucune approbation avec modèle réel, réussite d’écriture réelle, installation 1.6 ou restauration du paquet installé n’est acquise par ces captures et bancs synthétiques.

La refonte globale demandée après l’implémentation de l’epic 1, l’acceptation visuelle humaine, les limites d’accessibilité existantes, les gates historiques et la qualification de distribution restent explicites. Le verdict ciblé ne les remplace pas.

**Défauts ou dérives non canonisés ni réparés :** aucun nouveau défaut UI n’est rapporté par la finition fraîche ; les réserves globales et historiques restent hors de cette extension, sans nouvelle règle ni retouche des contrats existants.
