---
title: "Initialiser un dossier témoin après un plan compris et accepté"
type: 'feature'
ticket: 4
created: '2026-11-05'
status: 'built'
baseline_revision: '6718102cc894d8d4241dac92add474248f69691a'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - _bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation/profil-g3.md
  - _bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
  - _bmad-output/initiative-madness/ux-madness/DESIGN.md
  - DESIGN.md
---

<frozen-after-approval reason="mandat explicite d’autonomie complète, checkpoints délégués">

## Intent

**Problem:** Un dossier sans BMad peut être diagnostiqué mais Madness n’offre encore aucun chemin d’initialisation. Un développeur doit comprendre le plan exact, y consentir puis voir le résultat sourcé dans le même projet.

**Approach:** Raccorder le profil local 3.1 et l’autorité 3.3 à la surface Diagnostic et initialisation définie par Sally. Transférer uniquement les ajouts préparés et autorisés. Vérifier le premier parcours sur un dossier Windows témoin possédé dans un paquet candidat.

## Boundaries & Constraints

**Always:** Projet connu résolu par le cœur, absence explicitement observée, profil et ressource vérifiés, racine et parent physiques concordants. Préparer en privé avec paramètres matérialisés, rendre tous les ajouts et les octets consultables, afficher données préservées et limites. Accord ponctuel exact et marqueur durable avant toute écriture. Vérifier le plan et l’état physique juste avant effet, créer exclusivement, puis vérifier arbre et octets. Rapport et résultat restent attachés à leur tentative. L’expérience reste FR/EN et clair/sombre, compatible clavier et zoom. Un reçu de banc est étiqueté synthétique.

**Never:** Modifier un dossier réel du porteur pour l’essai, prendre un succès de processus pour preuve, appliquer à l’ouverture, accepter une racine transmise par le renderer, contourner le verrou 3.3, écrire ailleurs ou écraser, supprimer ou réexécuter automatiquement. Aucun appel Codex/OAuth/Zscaler, outil lancé dans la cible, dépendance utilisateur ou téléchargement au runtime. Ne pas promettre de rollback, de protection générale contre des courses physiques externes Windows, d’exécution de tous les workflows ou de compatibilité v7 universelle. Pas de reconstruction d’anciens historiques ni de migration Snapshotv1. Les campagnes longues et G3–G5 restent à leurs tickets. Le chargement et le coût en USD restent à leurs fiches de backlog.

## I/O & Edge-Case Matrix

| Cas | Entrée | Effet observable | Échec |
|---|---|---|---|
| P1 Préparation | Dossier local sans BMad et profil exact | Plan complet et lisible dans le diagnostic. L’arbre cible reste identique | Source altérée, projet non admis, collision ou inventaire hors borne refusés |
| P2 Décision | Plan courant dans le dialogue | Affichage même identité, contenu et limites. Accord d’un seul plan | Fermer, Échap, annuler ou refuser avant effet rend l’accord inactif |
| P3 Effet | Accord exact et sauvegarde acquise | Un ajout exclusif par entrée. Reçu après comparaison de l’union et du profil installé | Mutation, doublon, accord périmé ou stockage échoué empêchent le dispatch. Issue partielle ou inconnue si effet possible |
| P4 Reprise | Trace durable, fermeture ou panne | Reçu passif sous son projet, accord inactif. Marqueur incertain verrouille sa cible | Aucun rejeu, inspection ou recontrôle automatique. Conservation et résultat distincts |

</frozen-after-approval>

## Code Map

