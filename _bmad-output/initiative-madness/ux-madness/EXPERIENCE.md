---
title: "Madness — expérience utilisateur"
status: final
created: 2026-10-22
updated: 2026-10-28
sources:
  - ../initiative-madness.md
  - .memlog.md
  - ../../../PRODUCT.md
  - ../brief-madness/brief-madness.md
  - .working/parcours-proposes.md
  - .working/verification-prototype.md
  - ../tickets/epic-boucle-codex/epic-boucle-codex.md
  - ../decision-personnelle-locale-2026-10-28.md
  - ../deferred-work.md
  - preparation-refonte-2026-10-28/preparation-refonte.md
---

## Foundation

Madness aide le porteur, développeur peu familier de BMad, à retrouver ses projets locaux et dialoguer avec un agent en comprenant ce qui se passe et ce qui attend sa décision. L’usage courant est personnel sous Windows, code privé, Codex avec son abonnement ChatGPT et BMad v7. La connexion SIWC propre à Madness et ses protections sont conservées, selon la [décision du 28 octobre](../decision-personnelle-locale-2026-10-28.md). Electron, React et TypeScript constituent le socle adopté ; [DESIGN.md](DESIGN.md) porte les règles visuelles.

La base « Parcours guidé » et sa navigation rétractable ont été acceptées le 23 octobre. Leur [prototype](mockups/parcours-guide/index.html) reste une simulation ; ses [vérifications](.working/verification-prototype.md) ne qualifient aucune intégration. La [préparation Sally et trois expertises](preparation-refonte-2026-10-28/preparation-refonte.md) fonde la recomposition présente : projet et onglets d’abord, Conversation orientée vers l’échange, préparation secondaire et récupération condensée. Cette mise à jour finalise le contrat ; l’implémentation et la qualification de la refonte restent distinctes de son acceptation visuelle humaine, encore inconnue.

Les projets, conversations et brouillons sont conservés localement ; la sauvegarde évoquée en A2/Q6 n’est plus à définir. La restauration n’ouvre ni réseau ni moteur et ne reprend aucune conversation native. Les gates et résultats des lots restent ceux de leurs preuves : cette mise à jour ne clôt pas G1 ou la qualification intégrée 1.11. Versions antérieures à v7, migration et reconstruction de conversations externes restent hors du présent parcours.

## Information Architecture

| Surface | Accès et finalité | Parcours | Portée courante |
|---|---|---|---|
| Accueil | Ouverture ou navigation ; récents, activités et attentes corrélées ; accès à la commande unique d’ouverture. | 1 | Livré ; hiérarchie à recomposer. |
| Projet · Parcours | Projet ouvert ; contexte connu, synthèse factuelle, attentes et possibilités livrées. | 1, 2 | Livré ; Mary et Forge seulement, sans recommandation `bmad` calculée. |
| Projet · Conversation | Échange sélectionné, demande pertinente, saisie et décisions ; préparation d’un nouvel échange sur action explicite. | 3 | Livré ; priorité visuelle à recomposer. |
| Connexion Codex et accès | Commande de barre ; compte, contrôle explicite, indisponibilité et aide réseau. | 1, 3 | Livré ; panneau et arrêt inconnu restent accessibles sans projet. |
| Diagnostic et initialisation | Dossier choisi ; compatibilité, prérequis et changements avant accord. | 1 | Profil borné actuel ; diagnostic complet et qualification G2 futurs, epic 2 ; initialisation future, epic 3, consommatrice du diagnostic. |
| Catalogue et Fiche compétence | Possibilités BMad, recherche et explication des conditions de lancement. | 2, 3 | Simulation historique ; guidage et catalogue complet epic 2. |
| Panneau de fichiers et aperçu agrandi | Depuis preuve ou résultat ; lire contenu, statut, provenance et chemin. | 2, 3 | Simulation historique ; panneau et éditeur epic 2. Les chemins observés restent consultables dès maintenant. |

