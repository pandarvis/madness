---
title: 'Recomposer Madness autour du projet et de la conversation'
type: 'refactor'
ticket: ''
created: '2026-10-28'
status: built
baseline_revision: 'b651f428010f7fc4c232db3b6ee482b9e208dbbe'
route: 'full'
route_source: 'pinned'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/preparation-refonte-2026-10-28/preparation-refonte.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les grands blocs de préparation et de diagnostic repoussent le projet, ses onglets et l’échange sous le premier écran. Le porteur juge les boutons grossiers et demande une refonte avec Sally, plusieurs expertises UI/UX et Impeccable, inspirée de ChatGPT Desktop.

**Approach:** Recomposer l’espace de travail livré selon les contrats Sally actualisés : projet et onglets d’abord, conversation et réponse au premier plan, préparation Mary/Forge dans Parcours et contexte consultable à la demande. Remplacer les commandes utilitaires massives par des SVG compacts, en conservant palette terracotta/bleu, clair alternatif et contrôle explicite des opérations.

## Boundaries & Constraints

**Always:** Reprendre la composition Parcours guidé et le thème choisis. Commande unique d’ouverture, SVG19px sur cible40px, aide visible au survol/focus et Échap ; bascule dans la barre native56px, axe du rail28px. Garder projets, onglets, conversation, positions de lecture et saisies indépendantes, destinataires attestés ou inconnus et états historiques exacts. Une bande courte expose tout arrêt/effet incertain et sa portée ; détails de récupération accessibles, contrôles réellement bloqués. Avant approbation : patch et portée complets, choix ponctuels textuels. Sauvegarder, qualifier, lancer, envoyer et décider restent distincts. Réduction de mouvement, clavier, thèmes et fenêtre compacte pris en charge. Les contrats et copies reflètent l’usage personnel privé courant, sans effacer les preuves historiques.

**Never:** Changement de Main/preload/contrats métier/connecteur/authentification/TLS/persistance, rejeu d’effet ou migration. Versions/dépendances/package conservés dans ce lot. Aucun catalogue complet, recommandation bmad calculée, anglais, explorateur/éditeur, initialisation, graphe, Loop ou mesure temps/coût ajouté. Aucun nouveau compte/modèle/clic réseau ou accord humain inventé par les tests. Ne pas modifier le paquet installé0.1.2 ni ses manifestes historiques pendant la qualification native1.11 en attente ; le candidat UX est construit séparément et identifié par son ASAR. Ni G1, ni acceptation visuelle humaine déduits de ce lot.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Accueil et projet | Profil synthétique vide puis plusieurs récents, noms longs | Titre et destinations immédiatement identifiables ; un seul Ouvrir, pas de grande commande orange dominante | Absence et erreur restent expliquées, aucun diagnostic fictif |
| Barre native et rail |1440/1320/720/600px, menu déployé/replié/tiroir | Ouvrir et bascule40px, centres bascule/rail alignés28px ; zones Windows et drag/no-drag préservées | Pas de contrôle rogné ni défilement horizontal ; aide au clavier sans dépendre du survol |
| Conversation | Historique synthétique, tour progressif, saisie non enregistrée | Échange sélectionné et son point de réponse avant toute préparation volumineuse ; changer onglet/projet/thème ou consulter contexte conserve les saisies | Reçu, stockage et identité inconnus restent nommés ; aucun envoi/qualification/lancement par navigation |
| Préparation explicite | Conversation vide puis choix Préparer un échange | Parcours présente Mary/Forge, qualification et mode fichiers puis lancement explicite ; navigation acquittée rejoint la bonne conversation | Focus après montage ; autre projet/retour tardif ne détourne ni contexte ni sélection |
| Attentes et récupération | Question/approbation actives, historiques inactives, arrêt global/effet inconnu | Attente corrélée retrouvable, action exacte ; bande critique toujours visible, détails et garde conservés | Aucun choix par défaut ; patch complet avant boutons ; ancien reçu ne réactive rien, inspection précède nouveau tour |
| Détails et fenêtres | Panneau contexte sur demande, compact,200%zoom, deux thèmes, reduced motion | Chemins/provenance accessibles, fermeture Échap/focus correcte, lecture et saisie utilisables ; animation dossier brève et statique si mouvement réduit | Détails de confort repliables, informations indispensables aux décisions jamais masquées |
| Conservation | Sauvegarde puis fermeture/réouverture d’un profil synthétique | Même brouillon, préférences et historique ; aucune activité fournisseur ni réseau spontané | Nettoyage des seuls profils possédés après fermeture ; échec conserve les éléments utiles et sa preuve |

