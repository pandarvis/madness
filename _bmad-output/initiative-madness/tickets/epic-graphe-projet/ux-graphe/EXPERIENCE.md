---
title: "Graphe du projet — expérience et copie FR/EN"
status: "supplément contractuel local, à réconcilier en 4.4"
date: '2026-11-04'
scope: "Build 4.2 — walkthrough documentaire uniquement"
---

# Explorer puis retrouver son travail

Les règles ci-dessous décrivent la future expérience du même projet, selon [DESIGN](DESIGN.md), le [profil4.1](../qualification-graphe/profil-g5.md) et son [schéma étroit](../qualification-graphe/schema-profile.json). E1–E8 sont des clauses UX, pas des noms de messages, commandes, objets ou champs d’un nouveau contrat public. Aucun graphe n’est exécuté ici.

<a id="e1"></a>
## E1 — Entrée, retour et identité capturée

Depuis un projet ouvert, le porteur choisit explicitement le quatrième onglet Graphe. La découverte reste visible dans la même liste d’onglets, sans écran de configuration ni contrôle de compte IA préalable. Le titre et la récupération commune restent accessibles. Entrer, changer d’onglet, sélectionner un nœud, rechercher, zoomer ou restaurer ne génère, n’actualise et ne reconnecte rien. Un projet sans BMad ou Codex déconnecté ne rend pas le graphe local dépendant d’un fournisseur.

À l’entrée, mémoriser la destination de travail exacte : projet/racine, onglet, initiative de consultation, échange capturé, brouillon libre ou de demande distinct, sélection et position de saisie/lecture. Revenir au travail nomme cette destination puis la retrouve, sans envoyer, répondre, accepter ni lancer. Si le déclencheur existe encore, rendre son focus ; sinon rejoindre le titre neutre de l’onglet ou du projet avec Retour exact indisponible. Ne jamais choisir le dernier échange, le premier projet ou une commande d’autorisation en remplacement.

L’exploration est attachée au **projet/racine + périmètre + analyse/révision** du résultat affiché : requête, filtres, résultat sélectionné, détails ouverts, positions de liste et dessin, zoom/pan. Passer de A à B retrouve seulement l’exploration de B ; une arrivée tardive de A reste dans A et ne vole ni vue ni focus. Changer d’initiative ne réattribue pas le graphe du projet ni les échanges ; une portée effectivement différente exige un autre contexte affiché. Revenir à la même analyse retrouve l’exploration de session. Sur une nouvelle analyse, conserver le texte de recherche et les filtres compatibles du même périmètre, mais réévaluer les résultats ; aucune sélection ou position d’ancienne révision n’est réutilisée comme preuve actuelle. Si l’élément n’est plus retrouvé, annoncer Sélection indisponible sans déplacer le focus encore valide, notamment dans la recherche. Le titre des résultats reçoit le focus seulement si le contrôle focalisé a disparu, ou lors d’un retour explicite dont le déclencheur n’existe plus.

Après réouverture, seules les données effectivement conservées sont restaurables ; leurs identités et fraîcheur restent historiques/non revalidées. Aucune reprise d’analyse, réobservation native ou sauvegarde réussie n’est supposée. E7 règle les échecs de conservation ; la réalisation de cette mémoire reste à contractualiser en4.3 puis intégrer.

<a id="e2"></a>
## E2 — États et transitions de l’analyse

Trois axes coexistent : **activité de tentative**, **résultat affiché et couverture**, **fraîcheur de ses sources**. Les libellés de cette table ne les fusionnent pas ; par exemple Analyse en cours + dernier complet ancien, ou résultat partiel + sources modifiées. Le dernier complet porte toujours sa propre identité/date/révision et n’est remplacé que par un nouveau résultat complet admis de ce même projet/racine/périmètre. Un résultat complet à sa collecte peut être ancien aujourd’hui.

