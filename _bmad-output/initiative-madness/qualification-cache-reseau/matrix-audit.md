# Matrice exécutée et contrôles — qualification isolée

Référence : plan `../backlog/spike-qualifier-cache-et-recuperation-reseau-plan.md`, baseline `e2d9367176a93862b9a108fcef16715ff2675a66`, bloc figé non modifié par l’implémenteur. `context: []` ; toutes les sources de sa carte de code ont été chargées. Les autres agents conservent leurs fichiers ; aucune édition produit.

## M1–M6 sans saut

| Ligne | Tests effectivement exécutés | Assertions / preuves principales |
|---|---|---|
| M1 Gain et stockage | M1.1, M1.2 | Quatre intentions de refresh à cadence fictive avec vraie validation : 4/2/2/4 GET, 4 POST pour chaque option, 2 réponses304 en revalidation. Réouverture simulée, persistance rejetée. Sensibilité 1/5/10 min ; absence headers sans durée inventée. Vrai service + faux credential3600 s :4dialogues→1 GET/1 POST/1 écriture. |
| M2 Fraîcheur | M2.1, M2.2, M2.3 | Âge/délai/Date et frontière exacte, réseau échoué sans extension ;8 cas de directives ;no-store sans stockage ; horloges wall/mono reculées immédiatement ou après hit ; clone isolé et persistance altérée refusée. |
| M3 Clés et identité | M3.1, M3.2, M3.3, M3.4 | Signatures RS256 réelles, huit identités invalides refusées ;kid connu/inconnu/retiré, récupération bornée ;7 jeux invalides,0POST ; contre-exemple jose `jwksCache` futur/sans liaison URL accepté avec0GET, option persistante disqualifiée. |
| M4 Transport/concurrence | M4.1, M4.2, M4.3 | Vrai `createTransport` et candidat rejettent307/HTML/JSON/tailles ; contraintes URL/options observées ;timeout accéléré20ms ; annulation indépendante et dernier appelant ;coalescence1GET ; contrôle forcé distinct. |
| M5 Rotation | M5.1 (avant/après), M5.2, M5.3 |0POST avant clés ; assemblage privé vérifiant le cache à chaque intention, cache absent/expiré + GET bloqué→0POST ;au plus1POST par intention ; réponse perdue séparée de reçue non validée ;kid nouveau livré échoue, candidat2GET/1POST possible ;cinq modes d’échec conservent faux coffre,0écriture/0probe ; crash avant sauvegarde explicitement non résolu. |
| M6 Récupération/conservation | M6.1 | Cache frais + contrôle307 puis200 :3GET totaux ; état attente `unknown` inchangé ;aucun OAuth/refresh/probe ; lectures réussies et contrat Snapshot/reply validés, texte du brouillon exact après réouverture ; reprise bloquée par vraie garde. |

**16 tests Node, 0 saut ; 18 observations sérialisées** (M5.1 publie aussi ses deux sous-cas). Les nombres, versions et SHA des inputs viennent de `results.json`. `electron-results.json` ajoute une mesure native distincte ; elle n’est ni un dix-septième test Node ni un scénario réseau personnel.

## Exécution et corrections observées

