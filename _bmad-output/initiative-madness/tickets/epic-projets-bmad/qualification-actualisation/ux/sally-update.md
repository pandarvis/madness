# Sally — contrat d’actualisation 2.5

Le résumé conserve la version que le porteur lit jusqu’à une bascule volontaire vers la nouvelle observation. Sa fraîcheur devient immédiatement ancienne ou incertaine dès qu’un changement est détecté ; l’activité de lecture ne masque jamais cette information. Les changements sont regroupés et les brouillons restent disponibles pendant les lectures locales.

## Portée et activation

Update headless de bmad-ux sur les deux spines adoptés, sous mandat d’implémentation autonome du porteur transmis par le parent. Sally réellement activée par bmad-agent-ux-designer : resolver agent/config, persona et règles chargées ; prepend, append et faits personnalisés vides. Puis resolver workflow/config bmad-ux, référence headless, exemples des deux spines et Pass 1. Impeccable `context --target src/renderer/src/App.tsx` exécuté une seule fois dans cette session fraîche ; contexte et fichiers directement relus, mode Operate conservé. L’intention précise et la délégation remplacent l’entretien/confirmation Shape ; aucune nouvelle direction visuelle n’est choisie. Le travail est documentaire ; craft-floor, détecteur et finish ne sont pas exécutés ici. Le parent coordonne le code et sa finition ultérieure.

Brief : le seul porteur consulte son projet sous Windows pendant des changements externes. Il doit comprendre quelle observation il lit et continuer sa saisie pendant une collecte. Surface existante Reprise du projet dans Parcours ; commandes, palette, Oxanium/Barlow, casting, icônes compactes et monde atelier conservés. Le contrôle local complet n’est pas instantané : [2.18](../../qualification-latence-runtime/parent-verification.md) rapporte des gardes médianes autour de 1–2 s, mais lectures complètes 14–17 s et premier prepare 33,307 s sur cette série. Aucun délai produit ni garantie générale n’en est tiré.

## Changements normatifs et réemploi

