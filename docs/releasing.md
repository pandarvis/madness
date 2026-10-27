# Reconstruire et remplacer Madness

Procédure Windows x64 pour la livraison 0.1.1 du 27 octobre 2026. Les données restent dans `app.getPath('userData')`, hors binaires. Garder `name: madness`, `appId: fr.madness.desktop`, `productName: Madness`, l’exécutable `Madness.exe` et `deleteAppDataOnUninstall: false`. Une nouvelle identité peut diriger le programme vers un autre profil.

## Préparer une livraison

Conserver le paquet A qualifié, son installateur et ses empreintes. Pour 1.9, A est `dist/overview-pilot/`, version 0.1.0, ASAR `072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1`.

Examiner `npm outdated` puis `npm view <paquet>@<version> version engines`. Modifier explicitement la version de l’application et les seules dépendances retenues. Régénérer le lock avec `npm install --package-lock-only --ignore-scripts`, puis installer proprement. Ne pas lancer deux installations npm simultanées. Conserver les échecs séparément des relances.

```powershell
npm ci
node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs
npm run build:win -- --config.directories.output=dist/maintenance-pilot
node scripts/release/manifest.mjs --directory=dist/maintenance-pilot
node scripts/qualification/windows.mjs --ui-regressions-only --executable=C:/Sources/madness/dist/maintenance-pilot/win-unpacked/Madness.exe
node scripts/qualification/overview-native.mjs --output=_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-maintenance
```

0.1.1 adopte `electron-builder` 26.18.0 et `jose` 6.2.13. Electron reste 45.0.0 ; les rapports relèvent Electron et Chromium. Ce lot ne constitue pas une montée Chromium. Relever aussi `node --version` et `npm --version`.

Le manifeste vérifie les versions exactes du manifeste racine, du lock et du manifeste embarqué, puis calcule les SHA-256 des sources, configurations, ressources, installateur et ASAR. Il refuse une identité ou un lock incohérent. Il ne contient ni environnement, ni secret, ni date de génération variable. Deux invocations sur les mêmes entrées produisent le même JSON. Une reconstruction NSIS peut porter d’autres horodatages : conserver son nouveau manifeste puis qualifier cet artefact exact.

## Conservation A → B sur un profil synthétique

Le banc permanent a deux phases pour laisser le parent remplacer le même programme entre elles. Les conversations, questions, accords, annexe Forge et propriétaire incertain sont des fixtures identifiées, validées avant A. Sous A, les ponts réels ouvrent les projets et enregistrent les brouillons, la navigation et le snapshot complet contenant messages et rattachements. Le banc écrit dans Main un compte inventé chiffré avec `safeStorage`, ferme puis rouvre A. Aucun fournisseur n’est lancé.

```powershell
# A doit être le programme 0.1.0 ; conserver le workspace imprimé.
node scripts/qualification/maintenance.mjs --phase=a --executable=C:/Sources/madness/dist/overview-pilot/win-unpacked/Madness.exe --label=unpacked-a
# Reporter exactement le workspace imprimé par A.
node scripts/qualification/maintenance.mjs --phase=b --workspace=<workspace-A> --executable=C:/Sources/madness/dist/maintenance-pilot/win-unpacked/Madness.exe --label=unpacked-b
node scripts/qualification/maintenance.mjs --phase=save-failure --executable=C:/Sources/madness/dist/maintenance-pilot/win-unpacked/Madness.exe
```

Ces commandes qualifient les paquets unpacked. Pour le vrai remplacement NSIS : exécuter A avec le chemin de l’exécutable **déjà installé**, vérifier sa fermeture, exécuter l’installateur B sur cette même installation, puis lancer B avec **le même chemin installé** et le workspace A. Les clés NSIS sont communes : `/D` seul ne crée pas une installation indépendante. Le parent seul assure cette opération, son reçu d’installation et les contrôles personnels.

Le workspace se trouve seulement sous le répertoire temporaire, avec marqueur de possession, chemins fixes et refus des liens symboliques, y compris les intermédiaires Chromium et coffre. A réussi le conserve pour B. B réussi le retire, sauf `--keep`. Avant tout lancement, A exige son ASAR qualifié et B exige l’ASAR et le runner Python externe du manifeste `dist/maintenance-pilot/release-manifest.json` ; `--manifest=<chemin>` sélectionne une autre copie qualifiée. Le runtime Electron réellement démarré doit aussi égaler la version attendue ; un écart ferme le processus. Un rejet d’artefact avant lancement laisse le profil intact. Les autres échecs ferment le processus et nettoient son seul workspace, sauf `--keep` pour investigation ; un arrêt non confirmé empêche le nettoyage. Une création interrompue nettoie sa seule racine fraîchement possédée sans exiger un espace déjà complet. Après investigation :

