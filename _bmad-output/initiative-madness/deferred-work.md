
- precision_du_porteur: 2026-10-28
  sujet: Fonctionner avec Zscaler inchangé
  decision: Aucune demande de configuration ou de dérogation à l’IT ; la solution doit être cherchée côté Madness dans l’environnement réseau existant. Ne plus reproposer une intervention de l’IT comme dépendance de fonctionnement.
  pistes_non_qualifiees: Réduire les accès redondants aux clés publiques avec un cache borné et une gestion de leur rotation ; mieux diagnostiquer les blocages et conserver le travail en attente. Ces pistes ne prouvent pas la disparition des acquittements humains ni une autonomie complète.
  statut: Contrainte d’exploitation enregistrée ; à intégrer par Sofia au cadrage de tout lot de fiabilité réseau avant son implémentation. Aucun nouveau ticket, Build, changement d’authentification ou réouverture de l’epic1 par cette note.

- source_plan: `_bmad-output/initiative-madness/backlog/spike-qualifier-cache-et-recuperation-reseau-plan.md`
  sujet: Intégration éventuelle du cache et du diagnostic réseau qualifiés isolément
  resultat: qualification-cache-reseau/rapport.md borne le gain local de GET, le contrôle forcé no-store et le refus de persistance non fiable.16tests et banc Electron, Q1corrigé/recontrôlé, revue sécurité favorable ; aucune diminution réelle des acquittements Zscaler ni cache livré démontrés.
  suite: Cadrer un lot d’intégration distinct avant toute modification produit : en-têtes serveur réellement exploitables, fraîcheur/retrait, précontrôle de chaque intention, contrôle réseau contournant les caches, états de rotation reçue/non validée/inconnue et conservation/crash. Les POST nécessaires et les contraintes du moteur restent des accès réseau. Aucun changement Zscaler/IT ; ne pas substituer une connexion ou un coût API.
  statut: Pistes et limites conservées pour une intégration ultérieure ; aucun correctif de revue différé. La demande actuelle enchaîne sur2.1, sans ajouter une dépendance artificielle ni modifier ses17entrées.

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

- source_plan: `_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/story-lire-le-parcours-et-ses-preuves-a-la-bonne-revision-plan.md`
  summary: Qualifier puis réduire la latence de la garde runtime locale avant les actualisations fréquentes de 2.5.
  evidence: Le paquet002 conserve huit mesures de Assert-BmadClosedRuntime entre 18,389 et 27,188 secondes par opération, avec worker Python entre 1,501 et 3,280 secondes ; intervalle de 63,173 secondes entre deux collectes séquentielles, contexte inclus. Voir qualification-reprise-projet/performance-observation-002.json. La garde est préexistante ; aucun changement de sécurité ou gain de performance n’est acquis.

- source_plan: `C:\Users\UP60066553\.codex\worktrees\bmad-help-2-2\madness\_bmad-output\initiative-madness\tickets\epic-projets-bmad\tickets\story-explorer-le-catalogue-reellement-installe-et-ses-fiches-plan.md`
  summary: Auditer en2.15 les attentes waitForFunction asynchrones des autres bancs de qualification existants avant de réutiliser leurs groupes fondés seulement sur ces attentes.
  evidence: diagnostic-functional-002 prouve sur le Playwright installé qu’une Promise résolvantfalse peut terminer l’attente ; V1 est corrigé dans le banc courant2.6. La portée des autres bancs reste à vérifier : les assertions directes de fichiers, ressources, clipboard et arrêts ne sont pas invalidées en bloc.

- source_plan: `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/story-consulter-les-livrables-et-demander-leur-ouverture-dans-ledi-plan.md`
  summary: Rejouer la copie Windows positive du candidat final en2.16/G3 quand l’API native du presse-papiers restitue à nouveau un marqueur témoin ; garder la validation externe manquante explicite sans bloquer le travail indépendant.
  evidence: main-002 renvoie failed/texte vide et ferme/nettoie son témoin. Les diagnostics002 (Mainpackagé689656) et003 (Electron45stock sans code/politiques Madness) attendent les Promises de write/read : marqueur simple, après macrotask et chemin avec fenêtre focalisée restent vides, hasTextfalse. Cause runtime/Windows/session/politique inconnue, aucune attribution à Zscaler/IT/lock ni modification de configuration. main001efcacb8 avait un contrôle positif plus tôt mais reste partiel/historique. Voir qualification-fichiers/clipboard-availability-deferred.json ; condition de reprise : APIpositive sur même bureau puis banc standard inchangé du candidat final, aucune réussite actuelle/G3 déduite.

