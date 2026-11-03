---
title: 'Implémenter la charte atelier des agents dans Madness'
type: 'feature'
ticket: ''
created: '2026-11-02'
status: 'built'
baseline_revision: 'c685d7c737b161d3231594a75280521f4d50e0e0'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/PRODUCT.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/handoff.json'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/preparation-integration.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le porteur a approuvé une nouvelle charte atelier illustré, avec des visages originaux pour les agents BMad. L’application actuelle garde son ancien aspect et n’offre pas la fiche informative repliable imaginée ; l’habillage doit devenir cohérent sans masquer le travail, ses limites ou ses décisions.

**Approach:** Traduire la référence atelier approuvée en vrais composants React et styles sur les surfaces livrées : navigation, conversation dominante, portraits compacts et fiche agent à droite, aides, demandes, connexion et récupération. Anthracite chaud, bleu pétrole, terracotta, ivoire ; plaques peintes mates, contours encrés et angles coupés sur le chrome, lecture calme. Le sombre reste le défaut et le clair une déclinaison complète. La maquette reste une référence de direction, son contenu fictif ne devient pas une fonction.

## Boundaries & Constraints

**Always:** Conserver les comportements de2.17 et ceux du candidat2.2, leur contexte et leurs limites. Portrait et fiche de message dérivés seulement d’une identité attestée par item ; nom/source restent visibles et toute identité inconnue reste inconnue. La fiche est informative, ne lance rien, se ferme et rend sa largeur au travail. Aucun grand personnage permanent dans les longues séances. Conserver commandes Windows natives, bascule du rail en barre de titre, cibles40px/SVG19px/axe28px, commande unique d’ouverture de projet à icône, navigation clavier/focus, zoom200%, mouvement réduit, lecture/scroll et brouillons. Questions et patchs conservent leur contenu intégral et leur priorité avant décision ; envoi, enregistrement, accord et refus restent explicites et distincts. Les vrais états absent/partiel/chargé/transmis/conservé/inconnu et la récupération restent accessibles. Préserver toutes les données personnelles et les ressources natives épinglées.

**Never:** Pas de persona prétendument activé par un portrait, de visage déduit du texte/invocation/recipient, de changement de fournisseur, d’envoi, de lancement ou de fermeture d’autorisation par la fiche. Pas de données ou fonctions fictives de maquette : pièce jointe, fichiers/éditeur, préférences générales, catalogue, graphe et initialisation ne sont pas ajoutés. Pas de migration Snapshot, IPC nouveau, accès renderer Node/fs, contournement réseau ou modification de scripts/runtime BMad. Ne pas faire passer2.2 pour built ni commencer2.3 ; sa qualification native se poursuit séparément. Pas de nouvelle conception alternative demandée au porteur : la direction visuelle et l’autonomie sont acquises.

## I/O & Edge-Case Matrix

