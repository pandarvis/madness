---
type: epic
title: "Initialiser un projet et qualifier les parcours Windows"
parent: initiative-madness
covers: ["R4", "R23", "R24"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md", "DESIGN.md"]
refined: true
risk: high
---
# Initialiser un projet et qualifier les parcours Windows


## Description

À partir du diagnostic, des projets et de l'interface de l'epic 2, une version Windows personnelle installable initialise BMad avec plan exact, accord, annulation et résultat vérifié. Elle réunit les preuves G3, dont l'ouverture éditeur fournie par l'epic 2, puis G4 sur machine cible : trois parcours réels avec le porteur peu familier de BMad, restauration et remplacement du programme.

## Outcome

Le porteur initialise un dossier non équipé en comprenant les changements et leur résultat ; il accomplit les trois parcours réels dans la base Windows/Codex installée, retrouve son travail après fermeture et conserve ses données après remplacement du programme.

## Requirements

- R1 (parent R4) : Initialiser BMad v7 dans un dossier non équipé après présentation des prérequis et des changements exacts puis accord explicite ; annuler laisse le dossier intact et le succès n'est annoncé qu'après vérification de l'installation.
- R2 (parent R23) : Utiliser une première version Windows pour les projets personnels locaux du porteur, avec son abonnement ChatGPT ; vérifier installation, prérequis et parcours sur sa machine cible, avec de vrais projets et une connexion Codex, au-delà de la simulation HTML.
- R3 (parent R24) : Vérifier les trois parcours avec une personne peu familière de BMad : ouvrir ou initialiser, expliquer état et preuves, choisir sans mémoriser les commandes, dialoguer et approuver, comprendre problème ou fin de tour et retrouver les fichiers ; distinguer prise en main du prototype et validation de l'application intégrée.

## Constraints

- C1 (parent C1) : L'expérience utilisateur gouverne les arbitrages ; le porteur novice comprend l'état, les effets et la décision attendue.
- C2 (parent C2, C3) : Windows, Codex et formats/fonctions BMad v7 réellement qualifiés ; projets existants préservés, sans migration ou reconstruction de conversations externes.
- C3 (parent C4, C7) : Usage personnel local, code privé et abonnement ChatGPT avec la connexion SIWC existante ; aucune distribution, publication, bascule d'authentification ou facturation API implicite.
- C4 (parent C5 ; AD-8) : Sally et Impeccable étendent les contrats d'initialisation avant leurs surfaces ; charte atelier courante du DESIGN racine, français/anglais, clair/sombre, clavier, focus, zoom et mouvement réduit conservés.
- C5 (parent C6 ; AD-1, AD-2, AD-5) : Les contrats et cas d'usage appartiennent au cœur ; Main valide appelant et portée, le preload expose des opérations métier, le renderer ne manipule ni fichiers ni processus ; persistance et cycle de vie réutilisent leurs propriétaires.
- C6 (parent C6 ; AD-6, AD-7, G3) : L'outillage est qualifié avant emploi ; le plan porte opération, portée, changements exacts et préconditions. L'accord est lié à ce plan, devient caduc si les préconditions changent et ne valide aucun livrable. Succès, échec et résultat inconnu restent distincts ; aucun rejeu d'effet incertain.
- C7 (parent C6, C7 ; AD-9, G4) : Paquet reproductible, ressources et prérequis réels, réseau/certificats de chaque connexion vérifiés séparément, restauration sans relance et remplacement conservant les données. Aucune modification du proxy Zscaler n'est attendue du porteur.
- C8 (parent C8 ; boundaries) : Le graphe et ses effets restent hors de cet epic ; sa qualification G5 appartient à l'epic 4.

## Done when

1. Un profil d'initialisation exact est qualifié sur dossiers possédés ; prérequis et changements exhaustifs sont visibles avant accord. L'absence de plan sûr interdit l'application, sans réinstallation ou réparation implicite.
2. G3 démontre plan, accord lié, refus/annulation intacts, préconditions modifiées, application et vérification du résultat. Interruption, échec et résultat inconnu sont conservés sans succès ni réessai automatique.
3. Le paquet enrichi réunit les preuves de l'aperçu et de l'ouverture éditeur livrés par l'epic 2 avec leur artefact, leur portée et le retour réellement observable. Une demande OS acceptée ne prouve pas une lecture humaine.
4. La machine Windows cible reçoit le paquet exact ; prérequis, restauration sans agent et conservation après remplacement sont vérifiés avec données et ressources possédées, sans confondre les preuves de deux ASAR.
5. G4 consigne les trois parcours avec le porteur peu familier de BMad, sur projets réels et connexion Codex : ouvrir ou initialiser, comprendre état/preuves, choisir/dialoguer/approuver, retrouver fichiers et prochaine action. Langues, thèmes et états difficiles suivent les contrats ; les limites réellement testées sont nommées.
6. Toute preuve externe reportée garde test, version/artefact, blocage, portée et condition de reprise. Un report ne clôt ni G3/G4 ni l'epic ; la V1 complète exige encore le graphe G5.

## Boundaries

- Consomme les diagnostics, identités de projet/initiative, preuves et fraîcheur, catalogue/lancement qualifié, fichiers/éditeur, accueil et variantes de l'epic 2 ; les sorties 2.4–2.16 sont attendues, non acquises par ce raffinement.
- Possède l'extension d'initialisation de l'adaptateur BMad, ses contrats sous autorité du cœur et la qualification G3. Préparer n'écrit rien dans le dossier cible ; l'autorisation de développement ne remplace pas l'accord requis pour une opération réelle.
- Consomme les contrats/cycle de vie/persistance et l'infrastructure Windows de l'epic 1 ; ne les réimplémente pas. Le profil d'initialisation ne généralise pas la compatibilité à toutes les installations v7.
- Possède la qualification intégrée G4, sans second moteur BMad, nouveau fournisseur, modification de connexion SIWC, installation système implicite ou nouvelle procédure de packaging indépendante.
- Transmet à l'epic 4 une base Windows/Codex réellement vérifiée et le panneau de fichiers ; ne livre pas le graphe et n'annonce pas la V1 complète.

## References

- Parent : [initiative et exigences R4/R23/R24](../../initiative-madness.md) ; contraintes C1–C8, Done when et Boundaries.
- Architecture : [spine adopté](../../architecture-madness/architecture-madness.md), AD-1 à AD-9, G3/G4 ; identifiants et décisions inchangés.
- UX : [DESIGN adopté](../../ux-madness/DESIGN.md), [EXPERIENCE](../../ux-madness/EXPERIENCE.md) et [DESIGN racine courant](../../../../DESIGN.md). Les surfaces d'initialisation sont à compléter par Sally/Impeccable ; les contrats actuels ne sont pas leurs preuves.
- Entrées fournisseurs : [epic 2 et découpage actuel](../epic-projets-bmad/tickets/tickets.toml) ; 2.1/2.3 pour préparer la qualification, 2.17 pour les contrats de guidage, 2.16 pour le paquet et les capacités intégrées consommées. 2.8 porte aperçu/éditeur, 2.14 les variantes.
- Mandat : [autonomie du 3 novembre](../../autonomie-implementation-complete-2026-11-03.md) et [décision personnelle locale](../../decision-personnelle-locale-2026-10-28.md).

## Notes

- Risk: high — Une initialisation au mauvais endroit, un accord périmé ou un faux succès peut altérer le projet personnel et tromper le porteur novice sur les changements réellement appliqués.
- Check: au-delà des critères de réalisation, une relecture indépendante reconstruit la chaîne dossier/plan exact/accord/préconditions/effets depuis les preuves brutes et rapproche chaque conclusion G3/G4 du manifeste et de l'ASAR contrôlés ; une preuve absente ou issue d'un autre artefact laisse la conclusion ouverte.

- Decision: 2026-11-03 — Raffinement adopté sous le mandat autonome : SPEC dérive directement les trois lignes parent R4/R23/R24 avec ids locaux R1–R3 inchangés ; les companions existants et le DESIGN racine sont adoptés sans modification. Les dix entrées 3.1–3.10 sont allouées au magasin réel, checkpoints délégués. Le REPLAN change la livraison, aucun besoin : les préparations 3.1/3.2 consomment leurs seules capacités épinglées, la voie produit attend 2.16 et G4 reste en 3.10 avec participation humaine réelle. Le transfert à l'epic4 ne rend plus G4 préalable aux qualifications indépendantes du graphe ; 3.9 fournit la voie locale stabilisée à 4.4 et 3.10 la preuve finale G4 à 4.11. Aucun Build, plan, installation ou gate réussi n'est créé par cette adoption.

- Decision: 2026-11-03 — Dérivation directe : trois lignes locales, une par parent R4/R23/R24 ; aucune exigence nouvelle ni extension de provider. Les quatre epics et leurs covers restent inchangés.
- Decision: 2026-11-03 — Qualifications 3.1 et contrats UX 3.2 précèdent les consommateurs. 3.2 attend aussi les variantes2.14 pour ordonner ses écritures des spines après les extensions UX de2. Le tracer 3.4 suit le contrat 3.3 : dossier témoin non équipé → plan exact → accord explicite → application qualifiée → résultat vérifié dans le paquet. Le plan complet, ses risques et ses gardes ne sont pas réduits pour le tracer.
- Decision: 2026-11-03 — Une seule voie de code : contrats/cœur/adaptateur/pont/UI/persistance suivent la même chaîne après stabilisation des capacités intégrées de l'epic 2. La voie produit 3.3–3.9 précède l'intégration produit 4.4 ; les contrats GraphSnapshot isolés de 4.3 ne modifient pas cette voie. Le sweep nettoie les seuls constats différés ; G3 puis G4 ferment les preuves distinctes.
- Decision: 2026-11-03 — Checkpoints de plan et de fin délégués, donc false dans les entrées ; cela ne délègue ni ne simule le consentement réel requis par une opération ni la participation novice de G4. 3.10 porte hitl=true.
- Open question: Q3-1 / G3 — Quel paquet/outillage BMad exact, quelles options et quels prérequis permettent un plan exhaustif avant écriture, y compris effets indirects, fichiers existants, racines, modules et conditions d'accès ? À résoudre par 3.1 ; aucune capacité de dry-run supposée.
- Open question: Q3-2 / G3 — Quelles preuves de résultat, garanties d'annulation, invalidations de préconditions et limites après arrêt l'outillage permet-il réellement ? À qualifier par 3.1 puis vérifier dans les opérations 3.4–3.6 ; pas de promesse de rollback non prouvée.
- Open question: Q3-3 / intégration — Les livrables et preuves exactes 2.8/2.14/2.16 sont-ils disponibles et consommables sur le paquet à enrichir ? Ils sont futurs au relevé ; 3.3 et ses consommateurs attendent 2.16. Tout report de 2.16 qui bloque un travail indépendant demande un REPLAN explicite.
- Open question: Q3-4 / G4 — Quelle session réelle et quel paquet exact serviront aux trois parcours du porteur novice ? Le protocole est préparé localement ; sa participation, les décisions réelles et les résultats restent à recueillir en 3.10.
- Waits on epic-projets-bmad because: diagnostic, contexte, preuves, fichiers/éditeur et variantes réellement vérifiés sont nécessaires à l'initialisation consommable et à G4. Les préparations documentaires ne lèvent aucune dépendance.

### Décisions antérieures

Les décisions suivantes sont conservées comme historique ; le REPLAN du 3 novembre ci-dessus remplace seulement leurs prérequis de livraison devenus trop larges et leur état antérieur de raffinement.

- Decision: 2026-10-28 — Le porteur réserve Madness à son usage personnel local Windows avec abonnement ChatGPT et code privé ; la distribution à d’autres développeurs sort du besoin courant selon `../../decision-personnelle-locale-2026-10-28.md`. R23 couvert ici garde installation, prérequis et parcours sur la machine personnelle cible ; R4/R24, G3/G4, les trois parcours et les dépendances restent inchangés. Le porteur peu familier de BMad reste le participant visé. Enveloppe non raffinée, aucun nouveau ticket ni essai lancé ; contrats adoptés intacts et mentions historiques de distribution à réconcilier lors de leur prochaine mise à jour.

- Decision: 2026-10-23 — Périmètre et position après les projets existants validés par le porteur ; enveloppe non raffinée, aucune story créée.
