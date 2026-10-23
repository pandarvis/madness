# Epic 1 — proposition de stories

État : découpage de 11 entrées approuvé par le porteur le 23 octobre 2026 (« Je valide »), ordre et risques compris ; commit local autorisé. Aucun ticket feuille, plan d'exécution ou code produit n'est créé ; le démarrage d'une entrée reste distinct.

## Choix de méthode validé

BMad demande normalement que la première entrée soit le premier trajet complet à travers toutes les couches. Ici, cela réunirait qualification de l'authentification, assemblage Electron, contrats, stockage, packaging et workflow BMad réel ; sa taille ne peut pas être défendue comme une seule session.

Le porteur valide l'exception explicite : **1. qualifier Codex**, **2. établir G0**, **3. réaliser le tracer BMad complet**. Le blocage de validation de l'entrée 1 est levé dans le manifeste. Le spike et le socle ne sont pas présentés comme le tracer. Si la qualification Codex ne fournit pas la preuve requise, le passage aux consommateurs exige un réexamen ; aucune API facturée ou capacité réduite ne remplace silencieusement le besoin.

Le chemin complet de l'entrée 3 traverse React → preload → Main → cœur → connecteur Codex réel → événements normalisés → persistance → restitution dans la fenêtre. Avant invocation, cette entrée qualifie un workflow réellement installé dans un dossier d'essai dédié : empreinte du profil, identité et invocation, contexte requis, interactions et effets annoncés. Le parcours textuel complet retenu doit fonctionner sans les contrôles encore prévus en 5–7. Sinon, choisir une autre référence réellement qualifiée ou bloquer et revoir le découpage ; aucune condition native ne peut être tronquée ou simulée. Aucun workflow précis n'est déclaré qualifié à ce stade.

## Ordre et résultats

| Entrée | Résultat | Couverture locale principale |
|---|---|---|
| 1 — Qualification Codex | Voie distribuable, connexion réelle, versions et limites étayées, avec les étapes d'identité réalisées par le porteur. | R8 : profil d'accès et capacités servant aux consommateurs. |
| 2 — Socle Windows | Paquet, frontières Electron, contrats communs et stockage versionné établis avant leurs consommateurs ; trajet local de lecture/écriture opérationnel. | R9/R10 : fondation de conservation et construction. |
| 3 — Premier parcours complet | Projet BMad de référence → invocation visible → dialogue réel → échange et brouillon retrouvés après réouverture sans moteur relancé. | R1/R2/R5/R8/R9 : première boucle qualifiée. |
| 4 — Messages et activité | Flux corrélé au bon contexte, identité et états connus, annonces accessibles et échanges enregistrés. | R2/R4/R9 : réception et état de tour. |
| 5 — Questions et brouillon | Question structurée active, envoi fiable, refus du vide/double, réponse expirée conservée sans redirection. | R2/R4/R5/R9 : interaction et durabilité de la saisie. |
| 6 — Approbations | Opération et portée comprises avant choix ; accord, refus ou ajustement liés à la bonne demande. | R3/R4/R5 : consentement et validité du contrôle. |
| 7 — Interruption et récupération | Arrêt observé, coupure et inconnu distingués ; aucune ancienne demande ni effet incertain rejoué. | R4/R5/R6/R8/R9 : cycle de vie et reprise vérifiée. |
| 8 — Attentes et récapitulatif | Même attente dans accueil/projet, point de réponse fiable, fin de tour avec propositions, accords connus, fichiers et suite. | R4/R7/R8 : projection commune des états, connexion et résultat. |
| 9 — Reconstruction et remplacement | Procédure de mise à niveau/republication et récupération des données vérifiées dans le paquet Windows. | R9/R10 : migrations, échecs et remplacement. |
| 10 — Refactor sweep | Nettoyage issu des plans/revues, avec comportements et contrats préservés. | Qualité transversale, aucune fonctionnalité reportée. |
| 11 — Vérification intégrée finale | Suite de bout en bout sur Codex réel et paquet Windows, preuves G0/G1 et limites consignées. | R1–R10 : assemblage et contrôle intégré. |

Le [manifeste détaillé](../tickets/tickets.toml) contient pour chaque entrée une description, une vérification exécutable, les références, le risque et ses prérequis. Les identifiants 1–11 sont réservés ; aucun ticket feuille n'est encore extrait.

## Contrats et passages

