---
title: 'Définir avec Sally le parcours des mesures par US'
type: 'feature'
ticket: '12'
created: '2026-11-05'
status: 'built'
baseline_revision: 'b79bf328d1d05c37e49911e83eb74ba5771e4994'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/.memlog.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/DESIGN.md'
---

<frozen-after-approval reason="intent approuvé sous mandat humain autonome — modification seulement par renégociation humaine">

## Intent

**Problem:** Les décisions Q8/Q9 sont arrêtées en2.10, mais les consommateurs2.11/13 n’ont pas encore un parcours UX commun pour choisir une US et comprendre ses mesures sans confondre cumul, effort, zéro et indisponibilité.

**Approach:** Update headless Sally avec Impeccable : prolonger les deux contrats adoptés et documenter un parcours compact de rattachement avant tour puis consultation locale sourcée. Livrer les libellés FR/EN et les contre-exemples avant le modèle et l’interface, sans implémenter le produit dans ce lot.

## Boundaries & Constraints

**Always:** D1–D6 de2.10 adoptées par Sofia/Winston gouvernent. Choix facultatif et explicite d’une seule story qualifiée avant chaque tour, ou non attribué ; contexte/identité/occurrence capturés. Durée cumulée des tours observés, attentes comprises, pas effort humain ou calendrier. Coût et usage natif non qualifiés restent indisponibles ; inconnu n’est pas zéro. Palette atelier, Oxanium/Barlow du DESIGN racine, composition, gardes du dialogue, sept parcours et Graphe existants conservés. R32 concerne le produit uniquement.

**Never:** Code produit/contrat TypeScript, instrumentation, UI exécutable, nouveau dashboard/onglet, token/palette/font/asset, NSIS/build/install/profil/compte/modèle/réseau ou export CLI supplémentaire. Aucun rattachement rétroactif, synthèse d’historiques, coût API/abonnement, nouveau montant, timer manuel ou capacité native supposée. Pas de nouveau gate humain routinier, conformité WCAG ou acceptation globale revendiquée.

## I/O & Edge-Case Matrix

| Cas | Entrée / état | Comportement contractuel attendu | Échec / récupération |
|---|---|---|---|
| M1 Choisir | Story qualifiée, entrée sans feuille, ou aucun choix ; type absent/spike/@file/doublon | Choix explicite identifié avant tour ; sans choix non attribué ; seuls types/identités qualifiés admissibles | Motif près du choix, aucune substitution à la story active ou première ligne ; poursuivre non attribué si dialogue par ailleurs permis |
| M2 Contexte | Nouvelle saisie/tour, question native, navigation ou résultat tardif ; titre renommé ou occurrence déplacée/réutilisée | Choix du prochain tour distinct du rattachement capturé ; question/réponse garde son tour ; contexte historique inchangé, occurrence séparée selon preuve | Changement de preuve invalide choix avant effet ; brouillon conservé, rechoix volontaire ; aucun rattachement après ACK |
| M3 Lire connu | ACK1000ms/terminal601000ms, attente incluse ; ACK=terminal prouvés | 10min cumulées ou vrai zéro connu ; libellé/périmètre/provenance ; résultat fonctionnel indépendant, durée native séparée si un jour qualifiée | Préparation et drain/sauvegarde exclus ; exemples nommés prospectifs, jamais reçus natifs |
| M4 Couverture | Un tour10min clos et deux inconnus ; tous inconnus ; crash/arrêt demandé/sans borne durable | 10min connues/partiel/2inconnus, ou cumul indisponible ; couverture des seuls tours identifiés | Pas de borne depuis timeout/date/réouverture ; information de session non durable identifiée |
| M5 Cumul | Doublon identique, charge contradictoire, deux tours parallèles10min ; domaines d’horloge différents | Un tour une fois ; conflit explicite ; contradiction d’US non attribuée ; 20min cumulées et chevauchement connu, sinon inconnu | Aucun premier reçu arbitraire, ni cumul assimilé à occupation calendaire |
| M6 Disponibilité | Ancien historique, schéma CLI seulement, agrégat compte, coût absent | Historique non instrumenté/inconnu ; usage/coût indisponibles et sources distinctes | Ni zéro ni prix extrapolé, ni schéma déclaré comme mesure reçue |
| M7 Conserver | Hors ligne, réouverture, sauvegarde refusée, source disparue | Consultation passive des reçus futurs réellement durables, identité historique exacte ; session non enregistrée explicitée | Pas de modèle/compte/collecte/rejeu ; retour au travail et réessai sauvegarde seulement |
| M8 Accéder | Clavier/focus, deux thèmes, noms longs FR/EN,720px/zoom200%, mouvement réduit | Choix et détails nommés, contrôles réemployés, état textuel sans survol/couleur seuls ; contexte/saisie préservés | Pas de timer annoncé à chaque seconde ni focus arraché ; repli neutre si déclencheur disparu |

