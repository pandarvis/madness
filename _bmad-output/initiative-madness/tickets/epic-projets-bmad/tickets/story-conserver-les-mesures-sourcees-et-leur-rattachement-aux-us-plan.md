---
title: 'Conserver les mesures sourcées et leur rattachement aux US'
type: 'feature'
ticket: '11'
created: '2026-11-05'
status: 'built'
baseline_revision: '126e15962c9efe6317a0e52c826308b6a2638ba9'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick', 'high-independent']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-parcours-mesures-us/contrats-et-couverture.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
---

<frozen-after-approval reason="intent approuvé sous mandat humain autonome — modification seulement par renégociation humaine">

## Intent

**Problem:** Madness ne conserve actuellement ni rattachement à une story qualifiée, ni chronologie durable des tours ; les consommateurs2.13 ne peuvent afficher une mesure sans l’inventer ou modifier les historiques.

**Approach:** Ajouter sous l’autorité du cœur un contrat métriques versionné, une qualification privée du type/occurrence story, des reçus monotones corrélés depuis le connecteur, un cumul sans doubles comptes et une annexe durable atomique. Fournir aux futurs contrôles2.13 les commandes/références sûres, sans nouvelle interface dans11.

## Boundaries & Constraints

**Always:** Appliquer D1–D6 de2.10 et l’extension normative epic2-metrics de Sally2.12. Choix d’une seule story qualifiée, explicite et facultatif avant chaque nouveau tour, transmis par référence opaque corrélée à l’envoi exact ; absence = non attribué, aucun choix global implicite ou réutilisation du précédent. Entrée sans feuille admissible, identité/occurrence et ContextRef complet capturés ; questions/approbations restent dans leur tour. Source/type/preuve recontrôlés avant effet. Mesurer ACK reçu→terminal corrélé reçu, ou arrêt confirmé avec instant effectivement prouvé, dans le même domaine monotone ; attentes/outils inclus, préparation/drain/sauvegarde exclus. Les bornes et leur rattachement doivent être conservés pour une durée close durable. État fonctionnel, arrêt propriétaire et mesure restent indépendants. Données manquantes, conflits, couverture partielle et historique non instrumenté explicites. Snapshotv1, progression publiquev1, conversations/brouillons et autres annexes restent compatibles ; toute restauration/lecture est passive.

**Never:** Nouvelle UI/TSX/CSS, thème/palette/asset, fournisseur/auth/API/coût, nouveau modèle/appel réseau externe, profil personnel ou installation. Pas de durée native/usage/coût numérique non qualifié, prix API/abonnement ou redistribution d’agrégat compte ; indisponible n’est pas zéro. Pas de rétro-calcul Snapshotv1, timestamp mural/timeout/fichier comme durée, premier reçu arbitraire, réattribution par navigation, plan/nom comme type story. Pas de moteur/voie native/permission supplémentaire ; DialogueCoordinator reste seul exécuteur. Ne pas importer les reducers privés ni réécrire les preuves/161pins historiques de2.10 pour faire passer le futur produit. Aucun gate humain/WCAG/G2–G5 acquis par le banc local.

## I/O & Edge-Case Matrix