</frozen-after-approval>

## Code Map

- `src/renderer/src/App.tsx` : état, destinataire et gardes138–174, envoi/sauvegarde202–256 et navigation296–310 à conserver. Recomposer JSX370–445 : overview avant h1 actuellement, préparations385–410 et composer431 dans les deux onglets. Conserver IDs de cibles, `sameContext`, `respondable`, `canReply`, jeton anti-navigation tardive et tableaux de brouillons. Les actions qui focalisent Mary doivent rejoindre Parcours et attendre son montage.
- `src/renderer/src/styles.css` : palettes existantes et typographie système conservées ; barre94 et breakpoints233–235 ont padding gauche18/22/14 contre rail8+40/2=28. Géométrie native/env titlebar et exclusions drag intouchées. Refaire hiérarchie, densité, cibles et panneaux sans couche d’overrides contradictoires.
- `src/renderer/src/WorkOverview.tsx` : une projection et un annonceur poli ; entrées de portée globale conservées depuis un projet, seuls récapitulatifs filtrés. Connexion/récaps longs secondaires à la demande, sans masquer attente ou récupération.
- `QuestionPanel.tsx`, `ApprovalPanel.tsx`, `RecoveryPanel.tsx`, `NetworkHelp.tsx` : comportements, IDs et gardes existants à réutiliser ; modification de composition/copy limitée si nécessaire, pas de nouvelles règles. `strings.ts` : copies françaises nécessaires seulement. Un petit composant d’icône/commande partagé est possible dans ce dossier.
- `tests/connection-ui.test.mjs` : renderer compilé, ponts synthétiques et réseau bloqué, profil jetable ; réutiliser questions, streaming/ancrage, navigation concurrente et approbations. Adapter les changements d’onglet des scénarios, sans retirer d’assertion métier.
- `scripts/qualification/{overview,windows,theme,dialogue,forge,conversation,questions,approvals,recovery}.mjs` : scénarios/UI et sélecteurs à adapter seulement si le nouveau placement l’exige ; support `benchOutput`1.11 désormais committé dansb651f428010f7fc4c232db3b6ee482b9e208dbbe à préserver. Les scripts historiques peuvent rester sur leurs défauts ; pour tout nouvel essai fournir sortie neuve. `epic-one-personal.mjs` : seule navigation de préparation initiale peut être adaptée pour fonctionner dans les deux compositions ; ne toucher aucune garde/protocole/archivage.
- Nouveau `scripts/qualification/workspace-design.mjs` : banc dédié sans compte, reprenant fixtures/fermeture deoverview et capture possédée detheme ; capture depuis haut de document, pas son scroll systématique bas. Noms réellement longs etzoom non prouvés actuellement : à ajouter, pas à prétendre hérités.
- Contrats Sally et `preparation-refonte-2026-10-28/update-contracts.md` : direction de conception ; les cinq captures avant sont des données synthétiques de l’app0.1.1 dont renderer est inchangé en0.1.2.

## Tasks & Acceptance

**Execution:**
- [x] `src/renderer/src/App.tsx`, `WorkOverview.tsx`, `styles.css`, petits composants voisins — appliquer la recomposition et les commandes compactes, préserver les autorités/handlers et gardes, réduire les copies répétées sans perdre les faits.
- [x] `tests/connection-ui.test.mjs` — adapter les transitions d’onglets requises et ajouter régressions significatives : travail visible d’abord, contexte accessible/retour focus, conservation de saisie et absence d’effets par navigation, bande globale et demandes exactes.
- [x] `scripts/qualification/workspace-design.mjs` et seuls sélecteurs nécessaires des bancs existants — produire preuves/captures neuves de la matrice, dimensions/axe mesurés, profils sans compte nettoyés. Conserver intégralement les assertions métier historiques.
- [x] `docs/development.md` — commandes du banc et limites du candidat de refonte, pas de nouvelle capacité fournisseur.
- [x] `ux-madness/qualification-refonte/` — parent possède preuves, deux tours visuels groupés maximum, détecteur Impeccable une fois, experts indépendants/finish-reviewer/documenter, paquet séparé et éventuelle installation après résolution du maintien0.1.2 pour1.11.

