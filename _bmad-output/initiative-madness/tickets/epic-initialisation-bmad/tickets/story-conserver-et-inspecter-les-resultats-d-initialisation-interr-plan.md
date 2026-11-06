---
title: "Conserver et inspecter les résultats d’initialisation interrompus"
type: 'feature'
ticket: 6
created: '2026-11-06'
status: 'built'
baseline_revision: 'aed3b74fa0ac2353851f1df9cab52702657c8d7f'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="mandat autonome explicite, checkpoints délégués">

## Intent

**Problem:** Une interruption peut laisser des effets et un état d’arrêt inconnus. Le dossier et le reçu doivent rester consultables sans refaire une opération, et un problème de sauvegarde doit garder son propre état.

**Approach:** Raccorder l’inspection volontaire et bornée à la tentative exacte, sur les mêmes propriétaires d’E/S, de cycle de vie et de stockage. Une nouvelle préparation explicite est possible uniquement si une preuve fiable et conservée a libéré l’ancien verrou.

## Boundaries & Constraints

**Always:** Les fichiers observés, le résultat de l’application, la preuve d’arrêt et la sauvegarde sont distincts. L’inspection ne fait que lire, sans modèle, outil projet ni effet, sous l’identité de la tentative originale. Projet/cible/parent/plan exacts, garde chemin et périmètre, provenance et ordre contrôlés. Réouverture passive, aucun ancien accord actif. Une inspection ne suffit à permettre une nouvelle préparation que si l’arrêt était déjà confirmé, que la cible est prouvée intacte sous les mêmes identités et que le reçu d’inspection est durable. La nouvelle préparation revalide le dossier et demande un nouvel accord. Échec de sauvegarde retenté explicitement sans rejouer l’application ou l’inspection. UI FR/EN dans le diagnostic déjà adopté.

**Never:** Déduire un arrêt d’un scan, du verrou d’instance ou de la seule réouverture. Déduire un succès d’une inspection ou d’un résultat inconnu. Relancer, supprimer, réparer, écraser, restaurer ou réessayer un effet automatiquement. Ne pas résoudre un blocage partagé via une inspection. Aucun accès aux données réelles, modification d’authentification, nouveau processus d’outillage, paquet ou campagne globale. Le périmètre 3.4 et le test du paquet exact en 3.9 demeurent.

## I/O & Edge-Case Matrix

| Cas | Entrée | Attendu |
|---|---|---|
| I1 | Interruption après effet possible ou fermeture pendant travail | Arrêt possédé drainé, résultat inconnu si preuve absente. Le marqueur réel se restaure passivement sans relance, accord historique. |
| I2 | Inspection d’un plan partiel/inconnu, fichiers exacts, manquants ou modifiés | Reçu original lié à la tentative. Ajouts confirmés et chemins non confirmés distincts. Un changement de racine/parent ou une lecture non prouvée garde l’inconnu. Aucune écriture cible. |
| I3 | Arrêt déjà confirmé et dossier à nouveau strictement intact | Nouveau plan seulement après inspection sûre durable et nouvel acte volontaire. Sans l’une de ces preuves, le verrou reste. L’issue historique ne devient pas un succès. |
| I4 | Reçu produit en session puis stockage refusé | Résultat en mémoire et avertissement de sauvegarde distincts. Le retry est le seul CAS, sans réinspection, nouvel accord, application ou nouveau PID. |

</frozen-after-approval>

## Code Map

