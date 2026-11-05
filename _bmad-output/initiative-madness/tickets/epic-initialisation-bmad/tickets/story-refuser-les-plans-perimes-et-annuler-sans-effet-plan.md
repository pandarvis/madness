---
title: "Refuser les plans périmés et annuler sans effet"
type: 'feature'
ticket: 5
created: '2026-11-06'
status: 'built'
baseline_revision: '34a90358e820c98d37728d7d5fd3989564e0d679'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="mandat autonome renouvelé, checkpoints délégués">

## Intent

**Problem:** Un plan d’initialisation doit rester exact jusqu’au premier effet. Un doublon, une annulation ou une réponse d’une consultation fermée ne doivent jamais substituer l’accord ou agir sur un autre plan.

**Approach:** Compléter la même voie locale 3.4 avec des refus stables et expliqués. Garder le dossier intact lorsque le refus ou l’annulation précède l’effet, et demander une préparation explicite après péremption.

## Boundaries & Constraints

**Always:** Capturer la cible physique et les préconditions avec le dossier, le parent, les entrées préexistantes, le profil et le payload exacts. Recontrôler avant l’effet. Un accord consommé ne repart jamais. Un doublon refuse en conservant la tentative courante. Un changement de projet, d’onglet ou une fermeture rattache l’annulation pré-effet à la seule tentative concernée. Refus explicites et explications FR/EN dans le diagnostic. Les preuves historiques restent consultables avec accord inactif.

**Never:** Écraser, réparer ou réinstaller implicitement, fabriquer un résultat sans effet après une écriture possible, ni interrompre une application en fermant la consultation après dispatch. Garder la portée Windows et les limites de la 3.4, sans promesse contre une course externe après le dernier contrôle. Pas de nouveau paquet, réseau, projet personnel, dépendance, qualification G3 ou campagne globale dans ce lot. Reprise et inspection après interruption restent en 3.6.

## I/O & Edge-Case Matrix

| Cas | Situation | Attendu |
|---|---|---|
| R1 | Fichier existant remplacé avec les mêmes octets, ou cible/parent/profil modifié | L’ancienne autorisation est périmée et zéro ajout n’est effectué. |
| R2 | Collision, ressource absente ou intégrité refusée | Refus avant plan utilisable ou effet. Motif actionnable sans exposer de chemin arbitraire. |
| R3 | Annulation pendant une vérification suspendue, ou refus/fermeture d’un plan prêt | Ancien accord inactif. Aucun appel d’application. La nouvelle tentative exige une nouvelle décision. |
| R4 | Double préparation pendant qu’un plan existe ou réponse tardive après navigation | BUSY conserve le plan existant. L’annulation vise le seul identifiant d’opération capturé. |

</frozen-after-approval>

## Code Map

- `src/adapters/bmad/initialization.ts`: l’inventaire empreinte les identités dev:ino des répertoires, mais seulement les octets des fichiers. Réemployer le descripteur et les stat déjà vérifiés dans readBounded pour ajouter l’identité des fichiers au sceau privé d’inventaire. Conserver le manifeste DTO, les bornes et le contrôle d’union. Ne pas multiplier les scans. Distinguer absence effective de ressource et intégrité refusée sur le profil déjà épinglé.
- `src/core/bmad-initialization.ts`: prepare remplace actuellement une tentative ready du même projet. Retourner BUSY tant qu’elle est active, sans la révoquer. Lors d’un BUSY sur cible physique déjà tenue, ne pas stocker de faux échec qui consommerait un reçu. Préserver les gardes de cancellation 3.3, les origines des faits, le marqueur durable, les verrous d’incertitude et le port existant. Exposer les seuls codes locaux reconnus dans les motifs de refus sans fuites d’erreurs brutes.
- `src/contracts/bmad-initialization.ts`, `src/main/index.ts`, `src/preload/index.ts`: si nécessaire ajouter à la réponse IPC de prepare un petit identifiant de tentative exact produit par son propre retour du cœur, nul pour refus et autres commandes. Valider enveloppe et corrélation, appartenance au projet, génération et présence dans l’état retourné. Le renderer ne déduit pas l’auteur depuis latest. Dans assertFresh distinguer une collision observée et une cible différente. Ne jamais affaiblir les contrôles appelant/racine ou le diagnostic G2.
- `src/renderer/src/App.tsx`, `src/renderer/src/InitializationPanel.tsx`: fermer la consultation au changement réel d’onglet en plus du projet/page. Ne pas déplacer le focus vers une vue quittée. Garder l’identité consultée exacte lors du démontage, et n’annuler après une réponse de prepare tardive que sa propre tentative. Ne pas annuler un plan voisin après BUSY ou lorsqu’on consulte un résultat historique. Après effet la fermeture masque seulement la consultation. Relire volontairement le diagnostic lorsqu’aucune action n’est active. Préciser les motifs avec la copie FR/EN actuelle et préserver la finition 3.4.
- `tests/bmad-initialization-host.test.mjs`, `tests/bmad-initialization-contract.test.mjs`: cas ciblés. Pour R1, déplacer le fichier vers un nom temporaire *dans la cible*, recréer ses octets sous le nom d’origine pendant que l’ancien inode existe, puis retirer le nom temporaire. Tester deux refus de ressource/collision et l’annulation avec une attente contrôlée, sans ajouter une longue intégration. Réutiliser les tests précédents de portée et IPC, et vérifier le nouvel accusé de préparation. Fixtures temporaires possédées à nettoyer. Prouver les régressions spécifiques avant/après.

