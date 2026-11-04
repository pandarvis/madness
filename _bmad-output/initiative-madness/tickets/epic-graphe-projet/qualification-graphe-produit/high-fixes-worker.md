# Correctifs ciblés high et finish — remise au parent

Candidat **0.2.12**, dist/graph-reviewed-high-finish, ASAR **fb688dfd8e8b0f70751d3f2c5564ade5b5c31f4cfd4cc6df234f7dc0e2743ed4**, NSIS **8b99b1df0a53e5ebda603408a294abef6e5a59eb31c501ea08a30109c2baad78**. [Manifeste complémentaire](candidate-high-finish-manifest.json). Produit prêt au recontrôle par les mêmes auditeurs, sans stage, commit ni installation par le worker.

## High-1 et High-2

H1 : le propriétaire natif conserve désormais l'identité complète de la tentative liée à sa génération physique. Après récupération commune explicite, seule une preuve d'arrêt émise par ce propriétaire, immutable et authentifiée dans le host, peut confirmer l'arrêt du seul état Graph inconnu correspondant. L'issue reste inconnue et le résultat conservé reste daté. Reçu absent, Job non drainé, ancienne possession non liée, preuve copiée ou tentative étrangère ne débloquent rien. Aucun rejeu, analyse ni autorité fichier n'est créé.

H2 : le launcher ajoute l'observation de chaque tentative enfant dans son finally, y compris observation absente ou exception, puis agrège toutes les tentatives. Un enfant démarré doit prouver l'assignation avant reprise et Job actif égal à zéro ; sans cette preuve, le terminal agrégé reste inconnu, jamais zéro ou neverStarted trompeur.

Rouges reproduits puis **19/19 ciblés, zéro skip** : [rouge H2](logs/graph-high-red.log), [rouge preuve étrangère H1](logs/graph-high-foreign-red.log), [verts](logs/graph-high-targeted.log). H2 exécute le véritable source PowerShell complet du launcher, avec observations injectées et sans présenter ces injections comme de vrais Jobs Windows.

[Contrôle natif ciblé 002](high-targeted-002/report.json) : quatre contrôles verts sur le candidat intermédiaire ASAR6c422b60… ; vrai Job de capture assigné avant reprise puis drainé, reçu volontairement absent refusé, récupération commune Main réconciliant A seul et conservant B étranger, drafts/résultat/fraîcheur exacts et aucun grant. Le premier contrôle001 rouge reste conservé : son banc avait lu la commande avant la publication terminale asynchrone ; le002 attend cette publication sans changer le produit. [Vrai Graphify sans Git](logs/graph-high-native-graphify.log) : **1/1 vert**, preuve native liée et chemin normal à deux enfants.

Après F1/F2, les octets Main, preload et **3050 fichiers Graphify livrés** du candidat final sont exactement identiques au candidat intermédiaire contrôlé. Les neuf entrées source du contrôle002 sont toujours exactes. Cette équivalence limitée est prouvée dans le manifeste ; aucun nouveau vertical intégral n'est attribué au nouvel ASAR.

## F1 et F2

F1 : l'état de la dernière tentative (interrompue, délai dépassé, arrêt confirmé ou inconnu) précède le statut du résultat conservé ; sa propre identité et l'identité du dernier graphe restent distinctes. F2 : les libellés SVG compensent la transformation réellement mesurée du viewport et le zoom local pour rester lisibles, en conservant géométrie déterministe, liste, sélection, recherche et pan.

[Rouges avant correction](logs/graph-finish-red.log) : faux « Analyse terminée » et fonte effective7,17CSSpx. [Verts](logs/graph-finish-green.log) : **4/4**, dont interruption, timeout, transformations Fit/Reset et ancien cas UI Graphe. [Banc corrigé](logs/graph-finish-wrapper-check.log) : **3/3**. Build/typecheck et NSIS codes0 : [build](logs/graph-finish-build.log), [paquet](logs/graph-high-finish-package.log).

## Troisième lot dirigé par finish

Deux chemins désignés seulement : [interruption et résultat conservé](finish-directed-round3/interrupted-retained-dark.png), [même graphe45 après Fit](finish-directed-round3/fit-45-dark.png). [Rapport](finish-directed-round3/report.json) vert. Les deux PNG ont été ouverts visuellement par le worker. Replay clairement marqué, constitué du vrai graphe natif005 et de son corpus conservé, avec état de tentative synthétique ; aucun nouveau moteur ni grant. Les sources renderer exactes sont figées dans le rapport.

Fond effectif rgb(33,31,30), vraies fontes Oxanium et Barlow Condensed chargées, viewport1650×1150, DPR1,25, zoom natif1. Fonte effective minimale **14,01CSSpx** après Fit et Reset, hauteur de libellé14,4px, **45/45 nœuds cadrés**. La première tentative avait un wrapper blanc et une fenêtre rétrécie ; elle reste intacte dans [attempt1-invalid](finish-directed-round3/attempt1-invalid/report.json), rejetée comme preuve. Compte explicite : **deux lots initiaux + troisième lot de scoring à deux tentatives, soit quatre tentatives de capture au total**. Aucun autre lot, détecteur ou nouveau scénario.

Les cinq PNG005 et tous ses reçus restent inchangés et rattachés à leur ancien ASAR2f7ab4a1… ; ces nouvelles captures prouvent uniquement le delta renderer rejoué, pas une nouvelle qualification native globale ni une validation humaine/WCAG.

## Limites et suite parent

Même auditeur high et même finisher à rappeler sur ces deltas ; documenteur parent étroit, revues finales, statut du plan et commit restent parent. Les neuf rouges UI historiques détaillés dans implementation-handoff.md ne sont pas promus en vert. Aucun travail4.3, nouvelle fonctionnalité, nouveau GC ou nettoyage unknown ; les miroirs/reçus/sorties privés restent retenus, volumétrie et nettoyage en4.7/4.9. Préversion interactive du parent, application installée et profils personnels préservés.
