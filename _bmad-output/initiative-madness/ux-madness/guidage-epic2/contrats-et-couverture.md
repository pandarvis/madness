# Guidage de l’epic 2 — contrats et couverture

Update Sally du 2 novembre 2026, sous mandat autonome, pour la story 2.17. Cet index permet de retrouver les règles ; il ne constitue pas un troisième contrat UX. [DESIGN.md](../DESIGN.md) gouverne l’apparence et [EXPERIENCE.md](../EXPERIENCE.md) le comportement. Les décisions de conception sont déléguées, sans nouvelle approbation visuelle humaine. Le résultat de production est dans [update-result.json](update-result.json) ; les revues et le verdict Build restent au parent.


La [réconciliation atelier du candidat 0.2.1](../qualification-atelier/sally-final-reconciliation.md) actualise depuis cet état palettes, typographie, Portrait d’agent, Fiche agent et Signalements de la fiche. Les comptes et comparaisons de tokens ci-dessous décrivent la production historique de 2.17 ; ils ne prétendent plus que le chrome courant est inchangé. Les sept parcours et leurs ancres restent identiques.

## Sources et statut de preuve

Le [plan 2.17](../../tickets/epic-projets-bmad/tickets/story-definir-avec-sally-les-parcours-de-guidage-et-de-fichiers-plan.md), l’[epic](../../tickets/epic-projets-bmad/epic-projets-bmad.md), son [manifeste inchangé](../../tickets/epic-projets-bmad/tickets/tickets.toml) et le [profil G2 candidat](../../tickets/epic-projets-bmad/qualification-profil-g2/profil-g2.md) bornent cet Update. Le candidat final `run-d499adb2942e40e8a84c370fb7208ef2` qualifie une observation hors produit ; ses 15 cas ne sont pas des essais de ces parcours UX.

Les sept extensions sont **spine-only** : références textuelles et composition adoptée, sans nouvelle maquette, capture, inspection d’application, détecteur ou intégration. Les anciens imports et simulations restent historiques. Le chrome de la refonte est livré selon sa [preuve existante](../qualification-refonte/parent-verification.md) ; les preuves natives 1.11 restent [celles de leur paquet](../../tickets/epic-boucle-codex/qualification-e2e/parent-verification.md). Aucun nouveau résultat natif, G2 intégré, G3 éditeur ou accord humain n’est attribué aux présents documents.

## Références communes

