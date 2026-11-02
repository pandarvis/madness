# Reprise 4 — frontières des reçus et fin des descendants

30 octobre 2026. Deux revues fraîches ont rendu cinq constats, tous vérifiés
medium par le parent avant groupement. QV3-2 et BV3-2 partagent la même cause.
Deux groupes bad_plan (supervision après mort du parent ; lecteurs historiques)
entraînent cette reprise ; QV3-1 et BV3-1 sont des patch repris avec elle.
Aucun intent_gap ni nouveau besoin d'accord humain. Le plan porte le triage.

Archive complète iteration-3.zip :
0739604902b822923ba195ec69cc85c5d07075a95a81f1e5b1e978d37b3341ce.
Elle contient le plan avant amendement et les preuves du tour3. Les 18 runs et
leurs 304 fichiers restent aussi en place, hashes dans reproduction-v4-before.json.
Aucun ancien code n'est exécuté ou modifié. Le parent retire seulement les
12 sources actives pour re-dérivation, jamais les anciens reçus ni le verrou
produit. Le run0157 passe15/15 mais ne prouve pas les nouveaux contre-exemples.

## Correctifs à dériver et prouver

1. La possession doit couvrir les descendants même si le processus racine
UV disparaît en premier. WaitForExit du seul parent et Kill(true) conditionné
à HasExited ne suffisent pas ; aucune attente de pipe/collecteur ne peut être
infinie. Choisir une solution Windows native sans dépendance produit (par
exemple Job Object correctement établi avant exécution susceptible de créer
un descendant), arrêter les seuls processus possédés et borner également la
vidange. Éprouver réellement, dans M15 et la même supervision du lanceur, un
parent qui crée un enfant conservant les pipes puis sort : retour fini,
descendant arrêté, ressources retirées et reçu terminal exact. Garder timeout,
start-failed, overflow, reprise après arrêt et garde hors possession. Aucun
arrêt de processus personnel ni promesse contre un adversaire OS arbitraire.
Un simple commentaire de limite ne résout pas ce chemin de blocage.

2. Les reçus historiques, même non scellés/incomplets, ne sont jamais une
source de chemins exécutables ou de lectures libres. Avant TOUTE lecture ou
hash de leurs champs/artifacts, contrôler noms immédiats attendus, appartenance,
chaîne canonique, liens/reparse/hardlinks et limites de taille/nombre/cumul.
Aucune clé bench/manifest ne peut fournir un chemin absolu, ../, sous-dossier
ou ADS. Même politique dans toutes les branches : anciens schema1/2, schema3
historique, interrompu/échoué/partiel et courant ; pas seulement evidence.verify
atteint tard. Conserver les anciens fichiers inchangés. Éprouver des copies
possédées avec bench ../ et absolu, fichier/jonction/hardlink extérieur et
preuve trop grosse : refus AVANT lecture extérieure, aucune exécution et
aucune altération des témoins. Les cas sains historiques restent lisibles,
non qualifiés comme courants ; l'interruption peut rester sans results.json.

3. Destinations d'écriture : run.ps1 doit refuser une jonction préexistante de
runs/ ou logs/ AVANT créer son reçu/execution.json. Réutiliser les contrôles
natifs de chaîne et vérifier la possession canonique avant chaque frontière
de création exploitable. Éprouver sur COPIE possédée du banc, sans déplacer
les vrais runs/logs, avec cible extérieure témoin inchangée et sans UV lancé.
Garder les noms create-only et les logs réellement capturés.

4. context() doit parser les trois couches centrales capturées avec exactement
la sémantique binaire de config_utils.load_toml : tomllib.load(BytesIO(raw)) ou
équivalent sans suppression de BOM/normalisation des CR isolés. Corriger aussi
la vérification indépendante de résolution. M7 compare les refus natifs de
BOM et CR isolé, garde LF/CRLF valides et les mêmes octets/empreintes. Réserver
parse_text aux lecteurs tickets/frontmatter qui utilisent réellement utf8-sig
et universal newlines. Ne pas modifier les scripts gérés ; préserver M13.

## KEEP et vérification

Garder toute la matrice M1–M15, les primitives officielles pures, captures et
hashes, révisions de contexte, bornes canoniques/NTFS et garde du handle avant
lecture. Garder les imports source capturés sans HERE/cache pour entrée ET
workers, la copie runtime fermée734fichiers avant UV et ses14variantes, huit
formats du banc en données, provenance même dans les refus. Garder LF/CRLF/BOM
des tickets, non-exécution des scripts/hooks de projet, capacités indépendantes,
aides chargées/références, tickets sans feuille et descriptif distinct du lançable.

Budget du banc60s/appel,4Mio par flux et600s global hors overhead explicitement
borné de supervision ; aucune limite de plan en tokens, aucun retry. Les bornes
restent expérimentales, pas un choix UX/US. Conserver les 304 fichiers/18runs,
les quatre archives et les échecs précédents. Nouveau run neuf, scellement
create-only, lecture seule puis promotion séparée sur les octets courants.
Les anciens schema3 à bench différent deviennent historiques, sans réécriture.
Ne pas relancer deux fois une matrice finale passante sans nouvelle correction.

Le worker possède uniquement les sources actives de qualification, son profil,
sources.md, ses nouvelles preuves et les notes/tâches hors bloc figé du plan.
Il n'est pas seul : respecter les modifications du parent et s'y adapter.
Parent propriétaire des archives/revues/parent-* et readonly-verification*,
continuité, AGENTS/epic et commit. Réutiliser les12noms si possible pour limiter
les changements de vérificateur ; indiquer au parent toute évolution exacte
schema/artifacts. Aucun autre sous-agent d'implémentation nécessaire.

Aucun src/tests produit/dépendance/managed/configuration personnelle/runtime
réel/AppData/compte/réseau/fournisseur/modèle à modifier ou lancer. G2 intégré,
2.17 et2.2 ne sont pas lancés. Les exec_command use_default bloquent même pwd ;
les mêmes lectures et tests ciblés avec require_escalated, login:false, pwsh
et cwd explicite fonctionnent et ont été approuvés automatiquement. Les liens
Windows demandent aussi cette voie. Aucun token/JSON/clic Zscaler à demander.
