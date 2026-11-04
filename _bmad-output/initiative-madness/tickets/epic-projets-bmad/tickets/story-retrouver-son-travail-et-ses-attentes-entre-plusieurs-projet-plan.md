---
title: 'Retrouver son travail et ses attentes entre plusieurs projets'
type: 'feature'
ticket: '9'
created: '2026-11-04'
status: 'built'
baseline_revision: 'e6f73a64ef556b0f043602e07177dda17df1ccdb'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/.impeccable/surfaces/src-renderer-src-app-tsx.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L’accueil liste des dossiers, mais ne permet pas encore de comprendre et reprendre immédiatement chacun des projets commencés. Les preuves, récapitulatifs et attentes sont dispersés et la destination de consultation n’est pas mémorisée par projet.

**Approach:** Composer une bibliothèque Quick Resume à partir des données locales existantes : situation sourcée, activité/attentes, résultats et décisions connus, récapitulatifs et suite proposée connue. Rejoindre leur contexte exact puis revenir au travail quitté, en conservant aussi le Graphe intégré et les fichiers consultés.

## Boundaries & Constraints

**Always:** Préserver identité projet/racine, initiative de consultation distincte du contexte capturé de chaque échange, révision et fraîcheur de toute preuve. Information absente/ancienne/contradictoire nommée ; faits, propositions et acceptation humaine séparés, jamais pourcentage ou achèvement inventés. Attentes réellement répondables prioritaires, récupération globale restant globale. Résumés littéraux et sourcés, dates selon leur nature ; un dernier élément de tableau n’est pas une date d’activité. Consultation et reprise sans nouvel appel moteur/collecte/lecture fichier/effet ; restauration passive seulement. Brouillons par projet/demande, conversation choisie, positions, filtre/vue Graph par analyse et consultations fichiers conservés en session. Retour asynchrone corrélé à l’intention de navigation encore courante ; aucun focus ni changement d’écran tardif sur un autre projet. Après réouverture, retrouver les données réellement conservées et les demandes historiques inactives. Atelier approuvé, icônes/commandes compactes nommées, thèmes et clavier/zoom/repli conservés.

**Never:** Synthèse IA ou recommandation nouvelle par montage/reprise, reconstruction de conversations externes, acceptation déduite de built/fin de tour/présence de fichier. Aucun nouveau moteur/bridge métier/stockage de projets ou migration Snapshotv1 ; pas de relecture de source transformée en permission fichier. Pas de choix automatique d’initiative, dernière conversation/demande de remplacement pour une cible disparue, ni reprise d’agent. Pas de refonte globale/actifs/palette/fontes, fermeture/installation personnelle ou nettoyage de témoin unknown. Les mesuresR32, lancement natif2.7, traduction globale2.14 et qualification intégrée2.16 restent leurs tickets. Zscaler/tests externes différés consignés sans question/clic/IT/token routinier ; aucune qualification globale inventée.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| L1 Deux projets | Même nom/ticket, contextes/étapes distincts ; l’un sans attente et l’autre avec données incomplètes | Deux résumés séparés : état déclaré sourcé/fraîcheur, résultats/décisions, récapitulatifs et travail restant connu ; manques explicites | Aucun prélèvement chez l’autre projet ; absence d’attente n’est pas acceptation |
| L2 Propositions et histoires | Preuves contradictoires/anciennes, réponse bmad partielle ou conservée, plusieurs tours | Texte littéral identifié, provenance/révision/contexte visibles ; suite proposée distincte des déclarations et accès à l’échange exact | Ne pas inventer date, prochain workflow structuré, identité ou validation |
| L3 Rejoindre une attente | Depuis Accueil ou A, demande de B corrélée à une ancienne initiative | Ouvrir Conversation/demande exacte, sans changer la sélection BMad ni envoyer une réponse/accord | Disparition/expiration pendant trajet : historique inactif ou motif précis, aucun substitut |
| L4 Revenir au travail | A : conversation ancienne, initiative différente et brouillon non enregistré ; consultation d’un récapitulatif de B | Retour vers A/onglet/conversation/point de saisie exacts, brouillons séparés inchangés | Point supprimé : motif et projet d’origine ou Accueil, jamais focus d’un autre projet |
| L5 Courses de navigation | select/open/readState tardifs après Accueil/B, ou rAF de retour Graph après changement de projet | Les données globales peuvent s’actualiser sans déplacer la consultation courante ; seul token/projet toujours courant reçoit le focus | Échec navigation durable : conserver copie de session et annoncer limite, pas faux succès |
| L6 Graphe et fichiers | A Graph recherché/zoomé/dernier complet, panneau déjà lu ou agrandi ; A→B→A | Restaurer vue par identité complète, sélection/positions et consultation déjà demandée ; zéro generate/revalidate/preview supplémentaire | Référence remplacée/inconnue reste ancienne, aucun nouveau grant ; refus/contextes exacts |
| L7 Réouverture et arrêt | Profil fermé/réouvert, historiques, dernier contexte conservé, STOP_UNCONFIRMED | Bibliothèque et récapitulatifs passifs ; historiques non répondables, garde globale respectée | Conservation échouée nommée ; données manquantes inconnues, sans relance |
| L8 Lecture et variantes | Noms/passages longs, deux projets, clavier, grand sombre/compact clair/zoom200/repli | Parcours lisible, détails progressifs et noms accessibles, retour/focus exacts ; ne pas noyer le premier écran de hashes | Repli sans perte, focus non piégé ; aucune conformité globale déduite |

