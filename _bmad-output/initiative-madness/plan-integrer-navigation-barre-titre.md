---
title: 'Aligner la navigation avec les contrôles Windows'
type: bugfix
ticket: ''
created: '2026-10-24'
status: built
baseline_revision: 'fe79000d809ec7445d710b2e999d73dc2937457c'
route: oneshot
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** le bouton de navigation est sous la barre native, alors que le porteur le demande sur la même ligne que réduire, agrandir/restaurer et fermer.

**Approche :** intégrer la barre d’actions existante à la barre de titre avec les contrôles Windows natifs. Réserver leur zone, rendre la partie libre déplaçable et conserver les boutons interactifs, l’ouverture de projet unique, le repli/tiroir et la saisie. Aucun nouveau pont ni effet fournisseur.

</frozen-after-approval>

## Implementation Notes

- Route oneshot : correctif local estimé à moins de 100 lignes de code, dans Main, CSS et banc Windows. Risque moyen : une région de déplacement mal définie pourrait masquer les commandes de fenêtre ou intercepter les clics. Demande explicite et mandat autonome déjà acquis ; fichiers non suivis préexistants préservés.
- Explorer en lecture seule : étendre `globalActions()` et le chemin `--ui-regressions-only` de `scripts/qualification/windows.mjs`. Les anciennes assertions pleine largeur doivent suivre le rectangle WCO disponible ; la fixture UI sans overlay ne suffit pas à prouver l’intégration native.
- Référence technique officielle Electron 45 : `titleBarStyle:hidden`, `titleBarOverlay`, variables CSS `titlebar-area-*`, `app-region:drag`/`no-drag`. Conserver la palette et les cibles 40 px ; garder une bande unique de 56 px, y compris en fenêtre étroite. Ne pas refaire les contrôles Windows en HTML.
- L’ancien build échoue sur `overlay.visible=false`, comme attendu. Le correctif intègre le header dans le rectangle disponible et conserve les contrôles Windows. Un second contrôle a montré le tiroir superposé sans exclusion de déplacement ; la règle no-drag inclut désormais dialogues et fonds modaux. Géométrie/actions réussies ; la réouverture a aussi révélé une course du banc, qui lisait les marqueurs avant le rendu de l’état restauré. Son attente vise désormais l’ouverture de projet réellement activée. La suite complète de 112 tests passe, puis les huit tests UI passent après la dernière règle CSS. Types et build réussis. Le paquet et la capture native restent à confirmer.
- Le paquet passe les cinq contrôles du banc ciblé et les six contrôles complémentaires de fenêtre native. La paire de captures native bureau/compact est inspectée : repli et contrôles système sont bien sur la même ligne, sans recouvrement. États agrandi/restauré et réduit/restauré exercés par API, saisie conservée et fermeture confirmée ; aucune action fournisseur. La mise à jour du profil personnel attend la fermeture humaine demandée par question asynchrone.

## Plan Change Log

## Review Triage Log

- Revue Quick : aucun constat correctif identifié. Aucune correction différée.

## Verification

- Régression avant correctif : le banc doit constater l’absence d’overlay sur l’ancien build.
- `npm run build` : types et compilation réussis.
- `node scripts/qualification/windows.mjs --ui-regressions-only` : géométrie native, boutons, repli/tiroir et brouillon aux largeurs 1320/600, puis réouverture sans agent.
- Même banc sur le paquet final via exécutable explicite ; capture native bureau/compact en une inspection groupée, au plus une confirmation si correction nécessaire.
- Revue Quick, paquet, installation locale après sauvegarde/fermeture de la fenêtre utilisateur, puis commit local sans push. Les preuves BMad/Codex précédentes restent historiques et ne sont pas réécrites.

Résultat technique : 112 tests, puis huit interactions UI après la dernière règle CSS, types/build/paquet, cinq contrôles compilés + cinq paquet et six contrôles natifs réussis. La capture groupée est inspectée ; aucune retouche supplémentaire ni correction différée. Le code est construit et relu. Le remplacement de l’installation personnelle reste en attente de la fermeture demandée au porteur ; ne pas présenter cette mise à jour comme déjà installée.

Clôture de livraison : le porteur confirme la fermeture. L’installateur vérifié a remplacé l’application ; l’archive installée correspond à la preuve native. Les quatre contrôles de `qualification-barre-titre/installation.json` confirment la barre native, le chargement du compte et des données, l’absence de dialogue relancé et le snapshot inchangé après réouverture. Madness est rouverte pour le porteur.
