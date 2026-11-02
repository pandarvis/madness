# Recontrôle ciblé de l'observation privée

2 novembre 2026. Inspection seule de `help22-observation-runtime.mjs`, `help22-personal-controller.mjs`, du scénario local et de son reçu `help22-observation-local.json`. Aucune exécution, aucun compte/modèle/réseau/application, aucune revue globale. Seul ce rapport est écrit.

La composition stdin et la persistance du refus sont corrigées. Le défaut de mesure initial décrit ci-dessous est désormais résolu par le recontrôle final ajouté en fin de rapport. L'accord reste limité aux mesures du banc privé ; il ne qualifie ni une fermeture native complète ni le run005.

## Défaut initial — résolu au recontrôle final

- `C:/Sources/madness/_bmad-output/initiative-madness/.working/help22-personal-controller.mjs:98` attend `session.observe()` avant de retourner l'état déjà lu. `PersonalSession.observe()` reste inchangé : un enfant non encore enregistré doit avoir une identité vivante (`scripts/qualification/epic-one-personal.mjs:108–111`). Si l'enfant sort avant cette première observation — ou apparaît et disparaît entre deux passages espacés de trois secondes — la lecture jette `NATIVE_IDENTITY_MISSING`. L'affectation de `report.dialogueDiagnostic`, ligne99, n'est alors pas atteinte et le catch peut annoncer l'erreur du banc à la place du refus natif. L'observation périodique réduit cette course sans traiter le cas post mortem.

Correction minimale proposée : conserver immédiatement le diagnostic de l'état lu et porter l'échec d'observation dans un champ distinct, sans remplacer le premier échec du dialogue. Traiter explicitement l'enfant déjà fermé avant première observation, avec identité vivante non acquise, événement close connu, absence courante mesurée et workspace exact contrôlé ; conserver unknown si une preuve manque, sans fabriquer d'identité ni arrêter un PID non identifié. Le scénario local à sept contrôles n'exerce pas ce chemin du contrôleur.

## Points vérifiés par inspection

- La dérivation ajoute seulement un appel d'observation au début de `inspect`, après vérification d'un marqueur unique. Le source évalué vient de la fonction importée par le parent ; aucun texte du projet ouvert ou du fournisseur n'est exécuté.
- Le remplacement de l'ancienne trace exige qu'elle soit vide, non attachée et restaurable. Le callback de persistance est rebranché sur la lecture globale de la nouvelle trace.
- Une seule enveloppe reste autour de `stdin.write`. Son code committé conserve `Reflect.apply(originalWrite,this,arguments)`, les objets/callbacks, la valeur de retour et l'exception d'origine. La nouvelle observation ne remplace pas le callback du produit. Le wrapper externe de spawn conserve également `this`, tous les arguments, l'enfant retourné et l'exception d'origine ; il ne pose plus de wrapper stdin.
- Les bornes de transport/trace centrale restent celles du code committé. L'observation help borne ses événements à300, ses demandes en attente à300, ses clés d'arguments à64 et ses identifiants textuels exportés à200 caractères. Les textes envoyés et les résultats d'outils sont hachés ; les valeurs libres d'arguments ne sont pas exportées. Une référence hors format n'est conservée que par hash, et son admission est distinctement indiquée. Ces fichiers ne doivent pas être présentés comme des reçus d'ACK : la comparaison avec les reçus produit reste nécessaire.
- La requête est persistée immédiatement, puis le succès/refus corrélé est persisté à son tour ; ce chemin ne dépend plus de la réussite de l'échange. Le catch lit aussi `failureHelpTrace`.
- Le catch du contrôleur conserve désormais `session.closeReceipts.at(-1)` et `closeFailure` lorsque `close()` jette après construction du reçu. Cela corrige la perte du reçu ; ses drapeaux doivent rester interprétés selon leur preuve. En particulier, l'ancienne Map vide ne doit toujours pas être assimilée à une mesure de tous les espaces.

Le reçu local fourni annonce sept contrôles passés et un nettoyage effectué. Le scénario lu vérifie les flux synthétiques, le buffer/callback/this, le retour de type booléen, les hashes/corrélations, la confidentialité de deux marqueurs et la restauration du wrapper unique. Il ne couvre ni le chemin de fermeture de `PersonalSession`, ni un vrai échange, ni la disparition précoce de l'enfant. Aucun résultat local ne répare rétrospectivement les preuves005.

## Recontrôle final du seul delta — constat résolu

Le sampler `sampleDialogueWithObservation` lit d'abord `session.dialogue()`, puis intercepte uniquement l'erreur de `session.observe()`. Il retourne le même objet d'état dans les deux cas. Une erreur de lecture de l'état natif reste propagée ; elle n'est pas remplacée par un faux état disponible.

Le contrôleur retourne désormais `sample.state` à sa boucle et conserve séparément jusqu'à huit erreurs dans `report.identityObservationGaps`. Une identité absente n'empêche donc plus l'affectation de `dialogueDiagnostic` ni ne remplace son `UNSUPPORTED_INTERACTION`. Le défaut ciblé d'occultation du diagnostic est résolu.

Cela ne fabrique pas la preuve d'identité manquante : l'observation finale et les assertions de fermeture restent strictes. Une fermeture insuffisamment observée peut encore échouer et doit rester non qualifiée ; cet échec reste maintenant distinct du résultat natif conservé.

Le scénario local ajoute deux cas portant sur l'identité des objets retournés : état d'erreur natif inchangé malgré une observation qui jette, puis état running inchangé avec observation réussie. Le reçu fourni annonce désormais neuf contrôles passés et `cleanup=true`. Aucun de ces contrôles n'a été exécuté pendant ce recontrôle.

**Verdict courant :** aucun nouveau défaut identifié dans ce seul delta. Accord limité aux mesures du banc privé et à la séparation diagnostic/gap d'observation. Aucune fermeture native, explication exacte du refus005, restauration produit ou qualification M14 n'est déduite de cet accord.
