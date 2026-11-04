---
title: 'Consulter les livrables et demander leur ouverture dans l’éditeur'
type: 'feature'
ticket: '8'
created: '2026-11-04'
status: 'built'
baseline_revision: 'efbfdb6b5d16d541ccb866aca917ad316337486b'
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
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les preuves du parcours et les sources du catalogue ne permettent pas encore de lire le fichier dans Madness ou de demander son ouverture dans un éditeur. Le premier Graphe4.4 doit rejoindre le même panneau, y compris sur du code sans BMad.

**Approach:** Livrer un panneau de lecture commun, agrandissable, fondé sur des références accordées par les producteurs qualifiés. Conserver identité, provenance, portée, révision et limites ; revalider avant lecture/copie/demande éditeur locale. La consultation ne dépend pas de Codex.

## Boundaries & Constraints

**Always:** Références session appartenant à un producteur accepté, projet/racine et révision exacts ; initiative capturée uniquement si elle existe. Preview texte UTF-8 borné, lecture seule et inexécutable ; tout type/taille refusé est expliqué, aucune troncature silencieuse. Provenance/chemin complet sélectionnable/statut/fraîcheur/SHA-256 visibles avant contenu. Changement externe rend l’aperçu ancien explicite, sa nouvelle lecture est volontaire. Dock non modal, overlay sous1080 et agrandissement modal selon Sally ; lecture/position, retour focus, saisie et demandes restent préservés. Éditeur = nouvelle intention locale et reçu strictement observable, pas preuve d’ouverture/lecture humaine. Copie exacte du chemin indépendante du résultat éditeur, confirmée par write/readback. Réutiliser helper/owner/admission, contrôles physiques natifs et frontières Main/preload ; aucune reprise automatique après arrêt inconnu. Préparer le contrat producteur pour4.4 sans le raccorder : références de code d’un projet sansBMad admises seulement avec leur propre capture native qualifiée.

**Never:** Chemin/URI/commande libre venant du renderer, association Windows arbitraire ouverte comme éditeur, script/hook/import/exécutable du projet, lien ou réseau actif dans un document, HTML/SVG actif ou iframe/webview. Ni hash seul ni watch ne valent identité physique/autorisation. Aucune source extérieure au projet transformée en référence projet ; les textes catalogue hors projet restent leurs fiches existantes. Aucun second moteur, bypass internal/BUSY/STOP_UNCONFIRMED, polling/rejeu ou collecte à la restauration. Aucun changement Snapshotv1/HelpBundlev1/données personnelles/provider/connexion, graphe/init/lancement général7/langue globale14/installation personnelle. Zscaler/token/IT/humain non sollicités ni inventés.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| F1 Référence courante | Source projet Progress/Catalog qualifiée, ou port futur code sansBMad avec capture propre | Ouvrir le panneau, lire octets UTF-8 exacts, projet/initiative capturée facultative/origine/chemin/révision/SHA/statut ; pas de modèle | Refus source non accordée, pas de fallback path libre |
| F2 Contenu non fiable | Markdown, HTML/script/SVG, liens URI, commandes, binaire/UTF8 invalide/gros fichier | Texte inerte et sélectionnable ; aucun lien actif/chargement/exécution ; limites/types distincts | Refus explicite sans preview faussement complète ni ouverture OS automatique |
| F3 Révision physique | Suppression, même contenu remplacé, racine/ancêtre changé, hardlink/jonction/symlink, traversée/drive/absolu | Accord lié aux vrais fichiers/chaînes de capture puis read_safe ; revalidation au point d’effet et après await | Aucune lecture extérieure, ouverture d’un nouveau fichier ou copie admise sur ancien accord |
| F4 Changement externe | Ancien aperçu/position affichés, nouvelle observation pendant saisie | Aperçu ancien conservé avec motif, commandes périmées refusées ; Examiner la nouvelle révision volontaire seulement si nouvel accord qualifié | Pas de substitution silencieuse de texte/révision/focus |
| F5 Éditeur | Référence courante et intégration locale qualifiée, échec/indisponible/inconnu | Demande explicite revalidée ; URI fichier VSCode strictement construit côté host ; reçu transmis/échec/indisponible/inconnu distinct, copie indépendante | Aucun URI tiers/argument libre, aucune réussite déduite d’un timeout ou lecture humaine prétendue |
| F6 Copie | Chemin exact, write/readback, retour retardé/changement de fichier | Confirmation seulement pour référence/projet/révision et intention courants ; texte sélectionnable reste disponible | Échec/retour étranger ne confirme pas une autre référence, aucun envoi fournisseur |
| F7 Contexte et occupation | Deux projets/initiatives, réponse tardiveA aprèsB, helper/provider occupé/stop inconnu | État propre à chaque contexte, vérifications après attente et pipeline existant, saisies/questions intactes | BUSY/STOP expliqués sans spin, nesting ni réveil par simple disponibilité |
| F8 Géométrie et accès | Dock/overlay/agrandissement, taille<1080/deux thèmes/zoom200/clavier/Échap | Même sélection/position ; focus au titre modal puis déclencheur exact ou titre résultat annoncé ; dock n’enferme pas Tab | Pas de double Échap/annulation de connexion, pas de focus volé à un autre contexte |
| F9 Fermeture/reprise | Lecture ou éditeur/copie en attente, fermeture/réouverture app | Détachement synchrone et arrêt possédé/drain ou inconnu conservé, données projet/historiques/brouillons exacts ; reprise passive | Pas de collecte, éditeur ou demande rejoués ; nettoyage des seuls témoins après arrêts prouvés |

