---
title: "Définir avec Sally l'exploration accessible du graphe"
type: 'feature'
ticket: 2
created: '2026-11-04'
status: 'built'
baseline_revision: '5fc6b7239f3fd2327e8eea7630e68757a7bd2714'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/PRODUCT.md'
  - '{project-root}/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/DESIGN.md'
  - '{project-root}/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/profil-g5.md'
  - '{project-root}/_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/schema-profile.json'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le graphe réel est qualifié sur témoins en4.1, mais son exploration n'a pas encore de règles UX utilisables par les prochains contrats et surfaces. Le porteur veut voir Graphify du projet ouvert dans cette V1 sans perdre son travail BMad ni confondre graphe, certitude et validation.

**Approach:** Sally réellement activée avec Impeccable définit un supplément UX local pour l'onglet projet Graphe : génération volontaire, recherche/zoom/relations et nœud vers fichier, avec états/fraîcheur/provenance et retour au travail. Livrer un contrat documentaire vérifié, à réconcilier avec les spines et fournisseurs stabilisés en4.4.

## Boundaries & Constraints

**Always:** Charte atelier/typos/palette et shell projet actuels conservés ; commandes compactes et icônes accessibles, Operate. FR/EN, clair/sombre, clavier/focus, zoom200%, mouvement réduit et sens des relations accessibles sans couleur/survol seuls. Projet/racine/périmètre/analyse/révision et dernier complet identifiables ; absent/en cours/disponible/partiel/ancien/incompatible/échec distincts. Toute génération/actualisation reste explicite, sans modèle ni connexion fournisseur nécessaire au profil local. Sources et graphes partiels/anciens ne deviennent jamais actuels par navigation ou restauration. Produit BMad utilisable quand Graphe indisponible ; aucun état du graphe ne valide le projet.

**Never:** Modifier src/tests/scripts/ressources, contrats existants, Main/preload/persistance, profils/compte/paquet installé, architecture, PRODUCT/DESIGN racine, spines partagés ou sidecar Impeccable ; installer/analyser Graphify, lancer un modèle, OAuth/JWKS, réseau/CUA ou projet personnel. Ni UI/prototype/HTML/raster nouveau, bibliothèque de rendu adoptée sans qualification, seuil de taille/performance inventé, payload/HTML Graphify dans renderer, ni port GraphSnapshot produit anticipé. Ne pas présenter contrats ou captures historiques comme UI livrée, acceptation humaine ou G5.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Règle documentaire à démontrer | Erreur / limite |
|---|---|---|---|
| U1 entrée/retour | Projet ouvert, brouillon/échange et onglets déjà présents ; Codex déconnecté | Graphe comme troisième onglet du même projet, découverte et retour prévisibles ; sélection/vue/saisie conservées au bon contexte ; aucun lancement au changement d'onglet | Ne pas attribuer capture d'un autre projet/initiative ni bloquer le graphe local sur le compte IA |
| U2 analyse/échec | Absent puis demande explicite, en cours, arrêt/timeout/fermeture, incompatible/échec | Actions et retours d'état définis sans pourcentage fictif ; dernier complet conservé et arrêt connu/inconnu distincts ; réessai volontaire | Aucun redémarrage après restauration, aucune erreur du graphe bloque BMad |
| U3 lecture/confiance | Résultat complet/partiel/ancien, mutation non commitée ou pendant analyse, sens/confidence/source | Date/portée/révision et limites visibles ; EXTRACTED/INFERRED/AMBIGUOUS distincts et relation orientée lisible ; manques de ligne restent inconnus | Score0.85 du témoin n'est pas85% de certitude ni validation ; mutation jamais actuelle |
| U4 recherche/exploration | Recherche vide/aucun résultat/noms longs et nombreux éléments, sélection nœud, zoom/pan | Recherche/liste de relations utilisables au clavier, même information que représentation ; états et contexte sélectionnés conservés ; zoom local distinct du zoom application | Pas de nombre maximal arbitraire ou bibliothèque décidée ; toute projection/masquage indiqué, pas de faux inventaire complet |
| U5 fichier | Sélection associée à un fichier, révision changée/inconnu/référence refusée, changement de projet pendant ouverture | Intention nœud→panneau fichiers2.8 avec revalidation même projet/révision et retour focus/position ; éditeur externe n'annonce que son reçu | Le panneau n'est pas encore livré ; aucune ouverture réelle ni commande/IPC inventée en4.2, pas de référence absolue/traversante ouvrable |
| U6 variantes | FR/EN, clair/sombre, clavier seul, zoom200%, mouvement réduit | Libellés et états appariés, focus/ordre/retour/contrôles et repli de disposition spécifiés sans dépendre du survol ; motion fonctionnelle | Relecture contractuelle seulement, ni test physique/UI rendu/WCAG global ou accord humain déduit |

