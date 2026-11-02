# Préparation Sally — intégration de la charte atelier

Date : 2 novembre 2026.
Statut : préparation produite ; implémentation UI et assets séparés non commencés.
Responsabilité de ce lot : ce seul rapport. La qualification 2.2 reste au chat propriétaire.
Base lue : C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness.
Démarrage du Build UI : après le commit final de 2.2 et relecture de son état de clôture.

## Résultat proposé

Traduire l’atelier approuvé en composants React/CSS : conversation dominante, portraits discrets dans les échanges, fiche agent informative dépliable, plaques bleu pétrole et cartouches terracotta sur le chrome. Garder des fonds de lecture calmes, le guidage et les décisions explicites de 2.17 ainsi que les fonctions réellement présentes après 2.2. Le visage illustre une identité déjà attestée ; il ne l’établit jamais et ne signale aucune activité.

Cette préparation permet de passer à un Build UI depuis la base 2.2 stabilisée, sans nouvel entretien esthétique. Elle ne met à jour ni les contrats adoptés ni les tickets et ne constitue pas le plan figé d’un nouveau Build.

## Activation réelle de Sally et méthode

- Skill exécuté : [bmad-agent-ux-designer/SKILL.md](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/.agents/skills/bmad-agent-ux-designer/SKILL.md), lu en entier.
- Le resolver de personnalisation a été tenté avec UV en mode offline, --key agent, depuis cette base. Il a échoué lors de la persistance du cache d’inspection de l’interpréteur dans le répertoire sandbox UV : accès refusé. Aucun succès de ce resolver n’est revendiqué.
- Le fallback expressément prévu par le skill a ensuite été appliqué : customize.toml de base lu en entier ; _bmad/custom/bmad-agent-ux-designer.toml et sa variante .user.toml absents, donc ignorés. Le bloc agent effectif est le bloc par défaut : Sally, 🎨, rôle UX Designer, principes centrés sur le besoin, simplicité et données. Les listes activation_steps_prepend, persistent_facts et activation_steps_append sont vides ; aucun chargement ou hook supplémentaire n’était à exécuter.
- La configuration a été réellement résolue par resolve_config.py avec l’interpréteur Python existant de C:/Sources/madness/.venv, sans UV : core.output_folder = {project-root}/_bmad-output ; core.active_initiative = initiative-madness. Cette réussite concerne la configuration, pas le resolver de personnalisation refusé.
- Identité Sally adoptée et salut avec icône effectué. L’intention de préparer l’intégration a été suivie directement, sans menu ni interview. Le skill bmad-ux a été lu pour sa règle d’autorité des deux spines ; aucun run Create/Update/Finalize, memlog ou réécriture des spines n’a été lancé dans ce mandat limité au rapport.
- Trois images locales ont été ouvertes et inspectées à leur résolution d’origine. PRODUCT.md, les deux contrats du 2 novembre, l’epic 2 et les sources renderer utiles ont été lus. Les preuves de qualification existantes ont été consultées comme antécédents, sans réexécution.
- Aucune commande Git, suite de tests, build, paquet, appel de modèle fournisseur, opération réseau ou délégation supplémentaire. L’essai UV était offline ; aucun paquet n’a été installé. Aucune application ni profil personnel n’a été ouvert ou modifié.

## Sources humaines et autorité

Le [handoff](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/handoff.json) provient du chat « Clarifier les agents nommés BMad », id 01a19af2-02c7-7bd2-9a1a-d4a886359d8e. Les prompts complets restent dans ce chat ; ils n’ont pas été récupérés ni reconstitués ici.

| Source inspectée | Décision ou apport retenu |
|---|---|
| [casting-bmad.png](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/casting-bmad.png) | Casting original de sept personnages, silhouettes, visages, coiffures, vêtements et accessoires cohérents. Les sept identités visuelles doivent survivre à la production séparée. |
| [dialogue-exploration.png](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/dialogue-exploration.png) | Portrait compact en conversation, lecture ample et fiche latérale ; exploration antérieure, pas la référence finale du chrome. |
| [atelier-reference-approuvee.png](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/atelier-reference-approuvee.png) | Référence approuvée par « C’est tellement parfait ! » : atelier illustré étendu à toute l’interface, plaques mates, contours encrés, coins coupés, onglets mécaniques et usure mesurée. |
| [images-provenance.json](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/atelier-agents-2026-11-02/images-provenance.json) | Provenance et SHA annoncés des trois images. Lus, sans nouveau calcul d’identité binaire dans ce lot. |

