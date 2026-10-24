# Retouche des actions de connexion — 24 octobre 2026

Retour du porteur : les boutons du panneau fonctionnent, mais leur présentation est à alléger. Retouche avec Impeccable : actions en une colonne, icônes alignées, vérification douce lorsque la connexion est déjà vérifiée, reconnexion sans contour et déconnexion atténuée. Les libellés, actions, protections et ordre clavier sont conservés.

Validation : les deux tests existants de `tests/connection-ui.test.mjs`, les types et le build réussissent ; le détecteur Impeccable ne signale aucun constat. Le paquet Windows est reconstruit dans `dist/button-polish/` pour préserver la fenêtre utilisateur ouverte.

Les captures `synthetic-*.png` proviennent du renderer source dans un profil Electron isolé, réseau bloqué et état de connexion simulé. Inspection groupée en 1320 × 860, 600 × 800 et 420 × 780 : alignement, absence de débordement, cibles de 40 px, ordre clavier et contour de focus, première connexion primaire et annulation accessibles. Les mesures figurent dans `validation.json`.

Aucune nouvelle requête fournisseur ni autorisation n’a été effectuée pour cette retouche. La preuve de connexion réelle antérieure reste `../live-confirmed-profile.json` et conserve sa portée historique. La fenêtre déjà ouverte n’a pas été remplacée ; installer le nouveau paquet pour voir la retouche dans l’application.
