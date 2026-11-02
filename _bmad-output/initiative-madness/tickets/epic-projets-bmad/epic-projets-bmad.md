---
type: epic
title: "Comprendre et piloter ses projets BMad existants"
parent: initiative-madness
covers: ["R1", "R2", "R3", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R19", "R20", "R21", "R26", "R32"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: true
status: in-progress
risk: high
---
# Comprendre et piloter ses projets BMad existants

## Description

Depuis le socle et le dialogue de l'epic 1, une version Windows installable retrouve plusieurs projets et leurs initiatives, qualifie le profil BMad G2, montre état et preuves, propose l'aide et tout le catalogue installé, puis rejoint la conversation réelle. Elle établit avant ses consommateurs les règles et extensions de contrats nécessaires au temps et au coût par US, qualifie les données disponibles puis affiche mesures et indisponibilités. Elle livre les aperçus et l'ouverture éditeur, la navigation accessible ainsi que français/anglais et clair/sombre après extension des contrats par Sally.

## Outcome

Un développeur retrouve ses projets BMad et leurs initiatives, explique l'état à partir de preuves, choisit une possibilité motivée dans le catalogue réel puis poursuit dans la conversation Codex, en français/anglais et clair/sombre. Il consulte le temps et le coût rattachés à une US, en comprenant la provenance, la couverture et les données indisponibles.

## Requirements

- R1 (parent R1) : Ouvrir un ou plusieurs projets locaux, dont un projet BMad déjà en cours, et retrouver pour chacun son contexte, ses initiatives et ses livrables sans réinitialisation imposée.

- R2 (parent R2) : Retrouver à l'accueil les projets récents et leurs attentes nommées, puis ouvrir directement le projet ou le point de réponse, de relecture, d'interruption ou d'erreur concerné.

- R3 (parent R3) : Diagnostiquer à l'ouverture puis avant une opération ses prérequis utiles, l'accès au dossier, la présence de BMad et la compatibilité effective de v7 ; distinguer absence, ancienne version et v7 incompatible ou inconnue, avec une explication et une action de récupération.

- R4 (parent R5) : Identifier le projet et l'initiative active, retrouver et choisir les autres initiatives repérées, et rattacher état, action et fichiers au bon contexte ; changer d'initiative ne réattribue pas les anciens échanges ou résultats, et les outils sans initiative restent accessibles.

- R5 (parent R6) : Présenter le parcours BMad et son état connu à partir des artefacts du projet ; les étapes, livrables et interprétations affichés renvoient à leurs preuves consultables et rendent les informations manquantes explicites.

- R6 (parent R7) : Prendre en compte les fichiers BMad modifiés hors de Madness, actualiser les preuves et retrouver les résultats sans perdre la saisie courante ; ne pas inventer la session, l'auteur, l'activité ou la validation d'origine.

- R7 (parent R8) : Distinguer situation du projet, activité de l'agent et acceptation humaine, ainsi que fait observé, déduction et proposition ; ni présence de fichier ni fin d'exécution ne suffit à afficher une validation humaine.

- R8 (parent R9) : Expliquer une prochaine action à partir de bmad, de l'aide des modules installés et des preuves du projet, en distinguant aide chargée et recommandation produite par l'agent ; proposer les alternatives utiles sans imposer une séquence obligatoire.

- R9 (parent R10) : Explorer et rechercher l'ensemble des compétences réellement installées, y compris outils transversaux et modules présents ; exclure les métadonnées non invocables, expliquer absence ou incompatibilité et permettre de corriger une recherche vide, sans liste ni quota figés.

- R10 (parent R11) : Consulter pour chaque action son objectif, l'invocation Codex exacte et copiable, ses entrées, ses conditions et ses effets ou livrables attendus ; une action indisponible explique ce qui manque et ne se présente pas comme exécutable.

- R11 (parent R19) : Lire les livrables dans un aperçu intégré et agrandissable avec chemin, provenance, portée et statut connu, puis demander leur ouverture dans l'éditeur ; constater la réussite ou expliquer l'échec réel, avec copie du chemin disponible, sans perdre le contexte.

- R12 (parent R20) : Réduire et redéployer le menu gauche, consulter les fichiers et redimensionner la fenêtre sans perdre projet, initiative, conversation ou saisie ; garder les destinations et attentes identifiables, mémoriser la préférence de navigation et rester utilisable si ce stockage échoue.

- R13 (parent R21) : Utiliser les actions au clavier avec noms accessibles, focus visible et rendu au déclencheur après fermeture ; comprendre les états sans couleur ni survol seuls, conserver lecture et commandes au zoom, et respecter la réduction de mouvement selon les contrats UX.

- R14 (parent R26) : Utiliser la V1 en français ou en anglais et en thème clair ou sombre, en conservant contexte et saisie lors d'un changement ; les identifiants techniques, invocations, chemins et artefacts du projet gardent leur contenu et leur langue propres.

- R15 (parent R32) : Consulter dans Madness le temps et le coût associés à une user story du projet ouvert, avec un rattachement identifiable à cette US et une indication explicite lorsqu’une mesure ou un montant n’est pas disponible.

## Constraints

- C1 (parent C1) : L'expérience utilisateur est le premier critère d'arbitrage du périmètre, de l'architecture et des interactions ; les décisions doivent préserver compréhension, guidage et contrôle par un développeur qui découvre BMad.

- C2 (parent C2) : Le périmètre livré est Windows, Codex et BMad v7 uniquement ; une étiquette v7 ne suffit pas à garantir la compatibilité de ses formats et compétences.

- C3 (parent C3) : Les projets et leurs artefacts BMad locaux existants restent exploitables ; la reprise ne requiert ni migration d'une ancienne version ni reconstruction supposée de conversations externes.

- C4 (parent C4) : L’intégration retenue doit être vérifiée contre les interfaces, versions, capacités et modes d’authentification officiellement disponibles pour un projet personnel exécuté localement. La connexion SIWC propre à Madness déjà livrée et l’abonnement ChatGPT sont conservés, sans changement implicite d’authentification ni de facturation.

- C5 (parent C5) : DESIGN.md et EXPERIENCE.md sont les contrats visuel et comportemental adoptés et prévalent sur les maquettes ; la base française claire reste acceptée. Sally complète les contrats pour l'anglais, le sombre et la vue Graphe avec Impeccable avant les implémentations concernées ; leurs hypothèses et limites restent explicites, sans preuve d'intégration déduite de la simulation.

- C6 (parent C6) : Le socle retenu est Electron + React + TypeScript, starter electron-vite et packaging electron-builder. Le contrat d'architecture adopté gouverne les frontières, contrats partagés, autorités et profils qualifiés des lots ; ses décisions AD-1 à AD-10 gardent leurs identifiants. Les versions candidates restent à qualifier avant leurs consommateurs.

- C7 (parent C7) : Madness est réservé au porteur, en local sous Windows, avec code privé ; aucune distribution à d’autres développeurs ni publication du code n’est requise. L’usage en environnement professionnel reste possible : les previews sont autorisées si choisies et signalées ; le runtime doit être acceptable par le proxy cible, sans exigence du tout dernier Chromium exact. La reconstruction et la réinstallation doivent rester simples ; l’auto-updater n’est pas requis pour la V1.

## Done when

1. La version Windows installable réutilise les contrats de contexte, dialogue et persistance livrés par epic-boucle-codex ; plusieurs projets, leurs initiatives, récents et attentes sont retrouvés sans réinitialisation ni réattribution d'échanges.
2. G2 qualifie les structures et fonctions BMad prises en charge : absence, ancien format, installation inconnue/incompatible, modules et catalogue partiel, initiatives et changements externes sont distingués à partir des profils réellement observés.
3. État, déductions et acceptations renvoient à leurs preuves et à la révision concernée ; une modification externe actualise les projections sans perdre la saisie ni inventer auteur ou conversation. Temps et coût sont associés à une US identifiable selon les règles cadrées en Q8/Q9 ; provenance, couverture et indisponibilité sont vérifiées, y compris après réouverture. Un montant absent n’est ni inventé ni assimilé au tarif API d’un abonnement.
4. L'aide contextualisée et le catalogue installé permettent recommandation expliquée, alternatives, recherche, objectif, invocation, entrées, conditions et effets. Les actions rejoignent le lancement et le dialogue réels du connecteur de l'epic 1 ; aucun workflow n'est privilégié ou rendu obligatoire par le catalogue.
5. L'aperçu de fichiers et la demande d'ouverture éditeur sont vérifiés avec leurs retours observables et leurs échecs. Ces preuves contribuent à G3 et sont transmises à epic-initialisation-bmad.
6. Après extension des contrats par Sally avec Impeccable, la version intégrée livre français/anglais et clair/sombre ; navigation rétractable, clavier, focus, zoom, redimensionnement et transitions préservent contexte et brouillon. Les contrôles concrets sont consignés, sans conformité WCAG prétendue.

## Boundaries

- Consomme le paquet, le contexte, le dialogue et la persistance d'epic-boucle-codex ; possède diagnostic, preuves, catalogue, aide, accueil multi-projet, navigation et panneau de fichiers.
- Élargit la qualification du profil BMad de référence déjà nécessaire à l'epic 1 ; G2 ne bloque pas rétroactivement la preuve de référence, mais conditionne l'annonce des installations et actions supplémentaires prises en charge.
- Fournit au connecteur Codex les actions du catalogue et leurs entrées ; ne redéfinit pas les contrats de conversation, capacités, demandes ou résultats connus/inconnus.
- Possède R32 : rattachement aux US et extensions versionnées des contrats de contexte, mesure, connecteur et persistance sous l’autorité du cœur, avant les consommateurs d’affichage. Q8/Q9 cadrent les mesures et données réellement disponibles ; Sally complète le parcours avant implémentation. Les états connus/inconnus, la compatibilité des historiques et l’absence de relance automatique restent préservés. Les stories terminées de l’epic 1 ne sont pas rouvertes pour introduire ces mesures.
- Fournit le diagnostic, le contexte projet et les retours éditeur consommés par epic-initialisation-bmad ; epic-graphe-projet réutilise son panneau de fichiers.
- Possède la cohérence UX des variantes et de l'accessibilité, avec Sally/Impeccable avant implémentation. Chaque autre epic vérifie ses propres surfaces selon ces mêmes contrats ; la base française claire reste acceptée.
- L'application effective de l'initialisation est dans epic-initialisation-bmad ; la vue Graphe et Graphify sont dans epic-graphe-projet. L'observation de fichiers externes ne devient pas synchronisation de conversations externes.

## References

- parent — [Initiative Madness](../../initiative-madness.md), `_bmad-output/initiative-madness/initiative-madness.md` ; Requirements R1, R2, R3, R5, R6, R7, R8, R9, R10, R11, R19, R20, R21, R26, R32 ; Constraints C1–C7, Done when, Boundaries et Notes, notamment Q8/Q9.
- architecture — [Contrat de Winston adopté](../../architecture-madness/architecture-madness.md) ; AD-1 à AD-8 ; G2 et contribution éditeur à G3. Companion conservé sans modification, AD stables ; les gates restent des preuves à produire.
- design — [Contrat visuel adopté](../../ux-madness/DESIGN.md) ; base française claire acceptée, extensions selon C5.
- experience — [Contrat comportemental adopté](../../ux-madness/EXPERIENCE.md) ; parcours, états et accessibilité, avec décisions récentes de l’initiative prévalant sur les mentions historiques A2/Q6.
- ordre — [Découpage approuvé](../tickets.toml) ; identifiant 2 et prérequis de capacités à reporter sur les stories qui les consommeront.

## Notes

- Decision: 2026-11-02 — Entrée2.1 built sous bmad-build full/Quick et audit indépendant des frontières high. Profil candidat et contrats dans qualification-profil-g2/profil-g2.md ; candidat finald499…15/15sans skip,470assertions/29observations,558inputs identiques,583empreintes avant/après et30runs audités. Quick[] ; BV5-1 corrigé/recontrôlé résolu, aucun correctif différé. Ni produit, configuration personnelle ni application installée modifiés ; G2 intégré reste pour2.16. Les17entrées et leur ordre sont conservés :2.17Sally/Impeccable est la prochaine entrée, avant tracer2.2 ; aucun de ces Builds démarré. Les décisions suivantes sont historiques.

- Decision: 2026-10-28 — Build2.1 démarré après la qualification indépendante du cache/réseau (ebe2bb3), sous le mandat explicite de reprise du porteur. Ce spike produit un profil candidat et des contrats documentaires, sans modifier le produit ni lever G2 intégré. L’epic est en cours ; les17entrées et leur ordre restent inchangés, Sally2.17 précède toujours le tracer2.2. La qualification réseau n’est pas une nouvelle dépendance technique de2.1.

- Decision: 2026-10-28 — Le prérequis1.11 est désormais built dans8880b17 : G0/G1 technique sur le profil personnel Windows/SIWC et Mary/Forge de référence, avec les preuves qualification-e2e/parent-verification.md sous l’epic1. La refonte demandée est built dans5d135f9 : Sally a mis à jour les deux contrats adoptés ; trois expertises indépendantes et Impeccable ont fourni leurs constats, corrigés et recontrôlés, avec verdict ciblé ship. Candidat0.1.2 ASAR6664da10ba09364dd5e7584ad812848d48b7bb8f4c48508507434825770684c8,355tests,75contrôles intégrés et12contrôles de disposition/conservation ; preuves ../../ux-madness/qualification-refonte/parent-verification.md et finish-verdict-q1.md. L’inconnue de préparation de la refonte est résolue et retirée de l’entrée1. Ces preuves ne deviennent ni accord visuel humain global, ni G2–G5. Les17entrées restent planifiées, sans feuille ni Build2 ; Q8/Q9 demeurent ouvertes et l’entrée12 garde son inconnue propre. Le prochain workflow est bmad-build sur2.1, puis Sally17 avant le tracer2.

- Decision: 2026-10-28 — Relecture indépendante Ticket/Set/Tree appliquée : reprises parent R8/R10/C1 corrigées sans métadonnées parasites ;17 ajouté avant les nouveaux parcours et12 placé avant11/13 pour leurs décisions UX, ids existants préservés. Les propositions S1/S2 sont retenues : réponses des spikes aux emplacements nommés, profil1 borné au tracer sans clôture G2 anticipée. Le conteneur passe à risque high sous délégation : une qualification erronée peut lancer une action dans un mauvais contexte, exposer un fichier ou attribuer une mesure fausse. Les contrôles supplémentaires ci-dessous complètent les verify ; aucun accord humain global n’est inventé.

| Entrée | Risque et raison métier | Contrôle au-delà de la vérification normale pour les high |
|---|---|---|
|1|high : un faux profil compatible ouvrirait des lectures/effets non qualifiés.|Audit indépendant des racines canoniques, personnalisations et frontières, avec contre-exemples d’installation.|
|17|medium : une nouvelle surface ambiguë ferait perdre contexte ou contrôle.|Relecture cohérence des contrats avant consommateurs.|
|2|high : une aide mal sourcée pourrait recommander/lancer au mauvais contexte.|Relecture indépendante du reçu natif et de la distinction aide chargée/réponse produite.|
|3|high : un mauvais changement d’initiative réattribuerait le travail.|Comparaison indépendante des rattachements historiques et des fichiers de configuration avant/après.|
|4|high : une déduction affichée validée donnerait un faux accord.|Contre-lecture adversaire sur preuves contradictoires, absentes et révisions différentes.|
|5|high : une preuve périmée autoriserait une opération sur de nouveaux octets.|Essai de course externe pendant lecture et décision, au-delà du rafraîchissement nominal.|
|6|medium : catalogue incomplet ou opaque empêcherait le choix.|Inventaire et parcours fonctionnels de verify.|
|7|high : un workflow non qualifié pourrait produire des effets hors de la portée annoncée.|Audit indépendant capacités/permissions et reçus/effets réels sur profils supplémentaires.|
|8|high : un aperçu ou appel éditeur non borné exposerait du contenu ou exécuterait une entrée non fiable.|Revue de sécurité des types de contenu, chemins, URI et frontière de demande éditeur.|
|9|medium : attente mal routée ou contexte perdu empêcherait de reprendre le travail.|Parcours multi-projet de verify.|
|10|high : assimiler un schéma à une mesure fabriquerait du temps ou un coût.|Rapprochement indépendant champs réellement reçus, sémantique et matrice de disponibilité, sans prix API.|
|12|medium : UX des mesures ambiguë ferait confondre zéro, partiel et indisponible.|Relecture des contrats avant11/13.|
|11|high : duplication ou mauvaise association corromprait des mesures durables.|Injection de doublons/échecs de stockage et relecture indépendante compatibilité/historiques.|
|13|high : valeur fausse ou absence présentée zéro tromperait la lecture d’une US.|Rapprochement indépendant de valeurs affichées et preuves de source/couverture, dont zéro connu et coût inconnu.|
|14|medium : traduction incohérente changerait le sens d’une décision.|Relecture bilingue ciblée des actions et erreurs, en plus des parcours de verify.|
|15|medium : nettoyage réintroduirait une régression.|Recontrôle des constats effectivement différés et de leurs tests.|
|16|high : une fausse conclusion annoncerait des capacités non prouvées.|Relecture indépendante matrice/ASAR/runtime et conservation des données avant clôture du conteneur.|

- Decision: 2026-10-28 — Préparation et découpage sous le mandat autonome « enchaine les étapes jusqu’à l’épic2 », sans Build2 démarré. Les quatre epics approuvés restent en place ;17entrées gardent une capacité cohérente dans le même paquet, avec davantage de lignes pour qualifier les inconnues et les contrats avant leurs consommateurs. Ce nombre ne motive ni nouveau découpage arbitraire ni gate de longueur. Aucun checkpoint humain routinier ajouté : plans/revues/commits sont délégués ; un vrai consentement ou clic réseau nécessaire reste une action humaine distincte.

- Decision: 2026-10-28 — Exception de séquencement proposée et retenue sous cette délégation :1 qualifie G2 et les contrats de guidage avant le tracer2 « projet existant → aide des modules réellement installée → réponse native bmad et alternatives → conversation conservée ». Les invocations actuelles sont limitées à Mary/Forge et ne prouvent pas l’aide générale ; ajouter un nom de compétence ne suffit pas. Le spike ne rend pas une action lançable sans profil/capacités prouvés. Le tracer et le catalogue réutilisent la voie unique du cœur/connecteur, sans nouveau moteur ni permissions implicites.

- Decision: 2026-10-28 — Le gate G0/G1 est épinglé à1.11 dans les entrées qui consomment la base ;1.11 reste en cours, dernier essai0.1.2 échoué avant moteur sur nouveau307Zscaler. Point intermédiaire qualification-e2e/checkpoint-0-1-2.md sous l’epic1,343tests/75contrôles isolés réussis, aucun succès natif intégré déduit. La refonte autonome indépendante doit également être qualifiée avant le premier Build2 ; son plan est plan-refonte-espace-de-travail.md sous l’initiative. Préparer les tickets ne lève ni ce prérequis ni G1.

- Decision: 2026-10-28 — Une seule voie de changements car profils, contexte, preuves, catalogue/lancement, fichiers et accueil partagent contrats, cœur, Main/preload et renderer.17 fournit leurs contrats Sally après1 et avant tracer2, puis3–9.10 instruit les mesures sur le paquet figé fourni par9, sans modification des sources produit. Après décisions Q8/Q9,12 fournit leur parcours UX avant contrats/collecte11, puis13 livre le rattachement utilisateur et l’affichage ;14 traduit l’ensemble.15sweep attend tous les autres1–17 sauf16 et ne porte que leur nettoyage différé ;16vérifie l’intégration et transmet la contribution éditeur G3 à3. Aucun Build2 parallèle proposé : paquet/inventaire et ressources natives restent stables pendant qualification.

- Open question: Q3/G2 — Le profil qualifié par1 doit arrêter racines/ordre de découverte, formats6.13.0-next réellement installés, personnalisations, catalogue partiel, aides/résolveurs et capacités par famille. Une entrée TOML peut représenter une US sans feuille, son statut étant dans le plan. Distinguer sélection locale d’initiative et éventuelle écriture BMad réellement consentie ; aucun changement de configuration par simple navigation. Reprise de conversation externe, installation/migration et Graphify restent hors de cet epic.

- Open question: Q8 — Définition du temps par US et rattachement : bornes, attentes humaines, interruption/fermeture, chevauchements, plusieurs conversations/US et changements de rattachement.10 instruit puis Sofia/Winston arrêtent explicitement les règles avant11 ; aucune durée issue d’un timeout ou d’une ouverture de projet n’est retenue comme mesure métier par anticipation.

- Open question: Q9 —10 doit distinguer les schémas exportés des données réellement reçues sur SIWC/Codex : usage last/total, identités locales/natives, champs facultatifs, doublons/retards et couverture. Montant/devise et attribution monétaire restent à qualifier séparément ; coût absent signifie indisponible, pas zéro et pas tarif API appliqué à l’abonnement. Les historiques actuels n’ont ni US ni mesure connue ; le nouveau stockage les préserve sans les reconstruire artificiellement. Ce besoin n’installe ni Loop/Builder ni un autre fournisseur et ne crée pas de suivi de notre développement.

- Decision: 2026-10-27 — REPLAN Sofia sous mandat autonome : R32 reçoit pour propriétaire cet epic, qui identifie les US du projet et leurs preuves. Au raffinement, cadrer Q8/Q9 puis ordonner rattachement/qualification des données et extension des contrats avant affichage et conservation ; aucune mesure ni tarification n’est choisie par anticipation. Enveloppe toujours non raffinée, sans nouvelles stories ; quatre epics et dépendances conservés, aucun travail supprimé. Cette fonction de Madness ne suit pas notre développement et ne modifie ni les plans built ni la 1.8.

- Decision: 2026-10-23 — Périmètre et dépendance à l'epic 1 validés par le porteur ; enveloppe non raffinée, aucune story créée.

- Waits on epic-boucle-codex because: le paquet, les contrats de contexte, le cycle de vie, le dialogue réel et le port de persistance sont nécessaires aux parcours de cet epic.
