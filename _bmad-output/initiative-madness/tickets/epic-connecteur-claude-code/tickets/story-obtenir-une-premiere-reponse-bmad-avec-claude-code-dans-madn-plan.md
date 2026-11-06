---
title: 'Obtenir une première réponse BMad avec Claude Code dans Madness'
type: 'feature'
ticket: 1
created: '2026-11-06'
status: 'in-review'
baseline_revision: '0a4ae1473bcbf673b6205c2732b810a2d0675061'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L’abonnement personnel fonctionne via la CLI sur le poste, mais Madness n’offre qu’une voie Codex.
**Approach:** Depuis le projet actif, une commande « Lancer Mary avec Claude Code » déclenche un unique échange en lecture seule via la CLI officielle et réutilise le registre et la conversation de Madness. Afficher la provenance Claude Code et le résultat après réouverture passive. Ce premier profil se termine après sa réponse.

## Boundaries & Constraints

**Always:** Lancer volontairement, sans clé, OAuth Madness, facturation de secours ou dépendance à la connexion Codex. Le projet, l’initiative et le fournisseur sont figés. Transmettre la compétence Mary épinglée, contrôlée sur les octets effectivement envoyés, et le contexte minimal qualifié. L’action indique ces données et l’usage du forfait. La CLI tourne avec les outils désactivés dans un dossier vide isolé. Refuser une politique locale incompatible ou un profil non qualifié. Une annulation ou une perte d’arrêt reste inconnue si le propriétaire ne confirme pas la sortie. Préserver les voies Codex et les conversations existantes.
**Never:** Charger des paramètres, outils, scripts, plugins ou hooks du projet dans Claude, utiliser un shell de commande pour lancer la CLI, passer le prompt dans la ligne de commande, copier des jetons, transmettre un fichier projet arbitraire, relancer automatiquement, ouvrir les sessions natives ou afficher la télémétrie comme facture. Aucune release ou installation dans ce lot. Choix complet et logo en 6.2/6.3.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Premier tour | Projet actif et Mary épinglée, CLI personnelle connectée | Réponse Claude sous ce projet, un tour durable, historique restitué sans agent | Une sortie non corrélée ne devient pas une réponse |
| Profil refusé | CLI absente, version non qualifiée ou session hors abonnement, projet différent ou source remplacée | Aucune inférence | État explicite, sans bascule |
| Annulation / erreur | Arrêt, réseau indisponible ou sortie hors contrat | Arrêt borné et résultat conservé selon preuve, aucun rejeu | Statut adapté, arrêt inconnu bloque un nouvel effet |
| Coexistence | Conversation Codex existante et nouveau tour Claude | Contextes et libellés distincts, aucun changement implicite de fournisseur | Une commande ne peut envoyer au mauvais projet |

</frozen-after-approval>

## Code Map

