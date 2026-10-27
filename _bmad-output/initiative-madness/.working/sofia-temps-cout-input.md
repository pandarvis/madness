# Changement à replanifier — temps et coût par US

Demande humaine du27 octobre2026 : « Il faut timer les US / et le cout ». Réponse explicite au choix de portée : **« Fonctionnalité dans Madness uniquement »**. Il ne s’agit pas de chronométrer notre développement. Le relevé transitoire et son extracteur ont été retirés ; ne pas les recréer.

Le mandat autonome epic1 puis refonte Sally/experts Impeccable reste actif.1.7 built, revue et installée : commit3e636aeb696bbbec3be715844fe8f74c40ea2c83,270 tests, paquet et restauration réussis.1.8 n’a pas de plan : entrée résolue, étape2 chargée, aucune investigation déléguée ni code démarré. Conserver les quatre epics, identifiants, qualifications1.1/1.2 et dépendances10/11 sauf replan justifié ; ne pas réécrire un plan déjà figé.

Produit demandé : dans Madness, suivre les US des projets ouverts avec durée et coût/consommation réellement disponibles. Le sens précis des durées, le rattachement des sessions/tours à l’US, les preuves de sessions externes et la présentation de données manquantes doivent être cadrés avec les contrats existants. Ne pas en déduire un minuteur manuel, un taux monétaire, une facturation API, une estimation ou un budget obligatoire non demandés.

Évidence technique à considérer, pas exigences déjà validées : l’app-server expose thread/tokenUsage/updated ; cela ne fournit pas à lui seul l’association à une US ni un coût en euros. La [documentation de tarification](https://learn.chatgpt.com/docs/pricing), consultée27 octobre, distingue l’usage sur abonnement des prix API et déconseille cette conversion pour chiffrer les tâches incluses. Les notifications natives ne sont pas encore conservées comme comptabilité d’US dans Madness. Les données observées et les données indisponibles doivent rester distinguées.

Le code reste privé. Les connexions existantes ne changent pas ; aucune nouvelle collecte de conversation externe, clé, abonnement ou soumission fournisseur n’est autorisée par ce cadrage. Les prérequis BMad du catalogue/board appartiennent aux travaux prévus dans l’epic2 ; Sofia doit déterminer le bon emplacement et les dépendances avant implémentation.
