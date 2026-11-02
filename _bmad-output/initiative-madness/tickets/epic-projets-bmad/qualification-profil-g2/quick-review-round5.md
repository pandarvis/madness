# Revue Quick — tour 5, 30 octobre 2026

Relecteur frais /root/g2_quick_final_v4, inspection seule du diff RRoUbj,
5830lignes/567420octets, SHA33989deac8c1f2173d14ee58b5cb4127e9d4ba36bd5f9c5527b1853c631e6879.
Aucun test/build/modification effectué par le relecteur.

- QV4-1 — prototype.py:405 : bounded_process attend UV sous60s seulement ; si UV sort pendant que Python conserve les pipes, les collecteurs restent dans read. Après join(2), close attend leur verrou. kill_owned n'est pas appelé dans ce retour normal, et son PID UV disparu ne possède plus le descendant. La coupure globale600s sauve le banc, pas la borne de l'appel.
- QV4-2 — verify.py:31 : le mode par défaut lit selected.run, ignore selected.manifest_sha256. Changer seulement la mise en forme du manifeste ne rompt pas ses hashes internes et peut encore produire current_qualification:true, malgré la référence de promotion cassée. Le vérificateur parent contrôle cette référence, pas le lecteur de reproduction.

Triage et décisions : parent, dans le plan.
