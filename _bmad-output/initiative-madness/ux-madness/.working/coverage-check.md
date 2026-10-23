# Contrôle de couverture des contrats UX — Madness

Date : 23 octobre 2026. Périmètre : Pass 1 mécanique de `bmad-ux/references/validate.md`, effectué pendant la distillation. Les deux contrats restent `draft`. Ce contrôle ne vaut ni revue UX experte, ni étude utilisateur, ni validation des intégrations.

## Résultat

| Catégorie | Résultat | Éléments vérifiés |
|---|---|---|
| Parcours | strong | Trois noms repris exactement de `.working/parcours-proposes.md` ; Sam dans les trois parcours, étapes numérotées, trois moments décisifs et trois chemins d'échec/récupération. `EXPERIENCE.md`, Key Flows. |
| Tokens | strong, dans la limite du parseur décrit ci-dessous | 125 valeurs de tokens ; 83 occurrences de références, 62 références distinctes ; aucune référence non résolue et aucune référence composite dans la prose. 28 couleurs en hexadécimal à six chiffres. Structure et ordre des huit sections DESIGN conformes. |
| Composants | strong | 17 noms identiques, dans le même ordre, entre DESIGN · Components et EXPERIENCE · Component Patterns ; règles visuelles et comportementales pour chacun. |
| États | adequate | Chaque surface IA possède ses états utiles dans State Patterns ou les règles de composants. Les états non maquettés, les inconnues d'intégration et les deux hypothèses sont explicités, sans les présenter comme une UX détaillée approuvée. |
| Références | strong | 19 liens locaux et 11 entrées `sources` vérifiés existants. Neuf fichiers de `mockups/` et `imports/` liés aux endroits pertinents, aucun orphelin ; `wireframes/` absent. Primauté des contrats indiquée une fois dans DESIGN · Brand & Style. |

Le ticket `initiative-madness.md` a été lu en entier : c'est une enveloppe sans Requirements. Les sources citées par le memlog ont donc fourni les besoins et les noms des parcours. Les trois exemples DESIGN et les deux exemples EXPERIENCE du workflow ont été lus pour la forme.

## Couverture des besoins

| Besoin capturé | Emplacement principal |
|---|---|
| Accueil par récents et attentes ; diagnostic, absence et initialisation guidée de v7 | EXPERIENCE · Information Architecture, State Patterns, parcours 1 |
| État connu, déduction, proposition et validation humaine distincts ; preuve accessible | EXPERIENCE · State Patterns, parcours 2 ; DESIGN · Colors |
| Recommandation expliquée, alternatives, catalogue complet, conditions et invocation Codex réelle | EXPERIENCE · Component Patterns, parcours 2–3 |
| Catalogue de 27 compétences dans la simulation, métadonnées exclues et indisponibilité expliquée | EXPERIENCE · Catalogue des compétences ; `mockups/parcours-guide/catalogue.js` |
| Dialogue, réponse, approbation, fin de tour, récapitulatif et prochaine action | EXPERIENCE · Component Patterns, Voice and Tone, parcours 3 |
| Aperçu, provenance et chemin ; ouverture éditeur future | EXPERIENCE · Panneau de fichiers, parcours 2 ; DESIGN · Components |
| Modification externe sans reconstruire une conversation | EXPERIENCE · Foundation, State Patterns, parcours 2 |
| Navigation rétractable 58 px, infobulles clavier/survol, préférence seule mémorisée, saisie préservée | DESIGN · Layout & Spacing ; EXPERIENCE · Navigation latérale, Interaction Primitives, Responsive & Platform |
| Pas de stack approuvée, migration d'anciennes versions hors V1, conversations externes hors synchronisation V1 | EXPERIENCE · Foundation |

## Couverture visuelle par surface

« Maquetté » signifie illustré par la simulation HTML, pas implémenté ni validé dans une application connectée.

