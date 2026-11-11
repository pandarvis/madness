# Créer et essayer un kit Madness

Un kit transmet aux agents BMad les références de ton équipe : charte graphique, conventions de code, framework, vocabulaire métier, règles. Tu le déclares une fois dans un fichier `madness-kit.toml`. Madness le copie ensuite dans chaque projet où tu l'actives, et l'écrit dans les surcouches de BMad (`_bmad/custom/`). Les agents concernés le chargent alors à chaque activation.

Ce guide couvre la version actuelle (étape 1) : kits **locaux**, pièces **texte** (docs, glossaire, règles, fichiers).

---

## 1. Préparer Madness sur le PC

Dans le dépôt Madness, sur la branche de travail :

```powershell
git fetch origin chore/requalifier-runtime-python
git checkout chore/requalifier-runtime-python
git pull origin chore/requalifier-runtime-python
npm ci
npm run build
```

`npm ci` récupère aussi Python et uv embarqués. Lance ensuite une instance de test, avec un profil séparé pour ne pas toucher à ton Madness habituel :

```powershell
$env:MADNESS_DATA_HOME = "$env:LOCALAPPDATA\MadnessKitTest"
npx electron .
```

Il faut un projet BMad pour essayer. Le plus simple est d'utiliser **Nouveau projet** sur l'accueil : Madness crée le dossier et git, puis installe BMad (tu confirmes la liste des fichiers).

## 2. Organiser le dossier du kit

Le kit est un simple dossier, par exemple ton dépôt de références actuel (cloné en local). Tes fichiers restent tels quels ; seul le manifeste s'ajoute à la racine :

```
socle-equipe/
  madness-kit.toml          ← le manifeste
  charte/
    couleurs.md
    typographie.md
    tokens.json
    composants.md
  framework/
    dotnet.md               ← conventions .NET (couches, nommage, tests…)
    angular.md              ← conventions Angular (structure, state, composants…)
    architecture.md
  glossaire.md              ← vocabulaire métier
```

Un même dépôt peut contenir plusieurs kits : un dossier par kit sous `kits/` (`kits/socle-graphique/madness-kit.toml`, `kits/framework/madness-kit.toml`…).

## 3. Écrire le manifeste

### Le plus rapide : l'assistant

Réglages (roue dentée) › **Kits** › **Créer un kit depuis un dossier…**, puis choisis le dossier. Madness propose un manifeste d'après les noms de tes fichiers. Par exemple, `charte/` est imposé à l'UX, au dev et à la revue ; `glossaire.md` est imposé à tous ; `conventions-*.md` est imposé au dev et à la revue ; les autres `.md` sont consultés par tous. Ajuste dans l'éditeur, puis clique **Enregistrer le kit**. Le fichier `madness-kit.toml` est écrit dans ton dossier, prêt à commiter.

### À la main : exemple pour un socle .NET / Angular

```toml
[kit]
id = "socle-equipe"           # minuscules, chiffres, tirets ; ne le change plus ensuite
name = "Socle équipe"
version = "1.0.0"             # à augmenter à chaque évolution du kit
description = "Framework .NET + Angular, socle graphique et vocabulaire"
format = 1

# --- Socle graphique ---
[[piece]]
kind = "docs"
title = "Charte graphique"
path = "charte/*"             # tout le dossier charte (md, json…)
level = "impose"
for = ["ux", "dev", "review"]

# --- Framework ---
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

# --- Vocabulaire ---
[[piece]]
kind = "glossary"
title = "Vocabulaire métier"
path = "glossaire.md"
level = "impose"
for = ["all"]

# --- Règles courtes et vérifiables ---
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
text = "Tout écran utilise les composants du socle graphique décrits dans charte/composants.md avant d'en créer un nouveau."
level = "impose"
for = ["ux", "dev", "review"]
```

## 4. Référence du format

### `[kit]`

| Champ | Obligatoire | Rôle |
|---|---|---|
| `id` | oui | Identifiant stable : minuscules, chiffres, tirets |
| `name` | oui | Nom affiché |
| `version` | oui | Version sémantique (`1.4.0`). Chaque projet garde la sienne jusqu'à sa mise à jour |
| `description` | non | Une phrase |
| `format` | non | `1` |

### `[[piece]]`