</frozen-after-approval>

## Code Map

- `resources/bmad-help/capture.py::inspect_chain/read_safe/identity` (46/118/38) : limite1MiB, lecture par chunks UTF8 stricte, handle final-path Windows et chaîne lexicale avant/après, refus reparse/symlink/hardlink. Le caller doit assurer containment et accord ; ne pas promouvoir `help.ts::safe` ou les hints watchers comme autorité de lecture.
- `progress.py::collect`(154–173,366–382) : ProgressSource relatif à **initiativePath**, IDs stables mais révision séparée, états/readings propres actuellement hachés puis jetés. `catalog.py::collect`(114/220) : IDs ordinaux et roots parfois extérieurs au projet ; capture.json existant n’a pas la correspondance sourceId→original. Conserver au cours de ces **mêmes collectes** un reçu privé commun `files.json` avec projectRoot/rootIdentity, sourceId→originalPath/hash/bytes/chaîne/stamp, borné/recontrôlé avant retour. Inclure seulement les originaux projet réellement lus ; pas Help.references ni destins documentaires supposés existants.
- Nouveau `resources/bmad-help/files.py`, dispatchworker/launcher/pins : lecture et verify génériques sur reçu privé attendu par SHA, résolution sourceId native, containment/root/chaîne/stamp/hash avant et après read_safe. Opération indépendante de configuration BMad, découverte d’initiative ou provider. Aucun entier identité natif réduit en NumberJS ; garder le document privé et son hash. Contrat extensible à une future capture corpus4.4 sans lui accorder aujourd’hui une simple GraphSnapshot structurelle. Le reçu de publication reste lié à son producteur/révision/contexte ; une nouvelle capture seule n’est pas substitution silencieuse de l’accord affiché.
- `src/adapters/bmad/help.ts::run/captured/observeProgress/observeCatalog`(26–28/73/101/108) : run connaît folder, mais observe le jette et WeakMap ne garde que hints. Ajouter autorité fichiers privée à l’objet original, conserver dossier+SHA du reçu accepté. `dependencies()` reste opaque. Nouveau `src/adapters/bmad/files.ts` si utile, mais pas second lanceur/owner ; opération locale par run normal non nested. Actualiser fermeture native/pins/tests affectés ; runtimePython735 inchangé.
- `src/core/bmad-progress.ts`(52–64), `bmad-catalog.ts`(22–38) : accepter/publier l’accord depuis **l’objet original validé**, pas les read/subscribers clonés. Nouveaux `src/contracts/project-files.ts` et `src/core/project-files.ts` : références opaques producer/project/rootIdentity/revision/source et variante initiative capturée, registre de session borné aux captures courantes et aperçu retenu. Port producteur privé pour futur corpus Graph. Invalidation/fermeture/génération rendent les actions indisponibles immédiatement, ancien texte reste historique. Chaque opération résout le chemin côté host et recontrôle accord/contexte après await ; les mutations de sources rejetées ne donnent pas de droits. Garder l’admission existante ; STOP se traite à l’intention explicite, aucune reprise par simple disponibilité.
- `bmad-graph.ts` contracte GraphIdentity et GraphSource/ref relative sans initiative. GraphSource n’a pas d’identité physique : **ne pas** déduire un accord de son seul hash/label/path. Tester le port commun sur capture native code sansBMad, sans créer d’onglet/graphe ou API renderer de registration en2.8.
- `src/main/index.ts`138–186 et preload101–118 : même BmadHelpAdapter/ActivityAdmission/isTrustedCaller main-frame+URL, commandes/réponses/events exacts et corrélés. Ajouter bridge métier `projectFiles` méthode-only gelé ; pas de détails privés/cmdline. Main injecte clipboard.writeText/readText et **seulement** une ouverture externe `vscode://file/` construite à partir du chemin original qualifié (ligne uniquement attestée). Encode caractères réservés, refuse URI excessive, query/fragment/autorité/protocole étranger ; aucune association shell.openPath ni shell d’exécution. Reçu Promise résolution = demande transmise seulement, jamais éditeur/fichier ouvert confirmé ; rejet/absence ou résultat incertain restent distincts. La capacité VSCode choisie est un choix technique sous mandat, pas un réglage humain déjà adopté. Aucun nouvel écran de configuration générique nécessaire.
- Sources officielles consultées4novembre : https://www.electronjs.org/docs/latest/api/shell (`openPath` association par défaut ; `openExternal` Promise<void>, limite Windows2081) et https://code.visualstudio.com/docs/configure/command-line#_opening-vs-code-with-urls (protocole fichier/ligne). Les types Electron locaux concordent ; conserver ces liens dans la qualification, sans plus de promesse que le retour observé.
- UI : `ProjectResume.tsx` affiche preuves/sourceId+lignes ; `CatalogPanel.tsx` conserve presented/position/trigger et sources complètes. Ajouter des actions aperçu seulement aux sources projet qualifiées de la **version affichée**. `App.tsx` garde texts/drafts/questions/readingPositions/navigationToken et prioritéÉchap418 ; ne pas utiliser pending global pour une lecture. Nouveau `FilePreview.tsx`/`files.css` : réemployer `AgentInfoPanel.tsx` dock/modal/reflow/retour (24/49) ; panneau commun318px et overlay1080, agrandissement même contenu en dialog natif, actions compactes nommées/états texte, sources avant contenu. Nouveau texte rendu par React comme texte/pre uniquement, pas besoin de bibliothèque Markdown/HTML ni dépendance nouvelle. FR/EN strings locales, français actuel jusqu’à2.14. Préserver monde atelier/Oxanium/Barlow/pétrole-terracotta/ivoire et contextes d’attente existants.
- UX adoptée : EXPERIENCE372–380 fichiers,281–285 focus/modal ; DESIGN234/299–312/360, tokens318/overlay1080 ; Graph EXPERIENCE E6:83 revalidation/retour/draft/zoomgraphe conservés. Pas de redesign ni migration des spines historiques. `AgentInfoPanel` et `CatalogPanel` natifs donnent les patterns, ne pas créer de modales imbriquées en agrandissant.
- Vérification : nouveaux `tests/project-files{,-protocol}.test.mjs`, extensions ciblées enveloppe/admission/producteurs et `connection-ui.test.mjs`. Banque nativeWindows inspirée `workspace-design.mjs`22/50/70 (viewport/hook/close), catalogue (clipboard/producer/scopes) et fraîcheur (mutation/retour). Employer des prédicats **synchrones** sur cache de bridge événementiel monotone, jamais Promise truthy en waitForFunction ; réutiliser bmad-catalog-wait seulement si réellement générique, sinon helper dédié testé. Ne pas modifier les autres bancs préexistants ni npmtestglobal.
- Candidat0.2.11 package/lockracine, dépendances inchangées, sortie `dist/files-reviewed` non installée. Qualification dédiée `qualification-fichiers/` avec un gel de sources pertinent **avant** les exécutions, manifests exacts/pins/ASAR et historique des rouges ; éviter copies répétées de tout le dépôt ou données personnelles. Les5848fichiers historiques protégés sont dans `.working/files28-protected-baseline.json`.

