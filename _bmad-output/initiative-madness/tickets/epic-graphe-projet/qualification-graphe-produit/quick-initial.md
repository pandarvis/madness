# Revue Quick initiale — cinq constats

- Q1 graph-coordinator.ts:23 — complete puis failed laisse result.snapshot=null/lastComplete présent ; revalidateFiles affecte observed, refusé par validateGraphState ligne261 ; Main INVALID_GRAPH_STATE et générations bloquées.
- Q2 files.py:6 — six extensions admises par graph_capture (.php/.swift/.kt/.scala/.vue/.svelte) absentes TEXT_TYPES ; boutons fichiers refusés PREVIEW_TYPE.
- Q3 graphify.ts:76 — GRAPH_CHILD_timeout du launcher devient ANALYSIS_FAILED/stopped failed ; timeout UI inaccessible depuis cette chaîne réelle.
- Q4 GraphPanel.tsx:15 — un partiel masque lastComplete exploratoire ; E2 demande Consulter le dernier complet, seul son identifiant/date/révision est affiché.
- Q5 graph_capture.py:6 — packages/resources exclus récursivement ; code monorepo et mutations ignorés alors que portée visible ne déclare pas ces exclusions.

Source : même appel graph44_quick sur diff003 SHA37cd8093…, inspection seule, sans test ni modification. Texte condensé sans modification des cinq mauvais résultats rapportés ; triage dans le plan.
