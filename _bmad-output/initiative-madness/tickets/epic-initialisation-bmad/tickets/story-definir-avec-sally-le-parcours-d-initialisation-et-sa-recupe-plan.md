---
title: "Définir avec Sally le parcours d’initialisation et sa récupération"
type: 'feature'
ticket: '2'
created: '2026-11-05'
status: 'built'
baseline_revision: 'cab222cd518a3844d213059667c5490920cbe74e'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick', 'structure', 'prose']
review_loop_iteration: 0
context:
  - '.agents/skills/bmad-ux/SKILL.md'
  - '_bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation/profil-g3.md'
  - '_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - '_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - 'DESIGN.md'
---

<frozen-after-approval reason="mandat humain explicite d’autonomie complète, checkpoints délégués">

## Intent

**Problem:** Le diagnostic sait expliquer un dossier, mais les contrats UX ne décrivent pas encore comment Sam initialise BMad en comprenant les effets et les résultats. Des mentions historiques de trois onglets et d’anglais futur divergent aussi du Graphe et des variantes livrés.

**Approach:** Étendre les deux spines UX adoptés avec Sally et Impeccable, depuis le profil local3.1, pour le parcours préparation → plan exact → accord → application → contrôle → retour au travail. Réconcilier les seules mentions de navigation/langue concernées, sans nouvelle identité visuelle ni produit.

## Boundaries & Constraints

**Always:** Profil3.1 borné, source locale épinglée6.13.0-next v7-shaped,27compétences et3records distingués. Préparation privée séparée des effets cible ; plan et préconditions lisibles avant décision ; accord lié au plan capturé. Refus, annulation avant effet, plan périmé, erreur, résultat partiel/inconnu et conservation distincts. Pas de promesse de rollback ou arrêt après effet. FR/EN, clair/sombre, clavier/focus/zoom/mouvement réduit et travail en cours préservés. Atelier courant du DESIGN racine, quatre onglets dont Graphe, fichiers et portraits existants conservés. Chaque règle nouvelle a une surface, un état et une sortie. Les preuves du prototype restent simulées ; document ne vaut ni interface implémentée ni G3 final.

**Never:** Modification src/resources/contrats/IPC/persistance/paquet/profil personnel, nouveau moteur/fournisseur/auth/réseau, réparation ou initialisation réelle, commande npm/npx/setup, usage des permissions Mary pour .agents/_bmad. Aucune refonte de palette/fonts/tokens, nouveau portrait ou onglet permanent, ni réécriture globale des vieux tokens UX. Aucun test long/global/natif/build/NSIS/capture/détecteur : ce lot ne produit que des contrats, pas une UI rendue. Aucun G2–G5 ou accord humain acquis.

</frozen-after-approval>

## Code Map

- `ux-madness/EXPERIENCE.md` sous l’initiative : IA, Diagnostic et initialisation, State Patterns, Conservation et sorties communes, Clavier et retour de focus, Responsive & Platform ; extension du parcours1 de Sam, garder les sept corps existants. Ancres `#epic2-conservation`, `#epic2-focus`, `#graphe-produit44`. Réconcilier trois→quatre onglets et l’anglais déjà livré2.14 dans les seules lignes concernées.
- `ux-madness/DESIGN.md` : Layout & Spacing, ligne Diagnostic et initialisation ; Dialogue, Proposition d’approbation, Détails de contexte, Indicateur et Bande de récupération réemployés. Ancres nouvelles appariées, liens relatifs vers le profil3.1. Le DESIGN racine détient l’autorité visuelle ; aucun nouveau token nécessaire.
- `DESIGN.md` racine : Oxanium16px/450, métadonnées14px, Barlow, décisions44px/utilitaires40px, palettes et casting. Lecture seule pour cette story ; descriptions UX référencent les composants courants.
- `ux-madness/.memlog.md` présent : conserver et enrichir seulement avec `_bmad/scripts/memlog.py append`. Le skill bmad-ux Update headless précise l’opération ; ses exemples/spec et headless sont à lire pour distiller les spines. ParentSally est réellement activée (resolve agent/config code0), aucune étape additionnelle/fact. Pas besoin de la réactiver ou de rerendre Build.
- `qualification-initialisation/profil-g3.md` sous cet epic : résultat local borné et limites de consentement/effets/préparation. Ne pas généraliser les valeurs462/126 à tous projets. Collision/format inconnu n’autorisent pas de réparation automatique.
- Impeccable4.3.1, context déjà exécuté avec succès pour EXPERIENCE : mode Operate, monde établi, extension locale de Diagnostic ; références shape/new-work/operate lues par le parent. Aucun choix de monde ou tournoi ; pas de code UI ni de craft-floor/détecteur/finish visuel requis. Toute hypothèse de composition se borne aux composants déjà adoptés et au mandat humain de poursuite sans questions répétées.

## Tasks & Acceptance

**Execution:**
- [x] `ux-madness/EXPERIENCE.md` — nommer les surfaces, transitions, états/récupérations et microcopies FR/EN. Montrer dossier, prérequis/profil, portée exhaustive consultable fichiers/répertoires, données préservées et limites avant accord explicite ; focus initial sûr, fermeture sans accord, double lancement refusé, inspection et retry de sauvegarde sans rejeu.
- [x] `ux-madness/DESIGN.md` — compléter la composition avec les composants existants, hauteur/overflow/focus et états du thème ; mêmes ancres que EXPERIENCE, aucune nouvelle grammaire. Compléter seulement la navigation/langue devenues obsolètes dans ces deux spines, préserver Graphe indépendant BMad/IA/Git et son retour fichier.
- [x] `ux-madness/.memlog.md` et `epic-initialisation-bmad/ux-initialisation/` — journal officiel et courte note de livraison/traçabilité : correspondance profil→règle, états, microcopies et point de consommation3.3/3.4. Vérifier liens/ancres et préservation des règles/casting/palettes. Ne pas produire une seconde paire de spines ou de gros banc.

