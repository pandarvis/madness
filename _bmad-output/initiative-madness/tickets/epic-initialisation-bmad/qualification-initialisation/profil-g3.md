# Profil local candidat d’initialisation — 3.1

Le profil qualifie une préparation privée et un transfert borné sur témoins Windows. Il ne livre aucun installateur produit et ne vaut pas passage G3/G4/G5. Les preuves principales sont dans `proofs/run-2026-11-05T13-30-02-191Z-69b533a0/` ; `result.json` contient le résultat et les fermetures, `cases.json` les onze observations ciblées. Les chemins privés présents dans ces reçus sont historiques et ont été supprimés après les contrôles.

## Sources et outils réellement employés

La source canonique est `.agents/skills` du worktree `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness`. Les fichiers exacts, tailles et SHA-256 figurent dans `source-manifest.json` ; leur empreinte agrégée relue vaut `88428c3839e16be3c84ac763ce87eb30ef8c94ff8b31853e396668232a1b4981`. Les liens et fichiers à plusieurs liens physiques sont refusés avant copie. Aucun `_bmad/custom`, configuration utilisateur, rendu, cache ni projet réel n’est copié : seulement les dossiers des compétences et records explicitement retenus, avec leur contenu inventorié.

| Module | Version déclarée | Dossiers de compétences présents | Métadonnées | Membre absent |
|---|---|---:|---:|---|
| core-tools | 6.13.0-next | 8 | bmod-core-tools | aucun |
| method | 6.13.0-next | 17 | bmod-method | bmad-retrospective |
| toolsmith | 6.13.0-next | 2 | bmod-toolsmith | aucun |

Les trente dossiers transférés représentent 27 compétences présentes et trois records non invocables. Le manifeste fournit leurs noms. Leur présence ne démontre pas l’exécution de leurs workflows. Les trois records déclarent `github:bmad-code-org/BMAD-METHOD/skills` ; aucun commit amont exact n’est établi. Il s’agit d’un bundle local épinglé par octets, pas d’une release officielle reconstituée ni d’une compatibilité générale v7.

Skills 1.7.4 est invoqué directement par Node v24.13.0, sans npx ni installation de paquet : `node --import <guard-node file: URL> <cache>/node_modules/skills/dist/cli.mjs add <source privée> --agent codex --copy --yes --skill <30 noms explicites>`. L’entrée CLI a pour SHA-256 `b7d92e2a619e8982d38390572750efb8c2ec81cdf23c33aed2fa426d080a1e4e`. Le lock npm voisin conserve le tarball et son integrity. La fermeture des dépendances de ce seul cache contient 578 fichiers scellés et relus ; les 85 fichiers effectivement chargés sont tracés dans `skills-imports.jsonl`. Aucun cache npm complet n’est copié. Le premier `tool-manifest.json` conserve les octets initiaux ; son champ `files[].path` est relatif par erreur de rapport, et les chemins exacts des imports sont dans le journal. La conservation finale vérifie la map absolue scellée avant exécution, pas ces chemins relatifs. Le code actuel corrige ce champ. `tool-manifest-sealed-readback.json` reconstruit les chemins absolus par comparaison ordonnée exacte avec le manifeste initial et les bornes de paquets du lock, puis relie les 85 imports à ces mêmes octets.

Le Python de setup est celui admis par `bmadRuntime()` existant : arbre complet, CA rejetée et uv vérifiés sans modifier les gardes produit. Exécutable/hash dans `tool-manifest.json`, version exacte dans `python-version.json`, environnement enfant dans `environment.json`. uv n’a pas été exécuté. Setup SHA-256 `1de76dce0b4ba702da927d6dc83fd620ec0774aa1c1ab0cc5739167c135f64f8`, identique dans le skill source et `_bmad/scripts/setup.py` du dépôt. L’invocation effective réussie est `python.exe -X utf8 -B -I -S guard-setup.py <garde privé> <setup copié> --project-root <staging court> --skill <staging court>/.agents/skills/bmad --root <staging court>/.agents/skills`. Les argv complets sont dans `commands.json`. Aucun mode status/source-record/update ni migration/suppression n’est appelé ; aucune réponse de module n’était requise, donc aucun fichier de réponses n’a été fourni.

## Préparation privée et effets observés

