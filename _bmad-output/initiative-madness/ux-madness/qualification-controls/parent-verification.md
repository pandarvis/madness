# Correctifs des commandes atelier — 3 novembre 2026

Mandat : corriger le retour humain sur boutons, typographie, espace, icônes de projet, contours et commandes supérieures ; capture fournie « Horrible » conservée dans user-feedback.png. Itération interactive sur la refonte existante, sans nouveau reçu bmad-build ni statut 2.2/M14 modifié.

## Résultat produit

La couche atelier-controls.css est chargée en dernier. Corps16, métadonnées14, commandes Barlow Condensed19 ; onglets21/20 en compact, hauteur44. Les actions textuelles et boutons partagent deux plaques polygonales à bord fin et leurs états. Projets : dossierSVG à la place des index encadrés. Cadres illustrés amincis, largeur utile libérée. HelpPanel réorganisé en préparation/diagnostic/provenance avec empilement compact ; raisons et gardes métier conservées. Aucun nouveau claim produit ni changement de palette/famille/illustration.

## Diagnostic et vérifications

Le premier test de la barre a reproduit huit chevauchements de régions draggable sur les quatre commandes. Fix : topbar/ancêtres/commandes/pseudos no-drag ; seule la zone du titre déplace la fenêtre. Test corrigé : aucun chevauchement et quatre actions renderer exécutées. Main natif : sélecteur dossier annulé une fois, sans ajout ; thème sauvegardé et panneau Codex ouvert sans vérification du fournisseur.

- Build et types0.2.2 réussis ; NSIS réussi, Electron45 local, aucune installation de dépendance.
- Premier global UI :50/51, échec de hauteur onglets46>44 ; correction CSS44, assertion conservée. Reçu intermediate-ui-result.json. Le global final est enregistré séparément dans ui-final.log.
- final-recheck/profile.json :8/8, cleanuptrue ; six captures natives, aide claire/sombre1440 et720. Les données sont fictives et nativeReadyfalse ; « Demander à BMad » reste désactivé.
- matrix-final/profile.json :14/14 natifs compilés avant les derniers microcorrectifs ; package-matrix/profile.json :14/14 sur le paquet final, cleanuptrue. Les premiers résultats ne sont pas attribués au paquet final.
- installation/candidate-check.json :8 contrôles du candidat final, version0.2.2, logo extrait48px, corps16, no-drag ; fermeture et nettoyage synthétique prouvés.
- Détecteur manuel unique : sortie vide, exit0, detector.txt. Revue indépendante Impeccable fraîche : F1info-bulle, F2portée14, F3documents corrigés/recontrôlés ; finish-verdict.md. Documents réconciliés par documenter.md.
- source-freeze.json :170 entrées du manifeste identiques aux sources ; release-manifest.json conserve les empreintes. ASAR310d6cffdfba7c3670b65f762b34a0a11bf05d1f5cb776e30424cc18b7c05528.

## Limites conservées

Les clics sont des actions du renderer Electron et une vérification géométrique des régions Windows ; le clic physique Windows n'a pas été exécuté, l'accès Computer Use ayant expiré. Aucun accord visuel humain global, conformité WCAG, nouveau consentement, modèle ou succès de story2.2 déduit. Mesures réseau/moteur après instrumentation seulement. Le premier rouge de barre a conservé un répertoire synthétique après échec de fermeture (madness-ui-review-hTdkB2) ; aucune suppression forcée ni cleanup vert inventé. Les runs ultérieurs cités ont leur propre preuve de fermeture.

## Installation personnelle

Remplacement NSIS0 au même chemin de la version0.2.1 par0.2.2. Les 838 entrées critiques sont identiques avant/après ; ASAR installé exact 310d6cffdfba7c3670b65f762b34a0a11bf05d1f5cb776e30424cc18b7c05528, ICO exact 9d99e9b9aa7b18fd82c0e06df1d9a382daa47ddbba095ba10ceee4cd9af6f19b. Reçu installation/installation.json. La réouverture personnelle est contrôlée séparément.

Réouverture installée :8 contrôles réussis, version0.2.2, compte lisible, MIA/madness présents, corps16/no-drag et glyphes sans index vérifiés. Aucun réseau ou app-server après hook ; contrôle fermé avec Main et descendants absents. 838 entrées identiques après fermeture. Reçus personal-reopen.json et after-reopen.json sous installation/.

## Résultat final UI

Commande `node --test --test-concurrency=1 tests/connection-ui.test.mjs` :51/51,0échec,0skip, sortie0 ; durée1229592.3609ms. Fermeture du Main et de tous descendants observée avant suppression du seul profil synthétique final. Journal complet ui-final.log ; résumé verification-current.json. Ce résultat remplace le premier50/51 comme qualification actuelle sans effacer son échec. Aucun global backend ou story2.2 revendiqué.