| Scénario | Entrée/état | Comportement attendu | Erreur/repli |
|---|---|---|---|
| U1 atelier | Accueil, projet et conversation dans les deux thèmes | Même grammaire d’atelier sur tous les contrôles, fonds calmes et texte lisible ; commandes réelles conservées | Aucun thème lavande résiduel ou décor derrière une décision |
| U2 auteur attesté | Message de l’un des sept noms, source attestée | Portrait compact et nom/source exacts ; fiche de ce message ouvrable et refermable | Illustration ne devient ni état d’activité ni preuve supplémentaire |
| U3 auteur inconnu | Unknown, historique sans projection, nom hors casting, texte « Mary », invocation Mary/Forge/$bmad | Repli générique ; le texte et la provenance réellement connus restent visibles | Aucun visage choisi par approximation |
| U4 fiche locale | Ouvrir/fermer, auteur alternant, changement de projet/conversation ou disparition de source | Contexte de consultation exact, focus rendu au bon déclencheur ou repli stable ; aucune commande métier | Pas de retarget vers le dernier message ni d’annulation de connexion |
| U5 disposition | Rail ouvert/compact, fiche ouverte/fermée,1600/1440/1323/720/600, zoom200% | Conversation utile ; fiche dockée si place, traitement étroit accessible ; fermer récupère l’espace | Aucun débordement horizontal ou commande rognée ; identité et saisie non masquées |
| U6 demandes | Question/accord actif puis expiré, patch long, erreur ou arrêt inconnu | États et décisions lisibles avant choix, priorités et corrélation conservées | Aucun choix par défaut ni nouvel accord/rejeu/reprise |
| U7 saisie | Brouillon non enregistré, fiche/thème/onglet/projet puis retour | Texte, sélection et destination préservés ; saisie et sauvegarde distinctes de l’envoi | Erreur de stockage honnête, pas de perte silencieuse |
| U8 aides | Absent/partiel/nativeReady false, lecture/erreur, reçu/historique/stockage échoué | HelpPanel et reçus gardent leurs frontières ; copie/retry local séparés d’un lancement | Aucune recommandation inventée ; préparer/consulter ne transmet pas le brouillon |
| U9 assets | Image lente/absente, nom et chemins longs, police non encore chargée | Espaces réservés, repli visuel propre, accents lisibles ; pas de saut de lecture imposé | Pas de photo cassée ou texte remplacé par une image |
| U10 fermeture | Réouverture du profil synthétique et consultation de fiche | Messages/demandes/brouillons et thème exacts ; aucun moteur/réseau lié à la fiche | Une inconnue reste inconnue, sans restauration de commande active |

## Précisions UX déléguées après relecture Sally

- **UX1 panneaux et Échap.** Un seul panneau informatif visible. Ouvrir la fiche masque les panneaux secondaires par état de présentation seulement, sans closeConnection/cancel ni autre commande métier ; une connexion engagée continue. Ouvrir Connexion ou Contexte masque la fiche sans la réaffecter ou la rouvrir automatiquement. Une vraie modale préexistante garde priorité. Fiche dockée : région nommée, Tab libre ; fiche étroite : dialogue modal accessible. Échap ne ferme qu’une surface, est consommé et ne remonte pas vers une annulation de connexion. Retour au déclencheur exact ou au titre neutre de la conversation si la source a disparu. Le changement de seuil conserve fiche, lecture et saisies.
- **UX2 attention pendant la fiche.** Une question, approbation ou récupération arrivée ne déplace pas le focus vers une décision et ne change pas la fiche. En mode étroit, afficher/annoncer une fois un statut bref et une navigation explicite vers la demande ou récupération corrélée ; elle ferme uniquement la fiche et rejoint sa cible exacte sans envoyer, accepter, refuser ou interrompre. Si la demande expire, viser son historique inactif exact ; aucun remplacement par une demande récente. En mode docké, conserver le repère durable et son accès. Tester ces arrivées et l’expiration avec inertie et focus.

</frozen-after-approval>

## Execution ownership

Worktree d’implémentation exact : C:/Users/UP60066553/.codex/worktrees/madness-atelier-ui/madness, branche codex/atelier-ui. Le worker unique possède le renderer et ses nouveaux composants/assets, les tests/qualifications UI listés, nativeColors et la liste des types statiques du protocole renderer de Main, version0.2.1 et notices. Il n’est pas seul dans le codebase : préserver toutes les autres modifications et adapter son lot sans les révoquer. Le parent possède le plan, les preuves finales, captures, revues, documentation et commit ; Sally réconcilie les spines au rendu final. Le worker ne lance pas bmad-build récursivement et ne commet/pousse pas.

Le worker fait types/build et tests significatifs, sans compte/profil personnel/helper BMad ou modèle. Coordonner par message avec le parent avant toute exécution Electron de tests/qualification pour réserver le créneau : la qualification2.2 personnelle utilise séparément la même machine. Aucun screenshot exploratoire autonome ; parent seul possède les deux tours visuels. Choisir les détails d’implémentation cohérents laissés ouverts et les consigner, sans nouvelle interview.