Les décisions humaines acquises sont : commencer par le dialogue ; garder des portraits discrets pendant les longues séances ; rendre la fiche dépliable ; étendre l’atelier au chrome ; conserver les visages originaux. L’inspiration cel shading ne demande pas de reprendre des personnages, marques ou éléments propriétaires de Borderlands.

Les contrats [DESIGN.md](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md) et [EXPERIENCE.md](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md), finalisés le 2 novembre, gouvernent encore le produit. Le prochain Build devra consigner la nouvelle déclinaison visuelle dans leur Update Sally, en gardant les sept parcours, la conservation, le clavier et les gardes de 2.17. Le présent rapport n’adopte aucune palette ni nouvelle géométrie à leur place.

## Confrontation aux fonctions observées

[PRODUCT.md](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/PRODUCT.md) confirme Windows/Electron/React, usage personnel local, Codex/SIWC, sombre par défaut et clair alternatif. Les mentions historiques de premières simulations ne doivent pas remplacer les preuves plus récentes de livraison.

| Ancrage du renderer lu | Conséquence pour l’intégration |
|---|---|
| [App.tsx, MessageArticle](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/App.tsx:24), ConversationMessages:37 | La provenance est par message ; identité attestée ou inconnue, phase et conservation distinctes. Garder la fusion par id, la position de lecture et le suivi existants. Ajouter l’illustration autour de ces données, sans réécrire le flux. |
| [MessageIdentity](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/contracts/dialogue.ts:18) | Type déjà suffisant pour un repérage prudent : kind unknown ou attested avec name/source. Aucun nouveau champ métier « agent actif » nécessaire au skin. |
| [App.tsx, recipient](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/App.tsx:161) et displayedRecipient:164 | recipient est actuellement un libellé de destinataire par invocation. Il ne doit pas servir de preuve ni de clé automatique de portrait. Le nom attesté des demandes reste propre à chaque demande. |
| [HelpPanel.tsx](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/HelpPanel.tsx:14) et HelpReceiptPanel:22 | Aides locales, couverture, refus, demande explicite, réponse brute et reçus restent des régions distinctes. L’aide chargée ne reçoit ni visage d’assistant ni bulle de dialogue. |
| [App.tsx, Champ de réponse](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/App.tsx:478) | Enregistrer et Envoyer sont deux commandes réelles. Le texte du brouillon, les réponses de questions et les ajustements de patch restent séparés. Pas d’envoi par Entrée ajouté par imitation de la maquette. |
| [App.tsx, contexte](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/App.tsx:503) et [styles.css](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/styles.css:1) | Connexion et contexte sont actuellement des panneaux non modaux bornés. Barre 56 px, cible 40 px, axe 28 px, rail 58 px et exclusions Windows sont des points à conserver. La fiche agent est une nouvelle présentation informative, pas une nouvelle autorité. |
| [help.css](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/src/renderer/src/help.css:1) | Les détails et sources de l’aide ont déjà défilement, retour au travail et état de lecture. Les habiller par les mêmes tokens sans fusionner leurs statuts. |

Lors de la lecture, la [vérification parent 2.2](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-aide-native/parent-verification.md) dit encore « vérification en cours » : corrections, paquet final et commit restent au propriétaire. Aucun verdict built n’en est déduit ici. Son ancien natif003 et ses 24 vues synthétiques gardent leur ASAR et leurs limites ; ils ne qualifient aucun futur skin.

La maquette comporte du contenu fictif : noms d’échanges, heures, pièce jointe, « Notes de conception », accès Préférences/Données locales et gestes de saisie. Ces éléments ne deviennent pas des fonctions par ressemblance. L’ouverture de projet reste l’unique dossier SVG de barre, plutôt que le grand bouton de gauche dessiné dans la référence. Les historiques restent accessibles par les mécanismes livrés ; une nouvelle gestion des titres ou un classement des échanges n’est pas requis pour ce lot.

## Déclinaison de la conversation et de la fiche