Skills s’exécute d’abord dans le staging possédé, depuis une copie épinglée de la source. Ses trente copies sont comparées aux octets source. Les exclusions du CLI (`metadata.json`, `.git`, `__pycache__`, `__pypackages__`) sont explicites dans `skills-copy-verification.json` ; les omissions réellement présentes y sont énumérées.

Skills produit `.agents/skills/*` et `skills-lock.json`. Le CLI possède aussi une voie d’écriture de verrou privé dans `XDG_STATE_HOME/skills/.skill-lock.json`, mais cette invocation locale n’en a pas produit. HOME/USERPROFILE, APPDATA, LOCALAPPDATA, XDG_STATE_HOME, XDG_CONFIG_HOME et TEMP/TMP sont définis uniquement dans les sous-processus pour confiner les voies de découverte/écriture identifiées dans le code. La télémétrie et l’audit distant sont désactivés par DISABLE_TELEMETRY/DO_NOT_TRACK ; le compile cache Node est désactivé. Aucun environnement du porteur n’est modifié. Les journaux comptent 1943 opérations de mutation observées pour Skills, dont plusieurs portent sur les mêmes fichiers.

Setup a échoué sur le staging profond Windows : un chemin de fichier existant n’était pas reconnu, puis la variante à préfixe étendu a reçu WinError 5 lors de la promotion. La cause exacte de ce second refus reste inconnue ; le petit témoin de renommage vide réussit et ne prouve pas la capacité à promouvoir l’arbre complet. Aucun réglage Windows n’a été changé. La voie retenue copie exactement la préparation déjà faite vers un staging court possédé dans le Temp canonique. Le premier essai court a été refusé par notre garde sur l’alias 8.3 de Temp ; la canonicalisation locale corrige ce garde. Skills n’a pas été rejoué.

Le setup normal réussit alors : trois modules créés, shared scripts/config/custom `.gitignore`, `_bmad-output`, aucune question ni exigence obligatoire manquante, aucun problème, `current=true`. La recommandation manquante `bmad-retrospective` reste visible ; sa suggestion npx n’a pas été exécutée. Les 49 mutations observées de setup comprennent la création de `_bmad.setup-<aléatoire>` puis sa promotion en `_bmad`. Les inventaires et journaux sont conservés avant/après ; aucun appel réseau/processus enfant supplémentaire n’est observé par les gardes.

Ces wrappers privés journalisent les API employées et refusent leurs mutations hors racines possédées ainsi que les voies réseau/processus qu’ils interceptent. Ce sont des gardes de qualification, sans sandbox OS ni garantie contre un outil arbitraire ou une course native. Les branches hostiles ne sont jamais confiées à l’outil pour prétendre qu’il les protège.

## Plan de transfert éprouvé

Le plan `transfer-plan.json` capture identité physique cible/parent, inventaire complet des sentinelles, chaque répertoire/fichier à ajouter, SHA-256 des fichiers et empreinte du payload. L’accord du banc est nommé `synthetic-fixture-only`, porte `humanAcceptance=false` et est lié au hash du plan. Il ne confère aucune autorité au produit ni accord humain. Le nom de projet matérialisé est celui de cette fixture, `positive` ; d’autres réponses/paramètres exigeraient une nouvelle matérialisation.

Seul `skills-lock.json` est exclu du staging transféré. Sa source `../../source-bundle` vise la copie privée qui sera supprimée : la transférer serait une référence périmée. Le reçu brut reste dans les preuves ; aucun lock officiel ni faux source-record portable n’est fabriqué. Le profil n’annonce donc aucune mise à jour/restauration Skills à partir de ce lock. La copie finale est aussi balayée pour les chemins privés/staging/source et ne contient aucune de ces références.

Après relecture des préconditions, le banc crée seulement les 126 répertoires et 462 fichiers du plan, avec écriture exclusive des fichiers nouveaux. README et code préexistants restent byte-identiques. Aucun outil n’est exécuté dans la cible. L’arbre final est exactement l’union de l’avant et du payload. Après exclusion du lock, `qualifyBmadProfile()` existant reconnaît les octets du pilote Mary, empreinte `0e54fd5502120a733ce7fdf1b63242ca85af1fa3e48a2d2fcb388b9067595173`. Cette admission ne lance ni résolveur ni modèle et ne qualifie pas les autres workflows ou le diagnostic G2 intégré.

