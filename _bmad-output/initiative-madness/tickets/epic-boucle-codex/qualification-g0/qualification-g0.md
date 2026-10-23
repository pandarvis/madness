---
title: 'Qualification locale du socle Windows G0'
date: '2026-10-23'
status: 'preuves-techniques-locales-obtenues'
scope: 'story 1.2 — socle, contrats et stockage local'
---

# Qualification locale du socle Windows G0

Le socle React fonctionne dans Electron compilé puis dans l’exécutable Windows empaqueté. Les opérations de lecture, choix du dossier, sauvegarde du brouillon et préférence passent par le vrai preload métier. Après fermeture, le contexte, le brouillon et la préférence sont retrouvés ; aucun fournisseur n’est lancé. Le [profil expurgé](profile.json) distingue les contrôles acquis des limites.

Ce rapport n’installe pas le programme sur une machine cible et ne qualifie pas Codex, BMad, les opérations d’initialisation ou Graphify. Aucun passage de gate ni déblocage d’un lot consommateur n’est effectué automatiquement. Les qualifications humaines, d’installation et de réseau manquantes restent explicites.

## Assemblage observé

| Élément | Version ou preuve |
|---|---|
| Windows observé | win32 x64, build 10.0.26200 |
| Node de développement | 24.13.0 ; npm 11.6.2 |
| Starter officiel | `@quick-start/create-electron` 1.0.31, `react-ts`, créé séparément puis adapté |
| Electron | 45.0.0 |
| Chromium de l’application | 156.0.8078.48 |
| Node embarqué | 24.22.0 |
| TypeScript / electron-vite | 7.0.2 / 6.0.0 |
| React et react-dom / Vite | 19.3.1 / 8.3.5 |
| electron-builder | 26.15.3 |
| Automatisation Electron | playwright-core 1.64.1, utilisé uniquement par le banc |
| Reproductibilité | Versions exactes et lockfile npm ; empreintes des entrées et des artefacts dans le profil |

Les versions du plan ont été installées sans repli. Le starter conservait Electron 44.7.2, TypeScript 5.9.3 et un preload générique : ces choix ont été remplacés pour respecter les contrats approuvés. Aucun updater ni miroir de téléchargement n’a été ajouté. `npm install` a signalé des dépréciations transitives (`inflight`, `rimraf`, `glob`, `boolean`) et un audit à 0 vulnérabilité au moment du contrôle.

## Vérifications exécutées

| Contrôle | Résultat observé | Portée |
|---|---|---|
| Types | Réussi | main, preload, contrats, cœur, adaptateur et renderer ; TypeScript 7 |
| Matrice automatique | 42 tests réussis | 16 tests G0 et 26 tests du banc Codex indépendant, sans lancement fournisseur ; aucun test ignoré |
| Build | Réussi | Trois sorties autonomes main/preload/renderer |
| Renderer de développement | Réussi | URL locale normalisée et HMR autorisé par nonce CSP de session, sans `unsafe-inline` ; vrai preload et profil jetable |
| Paquet Windows x64 | Réussi | `dist/win-unpacked/Madness.exe` et installateur NSIS local |
| Programme compilé puis empaqueté | Réussi | Les deux affichent React et exposent le pont métier réel |
| Annulation du sélecteur | Réussi | Aucun projet ajouté, aucun snapshot créé ; retour OS contrôlé par le banc |
| Contexte réel | Réussi | Racine canonique lue sur un dossier d’essai ; aucun contenu du projet modifié |
| Sauvegarde et réouverture | Réussi | Projet actif, saisie sauvegardée et navigation retrouvés dans une nouvelle instance |
| Remplacement des binaires | Réussi au niveau exécutable | Le même profil créé avec le build est relu par le paquet ; aucune installation/remplacement par installateur revendiqué |
| IPC et événements | Réussi | Payload et portée invalides refusés, corrélations et ordre observés ; autre fenêtre avec le même preload refusée avant le dialogue |
| Isolation | Réussi | `contextIsolation`, `sandbox`, `webSecurity` vrais, `nodeIntegration` faux ; sandbox réel du renderer dans les métriques et `process`/`require` absents du renderer |
| Erreurs de stockage | Réussi | Corruption, version future, modification externe, écriture impossible : refus sans remplacement ; aucune durabilité prétendue |
| Saisie après erreur | Réussi dans le paquet | Une version future injectée dans le seul profil témoin reste intacte ; la saisie reste visible |
| Cycle de vie | Réussi au périmètre G0 | Aucune reprise automatique ; états restaurés historiques ; arrêt limité aux opérations possédées, résultat inconnu conservé |
| Navigation | Réussi au périmètre contrôlé | Repli, accueil/projet et redimensionnement conservent la saisie ; Échap ferme le tiroir et restitue le focus ; lien d’évitement clavier sans changement d’URL ; repères distincts de deux projets de même initiale conservés après réouverture |
| Contrôle Impeccable | 0 constat au passage initial | [Sortie du détecteur](detection-impeccable.json) sur `src/renderer`, exécuté une fois avant les corrections de revue ; celles-ci ont une confirmation visuelle distincte. Ne vaut pas audit d’accessibilité |
| Nettoyage | Réussi | Enfants du banc fermés et seul espace temporaire créé supprimé ; profils personnels non utilisés |