## Tasks & Acceptance

**Execution:**
- [x] `tests/project-files{,-protocol}.test.mjs` — rouges F1–F9, grants/source/revision, races/remplacements et reçus/copie/éditeur, pas tests miroir de champs.
- [x] `resources/bmad-help/{files,progress,catalog,worker}.py`, launcher/pins et `src/adapters/bmad/*` concernés — reçu privé pendant collecte existante puis read/verify natif fermé, source réelle et port code sansBMad.
- [x] `src/contracts/project-files.ts`, `src/core/project-files.ts`, producteurs/Main/preload/env — registre/corrélation/fraîcheur/lifecycle et intégrationVSCode bornée, aucune migration ou provider.
- [x] `FilePreview`, App/ProjectResume/CatalogPanel/strings/styles — panneau commun/adopté, inertie/agrandissement, états explicites/retour/position/saisie et clavier/variantes.
- [x] `scripts/qualification/project-files.mjs` et tests ciblés — vrai Main/paquet/profilTemp, source/copie native, mutation/absence/refus/contextes, retour éditeur réel observable ou échec/indisponibilité attestés, Job/fermeture/réouverture passive/conservation et nettoyage sûr. Ne pas confondre boucle instrumentée et retour OS réel ; G3 intégré reste à2.16/epic3.
- [x] Parent — toutes lignes matrice examinées, contrôles positifs locaux passés et validation native positive F6 explicitement différée pour disponibilité externe, diff unifié, audit indépendant high sécurité chemins/contenu/URI/éditeur et revueBuild, mêmes corrections/rechecks, Impeccable lots bornés/unique détecteur/finish/doc, commit local puis4.4.

