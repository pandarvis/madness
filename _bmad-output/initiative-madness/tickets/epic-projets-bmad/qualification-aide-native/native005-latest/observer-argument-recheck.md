# Recontrôle ciblé — argument de l'observateur et réutilisation de006

2 novembre 2026. Inspection seule du contrôleur privé, du contrat Playwright local et des preuves006. Aucune exécution du banc, aucun compte/coffre/profil/témoin/modèle/réseau/application consulté ou actionné. Seul ce rapport est écrit.

**Verdict :** correction cohérente pour l'échec006 identifié et le seul témoin003 sans échange. Aucun nouveau défaut concret relevé dans ce delta. Cet accord porte sur le banc ; il ne constitue ni un succès natif, ni une qualification M14.

## Signature de evaluate

À la ligne95 de `C:/Sources/madness/_bmad-output/initiative-madness/.working/help22-personal-controller.mjs`, le callback est maintenant :

`(_electron,ids)=>globalThis.__help22Trace.setAllowedReferences(ids)`

Le contrat local `node_modules/playwright-core/types/types.d.ts:19043` expose `ElectronApplication.evaluate<R,Arg>(pageFunction: PageFunctionOn<ElectronType,Arg,R>, arg:Arg)` : le premier paramètre du callback est le module Electron et l'argument fourni est le suivant. L'ajout de `_electron` corrige donc l'erreur de position ; le tableau de source ids est passé à `ids`. Les autres appels voisins du contrôleur distinguent déjà correctement evaluate Main et evaluate Page.

La preuve006 conserve `electronApplication.evaluate: TypeError: references is not iterable` dans setAllowedReferences, avant la ligne de lancement Help. L'empreinte du fichier d'erreur recalculée est exactement `da7085a65feb993ee49822f5cab8bda756f9429d2fc9221f964903013458a5e7`, celle du nouveau garde. Le rapport006 conserve préparation ready/nativeReady, réseau0, aucun enfant/question/approbation/tour, trace centrale complète et fermeture main/enfants/événement close prouvée. Il reste failed ; sa préparation locale ne devient pas un échange natif.

## Portée du nouveau garde de réutilisation

La branche `priorObserverError` (ligne75) exige simultanément le code CONTROLLER_FAILED, une préparation ready/nativeReady et l'empreinte exacte ci-dessus du fichier d'erreur adjacent au rapport explicitement fourni. Elle ne classe pas toute erreur de contrôleur comme réutilisable.

Les gardes communs, lignes76–81, restent appliqués après cette branche :

- provenance parent-personal-real-codex-siwc, statut failed et cleanup.closed=true ;
- assertClosed sur le reçu précédent ;
- zéro enfant Codex et zéro tour précédents ;
- aucune conversation ni annexe Help pour le projet lié ;
- brouillon exact du témoin, marqueur possédé avec owner/id concordants ;
- lecture du compte et absence d'activité native existante vérifiées plus haut.

Le rapport006 effectivement lu porte aussi network=0. La branche nouvelle ne crée pas une permission de reprise d'un ancien échange : elle reste arrêtée par les gardes noConvo/noHelpRecord et n'avance que vers la préparation puis un nouveau lancement explicite. Le libellé `observer-configuration-before-provider` conserve la cause distincte du refus natif005 et de l'ancien incident réseau. Le produit et le paquet005 ne sont pas modifiés par cette correction privée.

Les contrôles réels du compte, du marqueur et du brouillon seront ceux du prochain passage du parent ; cette inspection a vérifié leur présence dans le code sans lire les données personnelles correspondantes. Aucune nouvelle preuve de réponse, restauration ou M14 n'est déduite de ce recontrôle.