</frozen-after-approval>

## Code Map

- Nouveaux `ux-graphe/{DESIGN.md,EXPERIENCE.md,handoff.md}` sous cet epic : seuls livrables UX, supplément à intégrer en4.4, pas remplacement de spines. DESIGN porte composition dans le slot projet et règles visuelles héritées ; EXPERIENCE les états/transitions, actions, focus et FR/EN ; handoff relie exigences/règles aux consommateurs4.3/4.4/4.8 et aux dépendances non livrées. Nouveaux `ux-graphe/qualification/` : reçus activation/outillage, walkthrough contractuel U1–U6 avec clauses exactes, liens/empreintes et conclusions sans succès produit.
- `src/renderer/src/App.tsx` : ConversationMessages46, page/conversationSelections/tab100, thème115, navigateOverview382, chooseTab405, tablist clavier466, ProjectResume476. Lecture seule ; aucun panneau fichier/éditeur livré. `ProjectResume.tsx`24/29/39 : positions/détails bornés à capture, invalidation, repli focus ; `AgentInfoPanel.tsx`24 : exemple docké/modal. Ne pas réattribuer les échanges ou brouillons.
- `DESIGN.md` racine249 fait autorité visuelle, `.impeccable/surfaces/src-renderer-src-app-tsx.md`12 et `.impeccable/design.json` restent inchangés. Oxanium/Barlow/casting approuvés, pétrole/terracotta/ivoire, utilitaires40px et commandes44px : hériter, aucun tournoi d'identité ou nouvel asset. Ajout local au workspace existant ; pas remplacement du monde visuel.
- Spines `ux-madness/DESIGN.md`234 et `EXPERIENCE.md`241/255/276/346/378 : panneau fichiers318px/seuil1080px et aperçu/éditeur sont intentions futures2.8, clavier/zoom contractuels. Seule reprise dispose de labels FR/EN dans `src/renderer/src/strings.ts`5, reste application française fixe et pas de gestionnaire produit de zoom repéré. Écart préexistant : flèches activent les onglets immédiatement App466 contre contrat focus/activation ; ne pas le réparer ici, signaler au handoff2.14/4.4.
- Références visuelles committées2.4 : `../epic-projets-bmad/qualification-reprise-projet/visual-finish-001/resume-large-dark-native.png` et `resume-compact-light-native.png` (résoudre depuis epic-graphe-projet, non depuis le plan). Explorer les a ouvertes ; le worker les inspecte avant de fixer composition. Charte actuelle, projections Main004 historiques avant patches Quick, pas captures finales du paquet. Leur provenance est `qualification-reprise-projet/impeccable-documentation.md`23.
- Profil4.1 consommé : schema1 clusterisé0.9.101, raw non estampillé non admis ; sens _src/_tgt puis source→target, confiance textuelle distincte du score et code-only peut inférer ; lignes absentes/inconnues conservées. Témoin73nœuds/57relations, worker25.734s/77.8Mo ; aucune extrapolation ou seuil rendu pour grand dépôt. `profil-g5.md`, `schema-profile.json`, `parent-verification.md` et `final-verification.json` font autorité étroite, pas G5 intégré.
- Activation Sally : lire `.agents/skills/bmad-agent-ux-designer/SKILL.md`, exécuter son resolver, étapes/persona/faits/config puis entrée directe correspondant au présent intent (menu inutile). Conserver les preuves ; ne pas invoquer aveuglément un workflow qui écrirait les spines globaux. Ce supplément reste possédé par Build4.2.
- Impeccable4.3.1 : `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/SKILL.md`. Worker session neuve : contexte officiel une seule fois, cible App.tsx, puis branche extension existante/new-work et Operate (Shape discovery déjà réglée par exigences/mandat). Pas de craft-floor, détecteur, captures ou finition UI sur ce travail purement documentaire ; aucun ship visuel à annoncer. Si launcher refuse, message de repli prescrit avant prochain outil, puis contexte existant directement. Aucune réparation de drift sans demande.

