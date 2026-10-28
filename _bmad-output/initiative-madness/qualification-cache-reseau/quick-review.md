# Revue Quick BMad

- `scenarios.test.mjs:297` — L’assemblage candidat peut envoyer le POST avant de vérifier la disponibilité des clés. Le callback fournit `jwks: cache.resolver(abort)` ; dans `oauth.ts`, `getKeys()` retourne immédiatement tout resolver fourni, tandis que ce resolver ne consulte le cache qu’au moment de valider la réponse reçue après le POST. Les préchargements ponctuels masquent ce cas : si le cache expire avant une nouvelle intention et que le GET est bloqué, la rotation part malgré tout. M5 exige pourtant zéro POST avant disponibilité des clés, et la matrice présente cette garantie comme acquise. Vérifier les clés dans chaque intention avant le POST et couvrir le cache absent ou expiré avec transport bloqué, ou conserver ce contre-exemple comme limite explicite du candidat.

Relecteur frais, inspection seulement ; aucun test, application ou modification par ce relecteur. Triage et recontrôle consignés séparément par le parent.

## Recontrôle ciblé

Après correction par le même implémenteur et lecture du delta140lignes, le même relecteur rend : **« Q1 résolu. »** Le parent a lu le delta, les gardes et les assertions, puis confirmé16/16 dans `parent-scenarios-q1.log` et23contrôles. Aucun autre constat signalé ; les preuves initiales restent historiques.
