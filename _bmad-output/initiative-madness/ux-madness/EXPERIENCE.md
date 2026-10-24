---
title: "Madness — expérience utilisateur"
status: final
created: 2026-10-22
updated: 2026-10-24
sources:
  - ../initiative-madness.md
  - .memlog.md
  - ../../../PRODUCT.md
  - ../brief-madness/brief-madness.md
  - .working/parcours-proposes.md
  - .working/verification-prototype.md
---

## Foundation

Madness aide un développeur peu familier de BMad à retrouver un projet local, comprendre ses preuves et choisir une action, puis dialoguer avec l'agent. La priorité UX est la compréhension de ce qui se passe et de ce qui est attendu. La V1 cible Windows, Codex et BMad v7 ; elle doit pouvoir être distribuée à d'autres développeurs. Aucun framework UI, packaging Electron ou mode d'intégration Codex n'est choisi ici. [DESIGN.md](DESIGN.md) porte l'identité visuelle.

Le [prototype Parcours guidé](mockups/parcours-guide/index.html) a été accepté comme première base le 23 octobre 2026, après l'approbation explicite de sa navigation rétractable. Il reste une simulation avec deux projets et des dialogues écrits : aucune lecture de dossier, invocation Codex, installation BMad ou ouverture d'éditeur réelle. Les [vérifications consignées](.working/verification-prototype.md) portent sur cette simulation. Le retour du porteur de projet n'est pas une étude utilisateur ni une validation des intégrations.

Les versions antérieures à v7 et leur migration sont hors V1. Le suivi en direct ou la synchronisation de conversations lancées dans d'autres outils reste une extension. Une modification de fichier externe ne permet pas de reconstruire sa conversation d'origine.

## Information Architecture

| Surface | Accès et finalité | Parcours | Référence |
|---|---|---|---|
| Accueil | Ouverture de Madness ou Navigation latérale ; projets récents et attentes nommées, ouverture d'un dossier. | 1 | Maquetté |
| Diagnostic et initialisation | Après choix d'un dossier ; compatibilité v7, prérequis, accès et changements proposés avant accord. | 1 | Absence puis initialisation simulées ; autres diagnostics décrits seulement |
| Projet · Parcours | Ouverture d'un projet ; initiative active et autres initiatives repérées, état et preuves dans ce contexte, recommandation expliquée, intentions et alternatives. | 1, 2 | Maquetté au niveau projet ; contexte d'initiative décrit seulement |
| Projet · Conversation | Lancement d'une action ou reprise d'une attente ; invocation, dialogue et décisions du tour. | 3 | Maquetté, dont interruption et erreur |
| Catalogue | Navigation « Possibilités BMad » ou onglet « Toutes les possibilités » ; recherche de toutes les compétences installées. | 2, 3 | Maquetté |
| Fiche compétence | Depuis recommandation, intention ou Catalogue ; objectif, invocation, entrées, effets et condition de lancement. | 2, 3 | Maquetté dans un Dialogue |
| Panneau de fichiers et aperçu agrandi | Depuis preuve, résultat ou bouton Fichiers ; lire statut, provenance, chemin et contenu. | 2, 3 | Maquetté avec extraits figés |
| Connexion Codex et accès | En-tête et diagnostic avant lancement ; rendre capacité disponible ou problème de connexion compréhensible. | 1, 3 | Décrit seulement ; détail d'intégration à instruire |

Les surfaces maquettées sont accessibles dans la [maquette commune](mockups/parcours-guide/index.html). Connexion, refus d'accès, incompatibilité v7 et reprise après redémarrage seront construits à partir de ces règles et des décisions techniques à venir ; aucun écran détaillé n'a encore été approuvé pour eux.

Navigation globale : Accueil, projets récents, Possibilités BMad, Que faire ensuite ?. La barre d’action supérieure porte une seule commande « Ouvrir un projet », disponible depuis l’accueil et le projet, et la bascule de navigation. Le projet expose Parcours, Conversation et Toutes les possibilités ; les fichiers restent consultables à côté. Les regroupements Cadrage, Exigences, Expérience utilisateur, Architecture, Réalisation & qualité et Outils transversaux sont des repères, sans chaîne imposée ni étape à valider artificiellement pour accéder à la suivante.

Un projet peut contenir plusieurs initiatives. Son espace identifie l'initiative active, permet de retrouver les autres initiatives repérées et indique celle que concernent l'état, les preuves et l'action envisagée. Les fichiers transversaux restent rattachés au projet. Changer d'initiative ne réattribue pas les conversations et résultats antérieurs. La commande précise de changement reste à définir dans les exigences ; aucun sélecteur détaillé n'est considéré comme maquetté ou approuvé.

