# Audit indépendant des frontières — reprise2

30 octobre2026, `/root/g2_boundary_v2`, rôle technique Security Engineer, inspection seule, aucun test/banc/build/gate/skill/modification/sous-agent. Un constat vérifié :

- `prototype.py:419`, ticket_proofs transmet le texte brut UTF-8 au parseur de frontmatter. Une feuille/plan Windows CRLF ou BOM passe les gardes mais produit fields={} : tickets.py:77 attend ---\n au début. load_folder passe par read_text:178 qui retire le BOM et normalise les fins de ligne. Le statut fusionné peut être affiché alors que leaves/plans/trackers omettent ces sources, cachant la contradiction M13. Les octets bruts restent dans files, mais leur preuve structurée disparaît silencieusement. M13 couvre seulement LF sans BOM. Conserver les octets/hashes exacts et normaliser la seule vue de parsing selon la lecture officielle ; couvrir CRLF et BOM.

Aucun autre constat vérifié sur les frontières examinées. Le constat concerne le spike hors produit, pas l’application installée. Diff relu SHA25684c0657c78636f430251d9b931a900257960195d9bb536598b1041862e80cd42. Triage par le parent dans le plan.