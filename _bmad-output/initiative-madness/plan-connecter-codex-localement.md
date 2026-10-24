---
title: 'Connecter Codex localement depuis son logo'
type: feature
ticket: ''
created: '2026-10-24'
status: built
baseline_revision: '9dad33bef7c835e5abcba6670a94e493d0ce3c01'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - C:/Sources/madness/AGENTS.md
  - C:/Sources/madness/_bmad-output/initiative-madness/connexion-codex-reference.md
  - C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md
  - C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
  - C:/Sources/madness/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md
  - C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/reference/craft-floor.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le statut textuel Codex occupe la barre et aucune connexion réelle n’est proposée dans Madness.

**Approach:** Un logo grisé ouvre la connexion locale Sign in with ChatGPT, consentie dans le navigateur Windows ; un témoin Codex vérifie ensuite le forfait. Réalisation personnelle locale autonome, sans déclarer résolue l’éligibilité de distribution de 1.1 ni lancer le tracer BMad.

## Boundaries & Constraints

**Always:** Conserver la base française claire et les frontières Main/preload/cœur. Chiffrement Windows des credentials, protocole officiel vérifié, état explicite accessible, annulation et fermeture bornées, aucun relancement automatique. Source de marque attribuée. Préserver tous les projets et brouillons.

**Never:** Lire/copier les credentials d’un autre outil, les exposer au renderer ou aux journaux, API key implicite, navigateur intégré, TLS désactivé, succès simulé, auto-envoi de brouillon, reprise implicite, modification du plan natif historique ou déblocage artificiel des gates. Pas de nouvelle licence ni code SDK non commercial incorporé. Aucun push.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Connexion | Consentement valide, scopes et tour confirmés | Connexion vérifiée après arrêt confirmé | Aucun succès anticipé |
| Callback hostile | État, nonce, signature, client ou identité invalides | Aucun jeton accepté | Attente légitime préservée ou refus explicite |
| Consentement insuffisant | Refus ou scopes manquants | Indisponible avec récupération | Aucun témoin envoyé |
| Interruption | Annuler, timeout, fermer pendant OAuth/témoin | Listener/requêtes/child arrêtés dans un délai borné | Inconnu si arrêt non prouvé, aucun rejeu |
| Conservation | Redémarrage ou coffre illisible/chiffrement absent | Aucun réseau spontané ; état enregistré à vérifier ou erreur | Aucun reset silencieux ni stockage clair |

</frozen-after-approval>

## Code Map

