# Qualification maintenance 1.9

Lot 0.1.0 → 0.1.1 du 27 octobre 2026. [Procédure reproductible](../../../../../docs/releasing.md). Le code privé, les identités du programme et les formats v1 sont conservés. Aucun modèle externe, consentement, updater, signature ou publication dans ce lot.

## Preuves de l’implémenteur

- `npm-lock-parent.log`, `npm-ci-parent.log` : dépendances installées proprement par le parent côté hôte ; version0.1.1, builder26.18.0, jose6.2.13, Electron45.0.0 conservé.
- `unit-tests.log` : première suite complète295/295. `unit-tests-final.log` conserve296/297 : le nouveau test d’artefact a chargé un module avant son ajout pendant ce run ; son recontrôle ciblé est vert. Après gel des sources, `unit-tests-stable.log` passe297/297, sans skip ni échec.
- `unpacked-a.json`, `unpacked-b.json` : A6/B7 contrôles, même profil synthétique, douze empreintes durables identiques avant navigation et après fermeture. Versions et ASAR distincts, demandes historiques inactives, propriétaire réellement incertain conservé, compte synthétique chiffré lisible. Profil fermé/nettoyé par B.
- `verified-a.json`, `verified-b.json` : recontrôle A/B avec la garde supplémentaire avant lancement : ASAR A qualifié imposé ; ASAR B égal au manifeste de livraison. Même portée unpacked.
- `final-a.json`, `final-b.json` : A6/B7 contrôles après reconstruction de B pour l’attribution JOSE6.2.13. ASAR final `bbac088b9dd9a6c3ad66871dc2db27956378f3a29967df2a734b1e14d007b639`, douze fichiers exacts, profil fermé/nettoyé. Les paires précédentes restent des preuves de la première construction, distinctes de cet artefact final.
- `save-failure.json`, `save-failure-synthetic.png` : quatre contrôles paquet sur vrai handle Windows sans partage suppression. Ancien durable exact, saisie non enregistrée visible, temporaire retiré, nouvel enregistrement explicite.
- `windows-regressions.log` : premier passage de cinq régressions Windows ciblées. `windows-final.log` : cinq contrôles sur le paquet reconstruit final, nettoyage confirmé.
- `native-loopback-profile.json`, `native-loopback-final.log` : vrai runner0.144.6 épinglé, client produit0.1.1, quatre contrôles et trois requêtes Responses loopback ; processus arrêté et espace nettoyé. Réseau externe non mesuré ; proxy désactivé seulement pour ce processus loopback. Réseau Main à contrôler séparément par le parent.
- `unpacked-a-first-failure.json`, `unpacked-a-fixture-failure.json`, `unpacked-a-locator-failure.json` : erreurs du banc conservées séparément, sans reprise des conclusions de succès. Instrumentation Main corrigée, propriétaire sans identité vérifiable et sélecteur limité au bon panneau ; profils fermés/nettoyés.

Les captures ne contiennent que des données inventées. Les annexes/conversations initiales sont des fixtures validées avant A ; les commandes métier réelles d’A enregistrent le snapshot complet, les projets et brouillons. Aucun dialogue synthétique n’est présenté comme un échange réel avec un fournisseur. La mesure réseau/processus commence après instrumentation du Main : sa portée reste explicite dans les reçus.

## Artefacts B

Paquet `dist/maintenance-pilot/`, manifeste `release-manifest.json` dans ce dossier et copie conservée ici. ASAR final : `bbac088b9dd9a6c3ad66871dc2db27956378f3a29967df2a734b1e14d007b639`. Installateur final : `8e3fc5145cd8c4bb19341c4c9be53b8df5b4d9f9f2032a4e9ee90c380b4ecb3a`. Le manifeste comprend113 entrées et trois artefacts dont la ressource externe `bmad-script-runner.py`. `build-final.log` porte types/build/NSIS réussis ; l’attribution embarquée égale la source, JOSE6.2.13 est exact et le texte MIT est inchangé. `implementation-verification.json` relie ces commandes et résultats. Une nouvelle reconstruction NSIS doit avoir son propre manifeste, sans promesse de binaire bit à bit identique.

## Vérification parent finale

Le rapport parent-verification.md clôt1.9 :300/300 après patches et revues résolus, NSIS réel puis installed-a6/installed-b7, douze fichiers/projections exacts, compte personnel restauré7/7 et27entrées conservées. GETMain200 mesuré séparément, fenêtre fermée et workspace synthétique nettoyé. Les premières erreurs et limites demeurent dans leurs reçus ; aucune connectivité externe fraîche du runner ni clôture des gates1.1/1.2/1.10/1.11 déduite. Le manifeste a été régénéré après les patches du banc ; les artefacts emballés sont inchangés.
