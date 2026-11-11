# Développer une fonctionnalité Angular BIA

Dans BIA Demo 7.0.5, le CRUD de référence se trouve sous `Angular/src/app/features/airports/`. Il sépare le modèle et la configuration des champs, les composants de formulaire et de tableau, les vues, les services d’accès aux données et l’état NgRx. Les données d’option réutilisables ont leur propre domaine sous `src/app/domains/airport-option/`.

- Pars de la configuration CRUD et des composants de la fonctionnalité voisine. Pour Airport, le formulaire étend `CrudItemFormComponent`, l’accès aux données étend `AbstractDas` et le service de fonctionnalité étend `CrudItemService`.
- Suis l’organisation de la version cible pour les routes, le chargement et l’état. Dans le module Airport V7, `PermissionGuard` et la configuration des permissions s’appliquent aux routes. Raccorde également les actions affichées et vérifie le comportement avec et sans la permission.
- Utilise les points d’entrée publics de la bibliothèque UI du projet. La V7 de référence utilise `@bia-team/bia-ng` et PrimeNG. Choisis les composants, layouts et variantes disponibles dans le projet cible.
- Utilise les ressources i18n de l’application pour les nouveaux libellés. La démo et le template V7 les rangent sous `src/assets/i18n/app/`.

Vérifie les scripts `build`, `lint` et `test` dans le `package.json` du front concerné, puis exécute les contrôles pertinents. Pour un changement de contrat, compare le modèle front, le DTO et l’opération API associés.
