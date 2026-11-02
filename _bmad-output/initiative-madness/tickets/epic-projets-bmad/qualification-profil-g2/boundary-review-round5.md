# Audit indépendant des frontières — tour 5, 30 octobre 2026

Relecteur frais /root/g2_boundary_final_v4, rôle technique Security Engineer,
inspection seule du même diff RRoUbj et des sources environnantes.

- BV4-1 — prototype.py:405–413 : même blocage de bounded_process après mort du seul UV avec descendant Python tenant les pipes. proc.wait revient, collecteurs restent dans read, join2s expire puis close peut attendre le verrou du BufferedReader. run_tool/runtime_probe/source-inspection utilisent cette voie distincte. Le Job Object extérieur arrête finalement les descendants, mais un appel peut consommer600s malgré sa borne annoncée60s. Qualifier le véritable bounded_process, pas seulement Invoke-G2Supervised.

Triage et décisions : parent, dans le plan. Aucun persona BMad attribué.
