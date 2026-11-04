---
title: "Réduire le coût du contrôle du runtime sans affaiblir ses refus"
type: 'refactor'
ticket: 18
created: '2026-11-04'
status: 'built'
baseline_revision: 'eaecc68b3a232f46d05c69ba14d9158e49c5efac'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/latence-observee.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/performance-observation-002.json'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/diagnostics-a-reprendre.json'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/runtime-apis-sources.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le contrôle PowerShell du runtime fermé a pris18,389–27,188s par opération dans huit observations locales. Avant les actualisations2.5, ce coût doit être réduit et qualifié ; une admission mise en cache ferait courir le risque d’exécuter des octets modifiés.

**Approach:** Mesurer une référence figée puis remplacer l’exécution coûteuse du contrôle par un parcours batch local, en conservant le contrôle complet à chaque appel, les refus avant premier UV et la garde Python indépendante. Qualifier gain, équivalence des refus et voie produit/paquet ; reprendre les trois diagnostics Windows sans les attribuer implicitement à cette cause.

## Boundaries & Constraints

**Always:** Même runtime qualifié735fichiers et mêmes pins UV/Python ; inventaire exact, SHA, répertoires attendus, ancêtres lexicaux avant résolution, liens/reparse/hardlinks, venv racine/parent, fichiers supplémentaires/manquants, caches/startup et bornes conservés. Chaque appel relit les faits, échoue si une identité/lecture native nécessaire reste inconnue, et refuse avant UV. Aucune confiance mémorisée d’un appel à l’autre. Comparaisons avant/après liées aux sources/manifestes exacts, première compilation/processus et phases/dispersion visibles ; aucun seuil ou gain inventé. Job avant Resume, admission/générations/BUSY/STOP_UNCONFIRMED, interruption/arrêt/drain/retour, budgets produit et unknown intacts. Toute fixture supprimée est possédée, dans le Temp attendu, et son arrêt prouvé ; résultat inconnu reste conservé.

**Never:** Nouveau superviseur/runtime/service ou dépendance tierce ; modifier l’arbre qualifié735, pins UV/Python, garde Python, contrats/cœur/Main/preload/renderer, architecture/UX ou plans built. Aucun cache d’admission, suppression de refus, simple hausse d’un timeout pour obtenir du vert, correction étrangère des huit autres diagnostics ou modèle/réseau/OAuth/JWKS. Aucun profil/compte/brouillon/installation personnelle modifié. Ne pas confondre banc cases, worker.main, temps de garde, attente enfant, retour complet et coût d’US produit ; aucune nouvelle mesure de notre développement.

## I/O & Edge-Case Matrix

| Cas | Entrée / état | Résultat attendu | Limite / refus |
|---|---|---|---|
| L1 nominal/mesure | Même copie runtime735 et manifeste figés, référence/candidate sous conditions comparables | Admission et octets identiques, mesures appariées dans les deux ordres ; gain réel de garde et coût total rapportés | Première compilation/processus inclus ou séparés explicitement ; petit échantillon ne devient pas performance générale |
| L2 fermeture | Fichier altéré/manquant/ajouté, répertoire/cache/startup/venv inattendu, manifeste ou bornes invalides | Refus contrôlé de même sens avant tout marqueur de lancement, runtime attendu toujours revérifié | Aucun fichier supplémentaire ignoré pour accélérer ; corruption après premier contrôle refusée au suivant |
| L3 liens/identité | Hardlink/junction/ancêtre remplacé, chemin long et faute de lecture/identité | Refus ou observation cohérente avec la frontière existante ; données extérieures/canaries inchangées | Pas de canonicalité déduite de chaînes ; symlink natif non permis reste non éprouvé et non vert |
| L4 ressources | Preflight/pins exacts puis ressource altérée, source et paquet différents | Seuls octets approuvés exécutés, ressource altérée refusée avant premier UV ; chaque ressource paquet comparée à son pin | Aucun helper hors fermeture ou contenu du projet compilé ; compilation .NET n’est pas un nouveau propriétaire métier |
| L5 voie réelle | BmadHelpAdapter+HelpOwnedRun et worker.main sur témoin local | prepare/fresh/knowledge/config/required-context fidèles, garde Python indépendante, phases et arrêt possédé observés | cases import worker ne prouve pas worker.main ; pas de compte/fournisseur ou preuve transférée d’un ancien paquet |
| L6 trois diagnostics | Reprises séquentielles context-sources/help-boundaries/supervision sur sources exactes | Réussites/failures/causes réellement établies conservées, arrêts/correspondance des reçus relus | Supervision n’appelle pas la garde : aucune causalité supposée ; inconnu n’est ni vert ni suppression permise |
| L7 interruption/nettoyage | Contrôleur interrompu ou arrêt inconnu, nouveau témoin/anciens dossiers retenus | Preuve/chemin/identité conservés, aucun nettoyage avant preuve d’arrêt, aucune ressource étrangère arrêtée | Un PID seul ne prouve pas le propriétaire ; anciennes fixtures inconnues ne sont ni rejouées ni effacées |

