# Correctifs Quick Q1/Q2

Q1 : bmad-progress.reconcile parcourt les scopes déjà armés, y compris ceux sans lease, pour reprendre une incertitude ou une lecture en attente. La récupération reste qualifiée et regroupée ; les gardes et le démarrage passif sont inchangés.

Q2 : consultSelection attache et rapproche le lease de la nouvelle observation avant publication, puis remplace et ferme le précédent. Racine, génération, sélection, fermeture et signal sont recontrôlés après les attentes ; les leases non publiés sont fermés. Historique capturé et schémas durables inchangés.

Trois régressions reproduites rouges puis vertes ; trois barrières supplémentaires racine/génération/sélection. Les quatre fichiers ciblés passent **52/52**, sans saut. Noms exacts et commandes : [verification.json](verification.json). Les logs communs Q1/Q2 sont [rouge](../logs/quick-context-recovery-red.log), [vert](../logs/quick-context-recovery-green.log) et [ciblés finaux](../logs/quick-context-recovery-targeted.log).

[Diff produit borné](product-delta.patch) comparé aux deux sources exactes de main-focus-final/producer/ ; les seuls changements produit sont les méthodes demandées. Sources/tests remis sous producer/ avec empreintes.

Aucun build, NSIS, natif, suite globale ou GUI lancé pour ce patch. Les tests combinés utilisent une vraie écriture dans un Temp possédé et un port de surveillance contrôlé, sans prétendre qualifier les notifications natives. Le candidat empaqueté16b2f339 et ses reçus restent historiques ; ces nouvelles sources attendent la vérification impactée et le paquet du parent. Aucun processus possédé actif.
