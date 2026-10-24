# Premier dialogue Mary — pilote personnel

Le dialogue réel est confirmé le 24 octobre 2026 dans le paquet final : accueil/menu de l’agent Mary installé, deux resolvers exécutés, réponse libre dans la même conversation, sortie de rôle et arrêt natif. Les trois messages de test et trois réponses sont conservés avec le brouillon après réouverture, sans moteur relancé. `live-profile.json` et `live-transcript.md` portent cette preuve ; aucune donnée d’un projet de travail n’a été utilisée.

L’installation locale est mise à jour et relue : `installed-profile.json` confirme le même hash d’archive que l’essai réel, le compte et l’historique préservés, puis la qualification du dépôt Madness sans réseau ni modèle. La livraison est `dist/dialogue-pilot/Madness-0.1.0-x64-setup.exe`. Le dossier témoin contenant l’échange réussi reste accessible dans les projets récents ; les cinq entrées vides des essais précédents ont été retirées sans supprimer de dossiers ni de conversations.

Le banc isolé vérifie les frontières et la conservation sans compte ni fournisseur. Ses rapports compilé et paquet, captures bureau/compact, sont distincts d’une preuve réelle de discussion.

`verification.json` rassemble 112 tests réussis, types/build/paquet, 8 contrôles compilés et 8 du paquet, 4 régressions Windows, revue Quick puis relecture sans constat restant. Les captures `isolated-*` et `support-*` utilisent des données synthétiques ; seules `live-*` montrent le dialogue réel. Une inspection initiale puis une confirmation groupée bureau/compact ont été réalisées. Le menu est affiché en texte Markdown non interprété ; un rendu enrichi reste à prévoir.

Le profil d’installation, les resolvers BMad et le runtime externe sont épinglés dans `profile.ts` et `runtime.ts`. Une modification de ces éléments bloque le pilote et demande une requalification. Le runtime Codex Python/UV est un prérequis local ; il n’est pas embarqué dans l’installateur Madness.

Les échanges persistés restent dans le snapshot v1 existant. Le renderer n’expose ni jeton, ni RPC natif, ni lecture ou commande générique. Aucun droit d’écriture projet et aucun envoi automatique ne sont accordés. Les workflows du menu de Mary restent hors pilote.

En cas d’erreur réseau, le panneau Codex propose l’adresse publique fixe des clés OpenAI, son ouverture dans le navigateur Windows et une icône de copie avec confirmation. Pendant l’essai, Zscaler a refusé cette ressource ; son ouverture par le porteur dans son navigateur a été suivie d’un GET Main direct réussi. Aucun contenu de navigateur, cookie ou credential n’a été copié ; les protections TLS et de redirection restent actives. Ce constat ne qualifie pas tous les réseaux d’entreprise.

Reproduction et limites détaillées : `docs/development.md`, section pilote personnel. Les plans 1.1/1.2 et les anciennes preuves restent inchangés ; le pilote ne clôt pas la story 1.3 ni le périmètre distribué.

Nettoyage après essais : les cinq anciens dossiers témoins sans référence, sept scripts ponctuels de diagnostic/qualification et deux captures en double ont été supprimés de `.g0-qualification/`. Les captures canoniques restent dans ce dossier de preuves. Seul `mary-live-SVd68E` est conservé dans l’espace d’essai, car le projet demeure lié à l’historique et à un brouillon ; le profil utilisateur n’a pas été modifié.
