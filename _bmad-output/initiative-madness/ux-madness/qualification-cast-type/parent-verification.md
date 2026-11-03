# Typographie et casting atelier — 3 novembre 2026

Mandat humain : remplacer la police de base trop classique par une voix atelier/Borderlands qui reste lisible en conversation longue ; personnages plus déjantés, références BL2 et Tiny Tina. Itération locale sur1a7100c, aucun nouveau Build BMad ni story suivante.

## Changement

Oxanium variable200–800 locale remplace Segoe UI comme premier choix du corps ;450 à16px, petits textes14. Barlow Condensed700 reste pour titres/commandes, monospace reste pour code/chemins. Mesure72ch et interlignes1.65–1.8 conservés. Police téléchargée du dépôt officiel Google Fonts,43 536octets, SHA2ce01d946e1e1ffc8d7eecfffbda8623bedd63eaf811a20488c4b69af45babb0. SIL OFL et copyright sont inclus dans le fichier de notices embarqué.

Sept éditions ImageGen built-in depuis les originaux, Mary-v2 comme référence stylistique commune : contours francs, aplats anguleux, expressions plus théâtrales et accessoires absurdes de rôle. Visages adultes reconnaissables et40px discrets ; fiche dépliable inchangée. Sept1254×1254 RGBA, copie bit à bit des sorties natives, aucune retouche raster locale. Les pixels alpha transparents réels sont comptés en lecture seule dans alpha-inspection.json ; inspect-alpha.mjs documente la méthode. Prompts exacts et références/SHA : resources/atelier-cast-v2/provenance.json. Notices actives réconciliées, état antérieur conservé dans notices-before.json. Palette, identités attestées, modèles et comportements métier inchangés.

## Vérification et revue

- Types/build0.2.3 réussis, Electron45 local et NSIS réussis sans installation de dépendance.
- Typeset : scans typographiques pré/post ciblés [] ; detector-type-final.json. Ce résultat ne remplace pas une revue de rendu ou un audit accessibilité.
- type-initial :9 contrôles avec la nouvelle fonte et anciens bustes ; preuves préliminaires distinctes.
- native-final :15 contrôles et31captures avec les nouveaux bustes, avant correctif F1. UI ciblés atelier :11/11,0skip, fermeture prouvée, journal ui-targeted.log. Aucun nouveau global51/51 revendiqué.
- Relecteur Impeccable indépendant : tous31PNG et7bustes ouverts. TYPE/MATERIAL/GROUND/cadrage match ; F1 chevauchement des disclosures récupération/historique avec le statut. Revue initiale résumée dans review-initial.md, carte QUALITY BAR indisponible déclarée.
- Regression ajoutée dans geometry : summary.bottom doit précéder status.top. Rouge overlap-red :972>958, cleanuptrue. Correction : panneau min-height:min-content, détails flex:none, historique grow à base/height240. f1-recheck :15/15,31recaptures, aucun chevauchement ; compositeur et zoom200 restent valides. Garde UI saisie/action repassée1/1 desktop1440 et compact720, journal ui-composer-final.log. Même relecteur F1resolved/ship ciblé, finish-verdict.md ; pas de nouvelle chasse.
- Paquet final :15/15 dans package-final,9contrôles candidat incluant fonte réellement chargée dans installation/candidate-check.json. Première matrice et premier candidat pré-F1 restent historiques, non équivalents au final.
- packaged-assets.json : sept PNG et TTF extraits de l’ASAR comparés exactement aux sources ; copyright/OFL présents. source-freeze.json :174 entrées identiques au manifeste, release-manifest.json. ASAR final88b244533233e0af8a2426e51f7bc38cb57f9a400ed72ab2d3b2f59bfa2ea8c7.
- presentation-final :3 contrôles, profil fictif, deux captures de présentation du paquet final, cleanuptrue. Le statut presentation ne vaut pas qualification fournisseur.

## Limites

Aucun lecteur d’écran, mode de contraste Windows, conformité WCAG globale, accord visuel humain global ou nouveau clic physique Windows déduit. Les nouvelles images restent des présentations des rôles, pas des preuves d’activité ou de compétence installée. Mesures réseau/app-server seulement après hook ; pas de consentement ni demande au fournisseur. Story2.2/M14 et les autres stories hors lot, version logicielle0.2.3 distincte de story2.3.

## Installation et réouverture personnelles

NSIS0, même chemin et logo conservés ; ASAR final installé exact88b244533233e0af8a2426e51f7bc38cb57f9a400ed72ab2d3b2f59bfa2ea8c7. Les838entrées critiques sont identiques avant/après installation puis après réouverture/fermeture. Réouverture :9contrôles, compte lisible, MIA/madness présents, font-family Oxanium en premier, graisse450 et fonte chargée. Aucun réseau/app-server après hook ; Main et descendants fermés. Reçus installation/installation.json, personal-reopen.json, after-reopen.json.
