# Vérification parent finale — reprise de projet 2.4

**Build terminé**, revues et patches recontrôlés. Le candidat Windows reste non installé ; le paquet personnel d’infobulles n’a pas été remplacé. Le signal de latence préexistant est conservé pour qualification avant les actualisations fréquentes de 2.5.

La reprise lit explicitement les preuves de l’initiative choisie et expose quatre accès dans Parcours, avant l’aide : état, résultats/décisions, récapitulatifs et travail restant. Les déclarations TOML/feuille/plan/tracker restent séparées ; les extraits sont littéraux, les manques inconnus et l’acceptation humaine jamais déduite. Rejoindre une conversation retrouve son contexte capturé ; revenir conserve les détails et la position de la même capture.

## Artefact et contrôles finaux

Baseline `0056977abc1496aff0af5e38f291ef427fb80326` ; intention gelée LF `ab4d2de0dc75694616a6e23c3bdb79f8dd69b5874a3dcb58b4d3fa1c25215841`, inchangée. Candidat `dist/project-resume-reviewed-002`, version 0.2.7, ASAR `a336b3ade742a2bc825bcc41b7336221c29747742fffc4642212aa045eefe18b`. Le répertoire et les empreintes distinguent ce paquet des anciens0.2.7 ; aucune équivalence entre ASAR n’est déduite du numéro.

| Commande exécutée | Résultat | Reçu |
|---|---|---|
| `node --experimental-strip-types --test tests/bmad-progress.test.mjs tests/bmad-progress-protocol.test.mjs tests/bmad-progress-review.test.mjs` | 17/17, zéro skip ;14 cœur et trois bancs natifs totalisant21+28+8 contrôles Windows | [log](parent-postquick-native-001.txt) |
| `node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` | 6/6, zéro skip ; contexte, texte inerte, retour/brouillon, capture, thèmes, compact/zoom et120 entrées | [log](parent-postquick-ui-001.txt) |
| `node --test tests/bmad-progress-timings.test.mjs` | 1/1, zéro skip ; valeurs exactes, absence et exclusion de données non admises | [log](parent-timings-001.txt) |
| `npm run build` incluant les deux typechecks | Réussi | [log](parent-postquick-build-001.txt) |
| `electron-builder --win --x64 --config.directories.output=dist/project-resume-reviewed-002` | NSIS construit | [log](package-002.txt) |
| `node --experimental-strip-types scripts/qualification/bmad-progress.mjs --executable=dist/project-resume-reviewed-002/win-unpacked/Madness.exe --output=_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/package-main-002` | 12 contrôles réussis, deux fermetures possédées et profil Temp nettoyé | [reçu](package-main-002/verification.json) |
| Audit des sources, sorties et ressources du paquet | 203 inputs, 19 sorties ASAR, 14 ressources/pins exacts | [audit](package-audit-002.json), [manifeste](release-manifest-002.json) |

Le paquet lit réellement beta pour deux projets, conserve les statuts opposés et laisse les conversations alpha à leur contexte. Snapshot après navigation et après réouverture : SHA-256 `c8019a6774d4ea33628ecb83e9eabb4cb5f86fe2b8916c470a415950f14d41fb`, octets identiques. Huit opérations avant et après réouverture : aucune nouvelle. Projets/configurations, conversations et brouillons exacts. Les huit reçus terminaux attestent Job assigné, zéro actif, processus démarré puis terminé et code 0. Les deux observations Main attestent zéro réseau/app-server **après hook seulement**. Les constantes network/provider des tests de protocole ne sont pas présentées comme une mesure réseau.

Les sorties finales Main/preload et les14 fichiers helper sont reliés au paquet audité. Le manifest source se génère par `node scripts/release/manifest.mjs --directory=dist/project-resume-reviewed-002` ; le contrôle parent rapproche en plus chacun des outputs/ressources et les huit reçus de fermeture. Aucune nouvelle installation personnelle, requête OAuth/JWKS, invocation de fournisseur ou consentement n’a été nécessaire.

## Matrice gelée rapprochée des preuves

