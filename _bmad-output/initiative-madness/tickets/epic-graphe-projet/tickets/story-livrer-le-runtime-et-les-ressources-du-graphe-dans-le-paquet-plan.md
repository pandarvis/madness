---
title: "Livrer le runtime et les ressources du graphe dans le paquet Windows"
type: 'chore'
ticket: 9
created: '2026-11-06'
status: 'built'
baseline_revision: '9fd0bd8fd2f52f22c106c1445b4809db81b2b7f4'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 3
context: []
---

<frozen-after-approval reason="mandat autonome, livraison du candidat Windows">

## Intent

**Problem:** Le candidat Graphify doit identifier sa fermeture de ressources réelle et expliquer un prérequis absent. La seule empreinte ASAR ne couvre pas les exécutables et notices Graphify externes.

**Approach:** Reconstruire un candidat local Madness 0.2.19 dans un dossier dédié avec la procédure Windows existante. Sceller la copie exacte des ressources, du runtime Python et des notices contre le profil épinglé. Distinguer un hôte PowerShell absent ou différent et des ressources de paquet absentes ou altérées, avec une action FR/EN. Garder la qualification longue installation/remplacement/restauration et G5 en 4.11, après les prérequis du tableau.

</frozen-after-approval>

## Implementation Notes

Réutiliser les épingles graphResourcePins, l'assemblage Graphify 0.9.101 et CPython 3.12.14 déjà versionnés. Le candidat retenu se trouve sous dist/graph49-release, avec le manifeste de livraison existant. Le prérequis hôte est PowerShell 7.5.4 de l'outil .NET global, empreinte vérifiée, sans installation automatique.

Le manifeste vérifie l'ensemble fermé Graphify et ses épingles, y compris les répertoires, la licence et les notices. Le fichier de licence CPython a été repris à l'octet depuis la distribution dont les 735 fichiers correspondent au runtime épinglé. L'assembleur vérifie ce texte et reproduit la notice.

## Plan Change Log

## Review Triage Log

- Q1 — réel, patch : les refus de fermeture de l'arborescence runtime/packages passent par le diagnostic de ressources du paquet. Le test lance le vrai précontrôle avec les ressources de tête épinglées et aucun arbre Python.
- Q2 — réel, patch : génération et revalidation utilisent le même diagnostic actionnable. Le graphe complet est conservé.
- Q3 — réel, patch : l'hôte PowerShell vérifie aussi DLL d'entrée, deps, runtimeconfig et assembly de gestion, avant toute réservation. Un exécutable intact mais isolé est refusé. Le deuxième retour Quick a aussi demandé de prouver que l'hôte démarre avec ses dépendances .NET. Un appel de version borné, sans profil, s'exécute avant réservation et refuse un hôte dont les cinq fichiers vérifiés sont présents mais dont ConsoleHost manque.

- Q4 — réel, patch : le contrôle PowerShell garde son admission jusqu’à close sur le processus exact, même si le callback signale une annulation avant sa fermeture.

- Q1 à Q4 résolus et recontrôlés par le même relecteur. Les trois constructions intermédiaires ont leurs empreintes historiques dans le reçu. Seul le candidat final porte le dernier contrôle de fermeture.

## Verification

- Manifeste exact du candidat, fermeture des fichiers Graphify, notices et empreintes du paquet. Les ressources absentes ou altérées refusent le manifeste.
- Contrôles courts de prérequis présents et absents sans appel fournisseur. Une reconstruction Windows ne prouve ni installation, ni persistance du profil ni G5.

Candidat exact et empreintes dans le [reçu condensé](../qualification-paquet-graphe/manifest-summary.json). NSIS x64, 3 051 ressources Graphify auditées et huit artefacts identifiés. Précontrôle natif de la fermeture runtime et packages réussi. CPython empaqueté 3.12.14 répond avec les trois flags actifs. Huit tests de manifeste et deux cas ciblés de prérequis/diagnostic passent. Aucun projet ni profil personnel ouvert, aucune installation.

Candidat final reconstruit après Quick. Manifestes et huit empreintes relus sur disque. Les contrôles courts du vrai lanceur, du démarrage PowerShell et de la réservation annulée passent. Le paquet exact a ouvert l'onglet Graphe sur un projet témoin et préservé le brouillon, sans lancer Graphify. Fermeture observée. Le premier retrait du profil a reçu EBUSY et le chemin exact a été retiré au contrôle séparé.

Trois constructions intermédiaires créées dans ce lot ont été retirées après vérification de l’installateur final. Leurs empreintes restent consignées, pour 2 267 605 998 octets logiques retirés. La licence tierce conserve exactement les octets de la distribution, fins de ligne et espaces compris. Le contrôle de diff s'applique aux autres chemins et son empreinte remplace le contrôle d'espaces pour cet actif.
