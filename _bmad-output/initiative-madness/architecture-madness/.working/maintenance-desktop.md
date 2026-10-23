# Maintenance du socle desktop — 23 octobre 2026

## Besoin confirmé

Le porteur veut des technologies récentes, une montée de version des dépendances et d'Electron peu contraignante, puis une reconstruction et une republication simples. Le proxy accepte une version au-dessus d'un minimum ; il n'exige pas exactement la dernière publication de Chrome. Electron est maintenu comme choix. Le minimum précis et le passage effectif des connexions restent à vérifier sur la machine cible.

Cette précision ne demande pas une mise à jour automatique côté utilisateur pour la V1. Le comportement d'un futur updater et son hébergement restent à décider si cette fonctionnalité est demandée. Le porteur précise ensuite qu'il s'agit d'un projet personnel utilisé dans un environnement professionnel et autorise les versions preview ou en avance de phase : aucune politique imposant uniquement des versions stables n'est retenue.

## Référence DIA, lue sans modification

Fichiers consultés : `C:/Sources/DIA/apps/desktop/package.json`, `C:/Sources/DIA/apps/desktop/electron-builder.yml` et `C:/Sources/DIA/apps/web/package.json`.

- Déclarations du desktop : Electron `^44`, `electron-builder` `^26.15.3` ; sortie ZIP Windows x64.
- Déclarations du frontend : Angular `^21.2.18`, CLI/build `^21.2.19`, TypeScript `~5.9.2` et Transloco `^8.4.0`.
- Ces valeurs sont des plages déclarées, pas les versions résolues constatées dans une application en cours d'exécution.
- Le porteur confirme l'absence actuelle d'un updater. Aucun appel n'est repéré dans les sources desktop et scripts parcourus, sans audit exhaustif du dépôt.

Cette référence confirme l'expérience du porteur avec Electron dans son environnement ; elle ne constitue pas une preuve du réseau de futurs connecteurs Madness. Aucun fichier DIA n'est copié ni modifié.

## Versions et couplages

Le [blog officiel Electron](https://www.electronjs.org/blog) annonce Electron 45 avec Chromium `156.0.8078.48` et Node `24.22.0`. Le [rythme de publication](https://www.electronjs.org/docs/latest/tutorial/electron-timelines) est propre à Electron ; Chromium embarqué évolue avec le runtime, indépendamment du choix Forge ou electron-builder. La version à initialiser sera revérifiée et fixée dans le lockfile ; elle ne doit pas devenir une contrainte permanente interdisant les montées de version.

Le template [Forge Webpack + TypeScript](https://www.electronforge.io/templates/typescript-+-webpack-template) et son [guide React](https://www.electronforge.io/guides/framework-integration/react-with-typescript) sont une première voie proposée. Le guide React a été testé avec d'anciennes versions ; il ne prouve pas l'assemblage actuel. Le [plugin Vite de Forge](https://www.electronforge.io/templates/vite-+-typescript) reste indiqué comme expérimental.

Le porteur adopte ensuite [electron-vite](https://electron-vite.org/guide/) avec React + TypeScript et electron-builder. La configuration regroupe main, preload et renderer ; la [documentation de distribution](https://electron-vite.org/guide/distribution) décrit le packaging. Ce projet distinct ne doit pas être confondu avec le plugin Vite de Forge. Sa documentation affiche encore `5.0.0`, alors que le registre npm retourne `6.0.0`. La [documentation electron-builder](https://www.electron.build/) distingue la stable 26 et la next 27 ; les previews sont autorisées par le porteur et seront choisies au cas par cas, avec version et vérification explicites.

Le [relevé du registre](versions-registre.json) constate Electron 45.0.0, electron-vite 6.0.0, electron-builder 26.15.3, TypeScript 7.0.2, React/react-dom 19.3.1, Vite 8.3.5 et create-electron 1.0.31. Les [fichiers actuels du starter](starter-verifie.json), consultés via GitHub avec leurs SHA, utilisent encore des plages Electron 44 et TypeScript 5.9. Ils ne prouvent pas qu'une simple copie installe le dernier assemblage. L'actualisation et la vérification des types, du build et du paquet Windows constituent G0.

## Direction de maintenance proposée

Isoler les dépendances Electron et fournisseurs derrière leurs adaptateurs, limiter les plugins et modifications du starter, conserver un lockfile reproductible et documenter les commandes de contrôle et de packaging. Prévoir une vérification de remplacement du programme qui conserve les données utilisateur hors du dossier installé. Le stockage et ses migrations ne doivent pas être couplés au remplacement des binaires.

Le [réseau Electron](https://www.electronjs.org/docs/latest/api/net) peut utiliser la pile Chromium et les paramètres de proxy système ; les processus Codex, Claude Code ou Copilot possèdent leur propre environnement réseau. Leur accès et leurs certificats ne sont pas prouvés par le seul fonctionnement de la fenêtre Electron.
