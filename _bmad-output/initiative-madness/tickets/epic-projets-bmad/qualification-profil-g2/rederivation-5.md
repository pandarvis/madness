# Reprise 5 — supervision de chaque appel et référence sélectionnée

30 octobre 2026. Les deux relecteurs frais ont rendu trois constats medium,
vérifiés avant groupement. QV4-1 et BV4-1 ont la même cause bad_plan : la
supervision extérieure est fermée, mais bounded_process garde une autre voie
Popen/wait/thread/close. QV4-2 est un patch repris : empreinte du manifeste de
la sélection ignorée par verify par défaut. Aucun intent_gap ni différé.

Archive intégrale iteration-4.zip :
c49353444f09360fedb92801c8a8e4464da8bd43bf90fe0374624eef844146d9,
avec le plan avant amendement. Les25runs et456fichiers restent en place,
carte reproduction-v5-before.json ; cinq archives désormais à conserver.
Ne pas modifier/exécuter les anciens codes. Le parent retire seulement les
12sources actives pour re-dérivation. Le run1682 passe15/15,415assertions,
27observations,103/102/103, mais ne prouve pas les nouveaux cas.

## Garanties à fermer

1. CHAQUE appel de bounded_process, y compris run_tool, runtime_probe et
source-inspection, possède ses descendants avant leur exécution et ne dépend
pas de la survie du PID UV. Le délai60s porte sur le cycle utile de l'appel,
avec overhead fini et explicite de stop/vidange, pas seulement proc.wait.
Aucune stdin.write, lecture de pipe, join, fermeture BufferedReader ou attente
ne doit rester bloquée jusqu'à la coupure globale600s. Le Job Object extérieur
reste une dernière sûreté, pas la preuve de la borne individuelle.

Choisir UNE voie native Windows maîtrisée sans dépendance produit : réemploi
cohérent du superviseur ou implémentation native minimale dans un module du
banc admis/capturé, par exemple. Les sources réellement exécutées restent
épinglées avant bootstrap et dans les workers ; si un helper est ajouté,
l'ajouter explicitement aux ensembles fermés et au format courant. Aucun code
fourni par le projet/fixture analysé n'est exécuté : les probes sont du code
contrôlé et verrouillé du banc, les variantes non fiables restent données.
Environnement filtré, limites de sortie et codes/refus typés conservés.

Éprouver le VRAI bounded_process avec un budget court de test : parent qui
sort pendant qu'un enfant conserve les pipes, timeout avec enfant vivant,
flux excessif, entrée non consommée si applicable au mécanisme choisi,
puis nouvel appel réussi. Confirmer les marqueurs/processus réels avant arrêt,
retour fini, disparition des seuls descendants possédés et reçus/logs exacts.
Ne pas faire passer le probe de Invoke-G2Supervised pour cette autre voie.
Pas de rejet d'un PID personnel, taskkill par PID racine disparu ni close
bloquant derrière un collecteur. Un échec de stop/drain reste explicite et
ne devient jamais un appel réussi. Les budgets techniques restent mesurés,
aucune limite de tokens/US ni retry.

2. Par défaut (sans --run), verify doit lire le pointeur sûr COMPLET,
valider son identité de run et son manifest_sha256, puis comparer cette
empreinte aux octets du manifeste capturé AVANT déclarer un résultat courant.
Une simple re-mise en forme JSON du manifeste, hashes internes inchangés,
casse la référence de promotion et doit être refusée par ce vrai lecteur.
Le mode --run explicite reste distinct : il vérifie le reçu désigné, sans
prétendre que le pointeur le sélectionne. Conserver les gardes anti-liens du
pointeur en promotion et le create-only des reçus. Éprouver le vrai main par
défaut sur copie possédée et faire aussi une lecture réelle par défaut du
candidat final après promotion ; jamais muter le manifeste d'un ancien run.

## KEEP

Toute la matrice M1–M15, 734fichiers du runtime fermé avant UV,14variantes,
imports source capturés sans HERE/cache (entrée et workers), mêmes octets de
résolution context-v2, refus roster, bornes et révisions, champs et octets
indépendants TOML/feuille/plan/tracker, LF/CRLF/BOM tickets mais TOML central
binaire strict. Aides chargées/références et descriptif/copiable/lançable restent
distincts, diagnostic local partiel et exécution générale non qualifiée.

Garder snapshot unique des reçus avant toutes branches, noms/NTFS/handle/
tailles/cumul fermés,32clés refusées et vraies preuves extérieures ; gardes
runs/logs et pointeur avant écriture. Garder Job Object extérieur avant Resume,
stop5s/drain3s/retour1s finis, interruption sans results lisible, timeout/startfail/
overflow/reprise/orphelin réellement qualifiés, host PSHOME direct7.5.4/SHA966…
et le constat historique du shim. La variante native symlink fichier reste
non éprouvée faute de privilège : aucun nouveau privilège/skip vert demandé.

Conserver les456hashes/25runs et cinq archives. Les anciennes politiques restent
historiques, jamais promues comme courantes ; nouveau sceau create-only,
lecture seule et promotion distinctes. Nouveau format explicite si nécessaire ;
indiquer au parent les noms et champs exacts pour son lecteur indépendant.
Ne pas refaire un second full passant sans nouvelle correction.

## Ownership et exécution

Worker propriétaire des nouvelles sources actives de qualification, de
profil-g2.md/sources.md, des nouvelles preuves et des notes/tâches du plan hors
bloc figé. Il n'est pas seul : respecter les changements du parent et s'y adapter.
Parent propriétaire des archives/revues/parent-* et readonly-verification*,
AGENTS/epic/continuité/commit. Aucun autre sous-agent d'implémentation requis.
Aucun src/tests produit/dépendance/managed/configuration personnelle/runtime
réel/AppData/compte/réseau/fournisseur/modèle à changer ou lancer. G2 intégré,
Sally2.17 et tracer2.2 ne sont pas lancés.

Tous les exec_command use_default bloquent même sur pwd ici. Lectures et tests
ciblés require_escalated/login:false/shellpwsh/workdirC:/Sources/madness sont
fonctionnels et auto-approuvés ; les NTFS nécessitent aussi cette voie. Aucun
JSON/token/clic Zscaler ni configuration IT à demander.
