---
title: 'Qualifier le cache des clés et la récupération réseau sans modifier Zscaler'
type: 'chore'
ticket: 1
created: '2026-10-28'
status: 'built'
baseline_revision: 'e2d9367176a93862b9a108fcef16715ff2675a66'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les acquittements Zscaler répétés interrompent la connexion personnelle et l’autonomie. Le porteur demande de qualifier cache des clés publiques et récupération réseau dans l’environnement inchangé, puis de reprendre2.1 ; aucune réduction réelle de clics n’est encore prouvée.

**Approach:** Produire un prototype local isolé et une matrice de preuves comparant les stratégies de cache et leurs transitions de récupération. Réutiliser les vraies vérifications JWT/transport et le service de connexion existants quand cela rend la preuve plus forte ; conclure option par option, y compris négativement ou sous conditions. Toute intégration dans le produit reste un lot séparé.

## Boundaries & Constraints

**Always:** Zscaler inchangé, pas d’IT ; garanties de signature RS256, issuer/audience/sujet/expiration/scopes préservées. Fraîcheur et cache applicatif distincts de l’accès HTTP réel, de la connexion et du modèle. Réseau accessible ne vaut pas identité validée ni effet confirmé. Toute référence à une fréquence réelle de refresh doit être sourcée ; des échéances fictives restent des scénarios simulés. Même une clé publiquement connue a une fraîcheur bornée et peut être retirée. Les bornes candidates se justifient par sources/risques, pas par une prétendue durée d’acquittement.

**Never:** Modifier src/, tests/ permanents, dépendances, configuration proxy/TLS, contrat adopté, coffre/AppData, profil utilisateur ou paquet personnel. Aucun OAuth, appel de modèle, cookie partagé, token réel, redirection externe suivie ou ouverture de navigateur. Aucun POST/message/accord/tour rejoué automatiquement. Aucun succès produit, cache livré ou autonomie complète déduit du prototype. Un rafraîchissement forcé du diagnostic ne doit pas être servi par le cache candidat ; la preuve d’accès origine du transport livré reste séparée si son cache HTTP est inconnu.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| M1 — Gain et stockage | Séquence connue sans cache, mémoire, persistance et revalidation ; réouvertures simulées | GET/POST comparés ; aucun gain sur POST nécessaire ni clic humain revendiqué ; bornes et absence de headers distinguées | Politique inconnue ou directive restrictive ne produit pas une fraîcheur inventée |
| M2 — Fraîcheur | Absence, cache frais, expiré, altéré, horloge reculée ; no-store/no-cache/max-age/Age | Aucune clé expirée/altérée implicitement acceptée ; état et provenance lisibles ; retrait de clé borné par fraîcheur | Échec fermé, aucun allongement sur erreur réseau |
| M3 — Clés et identité | kid connu/inconnu/retiré, jeu invalide, JWT forgé/expiré/autre identité | Signature et claims réellement vérifiés avec jose/validateIdentity ; récupération bornée d’un kid inconnu ou refus | Aucun simple décodage considéré validation ; cache persistant non authentifié reste non retenu/conditionnel |
| M4 — Transport et concurrence |307, HTML200, JSON invalide, timeout, annulation, demandes concurrentes | Réponses non clés rejetées, requête annulable ; concurrence regroupée si sûre, un appelant annulé ne rend pas une clé invalide aux autres | Pas de suivi307 ni cookie/TLS assoupli ; échec expurgé et aucune boucle incontrôlée |
| M5 — Rotation OAuth | Échec avant POST, réponse perdue après POST, nouveau kid après réponse de rotation |0POST avant disponibilité des clés ; au plus1POST par intention ; issue inconnue et réponse reçue non validée séparées | Pas de réessai automatique avec ancien refresh ; absence de conservation de la réponse après crash reste un manque explicite |
| M6 — Récupération et conservation | Cache frais mais contrôle explicite bloqué, puis GET200 ; fermeture/réouverture simulée | Contrôle force le transport candidat, résultat ne relance ni probe ni modèle ; brouillon/lecture locale identiques, attente et provenance conservées | Réseau rétabli ne débloque pas silencieusement une opération incertaine ; clic humain non simulé comme preuve réelle |

</frozen-after-approval>

## Code Map

