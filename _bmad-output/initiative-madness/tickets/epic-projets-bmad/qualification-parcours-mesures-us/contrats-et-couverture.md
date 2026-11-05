# Parcours des mesures par US — contrats et couverture

5 novembre 2026. Extension documentaire prospective de Sally 2.12, fondée sur [D1–D6 adoptées en 2.10](../qualification-mesures-us/decisions-et-donnees.md). Le produit courant ne mesure pas encore ces données. Les chiffres des spines sont des exemples de conception, jamais des reçus natifs.

## Décisions, contre-exemples et contrats

| Décision | Matrice | Règle consommable |
|---|---|---|
| D1 — durée locale observée | M3 | [Nom, bornes, périmètre, vrai zéro et résultat séparé](../../../ux-madness/EXPERIENCE.md#epic2-metrics-read) ; [présentation textuelle](../../../ux-madness/DESIGN.md#epic2-metrics-layout). |
| D2 — story et occurrence explicites | M1/M2 | [Choisir avant chaque tour, type qualifié, sans feuille admise, capture et immutabilité](../../../ux-madness/EXPERIENCE.md#epic2-metrics-choice). |
| D3 — identité, cumul et conflit | M5 | [Doublon une fois, contradiction explicite, non attribué et chevauchement](../../../ux-madness/EXPERIENCE.md#epic2-metrics-total). |
| D4 — bornes manquantes et couverture | M3/M4/M7 | [Connu/inconnu, partiel, tous inconnus et périmètre identifié](../../../ux-madness/EXPERIENCE.md#epic2-metrics-read) ; [durabilité](../../../ux-madness/EXPERIENCE.md#epic2-metrics-availability). |
| D5 — disponibilité des données | M6/M7 | [Historique non instrumenté, usage/coût indisponibles, sources séparées et réouverture passive](../../../ux-madness/EXPERIENCE.md#epic2-metrics-availability). |
| D6 — obligations des consommateurs | M1–M8 | [Contrat normatif](../../../ux-madness/EXPERIENCE.md#epic2-metrics), [FR/EN](../../../ux-madness/EXPERIENCE.md#epic2-copy), [accès](../../../ux-madness/EXPERIENCE.md#epic2-metrics-access), [Sam : étapes, moment décisif, récupération](../../../ux-madness/EXPERIENCE.md#epic2-metrics-sam). |

La consultation et le choix prolongent les parcours [2](../../../ux-madness/EXPERIENCE.md#epic2-p2), [3](../../../ux-madness/EXPERIENCE.md#epic2-p3) et [5](../../../ux-madness/EXPERIENCE.md#epic2-p5) ; leurs corps et les quatre autres restent conservés. Préparation d’un échange, Champ de réponse, Détails de contexte, Registre des preuves, Indicateur d’état et Récapitulatif de tour gardent des lignes appariées dans les deux spines. Les primitives de choix existantes sont réemployées, sans nouveau composant ou surface permanente.

## Handoff

| Consommateur | Obligation | Limite |
|---|---|---|
| 2.11 — contrats | Qualifier le type story et sa preuve ; capturer identité/occurrence/contexte avant ACK ; corréler identité du tour, bornes monotones/domaine, terminal avant drain, durabilité, déduplication, conflit et couverture. | Aucun reducer privé de 2.10 à importer ; pas de rétro-calcul Snapshot v1, attribution probable ou continuité silencieuse. |
| 2.13 — UI | Exposer seulement les états réellement qualifiés/persistés selon les spines : choix facultatif avant tour, consultation sourcée, unités, connus/inconnus, non attribué, chevauchement, résultat et conservation distincts. | Aucune donnée reçue acquise par cette spécification ; ni dashboard, timer manuel, coût estimé ou appel fournisseur pour consulter. Les gardes du dialogue prévalent. |
| 2.14 — FR/EN | Consommer les libellés jumelés, unités et pluriels localisés ; préserver les octets du contenu projet, les identifiants, sélection, focus et brouillons lors de la bascule de langue. | Traduire l’interface ne traduit aucune preuve ni ne modifie les valeurs ou l’attribution. Vérifier noms longs, 720 px et zoom 200 % dans l’interface intégrée. |

## Provenance et limites

Le [plan 2.12](../tickets/story-definir-avec-sally-le-parcours-des-mesures-par-us-plan.md) consigne l’activation réelle Sally par les résolveurs agent/config, l’entrée 12 et le sous-travail Finalize délégué. Le [journal canonique](../../../ux-madness/.memlog.md) conserve l’Update headless. L’enquête Impeccable 4.3.1 a chargé le contexte avec sortie 0 puis Shape/Operate ; craft-floor est omis pour ce travail de planification. Ce sont des provenances de conception, pas des preuves UI ou natives.

Spine-only est explicitement retenu par le plan : lignes textuelles, détails et choix existants suffisent à cette extension ; aucun mock, asset ou capture supplémentaire. Le [DESIGN racine](../../../../../DESIGN.md) reste l’autorité visuelle Oxanium/Barlow et atelier. Tokens des spines, palette, composition, sept parcours, Graphe, sidecar et 161 inputs produit/ASAR du gel 2.10 sont comparés sans modification du produit.

[verification.json](verification.json) consigne le walkthrough documentaire M1–M8 et le Pass1 réellement exécutés, leurs nombres et leurs limites. Aucun test UI, build/NSIS, profil/compte, modèle/réseau, installation, acceptation humaine globale ou conformité WCAG n’est déduit. Les standards structure puis prose et Quick/cohérence, la finalisation des métadonnées/journal et le commit relèvent du parent ; ils ne sont pas anticipés ici.

## Suivi du candidat 2.13 — 5 novembre 2026

Le constat de disponibilité au début de ce document décrit l’état de conception 2.12 ; ses contrats, obligations et exemples restent prospectifs. Le candidat 0.2.15 de 2.13 implémente le choix facultatif du prochain tour et la consultation passive des projections du cœur : [rapport de documentation et preuves bornées](../qualification-affichage-mesures-us/documentation.md). Cette réalisation est distincte des exemples de conception, d’une réception SIWC native d’usage/coût, de la bascule globale FR/EN 2.14, de l’installation personnelle et d’une validation humaine ou WCAG globale.