- `src/main/index.ts`, `boundary.ts` : composition, caller strict, fermeture ; réseau et shell restent Main.
- `src/contracts/index.ts`, `src/preload/index.ts` : bridge validé existant ; préférer contrat connexion dédié pour préserver snapshot v1.
- `src/core/application.ts`, `lifecycle.ts` : queue de persistance ; ne pas y attendre OAuth bloquant shutdown.
- `scripts/qualification/codex.mjs` : Rpc et séquence témoin comme référence ; login natif et wrapper non réutilisables tels quels. Garder preuves/tests historiques.
- `src/renderer/src/App.tsx`, `strings.ts`, `styles.css` : barre globale, ouverture unique, brouillons ; remplacer statut et texte obsolètes sans autre refonte.
- `tests/*.test.mjs`, `scripts/qualification/windows.mjs` : Node tests et Electron/Playwright avec profils isolés.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/connection.ts`, `src/core/ports.ts`, `src/preload/index.ts`, `src/main/index.ts` : contrat de connexion strict et service injecté, appels courts, notifications assainies et arrêt coordonné.
- [x] `src/adapters/codex/{connection,oauth,vault,probe}.ts`, `package.json`, `package-lock.json` : implémenter la référence indépendante, dépendance JOSE épinglée et exécutable natif possédé, sans wrapper non traçable.
- [x] `src/renderer/src/{App,strings,styles}.*`, asset et `resources/THIRD-PARTY-NOTICES.md` : contrôle logo et panneau accessible, tous états réels, origine de marque.
- [x] `tests/connection*.test.mjs`, `scripts/qualification/connection.mjs` et `windows.mjs` : couvrir la matrice, bridge, Electron et profil séparé ; rapport live sans secret distinct de l’ancien banc.
- [x] `docs/development.md`, contrats UX et `.memlog.md` : décrire le parcours et les limites réellement livrées.

**Acceptance Criteria:**
- Given un lancement à froid, when la barre apparaît, then une seule icône Codex grisée remplace le texte, accessible au clavier ; l’ouverture projet unique et le repli fonctionnent.
- Given la connexion demandée, when l’utilisateur continue, then seul le navigateur système reçoit l’autorisation et le renderer ne reçoit aucun secret.
- Given un succès OAuth seul, when le témoin échoue, then l’interface distingue compte enregistré et connexion vérifiée, sans activer de conversation BMad.
- Given les vérifications automatisées, when le paquet est construit, then tests, types et contrôles Electron réussissent ; une preuve live manquante reste explicitement manquante.

## Implementation Notes

- Plan relu et validé sous le mandat autonome explicite du porteur ; risque élevé pour OAuth, coffre et cycle de vie. Nouveau plan indépendant : ancien plan 1.1 et gates préservés. Baseline canonique capturée avant modification de code.
- Audit de matrice : cinq lignes couvertes par tests de service/OAuth/coffre/protocole exécutés ; `tests.txt` confirme 75 réussites et aucun test ignoré. Les preuves injectées et DPAPI ne sont pas présentées comme preuve du forfait. Les 9 contrôles compilés et 9 du paquet ainsi que 15 régressions Windows sont documentés ; consentement live à réaliser après revue.
- Après les sept patches : 83/83 tests, types/build Windows, 9 contrôles compilés + 9 du paquet, 15 régressions G0 et diff check réussis. Les nouvelles régressions couvrent la queue drainée, les mutations attendues, l’arrêt --version inconnu, la réautorisation et les deux sorties clavier. Aucun constat correctif restant ou différé. Les captures restent celles de la passe bornée ; aucun nouveau détecteur ni cycle de finition.
- Réalisation marquée built pour le code et les vérifications ci-dessus. Essai humain ouvert ensuite dans le paquet avec le profil utilisateur Madness normal, afin de conserver son compte chiffré ; aucune lecture de credentials par le contrôleur, uniquement la projection métier. Le rapport `qualification-connexion-codex/live-profile.json` porte l’état observé : un état en attente ou un échec n’est pas une connexion vérifiée. Les gates historiques restent inchangés.
- Essai humain réussi le 24 octobre à 11:46:51.773 UTC : consentement dans le navigateur système, OAuth vérifié, vrai tour Codex 0.144.6 et arrêt confirmés ; projection verified, accountStored=true, rappel acquitté. Preuve liée au SHA-256 du paquet dans live-profile.json, sans identité, code OAuth, jeton ou sortie brute. Fenêtre laissée au porteur ; aucun nettoyage de son profil utilisateur. Connexion personnelle locale qualifiée, sans BMad ni éligibilité de distribution extrapolés.
- La projection de succès est figée et relue dans `qualification-connexion-codex/live-confirmed-profile.json`, liée au même SHA-256 que packaged-profile. Le statut vivant live-profile est ignoré pour qu’une action ultérieure du porteur ne réécrive pas cette preuve historique ni le diff Git.

## Plan Change Log

## Review Triage Log

### Quick — 24 octobre 2026

Sept constats vérifiés : 3 high, 4 medium, 0 low/false/maybe-false ; tous routés patch. Corrections locales de logique déjà exigée, sans nouvelle API ni changement de l’intention.

| Constat | Verdict / route | Preuve et action |
|---|---|---|
| Commandes déjà en queue rejetées à la fermeture | high / patch | `shutdown` place lifecycle à closing avant `handle`, qui rejette les commandes acceptées. Déplacer le refus à l’admission `execute`, drainer celles déjà acceptées. |
| Version native non arrêtée puis annulation et nettoyage | high / patch | `nativeVersion` peut lever STOP_UNCONFIRMED ; le catch le remplace si signal aborted et `stopped` extérieur reste true. Préserver ce code et interdire le nettoyage dans ce cas. |
| Rappel forfait sans sortie si écriture échoue | medium / patch | Le modal interdit Escape et ne montre pas VAULT_UNREADABLE. Rétablir la sortie native et montrer les erreurs connues ; acquittement durable inchangé. |
| Déconnexion masque l’arrêt inconnu | medium / patch | clear retire les credentials mais laisse stopUnconfirmed true ; UI repasse disconnected et bouton connect sans effet. Garder unknown explicite après retrait. |
| Escape intercepte le tiroir modal | medium / patch | Handler global ferme le panneau arrière et empêche l’annulation native du tiroir. Respecter le modal actif. |
| Mutations coffre non attendues par shutdown | high / patch | Seul active est attendu, mutating est un booléen ; clear/write peuvent être coupés. Suivre leur promesse interne et la joindre à l’arrêt borné. |
| Callback de reconnexion sans client_id | medium / patch | Vérification du contrôleur : code impose client_id même pour une inscription existante, alors que la documentation officielle autorise son omission. Réutiliser l’identifiant enregistré ; agent_name_hint seulement pour première inscription. |

## Verification

- `npm test` ; `npm run build` : toutes assertions et types réussis.
- `node scripts/qualification/connection.mjs` : tests Electron sans réseau réel par défaut, profils isolés ; option live explicite, consentement humain, preuve assainie.
- `node scripts/qualification/windows.mjs` : régressions locales sans connexion implicite.
- Impeccable detect une fois ; captures bureau/compact en une passe et au plus une confirmation corrective. Le porteur ne demande pas de nouvelle direction visuelle.

L’implémenteur possède les fichiers de réalisation, tests, documentation technique et UX ci-dessus. D’autres agents travaillent dans ce dépôt : ne pas annuler leurs changements. Le parent conserve seul le suivi du board et AGENTS.md. En cas de difficulté non résolue, conserver une erreur actionnable plutôt qu’inventer un succès.
