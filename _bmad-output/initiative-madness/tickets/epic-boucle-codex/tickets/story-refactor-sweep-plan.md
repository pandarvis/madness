---
title: 'Nettoyer le test d’arrêt natif avant la vérification intégrée'
type: 'chore'
ticket: 10
created: '2026-10-28'
status: 'built'
baseline_revision: 'c59b505fb2bb7666f431aaae5ee4b24ad1c9e8b6'
route: 'oneshot'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** F1 de la story1.6 est le seul nettoyage encore ouvert dans les plans et revues des neuf entrées built2,12,3–9. Dans `tests/connection-probe.test.mjs`, le test exige un `exitCode` après un arrêt confirmé ; une fermeture par `SIGTERM` donne pourtant légitimement `exitCode: null` et un `signalCode`. La qualification historique a donc un échec d’assertion qui ne démontre pas un échec d’arrêt.

**Approach:** Aligner le test sur la fermeture observable promise par `stopNative`, en conservant son résultat strictement positif et en acceptant une sortie normale ou par signal. Ajouter dans ce même fichier un enfant Node synthétique, sans compte ni réseau, dont le démarrage est observé et qui reste vivant après EOF ; vérifier explicitement sa fermeture par le chemin de terminaison existant, puis nettoyer l’enfant même en cas d’échec du contrôle. Le runtime, ses délais, les protections, la connexion SIWC et les données personnelles restent inchangés. Aucune refonte UI, nouvelle fonction, intégration Loop/graphe ni réécriture de preuve historique n’appartient à ce lot.

- Given un enfant possédé qui se ferme normalement ou par signal, when `stopNative` confirme l’arrêt, then le test exige une fermeture effective et une issue de sortie observée, sans transformer un signal en faux échec ni supprimer l’assertion d’arrêt.
- Given un enfant prêt qui reste vivant après EOF, when le test demande son arrêt avec le contrat existant, then l’événement `close`, le signal de terminaison et la fermeture des flux sont observés ; le test nettoie son seul enfant, y compris en cas d’échec.
- Given les comportements des entrées built, when les tests permanents pertinents sont exécutés après ce nettoyage, then ils passent sans changement fonctionnel ; les vérifications intégrées du paquet personnel restent la responsabilité de1.11.

</frozen-after-approval>

## Implementation Notes

Route oneshot : un seul fichier de test, modification estimée inférieure à100lignes, risque low car aucun code livré n’est changé. Le mandat autonome autorise cette réalisation et ses validations.

Deux investigations fraîches en lecture seule ont confirmé l’inventaire fermé et la cause. La continuité protège Main/preload et Snapshotv1(1.2), profil SIWC(1.12), Mary/Forge(1.3), corrélations/identités(1.4), reçus et brouillons(1.5), accords et effets(1.6), propriété/récupération(1.7), projections/navigation(1.8), manifeste et remplacement(1.9). Aucun autre constat de nettoyage ouvert ; demandes UI, R32, Loop et graphe restent dans leurs lots.

`src/adapters/codex/probe.ts:stopNative` attend `close`, ferme stdin puis utilise SIGTERM si nécessaire ; son garde reconnaît déjà `exitCode` ou `signalCode`. Le diagnostic synthétique a observé `stopped:true`, `closeObserved:true`, `exitCode:null`, `signalCode:SIGTERM` et deux flux détruits. La cause exacte du retard dans le run historique n’était pas mesurée et reste inconnue ; ne pas l’attribuer à la concurrence comme un fait.

Implémentation limitée à `tests/connection-probe.test.mjs` : observation explicite de `close`, assertion sortie normale ou par signal, nettoyage de l’enfant possédé après chaque contrôle. Nouveau cas synchronisé sur READY qui garde l’enfant vivant après EOF et vérifie SIGTERM/fermeture des flux. Le délai du produit est inchangé. Reproduction de l’ancienne assertion : échec attendu ERR_ASSERTION, alors que fermeture et nettoyage sont vrais ; reçu `../qualification-sweep/red-assertion-proof.json`. Tests ciblés9/9 et types réussis. Suite permanente complète lancée, résultat encore attendu ; aucun succès global déduit à ce stade.

Clôture : suite complète301/301, sans échec/annulation/saut/todo ; elle avait exécuté les deux tests d’arrêt avant le seul ajustement du plafond de10à15s demandé en revue. Après cet ajustement, le fichier concerné repasse9/9. Types réussis, sources/configurations/dépendances du produit identiques à la baseline ; aucun assemblage, remplacement ou essai personnel requis pour ce changement de test. Q1 corrigé et confirmé résolu par le même relecteur, aucun correctif différé. Les contrôles intégrés sur le paquet personnel, dont processus Codex réel/réseau/certificats, restent remis à1.11, sans admission distribuée ni changement de connexion. Preuves `../qualification-sweep/parent-verification.md` et `verification.json`.

## Plan Change Log

## Review Triage Log

- Q1 — medium, patch, résolu : le plafond initial du nouveau test(10s) était inférieur à ses attentes cumulées autorisées(READY5s, puis arrêt1,5+4s). Le code confirme cette possibilité de faux échec sous charge ; aucune latence historique précise n’est inférée. Plafond du test porté à15s, sans modifier les délais du produit. Recontrôle ciblé9/9 ; même relecteur confirme que15s couvre10,5s cumulées avec marge4,5s, aucune cause restante. La suite complète301/301 avait déjà exécuté ce cas avec le plafond10s ; le reciblage après correction est conservé séparément. Aucun constat rejeté ni différé.
## Verification

- Reproduction synthétique déterministe de l’ancienne assertion, puis test ciblé `node --test tests/connection-probe.test.mjs` : différence attendue documentée, fermeture et nettoyage conservés.
- `node --test --test-concurrency=2 tests/*.test.mjs scripts/qualification/codex.test.mjs` : tous les tests permanents passent, aucun saut ajouté.
- `npm run typecheck` et comparaison Git de `src/`, configurations et dépendances : aucune modification produit.
- Rapports sous `tickets/epic-boucle-codex/qualification-sweep/` ; les anciens reçus, plans built et contrats ne sont pas réécrits.
