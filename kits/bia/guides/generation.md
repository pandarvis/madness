# Générer une fonctionnalité avec BIAToolKit

## Créer un projet sur le socle

Pour un projet neuf, choisis une version publiée de BIA Template compatible avec la cible demandée. Dans la création de projet BIAToolKit, renseigne la société, le nom du projet, les fronts et les fonctionnalités de départ selon les besoins. Vérifie les versions et les réglages enregistrés sous `.bia/`, puis compile le socle généré avant d’ajouter le code métier. Si BIAToolKit est indisponible, consigne la version du template et les options nécessaires pour reprendre la création.

## Ajouter à un projet existant

1. Identifie la version BIA, l’entité, le domaine et le front cible. Examine les générations existantes et les réglages du projet sous `.bia/`, notamment `BiaToolKit_FeatureSetting.json` s’il est présent.
2. Choisis l’opération BIAToolKit selon le besoin. **DTO** génère le contrat et le mapper. **Option** raccorde les valeurs de sélection côté serveur et dans le front. **CRUD** produit la fonctionnalité et insère les raccordements selon le modèle choisi.
3. Vérifie la compatibilité de la version installée de BIAToolKit avec le projet. Les T4 de la référence publique sont rangés par version sous `BIA.ToolKit.Application.Templates/`. Par exemple, `_7_0_0/manifest.json` décrit les fichiers, les destinations et les insertions du socle V7. Vérifie les marqueurs BIAToolKit attendus lorsqu’un fichier existant doit être complété.
4. Prends un point de comparaison Git avant génération. Vérifie ensuite le diff des créations, insertions et régénérations, ainsi que les historiques sous `.bia/` si l’outil en écrit. Contrôle notamment les mappings, les permissions, le câblage front et les personnalisations déjà présentes. En cas d’erreur, vérifie le diff avant de réessayer, car une génération peut avoir écrit une partie de ses sorties.
5. Si le générateur compatible est indisponible, utilise les conventions d’une fonctionnalité voisine de la même version et signale que le résultat a été écrit manuellement.

## Utiliser le MCP quand le client l’expose déjà

Si le client expose BIAToolKit, vérifie les capacités annoncées par le serveur installé et les effets de chaque opération. Utilise l’interface BIAToolKit pour les opérations disponibles uniquement dans l’outil installé. Un résultat MCP rapporte l’issue de l’appel. Le diff et les contrôles du projet établissent ce qui a effectivement changé.
