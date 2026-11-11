# Identifier le socle du projet

1. Repère le dossier du projet qui contient la solution `.sln` ou `.slnx` et les fronts Angular. Dans les références BIA, le back est sous `DotNet/` et le front sous `Angular/`.
2. Relève `FrameworkVersion` dans le fichier `Bia/Constants.cs` du projet Crosscutting.Common. Vérifie les `TargetFramework` des `.csproj` et les versions des dépendances centrales dans `Directory.Packages*.props` si ces fichiers sont présents.
3. Pour chaque front concerné, relève les dépendances de `package.json` et du verrou associé. Vérifie si les composants BIA viennent d’un paquet npm ou d’une bibliothèque dans le dépôt et suis les imports publics déjà utilisés.
4. Pour une fonctionnalité, prends d’abord comme modèle une fonctionnalité voisine du projet. Pour un exemple externe ou une migration, sélectionne une référence compatible avec la version identifiée et note sa révision.

## Références publiques épinglées

| Dépôt | Révision | Usage |
| --- | --- | --- |
| [BIA Demo](https://github.com/BIATeam/BIADemo/tree/a022993de462b9daeedf6f32d3b12054c9ce3735) | BIA 7.0.5 | Exemple CRUD Airport de bout en bout sur BIA 7. |
| [BIA Template](https://github.com/BIATeam/BIATemplate/tree/955d75afc615e06c735f35b4295c585c2204c454) | BIA 7.0.5 | Structure du socle V7 et point de comparaison pour une migration vers cette version. |
| [BIAToolKit](https://github.com/BIATeam/BIAToolKit/tree/c8952de2b4bb0bb18a94e37742fcd4dd1ceea42a) | Modèles T4 versionnés | Génération de code et références de migration. |

Les révisions publiques de la démo et du template ci-dessus utilisent Angular 21, `@bia-team/bia-ng` 7.0.5 et PrimeNG 21. Pour une autre version de BIA, sélectionne dans les dépôts accessibles à l’équipe le tag ou commit de référence correspondant au projet.
