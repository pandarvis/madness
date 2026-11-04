# Catalogue BMad 2.6 — vérification finale du parent

Le catalogue installé est consultable depuis « Toutes les possibilités », sans initiative ni connexion IA. La découverte native, la recherche locale, les fiches sourcées et la copie exacte sont livrées ; le lancement général reste 2.7. Cette clôture suit le Build full/Quick rendu une fois, baseline `d0c706642673a56fcaf0138ee216219b9b20e8b3`, gel inchangé.

L’index faisant autorité pour ce lot est [verification-parent-final.json](verification-parent-final.json). Le candidat **0.2.10**, ASAR `687f495a869c767949a2c79535efe107fdf5202255ba0265aa9cc1d3d90b624a`, NSIS `22a013f94fb73f064bddc51eb62f564b2a92b86b147025c13f3bdd4fd13e7244`, est construit et **non installé**. Les `final-manifest.json`, `verification-current.json` et `worker-handoff.md` initiaux restent des reçus historiques ba7 ; ils ne décrivent pas ce candidat final.

## Vérifications exécutées

| Portée | Résultat et reçu |
|---|---|
| Cœurs, contrats et protocoles Windows | 81/81, zéro échec/skip — [log](logs/parent-targeted-final.log). Inputs backend/natifs inchangés après F1/V1 ; [delta explicite](finish-f1-changed-inputs.json), capsule d’origine `parent-final-proof/producer-manifest.json`. |
| App réelle et styles, pont synthétique isolé | 10/10, zéro échec/skip — [log](logs/parent-ui-finish-final.log). Sept cas catalogue et trois cas thème/navigation/actualisation ; historique, question active, focus, deux thèmes, compact et zoom200. |
| Banc d’attente normal corrigé | 3/3, zéro échec/skip — [log](logs/parent-wait-final.log). Prédicat synchrone, séquences monotones et suppression réellement observée. |
| Types, build, NSIS | Codes 0 — `logs/parent-finish-build.log`, `logs/parent-finish-package.log`. Aucune dépendance modifiée, seules versions racines 0.2.10. |
| Frontières du paquet | [audit indépendant003](parent-audit-003.json) : 15 ressources × deux emplacements, pins Main, 735 fichiers runtime, 19 sorties compilées, 4 033 empreintes historiques identiques. |
| Main/préchargeur Windows du vrai paquet | [finish-f1-final-003](finish-f1-final-003/verification.json) : dix groupes réussis, 53 inputs exacts avant exécution/recontrôlés, presse-papiers Windows écrit/relu, occupation réelle du helper, deux projets sans initiative/compte, ajout et retrait attendus réellement, bascule volontaire, conservation et réouverture passive exactes. Job vivant 3→0, terminal corrélé et drain, deux Main/descendants fermés, nettoyage sûr effectué. Compteurs réseau/app-server à zéro **après hook seulement**. |

Les trois suites sont des exécutions séparées, pas un total unique inventé. La [matrice finale C1–C9](parent-matrix-final.json) relie chaque ligne du plan à un cas passé et, si applicable, au Main final correctement attendu.

## Revues et corrections

H1 (invalidation pendant le second passage) réarme la seule suite déjà enregistrée. Q1 réserve le masque du nom énuméré même si son lstat est refusé ; la copie utilisateur inférieure ne ressuscite pas. Q2 conserve le bouton de bascule et son focus après sélection. N1 empêche l’auto-reprise STOP_UNCONFIRMED, y compris l’écho entre deux projets au relâchement de l’admission partagée réelle. Le même implémenteur a corrigé ces points ; Quick et l’auditeur high originaux les ont recontrôlés résolus sur les sources finales. Les rouges/intermédiaires restent conservés, dont `parent-stop-release-red.json` et `parent-stop-two-project-red.json` ; aucun nouvel intent ou loopback n’a été nécessaire.

V1 concerne le banc : le Playwright installé acceptait une Promise de prédicat avant sa résolution. Le contre-exemple false et le diagnostic [functional002](diagnostic-functional-002/diagnostic.md) sont conservés. Le produit be41 inchangé y passe après une attente synchrone de l’état réel ; le banc normal reprend ce mécanisme et le Main final 687f le vérifie. Les anciennes attentes seules ne sont pas rétroactivement promues ; leurs assertions directes de fichiers, clipboard et arrêt ne sont pas invalidées en bloc.

F1 compacte seulement le préambule et réemploie WorkOverview compact. Le premier résultat complet arrive à y701,5→861,5 en 1440×920 ; date, couverture, révision complète, contexte et question active sont conservés. Deux lots parent historiques et **un unique lot de correction demandé par le finisher** ont eu lieu, soit trois au total, explicitement comptés. Aucun autre polish n’a été poursuivi. Un seul détecteur a renvoyé `[]` avant cette correction locale ; il n’a pas été relancé.

Les cinq images finales ont été ouvertes par le parent et le même finisher : [sélection/empreintes](visual-finish-selection.json), [verdict F1 résolu / ship limité](impeccable-finish-review.md). Les positions courantes des fiches ne prouvent pas un sommet de document. Les rôles natifs Impeccable n’étant pas disponibles, les substituts techniques frais ont chargé leurs définitions officielles ; aucune persona Sally supplémentaire ni acceptation humaine/WCAG globale n’est revendiquée. Le [documenter](impeccable-documentation.md) conserve les six autorités et les dérives historiques explicites ; aucune régénération incidente du système.

## Limites et suite

Le symlink fichier natif reste non exercé faute de privilège ; hardlink et jonction physiques sont couverts. Aucun profil/compte personnel, fournisseur, modèle, réseau, connexion ou installateur personnel n’a été modifié ; aucun gate humain/G2/G4/G5 supplémentaire acquis. Les copies locales producer/out et node_modules ignorées ne sont pas toutes committées ; leurs manifests d’empreintes bornent les inputs exécutés.

Aucun correctif du lot 2.6 n’est différé. La lacune préexistante des autres bancs utilisant des prédicats asynchrones est enregistrée dans `deferred-work.md` pour **2.15 avant réemploi**. Aucun ancien epic n’est rouvert. Le mandat continue **2.8 → 4.4 : panneau de fichiers commun puis véritable onglet Graphify**, puis le backlog adopté. Aucun clic Zscaler ou renseignement humain en attente.