| Champ | Rôle |
|---|---|
| `kind` | Type de pièce (voir ci-dessous) |
| `title` | Nom lisible, repris dans les consignes aux agents |
| `path` | Chemin relatif au kit. `*` = tout dans un dossier, `**` = à travers les sous-dossiers. Un dossier seul prend tout son contenu |
| `level` | `impose` (les agents doivent s'y conformer, la revue le vérifie) ou `consulte` (contexte). `consulte` par défaut |
| `for` | Rôles destinataires (voir ci-dessous) |

| `kind` | Pris en charge | Usage |
|---|---|---|
| `docs` | oui | Documentation : charte, conventions, architecture… |
| `glossary` | oui | Vocabulaire métier |
| `rules` | oui | Fichier de règles |
| `assets` | oui | Fichiers d'appui (jetons, images…) |
| `starter` | prochaine version | Projet de démarrage cloné par « Nouveau projet » |
| `reference` | prochaine version | Projet à imiter, en lecture seule |
| `skill` | prochaine version | Compétence BMad livrée par le kit |
| `mcp` | prochaine version | Serveur MCP (par exemple le catalogue de composants) |

Les types « prochaine version » sont déjà acceptés par le format : Madness les signale sans les appliquer.

### `[[rule]]`

| Champ | Rôle |
|---|---|
| `id` | Identifiant court |
| `text` | Une phrase courte et vérifiable |
| `level` | `impose` ou `consulte` |
| `for` | Rôles destinataires |

### Les rôles (`for`)

| Rôle | Agents et compétences BMad concernés |
|---|---|
| `analyst` | Mary, brief, PRFAQ, brainstorming, Forge, recherche |
| `pm` | John, PRD |
| `ux` | Sally, conception UX |
| `architect` | Winston, architecture |
| `po` | Sofia (epics et stories) |
| `dev` | Amelia, construction, tests e2e |
| `review` | revue de code, relecture |
| `all` | tous les précédents, plus la table ronde |

Ce qui est **imposé** devient en plus un *principe* pour les agents et une *consigne* pour la relecture. L'orchestrateur reçoit aussi les règles imposées.

## 5. Vérifier le kit

Depuis le dépôt Madness :

```powershell
node scripts/madness-kit.mjs check C:\chemin\vers\socle-equipe
```

`✓ Socle équipe 1.0.0 : 5 pièce(s), 3 règle(s)` signifie que le kit est valide. Sinon, chaque erreur est listée (chemin hors du kit, rôle inconnu, version mal formée…).

## 6. L'activer sur un projet

1. Réglages › Kits › **Ajouter une source…**, puis choisis le dossier du kit (ou le dossier qui contient `kits/`). Le kit apparaît avec son nombre de pièces et de règles.
2. Ouvre le projet, onglet **Parcours** › **Kits du projet**, coche le kit.

Dans le projet, Madness a alors écrit :
- `_bmad/kits/<id>/` : la copie des pièces texte, à commiter avec le projet ;
- `_bmad/kits.lock.toml` : la version active ;
- `_bmad/custom/<compétence>.toml` : un bloc entre `# madness:kits:begin` et `# madness:kits:end` pour chaque agent concerné.

Décocher retire exactement tout ça.

## 7. L'essayer avec les agents

Onglet **Conversation**, menu **Agent** :

- **Sally** : « Quel libellé et quelle couleur exacte pour le bouton principal de la page d'inscription ? Ne modifie aucun fichier. » Attendu : ton vocabulaire et un jeton de ta charte.
- **Winston** : « Quelle stack proposes-tu pour ce projet et pourquoi ? Ne modifie aucun fichier. » Attendu : .NET + Angular, selon tes conventions.
- **Amelia** : « Comment structurerais-tu un nouveau composant de formulaire ? Ne modifie aucun fichier. » Attendu : tes conventions Angular et les composants du socle.

Ensuite, laisse le pilote automatique construire une petite fonctionnalité et regarde le code produit.

## 8. Faire évoluer le kit

Modifie tes fichiers, augmente `version` dans le manifeste. Dans **Kits du projet**, Madness affiche « version x disponible » et un bouton **Mettre à jour**. Chaque projet reste sur sa version tant que tu ne l'as pas mis à jour.

## 9. Dépannage

| Message | Cause | Solution |
|---|---|---|
| `KIT_OVERRIDE_CONFLICT: persistent_facts dans _bmad/custom/bmad-ux.toml` | Ce fichier contient déjà un réglage écrit à la main sur la même clé | Déplace ce réglage dans un kit, ou dans `bmad-ux.user.toml` |
| `kit.name est obligatoire`, `rôle « … » inconnu`… | Manifeste invalide | Corrige, puis `node scripts/madness-kit.mjs check` |
| Le kit n'apparaît pas dans la source | Manifeste absent de la racine ou de `kits/<x>/` | Place `madness-kit.toml` au bon endroit |
| Mary refuse de démarrer (`PROFILE_UNRECOGNIZED`) | `_bmad/custom/bmad-agent-analyst.toml` contient autre chose que le bloc Madness | Déplace le réglage manuel dans `bmad-agent-analyst.user.toml` |
| « Kits du projet » n'apparaît pas | Aucune source déclarée ou aucun kit valide | Ajoute une source dans Réglages › Kits |

## 10. Limites de cette version

- Sources **locales** uniquement : pour un dépôt git, clone-le puis ajoute le dossier cloné comme source (les sources git directes arrivent à l'étape suivante).
- Projet de démarrage, projet de référence, compétences et MCP : acceptés par le format, appliqués dans une prochaine version.
- La relecture de conformité dédiée avant la fin d'un chantier arrive à l'étape « vérification ». Aujourd'hui, les règles imposées sont rappelées aux agents, à la revue de code et à l'orchestrateur.
