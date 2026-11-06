---
title: 'Éviter la seconde copie de l’export Graphify à chaque génération'
type: 'bugfix'
ticket: ''
created: '2026-11-06'
status: 'built'
baseline_revision: '0816ac62a5e2390bdad67603840c0773e42baf2c'
route: 'full'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Une génération Graphify matérialise deux fois les mêmes octets de graphe natif. Transmettre à Main l’export déjà écrit par Graphify via le lanceur, puis conserver cet export et la preuve d’arrêt sur disque. Le graphe normalisé, ses relations, l’aperçu des originaux et la réouverture doivent rester utilisables.

## Boundaries & Constraints

**Always:** Garder les contrôles natifs du chemin et de l’identité du fichier, la borne de 16 Mio, la corrélation de génération et la preuve terminale avant normalisation. Un défaut de transport reste un échec de l’analyse et conserve l’export original.
**Never:** Aucun retrait de dossier existant ni changement de portée de la capture. Le retrait physique du miroir, des caches tiers et de l’export restant conserve son propre plan de rétention.

## I/O & Edge-Case Matrix

| Situation | Entrée | Résultat |
|---|---|---|
| Génération valide | Export Graphify valide et arrêt confirmé | Graphe normalisé à partir des octets exacts, empreinte égale à celle de l’export sur disque, copie native du lanceur absente |
| Canal invalide | Trame tronquée, surdimensionnée, étrangère, empreinte différente ou données supplémentaires | Refus avant normalisation, export conservé |
| Comparaison ou arrêt échoué | Échec du deuxième enfant ou preuve d’arrêt inconnue | Pas de graphe publié à partir du flux. Terminal et état d’arrêt restent exacts |

</frozen-after-approval>

## Code Map

- `resources/graphify/preflight.ps1` — réutiliser la lecture fermée de `GraphClosedRuntime.CopyArtifact`. Lire exactement le fichier sous le descripteur avant la comparaison finale, avec les contrôles d’ancêtres et d’identité existants. Remplacer la copie par un tableau borné. Avant tout lancement de Python, rendre le handle stdout du lanceur non héritable et vérifier le résultat, puisque `supervision.ps1` lance les enfants avec héritage et leurs propres flux.
- `resources/graphify/launcher.ps1` — après la comparaison terminale et son reçu, transmettre la trame sur stdout binaire privé. Préserver le marqueur terminal et son agrégation dans finally, les bornes temporelles et la disposition pour les autres opérations.
- `src/adapters/analysis/graphify.ts` — collecter stdout seulement pour l’analyse, borner sans cesser de drainer. Lire après fermeture et `owner.confirm`, conserver stderr et les refus. Vérifier magic, génération exacte, longueur annoncée (entier 32 bits, endian convenu), SHA-256 sur octets, intégralité et absence de supplément. Passer le Buffer au normaliseur, jamais un chemin non vérifié. Aucun résultat d’un autre op ne doit être interprété comme trame. Garder les règles de timeout, d’arrêt tardif et de réconciliation.
- `src/adapters/analysis/graphify-manifest.ts` — resceler les seules ressources modifiées et vérifier leurs empreintes brutes.
- `tests/graphify-supervision.test.mjs` et `tests/graphify-timeout.test.mjs` — adapter les témoins actuels de faux enfants et ajouter les régressions nécessaires à la trame. Tester le second enfant réel du banc, le refus et le cas positif. Vérifier le handle de publication non héritable et l’absence de mélange entre les flux du worker et du lanceur.
- `scripts/qualification/graph-project.mjs` — adapter le banc courant pour consigner les octets logiques évités depuis l’export Graphify restant, vérifier son SHA contre la provenance et l’absence de la copie. Garder les anciens témoins historiques intacts.
- Propriété de ce lot — ressources et adaptateur Graphify indiqués, leurs tests directs et le banc courant. D’autres tâches peuvent être présentes dans le dépôt. Préserver tous leurs fichiers et la variation EOL préexistante. Aucun paquet, compte, profil personnel ou commit par l’implémenteur. Le parent écrit le statut du plan.

## Tasks & Acceptance

- [x] Écrire une régression rouge de trame et de flux natif. Implémenter le canal et comparer les octets exacts à ceux de l’export.
- [x] Vérifier l’absence de copie et la non-publication en cas de refus, d’échec ou d’arrêt non prouvé. Garder les preuves après la sauvegarde.
- [x] Rejouer uniquement les suites ciblées, typecheck et, si rapide, une génération locale sur petit témoin sans compte ni réseau. Nettoyer le profil témoin uniquement après arrêt confirmé.

## Implementation Notes

Premier lot issu du plan de rétention. Évite un volume égal à l’export natif à chaque génération, avec une borne de 16 Mio. Le répertoire du moteur conserve l’original. Ce gain est distinct du nettoyage automatique des miroirs et de la preuve de retrait sur NTFS.

Le témoin Windows a sauvegardé et rouvert un graphe de 5 nœuds et 7 relations. L’unique export fait 2 503 octets et son empreinte correspond à celle du graphe sauvegardé. La fermeture est confirmée et le profil a été retiré. [Reçu final](tickets/epic-graphe-projet/qualification-paquet-graphe/native-no-copy-small-2026-11-06-final.json).

## Plan Change Log

- La lecture sous descripteur conserve maintenant le fichier et ses dossiers parents jusqu’à la publication.
- La preuve de Job vide précède le transfert et le reçu final est publié atomiquement après celui-ci. Main conserve la barrière jusqu’à la fermeture observée. Le délai annule et ferme le canal avec une attente de cinq secondes. Le lanceur reste responsable de l’arrêt du Job.
- Le banc Electron vérifie la sauvegarde du graphe exact, l’empreinte de l’export et la réouverture. Son contrôle de syntaxe passe. Le témoin Windows direct couvre cette persistance et la réouverture sans interface Electron.

## Review Triage Log

- Q1 moyen, corrigé. Une écriture ou un renommage de l’export et un renommage d’ancêtre sont maintenant refusés par Windows pendant le second enfant. La trame transporte les octets exacts de l’export détenu.
- Q2 élevé, corrigé. La preuve de Job vide ne débloque pas le lanceur actif. La première tentative de correction a été remplacée après revue. Le délai ne termine aucun processus et Main ne publie aucun reçu de repli. Les trois régressions prouvent la fermeture normale, la fermeture tardive et la conservation de l’inconnu sans reçu final. Résolu par le même relecteur.
- Q3 moyen, corrigé. Le contrôle de l’export attend la sauvegarde du premier graphe et la réouverture compare l’état réellement conservé. Le témoin local a couvert l’empreinte après sauvegarde et la relecture sans relance.

## Verification

54 contrôles ciblés de supervision, délai, normalisation, coordination et récupération passent. Après le dernier durcissement du délai, la régression Windows ciblée et le typecheck repassent. Les ressources natives gardent les empreintes utilisées par le témoin final. Le paquet 0.2.22 existant reste le paquet vérifié précédemment.
