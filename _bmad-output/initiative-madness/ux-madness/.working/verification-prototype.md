# Vérification du prototype — 23 octobre 2026

Périmètre : maquette de conception HTML/CSS/JavaScript, avec données de démonstration. Aucun connecteur Codex, accès aux projets réels ou programme d'installation testé.

## Parcours vérifiés dans le navigateur

- Accueil des projets récents et attentes ; ouverture de Madness ; état du brief en brouillon et preuve associée.
- Aperçu du brief ; dialogue d'ouverture éditeur qui expose l'absence de connexion desktop, sans annoncer d'ouverture réussie.
- Invocation `$bmad-ux`, question de Sally, envoi d'une réponse libre, demande d'accord pour produire les brouillons simulés, fin de tour et rattachement des fichiers. Les résultats restent proposés et le workflow ouvert.
- Interruption puis reprise ; erreur récupérable puis réessai au point conservé.
- Catalogue des 27 compétences, recherche « architecture », fiche avec invocation, entrées, résultat et condition d'utilisation.
- Ouverture du dossier Atlas, diagnostic BMad absent, liste des changements envisagés, confirmation de simulation, état prêt à cadrer et recommandation expliquée.
- Réinitialisation de la démonstration avec retour aux données initiales.

Aucun avertissement ni erreur de console observé pendant cette prise en main. Les vérifications syntaxiques `node --check` des deux scripts sont passées selon le renderer ; le catalogue a été comparé aux 30 frontmatters au premier niveau : 27 compétences invocables et 3 métadonnées exclues.

## Inspection visuelle bornée

Deux passes, aux largeurs 1440, 1280 (fenêtre réelle) et 390 pixels. À 390 pixels, `scrollWidth` et `clientWidth` sont égaux à 390. Panneaux latéraux consultables sur demande, sans débordement horizontal global observé. Les captures de l'accueil, du projet et du récapitulatif sont conservées sous `.impeccable/review/prototype/` à la racine du dépôt.

Une seule passe du détecteur Impeccable a signalé le bandeau mobile à 9 px, les points de préparation pulsants et l'association bordure/ombre du dialogue. Corrections appliquées : bandeau à 11 px sur deux lignes, préparation statique et élévation du dialogue portée par son ombre. Les captures finales et la mesure du bandeau portent sur cet état corrigé. Aucun second scan n'a été exécuté.

Le navigateur intégré autorise HTTP/HTTPS et a refusé l'ouverture directe en `file://`. L'aperçu testé utilise `http://127.0.0.1:4173/`. Les fichiers sont autonomes, sans dépendance externe ni appel réseau applicatif selon le renderer ; leur ouverture manuelle dans un navigateur externe n'a pas été testée ici.

Cette vérification confirme les comportements simulés observés. Elle ne remplace pas une prise en main utilisateur, un audit complet d'accessibilité ni les futurs tests de l'application intégrée.

La relecture de finition Impeccable a été confiée à un sous-agent généraliste indépendant suivant son contrat, le rôle dédié n'étant pas disponible dans cette session. Le rapport et son verdict sont conservés sous `.impeccable/review/prototype/finish-review.md`.

Le rapport a demandé deux corrections : supprimer le libellé placé au-dessus du titre de recommandation et porter les textes fonctionnels résiduels à 11 px minimum. Ces corrections ont été appliquées, puis les cinq vues recapturées. Le verdict ciblé `finish-verdict.md` est `ship` : les deux points sont résolus, sans régression observée dans les captures. Cette conclusion porte sur les corrections de finition, pas sur une validation complète du produit ou par ses utilisateurs.

## Retour utilisateur : navigation rétractable

Ajout ciblé du 23 octobre : menu desktop déployé ou rail de 58 px, selon la capture utilisateur conservée dans `imports/reference-navigation-repliee.png`. Bascule avec nom accessible, `aria-expanded` et `aria-controls`, raccourcis conservés, projets M/A distincts et infobulles au survol ou au clavier. La préférence est mémorisée avec repli sûr si le stockage local est indisponible.

Vérification navigateur : la navigation passe de 194 à 58 px dans la fenêtre observée de 1 130 px, soit 136 px rendus à l’espace de travail. Une réponse en cours et l’onglet Conversation restent intacts pendant un aller-retour déployé/replié. Après rechargement, le rail reste à 58 px. Le focus clavier sur « Que faire ensuite ? » affiche son infobulle hors du rail. À 390 px, le tiroir s’ouvre avec ses libellés et se ferme ; aucune largeur globale excédentaire observée. Aucun message de console relevé ; `node --check app.js` passé selon le renderer.

Captures ciblées : `navigation-repliee.png`, `navigation-deployee.png` et `navigation-mobile.png`, sous `.impeccable/review/prototype/`. Ces contrôles portent sur cet ajout ; le verdict précédent n’est pas présenté comme une nouvelle relecture exhaustive.
