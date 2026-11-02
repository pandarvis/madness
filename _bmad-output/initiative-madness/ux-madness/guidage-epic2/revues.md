# Revues de la story 2.17

2 novembre 2026. Sources : les deux spines et l’index de couverture, depuis
la baseline `bf3e8a78282e44ba41d0cfee69e11715be424a30`. Les relecteurs sont
des agents techniques frais, pas de nouveaux personnages BMad activés.
Sally a été activée par le parent pour l’Update ; Impeccable context/Operate
et `bmad-ux` Update headless gouvernent cette contribution documentaire.

## Quick et cohérence UX

Relecteur `/root/ux217_quick`, inspection du diff complet et des contextes du
plan ; aucun test, build, changement de fichier ou appel de modèle produit.

- Q1 — DESIGN Components/Fiche compétence place « Lancer » et le lancement
  dans le pied de fiche. EXPERIENCE Component Patterns/Fiche compétence et
  parcours3étape4 imposent Préparer le lancement, fermeture de la fiche et
  envoi uniquement depuis Conversation. Les prescriptions doivent être alignées
  pour préserver la présentation du contexte capturé avant lancement.

## Standards documentaires BMad

`bmad-review lenses=structure,prose`, personnalisation résolue ; aucun hook,
fait persistant ou consigne supplémentaire. Guide rédactionnel Microsoft.
Structure et Quick lancés indépendamment ; prose après structure, avec ses
conclusions, sur le même contenu documentaire. Inspection seulement.

### Structure

Relecteur `/root/ux217_structure` :

- S1 — MOVE les deux paragraphes « Connexion personnelle » et « L’aide réseau »
  depuis State Patterns/Conservation et sorties communes vers une sous-section
  Connexion personnelle et aide réseau de Component Patterns, après sa table.
  Leurs145mots et protections restent inchangés ; titres canoniques préservés.
- PRESERVE les reprises ciblées des distinctions livré/contractuel,
  fait/acceptation, chargé/transmis et sélectionné/capturé. Elles servent la
  consultation par référence et ne constituent pas des doublons à supprimer.

Métrique de la revue sur son contenu original :13186mots, réduction proposée
0mot/0%, sans cible de longueur. Ce compte ne mesure ni temps ni coût produit.

### Prose

Relecteur `/root/ux217_prose` :

| Constat | Texte original | Correction proposée |
|---|---|---|
| P1 | Aucune attente ne signifie pas tous les livrables validés. | L’absence d’attente ne signifie pas que tous les livrables sont validés. |
| P2 | Diagnostic stale — read again | Diagnostic out of date — refresh required |
| P3 | Requesting editor… | Requesting that the editor open the file… |
| P4 | reçu reçu distingué de conservation locale non confirmée | reçu natif distingué de la conservation locale non confirmée |

## Triage parent

Q1 est confirmé : contradiction réelle entre les deux contrats, medium/patch.
La correction est limitée au libellé et à l’action de pied de la fiche,
conformes au parcours déjà défini ; aucune nouvelle surface ou décision.
S1 est retenu comme déplacement éditorial direct, sans réécriture.
P1–P4 sont retenus comme corrections rédactionnelles directes ; leur sens,
invocations et protections restent inchangés. PRESERVE est conservé comme
instruction positive, sans défaut associé. Le même worker reçoit ces six
corrections en un lot ; vérification et verdict final suivent son retour.

## Clôture des constats

Les six corrections sont appliquées. Le parent a relu les formulations finales,
comparé les deux paragraphes déplacés à la baseline (octets normalisés LF
identiques) et contrôlé les quatre corrections exactes. Le relecteur Quick
original a réexaminé Q1 sur les deux spines et le parcours3 : **« Q1 résolu. »**
Les tokens restent identiques,26composants sont appariés,71références de tokens
distinctes/94occurrences et60liens locaux sont vérifiés. Structure canonique et
bloc figé du plan conservés. Aucun constat restant ni correctif différé.
