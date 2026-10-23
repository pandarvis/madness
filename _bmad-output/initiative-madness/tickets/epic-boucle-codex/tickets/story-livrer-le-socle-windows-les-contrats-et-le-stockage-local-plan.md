---
title: 'Livrer le socle Windows, les contrats et le stockage local'
type: 'feature'
ticket: 2
created: '2026-10-23'
status: blocked
baseline_revision: 'ebc719c7fbbfdbe619a3c1347433cde76a0f277a'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-madness/architecture-madness/architecture-madness.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md', '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md']
blocked_at: "2026-10-23"
blocked_reason: "Socle code et paquet verifies : 42 tests, types/build, dev et 14 controles Windows reussis. G0 reste partiel : installateur non execute, minima de compatibilite et proxy cible non qualifies. Aucun consommateur debloque ; le tracer 1.3 attend aussi la qualification Codex 1.1."
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** aucun programme Madness ne tourne réellement ; la maquette ne prouve ni Electron, ni conservation locale.

**Approche :** livrer G0 : application Windows React, pont sécurisé et stockage versionné ; ouvrir un dossier, conserver son contexte et un brouillon, les retrouver après redémarrage. Codex reste indisponible jusqu'à qualification séparée.

## Boundaries & Constraints

**Toujours :** AD-1/2/4/5/7/8/9 ; UI française claire adoptée, menu rétractable, clavier/focus et erreurs lisibles. Cœur sans Electron/Node/fournisseur ; contrats possédés par le cœur, validation aux frontières. Persistance hors installation et projets, aucune relance d'agent. Versions récentes vérifiées, lockfile reproductible. Mandat autonome du 23 octobre : validations exécutables déléguées, résultats observés seulement.

**Jamais :** lancer/login Codex, lire ses identifiants, annoncer G1/G4, modifier un projet ouvert, remplacer les contrats UX, implémenter catalogue/BMad/graphe ou variantes anglaise/sombre. Pas de pont IPC/fichiers/processus générique, Node dans le renderer, TLS désactivé, publication distante ou installation système globale. Préserver les fichiers non suivis préexistants.

## I/O & Edge-Case Matrix

| Situation | Attendu |
|---|---|
| Premier démarrage | Accueil vide ; ouvrir un dossier ou annuler sans mutation |
| Dossier choisi | Contexte canonique réel ; brouillon local explicitement enregistré après accusé |
| Réouverture | Contexte, saisie sauvegardée et préférence retrouvés ; aucun moteur lancé |
| IPC invalide/mauvais appelant | Refus avant tout effet |
| Écriture impossible/corruption/version inconnue | Erreur expurgée ; saisie gardée, octets existants préservés, aucune durabilité prétendue |
| Codex non qualifié | Indisponibilité expliquée ; aucun contrôle d'envoi trompeur |

</frozen-after-approval>

## Code Map

- Aucun `package.json`/`src` produit. Starter officiel `@quick-start/create-electron` React-TS ; reprendre en espace temporaire, sans écraser ce dépôt.
- Registre observé : Electron 45.0.0, electron-vite 6.0.0, electron-builder 26.15.3, TS 7.0.2, React/DOM 19.3.1, Vite 8.3.5, starter 1.0.31. Vérifier compatibilité et signaler tout écart.
- UX : `ux-madness/mockups/parcours-guide/` est l'incumbent ; DESIGN fait foi. Impeccable context chargé ; lire craft-floor/operate avant UI, sans le relancer.
- Banc et preuve Codex 1.1 inchangés, indépendants.

## Tasks & Acceptance

**Execution :**
- [x] `package.json`, lockfile, `electron.vite.config.ts`, `electron-builder.yml`, `tsconfig*.json`, `.gitignore` : scripts dev/types/tests/build/paquet Windows ; sorties ignorées. Packages exacts, pas d'updater.
- [x] `src/contracts/`, `src/core/` : contexte, erreurs/résultats, capacités indisponibles, commandes/événements corrélés et port de persistance ; coordinateur sans reprise automatique. API métier de lecture, choix dossier, brouillon et préférence.
- [x] `src/adapters/persistence/` : snapshot JSON v1 validé, écritures sérialisées et remplacement atomique ; schéma futur/corrompu refusé sans écrasement. Choix local au lot, sans migration historique inventée.
- [x] `src/main/`, `src/preload/` : composition, dossier via dialogue OS, userData ; isolation/sandbox, appelant exact, payload/portée vérifiés, navigation/fenêtres/permissions refusées, CSP. Preload auto-suffisant et métier seulement.
- [x] `src/renderer/` : transposer tokens et composition acceptés, accueil/projet minimal réel, brouillon, accusé/erreur et repli fonctionnels ; ni données démo ni boutons simulés.
- [x] `tests/`, `scripts/qualification/windows.mjs` : matrice, frontières et persistance ; qualification Electron compilé puis paquet Windows, profil temporaire contrôlé, lecture/écriture via vrai preload et réouverture, capture et versions. Aucun profil utilisateur existant utilisé ; arrêter uniquement les enfants possédés et nettoyer les seuls espaces créés.
- [x] `docs/development.md`, `qualification-g0/qualification-g0.md` et profil expurgé dans le dossier epic : reproduction, maintenance et preuves/limites ; ressources tiers utiles seulement, sans dépendance silencieuse au serveur dev.

