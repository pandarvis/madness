# Contrôle indépendant final de conservation — 1.11

Contrôle du 28 octobre 2026, limité au code et aux preuves du dépôt. Aucun lancement de Madness ou de runner, test, appel réseau, inventaire OS actif, accès au profil AppData personnel ou au coffre. La seule écriture de l’auditeur est ce rapport.

## Avis

Aucun défaut matériel de fermeture, de réouverture ou de restriction de l’archivage n’est établi dans les trois parcours positifs courants. Les reçus sont cohérents avec les gardes effectivement exécutées par leurs scripts, dont les octets sont identiques aux empreintes consignées. Le rattachement du nettoyage de l’essai refusé est complété par une attestation rétrospective vérifiée, avec la limite précisée plus bas. Aucun constat correctif ne reste ouvert dans ce contrôle. Il ne prononce ni le statut `built` ni la clôture G0/G1 ; le parent conserve ces décisions après la revue complète.

## Entrées réellement examinées

- `AGENTS.md`, le plan 1.11 et [final-matrix.md](final-matrix.md).
- `scripts/qualification/epic-one-support.mjs`, `epic-one-personal.mjs`, `epic-one-control-trace.mjs` et `epic-one-provenance.mjs` ; primitives d’identité de `src/adapters/codex/owned-run.ts` et restauration de `src/adapters/codex/connection.ts`.
- [personal-current-002/report.json](personal-current-002/report.json), [personal-close-current-001/report.json](personal-close-current-001/report.json), [personal-error-current-002/report.json](personal-error-current-002/report.json), leurs six fichiers `native-events-1/2.json`, ainsi que le reçu et la trace de [personal-error-current-001](personal-error-current-001/report.json).
- [error-current-cleanup-001/report.json](error-current-cleanup-001/report.json), son fichier natif et le contrôleur `.working/story111-clean-current.mjs` ; [public-current-003/report.json](public-current-003/report.json), son fichier natif et `.working/story111-public-check.mjs` ; [synthetic-current-001/report.json](synthetic-current-001/report.json).
- Complément reçu après la première rédaction : [parent-invocation-link.json](error-current-cleanup-001/parent-invocation-link.json), vérifié uniquement contre le contrôleur et les deux reçus du dépôt.
- L’inventaire `.working/story111-historical-before.json` et chacun de ses 383 fichiers, par lecture et calcul SHA-256 ; le manifeste final 1.13 dans `qualification-forge-session-check/installation-final/`.

## Provenance vérifiée

Les trois parcours positifs, le refus courant, le contrôle public et la suite synthétique désignent la version 0.1.2, Electron 45.0.0 et l’ASAR `9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4`. L’empreinte du manifeste final, recalculée dans le dépôt, est `15f08c2c7b3b51056ba7d1ce624dc1759bba09261bea981fb7809636c3b5c8b6`, identique aux reçus. Le runner embarqué Python et le runner Codex natif sont deux fichiers distincts, correctement distingués par les reçus : respectivement `6d1ebd4e…ccaed5` et `4b76ded0…956a7`, ce dernier annoncé en 0.144.6.

Les empreintes recalculées des trois scripts centraux sont exactement celles des reçus : support `5b60b97e…0444c`, personnel `0f6f98c2…21720`, trace `e74a4f9b…75dd6`. Les parcours personnels nomment leur révision propre `61a912b39d0bd014525df52d5b131bf885f82876` ; la suite synthétique nomme `bed0f206007ec154543d11fff54d66ae5b02f574`. Ces provenances de banc ne sont pas substituées à celle du programme. Aucun candidat UX n’est attribué à l’ASAR 9249… dans les reçus ou la matrice examinés.

`verifyArtifact` contrôle identité, version exacte, ASAR et runner avant lancement (`epic-one-support.mjs:30–37`). `PersonalSession.launch` relit le vrai PID Main dans le programme, vérifie le runtime et les chemins habituels userData/AppData/sessionData, puis distingue ce PID de celui du wrapper Playwright (`epic-one-personal.mjs:92–103`). Il ne déplace pas le profil personnel.

## Fermeture et espaces possédés

| Parcours | Main / wrapper observés | Enfants natifs et fermeture | Reçu final |
|---|---|---|---|
| Personnel 002, 12 contrôles | 59452 / 43616 | 59792 et 16036, tous deux `close`, code 0 | `mainGone`, `childrenGone`, `closeObserved`, `spacesAbsent` vrais ; propriétaire durable `stopped`, identité présente |
| Fermeture active 001, 8 contrôles | 55856 / 57848 | 56340 encore ouvert dans `report.native`, puis `close`, code 0 dans `firstClose.native` | Les quatre gardes vraies ; propriétaire durable `stopped`, identité présente |
| Panne enfant 002, 9 contrôles | 43120 / 43092 | 51016, fermeture inattendue contrôlée, code 4294967295 | Les quatre gardes vraies ; propriétaire durable `stopped`, identité présente |

