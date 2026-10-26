# Qualification de la conversation progressive

Ce dossier distingue les tests isolés du parcours natif installé. Le plan 1.4 reste la source d’intention ; les anciens gates, plans bloqués et preuves sont préservés.

| Preuve | Portée |
|---|---|
| `compiled-profile.json` | Vrai main/preload/renderer compilés ; progression injectée et clairement synthétique, identité, ancrage, saisie, états partiels, limites de fenêtre et réouverture. |
| `packaged-profile.json` | Mêmes contrôles sur le paquet `dist/conversation-pilot/`, empreinte de l’archive incluse. |
| `compiled-*.png` | Captures groupées bureau/compact sur données synthétiques, sans compte. |
| `live-protocol.md`, `live-profile.json` | Preuve native distincte possédée par le parent : progression réelle puis arrêt et réouverture. Aucun succès n’est déduit des bancs synthétiques. |

Le banc `scripts/qualification/conversation.mjs` injecte des événements typés dans le canal Main autorisé, puis ferme l’application avant d’exercer séparément le cœur source et son véritable stockage Snapshot v1. Les deux items de texte identique sont conservés. La relance du programme lit ces octets sans modèle ni réseau ; l’identité et l’état du tour redeviennent inconnus. L’injection ne constitue pas une preuve du connecteur natif complet ; les tests de protocole et la preuve native gardent cette portée explicite.

Les seuls restes du banc sont ces preuves. Son profil temporaire, ses données et son projet témoin sont retirés après fermeture du processus possédé, même en cas d’échec. Un processus dont l’arrêt n’est pas confirmé empêche le nettoyage et reste signalé dans le rapport.

## État de la preuve native

Paquet final installé : archive 3f7186d6122e412bafbbb5c5027b4c9d5daee756442ecc49e36d92b631f0c97b. Les contrôles natifs requis du plan passent : premier tour avec texte réellement visible avant sa fin et brouillon gardé, puis arrêt et réouverture exacte sans moteur. Trois tours distincts terminent, 800 deltas et quatre items assistant ; aucun replay. Les suivis 2/3 sont conservés, mais leur progression n’a pas été capturée par le polling de 100 ms et les lectures DOM successives. Le rapport conserve ces deux limites de mesure ; elles ne prouvent ni absence de progression ni buffering réseau. Le premier tour satisfait le critère natif du plan, les cas de flux concurrents restant couverts séparément par les tests.

Les premiers essais avaient échoué avec NETWORK_UNAVAILABLE dans acquireDialogue avant tout processus Codex. Ils restent séparés dans live-attempt-before-session-restart.json et live-before-final-package.json. Après confirmation humaine du JSON public dans Edge, le nouvel essai observe GET des clés200 et POST du jeton200. Aucune causalité n’est déduite pour les erreurs de capacité des autres outils. Le contrôle automatique d’Edge a été arrêté faute d’URL courante vérifiable ; aucun contournement TLS,proxy ou redirection.

Les quatre captures compilées précèdent les correctifs de l’adaptateur, mais les quatre fichiers renderer restent byte-identiques après build : renderer-continuity.json. Les rapports précédents restent dans *-before-review.json ; les rapports courants qualifient le paquet final. Aucun nouveau détecteur ni nouvelle chasse visuelle.

Le témoin C:/Sources/madness/.g0-qualification/conversation-live-4259ad02 reste lié à son nouveau projet, sa conversation et son brouillon synthétique : il est conservé. Les profils jetables sont nettoyés. Données antérieures et annexes Forge préservées ; Snapshot v1 reste id/role/text, identité et état du tour inconnus après réouverture. Distribution,gates,anciens plans bloqués et acceptation visuelle globale restent distincts.
