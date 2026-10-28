# Refus avant le scénario de sortie inattendue

`personal-error-current-001` reste `failed-no-replay`. L’activation Mary a émis `item/tool/call`, outil `bmad_read_file` (séquence19), puis le pont a renvoyé `UNSUPPORTED_INTERACTION` (séquence20). Aucun resolver agent/config n’avait été observé ; le premier terminal Mary et la question maintenant une activité ne sont pas atteints. La panne contrôlée n’a donc pas été simulée dans ce run.

La trace expurgée ne publie pas le chemin demandé. L’examen de `dialogue.ts` et `readBmadFile` montre qu’un appel de lecture de cette forme n’accepte que les fichiers du profil qualifié : une lecture non admise échoue sans élargir les accès. La cause du choix de lecture du modèle n’est pas prouvée ; aucun défaut de réseau ou de certificat n’est déduit de ce refus. Aucun changement produit, de prompt, de garde ou de harnais n’est nécessaire pour garder ce refus explicite.

Le Main et son enfant sont fermés, leurs espaces possédés absents et les preuves historiques inchangées. Le témoin est ensuite rouvert sans moteur et archivé après six contrôles : [reçu de conservation](error-current-cleanup-001/report.json). Les vrais projets, les préférences et le compte restent conservés.

Le parent autorise sous le mandat une tentative **distincte**, `personal-error-current-002`, sur un témoin neuf avec les mêmes gardes. Elle ne transforme pas cet échec en succès et ne rejoue ni conversation ni effet. Une réussite éventuelle qualifie ce scénario observé, sans promettre que le modèle n’émettra jamais un appel non pris en charge.
