---
title: "Qualifier l’outillage et le plan exact d’initialisation BMad"
type: 'chore'
ticket: '1'
created: '2026-11-05'
status: 'built'
baseline_revision: '7cd785ba2af2e7d0bb1a56b92dbafbe3756f4f9c'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick', 'effects-provenance']
review_loop_iteration: 0
context:
  - 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md'
---

<frozen-after-approval reason="intention approuvée sous le mandat humain explicite d’autonomie complète ; aucun changement sans renégociation humaine">

## Intent

**Problem:** Madness ne possède pas encore de profil qualifié pour initialiser BMad. Le produit doit connaître tous les changements avant accord, alors que les outils locaux ne proposent pas de dry-run d’installation et peuvent produire des effets indirects ou partiels.

**Approach:** Qualifier hors produit une matérialisation locale et épinglée dans un espace possédé, puis en tirer un plan exact et un résultat vérifiable sur dossiers témoins. Fournir à Sally3.2 et au contrat3.3 un profil défendable, ses refus et ses limites ; aucune capacité n’est supposée d’après une documentation seule.

## Boundaries & Constraints

**Always:** Dossiers de qualification neufs et possédés, sources/outillage épinglés par octets et provenance honnête, inventaire avant/après, plan avant tout effet dans le dossier cible, accord synthétique du seul banc identifié comme tel, préconditions relues, conservation des fichiers préexistants. Préparation et matérialisation privée peuvent écrire seulement dans leurs racines possédées, séparées du dossier cible. Annulation avant application laisse celui-ci intact. Résultat vérifié par les octets et les observations utiles, non par le seul exit0. Échec/partiel/inconnu distincts, aucun rollback ou arrêt après effet garanti sans preuve. Nettoyer les copies après clôture possédée, conserver les seules preuves utiles ; témoin incertain retenu et nommé.

**Never:** Changement de src/resources/contrats/IPC/persistance/produit/profil personnel, installation dans un vrai projet ou les compétences du porteur, installation globale/npx/npm install/update, branche distante/non épinglée exécutée, status ou source-record BMad réseau, intégration Loop/Builder, nouveau fournisseur/auth/API billing ou demande Zscaler/token/IT. Ne pas détourner les approbations Mary qui interdisent .agents/_bmad. Ne pas présenter add --dry-run comme inoffensif, ni une API moderne comme disponible dans skills1.7.4. Aucun test global, campagne native ou paquet/NSIS/capture/détecteur ; seuls contrôles courts nécessaires aux effets de ce profil. Pas de G3/G4/G5 final, accord humain ou compatibilité v7 universelle par ce spike.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Comportement attendu | Erreur / limite |
|---|---|---|---|
| I1 source/outillage | Bundle local BMad, trois modules6.13.0-next, CLI1.7.4 | Manifeste exact des fichiers et outils réellement exécutés ; source canonique déclarée, profil local distingué d’un release officiel | UpstreamSHA inconnu ne devient pas un commit inventé ; absence/membre indisponible explicités |
| I2 préparation | Cible témoin sans BMad avec README/code sentinelles | Installer Skills local puis setup normal uniquement en staging privé ; inventorier fichiers/répertoires/effets indirects, commandes et refus | Nul effet cible avant accord ; pas d’appel status/update/réseau ni de source liée suivie implicitement |
| I3 annulation | Plan matérialisé, aucune application | Cible et sentinelles byte-identiques ; staging nettoyable après fermeture | Aucun effacement de données extérieures/ambiguës |
| I4 application bornée | Accord synthétique pour plan capturé, cible/parent et chemins inchangés | Appliquer le plan seulement au témoin, préserver les autres données, comparer arbre final et profil observable | Le banc n’accorde aucune autorité produit ni garantie anti-course native future |
| I5 refus préalable | Collision, source liée, chemin/répertoire réorienté, output_folder absolu/parent | Refus avant commande ou écriture cible ; sentinelle extérieure intacte | Pas d’exécution de la branche dangereuse pour prétendre qu’elle est protégée par l’outil |
| I6 résultat incomplet | Précondition changée, erreur ou arrêt non prouvé | Refus sans écriture pour précondition ; effets réellement observés/partiels conservés sinon, pas de reprise automatique | Interruption en plein effet non éprouvée reste non qualifiée, aucune restauration totale promise |

