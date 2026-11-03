# Installation personnelle du skin et du logo

Le 3 novembre 2026, le porteur demande explicitement d'installer le nouveau skin et de remplacer le logo Electron par un logo dans le même univers atelier. Cette livraison n'ouvre aucune story ni qualification réseau supplémentaire.

## Livrable

Logo original généré via `image_gen.imagegen` intégré, source et prompt exact sous `resources/branding/`. ICO multirésolution 16/24/32/48/64/128/256, six frames DIB et une PNG, empreinte `9d99e9b9aa7b18fd82c0e06df1d9a382daa47ddbba095ba10ceee4cd9af6f19b`. Les transformations sont limitées au redimensionnement et à l'encodage.

Le packager applique cette icône à l'exécutable et à NSIS ; `BrowserWindow` charge la ressource locale empaquetée. Le logo natif extrait du candidat puis du programme installé est inspecté et contient les couleurs terracotta/pétrole attendues, contrairement au premier ICO tout-PNG. Les preuves `first-*` conservent cet essai et le premier remplacement contrôlé réussi ; aucune extraction générique n'est attribuée au résultat final.

## Vérifications

- Types et compilation réussis ; sept tests d'apparence réussis, zéro saut.
- Candidat corrigé : sept contrôles passifs synthétiques réussis, compte absent, identité Main exacte, fermeture et nettoyage confirmés.
- Manifeste du candidat corrigé : 169 inputs, ASAR `50697c58fd96abbd2596a6d558b07920a99313ebb23306555f33bf9ff8a02a5f`, installateur `9faf14f1b323afec89a3c3d7610f0e71d101bcd501e8854a5a4c8a4a240c677a`. Le runtime et le renderer héritent de la finition f8f960d ; seule l'icône native est ajoutée dans Main et le packaging.
- Madness personnel fermé avant chaque remplacement. NSIS terminé avec code 0, même emplacement `C:/Users/UP60066553/AppData/Local/Programs/Madness`. ASAR et ressource ICO installés exactement conformes au candidat.
- 829 entrées critiques contrôlées : projets, brouillons, préférences métier, annexes, archives possédées et fichiers de connexion identiques à la baseline avant installation puis après réouverture. Le coffre n'est pas copié.
- Réouverture dans le profil normal `C:/Users/UP60066553/AppData/Roaming/Madness`, sans MADNESS_DATA_HOME : sept contrôles passés, projets MIA/madness présents, compte lisible sans nouveau consentement, dialogue inactif et aucun tour. Style de finition atelier chargé et icône native correcte.
- Réseau et app-server nuls après instrumentation ; aucune absence d'activité antérieure au hook n'est revendiquée. La fenêtre de contrôle est fermée avec identité Main absente et fermeture observable.

## Preuves

`before.json`, `installation.json`, `candidate-check.json`, `personal-reopen.json`, observations natives et deux extractions d'icône ; capture `installed-home.png`. Le manifeste de livraison est sous `dist/atelier-logo-corrected/release-manifest.json`. Les formats Chromium et caches ne font pas partie des 829 entrées métier comparées ; aucune conservation bit à bit de tous les caches n'est revendiquée.

L'installation réelle du skin est désormais acquise sur ce paquet. Ce résultat ne clôt ni 2.2/M14, ni un parcours fournisseur, ni une conformité WCAG ou acceptation visuelle globale. Aucun moteur personnel ou nouveau message n'est demandé par les contrôles.
