# Audit high frais — reprise1

`/root/g2_boundary_v1`, rôle technique Security Engineer, lecture/hachage seuls. Aucun test, banc, build, skill, édition ou sous-agent. Deux constats ouverts sur B1 :

- `run.ps1:19` ne refuse pyvenv.cfg qu’à la base. Le site.py épinglé523–551 recherche aussi le parent et charge ses site-packages pendant l’inspection UV à `-I -B` sans `-S`, avant `select_base`. Même manque dans la voie de probe. Contrôler les deux emplacements avant le premier lancement, sur fixtures sans activer de hook.
- `runtime_guard.py:25`/`run.ps1:46` ignorent .pyw/.pyc et __pycache__, tandis que la garde startup ne contrôle les noms sitecustomize que dans base/site-packages. Un `Lib/sitecustomize.pyw` reste importable par Windows et hors garde ; legacy .pyc est une variante. Couvrir tous les formats/chemins effectifs ou utiliser une copie possédée fermée aux seuls octets exécutables verrouillés.

Déclencheurs statiques, aucune charge hostile réelle observée ou exécutée. B1 partiellement résolu ; B2 roster résolu pour le cas testé et B3 plafond/révision résolu pour son constat initial. Les gardes canoniques/NTFS et la séparation descriptif/copiable/lançable restent cohérentes ; contrats candidats seulement.

Les15payloads de chacun des runs c719…,2602… et5314… concordent avec leurs manifestes, code/pins actuels identiques à c719…. Aucun G2 intégré ni garantie OS universelle déduits.
