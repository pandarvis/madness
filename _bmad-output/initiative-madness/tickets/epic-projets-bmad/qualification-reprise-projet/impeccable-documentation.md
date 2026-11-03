# Audit documentaire Impeccable — reprise du projet 2.4

Passage du 3 novembre 2026, extension **Operate** du monde atelier existant. Substitut technique frais du rôle natif `impeccable_documenter` indisponible : définition officielle et `reference/document.md` lus directement, sans prétendre à une activation native.

**Disposition : aucun changement au système.** Le seul fichier écrit par ce passage est le présent compte rendu. `DESIGN.md`, `.impeccable/design.json`, la persistance de surface et les deux spines UX sont conservés. La reprise assemble des primitives et détails de preuve existants ; elle ne crée ni monde, palette, rôle typographique, illustration, signature ou composant de système à ajouter au sidecar. Aucun nouveau concours visuel, comp, QUALITY BAR ou détecteur n’est requis par cet audit.

## Références effectivement vérifiées

- Définition officielle : `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/agents/impeccable_documenter.toml` ; référence complète `reference/document.md` du même skill. Les règles d’extension ordinaire, de non-canonisation des défauts et du sidecar v2 s’appliquent.
- Autorité visuelle : [DESIGN racine](../../../../../DESIGN.md), frontmatter et huit sections de système, dont Quiet Reading, Explicit State, Two Voices, Working Center et Empty Center ; [PRODUCT.md](../../../../../PRODUCT.md), usage personnel local, engagements de marque et décisions Oxanium/casting.
- Persistance : [configuration code-led](../../../../../.impeccable/config.json), [contrat de surface](../../../../../.impeccable/surfaces/src-renderer-src-app-tsx.md), THESIS/OWN-WORLD/STORY/FIRST VIEWPORT/FORM et historique ; [sidecar v2](../../../../../.impeccable/design.json), extensions, règles narratives et échantillons Primary/Secondary/Text action/Navigation. Les métadonnées du sidecar étendent les primitives du frontmatter ; aucune régénération n’est nécessaire pour cet assemblage local.
- Contrats comportementaux : [spine DESIGN](../../../ux-madness/DESIGN.md), ordre de Parcours, extension 2.4 et ligne Reprise du projet ; [spine EXPERIENCE](../../../ux-madness/EXPERIENCE.md), architecture, lexique FR/EN, états, focus et parcours 5. L’extension reste dans les sept parcours existants, sans relancer un agent.
- Code échantillonné : [ProjectResume.tsx](../../../../../src/renderer/src/ProjectResume.tsx), [progress.css](../../../../../src/renderer/src/progress.css), intégration [App.tsx](../../../../../src/renderer/src/App.tsx), lexique [strings.ts](../../../../../src/renderer/src/strings.ts), imports [main.tsx](../../../../../src/renderer/src/main.tsx), règles héritées de [styles.css](../../../../../src/renderer/src/styles.css) et [atelier-controls.css](../../../../../src/renderer/src/atelier-controls.css).

## Concordance avec l’artefact

`progress.css`, chargé après les couches atelier et initiatives, n’introduit aucune couleur littérale ni police. Traits, textes secondaires, liens et contradictions utilisent `--line`, `--muted`, `--link` et `--waiting-text`. Les titres, le texte et les commandes héritent des deux voix existantes ; les valeurs locales ne deviennent pas des tokens globaux.

La région de reprise précède HelpPanel dans Parcours. Quatre commandes nommées atteignent les titres État connu, Résultats et décisions connus, Récapitulatifs disponibles et Travail restant connu ; la liste exhaustive des déclarations reste dans un `details` replié par défaut. Les autres preuves sont aussi des détails natifs, avec texte littéral, chemin, nature, SHA-256, observation et contexte. Les récapitulatifs conservent leur identifiant et contexte capturés. Date, couverture partielle, observation ancienne, contradiction et acceptation inconnue demeurent des textes distincts ; aucune jauge ou validation n’est ajoutée.

