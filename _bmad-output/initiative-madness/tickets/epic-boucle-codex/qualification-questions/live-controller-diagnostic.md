# Diagnostic du premier lancement du contrôleur

`live-controller-first-attempt.json` conserve intégralement l’échec précoce. Aucun contrôle, lecture du compte, sélection du témoin, invocation Mary, question ou réponse n’a été atteint : l’exception précède l’obtention de la page. Le banc n’a pas confirmé la fermeture à cet instant ; le contrôle externe ultérieur ne trouve aucun processus Madness. Aucun processus étranger n’a été fermé.

L’inspection de Playwright installé montre que les callbacks `ElectronApplication.evaluate` passent par le contexte UtilityScript sans callback d’import dynamique. Le contrôleur utilisait `import()` dans ce contexte. Il supposait aussi l’égalité entre le PID du processus retourné et celui du Main, alors que le lancement Windows peut interposer le shell. Ces défauts concernent le banc, pas une capacité native de Madness.

Réparation confiée au même implémenteur : accès aux modules intégrés via l’API Node disponible, validation du véritable `process.execPath` et de l’ASAR chargé, fermeture indépendante de la disponibilité de la page et du hook passif. Le produit, le paquet et les tests192/192 sont inchangés.

Une nouvelle tentative contrôlée ne rejoue aucune demande ou réponse : la première n’a pas franchi le démarrage de l’instrumentation. Le même témoin neuf et encore non lié reste utilisable. Les éventuels échecs suivants doivent conserver leurs propres preuves et être réévalués avant toute reprise.

Deuxième tentative : `live-controller-second-attempt.json`, arrêt propre confirmé, aucune lecture du compte ni lancement fournisseur. Le diagnostic isolé `live-asar-diagnostic.json` mesure une lecture du bundle chargé réussie et une lecture de la racine ASAR refusée `ENOENT` par le fs Electron. Ce profil sans compte est nettoyé. Le contrôle archive est déplacé dans le fs Node du contrôleur, après validation du chemin fourni par le Main ; le Main calcule séparément l’empreinte de son bundle chargé. Les deux origines sont nommées dans le rapport. Aucun réglage d’intégrité du produit n’est désactivé.

La tentative suivante a franchi ces vérifications et atteint le compte existant puis la préparation Mary. Son succès éventuel ne sera établi que par `live-profile.json` final. L’accès Computer Use au dialogue du profil isolé a expiré pendant l’approbation de l’application ; aucun clic ni automatisation UI de repli n’a été effectué. Le diagnostic finalement retourné par le processus possédé et son nettoyage restent la preuve technique retenue.

## Parcours natif positif, fermeture et restauration séparée

`live-profile.json` conserve six contrôles positifs : accueil Mary durable, deux demandes natives distinctes, réponse Q1 avec reçu brut exact puis poursuite du vrai modèle, brouillons Q2/libre séparés, arrêt confirmé et réponse tardive refusée. Un seul processus natif est lancé puis fermé ; une seule réponse est soumise, aucune réponse Q2. Les identités des demandes restent inconnues lorsqu’elles ne sont pas attestées.

Le contrôleur s’arrête ensuite sur `CONVERSATION_CHANGED_DURING_CLOSE`, après restauration de la sélection/navigation/taille et fermeture confirmée. Le port synthétique en mémoire reproduit précisément la différence : `lastKnownActivity=interrupted` devient `idle` dans `shutdown.stop()`, révision augmentée de1, contexte/messages/brouillons égaux. Ce champ représente l’activité ; il ne justifie pas de relâcher les comparaisons de contenu. La transcription synthétique a été figée avant cette fermeture.

La réouverture est donc vérifiée séparément, sans aucun nouveau moteur, question ou réponse. Son rapport doit comparer le snapshot durable post-fermeture et les annexes exactes, ainsi que la transcription du témoin ; le rapport natif initial n’est ni écrasé ni présenté comme un parcours intégralement vert.
