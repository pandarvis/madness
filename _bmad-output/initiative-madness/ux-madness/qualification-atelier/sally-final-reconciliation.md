# Sally — réconciliation finale des contrats UX atelier

Date : 2 novembre 2026.
Mode : bmad-ux Update headless, sur l’espace UX existant.
Résultat documentaire : complet ; aucune nouvelle décision humaine requise.

Candidat observé : dist/atelier-review-fixed, version 0.2.1.
ASAR relu par hash : 486cfe44e26256729617b661bdd48e657a3d520c1efa77f21adfe180feaf3118.

Ce rapport clôt seulement la réconciliation documentaire demandée. Il ne clôt ni le Build UI, ni la qualification 2.2, ni M14. Le verdict final et la suite UI complète restent au propriétaire ; des échecs de cette suite étaient encore en diagnostic au dernier point transmis, sans cause produit établie ici.

## Modifications exactes

| Fichier possédé | Changement |
|---|---|
| [DESIGN.md imbriqué](../DESIGN.md) | Palette extraite du CSS réel : 39 rôles dans chaque thème, dont pétrole/terracotta/ivoire et rôles de chrome. Titres Barlow Condensed Bold locale, corps Segoe UI, conversation 14 px. Géométrie de l’atelier, onglets coupés, bandeau retiré dans Conversation, fiche 320/350 px et seuil docké 1323 px. Cadre raster neuf tranches 128 / 36 px / débord 17 px, sans remplissage central ni interaction. |
| [EXPERIENCE.md](../EXPERIENCE.md) | Portrait par identité attestée exacte ; inconnue et nom hors casting conservés. Fiche de l’item capturé, fermeture sur contexte/source invalidé, masquage local des panneaux sans annulation de connexion, Échap unique et priorité des modales natives. Signalements visibles séparés du corps de rôle, historique de consultation, annonces distinctes par nouvel identifiant, destination corrélée et retour de focus. Limites 2.2/M14/307 explicites. |
| [.memlog.md](../.memlog.md) | Ajouts via memlog.py append et date via memlog.py set ; anciennes décisions conservées, pas de réinitialisation ni réécriture manuelle du journal. |
| [Index de couverture 2.17](../guidage-epic2/contrats-et-couverture.md) | Une note datée par contexte relie cette réconciliation et identifie comme historiques les anciens comptes et la conservation intégrale des tokens de 2.17. Ses matrices et preuves ne sont pas réécrites. |
| Présent rapport | Sources, portée, contrôles et limites de cet Update. |

Le [DESIGN.md racine](../../../../DESIGN.md), son sidecar .impeccable/design.json et PRODUCT.md restent la responsabilité du documenteur distinct. Aucun de ces fichiers n’est modifié par Sally.

Les tables des deux spines possèdent désormais 29 composants appariés : les 26 noms de 2.17 et Portrait d’agent, Fiche agent, Signalements de la fiche. Aucun catalogue de sept agents, commande de lancement ou disponibilité supplémentaire ne découle de ces trois composants.

## Raccord au code et aux preuves

Sources de comportement lues : App.tsx, AgentPortrait.tsx, agentPresentation.ts, AgentInfoPanel.tsx et styles.css. Le [contrat de surface Impeccable](../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md), le [handoff approuvé](../atelier-agents-2026-11-02/handoff.json), la préparation et la revue Sally du plan bornent la direction. Les cinq exemples et la référence de structure bmad-ux ont été lus ; aucun nouveau monde ou entretien esthétique n’a été lancé.

- La correspondance du registre est exacte sur les sept noms et ne reçoit que l’identité native de l’item. La fiche présente le rôle descriptif, sa source et l’identifiant du message, sans activité ou compétence supposée.
- Le docké commence réellement à 1323 px ; il est distinct du seuil contractuel 1080 px du futur Panneau de fichiers. Le corps de fiche conserve sa lecture lors du changement de disposition ; la navigation et le rappel du forfait gardent leur priorité modale.
- La zone de signalement est hors du défilement du corps de rôle, de hauteur bornée à min(44dvh, 240px). Son annonce visible, polie et atomique est séparée de la liste persistante pendant cette consultation. Chaque nouvel identifiant ajoute un Signalement numéroté ; expiration et deltas ne réannoncent pas.
- Le [recontrôle Quick original](quick-recheck.md) déclare Q1/Q2 résolus et borne ses preuves. Ce sont des contrôles DOM/interactions synthétiques, sans preuve d’une restitution sonore par lecteur d’écran.
- Le cadre est décoratif et neuf-tranché sans fill : il porte la matière aux arêtes et laisse les centres de lecture/formulaire dégagés. Les sept bustes utilisent le même asset en vignette cadrée et en fiche avec image contenue ; aucun personnage permanent n’est imposé.

La [première revue finish](finish-review.md) et ses constats restent historiques. Cet Update traite sa dérive documentaire F4 ; les matériaux corrigés et les vues supplémentaires restent soumis au verdict final du propriétaire/relecteur, qui n’est pas anticipé ici.