Avant première UIedit, lire C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/reference/craft-floor.md. Contexte et new-work déjà appliqués : ne pas relancer context, concept-seed ou détecteur. Le contrat est .impeccable/surfaces/src-renderer-src-app-tsx.md, les manifests sont dans .working/atelier-character-assets/ et atelier-scene-assets/. Pour les PNG réellement copiés dans les assets frontend, préserver les originaux et la provenance ; les métadonnées de prompt peuvent être embarquées par le CLI Impeccable, sans retouche des pixels. Fonte SHA256 e476562ec9c1e16cf16475895b511f08c804f438cc9a9f80a44ea50a0eeb5b65, licence locale. Le CLI est C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/scripts/impeccable.cmd. Les documents de direction et règles de développement ne vont jamais dans le DOM, bundle ou fichiers servis.

## Code Map

- src/renderer/src/App.tsx : MessageArticle et ConversationMessages portent déjà projection.identity, fusion par id et scroll stable. recipient est seulement le destinataire de l’invocation ; ne jamais l’employer comme preuve d’auteur. Ajouter état de consultation local et point d’entrée de fiche au message attesté reconnu, conserver tous les handlers d’envoi/questions/accords/connexion et leurs contextes.
- src/renderer/src/AgentPortrait.tsx, AgentInfoPanel.tsx et agentPresentation.ts proposés : registre de présentation pur des sept personnages Mary/John/Sofia/Winston/Sally/Amelia/Smithy, images locales et descriptions de rôle. Pas de nouvelle propriété dans les contrats exacts MessageIdentity/DialogueState. Une fiche peut décrire le rôle sans affirmer compétence installée ou activité.
- src/renderer/src/styles.css et help.css : tokens sémantiques et styles de tous les états existants, topbar56px/env(titlebar-area-*), no-drag, rail58px/axe28px et boutons40px. Recomposer chrome et conversation avec la grammaire approuvée ; conserver mesure65–75ch et séparation des sources, questions, patchs et reçus. Autres composants renderer seulement si nécessaires à cet habillage.
- src/main/index.ts:97 : exception au périmètre renderer : constantes nativeColors synchronisées, et admission des seules fontes TTF embarquées par le protocole madness sous rendererRoot. Garder host/path confinement, CSP et refus des autres types ; hauteur56 et toute logique métier/IPC/connexion restent identiques. Les tests appearance et contrôle Windows ciblé couvrent ce delta. Ne pas réécrire Main.
- Assets de préproduction : .working/atelier-character-assets/ contient sept PNG transparents1254² natifs et manifeste des prompts/SHA ; .working/atelier-scene-assets/ reçoit deux décors natifs maximum, sans texte/personnage/interface. Copier uniquement les assets retenus dans src/renderer/src/assets/atelier/ avec provenance et tailles réservées, sans utiliser la maquette entière comme fond. Le décor reste au chrome ; retirer/réduire les bandes illustrées quand l’espace de travail manque. Ne pas charger les sept bustes en grand dans le DOM initial.
- Typographie : corps Segoe UI existant ; titres courts et noms en Barlow Condensed Bold auto-hébergée, choix d’implémentation du développeur. Fichier109912octets et OFL1.1 téléchargés depuis le dépôt officiel Google Fonts, sous .working/atelier-font-assets/ ; vérifier signature TTF/SHA, conserver licence/notices. Aucun chargement de police externe à l’exécution.
- tests/connection-ui.test.mjs : launch/workspaceRequestFixture/setSnapshot/setDialogue et blocage HTTP(S).39cas existants, ajouter cas de fiche/identité/inertie et HelpBridge synthétique strict (actuellement absent). Schémas syntheticBundle/record dans tests/bmad-help.test.mjs servent aux fixtures, sans vrai helper.
- scripts/qualification/workspace-design.mjs : runWorkspaceDesign, vrais Main/preload sur profilTemp, emit/geometry/workPosition/shot, thèmes et1440/1320/720/600, zoom200%, questions/accords/récupération et réouverture binaire. Étendre au nouvel habillage et1600/1323, provenance renderer/CSS/assets. Réutiliser compteur après hook et fermeture/nettoyage possédés ; ne pas relancer helper/OAuth/cache pour le style.
- Documentation : PRODUCT.md Brand Commitments seulement ; surface brief Impeccable direction contract avant code ; DESIGN.md racine et .impeccable/design.json décrivent le nouveau monde fini. Sally réconcilie les deux spines UX, leur memlog et les références après le rendu final, sans rendre les stories futures disponibles. Préserver les anciens reçus/captures sous leur hash.

