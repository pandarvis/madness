# Revue du spine — checklist d'architecture

**Verdict : corrections ciblées avant finalisation.** Le spine permet de découper les premières qualifications sans présenter l'application comme réalisable ou testée de façon acquise. Trois ambiguïtés de contrat restent à lever ; aucune ne justifie de remettre en discussion les choix du porteur. Aucun constat critique ou élevé.

## Périmètre et méthode

Revue indépendante du `architecture-madness.md` en statut `draft`, le 23 octobre 2026, selon la good-spine checklist de `bmad-architecture/references/reviewer-gate.md`. Sources confrontées : initiative R1–R24/C1–C6, `PRODUCT.md`, décisions utilisateur fournies dans `AGENTS.md`, contrat `EXPERIENCE.md` et memlog d'architecture. Le lint mécanique est annoncé passant par le coordinateur ; cette revue porte sur le sens et les divergences possibles entre unités.

Les arbitrages récents font autorité : React/TypeScript, electron-vite, electron-builder, previews autorisées, français/anglais, clair/sombre, conservation locale sans relance. Les anciennes formulations de C6/Q1, A2/Q5 et Q6 dans le ticket sont des mises à jour à confier à Sofia, pas des raisons de rouvrir ces décisions.

## Constats

### RUB-1 — Moyenne — Une acceptation peut survivre à la révision qu'elle validait

**Emplacement :** AD-3 ; conventions « Propriétaires » et « Affichage ». **Exigences :** R7, R8, R18, R19.

La décision humaine est « rattachée à son objet », et une modification externe invalide les projections avant relecture. Rien ne précise si l'objet d'une acceptation est le chemin du livrable ou son contenu au moment de la décision. La relecture seule ne résout pas cette différence entre l'unité qui conserve les décisions et celle qui indexe les preuves.

**Contre-exemple :** le brief A est accepté. Un outil externe remplace son contenu par B au même chemin. L'indexeur relit B ; le registre des décisions retrouve l'accord explicite sur ce chemin et le projette comme accepté. Chaque unité peut appliquer littéralement AD-3 tout en attribuant à B une validation qui concernait A.

**Correction minimale :** préciser qu'une acceptation humaine conservée porte aussi la révision identifiable de l'objet accepté. Un changement de cette révision conserve la décision comme historique et rend l'acceptation du nouveau contenu inconnue ou à renouveler ; il ne transfère pas l'accord. Le mécanisme d'empreinte ou de version appartient au code, pas au spine.

**Traitement proposé :** correction directe d'AD-3 et, si nécessaire, du contrat partagé en G0. Aucun nouvel arbitrage produit requis : c'est l'application de la distinction preuve/acceptation déjà adoptée.

### RUB-2 — Moyenne — Le cycle de vie est reporté après le moment où ses contrats doivent être communs

**Emplacement :** Structural Seed, G0, Deferred « Cycle de vie ». **Exigences :** R14–R17, R22 ; conservation sans relance.

Le seed attribue le cycle de vie à `main/`, mais l'invariant durable ne désigne pas l'autorité de fermeture des sessions/processus. L'arrêt pendant un travail reste à préciser « avant les sessions réelles », alors que G0 doit déjà établir les contrats partagés destinés au cœur, à Electron et au connecteur. AD-4/AD-5 empêchent le faux succès et le rejeu ; ils ne tranchent pas qui demande l'arrêt et qui en constate le résultat.

**Contre-exemple :** le lot Electron ferme le transport en quittant la fenêtre ; le connecteur suppose que le cœur lui demandera d'abord une interruption ; le cœur suppose que le connecteur achèvera la persistance du dernier événement. Les lots peuvent chacun satisfaire leur frontière décrite, sans qu'un propriétaire garantisse le bilan de fermeture, l'invalidation des attentes et la sauvegarde du contexte.

**Correction minimale :** fixer une seule autorité pour coordonner le cycle de vie et imposer un contrat commun de fermeture/résultat observable avant le gel des contrats G0, au plus tard avant leurs consommateurs. Si la politique de travail pendant/après fermeture exige encore un choix, la nommer comme question explicitement bloquante pour ce contrat. Le nombre de processus par connexion et la mécanique d'arrêt peuvent rester délégués à la qualification.