</frozen-after-approval>

## Code Map

- `.agents/skills/bmad/scripts/setup.py` = `_bmad/scripts/setup.py`, SHA2561de76dce0b4ba702da927d6dc83fd620ec0774aa1c1ab0cc5739167c135f64f8 : CLI160–252, setup259–379, tree_state1978–2017, output2218–2223 et staging/promotion2226–2374. Branche setup locale sans réseau ; pas de plan/dry-run/agent cible. --status1698–1885 et --source-record peuvent lire main distant : ne pas les appeler. --list-config-questions local possible si nécessaire. Fixer explicitement racines de compétences et réponses de fixture, output {project-root}/_bmad-output strictement dans le staging. N’exécuter ni suppression de compétences ni migration/custom du porteur.
- `.agents/skills/bmod-{core-tools,method,toolsmith}/bmod.toml` et membres BMad réellement présents : stamp6.13.0-next, source déclarée github:bmad-code-org/BMAD-METHOD/skills vers main, aucun lock amont prouvé. Sélectionner seulement ces modules/membres, aucun plugin/skill tiers ; capturer fichiers/tailles/hashs et liens avant copie. Canonicaliser la racine explicitement choisie, refuser les liens internes suivis silencieusement par CLI. Aucun custom/config ou cache/render du projet réel copié dans un nouveau projet par défaut.
- `C:/Users/UP60066553/AppData/Local/npm-cache/_npx/ac0ed6aa23b37c1e/node_modules/skills/` : package1.7.4 Node>=22.20, dist/cli.mjs SHA256b7d92e2a619e8982d38390572750efb8c2ec81cdf23c33aed2fa426d080a1e4e ; package-lock voisin donne tarball skills-1.7.4.tgz/integrity. Source locale5062–5073 ; options5936–5993, Codex1573–1579, copies2230/2312/2401, lock5761–5775, télémétrie2808–2834. Invoker Node direct, local source, --agent codex --copy --yes et skills explicitement choisis, cwd=staging. Désactiver télémétrie et compile cache ; profiler les écritures lock/temp/cache et garder toutes les destinations dans des racines possédées. Ne pas appeler npx. Les flags inconnus sont ignorés, donc jamais --dry-run. Pas d’exports de l’API resolveSource/installSkills moderne. Si dépendances transitives requises, épingler les fichiers réellement requis, sans copier tout le cache npm ni installer de paquet.
- `src/adapters/bmad/runtime.ts` : bmadRuntime/verifyRuntimeFile/runtimeTreeFingerprint fournissent le runtime fermé existant. Réutiliser son admission exacte au besoin pour le Python de setup, sans modifier ses gardes, une préparation de runtime partagée par la courte campagne plutôt que répétition globale. Consigner version/exécutable/env réellement employés et droits de fermeture ; aucun changement de runtime produit. `py` est le lanceur Python local si un outil de qualification en a besoin, pas python.
- `src/adapters/bmad/profile.ts` et `src/adapters/bmad/context.ts`, `help.ts` : profil Mary et observations/roots explicites peuvent vérifier un résultat local si compatibles. Ne pas employer setup --status comme contrôle offline. Une vérification non compatible reste un refus/profil partiel ; setup_check/report qui supprime ses exceptions ne suffit pas à déclarer réussite. Inspecter aussi les références de chemins staging/source dans la sortie et les locks : aucun chemin temporaire expiré transféré silencieusement. Toute exclusion/représentation portable de reçu privé doit être explicitée et éprouvée dans le profil.
- `src/contracts/bmad-context.ts`, `src/core/bmad-context.ts` : identité physique/révision/sélection et capture/assertFresh de référence. `src/core/lifecycle.ts`, owned-run/help-owned-run et recovery : propriété/arrêt et inconnu durables restent aux propriétaires actuels. Banc de qualification seulement, pas nouveau contrat produit.
- `src/adapters/codex/file-proposals.ts`, `src/contracts/approvals.ts` : invariants de plan/précondition/relecture utiles, mais leur portée50fichiers/100000caractères et interdiction .agents/_bmad restent intactes ; ne pas en dériver une autorisation d’installation.
- `_bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation/` à créer : qualifier.mjs et éventuels helpers privés strictement nécessaires, profil-g3.md, manifeste/proofs courts et rapport final. Documentation officielle consultée : docs.bmad-method.org/start/install-bmad/ et customize/add-modules/ ; Skills docs/api.md/commands.md sur GitHubvercel-labs. Elles distinguent la voie v7 Skills+setup du vieux npx bmad-method v6.12 ; la documentation n’est pas un test du package installé.

