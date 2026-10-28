---
type: epic
title: "Initialiser un projet et qualifier les parcours Windows"
parent: initiative-madness
covers: ["R4", "R23", "R24"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: false
risk: high
---
# Initialiser un projet et qualifier les parcours Windows

## Description

À partir du diagnostic, des projets et de l'interface de l'epic 2, une version Windows installable initialise BMad avec plan exact, accord, annulation et résultat vérifié. Elle réunit les preuves G3, dont l'ouverture éditeur fournie par l'epic 2, puis G4 sur machine cible : les trois parcours réels avec novice, restauration et remplacement du programme.

## Outcome

Un développeur initialise un dossier non équipé en comprenant les changements et leur résultat ; une personne peu familière de BMad accomplit ensuite les trois parcours réels dans la base Windows/Codex installée.

## Done when

1. Le diagnostic, le contexte et les surfaces livrés par epic-projets-bmad permettent de préparer un plan d'initialisation BMad exhaustif, avec prérequis et changements exacts visibles avant l'accord.
2. G3 vérifie accord lié au plan, annulation laissant le dossier intact, préconditions modifiées, application et contrôle du résultat ; échec et résultat inconnu ne sont pas annoncés comme succès.
3. Les preuves d'aperçu et d'ouverture éditeur produites par epic-projets-bmad sont réunies aux opérations d'initialisation, avec leurs retours observables et leur récupération.
4. G4 consigne sur machine Windows cible les trois parcours avec une personne peu familière de BMad : ouvrir ou initialiser, comprendre état et preuves, choisir puis dialoguer/approuver, retrouver fichiers et prochaine action ; les variantes et les états difficiles restent utilisables.
5. Le paquet Windows personnel est installable et utilisable sur la machine cible du porteur avec son abonnement ChatGPT ; reprise après fermeture, conservation des données après remplacement et prérequis du runtime et de chaque connexion sont vérifiés. Ces preuves qualifient la base Windows/Codex ; la V1 complète exige encore le graphe G5.

## Boundaries

- Consomme le diagnostic et le contexte BMad, le panneau de fichiers, l'éditeur et l'interface bilingue à deux thèmes d'epic-projets-bmad ; utilise les contrats d'opération, de cycle de vie et de persistance d'epic-boucle-codex.
- Possède l'extension d'initialisation de l'adaptateur BMad et sa qualification G3, avec l'outillage BMad réellement qualifié. Une opération acceptée n'est pas une validation de livrable.
- Possède le contrôle intégré de la base G4 : réunit les acquis des epics 1–2 et l'initialisation sur la machine cible, sans confondre simulation HTML et preuve d'intégration.
- La procédure et l'infrastructure de packaging restent celles d'epic-boucle-codex ; cet epic vérifie le paquet enrichi et le remplacement avec conservation des données.
- Transmet à epic-graphe-projet une base Windows/Codex vérifiée et le panneau de fichiers réutilisable. Ne livre pas le graphe ni les futurs fournisseurs, et n'annonce pas la V1 entière terminée.

## References

- parent — [Initiative Madness](../../initiative-madness.md), `_bmad-output/initiative-madness/initiative-madness.md` ; Requirements R4, R23, R24 ; Constraints C1–C8, Done when, Boundaries et Notes.
- architecture — [Contrat de Winston adopté](../../architecture-madness/architecture-madness.md) ; AD-3 à AD-9 ; G3 et G4. Companion conservé sans modification, AD stables ; les gates restent des preuves à produire.
- design — [Contrat visuel adopté](../../ux-madness/DESIGN.md) ; base française claire acceptée, extensions selon C5.
- experience — [Contrat comportemental adopté](../../ux-madness/EXPERIENCE.md) ; parcours, états et accessibilité, avec décisions récentes de l’initiative prévalant sur les mentions historiques A2/Q6.
- ordre — [Découpage approuvé](../tickets.toml) ; identifiant 3 et prérequis de capacités à reporter sur les stories qui les consommeront.

## Notes

- Decision: 2026-10-28 — Le porteur réserve Madness à son usage personnel local Windows avec abonnement ChatGPT et code privé ; la distribution à d’autres développeurs sort du besoin courant selon `../../decision-personnelle-locale-2026-10-28.md`. R23 couvert ici garde installation, prérequis et parcours sur la machine personnelle cible ; R4/R24, G3/G4, les trois parcours et les dépendances restent inchangés. Le porteur peu familier de BMad reste le participant visé. Enveloppe non raffinée, aucun nouveau ticket ni essai lancé ; contrats adoptés intacts et mentions historiques de distribution à réconcilier lors de leur prochaine mise à jour.

- Decision: 2026-10-23 — Périmètre et position après les projets existants validés par le porteur ; enveloppe non raffinée, aucune story créée.

- Waits on epic-projets-bmad because: le diagnostic qualifié, le contexte projet, les preuves, l'éditeur et les variantes UX sont nécessaires pour initialiser puis vérifier les trois parcours Windows.