| État et entrée | Présentation, actions et sortie autorisée |
|---|---|
| Absent : aucun résultat admis retrouvé | Aucun graphe disponible ; nommer projet/racine/périmètre prévu et profil local. Générer le graphe est volontaire ; ouvrir le panneau n’équivaut pas à ce clic. |
| En cours : demande explicite admise | Annoncer Analyse en cours pour ce contexte, début daté et phase seulement si réellement attestée ; durée écoulée possible si mesurée, jamais pourcentage prédit. Empêcher un double lancement. Interrompre l’analyse reste explicite. Ancien résultat consultable sous son identité, sans mélange avec les données en cours. |
| Disponible : résultat complet admis | Montrer Analyse terminée, couverture, date, révision et origine ; recherche/liste/dessin admis. Le mot Disponible ne signifie pas fraîcheur continue, code exact aujourd’hui ni projet validé. Actualiser le graphe crée une nouvelle tentative volontaire, sans effacer le dernier complet. |
| Partiel : résultat sûr mais couverture incomplète | Afficher les parties lisibles, limites/motifs et manques connus avant les relations. Indiquer que les absences ne prouvent pas l’absence de relation. Ne pas remplacer le dernier complet ; Consulter le dernier complet distingue clairement les deux analyses. |
| Ancien : mutation, restauration ou fraîcheur non établie | Date/révision antérieures et raison visibles. Mutation non commitée, non suivie ou pendant collecte n’est jamais effacée par HEAD inchangé. Consultation historique permise, ouverture fichier soumise à E6. Actualiser volontairement seulement. |
| Incompatible : version/schéma/profil non admis | Motif et capacité touchée ; ne pas interpréter le payload en dessin ni faire une conversion silencieuse. Ancien résultat admis consultable sous son propre état ; retour au travail. Nouvelle tentative uniquement si ses conditions locales sont réellement admises, sinon motif d’indisponibilité. |
| Échec : lancement, format, accès ou stockage en défaut | Nommer opération/ressource/motif connu sans diagnostic inventé ; ne pas afficher Analyse terminée. Conserver dernier complet, saisie et exploration. Réessayer l’analyse seulement après terminal/arrêt connu et conditions revalidées ; ne pas assimiler erreur de sauvegarde et analyse échouée. |
| Arrêt demandé | Annoncer Arrêt demandé, puis attendre les preuves de l’enfant et des descendants possédés ; ne pas confondre clic, sortie du lanceur et fin de Job. Pas de résultat complet provisoire. |
| Interruption/timeout avec arrêt confirmé | Nommer Analyse interrompue ou Délai dépassé et Arrêt confirmé. Garder le dernier complet ; éventuel partiel n’est montrable que s’il est admis et nommé. Réessai explicite crée une nouvelle analyse ; aucun redémarrage automatique. |
| Arrêt inconnu/fermeture non confirmée | Résultat de l’arrêt inconnu reste durablement visible, avec identité possédée et garde sur une nouvelle analyse concernée. Seule une réobservation locale qualifiée peut lever cette garde ; pas de relance pour vérifier. Aucun processus étranger n’est arrêté. |

La fermeture de Madness suit le propriétaire de cycle de vie existant : refus des nouveaux lancements, sauvegarde admise, arrêt/drain possédés puis reçu connu ou inconnu. La restauration conserve un arrêt inconnu sans rendre la tentative active ni la relancer. Ce contrat ne fixe aucun nouveau timeout ou délai de drain. Les mesures4.1 ne deviennent pas des limites produit.

BMad reste consultable et ses actions gardent leurs conditions propres même si Graphe est absent, partiel, incompatible, en erreur ou occupé. Une erreur locale du graphe ne fabrique pas un blocage fournisseur. Une véritable garde globale déjà détenue par le coordinateur demeure visible et respectée ; l’indépendance du graphe ne l’annule pas. Son intégration est à résoudre en4.4/4.7, pas par un second coordinateur.

<a id="e3"></a>
## E3 — Lire fraîcheur, sens et confiance