**Acceptance Criteria:**
- Given une preuve BMad locale observée ou une référence de code accordée par le port de producteur commun sansBMad, when le porteur consulte/agrandit son aperçu, then texte et contexte exacts restent lisibles et inertes, saisie/navigation/position sont préservées et aucun modèle n’est appelé.
- Given une référence courante ou modifiée, when le porteur demande l’éditeur ou copie son chemin, then les frontières sont revalidées avant l’effet, le reçu décrit seulement ce qui est observé et aucun fichier nouveau/hors portée ou contexte étranger n’est autorisé.
- Given une lecture/effet en attente ou un fournisseur indisponible, when contexte/forme de fenêtre/fermeture changent, then réponse et focus restent rattachés, les brouillons/questions/historiques survivent et aucune opération n’est rejouée au retour.

## Implementation Notes

Construction livrée : grants natifs privés pendant collectes, références host opaques, preview/verify physiques sous owner/admission existants, copie et URI VSCode bornée, panneau commun318/1080/agrandi. Version0.2.11 non installée. C1/C2 parent résolus : limites fichiers seules explicites sans casser catalogue, copie déjà écrite suivie de refus = inconnue. Banc initialmain001 partiel : huit groupes observés et deux PNGreading, cleanupCodeEBUSY masquant erreur/receipt ; jamais promu. Nouveau reporter atomique/retentionéditeur et waitready/current sont testés7/7 ; aucune répétitionOS.

