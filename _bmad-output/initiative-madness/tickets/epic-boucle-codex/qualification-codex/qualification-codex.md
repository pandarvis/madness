# Qualification de la voie Codex — Madness

Date : 23 octobre 2026. Périmètre : entrée 1 / 1.1 du premier epic, avant G0 et le tracer BMad. Ce rapport ne clôture pas G1.

**Conclusion : échange Codex réel démontré, qualification globale insuffisante ; 1.1 et les consommateurs de cette voie restent bloqués.** Le profil vide, ChatGPT, la réponse témoin et la fin `completed` du même tour ont été observés avec `gpt-5.6-sol`. Le nettoyage de cet essai n’a pas été confirmé par le banc et l’éligibilité de distribution d’un nouveau client gratuit reste à étayer. Le résultat conservateur `unknown` dans [profile.json](profile.json) préserve ces limites.

## Usage personnel local

Le porteur utilise déjà Codex sur son poste professionnel. Madness reste un projet personnel local, sans service hébergé : ce contexte ne constitue pas à lui seul un service commercial. Il ne démontre pas non plus une autorisation de distribuer ce nouveau client. La documentation décrit app-server pour intégrer Codex dans un produit, mais indique son caractère expérimental et l’absence de support pour les charges de production. Le profil proposé demeure une qualification locale limitée. [Documentation officielle app-server](https://learn.chatgpt.com/docs/app-server), consultée le 23 octobre 2026.

## Distribution et éligibilité

La section d’authentification maintient les applications locales ou open source qui utilisent déjà cette authentification et exclut les services commerciaux ou hébergés. Son libellé ne tranche pas explicitement le cas d’un **nouveau** client local distribué gratuitement, dont la licence n’est pas décidée. L’interprétation conservatrice est donc `freeDistribution: unresolved` ; gratuit ne vaut pas open source. [Auth endpoints](https://learn.chatgpt.com/docs/app-server#auth-endpoints), consulté le 23 octobre 2026.

La voie distincte Sign in with ChatGPT présente l’utilisation du forfait pour des applications ouvertes ou hébergées localement ; son cookbook cite aussi les projets personnels locaux. Cela offre une récupération documentaire, sans valider l’éligibilité de la voie native retenue ni autoriser un changement de connexion implicite. Son intégration demanderait un nouveau cadrage de l’authentification et de la gestion des jetons, actuellement laissée à Codex. [Vue d’ensemble Sign in with ChatGPT](https://developers.openai.com/siwc/token-sharing-open-source), [cookbook officiel](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt), consultés le 23 octobre 2026.

Avant de déclarer 1.1 satisfaite : obtenir une source officielle suffisamment explicite pour le nouveau client Madness dans son périmètre de diffusion et un tour réel positif. Une évolution du produit vers un service hébergé ou commercial exigerait une nouvelle qualification. Aucune licence de Madness n’est choisie ici.

## Authentification et isolation

Le banc demande uniquement `account/login/start` avec `type: chatgpt`. Codex héberge le callback, conserve et renouvelle ses propres jetons. Le client lit `account/read` pour vérifier le type ChatGPT, sans conserver les champs d’identité. API key, Bedrock, absence de compte après login et autres modes bloquent l’inférence. L’identifiant de client envoyé à `initialize` est `madness`, titre `Madness`, version `qualification-1`. [Protocole et authentification gérée](https://learn.chatgpt.com/docs/app-server), consulté le 23 octobre 2026.

Chaque exécution crée un espace `madness-codex-*` dans le dossier temporaire système, avec un `CODEX_HOME` vide et un dossier de travail vide. La racine temporaire canonique est refusée avant toute création si elle appartient au dépôt, y compris si `TEMP` ou `TMP` y est redéfini. Le stockage d’authentification de cet enfant est imposé à `file` dans cet espace ; le banc ne lit jamais ce fichier. Il ne copie aucun identifiant et ne lance ni `logout` ni écriture sur la configuration habituelle. Le compte est choisi par le porteur pendant la connexion native.

Le processus reçoit une liste autorisée de variables système, de proxy et de certificats. Les variables de clés et de jetons, les configurations Codex héritées et `NODE_OPTIONS` sont exclues. La configuration parent reste intacte. Les noms des paramètres réseau transmis peuvent être conservés dans la preuve ; leurs valeurs, URL de proxy et chemins de certificats restent exclus. Aucune désactivation TLS n’est ajoutée ; une désactivation Node explicite dans l’environnement appelant provoque un refus.

## Reproduire

Préconditions réellement vérifiées : Windows, Node `24.13.0`, CLI npm `@openai/codex` `0.144.6`, installé sous `%APPDATA%/npm/node_modules/@openai/codex/bin/codex.js`. Aucune dépendance npm du banc n’est nécessaire. Une autre implantation du CLI doit être qualifiée explicitement ; ce banc n’installe et ne met à jour rien.

Depuis la racine du dépôt :

```powershell
node --test scripts/qualification/codex.test.mjs
node scripts/qualification/codex.mjs --live
```

Le deuxième appel ouvre un nouveau profil et nécessite une connexion humaine. Copier dans le navigateur Windows l’URL affichée exclusivement pour cette connexion, choisir le compte et achever le callback local avant dix minutes. Ne pas enregistrer cette URL dans les preuves. Après vérification ChatGPT, un modèle visible du catalogue est choisi (défaut du catalogue, sinon première entrée visible). Ce choix ne constitue pas une preuve d’accès au modèle.

Le seul tour demande une réponse témoin fixe, sans outil, sur le dossier vide en mode `read-only`, avec `approvalPolicy: never` et conversation éphémère. Le banc vérifie les paramètres renvoyés par `thread/start`, l’accusé du tour, un `item/completed` contenant la réponse témoin et un `turn/completed` réussi ; les deux événements doivent porter le même thread et le même tour que l’accusé. Le texte et les identifiants natifs ne sont pas sauvegardés. Le délai du tour est d’une minute, accusé compris ; chaque autre appel a un délai de trente secondes.

Une demande serveur imprévue reçoit une erreur de refus puis arrête le banc. Une activité outil inattendue, une coupure, un dépassement de délai ou une erreur empêchent le succès ; aucun appel de repli API, changement de fournisseur ou réessai automatique n’est effectué. Un arrêt ne prouve pas qu’un outil déjà commencé n’a eu aucun effet : la portée vide et la lecture seule réduisent ce risque et le résultat reste non réussi.

À la sortie, le banc ferme stdin et attend jusqu'à dix secondes la fermeture des pipes, distincte de la sortie du wrapper. Si le wrapper est encore actif, il tente l'arrêt ciblé de son arbre et conserve uniquement le code numérique de `taskkill` ; une seconde attente de dix secondes reste bornée. Si la fermeture reste non confirmée, il libère les handles du parent pour permettre sa sortie, conserve le résultat inconnu et ne supprime pas l'espace de cet enfant. Sinon il vérifie la racine temporaire avant de la supprimer. `cleanup: false` impose une vérification manuelle de l'espace temporaire ; ne jamais supprimer récursivement une racine calculée sans la vérifier. Le profil de preuve ne contient ni flux bruts, ni identité, ni erreur native, ni URL de connexion. Il est remplacé uniquement par une nouvelle exécution explicitement lancée.

Codes de sortie : `2` pour l’usage sans `--live`, `1` pour une preuve technique ou une éligibilité insuffisante. Une éventuelle réussite technique reste non réussie pour le passage de 1.1 tant que `freeDistribution` est `unresolved` ; aucun paramètre ne permet de forcer cette éligibilité.

## Vérification du banc et des contrats

- 26 tests Node déterministes couvrent JSONL fragmenté en UTF-8, réponses hors ordre, notifications avant accusé et groupées après accusé, corrélation login/thread/tour, garde ChatGPT, erreurs expurgées, coupure, délais incluant l'accusé, refus de demandes/activité imprévues, environnement, arrêt coopératif d'un enfant réel, distinction sortie/fermeture des pipes, enfant déjà fermé avec stderr ignoré, annulation SIGINT/SIGTERM pendant préparation, sortie du parent après arrêt non confirmé, refus de TEMP dans le dépôt et nettoyage borné. Les fixtures sont synthétiques et ne constituent aucune preuve d'accès réel.
- Les tests ont échoué avant implémentation, puis réussi. Un test supplémentaire de délai global a reproduit l’acceptation erronée d’une réponse tardive ; la borne de l’accusé et de l’attente a été corrigée et le test est passé.
- Un nouvel export `generate-json-schema` du CLI `0.144.6`, dans un autre espace temporaire nettoyé, a confirmé les contrats utilisés : `initialize`, compte/login, catalogue, début de thread/tour, `item/completed` et `turn/completed`. Les exports ne sont pas ajoutés au dépôt. Cet export ne prouve pas leur exécution complète.

## Preuve réelle et récupération

Le détail expurgé du dernier essai se trouve dans [profile.json](profile.json). `completed` et `responseMatched` décrivent l’inférence observée ; `outcome` inclut les incertitudes de fin d’exécution ; `eligibility` décrit séparément l’admissibilité documentaire. Le navigateur, Electron et le processus fournisseur n’ont pas des réseaux supposés identiques.

| Essai | Observation et portée |
|---|---|
| Premier lancement sous sandbox | Initialisation JSONL et profil vide vérifiés. Login expiré après trois minutes sans compte confirmé, sans inférence. Le callback local était devenu inaccessible lorsque le porteur l’a achevé. L’arrêt interprocessus n’était pas confirmé ; le seul arbre du banc a ensuite été identifié et arrêté avec les droits nécessaires. Aucun espace temporaire du banc n’a été retrouvé après fermeture de cette sandbox. |
| Nouvelle tentative expressément demandée | Lancement Windows avec les droits nécessaires, délai de connexion porté à dix minutes et ouverture par le navigateur Windows par défaut. Le porteur signale un parcours plus rapide ; ce retour UX ne vaut pas mesure de performance ni preuve d’inférence. La confirmation native a ensuite permis le contrôle ChatGPT et un seul tour sur `gpt-5.6-sol`, choisi par le catalogue de ce profil neuf. |
| Résultat corrélé du second essai | `turnAcknowledged: true`, `responseMatched: true`, `completed: true`, `readOnlyObserved: true`. Le processus enfant a terminé l’inférence en héritant de `HTTP_PROXY`, `HTTPS_PROXY` et `NODE_EXTRA_CA_CERTS` ; aucune valeur n’est conservée. La chaîne de confiance a été acceptée pour cette requête, sans désactivation TLS. Aucun diagnostic d’Electron ni preuve sur un autre réseau n’en découle. |
| Fin du second essai | Avec les anciennes bornes d’arrêt, fermeture et nettoyage non confirmés : `failureCode: process_stop_unconfirmed`, `cleanup: false`, `outcome: unknown`, code de sortie 1. Un contrôle ciblé ultérieur n’a retrouvé ni processus Node/Codex du banc ni espace temporaire correspondant dans les racines contrôlées ; cela ne remplace pas une confirmation de nettoyage par cette exécution. |
| Correction et contrôle sans compte ni tour | La sortie du wrapper ne suffit plus à annoncer l’arrêt ; les bornes sont étendues et le code de `taskkill` est conservé. Une reproduction réelle `initialize` → `thread/start` → EOF, sur un nouveau profil sans compte et sans `turn/start`, confirme `wrapperExited: true`, `pipesClosed: true` et suppression du seul espace créé. Les tests de régression passent. Aucun tour d’inférence n’a été rejoué après la preuve positive ; le nettoyage d’une nouvelle session authentifiée complète reste à confirmer. |

Le banc finalise donc une preuve d’authentification et d’inférence limitée, avec une réserve de cycle de vie explicite. Le profil réel garde les résultats de l’exécution antérieure aux dernières corrections d’arrêt ; ses champs ne sont pas réécrits en succès à partir des tests.

En cas d’attente ou d’échec, vérifier le code fixe, l’étape et `cleanup`. Pour un login expiré, achever le diagnostic puis relancer explicitement le banc et utiliser la nouvelle URL ; ne pas rejouer l’ancienne. Pour un échec réseau, qualifier proxy et magasin de certificats du seul enfant, sans modifier ceux du renderer ni désactiver TLS. En cas de résultat de tour inconnu, vérifier ce qui a été observé avant de décider d’un nouvel essai. La connexion habituelle du porteur ne remplace pas cette qualification isolée.

Restent hors preuve : workflow BMad réel, questions structurées, approbations, interruption/reprise, conservation produit, starter et paquet Electron, autres machines Windows, distribution du CLI et diffusion publique. Le passage de G1 et la réalisation de 1.2 restent distincts. Aucun projet utilisateur, workflow BMad ou starter n’a été lancé par ce banc.
