# Contrat d’initialisation 3.3 — vérification du worker

Exécution dans le worktree bmad-help-2-2, le 5 novembre 2026. Le plan approuvé et son unique contexte frontmatter (profil-g3.md) ont été chargés intégralement avant les modifications. Références ciblées du Code Map et états UX3.2 consultés ; aucun nouveau besoin ou changement de périmètre.

## Livraison

- src/contracts/bmad-initialization.ts : DTO v1 stricts/détachés, inventaire intégral des ajouts et données préservées, paramètres matérialisés, exclusion du lock privé, limites ; commandes, observations et résultats/conservation/inspection distincts. Ports hôtes privés et port d’annexe CAS, sans adaptateur réel.
- src/core/bmad-initialization.ts : capacités retenues dans des champs privés ECMAScript ; admission des seuls plans/faits originaux reconnus par le registre privé du producteur. Captures configuration sans initiative obligatoire ; accord explicite consommé une fois, recontrôle exhaustif avant effet, verrou de cible physique, invalidation/fermeture et historique. Reprise passive et retry stockage seul.
- tests/bmad-initialization-contract.test.mjs : doubles en mémoire ; seuls ActivityAdmission et LifecycleCoordinator existants sont employés. Aucun fichier projet, enfant, outil BMad, fournisseur ou réseau n’est appelé par les doubles.

Les commandes futures de renderer pourront porter les ids du DTO : la capacité reste retrouvée côté cœur, jamais transportée par une copie IPC. La forme correcte d’un DTO n’est pas un sceau. La comparaison des données originales au sceau détenu refuse aussi une mutation après admission. Une publication synchrone de phase ne laisse plus de fenêtre de mutation avant dispatch : derniers contrôles et appel sont contigus.

## Commandes et résultats

- Premier rouge : node --test --test-name-pattern 'C1 accepts' tests/bmad-initialization-contract.test.mjs — 1 échec attendu, validateur encore absent.
- Premier passage complet : 45/47 ; deux fixtures corrigées (empreinte synthétique incohérente avec les octets affichés ; ancien reçu vérifié conservé dans un faux état en vol). Le premier typecheck a signalé les rétrécissements TypeScript corrigés localement.
- Régressions rouges réellement reproduites puis corrigées : annulation pendant préparation privée ; admission helper retenue pendant sauvegarde ; inspection historique absente ; mutation synchrone à la dernière publication ; admission imbriquée avec le propriétaire de contexte existant.
- Final : node --test tests/bmad-initialization-contract.test.mjs — **54/54, 0 échec, 0 skip**, sortie 0.
- Final : npm run typecheck — **deux projets TypeScript passent**, sortie 0.
- git -c core.longpaths=true diff --check -- [quatre chemins possédés] — sortie 0. Les quatre contrôles no-index contre /dev/null sortent 1 (ajouts comparés au vide), avec seulement les avertissements autocrlf, sans diagnostic d’espaces ; le contrôle explicite UTF-8/LF/absence d’espaces finaux passe sur les quatre fichiers.
- Aucune suite globale, compilation produit, campagne native/Electron, capture, installation ou NSIS.

## Matrice exécutée

| Cas | Comportement observé |
|---|---|
| C1 | Copie détachée ; versions/champs/getters/cycles/symboles/prototypes/valeurs non admis refusés sans appeler les getters. |
| C2 | Traversée/absolu/ambiguïtés Windows/collisions/parents manquants/ancêtres fichiers/lock exclu refusés ; inventaire et contenu exact consultables, octets et hash relus sur le double. |
| C3 | Accord courant explicite ; un seul appel apply ; clone/restauration sans capacité ; lecture de contexte et sauvegarde ne monopolisent pas l’admission de l’application. |
| C4 | Identités projet/racine/parent/contexte/profil/source/payload/tentative/génération étrangères refusées avant apply ; préconditions arbre/parent/source/payload distinctes de assertFresh ; mutations initiales et synchrones refusées. |
| C5 | Fermeture/annulation/refus rendent le plan historique/inactif ; préparation pending annulée et plan tardif ignoré ; nouvelle préparation volontaire distincte. |
| C6 | Doublon même cible et accord consommé refusés sans file ; copie/rejeu/ordre/identité d’un événement étrangers refusés ; données conservées sous l’ancienne identité. |
| C7 | Succès uniquement sur fait original exhaustif union/octets préservés/arrêt ; JSON, exit0, copie et exception restent inconnus ; partiel/échec avant effet attesté distincts ; fermeture après effet possible inconnue, preuve tardive corrélée. Mutation ultérieure du fait sans effet sur le reçu retenu. |
| C8 | Résultat vérifié et sauvegarde échouée distincts ; retry write seul ; réouverture sans capture/helper/inspection/accord/application ; cible incertaine encore bloquée ; inspection historique volontaire sans grant ni réapplication. |

