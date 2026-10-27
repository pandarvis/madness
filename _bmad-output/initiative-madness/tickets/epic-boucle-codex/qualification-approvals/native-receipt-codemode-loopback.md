# Reçu N1 — confirmation native avec Code Mode simulé

**Le protocole produit corrigé réussit l’accord puis le refus natifs avec `exec → tools.apply_patch`, sans raw du même item fichier.** Les deux opérations ont leur événement `fileChange item/completed` corrélé et tous les octets attendus sont relus. Cette preuve complète les anciens bancs directs ; elle ne les modifie pas.

Une seule exécution bornée le 27 octobre 2026, de **11:12:17,936 à 11:12:20,816 UTC**. Vrai runner Windows `0.144.6`, fournisseur HTTP entièrement simulé lié à `127.0.0.1`, aucun OAuth, credential, compte ni modèle externe. Le modèle sélectionné par le même prédicat de catalogue que le produit porte l’identifiant `gpt-5.6-sol` ; ses trois réponses sont générées par le serveur loopback.

## Faits observés

| Opération native | Décision réellement transmise | Reçu natif et relecture produit | Raw réellement observé |
| --- | --- | --- | --- |
| Mise à jour du témoin | `accept` | Même thread/tour/item : `fileChange completed`. Empreinte de tous les fichiers égale à celle de l’effet accepté. | `custom_tool_call_output` de `exec_outer_1`, autre `call_id`, `output` tableau. |
| Nouvelle mise à jour du même fichier | `decline` | Nouvelle demande et nouvel item : `fileChange declined`. Octets acceptés précédemment préservés exactement ; aucun effet du second patch. | `custom_tool_call_output` de `exec_outer_2`, autre `call_id`, `output` tableau. |

Dans les deux `ApprovalResult` réellement retournés par le protocole produit, `raw` vaut la chaîne vide. Aucune sortie n’est reconstruite ou inventée. Le reçu vient du `fileChange` strictement corrélé et des effets relus après transmission explicite, pas de l’enveloppe `exec`.

Les outils sont réellement offerts dans `input[type=additional_tools].tools` ; le serveur vérifie `exec` de type custom avant chaque réponse. Le premier script utilise les deux outils hôte synthétiques du banc pour satisfaire les prérequis du protocole puis `tools.apply_patch` ; le second propose seulement le nouveau patch. Le test emploie un SKILL.md témoin, aucun profil BMad personnel et aucun modèle réellement analyste. Les réponses des outils hôte sont des données de fixture annoncées comme telles.

Le profil reste `sandbox=read-only`, `approvalPolicy=on-request`, reviewer `user`, shell désactivé ; les deux demandes ont `grantRoot=null`. Aucune propriété d’authentification n’est présente dans les trois requêtes HTTP observées. **Neuf contrôles dérivés sont vrais**, dont deux demandes distinctes, statuts completed/declined, décisions transmises, effets relus, raw englobants distincts, raw public vide et absence d’autorisation HTTP. Le processus natif est arrêté et les seuls profils/fixtures créés sont supprimés (`nativeStopped=true`, `cleanup=true`).

## Régressions source

La commande ciblée `node --test tests/approvals-protocol.test.mjs tests/questions-protocol.test.mjs tests/dialogue-protocol.test.mjs` réussit **52/52** tests. Elle couvre notamment :

- accept/refuse avec raw absent, raw englobant sous forme de tableau ou diagnostic string réellement corrélé ;
- attente de la confirmation de transmission, puis reçu natif + tous les octets ;
- raw seul, mauvais thread/tour/item, completed après decline ou declined après accept, effets divergents et terminal sans résultat : aucun faux reçu ;
- questions1.5 et dialogue natif précédents, dont reçu JSON exact et retrait terminal des demandes encore en file, inchangés.

Les nouveaux cas ont d’abord échoué sur l’ancienne dépendance au raw : absence de résultat sans raw, rejet d’un diagnostic sans marqueur de succès et acceptation indue d’effets divergents. Seul le protocole d’approbation interne et sa documentation changent ; aucun droit, sandbox, shell, IPC, contrat public ni renderer modifié.

## Reproduction et identité

```powershell
node _bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-approvals/native-receipt-codemode-loopback.mjs
```

- Script réellement exécuté : `native-receipt-codemode-loopback.mjs`, SHA-256 `405ca93690ade56688d8abd54c1bb8ec7425157fd184df45d07c5d208a6b1ec5`.
- Runner épinglé et vérifié avant lancement : SHA-256 `4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7`.
- Rapport détaillé : `native-receipt-codemode-loopback.json`, événements natifs, propositions, décisions, relectures et sorties raw réellement reçues.

Le banc utilise la permission locale Windows `require_escalated`, exclusivement pour ce processus possédé et son loopback. Les réglages réseau sont limités aux processus éphémères ; aucun flag de profil produit ni réglage global modifié. `protocol-spike.*`, `protocol-file-kinds.*` et les modifications d’autrui sont préservés. Parcours avec vrai modèle, paquet final, installation et gates historiques restent à vérifier séparément par le parent.
