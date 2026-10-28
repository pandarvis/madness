# Récapitulatif du travail autonome — 28 octobre2026

**Madness 0.1.1 est installé, avec données et compte conservés. La1.9 et le nettoyage1.10 sont terminés, la réserve technique1.2 est levée. Après la clarification du porteur le28octobre, le besoin est personnel et local avec son abonnement ChatGPT : la qualification de distribution1.1 sort du périmètre. La dernière entrée technique1.11 reste à exécuter avant la clôture intégrée de l’epic.**

Ce récapitulatif est actualisé par la [décision personnelle locale](decision-personnelle-locale-2026-10-28.md). Le cadrage antérieur de distribution, qui avait motivé le blocage annoncé, ne s’applique plus. La connexion SIWC déjà livrée est conservée ; aucune publication du code, demande d’admission ou bascule de facturation n’est nécessaire au périmètre personnel retenu.

## Ce qui a été terminé

- **1.9 — Maintenance :** procédure de reconstruction/republication, manifeste des versions et empreintes, client Codex aligné sur la version de l’application, comparaison réelle0.1.0 → 0.1.1 et refus des états de stockage incompatibles. Electron 45 et Chromium 156 restent inchangés ; builder 26.18.0 et jose 6.2.13 sont adoptés explicitement.
- **Installation réelle :** installateur NSIS réussi au même chemin. Douze fichiers synthétiques et leurs projections identiques entre A/B ; vingt-sept entrées personnelles inchangées, compte lisible et MIA/madness seuls dans les récents. Les fenêtres de contrôle et espaces d’essai sont fermés/nettoyés ; aucun nouveau témoin personnel ajouté.
- **1.2 — Socle cible :** Sofia rapproche les nouvelles preuves d’installation/remplacement/réseau et documente minimum amont et configuration effectivement testée. Relecture fraîche favorable pour Windows 11 Entreprise 25H2 x64, build 26200.9711 ; aucune plage Windows élargie ou politique d’entreprise inventée. Le corps historique du plan reste exact, seul son statut est réconcilié.
- **1.10 — Nettoyage :** seul point encore ouvert, l’assertion d’arrêt de1.6 reconnaît désormais une fermeture par signal. Cas synthétique déterministe, observation de close/flux et nettoyage de l’enfant. Revue Quick : un constat sur le budget du test corrigé et recontrôlé résolu, aucun correctif différé. Suite301/301 et9/9ciblés après le dernier ajustement ; types réussis, aucun changement produit ni nouvelle installation. [Preuves1.10](tickets/epic-boucle-codex/qualification-sweep/parent-verification.md).

La suite finale passe **300/300**, sans échec ni test ignoré. Types/build/paquet et contrôles Windows sont conservés ; les trois corrections de revue1.9 sont résolues et recontrôlées. Un premier run299/300 garde son erreur Windows de réécriture d’un faux exécutable ; l’isolé puis la confirmation complète passent sans modification produit. Les échecs ne sont pas effacés des preuves.

GET public depuis Main : HTTP200, sans nouvelle action Zscaler. Aucun nouveau consentement, token demandé ou modèle externe dans ces lots. Le loopback natif et ce GET restent deux preuves distinctes ; aucune connectivité externe fraîche du runner déduite.

Commits locaux, sans push :

- `25d54a10f6981c57e95453214d43164565d28768` — maintenance1.9.
- `0a9fac5ecbb5b26b208c2f59dc010a6513739c22` — réconciliation1.2 sur le poste cible.

## État exact de l’epic 1

| Entrées | État |
|---|---|
| 1.2, 1.12, 1.3–1.9 | Built : réalisation et vérifications techniques disponibles ; cela ne fabrique pas une acceptation humaine globale. |
| 1.1 — voie Codex distribuable | Abandonnée comme hors du besoin personnel actuel. Ancien essai et issue inconnue conservés ; aucune réussite technique inventée. |
| 1.10 — Refactor sweep | Built : unique réserve de nettoyage résolue, aucun changement fonctionnel. |
| 1.11 — E2E etG1 | Prochaine entrée après1.10, parcours intégré réel encore non exécuté. |

Sofia a appliqué le changement explicite de périmètre aux exigences et dépendances ; relecture fraîche Ticket/Set/Tree/Dependencies conforme, sans constat, couverture32/32 et status/next réussis. La1.10 est maintenant built ; le travail restant porte sur les vérifications intégrées1.11 de la voie personnelle : fonctionnement réel, arrêt, restauration et conservation des données. Aucun contact externe, nouvelle authentification ou échange de token n’est demandé pour cette correction de cadrage. L’epic n’est pas déclaré clos par le seul succès des tests précédents. Le [reçu historique du replan personnel](.working/sofia-personnel-local-validation.json) conserve l’état avant ce Build et les treize empreintes inchangées.

## Travail UX effectué en attendant

Sally réellement activée et trois experts techniques indépendants — visuel, guidage, accessibilité — ont examiné cinq captures de l’application réelle0.1.1 sur données synthétiques, avec les références Impeccable. Leur préparation est consolidée dans [le dossier de refonte](ux-madness/preparation-refonte-2026-10-28/preparation-refonte.md).

Ils convergent : les blocs d’état et de récupération repoussent projet, onglets et conversation sous le premier écran. La prochaine refonte doit donc réorganiser la hiérarchie, donner la priorité à l’échange dans Conversation, rendre l’ouverture compacte et aligner la bascule, tout en conservant cibles utilisables et décisions explicites. Palette terracotta/bleu conservée.

**Cette préparation n’est pas une refonte installée**, un verdict Impeccable ship ou un audit WCAG. Aucun contrat UX adopté ni code renderer modifié. L’implémentation de la refonte reste à faire dans l’ordre retenu après les prérequis de l’epic 1.

## Cap à conserver

L’objectif reste un orchestrateur BMad visible et compréhensible. Aujourd’hui, le pilote intégré couvre les échanges Mary/Forge et leurs interactions qualifiées ; le guidage complet, l’aide contextualisée, le catalogue, les documents et le temps/coût par US restent dans l’epic 2. L’initialisation est dans l’epic 3 ; Graphify est dans l’epic 4. L’étude Loop/Builder est terminée, mais Loop n’est pas installé ou intégré.

Le travail, les limites et les prochaines entrées sont sauvegardés. Tu peux redémarrer ou mettre à jour l’application desktop sans perdre ces livrables locaux.

Preuves principales : [maintenance1.9](tickets/epic-boucle-codex/qualification-maintenance/parent-verification.md), [complément1.2](tickets/epic-boucle-codex/qualification-g0/complement-compatibilite-2026-10-28.md), [tableau historique avant le changement de périmètre personnel](tickets/epic-boucle-codex/qualification-g0/board-after-compatibility.json).
