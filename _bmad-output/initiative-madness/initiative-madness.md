---
type: initiative
title: Madness
parent: none
risk: high
sources:
  - _bmad-output/initiative-madness/brief-madness/brief-madness.md
  - PRODUCT.md
  - _bmad-output/initiative-madness/brief-madness/addendum.md
  - _bmad-output/initiative-madness/ux-madness/DESIGN.md
  - _bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
companions:
  - _bmad-output/initiative-madness/ux-madness/DESIGN.md
  - _bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
---

# Madness

## Description

Une interface graphique distribuable permet à un développeur peu familier de BMad d'ouvrir ses projets locaux, comprendre leur état et leurs preuves, choisir une possibilité expliquée et poursuivre le travail des agents dans l'interface. La V1 vise Windows, Codex et BMad v7 ; elle reprend les artefacts existants et accompagne aussi l'initialisation d'un dossier non équipé. Le brief nourrit les exigences ; les deux contrats UX finalisés portent les détails visuels et comportementaux.

## Outcome

Une personne qui découvre BMad accomplit les trois parcours « Ouvrir et retrouver un projet », « Comprendre l'état et ses preuves » et « Lancer une action et poursuivre » sur un projet réel : elle choisit sans mémoriser les commandes, explique l'état avec ses preuves, répond à l'agent et retrouve le livrable ainsi que la prochaine action.

## Requirements

- R1 (brief § Périmètre confirmé de la V1 ; experience § Key Flows, parcours 1) : Ouvrir un ou plusieurs projets locaux, dont un projet BMad déjà en cours, et retrouver pour chacun son contexte, ses initiatives et ses livrables sans réinitialisation imposée.