</frozen-after-approval>

## Code Map

- `resources/bmad-help/preflight.ps1::Assert-BmadClosedRuntime` et `Assert-BmadChain` : contrôle courant relu par le parent, boucle PowerShell/Get-Item/Get-ChildItem/LinkType/Get-FileHash. Préserver API et erreurs métier. Candidat choisi : contrôle batch .NET en C# embarqué dans ce même script épinglé, hébergé dans PowerShell existant, sans nouveau processus ni ressource séparée. Une compilation de code constant peut être réutilisée dans un processus ; jamais une décision d’admission ni une entrée FileInfo périmée. Lectures, hashes et métadonnées restent renouvelés. Les informations de handle Windows (attributs, volume/index, nombre de liens) doivent être obtenues réellement et les échecs refusés ; comparer les ancêtres lexicaux avant toute résolution et ne pas élargir les racines/plateformes qualifiées.
- `src/adapters/bmad/help-manifest.ts` :14ressources actuellement épinglées ; actualiser uniquement le SHA du preflight et d’une autre ressource seulement si elle change réellement. `help.ts`47–50 valide/copIE chaque ressource et écrit pins.json ; `launcher.ps1`7–14 revérifie pins,20–38 copie uniquement runtime.json,43 garde avant première instruction UV. Aucun changement de voie ou de `$modules` nécessaire pour le candidat embarqué. `runtime.json` et `runtime_guard.py` restent exactement identiques.
- `bootstrap.py`16–35 valide les sources puis exec worker68 ; `worker.py`importe capture/runtime_guard4–6 puis appelle `runtime_guard.closed_manifest`365–370 au début de main, avant opération métier. Ce second contrôle n’est pas « avant import worker ». Ne pas modifier ou fusionner sa logique avec le batch .NET. `capture.py`38/46/71/95/118 fournit les précédents identity/inspect_chain/long_path/handle_path/read_safe ; c’est une référence de frontière, pas un module à changer ni un oracle de confiance mis en cache.
- `tests/helpers/help-native.mjs`10–42 : copie14pins automatiquement, quatre appels pré-UV (nominal + refus sitecustomize/cache/parent-venv ; les refus peuvent terminer tôt), ensuite Invoke120s dans contrôleur180s ; cleanupSafe seulement terminal et Job0. Entrée cases importe worker sans appeler main ni son audit/guard initial. Préserver le helper sauf instrumentation ciblée nécessaire ; il est partagé par legacy/partial-docs/progress. `tests/bmad-context-sources.test.mjs`101 et `bmad-help-boundaries.test.mjs`96 reprennent cette voie ; variantes runtime/ancêtres/liens58–94. La variation tracked/EOL antérieure boundaries reste à préserver, pas reset/stage de changements étrangers.
- `tests/bmad-help-supervision.test.mjs`13/65 : cinq cas normaux/orphelin/timeout/overflow/manquant, contrôleur90s et plafond par cas15s, puis faute après création suspendue (contrôleur30s). Aucun appel de garde runtime ; assertion normal a échoué à elapsed16018ms malgré completed/exit0/Job0 dans un reçu lié seulement par date/condition, pas identité explicite du log. Reproduire sans augmenter d’emblée ces budgets. Si une assertion de banc contredit les phases déclarées, établir et corriger sa plus petite cause en conservant le contrôleur fini et les obligations de stop ; ne jamais augmenter un délai produit. Les finally suppriment actuellement Temp même sans arrêt connu : corriger ce seul nettoyage pour archiver/retourner un inconnu, avec garde du chemin absolu et preuve de possession/arrêt avant suppression. Pas de changement supervision.ps1 au titre d’une hypothèse de lenteur.
- `scripts/qualification/bmad-help.mjs::qualifyHelpLocal`25–45 : vraie voie BmadHelpAdapter+HelpOwnedRun, témoin de données, prepare/fresh/native-knowledge/native-config/read-*, equality et shutdown, sans fournisseur. Réutiliser dans le nouveau banc `qualification-latence-runtime/qualify.mjs` avec Temp court et sources exactes. `scripts/qualification/{bmad-context,bmad-progress}.mjs` vérifient les pins ; `scripts/release/manifest.mjs` inventorie les sources mais ne compare pas chaque ressource bmad-help du paquet : le banc nouveau fait cette comparaison sans réécrire le releaser global.
- Nouveau `tests/bmad-runtime-preflight.test.mjs` : frontières Windows réelles et répétition après corruption, effet UV factice instrumenté jamais déclenché si refus. Nouveau `qualification-latence-runtime/{qualify.mjs,rapport.md,verification*.json,logs/}` : référence scellée, protocole/mesures, lien sources/pins/corpus, refus et limites, matrice L1–L7, arrêt et cleanup. Conserver le code de référence issu de la baseline dans cette qualification, jamais un fallback de production.
- `package.json` et `package-lock.json` : version produit0.2.8 pour candidat distinct ; aucune dépendance ou résolution nouvelle. `electron-builder.yml` embarque déjà tout resources/bmad-help, aucun changement. Sortie `dist/runtime-guard-reviewed` ; audit du paquet/NSIS et exercice local des ressources exactes, sans installation personnelle. Tous les autres fichiers produit et profils restent protégés.

