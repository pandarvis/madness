# Développer dans le back-end BIA

Le CRUD Airport de BIA Demo 7.0.5 montre comment raccorder une fonctionnalité. Dans le projet cible, repère les équivalents des classes et conventions ci-dessous.

| Couche | Rôle dans le CRUD | Exemple dans BIA Demo |
| --- | --- | --- |
| `Domain` | Entité et mapping du domaine vers le contrat | `Fleet/Entities/Airport.cs`, `Fleet/Mappers/AirportMapper.cs` |
| `Domain.Dto` | Contrat d’échange | `Fleet/AirportDto.cs` |
| `Application` | Opérations métier via le service d’application et le dépôt | `Fleet/IAirportAppService.cs`, `Fleet/AirportAppService.cs` |
| `Presentation.Api` | Routes, contrôle des permissions et appels au service | `Controllers/Fleet/AirportsController.cs` |
| `Infrastructure.Data` | Persistance et modèle EF Core | `DataContext.cs` et les builders du projet |

Pour un CRUD classique, examine les bases BIA utilisées par les voisins. Airport s’appuie sur `BiaControllerBase`, `CrudAppServiceBase` et `BaseMapper`. Adapte la clé et les variantes de l’entité (équipe, versionnement ou archivage, selon le besoin). Place les contraintes métier dans la couche correspondante et vérifie le mapping dans les deux sens quand l’écriture le requiert.

Pour une action protégée, vérifie le contrat de permission de bout en bout. En V7, compare notamment `PermissionId.cs`, `bianetpermissions.json`, les attributs du contrôleur et le câblage du front. Pour la persistance, repère le fournisseur utilisé et le projet de migrations existant. Le template V7 sépare les migrations PostgreSQL et SQL Server.

Pour une inscription de service, examine le conteneur IoC du projet et l’auto-enregistrement avant d’ajouter une inscription explicite. En V7, le conteneur partiel côté projet cohabite avec sa partie sous `Bia/`. Place les inscriptions métier dans la partie projet. Vérifie la compilation de la solution et les tests pertinents dans le projet de tests existant.
