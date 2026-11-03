# Implémentation locale des initiatives — story 2.3

Périmètre : plan `story-retrouver-et-choisir-les-initiatives-sans-reattribuer-les-ec-plan.md`, baseline `03c288066e3105974c7a90041688c01d5df687e8`, worktree `bmad-help-2-2/madness`. Le parent possède statuts, revue Quick, audit indépendant, captures, détecteur, finish et clôture. Aucun verdict Build n’est déduit de ce document.

## Livré dans les sources

- Contrat métier `bmad-context.ts` : observation sourcée, sélection indépendante, états de conservation et commandes sans chemin libre ni drapeau d’admission. Les identifiants non représentables ne sont jamais convertis en slug.
- Opération fermée `context` du helper possédé : mêmes gardes Windows, runtime fermé, Job et pins que le lecteur G2 ; configurations résolues depuis les octets capturés, listes immédiates et sources `<initiative>/<initiative>.md`, sans parcours libre des tickets ni import du projet. Révision = configurations, fichiers et identités, listes, dossiers et présence. Remplacer un fichier avec les mêmes octets invalide également le reçu.
- Annexe `bmad-context-v1/<projectId>.json`, atomique et CAS, liée à la racine et son identité. Données futures/corrompues préservées ; choix de session distinct du stockage confirmé. Snapshot v1 et annexes historiques inchangés.
- Coordinateur par projet et générations : lectures et choix tardifs restent rattachés à leur projet ; une sauvegarde en attente reprend la sélection complète la plus récente. Les observations partagent le helper possédé en série ; elles ne créent pas un conflit BUSY artificiel avec une garde alpha pendant la consultation beta. Admissions et preuves d’arrêt sont reprises après l’attente.
- Captures avant ouverture, contrôle après ouverture et avant premier tour, puis avant tours, réponse à une question, autorisation et effets Forge. Les suivis contrôlent leur capture, jamais la sélection de consultation courante. Les fermetures réelles et STOP_UNCONFIRMED restent autoritaires. Le refus d’une approbation reste disponible.
- Le budget d’attente fournisseur est suspendu pendant les nouveaux contrôles locaux ; le Job local conserve son propre budget borné. Une régression avec garde de120ms et attente native de80ms reproduit le timeout introduit, puis passe après correction. Aucun nouveau réseau, outil natif ou consentement.
- Sélecteur sous le titre : nom+chevron, dialogue unique, sélection/active séparées, conflit, chemins/sources/révisions, erreurs et réessai de conservation. Focus initial au choix courant, sinon titre ; fermeture/Échap au bouton. Clavier, compact, thèmes et zoom200 vérifiés sans capture par l’implémenteur. Questions/accords gardent leur initiative capturée.
- Version logicielle0.2.7, distincte des identifiants de story ; dépendances inchangées.

## Vérifications obtenues

