---
title: 'Consulter le temps et le coût connus d’une US'
type: 'feature'
ticket: '13'
created: '2026-11-05'
status: 'built'
baseline_revision: '6f79bf59b6583e77a8f669304bc5c0dc7055cdb8'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick', 'values-high', 'impeccable-finish']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-parcours-mesures-us/contrats-et-couverture.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
---

<frozen-after-approval reason="intent approuvé sous mandat humain full autonomie ; ne modifier que par renégociation humaine">

## Intent

**Problem:** Les mesures11 sont conservées mais invisibles. L’utilisateur ne peut ni choisir volontairement l’US du prochain tour ni comprendre ses durées, preuves, limites et coût indisponible dans Madness.

**Approach:** Consommer les commandes et projections11 dans les préparations/champs existants, puis le Registre des preuves et les récapitulatifs. Livrer un candidat Windows utile avec choix facultatif et consultation sourcée selon Sally12, sans nouvel écran permanent ni règle de mesure.

## Boundaries & Constraints

**Always:** D1–D6 et EXPERIENCE#epic2-metrics de Sally12 gouvernent choix/lecture/erreurs. Monde atelier livré du DESIGN racine, Oxanium/Barlow/palette et commandes compactes conservés. Choix initial Non attribué, explicite pour chaque nouveau tour, une story qualifiée et une occurrence/proof/contexte exacts. Le contexte capturé reste immuable après ACK. Questions/décisions natives appartiennent au tour existant ; un ajustement est un nouveau tour. Le cœur reste seul calculateur, qualificateur et exécuteur ; les groupes de preuves sont fournis par références versionnées, sans normalisation/jointure supposée dans le renderer.

Durée connue0 et inconnue distinctes, unités et couverture/tours/chevauchement nommés ; historique non instrumenté, données partielles, conflits et sauvegarde échouée explicites. Bornes/provenance/contexte et résultat fonctionnel séparés. Choisir/consulter/revenir/rouvrir restent passifs, sans appel modèle/helper/compte/réseau. Un refus de choix ne perd pas la rédaction ; Continuer sans attribution reste explicite si les gardes existantes l’autorisent. Arrivées tardives n’imposent ni navigation ni focus/défilement. Anciennes commandes et archives restent admissibles, aucune réattribution historique.

**Never:** Nouveau moteur/auth/fournisseur, calcul d’usage/coût/tarif API ou abonnement, reconstruction d’historique, nouveau pouvoir fichier, partage de choix global ou nouvelle autorisation native. Pas de nouvel onglet/tableau de bord, remplacement de charte, police/asset/dépendance/runtime, refonte générale ni traduction intégrale14 anticipée. Aucun compte/profil personnel ou préversion interactive modifié/fermé. Les anciens17échecs globaux restent exacts et ne deviennent pas verts ; pas de nouvelle campagne globale sans nécessité, ni nouveau clic Zscaler. Aucun gate humain/WCAG/G2–G5 acquis par une fixture.

## I/O & Edge-Case Matrix

