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
companions:
  - _bmad-output/initiative-madness/ux-madness/DESIGN.md
  - _bmad-output/initiative-madness/ux-madness/EXPERIENCE.md
  - _bmad-output/initiative-madness/architecture-madness/architecture-madness.md
---

# Madness

## Description

Une interface graphique locale distribuable permet à un développeur peu familier de BMad d'ouvrir ses projets, comprendre leur état et leurs preuves, choisir une possibilité expliquée et poursuivre le travail des agents. La V1 vise Windows, Codex et BMad v7 ; elle reprend les projets existants et accompagne l'initialisation d'un dossier non équipé. Elle conserve les projets, conversations et brouillons, propose français/anglais et clair/sombre, puis inclut le graphe Graphify du code et des dépendances après la base Windows/Codex. Les contrats UX et d'architecture adoptés portent les détails ; leurs qualifications restent à réaliser.

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

- R23 (brief § Intention et utilisateurs ; contexte § Users ; contexte § Operating Context) : Distribuer une première version utilisable sur Windows à d'autres développeurs ; vérifier installation, prérequis et parcours sur une machine cible, avec de vrais projets et une connexion Codex, au-delà de la simulation HTML.

- R24 (brief § Parcours de référence et critères de réussite ; experience § Key Flows) : Vérifier les trois parcours avec une personne peu familière de BMad : ouvrir ou initialiser, expliquer état et preuves, choisir sans mémoriser les commandes, dialoguer et approuver, comprendre problème ou fin de tour et retrouver les fichiers ; distinguer prise en main du prototype et validation de l'application intégrée.

- R25 (contexte § Operating Context ; architecture AD-5) : Après fermeture et réouverture de Madness, retrouver les projets, conversations et brouillons conservés localement, sans relance automatique d'un agent ; présenter les activités et demandes restaurées comme historiques ou inconnues tant qu'elles ne sont pas vérifiées.

- R26 (contexte § Brand Commitments ; architecture AD-8) : Utiliser la V1 en français ou en anglais et en thème clair ou sombre, en conservant contexte et saisie lors d'un changement ; les identifiants techniques, invocations, chemins et artefacts du projet gardent leur contenu et leur langue propres.

- R27 (contexte § Capabilities and Constraints ; architecture AD-9) : Pouvoir mettre à jour les dépendances et le runtime, reconstruire puis republier une version Windows par une procédure vérifiable ; le remplacement du programme conserve les données locales, avec les versions et limites réellement testées consignées.

- R28 (contexte § Capabilities and Constraints ; architecture AD-10) : Depuis un projet ouvert, générer ou actualiser à la demande un graphe local du code, des modules, fichiers et dépendances, rattaché explicitement au projet et au périmètre analysé ; cet outil est livré dans la V1 après la base Windows/Codex, son utilisation reste optionnelle.

- R29 (architecture AD-10) : Rechercher et explorer les éléments du graphe, comprendre le sens, la provenance et le degré de certitude des relations, puis ouvrir le fichier associé dans le panneau existant ; une recherche et une liste de relations accessibles complètent la représentation graphique.

- R30 (architecture AD-10) : Distinguer graphe absent, analyse en cours, résultat disponible, partiel, ancien, incompatible ou en échec ; rendre sa fraîcheur explicite malgré les modifications non commitées ou survenues pendant l'analyse. Rafraîchissement, interruption ou échec conservent le dernier graphe complet connu ; l'indisponibilité du graphe laisse les parcours BMad utilisables et ne signifie aucune validation ni complétude de la solution.

- R31 (architecture § Qualification Gates, G5) : Vérifier le graphe dans le paquet Windows sur un dépôt représentatif : génération sans modèle implicite, isolation des effets, fidélité des relations, recherche et accès au fichier, projets multiples, modifications de sources, interruption, erreurs et contrôles accessibles ; consigner performances et limites observées avant de déclarer le périmètre V1 complet.

- R32 (contexte § Capabilities and Constraints et Evidence on Hand, demande du 27 octobre 2026) : Consulter dans Madness le temps et le coût associés à une user story du projet ouvert, avec un rattachement identifiable à cette US et une indication explicite lorsqu’une mesure ou un montant n’est pas disponible.

## Constraints

- C1 (brief § Priorité : l’expérience utilisateur ; contexte § Product Principles) : L'expérience utilisateur est le premier critère d'arbitrage du périmètre, de l'architecture et des interactions ; les décisions doivent préserver compréhension, guidage et contrôle par un développeur qui découvre BMad.

- C2 (brief § Périmètre confirmé de la V1 ; contexte § Capabilities and Constraints) : Le périmètre livré est Windows, Codex et BMad v7 uniquement ; une étiquette v7 ne suffit pas à garantir la compatibilité de ses formats et compétences.

