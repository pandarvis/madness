# Vérification du premier parcours d’initialisation

Le [reçu Windows final](receipt.json) couvre un dossier temporaire Windows sans BMad, un accord synthétique, 588 ajouts comparés à l’inventaire final, les entrées existantes préservées et un reçu durable. Au retour dans le projet, le brouillon reste lisible. Le profil d’essai et le dossier cible sont nettoyés après fermeture vérifiée. Le contrôle réseau après instrumentation compte zéro appel.

Candidat exécutable : `dist/init34-final/win-unpacked/Madness.exe`, version 0.2.17. ASAR `a87628e11afc5ac778415163c573c1b5b104460666a4ace575083be9f695d230`. L’archive embarquée conserve `9907b02e25155215fa3b398185f971c42e0a02ddef62327c7a3b912f4fb5389a`. Ses 588 entrées correspondent au profil 3.1 et les 462 fichiers ont été relus par empreinte.

## Contrôles et revues

- 73 tests de contrat et d’hôte passent, sans saut. Les deux projets TypeScript et la construction du paquet final passent.
- Le même implémenteur a corrigé Q1 à Q6 et le relecteur Quick d’origine les a recontrôlés. Le plan refuse la taille finale excessive et un dossier qui chevauche les données Madness avant effet. L’interface distingue absence, plan actif et historique, et le banc attend le reçu durable.
- Un seul détecteur Impeccable donne une liste vide. La finition a ensuite demandé F1 à F4, corrigés ensemble. Le même relecteur les a scorés résolus sur le candidat final. Le verdict ship couvre ces quatre points.
- Le témoin mesure la présence de Fermer lorsque le corps du dialogue défile et le focus sur le verdict après « View result » à 200 %. La [capture des décisions](decision-focus/decision-actions-fr-dark.png) est un essai visuel séparé sur le même ASAR, avec arbre cible intact et zéro effet d’application.
- Les [preuves intermédiaires](../qualification-tracer-initialisation-recapture/parent-verification.md) restent sur leur ASAR 898e570b. La première image rognée à 200 % est rejetée. La copie dépaquetée du premier candidat, 581 882 140 octets de fichiers, a été retirée après fermeture et validation du candidat final. Les reçus et le candidat final sont conservés.

[Plan](plan-fr-dark.png) · [Dialogue](decision-fr-dark.png) · [Résultat en anglais et thème clair à 200 %](result-light-zoom-200.png)

Le cas positif du profil local est qualifié. Les interruptions natives, la récupération complète, les campagnes longues et les gates G3 à G5 restent à leurs stories. Le témoin ne vaut pas participation humaine ni qualification de tous les profils v7.

La documentation Impeccable a comparé six sources de contexte et les quatre images finales. Les contenus de charte correspondent au point de départ après normalisation des fins de ligne pour deux fichiers. Le diagnostic utilise les rôles, les contrastes et la lecture progressive déjà décrits par les contrats de l’epic 3. Le DESIGN racine cite un candidat historique 0.2.5 et le brief App ne liste pas les deux nouveaux fichiers. Ces écarts de documentation préexistants ne modifient aucune décision durable.