**Acceptance Criteria:**
- Given un projet et une conversation synthétiques, when Conversation est ouverte, then ses échanges/demande/saisie arrivent avant les grands blocs de préparation, le contexte complet est consultable et l’onglet reste identifiable dès le premier écran.
- Given une demande de préparation ou récupération, when elle est suivie au clavier, then la bonne vue est montée et la bonne cible reçoit le focus, sans nouvelle commande fournisseur implicite ni perte de saisie.
- Given les tailles et thèmes de la matrice, when ouverture/bascule/contexte sont utilisés, then les cibles et axes sont mesurés conformes, les contrôles Windows libres, et les informations nécessaires restent lisibles sans débordement horizontal.
- Given une attente native simulée ou un ancien résultat incertain, when le rendu est recomposé, then même contexte, portée, désactivation et décision explicite sont conservés ; aucune preuve de session/humain/modèle n’est fabriquée.
- Given le candidat exact construit, when tests/bancs/revues sont terminés, then rapports et ASAR l’identifient sans réutiliser les reçus d’un autre paquet, et la conclusion nomme sa portée visuelle et technique sans clôturer G1.

## Implementation Notes

Plan distinct autorisé par le mandat de refonte autonome. Qualification1.11 en cours dans une autre invocation, action réseau humaine en attente ; son point intermédiaire est committéb651f428010f7fc4c232db3b6ee482b9e208dbbe. Les seuls edits suivis restants au démarrage sont les contrats Sally du présent lot ; caches gérés et données `.working` préexistantes ne sont pas à annuler/stager. La validation déléguée couvre plan/revues/commits, sans nouvelle question de style ni seuil en tokens. Propriété : implémenteur pour renderer, tests/bancs/doc technique nommés ; parent pour plan, états, direction Impeccable, preuves, revues et livraison. Il n’est pas seul : préserver les edits d’autrui. Aucun commit, profil personnel, modèle, réseau ou installation par l’implémenteur. Écrire et constater échouer les régressions significatives nécessaires avant l’implémentation, puis recontrôler les comportements ; aucun test de simple copie du code.

Impeccable context déjà exécutéUNEfois pour cette session ; ne pas le relancer. SKILL/New-work/Operate déjà chargés au parent ; implémenteur doit lire craft-floor immédiatement avant ses premiers edits UI et conserver les contrats. Ce lot étend la composition acceptée, ne remplace ni monde visuel ni palette par un catalogue. Pas de raster nécessaire : glyphes SVG existants. Ne pas ouvrir de boucle de polish autonome ; parent réalise deux tours de captures groupées puis finish handoffs frais, jamais auto-certification. Documentation Impeccable finale dans les frontières des contrats adoptés, dérive préexistante signalée sans réparation incidente.

## Plan Change Log

## Review Triage Log

- P1 — lecture parent du banc en step03, high/patch, résolu : le wrapper Playwright ne prouvait pas la fermeture du vraiMain. Banc et tests dédiés renforcés par identité OS/close/disparition, incertitude conservant le profil, compteur passif app-server/réseau sans args/env/transport. Mutant wrapper détecté,3/3ciblés puis12/12compilés et12/12paquet ; deux vraisMain distincts des wrappers, zéro compteur après hook et cleanup confirmé. Aucun produit modifié par cette correction.

- Tour visuel1 —12PNG valides du candidat initial inspectés par le parent puis trois experts indépendants (composition, guidage, accessibilité), sans nouveau lancement ni détecteur par eux. Constats consolidés à corriger en une seule passe : U1(C1/E1/A2) demande active avant historique et demandes inactives, point de réponse accessible dès le premier écran ; U2(C2/C3/E2) bande critique réellement courte et arrêt non confirmé/nouveaux échanges bloqués explicités hors détails, portée et chemins de récupération exacts conservés ; U3(E3) brouillon libre distinct de la réponse à une question native ; U4(A1) reproduire puis rétablir un focus neutre si le contrôle actif disparaît/expire, sans détourner le focus d’une autre surface. Tous relèvent du contrat figé, pas d’une nouvelle capacité. Paragraphe de processus « qualification intégrée/acceptation visuelle » dans le contexte : retirer du produit, la portée réelle des fichiers restant lisible. Aucun point déclaré résolu avant recontrôle.

Recontrôles après l’unique lot de corrections entre les deux tours :

