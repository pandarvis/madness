# Mise à jour des contrats UX — 28 octobre 2026

Les contrats [DESIGN.md](../DESIGN.md) et [EXPERIENCE.md](../EXPERIENCE.md) sont réconciliés pour préparer la refonte sous le mandat autonome. Leur statut `final` concerne la spécification. Aucun code UI, application, paquet ou profil personnel n’est modifié par cette passe ; aucune acceptation visuelle humaine, conformité WCAG ou clôture de G1 n’est déclarée.

## Parcours réellement exécuté

Sally est activée via `bmad-agent-ux-designer` : bloc `agent` résolu, identité et principes chargés, configuration de l’initiative Madness résolue. Aucun prepend/append ni fait persistant supplémentaire. Le ticket epic 1 et AGENTS sont lus ; le ticket gouverne les exigences.

`bmad-ux` est exécuté en **Update headless** sur le workspace existant : deux spines et memlog lus intégralement, changements enregistrés exclusivement avec `memlog.py append`, références `headless`, spécification DESIGN, cinq exemples et Pass 1 du rubric walker chargés. Aucun entretien, nouvelle sélection ou mock créé : outils créatifs désactivés par défaut en headless. Les images et maquettes existantes gardent leur portée historique.

Impeccable : contexte déjà exécuté une fois dans la conversation, sans relance ; références New work, Operate et Shape lues pour cadrer la planification. Palette et composition étant fixées par le porteur, aucune sélection de monde visuel n’est rouverte. Pas de craft-floor, détecteur ou verdict ship pour cette modification documentaire.

## Réconciliation des inputs

| Input nommé | Décisions intégrées | Conflit ou limite résolu |
|---|---|---|
| Epic 1 | Dialogue corrélé, questions et approbations explicites, conservation, états inconnus et récupération ; aucune exigence ni contrainte changée. | Les mentions historiques de distribution, thème et dépendances se lisent à la lumière des décisions ultérieures. Les statuts et plans de tickets restent intacts. |
| `preparation-refonte.md` | Projet/initiative et onglets avant les états ; échange et demande avant préparation ; récupération courte, détails de contexte sur demande ; Mary et Forge seulement. | Son introduction antérieure à la décision personnelle citait encore 1.1 bloquante. Elle reste historique et n’est pas réécrite. Ses cinq captures 0.1.1 sont réutilisées comme preuve de conception, sans nouvelle inspection d’image ou qualification du paquet courant. |
| `deferred-work.md` | Dossier SVG compact, même axe de bascule et rail, nom accessible, aide clavier et mouvement réduit ; aide réseau explicite sans rejeu. | Les anciens items d’arrêt et réseau ne rouvrent pas les lots built. Aucun registre de notre développement ni adoption de Loop. |
| Décision personnelle locale | Usage du seul porteur, Windows, code privé, abonnement ChatGPT et SIWC conservé avec protections ; aucune distribution requise. | Remplace les anciennes formulations « V1 distribuée » sans déclarer l’ancien essai natif réussi. |
| Spines et memlog antérieurs | Base Parcours guidé, navigation rétractable, sombre terracotta/bleu, clair alternatif et Segoe UI conservés. | A2/Q6 désormais résolues : données locales conservées, restauration sans moteur, demandes historiques inactives. Mary seul et les restrictions initiales de son pilote ne décrivent plus le présent. L’historique reste dans le memlog, sans collection d’amendements contradictoires dans les spines. |

Aucune idée qualitative nommée n’est supprimée : animation du dossier retenue comme transition brève liée à l’état, jamais en boucle ; décisions de patch et récupération textuelles ; gardes d’arrêt et d’inspection maintenues. Catalogue, guidage calculé, fichiers/éditeur, anglais et R32 restent epic 2 ; initialisation epic 3 ; graphe epic 4. Les exigences de langue et autres extensions restent conservées.

## Contrat transmis à l’implémentation

- **Hiérarchie :** projet et initiative connue → onglets → bande critique courte → contenu. Conversation rend repérables échange ou état vide, demande pertinente et point de réponse au premier écran de référence. Les préparations Mary/Forge sont secondaires ; un historique ou patch long peut défiler.
- **Compacité :** barre 56 px, commandes 40 px, SVG 19 px, axe de bascule et icônes du rail à 28 px depuis le bord gauche. Retrait haut central 24 px et recommandation 16 px. Aucune réduction des cibles ou des informations de décision pour gagner de la place.
- **Contrôle :** motif principal et portée globale restent visibles ; arrêt inconnu et inspection bloquent selon les gardes réelles. Qualification, lancement, fichiers opt-in, sauvegarde et envoi restent distincts. Aucun échange natif repris ou effet rejoué implicitement.
- **Lecture :** même nomenclature de 23 composants dans les deux tables. Identité/provenance connue ou inconnue, reçus, historique inactif et récapitulatif factuel gardent leur sens. Les boutons autoriser/refuser gardent leurs textes et le patch complet avant décision.

## Vérification documentaire

Le Pass 1 est appliqué à la paire :

