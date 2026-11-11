# Kits Madness : personnaliser les agents sans toucher à BMad

Date : 2026-11-11 · Statut : proposition à relire par Kévin

## Le besoin

Une équipe veut que Madness conçoive et code **avec ses propres références** : un framework interne qui impose les technologies (.NET, Angular…), un socle graphique (charte, composants), ses façons de coder, son vocabulaire métier, ses sources documentaires. Ces références vivent aujourd'hui dans un dépôt git. Elles doivent être :

- **modulables** : activées ou retirées par projet en un clic, combinables (le socle de l'entreprise, plus celui de l'équipe, plus les préférences personnelles) ;
- **structurées par Madness** : Madness définit le format d'un kit ; l'équipe l'impose dans ses futurs dépôts ;
- **à engagement réglable** : une pièce se *consulte* (contexte) ou *s'impose* (règle vérifiée), kit par kit et règle par règle ;
- **fidèles à BMad** : les agents restent ceux de BMad, la méthode n'est pas contournée.

En entrée d'un projet viennent aussi une spec et des maquettes : ce sont des **sources du projet**, pas des kits (voir § 8).

## 1. Principe : Madness traduit, BMad applique

BMad prévoit déjà la personnalisation. Chaque agent et chaque compétence lit, à son activation, des surcouches `_bmad/custom/<compétence>.toml` qui survivent aux mises à jour de BMad :

- `persistent_facts` : phrases ou fichiers (`file:` avec motifs) chargés comme faits pour toute la session ;
- `principles` (agents) : valeurs que l'agent applique ;
- `review_guidance` (`bmad-review`) : consignes appliquées à chaque relecture ;
- `activation_steps_prepend` / `_append` : étapes ajoutées à l'activation.

Les tableaux s'ajoutent les uns aux autres ; une surcouche n'écrase donc rien. Un kit Madness n'invente aucun mécanisme : **Madness lit le kit, le valide, puis l'écrit dans ces surcouches**, pour les seules compétences concernées. Un développeur qui lance BMad sans Madness sur le même dépôt bénéficie du même contexte.

## 2. Le format d'un kit

Un kit est un dossier qui contient un manifeste `madness-kit.toml` à sa racine. Un dépôt peut contenir plusieurs kits (`kits/<id>/madness-kit.toml`).

```toml
[kit]
id = "acme-socle"            # identifiant stable, minuscules et tirets
name = "Socle Acme"
version = "1.4.0"            # version sémantique, sert au verrouillage par projet
description = "Framework .NET + Angular et socle graphique Acme"
format = 1                   # version du format Madness

# Une pièce : un type, un contenu, un niveau, des destinataires.
[[piece]]
kind = "docs"                # docs | glossary | rules | skill | starter | reference | mcp | assets
title = "Charte graphique"
path = "charte/*.md"         # relatif au kit
level = "impose"             # impose | consulte (consulte par défaut)
for = ["ux", "dev", "review"]

[[piece]]
kind = "glossary"
title = "Vocabulaire métier"
path = "glossaire.md"
level = "impose"
for = ["all"]

[[rule]]                     # une règle courte, vérifiable
id = "palette"
text = "Aucune couleur en dur : uniquement les jetons de charte/tokens.json."
level = "impose"
for = ["ux", "dev", "review"]

[[piece]]
kind = "starter"             # projet de démarrage cloné à la création
source = "git+https://git.acme.fr/socle/demo.git"
ref = "v3.2.0"

[[piece]]
kind = "reference"           # projet à imiter, en lecture seule
source = "git+https://git.acme.fr/socle/demo.git"
ref = "v3.2.0"
for = ["architect", "dev"]

[[piece]]
kind = "skill"               # compétence BMad livrée par le kit
path = "skills/acme-creer-composant"
for = ["dev"]

[[piece]]
kind = "mcp"                 # serveur MCP proposé aux agents
name = "acme-design"
command = "npx"
args = ["-y", "@acme/design-mcp@2"]
for = ["ux", "dev"]
```

**Destinataires (`for`)** : des rôles plutôt que des noms de compétences, pour que les kits résistent aux évolutions de BMad. Madness tient la table rôle → compétences :

