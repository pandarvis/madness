# Profil G2 candidat — reprise5 hors produit

Le candidat qualifie l’observation et le chargement de données sûres de
l’installation locale exacte `6.13.0-next`, avec refus reproductibles. Il fournit
des contrats documentaires à Sally2.17 puis au tracer2.2 sous l’autorité du cœur
et des AD-2/3/7 de Winston. Aucun G2 intégré, catalogue/aide UI ou lancement
général n’est livré. Mary/Forge conservent leur profil produit existant.

## État et capacités

L’installation observée comporte trois modules (`core-tools`, `method`,
`toolsmith`),27descripteurs de compétences, trois aides de module chargées,
43topics et deux migrations référencés. Le diagnostic est **partiel** :
`method` déclare `bmad-retrospective`, absente. Aucun setup/réparation n’est
déclenché ; les capacités indépendantes et les aides sûres restent lisibles.
Les17entrées de l’epic sont identifiées sans feuille matérialisée. Statuts du
plan, de la feuille et du tracker restent chacun sourcés ; aucun ne prouve une
acceptation humaine. Le résultat courant nommé et scellé est précisé ci-dessous.

| Capacité | Preuve et portée |
|---|---|
| Présence/format | M1–M3 : exact local, absent, marqueur ancien et preview inconnue distincts. Ancien observé ne signifie pas exécutable. |
| Modules/skills | M3–M5 : métadonnées séparées ; SKILL, appartenance réciproque et dépendances vérifiés ; commandes descriptives exactes, runtime général indisponible. |
| Aide | M6/M11 : contenu réellement lu et chargé, références topics/migrations distinctes ; absent, UTF-8 invalide, hors portée ou trop grand refusés sans troncature. |
| Personnalisation/roster | M7 : trois couches officielles et refus sourcé avant tout repli d’identité masquant une erreur. |
| Initiatives/contexte | M8/M9/M12 : sélection locale distincte ; contexte résolu depuis les mêmes octets que son reçu ; conflit et mutations bloquent l’ancienne invocation. |
| Tickets | M1/M13 : entrée TOML sans feuille ; sources complètes de feuille/plan/tracker conservées avant jointure. |
| Recommandation native `$bmad` | Non qualifiée ; le tracer2.2 doit transmettre le bundle réel et obtenir un reçu natif. |
| Exécution générale | Non qualifiée M14 ; une invocation exacte copiable n’est pas une capacité lançable. |

États proposés : `absent`, `legacy-observed`, `unknown`, `partial`,
`candidate-observed`, `incompatible`, `invalidated`, `error`. Une version non
éprouvée reste unknown ; frontière ou configuration refusée bloque les capacités
touchées avec code/source. L’état agrégé ne masque pas leurs différences.

## Racines, configuration et fraîcheur

Le cœur autorise explicitement la racine canonique projet et les racines de
skills réellement actives de l’hôte, ordonnées projet puis utilisateur. Aucun
home réel n’est exploré ici. La priorité officielle porte sur le **nom du
dossier** : un masque local sans record empêche de réactiver la copie utilisateur.
Une sortie externe permise par BMad n’élargit pas l’autorité Madness.
Output relatif/absolu interne et `{project-root}` interne admis ; traversal,
URI, chemin relatif à lecteur et sortie externe refusés.

Centrale : `_bmad/config.toml`, `_bmad/custom/config.toml`,
`_bmad/custom/config.user.toml`. `_bmad/config.user.toml` est ignoré.
Compétence : `customize.toml`, `_bmad/custom/<skill>.toml`, puis
`<skill>.user.toml`. Tables récursives, tableaux ordinaires ajoutés, éléments
à code/id remplacés **en entier**. Un TOML présent invalide conserve son erreur.
Roster prévalide chaque personnalisation exploitée avant `agent_identity` ;
une identité de repli ne cache pas ConfigError. L’appartenance est réciproque :
la présence d’une skill déclarée par un autre module est une contradiction.

Le reçu `context-v2` porte couches/octets/identités/empreintes et résolution
`config_utils.merge_layers` **de ces mêmes octets**. Une ancienne résolution
fournie séparément est comparée et refusée si divergente. `fresh_context`
recapture et résout ; il ne garde jamais alpha sur de nouveaux octets beta.
M12 éprouve ce cas, avec skills inchangées. M8 écrit réellement l’initiative
alpha dans la fixture et distingue l’initiative active de la sélection locale.
Une navigation ne réattribue aucun échange et n’écrit pas la configuration.

