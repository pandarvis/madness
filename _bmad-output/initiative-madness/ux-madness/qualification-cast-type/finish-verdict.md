## verdict

- **F1 — resolved.** Reopened `f1-recheck/conversation-dark-1440.png`, `conversation-dark-rail.png` and `context-dark-desktop.png`: the recovery disclosure is now a clean, separate line beneath the preparation action; the preference status no longer paints over it. The accompanying `profile.json` records full-height disclosure rows ending before the footer, with `overlap: false`; the footer follows below the first viewport rather than occupying the disclosure's text line.
- **Introduced regressions — none observed** in the affected views and targeted checks of `conversation-dark-720.png`, `conversation-zoom-200.png` and `atelier-panel-dark-1323.png`. The composer remains present in the ordinary desktop/compact views; zoom reflow and the docked character panel remain coherent. No new hunt, browser execution or detector pass performed.

## remaining

Clear for F1. Ship covers the scored fix, not the whole surface. The initial review's unavailable QUALITY BAR card and limits remain recorded in `review-initial.md`; no installation, human visual approval or full accessibility approval is inferred.

disposition: ship
