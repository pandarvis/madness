# Revue des contrats UX — Madness

Date : 23 octobre 2026. Périmètre : contrôle de cohérence UX seul, selon le rubric walker de `bmad-ux/references/validate.md`. Contrats examinés : `DESIGN.md` et `EXPERIENCE.md`, tous deux `draft`. Aucun contrat, prototype ou autre document canonique modifié.

## Verdict d'ensemble

Les deux contrats transmettent une première base UX cohérente : trois parcours complets, 17 composants appariés, états explicites et distinction solide entre résultat proposé, autorisation d'une opération et validation humaine. Un besoin du brief reste insuffisamment transmis : retrouver les initiatives à l'intérieur d'un projet ; son contexte n'apparaît ni dans l'architecture d'information ni dans les parcours. Ce point doit être clarifié avant de figer les exigences de réalisation ; les hypothèses A1/A2 et les écarts techniques G1–G3 sont déjà ouverts et ne constituent pas de nouveaux constats de cette revue.

| Catégorie | Verdict | Constats nouveaux |
|---|---|---|
| 1. Couverture des parcours | adequate | 1 medium |
| 2. Complétude des tokens | strong | 0 |
| 3. Couverture des composants | strong | 0 |
| 4. Couverture des états | strong | 0 |
| 5. Couverture des références visuelles | strong | 0 |
| 6. Volume et surspécification | strong | 0 |
| 7. Discipline d'héritage | adequate | Même constat R1, compté une seule fois |
| 8. Respect de la forme | strong | 0 |

Comptage dédupliqué : **critical 0 · high 0 · medium 1 · low 0**. `strong` décrit la cohérence documentaire contrôlée, sans valoir preuve d'implémentation, test utilisateur ou audit d'accessibilité.

## 1. Couverture des parcours — adequate

Le ticket `../initiative-madness.md` a été lu en entier : il contient seulement les métadonnées de l'initiative, sans Requirements. L'extraction porte donc sur les sources citées par le journal : `PRODUCT.md`, `../brief-madness/brief-madness.md` et `.working/parcours-proposes.md`, à la lumière des décisions de `.memlog.md`.

| Parcours source, nom conservé | Contrat | Protagoniste, étapes, moment décisif et récupération |
|---|---|---|
| Ouvrir et retrouver un projet | `EXPERIENCE.md:129` | Sam ; cinq étapes ; prochaine action compréhensible ; accès refusé, incompatibilité et annulation |
| Comprendre l'état et ses preuves | `EXPERIENCE.md:139` | Sam ; six étapes ; preuve d'un état connu/déduit/à décider ; recherche vide, fichier absent ou inaccessible, modification externe |
| Lancer une action et poursuivre | `EXPERIENCE.md:150` | Sam ; six étapes ; fin de tour et prochaine action ; interruption, erreur et résultat inconnu avant réessai |

Les critères du brief sont couverts : état et preuves par le parcours 2 ; action expliquée et catalogue par les parcours 2–3 ; initialisation guidée par le parcours 1 ; dialogue, résultats et attentes par le parcours 3 ; modification externe sans conversation inventée par le parcours 2. Windows/Codex/v7, absence de migration et non-validation d'une stack sont conservés (`EXPERIENCE.md:17`, `:21`, `:102`). Le besoin de retrouver les initiatives, présent dans le périmètre du brief, demeure le seul manque identifié.

### Constats

- **medium — R1 : le contexte d'initiative n'est pas transmis au parcours du projet.** Le brief demande explicitement de retrouver les « initiatives, leurs étapes et les fichiers associés » (`../brief-madness/brief-madness.md:24`). Les huit surfaces d'IA (`EXPERIENCE.md:27` à `:34`), la navigation (`:38`) et les parcours 1–2 (`:129`, `:139`) restent au niveau projet : aucun repère ne dit quelle initiative porte l'état, les preuves ou l'action envisagée. Un consommateur aval peut ainsi concevoir un état unique pour tout le dossier et perdre ce besoin de rattachement. *Correction proposée :* préciser dans les surfaces existantes où Sam retrouve l'initiative et comment ses preuves/actions restent rattachées à celle-ci. Si la V1 doit seulement présenter l'initiative active, faire confirmer et consigner cette limite ; cette revue n'impose ni sélecteur multi-initiative ni nouvel écran.

