---
title: 'Vérifier les parcours intégrés et les preuves G2 et éditeur'
type: 'chore'
ticket: 16
created: '2026-11-06'
status: 'in-progress'
baseline_revision: '760550443c0942b7c41b9cc96db41c75b147b814'
route: 'full'
route_source: 'auto'
risk: 'high'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le paquet doit être vérifié sur les parcours réels avant d’attester G2 et le retour éditeur.

**Approach:** Vérifier les projets existants et les cas de refus dans le paquet identifié. Séparer le catalogue local, l’aide native avec un compte, l’aperçu, le retour éditeur et la restauration. Attester seulement les parcours dont la preuve est disponible.

## Boundaries & Constraints

**Always:** Utiliser un profil témoin pour les contrôles locaux. Rapprocher les preuves avec le même ASAR et le même contexte. Conserver les scénarios humains et natifs à leur statut réel.

**Never:** Demander une configuration Zscaler ou un jeton, utiliser un contrôle public isolé comme preuve de connexion personnelle, ou déduire G3, G4 et G5 de G2.

</frozen-after-approval>

## Code Map

- `scripts/qualification/bmad-catalog.mjs` et les tests de protocole vérifient le catalogue local et ses sources.
- `scripts/qualification/bmad-help-personal.mjs` porte le témoin natif avec compte, ses traces et sa restauration.
- `scripts/qualification/project-files.mjs` et les tests de protocole distinguent l’aperçu, la réception éditeur et le retour.

## Tasks & Acceptance

- [x] Contrôler la lecture du catalogue du vrai dépôt et retrouver la compétence bmad-build dans l’interface du paquet 0.2.21.
- [ ] Obtenir une réponse native bmad-help M14 sur le paquet final et vérifier la fermeture et la restauration correspondantes.
- [ ] Relier les preuves de reprise par projet, d’éditeur, de conservation et de remplacement à l’artefact final.
- [ ] Présenter les limites et faire relire la matrice R1–R15 avant clôture.

## Implementation Notes

Les 93 tests ciblés de protocole, capture catalogue et fichiers Windows passent. Le catalogue du vrai Madness affiche 27 compétences et la fiche bmad-build. La couverture déclarée est partielle et le helper est arrêté. Le profil témoin a été supprimé.

Le contrôle public effectué depuis Main du paquet 0.2.21 dans un profil isolé ne remonte aucun statut HTTP. La preuve ne permet pas d’attribuer une cause à l’échec. La validation avec un compte et les preuves d’éditeur restent ouvertes. Le témoin d’initialisation 0.2.20 vérifie 588 ajouts sur son artefact et reste une preuve distincte de 3.9.

## Plan Change Log

## Review Triage Log

## Verification

- [Catalogue local du dépôt Madness](../qualification-catalogue/witness-madness-0.2.21.json)
- [Contrôle réseau public isolé](../qualification-aide-native/witness-public-0.2.21.json)