- `src/adapters/bmad/initialization.ts`: réemployer le scanner inventaire borné de 3.4/3.5 et `chain`, `physicalIdentity`, `evidence`. Implémenter le port hôte d’inspection live/restauré via un scanner commun et des faits originaux dans WeakMap, ordre supérieur au dernier fait. L’inspection ne requiert pas la disponibilité du bundle pour comparer les entrées enregistrées. Vérifier la racine physique et le parent avant/après lecture. Observer chemins exacts du plan avec type, taille, hash et garde des liens; classer les manquants ou différents comme non confirmés, aucun autre fichier en sortie. Un inventaire refusé ne fabrique aucune observation. Un dossier intact pour la seule réouverture est exactement le sceau pré-effet 3.5 avec zéro entrée réservée; conserver l’impossibilité de prouver cet état pour les anciens sceaux incompatibles. Distinguer une erreur de fermeture du descripteur propriétaire d’un simple refus d’écriture : pas de stop confirmé si la fermeture a échoué.
- `src/contracts/bmad-initialization.ts`, `src/core/bmad-initialization.ts`: conserver la lecture des reçus v1 antérieurs. Si un indicateur de cible intacte est nécessaire, l’autoriser de façon additive et stricte seulement sur un fait d’inspection original avec arrêt confirmé, couverture complète et aucun ajout. Les chemins non vérifiés appartiennent au plan, sont distincts de ceux confirmés; l’ordre et l’identité exacts restent exigés. `core.inspect()` n’accepte que partiel/inconnu et ne requalifie jamais le résultat ni l’arrêt. Réutiliser le port d’inspection hôte live/restauré et la sauvegarde CAS. `initializationNeedsInspection` doit conserver le verrou du projet et de la cible physique pour tout arrêt inconnu ou état incertain, sauf preuve d’intégrité admissible et durable. Relâcher seulement le verrou de l’ancienne tentative qualifiée au CAS et reconstruire la même règle à la restauration. Aucun clearBlock depuis inspect, aucun effet sur un projet distinct. Les refus de port ne font pas perdre un ancien reçu valide. `retrySave` ne fait que sauver.
- `src/main/index.ts`, `src/preload/index.ts`: réutiliser la frontière initialisation et l’appelant vérifié. Ajouter la requête inspect avec projectId/attemptId/generation/planId/planRevision. Résoudre le projet via application, comparer à la racine prévue et garder la séparation userData. Aucun chemin transmis depuis le renderer. Conserver la fermeture Main/core/hôte/demandes/store et le marqueur durable déjà écrit avant effet. `recovery.status()` consulte l’arrêt inconnu de l’initialisation comme le fait `observeStop()`. L’inspection volontaire en lecture n’appelle pas la procédure de récupération qui annule d’autres propriétaires. Les anciennes preuves sans arrêt natif demeurent inconnues.
- `src/renderer/src/InitializationPanel.tsx`, styles déjà utilisés : bouton « Inspecter les effets » seulement pour tentative admissible, aucune lecture automatique à l’ouverture. Afficher reçu d’inspection, ajouts exacts, chemins non confirmés, couverture, arrêt, blocage et sauvegarde séparés, FR/EN. Focus stable et annonces de phase, chemin/valeurs bruts, retour au même travail. Réutiliser les rôles et divulgations de la finition 3.4. Aucun nouvel écran ou jeton de thème.
- `tests/bmad-initialization-contract.test.mjs`, `tests/bmad-initialization-host.test.mjs`: cas I1–I4, vrais marqueurs en mémoire/annexe sur témoins possédés et contrôles d’hôte sans application lourde supplémentaire. Un témoin de disque refusé, absence de réexécution, inspection explicite et rattachement exact. Conserver la qualification historique 3.4. Ne pas fabriquer un enfant : l’hôte actuel écrit par E/S locales. Représenter interruption par attente contrôlée du port et clôture ciblée. Vérifier au moins un refus d’identité, une inspection partielle et que la preuve sûre en session ne libère qu’après CAS. Réutiliser les doubles et nettoyer les fixtures.

## Tasks & Acceptance

**Execution:**
- [x] Hôte et contrat : produire un fait original d’inspection corrélé, borné et séparé de l’arrêt et du résultat d’application.
- [x] Cœur et IPC : conserver l’incertitude, exposer la seule inspection volontaire, retenter le CAS sans autre effet et libérer uniquement selon la preuve durable exacte.
- [x] Diagnostic FR/EN : consulter les observations et les états, avec la charte actuelle.
- [x] Tests I1–I4 et types, revue Quick ciblée et preuve dans le plan. Pas de paquet pour ce lot.

