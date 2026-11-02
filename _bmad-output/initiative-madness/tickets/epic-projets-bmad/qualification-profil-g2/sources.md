# Sources et voie exécutable — reprise5,30octobre2026

Le [verrou](sources-lock.json), **schema5 / captured-source-only-v5**, conserve
sept scripts gérés et leurs hashes, six copies identiques sous
`.agents/skills/bmad/scripts`, UV0.13.0,734records du runtime produit et558inputs
produit/gérés/configurés. Ces périmètres restent distincts. Seuls les douze
sources du banc et leur politique évoluent ; aucun src/tests produit, script
géré, dépendance, runtime réel ou configuration personnelle n’est modifié.

## Primitives et données

Fonctions officielles réellement utilisées : `knowledge.collect/scan`,
`config_utils.merge_layers/load_central_config/load_customization`,
`roster.collect`, `tickets.load_folder/parse_frontmatter`. Les sources
`resolve_config`, `resolve_customization` et `setup_check` sont épinglées et
inspectées, sans CLI ni hook exécuté. Les six copies de scripts sont comparées
avant/après. `setup --status`, migrations, `render_skill`, Python/hooks du projet
analysé et `tickets.central_config` sont exclus. Les sources fournies par les
fixtures restent des données ; seuls les outils de provenance maîtrisée
consomment les snapshots sûrs, revérifiés dans chaque worker.

L’installation réelle possède trois modules `6.13.0-next`,27descripteurs,
trois aides chargées,43topics et deux migrations référencés. Son état partiel
conserve `bmad-retrospective` déclarée mais absente, sans réparer l’installation.
Les17entrées sont présentes sans feuille. Une commande `$<nom-dossier>` exacte
reste descriptive ; aucune invocation générale ou recommandation native n’est
qualifiée. Les contrats pour Sally2.17/tracer2.2 sont dans [profil-g2.md](profil-g2.md).

## Runtime et imports fermés

Le runtime réel CPython3.12.14 est lu hors projet. Son pin produit
`0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92`
provient de `src/adapters/bmad/runtime.ts` et désigne734fichiers dans son propre
périmètre, pas tous les formats importables. La voie courante copie seulement
ces734records vérifiés dans `fixtures-runtime-owned/python`, vérifie leurs
hashes puis l’ensemble exact des fichiers/dossiers AVANT le premier UV.
`Lib/site-packages` vide est le seul dossier additionnel admis. Le même contrôle
`runtime_guard.closed_manifest` précède chaque worker et probe.

Tout cache `.pyc`/`__pycache__`, `.pyw`, paquet additionnel, hook dans Lib/DLLs,
`.pth` ordinaire à la base ou ailleurs et `python*._pth` est refusé. `pyvenv.cfg`
est refusé à la base ET au parent. M15 éprouve14variantes en données, dans les
gardes native/Python, ainsi que des sources/DLL admises modifiées. Les caches
réels ctypes/importlib ne sont ni exécutés ni modifiés. Seule la copie exacte
sert au probe UV positif. UV est lui-même SHA256
`2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162`.

