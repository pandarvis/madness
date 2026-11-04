- Q1 scripts/qualification/us-metrics.mjs:41 — Entry plus duplicate leaves remains eligible: projection groups by container/id while the guard counts only entries. Parser progress.py:301 reports duplicate leaves; duplicate-entry fixture alone misses this ambiguity.
- Q2 scripts/qualification/us-metrics.mjs:38 — Type source may exist for another ticket or an undeclared document; it is not bound to the selected ticket’s declarations. Missing-source fixture alone misses a present foreign source.

Original reviewer metrics210_quick, inspection only, initial diff e2ec6f50707e0c96c5b0de50872a4b64b26d660b140e120ce7fad35662c056d3; no tests/build/edits/skills.