**Traitement proposé :** compléter l'invariant et resserrer la condition de reprise de Deferred. Cela n'exige ni de réaliser les sessions maintenant ni de promettre leur continuation après fermeture.

### RUB-3 — Moyenne — Le diagnostic avant opération n'a pas de garde commune explicite

**Emplacement :** AD-2, AD-6, AD-7 ; Capability Map R3–R4. **Exigences :** R3, R11, R12 ; `EXPERIENCE.md`, Diagnostic et initialisation.

Les profils qualifiés, les outils détectés, le contexte d'initiative et les préconditions du plan d'initialisation sont couverts. La règle transversale de R3 — diagnostic utile à l'ouverture puis avant une opération — ne précise cependant pas quel module doit empêcher un lancement sur un diagnostic devenu périmé. La lecture des contrats UX par la UI ne suffit pas à garantir la même règle dans les chemins métier.

**Contre-exemple :** le projet était compatible à son ouverture ; son installation BMad est remplacée hors de Madness, puis une action est envoyée avant la fin de la relecture de l'index. L'adaptateur BMad invalide correctement sa projection selon AD-3, le connecteur invoque une compétence précédemment qualifiée selon AD-7, et aucun invariant ne dit au cœur de refuser cette invocation tant que les prérequis courants ne sont pas établis.

**Correction minimale :** préciser que le cœur exige, avant une opération dépendante de BMad/du dossier/de la connexion, un diagnostic pertinent encore valide pour son contexte capturé ; une invalidation suspend l'exécutabilité jusqu'à vérification et produit la récupération explicable. Les profils et vérifications concrètes restent à G1–G3, sans imposer ici un TTL ni une technologie de surveillance.

**Traitement proposé :** correction directe dans AD-6 ou AD-7, répercutée dans les contrats G0. Ce n'est pas une preuve supplémentaire déjà requise : c'est le propriétaire commun de l'obligation R3.

## Passage de la checklist

| Point | Évaluation |
|---|---|
| Altitude initiative | Bonne. Les frontières UI/cœur/adaptateurs, autorités, contexte, contrats, consentement et données partagées sont les divergences pertinentes entre futurs lots. |
| Règles enforceable | AD-1/AD-2 fixent les dépendances et la validation aux frontières ; AD-4 distingue les attentes vivantes des historiques ; AD-5 et AD-6 fixent propriété et effets ; AD-7–AD-9 rendent disponibilité et livraison conditionnelles. RUB-1 et RUB-3 resserrent deux règles qui autorisent encore des lectures incompatibles. |
| Deferred sans divergence | Moteur de stockage, schéma détaillé et migrations ont un propriétaire et précèdent leurs consommateurs. Variantes UX confiées à Sally avant implémentation. Compatibilité et diffusion ont un point de décision. Le cycle de vie garde une divergence transversale : RUB-2. |
| Technologies nommées | Le spine fournit un relevé daté, les références de recherche et les différences du starter. Il ne prend ni le registre ni le starter pour une preuve de compatibilité. G0 reste une qualification. Cette revue n'a pas reproduit la recherche de versions ni exécuté un build. |
| Brownfield et héritage | Aucun code applicatif Madness n'est présenté comme existant. Les installations BMad et la référence DIA restent des observations ; le spine ne prétend pas en déduire un assemblage Madness déjà validé. Aucun spine parent fourni à préserver. |
| Seed et code | Arbre court, points de composition explicites et tableau de stack clairement transféré au lockfile/code après qualification. Pas de schéma complet ou de détail d'écran imposé. Le placement du cycle de vie dans le seed ne remplace pas l'autorité durable requise par RUB-2. |
| Opérations et environnements | Développement via serveur, paquet autonome, Windows cible, ressources distribuées, absence de service distant Madness, prérequis détectés, réseau/certificats des connecteurs séparés et données hors binaires sont traités. Installateur, signature, licence, canal, architectures Windows et minima sont explicitement reportés avant diffusion/paquet concerné. Pas de dimension opérationnelle entièrement silencieuse. |
| G0–G4 | Correctement présentés comme travaux à planifier, avec preuves et effets bloquants. Ils autorisent le découpage de qualifications ; ils ne prouvent ni authentification distribuable, ni compatibilité, ni installation, ni parcours utilisateur. RUB-2 ajuste l'ordre d'une décision de contrat, sans demander que G0–G4 soient déjà réalisés. |