- R2 (experience § Information Architecture ; experience § Component Patterns, Ligne de projet ou d'attente) : Retrouver à l'accueil les projets récents et leurs attentes nommées, puis ouvrir directement le projet ou le point de réponse, de relecture, d'interruption ou d'erreur concerné.

- R3 (brief § Périmètre confirmé de la V1 ; experience § State Patterns) : Diagnostiquer à l'ouverture puis avant une opération ses prérequis utiles, l'accès au dossier, la présence de BMad et la compatibilité effective de v7 ; distinguer absence, ancienne version et v7 incompatible ou inconnue, avec une explication et une action de récupération.

- R4 (brief § Périmètre confirmé de la V1 ; experience § Diagnostic et initialisation) : Initialiser BMad v7 dans un dossier non équipé après présentation des prérequis et des changements exacts puis accord explicite ; annuler laisse le dossier intact et le succès n'est annoncé qu'après vérification de l'installation.

- R5 (brief § Périmètre confirmé de la V1 ; experience § Information Architecture) : Identifier le projet et l'initiative active, retrouver et choisir les autres initiatives repérées, et rattacher état, action et fichiers au bon contexte ; changer d'initiative ne réattribue pas les anciens échanges ou résultats, et les outils sans initiative restent accessibles.

- R6 (brief § Périmètre confirmé de la V1 ; experience § Key Flows, parcours 2) : Présenter le parcours BMad et son état connu à partir des artefacts du projet ; les étapes, livrables et interprétations affichés renvoient à leurs preuves consultables et rendent les informations manquantes explicites.

- R7 (brief § Périmètre confirmé de la V1 ; brief § Parcours de référence et critères de réussite ; experience § Modification externe) : Prendre en compte les fichiers BMad modifiés hors de Madness, actualiser les preuves et retrouver les résultats sans perdre la saisie courante ; ne pas inventer la session, l'auteur, l'activité ou la validation d'origine.

- R8 (brief § Périmètre confirmé de la V1 ; experience § State Patterns) : Distinguer situation du projet, activité de l'agent et acceptation humaine, ainsi que fait observé, déduction et proposition ; ni présence de fichier ni fin d'exécution ne suffit à afficher une validation humaine.

- R9 (brief § Priorité : l’expérience utilisateur ; contexte § Product Principles ; addendum § Le minimum : l’aide BMad sur un projet existant) : Expliquer une prochaine action à partir de bmad, de l'aide des modules installés et des preuves du projet, en distinguant aide chargée et recommandation produite par l'agent ; proposer les alternatives utiles sans imposer une séquence obligatoire.

- R10 (brief § Périmètre confirmé de la V1 ; experience § Catalogue des compétences ; addendum § Accompagnement et catalogue BMad) : Explorer et rechercher l'ensemble des compétences réellement installées, y compris outils transversaux et modules présents ; exclure les métadonnées non invocables, expliquer absence ou incompatibilité et permettre de corriger une recherche vide, sans liste ni quota figés.

- R11 (brief § Priorité : l’expérience utilisateur ; experience § Fiche compétence) : Consulter pour chaque action son objectif, l'invocation Codex exacte et copiable, ses entrées, ses conditions et ses effets ou livrables attendus ; une action indisponible explique ce qui manque et ne se présente pas comme exécutable.

- R12 (brief § Périmètre confirmé de la V1 ; addendum § Accompagnement et catalogue BMad ; experience § Fiche compétence) : Lancer depuis Madness les workflows du catalogue pris en charge avec Codex dans le projet et l'initiative indiqués, puis rejoindre leur conversation réelle ; respecter leurs conditions et formes d'interaction, y compris lorsqu'un usage autonome est prévu.

- R13 (brief § Périmètre confirmé de la V1 ; experience § Conversation) : Lire les retours de l'agent avec son identité connue, le fournisseur, l'invocation et le contexte, puis répondre aux questions et poursuivre les échanges dans Madness ; un retour de texte final seul ne tient pas lieu de dialogue intégré.

- R14 (brief § Parcours de référence et critères de réussite ; experience § Proposition d'approbation) : Traiter les demandes d'approbation dans Madness en présentant opération, portée et effets ou fichiers avant le choix ; accepter autorise uniquement l'opération annoncée, demander un ajustement poursuit le dialogue, et navigation ou fermeture ne vaut pas accord.

- R15 (contexte § Product Principles ; experience § State Patterns ; experience § Indicateur d'état) : Rendre visibles travail en cours, réponse ou approbation attendue, interruption, erreur et fin de tour, avec l'action attendue et un retour accessible depuis le projet et l'accueil ; utiliser un libellé et une preuve connue, sans faux pourcentage ni attente limitée à une notification temporaire.

- R16 (experience § Champ de réponse ; experience § Interaction Primitives) : Conserver la saisie pendant navigation, consultation de fichiers et interruption ; envoyer explicitement à l'agent identifié, refuser un envoi vide et un double lancement, et n'annoncer une réponse envoyée qu'après confirmation fiable de la connexion.

- R17 (brief § Parcours de référence et critères de réussite ; experience § Interrompu / erreur récupérable) : Pouvoir interrompre et reprendre ou réessayer selon les capacités réelles, en conservant le dernier contexte connu ; distinguer succès, échec et résultat inconnu, puis vérifier ce dernier avant de rejouer une opération.

- R18 (contexte § Product Principles ; experience § Récapitulatif de tour) : À la fin d'un tour, présenter les résultats proposés, décisions humaines identifiables, fichiers concernés et prochaine action attendue ; rendre distincts fin du tour, clôture du workflow et validation des livrables.

- R19 (experience § Panneau de fichiers ; experience § Key Flows, parcours 2) : Lire les livrables dans un aperçu intégré et agrandissable avec chemin, provenance, portée et statut connu, puis demander leur ouverture dans l'éditeur ; constater la réussite ou expliquer l'échec réel, avec copie du chemin disponible, sans perdre le contexte.

- R20 (design § Layout & Spacing ; experience § Navigation latérale ; experience § Responsive & Platform) : Réduire et redéployer le menu gauche, consulter les fichiers et redimensionner la fenêtre sans perdre projet, initiative, conversation ou saisie ; garder les destinations et attentes identifiables, mémoriser la préférence de navigation et rester utilisable si ce stockage échoue.

- R21 (experience § Accessibility Floor ; experience § Interaction Primitives ; design § Colors) : Utiliser les actions au clavier avec noms accessibles, focus visible et rendu au déclencheur après fermeture ; comprendre les états sans couleur ni survol seuls, conserver lecture et commandes au zoom, et respecter la réduction de mouvement selon les contrats UX.

- R22 (contexte § Capabilities and Constraints ; experience § Connexion indisponible / hors ligne) : Identifier la connexion Codex, ses capacités réelles et son indisponibilité ; expliquer une opération impossible, conserver les informations déjà connues avec leur portée et proposer une récupération sans annoncer d'exécution autonome ou de reprise non prise en charge.

- R23 (brief § Intention et utilisateurs ; contexte § Users ; contexte § Operating Context) : Distribuer une première version utilisable sur Windows à d'autres développeurs ; vérifier installation, prérequis et parcours sur une machine cible, avec de vrais projets et une connexion Codex, au-delà de la simulation HTML.

- R24 (brief § Parcours de référence et critères de réussite ; experience § Key Flows) : Vérifier les trois parcours avec une personne peu familière de BMad : ouvrir ou initialiser, expliquer état et preuves, choisir sans mémoriser les commandes, dialoguer et approuver, comprendre problème ou fin de tour et retrouver les fichiers ; distinguer prise en main du prototype et validation de l'application intégrée.

## Constraints

- C1 (brief § Priorité : l’expérience utilisateur ; contexte § Product Principles) : L'expérience utilisateur est le premier critère d'arbitrage du périmètre, de l'architecture et des interactions ; les décisions doivent préserver compréhension, guidage et contrôle par un développeur qui découvre BMad.

- C2 (brief § Périmètre confirmé de la V1 ; contexte § Capabilities and Constraints) : Le périmètre livré est Windows, Codex et BMad v7 uniquement ; une étiquette v7 ne suffit pas à garantir la compatibilité de ses formats et compétences.

- C3 (brief § Périmètre confirmé de la V1 ; contexte § Operating Context ; experience § Foundation) : Les projets et leurs artefacts BMad locaux existants restent exploitables ; la reprise ne requiert ni migration d'une ancienne version ni reconstruction supposée de conversations externes.

- C4 (contexte § Capabilities and Constraints ; addendum § Fournisseurs et modes de connexion) : L'intégration retenue doit être vérifiée contre les interfaces, versions, capacités et modes d'authentification officiellement disponibles pour un produit distribué ; le choix d'un connecteur et sa preuve réelle restent à faire.

- C5 (design § Brand & Style ; experience § Foundation) : DESIGN.md et EXPERIENCE.md sont les contrats visuel et comportemental adoptés et prévalent sur les maquettes ; leurs limites et hypothèses restent explicites, et les données simulées ne prouvent aucune intégration réelle.

- C6 (contexte § Platform ; contexte § Stack) : La surface d'interface est en technologie web ; son hébergement, le framework et le packaging restent à choisir, sans engagement actuel pour Electron, Tauri, un site hébergé ou un navigateur avec service local.

## Done when

1. Sur Windows, un projet BMad existant est repris sans réinitialisation et un dossier non équipé peut être initialisé après changements compris et acceptés ; annulation et diagnostic incompatible ou inaccessible sont démontrés (R1–R5).
2. La personne peut expliquer l'état connu, les déductions et les validations, ouvrir leurs preuves et retrouver un fichier modifié hors de Madness sans fausse conversation d'origine (R6–R8, R19).
3. Elle choisit une action expliquée ou une alternative dans le catalogue réel, consulte l'invocation et ses conditions puis démarre le workflow correspondant avec Codex, au-delà d'un dialogue de démonstration (R9–R13).
4. Questions, approbations, interruption et erreur aboutissent à un état compréhensible ; réponse et résultat incertains ne sont pas annoncés comme réussis et la fin de tour expose fichiers et suite attendue (R14–R18, R22).
5. Navigation rétractable, consultation des fichiers, redimensionnement et parcours clavier préservent le contexte et la saisie selon les contrats UX ; les contrôles d'accessibilité décrits portent sur l'application intégrée (R19–R21).
6. La version est installable et utilisable par un autre développeur sur une machine Windows cible ; la vérification des trois parcours est consignée avec les capacités et limites réellement observées (R23–R24).

## Boundaries

- Inclus : ouverture de plusieurs projets locaux, initiatives et artefacts existants ; guidage, catalogue et exécution des compétences installées avec Codex ; initialisation guidée de v7 et lecture des changements externes.
- Hors V1 : BMad antérieur à v7 et migration, autres OS et application mobile native ; GitHub Copilot et Claude Code, dont Bedrock ou abonnement, restent des fournisseurs cibles suivants.
- Hors V1 : découverte et suivi en direct, synchronisation ou pilotage des conversations lancées dans VS Code ou Desktop/Codex. L'observation de leurs artefacts est incluse ; une preuve sur un outil ne validera pas les autres.
- Les possibilités BMad ne deviennent pas des étapes obligatoires ; party-mode n'est pas un axe privilégié. Les conditions des workflows et les décisions de l'utilisateur restent respectées.
- Touch point : dossiers et artefacts BMad — diagnostic, lecture, initialisation et preuves ; propriétaire à attribuer lors du découpage.
- Touch point : connexion Codex — invocation, événements, dialogue et autorisations ; propriétaire à attribuer lors du découpage.
- Touch point : interface Madness — contexte, guidage, conversation et fichiers ; propriétaire à attribuer lors du découpage.
- Touch point : distribution Windows — installation et prérequis sur la machine cible ; propriétaire à attribuer lors du découpage.
- Chemin de démonstration transversal : ouvrir un projet réel → diagnostiquer v7 → obtenir l'aide contextualisée → choisir une compétence → dialoguer avec Codex et traiter une demande → retrouver le fichier et la suite attendue.

## References

Les alias des exigences et contraintes désignent les fichiers suivants ; les sections sont celles nommées dans chaque ligne.

- brief — [Brief produit](brief-madness/brief-madness.md), `_bmad-output/initiative-madness/brief-madness/brief-madness.md` ; Intention et utilisateurs, Priorité : l'expérience utilisateur, Périmètre confirmé de la V1, Parcours de référence et critères de réussite, Extensions et décisions pour les étapes suivantes. Source en brouillon ; aucune approbation globale du brief n'est inférée de l'accord sur le prototype.
- contexte — [Contexte produit](../../PRODUCT.md), `PRODUCT.md` ; Platform, Stack, Users, Operating Context, Capabilities and Constraints, Product Principles, Evidence on Hand.
- addendum — [Recherche et propositions techniques](brief-madness/addendum.md), `_bmad-output/initiative-madness/brief-madness/addendum.md` ; Le minimum : l'aide BMad sur un projet existant, Accompagnement et catalogue BMad, Sessions démarrées ailleurs, Web ou desktop, Fournisseurs et modes de connexion, Modèle d'état proposé. Ses propositions du 22 octobre n'approuvent aucune stack ou intégration ; l'ancien état de découverte UX est remplacé par les contrats finaux.
- design — [Contrat visuel adopté](ux-madness/DESIGN.md), `_bmad-output/initiative-madness/ux-madness/DESIGN.md` ; Brand & Style, Colors, Layout & Spacing, Components. Companion conservé sans modification ; valeurs, composition et références visuelles font foi à leur niveau.
- experience — [Contrat comportemental adopté](ux-madness/EXPERIENCE.md), `_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md` ; Information Architecture, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows, Responsive & Platform. Companion conservé sans modification ; ses tableaux portent les comportements détaillés et les états décrits seulement.

## Notes

- Decision: 2026-10-23 — Le porteur autorise le commit local de la proposition présentée, avec 24 exigences et 6 contraintes ; A1/A2 et Q1–Q6 restent ouverts. Cet accord ne choisit aucune architecture et ne change pas le statut du brief source.

- Assumption: A1 — Cible WCAG 2.2 AA pour la surface web, reprise de EXPERIENCE § Accessibility Floor ; niveau de conformité proposé, non confirmé par un audit. R21 conserve les comportements d'accessibilité déjà décrits sans prétendre à une conformité acquise.
- Assumption: A2 — Après redémarrage, retrouver le dernier contexte vérifiable sans relance automatique et indiquer toute activité inconnue ; principe proposé dans EXPERIENCE § State Patterns. Le contenu réellement sauvegardé reste à décider avec Q5.

- Open question: Q1 — Quel hébergement, framework et packaging Windows choisir pour une interface web pilotant des projets locaux ? Winston doit challenger les options ; Electron et le moteur local séparé de l'addendum restent des propositions.

- Open question: Q2 / G1 — Quelle voie officielle Codex, quel mode d'authentification et quelles versions permettent lancement, événements, questions, approbations, interruption et reprise dans un produit distribué ? Winston doit proposer une preuve sur projet réel ; aucun abonnement ni accès aux sessions externes n'est supposé interchangeable avec une API.

- Open question: Q3 / G2 — Quelles versions, structures et compétences BMad v7 sont supportées, et quels contrôles distinguent installation exploitable, inconnue ou incompatible ? À préciser avant de déclarer le diagnostic opérationnel.

- Open question: Q4 / G3 — Quels changements exacts l'initialisation propose-t-elle et comment vérifier les opérations réelles sur les fichiers et l'ouverture dans l'éditeur ? L'architecture doit définir les opérations et leurs retours observables.

- Open question: Q5 — Quels éléments retrouver après fermeture : projets, initiative et point d'attente seulement, ou aussi échanges et brouillons ? Niveau de persistance et de reprise à confirmer avec le porteur ; A2 ne décide pas de leur stockage.

- Open question: Q6 — Le français et le thème clair des contrats deviennent-ils le périmètre linguistique et visuel de la V1 distribuée, ou faut-il d'autres langues ou thèmes dès cette version ? Aucune extension n'est engagée par les références actuelles.
