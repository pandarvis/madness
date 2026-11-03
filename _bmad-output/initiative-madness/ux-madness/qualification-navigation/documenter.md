# Relevé documentaire — navigation atelier

3 novembre 2026. Impeccable Documenter appliqué en extension du monde atelier existant. Candidat logiciel 0.2.4, distinct de la story 2.4. Le [retour humain](./user-feedback.png) a été inspecté : rail clair encadré et repères de dossier peu distinctifs. Les sources actuelles de [App.tsx](../../../../src/renderer/src/App.tsx) et [atelier-controls.css](../../../../src/renderer/src/atelier-controls.css) ont été relues pour la réconciliation.

## Concordance

- Rail et tiroir fixes pétrole dans les deux thèmes de lecture ; leurs alias rail-* reprennent huit couleurs déjà présentes dans la palette. Aucun token de couleur primitif n’est ajouté ou modifié. Leurs pseudo-éléments raster sont masqués, et une séparation de 1 px conserve le bord du rail ; la fiche et la saisie gardent leurs usages raster.
- Lignes déployées de 52 px minimum, sélection terracotta et texte encre, survol plus clair, focus bleu clair 2 px / décalage 2 px. Compact : cible 40 × 44 px, rail 58 px / axe 28 px inchangés ; info-bulles Oxanium 450 / 14 px.
- ProjectMark extrait les mots en lettres/chiffres Unicode. Un mot de trois caractères au plus est conservé ; un mot plus long donne ses deux premiers caractères. Plusieurs mots donnent les initiales des deux premiers ; le résultat passe en capitales. MIA/MA distinguent MIA et Madness. Sans lettre/chiffre, un SVG dossier sert de repli. Le repère est décoratif, partagé par navigation et cartes d’accueil ; noms accessibles complets et handlers restent inchangés.
- Pictogrammes Icon anguleux, traits carrés et faces partielles ; commandes 40 px conservées. La marque ChatGPT n’est pas changée. La signature basse du rail compact réutilise resources/branding/madness-64.png à 28 px : aucun nouveau raster ou prompt. Les sept bustes, les fontes et leur provenance restent inchangés.

## Documents réconciliés

DESIGN.md décrit les rôles propres au rail, la sélection et les repères nominatifs ; les primitives de palette et les familles de police sont conservées. L’ancienne prescription de fond selected thématique et de SVG dossier pour tous les projets n’est plus un contrat actif de navigation. La description du cadre raster est limitée à ses usages conservés.

Le sidecar reste en schéma 2, dix composants, avec overview identique au DESIGN et extraits autonomes de ligne sélectionnée/repère et d’icône réconciliés. Le contrat de surface enregistre le retour, la géométrie et la portée 0.2.4. PRODUCT.md ne nécessite pas de changement : ce raffinement concerne l’expression de navigation et conserve les engagements produit. Les preuves historiques de candidats antérieurs ne sont pas réécrites.

Fichiers attribués modifiés : [DESIGN.md](../../../../DESIGN.md), [.impeccable/design.json](../../../../.impeccable/design.json), [contrat de surface](../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md) et ce rapport. Aucun fichier source, test, package ou AGENTS n’est édité par cette passe documentaire.

## Portée des preuves

Le parent annonce le build source réussi. Au relevé initial, round1, matrice native, tests UI et revue étaient à venir : aucun résultat de ces étapes, paquet final, installation ou ship n’est déduit de la documentation. La validation humaine 0.2.3 reste acquise et n’est pas réattribuée à 0.2.4. Les comportements métier, identités attestées/inconnues, confirmations et sauvegardes gardent leur contrat.

Vérification documentaire : tous les liens locaux des quatre fichiers résolvent ; huit sections canoniques, sidecar JSON valide en schéma 2 avec dix composants, overview identique au DESIGN. Les blocs de palette et de typographie sont strictement identiques à leur contenu avant cette passe. git diff --check retourne 0, avec seulement les avertissements de conversion LF/CRLF.

## Complément — allègement des bordures

Le dernier retour humain juge les bordures des icônes de gauche trop épaisses. La source finale a été relue : workshop-icon passe de 1,8 à 1,5 unité SVG. En rail compact, la ligne sélectionnée conserve le fond pétrole sans encadrement extérieur orange ; seule la face du monogramme est terracotta/texte encre, avec contour de 1 px et repère latéral de 2 px. Les cibles et le focus ne changent pas. DESIGN, contrat de surface et spécimen du sidecar reprennent cette variante ; aucun autre changement de système n’est introduit.

Le parent signale un premier round de 11 contrôles, une matrice de 15 et un test UI de barre réussis. Le source-final 11 reste en cours ; ces résultats ne sont pas la preuve d’un paquet final et ne valent ni installation ni ship.
