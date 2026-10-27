# Story 1.6 — approbation native limitée à une opération

**Une voie opérationnelle est qualifiée sur Codex 0.144.6 : `apply_patch` natif avec `approvalPolicy=on-request`, shell désactivé et sandbox read-only.** Elle est distincte des outils hôte Mary/Forge actuellement livrés. Aucune implémentation produit ni admissibilité de distribution n’est déduite de cette investigation.

Mesure unique le 27 octobre 2026, 07:30:36–07:30:53 UTC : vrai runner Windows, fournisseur HTTP lié exclusivement à `127.0.0.1`, modèle entièrement simulé, sans OAuth, credentials, compte facturable ni fournisseur externe. Les cinq scénarios bornés passent. Aucun test de questions 1.5 n’est relancé.

## Surface native et identité

| Surface | Identité et portée | Décisions documentées dans les schémas locaux |
| --- | --- | --- |
| `item/fileChange/requestApproval` | RPC `id` string/int ; `threadId`, `turnId`, `itemId`, `startedAtMs`, `reason`, `grantRoot` | `accept`, `acceptForSession`, `decline`, `cancel` |
| `item/commandExecution/requestApproval` | Même corrélation ; commande/cwd, actions analysées au mieux, éventuel `approvalId` distinct pour callbacks de sous-commandes ; champs expérimentaux `availableDecisions` et `additionalPermissions` | `accept`, `acceptForSession`, amendement execpolicy, amendement réseau, `decline`, `cancel` |
| `item/permissions/requestApproval` | cwd et permissions supplémentaires fichier/réseau ; ne décrit pas une opération unique | Réponse permissions + portée `turn` ou `session` ; hors profil limité à une opération |

Seule la surface **fileChange** est exécutée dans ce banc. Aucun shell n’est activé ni exécuté. Les tools réellement offerts au fournisseur sont `update_plan`, `request_user_input`, `apply_patch` et `view_image` ; le banc n’appelle que `apply_patch`, de type `custom`/freeform.

Les fichiers et les diffs ne figurent pas dans la demande fileChange. Ils viennent de `item/started` avec `params.item.type=fileChange`, `item.id`, `changes[{path,kind,diff}]`, ou du schéma `item/fileChange/patchUpdated`. Le banc observe l’item complet **avant** la demande d’approbation. Il joint thread/tour/item, vérifie son seul chemin témoin possédé et n’accepte aucune demande avec `grantRoot` non nul. Une action analysée ou un texte modèle ne remplace pas cette portée native.

**Portée effectivement exercée : `kind.type=update` uniquement, `move_path=null`, un fichier par opération.** Les six demandes natives portent toutes `grantRoot=null`. Les kinds `add` et `delete`, les déplacements et les patches multi-fichiers restent non qualifiés. Aucun événement `item/fileChange/patchUpdated` n’est émis dans ce banc ; seule la source `item/started` est réellement mesurée.

Réponse réellement écrite, avec le type et la valeur exacts de l’id reçu :

```json
{"id":0,"result":{"decision":"accept"}}
```

`acceptForSession` autorise selon le schéma de futures modifications des mêmes fichiers ; `grantRoot` demande une extension à une racine pour la session, avec sémantique signalée instable. Ces extensions ne sont ni utilisées ni qualifiées. Pour le profil limité, exposer seulement `accept`, `decline` et éventuellement `cancel`.

## Faits mesurés

| Scénario | Résultat natif | Effet relu et empreinté |
| --- | --- | --- |
| Baseline read-only + `never` | Aucune approbation ; raw `patch rejected: writing is blocked by read-only sandbox; rejected by user approval settings` | Fichier inchangé |
| `on-request`, accept puis refus d’un second patch du même fichier dans le même tour | Deux demandes distinctes (RPC ids 0 puis 1, itemIds distincts). Premier `item/completed.status=completed`, second `declined` | Premier contenu exact conservé ; aucun effet du second patch |
| `cancel` | `serverRequest/resolved`, raw `aborted by user…`, tour `interrupted` | Aucun effet |
| Ajustement explicite | `decline` de la première proposition, fin du tour, nouveau `turn/start` textuel, nouvelle proposition et approbation, puis `accept` | Aucun effet initial ; seul contenu corrigé observé |
| Interruption puis acceptation tardive | Interruption après attente de 200 ms, tour terminal, réponse `accept` à l’ancien id, observation 250 ms, puis arrêt | Aucun effet tardif observé |

L’acceptation ponctuelle ne crée donc pas de permission persistante sur le même fichier dans le même tour. Le banc ne prouve pas le comportement de toutes les classes d’opérations ni de versions ultérieures.

## Confirmation, succès et invalidation

Sur le premier patch accepté : demande à 2158 ms, `serverRequest/resolved` à 2163 ms, puis `item/completed` et raw de succès à 2176 ms. La résolution précède donc la réussite d’exécution. Elle apparaît aussi pour refus et interruption : **elle ne prouve ni la décision acceptée ni le succès de l’effet**.

L’ordre exact du flux pour les deux opérations du même tour est :

```text
accept : item/started (2157 ms) → requestApproval (2158)
         → réponse {decision:"accept"} → serverRequest/resolved (2163)
         → item/completed(status:"completed") (2176)
         → rawResponseItem/completed (2176, après item/completed dans le flux)
decline: item/started (2406) → requestApproval (2406)
         → réponse {decision:"decline"} → serverRequest/resolved (2410)
         → item/completed(status:"declined") (2410)
         → rawResponseItem/completed(output:"patch rejected by user") (2410)
```

