---
type: epic
title: "Explorer le graphe du code et des dépendances"
parent: initiative-madness
covers: ["R28", "R29", "R30", "R31"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
after: [epic-initialisation-bmad]
refined: false
risk: high
---
# Explorer le graphe du code et des dépendances

## Description

Après la base Windows/Codex qualifiée par l'epic 3, le paquet Windows intègre le graphe Graphify à la demande : recherche et relations accessibles, ouverture du fichier, provenance, confiance et fraîcheur. Le port d'analyse précède ses consommateurs, Sally définit le parcours avec Impeccable, puis G5 qualifie runtime, effets confinés, format et comportement réel. Sa livraison clôt ce volet obligatoire de la V1 ; son usage reste optionnel.

## Outcome

Depuis le projet ouvert dans la base Windows/Codex, un développeur génère et explore le graphe local du code et des dépendances, retrouve les fichiers associés et comprend les limites, incertitudes et changements de fraîcheur.

## Done when

1. Le port d'analyse et GraphSnapshot sont établis sous la propriété du cœur avant leurs consommateurs ; Sally définit avec Impeccable la vue et les parcours accessibles, selon les thèmes et langues de Madness, avant leur implémentation.
2. Dans le paquet Windows, la génération et l'actualisation à la demande analysent le code et les dépendances, sans modèle implicite ; G5 vérifie runtime, paquet, profil de format et écritures confinées par projet/analyse, sans mutation des sources ou intégrations de l'utilisateur.
3. Recherche, exploration et liste de relations accessibles conservent sens, provenance et niveaux de confiance ; la sélection rejoint le panneau de fichiers dans le projet du snapshot, après vérification de sa référence.
4. Absence, analyse, résultat disponible, partiel, ancien, incompatible et échec sont distincts. Modifications non commitées ou pendant l'analyse, rafraîchissement, interruption et échec sont vérifiés ; le dernier graphe complet connu reste identifiable avec sa fraîcheur.
5. G5 consigne les essais sur dépôt représentatif : plusieurs projets, génération, recherche, accès fichier, fidélité des relations, annulation, erreurs, contrôles accessibles, durée et mémoire observées ; aucune complétude de la solution ou validation BMad n'est déduite du graphe.
6. Le paquet Windows enrichi livre le module avec ses limites et prérequis réels, après la base qualifiée par G4. L'usage du graphe est optionnel et son indisponibilité laisse BMad utilisable ; sa livraison et G5 sont nécessaires à la clôture de la V1.

## Boundaries

- Consomme la base Windows/Codex vérifiée G4 d'epic-initialisation-bmad, les contrats/cycle de vie/persistance et le paquet d'epic-boucle-codex, ainsi que le panneau de fichiers d'epic-projets-bmad.
- Possède l'adaptateur Graphify et sa normalisation, la qualification du runtime Python et du profil, les ressources locales de rendu et la nouvelle vue conçue avec Sally/Impeccable. Les contrats restent ceux du cœur, sans payload natif Graphify consommé directement par la UI.
- Respecte AD-10 pour les processus, espaces, variables du processus enfant, identité de publication et effets confinés ; les réglages implicites de Graphify ne doivent pas modifier skills, hooks, plugins ou configurations du projet ni de l'utilisateur.
- Premier profil : code, modules, fichiers et dépendances. Analyse sémantique des documents BMad, recherche par modèle, intégration agent/MCP et installation de skills/hooks restent hors de ce profil.
- N'ajoute ni étape BMad obligatoire, ni fournisseur d'agents, ni preuve de validation humaine. L'indisponibilité du graphe ne bloque pas les parcours BMad ; le changement de projet ne réattribue pas un snapshot.

## References

- parent — [Initiative Madness](../../initiative-madness.md), `_bmad-output/initiative-madness/initiative-madness.md` ; Requirements R28, R29, R30, R31 ; Constraints C1–C8, Done when, Boundaries et Notes.
- architecture — [Contrat de Winston adopté](../../architecture-madness/architecture-madness.md) ; AD-1, AD-2, AD-5, AD-8 à AD-10 ; G5. Companion conservé sans modification, AD stables ; les gates restent des preuves à produire.
- design — [Contrat visuel adopté](../../ux-madness/DESIGN.md) ; base française claire acceptée, extensions selon C5.
- experience — [Contrat comportemental adopté](../../ux-madness/EXPERIENCE.md) ; parcours, états et accessibilité, avec décisions récentes de l’initiative prévalant sur les mentions historiques A2/Q6.
- ordre — [Découpage approuvé](../tickets.toml) ; identifiant 4 et prérequis de capacités à reporter sur les stories qui les consommeront.

## Notes

- Decision: 2026-10-23 — Le porteur valide cet epic après la base Windows/Codex ; l'usage du graphe est optionnel mais sa livraison fait partie de la V1. Enveloppe non raffinée, aucune story créée.

- Waits on epic-initialisation-bmad because: la base Windows/Codex vérifiée par G4 est le préalable convenu à cette réalisation et à la qualification G5. Le gate entier est aussi porté par after dans cette enveloppe.
