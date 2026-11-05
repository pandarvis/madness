# Corrections privées Q1–Q4 — reçu worker

Runtime stable après dernier ajustement `ProjectLibrary.tsx` sur `latest.snapshot.problems`. Types/build/NSIS et manifeste003 relèvent du parent ; ce reçu ne promeut pas les preuves002 au futur ASAR.

- Q1 : même LanguageControl/provider dans les en-têtes natifs fichier (étroit/agrandi), acteur étroit, initiative, catalogue, navigation et rappel du forfait. Pointerdown conserve focus/sélection ; vrais clics, Tab puis Entrée dans les modales. Aucun nouveau port, état de langue ou autorité. Helpers UI/banc choisissent la modale native active, sinon `.topbar` ; aucun DOM.click pour la langue.
- Q2 : les six phrases exactes GraphCoordinator et le préfixe de panne locale borné sont présentés FR/EN. Le suffixe technique reste exact ; unknown original inchangé. Producteurs/protocoles intacts. Les sept cas sont aussi observés dans GraphPanel FR/EN.
- Q3 : la limite composée est reconnue seulement par égalité avec la composition de `latest.snapshot.problems`, sa source structurée exacte. Chaque élément reçoit le presenter diagnostic fermé, sans split, même si l’ancienne observation reste consultée. Les autres limites de bibliothèque délèguent aux mappings diagnostic existants après leur propre table. Chemins contenant ` · ` et erreurs directes vérifiés.
- Q4 : compteurs/tailles locaux explicites, variantes singulier/pluriel appariées. Aide, graphe, aperçu/reprise, numéros documentaires de catalogue, comptes de bibliothèque/récaps/annonce acteur. IDs, codes, lignes source, valeurs numériques d’entrée, clés et handlers conservés.

## Logs bruts retenus

Tous les chemins ci-dessous sont relatifs à ce dossier.

| Commande | Résultat / log |
|---|---|
| `node --test --test-name-pattern='Q2 diagnostics|Q4 compteurs' tests/language.test.mjs` | rouge2/2 dans `review-fixes-pure-red.log` puis vert2/2 dans `review-fixes-pure-green.log` |
| `node --test --test-name-pattern='Q1 langue' tests/connection-ui.test.mjs` | `review-fixes-modal-red.log` : premier cas rouge sur contrôle modal absent ; second échoue sur un locator de test ambigu, ensuite corrigé |
| `node --test --test-name-pattern='Q1 langue|Q3 langue' tests/connection-ui.test.mjs` | `review-fixes-ui-001.log` : Q1 vert2/2, Q3 rouge de montage (projet hors cible), aucun rouge produit Q3 inventé |
| `node --test --test-name-pattern='Q3 langue|Q4 langue' tests/connection-ui.test.mjs` | vert2/2 `review-fixes-ui-002.log` |
| `node --test tests/graph-ui.test.mjs` | vert2/2 `review-fixes-graph.log` |
| `node --test --test-name-pattern='Q1 langue|Q3 langue|langue : question native|langue : preference refusee' tests/connection-ui.test.mjs` | vert5/5 `review-fixes-ui-003.log` ; couvre focus/cursor Unicode et réponse tardive avec clic réel |
| `node --test --test-name-pattern='Q1 langue|Q3 langue' tests/connection-ui.test.mjs` | version finale vert3/3 `review-fixes-ui-004.log` ; vrais Tab/Entrée et arrivée de nouvelle observation |

Dix cas distincts ciblés passent (2purs,4UI nouveaux,2Graph étendus,2UI existants),0skip. Chaque banc renderer ferme les processus possédés et confirme aucun descendant avant suppression. Aucune suite globale, nouveau build worker, capture, détecteur ou action personnelle pour ces corrections.

## Détecteur existant — passage unique conservé

L’unique invocateur réel est `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/scripts/impeccable.cmd`, commande `detect --json src/renderer/src`. Sortie0, six avertissements préexistants dans `impeccable-detector.json`, stderr vide dans `impeccable-detector.stderr.log`. Deux groupes visuels et un détecteur au total ; aucune nouvelle capture pour ces corrections. Les anciens outputs worker UI/build initiaux n’avaient pas été conservés en logs bruts (reçus outils seulement) ; les logs parent persistés et les reçus natifs restent les preuves002, sans reconstruction fictive.