| Cas | Entrée / état | Sortie / comportement attendu | Échec / récupération |
|---|---|---|---|
| T1 Type et autorité | Entrée story sans feuille ; feuille/entrée concordantes ; v1 sans preuve ; spike/@file/type absent/étranger/duplication | Références résolues côté cœur depuis preuve privée scellée, type/ligne/source/hash/identité physique attestés ; v1 lisible mais sans type qualifié | Refuser choix non qualifié/ambigu, pas de chemin/type/contexte fourni par renderer pris comme autorité ; tour non attribué possible |
| T2 Occurrence | Titre/révision seuls changés ; absence complète puis retour ; collecte partielle/refusée ; move/rupture physique/réemploi détecté | Même occurrence si continuité prouvée ; nouvelle lors de rupture observée ; aucune suppression déduite d’une couverture partielle | Limite des réemplois silencieux/non observés explicite ; racine remplacée ou initiative différente séparées |
| T3 Capturer | Deux projets/initiatives/conversations/US, choix retiré/changé, double envoi, retour tardif ; question/réponse et send-adjustment | Contexte/preuve/occurrence figés avant ACK et revalidés au point d’effet ; choix explicite consommé seulement pour l’envoi corrélé ; prochain tour sans héritage | Pas de rattachement après ACK ou depuis la navigation ; question conserve tour, adjustment est nouveau tour ; saisie/contexte étrangers non déplacés |
| T4 Réception | ACK1000/terminal601000 ; mêmes instants ; même chunk avec callback ACK bloqué et drain lent ; failed/interrupted | 600000ms ou vrai0 connu ; timestamps privés pris dans réception RPC avant continuation/file, terminal communiqué avant drain ; résultat fonctionnel distinct | Mauvaise corrélation/domaine/ordre/non-fini/natif forgé ne produit aucune durée close ; préparation et traitement après terminal non comptés |
| T5 Arrêt et incertitude | close natif estampillé+possession fermée confirmée ; simple stopped/clic/timeout/crash/sans ACK/end ; terminal connu puis drain/arrêt échoue | Endpoint close retenu seulement si corrélé et confirmé ; sinon inconnu. Terminal déjà prouvé ne s’efface pas à cause du drain/arrêt ultérieur | Pas de date après await stopNative ni de reconstitution à la réouverture ; STOP_UNCONFIRMED et gardes livrées conservés |
| T6 Déduplication | Reçu répété, retards/réordonnancement admissible ; même identité native dans exécution/conversation mais références locales différentes ; charges/US contradictoires | Un tour distinct une fois ; pas de duplication via nouvel id local ; conflits explicites, attribution contradictoire non attribuée et intervalle non promu arbitrairement | Résultat indépendant de l’ordre pour doublons/conflits ; garder provenance des contradictions sans choisir la première US |
| T7 Cumul | Tours distincts parallèles10+10min ; domaines distincts ; un clos10min+deux inconnus ; tous inconnus ; aucun identifié | 20min cumulées/chevauchement prouvé ou inconnu ;10minconnues/partiel/1connu2inconnus ; indisponible si tous inconnus ; aucune activité identifiée ≠0 | Périmètre/US/occurrence/conversation conservés ; pas effort/calendrier ni couverture de toute activité externe supposée |
| T8 Durabilité | Échec écriture/rename/CAS, ACK lent/ancien write tardif, terminal pendant write/fermeture ; JSON futur/corrompu/liens | Dernier corps effectivement sauvé seul durable, RAM conservée avec erreur ; génération empêchant promotion tardive ; registre+mesures cohérents atomiquement | Ne pas écraser conflit/futur ; fermeture attend writes admis ; réessai sauvegarde seul sans appel fournisseur/rejeu. Bornes non durables inconnues après retour |
| T9 Reprise et absence | Fermer/rouvrir réels fichiers témoin, ancien Snapshot/annexes sans mesure, source disparue | Mêmes reçus durables/provenance/cumuls, historique sans mesures explicitement inconnu ; source capturée conservée sans la présenter courante | Aucun modèle/compte/helper/collecte réseau ou rattachement rétroactif à la lecture ; permission refusée explique portée |
| T10 Frontières et intégration | Commandes malformées/usurpées, envoi legacy, annexe étrangère, ressources progress repinnées | IPC métier strict/validé, anciennes commandes sans choix non attribuées ; provider/thread/tour locaux/natifs corrélés, pas nouveau pouvoir renderer | Refus avant effet ; Mary/Forge/aide/questions/approbations/arrêt/catalogue/reprise continuent leurs autorités ; coût/usage/natif restent indisponibles |

</frozen-after-approval>

## Code Map

