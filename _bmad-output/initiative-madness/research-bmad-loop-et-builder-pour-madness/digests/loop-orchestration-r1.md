# Digest R1 — Orchestration de bmad-loop et surface pour une interface graphique

Date d’accès : **2026-10-27**. Périmètre exclusif : dépôt amont `bmad-code-org/bmad-loop`, commit **0535a77c82a09731026794e8cb7b6405c265812e**. Aucune installation, exécution, authentification nouvelle ni session modèle. Aucune capacité testée pendant cette recherche. Aucun fichier produit local n’a servi de preuve.

## Réponse utile à la décision

Loop fournit une orchestration de développement et une interface terminal déjà séparée du moteur. Les sources étayent un frontend qui observe et commande **des runs Loop** : arbre de tickets v7, phases de travail, vérifications, commits, décisions et reprises. Elles n’étayent pas un superviseur universel de sessions Codex déjà ouvertes indépendamment. La surface d’intégration examinée associe commandes CLI, lectures JSON et fichiers durables ; aucune API graphique publique de mutation n’est établie par ce corpus. Ces conclusions restent des constats documentaires et de lecture statique, sans qualification d’intégration.

## Sources et provenance

Toutes les sources ont pour **publisher : bmad-code-org / BMad Code**, **pub_date : inconnue**, **accessed : 2026-10-27**. Le SHA fixe la version examinée ; il ne remplace pas une date de publication.

| ID | Fichier ou ressource épinglée | Nature et usage |
|---|---|---|
| S1 | [Arbre Git récursif][S1] | Inventaire des chemins ; aucun comportement déduit de leur seul nom |
| S2 | [README.md][S2] | Annonce générale, limites de maturité, parcours et TUI |
| S3 | [docs/tickets-guide.md][S3] | Contrat documentaire du mode v7 |
| S4 | [docs/reference/cli.md][S4] | Commandes, options, schémas JSON |
| S5 | [docs/reference/run-state.md][S5] | Fichiers durables, statuts, arrêts et sessions |
| S6 | [src/bmad_loop/events.py][S6] | Code du relais de hooks et attribution |
| S7 | [src/bmad_loop/tui/data.py][S7] | Code d’observation de la TUI |
| S8 | [src/bmad_loop/tickets_engine.py][S8] | Code de dispatch, prompts et vérification v7 |

Budget tenu : **8 ressources amont / 8 appels de récupération GitHub**, une seule passe de collecte. Aucun recours à une source secondaire ni au web supplémentaire. Les références de lignes sont celles du texte retourné par `fetch_file` à ce commit.

## Constats traçables

### L1 — La boucle possède sélection, vérification et commit ; le modèle possède les sessions créatives

**Claim.** Le README décrit sélection → développement → vérification → revue conditionnelle → nouvelle vérification → commit. La revue est une session neuve, peut utiliser un autre CLI/modèle et possède une limite de cycles. Les commandes `[verify]` sont fournies par le projet ; l’existence de Loop ne garantit donc ni leur pertinence ni leur couverture. Le code v7 construit explicitement les prompts de développement/réparation et de revue du même ticket, puis appelle un vérificateur propre au plan lié.

