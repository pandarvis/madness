---
title: 'Exécuter et retrouver la première boucle BMad réelle'
type: 'feature'
ticket: '3'
created: '2026-10-26'
status: 'built'
baseline_revision: 'fa432e07f45f9e380577e9d06a8790b195bc0e74'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/epic-boucle-codex.md'
  - '{project-root}/.agents/skills/bmad-forge-idea/SKILL.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Mary ne réalise pas de workflow documentaire ; 1.12 autorise sa réalisation, pas ses futures écritures.

**Approach:** Intégrer `$bmad-forge-idea` installé pour une nouvelle idée : activation, dialogue, journal natif et HTML obligatoire. Le modèle conduit Forge ; Madness relaie ses commandes et observe les fichiers. Mary reste disponible.

## Boundaries & Constraints

**Always:** vrais scripts customization/config/personas/memlog, dépendances et empreintes qualifiés ; contexte capturé. Lancement explicite après effets annoncés, sans envoyer le brouillon. Codex read-only ; outils hôte bornés à un nouveau `forge-{slug}` dans la sortie BMad du projet. Sorties natives intégrales, Markdown si HARDENED. Profil/hooks/reprise hors capacité : bloquer avant invocation. Interactions indisponibles refusées sans simulation. Observations durables distinctes de la prose et de la validation humaine.

**Never:** shell/écriture génériques, skills modifiés, coffre copié, HTML exécuté, replay ou faux livrable. Catalogue/aperçu epic 2, interactions 1.5–1.7, migration Snapshot v1 et clôture des gates exclus. Consentements humains, données personnelles et preuves préservés.

## I/O & Edge-Case Matrix

| Cas | Entrée | Résultat | Échec |
|---|---|---|---|
| Nouveau Forge | Profil et sorties compatibles | Conversation native, vrai journal, rapport observé | Aucun effet annoncé sans observation |
| Profil altéré ou session à reprendre | Empreinte/contexte/précondition modifiés | Lancement bloqué avec raison | Aucun modèle lancé |
| Écriture | Fichier autorisé de la session | Octets relus et empreinte conservée | Traversée, lien, conflit ou sauvegarde refusés ; pas de faux succès |
| Réouverture | Historique et observations durables | Invocation, contexte, chemins et brouillon retrouvés | Activité historique, aucun moteur relancé |

</frozen-after-approval>

## Code Map

- `src/adapters/bmad/{profile,runtime}.ts` : empreintes Mary et outils externes.
- `src/adapters/codex/dialogue.ts` : skill, SIWC, outils, accusés et arrêt.
- `src/core/{dialogue,application,ports}.ts`, `src/contracts/dialogue.ts` : contexte/persistance.
- `src/{main,preload}/index.ts`, `src/renderer/src/App.tsx` : pont et composition.

## Tasks & Acceptance

**Execution:**
- [x] `src/adapters/bmad/{forge,forge-manifest}.ts`, `resources/bmad-script-runner.py`, `electron-builder.yml` — commandes natives déterministes ; isoler aussi sous-processus Python/imports ; qualifier roster, hooks et sorties.
- [x] `src/contracts/dialogue.ts`, `src/core/{ports,dialogue,application}.ts`, `src/adapters/persistence/workflow-store.ts` — métadonnées atomiques/versionnées par conversation : invocation, contexte, observations et empreintes.
- [x] `src/adapters/codex/dialogue.ts`, `src/{main,preload}/index.ts` — référence, outils stricts, corrélation, copie confirmée, erreurs/effets incertains explicites.
- [x] `src/renderer/src/{App.tsx,strings.ts,styles.css}` — action « Mettre une idée à l'épreuve », préparation inline, portée, destinataire et résultat observé ; Sally/Impeccable sans refonte.
- [x] `tests/forge*.test.mjs`, `tests/workflow-store.test.mjs`, tests dialogue — scripts réels, sorties, chemins/imports/conflits, erreurs disque, corrélation, restauration et Mary.
- [x] `scripts/qualification/forge.mjs`, dossier épique `qualification-boucle-bmad/` — banc distinct, compilé/paquet, captures synthétiques, preuve live installée sur témoin ; versions/réseau, arrêt/réouverture et nettoyage.