## Voice and Tone

Le texte nomme l'objet, sa portée et l'action attendue. Il explique BMad au moment utile sans exiger de mémoriser les noms techniques. Les identifiants et invocations restent exacts.

| Situation | Formulation à retenir | Règle |
|---|---|---|
| État déduit | « État fondé sur les fichiers : le brief est en brouillon. Sa validation reste à confirmer. » | Relier la lecture à sa preuve ; signaler l'inconnu. |
| Recommandation | « Pourquoi maintenant ? » puis une raison liée au projet. | Expliquer l'utilité avant les détails techniques. |
| Question | « Sally attend votre réponse. » | Nommer l'attente, le projet et son point de retour. |
| Approbation | « Créer les brouillons » et « Demander un ajustement ». | Le libellé dit ce que l'accord autorise ; il ne valide pas le contenu à venir. |
| Fin de tour | « Ce tour est terminé. Le workflow reste ouvert. » | Résumer résultats, décisions, fichiers et prochaine action. |
| Changement externe | « Le fichier a été modifié hors de Madness. La session d'origine est inconnue. » | Aucun agent ni état de conversation inventé. |
| Erreur | Nommer le problème connu puis l'action de récupération. | Éviter un succès anticipé et les erreurs techniques sans explication. |

## Component Patterns

Les noms ci-dessous correspondent exactement à DESIGN.md · Components.

| Composant | Règles de comportement |
|---|---|
| Navigation latérale | Réduire/déployer conserve projet, onglet, conversation et saisie. Au-dessus de `{components.navigation.drawerBreakpoint}`, le rail mesure `{components.navigation.compactWidth}` ; chaque destination conserve un nom accessible et une infobulle au survol/focus. Bascule explicite dans la barre supérieure, avec état développé annoncé et focus conservé pendant la sauvegarde de la préférence. En fenêtre étroite, la commande ouvre le tiroir ; sa fermeture rend le focus à ce déclencheur. Seule cette préférence est mémorisée dans la maquette ; elle ne prouve aucune persistance des conversations. |
| Bouton | Libellé orienté action ; une action indisponible explique le prérequis. Pas de double lancement pendant une requête. Une approbation ne porte que sur le changement décrit. |
| Ligne de projet ou d'attente | Ouvre le projet ou le point d'attente concerné. La raison reste nommée : question, livrable à relire, interruption ou erreur. Ne pas réduire l'information à un compteur. |
| Onglets du projet | Changer de vue ne répond pas à l'agent et n'efface pas la saisie. L'attente reste signalée lorsqu'on quitte Conversation. |
| Recommandation | Expose objectif et raison ; invocation, entrées et résultat accessibles à la demande. Issue de `bmad`, de l'aide des modules installés et des preuves du projet. Propose les alternatives pertinentes et un accès au catalogue complet, y compris les outils transversaux. |
| Groupe d'intentions | Déplier révèle les compétences utiles et leur objectif. L'état d'un groupe ne verrouille pas les autres ; une suggestion n'est pas un ordre de passage. |
| Catalogue des compétences | Recherche par intention, agent ou identifiant et filtres par intention ; résultat vide avec possibilité d'enlever les filtres. Le [catalogue de démonstration](mockups/parcours-guide/catalogue.js) contient 27 compétences invocables de cette installation, pas un quota produit. Le produit reflète le catalogue effectivement installé ; métadonnées `bmod-*` exclues et absence/incompatibilité expliquée, dont `bmad-retrospective` ici. |
| Fiche compétence | Affiche l'invocation Codex réelle sous la forme `$bmad-ux` ou `$<identifiant>`, copiable, avec conditions, entrées et effets attendus. Le lancement rappelle projet, initiative concernée si nécessaire, compétence et fournisseur, respecte les conditions du workflow et rejoint Conversation. Les dialogues génériques du prototype ne remplacent pas les workflows réels. |
| Indicateur d'état | Distingue état du projet, état de l'agent et validation humaine. Un libellé et une preuve accompagnent les états importants ; les transitions sont annoncées sans prendre le focus. |
| Conversation | Affiche l'identité de l'agent, le projet, le fournisseur, l'invocation et les échanges. Permet réponse, approbation, interruption et récupération selon la capacité réelle de la connexion. Aucune session connue : le dire, puis proposer une action adaptée au projet. |
| Champ de réponse | Préserve la saisie pendant la navigation et une interruption ; envoi explicite, texte vide non envoyé. Une réponse ne devient « envoyée » qu'après retour fiable de l'intégration. Le libellé indique l'agent destinataire. |
| Proposition d'approbation | Présente le changement, sa portée et les fichiers/effets concernés avant le choix. Accepter autorise cette opération ; demander un ajustement poursuit le dialogue. L'approbation d'une production n'est jamais la validation du livrable produit. |
| Récapitulatif de tour | Annonce la fin du tour, les résultats proposés, les décisions prises, les fichiers concernés et la prochaine action attendue. Le statut du workflow reste distinct de l'état du tour et des validations humaines. |
| Panneau de fichiers | Sélectionner ouvre un aperçu avec statut connu, provenance, portée projet ou initiative et chemin ; agrandir préserve le contexte. « Ouvrir dans l'éditeur » est une intégration future : tant qu'elle n'existe pas, expliquer la limite et permettre de copier le chemin sans annoncer une ouverture réussie. |
| Diagnostic et initialisation | Vérifier installation, compatibilité et prérequis avant toute écriture. Installation absente : expliquer BMad v7 et les changements exacts proposés, puis obtenir l'accord. Annuler laisse le dossier intact. Le succès exige une vérification après opération ; l'installation seule ne signifie pas que le produit est cadré. |
| Dialogue | Une décision à la fois ; titre, retour ou fermeture explicite, focus contenu pendant l'ouverture puis rendu au déclencheur. Fermer sans accepter ne confirme rien. |
| Notification | Feedback bref et non bloquant, annoncé poliment. Une attente, une erreur persistante ou une décision reste aussi visible dans la surface concernée ; elle ne dépend pas d'un message qui disparaît. |