| Cas | Entrée / état | Attendu | Échec / récupération |
|---|---|---|---|
| U1 Choix | Mary/deux modes, Forge, aide, catalogue préparé ; story qualifiée ou Non attribué | Une sélection locale par intention de prochain tour, contexte/id/occurrence et détails accessibles ; choix seul ne transmet rien. Au clic, requestId/texte/opération exacts corrélés via choose puis méthode mesurée existante | Types absents/spike/@file/ambigu/historique sans autorité non sélectionnables avec motif ; dialogue non attribué possible |
| U2 Invalidation | Changement projet/initiative/conversation/préparation/preuve ; lecture identique ; partiel/source perdue ; réponse tardive | Invalider l’ancien choix avec raison sans perdre texte ; une lecture strictement équivalente ne l’annule pas ; aucun héritage depuis dernier tour ou US consultée | Choisir de nouveau ou continuer volontairement sans attribution ; aucun choix opaque issu d’un événement global utilisé pour envoyer |
| U3 Tours | Envoi libre, question/réponse, accord/refus, ajustement après écriture durable ; deux clics | Verrous/gardes existants, texte exact figé au point d’envoi ; seule demande d’ajustement crée nouveau choix/tour ; rattachement historique demeure visible | Échec/retard/pending ne mélange ni brouillon ni demande ; aucun rejeu implicite ou changement de permission |
| U4 Nombres |10min connues ; vrai0 ;10min+2inconnus ; tous inconnus ; aucun tour ; deux parallèles10+10 | Valeurs et couverture exactement issues du cœur, 20min cumulées avec chevauchement connu/inconnu selon preuve ; unité et comptes visibles | Null jamais0/tiret ambigu ; définition ACK→terminal/close prouvé, attentes incluses, ni effort/CPU/calendrier/succès |
| U5 Preuves | Plusieurs US/conversations/occurrences ; alias locaux et attribution contradictoire | Détails par groupe/tour selon référence cœur : tous reçus membres, identités, bornes/domaine, sources/révisions et résultat ; conflit non attribué n’entre pas dans cumul US | Ancienne projection sans référence de membres : liaison exacte indisponible, aucune heuristique localTurnId/titre, aucune normalisation UI |
| U6 Conservation | RAM connue mais write échoué/pending ; ancien write tardif ; retry | Mention de session/non durable et erreur ; retry sauvegarde seulement ; durable distinct de durée et résultat | Ne jamais promettre ces bornes après fermeture ; garde de dialogue prioritaire |
| U7 Reprise | Annexe durable puis fermeture/réouverture, ancien Snapshot, source disparue, hors ligne | Lecture passive par projet ; identité historique et mesures conservées sans nouvelle collecte, historique non instrumenté inconnu ; US non courante encore consultable | Bridge/annexe illisible : motif durable et rédaction disponible, aucun montant ou source courante inventé |
| U8 Accès | Clavier, clair/sombre,720px,zoom200,noms longs,mouvement réduit | Choix et motifs nommés sans couleur/survol seuls ; détails progressifs, focus rendu/repli neutre, aucun saut à l’arrivée ; contexte/texte/actions restent accessibles | Pas de grande carte avant dialogue ou débord horizontal ; choix ne recouvre pas question/approbation/saisie |
| U9 Frontière | Mauvais contexte, choice refusé, méthodes absentes, lancement catalogue et autres | Pas d’effet sur refus ; erreurs près du choix et sources ; distinguer reçu catalogue durable de simple requestId d’un lancement Mary/Forge/aide | Pas de faux passage catalogue bloquant la navigation ; legacy non attribué ne dépend pas du bridge métrique |
| U10 Livraison | Candidat compilé/NSIS, profil témoin exact, consultation et réouverture locale | Même UI/code/ASAR sourcés, traces locales et chiffres synthétiques marqués ; données personnelles intactes et témoins propres fermés/nettoyés | Panne externe reportée avec artefact/condition ; garder un seul candidat courant + ancien setup de secours + préversion utilisateur |

</frozen-after-approval>

## Code Map

