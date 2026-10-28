# Contrôle sécurité indépendant — qualification réseau

Verdict : **favorable pour la qualification isolée et ses conclusions conditionnelles/négatives**. Aucun constat matérialisé à corriger dans le périmètre soumis : `[]`. Ce verdict ne qualifie ni une intégration produit, ni une récupération autonome, ni un gain réel sur les acquittements Zscaler.

## Périmètre et méthode

Lecture intégrale du plan `../backlog/spike-qualifier-cache-et-recuperation-reseau-plan.md` et du diff fourni `changes.diff` (SHA-256 `3853cb8175662fa1ef3dcf4c91b9900b314f97149d23beb15c53be3ea56bb814`), puis inspection ciblée des sources OAuth/connexion et de jose installé. Les journaux, résultats, essais rouges et limites natives du diff sont inclus dans la lecture.

Contrôle effectué sans exécuter les tests, le banc Electron, l’application ou le réseau, sans inspecter le profil personnel/AppData ni le coffre. Seul ce rapport est écrit. Les résultats exécutés ci-dessous sont ceux des preuves fournies, pas de nouvelles exécutions du relecteur. Les neuf SHA d’inputs de `results.json` correspondent aux octets courants ; les commandes Git de lecture sur `src`, `tests`, `scripts`, dépendances et `resources` ne produisent aucun chemin modifié depuis `e2d9367176a93862b9a108fcef16715ff2675a66`.

## Points décisifs contrôlés

| Frontière / risque | Code et preuve | Appréciation |
|---|---|---|
| Origine des clés / persistance | `prototype.mjs:10`, `:59`, `scenarios.test.mjs:130`, `:200` ; précondition explicite dans `node_modules/jose/dist/types/jwks/remote.d.ts:24` | La mémoire ne reçoit que le transport injecté, à URL fixe ; restauration non fiable rejetée. M3.4 injecte volontairement une clé synthétique non fiable dans un cache que jose exige fiable. Le refus de cette option est justifié ; aucune vulnérabilité amont n’est alléguée. |
| Signature et identité | `scenarios.test.mjs:153`, `:184`, `src/adapters/codex/oauth.ts:52` | Vraies clés et signatures RS256 via jose et vrai `validateIdentity`, huit identités refusées et sept jeux invalides avant POST. Les assertions dépassent un simple décodage JWT. |
| Fraîcheur, retrait et nouveau `kid` | `prototype.mjs:28`, `:65`, `:149`, `scenarios.test.mjs:102`, `:114`, `:130`, `:167` | Age/Date/délai, bornes exactes, recul des deux horloges et absence de repli périmé sont exercés. Le retrait encore invisible pendant la fraîcheur reste explicitement publié ; le nouveau `kid` n’autorise qu’une récupération supplémentaire bornée. Les 1/5/10 minutes restent des candidats simulés. |
| Concurrence, annulation et contrôle forcé | `prototype.mjs:76`, `scenarios.test.mjs:224`, `:239`, `:313` | Coalescence ordinaire, annulation indépendante d’un appelant, annulation par le dernier et requête forcée distincte ont des compteurs/assertions. M6 maintient la garde `STOP_UNCONFIRMED` malgré le retour réseau accessible. |
| POST perdu / réponse reçue non validée | `scenarios.test.mjs:253`, `:268`, `:287`, `src/adapters/codex/oauth.ts:139`, `src/adapters/codex/connection.ts:131` | Les preuves séparent 0 POST avant indisponibilité des clés, 1 POST à issue inconnue et réponse reçue avec nouveau `kid` non admis. La récupération candidate redemande seulement les clés. Faux coffre inchangé, aucune écriture/probe dans les trois échecs ; aucun réessai automatique observé dans l’intention testée. |
| Crash avant conservation | `rapport.md:46`, `scenarios.test.mjs:284`, `:310` | Il s’agit d’un manque reconnu à la lecture du flux de validation puis écriture, pas d’une qualification de sûreté après crash. L’absence de conservation durable de la réponse est correctement maintenue comme condition d’un éventuel lot distinct. |

## Portée honnête des preuves

`scenarios-final.log` et `parent-scenarios.log` donnent 16 tests réussis, sans saut ; `results.json` contient 18 observations parce que M5.1 sérialise aussi ses deux sous-cas. Les tableaux de `rapport.md:11` distinguent intentions explicites fictives et durée synthétique du credential. Aucun GET évité n’est assimilé à un clic Zscaler économisé, et aucun POST nécessaire n’est déclaré évité.

`electron-results.json` et `electron-http-cache.cjs` étayent uniquement le serveur loopback et sa session dédiée : default 1 origine pour 2 lectures, puis cache 200 serveur arrêté ; no-store/reload 2 origines puis erreur. `rapport.md:60` conserve la limite des deux arrêts avant JavaScript, dont le premier environnement hérité n’a pas permis de confirmer les chemins natifs. Le succès ultérieur n’efface pas cette inconnue. `rapport.md:62` laisse correctement inconnu l’accès origine OpenAI via HTTPS/proxy du transport livré.

Le cache persistant authentifié, la cadence personnelle, les en-têtes réels, la récupération durable après rotation/crash et l’effet réel sur Zscaler ne sont pas qualifiés. Ces limites sont compatibles avec l’objet du spike ; elles ne sont pas converties ici en exigences d’IT, en réouverture de l’epic 1 ou en preuve d’un cache livré. Les preuves de préservation consultées n’équivalent pas à une inspection indépendante des octets du coffre ou du paquet personnel, qui n’a pas été effectuée.
