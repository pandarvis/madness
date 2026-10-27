---
title: 'Reconstruire et remplacer le programme sans perdre les données'
type: 'feature'
ticket: '9'
created: '2026-10-27'
status: 'built'
baseline_revision: '5e9f45e07b2ef25677eb1f009d041eb56df3f865'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les remplacements personnels ont conservé les données mais restent tous étiquetés0.1.0 ; aucune procédure reproductible ne vérifie ensemble les données intégrées sous deux versions distinctes ni les échecs de sauvegarde/version.

**Approach:** Livrer0.1.1 après une montée explicite de dépendances, avec manifeste de livraison, procédure de reconstruction/republication et banc A→B vérifiant les mêmes données synthétiques, puis remplacement NSIS réel possédé sur Windows.

## Boundaries & Constraints

**Always:** AD-1/2/5/7/9 ; identité `madness` / `fr.madness.desktop` / `Madness` stable, données hors binaires. A=paquet0.1.0 qualifié1.8, B=0.1.1 reconstruit avec lock cohérent. Upgrades explicites electron-builder26.15.3→26.18.0 et jose6.2.12→6.2.13 ; Electron45.0.0 conservé, runtime mesuré sans prétendre une montée Chromium. Conserver projets/rattachements/messages/brouillons/préférences et annexes1.3–1.8, compte synthétique chiffré et Local State. Toute demande restaurée reste historique ou inconnue, sans moteur ni replay. Compatibilité v1 positive, futur/corruption refusés sans remplacement ; aucune migration nécessaire inventée. Échec de sauvegarde : ancien durable exact, saisie non enregistrée visible, reprise explicite après rétablissement. Réseau Main public et protocole/processus Codex rapportés séparément avec limites.

**Never:** Publier, signer, ajouter updater, changer authentification/facturation, lire un profil tiers, lancer un modèle externe ou faire un nouveau consentement pour ce lot. Aucun schéma/IPC nouveau, reset ou migration implicite, écriture de secrets dans messages/rapports, copie du coffre personnel, nouveau projet témoin personnel. Ne pas forcer `MADNESS_DATA_HOME` sur le profil personnel. Deux dossiers unpacked ne constituent pas deux installations NSIS ; `/D` seul n’isole pas les clés NSIS communes. Parent seul pour remplacement personnel déjà autorisé, fermeture et empreintes contrôlées. Gates1.1/1.2/10/11, R32, Loop, graphe et refonte globale inchangés.

## I/O & Edge-Case Matrix

| Cas | Entrée | Résultat attendu | Échec |
|---|---|---|---|
| Versions | A0.1.0 puis B0.1.1, même profil complet | app.getVersion/runtime/ASAR distincts prouvés ; contenu durable et contexte identiques | Mauvaise version, identité ou artefact : arrêt, pas de succès |
| Historique | Questions/approbations/Forge/arrêt incertain | Annexes exactes, contrôles historiques inactifs, propriétaire incertain non libéré | Aucune autorisation ou relance pour faire passer le test |
| Compatibilité | v1, futur, corruption/UTF-8 invalide | v1 conservé ; versions inconnues/corruption expliquées sans écraser | Aucune migration positive déduite d’un refus |
| Sauvegarde | Échec réel du remplacement atomique puis rétablissement | Ancien fichier intact, saisie visible non durable, succès seulement après nouvel enregistrement | Nettoyage borné au profil synthétique |
| Réseaux | GET public Main, runner natif épinglé loopback | Identité/runtime/proxy/certificats permis et résultats séparés | Réseau externe non mesuré/intercepté reste explicite, aucune validation humaine répétée |

</frozen-after-approval>

## Code Map

