# Qualification isolée du cache et de la récupération réseau

**Conclusion technique : un cache mémoire borné peut éviter des GET de clés lorsque plusieurs renouvellements explicites interviennent pendant sa fraîcheur. Le bénéfice réel sur les acquittements Zscaler n’est pas établi. La persistance non authentifiée est non retenue. Le diagnostic forcé est qualifié localement, avec une intégration produit restant distincte.**

Cette conclusion prépare la reprise de **2.1**, sans rouvrir l’epic 1, élargir 2.1 ni livrer un cache. Zscaler, proxy, TLS, SIWC, dépendances, sources produit, tests permanents et paquet personnel ne sont pas modifiés. Aucun compte, jeton réel, modèle, navigateur ou réseau personnel n’est utilisé. Les faux renouvellements sont des appels en mémoire au vrai validateur/renouvelleur avec clés et credentials synthétiques.

## Mesures et temporalités

`scenarios.test.mjs` exécute **16 tests, 0 saut**, avec **18 observations dans results.json** : les cas avant/après POST de M5.1 sont aussi détaillés comme deux observations. Les sous-lignes ne sont pas des tests supplémentaires. Journal de référence : `scenarios-final.log` ; les essais rouges et le premier vert sont conservés avec leurs limites, décrites dans `matrix-audit.md`.

M1.1 injecte quatre intentions de renouvellement, chacune avec un ancien credential synthétique déjà expiré, à **t = 0, 60, 120 et 180 s**, réouverture simulée avant la quatrième. Réponses de clés simulées : `max-age=600`, plafond candidat 300 s, ETag fictif. Réponses token : identité vraiment signée et `expires_in=3600` fictif. Il ne s’agit pas de la cadence du compte personnel.

| Option | GET applicatifs mesurés | POST simulés nécessaires | Réponses 304 | Décision |
|---|---:|---:|---:|---|
| Programme sans cache applicatif | 4 | 4 | 0 | Référence qualifiée ; cache HTTP éventuel distinct |
| Mémoire bornée, perdue à la fermeture | 2 | 4 | 0 | Gain local qualifié ; intégration conditionnelle |
| Persistance non fiable, rejetée à la réouverture | 2 | 4 | 0 | Non retenue ; seuls les gains de mémoire subsistent |
| Revalidation à chaque intention | 4 | 4 | 2 | Pas de réduction des accès ; éventuel gain d’octets non mesuré |

Le vrai `CodexConnection`, avec un faux coffre conservant le credential renouvelé et sa durée **synthétique** d’une heure, ne demande que **1 GET / 1 POST / 1 écriture** pour quatre demandes de dialogue espacées d’une minute. Le premier renouvellement rend les trois suivants inutiles. Cela empêche d’assimiler chaque dialogue à un renouvellement. La cadence personnelle effective, les headers OpenAI et l’interception éventuelle du POST par Zscaler restent inconnus.

**Un cache de clés n’évite aucun POST de renouvellement nécessaire. Si Zscaler intercepte aussi ce POST, les clics correspondants peuvent rester nécessaires.** Un GET évité n’équivaut donc pas à un acquittement humain économisé, ni à un accès modèle garanti.

Sensibilité locale sur six accès à t = 0, 60, 120, 180, 300 et 600 s, sans fermeture : plafonds 60 / 300 / 600 s → respectivement **6 / 3 / 2 GET**. La fenêtre maximale d’ignorance d’un retrait vaut au plus **60 / 300 / 600 s** pour la réponse simulée, avant consommation par `Age`, `Date` et délai. Le plafond 300 s est un candidat comparé, pas une durée de confiance acquise. Sans header de fraîcheur : **2 accès → 2 GET**.

## Garanties et contre-exemples

Les clés sont publiques, RSA/RS256, 2048 bits minimum ; jeux vides, privés, invalides et trop nombreux sont refusés. Le vrai `validateIdentity` vérifie la signature et les claims. Les signatures forgées, issuer/audience/azp/nonce invalides, expiration et changement de sujet restent refusés. Scopes insuffisants empêchent écriture et probe. Le contenu retourné est cloné ; un appelant ne peut altérer la clé gardée en mémoire.