## Tasks & Acceptance

**Execution:**
- [x] Adaptateur et cœur : corriger l’identité privée, les motifs, l’admission des doublons et la causalité de l’annulation.
- [x] Main/preload/renderer : transmettre la tentative exacte et fermer proprement le diagnostic au changement de travail.
- [x] Tests ciblés et note de vérification : R1–R4, types et revue Quick. La matrice sur paquet exact reste à la campagne 3.9.

**Acceptance Criteria:**
- Given un plan prêt, when une précondition a changé ou le profil ne peut plus être vérifié, then l’accord est refusé avant tout ajout et le diagnostic explique la reprise explicite.
- Given un plan actif, when une seconde préparation ou une réponse tardive arrive, then la première tentative reste seule compétente et aucun autre plan n’est annulé.
- Given une vérification pré-effet annulée ou une vue quittée, when le travail revient, then le plan exact reste inactif et aucun accord ancien n’est appliqué.

## Implementation Notes

Diff relu intégralement. R1–R4 couverts par les contrôles d’hôte et de contrat, avec vérification statique de la navigation. Exécution indépendante du parent : 80/80, zéro saut, deux TypeScript valides. Le worker a reproduit les défauts sur le code antérieur et corrigé une synchronisation de fixture et une borne de validation de l’accusé. Aucun paquet ou scénario externe.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Route | Preuve avant correction |
|---|---|---|---|
| Q1 — fermeture avant accusé | high | patch | Le panneau ne connaît la tentative qu’après l’accusé. Le cœur peut publier ready pendant sa sauvegarde et une nouvelle consultation peut montrer le plan à autoriser entre-temps. |
| Q2 — remontage du même plan | medium | patch | L’arrivée depuis Voir le plan change la clé du panneau, et le démontage annule le plan exact que l’utilisateur demande à lire. |
| Q3 — reprise sur racine remplacée | high | patch | Le verrou physique de l’ancienne racine ne suffit pas pour le même projet avec résultat partiel ou inconnu encore non inspecté. La projection peut proposer de préparer à nouveau. |

Q1–Q3 corrigés par l’implémenteur et recontrôlés résolus par le même Quick. Annulation corrélée avant accusé, conservation du panneau à identité stable, blocage du projet avec résultat non inspecté. Vérification parent après correctifs : 84/84, zéro saut, types code 0. Cas hôtes Windows isolés, navigation relue dans le code. Essai Electron sur paquet exact reporté à 3.9. Aucun constat de revue différé.

## Design Notes

Réutiliser [contrat UX 3.2](../../../ux-madness/EXPERIENCE.md#epic3-initialisation) et [preuve 3.4](../qualification-tracer-initialisation-finale/parent-verification.md). Il s’agit de l’extension fonctionnelle des états et libellés actuels, avec le dessin déjà adopté. Le porteur a explicitement délégué les décisions d’exécution. Seul le code et les tests de la carte ci-dessus appartiennent à l’implémenteur. Tu n’es pas seul dans le dépôt, conserve les autres changements, dont tests/bmad-help-boundaries.test.mjs uniquement fins de ligne. Le parent tient le plan, les preuves et le commit. Worktree réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness. PowerShell pwsh, login:false, workdir explicite et route require_escalated lorsque nécessaire. Git core.longpaths=true.

## Verification

- `node --test tests/bmad-initialization-contract.test.mjs tests/bmad-initialization-host.test.mjs` puis `npm run typecheck`. Exécuter seulement ces contrôles, sans nouveau paquet.
- Relire les chemins IPC et UI exacts. Reporter les cas intégrés sur candidat final à 3.9 en les distinguant des résultats ciblés.
