# Sally — relecture UX ciblée du plan atelier

Date : 2 novembre 2026.
Objet : _bmad-output/plan-charte-atelier-agents.md, lu intégralement.
Base déclarée par le plan : c685d7c737b161d3231594a75280521f4d50e0e0, checkpoint 2.2 in-review.
Périmètre : cas limites UX du plan, sans revue du protocole 2.2 ni validation du rendu final.
Méthode : lentille edge-case-hunter de bmad-review, limitée aux raccords demandés ; aucun agent délégué.

## Avis

La direction peut passer à l’implémentation avec les deux raccords ci-dessous inscrits dans les notes et vérifications existantes. Aucun nouvel entretien ou choix esthétique n’est nécessaire. Ils précisent la priorité et l’inertie des surfaces déjà prévues ; ils ne demandent ni nouveau contrat métier ni modification du protocole.

Le plan conserve correctement l’identité attestée par item, le nom/source exacts et les inconnues, la fiche à la demande, les demandes complètes avant choix, les brouillons séparés, les deux thèmes, le zoom et le mouvement réduit. La grammaire atelier, les sept personnages originaux et la lecture calme correspondent au handoff et à la référence approuvée effectivement ouverte dans ce worktree.

## Deux raccords à fermer

### UX1 — Arbitrage de la fiche avec les autres surfaces

Lieu : plan, U4–U5 et Code Map AgentInfoPanel ; App.tsx, closeConnection et gestion globale d’Échap.

Le plan interdit l’annulation de connexion par la fiche, mais ne fixe pas l’arbitrage avec Connexion, Contexte et les Dialogues déjà ouverts. Le code existant rend ce raccord concret : closeConnection appelle connectionAction('cancel') lorsque la connexion est occupée. Réutiliser ce handler pour libérer visuellement la place, ou laisser Échap remonter après la fermeture de la fiche, peut annuler une autorisation/vérification alors que la personne consulte seulement un profil.

Règlement délégué :

- Un seul panneau informatif visible à droite. Ouvrir la fiche capture le message et masque localement les panneaux secondaires nécessaires, sans appeler closeConnection, cancel ou un autre pont métier ; une connexion en cours poursuit son état réel.
- Ouvrir Connexion/Contexte masque la fiche sans la réaffecter ou la rouvrir automatiquement ; conserver sa référence et sa position de session si utile. Aucun empilement de panneaux ou Dialogues.
- Fiche dockée : région nommée et Tab libre vers la conversation. Fiche étroite : vrai Dialogue modal, focus contenu, titre/fermeture accessibles. Une modale déjà active garde sa priorité.
- Échap ferme une seule surface, la plus haute, et ne se propage pas vers le handler de connexion. Retour au bouton du message exact ; s’il n’existe plus, titre neutre de la conversation courante, jamais une commande d’accord.
- Changer le seuil de disposition pendant l’ouverture conserve la même fiche, son point de lecture et les brouillons ; adapter la gestion modale sans laisser deux surfaces focalisables superposées.

Vérification à ajouter aux U4/U5 : connexion authorizing ou verifying → ouvrir/fermer fiche → zéro appel cancel ; fiche puis Connexion/Contexte ; Dialogues existants ; Échap consommé une seule fois ; transition docké/étroit ouverte au zoom 200 % avec source supprimée et repli de focus correct.

### UX2 — Demande reçue pendant la consultation de la fiche

Lieu : plan, U5–U6 et vérification des priorités.

U6 couvre une question/approbation active puis expirée, mais ne nomme pas son arrivée pendant que la fiche est ouverte, notamment lorsque cette fiche est modale au zoom. La priorité déclarée ne suffit pas à déterminer le retour : une nouvelle attente ou un arrêt global peut rester derrière une surface secondaire tant que la personne n’a pas pensé à fermer la fiche.

Règlement délégué :

- L’arrivée d’une demande ne déplace pas le focus vers Autoriser et ne réattribue pas la fiche à l’auteur du nouvel item.
- Dans la fiche étroite, rendre visible et annoncer une fois un statut bref de l’attente ou de la récupération corrélée, avec une commande de navigation explicite « Revenir à la demande » ou « Voir la récupération ». Elle ferme uniquement la fiche et rejoint la cible exacte via la navigation existante ; elle n’envoie, n’accorde, ne refuse et n’interrompt rien.
- En docké, le repère durable de demande/récupération reste visible dans le travail et sa destination reste atteignable ; le décor ou le buste ne passe pas avant ce repère.
- Si la demande expire avant ce retour, rejoindre son historique inactif exact avec explication, sans substituer une demande plus récente. Si la source n’est plus accessible, utiliser le repli corrélé existant, sans action métier.
- L’arrêt inconnu conserve sa portée globale et sa garde de lancement quelle que soit la fiche consultée.

Vérification à ajouter au U6 : ouvrir la fiche d’un ancien message, injecter successivement question, approbation et arrêt inconnu ; vérifier repère accessible, focus conservé jusqu’au choix de navigation, destination corrélée et aucune décision. Faire expirer la demande avant le retour. Ce contrôle reste synthétique, sans helper, réseau ou fournisseur.