La fermeture active maintient réellement une question native sans réponse (`expected:false`, `outputs:0`) avant shutdown. La panne 002 intervient aussi après cette attente ; le contrôleur arrête seulement l’identité de l’enfant déjà observé, avec PID, heure de création et chemin vérifiés. Il n’arrête aucun nom de processus (`owned-run.ts`, `windowsOwnedProcesses.stop`).

`PersonalSession.close` garde les hooks pendant shutdown, attend la disparition OS du Main et relit le fichier d’événements après la fermeture. Il exige les événements `close`, réobserve chaque identité d’enfant, puis vérifie séparément l’absence des répertoires de dialogues possédés (`epic-one-personal.mjs:133–146`). Un statut `stopped` seul ne suffit donc pas. Les fichiers `native-events-1.json` correspondent structurellement aux objets natifs de fermeture incorporés dans les quatre rapports personnels, y compris celui refusé.

Les traces positives sont complètes : 402 événements dans le parcours 002, 77 dans la fermeture active et 77 dans la panne 002, sans événement supprimé ni indicateur d’incomplétude. Les limites de trace restent 2048 événements, 1 Mio par ligne et 8 Mio cumulés. Les catégories et références hachées ne publient ni arguments privés, ni bearer, ni stderr brut (`epic-one-control-trace.mjs:13–84`).

## Durable, réouverture et compte

L’ordre du scénario est correct : fermeture confirmée ; relecture du propriétaire durable ; capture du snapshot final et des empreintes d’annexes ; nouveau lancement ; comparaison exacte ; nouvelle fermeture ; comparaison des octets durables une seconde fois ; archivage éventuel (`epic-one-personal.mjs:252–258`). Les références de comparaison ne sont donc pas un état pris avant shutdown.

Les trois parcours positifs exigent le snapshot structurel exact après réouverture, les questions et approbations historiques inactives, `dialogue.status === 'idle'` et `turn === null`. Après la seconde fermeture, le snapshot doit être identique octet pour octet et les annexes conserver leurs empreintes. Les textes, conversations, brouillons et annexes sont ainsi comparés sans être recopiés dans le rapport expurgé.

Les trois `native-events-2.json` correspondent à `reopenObservation` : zéro enfant, zéro réseau, zéro tour et trace complète, sans débordement. L’attente de trois secondes est explicitement présente dans le chemin exécuté. Cette mesure ne couvre pas le démarrage antérieur au hook. Elle observe les créations de runner et les requêtes de la session Electron instrumentée ; elle n’est pas une capture réseau globale de la machine.

Le compte est vérifié par les seules métadonnées du pont : `accountStored` vrai et `needsPlanAcknowledgement` faux avant et après réouverture. La lecture de `CodexConnection.restore/read` montre que ces métadonnées suivent une restauration réussie par le coffre interne au programme (`connection.ts:36–46`). L’auditeur n’a accédé à aucun coffre, et aucune copie de secret n’est nécessaire à ces assertions. Cela prouve la lisibilité du compte dans ces ouvertures, sans prétendre une égalité des octets du coffre.

## Archivage et données réelles

L’archivage exige une fermeture et une réouverture réussies, un marqueur possédé, un `projectId` unique et le même chemin témoin. Il ne sélectionne pas les données par un simple préfixe de nom. Il ne retire que les conversations, brouillons et annexes de ce projet ; les autres annexes sont relues à empreinte égale, et le snapshot intégral attendu est relu après écriture (`epic-one-support.mjs:92–124`). Les dossiers témoins restent aux chemins de preuve.

La garde `assertProfileClosed` refuse toutes copies possibles de Madness, même déplacées ou renommées selon ProductName, ainsi qu’Electron incertain ; elle ne ferme rien par nom. Elle est appelée à l’entrée et immédiatement avant les mutations du snapshot et des annexes. Le callback d’archivage utilise cette garde générale, et non la seule recherche de l’exécutable installé. Les vrais projets, conversations, brouillons, annexes et préférences déjà présents sont aussi comparés par `preserve` avant la première fermeture et après réouverture (`epic-one-personal.mjs:155–160,246,256`).

