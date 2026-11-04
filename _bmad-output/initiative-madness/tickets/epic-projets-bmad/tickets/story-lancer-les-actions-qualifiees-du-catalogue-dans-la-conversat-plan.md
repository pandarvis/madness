---
title: 'Lancer les actions qualifiées du catalogue dans la conversation'
type: 'feature'
ticket: '7'
created: '2026-11-04'
status: 'built'
baseline_revision: 'c81a4c887f915a8da97ef5d4e6767da26111c89f'
route: 'full'
route_source: 'auto'
risk: 'high'
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

**Problem:** Le catalogue installé permet de comprendre et copier une compétence, mais aucune fiche ne rejoint encore la préparation et le lancement réels. Le porteur doit connaître lui-même les voies Mary, Forge et aide déjà disponibles.

**Approach:** Depuis une fiche admissible, préparer une action native qualifiée avec son descripteur, contexte, entrées et effets capturés ; rejoindre la préparation secondaire de Conversation puis envoyer explicitement dans la boucle existante. Expliquer précisément les profils non qualifiés, sans transformer leur présence dans le catalogue en permission d’exécution.

## Boundaries & Constraints

**Always:** Une seule autorité de dialogue et de cycle de vie, mêmes connexion SIWC personnelle/abonnement, processus possédés, outils fermés, questions/approbations/interruption et STOP global. Lier descripteur gagnant, projet/racine physique, révision/génération du catalogue, profil natif, initiative selon ses conditions et contexte capturé ; recontrôler aux points de préparation et d’effet après les awaits. Conserver l’invocation exacte et les entrées/effets réellement connus, leurs sources, limites, corrélation et reçu natif ; proposition, préparation, transmission, effet, conservation et acceptation humaine distincts. Trois familles existantes seulement si leur qualification réelle et leurs octets/source gagnante concordent : Mary, Forge et aide ; les autres restent non qualifiées. Copier ne prépare ni ne lance. Préparer n’envoie rien ; Lancer une nouvelle conversation est l’envoi explicite, avec lecture seule par défaut et permissions ponctuelles existantes. Historique/brouillons/retours QuickResume/Graphe/fichiers conservés. Données anciennes/inconnues explicites ; restauration passive.

**Never:** Moteur BMad parallèle, interpréteur générique d’invocation/shell/chemin fourni par renderer, promotion de copyable ou de la version7 seule en capacité native, réactivation d’une copie masquée, nouvelle famille native sur simple métadonnée. Ne pas fabriquer un schéma d’entrées/conditions depuis les colonnes nulles, envoyer le brouillon libre comme premier input, approuver des effets globalement ou assouplir les outils/terminaux natifs. Aucun nouveau fournisseur, migration Snapshotv1, réouvertureepic1, refonte/palette/fontes/raster ou installation personnelle implicite. Un essai externe bloqué est consigné avec artefact/condition de reprise et travaux indépendants poursuivis ; pas de question Zscaler/JSON/token/IT routinière, pas de G2/G3/WCAG/humain/V1 complète inventé.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| K1 Fiche qualifiée | Plusieurs fiches parmi les trois familles réellement admises, sources gagnantes exactes | Préparer capture contexte/descripteur/invocation/entrées/effets puis rejoint Conversation ; seul Lancer crée l’échange ; reçu rattaché au lancement exact | Échec de qualification nommé, aucune autre famille substituée, aucun envoi par simple lecture/préparation |
| K2 Descriptif sans pouvoir | Métadonnée, nom seul, version inconnue, copie masquée/refusée, homonyme d’une autre racine, runtime non qualifié | Catalogue toujours dynamique et consultable/copieuse selon ses propres règles ; lancement indisponible avec raison précise | Ni copyable ni invocation copiable n’autorisent le profil ; aucun fallback vers une copie perdante |
| K3 Précondition modifiée | Descripteur/configuration/racine/initiative/choix local/révision/génération/connexion changent pendant préparation, ouverture ou enregistrement | Refus avant le prochain effet ou reçu d’issue inconnue si déjà commencé ; contexte historique exact conservé | Repréparer explicitement ; aucun ancien Lancer actif, aucun résultat tardif sur un autre projet |
| K4 Entrées et permissions | Brouillon libre existant, entrées/conditions documentaires inconnues, mode fichiers éventuellement Mary | Entrées du profil réellement admises affichées/capturées séparément ; première commande native établie inchangée ; questions et accords ponctuels au contexte exact | Pas d’invention de champs/conditions ni d’envoi du brouillon ; paramètres non supportés refusés avant moteur |
| K5 Reçu et effets | ACK, texte partiel, fin native, questions/accords/fichiers, outil inattendu | Invocation envoyée et contexte corrélés au reçu natif ; effets connus/inconnus gardent leurs preuves ; activité/récapitulatif communs | Pas d’acceptation par fin/texte/fichier ; protocole inconnu refusé, pas second moteur ni succès de phrase modèle |
| K6 Concurrence et conservation | Double clic, activité/helper/Graphe concurrent, STOP_UNKNOWN, fermeture ou disque refusé | Admission unique, gardes/arrêt possédés et séquences conservés ; un seul lancement possible ; conservation non confirmée nommée | Aucun rejeu automatique ni libération d’une autre inconnue ; pas d’effet après refus précoce |
| K7 Retour et restauration | Annuler, changer de projet, rouvrir profil avec anciennes Mary/Forge/aide et nouvelle origine catalogue | Retour fiche/résultat/filtres/focus exacts ou repli annoncé, saisies séparées ; conversations/annexes conservées et historiques inactifs | Cible disparue sans substitut ; restauration ne qualifie/ne lance/ne lit de nouveau fichier ni Graphe |
| K8 Lecture et contrôles | Historique en premier, préparation secondaire, longs noms/raisons, clavier, clair/sombre, compact/repli et zoom200 | Commandes compactes nommées, contexte et effets avant décision, ordre/focus lisibles sans déplacement tardif | Révision ancienne et capacité manquante textuelles ; pas de conformité globale déduite |

