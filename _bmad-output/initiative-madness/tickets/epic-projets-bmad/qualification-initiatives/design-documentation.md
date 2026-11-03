# Story 2.3 — documentation de l’extension d’initiatives

Relevé du 3 novembre 2026. Substitut technique frais du rôle natif `impeccable_documenter`, indisponible dans ce harnais. Définition officielle `agents/impeccable_documenter.toml` et référence `reference/document.md` du plugin Impeccable 4.3.1 chargées avant ce relevé. Mode Scan, extension ordinaire du monde atelier existant ; la source finie fait autorité.

## Décision documentaire

Aucune modification de `DESIGN.md` ou de `.impeccable/design.json`. Les règles réutilisées par ce sélecteur sont déjà établies ; aucune nouvelle palette, famille typographique, identité illustrée ou primitive durable ne justifie leur régénération. Le seul fichier écrit par cette passe est le présent rapport.

Sources comparées : `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, contrat de surface `.impeccable/surfaces/src-renderer-src-app-tsx.md:68`, `src/renderer/src/App.tsx`, `InitiativeSelector.tsx`, `initiatives.css`, `QuestionPanel.tsx`, `ApprovalPanel.tsx`. La cascade a été vérifiée dans `main.tsx`, `styles.css` et `atelier-controls.css`. Ces chemins renderer sont sous `src/renderer/src/`.

## Preuves de continuité

| Règle existante | Réalisation observée dans le code fini |
| --- | --- |
| Quiet Reading : fonds de travail calmes, matières aux contours | `initiatives.css:6` utilise `--panel`, `--text`, `--control-line`, `--panel-shadow` ; les choix utilisent `--surface`, le survol `--hover`, la sélection `--selected` / `--selected-text`. Aucun fond de lecture illustré ni couleur nouvelle. Les variables clair/sombre existent dans `styles.css:4` et `:46`. |
| Two Voices : Barlow pour titres/commandes, Oxanium pour lire, monospace pour les preuves | Le titre de dialogue prend 28 px ; les noms de choix Barlow Condensed 700 à 23 px ; les marqueurs, sources et révisions Oxanium 450 à 14 px et interligne 1,55 ; les chemins/révisions Consolas 14 px. Le texte général hérite d’Oxanium 450 à 16 px. Commandes héritées Barlow 700 à 19 px. |
| Commandes explicites, cibles 44 px et fermeture 40 px | Déclencheur et options ont un minimum de 44 px ; fermer a 40 × 40 px. Le déclencheur conserve la plaque `text-button` existante, un nom lisible et un chevron SVG de 19 px, trait 1,5. Le contour clavier réutilise `--focus`, 2 px avec décalage de 3 px. |
| Working Center : projet, onglets puis travail, consultation à la demande | `App.tsx:459` place le sélecteur sous le titre projet dans le bandeau existant. Le dialogue natif est borné à 760 px / fenêtre moins 32 px ; sous 721 px, fenêtre moins 16 px. L’en-tête reste hors défilement ; le corps défile et les noms/chemins se replient. Les actions deviennent une colonne au petit format. Cette géométrie locale ne devient pas une nouvelle règle globale. |
| Explicit State : état et portée en texte réel | `InitiativeContext` sépare « Sélection Madness » et « Active dans BMad ». Le dialogue explique que le choix de consultation est local et que chaque échange garde son initiative capturée. Sélection/active, disparition/racine non vérifiée, session non enregistrée, lecture et échec sont libellés. Source et révision par initiative restent consultables dans des détails HTML. |
| Préserver les demandes et leur contexte capturé | `App.tsx:460` affiche l’initiative capturée par l’échange. `QuestionPanel.tsx:13` et `ApprovalPanel.tsx:12` emploient aussi « Initiative capturée » depuis le record concerné ; leur saisie et leurs actions restent dans les composants existants. Ce constat porte sur le rendu de ces captions, sans certifier à lui seul les contrats backend. |
| Consultation locale et priorité modale | Le code ouvre un `dialog.showModal()`, donne le focus au choix courant sinon au titre, ferme sur Échap/Fermer/Annuler et programme le retour au déclencheur. La prop `priority` diffère son ouverture face au tiroir ou à la confirmation existante. Il s’agit d’une lecture de code, pas d’une observation Windows ou clavier physique. |

## Système résumé en cinq lignes

1. Palette : anthracite/ivoire de lecture, pétrole de chrome, terracotta d’action et bleu de repérage hérités ; aucun token nouveau.
2. Titres et commandes : Barlow Condensed locale 700 ; sélecteur de titre 28 px, noms d’initiative 23 px, commandes héritées 19 px.
3. Lecture et preuves : Oxanium locale 450 à 16/14 px ; chemins et révisions en monospace 14 px.
4. Quiet Reading / Explicit State : fonds calmes, état et portée nommés, sélection de consultation distincte du contexte capturé.
5. Working Center / Two Voices : sélecteur dans le flux projet, un dialogue natif, contrôles 44/40 px et focus bleu hérité.

## Dérive préexistante conservée

Le parent transmet la directive `CONTEXT_STALE` reçue au contexte initial. La preuve documentaire vérifiée ici est précise : `DESIGN.md` et `narrative.overview` du sidecar mentionnent encore le candidat logiciel 0.2.5 et sa portée d’acceptation ; le contrat de l’extension dit hériter du contrat atelier 0.2.6 adopté. Aucun accord visuel humain global n’est déduit de cette adoption. Le sidecar est daté `2026-11-03T13:25:46.363Z`, schéma 2, avec onze spécimens. Cette ancienneté de provenance n’est ni réinterprétée ni réparée par l’extension 2.3. Aucune autre dérive n’est déduite, aucune restriction ou valeur nouvelle n’est canonisée pour faire disparaître un défaut.

## Conservation et limites

Empreintes SHA-256 du relevé, conservées pour permettre au parent de vérifier l’absence de modification par cette passe :

- `DESIGN.md` : `f683165bddc8dd246d8e25f6acfaad801bd330b0af4344caac2fc01d6c1f5178`.
- `.impeccable/design.json` : `91c057fa0734124969403a97135c9ac038613bfa7e9f0c4f4ad6c5b932fcb827`.
- `resources/atelier-cast-v2/provenance.json` : `cedf9a7a466f7491e7409f0db748772061f43be2d40e9cb769b12c77c364f317`.
- `src/renderer/src/App.tsx` : `2589a62489cfb342057d5de31d6566944b00a6abb42b30e83def59df4b2cb808`.
- `src/renderer/src/InitiativeSelector.tsx` : `915c41f8e5f901e29f2e66b1eeb7acf0b10810495aebba5ed732767d57121aab`.
- `src/renderer/src/initiatives.css` : `f67cd411976b6300e271b97280b5cb26dffe7e750b2a6b15939f6ad2f598b421`.
- `src/renderer/src/QuestionPanel.tsx` : `61a2b4e8c2ece09fa914391c3fdeb6cc518c71da5a9765f6e56baa702d8da9c6`.
- `src/renderer/src/ApprovalPanel.tsx` : `4b12ffa86273bcd65d7d72c3e7f1bdc8632f5944162d558383093ee3f496e3b3`.

Aucun raster n’a été généré, remplacé ou écrit dans cette passe ; aucun asset n’est ajouté par les cinq fichiers de l’extension inspectés. La provenance existante du casting v2 et des décors reste portée par ses fichiers établis, sans prétendre un nouvel audit exhaustif de leurs octets. Aucun code produit, test, profil, réseau ou commit n’est modifié ou exécuté par ce rôle.

Le parent signale séparément un détecteur mécanique unique sur les cinq fichiers modifiés retournant `[]` et huit PNG de confirmation valides ; je ne transforme pas ce relais en inspection visuelle personnelle. Le rendu, les captures, le finish/verdict et la qualification intégrée sont traités séparément par le parent. Ce rapport ne vaut ni revue visuelle globale, ni conformité WCAG globale, ni nouvelle validation humaine, ni story 2.3 built.
## Recheck final après corrections Q3 / Q4

Relecture source du 3 novembre 2026, après corrections des callbacks/séquences et des générations d’ouverture. Les empreintes et numéros de ligne du premier relevé restent historiques ; les empreintes ci-dessous désignent les deux fichiers finaux relus.

- **Q3, App.tsx** : `currentProjectId` est tenu à jour au rendu et vaut `undefined` à l’accueil ; `dialogueSequence` conserve la dernière séquence acceptée. `acceptDialogue` ignore une séquence inférieure avant de modifier le dialogue. Le conflit de contexte n’ouvre le sélecteur que pour une erreur `CONTEXT_MISMATCH` d’un lancement encore corrélé : séquence postérieure au départ, token de navigation courant, projet du lancement égal au projet courant, projet du reçu nul ou identique, invocation `$bmad` ou `$bmad-forge-idea`. Les callbacks abonnés une fois lisent ces refs courantes. Cette relecture soutient la portée du dialogue de conflit déjà décrite, sans étendre le système visuel.
- **Q4, InitiativeSelector.tsx** : les refs `opening` et `openNow` identifient une ouverture. Fermeture, nouvelle ouverture, changement de projet et démontage invalident la génération précédente. Les états locaux d’une lecture ou d’un choix tardif ne s’appliquent qu’à l’ouverture encore courante ; un choix ne ferme que le dialogue courant encore ouvert. Le retour de focus différé vérifie aussi la génération et l’absence de réouverture. L’acceptation de l’état métier reçu reste séparée de ces effets locaux, avec la garde de séquence existante de `useBmadContext`.
- Le JSX du sélecteur et son insertion/caption dans `App.tsx` restent ceux du premier relevé ; les changements relus sont dans les refs et callbacks. Les captions de `QuestionPanel` et `ApprovalPanel` restent identiques par empreinte. Le sélecteur est maintenant à `App.tsx:461`, la caption d’échange à `:462` et le contexte consultable à `:549` ; ce déplacement de lignes n’est pas un changement de composition. Les corrections visuelles F1–F4 et le CSS restent conservés.
- Empreinte finale `src/renderer/src/App.tsx` : `3727b59e4bfd881035a4b606959df76b505e4759b098be8327b35eb453c2849c`.
- Empreinte finale `src/renderer/src/InitiativeSelector.tsx` : `e32c02a10a16e2e082cffc3d46b0ece9affe2549f4bb80e5a226fb3d5b4de94d`.

Confirmation par nouvelle lecture SHA-256 : `DESIGN.md`, `.impeccable/design.json`, `resources/atelier-cast-v2/provenance.json`, `initiatives.css`, `QuestionPanel.tsx` et `ApprovalPanel.tsx` conservent exactement leurs empreintes du premier relevé ci-dessus. Aucune réécriture du système de design ou de provenance n’est effectuée. Les autres feuilles de la cascade sont conservées ; leurs empreintes de référence relevées à ce recheck sont `styles.css` = `6e890cd801f2e686f6e054e5957ad09617356a97a8fb32d5f54a81800f04fab3`, `atelier-immersion.css` = `4f1ed5e84745667f33fc74f74e2271f2fc58043bf4459fa29cd80fb6ba41236d`, `atelier-controls.css` = `7cc7b3738ae1cc892d5938069b361aedee08d7f46b15ce1c901f85a507519570`.

Conclusion documentaire inchangée : extension du **contrat atelier 0.2.6 adopté**, sans nouvelle règle globale ni réparation du `CONTEXT_STALE` préexistant. La relecture vérifie le code et la conservation des primitives ; elle ne remplace pas les tests de course, la qualification intégrée ou le finish du parent, n’exécute aucun test ni appel réseau et ne déduit aucun accord visuel humain global. Seul ce rapport est modifié par le recheck.

## Recheck ciblé du diagnostic BMad

Relecture source du 3 novembre 2026 après ajout de la paire `dt` / `dd` « Diagnostic BMad » dans `InitiativeContext` (`InitiativeSelector.tsx:17`). Les deux relevés précédents restent historiques : la mention de JSX inchangé au recheck Q3/Q4 décrit ce point antérieur, avant cette paire supplémentaire. Le composant est partagé par le dialogue de choix et le panneau de contexte projet existants ; l’ajout conserve leurs listes de définitions HTML et les styles hérités.

La table `contextDiagnostics` (`InitiativeSelector.tsx:5`) projette exactement les six valeurs déjà définies par `BmadContextObservation.status` (`src/contracts/bmad-context.ts:5`), sans produire de nouveau diagnostic ni modifier le contrat reçu :

| État reçu | Texte projeté |
| --- | --- |
| `absent` | Installation BMad non repérée |
| `legacy-observed` | Traces d’une ancienne installation BMad |
| `unknown` | Profil BMad non identifié |
| `incompatible` | Lecture du profil BMad refusée |
| `partial` | Observation BMad partielle |
| `candidate-observed` | Profil BMad candidat observé |

Sans observation, le texte est « Profil BMad non observé ». Ces libellés gardent leur portée d’observation : ils ne déclarent pas un profil globalement compatible, validé ou qualifié ; notamment, un candidat observé reste candidat. Les libellés de sélection Madness, d’active BMad et d’initiative capturée demeurent distincts. Cette projection factuelle applique Explicit State avec les deux voix, palettes et espacements existants ; aucune nouvelle règle de design n’est nécessaire.

Empreinte courante de `src/renderer/src/InitiativeSelector.tsx` : `fd94a3ac76710cc9a9b7c528eb728bbab8e3c181fe734f0cfd68e65b2c8e49b1`. L’empreinte `e32c02a1…` du recheck Q3/Q4 reste celle du point antérieur. Nouvelle lecture des fichiers conservés : `App.tsx` reste `3727b59e4bfd881035a4b606959df76b505e4759b098be8327b35eb453c2849c` ; `DESIGN.md`, `.impeccable/design.json`, `resources/atelier-cast-v2/provenance.json` et `initiatives.css` conservent exactement les SHA-256 de leurs relevés précédents. Aucun CSS, token, raster ou fichier de provenance n’est écrit dans cette passe.

Le parent signale trois PNG sous `qualification-initiatives/visual-diagnostics-final-001` : profil inconnu en clair, installation non repérée en compact sombre, et contenu long avec zoom. Il les décrit comme des captures synthétiques du renderer source. Je ne les ai pas ouverts dans cette passe et ne revendique donc ni inspection personnelle de ces images, ni preuve native du paquet installé. Leur validation visuelle et leur lien au candidat restent traités par le parent.

Le contrat atelier 0.2.6 reste adopté ; aucune validation visuelle humaine globale, qualification BMad globale, conformité WCAG ou clôture de story n’est déduite. Aucun test, build, réseau, agent ou commit n’est lancé par cette relecture ; seul ce rapport est complété, sans réécrire le système ni réparer le `CONTEXT_STALE` historique.
