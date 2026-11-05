---
id: 2
type: story
title: "Afficher la progression du démarrage de Madness"
parent: none
covers: []
after: []
refined: false
hitl: false
risk: medium
---

# Afficher la progression du démarrage de Madness

## Description

Afficher l’illustration fournie pendant l’ouverture de Madness. Superposer la barre du kit à l’illustration et faire avancer son remplissage lorsque les étapes du démarrage aboutissent. Un mode démo explicitement sélectionné et signalé peut ralentir une progression simulée.

## Requirements

Verify: le fond et la barre restent alignés quand la fenêtre change de taille. Un démarrage normal laisse place à l’espace de travail dès qu’il est prêt et rend visible un échec. Une démo affiche clairement son état simulé et ne modifie pas le démarrage normal.

## References

- Ressources — branche `codex/atelier-immersion`, commit `e9431d2`, `resources/splash/madness-launch-v4-fhd.png` et `resources/splash/loading-bar-v4/README.md`. Le README place la barre de 320 × 26 à x52/y1008 dans le rectangle affiché du fond de 1920 × 1080.
- Design — `_bmad-output/initiative-madness/ux-madness/DESIGN.md`, charte atelier.

## Notes

- Decision: 2026-11-05 — Demande du porteur après le travail courant. Intégrer le fond et la barre fournis dans un lot séparé. Le mode de présentation est un choix de livraison sous mandat autonome. Risque moyen car un écran bloqué pourrait masquer une panne ou retarder l’accès au projet.