- `scenarios-red.log` : absence du candidat constatée avant implémentation ; assertion comportementale d’entrée rouge, autres erreurs de symbole manquant et caractérisations produit conservées.
- `scenarios-first.log` : premier candidat,15/16 ; le test d’export de clé privée synthétique échoue car la fixture WebCrypto n’est pas extractible. La fixture seule est rendue extractible ; aucun secret réel.
- `scenarios-clock-red.log` : cas ajouté de recul **après** un hit,15/16 ; le prototype ne gardait que l’instant de création. Le dernier instant observé est désormais contrôlé ; aucun rallongement après recul.
- `scenarios-green.log` : premier16/16. Cette version ne prouvait pas encore la lecture du brouillon : la comparaison seule aurait pu comparer deux refus de lecture.
- `scenarios-conservation-red.log` : contrat Snapshot et succès ajoutés,15/16 ; nom de champ de fixture erroné (`updatedAt`). Correction en `savedAt`, assertion du vrai contrat et du texte lu avant/après conservée.
- `scenarios-final.log` : exécution finale à réactualiser avec tout changement de revue ;16/16, aucun saut/échec. Les journaux antérieurs restent historiques, pas des preuves équivalentes de conservation.
- `scenarios-review-preflight-red.log` : reproduction du constat de revue,14/16 ; fournir directement le resolver court-circuitait le GET pré-POST livré, masqué par les préchargements. L’assemblage expérimental privé vérifie désormais les clés à chaque intention avant ce passage ; M5.3 couvre cache absent et expiré avec GET bloqué et0POST, en plus des trois échecs conservés. Les préchargements des parcours de rotation sont retirés. `scenarios-final.log` est réactualisé après cette correction ; le total reste16tests/18observations, les cinq modes étant détaillés dans la même observation M5.3.
- `electron-initial-limit.*` et `electron-sanitized-limit.*` : démarrages restreints limités, profils nettoyés. `electron-command.log` / `electron-results.json` : exécution native autorisée réussie ;default1origine/2lectures puis cache200serveur arrêté ;no-store/reload2origines puis erreur.0fenêtre,0requête externe,profil possédé nettoyé. Aucune cause externe inventée.

## Critères du ticket

| Critère | Livrable / décision |
|---|---|
| 1 Comparaison et garanties | Rapport, tableau M1, sensibilité et cadence service synthétique ;sources.md sépare cache HTTP/applicatif, défauts jose, politique serveur inconnue et candidats. |
| 2 Cas décisifs exécutables | Tests M1–M4, logs et results.json ;options conditionnelles/non retenues via contre-exemples exécutés, aucun test ignoré. |
| 3 Aucun effet incertain réémis | M5/M6, vrais refresh/connexion/cœur avec faux ports ; POST perdu/non validé distingués,0rejeu,0probe ; conservation locale positive. |
| 4 Conclusion bornée et transmission | Rapport : limites et prérequis séparés de2.1 ;préservation produit ;revues Quick/sécurité et décision Sofia **à compléter par le parent**, aucun verdict supposé. |

## Vérification de préservation

Commandes prévues/exécutées par l’implémenteur :

```powershell
node --test _bmad-output/initiative-madness/qualification-cache-reseau/scenarios.test.mjs
node _bmad-output/initiative-madness/qualification-cache-reseau/electron-http-cache.cjs
git diff --name-only e2d9367176a93862b9a108fcef16715ff2675a66 -- src tests scripts package.json package-lock.json resources
git status --short -- src tests scripts package.json package-lock.json resources
```

Les deux dernières commandes n’émettent aucun chemin. Les inputs locaux sont empreintés dans results.json ; leur vérification aux octets courants et le contrôle whitespace des seuls livrables sont consignés dans `verification.json`/`verification.log`. Aucun build, installation, coffre lu/déchiffré/copied ou appel de la connexion personnelle. Les seuls profils créés par le banc sont sous cette propriété et retirés par leur propriétaire après sortie.

`node _bmad-output/initiative-madness/qualification-cache-reseau/verify.mjs` réexécute les contrôles de préservation, de SHA, de résultats et de whitespace. Le premier lancement Electron héritait encore de l’environnement avant son arrêt natif ; ses chemins n’ont pas pu être confirmés. Cette limite d’instrumentation avant JavaScript est explicite dans le rapport, sans prétendre une preuve d’absence absolue d’effet natif sur cet essai. Le banc final redirige également les chemins natifs avant démarrage.

**Revues :** réservées aux relecteurs indépendants. Le parent complète les liens et le triage après Quick et sécurité ; l’auteur ne rédige pas leur verdict et ne marque pas le spike built.