## State Patterns

Trois axes restent indépendants : situation du projet, activité de l'agent, acceptation humaine. « Connu » désigne un fait observé et sa source ; « déduit » une interprétation explicite ; « proposé » un résultat soumis à discussion ; « validé » une décision humaine identifiable. Aucun nombre de fichiers ni fin d'exécution ne fait passer automatiquement de l'un à l'autre.

| Surface / état | Traitement et récupération | Couverture |
|---|---|---|
| Accueil sans projet ou sans attente | Expliquer ce qui manque ; offrir Ouvrir un projet. Une liste sans attente ne dit pas que tous les livrables sont validés. | Décrit seulement |
| Lecture initiale du dossier | Indiquer le diagnostic en cours et ce qui est déjà connu, sans afficher un succès provisoire. | Décrit seulement, besoin sourcé |
| BMad absent | Prérequis et changements avant confirmation ; annulation sans écriture ; retour à l'accueil possible. | Maquetté |
| Installation incompatible | Distinguer ancienne version hors V1 et installation v7 dont les compétences/formats ne conviennent pas ; expliquer le problème et orienter vers le diagnostic. Pas de migration implicite. | Décrit seulement, détail à instruire |
| Accès refusé au dossier ou à une opération | Nommer la ressource et le droit manquant quand ils sont connus ; conserver le contexte et proposer de corriger l'accès ou de choisir un dossier accessible. Ne pas annoncer l'opération réussie. | Décrit seulement, besoin de diagnostic sourcé |
| Connexion indisponible / hors ligne | État de connexion explicite ; ne pas lancer une action impossible. Garder les informations déjà connues avec leur portée ; expliquer ce qui peut être réessayé après rétablissement. Ne pas promettre une exécution locale autonome. | Erreur simulée ; connexion réelle non maquettée |
| Projet connu, état partiellement déduit | Présenter les artefacts trouvés, leur statut et les preuves ; marquer validation inconnue et session externe inconnue. | Maquetté |
| Initiative non identifiée ou à choisir | Nommer le contexte manquant. Si une action exige une initiative, guider l'utilisateur pour la choisir ou la créer ; les outils qui n'en exigent pas restent accessibles. Ne pas rattacher silencieusement un résultat à une initiative déduite. | Décrit seulement |
| Catalogue vide, recherche sans résultat, compétence indisponible | Distinguer absence d'installation et filtre sans résultat ; retirer filtre ou diagnostiquer. Une compétence absente n'est pas lançable. | Recherche et absence expliquées ; catalogue entièrement vide décrit seulement |
| Fichiers absents / aperçu inaccessible | Dossier initialisé sans livrable : expliquer la prochaine action. Fichier inaccessible : montrer la limite connue et permettre de réessayer sans effacer la sélection. | Absence maquettée ; erreur de lecture décrite seulement |
| Modification externe | Signaler le fichier à examiner et actualiser les preuves sans attribuer une session, un auteur ou une validation non observés. La saisie courante reste intacte. | Maquetté en simulation |
| Agent en cours | Statut textuel et interruption explicite ; aucun faux pourcentage. | Maquetté |
| Réponse attendue | Question et Champ de réponse ; attente visible dans le projet et à l'accueil. Consulter une preuve conserve la saisie. | Maquetté |
| Approbation attendue | Changement et choix explicites ; aucune approbation par défaut ou par simple navigation. | Maquetté |
| Interrompu / erreur récupérable | Conserver dernier point connu et saisie ; proposer Reprendre ou Réessayer si l'intégration le permet. Ne pas rejouer silencieusement une opération dont le résultat est inconnu. | Maquetté, reprise réelle à démontrer |
| Tour terminé | Récapitulatif et prochaine action ; résultats encore proposés si aucun accord sur leur contenu. | Maquetté |
| Après redémarrage | [ASSUMPTION A2] Retrouver le dernier contexte vérifiable et signaler l'activité devenue inconnue, sans reprendre automatiquement. Le niveau de sauvegarde des échanges et brouillons reste à confirmer. | Décrit seulement |
| Focus et superposition, toute surface | Ordre de lecture cohérent, focus visible, fermeture accessible et retour au déclencheur. | Partie visible dans la maquette ; vérification complète à faire |