- `package.json`, `package-lock.json`, `electron-builder.yml` : versions exactes, scripts de build, NSIS per-user conserve AppData ; aucun publish configuré. `dist/overview-pilot/` A déjà qualifié, ASAR072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1.
- `src/adapters/persistence/{json-store,appearance-store,workflow-store,question-store,approval-store,recovery-store}.ts`, `src/contracts/` : formats v1 et atomique existants à réutiliser ; pas de transaction globale ni migration existante. AppearanceStore ne promet pas CAS sur modification externe valide.
- `src/core/{application,dialogue}.ts`, `src/adapters/codex/{owned-run,connection,vault}.ts` : restauration sans session ; safeStorage dans le même environnement Chromium, propriétaire incertain bloquant. Ne pas injecter un faux compte réel.
- `src/main/index.ts` : MADNESS_DATA_HOME change aussi sessionData/chromium avant lock ; profils synthétiques identiques entre A/B. Ponts existants seulement. `src/adapters/codex/{probe,dialogue}.ts` : clientInfo actuellement0.1.0, à aligner sur la version de livraison sans nouvelle API.
- `scripts/qualification/{overview,recovery,windows}.mjs`, tests persistence/dialogue/connection-vault : bancs un seul exécutable existants, vrais Main/preload avec fixtures et hooks post-démarrage. `overview-native.mjs` : vrai runner0.144.6, protocole produit avec Responses127.0.0.1 sans compte. `probeEnvironment` : environnement proxy/certificats propre au child, pas celui supposé d’Electron.
- `docs/development.md` : nombreuses sections historiques à réconcilier pour le guide courant ; garder preuves/limites. Investigation réalisée par deux explorateurs en lecture seule ; aucune installation de leur part.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` : version0.1.1, deux upgrades épinglés ; installation propre et build contrôlés. Garder appId/nom/stockage et Electron45.
- [x] `src/adapters/codex/{probe,dialogue}.ts` et petit module de version partagé si nécessaire : clientInfo dérivé du manifeste, pas deux chaînes à modifier à chaque livraison ; vérifier types et protocoles existants.
- [x] `scripts/release/manifest.mjs`, `tests/release.test.mjs` : manifeste déterministe sans secrets, entrées versionnées/lock/ressources, versions exactes et empreintes installer/ASAR ; erreurs de cohérence refusées. Ne pas promettre un binaire bit-à-bit identique aux reconstructions NSIS horodatées.
- [x] `scripts/qualification/maintenance.mjs`, `tests/maintenance.test.mjs` : banc permanent avec phases A/création par ponts/fermeture puis B/lecture exacte, profil synthétique réutilisable, empreintes et identités contrôlées. Fixture complète d’annexes valide avant A ; projets/conversation/brouillon enregistrés sous A. Prévoir reprise parent entre les deux phases pour vrai NSIS, sans nettoyage prématuré du profil. Comparer données avant navigation et après fermeture ; capturer seulement synthétique. Protéger chemins, fermeture et nettoyage même sur échec.
- [x] `tests/maintenance.test.mjs` : matrice des formats, échec réel de rename sur fichier ouvert Windows sans partage suppression, ancien fichier et révision inchangés, temporaires nettoyés et retry explicite ; intégration UI saisie non enregistrée avec le même échec. Réutiliser les tests existants plutôt que recopier leurs implémentations.
- [x] `docs/development.md`, `docs/releasing.md`, `qualification-maintenance/` sous l’epic : procédure courte mise à jour/détection versions/contrats/tests/build/manifeste/republication manuelle, reprise après échec, comptes/profils, réseau Main séparé du runner. Sources primaires npm/Electron/builder vérifiées et datées. Parent assure NSIS A→B sur l’installation possédée, empreintes personnelles avant/après et restauration normale du compte.

**Acceptance Criteria:**
- Given les données synthétiques créées et enregistrées sous A, when remplacement réel du même programme par B puis réouverture du même profil, then versions différentes et contenu complet identique sont attestés, aucune demande ancienne n’est répondable et aucun moteur n’est relancé.
- Given une version de stockage inconnue ou une sauvegarde refusée, when ouverture/enregistrement puis rétablissement explicite, then la limite est expliquée, les octets durables sont préservés et aucune saisie non enregistrée n’est annoncée sauvegardée.
- Given le lock, les ressources et les commandes documentées, when reconstruction de B et production du manifeste, then versions/empreintes correspondent au paquet exécuté ; les contrôles Main/Codex et toute limite de réseau restent séparés.

## Implementation Notes

- Implémenteur : fichiers de code/tests/docs seulement, aucun commit ni installation personnelle. Lock et `npm ci` exécutés par le parent côté hôte après l’échec réseau sandbox ; journaux `npm-lock-parent.log` et `npm-ci-parent.log`. Electron45 conservé ; builder26.18.0 et jose6.2.13 effectivement installés.
- `src/adapters/release-version.ts` importe le manifeste JSON ; `probe` et `dialogue` le partagent. Le banc Windows reprend aussi cette version pour ses noms d’installateur. Aucun contrat, schéma ou pont ajouté.
- Manifeste sans date variable ni environnement : cohérence racine/lock/paquet, entrées et artefacts SHA-256, contrôle de la ressource Python externe contre sa source. Tests nouveaux observés en échec avant implémentation, puis verts.
- Banc A/B : annexes et conversations sont des fixtures explicitement identifiées, puis les ponts du vrai programme A sérialisent projets, rattachements, messages, brouillons et préférences dans le snapshot complet. Le compte est inventé et chiffré dans Main ; seule sa lisibilité booléenne sort du coffre. Douze fichiers durables comparés avant navigation et après fermeture, dont `Local State`, coffre et livrables Forge. A doit correspondre à son SHA qualifié ; B doit correspondre au manifeste qualifié avant lancement. `--manifest` permet une copie explicite, sans aucune validation NSIS déduite du seul chemin.
- La fixture du propriétaire porte `identity:null`, réellement non réconciliable. Le premier essai avec un PID prouvablement absent a été correctement réobservé à la fermeture par le produit : échec du banc conservé, aucune assertion affaiblie ni correctif produit. Première erreur d’instrumentation (`require` absent dans le contexte d’évaluation) et sélecteur UI ambigu conservés séparément ; espaces correspondants fermés/nettoyés.
- Tests de format : Snapshot, apparence, workflow, question, approbation et propriétaire via leurs adaptateurs réels. Vrai handle Windows sans partage suppression dans le cœur et le renderer ; octets/révision inchangés, temporaire retiré, saisie non durable visible et retry explicite après libération. Le sandbox avait refusé même un rename sans verrou ; recontrôle hôte vert, sans adaptation de la stratégie produit.
- `overview-native.mjs --output=...` évite de réécrire les preuves historiques et distingue client0.1.1/runner0.144.6/loopback. La première sortie 1.8 remplacée par ce banc a été copiée dans ce lot puis restaurée exactement depuis sa révision Git. Les compteurs Main/processus A/B sont post-démarrage ; aucune connectivité externe fraîche n’est déduite.
- Types/build/NSIS B réussis : ASAR `c0e43dc1278930fa4f3dc813078e220aa656030ea8b4ca9b7e543577a1e07746`, installateur `20ffae8fe4af88d855196063c78ff670b3bffd680179cc1a13d2e77c512603b8`. A/B unpacked6/7 contrôles, sauvegarde paquet4, Windows5 et loopback4 passent. Première suite complète295/295 ; suite finale conservée séparément après les tests complémentaires. Remplacement NSIS et restauration personnelle restent au parent.
- Relecture parent : attribution JOSE embarquée corrigée6.2.12→6.2.13, texte MIT strictement inchangé ; README racine réconcilié avec la livraison courante. Reconstruction finale types/build/NSIS réussie (`build-final.log`) : ASAR `bbac088b9dd9a6c3ad66871dc2db27956378f3a29967df2a734b1e14d007b639`, installateur `8e3fc5145cd8c4bb19341c4c9be53b8df5b4d9f9f2032a4e9ee90c380b4ecb3a`. Manifeste113 entrées/trois artefacts conservé dans le paquet et les preuves.
- Le run `unit-tests-final.log` a chargé le module avant l’ajout concomitant du dernier test de garde :296/297, échec conservé et recontrôle ciblé vert. Après gel des sources, `unit-tests-stable.log` passe297/297 (378849ms), sans échec/skip ; aucune autre suite globale lancée. Sur le paquet reconstruit exact, A6/B7 (`final-a/b.json`), sauvegarde4 et Windows5 recontrôlés séquentiellement verts, douze fichiers durables identiques, tous les espaces de l’implémenteur fermés/nettoyés. Le workspace installé A du parent reste réservé à son B ; aucun nettoyage de ce profil par l’implémenteur.

- Clôture technique du28octobre : patches Q1/Q2/A1 recontrôlés résolus par les mêmes relecteurs ; maintenance9/9, types réussis, confirmation complète300/300 sans saut ni échec (472132ms). Le run précédent299/300 garde son erreur Windows UNKNOWN de réécriture du fauxPE ; isolé1/1, aucun correctif produit ni conclusion antivirus inventée.
- Remplacement NSIS réel0.1.0→0.1.1 réussi au même chemin : A6/B7, douze fichiers et deux projections exacts. Profil personnel7/7,27entrées pré-NSIS conservées, compte lisible, GETMain200 séparé, fenêtre fermée. Relecture indépendante des reçus conforme, lien de baseline explicité ; aucune preuve externe fraîche du runner ni distribution déduite. Voir qualification-maintenance/parent-verification.md.

## Plan Change Log

## Review Triage Log

| ID | Constat | Verdict | Route | Vérification parent |
|---|---|---|---|---|
| Q1 | La garde du paquet B contrôle l’ASAR mais pas le runner externe ni le runtime démarré. | medium | patch | Les champs de runtime sont seulement rapportés et le runner n’est pas comparé avant utilisation : un paquet hybride peut être accepté. Comparer ces identités déjà disponibles, sans nouvelle API produit. |
| Q2 | Une création partielle du workspace ne peut pas être nettoyée par la garde réservée aux espaces complets. | medium | patch | Le catch appelle cleanupWorkspace, dont readWorkspace exige le marqueur et les trois répertoires ; un échec précoce masque sa cause et laisse un reste. Nettoyer seulement la racine fraîchement créée et possédée, en préservant l’erreur initiale. |
| A1 | Les chemins durables fixes peuvent traverser une jonction intermédiaire sous le profil. | medium | patch | lstat de credentials.bin ou Local State contrôle la feuille mais suit un parent substitué. Refuser les intermédiaires liés avant lecture et lancement ; tester avec une cible synthétique possédée. |

Les trois défauts du banc sont distincts et ne modifient pas le contrat figé. Le même implémenteur est réengagé pour corrections minimales et tests ciblés. La reproduction parent lancée avant l’interruption des outils n’a pas rendu de résultat ; aucune preuve d’exécution n’en est déduite. Les comparaisons positives de douze fichiers restent acquises pour leurs artefacts nommés, sans preuve d’un paquet hybride ou d’une jonction dans ces essais. Le reçu parent NSIS devra relier explicitement le chemin installé A à sa commande et à l’empreinte acquise : son rapport historique ne capturait pas appPath.

Recontrôle après patches : Q1 et Q2 résolus par le relecteur Quick, A1 résolu par le contrôleur de conservation. Contrôle des reçus NSIS/A/B/personnel/manifeste conforme après rattachement explicite de la baseline pré-NSIS, sans nouvelle exécution ni relecture personnelle par le contrôleur. Aucun défaut correctif de ce lot différé ; réserve historique d’arrêt pour1.10 conservée.

## Design Notes

Pas de nouveau parcours visuel ni changement de palette. La priorité UX s’exerce ici sur la conservation et la véracité des erreurs existantes ; refonte Sally/experts avec Impeccable reste après implémentation de l’epic. Ne pas masquer un défaut produit révélé par la matrice : le rapporter au parent plutôt qu’affaiblir une assertion.

Choix de maintenance fondé sur `npm outdated` et `npm view` du27octobre : builder26.18.0 et jose6.2.13 disponibles, Electron45.0.0 déjà conservé au plus haut majeur stable consulté (`https://releases.electronjs.org/release?channel=stable`). Les autres mises à jour majeures ne sont pas adoptées implicitement. Réseau/certificats de Codex inchangés : runner0.144.6 et son empreinte restent qualifiés séparément par le loopback ; cela ne vaut pas connectivité externe fraîche. GET Main public possible via action de diagnostic seule, sans refresh ni rejouer un message ;307 éventuel est un résultat, pas une raison de reposer la question JSON.

