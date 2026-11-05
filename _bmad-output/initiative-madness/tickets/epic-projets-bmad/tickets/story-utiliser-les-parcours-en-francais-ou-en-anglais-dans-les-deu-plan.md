---
title: 'Utiliser les parcours en français ou en anglais dans les deux thèmes'
type: 'feature'
ticket: '14'
created: '2026-11-05'
status: 'built'
baseline_revision: '834a8332a87c78be1471a93cb26272200938015b'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick', 'bilingual-high', 'impeccable-finish']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/DESIGN.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-graphe-projet/ux-graphe/EXPERIENCE.md'
---

<frozen-after-approval reason="intent approuvé sous mandat humain complet d’autonomie ; changement seulement par renégociation humaine">

## Intent

**Problem:** Madness utilise encore essentiellement le français. L’utilisateur ne peut pas choisir une interface anglaise cohérente ni retrouver sa langue après réouverture, alors que les parcours et copies FR/EN de Sally sont adoptés.

**Approach:** Livrer une préférence de langue locale et réactive sur toutes les surfaces intégrées jusqu’à2.13, y compris les commandes du premier Graphe4.4. Réemployer les deux thèmes et les composants atelier, sans perdre le travail en changeant de langue, thème ou largeur.

## Boundaries & Constraints

**Always:** FR et EN, défaut FR actuel ; choix explicite conservé, échec ou préférence illisible/future annoncé sans écraser ses octets. Contrats de copie EXPERIENCE#epic2-copy/#epic2-metrics et Graphe E7/E8, DESIGN racine atelier autoritaire. Commandes compactes nommées, clavier/focus visibles et retour cohérent, titres/fermetures atteignables à720px et zoom200 ; mouvement réduit. Changer de langue présente des états existants, ne crée ni arrivée, décision, envoi ni activité. Conserver projet/initiative/conversation, demandes, texte exact/cursor/sélection, recherches/filtres, US choisie pour le prochain tour, preuves ouvertes et exploration Graph/fichier. Les gardes de contexte, durabilité, arrêt et permissions restent les mêmes.

Traduire tout le texte produit de l’interface : cadre, préparation, diagnostics/états/capacités, descriptions locales des acteurs, actions, erreurs et récupérations, catalogue/aide/fichiers/reprise/récaps, métriques et graphe, noms accessibles et copies/titres d’actions. Les messages locaux déjà affichés changent de langue par leur sémantique ; dates/nombres/unités se formatent sans changer leurs valeurs ou leur fuseau. Une raison inconnue nomme sa limite et conserve l’original technique ; ne jamais deviner une traduction.

Données immuables : identités attestées, noms/titres et extraits projet, invocations/arguments, valeurs de catalogue, question/prompts/options/réponses natifs, patchs, sorties et reçus bruts, chemins/IDs/hashes/codes. Des rôles/descriptions d’agents écrits par Madness sont des copies produit, distinctes du message/source qui les attestent. Source brute et traduction du cadre ne se confondent pas. Conserver Snapshotv1, progression/annexes13 et appearance-v1 ; la préférence de langue a son propre schéma/port. Bootstrap et reload reflètent la valeur Main courante, pas des arguments initiaux devenus anciens.

**Never:** Traduction/remplacement générique du DOM ou des messages/documents, modèle/service de traduction, nouvelle dépendance, palette/police/image/monde visuel, modification BMad/projet/compte/proxy/auth/fournisseur/runner/runtime. Aucun remount ou key/scope/révision métier dépendant de la langue, aucune langue dans metricScope/proof ni effet de lecture/collecte/lancement/focus déclenché par t/locale. Pas de migration des données métier/thème, timers/coûts de notre développement, nouveau lancement Graph, OAuth/JWKS ou modèle comme contrôle routinier. Pas de refonte/sweep des17anciensrouges à la place de15 ; une régression causée/exposée par14 reste à corriger ici. Profils personnels et préversion utilisateur intacts, pas d’installation personnelle ni accord humain/WCAG/G2–G5 inventés.

