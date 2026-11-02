---
title: 'Définir avec Sally les parcours de guidage et de fichiers'
type: 'chore'
ticket: '17'
created: '2026-11-02'
status: 'built'
baseline_revision: 'bf3e8a78282e44ba41d0cfee69e11715be424a30'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/epic-projets-bmad.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2/profil-g2.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/.memlog.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le profil 2.1 distingue les capacités et preuves réellement qualifiées ; les contrats UX précédents laissent encore ouvertes les interactions de guidage, catalogue, initiatives et fichiers. L'implémenteur du tracer pourrait confondre aide chargée et recommandation native, ou rendre lançable une compétence seulement descriptive.

**Approach:** Sally complète les deux contrats adoptés avec Impeccable, selon le profil G2 candidat. Fournir aux stories 2.2–2.9 les destinations, transitions, états, formulations FR/EN et références de vérification, en conservant la composition et les deux thèmes existants.

## Boundaries & Constraints

**Always:** Windows personnel, Electron/React/TypeScript, Codex/SIWC inchangés ; UX explicable pour le porteur découvrant BMad. Projet, initiative capturée, conversation, réponse active et brouillons conservés pendant navigation/refus/rafraîchissement. Distinguer actif BMad/sélection Madness, fait/déduction/proposition/acceptation et descriptif/copiable/lançable. Nommer provenance, couverture, révision et indisponibilités. Invocations `$<nom-dossier>`, chemins, contenus et identifiants ne sont pas traduits. Opérations sensibles textuelles, contrôles compacts accessibles et retour de focus. Spines canoniques et tokens existants conservés ; les décisions sous mandat ne deviennent pas un accord visuel humain.

**Never:** Modifier le produit, dépendances, managed skills, architecture, initialisation, graphe, mesures Q8/Q9/R32 ou profils personnels ; installer, lancer modèle/réseau/agent de projet, requalifier 2.1 ou rouvrir epic1. Aucune compatibilité du seul numéro v7, séquence BMad obligatoire, quota catalogue, réinitialisation/réparation implicite, synchronisation de conversations externes ou succès éditeur inventé. Aucun nouveau monde visuel, prototype produit ou capture personnelle.

</frozen-after-approval>

## Code Map

- [Epic](../epic-projets-bmad.md) : entrée17 medium, sans checkpoint humain ; après1 et1.11, avant2 puis3–9. Les17entrées et l'ordre restent stables. Ce Build ne modifie ni tickets.toml ni feuilles.
- [Profil qualifié](../qualification-profil-g2/profil-g2.md) : états/capacités, racines/fraîcheur et huit contrats documentaires. Le candidat finald499… est partiel ; aide lisible indépendante, recommandation native et exécution générale non qualifiées. Respecter ce fait dans les formulations courantes/futures.
- [DESIGN](../../../ux-madness/DESIGN.md) : YAML tokens et spine Google existants ; palette sombre terracotta/bleu, clair, Segoe UI, titlebar56, SVG19/cibles40/axe28. Étendre seulement sections de composition et composants nécessaires, sans refonte/token nouveau non nécessaire.
- [EXPERIENCE](../../../ux-madness/EXPERIENCE.md) : huit sections canoniques puis inspiration/responsive ; IA et composants actuels distinguent livré/historique/futur mais laissent le choix d'initiative et le guidage à définir. Actualiser ces phrases quand le contrat les ferme, tout en conservant leur statut non livré. L'epic1 techniquement clos et la refonte livrée ne sont plus présentés comme travail en attente ; leur acceptation visuelle reste inconnue.
- `.agents/skills/bmad-agent-ux-designer/SKILL.md` : Sally a été activée par le parent, bloc résolu et configuration chargée, sans prepend/append/faits. Travailler comme contribution de Sally, pas comme une nouvelle acceptation humaine.
- `.agents/skills/bmad-ux/SKILL.md`, `references/headless.md` : exécuter Update, appelé depuis ce Build (headless), workspace existant `ux-madness`. Lire les deux spines et memlog entièrement. Utiliser les exemples/spécification et Pass1 de couverture prescrits ; journaliser via `_bmad/scripts/memlog.py append`, jamais éditer le journal manuellement. Parent a résolu la personnalisation : exemples design mobile/shadcn/editorial, expérience mobile/shadcn ; doc_standards `skill:bmad-review lenses=structure,prose`, pas de handoff externe ni activation supplémentaire. Ces relectures seront conduites par le parent après le diff.
- Impeccable4.3.1 : parent a chargé context une fois, références shape/operate lues. Mode Operate, autorité visuelle des spines/refonte, compléments de comportement seulement. L'entretien est délégué par le mandat explicite, décisions du concepteur signalées. Creative tools désactivés pour cet Update headless ; références textuelles/spine-only, aucune nouvelle UI à inspecter/détecter. Un ancien surface-brief orphelin du prototype est historique ; ne pas le réparer dans ce lot ni lui attribuer une autorité sur le renderer.

