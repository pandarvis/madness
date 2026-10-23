# madness — BMad avec Codex

Ce dépôt utilise **BMad v7 preview** avec Codex pour concevoir **Madness**, une interface de suivi et de pilotage de BMad sur des projets locaux. L'installation actuelle contient la méthode, les outils communs et Toolsmith : 27 compétences invocables et trois métadonnées de module. Le socle retenu est Electron, React et TypeScript, avec electron-vite et electron-builder ; les versions exactes restent à qualifier ensemble avant le premier build.

Le cadrage se trouve dans [le brief produit](./_bmad-output/initiative-madness/brief-madness/brief-madness.md), encore en brouillon, avec [les notes techniques](./_bmad-output/initiative-madness/brief-madness/addendum.md). Le contexte durable de conception est dans [PRODUCT.md](./PRODUCT.md).

La première base UX est acceptée : [DESIGN.md](./_bmad-output/initiative-madness/ux-madness/DESIGN.md) et [EXPERIENCE.md](./_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md) sont finalisés. Le [dossier UX](./_bmad-output/initiative-madness/ux-madness/ux-madness.md) rassemble prototype et rapport de cohérence. Le prototype est simulé ; aucun connecteur ni application intégrée n'a encore été développé. Les [exigences de l'initiative](./_bmad-output/initiative-madness/initiative-madness.md) ont été acceptées et commitées localement le 23 octobre 2026 (`5ba4077`).