## 2. Complétude des tokens — strong

Frontmatter relu : 28 couleurs littérales, dix rôles typographiques, six arrondis, onze espacements et huit groupes de tokens de composants (`DESIGN.md:13` à `:160`). Le contrôle mécanique consigné dans `.working/coverage-check.md` extrait 125 valeurs et 83 occurrences de références, soit 62 chemins distincts ; il ne relève aucune référence non résolue. La lecture du contrat confirme l'emploi des mêmes chemins dans EXPERIENCE : seuil de tiroir, largeur et cible du rail.

Les couleurs ont des valeurs hexadécimales ; aucune paire clair/sombre n'est requise puisque seul le thème clair est conçu (`EXPERIENCE.md:171`). Les cibles de contraste texte, grand texte, indicateurs nécessaires et focus sont explicites (`DESIGN.md:184`). Les références de prose aboutissent à des scalaires ; la référence composite `{typography.label}` reste à l'intérieur de `components.status.typography`, où elle est permise. Les clés libres des tokens de composants sont conformes à la référence de spécification installée ; aucune ancienne liste de propriétés Impeccable n'est imposée.

### Constats

Aucun manque identifié. La limite de validation YAML est précisée dans les notes mécaniques.

## 3. Couverture des composants — strong

Les tableaux `DESIGN.md:220` et `EXPERIENCE.md:54` partagent exactement les 17 noms suivants : Navigation latérale ; Bouton ; Ligne de projet ou d'attente ; Onglets du projet ; Recommandation ; Groupe d'intentions ; Catalogue des compétences ; Fiche compétence ; Indicateur d'état ; Conversation ; Champ de réponse ; Proposition d'approbation ; Récapitulatif de tour ; Panneau de fichiers ; Diagnostic et initialisation ; Dialogue ; Notification.

Chaque ligne visuelle décrit une anatomie, une hiérarchie ou une apparence exploitable ; chaque ligne comportementale apporte des règles d'action, de conservation du contexte ou de récupération. Les variantes rail/tiroir appartiennent à Navigation latérale, l'aperçu agrandi au Panneau de fichiers ; elles ne nécessitent pas un composant parallèle pour comprendre le contrat. La séparation Proposition d'approbation / Récapitulatif de tour est particulièrement nette (`EXPERIENCE.md:71`–`:72`).

### Constats

Aucun composant orphelin ou nom contradictoire identifié.

## 4. Couverture des états — strong

Les huit surfaces IA ont été parcourues, avec les règles transversales de focus, d'erreur et de connexion.

| Surface | États et récupération trouvés |
|---|---|
| Accueil | Sans projet / sans attente, récents, attente nommée ; ouverture d'un projet (`EXPERIENCE.md:84`, `:95`, `:131`) |
| Diagnostic et initialisation | Lecture en cours, absent, incompatible, prérequis, refus d'accès ; confirmation avant écriture, annulation et vérification après opération (`:74`, `:85`–`:88`, `:134`, `:137`) |
| Projet · Parcours | État partiellement déduit, absence de livrables, preuves et modification externe (`:80`, `:90`, `:92`–`:93`) |
| Projet · Conversation | Aucune session connue, en cours, réponse/approbation attendue, interruption, erreur, résultat inconnu, tour terminé et après redémarrage (`:69`–`:72`, `:94`–`:99`, `:159`) |
| Catalogue | Recherche sans résultat, catalogue vide, compétence indisponible ; retirer filtre ou diagnostiquer (`:66`, `:91`) |
| Fiche compétence | Conditions avant lancement, action indisponible expliquée, absence de double lancement ; fermeture sans accord (`:61`, `:67`, `:75`) |
| Panneau de fichiers et aperçu agrandi | Absence, erreur de lecture, provenance/statut connus, agrandissement et ouverture éditeur encore indisponible (`:73`, `:92`, `:111`) |
| Connexion Codex et accès | Indisponibilité/hors ligne, droit manquant, informations connues conservées et réessai après rétablissement (`:34`, `:88`–`:89`, `:102`) |

