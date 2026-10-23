# Réconciliation du ticket et du spine

**Verdict : couverture cohérente, avec un complément ciblé requis pour R23–R24.** Relecture intégrale du ticket et du spine du 23 octobre 2026. Les renvois aux contrats UX via AD-8 sont des règles applicables ; les portes G0–G3 sont des travaux futurs, sans preuve actuelle d'application intégrée.

Les décisions récentes du porteur priment : Electron + TypeScript, electron-vite + React + electron-builder, interface/cœur/connecteurs, Codex d'abord puis Claude Code et Copilot, persistance sans relance, français/anglais, clair/sombre et maintenance simple avec previews admises. Les anciennes questions C6/Q1/Q5/Q6 seront réconciliées par Sofia ; elles ne constituent pas des objections. Le contexte d'un projet personnel en environnement professionnel ne crée ici aucune exigence d'exploitation d'entreprise supplémentaire.

## Couverture

| Exigence | Transmission | État |
|---|---|---|
| R1 | AD-2, AD-5 : contexte et projets conservés ; AD-3 : preuves locales | Couvert |
| R2 | AD-4, AD-5, AD-8 : attentes communes accueil/projet et accès UX | Couvert |
| R3 | AD-6, AD-7 ; G2–G3 : préconditions, diagnostic et profils | Couvert |
| R4 | AD-6 ; G3 : plan exact, accord, annulation et vérification | Couvert |
| R5 | AD-2, AD-3 : rattachements capturés, initiative facultative selon l'outil | Couvert |
| R6 | AD-3, AD-8 : état, preuves, sources et inconnues | Couvert |
| R7 | AD-3, AD-5 ; G2 : invalidation/relecture externe sans effacement ni attribution inventée | Couvert |
| R8 | AD-3, AD-4 : autorités et états distincts | Couvert |
| R9 | AD-3 et contrats UX via AD-8 : aide réelle, recommandation distincte, alternatives sans séquence imposée | Couvert |
| R10 | AD-3, AD-7 et contrats UX via AD-8 ; G2 : catalogue réel, métadonnées exclues et recherche | Couvert |
| R11 | AD-2, AD-7 et fiche UX via AD-8 : invocation réelle, contexte, conditions et indisponibilité | Couvert |
| R12 | AD-2, AD-3, AD-7 ; G1–G2 : workflows natifs selon leurs conditions et dialogue réel | Couvert |
| R13 | AD-2, AD-4, AD-7 ; G1 : identité, contexte, événements et échanges | Couvert |
| R14 | AD-4, AD-6 et contrats UX via AD-8 ; G1 : demande active, portée et accord limité | Couvert |
| R15 | AD-4, conventions d'affichage et AD-8 : attentes durables, états et action attendue | Couvert |
| R16 | AD-4, AD-5, AD-8 : brouillon, garde d'envoi et accusé fiable | Couvert |
| R17 | AD-4–AD-7 ; G1 : capacités réelles et réconciliation avant rejeu | Couvert |
| R18 | AD-4 : récapitulatif et distinction tour/workflow/validation | Couvert |
| R19 | AD-1, AD-2, AD-3, AD-6 et panneau UX via AD-8 ; G3 : aperçu, provenance et retour éditeur observable | Couvert |
| R20 | AD-5, AD-8 : contexte conservé et préférence utilisable en mémoire | Couvert |
| R21 | AD-8 : clavier, focus, zoom, annonces et mouvement, contrats applicables aux variantes | Couvert |
| R22 | AD-4, AD-7, AD-9 ; G1 : capacités, indisponibilité, fraîcheur et récupération | Couvert |
| R23 | AD-7–AD-9 ; G0–G3, reports compatibilité/distribution : paquet et connexion ciblés | Partiel : voir E1 |
| R24 | Cartographie « validation intégrée », AD-7–AD-9 ; G0–G3 | Partiel : voir E1 |
| C1 | AD-8 : contrats UX gouvernant les comportements et variantes | Couvert |
| C2 | Scope, AD-7, G1–G2 et report Extensions : Windows/Codex/BMad qualifié en première livraison | Couvert |
| C3 | AD-3, AD-5 et report Extensions : artefacts existants sans reconstruction de sessions | Couvert |
| C4 | AD-7, pistes connecteurs, G1 : interfaces et authentification à qualifier | Couvert |
| C5 | AD-8 et introduction des portes : contrats adoptés et simulation distincte des preuves réelles | Couvert |
| C6 | AD-1, Stack et Structural Seed : décision récente Electron/React/packaging ; actualisation Sofia explicitement reportée | Couvert par décision récente |

Le dialogue, les formes d'interaction et les conditions des workflows restent natifs dans AD-3/AD-7 ; aucun sous-ensemble artificiel ni simple texte final n'est substitué à R12–R13. Les détails des alternatives, fiches, aperçus et états sont conservés par le renvoi normatif aux contrats UX, sans devoir être recopiés dans le spine.

## Écart concret

| ID | Sévérité | Exigence | Constat et correction minimale |
|---|---|---|---|
| E1 | P2 | R23–R24, Done when 6 | La cartographie nomme une validation intégrée mais aucune règle ni porte ne requiert explicitement l'installation par un autre développeur sur une machine Windows cible et la vérification des trois parcours avec une personne peu familière de BMad. G0 exige un paquet qui démarre ; G1 vérifie un workflow et ses capacités ; G2–G3 qualifient BMad et les opérations. Ces preuves peuvent toutes passer sans démontrer compréhension de l'état, choix d'une alternative, dialogue, approbation et retour au livrable par un novice. Ajouter une condition avant livraison : consigner sur l'application installée, avec vrais projets et vraie connexion Codex, les trois parcours de R24 par une personne peu familière de BMad, leurs résultats et limites observées, sur une machine Windows cible. Les contrôles intégrés des contrats UX doivent faire partie de cette preuve. Cela complète les portes techniques sans en affirmer la réussite. |
