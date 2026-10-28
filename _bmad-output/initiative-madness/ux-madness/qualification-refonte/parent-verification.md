# Recomposition de Madness — résultat technique

**Refonte implémentée, revue, vérifiée et installée.** Le candidat final est `dist/workspace-design-reviewed/`, version0.1.2, ASAR `6664da10ba09364dd5e7584ad812848d48b7bb8f4c48508507434825770684c8`, installateur `8f0b4d3ce5591f04723ea70c5acb07f27ea5194df3c260a819766aca57e51539`. [Le manifeste courant](candidate-reviewed-002/release-manifest.json) relie122inputs et3artefacts ; [le contrôle parent avant installation](parent-final-check-002.json) les retrouve identiques. Le remplacement personnel a ensuite réussi : [huit contrôles](installation/report.json),58empreintes critiques identiques après NSIS, puis57fichiers métier/coffre identiques après réouverture et Local State également inchangé. Compte lisible, MIA/madness seuls, demandes historiques inactives et contrôle fermé. Aucun modèle, OAuth ou nouveau contrôle réseau ; zéro activité spontanée dans les trois secondes après hook. Le [contrôleur conservé](installation/controller.mjs), le relevé initial et le reçu de commande permettent de relire cette opération séparément.

## Ce qui change

Projet et onglets précèdent les états détaillés. Parcours prépare Mary/Forge ; Conversation présente la demande active avant les messages et l’historique secondaire. Le contexte se consulte sur demande, le brouillon libre reste distinct d’une réponse native, et le focus revient à un repère neutre lorsque les contrôles disparaissent. Une seule ouverture de projet à SVG remplace le grand bouton ; ses cibles40px, l’axe28px du rail et la barre native56px sont conservés. Palette sombre terracotta/bleu et clair alternatif inchangés.

La bande critique garde le motif et la portée, notamment arrêt non confirmé et nouveaux échanges globalement bloqués. Les patches actifs restent complets avant les décisions textuelles. Aucun changement Main/preload/connecteur/stockage/version/dépendance, aucune capacité BMad future ajoutée et aucun envoi ou accord implicite.

## Méthode et preuves

Sally a réellement exécuté la mise à jour headless des contrats via BMad ; [son rapport](../preparation-refonte-2026-10-28/update-contracts.md) borne cette spécification. Trois expertises techniques fraîches ont ensuite examiné composition, guidage et accessibilité. Leurs constats U1–U4 sont corrigés et recontrôlés ; ces agents ne sont pas présentés comme des personas BMad.

Le Build distinct4fd7e0ec3f36509603a6 suit la route full/Quick et conserve sa baselineb651f428010f7fc4c232db3b6ee482b9e208dbbe et son bloc figé. Le parent a lu le diff initial1925lignes, puis les deltas de source et de test après les corrections. [La matrice auditée](matrix-audit.md) conserve les échecs intermédiaires et leurs recontrôles.

- [Suite finale après Q1](full-tests-review-q1-001.log) :355/355, aucun échec/ignoré. [Build/types](build-review-q1-001.log) et [paquet Windows](package-review-q1-001.log) passent.
- [Suite intégrée du candidat](integrated-reviewed-001/report.json) :10phases/75contrôles, incluant5Windows et les vrais runners loopback. Aucun compte ni modèle externe.
- [Disposition/conservation finale](reviewed-layout-001/profile.json) :12contrôles, cinq positions de travail, quatre largeurs/deux thèmes, rail/tiroir, zoom200% avec édition/retrait au clavier, contexte et retour de focus, sauvegarde/réouverture exacte. Deux vrais Main fermés/absents, compteurs réseau/app-server à zéro après hook, profils nettoyés. Aucune capture supplémentaire.
- Deux tours visuels groupés,12PNG chacun, tous ouverts par le parent. [Le second tour](packaged-visual-round-2/profile.json) appartient à l’ASAR367bc8…, jamais réattribué au6664da…. [Détecteur unique](detector.json) sans constat.

## Revues et corrections

La [revue officielle de finition](finish-review.md), chargée par un agent technique frais faute de rôle spécialisé exposé, rend `ship` sur l’ASAR367bc8…. Elle nomme l’absence de carte QUALITY BAR distincte, l’échantillonnage source et ses limites. La [documentation Impeccable](documentation.md) préserve les spines adoptées et signale la découverte racine/sidecars et le format hérités sans migration incidente.

La revue Quick BMad trouve Q1 : une préparation invalide une sélection tardive sans retirer `pending`. Correction minimale par le même implémenteur, régression rouge puis3/3ciblés et355globaux. [Le verdict ciblé du même relecteur Impeccable](finish-verdict-q1.md) constate Q1 résolu et juge suffisante la comparaison des contenus embarqués ; aucune recapture exigée pour ce delta fonctionnel. [Comparaison](q1-artifact-comparison.json) : Main/preload/CSS/SVG strictement identiques, HTML avec seule référence JS modifiée, une insertion21caractères reconstituant `setPending(false)` dans le bundle. [Recheck documentaire](documentation-q1.md) confirme cette continuité limitée. Ce verdict ciblé ne devient pas une nouvelle revue globale des pixels du6664da….

Les quatre bancs de détails ont aussi été rendus compatibles avec le paquet1.13 et la refonte après le Q1 de la revue1.11 : [ancien paquet75contrôles](../../tickets/epic-boucle-codex/qualification-e2e/synthetic-current-002/report.json), puis candidat75. Aucun correctif du lot n’est différé. Journaux initiaux/finaux/corrections conservés avec leurs SHA,24originaux retirés de `.working` après copie vérifiée ; tests permanents et preuves utiles conservés.

## Portée

La [qualification native1.11](../../tickets/epic-boucle-codex/qualification-e2e/parent-verification.md) est built dans8880b17 et porte sur l’ASAR9249… installé avant cette refonte. Ses réussites Mary/Forge ne sont pas attribuées au nouvel ASAR. Cette refonte préserve les autorités et les contrats vérifiés ; elle ne rouvre pas implicitement les modèles.

Aucune acceptation visuelle humaine, conformité WCAG, lecteur d’écran, mise à l’échelle Windows ou V1 complète n’est prétendue. Le rendu de zoom Electron est distinct du raster Windows125%. L’anglais, le catalogue/guidage complet, les fichiers/éditeur et R32 restent epic2 ; initialisation3, graphe4, Loop non intégré. Le produit reste personnel, local et privé, avec abonnement ChatGPT conservé.
