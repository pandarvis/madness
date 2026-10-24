---
title: 'Regrouper les commandes globales dans la barre supérieure'
type: 'bugfix'
ticket: ''
created: '2026-10-24'
status: 'built'
baseline_revision: '456d4d19de0ddb9926cd602a4f115ddc9f3dcd0e'
route: 'oneshot'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** le retour utilisateur du 24 octobre demande une bascule de navigation dans la barre d’action supérieure, comme ChatGPT Desktop, et signale deux commandes « Ouvrir un projet » concurrentes.

**Approche :** regrouper les commandes globales dans une barre commune à toute la largeur, sous le cadre Windows natif : navigation à gauche et une seule ouverture de projet, accessible depuis accueil, projet, rail et fenêtre étroite. La colonne gauche garde ses destinations et projets récents. Conserver le contexte, la saisie, la préférence persistante, le clavier/focus et le tiroir étroit. Mettre à jour les règles UX et le journal avec ce retour explicite ; les anciennes captures restent historiques. Aucun changement de fournisseur, gate, stockage, cadre Windows ou variantes de thème/langue ; une capture d’ouverture ne prouve pas l’installation ni le proxy.

</frozen-after-approval>

## Implementation Notes

- Correction locale estimée à moins de 100 lignes de produit et de contrôles, sans nouvelle API : route oneshot. Mandat autonome conservé ; modifications dans le dépôt actuel autorisées, fichiers non suivis préexistants préservés. Aucun processus utilisateur à arrêter.
- Cibles : App.tsx (placer header au-dessus des colonnes et supprimer les doublons), styles.css (barre/colonnes et boutons selon largeur), windows.mjs (unicité, placement, focus, saisie), DESIGN/EXPERIENCE et journal UX (amendement demandé). Palette et identité reprises du système existant ; contexte Impeccable déjà chargé, aucune nouvelle direction.
- Le contrôle a d’abord échoué sur l’ancien build : aucune barre commune au-dessus des colonnes. Après déplacement, contrôle vert. Le test clavier avec saisie non enregistrée a ensuite reproduit une perte de focus causée par la désactivation native pendant sauvegarde ; la bascule expose maintenant aria-disabled et refuse l’action pendant l’attente, sans retirer le focus. Contrôle ciblé vert après compilation. Les types et 42 tests sont réussis ; le packaging réutilise ces sorties vérifiées.
- Paquet complet reconstruit ; 15 contrôles Windows réussis, nettoyage confirmé. Détecteur Impeccable exécuté une fois : aucun constat. Inspection groupée des deux captures corrigées : barre commune, ouverture unique, adaptation compacte et surfaces acceptées conservées. Aucun gate ni statut de ticket modifié.
- Précision utilisateur reçue pendant la revue le 24 octobre : il a utilisé l’installateur livré précédemment puis lancé l’application installée. Installation et ouverture de cette livraison sont donc confirmées par le porteur ; le nouveau paquet corrigé n’a pas encore ce retour humain. Cette information complète la preuve, sans attester proxy, remplacement, désinstallation ou dialogue fournisseur.

## Plan Change Log

## Review Triage Log

- Revue Quick indépendante terminée : aucun constat, rien à corriger ou différer. Le diff et le code environnant ont été inspectés ; les vérifications exécutables et les captures sont consignées ci-dessus.

## Verification

- `npm test` et `npm run build:win` : tests/types/compilation/paquet réussis ; ne pas arrêter une application utilisateur pour libérer les binaires.
- `node scripts/qualification/windows.mjs` : bouton de navigation dans le header, une seule ouverture visible sur accueil/projet/rail et en petite fenêtre ; commandes fonctionnelles, focus et saisie conservés, réouverture inchangée. Profils isolés, nettoyage confirmé.
- Une inspection batched desktop/compact, puis une confirmation au maximum si correction requise. Détecteur Impeccable une fois pour cette correction, sans cycle de polish.
- Diff relu et revue BMad Quick ; `git diff --check`, commit local exact. G0/1.1/1.2 gardent leurs limites réelles.
