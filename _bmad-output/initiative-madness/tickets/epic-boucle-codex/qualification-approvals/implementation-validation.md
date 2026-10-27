# Story 1.6 — vérification de l’implémentation

Mesures locales du 27 octobre 2026. Implémentation technique unique, sans compte ni fournisseur externe. Les revues indépendantes, le parcours avec modèle réel et l’installation appartiennent au passage parent et ne sont pas acquis par ce rapport. `protocol-*`, les gates antérieurs et Snapshot v1 sont préservés.

## Changements livrés

- Contrat strict `approvals.ts`, mode Mary capturé au lancement, décisions ponctuelles, transmission et effets distincts ; aucun ID natif exposé par le port.
- `file-proposals.ts` : portée intégrale add/update/delete, chemins canoniques/protégés, snapshots des octets/existences, diff vérifié, préconditions avant décision et effets relus.
- Protocole natif on-request en read-only, shell désactivé ; jointure item/demande décalés, RPC zéro/string conservés, aucune permission de session, commande ou feedback inventé.
- Coordinateur avec verrou avant await, conservation avant émission, annexe atomique `approvals-v1`, ajustement séparé et nouveau tour explicite ; restauration historique inactive et incertitudes préservées.
- Pont Main/preload strict et panneau inline de portée complète, accord/refus du patch entier, échéance locale annoncée, saisie indépendante et preuve d’effet distincte. Documentation et banc compilé/paquet ajoutés.

## Matrice du plan et tests exacts réussis

Tous ces tests sont exécutés par `npm test`, sauf mention du banc isolé. Les fichiers sont `tests/approvals.test.mjs`, `tests/approvals-protocol.test.mjs` et `tests/connection-ui.test.mjs`.

| Ligne du plan | Tests réellement exécutés et réussis |
| --- | --- |
| Portée add/update/delete et patch entier | `patch mixte : tous les contenus natifs, empreintes et effets ; précondition modifiée refuse tout` ; `hors projet, protégé, déplacement, portée inconnue et diff incomplet sont refusés` ; `approbation stricte : aucun accord global, ID natif, feedback ou champ inconnu` ; `approbation expose tout le patch sans choix présélectionné et sépare refus, ajustement et nouvel envoi` |
| Décision, double clic et reçu retardé | `approbation RPC zéro et proposition décalée : seul résultat natif et octets prouvent l’effet` ; `décision verrouillée avant await, transmission distincte des effets puis ajustement explicite` ; `deux patches rapprochés du même fichier demandent deux choix sans étendre le premier accord` ; `bornes natives et aucune autorisation tardive : string-id` |
| Ajustement séparé, refus puis nouveau tour | `décision verrouillée avant await, transmission distincte des effets puis ajustement explicite` (inclut refus de texte vide, aucune émission au simple save, nouveau tour explicite et gel du texte déjà envoyé) ; `approbation expose tout le patch sans choix présélectionné et sépare refus, ajustement et nouvel envoi` ; banc : `real-bridge-rejects-historical-global-and-implicit-adjustment` |
| Invalidation : terminal, file, échéance, arrêt et modification | `le terminal retire l’approbation encore en file derrière un outil avant le drain` (inclut zéro choix/réponse et un tour suivant silencieux réellement interrompu par son délai machine de 80 ms) ; `le délai local dix minutes retire une commande sans choix implicite (horloge contrôlée)` (Date + setTimeout contrôlés, tick 600001 ms, invalidation autonome puis refus du choix tardif) ; `bornes natives et aucune autorisation tardive : terminal` ; `bornes natives et aucune autorisation tardive : changed` ; `une proposition native changée après affichage retire le consentement sans effet` ; `arrêt pendant sauvegarde retire la commande et conserve la saisie sans transmission` (inclut également changement du projet actif, retrait et zéro décision native) |
| Conservation : disque refusé et réouverture sans moteur | `annexe approbation atomique conserve conflit/version inconnue et toutes les saisies` ; `un reçu conservé attend le résultat, et un refus disque ultérieur reste inconnu` ; `restauration sans moteur garde un accord incertain et retire toute commande` ; `la restauration d’un effet connu garde la preuve tout en retirant tous les choix` ; banc : `exact-reopen-annex-snapshot-and-project-no-engine-network-or-replay` |

