# Complément de qualification du socle1.2

Réconciliation technique validée au28octobre2026 sous le mandat autonome. Complète les preuves historiques sans les réécrire, sans réimplémenter le socle et sans modifier le bloc d’intention de son plan.

## Périmètre technique et poste qualifié

Le [README officiel figé d’Electron45.0.0](https://raw.githubusercontent.com/electron/electron/v45.0.0/README.md), consulté le28octobre2026, annonce Windows10 et versions suivantes, avec binaires x64 et arm64. C’est un prérequis amont documenté, pas une preuve de test de Madness sur toutes ces configurations. La [release Electron45](https://www.electronjs.org/blog/electron-45-0) annonce Chromium156.0.8078.48 et Node24.22.0 ; les reçus de l’application installée mesurent ces versions.

Le paquet Madness produit et qualifié ici est **Windows x64**. Le poste observé par CIM et registre est **Windows11 Entreprise25H2, build26200.9711,64bits** (`target-platform-2026-10-28.json`). C’est la configuration effectivement testée, conservée comme profil de référence. Windows10, WindowsARM64 et les autres builds ne sont pas annoncés testés. Aucun engagement de support élargi n’est déduit des binaires proposés par Electron.

Pour le pilote actuel, Electron45.0.0 et Chromium156.0.8078.48 sont conservés. Le minimum Chromium exact d’une politique entreprise n’est pas connu : le contrôle porte sur le paquet observé et le GET réel autorisé, sans inventer une règle de proxy. Une autre configuration cible ou une mise à jour doit repasser les contrôles pertinents selon AD-9 ; aucune acceptation universelle n’est annoncée.

## Réserves historiques rapprochées des preuves nouvelles

| Réserve | Preuve disponible | Portée |
|---|---|---|
| Socle, contrats et frontières | `qualification-g0.md`, `profile.json`, tests de fondation/frontières/persistance et suite complète courante | Le renderer et le vrai preload exercent le cœur ; pas de Node/fichiers/processus exposés au renderer. Les évolutions1.3–1.9 gardent leurs plans et contrôles propres. |
| Installation sur le poste | Confirmation humaine du24octobre, puis `../qualification-maintenance/installation.json` : NSIS0.1.1, sortie0, artefacts installés égaux au manifeste | Installation per-user réelle, pas seulement lancement unpacked. Le code privé et la diffusion à des tiers restent séparés. |
| Remplacement et restauration | `../qualification-maintenance/installed-a.json`, `installed-b.json`, `personal-reopen-profile.json` | A0.1.0/B0.1.1 au même chemin, douze fichiers synthétiques et deux projections identiques ; vingt-sept entrées personnelles conservées, compte lisible et fenêtre fermée. |
| Compatibilité minimale et architecture | Source Electron45 ci-dessus, `target-platform-2026-10-28.json`, runtime du reçu de réouverture | Prérequis amont distingué du seul profil Madness effectivement testé ; paquet x64 uniquement. |
| Accès proxy du paquet cible | `personal-reopen-profile.json.mainPublicGet` : GET strict vers `https://auth.openai.com/.well-known/jwks.json`, HTTP200, une requête,27octobre2026 22:54:23UTC | Aucun nouveau clic humain, login, refresh ou modèle. Résultat borné à cette destination, ce paquet, ce poste et cet instant. Pas d’expiration Zscaler inventée ni de politique entreprise prétendue validée. |

L’ancienne mention de désinstallation dans la raison de blocage ne constitue pas un scénario exécuté : aucune désinstallation n’a été effectuée ni n’est annoncée réussie. Les critères d’acceptation de1.2 demandent le socle, le paquet et les réserves explicites ; la conservation après remplacement est maintenant éprouvée par les reçus de qualification de1.9. `deleteAppDataOnUninstall:false` reste une configuration, pas une preuve de désinstallation. G4 et la qualification complète de distribution conservent leurs exigences.

## Frontières de conclusion

Ces preuves résolvent les réserves techniques restantes de1.2 pour le profil cible décrit, après relecture fraîche favorable. Elles ne résolvent **ni1.1 niG1**, ne prouvent pas une connectivité externe fraîche du runner Codex et ne valent pas validation humaine globale de l’application ou de son apparence. Les anciens résultats de tests et limites restent lisibles ; le plan historique n’est pas réécrit pour lui attribuer les fonctionnalités ultérieures.

Le mandat autonome autorise cette réconciliation technique et sa validation exécutable. La clôture de l’epic exige toujours ses autres entrées, notamment la voie Codex distribuable1.1, puis1.10 et1.11 dans leur ordre.

## Validation

Relecteur frais `/root/sofia_validate_g0_completion` : contrôles Ticket de Sofia et rapprochement des reçus JSON, sources officielles ouvertes ; avis favorable, aucun ask ni fix bloquant. Suggestion de préciser « reçus de qualification de1.9 » appliquée. Le parent confirme la suite1.9 finale300/300, types et revues résolues, commit25d54a10f6981c57e95453214d43164565d28768. Aucune nouvelle exécution, désinstallation ou preuve1.1 déduite de cette relecture. Seul le statut du plan1.2 est réconcilié par BOARD ; son corps et son bloc figé restent intacts.