**Source :** [README.md L31–38 et L71–90](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/README.md#L31-L90), [tickets_engine.py L1195–1275 et L1529–1578](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tickets_engine.py#L1195-L1275). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur le contrat et les appels lus, exécution non qualifiée ; **class :** annonce + documentation + code ; **capacité testée ici :** non.

### L2 — Le mode v7 consomme l’arbre Sofia par tickets.py, sans remplacer la planification

**Claim.** Le mode `[stories] source = "tickets"` est opt-in et expérimental. Il demande une initiative active et un store `repo` ; les stores tracker sont refusés. Il invoque le `tickets.py` installé dans le projet (`next`, `find`, `status`, `mark`) et lit son JSON, au lieu de parser lui-même l’arbre. Sofia reste responsable de créer, découper, raffiner, préparer et replanifier les tickets. Le guide annonce des tests contre BMAD-METHOD `61e01f82` (`6.13.0-next`) : c’est une déclaration amont, pas une compatibilité mesurée ici.

**Source :** [tickets-guide.md L3–34](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/tickets-guide.md#L3-L34). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur le contrat documenté ; **class :** capacité documentée + qualification amont déclarée ; **capacité testée ici :** non.

### L3 — La sélection respecte un ordre et des gates ; un ticket étranger actif reste étranger

**Claim.** Chaque choix relit `next` et `status`, dans l’ordre des epics puis des entrées. Les lignes backlog ne sont pas dispatchées. Les besoins de refinement, HITL, approbation de plan, clôture d’epic et incohérences de store peuvent suspendre la boucle. Les tickets `in-progress` ou `built` que ce run n’a pas commencés ne sont ni dispatchés ni marqués ; ils donnent `ticket-foreign-active`, puis éventuellement une pause `ticket-tree`. Ce comportement ne constitue pas l’adoption de leur session extérieure.

**Source :** [tickets-guide.md L71–110](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/tickets-guide.md#L71-L110), [tickets_engine.py L396–423 et L548–557](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tickets_engine.py#L396-L423). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur la limite explicitement documentée ; **class :** capacité + limite documentées, corroboration code partielle ; **capacité testée ici :** non.

### L4 — Build et done sont distincts, et les mutations du plan sont encadrées

**Claim.** Par défaut, Loop marque `done` via `tickets.py mark` après vérification/revue ; `mark_done = "never"` conserve `built` pour décision humaine. Les écritures de Loop sont verrouillées, relues, soumises aux transitions permises et ne surviennent pas pendant la session vivante du ticket. Le guide affirme que Loop n’écrit ni `dropped`, ni les fichiers d’epic/initiative. Les checkpoints de plan et de fin sont pris en charge ; la clôture d’epic appartient encore à Sofia.

**Source :** [tickets-guide.md L112–140](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/tickets-guide.md#L112-L140). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur le contrat documenté ; **class :** capacité documentée ; **capacité testée ici :** non.

### L5 — Le suivi JSON est explicite, mais le pilotage n’est pas uniformément JSON

**Claim.** `validate`, `plugins`, `probe-adapter`, `decisions`, `confirm`, `list`, `status`, `diagnose`, `cleanup` et `clean` acceptent `--json`. Stdout contient un objet unique, avec `schema_version` propre à la commande ; changements additifs possibles sans hausse, rupture de sens/type/nom avec hausse annoncée. Une erreur peut laisser stdout vide et écrire sur stderr. Un verdict non nul peut néanmoins fournir un JSON complet. `run`, `resume`, `resolve`, `attach` et `stop` ne figurent pas dans cette liste JSON. Les commandes de maintenance `cleanup`/`clean` peuvent également rendre leurs mutations en JSON : `--json` n’est donc pas une garantie générale de lecture seule.

**Source :** [cli.md L5–9 et L435–468](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L435-L468), [maintenance clean L402–421](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L402-L421). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur le contrat documenté, non exercé ; **class :** interface documentée ; **capacité testée ici :** non.

### L6 — status JSON expose le run et ses tâches, pas le statut vivant complet de l’arbre

**Claim.** `list --json` donne identifiant, type, début, statut et étape de pause. `status --json`, bâti à partir de `state.json`, fournit phases, tentatives, cycles de revue, tokens bruts/pondérés, adaptateurs/modèles, SHA de commit, motifs de report, contexte de pause, initiative et liaison ticket. Le statut vivant du plan est explicitement absent de ce document ; le tableau texte le relit par `tickets.py status`. Le statut JSON distingue moins finement la vivacité que `list`/la TUI : ne pas assimiler son `in-progress` à une preuve de processus vivant.

**Source :** [cli.md L295–306 et L522–558](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L522-L558), [run-state.md L155–165](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md#L155-L165). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée ; **class :** interface documentée + implication d’intégration ; **capacité testée ici :** non.

### L7 — Événements et état durable sont des fichiers, observés par polling

**Claim.** Le run conserve `state.json` atomique, `journal.jsonl` append-only (`ts`, `kind`, puis liens vers logs), identité de processus, logs par tâche, heartbeat et alertes `ATTENTION`. Le canal des hooks est séparé sous un state root par utilisateur/projet. La TUI utilise une couche de lecture de fichiers, cache les parses par signature de fichier et recontrôle la vivacité du processus. Son `RunWatcher` peut rendre le dernier état valide avec un indicateur d’obsolescence après erreur persistante ; une intégration doit préserver cette distinction entre état connu et actuel.

**Source :** [run-state.md L15–36 et L52–90](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md#L52-L90), [tui/data.py L1–17 et L108–196](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tui/data.py#L108-L196). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur les lectures de code ; **class :** capacité documentée + code ; **capacité testée ici :** non.

### L8 — Une TUI fermée peut laisser vivre un run ; une session Codex indépendante n’est pas automatiquement suivie

**Claim.** Le README affirme que les runs Loop lancés depuis un shell apparaissent pareillement dans la TUI, et que ses lancements détachés survivent à sa fermeture. En revanche, le relais de hooks ne fait rien sans `BMAD_LOOP_RUN_DIR` et `BMAD_LOOP_TASK_ID`. Les événements normalisés comportent task, session, transcript, cwd et lineage, mais seulement dans ce contexte de lancement. Le corpus établit donc le suivi d’un run Loop extérieur à la fenêtre UI ; il n’établit pas la découverte/adoption d’une conversation Codex ou d’un agent arbitraire lancé auparavant.

**Source :** [README.md L109–115](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/README.md#L109-L115), [events.py L365–410 et L441–478](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/events.py#L441-L478). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée pour la garde du relais, moyenne pour l’absence d’autre voie hors corpus ; **class :** annonce + code + limite de preuve ; **capacité testée ici :** non.

### L9 — Arrêt dur et arrêt à la fin de l’item ont des effets différents

**Claim.** `stop` écrit une requête durable, signale le moteur puis force l’arrêt après dix secondes seulement si son identité correspond encore ; la session est interrompue. `stop --graceful` laisse l’item courant finir jusqu’au commit, puis arrête la boucle et supprime les auto-sweeps. Les deux états sont annoncés reprenables. Le mode dur refuse si l’identité ne peut être vérifiée. La référence ne propose pas de commande générique `pause` : les pauses sont des gates/contextes documentés, distincts d’un arrêt.

**Source :** [cli.md L341–356](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L341-L356), [run-state.md L167–183](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md#L167-L183). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur les deux modes, moyenne pour l’absence limitée à la référence ; **class :** interface documentée ; **capacité testée ici :** non.

### L10 — Reprendre un run ne signifie pas reprendre en place la conversation modèle

**Claim.** `resume` continue une exécution en pause/interrompue, relit config/policy et refuse un moteur encore vivant ou un run terminé. Une session multiplexeur laissée après interruption est détruite avant relancement. `resolve` sert à une escalade et propose réparation interactive, re-arm, restauration de patch, adoption de branche ou re-vérification selon le cas. La reprise est une reprise de l’état d’orchestration, pas une preuve de continuité d’une session modèle existante.

**Source :** [cli.md L198–240](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L198-L240), [run-state.md L133–153](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md#L133-L153). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée ; **class :** interface documentée + implication d’intégration ; **capacité testée ici :** non.

### L11 — Décision et confirmation sont deux parcours différents ; leurs JSON énumèrent

**Claim.** `decisions --json` liste les décisions deferred-work avec question, contexte, recommandation et options ; la commande interactive répond, ferme immédiatement ou conserve l’intention pour le sweep suivant. `confirm --json` liste les stories garées et leurs actions dues. `confirm <ref>` acquitte les actions externes puis marque/committe sans relancer le développement ; `--reverify` ajoute des sondes et commandes configurées. Ces JSON ne constituent pas un protocole de soumission arbitraire d’une décision : dans la syntaxe lue, `--json` implique une liste.

**Source :** [cli.md L242–278 et L514–520](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L242-L278). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée ; **class :** interface documentée + limite de mutation JSON ; **capacité testée ici :** non.

### L12 — Les bornes temporelles offrent une matière de mesure, pas un relevé de coût par US qualifié

**Claim.** La lecture JSON expose `started_at` par run et les tokens par tâche. Le journal est horodaté ; le code TUI apparie `session-start` et `session-end` par `task_id`, puis associe la session ouverte à story, rôle, adaptateur et modèle. Le heartbeat connaît des attentes de quota cumulées. Une durée murale de session paraît dérivable lorsque les deux événements existent et sont fiables ; ce calcul n’a pas été testé. Les schémas `list/status` lus ne documentent ni durée totale par ticket/run, ni prix monétaire. Agréger les sessions, retries, pauses et attentes exige une définition produit ; tokens pondérés et coût payé ne sont pas interchangeables.

**Source :** [cli.md L522–550](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md#L522-L550), [run-state.md L84–86 et L113–127](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md#L84-L127), [tui/data.py L731–761 et L879–979](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tui/data.py#L731-L761). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée sur les champs et appariements, moyenne sur la dérivabilité temporelle ; **class :** documentation + code + inférence bornée ; **capacité testée ici :** non.

### L13 — La maturité du contrat et Windows restent à qualifier

**Claim.** Le projet s’annonce en early open beta et avertit que flags, policy, état disque et contrats de skills peuvent casser avant 1.0. Le ticket-tree et le backend Windows natif psmux sont déclarés expérimentaux. La couche `tui/data.py` est une implémentation Python interne réutilisable en théorie, pas une API publique stable démontrée : son existence prouve une séparation technique, pas un engagement de compatibilité pour un frontend tiers.

**Source :** [README.md L28 et L44–50](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/README.md#L28-L50), [tui/data.py L1–17](https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tui/data.py#L1-L17). **publisher :** bmad-code-org ; **pub_date :** inconnue ; **accessed :** 2026-10-27 ; **confidence :** élevée pour les déclarations de maturité, moyenne pour l’évaluation d’API ; **class :** annonce + code + limite de preuve ; **capacité testée ici :** non.

## Inconnues, recherches infructueuses et pistes

- **API publique de frontend :** aucune API HTTP/WebSocket/SSE de commande du moteur ni SDK GUI versionné n’est établie par les huit ressources lues. Les logs SSE décrits concernent l’adaptateur OpenCode, pas une API générique de frontend. Le dépôt complet n’a pas été audité ; ce résultat n’est pas une preuve d’absence globale. Base : L5–L7, S5 L62–64.
- **Mutation JSON des décisions :** recherche dans les sections complètes de commandes et schémas CLI : lecture trouvée, soumission structurée non trouvée. La TUI peut offrir un parcours natif, mais son chemin d’écriture n’a pas été audité ; ne pas promettre qu’il est exposé au CLI. Base : L11.
- **Sessions déjà lancées indépendamment :** aucune adoption générale démontrée ; la garde du relais et `ticket-foreign-active` limitent au contraire cette interprétation. Ne pas confondre “run lancé au terminal” et “session Codex indépendante”. Base : L3, L8, L10.
- **Temps/coût :** rechercher ensuite, seulement si la décision le nécessite, les écritures exactes des événements de début/fin et leur comportement après crash/reprise ; définir temps mural, temps de session, attente et coût inconnu séparément. Aucun montant ni tarif déduit ici. Base : L12.
- **Contrats à qualifier dans un spike futur :** versionner l’adaptateur, contrôler les codes de sortie et JSON non vide, afficher l’état obsolète/inconnu, déléguer les mutations au moteur, et essayer sur tickets et Windows ciblés. Ce sont des pistes issues de L2–L13, pas des fonctionnalités déjà qualifiées.
- **Dates et tests :** aucune date de publication de fichier récupérée ; date de commit non recherchée pour préserver le budget. Les tests annoncés par l’amont n’ont pas été exécutés et aucun résultat local n’est revendiqué.

[S1]: https://api.github.com/repos/bmad-code-org/bmad-loop/git/trees/0535a77c82a09731026794e8cb7b6405c265812e?recursive=1
[S2]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/README.md
[S3]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/tickets-guide.md
[S4]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/cli.md
[S5]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/docs/reference/run-state.md
[S6]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/events.py
[S7]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tui/data.py
[S8]: https://github.com/bmad-code-org/bmad-loop/blob/0535a77c82a09731026794e8cb7b6405c265812e/src/bmad_loop/tickets_engine.py
