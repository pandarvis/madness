# Audit indépendant des frontières — tour 4, 30 octobre 2026

Relecteur frais /root/g2_boundary_final_v3 (rôle technique Security Engineer),
inspection seule du même diff LGnpT5 et des sources environnantes ; pas de
persona BMad ni test/build exécuté.

- BV3-1 — prototype.py:488 parse les couches centrales avec parse_text (utf8-sig/newlines), mais config_utils.load_toml utilise tomllib.load sur rb. BOM et CR isolé sont acceptés par le contexte alors que le chargeur natif refuse. M13 concerne les lecteurs tickets, pas cette sémantique binaire centrale.
- BV3-2 — supervision.ps1:86 : même chemin de blocage des collecteurs que QV3-2 après mort du lanceur UV avec enfant Python conservant les pipes. Le délai WaitForExit ne borne pas cette vidange ; le finally ne termine pas.
- BV3-3 — verify.py:77 : les clés bench d'un schema3 historique non scellé passent directement à digest(run/item). Une clé absolue ou ../ permet une lecture extérieure non bornée ; les branches historiques is_file suivent aussi les liens. resolve_run protège le dossier, pas ces fichiers ; le retour anticipé évite evidence.verify.

Triage et décisions sont sous la responsabilité du parent, dans le plan.
