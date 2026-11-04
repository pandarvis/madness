---
type: initiative
status: in-progress
title: Madness
parent: none
risk: high
sources:
  - _bmad-output/initiative-madness/brief-madness/brief-madness.md
  - PRODUCT.md
  - _bmad-output/initiative-madness/brief-madness/addendum.md
  - _bmad-output/initiative-madness/ux-madness/DESIGN.md
  - _bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
  - _bmad-output/initiative-madness/architecture-madness/architecture-madness.md
  - _bmad-output/initiative-madness/decision-personnelle-locale-2026-10-28.md
companions:
  - _bmad-output/initiative-madness/ux-madness/DESIGN.md
  - _bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
  - _bmad-output/initiative-madness/architecture-madness/architecture-madness.md
---

# Madness

## Description

Une interface graphique personnelle locale permet au porteur peu familier de BMad d'ouvrir ses projets, comprendre leur état et leurs preuves, choisir une possibilité expliquée et poursuivre le travail des agents avec son abonnement ChatGPT. La V1 vise Windows, Codex et BMad v7 ; elle reprend les projets existants et accompagne l'initialisation d'un dossier non équipé. Elle conserve les projets, conversations et brouillons, propose français/anglais et clair/sombre, puis inclut le graphe Graphify du code et des dépendances après la base Windows/Codex. Les contrats UX et d'architecture adoptés portent les détails ; leurs qualifications restent à réaliser.

## Outcome

Le suivi du temps et du coût par US fait aussi partie du produit, avec des mesures sourcées et les indisponibilités explicites ; son cadrage précède ses consommateurs dans l’epic 2.

Une personne qui découvre BMad accomplit les trois parcours réels « Ouvrir et retrouver un projet », « Comprendre l'état et ses preuves » et « Lancer une action et poursuivre » dans une version Windows installable ; elle choisit sans mémoriser les commandes, explique les preuves, dialogue et retrouve le résultat. Elle retrouve ensuite son travail sauvegardé et peut explorer les dépendances de son projet avec un graphe dont la provenance et la fraîcheur sont compréhensibles.

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

- R23 (personnel § Décision du porteur ; contexte § Users et Operating Context) : Utiliser une première version Windows pour les projets personnels locaux du porteur, avec son abonnement ChatGPT ; vérifier installation, prérequis et parcours sur sa machine cible, avec de vrais projets et une connexion Codex, au-delà de la simulation HTML.

- R24 (brief § Parcours de référence et critères de réussite ; experience § Key Flows) : Vérifier les trois parcours avec une personne peu familière de BMad : ouvrir ou initialiser, expliquer état et preuves, choisir sans mémoriser les commandes, dialoguer et approuver, comprendre problème ou fin de tour et retrouver les fichiers ; distinguer prise en main du prototype et validation de l'application intégrée.

- R25 (contexte § Operating Context ; architecture AD-5) : Après fermeture et réouverture de Madness, retrouver les projets, conversations et brouillons conservés localement, sans relance automatique d'un agent ; présenter les activités et demandes restaurées comme historiques ou inconnues tant qu'elles ne sont pas vérifiées.

- R26 (contexte § Brand Commitments ; architecture AD-8) : Utiliser la V1 en français ou en anglais et en thème clair ou sombre, en conservant contexte et saisie lors d'un changement ; les identifiants techniques, invocations, chemins et artefacts du projet gardent leur contenu et leur langue propres.

- R27 (personnel § Réconciliation des exigences et tickets ; contexte § Capabilities and Constraints ; architecture AD-9) : Pouvoir mettre à jour les dépendances et le runtime, reconstruire puis réinstaller une version Windows pour son usage personnel par une procédure vérifiable ; le remplacement du programme conserve les données locales, avec les versions et limites réellement testées consignées.

- R28 (contexte § Capabilities and Constraints ; architecture AD-10) : Depuis un projet ouvert, générer ou actualiser à la demande un graphe local du code, des modules, fichiers et dépendances, rattaché explicitement au projet et au périmètre analysé ; cet outil est livré dans la V1 après la base Windows/Codex, son utilisation reste optionnelle.

