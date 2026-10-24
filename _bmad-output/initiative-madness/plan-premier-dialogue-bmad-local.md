---
title: 'Premier dialogue BMad réel dans Madness — pilote local'
type: feature
ticket: ''
created: '2026-10-24'
status: built
baseline_revision: 'fe78020e1754a0446a8952c42629dee1be108a9e'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** le témoin de connexion ne permet pas de parler à BMad. Le porteur demande le premier échange réel dans Madness.

**Approche :** pilote personnel local : ouvrir un projet, qualifier l’agent Mary installé, lancer son invocation native, lire sa réponse puis lui répondre. Les anciens tickets 1.1/1.2 restent bloqués ; ce pilote ne clôt pas 1.3 ni la distribution.

## Boundaries & Constraints

**Toujours :** vrais fichiers BMad et entrée native `skill`, contexte capturé, connexion propre à Madness, forfait explicitement utilisé, commandes/activité visibles, messages durables, brouillon conservé et aucune relance au redémarrage. Français/clair et composition acceptée, Impeccable pour l’interface. Les resolvers et lectures BMad doivent réellement fonctionner.

**Jamais :** prompt simulant Mary, identifiants d’un autre outil, secrets dans l’interface, envoi automatique d’un brouillon, droits d’écriture projet, approbation implicite, nouvelle facturation, publication ou réécriture des anciennes preuves. Le pilote qualifie la discussion libre avec Mary, pas ses workflows documentaires ni le catalogue complet.

**Extension demandée par le porteur le 24 octobre :** en cas de blocage réseau, proposer dans le panneau l’URL publique fixe des clés OpenAI, son ouverture dans le navigateur système et une icône de copie avec confirmation accessible. Ne jamais afficher/copier une URL OAuth ou un jeton ; ne pas changer cookies/TLS/redirections. Cette vérification est une aide, sans promesse qu’elle résout tous les refus réseau.

## I/O & Edge-Case Matrix

| Situation | Attendu |
|---|---|
| Agent absent, modifié ou profil non reconnu | Diagnostic et lancement bloqué ; aucun modèle appelé |
| Projet qualifié et compte disponible | Invocation visible, accueil/menu natifs de Mary, réponse libre dans la même conversation |
| Texte vide, double envoi, navigation concurrente | Refus ou rattachement au contexte capturé ; saisie préservée |
| Question structurée, approbation ou effet non pris en charge | Refus explicite et échec du tour ; jamais de succès inventé |
| Erreur réseau, arrêt incertain ou sauvegarde échouée | État et récupération distincts ; aucune répétition automatique |
| Réouverture | Échanges/brouillon retrouvés comme historiques ; moteur arrêté |

</frozen-after-approval>

## Code Map

- `src/contracts/index.ts`, `src/core/application.ts`, `ports.ts` : snapshot v1, queue et restauration existants ; conserver compatibilité et cœur sans Node.
- `src/adapters/codex/connection.ts`, `probe.ts`, `vault.ts` : accès interne aux credentials et refresh ; réutiliser découverte/arrêt, pas le RPC de probe qui interdit les outils.
- `src/main/index.ts`, `src/preload/index.ts` : appelant/frame exacts, pont métier validé ; aucun RPC natif générique.
- `.agents/skills/bmad-agent-analyst/` : activation, customisation, config, menu et chat libre réels ; qualifier empreintes et dépendances avant invocation.
- `src/renderer/src/App.tsx`, `styles.css` : parcours, conversation, brouillon et panneau contexte existants.

## Tasks & Acceptance

**Execution :**
- [x] `src/contracts/dialogue.ts`, `src/core/dialogue.ts`, `ports.ts`, `application.ts` : contrat, coordination hors queue réseau et persistance commune, sans élargir silencieusement le snapshot v1.
- [x] `src/adapters/bmad/profile.ts`, `src/adapters/codex/dialogue.ts`, `connection.ts` : profil strict, injection native, outils lecture seule, corrélation/accusés/arrêt et authentification interne ; aucun secret projeté.
- [x] `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/src/{App.tsx,styles.css,strings.ts,env.d.ts}` : pont, lancement expliqué, activité, messages et réponse ; garder repli/navigation et saisie.
- [x] `tests/dialogue*.test.mjs`, `scripts/qualification/dialogue.mjs` : matrice déterministe puis paquet isolé ; preuve réelle distincte avec autorisation Madness, sans journal natif brut.
- [x] `docs/development.md`, `qualification-dialogue-local/`, contrats UX : reproduction, captures bornées, preuves et limites ; commit local exact.
- [x] `src/contracts/connection.ts`, `src/adapters/codex/connection.ts`, Main/preload et panneau Codex : aide réseau avec URL publique fixe, ouvrir/copier explicites et retour accessible ; tests du succès, refus et absence de contenu dynamique.

**Acceptance Criteria :**
- Given un projet qualifié, when Mary est lancée, then son agent installé est injecté, ses resolvers s’exécutent et son accueil/menu réels apparaissent avec invocation et contexte.
- Given sa réponse, when un message libre est envoyé, then accusé et réponse corrélés restent dans cette conversation ; aucune autre saisie n’est envoyée.
- Given une fermeture/réouverture, when le projet est retrouvé, then historique et brouillon subsistent sans processus lancé.
- Given une capacité manquante ou un résultat incertain, when le tour finit, then l’interface expose la limite et n’annonce pas une réussite.
- Given un refus réseau, when le panneau connexion est consulté, then la page publique de vérification peut être ouverte/copiée explicitement, avec confirmation de copie et erreur compréhensible si l’action échoue ; aucun lien d’autorisation sensible n’est exposé.