## Tasks & Acceptance

**Execution:**
- [x] .impeccable/surfaces/src-renderer-src-app-tsx.md et dossier UX atelier-agents-2026-11-02 — persister le contrat de direction/critique et la provenance ; code-led est la préférence existante explicite de .impeccable/config.json. Seed09fa5971, affectation5 en mode dégradé sans catalogues/QUALITY BAR après essai escaladé répété ; la direction atelier déjà approuvée prime. Pas de nouveaux comps ni de nouveau vote.
- [x] src/renderer/src/assets/atelier/, agentPresentation.ts, AgentPortrait.tsx, AgentInfoPanel.tsx — intégrer les sept bustes, décors et fonte licenciée, registre prudent et fiche accessible ; provenance des pixels et informations statiques de rôle explicites dans la documentation. Tester inconnues, nom hors registre, image absente et inertie métier.
- [x] src/renderer/src/App.tsx, styles.css, help.css et composants concernés — construire entièrement le monde, la conversation et la fiche ; préserver handlers et états. Boutons compacts à icônes pour utilitaires, labels pour décisions ; ne pas remplacer les patchs/questions par des pictogrammes seuls. Pas de scène SVG improvisée : décors réels, géométrie/code pour plaques/onglets/commandes.
- [x] src/main/index.ts nativeColors et types statiques du renderer, package.json/package-lock.json et notices — couleurs natives synchronisées et TTF locale admise sous rendererRoot, version candidate0.2.1 sans changement de dépendance ; pas de changement de contrat ou de stockage. Réutiliser apparence séparée et palette par thème.
- [x] tests/connection-ui.test.mjs, tests/appearance.test.mjs et qualification workspace/atelier — vérifier U1–U10 par comportements et vrais rendus synthétiques, avec compteurs prouvant inertie ; étendre les bancs existants plutôt que recopier des styles en tests. Garder les351backend2.2 comme antécédent séparé, rejouer seulement les vérifications touchées et les contrôles requis par un vrai changement/failure.
- [x] ux-madness/qualification-atelier/ — parent fait types/build/paquet, audit des fichiers/version/PNG/font, inspection groupée puis au plus une confirmation, détecteur une fois sur les cibles UI stabilisées, Quick BMad et finish Impeccable frais avec toutes les preuves ; appliquer seulement les constats, documenter puis commit local. Aucun compte/modèle personnel ni installation par le worker.

**Acceptance Criteria:**
- Given les surfaces réellement disponibles, when le porteur ouvre le candidat, then la conversation et ses commandes restent centrales dans un atelier cohérent aux deux thèmes et aux tailles utiles, avec texte/focus/contrastes vérifiés et commandes Windows opérationnelles.
- Given un auteur attesté reconnu ou inconnu, when il lit puis ouvre et ferme sa fiche, then il retrouve le rôle/documentation et la provenance exacts ou le repli approprié ; aucun envoi, appel fournisseur, lancement, changement d’agent ou perte de saisie n’a lieu.
- Given une question, approbation, aide partielle, erreur ou ancienne conversation, when il utilise les mêmes commandes, then les états/corrélations, contenu intégral, conservation et récupération sont inchangés et testés.
- Given le nouveau paquet identifié, when il est rouvert sur le profil synthétique après sauvegarde, then données et apparence restent exactes, sans moteur/réseau après hook, et ses ressources sont traçables ; les anciens natifs2.2 ne sont pas attribués à ce skin.

## Implementation Notes

