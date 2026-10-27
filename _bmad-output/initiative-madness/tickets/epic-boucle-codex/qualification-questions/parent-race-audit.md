# Audit parent — arrêt pendant conservation du reçu

Constat reproduit le 26 octobre avant revue : bloquer l’écriture du statut `sent` après reçu natif, demander `stop`, puis libérer l’écriture. L’interface projetait `sent`/raison nulle tandis que l’annexe conservait `inactive`/`stopped`, tous deux révision3.

Cause observée : la continuation après `await writeQuestion(sent)` reprojetait sans revalider la demande invalidée pendant cette attente. Le verrou d’envoi empêchait bien une seconde réponse, mais pas cette résurrection visuelle. Le contenu de la réponse restait conservé ; aucune seconde écriture native n’a été observée dans ce test synthétique.

Test parent rouge : `tests/.story15-race-audit.test.mjs`, cas unique `parent audit: arrêt pendant écriture durable du reçu ne ressuscite pas sent`, un test exécuté et échoué sur la comparaison état UI/annexe. Ce fichier temporaire sera retiré après intégration de la régression dans la suite normale.

Correction du même implémenteur : promotion `stored` limitée au statut/révision écrits ; revalidation après conservation du reçu, sans reprojection si la demande a été invalidée. La régression intégrée dans `questions.test.mjs` réussit et vérifie aussi l’absence de tout événement `sent` après stop. Dix-huit tests ciblés puis suite complète parent192/192 réussis, types/build réussis. Le fichier parent temporaire a été supprimé après intégration. Ce constat ne modifie ni le bloc approuvé ni les attentes de la matrice.