Les détails de connexion/authentification Codex, les critères exacts de compatibilité v7 et les changements réels de l'initialisation doivent être instruits avec l'architecture. Ces inconnues ne sont pas des décisions UX déjà approuvées.

## Interaction Primitives

Le [script de la maquette](mockups/parcours-guide/app.js) conserve les interactions simulées ; ses délais et réponses écrites ne spécifient pas les performances ou retours d'une connexion réelle.

- Clic ou activation clavier pour agir ; les possibilités restent disponibles sans survol. Une action réelle n'est pas déclenchée par le seul affichage de sa fiche.
- Navigation rétractable : mémoriser la préférence seule ; si ce stockage est indisponible, conserver le choix pour la visite sans bloquer le travail. Le repli ne recrée pas la conversation et ne vide pas le Champ de réponse.
- Infobulles : même libellé au survol et au focus, position hors du rail, disparition à la sortie ou avec Échap. Les noms accessibles existent même sans infobulle.
- Dialogues et panneaux superposés : fermeture par commande visible et Échap, focus ramené au déclencheur ; pas d'empilement de confirmations.
- Copie d'invocation ou de chemin : confirmer seulement une copie réussie ; si indisponible, proposer une sélection manuelle du texte.
- Interruption et réessai : résultat connu, inconnu ou échec explicités avant de proposer la suite. L'utilisateur conserve le contrôle sur les approbations.

## Accessibility Floor

[ASSUMPTION A1] Viser WCAG 2.2 AA pour la surface web de l'application ; ce niveau n'a pas encore été validé par un audit. Les contrastes visuels et le focus sont définis dans DESIGN.md.

- Toutes les actions au clavier ; ordre de focus conforme à la lecture. Les Onglets du projet exposent sélection et panneau associé ; la Navigation latérale expose destination courante et état développé.
- Noms explicites pour bascule, boutons d'icône, projets, champs et fermeture. L'indication colorée d'attente a un équivalent textuel.
- Annonces de transition d'agent, résultat d'envoi et notification dans une région de statut ; éviter d'annoncer chaque fragment de texte comme une nouvelle alerte.
- Le zoom et l'agrandissement du texte doivent préserver commandes, lecture et saisie. Les cibles compactes de `{components.navigation.compactTarget}` restent utilisables et espacées ; les libellés ne dépendent pas de leur taille visuelle.
- Respecter la réduction de mouvement ; aucun indicateur pulsant. Tester contraste, lecteur d'écran, parcours clavier et focus des panneaux dans l'application intégrée.

## Key Flows

Sam est le protagoniste de conception des trois parcours, développeur qui découvre BMad ; il ne représente pas une persona validée par recherche utilisateur. Les noms reprennent exactement les [parcours sources](.working/parcours-proposes.md).

### 1. Ouvrir et retrouver un projet

