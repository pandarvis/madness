# Vérification parent — reprise de projet 2.4

Le paquet candidat001 est vérifié pour ses propres octets. La revue Quick a ensuite confirmé trois défauts ; leurs patches ciblés sont en cours, et les preuves001 ne sont pas attribuées au code corrigé. Clôture du Build encore ouverte. Le mandat autonome du 3 novembre autorise les validations de méthode et commits locaux, pas l’invention d’une acceptation humaine. Aucun essai Zscaler, OAuth ou modèle n’a été demandé pour cette story locale.

## Périmètre et artefact

Lecture explicite des preuves de l’initiative choisie, projection déterministe dans Parcours, quatre accès de reprise, états détaillés repliés et détails textuels de provenance. Les entrées TOML, feuilles, plans et trackers restent séparés ; built n’est pas une acceptation. Les rubriques de résultats, décisions et travail restant sont des extraits littéraux. Les récapitulatifs locaux rejoignent leur conversation capturée exacte.

Baseline : `0056977abc1496aff0af5e38f291ef427fb80326`. Intention gelée LF : `ab4d2de0dc75694616a6e23c3bdb79f8dd69b5874a3dcb58b4d3fa1c25215841`, vérifiée inchangée avant revue.

Candidat : `dist/project-resume-reviewed-001`, version logicielle 0.2.7, ASAR `463c390ecde6a9225311b7031d705f82f6806cf60439172d131aeb62721abaf0`. Le répertoire et les empreintes distinguent ce candidat des anciens paquets 0.2.7. Non installé ; le paquet personnel du correctif d’infobulles reste en place.

## Contrôles exécutés

- `node --experimental-strip-types --test tests/bmad-progress.test.mjs tests/bmad-progress-protocol.test.mjs tests/bmad-progress-review.test.mjs` : 13/13, zéro skip, dont 21 contrôles protocole et 28 de revue dans les helpers Windows. [Journal final](final-green-native-001.txt). Les constantes network/provider du banc ne sont pas une mesure réseau.
- `node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` : 4/4, zéro skip ; compte absent, contexte, clavier, brouillon, deux thèmes, compact, zoom et liste de 120 entrées. [Journal final](final-green-ui-001.txt).
- `npm run build`, incluant les deux typechecks : réussi. [Journal](final-build-001.txt).
- `electron-builder --win --x64 --config.directories.output=dist/project-resume-reviewed-001` : NSIS construit. [Journal](package-001.txt).
- `node --experimental-strip-types scripts/qualification/bmad-progress.mjs --executable=dist/project-resume-reviewed-001/win-unpacked/Madness.exe --output=_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/package-main-001` : 12 contrôles réussis sur le vrai paquet, deux fermetures possédées, profil Temp nettoyé. [Reçu](package-main-001/verification.json).
- Audit des 201 inputs de construction, 19 sorties ASAR et 14 ressources/pins : exacts. [Audit](package-audit.json), [manifeste](release-manifest.json). La commande reproductible d’assemblage du manifeste est `node scripts/release/manifest.mjs --directory=dist/project-resume-reviewed-001` ; l’audit parent vérifie en plus tous les outputs et ressources contre les octets du paquet.

Le paquet lit réellement beta pour chacun des deux projets alors que les conversations historiques gardent alpha. Snapshot après navigation et après réouverture : SHA-256 `c01f09715bfe30945d558defde79f744148acb32871be17fcce20a608206e980`, octets identiques. Huit opérations helper avant et après réouverture : aucune opération implicite. Projets/configurations, conversations et brouillons exacts ; arrêt du propriétaire avant réouverture. Les deux observations Main attestent zéro réseau et zéro app-server après leur hook seulement.

## Audit de la matrice gelée

