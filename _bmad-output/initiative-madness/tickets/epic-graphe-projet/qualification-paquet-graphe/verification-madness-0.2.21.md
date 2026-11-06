# Graphify sur le dépôt Madness

Le paquet Windows 0.2.21 a produit et affiché un graphe partiel en 328,040 secondes. L’essai a utilisé le vrai worktree Madness dans un profil isolé. Il a retrouvé GraphCoordinator dans les 269 fichiers capturés, compté 2 923 nœuds et 9 497 relations, vérifié trois sources et le brouillon octet par octet, puis confirmé l’arrêt et supprimé le profil.

## Diagnostic

- La 0.2.19 incluait la copie générée de Graphify et atteignait SOURCE_TOTAL_LIMIT. La capture reconnaît désormais le chemin exact, le manifeste identique et les chemins de l’assemblage déclaré. Un fichier supplémentaire rend l’assemblage ordinaire pour l’inventaire.
- Une fois la capture corrigée, le superviseur atteignait le délai de 120 secondes pendant l’analyse. Le budget d’analyse est passé à six minutes, avec une garde distincte pour le lanceur, l’empreinte terminale et la fermeture.
- Le moteur a ensuite produit l’artefact. Le normaliseur a isolé les deux nœuds de dépendance `node:fs` et `playwright-core`, dont le champ de fichier portait le nom du module. Le rejeu de l’artefact exact conserve leurs relations sans leur donner de référence de fichier. Le paquet final a passé le parcours réel.

## Preuves

- [Exécution réelle sur le paquet 0.2.21](./witness-madness-2026-11-06-005.json)
- [Rejeu de l’artefact natif précédent](./witness-madness-replay.json)
- [Empreintes du paquet](./manifest-summary-0.2.21.json)
- [Nettoyage des deux intermédiaires](./cleanup-graph-nov6.json)

La revue de la banderole, les tests de normalisation et les contrôles ciblés ont passé. Un contrôle de format qui avait expiré pendant l’empaquetage a passé isolément. La relecture a identifié un cas limite si le pont d’interruption échoue après avoir quitté puis rouvert le panneau. Le rendu courant de l’arrêt et le retour après une demande acceptée ont été vérifiés.

Les 93 contrôles de protocole et de capture locale passent. Le témoin d’initialisation sur le paquet intermédiaire 0.2.20 a vérifié 588 ajouts et le retour au brouillon. Ces preuves portent sur leurs artefacts et leurs cas respectifs. La qualification intégrée G2, la matrice G3, l’essai utilisateur G4, la matrice G5 et la rétention prospective restent à finaliser.
