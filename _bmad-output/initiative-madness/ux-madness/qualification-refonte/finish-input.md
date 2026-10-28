# Entrée de la revue de finition

## Demande et faits confirmés

Madness est une application Electron Windows pour travailler sur des projets locaux avec BMad. Le porteur demande une refonte de l’application réelle avec Sally, plusieurs experts UI/UX et Impeccable : commandes moins grossières, préférence pour les icônes, inspiration ChatGPT Desktop, ouverture de projet unique, bascule de navigation dans la barre de titre et alignée avec le rail. La palette sombre terracotta/bleu et le thème clair alternatif sont conservés. La composition Parcours guidé est déjà choisie ; le mandat autonome couvre les décisions et corrections nécessaires, pas une acceptation visuelle humaine inventée.

L’usage courant est personnel, local, code privé, connexion SIWC propre à Madness et abonnement ChatGPT. Cette refonte ne change ni fournisseur, authentification, contrats IPC, stockage, version ni dépendances. Le catalogue BMad complet, les fichiers éditables, l’anglais, Graphify, Loop et les mesures temps/coût ne sont pas ajoutés ici. Les attentes et approbations montrées dans les captures sont synthétiques, sans compte ni modèle. La qualification native 1.11 demeure distincte.

## Autorités à lire

- `C:/Sources/madness/AGENTS.md`
- `C:/Sources/madness/PRODUCT.md`
- `C:/Sources/madness/_bmad-output/initiative-madness/plan-refonte-espace-de-travail.md`
- `C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md`
- `C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md`
- `C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/qualification-refonte/direction.md`
- `C:/Sources/madness/.impeccable/surfaces/src-renderer-src-app-tsx.md`
- `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/reference/craft-floor.md`

Chemins relatifs ci-dessous depuis `C:/Sources/madness`. Mode Operate, code-led ; identité et composition héritées, seed historique d955fcd3. Aucun comp approuvé ou raster de produit généré. Référence humaine : `ux-madness/feedback/2026-10-26-barre-actions.png` et `ux-madness/.working/reference-chatgpt-desktop-autonomie.png` sous l’initiative. Ces références expriment les commandes compactes et la hiérarchie, sans imposer de reprendre la marque d’un autre produit.

## Surfaces et source

Renderer `src/renderer/src/App.tsx`, `WorkOverview.tsx`, `QuestionPanel.tsx`, `ApprovalPanel.tsx`, `styles.css`. Le banc `scripts/qualification/workspace-design.mjs` décrit les états injectés, les géométries et les limites de mesure. Le contexte est consultable à la demande, les informations de décision restent visibles, et les choix d’approbation restent textuels après le patch complet. Navigation, sauvegarde, lancement, réponse native et accord sont des actions distinctes.

## Preuves requises

Les douze captures du second tour groupé sont requises ensemble. Leur répertoire exact, le manifeste du candidat et le résultat du détecteur sont transmis dans le message de lancement de la revue, après production et inspection des fichiers. `profile.json` accompagne les images : thème, dimensions CSS, zoom, navigation, état sélectionné et empreintes. Le raster Windows peut être à 125 % des dimensions CSS ; le zoom Electron à 200 % est un autre facteur, nommé séparément.

1. `home-dark-expanded.png`
2. `project-dark-expanded.png`
3. `conversation-dark-1440.png`
4. `conversation-dark-rail.png`
5. `context-dark-desktop.png`
6. `conversation-dark-720.png`
7. `conversation-light-720.png`
8. `connection-light-compact.png`
9. `conversation-zoom-200.png`
10. `active-question-light.png`
11. `active-approval-light.png`
12. `global-recovery-light.png`

Le premier tour et les trois expertises indépendantes sont conservés séparément. Leurs retours constituent un historique de travail, pas un verdict de finition. Deux tours visuels groupés au maximum dans le fil de construction ; un seul détecteur. La revue de finition est fraîche et sans historique de conversation. Les contrôles ne qualifient ni lecteur d’écran, ni mise à l’échelle Windows, ni conformité WCAG, ni réception d’un modèle, ni G1, ni approbation humaine de l’apparence.