| Ligne | Preuve effectivement exécutée | Limite conservée |
|---|---|---|
| P1 nominal | Protocole natif 21 contrôles et paquet : deux projets/beta, SHA réels, lecture sans écriture | Profil qualifié seulement, aucun support universel de formats déduit |
| P2 sans feuille | Tests cœur et helper : entrée visible, plan joint par id puis stem, existence séparée | Une absence ne devient pas un état terminé/restant |
| P3 contradictoire | Tests cœur/helper/UI : trois statuts conservés, conflits, doublons et orphelins ; built ne valide rien | Acceptation humaine inconnue |
| P4 résumé | Tests cœur/UI et paquet : extraits/lignes exacts, texte HTML inerte, retour conversation alpha et brouillon conservé | Pas de synthèse IA ni de conversation externe reconstruite |
| P5 sélection | Tests cœur : choix absent/disparu/racine remplacée refusés ; paquet : beta n’est pas remplacée par active alpha | Consultation distincte d’une invocation de compétence |
| P6 collecte | Helper : UTF-8/frontmatter/TOML invalides, limite fichier, hardlink, remplacement mêmes octets et mutation mixte ; F4 : canoniques d’epic et SHA/révision | Symlink fichier natif non exercé faute de privilège ; seuls canoniques reconnus lus, preuves lourdes exclues |
| P7 concurrence | Tests cœur : génération tardive/supplantée, changement de sélection/racine, échec conservant snapshot, arrêt ; UI H1 et focus/détails/saisie | Aucun résultat tardif annoncé actuel dans une autre destination |
| P8 hors ligne | Cœur sans dépendance connexion, UI compte absent/HTTP(S) bloqué et paquet sans compte ; observations Main après hook, réouverture sans helper | BUSY/STOP_UNCONFIRMED maintenus ; aucune connectivité fournisseur prouvée par cette story |

Les tests cités ont été lus, leurs résultats finaux contrôlés et leur portée confrontée à chaque ligne. Aucune suite globale actuelle ou variante non exécutée n’est affirmée.

## Revues et UX

Sally a réellement étendu les deux spines avant le code, en gardant sept parcours, fontes, casting et palettes. Audit indépendant high : H1 annonce étrangère, H2 jointure stem, H3 provenance TOML et F4 livrables canoniques corrigés puis recontrôlés par le même auditeur. Les reproductions rouges restent conservées. Voir [corrections](review-corrections.md) et [portée finale](final-scope-handoff.md).

Impeccable Operate : deux lots d’inspection bornés, puis un batch prescrit par le finish reviewer pour F1. Cinq [captures finales et provenance](visual-finish-001/verification.json) ont été ouvertes par parent, worker et reviewer. Les vues courantes réhydratent une projection Main004 explicitement ancienne ; la liste de 120 entrées appartient à une fixture séparée, explicitement synthétique. Ni l’une ni l’autre n’est présentée comme une nouvelle collecte du paquet final.

F1 résolu par le même finish reviewer : les quatre accès précèdent la liste repliée et les preuves restent consultables ; disposition ship au scope, aucune régression constatée dans ce batch. Les rôles natifs Impeccable n’étant pas exposés, des agents techniques frais ont chargé leurs définitions officielles. Le détecteur manuel unique sur les cinq fichiers UI ciblés retourne `[]`, exit 0 : [résultat](impeccable-detector.json). Pas de seconde passe.

À 200 %, l’infobulle de thème transitoire reste visible dans la capture malgré l’état DOM d’invisibilité attesté ; sa neutralisation graphique n’est pas prouvée. Le reviewer a conservé cette limite sans demander un autre batch. Les anciens crops, captures mal nommées et essais Main échoués restent historiques dans leurs dossiers ; aucun reçu n’a été réécrit en succès.

Aucun accord visuel humain global, audit WCAG, lecteur d’écran ou clavier physique n’est déduit. Aucun compte/profil personnel, modèle, consentement ou paquet installé modifié. L’ancien témoin AppContainer sans reçu terminal reste conservé et non nettoyé sur supposition.

## Signal de performance à traiter

La lecture locale n’est pas qualifiée instantanée : un intervalle de63,597s entre deux collectes séquentielles est constaté sur001, contexte/lifecycle inclus. La cause reste inconnue. Voir [observation et condition de reprise](latence-observee.md) ; pas de collecte supplémentaire déclenchée pour ce signal.