- `resources/bmad-help/progress.py:155–179,214–239,274–285,370–388` : types déjà lus puis jetés ; fichiers/identités/octet et seconde garde disponibles. Émettre `_storyEvidence` interne versionnée liée aux déclarations existence ; inclure dans état scellé/revision. Garder le résultat public v1 exact. Source.id hash chemin et revision de lecture ne sont pas une occurrence durable.
- `src/adapters/bmad/help.ts:27–43,85–89,120–125` : réemployer WeakMap filesAuthority/dependencies ; extraire/valider la clé privée avant spread, attacher à l’objet original ; ancienne preuve absente/unknown n’accorde aucune qualification. `worker.py:386–391` transmet déjà les clés : pas de nouveau module/launcher Python nécessaire.
- `src/core/bmad-progress.ts:57–63`, `src/main/index.ts:200–202` : transmettre au consommateur interne l’autorité originale admise avant read()/structuredClone. Ne pas ajouter field:type au contrat public : projectBmadProgress traite actuellement les autres champs comme statuts. Admission sur déclarations brutes (entrée/feuille) ; doublons et @file refusés avant fusion de projection.
- `src/core/bmad-context.ts:26–40` : consultSelection/assertFresh et racine physique/contextRevision ; réutiliser leurs gardes avant effet. Registre métrique possède les occurrences par projet/racine/initiative/conteneur/id, sources physiques et continuité observée. Absence exige observation complète du périmètre ; une collecte partielle n’est pas disparition. Révision/titre seuls ne créent pas nouvelle occurrence.
- `src/adapters/codex/dialogue.ts:64–100` : DialogueRpc data/receive résout ACK puis peut mettre terminal en file dans le même chunk. Estampille privée locale dans receive avant resolve/queue, transportée hors payload fournisseur ; ne pas lire l’horloge seulement dans continuation308–310/335–343. Réponse start et notification terminal corrélées/validées avant remise au cœur, avant drain/settlement.
- `src/core/ports.ts:18`, `src/contracts/dialogue.ts`, `src/core/dialogue.ts:297–305,371–376` : seam de reçus ACK/terminal avec run/session/thread/tour et domaine, port de capture story opaque avant nouveau tour. turnSequence repart à0 et ne suffit pas à dédupliquer ; pas de réutilisation de help.nativeTurn spécifique. Questions186–214 ne créent pas un tour ; send-adjustment155–157 en crée un. Les commandes existantes sans choix restent admissibles et non attribuées.
- `openCodexDialogue`/`cleanup`403–412/spawn422–423, `probe.ts:131–149` : observer child.close dès spawn avec même horloge/domaine ; n’admettre sa borne qu’avec fermeture possédée prouvée (ownedRun.closed). Déjà sorti/sans observation/récupération après réouverture ou stopped seul n’apportent aucune borne. Ne pas dater après stopNative/stockage/nettoyage. Préserver contrôleJob/descendants/unknown existants.
- `src/adapters/persistence/bmad-help-store.ts:9–47` et `bmad-context-store.ts:8–16` : modèle strict/versionné borné, chaîne sans liens, CAS des octets antérieurs, temporaire exclusif sync/rename, conflit préservé. `src/core/bmad-help.ts:35–57` : génération écritures tardives. Nouvelle annexe métriques par projet, registre+reçus atomiques, références aux conversations possédées par Application ; ne pas dupliquer leurs textes/autorité. Un port cœur unique sérialise et expose erreur/étatdurable séparés. Snapshotv1 inchangé.
- `src/core/application.ts:89–110` : dialoguePersist reste propriétaire des conversations. `core/dialogue.ts:400` fermeture attend aussi writes métriques admis. Main266–290 compose les ports/IPC strict, preload62–77 et renderer/env.d.ts n’exposent que commandes métriques versionnées et références opaques ; aucun nouveau TSX/CSS.
- Pins : `src/adapters/bmad/help-manifest.ts:17` pour progress.py ; ressources existantes electron-builder.yml15–16. Préférer extraction TS et pas worker/launcher nouveau ; si réellement touchés, repinner exactement allowlist/manifest sans changer sources non concernées. Audits bmad-progress.mjs27, bmad-refresh-audit.mjs10, project-files.mjs53 à vérifier seulement pour helper modifié. Les index/protected sources2.10 restent historiques immuables, ne pas les réactualiser.
- Tests existants : bmad-progress-review/protocol/core, bmad-context, dialogue-protocol88–100/136–145, dialogue49–69, bmad-help-persistence-race9–46 ; réutiliser fixtures locales, vrais stores, transports JSONLloopback et possession/cleanup. Enquêteurs lecture seule metrics211_identity_map et metrics211_timing_store_map sur baseline126e159… ; aucune recherche codebase applicable, aucun Build concurrent.
- UX : `EXPERIENCE.md#epic2-metrics` du workspace UX adopté (six sous-sections et Sam, uniquement cette extension nécessaire) et D1–D6 au context ; pas de redécouverte UX/Impeccable dans ce lot backend. 2.7/2.9/2.10/2.12 et architecture déjà lus pour continuité, pas de réouverture de leurs plans.