## Tasks & Acceptance

**Execution:**
- [x] `ux-graphe/qualification/activation-*.{json,md,txt}` — activer réellement Sally et appliquer Impeccable en mode Operate/extension, inspecter les deux références et enregistrer décisions, provenance et limites ; aucune simulation de rôle ni accord humain inventé.
- [x] `ux-graphe/DESIGN.md`, `EXPERIENCE.md` — fixer le parcours complet et les six familles U1–U6, composition locale, états/transitions et libellés FR/EN, recherche/liste/zoom et nœud→fichier/retour. Rendre expérience et hiérarchie exploitables sans nouveau système ou contrat cœur.
- [x] `ux-graphe/handoff.md` — fournir traçabilité R1–R3/états/règles aux contrats4.3 puis intégration4.4/exploration4.8 ; distinguer capacités actuelles, dépendances2.8/2.14/3.9 et validations futures, limites4.1 et divergence onglets préexistante. Ne pas prétendre ces fournisseurs livrés.
- [x] `ux-graphe/qualification/verification.md` et `verification.json` — exécuter des walkthroughs documentaires U1–U6 avec clauses et résultat observé, vérifier liens/références/FR-EN/cohérence et empreintes des fichiers interdits avant/après. Demander une relecture UX indépendante du supplément, puis Quick parent ; corriger/recontrôler les vrais constats. Ne pas écrire des tests unitaires reflétant la prose ni exécuter le produit pour un document.

**Acceptance Criteria:**
- Given le profil qualifié4.1 et la charte actuelle, when le supplément est remis à4.3, then chaque état/transformation/confiance a une règle sourcée et une copie FR/EN exploitable, sans nouveau contrat public ou certitude inventée.
- Given un développeur suit les walkthroughs du contrat, when il cherche une relation puis son fichier et revient à BMad, then le texte fournit ordre/actions/focus/identité et retours/refus pour toutes les variantes U1–U6, avec limites de preuve explicites.
- Given les artefacts et références finales, when un lecteur compare au dépôt courant, then il distingue le supplément des spines, les capacités futures des capacités livrées et toute validation humaine/produit restante ; les empreintes hors périmètre restent identiques.

## Implementation Notes

Worker4.2 : supplément documentaire local livré dans ux-graphe/DESIGN.md, EXPERIENCE.md et handoff.md, sous autorité du plan uniquement. Sally réellement activée par resolver/config code0 (persona, prepend/append/faits vides vérifiés), puis Impeccable4.3.1 context code0 une seule fois sur App.tsx ; extension du monde existant et Operate appliqués. Deux références PNG historiques Main004 réellement ouvertes, sans nouveau rendu, produit, modèle, réseau/CUA ou graphe lancé. Reçus activation-* sous ux-graphe/qualification/.

Parcours U1–U6 : troisième onglet du même projet, retour exact, identités et dernier complet distincts, sept états/fraîcheur, sens et confiance/score/lignes inconnues, recherche/liste/zoom/pan, intention fichier2.8 et revalidation/retour, copie FR/EN et variantes contractuelles. Handoff aux consommateurs4.3/4.4/4.8, dépendances2.8/2.14/3.9 et divergence onglets App466 explicites ; aucune capacité future annoncée livrée.

Relecture UX indépendante /root/graph42_implementation/graph42_ux_review : deux P2 (focus lors disparition sélection ; navigation origine d’une entrante) corrigés en E1/E4 puis même relecteur résolu. Copie courante clarifiée : Tous les éléments du graphe, Repérée dans le code/Déduite/Ambiguë ; codes conservés en provenance et règle de non-validation documentaire sans avertissement répété. Aucun verdict visuel/WCAG/G5 ou accord humain. Reçu ux-review.md et SHA EXPERIENCE final identique au relu.

