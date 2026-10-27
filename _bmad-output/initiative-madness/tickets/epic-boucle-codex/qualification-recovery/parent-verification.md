# Qualification finale1.7 — récupération sans rejeu

Le parent a suivi `bmad-build` full, revue Quick épinglée, puis vérifié les preuves et le paquet après corrections. Le bloc figé du plan reste identique (SHA256 `f507b2d3d4b4d095c19f4444294ed9df6b80a762cadab285c2a745e3493bfce7`). Implémenteur et relecteurs sont techniques ; aucune activation de Sally n’est revendiquée dans ce lot.

## Résultat

Les arrêts non confirmés restent bloquants après redémarrage. La réobservation cible seulement le propriétaire dont l’identité Windows est prouvée. L’inspection locale compare tous les fichiers d’un accord accepté incertain, sans modifier le projet ni transformer le résultat natif historique en succès. Un nouveau départ est explicite, distinct, sans historique, brouillon ou ancien accord envoyé. L’aide réseau expose l’URL publique fixe, Ouvrir/Copier et un GET indépendant du coffre, d’OAuth et du modèle.

Les trois constats Quick ont été vérifiés individuellement, corrigés par le même implémenteur puis recontrôlés résolus par le même relecteur. Aucun constat correctif de ce lot différé. L’assertion historique de fermeture du test1.6 reste inscrite au Refactor sweep ; elle passe dans cette suite et n’a pas été modifiée ici.

## Contrôles exécutés après les correctifs

| Contrôle | Résultat | Preuve |
|---|---|---|
| Suite source globale, concurrence2 | 270/270, zéro échec, 276094,7134ms | `tests-parent-final.log` |
| Types, production, installateur Windows | réussis | `build-parent.log`, `package-parent.log` |
| Main/preload/renderer compilés | 9/9, profil nettoyé | `compiled-profile.json` |
| Paquet final | 9/9, profil nettoyé | `packaged-profile.json` |
| Runner0.144.6 réel, Responses simulé loopback | 7/7, arrêt et nettoyage confirmés | `native-loopback-profile.json` |
| Régressions Windows ciblées | 5, profil nettoyé | `windows-parent.log` |
| Installation personnelle fermée | installateur0, 27 empreintes critiques identiques | `installation.json` |
| Restauration installée seule | 6/6, fermeture observée, données toujours identiques | `installed-reopen-profile.json` |

La matrice du plan est couverte par les tests nommés dans `implementation-validation.md`, présents et réussis dans la suite parent finale ; les nouvelles régressions Q1–Q3 y passent également. Les bancs finaux ne font aucune nouvelle capture. Les rapports pré-Quick sont conservés séparément pour relier les trois captures antérieures au paquet auquel elles appartenaient.

Le vrai runner exerce un effet fichier avant la perte simulée de son reçu, un propriétaire restauré, la réobservation puis l’inspection et un nouveau départ sans rejeu. Il utilise deux requêtes HTTP locales sans Authorization ; aucun compte, OAuth, refresh ou modèle externe. Le banc compilé/paquet vérifie l’échec réseau guidé avec son GET bloqué par le banc. Aucun nouveau clic Zscaler n’a été demandé pour ce lot.

## Programme et données

Empreintes finales et nombre de contrôles dans `recovery-artifact.json` : ASAR `9a11c3a722b5cacaa1cb4d12eff3defc7a22be67c82930af78dfa3ebc4dc09f6`, Main `08319b7601f412a18bcad5f2c17898452959b69315afc846df7e7895c1d3cf91`. L’archive installée et le membre Main réellement chargé correspondent au paquet qualifié.

La comparaison avant/après remplacement couvre Snapshot, apparence, Local State, compte chiffré/inscription, annexes, éventuel propriétaire et archives privées de tests. La restauration n’effectue ni navigation, saisie, envoi, contrôle réseau ou commande fournisseur. Le compte est lisible sans vérification facturable ; seuls MIA et Madness restent dans les récents. Les compteurs passifs valent zéro spawn et zéro requête après leur installation ; leur période antérieure n’est pas couverte. Aucun texte privé, secret, copie du coffre ou capture personnelle exporté. La fenêtre de contrôle est fermée pour poursuivre le développement.

## Limites conservées

La finition Impeccable fraîche est documentée dans `impeccable-finish.md`, ship limité aux deux libellés F1/F2, deux tours visuels au total et un détecteur. L’accès fonctionnel à la récupération du témoin ajouté après Quick possède sa régression clavier, sans nouveau verdict visuel. La refonte globale Sally/experts reste à faire après l’implémentation de l’epic.

Aucune acceptation visuelle humaine globale, qualification de distribution privée, clôture des anciens gates1.1/1.2 ou intégration Graphify n’est déduite. La prochaine entrée autonome est1.8, puis1.9 ; les dépendances10/11 sont conservées. Le suivi demandé du temps et du coût reste distinct dans `../../../suivi-us.json` : bornes documentées et consommation partielle, montant exact indisponible sur abonnement.
