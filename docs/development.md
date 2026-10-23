# Développer Madness sous Windows

Le socle G0 ouvre un dossier par le dialogue Windows et conserve son contexte, un brouillon par projet et la préférence de navigation. Codex reste indisponible. Aucune commande ne lance un fournisseur, ne lit ses identifiants ou ne modifie le dossier ouvert.

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

`src/contracts` possède le schéma v1, les commandes, événements corrélés, résultats et capacités. `src/core` contient les cas d’usage, le port de stockage et le coordinateur de cycle de vie. Ces modules n’importent ni Node, ni Electron, ni SDK fournisseur. L’adaptateur JSON et le main implémentent leurs ports ; le renderer ne reçoit que `window.madness`.

Le pont expose lecture du contexte, choix du dossier, sélection d’un projet connu, sauvegarde du brouillon, préférence de navigation et abonnement aux événements métier. Main vérifie l’identité de la fenêtre, de sa frame principale, son URL exacte et la forme du payload avant délégation. Preload valide aussi les réponses et événements reçus. Aucune API IPC, fichiers, processus ou Electron générique n’est exposée. Le preload compilé contient son contrat et n’utilise que `require('electron')` comme dépendance externe.

Les préférences `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false` et `webSecurity: true`, la CSP, le refus des navigations/fenêtres, des téléchargements et des permissions font partie du socle. Le profil de qualification rapporte aussi le sandbox réel du processus renderer. Les recommandations de [sécurité Electron](https://www.electronjs.org/docs/latest/tutorial/security) et le [starter electron-vite](https://electron-vite.org/guide/) sont les références consultées.

## Données locales

Le chemin par défaut est `app.getPath('userData')/madness-state-v1.json`, hors installation et hors projet. `MADNESS_DATA_HOME`, chemin absolu, permet un profil de développement isolé ; le banc le définit avant le démarrage de l’application. Ne pas utiliser le profil personnel pour une qualification.

Le JSON v1 conserve projets, racines canoniques, projet actif, brouillons, préférence et enveloppes de conversations. G0 ne crée aucune conversation fournisseur. À la restauration, une activité ancienne devient historique/inconnue ; aucun moteur ni tour ne démarre. Les identifiants de contexte, de fournisseur et de connexion des conversations restent capturés par le contrat.

Chaque écriture est sérialisée, validée, écrite dans un fichier temporaire adjacent, synchronisée puis remplacée par `rename`. Une erreur laisse le dernier état mémoire durable inchangé et la saisie dans le renderer. L’accusé « enregistré » n’apparaît qu’après réussite de cette opération. Cela ne constitue pas une garantie de résistance à une panne matérielle ou à une coupure secteur. Une préférence échouée s’applique en mémoire et est signalée non sauvegardée.

Un schéma inconnu, une corruption ou un changement externe du fichier connu empêchent son remplacement. Aucun reset, import ou migration automatique n’existe. Limites actuelles : snapshot de 16 Mio, 1 000 projets et 100 000 caractères par brouillon. Préserver une copie des octets existants avant une réparation ; utiliser une version compatible si le schéma est plus récent. Les erreurs affichées et transportées ont des codes fixes, sans texte natif ni secrets.

Un seul processus Madness possède un profil à la fois. Le contrôle de conflit empêche le remplacement d’une modification externe déjà observée avant l’écriture ; il ne remplace pas une coordination avec un éditeur externe écrivant simultanément au même instant. Ne pas éditer manuellement le snapshot pendant son utilisation.

## Qualification et limites

Le banc Windows crée un profil et un projet témoins dans un espace temporaire distinct du dépôt. Il ouvre Electron compilé puis le paquet, passe par le vrai preload, vérifie l’annulation, la validation, les événements, le stockage, la réouverture et la préservation du projet, puis ferme ses enfants et nettoie son seul espace. La réponse de sélection du dialogue OS est contrôlée par le banc ; cela ne prouve pas le parcours humain du sélecteur. Les captures utilisent l’échelle Windows de la machine.

Les résultats expurgés et les captures sont dans `_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-g0/`. Les profils réels sont supprimés ; aucun identifiant ou texte natif fournisseur n’est enregistré. Un échec produit un état partiel et un code fixe. Les tests de nettoyage refusent une racine arbitraire. Le sandbox d’exécution des outils peut refuser `rename` dans son répertoire temporaire virtualisé : exécuter alors les contrôles Windows dans l’environnement local autorisé, sans modifier TLS ni remplacer la stratégie atomique.

Le contrôle de l’installateur sur la machine cible, sa signature, le minimum Windows/proxy, les réseaux des connecteurs, un lecteur d’écran et les trois parcours avec une personne restent distincts. Le banc Codex est indépendant : `node --test scripts/qualification/codex.test.mjs` ne lance pas Codex ; sa qualification réelle n’est jamais déclenchée par les scripts G0.

## Mettre à jour et reconstruire

Choisir explicitement les nouvelles versions, mettre à jour le manifeste et le lockfile, puis refaire types, tests, build, paquet et réouverture sur profil isolé. Conserver le profil hors des binaires et vérifier la reprise avec le nouveau programme avant diffusion. Les previews sont admises ; aucun repli silencieux de version ni patch local de dépendance n’est utilisé. Les avertissements de dépréciation transitifs remontés par npm sont à suivre lors des montées de version.

Le programme et son installateur restent non signés ; l’icône Electron par défaut est conservée en attendant une ressource de marque approuvée. Aucun auto-updater n’est livré. Les licences des ressources embarquées sont dans `resources/THIRD-PARTY-NOTICES.md` et les notices du runtime distribué. Les livrables BMad, les preuves et les fichiers non suivis préexistants ne sont pas inclus dans l’archive applicative.