Le projet identifie son nom, le contexte d’initiative connu et ses onglets avant les états détaillés. Conversation commence par l’échange ou son état vide ; la demande et son point de réponse ne sont pas précédés de grands blocs de préparation Mary/Forge. Une bande courte garde le motif principal de récupération et sa portée. Contexte technique, empreinte et historique détaillé se consultent à la demande ; les informations nécessaires à une décision restent présentées avant ses choix.

La navigation rétractable conserve Accueil et les projets récents. Les destinations futures « Possibilités BMad », « Que faire ensuite ? » et « Toutes les possibilités » ne sont pas annoncées comme exécutables. Les futurs regroupements d’intentions restent explorables sans chaîne obligatoire. Plusieurs initiatives peuvent exister : afficher celle réellement connue et ne pas réattribuer un échange lors d’un changement de contexte. La commande détaillée de choix d’initiative reste à définir avec l’epic 2.

## Voice and Tone

Nommer l’objet, sa portée et l’action attendue ; expliquer BMad au moment utile. Les identifiants et invocations restent exacts. Une phrase fixe présentant Mary ou Forge décrit leur objectif ; elle ne prétend pas analyser les besoins du projet.

| Situation | Formulation et règle |
|---|---|
| Activité et historique | « Aucune activité en cours » peut coexister avec « Ancien arrêt non confirmé — nouveaux échanges bloqués ». Ne pas confondre ces faits. |
| Provenance | Agent, invocation et contexte connus, sinon « Identité non attestée » ou valeur inconnue. Aucun rôle déduit du style de réponse. |
| Question | « Mary attend votre réponse » seulement si la demande corrélée est active ; nommer projet et destination. Sinon « Question conservée, inactive ». |
| Approbation | « Autoriser tout le patch une fois » et « Refuser tout le patch » ; l’ajustement ouvre un nouvel échange explicite. |
| Résultat | « Ce tour est terminé » ; distinguer résultat observé, décision humaine, clôture du workflow et prochaine action connue ou inconnue. |
| Erreur | Problème connu, portée, récupération disponible. Aucun diagnostic de proxy ou succès anticipé sans preuve. |
| Capacité future | Expliquer sa disponibilité réelle ; aucune lecture de document ou recommandation calculée fictive. |

## Component Patterns

Les noms correspondent à DESIGN.md · Components. Les composants futurs restent contractuels ; ils n’élargissent pas les profils livrés.

