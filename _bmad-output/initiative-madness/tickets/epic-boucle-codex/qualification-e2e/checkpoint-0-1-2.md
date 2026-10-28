# Point de reprise1.11 — qualification incomplète

28octobre2026. Ce point conserve le travail intermédiaire ; **1.11 reste en cours, G1 et l’epic ne sont pas clôturés**. La revue step04 et la matrice finale restent à faire après les essais natifs requis. Le Build d’origine est repris sans nouveau rendu, baseline4855e7dc7eb1371534220bb6bf861c05b5ab672c conservée.

Le paquet courant testé est0.1.2, ASAR9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4, manifeste final de1.13 `../qualification-forge-session-check/installation-final/release-manifest.json`. Les nouveaux bancs portent leur propre révision et leurs empreintes ; aucun manifeste historique régénéré.

- Adaptation du harnais :25/25 tests ciblés, sans saut ; nouveau contrôle Forge reconnu, défaut2048événements et bornes1Mio/ligne–8Mio cumulés conservées. Les échecs de permissions sandbox des fixtures Windows sont distingués de l’exécution complète hors sandbox réussie.
- Suite courante :343/343, zéro échec/ignoré,540859.2707ms ; `full-tests-current-001.log`. `typecheck-current-001.log` réussit.
- `synthetic-current-001/report.json` : dix phases,75contrôles réussis (UI57, expiration locale2, vrais runners/loopback11, Windows5), runtime45.0.0/Chromium156.0.8078.48/Node24.22.0. Profils fermés/nettoyés, empreintes historiques comparées inchangées. Aucun modèle externe ni compte dans ces phases.
- `personal-current-001/report.json` : compte lisible puis `NETWORK_UNAVAILABLE` avant tout enfant natif ; statut `failed-no-replay`, pas de succès Mary/Forge imputé à0.1.2. Main/enfants/espaces fermés. Réouverture exacte et archivage du seul témoin après six contrôles dans `failed-current-cleanup-001/report.json`, vrais projets/données conservés.
- `public-current-001/report.json` : première instrumentation du GET avec `redirect:manual`, annulée par Electron ; tentative partielle conservée. La nouvelle instrumentation observe seulement les en-têtes, sans suivre la redirection ni conserver sa valeur.
- `public-current-002/report.json` : GET public Main observé13:05:36–13:05:50UTC, HTTP307 vers Zscaler. URL publique fixe ouverte dans le navigateur Windows ; demande du seul acquittement humain en attente. L’acquittement précédent du matin est conservé ; ni contenu JSON ni token redemandé, aucune durée d’expiration supposée.

Les essais0.1.1 restent historiques : Mary7contrôles positifs puis Forge refusé dansrun001, activation diagnostique distincte sans recherche native de sessions, close-active8 et child-error9. Ils ne constituent pas la preuve intégrée du nouvel ASAR. Leurs témoins failed/diagnostic ont été rouverts puis archivés ; leurs dossiers liés restent conservés.

À reprendre après l’action réseau : GET Main seul, puis nouveaux témoins/output pour le parcours complet et fermeture/erreur/réouverture du paquet0.1.2, sans rejeu des anciens contrôleurs. Ensuite matrice R1–R10/G0G1, revue BMad et conclusion étayée. La préparation/refonte UX indépendante préserve ce paquet installé pour la qualification ; aucun accord visuel humain ou catalogue complet n’est déduit.
