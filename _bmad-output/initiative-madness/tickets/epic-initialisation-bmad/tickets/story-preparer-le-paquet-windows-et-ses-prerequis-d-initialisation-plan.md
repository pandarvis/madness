---
title: "Préparer le paquet Windows et ses prérequis d’initialisation"
type: 'feature'
ticket: 7
created: '2026-11-06'
status: 'built'
baseline_revision: 'cbf1799392745cbd9e710e1a3775aba2f97c080f'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="mandat autonome explicite, checkpoints délégués">

## Intent

**Problem:** Le candidat 3.4 a prouvé le premier parcours. Le paquet suivant doit inclure l’annulation, la récupération et le profil local exact dans un installateur identifiable, avec des preuves de fabrication propres à cet artefact.

**Approach:** Produire le candidat Windows 0.2.18 avec Electron et NSIS déjà épinglés. Le manifeste de livraison doit refuser une archive d’initialisation attendue absente ou différente et l’identifier par taille et empreinte. Le contrôle du profil reste celui du produit 3.5/3.6 : ressource présente et exacte, ressource manquante, sceau refusé et motifs actionnables.

Un seul candidat local et un témoin court dans son exécutable, sans installer ni remplacer l’application du porteur. Profil local épinglé 6.13.0-next, aucune dépendance réseau ou installateur système pour les ajouts BMad. Les capacités générales, l’installation/remplacement/restauration et les scénarios G3/G4 restent à 3.9 et 3.10. Distinguer vérification de l’artefact, tests d’hôte et preuve humaine. Version 0.2.18 décidée sous mandat autonome pour distinguer ce candidat de 0.2.17. Garder les artefacts utilisés par l’utilisateur et nettoyer les témoins possédés.

</frozen-after-approval>

## Implementation Notes

Voie courte sur `scripts/release/manifest.mjs`, `tests/release.test.mjs`, `package.json` et les deux champs de version racine de `package-lock.json`. Réutiliser fingerprint et vérification externe du runner. Le profil BMad est attendu si l’entrée de configuration ou la source est présente; exiger le couple et des octets identiques. Les anciens manifestes sans profil restent lisibles. Vérifier le SHA de l’archive contre la preuve 3.4 et les champs de versions du package. Décrire les cas reportés dans une preuve adjacente au manifeste du candidat. Le fichier de test G2 à modification de fins de ligne et les artefacts précédents sont hors scope.

Le nouveau test refuse l’absence, l’altération puis accepte l’archive exacte. Avant correction : rejet attendu absent, 0/1. Après correction : 5/5 tests du manifeste et 1/1 contrôle hôte absent/corrompu. Build 0.2.18 réussi dans dist/init37-candidate. Manifeste et témoin isolé vérifiés sur les mêmes empreintes, aucune conclusion d’installation.

## Plan Change Log

## Review Triage Log

- Q1, medium, patch résolu. L’expression sur le texte ignorait la portée YAML. Le parseur déjà présent charge le YAML et examine les seules déclarations globales et Windows. Témoin rouge Linux puis tests verts, avec chemins quotés valides.
- Q2, medium, patch résolu. Le fichier final pouvait être lu à travers une jonction interne. La chaîne de répertoires jusqu’au candidat inclus et le fichier régulier à un lien sont vérifiés. Jonction reproduite puis refusée.
- Même Quick recontrôle Q1 et Q2. Sept tests de livraison sans saut après correction. Manifeste régénéré sur les mêmes octets de l’installateur, de l’ASAR et de la ressource. Aucun constat différé.

## Verification

- `node --test tests/release.test.mjs`, cas d’hôte existants ressource présente/absente/corrompue, et types/build via `npm run build:win -- --config.directories.output=dist/init37-candidate`.
- `node scripts/release/manifest.mjs --directory=<candidat>`. Relire les empreintes du bundle et de l’ASAR et les limites.
- Une exécution de `scripts/qualification/bmad-initialization.mjs --no-captures` sur l’exécutable du candidat, dossier possédé, accord synthétique et nettoyage. Aucun essai global ou remplacement.