- R29 (architecture AD-10) : Rechercher et explorer les éléments du graphe, comprendre le sens, la provenance et le degré de certitude des relations, puis ouvrir le fichier associé dans le panneau existant ; une recherche et une liste de relations accessibles complètent la représentation graphique.

- R30 (architecture AD-10) : Distinguer graphe absent, analyse en cours, résultat disponible, partiel, ancien, incompatible ou en échec ; rendre sa fraîcheur explicite malgré les modifications non commitées ou survenues pendant l'analyse. Rafraîchissement, interruption ou échec conservent le dernier graphe complet connu ; l'indisponibilité du graphe laisse les parcours BMad utilisables et ne signifie aucune validation ni complétude de la solution.

- R31 (architecture § Qualification Gates, G5) : Vérifier le graphe dans le paquet Windows sur un dépôt représentatif : génération sans modèle implicite, isolation des effets, fidélité des relations, recherche et accès au fichier, projets multiples, modifications de sources, interruption, erreurs et contrôles accessibles ; consigner performances et limites observées avant de déclarer le périmètre V1 complet.

- R32 (contexte § Capabilities and Constraints et Evidence on Hand, demande du 27 octobre 2026) : Consulter dans Madness le temps et le coût associés à une user story du projet ouvert, avec un rattachement identifiable à cette US et une indication explicite lorsqu’une mesure ou un montant n’est pas disponible.

## Constraints

- C1 (brief § Priorité : l’expérience utilisateur ; contexte § Product Principles) : L'expérience utilisateur est le premier critère d'arbitrage du périmètre, de l'architecture et des interactions ; les décisions doivent préserver compréhension, guidage et contrôle par un développeur qui découvre BMad.

- C2 (brief § Périmètre confirmé de la V1 ; contexte § Capabilities and Constraints) : Le périmètre livré est Windows, Codex et BMad v7 uniquement ; une étiquette v7 ne suffit pas à garantir la compatibilité de ses formats et compétences.

- C3 (brief § Périmètre confirmé de la V1 ; contexte § Operating Context ; experience § Foundation) : Les projets et leurs artefacts BMad locaux existants restent exploitables ; la reprise ne requiert ni migration d'une ancienne version ni reconstruction supposée de conversations externes.

- C4 (personnel § Décision du porteur et Appui documentaire et portée ; contexte § Capabilities and Constraints) : L’intégration retenue doit être vérifiée contre les interfaces, versions, capacités et modes d’authentification officiellement disponibles pour un projet personnel exécuté localement. La connexion SIWC propre à Madness déjà livrée et l’abonnement ChatGPT sont conservés, sans changement implicite d’authentification ni de facturation.

- C5 (design § Brand & Style ; experience § Foundation ; architecture AD-8) : DESIGN.md et EXPERIENCE.md sont les contrats visuel et comportemental adoptés et prévalent sur les maquettes ; la base française claire reste acceptée. Sally complète les contrats pour l'anglais, le sombre et la vue Graphe avec Impeccable avant les implémentations concernées ; leurs hypothèses et limites restent explicites, sans preuve d'intégration déduite de la simulation.

- C6 (contexte § Platform et Stack ; architecture AD-1, AD-2, AD-5, AD-7–AD-10) : Le socle retenu est Electron + React + TypeScript, starter electron-vite et packaging electron-builder. Le contrat d'architecture adopté gouverne les frontières, contrats partagés, autorités et profils qualifiés des lots ; ses décisions AD-1 à AD-10 gardent leurs identifiants. Les versions candidates restent à qualifier avant leurs consommateurs.

- C7 (personnel § Décision du porteur ; contexte § Users et Capabilities and Constraints ; architecture AD-9) : Madness est réservé au porteur, en local sous Windows, avec code privé ; aucune distribution à d’autres développeurs ni publication du code n’est requise. L’usage en environnement professionnel reste possible : les previews sont autorisées si choisies et signalées ; le runtime doit être acceptable par le proxy cible, sans exigence du tout dernier Chromium exact. La reconstruction et la réinstallation doivent rester simples ; l’auto-updater n’est pas requis pour la V1.

