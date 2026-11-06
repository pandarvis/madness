---
title: "Refactor sweep de Graphify"
type: 'refactor'
ticket: 10
created: '2026-11-06'
status: 'built'
baseline_revision: 'b0d6bb1b546c2dba8a2c15bd5a9139223b01a7c3'
route: 'oneshot'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="mandat autonome, sweep limité aux constats attribués de 4.1 à 4.9">

## Intent

**Problem:** Établir les corrections restant à appliquer avant la qualification G5 et identifier le candidat à transmettre.

**Approach:** Rapprocher les neuf plans, le registre différé et les preuves ciblées. Appliquer un correctif Graphify seulement si sa cause est établie et appartient au sweep. Préserver les écarts de preuve non attribués et les campagnes longues déjà différées.

</frozen-after-approval>

## Implementation Notes

| Périmètre | Disposition |
|---|---|
| 4.1–4.3 | Profil local, contrat Sally et frontière normalisée établis. Les limites de profil et de qualification restent celles des preuves. |
| 4.4 | Les neuf divergences historiques restent lisibles dans le [relevé initial](../qualification-graphe-produit/implementation-handoff.md). Les [dispositions de 2.15](../../epic-projets-bmad/qualification-sweep-projets/dispositions.json) les rapprochent de deux corrections produit et sept corrections de banc, identifiants 5 et 7 à 14, avec reçus ciblés. Les résultats historiques, l’attribution causale au graphe et le contrôle intégré sur le candidat final restent distincts. |
| 4.5–4.6 | Revue de décodage et fraîcheur résolue, y compris copie sur descripteur, identité des références, garde en concurrence et mutation connue. |
| 4.7–4.8 | Reprise durable et clavier revus. Le réducteur Q2 de 4.7 est dans le complément `ea4337a`. Aucun correctif de revue restant pour ces deux lots. |
| 4.9 | Quatre constats résolus. Candidat empaqueté ouvert sur profil témoin. Arborescence et licence épinglées, diagnostic de prérequis avant réservation. Trois sorties intermédiaires retirées. |

Les trois incidents natifs de 2.11 sont rapprochés de 2.15. L’identifiant 1 corrige l’attente du banc Job et dispose d’un positif ciblé. Le 4 sépare benchmark et régression, avec positif fonctionnel et ancien délai conservé. Le 17 n’a pas été reproduit sur une copie de diagnostic avec épingles propres. Le contrôle Graphify standard sur le candidat exact et les causes historiques restent à établir.

La politique de volume et de rétention des dossiers opérationnels reste un écart produit. La 4.4 la transmet à 4.7/4.9. Les captures et analyses créent encore des dossiers privés dans graph-runs-v1 et les trois retraits de 4.9 ne concernaient que des sorties de construction. Le traitement est inscrit au registre pour une correction distincte avant la clôture G5. Il devra distinguer miroir utilisé par un aperçu, reçu exact requis pour une récupération, dossier d’arrêt inconnu et copie transitoire confirmée. Aucun retrait automatique du profil personnel n’a été essayé dans ce sweep.

Le porteur a différé les campagnes longues. Le candidat 0.2.19 reste identifié pour des essais ciblés. La preuve de volume et de rétention fait partie du restant produit, avec contrôle représentatif en 4.11.

Le [reçu du candidat 0.2.19](../qualification-paquet-graphe/manifest-summary.json) identifie la base de 4.11 par le manifeste et les huit empreintes de sortie. La transmission conserve l’ordre et les prérequis 2.16, 3.9 et 3.10. Elle ne change ni leurs états ni l’étendue de la preuve G5.

## Plan Change Log

## Review Triage Log

- Q1 — réel, patch : les neuf dispositions UI de 2.15 sont citées et séparées des résultats historiques et intégrés.
- Q2 — réel, disposition différée : la rétention opérationnelle est ouverte et attribuée à un correctif distinct avant G5. Le nettoyage des sorties de build reste une preuve séparée. Retirer automatiquement des dossiers privés sans politique vérifiée risquerait de supprimer une autorité d’aperçu ou la preuve nécessaire à l’arrêt.
- Q3 — réel, patch : les trois dispositions natives de 2.15, leurs reçus et leurs limites sont distingués.

- Le même relecteur confirme Q1 et Q3 résolus et la disposition Q2 traçable. La politique de rétention reste ouverte.

## Verification

Neuf plans built et onze entrées initiales du registre rapprochés, puis une entrée de rétention ajoutée à la suite. Le manifeste final et huit sorties ont été relus à l’octet. Aucune reconstruction ni suite longue pour cette disposition documentaire.