L’en-tête nomme projet, racine résolue connue, périmètre inclus/exclu, analyse affichée, dates de collecte/observation connues et révision des octets du corpus. Détails donne ces valeurs intégrales, origine Graphify/version/profil et couverture réelle ; une valeur absente est Inconnue. La révision inclut les sources non commitées et non suivies selon le futur contrat4.3/4.6 ; un commit seul n’établit pas la fraîcheur. Sans surveillance qualifiée, afficher Observation datée — sources non revalidées plutôt que Courant. Un changement pendant l’analyse, après collecte ou une restauration ne devient jamais actuel par navigation, filtrage ou ouverture de fichier. Invalidation annonce une fois le changement et conserve le focus ; une actualisation explicite seule peut produire un nouveau candidat, avec contrôle de ses sources avant publication.

Selon schema-profile.json4.1, l’adaptateur détermine le sens à partir de `_src` et `_tgt` **ensemble**, sinon source→target. `directed:false` ne rend pas un appel réciproque. Un seul marqueur de direction, un endpoint absent, outil/version/schéma non admis ou raw non estampillé est un refus, sans orientation devinée. L’UI future ne décode pas ces champs ; elle reçoit le sens admis de4.3. Dans une liste ou un détail : origine, type reçu, destination, sortante/entrante relativement au nœud, source de relation et référence connue. Plusieurs relations entre les mêmes extrémités restent distinctes si leur preuve/type diffère ; le regroupement visuel annonce ce qu’il regroupe, sans inventer une relation unique.

| Valeur du profil | Libellé et lecture exigée |
|---|---|
| EXTRACTED | Repérée dans le code / Found in code : relation issue de l’extraction du profil, sans promesse de complétude, d’exécution ni validation humaine. |
| INFERRED | Déduite / Inferred : relation déduite, signalée comme telle même en code-only. |
| AMBIGUOUS | Ambiguë / Ambiguous : interprétation non résolue ; ne pas choisir une destination ou une certitude à la place de la preuve. |

Le témoin `useService`→`Service.act` conserve INFERRED et `confidence_score=0.85`. Montrer Score Graphify : 0.85, séparément du libellé, avec « Indicateur du moteur, pas une probabilité de vérité ». **0.85 n’est pas 85 % de certitude.** Un score absent reste Score inconnu ; hors domaine ou confiance inconnue sont des refus du profil, sans remplacement par EXTRACTED. Les données refusées ne deviennent pas des relations accessibles prétendument sûres ; indiquer leur couverture refusée et le motif selon le futur contrat, sans les publier.

La provenance précise la source_file/source_location effectivement admise, sinon Fichier inconnu/Ligne inconnue. Absente, nulle, vide ou texte de localisation non reconnu : ligne inconnue, donnée brute conservée derrière l’adaptateur sans plage inventée. Une variante numérique positive n’est une ligne qu’après validation et ne constitue pas une variante native déjà éprouvée. Ces règles valent aussi dans les noms accessibles et la liste ; aucune couleur, animation ou position ne porte seule le sens ou la confiance. Aucun état du graphe ne valide BMad, une US, un fichier ou la solution. Cette règle guide les contrats ; elle ne crée pas un avertissement d’acceptation répété dans l’interface. Le vocabulaire d’admission est réservé aux contrats et diagnostics de couverture : la recherche montre les éléments du graphe, avec leurs limites réelles. Le libellé courant explique le niveau ; le code EXTRACTED/INFERRED/AMBIGUOUS reste disponible dans le détail de provenance.

<a id="e4"></a>
## E4 — Recherche, liste et sélection

Le champ Rechercher dans ce graphe porte un libellé permanent et une aide : Nom, identifiant ou chemin relatif. La recherche locale porte sur les nœuds admis de l’analyse affichée et leur nom/identifiant/chemin connu ; elle ne recherche ni disque, ni réseau, ni sémantique par modèle. Recherche vide : Tous les éléments du graphe, portée/couverture explicites. Texte non vide : résultats correspondants et nombre réellement connu, avec la portée. Aucun résultat garde le texte et propose Effacer la recherche ; si aucun graphe n’est admis, ce n’est pas un zéro résultat. Les mises à jour annoncent leur nombre sans déplacer le focus du champ. Échap ne vide pas la requête.

