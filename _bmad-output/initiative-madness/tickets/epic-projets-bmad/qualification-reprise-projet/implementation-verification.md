# Passage implémentation 2.4 — 3 novembre 2026

Ce reçu distingue le code implémenté de la qualification encore partielle. Il ne clôture pas le Build ; statut, revue high/Quick, finition Impeccable, candidat et promotion appartiennent au parent.

## Complément courant : Main004 et dimensions UI

**Actualisation suivante :** les preuves visuelles compact clair et zoom intégral sont réconciliées dans `visual-recapture-zoom-003/verification.json` : même baseline/projection réelles Main004 réhydratées comme observation explicitement ancienne, deux sélections de thème par le vrai bouton, assertions data-theme et couleur calculée de workspace, capturePage native intégrale. PNG inspectés : clair900×1025 (workspace rgb246/240/228), sombre200%1800×1150 (workspace rgb33/31/30), sans helper/réseau et fermeture possédée. Le compact Main004 est sombre malgré son nom ; il ne prouve pas le clair. Le crop zoom Main004 reste rejeté. `visual-recapture-zoom-001` est un essai sans PNG arrêté sur un mauvais locateur (projet déjà restauré),002 un essai technique natif zoom avant attestation groupée des thèmes ; reçus conservés. Aucun nouveau polish ni détecteur lancé.

Les corrections high H1–H3 et F4, postérieures à ces recaptures fermées, sont documentées dans `review-corrections.md` : reproduction rouge puis batch vert13/13 natifs/cœur,3/3UI et build/types. Les anciennes limites de passage ci-dessous restent historiques ; revues parent/candidat/clôture demeurent à établir.

Après le diagnostic parent sans BMad (`window-diagnostic-001/002`), le banc restaure/affiche la fenêtre avant chaque format et consigne états natifs avant/après, contenu, visibilité, minimisation et vrais viewports/breakpoints. Les sources/pins produit n’ont pas changé ; aucune suite globale n’a été relancée.

- `node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` : **2/2, zéro skip**, dimensions désormais attestées par le helper partagé à zoom1, puis largeur/hauteur après zoom. Dans chaque thème :1440×920,720×920 et720×460CSS à zoom200, breakpoints compacts/dockés corrects et aucune largeur débordante. Log complet `ui-reprise-viewports-001.txt`, fermeture possédée attestée.
- `node --experimental-strip-types scripts/qualification/bmad-progress.mjs --output=_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/main-004 --screenshots` : **passed,12contrôles**. Deux reprises réelles beta, déclarations séparées, lecture sans écriture, fermeture puis réouverture passive, conversations/brouillons/choix exacts ; huit opérations helper avant et après, aucune nouvelle. Deux fermetures sans erreur, `cleanupSafe:true`, réseau/app-server0 après hook, profil nettoyé.
- La vraie baseline durable est conservée dans `main-004/snapshot-after-navigation.json` ; avant/après réouverture : SHA-256 `b2141b30803a0fcf62e8c7f0ecc341191f3cf0ec10616e116e721b9540bf3337`. Elle suit le clic réel de navigation ; aucune attente reconstruite à partir de l’implémentation.
- Première série groupée produite : sombre1440×920CSS (PNG1800×1150), clair compact720×820CSS (PNG900×1025). Le PNG zoom200 de Playwright est **refusé comme preuve visuelle intégrale** :900×575pixels malgré le contenu natif1440×920 et le viewport720×460CSS correctement mesurés ; il ne montre que le coin haut-gauche. Fichier conservé sans recadrage, SHA et comparaison aux dimensions physiques dans `main-004/captures-audit.json`. Ce refus de capture ne retire pas les assertions géométriques et fonctionnelles du banc, et ne devient pas une validation visuelle200%.

Toutes les commandes de ce complément sont terminées. Les anciens reçus et limites ci-dessous sont historiques et restent inchangés. Le passage visuel200% reste à réconcilier par une capture native intégrale ciblée ; aucun détecteur ni nouvelle collecte lancé à cet effet.

## Livré

- Contrats stricts et bridge métier par identifiant projet, coordinateur de lecture explicite, générations/annulation, restauration sans collecte, sélection de consultation distincte de l’active BMad.
- Lecteur Python fermé et pinné : racine Markdown de l’initiative sélectionnée, conteneurs tickets et dossiers documentaires reconnus ; aucun import du projet, qualification volumineuse ou code exécutable scanné. Statuts entrée/feuille/plan/tracker conservés avant rapprochement, entrée sans feuille visible, plans joints par identifiant ou stem, doublons/orphelins/statuts inconnus nommés.
- SHA des octets réels, identité de source stable, révision de collecte incluant identités, dates et portée. Contrôles après lecture sur sources/inventaires/absences/refus ; mutation mixte refusée. Sections littérales avec lignes, sans synthèse IA ni acceptation déduite.
- Reprise du projet dans Parcours avant aides/préparations, quatre groupes, détails natifs textuels, ancienneté/conflits/limites, récapitulatifs existants et destination capturée exacte. Casting, palettes et fontes conservés ; libellés FR/EN contractuels dans strings.ts.