- C3 (brief § Périmètre confirmé de la V1 ; contexte § Operating Context ; experience § Foundation) : Les projets et leurs artefacts BMad locaux existants restent exploitables ; la reprise ne requiert ni migration d'une ancienne version ni reconstruction supposée de conversations externes.

- C4 (contexte § Capabilities and Constraints ; addendum § Fournisseurs et modes de connexion) : L'intégration retenue doit être vérifiée contre les interfaces, versions, capacités et modes d'authentification officiellement disponibles pour un produit distribué ; le choix d'un connecteur et sa preuve réelle restent à faire.

- C5 (design § Brand & Style ; experience § Foundation ; architecture AD-8) : DESIGN.md et EXPERIENCE.md sont les contrats visuel et comportemental adoptés et prévalent sur les maquettes ; la base française claire reste acceptée. Sally complète les contrats pour l'anglais, le sombre et la vue Graphe avec Impeccable avant les implémentations concernées ; leurs hypothèses et limites restent explicites, sans preuve d'intégration déduite de la simulation.

- C6 (contexte § Platform et Stack ; architecture AD-1, AD-2, AD-5, AD-7–AD-10) : Le socle retenu est Electron + React + TypeScript, starter electron-vite et packaging electron-builder. Le contrat d'architecture adopté gouverne les frontières, contrats partagés, autorités et profils qualifiés des lots ; ses décisions AD-1 à AD-10 gardent leurs identifiants. Les versions candidates restent à qualifier avant leurs consommateurs.

- C7 (contexte § Users et Capabilities and Constraints ; architecture AD-9) : La distribution est gratuite pour commencer, sans licence open source présumée. Projet personnel utilisable en environnement professionnel : les previews sont autorisées si choisies et signalées ; le runtime doit être acceptable par le proxy cible, sans exigence du tout dernier Chromium exact. La reconstruction et la republication doivent rester simples ; l'auto-updater n'est pas requis pour la V1.

- C8 (architecture AD-10 et G5) : Le premier profil Graphify analyse seulement le code et les dépendances, sans enrichissement sémantique ni modèle implicite, sans modifier les sources ou les instructions, skills, hooks, plugins et configurations du projet ou de l'utilisateur. Le confinement, les formats et le packaging sont qualifiés avant disponibilité ; les documents BMad sémantiques et l'intégration agent/MCP sont hors de ce premier profil.

## Done when

1. Sur Windows, un projet BMad existant est repris sans réinitialisation et un dossier non équipé est initialisé après changements compris et acceptés ; annulation, préconditions modifiées, diagnostic incompatible ou inaccessible sont démontrés (R1–R5 ; G2–G3).
2. La personne explique l'état, les déductions et les validations, consulte leurs preuves et retrouve un fichier modifié hors de Madness sans fausse conversation d'origine. Elle consulte aussi le temps et le coût rattachés à une US du projet ouvert, avec provenance et indisponibilité explicites, sans inventer un montant absent (R6–R8, R19, R32).
3. Elle choisit une action expliquée ou une alternative dans le catalogue réel, consulte l'invocation et ses conditions, puis dialogue avec Codex ; questions, approbations, interruption, résultat inconnu et fin de tour aboutissent à un état compréhensible, avec fichiers et suite attendue (R9–R18, R22 ; G1).
4. Navigation rétractable, fichiers, redimensionnement et contrôles accessibles préservent le contexte et la saisie en français/anglais et clair/sombre ; après réouverture, projets, conversations et brouillons sont retrouvés sans relance automatique, selon les contrats étendus de Sally (R19–R21, R25–R26).
5. Une version Windows est reconstruite et installée sur une machine cible ; le remplacement préserve les données, les prérequis réseau/runtime sont vérifiés et les trois parcours avec une personne peu familière de BMad sont consignés, au-delà du prototype (R23–R24, R27 ; G0, G4).
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
- Touch point : runtime et distribution Windows — paquet et procédure de reconstruction ; propriétaire : epic-boucle-codex. Vérification intégrée de la base G4 par epic-initialisation-bmad, module et paquet final G5 par epic-graphe-projet.
- Touch point : contrats du cœur, cycle de vie et stockage local — propriétaire : epic-boucle-codex avant consommateurs ; epic-graphe-projet ajoute le contrat d'analyse sous la même autorité du cœur.
- Touch point : Graphify et runtime Python consommés — propriétaire : epic-graphe-projet ; confinement et profil qualifiés avant disponibilité, sans installation implicite de skills/hooks.
- Chemin de démonstration transversal : ouvrir un projet réel → diagnostiquer v7 → obtenir l'aide contextualisée → choisir une compétence → dialoguer avec Codex et traiter une demande → retrouver le fichier et la suite attendue.
- Hors premier profil Graphe : analyse sémantique des documents BMad, recherche par modèle, installation de skills/hooks ou intégration agent/MCP. Le graphe ne détermine aucune validation BMad.
- Livraison : versions Windows intermédiaires installables à capacités qualifiées et limites explicites ; leur existence ne clôt pas la V1 complète, qui exige aussi le graphe G5. Reconstruction/republication côté développeur incluse ; auto-updater non requis.