</frozen-after-approval>

## Code Map

- `../qualification-mesures-us/decisions-et-donnees.md` depuis le dossier de ce plan : source D1–D6 ;89cas documentaires hors produit, usage/coût reçus non qualifiés. Aucun reducer privé du spike à importer.
- `../../../ux-madness/EXPERIENCE.md` depuis ce plan : IA, epic2-copy, Component Patterns, State Patterns, epic2-conservation, epic2-focus et section normative epic2-metrics reliée aux parcours2/3/5 ; sept parcours et supplément Graphe conservés. Réemployer Préparation d’un échange, Champ de réponse, Détails de contexte, Registre des preuves, Indicateur d’état, Récapitulatif de tour et primitives de choix existantes.
- `../../../ux-madness/DESIGN.md` : Layout & Spacing/Components, lignes textuelles et détails dépliables ; renvoi explicite au DESIGN racine autoritaire Oxanium16/14. Ne pas migrer les anciennes valeurs Segoe de ce spine ni changer ses tokens.
- `../../../ux-madness/.memlog.md` : canonique via memlog.py seulement, parent propriétaire. `DESIGN.md` racine et `.impeccable/design.json` décrivent le monde livré et restent inchangés ; surface brief peut recevoir un seul renvoi prospectif si utile.
- Enquête lecture seule metrics212_sally_map : Sally réellement activée (agent/config, prepend/append/faits vides, epic/entrée12) ; Impeccable4.3.1 context exit0 + Shape/Operate, craft-floor omis car planning-only. Parent a aussi activé Sally et bmad-ux Update headless (config/références/ticket/spines/memlog lus). Aucun choix produit restant.
- `.agents/skills/bmad-ux/` : le worker exécute le sous-travail de distillation Finalize du parent. Lire spécification DESIGN, tous exemples design/experience du customize.toml et Pass1 validate ; pas relancer découverte/Build imbriqué/reviewers de son côté. Parent applique ensuite standards structure puis prose et Quick/cohérence.

## Tasks & Acceptance

**Execution:**
- [x] Les deux spines adoptés — extensions ciblées IA/copie/visuel/comportement/états/focus/conservation et parcours nommé Sam avec étapes, moment décisif, échecs ; sources et ancres exactes. Distinguer choix du prochain tour et rattachement historique, sans créer de surface permanente.
- [x] `../qualification-parcours-mesures-us/contrats-et-couverture.md` — index court D1–D6↔M1–M8↔ancres, obligations11/13/14, limites/provenance Sally/Impeccable, spine-only explicitement retenu par ce plan. Exemples chiffrés marqués prospectifs.
- [x] Même dossier `verification.json` — walkthrough documentaire réellement effectué pour chaqueM1–M8 avec entrée/attendu/règle trouvée/verdict ; Pass1 paires composants/tokens/section/liens locaux/FR–EN et comparaison des tokens, sept parcours, supplément Graphe et inputs produit avant/après. Conserver nombre effectif, pas de cases vertes préremplies.
- [x] Parent — journal via memlog.py, standards structure puis prose sur les ajouts (ne pas réécrire les historiques), Quick/cohérence avant consommateurs, triage/corrections/rechecks du même worker/relecteur. Finaliser deux statuts/date et journal sans prétendre nouvelle validation humaine. Commit local ciblé puis2.11/13 autonomes.

