# Story 1.5 — vérification de l’implémentation

Le formulaire natif normalisé, ses brouillons liés, le verrou d’envoi, l’annexe atomique et le reçu exact sont implémentés. Les IDs natifs restent dans le connecteur. Le brouillon libre, Snapshot v1 et les six méthodes `madness` sont préservés.

## Vérifications effectuées

- Suite complète : **189 tests réussis**. Ce passage précède l’ajout final d’accès aux questions des conversations précédentes et les deux corrections de conservation décrites ci-dessous.
- Après cet ajout UI : le test ciblé `le formulaire conserve chaque demande…`, étendu aux conversations précédentes, réussit ; types et build réussissent.
- Deux régressions supplémentaires observées en rouge puis corrigées : effacement de l’erreur locale après réessai de sauvegarde réussi ; préservation de `unknown` lors d’une nouvelle restauration. Après ces corrections, **17 tests questions ciblés** réussissent ; types et build réussissent. La suite complète finale après revues appartient au parent.
- `compiled-profile.json` : **10 contrôles réussis** sur Main/preload/renderer compilés, sans compte ni fournisseur ; réouverture exacte, aucun réseau et nettoyage confirmé. Le dernier passage utilise le Main après les deux corrections de conservation, sans refaire de captures.
- Impeccable : un lancement `context`, un `detect` final sans constat (`[]`), première inspection groupée puis une confirmation groupée des captures bureau, compact et clair. Aucune refonte globale ni acceptation visuelle humaine déduite.

Les captures `compiled-desktop.png`, `compiled-compact.png` et `compiled-inactive-light.png` montrent le renderer final (`index-DuqTdY-Z.js`). Le dernier changement ultérieur touche uniquement le cœur Main et ne change pas ces pixels. Les IDs de tour restent absents de la ligne de contexte produit. L’état inactif est titré « Question conservée ».

## Essais précédents conservés

`compiled-first-attempt.json` et `compiled-second-attempt.json` gardent deux erreurs d’attente du banc dans son dernier contrôle : la sélection explicite du projet augmente légitimement la révision, et la restauration de l’activité `running` donne `unknown`. Le banc compare désormais les octets après cette navigation et vérifie séparément le contexte, les messages et le brouillon. Aucun comportement produit n’a été modifié pour faire réussir ces contrôles. Tous leurs profils sont nettoyés.

## Travail restant au parent

Le premier installateur a été créé, puis les reconstructions ont échoué à l’étape `editWindowsResources` (`UNKNOWN` lors de l’ouverture en écriture de `Madness.exe`), y compris dans un dossier neuf. Toutes ces commandes utilisaient `require_escalated`. Les processus possédés des bancs ont quitté ; aucun processus Madness n’était présent au contrôle. `packaging-profile.json` conserve les chemins, la phase et les empreintes des sources compilées courantes. Aucun réglage de signature, de ressources ou de packaging n’a été contourné. **Le paquet final et son banc ne sont pas qualifiés à ce stade ; les sorties partielles ne doivent pas être installées.**

Le parcours avec vrai modèle, les revues, la construction et qualification finales du paquet, l’installation personnelle et le commit sont réservés au parent. Les fichiers `protocol-spike.*`, le profil personnel et les preuves live préparées par le parent n’ont pas été modifiés. Les gates historiques restent inchangés.

## Complément parent — 26 octobre

La réserve de paquet ci-dessus décrit la remise initiale de l’implémenteur. Le parent a ensuite reconstruit normalement l’installateur. Après correction d’une course arrêt/conservation du reçu (voir `parent-race-audit.md`), suite complète **192/192**, types/build réussis, banc compilé **10/10**, banc paquet **10/10**, profils nettoyés. Le renderer et ses trois captures restent identiques ; aucune nouvelle passe de polissage n’a été engagée.

Paquet final : `dist/questions-pilot-final/`, SHA-256 `resources/app.asar` : `b9383fe88ede47775b356cddf9414ec5620ea3c0ff5c8e08971eb6a94740583e`. Cinq régressions Windows ciblées passent également. La reconstruction a rencontré à nouveau une ouverture en écriture temporairement refusée ; aucun processus Madness n’était présent, les ouvertures non modificatrices `r` et `r+` ont ensuite réussi, puis une reprise standard a produit NSIS et blockmap. La cause OS précise reste indéterminée ; aucune protection, signature, ressource ou configuration de packaging n’a été contournée.

Le parcours réel et les revues restent séparés de ces succès automatiques. Voir leurs rapports effectifs pour leur statut.

## Version finale après revue — 27 octobre

Deux constats Quick et F1 Impeccable corrigés puis recontrôlés résolus par les mêmes relecteurs. Suite complète finale **196/196**, aucun test ignoré ; types/build, compilé10/10, paquet10/10 et cinq régressions Windows passent. Finition round1 : trois recaptures du renderer `index-Ccfod1Na.js`, verdict `ship`, documentation ciblée dans `impeccable-finish.md`. Le détecteur n’est pas relancé.

L’ASAR final est `3762c7decc4ea044024eaf8e7e6aed94c21bd76a36889632257f694e54c0c99b`, Main `ccb1513373d2641ec852da3b19260f72f73fc9afddd288128c7761dc76716830`. Il remplace les candidats précédents dans `dist/questions-pilot-final/`. Sur un **nouveau témoin** : deux demandes réelles, une réponse et un reçu exact, arrêt/tardif puis réouverture sans moteur ; huit contrôles réussis dans `live-final-profile.json`. L’ancien parcours partiel et sa restauration séparée restent intacts.

Version installée : six contrôles de restauration en lecture seule, coffre existant lisible et zéro spawn/réseau après hook. Le premier installateur a continué après un précontrôle de hash interrompu ; aucune égalité avant/après n’est revendiquée pour ce premier remplacement. Après restitution vérifiée, une réinstallation contrôlée du même paquet compare **quinze fichiers identiques** avant/après, coffre, Local State, snapshot, apparence, questions et Forge compris. Voir `installation.json`. Cette réinstallation ne clôt pas la qualification à deux versions1.9. Tous les processus possédés sont fermés ; témoins liés conservés. Synthèse finale dans `qualification-summary.json`.
