# Témoin local du paquet Windows 0.2.19

Le test ouvre le paquet dépaqueté exact et demande la génération sur deux fichiers TypeScript dans un profil isolé. Il est limité à 45 secondes d'attente d'un résultat et n'utilise aucun compte.

- [Essai 1](./witness-local-2026-11-06.json) — le banc a relu l'état avant l'arrivée de l'événement attendu. Ce résultat ne renseigne pas le fonctionnement de Graphify.
- [Essai 2](./witness-local-2026-11-06-002.json) — la relecture IPC répétée n'a pas observé d'état terminal pendant la fenêtre de 45 secondes. Au début de la fermeture, le dossier de capture comportait la requête, les données et le marqueur d'annulation. Aucun reçu terminal n'était encore présent lors de cette lecture. L'arrêt a ensuite été confirmé, la fenêtre fermée et les deux profils témoins supprimés.

L'ASAR correspond au manifeste du candidat 0.2.19. Ce contrôle ne qualifie ni la génération locale aboutie, ni la rétention des opérations, ni G5. Le délai de 45 secondes est celui du banc court et ne prouve pas une panne du produit.

## Reprise sans la limite de 45 secondes

Le troisième essai a demandé une seule génération sur le même paquet 0.2.19 et le même témoin à deux fichiers. La capture a terminé vers 31 secondes. Le premier artefact natif a été observé vers 98 secondes et le graphe validé à 103,410 secondes. Le résultat est complet pour ce témoin avec cinq nœuds, sept relations et un appel sortant de `useService()`. Les deux sources et le brouillon ont été relus à l’identique. L’application est fermée, l’arrêt du superviseur confirmé et le profil témoin supprimé.

Le délai de 45 secondes appartenait au premier banc court. La reprise vérifie une génération locale sur le paquet exact. La qualification G5 et la rétention des opérations restent à traiter. [Reçu de la reprise mesurée](./witness-local-2026-11-06-003.json).