## Implementation Notes

- Plan relu sous le mandat autonome explicite du porteur : objectif unique, risque élevé lié aux processus, au forfait et à la conservation. Aucun arbitrage produit supplémentaire ; l’essai personnel est distinct de la story distribuable 1.3. Fichiers non suivis préexistants exclus, checkout courant conservé selon l’autorisation précédente.
- Le réalisateur possède les fichiers d’implémentation, tests et banc listés ci-dessus ; il n’est pas seul dans le dépôt et préserve les modifications des autres. Le parent attend son retour avant toute autre mutation. Impeccable context a déjà été chargé dans cette conversation ; ne pas le relancer. Lire son craft-floor immédiatement avant l’UI, préserver la composition, faire une seule inspection groupée puis au plus une confirmation.
- Réalisation reçue sans commit ; diff préparé et lu par le parent. Audit de matrice : profil (dialogue-profile/runtime), accueil/réponse/corrélation et refus natifs (dialogue-protocol), vide/concurrence/navigation/stockage/arrêt (dialogue et UI), restauration (banc isolé). Les 96 tests ont été relancés par le parent, aucun échec ni ignoré. Inspection groupée des captures existantes réalisée ; détecteur Impeccable exécuté une fois, aucun constat. L’essai personnel réel reste à exécuter après revue, sans prétendre les fixtures suffisantes.
- Vérification finale après corrections et extension : 112/112 tests, types/build/paquet, 8 contrôles compilés + 8 paquet, 4 régressions Windows, essai réel Mary → réponse libre → sortie/arrêt → réouverture et contrôle de l’installation passent. La preuve réelle distincte et les hashes sont dans `qualification-dialogue-local/`. Confirmation visuelle groupée (dialogue réel + aide synthétique, bureau/compact) inspectée, sans retouche supplémentaire. Aucun correctif de revue différé. Le texte Markdown reste non interprété ; les workflows documentaires et la distribution restent explicitement hors pilote.

## Plan Change Log

- 24 octobre, demande humaine pendant l’essai : ajout de l’aide URL/copie ci-dessus au périmètre approuvé. Préserver les protections réseau, la composition du panneau, les contrats persistants et les échanges réels. Le navigateur système du porteur a affiché le JSON ; le retest Main sans cookies ni redirection a ensuite obtenu HTTP 200/application-json/quatre clés. Le contenu n’a pas été demandé ni copié depuis le navigateur.

## Review Triage Log

| Constat | Verdict | Route et preuve |
|---|---|---|
| Quick : arrêt pendant la sauvegarde finale | high | patch — `execute(stop)` annule seulement le signal lorsqu’un travail est actif ; après `session.turn`, la sauvegarde peut finir et rétablir ready sans nettoyage. L’état est atteignable avec une écriture retardée ; garantir l’arrêt après le travail actif, sans nouvelle surface publique. |
| Quick : arrêt inconnu invisible depuis un autre projet | medium | patch — unknown désactive les actions globalement, mais l’erreur et le renvoi au propriétaire exigent le projet actif/session présente. Afficher la récupération au lieu du contrôle muet. |
| Parent : mutation de connexion pendant un dialogue après témoin vérifié | medium | patch — le refus BUSY conserve status=verified avec errorCode non nul ; `isConnectionState` refuse cette combinaison, donc Main répond INVALID_COMMAND. Reproducteur hors réseau confirmé : verified/BUSY/valid=false. Produire un refus conforme et garder les credentials/la session. |
| Essai réel : accès JWKS après échange du refresh token | high | patch — exception locale tracée : NETWORK_UNAVAILABLE dans getKeys/credentialsFrom/acquireDialogue ; le GET public reçoit un 307 Zscaler et échoue sous redirect:error. Précharger les clés avant tout échange renouvelant les accès, puis réutiliser ces clés pour la signature ; ne pas changer la politique de redirection ni de cookies. |
| Essai réel : erreur de renouvellement absente du panneau connexion | medium | patch — le dialogue finit PROVIDER_FAILED, mais le pont de connexion reste registered/errorCode:null après l’erreur réseau connue. Publier le code existant dans le panneau, sans effacer les accès ni relancer automatiquement. |

Résolutions vérifiées : arrêt pendant sauvegarde couvert pour stopped/unknown ; récupération depuis l’autre projet couverte en UI ; refus BUSY conforme couvert après témoin verified ; prélecture JWKS avec échecs réseau/jeu vide/clé invalide sans POST couverte ; erreur de renouvellement publiée, compte conservé et lease libérée couverts. Deuxième relecture Quick après extension : aucun constat correctif. Le correctif du banc de capture affiche seulement sa fenêtre synthétique avant la prise de vue ; le test ciblé et sa paire de captures passent.

## Verification

`npm test`, `npm run build`, paquet Windows ; banc isolé sans fournisseur puis essai réel Mary → réponse libre → sortie. Inspection bureau/compact groupée et une confirmation au maximum ; détecteur Impeccable une fois. Vérifier arrêt et absence de relance, préserver la preuve SIWC historique et les gates bloqués.

Résultat : tous les contrôles ci-dessus passent ; `verification.json`, `live-profile.json` et `installed-profile.json` portent les résultats et empreintes. Les échanges de test sont conservés, les cinq entrées témoins vides ont été nettoyées sans toucher aux projets ni aux credentials. L’installation normale a été remplacée par le paquet vérifié ; aucun push.
