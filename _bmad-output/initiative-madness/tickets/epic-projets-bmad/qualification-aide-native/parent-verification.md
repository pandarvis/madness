> Mise à jour du3novembre2026 : **2.2 built, M14 passée sur candidat010 /0.2.7**. [Rapport actuel](reprise-2026-11-03/parent-verification.md), [vérification structurée](reprise-2026-11-03/verification-current.json). Les paragraphes ci-dessous restent les preuves historiques du2novembre ; leurs états ouverts ne sont plus le statut courant. Aucun succès rétroactif005 déduit.

# Story 2.2 — vérification parent

État courant au3novembre2026 : **2.2 in-review**, refonte finale0.2.6 réunie dans `5e4777b`, qualification locale réussie, M14 réel encore ouvert derrière307Zscaler. Voir [la reprise documentée](integration-atelier-026/parent-verification.md). Aucun nouveau modèle ni demande humaine en attente. Les paragraphes ci-dessous décrivent le candidat005 historique et ses revues ; ils ne transfèrent pas leurs preuves à0.2.6 et ne rendent pas la refonte inachevée.

## Parcours livré dans le candidat

Ouvrir un projet BMad qualifié, choisir Parcours puis « Voir les aides ». Le diagnostic, les modules couverts et les limites précèdent « Demander à BMad ». La consultation locale n’utilise pas le forfait et ne transmet pas le brouillon libre. Le lancement explicite utilise une nouvelle conversation Codex et la question dédiée « Que faire ensuite ? ». Aides locales, transmission native, réponse brute et conservation restent distinctes ; la réouverture passive ne relance aucun outil, modèle ou réseau.

Version0.2.0, dépendances inchangées. Candidat005 : ASAR2583aebcffd14d7193e2bf0fdd8b7824f8b9396bb51eaac1ea2a0807a0e9d90a ; setupdfb5158badf3770196a094ec7cc6713032760c052bbf21d098821900caf1aa5f. Voir release-manifest-005.json et resources-and-presentation-005.json. Les manifestes sans suffixe et natif003 désignent leurs anciens candidats, sans équivalence de paquet implicite.

## Revues et corrections

Quick du Build et contrôle indépendant high sur le diff depuis a93f50a ; cinq constats, quatre racines corrigées puis recontrôlées résolues par leurs relecteurs :

| Groupe | Constats conservés | Correction |
|---|---|---|
| G1 | H1 high | Règlement et libération inconditionnels même si l’observation du propriétaire rejette ; unknown reste bloquant. |
| G2 | Q1/H2 medium | Initiative requise et absence de sortie suivies en fraîcheur ; aide indépendante conservée, recommandation refusée si nécessaire. |
| G3 | Q2 medium | SKILL/help primaire trop grand diagnostiqué sans annuler les aides indépendantes ; autres refus de sécurité fatals conservés. |
| G4 | Q3 medium | Premier texte utilisateur exact, skill et question dédiée, conservé dans Snapshotv1 sans migration. |

Rouge conservé puis helper2/2, dialogue22/22 et worker42contrôles verts ; aucun constat restant. Les mêmes relecteurs ont aussi vérifié les trois lignes du delta de délai useful60→120s, outer180→240s et pin launcher sans nouveau constat. Stop5s/drain3s/retour1s et inconnues inchangés.

## Provenance et vérifications établies

- runtime-735-verification.json : copie fermée735fichiers, garde avant premierUV et dansPython, aides des trois modules et JSON natifs exacts, Job arrêté et copie retirée. Python3.12.14/bundle26.1026.10807 ; date et version antérieure du remplacement externe inconnues. runtime-signatures.json :40PE modifiés avec signatures OpenAI valides. Le ssl.py courant garde les quatre lignes Codex de rejet CA ; PEM906octets épinglé c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718. Aucun cache externe modifié ni repin automatique.
- Mary/Forge legacy : même source runtime qualifiée explicitement, filtre historique conservé, empreinte eaffa289643c1f9f91e7f32a23d06025988ee7e2b7efc0a12298a0997e626e40 et pinPEM explicite avantUV. Refus rouge ancienpin puis rouge PEMaltéré ; correctif et deux tests runtime/quatre résolveurs existants verts. Ne pas attribuer à cette voie historique la copie fermée du nouvel outil.
- owner-write-failure.json : vraie destination Windows en lecture seule, unknown conservé sur échec d’écriture puis preuve réobservée explicitement, sans processus/fournisseur. Frontières Windows jonction, hardlink, remplacement d’ancêtre/handle et chemins longs exercées ; symlink fichier non exercé, aucun privilège demandé.
- build005.log/package005.log et audit005 : types, compilation, NSIS,13ressources identiques au source et à l’index,5copies natives exactes,735entrées runtime, bloc figé69afc7ca9d922429a2f00d0754df703469bffeb8581b7f422c251a4df486ca73 et dépendances inchangées. Cinq fichiers renderer/preload strictement identiques au paquet003.
- windows-compiled.log et windows-package004.log :5contrôles chacun avec nettoyage confirmé. La preuve paquet reste celle de004 ; aucune exécution Windows005 n’est inventée par cette comparaison.
- visual003/ et impeccable-documentation.md :24vues synthétiques,14interactions, F1/F2/F3 résolus, verdict ship ciblé. Finish/documenter techniques frais ayant lu les définitions officielles, sans persona Sally revendiqué. Détecteur exécuté une seule fois : []. Les fichiers de présentation sont identiques dans005 ; les PNG ne sont pas renommés en captures005. Spines conservés, dérive documentaire préexistante signalée sans migration.

