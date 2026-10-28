# Correctif13 — contrôle natif des sessions Forge

Le contrôle exigé à l’activation du skill Forge est désormais demandé par un outil sans argument, réellement exécuté et conservé au même appel/tour/contexte avant le premier terminal ou init. Les seuls emplacements du profil sont lus ; aucune reprise, lecture libre, nouvelle authentification ou écriture dans un ancien journal n’est ajoutée. Une précondition fraîche précède aussi les effets de création. Le refus personnel001 de1.11 reste inexpliqué : ce correctif traite le contrôle manquant séparément confirmé.

## Résultat final

- Suite complète après correction : **338/338**, zéro échec/annulation/saut/todo. Elle inclut20tests du harnais1.11 encore en cours ; elle ne clôt pas cette story. Source : full-tests-final.log.
- Types/build/installateur0.1.2 réussis ; Electron45 et dépendances conservés. Paquet final :9contrôles Forge synthétiques avec vrais scripts/journal/outils hôte, puis5régressions Windows, profils nettoyés.
- Matrice6lignes couverte et réussie : matrix-audit-final.json. Aucun modèle externe dans ce correctif.
- Audit indépendant A1 : mutation de répertoire pendant un scan vide corrigée ; même expert recontrôle8/8scénarios, refus avant observation. Q1 ne modifie pas ces fonctions de garde, comparaison source conservée.
- Quick Q1 : une entrée UTF-8 valide pouvait produire un journal terminé trop grand pour le lecteur32Kio. Rouge natif reproduit après init/finish, borne64Kio suffisante pour toutes les entrées déjà admises, cycle de requalification et frontières2/2verts. MêmeQuick confirme résolu. Fixture coordinateur complémentaire relue : aucun constat. Aucun correctif restant ou différé.

## Artefact installé

Le manifeste final est **installation-final/release-manifest.json**,120inputs et3artefacts. Il décrit le workspace courant avec ses empreintes, y compris scripts/tests1.11 non encore committés ; aucun checkout propre n’est prétendu. L’ancien manifeste1.9 reste intact.

| Artefact final0.1.2 | SHA-256 |
|---|---|
| Installateur | 2e89516426d5b58bf1adb3575062388533f6a01e87896dbabc0bf3ff9b66a008 |
| ASAR | 9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4 |
| Runner Python inchangé | 6d1ebd4e04594ea3f15a39e6e8a1e71ac06a3f0fc8705a7495da47d854ccaed5 |

Madness fermé et inventaire vérifié, NSIS retourne0. Les42empreintes contrôlées restent identiques après remplacement. La réouverture normale réussit7contrôles : artefact/runtime conformes, demandes historiques inactives, compte lisible, aucun moteur/réseau spontané pendant les3secondes instrumentées, vraie fermeture et données conservées. Les41fichiers métier/chiffrés et LocalState restent identiques après réouverture ; aucun déchiffrement/copie du coffre par le banc. MIA et madness seuls restent dans les récents ; la fenêtre de contrôle est fermée.

Preuves : installation-final/installation-before.json, installation-command.json et installed-reopen-001/report.json. Le premier candidat0.1.2, ASAR25400621028638c68528178774724362b5434093cbc25048ece8f61247d7b88f, reste historique dans les reçus initiaux ; même version ne signifie pas mêmes octets. Aucun de ces reçus n’est écrasé. Les383preuves historiques contrôlées sont inchangées.

## Limites et suite

Les essais d’implémentation échoués et leurs recontrôles restent distincts : contraintes sandbox UV/temp, puis privilège Windows de lien symbolique de fichier remplacé dans le banc par une vraie jonction au même chemin. Les gardes, attentes et cas de hardlink restent conservés ; la suite finale les exécute. Sources sous implementation-attempts/ et Q1-*.

La preuve intégrée personnelle avec modèle, G1 et la clôture de l’epic appartiennent toujours à1.11. Les anciennes preuves0.1.1 restent bornées à cet artefact. Refonte Sally/experts/Impeccable, catalogue, temps/coût produit, initialisation et graphe restent dans la suite du mandat. Aucune nouvelle acceptation humaine/visuelle globale n’est déduite.
