# Navigation dans la barre de titre Windows

Le correctif du 24 octobre 2026 intègre la barre d’actions à la barre de titre : la commande de navigation et les contrôles Windows natifs occupent la même bande de 56 px. L’espace réservé aux contrôles système est exclu du contenu interactif ; le reste de la barre permet le déplacement. Les boutons, le lien d’accès au contenu et les dialogues restent hors de la zone de déplacement.

Le banc Windows existant échouait sur l’ancien build (`overlay.visible=false`). Il passe désormais cinq contrôles sur le compilé et cinq sur le paquet, aux largeurs 1320 et 600 : géométrie réelle de l’overlay, clics et clavier, repli/tiroir, brouillon et réouverture. La suite complète compte 112 tests réussis ; les huit tests d’interaction UI passent aussi après la dernière règle CSS. Types, compilation et paquet réussissent. La revue Quick n’a relevé aucun correctif.

`profile.json` rapporte les six contrôles natifs complémentaires et leur nettoyage. `native-desktop.png` et `native-compact.png` capturent uniquement la fenêtre témoin possédée, avec ses vrais contrôles Windows ; aucun compte, projet personnel, réseau ou agent fournisseur n’est utilisé. Les états agrandi/restauré et réduit/restauré sont exercés via l’API Electron, puis la fermeture du processus est confirmée. Le déplacement physique et les boutons système n’ont pas été actionnés par une personne dans cet essai.

Une inspection visuelle groupée a été réalisée, sans retouche de finition supplémentaire. La livraison est `dist/titlebar-pilot/Madness-0.1.0-x64-setup.exe`. Les preuves antérieures Codex/BMad restent historiques et inchangées.

Après confirmation de fermeture par le porteur, l’installation personnelle est mise à jour et rouverte. `installation.json` confirme l’archive identique au paquet qualifié, le snapshot strictement inchangé avant/après installation et réouverture, le compte conservé et l’overlay de la barre installée. Aucun dialogue natif n’a été relancé et aucune donnée de compte n’a été extraite.
