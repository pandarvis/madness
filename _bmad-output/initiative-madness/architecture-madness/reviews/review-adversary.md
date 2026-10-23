---
type: architecture-review
lens: adversary
reviewed: architecture-madness.md
reviewed_on: 2026-10-23
verdict: no-conclusive-incompatibility
---

# Relecture adversaire — Architecture Madness

## Verdict

Aucune paire concluante de deux unités de niveau feature respectant tous les AD et produisant néanmoins des parties incompatibles n’a été établie. Aucun blocage architectural ni modification normative du spine n’est demandé par cette lentille.

Ce verdict porte sur les règles et les dépendances de réalisation du document, pas sur une intégration déjà réalisée. G0–G4 restent des travaux à mener. En particulier, le module unique de contrats, possédé par le cœur et établi en G0 avant les consommateurs, est une véritable mesure de prévention : l’absence ici du schéma détaillé de chaque message n’est pas traitée comme une divergence autorisée.

## Méthode et limites

Lecture du spine complet, des exigences R1–R24 et des contraintes de l’initiative, puis du contrat EXPERIENCE.md pour vérifier les scénarios contestés. L’attaque recherchée exige deux implémentations indépendantes qui respectent simultanément les règles écrites ; une implémentation qui ignore un propriétaire, réinterprète un payload natif dans le renderer ou ne vérifie pas une attente ne constitue pas une telle paire.

Les quatre attaques les plus plausibles et les raisons de leur rejet sont consignées ci-dessous. Elles donnent des cibles de qualification concrètes, sans transformer cette revue documentaire en preuve de build ni demander de nouveaux écrans ou une nouvelle fonctionnalité.

## 1. Formes de données, contexte et projections

**Sévérité :** aucun constat retenu.

**Paire tentée :** une unité « catalogue et lancement » émet une invocation pour l’initiative A ; une unité « dialogue et attentes » interprète la réponse selon l’initiative B actuellement visible. Variante : la seconde utilise les identifiants natifs du fournisseur et construit son propre modèle d’attente, incompatible avec celui de l’accueil.

**Pourquoi la paire ne respecte pas tous les AD :** AD-2 capture le contexte à la création et interdit sa réattribution par navigation. Les commandes et événements portent leurs identités et leur corrélation ; une initiative requise doit être résolue avant lancement. AD-4 impose une projection commune au projet et à l’accueil. Les conventions interdisent à la UI de consommer un payload natif. Deux définitions indépendantes des messages violeraient en outre le module unique de contrats et son antériorité en G0.

**Trou résiduel démontré :** aucun. Les identifiants précis et leurs schémas relèvent du propriétaire explicitement désigné.

**Modification minimale :** aucune. Lors de G0, la validation des contrats doit porter sur les cas avec initiative, sans initiative et après navigation ; ce sont des illustrations de règles existantes.

## 2. Demande expirée et résultat inconnu après coupure

**Sévérité :** aucun constat retenu.

**Paire tentée :** une unité « connexion et reprise » restaure une demande enregistrée comme active ; une unité « champ de réponse » transmet la saisie à cette ancienne demande. Variante : elle crée un nouveau tour et y redirige le texte, ou rejoue l’envoi après une coupure faute d’accusé.

**Pourquoi la paire ne respecte pas tous les AD :** AD-5 ne restaure qu’un état historique jusqu’à vérification et interdit toute relance automatique. AD-4 exige que le moteur reconnaisse encore la demande active, invalide le contrôle après résolution/interruption/clôture, conserve la saisie expirée sans redirection et impose la réconciliation d’un résultat inconnu avant réessai avec effet. L’ordre d’ingestion local ne suffit donc pas à rendre une ancienne attente répondable.

**Trou résiduel démontré :** aucun. Un connecteur incapable de fournir cette preuve ne peut annoncer la capacité correspondante au titre d’AD-7 et de G1.

**Modification minimale :** aucune. Une reproduction réelle avec coupure, événements répétés et réponse devenue tardive est une preuve à obtenir en G1, et non une réussite constatée par cette revue.

## 3. Acceptation, mutations externes et autorités

**Sévérité :** aucun constat retenu.

**Paire tentée :** une unité « preuves BMad » relit un fichier modifié hors de Madness ; une unité « récapitulatif et statut » affiche ce contenu comme accepté parce qu’un fichier de même chemin était déjà présent, qu’une opération était autorisée ou qu’un tour est terminé.

**Pourquoi la paire ne respecte pas tous les AD :** AD-3 distingue preuves de fichiers, activité du fournisseur et décision humaine explicite rattachée à son objet. Elle impose l’invalidation et la relecture des projections concernées après modification externe, sans attribuer un accord inconnu. AD-4 sépare résultat proposé, décisions connues et fichiers ; AD-6 exclut l’équivalence entre approbation d’opération et validation de livrable. Rattacher une ancienne décision à un nouveau contenu sans preuve ne produit donc pas une paire conforme.

**Trou résiduel démontré :** aucun. Le spine ne prescrit pas ici le mécanisme de révision ou d’empreinte, mais il prescrit déjà le résultat à préserver : aucune acceptation du nouvel objet ne peut être inventée. Le modèle détaillé doit rendre cette règle exécutable dans le contrat commun.

**Modification minimale :** aucune. Vérifier ce scénario avec une décision connue puis une modification externe reste nécessaire pendant la réalisation ; l’invalidation ne doit pas être remplacée par une simple mise à jour du texte de l’aperçu.

## 4. Propriétaires du stockage, ordre et restauration

**Sévérité :** aucun constat retenu.

**Paire tentée :** une unité « conversation » sauvegarde directement son historique ; une unité « récents et brouillons » utilise un autre stockage ou restaure des rattachements différents. Variante : chacun ordonne ses événements à l’horloge et réactive au redémarrage son propre dernier état.

**Pourquoi la paire ne respecte pas tous les AD :** AD-5 désigne le service de persistance du cœur, impose son port à tous les modules et exige des écritures liées cohérentes, un schéma versionné et des migrations préservant les données. Les conventions donnent au cœur les conversations, opérations et attentes et imposent l’ordre d’ingestion local plutôt que l’horloge seule. Les contrats partagent leurs projections. La restauration ne lance ni moteur ni tour ; l’activité et les attentes restent historiques jusqu’à vérification.

**Trou résiduel démontré :** aucun. Le moteur de stockage et ses détails sont explicitement confiés à l’unité de persistance avant ses consommateurs. Ce report ne donne pas la permission de créer plusieurs autorités concurrentes.

**Modification minimale :** aucune. La conservation après fermeture et remplacement du programme doit encore être prouvée en G4, avec les règles de reprise d’AD-4/AD-5.

## Conclusion de la lentille

Les tentatives de divergence les plus directes sont soit interdites par un invariant explicite, soit confiées à un propriétaire commun avec un gate antérieur à ses consommateurs. Aucun nouveau contrat d’attribut ni verrou global de projet n’est proposé sans paire concluante. La qualification progressive des autres fournisseurs reste inchangée ; aucune preuve Codex ou prototype ne vaut validation de Claude Code, Copilot ou de parcours intégrés.
