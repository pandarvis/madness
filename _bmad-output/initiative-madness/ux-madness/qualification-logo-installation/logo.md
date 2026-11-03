# Logo Madness — atelier

Le porteur a demandé l'installation du skin et le remplacement du logo Electron par un logo dans le même thème. Logo original généré avec `image_gen.imagegen` intégré : M terracotta, badge pétrole, arêtes ivoire, contours encrés et fond extérieur transparent. Source native conservée sous `resources/branding/madness-logo.png`, prompt exact sous `generation-prompt.txt`, empreintes sous `provenance.json`.

Les variantes 16/24/32/48/64/128/256 sont des redimensionnements Lanczos. L'ICO final contient six images DIB BGRA classiques et une image PNG 256px. Aucun dessin généré n'est retouché ; seuls taille et format sont déclinés.

Le premier ICO utilisait des PNG compressés à toutes les tailles. Les ressources PE étaient présentes, mais l'extraction native Windows produisait une icône générique. Ce résultat et le premier reçu d'installation sont conservés sous les noms `first-*`. Les petites tailles DIB corrigent ce problème : l'icône extraite est inspectée visuellement et son contenu terracotta/pétrole est contrôlé dans le banc. Un simple résultat non vide n'est plus considéré comme preuve suffisante.

Configuration : `win.icon`, icônes installateur/désinstallateur NSIS et icône de `BrowserWindow`. Le fichier ICO est livré à côté de l'ASAR sous `resources/madness.ico`. Le lancement automatique en fin d'installation est désactivé pour permettre une réouverture personnelle contrôlée. Aucun système de connexion, fournisseur ou comportement de dialogue n'est modifié.

La compilation/types et sept contrôles d'apparence passent. Le contrôle du paquet corrigé passe sept vérifications en profil synthétique, sans moteur ni réseau après instrumentation, fermeture et nettoyage confirmés. Les reçus d'installation et de réouverture personnels sont séparés de cette qualification synthétique. Aucun nouveau reçu BMad, aucune clôture 2.2/M14 ou acceptation visuelle globale n'est déduit de l'ajout du logo.