1. **Cadre de travail.** Projet et initiative capturée avant les onglets. À gauche, récents et destinations réellement livrés. Le décor d’atelier est surtout porté par bordures et navigation ; aucun grand bandeau illustré ne repousse l’attente et la saisie sous le premier écran.
2. **Conversation dominante.** Mesure de lecture 65–70 caractères, texte courant lisible et sélectionnable, messages progressifs inchangés. Les messages humains gardent une plaque bleu discret ; les réponses ont un filet/cartouche léger, sans une caisse épaisse autour de chaque paragraphe.
3. **Portrait discret.** Candidat de 40 px, réductible visuellement à 32 px sur une ligne compacte, dans une cible de 40 px lorsqu’il ouvre une fiche. Nom textuel toujours présent. Le portrait sert le groupe d’auteur ; il n’est pas répété à chaque delta ou paragraphe et ne vole pas la place d’une demande active.
4. **Identité par item.** La clé d’illustration vient uniquement d’un nom attesté et reconnu explicitement dans le registre visuel des sept agents. Pas de correspondance par sous-chaîne, style de texte, invocation, choix de lancement ou simple présence de skill. Un nom attesté hors casting garde son nom avec un pictogramme neutre.
5. **En-tête compact.** S’il comporte un portrait, sa source est le dernier message assistant de l’échange sélectionné avec son identité propre. Si cet item est inconnu ou historique sans projection, afficher « Identité non attestée » et le repère neutre, sans chercher un ancien visage connu. Une demande active garde séparément son propre nom attesté et son formulaire. Ce repère d’en-tête n’est jamais libellé « agent actif ».
6. **Fiche liée à la consultation.** Le bouton « Fiche de Mary » d’un auteur attesté ouvre sa fiche et garde la référence du message/de la demande d’origine. Consulter un ancien auteur n’altère ni le destinataire ni le portrait d’un autre item. La fiche contient buste, nom, rôle descriptif, courte spécialité, puis provenance du message connu et invocation déjà sourcée lorsqu’elle existe. Le rôle est présenté comme descriptif ; aucune disponibilité de skill n’en découle.
7. **Fiche informative.** Aucune commande de changement d’agent, lancement, installation ou accord. L’invocation connue reste sélectionnable ; ne pas inventer un pont Copier supplémentaire pour reproduire un dessin. La fermeture rend sa largeur au centre et le focus au bouton d’origine. Si la source disparaît, revenir au titre neutre de Conversation avec annonce.
8. **Une seule surface de contexte à droite.** La fiche ne remplace pas les détails nécessaires à une décision. Ouvrir Connexion ou Contexte masque la fiche, conserve sa sélection/position en mémoire de session, sans la rouvrir automatiquement. Aucun empilement de trois colonnes ou de modales.
9. **Préparation.** Mary/Forge et leur qualification/lancement restent dans Parcours. « Préparer un échange » retrouve cette préparation. Ni $bmad ni Forge ne reçoivent arbitrairement le portrait d’un membre du casting ; Forge reste le workflow natif livré, pas un huitième personnage à inventer.

À la restauration, l’absence de preuve d’identité reste visible même si les assets du casting sont disponibles localement. Aucun enrichissement durable de l’historique, changement de Snapshot ou reconstruction de persona n’est nécessaire.

## Assets à produire au prochain lot

Le casting est une référence, pas une planche à afficher telle quelle dans la conversation. Produire une image indépendante par usage et par agent, depuis le casting approuvé, avec fond transparent et sans texte, nom, cadre ou bouton peints dans l’image. Les cadres et cartouches seront du code.

| Clé visuelle proposée | Rôle descriptif | Ancrages du casting à conserver |
|---|---|---|
| mary | Analyste | Boucles courtes foncées, veste bleue, carnet et crayon. |
| john | Product Manager | Cheveux bruns balayés, tenue claire et harnais/gilet terracotta, documents. |
| sofia | Product Owner | Carré sombre avec mèche grise, manteau bleu, tablette/clipboard. |
| winston | Architecte | Cheveux courts et barbe gris clair, long manteau bleu, plans et instruments. |
| sally | UX Designer | Cheveux courts roux, taches de rousseur, veste terracotta, carnet/stylet. |
| amelia | Développeuse | Cheveux sombres en chignon avec longue mèche, bleu de travail, tablette. |
| smithy | Toolsmith | Barbe grise, lunettes sur le front, tablier terracotta, clé et petit outil mécanique. |