- Q1 — revue Quick, medium/patch, confirmé : pendant une sélection différée de `navigateOverview`, « Préparer un échange » peut changer le jeton sans retirer `pending`. Le finally de l’ancienne navigation devenu obsolète ne le retire plus ; les commandes restent indisponibles jusqu’à une navigation réparatrice. Le bouton de préparation reste accessible dans cette situation. Correction minimale : retirer `pending` au moment de cette invalidation volontaire, comme `chooseTab`, sans nouveau contrat ; régression de la course à reproduire et recontrôler. Correction et tests différés au retour de l’essai personnel actif, pour ne pas superposer les bancs UI ; ce n’est pas un report hors du lot.

- Q1 — recontrôle, medium/patch, résolu : même implémenteur, seul ajout setPending(false) dans prepareExchange ; test de course rouge puis3/3ciblés et355/355globaux. Nouveau candidat6664... :75contrôles intégrés/12disposition et conservation réussis. Relecteur Impeccable existant constate Q1 résolu, transfert limité au rendu embarqué inchangé et aucune recapture nécessaire ; recheck documentaire confirme les empreintes/spines préservées. Aucun correctif différé.

- U1(C1/E1/A2), medium/patch, résolu : demandes waiting/sending avant messages et historique secondaire, conservation des valeurs/IDs, cinq positions de travail mesurées sur le candidat. Ciblés puis confirmation7/7, banc compilé12/12 et candidat12/12 ; douze captures du second tour ouvertes.
- U2(C2/C3/E2), medium/patch, résolu : bande compacte sans répéter le nom du projet courant ; arrêt effectivement non confirmé, portée globale et nouveaux échanges bloqués explicites hors détails, sans attribuer ce blocage à toute erreur réseau. Contrôle global positif et retrait de ce libellé après erreur réseau seule vérifiés.
- U3(E3), medium/patch, résolu : brouillon libre nommé distinctement pendant question/approbation, instruction vers le formulaire corrélé et sauvegarde locale préservées ; ancien envoi libre reste désactivé. Contrôle significatif passé, aucune identité attestée inventée.
- U4(A1), medium/patch, résolu : reproduction puis contrôles positifs de focus neutre après envoi, expiration, décision et retrait, avec ouverture du détail historique si nécessaire ; une saisie extérieure conserve son focus. Contrôles passés sans focus sur Autoriser. Paragraphe de processus retiré du contexte produit.

Deux tours visuels groupés achevés, détecteur unique sans constat. Revue de finition fraîche appliquant la définition officielle Impeccable : `ship` sur le candidat séparé, fidélité conforme aux autorités héritées, aucune correction matérielle. Absence de carte QUALITY BAR distincte et échantillonnage source explicites ; ni validation humaine ni G1. Rapport [de finition](ux-madness/qualification-refonte/finish-review.md).

## Design Notes

Parcours sert la préparation ; Conversation sert le travail. Les blocs d’approbation conservent leurs libellés textuels, car l’intention d’une autorisation est plus importante que le gain d’espace. Les utilitaires utilisent les icônes, sans transformer leurs cibles en petits glyphes difficiles à atteindre. Un contexte replié ne doit pas faire disparaître la portée d’une décision ou un arrêt inconnu.

## Verification

- `node --test --test-concurrency=2 tests/connection-ui.test.mjs` : fixtures synthétiques, aucune assertion existante supprimée pour faire passer le nouveau placement.
- `npm run typecheck`, `npm run build` ; suite complète appropriée après stabilisation, puis candidat Windows construit dans `dist/workspace-design/` sans toucher `dist/forge-session-check-final/` ni le programme installé.
- Banc dédié : renderer compilé puis candidat exact, bureau/compact, deux thèmes, noms longs, zoom, clavier/réduction de mouvement et restauration sans fournisseur. Régressions Windows ciblées sur candidat exact. Ne pas relancer les vieux contrôleurs personnels ou le mode phaseA demaintenance figé0.1.0.
- Parent : captures valides haut de document/état consigné, deux tours groupés maximum ; Impeccable detect une fois et finish-reviewer/documenter frais avec leurs définitions officielles, transparence si rôles spécialisés non exposés. Plusieurs expertises UI/UX indépendantes demandées par le porteur, avec constats triés et corrigés/recontrôlés.
- Matrice auditée avant step04 BMad ; aucun résultat visuel humain, audit WCAG/NVDA, réseau natif ou G1 inventé. Remplacement personnel seulement quand l’artefact0.1.2 n’est plus requis par la qualification ouverte et après garde de fermeture/conservation.
