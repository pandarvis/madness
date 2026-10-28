# Passage de l’epic1 à l’epic2

28octobre2026. **Epic1 clos techniquement ; epic2 préparé, première entrée2.1 prête, aucun Build2 lancé.** Cette réconciliation actualise le jalon de [préparation](../qualification-preparation/README.md) sans modifier ses reçus ni régénérer leurs empreintes.

La [relecture Closure indépendante](../../epic-boucle-codex/qualification-e2e/closure-review.md) rapproche les critères de fin, exigences, contraintes et companions de l’epic1 des preuves réelles. Son seul F1 documentaire est corrigé/recontrôlé. Le conteneur passe à `done` sous le mandat humain de finir l’epic et valider les étapes nécessaires. Ses douze plans gardent leur statut de réalisation `built` et leurs contrats historiques ; le script les projette en `review`. Cette projection n’invalide pas la clôture fondée sur les preuves et ne prétend pas enregistrer douze nouveaux accords humains. La voie distribuable1.1 reste `dropped`, selon la décision personnelle locale du porteur.

La refonte distincte est built dans5d135f9, après Sally, trois expertises UI/UX et Impeccable ; elle est maintenant installée avec compte/données conservés et huit contrôles de réouverture sans modèle. [Preuve d’installation](../../../ux-madness/qualification-refonte/installation/report.json), [verdict ciblé](../../../ux-madness/qualification-refonte/finish-verdict-q1.md) et contrats adoptés satisfont le prérequis documentaire de2.1. Son champ `unknown` est retiré avec décision datée dans les Notes. La qualification native G0/G1 reste attachée à son propre ASAR9249… ; elle n’est pas réattribuée à l’ASAR6664… de la refonte.

## Contrôles officiels

Les quatre commandes `uv run --no-cache C:/Sources/madness/.agents/skills/bmad-agent-po/scripts/tickets.py --project-root C:/Sources/madness …` ont réussi :

- [status initiative-madness](initiative-status.json) : quatre epics dans l’ordre approuvé, premier `done`, aucun conflit de dépendance.
- [status epic-boucle-codex](epic1-status.json) : treize entrées, une dropped et douze réalisations built projetées review ; aucune anomalie de référence ou dépendance.
- [status epic-projets-bmad](epic2-status.json) : dix-sept entrées planifiées, sans feuille ni plan ; aucun cycle, drift, prérequis non épinglé/non déclaré ou conflit d’ordre.
- [next epic-projets-bmad](epic2-next.json) : une seule entrée prête, **2.1 « Qualifier le profil BMad existant et les contrats de guidage »**, inassignée ; aucune entrée en cours. Les suivantes attendent leurs vrais prérequis.2.12 garde l’inconnue Q8/Q9.

Le [recontrôle Tree/Dependencies](review-tree.md) vérifie cette réconciliation documentaire. La couverture produit et le découpage approuvés ne changent pas : trente-deux exigences, quatre propriétaires epic, quinze exigences locales pour l’epic2 et dix-sept entrées dans leur ordre déjà relu. Aucune nouvelle story ou capacité n’est créée par un changement de statut.

## Suite BMad

Le prochain workflow est **`bmad-build` sur2.1** : qualifier le profil v7 existant et les primitives réellement prises en charge, avant l’aide native et le catalogue. Après ce résultat,2.17 fait définir les parcours par Sally, puis2.2 livre le tracer « projet existant → aide chargée → recommandation BMad native → conversation conservée ».

Q3/G2 et les mesures Q8/Q9 restent à instruire. L’epic2 garde aperçu/éditeur, variantes de langue et temps/coût par US ; initialisation et parcours humains G4 restent epic3, graphe Graphify/G5 epic4. Aucun autre fournisseur, Loop/Builder ou coût API appliqué à l’abonnement n’est intégré. L’appréciation visuelle du porteur et les futurs parcours humains ne sont pas déduits de la clôture technique.