Chaque résultat a un bouton Sélectionner {node} dont le nom intègre le chemin/type connu pour distinguer les homonymes. Noms longs repliés, texte intégral consultable au clavier. Activer sélectionne le nœud et place le focus au titre de ses détails ; afficher identité, fichier connu/inconnu puis Relations entrantes et Relations sortantes. La liste expose chaque relation avec origine/type/destination, confiance et provenance accessibles. Un filtre de relations permet Toutes les relations, Entrantes ou Sortantes, et une recherche textuelle Nom, type ou extrémité dans les seules relations du nœud sélectionné. Zéro relation filtrée garde le filtre ; Effacer les filtres de relations le retire sans effacer la requête des nœuds. Une liste partielle dit Relations non exhaustives, sans affirmer qu’un nœud est isolé.

Le bouton Voir les détails de cette relation expose sa preuve et les deux extrémités ; Proposer Sélectionner {node} pour chacune des extrémités admises à visiter, avec son rôle origine/destination nommé ; l’autre extrémité est directement accessible. Depuis B dans une relation entrante A→B, Sélectionner A rejoint donc l’origine A ; depuis A, Sélectionner B rejoint la destination B. Cette navigation ne retourne jamais le sens de la relation. Revenir à {node} retrouve son détail, filtres et position ; Revenir aux résultats retrouve la requête, le résultat déclencheur et sa position/focus. Si une analyse différente remplace l’affichage, E1 réévalue ce retour ; aucune association par nom seul.

Nombreux éléments : une pagination, virtualisation ou projection future doit offrir un accès nommé au clavier à tous les résultats admis de cette portée, annoncer la tranche affichée et le total s’il est établi, garder sélection/position et distinguer éléments non encore affichés, refusés et masqués. Aucun plafond arbitraire n’est décidé. Les liens hors portée et lignes absentes ne sont jamais rendus ouvrables par la recherche. L’information du dessin et de la liste reste la même ; sélectionner dans le dessin met à jour le même détail, sans imposer une visite de tous les nœuds au moyen de Tab.

<a id="e5"></a>
## E5 — Clavier, zoom local et pan

Ordre de focus : onglet actif → Revenir au travail → Détails de l’analyse et actions d’analyse disponibles → recherche/effacement → résultats → détails et filtres/relations → commandes de représentation → région de dessin. Les métadonnées non interactives restent dans l’ordre de lecture. Tab/Maj+Tab quittent librement toute région non modale. Boutons à Entrée/Espace ; saisie reste du texte sans raccourci global à lettre. Dans les onglets, flèches gauche/droite et Début/Fin déplacent le focus ; Entrée/Espace active le panneau. Cette cible n’est pas le comportement actuel de App.tsx466, qui active immédiatement aux flèches : divergence préexistante à réconcilier en2.14/4.4, sans correction ici.

Zoom avant et Zoom arrière ne changent que l’échelle de la représentation ; afficher Zoom du graphe : {value} avec valeur réelle. Ajuster la vue cadre la projection annoncée, sans prétendre montrer les nœuds masqués ; Réinitialiser la vue rétablit échelle et déplacement locaux de référence, sans vider recherche/sélection. Déplacer vers le haut/bas/gauche/droite offre un pan sans drag. Les bornes/étapes et la technologie sont à déterminer par la réalisation mesurée de4.8 ; à une borne réelle, commande indisponible avec motif, sans quota de données déduit. Le zoom de l’application demeure distinct et ses raccourcis ne sont pas interceptés par le dessin ; aucune commande de zoom application nouvelle n’est promise ici.

Cliquer ou faire glisser le dessin ne fait aucun effet fichier ou analyse. Le pan ne vole pas le focus ; zoom et Ajuster gardent le focus au bouton déclencheur et annoncent la nouvelle vue sans relire tous les nœuds. La région donne une aide et un lien vers la liste équivalente ; le clavier n’a pas à apprendre une géométrie pour obtenir la provenance. Si le dessin capture des flèches lorsqu’il est explicitement focalisé, ce comportement est nommé et Tab permet d’en sortir ; aucune capture quand le focus est dans un champ ou les onglets. La disposition peut se réorganiser avec la largeur, sans animation imposée et sans perte de sélection, requête ou focus.