**Acceptance Criteria:**
- Given un profil compatible, when Forge démarre, then skill natif, invocation/contexte/effets correspondent ; aucun brouillon envoyé.
- Given un parcours réel, when il se clôt, then journal et HTML sont relus ; HARDENED conserve aussi le Markdown, sans acceptation inférée.
- Given une défaillance de la matrice, when elle survient, then refus/inconnu explicite, saisie conservée, aucun replay.
- Given une sauvegarde arrêtée, when le paquet installé rouvre, then échanges, invocation, observations et brouillon persistent sans moteur.
- Given Mary/navigation/thèmes, when les régressions passent, then comportements et frontières restent valides.

## Implementation Notes

- 2026-10-26 — Préparation validée sous mandat autonome : périmètre unique, analyse de trois explorateurs et contribution Sally réellement activée ; aucune question produit restante. Baseline suivie propre, installations/caches non suivis préexistants exclus. Exécution séquentielle : l'agent d'implémentation possède toutes les tâches/fichiers de ce plan. Il n'est pas seul dans le dépôt ; préserver les travaux des autres agents et s'adapter sans les annuler. Ne pas modifier le bloc d'intention figé, les tickets ou les anciennes preuves.
- 2026-10-26 — Inspection préparatoire distincte de 1.12 : installation personnelle retrouvée par chemin explicite `C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe`, archive `5c805e2d2fc465d11b01dca14fb58e39b5d83d0ee2df5de6becb3cda04c00aa4` conforme au sombre historique. Aucun processus Madness au contrôle ; présence seule du fichier chiffré propre à Madness sous `C:/Users/UP60066553/AppData/Roaming/Madness`, aucun contenu lu. Cela ne prouve pas la validité du compte ; aucune installation ou connexion effectuée. Recontrôler fermeture et préservation des données avant toute livraison ; une saisie active nécessite l'intervention du porteur. Le digest source de 1.12 est une baseline historique consommée au début, pas une exigence d'identité après les modifications légitimes de 1.3 : produire les preuves fraîches de 1.3 sans réécrire 1.12.
- 2026-10-26 — Première vérification installée avant revues : paquet installé ASAR `8f875f02fc3edbdb4eb2a1b19a930550398eaf810e4e27045050ec05a73106b0`, données préservées à l'installation, parcours natif CLARIFIED avec journal/HTML relus, 19 observations, arrêt/réouverture sans moteur ; six contrôles live réussis sur données fictives. Suite complète exécutée par le parent : 137/137, zéro ignoré. Audit des quatre lignes de matrice réussi, preuves sous `../qualification-boucle-bmad/final-verification.json`. Acceptation humaine, gates et distribution non inférés.

## Plan Change Log

- 2026-10-26 — Essai installé : accueil natif et resolvers workflow/config réussis ; le premier message avec idée/but provoque un vrai `bmad_forge_init` avant personas. Le protocole impose à tort personas avant init, alors que le SKILL natif présente la création du journal puis les personas dès que le but est connu. Corriger cette restriction d'ordre sans élargir les outils : init après l'activation/configuration ; personas native toujours exigée avant clôture. Ajouter le test init → personas et le refus de clôture sans personas. Les premiers incidents du banc (sessionData altéré et variables proxy omises) sont distincts : coffre intact, aucun patch TLS/produit motivé par eux. La preuve live reste partielle et les conversations d'essai sont préservées.

## Review Triage Log

| Constat | Verdict | Vérification | Route |
|---|---|---|---|
| Quick-1 · qualification remplacée avant lancement (`src/core/dialogue.ts:59`) | high | `execute` efface le profil présenté, puis `launch` accepte une nouvelle configuration compatible ; la comparaison d'`openCodexDialogue` ne relie que deux lectures ultérieures. Une sortie/initiative modifiée peut donc remplacer celle vérifiée sans refus. Les empreintes et chemins déjà disponibles suffisent à une comparaison avant ouverture. | patch |
| Quick-2 · anciens résultats Forge invisibles (`src/renderer/src/App.tsx:77`) | medium | `workflow` dépend uniquement de la conversation courante ; la liste historique restitue les messages et omet les annexes pourtant présentes. Rendre le même bloc de résultat auprès des conversations déjà rendues rétablit l'accès sans nouvel écran ni API. | patch |
| Quick-3 · descendant après arrêt annoncé (`src/adapters/bmad/forge.ts:53`) | false | Vérification du vrai UV/Python : après arrêt d'UV, Python reste brièvement vivant mais `stopNative` retourne **false**, puis le descendant finit naturellement. Les pipes hérités restent observés ; le runner transforme false en `STOP_UNCONFIRMED`, et le coordinateur en état unknown bloqué. Les sous-processus qualifiés sont synchrones. L'absence de terminaison d'arbre ne démontre donc pas l'arrêt réussi revendiqué dans le constat ; preuve `../qualification-boucle-bmad/review-stop-check.json`. | rejeté |
| Quick-4 · 201e annexe admise mais illisible (`src/adapters/persistence/workflow-store.ts:25`) | medium | Le Snapshot admet 1000 conversations mais le contrat dialogue et la lecture des annexes s'arrêtent à 200 ; ni write ni l'ouverture Forge ne bloquent la 201e. La limite existante doit être appliquée avant ouverture du fournisseur et avant création du fichier, en conservant lecture/mise à jour des 200 admis. | patch |

