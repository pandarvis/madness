---
title: "Interrompre et restaurer les analyses avec leurs limites connues"
type: 'bugfix'
ticket: 7
created: '2026-11-06'
status: 'built'
baseline_revision: '5fa96454ea85f51919a4f2777eeba14566ad8952'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="mandat autonome, ticket 4.7 raffiné">

## Intent

**Problem:** Une fermeture ou une annulation peut survenir pendant une attente avant le lancement. Un moteur qui se termine sans preuve exploitable peut aussi laisser une tentative affichée active et compromettre le reçu de récupération.

**Approach:** Arrêter avant le lancement dès que possible. Corréler annulation et confirmation à la génération qui possède le Job. Distinguer l'absence certaine de lancement et l'arrêt incertain. Sauvegarder l'état terminal observé ou inconnu, le dernier complet et la distinction entre session et disque. À la réouverture, maintenir la récupération exacte sans relance. Garder les états et données de travail BMad dans leurs périmètres existants.

</frozen-after-approval>

## Implementation Notes

Réutiliser le propriétaire natif, le reçu neverStarted, l'admission commune et la persistance du graphe. Un rejet du port sans reçu ne prouve aucun arrêt. L'adaptateur peut en revanche confirmer l'absence d'effet pour une demande dont il connaît la phase avant réservation. Éviter un marqueur durable de lancement qui précéderait le seul reçu physique correspondant.

La fermeture recontrôle les attentes du coordinateur et du lancement natif. Le reçu neverStarted suit la réservation annulée. Les annulations tardives sont liées à leur génération. Un rejet sans terminal enregistre une issue inconnue, garde le dernier complet et bloque le remplacement du reçu jusqu'à récupération explicite. Après récupération physique, l'issue d'une analyse inconnue reste inconnue et sa candidature ne devient pas l'autorité de fichier.

## Plan Change Log

## Review Triage Log

- Q1 — réel, patch : l'état inconnu reste publié jusqu'au succès de l'écriture du reçu logique. Un échec garde le verrou et la preuve native peut être reprise explicitement.
- Q2 — réel, patch : un nouveau départ retire le candidat dont l'issue était inconnue, conserve l'ancien complet et ne rétablit aucune autorité sur le candidat.
- Q3 — réel, patch : restaurer un arrêt logique inconnu réactive la récupération commune, même si l'adaptateur avait déjà observé l'arrêt natif pendant la fermeture.

- Q1 à Q3 confirmés résolus par le même relecteur. Aucun correctif de cette revue différé.

## Verification

- Fermeture pendant le chargement ou la garde, annulation après réservation sans lancement, annulation et confirmation étrangères, moteur rejeté sans terminal et stockage défaillant. Reprise du dernier complet et des états d'arrêt sans relancer.
- Cas ciblés du coordinateur, propriétaire Windows à reçus simulés, annexe et TypeScript. Pas de campagne longue ni de qualification du paquet final.

Parent : quatre écarts reproduits initialement et deux témoins de revue reproduits en rouge. 111/111 tests ciblés avant patch Quick, dont cas courts Windows de délai, sortie et réservation annulée. Après Quick, 109/109 tests rapides hors lanceur inchangé et TypeScript. Un cas Electron avant patch Quick montre le complet conservé après un arrêt confirmé dont l'issue reste inconnue.
