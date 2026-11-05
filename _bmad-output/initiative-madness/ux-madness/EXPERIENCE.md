---
title: "Madness — expérience utilisateur"
status: final
created: 2026-10-22
updated: 2026-11-05
sources:
  - ../tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md
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
  - ../tickets/epic-projets-bmad/epic-projets-bmad.md
  - ../tickets/epic-projets-bmad/qualification-profil-g2/profil-g2.md
  - atelier-agents-2026-11-02/handoff.json
  - qualification-atelier/sally-final-reconciliation.md
  - ../../../.impeccable/surfaces/src-renderer-src-app-tsx.md
  - ../../../src/renderer/src/styles.css
  - ../../../src/renderer/src/AgentInfoPanel.tsx
  - ../tickets/epic-projets-bmad/qualification-actualisation/ux/sally-update.md
---

## Foundation

Madness aide le porteur, développeur peu familier de BMad, à retrouver ses projets locaux et dialoguer avec un agent en comprenant ce qui se passe et ce qui attend sa décision. L’usage courant est personnel sous Windows, code privé, Codex avec son abonnement ChatGPT et BMad v7. La connexion SIWC propre à Madness et ses protections sont conservées, selon la [décision du 28 octobre](../decision-personnelle-locale-2026-10-28.md). Electron, React et TypeScript constituent le socle adopté ; [DESIGN.md](DESIGN.md) porte les règles visuelles.

La base « Parcours guidé » et sa navigation rétractable ont été acceptées le 23 octobre. Leur [prototype](mockups/parcours-guide/index.html) reste une simulation ; ses [vérifications](.working/verification-prototype.md) ne qualifient aucune intégration. La refonte issue de la [préparation Sally et trois expertises](preparation-refonte-2026-10-28/preparation-refonte.md) est livrée et installée : projet et onglets d’abord, Conversation orientée vers l’échange, préparation secondaire et récupération condensée. Sa [qualification](qualification-refonte/parent-verification.md) ne vaut pas acceptation visuelle humaine globale, encore inconnue.

Les projets, conversations et brouillons sont conservés localement ; la sauvegarde évoquée en A2/Q6 n’est plus à définir. La restauration n’ouvre ni réseau ni moteur et ne reprend aucune conversation native. L’epic 1 est clos techniquement, G0/G1 bornés au profil personnel Mary/Forge selon [1.11](../tickets/epic-boucle-codex/qualification-e2e/parent-verification.md). Versions antérieures à v7, migration et reconstruction de conversations externes restent hors du présent parcours.

L’Update Sally de 2.17 définit les sept parcours contractuels de l’epic 2 ; leurs règles ci-dessous sont conservées. Le profil G2 candidat de 2.1 reste une preuve hors produit. Le candidat 2.2 intègre lecture locale et demande native $bmad avec des reçus réels conservés, mais demeure in-review avec M14 ouvert ; le propriétaire signale un nouveau 307 réel après le dernier acquittement humain. Aucun nouveau contrôle réseau n’est réalisé par cette documentation. Les huit reçus natifs ne closent pas cette limite ni ne qualifient le skin atelier. Les choix sont tracés dans [.memlog.md](.memlog.md) et [l’index de couverture](guidage-epic2/contrats-et-couverture.md). Catalogue général, Q8/Q9/R32, initialisation et graphe gardent leurs lots propres.

La [direction atelier approuvée](atelier-agents-2026-11-02/handoff.json) est implémentée dans le candidat 0.2.1, ASAR 486cfe44e26256729617b661bdd48e657a3d520c1efa77f21adfe180feaf3118. La [réconciliation finale](qualification-atelier/sally-final-reconciliation.md) décrit sa portée : conversation centrale, portraits discrets et fiche locale. Elle n’annonce ni installation personnelle, ni acceptation visuelle humaine globale, ni audit WCAG, ni clôture de 2.2.

La précision Quick Resume de 2.4 étend le parcours 5 existant, sans ajouter de parcours ni relancer un agent. Le [DESIGN racine](../../../DESIGN.md) reste l’autorité visuelle courante de l’atelier/jeu ; palettes, fontes et casting approuvés sont conservés. Les règles suivantes sont contractuelles avant implémentation, sans nouveau résultat de qualification ni accord humain déduit.

## Information Architecture

| Surface | Accès et finalité | Parcours | Portée courante |
|---|---|---|---|
| Accueil | Ouverture ou navigation ; récents, activités et attentes corrélées ; commande unique d’ouverture. | 1, 7 | Livré et recomposé ; extension multi-projet/initiatives/preuves prévue en 2.9. |
| Projet · Parcours | Projet ouvert ; attentes/récupérations, Reprise du projet et preuves, puis guidage et préparation secondaires. | 1, 2, 5 | Reprise sourcée et détails textuels en 2.4 ; actualisation externe en 2.5, aperçu en 2.8 ; aucune capacité annoncée avant sa preuve. |
| Projet · Conversation | Échange sélectionné, demande pertinente, saisie et décisions ; préparation explicite. | 2, 3, 7 | Dialogue livré ; réponse native $bmad dans le candidat 2.2 encore in-review/M14 ; catalogue futur en 2.7. |
| Connexion Codex et accès | Commande de barre ; compte, contrôle explicite, indisponibilité et aide réseau. | 1, 2, 3 | Livré ; panneau et arrêt inconnu accessibles sans projet. |
| Fiche agent | Portrait ou Fiche agent d’un message attesté reconnu ; rôle et provenance de cet item. | 2, 3, 7 | Implémentée dans le candidat atelier ; consultation locale informative, aucun choix ou lancement d’agent. |
| Diagnostic et initialisation | Dossier choisi ou Détails de contexte → Voir le diagnostic ; profil et capacités indépendantes. | 1 | Diagnostic G2 prévu en epic 2 selon candidat 2.1 ; initialisation future epic 3, aucun setup implicite. |
| Sélecteur d’initiative | En-tête projet → Choisir une initiative ; liste et conflit dans Dialogue. | 4 | Contrat 2.3 : sélection Madness distincte de l’active BMad ; aucune écriture de configuration. |
| Aides chargées | Parcours → Que faire ensuite ? ; contenu lu, couverture et préflight avant demande à l’agent. | 2 | Candidat 2.2 encore in-review ; lecture, transmission, réponse et conservation distinctes. |
| Catalogue des compétences et Fiche compétence | Onglet Toutes les possibilités, ou alternatives → fiche. | 3 | Contrats 2.6/2.7 : catalogue réel, copie distincte du lancement qualifié. |
| Panneau de fichiers et aperçu agrandi | Preuve/résultat → Aperçu ; Agrandir ouvre un Dialogue de lecture. | 5, 6 | Contrat 2.8 ; chemin/provenance/statut et contexte de l’origine conservés. |

Le projet identifie son nom, le contexte d’initiative connu et ses onglets avant les états détaillés. Conversation commence par l’échange ou son état vide ; la demande et son point de réponse ne sont pas précédés de grands blocs de préparation Mary/Forge. Une bande courte garde le motif principal de récupération et sa portée. Contexte technique, empreinte et historique détaillé se consultent à la demande ; les informations nécessaires à une décision restent présentées avant ses choix.

La navigation rétractable conserve Accueil et les projets récents. « Que faire ensuite ? » développe les Aides chargées dans Parcours ; « Toutes les possibilités » est la destination unique du catalogue dans le projet, sans doublon de navigation. Les groupes d’intentions restent explorables sans chaîne obligatoire. Le choix d’initiative est défini au parcours 4 ; les échanges gardent leur contexte capturé, même lorsqu’il diffère de la sélection de consultation. Chaque preuve ou demande reste adressée par projet, initiative lorsqu’elle est connue et identifiant propre ; aucun retour ne se résout vers « le dernier échange » par approximation.

