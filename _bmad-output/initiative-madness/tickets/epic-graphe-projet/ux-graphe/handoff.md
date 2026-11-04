---
title: "Remise du supplément Graphe aux consommateurs"
status: "contrat documentaire4.2, intégration future"
date: '2026-11-04'
---

# Remise à 4.3, 4.4 et 4.8

<a id="h1"></a>
## H1 — Ce qui est remis

[DESIGN](DESIGN.md) fixe la composition locale dans le troisième onglet du projet et l’héritage visuel. [EXPERIENCE](EXPERIENCE.md) fixe transitions, identités, recherche/relations, focus, nœud→fichier et copie FR/EN. Les clauses D1–D7/E1–E8 sont des règles UX vérifiables, sans nouveau type public, commande IPC, stockage parallèle ou décision de bibliothèque. Les [walkthroughs U1–U6](qualification/verification.md) vérifient le texte ; aucun parcours produit n’en découle.

Le [plan4.2](../tickets/story-definir-avec-sally-l-exploration-accessible-du-graphe-plan.md) est la source de portée. Les fournisseurs du [tableau4](../tickets/tickets.toml) sont des dépendances à attendre, jamais des capacités livrées par ce supplément. Le [DESIGN racine](../../../../../DESIGN.md) reste l’autorité visuelle actuelle, les deux spines partagés restent inchangés jusqu’à réconciliation explicite en4.4.

<a id="h2"></a>
## H2 — Traçabilité des exigences de l’epic

| Exigence locale et source | Clauses remises | Consommateurs et preuve attendue |
|---|---|---|
| R1 / parent R28 : génération volontaire du code/modules/fichiers/dépendances du projet ouvert, portée explicite, outil optionnel de V1 | D1–D2 ; E1–E2 : troisième onglet, contexte exact, génération/actualisation explicite et aucun fournisseur requis | 4.3 définit les identités et demandes isolées ; 4.4 raccorde l’unique voie à l’enfant/local et au shell ; 4.9 qualifie le paquet. Aucun lancement n’a eu lieu ici. |
| R2 / parent R29 : recherche/exploration, sens/provenance/certitude, fichier et liste accessible | D3–D6 ; E3–E6 et E8 : sens orienté, confiance/score distincts, recherche/homonymes, relations, zoom/pan et fichier sûr | 4.3 admet les données ; 4.4 établit le tracer jusqu’au fichier2.8 ; 4.5 complète normalisation ; 4.8 réalise et éprouve l’exploration/variantes. |
| R3 / parent R30 : absent/en cours/disponible/partiel/ancien/incompatible/échec, fraîcheur non commitée, dernier complet, récupération et BMad utilisable | D2/D4 ; E1–E3/E7–E8 : axes distincts, mutation/restauration historiques, arrêt connu/inconnu et sauvegarde séparée | 4.3 définit admission/publication ; 4.6 établit fraîcheur et dernier complet ; 4.7 éprouve arrêts/restauration/disque ; 4.4 réconcilie le coordinateur existant. |

Source des exigences : [epic-graphe-projet](../epic-graphe-projet.md). R4 demeure la qualification finale en4.11/G5, non couverte comme succès par4.2. Une conception accessible n’est ni G5, ni conformité WCAG, ni acceptation humaine.

<a id="h3"></a>
## H3 — Contrat à consommer, sans API anticipée

4.3 doit rendre représentables et validables, dans ses propres modules isolés : identité projet/racine/périmètre/analyse/révision, provenance/couverture, source de sens, confiance textuelle et score distinct, références relatives/ligne inconnue, activité terminale et distinction résultat/dernier complet/fraîcheur/conservation. Ce sont des besoins sémantiques, pas une forme GraphSnapshot écrite ici. Le renderer futur ne reçoit ni JSON natif Graphify ni HTML ; la normalisation reste derrière le cœur et l’adaptateur.

Les refus de4.1 restent refus : outil/version/schéma inconnus, raw non estampillé, endpoint absent, un seul marqueur de sens, référence absolue/traversante/liée/hors corpus, confiance inconnue, score hors domaine, ligne hors fichier. `_src/_tgt` ensemble priment, sinon source→target malgré `directed:false`. Les sources/lignes absentes restent inconnues ; aucune plage déduite. Le profil admet uniquement ses variantes explicitement qualifiées : la mention de `links/edges` dans un consommateur futur ne constitue pas admission d’un autre format en4.2.

4.4 attend **2.8 fichiers/éditeur**, **2.14 variantes/langue/clavier** et **3.9 voie d’initialisation locale stabilisée**, puis réconcilie ce supplément et les contrats4.3 avec les spines, cycle de vie, conservation et propriétaires existants. Il branche une seule voie produit, sans nouveau fournisseur, coordinateur ou stockage parallèle. L’onglet local n’est pas bloqué par une absence de connexion IA ou de BMad ; les vraies gardes de possession restent applicables.

