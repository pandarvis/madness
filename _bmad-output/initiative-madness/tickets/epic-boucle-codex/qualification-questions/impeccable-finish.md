# Story 1.5 — finition Impeccable ciblée

Date : 27 octobre 2026. Disposition finale du relecteur de finition : **SHIP à la portée de cette extension seulement**, après résolution de F1. Ce rapport conserve la preuve et la comparaison au système existant ; il ne crée pas de nouveau contrat de design.

## Mandat et méthode

Cette passe est effectuée par un agent technique frais appliquant la définition officielle `impeccable_documenter.toml` et la référence `reference/document.md` d’Impeccable 4.3.1. Le rôle natif n’est pas exposé dans cet environnement. Aucun persona Sally n’a été activé par ce rôle technique.

La story étend le formulaire de questions dans l’application Electron Windows existante. Aucun nouveau monde visuel ni changement de système n’est autorisé. Aucune THESIS ni QUALITY BAR formelle n’est fournie pour cette extension ; aucune n’est inventée. La refonte globale demandée après l’epic 1 reste un travail distinct.

Lecture du code effectif : [styles.css](C:/Sources/madness/src/renderer/src/styles.css), [QuestionPanel.tsx](C:/Sources/madness/src/renderer/src/QuestionPanel.tsx), [App.tsx](C:/Sources/madness/src/renderer/src/App.tsx) et [strings.ts](C:/Sources/madness/src/renderer/src/strings.ts). Références conservées : [PRODUCT.md](C:/Sources/madness/PRODUCT.md), [DESIGN.md](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md) et [EXPERIENCE.md](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md). Le [plan 1.5](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/tickets/story-repondre-aux-questions-actives-et-conserver-le-brouillon-plan.md), [docs/development.md](C:/Sources/madness/docs/development.md) et [implementation-verification.md](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/implementation-verification.md) apportent le périmètre et la chronologie fonctionnelle.

Le documenteur a contrôlé ces sources et les références de l’artefact compilé ; il consigne le verdict visuel fourni par le même relecteur de finition. Il n’a exécuté aucun build, test, détecteur, nouvelle capture ou revue visuelle supplémentaire.

## Comparaison au système existant

| Point | Règle effectivement présente | Conclusion de documentation |
|---|---|---|
| Palette | Le formulaire réutilise les variables de surface, texte, contour, attente, sélection et focus. Le sombre reprend les fonds anthracite, l’accent terracotta et le bleu de focus/sélection ; le clair conserve ses valeurs historiques. | Pas de nouvelle palette ni de nouveau token global. |
| Typographie | Segoe UI reste la police du renderer, avec les replis système existants. La question emploie un titre de 18 px, des champs de 14 px et des explications de 12 px ; aucun rôle d’affichage décoratif n’est ajouté. | Valeurs locales observées, sans extension du système typographique normatif. |
| Forme | Section inline plate, filets de séparation, groupes `fieldset` sans carte ni ombre, options empilées, champ redimensionnable et bouton secondaire d’envoi explicite. | Continuité du formulaire utilitaire existant ; aucune nouvelle composition globale. |
| Adaptation et focus | Titre et pied se replient ; les champs ont une largeur flexible et le texte peut revenir à la ligne. Les radios gardent leur focus visible, les zones de texte et boutons reprennent le contour bleu/violet du thème. | Les mêmes états bureau, compact et clair bornent la preuve visuelle ; aucun audit complet d’accessibilité déduit. |
| Contexte et saisie | Projet et initiative sont visibles. La saisie est liée à la demande ; le brouillon libre reste séparé. Les choix sont contrôlés par leurs valeurs, sans choix par défaut. Une demande inactive conserve ses champs mais ne propose plus d’envoi. | Accord avec les règles existantes d’attente nommée, d’envoi explicite, de conservation et de contexte. |
| État et provenance | Le formulaire, le retour à la question et le pied de conversation dérivent du véritable état et de l’identité de la demande active. | F1 corrigé sans réattribuer la demande à partir du nom de l’invocation. |

Résumé du système contrôlé, en cinq lignes :

- Palette : sombre anthracite/terracotta/bleu par défaut ; clair historique conservé.
- Typographie : Segoe UI ; titre local 18 px, champs 14 px, explications 12 px.
- Forme : formulaire inline plat, filets, choix verticaux, envoi secondaire explicite.
- État : attente, transmission, conservation et résultat inconnu restent textuellement distincts.
- Provenance : identité attestée de la demande ou « Agent non identifié », sans déduction Mary/Forge.

