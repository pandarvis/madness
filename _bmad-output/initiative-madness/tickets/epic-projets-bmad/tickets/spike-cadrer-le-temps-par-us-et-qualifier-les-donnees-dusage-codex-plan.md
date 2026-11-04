---
title: 'Cadrer le temps par US et qualifier les données d’usage Codex'
type: 'chore'
ticket: '10'
created: '2026-11-05'
status: 'built'
baseline_revision: 'c6c482028c8e63772cbc99830183cb05f89aeaa6'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Madness ne conserve actuellement ni rattachement US ni durée/usage/coût des tours. Q8/Q9 doivent fournir des décisions et une matrice honnête avant Sally2.12, contrats2.11 et UI2.13.

**Approach:** Qualifier les données et bornes réellement disponibles dans la version locale, produire des fixtures expurgées/prospectives distinctes et un banc documentaire reproductible, puis adopter les règles Sofia/Winston sous le mandat autonome. Aucun code produit modifié.

## Boundaries & Constraints

**Always:** Conserver R32 comme fonctionnalité du produit seulement. Distinguer code courant, schéma exact CLI0.144.6, traces anciennes filtrées et proposition future. Appliquer les choix D1–D6 : durée locale monotone accepted→terminal reçu/arrêt confirmé, attentes/outils inclus, préparation/drain/sauvegarde exclus ; cumul de tours distincts une fois, chevauchements annoncés, pas durée de réalisation/CPU/effort humain. Rattachement explicite avant tour à une story documentaire non ambiguë, type à exposer en2.11, contexte complet et preuve/révision capturés, aucune réaffectation rétroactive. Une story sans feuille est admise ; titre stable ne fait pas identité, @file/doublon/type inconnu non attribuables. Occurrence déplacée/supprimée puis réapparue ou réemploi détecté reste séparée ; le réemploi silencieux non observé n’est pas universellement détectable. Terminal absent/crash/arrêt inconnu ne donnent aucune durée close ; anciens tours connus restent consultables avec couverture partielle. Coût absent indisponible, jamais zéro. Préserver contextes/historiques, sources personnelles, SIWC, proxy, version produit et candidat0.2.14.

**Never:** Reconstruction depuis timeouts, dates de fichiers/projet/questions, chaînes d’activités ou instant de réouverture ; attribution par navigation/titre/US probable ; addition last+total ou répartition arbitraire des agrégats de compte ; conversion de tokens en coût d’abonnement/tarifs API. Pas de succès natif ou émission SIWC déduit d’un schéma, ni faux compteur/prix. Ne pas mélanger durée native rapportée et bornes locales. Aucun nouveau fournisseur, collecte personnelle, clé API, modèle, connexion, cache/gate réseau, modification produit/spine/Snapshotv1, NSIS/installation/UI ni requalification générale du runtime. Pas de suivi de notre développement, seuil en tokens, nouvelle question Zscaler/JSON/token/IT ou gate humain routinier. Une réception native manquante reste explicitement non qualifiée.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| M1 Identité | Story avec/sans feuille, deux projets/id identique, type absent, @file/doublon, renommage et occurrence réapparue | Référence complète/proof capturée ; type/ambiguïté empêchent attribution, historique séparé | Aucun titre/fallback ne fabrique une identité ou continuité |
| M2 Bornes | Préparation, ACK, question/outils, terminal puis drain/sauvegarde | Intervalle monotone ACK→terminal seulement, attente incluse et définition nommée | Timestamp natif nullable et durée native restent source distincte/schema-only |
| M3 Doublons/retards | Événement répété, même identité avec charge différente, retards après autre US | Un tour compté une fois dans son contexte capturé, conflit nommé | Jamais rattachement au projet/US actif ni somme de cumuls répétés |
| M4 Interruption | Stop confirmé/inconnu, crash, borne ou ACK absent, ancien historique sans dates | Intervalle clos seulement si ses deux bornes sont connues ; couverture partielle/inconnue explicite | Aucun timeout/réouverture transformé en borne ni inconnu transformé zéro |
| M5 Cumul | Plusieurs tours/conversations/US, deux tours parallèles de10min |20min cumulés pour deux tours distincts, chevauchement annoncé, répartition conservée | Aucune prétention d’occupation calendaire ou effort humain |
| M6 Disponibilité | Schémas usage last/total/5compteurs, agrégats de compte, aucune valeur reçue attribuable ni devise | Champs schéma et réception/persistance distincts ; coût/usage courant indisponibles | Ne pas confondre cache/input/output/sous-compteurs ni inventer leur additivité |
| M7 Réouverture | Fixtures proposées conservées puis relues, historiques courants inconnus | Projection identique passive, limites et rattachement inchangés ; aucun appel externe | Échec documentaire n’acquiert aucun contrat produit ou gate d’intégration |
| M8 Expurgation | Quatre anciennes traces, méthodes unknown→other, deltas supprimés | Extraits whitelist sans contenu/arguments/PID/chemins de données/IDs bruts, sourceSHA et filtre décrits | Observation complète de son filtre ≠ protocole complet/absence native d’usage |

