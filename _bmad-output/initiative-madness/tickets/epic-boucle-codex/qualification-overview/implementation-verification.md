# Story 1.8 — remise d’implémentation

Le code prolonge les contrats et contrôles existants. Aucune donnée personnelle, connexion, installation ou acceptation humaine n’est utilisée par ces bancs.

- Suite prescrite : 283/283, journal tests-final.log.
- Gardes finales UI : 6/6, journal ui-final-guards.log ; neuf tests purs de projection également verts.
- Types/build et installateur Windows : packaging-final.log, sortie séparée dist/overview-pilot.
- Banc compilé : 8/8, compiled-profile.json, nettoyage confirmé.
- Vrai runner épinglé et fournisseur synthétique sur loopback : 4/4, native-loopback-profile.json, reçu exact et nettoyage confirmés.
- Régressions Windows existantes : 5/5, windows-final.log, nettoyage confirmé.
- Banc paquet : 8/8, packaged-profile.json, nettoyage confirmé. ASAR final 02f757dc6feaec7d74a8635ac880f5e2d65905433bfeb85022af6a5194ac3b81 ; installateur f885a67a2d9ffb361f51b2fb0fdb8b26cad209f57728941971be1edcd840fccc.

Les attentes du banc Electron sont explicitement injectées pour vérifier l’affichage et les liens ; elles ne prouvent pas un reçu natif. Le reçu réel vient du banc overview-native.mjs, avec les vrais protocole et coordinateur, sans compte/OAuth/modèle externe.

Première passe visuelle : compiled-desktop-dark.png, compiled-compact-dark.png, compiled-desktop-light.png, compiled-compact-light.png. Ces captures précèdent la correction groupée de l’interligne connexion, de la corrélation des choix et de l’état d’attente expirée. Leur confirmation après revue est réservée à la seconde et dernière passe ; aucun autre jeu n’a été capturé. Le détecteur unique retourne [] dans impeccable-detector.json.

Les premiers lancements Electron et electron-builder ont été bloqués par le sandbox (lancement processus et accès au proxy local). L’exécution encadrée hors sandbox a permis les contrôles ; TLS, proxy, authentification et protections produit restent identiques. Deux défauts de banc ont été corrigés : retour Accueil compact exigeant d’ouvrir le tiroir, puis réouverture attendant à tort l’accueil alors que le projet sélectionné était durable. Les assertions ciblées et la suite complète passent après correction.

La revue Quick, la finition technique fraîche, l’installation personnelle et le commit relèvent du parent. Gates 1.1/1.2 et dépendances 1.10/1.11 conservés ; pas de suivi temps/coût R32, Loop, graphe, catalogue ou refonte globale.
