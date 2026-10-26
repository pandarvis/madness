# Profil local livré — spike 1.12

Qualification du 26 octobre 2026, réalisée avec BMad Build. **La base locale vérifiée permet de commencer la réalisation de 1.3. Le pilote actuel ne permet pas encore d'invoquer un workflow documentaire complet.** Cette conclusion ne modifie pas le statut des autres tickets et ne clôt ni G0/G1 ni les conditions de distribution.

Le [profil JSON](profile.json) distingue contrôles frais, preuves historiques et capacités absentes. La commande [verify.mjs](verify.mjs) recontrôle les fichiers et outils identifiés, en lecture seule, et refuse un profil périmé ou une portée inattendue.

## Identités du code et des livraisons

La révision de départ est `31c309e79a92419be712a11a4190c5387818f072`. Le digest des 50 entrées de construction est `65dac4939d8e8fc0b0e11e9a2f0ecb420e3819f1a48df63c206ba3b14eb173ce`, selon l'algorithme `sha256-path-and-bytes` du banc Windows. Ce digest n'est pas un identifiant Git. Les 78 fichiers inventoriés comprennent aussi preuves, ressources BMad, manifestes natifs et artefacts ; le hash de l'arbre Python est distinct.

| Objet | Observation et portée |
|---|---|
| Code courant | Sources, contrats et configuration de construction hachés ; types et tests ciblés frais. Aucun changement du produit dans ce spike. |
| Paquet préparé sans « M » | `dist/navigation-cleanup/` : archive `16f895da48b105ea3a67608649fca1e762f59d3123ffc8f61a4bc2ed64f43267`, installateur `1f2231cc8efed642b9ea27a48b21de3b768676bbfa6c140e9644f3cffc42dc68`. Empreintes conformes à la preuve précédente, cinq contrôles UI frais sur profil jetable. Son installation personnelle n'est pas prouvée. |
| Livraison sombre historiquement installée | `dist/terracotta-pilot/` : archive `5c805e2d2fc465d11b01dca14fb58e39b5d83d0ee2df5de6becb3cda04c00aa4`, installateur `8e74a71679cc4ec45dc2d953af3ba12ff23ddbc1314727676530e687d575c68f`. Empreintes toujours conformes ; installation et réouverture prouvées le 24 octobre pour cette archive. |
| Installation personnelle actuelle | Emplacement non identifié par l'inspection ciblée des emplacements standard, registre utilisateur et processus. Aucun installateur lancé, profil personnel ouvert ou fichier secret lu. Cela ne prouve pas une désinstallation et ne constitue pas une vérification fraîche de l'application installée. |

Les paquets portent tous encore `0.1.0` ; cette version seule ne les distingue pas. Un digest de source et une empreinte ASAR ne sont pas interchangeables ; la qualification ne prétend pas une équivalence binaire exhaustive entre TypeScript et bundle.

## Prérequis contrôlés fraîchement

- **Mary et configuration** : les huit fichiers épinglés, les couches admises et les refus de surcharges sont contrôlés par le qualificateur existant. Empreinte globale `170d70ddf8c43ce1549b86ae79616ef1d474664eb1514694379e260dc4161f0e`. Les vrais resolvers renvoient Mary, `{project-root}/_bmad-output` et `initiative-madness`. Cela qualifie cette référence, pas tout BMad v7 ni le catalogue.
- **Python/UV externes** : correspondent aux empreintes attendues par le produit. Python `3.12.14` et UV `0.13.0` sont les labels de version historiques, liés aux empreintes fraîches ; aucun `--version` supplémentaire n'a été exécuté. Arbre Python `0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92`, avec exclusions `site-packages`, `__pycache__`, `test`, `tests`. Ils ne sont pas embarqués dans Madness.
- **Codex non exécuté** : le manifeste du wrapper déclare `0.144.6` et sa dépendance npm native désigne `0.144.6-win32-x64`, conforme au manifeste natif. Le suffixe identifie la plateforme ; ce n'est pas une nouvelle version du protocole. Implantation autorisée, en-tête PE et SHA-256 du binaire sont contrôlés. L'identité de ses octets avec le binaire du tour historique n'est pas démontrée ; version exécutée, réseau et protocole actuels restent à vérifier en 1.3.
- **Socle** : vérification TypeScript réussie ; 24 tests ciblés réussis sur contrats, frontière, UTF-8, persistance, lifecycle, apparence, runtime et profil BMad ; cinq régressions Windows ciblées réussies sur le paquet préparé. Ces cinq contrôles ne constituent pas une nouvelle exécution de toute la suite G0 historique. Trois tests du vérificateur confirment le refus d'empreinte modifiée, de chemin hors portée et de traversée interne avant lecture. Les espaces témoins sont nettoyés.