| Ligne | Preuves effectivement exécutées | Portée ou limite |
|---|---|---|
| P1 | Protocole Windows et paquet : deux projets/beta, SHA des octets réels et aucune écriture de sources | Profil qualifié seulement |
| P2 | Cœur/helper : entrée sans feuille, jointure id puis stem, feuille sans id native jointe par identité de fichier explicite | Id natif inconnu conservé, aucun id US inventé |
| P3 | Cœur/helper/UI : trois statuts séparés, désaccords littéraux et classes distincts, doublons/orphelins nommés | built ne vaut pas acceptation |
| P4 | Cœur/UI/paquet : extraits et lignes exacts, texte HTML inerte, récapitulatif et conversation alpha retrouvés | Pas de synthèse IA ni de conversation externe reconstruite |
| P5 | Cœur : absence/disparition de choix et racine remplacée refusées ; paquet : beta distincte d’active alpha | Consultation distincte d’une invocation |
| P6 | Windows : UTF-8/frontmatter/TOML invalides, limite fichier, hardlink, remplacement mêmes octets, mutation mixte ; canoniques d’epic et révision | Symlink fichier natif non exercé faute de privilège ; annexes/HTML/memlogs et preuves lourdes hors portée |
| P7 | Cœur : génération tardive/supplantée, contexte/racine changés, échec gardant snapshot et arrêt ; UI : annonce étrangère effacée, retour même capture à±2 px puis invalidation sur racine/révision | Aucun résultat étranger réattribué ; retour de session, pas nouvelle persistance de projection après fermeture |
| P8 | Cœur indépendant du compte, UI compte absent/HTTP(S) bloqué ; paquet sans compte, réouverture sans opération | BUSY/STOP_UNCONFIRMED maintenus, aucune connectivité fournisseur prouvée |

Tests et résultats cités ont été lus et confrontés à chaque ligne. Aucune suite globale actuelle, variante non exécutée ou conformité universelle n’est annoncée.

## Revues et corrections

Sally a réellement étendu les deux spines avant le code. Le même auditeur high a recontrôlé H1 annonce étrangère, H2 jointure stem, H3 provenance TOML et F4 canoniques v7 aux niveaux initiative/epic : résolus. Les reproductions rouges et les rechecks restent dans [corrections](review-corrections.md) et [portée finale](final-scope-handoff.md).

Quick a trouvé puis recontrôlé trois patches : Q1 statuts littéraux masqués par classe ; Q2 feuille sans id séparée de son plan ; Q3 détails/position perdus en revenant de Conversation. Les trois sont résolus, sans régression directe relevée par le même relecteur. Triage dans le plan ; [handoff des corrections](quick-corrections-handoff.md), rouges et verts conservés. Les identités `@file:` restent privées et explicitement distinctes d’un id natif ; aucun champ de bridge/schéma ajouté. **Aucun correctif fonctionnel de revue restant.**

Impeccable Operate conserve le monde atelier : deux lots d’inspection bornés puis batch prescrit pour F1. Cinq [captures et leur provenance](visual-finish-001/verification.json) ont été ouvertes par parent, worker et reviewers. Le même finish reviewer a confirmé F1 résolu, disposition ship au scope : quatre accès avant la liste repliée, preuves intégrales. La projection Main004 est explicitement ancienne ; les120 entrées sont une fixture séparée. Ces captures ne deviennent pas une collecte du paquet final. Les patches Quick sont fonctionnels ; aucune nouvelle finition visuelle/détecteur n’a été déclenchée.

Le détecteur manuel unique des cinq fichiers UI a retourné `[]`, exit0, avant les patches Quick : [résultat](impeccable-detector.json). Les rôles natifs n’étant pas exposés, des agents techniques frais ont chargé les définitions officielles du finish reviewer et du documenter. L’[audit documentaire](impeccable-documentation.md) conserve système/sidecar/spines et signale les dérives historiques sans les canoniser.

À 200 %, l’infobulle de thème transitoire reste visible dans la capture malgré l’état DOM d’invisibilité attesté ; sa neutralisation graphique n’est pas prouvée. Le reviewer conserve cette limite sans demander un autre lot. Aucun accord visuel humain global, audit WCAG, lecteur d’écran ou clavier physique n’est déduit.

## Performance et suite

Les huit opérations du paquet 002 conservent les timings déjà émis, avec liste blanche sans requête complète, stdout ou credentials. La phase lanceur `Assert-BmadClosedRuntime` mesure18,389–27,188 s par opération ; le champ worker Python mesure1,501–3,280 s. L’intervalle entre deux observations de collectes séquentielles est63,173 s, contexte/lifecycle inclus. Cette garde est le poste dominant de ce relevé ; ce constat n’attribue pas le coût à un syscall, au réseau, au proxy ou à l’antivirus et ne mesure pas isolément le parseur. [Mesures](performance-observation-002.json), [suivi](latence-observee.md).

Ce signal préexistant est consigné dans deferred-work.md et doit être qualifié puis traité avant2.5 ; aucun gain, cache de confiance ou affaiblissement de protection n’est acquis. Les travaux indépendants Graphify4.1 sont désormais prêts après adoption Sofia séparée. Le mandat autonome reste actif.

## Historique conservé

[Rapport avant clôture](parent-verification-before-final.md), candidat 001, Main001–004, diagnostics de fenêtre et recaptures conservent leurs propres sources et limites. Le compact Main004 mal nommé et son crop zoom sont exclus des preuves visuelles finales. Les premiers refus et erreurs de banc ne sont jamais promus en succès. L’ancien témoin AppContainer sans reçu terminal reste conservé et non nettoyé sur supposition. Le seul paquet personnel actuellement installé est celui des infobulles, inchangé par cette story.