## Limites transmises au parent

Les hôtes sont des doubles de confiance qui conservent leurs originaux dans des WeakMap. Le futur adaptateur doit fournir un registre privé équivalent et établir réellement inventaire exhaustif, source/payload, identité physique/parent, union finale, octets et arrêt possédé. Le contrat ne protège pas contre un hôte de confiance mensonger ni contre des traps Proxy actifs. La validation syntaxique ne démontre aucune propriété physique.

L’entrée Lifecycle de ce service protège le dispatch dans la cible. Les helpers de préparation privée doivent rester possédés et arrêtés par le même propriétaire Lifecycle existant, côté futur hôte ; aucun arrêt de processus n’est déduit de la simple résolution de prepare. Les admissions de lecture de contenu/inspection relèvent également des ports de lecture/récupération existants. Le blocage global d’un arrêt inconnu n’est jamais levé par ce service, y compris après inspection ou preuve tardive. Une inspection ne suffit pas à réautoriser un ancien plan ; le nouveau périmètre sûr et la récupération native restent à raccorder/qualifier dans les stories suivantes.

La persistance est un port d’annexe v1/CAS seulement. Les courses physiques, interruptions natives, arrêt des vrais helpers, stockage atomique réel et protections Windows restent à qualifier en 3.4/3.6/3.7. Aucun adaptateur Main/preload/renderer/ressource/paquet, Snapshot v1, approbation Mary, contrat Graph ou profil personnel modifié. Aucun gate G2–G5 acquis. Parent seul responsable des revues, du plan, des statuts et du commit ; aucun commit effectué par le worker.

## Correction de revue

Les dix régressions ajoutées ont échoué sur le code précédent. La suite ciblée est passée à **64/64, sans skip** après correction.

| Constat | Comportement vérifié |
|---|---|
| Q1 | La seule mutation du plan sur le producteur d’origine empêche l’application. Les méthodes privées restent celles capturées lors de la préparation. |
| Q2 | L’intention consommée est durable avant le recontrôle et l’application. Le vrai reçu sauvegardé pendant une application bloquée restaure une cible incertaine et verrouillée. Un échec de la sauvegarde d’intention laisse à zéro les compteurs de recontrôle exhaustif et d’application. L’échec de sauvegarde après un résultat vérifié reste couvert séparément. |
| Q3 | Un fait original admis pendant l’application ou le contrôle reste terminal et conserve son reçu et son arrêt après un retour dupliqué, invalide ou rejeté. L’arrêt par Lifecycle seul continue à admettre la preuve tardive corrélée tant que le service est ouvert. |
| Q4 | Le candidat et les révisions CAS sont capturés avant l’annonce de sauvegarde. Un écouteur synchrone ne mélange plus leurs révisions. Le double strict valide le plan prêt et l’état historique successifs. |
| R1 | Les chemins de lecteur Windows avec antislashs sont validés pour la relation racine–parent. Les chaînes capturées restent exactes dans le DTO et dans le rattachement au contexte. |
| R2 | La fermeture draine l’écriture déjà admise. L’inspection encore en attente, son écriture et toute nouvelle sauvegarde sont refusées après fermeture. |

Commande du worker après correction `node --test tests/bmad-initialization-contract.test.mjs`. Les autres vérifications de clôture relèvent du parent.

## Clôture parent

Après reprise de l’accès au worktree, le worker d’origine a traité les six constats. Le relecteur Quick d’origine a confirmé Q1–Q4 par inspection. Le parent a relu R1/R2 et exécuté `node --test tests/bmad-initialization-contract.test.mjs` (64/64, aucun skip, environ 460 ms) puis `npm run typecheck` (deux projets, code 0). Les deux preuves JSON décrivent les défauts avant correction. Les régressions couvrent le rattachement exact du chemin natif et la fermeture avec inspection et écriture en attente. Aucun constat différé. L’intention figée garde son empreinte SHA-256 `545a91b32db5f208ca172e401f937b9f2a1c58767dd7370e0edda737abb8e90e`.

Cette clôture vérifie la frontière à l’aide de doubles. Le raccordement UI/IPC, les écritures natives, le stockage réel et les preuves G3 restent aux lots suivants. Aucune campagne longue, appel réseau, installation ou reprise de projet réel.