Bornes expérimentales : UTF-8 strict,1Mio/fichier,16Mio/corpus,1024entrées,
profondeur12 pour les skills. Le contexte borne configurations et seuls fichiers
immédiats `<initiative>/<initiative>.md` exploités, sans parcourir les binaires.
M11 refuse17fichiers de1Mio. Ce ne sont pas des limites officielles de BMad ou
de nouveaux choix UI. Reparse/symlinks/hardlinks et types irréguliers refusés ;
handle Windows et ancêtres contrôlés avant lecture. M10 exerce réellement les
hardlinks, jonctions et remplacement d’ancêtre. Ajout, suppression, remplacement
ou mutation de contenu invalide le reçu, indépendamment de l’horloge.

Les fonctions gérées travaillent sur des snapshots bornés de données, jamais
sur du Python du projet analysé. Le runtime courant est une **copie possédée
fermée** des734fichiers déjà épinglés ; les caches originaux ne sont pas copiés.
Avant le PREMIER UV, la garde native contrôle l’ensemble exhaustif des octets,
base/parent venv et l’absence de toute entrée supplémentaire. Workers et probes
répètent la garde Python. M15 éprouve les caches ctypes/importlib existants en
données et14variantes non admises, dans les deux gardes, sans exécuter leurs
charges. Seule la copie exacte sert au probe UV positif. `uv run --offline
--no-project --no-config --no-cache`, Python `-I -S -B`, environnement filtré et
temp/cache possédés. Voir [sources.md](sources.md) pour le périmètre exact et la
distinction avec les garanties historiques insuffisantes de `-B` seul.

La fraîcheur est un contrôle au point de préflight ; l’intégration devra le
répéter au point d’effet. Aucune immuabilité du système de fichiers ou sandbox
contre un adversaire OS n’est promise. Hooks, migrations, `setup --status`,
`render_skill` et configuration personnelle ne sont pas exécutés ou modifiés.

## Contrats documentaires proposés au cœur

| Contrat | Données et invariants |
|---|---|
| `EvidenceRef` | Source, racine autorisée, chemin relatif, SHA256, révision, observation et origine projet/utilisateur/géré ; portée et fraîcheur courante/invalidée/historique. |
| `ProfileDiagnostic` | Version exacte/runtime, racines ordonnées, révision et état agrégé ; capacités indépendantes, disponibilité, refus/preuves/récupération. Aucune installation implicite. |
| `KnowledgeBundle` | Module/record, skills couvertes, documents avec texte réellement chargé et preuve ; topics/migrations en références seules ; problèmes et couverture exacte. |
| `AgentRecommendation` | Conversation/tour natifs, bundle réellement transmis et ses empreintes, réponse brute reçue, raisons et alternatives de l’agent. Sans reçu, aucune mention « BMad recommande ». |
| `ActionDescriptor` | Module/skill, invocation Codex exacte `$<nom-dossier>`, objectif/entrées/conditions/effets/livrables sourcés ou inconnus. `copyable` séparé de `launchability`. Pas de quota ou séquence obligatoire. |
| `CapturedBmadContext` | Projet/racine canonique, profil/révision, output confiné, couches et résolution du reçu context-v2 ; initiative BMad et sélection Madness séparées, conflits/preuves. Les opérations/conversations gardent leur contexte capturé. |
| `InvocationReceipt` | Opération, contexte/descripteur/révisions contrôlés avant envoi, texte exact, connecteur/connexion/capacités, accusé natif, résultat connu/inconnu/échec. Copier n’envoie rien ; accusé n’est pas accord humain. |
| `TicketEvidence` | Conteneur/id, entrée TOML, feuille optionnelle avec ses champs, plan optionnel et son ticket/statut, tracker, contenus/empreintes et contradictions avant jointure. built/fichier présent n’est pas une acceptation. |

Une action exigeant une initiative doit résoudre explicitement un désaccord
avant invocation ; une action sans initiative suit ses propres conditions.
Un diagnostic invalidé reste historique et impose relecture ciblée. Aucune
union d’invocation produit n’est étendue par ces propositions.