- C8 (architecture AD-10 et G5) : Le premier profil Graphify analyse seulement le code et les dépendances, sans enrichissement sémantique ni modèle implicite, sans modifier les sources ou les instructions, skills, hooks, plugins et configurations du projet ou de l'utilisateur. Le confinement, les formats et le packaging sont qualifiés avant disponibilité ; les documents BMad sémantiques et l'intégration agent/MCP sont hors de ce premier profil.

## Done when

1. Sur Windows, un projet BMad existant est repris sans réinitialisation et un dossier non équipé est initialisé après changements compris et acceptés ; annulation, préconditions modifiées, diagnostic incompatible ou inaccessible sont démontrés (R1–R5 ; G2–G3).
2. La personne explique l'état, les déductions et les validations, consulte leurs preuves et retrouve un fichier modifié hors de Madness sans fausse conversation d'origine. Elle consulte aussi le temps et le coût rattachés à une US du projet ouvert, avec provenance et indisponibilité explicites, sans inventer un montant absent (R6–R8, R19, R32).
3. Elle choisit une action expliquée ou une alternative dans le catalogue réel, consulte l'invocation et ses conditions, puis dialogue avec Codex ; questions, approbations, interruption, résultat inconnu et fin de tour aboutissent à un état compréhensible, avec fichiers et suite attendue (R9–R18, R22 ; G1).
4. Navigation rétractable, fichiers, redimensionnement et contrôles accessibles préservent le contexte et la saisie en français/anglais et clair/sombre ; après réouverture, projets, conversations et brouillons sont retrouvés sans relance automatique, selon les contrats étendus de Sally (R19–R21, R25–R26).
5. Une version Windows personnelle est reconstruite et installée sur la machine cible du porteur avec son abonnement ChatGPT ; le remplacement préserve les données, les prérequis réseau/runtime sont vérifiés et les trois parcours avec une personne peu familière de BMad sont consignés, au-delà du prototype (R23–R24, R27 ; G0, G4).
6. Après la base Windows/Codex, le graphe réel permet génération, exploration/recherche et accès au fichier ; fraîcheur, limites, échec et interruption sont compréhensibles, les effets restent confinés, performances et accessibilité sont vérifiées sur dépôt représentatif. La V1 complète exige aussi G5 (R28–R31).

## Boundaries