- source_plan: `_bmad-output/initiative-madness/tickets/epic-graphe-projet/tickets/story-generer-et-consulter-un-premier-graphe-de-code-dans-le-paque-plan.md`
  summary: Neuf divergences de la suite UI large pendant4.4 restent non attribuées, à auditer en2.15 avant qualification globale.
  evidence: Commande initiale175/186 et recheck1/5 dans qualification-graphe-produit/logs, détails des neuf cas dans implementation-handoff.md ; sévérité potentielle medium non vérifiée. Comparaison baseline9dc1d12/fixtures/attentes requise pour séparer défauts produit et locateurs/dimensions obsolètes ; ne pas les appeler préexistants ni verts. Les cas Graph nouveaux sont vérifiés séparément.

- source_plan: `C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/story-conserver-les-mesures-sourcees-et-leur-rattachement-aux-us-plan.md`
  summary: Reprendre les 17 échecs exacts du contrôle global2.11 dans le sweep2.15 et la qualification native graphe correspondante, sans les annoncer verts ou tous préexistants.
  evidence: `qualification-mesures-produit/parent-full-suite-001/summary.json`, `tests.log` et `cleanup/graph-cleanup.json` ; deux doubles sans fileGrant statiquement inchangés, douzeUI via renderer/preload synthétiques inchangés (pas une réexécution verte baseline). Trois natifs restent non attribués : supervision orphan timeout, contrôleur runtime tué à180s, Graphify Move Access denied avec Job affecté puis actif0. Une reprise ciblée instrumentée doit établir les causes réelles avant clôture intégrée ; aucune demande réseau/Zscaler déduite. Les logs neufs des anciens périmètres sont archivés ZIP vérifiés avec mapping ; le reçu historique a été restauré exactement.

- source_plan: `_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/story-refactor-sweep-plan.md`
  summary: Les validations longues restantes du sweep et la qualification intégrée finale sont différées par instruction explicite du porteur.
  evidence: Le5novembre « Les tests aussi longs, on skip » puis demande d’optimisation. Global001 interrompu595lignes vertes/5rouges observées, sans total final ; Graph standard non exécuté. Quatre ajustements de doubles/locateur UI corrigés par lecture sans recontrôle exécuté, rendu/package des derniers patches non qualifié. Les reçus antérieurs restent historiques ; ni G2/G3/G4/G5 ni conformité humaine/WCAG acquis. Voir qualification-sweep-projets/parent-verification.md et summary.json ; poursuivre le développement avec contrôles courts ciblés.

- source_plan: `_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/story-refactor-sweep-plan.md`
  summary: Le rapprochement des17anciens rouges et des9Graph inclus est conservé sans réécrire leurs reçus.
  evidence: qualification-sweep-projets/dispositions.json fournit17noms uniques,9en sous-ensemble, fixes des attentes/doubles/UI et observations natives dans leur mode exact. Le positif Graph porte une copie diagnostique distincte, pas une réparation causale ni une qualification finale du produit ; le contrôle standard est différé par l’instruction humaine ci-dessus. Les réserves de copie externe/G3 restent à qualifier ultérieurement, aucune nouvelle demande Zscaler/token/IT.


- source_plan: `_bmad-output/initiative-madness/tickets/epic-graphe-projet/tickets/story-refactor-sweep-plan.md`
  summary: Borner la rétention des copies opérationnelles Graphify et mesurer leur volume avant clôture G5.
  evidence: Remise 4.4 ligne 31 et rapprochement epic 4 du 4 novembre. La 0.2.19 conserve graph-runs-v1 pour miroir, aperçu, diagnostic et preuve d’arrêt. Définir puis vérifier une politique de suppression des seules copies possédées et confirmées, avec conservation des références actives et reçus nécessaires. Les profils existants et dossiers à arrêt inconnu demandent une reprise distincte. Les trois sorties intermédiaires de 4.9 étaient des paquets, pas des opérations utilisateur.
