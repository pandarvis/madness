# Contrôle Dependencies Sofia — adoption 3/4

Contrôle avant relecture fraîche, 3 novembre 2026. Le besoin reste celui du parent : R4/R23/R24 et R28–R31. Seul le séquencement de livraison change. Les six vraies commandes status/next et leurs sorties sont dans adoption-verification.json ; aucun plan n’est modifié.

| Entrées | Besoins avant démarrage et vérification | Fournisseurs épinglés / responsabilité |
|---|---|---|
| 3.1 | Installation/profil BMad observé, identités projet/contexte, base Windows et espaces possédés | 2.1,2.3,1.11 ; qualifie elle-même l’outil/plan/effets G3, aucun effet sur projet du porteur |
| 3.2 | Profil d’initialisation et règles UX avant nouvelles surfaces ; ordre des modifications des spines partagés | 3.1,2.17,2.14 |
| 3.3–3.9 | Contrats/diagnostics/contexte/fichiers/éditeur/variantes et paquet intégrés stabilisés | 3.3 attend3.2/2.16, chaîne unique3.3→4→5→6→7→8→9 ;3.9 réunit G3/éditeur sur artefact exact et fournit la base locale à4.4 |
| 3.10 | Candidat local3.9 et vrais parcours avec porteur novice | 3.9 ; hitl=true, G4 ne réussit pas par automatisation ou délégation |
| 4.1 | Base locale Windows/Codex, cycle de vie/persistance et identités projet | 1.11,2.3 déjà built ; qualifie elle-même runtime Python/Graphify candidat/formats/effets sur témoins possédés. G4 humain n’est pas consommé pour cette question |
| 4.2 | Profil réel et contrats de guidage déjà construits | 4.1,2.17 ; supplément UX dédié sous epic4, aucun spine partagé ni UI produit modifié avant4.4 |
| 4.3 | Profil réel et UX graphe définie | 4.2 ; contrat/port/validations dans modules propres isolés, import des bases existantes seulement. Aucun changement de contrats existants, export partagé, Main/preload/UI/persistance/lifecycle ou spine avant4.4 |
| 4.4–4.10 | Fichiers/éditeur, variantes, voie produit3 stabilisée puis contrat/UX propres | 4.4 attend4.3,2.8,2.14,3.9 ; réconcilie les apports puis branche une seule voie produit ;chaîne4→5→6→7→8→9→10 |
| 4.11 | Candidat graphe nettoyé et G4 réellement qualifié pour clôture intégrée | 4.10,3.10 ; G5 et V1 restent ouverts si une preuve manque |

Collisions : 3.1/4.1 opèrent sur espaces et témoins distincts sans modifier produit/configuration ; 4.2 reste dans son supplément, 4.3 dans ses modules propres. Leurs contrats existants sont en lecture seule ; la publication dans les spines et branchements partagés appartient à4.4 après2.14/3.9. La voie produit d’epic2 précède3 par2.16 ; celle de3 précède4 par3.9. Aucune voie de produit concurrente autorisée.

Handoffs : les descriptions3.9/3.10 et4.4/4.11 nomment leur transfert ;2.8 fournit déjà explicitement le panneau réutilisable par le graphe et le retour éditeur à3. Les règles communes et owners sont dans AD-1/2/5/8/9/10, sans modification. Les sources de code lues confirment LifecycleCoordinator/ActivityAdmission, ContextRef/Snapshot et BmadContextObservation/CapturedBmadContext existants ; aucun port Graphify ou commande d’initialisation existant n’est supposé.

Résultat mécanique avant revue fraîche : 51 entrées dans l’initiative, dont10/11 nouvelles entrées planifiées pour3/4 ; next_id=11/12. Requirements dérivées fidèles7/7, couvertures3/3 et4/4, aucun lien manquant, aucune feuille ni plan anticipé, checkpoints délégués, seule3.10 hitl=true. Les six commandes sortent0, zéro problems/drift/unpinned_after/undeclared_after/order_conflict. Le tableau conserve2.4 in-review ; next peut proposer2.5 car le magasin admet review, cela n’est pas une preuve de clôture2.4 et ne déclenche aucun Build ici. Les sorties ready_to_start pertinentes sont3.1 et4.1.

Le contrôle ne qualifie aucun runtime, outil, format, paquet, UX réelle ou gate G3/G4/G5. La version0.9.101 reste documentaire candidate ; aucun Graphify n’est installé ou exécuté. Une source humaine/externe reportée garde son essai, artefact, preuve, portée et condition de reprise ; aucun clic réseau n’est redemandé dans cette adoption.



Recontrôle final après revue : mêmes six commandes à22:58UTC, exit0 et aucune anomalie. F1 risque high/contrôle supplémentaire corrigé puis recontrôlé résolu ; verify4.3 précisé sur le seul contrat, restauration réelle toujours4.7. Aucun changement de besoin, allocation, ordre ou prérequis. Relecture fraîche Ticket/Set/Tree/Dependencies : fix[],suggest[],ask[] restants ; voir adoption-fresh-validation.md.