## Couverture du ticket

| Périmètre | Contrat architectural | Réserve |
|---|---|---|
| R1–R2, R5 | AD-2/AD-4/AD-5 : identités de contexte, attentes communes, projets et conversations conservés | Aucune autre divergence constatée |
| R3–R4 | AD-3/AD-6/AD-7, G2/G3 : diagnostic qualifié et opérations consenties | RUB-3 sur l'exécution avec diagnostic courant |
| R6–R8 | AD-3/AD-4 : preuves, projections et acceptation séparées | RUB-1 sur la révision acceptée |
| R9–R12 | AD-2/AD-3/AD-7/AD-8 : installation réelle, aide/recommandation distinctes, invocation/contextes fidèles, conditions natives | Aucune autre divergence constatée |
| R13–R18 | AD-2/AD-4–AD-7 : dialogue, corrélation, attentes, approbations et résultat inconnu | RUB-2 sur fermeture ; RUB-1 pour les décisions historiques |
| R19–R21 | AD-1/AD-5/AD-6/AD-8 : aperçu sans exécution, retour éditeur observable, contexte, accessibilité et préférences | Aucune autre divergence constatée |
| R22–R24 | AD-4/AD-7–AD-9, G0–G4 : capacité réelle, hors ligne, paquet cible et parcours intégrés | RUB-2 sur reprise après fermeture |
| C1, C5 | AD-8 : UX prioritaire et contrats existants gouvernants ; variantes à concevoir | Extensions non prétendues validées |
| C2 | Windows/Codex d'abord ; G2 qualifie les formats BMad au-delà d'un numéro majeur | Aucun élargissement silencieux |
| C3 | AD-3/AD-5/AD-6 : artefacts existants, pas de fausse conversation externe ni migration/réinstallation implicite | Aucune autre divergence constatée |
| C4 | AD-7 et G1 : authentification, facturation et capacités propres à chaque voie | Aucune preuve intégrée inférée des schémas |
| C6 et choix récents | Stack Electron/React/TypeScript/electron-vite/builder adoptée ; anciennes mentions à réconcilier par Sofia | Actualisation documentaire explicitement prévue, sans choix à refaire |

Les corrections proposées préservent le découpage envisagé et la qualification progressive. Aucun détail d'implémentation supplémentaire ni nouveau workflow n'est demandé par cette revue.

## Recontrôle ciblé après corrections — 23 octobre 2026

**Verdict actuel : RUB-1, RUB-2 et RUB-3 résolus.** Les constats initiaux ci-dessus sont conservés comme historique ; leurs réserves ne s'appliquent plus au spine corrigé. Ce recontrôle porte uniquement sur ces trois points et leurs effets immédiats.

| Point | Statut | Vérification de la correction |
|---|---|---|
| RUB-1 — Révision acceptée | Résolu | AD-3 lie explicitement la décision à l'objet et à la révision affichée ; les fichiers sont identifiés par SHA-256 de leurs octets lus avec l'aperçu. L'accord reste historique après modification, et l'acceptation du contenu courant devient inconnue. Le contre-exemple d'un accord transféré au même chemin est exclu. |
| RUB-2 — Autorité du cycle de vie | Résolu | AD-1 attribue la coordination au cœur, les événements OS à Main et les processus/retours d'arrêt aux connecteurs. G0 inclut le contrat de cycle de vie avant ses consommateurs. Deferred ne reporte plus cette propriété ni l'établissement du contrat ; il conserve les paramètres et l'ergonomie à qualifier. |
| RUB-3 — Diagnostic avant opération | Résolu | AD-7 exige du cœur une vérification des prérequis pertinents avant chaque opération. Un diagnostic invalidé ou périmé selon le profil partagé requiert un contrôle ciblé frais avant l'effet ; sinon l'action est bloquée avec récupération expliquée. Le lancement pendant une invalidation non résolue est exclu. |

**Problème nouveau induit : aucun constaté dans ce périmètre.** Ces règles fixent les contrats à qualifier sans transformer G0–G4 en preuves acquises. La finalisation peut se poursuivre au regard de cette revue.
