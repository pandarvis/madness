---
title: "Traiter les approbations liées à l’opération annoncée"
type: 'feature'
ticket: '6'
created: '2026-10-27'
status: 'built'
baseline_revision: 'c3a161185baaef574a6cb7508cfe8d2f028072a9'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-approvals/protocol-spike.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-approvals/protocol-file-kinds.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Impossible d’approuver une opération native précise.

**Approach:** Mode Mary opt-in : portée complète du patch, accord/refus ou ajustement. Lecture seule par défaut.

## Boundaries & Constraints

**Always:** Shell désactivé, sandbox read-only, mode capturé. Opération/diff/contexte/tour/demande immuables ; identité attestée ou inconnue, IDs natifs confinés. Chemins canoniques dans le projet, préconditions revérifiées. Accord ponctuel pour tout le patch ; choix, transmission et effets distincts. Verrou avant await, conservation durable, aucun choix présélectionné. Ajustement distinct par demande : refus puis nouveau tour explicite quand ready au même contexte. Délai local annoncé10min, arrêt/terminal même en file invalident les commandes ; restauration historique sans moteur.

**Never:** Accord global/session, grantRoot, commandes/permissions/réseau, déplacement, chemin protégé (.git/.agents/_bmad/données Madness) ou hors projet. Succès déduit d’un accord, replay/accord implicite, feedback natif inventé, rollback prétendu. Forge reste borné. Snapshotv1, six méthodes madness et pilotes préservés ; refonte exclue.

## I/O & Edge-Case Matrix

| Cas | Entrée | Attendu | Échec |
|---|---|---|---|
| Portée | Proposition add/update/delete, un ou plusieurs fichiers | Tous chemins/contenus natifs visibles avant choix | Profil/chemin/grant inconnu refusé |
| Décision | Accord/refus, double clic, reçu retardé | Décision à la demande exacte, effets distincts | Inconnu conservé, aucun faux succès |
| Ajustement | Texte saisi et refus | Texte gardé ; nouvel envoi explicite quand prêt | Vide/contexte changé refusés |
| Invalidation | Terminal, délai, arrêt, proposition/préconditions changées | Contrôle retiré, saisie conservée | Aucune ancienne commande transmise |
| Conservation | Disque refusé/coupure/réouverture | Incertitude conservée, historique inactif | Aucun moteur/effet rejoué |

</frozen-after-approval>

## Code Map

