# Trois parcours à éprouver dans le prototype

Propositions de Sally du 22 octobre 2026. Les préférences d'accueil et d'aperçu ont été confirmées ; les détails d'interaction ci-dessous restent à tester. Le prototype HTML est une simulation locale, sans connexion à Codex ni modification des projets.

## 1. Ouvrir et retrouver un projet

Sam, développeur qui découvre BMad, rouvre Madness après une interruption. Il veut retrouver son travail sans relire toute la conversation.

1. L'accueil présente les projets récents et les réponses ou décisions attendues. Les attentes sont nommées : une question de Sally, un livrable à relire, une exécution interrompue.
2. Sam ouvre Madness depuis les projets récents ou sélectionne un dossier. Le diagnostic distingue une installation v7 compatible, une installation absente et une installation non prise en charge.
3. Pour un projet existant, Sam voit les artefacts trouvés et ce qui permet d'en déduire l'état. Une conversation externe n'est pas reconstituée à partir des fichiers.
4. Pour un dossier sans BMad, Sam peut lire les prérequis et les changements proposés avant de confirmer l'initialisation.

**Moment décisif :** Sam retrouve une prochaine action expliquée, reliée à son projet. Il sait si Madness lui demande de choisir, de répondre ou de vérifier une installation.

## 2. Comprendre l'état et ses preuves

Sam connaît peu la méthode et veut comprendre pourquoi une action lui est recommandée.

1. L'espace du projet distingue l'état du parcours, l'état de l'agent et les validations humaines. Aucun pourcentage global n'est déduit du nombre de fichiers.
2. La recommandation présente son objectif et sa raison, puis son invocation réelle, ses entrées et son résultat attendu à la demande.
3. Le parcours regroupe les possibilités par intention : cadrage, exigences, expérience, architecture, réalisation et outils transversaux. Ce sont des repères explorables, pas une chaîne imposée à tous les projets.
4. Sam ouvre un livrable dans Madness. Sa provenance, son statut connu et le chemin du fichier restent accessibles, avec ouverture possible dans son éditeur dans le produit final.
5. Sam peut explorer les alternatives pertinentes et le catalogue installé. Les conditions d'invocation et les compétences indisponibles sont expliquées.

**Moment décisif :** Sam peut expliquer ce qui est connu et ce qui reste à décider, en s'appuyant sur un fichier ou un événement identifiable.

## 3. Lancer une action et poursuivre

Sam choisit une action après avoir compris son utilité.

1. La vue rappelle le projet, la compétence et le fournisseur avant l'exécution. L'action principale indique clairement ce qu'elle lance.
2. La conversation montre la commande invoquée et l'identité de l'agent. Le statut évolue entre en cours, réponse attendue, approbation attendue, interrompu, erreur et tour terminé.
3. Lorsque Sally pose une question, Sam répond dans Madness. L'attente reste visible s'il consulte un autre document ou revient à l'accueil.
4. Une demande d'approbation présente le changement proposé et des choix explicites. La fin de l'exécution ne vaut pas acceptation du livrable.
5. En fin de tour, Sam voit les résultats proposés, les fichiers concernés, les décisions qu'il a prises et la prochaine action. Le workflow peut rester ouvert.
6. Une interruption conserve le contexte et propose une reprise ; une erreur explique le problème et une action de récupération.

**Moment décisif :** Sam sait que l'agent a fini de parler, ce qui a été produit et ce qu'il doit faire ensuite.

## Protocole de prise en main

Après ouverture du prototype, proposer trois tâches sans donner le chemin : retrouver Madness et son attente ; expliquer le statut du brief et consulter son contenu ; lancer une action UX, répondre, puis retrouver le résultat. Relever les hésitations et les différences entre ce que Sam croit validé et ce que l'interface indique réellement.

Cette prise en main recueillera du feedback de conception ; elle ne constitue pas encore une étude utilisateur ni une preuve de compatibilité du connecteur Codex.
