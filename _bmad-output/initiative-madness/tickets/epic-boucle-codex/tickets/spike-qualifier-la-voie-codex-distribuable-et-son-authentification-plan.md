---
title: 'Qualifier la voie Codex distribuable et son authentification'
type: 'chore'
ticket: 1
created: '2026-10-23'
status: blocked
baseline_revision: '136e8af405ef9b259f58aa150cf72aa4b3073edd'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/epic-boucle-codex.md', '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md']
blocked_at: "2026-10-23"
blocked_reason: "Distribution du nouveau client local gratuit : admissibilite de cette authentification native a etayer ; nettoyage apres une nouvelle session authentifiee complete a confirmer. Preuve technique partielle conservee, pas de passage a 1.2."
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** Madness dépend d'une voie Codex officiellement utilisable. Le CLI et ses schémas sont présents ; connexion, réseau et échange réel restent à qualifier.

**Approche :** éprouver `codex app-server` natif sous Windows, avec authentification ChatGPT gérée par Codex. Fournir commande reproductible, profil expurgé et conclusion documentée d'éligibilité, ou blocage explicite.

## Boundaries & Constraints

**Toujours :** usage personnel/local, distribution gratuite confirmée, sans service hébergé ; versions et restrictions réellement observées. Profil Codex temporaire hors dépôt, sans copie d'identifiants ; connexion navigateur par le porteur. Paramètres réseau/certificats transmis au seul enfant, sans désactivation TLS. Travail dans ce checkout autorisé malgré les fichiers non suivis préexistants, exclus des commits.

**Jamais :** lecture des fichiers d'authentification par le banc, journal de secrets/identité/variables sensibles, repli API facturée ou fournisseur changé. Pas de starter Electron, workflow BMad, projet utilisateur ni licence open source décidée. Codex conserve la gestion de ses jetons. Un essai local ne prouve ni toute la distribution ni G1 complet.

## I/O & Edge-Case Matrix

| Situation | Attendu |
|---|---|
| Profil vide | Connexion native humaine ; URL affichée uniquement pour la connexion, exclue des preuves |
| Compte absent/API key/autre mode | Aucun tour ; expliquer ou bloquer |
| ChatGPT vérifié | Client Madness identifié, tour témoin borné sur dossier vide en lecture seule |
| Retours corrélés | Réponse et fin `completed` du même tour ; accusé/catalogue seuls insuffisants |
| Erreur, délai, coupure ou demande d'effet imprévue | Refus/arrêt, résultat échec ou inconnu ; aucun réessai automatique |

</frozen-after-approval>

## Code Map

- `scripts/qualification/` : nouveau banc Node sans dépendance npm ; aucune application réelle existante.
- CLI observé : `C:/Users/UP60066553/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js`, version 0.144.6 ; Node 24.13.0. Lancement via Node et arguments séparés, sans shell.
- `_bmad-output/initiative-madness/architecture-madness/.working/codex-protocol-summary.json` : indices uniquement ; 267 exports voisins hors commit. Vérifier les messages effectivement utilisés contre le CLI.
- Architecture : AD-7/AD-9 et G1. Contrats UX conservés.

## Tasks & Acceptance

**Execution :**

- [x] `scripts/qualification/codex.mjs` — environ 150–220 lignes hors tests : détection/version, profil temporaire, JSONL corrélé, délais, connexion native, garde ChatGPT, modèle disponible et court tour témoin. Preuves par champs autorisés ; arrêt des processus et nettoyage du seul espace créé après vérification de sa racine. Aucune connexion existante modifiée.
- [x] `scripts/qualification/codex.test.mjs` — hors réseau : fragmentation/corrélation, identité refusée avant inférence, erreurs/délais, demande imprévue et exclusion des secrets. Fixtures distinctes d'une preuve réelle.
- [x] `_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-codex/profile.json` — versions, plateforme, mode auth, protocole, résultat corrélé, réseau/certificats observés ; capacités prouvées/déclarées/inconnues, sans flux bruts ni identité.
- [x] `_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-codex/qualification-codex.md` — reproduction, intervention humaine, sources datées et limites ; examiner séparément usage local, distribution et authentification. Ambiguïté officielle ou essai négatif bloque 1.1 et ses consommateurs, sans changement implicite de voie.

**Acceptance Criteria :**

- Given le CLI installé, when l'essai démarre, then un profil distinct permet la connexion humaine native sans fuite de secret ni changement de connexion habituelle.
- Given une voie admissible et ChatGPT vérifié, when le tour est envoyé, then réponse et fin réussie corrélées sont prouvées avec versions et conditions réseau observées.
- Given une preuve manquante/négative, when le rapport conclut, then blocage et récupération sont explicites. Seules éligibilité étayée et preuve positive satisfont 1.1.

## Implementation Notes