## Couverture finale consolidée

global-diagnostic-initial.log garde387tests,371passés/16échoués,0skip. Quatorze échecs provenaient du pin legacy remplacé, deux de locateurs UI obsolètes ; ce run reste rouge. recovery-ui-locators.log établit ensuite les deux locateurs corrigés verts.

Le fichier UI inchangé contient39cas :37passés dans ce diagnostic et les2locateurs repassés2/2. Tous les fichiers backend/contrats/qualification ont été réexécutés après gel, concurrence2 :351/351passés,0fail/0cancelled/0skip,643619,935ms. backend-final.log et backend-test-files.json conservent la commande couverte ; verification-current.json récapitule390cas distincts avec les39UI consolidés. Quick et high ont vérifié cette consolidation : aucune dépendance concrète ne justifie de répéter les37cas UI inchangés. Aucun test retiré, ignoré, attente affaiblie ou commande globale unique déclarée verte. Le log final est conservé. Le commit local de sauvegarde reste en-review et ne vaut pas clôture du scénario M14.

## Essai personnel final et réseau

native003-historique/ établit un véritable échange Codex/SIWC, six groupes de contrôles, aides/config/contextes reçus, réponse et alternatives réelles, arrêt puis restauration passive, témoin archivé. Son ASAR81591937f9868bc6f5f00cbf132c9ab1326eb16d075d512a2a86ff1e1c56fc22 précède les derniers correctifs : ce succès ne clôt pas005.

native004-local-timeout.json garde le refus utile60s pendant la dernière fraîcheur, groupe finalement Job0/stopped, sans modèle/réseau. La préphase observée environ64s n’est ni une garantie ni un SLA. deadline-diagnostic-negative.json reste un échec Temp agrégé ; aucun succès en120s ni attribution à la limite utile du Job n’en est déduit.

native005-network-failure.json : aide locale réellement prête et fraîche, trois modules/84sources, aucune utilisation fournisseur pour la consultation. Le lancement explicite échoue NETWORK_UNAVAILABLE avant tout enfant/tour modèle ; fermeture normale prouvée, témoin possédé encore lié avec son seul brouillon. Aucune conversation existante à rejouer. network005-zscaler-307.json mesure un nouveau GET Main307versZscaler à13:46:29UTC le2novembre2026. Le lien public fixe a été ouvert dans le navigateur Windows ; le porteur a ensuite confirmé son acquittement, honoré par le GET200 de network005-after-ack-200.json à14:04:44UTC. Les anciens clics sont consignés, aucun JSON ni jeton demandé et aucune expiration inventée. Le libellé privé « candidat préliminaire » de ce rapport est historique ; son champ artifact porte exactement le hash005.

La reprise suivante du même005 a réellement transmis knowledge/config/required-context et cinq lectures source. Après200deltas, le protocole refuse une requête avec UNSUPPORTED_INTERACTION ; aucun nom/arguments intégral n’a été conservé pour cette demande par l’ancien observer. native005-protocol-failure.json et native005-protocol-trace.json gardent cet échec : enfant fermécode0 mais reçu de fermeture refusé, restoreConflict du banc. Madness et workspace ont ensuite été observés absents ; cela ne transforme pas ce reçu en succès. Le témoin possède désormais un échange partiel et ne doit plus être rejoué. Diagnostic Quick en lecture seule et réouverture passive avant nettoyage/reprise requis. Aucune nouvelle action Zscaler/OAuth en attente.

## Limites et suite

Profil personnel local Windows/Codex/SIWC et BMad de référence seulement. Compte, projets et brouillons réels conservés ; aucun nouveau consentement OAuth, copie de coffre, jeton transmis, modification Zscaler ou demande IT. Pas de conformité WCAG, acceptation visuelle humaine globale, portabilité générale ou capacité des stories suivantes déduite. Les durées de qualification ne sont pas un registre temps/coût de notre développement.

La2.2 reste in-review tant que M14 sur005 n’est pas clos. La refonte atelier approuvée est préparée séparément par Sally avec sept assets originaux ; aucun skin ni story2.3 n’est lancé par ces preuves.


Inspection Quick supplémentaire : huit reçus natifs exacts sont conservés (knowledge,config,required-context,source-79,source-80,source-83,source-82,source-84). La requête153 est refusée154 ; son nom/arguments exacts ne sont pas récupérables dans l’ancien traceur. Deux limites du banc sont établies : absence d’observation périodique avant décès de l’enfant, puis conflit de restauration de deux wrappers stdin imbriqués. Cela ne prouve ni fuite produit ni altération du protocole ; une mesure du nom/forme de la requête et une composition correcte des observateurs sont requises avant nouvelle tentative, sans élargir les outils admis.
