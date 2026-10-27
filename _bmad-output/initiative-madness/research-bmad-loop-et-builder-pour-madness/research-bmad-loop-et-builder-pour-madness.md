---
title: Étude BMad Loop et Builder pour Madness
type: technical
topic: BMad Loop et Builder pour Madness
decision: Choisir le rôle éventuel de Loop et Builder dans Madness avant intégration
source: Recherche primaire GitHub et documentation amont
status: complete
preset: standard
validation: normal
created: 2026-10-27
updated: 2026-10-27
claims:
  unverified: 6
---

# Étude BMad Loop et Builder pour Madness

## Décision proposée

**Qualifier BMad Loop en priorité comme moteur optionnel du développement autonome de Madness.** Il offre déjà une boucle de sélection, build, vérification, revue et commit, avec état durable et mode BMad v7. Cette piste peut éviter de reconstruire cette orchestration. Elle ne remplace ni les parcours BMad de cadrage/UX/architecture ni les échanges interactifs déjà livrés. Le mode v7 et Windows natif restent expérimentaux. [1][2]

**Garder BMad Builder comme outil de création de modules**, utile si un pont spécifique Madness/BMad devient nécessaire. Le corpus inspecté décrit une fabrique de skills et de modules, sans établir un moteur applicatif prêt à intégrer. Sa compatibilité avec notre installation v7 n’est pas prouvée. [10][11]

Ces recommandations reposent sur la documentation et le code amont lus aux révisions figées ci-dessous. **Aucune intégration, installation, authentification, exécution d’agent ou qualification Windows n’a été réalisée pendant l’étude.** Tous les constats restent sans corroboration par un éditeur indépendant ; leur exactitude documentaire a été examinée, leur fonctionnement dans Madness reste à vérifier.

## Ce que Loop apporterait

| Besoin | Éléments trouvés | Limite utile à Madness |
| --- | --- | --- |
| Enchaîner des US | Mode ticket-tree qui appelle le `tickets.py` du projet ; sélection, développement, revue en contexte neuf, vérifications et commit. [2] | Sofia garde planification, raffinement, replan et clôture. Le mode demande un store `repo` et une initiative active. |
| Voir l’avancement | `list/status --json`, phases, tentatives, modèles/adaptateurs, commits, décisions et liens aux tickets ; journal JSONL horodaté et état atomique. [3][4] | L’état disque peut être ancien ; `status` seul ne prouve pas qu’un processus vit et ne contient pas le statut vivant complet du plan. |
| Reprendre | État durable, gates, arrêts durs ou en fin d’item, puis `resume`. [3][4] | Reprendre la boucle n’est pas reprendre la même conversation modèle ; il faut préserver les effets inconnus et expliquer les nouvelles sessions. |
| Observer un run lancé ailleurs | La TUI observe aussi un run Loop lancé depuis un shell. [1] | Le relais de hooks nécessite l’identité du run et de la tâche ; aucune adoption universelle d’une conversation Codex/VS Code indépendante n’est démontrée. [5] |
| Plusieurs moteurs | Profils de CLI, dont Codex, Claude et Copilot. [1][7] | Ce sont des CLI avec leurs propres préalables de connexion/confiance ; aucune réutilisation du compte intégré à Madness, voie Bedrock ou admissibilité de distribution n’est qualifiée ici. |

Loop peut marquer un plan `done` après ses contrôles. Le guide prévoit aussi `mark_done = "never"` pour conserver `built`. Pour un essai Madness, ce dernier réglage est le candidat à vérifier : les gates formels de notre tableau ne doivent pas être franchis par le seul succès d’une session. Cette recommandation est une déduction d’intégration, pas une configuration déjà appliquée. [2]

## Interfaces et contraintes à traiter avant branchement

**Un adaptateur de processus et de données paraît possible ; aucun SDK graphique public stable n’est établi par le corpus.** Les commandes JSON ont un `schema_version` propre et un contrat stdout/stderr. `run`, `resume`, `resolve` et `stop` ne figurent pas dans la liste documentée des commandes JSON. Les JSON de `decisions` et `confirm` servent à l’énumération ; ils ne prouvent pas un protocole général de réponse structurée. La TUI possède une couche Python interne lisant les fichiers, dont l’existence ne constitue pas une API publique. [3][4][9]