- `src/contracts/bmad-initialization.ts` et `src/core/bmad-initialization.ts` : réutiliser le contrat 3.3 et ses capacités originales. Ajouter la frontière IPC minimale (enveloppe/corrélation, commande et état bornés, DTO validés), sans créer une deuxième autorité. Préparation et lecture par projectId. Annulation par projectId/attemptId/generation. Accord, refus et fermeture via commande 3.3. Aperçu par contentId associé au plan exact. Aucun pouvoir ne passe le bridge.
- `resources/bmad-init/payload-v1.json.gz`, `scripts/assemble-bmad-initialization.mjs`, `electron-builder.yml`, `resources/THIRD-PARTY-NOTICES.md` : construire une fois le bundle déterministe à partir des seules 588 entrées du `transfer-plan.json` 3.1. Les 461 fichiers statiques correspondent octet pour octet aux sources locales `.agents/skills` et `_bmad` de ce worktree. L’autre entrée est `_bmad/config.toml` : le remplacement de `{directory_name}` par `positive` dans `.agents/skills/bmad/assets/config.template.toml` produit 82 octets CRLF et SHA e6d0012ed0c41293542422fbcc91577b1b3c73261ee25084b70eced90d5df26c. Vérifier chaque taille et hash, garder le format canonique, conserver le bundle comme entrée reconstruisible du paquet sans répertoire géré. Aucune preuve avec chemin absolu privé dans le paquet. Déclarer la provenance locale du profil 6.13.0-next et l’attribution MIT existante. Le lock local de Skills est exclu.
- `src/adapters/bmad/initialization.ts` : charger l’archive bornée en octets compressés et décompressés avec zlib, vérifier son sceau, manifestes, entrées et octets. Une seule matérialisation de la config par nom de dossier Windows validé sans caractères ambigus. Conserver CRLF et recalculer l’empreinte du payload et de chaque fichier concerné. Donner au cœur l’identité d’observation exacte et tenir séparément le sceau physique bigint racine/parent. Pas d’exécution de setup dans un dossier utilisateur. Inventorier de manière bornée et exhaustive, refuser liens/junctions, chemins atypiques, entrées spéciales et collisions insensibles à la casse, y compris les quatre noms réservés. Réutiliser les principes `inspectApprovalFiles` et `graphify.ts:safe`, sans leur transmettre la politique Mary. Recontrôler identité, contenu et source avant effet. Vérifier la chaîne de parents à chaque écriture exclusive et le signal entre E/S. Vérifier l’union finale et l’admission `qualifyBmadProfile`. L’autorité hôte conserve plan/faits originaux dans des registres privés, avec résultat inconnu si les faits manquent. Le profil borne la taille, les noms admissibles et la concurrence externe. Ces bornes sont visibles par l’utilisateur. Maintenir et drainer les E/S possédées par l’hôte.
- `src/adapters/persistence/bmad-initialization-store.ts` : CAS v1 borné par tentative sous userData, à la façon de `graph-store.ts`. Exact shape et révision, même révision valide au retry, temp exclusif/sync/promotion et refus du conflit. Charger passivement au démarrage avant toute demande d’effet. En cas de preuve illisible, fermer cette capacité et laisser le reste de l’app accessible. Cette petite annexe est nécessaire à la garde avant effet 3.3. L’inspection et la qualification de récupération restent à 3.6.
- `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts` : motif des canaux Graph/Context, contrôle `isTrustedCaller` de la frame principale et vérification du projet par `application.dialogueProject`. Observer l’état absent par le canal contexte existant, indépendamment du compte. Intégrer le service et l’hôte au cycle de vie, drainer les E/S et les écritures admises. Ne pas lever un blocage partagé quand ce propriétaire a une opération non résolue. Éviter tout bail helper imbriqué.
- `src/renderer/src/App.tsx`, `src/renderer/src/InitializationPanel.tsx`, `src/renderer/src/initialization.css` : dans le panneau Contexte, « Voir le diagnostic » étend seulement la consultation à 680 px maximum et garde le travail monté. L’entrée Parcours et le lien résultat rejoignent le même diagnostic. Même identité du plan en lecture et dans l’unique dialogue natif. Résumé, inventaire exhaustif dépliable, aperçu, préservés/limites, décision textuelle. Style et focus du dialogue catalogue, titre neutre, retour au déclencheur, contenu défilant et actions empilées au besoin. Ni onglet, portrait, nouveau token, assistant ou grand CTA supplémentaire. L’accord ne suit ni un changement de projet ni un nouveau plan. Après effet, masquer la consultation seulement et garder l’état consultable.
- `tests/bmad-initialization-host.test.mjs` et `scripts/qualification/bmad-initialization.mjs` : contrôles ciblés sur doubles de stockage et dossiers possédés, plus un témoin paquet borné. Enfant `positive` sous un Temp unique, profil isolé, aucun dossier ou compte personnel. Conserver un petit reçu du plan/avant/après/ASAR/fermeture. Réutiliser le harnais Electron et prouver l’arrêt avant de nettoyer ce que le lot crée.

## Tasks & Acceptance

**Execution:**
- [x] Ressource et adaptateur : sceller le profil exact, produire le plan par lecture et créer seulement ses ajouts après accord.
- [x] Store, cycle de vie et bridge : sauvegarde préalable réelle, restauration passive, refus de commandes et événements étrangers.
- [x] Parcours et dialogue : intégrer la décision et le résultat au diagnostic de la charte atelier, avec les variantes prévues par Sally.
- [x] Contrôles : prouver P1–P4 sur cas courts, puis un seul témoin positif du paquet. Relecture Quick et finition visuelle bornée avant commit.

