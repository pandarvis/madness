# Implémentation2.14 — reçu worker

Candidat0.2.16, ASAR `a15fddff0c17b317cdf7f955764a588d190b7784caaad421eac284c908c9a453`. Non installé. Source figée par `runtime-inputs-002.json` (`e4c0f204efa17d4ce4abdfd2edad6f31862132eb783da2eceed96b37b9434255`) :32inputs runtime,19outputs compilés et3fichiers de tests. `package-audit-002.json` relit les19outputs réellement contenus dans cet ASAR et le manifeste/pins effectifs. Aucun audit global735/2305 recréé.

Le port de langue est distinct de appearance-v1 et Snapshotv1. Main conserve le choix de session, sérialise les écritures et draine les demandes admises avant fermeture. Préférence absente sans écriture ; fichier invalide/futur/UTF-8 illisible préservé ; rename Windows réellement refusé ; read/reload ne réinitialisent pas le choix après échec. Le provider ne remonte pas App. Les notices locales gardent leur sémantique et les données techniques restent littérales.

## Vérifications exécutées

- `node --test tests/language.test.mjs tests/appearance.test.mjs` :17/17,0skip ; contrôle parent frais dans `parent-language-appearance-001.log`.
- `node --test --test-name-pattern="langue :|UI13 choix local|UI13 correction Q2" tests/connection-ui.test.mjs` :9/9 à ce point ; tests acteur1/1, absent+thème2/2 et observation bibliothèque1/1 ajoutés/repassés séparément après leurs changements pertinents. Soit11nouveaux cas langue et2régressions US distinctes, sans skip.
- `node --test tests/graph-ui.test.mjs` :2/2 après correction du stroke hérité ; couvre aussi requête/filtres/nœud/zoom et vue sans résultat conservés au changement de langue.
- `npm run build` : types et trois bundles réussis sur le gel002.
- `.\node_modules\.bin\electron-builder.cmd --win --x64 --config.directories.output=dist/language-reviewed` : NSIS x64 réussi.
- `node scripts/qualification/language-ui.mjs --output=<compiled-004 absolu>` :11contrôles ; `--executable=<dist/language-reviewed/win-unpacked/Madness.exe absolu> --screenshots --output=<packaged-002 absolu>` :11contrôles et8captures. Ces deux reçus vérifient eux-mêmes toutes les empreintes du gel002.
- `git diff --check` : code0, `diff-check.log`. Audit AST de frontières : aucun UI/presenter dans comparaisons, clés/IDs JSX ou scopes/identités JSON. Frontière Main des métriques byte-identique à la baseline (`6fcef5…b82819`).

## Matrice L1–L10

| Cas | Preuve retenue |
|---|---|
| L1 | Profil absentFR sans fichier ; EN réel au reload malgré argvFR ; réouverture effectiveEN. |
| L2 | Contrat/store/UTF-8/futur, vrai verrou rename Windows, file ordonnée, session conservée après échec/read/reload, future intacte à la réouverture. |
| L3 | Dictionnaires typés, cadres réactifs, rôles locaux, presenters fermés des producteurs et paramètres techniques conservés ; matrice copies/raw jointe. |
| L4 | Même textarea natif, Unicode, cursor/sélection/focus ; même panneau/source fichier et recherche ; aucune commande métier induite. |
| L5 | US choisie avant bascule, choose différé FR/EN, requestId/choiceRef/texte/opération exacts ; ancien refus se représente sans nouveau choose. |
| L6 | Boutons EN Reject/Allow appariés à decline/accept ; question française source et réponse exacte ; patch/raw inchangés. |
| L7 | Recherche, relations, nœud, zoom et clé sans résultat conservés ; aperçu/recherche catalogue sans relecture ; aucune analyse/éditeur pour la langue. |
| L8 | Deux lots groupés seulement,8PNG chacun ; FR/EN×clair/sombre,720px,rail,200% natif complet1650×1150,mouvement réduit et nom long. Second lot vérifié visuellement, labels graphes lisibles. |
| L9 | Quatre vrais lancements/quatre fermetures possédées pour chaque banc final ; Snapshot/brouillon/annexe métrique exacts ; profil supprimé seulement après fermeture prouvée. |
| L10 | Vrai handler Main : enum/propriétépath/frame refusés ; mutations aprèsclosing refusées ; écritures réellement pending auquit drainées vers le dernier choix. |

## Provenance et limites

Les premiers rouges et bancs restent historiques. `compiled-002` échoue sur un nom de canal du banc ; `compiled-003` le corrige avant les contrôles finaux. Le libellé de son contrôle «packaged renderer» est un texte du banc réutilisé : son champ mode atteste compiled. `compiled-001` est une première qualification bornée. `packaged-001` et ses8images restent rattachés à leur ancien ASAR ; ils ne sont pas promus au candidat final. Le lot002 est le second et dernier lot visuel. Détecteur unique exécuté après le lot002 : `impeccable-detector.json`, sortie0, six avertissements sur les arêtes atelier préexistantes (atelier-controls161, files.css1, styles.css337/409/412), hors nouveau contrôle de langue. Le monde atelier épinglé est conservé ; aucune troisième capture ni réécriture décorative.

Corrections privées préventives : literal absent du prédicat App et de la clé Graph ; clé originale limit de bibliothèque ; fallback stable de garde catalogue. Les copies absent étaient identiquesFR/EN : aucune panne comportementale antérieure n’est inventée. Le cas contexte courant activeStatusabsent passe dans les deux langues ; Main n’est pas affaibli. Les vrais rouges de thèmeENsombre, observation locale enveloppée en diagnostic et graphes héritant du stroke ont été reproduits/corrigés.

Les états natifs/question/approbation/graphe émis par le banc sont synthétiques. Les corps source français sont volontairement conservés dans les cadres anglais. Aucun reçu fournisseur, modèle, source collectionnée, acceptation humaine, conformitéWCAG ou gateG2–G5 n’est déduit. Tous les compteurs réseau/app-server des bancs finaux sont nuls après hook ; aucune absence d’activité avant hook n’est revendiquée.

Revues indépendantes Quick/bilingue high, finition/documentation officielles, triage final du détecteur unique déjà exécuté et commit/statuts restent au parent. Aucun correctif connu du worker différé. Les17anciens rouges ne sont pas balayés ici. Les données personnelles, préversion et secours0.2.13 sont intacts.