- L'entrée 1 fournit la preuve positive d'éligibilité et le profil d'outillage à 2, avec contrôle du réseau et des certificats du processus Codex sur la cible ; une qualification négative ne rend pas les consommateurs exécutables.
- L'entrée 2 possède G0 : contrats de contexte, événements, demandes, erreurs, capacités, cycle de vie et persistance. L'unité de stockage fixe moteur, schéma et migrations avant les consommateurs ; aucune autre entrée n'écrit directement son stockage. Elle qualifie aussi minima Windows, runtime et acceptabilité du paquet par le proxy ; le réseau du renderer ne prouve pas celui du fournisseur.
- Le tracer 3 vérifie également l'environnement, le réseau et les certificats du processus Codex réellement lancé depuis le paquet installé : l'essai d'outillage de 1 ne constitue pas cette preuve. Il produit le dialogue et les retours réels consommés par 4. La réception corrélée de 4 sert aux contrôles de questions de 5, dont la présentation d'attente et les gardes sont réutilisées en 6.
- L'entrée 7 traite le cycle de vie des conversations et des demandes livrées par 5–6. L'entrée 8 projette ces mêmes états ; elle ne crée pas une seconde machine d'attente. L'entrée 9 vérifie les données et états intégrés dans le programme remplacé et recontrôle les prérequis modifiés, séparément pour runtime/proxy Electron et environnement/réseau/certificats Codex.
- Une seule voie ordonnée de réalisation évite les collisions dans cœur, contrats, connecteur, persistance et surfaces communes. Il n'y a pas de travail produit parallèle proposé ; les relectures peuvent rester indépendantes.
- Chaque entrée porte les tests qui justifient son résultat. Le nettoyage 10 attend toutes les entrées 1–9 ; seule la suite de bout en bout 11 le suit. Le nettoyage n'absorbe aucun périmètre omis.

## Limites préservées

L'UX française claire acceptée et les comportements accessibles des contrats s'appliquent dès les premières surfaces. R4 est transversal : chaque contrôle expose son état, l'entrée 8 assemble leur visibilité dans accueil/projet. R5 conserve la saisie en cours ; R9 en assure la durabilité. Les attentes restaurées ne redeviennent pas actives sans retour fiable du moteur.

Catalogue complet, fiches, guidage complet, suivi multi-projet, variantes anglais/sombre, aperçu/éditeur restent dans l'epic 2 ; initialisation et G4 dans l'epic 3 ; graphe et G5 dans l'epic 4. Le premier profil BMad est qualifié ici sans prétendre couvrir toute v7. La fin de ces stories ne vaut ni G4 ni clôture de la V1 entière.

L'authentification et les premiers prérequis sont des interventions humaines dans 1, le setup du starter et de la machine dans 2 ; le remplacement Windows et l'essai intégré cible requièrent aussi le porteur dans 9 et 11. Aucun mode d'exécution sans surveillance ou checkpoint supplémentaire n'est imposé.

## Risques retenus

Ces niveaux servent à préparer les vérifications ; ils ne déclarent aucune capacité déjà prouvée. Les contrôles détaillés seront écrits lors de l'extraction de chaque ticket.

| Entrée | Risque | Raison |
|---|---|---|
| 1 | Élevé | Une voie d'accès non éligible ou une capacité manquante bloque toute la boucle réelle. |
| 2 | Élevé | Les contrats, les privilèges Electron et le stockage engagent tous les consommateurs. |
| 3 | Élevé | Première intégration réelle de toutes les couches, des conditions BMad et de l'environnement du paquet. |
| 4 | Moyen | Une mauvaise corrélation présente des messages ou des états dans le mauvais contexte. |
| 5 | Élevé | Un double envoi, une réponse périmée ou une perte de brouillon compromet le dialogue. |
| 6 | Élevé | Une autorisation attribuée au mauvais objet peut déclencher un effet non consenti. |
| 7 | Élevé | Une récupération incorrecte peut rejouer un effet dont le résultat est inconnu. |
| 8 | Moyen | Une attente ou un récapitulatif trompeur fait agir l'utilisateur sur une mauvaise information. |
| 9 | Élevé | Un remplacement ou une migration défaillante peut faire perdre l'historique local. |
| 10 | Faible | Nettoyage sans changement observable, protégé par les vérifications antérieures. |
| 11 | Élevé | Une preuve intégrée incomplète laisserait déclarer G1 acquis malgré un parcours réel défaillant. |

## Contrôles du découpage

La [relecture indépendante Ticket/Set/Dependencies](./stories-review.md) a recontrôlé les précisions sur le parcours natif de 3, les réseaux/runtime, les interventions humaines et les raisons de risque : aucun constat correctif restant dans ce périmètre. Après l'approbation, les commandes officielles `status` (epic et initiative) et `next` sont relancées pour vérifier les 11 entrées planifiées et la levée du blocage de méthode. L'entrée 1 est la première à prendre en charge ; les suivantes gardent leurs dépendances.

La réserve d'ordre est résolue par l'accord explicite du porteur, consigné dans les Notes de l'epic. La [preuve de contrôle](./stories-plan-validation.json) conserve l'état approuvé et les résultats des commandes, sans conflit d'ordre ni dépendance non épinglée/non déclarée. Ces vérifications portent sur le plan ; aucune installation, connexion Codex, application ou qualification G0/G1 n'a été exécutée.