- Inclus : ouverture de plusieurs projets locaux, initiatives et artefacts existants ; guidage, catalogue et dialogue des compétences avec Codex ; initialisation guidée de v7, changements externes, conservation locale, français/anglais, clair/sombre et graphe code/dépendances Graphify après la base Windows/Codex.
- Hors V1 : BMad antérieur à v7 et migration, autres OS et application mobile native ; GitHub Copilot et Claude Code, dont Bedrock ou abonnement, restent des fournisseurs cibles suivants.
- Hors V1 : découverte et suivi en direct, synchronisation ou pilotage des conversations lancées dans VS Code ou Desktop/Codex. L'observation de leurs artefacts est incluse ; une preuve sur un outil ne validera pas les autres.
- Les possibilités BMad ne deviennent pas des étapes obligatoires ; party-mode n'est pas un axe privilégié. Les conditions des workflows et les décisions de l'utilisateur restent respectées.
- Touch point : dossiers et artefacts BMad — diagnostic, lecture et preuves ; propriétaire : epic-projets-bmad, avec extension d'initialisation par epic-initialisation-bmad après son diagnostic.
- Touch point : connexion Codex — invocation, événements, dialogue et autorisations ; propriétaire : epic-boucle-codex.
- Touch point : temps et coût par US — propriétaire : epic-projets-bmad, qui établit les règles de rattachement à une US et les extensions versionnées des contrats de mesure, connecteur et persistance avant leurs consommateurs. Le socle et ses contrats existants restent ceux d’epic-boucle-codex ; leurs plans built ne sont pas réécrits. Ce besoin produit ne crée aucun journal de notre développement.
- Touch point : interface et contrats UX Madness — guidage, navigation, variantes et fichiers ; propriétaire : epic-projets-bmad. La conversation initiale appartient à epic-boucle-codex, la nouvelle vue Graphe à epic-graphe-projet, selon les mêmes contrats.
- Touch point : runtime et installation personnelle Windows — paquet et procédure de reconstruction ; propriétaire : epic-boucle-codex. Vérification intégrée de la base G4 par epic-initialisation-bmad, module et paquet final G5 par epic-graphe-projet.
- Touch point : contrats du cœur, cycle de vie et stockage local — propriétaire : epic-boucle-codex avant consommateurs ; epic-graphe-projet ajoute le contrat d'analyse sous la même autorité du cœur.
- Touch point : Graphify et runtime Python consommés — propriétaire : epic-graphe-projet ; confinement et profil qualifiés avant disponibilité, sans installation implicite de skills/hooks.
- Chemin de démonstration transversal : ouvrir un projet réel → diagnostiquer v7 → obtenir l'aide contextualisée → choisir une compétence → dialoguer avec Codex et traiter une demande → retrouver le fichier et la suite attendue.
- Hors premier profil Graphe : analyse sémantique des documents BMad, recherche par modèle, installation de skills/hooks ou intégration agent/MCP. Le graphe ne détermine aucune validation BMad.
- Livraison : versions Windows personnelles intermédiaires installables à capacités qualifiées et limites explicites ; leur existence ne clôt pas la V1 complète, qui exige aussi le graphe G5. Reconstruction/réinstallation personnelle incluse ; auto-updater non requis. Distribution à d’autres développeurs et publication du code hors du besoin courant.

## References

Les alias des exigences et contraintes désignent les fichiers suivants ; les sections sont celles nommées dans chaque ligne.

- personnel — [Décision du porteur du 28 octobre 2026](decision-personnelle-locale-2026-10-28.md), `_bmad-output/initiative-madness/decision-personnelle-locale-2026-10-28.md` ; Décision du porteur, Appui documentaire et portée, Réconciliation des exigences et tickets, Contrats et suite. Cette décision remplace les mentions historiques de distribution dans les sources, sans modifier les companions adoptés ni les mécanismes déjà réalisés.

- brief — [Brief produit](brief-madness/brief-madness.md), `_bmad-output/initiative-madness/brief-madness/brief-madness.md` ; Intention et utilisateurs, Priorité : l'expérience utilisateur, Périmètre confirmé de la V1, Parcours de référence et critères de réussite, Extensions et décisions pour les étapes suivantes. Source en brouillon ; aucune approbation globale du brief n'est inférée de l'accord sur le prototype.
- contexte — [Contexte produit](../../PRODUCT.md), `PRODUCT.md` ; Platform, Stack, Users, Operating Context, Capabilities and Constraints, Product Principles, Evidence on Hand.
- addendum — [Recherche et propositions techniques](brief-madness/addendum.md), `_bmad-output/initiative-madness/brief-madness/addendum.md` ; Le minimum : l'aide BMad sur un projet existant, Accompagnement et catalogue BMad, Sessions démarrées ailleurs, Web ou desktop, Fournisseurs et modes de connexion, Modèle d'état proposé. Ses propositions du 22 octobre n'approuvent aucune stack ou intégration ; l'ancien état de découverte UX est remplacé par les contrats finaux.
- design — [Contrat visuel adopté](ux-madness/DESIGN.md), `_bmad-output/initiative-madness/ux-madness/DESIGN.md` ; Brand & Style, Colors, Layout & Spacing, Components. Companion conservé sans modification ; valeurs, composition et références visuelles font foi à leur niveau.
- experience — [Contrat comportemental adopté](ux-madness/EXPERIENCE.md), `_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md` ; Information Architecture, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows, Responsive & Platform. Companion conservé sans modification ; ses tableaux portent les comportements détaillés et les états décrits seulement.

