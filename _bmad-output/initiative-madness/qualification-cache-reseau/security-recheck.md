# Complément sécurité ciblé — préchargement avant POST

**Statut : constat Quick de préchargement ponctuel corrigé et recontrôlé résolu dans l’assemblage expérimental privé.** Aucun constat résiduel sur ce delta : `[]`. Avis favorable au complément de qualification isolée. `security-review.md` reste historique ; son appréciation du préchargement candidat était insuffisamment étayée et doit se lire avec ce complément.

Lecture intégrale du delta fourni `patch.diff` (SHA-256 `6c31ea80987e06b86bcdbcbc8681d892a5ab5e3766cb4518adaa74dd318513ef`), de son entourage M5 et du passage `getKeys`/`refreshCredentials` livré. Inspection seulement : aucun test, application, réseau, profil personnel ou coffre exécuté/inspecté ; seule la présente note est écrite. Aucun nouvel audit complet.

## Correction et preuves

- `src/adapters/codex/oauth.ts:62` retourne immédiatement le resolver fourni. Le commentaire et l’assemblage privé `scenarios.test.mjs:28` reconnaissent ce contournement et exécutent désormais `await cache.get(options.signal)` **pour chaque intention**, avant l’appel à `refreshCredentials`. M5.2 et le port `refresh` de M5.3 passent tous deux par cet assemblage (`:286`, `:305`).
- `scenarios.test.mjs:295` ajoute cache absent et cache expiré avec GET bloqué. Le chargement préalable du seul cas expiré (`:301`) construit cet état ; la nouvelle intention repasse bien par le contrôle. Les assertions `:313`–`:317` exigent respectivement 1/2 GET, **0 POST, 0 écriture, 0 probe**, faux coffre identique, compte présent et absence de POST supplémentaire à l’arrêt.
- M5.2 conserve la vraie validation cryptographique du jeton portant le nouveau `kid` : le premier GET précède la rotation, le second récupère les clés après sa réponse, avec **2 GET / 1 POST** (`scenarios.test.mjs:275`, `:289`). Les trois échecs antérieurs restent distingués : POST perdu, nouvelle clé bloquée et scopes insuffisants.
- `scenarios-review-preflight-red.log` conserve la reproduction à 14/16 : ancien assemblage à 1 GET / 1 POST au lieu de 2/1 et POST émis malgré cache absent bloqué. `scenarios-final.log` puis `parent-scenarios-q1.log` donnent 16/16 sans saut après correction. `results.json` contient les cinq modes M5.3 attendus ; les 23 contrôles de `verification.json` sont tous favorables. Ces résultats sont lus dans les preuves fournies, sans réexécution par ce relecteur.

Le delta met à jour les assertions, les mesures et leur description sans modifier le prototype ni le code produit. Les préchargements ponctuels retirés ne servent plus de preuve de l’ordre avant POST.

## Limites conservées

La réponse reçue mais non validée reste distincte du POST à issue inconnue. Le crash avant stockage durable demeure explicitement non résolu ; aucune conservation de secrets ni récupération autonome n’est démontrée. Les limites natives avant JavaScript, l’accès origine OpenAI et le bénéfice Zscaler réel restent inchangés. Ce complément ne démontre aucun cache livré ni nouvelle sûreté du produit personnel.
