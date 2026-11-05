# Langue de l’interface — documentation finale004 de 2.14

Passage du 5 novembre 2026 par un substitut technique frais du documenter Impeccable. La définition officielle `impeccable_documenter.toml` et `reference/document.md` ont été lues directement ; ce passage ne constitue pas une activation native de cet agent. La branche **ordinary extension** s’applique : le monde atelier existant est conservé, sans régénération du [DESIGN racine](../../../../../DESIGN.md) ni de son [sidecar](../../../../../.impeccable/design.json). Les contrats de comportement restent dans [EXPERIENCE.md](../../../ux-madness/EXPERIENCE.md) et leur [index](../../../ux-madness/guidage-epic2/contrats-et-couverture.md).

## Candidat final004 et portée des preuves

Le candidat est le runtime **0.2.16**, story **2.14**, non installé personnellement. Son ASAR est `4bc95cfc3636113bd79cd0da40512e09528da9d31906949d9960171b1eee00cf` et l’installateur NSIS x64 porte l’empreinte `63b5133d4f7947fa729c833dc40aa6a97d2bdc9e973f701b8258edf7b32529e3`.

Le [gel runtime004](runtime-inputs-004.json), SHA256 `750b7bbc7fb37d6219cf7a591a211f5ebd48999de4e487c31e532dae2b41da7b`, fixe 32 entrées runtime et trois entrées de tests. Le [reçu parent004](parent-release-004.json), identique à [parent-release-final.json](parent-release-final.json), vérifie ces 35 fichiers dans l’archive source, 19 paires sortie compilée/fichier réellement contenu dans cet ASAR et 13 fichiers protégés. Il ne constitue pas un nouvel audit global de toutes les ressources.

| Révision et périmètre | Preuves retenues |
|---|---|
| Source003 avant le dernier complément Q4-r1 | 38 cas ciblés : [19 langue/apparence](parent-language-appearance-003.log), [17 UI](parent-ui-final-003.log), [deux graphe](parent-graph-final-003.log), sans échec ni skip dans ces reçus. |
| Source004, changements concernés par Q4-r1 | [Cinq cas ciblés du worker](review-fixes-q4-r1-green.log), puis [deux contrôles parent Forge/octets et source métrique](parent-q4-r1-final-004.log), sans échec ni skip. Ces portées se recouvrent ; elles ne sont pas additionnées à003 ni présentées comme une suite globale004. |
| Runtime004 compilé | [compiled-006](compiled-006/verification.json) : 11 contrôles réussis, quatre lancements et quatre fermetures possédées, nettoyage confirmé, zéro capture. |
| Paquet final004 | [packaged-004](packaged-004/verification.json) : 11 contrôles réussis sur cet ASAR, quatre lancements et quatre fermetures possédées, nettoyage confirmé, zéro capture. |

Les [revues finales](reviews-final.json) sont liées au même gel004 : le même Quick recontrôle Q1, Q2, Q3 et Q4-r1 comme résolus, l’audit bilingue high ne rapporte aucun constat et le même substitut technique de finition retourne **ship fonctionnel004**, sans correction matérielle supplémentaire ni correctif produit différé. Ce résultat ne certifie pas un rendu004 capturé ni une acceptation humaine. Le statut et le commit final du Build restent au parent.

## Commande et préférence implémentées

Le [contrôle de langue](../../../../../src/renderer/src/Locale.tsx) est placé dans la barre de fenêtre avant la commande de thème et réutilisé dans les en-têtes des dialogues natifs actifs, dont les consultations de fichier étroite/agrandie et la fiche agent étroite. Q1 a été corrigé via le même composant et le même provider, sans nouveau port ni état de langue. Les contrôles ciblés emploient de vrais clics, Tab et Entrée dans les modales ; ils conservent consultation, source et sélection. Le pointerdown de cette commande préserve le focus et la sélection de saisie lors d’un clic.

