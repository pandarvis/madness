# Quick — première inspection

- ProjectLibrary.tsx:12 — Une actualisation remplace immédiatement les preuves en cours de lecture. useBmadProgress reçoit les événements et App recalcule directement projectLibrary(...). Aucun snapshot présenté n’est conservé dans la bibliothèque : passages et sources des détails ouverts changent sans bascule volontaire. Le contrat Actualisation2.5 et ProjectResume distinguent déjà observation présentée et disponible.
- App.tsx:305/435 — navigateOverview incrémente le token puis retourne immédiatement pour projectId null sans libérer pending. WorkOverview reste accessible pendant une sélection/sauvegarde ; le nouveau finally de run ne libère plus l’ancien token. Projets, ouverture et repli restent désactivés jusqu’à un autre geste de navigation.
- GraphPanel.tsx:24 — Les filtres d’une nouvelle analyse viennent de la dernière vue créée. P→C→P avec recherche modifiée ne change pas l’ordre d’insertion de views, car update utilise Object.assign. reverse retrouve C et rétablit ses filtres au lieu de la vue P consultée, contrairement à E1/P1.

Inspection seule ; aucun build/test/skill/enfant du relecteur. La piste rAF de sélection Graph a été écartée par le relecteur : App key projet/racine démonte le panneau à un changement de projet. Pas de finding correspondant.
