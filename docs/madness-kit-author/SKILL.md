---
name: madness-kit-author
description: Crée ou met à jour un kit Madness (madness-kit.toml) à partir d'un dossier ou d'un dépôt de références d'équipe (charte graphique, framework, conventions de code, vocabulaire métier, règles). À utiliser quand on demande « crée un kit Madness », « transforme ce dépôt en kit », « mets à jour le kit ».
---

# Créer un kit Madness

Tu transformes un dossier de références d'équipe en **kit Madness** : un fichier `madness-kit.toml` posé à la racine du dossier, qui déclare chaque référence, son niveau d'engagement et les agents BMad qui la reçoivent. Madness lit ce manifeste, copie les pièces dans les projets où le kit est activé et les injecte dans les surcouches de BMad. Ton travail s'arrête au manifeste : tu ne modifies, ne déplaces et ne renommes **aucun** fichier existant.

Ce document se suffit à lui-même : il contient le format complet et les règles de validation. Tu n'as pas besoin du code de Madness.

## Déroulé

1. **Inventaire.** Liste récursivement le dossier, sans `.git`, `node_modules`, `bin`, `obj` ni `dist`. Lis les fichiers texte (`.md`, `.txt`, `.html`, `.json`, `.yml`) assez pour comprendre ce que chacun prescrit. S'il existe déjà un `madness-kit.toml`, c'est une mise à jour : garde son `id`, augmente sa `version` (voir « Mise à jour »).
2. **Classement.** Pour chaque référence, choisis le type de pièce, le niveau et les rôles (tables ci-dessous). Regroupe par dossier quand un dossier entier a la même fonction (`charte/*`), sinon une pièce par fichier.
3. **Règles.** Extrais des références les obligations courtes et vérifiables (5 à 15 au total) et écris-les en `[[rule]]`. Chaque règle tient en une phrase, dit ce qui est attendu ou interdit, et peut se vérifier en lisant du code ou une maquette. Ne recopie pas des paragraphes entiers : ils restent dans les pièces.
4. **Manifeste.** Écris `madness-kit.toml` à la racine du dossier, avec le gabarit plus bas.
5. **Validation.** Applique toute la liste « Validation ». Si le dépôt Madness est disponible, lance aussi `node scripts/madness-kit.mjs check <dossier>` depuis ce dépôt et corrige jusqu'à `✓`.
6. **Compte rendu.** Résume pour l'utilisateur : les pièces retenues et pourquoi, les règles extraites, ce que tu as laissé de côté, et les choix incertains à confirmer (niveau `impose` ou `consulte`, rôles).

## Le format (version 1)

```toml
[kit]
id = "socle-equipe"         # obligatoire : ^[a-z0-9][a-z0-9-]{0,62}$ ; ne change jamais après la première version
name = "Socle équipe"       # obligatoire : nom lisible
version = "1.0.0"           # obligatoire : version sémantique MAJEUR.MINEUR.CORRECTIF
description = "Une phrase"  # facultatif
format = 1                  # facultatif ; si présent, vaut 1

[[piece]]                   # zéro ou plusieurs
kind = "docs"               # obligatoire : docs | glossary | rules | assets | skill | starter | reference | mcp
title = "Charte graphique"  # recommandé : nom lisible, repris dans les consignes aux agents
path = "charte/*"           # obligatoire pour docs, glossary, rules, assets, skill
level = "impose"            # impose | consulte (consulte si absent)
for = ["ux", "dev", "review"]  # obligatoire (sauf starter) : au moins un rôle

[[rule]]                    # zéro ou plusieurs
id = "palette"              # recommandé : minuscules et tirets
text = "Aucune couleur en dur : uniquement les jetons de charte/tokens.json."  # obligatoire
level = "impose"
for = ["ux", "dev", "review"]
```

### Chemins (`path`)

