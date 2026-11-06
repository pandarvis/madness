---
title: "Normaliser les relations et refuser les artefacts hors profil"
type: 'bugfix'
ticket: 5
created: '2026-11-06'
status: 'built'
baseline_revision: 'cb970205e99a4903cd641b6c133a390434fd2cee'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="mandat autonome, ticket 4.5 raffiné">

## Intent

**Problem:** Le premier onglet Graphe décode déjà le profil Graphify local épinglé. Un artefact mixte peut toutefois être accepté, et un format incompatible apparaît comme un échec ordinaire du moteur.

**Approach:** Admettre le JSON clusterisé versionné avec relations links et écarter le raw edges, les schémas étrangers et les hyperrelations non qualifiées. Préserver le sens attesté, la confiance, le score et les références du corpus. Distinguer les erreurs de format, les données invalides, le résultat partiel et l'arrêt inconnu dans l'adaptateur. Afficher une explication FR/EN pour le format incompatible. Garder le même périmètre code et transmettre uniquement le snapshot normalisé à l'interface.

</frozen-after-approval>

## Implementation Notes

Le contrat et le réducteur gèrent déjà INCOMPATIBLE et inspect-profile. Le témoin exact G2 historique contient des références à package.json dans son corpus qualifié. Le même fichier doit être refusé si ce chemin manque du corpus admis dans le produit.

Le décodeur refuse les enveloppes mixtes et les hyperrelations hors profil. L'adaptateur relaie le format incompatible avec arrêt confirmé seulement sur preuve. Les avertissements natifs alimentent un libellé de couverture limité FR/EN. Le lanceur prend la sortie qualifiée exacte, en vérifie la chaîne physique et porte une nouvelle empreinte épinglée.

## Plan Change Log

## Review Triage Log

- Q1 — réel, patch : la copie garde la chaîne physique et lit le descripteur vérifié, sans partage en écriture. Le test du lanceur utilise maintenant le vrai précontrôle physique et ajoute un lien dur.
- Q2 — réel, patch : la paire native est vérifiée avant de prendre la direction des marqueurs. Un témoin avec une autre extrémité valide reproduisait le défaut.

- Le même relecteur a confirmé Q1 et Q2 résolus après inspection du diff corrigé.

## Verification

- Corpus historiques G2 nominal et G5 raw et mutations synthétiques dans le banc adaptateur. Conserver l'empreinte du fichier natif, le sens des appels et la confiance sans élargissement du corpus produit.
- Vérifier les événements typés après décodage, la priorité à l'arrêt non confirmé et l'exclusion des données natives de la projection. Tests ciblés et TypeScript, sans campagne G5 longue.

Résultats parent : quatre régressions reproduites avant correction, puis 93/93 tests ciblés et un cas Electron de rendu inerte. Deux TypeScript réussis. L'empreinte du lanceur correspond à la valeur épinglée. Le banc du lanceur simule le moteur et ses contrôles physiques, aucun Job natif ou nouveau paquet n'est qualifié par ce contrôle.

Après correction Quick, 94/94 tests ciblés passent, dont le refus du lien dur par le vrai précontrôle Windows. Types et deux empreintes épinglées revérifiés. Le cas Electron sur le rendu, inchangé après Quick, est passé sur le diff initial. Le moteur du banc lanceur est simulé. Aucun nouveau paquet ni G5 final.
