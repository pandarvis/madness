# Décisions et données — temps et usage par US (2.10)

5 novembre 2026. Qualification documentaire hors produit, baseline `c6c482028c8e63772cbc99830183cb05f89aeaa6`. Q8 reçoit une définition prospective adoptée ; Q9 reçoit une disponibilité explicitement limitée. Le produit courant ne mesure encore ni durée par US, ni usage, ni coût. Le candidat 0.2.14 reste inchangé.

## Ce que chaque preuve établit

| Donnée | Code courant | Export exact CLI 0.144.6 | Ancien observateur filtré | Décision / disponibilité |
|---|---|---|---|---|
| Contexte | ContextRef : projet, initiative, conversation, fournisseur, connexion ; pas US | Identifiants thread/turn déclarés | Références SHA256, parfois terminal ; pas rattachement US | Capturer le contexte complet avant chaque tour ; extension 2.11 |
| Identité documentaire | Projet + racine physique + initiative + conteneur relatif + id normalisé ; révisions de preuve | Aucun contrat US | Aucun rattachement ajouté aux anciennes traces | Story explicite et non ambiguë ; type source qualifié en 2.11 ; occurrence séparée |
| Début local | Callback `accepted` après réponse `turn/start`, sans date monotone durable | `Turn.startedAt` integer/null, int64, secondes Unix | Horloge de l'observateur ≠ ACK du tour ; pas borne locale | Capturer l'instant monotone au point accepté, avant le travail asynchrone du callback |
| Fin locale | Terminal reçu traité avant drain/outils/sauvegarde ; le retour de la promesse est plus tardif | `Turn.completedAt` integer/null, int64, secondes Unix | Terminal booléen, sans borne monotone | Capturer le terminal corrélé dès réception ou l'arrêt confirmé dont l'instant est prouvé |
| Durée native | Non projetée / non conservée | `Turn.durationMs` integer/null, int64, millisecondes | Champ non préservé par le filtre | Schéma seulement ; provenance et sémantique distinctes de la durée locale |
| Usage natif par tour | Notification hors whitelist `DialogueRpc`, pas port/persistance usage | `ThreadTokenUsageUpdatedNotification` : threadId, turnId, tokenUsage ; last/total | Méthode inconnue → other, pas payload usage | Réception attribuable et persistance non qualifiées ; indisponible |
| Compteurs | Aucun compteur produit | last/total : inputTokens, cachedInputTokens, outputTokens, reasoningOutputTokens, totalTokens, tous int64 ; modelContextWindow nullable | Aucun nombre reçu exploitable ici | Ne pas additionner last+total ; ne pas présumer que cache/raisonnement sont des parts indépendantes |
| Agrégats compte | Aucun contrat par US | GetAccountTokenUsageResponse : summary, dailyUsageBuckets nullable ; dates/tokens, lifetimeTokens, longestRunningTurnSec, etc. | Non observés ici | Ni US ni clé de tour ; pas de répartition entre stories |
| Montant / devise | Absents | Aucun prix/devise dans les déclarations retenues | Absents des extraits filtrés | **Coût indisponible**, jamais zéro ; pas tarif API ni prix de l'abonnement |
| Réouverture | Historiques sans durée durable ; Snapshot v1 inchangé | Schéma ne prouve pas conservation produit | Anciennes traces conservées intactes | Historiques inconnus ; futurs reçus durables relus passivement, sans reconstruction |

Le schéma exact primaire vient de l'export local déjà réalisé et reçu exit0 : binaire `4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7`, version `codex-cli 0.144.6`, 267 schémas. Cet export utilise un home enfant isolé et ne comporte aucun initialize/thread/turn/auth. [Reçu export](provenance/schema-export-receipt.json), [inventaire 267 SHA256](provenance/schema-inventory.json), [index source/extrait](fixtures/index.json). Aucune nouvelle invocation du CLI n'est nécessaire au banc.

Les schémas TurnStarted/Completed attestent les noms, nullabilité et unités. Les trois champs temporels sont des propriétés facultatives et nullables : leur déclaration ne promet ni présence ni valeur. `TurnStatus` comporte completed/interrupted/failed/inProgress ; un événement turn/completed exige la lecture du statut et ne signifie pas automatiquement réussite. Aucune équivalence entre secondes Unix et horloge monotone locale n'est présumée.

Le schéma TokenUsageBreakdown déclare cinq entiers int64 ; il ne fournit ici ni minimum non négatif, ni relation arithmétique, ni règle de remplacement d'un cumul, ni prix. Les mots last/total ne suffisent pas à qualifier une addition ou une différence. Toute évolution de version exige une nouvelle qualification de l'interface précise utilisée.

