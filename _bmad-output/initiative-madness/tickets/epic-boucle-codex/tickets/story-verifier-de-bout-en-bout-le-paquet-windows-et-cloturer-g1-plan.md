---
title: 'Vérifier la boucle intégrée Windows personnelle et clôturer G0/G1'
type: 'chore'
ticket: 11
created: '2026-10-28'
status: built
baseline_revision: '4855e7dc7eb1371534220bb6bf861c05b5ab672c'
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
  - '{project-root}/_bmad-output/initiative-madness/decision-personnelle-locale-2026-10-28.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les lots built2,12,3–10 ont des preuves séparées. La clôture technique de l’epic demande une suite intégrée rattachée au paquet Windows personnel courant, en particulier fermeture/erreur avec session active, nettoyage effectif et accès du vrai processus Codex. Une somme de tests simulés ne remplace pas cette preuve et l’ancien spike distribuable1.1 reste dropped.

**Approach:** Produire un harnais permanent reproductible, ses contrôles de garde et un rapport consolidé : bancs synthétiques sur le même exécutable, protocole natif loopback identifié comme tel, puis parcours personnel court avec la connexion SIWC existante et des témoins neufs. Corréler paquet/runner/contexte/événements/reçus/effets ; vérifier arrêt et disparition des seuls espaces possédés ; rouvrir sans moteur spontané et archiver seulement les données témoins après les contrôles. Consommer le manifeste final0.1.2 de1.13, conserver le manifeste historique0.1.1 et les preuves de remplacement1.9, avec une provenance distincte pour les nouveaux bancs.

## Boundaries & Constraints

**Always:** Usage personnel local Windows, code privé, forfait ChatGPT et connexion SIWC déjà livrée. Compte et données réelles conservés, variables AppData/session normales dans le parcours personnel, accès chiffré restant dans le programme. Toute réussite est liée à des observations expurgées ; absence de reçu, d’arrêt confirmé ou de nettoyage constaté reste inconnue/échec. Les accords synthétiques sont exécutés sous le mandat, jamais présentés comme une nouvelle acceptation humaine. Les conditions de BMad et ses fichiers réellement installés restent la source de l’invocation.

**Never:** Nouvelle authentification, publication, admission de distribution, changement de facturation/fournisseur, lecture ou copie de token/coffre, affaiblissement TLS/proxy, rejeu d’un ancien contrôleur/témoin, écrasement de rapport historique, nettoyage par nom de processus ni d’un profil ouvert. Aucun reset de propriétaire incertain. Aucun changement produit, catalogue général, initialisation, graphe, Loop, R32 ou refonte UX dans ce lot. Une correction produit découverte exige une décision de périmètre, pas un contournement du banc.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Provenance | Exécutable installé0.1.2 et manifeste final1.13 | ASAR, runner, version et runtime observé correspondent ; nouveaux bancs ont leur révision/empreintes distinctes | Refuser un artefact hybride ou un rapport de succès non lié ; ne pas régénérer les inputs historiques |
| Bancs isolés | Profils synthétiques et sortie de rapport neuve | Forge, conversation, questions, accords, récupération, attentes et Windows exercés sur le même exécutable ; origine simulée explicite | Échec conservé dans son run, fermeture puis nettoyage possédé, aucun rapport ancien écrasé |
| Vrai BMad | Témoin neuf, compte existant lisible, profil BMad vérifié | Invocation Mary et workflow Forge réellement installé ; progression corrélée avant terminal, journal/livrable et chemins relus | Pas de succès par prose seule ni d’activation fictive ; garder les limites du profil de référence |
| Interactions | Question native et patch dans le témoin | Réponse explicite avec reçu brut exact ; accord ponctuel avec résultat natif et tous effets relus ; refus distinct sans effet | Une requête résolue ou un flush ne suffit pas ; mauvais contexte/commande tardive refuse sans rejeu |
| Expiration et inconnu | Horloge contrôlée/banc synthétique, reçu volontairement retiré en loopback | Contrôle local expiré inactif ; effet historiquement inconnu reste inconnu après inspection, nouveau départ explicite | Ne pas prétendre une expiration autonome du runner ; pas de rejeu implicite |
| Arrêt/fermeture/erreur | Session active et enfant possédé | Arrêt par pont, fermeture d’application pendant activité, et sortie inattendue contrôlée d’un enfant donnent identité/close/état durable puis disparition de leurs seuls espaces | L’incertitude bloque la relance concernée ; conserver les éléments utiles, ne pas forcer un statut connu |
| Réseau/TLS | Vrai runner et endpoint HTTPS imposé | Tour externe réussi corrélé, environnement TLS/proxy non affaibli ; accès et confiance TLS acceptés pour ces requêtes inférés du succès | GET Main séparé ; chaîne/CA non observées. Nouvelle erreur publique307 peut nécessiter un clic humain, jamais une nouvelle question sur le JSON déjà confirmé |
| Réouverture et conservation | Dernier état durable capturé après fermeture | Textes/annexes/brouillons exacts, demandes historiques inactives, compte lisible, aucun moteur/réseau spontané dans la fenêtre instrumentée | Ne pas confondre état avant shutdown et durable final ; absence d’observation avant hook explicitée |
| Fin d’essai | Profil fermé et tous contrôles de réouverture terminés | Seuls témoins créés archivés hors récents, vrais projets/préférences conservés ; dossiers liés gardés aux chemins des preuves | Aucun nettoyage si propriétaire/fermeture ou provenance des données ne sont pas prouvés |