- 2026-10-23 : le porteur approuve le plan et demande de continuer. Passage ready-for-dev puis in-progress ; travail dans ce checkout confirmé, sans inclure les fichiers non suivis préexistants.

- Réalisation : banc et rapport produits. Vérification parent après corrections de revue : 26 tests réussis, aucun ignoré. Matrice couverte : profil vide (connexion corrélée), compte refusé (apiKey/Bedrock/inconnu), ChatGPT (réponse témoin), retours corrélés (autre tour/accusé seul/notifications groupées), erreurs et effets imprévus (coupure/délai/JSON/refus), annulation pendant préparation et arrêt non confirmé.
- Preuve réelle : ChatGPT et un tour réussi sur gpt-5.6-sol, réseau/certificats acceptés pour cette requête. Le profil historique conserve outcome unknown / cleanup false ; les corrections de fermeture sont vérifiées hors inférence, sans réécrire cette preuve. Distribution et nettoyage d'une nouvelle session authentifiée complète restent ouverts ; 1.1 n'est pas déclarée satisfaite.
- Revue Quick terminée : quatre constats medium vérifiés, quatre corrections locales et cinq régressions ajoutées (dont SIGINT et SIGTERM séparément). Le parent confirme 26/26 et `git diff --check HEAD` sans erreur ; aucune connexion ni inférence relancée. Le contrat figé reste inchangé.
- Présentation : le banc est construit et relu, mais la qualification 1.1 reste insuffisante. Le tableau doit conserver ce ticket bloqué, et non simplement en review/built : l'outil de tickets considère review comme un prérequis satisfait, ce qui ouvrirait à tort 1.2. Aucun consommateur n'est lancé.

## Plan Change Log

## Review Triage Log

| Date | Constat | Verdict | Route | Vérification et correction minimale |
|---|---|---|---|---|
| 2026-10-23 | `codex.mjs:64` — notifications groupées perdues après l'accusé | medium | patch | Reproducteur hors réseau : deux notifications dans un même fragment donnent `item/completed`, puis un délai au lieu de `turn/completed`. Le waiter reste installé jusqu'à une microtâche ; le libérer synchroniquement avant résolution et couvrir ce cas. |
| 2026-10-23 | `codex.mjs:142` — attente d'un enfant déjà fermé avec stderr ignoré | medium | patch | `version()` a déjà reçu close ; stderr vaut null, donc le garde ne reconnaît pas la fermeture. Reproducteur avec enfant fermé : nouvelle attente observée. Traiter un flux absent comme fermé, avec régression. |
| 2026-10-23 | `codex.mjs:178` — annulation pendant la préparation absorbée | medium | patch | Le gestionnaire SIGINT/SIGTERM ne fait rien avant l'affectation de rpc ; les await de préparation précèdent le lancement du fournisseur. Mémoriser l'annulation et la vérifier avant le lancement, avec régression contrôlée. |
| 2026-10-23 | `codex.mjs:156` — parent retenu après un arrêt non confirmé | medium | patch | Après false, le child et ses pipes restent référencés ; exitCode ne suffit pas à libérer la boucle Node. Ce chemin est atteignable, comme l'essai réel d'arrêt non confirmé l'a montré. Libérer les handles du parent avec régression, en conservant outcome unknown et cleanup false. |

Les quatre constats ont des causes distinctes ; aucune lacune d'intention ni modification du contrat approuvé. Quatre corrections locales, sans nouvelle surface publique. Aucun constat rejeté ou différé.
Corrections vérifiées le 2026-10-23 : waiter retiré avant résolution ; flux absents reconnus ; annulation mémorisée avant lancement ; handles du parent libérés après arrêt non confirmé, sans annoncer nettoyage ou arrêt réussis. Les cinq régressions passent dans les 26 tests exécutés par le parent.

## Design Notes

Le 23 octobre, `codex login status` indique ChatGPT pour le profil existant, sans preuve d'inférence. Avertissement sandbox d'alias PATH observé ; ne pas modifier l'installation pour ce seul avertissement.

Sources : [authentification app-server](https://learn.chatgpt.com/docs/app-server#auth-endpoints) et [Sign in with ChatGPT](https://developers.openai.com/siwc/token-sharing-open-source). La seconde voie est distincte ; gratuit ne décide pas d'une licence. Si l'éligibilité exacte de Madness reste insuffisamment établie, consigner l'écart avant tout changement de voie.

## Verification

- `node --test scripts/qualification/codex.test.mjs` : tests déterministes réussis, sans compte/réseau.
- `node scripts/qualification/codex.mjs --live` : connexion humaine puis court échange consommant le quota ChatGPT ; preuves expurgées, sortie non réussie si preuve insuffisante.
- `git diff --check` : aucune erreur ; commit limité au plan, banc, tests et preuves produits.

Contrôler critères de passage et absence de secrets avant commit. La réalisation de 1.2 et la clôture de G1 restent distinctes.
