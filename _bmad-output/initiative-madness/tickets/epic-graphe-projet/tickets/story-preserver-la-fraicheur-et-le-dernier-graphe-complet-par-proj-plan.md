---
title: "Préserver la fraîcheur et le dernier graphe complet par projet"
type: 'bugfix'
ticket: 6
created: '2026-11-06'
status: 'built'
baseline_revision: 'e9aa3ac6681ddf9a6e88a5766dc5c292df0e27aa'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 2
context: []
---

<frozen-after-approval reason="mandat autonome, ticket 4.6 raffiné">

## Intent

**Problem:** Une nouvelle capture peut établir que le graphe précédent est ancien alors que l'état publié le présente encore comme vérifié. Les boutons de fichier peuvent survivre à la révocation de leur autorité, et la réouverture peut perdre la trace d'une mutation déjà constatée.

**Approach:** Faire suivre l'état de fraîcheur par révision effectivement consultée. Révoquer en même temps l'autorité et les liens de fichiers du projet, puis les rétablir après résultat admis et comparaison finale. Préserver le dernier complet de la même portée lorsqu'une analyse est modifiée, partielle ou en échec. La réouverture reste passive, sans revalidation ni changement de projet implicite. Garder les commandes d'arrêt et les règles de persistance existantes pour la suite 4.7.

</frozen-after-approval>

## Implementation Notes

Réutiliser les révisions de corpus du runtime, le réducteur GraphState, la portée exacte du contrat et la persistance annexe. Dans GraphPanel, la date de comparaison doit appartenir au snapshot consulté.

Le coordinateur retire les autorisations et les boutons ensemble pour le seul projet concerné. Le réducteur conserve le changement attesté de la révision jusqu'à l'arrêt et à la réouverture, et garde le précédent complet. Une revalidation sous un profil différent refuse de lire ou d'accorder les sources. L'interface relie état et date au graphe affiché.

## Plan Change Log

## Review Triage Log

- Q1 — réel, patch : l'écart prouvé par revalidation est conservé dans l'annexe à la date de sa capture.
- Q2 — réel, patch : l'écart du complet conservé reste explicite malgré un partiel ou un échec. La consultation historique n'emprunte pas la date d'une autre révision.
- Q3 — réel, patch : même si la deuxième garde refuse le lancement, l'écart déjà capturé est publié, les liens sont révoqués et le constat est conservé.
- Q4 et Q5 — réels, patch commun : une interruption reçoit le constat terminal de mutation si disponible. Aucun résultat tardif ni lien n'est admis après la demande et la preuve d'arrêt reste traitée. Deux témoins courts, adaptateur et coordinateur.

- Le même relecteur a confirmé Q1/Q4/Q5 au premier retour et Q2/Q3 après ajout des cas même révision et racine remplacée. Aucun correctif de cette revue différé.

## Verification

- Deux projets, changement de révision avant génération, mutation pendant l'analyse, préservation du dernier complet et réouverture passive dans le banc du coordinateur. Refus de réassocier une autorité avec un autre profil.
- Tests de transitions, corpus local avec sources non suivies, réouverture annexe, contrôle Electron ciblé de l'affichage et types. Les doubles d'analyse vérifient le comportement du produit, sans campagne native longue.

Vérification parent : 100 tests ciblés dont quatre contrôles courts du corpus Windows lors du premier passage. Après Quick, 100 ciblés hors corpus, deux cas de seconde garde rejoués après paramétrage du témoin et un cas Electron dans les deux variantes de révision. TypeScript réussit. Les deux projets et l'analyse sont simulés dans le banc coordinateur. Aucun paquet ni G5 final.