## References

Les alias des exigences et contraintes désignent les fichiers suivants ; les sections sont celles nommées dans chaque ligne.

- brief — [Brief produit](brief-madness/brief-madness.md), `_bmad-output/initiative-madness/brief-madness/brief-madness.md` ; Intention et utilisateurs, Priorité : l'expérience utilisateur, Périmètre confirmé de la V1, Parcours de référence et critères de réussite, Extensions et décisions pour les étapes suivantes. Source en brouillon ; aucune approbation globale du brief n'est inférée de l'accord sur le prototype.
- contexte — [Contexte produit](../../PRODUCT.md), `PRODUCT.md` ; Platform, Stack, Users, Operating Context, Capabilities and Constraints, Product Principles, Evidence on Hand.
- addendum — [Recherche et propositions techniques](brief-madness/addendum.md), `_bmad-output/initiative-madness/brief-madness/addendum.md` ; Le minimum : l'aide BMad sur un projet existant, Accompagnement et catalogue BMad, Sessions démarrées ailleurs, Web ou desktop, Fournisseurs et modes de connexion, Modèle d'état proposé. Ses propositions du 22 octobre n'approuvent aucune stack ou intégration ; l'ancien état de découverte UX est remplacé par les contrats finaux.
- design — [Contrat visuel adopté](ux-madness/DESIGN.md), `_bmad-output/initiative-madness/ux-madness/DESIGN.md` ; Brand & Style, Colors, Layout & Spacing, Components. Companion conservé sans modification ; valeurs, composition et références visuelles font foi à leur niveau.
- experience — [Contrat comportemental adopté](ux-madness/EXPERIENCE.md), `_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md` ; Information Architecture, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows, Responsive & Platform. Companion conservé sans modification ; ses tableaux portent les comportements détaillés et les états décrits seulement.

