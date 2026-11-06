---
title: 'Revérifier les sources Graphify sans recopier le code'
type: 'bugfix'
ticket: ''
created: '2026-11-06'
status: 'built'
baseline_revision: 'ba31888f294dfb54eff6a3ff67de4fd93007f775'
route: 'oneshot'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Revérifier les sources d’un graphe conservé produit aujourd’hui un miroir de code que seul le moteur d’analyse pourrait consommer. La revérification doit conserver le même inventaire, la même révision et le reçu nécessaire pour consulter les fichiers originaux, sans écrire le miroir ni lancer une analyse. Les graphes déjà sauvegardés doivent rester revérifiables. La génération continue à fournir le corpus au moteur. Ce changement évite les nouvelles copies lors de la revérification et laisse la suppression automatique des copies de génération à son propre plan.

</frozen-after-approval>

## Implementation Notes

Le coordinateur distingue déjà la commande de revérification. Le même inventaire natif produit les données et les autorisations des deux parcours. Les empreintes de confiance sont recalculées pour toute ressource modifiée. La compatibilité de portée vaut pour la seule nouvelle empreinte dont l’équivalence est vérifiée.

Le vrai lanceur Windows a produit uniquement `revalidate` et `files-read` dans un dossier témoin supprimé. Aucun dossier `analysis` ni miroir, aperçu exact de 25 octets et ancienne révision de portée `7e35efc531604020525e292ad8d4c3f426606d3788116a9d9afdcc52160ffaf1`. Les 31 cas ciblés et TypeScript passent. Les trois échecs initiaux de supervision venaient d’un double de test qui s’arrêtait avant le deuxième enfant. Il vérifie désormais le vrai chemin d’artefact et les erreurs injectées.

## Plan Change Log

## Review Triage Log

- Q1, faible, corrigé et recontrôlé. Les deux commandes produisent la même classe de refus bornés. Le témoin sans source exige le code de processus 2 et le diagnostic NO_CODE_SOURCES. Les empreintes de ressources ont été recontrôlées.

## Verification

- `node --test tests/graphify-corpus.test.mjs tests/graph-coordinator.test.mjs tests/graphify-supervision.test.mjs` vérifie la capture, la revalidation, la preuve de sortie et l’autorisation d’aperçu.
- `npm run typecheck` vérifie les contrats Main et renderer.