1. Sam rouvre Madness après une interruption. L'Accueil présente les projets récents et les attentes nommées.
2. Il ouvre un récent ou choisit un dossier. Madness diagnostique présence de BMad, compatibilité v7, prérequis et accès connus.
3. Si le projet existe, il repère l'initiative active et les autres initiatives connues, puis retrouve leurs artefacts et preuves ; une session externe reste inconnue. L'absence d'initiative est signalée et traitée selon l'action choisie.
4. Si BMad manque, il lit les changements et prérequis, puis accepte ou annule l'initialisation guidée. Après succès vérifié, le projet est prêt à explorer BMad, sans faux état « cadré ».
5. **Moment décisif :** Sam retrouve une prochaine action expliquée et sait s'il doit choisir, répondre ou corriger l'installation.

**Échec et récupération :** dossier inaccessible ou installation incompatible → diagnostic compréhensible, contexte conservé, correction ou autre dossier ; aucun contournement ni migration automatique. Annuler l'initialisation ne modifie pas le dossier. La branche BMad absent est simulée ; les autres diagnostics restent décrits seulement.

### 2. Comprendre l'état et ses preuves

1. Sam ouvre Parcours, identifie le projet et l'initiative concernés, puis distingue leur situation, l'activité de l'agent et la validation humaine.
2. Il consulte la raison de la recommandation, puis l'invocation Codex, les entrées et le résultat attendu.
3. Il explore les groupes d'intentions sans devoir les suivre dans l'ordre ; alternatives et catalogue complet restent accessibles.
4. Il ouvre le brief dans le Panneau de fichiers, lit statut, provenance et chemin ; l'ouverture dans son éditeur sera disponible avec l'intégration future.
5. Il peut comparer une autre compétence et ses conditions, ou demander une orientation avec `$bmad`.
6. **Moment décisif :** Sam peut expliquer ce qui est connu, ce qui est déduit et ce qui attend une décision, avec un fichier ou un événement identifiable.

**Échec et récupération :** recherche sans résultat → enlever un filtre ou reformuler ; fichier manquant/inaccessible → limite affichée, autre preuve ou nouvel essai. Une modification externe mène à l'examen du fichier ; elle n'invente ni conversation ni validation.

### 3. Lancer une action et poursuivre

1. Sam choisit une action et vérifie projet, initiative concernée si nécessaire, compétence, fournisseur, invocation et effets attendus avant lancement.
2. Conversation affiche l'invocation et l'agent. Sam voit « En cours », puis « Réponse attendue » lorsqu'une question lui est posée.
3. Il rédige sa réponse, consulte un fichier et revient sans perdre sa saisie ; l'attente reste visible ailleurs dans Madness.
4. Sam envoie sa réponse. Si une approbation est nécessaire, il examine le changement et choisit de l'autoriser ou de demander un ajustement.
5. Il retrouve les fichiers rattachés au résultat ; leur statut n'est pas déduit de la réussite de l'exécution.
6. **Moment décisif :** « Ce tour est terminé » résume proposition, décision humaine, fichiers et prochaine action ; Sam sait que le workflow peut rester ouvert.

**Échec et récupération :** interruption ou erreur → dernier contexte connu et saisie conservés, reprise/réessai explicite selon les capacités réelles. Si le résultat d'une opération est inconnu, il faut le vérifier avant de la relancer. Le prototype simule ce chemin ; la continuité réelle Codex reste à démontrer.

## Inspiration & Anti-patterns

La [référence Codex Desktop](imports/reference-codex-desktop.png) inspire la conversation centrale et le contexte visible à côté. La [référence de navigation repliée](imports/reference-navigation-repliee.png) inspire le gain de place sans perdre les destinations. Madness y ajoute le guidage BMad, ses preuves et la distinction entre propositions et décisions.

Éviter les étapes obligatoires qui remplaceraient le choix, les pourcentages d'avancement calculés sur la présence de fichiers et les fins de tour confondues avec la clôture d'un workflow. Party-mode reste une possibilité transversale parmi les autres compétences installées.

## Responsive & Platform

Le bureau Windows est la cible V1 ; l'adaptation étroite sert la robustesse d'une fenêtre redimensionnable, sans engagement de livrer une application mobile native. Les seuils de DESIGN.md définissent le passage du panneau de fichiers intégré au panneau sur demande, puis de la navigation au tiroir.

Les captures [menu déployé](mockups/navigation-deployee.png), [rail 58 px](mockups/navigation-repliee.png) et [tiroir étroit](mockups/navigation-mobile.png) montrent les trois états de navigation. Le tiroir conserve ses libellés complets ; la préférence desktop ne force pas un rail en petite fenêtre. Changer la largeur, ouvrir les fichiers ou replier la navigation ne doit ni envoyer une réponse ni perdre le projet actif et la saisie. Le thème clair et le français sont les références conçues ; les autres thèmes et langues restent à décider.