4.8 décide bibliothèque/projection/volumétrie et contrôles locaux à partir de mesures, fournit la liste équivalente et vérifie la recherche/fichier/retour au clavier dans les variantes. Aucun plafond de nœuds, budget mémoire ou durée maximale V1 n’est fixé par ces documents.

<a id="h4"></a>
## H4 — État du dépôt et dépendances non livrées par ce lot

| Sujet | Constat de lecture ou preuve existante | Travail restant du consommateur |
|---|---|---|
| Shell et onglets | App.tsx405/466 ne connaît que Parcours et Conversation ; aucun onglet Graphe actuel. Navigation conserve les échanges par identité ; cela ne prouve pas la mémoire d’exploration future. | Ajouter Graphe en troisième position en4.4 ; conserver destinations, brouillons, sélections et focus exacts. |
| Onglets au clavier | App.tsx466 active immédiatement avec les flèches ; le spine EXPERIENCE · Clavier prévoit focus puis Entrée/Espace. Divergence préexistante. | Réconcilier en2.14/4.4 et vérifier le comportement final ; aucune correction produit dans4.2. |
| Fichiers/éditeur | Les spines portent une intention de panneau318px et superposition1080px ; ProjectResume expose des détails textuels, pas ce panneau. | 2.8 doit livrer lecture sûre, identité/révision, retour et reçus éditeur avant le tracer4.4. E6 n’invente aucune méthode de pont. |
| Langue/zoom | Application principalement française fixe ; strings.ts ne fournit des paires que pour la reprise. Aucun gestionnaire produit de zoom application repéré. | 2.14 implémente les variantes ; E8 est une copie contractuelle. 4.8 sépare zoom local du dessin et zoom application, vérifie200 %. |
| Reprise/focus | ProjectResume.tsx24/29/39 conserve positions/détails de même capture et replie après changement ; repli de focus vers le registre si preuve disparue. | Réemployer le principe, pas étendre sa portée par déclaration à tous les projets/graphes. |
| Fraîcheur et restauration | Le spike4.1 observe des corpus/mutations et arrêts sur témoins ; aucun stockage/projection Graphe produit. | 4.6/4.7 qualifient ancien, non commité/non suivi, mutation pendant analyse, dernier complet et arrêt inconnu réels. |
| Spines/Impeccable | Autorité racine et surface courante lues ; dérives historiques Segoe UI/tailles et mentions de versions antérieures restent présentes. | Préserver les fichiers pendant4.2 ; réconciliation ciblée en4.4, aucune réparation de drift incidente. |

<a id="h5"></a>
## H5 — Provenance et limites4.1 à conserver

Le [profil-g5](../qualification-graphe/profil-g5.md), [schema-profile](../qualification-graphe/schema-profile.json), [parent-verification](../qualification-graphe/parent-verification.md) et [final-verification](../qualification-graphe/final-verification.json) font autorité pour le seul assemblage qualifié Graphify0.9.101/CPython3.12.14. Le nominal73nœuds/57relations,25,734s worker et77 815 808octets de pic working-set décrit ce témoin ; le coût complet du lanceur/préflight est distinct. Aucun seuil ni extrapolation au grand dépôt. Code-only peut produire INFERRED avec0.85 : aucune probabilité de vérité déduite.

Hooks Python et canaris ne sont pas un sandbox OS ; Git épinglé ne qualifie pas toutes configurations/installations. Arrêts avant parsing, pas au milieu d’un parseur natif. Configurations Git/mixtes/cpp, grandes bases et conversion documentaire ne sont pas généralisées. Le raw non estampillé reste refusé ; références extérieures et HTML conservés ne deviennent pas ouvrables/exécutables. 4.1 n’est pas G5 intégré et les18cas/3compléments ne deviennent pas de nouveaux parcours exécutés en4.2.

Les deux références visuelles inspectées sont des replays historiques Main004 de la reprise2.4, non du Graphe et non des pixels du paquet final après Quick ; [D7](DESIGN.md#d7) nomme les fichiers et leur provenance. Aucune capture ou maquette nouvelle n’a été produite. L’approbation humaine antérieure de fontes/casting ne valide pas ce futur parcours.

<a id="h6"></a>
## H6 — Vérifications futures exigées

Les walkthroughs locaux livrent la traçabilité U1–U6, la cohérence FR/EN, les liens et la comparaison d’empreintes. Le parent porte la relecture Quick et les statuts du plan. La relecture UX indépendante porte le supplément textuel, sans verdict visuel de ship.

Les consommateurs devront mesurer et tester réellement : génération/refus/arrêt/timeout, mutation non commitée et pendant analyse, deux projets/réponses tardives, recherche longue et projection, relation→fichier de même révision ou refus, erreur éditeur/conservation, retour à la saisie, clavier seul, FR/EN, deux thèmes, zoom200 %, mouvement réduit et technologies d’assistance. 4.11 attend aussi3.10/G4 et le candidat exact du paquet. Ne pas conclure UI rendue, installation, G5, acceptation humaine ou conformité globale de cette remise documentaire.
