# Audit de matrice — story 1.5

Contrôle parent sur le bloc approuvé, inchangé : SHA-256 `d9c3f06820580d2823322208ddccc8c73c33a687811cbf2860e64b7b6de82d6f`.

Exécution finale de référence : `tests-final-after-review.log`, 196 tests réussis, zéro échec, zéro test ignoré ou filtré. Les noms ci-dessous figurent dans cette sortie ; les bancs compilé et paquet ajoutent chacun dix contrôles réussis, sans fournisseur. Les passages à191 puis192 précèdent les corrections de revue.

| Ligne approuvée | Tests exécutés et comportement vérifié |
|---|---|
| Question | `contrat question refuse les secrets, IDs natifs, valeurs vides et champs étrangers` ; formulaire UI : champs/options distincts, aucune option précochée, contexte et destinataire attesté ou inconnu ; protocole `secret` refuse le profil sans réponse. |
| Envoi | `question active admet une réponse pendant le tour, un seul envoi, ACK et écriture durable avant sent` ; `RPC zéro conserve son type ; seul raw exact corrélé confirme la réponse après écriture` ; formulaire UI à double clic ; cas protocole `mismatch` et `absent`. |
| Invalidation | `invalidation pendant sauvegarde garde la saisie et interdit tout transfert vers une autre demande` ; cas protocole `stop` et `expiry` ; questions concurrentes et terminal pendant saisie ; formulaire UI : ancienne saisie distincte de la nouvelle demande. |
| Restauration | Annexe atomique : refus des versions/UTF-8 et conflits sans écrasement ; conservation refusée après reçu ; envoi inconnu historique à chaque réouverture ; bancs réels Main/preload/renderer : snapshot, annexes, brouillons et fichiers témoins conservés, aucune reprise du moteur/réseau. |

Régression supplémentaire effectivement passée : `arrêt pendant écriture durable du reçu garde l’invalidation et la même projection que le disque`. Aucun événement `sent` après invalidation, UI/annexe identiques, texte conservé et une seule transmission.

Les régressions de revue sont aussi exécutées dans les196 : état inconnu conservé par QuestionStore réel et restauré ; refus disque explicite ; question en file retirée avant drain puis vrai tour suivant ; indicateurs UI cohérents pour identité inconnue/attestée et envoi. Parcours final `live-final-profile.json` : huit contrôles réussis avec vrai moteur, dont arrêt et réouverture. `installed-reopen-profile.json` : six contrôles de lecture/restauration, compte chiffré inclus, sans fournisseur. Voir `installation.json` pour la portée exacte du remplacement contrôlé.

Les tests de protocole utilisent un serveur simulé ; le spike distinct utilise le vrai runner avec modèle loopback simulé. Ni ces tests ni les notifications UI synthétiques ne sont présentés comme le parcours avec le vrai modèle. Celui-ci est consigné séparément dans `live-profile.json` après son exécution effective.

La relecture parent du diff inclut les contrats, connecteur, cœur, stockage, Main/preload, renderer, textes, tests, banc et documentation. Les preuves générées sont contrôlées par leur contenu utile et les captures par la revue de finition ; les données privées du profil personnel restent hors du diff.