| Composant | Règles de comportement |
|---|---|
| Barre d’action et de titre commune | Une seule commande « Ouvrir un projet », présente sur accueil et projet, dossier SVG avec nom et aide au focus/survol. Bascule sur l’axe du rail et sur la ligne native Windows. Réserver les contrôles natifs ; commandes et modales hors drag. Thème et connexion restent accessibles. |
| Navigation latérale | Réduire/déployer conserve projet, onglet, conversation et saisie. Préférence mémorisée ; échec annoncé sans perdre le choix de session. Rail au-dessus de `{components.navigation.drawerBreakpoint}`, noms et infobulles au focus/survol ; en dessous, tiroir à libellés et retour de focus au déclencheur. |
| Bouton | Action explicite ; indisponibilité expliquée, pas de double lancement. Navigation, ouverture ou fermeture ne vaut jamais accord. Cible `{components.titlebar.target}` au minimum pour les commandes compactes et décisions. |
| Ligne de projet ou d’attente | Ouvre la destination exacte corrélée, y compris autre projet. Raison, portée et possibilité réelle de répondre restent nommées. Une ancienne demande ne redevient pas active. |
| Onglets du projet | Changer de vue conserve saisie et contexte sans répondre ni lancer. L’attente reste visible hors Conversation. Sélection et panneau associé annoncés au clavier. |
| Recommandation | Future suggestion fondée sur `bmad`, aide installée et preuves, raison et alternatives accessibles. Le présent décrit seulement les objectifs Mary/Forge. |
| Groupe d’intentions | Futur dépliage de possibilités, sans étape imposée ; ouvrir un groupe ne lance rien. |
| Catalogue des compétences | Futur catalogue effectivement installé, recherche par intention/agent/identifiant et filtres ; distinguer filtre vide, absence et incompatibilité. Les 27 entrées du [catalogue simulé](mockups/parcours-guide/catalogue.js) ne sont pas un quota produit ; métadonnées `bmod-*` exclues. |
| Fiche compétence | Future invocation exacte et copiable, entrées, effets et conditions ; lancement explicite dans le projet et l’initiative concernés, puis Conversation. Une fiche ne vaut pas autorisation. |
| Indicateur d’état | Sépare situation du projet, activité et décision humaine. Transition annoncée sans déplacement de focus ; aucune progression calculée sur les fichiers. |
| Bande de récupération | Un motif principal avec portée projet ou globale et action disponible. Un arrêt inconnu reste durablement visible et bloque les nouveaux échanges concernés. Une inspection nécessaire reste indiquée ; un rappel court mène aux détails sans masquer la garde. |
| Détails de contexte | Consultation à la demande des informations connues, invocations, chemins intégraux et provenance. Cette compacité ne replie pas les effets ou préconditions nécessaires à une autorisation active. |
| Préparation d’un échange | Présente Mary et Forge avec objectif ; qualification sans modèle, lancement natif et option fichiers séparés. Une nouvelle conversation est explicite ; aucun brouillon transmis au lancement. Forge respecte la recherche native de sessions existantes avant le premier terminal, sans reprise implicite. |
| Conversation | Affiche échange sélectionné, agent connu ou inconnu, fournisseur, contexte et invocation. Messages progressifs corrélés ; provenance figée par item selon ce qui est attesté. Aucun échange sélectionné : état vide et action de préparation, sans lancement automatique. |
| Question de l’agent | Demande active corrélée seulement ; brouillon propre à la demande, choix non secrets et envoi explicite. Après expiration, passage à un état terminal ou restauration : texte conservé et inactif, sans action de réponse. |
| Champ de réponse | Brouillon libre distinct des réponses aux questions ; sauvegarder et envoyer restent séparés. Refuser texte vide et double envoi ; transmettre la copie capturée au clic à la bonne session. « Envoyé » exige le reçu fiable ; échec de conservation signalé sans succès durable inventé. |
| Proposition d’approbation | Lecture seule par défaut, mode fichiers opt-in. Présenter opération, portée intégrale, préconditions et patch complet avant autoriser/refuser. Accord ponctuel pour l’opération exacte ; navigation et fermeture ne l’accordent pas. Ajustement dans un nouveau tour, sans rejeu. |
| Récapitulatif de tour | Projection factuelle des résultats, décisions humaines identifiables, chemins et prochaine action lorsqu’ils sont connus ; conserver les inconnus. Fin de tour, clôture du workflow et validation du livrable restent indépendantes. |
| Connexion Codex | Panneau non modal au clavier/pointeur, titre focalisé et fermeture rendant le focus au logo. OAuth dans le navigateur Windows, forfait annoncé et témoin explicite. Compte enregistré à vérifier, succès daté et borné ; Vérifier, Reconnecter et Déconnecter restent distincts. |
| Panneau de fichiers | Futur aperçu avec statut, provenance, portée et chemin ; agrandir conserve le contexte. L’ouverture dans un éditeur exige une intégration réelle ; chemin copiable sans fausse confirmation d’ouverture. |
| Diagnostic et initialisation | Vérifier prérequis et compatibilité avant écriture. Future initialisation : changements exacts et accord, annulation sans effet, contrôle après opération. Installation seule ne signifie pas produit cadré. |
| Dialogue | Décision unique, fermeture visible et Échap ; focus maintenu dans le dialogue, puis rendu au déclencheur à la fermeture. Fermer n’accepte rien ; aucun empilement de confirmations. |
| Notification | Retour bref annoncé poliment ; attente, erreur durable et décision restent dans leur surface et ne dépendent pas de sa durée. |

## State Patterns

« Connu » repose sur une observation sourcée ; « déduit » reste une interprétation ; « proposé » attend discussion ; « validé » exige une décision humaine identifiable. Ces axes ne fusionnent pas à la fin d’une exécution.

