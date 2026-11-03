---
title: 'Garder les infobulles des projets au-dessus du contenu'
type: 'bugfix'
ticket: ''
created: '2026-11-03'
status: 'built'
baseline_revision: '011cd15bb6074c48ea494c5d0f48eb985fced96c'
route: 'oneshot'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Au survol des projets du menu compact, le libellé passe derrière la bannière et les onglets. Le nom complet du projet devient illisible.

**Approach:** Corriger l'ordre d'affichage du rail pour garder ses infobulles lisibles hors du menu, sous les panneaux et dialogues. Préserver la charte atelier, les dimensions, le défilement, les actions, le focus clavier et la fermeture par Échap, dans les deux thèmes et les modes compact/déployé.

</frozen-after-approval>

## Implementation Notes

Route oneshot : correction locale de couche CSS et contrôle de peinture dans le renderer existant, moins de100lignes produit/test prévues. Mandat autonome et correction UX explicite, sans nouvel entretien ni approbation intermédiaire. Le checkout contient seulement une différence préexistante de métadonnées/EOL sans diff de contenu sur tests/bmad-help-boundaries.test.mjs : conservée hors staging. Branche intégrée courante cohérente, baseline canonique capturée.

Cause inspectée : sidebar isolation:isolate sans priorité propre ; son pseudo-élément fixed/z80 reste enfermé dans sa couche, alors que la bannière/les onglets sont peints plus tard. Conserver le tooltip actuel et corriger l'élévation du parent seulement, sous topbar40 et panneaux70. Aucun connecteur, workflow, donnée/profil personnel ou réseau touché ; pas de nouvelle qualification fournisseur.

## Plan Change Log

## Review Triage Log

## Verification

Contrôle visuel ciblé du vrai App dans la fixture Electron isolée : survol de plusieurs projets sous bannière/onglets, deux thèmes ; sonde de peinture du pseudo-élément (pointer-events temporairement activé uniquement pour elementFromPoint), puis rendu normal capturé. Focus/Échap, labels déployés et panneau/dialogue prioritaires contrôlés. Rouge avant correction puis vert ; captures groupées au plus deux tours. Types/build et paquet corrigé si constitué, artefact2.2/M14 antérieur conservé sans succès transféré. Revue Quick et finition Impeccable sur la correction seulement, détecteur une fois. Commit local, sans push ni installation/fermeture personnelle forcée.


Correction produit : priorité du rail10, au-dessus du contenu ordinaire (dont les auteurs sticky2), sous barre40/panneaux70 et dialogues top-layer. Un seul changement CSS ; géométrie/charte et comportements inchangés. Le premier rendu corrigé a été inspecté à priorité1, puis élévation portée à10 par inspection de la couche des auteurs ; les PNG conservés sont explicitement ceux du premier correctif, pas des captures du CSS final. Le contrôle fonctionnel final utilise la priorité10 et sonde réellement la peinture. Pas de nouveaux tours visuels après les deux lots inspectés.

Limites du banc corrigées séparément : fenêtre synthétique cachée sans frame de capture (showInactive possédé), libellé réel Passer au thème, spécificité pointer-events du pseudo-élément (important de test seulement), focus-visible obtenu par de vraies touches Tab/Shift+Tab. Tous échecs conservés. Les anciennes sondes sans important sont exclues : seules les captures montrent alors le défaut ; nouveau rouge vérifié4/6occultés et vert6/6 devant. Les profils synthétiques sont fermés/contrôlés sans descendants puis supprimés ; aucun profil personnel ouvert par les tests.


Vérification finale : UI1 réussie sans skip, six sondes de peinture positives (trois projets/deux thèmes), nom long/focus clavier/Échap/menu déployé/panneau réellement chevauchant/dialogue testés ; aucun message/aide déclenché et fixture fermée sans descendant puis nettoyée. Rouge réel4/6 occultés à la baseline. Types/build passent. Détecteur unique : quatre avertissements sur des déclarations déjà présentes avant correctif, triage documenté sans changement de la charte. DOM/police/assets/copy/IPC/profils/connecteurs inchangés. Pas de nouvelle qualification réseau/modèle ni d'installation personnelle.


Revue Quick `/root/tooltip_projects_quick` : Q1 indique que le lien DESIGN.md vers le rapport ne peut pas être suivi, car le rapport prévu n'a pas encore été écrit. Constat vérifié ; correction documentaire directe : rapport ajouté à la cible exacte avec les preuves et limites, sans changement CSS supplémentaire. Recontrôle par le même relecteur demandé.

| ID | Verdict / route | Vérification et correction |
|---|---|---|
| Q1 | low / patch | Rapport cible absent lors de l'inspection ; fichier réellement créé au chemin annoncé, contenu lié aux tests/images/audit, recontrôlé résolu par le même Quick. |


Clôture : Quick recontrôle Q1 résolu, aucun constat restant. Paquet0.2.7 dist/tooltip-projects-reviewed-001 ASAR4bd0b04f8ee4cac3fb951920606da68c2e3aa38f159496aedfd001841d9a2aa2, non installé. Main/preload et13ressources natives identiques en octets à010 ;190inputs/19sorties/3artefacts contrôlés. Aucun correctif différé. Finition Impeccable locale au scope, pas de nouvelle validation humaine/WCAG ou de nouveau succès natif2.2 déduit. Plan built, commit local sans push.
