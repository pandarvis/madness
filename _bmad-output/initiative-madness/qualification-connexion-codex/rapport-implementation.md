# Connexion Codex locale — livraison à la revue, 24 octobre 2026

Le parcours du plan indépendant est implémenté : logo grisé, panneau non modal français, navigateur Windows, OAuth SIWC indépendant avec JOSE, coffre chiffré Windows et témoin Codex natif possédé. Après la revue et ses corrections, **le consentement humain et le tour fournisseur réel ont réussi** dans le paquet final. La réalisation personnelle locale est qualifiée ; les gates du produit distribué restent ouverts.

## Résultats observés

| Contrôle | Résultat | Preuve |
|---|---|---|
| `npm test` | 83 tests réussis, 0 échec ou ignoré ; 41 nouveaux tests connexion | `tests.txt` |
| `npm run build:win` | Types, build, paquet Windows x64 et installateur NSIS réussis | `build.txt` |
| `node scripts/qualification/connection.mjs` | 9 contrôles Electron compilé, profil nettoyé, réseau fournisseur nul pendant le scénario d’annulation | `profile.json` |
| `node scripts/qualification/connection.mjs --packaged --no-captures` | 9 contrôles du paquet, DPAPI réel et nettoyage réussis | `packaged-profile.json` |
| `node scripts/qualification/windows.mjs --skip-screenshots` | 15 régressions G0 réussies, nettoyage confirmé ; captures G0 historiques non refaites | `../tickets/epic-boucle-codex/qualification-g0/profile.json` |
| Détecteur Impeccable | Une invocation, résultat `[]` ; pas de relance après la correction neutre demandée | Sortie observée par le contrôleur |
| Inspection visuelle | Paire bureau/compact inspectée, une seule confirmation corrective : annulation rendue neutre | `connection-desktop.png`, `connection-compact.png` |
| `git diff --check` | Réussi ; seules notifications de conversion LF/CRLF du dépôt | Contrôle final |

Les contrastes mesurés dans Electron sont 14,61:1 pour le texte, 5,87:1 pour le secondaire, 5,95:1 pour l’erreur et 6,59:1 pour l’action principale/focus. Le panneau mesure 22 px de retrait, 12 px de rayon, titre 19 px et corps 13 px ; ses dimensions restent bornées à la fenêtre. Ces contrôles ne constituent pas un audit WCAG ou un essai lecteur d’écran.

## Réalisation

- `src/contracts/connection.ts`, port cœur et preload : commandes sans payload libre, projection stricte sans secret, identité exacte fenêtre/frame/URL contrôlée dans Main. Le snapshot v1 et sa capacité de dialogue BMad indisponible restent inchangés.
- `src/adapters/codex/oauth.ts` : listener loopback éphémère, state/nonce/PKCE neufs, client émis conservé, scopes requis, signature RS256 et claims OIDC dont partie autorisée contrôlés. Requêtes Main bornées à 15 secondes/256 Kio ; attente humaine OAuth de dix minutes, annulation immédiate même si l’ouverture navigateur ne répond pas.
- `vault.ts` : `safeStorage` injecté par Main, credentials chiffrés hors snapshot, inscription non secrète séparée, remplacement synchronisé/atomique et refus des octets corrompus ou modifiés.
- `probe.ts` : exécutable natif Windows x64 détecté uniquement dans l’installation npm standard, chemin/manifeste/PE contrôlés ; profil et CWD vides hors dépôt ; seul environnement du child reçoit l’access token. Le catalogue ne vaut pas preuve : item assistant et tour terminés corrélés puis arrêt confirmé sont requis. Outils/MCP/shell/web et rejeux réseau sont désactivés ; demandes serveur refusées. Aucun wrapper Node utilisé.
- `connection.ts`, coordinateur et fermeture : opérations longues hors queue de persistance, arrêt lancé avant de vider cette queue, résultat inconnu conservé et double fermeture idempotente. Aucun lancement, refresh ou réseau à la restauration.
- Renderer : panneau, états/récupérations, annulation, vérification, déconnexion locale, rappel acquittable une fois et gestion d’usage via URL officielle fixe. Logo officiel local et origine dans les notices ; documentation technique, contrats UX et memlog complétés.

Le mapping précis vers les cinq scénarios de la matrice et les critères UX/bridge se trouve dans `matrice-tests.md`.

## Réserves transmises

La revue Quick indépendante et le contrôle du parent ont produit sept constats, tous corrigés : sauvegardes déjà en queue à la fermeture, arrêt --version inconnu, sortie du rappel après erreur du coffre, inconnue conservée après déconnexion, Échap du tiroir actif, mutations du coffre attendues et callback de réautorisation sans client_id. La vérification complète ci-dessus a été exécutée à nouveau après ces patches ; aucun constat correctif différé. Les captures antérieures de la passe bornée restent conservées, sans nouvelle passe visuelle.

Le parent a ensuite ouvert un essai humain avec le paquet final et le profil utilisateur Madness normal, afin de conserver la connexion chiffrée. La projection positive est figée dans `live-confirmed-profile.json` ; le statut courant ignoré ne remplace pas cette preuve. Le mode automatisé sur profil jetable reste disponible.

La preuve live est désormais **positive pour l’usage personnel local** : `live-confirmed-profile.json`, mode `live-user-profile`, vérification à `2026-10-24T11:46:51.773Z`, Codex 0.144.6, compte enregistré et rappel acquitté. Cette projection est figée séparément du statut courant `live-profile.json` ignoré par Git. Le code n’annonce verified qu’après validation cryptographique, tour terminé corrélé et arrêt natif confirmé. Le SHA-256 du paquet lie cette projection à l’implémentation contrôlée. Le navigateur système est utilisé ; aucun credential, identité, code OAuth ou texte natif n’a été lu par le banc. Le profil utilisateur est conservé, la fenêtre est laissée au porteur. Aucun réseau ni consentement n’est simulé pour cette preuve.

Le réseau Main et le réseau du processus Codex ont fonctionné pour cet essai réel sans affaiblissement TLS ; cela ne qualifie aucun autre réseau ou poste. L’éligibilité de distribution du client fermé, les minima Windows, le tracer BMad et les gates 1.1/1.2 restent ouverts dans leurs plans historiques. Aucune licence du produit n’est choisie ; le SDK non commercial n’est pas incorporé. Installateur non signé, non installé pendant ce lot. Aucun échec automatique ni constat correctif restant.
