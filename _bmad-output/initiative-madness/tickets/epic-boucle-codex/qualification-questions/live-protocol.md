# Parcours réel — questions 1.5

Protocole préparatoire, sans réussite déduite. Le spike de transport utilise un modèle simulé ; les contrôles ci-dessous nécessitent le vrai moteur et le vrai formulaire du paquet qualifié.

## Préparation

- Recontrôler l’absence de fenêtre personnelle avant lancement ; ne pas fermer une saisie non enregistrée. Le parcours pré-revue emploie le paquet qualifié avec le profil normal, sans installation préalable. Après revue, installer seulement l’archive identique au paquet testé, avec empreintes des données avant/après.
- Employer le compte propre à Madness déjà autorisé, sans copie de coffre ni changement de fournisseur/facturation. La dernière connexion réussie et la confirmation du JSON public sont acquises ; toute nouvelle difficulté doit être diagnostiquée précisément avant de solliciter le porteur.
- Ouvrir le nouveau témoin synthétique de `live-preparation.json`, sans remplacer un brouillon antérieur. Capturer le contexte initial pour restituer la sélection/navigation et préserver tous les échanges existants.
- Le banc contrôle uniquement la frontière du sélecteur de dossier et la restaure immédiatement. Les ponts, formulaires, demandes et reçus restent ceux du programme réel. Cette sélection ne qualifie pas le dialogue Windows natif ; G4 reste ouvert. L’observation du transport est passive et commence après connexion du contrôleur au Main.

## Contrôles

1. Qualifier le profil Mary puis lancer son accueil réel. Vérifier que le brouillon ne part pas avec l’invocation ; attendre le terminal réel du tour.
2. Demander explicitement une seule question structurée à deux options, sans secret ni autre workflow. Vérifier la demande réellement reçue, son contexte et le destinataire attesté ou inconnu ; la fin du tour ne doit pas être annoncée pendant l’attente.
3. Répondre depuis le vrai formulaire avec une valeur synthétique. Observer la soumission puis le reçu brut corrélé et structurellement identique. Un simple `serverRequest/resolved`, un flush stdin ou une prose du modèle ne vaut pas acquittement. Vérifier ensuite conservation du texte et continuation réelle du tour.
4. Faire une nouvelle demande distincte, saisir un nouveau brouillon lié à cette question, attendre sa conservation puis arrêter. Vérifier contrôle invalidé, ancienne réponse conservée et impossibilité de la rediriger ou de la renvoyer ; aucune reprise automatique ni replay.
5. Fermer et rouvrir : comparer textes, contexte, brouillons libres et structurés, annexes Forge et préférences. Les questions restaurées restent historiques et non répondables. Les activités dont le contrat prévoit la normalisation sont comparées selon cet état historique, sans assouplir les comparaisons de contenu. Aucun moteur ou réseau n’est lancé par la restauration.

Précision mesurée après le parcours : la fermeture d’une session déjà interrompue persiste l’activité `idle` après confirmation d’arrêt, et incrémente la révision. Le port synthétique reproduit `interrupted`→`idle` avec messages, contexte et brouillons strictement égaux. Ne pas comparer cette activité et la révision comme du contenu immuable. Le snapshot durable après fermeture doit, lui, être relu exactement à la réouverture, avant toute nouvelle sélection.

Les cas vide/double envoi, expiration pendant sauvegarde, ACK absent/incorrect, champs non couverts et disque refusé sont également exercés par les tests de matrice et le banc isolé ; ils restent étiquetés comme simulations. Ne pas multiplier les appels réels pour ces seuls cas techniques.

## Preuves et nettoyage

Rapport expurgé : version/empreinte du paquet et du runner, contrôles effectivement observés, acquittements et limites sans tokens ni données privées. Pas de capture du profil personnel ; les captures Impeccable utilisent les données synthétiques du banc isolé. Arrêter les seuls processus possédés ; nettoyer les profils jetables et aides inutilisées, conserver le témoin dès qu’il est lié à un projet, conversation ou brouillon. Les gates et la distribution restent distincts.
