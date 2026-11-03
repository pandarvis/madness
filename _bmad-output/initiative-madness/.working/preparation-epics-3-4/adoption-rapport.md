# Adoption réelle Sofia des epics 3 et 4 — 3 novembre 2026

Les deux enveloppes réelles sont raffinées et leurs manifestes alloués sous le mandat autonome du porteur. Cette adoption remplace les propositions historiques de rapport.md sans les supprimer. Elle change la livraison et son ordre de consommation, aucun besoin. Aucun Build3/4, feuille, plan, staging, commit, installation BMad/Graphify, analyse ou contrôle du profil personnel n’est lancé.

## Sources et fichiers

Activation officielle bmad-agent-po : rendu réussi via _bmad/scripts/render_skill.py vers _bmad/render/bmad-agent-po/madness-bd8d4732aea7/ad129d551caca8e00228/workflow.md ; références spec/slice/replan/validate/validate-checks/board/ticket lues. SPEC emploie son cas de dérivation directe des seules lignes parent, sans nouveau memlog ni exigence.

| Fichier réel modifié | Résultat |
|---|---|
| _bmad-output/initiative-madness/tickets/epic-initialisation-bmad/epic-initialisation-bmad.md | refined:true ;3 Requirements R1–R3 reprennent mot pour mot parent R4/R23/R24 ; companions visuels/comportementaux/architecture et DESIGN racine adoptés sans modification |
| _bmad-output/initiative-madness/tickets/epic-initialisation-bmad/tickets/tickets.toml |10 entrées3.1–3.10 allouées ; aucun fichier de feuille/plan ;3.10 hitl=true |
| _bmad-output/initiative-madness/tickets/epic-graphe-projet/epic-graphe-projet.md | refined:true ;4 Requirements R1–R4 reprennent parent R28–R31 ; gate entier retiré, preuves finales conservées |
| _bmad-output/initiative-madness/tickets/epic-graphe-projet/tickets/tickets.toml |11 entrées4.1–4.11 allouées ; contrat/UX préparatoires indépendants bornés ; unique voie produit et qualification finale |
| _bmad-output/initiative-madness/tickets/tickets.toml | ids/ordre1–4/covers conservés ; capacités des vrais fournisseurs déclarées pour3/4 |
| _bmad-output/initiative-madness/initiative-madness.md | Notes seulement : Decision datée motive le REPLAN et confirme la zone réelle Graphe déjà prévue parR28–31 |

Les décisions historiques des enveloppes sont conservées ; leurs copies avant adoption, à empreintes exactes du workspace préalable, figurent dans epic-initialisation-bmad-before.md et epic-graphe-projet-before.md. historical-baseline-provenance.json démontre que les sources HEAD converties de LF à CRLF correspondent aux empreintes relevées avant édition. Le code, tests, ressources, AGENTS, plans construits ou2.4, runtime, comptes et profils ne sont pas écrits par cette tâche. Les changements concurrents sont laissés en place.

## Entrées et prérequis consommés

L’epic3 compte qualification de l’outillage1, Sally/Impeccable2, contrats3, tracer4, plans périmés/refus5, récupération6, paquet7, sweep8, G3/éditeur9 puis vraie participation G4 en10. 3.1 consomme1.11/2.1/2.3 ;3.2 attend aussi2.17/2.14 pour ordonner les écritures des spines ;3.3 attend2.16 avant la chaîne produit. Aucun report de2.16 ne vaut réussite ou capacité disponible.

L’epic4 compte qualification runtime/formats/confinement1, supplément UX Sally/Impeccable2, port/GraphSnapshot/validations isolés3, tracer intégré4, normalisation5, fraîcheur6, récupération7, exploration accessible8, paquet9, sweep10 et G5 final11. L’onglet réel du projet ouvert doit offrir recherche, zoom, relations et nœud vers fichier ; un placeholder ne satisfait pas cette version.

Le gate entier historique4→epic3/G4 empêchait jusqu’à une qualification Graphify indépendante quand un parcours humain était reporté. AD-10 distingue analyse et agent ; G4 est la preuve de livraison/parcours intégrés, alors que la base1.11 et le contexte2.3 sont construits. Le REPLAN adopté remplace ce gate par :
- 4.1 après1.11/2.3, sur espaces/témoins possédés seulement ;
- 4.2 après4.1/2.17, dans un supplément UX propre à l’epic4 sans éditer les spines partagés ;
- 4.3 après4.2, dans ses modules de contrat propres et testables sans modifier contrats existants, exports partagés ou branchements Main/preload/UI/persistance/lifecycle ;
- 4.4 après4.3/2.8/2.14/3.9, réconciliation des préparations et unique voie produit après fichiers/éditeur, variantes et initialisation locale stabilisée ;
- 4.11 après4.10/3.10, vraie base G4 exigée pour qualifier la livraison finale et clore le périmètre.

