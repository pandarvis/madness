# Recontrôle Quick — même relecteur

Diff004 : bd0cacdc1122614d034c9035dea0e855117cbf93050c76932d0765d0179acacb. Inspection seule des cinq constats initiaux, aucune nouvelle chasse/test/modification.

- Q1 — Résolu à l’inspection : la revalidation du dernier complet conserve `snapshot:null`, l’échec et une fraîcheur `unverified` ; les grants restent liés au complet.
- Q2 — Résolu : les six extensions sont admises par le helper Graph, avec les contrôles UTF-8, binaire et physiques conservés.
- Q3 — Résolu : `GRAPH_CHILD_timeout` produit désormais un terminal `timeout`, avec arrêt confirmé ou inconnu selon le propriétaire.
- Q4 — Résolu : le sélecteur permet d’explorer complet et partiel avec leurs identités et vues distinctes, sans revalidation trompeuse du complet historique.
- Q5 — Résolu : `packages` et `resources` rejoignent l’inventaire, le miroir et la recapture terminale ; pins et révision de périmètre sont actualisés.
