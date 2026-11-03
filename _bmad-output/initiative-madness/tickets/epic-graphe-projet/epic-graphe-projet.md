---
type: epic
title: "Explorer le graphe du code et des dépendances"
parent: initiative-madness
covers: ["R28", "R29", "R30", "R31"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md", "DESIGN.md"]
refined: true
risk: high
---
# Explorer le graphe du code et des dépendances


## Description

Sur la base Windows/Codex et les capacités locales réellement livrées, le paquet Windows intègre le graphe Graphify à la demande : code/dépendances, recherche, relations accessibles, ouverture du fichier, provenance, confiance et fraîcheur. La qualification de l'outillage, les contrats du cœur et le parcours Sally/Impeccable précèdent leurs consommateurs. G5 vérifie le module réel ; son usage reste optionnel mais sa livraison appartient à la V1.

## Outcome

Depuis le projet ouvert dans la base Windows/Codex, le porteur génère et explore le graphe local du code et des dépendances, retrouve les fichiers associés et comprend les limites, les incertitudes et la fraîcheur, sans effet sur ses sources ou ses intégrations.

## Requirements

- R1 (parent R28) : Depuis un projet ouvert, générer ou actualiser à la demande un graphe local du code, des modules, fichiers et dépendances, rattaché explicitement au projet et au périmètre analysé ; cet outil est livré dans la V1 après la base Windows/Codex, son utilisation reste optionnelle.
- R2 (parent R29) : Rechercher et explorer les éléments du graphe, comprendre le sens, la provenance et le degré de certitude des relations, puis ouvrir le fichier associé dans le panneau existant ; une recherche et une liste de relations accessibles complètent la représentation graphique.
- R3 (parent R30) : Distinguer graphe absent, analyse en cours, résultat disponible, partiel, ancien, incompatible ou en échec ; rendre sa fraîcheur explicite malgré les modifications non commitées ou survenues pendant l'analyse. Rafraîchissement, interruption ou échec conservent le dernier graphe complet connu ; l'indisponibilité du graphe laisse les parcours BMad utilisables et ne signifie aucune validation ni complétude de la solution.
- R4 (parent R31) : Vérifier le graphe dans le paquet Windows sur un dépôt représentatif : génération sans modèle implicite, isolation des effets, fidélité des relations, recherche et accès au fichier, projets multiples, modifications de sources, interruption, erreurs et contrôles accessibles ; consigner performances et limites observées avant de déclarer le périmètre V1 complet.

## Constraints

- C1 (parent C1, C5 ; AD-8) : Sally et Impeccable définissent le nouveau parcours et ses états avant les surfaces ; charte atelier adoptée et DESIGN racine courant conservés, avec FR/EN, clair/sombre, clavier, focus, zoom et mouvement réduit.
- C2 (parent C2, C3, C4, C7) : Windows personnel local, code privé, Codex et SIWC existant ; aucune migration BMad, modification d'authentification/facturation ou nouveau fournisseur.
- C3 (parent C6 ; AD-1, AD-2, AD-5, AD-10) : Le cœur possède port d'analyse, GraphSnapshot, validations communes et cycle de vie avant consommateurs ; l'adaptateur décode/valide/normalise Graphify. Le renderer ne reçoit pas le payload natif et n'exécute pas son HTML ; les ressources de rendu sont locales.
- C4 (parent C8 ; AD-10, G5) : Premier profil code/dépendances seulement ; --code-only, GRAPHIFY_BACKEND=none, GRAPHIFY_NO_AUTO_REFRESH=1 et GRAPHIFY_OUT=graphify-out imposés dans le seul enfant à environnement filtré. Aucun modèle implicite, enrichissement sémantique, intégration agent/MCP ni installation de skills/hooks.
- C5 (parent C6, C8 ; AD-10, G5) : Une analyse possède processus et espace Madness distinct par projet/analyse ; racine explicite, CWD/sorties/cache confinés et identité de publication vérifiée. Sources, instructions, skills, hooks, plugins et configurations projet/utilisateur restent inchangés, y compris si des réglages hérités tentent un autre chemin.
- C6 (parent C6, C8 ; AD-10) : Le profil qualifié valide outil/type/version de schéma et conserve provenance, références fichiers/lignes et niveaux EXTRACTED/INFERRED/AMBIGUOUS ; _src/_tgt priment, sinon source → target même si directed=false. Les variantes links/edges ne sont admises que dans le profil vérifié.
- C7 (parent C6 ; AD-5, AD-10) : Snapshots liés à projet/racine/périmètre/révision incluant les changements non commités ; résultat modifié pendant analyse jamais annoncé actuel. Publication atomique du résultat admis, dernier complet conservé avec fraîcheur, restauration sans analyse ou agent automatique.
- C8 (parent C6, C7 ; AD-9, G5) : Runtime Python, paquet exact, formats, notices et performances se qualifient sur Windows avant disponibilité ; les qualifications locales de runtime, effets et formats consomment la base 1.11 et le contexte 2.3 ; G4 reste requis pour la qualification finale intégrée et la clôture V1, sans bloquer ces travaux indépendants. Aucun nouveau minimum de performance arbitraire ni qualification déduite d'une recherche de sources.

## Done when

1. Le profil d'outil/runtime, l'isolation et les formats sont qualifiés sur témoins possédés ; le port d'analyse et GraphSnapshot sont établis sous autorité du cœur avant leurs consommateurs et Sally/Impeccable fixent le parcours avant l'UI.
2. Dans le paquet Windows, générer/actualiser reste volontaire et code-only ; zéro appel de modèle implicite et confinement des écritures/cache sont vérifiés par analyse/projet, sans mutation des sources ou intégrations utilisateur.
3. Recherche, exploration et liste accessible conservent sens, provenance et confiance. La sélection rejoint le panneau de fichiers du projet du snapshot après revalidation de référence ; aucun changement de projet ne réattribue le graphe.
4. Absent, analyse, disponible, partiel, ancien, incompatible et échec restent distincts. Sources non commitées, mutation pendant analyse, rafraîchissement, interruption, fermeture, échec et conservation du dernier complet sont vérifiés sans activité d'agent BMad inventée.
5. G5 consigne génération/recherche/fichier, fidélité, plusieurs projets, refus/erreurs, ressources possédées, durée et mémoire observées, contrôles accessibles et variantes sur dépôt représentatif dans le paquet exact.
6. Le paquet enrichi livre le module et ses limites réelles après la base G4. Le graphe indisponible laisse BMad utilisable ; aucun état du graphe ne valide BMad ou la solution. La V1 complète n'est annoncée qu'avec les preuves applicables, sans report G4/G5 transformé en succès.

## Boundaries

- Consomme d'abord la base Windows/Codex, les contrats/cycle de vie/persistance et le paquet prouvés par 1.11, puis le contexte projet de 2.3 pour 4.1–4.3. L'intégration produit 4.4 attend réellement fichiers/éditeur 2.8, variantes 2.14 et voie d'initialisation locale stabilisée 3.9 ; la qualification finale 4.11 attend aussi G4 par 3.10. Aucun fournisseur futur n'est annoncé built par cette adoption.
- Possède l'adaptateur Graphify, sa normalisation, le runtime/profil exacts et leur packaging, l'extension du port commun sous autorité du cœur, les ressources de rendu locales et la nouvelle vue Sally/Impeccable.
- Utilise une seule voie produit et les propriétaires existants. Avant 4.4, 4.2 écrit uniquement le supplément UX du graphe dans cet epic et 4.3 ses propres contrat/port/validations isolés ; ils ne modifient ni les spines partagés, ni les contrats existants, Main/preload/UI/persistance/cycle de vie. 4.4 réconcilie ces apports avec les spines et fournisseurs stabilisés avant de les brancher. Aucun service distant, second stockage métier, moteur BMad ou fournisseur d'agents n'est introduit.
- Hors premier profil : analyse sémantique des documents BMad, recherche par modèle, installations de skills/hooks, intégration agent/MCP et exécution du HTML Graphify. La préparation primaire récente ne les autorise pas.
- L'usage du graphe est optionnel ; sa livraison et G5 restent nécessaires à la clôture V1, sans ajouter une étape BMad obligatoire.

## References

- Parent : [initiative R28–R31 et C1–C8](../../initiative-madness.md).
- Architecture : [spine adopté](../../architecture-madness/architecture-madness.md), AD-1/AD-2/AD-5/AD-8 à AD-10, G5. Le relevé Graphify 0.9.94 reste historique ; aucune version candidate n'est adoptée ici.
- UX : [DESIGN adopté](../../ux-madness/DESIGN.md), [EXPERIENCE](../../ux-madness/EXPERIENCE.md) et [DESIGN racine courant](../../../../DESIGN.md). Graphe à étendre par Sally/Impeccable avant code.
- Préparation de sources : [relevé primaire frais du 3 novembre](../../.working/graphify-current-source-prep-2026-11-03.md), graphifyy 0.9.101, commit 8e6a6d2129d4aeffc7a0e9ed79b153f7f057f42b ; lecture documentaire uniquement, sans installation/analyse ni qualification. 4.1 choisit et qualifie explicitement l'assemblage.
- Fournisseurs : [découpage de l'epic 2](../epic-projets-bmad/tickets/tickets.toml), [epic 3 adopté](../epic-initialisation-bmad/epic-initialisation-bmad.md) ; 3.9 fournit la voie locale stabilisée, 3.10 la qualification finale G4 réellement requise.
- Mandat : [autonomie du 3 novembre](../../autonomie-implementation-complete-2026-11-03.md).

## Notes

- Risk: high — Une analyse mal confinée peut modifier les sources ou intégrations du porteur ; une relation ou fraîcheur trompeuse peut lui faire comprendre et ouvrir le mauvais fichier du projet.
- Check: au-delà des critères de réalisation, une relecture indépendante contradictoire rapproche l'assemblage runtime, la matrice d'effets et les relations/provenances de témoins des sources et du manifeste/ASAR exacts ; elle vérifie que chaque conclusion G5 repose sur cet artefact et qu'aucun report G4/G5 n'est devenu succès.

- Decision: 2026-11-03 — SPEC adopte les quatre lignes parent R28–R31 en R1–R4 inchangés et les companions existants sans les modifier ; les onze entrées 4.1–4.11 sont allouées avec checkpoints délégués. REPLAN de livraison explicite : l'ancien gate entier 4→epic3/G4 est remplacé par les capacités consommées. AD-10 distingue l'adaptateur d'analyse des workflows ; 1.11 livre déjà Windows/Codex, cycle de vie et persistance, 2.3 le contexte. 4.1 peut qualifier des espaces possédés, 4.2 son supplément UX et 4.3 ses contrats isolés avant G4. La voie produit 4.4 attend 2.8/2.14/3.9 et réconcilie les artefacts préparatoires sans voie produit parallèle ; 4.11 garde 3.10/G4. G3/G4/G5 et leurs preuves humaines/externes restent nécessaires à la livraison finale complète ; aucune capacité, permission, résultat inconnu ou contrainte d'effets n'est levé. Le besoin de zone Graphe existe déjà en R28–R31 : onglet réel du projet ouvert, recherche/zoom/relations/nœud→fichier, Sally et Impeccable ; aucun placeholder. Aucun outillage d'initialisation BMad ou Graphify n'est installé ou exécuté ; seuls le protocole Sofia et les commandes de lecture/validation du magasin sont exécutés. Aucun Build ni réussite produit n'est déduit de cette adoption.

- Decision: 2026-11-03 — Le porteur confirme une zone pour voir Graphify du projet ouvert dans cette version. La réalisation retenue est un onglet projet « Graphe », avec recherche, zoom, relations et sélection de nœud vers son fichier, conçu avec Sally et Impeccable avant ses surfaces. Cette vue est réellement intégrée à la V1 à livrer ; un simple placeholder ne satisfait pas cette décision. Les Requirements dérivées et leurs covers restent inchangés, ainsi que les preuves finales G4 et G5 ; cette confirmation ne vaut aucune qualification acquise.

- Decision: 2026-11-03 — Quatre lignes dérivées une pour une des parent R28/R29/R30/R31, sans nouvel epic, exigence ou fournisseur ; AD-10 reste l'autorité.
- Decision: 2026-11-03 — 4.1 qualifie l'outillage et ses effets ; 4.2 fixe l'UX ; 4.3 établit le contrat d'analyse sous autorité du cœur. Le tracer 4.4 est projet de référence → génération code-only isolée → snapshot normalisé → recherche/liste → panneau de fichiers dans le paquet. Les preuves de ce chemin étroit ne closent pas tout G5.
- Decision: 2026-11-03 — Une seule voie de code ordonne normalisation, fraîcheur, cycle de vie, exploration accessible et paquet. Le sweep précède la qualification finale G5 ; aucun nettoyage ne remplace un besoin de fonctionnalité.
- Decision: 2026-11-03 — Checkpoints plan/done délégués, false dans les entrées ; aucun consentement humain ou validation G4 inventé. Aucun Build4 ou installation d'outil n'est lancé par cette adoption.
- Open question: Q4-1 / G5 — Quel assemblage exact Python/graphifyy/dépendances AST/wheels Windows est reproductible et acceptable dans le paquet personnel ? 0.9.101 est un candidat documentaire frais, pas une version qualifiée. 4.1 règle le profil, 4.9 le vérifie dans le paquet final.
- Open question: Q4-2 / G5 — Le profil code-only observé garantit-il réellement zéro modèle implicite et absence d'effets hors espaces possédés, y compris auto-refresh ancien, plugins/skills existants et variables de sortie/cache héritées ? 4.1 qualifie avec témoins expurgés ; aucune installation Graphify/skill/hook n'est implicite.
- Open question: Q4-3 / G5 — Quel profil de schéma, sens, confiance et références est effectivement émis et fiable, notamment links/edges, _src/_tgt, fichiers non suivis et dépendances ? 4.1 produit les fixtures, 4.3/4.5 normalisent et vérifient.
- Open question: Q4-4 / rendu — Quels rendu local, projection et limites d'affichage préservent recherche/liste clavier et mémoire sur dépôt représentatif ? 4.2 fixe les comportements, 4.1 mesure un premier profil et 4.8/4.11 vérifient ; aucun seuil numérique n'est inventé.
- Waits on epic-initialisation-bmad because: 3.9 stabilise la voie produit avant intégration 4.4 et 3.10 fournit la preuve finale G4 à 4.11 ; aucun gate entier n'interdit les travaux indépendants 4.1–4.3.

### Décisions antérieures

Les décisions suivantes sont conservées comme historique ; le REPLAN du 3 novembre ci-dessus remplace seulement leurs prérequis de livraison devenus trop larges et leur état antérieur de raffinement.

- Decision: 2026-10-23 — Le porteur valide cet epic après la base Windows/Codex ; l'usage du graphe est optionnel mais sa livraison fait partie de la V1. Enveloppe non raffinée, aucune story créée.