- `src/renderer/src/App.tsx:106–121,182–221,257–267,327–388,415–479,571–627` : état du projet/conversation, verrous et gardes, launch/send/adjust et retours exacts. Réutiliser les handlers ; choice au clic seulement, jamais frappe/rendu. **Piège261–262 : pendingLaunch.requestId signifie actuellement catalogue**, donc distinguer sa provenance avant de donner un requestId aux autres lancements mesurés. Capture du mode Mary exact. Les submit actuels sauvegardent seulement.
- `src/contracts/dialogue.ts:24–33`, `src/preload/index.ts:62–75,146–150`, `env.d.ts` : sendMeasured(projectId,conversationId,text,requestId,choiceRef), launchMeasured(kind,projectId,requestId,choiceRef,preparationId?,mode?), adjustMeasured(approvalId,requestId,choiceRef). choose(projectId,conversationId,requestId,storyRef,text,operation). Lancement conversation/texte null ; ajustement texte réellement durable après attente approvalWrites. Mode Mary est sixième argument ; catalogue requestId=preparation.id et opération launch-catalog. Questions/decideApproval sans nouveau choix. Legacy déjà instrumenté non attribué.
- `src/renderer/src/UsMetrics.tsx` nouveau : hook séquence+abonnement+read par projet, état d’erreur séparé et composants choix/détails/cumul réutilisés. Suivre useBmadProgress/HelpPanel ; bridge absent/refusé ne rend pas legacy impossible. Filtrer par projet/racine/initiative/occurrence/conversation capturés ; état de prochain tour local réinitialisé, distinct de l’US consultée et du choiceRef global. Primitives de choix natives existantes, ouverture progressive calme et motif près du contrôle.
- `src/contracts/us-metrics.ts:11–37`, `src/core/us-metrics.ts:41–46` : consommer summary/stories/conversations/observations autoritaires, null≠0. reasons exacts, observation.durable et storage/durableRevision. Aucun appel normalizeTurns/summarizeTurns depuis UI. **Couture minimale permise :** ajouter aux observations une métadonnée optionnelle de membres versionnée `members:{schemaVersion:1,recordIds:string[]}`, produite depuis t.records[].id et validée strictement. État v1 ancien sans members toujours admis ; archives/snapshots/commandes inchangés. UI sans members ne devine pas une jointure et indique limite ; avec members sélectionne seulement IDs exacts de la même annexe. Tests membres d’alias/conflits, IDs locaux identiques dans groupes distincts, forme ancienne/malformée.
- `src/renderer/src/ProjectResume.tsx:13–17,24–45,60–64` : ajouter accès Voir les mesures de story aux entrées et détails dans Registre ; archive.occurrences fournit l’historique sans candidat courant. Conserver présenté/disponible et consultation de preuve. `WorkOverview.tsx:6–29` est le vrai Recap : détail de tour et historique par contexte complet, même lorsque value.turn est null après réouverture. Ne pas recréer ConversationRecap/fr.ts.
- `CatalogLaunchPanel.tsx:11–16`, `HelpPanel.tsx`, `ApprovalPanel.tsx:22–27` : insérer le choix dans la préparation ou près de l’envoi d’ajustement uniquement, callbacks/slots si utiles, préserver garde, annulation et texte. Pas de sélecteur ajouté aux questions ni décisions du tour existant.
- `strings.ts:9–20` : chaînes fr/resumeLabels/variantesEN réelles ; livrer les nouvelles copies FR et leurs clés/équivalents EN normatifs de EXPERIENCE#epic2-copy, sans changer l’infrastructure globale de langue avant14. `styles.css` puis `atelier-immersion.css` puis `atelier-controls.css` : styles ciblés réemployant tokens/cibles/détails, pas de nouveaux hex/fonts. DESIGN racine prime anciennes valeurs Segoe du spine.
- Tests renderer : `tests/connection-ui.test.mjs:21–90` compile vrai App en mémoire, Electron/profil isolés, bridges contrôlés, aucun Main/fournisseur/réseau ; ajouter bridge métrique validé et nouveau fichier/harness partagé seulement si utile. Réemployer focus/reprise154–227, retours764–807, recaps752. Éviter réexécution globale de ce fichier ; lancer noms ciblés pertinents et nouvelles interactions. Les douze anciens rouges restent suivis séparément.
- Tests cœur `tests/us-metrics.test.mjs` et `us-metrics-review.test.mjs` : ajouter uniquement preuve de membres/compatibilité, garder règles et sceaux11. Qualification packagée passive réutilisable `scripts/qualification/project-library.mjs:1–17,42–61` et `workspace-design.mjs:22,50,70` (fenêtres/fermeture possédées), novo banc `scripts/qualification/us-metrics-ui.mjs` si nécessaire. Fixture de chiffres synthétiques nommée comme telle ; pas faux reçu SIWC.
- Incumbent visuel inspecté par parent : qualification-lancement-catalogue/package-mary-002/prepared-dark.png et prepared-compact-light.png, candidat0.2.14 ; depuis32c59c… seul env.d.ts a changé sous renderer, aucune charte à remplacer. Root Impeccable context déjà exécuté une fois dans cette session, Operate lu ; worker frais context une seule fois dans sa session et craft-floor immédiatement avant premier edit UI. Vérifier définition officielle des handoffs de finition/documentation, pas jeu de rôle fictif.