Autres contrôles protocolaires réussis : `bornes natives et aucune autorisation tardive : read-only`, `bornes natives et aucune autorisation tardive : grant`, `la validation d’une portée mal formée ne lance jamais une exception`. Les dix régressions de protocole questions 1.5 ont également été exécutées avec les vingt tests d’approbations : **30/30**.

## Vérifications finales

| Commande | Résultat observé |
| --- | --- |
| `npm test` | **217/217**, zéro échec, zéro saut ; 338162,6806 ms. Des assertions supplémentaires « ajustement vide » et « changement du projet actif » dans des tests existants ont ensuite été vérifiées par `node --test tests/approvals.test.mjs` : **10/10**. Aucun source produit n’a changé pendant/après cette suite. |
| `npm run build:win -- --config.directories.output=dist/approvals-pilot` | Types, trois bundles, paquet x64 et installateur NSIS réussis. |
| `node scripts/qualification/approvals.mjs` | **11/11**, profil supprimé ; rapport `compiled-profile.json`. |
| `node scripts/qualification/approvals.mjs --packaged --no-captures` | **11/11**, profil supprimé ; rapport `packaged-profile.json`. |
| `node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots` | **5/5**, profil supprimé ; sortie `focused-ui-regressions-passed`. |
| Impeccable detect sur ApprovalPanel/App/styles/strings | Une passe finale, résultat **`[]`**, `impeccable-detect.json`. |
| Contrôle archive / compilé | Octets Main, preload et renderer extraits de l’ASAR identiques aux bundles compilés. |

La première exécution restreinte d’un test d’annexe avait produit `STORAGE_WRITE_FAILED`, reproduit aussi sur le test incumbent `annexe question atomique…` à cause du renommage dans TEMP sous bac restreint. Tous les passages finaux ci-dessus utilisent la permission Windows locale autorisée pour ces témoins ; aucun contournement produit n’a été ajouté. Un contrôle de lecture ASAR initial a utilisé des séparateurs `/` incompatibles avec cette API Windows, puis a été corrigé en séparateurs natifs ; l’égalité des octets ci-dessus vient du contrôle réussi.

## Identité des artefacts

| Artefact | SHA-256 |
| --- | --- |
| `dist/approvals-pilot/win-unpacked/resources/app.asar` | `f4321dcf2d326bb7be4b2b55f9ca1182aa3604e464852f5b7a0edf171a49e538` |
| `dist/approvals-pilot/Madness-0.1.0-x64-setup.exe` | `e3d0f506c815cce7546ca1802b82d5bebce66b3e7053a66507a5c3fea2559aa7` |
| `out/main/index.js` | `b633656d04fd3e78d37d7423c4c67b482a6e0461025ac422cc70e5ac619c1003` |
| `out/preload/index.js` | `6cccc91c5883c37fb2a4bb57029bceadbe95580ffc7bc7b49b46aca96827cde1` |
| `out/renderer/assets/index-SrgEygvQ.js` | `3160529fff5dbf5cd354d70dba48ebdcba39d3f237ffbd33533550586fdbd608` |

## Inspection visuelle et limites

Deux passes groupées au total sur les mêmes cinq vues synthétiques : `compiled-desktop-scope.png`, `compiled-desktop-choice.png`, `compiled-compact-scope.png`, `compiled-compact-choice.png`, `compiled-unknown-light.png`. La première a mené à un lot de corrections : retour d’attente dupliqué retiré, ancienne copie « approbations indisponibles » actualisée, checkbox alignée sur le mode capturé. La seconde confirme les corrections et l’absence de débordement. Palette/composition incumbent conservées ; aucune acceptation humaine ni refonte globale prétendue. La finition indépendante fraîche reste au parent.

Bornes délibérées : 50 fichiers, proposition totale 100000 caractères, UTF-8 sans NUL, parents de création existants, aucun déplacement. Les autres processus ne sont pas verrouillés ; la relecture ne prétend ni transaction native ni rollback. Un effet partiel reste visible/inconnu selon les faits relus. Le vrai modèle et la restauration du paquet installé doivent être qualifiés séparément, avec données/coffre préservés. Aucun commit ou installation personnelle n’a été effectué par cet implémenteur.
