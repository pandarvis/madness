# Finition Impeccable — story 1.4

Date : 26 octobre 2026. Disposition transmise par le reviewer de finition frais : **`ship`**, limitée à la story 1.4. Ce document consigne ce verdict et le système observé ; il ne constitue ni une nouvelle revue générale ni une acceptation humaine du produit.

## persistence

**Pass pour l’extension 1.4.** La conversation progressive prolonge la composition, les palettes, la typographie et les contrôles existants. Aucun remplacement esthétique n’est introduit. Les contrats existants restent la référence ; les écarts antérieurs ne sont pas transformés en règles à reproduire.

Le rôle spécialisé `impeccable_documenter` n’étant pas exposé par le harness, cette passe utilise un agent technique générique frais, chargé explicitement de la [définition officielle installée](C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/agents/impeccable_documenter.toml) et de sa [référence `document.md`](C:/Users/UP60066553/.codex/plugins/cache/openai-curated-remote/impeccable/4.3.1/skills/impeccable/reference/document.md), lues intégralement. Il ne s’agit ni de Sally ni d’un rôle spécialisé natif du harness. Aucun sous-agent n’a été lancé par le documenter.

La référence demande normalement l’écriture de `DESIGN.md` et de `.impeccable/design.json`. Cette destination dépasse la frontière explicite du mandat : seul le présent rapport est écrit. Aucun contrat, sidecar, code, test ou plan n’est modifié ; aucun build, test, détecteur ou navigateur n’est relancé. L’extension ordinaire conserve le système incumbent, conformément à la définition du documenter. Les demandes de vocabulaire créatif ou de remplacement du système ne sont pas ouvertes pour cette consignation.

Sources relues : [AGENTS.md](../../../../../AGENTS.md), [PRODUCT.md](../../../../../PRODUCT.md), [DESIGN.md](../../../ux-madness/DESIGN.md), [EXPERIENCE.md](../../../ux-madness/EXPERIENCE.md), ainsi que les sources [App.tsx](../../../../../src/renderer/src/App.tsx), [strings.ts](../../../../../src/renderer/src/strings.ts) et [styles.css](../../../../../src/renderer/src/styles.css). Les règles sont relevées dans le renderer livré, et non déduites du plan.

Résumé du système observé, en cinq lignes :

1. **Palette :** anthracite chaud pour les surfaces, navigation plus sombre, terracotta pour l’action et bleu clair pour sélection, liens et focus ; le thème clair alternatif conserve ses tokens.
2. **Typographie :** Segoe UI et replis système ; titres à 26/19 px, lecture de conversation à 13 px avec interligne 1,75, états à 12 px ; chemins et invocations en Consolas/Cascadia Code à 12 px.
3. **Règle observée — portée de l’état :** identité, phase du message, conservation, activité de session et acceptation humaine sont des informations distinctes et textuelles.
4. **Règle observée — continuité de lecture :** articles stables par identifiant, ancrage conservé hors du bas et suivi lorsque le lecteur est au bas ; saisie conservée pendant le flux et les changements de vue.
5. **Règle observée — profondeur mesurée :** listes et séparations fines, réponse humaine sur fond de navigation, arrondis existants et ombre du champ ; aucun matériau physique simulé ni nouvelle décoration canonisée.

Preuves examinées :

| Fichier | Constat et portée |
|---|---|
| [compiled-profile.json](compiled-profile.json) | Dix contrôles réussis sur les vrais Main/preload/renderer compilés ; flux typé synthétique injecté, sans fournisseur ni compte. |
| [packaged-profile.json](packaged-profile.json) | Dix contrôles correspondants sur le paquet ; la persistance source est exercée séparément après fermeture, avec le vrai Snapshot v1. |
| [compiled-compact.png](compiled-compact.png) | Capture examinée de la fenêtre étroite : identité inconnue, réponse en cours, conservation non confirmée et saisie témoin avec focus visible. |
| [compiled-progress.png](compiled-progress.png) | Capture examinée de la progression bureau : texte reçu, item distinct de texte identique et identité attestée avec sa source. |
| [compiled-desktop.png](compiled-desktop.png) | Capture examinée de l’état partiel : texte maintenu, conservation non confirmée et état d’échec séparé de la saisie. |
| [compiled-forge-history.png](compiled-forge-history.png) | Capture examinée de l’annexe historique Forge : invocation, chemin, observations durables, clôture observée et acceptation humaine inconnue. |
| [impeccable-detector.json](impeccable-detector.json) | Résultat existant `[]`, issu de l’unique invocation annoncée par le parent ; aucune seconde exécution. |

Les quatre images sont des états synthétiques de contrôle, dont certaines vues sont volontairement défilées pour examiner lecture et saisie. Elles ne sont pas des captures d’un premier viewport contractuel ou d’un tour natif réel. Le rapport paquet ne revendique pas de nouvelle capture : son tableau `captures` est vide.

L’archive `c75733cc…` désigne le paquet initial couvert par ces preuves. Trois corrections Quick de l’adaptateur sont encore traitées par le parent, sans modification des trois sources renderer examinées. Le parent a figé les empreintes renderer avant ces corrections et vérifiera leur identité après build pour établir la fraîcheur des quatre captures. L’empreinte de l’archive initiale n’est donc pas figée comme celle de la livraison finale ; le parent doit rattacher l’archive finale à ses vérifications après corrections.

## fidelity

