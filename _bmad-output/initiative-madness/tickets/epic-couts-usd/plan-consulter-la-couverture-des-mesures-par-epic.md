---
title: 'Consulter la couverture des mesures par epic'
type: 'feature'
created: '2026-11-06'
status: 'built'
baseline_revision: '21b3cb239acf019066ea97a4c7eca6865aad96e0'
route: 'oneshot'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L’epic des coûts doit rendre la couverture du travail observable dès maintenant. Le registre existant expose déjà chaque US et le résultat local, mais le lecteur ne voit pas encore le regroupement par epic historique ni la réception d’une preuve d’usage.

**Approach:** Dans le registre du projet, afficher les tours rattachés à un dossier d’epic historique et le nombre de ces tours avec un échantillon d’usage non ambigu. Dans les détails de tour, distinguer cet échantillon d’un total par tour et d’un montant facturé. L’absence d’un coût reste visible. Un groupe ne remplace pas la sélection par US. FR/EN, sans nouvelle navigation, commande, couleur ni état persistant.

Le regroupement s’appuie sur les observations dédupliquées et le rattachement figé dans le tour. Des tours appartenant à des initiatives ou racines différentes restent séparés. L’initiative seule, les observations sans membres, et une attribution contradictoire ne deviennent pas des epics. La portée historique est le chemin BMad enregistré, pas une preuve de continuité physique du dossier. Les échantillons absents ou contradictoires restent sans preuve. Les totaux USD et la qualification native restent dans les tickets 5.2 et 5.3.

</frozen-after-approval>

## Implementation Notes

- Sally résolue sur initiative-madness et consultation des règles de registre de 2.12. Préserver la sélection et le détail existants. Impeccable Operate sur ProjectResume, texte neutre et divulgation native, sans actif ni nouvelle primitive.
- Le plan consomme le trajet d’observation de 5.1. Il livre un regroupement de couverture, sans satisfaire la présentation d’un coût USD de 5.3.

## Plan Change Log

## Review Triage Log

- Quick, un constat corrigé : le détail nomme les champs reçus « last » et « total » sans les présenter comme des montants ni comme un usage total par tour. Libellés français et anglais vérifiés dans Electron.
- Sept contrôles Electron de développement, profil synthétique fermé et nettoyé. Détecteur Impeccable vide. Aucun exécutable de distribution créé.

## Verification

- node --test tests/us-metrics-ui-copy.test.mjs tests/us-metrics-epic-usage.test.mjs
- npm run typecheck
