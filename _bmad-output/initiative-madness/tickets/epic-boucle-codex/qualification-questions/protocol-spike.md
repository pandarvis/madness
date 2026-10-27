# Story 1.5 — microqualification du protocole Codex

Statut : **question et réponse natives observées ; témoin positif exact identifié**. Le vrai runner 0.144.6 exécute le protocole ; le modèle est entièrement simulé par un fournisseur HTTP loopback. Aucun vrai modèle, OAuth, compte facturable, parcours UI ou Madness personnelle utilisé. Dernière mesure :26 octobre 2026, 20:10:52–20:12:05 UTC.

## Montage et portée

Le binaire installé annonce `codex-cli 0.144.6`. SHA-256 : `4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7`.

Chaque scénario emploie un `CODEX_HOME` neuf, un thread `ephemeral`, `sandbox=read-only`, `approvalPolicy=never`, sans credentials hérités. Le serveur scripté est lié exclusivement à `127.0.0.1`. Il simule un appel Responses `request_user_input`, puis un message final. Aucun endpoint fournisseur externe, outil shell, plugin, app ou sous-agent n’est activé. Les requêtes fournisseur capturées ne portent aucun en-tête Authorization.

`features.default_mode_request_user_input=true` et `experimentalRawEvents=true` sont limités aux processus éphémères. La désactivation du proxy système et `NO_PROXY=127.0.0.1,localhost` concernent exclusivement ces processus et leur fournisseur loopback ; aucun réglage global ou de production n’a changé.

Deux premières passes dans le bac à sable par défaut de `exec_command` échouent avant toute question. Elles sont conservées séparément. Une unique reprise autorisée avec `sandbox_permissions=require_escalated`, approuvée automatiquement, produit les observations ci-dessous. La frontière d’exécution, l’instrumentation et la compression ont changé ensemble : la réussite ne démontre pas la cause unique des premiers échecs.

## Capacités effectivement observées

- `features list` retourne `default_mode_request_user_input under development true` dans les quatre processus finaux.
- Le tool spec reçu par le fournisseur simulé annonce réellement `request_user_input`, disponible en **Default ou Plan**, avec `autoResolutionMs` entre 60000 et 240000 ms. Le banc conserve Default ; aucun changement de mode n’est requis dans cette mesure.
- Le runner transforme les questions simulées en requêtes natives `item/tool/requestUserInput`. Sans ces champs dans les arguments simulés, il émet `isOther=true` et `isSecret=false`.
- L’export natif `generate-json-schema --experimental` expose `thread/start.experimentalRawEvents`, décrit comme réservé à un usage interne. Les événements `rawResponseItem/completed` sont réellement émis, y compris pour developer/user avant l’appel fournisseur.
- L’export expose aussi `turn/start.collaborationMode`, qui prend priorité sur modèle, effort et instructions developer. Cette autre route n’est pas exercée.

## Séquences mesurées

| Scénario | Résolution | Sortie brute du même call_id | Fin de tour |
| --- | --- | --- | --- |
| Réponse sans délai | `serverRequest/resolved`, puis raw 1 ms après | JSON contenant exactement le nonce soumis | `completed` ; résultat exact dans le POST fournisseur suivant la réponse |
| Interruption sans réponse | Raw puis `serverRequest/resolved` 1 ms après | `aborted by user after 0.1s` | `interrupted`, aucun POST fournisseur suivant |
| Délai sans réponse | Aucune observée avant 65 s | Aucune observée | Timeout borné du banc, puis arrêt propre |
| Arrêt sans réponse | Aucune observée | Aucune observée | Processus arrêté ; aucune réussite prétendue |

Pour le délai, la demande simulée 1000 ms est normalisée à 60000 ms dans la question native. Aucune expiration autonome n’est observée pendant les 65 s de surveillance. Ce résultat ne qualifie ni le mécanisme d’expiration ni une garantie de délai.

L’ordre de `serverRequest/resolved` et du raw varie entre réponse et interruption : aucun ordre relatif ne doit être imposé.

## Forme réelle du témoin positif

La requête question mesurée contient un RPC `id=0` de type number et les paramètres `threadId`, `turnId`, `itemId="call_answer-no-expiry"`, `questions` et `autoResolutionMs=null`. La réponse écrite garde exactement cet id et contient :

```json
{"id":0,"result":{"answers":{"route":{"answers":["Alpha-cdce55df-0357-4f19-ae11-11a68aff8b16"]}}}}
```

