# Vérification contractuelle4.2

Six familles U1–U6, 30 variantes explicitement parcourues dans les documents. « Satisfait documentaire » signifie une réponse dans les clauses, jamais un succès UI. Aucun produit, test unitaire miroir de prose, build, Graphify, modèle, réseau, CUA ou profil personnel exécuté.

Les citations ont été retrouvées dans leur clause exacte ; verification.json conserve entrée/action/citation/ligne et constat. Deux premiers locators avaient cité une paraphrase et échoué : [reçu conservé](verification-initial-failure.json), correction du repérage sans changement produit. Le script local audit-contracts.cjs ne vérifie que présence des citations, liens et paramètres, sans tester l’expérience produit.

| Cas | Entrée / action | Clause | Observation documentaire |
|---|---|---|---|
| U1a | Conversation/brouillon du projet A, Codex déconnecté → Choisir Graphe puis revenir | [E1](../EXPERIENCE.md#e1) ; citation exacte dans verification.json, ligne15 | Entrée sans compte puis retour exact sans lancement ni envoi. |
| U1b | Projet A puis B, résultat tardif A → Retrouver chaque projet | [E1](../EXPERIENCE.md#e1) ; citation exacte dans verification.json, ligne19 | Explorations isolées par projet/racine/périmètre/analyse/révision. |
| U1c | Initiative consultée changée → Consulter le même graphe | [E1](../EXPERIENCE.md#e1) ; citation exacte dans verification.json, ligne19 | Échanges et graphe ne changent pas d’attribution. |
| U1d | Déclencheur supprimé ou restauration → Revenir/rouvrir | [E1](../EXPERIENCE.md#e1) ; citation exacte dans verification.json, ligne17 | Repli neutre connu ; seules données conservées et aucune relance. |
| U2a | Aucun résultat → Générer volontairement | [E2](../EXPERIENCE.md#e2) ; citation exacte dans verification.json, ligne30 | Absent distinct du vide de recherche, aucun lancement par navigation. |
| U2b | Dernier complet ancien, nouvelle analyse → Lire activité et ancien résultat | [E2](../EXPERIENCE.md#e2) ; citation exacte dans verification.json, ligne31 | Axes distincts, dernier complet identifiable, pas de double lancement. |
| U2c | Analyse en cours → Interrompre ou atteindre timeout | [E2](../EXPERIENCE.md#e2) ; citation exacte dans verification.json, ligne36 | Arrêt demandé puis confirmé/inconnu, pas de succès provisoire. |
| U2d | Fermeture ou arrêt inconnu → Restaurer puis demander nouveau lancement | [E2](../EXPERIENCE.md#e2) ; citation exacte dans verification.json, ligne41 | Garde concernée maintenue ; réobservation qualifiée sans relance. |
| U2e | Incompatible/échec → Lire motif puis revenir ou réessayer si admis | [E2](../EXPERIENCE.md#e2) ; citation exacte dans verification.json, ligne34 | États distincts, dernier complet et BMad conservés, conditions de réessai. |
| U2f | Résultat reçu, sauvegarde échouée → Réessayer l’enregistrement | [E7](../EXPERIENCE.md#e7) ; citation exacte dans verification.json, ligne96 | Résultat de session séparé du durable, réessai de sauvegarde seul. |
| U3a | Complet/partiel/ancien, HEAD identique → Lire fraîcheur/couverture | [E3](../EXPERIENCE.md#e3) ; citation exacte dans verification.json, ligne48 | Révision des octets, non commités/non suivis, observation datée. |
| U3b | Mutation pendant collecte puis navigation → Lire historique | [E3](../EXPERIENCE.md#e3) ; citation exacte dans verification.json, ligne48 | Aucune promotion implicite, invalidation sans vol de focus. |
| U3c | directed:false ou marqueur isolé → Lire relation ou refus | [E3](../EXPERIENCE.md#e3) ; citation exacte dans verification.json, ligne50 | Deux marqueurs prioritaires ensemble, sinon source→target ; partiel refusé. |
| U3d | INFERRED, score0.85 → Lire confiance et score | [E3](../EXPERIENCE.md#e3) ; citation exacte dans verification.json, ligne58 | Trois niveaux expliqués, codes fidèles, score séparé non probabiliste. |
| U3e | Ligne absente/nulle/vide/texte inconnu → Lire référence | [E3](../EXPERIENCE.md#e3) ; citation exacte dans verification.json, ligne60 | Inconnus conservés sans ligne/plage devinée ; aucune validation déduite. |
| U4a | Requête vide ou sans correspondance → Chercher puis effacer | [E4](../EXPERIENCE.md#e4) ; citation exacte dans verification.json, ligne65 | Requête et portée conservées, absence de graphe distincte du zéro. |
| U4b | Homonymes et relations entrantes/sortantes → Sélectionner relation et autre extrémité | [E4](../EXPERIENCE.md#e4) ; citation exacte dans verification.json, ligne69 | Origine A atteignable depuis B, destination B depuis A ; sens/provenance inchangés. |
| U4c | Nombreux résultats/projection/tranche → Parcourir au clavier | [E4](../EXPERIENCE.md#e4) ; citation exacte dans verification.json, ligne71 | Accès aux résultats de portée, masque/refus distincts sans quota ni faux inventaire. |
| U4d | Dessin sélectionné, sans drag → Zoomer/panner au clavier | [E5](../EXPERIENCE.md#e5) ; citation exacte dans verification.json, ligne78 | Zoom local séparé, quatre pans et Tab sortant, pas de capture des champs. |
| U4e | Nouvelle analyse supprime sélection pendant frappe → Mettre à jour puis revenir | [E1](../EXPERIENCE.md#e1) ; citation exacte dans verification.json, ligne19 | Annonce sans voler recherche ; repli si contrôle focalisé disparu ou retour explicite. |
| U5a | Nœud avec référence relative sûre → Voir fichier puis fermer | [E6](../EXPERIENCE.md#e6) ; citation exacte dans verification.json, ligne88 | Intention2.8 même projet/révision, titre panneau puis retour exact. |
| U5b | Révision changée ou inconnue → Lire refus puis examiner nouvelle révision | [E6](../EXPERIENCE.md#e6) ; citation exacte dans verification.json, ligne88 | Ancien graphe historique, nouvelle lecture explicite séparée. |
| U5c | Référence absolue/traversante/lien/hors racine ou ligne inconnue → Demander fichier | [E6](../EXPERIENCE.md#e6) ; citation exacte dans verification.json, ligne88 | Référence refusée non ouvrable, pas de ligne inventée. |
| U5d | Changement de projet pendant ouverture → Recevoir réponse tardive | [E6](../EXPERIENCE.md#e6) ; citation exacte dans verification.json, ligne89 | Demande corrélée A, pas de changement de projet ou focus imposé. |
| U5e | Éditeur absent/échec/inconnu ou reçu transmission → Ouvrir dans éditeur | [E6](../EXPERIENCE.md#e6) ; citation exacte dans verification.json, ligne91 | Reçu2.8 borné sans retry ; aucune ouverture réelle ni IPC créé. |
| U6a | FR/EN, recherche et chemins longs → Changer langue | [E7](../EXPERIENCE.md#e7) ; citation exacte dans verification.json, ligne98 | Copie appariée, octets et focus conservés,2.14 future. |
| U6b | Clair/sombre → Lire état et commandes | [D6](../DESIGN.md#d6) ; citation exacte dans verification.json, ligne60 | Palette existante et texte, aucune nouvelle acceptation humaine. |
| U6c | Clavier seul, onglets → Flèches puis Entrée/Espace et Tab | [E5](../EXPERIENCE.md#e5) ; citation exacte dans verification.json, ligne76 | Ordre et repli définis, divergence App466 nommée pour2.14/4.4. |
| U6d | Zoom200%, faible largeur et noms longs → Replier disposition et revenir | [D3](../DESIGN.md#d3) ; citation exacte dans verification.json, ligne38 | Lecture/contrôles atteignables sans fenêtre horizontale, aucun seuil graphe inventé. |
| U6e | Mouvement réduit et mise à jour → Lire puis naviguer | [D6](../DESIGN.md#d6) ; citation exacte dans verification.json, ligne67 | Aucune force/recentrage imposé, annonces groupées ; contrôle physique futur. |

## Cohérence et références

Relecture croisée DESIGN/EXPERIENCE/handoff : sept états et axes activité/résultat/fraîcheur, dernier complet, sens et trois niveaux, score distinct, références/refus, identités/révisions, FR/EN et focus. 26 liens locaux et ancres explicites contrôlés, 0 défaut ; 42 paires FR/EN non vides et paramètres appariés, 0 défaut. Ces contrôles ne mesurent ni longueur rendue ni restitution assistée.

[Activations réelles](activation-decisions.md) : Sally resolver/config code0 ; contexte Impeccable code0 une seule fois ; deux PNG historiques effectivement inspectés, sans graphe ou paquet final inventé.

## Revue et conservation

[Revue UX indépendante](ux-review.md) : deux P2 corrigés en E1/E4 et recontrôlés résolus par le même relecteur ; copie E3/E8 clarifiée, aucune correction supplémentaire à la portée contractuelle U1–U6. Pas de verdict visuel. Quick/frontmatter/gel/statut/commit sous responsabilité parent, non supposés exécutés. Comparaison finale :1668/1668fichiers protégés identiques en SHA-256 ; [inventaire initial](protected-before.json), [inventaire final](protected-after.json). Les octets EXPERIENCE sont ceux relus indépendamment ; verification.json conserve les trois empreintes des suppléments.

Restent futures : UI et paquet, fournisseurs2.8/2.14/3.9, réconciliation4.4, mesures/vérifications physiques recherche/fichier/retour, clavier, FR/EN, deux thèmes, zoom200%, mouvement réduit et lecteur d’écran, G5 intégré. Aucun accord humain ou WCAG global acquis.
