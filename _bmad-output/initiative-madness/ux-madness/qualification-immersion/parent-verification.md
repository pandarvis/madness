# Finition du vrai atelier Madness

Base : `codex/atelier-ui`, commit `69b2fb5`. Travail isolé sur `codex/atelier-immersion`. Le porteur a demandé une application qui porte réellement l'univers atelier/Borderlands approuvé. Cette passe interactive affine le renderer existant ; aucun nouveau Build BMad ni clôture de story n'est revendiqué.

## Changements

La nouvelle feuille `atelier-immersion.css`, chargée après le système existant, prolonge l'atelier dans les cartouches, messages, onglets, commandes, en-têtes et cadre du compositeur. Un auteur reste repérable durant la lecture de son article. Les conversations ordinaires utilisent la hauteur disponible avec un minimum de lecture ; les questions et approbations longues gardent le flux naturel. Palette, fonte et assets sont hérités ; aucun contrat métier, IPC, fournisseur, compte, profil personnel ou installation n'est modifié.

Le harnais UI charge explicitement la nouvelle feuille. Deux gardes comportementales vérifient le champ avec son action au premier écran, et l'auteur avec une portion lisible du dernier texte. Le mode opt-in `--presentation` du banc natif produit une démonstration fictive séparée de ses contrôles avec noms longs et demandes critiques.

## Vérifications fraîches

- Types et compilation Electron réussis après les dernières corrections.
- Apparence : 7 tests réussis, zéro saut.
- Suite UI de base : 48/48 réussis, zéro saut. Son fixture avait été chargé avant l'ajout de la feuille ; ce résultat reste distinct de la validation de la finition.
- Fixture actuel : 10 contrôles atelier réussis après correction verticale. Une première sélection avait donné 6/7 ; le point de saisie à 720 était repoussé, cause corrigée et test historique rejoué avec succès.
- Après le sticky : lecture progressive réussie ; après les derniers minimums, garde champ/action réussie à 1440×920 et 720×820, scroll principal zéro ; garde auteur/texte réussie, auteur visible 48 px et texte visible 58,8/54,8 px. Aucun 50/50 global final n'est inventé.
- Banc natif compilé final `review-reading/profile.json` : 14 contrôles passés, nettoyage confirmé. Thèmes, six largeurs, rail, fiches, demandes, récupération et réouverture sont vérifiés dans leur périmètre synthétique. Réseau et moteur ne sont comptés qu'après instrumentation.
- `presentation-reading/profile.json` : deux vues de présentation du vrai renderer, données fictives, nettoyage confirmé, aucun modèle demandé.
- Détecteur Impeccable exécuté une fois sur les fichiers UI : `[]`, avant les corrections demandées par le relecteur ; non rejoué.
- Revue indépendante : F1/R1 résolus, `ship` limité aux corrections ; documentation du système réconciliée par un substitut technique du documenter officiel.

Le premier essai de banc n'avait pas son dossier de sortie parent. La première matrice mesurée a ensuite identifié un débordement de 6 px par le pseudo-cadre de saisie ; marge de 7 px réservée, puis matrice complète conforme. Les preuves intermédiaires sont conservées.

## Livraison et limites

Le candidat final est construit séparément sous `dist/atelier-immersion-reviewed/`. Le manifeste de livraison vérifie 154 inputs ; ASAR `8f0f87705c44755c7fcf8e3cdf3564487c02aa2ef239bb7ec35b00e25d8c4cb4`, installateur `ab0991c8447f056236e961ce95b9c52df5a63720a079cae6cf8ae0c4e5d183f2`. Le contrôle natif du binaire final `packaged-final/profile.json` passe 14 contrôles sans capture supplémentaire et confirme son nettoyage. Les anciens candidats `dist/atelier-immersion/` et la base 69b2fb5 restent distincts. Aucune installation personnelle n'est effectuée par cette passe. La qualification réseau 2.2/M14 demeure hors périmètre et n'est pas réouverte.

La tentative de nouveau lanceur BMad du tour précédent échouait sur le temporaire sandbox puis sur le téléchargement Jinja2 via le proxy. Aucun script de workflow source n'a été exécuté directement ; cette passe de finition interactive ne prétend pas produire un nouveau reçu bmad-build.