- Relatif à la racine du kit, avec `/` comme séparateur.
- Jamais absolu (`C:\…`, `/…`) et jamais de `..`.
- `*` correspond à n'importe quel nom dans un seul dossier, `**` traverse les sous-dossiers. Un chemin de dossier seul (`charte`) prend tout son contenu.
- Seuls les fichiers désignés par les pièces sont copiés dans les projets : n'oublie pas les fichiers d'appui (jetons, images) qu'une doc référence.

### Types de pièces

| `kind` | Pour | Appliqué par Madness aujourd'hui |
|---|---|---|
| `docs` | Documentation prescriptive ou explicative : charte, conventions, architecture, guides | oui |
| `glossary` | Vocabulaire métier, termes à employer ou à proscrire | oui |
| `rules` | Un fichier qui n'est qu'une liste de règles | oui |
| `assets` | Fichiers d'appui : jetons de design (`tokens.json`), images, logos, schémas | oui |
| `skill` | Dossier de compétence (`skills/<nom>/SKILL.md`) | non, déclaré pour plus tard |
| `starter` | Projet de démarrage (`source = "git+https://…"`, `ref = "v1.2.0"`, pas de `for`) | non, déclaré pour plus tard |
| `reference` | Projet d'exemple à imiter en lecture seule (`source`, `ref`, `for`) | non, déclaré pour plus tard |
| `mcp` | Serveur MCP (`name`, `command`, `args`, `for`) | non, déclaré pour plus tard |

Déclare quand même les pièces « plus tard » si le dossier ou l'utilisateur les fournit : Madness les acceptera dès qu'il saura les appliquer.

### Niveaux (`level`)

- `impose` : une obligation. Les agents la reçoivent comme principe, la revue de code et l'orchestrateur la vérifient. À réserver à ce que l'équipe exige vraiment : charte, technologies imposées, conventions obligatoires, vocabulaire.
- `consulte` : du contexte. À utiliser pour les explications, l'historique, les exemples, les documents d'architecture indicatifs.

En cas de doute, choisis `consulte` et signale-le dans ton compte rendu.

### Rôles (`for`)

| Rôle | Qui le reçoit dans BMad | Typiquement |
|---|---|---|
| `analyst` | Mary, brief, PRFAQ, brainstorming, recherche | contexte métier, marché |
| `pm` | John, PRD | contraintes produit, vocabulaire |
| `ux` | Sally, conception UX | charte, composants, accessibilité |
| `architect` | Winston, architecture | framework, stack, architecture de référence |
| `po` | Sofia, epics et stories | découpage, définition de « terminé » |
| `dev` | Amelia, construction, tests e2e | conventions de code, framework, charte, composants |
| `review` | revue de code, relecture | tout ce qui est imposé et vérifiable |
| `all` | tous les rôles ci-dessus, plus la table ronde | vocabulaire métier, règles transverses |

Repères : une charte va à `ux`, `dev` et `review`. Des conventions de code vont à `dev` et `review`, et à `architect` si elles fixent la stack. Un glossaire va à `all`.

## Classement : repères par nom de fichier