- Types et compilation réussis ; journaux `.working/context-build-reviewed.log` et ultérieurs.150tests cœur/protocole ciblés passent sans saut dans `.working/context-core-stable-confirmed.log`.
- Sources finales sur vrai Windows :21contrôles de `tests/bmad-context-sources.test.mjs`, Job réellement terminé0 et préflight fermé. Absence/legacy/inconnu, trois couches, nom non représentable, identités/remplacement, mutation pendant collecte, traversal/externe/ADS, UTF-8, hardlink/jonction, bornes fichier/corpus/liste. `.working/context-sources-final.log`.
- UI :6cas dans `.working/context-ui-final.log` puis5cas d’anciennes demandes/navigation dans `.working/context-ui-requests.log`, tous verts,0skip ; profil fermé et absence des processus vérifiées avant nettoyage. Aucun screenshot ni tour visuel consommé.
- Premier banc adapter natif :15opérations, deux projets, restauration passive, fichiers exacts et refus Windows ; passe en623s, avant le complément d’identité de fichier. Il reste historique : `.working/context-native-canonical.log`.
- Fondation/livraison :14/14 dans `.working/context-foundation-release.log`. Garde Forge réelle après attente du reçu pending :1/1 dans `.working/context-forge-effect.log`, aucun premier effet ni octet de configuration modifié.
- Non-régression de l’aide existante :25contrôles Windows, confirmation au wrapper180s/Job120s en116s, `.working/context-help-boundaries-final180.log`. Le rouge initial EBUSY et son reçu running restent conservés dans `.working/context-help-boundaries-first/`. Audit : racine PID21924 absente et aucun contrôleur de la fenêtre du run (arguments décodés compris) ; seuls ces témoins retirés après vérification. Essai300 distinct en117s conservé comme historique ; aucune hausse de délai retenue. Le banc conserve maintenant la fixture lorsqu’il manque un reçu terminal de Job0, au lieu de tenter sa suppression.
- Bancs réels Main/preload compilés : `scripts/qualification/bmad-context.mjs --output=<dossier>` conserve les empreintes de Main/preload et des13ressources. Deux projets, choix séparés, vraie fermeture/réouverture, captures null historiques et configurations/Snapshot exacts. Les runs001/002 précèdent les dernières files de lectures. Le run003 final passe8contrôles, dont deux observations concurrentes, puis fermeture/réouverture : `.working/context-compiled-003/verification.json`, status=passed et cleanup=true, deux reçus cleanupSafe/mainGone/childrenGone=true, closeError=false, réseau/app-server0 après hook. Son reçu reste à intégrer par le parent à sa qualification.

Les premiers rouges restent dans `.working/context-*.log` : absence initiale des modules, chemin Temp court non canonique du banc, fixture UI vide/libellé périmé, focus impossible sur choix disabled, remplacement de fichier aux mêmes octets, budget d’attente et collision de lectures. Un premier test de possession attendait CANCELLED alors que le refus conservé correct est STOP_UNCONFIRMED ; son attente a été corrigée, sans assouplissement produit.

## Limites conservées

- Variante native symlink fichier non exercée faute de privilège Windows ; hardlinks et jonctions réels exercés. Aucun skip vert ni équivalence inventée.
- Les observations réseau/app-server du banc Main commencent au hook et restent bornées à cette portée. Aucune activité fournisseur requise ni appelée, aucune preuve M14/G2 intégré/2.2 built déduite.
- Aucun profil personnel, compte, proxy, abonnement ou installation modifié. Les seuls profils synthétiques sont retirés après preuves de fermeture.
- Les captures, audits et verdicts du parent demeurent séparés des tests locaux. Aucun accord visuel humain global ou audit WCAG déduit.

## Lot ciblé F1–F4 après inspection parent de visual-round2

Trois fichiers renderer changés : App, InitiativeSelector et initiatives.css. Le dialogue a ses couleurs sémantiques locales pour texte/statut/erreur ; le bandeau ne présente une initiative capturée qu’en présence d’un échange et la nomme comme telle. Les choix restent alignés à gauche, noms en Barlow700 et métadonnées en Oxanium450 ; chemins/empreintes gardent leur police de données. Le titre et Fermer sont hors du corps défilant. La révision du contexte et les sources/révisions des initiatives sont dépliables ; les disclosures sont frères du bouton de choix, sans interactif imbriqué.

Types/build et10cas UI ciblés passent sans saut : quatre cas initiatives précédents, trois régressions de ces constats, anciennes question/approbation/contexte. Contrastes calculés du thème clair, focus courant, titre/fermeture dans la fenêtre en compact et zoom200, saisie et captures historiques conservés. Le premier rouge est conservé ; sa première lecture de style précède trop tôt le rendu de l’alerte et a reçu une attente de ce rendu. Les refus F2 et F4 y sont reproduits directement. Log final : `.working/context-ui-parent-fixes-confirm.log` ; profil fermé/descendants absents avant nettoyage.

