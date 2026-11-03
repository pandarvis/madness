# Portée finale du worker — reprise 2.4

Code et pins figés après le dernier batch F4/F1/copie d’accueil. Aucun Main intégral, suite globale, fournisseur, compte personnel ou nouvelle collecte lancé après ce gel. Le parent possède rechecks, détecteur unique, paquet et Quick ; ce reçu ne clôture pas le Build.

## Changements finaux

- **F4, niveau conteneur :** les canoniques sont désormais sélectionnés immédiatement dans chaque epic reconnu (fichier propre ou tickets.toml), même sans sous-dossier tickets présent. PRD, architecture, UX et ses deux spines sont couverts à ce niveau ; modifier leur contenu change la révision et expose le SHA des octets réellement lus. Aucun sous-arbre indifférencié n’est parcouru.
- **Familles confirmées :** brief/prd/ux/architecture/research, ainsi que prfaq, brainstorm et forge. Les formats sont ceux des SKILL.md/customize.toml installés : `<run>/<run>.md`, avec DESIGN.md/EXPERIENCE.md pour UX et brief.md pour la recherche. Les imports, qualifications, preuves lourdes, memlogs et .working restent exclus de ces lectures canoniques.
- **F1, accès aux quatre réponses :** un accès local nommé aux quatre groupes précède le contenu, sans fragment d’URL ni changement de destination. La liste exhaustive des états et preuves est repliée par défaut. Toutes les déclarations restent disponibles ; clavier, focus vers le titre du groupe, récapitulatifs exacts et preuves ouvertes sont préservés. Aucun état global ni pourcentage ajouté.
- **Accueil :** seule la phrase périmée a été corrigée : les preuves se lisent dans Parcours sans connexion ; initialisation et graphe restent à venir. Aucune refonte2.9.

`craft-floor.md` officiel a été lu immédiatement avant cette édition UI ; charte, fontes, palettes et casting existants conservés. Les modifications des autres intervenants n’ont pas été réinitialisées.

## Rouge → vert, batch borné

- `final-red-native-001.txt` : F4 reproduit (canoniques d’epic et leurs mutations ignorés, PRFAQ absent), arrêt du Job attesté.
- `final-red-ui-001.txt` : absence des accès nommés reproduite avec120entrées.
- `node --experimental-strip-types --test tests/bmad-progress.test.mjs tests/bmad-progress-protocol.test.mjs tests/bmad-progress-review.test.mjs` : **13/13, zéro skip**, dont21 contrôles protocole et28 contrôles de revue natifs. `final-green-native-001.txt`.
- `node --experimental-strip-types --test --test-name-pattern='reprise:' tests/connection-ui.test.mjs` : **4/4, zéro skip**, dont120entrées conservées derrière le dépliage, navigation clavier vers résultats/récaps/reste sans traverser les tickets, preuve consultable et dimensions/breakpoints attestés. `final-green-ui-001.txt`.
- `npm run build` (inclut typecheck) : réussi. `final-build-001.txt`.

## Unique lot visuel après gel

Commande : `node --experimental-strip-types scripts/qualification/bmad-progress-visual.mjs --from=_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/main-004 --output=_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/visual-finish-001`.

Le reçu distingue les empreintes de la projection/baseline historiques Main004 et celles du Main/preload/renderer courants ; aucune équivalence binaire globale n’est revendiquée. Les trois vues ordinaires présentent cette observation explicitement ancienne. La liste longue appartient à un projet et à des sources de fixture séparés, explicitement synthétiques ; les conversations alpha Main004 n’y sont jamais réattribuées. Les octets TOML/Markdown de cette fixture sont conservés à côté du reçu.

Cinq PNG natifs sans rectangle, tous ouverts pour inspection :

- `resume-large-dark-native.png` : viewport1440×920, PNG1800×1150.
- `resume-compact-light-native.png` : vrai bouton de thème, data-theme light et workspace rgb246/240/228 ; viewport720×820, PNG900×1025.
- `resume-zoom-200-native.png` : viewport720×460, contenu natif1440×920, PNG1800×1150.
- `resume-long-list-native.png` :120entrées synthétiques repliées et quatre accès présents avant la liste ; PNG1800×1150.
- `resume-long-detail-native.png` : détail natif ouvert au clavier, source/portée/révision et octets de fixture ; PNG1800×1150.

**Limite conservée :** sur la PNG zoom, l’infobulle de thème est encore visible malgré déplacement du pointeur, retrait du focus du seul bouton thème et condition DOM d’invisibilité vérifiée avant capture. La cause de cette différence DOM/frame n’est pas établie. Le reçu ne prouve donc pas une neutralisation visuelle réussie de cette infobulle ; le parent a reçu cette limite et les cinq images pour le même finish reviewer. Aucun tour graphique supplémentaire lancé.

`visual-finish-001/verification.json` contient apparence, états minimized/visible, viewport100%, zoom, pixels natifs/SHA et provenance de chaque cadre. Huit contrôles de banc passent ; zéro helper créé, zéro réseau/app-server après hook, fermeture sans erreur, `cleanupSafe:true`, profil possédé nettoyé. Toutes les sessions worker sont terminées.

## Handoff

Les reçus et captures antérieurs restent historiques, y compris les crops/refus et le compact Main004 mal nommé. Le parent a confirmé le recheck F4 résolu par son auditeur original et prend le verdict F1 du même finish, le détecteur unique, la qualification du paquet et Quick. Aucun verdict reviewer, acceptation humaine globale, installation personnelle ou clôture n’est déduit ici.