| Le nom ou le contenu évoque… | `kind` | `level` | `for` |
|---|---|---|---|
| glossaire, vocabulaire, lexique, terminologie | glossary | impose | all |
| charte, design system, UI, couleurs, typographie, composants, jetons | docs (et assets pour les jetons et images) | impose | ux, dev, review |
| conventions, standards, coding style, guide de développement, framework | docs | impose | dev, review (+ architect pour la stack) |
| architecture, ADR, décisions techniques | docs | consulte (impose si c'est une décision ferme) | architect, dev |
| accessibilité, sécurité, RGPD, exigences non fonctionnelles | docs | impose | ux, dev, review (+ architect) |
| tests, qualité, définition de terminé | docs | impose | dev, review, po |
| notes, historique, présentation générale | docs | consulte | all |
| dossier `skills/<x>/SKILL.md` | skill | consulte | dev (ou le rôle visé) |

Ce sont des repères : le contenu prime sur le nom.

## Validation

Avant de rendre la main, vérifie chaque point :

- [ ] Le fichier s'appelle `madness-kit.toml`, à la racine du kit (ou de `kits/<x>/` pour un dépôt à plusieurs kits), et c'est du TOML valide.
- [ ] `[kit]` contient `id` (format respecté), `name` et `version` sémantique ; `format` vaut 1 s'il est présent.
- [ ] Chaque `[[piece]]` a un `kind` de la liste. `path` est présent pour docs, glossary, rules, assets et skill, il est relatif, sans `..`, et désigne au moins un fichier existant.
- [ ] Chaque `for` contient au moins un rôle de la liste (sauf `starter`).
- [ ] Chaque `[[rule]]` a un `text` non vide, d'une phrase, vérifiable.
- [ ] `level` vaut `impose` ou `consulte`.
- [ ] Aucun fichier existant n'a été modifié, déplacé ou supprimé.
- [ ] Aucune donnée sensible (mot de passe, jeton, URL interne avec identifiants) n'est recopiée dans le manifeste ou les règles.

## Mise à jour d'un kit existant

- Garde l'`id`.
- Augmente la `version` : CORRECTIF pour une précision de texte, MINEUR pour une pièce ou une règle ajoutée, MAJEUR quand une règle imposée change ou disparaît.
- Préserve les choix explicites déjà faits dans le manifeste (niveaux, rôles), sauf demande contraire.
- Liste les changements dans ton compte rendu : les projets restent sur l'ancienne version jusqu'à ce que l'utilisateur clique « Mettre à jour » dans Madness.

## Exemple complet : socle .NET / Angular

Dossier :

```
socle-equipe/
  charte/couleurs.md  charte/typographie.md  charte/composants.md  charte/tokens.json
  framework/dotnet.md  framework/angular.md  framework/architecture.md
  glossaire.md
```

Manifeste :

```toml
[kit]
id = "socle-equipe"
name = "Socle équipe"
version = "1.0.0"
description = "Framework .NET + Angular, socle graphique et vocabulaire"
format = 1

[[piece]]
kind = "docs"
title = "Charte graphique"
path = "charte/*"
level = "impose"
for = ["ux", "dev", "review"]

[[piece]]
kind = "docs"
title = "Conventions .NET"
path = "framework/dotnet.md"
level = "impose"
for = ["architect", "dev", "review"]

[[piece]]
kind = "docs"
title = "Conventions Angular"
path = "framework/angular.md"
level = "impose"
for = ["architect", "dev", "review"]

[[piece]]
kind = "docs"
title = "Architecture de référence"
path = "framework/architecture.md"
level = "consulte"
for = ["architect", "dev"]

[[piece]]
kind = "glossary"
title = "Vocabulaire métier"
path = "glossaire.md"
level = "impose"
for = ["all"]

[[rule]]
id = "stack"
text = "Back-end en .NET et front-end en Angular, aux versions du framework de l'équipe ; aucune autre technologie sans décision écrite."
level = "impose"
for = ["architect", "dev", "review"]

[[rule]]
id = "palette"
text = "Aucune couleur en dur : uniquement les jetons de charte/tokens.json."
level = "impose"
for = ["ux", "dev", "review"]

[[rule]]
id = "composants"
text = "Tout écran utilise les composants du socle décrits dans charte/composants.md avant d'en créer un nouveau."
level = "impose"
for = ["ux", "dev", "review"]
```

## Utiliser ce document comme compétence

Ce fichier est écrit au format compétence (en-tête `name` / `description`). Pour qu'un agent le charge seul :

- Claude Code : copie le dossier `madness-kit-author/` dans `.claude/skills/` (projet) ou `~/.claude/skills/` (utilisateur).
- Codex : copie-le dans `.agents/skills/` du projet.

Sinon, donne simplement ce fichier à l'agent avec la consigne : « Suis ce document pour créer le kit Madness du dossier <chemin>. »