Le runner émet ensuite l’enveloppe brute suivante. Les valeurs thread/turn ci-dessous sont abrégées pour lecture ; le JSON de preuve conserve leurs valeurs intégrales :

```json
{
  "method": "rawResponseItem/completed",
  "params": {
    "threadId": "<thread de la question>",
    "turnId": "<tour de la question>",
    "item": {
      "type": "function_call_output",
      "call_id": "call_answer-no-expiry",
      "output": "{\"answers\":{\"route\":{\"answers\":[\"Alpha-cdce55df-0357-4f19-ae11-11a68aff8b16\"]}}}",
      "internal_chat_message_metadata_passthrough": {"turn_id":"<même tour>"}
    }
  }
}
```

Le témoin discriminant est la conjonction `params.threadId` + `params.turnId` + `params.item.type=function_call_output` + `params.item.call_id` égal au `itemId` de la question, et le JSON décodé de `params.item.output` égal exactement au résultat soumis. L’égalité `call_id=itemId` est observée dans ce runner et ce scénario. Le POST suivant du vrai runner contient le même call_id et le même résultat, ce qui confirme sa transmission au fournisseur simulé.

`serverRequest/resolved` contient seulement `threadId/requestId`. Il apparaît également lors de l’interruption : **ce n’est pas un acquittement positif de notre réponse**. Un callback `stdin.write` n’est pas non plus ce témoin. Le raw exact atteste la consommation native de la réponse sur 0.144.6 ; il ne prouve pas un accusé de réception d’un service facturable distant. Aucun ThreadItem question ni `item/completed` de question n’a été émis : les types observés sont userMessage et agentMessage.

## Conséquences pour l’intégration

Conserver l’identité complète de la requête native, y compris le type du RPC id. Écrire une seule réponse au même RPC, puis attendre le raw exact. Le handler actuel de DialogueRpc écrit après retour de `onRequest` : attendre le raw à l’intérieur de ce handler avant de rendre le résultat créerait une dépendance circulaire. La coordination de l’acquittement doit donc recevoir le raw après l’écriture effective.

Une résolution sans raw exact, une sortie `aborted…`, un arrêt ou un timeout ne doivent jamais produire l’état « réponse acquittée ». Le profil initial peut refuser `isSecret=true` et les délais automatiques tant que leurs contrats ne sont pas qualifiés ; aucun secret durable n’a été testé ou stocké ici.

La validation réelle minimale restante est un échange avec un vrai modèle dans le profil Default de Madness : apparition naturelle d’une question, réponse corrélée, raw exact et reprise du dialogue. Cette validation reste distincte du transport natif mesuré avec modèle simulé. Aucun gate, ticket bloqué ou droit de distribution n’est déduit du présent banc.

## Artefacts figés et nettoyage

- `protocol-spike.json` : événements et comparaisons de la reprise finale ; les prompts initiaux sont remplacés par leurs empreintes. Les checks `positiveNativeConsumptionWitness` et `positiveWitnessAlsoInNextProviderPost` valent true dans le scénario réponse.
- `protocol-spike.mjs` : version exécutée lors de la reprise finale. SHA-256 `b5714451690cf9c99661d010eca77e0cba0cbc344b2815c0b38970375222e005`.
- `protocol-spike-sandbox-attempt.json` : seconde passe antérieure dans le bac à sable ; ses enrichissements alors non exécutés sont effectivement exercés dans la reprise finale.
- `protocol-spike.executed.mjs` : version reconstruite de cette seconde passe antérieure, SHA-256 `88961f7c7dc70827f8c7a1d1626da607a938f0624124106f3e5b53a1d10587ff`.
- `protocol-spike-first-attempt.json` : résumé du premier essai antérieur.

Les douze processus de dialogue des trois passes sont arrêtés et tous les profils/schémas temporaires sont supprimés, y compris après les échecs. Le contrôle final ne trouve aucun dossier `protocol-spike-temp-*`. Aucun fichier produit, ticket, plan, cache existant ou profil personnel n’a été modifié.

Empreintes des exports natifs expérimentaux, dont les champs utiles sont conservés dans le JSON : `ThreadStartParams` `4f30cb90cae47ff01adba8d863228b2aa198232df895dbfc996d594270326744` ; `TurnStartParams` `a28f74287e18b8a18c7aa6966ee7552a8ed2ae13c03f4ba12e9af48f7370f19d` ; `ServerRequestResolvedNotification` `7cc32a834be009c7a45dda01b80ae01bb522c642eb0e886c6d4bd7ee89fde643`.