Qualification finale : six familles/30variantes documentaires,26liens locaux/ancres et42paires FR/EN avec paramètres vérifiés ;0défaut final. Trois premiers échecs de repérage/citations et ordre de génération conservés dans verification-initial-failure.json, sans changement produit pour les effacer. Comparaison SHA-256 : 1668/1668fichiers protégés identiques,0changement ; inventaires before/after et sources finales dans qualification/. Aucun test unitaire miroir, build/NSIS/installation/profil personnel exécuté. Source/scripts/tests/ressources/contrats/spines/racines/sidecar/architecture/qualification4.1 préservés ; anciens untracked/caches et fichier étranger non nettoyés, aucun staging/commit. Frontmatter, gel, statuts, tâches du plan et Quick restent possédés par le parent.

Clôture parent : audit de citations/liens/paires/empreintes réexécuté code0 sur les mêmes sources ; lecture propre des trois suppléments et du diff, U1–U6 couverts. Revue Quick fraîche [] ; aucun correctif différé. Voir [vérification parent](../ux-graphe/qualification/parent-verification.md). La mémoire AGENTS enrichie ensuite est un delta documentaire parent explicite, distinct des1668empreintes vérifiées avant clôture.

## Plan Change Log

## Review Triage Log

- Quick — aucun constat : [] par /root/graph42_quick, inspection seule. Les deux constats UX ci-dessous étaient déjà corrigés/recontrôlés sur les octets finaux.

- UX1 — medium / correction avant Quick. EXPERIENCE E1/E4 déplaçait le focus après disparition de sélection malgré une saisie valide ; le contrat final conserve ce focus et replie seulement contrôle disparu/retour explicite. Même relecteur UX résolu, SHA a2363df0… vérifié ; aucun code UI exécuté.
- UX2 — medium / correction avant Quick. EXPERIENCE E4 ne proposait que destination, ramenant B vers lui-même pour entrante A→B ; les deux extrémités sont maintenant nommées/visitables avec sens conservé. Même relecteur résolu sur les mêmes octets finaux.

## Design Notes

Route full : documents/états/FR-EN/handoff plus reçus dépassent100lignes, une seule expérience cohérente. Risque high conservé du ticket : mauvaise fraîcheur ou provenance tromperait le porteur sur le fichier/la certitude. Aucun seuil de tokens ni découpage artificiel. Les checkpoints plan/fin et choix techniques sont délégués sous mandat humain d'autonomie complète ; ne pas répéter l'entretien de vision, les préférences connues ou les questions Zscaler. Aucune nouvelle acceptation humaine obtenue par cette délégation.

Racine réelle unique C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness ; workdir absolu et require_escalated nécessaires dans exec, cwd hôte atelier-ui obsolète. Branche codex/bmad-initiatives-2-3 cohérente avec les commits2.4/adoption3-4/4.1. Le fichier tracked tests/bmad-help-boundaries.test.mjs préexistant sans diff de contenu, les managed caches et anciens untracked restent hors lot. Tu n'es pas seul : préserver les changements d'autrui, aucun reset/revert/staging/commit. Worker possède uniquement ux-graphe et Implementation Notes du plan ; parent possède frontmatter/gel/statuts/revues/commit. Pas de travail parallèle sur le produit.

Évidence de cartographie : explorer graph42_ui_map, lecture seule, commit5fc6b72 ; deux PNG réellement ouverts par lui. Les décisions purement techniques de disposition sont déléguées, la charte reste imposée. Bibliothèque/projection/limites sur grand dépôt sont des choix de réalisation et mesures des prochains consommateurs, pas des trous d'intention à résoudre par l'utilisateur ici. Aucun graphe à produire ni nouveau modèle/réseau ne sert à vérifier ces contrats.

## Verification

**Manual checks (contrats uniquement):**
- Walkthrough U1–U6 : nommer chaque entrée/action/sortie, retrouver les clauses exactes dans le supplément et consigner satisfait/constat dans verification.md/json ; zéro cas silencieusement omis. Aucun parcours UI réel ou utilisateur supposé exécuté.
- Relecture croisée DESIGN/EXPERIENCE/handoff : noms d'états, sens/confiance, identités, dernier complet, refus de fichier, FR/EN et focus cohérents ; liens locaux existants, dépendances futures explicitement nommées.
- Comparaison d'empreintes avant/après : produit, spines partagés, racine PRODUCT/DESIGN/sidecar/architecture et qualification4.1 intacts. Aucun build/NSIS/modèle/profil personnel nécessaire.
