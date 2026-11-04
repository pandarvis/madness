---
title: 'Actualiser les preuves après des changements externes'
type: 'feature'
ticket: '5'
created: '2026-11-04'
status: 'built'
baseline_revision: 'bd4b6ea95b42d9abae9f7de488c77d0487a32d96'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-actualisation/ux/sally-update.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les preuves, la reprise et une préparation BMad peuvent rester apparemment actuelles après une modification externe. Une lecture lente ne doit ni perdre une saisie ni remettre une ancienne prochaine action au présent.

**Approach:** Observer localement les seules dépendances réellement qualifiées, invalider immédiatement les vues concernées et regrouper leur réobservation sur la voie locale existante. Conserver la version affichée jusqu’à une bascule volontaire vers une nouvelle observation ; les contrôles natifs au point d’action restent obligatoires.

## Boundaries & Constraints

**Always:** Identité projet/racine/initiative, révision des octets, provenance et absence restent explicites. Séparer fraîcheur, activité de lecture et santé de surveillance. Une seule lecture coûteuse en vol par projet, une suite groupée au maximum, même propriétaire local/admission que les lectures2.4/18. Premier accès après réouverture volontaire ; restauration passive. Préserver sélection, contexte capturé, accords historiques, brouillons projet/demande/conversation et historique. Contrat Sally EXPERIENCE #epic2-refresh : même contexte et nouvelle révision reçue ne remplacent pas la version lue ; seule Afficher la nouvelle observation ou un vrai changement de contexte peut fermer les anciens détails. Le focus extérieur aux preuves n’est jamais repris. Risque high : une erreur pourrait autoriser un effet sur des fichiers différents.

**Never:** Événement fichier traité comme preuve de contenu/auteur/session, accord transféré, commande ou code du projet exécuté, nouveau fournisseur/réseau/compte ou polling illimité, nouveau propriétaire moteur, contournement BUSY/STOP_UNCONFIRMED/admission nested pour un refresh de fond. Aucun changement Snapshot v1, coffre, modèle ou profil personnel. Pas d’historique illimité de projections ni installation personnelle par story. Aucun clic Zscaler, configuration IT, token ou acceptation humaine sollicités/fabriqués. Pas de refonte graphique ni migration opportuniste.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| F1 Nominal local | Capture volontaire qualifiée puis modification externe d’un ticket | Ancienne/date/révision signalées immédiatement ; collecte groupée locale ; nouvelle preuve disponible sans remplacer les détails lus ; bascule explicite cohérente | Réponse tardive étrangère rejetée |
| F2 Absence/remplacement | Suppression, ajout d’un fichier auparavant absent, remplacement mêmes octets, renommage initiative/racine, inventaire modifié | Identités/inventaires/absences surveillés, disparition et couverture honnêtes, sélection conservée sans réattribution | Refus/ancien/incertain, jamais succès déduit du hint |
| F3 Courses | Mutation pendant capture ou entre contrôle et publication, choix beta pendant lecture alpha | Génération invalidée synchroniquement ; reread destination/root/selection après await ; aucun résultat périmé promu courant | Une suite groupée après stop connu ; pas de boucle sans fin |
| F4 Rafale/occupation | Nombreux événements pendant une lecture ; fournisseur actif ; arrêt inconnu | Coalescence et au plus une suite en attente ; aucune lecture concurrente ni file par événement ; vieux résultat visible | BUSY diffère sans spin ; arrêt inconnu exige récupération existante |
| F5 Surveillance dégradée | Erreur/filename absent/perte ou remplacement de répertoire, limite de ressources | Freshness incertaine immédiatement, aucune garantie d’événement ; récupération par réconciliation explicite et au retour de focus si observation déjà armée | Bornes et couverture exposées, aucun tour provider automatique |
| F6 Décision | Changement pendant préparation aide, capture contexte, envoi ou approbation | Préparation ancienne n’autorise pas de nouveau départ ; reçu/réponse/accord d’origine conservés ; contrôle natif juste avant effet rejette les préconditions changées | Nouvelle préparation explicite, aucun rejeu de message/accord |
| F7 Lecture/saisie | Détail ouvert et scroll, focus dans preuve ou composeur pendant invalidation/nouvelle réponse | Ancien label persistant même reading/error ; nouvelle observation annoncée une fois par projet ; commande volontaire ; saisies et focus extérieur inchangés | Repli focus seulement si la cible focalisée disparaît par action volontaire |
| F8 Fin/restauration | Navigation, fermeture pendant debounce/read puis réouverture profil témoin | Watchers/timers fermés synchroniquement, retours tardifs ignorés, arrêt local prouvé ; lecture initiale passive et données exactes | Inconnu conservé sans suppression témoin incertain |