## Preuves historiques conservées

Le profil référence les rapports originaux sans les réécrire. La connexion SIWC du 24 octobre prouve un OAuth signé et un tour natif terminé avec arrêt confirmé, dans son archive `6c8c7867d1832e1be633751ce402ec7bade5a7eab2ab9f969887a6ca0dd3f121`. La preuve Mary porte sur l'archive `2559a72778a4a26547e1e897384f872f0cddd1887fd4d3d865d49a0ac1bc980e` : trois messages, trois réponses, arrêt et historique/brouillon identiques après réouverture sans moteur. Son contexte avait `initiativeId: null` ; aucune sélection multi-initiative n'en découle.

Les versions Electron `45.0.0`, Chromium `156.0.8078.48` et Node enfant `24.22.0`, ainsi que les contrôles G0 étendus, proviennent de la preuve historique G0. Elles ne sont pas présentées comme des mesures fraîches de tous les environnements. L'essai d'authentification gérée par Codex de 1.1 reste une autre voie, avec son résultat inconnu et ses réserves de nettoyage ; il n'est pas remplacé par SIWC.

## Conditions d'usage et suite de 1.3

La [documentation SIWC](https://developers.openai.com/siwc/token-sharing-open-source), [sa configuration app-server](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) et [ses limites preview](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) ont été relues le 26 octobre. La portée documentaire locale est compatible avec l'essai personnel décrit ; cette conclusion ne tranche pas la distribution gratuite fermée. Les observations et limites sont consignées dans [sources-officielles.md](sources-officielles.md).

Avant tout lancement réel de 1.3 :

1. Identifier un workflow réellement installé et vérifier son parcours intégral, son contexte, ses outils et ses effets. Le transport actuel impose lecture seule, whitelist Mary et refus des écritures/workflows documentaires : leur prise en charge reste à construire et vérifier dans 1.3.
2. Si le workflow exige les interactions prévues en 1.5–1.7, choisir une autre référence compatible ou réexaminer le découpage ; ne pas supprimer ses conditions natives pour obtenir un succès.
3. Recontrôler profil, outils et paquet réellement installé ; vérifier explicitement compte, permission forfait, environnement et réseau/certificats du processus utilisé. Aucune disponibilité du compte ni accessibilité réseau actuelle n'est acquise par ce spike.
4. Capturer le bon projet et l'initiative requise ; observer ensuite livrable, chemins, effets, accusés, arrêt et restauration sur un dossier d'essai dédié. Aucun succès ne vient du seul retour de texte final.

Minima Windows, proxy généralisable, désinstallation/maintenance complète, distribution, G1 complet, G2–G5, anglais, acceptation visuelle et audit d'accessibilité restent ouverts dans leurs portées respectives. La commande échoue si une empreinte change ; cela impose une requalification, sans correction silencieuse du produit.

## Reproduire les contrôles

Depuis `C:/Sources/madness`, avec les prérequis identifiés dans le profil :

```powershell
node _bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-profil-local/verify.mjs
npm run typecheck
node --test tests/foundation.test.mjs tests/lifecycle.test.mjs tests/json-store-utf8.test.mjs tests/appearance.test.mjs tests/dialogue-profile.test.mjs tests/dialogue-runtime.test.mjs
node scripts/qualification/windows.mjs --ui-regressions-only --skip-screenshots --executable=C:/Sources/madness/dist/navigation-cleanup/win-unpacked/Madness.exe
```

Le vérificateur ne lance aucun programme enfant. Les tests de profil utilisent Python/UV épinglés et des dossiers jetables ; le banc Windows ouvre uniquement son paquet témoin sans compte. Aucun Codex, OAuth, refresh, modèle, coffre personnel, capture ou rapport historique n'est exécuté, lu ou remplacé par ces contrôles.
