---
title: "Interrompre et récupérer sans rejouer un effet incertain"
type: 'feature'
ticket: '7'
created: '2026-10-27'
status: 'built'
baseline_revision: '2f1bfbfa52aa6a548990790e5329210df524f3fc'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Après une interruption, le développeur ne sait pas ce qui est arrêté, vérifiable ou relançable ; l’aide réseau est cachée.

**Approach:** Guider la récupération dans le projet : arrêt observé, inspection locale des effets incertains, puis nouvel échange explicite selon les capacités. Afficher le lien réseau et sa vérification sans envoyer de message.

## Boundaries & Constraints

**Always:** AD-4–7 ; contexte/tour/demande capturés, verrous avant await et résultats tardifs isolés. Arrêt demandé distinct d’arrêt confirmé ; STOP_UNCONFIRMED reste bloquant après redémarrage. Métadonnées privées versionnées : réobserver/arrêter seulement le processus possédé dont l’identité OS est prouvée ; identité/stockage inconnus bloquent. Anciennes attentes inactives, textes conservés. Relire tous les fichiers d’un accord incertain accepté : racine canonique, protections et bornes1.6. Observation locale datée, éphémère, distincte du résultat natif unknown. Avant départ/envoi avec effets, exiger l’inspection puis revérifier fraîcheur et prérequis ; mélange/divergence/accès refusé bloque. Lancement explicite, sans historique ni brouillon transmis.

**Never:** Reprise d’un thread fermé, rejeu de message/accord/patch ou workspace Forge ; capacité supposée, reset du verrou, succès déduit des octets, PID fourni par le renderer. Inspection sans écriture projet. Aucun secret/callback/URL arbitraire, cookie, redirection suivie ou TLS assoupli. Le GET des clés n’appelle ni coffre, OAuth, refresh, probe ni modèle ; ne signifie pas Codex vérifié. Snapshot v1, six méthodes madness, pilotes et palette conservés ; refonte globale exclue.

## I/O & Edge-Case Matrix

| Cas | Entrée | Attendu | Échec |
|---|---|---|---|
| Arrêt | Tour/question/accord actif | Attentes invalidées, saisies gardées, fermeture observée | Non confirmé : bloqué, réobserver sans cibler un autre processus |
| Inspection | Ancien accord accepté incertain | Tous fichiers comparés avant/après ; historique inconnu | Mélange, conflit, lien ou accès : aucun effet |
| Nouveau départ | Inspection puis lancement explicites | Prérequis frais, nouvelle conversation ; nouvel accord requis | Modification/concurrence/contexte changé refusés |
| Réseau | Échec du lancement | URL fixe, Ouvrir/Copier, Vérifier l’accès | Échec/annulation sans nouveau message ni perte |
| Restauration | Fermeture/coupure | Historique et brouillons, aucun moteur | Aucun contrôle ancien réactivé |

</frozen-after-approval>

## Code Map

