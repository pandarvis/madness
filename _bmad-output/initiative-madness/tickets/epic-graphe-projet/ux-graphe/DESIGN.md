---
title: "Graphe du projet — supplément de composition Sally"
status: "supplément contractuel local, à réconcilier en 4.4"
date: '2026-11-04'
mode: Operate
scope: "Build 4.2 — aucun rendu produit"
---

# Graphe dans l’atelier

<a id="d1"></a>
## D1 — Autorité et portée

Ce supplément étend le projet existant, sans remplacer les spines [DESIGN](../../../ux-madness/DESIGN.md) et [EXPERIENCE](../../../ux-madness/EXPERIENCE.md). Le [DESIGN racine](../../../../../DESIGN.md) courant fait autorité pour palette, typographie, contrôles et chrome : Oxanium 450 à 16 px, métadonnées à 14 px, Barlow Condensed Bold pour titres/commandes, chemins et identifiants monospace. Les anciennes tailles et Segoe UI du frontmatter des spines ne sont pas recanonisés. Pétrole/terracotta/anthracite chaud et ivoire restent les seuls rôles de palette. Casting, ressources et marque restent ceux du produit ; aucun portrait n’identifie une analyse locale.

La génération du profil [4.1](../qualification-graphe/profil-g5.md) est locale, code-only et volontaire, sans modèle, connexion Codex ou fournisseur requis. Cette conception ne livre ni onglet ni bibliothèque de rendu, et ne change aucun contrat cœur. [EXPERIENCE](EXPERIENCE.md) porte les transitions et la copie ; [handoff](handoff.md) distingue les capacités présentes et les consommateurs futurs.

<a id="d2"></a>
## D2 — Place et premier écran

L’ordre cible des onglets du même projet est **Parcours · Conversation · Toutes les possibilités · Graphe**. Graphe est le quatrième onglet ; le catalogue livré conserve sa propre destination, sans renommer Conversation ou produire une seconde navigation. Ce choix réconcilie le contrat des spines avec le shell courant en4.4 ; le relevé initial de4.2 à deux onglets reste historique. Le nom du projet et le contexte d’initiative consultée restent dans le shell. Le graphe porte le projet et le périmètre analysé ; il ne devient pas le graphe d’une initiative parce que la sélection de consultation change.

Ordre visuel et de lecture dans le slot de contenu, après les onglets et la récupération commune :

1. Titre Graphe du projet et lien Revenir au travail, destination de retour nommée.
2. Ligne d’état : état du résultat, fraîcheur et activité de l’analyse séparés ; motif/action de récupération visible si nécessaire.
3. Identité courte du résultat affiché : projet, racine, périmètre, date d’observation, révision et analyse. Détails de l’analyse expose les valeurs intégrales, assemblage/version et couverture ; les inconnus sont nommés.
4. Commande principale Générer le graphe ou Actualiser le graphe ; pendant l’analyse, son activité et Interrompre l’analyse. L’ancien résultat conservé est nommé avant son contenu. Ni barre de progression ni pourcentage de travail fictifs.
5. Recherche libellée, nombre de résultats à portée exacte et liste de résultats ; puis espace d’exploration composé de la représentation locale et des relations/détails sélectionnés.

L’état absent explique ce qui sera analysé, la portée et le caractère local avant Générer. L’indisponibilité montre un motif et les seules actions réellement possibles. Aucun squelette ne simule des nœuds ou une sortie reçue ; une attente textuelle suffit. Le projet BMad reste navigable.

<a id="d3"></a>
## D3 — Explorer sans perdre la lecture

Au format large où les noms, contrôles et détails restent lisibles, représentation et région textuelle des résultats/relations peuvent partager l’espace central ; la liste est une région nommée, jamais une superposition obligatoire sur les nœuds. Une seule région de détails expose l’élément sélectionné, ses relations, références et limites. La sélection conserve un repère visible dans la liste et la représentation ; le focus possède son propre contour, distinct de la sélection.

Quand ces régions ne tiennent plus, notamment au zoom application 200 %, elles passent en flux vertical : recherche → résultats → détail et relations → représentation avec commandes locales. Les contrôles du dessin restent auprès de sa région. Aucun seuil de graphe, largeur de colonne ou nombre maximal de nœuds n’est inventé ici ; 4.8 choisit et mesure une réalisation. Le repli des régions dépend de leur espace utile, sans cacher la liste derrière un canvas. Pas de défilement horizontal de fenêtre requis pour lire les états/actions. Les chemins longs se replient et leur texte intégral reste sélectionnable ; les noms et refus ne sont pas remplacés par des ellipses dépendant du survol.

La représentation peut avoir une projection ou un sous-ensemble, explicitement nommé avec éléments masqués et accès à la liste admise. Le nombre dessiné n’est jamais l’inventaire complet. Les tris/filtres sont visibles et réversibles ; aucune limite de performance n’est déguisée en zéro résultat. Sans représentation utilisable, recherche, liste et détails restent un accès à la même information admise ; le problème de dessin garde son propre motif.

<a id="d4"></a>
## D4 — Hiérarchie des preuves

Les fonds de lecture restent calmes ; plaques et arêtes héritées encadrent seulement les régions et commandes. Une relation sélectionnée expose en texte **origine → type de relation → destination**, la provenance et le niveau EXTRACTED/INFERRED/AMBIGUOUS. La flèche directionnelle complète le texte et ne le remplace pas. Entrantes et sortantes portent des titres distincts. La confiance n’est pas une couleur, une épaisseur ou une proximité spatiale ; son libellé demeure dans chaque relation et son détail.

