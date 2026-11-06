---
title: 'Afficher la progression du démarrage de Madness'
type: 'feature'
ticket: 2
created: '2026-11-06'
status: 'built'
baseline_revision: '513dac0399338f748d30eec2e9274a14a487059f'
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

**Problem:** L’ouverture de Madness ne montre ni l’illustration fournie ni les étapes réelles du démarrage.

**Approach:** Superposer la géométrie originale de la barre à l’illustration FHD issue de e9431d2. Ancrer la barre de 320 × 26 à x52/y1008 dans le rectangle du fond. Afficher les jalons réellement atteints jusqu’à la restauration initiale, puis ouvrir immédiatement l’espace de travail. Montrer une erreur de démarrage ou le message de récupération de l’espace de travail. Autoriser une simulation courte et clairement signalée uniquement à la demande.

</frozen-after-approval>

## Implementation Notes

One-shot car le flux et les ressources sont définis. Écran statique dans la fenêtre existante. Préchargement et restauration passent par les mêmes ponts IPC. Le mode démo est activé par `--madness-splash-demo` au lancement. Le renderer signale une attente anormale ou une panne et propose de fermer puis rouvrir la fenêtre. La lecture locale refusée laisse place à la récupération intégrée. La fenêtre suit le bootstrap natif Electron, puis précède le chargement de React et la restauration de la vue. Drapeaux FR/USA sur le contrôle partagé, avec nom et action accessibles inchangés.

## Plan Change Log

## Review Triage Log

- Quick Q1 corrigé. La relance est accessible via les commandes natives de fermeture et une nouvelle ouverture.
- Quick Q2 vérifié. Les opérations Main antérieures à la création de la fenêtre restent hors de la progression affichée.
- Quick Q3 corrigé. Suppression du jalon intermédiaire écrasé. Bascule immédiate à la fin.
- Quick Q4 corrigé. Le secours bilingue est affiché par CSS après 16 secondes si le module initial ne démarre pas.
- Quick Q5 corrigé. La confirmation du forfait attend une lecture terminée et un état de travail disponible.
- Même relecteur, cinq résolus. Revue visuelle Impeccable ship ciblée sur les deux vues du splash. Détecteur exécuté une fois. Son unique avertissement désignait une bordure qui dessine la coche préexistante des cases. Le documenteur confirme le maintien du système visuel.

## Verification

- Compilation TypeScript et Vite réussie.
- Electron Windows sur trois profils isolés. Démo signalée, rectangles exacts à moins d’un pixel CSS sur 1000 × 611 et 616 × 826. Démarrage normal puis bascule clavier, drapeaux FR/USA, focus maintenu et préférence `en` persistée. JSON de contexte corrompu inchangé et récupération visible.
- Fond 1920 × 1080 identique à e9431d2, SHA-256 `e5ca5125511979efc0869f25fdb52e3c4263fc618f1c45a35cb9736fa220f262`. Nouvel installateur et qualification G2–G5 hors du lot.
