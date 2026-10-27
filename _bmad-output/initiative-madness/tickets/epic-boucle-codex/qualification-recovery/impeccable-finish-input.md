# Brief de finition ciblée 1.7

Lire les trois captures avant ce texte : elles sont la vérité visuelle primaire. Sources synthétiques du banc Windows, aucune donnée personnelle.

## Demande et réponses confirmées

Madness est une application Electron Windows pour piloter BMad. Le porteur demande une récupération guidée et le lien à ouvrir en cas de blocage réseau. Il confirme l’usage du navigateur Windows et veut Ouvrir, Copier puis vérifier l’accès, sans répétition de la question JSON ni transmission de jeton. Sa priorité est l’UX ; il préfère des icônes compactes et la couleur existante.

Composition Parcours guidé et navigation repliable acceptées. Sombre terracotta/bleu par défaut, clair alternatif. La refonte globale avec Sally et plusieurs experts est explicitement prévue après l’implémentation de l’epic 1 : cette passe conserve le système existant et juge uniquement l’extension de récupération.

## Direction existante

- THESIS : rendre le blocage compréhensible et donner la prochaine action réelle, sans faux rétablissement.
- OWN-WORLD : système Madness existant, Operate, Electron Windows, Segoe UI, anthracite/terracotta/bleu, clair alternatif ; composants et palette conservés.
- STORY : arrêt demandé/observé, relecture locale des fichiers incertains, nouvel échange explicite ; URL publique et vérification réseau séparées d’un témoin Codex facturable.
- FIRST VIEWPORT : contexte conservé, état et action utiles près du problème ; détails techniques secondaires.
- FORM : extension ordinaire du système accepté, sans nouveau concept, seed, monde ni comp. Les règles d’un nouveau tirage/comp ne s’appliquent pas à cette extension ; aucune nouvelle QualityBar formelle n’est inventée.

## Preuves et périmètre

Captures requises et autoritaires, classes Windows livrées :

- `C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-recovery/compiled-desktop-dark.png`
- `C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-recovery/compiled-compact-dark.png`
- `C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-recovery/compiled-compact-light-network.png`

La classe compacte est une fenêtre Windows, pas une promesse de plateforme mobile. Le banc fournit des fixtures étiquetées comme telles. Le premier tour visuel est inspecté par l’implémenteur ; aucun changement de layout après celui-ci. Le détecteur mécanique a été exécuté une fois, résultat `[]` rapporté par l’implémenteur. Ne pas le relancer ni créer de nouvelles captures.

Références :

- Produit : `C:/Sources/madness/PRODUCT.md`.
- Système existant : `C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md` et `EXPERIENCE.md`.
- Artefact : `C:/Sources/madness/src/renderer/src/App.tsx`, `RecoveryPanel.tsx`, `NetworkHelp.tsx`, `ApprovalPanel.tsx`, `styles.css`, `strings.ts`. Ne lire que les fichiers présents et nécessaires ; aucune exploration du dépôt.
- Craft floor : `C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/reference/craft-floor.md`.

Pas de comp ni nouvelle QualityBar : source et composition existantes font référence. Aucun test/build ou navigateur pour cette relecture. Aucune modification. Retour selon le contrat officiel de finition, limité aux défauts matériels de cette extension ; ne pas canoniser les écarts globaux déjà réservés à la refonte. Ce relecteur est technique, pas Sally.