| Besoin de l’implémenteur | Section normative |
|---|---|
| Destinations et statut livré/contractuel | EXPERIENCE · [Information Architecture](../EXPERIENCE.md#information-architecture), [Foundation](../EXPERIENCE.md#foundation) |
| Lexique d’actions, états et erreurs FR/EN | EXPERIENCE · [Libellés de l’epic 2](../EXPERIENCE.md#epic2-copy), Voice and Tone |
| Anatomie et comportement des composants | DESIGN · [Components](../DESIGN.md#components), EXPERIENCE · [Component Patterns](../EXPERIENCE.md#component-patterns) |
| Attente, refus, périmé, interruption et indisponibilité | EXPERIENCE · [State Patterns](../EXPERIENCE.md#state-patterns), puis échec/récupération de chaque parcours |
| Échec d’enregistrement et retour au travail | EXPERIENCE · [Conservation et sorties communes](../EXPERIENCE.md#epic2-conservation) |
| Commandes clavier, focus et fermeture | EXPERIENCE · [Clavier et retour de focus](../EXPERIENCE.md#epic2-focus), [Accessibility Floor](../EXPERIENCE.md#accessibility-floor) |
| Densité, texte long et hiérarchie | DESIGN · [Typography](../DESIGN.md#typography), [Layout & Spacing](../DESIGN.md#layout--spacing), [Components](../DESIGN.md#components) |
| Zoom, petite fenêtre, clair/sombre et langue | EXPERIENCE · [Responsive & Platform](../EXPERIENCE.md#responsive--platform), Accessibility Floor ; DESIGN · Layout & Spacing, [Colors](../DESIGN.md#colors) |

## Sept parcours et consommateurs

Les noms de consommateurs ci-dessous reprennent le manifeste. Les cas à inspecter renvoient aux règles des spines ; ils ne les remplacent pas.

| Parcours normatif | Consommateurs 2.2–2.9 | Cas à inspecter et retour |
|---|---|---|
| [P1 — Ouvrir et diagnostiquer un projet](../EXPERIENCE.md#epic2-p1) | 2.2 « Obtenir une prochaine action avec l’aide BMad du projet » ; contexte utilisé par 2.3–2.9 | Annulation du choix ; lecture en attente ; absence/ancien/inconnu/partiel/incompatible ; refus de frontière/configuration ; périmé ; interruption et conservation échouée. Retour au travail précédent ou au déclencheur diagnostic. |
| [P2 — Obtenir une prochaine action avec l’aide BMad du projet](../EXPERIENCE.md#epic2-p2) | 2.2 ; alternatives consommées par 2.6/2.7 | Aide réellement lue contre référence seule ; capacité native absente ; bundle changé avant envoi ; refus/envoi inconnu ; interruption/réseau ; réponse reçue mais non conservée. Retour à l’échange natif exact ou au brouillon d’origine. |
| [P3 — Explorer le catalogue réellement installé et lancer une action qualifiée](../EXPERIENCE.md#epic2-p3) | 2.6 « Explorer le catalogue réellement installé et ses fiches » ; 2.7 « Lancer les actions qualifiées du catalogue dans la conversation » | Recherche filtrée vide contre inventaire vide/refusé ; fiche disparue/périmée ; copie échouée ; invocation sûre sans runtime ; préparation annulée ; préconditions mutées ; interruption/sauvegarde échouée. Retour au résultat et filtres exacts ou au brouillon conservé. |
| [P4 — Retrouver et choisir les initiatives sans réattribuer les échanges](../EXPERIENCE.md#epic2-p4) | 2.3 « Retrouver et choisir les initiatives sans réattribuer les échanges » ; contexte de 2.4–2.9 | Active/sélection distinctes, aucune initiative, conflit, active inconnue, suppression pendant choix, lecture refusée/interrompue et sélection non enregistrée. Retour au sélecteur/en-tête ; échanges et configuration inchangés par navigation. |
| [P5 — Lire le parcours et actualiser ses preuves](../EXPERIENCE.md#epic2-p5) | 2.4 « Lire le parcours et ses preuves à la bonne révision » ; 2.5 « Actualiser les preuves après des changements externes » | Entrée TOML sans feuille ; sources contradictoires ; révisions différentes ; fichier présent/built sans acceptation ; ajout/suppression/remplacement/mutation pendant saisie et lecture ; refus/interruption/conservation échouée. Retour à la preuve exacte ou au titre du registre si disparue. |
| [P6 — Consulter les livrables et demander leur ouverture dans l’éditeur](../EXPERIENCE.md#epic2-p6) | 2.8 « Consulter les livrables et demander leur ouverture dans l’éditeur » ; destination de 2.9 | Aperçu/agrandissement ; fichier inaccessible/hors portée/type refusé/trop grand ; périmé ; lecture interrompue ; éditeur absent/échec/inconnu ; copie et conservation échouées. Retour au panneau puis au travail et focus d’origine. |
| [P7 — Retrouver son travail et ses attentes entre plusieurs projets](../EXPERIENCE.md#epic2-p7) | 2.9 « Retrouver son travail et ses attentes entre plusieurs projets » | Accueil vide ; demande active puis expirée ; relecture/fichier/erreur/interruption ; projet absent ; destination périmée ; sauvegarde échouée ; arrivée asynchrone après navigation. Retour exact au projet/onglet/échange/fichier et point de saisie quittés. |

### Matrice des exigences de 2.17

| Exigence locale de l’epic | Parcours et complément normatif |
|---|---|
| R1 — projets existants | P1, P4, P7 ; Conservation et sorties communes |
| R2 — accueil et attentes | P7 ; Ligne de projet ou d’attente, State Patterns |
| R3 — diagnostic utile et compatibilité effective | P1 ; Diagnostic et initialisation, State Patterns |
| R4 — projet et initiative | P4 ; Sélecteur d’initiative, P2/P3 pour le contexte d’effet |
| R5 — parcours et preuves | P5, P6 ; Registre des preuves |
| R6 — changements externes | P5, P6 ; State Patterns, préflight au point d’effet |
| R7 — faits/déductions/propositions/acceptations | P5, P7 ; Voice and Tone, Registre des preuves |
| R8 — aide et recommandation | P2, P3 ; Aides chargées et Recommandation distinctes |
| R9 — catalogue réel | P3 ; Catalogue des compétences, vide/refus/incompatibilité |
| R10 — fiche et disponibilité | P3 ; Fiche compétence, copie et lancement séparés |
| R11 — aperçu et éditeur | P6 ; Panneau de fichiers, accusé borné au fait observable |
| R12 — navigation et conservation | P7 ; Conservation et sorties communes, Responsive & Platform |
| R13 — accessibilité | Tous ; Clavier et retour de focus, Accessibility Floor, DESIGN Colors |
| R14 — langues et thèmes | Tous ; Libellés de l’epic 2, Responsive & Platform, DESIGN Colors |

R15/R32 n’appartient pas à cet Update : Q8/Q9 puis 2.10/2.12 définissent les mesures, 2.11/2.13 les consomment. La traduction intégrée de tous les parcours reste 2.14 ; les libellés ci-dessus ne prétendent pas la livrer.

## Contre-exemples du candidat 2.1

| Risque de confusion | Référence qui le tranche |
|---|---|
| `method` incomplet interdirait toutes les aides | P1/P2 ; State Patterns aide lisible et profil partiel, capacités indépendantes |
| Topics ou migrations référencés seraient du texte déjà chargé | P2 ; Aides chargées, couverture et références seules |
| Aide chargée signifierait « BMad recommande » | P2 ; Recommandation, envoi et réponse natifs attestés distincts |
| Invocation `$<nom-dossier>` copiable deviendrait lançable | P3 ; Fiche compétence et disponibilité indépendante du runtime |
| Une version v7 ou un état agrégé autoriserait tout | P1 ; Diagnostic par capacité, profil candidat observé sans G2 intégré |
| La copie utilisateur masquée réapparaîtrait dans le catalogue | P3 ; Catalogue des compétences, priorité du nom de dossier selon profil |
| Une sélection Madness changerait l’active ou déplacerait un échange | P4 ; Sélecteur d’initiative, conflit sans mutation BMad |
| Une résolution ou acceptation ancienne vaudrait pour de nouveaux octets | P4/P5 ; State Patterns reçu invalidé, contrôle au point d’effet |
| Une feuille absente supprimerait une US TOML ou built vaudrait acceptation | P5 ; Registre des preuves, sources et statuts séparés |
| Un chemin/clic éditeur prouverait une fenêtre ouverte ou une lecture humaine | P6 ; retour observable, inconnu conservé |

## Pass 1 — couverture documentaire

Inspection de production prescrite par `bmad-ux/references/validate.md`, distincte des futures revues UX/Quick et des essais du produit.

| Catégorie | Extraction et contrôle |
|---|---|
| Parcours | Les sept destinations demandées par le plan et R1–R14 figurent dans les matrices ci-dessus ; chaque Key Flow a Sam, des étapes numérotées, un moment décisif et un échec/récupération. |
| Tokens | Inventorier le YAML DESIGN et chaque référence `{path.to.token}` des spines ; références visuelles définies, couleurs hex et cibles de contraste conservées. Vérifier séparément que les blocs colors/light-colors/typography/rounded/spacing/components restent identiques à la baseline. Les paramètres de microcopie ne sont pas des tokens visuels. |
| Composants | Les composants des tables sont appariés par nom entre DESIGN Components et EXPERIENCE Component Patterns, avec règles visuelles et comportementales. Nouveaux noms : Sélecteur d’initiative, Aides chargées et Registre des preuves. Les destinations/preparations/notifications utilisent les composants déjà nommés. |
| États | Chaque surface de l’IA est couverte par State Patterns, Conservation et sorties communes, son Key Flow et le tableau de focus ; attente, refus, périmé, interruption, enregistrement échoué et retour sont inspectés pour les destinations concernées. Hors ligne distingue consultation locale et capacité native indisponible. |
| Références visuelles | Les deux imports, les trois captures de navigation et les quatre fichiers du prototype sont tous référencés dans les spines ; aucun nouvel artefact visuel. Références recensées ci-dessous. |

### Références visuelles historiques

| Fichier conservé | Lieu et rôle dans les spines |
|---|---|
| `imports/reference-codex-desktop.png` | DESIGN Brand & Style ; EXPERIENCE Inspiration & Anti-patterns : inspiration de composition |
| `imports/reference-navigation-repliee.png` | DESIGN Layout & Spacing ; EXPERIENCE Inspiration & Anti-patterns : navigation rétractable |
| `mockups/navigation-deployee.png` | DESIGN Layout & Spacing ; EXPERIENCE Responsive & Platform : base déployée |
| `mockups/navigation-repliee.png` | DESIGN Layout & Spacing ; EXPERIENCE Responsive & Platform : base rail |
| `mockups/navigation-mobile.png` | DESIGN Layout & Spacing ; EXPERIENCE Responsive & Platform : petite fenêtre en tiroir, pas application mobile |
| `mockups/parcours-guide/index.html` | DESIGN Brand & Style ; EXPERIENCE Foundation : simulation Parcours guidé |
| `mockups/parcours-guide/styles.css` | DESIGN Layout & Spacing : style de la simulation historique |
| `mockups/parcours-guide/catalogue.js` | EXPERIENCE Catalogue des compétences : inventaire simulé, aucun quota |
| `mockups/parcours-guide/app.js` | EXPERIENCE Interaction Primitives : délais et réponses simulés |

L’ancien surface-brief du prototype sous `.impeccable/` est hors autorité produit et inchangé ; il ne devient pas une référence de cet Update. Aucun répertoire `wireframes/` n’est présent. Les dérives de format historiques ne motivent aucune migration de tokens.

Contrôle mécanique de production exécuté depuis la baseline `bf3e8a78282e44ba41d0cfee69e11715be424a30` : huit sections DESIGN et dix sections EXPERIENCE dans leur ordre initial, 26 composants appariés, 71 références de tokens résolues, 60 liens locaux et leurs ancres résolus, sept Key Flows et neuf fichiers visuels historiques reliés. Le bloc de tokens, de `colors` à la fin du YAML, reste identique ; SHA256 de ce bloc normalisé LF : `08db89e673381ed81b2a6658fdd4286ba71fed54062755525114615d80aaf044`. JSON headless parsé et `git diff --check` du lot suivi réussis. Ces comptes décrivent les documents, pas des assertions produit ou des essais d’accessibilité. La comparaison indépendante reste au parent.

## Vérification attendue des consommateurs

À l’implémentation, exécuter P1–P7 et leurs cas d’échec sur le paquet réel : clavier seul, focus, retour de Dialogue, zoom 200 %, texte et chemins longs, langue FR/EN et deux thèmes, largeurs de référence des spines. Vérifier avant/après le contexte capturé, l’invocation, les aides transmises, les révisions et les brouillons libres/de demandes/de préparation. Après réouverture, seuls les faits durables effectivement enregistrés peuvent être annoncés retrouvés ; aucune relance automatique.

Ces vérifications sont des obligations de consommateurs, pas des contrôles exécutés par la story documentaire 2.17. Le parent vérifie maintenant le diff, les liens, l’ordre des spines et la conservation indépendante des tokens, puis conduit les revues autorisées et leur triage. Aucun test synthétique calquant le texte, build, installateur, réseau ou profil personnel n’est nécessaire pour ce lot.

## Clôture parent

Les vérifications indépendantes et les revues sont terminées ; Q1 résolu, déplacement structurel et quatre corrections prose appliqués, aucun correctif différé. Les résultats de production ci-dessus restent leur état historique ; conclusion courante dans `parent-verification.md` et `revues.md`. Les contrats finalisés restent sans nouvelle preuve de rendu ou intégration native.
