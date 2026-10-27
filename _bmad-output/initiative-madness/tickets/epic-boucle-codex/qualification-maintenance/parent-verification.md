# Vérification parent — maintenance1.9

État : story1.9 built le28octobre2026, paquet0.1.1 installé et restauré. L’epic et ses gates restants ne sont pas déclarés clos.

## Réalisation et revues

Version0.1.1, electron-builder26.18.0 et jose6.2.13. Electron45.0.0 / Chromium156.0.8078.48 conservés et mesurés ; aucune montée Chromium prétendue. Types/build/NSIS ont réussi dans `build-final.log`, installation npm propre dans les journaux parent. Les trois patches ultérieurs changent seulement le banc et ses tests : le binaire qualifié demeure identique. Le manifeste a été régénéré après ces changements d’entrées.

Quick frais : Q1, paquet hybride accepté ; Q2, création partielle non nettoyée. Contrôle indépendant : A1, intermédiaires Chromium/coffre susceptibles d’être liés. Le parent a vérifié les trois défauts et classé medium/patch. Même implémenteur réengagé, régressions observées RED→GREEN, fichier maintenance9/9. Les mêmes relecteurs confirment les trois corrections résolues par inspection des appels et tests ; aucun défaut correctif de ce lot différé. Aucun changement du bloc d’intention figé.

Le contrôle indépendant final rapproche les cinq reçus NSIS/A/B/personnel/manifeste : conforme dans leurs limites, sans exécution ni lecture personnelle par le relecteur. Son besoin de rattacher la baseline pré-NSIS aux digests de réouverture est explicité dans `installation.json.personalBaseline` sans nouvelle installation ni coffre relu. Les comparaisons PowerShell sont par fichier ; le digest complet est recalculé par le contrôle de réouverture sur la même baseline.

## Remplacement réellement installé

Programme : `C:/Users/UP60066553/AppData/Local/Programs/Madness/Madness.exe`. A0.1.0 a été exercé à ce chemin, puis l’installateur B a remplacé cette même installation, sortie0. Il ne s’agit pas de deux dossiers unpacked présentés comme des installations. La commande A exacte est jointe au reçu ; son rapport historique ne capturait pas appPath, limite conservée.

- A ASAR : `072623b1b64be3eaecd72152f48d276c5f377dddd7b1893070458e1a668c91c1`.
- B ASAR : `bbac088b9dd9a6c3ad66871dc2db27956378f3a29967df2a734b1e14d007b639`.
- Installateur B : `8e3fc5145cd8c4bb19341c4c9be53b8df5b4d9f9f2032a4e9ee90c380b4ecb3a`.
- Runner externe : `6d1ebd4e04594ea3f15a39e6e8a1e71ac06a3f0fc8705a7495da47d854ccaed5`.

`installed-a.json`6/6 et `installed-b.json`7/7 : douze fichiers durables et deux projections strictement identiques, avant navigation et après fermeture. Questions/accords historiques inactifs, propriétaire réellement inconnu conservé, coffre synthétique lisible, aucun enfant/réseau après instrumentation. B a nettoyé le seul workspace synthétique réservé BIDLQW.

`personal-reopen-profile.json`7/7 : profil normal sans MADNESS_DATA_HOME, véritable Main0.1.1 identifié, compte lisible, MIA/madness seuls, aucune conversation ni brouillon actif ajouté. Vingt-sept entrées critiques identiques avant NSIS, après NSIS et après réouverture/fermeture ; digest `4821a02c986cddc917e4076db7639c0a16981ce341d3d715af830a0a4a5060b3`. Aucun coffre copié, aucune capture personnelle, aucun modèle externe, refresh ou consentement. Fenêtre de contrôle fermée et PID Main absent observé.

## Tests et limites

Avant revue : suite stable297/297. Après patches : `unit-tests-post-review.log`299/300 ; Windows refuse la réécriture du faux PE du test historique de détection (`UNKNOWN`, open à la ligne75), sans défaut produit démontré. Le même test réussit en isolation1/1 (`probe-discovery-isolated.log`), sans modification. La confirmation complète sur les mêmes sources figées passe300/300, sans échec, annulation, saut ni todo (472132ms), dans unit-tests-post-review-confirmation.log. Le premier échec reste conservé ; aucune cause antivirus n’est déduite. types-post-review.log réussit également.

Sur le paquet final avant patches du banc : A6/B7 unpacked, sauvegarde4/4, Windows5/5, vrai runner0.144.6 loopback4/4. Les patches ne modifient aucun code produit ni ressource emballée. Le vrai couple installé A/B recontrôle ensuite la garde renforcée de B, le runtime et les données. La sauvegarde réelle refuse le rename Windows sans partage suppression : ancien durable/révision exacts, temporaire nettoyé, saisie non enregistrée visible, reprise par nouveau clic seulement. Futur/corruption/UTF-8 refusés dans six stockages ; v1 positif, aucune migration inventée.

GET Main public explicite200 après remplacement, sans action humaine ni refresh. Ce résultat est séparé des trois requêtes Responses127.0.0.1 et de l’arrêt du runner natif ; aucune connectivité externe fraîche de Codex n’est déduite du loopback. Les compteurs commencent après les hooks et ne prouvent pas ce qui précède l’instrumentation.

Pas de nouveau parcours visuel dans cette story : aucune passe Sally ni refonte Impeccable globale déduite. Gates1.1/1.2 et dépendances1.10/1.11 conservés ; distribution du code privé, R32, Loop et graphe gardent leur cadrage.
