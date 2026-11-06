---
title: "Explorer le graphe et ses relations au clavier dans les variantes"
type: 'bugfix'
ticket: 8
created: '2026-11-06'
status: 'built'
baseline_revision: '7b1f5cda58c804327b093e73df58c75d7f430b66'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="mandat autonome, contrat Sally et direction Atelier adoptés">

## Intent

**Problem:** Atteindre une borne de zoom peut faire perdre le focus clavier. Lors d'un retour d'aperçu, un bouton réutilisé peut pointer vers une autre référence. Un lien de boucle est décrit uniquement comme entrant.

**Approach:** Conserver le focus aux bornes et expliquer la limite dans le statut. Offrir le déplacement au clavier dans la représentation focalisée, sans intercepter les champs ni les raccourcis de fenêtre. Rendre le déclencheur de fichier exact au projet, à la révision, à la source et à l'élément, avec repli au titre des résultats. Décrire les relations sur un même élément dans les deux langues. Réutiliser l'identité, les commandes, la liste équivalente et les thèmes de l'Atelier.

</frozen-after-approval>

## Implementation Notes

Impeccable context chargé sur GraphPanel. Mode Operate, durcissement du parcours existant. Les essais ciblés réutilisent le moteur de rendu local et ses témoins sans appel à Graphify ou au fournisseur.

Les boutons de zoom gardent leur place dans l'ordre clavier aux limites. Le statut explique la limite, et les flèches ne se déclenchent que sur le dessin focalisé. La région interactive a un nom distinct. L'aperçu garde le bouton propre à l'élément et au snapshot, et cible le titre des résultats si ce bouton disparaît. Les boucles sont décrites explicitement. Détecteur Impeccable unique sans constat, avant ajustement du seul nom accessible du dessin révélé par le banc.

## Plan Change Log

## Review Triage Log

- Q1 et Q4 — réels, patch commun : le titre des résultats garde un identifiant stable après remontage et la fermeture applique la même restitution que le témoin Electron. Le test vérifie l'élément qui reçoit effectivement le focus.
- Q2 — réel, patch : la face neutre persiste au survol à la borne même si le bouton garde le focus.
- Q3 — réel, patch : les sélecteurs clavier ciblent la liste. La boucle n'offre plus de bouton vers l'élément déjà sélectionné.
- Contrôle parent : le témoin à 200 % a révélé un débordement avec un libellé long. Autoriser le retour à la ligne sur le titre et les actions de relation.

- Les quatre constats confirmés résolus par le même relecteur. Son recontrôle a repéré le fragment du lien vers la liste. Il cible maintenant le même titre stable, et le test vérifie le fragment et son focus.

## Verification

- Contrôles Electron groupés : focus et bornes, clavier dans le dessin, aucune action externe, résultat et recherche préservés, relation et provenance, déclencheur de fichier et repli. FR/EN, clair/sombre et zoom application 200 % avec un nom long dans le banc local.
- TypeScript et détecteur Impeccable sur les changements. Aucun audit exhaustif WCAG ni campagne native longue.

Parent : le second parcours Electron existant est passé au premier lot. Le parcours modifié passe sur le diff final, avec focus à la borne et au retour d'aperçu, déplacement clavier, libellés FR/EN, thèmes et zoom Chromium réel 200 % avec mouvement réduit et nom long. Le témoin fichier exerce le helper du produit avec un contexte simulé, sans nouvelle ouverture de fichier par le moteur ni certification WCAG. TypeScript réussi. Aucun nouveau paquet à cette étape.
