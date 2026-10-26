import type { ErrorCode } from '../../contracts/index.ts'
import type { ConnectionErrorCode, ConnectionStatus } from '../../contracts/connection.ts'
import type { DialogueErrorCode, DialogueStatus } from '../../contracts/dialogue.ts'
/** Base française acceptée. Les variantes attendent les contrats de Sally. */
export const fr = {
  app: 'Madness', home: 'Accueil', open: 'Ouvrir un projet', recent: 'Projets récents',
  save: 'Enregistrer le brouillon', saving: 'Enregistrement…', saved: 'Brouillon enregistré localement.',
  unsaved: 'Modification non enregistrée.', noDraft: 'Aucun brouillon enregistré.',
  codexReason: 'Connectez votre forfait ChatGPT depuis le logo Codex, puis ouvrez un projet pour discuter avec Mary. Chaque lancement et chaque envoi restent explicites.',
  networkHelp: { title:'Vérifier l’accès aux clés publiques',description:'Si vous utilisez un réseau d’entreprise, ouvrir cette page dans votre navigateur peut aider à vérifier son accès. Cette aide ne garantit pas le rétablissement de la connexion.',copy:'Copier l’adresse des clés publiques',open:'Ouvrir dans le navigateur Windows',copied:'Adresse copiée.',opened:'Ouverture demandée dans votre navigateur Windows.',copyFailed:'La copie n’a pas abouti. Sélectionnez l’adresse ci-dessus pour la copier manuellement.',openFailed:'Le navigateur Windows n’a pas pu être ouvert. Copiez l’adresse puis ouvrez-la manuellement.' },
  dialogueStatus: { idle: 'Aucun agent lancé', qualifying: 'Vérification du profil BMad', qualified: 'Profil BMad qualifié', starting: 'Démarrage de la session', running: 'L’agent travaille', ready: 'Tour terminé · à vous de répondre', stopping: 'Arrêt de Codex en cours', stopped: 'Processus Codex arrêté', error: 'Le tour n’a pas abouti', unknown: 'Résultat ou arrêt inconnu' } satisfies Record<DialogueStatus, string>,
  dialoguePrerequisites: { account:'Connectez d’abord votre compte dans le panneau Codex.',plan:'Acquittez le rappel du forfait avant le lancement.' },
  dialogueErrors: {
    OUTPUT_REFUSED:'La lecture, l’écriture ou la copie demandée est refusée. Les chemins autorisés restent affichés ; sélectionnez le texte pour une copie manuelle si nécessaire.',
    OUTPUT_CONFLICT:'Le fichier ou la session existe déjà, ou ses octets ont changé. Ils sont préservés. Aucun effet ne sera rejoué ; examinez les chemins observés.',
    EFFECT_UNKNOWN:'Une opération a commencé mais son effet durable n’est pas confirmé. Le tour est arrêté. Examinez les fichiers et les observations avant toute nouvelle action ; aucun effet ne sera rejoué.',
    RESUME_UNSUPPORTED:'Une session Forge inachevée existe dans la sortie BMad. Ce pilote sait créer une nouvelle idée ; sa reprise n’est pas prise en charge. Aucun modèle n’a été lancé.',
    INVALID_COMMAND: 'La demande de dialogue n’est pas reconnue. Rouvrez le projet.', UNTRUSTED_CALLER: 'Cette fenêtre n’est pas autorisée à lancer un dialogue.', BUSY: 'Un dialogue est déjà en cours. Retrouvez son projet ou arrêtez-le avant de lancer une nouvelle session.', APP_CLOSING: 'Madness se ferme. Aucun nouveau tour ne sera lancé.', PROJECT_NOT_FOUND: 'Le projet n’est plus connu. Rouvrez son dossier.', CONTEXT_MISMATCH: 'La réponse ne correspond pas à la conversation active. Votre saisie est conservée ; retrouvez le bon projet.', PROFILE_ABSENT: 'Les fichiers BMad nécessaires à cette action sont absents. Choisissez un projet possédant l’installation locale qualifiée.', PROFILE_UNRECOGNIZED: 'Ce profil BMad ou ses personnalisations ne sont pas couverts par le pilote. Aucun modèle n’a été appelé pour cette qualification.', PROFILE_CHANGED: 'Le profil BMad a changé. Le lancement est bloqué ; requalifiez l’installation avant de réessayer.', RESOLVER_FAILED: 'Les resolvers BMad ou le runtime Python/UV qualifié sont indisponibles. Vérifiez les prérequis locaux décrits dans la documentation développeur.', NO_ACCOUNT: 'Le compte Madness est absent ou son accès doit être renouvelé. Arrêtez la session puis reconnectez Codex depuis le logo.', PLAN_ACK_REQUIRED: 'Acquittez le rappel du forfait avant le lancement.', CONNECTION_BUSY: 'Une opération Codex est déjà en cours. Terminez-la avant de lancer une nouvelle session.', PROVIDER_FAILED: 'Le tour Codex n’a pas abouti. Son résultat n’est pas confirmé. Les échanges enregistrés et votre brouillon restent disponibles ; aucun tour ne sera rejoué.', UNSUPPORTED_INTERACTION: 'Cette demande exige une capacité indisponible dans cette session. Le tour est arrêté ; aucune réalisation non observée n’est annoncée.', CANCELLED: 'Le tour a été interrompu. Aucun envoi ne sera relancé automatiquement.', STOP_UNCONFIRMED: 'L’arrêt natif n’est pas confirmé. Aucun nouveau dialogue ne peut être lancé pendant cette session ; vérifiez le processus avant de redémarrer Madness.', STORAGE_READ_FAILED: 'Le contexte local ne peut pas être lu. Les fichiers sont préservés. Vérifiez le stockage avant de réessayer.', STORAGE_WRITE_FAILED: 'L’enregistrement du tour a échoué. Le résultat durable n’est pas confirmé. Conservez votre saisie et vérifiez le stockage ; aucun envoi n’est rejoué.'
  } satisfies Record<DialogueErrorCode, string>,
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