Comparaison avant/après rebuild :59empreintes inchangées, comprenant57sources backend/ressources/package et les deux sorties compilées. Les13ressources et les inputs Main003 sont exacts ; le renderer est recompilé et son rendu n’est pas assimilé à Main003. Main SHA256 `46cea455abebf20e52ff1128c08e9269b38eb558c8bf56a742fef6ebe152e56c`, preload `cb44030e502516caad3028e6d03fb194c1a116c9009fb1907a0aacae2f91868f`. Reçus `.working/context-ui-fixes-before.json` et `context-ui-fixes-after.json`.

Aucune capture, détection mécanique, revue ou commit lancé par l’implémenteur pour ce lot ; la confirmation visuelle et les verdicts restent au parent.


## Review loop1 — dérivation ciblée Q1–Q4/B1

Q1 et Q2/B1 : opération interne fermée `context-config`, avec trois couches capturées, modules, racines et identités, sans lecture ni inventaire de sorties ou d’initiatives. La capture conserve sa portée (`configuration` ou `initiatives`) et assertFresh relit cette portée. La capture indépendante garde l’active configurée représentable même sans son document et ne remplace jamais l’observation UI complète. Les gardes propres Mary/config, Forge/contextDigest et BMad/bundle restent en place.

Q3 : abonnement stable, projet courant par ref et séquences périmées écartées avant toute ouverture de conflit. Q4 : génération d’ouverture et fermeture/focus réservés à l’ouverture encore active ; un choix terminé après Annuler, réouverture ou navigation rejoint l’état de son projet sans reprendre le dialogue ou le focus. Structure et CSS F1–F4 conservés.

Vérifications courantes : types/build,153tests cœur/protocoles,17ciblés de portée/contexte et14fondation/livraison passent ; les17sont inclus dans les153.25contrôles de sources Windows passent, dont quatre nouveaux contrôles de portée et les refus complets conservés. Q3/Q4 :2cas UI ciblés passent, fermeture/profil nettoyé prouvés ; le parent possède la confirmation UI élargie et la seule recapture demandée. Journaux `context-review-loop1-*.log`.

Forge sans initiative réel : init, append, write et finish CLARIFIED avec garde de configuration réelle ; configuration modifiée et remplacement aux mêmes octets refusés. Confirmation1/1 en341s, neuf reçus completed/Job0, helper stopped et racine témoin supprimée après fermeture. Reçus : `.working/context-review-loop1-profile-scope-final/receipts.json`. Premier essai conservé : fixture HTML sans style/SVG refusée avant write ; init/append seulement attestés et quatre reçus Job0, sans modification de garde produit. Le verdict de fixture a également été aligné sur CLARIFIED avant confirmation.

Main courant : `.working/context-compiled-review-loop1-004/verification.json` passe8contrôles, code0, de18:03:49 à18:09:26UTC. Deux fermetures attestent cleanupSafe/mainGone/childrenGone=true et closeError=false ; réseau et app-server0 après hook. Les16inputs (Main/preload/package et13ressources) sont identiques aux fichiers courants ; cleanup=true et racine témoin réellement absente. Main003 reste historique après modification backend. Main SHA256 `72794f23f5ba3b79ae1921b1c5fd80c42b5e32fc047073da691d1e493a49a54a`, preload `cb44030e502516caad3028e6d03fb194c1a116c9009fb1907a0aacae2f91868f`, worker/pin `6dd088f45c55d1cdf2eee7e9580a65de73ca88719d782c707bd9934153c8adc4`. CSS compilé `index-Br8nXkNl.css` conservé.

Aucun reset, suppression de sources, nouveau fournisseur, profil personnel, capture, détecteur, revue ou commit par l’implémenteur. Limite symlink fichier Windows inchangée ; aucune preuve2.2/M14 ou validation humaine ajoutée.
