# Window Chrome Atelier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Habiller les commandes de fenêtre et inputs restants, conserver les interactions Windows et la fermeture possédée.

**Architecture:** Calque décoratif HTML/CSS sous les trois contrôles natifs conservés par titleBarOverlay. Overlay transparent hors high contrast, symbolColor natif inchangé ; CSS géométrique sans interception de pointeur. Pas de nouvelle API renderer d’action fenêtre.

**Tech Stack:** Electron45, React19, TypeScript7, CSS local, bancs natifs existants.

**Spec:** _bmad-output/initiative-madness/ux-madness/qualification-window-chrome/design.md

## Global Constraints

- Windows local personnel, code privé ; aucune dépendance, réseau fournisseur ou modèle.
- Lire les dimensions Window Controls Overlay ; contours1px, glyphes et clics natifs, barre56px, palettes/fontes/casting conservés.
- Le chemin app.before-quit/Application.shutdown reste inchangé ; jamais destroy ou kill.
- Exécution native en ligne sous mandat autonome et choix humain explicite ; aucune nouvelle attente de permission de plan.

## Review Focus

- Overlay absent/fixture : calque non visible, aucune plaque sur toute la fenêtre.
- Zoom200 et DPI : coordonnées natives, pas de largeur46 présumée ni interception de commandes.
- Maximise/restaure : glyphes natifs et plaques restent alignés, zones drag séparées.
- Survol et contraste forcé : glyphes natifs restent visibles ; retour au fond overlay préexistant en high contrast.
- Fermeture en session : même chemin before-quit/shutdown, aucun effet sur IPC/moteurs ou brouillons.

---

### Task1: Calque et commandes natives

**Files:** src/renderer/src/WindowCaptionPlates.tsx (new), src/renderer/src/App.tsx, src/renderer/src/atelier-controls.css, src/main/index.ts, tests/appearance.test.mjs, scripts/qualification/workspace-design.mjs.
**Interfaces:** WindowCaptionPlates() ReactNode consumes optional navigator.windowControlsOverlay visible/geometrychange; produces aria-hidden pointer-events:none decoration only. nativeCaptionColors(theme) produces nativeColors(theme) with transparent background outside nativeTheme.shouldUseHighContrastColors.

- [ ] Add failing native --caption guard: expects3 decorative plates, visible overlay, bounds starting at native rect.right and ending at viewport.right; no interactive element inside. Keep existing titlebar exclusion checks.
- [ ] Run red against0.2.4, retain failed profile and cleanup.
- [ ] Implement component with geometrychange cleanup and absent-API fallback. Import it once beside topbar. Add CSS using env titlebar metrics, no input handler.
- [ ] Add nativeCaptionColors wrapper and use on creation/theme changes; update on nativeTheme.updated. Keep backgroundColor and shutdown untouched.
- [ ] Style check/radio states with real inputs and forced-colors fallback; check keyboard and focus in existing question/approval fixture.
- [ ] Run build, targeted appearance tests and native --caption/--controls/--type in2themes. Inspect all native variants together, including zoom/docked views.

### Task2: Qualification and personal integration

**Files:** existing qualification/release helpers, DESIGN/sidecar/surface, proof directory above, AGENTS.md.
**Interfaces:** --caption extends native report without modifying account or model; release manifest binds source and ASAR.

- [ ] Add maximized/restored/minimized native observations and preserve close receipts. Validate no overlay-coordinate assumptions.
- [ ] Fresh independent Impeccable review with native-window evidence, address material findings once and recapture affected views.
- [ ] Update documents and source/asset provenance; no new raster or hues.
- [ ] Build NSIS, verify package caption and full matrix, preserve closed profile fingerprints, install same path.
- [ ] Passive personal reopen; observe actual Windows caption rendering and commands through computer-use. Preserve data and close verification window normally.
- [ ] Record exact results/limits, commit locally. A clean detector does not substitute actual native rendering.

Self-review: scope covered; no new native-command bridge, review focuses pinned to guards and native inspection. Any native-overlay incompatibility blocks this implementation strategy rather than hiding missing controls.