- `src/adapters/codex/dialogue.ts` : RPC0, pause/retrait avant drain, garde0.144.6 ; joindre item/request même décalés. ACK hors handler, resolved insuffisant.
- `src/core/{dialogue,ports}.ts` : gardes/settlements1.5 ; nouveau send explicite après refus.
- `src/adapters/persistence/question-store.ts`, Main/preload : annexe atomique et pont protégé.
- `App.tsx`, `QuestionPanel.tsx`, tests questions/UI : attente, identité et régressions à préserver.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/{approvals,dialogue}.ts`, `src/core/{ports,dialogue}.ts` : mode, décision/effets, ajustement, invalidation/durabilité.
- [x] `src/adapters/codex/{dialogue,file-proposals}.ts` : Mary on-request, périmètre/préconditions/effets contrôlés ; proposition absente/modifiée ou capacité inconnue refusée.
- [x] `src/adapters/persistence/approval-store.ts`, `src/{main,preload}/index.ts` : approvals-v1 atomique, pont strict.
- [x] `src/renderer/src/{ApprovalPanel,App}.tsx`, `src/renderer/src/{strings.ts,styles.css}` : mode, portée, choix et ajustement en deux actions ; Impeccable ciblé.
- [x] `tests/approvals*.mjs`, `tests/connection-ui.test.mjs`, `scripts/qualification/approvals.mjs`, `docs/development.md` : matrice/bancs/preuves/nettoyage.

**Acceptance Criteria:**
- Given le mode activé, when accord/refus/ajustement réels, then effets relus et nouvelles propositions sont corrélés sans accord étendu.
- Given le paquet installé, when réouverture, then contexte/échanges/saisies reviennent sans moteur ni autorisation active.

## Implementation Notes

Implémentation technique livrée par `/root/implement_story16` :217 tests, types/build et installateur, compilé11/11, paquet11/11, Windows5/5. Matrice et empreintes dans [implementation-validation.md](../qualification-approvals/implementation-validation.md), contrôlées par le parent. Les cinq lignes disposent de tests réellement exécutés ; le terminal en file vérifie aussi le délai du tour suivant et l'échéance utilise Date+setTimeout contrôlés.

ASAR avant corrections de revue `f4321dcf2d326bb7be4b2b55f9ca1182aa3604e464852f5b7a0edf171a49e538`. Premier essai personnel arrêté avant tout runner/approbation, connexion lisible mais `PROVIDER_FAILED` ; [live-profile.json](../qualification-approvals/live-profile.json) reste partiel. GET public diagnostiqué séparément, sans rotation ni modèle. Aucune réussite réelle ou installation1.6 déduite. Finition Impeccable fraîche : ship pour les cinq vues synthétiques, aucun correctif matériel ; périmètre ciblé seulement.

## Plan Change Log

## Review Triage Log


| ID | Verdict | Route | Vérification et plus petit correctif |
|---|---|---|---|
| Q1 racine remplacée | high | patch | `safePath` ne contrôle pas la racine capturée. Reproduction Windows : ajout direct puis racine remplacée par jonction, `assertUnchanged` accepte ; aucun fichier extérieur écrit. Recontrôler cette même racine avant les descendants et l'accord ; aucun nouveau contrat. |
| Q2 ajustements concurrents | medium | patch | `approvalCommand` vérifie ready puis attend le disque avant de passer running ; `execute(send)` et une autre demande peuvent donc passer, aucune garde active après cette attente avant `schedule`. Réserver l'état de session existant avant le premier await, préserver arrêt/échec, refuser le concurrent. Aucun besoin produit nouveau. |
| Q3 résultat trop volumineux | medium | patch | Reproduction corrigée : fichier de90001octets avec deux lignes, petit diff ajoutant20000octets ; capture acceptée et effet exact refusé par `bytes` après écriture. Premier témoin avait un diff lui-même hors limite et est conservé. Refuser avant choix un résultat dépassant la borne de relecture existante. |
| Q4 budget contourné | medium | patch | Branche send-adjustment avant la garde1800/1900000 ; `turn/project` peut porter la projection au-delà de2000/2000000, alors que Snapshot autorise10000messages et que preload exige isDialogueState. Réutiliser la garde des envois ordinaires avant ce départ, sans nouveau seuil/surface. |
| N1 reçu englobant | medium | patch | Mesure réelle : fileChange completed/declined corrélés et octets conformes, mais raw exec a un autre call_id et un output tableau. La précondition raw du même appel crée un faux inconnu. Supprimer cette dépendance au profit du reçu fileChange natif déjà corrélé ET de la relecture obligatoire ; raw optionnel diagnostique (chaîne vide déjà valide), pas de nouveau contrat/droit. Régression Code Mode et maintien des rejets sans événement natif. Voir native-receipt-observation.md. |
| N2 terminal pendant relecture | medium | patch | Reproduction rouge terminal-result-audit-before.log : décision réellement transmise, fileChange completed reçu, puis terminal durant la relecture async lancée par decide. Le read-loop invalide encore pendingApproval et produit EFFECT_UNKNOWN. Joindre le résultat déjà reçu/en cours de relecture avant la clôture ; garder terminal sans reçu/transmission en inconnu et arrêt disponible. Réutiliser les états/promesses existants, sans nouvelle surface. |
| N3 callback ancien contre nouvelle session | medium | patch | Reproduction fidèle rouge stale-decision-audit-before.log (19ms) : stop pendant une décision retenue, rejet du résultat natif comme le vrai port, nouveau lancement engagé, puis ancien callback libéré ; la nouvelle conversation passe stopped au lieu de ready. approvalCommand utilise this.controller et update(errorCode) après await sans propriétaire capturé. Conserver l’ancien résultat inconnu mais ne pas arrêter/écraser la nouvelle session ; réutiliser identité du contrôleur/contexte existants. Premières sondes de fixture non concluantes ne sont pas des preuves produit. |

| F1 test historique arrêt | medium | defer | Test connection-probe inchangé depuis le parent : stopNative confirme close, puis assertion exitCode échoue après signal. Module isolé8/8 et même suite contrôlée243/243. Rectifier le test au Refactor sweep1.10 sans modifier les délais produit ; entrée consignée dans deferred-work.md. |

Les causes sont distinctes. Les correctifs Q1–Q4 puis N1–N3 sont implémentés et recontrôlés résolus par le même Quick, par inspection ; aucun constat restant sur ces sept points. Ils portent sur des états et limites démontrés, sans modification du bloc figé. Preuves initiales Q1/Q3 : [review-reproductions-confirmed.json](../qualification-approvals/review-reproductions-confirmed.json). La vérification globale fraîche après N1–N3 reste nécessaire avant clôture.

## Design Notes

Risque high : mauvais effet/incertitude. Rapports natifs : add/delete=contenu complet, update=diff unifié ; ordre non identitaire. Implémenteur unique code/tests/bancs sans compte ; parent revues/réel/installation/commit. Pas seul : préserver autrui et protocol-* figés.

## Verification

Matrice/régressions196, `npm test`, `npm run build`, paquet et bancs isolés ; captures groupées, finition Impeccable. Vrai moteur/nouveau témoin : accord/refus/ajustement/nouvelle proposition, arrêt/tardif, effets et réouverture. Expiration par horloge contrôlée, aucun délai natif prétendu. Coffre/données préservés, profils nettoyés, gates inchangés.

## État de reprise du27 octobre

Q1–Q4 corrigés et recontrôlés résolus par le même Quick ; aucun correctif différé. Parent :224/224 tests (zéro saut), types/build/installateur, compilé11/11, paquet11/11, Windows5/5 et membres ASAR identiques. Renderer inchangé, finition Impeccable ship ciblée conservée. Voir [parent-verification.md](../qualification-approvals/parent-verification.md).

État historique avant l’acquittement humain : GET JWKS strict307 vers Zscaler, non suivi. Le GET200 ultérieur et les observations N1 ci-dessous remplacent ce blocage ; aucune question réseau n’est en attente. Le premier accord réel a effectivement modifié le témoin malgré son résultat produit inconnu : ne pas le rejouer. Installation1.6, parcours réel complet,1.7 et refonte globale restent non acquis.

## Observation réelle complémentaire

Le réseau est rétabli après acquittement humain, GET200. Le passage personnel révèle N1, correction locale de la preuve de résultat ; source et limites dans [native-receipt-observation.md](../qualification-approvals/native-receipt-observation.md). Le bloc figé ne change pas. Même implémenteur réengagé, pas de nouvelle UI ni mode fournisseur. Les224 tests restent la preuve avant cette correction ; toute vérification finale doit être refaite après le changement.

N1 est ensuite confirmé sur le vrai runner avec fournisseur loopback Code Mode, accord puis refus, neuf contrôles et nettoyage réussis. N2 et N3 disposent de reproductions rouges et de régressions permanentes : reçu pendant relecture/terminal, puis ancien callback contre nouvelle conversation. Recontrôle Quick N1–N3 résolu, sans nouveau constat. Ciblage final core51/51. Le nouveau témoin `approvals-live-acd86513` est préparé sans lancement de moteur ; tout passage réel utilise le paquet reconstruit après ces trois correctifs. Les anciens témoins et résultats inconnus restent conservés.

## Vérification après N1–N3 et attente externe

La suite complète à concurrence limitée passe **243/243**, sans saut, en345641,8359ms. La première suite par défaut avait242/243 : assertion historique d’exitCode après fermeture par signal, consignée pour1.10 dans deferred-work ; module isolé8/8. Aucun délai ni comportement produit modifié pour obtenir ce passage.

Types, compilation et installateur réussis. Compilé11/11, paquet11/11, régressions Windows5/5 et vrai runner avec fournisseur loopback9/9, tous profils possédés nettoyés. Membres ASAR identiques aux bundles compilés ; renderer identique à la finition Impeccable. Identité : [receipt-artifact.json](../qualification-approvals/receipt-artifact.json), ASAR `e955f579b98bdfa3d14acc778c3fd286e62c02751217d62ca08e183d0c2a137e`.

Le parcours personnel frais du nouveau paquet échoue avant tout lancement natif/accord : connexion NETWORK_UNAVAILABLE, projection PROVIDER_FAILED, aucun ancien accord rejoué. `live-receipt-profile.json` garde cette tentative et son nettoyage confirmé. Le contrôle public Main séparé du27 octobre à12:11UTC rencontre une redirection refusée par la politique stricte ; aucun statut307 n’est déduit de ce seul résultat. Le lien public fixe est ouvert dans le navigateur Windows. Une question attend **l’action d’acquitter Zscaler**, jamais le contenu JSON ni un token ; aucun TTL n’est connu. Preuve : [network-receipt-profile.json](../qualification-approvals/network-receipt-profile.json).

`blocked` signifie uniquement que le parcours réel corrigé et la restauration du paquet installé restent à qualifier ; aucun commit/clôture1.6 ou installation déduit des tests locaux. Le témoin `approvals-live-acd86513` est désormais référencé et conservé. `approvals-live-a03f91c9`, distinct et préparé sans moteur, sert à la reprise après action humaine avec `story16-live-after-network-controller.mjs`. Ne pas rerendre1.6 ni rejouer une ancienne décision. La demande de lien visible/Ouvrir/Copier/vérifier l’accès est adoptée pour le cadrage de1.7, sans relance automatique facturable.

## Clôture qualifiée après acquittement réseau

Le clic humain est pris en compte : GET Main200 et clés valides. Le parcours natif frais confirme accord/refus/ajustement, quatre décisions et cinq demandes. L’arrêt est observé via le pont dans le nettoyage du contrôleur. Son oubli du bouton Enregistrer reste documenté dans FREE_DRAFT_TIMEOUT ; deux compléments locaux7/7 chacun enregistrent explicitement puis rouvrent sans moteur, sans renvoyer aucune opération. Ancienne approbation refusée et cinq effets finaux relus. Voir live-completed-profile.json et les rapports source intacts.

Paquet qualifié installé : dix fichiers critiques identiques avant/après, restauration installée5/5 et compte conservé. Après qualification, le seul témoin courant et ses cinq annexes sont archivés, profil fermé ; seuls MIA et Madness restent dans les récents. Le renderer n’a pas changé ; finition Impeccable conservée. Résultats finaux243/243, compilé11, paquet11, Windows5 et natif loopback9 dans parent-verification.md. Sept correctifs résolus, seul F1 historique reporté pour1.10. Gates1.1/1.2 et distribution restent ouverts. Prochain workflow autonome : bmad-build1.7, dont lien public/Ouvrir/Copier/vérifier accès sans envoi implicite.