## Findings structurés

Les guard_snippet suivants sont des esquisses de garde, pas du code existant ou ajouté.

~~~json
[
  {
    "lens": "edge-case-hunter",
    "location": "_bmad-output/plan-charte-atelier-agents.md:44-45",
    "trigger_condition": "La fiche et un panneau de connexion occupé sont ouverts ou fermés simultanément.",
    "guard_snippet": "openAgent(item) => hidePanelsLocallyWithoutCancel(); captureItem(item); Escape => closeTopSurfaceOnlyAndConsumeEvent();",
    "potential_consequence": "Consulter un profil peut annuler la connexion ou perdre le focus."
  },
  {
    "lens": "edge-case-hunter",
    "location": "_bmad-output/plan-charte-atelier-agents.md:45-46",
    "trigger_condition": "Une demande ou récupération arrive pendant la consultation de la fiche modale.",
    "guard_snippet": "if (agentModalOpen && attention) showNamedStatusAndExplicitNavigationToCapturedTarget(attention);",
    "potential_consequence": "Une attente prioritaire reste cachée derrière une consultation secondaire."
  }
]
~~~

## Raccords validés et limites conservées

- Identité : U2/U3, Always/Never et Code Map interdisent déjà portrait par invocation, recipient, texte ou approximation. Le nom attesté hors casting reste connu et textuel, accompagné d’un repère neutre. Inconnu, historique sans projection et restauration ne récupèrent pas un visage de convenance. Aucun constat supplémentaire.
- Conservation : U7/U10 gardent texte, sélection, contexte, source de fiche et inertie à la réouverture. Les reçus natifs, transmission et conservation de U8 restent distincts. Aucun ajout de stockage n’est nécessaire pour consulter une fiche.
- Deux thèmes et lecture : le clair complet remplace le lavande selon la direction approuvée ; mesures de contraste, contrôles natifs et zoom sont demandés. Les valeurs finales restent déléguées et à vérifier sur le rendu réel. Aucun contraste ni pixel final n’est validé par cette revue de plan.
- Monde atelier : les sept bustes prêts peuvent fournir fiche et vignette par cadrages locaux explicites ; la proposition antérieure de quatorze sources séparées était une solution candidate, pas un nouveau prérequis. Les dimensions réservées, le repli image et le chargement sobre doivent subsister. Barlow Condensed Bold locale pour noms/titres, Segoe UI pour lecture et décisions : raccord conforme à la direction. Les décors natifs restent dans le chrome, jamais derrière le texte d’un accord.
- Séquencement : la priorité actuelle autorise ce Build isolé sur le checkpoint 2.2. Elle actualise la recommandation antérieure d’attendre sa clôture complète. Les huit reçus natifs ne ferment pas M14 ni 2.2 et ne qualifient pas le futur skin. Le plan le dit explicitement ; aucune réouverture du protocole, correction du défaut sur cette branche ou équivalence entre ASAR n’est demandée ici.
- Documentation : le mandat courant réserve la réconciliation DESIGN/EXPERIENCE au monde fini. Cette revue ne modifie ni ne prétend avoir mis à jour ces spines, leur memlog ou les statuts de tickets.
- Impeccable : code-led et direction approuvée conservés. Le seed 09fa5971 dégradé sans catalogue après deux essais est une limite déclarée, pas un motif de nouvelle interview ou de nouveau monde à choisir.

## Preuves et portée de la revue

Sources lues : le plan intégral ; la préparation Sally intégrale ; le handoff local ; le direction contract local ; la référence atelier-reference-approuvee.png ouverte à résolution d’origine ; les passages App.tsx expressément concernés par les panneaux, Échap et la saisie. L’inventaire local confirme les dossiers de préproduction sous _bmad-output/initiative-madness/.working/ : sept bustes, deux décors et BarlowCondensed-Bold.ttf. Ce constat de présence n’est pas un audit de leurs pixels, transparences, licences ou SHA.

Sally reste réellement active. Dans ce nouveau root, resolve_customization.py a été exécuté avec l’interpréteur Python existant et le chemin absolu : bloc Sally résolu, listes prepend/append/persistent_facts vides. resolve_config.py a retourné core.output_folder = {project-root}/_bmad-output ; core.active_initiative n’a pas été retournée. Le chemin explicite de la présente mission fournit sa destination initiative-madness ; aucune configuration n’a été créée ou modifiée. Le resolver de bmad-review a été lu/résolu pour la lentille appliquée, sans délégation.

Aucun code, paquet, test, build, modèle Madness, compte, profil ou réseau exécuté/modifié ; aucun bmad-build relancé. Seul ce rapport est écrit par Sally. La future implémentation et ses recontrôles appartiennent au propriétaire du Build.

SHA-256 du plan lu au moment de la rédaction : 8D475AAD4ADC38536E33FB30C3404DD36022824656B7A809E6CEC3155C0A8B09.
