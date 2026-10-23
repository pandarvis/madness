# Madness — découpage approuvé avec Sofia

État : découpage approuvé par le porteur le 23 octobre 2026, avec création des quatre enveloppes et commit local autorisés. Les epics sont créés ; le premier est raffiné, les trois autres restent à raffiner. Aucun développement n'est démarré.

Le [ticket actualisé](../initiative-madness.md) contient 31 exigences et 8 contraintes. Le [contrat de Winston](../architecture-madness/architecture-madness.md) est adopté sans modification, comme les deux contrats UX. Les réponses confirmées règlent Q1, Q5, Q6 et A2 ; A1 reste une cible proposée et Q2–Q4/Q7 sont des qualifications de réalisation.

## Règle et ordre approuvés

Une frontière correspond à un résultat utilisable, livré dans un paquet Windows. Les modules internes ne créent pas chacun un epic. Les versions intermédiaires annoncent leur périmètre réel ; la V1 complète exige aussi le graphe, puis l'ensemble des preuves G0–G5.

| Ordre | Résultat vérifiable | Exigences possédées | Preuves principales |
|---|---|---|---|
| 1 — Dialoguer réellement avec Codex | Sur un projet de référence, invoquer un workflow BMad, répondre ou approuver, retrouver le résultat et les chemins concernés, puis fermer/réouvrir sans perdre échanges ou brouillon. | R12–R18, R22, R25, R27 | Socle/contrats G0, voie Codex et dialogue G1 ; paquet installable et procédure de reconstruction. |
| 2 — Comprendre et piloter ses projets | Retrouver projets et initiatives, comprendre preuves et états, choisir une action dans le catalogue réel et poursuivre dans le dialogue existant ; lire les fichiers et les ouvrir dans l'éditeur. | R1–R3, R5–R11, R19–R21, R26 | Profil BMad G2, retours d'ouverture éditeur pour G3, contrats étendus Sally et contrôles des variantes/accessibilité. |
| 3 — Initialiser et vérifier Windows | Initialiser un dossier non équipé en comprenant le plan et son résultat ; démontrer aussi l'annulation intacte et les parcours complets sur machine cible. | R4, R23–R24 | Initialisation G3, qualification intégrée G4, avec les acquis des epics 1–2. |
| 4 — Explorer le graphe du projet | Générer, explorer/rechercher et rejoindre les fichiers du graphe, en comprenant provenance, incertitude, fraîcheur et problèmes. | R28–R31 | Contrat d'analyse avant consommateurs, UX Sally/Impeccable avant UI, runtime et intégration Graphify G5 dans le paquet Windows. |

Le [manifeste approuvé tickets.toml](../tickets/tickets.toml) conserve les identifiants 1–4. Chaque exigence a un propriétaire principal unique. Les contraintes et les contrats adoptés s'appliquent aussi aux incréments précédents : posséder R21 ou R26 en epic 2 ne dispense pas les autres surfaces de préserver accessibilité, langue ou thème une fois ces capacités livrées.

## Premier chemin réel et risque à lever

Le premier epic commence par les contrats et le socle nécessaires à ses consommateurs, puis prouve la voie d'authentification Codex officiellement utilisable dans Madness. Son premier chemin traverse la fenêtre, le pont métier, le cœur, le connecteur et la persistance : ouvrir le dossier BMad de référence → invoquer un workflow → lire une question et y répondre → constater une fin de tour et ses fichiers → retrouver le contexte après réouverture.

La compatibilité du profil BMad de référence nécessaire à cette preuve appartient aussi à l'epic 1 ; la couverture des installations et cas de diagnostic de G2 appartient à l'epic 2. L'aperçu complet des livrables et l'ouverture éditeur sont livrés par l'epic 2. La preuve Codex précède l'élargissement de l'interface ; une fenêtre ou un export de schémas ne la remplace pas.

## Dépendances et propriétaires

| Unité ou travail transversal | Propriétaire | Consommateurs et limite du passage |
|---|---|---|
| Electron, preload, composition, paquet Windows, procédure de montée de version | Epic 1 | Les epics 2–4 réutilisent le paquet et les commandes de reconstruction, puis vérifient leur propre intégration. |
| Contrats communs, contexte, coordinateur et persistance locale | Epic 1 | G0 les établit avant les consommateurs ; le port d'analyse et GraphSnapshot sont ajoutés sous cette même propriété du cœur par l'epic 4 avant ses consommateurs. |
| Codex : transport, authentification, capacités et dialogue | Epic 1 | L'epic 2 fournit catalogue, recommandation et entrées d'action ; l'epic 1 possède le lancement et les retours effectifs. Aucun catalogue codé en dur n'est nécessaire à la preuve de référence. |
| Projets, preuves, diagnostic BMad, catalogue, fichiers et éditeur | Epic 2 | L'epic 1 qualifie seulement le profil de référence requis par G1 ; l'epic 3 consomme le diagnostic et étend l'adaptateur pour l'initialisation ; l'epic 4 réutilise le panneau de fichiers. |
| Contrats UX communs, anglais/sombre et cohérence accessible | Epic 2 avec Sally/Impeccable | Base française claire déjà acceptée pour l'epic 1. Les extensions sont conçues avant leurs implémentations ; chaque epic vérifie ses propres surfaces, sans certification WCAG présumée. |
| Outillage d'initialisation BMad consommé et effets vérifiés | Epic 3 | Même contexte, plan/consentement et résultats connus/inconnus que les contrats précédents ; aucune réinstallation implicite. |
| Trois parcours Windows réels, remplacement et contrôle intégré G4 | Epic 3 | Réunit les capacités des epics 1–2 avec l'initialisation ; les tests déjà obtenus restent des acquis, les parcours élargis sont vérifiés. |
| Graphify, runtime Python, normalisation et vue Graphe | Epic 4 | Contrat possédé par le cœur, décodage par l'adaptateur, ressources UI locales. Sally conçoit cette nouvelle vue ; G5 comprend le paquet final et ses limites. |

La chaîne approuvée est 1 → 2 → 3 → 4 : elle suit des contrats ou capacités nécessaires et évite que plusieurs epics non ordonnés modifient les mêmes frontières. Le besoin « graphe après la base Windows/Codex » est respecté. Les préparations UX peuvent être discutées avant la réalisation du module ; elles ne valent pas capacité livrée.

## Questions conservées

- A1 : WCAG 2.2 AA reste une cible proposée ; les comportements accessibles décrits sont exigés, aucune conformité auditée n'est annoncée.
- Q2/G1 : démontrer la voie Codex et son authentification pour un produit distribué — epic 1.
- Q3/G2 : établir les formats et fonctions BMad réellement pris en charge — epic 2, après qualification du profil de référence dans l'epic 1.
- Q4/G3 : vérifier plan d'initialisation, consentement, effets et retours d'éditeur — preuves réparties entre epics 2 et 3, clôture G3 par epic 3.
- Q7/G5 : qualifier runtime, paquet, confinement, format, fidélité et comportement Graphify — epic 4.

Les décisions encore ouvertes de distribution et compatibilité nommées dans Deferred du contrat sont réglées avant les usages ou diffusions concernés. Gratuit ne fixe pas la licence ; preview autorisée ne prouve pas la compatibilité du proxy. Claude Code et Copilot restent les connecteurs suivants, déjà prévus par le contrat commun.

Les quatre epics sont créés avec leur résultat, leurs limites et leurs références. Le commit local de ce cadrage est autorisé. Le premier epic est raffiné depuis les seules exigences parent couvertes. La prochaine étape recommandée est de proposer ses stories ; leur création et leur lancement restent des étapes distinctes.