L’âge tient compte du délai de transport et du maximum entre `Age` corrigé et âge apparent `Date`. Un cache périmé ne sert pas de repli ; erreur réseau ne prolonge pas sa fraîcheur. Les directives restrictives, valeurs malformées ou contradictoires et horloges reculées empêchent le réemploi. Une clé retirée encore fraîche peut néanmoins valider pendant la fenêtre explicitement publiée. Ce risque doit être accepté ou réduit avant toute intégration. Sources normatives et limites : [sources.md](sources.md), [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html), [OIDC §10.1.1](https://openid.net/specs/openid-connect-core-1_0.html#RotateSigKeys).

Une clé inconnue permet au plus une récupération supplémentaire, avec cooldown global candidat de 30 s ; un échec ou une clé toujours inconnue ferme la validation. Plusieurs appels ordinaires partagent leur GET en cours. L’annulation d’un appelant n’annule pas celui d’un autre ; celle du dernier annule le transport. Le contrôle forcé possède sa requête et n’est servi ni par le cache mémoire ni par une requête ordinaire déjà engagée. Réponses 307, HTML, JSON invalide et trop grand sont rejetées, sans suivre de redirection ; erreurs expurgées, transport candidat borné et `cache:no-store`.

**Contre-exemple de confiance persistance conservé, M3.4 :** jose 6.2.13 reçoit une clé d’attaquant synthétique dans `jwksCache`, un timestamp futur et une URL autre que son origine supposée. Il valide la signature avec **0 GET**. C’est compatible avec sa précondition documentée de cache fiable, et disqualifie son emploi comme mécanisme de confiance persistante prêt à intégrer. Syntaxe RSA, checksum et JSON valide ne prouvent pas qui a fourni une clé. Le candidat rejette systématiquement une restauration non fiable ; aucun cache persistant authentifié n’est prototypé ou déclaré qualifié.

## Rotation et récupération sans rejeu

| État | Mesure locale | Conclusion |
|---|---|---|
| Clés indisponibles avant rotation | 1 GET, 0 POST | Aucun renouvellement commencé |
| Assemblage candidat, cache absent / expiré et GET bloqué | 1 GET / 2 GET dont le chargement initial du cache expiré ; 0 POST dans les deux cas | Vérification des clés à chaque intention avant le POST ; aucune rotation commencée |
| Réponse perdue après envoi | 1 GET, 1 POST, ancien faux coffre intact | Issue du POST inconnue ; aucun réessai automatique |
| Nouvelle clé après réponse de rotation, programme livré | 1 GET, 1 POST, `OAUTH_INVALID` | Réponse reçue mais identité non validée ; aucune sauvegarde |
| Candidat avec récupération du nouveau `kid` réussie | 2 GET, 1 POST | Seules les clés sont redemandées, signature/claims réellement validés |
| Récupération bloquée ou scopes insuffisants | 1 POST, 0 écriture, 0 probe | Compte conservé ; réponse non admise ; pas de rejeu |

Dans M5.2/M5.3, un assemblage expérimental privé vérifie les clés via `cache.get(signal)` **à chaque intention avant** de fournir le resolver dynamique à `refreshCredentials`. Ce resolver court-circuite le chargement pré-POST interne du code livré ; les préchargements ponctuels des premiers scénarios ne suffisaient donc pas à qualifier l’assemblage. Ils sont retirés des parcours de rotation, et deux cas cache absent/cache expiré avec GET bloqué prouvent désormais **0 POST, 0 écriture, 0 probe**. Le chargement initial du cas expiré sert seulement à construire cet état avant une nouvelle intention. La récupération du nouveau `kid` après réponse conserve **2 GET / 1 POST**, sans réémission. Aucun code produit n’est modifié.

Une réponse de rotation reçue mais rejetée peut déjà avoir invalidé l’ancien refresh. Une réponse perdue n’est pas un refus prouvé. Le code livré conserve l’ancien faux coffre lors de ces erreurs ; il ne fournit pas une conservation atomique durable de la nouvelle réponse avant validation. **Un crash avant sauvegarde reste un manque explicite** : aucune nouvelle persistance de secrets ni solution de récupération personnelle n’est livrée par ce spike. Un lot ultérieur devra concevoir les états reçu/non validé/inconnu, leur durée et leur résolution avant d’annoncer une récupération autonome sûre.

M6 fait traverser le contrôle explicite malgré des clés fraîches : GET initial 200, contrôle 307, contrôle suivant 200, soit **3 GET**. Le vrai service reste `unknown / STOP_UNCONFIRMED`, identité non revérifiée, même quand `network.status=accessible`. OAuth/refresh/probe restent chacun à **0**. Le vrai cœur `Application` relit un Snapshot valide, avec brouillon exact avant/après ces contrôles et après fermeture/réouverture simulée. La provenance de l’attente reste inconnue via le port de récupération. Aucune question, approbation, message, intention ou modèle n’est remis en route.

## Cache HTTP Electron mesuré séparément

Runtime réellement exécuté : **Electron 45.0.0 / Chromium 156.0.8078.48 / Node 24.22.0**, serveur `127.0.0.1` comptant ses requêtes, réponse `public,max-age=600`, session dédiée. Aucun `BrowserWindow`, endpoint externe ni profil personnel. Résultat : `electron-results.json` et `electron-command.log`, profil temporaire possédé supprimé après sortie confirmée.

| Mode Request.cache | Requêtes origine pour deux lectures fraîches | Après arrêt du serveur |
|---|---:|---|
| default | 1 | 200 provenant du cache, compteur origine toujours 1 |
| no-store | 2 | Erreur réseau |
| reload | 2 | Erreur réseau |

Deux essais restreints ont quitté avant JavaScript avec le code 2147483651 sans diagnostic. Ils sont conservés comme limites initiales ; le même banc à chemins natifs temporaires et environnement filtré a ensuite réussi après autorisation d’exécution native. Le premier essai avait encore l’environnement hérité et n’a pas confirmé ses chemins avant cet arrêt ; l’absence absolue d’effet natif avant JavaScript n’est donc pas instrumentée pour cet essai. Aucun accès au coffre ni chargement de l’application personnelle n’était programmé. Le lancement suivant et le lancement concluant filtrent l’environnement et redirigent aussi APPDATA/LOCALAPPDATA vers le dossier possédé avant démarrage. La cause du code initial n’est pas attribuée au proxy ni à l’antivirus.

Le transport livré utilise le défaut HTTP ; le résultat loopback démontre pourquoi son GET 200 n’établit pas forcément un accès origine. Le candidat force `no-store` et le contrôle explicite traverse son transport. **L’accès origine OpenAI du transport livré reste inconnu** : ni les sources Electron ni ce serveur HTTP local ne prouvent le comportement de la chaîne réelle HTTPS/proxy. Les reçus 307 puis 200 historiques restent distincts, sans durée d’acquittement inventée.

## Conditions avant une éventuelle intégration, et passage à 2.1

1. Conserver une frontière de confiance explicite pour les clés : URL fixe, TLS/proxy existants, clés RSA valides, cache mémoire privé et borné. Toute persistance exige une protection d’intégrité/provenance et anti-retour/futur qualifiée séparément ; elle ne doit pas être admise sur le seul format jose.
2. Obtenir des en-têtes réellement exploitables dans un futur contrat de transport, définir la politique serveur inconnue/restrictive et l’acceptabilité de la fenêtre de retrait. Ne pas copier le défaut de dix minutes sans décision de risque. Le prototype couvre un sous-ensemble conservateur de cache HTTP, pas un parseur RFC complet.
3. Distinguer diagnostic réseau, identité, renouvellement et effet incertain. Garantir un contrôle contournant les deux caches pertinents, annulation/coalescence, récupération `kid` bornée et aucun rejeu de POST. Concevoir la rotation reçue/non validée et le crash avant sauvegarde dans un lot distinct.
4. Mesurer ensuite le bénéfice sur un parcours autorisé dans l’environnement inchangé, sans le promettre depuis ces compteurs. Un POST intercepté et les besoins réseau du moteur peuvent encore réclamer l’acquittement humain.

Ces conditions bornent un **éventuel lot d’intégration**. Elles ne créent aucune dépendance technique artificielle et ne modifient pas le scope de **2.1**, prochain Build demandé. Les quatre critères du ticket sont reliés dans `matrix-audit.md`. La conclusion finale du spike attend la revue Quick, le contrôle sécurité indépendant et la décision Sofia pilotés par le parent ; aucun avis favorable n’est inventé ici.
