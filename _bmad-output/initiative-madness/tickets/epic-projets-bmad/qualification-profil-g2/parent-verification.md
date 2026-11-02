# Vérification parent — story 2.1

Clôture le 2 novembre 2026. Baseline `ebe2bb3c5279fcb95bd48e0a0da917bce04dddfb`.
Qualification isolée du profil BMad existant et de ses contrats de guidage.

## Candidat final après correction

`run-d499adb2942e40e8a84c370fb7208ef2`, schema5/captured-source-only-v5 : **15/15 scénarios,
470 assertions,29 observations,35 appels bornés, zéro échec/erreur/skip**.
Durée du reçu412,094s (unittest410,546s),23appels gérés réussis ;558inputs
identiques et15cas nettoyés, lanceur exit0. Les trois racines possédées sont
retirées. Matrice M1–M15 rapprochée des assertions réellement passées.

Manifeste `a85f00ec71e7973c3b9dba624b1338e47d6a9c3e0e9eaa18242421a3c89f326e` :25payloads et le manifeste,
26fichiers fermés. Les12sources exécutables admises et leur verrou sont
capturés ; les734fichiers du runtime sont vérifiés avant premier UV/worker.
Le profil exact6.13.0-next est partiel (bmad-retrospective absente) :3modules,
27descripteurs,3aides chargées,43topics et2migrations référencées. Pas de
réparation ni de lancement général implicitement qualifié. Les contrats du
[profil](profil-g2.md) sont prêts pour Sally2.17 puis le tracer2.2 ; G2 intégré
reste à vérifier en2.16.

## Frontières et supervision

Les octets capturés alimentent context-v2 et les preuves ; changement de source,
initiative ou sélection invalide l'ancien reçu. TOML central binaire comme le
chargeur natif ; normalisation limitée aux tickets concernés. Racines, handles,
lectures, nombre/profondeur et reçus sont bornés. Jonctions/hardlinks Windows
réels et remplacement d'ancêtre éprouvés ; destinations runs/logs/sélection
contrôlées avant écriture. Aucun code de fixture/projet n'est exécuté.

Chaque appel et le superviseur extérieur possèdent leur Job Object avant
ResumeThread. Budget utile du groupe60s, arrêt≤5s, drain≤3s, retour≤1s ;600s
extérieur de secours. PeekNamedPipe/ReadFile ne lisent que les octets disponibles,
sans thread ni fermeture bloquante de BufferedReader ; stdin provient d'un
fichier temporaire possédé. Les six probes internes couvrent orphelin tenant
les pipes, timeout, stdin non lue, débordement de sortie, lancement impossible
et nouvel appel ; arrêt par handle du job, appartenance vérifiée. Petits flux et
4Mio de X recomputés indépendamment. Ces bornes expérimentales du banc ne sont
ni des limites de tokens ni des durées métier produit/US.

Le vrai verify.main par défaut refuse un manifeste remis en forme dont les
octets ne correspondent plus au pointeur sélectionné ; --run explicite reste
distinct. La dernière lecture native par défaut passe106/106, selected=true.
L'usage Win32 est limité aux cas Windows observés ; références primaires :
[terminaison](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process),
[liste de processus du job](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_process_id_list),
[appartenance](https://learn.microsoft.com/en-us/windows/win32/api/jobapi/nf-jobapi-isprocessinjob).

## Revues et correctif

Revue fraîche [Quick](quick-review-round6.md) : `[]`.
Revue indépendante [frontières high](boundary-review-round6.md) : BV5-1,
medium/patch, corrigé puis recontrôlé résolu par le même relecteur.
Initialisation sous le try/finally existant, état observé transmis à l'appelant
et nettoyage possédé de secours conservé, sans nouvelle surface.
Les [deux ciblés](logs/entry-state-nested-green-d109e412bc454fc7b21cea4ea9fa0691/result.json)
passent avant/après démarrage avec Root imbriqué réel, startedfalse/true,
job0 et trois ressources retirées. Le parent a ensuite exécuté le full final
15/15 et les quatre actions natives. Aucun correctif différé ou constat ouvert.
Le candidat696… et ses journaux restent historiques du patch, non substitués
au candidat finald499… ; les anciens essais en échec sont conservés.

## Preuves et conservation

Actions réellement exécutées par le parent : scellement107/107, lecture
explicite106/106, promotion107/107, défaut106/106(selected=true), toutes exit0,
cleanup réussi. Sorties et états natifs : [parent-final-actions.json](parent-final-actions.json).
Sortie du full : [parent-final-full.log](parent-final-full.log).
Le [vérificateur indépendant](parent-verifier.mjs), exécuté par le parent,
passe sur **30runs,129sources,456anciens fichiers et cinq archives** :
[sortie reçue](parent-verification.json). **583/583empreintes avant/après**
identiques sont confrontées aux fichiers présents et aux quatre journaux natifs :
[carte](parent-final-readonly.json), [synthèse](readonly-verification.json).
Ces vérifications n'actualisent aucun ancien reçu.

Bloc figé SHA256 `04d5977b155af629da97dddb2fdfd6fcd85688948de133cc701c6d389037db18`.
Attributs Git conservant les octets du plan et des preuves, comparaison
raw/filtrée dans [parent-git-bytes.json](parent-git-bytes.json).
Le premier contrôle du diff indexé a signalé les CR des fins de ligne et une
ligne vide terminale de fixtures.py. Les attributs locaux acceptent ces deux
formes capturées, conservent les contrôles d'espaces réels et évitent de
réécrire les sources scellées ; le contrôle indexé est ensuite relancé.
La variante native symlink fichier n'est pas éprouvée faute de privilège ;
les vrais jonctions/hardlinks ne la remplacent pas, aucun skip vert ni nouveau
privilège n'est demandé. Ce constat limite la portée de la qualification.

## Reproduire et portée

Depuis la racine PowerShell7, `& '_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/run.ps1' -Action run`
produit un nouveau run, puis scellement/promotion explicites ; aucun ancien
reçu écrasé. `-Action verify` vérifie la sélection sans la rafraîchir.
`node '_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/parent-verifier.mjs'` contrôle les preuves en lecture seule.
Versions et recettes : [sources.md](sources.md).

Aucun changement produit, scripts gérés, cache réseau, SIWC ou application
installée. Aucun compte/AppData, fournisseur, réseau ou modèle requis par le
banc. Suite produit/build/installateur non relancés car leurs sources restent
inchangées. Sally2.17 et tracer2.2 ne sont pas commencés. Pas de sandbox
universelle contre un adversaire OS modifiant les octets après les préflights.