```powershell
node scripts/qualification/maintenance.mjs --phase=cleanup --workspace=<workspace-A>
```

Le reçu A fige snapshot, apparence, annexes, coffre synthétique, inscription, `chromium/Local State`, journal, HTML et fichier de projet. B compare ces empreintes avant démarrage, avant navigation et après fermeture, puis le même contexte, les versions 0.1.0/0.1.1 et deux ASAR distincts. Questions et accords restent inactifs, l’effet reste inconnu, le propriétaire incertain continue de bloquer. Le compte demeure lisible sans refresh, consentement ni nouvelle vérification du forfait. Les captures sont seulement synthétiques.

## Remplacer l’installation personnelle

Fermer le programme et vérifier sa fermeture. Relever les empreintes des fichiers métier, annexes, inscription, coffre chiffré et `Local State` dans leur emplacement normal. Ne pas copier le coffre, créer de témoin personnel ou imposer `MADNESS_DATA_HOME` à ce profil : cette variable change aussi `sessionData` et le répertoire Chromium.

Exécuter l’installateur qualifié sans désinstaller ni effacer AppData. Vérifier code de sortie, version embarquée et ASAR installé contre le manifeste B. Relire les empreintes, ouvrir normalement le programme avec son environnement habituel et vérifier la lecture du compte et des données sans moteur ni nouvelle connexion. Fermer la fenêtre de contrôle puis relever les empreintes finales. Une erreur de coffre exige une investigation de l’environnement et de `Local State`, sans reset ni nouvelle connexion automatique.

## Échec, compatibilité et réseau

Le format métier reste v1 ; aucune migration n’est nécessaire. Les tests positifs restaurent v1 ; futur, corruption et UTF-8 invalide refusent lecture/écriture sans remplacer les octets. Un refus ne prouve pas une migration. L’apparence garde le choix en mémoire avec avertissement si son fichier est illisible ou non inscriptible ; elle ne promet pas de CAS contre une modification externe valide.

`save-failure` ouvre un vrai handle Windows sans partage suppression. Le remplacement atomique échoue : octets/révision identiques, saisie visible « Modification non enregistrée », temporaire retiré. Libérer le handle ne relance rien ; seul un nouveau clic Enregistrer produit l’accusé durable. Le test exerce aussi ce refus dans le vrai cœur. Si le sandbox refuse même `rename` sans verrou, conserver cet échec environnemental et refaire le contrôle hôte autorisé ; ne pas modifier le produit pour contourner l’atomicité.

Le GET public Main se contrôle séparément par « Vérifier l’accès » sur `https://auth.openai.com/.well-known/jwks.json`, sans refresh, modèle ou rejeu. Un 307 est rapporté comme résultat ; l’acquittement Zscaler acquis ne prouve ni portée ni durée. Ne demander un clic que si une nouvelle mesure le rend nécessaire, sans redemander si la page est un JSON.

Le runner Codex reste 0.144.6, avec empreinte contrôlée séparément et Responses en loopback. Son `clientInfo.version` provient du manifeste applicatif commun. `probeEnvironment` transmet les seules variables proxy/certificats autorisées au child et exclut profils/secrets hérités ; le réseau Electron ne s’applique pas implicitement au processus. Le loopback ne prouve aucune connectivité externe fraîche. Les compteurs A/B commencent après démarrage, portée explicitée dans les reçus.

La republication est la remise manuelle du programme et de son manifeste après qualification et décision de distribution. Cette story ne publie ni ne signe, n’ajoute pas d’updater et ne ferme pas les gates 1.1/1.2/1.10/1.11. R32, Loop, Graphify et refonte globale gardent leurs périmètres.

## Sources primaires consultées le 27 octobre 2026

- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) : installation figée, refus d’un lock incohérent.
- [Registre electron-builder 26.18.0](https://registry.npmjs.org/electron-builder/26.18.0) et [NSIS officiel](https://www.electron.build/nsis/) : version candidate et configuration. Aucun contenu n’est déduit de la page GitHub v26.18.0 qui retourne 404 à la consultation.
- [Electron Releases stable](https://releases.electronjs.org/release?channel=stable) : Electron 45.0.0 / Chromium 156.0.8078.48 ; les mesures effectives restent dans les reçus.
- [JOSE 6.2.13](https://github.com/panva/jose/releases/tag/v6.2.13) : terminologie et causes d’erreur conservées ; Madness continue de projeter ses codes expurgés.