**Acceptance Criteria:**
- Given un dossier témoin sans BMad, when je prépare, then le plan complet désigne mon dossier et je peux lire ses effets exacts avant de décider, avec l’arbre d’origine inchangé.
- Given un plan courant, when j’accepte précisément ce plan, then Madness affiche les ajouts vérifiés après comparaison finale, et je peux revenir au projet sans perdre le travail courant.
- Given un accord périmé, refusé ou non enregistré, when une application est tentée, then aucune application ne part. En cas d’issue incertaine après dispatch, la restauration laisse le résultat inconnu et le verrou actif sans relance.

## Implementation Notes


Worker livré, 70/70 contrôles ciblés, deux projets TypeScript valides. Le parent confirme ces résultats, relit le diff complet et associe P1–P4 aux six cas hôte et aux gardes du contrat. Pour l’absence locale seule, une commande typée du canal Contexte utilise l’observation native Windows, car le G2 existant exige des outils locaux distincts. Le reste de G2 suit sa voie habituelle. L’archive est relue contre 588 entrées et tous les octets, sans nouveau packaging ni résultat natif Electron à ce stade.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Route | Preuve avant correction |
|---|---|---|---|
| Q1 — taille totale du résultat | high | patch | Le contrôle du plan ne borne que chemins et nombre. L'inventaire final refuserait la somme des octets après les ajouts. |
| Q2 — dossier cible et données d'application | high | patch | Le dossier des reçus peut être sélectionné. Le port écrit alors le reçu ready dans la cible avant accord. |
| Q3 — absence périmée après application | medium | patch | L'observation locale reste absente quand verified arrive et peut encore activer la préparation. |
| Q4 — plan restauré sans statut | medium | patch | Le plan prêt restauré devient historical avec résultat none. La condition de rendu saute cet historique inactif et laisse le titre vide. |
| Q5 — focus après fermeture de la décision | medium | patch | Le retour avant réponse se fait sur une commande supprimée par l'arrivée asynchrone de l'état historique. |
| Q6 — attente durable du témoin | medium | patch | Le prédicat asynchrone de waitForFunction rend une Promise truthy avant que l'enregistrement ait abouti. |


Les six constats sont résolus par le même implémenteur puis recontrôlés par le même Quick. La borne totale s’applique avant accord, le dossier des données Madness est disjoint, l’interface invalide l’ancienne observation et nomme le plan historique, le focus est stable et le témoin attend la réponse du prédicat asynchrone. Parent : 73/73 sans saut et deux projets TypeScript valides. Détecteur Impeccable unique sur trois cibles : aucun constat.

F1–F4 Impeccable ont été corrigés dans le renderer puis recontrôlés sur l’ASAR final. Reçu natif vérifié, plan exact, zéro écrit avant décision, 588 ajouts exclusifs et brouillon préservé. Voir [preuve finale](../qualification-tracer-initialisation-finale/parent-verification.md). Les contrôles longs demeurent reportés à leurs stories.

## Design Notes

Sofia conserve un seul Build produit actif. Le porteur a délégué les décisions de réalisation. Choix retenu sous ce mandat : embarquer le payload portable dont les octets sont qualifiés, matérialiser le seul nom de projet en privé et ne plus appeler l’installateur de compétences au runtime. Le témoin `positive` reproduit les octets qualifiés de la config, les autres noms admissibles portent leur propre empreinte. Impeccable a chargé le contexte de l’App. Extension Operate de la charte validée, en reprenant le contrat 3.2. Aucune nouvelle approbation visuelle déduite.


Responsabilités : l’implémenteur possède les fichiers du Code Map, hors statut/commit et finition parent. Il n’est pas seul dans le dépôt : préserver les fichiers préexistants, dont tests/bmad-help-boundaries.test.mjs modifié seulement en fins de ligne. Ne pas toucher aux skillsets, paquets, previews, profils ni dossiers de l’utilisateur. Côté shell Windows, utiliser pwsh/login:false et le workdir C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness avec la route require_escalated lorsque nécessaire. Utiliser py -X utf8, UTF-8 et Git core.longpaths=true. Les contrôles courts hôte/contrat/types et le harnais témoin sont au worker ; un seul paquet et témoin natif puis revue au parent. Pas de commit par le worker.

## Verification

- `node --test tests/bmad-initialization-contract.test.mjs tests/bmad-initialization-host.test.mjs` et `npm run typecheck`. Pas de suite globale.
- Construire une fois un candidat unpacked après revue et lancer uniquement le témoin Windows isolé. Vérifier le plan visible, le hash de config, le différentiel exhaustif, le reçu d’application et la fermeture avant nettoyage. Aucune installation NSIS personnelle, réseau ou lancement agent.
- Inspecter les états plan/décision et résultat sur les tailles utiles dans une capture groupée avec Impeccable. Un seul détecteur sur les cibles modifiées. Corriger en lot si nécessaire, puis recontrôle ciblé.
