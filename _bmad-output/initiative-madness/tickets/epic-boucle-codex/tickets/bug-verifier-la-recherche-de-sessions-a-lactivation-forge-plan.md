---
title: 'Rendre observable la recherche native de sessions Forge'
type: 'bugfix'
ticket: 13
created: '2026-10-28'
status: 'built'
baseline_revision: '70cb38ac7a8cbaca0b5adfa35fa41aa599596639'
route: 'full'
route_source: 'pinned'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/.agents/skills/bmad-forge-idea/SKILL.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/tickets/bug-verifier-la-recherche-de-sessions-a-lactivation-forge.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le skill Forge installé exige la recherche des sessions existantes à l’activation. Le profil hôte la vérifie déjà, mais le modèle ne peut demander cette lecture et son premier terminal peut réussir sans elle. Le diagnostic personnel001 l’observe ; il ne prouve pas la cause du refus du premier run001.

**Approach:** Exposer un contrôle Forge strictement borné, sans argument de chemin, réutilisant les emplacements et protections du profil qualifié. Conserver son reçu natif corrélé ; l’exiger après workflow/config avant le premier terminal et avant init. Une session inachevée reste refusée, aucune reprise n’est implémentée. Livrer le correctif identifié à1.11 pour sa nouvelle qualification personnelle complète.

## Boundaries & Constraints

**Always:** Skill et scripts BMad installés intacts ; contrôle factuel des deux emplacements prescrits, lecture de frontmatter sans lecture libre, refus fermé en cas d’incertitude. Observation durable liée à appel/tour/conversation, sans faux livrable ni acceptation. Connexion SIWC, forfait personnel, Mary, arrêt, approbations, fichiers/projets réels et compte conservés. Nouvelle version0.1.2, lockfile cohérent, manifeste neuf attribué aux sources actuelles ; manifeste0.1.1 et anciens reçus inchangés. Remplacement uniquement profil fermé avec vérification de conservation.

**Never:** Glob ou shell général, chemin fourni par l’agent, lecture arbitraire, reprise, modification du skill, nouveau schéma Snapshot/IPC, nouvelles identités ou authentification, assouplissement TLS, retour de succès sans observation, rejeu d’un ancien témoin. Catalogue, graphe, Loop, R32 et refonte UX restent hors du correctif. Aucun statut built ni preuve historique n’est réécrit.

## I/O & Edge-Case Matrix

| Cas | Entrée/état | Résultat attendu | Échec |
|---|---|---|---|
| Contrôle natif | Sortie absente/vide ou sessions complètes, profil qualifié | Lecture des emplacements imposés, reçu factuel observé avec hash/taille et IDs de l’appel | Aucun résultat vide inventé ni fichier créé |
| Fraîcheur | Session inachevée créée dans la sortie générale ou initiative après qualification | Refus de reprise avant init/nouveau travail, fichiers intacts | Aucun succès natif ni observation observed fabriqués |
| Frontières | Argument supplémentaire, autre contexte, lien/jonction, hardlink, frontmatter illisible/invalide ou trop grand | Refus explicite sans lecture libre ni effet ; fichiers hors motifs intacts | Aucun relâchement des gardes pour faire passer le banc |
| Ordre | workflow/config seuls ; init avant contrôle ; contrôle après init | Premier terminal/init sans contrôle refusés ; contrôle réservé à l’activation de nouvelle session | Pas de confusion avec la session actuellement créée |
| Conservation | Reçu observé puis fermeture/réouverture ; ancienne annexe sans ce reçu | Reçu courant durable ; ancien corpus reste lisible et historique sans relance | Échec de sauvegarde ne vaut pas observation durable |
| Livraison | Sources0.1.2, paquet reconstruit et profil personnel fermé | Types/tests/banc paquet passent ; runtime/ASAR/runner/manifeste frais ; données identiques au remplacement | Une preuve0.1.1 ne qualifie pas implicitement le nouveau produit |

</frozen-after-approval>

## Code Map