**Windows demande un essai spécifique.** Le backend natif `psmux` est expérimental, avec `psmux ≥3.4.0` et `pwsh ≥7.3` documentés. WSL est une autre voie, à condition d’utiliser le Python de la distribution Linux ; changer seulement de shell ne transforme pas un processus Windows en processus WSL. Aucun de ces prérequis n’a été installé ou contrôlé ici. [6]

**Le profil Codex exige une adaptation explicite.** Le README annonce un minimum ≥0.139, mais le guide et le profil convergent sur ≥0.156 et utilisent `--no-daemon`. Le profil contient aussi `--dangerously-bypass-approvals-and-sandbox` par défaut. Ce profil ne peut donc pas être présenté comme équivalent à nos échanges avec approbations ponctuelles : il faudrait choisir et qualifier un mode de confiance compatible, ou refuser cette intégration. La contradiction documentaire des minima est conservée ; aucun minimum compatible avec Madness n’est déduit. [1][7][8]

Une CLI déjà connectée ne démontre pas la disparition des blocages proxy. La documentation consultée ne prouve ni un transfert de notre connexion applicative ni un contournement de Zscaler ; le réseau et l’authentification devront être qualifiés dans le profil choisi. [7][8]

## Temps, usage et coût par US

Loop offre une matière utile : liaison session/tâche/story, parseurs de transcriptions Codex/Claude/Copilot et catégories de tokens. L’usage absent reste `None`, distinct de zéro. Le modèle agrège des sessions par story, mais certaines transcriptions ou certains sous-agents peuvent manquer ; une somme connue ne garantit donc pas une couverture complète. [12][13]

**Le total pondéré est un budget en tokens, pas une facture.** Son calcul lu est `input + output + cache_creation + round(cache_read × cache_read_weight)` ; il ne contient ni devise ni grille de prix par modèle. Aucun coût réellement payé, ni partage d’un abonnement par US, n’est établi par ces sources. L’écran Madness devra distinguer usage observé, éventuelle estimation explicitement sourcée et montant indisponible, selon le futur cadrage produit. Aucun calcul monétaire n’est choisi dans cette étude. [12][13]

Le journal expose des événements de début/fin horodatés reliés par tâche. Une durée de session semble calculable si ces bornes existent et sont cohérentes ; c’est une **inférence non testée**. Durée écoulée d’US, somme des sessions, attentes humaines, vérifications, pauses et reprises ne sont pas la même mesure. Ces règles restent à définir avant affichage. [4][13]

## Place de Builder

Au SHA étudié, `package.json` déclare Builder **2.2.2** ; cette version n’est pas celle de BMad Method. Les documents décrivent création de skills, assemblage de modules, enregistrement, configuration et validation structurelle. Un module peut avoir des dépendances externes ou une UI, mais cette possibilité ne fournit pas le pont, le protocole ou les garanties de Madness. [10][11][14]

Le digest relève deux ambiguïtés dans Module Builder : nom du setup et routage `--headless`. Il n’a pas trouvé de matrice de compatibilité v7 dans les huit fichiers étudiés. Il ne faut pas assimiler automatiquement ce dépôt au Toolsmith présent dans notre installation. La priorité reste donc Loop ; Builder ne serait ajouté que pour un besoin de module démontré. [14]

Les textes LICENSE des deux dépôts sont MIT avec réserves de marques ; leur lecture ne qualifie aucune condition fournisseur ni la distribution de Madness. La conservation des notices devra être traitée si du code est effectivement incorporé. [15][16]

## Conséquences pour Madness — propositions locales

Cette section confronte les résultats à nos choix ; elle ne sert pas de preuve des capacités amont. Le [contrat d’architecture adopté](../architecture-madness/architecture-madness.md), notamment AD-1 à AD-7, conserve le cœur, les connecteurs, les autorités distinctes et l’absence de rejeu. Le connecteur actuel lance `codex app-server` ; Loop pilote des sessions de CLI. L’adoption de Loop serait donc un nouveau profil d’exécution à qualifier, et non un simple remplacement transparent.

