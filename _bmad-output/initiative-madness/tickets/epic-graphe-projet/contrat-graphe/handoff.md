# Contrat Graphe v1 — remise aux consommateurs

Lot 4.3 : trois modules isolés et banc pur. Aucun import dans les barrels existants, coordinateur, Main, preload, renderer ou store. Importer directement les nouveaux modules. Ce contrat ne rend pas le module Graphe disponible et ne vaut ni G5, ni arrêt physique, ni sauvegarde ou acceptation humaine.

## Données et versions

- GraphSnapshot.schemaVersion=1 ; commandes, événements et état contractVersion=1. Toute autre version est un refus contrôlé, sans conversion. Provenance : seul GRAPH_PROFILE correspondant au profil4.1, graphifyy0.9.101, schéma natif1 clusterisé et normalizerVersion1. Les empreintes nativeSha256/assemblyRevision sont des données de provenance, pas la preuve de leurs octets physiques.
- GraphIdentity lie projectId, rootPath, rootIdentity, scopeId, scopeRevision, analysisId et sourceRevision. Les chemins de racine canoniques et leur identité proviennent du propriétaire projet qualifié. Comparaison exacte ; aucune canonicalisation ni déduction de confinement Windows dans le banc. Les empreintes SHA-256 portent des octets, pas une révision numérique de sélection ni une initiative. Le graphe n'a aucun initiativeId de consultation.
- sourceRevision doit identifier le corpus réellement capturé, y compris non commité et non suivi selon la portée. Le contrat exige un SHA-256, sans fabriquer cet inventaire ni prouver son exhaustivité. scopeRevision identifie la définition de périmètre détenue par le cœur ; included/excluded sont comparés séparément aux faits attendus.
- sources est le manifeste déclaré du candidat : chemin relatif, SHA-256, nombre de lignes connu ou null et kind=file/link/unknown. Une référence connue exige un fichier file de ce manifeste et une ligne positive attestée par son lineCount, ou une ligne explicitement inconnue. Refus lexical des chemins absolus/traversants, lettre disque, deux-points, séparateur inverse et segments vides. La vraie existence, résolution des liens et exclusion des sorties de racine restent des faits physiques du fournisseur fichiers/corpus.
- Nœuds et relations ont des identifiants opaques non réduits à la limite des IDs applicatifs ; projectId seul suit la forme applicative actuelle. IDs de nœuds et de relations uniques ; extrémités existantes ; plusieurs preuves entre mêmes extrémités restent distinctes.
- directionSource=explicit-markers signifie normalisation amont de _src/_tgt ensemble ; source-target signifie le fallback source→target. Le contrat n'accepte aucun de ces champs natifs. directed:false ne change pas l'orientation. L'adaptateur4.5 possède ce décodage et le refus d'un seul marqueur.
- confidence conserve EXTRACTED/INFERRED/AMBIGUOUS. score est un nombre fini entre0et1 ou null ; booléen/texte/non-fini refusés, aucune conversion en probabilité. Fichier et ligne inconnus ont status=unknown et reason=absent/unrecognized. Pas de plage de lignes devinée ni texte natif passé au renderer.
- collectedAt est une date UTC ISO stricte ou null. Une date ne détermine jamais l'ordre. coverage.status=complete implique aucune limitation ; partial exige des limites explicites. La couverture du résultat n'établit ni fraîcheur continue, ni validation de projet, ni complétude de solution.

Les guards valident des arbres de données simples, par descripteurs et copie itérative. Cycles, getters/setters, fonctions, symboles, prototypes spéciaux et tableaux creux sont refusés sans sérialisation ni coercition. Une propriété toJSON n'est jamais exécutée. Les traps d'un Proxy peuvent s'exécuter lors de l'introspection : aucune sandbox contre objets JS actifs n'est revendiquée. Aucun plafond arbitraire de nœuds, relations ou taille de graphe.

## Autorités requises à l'admission

ExpectedGraphContext est un fait détenu par le cœur : identité capturée, generation entière positive, correlationId, lastEventOrder, corpus, included/excluded attendus, état de comparaison des sources et date d'observation. Il doit être construit par les propriétaires qualifiés, séparément du candidat ; ne jamais recopier les déclarations reçues pour les « vérifier ».

