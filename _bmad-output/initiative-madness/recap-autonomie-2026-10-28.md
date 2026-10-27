# Récapitulatif du travail autonome — 28 octobre2026

**Madness 0.1.1 est installé, avec données et compte conservés. La 1.9 est terminée, la réserve technique1.2 est levée. L’epic 1 reste ouvert à cause de 1.1 ; ses deux dernières entrées ne sont pas exécutées.**

## Ce qui a été terminé

- **1.9 — Maintenance :** procédure de reconstruction/republication, manifeste des versions et empreintes, client Codex aligné sur la version de l’application, comparaison réelle0.1.0 → 0.1.1 et refus des états de stockage incompatibles. Electron 45 et Chromium 156 restent inchangés ; builder 26.18.0 et jose 6.2.13 sont adoptés explicitement.
- **Installation réelle :** installateur NSIS réussi au même chemin. Douze fichiers synthétiques et leurs projections identiques entre A/B ; vingt-sept entrées personnelles inchangées, compte lisible et MIA/madness seuls dans les récents. Les fenêtres de contrôle et espaces d’essai sont fermés/nettoyés ; aucun nouveau témoin personnel ajouté.
- **1.2 — Socle cible :** Sofia rapproche les nouvelles preuves d’installation/remplacement/réseau et documente minimum amont et configuration effectivement testée. Relecture fraîche favorable pour Windows 11 Entreprise 25H2 x64, build 26200.9711 ; aucune plage Windows élargie ou politique d’entreprise inventée. Le corps historique du plan reste exact, seul son statut est réconcilié.

La suite finale passe **300/300**, sans échec ni test ignoré. Types/build/paquet et contrôles Windows sont conservés ; les trois corrections de revue1.9 sont résolues et recontrôlées. Un premier run299/300 garde son erreur Windows de réécriture d’un faux exécutable ; l’isolé puis la confirmation complète passent sans modification produit. Les échecs ne sont pas effacés des preuves.

GET public depuis Main : HTTP200, sans nouvelle action Zscaler. Aucun nouveau consentement, token demandé ou modèle externe dans ces lots. Le loopback natif et ce GET restent deux preuves distinctes ; aucune connectivité externe fraîche du runner déduite.

Commits locaux, sans push :

- `25d54a10f6981c57e95453214d43164565d28768` — maintenance1.9.
- `0a9fac5ecbb5b26b208c2f59dc010a6513739c22` — réconciliation1.2 sur le poste cible.

## État exact de l’epic 1

| Entrées | État |
|---|---|
| 1.2, 1.12, 1.3–1.9 | Built : réalisation et vérifications techniques disponibles ; cela ne fabrique pas une acceptation humaine globale. |
| 1.1 — voie Codex distribuable | Toujours bloquée : admissibilité officielle du nouveau client privé distribué non établie et ancien essai natif authentifié sans conclusion positive d’arrêt/nettoyage. |
| 1.10 — Refactor sweep | Attend1.1. La réserve historique du test d’arrêt reste pour cette entrée. |
| 1.11 — E2E etG1 | Attend1.10 puis son parcours intégré réel. Non exécutée. |

Le tableau BMad ne présente plus d’entrée prête. Je n’ai ni supprimé les dépendances approuvées ni déclaré l’epic clos par le seul succès des tests. La connexion personnelle actuelle fonctionne dans son périmètre acquis ; cela ne suffit pas à qualifier sa distribution à d’autres développeurs avec code privé.

Pour débloquer1.1, il reste à établir une voie officiellement applicable à ce produit privé distribué puis obtenir la preuve native exigée, ou faire arbitrer explicitement son découpage. Aucun changement de fournisseur, de facturation, de licence ou de périmètre n’est décidé à ta place. Aucun contact externe envoyé. Il ne s’agit pas de te redemander le JSON public ni un token.

## Travail UX effectué en attendant

Sally réellement activée et trois experts techniques indépendants — visuel, guidage, accessibilité — ont examiné cinq captures de l’application réelle0.1.1 sur données synthétiques, avec les références Impeccable. Leur préparation est consolidée dans [le dossier de refonte](ux-madness/preparation-refonte-2026-10-28/preparation-refonte.md).

Ils convergent : les blocs d’état et de récupération repoussent projet, onglets et conversation sous le premier écran. La prochaine refonte doit donc réorganiser la hiérarchie, donner la priorité à l’échange dans Conversation, rendre l’ouverture compacte et aligner la bascule, tout en conservant cibles utilisables et décisions explicites. Palette terracotta/bleu conservée.

**Cette préparation n’est pas une refonte installée**, un verdict Impeccable ship ou un audit WCAG. Aucun contrat UX adopté ni code renderer modifié. L’implémentation de la refonte reste à faire dans l’ordre retenu après les prérequis de l’epic 1.

## Cap à conserver

L’objectif reste un orchestrateur BMad visible et compréhensible. Aujourd’hui, le pilote intégré couvre les échanges Mary/Forge et leurs interactions qualifiées ; le guidage complet, l’aide contextualisée, le catalogue, les documents et le temps/coût par US restent dans l’epic 2. L’initialisation est dans l’epic 3 ; Graphify est dans l’epic 4. L’étude Loop/Builder est terminée, mais Loop n’est pas installé ou intégré.

Le travail, les limites et les prochaines entrées sont sauvegardés. Tu peux redémarrer ou mettre à jour l’application desktop sans perdre ces livrables locaux.

Preuves principales : [maintenance1.9](tickets/epic-boucle-codex/qualification-maintenance/parent-verification.md), [complément1.2](tickets/epic-boucle-codex/qualification-g0/complement-compatibilite-2026-10-28.md), [tableau après réconciliation](tickets/epic-boucle-codex/qualification-g0/board-after-compatibility.json).
