# Mandat autonome du 3 novembre 2026

Le porteur demande de poursuivre le backlog jusqu’à l’implémentation complète de Madness, en full autonomie, avec la méthodologie BMad, les revues et commits locaux déjà autorisés. L’ordre des dépendances du tableau gouverne chaque lot. Les décisions de conception nécessaires sont prises et expliquées sous ce mandat ; aucune nouvelle validation visuelle humaine n’en est déduite.

Si Zscaler bloque un essai, conserver dans ce document ou dans le rapport de qualification lié : le test exact, l’artefact/version, la preuve du blocage, sa portée et sa condition de reprise. Continuer les travaux indépendants. Ne pas réessayer en boucle ni redemander le même clic, ni transformer une erreur produit ou un arrêt non prouvé en simple report réseau. Les gates intégrés non vérifiés restent ouverts. Le récapitulatif final sépare les fonctions implémentées, preuves disponibles et essais à reprendre au retour humain.

## Point de départ

- Epic1 clos techniquement ;2.1/2.17/2.2/2.3 built. Prochaine entrée locale2.4.
- Correctif des infobulles revu dans83531ba543c8e743991954b40d8c0dc680c7733a et désormais installé : [preuve](ux-madness/qualification-tooltips-projets/installation-personnelle-001/installation.json).
- App personnelle fermée après réouverture de contrôle ; compte, préférences, projets, conversations, brouillons et sélections locales conservés.
- Aucun test Zscaler nouveau en attente au départ ; aucun préflight réseau routinier nécessaire au travail local.

## Essais externes reportés pendant ce mandat

Aucun à ce point. Chaque futur report doit renvoyer à son rapport précis.

## Clarification de livraison — Graphe

Le porteur confirme à nouveau que cette version doit offrir une zone permettant de voir le Graphify du projet ouvert, en déléguant son emplacement. Choix de conception retenu sous autonomie : onglet projet « Graphe », recherche, zoom, exploration des relations et nœud vers fichier, avec Sally et Impeccable. Cette confirmation renforce R28–R31 et l’epic4 déjà inclus dans la V1 ; aucun placeholder présenté comme intégration, aucun G4/G5 acquis par cette décision.
