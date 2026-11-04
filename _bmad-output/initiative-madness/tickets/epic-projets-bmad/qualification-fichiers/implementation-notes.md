# Implémentation worker 2.8 — remise au parent

Travail produit effectué dans le worktree `bmad-help-2-2/madness`, sans stage, commit, installation ni changement de profil personnel. Parent seul propriétaire du plan, des statuts, du gel de livraison, de la revue, du paquet et des lots visuels.

## Changements

- `files.json` privé pendant les collectes Progress/Catalog existantes ; identité physique, chaîne, stamp et octets d’origine. Vérification/lecture native par le même worker/owner/admission, avec dispatch et pins actualisés. Le registre JavaScript ne décode pas les entiers d’identité native.
- Autorité privée attachée par WeakMap à l’objet original puis accord publiée seulement après admission du producteur. Références opaques en session, révocation synchrone, texte historique conservé, port host pour une capture corpus future sans BMad ; aucun raccord graphe ni API renderer de registration.
- Contrats stricts `projectFiles`, Main/preload gelé et corrélé. VSCode uniquement, URI construite côté host, longueur bornée, sans ligne inventée. Rejet connu, intégration absente et résultat inconnu distincts ; handoff borné/abortable. Copie write/readback indépendante, incertitude après écriture explicitement nommée.
- Panneau commun dock318/overlay1080 et agrandissement dans le même dialogue natif. Métadonnées avant texte inerte, état/fraîcheur visibles, sélection/position par contexte, focus/Échap et brouillons préservés. Sources du catalogue extérieures au projet restent dans leurs fiches.
- Les limites du reçu/registre produisent un diagnostic fichiers explicite et ne rendent pas le catalogue/progress indépendant indisponible. Révision suivante proposée seulement pour le même chemin/source capturée, jamais une identité ordinale du catalogue seule.
- Runtime0.2.11, dépendances inchangées. Nouveau banc `scripts/qualification/project-files.mjs` : gel avant exécution, vrai Main/preload sur profil temporaire, copie, mutation, réouverture passive, arrêt d’un Job files-read réellement en vol ; options parent `--editor-os` et `--screenshots` (dock+agrandi seulement).

## Vérification exacte du worker

Sources pertinentes gelées avant005 dans `worker-inputs-005.json`. Aucune édition produit après ce gel. EOL des lignes inchangées rétablis depuis HEAD, y compris le launcher mixte ; pins recalculés sur les octets actifs. Aucune capsule/reçu historique normalisé, le changement préexistant `tests/bmad-help-boundaries.test.mjs` est exclu.

- `npm run typecheck` :0, `.working/files28-types-ready.log`.
- `node --experimental-strip-types --test tests/project-files.test.mjs tests/project-files-protocol.test.mjs tests/bmad-progress.test.mjs tests/bmad-catalog.test.mjs tests/bmad-progress-protocol.test.mjs tests/bmad-catalog-protocol.test.mjs` :51/51,0skip, `.working/files28-backend-005.log` (71.3s). Comprend16observations natives fichiers,21Progress,28Catalogue et compléments de parseurs.
- `node --experimental-strip-types --test --test-name-pattern='fichiers:|catalogue:|actualisation:|navigation:' tests/connection-ui.test.mjs` :12/12,0skip, `.working/files28-ui-003.log` (63.2s). Pont synthétique nommé, App/Vite/CSS réels ;3fichiers+7catalogue+1navigation+1actualisation.
- `git diff --check` :0, warnings Git d’EOL attendus ; aucun blanc fautif détecté.

## Matrice et limites

| Ligne | Preuve worker | Restant parent / limite |
|---|---|---|
| F1 | Original vs clone/mutation, grants natifs code sans BMad, catalogue extérieur exclu, refus de limite explicite. | Vrai Main/paquet et port producteur4.4 non raccordé. |
| F2 | HTML/SVG/liens/scripts littéraux ; binaire/UTF8/type/taille refusés ; App ne crée aucun lien/script actif. | Aucun audit WCAG ou validation humaine acquis. |
| F3 | SHA du reçu, remplacement mêmes octets, racine remplacée, hardlink, extérieur non lu ; chaînes/final-handle réutilisés. Junction couverte par catalogue existant. | Symlink fichier natif sans privilège non revendiqué. |
| F4 | Mutation native refusée, texte historique en UI et commandes périmées désactivées ; aucune substitution de révision. | Banc Main mutation à exécuter. |
| F5 | URI stricte/encodage/borne, reçu simulé transmis/rejet/absent, handoff inconnu détaché à fermeture. | Aucun retour OS réel du nouveau banc encore exécuté par worker. |
| F6 | Copie simulée exacte, readback retardé/génération changée, BUSY après écriture = inconnu. | Copie native du nouveau Main/paquet encore à exécuter. |
| F7 | BUSY/STOP sans rejeu, A tardif ne vole pas le focusB ; retourA sans relancer la lecture. | Occupation du vrai Main/paquet à constater. |
| F8 | Dock, agrandissement/réduction/fermeture/focus, overlay, deux thèmes, zoom200, pas de débordement fenêtre. | Lots visuels parent ; pas de restitution lecteur écran ni test exhaustif Tab/fallback supprimé revendiqué. |
| F9 | Shutdown détache/aborte les lectures et handoffs simulés ; harnais Python arrêt Job0 avant nettoyage. | Vrai Main files-read en vol, conservation/réouverture native dans le nouveau banc parent. |

## Historique des rouges

- `files28-red.log` : import-red initial avant implémentation, pas un rouge comportemental F1–F9 ; premier gel `implementation-inputs.json` postérieur, limite explicitement portée dans son contenu.
- `files28-core-native-001.log` : nom de témoin Windows avec `?` invalide, corrigé dans le banc seulement.
- `files28-backend-002.log` :42/43, propagation d’un changement pendant collecte Progress transformé à tort en partiel ; correction conserve le refus global de capture mélangée.
- `files28-backend-003.log` : refus natif `CHANGED` pendant une lecture de format fraîchement écrit, cause non établie. Échec fermé sans lecture extérieure ; aucun diagnostic OS/antivirus inventé.004 puis005 sont verts.
- `files28-ui-001.log` :3locateurs de résumé erronés (`Texte des sources` au lieu du libellé réel), corrigés ;0023/3 puis00312/12.
- `files28-cap-copy-red.log` puis `files28-cap-copy-green.log` : deux vrais rouges parent, corrigés et revérifiés12/12 puis dans005 : limite silencieuse du registre et faux échec connu après écriture déjà réalisée.

## Témoins et suite

Tous les témoins créés par le worker passent par les harnais existants : Python ne supprime que si `job_active_after_stop===0` ; UI contrôle l’absence de processus possédés avant suppression. Les journaux ne signalent aucun témoin conservé faute d’arrêt. Aucun profil personnel, fournisseur, réseau volontaire, installation, capture visuelle ou détecteur Impeccable lancé par le worker. Le banc nouveau Main/paquet reste préparé, non exécuté par worker. Aucun G2/G3/G4/G5, accord visuel humain global ou story built déduit.