Contrat de production candidat : sept portraits carrés 512 × 512 pour des vignettes nettes à 32/40/48 px ; sept bustes autour de 900 × 1200 pour la fiche. Soit 14 sources transparentes à créer et inspecter, actuellement inexistantes. Un même visage sert les deux thèmes ; aucune recoloration du visage selon l’état technique. Contrôler silhouette et reconnaissance sur les sept ensemble puis au format vignette, contours alpha sans frange, cadrage des cheveux/accessoires et continuité entre portrait/buste.

Un registre renderer local et typé reliera clé, nom descriptif, fichiers et cadrage. Il ne sera ni catalogue des compétences ni liste de capacités. Image absente ou illisible : pictogramme neutre, dimensions réservées et texte d’auteur intact, sans blocage du dialogue. Les portraits chargés doivent avoir leurs dimensions explicites pour ne pas déplacer lecture, focus ou scroll. Les bustes ne se chargent que lorsque la fiche est demandée.

Aucun décor raster n’est requis pour la première livraison : plaques, rivets discrets et stries d’usure peuvent être dessinés en CSS/SVG local. Un éventuel décor indépendant viendra seulement s’il apporte quelque chose au chrome sans texture sous le texte. Les trois maquettes ne seront jamais utilisées comme fond interactif ou interface aplatie.

## Cadres, typographie et tokens en code

Créer une couche de tokens de présentation reliée aux rôles sémantiques existants : surfaces de lecture, panneau, navigation, texte, action, lien/focus, sélection, attente, succès et erreur. Ajouter séparément les rôles atelier.chrome, atelier.plate, atelier.ink, atelier.edge, atelier.wear, atelier.cornerCut, agent.avatarSize et agent.panelWidth. Les noms sont proposés, pas déjà adoptés ou implémentés.

- Plaques mates avec un contour encré plus fort sur les régions principales, petites coupes de coin et cartouches angulaires. Le cadre décoratif ne mange ni texte ni cible. Utiliser pseudo-éléments ou SVG décoratifs, pointer-events none et aria-hidden ; le focus reste sur un vrai bouton non rogné. Ne pas appliquer un clip-path à toute une surface focusable.
- Épaisseur et usure hiérarchisées : chrome marqué, groupe de décision net, fond de lecture sans grain. Rivets et rayures ne ressemblent ni à des alertes ni à des commandes. Aucun filtre plein écran ou grande texture répétée à chaque message.
- Titres courts et noms en condensé expressif : première voie locale Bahnschrift avec font-stretch si disponible, repli Segoe UI. Conserver Segoe UI pour les messages, menus, labels et formulaires ; Consolas/Cascadia Code pour invocations et chemins. Vérifier les accents et les replis sous Windows ; aucune fonte distante ou installation implicite. Une fonte embarquée ne deviendra nécessaire que si le repli local ne satisfait pas le rendu retenu.
- Taille de lecture et rythme existants comme base, sans réduire le texte pour faire tenir une illustration. Les capitales sont réservées aux courts cartouches et noms ; longs noms, refus, chemins et libellés anglais se replient.
- Les surfaces de contrôle réelles restent des boutons, champs, onglets et details sémantiques. Boutons d’accord/refus/question restent textuels et complets. Le signe officiel ChatGPT de connexion reste un signe fonctionnel séparé des illustrations.

### Deux thèmes

| Rôle | Sombre candidat | Clair candidat |
|---|---|---|
| Lecture | Garder anthracite chaud #211F1E, panneau #272423 et texte ivoire #F1EBE6 comme point de départ. | Papier ivoire calme #F6F0E4, texte anthracite #24211E ; pas de grain sous les messages. |
| Chrome | Plaques pétrole autour de #203A43, traits encrés #0F1416, arêtes terracotta. | Plaques désaturées #E8DDC8, repères pétrole #284C58 et encre sombre ; conserver l’atelier sans assombrir toute la page. |
| Action / focus | Terracotta existante #E49B7A, texte #231A15 ; lien/focus #9DC7E1. | Terracotta plus sombre #9B472C avec texte clair #FFF9F0 ; lien/focus pétrole #1C5B76. |
| États | Reprendre les rôles sémantiques attente, erreur et succès ; toujours texte et portée. | Même sémantique et même ordre, avec couples propres au clair à mesurer. |

