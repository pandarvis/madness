# Kit Madness pour le socle BIA

Dans Madness, ouvre **Réglages → Kits → Ajouter une source…** et sélectionne ce dossier. Dans le projet BIA, ouvre **Parcours → Kits du projet** et active **Socle BIA**. Madness copie les cinq guides et transmet leurs chemins et les règles aux compétences BMad installées dans le projet.

Depuis le dépôt Madness, valide le manifeste avec `node scripts/madness-kit.mjs check kits/bia`.

Pour un essai en lecture seule, demande à Amelia comment ajouter un CRUD au projet et quelles sources elle utiliserait. Sa réponse doit identifier le `FrameworkVersion` du projet, distinguer le front cible et expliquer où BIAToolKit intervient. Demande ensuite à la revue quels contrôles elle appliquerait au diff de génération.

Les dépôts Git déclarés servent de références de provenance. Dans Madness 0.2.24, l’activation applique les guides et les règles du kit. La consultation des dépôts et la configuration éventuelle de BIAToolKit se font séparément.