Le bouton affiche la langue courante `FR` ou `EN` ; son nom accessible et son titre désignent la langue de destination (« Switch interface to English » / « Passer l’interface en français »). La cible mesure au moins 40 × 40 px et reste hors de la région de déplacement. Le statut d’écriture expose `aria-busy` ; les avertissements de lecture, de pont et de sauvegarde sont des textes locaux sous `role="status"`, sur les surfaces existantes du thème.

`LocaleProvider` met à jour les cadres immédiatement et le `lang` du document. App reste montée : la langue n’est pas une clé d’identité de la vue. Les réponses tardives d’une ancienne demande ne remplacent pas l’état du dernier choix. Le démarrage et le reload lisent le choix courant détenu par Main, au lieu de réappliquer la langue de l’amorce native.

Le [contrat strict](../../../../../src/contracts/language.ts) ne permet que `fr` et `en`, dans un port versionné séparé d’apparence-v1 et du Snapshot métier v1. Le [store local](../../../../../src/adapters/persistence/language-store.ts) conserve `language-v1.json` sous userData ; aucune migration du Snapshot, de l’apparence ou des annexes n’est introduite.

| Situation | Comportement établi |
|---|---|
| Préférence absente | Français initial, sans créer un fichier par la simple lecture. |
| Choix enregistré | Écriture ordonnée et atomique ; le choix EN est relu au reload et à la vraie réouverture du témoin. |
| Fichier invalide, futur ou UTF-8 illisible | Français de secours initial avec avertissement ; octets existants préservés. Un choix de session peut fonctionner sans rendre ce fichier valide. |
| Sauvegarde refusée, dont vrai refus de rename Windows | Choix de session maintenu, échec explicitement annoncé, fichier existant préservé ; read/reload ne réinitialisent pas ce choix. La réouverture repart de ce qui a effectivement pu être enregistré. |
| Fermeture | Nouvelles mutations refusées ; les écritures déjà admises sont drainées dans leur ordre. Chaque banc final observe 128 écritures encore en attente au quit. |

## Traduction et conservation

Navigation, aides, catalogue, reprise, bibliothèque, cadres de demandes, mesures, fichiers et graphe ont des libellés FR/EN réactifs. Les sept rôles, descriptions et spécialités locales des agents suivent la langue ; nom attesté, provenance du message et portrait conservent leur identité. Une identité inconnue demeure inconnue.

Les corrections privées du [reçu worker](review-fixes-worker.md), recontrôlées dans les revues finales, complètent les raisons connues du graphe et les diagnostics de bibliothèque/progression. Les phrases connues et préfixes bornés utilisent des présentateurs fermés ; les paramètres techniques et le détail original inconnu restent exacts. La limite composée de bibliothèque est reconnue seulement par égalité avec la composition de `latest.snapshot.problems`, puis présentée à partir de ces éléments structurés, sans découper une chaîne technique arbitraire. L’observation courante qui porte ces limites demeure distincte de l’ancienne observation encore consultée, dont détails, révision et position restent conservés.

Les [formatteurs explicites](../../../../../src/renderer/src/locale-format.ts) appliquent `fr-FR` ou `en-US` aux nombres et pluriels propres à l’interface. Ils couvrent aussi les derniers comptes et tailles d’observations Forge et de source métrique corrigés en004, dont un octet et 1 234 octets. La valeur zéro, les inconnus et les montants absents gardent leur sens. Les noms et contenus de projet, chemins, commandes, invocations, identifiants, empreintes, types et noms du graphe, déclarations, révisions, numéros de lignes source et extraits restent littéraux. Les textes de question, options, réponses, patchs et résultats bruts gardent leurs octets : un cadre anglais peut donc contenir une question française.

