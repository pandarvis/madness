# Développer Madness sous Windows

Le programme courant 0.1.1 conserve projets, rattachements, conversations, brouillons et préférences hors installation. Mary/Forge, progression, questions, accords ponctuels, récupération et récapitulatifs des stories 1.3–1.8 sont disponibles dans leurs profils qualifiés. La restauration garde les demandes historiques inactives et ne relance aucun moteur. Aucun identifiant d’un autre outil n’est lu ou copié. La [procédure de livraison](releasing.md) porte reconstruction, manifeste et contrôles A → B ; les sections de pilotes ci-dessous conservent leurs preuves et limites datées.

## Reproduire l’assemblage

Utiliser Windows x64 et Node.js 24.13.0 ou une version compatible avec les exigences des paquets. Les versions exactes font foi dans `package-lock.json` ; la livraison 0.1.1 retient Electron 45.0.0, electron-vite 6.0.0, electron-builder 26.18.0, JOSE 6.2.13, TypeScript 7.0.2, React/react-dom 19.3.1 et Vite 8.3.5. `npm ci` télécharge Electron et prépare ses dépendances ; aucune installation globale n’est requise.

```powershell
npm ci
node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs
npm run build
npm run build:win -- --config.directories.output=dist/maintenance-pilot
node scripts/release/manifest.mjs --directory=dist/maintenance-pilot
node scripts/qualification/windows.mjs --ui-regressions-only --executable=C:/Sources/madness/dist/maintenance-pilot/win-unpacked/Madness.exe
```

`npm run dev` démarre le serveur local du renderer et Electron. `npm start` ouvre les ressources déjà compilées. `npm run build:unpack` produit l’exécutable sans installateur ; `npm run build:win` produit aussi `Madness-0.1.1-x64-setup.exe` dans le répertoire de sortie choisi. Aucun script ne publie de livraison distante. Le paquet est autonome et charge `madness://app/index.html`, sans serveur dev ni police distante. Les versions 0.1.0 des preuves historiques restent celles des paquets alors exécutés.

`node scripts/qualification/development.mjs` vérifie le renderer dev avec le vrai preload sur profil jetable, sans capture supplémentaire. L’URL locale est normalisée avant sa comparaison exacte. Le préambule React HMR et les styles Vite reçoivent un nonce CSP aléatoire par session ; `unsafe-inline` n’est pas nécessaire. Ce nonce et la connexion locale de HMR ne sont pas activés dans le paquet.

Le point de départ est le starter officiel `@quick-start/create-electron@1.0.31`, modèle `react-ts`, créé dans un dossier temporaire avant adaptation. Les outils génériques de preload, l’updater, le proxy miroir et les données de démonstration du starter ne font pas partie de l’application. Les configurations de compilation et de packaging gardent ses trois sorties main/preload/renderer.

## Organisation et frontières

La barre supérieure est intégrée à la barre de titre Windows avec `titleBarStyle:hidden` et `titleBarOverlay` natif de 56 px. Les variables CSS `titlebar-area-*` réservent l’espace des contrôles système ; le fond libre est `app-region:drag`, les boutons et dialogues sont `no-drag`. Aucun pont de contrôle de fenêtre n’est ajouté. Le banc ciblé vérifie la géométrie et les actions à 1320 et 600 px ; `--ui-regressions-only --executable=<chemin absolu>` permet de le lancer sur un paquet précis sans réécrire les preuves G0 historiques.

`src/contracts` possède le schéma v1, les commandes, événements corrélés, résultats et capacités. `src/core` contient les cas d’usage, les ports de stockage/connexion et le coordinateur de cycle de vie. Ces modules n’importent ni Node, ni Electron, ni SDK fournisseur. L’adaptateur JSON et le main implémentent leurs ports ; le renderer reçoit `window.madness` et le pont dédié `window.madnessConnection`.

Le pont expose lecture du contexte, choix du dossier, sélection d’un projet connu, sauvegarde du brouillon, préférence de navigation et abonnement aux événements métier. Main vérifie l’identité de la fenêtre, de sa frame principale, son URL exacte et la forme du payload avant délégation. Preload valide aussi les réponses et événements reçus. Aucune API IPC, fichiers, processus ou Electron générique n’est exposée. Le preload compilé contient son contrat et n’utilise que `require('electron')` comme dépendance externe.

