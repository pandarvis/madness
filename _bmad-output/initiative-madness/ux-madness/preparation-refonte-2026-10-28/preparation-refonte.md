# Préparation de la refonte — Sally et trois expertises

Préparé le 28 octobre 2026. **Aucune refonte appliquée ou installée dans ce dossier.** L’epic 1 reste ouvert :1.1 bloque1.10 puis1.11. Ce travail indépendant prépare la passe visuelle demandée ; il ne remplace aucun prérequis ni essai humain.

## Travail réellement réalisé

Sally est activée par `bmad-agent-ux-designer`, bloc agent résolu et ticket chargé. Trois experts techniques frais ont ensuite examiné les mêmes cinq captures, sans voir les conclusions des autres : `/root/ux_visual_preparation` (hiérarchie et composition), `/root/ux_guidance_preparation` (guidage du débutant et information), `/root/ux_accessibility_preparation` (clavier, noms et compacité). Ce sont des expertises techniques, pas trois personnages BMad ni des rôles Impeccable spécialisés.

Le lanceur Impeccable `context` a été exécuté une fois ; ses références New work et Operate guident cette préparation. Son chemin initial `src/renderer/App.tsx` ne correspondait pas à l’entrée actuelle ; la cible correcte est `src/renderer/src/App.tsx`. Les contrats adoptés, placés dans `ux-madness/DESIGN.md` et `EXPERIENCE.md`, ont été chargés directement. L’absence de DESIGN à la racine et les mentions historiques de PRODUCT ne sont pas réparées implicitement.

Il s’agit d’une préparation de conception, sans commande `critique`, détecteur, verdict `ship` ou audit WCAG. Aucun nouveau monde visuel, contrat de direction ou changement de DESIGN/EXPERIENCE n’est déclaré adopté. Tes choix existants suffisent pour ce travail : inspiration ChatGPT Desktop, icônes et chrome discrets, palette terracotta/bleu, clair alternatif, comportement et contrôle préservés. Aucune nouvelle sélection de style n’a été demandée pendant ton absence.

## Ce que montrent les captures

Le paquet réel0.1.1 est observé à 1440 × 920 et720 × 820 CSS. Les sources renderer correspondent au manifeste du paquet qualifié. Les données sont des fixtures historiques, avec ancien arrêt inconnu et identité non attestée, sans session fournisseur active. Aucun état actif n’est simulé comme preuve.

Le premier lot a été écarté : le démarrage rejoignait automatiquement le projet actif, donc une image était mal nommée Accueil ; le clic d’onglet avait aussi déplacé le défilement. Le lot final est corrigé et chaque PNG inspecté. Les premiers pixels sont remplacés, son reçu explicatif conservé. Les deux profils d’essai sont fermés et supprimés ; aucun profil personnel ni compte utilisé. Les captures portent sur le contenu Electron, sans jugement visuel des glyphes natifs Windows.

| Capture | Lecture |
|---|---|
| `home-dark-expanded.png` | Accueil, navigation déployée et historique de récupération. Le titre d’accueil reste très bas. |
| `project-dark-collapsed.png` | Projet/Parcours au début du défilement ; les états repoussent projet et onglets. |
| `conversation-dark-top.png` | Conversation au début du même défilement ; presque le même premier écran que Parcours. |
| `conversation-dark-history.png` | Historique rejoint par défilement, question et opération conservées explicitement inactives. |
| `connection-light-compact.png` | Panneau Codex en fenêtre étroite, ancien arrêt inconnu, sans connexion déclenchée. |

`capture-receipt.json` conserve versions, positions, empreintes des sources, fermeture et nettoyage. Zéro enfant et zéro réseau observés après instrumentation ; aucune affirmation sur l’avant-hook ni sur une activité réelle de fournisseur.

## Proposition consolidée de Sally

Le sujet principal est l’ordre de lecture. Dans `App.tsx:372`, synthèse et récupération arrivent avant titre et onglets ; dans `App.tsx:385`, les préparations Mary/Forge précèdent l’historique, même en Conversation. Les garanties restent nécessaires, mais elles prennent actuellement la place du travail qu’elles doivent protéger.