</frozen-after-approval>

## Code Map

- `src/contracts/bmad-progress.ts:8`, `src/core/bmad-progress.ts:11/54`, `resources/bmad-help/progress.py:225` : projet/racine physique/initiative/conteneur/id normalisé et révisions de preuve ; entrée sans feuille, doublons, @file et type absent. Décrire la future extension type story en2.11, ne pas modifier ces fichiers pendant le spike.
- `src/contracts/index.ts:6/8`, `src/contracts/dialogue.ts`, `src/core/ports.ts:16–18` : ContextRef sansUS, conversations sans chronologie durable, ordres locaux. Ne pas reconstruire des mesures dans Snapshotv1.
- `src/core/dialogue.ts:304`, `src/adapters/codex/dialogue.ts:93/308` : ACK accepté après turn/start, callbacks puis terminal/drain ; timeouts suspendus et notifications hors liste ignorées. Ces coutures guideront2.11, ne pas les modifier ici.
- Quatre traces : `qualification-aide-native/reprise-2026-11-03/native010-native-events-{1,2}.json` sous epic2 ; `qualification-e2e/personal-current-002/native-events-{1,2}.json` sous epic1. Empreintes fournies par l’enquêteur et à vérifier lors de l’extraction. `scripts/qualification/epic-one-control-trace.mjs:14`/`epic-one-personal.mjs:40–78` définissent leur filtre ; absence de champ usage dans ces exports n’est pas une absence native prouvée.
- Export réel local `.working/metrics210-schema-966mEd/export-receipt.json` sous initiative : CLI0.144.6 SHA4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7, version et generate-json-schema exit0, home enfant isolé, aucun RPC initialize/thread/turn/auth.267schémas ; retenir leurs empreintes et les déclarations pertinentes sans copier tous les types hors sujet. TurnStarted/Completed : startedAt/completedAtUnixsecondes et durationMs nullable ; ThreadTokenUsageUpdated : threadId+turnId+last/total et5compteursint64 ; GetAccountTokenUsage : agrégats, pas US. Ce sont des schémas, pas des reçus SIWC.
- `.working/metrics210-official-docs.json` : références officielles réellement consultées app-server/SIWC, secondaires à l’export exact. Elles confirment notification/cycle/export par version, pas l’émission, la réception ou un prix du profil. Aucune autre API/SDK npm n’est substituée au CLI.
- `qualification-bibliotheque/parent-verification.md` et continuité du plan2.9 : identités/projections/retours conservés ; candidat courant0.2.14 inclut ces fonctions, pas d’équivalence native avec anciens ASAR. `.working/metrics210-protected-inputs.json` fige161inputs produit et ASAR74bf2eed593ed0256ea7cc18aeb0064272888e3adc310b96ec6e88b51d2ea03b.
- Deux enquêteurs lecture seule terminés, Winston réellement activé via résolveurs agent/config et lecture epic/architecture : D1–D6 puis recheck des schémas. Sofia adopte sous le mandat full-autonomy/checkpointsfalse ; pas nouveau consentement humain/global.

## Tasks & Acceptance

**Execution:**
- [x] `qualification-mesures-us/decisions-et-donnees.md` sous epic2 — matrice code/schéma/reçu/proposition, décisions D1–D6 avec bornes/exemples/indisponibilités et obligations précises pour12/11/13 ; sources et versions exactes, aucune UI ou montant inventé.
- [x] `qualification-mesures-us/fixtures/` — trois classes explicitement marquées : anciens observateurs expurgés, extraits de schéma exact sans valeurs reçues, cas locaux prospectifs M1–M7. Ne jamais renommer une proposition en mesure native. Préserver rawsources ; index des empreintes origine/extraits et limite de filtre.
- [x] `scripts/qualification/us-metrics.mjs` — banc local documentaire lisant fixtures et validateurs existants utiles, oracles numériques statiques indépendants et contre-exemples, sortie possédée `--output=<nouveau>` ; chronologie monotone/cumul/déduplication/couverture et passivité. Ce banc n’est pas un modèle produit à importer en2.11, ni une qualification de champs jamais reçus.
- [x] `qualification-mesures-us/verification.json` et provenance — résultat/matrice avec cas réellement exécutés, local/natif/schema-only séparés, champs absents et inconnus ; comparaison161inputs et ASAR avant/après. Aucun nouveau build/NSIS/compilation UI nécessaire au spike sans code produit.
- [x] Parent — contrôle du périmètre et des sources, Quick et audit high indépendant champs effectivement reçus/sémantique/disponibilité ; triage/rechecks par mêmes acteurs en cas de patch ; décisions Sofia/Winston explicites et report natif documenté, rapport et commit local puis suite autonome2.12/2.11/2.13.