## Tasks & Acceptance

**Execution:**
- [x] `qualification-latence-runtime/qualify.mjs`, référence et `tests/bmad-runtime-preflight.test.mjs` — figer baseline/runtime/corpus puis établir mesures avant/après et contre-exemples L1–L4 ; Caractériser réellement les refus existants puis comparer le candidat ; TDD rouge→vert sur le nettoyage sans preuve d’arrêt actuellement violé, pas un faux rouge de présence/syntaxe ou de seuil de temps.
- [x] `resources/bmad-help/preflight.ps1`, `src/adapters/bmad/help-manifest.ts` — réaliser le batch local complet à chaque appel, conserver liens/ancêtres/hashes/fermeture/bornes et refus avant UV ; pin exact, pas de nouvelle ressource active ou confiance en cache.
- [x] `tests/bmad-help-supervision.test.mjs` et si nécessaire instrumentation minimale du helper partagé — corriger la conservation des témoins incertains et réexaminer les trois diagnostics sans effacer leur premier échec. Ne pas toucher d’autre test ou code pour transformer une inconnue en vert ; rapporter limites et profils.
- [x] `qualification-latence-runtime/`, package metadata — mesurer la vraie voie worker.main via adapter/owner et vérifier source puis paquet0.2.8 exact, ressources/pins, types/build/NSIS ; zéro invocation fournisseur, compte ou profil personnel. Rapporter phase de compilation/processus, garde, Python, contrôle/stop/retour séparées et gain uniquement observé.
- [x] Plan/remise sous autorité parent — audit indépendant high de la frontière batch et des mesures/ressources/arrêt, puis Quick et rechecks du même implémenteur/relecteur ; un seul commit local après vérification, aucun push.

**Acceptance Criteria:**
- Given le runtime fermé et des variantes possédées, when référence et candidate sont contrôlées de façon comparable, then admission/refus et absence de lancement sur altération sont prouvés et les mesures établissent un gain réel sans cache d’admission ni contrôle perdu.
- Given la voie locale dans le paquet exact, when le projet témoin est préparé et ses documents lus puis les opérations arrêtées, then les octets/provenances et la garde Python indépendante sont conservés, les ressources correspondent aux pins et les coûts/limites sont observables sans compte ou réseau.
- Given un échec de contrôleur ou un arrêt inconnu dans les reprises, when la qualification se termine, then son état/source/chemin restent traçables, aucune preuve d’arrêt n’est fabriquée et aucune fixture incertaine ou étrangère n’est supprimée.

## Implementation Notes

Batch C# embarqué dans le seul preflight épinglé, métadonnées/hashes frais et mêmes handles ; garde Python735 inchangée,14ressources et aucune dépendance nouvelle. Nettoyage des bancs supervision désormais lié au propriétaire/contrôleur/arrêt, aucun délai produit ou de banc relevé. Version produit0.2.8 ; aucune installation personnelle.

Vérification worker : cleanup rouge→vert, matrice2/2 + extension1/1, reprise ciblée19/19 sans skip, source71905 et paquet16588 avec cinq opérations worker.main completed0/Job0 chacun, égalités/shutdown/cleanup. Types/build0 ; NSIS0 après reprise identique d’un premier UNKNOWN conservé. Parent audit0 :28contrôles ressources,735originaux, Python/runtime et dépendances exacts, ASAR15ef1a72…/NSIS331cae6f…. Médiane garde source17,0345s→1,556s, paquet15,3705s→1,4655s ; compilation/processus et retours complets distincts. Collectes réelles restent14–17s, premierprepare33,307s :2.5 doit regrouper/actualiser sans bloquer la saisie.

High indépendant frontières favorable ; complément H1 bornes de banc mal atteintes corrigé par même implémenteur, six observations ciblées92278 RUNTIME_BOUND/noUV puis même auditeur résolu. Préflight/pins/paquet/mesures inchangés. Capsule source productrice reconstruite après exécution et hashée après coup, pas de hash historique inventé ; producteurs paquet et supplément figés avant leur lancement. Premier nominal refusé/erreur sélecteur ASAR/UNKNOWN NSIS conservés. Symlink EPERM non éprouvé, deux nouveaux témoins incertains et deux anciens inconnus conservés ; huit diagnostics hors lot restent aux consommateurs14/16. Quick frais sans constat ; aucun correctif du lot différé. Aucun gate intégré ou acceptation humaine déduit.

