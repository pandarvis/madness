# Matrice intégrée personnelle — état après les essais natifs

Le paquet observé est celui du manifeste [final1.13](../qualification-forge-session-check/installation-final/release-manifest.json), version0.1.2, ASAR `9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4`. La refonte visuelle est un autre Build et un candidat distinct ; ses pixels ne sont pas attribués à ce paquet. Les scripts consignent leur propre révision et leurs empreintes, sans régénérer un manifeste historique.

## Matrice figée du plan1.11

| Ligne | Preuve exécutée et résultat | Limite conservée |
|---|---|---|
| Provenance | [Suite synthétique courante](synthetic-current-001/report.json) et trois runs personnels ci-dessous : identité/ASAR/runner/runtime vérifiés avant lancement. | Source du banc nommée séparément du programme. Ne pas attribuer la future refonte à cet ASAR. |
| Bancs isolés | Dix phases,75contrôles : Forge9, conversation10, questions10, approbations11, récupération9, vue commune8, expiration locale2, récupération loopback7, vue loopback4 et Windows5. | Profils synthétiques sans compte, fermeture/nettoyage constatés, vrais runners loopback distincts des appels externes. |
| Vrai BMad | [Parcours personnel002](personal-current-002/report.json),12contrôles : invocation Mary, Forge installé, journal et livrables relus, conclusion native HARDENED et38observations. | Idée et réponses synthétiques sous mandat ; aucun accord humain sur le produit ni catalogue général démontré. |
| Interactions | Même run : réponse native avec reçu brut exact, patch accepté avec tous effets relus, patch distinct refusé sans effet, contexte étranger et demandes tardives refusés. | Raw d’approbation exact s’il est fourni, sinon indisponibilité explicite et résultat/effets corrélés obligatoires ; question brute exacte toujours requise. |
| Expiration et inconnu | Suite synthétique : horloge locale contrôlée, restauration inactive et commandes tardives refusées ; loopback avec retrait de reçu, inspection réelle des effets inconnus, nouveau départ explicite. | Pas d’expiration autonome du runner ni de résultat natif déduit de l’inspection locale. |
| Arrêt/fermeture/erreur | Arrêt par pont dans le run002 ; [fermeture active001](personal-close-current-001/report.json),8contrôles ; [sortie inattendue002](personal-error-current-002/report.json),9contrôles. Identités/close/propriétaire durable/espaces absents vérifiés. | Seul l’enfant observé est arrêté pour la panne contrôlée. Aucun arrêt par nom ni reset d’une incertitude. |
| Réseau/TLS | [GET Main003](public-current-003/report.json) HTTP200 après le nouvel acquittement humain ; tours externes réussis avec runner0.144.6 et configuration HTTPS/TLS contrôlée dans les trois runs. | Accès/confiance du child inférés pour ces requêtes ; chaîne/CA non capturées. Aucune durée d’acquittement Zscaler inventée. |
| Réouverture/conservation | Les trois runs capturent le durable après shutdown, rouvrent avec textes/annexes/brouillons exacts, demandes inactives et compte lisible, puis observent3secondes sans moteur/réseau. | Aucune absence d’activité avant hook revendiquée. Pas de copie/lecture du coffre. |
| Fin d’essai | Trois témoins positifs archivés après réouverture et fermeture ; le témoin refusé a aussi ses [six contrôles propres](error-current-cleanup-001/report.json) avant archivage. | Dossiers témoins conservés aux chemins de preuve ; vrais projets/préférences préservés, aucune mutation de profil ouvert. |

## Exigences de l’epic

| Exigence | Preuves et conclusion bornée |
|---|---|
| R1 | Mary et Forge réellement installés, contexte/invocation et workflow avec livrables ; profil de référence qualifié, pas tout BMad v7. |
| R2 | Messages progressifs avant terminal, réponse à question et continuation corrélées ; identité attestée ou inconnue selon le reçu. |
| R3 | Approbation unique et refus distinct, portée intégrale et effets relus ; ajustement/expiration couverts par les tests propres et le scénario synthétique du paquet. |
| R4 | Projection commune, navigation exacte, états travail/attente/arrêt/erreur et récapitulatifs vérifiés par les bancs du paquet. |
| R5 | Brouillon sauvegardé explicitement, reçu exact, contexte étranger et commandes tardives refusés ; tests de navigation/saisie et double envoi verts. |
| R6 | Arrêt réel, fermeture active et erreur contrôlée, puis historique restauré ; inspection et nouveau départ explicite en loopback, sans reprise native promise. |
| R7 | Récapitulatif factuel et chemins observés dans la suite ; Forge relu sur disque. Fin de tour, clôture native et validation humaine restent distinctes. |
| R8 | Compte existant et capacités réelles, réseau contrôlé séparément ; erreur et récupération explicites. Les refus d’activation sont conservés ci-dessous. |
| R9 | Trois réouvertures exactes après shutdown, compte lisible, demandes inactives et absence d’activité dans la fenêtre instrumentée. |
| R10 | [Remplacement0.1.0→0.1.1](../qualification-maintenance/parent-verification.md) puis [installation finale0.1.2](../qualification-forge-session-check/parent-verification.md), avec conservation vérifiée ; ni auto-updater ni plage Windows élargie qualifiés. |

## Échecs et réserves

Les anciens essais0.1.1 et premiers refus/réseau restent inchangés, sans être convertis en succès. `personal-current-001` échouait avant moteur avec NETWORK_UNAVAILABLE et a son reçu d’archivage. Le nouvel essai `personal-error-current-001` échouait à l’activation Mary sur une lecture non prise en charge : [analyse et garde conservée](activation-refusal-current-001.md). Aucun défaut réseau ni cause exacte du choix du modèle n’est prétendu établi. La tentative distincte002 réussit le scénario complet ; elle ne garantit pas qu’un futur modèle n’émettra jamais d’appel non admis.

La dernière suite complète exécutée avant le correctif UX Q1 est354/354 sans saut, dont les tests du harnais ; types/build de ce workspace sont vérifiés séparément dans la refonte. La suite propre1.11 de343/343 avant cette refonte reste datée et conservée dans [son journal](full-tests-current-001.log). Les revues finales de1.11 et la consolidation de conservation restent à terminer avant de déclarer le plan built et G0/G1 clos au niveau technique. Ni essai humain global, ni G2–G5 étendus, ni catalogue complet, ni V1 entière déduits de cette matrice.
