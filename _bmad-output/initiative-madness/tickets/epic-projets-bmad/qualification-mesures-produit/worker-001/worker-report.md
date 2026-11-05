# Mesures produit 2.11 — compte rendu du worker

Les trois contextes du plan ont été lus intégralement, ainsi que le contrat UX epic2-metrics et les deux références TDD demandées. Le plan reste inchangé et le parent possède les revues, statuts et commit.

Implémentation : contrat métriques v1 séparé ; preuve privée de type story liée aux déclarations brutes et aux identités physiques ; références opaques de choix liées à une requête, son texte, son opération et son contexte ; occurrences distinctes après rupture observée ; reçus monotones privés pris dans DialogueRpc.receive ; cumul sans doubles comptes, contradictions explicites ; annexe par projet avec registre et tours atomiques, CAS et bail d'écriture exclusif. Les dernières sauvegardes réussies sont distinguées de la copie en mémoire. Les lectures/reprises sont passives.

Le pont expose madnessUsMetrics.read/retrySave/choose/onChanged et les méthodes explicites sendMeasured/launchMeasured/adjustMeasured de madnessDialogue. choose prend une MetricOperation stricte et renvoie une choiceRef consommable une seule fois. Les anciennes commandes de dialogue restent admises et non attribuées. Le cœur fournit les résumés, périmètres US/conversation, raisons d'inconnu, résultats terminaux et durabilité par tour. Les candidats qualifiés et les motifs d'inadmissibilité restent distincts des références historiques.

Aucun TSX/CSS, thème, asset, paquet, dépendance, fournisseur, permission, compte, profil personnel ou installation modifié. Le build compile seulement out/. Aucun nouvel installateur/candidat dist. Les anciennes preuves 2.10/2.12 ne sont ni repinnées ni rejouées comme preuves de ce produit.

| Matrice | Vérifications effectivement exercées |
|---|---|
| T1 | Helper fermé Windows réel : type/ligne/source/identité ; preuve privée absente du v1 public ; clone sans autorité ; doublons nouveaux hors source choisie refusés au recontrôle intégral. |
| T2 | Entrée sans feuille ; titre/révision conservant l'occurrence ; couverture partielle sans disparition déduite ; absence complète/retour ; remplacement physique, déplacement et racine remplacée. |
| T3 | Choix explicite consommé une fois, texte/opération/conversation corrélés ; retrait invalidant l'ancienne référence ; tour suivant non attribué ; preuve et fraîcheur recontrôlées avant effet. |
| T4 | ACK1000 → terminal601000 =600000ms ; vrai zéro ; failed/interrupted distincts de la durée ; même chunk avec callback ACK bloqué ; bornes prises avant continuation/drain. |
| T5 | Close estampillé à l'événement enfant et admis seulement après confirmation propriétaire ; absence de close observable sans borne ; terminal connu conservé malgré close ultérieur. |
| T6 | Alias locaux de la même identité native comptés une fois ; attributs contradictoires non attribués ; résultat indépendant de l'ordre ; notification terminale native répétée avec horloge avançante dédupliquée avant estampille ; charge différente avec hash de provenance conservé. |
| T7 | Deux tours parallèles 10+10min=20min ; domaines distincts → chevauchement inconnu ; cumul partiel 1 connu/2 inconnus ; tous inconnus et aucun identifié sans zéro inventé. |
| T8 | Vrais fichiers atomiques ; deux stores concurrents ne gagnent pas le même CAS (8 essais) ; bail étranger conservé ; données futures/corrompues/liens refusés ; write lent/échoué, RAM conservée et réessai de sauvegarde seul ; ancienne écriture ne promeut pas les nouvelles bornes. |
| T9 | Deux projets/deux initiatives/conversations distinctes ; fermeture/réouverture de vraies annexes ; mêmes références/sources/totaux ; cycle complet Application→JSONL double local→store→réouverture sans nouveau tour. |
| T10 | Commandes strictes refusant chemins/type/horloge usurpés ; payload temporel natif et terminal étranger ne fabriquent pas de borne ; suites Mary/Forge/aide/questions/approbations/catalogue/contexte/lifecycle ciblées. |

Les doubles JSONL et preuves de source de test sont nommés comme tels. Ils ne sont pas des reçus SIWC. Durée native, usage et coût restent indisponibles ; aucune redistribution de l'abonnement ou d'un agrégat compte. La détection universelle d'un réemploi silencieux reste impossible. Un bail étranger/périmé est conservé comme conflit ; aucun déverrouillage forcé automatique n'est ajouté.

Les rouges utiles réellement observés sont transcrits dans red-observations.json (provenance explicite : transcript des appels, pas faux fichiers bruts de runs). worker-inputs.json conserve les 17 empreintes finales. Le diff UTF-8 a été contrôlé : aucune ligne non ASCII ajoutée dans les fichiers de production existants ; prompts et descriptions d'outils conservés. Seul progress.py a un nouveau pin ; les 16 ressources du manifeste sont exactes. git diff --check passe sur les fichiers possédés, avec les avertissements autocrlf habituels uniquement.

Le test hérité tests/bmad-context-profile-scope.test.mjs:48 écrit à chemin fixe dans _bmad-output/initiative-madness/.working/context-review-loop1-profile-scope-final/receipts.json. Son résultat neuf est retenu dans fresh-context-profile-scope-receipts.json ; le reçu historique a été restauré depuis la copie préalable, SHA256 avant/après 81a7c32fb977857a2682cb9eed792ab1669fc6dd4b8e8c184cc745919c5e55a6. Voir historical-receipt-preservation.json. Le parent doit préserver ce même chemin lors du npm test global.

Vérification finale : npm run build passe après la correction du store et la séparation résultat terminal/close. Les cinq contrôles ciblés finaux de projection, cycle JSONL produit, concurrence CAS, bail étranger et résultat terminal passent. Le test réel d'autorité complète a passé en 75,5s après son correctif ; aucune ressource concernée n'a ensuite changé. La campagne ciblée de dépendances a démarré avant les deux dernières corrections : son résultat sera consigné séparément et ne représente pas une campagne globale du dernier code. Le parent doit encore faire son unique npm test global, les revues Quick/high et leurs éventuels retours ; aucune acceptation humaine/UI/G2–G5 n'est déduite ici.

Campagne de dépendances terminée : **293/293**, zéro échec/saut, exit0, 746,6s ; journal exact targeted-tests.log. Elle ne remplace pas le npm test global final du parent. Aucune suite large répétée après succès.
