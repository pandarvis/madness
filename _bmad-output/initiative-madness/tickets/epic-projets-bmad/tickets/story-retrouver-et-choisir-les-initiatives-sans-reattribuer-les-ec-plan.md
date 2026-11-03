---
title: 'Retrouver et choisir les initiatives sans réattribuer les échanges'
type: 'feature'
ticket: '3'
created: '2026-11-03'
status: built
baseline_revision: '03c288066e3105974c7a90041688c01d5df687e8'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/epic-projets-bmad.md'
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/profil-g2.md'
  - '{project-root}/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Madness retrouve un projet mais ne propose pas encore le choix local durable de ses initiatives. Le titre dérive d'un échange existant ; utiliser cette valeur comme navigation pourrait déplacer son sens ou viser un autre contexte lors d'un nouvel effet.

**Approach:** Découvrir les initiatives du profil G2 et permettre leur sélection locale par projet, dans un contrôle compact intégré à l'atelier. Séparer sélection Madness, active BMad et contexte capturé de chaque échange ; retrouver le choix après réouverture, consulter en conflit et refuser seulement les actions dont les préconditions fraîches ne sont pas satisfaites.

## Boundaries & Constraints

**Always:** Racine projet canonique donnée par le cœur ; config et initiatives issues des mêmes octets bornés et sourcés que le reçu ; découverte immédiate G2 sans récursion libre. Configuration BMad inchangée par navigation. Choix par projet distinct des captures historiques ; anciens null restent inconnus. Persistance locale versionnée, atomicité et panne explicites, données futures/corrompues préservées. Contrôles de possession BUSY/STOP_UNCONFIRMED et arrêt/récupération conservés. Gardes avant ouverture, après attentes et avant effets ; un suivi vérifie son contexte capturé, pas la sélection courante. Outils sans initiative accessibles selon les conditions de leur profil. Interface clavier/zoom/deux thèmes dans la charte0.2.6 adoptée, Oxanium/Barlow et castingv2 conservés.

**Never:** Écrire une configuration d'initiative par simple sélection ; choisir arbitrairement la première ; réattribuer conversation/question/approbation/livrable ou reconstruire une ancienne initiative. Exécuter un script du projet, élargir les outils natifs, changer proxy/authentification/abonnement, relancer un agent à la restauration. Pas de catalogue complet, watcher, Quick Resume, aperçu général ou Graphify dans ce lot.2.2/M14 reste en revue et différée ; aucun GET JWKS/OAuth/modèle nécessaire aux vérifications locales de3.

## I/O & Edge-Case Matrix

| Cas | Entrée/état | Résultat attendu | Refus/limite |
|---|---|---|---|
| M1 | Deux projets avec plusieurs initiatives | Choix indépendants, noms/chemins/sources/révisions ; réouverture passive retrouve les choix | Aucun échange existant ni config modifié |
| M2 | Aucun choix antérieur, active absente, installation absente/incompatible ou identifiant non représentable | État explicitement non choisi/absent/inconnu/incompatible ; aucune initiative inventée ; consultation permise selon preuves disponibles | Pas de sélection de la première ni refus global des outils sans initiative |
| M3 | Sélection alpha, active BMad beta ou sélection disparue | Deux valeurs distinctes, explication et choix local après relecture ; consultation possible | Nouvelle action exigeant une initiative refusée avant ouverture si conflit/invalide |
| M4 | Ajout/suppression/remplacement, config modifiée pendant collecte ou action | Liste, couches résolues et reçu cohérents ; résultat ancien invalidé | Aucune réussite avec deux collectes mélangées ou preuves anciennes |
| M5 | Sauvegarde refusée, annexe corrompue/future ou racine projet remplacée | Choix mémoire et conservation non confirmée distingués, ancienne annexe préservée | Aucun faux choix durable ni réécriture d'historique |
| M6 | Consultation beta pendant échange/question/accord alpha encore actif | Échange et destinataire alpha restent immuables ; réponse alpha soumise à ses propres préconditions fraîches | Beta seule ne retire pas une demande alpha ; historique expiré/restauré reste inactif |
| M7 | Mutation entre garde et ouverture, après ouverture, avant premier tour ou après attente d'accord | Divergence refusée avant envoi/effet ; processus réellement possédés arrêtés, unknown conservé si nécessaire | Refus, annulation, arrêt et récupération restent disponibles sans nouvelle sélection |
| M8 | Choix/lecture asynchrone tardifs après navigation vers autre projet | Chaque résultat rejoint son projet/révision, focus et saisie préservés | Aucun résultat alpha appliqué à beta, ni sauvegarde périmée écrasant un choix récent |
| M9 | Output externe, traversal/ADS, lien/jonction/hardlink, UTF-8 invalide ou volume excessif | Même politique de refus bornée G2 et aucune exécution de donnée analysée | Limites Windows réellement exercées ; variante non exercée signalée honnêtement |
| M10 | Dialogue de choix, noms longs, compact, zoom200, deux thèmes | Choix/active/source lisibles ; focus choix courant sinon titre, Échap/annulation rendent le focus au bouton ; demandes natives prioritaires | Aucune approbation par défaut, perte de brouillon ou nouvelle capacité déduite d'une illustration |

