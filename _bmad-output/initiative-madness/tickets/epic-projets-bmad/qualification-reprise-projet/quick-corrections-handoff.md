# Corrections Quick Q1–Q3 — portée et gel final

Produit et pin figés après les corrections ciblées ; scripts de qualification ensuite figés avec la conservation des reçus natifs déjà émis. Aucun nouveau Main intégral, paquet, replay, capture, détecteur, modèle, compte ou profil personnel dans ce passage. La qualification globale et la promotion restent au parent.

## Changements

- `src/core/bmad-progress.ts` : un désaccord entre valeurs littérales du champ `status` est signalé avant toute équivalence de classification. `in-progress`/`blocked` et `draft`/`ready-for-dev` restent contradictoires ; `status: draft` avec `tracker_status: backlog` garde son équivalence entre champs. Déclarations brutes et acceptation humaine inconnue conservées.
- `resources/bmad-help/progress.py` : une feuille reconnue sans id conserve une identité privée de lecture `@file:<SHA-256 du chemin relatif>`. Le plan peut la joindre par son stem ; aucun id US natif n’est inventé. La limite de 255 caractères est respectée. Priorité d’un id existant, vrais orphelins, sources brutes et gardes inchangés. Le problème explicite « Identite native inconnue; reference de fichier conservee » garde la limite visible.
- `src/adapters/bmad/help-manifest.ts` : seul pin du collecteur aligné à `03824562e5109170bbc63b1487a666127a9f0de7712e1b5c6938452585296420`.
- `src/renderer/src/ProjectResume.tsx` : libellé « Identité de fichier · id natif inconnu » pour cet alias ; mémoire locale de position et conservation des détails natifs, y compris le récapitulatif. Dépliages et position sont invalidés au changement de projet, racine, initiative ou révision de capture.
- `src/renderer/src/App.tsx` : Reprise reste montée sous un wrapper `hidden` pendant Conversation. Le panneau inactif reste inaccessible ; revenir à la même capture retrouve détails et lecture sans nouveau helper. Les quatre accès locaux F1 et l’atelier sont conservés. Craft-floor officiel relu immédiatement avant ces éditions UI.

Aucun nouveau bridge, schéma ou champ public ; la prop `active` est interne au renderer. La conservation est de session, pour le retour démontré entre Parcours et Conversation ; aucune nouvelle promesse de persistance après fermeture de l’application.

## Rouge → vert ciblé

Tous les fichiers ci-dessous sont dans ce dossier et les reçus rouges sont conservés.

| Contrôle | Rouge | Vert |
|---|---|---|
| Q1 deux désaccords littéraux | `quick-q1-red-002.txt` : deux échecs attendus ; équivalence tracker déjà verte | `quick-q1-green-001.txt` : fichier core complet 14/14, zéro saut |
| Q2 helper Windows fermé, fixture synthétique | `quick-q2-red-001.txt` : feuille et plan séparés, alias/limite absents | `quick-q2-green-001.txt` : 1/1, huit contrôles internes verts, Job actif après arrêt = 0 |
| Q2 libellé UI | `quick-q2-ui-red-001.txt` : libellé absent | `quick-ui-green-001.txt` : Q2 et quatre reprises existantes verts |
| Q3 retour à la même capture | `quick-q3-red-001.txt` : détail refermé au retour | `quick-q3-green-002.txt` : 1/1 après correction d’un appel de fixture du banc |

Commandes ciblées exécutées :

```text
node --experimental-strip-types --test tests/bmad-progress.test.mjs
node --experimental-strip-types --test --test-name-pattern='Q2 filename' tests/bmad-progress-review.test.mjs
node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs
node --experimental-strip-types --test --test-name-pattern='reprise: Q3' tests/connection-ui.test.mjs
```

Premier lot UI après correction produit : 5/6 ; seul échec final Q3 = appel du test à `bmadContextUIFixture.calls`, méthode inexistante. Les assertions produit de retour, position, révision et racine avaient passé. Test aligné sur la vraie méthode `reads`, puis seul Q3 rejoué vert. Consolidation propre de ce passage : six cas UI verts ; parent a ensuite confirmé son propre lot consolidé 6/6 sans saut et build/types verts (`parent-postquick-ui-001.txt`, `parent-postquick-build-001.txt`).

Q3 vérifie les preuves de statut et textuelle ouvertes, le récapitulatif ouvert, la position de `main` à deux pixels près, le panneau inactif absent de l’arbre accessible, les quatre accès F1, la non-restauration sur nouvelle révision/racine, le brouillon modifié et l’historique exacts, zéro collecte/observation/envoi/contrôle réseau automatique. Le helper Q2 reste le collecteur fermé sur fichiers synthétiques possédés ; aucun import ni exécution d’un projet consulté.

## Reçus de timings du prochain banc déjà nécessaire

`scripts/qualification/bmad-progress.mjs` appelle désormais `readBmadProgressTimings` juste après la fermeture possédée et avant le nettoyage du profil. Le nouveau module de qualification `scripts/qualification/bmad-progress-timings.mjs` conserve dans `report.helperTimingReceipts` :

- le nom du dossier d’opération et seulement `request.op` parmi les opérations reconnues ;
- les valeurs numériques déjà présentes dans `phases.json` et `native-timings.json` ;
- les seuls champs terminaux/Job/exit et durées de supervision retenus dans `terminal.json` et `execution.json` ;
- un état explicite `missing`, `unreadable` ou `oversize` par fichier si la donnée n’est pas disponible.

Aucune requête complète, credential, erreur brute, stdout ou chemin de requête n’est copié. Ces durées ne sont pas présentées comme une mesure isolée du parseur ; aucun correctif de performance ni registre du temps/coût de développement ajouté.

Vérification limitée : `tests/bmad-progress-timings.test.mjs` rouge sur module absent puis vert 1/1 (`quick-timings-red-001.txt`, `quick-timings-green-001.txt`) : valeurs exactes, exclusion de marqueurs secrets, fichiers et dossier absents explicités. `node --check scripts/qualification/bmad-progress.mjs` passe. Le banc Main n’a pas été exécuté pour cette instrumentation.

Toutes les sessions de ce worker sont terminées ; les fixtures UI ont confirmé l’absence de descendants possédés avant nettoyage. Aucune édition produit/pin après son gel, aucune modification concurrente du parent ou des relecteurs annulée. Les captures et reçus historiques restent inchangés.