## I/O & Edge-Case Matrix

| Cas | Entrée / état | Attendu | Erreur / récupération |
|---|---|---|---|
| L1 Amorçage | Profil neuf ; préférence EN valide ; absence ; reload après choix | FR sans écriture si absent ; EN avant premier rendu utile si conservé ; html.lang cohérent et read Main courant avant montage | Bridge initial ancien/refusé : secours signalé, aucun blocage du brouillon |
| L2 Préférence | FR→EN→FR, sauvegarde refusée, octets illisibles/futurs, demandes concurrentes/fermeture | Choix de session maintenu, succès durable distinct, file sérialisée et garde closing ; fichier invalide/futur intact, défaut FR à réouverture | Avertissement localisé ; read ne réinitialise pas le choix de session après write échoué ; pas réparation/écrasement implicite |
| L3 Surfaces | Accueil/shell/connexion, préparations/initiatives/aide/catalogue, reprise/fichiers/récaps/acteurs/métriques/graphe | Cadre et actions cohérents FR/EN, copies normatives, nombres/dates/pluriels dans la locale ; raisons établies et récupération compréhensibles | Copie manquante repérée avant livraison ; diagnostic technique inconnu conservé/étiqueté, jamais sens inventé |
| L4 Travail vivant | Brouillon avec Unicode/cursor, recherche, filtre, détails, question et approbation préparées | Identités/valeurs/octets et contexte stables ; focus ne saute pas par rerender et positions conservées ; seules commandes de préférence utiles | Pas de perte de saisie, fermeture/relecture, choix natif ou accord/rejeu ; contrôles gardés répondables seulement dans leur contexte |
| L5 Choix US | Sélection locale avant tour, refus déjà affiché, choose différé pendant changement de langue | Choix/preuve/requestId/texte/opération inchangés ; erreur se représente dans la nouvelle langue ; résultat tardif ne réattribue rien | Locale n’invalide ni ne réactive une sélection ; invalidation réelle de source/contexte reste persistante ; aucun deuxième choose/send |
| L6 Sens des décisions | Boutons question/réponse, autoriser/refuser, enregistrer/envoyer/arrêter, inconnu/partiel/durable | Labels et payloads restent appariés ; changement de langue ne déclenche aucun effet ; coût indisponible/null≠0/historique exacts | Relecture bilingue indépendante incluant les commandes réellement envoyées et le texte brut inchangé |
| L7 Graphe et fichiers | Résultat/zoom/pan/nœud/recherche et aperçu/retour en cours | Graphe commandé dans la locale sans analyse ; noms/types/codes/relations et contenu bruts ; fichier et retour exacts | Aucune nouvelle autorité fichier ou ouverture éditeur, ni restauration d’une autre référence |
| L8 Variantes | Deux langues×deux thèmes,720px,zoom200,noms longs,mouvement réduit, rail/tiroir | Même monde atelier, nom/état/fermeture/actions visibles et atteignables ; flux vertical sans débord ; contrôle langue compact sans zone de drag | Préserver focus/lecture quand la longueur change ; annoncer la limite mesurée, pas un succès visuel d’un crop |
| L9 Natif passif | Paquet propre, préférence choisie, fermeture/reload/réouverture hors ligne ; copie des données avant/après | Langue retrouvée, thème indépendant et Snapshot/brouillons/annexes/contenus exacts ; aucune collecte/provider/réseau demandée | Observations limitées à la période après hook ; fermeture possédée avant nettoyage ; aucune preuve SIWC native déduite |
| L10 Frontière | Commande/enum/corrélation/appelant invalides ; fermeture avec write pending | Contrat strict, pont figé et confiance de fenêtre/mainFrame conservés ; mutations refusées après closing, queue drainée | Aucun accès fichier arbitraire, aucun autre port ou effet débloqué par la préférence |