- architecture — [Contrat d'architecture adopté](architecture-madness/architecture-madness.md), `_bmad-output/initiative-madness/architecture-madness/architecture-madness.md` ; AD-1 à AD-10, Consistency Conventions, Qualification Gates G0–G5 et Deferred. Companion conservé sans modification ; les versions et interfaces candidates restent à qualifier. Les décisions du 23 octobre remplacent les anciens choix encore ouverts dans le brief et l'addendum, sans valoir approbation globale de ces sources.

## Notes

- Decision: 2026-11-05 — Q8/Q9 arrêtées sous mandat autonome après2.10 built dans1811f7bfdf7f04dc545cd955c1801e10fa228297 : Winston réellement activé puis adoption Sofia,89cas documentaires et trois corrections du banc résolues par mêmes Quick/high. Retenir durée cumulée des tours localement observés, attentes comprises, story choisie explicitement avant tour et preuves/occurrence/contexte capturés ; déduplication, contradictions et couverture inconnue/partielle explicites. Source-type story et instrumentation durable restent à produire en2.11, aucune reconstruction des historiques. CLI0.144.6/267schémas exacts qualifient des déclarations, pas émission/réception/persistance SIWC ; aucun usage/coût/devise attribuable actuellement qualifié, coût indisponible sans zéro ni tarif API/abonnement. Les champs natifs restent à observer dans un futur échange utile autorisé, sans bloquer les contrats qui affichent cette indisponibilité. L’inconnue de12 est levée par ces décisions/preuves, pas par une mesure native inventée ; Sally12 précède11/13. Aucune exigence, couverture, dépendance, spine ou plan built modifié. Voir tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md depuis l’initiative.

- Decision: 2026-11-04 — Le porteur réaffirme une zone Graphify réelle dans cette version, sous son mandat complet d’autonomie. Seule la livraison change, aucune exigence ni couverture : catalogue2.6 → fichiers2.8 → premier onglet4.4 → reprise2.9 et suite2 → voie locale3.9 → compléments4.5–4.9 ;4.8 consomme explicitement2.14 et4.11 garde3.10/G4. Le graphe local n’exige ni BMad installé ni connexion IA. Une seule voie produit :2.9 attend4.4 et4.5 attend3.9, afin de ne pas déplacer le fork de Main/preload/cœur/persistance/renderer. Un seul Build produit actif, prédécesseur revu et stable avant consommation, même si le magasin classe built dans review. Le conflit d’ordre déclaratif2→4 du manifeste parent est assumé selon Board : les capacités partielles2.8→4.4→2.9 forment un DAG de feuilles, jamais des gates d’epics entiers ; la sortie brute order_conflict n’est pas effacée ni annoncée vide. G2/G3/G4/G5 et les essais humains/externes restent requis à leur niveau ; les inconnus, sources, versions, projets personnels et plans built sont conservés. Les quatre epics/ids et R1–R32/C1–C8 restent inchangés ; le graphe ne devient aucune validation BMad. La participation réelle3.10 et G5 ne sont pas remplacés par cette anticipation.

- Decision: 2026-11-03 — Raffinement/adoption de3/4 et REPLAN de livraison sous le mandat autonome jusqu'à implémentation complète : aucune exigence, couverture ou intention ne change. Les dix entrées3 et onze entrées4 sont allouées sans feuille ni plan anticipé. L'ancien gate entier4→epic3/G4 bloquait aussi la qualification locale indépendante lors d'un essai humain reporté ; AD-10 distingue l'analyse des agents et la base Windows/Codex1.11 est déjà construite. 4.1 consomme1.11/2.3 ; 4.2 produit son supplément UX dédié sans modifier les spines, 4.3 ses contrats/validations propres sans raccordements partagés ; 4.4 attend fichiers/éditeur2.8, variantes2.14 et voie locale3.9 puis réconcilie l'unique voie produit. 4.11 garde3.10/G4 ; G3/G4/G5, participation novice et preuves externes réelles restent nécessaires à la clôture V1. La zone réelle Graphe dans cette version (recherche/zoom/relations/nœud vers fichier, Sally/Impeccable) précise R28–R31 déjà présents. Aucun gate, essai, permission ou résultat inconnu n'est promu en succès ; aucun plan built, spine, profil ou compte n'est modifié.


- Decision: 2026-11-03 — À la suite du retour du porteur sur les essais réseau récurrents et les attentes humaines qui ralentissent le projet, prioriser la progression locale sous le mandat autonome : initiatives/projections/catalogue consultable/fichiers/Quick Resume de l’epic2 avancent sans une recommandation native réussie2.2. La relecture de code déjà effectuée reste acquise ; les validations natives manquantes restent tracées, et conditionnent leur consommation réelle et la clôture intégrée. Aucun succès inventé, exigence retirée, plan existant réécrit ou nouveau fournisseur. Les détails de séquencement et la politique de non-répétition des sollicitations réseau sont dans les Notes d’epic-projets-bmad, une seule voie de changements produit. AD-9 et les spines adoptés restent valides.


- Decision: 2026-11-03 — Le porteur précise sa priorité : comprendre dans quel état est chaque projet commencé, retrouver un résumé des actions passées et plusieurs récapitulatifs, puis savoir ce qui reste à faire, comme un « Quick Resume » de jeu vidéo. La direction visuelle et le vocabulaire peuvent poursuivre l’atelier inspiré du jeu. Cette clarification rend prioritaire la reprise de contexte entre projets dans les exigences existantes R1/R2/R6–R9/R18/R25 ; elle ne crée pas un cinquième epic ni une nouvelle exigence. L’epic2 compose l’état, les preuves, les récapitulatifs disponibles et la prochaine action expliquée ; l’epic1 conserve son récapitulatif factuel de tour déjà livré. L’absence de preuve ou une information ancienne restent visibles, sans reconstruire une conversation externe absente. Reprendre ouvre le contexte conservé ; tout lancement d’agent garde son action explicite. Le mode d’une éventuelle synthèse rédigée par IA reste à préciser, sans génération automatique ni coût supposés par cette clarification.

- Decision: 2026-10-28 — L’epic1 est techniquement clos sous la délégation du porteur :1.11 built dans8880b17 et relecture indépendante Closure favorable, F1 documentaire résolu. Preuves tickets/epic-boucle-codex/qualification-e2e/parent-verification.md et closure-review.md ; G0/G1 bornés au poste Windows personnel observé, SIWC conservé, Codex0.144.6 et profil Mary/Forge, ASAR9249…. La refonte distincte Sally/trois expertises/Impeccable est built dans5d135f9 puis installée en0.1.2 ASAR6664da10… :355tests,75contrôles intégrés,12disposition/conservation, huit contrôles installés et58empreintes identiques au remplacement ; compte et données conservés. La preuve native de l’ancien ASAR ne devient pas celle du nouveau. L’epic2 est raffiné et préparé en17entrées, première2.1 prête après résolution de l’inconnue de refonte ; aucun Build2 lancé. Q3/G2, Q4/G3, Q7/G5 et Q8/Q9 restent ouvertes, les parcours humains G4 et l’appréciation visuelle globale ne sont pas déduits des contrôles techniques. Les jalons historiques ci-dessous sont conservés, actualisés par cette décision.

- Decision: 2026-10-28 — Le porteur précise « cette app n’est que pour moi : je veux juste brancher mon abo ChatGPT dessus point final ». Sofia REPLAN recadre R23/R27 et C4/C7, identifiants R1–R32 conservés, vers l’usage personnel local Windows, code privé et abonnement ChatGPT. La connexion SIWC propre à Madness reste celle livrée ; l’admission d’un client privé distribué, la publication du code et une bascule API sont hors du besoin courant. La source datée `decision-personnelle-locale-2026-10-28.md` prévaut sur les mentions de distribution historiques, dont les décisions du 24 octobre ci-dessous.

- Decision: 2026-10-28 — La 1.1 distribuable est abandonnée sans succès technique déclaré ; son ancien essai natif unknown/cleanup false reste historique, distinct du SIWC personnel. La 1.10 attend 1.2, 1.12 et 1.3–1.9 built ; la 1.11 attend toujours 1.10 et garde les contrôles techniques intégrés sur la voie personnelle, dont arrêt/fermeture, nettoyage possédé et réseau/certificats du processus Codex. Ni Build ni clôture de G0/G1 ne sont lancés par ce replan. Les epics 1–4, leurs couvertures et leur ordre sont conservés ; l’epic 3 applique R23 à la machine personnelle cible sans retirer G4 ni les trois parcours.

- Decision: 2026-10-28 — Les contrats architecture AD-1 à AD-10 et UX adoptés restent intacts ; seules leurs mentions historiques de distribution sont remplacées dans le périmètre courant par la décision personnelle locale. Réconciliation documentaire à leur prochaine mise à jour, sans mécanisme différent ni nouveau gate administratif. Les protections, qualifications techniques G0–G5, langues/thèmes, graphe, temps/coût et fournisseurs cibles ne changent pas. La refonte Sally/experts/Impeccable reste à réaliser selon le mandat existant ; aucune acceptation visuelle humaine n’est déduite.

- Decision: 2026-10-27 — Le porteur précise que le suivi temps/coût par US est une fonctionnalité de Madness uniquement. Sofia ajoute R32 et le rattache à l’epic 2 sous le mandat autonome : cet epic possède le contexte BMad/US et établira les extensions des contrats et leur qualification avant affichage. Les quatre epics, leurs identifiants et leur ordre restent conservés ; aucune story built ni plan en cours n’est modifié. La 1.8 n’a encore ni plan ni code et conserve son objectif. Les données transitoires de suivi de notre développement sont retirées. Les gates G0–G5 et réserves de distribution restent intacts.

- Resolved question: Q8 — Quel temps afficher par US : durée écoulée, activité agent ou autre mesure, et avec quelles règles pour attentes, interruptions, exécutions simultanées, rattachement de plusieurs conversations et changements d’US ? À cadrer au raffinement de l’epic 2 avant les consommateurs ; aucune mesure n’est inférée des délais techniques existants.

- Resolved question: Q9 — Quelles données d’usage et de coût sont réellement exposées par chaque connexion, avec quelle provenance, devise, granularité, couverture et gestion des doublons ? Un coût inconnu reste indisponible ; les tarifs API ne sont pas assimilés à un coût d’abonnement. Qualification avant affichage dans l’epic 2.

- Decision: 2026-10-24 — REPLAN Sofia demandé par le porteur et exécuté sous son mandat autonome : les preuves personnelles du 24 octobre sont rapprochées du tableau, sans changer R1–R31, C1–C8, les quatre epics ou leurs couvertures. L'epic 1 ajoute une qualification 1.12 du profil local effectivement livré avant la suite du tracer 1.3 ; les plans 1.1/1.2 restent bloqués et intacts, obligatoires avant nettoyage final et clôture. La connexion SIWC et la conversation Mary sont acquises sur le poste pour leurs scénarios précis ; le dialogue libre ne prouve ni workflow documentaire, ni distribution. La diffusion publique reste soumise à l'admissibilité du connecteur, aux prérequis Windows/runtime et aux gates applicables, dont G4 selon AD-9 ; la V1 complète exige aussi G5. Les epics 2–4 restent non raffinés, aucun nouveau Build n'est lancé par ce replan.

- Decision: 2026-10-24 — Q2/G1 est partiellement instruit par `qualification-connexion-codex/live-confirmed-profile.json` et `qualification-dialogue-local/live-profile.json` : SIWC indépendant, témoin natif réussi, agent Mary réel, échanges et brouillon retrouvés sans moteur. Restent notamment admissibilité de distribution, workflows documentaires et interactions complètes ; ces preuves ne remplacent pas l'ancien essai d'authentification gérée par Codex. Q3/G2 ne bénéficie que d'un profil Mary épinglé ; ni catalogue général, ni diagnostic multi-initiative, ni compatibilité v7 universelle n'en découlent. Les questions Q2/Q3 restent ouvertes dans leur portée restante.

- Decision: 2026-10-23 — Le porteur part se coucher et donne le feu vert pour avancer en autonomie avec BMad et valider les étapes nécessaires. Ce mandat autorise les décisions de réalisation, contrôles, revues, ajustements de livraison justifiés et commits locaux ; les preuves réellement humaines ou externes manquantes restent des blocages explicites. Le périmètre V1, les fournisseurs, la facturation et la licence restent ceux déjà décidés. L'agent ne transforme pas ce mandat en preuve de consentement OAuth ni en validation utilisateur de l'application intégrée.

- Decision: 2026-10-23 — Le porteur autorise le commit local de la proposition présentée, avec 24 exigences et 6 contraintes ; A1/A2 et Q1–Q6 restent ouverts. Cet accord ne choisit aucune architecture et ne change pas le statut du brief source.

- Decision: 2026-10-23 — Les réponses du porteur pendant Winston règlent Q1 (socle Electron/React/TypeScript, electron-vite et electron-builder), Q5/A2 (conservation locale projets, conversations et brouillons sans relance), Q6 (français/anglais et clair/sombre). Elles remplacent les mentions antérieures non décidées, sans modifier les companions UX adoptés ; Sally doit les réconcilier avant leurs extensions.

- Decision: 2026-10-23 — Graphify fait partie de la V1 après la base Windows/Codex, pour code, modules, fichiers et dépendances. Son usage est optionnel, sa livraison et G5 sont nécessaires à la clôture V1 ; aucune analyse ou intégration réelle n'est encore démontrée.

- Decision: 2026-10-23 — Contrat final de Winston adopté comme companion, sans modification ni renumérotation AD-1 à AD-10. La construction des qualifications et des capacités reste à faire ; aucun epic ni développement ne démarre par cette adoption.

- Assumption: A1 — Cible WCAG 2.2 AA pour la surface web, reprise de EXPERIENCE § Accessibility Floor ; niveau de conformité proposé, non confirmé par un audit. R21 conserve les comportements d'accessibilité déjà décrits sans prétendre à une conformité acquise.

- Decision: 2026-10-28 — Q2 / G1 résolue au niveau technique personnel par1.11 : workflow BMad réel, événements, questions, approbations/refus, arrêt/fermeture et nettoyage possédés, état inconnu en loopback, restauration et remplacement rapprochés dans tickets/epic-boucle-codex/qualification-e2e/final-matrix.md. Profil Windows/SIWC/Mary/Forge et limites du reçu9249… conservés ; aucun catalogue général, reprise native ou G2–G5 déduit. L’admission d’un client distribué reste hors du besoin courant et l’ancienne voie1.1 dropped n’est pas déclarée réussie.

- Open question: Q3 / G2 — Quel profil d'installation BMad et quelles fonctions sont effectivement supportés ? Qualifier structures, modules, racines et empreintes, catalogue partiel, contexte multi-initiative et changements externes ; les métadonnées locales 6.13.0-next ne permettent pas un contrôle limité au major « 7 ».

- Open question: Q4 / G3 — Comment produire un plan d'initialisation exhaustif, vérifier ses préconditions et son résultat, et rapporter le retour observable de l'ouverture dans l'éditeur ? Le contrat fixe les garanties ; les opérations réelles et leurs limites restent à vérifier.

- Open question: Q7 / G5 — Quel runtime Python, quel paquet et profil Graphify permettent le parcours Windows conforme à AD-10, avec effets confinés, relations fidèles et performances observées ? La recherche de sources n'est pas une analyse exécutée ni une preuve de packaging.

- Decision: 2026-10-23 — Le porteur valide les quatre epics, leur ordre et leurs limites tels que présentés, puis autorise la création des enveloppes et le commit local des documents. La coupure suit quatre résultats utilisables : dialogue Codex réel, projets BMad existants, initialisation et G4 Windows, graphe et G5. Le socle appartient au premier epic ; les prérequis sont ceux du manifeste. Les epics restent à raffiner, sans stories ni développement lancés.