</frozen-after-approval>

## Code Map

- `src/core/work-overview.ts::projectWorkOverview`14/30 et `sameContext`11 : réutiliser attentes réellement corrélées, récupération globale et ConversationOverview/results/questions/approvals/workflow. Comparer les cinq identifiants, pas projet/conversation seulement ; le dernier texte historique garde sa nature. Aucune nouvelle date d’échange n’existe dans Conversation.
- `src/core/bmad-progress.ts::projectBmadProgress`9,54–65 et contrats `bmad-progress.ts`5 : déclarations/conflits/acceptation unknown et extraits results/decisions/remaining/recap avec source/lignes. Garder racine physique, initiative, contextRevision, révision de collecte et génération. `selectionValidity` dans `bmad-context.ts`24 distingue choix et active BMad. Un snapshot étranger ou ancien est nommé, pas utilisé comme état courant du choix.
- `bmad-help.ts` contrat7/core60 : HelpRecord.response est une proposition littérale à son contexte/révision capturés, pas une prochaine action structurée. HelpBundle n’atteste pas rootIdentity/contextRevision. Résultats non terminés/incomplets ou non durables gardent leurs limites. Les données absentes ne déclenchent aucune collecte.
- Nouveau `src/core/project-library.ts` : projection pure et testable, une entrée par projet enregistré, contextes et observations admissibles, états/attentes et passages sourcés/récapitulatifs. Réutiliser les projections existantes ; aucun tri par date inventée ni fusion de tickets homonymes. Présenter une courte sélection explicitement nommée si nécessaire, avec accès au contenu complet ; aucune omission annoncée exhaustive.
- `src/renderer/src/App.tsx`120/159/196 : onglet actuellement global, conversation mémorisée par projet, buffers texts/questionDrafts/approvalDrafts et readingPositions déjà séparés. Ajouter une mémoire de consultation par projet+racine et un retour de consultation explicite, sans toucher les contrats de conversation/persistance. Distinction projet affiché vs activeProjectId de retours tardifs ; ne jamais supprimer des faits globaux pour corriger seulement la navigation.
- `App.tsx::run`291–292, `onStateChanged`305, `select`398–402, `navigateOverview`403–418 : accepter les données n’autorise pas un ancien résultat à sélectionner une destination. Garder token/intention/projet sur chaque continuation et rAF. `navigateOverview` conserve validation ContextRef complet puis focus exact ; cible disparue257 exige un repli neutre annoncé, sans choisir une autre demande.
- `chooseTab`429 déclenche une collecte catalogue absente : une reprise applique directement la vue, pas ce handler d’activation. `useBmadContext.read` est passif et ProjectResume ne collecte pas au montage ; réemployer les lectures de conservation, pas collect/prepare/observe.
- `GraphPanel.tsx`18 et `App::returnFromGraph`431 : Map graphViews liée à l’identité complète, garder recherche/sélection/filtres/zoom/pan/scroll. Mémoriser aussi le choix dernier complet si démontage et position main, sans en faire une permission. Recontrôler token/projet avant le focus différé, pas fallback#draft d’un autre projet.
- `FilePreview.tsx`31 et `App.tsx`159 : consultations par scope projet/racine/initiative ou corpus Graph, conserver requested/scroll/expanded à la reprise. requested=false déclenche preview : ne pas recréer cet état pour une consultation déjà faite. Registre/autorité host existants seuls habilitent une lecture, pas la bibliothèque.
- Nouveau `src/renderer/src/ProjectLibrary.tsx`, `library.css`, libellés FR/EN locaux si utile ; App compose l’accueil avec les résumés et la WorkOverview existante. World atelier hérité, noms/statuts/passages courts lisibles avant les identifiants techniques repliés ; pas de tableau KPI, nouvelle illustration ou compteurs de validation. Recap existant et liens exacts réutilisés. Les détails littéraux peuvent être lus sur place ; accéder à une preuve de projet conserve sa révision et refuse un détail de remplacement si changé.
- UX `EXPERIENCE.md`142/210/250/283 et parcours5–7 lignes360–392 : QuickResume, retour, manque/historique, fichiers et conservation sont déjà contractés par Sally2.17/2.4/2.5 et Graphe4.2. Pas de nouvelle activation Sally inventée ni de réécriture des anciens contrats pour passer un test. Deux investigations en lecture seule finies, aucune recherche codebase2.9 pertinente ; Loop/Builder technique hors sujet.
- Tests `work-overview.test.mjs`11, `bmad-progress.test.mjs`9, `graph-ui.test.mjs`, `connection-ui.test.mjs` ciblée : étendre seulement les parcours touchés et nouveaux project-library/navigation. Deux projets homonymes, racine remplacée au même chemin, contextualisation, attente expirée, retours tardifs et absence d’effets explicites sont les oracles.
- `scripts/qualification/overview.mjs`22–42, `workspace-design.mjs` : réutiliser observation/fermeture possédée et profil isolé. Un banc2.9 paquet, données locales témoins nommées et compteur aucun nouveau moteur/collect/generate/revalidate/preview lors de la seule reprise ; captures groupées des variantes, même gel d’entrées et fermeture/nettoyage possédés. Pas de réseau externe, profil personnel ou nouveaux paquets de test à chaque micro-édition.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/project-library.ts`, `tests/project-library.test.mjs` — composer et éprouver données/provenance/limites sans effets ni mutation.
- [x] `App.tsx` et éventuel helper local de navigation testable — mémoire par projet/racine, retour de consultation et garde des continuations ; réutiliser le routage corrélé, buffers et sélections.
- [x] `ProjectLibrary.tsx`, styles/libellés, `GraphPanel.tsx`/`FilePreview.tsx` seulement aux points décrits — accueil concret, liens/contextes exacts et restauration sans lecture/génération implicite.
- [x] Tests UI ciblés + `scripts/qualification/project-library.mjs` — L1–L8, même plan d’oracles, deux projets, données historiques/incomplètes, brouillons/retours/Graph/fichiers et courses.
- [x] `package.json`/lock racine0.2.13, packaging existant — candidat compilé/NSIS, ressources natives inchangées ; un contrôle réel du paquet local avec preuve passive, pas nouveau modèle.
- [x] Parent — audit matrice, revueQuick et rechecks ciblés par mêmes acteurs, Impeccable lots bornés/détecteurunique/finish/documenter frais, rapport et commit local, puis suite du backlog.

**Acceptance Criteria:**
- Given deux projets commencés de contextes et historique différents, when le porteur ouvre Accueil, then il comprend les états connus/manques et retrouve résultats/décisions/récapitulatifs/suite proposée sourcés de chacun sans nouvel agent ni synthèse.
- Given une consultation de B depuis le travail de A, when le porteur rejoint puis quitte une attente ou un récapitulatif, then contexte exact et brouillons sont préservés, une attente expirée reste inactive, et Revenir au travail restaure A sans action implicite.
- Given le Graphe/fichier déjà consulté et une réponse asynchrone tardive, when il change de destination ou rouvre le candidat, then seules les données réellement conservées sont retrouvées, sans nouvelle lecture/analyse ni focus sur le mauvais projet.

## Implementation Notes

Bibliothèque et retour exact implémentés ; trois constats Quick corrigés par le même worker et recontrôlés résolus par le même Quick. Parent37/37 ciblés sans skip, types/build/NSIS0 ; paquet final613e05e… passe7groupes, deux fermetures/cleanuptrue, zéro capture. Preuves et limites dans [vérification parent](../qualification-bibliotheque/parent-verification.md). Aucun correctif produit différé ; historiquesUI2.15/copieexterne2.16 inchangés.

## Plan Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| Q1 ProjectLibrary.tsx:12 | medium | patch | Les événements useBmadProgress remplacent directement evidence, y compris dans les détails ouverts. EXPERIENCE Actualisation2.5/ligne230 exige la version présentée distincte et une bascule volontaire ; état/révision disponibles démontrés. Reprendre le mécanisme de présentation déjà établi, sans nouveau contrat public métier/IPC/persistance. |
| Q2 App.tsx:305/435 | medium | patch | WorkOverview reste accessible pendant pending ; navigateOverview(null) change token mais quitte sans libérer pending. Le finally guardé ne le libère plus. Correction directe du chemin global connu. |
| Q3 GraphPanel.tsx:24 | medium | patch | views garde ordre insertion ; Object.assign ne promeut pas P après C. Nouvelle analyse retrouve C via reverse alors que P est consulté. Choisir la vue effectivement consultée dans le même périmètre ; aucun nouveau pouvoir public ni état hypothétique. |

## Design Notes

But unique : reprendre son travail parmi plusieurs projets. Routefull car projection/UI/navigation/tests dépassent100lignes ; risque medium du ticket conservé, aucun nouveau pouvoir de lecture/exécution/écriture. Pas de seuil en tokens. Aucun intent gap après ticket/epic, contrats adoptés et deux investigations ciblées. Les choix de composition sont techniques sous délégation, pas un nouvel accord visuel humain : extension de l’accueil Operate existant, lignes/projets et détails progressifs, identité atelier inchangée. Le mandat humain complet et checkpointsfalse autorisent les étapes routinières ; aucune question de validation redemandée.

Racine réelle C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, branchcodex/bmad-initiatives-2-3, baselinee6f73a64ef556b0f043602e07177dda17df1ccdb. Hostcwdancienatelier-ui obsolète ; shellpwsh/loginfalse/workdirabsolu/require_escalated. Tu n’es pas seul : un seul implémenteur produit, aucunreset/stash/stage/commit/Buildimbriqué/sous-agent de production ; parent seul plan/frozen/revues/statuts/commit. Préserver managed/untracked, statEOL-only boundaries, tous anciens artefacts, compte/profil/app personnelle et préversion interactive dist/graph-preview-0cf3cc35 (possibles saisies utilisateur). Ne nettoyer que les témoins possédés après arrêt prouvé.

Impeccable Operate code-led : worker frais lit skill, contextApp une seule fois dans sa session, craft-floor juste avant UI. Hériter du monde/seed09fa5971, pas nouveau tournoi/comp/raster. Parent a chargé contexteApp une fois (resume29-impeccable-context.txt), pas rerun dans cette même session. Deux lots visuels groupés maximum et détecteur unique, puis finish/documenter officiels frais via substituts techniques si rôles non exposés. Premier lot complet deux projets/attente+retour/Graph retenu, compact clair et zoom natif200 ; second seulement pour corrections concrètes. Pas de campagne UI globale ni recapture opportuniste. Les neuf divergences historiques nonattribuées restent2.15, clipboardpositif2.16 ; ne pas les transformer en tests verts ou faire dépendre2.9 d’un nouveau clicZscaler.

## Verification

**Commands:**
- Tests Node nouveaux projection/navigation et seuls tests de dépendances réellement touchées ; L1–L8 doivent avoir un cas exécuté/réussi, pas skip ni test qui reflète seulement les champs.
- Tests renderer avec styles réels : navigation/directlinks/retour, rAF/tokens, profils homonymes, Graph et fichier restaurés sans incrémenter de compteurs d’effets. Attentes synchrones sur événements/caches monotones, pas waitForFunction(asyncPromise).
- `npm run build` puis `npx --no-install electron-builder --win nsis --x64 --config.directories.output=dist/library-reviewed` ; version0.2.13, JSdeps/runtime/ressources inchangés. Lier les19sorties réelles et pins au candidat sans lui attribuer les anciens reçus natifs.
- `node --experimental-strip-types scripts/qualification/project-library.mjs --executable=dist/library-reviewed/win-unpacked/Madness.exe` : un parcours local à deux projets avec preuves/états témoins nommés, reprise/réouverture/données et absence de nouveaux moteurs/helpers. Réutiliser les primitives existantes, aucune qualification d’auth ou de fournisseur requise.
- Rapport `qualification-bibliotheque/parent-verification.md` : limites/epochs/diff/revues, scopes images et conservation, candidat prêt et commit local. Conserver les rouges précis ; après réussite des contrôles appropriés, ne pas multiplier les suites/candidats sans défaut nouveau.

### Contrôles précoces parent pendant Stage3

P1 : le delta GraphPanel supprimait toute reprise de requête sur nouvelle analyse, contrairement à E1du supplément Graphe et au comportement4.4 ; correction ciblée demandée avec comparaison stricte du périmètre physique, seulement requête/filtres compatibles, jamais ancienne sélection/position. P2 : selectedComplete initialisé une seule fois ne relisait pas la Map lors de Agraph→Bgraph→Agraph direct après choix différent de B ; synchronisation locale au changement de scope demandée. Même worker, un lot, tests UI des transitions avant premier lot de captures ; aucun nouveau besoin ni modification du gel. Qualification native001/002 annoncée interrompue avant captures sur fixtures/locateur, reçus à lire au handoff, aucune réussite inventée.