## Tasks & Acceptance

**Execution:**
- [x] Tests de comportement d’abord — appliquer `C:/Users/UP60066553/.codex/plugins/cache/claude-plugins-official/superpowers/7.0.0/skills/test-driven-development/SKILL.md` et son `writing-good-tests.md` avant code produit : observer le rouge attendu puis correction minimale. Oracles sur résultats/effets réels, pas sur mocks/helpers ou copie de l’implémentation ; conserver les rouges utiles au rapport. Aucun besoin de nouveau framework de test.
- [x] `src/contracts/us-metrics.ts` et `src/core/ports.ts` — types/validateurs/commandes/états d’identité qualifiée, occurrence, choix opaque et reçus/couverture/coût indisponible ; ancien contexte/commandes/Snapshotv1 exacts acceptés, limites de volume/erreurs explicites. Contrat métriques séparé versionné avant consommateurs.
- [x] `resources/bmad-help/progress.py`, `adapters/bmad/help.ts`/`help-manifest.ts`, `core/bmad-progress.ts` et jointure Main — preuve de type interne scellée, revalidation au bon contexte et transmission originale avant clone ; aucune donnée renderer transformée en autorité. Nouveaux tests types/preuves/absence/ambiguité/mutation/v1.
- [x] `src/core/us-metrics.ts` et `src/adapters/persistence/us-metrics-store.ts` — registre par projet et références historiques, capture explicite, normalisation/dédup/conflit/cumul, annexe CAS atomique bornée et génération/durabilité/reprise passive. Tester T1–T3/T6–T9 avec vrais fichiers témoins, plusieurs conversations/US et horloges injectées.
- [x] `src/adapters/codex/dialogue.ts`, `core/ports.ts`, `core/dialogue.ts` et jointure arrêt existante seulement nécessaire — reçus privés horloge/id à réception, capture au point d’effet, terminal avant drain et close seulement confirmé ; store par port sans coupler le cœur à Electron/FS/SDK. Gardes arrêt/admission/profil/permissions inchangées. Tester same-chunk, callback/storage/drain lents et tous états terminaux/unknown.
- [x] `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts` — commandes/abonnements métiers validés pour futurs choix/envois/lecture13, revalidation/résolution côté cœur ; aucune UI ajoutée et aucun nouveau moteur. Garder ancien dialogue sans choix non attribué.
- [x] Tests `tests/us-metrics*.test.mjs` et suites de dépendances réellement touchées ; banc `scripts/qualification/us-metrics-product.mjs` si nécessaire — démonstration locale hors UI du cycle qualifier→choisir→tour RPC→write/erreur→fermer/rouvrir, matrice T1–T10 et contre-exemples. Les doubles/fixtures sont nommés comme tels, pas un reçu SIWC. Témoins/temp/proc possédés nettoyés après contrôle ; rapports compacts sous `../qualification-mesures-produit/`.
- [x] Parent — diff/matrice puis Quick et audit high indépendant compatibilité/historiques/dédup/stockage, corrections par même worker et rechecks mêmes relecteurs. Types/build et banc local final ; rapport/commit local puis2.13. Pas de NSIS ou nouvelle copie dist pour ce lot sans UI ; un candidat seulement après interface utile13. Les anciennes preuves/paquet0.2.14 ne deviennent pas preuves de ce code.