Premier lotUI montre métadonnées masquant le texte. Correctif local densité garde tous champs/SHA, dockready730px/commandes≤718px, sans tokens/palette nouveaux. AncienneUI003 n’injectait pas files.css : ses géométries ne sont pas une preuve. Pinned source finale parent-source002(122inputs), delta ultérieur **test seul** focusRAF : condition synchrone sur même ElementHandle plutôt qu’assertion trop tôt ; diagnostic focusBODY→déclencheur exact10.5ms sans défaut produit. Nouvelle suitecombinée14/14 avec CSS réel, backend/natif54/54 et reporter7/7, zérofail/skip en suites distinctes ; parent-matrix-audit.json relieF1–F9. Build/NSIS final et Main/captures/revueBuild restent séparés avantclôture.

## Plan Change Log

## Review Triage Log

Audit supplémentaire high durantStep3, avant la revueBuild : deux constats medium, même implémenteur et même auditeur ; aucun intent gap/loopback. H1 gate physique avantpremieros.read corrigé et recontrôlé ; le premier patch comparait ctimefstat/lstat incompatibles, rouge50/54 conservé puis mesurefermée et comparaison du stamp intégral par mêmeAPI, handle identité/taille et chaîne avantlecture ; final54/54. H2 requestedpropagé empêchait nouvelle lecture, reset seulement sur intentionnouvelle révision ; UIexpliciteunelecture/aucunrejeu. Sources et verdictstatique dans high-recheck-final.json, tests séparés ; aucun succèsMain/humain déduit.


### Quick — passe initiale

| Finding | Verdict | Vérification et route |
|---|---|---|
| Q1 native verify avant await contexte | high | `perform` fait verify puis `await check()` ; Application.dialogueProject attend réellement execute/read-state. Un remplacement dans cette attente ne modifie pas immédiatement ref.current si watch pas livré ; l’effet path précède la vérification finale. Patch : dernier contrôle physique après les attentes contexte et juste avant effet ; gardes existantes conservées, état de course démontré, pas de nouveau port. |
| Q2 résultat éditeur inconnu nommé échoué | medium | handoff lève EDITOR_UNKNOWN au délai ; catch classe unknown mais motif générique affirme échec, seul motif rendu. Patch direct du libellé/état inconnu, état déjà représenté ; aucun intent gap. |
| Q3 refus aperçu masque reçus indépendants | medium | FilePreview rend preview.reason avant result.reason ; référence reste actuelle pour refus format/UTF8/binaire et verify autorise copie/éditeur explicites. Reçus de ces actions invisibles. Patch : états lecture et effets indépendants déjà contractés, aucune commande nouvelle. |
| Q4 repli progress non focalisable | medium | Default fallback cherche premierh2/h3 dans section ProjectResume, h2premier sanstabIndex ; déclencheur disparaît à invalidation, closeFile choisit ce titre connecté et focus reste ailleurs. Patch : utiliser/focaliser le repère existant adéquat ; scénario F8 déjà démontré, pas nouvelle navigation. |

Quatre constats, high1/medium3, aucun rejet/déduplication/différé. Quatre patches indépendants par le même implémenteur ; gel et loop_iteration0 inchangés. Recheck par même Quick après tests ciblés, puis vérification parent concernée.

## Design Notes

Un seul objectif utilisateur : lire un fichier sourcé puis continuer dans son éditeur. Routefull, plusieurs couches et bien plus de100lignes ; risquehigh du ticket conservé, car erreur de référence ou URI exposerait un contenu extérieur ou exécuterait une entrée non fiable. Audit indépendant supplémentaire de ces frontières, pas simple revue UI. Aucun intent gap humain trouvé dans les trois investigations ; le reçu éditeur est explicitement une demande, choix techniqueVSCode cohérent avec le besoin et non association arbitraire. Plan/checkpoint délégués et checkpointfalse ; aucun seuil de tokens selon mandat27octobre.