Ces cinq lignes décrivent l’échantillon contrôlé. Elles ne deviennent ni de nouveaux tokens normatifs ni des règles nommées à propager à toutes les surfaces.

## F1 : correction et preuve finale

La première disposition du relecteur frais appliquant la définition officielle était `fix` pour **F1 seulement**. Les indicateurs périphériques contredisaient le formulaire : une demande `sending` restait présentée comme attendant un choix, et Mary pouvait être déduite de l’invocation malgré une identité de demande inconnue. Le premier détecteur avait retourné `[]` ; ce résultat n’annulait pas le constat de finition.

La correction round 1 est observable dans le code courant :

- `questionRecipient` et `QuestionPanel` utilisent l’identité immuable de la demande, sinon « Agent non identifié ». La provenance attestée, lorsqu’elle existe, garde sa source visible.
- `activeQuestion` distingue `waiting` et `sending`. `displayedDialogueStatus`, le bandeau de retour et le pied de conversation utilisent « Accusé natif et conservation attendus… » pendant la transmission. Le pied n’ajoute plus l’ancien accusé de tour lorsqu’une question est active.
- Les labels Mary/Forge restent associés à leur invocation et au brouillon libre hors de la demande. Ils ne servent plus à attribuer l’auteur d’une question inconnue.
- Le formulaire garde les libellés distincts « Votre choix reste à envoyer », « Réponse envoyée et enregistrée », « Demande inactive » et « Envoi non confirmé ». La conservation locale de la saisie et la confirmation de transmission ne sont pas fusionnées.

Après cette correction, les mêmes trois vues ont été recapturées : [bureau](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/compiled-desktop.png), [compact](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/compiled-compact.png) et [demande inactive en clair](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/compiled-inactive-light.png). Le parent les identifie comme les captures finales du renderer `index-Ccfod1Na.js` ; [out/renderer/index.html](C:/Sources/madness/out/renderer/index.html) référence bien cet artefact lors de la lecture documentaire.

Le même relecteur a rendu le verdict suivant, transmis au documenteur : **F1 état RÉSOLU ; F1 provenance RÉSOLU ; aucune régression visible dans les trois captures valides ; disposition SHIP à cette portée uniquement.** Aucun deuxième détecteur ni nouvelle chasse de polissage n’a été engagé.

## Chronologie et limites des preuves

[implementation-verification.md](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/implementation-verification.md) décrit d’abord la remise de l’implémenteur, les captures du renderer `index-DuqTdY-Z.js` et une réserve initiale de packaging. Son complément parent documente ensuite les corrections et qualifications automatiques obtenues. Ces résultats conservent leur date et leur portée ; les anciennes captures ne sont pas présentées ici comme une preuve de F1 corrigé.

Les trois recaptures associées à `index-Ccfod1Na.js` et le verdict du même relecteur sont la preuve finale de finition de F1. [compiled-profile.json](C:/Sources/madness/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions/compiled-profile.json) décrit un banc Main/preload/renderer réel sur données et notifications synthétiques, sans compte ni fournisseur. Il distingue les preuves natives et humaines. Le présent rapport ne réexécute ni ne réinterprète le parcours live, le paquet ou l’installation personnelle.

Cette finition n’accorde aucune acceptation visuelle humaine globale. Elle n’exécute pas la passe Sally + experts UI/UX + Impeccable prévue après l’epic 1. Elle ne qualifie ni la distribution, ni SIWC pour une nouvelle application privée distribuée, ni les anciens gates G0/G1 ou les blocages de 1.1/1.2 ; la décision de conserver le code privé reste applicable. Elle n’ajoute pas d’approbations 1.6, de récupération 1.7 ou de graphe.

## Documentation préservée et dérive non canonisée

**Aucun changement** de [PRODUCT.md](C:/Sources/madness/PRODUCT.md), [DESIGN.md](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/DESIGN.md) ou [EXPERIENCE.md](C:/Sources/madness/_bmad-output/initiative-madness/ux-madness/EXPERIENCE.md). `.impeccable/design.json` est absent sur disque lors de cette lecture ; son absence est préservée, aucun sidecar n’est généré pour cette extension ordinaire. Le seul fichier écrit par ce rôle est le présent rapport.

Écart préexistant observé et non canonisé : `DESIGN.md` conserve `components.composer.minTextHeight: 71px`, tandis que `styles.css` applique `min-height: 100px` au champ du brouillon libre. Cet écart ne concerne pas la correction F1 et reste hors du mandat documentaire ciblé ; ni le code ni le contrat n’ont été modifiés pour le résorber. Aucune valeur locale du formulaire ni aucun écart porté par l’existant n’est promu en nouvelle règle du système.