La matrice consigne la fidélité à la direction existante et aux règles applicables à l’extension. Aucun comp approuvé propre à 1.4 ni contrat formel THESIS / OWN-WORLD / STORY / FIRST VIEWPORT / FORM n’a été fourni ; la matrice ne prétend pas reproduire un tel comp.

| Élément | État | Fondement |
|---|---|---|
| TYPE | match | Segoe UI fonctionnelle, hiérarchie et monospace existants ; aucun nouveau traitement de titre ni changement de caractère typographique. Cette correspondance vise le système incumbent, pas une promesse de lettrage absente. |
| MATERIAL | match | Surfaces CSS plates, filets et ombres fonctionnelles de l’application existante ; aucune matérialité peinte, photographique ou physique promise puis imitée. |
| GROUND | match | Fond anthracite chaud, navigation plus sombre et panneau assorti, cohérents avec la direction sombre terracotta/bleu et les tokens actuels. Aucune nouvelle autorité OWN-WORLD ou comparaison pixel à un comp n’est revendiquée. |
| Identité par message | match | « Agent non identifié » avant attestation ; la provenance apparaît pour l’item attesté. Le nouveau nom ne réattribue pas les messages plus anciens. À la réouverture, identité et état du tour historiques redeviennent inconnus. |
| Progression, partiel et stockage | match | « Réponse en cours », « Réponse partielle » et « conservation non confirmée » restent distincts. Le texte déjà reçu reste lisible ; aucune fin de message ou attestation ne vaut preuve de conservation. |
| Ancrage, focus et saisie | match | Identifiants stables et zone de messages défilante dans le code ; les rapports couvrent absence de vol de focus, annonce de transitions, ancrage de lecture et conservation du brouillon pendant le flux et la navigation. Les captures corroborent les états visibles. |
| Historique et annexe Forge | match | Invocation, chemins, observations et portée historique sont conservés ; le résultat observé ne devient pas une acceptation humaine. Deux items distincts de texte identique restent deux messages. |
| Fenêtre compacte | adaptation existante conservée | La fenêtre Windows redimensionnable utilise les seuils existants et les replis de texte. Ce choix est fondé sur DESIGN.md et EXPERIENCE.md, qui demandent lecture et saisie conservées lors du redimensionnement ; les contrôles ciblés ne relèvent pas de débordement horizontal. Aucun engagement mobile natif n’en découle. |

## ceiling

**Non cotable contre une QUALITY BAR propre à 1.4.** Le paquet ne fournit ni carte QUALITY BAR, ni THESIS/OWN-WORLD/FORM formalisés avec seed key corroborée, ni comp 1.4 faisant autorité. Aucune note de plafond, dispositif natif manquant ou ambition esthétique nouvelle n’est inventé pour combler ces entrées absentes. Le verdict `ship` porte sur l’extension contrôlée et sa continuité avec l’existant.

Les écarts déjà connus de la passe 1.3 — sidecar resté clair, format du contrat, hauteur du champ de réponse et panneau en fenêtre compacte — restent signalés et hors portée. Ils ne sont ni réparés, ni canonisés ici. En particulier, le minimum de textarea de 100 px observé dans le renderer ne remplace pas silencieusement les 71 px inscrits dans le contrat ; le panneau masqué sous 1080 px n’est pas présenté comme la réalisation de tout le parcours de panneau sur demande décrit dans les contrats.

Le retour humain du 26 octobre reste prioritaire : apparence générale jugée peu satisfaisante et nombreux retours UI/UX annoncés. Le passage Sally + Impeccable après l’epic 1 et avant l’epic 2 est consigné dans [deferred-work.md](../../../deferred-work.md). Ce travail n’est pas ajouté à la story 1.4 par la présente passe ; son `ship` ne constitue aucune acceptation visuelle globale.

## material_fixes

**Aucun `material_fix` identifié par le reviewer de finition pour la portée 1.4.** Aucun correctif esthétique n’est appliqué par le documenter. Les corrections Quick de l’adaptateur et la qualification native restent possédées par le parent et ne sont pas absorbées dans ce verdict visuel.

Au moment de la transmission de cette passe, le parent signale un essai natif bloqué par `NETWORK_UNAVAILABLE` dans `acquireDialogue`, avant le lancement du processus Codex : zéro processus lancé et zéro delta observé. La page publique a été ouverte depuis la commande produit ; Computer Use a été arrêté faute d’URL courante vérifiable et une réponse humaine reste attendue. Aucune causalité Zscaler ni capacité du serveur n’est déduite. Aucun succès natif n’est déduit des contrôles synthétiques, des captures ou de la disposition `ship`. La confirmation du paquet final, le résultat du parcours natif, l’acceptation humaine et les gates historiques restent des preuves distinctes.

## keep

Conserver la lecture progressive et son ancrage, le focus et la saisie stables, l’identité attestée par item avec sa source, les distinctions progression/partiel/conservation, les historiques et observations Forge, la direction sombre existante et l’adaptation compacte ; ne jamais déduire une validation humaine, une acceptation visuelle globale, une réussite native ou la clôture d’un gate d’une preuve technique ciblée.

Confirmation du parent après les patchs : build et contrôles compilé/paquet/Windows réussis ; quatre fichiers renderer byte-identiques (`renderer-continuity.json`). Les captures examinées ne sont pas recapturées ; le verdict UI garde sa portée et ne prouve aucun succès natif.
