# Écrire un kit Madness

Un kit transmet aux agents BMad les références de ton équipe : charte, conventions de code, vocabulaire métier, règles.

1. Copie `madness-kit.toml` à la racine du dossier de références (par exemple le dépôt git où elles vivent déjà). Tes fichiers restent tels quels.
2. Déclare chaque pièce : son chemin, `impose` ou `consulte`, et les rôles qui la reçoivent (`ux`, `dev`, `review`, `all`…).
3. Vérifie le manifeste : `node scripts/madness-kit.mjs check <dossier>` (depuis le dépôt Madness).
4. Dans Madness, Réglages › Kits › « Ajouter une source… », choisis le dossier.
5. Dans un projet, coche le kit dans « Kits du projet ».

Madness copie alors le kit dans `_bmad/kits/<id>/`, note sa version dans `_bmad/kits.lock.toml` et l'écrit dans les surcouches BMad (`_bmad/custom/`). Ce qui est imposé est aussi rappelé à la revue de code et à l'orchestrateur.

Plutôt que d'écrire le manifeste à la main : Réglages › Kits › « Créer un kit depuis un dossier… » en propose un à partir des noms de tes fichiers.
