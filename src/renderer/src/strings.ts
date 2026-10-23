import type { ErrorCode } from '../../contracts/index.ts'
/** Base française acceptée. Les variantes attendent les contrats de Sally. */
export const fr = {
  app: 'Madness', home: 'Accueil', open: 'Ouvrir un projet', recent: 'Projets récents',
  save: 'Enregistrer le brouillon', saving: 'Enregistrement…', saved: 'Brouillon enregistré localement.',
  unsaved: 'Modification non enregistrée.', noDraft: 'Aucun brouillon enregistré.',
  codexUnavailable: 'Codex indisponible',
  codexReason: 'La connexion Codex doit encore être qualifiée. Aucun agent n’est lancé et aucun message ne peut être envoyé.',
  errors: {
    INVALID_COMMAND: 'Cette demande n’est pas reconnue. Réessayez depuis la commande de Madness.',
    UNTRUSTED_CALLER: 'Cette fenêtre n’est pas autorisée à effectuer cette opération.',
    PROJECT_NOT_FOUND: 'Ce projet n’est plus connu du stockage local. Rechargez le contexte ou ouvrez son dossier.',
    DIRECTORY_UNAVAILABLE: 'Le dossier est inaccessible. Vérifiez son accès ou choisissez un autre dossier.',
    STORAGE_READ_FAILED: 'Le stockage local ne peut pas être lu. Vérifiez son accès puis réessayez. Les données n’ont pas été réinitialisées.',
    STORAGE_WRITE_FAILED: 'L’enregistrement local a échoué. Votre saisie reste disponible ici. Vérifiez l’espace et les droits d’accès puis réessayez.',
    STORAGE_CORRUPT: 'Le stockage local est endommagé ou ne respecte pas le schéma attendu. Ses octets sont préservés. Conservez une copie avant toute réparation.',
    STORAGE_VERSION_UNSUPPORTED: 'Ces données proviennent d’une version de stockage inconnue. Elles sont préservées. Utilisez une version compatible de Madness.',
    STORAGE_CONFLICT: 'Le stockage a changé hors de cette session. Il n’a pas été remplacé. Conservez votre saisie avant de redémarrer Madness.',
    APP_CLOSING: 'Madness est en cours de fermeture. Aucune nouvelle opération ne peut être lancée.'
  } satisfies Record<ErrorCode, string>
}