Les références officielles [app-server](https://learn.chatgpt.com/docs/app-server) et [cycle SIWC](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server), déjà consultées par le parent, restent secondaires à l'export exact. Elles documentent notification/cycle/version, sans prouver émission SIWC, réception actuelle ou coût. [Portée des consultations](provenance/metrics210-official-docs.json). Aucun SDK/API de substitution n'est utilisé.

## D1 — Définition de la durée

Nom adopté : **durée cumulée des tours observés**. Un intervalle clos est la différence entre deux instants monotones du même domaine d'horloge : tour accepté → terminal corrélé reçu, ou arrêt confirmé avec borne connue. Les deux bornes et leur corrélation doivent être prouvées et durables pour rester closes après réouverture.

Exemple prospectif : préparation à 0 ms, ACK à 1 000, outil à 2 000, question à 3 000, réponse à 301 000, terminal à 601 000, drain à 701 000, sauvegarde à 801 000. Durée retenue : **600 000 ms (10 min)**. Outils, attente réseau et attente humaine du tour sont inclus ; préparation et traitements après terminal sont exclus. Les délais de garde suspendus pour une question ne sont pas une horloge de mesure.

Ce nombre n'est ni durée de réalisation de la story, ni temps CPU, ni effort humain. Une éventuelle durée native reste un champ séparé, avec source/unité/nullabilité propres ; elle ne remplace pas une borne locale et ne la complète pas silencieusement. Les secondes Unix natives et les dates murales ne servent pas à reconstruire l'intervalle monotone. Un ACK et terminal au même instant prouvés peuvent donner une vraie durée zéro ; l'absence d'un champ reste inconnue.

## D2 — Rattachement explicite et occurrence

Choisir une seule story documentaire avant chaque tour. Capturer projet, chemin et identité de racine physique, initiative/chemin, conteneur relatif, id normalisé, occurrence, ContextRef complet, preuve de type story, révision de contexte et de preuve, sources/empreintes. La révision décrit la preuve capturée ; elle ne prouve pas une continuité éternelle d'occurrence.

Une entrée story sans feuille est admissible. Le type story n'est pas porté par le contrat de progression courant : 2.11 doit fournir une source qualifiée avant de rendre le rattachement admissible. Un titre, un fichier @file, un doublon d'id, un type absent/inconnu ou spike ne sont pas des solutions de repli. Une sélection faite après l'ACK ne s'applique pas rétroactivement.

Un renommage de titre conserve la référence capturée si la même occurrence est prouvée. Un déplacement, une suppression puis réapparition, ou un réemploi détecté créent une occurrence séparée. La détection universelle d'un réemploi silencieux sans discontinuité observée est impossible : conserver cette limite, sans fabriquer une continuité. Les fixtures simulent cette limite explicitement.

Les résultats tardifs restent dans leur contexte capturé, même après navigation vers un autre projet, une autre conversation ou une autre US. Aucun historique n'est réaffecté. Les tours non rattachables restent non attribués ; leur durée connue ne devient pas celle de l'US active.

## D3 — Cumul et déduplication

Compter une fois chaque tour distinct par une identité stable qui inclut session/exécution du connecteur, fournisseur/connexion, thread/tour et conversation locale capturée. Ni timestamp seul, ni titre, ni navigation ne constituent l'identité. Un événement répété à charge identique ne change pas le cumul. Même identité avec charge différente : conflit explicite, intervalle non promu en durée close ; le premier reçu n'est pas choisi arbitrairement.

Deux tours parallèles de 10 min donnent **20 min cumulées**, avec chevauchement signalé, même si leur occupation calendaire commune est plus courte. Les répartitions par US et conversation restent distinctes. Les horloges de processus/domaine différents ne permettent pas à elles seules de conclure au chevauchement : celui-ci reste inconnu, même lorsque les durées individuelles sont connues. Le banc ne crée pas de mesure de calendrier ni d'effort.

## D4 — Bornes manquantes et couverture

Un clic Arrêter n'est pas une confirmation. Un statut stopped sans instant prouvé ne ferme rien. Crash, arrêt inconnu, ACK absent, terminal absent, borne non durable, horloge changée ou ordre monotone invalide donnent une durée inconnue pour ce tour. Aucun timeout, date de fichier/projet/question, activité textuelle ou instant de réouverture n'est transformé en borne.

Les autres tours connus restent consultables. Exemple prospectif : un tour clos de 10 min, un crash sans terminal et un ancien tour sans ACK donnent **10 min connues, couverture partielle, deux tours inconnus**. Si tous les tours sont inconnus, le cumul connu reste indisponible, pas zéro. La couverture décrit les tours identifiés dans le périmètre retenu ; elle ne promet pas que toute activité historique a été découverte.

Un terminal received avec statut failed ou interrupted peut fermer l'intervalle de temps, tout en gardant un résultat fonctionnel d'échec/interruption. La durée ne prouve pas la réussite. Une borne terminale reçue mais non persistée ne permet pas une durée close durable.

## D5 — Disponibilité, usage et coût

Les quatre anciennes traces sont des observations filtrées, pas des transcriptions complètes du protocole. Elles conservent respectivement 120, 0, 402, 0 événements et 1, 0, 8, 0 résumés de tours. Elles sont complètes **dans leur filtre** : droppedEvents0 et aucun indicateur incomplete vrai. Les méthodes inconnues sont renommées other, les deltas sont supprimés et leurs nombres peuvent être conservés. Les payloads de temps/usage ne sont pas préservés.

L'extraction secondaire whitelist ne garde que séquence, direction, type, références déjà SHA256, méthode filtrée, résumés de terminal/deltas, compteurs et indicateurs bornés de l'observateur. Aucun contenu, argument, PID, chemin de données ni identifiant natif brut n'est copié. Les sources initiales sont seulement lues ; leurs quatre empreintes fournies par les enquêteurs sont revérifiées. [Index et filtres](fixtures/index.json).

L'absence de champ usage dans cet export ne démontre pas l'absence native d'usage. L'export de schéma ne démontre pas son émission au profil SIWC actuel. Réception attribuable, sémantique exploitable et persistance restent **non qualifiées**. Coût/devise restent indisponibles, sans zéro ni estimation depuis tokens/abonnement/API. Les agrégats de compte restent hors attribution par US.

## D6 — Obligations des consommateurs

| Consommateur | À faire à partir de cette décision | Limites à conserver |
|---|---|---|
| Sally 2.12 | Spécifier sélection explicite avant tour, identité/occurrence, nom de la durée et périmètre, inconnus/non attribués, couverture, chevauchement, résultat du tour séparé de durée | Usage/coût indisponibles ; aucun chiffre exemple présenté comme reçu natif ; aucun accord humain ou WCAG déduit |
| Contrats 2.11 | Fournir type story/provenance ; capturer contexte/occurrence avant ACK ; identité locale↔thread/turn ; instants monotones/domaine ; point terminal avant drain ; preuve durable ; déduplication/conflit ; couverture/réouverture passive | Aucun rétro-calcul Snapshotv1, rattachement probable ou nouveau contrat implicite acquis par ce banc ; ne pas importer ses reducers privés dans le produit |
| UI 2.13 | Afficher les futurs états réellement persistés/qualifiés ; connu/inconnu, non attribué, total de tours et chevauchement ; durée locale et native distinctes si celle-ci devient qualifiée | Ne pas convertir indisponible en zéro, cumul en occupation calendaire, tokens en prix, schéma en donnée reçue ; identité/navigation ne réaffectent pas le passé |
| Futur vrai échange pertinent | Observer seulement lors d'un échange utile autorisé, expurger/borner/corréler ; distinguer présence d'un champ, réception, interprétation et stockage | Aucune invocation modèle artificielle pour lever Q9 dans ce spike ; ni nouveau consentement, fournisseur ou gate réseau |

Décisions Winston D1–D6 et adoption Sofia : [relevé parent des messages d'agents réels](provenance/metrics210-winston-sofia-decisions.json). Il rapporte l'activation architecte par résolveurs agent/config et lecture epic/architecture ; c'est une provenance de décision, pas un reçu natif. L'adoption s'appuie sur le mandat humain autonome existant, sans nouvelle validation globale. [Enquêteurs lecture seule](provenance/metrics210-investigation.json).

## Banc reproductible et portée

Trois classes de fixtures restent séparées : `historical-filtered-observer`, `native-schema-only` (sans valeurs reçues), `local-prospective-not-product`. Les 24 cas d'identité et neuf comparaisons utilisent le validateur et la projection de progression existants, puis une preuve de type/occurrence explicitement prospective. Les 31 chronologies et huit cumuls ont des oracles numériques littéraux indépendants ; les contre-exemples couvrent faux arrêt, crash, délais/réouverture, duplication, charge conflictuelle, changement de contexte et borne non durable.

Commande depuis la racine réelle :

```powershell
node --experimental-strip-types scripts/qualification/us-metrics.mjs --output=_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-mesures-us/runs/<nouveau-temoin>
```

La sortie doit être un nouveau sous-dossier direct de `runs/` ; création exclusive, marqueur possédé, chemins physiques sans symlink. Aucun écrasement ni nettoyage d'un chemin inconnu. Le banc relit les sources et leurs empreintes, compare les déclarations JSON par pointeurs, vérifie les 267 schémas, les quatre extractions whitelist et les fixtures prospectives, sérialise puis relit une copie documentaire. Il compare les projections exactes à cette réouverture, sans ouvrir l'application.

Le gel avant/après porte sur **161 inputs produit et ASAR `74bf2eed593ed0256ea7cc18aeb0064272888e3adc310b96ec6e88b51d2ea03b`**, sans profil personnel/coffre. [Gel fourni](provenance/protected-inputs.json), [contrôle avant](provenance/protected-before.json). La passivité se limite au chemin de code du banc (fichiers/crypto/validateurs) et à ses effets documentaires ; aucun succès natif ou compteur global externe n'est déduit.

Le [rapport vérifié](verification.json) distingue chaque cas effectivement exécuté, ses classes et M1–M8. Les résultats locaux sont prospectifs : ce banc n'est ni une implémentation produit ni une qualification de champs jamais reçus. Le parent complète contrôle de périmètre, Quick et audit high indépendant avant clôture. Aucun code produit/spine/compte/profil/paquet/version, SIWC/proxy, NSIS/UI ou installation n'est modifié par 2.10.
