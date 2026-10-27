# Audit parent de la matrice1.9 avant revues

Diff et sources lus par le parent, avec tests release/maintenance, verrou Windows, manifestes, versions et rapports. Suite stable297/297 sans saut ni échec (`unit-tests-stable.log`) ; types/build/NSIS final réussis. Les runs295/295 puis296/297 sont des états précédents ; le second a croisé une édition du banc, son échec et son recontrôle ciblé sont conservés séparément.

| Ligne du plan | Couverture exécutée |
|---|---|
| Versions | Tests `les deux reçus…`, `un exécutable de même version…`, tests release ; `final-a.json` et `final-b.json` A6/B7 avec le paquet final. La phase `installed-a.json` A6 est prête ; NSIS et B installé restent au parent. |
| Historique | A/B comparent la projection exacte des annexes et les12 empreintes ; état inconnu avec identité absente, demandes inactives, coffre synthétique relu. Aucun dialogue externe déduit des fixtures. |
| Compatibilité | Test `la matrice v1, futur, corruption et UTF-8…` sur six stockages ; octets préservés, avertissements apparence séparés. Aucune migration nécessaire ni réussie inventée. |
| Sauvegarde | Deux tests cœur/renderer et `save-failure.json`4/4 : vrai handle Windows, ancien fichier/révision exacts, temporaire retiré, saisie non enregistrée, retry explicite. |
| Réseaux | Tests existants d’environnement proxy/certificats et protocoles, `native-loopback-profile.json`4/4 et trois requêtes127.0.0.1, runner arrêté. Main public reste un diagnostic séparé à mesurer après remplacement ; aucune connectivité externe du runner déduite. |

La mesure automatique réseau/processus commence après instrumentation. Les rapports l’expliquent ; ils ne prouvent pas le démarrage antérieur au hook. Les paquets unpacked ne sont pas présentés comme une preuve NSIS. Contrôle indépendant et revues fraîches suivent ; ce rapport ne marque ni1.9 built ni des gates fermés.
