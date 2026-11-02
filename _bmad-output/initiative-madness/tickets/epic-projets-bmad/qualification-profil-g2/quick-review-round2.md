# Revue Quick fraîche — reprise1

`/root/g2_quick_v1`, inspection seule du diff vIwk1w et de ses contextes. Trois constats vérifiés et triés par le parent dans le plan :

- `prototype.py:455` : `resolved_config` fourni indépendamment des octets capturés. M8 fournit alpha sans configuration alpha sur disque ; M1 peut subir une mutation entre résolution du snapshot et collecte. `fresh_context` reprend ensuite l’ancienne résolution et peut la déclarer fraîche.
- `runtime_guard.py:23` : les caches `.pyc`/`__pycache__` ne sont pas épinglés alors que CPython les lit et les exécute avant le test `dont_write_bytecode` consacré à l’écriture. Des caches, dont ctypes, existent réellement ; la copie M15 ne couvre pas cette voie.
- `run.ps1:19` : le refus initial de pyvenv.cfg ne couvre pas le parent, contrairement au contrôle Python ultérieur. La requête UV à site actif intervient avant ce refus tardif ; M15 ne teste pas ce chemin préalable.

Aucune correction déduite du seul plan : reprise2 et nouveau recontrôle requis. Les sources et reçus exacts du tour sont archivés par le parent dans iteration-1.zip ; anciens runs conservés.