- `src/adapters/codex/oauth.ts` : createTransport borne URL/réponse15s/256Kio, omit credentials et redirect:error ; pas de cache applicatif. validateIdentity exporté pour les vraies signatures/claims. refreshCredentials charge getKeys avant POST, réutilise un resolver local pour le nouvel id_token ; l’échec après rotation exige une analyse spécifique. Transport ne retourne pas les headers et ne définit pas fetch.cache : cache HTTP et origine non prouvés.
- `src/adapters/codex/connection.ts` : CodexConnection accepte des ports simulés. check-public-keys distinct de verify/probe ; acquireDialogue ne refresh qu’à échéance et stocke après retour validé. Conserver ce code ; qualifier ce comportement réel en mémoire avec faux coffre et transport local.
- `src/renderer/src/NetworkHelp.tsx`, `src/contracts/connection.ts` : URL publique fixe/Ouvrir/Copier/GET explicite déjà livrés ; lecture de contexte seulement, aucune nouvelle UI dans ce spike.
- `tests/connection-oauth.test.mjs` : exemples de signatures réelles jose, faux credentials et compteurGET/POST. Ne pas éditer ces tests. Les valeurs de durée de leurs fixtures ne décrivent pas les credentials personnels.
- `node_modules/jose/dist/webapi/jwks/remote.js`, `local.js` : bibliothèque6.2.13 examinée par explorer : cache mémoire10min/cooldown30s, coalescence pendingFetch, pas de fraîcheur HTTP ni de repli périmé ; jwksCache est un objet fourni sans intégrité/liaison URL, timestamp futur fini accepté. Ne pas en faire implicitement un cache de confiance persistant ; conserver validation RSA applicative. Les sources officielles RFC9111 et OpenIDConnectCore10.1.1 cadrent cache et rotation ; consigner URLs/sections et limites d’application dans le rapport.
- Electron45 transmet Request.cache : default peut utiliser ChromiumHTTP ; no-store désactive et reload contourne le cache. Qualifier sur serveur loopback comptant les requêtes et runtime Electron jetable sans fenêtre/profil personnel si possible ; source versionnée net-fetch.ts et electron_api_url_loader.cc de Electronv45.0.0. Sinon garder l’accès origine inconnu, pas de succès fictif.
- `qualification-cache-reseau/` sous l’initiative : unique propriété de l’implémenteur pour prototype, scénarios, sources et rapport ; le plan peut recevoir ses notes et tâches, bloc figé inchangé. D’autres agents travaillent dans le dépôt : ne pas réverter leurs éditions ; aucun changement hors de cette propriété. Les rapports de revue sont réservés aux relecteurs.

## Tasks & Acceptance

**Execution:**
- [x] `../qualification-cache-reseau/sources.md` — noter les sources officielles et versions effectivement examinées ; séparer défauts de bibliothèque, directives serveur observées ou inconnues et décisions candidates.
- [x] `../qualification-cache-reseau/prototype.mjs` — qualifier les options avec ports/horloge/stockage local simulés et vraies signatures, sans import produit vers le prototype.
- [x] `../qualification-cache-reseau/scenarios.test.mjs` — couvrir M1–M6 avec compteurs et assertions observables ; écrire les résultats expurgés dans results.json et conserver le journal de commande.
- [x] `../qualification-cache-reseau/electron-http-cache.cjs` — comparer default/no-store/reload dans Electron45 sur serveur loopback avec cache frais puis serveur arrêté ; profil temporaire possédé et nettoyé, aucune fenêtre/connexion personnelle ; consigner séparément le résultat réel ou sa limite.
- [x] `../qualification-cache-reseau/rapport.md` — répondre à la question et aux quatre critères du ticket, comparer gains/limites selon temporalités explicites et conditions nécessaires avant intégration ; transmettre à2.1 sans modifier son scope.
- [x] `../qualification-cache-reseau/matrix-audit.md` — relier chaque ligne M1–M6 aux tests exécutés, sans saut ; contrôle indépendant sécurité en plus de la revue Quick, puis correction/recontrôle des seuls constats pertinents.

**Acceptance Criteria:**
- Given le programme livré sans cache applicatif, when les stratégies candidates sont évaluées dans les mêmes scénarios, then le rapport donne les GET/POST mesurés et leurs hypothèses sans présenter ces comptes comme des validations Zscaler économisées sur le poste.
- Given chaque état et échec M1–M6, when le prototype et les vérifications de code livré sont exécutés, then toutes les assertions attendues passent, y compris refus, absence de rejeu et conservation, ou une option est explicitement non retenue/conditionnelle sur un contre-exemple conservé.
- Given la fin du spike, when le contrôle parent et les revues sont relus, then les sources produit, dépendances et artefacts livrés sont inchangés, aucun compte/modèle/réseau personnel utilisé, et les prérequis d’une éventuelle intégration sont séparés du prochain Build2.1.