## Tasks & Acceptance

**Execution:**
- [x] `qualification-initialisation/qualifier.mjs` — construire un banc fermé à ses fixtures/racines, sceller source/outillage/paramètres, refuser liens/effets hors portée, capturer avant/après et fermeture ; aucune recherche large ou dépendance produit nouvelle.
- [x] `qualification-initialisation/` — courte séquence locale I1–I6 : un positif natif utile, annulation/précondition/collision et source/output hostiles refusés sans exécuter la branche dangereuse ; garder les résultats exacts et la différence entre refus du banc et garantie d’outil. Pas de grands ensembles combinatoires ni comparaison de performance.
- [x] `qualification-initialisation/profil-g3.md` — présenter candidat, compétences/modules effectivement disponibles, plan de transfert précis, effets de staging/locks/cache, preuve de résultat, absence de transaction globale, conditions de refus et limites de portabilité/arrêt. Fournir les points réellement utilisables à Sally3.2/contrat3.3 ; aucun faux release/G3 final.
- [x] `qualification-initialisation/parent-verification.md` — matrice et preuves relues, fichiers produit/installateur/profil personnel préservés, copies possédées nettoyées après fermeture. Quick + audit indépendant du plan/portée/consentement simulé/effets/provenance ; commit local sans push. Aucun build/NSIS pour ce spike hors produit.

**Acceptance Criteria:**
- Given les outils locaux exacts, when le banc qualifie le candidat sur ses seuls témoins, then chaque capacité annoncée a une observation/source et chaque limite conserve son statut inconnu ou refusé ; aucun flag de simulation inventé.
- Given un plan et des sentinelles de cible capturés, when le banc annule ou observe une précondition différente, then aucun effet cible ne survient ; when il applique volontairement au témoin inchangé, then l’ensemble réellement installé et les effets indirects sont inventoriés/vérifiés sans perdre les sentinelles.
- Given les résultats et les limites de ce profil, when3.2/3.3 les consomment, then ils distinguent la qualification locale de l’installation produit et des validationsG3/G4/G5 restant ouvertes ; aucun projet du porteur n’a été initialisé.

## Implementation Notes

Parent Step3 : onze observations ciblées et six lignes de matrice rapprochées des commandes et arbres réellement conservés. Skills une fois, setup court réussi après trois refus Windows/garde documentés ; cinqenfants principaux fermés et toutescopies absentes.27compétences/3records,462fichiers/126répertoires transférés et deuxsentinelles exactes. Le scopefix de rapport externe ne rejoue aucun effet, contrôle syntaxe/lecture seulement ; manifests historiques préservés et attribution des wrappers explicitée par tentative.

Portabilité, relecture ciblée du source de setup : pour ce profil neuf/defaults/sans réponses, fill_team_config ne remplace que project_root.name ; stage_bmad écrit copies/scripts/config sans sérialiser la racine absolue, output_folder conserve le placeholder. L’ancien scan a vérifié owned/sourceBundle, pas explicitement la chaîne TempCourt. La conclusion d’absence de cette chaîne dépend donc aussi de cette génération statique bornée, et ne généralise ni payload arbitraire ni _bmad préexistant.