<a id="e6"></a>
## E6 — Du nœud au fichier, puis retour

Cette séquence est une **intention pour 2.8/4.4/4.8**, pas une commande exécutée ou un IPC créé en4.2.

1. Dans le détail du nœud, Voir le fichier nomme sa référence relative admise, le projet/racine, l’analyse/révision et la ligne connue/inconnue ; capturer ce contexte et le déclencheur exact avant la demande. Le panneau cible est celui du même projet. Une référence inconnue/refusée affiche son motif à la place d’une action ouvrable ; aucun chemin n’est inféré du libellé.
2. Avant effet, revalider identité de projet/racine, portée, fichier relatif existant et révision des octets. Références absolues, traversantes, lettre de disque, séparateur inverse, lien ou sortie hors racine du profil4.1 sont refusés. Une révision modifiée ou inconnue n’ouvre pas silencieusement le fichier courant comme source de l’ancien graphe : afficher Référence ancienne ou non vérifiée. Examiner la nouvelle révision est une nouvelle lecture explicite de2.8 après revalidation ; elle garde l’ancien graphe historique et sépare les deux révisions. Ligne non admise : aucun saut de ligne deviné.
3. Si projet ou racine change pendant l’ouverture, ne pas afficher le fichier A sous B ni sélectionner automatiquement A. Une réponse tardive reste corrélée à la demande A et ne déplace pas le focus courant ; au retour explicite à A, contexte revalidé avant présentation. Refus connu propose retour au nœud ; aucune nouvelle demande automatique.
4. Après lecture admise, focus au titre du Panneau de fichiers, en-tête exact avant contenu non fiable en lecture seule. Dock : Tab libre ; overlay/agrandissement : dialogue modal et fermeture/Échap qui rendent le focus au Voir le fichier exact. Retrouver recherche, filtres, sélection, zoom/pan et position du graphe. Si le déclencheur a disparu, titre des résultats de ce même contexte avec annonce ; jamais une autre référence par nom.
5. Ouvrir dans l’éditeur relève de2.8 : nouvelle intention et revalidation au point d’effet, intégration qualifiée nécessaire. Seul retour connu annoncé : Demande transmise à l’éditeur si tel est le reçu, pas « fichier ouvert » ou « lu ». Éditeur absent/échec/inconnu restent distincts ; aucune répétition automatique. Copier le chemin n’est permis qu’après admission et confirme seulement sa réussite. Référence refusée ne devient pas un moyen d’ouvrir/copier une commande hostile. Fermer l’éditeur ne déclenche aucune analyse et le retour volontaire dans Madness conserve le travail.

<a id="e7"></a>
## E7 — Conservation et autres variantes

Un échec de sauvegarde conserve résultat observé et exploration en session avec Enregistrement échoué — réouverture non garantie. Le résultat reçu n’est pas annoncé durable. Réessayer l’enregistrement sauvegarde seulement, sans nouvelle analyse, lecture native, ouverture fichier ou effet éditeur. Ancien résultat durable et nouveau résultat de session restent nommés séparément. Ne pas écraser le dernier complet durable par un partiel, un échec ou une sauvegarde non confirmée. La fermeture conserve les gardes et ne promet pas de retrouver ce qui n’a pas été enregistré.

Langue : interface FR/EN appariée en E8 ; changer la langue garde octets de recherche, noms/chemins/types de projet non traduits, sélection, contexte de retour et focus. L’anglais global reste dépendant de2.14 ; seules certaines chaînes de reprise sont actuellement appariées. Thème : mêmes noms/rôles/ordre et raisons dans clair/sombre, rôles existants du DESIGN racine. Zoom application200 %, texte agrandi et noms longs : repli vertical D3, contrôles et fermetures atteignables, pas de texte d’état dans le dessin seulement. Mouvement réduit : aucune simulation de force, recentrage animé ni défilement imposé ; état annoncé et liste stables. Les vérifications de rendu, restitution lecteur d’écran, contraste matériel et conformité WCAG restent futures.