</frozen-after-approval>

## Code Map

- `scripts/qualification/{forge,conversation,questions,approvals,recovery,overview}.mjs` : bancs UI existants acceptant `--packaged --executable=<absolu> --no-captures`, mais sorties historiques fixes. Ajouter un choix explicite de répertoire de rapport sans changer leur scénario ou leur défaut existant ; le nouveau harnais fournit toujours une sortie neuve.
- `scripts/qualification/{overview-native,recovery-native}.mjs` : vrais runners avec Responses loopback, sans compte ; overview accepte déjà `--output`, recovery doit recevoir une sortie neuve. Ne pas confondre leurs résultats avec l’accès externe SIWC.
- `scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots --executable=...` : cinq contrôles Windows sans réécrire G0 historique.
- `scripts/qualification/maintenance.mjs` : `assertReleaseArtifact` contrôle ASAR/version/runner ; `assertReleaseRuntime` contrôle l’Electron réellement lancé. PhaseA figée0.1.0 : ne pas la relancer sur l’installation courante. `scripts/release/manifest.mjs:createManifest` lit les inputs courants : ne pas le relancer pour attribuer les nouveaux bancs à l’ancien ASAR.
- `src/preload/index.ts` : ponts réels `madness`, `madnessConnection`, `madnessDialogue`. Attendre les transitions terminales après les commandes, qui retournent souvent un état intermédiaire. `saveQuestion/answerQuestion`, `saveApproval/decideApproval`, `stop/observeStop/inspectApproval` sont les autorités existantes.
- `src/adapters/codex/{probe,dialogue,owned-run}.ts` et `src/main/index.ts` : contrat d’arrêt et identité Windows, espaces éphémères, `before-quit` attendant shutdown. Les suppressions de dossiers avalent certaines erreurs : contrôler leur absence indépendamment de `stopped`.
- Patrons historiques à lire, jamais à exécuter : `_bmad-output/initiative-madness/.working/story15-live-final-controller.mjs` (lancement normal, question/reçu/arrêt/réouverture), `story16-live-after-network-controller.mjs` (patches), `story16-prepare-live-after-network.mjs` (FORGE_MANIFEST), `story16-installed-reopen-controller.mjs`, `story16-clean-owned-witness.mjs`. Corriger les limites déjà connues : clic Enregistrer explicite, vrai PIDMain distinct du wrapper, shutdown final avant capture, garde globale/interruption parent.
- `tickets/epic-boucle-codex/qualification-maintenance/{release-manifest.json,installation.json,parent-verification.md}` sous l’initiative : preuves0.1.0→0.1.1 et empreintes, inputs historiques à conserver. ASAR installé observé `bbac088b9dd9a6c3ad66871dc2db27956378f3a29967df2a734b1e14d007b639`, aucune fenêtre Madness observée à l’entrée de ce lot.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/qualification/epic-one.mjs` et ses éventuels helpers `epic-one-*.mjs` — orchestration/rapports neufs, provenance, inventaire fermé, checks bornés et fermeture/cleanup possédés ; modes synthétique et personnel explicitement séparés, aucun accès personnel par défaut ni import à effet de bord.
- [x] `scripts/qualification/{forge,conversation,questions,approvals,recovery,overview,recovery-native}.mjs` — sortie explicite réutilisable vers les nouvelles preuves, sans écraser ou relire comme frais les anciens résultats et sans modifier les scénarios produit.
- [x] `tests/epic-one-qualification.test.mjs` — vérifier gardes de chemin/artefact et reprise, conservation des preuves, rapport expurgé et distinction des sources/échecs/limites ; tests sans profil personnel ni modèle.
- [x] `docs/development.md` — documenter commandes du nouveau harnais, effets exacts de son mode personnel, provenance et limites, sans remplacer les preuves historiques.
- [x] `qualification-e2e/` sous l’epic — parent exécute et conserve rapports synthétiques, loopback et personnels, états de fermeture/nettoyage/réouverture, matrice R1–R10, limites et conclusion G0/G1 ; toute tentative échouée garde son reçu distinct. L’implémenteur n’exécute pas de parcours personnel.

**Acceptance Criteria:**
- Given le paquet0.1.2 installé, when les contrôles sont lancés, then le rapport lie exécutable/ASAR/runner/runtime aux artifacts du manifeste final1.13, en conservant le manifeste1.9 historique et nomme la provenance propre des nouveaux bancs.
- Given les bancs synthétiques et natifs loopback, when la suite finale est exécutée avec une sortie neuve, then leurs scénarios passent, leurs limites de simulation sont explicites et les empreintes des preuves historiques restent identiques.
- Given un témoin BMad neuf et la connexion personnelle existante, when le parcours réel est exécuté, then contexte/invocation/progression, réponse avec reçu exact, accord/refus et effets observés, fin de tour et fichiers sont reliés à la même conversation ou à des conversations distinctes nommées, sans validation humaine inventée.
- Given une activité native possédée, when arrêt par pont, fermeture active ou erreur de processus contrôlée survient, then le vrai Main et les enfants concernés ferment selon l’identité observée, le propriétaire durable est relu et leurs seuls espaces nouveaux sont absents ; une observation manquante laisse le contrôle en échec/inconnu.
- Given le durable final après fermeture, when Madness est rouvert, then données du témoin exactes, demandes inactives et compte lisible sont constatés, sans lancement ou réseau spontané dans la fenêtre instrumentée ; le nettoyage final n’archive que le témoin et respecte le profil fermé.
- Given un tour externe corrélé réussi avec le vrai runner et sa configuration HTTPS/TLS contrôlée, when le rapport qualifie le réseau, then il distingue l’inférence d’accès/confiance du child du GET Main et de toute chaîne/CA non capturée.
- Given les preuves1.9 du remplacement et celles de1.13 sur l’artefact0.1.2 courant, when la matrice finale est relue, then chaque R1–R10 et G0/G1 a preuve/limite explicites ; absence d’essai global humain, G2–G5 étendus, catalogue et V1 complète ne sont pas annoncés acquis.

## Implementation Notes

Reprise après13 sous le mandat humain de finir l’epic, avec validation technique déléguée : changement du seul artefact consommé dans le bloc figé (0.1.1/manifest1.9→0.1.2/manifest final13), but et exigences inchangés. Ancien bloc conservé dans qualification-e2e/frozen-intent-before-1-13.md et dans70cb38ac7a8cbaca0b5adfa35fa41aa599596639 ; nouvelle empreinte enregistrée. Baseline originelle4855e7dc7eb1371534220bb6bf861c05b5ab672c conservée ; correction13 déjà committée dans494f8d85e8d262de6144ae63742b4fb0384436c4, pas réimplémentée ici. Aucun ancien reçu, plan built ni nouveau besoin produit modifié.

Le paquet installé courant0.1.2 a ASAR9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4, manifeste qualification-forge-session-check/installation-final/release-manifest.json sous l’epic. La1.13 est built, tests338incluant harnais11, paquet9/Windows5/réouverture7 et42empreintes critiques identiques ; aucun modèle dans13. Les anciens tests personnels11 sont explicitement bornés à0.1.1 ; ils restent historiques, les témoinsfailed/diagnostic ont été rouverts puis archivés, MIA/madness seuls, aucun programme personnel actif. Le refus001 reste inexpliqué ; ne pas en déduire un succès ni rejouer ses conversations.

Adaptation étroite de reprise par un implémenteur frais lisant ce plan : defaultManifest pointe sur le manifeste final13 ; verifyArtifact exige la version exacte releaseVersion du projet courant et contrôle toujours identité/ASAR/runner/runtime, sans faire confiance à une version quelconque du seul manifeste. Tests de mismatch et fixture de version adaptés à cette autorité unique. Trace passive : reconnaître bmad_forge_check_sessions sans argument et l’opération check-sessions ; budget de métadonnées porté à2048événements, maximum déjà prévu, pour couvrir le parcoursmulti-tours (une activation diagnostique a déjà produit51événements). Préserver8Mio cumulés/1Mio ligne, expurgation, relais inchangé et incomplet→échec ; ajouter vérification de plusieurs centaines d’événements sans contenu privé et de dépassement explicite. Aucun plafond ajouté au produit ou budget en tokens. Documenter le nouvel artefact et la commande --manifest explicite, sans modifier la section13 désormais committée. L’implémenteur ne lance aucun compte/modèle/banc personnel ni nouvelle suite synthétique ; tests ciblés du harnais seulement, parent possède la qualification fraîche sur le programme installé. Scénario réel et refus des situations imprévues préservés. Cette invocation Build11 reste celle du snapshot8819f97afe6448b9c573, ne pas la rerendre.

Route full : nouveaux harnais et gardes dépassant100lignes ; risque high conservé car une fausse qualification ou un nettoyage personnel incorrect aurait un effet important. Deux explorateurs frais ont fourni couverture et primitives, sans toucher au profil ni lancer de programme. Le mandat autorise les plans, contrôles et accords synthétiques ; une fenêtre réelle non sauvegardée, un nouveau consentement OAuth ou un nouvel acquittement réseau nécessaire restent des actions humaines distinctes.

Propriété d’implémentation : l’agent de développement possède les nouveaux scripts `epic-one*.mjs`, les modifications de sortie des bancs nommés, le nouveau test et la section documentaire prévue. Le parent possède le plan/statut final, les rapports de qualification, les revues, tous les essais personnels et le commit. L’implémenteur n’est pas seul dans le dépôt : ne pas annuler les edits d’autrui, adapter son travail aux changements présents. Aucun commit ni parcours personnel par l’implémenteur ; il peut exécuter tests et bancs synthétiques strictement isolés vers ses seules sorties neuves. Cette invocation Build est déjà rendue et planifiée ; ne pas la rerendre ni démarrer un autre workflow.

Premiers contrôles parent : préflight normal sans modèle réussi002. Le run réel001 acquiert accueilMary, question/réponse+reçu exact, accord/refus et effets, arrêt/rejet tardif ; Forge échoue ensuite à sa première activation avec UNSUPPORTED_INTERACTION, après `resolve-workflow` et `resolve-config`, sans workspace ni conclusion. Ce run reste failed-no-replay ; troisPIDs et deux espaces possédés ont été vérifiés absents après fermeture. Deux autres témoins réels distincts passent : close-active001(8contrôles) et child-error001(9), avec réouvertures exactes, compte lisible, zéro activité spontanée après hook et archivages limités. Le témoin failed001 reste conservé pour diagnostic et contrôle de réouverture avant archivage. Aucune fermeture G1 déduite de ces succès partiels.

L’investigation Forge en lecture seule ne prouve pas encore la branche : reprise/glob manquant au bridge est une hypothèse. Extension diagnostique passive bornée du harnais et activation Forge seule sur un témoin neuf demandées, sans args/env/texte secret publié, sans modifier le produit ni transformer l’échec en succès. Les cas personnels sont tous fermés avant cette évolution du harnais.

## Plan Change Log

Consolidation du28octobre : nouveau clic humain reçu pour le blocage13:06, GET Main003200 sans redirection, puis parcours personnel002(12contrôles,ForgeHARDENED/38observations), fermeture active001(8) et panne enfant002(9) réussis sur le paquet final0.1.2 installé. Chaque run rouvre exactement et archive son seul témoin profil fermé. Panne001 avait échoué à la première lecture Mary non admise, sans avoir simulé la panne : refus et six contrôles de conservation/archivage préservés, aucune garde changée. Matrice figée et R1–R10 reliées dans [final-matrix.md](../qualification-e2e/final-matrix.md). Aucun nouveau consentement ou coffre copié, aucune expiration Zscaler déduite.

Lecture parent : diff initial1480lignes lu dans cette invocation, puis deltas de reprise507lignes relus intégralement après reconstruction des seules sources ajoutées depuis le diff initial. Les adaptations de sélecteurs de la refonte ont aussi été lues dans son diff1925lignes. Les receipts de1.11 restent liés à leur ASAR9249..., révision et empreintes propres ; le candidat UX séparé et son correctif Q1 ont leur autre Build et ne sont pas une modification produit de ce lot. Matrice9lignes auditée par preuves exécutées, suite synthétique75contrôles et parcours réels. Revue Quick et relecture indépendante supplémentaire de conservation/nettoyage avant toute conclusion G0/G1.

## Review Triage Log

- Q1 — revue Quick finale, medium/patch, confirmé : les quatre bancs questions/approbations/vue commune/récupération ont reçu des sélecteurs de détails de la refonte distincte, absents du paquet1.13 effectivement qualifié. Le premier parcours synthétique positif utilisait leurs empreintes antérieures ; avec les scripts courants, la commande reproductible attendrait un détail inexistant sur l’ancien renderer. Les gardes d’artefact et assertions métier restent justes. Correction minimale : rendre seulement le dépliage conditionnel au chrome de détails effectivement livré, conserver l’attente explicite du détail sur le nouveau renderer et toutes les assertions de contenu/état ; qualifier les deux ASAR dans des sorties neuves sans capture/modèle. Aucun produit ni gate modifié.

- P1 — contrôle supplémentaire de conservation, low/patch documentaire : trois nouveaux runs positifs cohérents et383historiques identiques. Le reçu de nettoyage du run d’activation refusée omettait le lien autonome à son argv source ; ajout d’une attestation rétrospective du véritable appel outil94788, avec SHA du contrôleur/reçus et witness/artifact du reçu source. Recontrôle ciblé de ce lien demandé au même auditeur, sans rejeu ni accès AppData.

- Q1 — recontrôle, medium/patch, résolu : quatre enveloppes conditionnées au chrome réellement livré, attente et ouverture conservées sur le nouveau renderer. Ancien paquet final1.13 requalifié dans synthetic-current-002,10phases/75contrôles, nettoyage/historique conformes ; même relecteur confirme cause résolue et empreintes courantes des quatre bancs identiques au reçu. Aucun correctif différé.
- P1 — recontrôle, low/patch documentaire, résolu : même auditeur vérifie trois SHA, argv source/sortie, témoin et artefact du lien parent94788 ; réserve levée, nature rétrospective maintenue. Avis favorable sur les trois parcours positifs et383historiques inchangés, sans conclusion humaine inventée.

- A1 — contrôle indépendant de conservation, high/patch, résolu : la garde initiale ne cherchait que l’exécutable choisi. Une autre copie pouvait ouvrir le même profil après fermeture du banc et échapper au contrôle. Parent a confirmé le flux ; correction par `profileOwnerInventory/assertProfileClosed`, toutes copies Madness (dont renommées par ProductName) et Electron incertain refusées, avant les mutations d’archivage, sans arrêt par nom. Même auditeur recontrôle la cause et confirme aucun reliquat concret. L’implémenteur ajoute un témoin OS possédé dans un autre dossier : refus avant lecture d’un snapshot volontairement invalide, octets inchangés, enfant fermé/dossier supprimé ; ciblés13/13. Aucun parcours personnel ni archivage n’a précédé ce contrôle.

- A2 — lecture du diff par le parent, medium/patch, résolu : la première garde du banc personnel exigeait systématiquement un hash raw d’approbation. Le produit autorise pourtant `raw:''` lorsque le fileChange corrélé et ses effets relus suffisent (`dialogue.ts:171,281–282`), cas CodeMode déjà qualifié. `assertApprovalEvidence` impose maintenant transmission, statut natif et effets complets ; raw exact s’il existe côté résultat, diagnostic `unavailable` sinon. Questions : reçu brut exact toujours obligatoire. Régression rouge puis ciblés14/14 ; parent recontrôle le helper et son appel. Cette correction personnelle n’altère aucun des74contrôles synthétiques du runB antérieur, ni le produit.

- A3 — premier démarrage CLI personnel par le parent, medium/patch, résolu : `epic-one.mjs` attendait au top-level `main()`, qui importait dynamiquement personal ; personal importait statiquement les fonctions de ce même module d’entrée, d’où cycle TLA. Aucune entrée personnelle ni modèle atteint, reçu `../qualification-e2e/personal-preflight-001-startup-failure.json`. Partage extrait dans `epic-one-provenance.mjs` sans TLA ; API réexportée par l’entrée. Vraie régressionCLI rouge(sortieNode13), puis refus expurgé attendu1 devant cible inexistante sans profil créé ;15/15ciblés. Parent relit le helper/imports puis exécute le préflight002 : compte lisible, aucune activité spontanée après hook, vraiMain/enfants/espaces fermés, succèsCLI. Aucun changement produit.

## Design Notes

Historique avant1.13 : le paquet reste0.1.1 tant qu’aucun produit n’est modifié. Lien de preuve : manifeste1.9 intact et son SHA → mêmes artifacts → runtime effectivement lancé ; nouveau harnais/révision/empreintes consignés séparément. Aucun manifeste rétrospectif régénéré. Réseau du child : configuration imposée et tour réel réussi, confiance acceptée pour ces requêtes inférée, pas de certificat exporté.

Le mode personnel conserve l’environnement habituel filtré sans MADNESS_DATA_HOME ni déplacement AppData/session. Il lit l’état expurgé par les ponts, sans connexion/vérification facturable préliminaire automatique. Hooks passifs sur les seuls enfants app-server possédés : PIDs/hashes/close/identifiants/compteurs et comparaisons booléennes de reçus, jamais environnement complet, bearer ou stderr brut. Les observations antérieures au hook restent non couvertes. Garde globale et interruption du contrôleur passent par une fermeture bornée puis une preuve OS, sans effacer une incertitude.

## Verification

- Tests ciblés du nouveau harnais, puis `node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs` ; types, aucun saut de test pour fabriquer un succès.
- Exécuter les phases synthétiques séquentiellement sur le même exécutable installé avec sortie neuve ; protocoles natifs loopback séparés ; contrôles Windows ciblés sans captures supplémentaires non nécessaires.
- Parent seul : mesure réseau Main, parcours personnel court, fermeture active/erreur contrôlée, réouverture et archivage possédé. Refuser tout écart de coffre/compte sans reset ni nouvelle connexion implicite.
- Revue BMad selon step04 et contrôle supplémentaire indépendant de la conservation/nettoyage personnel ; aucun point matériel restant pour annoncer G0/G1.
- Rassembler la matrice finale sous `qualification-e2e/`, vérifier empreintes historiques et bloc figé, clôturer le plan seulement avec les preuves requises. La refonte Sally/experts/Impeccable commence ensuite sous son workflow propre.