Ces valeurs sont des candidats de déclinaison, non mesurés ici. Le clair actuellement adopté reste blanc/violet : son passage à ivoire/terracotta/pétrole doit être consigné explicitement dans le prochain Update visuel, au titre de la direction atelier approuvée. Ne pas le présenter comme déjà livré ou techniquement validé. Mesurer texte ≥ 4,5:1, grands titres ≥ 3:1, contrôles nécessaires et focus ≥ 3:1 sur les surfaces réelles avec l’usure présente. Les minima historiques du thème ne se transfèrent pas aux nouvelles plaques.

La préférence garde l’enum dark/light et son stockage existant distinct du Snapshot ; aucune nouvelle préférence de métier. Le défaut sombre, les erreurs de lecture/écriture, le choix de session et les contrôles Windows continuent de fonctionner avec le système existant.

## Étroit, clavier et mouvement réduit

- Largeur supérieure à 1080 px : fiche dockée dans une colonne réelle quand la largeur utile du texte demeure confortable ; reprendre les largeurs de panneau du contrat (318 px, 278 px dans la tranche 1081–1280, 350 px au grand format) comme candidats. Si la largeur disponible ou le zoom ne le permettent pas, utiliser le mode superposé plutôt que compresser lecture et choix.
- Jusqu’à 1080 px : fiche sur demande en Dialogue modal borné à la fenêtre, titre/fermeture atteignables, contenu verticalement défilant et retour au déclencheur. À 720 px et sous ce seuil, garder le tiroir de navigation existant et la fiche limitée à la largeur utile ; ne pas les empiler ouverts.
- Conserver au moins les cibles 40 px et les repères projet/attente dans le rail 58 px. La marque d’atelier ne réintroduit pas un monogramme dans le rail ni ne décale l’axe 28 px de la bascule.
- Passage de seuil pendant ouverture : transférer la présentation de la même sélection de fiche sans perdre position, focus utile ou brouillons. Stocker sélection et défilement de fiche au niveau parent ; éviter une clé de remount sur le thème ou la largeur.
- Fiche dockée : région nommée et Tab libre vers le centre. Fiche superposée : vrai Dialogue modal, focus contenu ; Échap ferme d’abord cette surface et ne refuse aucune demande native. Ouverture au titre, fermeture au déclencheur, aucun focus initial sur Autoriser. Le panneau de connexion garde son comportement propre.
- Nom accessible indépendant des pixels ; si le portrait répète le nom déjà présent, alt vide. Le bouton porte « Fiche de Sally ». Les décors sont absents de l’arbre d’accessibilité. Image indisponible n’efface pas le nom.
- Pas d’expression « travaille », d’halo, de bouche ou de clignement lié au streaming. Portrait neutre statique au premier lot. Transitions de révélation jusqu’à 180 ms seulement ; prefers-reduced-motion supprime ces transitions et tout défilement animé ajouté. Les transitions n’envoient rien et n’annoncent pas chaque delta.

## États à décliner avant livraison

| Cas | Présentation atelier attendue et garde préservée |
|---|---|
| Conversation vide | Cadre calme, aucun visage nommé par défaut ; état vide puis préparation explicite. |
| Message connu / inconnu / auteur hors casting | Portrait uniquement sur identité attestée reconnue ; repère neutre et texte de provenance sinon. Ne pas écraser un nom attesté non illustré par « inconnu ». |
| Streaming / tour terminé / historique | État textuel existant à côté du contenu ; visage identique, aucune animation de travail supposé. Historique inactif après restauration, pas de persona reconstruite. |
| Question active | Cartouche d’attente, question et choix complets, destinataire propre à la demande, brouillon séparé et Envoyer la réponse explicite. Expiration retire la réponse possible, garde le texte et rétablit le focus neutre. |
| Accord fichiers | Opération, portée, préconditions et patch intégral avant boutons textuels. Aucune coche seule, aucun clic de portrait/fiche accordant le patch, aucun contenu vital replié sous la fiche. |
| Aides locales / demande / réponse BMad | Plaque de source locale pour Aides chargées, couverture et refus ; préparation $bmad explicite. Réponse native dans la conversation et transmission/conservation dans son reçu. Pas de portrait nommé injecté par $bmad. |
| Erreur / accès refusé / copie impossible | Motif, ressource et action réellement disponible visibles ; pas de diagnostic proxy inventé. L’erreur durable n’est pas remplacée par une texture rouge ou une notification fugace. |
| Arrêt inconnu / effets incertains | Bande durable prioritaire, portée globale si applicable, lancement bloqué et inspection/réobservation livrées. La fiche n’occulte ni la bande ni ses accès. |
| Sauvegarde échouée | Copie de session conservée, reçu natif distingué de conservation non confirmée ; réessayer l’enregistrement ne rejoue ni message ni accord. |
| Réseau indisponible | Aide et contrôle GET existants, adresse publique et actions explicites ; aucune nouvelle requête de confort due au skin. |
| Thème / largeur / fiche changés | Brouillon exact, demande, contexte, conversation et position de lecture conservés ; aucune activation, nouvelle conversation ou transmission. |