**Acceptance Criteria:**
- Given D1–D6 et les contre-exemples, when le lecteur parcourt choix, échange, consultation et réouverture, then il connaît US/provenance/périmètre/couverture/inconnus et ne peut confondre durée, réussite et coût.
- Given les contrats FR/EN et le monde atelier existant, when11/13 consomment cette extension, then les nouveaux champs/actions/échecs ont des règles nommées sans nouvelle palette/composition, saisie perdue ni capacité produit annoncée par une spécification.

## Implementation Notes

- Worker context-free metrics212_implementation : deux spines et index/proof seulement. Walkthrough documentaire8/8 (46règles),30composants appariés,10lignesFR/EN ; tokens, sept Key Flows et deux suppléments Graphe exacts conservés.161inputs et ASAR inchangés. Premières anomalies du checker (auto-lien, EOL, sélection de table) conservées dans .working/metrics212-worker-initial-verification.json, aucun correctif produit ni campagne native. Lot gelé et diff intégral lu par parent avant revue.

- Parent après éditorial : checker exit0 avec mêmes8cas, sept parcours/Graphe/tokens/161inputs/ASAR exacts ; mêmes relecteurs S1/P1/P2 résolus et Quick[]. Métadonnées et journal finalisés, aucun correctif différé ni preuve native/UI inventée. Rapport qualification-parcours-mesures-us/parent-verification.md.

## Plan Change Log

## Review Triage Log

- Passage1 : Quick[] ; standards structure1/prose2. Trois constats low, tous patch ; aucun high/medium/false/maybe-false, aucune cause différée. Vérification parent dans la section entière et ses ancres : titres absents de navigation ; objet/source actuelle ambigus ; « leurs sept corps » ambigu entre trois parcours cités et sept existants. Corrections markup/trois formulations directes, aucun nouvel état/surface/règle, même worker recontacté.

| Constat | Verdict | Route | Preuve / action |
|---|---|---|---|
| S1 Sous-titres | low | patch | Six libellés gras non exposés comme titres ; promouvoirH4 à texte/ancres/ordre identiques. |
| P1 Source actuelle | low | patch | Objet du rattachement et fraîcheur insuffisamment nommés ; expliciter reçu/source capturée. |
| P2 Sept corps | low | patch | Trois parcours cités puis possessif sept corps ; nommer le corps des sept parcours. |

- Passage2 ciblé : S1/P1/P2 résolus par mêmes acteurs, Quick[] ; aucun nouveau finding, aucune entrée différée. Bloc gelé et baseline conservés.

## Design Notes

Routefull : extension documentaire >100lignes sur plusieurs sections, risque medium de confusion métier, sans nouvelle règle de mesure ni effet produit. Pas de limite en tokens. Headless et checkpoints délégués par mandat explicite ; pas de question routinière. Références spine-only pour cette extension de composants existants, sans nouveau mock/capture.

Root réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, branchecodex/bmad-initiatives-2-3. Utiliser pwsh/login:false/workdir absolu/require_escalated ; hostcwd obsolète. Worker propriétaire seulement des deux spines et du dossier qualification-parcours-mesures-us (éventuel renvoi ciblé dans surface brief), pas du plan/memlog/revues/git. Tu n’es pas seul : ne rétablis pas les changements d’autrui. Aucun autre agent de production imbriqué. Parent gère activations, mémoire, documentation des standards/revues, statut et commit. Préserver le stat/EOL-only tests/bmad-help-boundaries.test.mjs, fichiers managed/untracked, profils et préversion interactive. Nettoyer seulement les sorties temporaires possédées une fois contrôlées ; aucun paquet généré ici.

## Verification

**Commands:**
- Contrôle documentaire local : parser les deux YAML, vérifier tokens inchangés et références résolues, composants appariés, liens/ancres nouveaux et FR/EN ; comparer les sept Key Flows et supplément Graphe exacts au baseline. Les scripts ponctuels vont dans `.working/`, pas nouveau test produit textuel.
- Comparer161inputs/ASAR du gel2.10 avant/après ; `git diff --check` sur le lot — aucune source/paquet altéré.

**Manual checks:**
- Exécuter un walkthrough documentaire M1–M8 et citer les règles/ancres pour chaque attente. Ces cas ne sont ni tests UI ni preuves natives. Parent relit le diff entier puis Quick, structure/prose et résolutions nécessaires. Pas de test app/build/NSIS ni campagne globale pour ces seuls contrats.
