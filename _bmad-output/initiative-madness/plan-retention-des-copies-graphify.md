---
title: 'Réduire les copies temporaires du graphe après arrêt confirmé'
type: 'bugfix'
ticket: ''
created: '2026-11-06'
status: 'draft'
baseline_revision: '760550443c0942b7c41b9cc96db41c75b147b814'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Chaque opération Graphify laisse des copies privées sous graph-runs-v1. Les miroirs, les exports natifs et les duplications de texte d’aperçu occupent du disque après utilisation.

**Approach:** Libérer les copies temporaires identifiées après leur dernier consommateur et la preuve d’arrêt de l’opération. Préserver les reçus, les graphes normalisés et les autorisations d’aperçu encore utilisables.

## Boundaries & Constraints

**Always:** Partir uniquement des répertoires alloués et identifiés par cette instance. Vérifier la racine physique, la filiation et l’identité avant tout retrait. Un échec de nettoyage reste sans effet sur le graphe, la persistance et le verrou d’arrêt.

**Never:** Balayer un profil existant, modifier les originaux, retirer un reçu terminal, considérer l’absence d’un processus comme preuve d’arrêt ou nettoyer la capture utilisée par une analyse dont l’arrêt est inconnu.

## I/O & Edge-Case Matrix

| Situation | Entrée | Résultat |
|---|---|---|
| Génération, revalidation ou abandon après arrêt confirmé | Miroir créé dans cette instance et dernier consommateur terminé | Miroir retiré et fichier de preuve d’aperçu conservé |
| Analyse achevée | Graphique normalisé et arrêt confirmé | Copies natives volumineuses retirées après lecture et reçus disponibles |
| Lecture ou vérification terminée | Résultat lu en mémoire et arrêt confirmé | Copies de réponse temporaires retirées |
| Arrêt inconnu ou chemin remplacé | Répertoire incertain ou analyse encore possiblement active | Aucune suppression des copies utiles à l’arrêt, à la reprise ou à l’analyse |
| Ancien dossier | Dossier absent des allocations de l’instance | Aucun retrait |

</frozen-after-approval>

## Code Map

- `src/adapters/analysis/graphify.ts` détient la création du dossier, la preuve `owner.confirm`, les résultats en mémoire et la capture dont l’analyse peut dépendre.
- `src/adapters/analysis/graph-owned-run.ts` relit `terminal.json` lors de la récupération. Conserver ce fichier et les métadonnées de génération à l’identique.
- `src/core/graph-coordinator.ts` connaît le dernier consommateur de chaque capture après génération ou revalidation.
- `resources/graphify/files.py` lit les originaux par le reçu `data/files.json`. Une revalidation identique peut conserver le reçu précédent.
- `scripts/qualification/graph-project.mjs` lit le graphe natif après la publication. Adapter les futures preuves à la suppression des copies temporaires et garder les preuves historiques exactes.

## Tasks & Acceptance

**Execution:**

- [ ] `src/adapters/analysis/graphify.ts` et `src/core/graph-coordinator.ts` — Lier le nettoyage des copies à une allocation physique et à la preuve d’arrêt. Libérer le miroir après son dernier usage sur les deux chemins du coordinateur.
- [ ] `scripts/qualification/graph-project.mjs` — Préserver la vérification des relations et du reçu terminal, et vérifier les copies supprimées sur un témoin.
- [ ] Tests ciblés — Ajouter les cas du tableau et vérifier un aperçu conservé après revalidation, un arrêt inconnu et un dossier historique intact.

**Acceptance Criteria:**

- Given une génération arrêtée avec preuve et un aperçu encore disponible, when le nettoyage se termine, then les octets des copies ciblées baissent et l’aperçu relit l’original autorisé.
- Given un arrêt inconnu, un emplacement non possédé ou une identité physique changée, when la routine est appelée, then les fichiers concernés restent intacts.
- Given une réouverture sans relance, when l’utilisateur consulte le graphe, then le graphe normalisé et la récupération continuent de fonctionner.

## Implementation Notes

Reconnaissance terminée. Le candidat Windows en essai utilise les sources réelles de Madness. Écrire les fichiers produit de cette story après la comparaison terminale de ce candidat.

## Plan Change Log

- Reprise après Quick. Maintenir les tests natifs, l’aperçu, la conservation de l’arrêt inconnu et le rendement du nettoyage. Revoir la preuve de création, l’exécution par descripteur et la sauvegarde avant retrait.

## Review Triage Log

- Q1 élevé. Un miroir préexistant peut être enrôlé après le refus de création. Le futur nettoyage doit partir d’un reçu d’allocation ou de création émis par le propriétaire, avec les entrées réellement produites.
- Q2 élevé. Contrôler puis supprimer par chemin laisse une fenêtre de remplacement Windows. Le futur nettoyage doit conserver des descripteurs physiques pendant la suppression et refuser les redirections ou échanges.
- Q3 moyen. Une confirmation tardive ne réexamine pas les copies créées pendant l’arrêt initialement inconnu. L’état doit garder l’identité de l’allocation sans rendre les copies éligibles avant la réconciliation.
- Q4 élevé. La publication de l’état et la normalisation ne garantissent pas la sauvegarde. Conserver la copie native jusqu’au reçu durable requis.
- Q5 moyen. Mesurer le volume de départ avec un point d’observation qui précède le retrait de façon prouvée.

Les essais ciblés ont vérifié le comportement nominal, la revalidation et l’aperçu. La revue a démontré des cas supplémentaires qui empêchent de livrer ce nettoyage. L’implémentation a été isolée en copie locale et retirée du build courant. Reprendre le plan et traiter ces cinq constats avant une nouvelle qualification.

## Verification

Le témoin natif du paquet 0.2.21 a fini et le profil de qualification est fermé. Le worker possède les fichiers Graphify et le banc de qualification liés à ce plan. D’autres changements peuvent exister, dont une correction indépendante des drapeaux dans le renderer. Préserver ces fichiers et la variation EOL préexistante dans tests/bmad-help-boundaries.test.mjs.