</frozen-after-approval>

## Code Map

- `src/contracts/{index,dialogue,bmad-help}.ts`, `src/core/application.ts` : ContextRef et Snapshotv1 sont les autorités historiques ; dialoguePersist capture déjà le contexte retourné. Ne pas migrer/renseigner les anciens échanges. Nouveau `src/contracts/bmad-context.ts` pour observation/choix/erreurs et commandes métier strictes, sans chemin libre.
- `qualification-profil-g2/profil-g2.md`, `src/adapters/bmad/{help,help-owned-run}.ts`, `resources/bmad-help/{capture,config_utils,worker}.py` : réutiliser les gardes G2 et le runtime/Job maîtrisés. Intégrer collecte/résolution de contexte comme opération fermée propre ; ne pas utiliser prepare() comme inventaire général, ni importer le banc de qualification ou le projet comme code. Pins/manifestes fermés à maintenir si une ressource change.
- Nouveau `src/adapters/bmad/context.ts` et `src/core/bmad-context.ts` : découverte, reçu frais, sélection/révision et admission. Configuration active, sélection locale et captures de conversation séparées. Éviter les doubles collectes non liées ; conserver la liste observée des dossiers parmi les préconditions.
- `src/adapters/persistence/json-store.ts`, `bmad-help-store.ts` : file/CAS, temporaire exclusif/sync/rename et lecture bornée à reprendre pour nouvelle annexe `bmad-context-v1`, liée au projectId/racine. Ne pas changer le Snapshotv1 ni ses annexes historiques.
- `src/core/dialogue.ts`, `src/adapters/codex/dialogue.ts`, `src/adapters/bmad/{profile,forge}.ts` : ouvrir/tour/questions/accords/effets gardent leurs captures. Conserver les gardes propres Mary/config, Forge/contextDigest, BMad/bundle ; vérifier la cohérence avant deps.open, après open/avant premier tour, puis au point d'effet. Ne pas comparer un suivi alpha à la navigation beta ; aucun contournement d'admission par un flag public.
- `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts` : bridge typé métier et racine fournie par le cœur, renderer sans FS/Node. Observation/choix locaux ne demandent ni compte ni abonnement et ne déclenchent aucun réseau.
- `src/renderer/src/App.tsx` : workspace intégré, accept/run/load, select/navigateOverview. Ajouter bouton nom+chevron sous le titre et dialogue unique, puis informations distinctes dans le panneau de contexte. `HelpPanel.tsx` garde anciens reçus inchangés ; `QuestionPanel.tsx`/`ApprovalPanel.tsx` montrent leur initiative capturée.
- `DESIGN.md`, `.impeccable/surfaces/src-renderer-src-app-tsx.md`, styles→atelier-immersion→atelier-controls : monde visuel0.2.6. Impeccable context chargé une fois, mode Operate ; read craft-floor juste avant édition UI. Sidecar signalé stale, aucune migration implicite.
- `tests/connection-ui.test.mjs` : fixture existante bloque HTTP(S), cascade réelle, fermeture vérifiée. Réutiliser ses primitives, sans confondre recréation de fixture et restauration durable. `scripts/qualification/workspace-design.mjs` donne viewport/zoom réels et contrôles de fermeture.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/bmad-context.ts`, cœur et ports — définir les états/commandes stricts et la séparation consultation/capture, avec tests de validation et de races.
- [x] Adapter/ressources BMad maîtrisées et pins — intégrer la découverte G2 sourcée/bornée et fraîcheur des listes/config, sans exécuter le projet ni dépendre des aides natives ; éprouver M2/4/9 sur fixtures Windows possédées.
- [x] Annexe de sélection et cœur — conserver choix par projet/racine et révision, lecture passive et panne explicites ; éprouver M1/5/8 et données historiques identiques.
- [x] `src/core/dialogue.ts` et points d'effet concernés — gardes nouvelles actions/captures existantes, comparaison après open et avant effet, fermeture possédée ; cas M3/6/7 sans fournisseur réel.
- [x] Main/preload/App et composant de choix — commande compacte/dialogue/conflit/contexte, clavier/focus/chargement/erreurs et conservation ; tests M10 et anciennes demandes corrélées.
- [x] Qualification locale et documentation ciblée — vrai helper contrôlé, deux projets synthétiques, vraie fermeture/réouverture et config/historiques exacts, ressources paquet exactes ; deux thèmes/compact/zoom. Nettoyer seuls témoins possédés après preuves. Relecture indépendante des rattachements historiques et des fichiers de configuration.

**Acceptance Criteria:**
- Given deux projets G2, when je choisis une initiative dans chacun puis ferme/rouvre le profil témoin, then les choix reviennent séparément, les preuves sont relues et les anciennes conversations/configurations restent identiques sans moteur ni réseau.
- Given une sélection différente de l'active ou un contexte devenu invalide, when une nouvelle action exige ce contexte, then aucun premier tour/effet n'est envoyé avant résolution des préconditions et la consultation garde sa destination propre.
- Given une demande active alpha et une consultation beta, when je réponds à la demande alpha, then son destinataire/capture reste alpha et seules ses préconditions fraîches décident de l'envoi ; changer la sélection n'est ni un rejeu ni une réattribution.
- Given conservation refusée ou lecture tardive, when je continue ma navigation/saisie, then l'état explique la limite, aucun choix durable n'est inventé et aucun résultat ancien ne remplace celui d'un autre projet/révision.

## Implementation Notes

Implémentation déléguée dans la racine prescrite, sources produit/tests/bancs possédés par un seul implémenteur. Contrats `bmad-context`, annexe atomique/CAS `bmad-context-v1`, observation G2 fermée et sourcée, sélection par projet/racine, générations et files de lecture ; Snapshot v1 et captures historiques conservés. Gardes avant/après ouverture, tours, questions, autorisations et effets Forge ; les suivis gardent leur capture, indépendamment de la consultation. UI atelier0.2.6 conservée, sélecteur local et dialogue unique ajoutés ; logiciel0.2.7 sans nouvelle dépendance.

Types/build et150tests cœur/protocole passent. Sources finales :21contrôles Windows sous runtime fermé/Job, dont remplacement aux mêmes octets, mutations, trois couches et bornes ;11cas UI ciblés (6+5) avec fermeture attestée, puis1cas noms non représentables/deux thèmes/zoom200 sur fixture validée par le contrat. Garde Forge réelle après attente du reçu pending éprouvée avant tout effet. Les premiers rouges et leurs limites sont conservés, sans relaxation des gardes de possession.

Banc Main/preload réel compilé : deux projets/choix, fermeture puis réouverture passive, configurations et Snapshot/historiques exacts ;001/002 historiques par rapport aux dernières files,003 passe8contrôles du candidat stable avec observations concurrentes, deux fermetures Main/helper prouvées et nettoyage. Reçus et limites dans [qualification-initiatives/implementation.md](../qualification-initiatives/implementation.md). Fondation/livraison14/14, garde Forge réelle1/1 et non-régression des aides25contrôles passent. Le banc conserve désormais ses témoins sans reçu terminal ; délais180/120/240 inchangés, rouge EBUSY et essai300 historique conservés. Le parent intègre003 et possède captures/détecteur/finish/revues/statuts/clôture. Aucun tour visuel consommé par l’implémenteur ; ni fournisseur, profil personnel, OAuth/JWKS,2.2/M14 built ou acceptation humaine déduit.

Review loop1 — corrections ciblées Q1–Q4/B1 : opération interne fermée `context-config` limitée aux trois couches/modules/racines/identités, capture portant explicitement configuration ou découverte complète et fraîcheur de même portée. Mary garde l’active configurée représentable sans document ; les créations possédées Forge sans initiative ne périment plus cette capture. L’observation UI complète et ses refus restent distincts. Abonnement de conflit lié au projet courant et filtré par séquence ; choix tardif sans clôture ni focus d’une autre ouverture. Structure/CSS F1–F4 préservés, aucun reset ou suppression de sources.

Confirmation courante : types/build,153tests cœur/protocoles (dont17de contexte/portée),14fondation/livraison et25contrôles réels de sources Windows passent. Q3/Q4 UI2/2 avec fermeture prouvée ; confirmation élargie/recapture et revues au parent. Forge réel indépendant init/append/write/finish CLARIFIED passe, neuf Jobs0 et refus de configuration modifiée/remplacée aux mêmes octets ; premier essai de fixture HTML refusée conservé. Nouveau Main compilé004 passe8contrôles et deux fermetures prouvées, configurations/Snapshot/historiques exacts, profil nettoyé et16inputs actuels identiques ; Main003 reste historique après changement backend. Reçus et limites actualisés dans `qualification-initiatives/implementation.md`. Aucun fournisseur, profil personnel,2.2/M14 built ou validation humaine ajouté.


## Plan Change Log

## Review Triage Log

## Design Notes

Choix techniques sous mandat autonome : annexe de sélection plutôt que migration Snapshotv1 ; pas de choix initial implicite, sélection null/unset distincte d'un choix perdu et de l'active attestée. Les identifiants non représentables dans ContextRef restent diagnostiqués, jamais transformés en slug risquant une collision. Les contraintes du profil de chaque outil décident si une initiative est nécessaire. Le dialogue alpha peut coexister avec la consultation beta ; une mutation de ses sources/préconditions alpha doit toujours être contrôlée.

La collecte peut être asynchrone et bornée : afficher son état sans bloquer brouillon/navigation ; pas de polling natif ou de scan profond à chaque rendu. Réutiliser un reçu local sous sa révision connue et recontrôler avant action ; les watchers arrivent en2.5. Les sauvegardes concurrentes sont ordonnées/CAS et l'annexe future/corrompue n'est pas effacée comme un état vide.


Exécution déléguée : une seule implémentation possède les fichiers source, tests et bancs nécessaires à2.3 et ses notes Implementation Notes ; pas de modifications produit concurrentes ni de sous-implémenteur. Elle n'est pas seule dans le dépôt : préserver et accommoder les changements des autres, sans les annuler. Le parent gère statuts, revue et clôture. Racine de travail explicite : `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness` ; résoudre les contextes depuis cette racine et passer ce workdir aux commandes. Utiliser l'élévation de commande autorisée si les écritures dans ce worktree sont refusées ; ne pas basculer vers un autre checkout. Dépendances nouvelles évitées ; bump logiciel0.2.7 si nécessaire pour un candidat distinct de0.2.6, sans assimiler version logicielle et story2.7. Lire les règles Impeccable craft-floor avant édition UI ; context déjà chargé par le parent, ne pas le relancer. Les captures/détecteur/finish sont coordonnés par le parent pour respecter le plafond global de deux tours ; l'implémenteur se concentre sur code et tests significatifs, sans profil personnel ni fournisseur réel.

## Verification

- `npm run typecheck`, compilation et tests ciblés des contrats/contexte/persistance/dialogue/approbations/Forge/aide touchés ; conserver les premiers échecs et repasser seulement après changement pertinent.
- Tests UI ciblés initiatives/focus/possession/races et anciennes demandes ; HTTP(S) bloqué dans les fixtures, aucune connexion réelle. Réutiliser viewport/zoom et fermeture existants ; ne pas répéter tout le fichier UI inchangé sans raison concrète.
- Banc local réel de collecte/Job et qualification sur deux projets synthétiques d'un candidat compilé ou paquet exact : sélection, refus/unknown, fermeture/réouverture passive, restauration et octets des configurations/historiques. Sans profil personnel, OAuth, JWKS ou modèle. Prouver fermeture avant suppression ; limite symlink fichier sans privilège conservée si non exercée.
- Impeccable : au plus deux tours visuels groupés bureau/compact/deux thèmes/zoom pertinents, une seule détection mécanique après stabilité ; corrections en un lot et handoffs finish bornés applicables. Aucun nouveau style global, accord humain ou audit WCAG fabriqué.
- Revue Quick du diff depuis la baseline canonique et contrôle indépendant high des rattachements historiques/configurations/points d'effet.2.2 reste in-review ; la qualification native7/16 n'est pas remplacée par ces tests locaux. Aucun correctif différé absorbé sans traçabilité.


## Review Triage Log

| ID | Verdict | Route | Preuve vérifiée |
|---|---|---|---|
| Q1 | high | bad_plan | Forge sans initiative ajoute un dossier puis un document à inventory(output), et assertFresh compare cette révision globale : sa propre création bloque append/write/finish. Code Map omettait la séparation découverte/capture selon profil. |
| Q2 | medium | patch (repris dans dérivation ciblée) | Mary configurée alpha sans alpha.md : capture(false)=null, resolver natif=alpha, comparaison après open refuse un outil indépendant. |
| Q3 | medium | patch (repris dans dérivation ciblée) | Effet onChanged[] conserve project undefined ; erreur CONTEXT_MISMATCH asynchrone ne peut ouvrir le dialogue prévu. |
| Q4 | medium | patch (repris dans dérivation ciblée) | choose résolu après Annuler appelle close() puis focus déclencheur sans vérifier même ouverture active ; focus utilisateur repris. |
| B1 | medium | patch, groupé Q2 après vérification | Contrôle indépendant confirme exactement le chemin Mary de Q2 ; conservé séparément avant regroupement. |

## Plan Change Log

### Review loop1 — garde par portée du profil

Q1 exige une re-dérivation du Code Map hors du bloc gelé ; intention/M1–M10 inchangés. Q2/B1 doublon après triage séparé. Q3/Q4 corrections de callbacks/focus. Aucun défaut reporté. La remise à plat globale du code demandée par la branche bad_plan du skill a été REFUSÉE par le contrôle automatique : restauration/suppression de nombreux fichiers, risque de perte concurrente, mandat autonome général insuffisant pour cette opération destructive. Aucune restauration ni suppression exécutée. Alternative sûre : conserver tous les fichiers et re-dériver sur place les seuls chemins défectueux, avec tests ciblés et nouveau contrôle indépendant. Pas de contournement du refus par un autre mécanisme de reset.

KEEP : contrats stricts, annexe CAS, historique immuable, ownership/stop, rendu/CSS F1–F4 et tokens, pins fermés, toutes preuves précédentes avec leur portée et rouges conservés. Ne pas modifier le bloc gelé ou les éditions du parent. Main003 reste historique après modification backend.

### Code Map amendé — dérivation ciblée

- Séparer la découverte complète UI (listes/initiatives/révision globale) de la capture nécessaire à un profil indépendant. Réutiliser le helper possédé avec une opération INTERNE fermée de configuration seule : trois couches, sources/modules/identités/racine, sans lecture ni inventaire des sorties/initiatives. Aucun flag renderer ni chemin libre. Une active configurée représentable demeure la capture native même si son document est absent ; aucune ancienne valeur reconstruite.
- CapturedBmadContext conserve sa portée interne : requiresInitiative=true utilise la collecte complète et le conflit frais ; outil indépendant utilise configuration sourcée et gardes propres, sans dépendre de documents ou de créations de sortie sans rapport. assertFresh relit exactement la même portée. Ne pas remplacer l’observation UI par une collecte configuration vide. Config/racine/ressources modifiées restent refusées, y compris remplacement aux mêmes octets ; les effets possédés Forge sans initiative ne changent pas le reçu de configuration. Les refus/bornes de la découverte complète restent intacts.
- App : abonnement stable observe le vrai projet courant (ref ou callback frais) et ignore événements périmés AVANT ouverture de conflit. InitiativeSelector : clôture/focus uniquement pour la même ouverture active ; choix tardif après Annuler/navigation ne vole ni focus ni dialogue. Conserver structure/CSS F1–F4.
- Régressions : Mary alpha sans document et document sans rapport refusé n’est pas bloquée ; configuration modifiée pendant question/attente refuse sans envoi. Forge sans initiative init puis append/write/finish réels avec garde de configuration réelle ; changement config/scoped toujours refusé. Conflit reçu seulement via onChanged ; choix différé après fermeture sans focus repris. Ne pas ajuster M1–M10 pour accommoder le code.
- Repasser types/build/tests concernés et nouveau banc Main compilé courant après backend modifié ; ressources/pins exacts. Aucun fournisseur/OAuth/JWKS/profil personnel/2.2M14. Rendu inchangé à recontrôler au finish ; recapture requise du seul zoom-light-long, défilé jusqu’à l’entrée longue avec titre/Fermer visibles, sans nouveau détecteur.

### Triage du second passage Quick et contrôle indépendant

Contrôle indépendant high : liste vide. Quick : deux constats, tous deux vérifiés avant regroupement.

| ID | Verdict | Route | Preuve vérifiée |
|---|---|---|---|
| L1Q1 | high | patch | ForgeHost garde avant runForgeScript, mais celui-ci attend bmadRuntime avant spawn ; une config peut changer dans cet intervalle. write attend temporaire/sync avant link. Replacer la garde existante au dernier point avant effet, garder la vérité pre-spawn versus effet commencé. |
| L1Q2 | medium | patch | Aucun rendu de observation.status dans InitiativeSelector/InitiativeContext ; version inconnue peut avoir problems=[] et ressemble à une collecte candidate. Afficher les diagnostics déjà fournis, sans inventer une compatibilité globale. |
| P1 | high | patch, même racine L1Q1 | Adapter Codex : accept exécute assertContext avant await proposal.assertUnchanged, puis choisit/transmet sans nouveau contrôle de configuration. Le même ordre laisse une mutation de configuration pendant la préparation précéder une autorisation ; garde existante à placer après préparation et avant choix. |

Racines : G1=L1Q1/P1, placement de la garde existante avant préparation asynchrone ; G2=L1Q2, projection de diagnostic existant absente. Corrections directes, aucun nouveau flag/capacité renderer ni nouvelle intention. Ne pas remettre à plat les fichiers ou toucher au bloc gelé. Main004 valide le lot précédent ; il devient historique pour le nouveau Main modifié. Paquet001 construit pendant la revue devient candidat historique, jamais annoncé final. Repasser les tests affectés et vérifications finales ; pas de nouveau détecteur. Finition à recontrôler après la ligne de diagnostic nouvelle, ancien ship conservé à sa portée précédente.

### Complément P2 — priorité des incertitudes

| ID | Verdict | Route | Preuve vérifiée |
|---|---|---|---|
| P2 | high | patch | contextRefusal masquait EFFECT_UNKNOWN après préparation/effet commencé, puis STOP_UNCONFIRMED si open échouait au nettoyage avant retour de session. Dans ce second chemin stopSession ne possède pas encore de session ; code doit conserver STOP_UNCONFIRMED pour marquer recovery.stop/unconfirmed et bloquer le nouveau lancement. Deux régressions vérifient les deux incertitudes ; aucun état nouveau introduit. |

G3=P2, priorité erronée des erreurs capturées, correction ciblée distincte du placement de la garde. Tous les constats L1Q1/L1Q2/P1/P2 sont corrigés dans les sources ; vérification parent finale et recheck ciblé en cours, pas encore built.

### Recheck ciblé — garde de contexte et préconditions locales

Quick : L1Q1/L1Q2/P1/P2 résolus au scope de ses contrôles. Le contrôle indépendant trouve deux régressions directes, vérifiées avant regroupement.

| ID | Verdict | Route | Preuve vérifiée |
|---|---|---|---|
| R2B1 | high | patch | write attend assertContext après le dernier forgePath/lstat. Remplacer pendant cette attente le workspace par une jonction vers un déplacement hors projet laisse la portée configuration réussir ; link publie avant le refus de bytes/forgePath. Recontrôler confinement et préconditions locales après cette attente. |
| R2B2 | high | patch | Après la première proposal.assertUnchanged, assertContext attend et ignore les fichiers de Mary. Un fichier modifié pendant ce contrôle peut recevoir accept sans relecture. Conserver le premier contrôle et revalider après la garde, sans simplement inverser à nouveau. |
| P3 | high | patch, racine R2B1 | Le finally unlink(temporary) suit aussi le chemin devenu jonction, sans confirmer confinement ni identité du temporaire. Une cible externe de même nom peut être supprimée même si la publication est désormais refusée. Nettoyage uniquement si préconditions de propriété/confinement encore prouvées ; sinon conserver unknown et le témoin externe. |

Racine G4 : préconditions locales périmées pendant une nouvelle attente de garde. Corriger ces points ciblés, aucun reset, drapeau renderer, nouvelle intention ni découpage. Tests des deux sens de mutation et témoin externe inchangé. Main005/paquet002 restent preuves historiques du lot avant cette correction ; final courant à reconstituer après patch. UI/diagnostic/CSS inchangés par ces points, aucun nouveau tour visuel ou détecteur requis.

## Parent final verification

Le reçu courant est Main006, lié au paquet003 logiciel0.2.7.171tests cœur/protocole/fondation,15UI,10Forge Windows et29approbations (incluses dans171) passent sans saut. Les25contrôles source Windows restent liés au helper6dd088… inchangé ;10Forge actuels incluent vrai HARDENED, jonctions/identités et témoins externes intacts. Main0068contrôles, deux fermetures et nettoyage réels ;16inputs natifs et19sorties compilées identiques au paquet,13ressources exactes. ASAR fa8feb16b2cef5de623047dca390c595447530688c48d05d29d40977f89bfd19. Les anciensMain/paquets sont historiques.

Tous les constats Q1–Q4/B1,L1Q1/L1Q2,P1/P2,R2B1/R2B2/P3 sont corrigés, vérifiés et recontrôlés au scope indiqué. Aucun correctif de2.3différé. Finition Impeccable : ship complet au rendu avant diagnostic puis verdict ciblé diagnostic/géométrie resolved/clear ; documenter a conservé DESIGN/sidecar/provenance/CSS. Relecteurs techniques frais ont chargé les définitions officielles, rôles natifs indisponibles. Détecteur unique initial[] ; aucun nouveau scan ou accord humain/WCAG déduit.

Voir [vérification parent](../qualification-initiatives/parent-verification.md), [audit paquet](../qualification-initiatives/package-audit.json), [matrice](../qualification-initiatives/matrix-audit.json) et [finitions](../qualification-initiatives/finish-review.md).2.2/M14 reste in-review/reportée, pas de nouveau réseau/OAuth/modèle personnel demandé. Limite symlink fichier non exercé conservée. Aucun profil personnel ni installation remplacé, aucun push. Le reset global refusé automatiquement n’a jamais été exécuté ; corrections ciblées en place.
