# Migrer un projet BIA

1. Identifie la version de départ dans le projet et la version d’arrivée demandée. Épingle les tags ou commits de BIA Template correspondant aux deux versions. Relève les Company Files et options du projet si BIAToolKit les a enregistrés dans `.bia/ProjectGeneration`.
2. Établis un point de comparaison Git sur la branche de migration. Compare ou génère deux variantes du template avec les mêmes options afin d’isoler les changements de socle. Compare ensuite ce diff au projet et à ses personnalisations.
3. Applique les changements par étapes cohérentes. Examine les rejets et reporte l’intention du changement dans le projet. Raccorde les dépendances, permissions et migrations EF Core d’après la version cible et le fournisseur effectivement utilisé.
4. Pour V6 vers V7, examine en particulier la séparation des migrations EF, la séparation du conteneur IoC partiel projet et `Bia/`, les dépendances et composants Angular, et la configuration des permissions. Conserve les inscriptions métier dans la partie projet. Le prompt `BIA.ToolKit.MigrationAgent/prompts/migration-v6-to-v7.prompt.md` de BIAToolKit est un repère à confronter aux deux versions du template.
5. À chaque étape, contrôle le diff et compile les couches concernées. Termine avec les tests du back et des fronts modifiés, le contrôle des personnalisations et le relevé des conflits, validations et vérifications reportées.

Si la version installée permet de dissocier la préparation de l’application, examine la comparaison avant de l’appliquer. Indique la version cible et vérifie les options qui remplacent des fichiers du socle avant une exécution qui écrit dans le projet.