Les préférences `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false` et `webSecurity: true`, la CSP, le refus des navigations/fenêtres, des téléchargements et des permissions font partie du socle. Le profil de qualification rapporte aussi le sandbox réel du processus renderer. Les recommandations de [sécurité Electron](https://www.electronjs.org/docs/latest/tutorial/security) et le [starter electron-vite](https://electron-vite.org/guide/) sont les références consultées.

## Données locales

Le chemin par défaut est `app.getPath('userData')/madness-state-v1.json`, hors installation et hors projet. `MADNESS_DATA_HOME`, chemin absolu, permet un profil de développement isolé ; les bancs hors fournisseur le définissent avant le démarrage de l’application. Ils ne doivent pas utiliser le profil personnel. L’essai réel explicitement autorisé du pilote ci-dessous utilise, séparément, le compte propre à Madness et un dossier témoin persistant.

Le JSON v1 conserve projets, racines canoniques, projet actif, brouillons, préférence et enveloppes de conversations. G0 ne crée aucune conversation fournisseur. À la restauration, une activité ancienne devient historique/inconnue ; aucun moteur ni tour ne démarre. Les identifiants de contexte, de fournisseur et de connexion des conversations restent capturés par le contrat.

Chaque écriture est sérialisée, validée, écrite dans un fichier temporaire adjacent, synchronisée puis remplacée par `rename`. Une erreur laisse le dernier état mémoire durable inchangé et la saisie dans le renderer. L’accusé « enregistré » n’apparaît qu’après réussite de cette opération. Cela ne constitue pas une garantie de résistance à une panne matérielle ou à une coupure secteur. Une préférence échouée s’applique en mémoire et est signalée non sauvegardée.

Un schéma inconnu, une corruption ou un changement externe du fichier connu empêchent son remplacement. Aucun reset, import ou migration automatique n’existe. Limites actuelles : snapshot de 16 Mio, 1 000 projets et 100 000 caractères par brouillon. Préserver une copie des octets existants avant une réparation ; utiliser une version compatible si le schéma est plus récent. Les erreurs affichées et transportées ont des codes fixes, sans texte natif ni secrets.

Un seul processus Madness possède un profil à la fois. Le contrôle de conflit empêche le remplacement d’une modification externe déjà observée avant l’écriture ; il ne remplace pas une coordination avec un éditeur externe écrivant simultanément au même instant. Ne pas éditer manuellement le snapshot pendant son utilisation.

## Connexion locale à ChatGPT

Le logo grisé ouvre un panneau non modal accessible au clavier ; Échap ferme le panneau, annule une connexion en cours et rend le focus au logo. « Continuer avec ChatGPT » ouvre uniquement le navigateur système. Le panneau explique avant l’autorisation que le court témoin utilise le forfait. Après la première autorisation, une confirmation acquittable rappelle cet usage ; son acquittement est conservé dans le coffre. « Gérer l’usage dans ChatGPT » ouvre l’URL officielle fixe `https://chatgpt.com/settings/usage`, sans quota inventé.

`src/adapters/codex/oauth.ts` implémente indépendamment le protocole SIWC documenté, sans code du DevKit : listener uniquement `127.0.0.1`/port éphémère, state/nonce/PKCE S256 neufs, client émis validé, signature RS256, issuer/audience/expiration/sub vérifiés avec JOSE 6.2.13. Les callbacks étrangers n’interrompent pas l’attente légitime ; un refus, des scopes insuffisants ou une autre identité n’entraînent aucun témoin. L’attente humaine dure dix minutes au maximum ; chaque requête Main est bornée à quinze secondes et 256 Kio, sans redirection ni affaiblissement TLS. Le réseau OAuth utilise `net.fetch` et les certificats/proxy d’Electron.

En cas de `NETWORK_UNAVAILABLE`, le panneau conserve l’erreur et propose la page publique fixe `https://auth.openai.com/.well-known/jwks.json`. Sur un réseau d’entreprise, l’ouvrir peut aider à vérifier son accès, sans garantie de rétablissement. Les actions dédiées `open-public-keys` et `copy-public-keys` n’acceptent ni URL ni texte du renderer : Main ouvre uniquement cette constante dans le navigateur Windows, ou la copie via `clipboard.writeText`. Une copie n’est annoncée qu’après résolution ; un échec natif est expurgé et laisse une récupération locale. Ces utilitaires restent disponibles pendant une session, sans mutation des accès, vérification, modèle ou retry automatique. Les cookies, TLS et `redirect:error`/`credentials:omit` restent inchangés.

Le coffre `userData/codex-connection-v1/credentials.bin` utilise uniquement `safeStorage` Windows ; aucun fallback clair. L’inscription non secrète est séparée dans `registration.json`. L’host ID et le client émis sont conservés après déconnexion locale. Une écriture synchronisée/atomique préserve l’ancien coffre en cas d’échec ; une corruption ou un changement externe empêche son remplacement. « Déconnecter localement » retire explicitement les accès enregistrés, sans révoquer les autorisations côté ChatGPT. Aucun secret, compte, URL OAuth ou retour natif n’est projeté dans le renderer ni enregistré dans les rapports.

`probe.ts` cherche le binaire natif Windows x64 seulement dans les implantations npm standard `%APPDATA%/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/` et `%APPDATA%/npm/node_modules/@openai/codex-win32-x64/` ; il vérifie manifeste, chemin et en-tête PE avant `spawn`, avec `shell:false` et `windowsHide:true`. Aucun téléchargement ou wrapper Node n’est lancé. Il crée un profil/CWD vides hors du dépôt et assainit l’environnement. L’access token est injecté uniquement dans l’environnement de ce child ; aucun API key, profil Codex, MCP ou option Node hérité. Le thread est éphémère, en lecture seule, avec approbation `never`, shell/web désactivés et demandes serveur refusées. Catalogue seul, OAuth seul ou accusé de tour ne suffisent pas : message assistant et fin de tour corrélés, puis arrêt natif confirmé, sont requis.

L’arrêt ferme stdin puis termine uniquement le processus natif possédé si nécessaire ; l’attente est bornée. Un arrêt non confirmé reste `unknown` et interdit un autre témoin dans cette session. La fermeture demande l’arrêt du coordinateur avant de vider la queue de persistance. Aucun tour incertain n’est relancé. Au redémarrage, un compte conservé revient à « compte enregistré, à vérifier » sans réseau spontané, refresh ou processus. Le refresh ne survient que sur une demande explicite et sa rotation est sauvegardée atomiquement.

La capacité historique `capabilities.codex.available:false` du snapshot v1 ne change pas : cette connexion personnelle locale ne valide ni l’éligibilité du produit fermé distribué, ni G1 complet, ni le tracer BMad 1.3. Réseau Main et réseau du processus Codex restent des qualifications distinctes. Le test live avec consentement réel reste manquant tant qu’un rapport dédié ne le prouve pas.

```powershell
node scripts/qualification/connection.mjs
node scripts/qualification/connection.mjs --packaged --no-captures
# Seulement sur demande explicite, après revue : consentement manuel dans le navigateur système.
node scripts/qualification/connection.mjs --live --no-captures
```

Le banc par défaut substitue l’ouverture du navigateur, interdit le réseau fournisseur, exerce le vrai pont Electron/DPAPI sur un profil jetable et restaure un compte synthétique sans envoi. Le mode `--live` n’active aucun bouton à la place de l’humain ; il attend son action dans le panneau. Rapports expurgés et captures : `_bmad-output/initiative-madness/qualification-connexion-codex/`, distinct du banc natif historique. Les fixtures ne constituent aucune preuve d’usage réel du forfait. `--no-captures` évite une nouvelle passe visuelle après la paire bureau/compact.

## Qualification et limites

Le banc Windows crée un profil et un projet témoins dans un espace temporaire distinct du dépôt. Il ouvre Electron compilé puis le paquet, passe par le vrai preload, vérifie l’annulation, la validation, les événements, le stockage, la réouverture et la préservation du projet, puis ferme ses enfants et nettoie son seul espace. La réponse de sélection du dialogue OS est contrôlée par le banc ; cela ne prouve pas le parcours humain du sélecteur. Les captures utilisent l’échelle Windows de la machine.

Les résultats expurgés et les captures sont dans `_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-g0/`. Les profils réels sont supprimés ; aucun identifiant ou texte natif fournisseur n’est enregistré. Un échec produit un état partiel et un code fixe. Les tests de nettoyage refusent une racine arbitraire. Le sandbox d’exécution des outils peut refuser `rename` dans son répertoire temporaire virtualisé : exécuter alors les contrôles Windows dans l’environnement local autorisé, sans modifier TLS ni remplacer la stratégie atomique.

Le contrôle de l’installateur sur la machine cible, sa signature, le minimum Windows/proxy, les réseaux des connecteurs, un lecteur d’écran et les trois parcours avec une personne restent distincts. Le banc Codex est indépendant : `node --test scripts/qualification/codex.test.mjs` ne lance pas Codex ; sa qualification réelle n’est jamais déclenchée par les scripts G0.

## Pilote personnel : premier dialogue Mary

Amendement du 26 octobre, story 1.5 : les questions natives non secrètes sont désormais prises en charge dans Mary et Forge. Les limites historiques ci-dessous décrivent la livraison du 24 octobre ; les approbations restent hors de cette extension.

Le pilote du 24 octobre ouvre une vraie conversation Codex à partir de l’entrée native `skill` de `.agents/skills/bmad-agent-analyst/SKILL.md`. Il couvre l’accueil/menu de Mary puis la discussion libre, en français et en lecture seule. Les workflows documentaires proposés dans le menu, les approbations, questions structurées, installations et écritures ne sont pas pris en charge : une demande native correspondante refuse l’interaction et fait échouer le tour. Le pilote ne débloque ni 1.1/1.2 ni le tracer distribuable 1.3.

Pré requis locaux explicites : installation Mary exacte du profil épinglé dans `src/adapters/bmad/profile.ts`, ses huit fichiers de compétence/scripts, configuration TOML lisible, Codex natif Windows x64 dans l’implantation npm déjà qualifiée, compte propre à Madness avec rappel forfait acquitté. Le runtime Python 3.12.14 fourni par Codex sous `%USERPROFILE%/.cache/codex-runtimes/codex-primary-runtime/dependencies/python` et UV 0.13.0 sous `%USERPROFILE%/scoop/apps/uv/current/uv.exe` doivent correspondre aux empreintes de `runtime.ts`. L’installateur Madness ne fournit pas ces deux outils. Une montée de version de BMad, Python ou UV impose de requalifier puis mettre à jour ces empreintes ; aucun téléchargement ou repli implicite n’est exécuté.

Le qualificateur vérifie les fichiers et dépendances avant le forfait. Les surcharges d’agent non couvertes sont refusées ; les couches de configuration centrale sont lues et incluses dans l’empreinte. Les vrais resolvers s’exécutent avec `uv run --offline --no-project --no-config --python <runtime externe> -- <python externe> -B -I -S -c <chargeur contrôlé> ...`, depuis la racine du projet. Le chargeur exécute les scripts installés et leurs trois modules épinglés ; `-I -S` empêche un module ajouté au projet ou un `sitecustomize` de remplacer la bibliothèque standard, et `-B` interdit les caches Python. L’interpréteur `.venv` du projet n’est jamais exécuté. UV utilise son cache externe temporaire ; le `uv.toml` du dépôt reste intact.

Le profil natif et son répertoire de travail sont créés hors du projet, sous `userData/codex-connection-v1/dialogues`. L’entrée native transmet le chemin réel du SKILL installé. Les outils dynamiques `bmad_resolve` et `bmad_read_file` exécutent réellement les resolvers et ne lisent que les fichiers du profil ; `bmad_unsupported` refuse toute capacité absente. Les sorties et demandes JSON-RPC restent bornées et corrélées à `threadId`, `turnId` et `callId`. Le shell, le web, les sous-agents, plugins et MCP hérités sont désactivés. Aucun journal natif brut n’entre dans les preuves. L’arrêt ne concerne que le processus possédé et le profil temporaire est retiré après fermeture confirmée.

La référence de connexion est un identifiant opaque dérivé de l’inscription et du compte Madness ; l’initiative provient du resolver config. Une session native conserve ces références et sa conversation. La connexion refuse une reconnexion ou déconnexion concurrente. Le refresh n’a lieu qu’au lancement explicite ; une session dont le jeton expire demande un nouveau lancement après arrêt. L’arrêt incertain bloque un nouveau dialogue et un témoin de connexion pendant la session.

Le contrat `madnessDialogue` est séparé du snapshot v1. Les échanges utilisent ses enveloppes existantes et la même file de sauvegarde que les projets/brouillons ; aucune propriété n’est ajoutée au schéma. Le réseau n’occupe jamais cette file. Avant chaque réponse, le renderer sauvegarde le texte capturé, puis attend l’accusé natif et sa sauvegarde avant d’afficher « envoi acquitté ». Une réponse finale n’est disponible qu’après une fin native corrélée et sa sauvegarde. Le brouillon reste disponible. Erreur réseau, interaction refusée, stockage défaillant et arrêt incertain gardent des états distincts et ne rejouent aucun tour. Au redémarrage, l’historique revient sans thread natif ni refresh.

```powershell
npm test
npm run build
# Sortie séparée pour préserver une ancienne fenêtre ou livraison encore ouverte.
npx electron-builder --win --x64 '--config.directories.output=dist/dialogue-pilot'
node scripts/qualification/dialogue.mjs --no-captures
node scripts/qualification/dialogue.mjs --packaged
```

Le banc dialogue exerce le vrai main/preload, le refus de profil absent, les contextes étrangers, l’historique restauré, le brouillon, le repli et deux largeurs sur profil jetable, sans compte ni fournisseur. `--executable=<chemin absolu>` permet de viser une autre sortie avec `--packaged`. Preuves : `_bmad-output/initiative-madness/qualification-dialogue-local/`. La preuve réelle Mary → réponse libre → arrêt est distincte et doit utiliser la connexion Madness déjà autorisée ; les tests synthétiques ne la remplacent pas. Ne jamais copier de credentials d’un autre outil ou réécrire `qualification-connexion-codex/live-confirmed-profile.json`.

L’essai réel du 24 octobre est confirmé dans `qualification-dialogue-local/live-profile.json` : entrée native Mary, deux resolvers réellement appelés, réponse libre et sortie de persona, trois tours conservés, arrêt natif puis réouverture identique sans relance. Les messages de test sont publics dans `live-transcript.md`, sans donnée d’un projet de travail. Les captures de l’aide réseau sont synthétiques et identifiées comme telles. La suite finale compte 112 tests réussis ; la relecture ne laisse aucun correctif différé.

Le premier accès JWKS a été redirigé vers Zscaler. Après ouverture par le porteur de la page publique dans son navigateur habituel, Main a reçu directement HTTP 200, sans copie de contenu, cookies supplémentaires ni redirection suivie. Cela ne qualifie pas tous les environnements d’entreprise. Le refresh précharge désormais un jeu de clés utilisable avant le POST de rotation, puis le réutilise pour vérifier l’ID token ; un échec de ce GET n’échange aucun refresh token et reste visible dans le panneau de connexion.

Le menu de Mary est conservé comme texte Markdown non interprété. Son rendu enrichi et le lancement des compétences du menu sont des suites distinctes ; les commandes proposées ne constituent pas une capacité déjà livrée.

## Pilote Forge : nouvelle idée et sorties observées

L’action « Mettre une idée à l’épreuve » prépare `$bmad-forge-idea` installé, sans envoyer le brouillon. Vérifier le profil ne lance aucun modèle. Le lancement explicite utilise ensuite le compte propre à Madness et le forfait annoncé. Mary reste disponible pour la discussion libre.

Le profil Forge épingle 96 fichiers BMad dans `src/adapters/bmad/forge-manifest.ts` : compétence, scripts et dépendances, roster et métadonnées des compétences installées. Les configurations et personnalisations présentes sont capturées dans l’empreinte de session. Hooks, faits persistants et instructions de fin non vides, sortie extérieure au projet, dépendance modifiée et session Forge inachevée bloquent avant invocation. Les profils locaux épinglés ne qualifient pas une distribution générale.

Le modèle reçoit la référence native au skill. Codex reste dans un dossier isolé, en `read-only`, avec shell, plugins, apps et sous-agents désactivés. Les outils hôte exécutent réellement customization/config/personas et `memlog.py init/append/set` ; `resources/bmad-script-runner.py` réapplique `-I -S -B` aux sous-processus Python des personas et vérifie leurs octets avant chargement. Python 3.12.14 et UV 0.13.0 restent des prérequis externes épinglés ; seul ce lanceur est ajouté aux ressources de l’installateur.

Les écritures sont limitées à un nouveau `forge-{slug}` sous la sortie BMad et l’initiative résolues. Aucun chemin libre ni reprise n’est disponible. Le journal natif, le HTML intégral obligatoire et le Markdown si `HARDENED` sont relus ; chemins, tailles et SHA-256 sont enregistrés avec leur date et la corrélation du tour/appel. Les fichiers déjà présents, liens, octets modifiés ou sauvegardes refusées ne deviennent pas des succès. Une opération commencée sans confirmation reste inconnue et bloque son rejeu. Madness n’exécute ni ne prévisualise le HTML.

L’annexe `userData/workflows-v1/{conversationId}.json` conserve atomiquement invocation, contexte, empreintes, sortie et observations ; Snapshot v1 reste inchangé. Les échanges restent dans le Snapshot existant. À la réouverture, l’annexe est historique, les activités interrompues deviennent inconnues et aucun moteur ne reprend. Une clôture native observée ne vaut pas acceptation humaine. Les copies d’invocation/chemin sont confirmées après le retour du presse-papiers Windows ; le texte reste sélectionnable en cas d’échec.

```powershell
npm test
npm run build:win -- --config.directories.output=dist/forge-pilot
node scripts/qualification/forge.mjs
node scripts/qualification/forge.mjs --packaged
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots
```

Le banc Forge copie le profil BMad dans un projet jetable, exécute les vrais outils hôte sur des données synthétiques, puis vérifie main/preload, préparation, restauration, brouillon, thèmes et navigation sur compilé/paquet. Il nettoie son espace même après échec. Ses preuves sont distinctes sous `tickets/epic-boucle-codex/qualification-boucle-bmad/`. La preuve d’un workflow modèle réel dans une application installée reste séparée : elle exige le compte Madness autorisé, sans copie de coffre, un projet témoin, activation/resolvers/personas, journal et rapport observés, puis arrêt/réouverture. Les bancs synthétiques ne satisfont pas cette preuve et ne ferment aucun gate historique.

## Messages progressifs et activité corrélée (1.4)

Le connecteur reçoit `item/agentMessage/delta`, les items complets et la fin du tour. Il corrèle `threadId`, `turnId` et `itemId` en interne puis émet des identifiants locaux ; les identifiants natifs ne passent pas le port de dialogue. Les deltas adjacents sont coalescés, les items complets réconciliés par identifiant et préfixe. Deux items ayant le même texte restent deux messages. Une incohérence, un item incomplet au terminal, une limite dépassée ou une demande étrangère échoue sans replay. Les réponses RPC gardent leur type d’identifiant ; les appels natifs ont leur propre `callId`.

Le cœur capture le contexte, la vraie demande, un tour local et l’ordre de chaque message. Il publie au plus une projection par tranche de 32 ms et regroupe les upserts après 100 ms ; il ne sauvegarde pas chaque fragment. Les lots utilisent la même file que les brouillons et sont drainés avant le terminal ou l’arrêt. Un accusé n’est annoncé qu’après son retour natif et l’enregistrement du message envoyé. Le texte reçu reste visible pendant la sauvegarde, avec « conservation non confirmée » jusqu’au retour du disque. Un échec garde ce texte en mémoire, arrête le fournisseur et ne devient jamais une réponse durable ou un tour réussi.

Bornes de projection : 200 items et 100 000 caractères par tour, 2 000 messages et 2 000 000 caractères pour les métadonnées de la session. La réserve d’un tour est vérifiée avant un nouvel envoi ou lancement. Le transport garde ses bornes de 512 événements en attente, 1 Mio de ligne et 8 Mio de sortie de processus. Les articles sont stables et le défilement suit le bas seulement lorsqu’il était visible ; remonter pour lire et changer d’onglet garde l’ancrage. Les fragments ne sont pas des annonces live.

L’identité est figée à la première observation de chaque item. Un JSON structuré `bmad_resolve(agent)` attestant `Mary` peut sourcer les nouveaux messages de ce tour ; il ne réattribue ni les items déjà commencés ni les tours suivants. Une prose, le texte de l’invocation et les personas de Forge ne suffisent pas. Sans attestation structurée, l’interface affiche « Agent non identifié ». Snapshot v1 conserve strictement `id/role/text` : après réouverture les textes et brouillons reviennent, l’identité et l’état du tour sont inconnus et aucun moteur ne reprend. Les annexes et observations Forge restent indépendantes.

```powershell
npm test
npm run build:win -- --config.directories.output=dist/conversation-pilot
node scripts/qualification/conversation.mjs
node scripts/qualification/conversation.mjs --packaged
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots
```

Le banc conversation utilise un profil jetable sans compte : les événements synthétiques traversent le vrai preload et renderer compilés ou empaquetés ; le cœur source vérifie séparément les upserts et la réouverture exacte pendant que l’application est fermée. Ces deux contrôles ne prétendent pas exécuter un dialogue modèle. Le réseau est bloqué et l’espace est nettoyé même après échec. Les rapports et captures sont sous `tickets/epic-boucle-codex/qualification-conversation/`. Le protocole de preuve native installée y reste distinct ; les bancs isolés ne qualifient ni cette preuve, ni l’acceptation humaine, ni les gates historiques.

## Reconstruire après mise à jour

Choisir explicitement les nouvelles versions, mettre à jour le manifeste et le lockfile, puis refaire types, tests, build, paquet et réouverture sur profil isolé. Conserver le profil hors des binaires et vérifier la reprise avec le nouveau programme avant diffusion. Les previews sont admises ; aucun repli silencieux de version ni patch local de dépendance n’est utilisé. Les avertissements de dépréciation transitifs remontés par npm sont à suivre lors des montées de version.

Le programme et son installateur restent non signés ; l’icône Electron par défaut est conservée en attendant une ressource de marque approuvée. Aucun auto-updater n’est livré. Les licences des ressources embarquées sont dans `resources/THIRD-PARTY-NOTICES.md` et les notices du runtime distribué. Les livrables BMad, les preuves et les fichiers non suivis préexistants ne sont pas inclus dans l’archive applicative.

## Questions natives et brouillons liés — story 1.5

Le profil expérimental est borné au vrai binaire Codex 0.144.6, SHA-256 `4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7`. Une autre empreinte est refusée avant acquisition du compte. `features.default_mode_request_user_input=true` et `experimentalRawEvents=true` ne concernent que le processus isolé de dialogue. Aucun réglage global n’est modifié.

`item/tool/requestUserInput` est normalisé en une demande locale immuable : projet, initiative, conversation, connexion, demande de lancement, tour et identité attestée ou inconnue. Les IDs RPC, thread, tour, appel et champs natifs restent dans le connecteur. Le profil accepte un à trois champs non secrets, choix réels ou texte libre ; aucun choix par défaut. Une demande secrète, incohérente ou concurrente arrête le tour sans réponse automatique.

Le formulaire inline dispose de sa propre saisie, enregistrée par demande dans `userData/questions-v1/{questionId}.json`, avec version et remplacement atomique. Snapshot v1, les six méthodes `madness`, les annexes Forge et le brouillon libre ne changent pas. L’attente reste nommée pendant la navigation et donne un retour vers sa conversation. Envoi explicite seulement ; le verrou est pris avant toute attente, puis la saisie est conservée avant l’écriture RPC.

Le résultat est écrit au RPC original (y compris l’ID numérique zéro). « Réponse envoyée et enregistrée » exige ensuite un `rawResponseItem/completed` corrélé au thread, au tour et au call_id, dont le JSON décodé est structurellement égal à la réponse réellement soumise, puis l’écriture atomique de cet état. L’ordre des clés d’objet est ignoré, l’ordre des valeurs conservé. Un `serverRequest/resolved`, un callback stdin, un terminal seul ou `aborted…` ne suffit jamais. Reçu absent ou discordant : résultat inconnu, arrêt, aucun rejeu.

Le délai machine du tour est suspendu pendant la saisie et l’attente du reçu. Un délai connu de la question est appliqué localement : invalidation et arrêt sans choisir de réponse. L’expiration autonome du runner n’est pas prétendue qualifiée. Arrêt, résolution avant choix, collision et terminal libèrent les attentes avant le drain RPC. Une invalidation pendant la sauvegarde conserve la saisie mais interdit sa transmission. À la réouverture, les demandes deviennent historiques et non répondables ; un ancien envoi en cours reste inconnu. Aucun moteur ou réseau ne reprend.

```powershell
npm test
npm run build
npx electron-builder --win --x64 '--config.directories.output=dist/questions-pilot-final'
node scripts/qualification/questions.mjs
node scripts/qualification/questions.mjs --packaged --executable=dist/questions-pilot-final/win-unpacked/Madness.exe
```

Les tests couvrent contrat, RPC zéro, ACK exact/retardé/absent, délai, terminal, collision, arrêt, sauvegarde refusée et saisie séparée. Le banc compilé/paquet utilise Main, preload et renderer réels avec données synthétiques, sans compte ni fournisseur, puis vérifie la réouverture exacte et nettoie ses seuls profils jetables. Les notifications actives injectées servent uniquement à vérifier les états visuels. Les preuves sont sous `tickets/epic-boucle-codex/qualification-questions/`. Le spike loopback, le parcours avec vrai modèle, l’installation personnelle, l’acceptation visuelle et les gates restent des preuves distinctes.

## Approbations de fichiers ponctuelles — story 1.6

Mary reste en lecture seule par défaut. Avant le lancement, « Proposer des modifications avec approbation » active un mode capturé pour cette session. Seul ce mode utilise `approvalPolicy=on-request`, reviewer `user`, sandbox read-only et `apply_patch` natif ; shell, commandes, permissions et réseau d’outil restent indisponibles. Forge garde ses outils hôte et ses bornes précédentes. La garde du binaire 0.144.6 utilisée pour les questions s’applique aussi à ce protocole expérimental.

Le connecteur joint la demande `item/fileChange/requestApproval` et l’item `fileChange` par thread, tour et item, même si leurs événements sont décalés. Tous les fichiers `add/update/delete` de l’opération sont affichés avant le choix ; ajout et suppression portent le contenu complet, modification un diff unifié intégral. L’ordre des fichiers ne définit pas la portée. Le consentement concerne tout le patch, une seule fois : seules les décisions natives `accept` et `decline` sont émises, avec le type et la valeur exacts de l’ID RPC. Aucun feedback textuel n’est inventé dans cette réponse.

Les chemins sont canoniques et limités au projet : liens symboliques/jonctions, fichiers à liens multiples, traversées, déplacements, racines protégées des données Madness, `.git`, `.agents`, `_bmad`, `.codex` et `.aws` sont refusés. Création : le parent doit déjà exister. La capacité accepte au plus 50 fichiers et 100 000 caractères de proposition par patch, texte UTF-8 sans NUL. Les diffs ou préconditions ambigus sont refusés. Les octets et existences sont capturés puis revérifiés immédiatement avant toute décision. Une modification de portée retire l’attente ; aucun ancien accord ne suit une proposition modifiée. Le contrôle ne prétend pas verrouiller les autres programmes ni fournir une transaction ou un rollback du patch natif.

Choix, transmission et effets sont conservés séparément. La décision est enregistrée avant l’écriture RPC ; la transmission n’est enregistrée qu’après le callback d’écriture. `serverRequest/resolved` ne vaut ni décision reçue ni effet réussi. Le reçu d’opération exige, après cette transmission explicite, `item/completed` de type `fileChange` du même thread/tour/item que la proposition et la demande, puis la relecture de tous les octets/existences. `completed` ne peut réussir qu’après `accept`, `declined` qu’après `decline` ; un mauvais item/statut, des effets divergents ou un terminal sans résultat laissent l’opération refusée ou inconnue. Un accord seul, des fichiers seuls ou du texte modèle ne suffisent jamais.

Sur le modèle natif en Code Mode, `exec` peut englober `tools.apply_patch` : le raw `custom_tool_call_output` appartient alors à l’appel englobant, avec un autre `call_id` et un tableau de sorties. Il ne prouve pas l’issue de chaque opération interne. Le raw reste diagnostique seulement si son thread/tour/call_id correspondent réellement à l’item fichier ; sa chaîne est conservée telle que reçue lorsqu’elle est disponible à temps, sinon `ApprovalResult.raw` reste vide, sans sortie fabriquée. Aucun contenu ou marqueur de succès du raw n’est nécessaire au reçu fileChange. Les reçus exacts des questions1.5 ne changent pas.

L’ajustement a une saisie distincte par demande. Le saisir ne l’envoie pas. L’utilisateur refuse d’abord tout le patch, attend le refus natif et la fin du tour, puis choisit « Envoyer cet ajustement à Mary ». Un nouveau tour textuel explicite conserve le même contexte et produit une nouvelle proposition à approuver. L’ancien refus n’accorde rien au nouveau patch. Un ajustement vide, déjà envoyé ou rattaché à un autre contexte est refusé.

Une échéance locale de dix minutes est annoncée. Le temps de lecture suspend le délai machine ; l’échéance locale, un arrêt, un terminal même pendant la file d’outils, un contexte changé ou des préconditions modifiées retirent les commandes. L’expiration native autonome n’est pas prétendue. Une coupure ou une conservation refusée après transmission laisse l’effet inconnu et arrête le tour. Les données sont des annexes atomiques `userData/approvals-v1/{approvalId}.json` ; Snapshot v1 et les six méthodes `madness` restent identiques. À la réouverture, seules des opérations historiques sans autorisation active reviennent, avec les saisies et incertitudes ; aucun moteur ni effet n’est relancé.

```powershell
npm test
npm run build
npx electron-builder --win --x64 '--config.directories.output=dist/approvals-pilot'
node scripts/qualification/approvals.mjs
node scripts/qualification/approvals.mjs --packaged
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots
```

Les tests source couvrent contrats hostiles, patch mixte, préconditions, ID zéro/string, proposition décalée ou modifiée, terminal, échéance avec horloge contrôlée, décisions rapprochées, verrous, conservation refusée et restauration. Les tests de reçu couvrent aussi raw absent ou englobant sous forme de tableau, diagnostic corrélé, attente de transmission, absence de fileChange natif et mauvais thread/tour/item/statut/effets. Le banc Main/preload/renderer compilé ou empaqueté utilise un profil synthétique sans compte ni réseau ; il contrôle la portée intégrale, les états, le clavier, les thèmes, les tailles bureau/compact et la réouverture exacte, puis nettoie ses seuls témoins. Les rapports sont sous `tickets/epic-boucle-codex/qualification-approvals/`. Le banc distinct `native-receipt-codemode-loopback.mjs` y exerce le protocole produit avec le vrai runner0.144.6 : modèle HTTP simulé lié à127.0.0.1, `exec` appelant `tools.apply_patch`, accord puis refus natifs et effets relus, aucun compte/OAuth ni modèle externe. Les rapports `protocol-spike.md` et `protocol-file-kinds.md` restent les mesures directes loopback figées. Le parcours avec vrai modèle, l’installation personnelle, l’acceptation visuelle humaine et les gates historiques demeurent des preuves séparées.

## Interruption et récupération — story 1.7

Un arrêt demandé ne vaut pas fermeture observée. Les attentes sont invalidées, leurs saisies restent dans les annexes ; la session native fermée ne peut pas reprendre. Main conserve uniquement son contrôle d’arrêt lorsqu’il est incertain. Le fichier privé `userData/codex-owned-run-v1.json` version1 porte un identifiant local de propriétaire, un statut et, lorsqu’elle a pu être capturée, l’identité Windows PID/date de création/image. Il ne contient aucun secret et ne traverse jamais le pont renderer. Le marqueur est écrit avant chaque processus dialogue ou témoin connexion, y compris sa détection de version ; une coupure avant capture de l’identité reste bloquante. Version de stockage inconnue, conflit ou identité inaccessible ne permettent aucun lancement. La réobservation explicite vérifie l’identité OS avant de terminer le seul processus possédé ; un PID réutilisé avec une autre date/image n’est jamais arrêté. Aucun reset du verrou ni PID/chemin renderer n’existe. Les callbacks anciens ne libèrent pas un propriétaire ou bail plus récent.

Pour un ancien accord accepté dont l’effet reste inconnu, « Inspecter tous les fichiers » compare uniquement leurs empreintes/existences aux états avant et proposé. Cette lecture utilise les racines canoniques, protections et bornes1.6 ; aucun diff n’est appliqué. Elle distingue avant, après, identique, mélange et divergence. L’observation est datée, éphémère et reste séparée du résultat natif historique, toujours inconnu. Un accès refusé ou un chemin protégé produit une erreur sans écriture projet. Avant un nouveau départ avec effets (mode fichiers Mary ou outils hôte Forge) et avant chaque envoi correspondant, Main exige l’inspection de chaque accord incertain, âgée d’au plus60secondes, relit tous les fichiers et les prérequis puis recontrôle le contexte. Il recommence aussi après l’ouverture du connecteur. Un changement, mélange ou écart bloque. Un nouveau lancement crée une nouvelle conversation, sans transmettre historique ni brouillon ; chaque nouveau patch exige son propre accord. Aucune reprise de thread ou workspace Forge n’est ajoutée.

L’erreur `NETWORK_UNAVAILABLE` conserve son code jusqu’au projet. L’aide réutilisable propose l’unique URL publique `https://auth.openai.com/.well-known/jwks.json`, Ouvrir, Copier, puis « Vérifier l’accès ». Ce GET strict Main est indépendant du coffre, d’OAuth, du refresh, du témoin facturable et du modèle : cookies omis, redirections refusées, bornes15secondes/256Kio et JSON de clés publiques attendu. Le résultat réseau daté n’est jamais une connexion Codex vérifiée. Annuler ce contrôle n’interrompt ni ne libère le dialogue. Ouvrir/copier ne relance rien ; sur réseau d’entreprise, l’utilisateur peut devoir acquitter un avertissement dans son navigateur. Aucun délai d’expiration de cet acquittement n’est supposé.

```powershell
node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs
npm run build
npx electron-builder --win --x64 '--config.directories.output=dist/recovery-pilot'
node scripts/qualification/recovery.mjs
node scripts/qualification/recovery.mjs --packaged
node scripts/qualification/recovery-native.mjs
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots
```

Les tests `recovery*.test.mjs` couvrent stockage futur/concurrent, propriétaire inconnu, callbacks tardifs, frontières des commandes, inspections groupées, mélange/divergence, changement pendant lecture/ouverture et nouveau départ sans rejeu. Le banc Electron compilé/paquet utilise un profil synthétique sans compte ; ses contrôles de réseau n’appellent que l’URL publique, bloquée par le banc. Le banc natif utilise le vrai runner épinglé0.144.6, `exec → tools.apply_patch` et un fournisseur Responses simulé sur127.0.0.1 : il retire volontairement le terminal fichier après l’effet, restaure le propriétaire puis exerce arrêt, inspection et nouveau départ distinct. Aucun modèle externe n’est contacté. Rapports dans `tickets/epic-boucle-codex/qualification-recovery/`. Les seuls profils témoins créés sont nettoyés après fermeture confirmée. Snapshot v1, les six méthodes `madness`, les comptes et les pilotes antérieurs gardent leurs formats. Installation personnelle, validation humaine et gates distribués restent distincts.

## Attentes communes et récapitulatifs — story 1.8

`src/core/work-overview.ts` construit une projection pure des snapshots locaux, du dialogue natif et de la connexion réelle, avec horloge injectée. L’accueil et le projet lisent les mêmes entrées : question, approbation, transmission en cours, activité native et récupération. Une attente active exige la conversation et les cinq identifiants de contexte capturés, le tour et la requête corrélés, une phase native encore active et une échéance non dépassée. Le renderer retire le contrôle à cette échéance ; le cœur conserve ses propres gardes avant transmission. Les capacités historiques G0 ne représentent pas la connexion personnelle. Son dernier témoin daté reste distinct de la lecture locale et ne déclenche aucun contrôle réseau.

Un lien sélectionne le projet puis la conversation exacte et donne le focus au contrôle existant après montage. Un jeton de navigation écarte les retours anciens, les clics concurrents et les changements de destination. Les brouillons libres, réponses et ajustements restent dans leurs maps séparées. Une demande devenue inactive pendant la sélection reste lisible avec explication et sans action d’envoi. Un arrêt restauré sans contexte garde sa portée globale ; il n’est jamais attribué au projet affiché.

Le récapitulatif conserve le texte reçu exact, sans interpréter une décision dans sa prose. Une fin de tour exige sa corrélation native. Les choix conservés dans la conversation portent chacun leur tour d’origine, leur transmission et leur effet distinct ; aucun accord ponctuel ne valide un livrable. Les chemins annoncés des patches et de Forge restent séparés des relectures natives et de leurs empreintes. Résultat Forge, clôture, acceptation humaine et suite structurée inconnue sont explicités séparément. Après réouverture, le texte et les annexes reviennent, avec tour/identité historiques inconnus et aucune ancienne attente réactivée.

```powershell
node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs
npm run build:win -- --config.directories.output=dist/overview-pilot
node scripts/qualification/overview.mjs --no-captures
node scripts/qualification/overview.mjs --packaged --no-captures
node scripts/qualification/overview-native.mjs
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots
```

`overview.mjs` utilise les vrais Main/preload/stockage et des profils isolés sans compte ; ses attentes actives sont injectées pour qualifier l’affichage, la navigation, les thèmes et les limites d’action. Ce banc ne prouve aucun reçu natif. `overview-native.mjs` exerce séparément le vrai runner épinglé, le protocole produit et le coordinateur : résolutions BMad, question native, réponse explicite, reçu brut exact observé dans le corps Responses, conservation et récapitulatif corrélés. Son fournisseur HTTP simulé écoute exclusivement sur127.0.0.1 ; aucun compte, OAuth ou modèle externe. Les rapports et captures sont dans `tickets/epic-boucle-codex/qualification-overview/`. Les profils sont nettoyés après fermeture confirmée. La seconde passe visuelle est réservée à la confirmation après revues ; utiliser `--no-captures` pour les vérifications intermédiaires. Snapshot v1 et les six méthodes `madness` ne changent pas. R32 temps/coût, Loop, graphe, catalogue, refonte globale et gates historiques restent hors de ce lot.
## Recherche native des sessions Forge — correctif 13, version 0.1.2

L’activation native exige désormais `bmad_forge_resolve(workflow)`, `bmad_forge_resolve(config)`, puis `bmad_forge_check_sessions({})` avant la première fin de tour et avant `init`. Ce dernier outil n’accepte aucun argument ni chemin. Il recherche les seuls dossiers `forge-*` dans la sortie générale et celle de l’initiative capturée (un seul emplacement sans initiative), en dérivant ces chemins du profil qualifié. Son résultat factuel distingue sortie absente, vide et sessions complètes ; il expose uniquement les chemins imposés, statuts, tailles et empreintes des frontmatters. Le reçu `check-sessions`, lié à l’appel et au tour de la conversation, est conservé avec `path: null` et l’empreinte/taille du résultat exact, sans nouveau schéma Snapshot ou IPC. Une erreur de conservation ne vaut aucun contrôle observé et interdit `init`.

Les protections canoniques existantes restent actives : liens/jonctions, hardlinks, types non réguliers, UTF-8 invalide, frontmatter absent ou mal formé et dépassements des bornes sont refusés. Le fichier reste limité à1Mio ; seul son en-tête, borné à64Kio, est interprété. Toute session sans statut explicite `complete` empêche une nouvelle session ; aucune reprise n’est disponible. Le contrôle est indisponible après `init`, pour ne pas confondre la session courante avec une reprise. Juste avant les effets de `init`, l’hôte relit aussi les deux mêmes emplacements : une session inachevée apparue après le reçu bloque le démarrage. Cette précondition interne ne constitue pas un nouvel appel du modèle.

Les tests `forge.test.mjs`, `forge-protocol.test.mjs` et `workflow-store.test.mjs` couvrent l’ordre, la fraîcheur, les frontières et la relecture d’annexes anciennes inchangées. Le banc `forge.mjs` appelle réellement le contrôle hôte dans son scénario synthétique sans modèle. Les preuves0.1.1 restent historiques ; construire0.1.2 et son manifeste neuf dans `dist/forge-session-check/`, qualifier le paquet exact puis le remplacer uniquement avec le profil personnel fermé et conservation des données contrôlée. Le parcours natif avec modèle personnel reste la responsabilité de1.11 ; ce correctif ne clôture pas G1.

# Qualification intégrée de l’epic 1 (usage personnel local)

Le harnais permanent `scripts/qualification/epic-one.mjs` relie les nouveaux essais au manifeste final 1.13, version 0.1.2 : `qualification-forge-session-check/installation-final/release-manifest.json` sous l’epic, ASAR `9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4`. Ce manifeste est le défaut ; `--manifest=<absolu>` permet de le désigner explicitement. La version doit correspondre exactement à `releaseVersion`, issue du `package.json` courant : une version différente, même annoncée par un manifeste, est refusée. Il vérifie l’identité et les octets ASAR/runner Python, observe la version et l’Electron réellement lancés, puis conserve séparément la révision Git et les empreintes des scripts actuels. Le manifeste historique 1.9 et ses preuves de remplacement 0.1.0→0.1.1 restent intacts ; ils ne qualifient pas le nouvel ASAR. Le harnais ne régénère jamais de manifeste de livraison. L’exécutable et le répertoire de sortie sont obligatoires et absolus ; le répertoire doit être neuf et son parent déjà présent. Une tentative échouée conserve son `report.json` ; reprendre signifie choisir un autre répertoire, sans rejouer automatiquement un ancien contrôleur.

```powershell
node scripts/qualification/epic-one.mjs --mode=synthetic --manifest=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-forge-session-check/installation-final/release-manifest.json --executable=C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/synthetic-0-1-2-001
node --test --test-concurrency=2 tests/epic-one-qualification.test.mjs
node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs
```

Le mode par défaut est `synthetic`. Les six bancs UI (Forge, conversation, questions, approbations, récupération, vue commune), les deux protocoles avec vrai runner/Responses loopback et les cinq contrôles Windows sont séquentiels. Les profils synthétiques restent temporaires et les bancs ne reçoivent aucun compte. Le harnais compare les empreintes des preuves historiques avant/après. Les sorties `forge`, `conversation`, `questions`, `approvals`, `recovery` et `overview` acceptent aussi `--output=<nouveau absolu>` ; leurs anciens défauts sont conservés. `recovery-native` accepte désormais ce même argument ; `overview-native` l’acceptait déjà. Ne pas lancer ces bancs en parallèle avec d’autres essais UI.

Le mode personnel exige à la fois `--mode=personal` et une action explicite. Il conserve les chemins AppData/session habituels, la connexion SIWC et le forfait déjà enregistrés. Il refuse les déplacements du profil et les options désactivant TLS ; il ne copie ni ne lit le coffre. `preflight` ouvre le paquet, lit les ponts et métadonnées de connexion puis referme, sans vérifier la connexion, relancer OAuth ou demander un modèle. Le GET public Main reste une mesure distincte.

```powershell
node scripts/qualification/epic-one.mjs --mode=personal --action=preflight --executable=C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/personal-preflight-001
node scripts/qualification/epic-one.mjs --mode=personal --action=run --archive-witness --executable=C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/personal-run-001
node scripts/qualification/epic-one.mjs --mode=personal --action=close-active --archive-witness --executable=C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/personal-close-001
node scripts/qualification/epic-one.mjs --mode=personal --action=child-error --archive-witness --executable=C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/personal-error-001
```

`run` crée un témoin neuf depuis les fichiers BMad épinglés réellement installés, ouvre ce seul projet, qualifie/lance Mary en mode fichiers opt-in, demande une question native, conserve sa réponse puis la soumet explicitement. Il compare son reçu brut en mémoire, propose un patch d’un fichier témoin accepté une fois puis un autre refusé sans effet, relit tous les effets, enregistre explicitement un brouillon et arrête par le pont. Pour les approbations, résultat natif corrélé et effets relus sont obligatoires ; un raw disponible doit correspondre exactement, sinon son indisponibilité est consignée explicitement. Le reçu brut exact des questions reste obligatoire. Il lance ensuite le vrai Forge installé dans une conversation distincte : ses règles restent l’autorité ; au plus huit échanges synthétiques tentent d’obtenir le journal et les livrables, sinon le contrôle échoue sans inventer une fin. Cette action consomme des tours du forfait personnel. Une question ou un comportement hors du scénario prévu reste un échec à examiner, sans rejeu automatique.

`close-active` lance Mary puis maintient un tour par une question native non répondue avant fermeture de l’application. `child-error` utilise un autre témoin et tue uniquement l’enfant app-server dont PID, instant de création et chemin sont déjà observés, afin de contrôler sa sortie inattendue. Ces actions consomment aussi des tours réels. Aucun arrêt par nom de processus, reset du propriétaire inconnu ou reconnexion n’est effectué.

Chaque scénario observe le vrai PID Main (distinct du wrapper Windows), les enfants app-server possédés, leurs empreintes, les événements `close` et l’absence indépendante de leurs seuls espaces de dialogue. Les hooks sont passifs sur arguments/env/transport ; leurs fichiers `native-events-N.json` ne contiennent que compteurs, identités, hashes et comparaisons booléennes. Les réponses, les tokens, l’environnement complet et stderr ne sont pas publiés. L’accès HTTPS et la confiance TLS du child se déduisent d’un tour réellement réussi avec sa configuration imposée ; aucune chaîne de certificats ni CA n’est capturée.

La comparaison de réouverture utilise le snapshot durable **après** shutdown ; les textes et annexes restent exacts, les contrôles historiques inactifs et le compte lisible. L’absence d’activité/réseau spontané couvre uniquement les trois secondes instrumentées après installation du hook. `--archive-witness` n’agit qu’après fermeture et réouverture réussies : données du seul témoin archivées dans `userData/test-project-archives/`, puis retrait des récents et annexes correspondantes. Un inventaire Windows en lecture seule refuse toute copie Madness ouverte, y compris déplacée/renommée selon ses métadonnées, et tout runtime Electron possible/incertain ; cette garde précède chaque mutation, quel que soit le chemin du paquet testé. Le snapshot passe par JsonStore (schéma, conflit et écriture atomique). Les vrais projets et préférences sont conservés ; le dossier témoin reste au chemin des preuves. Un échec conserve le témoin et interdit cet archivage automatique.

Les modules sont importables sans effet de bord : `runSynthetic(options)` dans `epic-one.mjs`, `runPersonal(options)`, `PersonalSession`, `createWitness()` et `installPassiveObservation()` dans `epic-one-personal.mjs`. Le parent peut piloter des étapes explicitement par ces API, sans dupliquer les gardes de fermeture, de provenance ou d’archivage. Les rapports du harnais ne clôturent pas seuls G0/G1 : le parent consolide la matrice R1–R10, les limites, les preuves de remplacement 1.9 et les contrôles personnels. G2–G5 étendus, refonte UX, catalogue et V1 complète restent distincts.

Pour isoler un échec de première activation Forge, utiliser l’action explicite suivante avec une sortie neuve :

```powershell
node scripts/qualification/epic-one.mjs --mode=personal --action=forge-diagnostic --executable=C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/personal-forge-diagnostic-001
```

Cette action ouvre les chemins personnels normaux sous les mêmes gardes, crée un témoin neuf, qualifie et lance directement Forge une seule fois. Elle ne lance pas Mary, n’envoie aucun tour de suivi et ne répond à aucune question. Après la première fin de tour, attente native ou erreur, elle demande l’arrêt pertinent, restaure la sélection puis ferme l’application et constate les identités/espaces possédés. Elle consomme cette seule activation sur le forfait existant. Le statut distingue diagnostic capturé et échec natif ; aucun G1, livrable ou fin de workflow ne s’en déduit. Le témoin reste lié et conservé : `--archive-witness` est refusé pour cette action, qui n’effectue aucun archivage automatique.

Le champ `controlTrace` des fichiers `native-events-N.json` conserve les seules métadonnées de contrôle : séquence, PID enfant, hashes des références RPC/thread/tour, méthode/type/outil/kind whitelistés (sinon `other`), booleans de présence/type des clés et catégorie du chemin (`manifest`, `config`, `resume-glob`, `other`). Il reconnaît `bmad_forge_check_sessions`, dont aucun argument n’est prévu ; toute clé supplémentaire reste signalée sans sa valeur. Le diagnostic reconnaît l’opération observée `check-sessions`. Aucun chemin d’argument, prompt, contenu d’outil, argument complet, environnement, bearer ou stderr n’est publié. Sur stdin, seules les réponses de refus sont relevées, par référence RPC et codes fixes ; cette observation ne prouve pas leur réception native. Les identifiants natifs des autres compteurs sont également hachés. Les chemins des seuls binaires/espaces possédés restent dans le reçu de fermeture pour leur vérification.

La trace est bornée par défaut à 2 048 événements, 1 MiB par ligne et 8 MiB cumulés sur les deux flux. Les notifications de deltas sont seulement comptées ; elles ne produisent pas de lignes de trace ni de persistance par fragment. Plafond, ligne partielle/perdue, erreur de décodage ou conflit de restauration rendent `complete: false` et empêchent une réussite du contrôle ; les données déjà observées restent conservées. Le hook transmet les objets de spawn, les octets, callbacks, exceptions et retours de backpressure sans modification. Dans `report.json`, `forgeDiagnostic.activationEndSequence` borne la première activation avant arrêt et `firstRefusal` en indique le premier refus observé, s’il existe. Une catégorie `resume-glob` est une observation de forme d’argument, pas une cause présumée ni une capacité ajoutée au produit.

## Candidat de recomposition de l’espace de travail

La préparation Mary/Forge appartient à Parcours. Conversation donne accès à l’échange et à la saisie ; « Préparer un échange » monte Parcours et focalise Mary sans qualification ni lancement. Le contexte du projet se consulte depuis sa commande, avec fermeture Échap et retour de focus. La projection des attentes conserve ses portées et destinations ; connexion et récapitulatifs sont consultables dans un dépliage secondaire. Les demandes et les patches actifs conservent leur contenu complet et leurs décisions textuelles. Aucun contrat Main/preload, connecteur, schéma de conservation, version ou dépendance ne change.

La demande corrélée en attente ou en transmission précède les messages et les demandes conservées. Ces dernières restent dans un historique dépliable, avec les mêmes textes, valeurs et identifiants ; la navigation exacte ouvre le détail nécessaire avant de focaliser son titre. Si le contrôle focalisé disparaît ou expire, le focus revient au titre neutre de cette demande, y compris après son déplacement dans l’historique ; une autre surface garde son focus. Le brouillon libre est nommé comme tel pendant une question ou une approbation et conserve sa sauvegarde séparée. La bande compacte distingue le besoin d’inspection d’un arrêt Codex effectivement non confirmé, dont la portée globale et le blocage des nouveaux échanges restent visibles hors des détails.

Le banc dédié exige un répertoire neuf, dont le parent existe déjà. Il utilise les vrais Main/preload/stockage avec des fixtures sans compte, un réseau bloqué après instrumentation et des profils temporaires supprimés après fermeture confirmée. Il mesure les cibles de 40 px, l’axe de 28 px, les exclusions des contrôles Windows et les débordements à 1440, 1320, 720 et 600 px, dans les deux thèmes, rail et tiroir. Il vérifie aussi des noms réellement longs, le zoom Electron à 200 %, le clavier, le mouvement réduit, les demandes exactes et la sauvegarde/réouverture. Le rapport distingue les états injectés des preuves natives. Les captures partent du haut du document et sont identifiées par état et empreinte ; `--no-captures` permet les contrôles intermédiaires sans consommer une passe visuelle.

À 200 %, le banc ajoute puis retire réellement du texte au clavier dans le brouillon, ouvre et ferme le contexte avec retour de focus, puis retrouve la valeur initiale pour la comparaison de restauration. Cela ne qualifie ni NVDA, ni les glyphes natifs, ni la mise à l’échelle Windows. Les douze noms de captures et leurs métadonnées de navigation/zoom sont conservés pour les deux tours visuels groupés du parent.

```powershell
node --test --test-concurrency=2 tests/connection-ui.test.mjs
npm run build
node scripts/qualification/workspace-design.mjs --no-captures --output=C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/qualification-refonte/compiled-001
npm run build:win -- --config.directories.output=dist/workspace-design
node scripts/qualification/workspace-design.mjs --executable=C:/Sources/madness/dist/workspace-design/win-unpacked/Madness.exe --output=C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/qualification-refonte/packaged-001
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots --executable=C:/Sources/madness/dist/workspace-design/win-unpacked/Madness.exe
```

Construire le candidat dans `dist/workspace-design/` et l’identifier par son ASAR. Conserver le paquet installé 0.1.2 et les manifestes historiques tant que la qualification native 1.11 en a besoin. Cette qualification visuelle et technique ne prouve ni mise à l’échelle Windows, ni lecteur d’écran, ni conformité WCAG, ni réception d’un modèle, ni acceptation visuelle humaine ou clôture G1. Le remplacement personnel et les revues de finition restent des étapes distinctes.