Les reçus d’archivage des trois succès portent respectivement : 2 conversations / 1 brouillon / 4 annexes ; 1 / 1 / 1 ; 1 / 1 / 1. Les gardes ont toutes abouti avant le statut de succès. Les préférences couvertes sont celles du snapshot et les données relues par les ponts ; cette revue ne prétend pas un nouvel inventaire de tous les fichiers arbitraires du profil.

## Échec conservé et reçu complémentaire

`personal-error-current-001` reste `failed-no-replay`, avec un seul contrôle réussi, `UNSUPPORTED_INTERACTION`, aucun premier terminal Mary, aucune question et aucune simulation de panne. Sa trace contient 24 événements ; la lecture `bmad_read_file` non admise est suivie du refus natif. Son Main 32784 et son enfant 19720 sont néanmoins fermés, `spacesAbsent` vrai. Le succès distinct de la panne 002 ne transforme pas cette activation refusée en succès.

Le reçu `error-current-cleanup-001` porte six contrôles de restauration/conservation, runtime 0.1.2, compte lisible, aucune activité après hook, fermeture confirmée et archive d’une conversation, sans brouillon ni annexe. Son contrôleur vérifie le reçu d’entrée `failed-no-replay`, le marqueur du témoin, le paquet final et la fermeture générale ; il compare les octets durables avant/après réouverture, puis les autres projets/conversations/brouillons/préférences après archivage.

La réserve initiale était documentaire : ce reçu complémentaire ne consigne pas lui-même le chemin ou hash du rapport source, le `witnessId/projectId`, ni l’artefact vérifié. Le parent a ensuite confirmé l’appel de la session outil 94788, sorti 0 avec six contrôles, et conservé [parent-invocation-link.json](error-current-cleanup-001/parent-invocation-link.json). Cette attestation nomme explicitement `recordedAfterCompletion:true` et sa nature rétrospective. Elle rattache le contrôleur au reçu `personal-error-current-001/report.json`, au témoin `d17c6b97-244d-4985-9cda-26ca23bab950`, à l’artefact final 0.1.2 et à la sortie `error-current-cleanup-001`.

Recontrôle indépendant du complément : SHA-256 du contrôleur `c4510e17…724e4`, du reçu source `a5f5dedd…6826a` et du reçu de nettoyage `aa3da4b8…61d90` tous identiques aux fichiers présents ; arguments source/sortie, objet témoin et objet artefact identiques aux références consignées ; reçu source toujours `failed-no-replay`, nettoyage toujours `passed`, six contrôles et compte lisible. Le chemin du contrôleur est explicité dans l’attestation sous sa forme absolue, équivalente au chemin relatif de l’appel confirmé depuis la racine du dépôt. Le rattachement documentaire est donc établi et la réserve corrective levée.

Limite maintenue : cette attestation est la déclaration rétrospective du parent fondée sur son véritable appel ; elle n’est pas un journal automatique contemporain et l’auditeur n’a pas relu la session outil originale. Aucun ancien reçu n’a été modifié, aucun scénario rejoué et aucun accès AppData supplémentaire effectué pour ce complément.

## Historique et portée finale

Les 383 fichiers de l’inventaire initial, baseline `4855e7dc7eb1371534220bb6bf861c05b5ab672c`, ont été relus et hachés : **383 identiques, zéro absent ou différent**. Les 330 fichiers surveillés par `historicalDigests()` sont tous inclus dans cet inventaire ; les tableaux avant/après des trois parcours positifs sont également égaux. Le manifeste final 1.13 est contrôlé séparément. Aucun reçu historique n’a été régénéré par cet audit.

Le GET public Main 003 est HTTP 200, sans redirection, une seule requête observée et aucun enfant. Son contrôleur impose GET, `redirect:'error'` et `credentials:'omit'`, sans lire la réponse. Ce résultat reste distinct du réseau natif : accès et confiance HTTPS des requêtes du child sont inférés de leurs tours réussis et de leur configuration contrôlée, sans chaîne de certificats ou CA capturée, ni expiration Zscaler déduite.

La suite synthétique courante comporte dix phases et 75 contrôles, avec `cleanup:true` partout ; les deux phases avec vrai runner sont explicitement `loopback`. Leur succès n’est pas utilisé comme preuve d’un modèle externe ou d’un compte personnel.

Ce contrôle apporte un avis favorable sur la conservation technique observée dans son périmètre. Il ne couvre ni l’acceptation visuelle humaine, ni WCAG, ni G2–G5 étendus, ni le catalogue général BMad, ni la V1 complète. Les refus de modèle restent possibles et les observations antérieures aux hooks restent inconnues.
