---
id: 13
type: bug
title: "Vérifier la recherche de sessions à l’activation Forge"
parent: epic-boucle-codex
covers: [R1, R8]
after: [10]
refined: true
hitl: false
risk: high
severity: P2
---

# Vérifier la recherche de sessions à l’activation Forge

## Description

Corrige le contrôle de recherche de sessions exigé par le skill Forge installé : la qualification hôte le vérifie déjà, mais la conversation native ne peut ni le demander ni observer son résultat. Le contrôle doit être factuel, corrélé et conservé avant de commencer une nouvelle idée. Une session inachevée reste refusée ; aucune reprise, lecture libre ni capacité générale de fichiers n’est ajoutée. Livre un paquet personnel qualifié et ses empreintes fraîches à 11 ; ses preuves antérieures restent historiques.

## Reproduction

1. Utiliser le paquet installé0.1.1, profil Forge épinglé et témoin neuf, sans session à reprendre ; qualifier puis lancer Forge explicitement.
2. Constater que le skill installé exige la recherche des journaux existants dans ses deux emplacements avant de commencer une nouvelle idée.
3. Dans `qualification-e2e/personal-forge-diagnostic-001/report.json`, le premier terminal natif est réussi mais les seules opérations Forge observées sont workflow et config ; aucun contrôle de sessions n’est observable. Le premier run001 a au contraire échoué avec UNSUPPORTED_INTERACTION au même stade général : sa cause exacte n’est pas connue.
4. Le protocole actuel admet ce premier terminal après les seules résolutions. Une qualification hôte préalable ne constitue pas une recherche native effectuée à la demande de la conversation. Attendu : résultat factuel et corrélé de cette recherche, ou refus explicite, avant nouveau travail.

## Cause Hypothesis

Le profil qualifié vérifie déjà les sessions inachevées, mais le connecteur ne présente pas cette lecture au workflow et n’en exige pas le résultat pour son activation. Ce décalage explique le contrôle manquant ; il n’est pas présenté comme la cause prouvée du refus001. L’implémenteur doit vérifier cette hypothèse avant correction.

## Acceptance Criteria

1. **Activation observable** — **Given** un profil de référence et des sorties absentes, vides ou ne contenant que des sessions complètes, **When** Forge résout son workflow/configuration puis recherche les sessions selon le skill, **Then** le résultat de cette lecture native est factuel, corrélé au même appel/tour/contexte et durable ; la première fin de tour et le démarrage d’une idée ne peuvent omettre cette condition.
2. **Précondition fraîche** — **Given** une session inachevée apparue après qualification dans l’un des emplacements prescrits, **When** l’activation contrôle les sessions, **Then** elle refuse la reprise et ne crée ni ne modifie de journal/livrable. Un résultat absent, illisible ou incertain n’est pas annoncé vide.
3. **Frontières et conservation** — **Given** des chemins ou arguments étrangers, liens/jonctions, fichiers non conformes ou conflits, **When** le contrôle est sollicité, **Then** la portée qualifiée et les refus restent appliqués ; aucun accès libre ni reprise n’est ajouté, et les fichiers/références existants restent intacts. Les anciennes annexes se relisent sans migration ni relance.
4. **Tests et livraison** — **Given** la reproduction et ses cas voisins, **When** les tests et le banc paquet s’exécutent, **Then** une régression échoue sur le défaut puis passe après correction, les scénarios voisins passent, et le paquet Windows identifié par ses empreintes est reconstruit puis remplacé sans perte des données locales. La1.11 consomme cette livraison pour sa preuve complète personnelle.
5. **Ou : absence de correction démontrée** — **Given** la reproduction, **When** une preuve fraîche montre que le comportement attendu existe déjà ou que le signalement est erroné, **Then** la preuve et ses limites sont consignées et remplacent les critères1–4 ; aucun correctif artificiel n’est requis.

## Boundaries

Mary, connexion SIWC, forfait, contrôles d’approbation, lecture seule, identités/corrélation, arrêt, persistance et chemins capturés restent conservés. Aucun shell, glob général, lecture arbitraire, reprise, nouveau schéma Snapshot/IPC, catalogue, refonte UX ou envoi implicite. La recherche ne valide pas une idée ni ne clôture G1. Les preuves0.1.1 restent historiques.

## References

- parent — _bmad-output/initiative-madness/tickets/epic-boucle-codex/epic-boucle-codex.md
- _bmad-output/initiative-madness/tickets/epic-boucle-codex/epic-boucle-codex.md
- _bmad-output/initiative-madness/architecture-madness/architecture-madness.md
- skill installé — .agents/skills/bmad-forge-idea/SKILL.md, activation5
- diagnostic — _bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-e2e/personal-forge-diagnostic-001/report.json
- réalisation antérieure — _bmad-output/initiative-madness/tickets/epic-boucle-codex/tickets/story-executer-et-retrouver-la-premiere-boucle-bmad-reelle-plan.md

## Notes

- Decision: 2026-10-28 — Critères validés sous le mandat autonome de finir l’epic1. Risque high : un faux contrôle vide pourrait laisser commencer un workflow hors de son profil. Contrôle supplémentaire : relecture indépendante des frontières de fichiers et de la fraîcheur avant invocation.
- Decision: 2026-10-28 — Le correctif prépare la livraison consommée par11 ; il ne rejoue pas le témoin échoué et ne réécrit pas les anciens plans built. Le sweep10 reste historique, nettoyage du correctif inclus ici. Réseau/compte personnel restent inchangés ; aucun nouveau consentement n’est requis par ce ticket.