Le focus et les superpositions sont communs à toutes les surfaces (`:100`, `:111`, `:119`). Une information durable ne dépend pas de la seule Notification (`:76`). Les trois axes projet/agent/acceptation humaine sont séparés ; une autorisation de production ne valide pas le contenu futur, et une fin de tour ne clôt pas le workflow (`:49`–`:50`, `:71`–`:72`, `:80`, `:98`).

### Constats

Aucun manque documentaire supplémentaire établi. Les états décrits seulement sont recevables à cette phase : l'architecture doit encore instruire G1–G3, et A2 laisse ouvert le niveau de sauvegarde après redémarrage. Cette note ne transforme pas ces inconnues en exigences techniques décidées ni en parcours réels vérifiés.

## 5. Couverture des références visuelles — strong

Inventaire local : neuf fichiers dans `mockups/` et `imports/`, aucun dossier `wireframes/`. Tous possèdent un lien inline dans au moins un contrat, accompagné de sa fonction.

| Fichier | Lien et objet |
|---|---|
| `imports/reference-codex-desktop.png` | `DESIGN.md:169`, `EXPERIENCE.md:163` : sobriété, conversation et contexte latéral |
| `imports/reference-navigation-repliee.png` | `DESIGN.md:206`, `EXPERIENCE.md:163` : gain de place et destinations conservées |
| `mockups/parcours-guide/index.html` | `DESIGN.md:169`, `EXPERIENCE.md:19`, `:36` : simulation commune des parcours |
| `mockups/parcours-guide/styles.css` | `DESIGN.md:196` : composition et adaptations de fenêtre |
| `mockups/parcours-guide/catalogue.js` | `EXPERIENCE.md:66` : 27 compétences de démonstration, sans quota produit |
| `mockups/parcours-guide/app.js` | `EXPERIENCE.md:106` : interactions et réponses simulées, sans engagement de performance réelle |
| `mockups/navigation-repliee.png` | `DESIGN.md:206`, `EXPERIENCE.md:171` : rail 58 px |
| `mockups/navigation-deployee.png` | Mêmes passages : menu déployé |
| `mockups/navigation-mobile.png` | Mêmes passages : tiroir en fenêtre étroite |

La primauté des deux contrats en cas de conflit est énoncée une fois (`DESIGN.md:167`). Les réconciliations des deux imports ne signalent aucune idée qualitative utile perdue ; elles restent des éléments documentaires de la consolidation.

### Constats

Aucun orphelin ou renvoi non spécifique identifié. La confirmation par le porteur des surfaces restant sans maquette est encore une étape ouverte du workflow ; cette revue ne présume pas sa réponse et n'exige pas de maquette supplémentaire.

## 6. Volume et surspécification — strong

Les deux contrats se partagent les décisions : apparence dans DESIGN, comportement dans EXPERIENCE. Les tableaux portent les règles répétitives ; les parcours illustrent leur enchaînement sans recopier le brief. Les seuils et dimensions de fenêtre servent la composition acceptée ; le rail de 58 px et ses cibles sont des choix documentés, pas une contrainte technique inventée. Les tokens portent les valeurs réutilisées ; les précisions locales ne créent pas de système parallèle.

Les rappels de simulation se trouvent aux lieux où leur omission pourrait faire croire à une capacité réelle ; ils ne constituent pas un parcours produit supplémentaire. Aucun mécanisme d'authentification, framework ou écran de configuration détaillé n'est imposé avant la vérification technique.

### Constats

Aucune surspécification susceptible de gêner un consommateur aval identifiée.

## 7. Discipline d'héritage — adequate

Les cinq `sources` de DESIGN et les six d'EXPERIENCE désignent des fichiers locaux existants. Les noms des trois parcours sont repris mot pour mot de `.working/parcours-proposes.md`. Le vocabulaire projet, compétence, fournisseur, preuve, état déduit, proposition, validation humaine et fin de tour reste cohérent entre les contrats et les sources.