Trois captures existantes ont été ouvertes par Sally, sans nouvelle capture : [Sally complète en sombre](../../../../.impeccable/review/atelier-review-fixed/agent-full-sally-dark-1600.png), [fiche claire](../../../../.impeccable/review/atelier-review-fixed/atelier-panel-light-1440.png), [question active claire](../../../../.impeccable/review/atelier-review-fixed/active-question-light.png). L’index agent-views-index du même dossier relie les sept fiches complètes à leurs auteurs synthétiques et aux assets. Cette lecture ciblée n’est pas une nouvelle inspection globale des 31 images.

Le parent a communiqué son inspection individuelle des 31 captures, l’audit 8 passed / 11 assets / 153 inputs et la matrice 14 passed avec cleanup true. Le [paquet durable review-fixed](review-fixed/) porte ses preuves ; Sally ne réexécute pas ces contrôles et ne transforme pas leurs résultats en acceptation humaine.

## Conservation des parcours et contrôles documentaires

Le bloc entier allant de Key Flows à Inspiration & Anti-patterns est conservé strictement, normalisé LF. Il comprend les sept parcours, leurs titres, étapes, moments décisifs, échecs et gardes de 2.17.

SHA-256 de ce bloc avant/après : 82410ae20cdb3ce8c8841412dcc3d1d94a34fdca5f1d8b12948b3df2a67a7091.

Contrôles réellement exécutés sur les documents :

- Deux frontmatters parsés avec js-yaml local ; huit sections DESIGN et dix sections EXPERIENCE dans leur ordre canonique.
- 29 composants appariés par nom et ordre.
- 125 occurrences de référence, 86 références visuelles distinctes, aucune non résolue.
- 78 couleurs comparées aux variables effectives du CSS, alias sémantiques explicites inclus ; aucune valeur couleur choisie hors source.
- Sept Key Flows et leur bloc complet inchangés.
- Liens locaux des deux spines et de l’index contrôlés ; le présent rapport résout les trois références ajoutées vers lui.

Les standards documentaires structure puis prose ont été appliqués directement, sans agent ni nouvelle revue UX. Modèle de lecture : référence de composants et comportements. L’ordre canonique, les tables appariées, la sous-section de consultation et le bloc protégé des parcours sont conservés. Aucun déplacement éditorial ou raccourcissement hors du besoin demandé. Comptes word_metrics réels : DESIGN 3356 mots, EXPERIENCE 9165 mots ; aucune cible de longueur ni réduction motivée par un seuil. Aucune question éditoriale nécessitant le porteur.

## Décisions antérieures réconciliées et limites

Le clair blanc/violet et les titres Segoe seuls deviennent l’état historique précédent ; la direction atelier approuvée et le CSS livré justifient ivoire/terracotta/pétrole et Barlow locale. Le nom de token muted-lavender est conservé pour compatibilité, mais sa valeur actuelle est une teinte de texte, pas une palette lavande.

La préparation avait proposé 14 images séparées et un premier seuil de panneau : ces propositions ne sont pas des décisions humaines à refaire. Les sept bustes réellement produits servent leurs deux cadrages ; le seuil final 1323 px, les dimensions 320/350 et les vrais matériaux sont documentés à partir du candidat.

Les parcours catalogue, choix d’initiative, preuves et fichiers gardent leur statut contractuel de leurs lots ; l’anglais complet reste en 2.14, Q8/Q9/R32 dans leurs entrées, initialisation en epic 3 et graphe en epic 4. L’habillage ne les rend pas disponibles.

La story 2.2 reste in-review avec M14 ouvert. Le nouveau 307 après le dernier acquittement humain est l’état réel transmis par son propriétaire ; aucun GET, clic, diagnostic proxy, modèle ou nouveau consentement n’a été exécuté par Sally. Les huit reçus natifs préexistants ne closent ni cette qualification ni les limites du nouveau paquet.

Aucun nouveau gate, installation, acceptation visuelle humaine globale, conformité WCAG, essai lecteur d’écran, SLA ou preuve de mise à l’échelle Windows n’est acquis par cet Update. Aucun source, test, build, asset, compte, profil, réseau, modèle, index Git ou commit modifié/exécuté. Les seuls changements sont les cinq fichiers documentaires nommés plus haut.

## Résultat headless

~~~json
{
  "status": "complete",
  "intent": "update",
  "artifacts": {
    "design": "_bmad-output/initiative-madness/ux-madness/DESIGN.md",
    "experience": "_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md",
    "report": "_bmad-output/initiative-madness/ux-madness/qualification-atelier/sally-final-reconciliation.md"
  },
  "assumptions": [],
  "open_questions": [],
  "conflicts_with_prior_decisions": [
    "Résolu : ancien clair blanc/violet et titres Segoe remplacés par la direction atelier approuvée et les valeurs du CSS courant.",
    "Résolu : seuil et découpage d’assets proposés lors de la préparation remplacés par la géométrie et les sept bustes réellement implémentés."
  ]
}
~~~