Sally2.17 doit représenter diagnostic partiel, aide chargée/réponse native,
descriptif/copiable/lançable, active/sélection et statut/accord humain, en
conservant projet/conversation/brouillon pendant refus/relecture. Palette et
contrats visuels adoptés restent l’autorité. Le tracer2.2 doit qualifier `$bmad`
réel, transmettre l’aide, obtenir le reçu natif et conserver la réponse et les
alternatives. La clôture2.16 vérifiera ces consommateurs intégrés et le paquet.
Autres versions/OS/racines, hooks tiers, initialisation et dépendances complexes
restent non qualifiés. R32/Q8/Q9 ne reçoivent ici aucune mesure, aucun coût ou
suivi de notre développement. SIWC, cache réseau et persistance sont inchangés.

## Reproduction et conservation

Depuis la racine dans PowerShell7 :

```powershell
& '_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/run.ps1' -Action run
& '_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/run.ps1' -Action seal -RunId 'run-<UUID>'
& '_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/run.ps1' -Action verify -RunId 'run-<UUID>'
& '_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/run.ps1' -Action promote -RunId 'run-<UUID>'
```

Chaque exécution crée son emplacement neuf, conserve les douze sources et le
verrou réellement exécutés. Les trois commandes suivantes sont distinctes :
scellement create-only ; lecture seule sans réécriture ; promotion explicite et
mise à jour du seul pointeur selected-run. `probe` cible M7/M15 ;
`receipt-proof` cible les seuls lecteurs/destinations de M15 ; `windows-proof` cible M13 ; `inner-proof` cible les nouveaux cas internes et la référence sélectionnée. `interrupt-proof` exerce le lanceur exact : handshake
maximum30s pour observer la fixture enfant, puis délai court4s et arrêt attendu,
sans results.json ni qualification. Chaque commande capture ses flux natifs
dans des journaux existants ; les anciennes sorties absentes ne sont pas recréées.

La politique courante est **schema5 / captured-source-only-v5**. Schema1/2/3/4 et
anciens schema5 à bench différent restent historiques, jamais nouvellement
scellés/promus sous cette politique. Les18runs/304fichiers antérieurs et les
quatre archives iteration-0/1/2/3 sont préservés ; carte parent
[reproduction-v4-before.json](reproduction-v4-before.json). Le run0157… demeure
la preuve du tour3 (15/15,270assertions/23observations), sans preuve des nouveaux
cas. Aucun ancien code n’est exécuté pour vérifier son reçu.

## Garanties nouvelles de la reprise4

La configuration centrale est parsée avec `tomllib.load(BytesIO(raw))`, comme
`config_utils.load_toml` binaire : LF/CRLF valides, BOM et CR isolé refusés.
M7 compare le résultat/refus natif aux mêmes octets capturés ; le vérificateur
recalcule aussi cette résolution binaire. `parse_text` reste réservé aux preuves
TOML et Markdown de tickets lues officiellement en utf8-sig/newlines universelles ;
M13 conserve leurs octets et leurs champs indépendants.

Toutes les branches du vérificateur capturent d’abord le répertoire immédiat
du reçu avec une liste fermée de26noms : ni absolu, ../, sous-dossier ni ADS.
Une clé bench ou manifest reste une donnée, sans accès de chemin. Chaque fichier
et ses ancêtres sont contrôlés (liens/reparse/hardlinks, type et handle Windows)
avant lecture ;1Mio par artifact,4Mio par log,64entrées au plus et16Mio cumulés.
Les snapshots servent aussi aux runs échoués, interrompus, non scellés et
schema1/2/3. Aucun `.is_file()` ne permet de sauter silencieusement un lien.
M15 appelle le vrai `verify.main` sur copies possédées avec32noms malveillants,
liens/jonction/hardlink et preuve excessive ; les témoins extérieurs sont intacts.

Avant toute création exploitable, `runs/` ET `logs/`, leurs ancêtres et la
destination possédée sont contrôlés. M15 lance une copie du banc pour chaque
jonction préexistante : refus avant reçu/runtime/cache/UV et cible intacte.
Les vraies racines historiques ne sont ni déplacées ni remplacées pour ces tests.

La supervision utilise un **Job Object Windows** créé avec KILL_ON_JOB_CLOSE.
Le processus est créé suspendu, affecté au job puis repris : aucun descendant
ne peut précéder la possession. Au retour du parent, même réussi, les processus
encore présents dans le job sont arrêtés ; l’état `descendants-stopped` conserve
le retour du parent sans annoncer une matrice réussie. La vidange des deux pipes
partage3s maximum ; l’arrêt du job est contrôlé sous5s et la lecture du code de
sortie sous1s. Le délai ordinaire reste600s, handshake de test30s distinct et
borné ;60s par appel géré et4Mio par flux. Ce sont des budgets expérimentaux,
aucune mesure produit/US ni promesse de latence. Aucun retry.