Le raw accepté a `params.threadId`, `params.turnId`, `params.item.type="custom_tool_call_output"`, `params.item.call_id` égal au `itemId`, puis un `params.item.output` textuel contenant `Exit code: 0`, `Success. Updated the following files:` et le chemin témoin. Il **ne réémet pas la décision d’approbation en JSON**. Le raw refusé porte les mêmes champs de corrélation et `output="patch rejected by user"`. Les sorties intégrales et les ordres d’événements sont conservés dans le JSON de preuve.

La réussite observée réunit : `item/completed` du même thread/tour/item, `item.type=fileChange`, `item.status=completed` ; raw `custom_tool_call_output` dont `call_id=itemId`, sortie avec `Exit code: 0` et fichier annoncé ; relecture des octets et SHA-256 du témoin. Le schéma des statuts distingue `inProgress`, `completed`, `failed`, `declined`. Aucun échec postérieur à une acceptation n’est injecté dans ce banc : le produit doit néanmoins conserver l’état « accepté, exécution en cours » jusqu’au résultat, sans déduire la réussite de son propre envoi.

Le baseline termine même le tour avec `status=completed` après un patch rejeté : le terminal du tour ne suffit pas non plus à établir le succès d’une opération.

Lors des annulations, aucun `item/completed` fileChange n’est reçu : le terminal doit retirer l’attente, même si l’item est resté `inProgress`. Une réponse à un id retiré après interruption n’a pas d’effet dans la fenêtre mesurée. Le produit doit de son côté invalider ses commandes sur terminal, arrêt, changement de contexte ou échéance locale et ne jamais envoyer une décision obsolète.

Il n’existe aucun champ d’expiration dans les paramètres d’approbation examinés. `startedAtMs` est un horodatage, pas une durée. Le banc ne prétend pas qualifier un délai natif autonome ; une échéance locale doit retirer l’attente et interrompre le tour ou refuser l’opération selon le contrat choisi.

## Ajustement : pas de saisie native dans la décision

`FileChangeRequestApprovalResponse` ne contient que `decision`. Aucune variante n’emporte un texte ou un patch corrigé. Un champ inventé `message`, `feedback` ou `adjustment` ne doit pas être envoyé comme s’il était pris en charge.

La séquence opérationnelle mesurée est **refuser, puis envoyer un nouveau tour textuel explicite**. Le refus laisse le tour continuer ; le banc attend sa fin avant le nouveau `turn/start`. Celui-ci contient réellement la demande corrigée et produit une nouvelle approbation. La compréhension de l’ajustement par un vrai modèle n’est pas prouvée : le fournisseur simule la proposition corrigée. Aucun texte d’ajustement ne doit être envoyé automatiquement par un simple changement de brouillon.

## Compatibilité et proposition minimale

Le produit actuel (`src/adapters/codex/dialogue.ts`, état fourni après 1.5) configure `approvalPolicy=never`, shell désactivé, read-only ; ses prompts Mary/Forge interdisent les approbations et son handler refuse ces demandes. Le parseur de messages refuse également les items fileChange. Le succès natif du banc ne rend pas ce parcours déjà disponible.

Une route minimale doit adopter **explicitement une opération d’écriture bornée** : policy `on-request`, reviewer `user`, shell toujours désactivé, read-only conservé ; allowlist de fichiers et opérations, diff natif intégral, préconditions et contexte figés avant consentement ; rejet de toute demande inconnue ou plus large, dont `grantRoot`, permission de session, commande ou réseau. Conserver toutes les identités RPC/thread/tour/item et traiter décisions, exécution, résultat et invalidation comme des états distincts. La portée ne doit jamais reposer sur la seule bonne volonté du modèle.

Cette route native peut préserver Mary/Forge en les laissant sur leur profil actuel tant qu’aucune opération qualifiée n’est définie pour eux. Elle ne transforme pas `bmad_forge_write` en demande native fileChange : les outils hôte s’exécutent côté Madness et gardent leurs bornes et invariants. Ajouter un consentement autour d’un tel outil serait un **gate hôte corrélé à `item/tool/call`**, distinct du mécanisme fileChange qualifié ici ; ne pas présenter les deux comme interchangeables.

## Artefacts et limites

`protocol-spike.mjs` est le code réellement exécuté, sans modification pendant la mesure. SHA-256 : `3756045b1607528735e20446d5e2a7fcaa7b39579ea1fae1279204f8cd8817a4`.

`protocol-spike.json` conserve les séquences, changements annoncés, décisions, sorties natives, octets/SHA-256 et neuf vérifications dérivées toutes vraies. Les prompts initiaux sont remplacés par leurs empreintes. Les schémas natifs `--experimental` sont exportés vers l’espace jetable ; leurs champs et empreintes sont conservés dans ce JSON. Exemples : FileChange Params `7b465f7c5671adffdc5c339f50799860950307456e2a2b52c5ce1d3018f4babd`, Response `7ccbd29e5f8840c7c8aa96c5c3b6d52bc71ec5c5d7e1ad05ab958afd44c0c94c`.

Binaire exécuté : `C:/Users/UP60066553/AppData/Roaming/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe`, version `codex-cli 0.144.6`, SHA-256 `4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7`.

La commande Windows utilise `require_escalated`, approuvée pour ce banc loopback. Les exclusions de proxy sont strictement limitées aux processus éphémères ; aucun réglage global, TLS ou production modifié. Les cinq processus de dialogue et auxiliaires sont arrêtés ; profils, fixtures et exports temporaires supprimés. Aucun produit, ancien spike 1.5, plan, contrat ou donnée utilisateur modifié. Modèle réel, parcours Madness, cas commandes/permissions, droits de distribution et gates antérieurs restent hors preuve.