Le [contrat d'architecture de Winston](./_bmad-output/initiative-madness/architecture-madness/architecture-madness.md) est finalisé et adopté, extension Graphify comprise (AD-1 à AD-10). Sofia a actualisé l'initiative à **31 exigences et 8 contraintes**, en préservant R1–R24 et les trois companions adoptés. Son [découpage en quatre epics](./_bmad-output/initiative-madness/.working/proposition-epics.md) est approuvé après les contrôles de cohérence et de dépendances : dialogue Codex réel, projets BMad, initialisation/parcours Windows, puis graphe. Les [quatre enveloppes](./_bmad-output/initiative-madness/tickets/tickets.toml) sont créées, avec leurs résultats, limites et références ; leur commit local est autorisé. La prochaine étape est de raffiner le premier epic avant d'en planifier les stories. Aucun développement n'est lancé. Les qualifications G0–G5 restent à réaliser. Sally doit compléter les contrats pour anglais/sombre et graphe avant les implémentations concernées.

Périmètre confirmé pour Madness V1 : **Windows, Codex et BMad v7 uniquement**. Ouvrir et suivre des projets existants, proposer une aide contextualisée et les alternatives à chaque étape, accéder à tout le catalogue BMad installé, lancer ses workflows et dialoguer dans l'interface. Aucun workflow particulier ne constitue le focus du produit. La prise en charge et la migration des versions antérieures sont hors périmètre.

La V1 inclut aussi l'initialisation guidée de BMad v7 dans les projets non équipés. **L'expérience utilisateur est la priorité absolue du produit**, notamment pour les développeurs qui découvrent BMad.

Le porteur inclut également une vue « Graphe du projet » fondée sur Graphify dans la V1, après la base Windows/Codex : code, modules, fichiers et dépendances d'abord. Cet outil sera optionnel à utiliser ; son intégration locale et sa qualification restent à réaliser. R28–R31 et le quatrième epic approuvé portent ce besoin ; Sally doit en définir le parcours avant implémentation.

La branche officielle `main` est présentée comme la v7 preview ; ses métadonnées internes indiquent encore `6.13.0-next`. Ce dépôt utilise cette branche, pas l'installateur npm stable v6. Les copies installées et leurs empreintes dans `skills-lock.json` permettent de conserver l'état actuel dans Git.

## Utiliser BMad dans nos échanges

Tu peux écrire naturellement, sans mémoriser de commandes. Dans Codex, les compétences locales seront disponibles au prochain tour ; si le catalogue ne s'actualise pas, ouvrir un nouveau chat dans ce même projet. Leurs fichiers restent lisibles directement dans le chat actuel.

| Besoin | Exemple à m'envoyer |
| --- | --- |
| Trouver le bon point de départ | « BMad, aide-moi à démarrer mon projet : [idée]. » |
| Explorer des idées | « Utilise bmad-brainstorming pour explorer [sujet]. » |
| Clarifier le produit | « Utilise bmad-product-brief pour cadrer [idée]. » |
| Écrire des exigences détaillées | « Utilise bmad-prd pour préciser les besoins de [produit]. » |
| Organiser le travail | « Avec Sofia, bmad-agent-po, définissons l'initiative puis découpons-la en epics et stories. » |
| Prendre des décisions techniques | « Utilise bmad-architecture pour définir les décisions communes de cette initiative. » |
| Développer une modification | « Utilise bmad-build pour réaliser [changement précis]. » |
| Examiner un changement | « Utilise bmad-code-review sur [diff ou branche]. » |
| Vérifier l'installation | « BMad status. » |

Les phrases ci-dessus sont des messages à l'assistant, pas des commandes PowerShell. Les rôles BMad sont des instructions et workflows que Codex suit ; les appeler ne crée pas automatiquement d'autres chats.

Pour un nouveau produit, on peut commencer par son problème, ses utilisateurs et le résultat souhaité, puis choisir le parcours adapté. Une petite modification peut aller directement à `bmad-build`. Le PRD, l'UX et l'architecture s'ajoutent lorsque le besoin le justifie.

## Fichiers

- `AGENTS.md` : consignes persistantes pour Codex, dont l'utilisation du français.
- `.agents/skills/` : compétences officielles copiées dans le projet.
- `skills-lock.json` : sources et empreintes enregistrées par Skills CLI.
- `_bmad/config.toml` : configuration créée par BMad ; nom du projet `madness`, sortie `_bmad-output`.
- `_bmad/custom/` : personnalisations ; les fichiers `*.user.toml` sont personnels et ignorés par Git.
- `_bmad-output/` : livrables, initiatives et tickets ; contient le cadrage de l'initiative Madness.
- `.venv/` : environnement Python local, ignoré par Git.

En v7, les compétences de planification utilisent les initiatives et leurs dossiers `tickets/`. Les anciens réglages `planning_artifacts`, `implementation_artifacts` et les anciennes clés centrales de langue ne sont plus lus : la préférence française est portée par `AGENTS.md`.

## Installation et vérification

Installation effectuée le 22 octobre 2026 avec la procédure officielle :

```powershell
npx --yes skills add bmad-code-org/BMAD-METHOD --skill '*' --agent codex --yes --copy
```

Puis le workflow `bmad setup` a créé les scripts et la configuration. Node.js 24, uv 0.13 et Python 3.12 ont été vérifiés sur cette machine. L'environnement `.venv` a été créé à partir du Python fourni avec Codex.

Le fichier `uv.toml` active le magasin de certificats système pour les téléchargements de dépendances. Ce réglage corrige l'erreur `invalid peer certificate: UnknownIssuer` rencontrée lors du chargement de Jinja2 par le moteur de compétences BMad. Les commandes d'activation habituelles restent utilisables depuis ce dépôt.

Pour recréer l'environnement sur une autre machine équipée de uv :

```powershell
uv venv --python 3.12 .venv
```

Pour vérifier l'installation depuis la racine :

```powershell
uv run --no-cache .agents/skills/bmad/scripts/setup.py --project-root . --skill .agents/skills/bmad --root .agents/skills --status
```

Le diagnostic officiel indique `current: true`, sans problème bloquant et sans question de configuration en attente. **Limitation connue :** Skills CLI a ignoré `bmad-retrospective`, dont le frontmatter YAML amont contient une apostrophe non échappée. Le diagnostic la classe comme ajout recommandé facultatif. Les workflows de planification et de développement sont disponibles ; la rétrospective d'epic devra être réinstallée après correction amont.

## Mettre à jour

Demander « BMad, mets à jour cette installation ». Le workflow vérifie les versions, lance les mises à jour nécessaires, puis synchronise le runtime. La v7 preview peut changer de structure : examiner les modifications avant de les conserver dans Git.

L'installation est locale à ce dépôt. Pour un autre dépôt, y installer les compétences puis demander `bmad setup`.

## Messages des modules à l'installation

> BMad is ready. You can ask bmad for help or suggestions at any time, and if you add modules or want to check for updates in the future, just ask the bmad agent to update.

> Toolsmith is installed.
> Ask for Smithy to build a skill, optimize or convert a skill to bmad compliance, an agent persona with or without memory or a module; he starts by asking what it is for.
> bmad-eval measures whether a skill works: baseline, variant, quality and trigger runs.

## Sources

- [Installation officielle BMad](https://docs.bmad-method.org/start/install-bmad/)
- [Source BMad v7 preview](https://github.com/bmad-code-org/BMAD-METHOD)
- [Compétences Codex](https://developers.openai.com/codex/skills)