**Acceptance Criteria:**
- Given deux projets/initiatives et plusieurs conversations/US avec traces locales corrélées, when des nouveaux tours sont explicitement rattachés ou non attribués puis les fichiers sont fermés/rouverts, then mêmes identités, sources, cumuls, couverture et inconnus durables sont lus sans nouvel agent ni double compte.
- Given les métadonnées privées à réception et les courses de stockage/stop/retards, when les bornes sont normales, simultanées, absentes ou contradictoires, then seules les durées effectivement prouvées sont closes ; résultat fonctionnel et conservation gardent leurs états indépendants, aucun montant n’est fabriqué.
- Given une vieille sauvegarde, une commande ou preuve non admissible et les flux Mary/Forge/aide existants, when11 est consommée sans UI nouvelle, then compatibilité et gardes du dialogue sont conservées et les commandes de13 ne peuvent inventer ni chemin, type, horloge ou rattachement.

## Implementation Notes

Contrat/annexe métriquesv1 séparés, preuve de type privée et occurrences sourcées, choix explicites opaques, reçus monotones à réception et durabilité indépendante. Aucun TSX/CSS ou nouveau paquet. Quatre racines privées de revue corrigées et recontrôlées par les mêmes acteurs ; voir qualification-mesures-produit/parent-verification.md et les sceaux successifs distincts. Les journaux globaux antérieurs restent rouges/attribués à leur code exact ; report2.15/graphe, aucun succès intégré inventé.

## Plan Change Log

## Review Triage Log

| Id | Verdict | Preuve vérifiée par le parent | Route |
|---|---|---|---|
| Q1 | medium | DialogueRpc60/63/105/109 conserve seulement l'observateur courant ; après armTurn suivant, la corrélation exclut le terminal ancien avant sa remise à la métrique. Le callback capturé par tour et les bornes privées existent déjà ; conserver leur index privé par identité corrélée corrige la perte, sans nouvelle surface ni autorité. | patch, racineA |
| Q2 | high | progress.py156–174 omet les sources refusées et produit coverage partial ; core/us-metrics61–75 n'exige aucune couverture suffisante avant qualification du groupe restant. Une feuille contradictoire non lue n'est pas absence prouvée. Le garde de qualification doit refuser cette preuve incomplète, sans transformer partial en disparition ni détruire les historiques. | patch, racineB |
| Q3 | medium | files.py29/55–58 refuse le reçu >4Mio sans files.json ; captureFiles35 accepte déjà refusal. La nouvelle lecture help133 échoue néanmoins. Garder la progression et désactiver uniquement l'autorité métrique quand ce reçu manque par refus explicite. | patch, racineC |
| H1 | medium | Même défaut de refus d'aperçu que Q3, chemin producteur/consommateur vérifié par le parent. | patch, racineC |
| H2 | medium | Même perte de terminal ancien que Q1 ; filtre du protocole ignore ensuite le tour ancien. | patch, racineA |
| H3 | maybe-false | Global767/750/17 exact ; doubles d'enveloppe et garde inchangés, preload/renderer synthétiques inchangés écartent la nouvelle jointure Main comme cause directe. Trois natifs : timeout de résultat, plafond contrôleur180s, Move Access denied avec Job actif puis arrêté0. Antériorité native non démontrée ; ces trois causes racines restent à qualifier. | defer, vérification2.15/graphe ; aucune suite globale verte revendiquée |


| Q-R1 | medium | Recheck Quick : accept complet78 remplace l'autorité à proofRevision identique ; capture100 compare l'objet conservé et refuse PROFILE_CHANGED sans changement de preuve. Une capacité stable pour la même preuve corrige directement cette régression privée, en gardant la révocation réelle définitive. | patch, racineD |
| H-R1 | medium | Même séquence accept(A)→choose→accept(même snapshot,B)→capture, étayée par high ; le handler dialogue arrête la session sur ce faux refus. | patch, racineD |