<a id="e8"></a>
## E8 — Copie contractuelle appariée

Chaque ligne est une paire d’interface à implémenter par les consommateurs ; les valeurs entre accolades restent des données. Les codes EXTRACTED/INFERRED/AMBIGUOUS peuvent accompagner leur traduction, jamais être reclassés. Les motifs `{reason}` nomment une cause établie et une récupération possible ; valeur inconnue explicite plutôt qu’un code brut seul.

| Clé UX | Français | English |
|---|---|---|
| navigation | Graphe · Graphe du projet · Revenir au travail | Graph · Project graph · Return to work |
| identity | Projet · Racine · Périmètre · Analyse · Révision · Observé le · Détails de l’analyse | Project · Root · Scope · Analysis · Revision · Observed at · Analysis details |
| coverage | Couverture · Inclus · Exclu · Inconnu | Coverage · Included · Excluded · Unknown |
| absent | Aucun graphe disponible · Analyse locale du code et des dépendances, sans modèle | No graph available · Local code and dependency analysis, without a model |
| generate | Générer le graphe · Actualiser le graphe | Generate graph · Refresh graph |
| running | Analyse en cours · Début : {date} · Durée écoulée : {duration} | Analysis in progress · Started: {date} · Elapsed: {duration} |
| complete | Analyse terminée · Graphe disponible | Analysis complete · Graph available |
| partial | Résultat partiel : {reason} · Relations non exhaustives | Partial result: {reason} · Relations are not exhaustive |
| old | Graphe ancien : {reason} · Observation datée — sources non revalidées · Sources modifiées pendant l’analyse | Stale graph: {reason} · Dated observation — sources not revalidated · Sources changed during analysis |
| incompatible | Graphe incompatible : {reason} | Incompatible graph: {reason} |
| failed | Analyse échouée : {reason} · Réessayer l’analyse | Analysis failed: {reason} · Retry analysis |
| interrupt | Interrompre l’analyse · Arrêt demandé | Interrupt analysis · Stop requested |
| stopped | Analyse interrompue · Délai dépassé · Arrêt confirmé | Analysis interrupted · Time limit exceeded · Stop confirmed |
| stop-unknown | Résultat de l’arrêt inconnu · Nouvelle analyse bloquée · Vérifier l’arrêt | Stop outcome unknown · New analysis blocked · Check stop |
| last-complete | Dernier graphe complet : {analysis}, {date}, {revision} · Consulter le dernier complet | Last complete graph: {analysis}, {date}, {revision} · View last complete graph |
| result-missing | Résultat indisponible : {reason} · Retour exact indisponible · Sélection indisponible | Result unavailable: {reason} · Exact return unavailable · Selection unavailable |
| search | Rechercher dans ce graphe · Nom, identifiant ou chemin relatif · Effacer la recherche | Search this graph · Name, identifier or relative path · Clear search |
| all-results | Tous les éléments du graphe · {count} résultats dans {scope} | All graph elements · {count} results in {scope} |
| no-results | Aucun résultat pour cette recherche | No matches for this search |
| projection | Projection : {scope} · {shown} éléments affichés · {hidden} éléments masqués · Tranche affichée : {range} · Total inconnu | Projection: {scope} · {shown} elements shown · {hidden} elements hidden · Displayed range: {range} · Total unknown |
| select | Sélectionner {node} · Revenir à {node} · Revenir aux résultats | Select {node} · Return to {node} · Return to results |
| relation-regions | Relations entrantes · Relations sortantes · Toutes les relations · Entrantes · Sortantes | Incoming relations · Outgoing relations · All relations · Incoming · Outgoing |
| relation-search | Rechercher dans les relations · Nom, type ou extrémité · Effacer les filtres de relations | Search relations · Name, type or endpoint · Clear relation filters |
| relation-empty | Aucune relation pour ces filtres | No relations for these filters |
| direction | Origine : {source} → Relation : {type} → Destination : {target} | From: {source} → Relation: {type} → To: {target} |
| relation-detail | Voir les détails de cette relation · Source de la relation · Relations regroupées : {count} | View this relation’s details · Relation source · Grouped relations: {count} |
| confidence | Repérée dans le code · Déduite · Ambiguë | Found in code · Inferred · Ambiguous |
| score | Score Graphify : {score} · Score inconnu · Indicateur du moteur, pas une probabilité de vérité | Graphify score: {score} · Unknown score · Engine indicator, not a probability of truth |
| source-location | Provenance · Fichier inconnu · Ligne inconnue · Ligne : {line} | Provenance · Unknown file · Unknown line · Line: {line} |
| refused-coverage | Données refusées : {reason} | Rejected data: {reason} |
| graph-controls | Zoom avant · Zoom arrière · Ajuster la vue · Réinitialiser la vue · Zoom du graphe : {value} | Zoom in · Zoom out · Fit view · Reset view · Graph zoom: {value} |
| pan | Déplacer vers le haut · Déplacer vers le bas · Déplacer vers la gauche · Déplacer vers la droite | Pan up · Pan down · Pan left · Pan right |
| graph-region | Représentation du graphe · Consulter la liste équivalente · Représentation indisponible : {reason} | Graph representation · View equivalent list · Representation unavailable: {reason} |
| graph-help | Utilisez les commandes pour zoomer ou déplacer la vue. Tab permet de quitter la représentation. | Use the controls to zoom or pan. Tab leaves the representation. |
| unavailable-command | Commande indisponible : {reason} | Command unavailable: {reason} |
| file-intent | Voir le fichier · Référence ancienne ou non vérifiée · Examiner la nouvelle révision | View file · Stale or unverified reference · Inspect new revision |
| file-refused | Référence refusée : {reason} · Projet changé — demande non appliquée à la vue courante | Reference rejected: {reason} · Project changed — request not applied to the current view |
| file-panel | Panneau de fichiers · Agrandir · Fermer · Ouvrir dans l’éditeur · Copier le chemin | File panel · Expand · Close · Open in editor · Copy path |
| editor | Demande d’ouverture en cours… · Demande transmise à l’éditeur · Ouverture non confirmée | Requesting file opening… · Request sent to editor · Opening not confirmed |
| editor-failed | Éditeur indisponible — vous pouvez copier le chemin · Demande d’ouverture échouée : {reason} | Editor unavailable — you can copy the path · Editor request failed: {reason} |
| copy | Chemin copié · Copie impossible — sélectionnez le texte | Path copied · Could not copy — select the text |
| save | Enregistrement échoué — réouverture non garantie · Résultat de session non enregistré · Réessayer l’enregistrement | Save failed — reopening not guaranteed · Unsaved session result · Retry save |

Les inconnus de nombre/date/révision remplacent la valeur dans le contexte du champ nommé ; ne pas afficher zéro, une date de navigation ou un hash Git à leur place. Aucun nombre ne paraît dans une commande sans donnée admise. Les états/exemples de ce supplément ne constituent aucune capture ou parcours exécuté dans Madness.


## Réconciliation produit4.4 — 4 novembre2026

Le catalogue2.6 et le panneau2.8 sont livrés. Graphe est la quatrième destination du même shell. Premier rendu4.4 : SVG géométrique local déterministe, liste exhaustive des nœuds admis, sens textuel et flèches, recherche, relations, fichier et retour ; approfondissement4.8 et matrices4.5–4.9 restent ouverts. Le clavier des onglets déplace le focus sans activation aux flèches, puis Entrée/Espace active. Réouverture passive ; revalidation volontaire des fichiers sans analyse. Le replan dispense4.4 des dépendances historiques2.14/3.9. Le présent ajout actualise ces seuls constats historiques ; source Sally4.2 conservée, aucune nouvelle activation ou preuve de rendu déduite.