1. **Conserver l’interface et le cœur Madness.** Présenter Loop comme un mode explicite « Développement autonome » après planification ; les conversations guidées restent disponibles. Les faits de fichiers, l’activité observée et l’acceptation humaine restent distincts.
2. **Préférer un adaptateur isolé au réemploi direct de la TUI.** Lire les contrats versionnés de commandes/état, normaliser vers les contrats Madness et déléguer les mutations au propriétaire Loop. Ne pas laisser les deux orchestrateurs écrire le même tableau ou piloter la même tâche.
3. **Commencer par l’observation.** Sur un dépôt jetable préparé : configuration figée, préflight et dry-run, puis lecture du tableau/état ; ensuite seulement une US témoin réversible, avec moteur et dépenses explicitement bornés. Ne jamais démarrer ce premier essai sur le dépôt ou le profil personnel en cours.
4. **Faire qualifier arrêt, reprise et attentes dans ce même spike.** Vérifier identité des processus, effets incertains, fenêtres fermées, reprise sans double effet, conservation des preuves et soumission effective d’une décision depuis une UI. Les limites de l’adaptateur doivent être affichables.
5. **Réutiliser les mesures uniquement après cadrage.** Le suivi temps/coût est le besoin produit R32 de l’epic2 ; Loop serait une source candidate parmi d’autres. Q8/Q9 doivent fixer mesure, rattachement, couverture et coût inconnu avant les consommateurs. Aucun relevé de notre développement n’est recréé.

Cette étude **ne change pas les quatre epics, leurs dépendances, les plans built ou le périmètre de la 1.8**. Elle recommande à Sofia/Winston un spike de qualification avant toute adoption de Loop ou changement du contrat d’exécution. La refonte Sally/Impeccable demandée après l’implémentation de l’epic1 reste attendue ; le graphe reste dans l’epic4.

## Inconnues et critères de décision

| Question | Preuve à obtenir avant adoption |
| --- | --- |
| Compatibilité v7 exacte | `validate` et parcours ticket-tree sur le snapshot BMad réellement utilisé, avec détection des formats inconnus. |
| Viabilité Windows natif | Préflight puis US témoin, hooks, chemins/espaces, arrêt et reprise avec le backend et les versions choisis. |
| Contrôle graphique des mutations | Réponses aux décisions et checkpoints sans pilotage fragile du texte terminal ; contrat versionné et gestion des erreurs/courses. |
| Identité et autorisations | Voie de connexion explicite, refus de transfert implicite de credentials, modèle d’autonomie compatible avec les accords annoncés. |
| Suivi temps/coût | Événements fiables après crash/reprise, couverture des sous-agents, absence/doublons, définition du temps et provenance du montant éventuel. |
| Maintenance | Version épinglée et tests de compatibilité à chaque montée de Loop, Codex ou BMad. Le projet annonce des ruptures possibles avant 1.0. [1] |

Si ce spike réussit, Loop devient un candidat sérieux pour éviter une orchestration maison. Si les mutations UI, Windows ou la confiance ne sont pas compatibles, Madness peut conserver son mode interactif et observer les preuves de Loop sans le piloter. C’est une alternative proposée, pas une intégration réalisée.

## Sources

Toutes les sources sont primaires et proviennent du même éditeur. `pub_date` individuelle : inconnue sauf métadonnées Git. Accès : **27 octobre 2026**. Les trois digests conservent les extraits de conclusions, lignes et lacunes détaillés. Confiance documentaire moyenne dans cette synthèse, faute de corroboration indépendante ; aucune affirmation de test local.

