
- precision_du_porteur: 2026-10-28
  sujet: Fonctionner avec Zscaler inchangé
  decision: Aucune demande de configuration ou de dérogation à l’IT ; la solution doit être cherchée côté Madness dans l’environnement réseau existant. Ne plus reproposer une intervention de l’IT comme dépendance de fonctionnement.
  pistes_non_qualifiees: Réduire les accès redondants aux clés publiques avec un cache borné et une gestion de leur rotation ; mieux diagnostiquer les blocages et conserver le travail en attente. Ces pistes ne prouvent pas la disparition des acquittements humains ni une autonomie complète.
  statut: Contrainte d’exploitation enregistrée ; à intégrer par Sofia au cadrage de tout lot de fiabilité réseau avant son implémentation. Aucun nouveau ticket, Build, changement d’authentification ou réouverture de l’epic1 par cette note.

- demande_du_porteur: 2026-10-27
  sujet: Étudier bmad-builder et surtout bmad-loop
  resultat: Étude terminée dans `research-bmad-loop-et-builder-pour-madness/research-bmad-loop-et-builder-pour-madness.md`. Loop candidat pour le développement autonome, Builder complément éventuel de création de modules ; aucune adoption, installation ou intégration effectuée.
  suite_proposee: Sofia peut cadrer un spike de qualification du profil v7/Windows, des mutations graphiques, de la confiance et des mesures ; Winston intervient avant modification des contrats partagés. Ce candidat ne modifie ni la 1.8 ni les dépendances existantes, et n’est pas un correctif du Refactor sweep.

- source_plan: `_bmad-output/initiative-madness/tickets/epic-boucle-codex/tickets/story-afficher-les-messages-et-l-activite-correlee-de-la-conversat-plan.md`
  summary: Après la clôture de l’epic 1, organiser un passage UX avec Sally et Impeccable, avant l’epic 2, à partir des retours du porteur et de l’application réelle comparée au prototype.
  evidence: Retour humain du 26 octobre 2026 : nombreux retours UI/UX annoncés et apparence actuelle jugée peu satisfaisante. La validation technique des lots ne constitue pas une acceptation visuelle globale ; aucun redesign n’est ajouté à la story1.4.

- source_plan: `_bmad-output/initiative-madness/tickets/epic-boucle-codex/tickets/story-afficher-les-messages-et-l-activite-correlee-de-la-conversat-plan.md`
  summary: Au passage Sally + Impeccable après l’epic 1, alléger l’action « Ouvrir un projet » et aligner la bascule de navigation sur les icônes du rail.
  evidence: Retour humain illustré du 26 octobre 2026, après la 1.4 : bouton d’ouverture jugé trop gros, préférence proposée pour une icône SVG animée ; bascule décalée par rapport aux autres icônes latérales. Capture conservée dans `_bmad-output/initiative-madness/ux-madness/feedback/2026-10-26-barre-actions.png`. Garder la bascule dans la barre de titre, sur la ligne des contrôles Windows, et centrer son icône sur le même axe vertical que celles du rail. Sally et Impeccable préciseront l’animation et la découvrabilité de l’ouverture ; conserver un nom accessible et vérifier le comportement avec réduction des animations. La passe complète après l’epic 1 est explicitement redemandée ; ces notes ne constituent ni une nouvelle maquette validée ni une correction déjà implémentée.

- demande_du_porteur: 2026-10-27
  sujet: Récupération réseau directement accompagnée dans Madness, au sein de l’epic1
  attendu: En cas de blocage identifié, afficher le lien public sûr avec Ouvrir dans le navigateur Windows, Copier le lien et une action explicite de nouvelle vérification après le clic Zscaler. Réutiliser PUBLIC_KEYS_URL et les aides existantes ; rendre leur accès évident depuis le lancement en échec.
  précisions: L’utilisateur confirme toujours le JSON après son acquittement Zscaler ; ne plus demander ce constat. Demander l’action seulement si un nouveau contrôle Main échoue. Ne pas confondre nouvelle vérification réseau et rejeu automatique d’un message/accord ou tour facturable ; aucun token/URL de callback à exposer.
  statut: À intégrer au cadrage du ticket de récupération approprié avant clôture de l’epic1 ; demande produit, pas correctif de revue différé.

- source_plan: `_bmad-output/initiative-madness/tickets/epic-boucle-codex/tickets/story-traiter-les-approbations-liees-a-l-operation-annoncee-plan.md`
  summary: Corriger au Refactor sweep l’assertion historique du test d’arrêt natif qui exige un exitCode même après une fermeture confirmée par signal.
  evidence: `tests/connection-probe.test.mjs:55`, inchangé depuis le commit parent, échoue dans la suite complète du27 octobre : stopNative retourne true (close observé), mais exitCode reste null après le recours permis à SIGTERM. Le test doit reconnaître la fermeture par exitCode ou signalCode sans allonger les délais ni transformer un arrêt non confirmé en succès. Première suite fraîche après N1–N3 :242/243 ; log `qualification-approvals/tests-receipt-final.log` conservé. Recontrôle isolé puis même suite à concurrence limitée consignés séparément ; aucune correction produit réalisée sur ce point.
