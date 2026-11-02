# Revue Quick — tour 4, 30 octobre 2026

Relecteur frais /root/g2_quick_final_v3, inspection seule du diff LGnpT5
(4415 lignes, 417242 octets) et de ses sources/contexte ; aucun test exécuté.

- QV3-1 — run.ps1:24 crée le reçu puis execution.json sans contrôler la chaîne de runs/ ou logs/. Une jonction préexistante redirige les écritures hors racine, sans course. La garde des sources et le contrôle lexical ultérieur du parent ne protègent pas cette destination.
- QV3-2 — supervision.ps1:86 attend GetResult() des pipes sans délai après la sortie du processus racine. Un descendant survivant qui garde un pipe hérité empêche EOF ; HasExited exclut la tentative de kill, finally n'atteint ni nettoyage ni état terminal. Le probe actuel n'exerce pas ce parent mort avec enfant vivant.

Triage et décisions sont sous la responsabilité du parent, dans le plan.