## Tasks & Acceptance

**Execution:**
- [x] `ux-madness/.memlog.md` via memlog.py — enregistrer l'Update de Sally sous mandat, sources2.1 et choix de conception délégués, sans inventer des validations du porteur.
- [x] `ux-madness/EXPERIENCE.md` — compléter IA, composants, états, clavier/focus, voix FR/EN, responsive et parcours : ouvrir/diagnostiquer ; Que faire ensuite→aides réellement chargées→Conversation→réponse native et alternatives ; catalogue/recherche/fiche/copier/lancement conditionnel ; choix d'initiative avec conflit ; preuves actualisées ; aperçu/agrandissement/éditeur ; accueil multi-projet. Attente, refus, périmé, interruption, sauvegarde échouée et retour au travail sont définis pour chaque destination concernée.
- [x] `ux-madness/DESIGN.md` — apparier les composants et hiérarchie aux nouveaux contrats sans changer les tokens, palette et chrome. Définir densité, texte long, provenance lisible, sélection et états non fondés sur la seule couleur.
- [x] `ux-madness/guidage-epic2/contrats-et-couverture.md` — référencer les sections normatives, Pass1, les sept parcours, leurs cas d'échec, clavier/zoom, conservation et textes FR/EN ; consommateurs2.2–2.9 identifiables. Expliquer le statut spine-only et les limites de preuve. Pas de copie concurrente des spines.
- [x] `ux-madness/guidage-epic2/update-result.json` — résultat headless Update, décisions de conception sous mandat, conflits traités, hypothèses et questions restantes honnêtes ; aucune mesure/réussite native/validation humaine nouvelle.

**Acceptance Criteria:**
- Given le profil 2.1 partiel, when le porteur cherche sa prochaine action, then le contrat conserve l'aide réellement chargée distincte de la réponse native et explique les capacités manquantes sans présenter une copie de commande comme lançable.
- Given un contexte et une saisie, when il change projet/initiative/onglet, ouvre une preuve ou revient d'un refus, then la destination et le focus sont définis et les anciens échanges ne sont ni déplacés ni repris.
- Given les parcours de2.2–2.9, when un développeur les lit, then leurs surfaces, états d'attente/erreur, sorties et retours sont tous référencés, avec libellés FR/EN, clavier/zoom et deux thèmes, sans nouvelle UX à inventer pour leurs choix essentiels.
- Given les contrats adoptés, when cet Update est rapproché de la baseline, then spines et tokens restent compatibles, contraintes de sécurité lisibles, aucun code produit/managed/profil personnel modifié et aucune validation humaine/intégration déduite des seuls documents.

## Implementation Notes

2026-11-02 — Plan approuvé sous le mandat humain explicite de full autonomie ; pas de checkpoint routinier ajouté. Arbre suivi propre à la baseline ; fichiers non suivis préexistants de skills/caches/.working exclus de ce lot. Route full pour cette extension documentaire cohérente de plusieurs parcours (>100lignes attendues), risque medium d'ambiguïté dans les consommateurs. Aucun nouveau choix produit ouvert ; les décisions de conception restant au concepteur seront nommées comme telles. Le worker possède uniquement les deux spines, le memlog via script et guidage-epic2 ; il n'est pas seul dans le dépôt, ne révoque/revert pas les changements d'autrui et adapte son travail aux autres éditions. Il peut cocher ces tâches et ajouter ses notes sans modifier le bloc figé, baseline ou statut. Parent possède statut, revues, vérification et commit.