| Surface / état | Traitement et récupération |
|---|---|
| Accueil vide / sans attente | Expliquer l’absence ; pointer la commande unique d’ouverture. Aucune attente ne signifie pas tous les livrables validés. |
| Chargement local / accès refusé | Montrer ce qui est en cours ou la ressource inaccessible ; conserver le contexte sans succès provisoire. Diagnostic ou autre dossier selon la capacité réelle. |
| BMad absent / incompatible | Limite explicite ; pas de migration ou initialisation implicite. Distinguer ancienne version hors V1 et profil v7 non pris en charge. |
| Initiative inconnue | Nommer le manque ; ne pas rattacher silencieusement un résultat à une initiative déduite. Les actions qui ne l’exigent pas restent disponibles. |
| Conversation vide / historique | Montrer l’état vide ou l’échange sélectionné, puis préparation secondaire. Historique consultable, demande inactive sans bouton répondable. |
| Agent en cours / réponse attendue | État textuel, question corrélée et réponse explicite, interruption disponible ; attente visible dans projet et accueil, sans faux pourcentage. |
| Approbation attendue | Portée complète et choix textuels avant décision ; aucun accord par défaut. La demande passée à un état terminal ou restaurée reste inactive. |
| Erreur / interruption confirmée | Dernier contexte et saisie conservés ; actions selon les capacités réelles. Un nouveau lancement crée une nouvelle conversation, sans reprise native promise. |
| Arrêt inconnu / effet incertain | Bande durable, portée globale si concernée, nouveau lancement bloqué. Réobservation seulement sur identité possédée prouvée ; tous les effets incertains sont inspectés localement avant de proposer une nouvelle tentative explicite. |
| Tour terminé | Récapitulatif factuel ; documents encore proposés si aucune validation humaine n’est connue. |
| Après redémarrage / remplacement | Projets, échanges et brouillons locaux retrouvés ; activité historique ou inconnue, demandes inactives. Aucun moteur, réseau, refresh ou relance automatique. Le remplacement personnel conserve ces données selon les preuves de maintenance. |
| Compte enregistré / coffre indisponible | Contrôle explicite avant usage ; erreur actionnable si coffre illisible ou chiffrement impossible, sans réinitialisation ni stockage clair. |
| Connexion indisponible / hors ligne | Conserver les informations connues avec leur portée. Aide et contrôle réseau explicites ; ni exécution autonome promise ni rejeu de tour. |
| Recherche future vide / fichiers inaccessibles | Distinguer filtre et absence réelle ; enlever filtre ou diagnostiquer. Limite de lecture connue sans effacer la sélection. |
| Modification externe | Actualiser la preuve observée sans inventer auteur, session ou validation ; saisie intacte. |
| Focus / superposition | Ordre de lecture cohérent, focus visible, fermeture accessible et retour au déclencheur. |

Connexion personnelle : l’autorisation navigateur est annulable et bornée à dix minutes. Le rappel « Vous utilisez votre forfait ChatGPT » est acquittable et son acquittement conservé ; Échap/Fermer fonctionnent même si son enregistrement échoue. « Gérer l’usage dans ChatGPT » ouvre les paramètres officiels, sans quota inventé. Déconnecter retire les accès locaux sans modifier projets ou brouillons et sans prétendre révoquer un consentement distant.

L’aide réseau affiche uniquement l’adresse publique `https://auth.openai.com/.well-known/jwks.json`, avec Ouvrir, Copier et contrôle d’accès explicite par GET seul. Copier n’annonce un succès qu’après réussite ; ouverture et copie ne lancent ni vérification du forfait ni modèle. Le clic Zscaler déjà connu n’est pas une nouvelle connexion OpenAI : un nouveau refus mesuré peut nécessiter un nouvel acquittement, sans redemander si la page est un JSON ni inventer sa durée de validité. Un contrôle réseau réussi n’envoie aucun message, accord ou tour.

## Interaction Primitives

