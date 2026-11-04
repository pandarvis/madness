# Quick — constats initiaux

- Q1 CatalogPanel.tsx:30 : copy/prepare partagent copyToken sans exclusion ; le finally de l’autre ne remet pas son drapeau à false. Le contrôle reste bloqué jusqu’à fermeture/réouverture.
- Q2 main/index.ts:246 : STOP_UNCONFIRMED du qualificateur Mary/Forge relâche le helper lease mais ne rejoint aucun propriétaire agrégé ; d’autres opérations peuvent être admises malgré l’incertitude.
- Q3 App.tsx:626 : stale ignore selectionRevision capturée ; un choix local change sans modifier le catalogue et laisse l’ancien Lancer actif jusqu’au refus serveur.

Inspection seule, aucun test/build/modification/skill/enfant du relecteur.