admitGraphSnapshot valide et recopie le candidat, puis confronte les sept identités et le manifeste exact au contexte attendu (chemins, hashes, type et nombre de lignes), ainsi que la portée. Les références déjà vérifiées structurellement sont ainsi liées au corpus attendu. Une forme valide seule n'établit pas un fait du disque. Si le fournisseur ne peut établir la révision et le corpus, ne pas en fabriquer un.

sourceState=unchanged signifie comparaison établie à observedAt ; changed/unknown ne deviennent pas actuels. Même observed signifie observation datée, jamais surveillance continue. Une mutation pendant collecte doit rester changed/unknown ou faire refuser la publication ; conserver la capture originale pour la comparaison, ne pas la réattribuer au nouveau corpus.

## Politique pure et publication

createGraphState crée une projection vide, sans effet. beginGraphAttempt décide seulement si une nouvelle tentative peut être préparée : même scope, nouvelle analyse et generation strictement supérieure, ordre initial0 ; garde busy ou stop-unconfirmed du coordinateur existant préservée. Cette décision n'est ni un clic humain, ni une autorisation, ni un lancement. requestGraphStop change seulement la projection après commande interrupt de même projet/périmètre/analyse ; il ne prouve aucun arrêt.

publishGraphEvent confronte version, corrélation, sept identités, generation, sourceRevision capturée à l'ouverture et ordre strictement croissant au contexte détenu par le cœur. Un ancien candidat daté plus récemment, un autre projet ou une initiative consultée ne peuvent remplacer le résultat courant. lastEventOrder attendu doit correspondre à la projection ; l'horloge ne tranche jamais.

- started/progress rapportent l'activité, sans pourcentage inventé.
- result contient un GraphSnapshot normalisé admis. La réception garde l'activité running ; elle ne prouve pas la fin du Job ni l'enregistrement. Un nouveau résultat remet preservation.status à unrecorded, tout en conservant l'identité de l'ancien complet durable.
- failed contient un code stable et un résultat connu/inconnu. ANALYSIS_FAILED/INCOMPATIBLE verrouillent l'issue logique existante activity.outcome=failed/incompatible : un result tardif ou un terminal complete/partial de la même tentative sont refusés, sans effacer l'erreur ni promouvoir lastComplete. L'activité reste running/stop-requested et le nouveau départ reste BUSY jusqu'à une preuve d'arrêt physique corrélée ; cet arrêt ne relance rien. Une nouvelle tentative explicite avec nouvelle analyse/generation peut ensuite recevoir son propre résultat. Le guard d'état exige la cohérence entre cette issue logique échouée et result.status. STOP_UNCONFIRMED devient terminal/unknown et garde le nouveau départ.
- stopped rapporte un reason et stop=confirmed/unknown. Le coordinateur devra fournir une observation qualifiée de l'enfant et de ses descendants : le type ou la résolution d'une Promise n'en fournit pas la preuve.
- Un arrêt confirmé complete/partial exige un résultat correspondant de la même analyse et recontrôle le corpus au point terminal. Le dernier complet n'est remplacé que pour complete + sourceState=unchanged. Partiel, mutation, source inconnue, arrêt demandé/inconnu, échec et incompatibilité le préservent. Le partiel reste consultable dans result séparément de lastComplete.
- Après requestGraphStop, aucune arrivée de result ne devient un complet provisoire. Un événement terminal complete/partial dans cette phase est refusé ; annulation/timeout connus ou inconnus restent distincts.
- Rejet : GraphValidation.ok=false et issues localisables ; conserver la projection détenue. Toutes les sorties admises sont détachées des entrées, du contexte et entre result/lastComplete.

La policy ne contient aucun état métier global, classe de coordinateur, abonnement réel, I/O, horloge ou générateur d'identifiants.

## Restauration et conservation

restoreGraphState valide l'état sauvegardé et son scope courant, copie les résultats et retire toute fraîcheur revalidée. running/stop-requested deviennent historical avec outcome/stop=unknown ; les arrêts déjà inconnus restent inconnus et bloquent un nouveau départ concerné. Les terminaux connus deviennent historiques sans nouvelle vérification physique. Aucun port, commande, analyse, connexion, écriture ou réobservation n'est produit par la restauration. Une sauvegarde incompatible est refusée : le propriétaire existant gère alors sa lecture/erreur, sans interprétation du payload.

