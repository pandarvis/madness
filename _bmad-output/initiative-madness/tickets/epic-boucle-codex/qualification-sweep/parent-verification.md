# Vérification parent — nettoyage1.10

Le lot traite uniquement F1 de1.6 dans `tests/connection-probe.test.mjs`. La connexion personnelle SIWC, les sources du programme, le paquet installé0.1.1 et les preuves historiques ne sont pas modifiés.

## Périmètre et cause

Le Build BMad est rendu une seule fois, route oneshot/Quick, baseline `c59b505fb2bb7666f431aaae5ee4b24ad1c9e8b6`. Deux investigations fraîches ont lu la continuité des plans built2,12,3–9 et les revues : F1 est le seul nettoyage encore ouvert. Catalogue, refonte UX, R32, Loop et graphe restent dans leurs lots.

`stopNative` confirme la fermeture observée et reconnaît une sortie normale ou par signal. L’ancienne assertion ne reconnaissait que `exitCode` et rejetait donc une fermeture légitime par signal. Le reçu [red-assertion-proof.json](red-assertion-proof.json) provient d’un enfant Node synthétique gardé vivant après EOF : arrêt vrai, `close` observé, `exitCode:null`, `signalCode:SIGTERM`, flux détruits et enfant fermé. L’ancienne assertion produit bien ERR_ASSERTION ; la commande quitte1, échec de reproduction attendu. Aucun compte, moteur Codex ou réseau n’est nécessaire à cette mesure. La cause de la latence dans le run historique n’a pas été mesurée ; aucune cause de concurrence ou d’antivirus n’est inventée.

## Correction et contrôles

- Le premier test exige toujours un arrêt vrai, observe désormais `close` et accepte une issue normale ou par signal.
- Le nouveau cas attend READY avant l’arrêt, garde l’enfant vivant après EOF puis exige `close`, SIGTERM et fermeture des deux flux. Les deux tests ferment leur seul enfant lors du teardown, même si une assertion échoue.
- [targeted-tests.log](targeted-tests.log) :9/9, exit0.
- [typecheck.log](typecheck.log) : types Node et web, exit0.
- [full-tests.log](full-tests.log) :301/301, exit0, aucun échec, annulation, saut ni todo ; durée technique du run406764,513ms.
- [targeted-post-review.log](targeted-post-review.log) :9/9 après le dernier ajustement, exit0.

**Provenance des passes :** la suite complète avait déjà chargé et exécuté le nouveau test avec son plafond initial10s. Q1 de la revue relève que READY5s + arrêt1,5+4s peuvent dépasser ce plafond. Le seul changement postérieur est le plafond du test porté à15s ; les9tests concernés sont exécutés à nouveau après cette correction. Les autres fichiers de test et le code produit sont inchangés. Aucune deuxième suite UI complète n’est déduite ni prétendue.

## Revue et conservation

Quick frais : un constat Q1, classé medium/patch par le parent, corrigé puis recontrôlé résolu par le même relecteur. Aucun autre constat ni correctif différé. La revue approfondie et les lenses visuelles ne sont pas activées pour ce lot limité au test.

La comparaison Git contre la baseline ne trouve aucun changement dans `src/`, `scripts/`, `resources/`, les configurations de compilation/packaging et les dépendances. Les anciens plans built et les trois contrats adoptés restent inchangés. Le bloc figé1.10 est vérifié par empreinte dans [verification.json](verification.json). Aucun nouveau build, installateur, compte, consentement, clic Zscaler ou profil personnel n’est utilisé. Le diff temporaire de revue est retiré après confirmation de son emplacement et de son seul fichier.

## Suite

La1.10 est built, pas une clôture intégrée de l’epic. La1.11 devient l’entrée technique suivante : paquet Windows personnel/SIWC conservé, boucle réelle, arrêt/fermeture et nettoyage possédé, réseau/certificats du processus Codex, restauration sans relance et remplacement. L’ancienne voie1.1 reste dropped et son essai inconnu historique demeure intact. La refonte Sally/experts/Impeccable suit l’implémentation de l’epic ; aucune acceptation visuelle humaine n’est déduite de ces tests.