| Priorité | Proposition | Ce qui doit rester vrai |
|---|---|---|
| Première | En-tête projet stable : projet, initiative connue, activité et onglets immédiatement identifiables. Une bande courte signale ensuite l’intervention ou le blocage. | Un arrêt inconnu et sa portée globale ne disparaissent pas. Aucun pourcentage ou état humain inventé. |
| Première | Conversation commence par l’échange sélectionné ou son état vide, puis la demande pertinente et son point de réponse. Préparer un autre échange devient une action secondaire explicite. | Qualification, lancement, mode fichiers et envoi restent distincts. Aucune invocation déclenchée par navigation. |
| Première | Une explication principale par problème, avec rappels courts qui y conduisent. Séparer « activité actuelle : aucune » et « ancien arrêt : non confirmé ». | Les gardes d’arrêt et d’inspection restent actives ; les détails et le chemin de récupération exact restent accessibles. |
| Première | Ouvrir un projet devient une commande à dossier SVG, de même famille que thème/connexion, sur cible40 px. Aligner le centre de la bascule sur celui du rail. | Nom accessible « Ouvrir un projet », découverte au focus/survol, une seule commande. Bascule sur la ligne des contrôles Windows, zone no-drag préservée. |
| Suivante | Résumés compacts et portées explicites : dans ce projet, autres projets, blocage global. Historique distinct et ouvrable. | Attentes corrélées, destinations exactes ; une ancienne question ne devient pas répondable. |
| Suivante | Contexte et détails techniques consultables sur demande ; libérer de la place pour le dialogue et les résultats déjà observés. | Chemin intégral et provenance retrouvables ; pas d’explorateur ou aperçu de fichiers annoncé avant son implémentation. |
| Suivante | Harmoniser les présentations de question inactive, opération conservée et brouillon. | Saisie de question et brouillon libre restent séparés, avec statut durable exact. Patch complet et portée visibles avant toute décision active. |
| Suivante | Présenter Mary et Forge comme les deux possibilités livrées, avec leurs objectifs. | La phrase Mary actuelle est fixe ; elle ne doit pas se faire passer pour une recommandation `bmad-help` calculée sur le projet. |

Le décalage de la bascule est étayé par les captures et le CSS : à1440 px, environ38 px depuis le bord pour son centre, contre28 px pour les icônes du rail. Harmoniser les conteneurs, sans rapetisser la cible. Les règles à1280 px sont à recontrôler dans le futur Build.

La palette et la famille Segoe UI sont conservées. L’accent terracotta sert l’action pertinente ; moins de grands aplats et une meilleure hiérarchie évitent de faire de l’ouverture de projet l’action dominante d’un projet déjà ouvert. Une éventuelle animation du dossier doit être brève et liée à un état, sans boucle ; mouvement réduit : équivalent statique.

## Accessibilité à préserver et à vérifier

Les sources possèdent déjà des noms accessibles, du focus visible, des onglets au clavier, des retours de focus, un tiroir modal et une règle de mouvement réduit. Cela décrit du code, pas un nouvel essai NVDA ou une conformité acquise. Rail/Codex ont des infobulles personnalisées au focus ; les autres icônes s’appuient davantage sur `title` et `aria-label`, ce qui ne démontre pas leur découverte visuelle au clavier.

- Réduire le dessin vers19 px en conservant les cibles40 px et leur espacement ; expliciter les règles de cible des questions, approbations et récupération.
- Même nom d’action et même aide au survol/focus ; Échap ferme l’aide et les panneaux selon leur portée, sans décision implicite.
- Garder « Refuser tout le patch » et « Autoriser tout le patch une fois » textuels. Aucune coche/croix ambiguë ne remplace une autorisation.
- Vérifier le focus après envoi, expiration ou disparition d’une demande ; ne pas le déplacer vers Autoriser.
- Vérifier zoom, mise à l’échelle Windows, noms longs, deux thèmes et720 × 820/1440 × 920 ; lecteur d’écran et contrôles natifs Windows restent à essayer dans le futur lot.

## Frontière avec le backlog

Une recomposition peut améliorer ce qui existe déjà : contexte, activité, attentes, échanges et reçus. Le guidage contextuel `bmad`/aide installée, le catalogue complet, l’état des documents, l’aperçu et les mesures temps/coût par US appartiennent toujours à l’epic 2. Initialisation : epic 3. Graphe : epic 4. Une refonte ne doit pas dessiner ces capacités comme déjà exécutables.

La prochaine passe pourra reprendre ces propositions avec BMad UX et Impeccable, compléter les contrats puis faire un Build distinct selon le séquencement retenu. Critères observables : Conversation identifiable dès le premier écran ; commande d’ouverture compacte ; bascule alignée ; un blocage principal compréhensible ; demandes anciennes clairement inactives ; aucune perte de contexte ou saisie au clavier, à la navigation, au redimensionnement et au changement de thème. Les états actifs et l’essai humain global restent à qualifier.

**Fin du tour Sally :** préparation terminée et propositions consolidées. Aucune correction produit, nouvelle validation visuelle ou refonte livrée n’est déduite de cette analyse. Aucun travail demandé à l’utilisateur pendant son absence.
