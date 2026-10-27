# Vérification parent — story1.8

La projection commune présente les attentes et le récapitulatif depuis l’accueil et le projet. Elle rejoint la conversation et la demande exactes, garde les saisies existantes et distingue transmission, effets, chemins annoncés et observations. Un ancien texte ne devient ni une attente active, ni une validation ou une prochaine étape inventée. Les demandes expirées/restaurées restent inactives ; l’arrêt sans contexte demeure global.

## Vérifications finales après corrections

| Contrôle | Résultat et preuve |
|---|---|
| Suite prescrite |287/287, aucun échec/saut/annulation/todo ; `tests-parent-final.log`.|
| Types, compilation et installateur NSIS |Réussis, `package-parent-final.log` ; Electron45.0.0 / Chromium156.0.8078.48.|
| Compilé isolé |8/8, quatre captures finales ; `compiled-profile.json`.|
| Paquet isolé |8/8 ; `packaged-profile.json`.|
| Vrai runner épinglé, fournisseur simulé loopback |4/4, question native, reçu exact, suppression commune et restauration ; trois requêtes locales, aucun compte/OAuth/modèle externe ; `native-loopback-profile.json`.|
| Régressions Windows |5/5 ; `windows-parent-final.log`.|
| Réouverture installée |6/6 ; compte lisible, attente historique non réactivée, zéro enfant et réseau après hook ; `installed-reopen-profile.json`.|
| Conservation privée |27 empreintes strictement identiques avant remplacement, après remplacement et après réouverture ; `installation.json`.|

Les bancs compilé/paquet exécutent Main, preload et persistance réels mais injectent les états actifs d’affichage. Le reçu natif est prouvé séparément par le vrai runner0.144.6 et le cœur produit, avec Responses simulé sur127.0.0.1. Aucun dialogue facturable personnel lancé pour ce lot. La réouverture personnelle retrouve MIA et Madness, sans témoin ajouté ; elle ne comporte actuellement ni conversation ni brouillon actif. Les historiques et brouillons sont testés dans les profils isolés.

## Revues et artefact livré

Quick Q1/Q2 et finition F1/F2/F3 corrigés et recontrôlés résolus ; `review-quick.md` et `impeccable-finish.md`. Aucun correctif du lot différé. Réserve historique du test d’arrêt pour1.10 inchangée. Le diff complet, les neuf tests purs, les tests UI et les deux bancs ont été relus par le parent ; audit de la matrice dans `matrix-audit.md`.

Paquet `dist/overview-pilot/`, installation personnelle réussie (exit0). ASAR qualifié, installé et rouvert identique : `072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1`. Installateur SHA256 : `9ccca8286cdb616784d545616dee3c0123fc9dd05a6d43974666318eb1449e0e`. Main compilé SHA256 : `08319b7601f412a18bcad5f2c17898452959b69315afc846df7e7895c1d3cf91`.

Les anciennes preuves `pre-review-*`, `tests-final.log` et `implementation-verification.md` précèdent les corrections : elles ne désignent pas l’artefact installé final. Les captures finales ont été refaites après le dernier libellé.

## Anomalie du banc et limites

Le premier contrôle personnel avait forcé `MADNESS_DATA_HOME` vers le profil habituel : Main change alors aussi `sessionData` vers `chromium`, ce qui change le contexte safeStorage. Le compte paraissait indisponible dans ce lancement instrumenté (`installed-reopen-harness-failure.json`), sans changement des27 fichiers critiques. Le même paquet, lancé avec les variables normales filtrées et sans cet override, relit le compte avec `errorCode: null`. Aucun changement produit ni reconnexion nécessaire. Le dossier Chromium préexistait au26octobre : il est conservé.

Observation processus/réseau limitée à la période après installation des hooks Main ; la période antérieure n’est pas mesurée. La fenêtre de contrôle possédée est fermée après vérification. Aucun secret ni copie du coffre exporté. Aucun gate1.1/1.2 ou de distribution levé ;1.10/1.11 gardent leurs dépendances. Snapshotv1, six méthodes `madness` et contrats adoptés inchangés. R32 temps/coût reste à cadrer dans l’epic2 ; Loop et Graphify ne sont pas intégrés. Le ship Impeccable est ciblé, la refonte Sally/experts globale reste à faire.