## Tasks & Acceptance

**Execution:**
- [x] Tester d’abord les comportements U1–U9 utiles (TDD et writing-good-tests déjà prescrits au dépôt), rouge attendu puis correction ; fixtures réelles, assertions sur affichage/envois/absence d’effet, pas copie du reducer.
- [x] `src/contracts/us-metrics.ts`, `src/core/us-metrics.ts` et tests — seule extension passive de membres versionnée/compatible pour preuves exactes ; aucun calcul/rattachement/durabilité nouveau. Anciennes projections sans métadonnée lisibles avec limite explicite.
- [x] `src/renderer/src/UsMetrics.tsx`, `App.tsx`, préparations et Recap/ProjectResume — choix locaux, commandes exactes et garde de provenance, consultation sourcée et reprise passive, erreurs/conservation/retour ; aucune nouvelle destination permanente.
- [x] `strings.ts` et styles ciblés — copie/nombres/unités localisables, atelier et états/clavier/focus/zoom. Laisser la traduction globale14 et le sweep15 distincts.
- [x] Tests UI/qualification `us-metrics-ui` — valeurs connues0/partielles/inconnues, membres/source/couverture, plusieurs scopes/conversations, choix/invalidations/questions/ajustement, stockage et retard, fermeture/reprise sans moteur. Journaux et sceaux exacts sous `../qualification-affichage-mesures-us/`, témoins nettoyés après arrêt prouvé.
- [x] `package.json`/lock version0.2.15, build existant et un candidat dans `dist/us-metrics-reviewed` ; ressources/runtime inchangés, contrôle Main/preload/persistance passif sur profil propre si faisable. Pas d’installation personnelle ni fermeture de la préversion utilisateur. Après qualification garder ce candidat et l’ancien setup0.2.14 comme secours, nettoyer uniquement anciens binaires possédés selon politique.
- [x] Parent — lecture diff/matrice, Quick + audit high indépendant des valeurs affichées↔preuves/couverture dont0etcoûtindisponible ; même worker/reviewers pour corrections. Impeccable deux lots visuels maximum, un détecteur, substitutions officielles fraîches si rôles natifs indisponibles ; ship ciblé et documentation sans validation humaine inventée. Commit local puis14 autonome.

**Acceptance Criteria:**
- Given plusieurs US/occurrences/conversations avec mesures connues, partielles et absentes, when l’utilisateur choisit volontairement avant un nouveau tour et consulte après navigation/réouverture, then il retrouve l’identité capturée et la valeur exacte avec couverture/conservation/provenance, sans réattribution ni nouvel agent.
- Given contexte ou source changeants et échec de bridge/stockage, when l’utilisateur conserve sa rédaction et utilise les choix/récupérations, then aucune transmission ni promesse durable ne survient sans les gardes et le clic explicite appropriés.
- Given les variantes atelier existantes et les copies de Sally12, when le nouveau parcours est utilisé au clavier et aux formats vérifiés, then choix/états/actions/détails restent compréhensibles sans remplacer la charte ou annoncer un coût non qualifié.

## Implementation Notes