Recheck1 : Q1/Q2/Q3 et H1/H2 résolus par les relecteurs originaux ; racineD nouvelle ci-dessus, correction par même worker. H3 reste différé avec ses preuves exactes.

Recheck2 : Q-R1/H-R1 résolus par Quick et high originaux ; aucune nouvelle régression concrète identifiée, aucune correction produit différée. Les quatre racinesA–D sont closes.

## Design Notes

Routefull et risque high : plusieurs couches >100lignes, attribution ou durabilité erronées tromperaient les mesures. D1–D6 et Sally12 ferment les choix produit ; pas de gate de longueur en tokens ou checkpoint humain routinier sous mandat. Choix technique : annexe par projet pour conserver registre d’occurrences et reçus de plusieurs conversations dans une même écriture CAS, sans transaction inter-fichiers inventée ni nouvelle autorité sur messages. Source/type privés au modèle WeakMap existant évitent de changer la progression publique1. Les schémas CLI0.144.6 déclarent des champs, mais usage/coût/durée native restent non qualifiés et indisponibles. Pas d’export CLI ni modèle supplémentaire pour cette US.

Root réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, branchecodex/bmad-initiatives-2-3. Utiliser pwsh/login:false/workdir absolu/require_escalated ; hostcwdancien obsolète. Un worker propriétaire des fichiers ci-dessus et de ses tests/banc/proofs, tu n’es pas seul : préserver les modifications d’autrui. Parent seul plan/frozen/revues/statuts/commit ; pas de nestedBuild/agents de production/stage/commit par worker. Préserver managed/untracked, statEOL-only tests/bmad-help-boundaries.test.mjs, tous anciens inputs/proofs2.10, compte/profil/install et préversion interactive dist/graph-preview-0cf3cc35 (saisies possibles). Pas de package version/dependency/runtime bump requis dans11 ; release13 ultérieure. Nettoyer uniquement sorties de tests possédées, chemins résolus bornés sans reparse/processus actif ; ne jamais supprimer preuves/sources/profils nécessaires.

## Verification

**Commands:**
- Tests Node existants avec `--experimental-strip-types` et nouveaux tests ciblés puis dépendances touchées (progress/context/dialogue/protocol/Forge/help/questions/approbations/catalogue/persistance/lifecycle) ; chaque T1–T10 doit avoir au moins un cas réellement exécuté et passé, cas numériques/erreurs indépendants de l’implémentation.
- Parent exécute une fois `npm test` final pour ce changement central ; nommer tous échecs/limites, y compris les neuf divergences UI antérieures non attribuées, jamais les annoncer vertes ou préexistantes sans preuve. Pas de répétition globale après succès sans changement pertinent ; aucun test externe/profil personnel ajouté pour cela. Worker reste aux suites ciblées et dépendances.
- `npm run build` (inclut typecheck) quand les sources finales sont stables ; compilation seule, pas nouvelle copie dist/NSIS. Banc local produit si requis pour le cycle de persistance/RPC/fermeture, aucun compte/personnel/réseau externe.
- Audit des seules ressources/pins modifiés et `git diff --check`. Ne pas réexécuter la qualification figée2.10 contre des nouveaux inputs pour la repinner. Ne pas élargir/répéter une campagne verte sans correction, échec ou préoccupation précise.

**Manual checks:**
- Parent lit diff/fixtures/reçus et rapproche T1–T10, provenance/durabilité/indisponibilités ; Quick et audit high indépendant exigé par epic11. Aucune campagne UI/capture ni installateur spécifique ajouté ; la commande npmtest peut inclure les tests UI du projet, à rapporter exactement. Aucune acceptation humaine, SIWC réelle ou coût acquis par transports doubles. Toute vraie vérification externe manquante est reportée avec artefact et condition de reprise, sans bloquer la suite locale/2.13 ou demander un nouveau clic Zscaler.
