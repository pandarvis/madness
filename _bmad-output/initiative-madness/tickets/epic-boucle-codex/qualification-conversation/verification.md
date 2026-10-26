# Vérification de l’implémentation 1.4

Les résultats ci-dessous appartiennent à la phase d’implémentation. La preuve native installée, les revues finales et le commit sont portés séparément par le parent. Aucune fenêtre personnelle, aucun compte et aucun coffre n’ont été modifiés par l’implémenteur.

## Tests et reconstruction

| Contrôle | Résultat observé |
|---|---|
| Première suite complète | 155/155 ; phase historique avant l’enrichissement de la matrice. |
| Suite enrichie | 164/164 ; phase historique avant le correctif d’acquittement/arrêt. |
| Suite finale `npm test` | 165/165, exit 0, 271 043 ms ; sortie exacte dans `tests-final.log`. |
| Ciblés cœur/protocoles | 39/39 après le dernier correctif. |
| `npm run build:win -- --config.directories.output=dist/conversation-pilot` | Types, builds Main/preload/renderer, paquet Windows et installateur réussis, exit 0. |
| `git diff --check` | Exit 0 ; seuls les avis de normalisation LF/CRLF de Git. |
| `node --check scripts/qualification/conversation.mjs` | Exit 0. |
| Détecteur Impeccable unique | Exit 0, JSON `[]` dans `impeccable-detector.json`. |
| Banc compilé final | 10/10, exit 0, nettoyage `true` ; quatre captures de matrice. |
| Banc paquet final (`--packaged --no-captures`) | 10/10, exit 0, nettoyage `true` ; archive `app.asar` SHA-256 `c75733ccaf5b2826500947bbeaf0caca568c0a98b3968545b08f137b08027c8f`. |
| Régressions Windows ciblées | 5/5, exit 0, nettoyage `true` ; sortie dans `windows-regressions.log`. |

Un essai de packaging a rencontré le refus réseau du bac à sable, puis un verrou temporaire d’exécutable. La reconstruction finale autorisée a réussi. Le banc a corrigé deux sélecteurs devenus ambigus après ajout de l’historique Forge synthétique ; chaque essai a nettoyé son profil, sans changement applicatif et sans répétition de la suite finale.

## Matrice exercée

| Cas du plan | Preuves automatisées |
|---|---|
| Réception | `dialogue-protocol.test.mjs` : rafale de 1 200 deltas, réconciliation par item, deux textes identiques conservés, ordre de première observation, terminal réel, item incomplet/incohérent/hors borne refusé. |
| Corrélation | Événements avant réponse RPC puis avant acquittement, étrangers et tardifs ; collisions de réponses RPC et d’appels ; demande réelle transmise à la file de persistance et contexte immuable. |
| Identité | Source JSON structurée du resolver, identité inconnue au début de l’item, ancienne identité figée, absence de réattribution des tours suivants et historique restauré inconnu ; Forge préservé. |
| Défaillance | Partiel gardé après coupure ; disque refusé sans faux durable ; arrêt pendant lot en écriture et sauvegarde de brouillon admise ; arrêt pendant écriture finale ; arrêt pendant acquittement sans réannonce `running`. |
| Réouverture | Snapshot v1 strictement `id/role/text`, textes identiques distincts, brouillon exact, annexe Forge exacte, état du tour et identité inconnus, aucun moteur ni réseau. |
| Interaction | Même article DOM, saisie/focus préservés, lecture remontée et retour d’onglet ancrés, suivi du bas conditionnel, annonces limitées aux transitions, aucune réponse induite. |

Les rapports `compiled-profile.json` et `packaged-profile.json` portent leurs propres dates, empreintes d’artefact, liste de contrôles, limites et nettoyage. Les événements injectés sont synthétiques ; la persistance du cœur source est exercée séparément pendant que l’application est fermée. Ces rapports ne remplacent jamais la preuve native.

## Inspection visuelle groupée

Une seule lecture groupée des quatre captures compilées : `compiled-compact.png` (identité inconnue et brouillon focalisé), `compiled-progress.png` (progression et source attestée), `compiled-desktop.png` (partiel et conservation non confirmée), `compiled-forge-history.png` (historique et résultat observé distinct de l’acceptation humaine).

Les textes et états sont lisibles, les sources restent près de leur message, les palettes et commandes existantes sont conservées, sans débordement horizontal observé. Aucun ajustement visuel n’a été requis à cette passe. Ce contrôle ne constitue ni acceptation visuelle humaine ni audit complet d’accessibilité.