- `src/adapters/claude/dialogue.ts` (nouveau) : binaire natif `claude.exe` résolu par les chemins d’installation Windows connus et le package npm officiel (%APPDATA%/npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe). Liens physiques npm légitimes, pas de shims ni sélection depuis le projet. Version 2.1.318 témoin. Projection locale d’auth status vers état et mode, pas de PII. Windows native spawn, vraie chaîne vide après --tools, --restricted, --no-session-persistence, --disable-slash-commands, --strict-mcp-config avec config MCP vide et outils MCP interdits. Profil personnel firstParty claude.ai, sans env de clés/API/gateway. Mode restreint neutralise les réglages user/project mais les politiques gérées exigent un refus explicite si détectées. Aucun --bare (OAuth désactivé). Sortie bornée JSON terminal, champ total_cost_usd conservé seulement en preuve de qualification expurgée si observé, pas de modification de registre USD.
- `src/adapters/bmad/profile.ts` : qualifyBmadProfile, readBmadFile, catalogSource.sha256. Réutiliser et ne pas élargir l’allowlist, ne pas lancer les resolvers d’un dépôt pour la voie Claude. Utiliser la preuve de contexte du coordinateur puis la vérifier avant effet.
- `src/main/index.ts`, `src/adapters/codex/owned-run.ts`, `resources/bmad-help/supervision.ps1` : réutiliser ActivityAdmission et ajouter le propriétaire Claude à status/observeStop. Réutiliser la preuve Windows d’arrêt sans toucher au propriétaire Codex. Si supervision de Job, garder un chemin séparé et ne pas écrire les sorties/identifiants bruts dans le stockage produit. En mode CLI direct restreint, acquérir l’identité exacte avant de transmettre par stdin, attendre fermeture des flux et n’annoncer que la preuve d’arrêt effectivement établie.
- `src/core/dialogue.ts`, `src/core/application.ts`, `src/core/ports.ts` : étendre le flux partagé, sans dupliquer les écritures. Commande fixe launch-claude, aucun fournisseur/chemin fourni par le renderer. Vérifier projet actif, fraîcheur du contexte et de la source. Identité 'claude-code', connexion locale propre au lancement et indépendante de Codex. Préserver le comportement des appels dialoguePersist sans fournisseur. Une fois le tour durable terminé, fermer le premier profil en gardant turn.phase completed. Refuser send sur cette session terminée.
- `src/contracts/dialogue.ts`, `src/preload/index.ts`, `src/renderer/src/App.tsx` et libellés : commande à champs exacts, libellés FR/EN, texte sobre dans Conversation avec même système de boutons, aucune attente de compte Codex pour la voie Claude. Afficher Claude sur la conversation active et historique, gérer la navigation après un tour terminé déjà à l’arrêt et l’arrêt pendant le tour.
- Tests ciblés : transport/provider hostile, discriminateur IPC, identité/persistance/arrêt au cœur. Parent effectue le témoin Electron et la revue. Ne pas toucher à tests/bmad-help-boundaries.test.mjs (modification de fins de ligne préexistante), autres untracked historiques ou fichiers de tests du parent; tu n’es pas seul dans le workspace.

## Tasks & Acceptance

- [ ] Adaptateur et propriétaire natifs, puis route de dialogue et stockage par identité.
- [ ] Commande et projection de provenance, y compris ouverture du résultat après fin.
- [ ] Prouver en double le refus avant envoi, une réponse durable puis stop/reopen, annulation et Codex.
- [ ] Vérification ciblée typecheck et compilation locale. Témoin de développement par le parent, sur projet synthétique possédé et compte déjà connecté.

## Implementation Notes

- Mandat explicite « go faire ça » après présentation de la story 6.1. Le tracé reprend la CLI 2.1.318 vérifiée, sans autre configuration humaine. Risque élevé dû au processus natif, à l’attribution durable et au contexte transmis.
- Les contrôles longs et le paquet restent hors de cette intervention.

- Preuves du parcours natif et de la restauration synthétique dans [qualification 6.1](../qualification-integree-6-1.md). Les fichiers des deux contrôles sont distincts. La 6.1 reste en revue.

## Plan Change Log

## Review Triage Log

- Q1 — Facturation. La voie Madness exclut le repli vers API, Bedrock ou une autre identité. Les crédits activés côté compte peuvent s’appliquer selon Anthropic. La limite est annoncée avant le clic. Aucun reçu de débit qualifié. Limite du fournisseur conservée.
- Q2 — Sondes. Arrêt et fermeture des flux observés avec le propriétaire Claude avant libération. Recontrôle favorable.
- Q3 — Contexte. Vérifications longues avant le démarrage puis contrôle court de la source et du binaire. La vérification du projet actif et l’initiation de l’écriture partagent la file. Recontrôle favorable.
- Q4 — Banc. La suppression exige le reçu d’arrêt Claude et la fermeture de l’application, ou l’absence observée de lancement et de propriétaire. Recontrôle favorable.
- Q5 — Provenance. Historiques, activité, contexte du projet et libellés d’arrêt corrigés. Restauration synthétique finale confirmée.

## Verification

- npm run typecheck
- Tests ciblés transport et routage Claude et non-régression Codex.
- npm run build puis témoin Electron isolé de la commande et de la réouverture.