| Point | Décision écrite / source conservée |
|---|---|
| Fraîcheur et activité | EXPERIENCE · [Actualisation locale](../../../../ux-madness/EXPERIENCE.md#epic2-refresh) : informations séparées ; ancien/incertain ne disparaît pas pendant lecture. Événement, poll sans différence ou navigation ne suffisent jamais à annoncer courant. |
| Regroupement | Une lecture et une suite groupée en attente visibles ; aucun lancement concurrent par événement. En cas d’occupation/arrêt inconnu, ancien résultat et motif conservés. Perte d’événements/surveillance indisponible donne une limite explicite ; collecte sûre avant nouvelle observation. |
| Lecture ouverte | Même projet/racine/initiative : conserver version affichée, détails, focus et défilement. Une nouvelle révision disponible ne remplace pas les octets lus. Afficher la nouvelle observation bascule tout le résumé avec ses métadonnées ; elle peut fermer les anciens détails. Aucun mécanisme de comparaison ni historique illimité ajouté. |
| Contexte différent | Conserver les règles de sélection 2.3 et le contexte capturé ; ne pas porter les détails étrangers au nouveau contexte, ni appliquer un retour tardif à la destination actuelle. |
| Erreur et mutation | Ancienne preuve historique conservée, absence/remplacement/refus explicites. Mutation pendant lecture empêche d’annoncer courant ; suite groupée sans boucle infinie. En cas de mutation au point d’effet, refuser l’action et exiger une nouvelle préparation. Aucun accord transféré. |
| Recommandation native | Réponse brute et reçu d’origine conservés ; proposition ancienne identifiable près de son accès, sans régénération ni réécriture de conversation par actualisation locale. |
| Conservation | EXPERIENCE · Conservation et sorties communes, Interaction Primitives et parcours 4/7 déjà couvrants : brouillons projet/demande/échange séparés, historique et sélection conservés, réouverture passive. Aucun nouveau modèle de brouillon ajouté. |
| Présentation | DESIGN · Layout & Spacing : ligne de fraîcheur + activité et commande secondaire dans le flux existant, sans nouveau composant. Libellés FR/EN, deux thèmes, compact/zoom/clavier/réduction de mouvement hérités ; anglais reste contrat avant 2.14. |

Le conflit avec le comportement 2.4 est explicite : ProjectResume inclut snapshot.revision dans readingScope et referme les détails lors d’un changement de révision ; le test de conservation Q3UI l’exigeait. Pour 2.5, seule la bascule volontaire vers une observation différente peut refermer ces détails sur le même contexte. Le contrat remplace cette fermeture automatique ; le parent/worker doivent adapter la vérification correspondante. Le repli de focus à la disparition d’une preuve n’est permis que pour l’élément effectivement focalisé dans la surface active lors d’une action volontaire, jamais à partir d’un ancien repère mémorisé après départ de la preuve.

## Sources et visuels réellement consultés

Entrée 5 et dépendance 18 dans [tickets.toml](../../tickets/tickets.toml), et [epic-projets-bmad](../../epic-projets-bmad.md) lus avant les companions. Spines DESIGN/EXPERIENCE et memlog existante lus ; PRODUCT, DESIGN racine et brief App courants consultés. Implémentation pertinente lue : ProjectResume.tsx, HelpPanel.tsx, branche d’intégration Parcours/Conversation de App.tsx. Ces lectures montrent les détails natifs, le marquage ancien et les reçus d’aide disponibles ; elles ne constituent pas une qualification du produit.

Trois images existantes ont réellement été ouvertes avec view_image :

| Capture | Portée réellement vue |
|---|---|
| [Grande sombre](../../qualification-reprise-projet/visual-finish-001/resume-large-dark-native.png) | Reprise, observation ancienne, quatre accès, détails repliables ; 1800 × 1150 pixels. |
| [Compacte claire](../../qualification-reprise-projet/visual-recapture-zoom-003/resume-compact-light-native.png) | Reprise, déclarations contradictoires et détails en flux ; 900 × 1025 pixels. |
| [Zoom 200 % sombre](../../qualification-reprise-projet/visual-recapture-zoom-003/resume-zoom-200-native.png) | Observation et accès de preuve sur contenu agrandi ; 1800 × 1150 pixels. |

Leurs reçus [visual-finish-001](../../qualification-reprise-projet/visual-finish-001/verification.json), [recapture-003](../../qualification-reprise-projet/visual-recapture-zoom-003/verification.json) et la [vérification parent 2.4](../../qualification-reprise-projet/parent-verification.md) ont été lus. Ils identifient une projection Main004 explicitement historique, réhydratée pour inspection avec son contexte ; les annexes de sélection sont des fixtures dérivées et les cas longue liste distincts. Aucun nouveau snapshot courant, rendu 2.5, équivalence binaire avec le paquet actuel, capture personnelle, approbation humaine ou audit WCAG n’est déduit. Les anciens crops/compact mal nommés écartés par ces reçus ne sont pas utilisés. Les captures et la lecture du code actuel sont cohérentes sur le monde visuel et la structure ; elles ne vérifient pas les états d’actualisation encore à implémenter.

## Vérifications documentaires et relais

Pass 1 ciblé : le parcours 5 existant porte toutes les situations de l’entrée 5 ; les sept parcours restent présents. Aucune surface ni composant nouveau : Reprise du projet, Registre des preuves, Aides chargées et Recommandation sont déjà appariés dans les deux tables. Tokens et ordre canonique des sections conservés ; seuls date/source et prose contractuelle évoluent. La preuve de liens et d’intégrité est dans [sally-verification.json](sally-verification.json). Standards bmad-review effectivement exécutés par deux agents frais : [structure](review-structure.md), aucun constat ; puis [prose](review-prose.md), deux clarifications acceptées et appliquées. Le [même relecteur prose](review-prose-recheck.md) les confirme résolues, aucun point restant dans ce recontrôle ciblé. Le [registre des appels](review-register.json) conserve les identités et empreintes des entrées réellement remises. Aucun autre reviewer UX ni mock nouveau : cette extension locale reste décrite par les spines.

Le parent doit qualifier les courses fichier/lecture/action, le regroupement et ses garde-fous, la surveillance indisponible, la lecture/saisie pendant attente, la bascule volontaire, le focus hors preuve, les retours tardifs, la fermeture et la réouverture passive. Ces contrôles ne sont pas exécutés par Sally. Aucun app, test, build, fournisseur, réseau, compte, profil personnel, paquet, ressource, AGENTS, staging ou commit n’est modifié/lancé ici. Les mentions historiques de versions/statuts dans les spines ne sont pas migrées par ce changement ciblé.
