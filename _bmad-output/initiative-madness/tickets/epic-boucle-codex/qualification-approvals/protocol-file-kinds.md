# Story 1.6 — créations, suppressions et patches multi-fichiers

**Complément réussi : `add`, `delete` et patch mixte `add + update + delete` sont réellement exécutés puis refusés sans effet dans le vrai runner 0.144.6.** Ce complément étend les faits du rapport `protocol-spike.md`, qui reste figé ; il ne restreint pas l’implémentation à `update` seul.

Une seule passe bornée, trois scénarios, chacun avec une opération acceptée puis une opération refusée dans le même tour. Fournisseur HTTP limité à `127.0.0.1`, modèle entièrement simulé, aucun OAuth, compte ou appel facturable. Le profil reste read-only, `approvalPolicy=on-request`, reviewer user, shell désactivé. Aucun produit, plan, ancien spike ou profil personnel modifié.

## Portée réellement qualifiée

| Scénario | Opération acceptée | Proposition refusée | Vérification des effets |
| --- | --- | --- | --- |
| Création | `add` de `livrable-a.md` | `add` de `livrable-b.md` | Premier fichier créé avec octets exacts ; second absent |
| Suppression | `delete` de `obsolete-a.md` | `delete` de `obsolete-b.md` | Premier absent ; second conserve exactement ses octets initiaux |
| Patch mixte | Un patch crée `livrable.md`, modifie `contexte.md`, supprime `obsolete.md` | Un second patch crée `refuse.md`, modifie `livrable.md`, supprime `contexte.md` | Après acceptation : trois effets exacts. Après refus : aucun des trois effets proposés ; état accepté conservé intégralement |

Les six demandes portent `grantRoot=null`. Aucune permission de session ni décision `acceptForSession` n’est envoyée. Tous les `update` ont `move_path=null` ; les déplacements restent non exercés et hors capacité proposée.

Le patch multi-fichiers produit **un seul item fileChange, une seule demande d’approbation et une seule décision pour les trois fichiers**. Il ne s’agit pas de trois consentements indépendants. L’opération suivante reçoit un nouvel id RPC et un nouvel itemId dans le même tour. Le succès observé ne démontre pas un mécanisme d’atomicité ou de rollback si un des effets échoue ; aucun échec partiel n’est injecté.

## Annonce avant consentement

Pour chaque demande, `item/started` précède `item/fileChange/requestApproval` dans le flux et contient les chemins, kinds et diffs de **tout** le patch. Le banc vérifie l’égalité exacte du jeu chemins/kinds avec l’opération scriptée avant de répondre. Les identités sont jointes par threadId, turnId et itemId ; la réponse conserve le type et la valeur de l’id RPC reçu (0 puis 1, nombres dans ces scénarios).

Formes natives réellement observées :

```text
add    : kind={type:"add"},    diff=<contenu complet du nouveau fichier>
delete : kind={type:"delete"}, diff=<contenu complet du fichier à supprimer>
update : kind={type:"update",move_path:null}, diff=<diff unifié @@… -… +…>
```

Les champs `diff` d’ajout et de suppression ne portent pas de marqueurs `+`/`-` : le rendu doit tenir compte du kind et préserver le contenu complet. Pour le patch mixte, les changements de l’item natif sont présentés dans un ordre de chemins différent de celui du patch scripté ; l’ordre n’est donc pas une identité de portée.

## Confirmation et preuve d’effet

Les trois acceptations aboutissent à `item/completed`, `item.type=fileChange`, `status=completed`, puis à un raw `custom_tool_call_output` du même call_id/itemId. Sa sortie porte `Exit code: 0`, les chemins annoncés et les codes `A`, `M`, `D` correspondants. Les contenus/existences sont relus avant la décision suivante, après le tour et après arrêt natif ; leurs SHA-256 sont conservés dans le JSON.

Les trois refus donnent `status=declined` et raw `output="patch rejected by user"`. La comparaison de tous les fichiers surveillés confirme l’absence d’effet de l’opération refusée. Une notification `serverRequest/resolved` est également reçue, mais ne vaut toujours pas preuve de décision ou de réussite à elle seule.

Le plan peut donc prévoir une opération bornée contenant un jeu de fichiers `add/update/delete`, avec consentement portant sur le jeu intégral. Les bornes d’autorisation, préconditions, contrôle des chemins et résultats du produit restent nécessaires ; ce banc n’accorde aucun chemin arbitraire.

## Reproductibilité et limites

`protocol-file-kinds.mjs` est le script exécuté, dérivé du banc précédent sans le modifier. SHA-256 : `a5926b3f1a38e7b4395315ffabd03331bd39cee001ceaff4e98970b544363b58`.

`protocol-file-kinds.json` conserve les demandes, annonces, décisions, sorties natives, contenus/existences, empreintes et treize vérifications dérivées par scénario. Les schémas exportés dans l’espace jetable et leurs empreintes sont inclus dans les preuves. Les prompts initiaux sont remplacés par leur empreinte.

Binaire inchangé : `codex-cli 0.144.6`, SHA-256 `4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7`. La commande Windows est exécutée avec `require_escalated`. Les réglages loopback/proxy sont limités aux processus éphémères ; aucun réglage global ou TLS changé.

Les trois processus de dialogue et auxiliaires sont arrêtés. Profils, fixtures et exports temporaires sont supprimés après la passe, y compris les chemins de suppression testés ; aucun dossier `protocol-file-kinds-temp-*` ne reste. La compréhension de BMad par un vrai modèle, le parcours Madness, les déplacements, cas d’échec partiel et gates de distribution ne sont pas qualifiés par ce complément.