- `src/core/dialogue.ts`, `ports.ts` : stopSession/blocked ; garder seulement le contrôle d’arrêt possédé, jamais turn.
- `src/adapters/codex/{dialogue,owned-run}.ts`, `src/adapters/persistence/recovery-store.ts` : propriétaire conservé même si open échoue ; stockage versionné et identité/fermeture Windows. Spike local réussi dans qualification-recovery/windows-process-identity-spike.json.
- `src/adapters/codex/{dialogue,file-proposals}.ts` : thread éphémère ; extraire la lecture sûre, jamais appliquer un diff.
- `src/adapters/codex/{oauth,connection}.ts` : getKeys avant rotation ; utilitaire réseau séparé de verify facturable.
- `src/contracts/{dialogue,connection}.ts`, Main/preload : corriger NETWORK_UNAVAILABLE perdu, commandes fermées sans chemins venant du renderer.
- `src/renderer/src/{App,ApprovalPanel}.tsx` : aide actuellement limitée au panneau connexion ; réutiliser ses actions fixes.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/{dialogue,connection,recovery}.ts`, `src/core/{ports,dialogue}.ts` : projections/capacités, inspection et gardes fraîches.
- [x] `src/adapters/codex/{dialogue,owned-run,file-proposals,oauth,connection}.ts`, `src/adapters/persistence/recovery-store.ts` : arrêt durable, inspection et GET strict ; bail protégé des callbacks anciens.
- [x] `src/{main,preload}/index.ts` : composer les ports et valider commandes/réponses.
- [x] `src/renderer/src/{App,ApprovalPanel,RecoveryPanel,NetworkHelp}.tsx`, `strings.ts`, `styles.css` : guidage, clavier/focus, ARIA uniques, actions compactes ; Impeccable ciblé.
- [x] `tests/recovery*.test.mjs`, tests connexion/dialogue existants, `scripts/qualification/recovery.mjs`, `docs/development.md` : matrice, coupure et conservation, profils nettoyés.

**Acceptance Criteria:**
- Given un accord interrompu, when arrêt/inspection/nouvel échange, then aucune ancienne autorisation rejouée et les effets incertains restent distingués des observations.
- Given un lancement bloqué, when Ouvrir/Copier/Vérifier l’accès puis réouverture, then contexte et brouillons restent disponibles sans lancement implicite.

## Implementation Notes

Implémentation et matrice vérifiées avant revue : arrêt, inspection, nouveau départ, réseau et restauration ont chacun des tests exécutés et réussis dans `../qualification-recovery/tests-final.log` (262/262, concurrence2), complétés par les bancs compilé9/9, paquet9/9 et natif7/7. Les deux retouches rédactionnelles Impeccable ont leur recontrôle ciblé4/4 ; vérification globale parent après revue. Aucun modèle externe ni compte dans ces bancs ; installation personnelle distincte. Rapport complet `../qualification-recovery/implementation-validation.md`.

Vérification finale parent après Q1–Q3 :270/270, types/build/installateur, compilé9, paquet9, natif7 et Windows5 réussis. Remplacement personnel réussi,27 empreintes identiques ; restauration installée6/6 sans moteur et compte lisible. Rapports finaux `../qualification-recovery/parent-verification.md` et `recovery-artifact.json`. Fenêtre de contrôle fermée, aucun nouveau témoin personnel ajouté. Gates et refonte globale conservés.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Preuve vérifiée et route |
|---|---|---|
| Q1 — arrêt partagé sur erreur de qualification | high | `schedule` appelle `stopSession` pour une erreur locale ; sans contrôle dialogue, celle-ci appelle le récupérateur commun. Le bouton Vérifier ce projet reste disponible pendant `connectionBusy`. Le témoin partagé peut donc être terminé sans demande d’arrêt. `patch` : réserver la réobservation partagée à l’action explicite, sans nouvelle surface publique. |
| Q2 — récupération du témoin invisible avant redémarrage | medium | `CodexConnection.work` publie STOP_UNCONFIRMED sans mettre à jour la projection dialogue ; le panneau récupération n’utilise que cette dernière. Les actions connect/verify sont alors désactivées et aucune action de réobservation n’est exposée dans le panneau connexion. `patch` : rendre l’action existante accessible sur ce blocage, sans lancement ni reconnexion implicite. |
| Q3 — verrou du propriétaire après attente | medium | `begin` évalue locked puis attend status avant de le poser ; des appels concurrents peuvent franchir ensemble ce contrôle, malgré la file d’écriture. Violation de la contrainte explicite de verrou avant attente. `patch` : acquérir le verrou avant l’attente de statut, conserver le rejet et la libération existants. |

Q1–Q3 corrigés par le même implémenteur et recontrôlés résolus par le même relecteur, sans nouvelle chasse générale ; preuve `../qualification-recovery/review-quick.md`. Tests ciblés annoncés20/20,8/8,2/2 ; contrôle global final séparé chez le parent. Aucun constat de cette revue différé.

## Design Notes

L’implémenteur possède code/tests/bancs/docs de ce lot ; parent seul pour compte réel/installation/revue. Il n’est pas seul : préserver et intégrer les éditions d’autrui. Workflow actif : ne pas rerendre Build. Mandat autonome validé ; fichiers gérés et références privées préservés.

## Verification

Matrice/courses, suite complète concurrence2, types/build/paquet ; bancs compilé/paquet desktop/compact sombre/clair, deux inspections groupées maximum puis finition Impeccable fraîche. Vrai runner loopback sans compte pour coupure/inconnu ; passage personnel borné seulement pour capacité nouvelle. Remplacement/restauration sans moteur, données conservées ; archiver les seuls témoins après contrôles. Aucun gate distribué déduit.