## Implementation Notes

- Plan validé sous le mandat autonome existant ; baseline canoniquee2d9367176a93862b9a108fcef16715ff2675a66, bloc figé SHA256f3ca97273a80a23d363dcc638a6746b6ff335cd54fe5ca441acee4182fc8d552 inchangé. Routefull, revueQuick épinglée, contrôle sécurité supplémentaire.
- Prototype et essais isolés réalisés par le même implémenteur, puis parent :16/16sans saut et23contrôles ;107inputs produit identiques. Banc Electron45 loopback séparé :default peut servir200serveur arrêté,no-store/reload détectent la coupure ; profil final nettoyé. Les deux démarrages limités antérieurs et l’instrumentation native pré-JavaScript incomplète restent explicites.
- Q1Quick corrigé par le même implémenteur et recontrôlé résolu ; complément du même relecteur sécurité favorable, aucun constat restant. Aucun correctif de ce lot différé. Cache mémoire et diagnostic forcé qualifiés localement sous conditions, persistance non fiable non retenue ; crash avant sauvegarde, headers/cadence personnels et bénéfice réel Zscaler non prouvés. Ces limites ne deviennent ni cache intégré ni récupération autonome livrée.
- Conclusion parent dans ../qualification-cache-reseau/parent-verification.md ; prochain workflow demandé2.1, sans changement du découpage des17entrées ni de la clôture de l’epic1. Aucun compte, connexion personnelle, modèle ou paquet modifié par la qualification.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Route | Preuve et disposition |
|---|---|---|---|
| Q1 — disponibilité des clés avant chaque rotation candidate | medium | patch | `oauth.ts/getKeys` retourne immédiatement le resolver fourni ; M5.2/M5.3 le fournissent et ne préchargent qu’une fois. Une nouvelle intention sur cache froid/périmé peut donc POST avant le GET bloqué, contrairement à M5. Cause vérifiée dans le callback et son appelant. Corriger uniquement l’assemblage expérimental par précontrôle à chaque intention et prouver cache absent/périmé bloqué →0POST ; aucune nouvelle API produit. Recontrôle du même Quick requis. |
| Q1 — recontrôle | medium | patch résolu | Même implémenteur, assemblage privé `refreshCandidate` vérifiant les clés à chaque intention. Rouge14/16 conservé, puis parent16/16 et23vérifications ; M5.3 cinq modes dont froid/périmé bloqués→0POST/0écriture/0probe, M5.2 reste2GET/1POST. Le même Quick confirme « Q1 résolu ». Aucun autre constat de ce lot ni code produit modifié. |

Le contrôle sécurité supplémentaire indépendant n’a signalé aucun constat ; son avis reste borné à la qualification isolée et ne remplace pas Q1 ni son recontrôle. Les limites de rotation/crash/premier démarrage natif restent conservées.

## Design Notes

Une qualification peut conclure qu’un cache persistant requiert une frontière de confiance supplémentaire ou qu’une rotation reçue avant vérification crée un état à traiter avant livraison. Conserver ces conclusions ; ne pas étendre le spike à une nouvelle persistance de secrets ou à l’installation d’un cache. Les options peuvent être disqualifiées par une assertion qui démontre leur limite, mais pas par un test ignoré ou une attente modifiée pour masquer un défaut.

## Verification

**Commands:**
- `node --test _bmad-output/initiative-madness/qualification-cache-reseau/scenarios.test.mjs` — toutes les lignes couvertes, aucun saut/échec ; sorties expurgées.
- `git diff --name-only e2d9367176a93862b9a108fcef16715ff2675a66 -- src tests scripts package.json package-lock.json resources` — aucune modification produit ni harnais permanent.
- `git diff --check` sur les seuls livrables — aucun défaut hors journaux bruts conservés.

**Manual checks:** comparer les SHA des sources observées aux inputs du rapport ; vérifier les références, chiffres, distinction cache/HTTP/rotation et absence d’accès personnel. Contrôle indépendant adversaire des frontières de confiance et du POST incertain, sans nouvel essai externe.
