# Audit parent de la matrice1.8 avant revue

Sources effectivement lues : diff complet conservé temporairement, code modifié, neuf tests purs, extension des tests UI, deux bancs overview, journaux et profils JSON. Suite prescrite283/283, zéro échec/skip, puis six contrôles UI ciblés ; compilé8, paquet8, natif4 et Windows5 réussis avant corrections de revue. Aucun reçu natif déduit des seules fixtures Electron.

| Ligne | Couverture exécutée et réussie |
|---|---|
| Attente | Tests projection attente/contexte, expiration/fin, sending ; UI lien clavier, réponse explicite et retrait commun ; natif question, corps de reçu exact et état durable. |
| Contexte | UI deux destinations concurrentes, ancien retour, expiration pendant sélection et sélection échouée ; banc compilé/paquet conversation exacte et focus. |
| Récupération | Test projection arrêt global sans mutation ; compilé/paquet récupération sans attribution de projet et lecture locale sans compte. |
| Fin connue | Projection fin corrélée distincte de message complet, choix/effet/portée/observations, deux tours ; natif texte exact et aucune clôture ou acceptation fabriquée. |
| Historique | Projection tour inconnu/demandes inactives ; compilé/paquet réouverture des octets exacts et réseau nul après hook ; natif restauration sans nouvel appel open. |

Deux constats Quick et F3 Impeccable nécessitent des corrections locales ; les preuves ci-dessus restent celles d’avant revue. Vérification finale à renouveler après les patches, sans prétendre qu’un fichier de test simplement présent constitue une preuve.

## Recontrôle final après patches

Q1/Q2 résolus au recontrôle du même Quick. F1/F2/F3 résolus au verdict final du même finisseur, dont libellé de phase historique et régression expirée/inactive1/1. Suite parent287/287, types/build/installateur, compilé8/8, paquet8/8, runner loopback4/4 et Windows5/5 réussis après le dernier correctif. Restauration personnelle6/6 sans moteur ni réseau après hook,27 empreintes inchangées, compte lisible. Aucun correctif de cette matrice différé ; détails et limites dans `parent-verification.md`.
