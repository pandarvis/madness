# Reprise2 — octets, résolution et démarrage effectif

Deux revues fraîches terminées ; six constats vérifiés par le parent et triés dans le plan (cinq des relecteurs, un complément parent). Pas d’intention à renégocier : corriger les garanties du même profil candidat, sans produit, fournisseur ni configuration réelle modifiée.

Le tour précédent107fichiers est intégralement archivé dans `iteration-1.zip`, SHA256`dd86933f293a98587dc6585d11b46c76029eb283a40727bdc8a94a5779bb31a2`. Les cinq runs restent aussi à leurs chemins et doivent rester bit-identiques. Le parent a retiré seulement dix fichiers actifs (six Python, run.ps1, sources-lock, profil et sources) pour re-dérivation. Leur code est disponible dans les snapshots des runs et l’archive ; ne pas exécuter l’ancienne voie. `iteration-0.zip`, revues, .gitattributes et notes parent restent sous propriété du parent.

## Cohérence à prouver

`context(project, config)` acceptait une résolution indépendante des octets. La fixture M8 injectait alpha en mémoire sans la déclarer dans ses fichiers. Une mutation entre snapshot résolu et collecte associait donc une ancienne initiative à de nouvelles empreintes, et `fresh_context` pouvait la garder fraîche. Lire les couches sûres, les parser et utiliser `config_utils.merge_layers` officiel sur ces mêmes octets, ou résoudre leur snapshot privé sûr. L’initiative/output doivent venir de cette résolution. Une valeur attendue fournie séparément n’a aucune autorité et doit être comparée/refusée si différente. Recapturer et résoudre à chaque contrôle ; prouver modification entre résolution initiale et collecte, puis actualisation correcte beta, à skills inchangées. Ne pas écrire la configuration du vrai projet pour ce test.

## Runtime effectif à prouver avant le premier UV

Le pin produit0f3… couvre734fichiers dans son périmètre. Il ne couvre pas les formats `.pyw`/`.pyc` ou les caches `__pycache__`. CPython lit un cache valide avant de tester `dont_write_bytecode` pour l’écriture : `-B` ne neutralise pas sa lecture. Des caches existent, dont ctypes. Sous Windows `.pyw` est également importable. Les gardes startup précédentes ne couvraient pas `Lib/sitecustomize.pyw/.pyc` ; la phase UV à site actif pouvait les charger.

Qualifier une voie cohérente avec les seules entrées exécutables admises et verrouillées, avant UV comme dans ses workers. Le plan laisse choisir entre complément d’empreinte effective complet et copie de runtime possédée fermée, sans caches/formats non admis. Ne pas simplement étendre une description : prouver les refus sur copies/données sans activer de charge. Un runtime copié de provenance maîtrisée n’est pas un script fourni par le projet analysé ; ses octets admis doivent tous être vérifiés avant exécution et les variantes de fixtures rester refusées.

Deux emplacements `pyvenv.cfg` influencent aussi le démarrage : base et parent (site.py523–551). Refuser les deux **avant** le premier UV, ainsi que dans les probes. Sous Windows `getsitepackages` inclut le préfixe lui-même et `Lib/site-packages` (site.py367–405) : les `.pth` ordinaires à la base ne doivent pas être oubliés au profit du seul python*._pth. Couvrir Lib/DLLs et les formats startup importables selon la voie retenue. Sources locales primaires déjà vérifiées ; source UV0.13.0 déjà citée pour -I/-B sans -S. Aucune édition du vrai runtime, hook ou cache pour les tests.

## KEEP et preuves

Préserver les cas positifs/négatifs M1–M15, les refus canoniques/NTFS avant lecture, appartenance réciproque, erreur roster sourcée, aide chargée séparée de la recommandation, preuves de tickets séparées et persistantes, contexte borné avec reçu propre, sorties/temps bornés, uv offline prescrit, reçus/scellés create-only, nettoyage et558inputs inchangés. Un reçu historique valide ne prouve pas une capacité courante : adapter explicitement les versions/lectures de preuve, sans réécrire les anciens runs ou les qualifier rétroactivement.

Les nombres du tour précédent restent historiques : trois runs gardés125assertions/21observations dont la relance parent5314…, deux runs112assertions/20observations, tous15/15 ; ils ne prouvent pas les nouveaux cas. La sélection corrigée future sera explicite. Ne pas refaire deux reproductions complètes après chaque modification intermédiaire : terminer le code/contrats, exécuter les nouveaux cas puis un run complet ; une reproduction indépendante clôturera les octets finaux. Le parent relancera la matrice et les deux revues ensuite.

Le worker possède les nouveaux fichiers actifs de qualification et les notes/tâches du plan hors bloc figé. Il n’est pas seul : conserver les travaux, archives et rapports du parent, ne rien annuler. Parent responsable des revues, continuité et commits. Aucun autre sous-agent d’implémentation, aucun nouvel agent fournisseur, réseau ou projet personnel à solliciter.