2026-11-02 — Mandat autonome existant et priorité humaine « passer à l’implémentation la nouvelle charteUI ». Base de sauvegarde2.2 c685d7c, encore in-review/M14ouvert sur sa branche ; aucune qualification finale native déduite. Nouveau worktree managé/branche codex/atelier-ui ; tracked tree propre avant code. Les seuls untracked initiaux sont tooling BMad, références et assets de préproduction produits/copiers sous ce mandat, aucun changement concurrent importé. npmci offline ignore-scripts345paquets ; aucun coffre/profil copié. Deux explorateurs ont fourni les raccords source et tests ; Sally prépare/revoit puis réconcilie les contrats. Aucun seuil de longueur des plans.

## Plan Change Log

## Review Triage Log

| ID | Verdict / route | Vérification et décision |
|---|---|---|
| Q1 | medium / patch | Le statut visuel est clip-path masqué et la section attention suit tout le contenu de fiche ; une arrivée n’est pas visible en haut en fenêtre basse. Déplacer ces contrôles déjà existants vers une zone persistante, sans nouveau handler métier ni état protégé. |
| Q2 | medium / patch | Deux nouveaux ids de même type/projet donnent la même chaîne aria-live ; setState conserve la même valeur. Ajouter l’ordre local déjà observé et qualifier chaque arrivée distincte, sans réannonce sur delta/expiration. |
| F1 | medium / preuve de finition | Le contrat cite le seed mais aucun reçu indépendant n’est joint. Retrouver les vrais retours de notre session, sans nouveau tirage ni preuve fabriquée. |
| F2 | medium / correctif de finition | La matière peinte promise reste dans les décors, le chrome utilise aplats/lèvres CSS. Produire un seul raster de bord de plaque et remplacer ces simulations, conserver le reste du monde. |
| F3 | medium / complément de preuve | Les tests montent sept auteurs, mais quatre ne sont pas inspectables dans les24captures. Compléter les vues réelles synthétiques et leur index, sans inventer une activation fournisseur. |
| F4 | low / documentation prévue | Le DESIGN préexistant décrit le monde antérieur. Le documenter et Sally doivent aligner les spines après dernières corrections ; aucun achèvement de cette étape n’était revendiqué. |

## Design Notes

Le visage est une illustration de la preuve, pas une preuve. Le registre ne reçoit pas recipient : MessageArticle fournit uniquement l’identité attestée et son contexte source. La consultation peut coexister avec un état inactif et se ferme sans commande métier. La fiche est un panneau de travail à la demande, pas un nouveau sélecteur d’agent. Les textures/décors habitent la navigation et les cadres, pas les fonds de messages ou de décisions.

Le risque est medium : un mauvais raccord de focus, panneau ou disposition peut gêner la saisie et une décision ; les gardes de cœur et permissions ne changent pas. Les dimensions finales, contrastes et détails CSS relèvent de l’implémentation et du verdict sur rendus, sans nouvelle négociation esthétique.

## Verification

- Worker : lire craft-floor immédiatement avant première UIedit, implémenter un lot complet sans chasse visuelle incrémentale ; tests ciblés significatifs et types/build. Ne pas faire de captures autonomes : parent possède les deux tours visuels groupés de ce Build.
- Parent : npmrun typecheck/build, tests appearance et fichier UI complet après modifications, banc workspace étendu et audit du paquet0.2.1. Zéro modèle/compte/réseau externe dans ces vérifications ; données synthétiques nommées comme telles. Vérifier les captures individuellement avant le handoff, avec hash de l’artefact et inventaire des assets.
- Impeccable : contexte de projet déjà chargé cette session, ne pas le relancer. New-work/Operate et craft-floor appliqués ; direction et code-led acquis, seed dégradé annoncé. Parent inspecte une matrice groupée, fixe tout en un lot, confirme une fois au plus ; ensuite finish reviewer frais et seuls ses constats sont traités. Détecteur une seule fois, puis documenter officiel via substitut technique frais si rôle spécialisé indisponible ; ne pas inventer un rôle natif exposé.
- Sally : review UX ciblée du plan puis Update des spines au monde final, en conservant les sept parcours2.17 et limites2.2. DESIGN.md et sidecar tokens doivent décrire le code final, pas une promesse ; pas de réparation générale des dérives hors besoin.
- Préserver le compte/profil personnel, les références et les preuves historiques. Pas de nouvelle consommation de forfait ni d’installation personnelle par cette seule validation UI ; livraison à décider sur candidat concret dans le mandat existant, jamais comme succès déjà acquis. Commit local sans push.