M15 éprouve un vrai parent qui crée un enfant gardant les pipes puis sort0 ;
présence de l’enfant, état actif du job après sortie du parent, arrêt effectif,
retour fini, logs et nettoyage sont contrôlés. Timeout après marqueur,
lancement impossible, overflow, reprise et refus hors possession sont conservés.
Le finally parent retire ses seules ressources, sans attendre les callbacks des
tests ; un run interrompu garde son reçu terminal non qualifié. Aucun processus
personnel n’est arrêté et aucune garantie contre un adversaire OS n’est déduite.

Premier résultat v4, historique après le complément du pointeur : [run-eb0c1970…](runs/run-eb0c1970fc6e43ed82402fec1227fcc9/results.json) :15/15sans skip,410assertions/26observations,23appels gérés réussis,411,375s ;558inputs identiques,15cas et trois racines parent retirés.28appels bornés sont observés au total, maximum11,781s et171635octets stdout. Scellement102/102,25artifacts ; manifeste da1d063be57480aa471308eb2075d0cf3ba2d0fcb848d856fc2a69f3f08603be. Lecture seule101/101 et historique0157…83/83 (current_qualification=false). [Preuve worker initiale](worker-verification-v4-initial.json) et [conservation304/4](worker-conservation-v4.json).
Les revues fraîches et le verdict Build restent au parent. G2 intégré,2.17 et2.2
ne sont pas lancés ; aucun compte/réseau/modèle ni configuration personnelle requis.
Limite instrumentale explicite : une sonde ponctuelle de création de symlink
fichier a été refusée par Windows (privilège administrateur). Aucun lien créé,
aucun nouveau privilège ni skip vert ; la variante native symlink fichier n’est
pas attribuée aux preuves de fichiers extérieurs, jonctions et hardlinks réels.
Le refus des reparse fichiers reste dans les gardes du profil.
## Résultat historique v4 après compléments

Le candidat historique v4 est
[run-16822ad1c1f04c459a9c8bf974990770](runs/run-16822ad1c1f04c459a9c8bf974990770/results.json) :
15/15 sans skip,415assertions et27observations,23appels gérés réussis et28appels
bornés observés. Durée406,062s (unittest404,018s), max10,891s/179105octets stdout ;
558inputs identiques,15cas et trois racines parent retirés, lanceur terminé0.
Le contrôle du vrai main --promote refuse le pointeur hardlink avant tout reçu
ou troncature, témoin extérieur exact ; les gardes sont aussi au point d’écriture.

Le full intermédiaire65019622… reste14/15 : le shim pwsh est sorti0 avec un
descendant encore présent ; descendants-stopped a été conservé comme refus et
M15 s’est arrêté AVANT le nouveau contrôle de pointeur. Le probe choisit désormais
le binaire réel `$PSHOME/pwsh.exe`, chaîne contrôlée, version7.5.4 et SHA256
9660387054b1387f5ab7e907a61560674c762559f91279a50484240bb3659d53 enregistrés.
Aucune grâce ni relâchement de supervision n’a été ajouté. Le ciblé natif
[correspondant](logs/native-direct-host-eb4cec554faa4835b8a02c4587d876b5/probe.json)
et la matrice finale prouvent la reprise completed/0. Dans la matrice finale,
le vrai parent0/enfant30s a un job actif2→0, un enfant identifié absent,
un retour2,833s et une vidange93ms. Timeout, start-failed, overflow et gardes
hors possession restent vérifiés.