| Surface IA | Maquetté | Décrit dans les contrats seulement |
|---|---|---|
| Accueil | Récents et attentes, retour à une question ou un livrable | Aucun projet, aucune attente, première lecture |
| Diagnostic et initialisation | BMad absent, changements annoncés, confirmation/annulation et résultat simulé | Accès refusé, incompatibilité, prérequis réels et échec d'installation |
| Projet · Parcours | État, preuve, recommandation, intentions et changement externe simulé | Diagnostic réel des preuves et erreurs de lecture |
| Projet · Conversation | Aucun dialogue, en cours, question, réponse, approbation, interruption, erreur récupérable, reprise et récapitulatif | Connexion réelle, résultat d'envoi incertain, reprise après redémarrage |
| Catalogue | Liste, filtres, recherche, absence de résultat et compétence indisponible expliquée | Installation sans compétence exploitable |
| Fiche compétence | Objectif, invocation copiable, entrées, résultat, conditions et lancement simulé | Exécution propre à chaque workflow avec intégration réelle |
| Panneau de fichiers et aperçu agrandi | Fichiers, absence de livrable, extraits, chemin et limite de l'ouverture éditeur | Lecture réelle, accès refusé, intégration éditeur |
| Connexion Codex et accès | Mention visible « simulé » ; exemple d'erreur récupérable | Connexion/authentification, capacité disponible et permissions réelles |

La Navigation latérale possède trois captures : `navigation-deployee.png`, `navigation-repliee.png`, `navigation-mobile.png`. La couverture des surfaces décrites seulement doit encore être présentée à l'utilisateur selon l'étape « Mock coverage confirmed » du workflow. Ce contrôle ne présume pas son choix de demander d'autres maquettes.

## Hypothèses et écarts à instruire

Deux hypothèses non bloquantes pour la consolidation UX :

- **A1 — socle WCAG 2.2 AA**, `EXPERIENCE.md:117`. Cible proposée ; audit clavier, lecteur d'écran, zoom et contraste de l'application intégrée encore à réaliser.
- **A2 — reprise après redémarrage**, `EXPERIENCE.md:99`. Retrouver le contexte vérifiable sans relance automatique est proposé ; niveau de sauvegarde des échanges et des brouillons à confirmer.

Trois écarts d'intégration déjà ouverts dans les sources, sans nouvelle exigence produit inventée :

- **G1 — connexion Codex**, EXPERIENCE · Foundation / State Patterns. Voie officielle, authentification, capacités de réponse/approbation/interruption/reprise et résultat d'envoi à démontrer.
- **G2 — compatibilité v7 et accès**, EXPERIENCE · Diagnostic et initialisation / State Patterns. Critères précis de compatibilité et messages de diagnostic réel à définir à partir de l'installation supportée ; aucune migration d'une version antérieure.
- **G3 — opérations sur les fichiers**, EXPERIENCE · Panneau de fichiers / Diagnostic et initialisation. Changements exacts de l'initialisation, lecture des projets et ouverture éditeur restent à intégrer et tester.

Aucun de ces points n'est dissimulé par un écran de succès simulé. Ils ne bloquent pas l'écriture des contrats ; ils doivent être traités avant de déclarer les parcours réels opérationnels. La gate de revue optionnelle, le triage final et la clôture des contrats restent à la charge du workflow parent.

## Contrôles réellement exécutés

- Lecture des sources locales, du code HTML/CSS/JavaScript de la maquette et du sidecar de capture ; inspection des deux images importées. Aucun navigateur, réseau ou sous-agent lancé pour ce contrôle.
- Script Python standard en lecture seule : analyse du sous-ensemble YAML utilisé (dictionnaires indentés, liste `sources`, scalaires cités et nombres), résolution des références, contrôle des couleurs, comparaison des composants et noms de parcours, existence des liens/sources et inventaire des références visuelles. Sortie finale sans assertion échouée.
- Contrôle supplémentaire des références de prose : toutes résolvent un scalaire. La référence composite `{typography.label}` dans le token `components.status.typography` reste intentionnelle.
- Calcul sRGB sur onze couples de texte/fond du frontmatter : rapports de 4,84:1 à 14,61:1, tous ≥ 4,5:1. Cela couvre les couples vérifiés, pas tous les rendus/états ni la conformité générale des contrôles.
- Lecture des sections obligatoires EXPERIENCE : Foundation, Information Architecture, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows ; Inspiration & Anti-patterns et Responsive & Platform présents.

Limite technique : `uv run python` a échoué à écrire le cache d'inspection d'interpréteur dans le sandbox. Le Python local a ensuite confirmé l'absence de PyYAML. Le contrôle a donc utilisé directement `.venv/Scripts/python.exe` avec la bibliothèque standard, sans installation de dépendance. Il ne constitue pas une validation YAML par un parseur généraliste. Les vérifications navigateur et syntaxiques antérieures restent celles du rapport `.working/verification-prototype.md` ; elles n'ont pas été réexécutées ici.
