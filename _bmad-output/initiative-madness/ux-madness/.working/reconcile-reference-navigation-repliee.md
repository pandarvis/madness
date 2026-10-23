# Réconciliation — navigation gauche rétractable

Entrée utilisateur : rétracter le menu de gauche pour optimiser l’espace, illustré par `imports/reference-navigation-repliee.png`. La version livrée a ensuite reçu l’approbation explicite « C’est parfait ».

Sources consultées : `.memlog.md`, l’image importée et les captures actuelles `.impeccable/review/prototype/navigation-repliee.png` et `navigation-mobile.png`. Les captures montrent une simulation de conception, sans connexion Codex ni accès réel aux dossiers.

| Idée qualitative de la source | Traduction dans la maquette | Bilan |
| --- | --- | --- |
| Récupérer de la largeur pour le contenu principal en repliant le menu gauche. | Sur ordinateur, la navigation devient un rail de 58 px ; la capture actuelle montre le parcours et l’aperçu des fichiers à côté. Le memlog rapporte un gain de 136 px dans une fenêtre de 1 130 px. | Intention conservée et approuvée. |
| Garder des points d’accès reconnaissables lorsque les libellés sont masqués. | Le rail conserve les accès principaux et les repères de projets M/A. Le memlog atteste les infobulles au survol et au focus. | Intention conservée ; adaptation aux destinations de Madness. |
| Pouvoir retrouver le menu développé. | Une bascule explicite reste accessible en tête de l’espace de travail ; le memlog décrit les états replié et déployé et leur vérification. | Intention conservée. |
| Réduire l’encombrement sans interrompre le travail. | Le memlog atteste la préservation du brouillon et de la conversation pendant la bascule, ainsi que la mémorisation locale de la préférence après rechargement. | Traduction cohérente avec la demande ; ces détails complètent son usage. |

## Écarts justifiés

- **Rail adapté à Madness.** Les destinations, pictogrammes et repères ne reproduisent pas ceux de Codex. La capture fournie illustre un principe de réduction du menu ; elle n’établit aucune exigence de reprendre les icônes, compteurs ou fonctions propres à Codex. Son texte de conversation n’entre pas dans les exigences.
- **Petit écran.** La capture mobile montre un tiroir temporaire avec libellés et commande de fermeture. Le rail de 58 px est réservé aux largeurs supérieures à 720 px selon le memlog. Cette adaptation conserve l’objectif de libérer la surface de travail lorsque la navigation est fermée.
- **Dimension exacte.** La largeur de 58 px est la traduction retenue et approuvée ; aucune largeur chiffrée n’était imposée par l’entrée utilisateur.

## Idées abandonnées

Aucune perte qualitative utile identifiée pour cette entrée. La demande de rétraction, le gain d’espace et la possibilité de conserver les accès sont couverts par la maquette approuvée. Cette conclusion porte uniquement sur la navigation rétractable ; elle ne constitue pas une nouvelle revue de design.
