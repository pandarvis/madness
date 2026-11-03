# Corrections H1–H3 et F4

Les sources produit ont été modifiées seulement après fermeture des Main de recapture. Tous les reçus antérieurs sont conservés ; aucun Main complet ni suite globale relancé après chaque constat.

## Reproduction puis correction

- **H1 — annonce étrangère.** Reproduction exacte : après A avec deux sources, B sans projection conservait « Lecture locale terminée · 2 sources · Couverture partielle ». `review-red-ui-002.txt` contient cette assertion rouge. Le premier essai `review-red-ui-001.txt` avait échoué avant cette assertion sur le locateur sidebar à largeur mobile ; sa limite reste conservée. L’effet d’annonce remet maintenant le texte à vide lorsque la destination n’a ni lecture ni observation.
- **H2 — stem alphanumérique.** Un plan `ticket: foo`, joint par `foo.md` d’id2, était attribué à l’id syntaxiquement valide mais absent `foo`. Le lecteur applique maintenant la priorité réelle de tickets.py : id normalisé existant d’abord, stem de feuille ensuite. Les deux déclarations opposées restent sur l’identité2 ; un id orphelin n’est pas remplacé par une identité devinée.
- **H3 — provenance TOML.** Les regex lisaient de faux `[[entry]]` ou `status` dans une description multiligne, et ignoraient des clefs citées valides. Le suivi des positions réutilise les règles de statements du parseur `tomllib._parser` contenu dans le runtime fermé/pinné, comme `tomllib.loads` : chaînes multilignes, tableaux, clefs échappées/citées et commentaires sont consommés intégralement. Seuls les en-têtes `[[entry]]` et leurs champs propres obtiennent leurs lignes. Une forme inline sans localisation détaillée reste partielle, avec entrée à son affectation et champs non localisés non affirmés ; aucune ligne de statut de remplacement n’est fabriquée.
- **F4 — livrables v7.** Les conventions installées (`run_folder_pattern` des skills brief/PRD/UX/architecture/Deep Recon) nomment brief-*, prd-*, ux-*, architecture-* et research-*. Ces dossiers sont inventoriés au premier niveau, puis seuls leurs Markdown canoniques sont lus ; DESIGN.md/EXPERIENCE.md pour UX et brief.md pour la recherche s’ajoutent. Aucun import, mockup, .working, memlog ni sous-arbre qualification/preuves n’est parcouru dans ces runfolders. Un canonique absent reste nommé comme limite. Les références consultées sont les fichiers customize.toml/SKILL.md installés ; aucun workflow supplémentaire exécuté.

La reproduction native `review-red-native-001.txt` montre les deux échecs H2, les six échecs H3 et les canoniques F4 absents ; Job arrêté=0, aucun réseau/fournisseur. La non-récursion des preuves volumineuses était déjà respectée et reste testée.

## Batch final figé

- `node --experimental-strip-types --test tests/bmad-progress.test.mjs tests/bmad-progress-protocol.test.mjs tests/bmad-progress-review.test.mjs` : **13/13, zéro skip**, dont21 contrôles protocole et17 contrôles de revue dans de vrais helpers Windows fermés. `review-green-native-001.txt`.
- `node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` : **3/3, zéro skip**, dimensions/breakpoints et cas H1 attestés. `review-green-ui-001.txt`.
- `npm run build` (inclut typecheck) : réussi. `review-build-001.txt`.
- Nouvelle empreinte de progress.py : `7583a7474168a362af64e9c2c5e9e296e6d06db683e8e8019a9eee96f7293828`, pin mis à jour. Les reçus Main004 et visuels restent ceux de leur propre source antérieure ; aucune équivalence globale entre versions n’est inventée.

Les relecteurs parent doivent recontrôler les corrections. Candidat/paquet et clôture du Build ne sont pas acquis par ce reçu.