Les trois corrections sont des opérations locales sur des états déjà démontrés, sans nouvel outil ni contrat IPC. Les racines sont distinctes ; aucun regroupement, report ou changement d'intention. La finition Impeccable demande une recapture ciblée du résultat et de l'historique aux deux dimensions avant sa revue complète ; aucune défaillance visuelle n'est encore conclue.

Corrections appliquées par le même implémenteur : profil préparé cloné et comparé intégralement avant ouverture ; composant de résultat réutilisé pour les historiques avec retour de copie local ; limite `MAX_WORKFLOWS` partagée et appliquée au lecteur, écrivain et lancement. Reproduction rouge puis 19 tests core/stockage et deux UI ciblés ; vérification complète du parent **147/147, zéro ignoré**. La nouvelle livraison et les preuves UX/live doivent encore être confirmées après ces correctifs.

| Constat de finition UX complète | Verdict | Vérification | Route |
|---|---|---|---|
| UX-1 · arrêt/erreurs/profil Forge dans la région Mary | medium | Le bloc `.dialogue-launch` étiqueté par `mary-title` contient ces retours partagés et plusieurs chaînes d'erreur désignent Mary. Les états Forge sont déjà connus ; déplacer ces commandes/retours dans une région de session correctement nommée et neutraliser les messages rétablit le destinataire. | patch |
| UX-2 · prérequis du bouton Forge sous le pli dans Mary | medium | Le bouton Forge est désactivé si compte absent ou forfait non acquitté, mais les explications correspondantes suivent les commandes Mary. Réutiliser ces explications près de l'action Forge rend la récupération visible sans nouveau flux. | patch |

Impeccable : disposition `fix` après revue complète des six captures. Un seul lot de corrections demandé ; préparer ensuite les mêmes vues et les deux préparations pour une passe de verdict sur cette liste. Conserver palette, composition, préparation inline, observations repliables et distinction clôture/acceptation.

Corrections UX confirmées : 5 tests ciblés, puis suite parent **151/151, zéro ignoré**, types/build/installateur, huit contrôles paquet final et cinq régressions Windows réussis. Main/preload inchangés depuis le banc compilé huit contrôles ; empreinte Main identique. Impeccable : deux corrections notées resolved, disposition ship à cette seule portée après vues complémentaires ; documentation terminée, système et contrats préservés, dérives préexistantes consignées sans réparation. Types spécialisés non exposés : rôles officiels chargés par des agents techniques frais, substitution déclarée. Aucun correctif de ce lot différé.

Paquet final installé ASAR `0ac73f5943520b7a6c3a5087c51beb8c219fb4336eb1f80eee267d53a7e998a8`, données identiques à l'installation ; nouvelle idée fictive du carnet de lecture, **27 observations**, journal/HTML relus, six contrôles live dont arrêt et réouverture exacte sans moteur/réseau. Première preuve avant revues conservée séparément. Rapport final `../qualification-boucle-bmad/final-verification.json`. Nettoyage des espaces jetables ; témoin lié à l'historique conservé. Acceptation humaine, G0/G1 et distribution restent distincts.

## Design Notes

Sally activée : placements déjà couverts. Impeccable Operate/Harden, tokens/clavier/focus existants. Fin de tour distincte de clôture/acceptation ; chemins historiques datés. Sous-processus personas isolés comme leur parent, sans site-packages non qualifiés. Route full : plusieurs centaines de lignes.

## Verification

`npm test`, `npm run build`, paquet `dist/forge-pilot/`, banc Forge et régressions Windows. Inspection bureau/compact groupée, une confirmation au plus ; revues BMad/UX. Preuve live distincte sur paquet installé : activation/resolvers/personas/memlog, livrable, arrêt/réouverture. Authentification ou preuve manquante reste en attente.