**Acceptance Criteria:**
- Given les sources courantes, les schémas0.144.6 et les anciennes traces filtrées, when la matrice est relue et le banc exécuté, then chaque donnée est classée sans confondre déclaration et réception, coût absent reste indisponible, et les inputs produit sont identiques.
- Given les cas identité/attente/arrêt/retard/doublon/chevauchement/réouverture, when les fixtures prospectives sont évaluées, then les résultats numériques et inconnus correspondent aux décisions D1–D6, sans réaffectation ni durée rétrospective.
- Given les conclusions et relectures indépendantes résolues, when12 puis11/13 les consomment, then Q8/Q9 ont une réponse explicite et leurs limites techniques restantes, sans nouvelle validation humaine routinière ni source produit modifiée par10.

## Implementation Notes

Sources/extraits et décisions : [décisions et données](../qualification-mesures-us/decisions-et-donnees.md). Parent89cas sans skip après trois corrections du banc ;161inputs/ASAR exacts. Schémas exacts et observations filtrées sont séparés des fixtures prospectives ; pas de mesure produit ni montant qualifié. [Rapport parent](../qualification-mesures-us/parent-verification.md).

## Plan Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| Q1 scripts/qualification/us-metrics.mjs:41 | medium | patch | Inspection confirms identity() counts only existence=entry once, not duplicate existence=leaf. Projection groups samecontainer/id; actual parser reports duplicate leaves. A single entry plus two leaves therefore retains eligible:true contrary to M1 ambiguity rule. Existing duplicate-entry fixture does not settle this case. |
| Q2 scripts/qualification/us-metrics.mjs:38 | medium | patch | identity() accepts typeSourceId present anywhere in snapshot.sources before resolving selected rows, without requiring a declaration of that selected ticket from the type source. Prospective foreign-ticket/document source can therefore certify type for another id. Existing absent-source case misses this reachable fixture input; only the demonstrated source-to-selected-ticket joint needs correcting. |
| H1 scripts/qualification/us-metrics.mjs:68-73 | medium | patch | aggregate() same scope/different binding payload sets duration null through ...previous while retaining previous.bindingKey/captured. Reversing contradictory bindings changes which US gets the unknown turn and usCount/group context. Existing test changes duration only. Neutralize contradictory attribution and prove order invariance, retaining source/coverage honesty. |


Recontrôle par les mêmes acteurs : Q1/Q2 resolved par metrics210_quick ; H1 resolved par metrics210_high, source/diff e48eba… et reçu parent89conformes. Aucun défaut de ce lot différé, review_loop_iteration0 conservé.

## Design Notes

But unique : qualifier les mesures par US avant leurs consommateurs. Routefull car banc, fixtures, sources et document >100lignes, plusieurs fichiers ; risque high conservé car une fausse valeur ou attribution trompe l’utilisateur. Aucun seuil en tokens. Aucune UI/Impeccable ou installation dans10. D1–D6 résolvent les choix sous mandat ; Q9 peut être arrêtée avec des données indisponibles explicites, sans simuler une émission SIWC ou inventer un montant.

Root réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, branchecodex/bmad-initiatives-2-3, baseline canonique en frontmatter. Hostcwd obsolète : pwsh/login:false/workdir absolu/require_escalated. Un worker possède uniquement la qualification documentaire/banc ; tu n’es pas seul, ne pas rétablir les éditions d’autrui. Parent seul plan/frozen/revues/statuts/commit. Préserver managed/untracked, statEOL-only boundaries, compte/profil/install/préversioninteractive et tous anciens reçus. Pas de nestedBuild ni sous-agent de production, stage/commit/modèle/processus/appserver/exports supplémentaires par le worker. Copie des exports publics déjà produits permise, aucun profil personnel à ouvrir. Vérifier le gel161/ASAR, ne pas multiplier les campagnes historiques ; une campagne hors produit et revues ciblées, nouveau passage seulement après correction réelle.

Les règles adoptées sont prospectives : type story doit être fourni par2.11 à partir d’une source qualifiée ; ne pas prétendre que le contrat courant le porte déjà. Le cumul des tours inclut outils/attentes et peut dépasser le temps calendaire en parallèle. Les schémas exacts attestent désormais les noms/units temporelles et IDs usage ; native duration/last/total ne sont pas prouvés reçus ni conservés dans cette preuve. L’observation de ces champs devra être expurgée et corrélée lors d’un futur vrai échange pertinent ; pas d’appel modèle artificiel ici. Aucun gate G2–G5/humain/WCAG/globalV1 ni capacité produit mesurée nouvellement acquis.

## Verification

**Commands:**
- `node --experimental-strip-types scripts/qualification/us-metrics.mjs --output=<nouveau témoin possédé>` — fixtures/provenance/oracles M1–M8 réussis sans skip ; rapport ne revendique ni native received usage, ni code produit instrumenté.
- Comparaison SHA256 de161inputs et ASAR gelés, index des quatre traces et déclarations natives extraites, JSON tous lisibles — mêmes octets produit, sources/extraits traçables, expurgation whitelist.
- Parent réexécute seulement le banc final, audite sa matrice et sa portée puis reviews Quick + high indépendantes. Pas de suite UI globale, profil personnel, réseau/modèle, NSIS ou reconstruction de paquet pour ce spike.