Scellement103/103,25artifacts ; manifeste
98055ef2e89c2b3f8f65bf57a617ec124da04c900e7cf37446ac70fa176cb1fb,
[journal natif](logs/seal-f5dd70e4cf264ac2957fde68a62f69f6/launcher.stdout.log).
[Mesures et reçus courants](worker-verification-v4.json). Les autres runs restent
historiques et inchangés, y compris eb0c et sa promotion ; les nouveaux octets ont
été qualifiés une seule fois après chaque correction, jamais par retry caché.
Les revues fraîches, la vérification indépendante et le verdict Build restent
au parent ; G2 intégré,2.17 et2.2 restent hors de ce spike.
Lecture seule finale102/102 puis promotion distincte103/103 sur le vrai pointeur
régulier, désormais16822ad1… avec le manifeste98055ef2…. Journaux réels :
[lecture](logs/verify-b08464e0b688451da3eeaf96ca734e8b/launcher.stdout.log),
[promotion](logs/promote-5ae7a18ae77447f2b313f63b952a7f2c/launcher.stdout.log).
[78empreintes avant/après](worker-readonly-v4-final.json) identiques pour le
courant, le premier v4 et le schema3 témoin ;304fichiers historiques et quatre
archives recontrôlés identiques dans worker-conservation-v4.json. Aucun dossier
fixtures-* ne subsiste ; tous les lanceurs sont terminés. Bloc figé inchangé,
SHA25604d5977b155af629da97dddb2fdfd6fcd85688948de133cc701c6d389037db18.

L’interruption exacte v4 antérieure
[b48b4d41…](runs/run-b48b4d415b1744239c77fa8eac3c20ec/execution.json) reste un
reçu historique sans results.json : marqueur après4,157s, timeout4s, job3→0,
vidange85ms et trois racines retirées ; lecture2/2non qualifiée. Le changement
ultérieur porte sur le vérificateur/scénarios et le choix d’hôte du probe ;
la supervision native est inchangée et ses cas d’arrêt sont retestés dans le
full courant. Aucun nouveau full passant n’est requis sans correction nouvelle.
## Garanties courantes de reprise5

La borne interne est désormais portée par le vrai `bounded_process` :
`runtime_guard.native_run` crée un job Windows KILL_ON_JOB_CLOSE, le processus
suspendu, l’affectation au job puis ResumeThread. Le budget unique60s porte sur
la fin de tout le groupe possédé et ses sorties, y compris après sortie UV.
Aucune grâce ni relance n’est ajoutée ; si la racine est morte mais un descendant
reste au délai, l’état est `descendants-stopped`, jamais un succès. Les autres
échecs timeout/start/stop/drain/capture/output restent typés. Le job est arrêté
même si l’observation échoue ; aucun arrêt n’utilise un PID extérieur.

Les pipes sont des handles natifs sans buffering, threads ou join. Une lecture
ReadFile suit seulement PeekNamedPipe disponible, avec un lecteur unique.
L’entrée est un fichier temporaire possédé, transmis par handle héritable puis
fermé/nettoyé : aucun stdin.write de pipe ne peut attendre qu’un enfant lise.
Après le cycle utile : stop5s, drain3s et observation finale1s au maximum ;
4Mio conservés par flux. Les mesures réelles et hashes des flux sont dans
`calls.log.supervision`, non des mesures produit ou US. Les PIDs du job sont
observés par handles, avec appartenance IsProcessInJob ; seul le job arrête.

M15 appelle directement cette fonction sur six cas : parent0/enfant30s tenant
les pipes, timeout avec enfant vivant, overflow,1Mio de stdin jamais lue,
lancement impossible puis nouvel appel réussi. Marqueurs, sorties brutes/hashes,
processus enfant et arrêt réel sont contrôlés avant leur terminaison naturelle.
Le probe extérieur `Invoke-G2Supervised` reste une preuve distincte conservée.

Sans `--run`, le vrai vérificateur capture le pointeur sûr complet, valide
run et manifest_sha256 puis compare ce hash aux octets du manifeste capturé
avant toute branche de résultat. Un newline JSON aux hashes internes identiques
est refusé par le vrai main sur copie possédée (`SELECTION_MANIFEST_CHANGED`).
`--run` vérifie seulement le reçu explicitement désigné ; le résultat annonce
`selected: false`. La lecture finale par défaut après promotion doit annoncer
`selected: true`. Gardes anti-liens en promotion et create-only sont conservés.