Les rôles de couleur actifs du DESIGN racine servent focus, sélection et états avec texte et contour. Ancien, partiel, incompatible et erreur ne sont pas des variantes d’un simple voyant. Le score Graphify, lorsqu’il existe et est admis, est une donnée numérique séparée, jamais une jauge de certitude ni un pourcentage. L’absence de ligne reste Ligne inconnue ; une référence sans ligne sûre ne place pas un curseur à une ligne devinée.

La date d’observation et la révision portent toujours le résultat affiché, pas la dernière navigation. La ligne du dernier complet reste identifiable par sa propre analyse, date et révision, y compris lorsque l’écran montre une tentative partielle ou échouée. Aucun badge de disponibilité ou graphe complet ne vaut acceptation humaine ou validation BMad.

<a id="d5"></a>
## D5 — Commandes et accès fichier

Les utilitaires héritent des cibles de 40 px, icônes SVG existantes ou de leur langage, nom accessible et focus entier de 2 px décalé de 3 px ; les commandes textuelles héritent du minimum 44 px. Aucun nouvel asset n’est produit. Une icône ne remplace pas les textes Générer, Interrompre, motif de refus ou retour. Le nom accessible existe indépendamment de l’infobulle ; l’aide identique apparaît au focus et au survol, hors rognage.

Les détails du nœud donnent chemin relatif connu, origine du rattachement, révision et ligne connue/inconnue, puis Voir le fichier seulement si la référence est admise. Cette intention rejoint le Panneau de fichiers **2.8** déjà livré, avec ses grants privés et sa revalidation native. Sa largeur de référence 318 px et sa superposition sous 1080 px restent celles du spine, distinctes du dock agent 1323 px. Aucun nouveau panneau permanent n’est inventé. À faible largeur ou zoom, titre, fermeture et actions restent atteignables dans la largeur utile ; sélection et position sont conservées à la fermeture.

La région de détails du graphe n’est pas un aperçu de fichier et n’exécute ni source, URL, HTML Graphify ni commande. Les ressources de rendu seront locales et les données admises proviendront du cœur normalisé par 4.3/4.4, jamais d’un payload natif confié au renderer.

<a id="d6"></a>
## D6 — Variantes, clavier et mouvement

Les deux thèmes utilisent la même hiérarchie, les mêmes noms et les mêmes gardes. FR/EN traduit l’interface uniquement ; chemins, noms, identifiants, types reçus et texte de projet conservent leurs octets. Les contrôles se replient avant réduction du texte. Le zoom local du dessin ne réduit jamais les métadonnées, la recherche ou la liste ; il ne remplace pas le zoom de l’application.

Le chemin clavier principal passe par des contrôles natifs nommés, la recherche, les boutons de résultat et les relations textuelles. Une région de dessin ne piège pas Tab et n’impose aucun geste de drag ou survol. Les commandes locales Zoom avant, Zoom arrière, Ajuster la vue, Réinitialiser la vue et déplacement directionnel ont des équivalents au clavier ; [E5](EXPERIENCE.md#e5) en fixe le comportement. La liste expose la même information de sens/provenance/confiance que le dessin.

Pas d’animation de force continue, de recentrage automatique ou de pulsation signifiant une analyse supposée. Un changement volontaire de vue peut suivre la transition brève héritée, au plus 180 ms ; `prefers-reduced-motion` retire transition et défilement animé sans retirer le retour d’état. Les annonces résument début/fin, nombre de résultats et changement de fraîcheur, sans annoncer chaque nœud. Focus, zoom 200 %, contrastes des nouveaux éléments et restitution assistée restent à vérifier sur la future UI ; ce document ne revendique aucun audit WCAG.

<a id="d7"></a>
## D7 — Vérité visuelle inspectée

Les références [grand sombre](../../epic-projets-bmad/qualification-reprise-projet/visual-finish-001/resume-large-dark-native.png) et [compact clair](../../epic-projets-bmad/qualification-reprise-projet/visual-finish-001/resume-compact-light-native.png) ont été ouvertes dans cette session. La [provenance](../../epic-projets-bmad/qualification-reprise-projet/impeccable-documentation.md) les décrit comme projections Main004 historiques, avant patches Quick. Elles montrent reprise et preuves de `project-a`, sélection beta avec échanges alpha ; aucun de ces contenus n’est attribué au futur graphe.

Observations retenues : chrome pétrole, corps sombre/ivoire calme, titres condensés, commandes à coins coupés, détails textuels extensibles et passage au flux compact. Ces captures sont des références de composition, sans graphe rendu ni validation du paquet final. Les identités approuvées de fonte/casting restent acquises à leur portée historique, sans nouvelle acceptation humaine du supplément. [Qualification](qualification/verification.md) précise les seuls contrôles documentaires exécutés.


## Réconciliation produit4.4 — 4 novembre2026

Le catalogue2.6 et le panneau2.8 sont livrés. Graphe est la quatrième destination du même shell. Premier rendu4.4 : SVG géométrique local déterministe, liste exhaustive des nœuds admis, sens textuel et flèches, recherche, relations, fichier et retour ; approfondissement4.8 et matrices4.5–4.9 restent ouverts. Le clavier des onglets déplace le focus sans activation aux flèches, puis Entrée/Espace active. Réouverture passive ; revalidation volontaire des fichiers sans analyse. Le replan dispense4.4 des dépendances historiques2.14/3.9. Le présent ajout actualise ces seuls constats historiques ; source Sally4.2 conservée, aucune nouvelle activation ou preuve de rendu déduite.