- architecture — [Contrat d'architecture adopté](architecture-madness/architecture-madness.md), `_bmad-output/initiative-madness/architecture-madness/architecture-madness.md` ; AD-1 à AD-10, Consistency Conventions, Qualification Gates G0–G5 et Deferred. Companion conservé sans modification ; les versions et interfaces candidates restent à qualifier. Les décisions du 23 octobre remplacent les anciens choix encore ouverts dans le brief et l'addendum, sans valoir approbation globale de ces sources.

## Notes

- Decision: 2026-10-27 — Le porteur précise que le suivi temps/coût par US est une fonctionnalité de Madness uniquement. Sofia ajoute R32 et le rattache à l’epic 2 sous le mandat autonome : cet epic possède le contexte BMad/US et établira les extensions des contrats et leur qualification avant affichage. Les quatre epics, leurs identifiants et leur ordre restent conservés ; aucune story built ni plan en cours n’est modifié. La 1.8 n’a encore ni plan ni code et conserve son objectif. Les données transitoires de suivi de notre développement sont retirées. Les gates G0–G5 et réserves de distribution restent intacts.

- Open question: Q8 — Quel temps afficher par US : durée écoulée, activité agent ou autre mesure, et avec quelles règles pour attentes, interruptions, exécutions simultanées, rattachement de plusieurs conversations et changements d’US ? À cadrer au raffinement de l’epic 2 avant les consommateurs ; aucune mesure n’est inférée des délais techniques existants.

- Open question: Q9 — Quelles données d’usage et de coût sont réellement exposées par chaque connexion, avec quelle provenance, devise, granularité, couverture et gestion des doublons ? Un coût inconnu reste indisponible ; les tarifs API ne sont pas assimilés à un coût d’abonnement. Qualification avant affichage dans l’epic 2.

- Decision: 2026-10-24 — REPLAN Sofia demandé par le porteur et exécuté sous son mandat autonome : les preuves personnelles du 24 octobre sont rapprochées du tableau, sans changer R1–R31, C1–C8, les quatre epics ou leurs couvertures. L'epic 1 ajoute une qualification 1.12 du profil local effectivement livré avant la suite du tracer 1.3 ; les plans 1.1/1.2 restent bloqués et intacts, obligatoires avant nettoyage final et clôture. La connexion SIWC et la conversation Mary sont acquises sur le poste pour leurs scénarios précis ; le dialogue libre ne prouve ni workflow documentaire, ni distribution. La diffusion publique reste soumise à l'admissibilité du connecteur, aux prérequis Windows/runtime et aux gates applicables, dont G4 selon AD-9 ; la V1 complète exige aussi G5. Les epics 2–4 restent non raffinés, aucun nouveau Build n'est lancé par ce replan.

- Decision: 2026-10-24 — Q2/G1 est partiellement instruit par `qualification-connexion-codex/live-confirmed-profile.json` et `qualification-dialogue-local/live-profile.json` : SIWC indépendant, témoin natif réussi, agent Mary réel, échanges et brouillon retrouvés sans moteur. Restent notamment admissibilité de distribution, workflows documentaires et interactions complètes ; ces preuves ne remplacent pas l'ancien essai d'authentification gérée par Codex. Q3/G2 ne bénéficie que d'un profil Mary épinglé ; ni catalogue général, ni diagnostic multi-initiative, ni compatibilité v7 universelle n'en découlent. Les questions Q2/Q3 restent ouvertes dans leur portée restante.

- Decision: 2026-10-23 — Le porteur part se coucher et donne le feu vert pour avancer en autonomie avec BMad et valider les étapes nécessaires. Ce mandat autorise les décisions de réalisation, contrôles, revues, ajustements de livraison justifiés et commits locaux ; les preuves réellement humaines ou externes manquantes restent des blocages explicites. Le périmètre V1, les fournisseurs, la facturation et la licence restent ceux déjà décidés. L'agent ne transforme pas ce mandat en preuve de consentement OAuth ni en validation utilisateur de l'application intégrée.

- Decision: 2026-10-23 — Le porteur autorise le commit local de la proposition présentée, avec 24 exigences et 6 contraintes ; A1/A2 et Q1–Q6 restent ouverts. Cet accord ne choisit aucune architecture et ne change pas le statut du brief source.

- Decision: 2026-10-23 — Les réponses du porteur pendant Winston règlent Q1 (socle Electron/React/TypeScript, electron-vite et electron-builder), Q5/A2 (conservation locale projets, conversations et brouillons sans relance), Q6 (français/anglais et clair/sombre). Elles remplacent les mentions antérieures non décidées, sans modifier les companions UX adoptés ; Sally doit les réconcilier avant leurs extensions.

- Decision: 2026-10-23 — Graphify fait partie de la V1 après la base Windows/Codex, pour code, modules, fichiers et dépendances. Son usage est optionnel, sa livraison et G5 sont nécessaires à la clôture V1 ; aucune analyse ou intégration réelle n'est encore démontrée.

- Decision: 2026-10-23 — Contrat final de Winston adopté comme companion, sans modification ni renumérotation AD-1 à AD-10. La construction des qualifications et des capacités reste à faire ; aucun epic ni développement ne démarre par cette adoption.

- Assumption: A1 — Cible WCAG 2.2 AA pour la surface web, reprise de EXPERIENCE § Accessibility Floor ; niveau de conformité proposé, non confirmé par un audit. R21 conserve les comportements d'accessibilité déjà décrits sans prétendre à une conformité acquise.

- Open question: Q2 / G1 — Quelle voie officielle Codex, quelle authentification et quelles versions permettent un dialogue distribué réel, avec événements, questions, approbations, interruption et reprise ? La piste app-server est documentée, mais l'éligibilité et le parcours intégré restent à prouver dans le premier epic.

- Open question: Q3 / G2 — Quel profil d'installation BMad et quelles fonctions sont effectivement supportés ? Qualifier structures, modules, racines et empreintes, catalogue partiel, contexte multi-initiative et changements externes ; les métadonnées locales 6.13.0-next ne permettent pas un contrôle limité au major « 7 ».

- Open question: Q4 / G3 — Comment produire un plan d'initialisation exhaustif, vérifier ses préconditions et son résultat, et rapporter le retour observable de l'ouverture dans l'éditeur ? Le contrat fixe les garanties ; les opérations réelles et leurs limites restent à vérifier.

- Open question: Q7 / G5 — Quel runtime Python, quel paquet et profil Graphify permettent le parcours Windows conforme à AD-10, avec effets confinés, relations fidèles et performances observées ? La recherche de sources n'est pas une analyse exécutée ni une preuve de packaging.

- Decision: 2026-10-23 — Le porteur valide les quatre epics, leur ordre et leurs limites tels que présentés, puis autorise la création des enveloppes et le commit local des documents. La coupure suit quatre résultats utilisables : dialogue Codex réel, projets BMad existants, initialisation et G4 Windows, graphe et G5. Le socle appartient au premier epic ; les prérequis sont ceux du manifeste. Les epics restent à raffiner, sans stories ni développement lancés.