**Acceptance Criteria:**
- Given Sam dans un dossier absent et le profil3.1, when il prépare puis lit le plan, then il distingue préparation privée et effets cible, consulte l’ensemble des changements et comprend ce qu’autorise Initialiser BMad.
- Given un plan ouvert ou périmé, when Sam ferme/annule ou que dossier/préconditions changent, then aucun accord n’est déduit et une nouvelle préparation explicite est demandée sans perte de contexte.
- Given une application interrompue ou une sauvegarde échouée, when Sam revient, then résultat et conservation restent distincts, inspection est disponible, aucun rollback/succès/rejeu implicite n’est promis.
- Given chaque variante FR/EN/thème et navigation au clavier/zoom, when Sam parcourt les règles, then actions textuelles, état/focus/retour et contenu long restent définis ; les quatre destinations dont Graphe et les sept parcours antérieurs restent préservés. Ce contrôle porte les contrats, pas une réussite visuelle ou humaine.

## Implementation Notes

Update headless livré :13états/sorties et10lignes FR/EN,5ancres appariées/23liens,30composants correspondants. Worker a conservé sept corps existants, deux suppléments Graphe et les tokens ; DESIGN racine/259fichiers produit-tests inchangés selon son relevé. Deux erreurs de vérificateur documentaire corrigées sans changer les attentes du contrat ; limites et contrôle conservés dans ux-initialisation/verification.json. Aucun code/UI rendu ou campagne lancé. Parent a lu le diff complet en deux segments et rapproché les quatre AC des règles ajoutées.

## Plan Change Log

## Review Triage Log

| ID | Verdict | Route | Vérification |
|---|---|---|---|
| Q1 | medium | patch | Texte272/étatPlanprêt gardent le plan fermé autorisable, contrairement à AC2. Le consommateur3.3 pourrait conserver une autorité de décision que le parcours abandonne ; nouvelle préparation explicite après fermeture/annulation, lecture historique seule. Réemploi des états existants, sans nouvelle surface. |
| S1 | low | patch | Paragraphe de focus182mots mêle quatre familles de règles ; consultation de la règle de fermeture ralentie. Découpage en quatre paragraphes dans l’ordre, sans contenu perdu. |
| P1 | medium | patch | Accord grammatical de garanti rend équivoque la différence entre effets interdits et rollback non garanti. Deux phrases nomment séparément absence d’écrasement/suppression et absence de garantie. |
| P2 | low | patch | Verbe omis après Refuser fait lire le résultat comme objet à refuser ; rétablir focalise, même règle de focus. |
| P3 | low | patch | FR/EN longs ne nomme pas les libellés et la seconde proposition manque d’article ; correction directe de grammaire, même overflow. |

Toutes les revues ont répondu avant triage. Structure puis prose dépendante constituent le standard BMad UX ; Quick vérifie aussi les limites du profil et la cohérence du parcours high. Cinq corrections confiées au même worker, aucun test long autorisé ni critère modifié pour éviter un constat.

Q1 recontrôlé resolved par son Quick original ; S1 etP1–P3 scorés resolved par le même relecteur éditorial. Le parent a lu le delta réel, contrôles documentaires11/11 puis diff--check0, aucun constat courant différé. Les deux corrections de vérificateur initial restent nommées, aucune preuve rendue ni qualification finale ajoutée.

## Design Notes

Un seul résultat : contrat UX d’initialisation avant code. Risque high hérité, mauvaise lecture d’accord peut altérer un projet. Route full : ajout documentaire cohérent au-delà de100lignes, distillation UX par worker dédié. Fast/headless Update, outils créatifs off et nouveaux états spine-only sous le mandat explicite ; aucune décision esthétique ouverte. Les questions sur interruption/provenance restent limites techniques, pas hypothèses de besoin.3.3 attend2.16 tant qu’un REPLAN explicite n’a pas changé la livraison ; ne pas modifier ce backlog dans ce lot.

Worker possède seulement les deux spines UX, leur memlog via script et ux-initialisation/ ; parent seul plan/AGENTS/statuts/git. Tu n’es pas seul dans le dépôt : préserver les edits d’autrui et tests/bmad-help-boundaries.test.mjs M/EOL-only. Tous les exec même lecture : pwsh/login:false/workdir C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness/require_escalated, py -X utf8 ; UTF8/LF et git -c core.longpaths=true. Aucun sous-Build, nouvel agent ou commit par worker. Parent réalisera ensuite Quick + cohérence des limites high et le standard bmad-review structure/prose ; ne pas anticiper ces verdicts. Aucun seuil de tokens.

## Verification

**Commands:**
- Script court de lecture des liens/ancres nouveaux, couverture des états et préservation visuelle/documents hors scope ; conserver son petit résultat, aucune suite générique.
- `git -c core.longpaths=true diff --check` sur les seules modifications de ce lot.

**Manual checks:**
- Rapprocher chaque transition du profil et les quatre critères ci-dessus ; préserver le prototype historique comme simulation, ne pas présenter un contrat en preuve d’exécution. Lectures syntaxiques et parcours des tables seulement, pas test clavier/zoom rendu.