</frozen-after-approval>

## Code Map

- `src/contracts/bmad-catalog.ts:7/12/22/30` : CatalogItem est une observation avec launchable:false, source gagnante et invocation exacte. Conserver cette nature documentaire et ses anciens validateurs ; introduire un contrat métier versionné distinct de préparation/origine/reçu catalogue, sous autorité du cœur, avec validateurs stricts et absence compatible pour les historiques. Pas de chaîne d’invocation/chemin libre dans une commande renderer.
- `resources/bmad-help/catalog.py:119/165–228` : ordre des racines, masque du premier nom même refusé, membership réciproque/SKILL/frontmatter et capture immuable bornée. fields.inputs/conditions sont null ; effets viennent de Writes, but de description/For. Réutiliser leurs octets/provenance, ne pas transformer le parseur en runtime ni changer ces pins sans besoin démontré.
- `src/core/bmad-catalog.ts:18/40–54` : génération, révision, lease d’observation et destination avant/après await ; copier résout l’invocation dans le cœur. Ajouter la préparation/révalidation en composition minimale, sans appel à copy comme substitut de qualification ni perte des vérifications au lancement.
- `src/core/dialogue.ts:20/55–83/233/360` : une seule session, gardes busy/closing/stop, Forge qualify→requalify(compare root/fingerprint/skill/output/initiative/context)→capture→assertFresh→open→assertFresh→conversation persistée→tour. Mary et aide restent leurs voies propres. Le lancement catalogue doit réemployer ces chemins, avec origine/corrélation immuable et vérifications du descripteur au point d’effet ; pas de nouvelle session propriétaire dans le service catalogue. Le premier input n’est jamais le brouillon.
- `src/core/ports.ts:14`, `src/contracts/dialogue.ts:22–23`, `src/adapters/codex/dialogue.ts:154/159/239–287/305/335/415` : trois familles natives seulement, skill envoyé comme item natif puis invocation littérale, readOnly et outils fermés. Préserver ces unions/dispatch et leurs commandes contrôlées ; une association catalogue ne donne pas de nouvel outil. ACK actuel persisté sous l’invocation native ; réemployer sa corrélation au lieu d’inventer une réception par le texte.
- `src/adapters/bmad/profile.ts:36/57`, `forge.ts:128/188`, `help.ts:114/127/151`, `src/core/bmad-help.ts:33` : qualifications et outils concrets. Mary refuse personnalisations/hooks/persistent facts ; Forge possède ses seules opérations/session/fichiers imposés ; aide possède un bundle fermé et ses lectures par IDs, nativeReady requis. Vérifier que la source qualifiée correspond à la copie gagnante du catalogue, pas seulement au même nom. Les trois capacités préexistantes ne qualifient aucun workflow documentaire général ; 2.1 M14 général reste non acquis. Les observations de 1.11 Mary/Forge et2.2native010 aide sont de leurs ASAR/profils respectifs, pas preuves du nouveau chemin catalogue.
- `src/core/bmad-context.ts:25–41` : capture configuration-only ou initiative-required, accord sélection/active et révision de sélection après await ; structural selectionValidity seul insuffisant. `assertFresh` recompare identité physique et révision. Réutiliser les refus/conflit existants, sans écrire la configuration BMad.
- `src/core/lifecycle.ts:29`, `src/main/index.ts:145/149`, `src/adapters/codex/connection.ts:124`, `owned-run/help-owned-run` : admission et inconnues agrégées, helper imbriqué uniquement sous lease dialogue saine. Main compose les ports et valide appelant ; aucun PID/outil renderer libre ni acquittement réseau implicite.
- `src/adapters/persistence/*-store.ts`, `src/core/application.ts` : annexe versionnée d’origine catalogue si nécessaire, même authority/queue atomicité que les annexes existantes, liée au ContextRef complet et opération exacte. Métadonnées de préparation ne prouvent pas transmission native ; résultat/transmission/dialogue restent aux propriétaires actuels. Sauvegarde échouée garde sa limite ; pas migration Snapshotv1 ni doublon d’historique autoritaire.
- `src/renderer/src/CatalogPanel.tsx:12` : query/module/presented snapshot/item/scroll par projet, bascule volontaire et fiche historique/copie bloquée stale, focus rendu au déclencheur ou fallback. Ajouter Préparer le lancement et raison d’indisponibilité dans cette fiche, sans nouvelle collecte au survol ni faux launchable sur la donnée documentaire.
- `src/renderer/src/App.tsx:250–259/348/400–451`, `env.d.ts`, `preload/index.ts` : bridge métier strict et route pendingLaunch attendent déjà un dialogue postérieur et conversation durable corrélée. Lier explicitement à la préparation/opération attendue, pas à n’importe quelle nouvelle conversation du projet. Rejoindre préparation secondaire de Conversation, préserver historique/draft/texts et retours2.9. Si besoin, `rootIdentity` peut prendre le snapshot catalogue de même projet/racine comme dernier fait observé, sans grant ni nouvelle lecture. Réponses tardives ne déplacent pas vue/focus. Annulation retrouve fiche/résultat/filter sans envoi.
- `EXPERIENCE.md:335–345`, AD-1 à AD-7 et2.17 : profil qualifié ≠ catalogue connu, Préparer ferme la fiche et rejoint Conversation, Lancer seul envoie. Fichiers/acceptation/QResume/rafraîchissement restent leurs contrats établis. DESIGN.md/contrat de surface gardent atelier, seed09fa5971, commandes compactes, zones calmes et provenance. Pas de nouvelle activation Sally inventée.
- Tests réutilisables : `bmad-catalog.test.mjs:13/26`, `bmad-catalog-protocol.test.mjs:74`, `dialogue.test.mjs:7/150/165/194`, `dialogue-protocol.test.mjs:10/159/175`, `forge-protocol.test.mjs:41`, `bmad-help-protocol.test.mjs:18`, `bmad-context-dialogue.test.mjs:8/48`, `approvals-protocol.test.mjs:23`, UI `connection-ui.test.mjs:1195/1227–1268`. Utiliser les injections/appels réels de ces seams ; mock RPC toujours identifié, aucune réponse modèle fixe comme succès natif.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/bmad-catalog-launch.ts` (ou extension versionnée équivalente), `core/ports.ts` — identité, préparation/origine/reçu et commandes de références exactes, validateurs au cœur avant consommateurs ; garder observation catalogue distincte et historiques compatibles.
- [x] `src/core/bmad-catalog.ts`, `core/dialogue.ts`, composition Main/ports et adaptateurs BMad existants aux seules jointures nécessaires — qualifier uniquement les trois familles existantes, correspondance de source gagnante, capture/revalidation et admission unique ; aucun runtime général nouveau.
- [x] `src/adapters/persistence/bmad-catalog-launch-store.ts` si requis, `core/application.ts` et jointure ACK/conversation — conservation cohérente de l’origine et corrélation, métadonnées/effets/acceptation distincts, erreur disque honnête, restauration passive sans changement Snapshotv1.
- [x] `preload/index.ts`, `renderer/env.d.ts`, `CatalogPanel.tsx`, éventuel `CatalogLaunchPanel.tsx`, `App.tsx`, CSS/libellés locaux — fiche→préparation secondaire→envoi explicite→conversation exacte, annulation/retour/brouillons et gardes de navigation. Commandes existantes réutilisées, pas de préparation par défaut ou surcharge de l’historique.
- [x] Tests core/contrats/protocole/persistance et UI touchés — K1–K8 dont copie masquée/version inconnue, mutations entre awaits, mauvais reçu, envoi double/STOP, annexe historique et routes tardives ; seules dépendances réellement touchées.
- [x] `scripts/qualification/catalog-launch.mjs` — banc réutilisable compilé/paquet, fixtures locales explicitement synthétiques, profils/questions/accords/effets/corrélations, réouverture et fermeture possédée. Captures optionnelles --screenshots, natives capturePage sans rectangle/resize ; pas de campagne à chaque modification.
- [x] `package.json`/lock — version logicielle0.2.14, dépendances/runtime/pins inchangés sauf nécessité démontrée ; ce numéro n’est pas la story2.14. Worker vérifie compilation et scénario compilé seulement, aucun NSIS/installation/modèle/personnel.
- [x] Parent — audit matrice/diff et Quick ; audit indépendant high capacités/permissions/reçus exigé par l’epic7, mêmes acteurs sur corrections ciblées. Puis UN candidat final Windows et contrôles paquet/native disponibles, Impeccable finish/documenter, rapport/commit local ; travaux suivants autonomes sans attendre un test externe manquant.

**Acceptance Criteria:**
- Given plusieurs fiches correspondant à des profils réellement admis, when Préparer puis Lancer sont choisis explicitement, then le bon échange reçoit exactement l’invocation/entrées du profil capturé et son origine documentaire reste retrouvable avec les reçus connus.
- Given une fiche non qualifiée ou une précondition changée, when le porteur consulte ou tente le lancement, then il comprend l’indisponibilité et aucun pouvoir nouveau ni ancien contexte n’est substitué.
- Given une conversation native/questions/accords ou une réouverture/annulation/navigation tardive, when le porteur poursuit/reprend, then le dialogue et ses effets conservent leurs autorités existantes, avec brouillons/retours et conservation honnête.

## Implementation Notes

Implémentation et preuves : [rapport parent](../qualification-lancement-catalogue/parent-verification.md). Trois profils existants seulement, origine annexe versionnée, garde de source/contexte/connexion avant effets, qualification durable agrégée à la récupération, brouillon séparé. Aucun défaut de code différé ; parcours fournisseur intégré final reporté explicitement en2.16, pas de gate acquis par les ports synthétiques.

## Plan Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| Q1 CatalogPanel.tsx:30-36 | medium | patch | Copier et Préparer incrémentent copyToken sans exclusion mutuelle ; leurs finally conditionnels laissent le drapeau de l’autre opération vrai. Close/reopen peut le réinitialiser mais la fiche reste sinon bloquée. Correction directe des deux commandes/contrôles existants. |
| Q2 main/index.ts:246; withCatalogQualification | high | patch | resolveBmad/runForgeScript lèvent réellement STOP_UNCONFIRMED si stopNative ne confirme pas. Le helper lease est pourtant libéré ; seule une erreur locale est stockée. recovery.status/observeStop ne consultent que trois autres propriétaires et peuvent donc admettre ou réadmettre un travail. Réutiliser la propriété/récupération privées existantes pour cette qualification et conserver son inconnue, y compris après restauration et observation des autres propriétaires ; aucune nouvelle capacité publique. |
| Q3 App.tsx:626 | medium | patch | La sélection locale peut changer sa revision sans toucher le catalogue. La préparation garde selectionRevision mais stale ne la compare pas : ancienne initiative et Lancer restent actifs jusqu’au refus backend. Comparaison UI directe au fait déjà capturé. |
| H1 core/dialogue.ts:227; catalog-launch.failed | high | patch | Le catch attend failed() et sa sauvegarde unknown avant stopSession. Une session déjà ouverte, un échec avant ACK puis une écriture secondaire suspendue retardent sa fermeture ; stop/shutdown attendent active. Fermer le natif possédé avant cette écriture secondaire, sans transformer un échec de conservation en succès. |

Recontrôle des quatre corrections par les mêmes acteurs : Q1/Q2/Q3 résolus par catalog27_quick ; H1 et frontière Q2 résolus par catalog27_protocol_map, diff bf239602…f58f6a6. Voir les deux reçus recheck dans qualification-lancement-catalogue ; aucun correctif de code différé.

## Design Notes

But unique et routefull : raccorder un choix du catalogue aux voies natives qualifiées, plusieurs couches et plus100lignes attendues. Risque high conservé car une confusion d’invocation/portée peut produire un effet sur le mauvais projet. Pas de seuil en tokens. Les quatre choix techniques soulevés par l’investigation se résolvent dans les contraintes existantes : pas de quatrième famille, préparation/reçu versionnés sous autorité du cœur, entrées uniquement du profil réellement qualifié avec inconnus documentaires conservés, identité catalogue utilisable comme observation sans grant. Aucun intent gap humain ni nouveau consentement implicite.

Workspace réel C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness, branchecodex/bmad-initiatives-2-3. Hostcwdatelier-ui obsolète ; toutes commandes/écritures ici via pwsh/login:false/workdirabsolu/require_escalated. Tu n’es pas seul ; un seul worker produit, préserver les éditions d’autrui, aucun reset/stash/stage/commit/Buildimbriqué/nestedproduction. Parent seul plan/frozen/revues/statuts/commit. Préserver managed/untracked, statEOL-only boundaries, sources/ressources natives épinglées et historiques, compte/profil/install personnels et préversioninteractive dist/graph-preview-0cf3cc35 avec possibles saisies. Nettoyer seulement ses propres témoins après fermeture possédée prouvée.

Impeccable Operate code-led : lire skill/contexteApp UNE fois dans ta session fraîche et craft-floor avant UI. Root a déjà chargé contexteApp dans cette même session, pas rerun root. Monde/seed09fa5971/tokens/fonts/rasters hérités. Worker n’exécute aucun paquet/NSIS/capture/détecteur ni modèle/réseau externe/personnel ; il écrit les bancs et exécute les contrôles compilés ciblés. Parent fera les revues de code AVANT le premier candidat/captures, puis un lot groupé des seules vues touchées ; second lot seulement pour une correction matérielle concrète, un détecteur unique, finish/documenter officiels frais via substituts techniques si rôles indisponibles. Aucun audit UI global, neuf divergences historiques non attribuées2.15 et clipboardexterne2.16 restent leurs réserves.

## Verification

**Commands:**
- Tests Node ciblés des contrats/core/persistance/protocole modifiés, profils natifs conservés, et leurs dépendances réellement touchées ; un cas exécuté réussi par K1–K8, sans skip ni tests qui ne reflètent que des champs.
- UI ciblée avec vrai CSS et Electron : préparation sans open/send, lancement exact après reçu corrélé, fiche/ancienne version/retour/cancel/late, drafts/QResume/Graphe, clavier/compact/thèmes/zoom200 ; assertions d’effets, pas captures obligatoires avant Quick.
- `npm run build` puis banc compilé par défaut sans --screenshots. Worker retourne code/tests/logs et surprises ; pas candidat/NSIS ni opération personnelle.
- Après revue/corrections seulement : parent build et `npx --no-install electron-builder --win nsis --x64 --config.directories.output=dist/catalog-launch-reviewed` une fois ; relier sorties19 et ressources/pins réellement présents au nouvelASAR. Banc paquet local `node --experimental-strip-types scripts/qualification/catalog-launch.mjs --executable=dist/catalog-launch-reviewed/win-unpacked/Madness.exe --output=<nouveau témoin possédé>` ; fermeture/réouverture/cleanup vérifiés. Un lot visuel final pour les seules surfaces modifiées, natif complet au zoom demandé, puis finish/documenter.
- Audit high indépendant des capacités/permissions et reçus/effets sur profils supplémentaires. Parent tente les parcours natifs réellement nécessaires une fois sur profil isolé/autorisé ; si réseau bloqué, conserver preuve mesurée et condition de reprise2.16, aucune demande Zscaler répétée. UNSUPPORTED_INTERACTION est une inconnue native distincte à diagnostiquer, pas étiquetée réseau. Aucun profil neuf non qualifié activé.
- Rapport `qualification-lancement-catalogue/parent-verification.md`, vérification courante/candidat, matrice et limites ; revues/rechecks par mêmes acteurs, index des preuves et commit local. Pas de répétition/broadening sans défaut ou changement nouveau.

Résultat final : 44 cas ciblés distincts sans skip, types/build0, 19 sorties/3 069 ressources exactes ; un candidat0.2.14 non installé. Paquet Mary002 : six groupes, deux fermetures possédées et cleanuptrue, quatre captures valides. Quick Q1/Q2/Q3 et high H1/frontièreQ2 résolus par leurs mêmes acteurs ; Impeccable détecteur unique[], finition ship ciblé et documenter sans changement système. Les trois anciens bancs compilés partiels, le diagnostic aide seule et le premier échec QA du paquet restent leurs preuves historiques. Limites natives/intégration dans le rapport, aucune acceptation humaine/G2–G5/WCAG/globalV1 déduite.