Tu n’es pas seul dans le dépôt. Racine réelle C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, hostcwdatelier-ui obsolète ; commandes workdirabsolu+pwsh/loginfalse+require_escalated. Branchecodex/bmad-initiatives-2-3, baselineefbfdb6b5d16d541ccb866aca917ad316337486b. Préserver stat/EOL-only préexistant tests/bmad-help-boundaries.test.mjs et managed/untracked ; aucunreset/stash/stage/commit/Buildimbriqué par worker. Un seul implémenteur produit, parent seul plan/frozen/statuts/revues/commit. Aucun profil/app personnel installé modifié ; témoins inconnus ne pas nettoyer, témoins nouveaux seulement après arrêt identifié. Une erreur Zscaler n’arrête pas le local et ne déclenche pas de question répétée.

Impeccable Operate code-led : worker frais lit skill et contextApp une fois dans sa session, craft-floor immédiatement avant UI, contrats existants sans nouveaumonde/palette/fontes/raster. Parent coordonne au plus deux lots visuels groupés et un seul détecteur, puis rôles officiels frais finish/documenter via substituts techniques si indisponibles. Premier lot inclut vrai panneau dock+fiche agrandie, second si corrections concrètes ; pas de polishboucle ou captures opportunistes autonomes. Plan/table/companions historiques ne sont pas réécrits pour faire passer des preuves. Les rôles natifs non exposés sont annoncés comme substituts, aucune nouvellepersona/validationhumaine inventée.

## Verification

**Commands:**
- `node --experimental-strip-types --test` sur les nouveaux fichiers/protocoles et dépendances réellement touchées ; matriceF1–F9 passée sansskip, rouges comportementaux conservés puis verts. Jeuxsource et testsource gelés avant exécution, pas reconstruction rétrospective de capsule.
- `connection-ui.test.mjs` sélection par motifs nouveaux fichiers + cas catalogue/navigation/actualisation touchés ; App/Vite/CSS réels avec pont synthétique explicitement distinct du Main. Dock/overlay/agrandissement/focus/Échap/drafts/deuxthèmes/zoom200 et retours tardifs.
- `npm run build` attendu0/typesinclus ; `npx electron-builder --win nsis --x64 --config.directories.output=dist/files-reviewed` attendu0. Pins/ressourcessource+paquet, compiledASAR, Python735 et5848anciens exacts. Aucune assertion d’équivalence d’un ancien paquet après changement de source.
- Nouveau bancMain/preloadWindows au profilTemp sur candidat exact : collectes initiales réelles, read/verify/clipboard natifs, mutations/admission/frontières, handofféditeur et classification strictement observable, Job0/drain, réouverture passive et conservation exacte ; compteursposthook seulement. Si un essai OS externe ne peut se terminer sans humain, reçu/artefact/condition de reprise reportés, aucun succès inventé ; poursuivre les autres tests selon mandat.
- `qualification-fichiers/parent-verification.md` et index final relient résultats, sources, matrice, revues, ASAR, captures et limites. Aucun G2/G3/G4/G5, WCAG ou accord visuel global déduit de ce lot.


### Clôture parent du 4 novembre

Q1–Q4 résolus par le même Quick sur diff006 ; H1/H2 résolus par le même auditeur high. Parent60backend,16UI consolidés et7reporter, build/types/NSIS0, audit16ressources×2/735runtime/19sorties/5848protégés exacts. Native004 termine8groupes indépendants/Job3→0/deuxfermetures/réouverture/cleanup, mais reste **partial** pour la copie positive native indisponible aussi dans Electron seul ; différé2.16/G3, aucun tout-vert ou cause inventés. Deux lots visuels, dernier repris après erreur de thème du banc seulement, quatre frames finales et un détecteur ; ship FilePreview uniquement, documenter conserve système. Candidat0.2.11 non installé, aucune nouvelle demande OSéditeur, pas de profil personnel modifié. Sources, rouges, limites et reprise dans qualification-fichiers/parent-verification.md et verification-parent-final.json. Gel8d6a… inchangé, revue_loop0. Prochain4.4 selon replan adopté.