## Dépendances et découpage technique utile

L’ordre ci-dessous organise une même refonte cohérente ; il ne crée ni nouvelle story ni seuil de longueur.

| Étape | Travail concret du futur Build | Dépendance et résultat vérifiable |
|---|---|---|
| 0. Base stable | Laisser le propriétaire terminer corrections/relectures, paquet final, statut et commit 2.2. Repartir de cette base dans l’espace isolé du Build UI. | Ne pas modifier les sources pendant sa qualification ; conserver sa provenance, son manifeste et ses fichiers concurrents. |
| 1. Contrat de déclinaison | Update Sally des deux spines : nouveaux rôles visuels, clair/sombre, portrait/fiche et responsive. Reporter ce qui vient de la décision humaine et les valeurs techniques candidates retenues. | Conserver comportement 2.17 et apports réellement livrés en 2.2. Pas de nouvel entretien sur la direction choisie. |
| 2. Assets séparés | Produire/inspecter les sept couples portrait/buste depuis les références ; manifeste local de provenance, variantes et cadrages. | Aucun fichier de cette production n’existe dans ce lot. Lisibilité à petite taille et alpha vérifiés avant branchement. |
| 3. Primitives atelier | Tokens CSS, cadres décoratifs et cartouches ; onglets et barre existants ; contrôle des focus, cibles et zones no-drag. | Premiers rendus sans logique fournisseur. Étendre le système aux composants livrés plutôt que maintenir deux skins concurrents. |
| 4. Dialogue et fiche | Ajouter un registre de présentation pur, AgentPortrait et AgentInfoPanel ; adapter MessageArticle et l’en-tête compact ; état de consultation séparé des données métier. | Conservation des handlers de dialogue, positions, demandes et brouillons. Aucun IPC/stockage/connector ajouté pour la fiche. |
| 5. États et autres surfaces livrées | Appliquer le système aux questions, accords, récupération, HelpPanel/HelpReceiptPanel, accueil, Parcours, contexte et connexion. | Même sens et mêmes gardes ; pas de fausses entrées catalogue, fichiers/éditeur, initialisation, graphe ou mesures R32. |
| 6. Vérification et revue | Contrôles ciblés, captures du candidat, inspection des deux thèmes, clavier/zoom et revues du diff/rendu ; corriger et recontrôler les constats. | Preuves liées au nouvel artefact réel. Aucune preuve native d’un ancien ASAR attribuée au nouveau. |
| 7. Livraison personnelle | Manifeste final puis procédure contrôlée de remplacement et conservation si la livraison fait partie du mandat du Build. | Aucun compte/reconsentement ni nettoyage de vrai projet. Ce rapport n’exécute ni ne prouve cette étape. |

Fichiers candidats du renderer : App.tsx, styles.css, help.css, adaptation visuelle de QuestionPanel/ApprovalPanel/RecoveryPanel/WorkOverview/NetworkHelp si nécessaire ; nouveaux composants de présentation et dossier assets/agents. Extraire seulement ce qui clarifie cette responsabilité ; éviter une réécriture générale de App.tsx pendant la refonte. Cœur, Main, preload, contrats, connecteur, stores et dépendances restent hors du besoin identifié, sauf problème réel démontré et recadré par le propriétaire.

Les choix de contexte des futures stories 2.3–2.9, leur catalogue/lancement général, l’anglais fonctionnel complet de 2.14, Q8/Q9/R32, l’initialisation et Graphify gardent leurs lots. Les libellés FR/EN déjà contractuels servent les vérifications de débordement ; ce skin ne doit pas annoncer qu’une traduction ou une capacité future est livrée.