Les [mesures par US](#epic2-metrics) prolongent les parcours [2](#epic2-p2), [3](#epic2-p3) et [5](#epic2-p5) dans les surfaces existantes : choix avant chaque tour dans Préparation d’un échange ou Champ de réponse, consultation locale par US dans le Registre des preuves et par tour dans le Récapitulatif de tour. Ce contrat prospectif applique [D1–D6 de 2.10](../tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md) ; il ne rend aucune mesure disponible dans le produit courant. R32 concerne le produit uniquement.

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

<a id="epic2-copy"></a>

### Libellés des parcours de l’epic 2

Formulations contractuelles pour le français et l’anglais ; l’anglais sera livré par 2.14. Les valeurs entre accolades ci-dessous sont des données : leurs noms, chemins, commandes, textes de projet et réponses brutes ne sont jamais traduits. Le choix de langue traduit l’interface et conserve sélection, focus et saisie.

| Usage | Français | English |
|---|---|---|
| Destinations | Accueil · Parcours · Conversation · Toutes les possibilités | Home · Journey · Conversation · All possibilities |
| Ouverture/diagnostic | Ouvrir un projet · Voir le diagnostic · Actualiser le diagnostic | Open a project · View diagnostic · Refresh diagnostic |
| Chargement local | Lecture du projet en cours… | Reading project… |
| Profil absent/ancien/inconnu | BMad absent · Ancien format observé · Compatibilité inconnue | BMad not found · Legacy format observed · Compatibility unknown |
| Profil partiel/incompatible | Profil partiel — certaines capacités restent disponibles · Profil incompatible — voir les capacités concernées | Partial profile — some capabilities remain available · Incompatible profile — see affected capabilities |
| Profil candidat/invalidé/erreur | Profil candidat observé · Diagnostic périmé — nouvelle lecture requise · Diagnostic impossible | Candidate profile observed · Diagnostic out of date — refresh required · Could not diagnose project |
| Aide | Que faire ensuite ? · Aides chargées · Voir les aides · Demander à BMad | What next? · Loaded help · View help · Ask BMad |
| Couverture | {loaded} documents chargés ; {unavailable} indisponibles · Références seules — contenu non chargé | {loaded} documents loaded; {unavailable} unavailable · References only — content not loaded |
| Provenance | Source · Module · Révision · Observé le · Portée · Couverture | Source · Module · Revision · Observed at · Scope · Coverage |
| Demande native | Envoi à BMad en cours… · Aides transmises — reçu natif disponible | Sending to BMad… · Help transmitted — native receipt available |
| Réponse native | Réponse de BMad · Raisons · Alternatives | BMad response · Reasons · Alternatives |
| Capacité manquante | Recommandation native non qualifiée · Lancement non qualifié : {reason} | Native recommendation not qualified · Launch not qualified: {reason} |
| Reçu inconnu | Envoi non confirmé — aucun nouvel envoi automatique | Send not confirmed — no automatic resend |
| Catalogue | Rechercher une possibilité · Intention, agent, nom ou invocation · Tous les modules · Effacer les filtres | Search possibilities · Intent, agent, name or invocation · All modules · Clear filters |
| Vide | Aucun résultat pour cette recherche · Aucune compétence invocable repérée · Inventaire indisponible | No matches for this search · No invocable skills found · Inventory unavailable |
| Fiche | Objectif · Entrées · Conditions · Effets et livrables attendus · Disponibilité | Purpose · Inputs · Conditions · Expected effects and deliverables · Availability |
| Actions fiche | Copier l’invocation · Préparer le lancement · Lancer une nouvelle conversation | Copy invocation · Prepare launch · Start a new conversation |
| Disponibilité fiche | Descriptif seulement · Invocation copiable · Lancement disponible pour ce profil · Condition inconnue | Description only · Invocation can be copied · Launch available for this profile · Unknown condition |
| Copie | Invocation copiée · Chemin copié · Copie impossible — sélectionnez le texte | Invocation copied · Path copied · Could not copy — select the text |
| Initiatives | Choisir une initiative · Sélection Madness · Active dans BMad · Aucune initiative repérée | Choose an initiative · Madness selection · Active in BMad · No initiative found |
| Conflit | Sélection : {selected}. Active dans BMad : {active}. Cette action exige un contexte concordant. | Selected: {selected}. Active in BMad: {active}. This action requires a matching context. |
| Sorties du conflit | Sélectionner l’initiative active · Rester sur cette sélection · Annuler le lancement | Select active initiative · Keep this selection · Cancel launch |
| Reprise | Reprise du projet · État connu · Résultats et décisions connus · Récapitulatifs disponibles · Travail restant connu | Project resume · Known state · Known results and decisions · Available recaps · Known remaining work |
| Lecture de reprise | Lire les preuves du projet · Lecture locale en cours… · Dernière observation : {date} · Voir la preuve de {item} · Rejoindre l’échange | Read project evidence · Reading local evidence… · Last observation: {date} · View evidence for {item} · Open conversation |
| Limites de reprise | Information non établie · Observation partielle : {reason} · Preuves contradictoires · Observation précédente — nouvelle lecture requise | Information not established · Partial observation: {reason} · Conflicting evidence · Previous observation — read again |
| Sélection de reprise | Aucune initiative choisie · Choisir une initiative · Contexte de consultation modifié — lecture requise | No initiative selected · Choose an initiative · Viewing context changed — read again |
| Reprise sans données | Aucun récapitulatif local retrouvé · Travail restant non établi | No local recap found · Remaining work not established |
| Preuves | Voir la preuve · Actualiser les preuves · Fait observé · Déduction · Proposition · Acceptation humaine attestée | View evidence · Refresh evidence · Observed fact · Inference · Proposal · Attested human acceptance |
| Fraîcheur | Courante · Historique · Périmée · Source absente · Sources contradictoires | Current · Historical · Stale · Source missing · Conflicting sources |
| Changement externe | Fichier modifié hors de Madness — origine inconnue · Examiner la nouvelle révision | File changed outside Madness — origin unknown · Inspect new revision |
| Actualisation groupée | Changements détectés — observation précédente · Actualisation locale en attente · Actualisation locale en cours… · D’autres changements sont en attente | Changes detected — previous observation · Local refresh pending · Refreshing local evidence… · More changes pending |
| Nouvelle observation | Nouvelle observation disponible · Version affichée : {revision} · Afficher la nouvelle observation | New observation available · Displayed version: {revision} · Show new observation |
| Fraîcheur incertaine | Surveillance indisponible — fraîcheur non garantie · Observation ancienne — actualisation échouée : {reason} · Sources modifiées pendant la lecture — nouvelle lecture requise | Monitoring unavailable — freshness not guaranteed · Previous observation — refresh failed: {reason} · Sources changed while reading — read again |
| Recommandation ancienne | Proposition issue d’une observation précédente — contexte à revérifier | Proposal from a previous observation — context must be checked again |
| Fichier | Aperçu · Agrandir · Réduire l’aperçu · Ouvrir dans l’éditeur · Copier le chemin | Preview · Expand · Reduce preview · Open in editor · Copy path |
| Lecture refusée | Accès refusé : {path} · Hors de la portée autorisée · Format d’aperçu non pris en charge · Lecture trop volumineuse — aucune troncature présentée comme complète | Access denied: {path} · Outside authorized scope · Preview format unsupported · Content too large — no truncation presented as complete |
| Éditeur | Demande d’ouverture en cours… · Demande transmise à l’éditeur · Ouverture non confirmée · Demande d’ouverture échouée : {reason} | Requesting that the editor open the file… · Request sent to editor · Opening not confirmed · Editor request failed: {reason} |
| Éditeur absent | Éditeur indisponible — vous pouvez copier le chemin | Editor unavailable — you can copy the path |
| Travail conservé | Revenir au travail · Fermer · Annuler · Réessayer l’enregistrement | Return to work · Close · Cancel · Retry save |
| Attentes accueil | Réponse attendue · Approbation attendue · Relecture proposée · Interruption confirmée · Erreur à examiner · Historique inactif | Response needed · Approval needed · Review proposed · Interruption confirmed · Error to inspect · Inactive history |
| Attente disparue | Cette demande n’est plus active — historique conservé | This request is no longer active — history retained |
| Refus/interruption | Action refusée : {reason} · Opération interrompue · Résultat de l’arrêt inconnu | Action refused: {reason} · Operation interrupted · Stop outcome unknown |
| Sauvegarde | Modifications conservées pour cette session — enregistrement échoué · Envoyé, conservation locale non confirmée | Changes kept for this session — save failed · Sent, local persistence not confirmed |
| Décision active | Autoriser tout le patch une fois · Refuser tout le patch · Envoyer la réponse · Interrompre | Allow entire patch once · Reject entire patch · Send response · Interrupt |
| Fin de tour | Ce tour est terminé · Aucune acceptation humaine attestée | This turn is complete · No attested human acceptance |
| Choix US | US du prochain tour (facultatif) · Choisir une US · Non attribué · Retirer le choix | Next turn’s story (optional) · Choose a story · Unassigned · Clear choice |
| Identité US | US · Identifiant · Occurrence · Rattachement de ce tour · Contexte capturé | Story · Identifier · Occurrence · This turn’s assignment · Captured context |
| Choix US indisponible | Aucun type story qualifié · Type absent ou non qualifié · Cette entrée n’est pas une story · Identifiant ambigu | No qualified story type · Type missing or not qualified · This entry is not a story · Ambiguous identifier |
| Choix US invalidé | Choix périmé : {reason} · Choisir de nouveau · Continuer sans attribution | Choice out of date: {reason} · Choose again · Continue unassigned |
| Lecture des mesures | Voir les mesures de {story} · Détails de mesure de ce tour · Périmètre : {scope} · Tours identifiés : {count} | View measurements for {story} · This turn’s measurement details · Scope: {scope} · Identified turns: {count} |
| Nom et unité | Durée cumulée des tours observés · Durée locale observée · Durée native · Source · Unité | Cumulative duration of observed turns · Observed local duration · Native duration · Source · Unit |
| Durée et couverture | Durée connue : {duration} · Durée inconnue : {reason} · Couverture partielle · {count} tours connus · {count} tours inconnus · Cumul indisponible | Known duration: {duration} · Duration unknown: {reason} · Partial coverage · {count} known turns · {count} unknown turns · Cumulative duration unavailable |
| Chevauchement et conflit | Chevauchement connu · Chevauchement inconnu · Reçus contradictoires · Rattachement contradictoire — non attribué | Known overlap · Overlap unknown · Conflicting receipts · Conflicting assignment — unassigned |
| Disponibilité des mesures | Historique non instrumenté · Aucun tour identifié dans ce périmètre · Usage indisponible — réception non qualifiée · Coût indisponible — aucun montant qualifié | History not instrumented · No identified turns in this scope · Usage unavailable — receipt not qualified · Cost unavailable — no qualified amount |
| Conservation de mesure | Mesure conservée pour cette session — enregistrement non confirmé · Source disparue — reçu historique conservé | Measurement kept for this session — save not confirmed · Source missing — historical receipt retained |

Les messages d’échec précisent toujours ressource, opération et récupération réellement possible ; `{reason}` ne doit pas devenir un code brut seul. L’état « partiel » cite les capacités affectées : l’absence de `bmad-retrospective` n’interdit pas la lecture des trois aides sûres du candidat. Les 27 descripteurs observés et les 43 topics sont une observation de 2.1, aucun quota d’interface. « BMad recommande » exige le reçu de la réponse native liée aux aides effectivement transmises ; une raison absente est inconnue, pas réécrite par l’interface.

## Component Patterns

Les noms correspondent à DESIGN.md · Components. Les composants futurs restent contractuels ; ils n’élargissent pas les profils livrés.

| Composant | Règles de comportement |
|---|---|
| Barre d’action et de titre commune | Une seule commande « Ouvrir un projet », présente sur accueil et projet, dossier SVG avec nom et aide au focus/survol. Bascule sur l’axe du rail et sur la ligne native Windows. Réserver les contrôles natifs ; commandes et modales hors drag. Thème et connexion restent accessibles. |
| Navigation latérale | Réduire/déployer conserve projet, onglet, conversation et saisie. Préférence mémorisée ; échec annoncé sans perdre le choix de session. Rail au-dessus de `{components.navigation.drawerBreakpoint}`, noms et infobulles au focus/survol ; en dessous, tiroir à libellés et retour de focus au déclencheur. |
| Bouton | Action explicite ; indisponibilité expliquée, pas de double lancement. Navigation, ouverture ou fermeture ne vaut jamais accord. Cible `{components.titlebar.target}` au minimum pour les commandes compactes et décisions. |
| Ligne de projet ou d’attente | Ouvre la destination exacte corrélée, y compris autre projet. Raison, portée et possibilité réelle de répondre restent nommées. Une ancienne demande ne redevient pas active. |
| Onglets du projet | Changer de vue conserve saisie, sélection de fichier et contexte sans répondre ni lancer. L’attente reste visible hors Conversation. Parcours, Conversation et Toutes les possibilités désignent leurs panneaux ; sélectionner l’onglet ne qualifie aucune capacité. |
| Sélecteur d’initiative | Liste des initiatives repérées avec nom, chemin, source, révision et repères distincts active/sélection. Choisir ne modifie que la sélection Madness ; active absente ou invalide reste inconnue. Conflit traité au parcours 4, aucune mutation BMad proposée ici. |
| Reprise du projet | Lecture prioritaire dans Parcours, après les attentes/récupérations et avant aides ou préparation Mary/Forge. Compose État connu, Résultats et décisions connus, Récapitulatifs disponibles et Travail restant connu à partir de sources admises, sans synthèse rédactionnelle par IA. Lire les preuves du projet est une lecture locale explicite, sans préflight fournisseur, GET JWKS, OAuth ni appel modèle ; ouvrir Parcours ou restaurer le projet ne déclenche pas cette première lecture. Après une lecture explicite, l’actualisation locale suit le contrat 2.5 ci-dessous, sans appel fournisseur. Situation du projet, activité de l’agent et acceptation humaine restent trois axes distincts ; chaque fait, déduction, proposition ou acceptation cite sa preuve/révision. Les récapitulatifs factuels conservés rejoignent leur échange exact et son initiative capturée. Les détails de preuve 2.4 exposent texte, chemin, source, révision, observation et portée ; ils n’annoncent pas l’aperçu 2.8 disponible. Une recommandation reçue reste une proposition séparée, sans suite imposée. |
| Aides chargées | Dans Parcours, lecture bornée sans modèle ; séparer texte réellement chargé et références seules aux topics/migrations. Couverture exacte, documents refusés, révision et disponibilité du préflight visibles. Préparer la demande ne transmet rien ; Demander à BMad exige sa capacité qualifiée et une nouvelle vérification du contexte. |
| Recommandation | Réponse brute dans la conversation/tour natifs, avec contexte capturé, aides réellement transmises, raisons et alternatives sourcées. Un lien depuis Parcours retrouve cet échange exact ; une alternative ouvre sa Fiche compétence sans lancer. Sans reçu, conserver le problème et le contenu local chargé, sans titre de recommandation réussie. |
| Groupe d’intentions | Futur dépliage de possibilités, sans étape imposée ; ouvrir un groupe ne lance rien. |
| Catalogue des compétences | Inventaire des compétences réellement installées selon racines actives et priorité du nom de dossier ; recherche par intention, agent, nom ou invocation et filtre module. Tous les résultats disponibles restent explorables, sans quota. Métadonnées `bmod-*` exclues ; une déclaration absente est un problème du diagnostic, pas une ligne lançable. Recherche et filtre conservés au retour d’une fiche ; les 27 entrées du [catalogue simulé](mockups/parcours-guide/catalogue.js) restent historiques. |
| Fiche compétence | Afficher objectif, module, source, invocation exacte `$<nom-dossier>`, entrées, conditions, effets et livrables, inconnus nommés. Descriptif, copiable et lançable sont indépendants : l’absence d’invocation sûre interdit Copier ; l’absence de runtime qualifié interdit Lancer sans interdire la lecture. Préparer le lancement présente le contexte/effets capturés ; après fermeture de la fiche, la préparation secondaire dans Conversation attend le clic explicite Lancer une nouvelle conversation. Aucun brouillon existant n’est transmis ou remplacé. |
| Registre des preuves | Fait, déduction, proposition et acceptation restent des axes nommés ; chaque assertion ouvre sources/révisions/observation/portée/fraîcheur. Tickets TOML, feuille optionnelle, plan et tracker restent sourcés séparément, contradictions visibles avant synthèse. Une entrée sans feuille n’est pas absente. Une acceptation exige une décision humaine identifiable portant sur cette révision. Voir les mesures de {story} déplie la consultation passive sourcée définie dans Mesures par US, pour une occurrence explicite. |
| Indicateur d’état | Sépare situation du projet, activité et décision humaine. Transition annoncée sans déplacement de focus ; aucune progression calculée sur les fichiers. Pour les mesures, disponibilité, couverture, résultat du tour et conservation restent des axes distincts ; aucune fin de tour ne rend un cumul complet. |
| Bande de récupération | Un motif principal avec portée projet ou globale et action disponible. Un arrêt inconnu reste durablement visible et bloque les nouveaux échanges concernés. Une inspection nécessaire reste indiquée ; un rappel court mène aux détails sans masquer la garde. |
| Détails de contexte | Consultation à la demande des informations connues, invocations, chemins intégraux et provenance. Cette compacité ne replie pas les effets ou préconditions nécessaires à une autorisation active. Les détails de mesure exposent identité, occurrence, contexte et sources capturés selon Mesures par US, sans réattribution depuis la sélection actuelle. |
| Préparation d’un échange | Présente Mary et Forge avec objectif ; qualification sans modèle, lancement natif et option fichiers séparés. Une nouvelle conversation est explicite ; aucun brouillon transmis au lancement. Forge respecte la recherche native de sessions existantes avant le premier terminal, sans reprise implicite. Le choix US facultatif avant le premier tour suit Mesures par US ; préparer ou lancer une conversation ne choisit aucune story par défaut. |
| Conversation | Affiche échange sélectionné, agent connu ou inconnu, fournisseur, contexte et invocation. Messages progressifs corrélés ; provenance figée par item selon ce qui est attesté. Aucun échange sélectionné : état vide et action de préparation, sans lancement automatique. |
| Portrait d’agent | Correspondance exacte uniquement depuis l’identité attestée de l’item : Mary, John, Sofia, Winston, Sally, Amelia ou Smithy. Identité inconnue reste inconnue ; nom attesté hors casting conservé sans portrait nommé. Ni invocation, recipient, texte reçu ni fichier de skill ne sont une preuve. |
| Fiche agent | Capture message, identité/source, contexte et déclencheur exacts ; rôle descriptif, pas compétence disponible ni activité. Ouverture/fermeture et navigation de signalement restent locales ; aucune invocation ni décision métier. Source/contexte invalidé : fermeture avec motif, sans réaffectation au dernier message. |
| Signalements de la fiche | Pendant la consultation, conserver les attentes/récupérations observées par identifiant, récentes d’abord. Zone visible séparée du rôle, annonce et accès corrélé ; disparition rend l’entrée historique inactive. Chaque nouvel identifiant est annoncé une fois, même si type et projet identiques ; expiration et deltas ne réannoncent pas. |
| Question de l’agent | Demande active corrélée seulement ; brouillon propre à la demande, choix non secrets et envoi explicite. Après expiration, passage à un état terminal ou restauration : texte conservé et inactif, sans action de réponse. |
| Champ de réponse | Brouillon libre distinct des réponses aux questions ; sauvegarder et envoyer restent séparés. Refuser texte vide et double envoi ; transmettre la copie capturée au clic à la bonne session. « Envoyé » exige le reçu fiable ; échec de conservation signalé sans succès durable inventé. Avant chaque nouveau tour libre, choix US explicite ou Non attribué ; une réponse à une question conserve le tour capturé, selon Mesures par US. |
| Proposition d’approbation | Lecture seule par défaut, mode fichiers opt-in. Présenter opération, portée intégrale, préconditions et patch complet avant autoriser/refuser. Accord ponctuel pour l’opération exacte ; navigation et fermeture ne l’accordent pas. Ajustement dans un nouveau tour, sans rejeu. |
| Récapitulatif de tour | Projection factuelle des résultats, décisions humaines identifiables, chemins et prochaine action lorsqu’ils sont connus ; conserver les inconnus. Fin de tour, clôture du workflow et validation du livrable restent indépendantes. Détails de mesure de ce tour expose le rattachement capturé et la durée avec sa preuve ; consulter ne lance ni collecte ni nouveau tour. |
| Connexion Codex | Panneau non modal au clavier/pointeur, titre focalisé et fermeture rendant le focus au logo. OAuth dans le navigateur Windows, forfait annoncé et témoin explicite. Compte enregistré à vérifier, succès daté et borné ; Vérifier, Reconnecter et Déconnecter restent distincts. |
| Panneau de fichiers | Ouvre le fichier exact de la preuve/résultat, avec projet, initiative capturée, statut sourcé, chemin et révision. Lecture seule de contenu non fiable, aucun script, lien actif ou commande du document exécuté. Agrandir conserve sélection et position ; ouverture éditeur demande une intégration qualifiée, chemin contrôlé et retour réel selon parcours 6. |
| Diagnostic et initialisation | Distinguer absent, ancien observé, inconnu, partiel, candidat observé, incompatible, invalidé et erreur selon G2. Montrer capacités indépendantes, sources/racines ordonnées et motif de refus ; version v7 seule insuffisante. Actualiser ne répare pas. L’initialisation reste epic 3, avec changements exacts et accord avant écriture ; installation seule ne signifie pas produit cadré. |
| Dialogue | Décision unique, fermeture visible et Échap ; focus maintenu dans le dialogue, puis rendu au déclencheur à la fermeture. Fermer n’accepte rien ; aucun empilement de confirmations. |
| Notification | Retour bref annoncé poliment ; attente, erreur durable et décision restent dans leur surface. Les Signalements de la fiche gardent une région visible persistante et des destinations indépendantes de l’annonce live. |

### Consultation locale d’un agent

La fiche s’ouvre depuis le message attesté reconnu, jamais depuis un catalogue de portraits. Nom, rôle statique, spécialité, source d’identité et identifiant du message sont consultables ; aucune disponibilité n’est déduite du casting. Un changement de projet, d’onglet, d’échange sélectionné ou de preuve d’identité ferme la consultation devenue invalide avec un motif, sans la déplacer vers un autre auteur.

Une seule surface informative de contexte est visible à droite. Ouvrir la fiche masque localement Connexion/Contexte sans appeler leur annulation ; une autorisation ou vérification en cours conserve son état. Ouvrir Connexion/Contexte ferme localement la fiche. Échap ferme seulement la surface la plus haute et ne se propage pas vers une annulation de connexion, un refus ou un arrêt. Les Dialogues natifs de navigation et de rappel du forfait gardent leur priorité ; le changement de disposition de la fiche attend leur fermeture au lieu de les rouvrir ou de leur retirer le focus.

À partir de {components.agent.dockBreakpoint}, la fiche est une région dockée non modale ; en dessous, un Dialogue modal. La transition conserve consultation et défilement du corps. À l’ouverture, focus sur son titre ; à la fermeture, retour au déclencheur exact encore présent, sinon au titre neutre de Conversation ou du projet, jamais sur Autoriser.

Une arrivée de question, approbation ou récupération ne change ni l’auteur consulté ni le focus. La zone Signalements reste visible au-dessus du corps de rôle défilant. Son annonce polie et atomique porte un numéro de signalement croissant, distinguant deux arrivées de même type/projet ; elle ne dépend pas des deltas. La liste conserve séparément les destinations exactes. Rejoindre cette demande ou Voir cette récupération ferme seulement la fiche et navigue vers la cible capturée. Une demande disparue devient Cette demande n’est plus active — historique conservé ; Voir cet historique retrouve cette cible, sans substitution ni réponse automatique. Cette persistance dure pendant la consultation ; aucun stockage métier de la fiche ou de ses annonces n’est ajouté.

### Connexion personnelle et aide réseau

Connexion personnelle : l’autorisation navigateur est annulable et bornée à dix minutes. Le rappel « Vous utilisez votre forfait ChatGPT » est acquittable et son acquittement conservé ; Échap/Fermer fonctionnent même si son enregistrement échoue. « Gérer l’usage dans ChatGPT » ouvre les paramètres officiels, sans quota inventé. Déconnecter retire les accès locaux sans modifier projets ou brouillons et sans prétendre révoquer un consentement distant.

L’aide réseau affiche uniquement l’adresse publique `https://auth.openai.com/.well-known/jwks.json`, avec Ouvrir, Copier et contrôle d’accès explicite par GET seul. Copier n’annonce un succès qu’après réussite ; ouverture et copie ne lancent ni vérification du forfait ni modèle. Le clic Zscaler déjà connu n’est pas une nouvelle connexion OpenAI : un nouveau refus mesuré peut nécessiter un nouvel acquittement, sans redemander si la page est un JSON ni inventer sa durée de validité. Un contrôle réseau réussi n’envoie aucun message, accord ou tour.

## State Patterns

« Connu » repose sur une observation sourcée ; « déduit » reste une interprétation ; « proposé » attend discussion ; « validé » exige une décision humaine identifiable. Ces axes ne fusionnent pas à la fin d’une exécution.

| Surface / état | Traitement et récupération |
|---|---|
| Accueil vide / sans attente | Expliquer l’absence ; pointer la commande unique d’ouverture. L’absence d’attente ne signifie pas que tous les livrables sont validés. |
| Chargement local / accès refusé | Montrer ce qui est en cours ou la ressource inaccessible ; conserver le contexte sans succès provisoire. Diagnostic ou autre dossier selon la capacité réelle. |
| BMad absent / incompatible / inconnu / partiel | Limite par capacité et source ; pas de migration ou initialisation implicite. Ancien format observé et version non éprouvée restent distincts. Partiel peut garder l’aide lisible et la copie sûre ; aucune compatibilité générale déduite. |
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
| Recherche vide / inventaire refusé | Zéro correspondance conserve recherche et filtres, propose Effacer les filtres ; zéro compétence constatée et inventaire impossible ont des messages distincts. Un inventaire ancien reste historique, jamais compté comme courant. |
| Modification externe / reçu invalidé | Ajouter, supprimer, remplacer ou modifier invalide les preuves touchées même sans changement d’horloge ; afficher la nouvelle révision après lecture sûre, sans auteur/session/acceptation inventés. Une opération dont le contexte, les aides ou les conditions ont changé est refusée avant effet et doit être préparée de nouveau. |
| Aide lisible / recommandation indisponible | Contenu chargé consultable avec couverture partielle ; demander l’agent reste indisponible avec motif jusqu’à qualification du profil/capacité. Références seules ne sont ni chargées ni transmises implicitement. |
| Recommandation en cours / refusée / interrompue | L’attente est dans l’échange corrélé si l’envoi est attesté ; avant reçu, ne pas affirmer qu’un agent travaille. Refus conserve aide et préparation ; après envoi incertain, aucun retry de message automatique. Interruption et réouverture suivent les gardes du dialogue livré. |
| Fiche périmée / condition manquante | Texte antérieur marqué historique, motif près du lancement ; lecture/copie seulement si leurs données restent sûres. Actualiser la fiche puis préparer de nouveau, sans reprendre une ancienne autorisation. |
| Sélection conflictuelle / disparue | Conserver la sélection connue et le contexte des échanges, nommer le désaccord. Initiative requise : lancement bloqué ; sans initiative requise : conditions propres. Aucune sélection silencieuse de la première entrée. |
| Reprise non lue / ancienne / en lecture | Sans observation, nommer le manque et proposer Lire les preuves du projet. Une observation conservée affiche sa date/révision et son caractère ancien ; aucune fraîcheur continue promise avant 2.5. La lecture explicite annonce début/fin une fois, garde le focus et l’ancien résultat identifié ; refus ou interruption ne le transforme pas en succès courant. |
| Reprise partielle / contradictoire / sans reste établi | Afficher les faits lisibles et la couverture refusée ou manquante. Les assertions opposées gardent chacune source/révision et leur divergence visible ; aucune priorité silencieuse au fichier le plus récent. Fichier absent, statut absent, plan built ou fin de tour ne créent ni acceptation humaine, ni tâche terminée ou restante. Une entrée TOML sans feuille reste une entrée ; inconnu ne signifie ni zéro ni terminé. |
| Reprise sans sélection / sélection modifiée | Sans sélection valide, nommer le projet et proposer Choisir une initiative, sans choisir l’active ni la première. Les récapitulatifs de projet restent accessibles avec leur contexte capturé. Changer de sélection invalide la projection étrangère pour la consultation ; les retours tardifs restent attachés à leur ancien contexte, sans réattribuer échanges, décisions ou résultats ni perdre la saisie. |
| Preuve manquante / contradictoire | Absence, refus et divergence sont visibles avec chacune des sources connues ; statut inconnu conservé. Une feuille manquante ne supprime pas une entrée TOML, ni l’inverse. |
| Aperçu en lecture / refusé / périmé | En-tête exact visible pendant lecture ; aucun contenu ancien sous un titre de nouvelle révision. Accès refusé, hors portée, lien/type refusé, format inconnu ou taille excessive expliqués sans exécuter ni tronquer silencieusement. Après mutation, ancien contenu marqué périmé ; Examiner la nouvelle révision déclenche la lecture sûre. |
| Éditeur en attente / échec / inconnu | Demande liée au chemin/révision contrôlés, pas à la sélection future. Retour disponible précis ; demande transmise ne prouve ni fenêtre visible ni lecture humaine. Échec connu permet une nouvelle demande explicite ; résultat inconnu n’est pas rejoué automatiquement. Copier le chemin sûr reste indépendant. |
| Destination d’attente disparue | Ouvrir son historique exact, inactif, avec motif ; si la ressource est inaccessible, afficher ce refus sur la destination demandée. Ne pas rediriger vers une demande plus récente ni rendre répondable l’ancienne. |
| Fiche ouverte / source invalidée | Consultation liée à son item exact ; contexte ou identité/source non retrouvé ferme avec motif. Un historique sans projection ne récupère aucun visage nommé. |
| Attente reçue pendant la fiche | Signalement visible avant le rôle, annonce distincte par nouvel identifiant et navigation explicite ; focus conservé à l’arrivée, historique exact après expiration. |
| Focus / superposition | Ordre de lecture cohérent, focus visible, fermeture accessible et retour au déclencheur. |

<a id="epic2-metrics"></a>

### Mesures par US — 2.12

Ce contrat est prospectif ; [D1–D6](../tickets/epic-projets-bmad/qualification-mesures-us/decisions-et-donnees.md) gouvernent les consommateurs 2.11/2.13/2.14. Les chiffres ci-dessous sont des exemples de conception, jamais des reçus natifs. Il prolonge les parcours 2/3/5 sans modifier le corps des sept parcours ni le supplément Graphe. Visuel : [DESIGN · Mesures](DESIGN.md#epic2-metrics-layout).

<a id="epic2-metrics-choice"></a>

#### Choisir avant le tour (M1/M2).

US du prochain tour (facultatif) réemploie les contrôles de choix nommés existants. Sam choisit une seule story qualifiée, ou laisse Non attribué. Aucun choix automatique depuis l’US active, le titre, la première ligne ou un tour précédent ; chaque nouveau tour demande son propre choix volontaire s’il doit être attribué. Retirer le choix rétablit Non attribué sans toucher au brouillon. Cette option ne crée aucun prérequis supplémentaire au dialogue : Continuer sans attribution reste possible si les gardes du dialogue l’autorisent.

Une entrée story sans feuille est admissible lorsque sa source de type est qualifiée par 2.11. Type absent/inconnu, spike, simple fichier @file et identifiant dupliqué restent non admissibles avec motif près du choix ; aucune heuristique de titre ou substitution ne les qualifie. La ligne choisie montre titre, identifiant, initiative et occurrence ; Détails de contexte expose projet, chemin/racine physique, initiative/chemin, conteneur relatif, id normalisé, occurrence, preuve de type, révisions et sources/empreintes. Ces données complètent le ContextRef complet capturé pour l’échange et le tour.

Avant l’effet, un changement de contexte ou de preuve invalide le choix avec motif ; le brouillon reste intact et Choisir de nouveau ou Continuer sans attribution sont explicites. Avant l’ACK, le rattachement de ce tour est capturé ; après l’ACK il est immuable, même si Sam choisit une autre US pour le prochain tour, navigue ou reçoit un résultat tardif. Une question native et sa réponse appartiennent au tour déjà capturé ; elles ne présentent pas un nouveau choix. Renommer un titre conserve la référence si la même occurrence est prouvée. Déplacement, suppression/réapparition ou réemploi détecté donnent une occurrence séparée ; un réemploi silencieux sans discontinuité observée peut rester indétectable, sans continuité inventée. Aucun rattachement rétroactif d’historique.

<a id="epic2-metrics-read"></a>

#### Lire le connu et ses limites (M3/M4).

Dans Parcours, Voir les mesures de {story} déplie le Registre des preuves pour l’occurrence demandée ; dans Conversation, Détails de mesure de ce tour ouvre les mêmes lignes dans le Récapitulatif de tour. L’en-tête nomme US/occurrence, projet/racine, initiative et périmètre. Le cumul porte le nom Durée cumulée des tours observés, l’unité, les nombres de tours identifiés/connus/inconnus et la couverture. Les détails de chaque tour exposent identité corrélée, bornes, domaine d’horloge, provenance/révision et conservation ; le résultat fonctionnel se lit séparément. Un tour non attribué reste consultable sous son propre contexte, sans entrer dans le cumul de la story actuellement consultée.

La durée locale va de l’acceptation ACK au terminal corrélé reçu, ou à l’arrêt confirmé avec instant prouvé, dans le même domaine monotone. Elle inclut outils, attente réseau et attente humaine ; préparation, drain et sauvegarde après terminal sont exclus. Ce cumul ne mesure ni effort humain, ni temps CPU, ni durée de réalisation de l’US ou occupation calendaire. Une éventuelle Durée native est séparée, avec source/unité/sémantique propres, et reste indisponible jusqu’à qualification ; elle ne complète pas une borne locale manquante.

Exemple prospectif M3 : ACK à 1 000 ms et terminal à 601 000 ms donnent 10 min, attente comprise ; un ACK et un terminal au même instant prouvés donnent un vrai zéro connu, affiché avec unité et couverture. Une durée inconnue porte son motif et n’utilise ni 0 ni tiret ambigu. Failed/interrupted peut fermer un intervalle prouvé tout en gardant le résultat Échec/Interruption ; la durée ne prouve aucune réussite ou acceptation humaine.

Crash, clic Arrêter sans confirmation, statut stopped sans instant prouvé, ACK/terminal absent, borne non durable, horloge différente ou ordre invalide laissent la durée inconnue. Timeout, date de fichier/question, date murale native ou réouverture ne créent aucune borne. Exemple prospectif M4 : un tour clos de 10 min et deux inconnus donnent 10 min connues, Couverture partielle, 1 tour connu et 2 tours inconnus. Tous inconnus : Cumul indisponible avec leur nombre ; aucun tour identifié : absence nommée, aucun zéro fabriqué. La couverture porte seulement sur les tours identifiés dans le périmètre, sans promesse de découvrir toute l’activité historique.

<a id="epic2-metrics-total"></a>

#### Cumuler sans réaffecter (M5).

Une identité stable comprend session/exécution du connecteur, fournisseur/connexion, thread/tour et conversation locale capturée. Un doublon identique compte une fois. Même identité avec charge différente : Reçus contradictoires, détails des preuves et intervalle non promu en durée close ; aucun premier reçu arbitraire. Une attribution d’US contradictoire reste non attribuée avec motif et ne rejoint aucun cumul d’US. Exemple prospectif : deux tours parallèles clos de 10 min donnent 20 min cumulées, Chevauchement connu seulement si leurs preuves permettent la comparaison ; domaines d’horloge différents : Chevauchement inconnu, même si chaque durée est connue. La répartition par conversation garde son propre périmètre, sans transformer le cumul en calendrier.

<a id="epic2-metrics-availability"></a>

#### Disponibilité et conservation (M6/M7).

Ancien historique : Historique non instrumenté, durée inconnue ; aucun recalcul depuis Snapshot v1 ou synthèse d’historiques. Un schéma CLI atteste une déclaration, pas une mesure reçue. Usage indisponible — réception non qualifiée et Coût indisponible — aucun montant qualifié restent visibles et sourcés séparément de la durée. Agrégat de compte, tokens déclarés ou prix d’abonnement/API ne sont jamais répartis entre US ni convertis en montant. Cette consultation ne qualifie aucune réception native d’usage/coût.

Hors ligne ou après réouverture, seuls les futurs reçus réellement durables sont relus passivement avec identité historique exacte ; aucun modèle, compte, collecte, réseau ou rejeu n’est déclenché. Si l’enregistrement échoue, Mesure conservée pour cette session — enregistrement non confirmé indique que le reçu/les bornes ne sont pas durables ; après réouverture leur durée close n’est pas promise. Réessayer l’enregistrement retente uniquement la sauvegarde. Source disparue : conserver le reçu historique déjà durable et ses sources capturées, signaler la disparition sans rattacher le reçu à une entrée homonyme ni présenter la source capturée comme actuelle. Revenir au travail rend la saisie et le contexte d’origine selon les sorties communes.

<a id="epic2-metrics-access"></a>

#### Accès et retour (M8).

Choix nommé, état sélectionné et motif sont accessibles sans survol ni couleur seuls. Les contrôles de choix gardent leur clavier natif : Tab entre groupes, flèches dans un groupe radio ; sélectionner ne lance rien. Déplier les détails nommés conserve le focus au déclencheur ; refermer le retrouve. Une arrivée de mesure ne déplace ni focus ni défilement. Si une action volontaire retire le déclencheur effectivement focalisé, repli sur le titre neutre de la préparation, du récapitulatif ou du registre d’origine, jamais Envoyer/Autoriser. Les annonces polies portent uniquement sur choix invalidé, issue de tour et échec de conservation, sans timer à chaque seconde. Thèmes, FR/EN, noms longs, 720 px, zoom 200 % et mouvement réduit conservent contexte, saisie, motif, fermeture et actions ; les unités se localisent sans changer la valeur. Ces exigences restent à vérifier dans l’interface intégrée, sans conformité WCAG acquise.

<a id="epic2-metrics-sam"></a>

#### Sam — rattacher puis comprendre ses mesures (extension des parcours 2/3/5).

1. Avant de demander l’aide du parcours 2, de lancer une action qualifiée du parcours 3 ou d’envoyer un nouveau tour libre, Sam choisit explicitement une story qualifiée dans la préparation, ou garde Non attribué. Il lit l’occurrence et le contexte sans quitter sa rédaction.
2. Le contrôle au point d’effet conserve ce rattachement avant ACK. Sam répond à une question du même tour ; l’attente fait partie de sa durée, sans nouveau choix d’US.
3. Dans le parcours 5, il ouvre Voir les mesures de {story} puis les détails d’un tour. Il distingue cumul connu, couverture partielle et inconnus, résultat du tour et coût indisponible ; les exemples chiffrés restent prospectifs.
4. Après navigation ou réouverture passive, il retrouve l’identité capturée du reçu durable ; fermer les détails rend son travail exact, sans changer le rattachement historique.
5. **Moment décisif :** Sam sait à quelle occurrence les tours appartiennent, ce que leur cumul mesure et ce qui manque ; il ne prend ni durée pour effort/réussite, ni indisponibilité pour zéro.

**Échec et récupération :** type ou identité non qualifiés → motif et tour non attribué possible ; preuve changée → rechoix volontaire sans perdre le brouillon ; crash/borne manquante/conflit → durée inconnue avec couverture explicite ; sauvegarde refusée → copie de session et réessai de sauvegarde seul. Une garde du dialogue reste prioritaire, sans nouvel envoi ni réattribution automatique.

<a id="epic2-refresh"></a>

### Actualisation locale des preuves — 2.5

La fraîcheur et l’activité de lecture sont deux informations distinctes. Dès qu’un changement ou une perte de surveillance est détecté, l’observation touchée devient ancienne ou incertaine ; cette mention, sa date et sa révision restent visibles pendant l’attente, la lecture, l’erreur et la disponibilité d’une nouvelle observation. Une notification de fichier, un contrôle périodique sans changement constaté ou une navigation ne prouvent jamais que le contenu est courant. Seule une lecture sûre du bon contexte, encore valide à sa publication, établit une observation datée dans sa portée ; elle ne garantit pas l’absence de modification ultérieure.

| Situation | Comportement |
|---|---|
| Rafale de modifications, suppressions ou remplacements | Invalider immédiatement les données concernées puis regrouper les événements. Montrer une seule actualisation locale en attente/en cours ; un événement supplémentaire pendant la lecture garde une suite en attente, sans collecte concurrente ni annonce par fichier. Les événements n’établissent aucun auteur ni session d’origine. |
| Ressources locales occupées / arrêt non confirmé | Conserver l’ancien résultat et le motif d’attente ; ne pas concurrencer l’opération qui possède les outils. La garde globale et la récupération restent applicables, même après navigation. |
| Lecture en arrière-plan | Laisser lire, saisir, sélectionner du texte, naviguer et consulter l’historique. Garder l’observation précédente identifiée, sans écran bloquant, pourcentage, durée promise ni effacement du brouillon. Annoncer début, issue et nouvelle observation une fois par lot. |
| Nouvelle révision dans le même projet/racine/initiative | Garder la version affichée, ses détails ouverts et leurs positions ; annoncer Nouvelle observation disponible avec les révisions affichée et disponible distinctes. Afficher la nouvelle observation bascule volontairement tout le résumé vers cette observation, après vérification qu’elle est encore valable ; ne jamais placer les anciens octets sous ses métadonnées. Les détails de l’ancienne version peuvent alors se refermer, le focus reste sur la commande et la position de lecture n’est pas déplacée automatiquement. Une révision identique conserve les détails. |
| Source supprimée, remplacée ou mutation pendant lecture | Garder l’ancienne preuve lisible et historique, y compris son texte déjà capturé ; rendre l’absence ou le refus explicite dans la nouvelle observation. Une lecture devenue incertaine ne s’annonce pas courante : une suite groupée peut relire, sans boucle immédiate infinie ; en cas d’échec persistant, proposer Actualiser les preuves. |
| Autre projet, racine remplacée ou initiative choisie différente | Invalider la consultation étrangère et nommer le nouveau contexte. Ne pas transporter ses détails ouverts ; un retour tardif reste attaché à son contexte capturé et ne remplace pas la destination actuelle. Conserver échanges, brouillons et choix locaux existants. |
| Surveillance indisponible ou événements perdus | Afficher la limite durable et une lecture locale explicite disponible selon les gardes. Un éventuel contrôle de récupération peut détecter le doute, jamais rétablir seul un état courant ; une collecte sûre est nécessaire. Une erreur ne transforme ni l’ancien résultat ni une liste vide en succès. |
| Fermeture, interruption ou réouverture | Terminer/arrêter seulement les ressources possédées selon les gardes existantes. Au retour, observation datée ancienne, demandes historiques inactives ; aucune collecte par moteur/helper ni appel fournisseur automatiquement repris. La première lecture est volontaire. |

La bascule volontaire remplace pour 2.5 la fermeture automatique des détails à chaque révision observée dans 2.4. Pendant une arrivée asynchrone, focus et défilement restent où Sam travaille, y compris dans Conversation ou un autre projet. Si une action volontaire retire réellement l’élément focalisé dans la preuve active, choisir le titre neutre de son registre et l’annoncer ; ce repli ne s’applique jamais à un ancien focus mémorisé après départ de la preuve.

Aides, fiches et recommandations anciennes gardent leur contexte/révision et un libellé historique proche de leur accès. Le lien vers la réponse native originale reste consultable ; actualiser les preuves ne régénère pas la recommandation et ne réécrit pas la conversation. Avant une action, le contrôle des préconditions porte sur les octets et le contexte requis au point d’effet ; s’ils ont changé ou restent incertains, refuser avant effet et préparer de nouveau. Afficher la nouvelle observation, lire un détail ou terminer un tour ne transfère aucune acceptation humaine.

<a id="epic2-conservation"></a>

### Conservation et sorties communes

Ces règles s’appliquent à chaque destination de l’IA et aux sept parcours. Pendant une lecture locale, afficher ressource et état ; garder le dernier résultat comme historique si nécessaire, sans succès provisoire. Annuler une lecture ignore ses résultats tardifs pour la sélection courante, sans effacer une réponse native déjà reçue. Les refus et interruptions restent dans leur surface avec Revenir au travail ; les causes durables restent visibles après disparition d’une Notification. Hors ligne, lecture locale admise et historique restent consultables ; toute capacité exigeant Codex annonce sa propre indisponibilité, sans contrôle réseau automatique.

Les brouillons libres, réponses aux demandes et entrées de préparation restent séparés et attachés à leur identité capturée. Navigation, refus, rafraîchissement et fermeture d’un Dialogue ne les effacent pas. Une erreur d’enregistrement conserve la copie en session, signale que la réouverture n’est pas garantie et propose Réessayer l’enregistrement : cette action ne renvoie aucun message, commande, accord ou demande éditeur. Un reçu natif déjà obtenu reste distingué de son échec de conservation. Avant fermeture, aucune donnée non confirmée n’est annoncée comme durable ; les règles de fermeture livrées s’appliquent.

| Destination touchée par l’échec de sauvegarde | Travail maintenu et retour |
|---|---|
| Accueil / projet / onglets | Projet, destination, sélection et positions courantes restent en session ; l’ancien état durable n’est pas annoncé mis à jour. Revenir au travail retrouve le brouillon exact. |
| Sélecteur d’initiative | Choix local de session conservé et marqué non enregistré ; configuration BMad inchangée. Rouvrir le sélecteur montre ce choix, sans réattribuer les anciens échanges. |
| Aides / Catalogue / Fiche compétence | Aides lues, recherche, filtres, fiche et entrées de préparation conservés en session ; aucune commande déclenchée pour réessayer la sauvegarde. |
| Conversation / Recommandation | Dernier reçu et contenu reçu conservés en session, conservation locale non confirmée explicite ; brouillon indépendant, aucun rejeu. |
| Mesures par US / Récapitulatif de tour | Rattachement et reçu capturés restent en session avec bornes non durables identifiées ; réessai de sauvegarde seul, aucune durée close durable promise. |
| Registre des preuves / Panneau de fichiers | Sélection, ancien aperçu identifié et position conservés ; l’observation récente non enregistrée reste telle. Fermer l’aperçu rend le travail d’origine ; pas de fausse preuve durable. |

## Interaction Primitives

- Activer au clic ou au clavier ; navigation, dépliage et lecture ne lancent aucun fournisseur et n’accordent aucune opération.
- Garder les brouillons, contexte et historique lors du changement de projet, d’onglet, de thème, de largeur ou de navigation. Un changement de projet ne réattribue pas la session capturée.
- Infobulle : même aide au survol/focus, hors rognage, nom accessible indépendant ; Échap la ferme selon la surface active. Une info nécessaire à décider reste visible sans survol.
- Copie : annoncer la réussite réelle ; sinon texte sélectionnable et erreur locale. Aucun token, cookie, donnée de compte ou callback d’autorisation exposé.
- Après envoi, expiration ou retrait d’une demande, conserver le focus sur la surface de travail appropriée ; s’il faut le rétablir, choisir un repère neutre, jamais Autoriser par défaut.
- Interruption : seulement les ressources possédées ; résultat confirmé ou inconnu explicite. Toute nouvelle tentative ou conversation est volontaire et ne rejoue aucun effet incertain.

<a id="epic2-focus"></a>

### Clavier et retour de focus

Tab et Maj+Tab suivent l’ordre visuel. Entrée/Espace activent les boutons ; la saisie de recherche reste du texte, sans raccourci global à une lettre. Onglets : flèches gauche/droite, Début/Fin déplacent le focus ; Entrée/Espace sélectionnent le panneau, sans lancement. Chaque résultat du catalogue et chaque preuve possède un lien ou bouton nommé ; pas de ligne entière lançant un effet sensible. Les listes d’initiatives exposent choix et sélection aux aides techniques.

| Transition | Destination du focus et retour |
|---|---|
| Ouvrir un projet | Après choix et lecture, titre du projet ; annulation du sélecteur Windows rend le focus au dossier. Échec focalise son titre/motif, avec accès au travail précédent. |
| Que faire ensuite ? / Voir les aides | Titre Aides chargées, puis sources et préparation ; fermer les détails rend le focus au lien exact. Les mises à jour n’arrachent pas le focus de la saisie. |
| Demander à BMad / Lancer une nouvelle conversation | Après envoi admis, titre de l’échange capturé dans Conversation ; demande active ensuite atteignable, jamais Autoriser par défaut. Refus avant envoi rend le focus au motif de la préparation. |
| Ouvrir / fermer Fiche agent | Titre de fiche, puis rôle et signalements ; Tab libre en docké, contenu dans le Dialogue en mode modal. Fermer/Échap retrouve le bouton exact ou le titre neutre si absent. Le reflow attend une modale prioritaire. |
| Signalement de fiche → demande / récupération | Navigation volontaire vers la cible capturée, titre corrélé ou historique inactif ; aucune réponse, décision, annulation ou interruption transmise, aucun focus initial sur Autoriser. |
| Ouvrir / fermer Fiche compétence | Titre du Dialogue, piège de focus ; fermeture ou Échap rend le focus au résultat/alternative exact. Si disparu après actualisation, titre des résultats avec annonce, pas premier Lancer. |
| Ouvrir / fermer Sélecteur d’initiative | Choix courant, sinon titre ; conflit remplace le contenu du même Dialogue, sans empilement. Annuler ou choisir rend le focus à la commande de l’en-tête. |
| Reprise → preuve textuelle / échange conservé | Déplier la preuve nommée dans le flux, sans déplacement imposé du focus ; refermer retrouve son déclencheur. Rejoindre l’échange utilise son identifiant et contexte capturés ; revenir conserve projet, sélection, position et brouillon. Si une action volontaire retire la preuve actuellement focalisée dans le panneau actif, titre du Registre des preuves avec annonce ; aucune arrivée asynchrone ne récupère un ancien focus quitté. |
| Choix US / détails de mesure | Contrôle de choix dans le flux, sans déplacement vers Envoyer ; détails au déclencheur nommé. Fermeture ou repli neutre selon Mesures par US ; aucune arrivée asynchrone ne reprend le focus. |
| Preuve → fichier / agrandissement | Titre du Panneau de fichiers ; en panneau latéral non modal, Tab permet le retour au centre. Superposition et agrandissement : Dialogue modal, fermeture à sa commande d’origine ; si disparue, titre du Registre des preuves ou du résultat. |
| Ouvrir dans l’éditeur | Le retour de la commande ne force pas le premier plan Windows. Au retour volontaire dans Madness, focus et brouillon d’origine conservés ; erreur annoncée près du bouton. |
| Accueil → attente / retour | Titre de la destination exacte puis demande corrélée atteignable. Revenir au travail restaure projet, onglet, conversation et point de saisie mémorisés avant consultation ; si supprimés, motif et destination de projet, aucune réattribution. |

Échap ferme d’abord la surface modale active, puis un panneau superposé ou les détails ouverts ; il ne transmet ni refus d’une demande native, ni interruption. Actualiser ne déplace pas le focus à sa fin ; s’il est encore sur la commande, il y reste. La suppression de l’élément effectivement focalisé dans la surface active rend le focus au titre de sa liste ; un ancien repère mémorisé ne suffit pas. Changer de projet ou de langue nomme la nouvelle destination sans déplacer une réponse en cours. Une arrivée asynchrone dans un ancien projet actualise ses données corrélées et son attente ; elle ne bascule pas la vue actuelle.

Fermer Madness termine les sauvegardes admises et les mutations du coffre, refuse de nouvelles commandes et arrête ses ressources possédées ; un arrêt non confirmé reste inconnu. Échap respecte d’abord la surface modale active.

Les délais et réponses du [script du prototype](mockups/parcours-guide/app.js) restent simulés ; ils ne définissent pas les performances du connecteur.

## Accessibility Floor

[ASSUMPTION A1] Viser WCAG 2.2 AA pour la surface web ; aucun audit de conformité n’est acquis. Contrastes et focus visuels : DESIGN.md.

- Actions au clavier, ordre de focus conforme à la lecture, rôles et états des onglets, navigation, tiroir et demandes exposés.
- Icônes 19 px et cibles d’au moins `{components.titlebar.target}` ; texte conservé pour décisions de question, patch et récupération. Nom, aide au focus et portée textuelle ne dépendent pas de la couleur.
- Transitions, reçus et notifications annoncés par statut ; ne pas transformer chaque delta en alerte. Chaque nouveau signalement de fiche a une annonce distincte par identifiant et une liste visible séparée ; les contrôles de mutations DOM ne certifient pas une restitution sonore par lecteur d’écran.
- Portrait et décors redondants restent hors de l’arbre d’accessibilité ; les boutons conservent leur nom, cible de 40 px et focus visible au-dessus du cadre sans remplissage central.
- Zoom, texte agrandi, chemins et noms longs préservent lecture, commandes et saisie. Aucun débordement de fenêtre nécessaire pour répondre.
- Mouvement réduit : dossier statique, aucune animation pulsante ni défilement imposé. Vérifier clavier, lecteur d’écran, focus et deux thèmes dans l’application intégrée ; les anciennes vérifications ne valent pas audit de la refonte.

Pour les consommateurs de l’epic 2, vérifier les sept parcours au clavier, au zoom 200 %, avec agrandissement du texte et mise à l’échelle Windows. Noms longs FR/EN, chemin complet, motif de refus et actions se replient ; aucun contrôle ne disparaît sous un pied fixe. Seuls code et patch peuvent défiler horizontalement dans leur région nommée ; le reste reste lisible sans défilement horizontal de la fenêtre. Les états de chargement annoncent début/fin une fois, le nombre de résultats après mise à jour et la fraîcheur modifiée sans lire chaque delta. Les mêmes noms, rôles, ordre et gardes s’appliquent dans les deux thèmes.

## Key Flows

Sam reste le protagoniste de conception des trois [parcours initiaux](.working/parcours-proposes.md), développeur qui découvre BMad ; aucune persona validée par recherche utilisateur n’est ajoutée. Les sept parcours ci-dessous fixent les choix de l’epic 2 ; leur qualification intégrée reste à produire. Les règles de Conservation et sorties communes, de clavier et de Responsive & Platform s’appliquent à chacun.

<a id="epic2-p1"></a>

### 1. Ouvrir et diagnostiquer un projet

1. Sam retrouve ses récents ou choisit Ouvrir un projet ; annuler conserve sa destination et son brouillon. Ouvrir un récent n’initialise rien.
2. Pendant la lecture, le dossier visé est nommé. Après résolution sûre, Parcours identifie le projet et l’initiative connue ; Voir le diagnostic expose version exacte, racines, révision, capacités, couverture et refus.
3. Il distingue absence, ancien observé, inconnu, partiel et incompatible. Le candidat 2.1 peut montrer `bmad-retrospective` absente tout en gardant les aides sûres lisibles ; le seul numéro v7 ne rend rien lançable.
4. Il consulte les sources puis ferme le diagnostic ; retour au déclencheur dans le projet. Actualiser le diagnostic relit les données utiles, sans installation, réparation, migration ni appel de modèle.
5. **Moment décisif :** Sam sait ce qu’il peut lire, copier ou demander avec ce profil, ce qui manque et pourquoi ; il retrouve son travail sans configuration modifiée.

**Échec et récupération :** accès refusé ou lecture interrompue → erreur sur le dossier demandé, ancien travail intact et Revenir au travail ; version inconnue/configuration invalide/frontière refusée → motif et capacités touchées, sans repli masquant l’erreur. Diagnostic périmé → lecture ciblée requise avant action. Échec de conservation → résultat de session nommé, pas de diagnostic durable inventé. Compte illisible reste une erreur distincte, sans remise à zéro.

<a id="epic2-p2"></a>

### 2. Obtenir une prochaine action avec l’aide BMad du projet

1. Dans Parcours, Sam choisit Que faire ensuite ? ; Aides chargées s’ouvre et lit les aides admises sans fournisseur. Modules couverts, texte réellement chargé, problèmes et références seules sont distincts.
2. Il ouvre une source puis revient au même bloc ; il peut consulter le catalogue sans demander d’agent. Il voit la préparation : projet, sélection/active, contexte et révision, invocation exacte `$bmad`, aides à transmettre, connexion, forfait, conditions et effets. Son brouillon courant reste séparé.
3. Si le profil natif est qualifié, Demander à BMad vérifie à nouveau contexte et bundle, puis demande un nouvel échange via le connecteur existant. Dans le seul candidat 2.1, le motif Recommandation native non qualifiée reste affiché : consultation de l’aide seule possible.
4. Après envoi attesté, Conversation sélectionne ce nouvel échange avec ses identités et le reçu du bundle transmis. La réponse progressive reste la réponse brute de l’agent ; raisons et alternatives sont montrées lorsqu’elles sont réellement reçues, sinon inconnues. Questions et approbations utilisent les demandes corrélées et les gardes livrées.
5. Sam ouvre une alternative dans Fiche compétence puis revient à la même réponse, ou suit Voir les aides pour relire la couverture transmise. Une réponse conservée sur une ancienne révision reste historique, sans suppression ni nouvelle génération implicite.
6. **Moment décisif :** Sam distingue ce que Madness a chargé, ce qui a été transmis et ce que BMad a répondu ; la fin du tour, les propositions et les décisions connues sont explicites, sans suite obligatoire.

**Échec et récupération :** aide manquante/refusée → couverture et raison, seules aides sûres disponibles ; aucune substitution silencieuse. Mutation du profil ou contexte → préparation invalidée avant envoi, nouvelle lecture volontaire. Refus avant reçu → rester sur la préparation sans conversation réussie inventée ; envoi inconnu → aucun retry automatique. Réseau indisponible → aide GET explicite selon le contrat livré, sans rejeu. Interruption → résultat confirmé ou inconnu et gardes du dialogue. Sauvegarde échouée après réponse → reçu natif distingué de la conservation locale non confirmée ; retour au brouillon d’origine disponible.

<a id="epic2-p3"></a>

### 3. Explorer le catalogue réellement installé et lancer une action qualifiée

1. Sam ouvre Toutes les possibilités depuis le projet ou une alternative. Il voit couverture, diagnostic partiel éventuel, recherche et modules, sans nombre fixé ni préférence obligatoire pour un outil transversal.
2. Il recherche par intention, agent, nom ou invocation, puis ouvre une Fiche compétence. Objectif, source, entrées, conditions, effets, livrables attendus et invocation `$<nom-dossier>` exacte y sont lisibles ; inconnu reste inconnu.
3. Copier l’invocation n’exécute rien. Confirmation uniquement après copie réussie ; sinon texte sélectionnable et erreur. Une compétence descriptive ou copiable dont le runtime n’est pas qualifié explique pourquoi elle n’est pas lançable.
4. Pour une action qualifiée, Préparer le lancement ferme la fiche et rejoint la préparation secondaire de Conversation avec projet, initiative, descripteur/révisions, entrées et effets capturés. L’historique et son brouillon restent conservés ; Lancer une nouvelle conversation est le seul envoi. Conditions du workflow et permissions opt-in sont respectées, sans les remplacer par un accord global.
5. Le contrôle au point d’effet refuse tout contexte modifié. Après reçu natif, Conversation sélectionne le nouvel échange ; questions, accords ponctuels, interruption et récapitulatif restent ceux du dialogue livré. Fichiers observés mènent au parcours 6, sans acceptation humaine déduite.
6. **Moment décisif :** Sam peut justifier le choix, l’invocation et le contexte de ce qui a effectivement été lancé, ou comprendre précisément pourquoi seule la copie est permise.

**Échec et récupération :** recherche vide → Effacer les filtres sans perdre le texte ; inventaire vide/refusé → états distincts et diagnostic. Fiche disparue/périmée → ancien texte historique et nouvelle lecture, aucun ancien Lancer actif. Condition/capacité manquante ou annulation → aucune invocation, retour au résultat exact ou brouillon. Interruption, envoi incertain et sauvegarde échouée n’effacent pas la saisie et ne rejouent pas l’action. Fermer la fiche restaure filtres, résultat et focus.

<a id="epic2-p4"></a>

### 4. Retrouver et choisir les initiatives sans réattribuer les échanges

1. Sam ouvre Choisir une initiative depuis l’en-tête du projet. Il voit les initiatives réellement repérées, chemins, sources et révisions ; l’active BMad et la sélection Madness portent leurs propres libellés.
2. Il choisit une initiative pour consulter son parcours et ses fichiers. Le choix local ne change aucune configuration BMad ; l’ancien échange et ses résultats conservent leur initiative capturée, visible dans Conversation.
3. Si une action exige une initiative et que sélection et active diffèrent, la préparation ouvre le conflit avec les deux noms : Sélectionner l’initiative active relit puis choisit l’active attestée ; Rester sur cette sélection conserve la consultation, lancement bloqué ; Annuler le lancement revient au travail. Aucun de ces choix n’écrit BMad.
4. Si l’active est inconnue ou invalide, aucun accord de substitution n’est proposé. Une action ne nécessitant pas d’initiative reste soumise à ses seules conditions, sans initiative inventée.
5. **Moment décisif :** Sam sait quel contexte il consulte et lequel chaque échange a capturé ; il ne peut pas envoyer une action liée à une initiative sur un désaccord non résolu.

**Échec et récupération :** liste vide → Aucune initiative repérée, outils indépendants accessibles ; refus/lecture interrompue → garder la sélection antérieure et nommer la source inaccessible. Initiative supprimée ou configuration modifiée pendant le choix → périmé, relire sans choisir la première restante. Enregistrement local refusé → choix conservé pour cette session et avertissement ; réouverture non promise. Fermer/annuler rend le focus à l’en-tête et les brouillons restent attachés à leurs échanges.

<a id="epic2-p5"></a>

### 5. Lire le parcours et actualiser ses preuves

1. Sam ouvre Parcours : attentes et récupérations gardent la priorité, puis Reprise du projet présente État connu, Résultats et décisions connus, Récapitulatifs disponibles et Travail restant connu. Une observation conservée porte date/révision et caractère ancien ; sinon le manque est nommé. Lire les preuves du projet déclenche uniquement une lecture locale explicite, sans préflight fournisseur ni synthèse IA. Situation du projet, activité de l’agent et acceptation humaine restent trois axes distincts.
2. Voir la preuve de {item} déplie les détails textuels de l’assertion : nature, source, chemin, révision, observation et portée. Entrée TOML, feuille éventuelle, plan, tracker et livrable ne fusionnent pas leurs statuts contradictoires ; les limites partielles restent visibles. `built`, présence ou absence de fichier et fin de tour n’établissent ni acceptation humaine ni tâche terminée ou restante. Sam rejoint un récapitulatif local par son échange exact ; aucune conversation externe n’est reconstruite. Sans sélection valide, il choisit explicitement une initiative ; un nouveau choix ne réattribue jamais les résultats déjà capturés.
3. En 2.5, les changements détectés rendent immédiatement l’observation ancienne ou incertaine ; les événements sont regroupés selon le contrat d’Actualisation locale des preuves. Sam continue à lire et écrire pendant la collecte. Quand une révision différente est disponible, il conserve la version affichée et ses détails ouverts jusqu’à Afficher la nouvelle observation ; cette bascule reste volontaire et ne déplace pas sa lecture.
4. Il consulte l’ancienne preuve identifiée comme historique dans ses détails textuels ; le Panneau de fichiers permettra l’examen du contenu en 2.8, sans être annoncé disponible par 2.4. Une acceptation connue reste sur ses anciens octets ; aucun accord ne se propage à la révision suivante. Avant tout effet, un nouveau contrôle impose de préparer l’action si ses preuves ont changé.
5. **Moment décisif :** Sam peut expliquer l’état affiché par ses sources à cette révision, y compris les inconnus et contradictions, tout en retrouvant son brouillon intact.

**Échec et récupération :** source absente/refusée, remplacement pendant lecture ou limites dépassées → preuve non courante avec motif, pas de statut de succès provisoire. Lecture interrompue → garder l’ancien résultat historique ; nouvelle lecture explicite. Échec d’enregistrement → observation de session non durable signalée, aucun accord inventé. Fermer les détails/aperçu rend le focus à la preuve d’origine ; si disparue, titre du registre avec annonce.

<a id="epic2-p6"></a>

### 6. Consulter les livrables et demander leur ouverture dans l’éditeur

1. Depuis une preuve ou un résultat, Sam ouvre Aperçu ; le Panneau de fichiers nomme fichier, projet, initiative capturée, source, statut et fraîcheur avant le contenu. Le fichier n’est jamais réattribué à la sélection de consultation courante.
2. La lecture sûre affiche le contenu admis sans exécuter scripts, URI ou instructions du document. Sam agrandit dans un Dialogue, lit puis réduit ; il retrouve sa position dans le panneau et le travail resté au centre.
3. Ouvrir dans l’éditeur contrôle à nouveau chemin, portée, révision et intégration réellement disponible. L’attente concerne cette demande seulement ; changer d’onglet ne change pas son chemin capturé.
4. Le retour nomme le fait observable : Demande transmise à l’éditeur si c’est le seul accusé disponible, ou ouverture attestée seulement si une preuve plus forte existe. Ni contenu lu ni acceptation humaine n’en découlent. Copier le chemin reste une action indépendante et confirmée après réussite.
5. **Moment décisif :** Sam sait quel fichier et quelle révision il a consultés, ce que l’intégration éditeur a effectivement confirmé, et revient à son échange et sa saisie exacts.

**Échec et récupération :** inaccessible, hors portée, type/lien refusé, binaire, contenu trop grand ou format inconnu → motif et chemin connu, aucun contenu exécuté ni aperçu prétendu complet. Mutation → ancien aperçu périmé, Examiner la nouvelle révision avant nouvelle demande ; lecture annulée/interrompue ne remplace pas le fichier courant. Éditeur absent/échec → copie sûre du chemin et nouvelle demande explicite possible ; résultat inconnu sans rejeu. Sauvegarde de consultation échouée → sélection/position en session conservées, aucune preuve durable inventée. Fermer rend le focus au déclencheur ; une panne d’éditeur ne ferme pas Madness.

<a id="epic2-p7"></a>

### 7. Retrouver son travail et ses attentes entre plusieurs projets

1. À l’accueil, Sam retrouve les projets récents et attentes nommées par projet/initiative et type. Les demandes actives répondables précèdent les autres points d’attention ; erreur, interruption et arrêt inconnu restent lisibles, puis relecture proposée et historique distincts. L’absence d’attente ne signifie pas tous les livrables acceptés.
2. Depuis l’accueil ou un autre projet, il ouvre une réponse/approbation vers la Conversation et la demande exactes, une relecture vers sa preuve/fichier, ou une erreur/interruption vers les détails corrélés de récupération. Aucun compteur seul ne détermine la destination.
3. Il répond ou décide explicitement dans la demande active. Consulter une attente n’accorde rien, ne sélectionne pas une nouvelle initiative pour les échanges passés et ne relance pas un ancien agent. Une demande expirée entre les deux vues reste historique et inactive.
4. Revenir au travail restaure le projet, onglet, échange, sélection de fichier et point de saisie quittés. Repli du rail, tiroir, largeur, thème et langue préservent ce contexte. Après réouverture, données locales retrouvées et demandes historiques inactives, sans moteur ni réseau automatique.
5. **Moment décisif :** Sam rejoint le bon point de réponse ou de lecture, puis reprend exactement sa rédaction dans l’autre projet, sans déplacer les échanges.

**Échec et récupération :** accueil vide → commande unique d’ouverture ; attente disparue → historique exact et explication, jamais demande de remplacement. Projet absent/refusé ou preuve périmée → limite de la destination avec retour au travail précédent. Consultation interrompue → même retour ; arrêt inconnu conserve sa garde globale même sans projet. Sauvegarde de navigation/brouillon échouée → copie de session conservée, échec durable annoncé et réessai d’enregistrement seul. Si le point de retour n’existe plus, nommer ce fait et ouvrir son projet sans réattribution.

## Inspiration & Anti-patterns

La [référence atelier approuvée](atelier-agents-2026-11-02/atelier-reference-approuvee.png) fixe désormais l’atelier illustré original : portraits discrets, fiche sur demande et matière principalement sur les arêtes. Les références historiques [Codex Desktop](imports/reference-codex-desktop.png) et [navigation repliée](imports/reference-navigation-repliee.png) conservent leur rôle de composition compacte. L’illustration ne remplace ni preuve d’auteur, ni demande, ni décision ; le contenu fictif de la maquette ne devient aucune commande.

Éviter les grandes préparations avant l’échange, les répétitions de blocages, le catalogue fictif et la validation déduite d’un compteur. Party-mode reste une possibilité transversale future parmi les compétences, sans place privilégiée dans les profils livrés. Loop n’est pas adopté ; le graphe relève de l’epic 4.

## Responsive & Platform

Windows est la cible ; la fenêtre étroite ne constitue pas une application mobile. Les seuils de DESIGN.md règlent rail, tiroir et futur panneau de fichiers. Les captures historiques [déployée](mockups/navigation-deployee.png), [rail](mockups/navigation-repliee.png) et [tiroir](mockups/navigation-mobile.png) illustrent leur base. Repli, largeur et thème conservent la saisie, l’échange et le contexte.

Les consommateurs de l’epic 2 se vérifient notamment à 1440 × 920, 1280 px de large et 720 × 820, avec noms longs, zoom et mise à l’échelle Windows. En Conversation, échange ou état vide, demande pertinente et point de réponse restent repérables au premier écran de référence ; le défilement nécessaire à un long patch ou historique ne masque pas sa nature ni ses gardes. Au seuil `{components.files.overlayBreakpoint}`, le Panneau de fichiers devient superposé ; sous `{components.navigation.drawerBreakpoint}`, navigation en tiroir. À toute largeur et au zoom 200 %, un panneau/Dialogue peut occuper la largeur utile, défile verticalement et garde son titre, fermeture et actions atteignables. Fermer retrouve la sélection et la saisie d’origine ; changer de largeur ne ferme ni n’envoie une demande.

La fiche agent utilise {components.agent.panelWidth}, puis {components.agent.wideWidth} dès {components.agent.wideBreakpoint}, en docké à partir de {components.agent.dockBreakpoint}. Sous ce seuil : Dialogue modal, largeur maximale {components.agent.modalWidth}, retrait {components.agent.modalInset} ; sous 720 px, retrait {components.agent.smallInset} et largeur utile. Titre et Signalements sont séparés du corps de rôle défilant. Ce seuil est distinct du futur Panneau de fichiers. Vérifier les deux côtés 1322/1323 px, 1600 px, 600 px et le zoom 200 % ; conserver la mesure CSS réellement observée si la mise à l’échelle Windows quantifie la taille demandée.

Le français est livré ; les formulations françaises/anglaises de cet Update sont contractuelles, leur implémentation reste en 2.14. Changer de langue pendant une saisie conserve ses octets, destinataire, demande et position ; pas de requête fournisseur ni traduction du contenu projet. Préférence de langue refusée : choix de session maintenu, erreur accessible et aucune persistance annoncée. Sombre anthracite/terracotta/pétrole par défaut et clair ivoire/terracotta/pétrole utilisent les tokens atelier de DESIGN.md. La commande soleil/lune nomme « Passer au thème clair/sombre » / « Switch to light/dark theme » et préserve focus et travail ; les contrôles Windows suivent le thème.

La préférence d’apparence reste distincte des données métier. Profil neuf : sombre. Choix explicite retrouvé sans agent ; fichier illisible ou d’une version future : sombre de secours et avertissement sans écraser le fichier. Sauvegarde refusée : choix maintenu pour la session et erreur accessible. Les [preuves historiques de thème](../qualification-theme/README.md) et d’installation ne valent ni contrôle de la nouvelle composition, ni acceptation visuelle humaine, ni audit d’accessibilité complet.


<a id="graphe-produit44"></a>
## Graphe du projet — intégration4.4

Parcours · Conversation · Toutes les possibilités · Graphe forment les quatre onglets du même projet. Le [supplément Graphe](../tickets/epic-graphe-projet/ux-graphe/EXPERIENCE.md) étend les destinations : analyse locale explicite sans BMad/IA/Git, SVG local et liste équivalente, recherche/relations, provenance/fraîcheur datée, puis panneau de fichiers2.8 et retour exact. L’exploration est attachée à projet/racine/périmètre/analyse/révision, indépendamment de l’initiative. Entrer/restaurer/zoomer ne lance aucune analyse. La réouverture historique n’accorde aucune autorité fichier ; revalidation volontaire avant lecture. Atelier, palette/fonts, conversations et saisies restent ceux du monde livré.