</frozen-after-approval>

## Code Map

- `src/core/bmad-context.ts::BmadContextCoordinator` possède les générations et sélections ; étendre cet owner avec un port d’observation injecté, scopes/générations de fraîcheur et invalidation synchrone. `execute` incrémente actuellement mais capture/assertFresh/consultSelection ignorent ces générations ; ajouter contrôles après await et seconde lecture Application/root avant publication. Ne pas changer la signification des révisions de contexte : les tickets n’entrent pas dans contextRevision et ne réécrivent pas un contexte durable capturé.
- `src/adapters/bmad/{help,context,progress}.ts` : run retourne déjà `{result,folder:data,raw}` après arrêt qualifié ; `data/capture.json` est disponible et safe(...,4MiB) existe. Ajouter une enveloppe interne typée valeur publique + descripteur de dépendances qualifié, jamais chemins libres IPC. Maintenir les signatures publiques/fixtures en adaptant ports internes. Observer sur la voie de consultation normale (internal=false) ; les guards d’un tour fournisseur gardent leur voie interne légitime.
- `resources/bmad-help/{capture,worker,progress}.py` : capture possède roots/dirs/files/lists/optional/legacy/refused/fileIdentities/copies et rechecks ; worker.fresh les vérifie. Progress garde lectures/inventaires/absences/refus privés puis ne publie que sources au snapshot. Exporter ces dépendances en section distincte du reçu interne après rechecks, sans remplacer les clés contexte ni sa révision. Si cette section participe à un fresh, le vérifier réellement ; sinon le nommer hints et ne pas prétendre une revalidation. `help-manifest.ts` doit épingler exactement les seules ressources modifiées.
- Nouveau `src/adapters/bmad/change-observer.ts` et petit port cœur (dans bmad-context ou fichier dédié) : fs.watch non récursif sur répertoires canoniques qualifiés et parents utiles aux absences/remplacements. Aucun scan arbitraire du dépôt/home ni chemin fourni par renderer. Revalider les identités/ancêtres avant attachement, ne pas suivre de lien ; traiter filename null/erreur/limite comme invalidation ou dégradation. Prévoir fenêtre capture→attachement, remplacement du répertoire surveillé et reconfiguration des scopes : une réconciliation qualifiée ferme les trous connus avant une publication actuelle. Les notifications ne remplacent jamais les contrôles natifs.
- `src/core/bmad-progress.ts` : capture locale actuelle avec cancel/newgeneration et relecture destination après collect. Adapter single-flight+dirty trailing, mémoriser ancien snapshot/freshness indépendamment de status reading, consommer invalidations du contexte/observer. `src/core/bmad-help.ts` : invalider préparation ready, préserver bundle/records historiques, vérifier génération/destination/root après prepare et avant profile. Abonnements possédés et supprimés à shutdown.
- `src/core/lifecycle.ts::ActivityAdmission` et `src/adapters/bmad/help.ts::run` sont le propriétaire commun : aucune activité locale concurrente/provider-nested de fond. Réutiliser les signaux de disponibilité existants ou ajouter une notification privée de libération avec unsubscribe ; pas de retry timer infini. Shutdown existant appelle membres en parallèle : closing et annulation watchers/timers synchrones avant tout await. `src/core/dialogue.ts` capture/assertCaptured et guards approval existants restent autorité au point d’effet ; extension minimale seulement si la course F6 l’exige.
- `src/contracts/{bmad-context,bmad-progress,bmad-help}.ts` : états de vue stricts, validateurs exact-key et fixtures doivent porter fraîcheur/activité/santé sans migration du snapshot ou HelpRecord. Sélections/conversations persistantes restent inchangées. Main/preload/env composent le port métier : aucune API de lecture/watch de chemins bruts. Réconciliation au retour focus seulement pour contexte déjà volontairement observé ; démarrage/reopen ne lance rien.
- `src/renderer/src/{ProjectResume,HelpPanel,InitiativeSelector,App}.tsx`, `strings.ts` et `{progress,help,initiatives,styles}.css` : ProjectResume conserve une version présentée distincte de la plus récente collectée. readingScope ne dépend plus de snapshot.revision reçu, fermeture uniquement au switch volontaire/contexte différent. Focus actuel vérifié avant repli. Garder WorkOverview/history/drafts et navigationToken existants ; ancien résultat aide identifiable et non lançable. Deux thèmes, clavier/compact/zoom200 et libellés FR/EN selon spines, charte root DESIGN autorité.
- `tests/bmad-{context-sources,context-dialogue,progress,progress-protocol}.test.mjs`, `tests/approvals-protocol.test.mjs`, `tests/connection-ui.test.mjs`, nouveaux tests observer/coalescence : réutiliser mutations/identités/courses, owner/admission, hooks différés et vrais App/styles. Q3UI ancien exigeait fermeture sur révision ; l’adapter explicitement à la décision Sally, pas une régression masquée. Scoper nouveaux locateurs région/initiative-control, ne pas corriger huit diagnostics globaux étrangers (quatre ambiguïtés choix, recap double, deux géométries, fakePE).
- `scripts/qualification/bmad-progress.mjs` offre Main/preload réel en profil Temp possédé, close/reopen passif/drafts ; nouveau banc sous qualification-actualisation pour changements FS réels, provenance/ressources/pins et paquet exact. Les visuels historiques ne prouvent pas une fraîcheur FS. `package.json`+lock root version0.2.9 pour candidat distinct si packaging ; aucune dépendance nouvelle, sortie dist/external-refresh-reviewed, pas d’installation personnelle.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts`, cœur/observer tests — tests rouges comportementaux F1–F8, fraîcheur séparée, epochs/single-flight/dirty et scopes internes validés ; pas un rouge de syntaxe ou présence de champ.
- [x] Runtime/adaptateurs/pins/observer — dépendances qualifiées incluant absences/inventaires, notifications bornées et erreurs, réconciliation des fenêtres connues et fermeture ; vraie voie locale sans bypass.
- [x] Context/progress/help/Main/preload — générations synchrones, reprises groupées/admission, after-await guards et état public strict ; aucun changement des durable schemas ou rôle historique des accords.
- [x] ProjectResume/aide/sélecteur/strings/styles ciblés — décision Sally avant code, ancien pendant reading/error, bascule volontaire et nouvelles infos accessibles sans déplacer lecture/saisie ; préserver les comportements existants.
- [x] Qualification — réelle mutation/suppression/remplacement Windows pendant lecture et décision, rafale et arrêt, Main/preload/candidat ressources exactes, réouverture passive et données inchangées ; matrice F1–F8 tous cas réellement exécutés, limites explicitement consignées. Types/build/NSIS, suite ciblée seulement, deux tours visuels groupés maximum et un détecteur Impeccable coordonnés.
- [x] Parent — audit high indépendant de courses réelles et préconditions, revue Quick puis corrections/rechecks ; source/proof manifest, commit local des seuls chemins possédés ; continuer backlog.

**Acceptance Criteria:**
- Given un projet réellement ouvert/observé et un artefact modifié hors Madness pendant une saisie, when la nouvelle capture termine, then la preuve ancienne garde date/révision et sa lecture, la nouvelle est accessible volontairement, la saisie et les décisions d’origine restent intactes.
- Given une ancienne aide ou décision préparée, when ses préconditions changent avant publication ou effet, then aucun résultat tardif ou accord ancien n’est utilisé comme autorisation sur les nouveaux octets ; le refus conserve l’historique et indique la nouvelle préparation utile.
- Given rafales, moteur occupé, surveillance perdue ou fermeture, when le système réconcilie puis revient, then la voie locale possède au plus un travail coûteux et une suite groupée, aucune relance fournisseur n’a lieu et les limites ne deviennent pas des succès.

## Implementation Notes

Implémentation et matrice F1–F8 vérifiées : [audit parent](../qualification-actualisation/parent-verification.md), [remise](../qualification-actualisation/worker-handoff.md). Dépendances privées native→WeakMap→observer, notifications bornées128/512, générations et pipeline local sérialisé ; schémas durables et gardes d’effet conservés. Version lue distincte de l’observation reçue selon Sally, bascule volontaire sans perte de focus/saisie.

Candidat pré-Quick0.2.9 non installé ASAR16b2f3391740c12a98ee2a0611f428f8a4f91ae3f97b2e7f681487035eb0b105. F1/F2/F4/F7 et arrêt actif F8 sur87442 historique ; delta compilé isolé Main listener+reconcile,18sorties/14ressources inchangées. F5 réel sur candidat final : notifications interceptées dans témoin, mutation→focus→lecture→nouvelle révision/texte exact ;10opérations terminées, réouverture passive exacte. Aucun succès global tiré du run Main partiel ou des deux frames no-op.


## Plan Change Log

## Review Triage Log

Revue high indépendante en Step3 (hors Quick encore attendue), corrections par le même implémenteur et recontrôles par le même auditeur :

| ID | Verdict / route | Évidence et résolution |
|---|---|---|
| H1 | medium / patch / résolu | Refus natif perdait les préconditions suffisantes, réparation en place pouvait laisser la vieille couverture current. Dépendance limitée explicite ; vrai Windows même inode refuse réconciliation, même high résolu. |
| H2 | medium / patch / résolu | Attaches concurrentes pouvaient franchir512handles ; réservation synchrone/fermeture partielle, rouge514 puis vert et même high résolu. |
| H3 | medium / patch / résolu | Main focus enregistré avant création de fenêtre ; déplacé après, ancien candidat rouge comportemental puis positif final, aucun emit(true) seul admis. |
| H4 | medium / patch / résolu | Doute hérité restait sans collecte si propre lease frais ; reconcile sur pending/uncertain coalescé, rouge1≠2 puis26/26 et positif final, même high résolu. |
| Q1 Quick | medium / patch / résolu | Première attache ou scope dégradé peut ne conserver aucune lease ; reconcile n’itère alors jamais ce projet armé. Reprise doit inclure ce doute existant, sans armer une ouverture passive. |
| Q2 Quick | medium / patch / résolu | consultSelection publie les nouveaux octets mais garde la lease Context de l’ancienne capture ; chaque focus sur fichiers désormais inchangés réinvalide et relance des lectures. Réarmer à la consultation qualifiée, mêmes gardes après await et fermeture des leases. |

Reçus : [H1/H2](../qualification-actualisation/high-recheck-H2-001.json), [F5 code](../qualification-actualisation/high-recheck-F5-001.json), [F5 natif](../qualification-actualisation/high-recheck-F5-native-001.json).


## Design Notes

Sous mandat humain autonome, route full (plus de100lignes, plusieurs couches), risk high hérité et conservé. Pas de question humaine ouverte : UX et périmètre tranchés par les contrats adoptés. Aucune limite éditoriale en tokens, personnalisation persistante prévaut. Sally a réellement activé UX/Impeccable et relu spines via structure fraîche puis prose/recheck, preuves dans qualification-actualisation/ux ; ne pas réinvoquer persona ni réécrire les spines sans nouveau besoin.

Tu n’es pas seul dans le dépôt. Racine réelle `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness`, branche codex/bmad-initiatives-2-3, baseline bd4b6ea95b42d9abae9f7de488c77d0487a32d96 ; workdir absolu + require_escalated à chaque commande, cwd host atelier-ui obsolète. Worker unique possède fichiers produit/tests/bancs explicités ci-dessus et qualification-actualisation hors ux ; parent possède frontmatter/frozen/statuts/revues/commit et Sally a fini docs ux. Préserver tous changements concurrents, managed/untracked et le stat/EOL-only préexistant tests/bmad-help-boundaries.test.mjs ; aucun checkout/reset/staging/commit ni npm test global/Build imbriqué. Ne pas nettoyer les anciens Temp/fixtures inconnus des autres stories. Le worker n’invente pas une preuve historique ou un succès de fermeture ; nettoyages uniquement chemins canoniques possédés et arrêt connu.

Observer sous Windows est un accélérateur d’invalidation. Les docs officielles [Node fs.watch](https://nodejs.org/api/fs.html) décrivent des notifications dépendantes du système, filename éventuellement absent et des limites sur déplacement/suppression de répertoire ; [ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw) décrit la perte possible des détails en débordement. Réconciliation et garde native avant effet restent nécessaires. Ne pas promettre détection instantanée ou totale ; une limite explicite protège l’interprétation des preuves. Choix des bornes techniques justifié/documenté/testé, pas de parcours récursif arbitraire.

Dans sa session fraîche l’implémenteur suit Impeccable pour cette UI : context une fois sur App, Operate/monde existant ; craft-floor immédiatement avant première édition UI. Pas de nouveau monde/raster. Parent coordonne deux tours visuels groupés maximum, un détecteur et les substituts techniques frais requis pour finish/documentation ; ne pas lancer seul une boucle finish ou un autre détecteur. Lire root AGENTS et consignes locales ; l’autonomie autorise décisions techniques réversibles, pas faux HITL/G2/G4/G5/WCAG.

## Verification

Clôture : [parent final](../qualification-actualisation/verification-parent-final.json). Après patches Q1/Q2 : parent52/52 sans skip, types/build/NSIS0, audit003 exact28ressources/2036protégés/19sorties/735runtime, Main final508df4ab… passed13checks/10opérations terminées/deux fermetures/réouverture passive exacte/cleanup. [Même Quick](../qualification-actualisation/quick-recheck-001.json) : Q1/Q2 résolus, aucun nouveau défaut concret. [High source](../qualification-actualisation/high-recheck-Q1-Q2-001.json) favorable. Trois régressions rouges→vertes et trois barrières après attente ; ancien56cas/7UI et recontrôles gardent leurs portées, non additionnés. ASAR508df4ab903d73000a133a7958a87c9623aa765702a54a6944507479c2d766cf non installé. Renderer/preload18sorties et14ressources exacts ; ship Impeccable conservé sans nouvelles captures/détection. Aucun correctif du lot différé ni gate humain acquis.


**Commands:**
- Tests nouveaux/ciblés de contrats/core/observer + context/progress/aide/approbations touchés : zéro skip et F1–F8 réels, première erreur conservée ; n’élargir qu’en cas de préoccupation concrète.
- Cas UI ciblés dans connection-ui, App réel : saisie/détails/scroll avant invalidation et après nouveau résultat, switch explicite, focus composeur, multi-projet/retour tardif, ancien pendant erreur/reading, compact/zoom/deux thèmes ; nouvel observable plutôt que délai aveugle.
- `npm run typecheck`, `npm run build` attendus0 ; `npx electron-builder --win nsis --x64 --config.directories.output=dist/external-refresh-reviewed` attendu0 ; ressources/pins natifs du paquet et SHA exacts.
- Nouveau banc local Windows/Core+Main en Temp possédé, sans profil personnel/réseau/provider : mutation/suppression/remplacement réel et burst pendant capture, garde au point d’effet, fermeture, unsubscribe et réouverture passive/drafts exacts. Prouver identité, stop/retour et cleanup ; inconnu retenu.
- `qualification-actualisation/{worker-handoff.md,verification*.json,logs/,parent-verification.md,final-manifest.json}` relie versions/sources/producers/candidat/matrice et limites ; capsule producteur réellement figée avant lancement, pas de reconstruction présentée comme preuve d’origine.