| Rôle | Compétences BMad |
|---|---|
| `analyst` | bmad-agent-analyst, bmad-product-brief, bmad-prfaq, bmad-brainstorming, bmad-forge-idea, bmad-deep-recon |
| `pm` | bmad-agent-pm, bmad-prd |
| `ux` | bmad-agent-ux-designer, bmad-ux |
| `architect` | bmad-agent-architect, bmad-architecture |
| `po` | bmad-agent-po |
| `dev` | bmad-agent-dev, bmad-build, bmad-build-auto, bmad-qa-generate-e2e-tests |
| `review` | bmad-code-review, bmad-review |
| `all` | toutes les précédentes, plus bmad-party-mode |

**Validation** : Madness refuse un kit dont le manifeste est invalide, dont un chemin sort du kit, ou dont un rôle est inconnu. Il affiche la raison exacte. Un modèle de kit vide et un validateur en ligne de commande (`npx madness-kit check`) permettent à l'équipe d'écrire ses kits hors de Madness.

## 3. Ce que Madness écrit dans le projet

Quand un kit est activé sur un projet :

1. **Copie versionnée** : les pièces texte (docs, glossaire, règles, assets) sont copiées dans `_bmad/kits/<id>/`. Le projet reste lisible et reproductible sans accès à la source, et la copie est commitée.
2. **Verrou** : `_bmad/kits.lock.toml` note pour chaque kit sa source, sa version et l'empreinte de la copie. Madness détecte ainsi une modification à la main.
3. **Surcouches BMad** : pour chaque compétence destinataire, Madness écrit dans `_bmad/custom/<compétence>.toml` un bloc délimité par `# madness:kits:begin` et `# madness:kits:end`. Il ne touche jamais au reste du fichier, qui peut contenir des réglages écrits à la main.
   - pièce `consulte` → `persistent_facts = ["file:{project-root}/_bmad/kits/<id>/…"]` ;
   - pièce ou règle `impose` → en plus, `principles` chez les agents et `review_guidance` chez `bmad-review` et `bmad-code-review`, formulés « obligatoire ».
4. **Compétences** : les pièces `skill` sont copiées dans `.agents/skills/<id>-<nom>`, préfixées par l'id du kit pour éviter toute collision avec BMad.
5. **Désactivation** : Madness retire exactement ce qu'il a écrit (blocs délimités, copies, compétences) et met le verrou à jour.

Les sources lourdes ou propres à la machine (projets de référence, serveurs MCP) ne sont pas copiées : voir § 5 et § 6.

## 4. Sources de kits et bibliothèque

Dans les réglages de Madness, une section **Kits** liste des sources :

- **dossier local** : lu tel quel, pratique pour écrire un kit ;
- **dépôt git** (https ou ssh, avec les identifiants git de la machine) : cloné dans un cache de Madness, puis rafraîchi à la demande ou à l'ouverture.

Chaque source peut proposer plusieurs kits. La bibliothèque montre pour chaque kit son nom, sa version, ses pièces et ce qu'elles imposent. Les mises à jour ne s'appliquent jamais seules : sur un projet, Madness signale « Socle Acme 1.5.0 disponible (projet en 1.4.0) », montre ce qui change, et applique la nouvelle version sur un clic. Le chantier en cours n'est pas perturbé.

**Confiance** : un kit qui apporte des compétences ou un serveur MCP fait exécuter du code. La première activation d'une source qui en contient affiche la commande exacte et demande un accord explicite, mémorisé par source.

## 5. Projets de démarrage et de référence

- **`starter`** : à la création d'un projet (« Nouveau projet »), on peut choisir un kit qui en fournit un. Madness clone le projet de démarrage à la version indiquée, retire son historique git, crée un dépôt neuf, installe BMad, puis active le kit. Le projet naît sur le framework de l'équipe.
- **`reference`** : Madness clone le projet de référence dans son cache, en lecture seule, et l'expose aux destinataires par un fait `file:` pointant vers son chemin local. Ce fait est écrit dans la surcouche utilisateur `_bmad/custom/<compétence>.user.toml`, non commitée, puisque le chemin dépend de la machine. Les agents l'explorent pour imiter sa structure et ses conventions, sans jamais y écrire.