## Plan Change Log

2026-11-02 — Production documentaire terminée : sept parcours dans EXPERIENCE, composants visuels appariés dans DESIGN, index Pass1 et résultat headless. Trois entrées officielles memlog.py (34–36) tracent changement, choix délégués et réconciliation historique. Contrôle de production : tokens identiques à la baseline, spines/ordre conservés,26composants,71références de tokens,60liens locaux/ancres, sept parcours et neuf fichiers visuels historiques ; JSON valide et diff suivi sans erreur d’espacement. Revues UX/Quick/structure/prose, finalisation du journal et vérification indépendante restent au parent ; aucun statut, bloc figé, code produit ou profil personnel modifié par le worker.

## Review Triage Log

2026-11-02 — Quick/cohérence et standards bmad-review structure puis prose terminés. Aucun high, un medium Quick et cinq corrections éditoriales directes ; aucune correction différée, aucune replanification. Les relectures portent sur les documents, aucun gate natif ou visuel acquis.

| Constat | Verdict / suite | Preuve et résolution |
|---|---|---|
| Q1 fiche : Lancer contre Préparer | medium / patch résolu | Contradiction confirmée entre DESIGN Components et EXPERIENCE composant/parcours3. Même worker aligne la fiche sur préparation, sans envoi direct ; même Quick recontrôle : « Q1 résolu. » |
| S1 emplacement connexion/réseau | déplacement éditorial direct appliqué | Deux paragraphes déplacés sous Component Patterns, texte comparé identique à la baseline ; protections conservées. |
| P1 négation accueil vide | correction rédactionnelle appliquée | Absence d’attente ne signifie pas livrables validés ; formulation exacte contrôlée. |
| P2 refresh anglais | correction rédactionnelle appliquée | Diagnostic out of date — refresh required ; actualisation distinguée de relecture humaine. |
| P3 demande éditeur anglaise | correction rédactionnelle appliquée | Objet de la demande explicite, aucune nouvelle réussite annoncée. |
| P4 répétition reçu reçu | correction rédactionnelle appliquée | Reçu natif distingué de conservation locale non confirmée. |

Instruction positive Structure PRESERVE conservée : distinctions nécessaires reprises au point de consultation, aucun objectif arbitraire de longueur. Détails dans guidage-epic2/revues.md sous ux-madness.

## Verification

- Parent final : six groupes de tokens identiques,26composants appariés,71références distinctes/94occurrences résolues,60liens locaux existants et aucun lien cassé. Deux paragraphes déplacés identiques, quatre corrections exactes vérifiées, spines ordonnés et scope produit intact. Q1 recontrôlé résolu par son auteur ; bloc figé conservé. Journal officiel finalisé via memlog.py, entrées37/38. Rapport guidage-epic2/parent-verification.md ; aucun test produit, build/installateur ou réseau nécessaire.
- Le porteur signale une refonte UI parallèle à intégrer ensuite : préserver ses travaux et réconcilier les règles de comportement lors de son intégration. Aucun rendu futur accepté par cette clôture.

- Inspection documentaire réelle de chaque parcours et contre-exemple du profil2.1, avec correspondances dans contrats-et-couverture.md ; aucune suite de tests artificielle pour ces seuls documents.
- Vérifier les spines/ordre/tokens et composants appariés, les liens locaux ajoutés et préexistants touchés, les entrées de journal via le script officiel, et le diff complet depuis la baseline. Conservation des tokens YAML vérifiée indépendamment.
- Revue Quick du Build et revue de cohérence UX + standards structure/prose autorisés par bmad-ux ; résoudre les vrais constats puis recontrôler leur portée. Ne pas appeler le worker technique un nouveau persona BMad.
- `git diff --check` sur le lot ; aucun build/installateur, fournisseur, test2.1 ou profil personnel nécessaire. Commit local ciblé, aucun push. Ensuite2.2 seulement après clôture de17.