L’espacement local emploie principalement 4/8/12/16/20/24/28 px. La preuve longue est bornée à 72 ch, chemins et révisions se replient, et les faits de source passent en une colonne sous 721 px. Les accès locaux et résumés ont un minimum de 40 px ; le bouton secondaire conserve la commande atelier héritée. Les annonces de lecture et le retour au registre si une preuve disparaît sont présents dans le code. Ce constat de source ne remplace pas une qualification clavier ou native.

## Preuves visuelles et portée

Le [reçu visual-finish-001](./visual-finish-001/verification.json) a été lu pour sa provenance, ses limites, captures et contrôles. Les cinq PNG suivants ont été ouverts directement pour inspection ; leurs SHA-256 correspondent aux cinq empreintes du reçu.

| Capture | Viewport CSS | Pixels PNG | Origine |
|---|---:|---:|---|
| [Grand sombre](./visual-finish-001/resume-large-dark-native.png) | 1440 × 920 | 1800 × 1150 | Projection Main004 historique réhydratée |
| [Compact clair](./visual-finish-001/resume-compact-light-native.png) | 720 × 820 | 900 × 1025 | Même projection historique |
| [Zoom 200 %](./visual-finish-001/resume-zoom-200-native.png) | 720 × 460 | 1800 × 1150 | Même projection historique |
| [Liste longue](./visual-finish-001/resume-long-list-native.png) | 1440 × 920 | 1800 × 1150 | Projet distinct et 120 entrées synthétiques |
| [Détail long](./visual-finish-001/resume-long-detail-native.png) | 1440 × 920 | 1800 × 1150 | Preuve synthétique du même projet distinct |

Ces images montrent la continuité de l’atelier et les accès ajoutés, avec des fonds de lecture calmes et les preuves textuelles. Elles ne prouvent pas une collecte actuelle du système de fichiers : `binaryEquivalenceClaim` est faux dans le reçu, les annexes de sélection sont des fixtures de vue et les conversations Main004 gardent leur contexte propre. La capture zoom porte encore l’infobulle de thème ; le [handoff final](./final-scope-handoff.md) conserve le désaccord DOM/frame sans cause établie. Cette limite n’est ni effacée ni promue en règle visuelle.

Le mandat parent transmet le recontrôle F1 résolu et le ship limité du même finish reviewer ; ce passage documentaire ne crée aucun verdict de finish supplémentaire. Le [détecteur unique conservé](./impeccable-detector.json) contient `[]` et son stderr est vide ; il n’a pas été relancé. Les tests et builds appartiennent à leurs reçus distincts : aucun test, build, helper, modèle, réseau ou profil personnel n’a été exécuté ou ouvert par cet audit. La qualification native du candidat final reste à son passage parent ; ni installation, story built, accord humain nouveau, conformité WCAG globale ni preuve native finale ne sont déduits des replays.

## Système conservé — cinq lignes

1. Palette : pétrole/terracotta, anthracite chaud par défaut et ivoire alternatif ; couleurs sémantiques accompagnées de texte.
2. Typographie : Barlow Condensed Bold pour titres/commandes, Oxanium 450 à 16 px pour le courant, petits textes et code à 14 px selon leur rôle ; titres locaux 28/22 px, sous-titres de ticket 19 px.
3. Lecture : Quiet Reading et Working Center ; groupes dans le flux, preuves à la demande, chemins extensibles et fonds calmes.
4. Interaction : commandes atelier héritées, focus entier, détails natifs et quatre accès locaux ; aucune décision ou activité implicite.
5. Provenance : Explicit State et Two Voices ; sept personnages réservés aux identités attestées, parcours 5 étendu sans modifier les sept parcours.

**Dérives non canonisées ni réparées :** le frontmatter UX conserve notamment Segoe UI et ses anciennes tailles 13/14 px, explicitement supplantées par l’autorité racine dans l’extension 2.4 ; les mentions logicielles 0.2.5 du système et 0.2.6 du contrat 2.3 restent une chronologie antérieure, et l’infobulle visible au zoom demeure une limite de capture. Ce passage d’extension n’autorise ni migration générale des contrats ni correction produit indépendante.