2026-11-02 — Sally a réellement activé/résolu son rôle dans ce root et relu le plan, la référence et les raccords App. Ses deux constats de plan UX1/UX2 sont intégrés ci-dessus avant gel ; pas de choix humain manquant, valeurs visuelles déléguées. Rapport .working/atelier-plan-ux-review.md, revue limitée au plan et sans prétendre pixels/contrastes/implémentation validés. La priorité UI autorise le Build séparé sur checkpoint, sans clore2.2. Préférence code-led conservée ; seed09fa5971 dégradé déclaré et direction humaine maintenue.


2026-11-02 — Dépendance de présentation trouvée dans le premier contrôle Main avant capture : les deux essais de readiness de police échouent, zéroPNG et profils nettoyés. Le fichier TTF est présent/exact mais protocol.handle madness refuse son extension à index.ts:68. Complément d’implémentation à l’intention déjà acquise de fonte locale : admettre .ttf dans les seuls assets renderer protégés, conserver hôte/racine/CSP/refus des autres types et qualifier200 fonte/403 traversée-hôte-type, sans compte/modèle/réseau externe. Code Map/tâche/ownership précisés hors frozen ; ce bloc reste b05938e… inchangé. Aucun nouveau monde ou fonction métier, aucun défaut de proxy déduit.


2026-11-02 — Step3 audité :46casUI distincts consolidés(45fichier complet avant V1/V2+1nouveau ciblé, puis4gardes existantes après CSS),0skip dans les ensembles exécutés ; aucune commande monolithique46verte prétendue. Types/build, installateur0.2.1 et six contrôles de contenu paquet passent :10assets exacts,13ressources natives, Main/preload/notices, dépendances et frozenb059… conservés. ASARfa4133881785fa1f70e4a8c4dd2ad2121555751797df10396aa4e70fdb1c14b4, setupbadd3470…. Qualification paquet13contrôles, Windows5, fermeture/réouverture exactes, profils nettoyés. Deux inspections propres et une seule batchV1/V2 : en-tête de conversation compact/nom intégral, buste contenu. V3 non reproduit, garde géométrique étendue sans masque. Une image de contexte au secondtour était périmée malgré DOMcorrect ; rejetée avant revue, recapture technique via Playwright sur le même ASAR inchangé, aucun nouveau polish. Index24capturesvalides, toutes vues, et provenance du remplacement explicites. Le détecteur unique relève quatre bordures à juger dans le contexte atelier ; rien de mécanique à supprimer aveuglément. Scan9rasters/0missing. Native2.2reste in-review après nouvel échec réseau avant moteur et307Main19:01UTC ; acquittement humain asynchrone demandé, aucune clôture2.2 ou2.3. Prochaine action de ce Build : Quick et finish Impeccable frais, puis documenter/Sally sur monde final.

2026-11-02 — Clôture de vérification : Q1/Q2 et F1–F4 résolus, Quick complété et finish ship ciblé.48casUI consolidés (42/48 puis8ciblés après correction de fuitezoom du banc),10gardes,14matrice,5Windows et audit8 passent ; aucun48/48monolithique inventé.31captures courantes via index30+recapturezoomtechnique, anciencrop conservé rejeté.153inputs/11assets/13ressources exacts, ASAR486cfe… inchangé. Documenter et Sally réconcilient le monde et gardent septparcours ; aucune installation ni clôture2.2/M14. Détail qualification-atelier/parent-verification.md, dernier état réseau/cleanup2.2 sauvegardé0cafbec. Aucun correctifUI différé.