**Acceptance Criteria :**
- Given Windows cible, when le paquet est construit et démarré, then React et son pont métier fonctionnent avec versions Electron/Chromium/Node consignées ; installation et proxy ne sont qualifiés que s'ils sont réellement contrôlés.
- Given un dossier d'essai, when son contexte et brouillon sont enregistrés puis l'application rouverte, then les données sont retrouvées via IPC sans accès Node renderer ni lancement fournisseur.
- Given une preuve manquante, when le rapport conclut, then le gate reste partiel et le tableau ne débloque aucun consommateur par faux succès.

## Implementation Notes

- 2026-10-23 : plan relu et approuvé par l'agent sous mandat autonome explicite du porteur, après vérification du découpage et de ses prérequis. Risque high conservé ; passage ready-for-dev puis in-progress. Les contrôles humains ou externes manquants ne sont pas déclarés réussis.
- Implémentation retournée et diff inspecté ; versions du lockfile exactes, 390 entrées issues du registre npm avec intégrité. Les empreintes des 23 entrées de build et des trois artefacts correspondent au profil sauvegardé.
- Audit de matrice : premier démarrage/annulation, contexte/brouillon, réouverture, appelant/payload, erreurs de stockage et indisponibilité Codex sont couverts par les tests foundation/lifecycle et le banc Windows. Les 40 tests ont été relancés par l'orchestrateur : 40 réussis, aucun ignoré ; types réussis. Le profil Windows rapporte 12 contrôles réussis et nettoyage confirmé. Les deux captures ont été inspectées sans nouveau cycle de capture.

- Après correctifs : 42 tests réussis (aucun ignoré), types, build/paquet NSIS, renderer dev et 14 contrôles Windows intégrés relancés par l’orchestrateur ; nettoyage confirmé. Les trois constats sont corrigés et vérifiés. Finition UX confirmée sur les captures corrigées, sans correction restante ; vérification documentaire indépendante : aucun changement au système adopté. Rôles Impeccable spécialisés indisponibles, références appliquées par agents standard neufs ; sidecar historique conservé sans le promouvoir.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Preuve et route |
|---|---|---|
| Quick : lien d'évitement et URL IPC | high | Reproduction Electron compilé sur profil jetable : lecture réussie avant Entrée sur le lien, puis URL `#main` et `UNTRUSTED_CALLER`. Le filtre d'événements partage la comparaison exacte. Patch : empêcher la navigation de fragment et déplacer le focus vers main, sans élargir la frontière IPC. |
| Quick : corruption d'encodage UTF-8 | high | La lecture chaîne remplace les octets invalides avant comparaison et validation ; un JSON structurellement valide est donc réécrit sous forme altérée. Patch : décodage UTF-8 strict avant validation, erreur stable et aucun remplacement ; le texte U+FFFD réellement valide reste admis. |
| Finition Impeccable substituée : repères de projets identiques | medium | DESIGN impose des repères distincts ; le rail utilise seulement `name.charAt(0)`, donc deux dossiers de même initiale sont identiques. Patch : repères distincts et stables dans l'ordre persisté des projets, libellés et infobulles préservés ; contrôle sur deux noms de même initiale. |

## Design Notes

Le JSON atomique évite une dépendance native initiale. Une version inconnue exige une évolution explicite, jamais un reset. Le lot n'invente aucune conversation fournisseur. La qualification utilise les opérations métier réelles.

## Verification

- Types, tests de matrice/frontières, build ; `node --test scripts/qualification/codex.test.mjs` conserve le banc indépendant.
- Paquet Windows puis `node scripts/qualification/windows.mjs` : contexte, sauvegarde, réouverture, isolation, capture ; rapport distinct d'un login ou parcours humain.
- Détecteur Impeccable une fois sur UI finie, inspection desktop/compacte puis une confirmation au maximum.
- `git diff --check`, fichiers exacts avant commit. Si téléchargement/runtime/installation/proxy reste bloqué, produire la limite, sans contourner TLS ni prétendre G0 complet.