**Acceptance Criteria:**
- Given une opération interrompue ou un reçu partiel, when le projet rouvre, then il reste possible de lire l’historique sans réactiver l’accord ni relancer le travail.
- Given une inspection explicitement demandée, when elle revient, then la lecture montre les ajouts confirmés et les limites sous la tentative exacte, sans changer le résultat précédent.
- Given un échec de sauvegarde ou un arrêt non attesté, when le porteur retente la sauvegarde ou relit les effets, then le statut reste fidèle aux preuves. Une nouvelle préparation reste bloquée jusqu’à l’état sûr attesté et enregistré.

## Implementation Notes

Diff intégralement relu. I1/I2 vérifiés sur un marqueur checking réellement écrit, interruption par port suspendu, réouverture passive et inspection bornée. I3/I4 vérifiés sur fait d’intégrité natif et CAS refusé puis retenté. Parent : 88/88, zéro saut, types réussis. L’erreur de fermeture du descripteur est relue sans injection native, interface et IPC relus statiquement. Aucun paquet.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Route | Preuve avant correction |
|---|---|---|---|
| Q1 — lecture par fichier pendant le scan | high | patch | Le contrôle final de la racine et du parent ne voit pas la mutation en place d’un fichier préservé après sa propre lecture. Le sceau peut encore être celui d’avant effet. |
| Q2 — couverture complète lacunaire | medium | patch | Le contrôle de partition entière ne s’applique qu’à targetIntact. Un fait ordinaire dit complete malgré des chemins omis. |
| Q3 — arrêt contradictoire restauré | high | patch | La validation conserve un fait ordinaire dont l’arrêt peut contredire l’opération, alors que le cœur refuse ce couple en session. |
| Q4 — reçu précédent après refus | medium | patch | Le motif se perd et le dernier reçu reste visible sans indication que la nouvelle lecture a échoué. |

Q1–Q4 résolus et recontrôlés par le même Quick. La mutation Windows à taille égale après lecture est reproduite puis refusée après le recontrôle des métadonnées. Les preuves de couverture et d’arrêt sont contrôlées et le refus est distinct du reçu précédent. Parent après correction : 90/90, zéro saut, types code 0. La vérification reste non atomique face aux changements externes entre deux appels. Le cas d’erreur native de fermeture de descripteur reste relu, sans injection. Aucun constat différé.

## Design Notes

Le porteur délègue l’exécution. Choix conservateur sous ce mandat : un marqueur restauré sans preuve d’arrêt reste inconnu même si tous les octets sont lisibles. L’inspection expose des observations sans inventer de succès ni d’arrêt. Une libération documentée ne s’applique qu’à la même cible intacte et à l’arrêt antérieurement confirmé. Réutiliser [le parcours 3.2](../../../ux-madness/EXPERIENCE.md#epic3-initialisation-etats) et la finition Impeccable Operate du candidat 3.4. L’implémenteur possède uniquement les chemins de la carte, hors plan, preuves et commit. Tu n’es pas seul dans le dépôt. Préserver les fichiers hors scope, dont tests/bmad-help-boundaries.test.mjs à modification de fins de ligne seulement. Worktree réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, pwsh login:false et route require_escalated lorsque nécessaire, Git core.longpaths=true. Le parent contrôle la revue et la clôture.

## Verification

- `node --test tests/bmad-initialization-contract.test.mjs tests/bmad-initialization-host.test.mjs` et `npm run typecheck`. Cas locaux bornés, aucune suite globale.
- Lire les chemins IPC et la composition du diagnostic. L’essai Electron et les captures utiles seront intégrés au candidat 3.7 ou à la qualification 3.9.