## Risques et validations ciblées

| Risque concret | Contrôle utile au prochain lot |
|---|---|
| Visage interprété comme identité ou activité | Cas attesté reconnu, attesté hors casting, inconnu, absent à la restauration, $bmad et Forge sans identité, alternance d’auteurs dans le même échange. Vérifier le texte/source par item et l’absence de portrait déduit de recipient/invocation. |
| Habillage qui masque une garde | Question active puis expirée ; patch long avant choix ; stop global sans projet ; effet incertain et sauvegarde échouée. Vérifier visibilité, accès exact et absence d’accord ou reprise implicite après ouverture/fermeture de fiche. |
| Large fiche qui chasse la saisie | 1600 px, 1440 × 920, 1280 px et 720 × 820, rail déployé/replié/tiroir ; fiche fermée, dockée, modale et changement de seuil ouvert. Observer le premier écran, pas seulement l’absence d’overflow. |
| Focus perdu ou capturé par le décor | Bouton auteur → fiche → Échap ; Tab centre/panneau ; autre contexte ; demande retirée pendant saisie ; fermeture vers source disparue. Répéter au zoom Electron 200 % et mouvement réduit. |
| Contour/focus rogné et contraste dégradé | Mesurer les couples réels des deux thèmes, focus externe et cibles ; tester longs refus/chemins/libellés FR/EN, caractères accentués et police de repli. Mise à l’échelle Windows à vérifier séparément du zoom Electron. |
| Déplacement pendant streaming/assets | Image manquante ou lente, buste chargé à l’ouverture, longues réponses, lecture remontée dans l’historique ; tailles réservées, aucun saut imposé et source de fiche stable. |
| Régression de contexte/persistance | Saisie non sauvegardée → fiche/thème/onglet/projet → retour ; réponse native et conservation échouée distinctes ; fermeture/réouverture passive sur profil isolé. Compteurs moteur/réseau nuls pour consultation de fiche. |
| Preuve périmée ou confusion entre artefacts | Identifier SHA/source/paquet de chaque capture et mesure. Garder les anciennes preuves séparées ; seule la matrice du nouveau candidat autorise des affirmations sur sa disposition et sa conservation. |

Réutiliser les bancs présents, en ajoutant seulement les assertions propres au nouveau risque :

- [scripts/qualification/workspace-design.mjs](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/scripts/qualification/workspace-design.mjs) couvre déjà géométrie/axe/cibles, retour du contexte, quatre largeurs/deux thèmes, rail/tiroir, zoom 200 %, questions/accords, récupération globale, sauvegarde et réouverture sans activité après hook. Étendre avec fiche/portraits et source d’identité ; ne pas réécrire la qualification complète.
- [scripts/qualification/bmad-help.mjs](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/scripts/qualification/bmad-help.mjs), les tests bmad-help et la matrice finale 2.2 fourniront la base aide/transmission/conservation. Repasser les interactions touchées avec le nouveau rendu ; aucun appel fournisseur n’est requis pour vérifier le style ou la fiche.
- Les tests appearance, questions, approvals, recovery et work-overview restent les gardes existantes. Les tests du registre visuel doivent porter sur la frontière d’identité et les replis, pas simplement recopier un tableau de fichiers.
- Les [preuves historiques de refonte](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/qualification-refonte/parent-verification.md) et de [2.17](C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/ux-madness/guidage-epic2/parent-verification.md) servent à choisir les invariants. Leurs résultats ne prouvent ni le nouveau skin, ni ses contrastes, ni une conformité WCAG ou une acceptation humaine de l’application intégrée.

Après ces contrôles ciblés et les corrections, exécuter les checks habituels du Build sur le candidat figé, puis ses revues prévues. Aucun test ni build n’a été lancé pour ce rapport ; aucune performance, conformité, installation, disponibilité de compétence ou validation humaine supplémentaire n’est acquise.

## Transmission au propriétaire

La prochaine action autonome utile est de terminer et committer 2.2, puis lancer la refonte UI sur cette base avec l’Update Sally et les références atelier identifiées. La direction et le casting sont acquis ; les assets séparés, les nouveaux composants, les valeurs finales de tokens et leurs preuves restent à produire. Ce rapport est le seul livrable de cette préparation.