- `src/adapters/bmad/forge.ts:64` : `incomplete` est déjà appelée dans `qualifyForge` pour outputRoot puis outputBase. Réutiliser ses protections `forgePath`, taille/type/nlink, décodage strict ; extraire le contrôle factuel sans généraliser la lecture. Les chemins se déduisent exclusivement de `profile.forge.outputBase/initiativeId`. `ForgeHost.execute` conserve les observations et `read` reste strictement inchangé dans sa portée.
- `src/adapters/codex/dialogue.ts:132,147,228,298` : outils Forge, instructions, validation stricte des clés/corrélation, ensemble des résolutions et garde du premier terminal. Ajouter le contrôle sans argument, son ordre et ses préconditions ; ne pas changer Mary ni les autres demandes.
- `src/contracts/dialogue.ts:21,60` et `src/adapters/persistence/workflow-store.ts` : `WorkflowObservation.operation` est une chaîne bornée ; le schéma existant admet un nouveau reçu path=null/hash/bytes. Aucun changement de schéma nécessaire ; corpus historique à recontrôler.
- `tests/forge{,-protocol}.test.mjs` : fixtures de vrais resolvers/memlog et faux transport strict. `scripts/qualification/forge.mjs`, `overview-native.mjs` et les autres fixtures Forge trouvées par recherche : mettre les scénarios natifs en conformité avec le contrôle réellement appelé, sans injection présentée comme modèle réel.
- `package.json`, `package-lock.json`, `src/adapters/release-version.ts`, `scripts/release/manifest.mjs` : version alimentée depuis package, manifeste neuf après construction. Le bump concerne seulement la version projet, aucune dépendance nouvelle.
- Harnais1.11 en cours `scripts/qualification/epic-one*.mjs` : travail possédé non committé, à préserver. Il reste figé pendant13 ; adaptation du manifeste/version et reprise de ses contrôles sous son propre plan. Anciennes sorties inchangées.

## Tasks & Acceptance

**Execution:**
- [x] `tests/forge.test.mjs`, `tests/forge-protocol.test.mjs` — régression rouge du terminal/contrôle manquant puis contrôles de toute la matrice sans compte ni modèle ; conserver le reçu rouge utile.
- [x] `src/adapters/bmad/forge.ts`, `src/adapters/codex/dialogue.ts` — contrôle natif strict borné, reçu corrélé durable et gardes d’ordre ; intégrité des frontières conservée.
- [x] `tests/workflow-store.test.mjs`, fixtures Forge et `scripts/qualification/forge.mjs`, bancs concernés — conservation/nouvelle observation et protocole simulé actualisés, anciennes annexes lisibles.
- [x] `package.json`, `package-lock.json`, `docs/development.md` — version0.1.2 et procédure/limites du contrôle ; préserver la section du harnais1.11.
- [x] `qualification-forge-session-check/` sous l’epic — parent compile/reconstruit vers `dist/forge-session-check/`, manifeste neuf, banc Forge/Windows et revue indépendante de frontières ; puis remplace le programme fermé avec données contrôlées avant/après. Aucun parcours modèle dans13 ; preuve complète native externe remise à11.

**Acceptance Criteria:**
- Given un profil neuf de référence, when le protocole réalise l’activation, then le contrôle de sessions est réellement demandé, corrélé et durable avant le terminal ou init ; tous les cas de matrice ont une vérification réussie.
- Given le paquet0.1.2 qualifié et les données personnelles conservées, when11 reprend, then elle dispose de ses empreintes, du manifeste et des limites exactes ; aucune clôture G1 ni nouvelle acceptation humaine ne se déduit de13.
- Given la reproduction, when une preuve réfute le défaut, then elle est conservée et aucun patch artificiel n’est introduit ; reprendre11 sur l’artefact inchangé est expliqué.

## Implementation Notes

Plan relu et validé sous le mandat autonome, sans question produit ouverte. Périmètre unique, risque high conservé ; aucune règle de longueur ne conditionne le plan. Baseline et travail1.11 non committé identifiés : conserver ce travail possédé et les caches préexistants, sans nettoyage Git ni reset. Le passage draft→ready-for-dev→in-progress est autorisé ici par la délégation des validations et du démarrage.

L’implémenteur possède les fichiers produit, tests, fixtures/bancs et versions nommés dans les tâches ainsi qu’une nouvelle courte section documentaire propre à13. Il n’est pas seul dans le dépôt : ne pas annuler les edits d’autrui et adapter son travail à eux. Le parent possède le plan/statut, tous rapports de qualification et commandes de paquet/installation/personnel, les revues et le commit. L’implémenteur peut exécuter les tests et types sans compte/modèle, avec logs neufs sous `.g0-qualification/forge-session-check-implementation/`, et y conserver la régression rouge ; aucun ancien reçu modifié, aucun programme personnel ni réseau externe/model lancé, aucun commit. Le harnais1.11 et sa section documentaire restent intacts ; signaler les adaptations nécessaires au parent. Cette invocation Build est déjà rendue et planifiée : ne pas la rerendre ni déclencher d’autre workflow.

## Plan Change Log

## Review Triage Log

