# Expertise technique indépendante — guidage

28 octobre 2026. Expert technique frais, sans persona BMad et sans rôle de finish-reviewer. Lecture des contrats `DESIGN.md` / `EXPERIENCE.md`, de `direction.md`, du plan de refonte, des douze captures et de leur `profile.json`. Aucun lancement d’application, test, nouvelle capture ou modification produit.

Périmètre observé : états synthétiques du candidat empaqueté, ASAR `e6f0d4326affb6b8d640a7bab0169a673b28f124e49eece65c2da25dc1be9f80`. Le reçu indique `packaged-isolated`, douze contrôles et nettoyage réussi ; toutes les captures sont prises avec `mainScroll: 0`. Ces éléments ne valent ni essai humain, ni G1, ni conformité WCAG.

La séparation Parcours / Conversation et les libellés « Question conservée », « Demande inactive » et « Agent non identifié » rendent les états historiques compréhensibles. Les choix d’approbation restent textuels, sans accord par défaut, après le patch intégral dans `ApprovalPanel.tsx`. Trois écarts matériels restent à corriger pour savoir où agir maintenant.

## E1 — La demande active passe après les rappels et les demandes historiques

**Priorité : moyenne.** Sur [active-question-light.png](packaged-visual-round-1/active-question-light.png), le premier écran se termine au titre « Réponse attendue » : aucun champ de réponse n’est visible. Sur [active-approval-light.png](packaged-visual-round-1/active-approval-light.png), une ancienne « Question conservée » occupe le bas de l’écran ; la proposition active et le début de son patch sont encore plus bas. Le lien de l’overview permet de les rejoindre, mais Conversation commence par un second parcours de navigation au lieu du travail attendu. À 200 %, [conversation-zoom-200.png](packaged-visual-round-1/conversation-zoom-200.png) ne montre que l’en-tête et le rappel de récupération.

**Appui :** `src/renderer/src/App.tsx:393`, puis `:439`–`:448` : overview complet, messages, toutes les questions, toutes les approbations, enfin saisie. Une question historique précède donc systématiquement une approbation active. `WorkOverview.tsx:50`–`:54` répète projet et identifiant de conversation dans chaque ligne.

**Correction minimale :** en Conversation, garder une courte bande critique et les destinations des autres attentes, puis présenter la demande active corrélée avant les anciennes demandes. Regrouper celles-ci dans un historique consultable et rapprocher le point de réponse de l’échange. Conserver les cibles exactes, les brouillons et les positions de lecture. Pour l’approbation, déplacer le groupe complet : portée et patch restent avant les choix, même si sa longueur impose ensuite de défiler.

## E2 — Le résumé replié ne dit pas qu’un arrêt inconnu bloque les échanges

**Priorité : moyenne.** [global-recovery-light.png](packaged-visual-round-1/global-recovery-light.png) montre bien, une fois les détails ouverts, « L’arrêt de Codex reste à confirmer » et le blocage des nouveaux dialogues. La ligne persistante au-dessus dit seulement « Arrêt ou erreur sans projet attribuable · portée globale ». En lecture initiale, le détail est fermé : le débutant ne distingue pas une erreur récupérable d’une interdiction de relancer.

**Appui :** `src/renderer/src/App.tsx:394` et `:428` utilisent des `<details>` fermés par défaut ; `WorkOverview.tsx:51` ne nomme pas l’arrêt non confirmé ni son blocage. Les faits précis restent dans `RecoveryPanel.tsx`, derrière ce dépliage.

**Correction minimale :** exposer hors des détails « Arrêt Codex non confirmé · portée globale · nouveaux échanges bloqués » lorsque l’état existant l’indique, avec l’accès exact à « Vérifier et arrêter Codex ». Garder également le besoin d’inspection visible pour les effets incertains. Les preuves et observations détaillées peuvent rester repliées ; aucune garde métier n’est à assouplir.

## E3 — Deux champs peuvent se présenter comme la réponse à une question native

**Priorité : moyenne.** L’état de [active-question-light.png](packaged-visual-round-1/active-question-light.png) atteste une question active d’un « Agent non identifié ». Le code rend alors le champ propre à la question, puis un second champ libre intitulé « Votre réponse à Mary » ou « Votre réponse à Forge ». Son bouton d’envoi est désactivé pendant l’attente, sans explication locale de cette différence. Le débutant peut saisir sa réponse dans le mauvais brouillon ; le nom affiché y paraît aussi plus certain que dans la demande.

**Appui :** `QuestionPanel.tsx` possède sa saisie et son envoi explicites ; `src/renderer/src/App.tsx:449`–`:452` conserve simultanément l’intitulé de réponse du compositeur libre parce que `sessionPresent` est vrai, alors que `canReply` exige `ready` (`:150`). Ce second champ est sous le cadrage de la capture ; son rendu est constaté dans le JSX, sans nouvel essai interactif.

**Correction minimale :** pendant une question ou une approbation active, nommer le champ libre « Brouillon libre pour ce projet » et indiquer que la réponse ou décision se donne dans la demande corrélée. Garder son contenu et sa sauvegarde ; conserver le destinataire attesté ou inconnu dans la demande, sans déduire son identité de l’invocation. Aucun envoi ni choix supplémentaire.

Ces corrections concernent l’ordre de présentation et la clarté des actions existantes. Elles n’appellent ni catalogue, aide nouvelle, anglais, graphe, changement de palette ou nouvelle interview.