</frozen-after-approval>

## Code Map

- `src/contracts/appearance.ts:3–32`, `src/adapters/persistence/appearance-store.ts:13–48` : patron existant exact {theme,warning}, read≤1Kio UTF8, absence sans écriture, schéma futur/invalide préservé, queue/temp exclusive/sync/rename. **Ne pas y ajouter language** : validateurs exacts incompatibles. Créer sibling `src/contracts/language.ts`, `src/adapters/persistence/language-store.ts`, `language-v1.json`, Language=fr|en, état {language,warning:read-failed|save-failed|null}, read/setLanguage et bootstrap strict ; défaut FR. Aucun coordinateur métier nécessaire, état et file privés Main comme appearance.
- `src/main/index.ts:118–142,124,332,348–352` : restore unique, valeur de session et queue, read courant sans relecture disque, contrôle fenêtre/mainFrame/corrélation/closing et drain. Ajouter le port de langue sibling, bootstrap additionalArguments et copie produit native détenue par Madness si nécessaire (titre/commande de sélection de dossier), sans toucher à la voie de thème ni aux connecteurs. Labels système Windows/éditeur/auth externes gardent leurs propres langues. `preload/index.ts:8–23` : pont gelé, état initial gelé et validation de réponse ; étendre uniquement le nouveau port typé. `env.d.ts:10–13` et `main.tsx:8–16` : read Main courant avant createRoot pour éviter ancien argv au reload.
- Nouveau `src/renderer/src/Locale.tsx` ou équivalent : un provider stable autour d’App, hook réactif et dictionnaires/formatters typés ; html.lang. Fonctions pures reçoivent locale explicitement. Petites copies locales sous clés+paramètres/codes, pas de phrases FR capturées dans state. Séparer valeur de langue, warning de stockage et éventuelle erreur de pont ; résultat tardif de préférence n’impose pas une ancienne valeur après un choix plus récent. Préserver les positions autour du changement de hauteur, sans focus vers Envoyer/Autoriser.
- `strings.ts:1–16,17–81,84–278`, `file-strings.ts`, `graph-strings.ts` : réutiliser tables FR/EN catalogue/reprise/refresh/fichiers/métriques/graphe, fournir EN global de l’objet fr et clés restantes des JSX. Types communs des clés, pas dépendance de traduction. Un petit tableau sémantique par domaine suffit ; pas d’extraction ou traduction automatique de données. Catalogue/aide/Graph descriptions de projet et champs de valeurs demeurent littéraux.
- `App.tsx:43–55,89–103,170,217–230,530–695` : cadre/préparation/dialogues/connexion/notices. Insérer une commande de langue globale compacte et nommée dans les commandes existantes, cible et no-drag selon DESIGN ; pas nouvelle page. Réutiliser `Icon.tsx`/contrôles natifs si besoin d’un pictogramme, sans asset. **Ne pas modifier les identités/scopes de navigation, requêtes ou choix métriques.** Main assertStory204–208 et prédicat App219 restent concordants ; locale n’en fait pas partie. Les lignes de données et messages ne passent jamais par t.
- `UsMetrics.tsx:8,20–31,38–39,52–83` : words et reasons sont actuellement figés au module, formatters en FR et erreurs mémorisées comme phrases. Les rendre réactifs/purs avec locale et clés sémantiques ; pas seulement une substitution d’import. Garder rawMs/duration connus, membres/occurrences et préconditions identiques. `metricScope` ne reçoit jamais locale ou fonction t.
- `ProjectResume.tsx:20–25,33–43,47–67`, `ProjectLibrary.tsx:9–27`, `WorkOverview.tsx:8–27,35–67`, `NetworkHelp.tsx:7–21` : labels/dates/pluriels/notices réactifs, champs source/extraits/contextes inchangés. Effets de lecture/annonce ne redémarrent pas pour locale ; l’ancienne annonce se représente sans nouvel événement métier.
- `QuestionPanel.tsx:8–26`, `ApprovalPanel.tsx:7–29`, `RecoveryPanel.tsx:10–18` : traduire cadre/états/délais/commandes. Conserver field.header/prompt/options, valeurs/réponses, patchs/paths/result.raw et IDs ; payloads et verrou d’ajustement restent strictement identiques. `FilePreview.tsx:15–44`, `InitiativeSelector.tsx:5–47`, `HelpPanel.tsx:10–27`, `CatalogPanel.tsx:13–50`, `CatalogLaunchPanel.tsx:11–21` : compléter les copies et noms accessibles, conserver préparations et retours par IDs ; pas nouveau browse/read lors de bascule.
- `agentPresentation.ts:3–18`, `AgentInfoPanel.tsx:17,30–62`, `AgentPortrait.tsx:7–8` : les sept rôles/descriptions/spécialités locales se traduisent ; nom attesté/source/message/portraits non modifiés. `GraphPanel.tsx:11–56` a déjà prop language et graphLabels[language], mais App ne la passe pas ; câbler provider, compléter comptages/phrases mixtes. Garder exploration/recherche/fichier et codes EXTRACTED/INFERRED/AMBIGUOUS avec label localisé, sans reclassification.
- **Textes reçus produits par Madness** : `core/project-library.ts:19–29` limits/reason, `core/project-files.ts:15,36,60–72` raisons, `core/bmad-catalog-launch.ts:42` preparation.effects et activités de `core/dialogue.ts:69,102,266,379–402`/`adapters/codex/dialogue.ts:296–306,442`. Présenter codes/discriminants là où disponibles, sans changer stockage/protocole. Pour raisons historiques sans code, presenter borné aux slots produit, table fermée et paramètres techniques intacts ; un original inconnu reste identifié comme tel. **Jamais traducteur générique de chaînes ni traitement des corps de message/rawreceipts/extraits.** Les fichiers de ces producteurs ne doivent pas être réécrits pour la traduction.
- Positions déjà implémentées : App59–70, ProjectResume33–43, CatalogPanel22–24, FilePreview25–31, AgentInfoPanel30–41, GraphPanel15–31. Clés/IDs et détails restent montés ; pas de locale dans les effets d’ouverture/focus/lecture/qualification ni dans leurs dépendances via une fonction t instable. Conserver saisies et scrolls utiles même si le texte traduit prend plus de place.
- Tests `appearance.test.mjs:32–107` pour nouveau contrat/store ; `maintenance.test.mjs:80–114` et `helpers/windows-file-lock.mjs` pour vrai refus rename. `connection-ui.test.mjs:21–45` vrai renderer isolé, contextes/questions/approbations/fichiers/retours et nouveaux20cas13 ; fixtures existantes restent en défaut FR. Nouveaux cas langue par noms, ou fichier/harness séparé si justifié. `graph-ui.test.mjs:12,26` exploration conservée. Banc passif `workspace-design.mjs:50–84,343–346`, `us-metrics-ui.mjs:23–33,44–67` : vraie Main/preload/store, profils isolés, compteurs aprèshook et fermeture possédée. **CSP : pas addStyleTag** dans candidat ; cadre natif200 complet via capturePage et `assertFullMetricsCapture`, pas crop Playwright au zoom.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/language.ts`, `src/adapters/persistence/language-store.ts`, nouveaux tests langue — TDD des commandes/bootstrap/absence/illisible/futur/échec/réouverture/ordre et préservation du thème/Snapshot ; reprendre patron appearance sans migration ni option métier.
- [x] `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts`, `src/renderer/src/main.tsx` — port strict et valeur Main de session, bootstrap/reload, queue closing/drain ; données et ports existants conservés.
- [x] `src/renderer/src/Locale.tsx`, `strings.ts`, `file-strings.ts`, `graph-strings.ts`, éventuel petit presenter de copies produit — FR/EN complet, formatters explicites et notices sémantiques ; matrice des slots propres/raw utile pour vérification, sans outil de traduction ni dépendance.
- [x] `App.tsx`, `Icon.tsx`/CSS ciblé et les composants listés au Code Map — brancher choix compact, labels/états/aria réactifs, noms de rôle locaux ; conserver handlers/payloads/scopes/positions. Pas retouche de palette/fonts, rootDESIGN/sidecar inchangés.
- [x] Tests UI ciblés et `scripts/qualification/language-ui.mjs` si utile — couvrir L1–L10, notamment bascule pendant choix US/choose différé et demande native, anciens messages d’erreur, fichier et graphe, refus de stockage et vrai reload/réouverture passifs ; aucun appel modèle/collecte/éditeur pour la langue.
- [x] `package.json`/lock version0.2.16, build/NSIS dans `dist/language-reviewed` — candidat courant utile, profils propres et reçus/source/ASAR exacts. Pas installation personnelle ; nettoyer binaires/témoins possédés après arrêt prouvé, préserver backup0.2.13 imposé par auto-review, dernier setup utile et préversion utilisateur.
- [x] Parent — lire diff, vérifier matrice et limites, Quick + relecture bilingue indépendante des actions/erreurs/payloads/données brutes (contrôle high) ; mêmes worker/relecteurs pour corrections. Impeccable extension existante, deux lots visuels groupés maximum/un détecteur et finition/documentation officielles fraîches ou substituts techniques explicites. Commit local puis15 autonome.

**Acceptance Criteria:**
- Given un projet ouvert avec conversation, saisies et preuves, when l’utilisateur choisit EN/FR et change thème/largeur/rail puis revient ou rouvre, then l’interface et les états propres sont cohérents dans la langue choisie et les mêmes contenus/contexte/demandes sont retrouvés sans effet natif induit.
- Given une préférence inconnue ou une sauvegarde/lecture refusée, when la langue est choisie ou relue, then la copie de session et le statut de conservation sont exacts, les octets existants et données métier/thème intacts et la rédaction disponible.
- Given des décisions/mesures/données brutes dans les deux langues, when les contrôles et détails sont utilisés, then le libellé respecte le payload et les données techniques, aucune validation/durée/coût ni traduction de source n’est inventée.

## Implementation Notes

Implémentation et vérification terminées sur le gel004 : préférence locale indépendante du thème, cadre FR/EN réactif et contrôle commun aux modales ; sources, brouillons, choix et autorité métier conservés. Voir `../qualification-langue/parent-verification.md` et `parent-verification.json`. Les 38 cas de003 restent distincts des cinq cas worker/deux cas parent ciblés004 ; compilé006 et paquet004 passent chacun11 contrôles, types/build/NSIS verts. Même Quick Q1–Q4-r1 résolus, audit bilingue high[], finition SHIP fonctionnel004 et documentation55liens ; aucun correctif produit différé. ASAR final0.2.16 `4bc95cfc3636113bd79cd0da40512e09528da9d31906949d9960171b1eee00cf`, non installé personnellement ; images002 historiques uniquement, deux lots/un détecteur. Ancien unpacked0.2.15 supprimé après contrôles, 580404699octets logiques ; setups13/14/15, candidat16 et préversion utilisateur intacts. Les17anciens rouges restent à traiter en2.15, puis qualification intégrée2.16 ; aucune nouvelle preuve humaine/WCAG/SIWC/G2–G5 déduite.

## Plan Change Log

## Review Triage Log

| ID | Relecteur | Verdict | Preuve vérifiée et route |
|---|---|---|---|
| Q1 | Quick | medium | App renders only toolbar LanguageControl; FilePreview narrow/expanded and AgentInfoPanel narrow call showModal. HTMLmodal makes toolbar inert; languageUI evaluate(button.click) explicitly avoids native reachability. Patch : Reuse same existing language command/provider in active modal headers, without new state, port, handler or authority; actual user pointer/keyboard tests keep same consultation/source/selection. |
| Q2 | Quick | medium | Coordinator emits exact unreadable-store/stale-reference sentences; GraphPanel passes them to diagnostic slot, whose closed dictionary/prefixes lack those established sentences. Patch : Complete closed own-graph reason mappings and bounded parameter template, keep raw technical parameters and unknown fallback exact. |
| Q3 | Quick | medium | projectLibrary concatenates snapshot.problems into library limit and adds value.error. Library slot only translates prefix; known diagnostic templates are searched only in diagnostic slot. Existing snapshot problems array is available in entry.evidence. Patch : Render own partial prefix with existing structured problems through diagnostic presenter; do not split arbitrary technical strings or edit producers. Present established progress errors through bounded mappings, preserve exact parameters. |
| Q4 | Quick | low | Help Bundle unconditionally renders documents.length plus documents loaded and problems.length plus issues reported, e.g.1documents; graph uses fixed plurals and raw counts; formatCount exists but is unused at those sites. Patch : Apply existing explicitlocale formatters to UI-owned counts/byte sizes/plurals only, pair FR/EN forms without touching identifiers/raw values. |

Les trois relectures ont été reçues avant triage. Audit bilingue high : []; finition officielle via substitut technique frais : SHIP ciblé sur002, sans constat matériel. Quatre constats Quick vérifiés séparément avant regroupement ; les corrections sont privées, réemploient données/commandes existantes et ne créent ni autorité, port ou règle métier. Aucun intent_gap, bad_plan ou correctif différé démontré ; bloc figé conservé. Le contrôle modal ajoute seulement l’accès au même changement de langue dans le contexte déjà existant.


Recontrôle003 : mêmes Quick et audit bilingue/finisseur reçus. Q1/Q2/Q3 résolus ; audit bilingue []; SHIP fonctionnel ciblé003 sans image003 inventée. Q4 reste partiel : App112 conserve o.bytes et les compteurs de ses groupes ; UsMetrics41 conserve bytes fixe, ProjectResume76 le compte brut. Audit AST parent borné aux expressions JSX length/bytes confirme ces sites. Les identités, lignes/révisions et données brutes ne sont pas des compteurs à reformater.

| ID | Relecteur | Verdict | Preuve vérifiée et route |
|---|---|---|---|
| Q4-r1 | Même Quick + parent | low | App WorkflowResult112 affiche o.bytes+ui.bytes et compte observations sans formatter ; trois groupes App676/677/680, ProjectResume76 encore bruts. UsMetrics41 formate le nombre mais emploie bytes au singulier. Patch mécanique privé des unités/compteurs propres par les helpers existants, aucun handler/état/contrat modifié. |


Recontrôle final004 : même Quick Q4-r1 résolu, Q1–Q3 maintenus ; même audit bilingue []; même finisseur SHIP fonctionnel limité004. Cinq compteurs et deux tailles, aucun changement d’état/handler/autorité. Parent a lu les deltas003 puis004 ; images002 et paquet003 demeurent historiques. Aucune capture/détection supplémentaire ni correction différée. Les reçus finaux du paquet004 restent contrôlés séparément, sans accord humain/WCAG/G2–G5 déduit. Voir reviews-final.json.

## Design Notes

Un seul objectif utilisateur transversal : utiliser l’interface dans sa langue en gardant son travail. Routefull (plusieurs couches et nombreuses surfaces). Risque initialmedium de14 relevé high après enquête : phrases propres et données natives cohabitent dans les mêmes props ; une traduction d’Autoriser/Refuser, une remise à zéro ou un mauvais rattachement peut tromper une décision. L’audit bilingue prévu par l’epic vérifie aussi ces frontières et ne crée pas de nouveau gate humain. Pas d’inconnue produit : FR/EN et thèmes déjà adoptés, défautFR hérité ; emplacement d’un petit contrôle et noms de modules sont des choix techniques sous délégation.

Exemples : un prompt natif français reste français sous un cadre anglais ; un rôle local « Analyste » devient « Analyst », sans changer le nom Mary attesté. « Allow entire patch once » garde decideApproval(accept), « Reject entire patch » garde decline ; Save draft ne transmet jamais. Même story/choiceRef/texte/opération avant et après locale, aucune nouvelle autorité ou invalidation. Une erreur déjà reçue en FR se représente en EN par son code, sans nouvelle lecture.

Worker propriétaire du code langue/UI/tests/banc/proofs ; tu n’es pas seul, préserver les changements d’autrui et managed/untracked/EOL-only `tests/bmad-help-boundaries.test.mjs`. Parent seul plan/frozen/revues/statuts/git ; aucun nestedBuild/agent production imbriqué, pas push. Root réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, hostcwd obsolète ; tout exec même lecture pwsh/login:false/workdir absolu/require_escalated, py -X utf8 et écritures UTF8 explicites. Source13/17anciensrouges, essais natifs et preuves historiques ne changent pas de révision. Epic note04Nov :2.2built/M14clos03Nov, ne pas rouvrir cette story ;16 reste qualification intégrée du futur paquet. Root Impeccable context déjà exécuté une fois cette session ; worker frais context une fois et craft-floor avant editUI. Maximumdeux lots visuels/un détecteur pour14, pas nouvelle direction ou assets.

Le porteur dort et a délégué tout le parcours, revues/commits compris, hitl/checkpointsfalse : aucune question routinière/limite tokens ni nouveau clic Zscaler. Profils personnels et `dist/graph-preview-0cf3cc35` intacts. Le dernier nettoyage a rendu~12GiB puis580295238octets ; auto-review refuse de supprimer le secours0.2.13, à conserver. Garder seulement candidats nécessaires et derniers secours autorisés, pas séries de win-unpacked ; pas purge globale de caches/profils/autresworktrees. Préférer lecture Git en batch/diff unique aux centaines de gitshow sur preuves non suivies.

## Verification

**Commands:**
- Contrats/store/locale et nouveaux tests UI par noms pertinents + régressions affectées. Reproduire les rouges réels et conserver provenance, puis vert ; ne pas exécuter l’intégralité global17déjàrouge comme préalable à14. Ne pas supprimer ni maquiller un ancienrouge ; si nouveau changement l’expose, instruire précisément ici.
- `npm run build` (types inclus) puis NSIS x64 existant outputdist/language-reviewed après source stable. Vérifier seuls pins/ressources/paquets réellement affectés ; pas nouvel audit735/2305 ou exportCLI ni effet fournisseur.
- Banc compilé/paquet passif avec nouvelle préférence réelle, reload et fermeture/réouverture possédés ; snapshot/brouillons/annexes/contenus avant/après, thème indépendant, source/ASAR exacts. Échecs de langue ciblés sur profils possédés, aucune copie de coffre.
- `git diff --check` ; revue et rechecks vérifiés. Un seul détecteur et au plus deux lots visuels groupés couvrant EN/FR,clair/sombre,720px/zoom200,noms longs et états utiles ; erreurs de banc conservées sans inventer preuve ou multiplier les tours de design. Après vert, élargir/répéter seulement pour nouvelle erreur/changement/préoccupation réelle.

**Manual checks:**
- Parent voit captures exactes du candidat et des contrôles/questions/approbations/détails source, confronte libellés normatifs aux payloads/limites ; relecteur bilingue indépendant, finition et documentation ciblées. Ancien ASAR2f31… et ses images ne deviennent pas preuves du nouveau0.2.16. Manques natifs/humains reportés explicitement à16, sans fausse clôture des gates.
