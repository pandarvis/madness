# Retrait du monogramme dans le rail replié

Le 24 octobre 2026, le porteur demande de retirer le « M » qui fait doublon avec le nom dans la barre supérieure. La correction masque la marque et son emplacement dans le seul rail de bureau replié. Le nom du projet dans la barre, les repères des projets, la marque du menu déployé et le tiroir compact sont conservés.

Correction CSS mécanique, sans nouveau workflow Build : ce cas relève des petites corrections directes prévues par les consignes BMad du dépôt. Le contrat DESIGN.md et son journal sont actualisés. Impeccable a guidé la simplification et la vérification visuelle.

Vérifications réalisées : `npm run build` (types et compilation), cinq régressions Windows ciblées sur le programme compilé, puis deux contrôles interactifs isolés consignés dans `profile.json`. Les captures `rail-desktop.png` et `tiroir-compact.png` ont été inspectées ensemble : rail sans monogramme ni emplacement vide, tiroir compact conservé, fermeture Échap et retour du focus vérifiés. Les profils temporaires sont nettoyés ; aucun compte ni agent n'est utilisé.

La livraison est générée séparément sous `dist/navigation-cleanup/`. Le paquet et ses cinq régressions Windows ciblées sont identifiés dans `verification.json`. Une première génération a échoué lors de l'ouverture de l'exécutable par electron-builder ; la seconde s'est terminée avec le code 0. Ce lot ne modifie pas l'installation personnelle et ne clôt aucun ticket ou gate de distribution.

Le point de progression BMad a suivi l'aide installée puis Sofia (BOARD/état, lecture seule). Le tableau n'a aucune entrée prête : 1.1 et 1.2 gardent leurs réserves, 1.3 attend leurs dépendances. La suite recommandée est REPLAN pour rapprocher les preuves des pilotes locaux et les tickets, puis Build sur la première entrée prête. REPLAN et le développement fonctionnel suivant n'ont pas été lancés par cette consultation.