## 6. Serveurs MCP

Une pièce `mcp` déclare un serveur, par exemple le futur catalogue de composants du socle graphique. Madness le branche dans les sessions des agents destinataires :

- Claude Code : dans la configuration MCP passée à la session (aujourd'hui vide et stricte) ;
- Codex : dans la configuration `mcp_servers` passée au lancement.

Le serveur ne tourne que pendant la session de l'agent. Les agents qui ne sont pas destinataires ne le voient pas.

## 7. Vérifier ce qui s'impose

Les règles `impose` ne sont pas seulement rappelées aux agents : elles sont vérifiées.

- Elles entrent dans les consignes de revue (`review_guidance`). La revue de code de BMad les applique déjà à chaque story.
- L'orchestrateur reçoit la liste des kits actifs et de leurs règles. Avant de déclarer un chantier terminé, il demande une relecture de conformité (`bmad-review`) quand un kit impose des règles. Un écart renvoie l'agent concerné corriger, comme un test en échec.
- Le Parcours montre les kits actifs, leur version, et l'état de conformité de la dernière revue.

## 8. Spec et maquettes : les sources du projet

La spec s'importe déjà depuis le Parcours (fichier ou texte collé). Les maquettes suivent le même chemin et rejoignent `_bmad-output/<initiative>/sources/` : images, PDF, export HTML, ou lien vers un outil de maquettes. Madness les déclare comme faits pour `ux`, `dev` et `review`, dans l'initiative seulement. Une autre initiative du même projet ne les voit pas.

## 9. Ce qu'on ne fait pas

- Pas de format propre aux agents : tout passe par les surcouches BMad.
- Pas d'injection de contenu dans chaque consigne envoyée par Madness : trop coûteux en tokens, et inutile puisque BMad charge les faits lui-même.
- Pas de modification des fichiers de BMad (`.agents/skills/bmad-*`, `_bmad/scripts`).
- Pas de place de marché publique de kits : les sources sont celles que l'équipe déclare.

## 10. Point d'attention : le profil qualifié de Mary

La conversation native Codex avec Mary vérifie l'empreinte de l'installation BMad et refuse toute surcouche `_bmad/custom/bmad-agent-analyst*.toml`. Activer un kit pour le rôle `analyst` la bloquerait. Il faut donc faire accepter à la qualification les blocs écrits par Madness, reconnus par leur empreinte dans `kits.lock.toml`. Les autres chemins (pilote, conversations avec les autres agents, Claude Code) ne sont pas concernés.

## 11. Étapes de livraison

Chaque étape est utilisable seule.

1. **Format et projet** : manifeste, validation (dans Madness et en ligne de commande), modèle de kit, sources locales, activation/désactivation par projet, copie, verrou et surcouches (`docs`, `glossary`, `rules`). Panneau « Kits » dans le projet. *Le cœur : charte, conventions et vocabulaire sont déjà utiles.*
2. **Sources git et mises à jour** : cache, rafraîchissement, version disponible, application sur un clic.
3. **Démarrage et référence** : projet de démarrage à la création, projet de référence en lecture seule.
4. **Vérification** : règles dans la revue, relecture de conformité par l'orchestrateur, état dans le Parcours.
5. **Compétences et MCP** : installation des compétences de kit, branchement MCP dans Codex et Claude, accord de confiance.
6. **Maquettes** : import dans les sources de l'initiative.

## 12. Tests

- Format : manifestes valides et invalides (chemins hors du kit, rôles inconnus, niveaux absents).
- Traduction : pour un kit donné, les blocs écrits dans chaque `_bmad/custom/<compétence>.toml`, leur coexistence avec un contenu écrit à la main, et un retrait qui rend le fichier à l'identique.
- Bout en bout avec BMad : après activation, `resolve_customization.py` renvoie bien les faits et principes attendus pour chaque compétence destinataire, et rien pour les autres.
- Chantier réel : un kit « charte + règle de palette + glossaire » sur un projet de test. On vérifie que l'agent emploie le vocabulaire imposé et que la revue signale une couleur hors palette introduite volontairement.