UV utilise `run --offline --no-project --no-config --no-cache` et le Python
explicite. Le programme du banc utilise `-I -S -B`. L’inspection interne UV
emploie `-I -B`, sans `-S`, selon le [code amont UV0.13.0 déjà obtenu](https://raw.githubusercontent.com/astral-sh/uv/0.13.0/crates/uv-python-interpreter/src/interpreter.rs),
query1172–1191 : preuve statique historique, aucun nouveau réseau. Sa phase
site ne trouve aucun hook dans la copie fermée. `Lib/importlib/_bootstrap_external.py`
1075–1135 explique pourquoi `-B` seul n’interdit pas la lecture des caches ;
`Lib/site.py`367–405 et523–551 donnent les sites Windows et les deux venv.
Ces sources primaires locales sont épinglées, le runtime réel reste intact.

Douze fichiers exécutables du banc sont épinglés : sept Python et cinq
PowerShell, dont le C# embarqué dans supervision.ps1. Avant tout helper et UV,
le lanceur vérifie leurs octets puis en garde les copies dans le run. Le texte
bootstrap `-c` capture uniquement les sept sources admises, vérifie noms,
canonicité/NTFS/tailles/stabilité/hashes, puis compile en mémoire via son
MetaPathFinder. HERE ne participe jamais à la recherche d’imports. Entrée et
workers utilisent exactement cette même voie ; `bench_execution` lie les hashes,
modules compilés et véritable texte `-c`. M15 éprouve huit formats ambiants,
dont cinq caches timestamp valides : données ignorées ; source admise changée
refusée avant import. Aucun payload de fixture n’est exécuté.

Environnement enfant filtré SYSTEMROOT/WINDIR/PATH, temp/cache possédés ; aucun
PYTHON*, VIRTUAL_ENV ni configuration personnelle n’est transmis. Aucun compte,
AppData/coffre, OAuth, fournisseur, modèle ou paquet personnel n’est requis.

## Frontières et reçus

Les lecteurs de données projet gardent UTF-8 strict,1Mio/fichier,16Mio/corpus,
1024entrées/profondeur12 ; seuls les fichiers d’initiative exploités sont lus.
M10 prouve hardlinks/jonctions/remplacement d’ancêtre Windows, avec garde du
handle AVANT lecture. M11 refuse17fichiers d’initiative de1Mio. Les racines
sont autorisées explicitement ; priorité par nom de dossier, masque local sans
record conservé ; aucune sortie externe autorisée par BMad n’élargit Madness.

`context-v2` capture les trois couches centrales, les parse par
`tomllib.load(BytesIO(raw))` exactement comme le lecteur binaire géré, puis
les fusionne avec `config_utils.merge_layers`. M7 compare natif/profil :
LF/CRLF valides ; BOM et CR isolé refusés, octets/hashes exacts. Le vérificateur
recalcule la résolution selon cette même sémantique. `fresh_context` recapture
ET résout ; M8/M12 prouvent les mutations alpha/beta et d’initiative à skills
inchangées. Une ancienne résolution divergente est refusée, jamais rhabillée
de nouvelles empreintes. Configurations et initiatives ont leur reçu propre.

Seuls les lecteurs tickets/frontmatter utilisent `parse_text` utf8-sig/newlines
universelles, comme leurs outils natifs. M13 conserve LF/CRLF/BOM, contenus/hashes
et champs indépendants de l’entrée, feuille, plan et tracker avant jointure.
Appartenance réciproque et prévalidation roster empêchent les faux descripteurs
ou le repli silencieux d’identité. Fichier/built n’est pas acceptation humaine.

`evidence.snapshot` est l’unique collecte de reçu avant TOUTE branche de
`verify.main`, y compris schema1/2/3, non scellé, interrompu ou partiel :26noms
immédiats fermés,1Mio/artifact,4Mio/log,64entrées maximum,16Mio cumulés. Tous
les fichiers/ancêtres et leurs types/liens/reparse/hardlinks/tailles sont
précontrôlés avant le contenu ; garde Windows du handle et relecture stable.
Une clé bench/manifest ne devient jamais chemin : absolu, ../, sous-dossier et
ADS refusés. Tous les hashes du reçu viennent de la capture. Les chemins de
nettoyage sont comparés à la possession attendue avant observation.

M15 appelle le vrai `verify.main` sur copies possédées avec32clés malveillantes
bench/manifest schema1/2/3/4, vrais fichiers témoins extérieurs (y compris la
cible ../), hardlink, jonction, preuve individuelle excessive et20Mio cumulés.
Un hook d’audit constate l’absence de tentative d’ouverture du témoin extérieur.
Les anciens répertoires sains/incomplets sont relus sans exécuter leur code.
Une sonde ponctuelle de lien symbolique fichier a été refusée par Windows :
« Administrator privilege required for this operation. » Aucun lien n’a été
créé ; cette variante native n’est pas prouvée par les jonctions/hardlinks.
Aucun nouveau privilège, skip vert ou modification système n’est introduit.

## Création et supervision Windows

Avant tout reçu ou runtime, run.ps1 contrôle runs/ ET logs/ et leurs ancêtres.
Les frontières de création revérifient leurs destinations possédées. M15 lance
une COPIE du banc avec jonction préexistante vers une cible témoin : refus avant
reçu/runtime/cache/UV, aucun octet extérieur changé. Vrais runs/logs intacts.

Les déclarations P/Invoke de la supervision extérieure sont compilées en mémoire depuis le
fichier épinglé supervision.ps1 : CreateJobObject, SetInformationJobObject avec
KILL_ON_JOB_CLOSE, CreateProcessW suspendu, AssignProcessToJobObject puis
ResumeThread. Aucune instruction enfant ne précède l’affectation au job.
La possession des descendants survit à la sortie du processus racine ; le job
est terminé indépendamment du parent. Nombre actif observé à0 avant nettoyage.

Le délai ordinaire est600s ; chaque appel géré60s ; chaque flux4Mio. Arrêt du
job contrôlé sous5s, observation finale du retour sous1s, vidange des deux pipes
avec budget partagé3s. Le test d’interruption a un handshake séparé30s maximum
pour son marqueur, puis4s d’exécution. Ces budgets sont expérimentaux, hors
produit et sans mesure par US ; aucun retry. Les échecs de stop/drain/capture/
cleanup restent explicites, jamais une matrice réussie.

M15 et le lanceur utilisent la même fonction : timeout après fixture constatée,
lancement impossible, overflow, reprise exit0, garde hors possession, et vrai
parent qui sort0 pendant qu’un enfant garde les pipes. L’enfant est observé,
le job reste actif après mort du parent, puis tous ses processus sont arrêtés,
la disparition identifiée, les logs et le retour fini contrôlés. L’état
`descendants-stopped` conserve le retour parent0 sans annoncer completed.

Le parent possède run/fixtures avant lancement ; son finally retire ses seules
racines runtime/cache/fixtures sans attendre les callbacks unittest. Le teardown
ne suit jamais les jonctions et ne retire aucun processus/dossier personnel.
Interruption sans results.json reste un reçu terminal incomplet lisible et non
scellable/promouvable. Ces gardes ne promettent pas de sandbox contre un
adversaire OS arbitraire capable de changer les octets après préflight.

## Reproduction et historique

Depuis la racine PowerShell7, exécuter run.ps1 dans ce dossier :
`-Action run`, puis `-Action seal -RunId <id>`, `-Action verify -RunId <id>`,
puis `-Action promote -RunId <id>`. Quatre opérations distinctes. Chaque run et
sceau est create-only ; la promotion a son reçu propre et ne remplace que le
pointeur selected-run. `verify` ne réécrit ni code, pin, reçu ni sceau. Les flux
natifs sont réellement capturés sous run/ ou logs/ et aussi émis par Write-Output.
NEW_RUN/LAUNCH_RECEIPT nomment leurs emplacements. Aucun journal ancien absent
n’est fabriqué rétroactivement.

Ciblés : `probe` = M7/M15 ; `receipt-proof` = seuls lecteurs/destinations de M15 ;
`windows-proof` = M13 ; `inner-proof` = seuls nouveaux cas de supervision interne et sélection ; `interrupt-proof` = vrai lanceur interrompu, sortie1
attendue sans qualification. Un ciblé n’est jamais une matrice complète.

Les18runs/304fichiers et quatre archives iteration-0/1/2/3 antérieurs restent
identiques selon reproduction-v4-before.json. Les anciens schema1/2/3, et tout
schema4 à bench différent, sont historiques. Les runs517… (15/15,230assertions)
et0157… (15/15,270assertions) conservent leurs preuves, sans qualifier les nouveaux
cas. Un nouveau scellement/promotion exige schema5 et les octets courants.
Les refus et échecs d’instrumentation restent conservés ; aucun nouveau run ne
rafraîchit une ancienne preuve.

Le premier ciblé v4 run86313588… a passé M7 mais échoué à l’import de verify.py
(indentation d’une insertion du banc) ;558inputs identiques, ressources retirées.
Correction faite dans le code courant, sans retoucher son snapshot. Le ciblé
runb00af160… lecteurs/destinations a ensuite passé1/1 en25,929s, sans skip,
avec558inputs identiques. La matrice finale ajoute encore l’audit de tentative
d’ouverture et un vrai témoin ../, ainsi que la borne cumulée des reçus.
La première matrice v4 [eb0c1970…](runs/run-eb0c1970fc6e43ed82402fec1227fcc9/results.json)
passe15/15sans skip,410assertions/26observations,23appels gérés réussis et28appels
bornés observés,411,375s ; max11,781s et171635octets stdout.558inputs identiques,
15cas et trois racines parent retirés. Le parent0/enfant vivant retourne en2,992s,
vidange101ms, job actif3→0 et enfant identifié absent. Scellement102/102 et
lecture seule101/101 ;25artifacts, manifeste
`da1d063be57480aa471308eb2075d0cf3ba2d0fcb848d856fc2a69f3f08603be`.
Le schema3 historique0157… est relu83/83, current_qualification=false.
[Preuve worker initiale](worker-verification-v4-initial.json), [conservation304fichiers/4archives](worker-conservation-v4.json).
Les vrais journaux sont
[scellement](logs/seal-b403d5de9b32448c8f76b2235106bf1a/launcher.stdout.log),
[lecture courante](logs/verify-40c13e2783284250842f3dcf3e7c79a2/launcher.stdout.log),
[lecture historique](logs/verify-d8b0d4acff9840e6b9736b1fc8f8ebc5/launcher.stdout.log).
Les revues fraîches et le verdict Build restent au parent ; G2 intégré,2.17 et2.2
ne sont ni lancés ni clos.
Complément de frontière avant clôture : `--run` évitait la lecture du pointeur
avant promotion. Le vrai `verify.main` contrôle désormais selected-run.json par
inspect_chain en préflight --promote, avant création du reçu, puis au point
write_text. Le ciblé6ea79360… passe1/1 en23,190s : hardlink extérieur refusé,
témoin exact et aucun reçu de promotion créé ;558inputs et nettoyage verts.
Le nouveau full est requis par ces nouveaux octets. Le premier full eb0c et
sa promotion restent immuables :52empreintes identiques avec le schema3historique
selon [worker-readonly-v4.json](worker-readonly-v4.json). Son résumé initial est
[worker-verification-v4-initial.json](worker-verification-v4-initial.json).
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


Références Win32 primaires vérifiées par le parent pendant la reprise5,
consultation documentaire distincte du banc offline :
[terminaison et handle signalé](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process),
[liste complète des PIDs du job](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_process_id_list),
[appartenance d’un handle au job](https://learn.microsoft.com/en-us/windows/win32/api/jobapi/nf-jobapi-isprocessinjob).
La voie interne déclare ces API par ctypes dans le source admis runtime_guard.py ;
une liste dépassant128PIDs ou une observation incohérente est refusée, jamais
tronquée pour décider du succès. Le job est arrêté même après cette erreur.
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
