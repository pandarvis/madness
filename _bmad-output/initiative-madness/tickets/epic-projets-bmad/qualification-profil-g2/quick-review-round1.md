# Revue Quick — premier tour, avant reprise1

Relecteur frais `/root/g2_quick_review`, inspection seule du diff `madness-g2-review-pH5urC/changes.diff`, plan et contextes. Aucun test ni édition par le relecteur. Les trois constats ci-dessous ont été vérifiés et triés par le parent dans le plan ; ce rapport ne classe pas leur sévérité.

- `prototype.py:254` — Appartenance contrôlée dans un seul sens. Si deux modules déclarent `sample` dont le record désigne seulement le second, `listed_member` reste vrai et `member-missing` accepte le premier grâce à l’ensemble global `installed`. `classify()` peut produire `candidate-observed` malgré l’incohérence. M3 ne couvre pas cette déclaration contradictoire entre modules.
- `prototype.py:269` — Les preuves tickets ne sont pas conservées séparément. `join_plans()` écrase le statut de feuille par celui du plan et le wrapper ne retourne que les lignes fusionnées. Dans M13, `done` disparaît au profit de `in-progress`. Le reçu temporaire brut n’est pas sérialisé dans l’observation puis est supprimé au nettoyage ; le tracker ne remplace pas la preuve de feuille.
- `profil-g2.md:182` — La reproduction réécrit résultats et journaux avec date/durées/UUID nouveaux puis vérifie l’ancien sceau sans `--seal`. Même un succès du banc échoue à cette vérification et remplace les preuves historiques. Séparer vérification existante et nouvelle exécution enregistrée ailleurs.

Sources exactes du tour conservées dans `iteration-0.zip` ; la reprise1 et sa nouvelle revue restent requises, aucune résolution déduite de la seule planification.