- Q1 — Quick, medium/patch, confirmé : la lecture d’en-tête limitée à32Kio peut refuser une sortie produite par init/finish pourtant admise par les bornes de10 000unitésUTF-16 pour idée et but. Deux chaînes de9 000«é» dépassent36 000octets avant champs fixes ; le script natif les conserve, finish relit jusqu’à1Mio et peut réussir, puis la nouvelle qualification refuse le journal complet. Le parent a vérifié validation d’init et render/set natifs. Correction minimale choisie : porter la borne technique d’en-tête à64Kio, suffisante pour les deux entrées actuellement admises (au plus60 000octetsUTF-8 plus les champs natifs fixes), sans nouvelle restriction utilisateur ; borne du fichier1Mio et refus de dépassement conservés. Ajouter une régression d’en-têteUTF-8 valide supérieur à32Kio, adapter le témoin de dépassement à la borne réelle et recontrôler le cycle natif terminé→qualification. Aucun changement d’intention ni nouvelle surface.

- A1 — contrôle indépendant des frontières, medium/patch, en cours : `sessionLocation` ne revalidait pas le répertoire après `readdir` dans la branche vide. Une substitution par jonction pouvait produire un reçu vide `observed` sans preuve du chemin qualifié. Reproduction en mémoire par le relecteur ; parent confirme la branche et demande au même implémenteur de vérifier l’identité/canonicalité du répertoire avant/après scan, y compris vide/absence, avec régression. Aucun élargissement de portée ni changement d’intention ; aucune installation de ce code n’a précédé le contrôle.

## Verification

- Régressions ciblées host/protocole/stockage : rouge sur reproduction, vert après correction ; aucune lecture du profil personnel ni modèle.
- Suite permanente complète, `npm run build`, installateur `dist/forge-session-check/` ; pas de dépendance/runtime nouveau. Banc Forge vers sortie neuve et Windows ciblé sur le paquet exact.
- Parent compare sources/artefacts/histoire, reçoit relecture indépendante high-risk, remplace uniquement application fermée et contrôle octets des données critiques/coffre sans contenu secret, puis réouverture sans modèle/réseau spontané dans la fenêtre instrumentée.
- Aucune UI éditée : pas de passe visuelle ou d’accord Impeccable inventé. La refonte Sally/experts reste après l’epic1.

Recontrôle A1 : même expert,8/8 scénarios mémoire indépendants avec Stats complets (stable et absent acceptés ; jonction, inode, mtime, ctime, apparition et disparition refusés avant observer). Régression contrôlée de l’implémenteur2/2 puis1/1 ; A1 résolu, aucun reliquat concret. Delta final de préfixe relu par l’expert, aucune régression A1. La détection insensible à la casse évite un faux vide face à Forge-/FORGE- ; témoins correspondants dans la suite générale du parent. Source Forge finalSHA6be014ba87755ed1934d9115ee798285aca8dfaee9290663a4737204a01bd0f8.

Vérification parent après code figé :338/338tests permanents du workspace(zéroéchec/ignoré), types/build/installateur0.1.2 réussis. Le nombre inclut20tests du harnais11 non committé. Manifeste neuf120inputs, ASAR25400621028638c68528178774724362b5434093cbc25048ece8f61247d7b88f, runneridentique. Banc paquet9 et Windows5 passent, profils supprimés. Installateur silencieuxexit0 puis42empreintes identiques au remplacement ; réouverture7contrôles,41fichiersmétier/chiffrés identiques, LocalState observé séparément, compte lisible, MIA/madness seuls et fermetureconfirmée. Matrice6lignes couverte/réussie dans matrix-audit.json. Aucun modèle dans13, aucune clôtureG1 déduite.

Q1 corrigé et recontrôlé : vraie régression rouge après init/finish, puis deux cas couvrants verts(cycle natif >32Kio et refus de dépassement64Kio), configuration32Kio et fichier1Mio inchangés. Même relecteurQuick confirme Q1résolu par inspection, aucun reliquat. Parent lit les trois deltas et relance la vérification finale dans des reçus distincts ; ancien candidat0.1.2 installé n’est pas présenté comme corrigé avant remplacement final.

Vérification FINALE après Q1 :338/338tests(0échec/ignoré), types/build/installateur, paquet9/Windows5 passent dans reçus -final distincts. ASAR final9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4 installé,42empreintes identiques après remplacement et réouverture(LocalState aussi), compte accessible, MIA/madness seuls,7contrôles et fermetureconfirmée. Matrice6lignes finale passée. Le complément de fixture coordinateur tests/dialogue.test.mjs, omis du diff initial mais présent dans les deux suites338, a été lu parent et revu par le mêmeQuick : aucun constat, conservation du contrôle avantinit/restauration intacte. Aucun constat restant ou différé. G1reste à11 ; rien n’est déduit des seuls scripts synthétiques de13.