Extension livrée sur les surfaces existantes ; qualification/calcul/durabilité restent au cœur11. Choix local une fois par tour et membres exacts optionnels/versionnés, détails anciens sans jointure supposée. Q1/Q2/Q3/V1/F1/P1 résolus, rechecks des mêmes relecteurs dans `../qualification-affichage-mesures-us/reviews-final.json`. P2 simple suppression d’un seuil de taille du test de copies ; deux corrections du banc de captures conservées, CSP produit inchangée. Le parent a lu les deltas et la documentation, vérifié les matrices et le paquet final ; aucun correctif produit différé, anciennes limites globales/native externes intactes.


## Plan Change Log

## Review Triage Log

| ID | Relecteur | Verdict | Preuve vérifiée et route |
|---|---|---|---|
| Q1 | Quick | medium | App215 filtre uniquement la sélection consultée ; capture100 compare l’initiative de la conversation, et l’adapterMary414 capture core.active_initiative. Une consultation beta pendant conversationalpha présente donc un mauvais candidat. Patch : correction privée de la couture d’admissibilité par opération à partir des contextes déjà observés, sans nouveau contrat ni autorité. |
| Q2 | Quick | medium | App341–346 attend choose après la dernière écriture ; changeApproval333–337 reste autorisé et ApprovalPanel22 reste éditable. approvalCommand159 lit la saisie courante et marque unknown au refus A/B. Patch : utiliser le verrou de demande existant pendant cette attente, figer saisie/écriture et le rendre perceptible ; aucun nouveau protocole. |
| Q3 | Quick | low | UsMetrics28–49 et nouvelles lignes ProjectResume portent encore des copies FR hors metricsLabels ; leurs variantesEN sont absentes. Patch mécanique : clés FR/EN appariées pour toutes les nouvelles copies, sans anticiper l’infrastructure globale14. |
| V1 | Audit valeurs high | medium | accept83 désactive l’occurrence du registre, sans modifier le snapshot immuable du tour. Observation33 utilise son ancien active=true pour masquer l’avertissement. Patch : afficher séparément le statut actuel de cette occurrence exacte et ses preuves capturées intactes ; jamais jointure par titre/idnatifs ni remplacement des sources. |
| F1 | Finition Impeccable | medium | Captures package01/02 : StoryFacts49 place chemin/révisions/hash avant la valeur, absente du viewportcompact ; ordre contraire à DESIGNUX302. Patch : en-tête compact puis valeur/couverture/usage/coût, preuves complètes dans disclosure nommé. Seconde et dernière passe visuelle groupée après corrections. |
| P1 | Parent | low | MetricChoice82 affiche Type absent ou non qualifié pour un candidat réellement qualified mais refusé par eligible. Le contrôle existe déjà ; patch direct de copie pour expliquer le contexte différent, sans nouvelle garde. |

Toutes les inspections sont revenues avant triage. Six lignes conservées avant regroupement. Corrections privées directes : aucun changement de calcul, capture, autorité native, archive ni commande publique ; aucun intent_gap/bad_plan démontré. Le plus petit correctif utilise uniquement des états déjà présents et prouvés par les callers. Aucune nouvelle boucle de planification ; bloc figé intact.

Recontrôle1 : Q2/Q3 résolus par Quick, V1 résolu par son audit d’origine. Q1 demeure non résolu : Main205 impose aussi sélection.initiativeId/racine et observation.revision===story.contextRevision. Le correctif privé doit respecter simultanément cette autorité courante et la cible native capturée, jamais modifier Main pour rendre la fixture admissible. La première sélection de tests Q1 s’arrêtait aux bridges contrôlés ; elle ne prouve pas cette autorité Main.

