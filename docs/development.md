# Développer Madness sous Windows

Le socle G0 ouvre un dossier par le dialogue Windows et conserve son contexte, un brouillon par projet et la préférence de navigation. Le logo Codex permet désormais une connexion locale explicite à ChatGPT puis un petit tour de vérification du forfait. Le dialogue BMad reste indisponible : aucun brouillon n’est envoyé et le dossier ouvert reste intact. Aucun identifiant d’un autre outil n’est lu ou copié.

## Reproduire l’assemblage

Utiliser Windows x64 et Node.js 24.13.0 ou une version compatible avec les exigences des paquets. Les versions exactes font foi dans `package-lock.json` ; Electron 45.0.0, electron-vite 6.0.0, electron-builder 26.15.3, TypeScript 7.0.2, React/react-dom 19.3.1 et Vite 8.3.5 ont été construits ensemble. `npm ci` télécharge Electron et prépare ses dépendances ; aucune installation globale n’est requise.

```powershell
npm ci
npm test
npm run build
npm run build:win
node scripts/qualification/windows.mjs
```

`npm run dev` démarre le serveur local du renderer et Electron. `npm start` ouvre les ressources déjà compilées. `npm run build:unpack` produit l’exécutable sans installateur ; `npm run build:win` produit aussi `dist/Madness-0.1.0-x64-setup.exe`. Aucun script ne publie de livraison distante. Le paquet est autonome et charge `madness://app/index.html`, sans serveur dev ni police distante.

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

`src/adapters/codex/oauth.ts` implémente indépendamment le protocole SIWC documenté, sans code du DevKit : listener uniquement `127.0.0.1`/port éphémère, state/nonce/PKCE S256 neufs, client émis validé, signature RS256, issuer/audience/expiration/sub vérifiés avec JOSE 6.2.12. Les callbacks étrangers n’interrompent pas l’attente légitime ; un refus, des scopes insuffisants ou une autre identité n’entraînent aucun témoin. L’attente humaine dure dix minutes au maximum ; chaque requête Main est bornée à quinze secondes et 256 Kio, sans redirection ni affaiblissement TLS. Le réseau OAuth utilise `net.fetch` et les certificats/proxy d’Electron.

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
