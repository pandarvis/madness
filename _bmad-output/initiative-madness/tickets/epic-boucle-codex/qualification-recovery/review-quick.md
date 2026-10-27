# Revue BMad Quick — story1.7

Relecteur technique frais `/root/story17_quick_review`, même capacité de modèle que le parent, sans contexte de conversation. Plan et contextes, règles du dépôt, diff unifié et appelants lus ; inspection seule, aucun test/build, aucune modification ni sous-agent. Grille Quick épinglée ; autres grilles non activées.

## Constats initiaux

- **Q1**, `src/core/dialogue.ts:361` : une qualification échouée peut appeler le récupérateur partagé sans session dialogue, puis terminer un témoin de connexion en cours. Le bouton Vérifier ce projet est disponible pendant ce témoin.
- **Q2**, `src/renderer/src/App.tsx:357` : STOP_UNCONFIRMED du témoin connexion n’actualise pas la projection dialogue ; aucune réobservation n’est accessible immédiatement sans détour ou redémarrage.
- **Q3**, `src/adapters/codex/owned-run.ts:27` : deux begin concurrents peuvent franchir le contrôle avant la pose du verrou, puis remplacer le propriétaire durable.

Le parent a vérifié chaque constat dans les appelants, puis consigné individuellement verdict et route dans le plan : Q1 high/patch, Q2 medium/patch, Q3 medium/patch. Aucune modification du bloc figé, nouvelle exigence ou nouvelle surface publique.

## Correctifs et recontrôle du même relecteur

- **Q1 résolu** : stopSession réserve désormais la récupération partagée à l’arrêt explicite et la fermeture. Le traitement d’erreur utilise le nettoyage du seul dialogue ouvert. Régressions : qualification échouée, dialogue possédé et blocage inconnu jusqu’à réobservation.
- **Q2 résolu** : le panneau connexion expose l’action existante Vérifier et arrêter Codex dès STOP_UNCONFIRMED, y compris sans projet. La régression UI couvre la projection dialogue encore clear, le clavier, l’absence de vérification de compte et de message.
- **Q3 résolu** : verrou pris avant le premier await et libéré dans finally ; un seul départ simultané et nouvelle tentative après refus disque couverts.

Recontrôle limité aux trois corrections et à leurs régressions directes : aucun constat restant ni régression directement introduite identifié par inspection. Tests lus, sans exécution par le relecteur. Le parent effectue séparément la vérification exécutable finale. Aucun point correctif de cette revue différé.