Les tests de persistance atomique ont d’abord rencontré `EPERM` dans le répertoire temporaire virtualisé du sandbox des outils. Ils ont été exécutés dans Windows local autorisé et ont réussi sans changer la stratégie de remplacement. Le banc a également corrigé deux détails de son lanceur Windows : barre finale d’un argument et consultation du processus après destruction de son objet d’automatisation. Ces défauts du banc n’ont pas été présentés comme une preuve de succès.

## Inspection de l’interface

La base française claire et les tokens de DESIGN.md sont repris : navigation lavande, centre blanc, accent violet, listes plates, contexte latéral et brouillon explicite. Aucun catalogue, diagnostic BMad ou faux contrôle d’envoi n’a été ajouté. Les captures du paquet montrent les deux formats inspectés :

- [Fenêtre desktop](packaged-desktop.png), contenu de 1 320 × 860 CSS px.
- [Fenêtre compacte](packaged-compact.png), contenu de 600 × 800 CSS px, tiroir de navigation accessible au clavier.

L’échelle Windows peut produire des dimensions d’image supérieures aux dimensions CSS. Après l’inspection initiale et sa confirmation, une capture corrective bornée a vérifié les repères distincts demandés par la revue. Les fichiers présents correspondent au paquet corrigé (`captureMode: captured-this-run`) ; les chemins visibles sont ceux du dossier témoin jetable, jamais un projet métier.

## Revue et décision

La revue BMad Quick a trouvé deux défauts reproduits avant correction : le lien d’évitement ajoutait `#main` et invalidait la frontière IPC exacte ; une corruption UTF-8 pouvait être décodée puis réécrite silencieusement. Le lien déplace maintenant le focus sans navigation et le stockage utilise un décodage strict. Les régressions préservent les octets invalides tout en acceptant un vrai caractère U+FFFD.

La revue de finition UX a demandé des repères distincts pour les projets de même initiale. L’ordre persisté fournit maintenant des repères compacts, également repris à l’accueil, avec noms accessibles et infobulles conservés. Sa confirmation sur les nouvelles captures ne relève plus de correction pour ce constat. Le rôle spécialisé Impeccable étant indisponible dans le harness, la finition et la vérification documentaire sont confiées à des agents neufs de rôle standard appliquant les références du plugin ; cette substitution est explicite. Les contrats DESIGN/EXPERIENCE sont conservés.

Après ces corrections, l’orchestrateur a relancé les 42 tests, les types, la compilation et le paquet NSIS, le contrôle dev et les 14 contrôles Windows intégrés : succès et nettoyage confirmés. Aucun constat de ces revues ne reste différé. Sous le mandat autonome du porteur, les preuves techniques locales sont acceptées ; G0 demeure partiel pour la clôture du ticket, car installation, minima de compatibilité et proxy cible ne sont pas qualifiés. Aucun consommateur n’est débloqué par ce résultat.

La vérification documentaire compare CSS, App, contrats adoptés, prototype, sidecar historique et captures : palette, niveaux de texte, rail de 58 px et cibles de 40 px sont conservés. Aucun fichier du système de conception n’est modifié. Le sidecar historique reste `draft` ; le brouillon local de G0 n’est pas promu en règle globale.

## Reproduction

Depuis la racine du dépôt, après installation des dépendances exactes :

```powershell
npm test
npm run build:win
node scripts/qualification/development.mjs
node scripts/qualification/windows.mjs
git diff --check
```

Pour rejouer les vérifications techniques en conservant les captures déjà inspectées : `node scripts/qualification/windows.mjs --skip-screenshots`. Le banc remplace uniquement son propre profil expurgé et ses captures de preuve ; il ne touche pas à un profil utilisateur existant. Voir [le guide de développement](../../../../../docs/development.md) pour l’organisation, la maintenance et la stratégie de stockage.

## Limites et travail restant

- Le sélecteur Windows est réellement appelé par l’adaptateur, mais son résultat est contrôlé par le banc ; aucun parcours humain de ce dialogue n’est revendiqué.
- L’installateur NSIS est construit, non exécuté. Installation, désinstallation et préservation après remplacement par l’installateur restent à vérifier sur la cible. Aucun minimum Windows ou proxy n’est déduit d’un essai sur cette machine.
- L’exécutable et l’installateur ne sont pas signés. L’icône du runtime est conservée en attendant une ressource de marque approuvée ; aucune publication distante n’a été effectuée.
- Aucun réseau de fournisseur, login, identifiant Codex ou conversation réelle n’a été utilisé. G1 reste distinct ; G2/G3, les trois parcours humains G4 et G5 ne sont pas qualifiés ici.
- Aucun audit WCAG, lecteur d’écran ou essai novice n’a été réalisé. A1 reste ouverte ; le français clair est la seule variante implémentée.
- La synchronisation de fichier et le remplacement atomique évitent un succès anticipé mais ne prouvent pas la résistance à une coupure secteur. Le conflit est contrôlé avant remplacement, sans promettre la coordination d’un éditeur externe concurrent.
- Les capacités de conversation et d’arrêt du contrat sont établies ; les mécanismes de processus et de reprise des futurs connecteurs seront qualifiés avec leurs consommateurs. G0 ne prétend pas les implémenter.

Prochaine étape : compléter les preuves d’installation/compatibilité/proxy de 1.2 et la qualification Codex de 1.1. Le premier dialogue intégré 1.3 attend ces deux entrées ; les gates ultérieurs gardent leurs critères propres.
