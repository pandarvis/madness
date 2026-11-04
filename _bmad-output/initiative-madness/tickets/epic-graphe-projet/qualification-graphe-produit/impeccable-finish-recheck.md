## verdict

- F1 — resolved : interrupted-retained-dark.png montre « Analyse interrompue · Arrêt confirmé », l'identité de la tentative et « Dernier graphe conservé : Complet » sous une autre identité, avant les données. La date demeure une observation historique non revalidée. Les extraits ciblés séparent désormais interrupted et timeout ; le reçu existant logs/graph-finish-green.log rapporte les deux cas réussis. Aucun arrêt réel nouveau ni confirmation inventée n'est attribué au replay.
- F2 — resolved : fit-45-dark.png montre les noms lisibles à Zoom du graphe100%, X0/Y0, avec45 éléments représentés et45 dans le cadrage. Le manifeste fournit une fonte effective minimale14,0134CSSpx après Ajuster et Réinitialiser, corroborée par la compensation viewport/zoom dans l'extrait ciblé. Le reçu existant couvre Fit/Reset et la conservation du contexte ; la liste et les commandes géométriques sont conservées.
- Régressions introduites par ces correctifs : aucune relevée dans les deux vues et les seuls extraits ciblés ; aucune nouvelle chasse effectuée.

## remaining

clear pour F1/F2. ship covers the scored fixes, not the whole surface.

Recontrôle par le même reviewer technique substitut appliquant le Verdict Pass officiel. Les deux PNG désignés ont été directement ouverts avant les résumés ; ils sont complets et valides pour les états annoncés. Source renderer rejouée avec le vrai graphe natif005, état de tentative synthétique explicitement marqué, aucun nouveau moteur ni autorité fichier. Scoring du troisième lot, tentative2 ; tentative1 invalide conservée et rejetée, soit quatre tentatives globales de capture selon le manifeste. Le candidat complémentaire est ASARfb688dfd8e8b0f70751d3f2c5564ade5b5c31f4cfd4cc6df234f7dc0e2743ed4 ; ces images prouvent le delta renderer rejoué, pas un nouveau vertical intégral de cet ASAR.

Le verdict initial disposition: fix et les cinq captures005 restent inchangés. La carte QUALITY BAR demeure indisponible ; aucun nouveau plafond ou accord humain inventé. Aucun rendu, capture, détecteur, test ou changement produit exécuté pendant ce recontrôle ; les reçus de tests cités sont ceux fournis. Aucun succès éditeur/presse-papiers OS, conformité WCAG, G4/G5 final ou qualification globale n'est déduit.

disposition: ship


## Complément ciblé Q4 — inspection des sources et reçus, sans nouvelle revue visuelle

Appréciation favorable limitée au delta de consultation partial/lastComplete et au maintien de F1/F2 dans les sources examinées. GraphPanel.tsx distingue latest, alternative et snapshot consulté ; les commandes « Consulter le dernier complet » / « Revenir au résultat partiel » ne font qu'une mise à jour locale. La clé de vue est l'identité entière du snapshot : recherche, sélection, filtres, zoom et déplacement ne sont pas réattribués à l'autre analyse. Identité d'analyse, révision source, révision du périmètre et couverture proviennent du snapshot choisi ; sa date de collecte remplace celle du partiel lorsqu'on consulte le dernier complet, explicitement marqué historique/non revalidé. Le statut de la dernière tentative reste distinct du résultat consulté. Les trois nouveaux libellés sont appariés FR/EN dans graph-strings.ts. Aucun nouveau bridge ou droit n'est introduit par cette bascule ; la revalidation est masquée pour le dernier complet lorsqu'un partiel courant existe.

Le cas ajouté dans tests/graph-finish.test.mjs vérifie les deux directions de la consultation, les identités et dates exactes, la révision du périmètre, l'absence de revalidation retargetée et de fichier ouvrable depuis les seuls bindings du partiel, la conservation indépendante de recherche/sélection/zoom, et aucun appel d'analyse. F1 conserve les branches interrupted/timeout et la confirmation d'arrêt conditionnelle ; F2 conserve le calcul de fonte compensant viewport et zoom, ainsi que ses assertions Fit/Reset.

Reçus lus sans réexécution : .working-graph-quick-ui-green.log comporte quatre cas verts (F1 interruption, F1 timeout, F2 et UI Graphe existante), mais cinq tests au total et un échec du nouveau cas partiel, assertion0!==1. .working-graph-quick-partial-green.log rapporte ensuite ce seul nouveau cas isolé1/1 vert, zéro skip. Ces reçus établissent quatre cas existants verts et le repassage isolé du nouveau cas ; ils ne constituent pas une exécution combinée5/5 verte. Aucune cause du premier échec n'est inventée ici.

Le nouveau contrôle n'a pas été vu : aucun écran, rendu, capture, détecteur ou test n'a été lancé par ce reviewer pour ce complément. Les captures et le ship visuel F1/F2 précédents restent liés au seul ASARfb688dfd8e8b0f70751d3f2c5564ade5b5c31f4cfd4cc6df234f7dc0e2743ed4 ; ils ne sont pas promus au paquet en préparation. L'inspection ciblée ne relève pas de régression F1/F2 dans le delta examiné et ne rouvre aucune chasse. Aucune validation humaine, WCAG ou qualification native globale nouvelle n'est acquise.

