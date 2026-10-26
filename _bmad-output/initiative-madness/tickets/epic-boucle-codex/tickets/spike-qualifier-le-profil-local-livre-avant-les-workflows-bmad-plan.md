---
title: 'Qualifier le profil local livré avant les workflows BMad'
type: 'chore'
ticket: '12'
created: '2026-10-26'
status: 'built'
baseline_revision: '31c309e79a92419be712a11a4190c5387818f072'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-boucle-codex/epic-boucle-codex.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les preuves personnelles du 24 octobre ne forment pas encore un profil de prérequis consommable par 1.3. La connexion SIWC, le dialogue Mary, le paquet préparé et l'installation historique doivent garder leurs portées distinctes.

**Approach:** Produire sous `tickets/epic-boucle-codex/qualification-profil-local/` un rapport, un profil JSON et une commande de recontrôle en lecture seule. Relier chaque acquis aux empreintes et contrôles frais, documenter les conditions officielles SIWC et conclure explicitement sur le commencement de 1.3.

Le profil porte sur la base de réalisation de 1.3, jamais sur une permission de lancer immédiatement un workflow documentaire avec le pilote Mary actuel. Il sépare versions déclarées, versions exécutées historiques, preuves intégrées passées et vérifications fraîches. Une installation actuelle non retrouvée ne devient ni une désinstallation prouvée ni une installation fraîchement vérifiée.

Les contrats, sources produit, dépendances, plans 1.1/1.2 et preuves historiques restent intacts. Aucun Codex, même `--version`, aucun OAuth, compte, coffre, refresh ou appel modèle ; aucun installateur ni fenêtre personnelle. Python/UV autorisés uniquement pour les resolvers BMad épinglés et tests isolés. Pas de certification, G0/G1 complet ou diffusion publique déduit du résultat. Si un prérequis local manque ou diffère, le rapport bloque le consommateur ; aucune correction produit n'est absorbée par le spike.

</frozen-after-approval>

## Implementation Notes

Route oneshot : livrables de qualification et moins de cent lignes prévues pour une commande de comparaison d'empreintes, sans modification du produit. Risque high : un faux profil positif ferait consommer une capacité non qualifiée. Mandat autonome conservé pour validations réalisables et commit local ; les fichiers non suivis BMad/Impeccable préexistants sont exclus du lot, arbre suivi initial propre.

Cartographie issue de deux investigations en lecture seule : `src/adapters/bmad/profile.ts` (`qualifyBmadProfile`, `resolveBmad`) et `runtime.ts` (`bmadRuntime`) vérifient le profil et les outils externes sans fournisseur ; `src/adapters/codex/probe.ts` (`findNativeExecutable`) vérifie le binaire sans l'exécuter. Les contrats v1, `JsonStore`, lifecycle, frontières Main/preload et tests correspondants sont réutilisés. `openCodexDialogue` et le coffre personnel ne doivent pas être appelés. Les bancs historiques qui écrivent leurs rapports ne sont pas relancés ; le mode Windows `--ui-regressions-only --skip-screenshots` ne les remplace pas.

Travaux prévus : inventorier preuves et fichiers non secrets ; vérifier leurs empreintes et qualifier Mary/runtime ; exécuter les tests ciblés et types ; contrôler le paquet préparé sur profil jetable si ses empreintes correspondent ; écrire `profile.json`, `README.md`, `verify.mjs` et les références officielles du 26 octobre. Relecture indépendante du résultat avant conclusion sur 1.3. Aucun nouveau workflow fonctionnel n'est démarré.

- 2026-10-26 — Inventaire de 78 fichiers et digest de 50 entrées de construction ; vrais resolvers Mary/config réussis, outils externes conformes. Le suffixe npm `-win32-x64` est relié explicitement à la dépendance du wrapper `0.144.6`, sans prétendre avoir exécuté la version actuelle. Archives et installateurs préparés correspondent aux preuves historiques ; emplacement personnel actuel non identifié, sans déduire une désinstallation.
- 2026-10-26 — Types et 24 tests ciblés passent ; cinq régressions Windows du paquet préparé passent et leur profil est nettoyé. Le vérificateur dédié ne lance aucun enfant, refuse un fichier altéré et un chemin hors portée ; deux témoins JSON jetables sont retirés après ces contrôles. Les rapports historiques et sources produit sont inchangés.
- 2026-10-26 — Profil, rapport et sources officielles écrits dans `qualification-profil-local/`. Conclusion limitée au commencement de réalisation de 1.3 ; invocation documentaire, compte/réseau actuels et installation personnelle restent non qualifiés. Le diff de revue inclut tous les fichiers de ce lot, y compris non suivis, et exclut uniquement les installations/caches non suivis déjà présents avant le démarrage.
- 2026-10-26 — Pendant la revue, contrôle supplémentaire de la portée du vérificateur : rejet des segments `.`/`..`, chemins absolus et séparateurs alternatifs avant toute lecture, y compris une traversée restant dans le dépôt qui aurait pu atteindre un fichier non autorisé. Trois cas négatifs repassent (empreinte, sortie de racine, traversée interne) avec nettoyage ; le profil et le rapport portent désormais ce résultat.
- 2026-10-26 — Revue Quick achevée au même niveau de modèle que la session, après relance d'un premier démarrage à capacité. Un constat confirmé et corrigé, aucun constat restant ou différé. Recontrôle positif du profil normal après correction ; les 78 fichiers, le runtime et les prérequis correspondent. Les contrôles supplémentaires ne relancent ni fournisseur, ni build produit, ni installation personnelle.

## Plan Change Log

## Review Triage Log

- Passage Quick : high 0, medium 1, low 0, false 0, maybe-false 0. Constat unique `medium` → `patch` : dans le vérificateur initial, un préfixe autorisé suivi de segments parents pouvait atteindre un fichier du dépôt hors liste admise. Cas atteignable via le profil témoin ; rejet lexical des traversées, absolus et antislashs ajouté avant toute lecture. Trois contrôles négatifs et le profil normal passent après correction ; relecture indépendante conforme. Aucun constat abandonné, aucune correction différée.

## Verification

- `npm run typecheck` ; tests ciblés `foundation`, `lifecycle`, `json-store-utf8`, `appearance`, `dialogue-profile`, `dialogue-runtime` ; mode Windows ciblé sur `dist/navigation-cleanup/win-unpacked/Madness.exe`. Consigner codes de retour, nombre de contrôles et nettoyage ; aucun succès historique présenté comme nouveau test.
- `node <qualification-profil-local>/verify.mjs` : comparer les empreintes annoncées aux fichiers explicitement autorisés, sans processus fournisseur ni lecture arbitraire ; échec ferme si fichier absent ou différent. Exercer cet échec avec un profil témoin altéré dans un espace jetable, puis le nettoyer.
- Given les preuves disponibles, when le profil est lu, then chaque acquis indique source, date, portée, versions et limites ; la version Codex fraîche reste déclarative sans exécution.
- Given les prérequis actuels, when les contrôles sont terminés, then la conclusion distingue commencement de réalisation de 1.3, contrôles frais avant invocation et capacités encore absentes.
- Given un prérequis absent, différent ou inconnu, when la commande recontrôle le profil, then elle échoue sans permission supposée ni modification du produit ou des preuves précédentes.
- Given les essais isolés, when ils se terminent, then les espaces témoins sont nettoyés, le projet et les profils personnels sont intacts et aucun fournisseur n'a démarré.
- Given le périmètre du spike, when le diff est inspecté, then seuls plan et artefacts de qualification changent ; aucun ticket ou gate n'est clos implicitement.