## Vérifications observées

- Tests cœur initialement rouges (modules absents), puis 8/8 verts ; suite finale étendue : 11/11 cœur.
- `node --experimental-strip-types --test tests/bmad-progress.test.mjs tests/bmad-progress-protocol.test.mjs tests/bmad-context-profile-scope.test.mjs` sur ressources figées : **13/13, zéro skip**, dont protocole Windows **21 contrôles**, Job actif après arrêt = 0, preflights runtime hostiles refusés, réseau/provider false. Régression réelle Forge : init/append/write/finish, configuration modifiée et remplacement mêmes octets refusés, fermeture stopped.
- `node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` : **2/2, zéro skip**. Vrai App Electron, HTTP(S) bloqué, compte absent, preuves inertes/contradictoires, retour alpha depuis beta, brouillon conservé, clavier, clair/sombre, compact et zoom 200 ; fermeture des processus du profil possédé attestée.
- `npm run typecheck`, puis `npm run build` finaux : réussis. Main `c26a7188afa609cbcfa06c1940932dac5b6cb811dce7856bee6dec80e4d7cd66`, preload `0406aed2c9d0fa75b5bdeebed40df1d4156006a1eea664347ad296cde4f95634`. Quatorze ressources helper, progress.py `432de37bca00829748bca5e9f2177a2d723cce13e3c3e8d88a1e56dd761be571`.
- Régressions antérieures regroupées : 43/44 en élévation ; seul profile-scope sans execution.json pendant des éditions de ressources, cause de concurrence seulement probable. Son recontrôle final figé est vert dans les 13/13. Les refus AppContainer antérieurs de liens/renommages atomiques ne sont pas promus en défaut produit corrigé ni en succès.

## Main : preuves conservées, limites exactes

Les dossiers main-001, main-002 et main-003 restent distincts et contiennent leurs reçus originaux. Tous ont fermé le vrai Main et ses descendants, `cleanupSafe:true`, `closeError:false`, réseau/app-server = 0 après hook, profil possédé nettoyé.

- Main001 : choix non confirmé, sélection null ; cause d’une ressource modifiée pendant le banc seulement probable. Aucun succès de reprise ni capture déduit.
- Main002 : deux projets observés/choisis beta ; les deux projections réelles, entrée sans feuille et trois statuts opposés passent. Échec ensuite du banc de capture : appel width,height au lieu de l’objet attendu par setWorkspaceViewport. **Aucune PNG.**
- Main003 : six contrôles acquis, dont les deux reprises beta réelles et Snapshot exact après lecture avant navigation. Les snapshots de preuves complets sont conservés dans verification.json. Échec de géométrie au début de la capture : taille native [0,0], viewport resté 1322×816, seuil demandé 1440×920 inaccessible ; cause de cet état natif non établie. **Aucune PNG, pas de seconde ouverture passive dans ce run.**

Le banc a ensuite été corrigé uniquement : restauration/affichage de la fenêtre synthétique avant dimensionnement, refus visuel consigné sans empêcher les contrôles fonctionnels passifs, baseline Snapshot capturée après navigation puis comparaison à la réouverture, et fichiers projet immuables comparés séparément. `node --check scripts/qualification/bmad-progress.mjs` passe ; cette dernière correction de banc n’a pas été rejouée. Aucun nouveau tour visuel ni détecteur lancé.

Les deux observateurs en lecture seule tentant de conserver la baseline post-navigation à la première PNG ont été arrêtés après l’échec de géométrie ; aucune baseline récupérée et aucune comparaison intégrale post-navigation inventée. Les sessions Main/observateurs sont terminées. Le premier protocole AppContainer avait retenu `C:\Users\UP60066553\AppData\Local\Packages\sandbox.{76ac21e7-1a4b-4d7f-a834-0e86cadcca1e}\AC\Temp\madness-help-boundaries-aN6tEd` après refus du Move atomique de supervision, faute de reçu terminal ; aucun nettoyage non attesté de ce témoin.

## À reprendre par le parent

Revue high/Quick et rechecks ; première série visuelle réelle et détecteur/finition Impeccable ; qualification de réouverture passive Main et candidat/ASAR/installation Windows sous leurs preuves exactes. Les tests cœur et UI prouvent déjà la passivité locale, mais ne remplacent pas ces contrôles Main/paquet manquants. Aucun profil personnel, fournisseur, OAuth/JWKS ou réseau demandé dans ce passage ; version logicielle toujours 0.2.7, prochain candidat distinct 0.2.8 à préparer selon le plan.
