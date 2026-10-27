---
type: epic
title: "Comprendre et piloter ses projets BMad existants"
parent: initiative-madness
covers: ["R1", "R2", "R3", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R19", "R20", "R21", "R26", "R32"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/ux-madness/DESIGN.md", "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md", "_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: false
risk: medium
---
# Comprendre et piloter ses projets BMad existants

## Description

Depuis le socle et le dialogue de l'epic 1, une version Windows installable retrouve plusieurs projets et leurs initiatives, qualifie le profil BMad G2, montre état et preuves, propose l'aide et tout le catalogue installé, puis rejoint la conversation réelle. Elle établit avant ses consommateurs les règles et extensions de contrats nécessaires au temps et au coût par US, qualifie les données disponibles puis affiche mesures et indisponibilités. Elle livre les aperçus et l'ouverture éditeur, la navigation accessible ainsi que français/anglais et clair/sombre après extension des contrats par Sally.

## Outcome

Un développeur retrouve ses projets BMad et leurs initiatives, explique l'état à partir de preuves, choisit une possibilité motivée dans le catalogue réel puis poursuit dans la conversation Codex, en français/anglais et clair/sombre. Il consulte le temps et le coût rattachés à une US, en comprenant la provenance, la couverture et les données indisponibles.

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

- parent — [Initiative Madness](../../initiative-madness.md), `_bmad-output/initiative-madness/initiative-madness.md` ; Requirements R1, R2, R3, R5, R6, R7, R8, R9, R10, R11, R19, R20, R21, R26, R32 ; Constraints C1–C8, Done when, Boundaries et Notes, notamment Q8/Q9.
- architecture — [Contrat de Winston adopté](../../architecture-madness/architecture-madness.md) ; AD-1 à AD-8 ; G2 et contribution éditeur à G3. Companion conservé sans modification, AD stables ; les gates restent des preuves à produire.
- design — [Contrat visuel adopté](../../ux-madness/DESIGN.md) ; base française claire acceptée, extensions selon C5.
- experience — [Contrat comportemental adopté](../../ux-madness/EXPERIENCE.md) ; parcours, états et accessibilité, avec décisions récentes de l’initiative prévalant sur les mentions historiques A2/Q6.
- ordre — [Découpage approuvé](../tickets.toml) ; identifiant 2 et prérequis de capacités à reporter sur les stories qui les consommeront.

## Notes

- Decision: 2026-10-27 — REPLAN Sofia sous mandat autonome : R32 reçoit pour propriétaire cet epic, qui identifie les US du projet et leurs preuves. Au raffinement, cadrer Q8/Q9 puis ordonner rattachement/qualification des données et extension des contrats avant affichage et conservation ; aucune mesure ni tarification n’est choisie par anticipation. Enveloppe toujours non raffinée, sans nouvelles stories ; quatre epics et dépendances conservés, aucun travail supprimé. Cette fonction de Madness ne suit pas notre développement et ne modifie ni les plans built ni la 1.8.

- Decision: 2026-10-23 — Périmètre et dépendance à l'epic 1 validés par le porteur ; enveloppe non raffinée, aucune story créée.

- Waits on epic-boucle-codex because: le paquet, les contrats de contexte, le cycle de vie, le dialogue réel et le port de persistance sont nécessaires aux parcours de cet epic.
