# Vérification du livrable 3.1 — préparation par le worker

Statut : profil local candidat vérifié, à relire par le parent et ses relecteurs. Ce document rapporte les contrôles du worker ; il ne prétend ni Quick ni audit indépendant déjà rendus. Le worker n’a modifié ni plan, ni statut, ni AGENTS, ni deferred, ni git, et ne crée aucun commit. Le parent garde ces responsabilités et le commit local sans push.

## Résultat vérifié

Run principal : `proofs/run-2026-11-05T13-30-02-191Z-69b533a0/`. Son `result.json` atteste la fermeture des cinq enfants journalisés et le nettoyage des copies privées longues/courtes. `cases.json` contient onze observations ciblées. L’effet vérifié est l’ajout exact de 462 fichiers et 126 répertoires dans un seul témoin, conservation des deux fichiers sentinelles, absence du lock de source privée transféré et admission du pilote Mary par les octets. Les trente dossiers Skills sont 27 compétences présentes et trois records de métadonnées. `bmad-retrospective` reste absent ; aucun workflow n’a été exécuté.

| Plan | Observation conservée | Portée de la conclusion |
|---|---|---|
| I1 source/outillage | source-manifest.json, tool-manifest.json, tool-manifest-sealed-readback.json, skills-imports.jsonl, python-version.json | Bundle local par octets ; amont non établi. 578 fichiers outillage identiques ; 85 fichiers chargés identifiés. |
| I2 préparation | private-before-skills.json, private-after-skills.json, private-after-setup.json, short-staging.json, deux journaux de mutations réussies | Skills puis setup normal en privé ; cible intacte avant accord. Aucun status/source-record/update/npx. |
| I3 annulation | cases.json / I3 | Accord synthétique vérifié, aucune application, cible byte-identique. |
| I4 application | transfer-plan.json, positive-result.json | Identité/préconditions et hash de plan relus ; arbre exact et sentinelles conservées. |
| I5 refus | cases.json / I5 | Collision, source distante/liée, sorties hostiles, cible/parent réorientés refusés par le banc avant effet cible. Pas une protection native de l’outil. |
| I6 incomplet | cases.json / I6 et stderr/commands des essais échoués | Précondition modifiée refusée sans écriture du banc ; échecs de préparation observés, interruption pendant application non qualifiée. |

`setup-report.json` dit current=true sans problème ni exigence obligatoire manquante, mais recommande encore le membre absent. Ce rapport n’est pas utilisé seul comme preuve de succès. `positive-result.json` compare l’arbre final et l’admission locale ; aucun modèle/résolveur n’a été lancé.

## Erreurs réelles et corrections ciblées

- Le run préliminaire `run-2026-11-05T13-29-04-175Z-237d7d0b` échoue avant chargement CLI : --import Windows exige une URL file:. Commande code1 fermée, cible identique et copies nettoyées dans `closed-cleanup.json` ; erreur brute conservée.
- Le run principal copie Skills exactement une fois. Setup profond refuse d’abord un fichier existant, puis sa promotion avec chemins étendus. Ces codes1 restent visibles avec leurs argv/stderr/mutations ; la cause précise du refus WinError5 n’est pas prouvée. Le témoin vide de renommage ne la résout pas et ne vaut pas compatibilité chemins longs.
- Sous autorisation du parent, les mêmes copies sont transférées par octets dans Temp court. Le garde court refuse d’abord l’alias8.3 ; canonicaliser ce Temp résout le désaccord. Setup court code0, sans relancer Skills ni changer l’outil ou Windows.
- Après application complète déjà vérifiée, une erreur de rapport traitait un LICENSE d’outillage comme chemin relatif. Le reçu d’échec `failure-5.json` reste conservé ; seules les gardes et les lectures finales sont reprises par --finalize. Aucun effet positif rejoué. Le manifeste absolu corrigé est reconstruit par comparaison ordonnée exacte avec le manifeste initial et les bornes de paquets du lock ; ses 85 imports réellement exécutés concordent tous.

## Vérifications exécutées et fermeture