## Plan Change Log

## Review Triage Log

- H1 — medium / patch. qualify.mjs90–98 : fixtures count/depth rejetées avant les seuils de parcours revendiqués, assertions acceptant tout refus. Parent relit code et huit reçus source/paquet : référence RUNTIME_EXTRA Lib, candidat count RUNTIME_RECORD. Risque de couverture trompeuse pour consommateurs ; aucun contournement produit montré. Plus petit correctif : scaffold déclaré, longueur manifeste admissible et total de parcours au-delà4096, profondeur au-delà17 sans extra préalable ; motif RUNTIME_BOUND et absence de lancement réellement vérifiés. Même implémenteur, supplément ciblé92278 puis même auditeur : résolu ; six motifs RUNTIME_BOUND vérifiés, aucun produit/mesure/paquet refait.

## Design Notes

Route full : changement de frontière native, tests, banc et packaging dépassent100lignes ; risque high conservé car une admission erronée exécuterait un runtime altéré. Aucun seuil de longueur du plan ni checkpoint humain routinier : le mandat complet délègue choix techniques/plans/revues/commits, pas une preuve G2/G4/G5 ou une acceptation humaine. Une seule finalité : rendre le contrôle complet moins coûteux avant2.5, aucun changement UX ou fonctionnalité ajoutée.

Racine réelle C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness ; utiliser workdir absolu+require_escalated, cwd hôte atelier-ui obsolète. HEAD eaecc68b3a232f46d05c69ba14d9158e49c5efac / codex/bmad-initiatives-2-3. Tu n’es pas seul : worker possède uniquement preflight/pin, tests/banc/qualification indiqués et version package ; parent possède header/frozen/statuts/revues/commit. Préserver les managed/untracked et le test boundaries antérieurs ; aucun reset, branche/checkout, staging ou commit chez le worker. Ne pas invoquer un Build imbriqué ni lancer npm test global ; vérification finale élargie nécessaire au parent seulement.

Deux anciens témoins diagnostic existent en Temp : madness-help-boundaries-L4Ontm (PID historique30132, stdout25checks) et -fnrN8G (PID historique45348, stdout absent), tous deux execution.json running sans reçu Job0. Aucun propriétaire ou arrêt courant n’est déduit de ces PIDs. Ne pas rejouer/nettoyer sur ce seul constat ; conserver les preuves et ne réobserver qu’avec identité/propriété établies. Leur présence n’oblige pas à arrêter les travaux sur de nouveaux témoins séparés.

Références Win32 primaires vérifiées pour la nouvelle portion native : Microsoft GetFileInformationByHandle, BY_HANDLE_FILE_INFORMATION et Reparse Points and File Operations. nNumberOfLinks est une donnée native, pas la présence d’un LinkTarget ; une faute de métadonnée n’est jamais réparée en « fichier normal ». Ces docs ne prouvent pas une absence de course/sandbox ; les bancs bornent ce qui est réellement démontré, sans généraliser à tout filesystem ou volume.

## Verification

**Commands:**
- `node --test tests/bmad-runtime-preflight.test.mjs` — matrice native nominal/refus/répétition, première exécution bloquée sur altération, sans skip caché ; limites de symlink distinguées.
- `node --test --test-concurrency=1 tests/bmad-context-sources.test.mjs tests/bmad-help-boundaries.test.mjs tests/bmad-help-supervision.test.mjs tests/bmad-help.test.mjs` — reprises ciblées séquentielles, contrôles de génération/unknown et admission/refus intacts, aucun relèvement initial de budget ; tout échec conservé et diagnostiqué.
- `node _bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/qualify.mjs` — protocole comparatif L1–L7 et vraie voie locale, sources/conditions/mesures et arrêts liés, gain observé borné à ce profil.
- `npm run typecheck`, `npm run build`, `npm run build:win -- --config.directories.output=dist/runtime-guard-reviewed` — deux configurations, compilation et NSIS passent, versions/dépendances explicites.
- `node _bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/qualify.mjs --package dist/runtime-guard-reviewed/win-unpacked` — chaque ressource paquet comparée au pin/source, voie locale exacte et fermeture observées ; aucun modèle/réseau/profil personnel.
- Audit des empreintes des anciens fichiers hors ownership, runtime.json/runtime_guard.py et735fichiers avant/après — inchangés ; comparaison des refus/mesures indépendante high puis Quick avant clôture. Pas de suite globale, répétition de tous anciens parcours ou installation personnelle nécessaire si ces contrôles passent.