preservation est distinct de résultat, activité et fraîcheur. unrecorded/pending/stored/failed/unreadable restent des états de conservation ; durableAnalysisId peut nommer un ancien complet conservé alors que result est un nouveau résultat de session. La policy n'émet jamais de reçu stored. Le store existant doit garder l'ancien complet durable si une nouvelle sauvegarde échoue ; il ne doit pas sérialiser la nouvelle projection comme si elle avait déjà été enregistrée. Réessayer la sauvegarde ne refait aucune analyse. L'écriture atomique effective et son reçu sont à raccorder en4.4/4.7.

## Commandes, erreurs et port

Commandes déclaratives read/generate/interrupt/retry-save : version/corrélation, projet/périmètre, analyse seulement pour interrupt. Aucun chemin libre, exécutable, option native, flag d'admission, abonnement ou effet dans une commande. Lire n'autorise pas generate.

GraphAnalysisPort est une interface : analyze(request,observe,signal):Promise<void> et stop(request):Promise<événement stopped>. Les requêtes v1 portent les identités/corrélation/generation, et pour analyze le manifeste/la portée attendus. Aucun exécuteur, CLI, IPC ou stockage concret. Les callbacks futurs doivent repasser par les guards et la policy ; le fait qu'un abonné reçoive un événement n'en autorise pas la publication.

Chaque refus porte code stable, path ($ puis champs/index), messageKey=graph.error.<code en minuscules>. Les consommateurs localisent ces clés et gardent la récupération adaptée ; aucune chaîne native ou secret n'est promu dans l'UI. Codes de validation : INVALID_DATA, INVALID_SHAPE, INCOMPATIBLE_VERSION, INCOMPATIBLE_PROFILE, DUPLICATE_ID, INVALID_REFERENCE, INVALID_CONFIDENCE. Décisions de policy : CONTEXT_MISMATCH, CORPUS_MISMATCH, SUPERSEDED, EVENT_ORDER, INVALID_TRANSITION, BUSY, STOP_UNCONFIRMED. Les erreurs d'analyse déclarées sont ANALYSIS_FAILED/INCOMPATIBLE/STOP_UNCONFIRMED avec messageKey, outcome et recovery cohérents.

## Raccordements et limites

| Consommateur/propriétaire | Preuve et responsabilité restant à apporter |
|---|---|
|4.4 + projet/coordinateur/store existants|Une seule voie produit ; autorisation explicite, identités/faits attendus, gardes globales, ordre, Job/fermeture, stockage et erreurs. Attend2.8/2.14/3.9 ; aucun raccordement dans4.3.|
|4.5 adaptateur|Décodage natif réel, empreintes exactes d'assemblage/artefact, profils, direction, provenance et normalisation. Ni JSON ni HTML natifs à l'UI.|
|4.6 corpus/fraîcheur|Inventaire réel, liens/canonicalité, fichiers/lignes, non commité/non suivi, mutation et comparaison datée à la publication. Pas de fraîcheur par navigation.|
|4.7 cycle de vie/persistance|Arrêt/drain connus ou inconnus, réobservation qualifiée sans relance, reprise passive et sauvegarde atomique/échec réellement mesurés. Aucun garde global contourné.|
|2.8/4.8 fichiers et exploration|Nouvelle lecture explicite, revalidation au point d'effet, ouverture du même projet/révision ou refus, UI/liste/recherche/focus/zoom accessibles.|
|4.9/4.11|Paquet et qualification intégrée G5, machine cible, volumétrie, performances et preuve humaine selon les gates réels.|

Le banc inclut une fixture synthétique minimale pour mutations et un sous-ensemble normalisé statique du témoin qualifié matrix-006/G2-nominal : deux nœuds, une relation calls source→target, labels/fichiers/lignes réels et INFERRED0.85. Le second est nommé partial, ses identités/portée/ID de relation sont propres à la fixture et son JSON indique la provenance/hash exacts. Les tests lisent uniquement cette fixture locale, jamais Graphify, ses archives ou un projet réel. Ce rapprochement n'est ni un nouveau décodeur, ni un nouveau parcours natif. Les limites du profil4.1 restent inchangées.


## Corrections finales de cohérence

Les événements acceptés progress/arrêt inconnu reflètent les faits de source invalidants changed/unknown sans revalider un résultat antérieur ni modifier snapshots/arrêt. Une issue complete/partial exige un résultat de même statut, analyse et révision source ; la restauration refuse une association étrangère. Une nouvelle tentative running peut toujours conserver le résultat historique précédent. Les tests worker Q2/Q3 correspondent aux constats Quick Q1/Q2 ; worker Q1 est le constat high H1.