Commande de base : `node _bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation/qualifier.mjs` ; reprises ciblées `--resume run-2026-11-05T13-30-02-191Z-69b533a0` après échecs de préparation, puis `--finalize` après l’erreur de rapport. La dernière finalisation termine code0 avec onze observations, closed=true et ownedCopiesRemoved=true. Aucun npm test/build/NSIS, campagne native produit, capture ou benchmark n’est exécuté.

La finalisation relit le bundle source exact et les 578 fichiers scellés avant suppression. `preservation.json` contient les empreintes et la portée des gardes. Le premier run a une fermeture/nettoyage séparée ; il ne reste aucun `.owned-*` de ce lot et le Temp nommé a été supprimé. Les seuls fichiers de ce livrable et preuves restent sous qualification-initialisation/. Les chemins périmés des reçus servent de preuve historique, jamais de configuration transférable.

Contrôles courts après correction du code de rapport : syntaxe des deux .mjs, parse AST du garde Python (`py -X utf8 -B -I -S`), reconstruction exacte du manifeste d’outillage et correspondance des imports : réussis. `git diff --check` a été appelé sur la seule racine du spike, sans erreur ; ces fichiers étant nouveaux/non suivis à ce stade, le parent doit effectuer son recontrôle après sélection/staging. Aucun scénario natif n’a été répété après réussite pour obtenir une nouvelle couleur verte.

La portée des écritures du code et des journaux reste les fixtures, le Temp possédé et les preuves. Les sources BMad/npm-cache sont relues identiques, aucune écriture src/resources/contrat/IPC/persistance/produit/installateur/profil personnel n’est programmée. Le parent peut croiser ces constats avec son sceau indépendant. Le fichier concurrent tests/bmad-help-boundaries.test.mjs n’a pas été touché.

## Limites à conserver et suite parent

Le profil ne démontre ni transaction/rollback global, ni arrêt après effet, ni protection contre une mutation concurrente native, ni support général des chemins longs, ni tous les modules v7, ni mise à jour depuis le lock exclu. Les wrappers sont des gardes privées, sans sandbox OS. G3/G4/G5, dépendance2.16 du contrat3.3 et gate humain3.10 restent ouverts. Le profil et les points de passage pour Sally3.2/contrat3.3 sont dans profil-g3.md.

À compléter par le parent : Quick et audit indépendant du plan, portée, accord simulé, effets et provenance ; trier/corriger/recontrôler leurs constats ; comparer les inputs protégés ; mettre à jour plan/statut et faire le commit local sans push. Aucun verdict de ces revues ni built n’est anticipé ici.

Relecture parent ciblée : un scopefix a rendu explicitement au caller normal external/externalBefore depuis exerciseRefusals ; syntaxe Node et inspection des trois références passent, aucun outil ni application rejoué. `execution-seals.json` attribue les wrappers réellement scellés aux tentatives initiale/réussie et conserve les versions intermédiaires non épinglées comme limite ; les sources courantes corrigées ne sont pas présentées comme une nouvelle campagne complète.


## Clôture indépendante du parent — 5 novembre2026

Le parent a lu les sources écrites, rapproché les six lignes de matrice de onze observations et des commandes réellement fermées, contrôlé l’union exacte cible/payload et les sceaux utiles. parent-matrix-audit.json et parent-product-preservation.json portent ces contrôles : aucun diff produit et paquet2.15 conservé. Les copies de ce lot sont absentes.

Quick Q1 a été corrigé par le même worker puis scoré resolved par le même relecteur, uniquement pour le chemin futur : archive par tentative de wrapper/config/manifest avant spawn. Un test fictif court1/1 (535ms) observe l’exécution de la copie initiale après mutation du source, un enfant code0 et le nettoyage. Le parent relit le code et vérifie les trois hashs de source-patch-seal.json ainsi que les52empreintes de historical-before.json. Aucun Skills/setup/application réel n’a été rejoué. L’audit indépendant effets/provenance ne relève aucun constat actionnable.

Les deux wrappers historiques intermédiaires restent non récupérables ; le succès final ancien est scellé séparément et le qualifier corrigé n’est pas annoncé rejoué. Les essais longs sont dispensés par le porteur, pas réussis. Le résultat exploitable reste le profil local borné, avec limites explicites de provenance, chemins longs, concurrence, interruption et rollback ; aucun G2–G5 final ni accord humain acquis.