La composition « Parcours guidé », le rail approuvé puis l'acceptation de la première version sont fidèles au journal. Ces accords n'y deviennent ni validation d'une stack, ni résultat d'étude utilisateur, ni connexion réelle. Aucun système UI n'étant choisi, aucune couche d'héritage de composants n'est annoncée à tort. La capture Impeccable demeure une source d'observation subordonnée aux contrats.

### Constats

Le besoin « initiatives » du brief n'est pas transmis explicitement : voir **R1**, catégorie 1. Ce constat est compté une seule fois ; aucun autre écart de nom, de référence ou d'héritage identifié.

## 8. Respect de la forme — strong

Les huit sections DESIGN sont présentes dans l'ordre canonique : Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts. Les sections BMad canonisées Brand & Style et Layout & Spacing sont valides.

EXPERIENCE possède ses huit sections obligatoires. Inspiration & Anti-patterns répond aux deux références fournies et aux rejets consignés ; Responsive & Platform répond aux adaptations de fenêtre. Foundation fixe la surface Windows et renvoie à DESIGN, sans choisir de framework ni de packaging. Les trois exemples DESIGN et les deux exemples EXPERIENCE définis dans `customize.toml` ont été lus ; aucun défaut de forme n'a été déduit de simples différences éditoriales entre exemples et contrats.

### Constats

Aucune section obligatoire absente, section injustifiée ou rupture d'ordre identifiée.

## Notes mécaniques

- Lecture des deux contrats, du ticket enveloppe, du memlog, des sources produit citées, des parcours proposés, de la capture documentaire et des rapports locaux nécessaires à la traçabilité. Aucun navigateur, réseau, sous-agent, installation de dépendance ou test du prototype lancé pour cette revue.
- `.working/coverage-check.md` est utilisé comme preuve mécanique partielle : 125 valeurs, 83 occurrences de références, 17 composants appariés, 19 liens locaux et 11 entrées `sources` existantes. La présente revue a relu ces catégories et rapproché l'inventaire des neuf artefacts des liens inline ; elle n'a pas assimilé le rapport mécanique à une validation UX déjà acquise.
- Le précédent contrôle s'appuyait sur un lecteur du sous-ensemble YAML utilisé, faute de PyYAML/Node yaml. Cette revue ne prétend pas avoir fait valider le frontmatter par un parseur YAML généraliste. Aucune syntaxe manifestement invalide ou référence non résolue n'a été repérée à la lecture.
- La référence composite typographique dans un token de composant est intentionnelle ; les renvois de prose restent scalaires. Aucun contrôle fondé sur les huit anciennes propriétés Impeccable n'a été appliqué.
- Aucun diagramme Mermaid à contrôler. Aucun conflit de nom de composant entre les deux tableaux. Le seul écart d'héritage nouveau est R1.
- Le calcul de contraste précédemment consigné sur onze couples ne vaut pas audit d'accessibilité. A1 (`EXPERIENCE.md:117`) et A2 (`:99`) restent des hypothèses non bloquantes déjà nommées ; G1–G3 restent à instruire avec l'architecture (`:102`).

## Synthèse pour la suite

Clarifier R1 dans les surfaces et parcours existants, puis conserver la distinction entre la base visuelle acceptée et les décisions techniques encore ouvertes. La clôture UX reste au workflow parent : réponse sur les surfaces sans maquette, traitement des points ouverts et décision explicite de finalisation. Aucun constat de cette revue ne remet en cause le choix Parcours guidé ni la navigation rétractable acceptée.

## Suivi après correction — 23 octobre 2026

**R1 résolu après contrôle ciblé** : le contexte projet/initiative est désormais explicite dans DESIGN et EXPERIENCE, y compris les autres initiatives, la portée des fichiers, le lancement et l'absence d'initiative. Voir [.working/review-rubric-r1-verdict.md](.working/review-rubric-r1-verdict.md). Les verdicts et localisations ci-dessus décrivent la revue initiale ; ils sont conservés comme historique. Ce suivi ne vaut pas nouvelle revue complète et ne clôt pas le workflow UX.