- Activer au clic ou au clavier ; navigation, dépliage et lecture ne lancent aucun fournisseur et n’accordent aucune opération.
- Garder les brouillons, contexte et historique lors du changement de projet, d’onglet, de thème, de largeur ou de navigation. Un changement de projet ne réattribue pas la session capturée.
- Infobulle : même aide au survol/focus, hors rognage, nom accessible indépendant ; Échap la ferme selon la surface active. Une info nécessaire à décider reste visible sans survol.
- Copie : annoncer la réussite réelle ; sinon texte sélectionnable et erreur locale. Aucun token, cookie, donnée de compte ou callback d’autorisation exposé.
- Après envoi, expiration ou retrait d’une demande, conserver le focus sur la surface de travail appropriée ; s’il faut le rétablir, choisir un repère neutre, jamais Autoriser par défaut.
- Interruption : seulement les ressources possédées ; résultat confirmé ou inconnu explicite. Toute nouvelle tentative ou conversation est volontaire et ne rejoue aucun effet incertain.

Fermer Madness termine les sauvegardes admises et les mutations du coffre, refuse de nouvelles commandes et arrête ses ressources possédées ; un arrêt non confirmé reste inconnu. Échap respecte d’abord la surface modale active.

Les délais et réponses du [script du prototype](mockups/parcours-guide/app.js) restent simulés ; ils ne définissent pas les performances du connecteur.

## Accessibility Floor

[ASSUMPTION A1] Viser WCAG 2.2 AA pour la surface web ; aucun audit de conformité n’est acquis. Contrastes et focus visuels : DESIGN.md.

- Actions au clavier, ordre de focus conforme à la lecture, rôles et états des onglets, navigation, tiroir et demandes exposés.
- Icônes 19 px et cibles d’au moins `{components.titlebar.target}` ; texte conservé pour décisions de question, patch et récupération. Nom, aide au focus et portée textuelle ne dépendent pas de la couleur.
- Transitions, reçus et notifications annoncés par statut ; ne pas transformer chaque delta en alerte.
- Zoom, texte agrandi, chemins et noms longs préservent lecture, commandes et saisie. Aucun débordement de fenêtre nécessaire pour répondre.
- Mouvement réduit : dossier statique, aucune animation pulsante ni défilement imposé. Vérifier clavier, lecteur d’écran, focus et deux thèmes dans l’application intégrée ; les anciennes vérifications ne valent pas audit de la refonte.

## Key Flows

Sam reste le protagoniste de conception des trois [parcours initiaux](.working/parcours-proposes.md), développeur qui découvre BMad ; aucune persona validée par recherche utilisateur n’est ajoutée.

### 1. Ouvrir et retrouver un projet

1. Sam ouvre Madness, éventuellement après remplacement personnel. Il retrouve ses récents, échanges et brouillons conservés, sans agent relancé.
2. Il ouvre un récent ou utilise le dossier de la barre ; projet et initiative connue apparaissent avant les états détaillés.
3. Il distingue activité actuelle, attentes répondables et demandes historiques inactives. Un ancien arrêt inconnu garde sa portée et son accès à la récupération, même sans projet.
4. Un dossier absent, inaccessible ou incompatible mène à la limite connue ; initialisation et diagnostic complet restent futurs. Aucun écran ne les présente comme exécutés.
5. **Moment décisif :** Sam retrouve son travail et sait s’il doit répondre, préparer un nouvel échange ou résoudre un blocage ; sa saisie n’a pas été transmise.

**Échec et récupération :** accès refusé → contexte conservé et correction ou autre dossier ; données ou compte illisibles → erreur explicite sans remise à zéro. Les mécanismes de conservation et les limites du remplacement restent ceux de la qualification réelle.

### 2. Comprendre l’état et ses preuves

1. Sam ouvre Parcours et identifie projet, contexte et activité.
2. Il lit les attentes et le récapitulatif factuel ; il distingue résultat observé, décision connue et donnée inconnue.
3. Il ouvre les détails pour retrouver invocation, provenance et chemin intégral ; aucune lecture de document n’est inventée.
4. Il peut préparer Mary ou Forge selon leurs objectifs. Le futur guidage `bmad`, les intentions, le catalogue et l’aperçu restent des extensions de ce parcours ; leurs simulations n’en prouvent pas la livraison.
5. **Moment décisif :** Sam peut expliquer ce qui est connu, ce qui attend sa décision et à quel événement ou chemin cela se rattache.