Mandat autonome : approbation du plan déléguée, risque high car une mauvaise preuve pourrait masquer une perte de données. Implémenteur code/tests/docs/bancs seulement ; parent seul pour compte personnel, fenêtres/installation et commit. Aucun seuil de longueur des plans en tokens.

L’implémenteur est propriétaire des fichiers d’exécution de ce plan et de ses notes d’implémentation ; il n’est pas seul dans le dépôt. Préserver les éditions d’autrui et les preuves historiques, adapter son travail à leur présence, ne pas revenir sur les commits du parent. Aucun commit ni installation personnelle par l’implémenteur.

## Verification

- `node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs` : suite complète après modification des dépendances/protocoles.
- `npm ci`, `npm run build:win -- --config.directories.output=dist/maintenance-pilot` : lock reproductible, types/build/installateur ; parent conserve A avant remplacement.
- Banc maintenance avec A overview-pilot0.1.0 puis B maintenance-pilot0.1.1, régressions Windows ciblées et runner loopback ; chaque rapport distingue unpacked et vrai remplacement NSIS.
- Parent relit manifeste/diff/matrice et fait Quick frais ; contrôle supplémentaire indépendant de la preuve de conservation A→B, compte tenu du risque high. Pas de nouveau modèle externe pour ces contrôles.
- Après vraie installation B : ASAR égal au qualifié, empreintes personnelles identiques et compte lisible avec environnement normal, fenêtre de contrôle fermée ; conserver les échecs séparés, nettoyer seuls profils et aides ponctuels possédés.
