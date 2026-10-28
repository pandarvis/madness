# Correctif13 — recherche de sessions Forge

Le connecteur expose maintenant la recherche de sessions exigée par le skill installé et exige son reçu avant le premier terminal et avant création du journal. La recherche reste bornée aux emplacements dérivés du profil, sans argument de chemin, lecture libre ou reprise. Une précondition fraîche est aussi vérifiée avant les effets de création. La cause du refus personnel001 de1.11 reste inconnue ; ce correctif traite le contrôle manquant indépendamment confirmé.

## Vérifications

- Régression rouge du premier terminal et de l’init sans contrôle : `red-protocol.log`.
- Suite complète du workspace : **338/338**, zéro échec/annulation/saut/todo, dans `full-tests.log`. Elle inclut les20tests du harnais1.11 en cours ; le résultat ne signifie pas que cette story est terminée. Le code produit final et les variantes de casse sont bien présents dans cette exécution.
- Audit indépendant des frontières : A1 révèle un faux reçu vide possible après remplacement du dossier pendant lecture. Correction et recontrôle du même expert :8/8scénarios indépendants, refus avant observation. Preuves initiale et finale distinctes `boundary-audit-A1*.json` ; régressions permanentes incluses dans la suite complète. Aucune cause du refus001 n’en est déduite.
- Types, build et installateur0.1.2 : `build-win.log`. Electron45.0.0 et dépendances conservés ; seule la version du projet passe de0.1.1à0.1.2.
- Paquet exact :9contrôles Forge synthétiques avec vrais scripts/journal/outils hôte, puis5régressions Windows. Nettoyage des profils confirmé. Aucun modèle ni compte dans ces bancs.
- Matrice complète : les6lignes sont couvertes et réussies dans `matrix-audit.json`.

Les tentatives de l’implémenteur restent séparées sous `implementation-attempts/` : les contraintes du bac à sable ont d’abord empêché les vrais resolvers/écritures temporaires ; un essai Windows ultérieur a aussi buté sur le privilège de création d’un lien symbolique de fichier. Le banc utilise ensuite une vraie jonction au même chemin pour vérifier la garde Windows, en conservant le test de hardlink. Aucune garde produit, attente ou test n’a été supprimé pour obtenir la suite finale.

## Artefact et installation

Le manifeste neuf `release-manifest.json` relie120inputs et3artefacts. Il décrit les octets du workspace courant, y compris les scripts/tests1.11 non encore committés ; il ne prétend pas un checkout propre. L’ancien manifeste1.9 n’est ni régénéré ni remplacé.

| Artefact | SHA-256 |
|---|---|
| Installateur0.1.2 | `1046e11f7c2634af42c3d9dae1cbdcd6fb645cc30a4ab85782eb6a8666d198a7` |
| ASAR0.1.2 | `25400621028638c68528178774724362b5434093cbc25048ece8f61247d7b88f` |
| Runner Python inchangé | `6d1ebd4e04594ea3f15a39e6e8a1e71ac06a3f0fc8705a7495da47d854ccaed5` |

Madness fermé et inventaire vérifié, l’installateur silencieux retourne0. Les42empreintes de fichiers métier/chiffrés contrôlées restent identiques immédiatement après remplacement. La réouverture normale du programme installé réussit7contrôles : runtime/ASAR conformes, demandes historiques inactives, compte lisible, aucun moteur/réseau spontané pendant les3secondes instrumentées, fermeture effective et41fichiers métier/chiffrés identiques après réouverture. `Local State` est comparé séparément. Aucun contenu du coffre n’est déchiffré ou copié par le banc.

Preuves : `installation-before.json`, `installation-command.json`, `installed-reopen-001/report.json`. Les récents restent MIA et madness ; aucun nouveau projet personnel témoin n’a été créé dans13. La fenêtre de contrôle est fermée.

## Portée

La revue Quick finale est en cours. Aucun modèle externe n’a été utilisé pour ce correctif, aucun nouveau consentement, acquittement réseau ou changement de fournisseur/facturation demandé. G1, la preuve intégrée réelle de1.11, la refonte UI/UX et les capacités des epics2–4 restent distincts. Aucune nouvelle acceptation visuelle ou humaine globale n’est prétendue.

Revue Quick : Q1 confirmé, borne32Kio incompatible avec certaines entréesUTF-8 valides. La correction conserve les entrées admises et porte la lecture d’en-tête à64Kio ; implémentation et qualification finale en cours. Les empreintes et essais ci-dessus décrivent le premier candidat0.1.2 ; ils ne qualifient pas encore le candidat corrigé. Les reçus finaux seront distincts, sans écraser ces preuves.
