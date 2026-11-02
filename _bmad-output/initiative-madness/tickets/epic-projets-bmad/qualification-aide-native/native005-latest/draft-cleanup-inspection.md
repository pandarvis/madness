# Inspection ciblée — archivage du brouillon témoin003

2 novembre 2026. Inspection seule du script privé `C:/Sources/madness/_bmad-output/initiative-madness/.working/help22-passive-draft-cleanup.mjs`, de `epic-one-support.mjs`, de `PersonalSession` et du contrôleur privé `HelpPersonalSession/assertClosedProfile`. Aucun import/exécution du banc, aucun profil/compte/témoin/application/modèle/réseau consulté ou actionné. Seul ce rapport est écrit ; aucun staging/commit.

Les gardes de possession, de réouverture et de conservation sont cohérentes pour le témoin fixe. Les deux écarts initiaux ci-dessous sont désormais résolus, selon le recontrôle ajouté en fin de rapport ; le verdict courant y est limité à la cohérence du script privé.

## Constats initiaux — résolus au recontrôle

1. **Entrée non passive à l'import — script lignes10–13.** Sans `--run`, l'import jette `EXPLICIT_RUN_REQUIRED` ; avec un `--run` appartenant à un autre programme qui l'importe, tout le corps top-level s'exécute, jusqu'à l'ouverture de l'application puis l'archivage si les options concordent. Le fichier n'a pas le garde direct-entry que le contrôleur privé possède désormais. Correction minimale : placer le travail dans une fonction et ne l'appeler que si `process.argv[1]` correspond au chemin du module et si `--run` est explicitement présent. L'import seul doit laisser cette fonction inactive. Le contrôleur importé est, lui, correctement gardé par son propre chemin d'entrée : il ne lance pas son échange complet à l'import de ce nettoyage.

2. **Annonce d'observateurs complets sans garde correspondante — lignes29–30.** Le pass `real-main-and-children-closed-with-complete-observers` suit seulement `session.close()` et `assertClosed`. Ce dernier contrôle mainGone/childrenGone/closeObserved ; `PersonalSession.observe()` contrôle l'overflow de l'observateur natif, mais pas `controlTrace.complete`. Le script ne vérifie pas non plus `help.overflow` ni `help.pending`. Il peut donc employer ce libellé malgré un indicateur d'observation incomplète. Conditionner cette annonce à la complétude de la trace centrale et à la trace help non débordée/sans demande pendante, ou conserver un libellé plus restreint. Pour une annonce couvrant aussi la fermeture, utiliser les compteurs persistés finaux : les compteurs zéro de la ligne29 ne couvrent que l'instant précédant close.

## Gardes et paramètres vérifiés

- Le cwd est employé pour charger les supports du worktree ; le témoin fourni doit correspondre exactement à l'id `help-d09fc61f-aaf6-4f5d-a5f5-5067b7def3bf` et au chemin `_bmad-output/initiative-madness/.working/help22-native-witness-003` sous ce cwd. Un cwd erroné avec le manifeste témoin prévu échoue avant accès au profil.
- Avant l'ouverture : profil sans propriétaire Madness/Electron admis, racine sans lien, marqueur owner/id exacts, un seul projet lié à la racine, un seul brouillon non vide, aucune conversation et aucune annexe Help pour son id. Le contrôle de profil n'exempte que DIA à son exécutable exact ; aucune autre application n'est arrêtée par cette garde.
- Les appels directs du script utilisent `page.evaluate` sans argument personnalisé. Les appels Main hérités de HelpPersonalSession donnent bien le module Electron en premier paramètre et les options en second. L'erreur de signature de006 n'est pas réintroduite ici.
- Le paquet est vérifié avant ouverture. La restauration effective compare projets, brouillons, conversations et préférences en mémoire, puis les octets du snapshot durable. La lecture du compte est distincte des contrôles d'absence d'activité ; aucun tour, préparation helper ou action de connexion n'est demandé.
- L'archivage n'est appelé qu'après retour de close, preuve main/enfants/close et nouveau contrôle du snapshot et des empreintes du dossier connexion. `archiveWitnessData` réexécute assertClosedProfile avant sa mutation du snapshot et chaque suppression d'annexe. Il valide le snapshot par JsonStore, refuse une version inconnue/corrompue et vérifie les octets avant écriture. Les annexes questions/approbations/workflows rattachées à un projet sans conversation font échouer la garde, au lieu d'être effacées silencieusement.
- L'archive ne contient que les enregistrements du projet possédé et son brouillon ; le répertoire témoin est conservé. Après mutation, le script compare toutes les autres entrées, les préférences et les empreintes des fichiers connexion. Le helper d'archive conserve également ses copies et son reçu ; son rollback ne doit agir que profil fermé et sur ses octets attendus.
- Le catch conserve le dernier reçu de fermeture même si son assertion jette. Un échec ne devient pas un nettoyage réussi.

## Compteurs et limites

`ownedDrafts=1`, `ownedConversations=0` et `ownedHelpRecords=0` correspondent aux gardes explicites avant ouverture ; ce ne sont pas des observations déjà exécutées. Le retour du helper expose ensuite les nombres effectivement archivés.

`realProjects=before.projects.length-1` et `realProjectsPreserved=after.projects.length` comptent tous les autres projets du profil. Le script ne les classe pas indépendamment comme projets réels : `otherProjects` serait le libellé exact si d'autres témoins étaient présents.

Cette inspection ne prouve aucun compteur personnel, aucune réouverture, aucune fermeture ni aucun archivage effectif. Elle n'accorde aucun succès M14 et ne réinterprète pas les échecs natifs antérieurs.

## Recontrôle des deux corrections — résolues

Inspection seule du même script privé après corrections ; aucune exécution/import ni ouverture d'application.

- **Entrée : résolue.** Tout le travail est maintenant dans `runCleanup`. L'appel top-level exige que `process.argv[1]` corresponde au chemin du module (`fileURLToPath(import.meta.url)`). Un import depuis un autre point d'entrée, y compris lorsque celui-ci possède son propre `--run`, n'appelle donc plus le nettoyage. L'exigence de `--run` demeure à l'intérieur de la fonction, avant les accès de travail.
- **Complétude des observateurs : résolue.** Avant le premier pass, le script exige native.overflow=false, controlTrace.complete=true, tous les indicateurs incomplete=false, help.overflow=false et pending=0, en plus des compteurs zéro déjà présents. Après fermeture, il contrôle de nouveau les indicateurs de la trace native persistée et relit le JSON help durable pour exiger overflow=false, pending=0 et spawns=0. L'annonce `closed-with-complete-observers` ne précède plus ces gardes.
- Les assertions strictes de fermeture, le contrôle des octets du snapshot et des empreintes connexion avant archive, les gardes de possession et les contrôles de conservation restent placés avant/après la mutation comme décrits plus haut. Aucune condition de fermeture n'a été assouplie.

**Verdict courant :** les deux constats ciblés sont résolus ; aucun nouveau défaut concret identifié dans ce delta. Accord limité à la cohérence du script privé pour le seul témoin003 et aux contrôles qu'il exprime. Les compteurs personnels, la réouverture, la fermeture et l'archivage restent à constater par le parent lors de l'exécution explicite. Aucun succès M14 ni résultat de nettoyage effectif n'est déduit de cette inspection.