Conservation :25runs/456fichiers antérieurs et cinq archives iteration-0 à4,
carte [reproduction-v5-before.json](reproduction-v5-before.json), restent
historiques. Aucun ancien code n’est exécuté. Les deux premiers ciblés v5
[d9c468…](runs/run-d9c468078ab44288b98f922d6f435665/results.json) et
[2d346…](runs/run-2d346c9f4d524bdf8a1db643717d3105/results.json) conservent leurs
échecs next/0 : descendants encore présents après sortie UV. L’hypothèse d’un
simple compteur retardé a été réfutée par observation de handle vivant. La
correction porte sur le cycle utile du groupe, sans relâcher stop ou refus.
Le ciblé [667d4547…](runs/run-667d454790664157a7b4882dccadde80/results.json)
passe1/1en18,024s,558inputs identiques et trois racines retirées. Il ne vaut
pas matrice complète. La qualification finale sera nommée dans la preuve v5.

## Candidat v5 avant patch d’entrée — historique

[run-696526c9f77d4399b06c11deafff34bf](runs/run-696526c9f77d4399b06c11deafff34bf/results.json)
passe15/15sans skip,470assertions/29observations et23appels gérés réussis ;
35appels bornés au total, incluant six probes internes et le refus source modifiée.
Durée405,187s (unittest403,733s), lanceur433,004s/exit0,558inputs identiques,
15cas et trois racines possédées retirés. Maximum ordinaire10,313s/186321octets
stdout ; l’overflow volontaire conserve exactement4Mio avant refus.

Le vrai bounded_process orphelin observe racine0à1,266s et enfant30s vivant,
retourne descendants-stopped à6,000s et job2→0, enfant identifié arrêté.
Timeout6,000s/job4→0 ; entrée1Mio non lue3,016s/job3→0 ; overflow1,797s ;
lancement impossible15ms ; nouvel appel completed0en938ms. Vidanges internes
0–16ms pour ces cas. Chaque appel du full porte la politique de job avant
Resume, les compteurs et hashes exacts de flux dans calls.log.

Sceau create-only107/107,
[lecture explicite106/106](logs/verify-f4dbb0cbcf514d7784a9eccb32992247/launcher.stdout.log),
[promotion distincte107/107](logs/promote-d65d54b9f9684812a3e12bf976168a27/launcher.stdout.log),
puis [vraie lecture par défaut106/106, selected=true](logs/verify-8ee5ace0ba9a4b7bbd417138248b0439/launcher.stdout.log).
Manifeste `2151aa25c210f12f9659a21792fb2604c7282ee18a58c892a1da400f5bf9731f`,
25artifacts scellés. Le [sceau natif](logs/seal-0e7931fcb1ca492da108f97a118ca15d/launcher.stdout.log)
et tous les flux/états terminaux sont conservés ; aucun journal reconstitué.
L’ancien1682schema4 est relu83/83, current_qualification=false.

[Mesures et vérifications](worker-verification-v5.json),
[557empreintes avant/après identiques](worker-readonly-v5.json) couvrant tous
les runs présents, les13sources/verrou actifs et cinq archives ; les25runs/
456fichiers de reproduction-v5-before sont conservés. Aucun fixtures-* restant.
Un seul full v5 passant a été exécuté sur les sources finales. Revues fraîches,
audit indépendant et verdict Build restent au parent. Aucun produit/géré/
configuration personnelle/runtime réel/compte/réseau/modèle modifié ou lancé ;
G2 intégré, Sally2.17 et tracer2.2 ne sont pas lancés. La limite native symlink
fichier faute de privilège reste explicite et ne devient pas un skip vert.

## Clôture parent après BV5-1 — 2 novembre 2026

Le candidat696… ci-dessus est désormais historique du correctif d'entrée. Le
parent a exécuté le candidat final [run-d499adb2942e40e8a84c370fb7208ef2](runs/run-d499adb2942e40e8a84c370fb7208ef2/results.json) :
15/15sans skip,470assertions/29observations/35appels,412,094s,558inputs identiques,
15cas et racines possédées retirés. Scellement107/lecture106/promotion107/défaut106
selected=true ; manifeste `a85f00ec71e7973c3b9dba624b1338e47d6a9c3e0e9eaa18242421a3c89f326e`.
[Actions natives](parent-final-actions.json), [583empreintes identiques](parent-final-readonly.json)
et [audit indépendant](parent-verification.json) sur30runs/129sources/456anciens
fichiers/cinq archives passent. Quick sans constat ; BV5-1 corrigé et recontrôlé
résolu par le relecteur frontières original, aucun correctif différé.
[Conclusion et limites](parent-verification.md). Qualification documentaire hors
produit terminée ; G2 intégré demeure à vérifier en2.16. Sally2.17 puis tracer2.2
sont la suite, sans nouveau Build lancé ici.
