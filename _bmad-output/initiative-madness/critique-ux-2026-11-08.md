# Critique UI/UX de Madness — essai autonome sur un projet morpion (8 novembre 2026)

Essai conduit par Claude sur la version de test (branche `chore/requalifier-runtime-python`), avec un profil jetable et un dossier vide `C:\Sources\madness-tests\morpion`. Le parcours est piloté dans la vraie interface (clics, attentes, captures) : ouvrir le dossier, initialiser BMad, choisir Claude Code, lancer Mary, parcourir le catalogue, les aides et le graphe.

Chaque proposition est à **valider ou refuser** par le porteur. Priorité : P1 bloque ou perd un débutant, P2 ralentit ou trouble, P3 confort.

## Ce qui marche bien

- **L'initialisation est solide :** plan exact (462 fichiers, 126 dossiers), accord explicite, puis « Ajouts vérifiés selon le plan ». Aucun fichier existant n'est touché.
- **Le graphe fonctionne sans modèle :** 4 fichiers JS, 14 éléments, relations justes, en quelques secondes.
- **Le catalogue :** les 27 compétences sont lisibles, avec recherche et filtre par module.
- **Le refus Claude Code est propre :** quand la CLI n'est pas admissible, Madness s'arrête net, sans effet et sans boucle.

## Constats et propositions

### P1 — Le débutant ne trouve pas l'initialisation

**Constat.** Dans un dossier sans BMad, rien ne le dit. La page affiche « Choisir une initiative », « Information non établie » ×4 et des boutons Mary/Forge inutilisables. Pour initialiser, il faut : Voir le diagnostic → faire défiler le panneau → Actualiser le diagnostic → Préparer l'initialisation → Ouvrir la décision → Initialiser BMad, soit **6 clics**, dont 2 dans un panneau latéral à faire défiler.

**Proposition.** Quand BMad est absent, remplacer tout le Parcours par une seule carte : « Ce dossier n'utilise pas encore BMad », un bouton **Initialiser BMad** qui lance le diagnostic et prépare le plan d'un coup, puis l'écran de décision. Masquer Mary, Forge, les preuves et les initiatives tant que BMad n'est pas installé.

### P1 — L'IA choisie n'est pas celle que l'écran propose

**Constat.** Avec Claude Code choisi dans la dynamic island, le Parcours montre toujours « Mary · Analyste BMad · Codex », « Lancer Mary avec Codex », « Chaque tour utilise votre forfait ChatGPT » et « Connectez d'abord votre compte Codex ». Le panneau Contexte affiche « Fournisseur : Codex ». Seul l'onglet Conversation suit le choix.

**Proposition.** Un seul bouton « Lancer Mary » partout, qui utilise l'IA de la dynamic island, avec des textes qui en dépendent (« forfait Claude » ou « forfait ChatGPT »). Le panneau Contexte reflète ce choix.

### P1 — Lancer un vrai tour demande trop de préalables invisibles

**Constat.** Le premier lancement Claude Code a échoué avec « Cette installation de Claude Code n'est pas qualifiée pour ce lancement ». La vraie cause était double : une CLI en 2.1.220 alors que la 2.1.318 est attendue, puis une CLI non connectée. Le message ne dit ni quoi faire ni où.

**Proposition.**
- Dans les Réglages, afficher l'état de Claude Code en clair : version trouvée et attendue, connecté ou non, avec l'action à faire (« Ouvrez un terminal et tapez `claude auth login` »).
- Dans la dynamic island, montrer cet état réel au lieu de « vérifié au lancement ».
- Mettre l'action concrète directement dans le message d'erreur.

### P2 — Le vocabulaire parle à l'outil, pas à l'utilisateur

**Constat.** « Sélection consultée : aucune · Acceptation humaine inconnue », « Information non établie », « Révision du contexte non observée », « 3 records non invocables », identifiants de plan et empreintes SHA en clair, « Version affichée : b40686… ». Les descriptions des 27 compétences sont en anglais dans une interface en français.

**Proposition.**
- Un niveau « débutant » par défaut, qui dit ce qui est fait, ce qui reste et la prochaine action.
- Les identifiants, empreintes et provenances passent dans un dépliant « Détails techniques ».
- Traduire, ou au moins résumer en français, les descriptions des compétences.

### P2 — Le Parcours est une longue page sans hiérarchie

**Constat.** Diagnostic, activité, reprise, quatre boutons d'ancre, quatre sections vides, aides, Forge puis Mary s'empilent. La seule action utile du moment (initialiser, puis lancer Mary) se trouve tout en bas.

**Proposition.** En tête du Parcours, une carte « Prochaine étape » avec une seule action principale, calculée selon l'état : initialiser, choisir l'IA, lancer Mary, reprendre une conversation. Les sections vides sont repliées ou masquées.

### P2 — Après l'initialisation, l'état reste périmé

**Constat.** Une fois l'initialisation terminée, le panneau Diagnostic affiche encore « L'absence de BMad doit être établie » et « Profil BMad non observé ». Le seul signe de réussite est « Ajouts vérifiés selon le plan », sans la suite.

**Proposition.** Rafraîchir automatiquement le diagnostic après l'initialisation, puis afficher une confirmation : « BMad est installé. Prochaine étape : parler à Mary pour cadrer votre projet. »

### P2 — Une activité en bloque une autre sans le dire à l'avance

**Constat.** Ouvrir « Voir les aides » pendant la lecture du catalogue renvoie « Lecture impossible : une activité possède déjà les outils locaux ». La lecture du catalogue dure environ 10 s, sans indication de durée.

**Proposition.** Mettre la demande en file et l'exécuter dès que possible, ou désactiver le bouton avec « Disponible à la fin de la lecture du catalogue ». Afficher une progression pendant la lecture.

### P2 — Le graphe est loin de l'écran

**Constat.** Le dessin du graphe commence sous plusieurs blocs de texte (périmètre, revalidation, recherche) : il faut défiler pour le voir.

**Proposition.** Le dessin passe en tête, avec la recherche intégrée. Le périmètre et la fraîcheur vont dans « Détails de l'analyse ».

### P3 — Petites finitions

- **Infobulle collante :** l'infobulle « Ouvrir un projet » reste affichée après avoir choisi un dossier (focus rendu au bouton après la boîte Windows).
- **Libellés à harmoniser :** le bouton de l'accueil dit « Ouvrir un projet », alors que la carte parle de « dossier ».
- **« Choisir une initiative » :** proposé en permanence alors qu'aucune initiative n'existe encore. Il faudrait le masquer ou expliquer ce qu'est une initiative.
- **Contrôle « US du prochain tour (facultatif) » :** affiché au débutant. Il pourrait passer dans les options avancées.

## Ce qui n'a pas pu être testé

- **Les vrais tours avec un modèle.** La CLI Claude Code est maintenant à la version qualifiée (2.1.318, empreinte conforme), mais elle n'est pas connectée. Codex n'a pas de compte enregistré dans Madness. Une connexion du porteur est nécessaire : `claude auth login` dans un terminal, ou la connexion ChatGPT dans les Réglages. Ensuite, le banc reprend avec Mary, une question sur le morpion, puis un workflow.
- **La relecture humaine de l'accessibilité :** clavier complet et lecteur d'écran.
