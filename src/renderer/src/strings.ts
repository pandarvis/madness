import type { ErrorCode } from '../../contracts/index.ts'
import type { ConnectionErrorCode, ConnectionStatus } from '../../contracts/connection.ts'
/** Base française acceptée. Les variantes attendent les contrats de Sally. */
export const fr = {
  app: 'Madness', home: 'Accueil', open: 'Ouvrir un projet', recent: 'Projets récents',
  save: 'Enregistrer le brouillon', saving: 'Enregistrement…', saved: 'Brouillon enregistré localement.',
  unsaved: 'Modification non enregistrée.', noDraft: 'Aucun brouillon enregistré.',
  codexReason: 'La connexion locale à votre forfait ChatGPT est accessible depuis le logo Codex dans la barre. Les conversations BMad attendent encore leur qualification ; aucun brouillon n’est envoyé.',
  connectionStatus: {
    disconnected: 'non connecté', registered: 'compte enregistré, à vérifier', authorizing: 'autorisation dans le navigateur', verifying: 'vérification du forfait', stopping: 'arrêt en cours', verified: 'connexion vérifiée', error: 'connexion indisponible', cancelled: 'connexion annulée', unknown: 'résultat inconnu', closing: 'fermeture en cours'
  } satisfies Record<ConnectionStatus, string>,
  connectionErrors: {
    INVALID_COMMAND: 'La demande de connexion n’est pas reconnue. Rouvrez le panneau.',
    UNTRUSTED_CALLER: 'Cette fenêtre n’est pas autorisée à connecter Codex.',
    ENCRYPTION_UNAVAILABLE: 'Le chiffrement Windows est indisponible. Aucun jeton ne sera enregistré. Vérifiez votre session Windows puis redémarrez Madness.',
    VAULT_UNREADABLE: 'Le coffre local est illisible. Ses octets sont préservés. Conservez une copie avant réparation, ou déconnectez ce compte localement pour le retirer.',
    VAULT_WRITE_FAILED: 'L’enregistrement sécurisé a échoué. Vérifiez l’espace et les droits du dossier de données puis réessayez.',
    REGISTRATION_INVALID: 'L’inscription locale ne peut pas être relue. Elle est préservée. Vérifiez les fichiers de données de Madness avant de redémarrer.',
    NETWORK_UNAVAILABLE: 'Le service ne répond pas. Vérifiez votre connexion, le proxy et les certificats Windows puis réessayez explicitement.',
    OAUTH_INVALID: 'Le retour de connexion n’a pas pu être validé. Aucun nouveau compte n’est accepté. Recommencez la connexion.',
    CONSENT_DENIED: 'L’autorisation a été refusée dans le navigateur. Vous pouvez recommencer si vous souhaitez connecter ce compte.',
    SCOPES_MISSING: 'L’autorisation ne couvre pas l’utilisation directe du forfait ChatGPT. Aucun témoin n’a été envoyé. Reconnectez le compte avec les permissions demandées.',
    IDENTITY_CHANGED: 'Le compte choisi diffère du compte enregistré. Déconnectez d’abord le compte local pour en choisir un autre.',
    CANCELLED: 'La connexion a été annulée. Aucun tour ne sera relancé automatiquement.',
    TIMEOUT: 'Le délai de connexion est dépassé. L’attente a été arrêtée. Recommencez lorsque vous êtes prêt.',
    BROWSER_UNAVAILABLE: 'Le navigateur Windows n’a pas pu être ouvert. Vérifiez le navigateur par défaut puis réessayez.',
    CODEX_MISSING: 'L’exécutable natif Codex Windows x64 est introuvable dans l’installation npm standard. Installez ou réparez Codex puis vérifiez à nouveau.',
    CODEX_INVALID: 'L’installation native Codex n’a pas pu être validée. Réparez l’installation npm Windows x64 puis réessayez.',
    PROBE_FAILED: 'Le petit tour de vérification Codex n’a pas abouti. Le compte peut rester enregistré ; le forfait n’est pas déclaré vérifié. Vérifiez le réseau du processus Codex puis réessayez explicitement.',
    STOP_UNCONFIRMED: 'L’arrêt du processus Codex n’est pas confirmé. Le résultat reste inconnu. Vérifiez son arrêt avant de demander un nouveau témoin.',
    APP_CLOSING: 'Madness se ferme. Aucun nouveau travail n’est démarré.',
    BUSY: 'Une opération de connexion est déjà en cours.',
    NO_ACCOUNT: 'Aucun compte n’est enregistré. Continuez avec ChatGPT pour en connecter un.'
  } satisfies Record<ConnectionErrorCode, string>,
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