| ID | Relecteur | Verdict | Preuve vérifiée et route |
|---|---|---|---|
| Q1-r1 | Même Quick | medium | Main204–208 lu : sélection/identité/racine/révision courantes exigées avant capture. App corrigé ne contrôle pas sélection/révision pour sendalpha consultbeta. Patch direct : ajouter les préconditions existantes à l’admissibilité de toutes les opérations puis garder leur contexte propre ; motif/Nonattribué explicites. Aucun backend/contrat modifié. |

Recontrôle final : Q1-r1 résolu par même Quick sur les conditions Main réelles ; Q2/Q3/V1 déjà résolus. F1 résolu/SHIP ciblé par même finisseur sur les sept dernières vues complètes. P1 motif distinct et P2 suppression directe du seuil arbitraire vérifiés ; aucun changement du bloc figé. Les bancs seuls ont été corrigés pour cadre natif complet puis CSP, sans correctif produit ni relâchement de protection. Voir rapport parent pour chaque révision de test, les anciens rouges et les limites.

## Design Notes

Routefull (>100lignes/plusieurs surfaces couplées), risquehigh : une mauvaise valeur/source/US tromperait l’utilisateur. Pas d’inconnue produit : D1–D6 et Sally12 adoptés, délégation complète hitl/checkpointsfalse. Méthodes/stockage11 réutilisés ; seule référence de membres optional/versionnée complète la projection de consultation sans nouveau modèle métier. UI se limite aux surfaces existantes, pas de refonte générale ni nouvelle découverte.

Root réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, branchecodex/bmad-initiatives-2-3. Tout exec pwsh/login:false/workdirabsolu/require_escalated même lectures ; hostcwd obsolète. Worker propriétaire des fichiers ci-dessus/tests/banc/proofs, tu n’es pas seul : préserver changements d’autrui, managed/untracked et statEOLboundary. Parent seul plan/frozen/revues/statuts/git, aucun nestedBuild ni agent de production imbriqué. Ne pas repinner les preuves11/12 ou les rapports17rouges. Préserver profils réels et dist/graph-preview-0cf3cc35 (saisie possible) ; pas de consentement/modèle/OAuth/GETJWKS ou demandeIT. Nettoyer seulement processus/fichiers possédés après preuve de fermeture, en PowerShell natif et chemins absolus vérifiés. Candidate courant + un ancien setup + préversion utilisateur, preuves retenues.

## Verification

**Commands:**
- Tests métriques des deux fichiers réellement modifiés + nouveaux cas UI et régressions pertinentes par nom, en fenêtres/profils isolés. Ne pas relancer npmtest global :11 le conserve déjà750/767 et17rouges, consumer13 dispose d’oracles ciblés ; étendre seulement si nouvelle correction/erreur le justifie. Rapport exact des cas/motifs, aucune sélection présentée comme suite globale verte.
- `npm run build` inclut types ; un NSIS via electron-builder outputdist/us-metrics-reviewed après code stable et avant contrôles du candidat. Auditer seules sorties/pins réellement pertinents ; pas nouvelle qualification735/2305 ressources ou exportCLI.
- Banc local compile/paquet passif, source/ASAR/versions/inputs reliés, compte/profilepersonnel jamais utilisé. Aucun appel modèle pour fabriquer une mesure ; chiffres des témoins marqués synthétiques.
- `git diff --check`, triage/rechecks et journal compact. Un seul détecteur Impeccable et deux tours visuels groupés au maximum (clair/sombre, courant/720/zoom200 groupés), corrections observées regroupées. Après vert ne pas répéter une campagne sans préoccupation précise.

**Manual checks:**
- Parent voit les valeurs/détails/focus dans captures exactes et rapproche U1–U10/copies Sally ; audit indépendant high sur provenance et inconnus. La source des anciennes captures0.2.14 ne devient pas celle du candidat0.2.15. NativeSIWC, acceptation humaine et G2–G5 manquants reportés précisément à16, aucun clic réseau ajouté par défaut. Impeccable finition/documentation ciblées par agents techniques frais lisant leurs instructions officielles si besoin.