Les références natives déjà conservées dans les observations Forge historiques ne sont pas des identifiants de routage des nouvelles projections. Leur annexe est laissée intacte conformément au plan ; aucune migration n’est effectuée.

## Revue Quick et contrôles postérieurs

Trois constats vérifiés et corrigés dans le même adaptateur : notifications admises drainées avant erreur/annulation, commencement vide projeté pour réserver l’ordre et figer l’identité, coalescence sans limite métier prématurée sur un contexte étranger. Huit régressions reproduites en RED puis corrigées, 26 tests ciblés protocole/Forge réussis.

La première suite post-revue est conservée dans `tests-after-review.log` :172/173, expiration sur le test clavier/thème de fenêtre compacte. Le même test isolé passe sans modification (1/1, `theme-keyboard-recheck.log`). Le setup et son focus de navigation différé sont examinés avant la nouvelle suite ; aucune réussite globale n’est déduite de ce seul recheck.

Le porteur confirme que le JSON public OpenAI s’affiche dans Edge. L’essai natif sera repris sur le paquet corrigé ; cette observation humaine ne constitue pas à elle seule une réponse Codex réussie.

La course de focus du setup a été reproduite : callback de navigation différé reprenant le focus avant Entrée. Le test attend désormais le focus réel du titre puis vérifie celui du bouton ; aucun délai ni changement produit. Ciblé1/1 réussi, puis suite complète finale **173/173**, exit 0,233 520 ms, `tests-confirmed.log`. Les trois corrections Quick sont donc couvertes par huit régressions nouvelles et la suite entière.

## Paquet corrigé et contrôles de surface

Build Windows post-revue réussi (types,Main,preload,renderer,NSIS), `build-after-review.log`. Archive finale `3f7186d6122e412bafbbb5c5027b4c9d5daee756442ecc49e36d92b631f0c97b`, installateur `59d037952807255b172eff2de7dea771253ccdc67f4fb89116baa011ef443168`. Banc compilé10/10 et paquet 10/10, puis Windows 5/5, tous exit 0 avec nettoyage true ; logs `*-after-review.log`. Rapports précédents conservés sous `*-before-review.json`.

Les quatre fichiers du renderer sont byte-identiques avant/après les corrections de l’adaptateur (`renderer-continuity.json`). Les quatre captures relues par Impeccable restent donc représentatives sans nouvelle passe de captures, détecteur ni chasse visuelle. Le rapport `impeccable-finish.md` conserve le verdict limité1.4 et l’absence d’acceptation visuelle globale.

Paquet final installé sans fenêtre Madness ouverte : archive et runner identiques au paquet qualifié ; Snapshot,apparence,coffre chiffré et annexes Forge byte-identiques avant/après. L’essai natif final est repris séparément.

## Résultat natif final

Installation finale préservée byte pour byte avant/après. GET public OpenAI200 et POST refresh200 observés ; trois tours distincts sur un seul processus Codex,800 deltas,quatre items assistant. Premier tour : article visible en état running confirmé par une deuxième lecture avant terminal, identité initiale inconnue puis Mary attestée sur le nouvel item, deux textes complets conservés et brouillon non envoyé. Les suivis 2/3 terminent et sont conservés, mais la mesure préterminale n’est pas capturée ; deux assertions du banc échouent sur ce point supplémentaire et restent documentées dans live-profile.json. Aucun replay ni faux échantillon ; aucune cause réseau de buffering déduite. Le critère natif du plan est démontré par le premier tour ; les suivis ne sont pas présentés comme pleinement mesurés.

Arrêt natif confirmé puis réouverture : projets,historique,brouillons et annexes Forge identiques ; identité et tour inconnus, zéro processus moteur/zéro requête réseau observés au redémarrage. Les brouillons antérieurs sont préservés, à l’exception du seul brouillon synthétique explicitement possédé du témoin. Sélection/navigation restituées à celles du début de l’essai final ; les essais précédents avaient déjà sélectionné le témoin. Le binaire retrouvé après arrêt par le même resolver a le SHA2564b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7 ; cette relecture n’est pas présentée comme une nouvelle mesure pendant le processus.

Revue Quick : trois constats corrigés,aucun correctif du lot différé. Impeccable : ship limité1.4, aucun material_fix ; rôles spécialisés non exposés, définitions officielles appliquées par agents techniques frais. Le seul travail futur consigné est le passage UX demandé par le porteur aprèsepic1avant2 ; aucune acceptation visuelle humaine ni clôture des gates.

La transcription native conserve ses doubles espaces Markdown de saut de ligne. Une règle .gitattributes limitée à ce seul fichier préserve ces octets ; aucun contrôle de whitespace du code ou des autres preuves n’est désactivé.