| Contrôle | Résultat réel |
|---|---|
| R1/R2/R8 | Parcours 3, Préparation d’un échange, Conversation et Connexion ; profils livrés et limites nommés. |
| R3/R5 | Questions, Champ de réponse et Approbation ; portée, copie au clic, reçu et décisions explicites. |
| R4/R6 | Accueil/projet, Bande de récupération et états ; attentes corrélées, blocage global et absence de rejeu. |
| R7 | Récapitulatif et moment décisif du parcours 3 ; fin de tour distincte des validations. |
| R9/R10 | Parcours 1 et états après redémarrage/remplacement ; conservation personnelle et absence de relance. La procédure de maintenance demeure dans ses preuves, sans nouvelle surface UX inventée. |
| Tokens et palette | 198 chemins de mappings/scalaires contrôlés ; 67 références distinctes DESIGN et 2 EXPERIENCE résolues. Les 66 valeurs de couleur sombre/claire sont strictement identiques à HEAD. |
| Forme et composants | Ordre canonique des sections conservé ; 23 composants appariés, mêmes noms et même ordre dans les deux tables. |
| Liens et inputs | 24 liens locaux résolus, sources frontmatter existantes ; les 9 fichiers de mockups/imports sont reliés aux sections pertinentes. Aucun nouvel artefact visuel. |
| États et surfaces | Vide, lecture, focus, erreurs, hors ligne, accès refusé, attente, résultat inconnu et restauration couverts selon la portée actuelle ou future. Trois parcours nommés, étapes, moment décisif et récupération conservés. |

La vérification du frontmatter porte sur sa forme connue de mappings/scalaires et ses références, sans parseur YAML externe. Elle ne remplace pas une qualification d’interface. Le cache système UV était inaccessible dans le sandbox ; les resolvers et memlog réussissent avec `uv --cache-dir .tmp/uv-cache run` depuis la racine, sans élévation.

## Relectures documentaires prescrites

La configuration résolue impose `skill:bmad-review lenses=structure,prose`. Les seules lentilles sélectionnées sont structure puis prose, cette dernière recevant les constats de structure. Aucun audit UX multi-lentilles optionnel n’est ajouté. Structure : un constat MOVE accepté et appliqué ; les règles communes de fermeture et de priorité d’Échap passent de State Patterns / Connexion personnelle à Interaction Primitives, texte inchangé. Les métriques BMad mesurent 2 279 mots DESIGN et 3 566 mots EXPERIENCE avant ce déplacement de 34 mots : réduction 0 mot. Prose : sept constats acceptés, huit remplacements ciblés : validation humaine, sens de l’état terminal, formulation A2/Q6, confinement/retour du focus, version future du fichier, dossier statique en mouvement réduit et détails dépliables. Les remplacements sont contrôlés sur leurs textes exacts ; aucune idée produit ni forme n’est modifiée. Ces deux lentilles sont documentaires et ne constituent pas une revue de la nouvelle interface.

## Correction ciblée T1 — attribution du diagnostic

Prolongement du même Update, après la [relecture indépendante Sofia Tree](../../tickets/epic-projets-bmad/qualification-preparation/review-tree.md). Le constat T1 est confirmé par [R3 et Boundaries de l’initiative](../../initiative-madness.md) et par [R3/Boundaries de l’epic 2](../../tickets/epic-projets-bmad/epic-projets-bmad.md) : diagnostic complet et qualification G2 appartiennent à l’epic 2 ; l’epic 3 consomme ce diagnostic pour appliquer l’initialisation.

Une seule ligne normative est corrigée : EXPERIENCE.md, Information Architecture, « Diagnostic et initialisation ». Le profil courant reste borné et les capacités restent futures. Les autres mentions de diagnostic/initialisation dans EXPERIENCE, DESIGN et ce rapport ne les attribuent pas à un autre epic ; elles ne nécessitent aucun changement. DESIGN est inchangé.

Recontrôle ciblé : occurrence ancienne absente, attribution corrigée unique et autres règles de diagnostic/initialisation conservées ; références locales de cette trace résolues. Aucune exigence produit, UI, acceptation visuelle, qualification G2 acquise ou clôture G1 n’est ajoutée. D1 et les tickets restent sous la responsabilité du parent.
## Suite et réserves

Le parent possède le Build distinct de refonte, sa revue et la livraison. La qualification native 1.11 reste en attente de l’action réseau réellement mesurée ; la suite synthétique 343/343 rapportée par le parent ne lève pas ce blocage. Aucun script réseau ou fournisseur n’est exécuté ici.

L’acceptation visuelle humaine reste inconnue ; A1 reste une cible WCAG à vérifier. Les choix précis du futur sélecteur d’initiative, de l’anglais et du graphe restent dans leur séquence de backlog. Ils ne créent pas de checkpoint humain supplémentaire pour cette spécification ni pour les contrôles autonomes déjà autorisés. Les essais UI, le lecteur d’écran et la nouvelle matrice de captures appartiennent à la réalisation de la refonte.

**Fin du tour Sally :** décisions consolidées et contrat préparé. La prochaine action est le handoff au parent pour l’implémentation autorisée, avec vérification réelle de la nouvelle composition ; aucun résultat produit n’est déduit de ce rapport.