## Plan Change Log

## Review Triage Log

| ID | Verdict | Route | Vérification |
|---|---|---|---|
| Q1 | low | patch | Les reprises réécrivent tool-manifest-resume.json et exécutent une garde mutable : deux versions intermédiaires n’ont plus de hash/octets dans execution-seals. Perte réelle pour le développeur qui doit comprendre les refus Windows, observée ici ; le positif final est bien épinglé. Conserver à l’avenir snapshot/manifest uniques avant chaque enfant et exécuter le snapshot ; les deux anciens essais restent inconnus, sans reconstruction inventée ni requalification rétroactive. |

Audit indépendant high : aucun constat actionnable ; plan/résultat/préconditions/accord synthétique et cinqfermetures concordent, source/outils et imports cohérents, copies absentes. Aucun test/build/parcours natif lancé par les relecteurs. Q1 confié au même implémenteur, vérification courte fictive seulement ; ses lacunes historiques restent une limite explicite.

Q1 recontrôlé par son Quick original : resolved pour les futures tentatives, wrapper/config/manifest UUID archivés avant spawn et chemins liés. Test fictif1/1 en535ms, enfant code0/fermé et fixtures supprimées ; sceau courant séparé exact,52preuves historiques byte-identiques. Deux anciennes versions intermédiaires demeurent inconnues : aucune réparation ou qualification rétroactive. Audit high sans constat, aucun correctif courant différé.

## Design Notes

Un seul livrable : un profil d’initialisation défendable, pas un installateur produit ni une nouvelle UI. Risque high hérité et conservé. Route full car banc/profil/épreuves dépassent une maintenance mécanique. ParentSofia reste active sous mandat autonome ; questions techniques investiguées, aucune décision de besoin supplémentaire à demander. Checkpoints de plan/fin délégués, aucun seuil de tokens. Un seul Build produit ;2.15 est built/committé7cd785b et la préparation3.1 est ready/unassigned selon le vrai magasin, sans attente2.16. La voie produit3.3 attend toujours2.16 à ce stade ; ne pas effacer cette dépendance ni le gate humain3.10. Les campagnes longues sont dispensées explicitement : documenter ce qui n’est pas prouvé plutôt que bloquer le développement ou ajouter un benchmark.

Worker possède seulement qualification-initialisation/ ; parent seul plan/statuts/AGENTS/deferred/git. Tu n’es pas seul : préserver les changements d’autrui et le M/EOL-only tests/bmad-help-boundaries.test.mjs. Ne pas modifier .agents/_bmad/npm-cache ni les sources inspectées, ni refaire setup dans le vrai dépôt. Tout exec même read pwsh/login:false/workdir C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/require_escalated, py -X utf8, UTF8 explicite ; variables de tâche dédiées, aucune réaffectation de $HOME/$CODEX_HOME de la session. Toute isolation d’environnement est locale au sous-processus et justifiée par les écritures réellement vues dans le code. Pas de sous-Build/productionagent ni commit par worker.

## Verification

**Commands:**
- `node _bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation/qualifier.mjs` — scénario local borné et preuves par phase ; aucune commande distante/modèle/réseau ou grosse suite. Ne pas répéter ce scénario sans changement/échec réel ; cibler ensuite le cas affecté.
- Contrôle parent ciblé des hashs/profil/matrice/chemins et `git diff --check` sur les seuls fichiers du spike ; aucune exécution npm test/build/NSIS.

**Manual checks:**
- Lire l’écart plan/effets, distinguer source locale épinglée et provenance amont non établie, fichiers cibles et effets de staging ; vérifier que toutes les conclusions sont bornées à leurs commandes, octets et fixtures. Aucun effacement tant que processus/effets sont incertains.