La matrice Dependencies propre est dans adoption-dependencies.md. Les préalables, propriétaires, effets/permissions, résultats inconnus et gates G3/G4/G5 ne sont pas allégés. Le seul besoin confirmé est déjà R28–R31, aucun nouvel id. Les spines restent valides et inchangés ; pas de conflit de source substantiel constaté par ce contrôle.

## Vérifications et reçus

Les six commandes réelles (argv complet, sortie brute et code0 dans adoption-verification.json et adoption-{status,next}-{folder}.json) sont :
```powershell
$projectRoot = 'C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness'
$ticketScript = "$projectRoot/.agents/skills/bmad-agent-po/scripts/tickets.py"
uv run $ticketScript --project-root $projectRoot status initiative-madness
uv run $ticketScript --project-root $projectRoot status epic-initialisation-bmad
uv run $ticketScript --project-root $projectRoot status epic-graphe-projet
uv run $ticketScript --project-root $projectRoot next initiative-madness
uv run $ticketScript --project-root $projectRoot next epic-initialisation-bmad
uv run $ticketScript --project-root $projectRoot next epic-graphe-projet
```

Le contrôle final à22:58UTC relève51 entrées au total, dont10/11 planifiées dans3/4, next_id11/12 ;7/7 lignes parent fidèles, couvertures3/3 et4/4 ; aucun lien local manquant. Checkpoints plan/done tous délégués ;3.10 seule hitl=true. Aucun problème, drift, unpinned_after, undeclared_after ou order_conflict dans les six commandes. Le graphe de dépendances ne comporte pas de cycle ; aucun after inverse3→4 introduit.

Le magasin propose3.1 et4.1 comme ready_to_start. Il propose aussi2.5 car l’état review satisfait sa règle de disponibilité ; cette sortie ne prouve pas la clôture2.4, dont le reçu conserve status=in-review. Aucun Build n’est déclenché par cette adoption et le parent garde sa revue2.4 séparée. Les anciennes states review des built du magasin ne sont pas réécrites.

git diff --check sur les seuls six fichiers possédés passe, avec les seuls avertissements de conversion LF/CRLF. Les fichiers sources et reçus conservent leurs accents Unicode (zéro caractère de remplacement dans le reçu d’initiative).

## Validation fraîche et limites

Validation indépendante fraîche Ticket/Set/Tree/Dependencies terminée par /root/sofia_adopt_epics34/validate_adoption34 : fix[], suggest[], ask[] restants. Le constat F1 (raison du risque high et contrôle indépendant supplémentaire manquants dans les Notes des deux enveloppes) est corrigé et recontrôlé résolu par le même relecteur. La précision du verify4.3 distingue aussi contrat restauré et preuve de restauration réelle4.7, sans changer les prérequis. Le relecteur a lu les sources et companions applicables, dont les deux DESIGN intégralement, EXPERIENCE et architecture ; il confirme dérivation, couverture, transferts et séquencement, sans qualification produit. Verdict complet dans adoption-fresh-validation.md. Aucun correctif restant ni report de revue. Le contrôle mécanique ne remplace pas cette relecture.

Graphify0.9.101/commit8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b reste un candidat documentaire, non qualifié ; le relevé d’architecture0.9.94 n’est pas promu ni remplacé. Aucun Graphify ni outillage d’initialisation BMad installé/exécuté. G3/G4/G5, novice réel, actions explicites et essais externes restent à effectuer sur leurs artefacts exacts ; cette adoption ne démontre aucun rendu intégré, performance, conformité WCAG ou accord visuel humain. Un essai bloqué conservera test, version/artefact, preuve, portée et condition de reprise, puis le travail indépendant continuera sans redemande routinière de clic Zscaler.



Parent, 4 novembre : deux lignes vides finales excédentaires des manifestes ont été retirées après le signal de git diff --check. Aucun champ ou prérequis modifié ; empreintes avant/après conservées dans le manifeste final, état du magasin recontrôlé identique.
