# Autocontrôle SPEC — Madness

23 octobre 2026. Proposition de Sofia : 24 exigences, 6 contraintes, 2 hypothèses et 6 questions ouvertes. Le ticket reste proposé à validation ; aucun découpage ou développement n'est lancé et aucun commit de ces exigences n'est effectué.

## Passe 1 — cohérence

Les 24 lignes décrivent des résultats observables au niveau initiative et citent leurs sources. Les contraintes isolent les arbitrages de conception ; les choix de stack et d'intégration restent ouverts. Les six contrôles de fin prouvent les trois parcours sur une application connectée. Les exclusions sont explicites. Aucun identifiant antérieur n'existait : R1 à R24 sont attribués une seule fois et conservés par le journal.

Les règles détaillées des composants, valeurs visuelles et interactions restent dans les deux contrats UX adoptés ; elles ne sont pas recopiées dans le ticket. A1/A2 restent des hypothèses et Q1–Q6 des questions, sans décision technique inventée.

Vérifications mécaniques réussies : lignes identiques à celles du journal, identifiants consécutifs et uniques, citations présentes, huit sections du ticket et six contrôles de fin, existence des cinq sources et deux companions, liens relatifs valides. Le ticket ne porte pas un faux statut d'implémentation. Les contrats UX restent finalisés et le brief reste en brouillon.

Le diagnostic `tickets.py status initiative-madness` réussit : stockage repo, zéro ticket enfant, aucun problème d'ordre ou de dépendance. Cela confirme la reconnaissance du conteneur et l'absence de découpage ; ce n'est pas une validation du produit.

## Passe 2 — préservation

| Engagement des sources | Transmission |
|---|---|
| Développeurs qui découvrent BMad, distribution et UX prioritaire | Outcome ; R23–R24 ; C1–C2 |
| Windows, Codex, v7 ; plusieurs projets ; reprise des artefacts | R1–R6 ; C2–C3 |
| Initialisation, prérequis, compatibilité effective, annulation | R3–R4 ; Q3–Q4 |
| Initiatives, preuves, fichiers transversaux, contexte au lancement | R5–R8, R12, R19 ; companion EXPERIENCE |
| Aide BMad distincte d'une recommandation d'agent, alternatives sans ordre imposé | R9, R11 ; R22 ; companion EXPERIENCE |
| Catalogue réel complet, modules et outils transversaux, absences expliquées ; aucun focus party-mode | R10–R12 ; Boundaries ; companion EXPERIENCE |
| Conditions propres aux workflows, dont usages autonomes prévus, sans faux dialogue générique | R12–R14 ; companion EXPERIENCE |
| Activité, attentes, réponses, approbations, récapitulatif et reprise compréhensibles | R13–R18, R22 ; companion EXPERIENCE |
| Modifications externes dès V1, sans inventer la conversation | R7–R8 ; Boundaries |
| Aperçu intégré, chemin et provenance, ouverture éditeur avec retour réel | R19 ; Q4 |
| Rail rétractable, préférence, saisie et contexte préservés, fenêtre étroite | R20 ; companions DESIGN et EXPERIENCE |
| Clavier, focus, contraste, zoom et réduction de mouvement ; conformité non auditée | R21 ; A1 ; companions UX |
| Continuité après redémarrage non résolue | A2 ; Q5 |
| Cibles suivantes Copilot, Claude/Bedrock/abonnement, autres OS et sessions externes | Boundaries ; références brief/addendum/contexte ; aucune disponibilité promise |
| Hébergement web/Electron/Tauri, connecteur, authentification et formats v7 non choisis | C4, C6 ; Q1–Q4 ; références de recherche |
| Références en français et thème clair sans engagement sur les langues/thèmes distribués | Q6 ; companions UX |
| Base UX acceptée en simulation ; absence de connecteur réel ou d'étude utilisateur | C5 ; R23–R24 ; références UX et contexte |

Le sous-agent de préservation a lu intégralement brief, addendum et PRODUCT en lecture seule. Sofia a lu intégralement l'initiative, les deux contrats UX, le modèle de ticket et les règles de stockage, puis rapproché leurs engagements de cette table. Aucun constat d'oubli d'engagement identifié au terme des deux passes.

Éléments d'enveloppe non recopiés comme exigences : chronologie de conversation, incidents de serveur de choix, nombres d'agents, inventaire de l'installation et exemples de commandes. Le catalogue réel reste variable. Les prescriptions techniques de recherche ne deviennent pas des décisions ; leurs sections sont référencées et leurs choix restent ouverts. L'ancien statut UX dans les textes du 22 octobre est conservé comme historique, sans reprendre son affirmation périmée d'absence de maquette.

## Suivi après présentation

Le 23 octobre 2026, le porteur demande explicitement le commit local de la proposition présentée. Les 24 exigences et 6 contraintes sont acceptées avec A1/A2 et Q1–Q6 ouverts ; cet accord ne choisit pas une architecture ni ne valide rétroactivement le brief en brouillon. Les questions techniques seront préparées avec Winston ; les arbitrages de persistance et de langues/thèmes seront accompagnés par Sofia et Sally.

## Réparation de l'activation

L'échec initial survient avant le workflow, lors du téléchargement de Jinja2 par uv : `invalid peer certificate: UnknownIssuer`. Un essai isolé avec les certificats système télécharge Jinja2 3.1.6 et termine avec le code 0. Après ajout de `system-certs = true` dans `uv.toml`, la commande prescrite de `render_skill.py` réussit sans ajout de drapeau de certificats, imprime le workflow Sofia et termine avec le code 0. Aucun fichier installé de compétence ni script géré BMad n'a été modifié pour cette réparation.
