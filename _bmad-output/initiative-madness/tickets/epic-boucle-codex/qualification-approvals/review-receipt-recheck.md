# Recontrôle ciblé N1–N3

Le 27 octobre 2026, le même reviewer technique `/root/story16_quick_review` a recontrôlé les trois correctifs après l’implémenteur unique. Inspection du diff actualisé et du code environnant, avec lecture des régressions ; aucun test, build, skill ou sous-agent lancé par le reviewer. Il ne s’agit pas d’un personnage BMad ni d’une acceptation humaine.

- **N1 résolu** : transmission confirmée, événement `fileChange` au même thread/tour/item, décision cohérente et tous les effets relus. Le raw reste facultatif. Régressions : raw absent/englobant, mauvais contexte/item/statut, effets divergents et transmission retardée.
- **N2 résolu** : le terminal joint la settlement seulement après transmission et statut natif corrélé. Sans ces preuves, le résultat reste inconnu ; l’arrêt rejette toujours l’attente. Régressions : terminal pendant relecture, arrêt pendant cette attente, transmission non confirmée.
- **N3 résolu** : contrôleur et contexte propriétaires capturés dans `approvalCommand`. L’ancien callback ne peut plus arrêter ou modifier une nouvelle session ; l’ancienne opération demeure inconnue. Régressions : résolution et rejet tardifs, nouvelle session prête et nouvel envoi durable.

**Aucun constat restant prouvé sur N1–N3.** Q1–Q4 avaient déjà été recontrôlés résolus séparément. La vérification finale complète et le parcours réel du paquet restent de la responsabilité du parent ; ce rapport n’en tient pas lieu.