| Réf. | Constat appuyé | Éditeur / source figée | Publication | Accès | Confiance |
| --- | --- | --- | --- | --- | --- |
| [1] | Périmètre, maturité, profils et limites annoncées | [bmad-code-org — Loop README](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/README.md) | inconnue | 2026-10-27 | moyenne |
| [2] | Mode ticket-tree, Sofia, built/done et gates | [bmad-code-org — tickets-guide](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/tickets-guide.md) | inconnue | 2026-10-27 | moyenne |
| [3] | Commandes et schémas JSON | [bmad-code-org — CLI](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md) | inconnue | 2026-10-27 | moyenne |
| [4] | État, journal, sessions, identité et reprise | [bmad-code-org — run-state](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md) | inconnue | 2026-10-27 | moyenne |
| [5] | Relais limité au contexte run/task | [bmad-code-org — events.py](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/events.py#L441-L478) | inconnue | 2026-10-27 | moyenne |
| [6] | Multiplexeurs Windows/WSL | [bmad-code-org — multiplexer-backends](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/multiplexer-backends.md) | inconnue | 2026-10-27 | moyenne |
| [7] | Connexion/confiance CLI et Codex récent | [bmad-code-org — setup-guide](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/setup-guide.md) | inconnue | 2026-10-27 | moyenne |
| [8] | Flags réels du profil Codex | [bmad-code-org — codex.toml](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/data/profiles/codex.toml) | inconnue | 2026-10-27 | moyenne |
| [9] | Couche de lecture interne de la TUI | [bmad-code-org — tui/data.py](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tui/data.py) | inconnue | 2026-10-27 | moyenne |
| [10] | Résultat et parcours Builder | [bmad-code-org — Builder Quick Start](https://github.com/bmad-code-org/bmad-builder/blob/d4a921c49db71ad09c2dc62b8e62266b1f26ca4f/docs/index.md) | inconnue | 2026-10-27 | moyenne |
| [11] | Modules, dépendances et UI | [bmad-code-org — what-are-modules](https://github.com/bmad-code-org/bmad-builder/blob/d4a921c49db71ad09c2dc62b8e62266b1f26ca4f/docs/explanation/what-are-modules.md) | inconnue | 2026-10-27 | moyenne |
| [12] | Parseurs et usage absent | [bmad-code-org — tokens.py](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tokens.py) | inconnue | 2026-10-27 | moyenne |
| [13] | Tokens pondérés et agrégation des sessions | [bmad-code-org — model.py](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/model.py) | inconnue | 2026-10-27 | moyenne |
| [14] | Version Builder et limites détaillées | [bmad-code-org — package.json](https://github.com/bmad-code-org/bmad-builder/blob/d4a921c49db71ad09c2dc62b8e62266b1f26ca4f/package.json), [Module Builder](https://github.com/bmad-code-org/bmad-builder/blob/d4a921c49db71ad09c2dc62b8e62266b1f26ca4f/skills/bmad-module-builder/SKILL.md), [inventaire complet](https://api.github.com/repos/bmad-code-org/bmad-builder/git/trees/d4a921c49db71ad09c2dc62b8e62266b1f26ca4f?recursive=1) | inconnue | 2026-10-27 | moyenne |
| [15] | Texte de licence Loop | [bmad-code-org — Loop LICENSE](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/LICENSE) | inconnue | 2026-10-27 | moyenne |
| [16] | Texte de licence Builder | [bmad-code-org — Builder LICENSE](https://github.com/bmad-code-org/bmad-builder/blob/d4a921c49db71ad09c2dc62b8e62266b1f26ca4f/LICENSE) | inconnue | 2026-10-27 | moyenne |

## Fraîcheur et recontrôle

Révisions observées : Loop `0535a77c82a09731026794e8cb7b6405c265812e`, commit du 26 octobre 2026 ; Builder `d4a921c49db71ad09c2dc62b8e62266b1f26ca4f`, commit du 25 septembre 2026. Ces dates Git ne datent pas individuellement les documents. Les conclusions sur un snapshot restent reproductibles ; toute version candidate devra être relue avant intégration.

Les dates de recontrôle sont calculées dans `staleness.json`, à partir des métadonnées Git comme borne explicite pour ce snapshot, sans leur donner le sens de publication des fichiers. Fenêtres du pack technique : versions/compatibilité : 1 mois ; maturité/écosystème : 6 mois ; architecture : 2 ans. L’échéance la plus proche est le **25 octobre 2026 pour Builder**, déjà dépassée : recontrôler ses formats avant adoption. Le snapshot Loop appelle un recontrôle au **26 novembre 2026**, ou dès le début du spike si celui-ci commence auparavant. Ces calculs conservateurs ne signifient pas qu’une nouvelle version existe ; les branches main ont été observées pendant l’étude. Refresh/Deepen permettent de reprendre les questions ouvertes.