Changer de langue ne constitue ni lecture de preuve, ni nouvelle arrivée, ni décision, ni envoi. Les contrôles de conservation couvrent le même textarea, texte Unicode, curseur, sélection et focus ; aperçu et recherche de fichier ; recherche/fiche du catalogue ; consultation d’agent ; US déjà choisie et choix différé. `requestId`, `choiceRef`, texte et opération restent exacts ; un ancien refus est représenté sans nouvelle commande. Reject/Allow restent appariés à decline/accept. Recherche, filtres, nœud, zoom et vue sans résultat du graphe sont conservés ; les positions de lecture encore présentes sont restaurées à la bascule. Les derniers contrôles004 préservent aussi source métrique, lignes, identités et autorité, sans relier les libellés localisés aux gardes métier.

Les deux bancs natifs finaux attestent la restitution exacte du Snapshot, du brouillon et de l’annexe métrique. Leur nettoyage survient après fermeture prouvée. Ils n’utilisent que des données locales synthétiques ; cette conservation ne décrit pas un essai du profil personnel.

## Système conservé et limites

- **Palette** : pétrole et terracotta autour des surfaces de lecture anthracite ou ivoire ; les deux thèmes restent distincts du choix de langue.
- **Typographie** : Barlow Condensed Bold pour titres et commandes, Oxanium locale pour lecture et métadonnées, pile monospace pour sources et identifiants.
- **Lecture** : `The Quiet Reading Rule` et `The Working Center Rule` gardent les fonds calmes et les preuves accessibles.
- **État** : `The Explicit State Rule` garde des libellés réels pour attente, refus et identité inconnue ; les données sources ne deviennent pas des traductions.
- **Commandes** : `The Two Voices Rule` et `The Native Window Actions Rule` restent celles de l’atelier ; FR/EN réutilise le chrome et ses primitives, sans nouveau monde visuel.

Les huit images de [paquet002](packaged-002/verification.json) restent **historiques**, liées à l’ASAR `a15fddff0c17b317cdf7f955764a588d190b7784caaad421eac284c908c9a453` : FR/EN, clair/sombre, 720 px, rail, noms longs, mouvement réduit et fenêtre native complète à 200 % de 1650 × 1150 px. Elles forment le second des deux lots visuels réalisés ; celles de paquet001 conservent leur propre provenance. Ni ces huit images ni le [paquet003](parent-release-003.json), ASAR `c282387f42373653f593804db3876338aa015048c4aa98341d331619366c72c2`, ne sont promus en preuve du rendu004. **Aucune image004 n’a été produite.** Le ship final est fonctionnel ; CSS, assets et fontes restent ceux conservés par les reçus.

Le [triage du détecteur unique](detector-triage.json) conserve six avertissements identiques à la baseline sur les arêtes et matières de l’atelier. Ils sont rattachés au monde épinglé, sans nouveau défaut fonctionnel démontré pour 2.14 ; ils ne deviennent ni nouveaux tokens ni nouvelles interdictions. Aucun nouveau passage du détecteur n’est effectué.

**Dérives non réparées** : le DESIGN racine raconte encore le candidat 0.2.5 et son sidecar est daté du 3 novembre ; EXPERIENCE présente encore la traduction 2.14 comme future. Cette extension est reliée par l’index sans réécrire les spines ni harmoniser leur histoire. La portée documentaire est ordinaire, sans mandat de migration. Les empreintes conservées du DESIGN racine et du sidecar sont respectivement `3cbfdb226a285d8d95215ccc36a035da66bb0c86674be1d01ecf8209cb35adc8` et `91c057fa0734124969403a97135c9ac038613bfa7e9f0c4f4ad6c5b932fcb827`.

Aucune acceptation humaine, conformité WCAG, activation native de persona, qualification SIWC ou gate G2–G5 n’est acquise par ces reçus. Les états question/approbation/graphe des bancs sont synthétiques. Les compteurs réseau et app-server sont nuls seulement sur la période observée après hook ; aucune activité antérieure n’est déduite. Aucun test produit, build, modèle, profil personnel, préversion, installation, capture ou changement de proxy n’est réalisé dans ce passage documentaire.