**Échec et récupération :** preuve absente ou inaccessible → limite affichée ; modification externe → examiner ce qui a été observé sans inventer conversation ou validation. Le futur catalogue distingue filtre vide et compétence indisponible.

### 3. Lancer une action et poursuivre

1. Sam prépare explicitement Mary ou Forge ; projet, contexte, invocation, compte et forfait sont annoncés. Qualification et lancement restent deux actions ; le mode fichiers exige son choix.
2. Conversation rend immédiatement identifiable l’échange sélectionné. Une question active affiche sa demande et son propre brouillon ; le brouillon libre reste séparé.
3. Sam consulte le contexte ou change de vue, puis revient sans perdre sa saisie. Il envoie explicitement et lit le reçu réel.
4. Si une approbation survient, il examine opération, patch complet, portée et préconditions ; il autorise une fois ou refuse. Un ajustement exige un nouveau tour.
5. Il retrouve résultats et chemins observés ; leur validation humaine ne découle pas du succès technique.
6. **Moment décisif :** le récapitulatif annonce la fin du tour, les faits et décisions connus et l’action attendue, sans fermer fictivement le workflow.

**Échec et récupération :** réseau indisponible → aide et nouveau contrôle GET explicite, sans rejeu ; arrêt inconnu → garde globale et inspection des effets incertains. Une nouvelle conversation ne reprend pas l’historique natif. Fermer/réouvrir retrouve l’historique et les brouillons, sans rendre une ancienne question répondable.

## Inspiration & Anti-patterns

ChatGPT Desktop inspire le chrome discret, les commandes compactes et la conversation au centre. Les références historiques [Codex Desktop](imports/reference-codex-desktop.png) et [navigation repliée](imports/reference-navigation-repliee.png) servent ce gain de place. Madness conserve ses preuves, son guidage BMad prévu et la distinction entre propositions et décisions.

Éviter les grandes préparations avant l’échange, les répétitions de blocages, le catalogue fictif et la validation déduite d’un compteur. Party-mode reste une possibilité transversale future parmi les compétences, sans place privilégiée dans les profils livrés. Loop n’est pas adopté ; le graphe relève de l’epic 4.

## Responsive & Platform

Windows est la cible ; la fenêtre étroite ne constitue pas une application mobile. Les seuils de DESIGN.md règlent rail, tiroir et futur panneau de fichiers. Les captures historiques [déployée](mockups/navigation-deployee.png), [rail](mockups/navigation-repliee.png) et [tiroir](mockups/navigation-mobile.png) illustrent leur base. Repli, largeur et thème conservent la saisie, l’échange et le contexte.

La refonte se vérifie notamment à 1440 × 920, 1280 px de large et 720 × 820, avec noms longs, zoom et mise à l’échelle Windows. En Conversation, échange ou état vide, demande pertinente et point de réponse restent repérables au premier écran de référence ; le défilement nécessaire à un long patch ou historique ne masque pas sa nature ni ses gardes.

Le français est livré ; français/anglais reste une exigence V1, avec extension anglaise en epic 2. Sombre terracotta/bleu par défaut et clair alternatif sont conservés. La commande soleil/lune nomme « Passer au thème clair/sombre » et préserve focus et travail ; les contrôles Windows suivent le thème.

La préférence d’apparence reste distincte des données métier. Profil neuf : sombre. Choix explicite retrouvé sans agent ; fichier illisible ou d’une version future : sombre de secours et avertissement sans écraser le fichier. Sauvegarde refusée : choix maintenu pour la session et erreur accessible. Les [preuves historiques de thème](../qualification-theme/README.md) et d’installation ne valent ni contrôle de la nouvelle composition, ni acceptation visuelle humaine, ni audit d’accessibilité complet.
