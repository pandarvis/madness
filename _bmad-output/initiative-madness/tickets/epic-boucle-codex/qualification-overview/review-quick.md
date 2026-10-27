# Revue Quick1.8

Relecteur technique frais, contexte propre, même capacité que le parent. Lecture du plan, des trois contrats adoptés, des instructions du dépôt et du diff unifié incluant les nouveaux fichiers. Inspection uniquement, sans tests exécutés par le relecteur.

| Constat | Vérification parent et correction | Recontrôle |
|---|---|---|
| Q1 — la sélection historique masque la nouvelle conversation après lancement | Medium/patch. Réservation du lancement explicite puis sélection de sa conversation seulement après confirmation corrélée ; retour tardif, erreur et navigation annulent la cible sans perdre les brouillons. Tests Mary réussi/échoué et Forge. | Même Quick : résolu par inspection. |
| Q2 — arrivée d’attente silencieuse à l’accueil | Medium/patch. Région polie atomique, signature stable des attentes et de leur état ; annonce arrivée/envoi/disparition sans annoncer les fragments. Test UI de transition. | Même Quick : résolu par inspection. |

Les quatre tests ciblés sont consignés dans `review-fixes-targeted.log`. Vérification globale parent après la dernière correction :287/287 (`tests-parent-final.log`). Aucun correctif de cette revue différé ; pas de nouvelle chasse pendant le recontrôle.