L’application est séquentielle. Elle ne possède ni transaction globale, rollback garanti, ni arrêt sûr démontré pendant les effets. L’annulation éprouvée intervient avant toute application. Une précondition modifiée est refusée sans écriture du banc ; une erreur en plein transfert doit conserver ses effets observables et son résultat partiel/inconnu, sans reprise automatique. L’interruption au milieu d’un effet n’a pas été provoquée.

## Refus et portée utilisable par 3.2/3.3

Les onze observations de `cases.json` couvrent annulation intacte, précondition différente, collision `_bmad`, trois sorties hostiles (absolue, parent, placeholder+parent), source distante, source liée, cible réorientée par junction, parent réorienté et application exacte. Les sentinelles extérieures restent intactes. Le parent réorienté est refusé ici par ENOENT sur l’enfant absent : ce cas ne prouve pas toutes les variantes de réorientation. Les autres collisions `.agents`, `_bmad-output`, `skills-lock.json` sont refusées par le code conservateur mais n’ont pas chacune reçu un témoin supplémentaire.

Pour Sally3.2 : présenter la préparation privée, les modifications exactes dans le projet, les données conservées, l’accord lié au plan, l’annulation avant effet, la péremption du plan et les résultats partiel/inconnu. Séparer les erreurs de préparation de celles après effet. Ne pas annoncer « installer 30 commandes », installation complète de tous les membres ou rollback automatique.

Pour le contrat3.3 : ce candidat fournit une source locale scellée, une sélection précise, un staging court canonique, un plan de transfert portable sans lock local périmé et une vérification finale par arbre/octets. Il impose le refus des liens, collisions et préconditions changées. Une protection native contre la concurrence, l’arrêt après effet, les paramètres autres que la fixture et une politique de résultat partiel restent à concevoir/qualifier dans le produit. Sa dépendance2.16 et le gate humain3.10 restent inchangés. Aucun G3/G4/G5 final ni installation d’un vrai projet n’est déduit.

## Fermeture et erreurs du banc

Les cinq enfants du run principal ont tous émis close : Skills code0, deux refus setup profond code1, refus du garde court code1, setup court final code0. Aucun timeout n’a eu lieu. Une erreur de rapport de manifeste après le positif pointait vers un LICENSE relatif ; les effets déjà vérifiés ont été conservés, puis les seuls refus et lectures d’octets ont été repris avec la map absolue. Ni Skills, ni setup, ni application n’ont été rejoués dans cette finalisation.

Toutes les copies du run principal, y compris le Temp court, ont été inventoriées puis supprimées après fermeture. Le run préliminaire `run-2026-11-05T13-29-04-175Z-237d7d0b` avait échoué avant chargement de Skills sur `--import` Windows sans URL file: ; enfant code1 fermé, cible intacte puis copies supprimées (`closed-cleanup.json`). Les refus bruts restent dans les preuves. Aucun témoin incertain n’est conservé. Aucun fichier src/resources/contrat/IPC/persistance/produit, source BMad/npm-cache, profil personnel, paquet ou installateur n’a été modifié par ce lot.


Attribution des exécutables et wrappers : `execution-seals.json` conserve un sceau final distinct des manifests historiques. Le guard-node courant correspond au sceau précédant le Skills réussi ; le guard-setup courant correspond au sceau précédant setup-4 réussi. Les versions intermédiaires du wrapper lors des refus profonds/8.3 ne sont pas conservées par octets et n’ont aucun hash inventé. Le qualifier courant contient les réparations de rapport/finalisation et le scopefix externe signalé par le parent ; il a reçu syntaxe/inspection ciblées, sans nouvelle campagne native complète. Les preuves positives antérieures restent attribuées à leur exécution réelle.


### Traçabilité des reprises

Q1 corrigé prospectivement : chaque future commande conserve wrapper, configuration et manifeste uniques avant de lancer cette copie. Contrôle fictif court uniquement, sans rejeu de l’outillage réel. Les52preuves antérieures restent exactes ; les versions intermédiaires setup-resume/setup-short non conservées demeurent inconnues. Le positif final épinglé et le nouveau sceau de code sont distincts.
