# Connexion Codex locale — référence d’implémentation, 24 octobre 2026

Le porteur demande un logo grisé dans la barre et le passage à la connexion Codex. Cette réalisation autonome est distincte de l’ancien essai natif 1.1, dont le plan et les preuves restent historiques. Elle ne valide ni G1 distribué ni le tracer BMad 1.3.

Sources officielles consultées aujourd’hui :

- https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in
- https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server
- https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations
- https://learn.chatgpt.com/docs/app-server
- https://github.com/openai/sign-in-with-chatgpt-devkit

La documentation présente SIWC pour les outils open source et projets personnels locaux ; l’éligibilité du nouveau client gratuit fermé distribué reste à établir. Ne pas choisir une licence à la place du porteur. Le SDK du DevKit est sous licence non commerciale, avec définition qui dépasse la seule gratuité ; ne pas incorporer son code dans Madness. Implémenter indépendamment le protocole documenté, en utilisant une bibliothèque JOSE standard pour la validation cryptographique, sans réimplémenter les signatures. Aucun jeton ChatGPT existant ni profil Codex usuel ne doit être lu/copîé. Aucun secret API ou facture plateforme implicite.

## Protocole

Bibliothèque JOSE : `npm view jose version --json --fetch-retries=0 --fetch-timeout=15000` observé `6.2.12` le 24 octobre ; utiliser les dépendances épinglées du dépôt. Les requêtes npm nécessitent l’escalade réseau sur cet hôte ; ne pas attendre les retries du sandbox. Le paquet natif est présent sous `%APPDATA%/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64` (le vérifier avant spawn).

`codex.exe --version` observé `codex-cli 0.144.6`. Sans CODEX_HOME explicite même cette commande tente de créer ses alias sous le profil usuel (accès refusé pendant l’observation) : toutes les exécutions du nouveau connecteur, y compris version et aide, doivent donc fournir son environnement isolé.

- Main ouvre d’abord un listener HTTP exclusivement `127.0.0.1`, port éphémère, chemin `/auth/callback`. Même redirect URI exacte dans autorisation/échange. Écoute bornée, annulation et fermeture ferment listener et requêtes.
- Attente humaine OAuth : dix minutes, avec annulation explicite ; conserver des limites courtes distinctes pour les requêtes réseau. L’ancien callback disparu avant consentement motive cette marge UX. Les tests injectent un délai bref.
- `state`, nonce OIDC et PKCE S256 aléatoires neufs. Navigateur Windows par `shell.openExternal` uniquement, destination d’autorisation fixée par Main. Aucun URL/arbitraire ou code OAuth dans le renderer, les journaux ou les rapports.
- Première inscription : client_id `dynamic_agent_client`, agent_name_hint `Madness`, ext_agent_host_id `urn:uuid:<UUID>` stable par installation. À la reconnexion conserver l’issued client ID `oaiapp_*` et ce host ID, même après déconnexion locale.
- Autorisation `https://auth.openai.com/api/accounts/authorize`, response_type code, scopes `openid profile email offline_access resource.invoke chatgpt.tokens.use.direct`, resource `https://api.openai.com/v1`, code_challenge_method S256.
- Vérifier état, unicité des paramètres, erreurs et client_id retourné avant échange ; inscription initiale exige client_id émis, reconnexion refuse un autre client_id. Callback inattendu ne termine pas la session attendue. Réponse HTML statique sans données sensibles, referrer-policy no-referrer, cache-control no-store.
- POST form `https://auth.openai.com/api/accounts/oauth/token`, grant_type authorization_code, client_id émis, code, code_verifier, redirect_uri et resource. Refresh explicite : grant_type refresh_token avec client_id/resource et refresh_token ; conserver une rotation atomiquement. Requêtes avec limites de temps et taille, sans redirection libre. Ne jamais désactiver TLS ; réseau Main Electron pour certificats/proxy système.
- Valider signature ID token via JWKS officiel (`https://auth.openai.com/.well-known/jwks.json` : confirmer avec découverte OIDC si nécessaire), iss `https://auth.openai.com`, aud client_id émis, exp, nonce et sub. Ne jamais se contenter de décoder un JWT. La réponse OAuth fait autorité pour les scopes consentis ; login seul ne prouve pas usage du forfait. Refuser un profil de reconnexion d’identité différente.
- Jetons et données d’identité uniquement Main : `safeStorage` Windows, refus si chiffrement indisponible, fichier de credentials chiffré atomique dans userData distinct du snapshot. Aucun fallback clair. Registration non secrète séparée. Lecture/restauration locale n’effectue aucune connexion ni relance automatique.

## Témoin Codex

Exécutable natif Codex directement possédé (pas wrapper Node), trouvé seulement dans l’installation locale standard connue et validé avant spawn, `shell:false`, `windowsHide:true`. Éviter un processus descendant non observable. Préserver l’ancien banc et ses résultats. Versions observées dans le nouveau rapport seulement.

`ACCESS_TOKEN` est injecté après assainissement de l’environnement uniquement dans `env` du child ; jamais argument, fichier Codex ou modification de `process.env`. Profil Codex isolé dans userData, cwd témoin vide hors dépôt, aucun serveur MCP ou outil. App-server stdio :

```text
model_provider="openai_chatgpt_plan"
model_providers.openai_chatgpt_plan.name="ChatGPT plan"
model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"
model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"
model_providers.openai_chatgpt_plan.wire_api="responses"
model_providers.openai_chatgpt_plan.requires_openai_auth=false
model_providers.openai_chatgpt_plan.supports_websockets=false
```

Initialize avec identité Madness ; catalogue n’est pas preuve d’entitlement. Un thread éphémère lecture seule, approbation never, shell/web désactivés ; modèle par défaut visible ; tour court à marqueur fixe, item assistant completed ET turn completed corrélés. Refuser toutes demandes serveur inattendues et ne rien exécuter. Vérification réussie seulement après arrêt natif confirmé ; sinon résultat inconnu. Annulation/fermeture interrompent requêtes et child, attente d’arrêt bornée. Pas de rejeu automatique d’un tour incertain. `Application.shutdown` attend sa queue : ne pas y placer un long OAuth qui bloquerait l’annulation.

## Interface et tests

Complément de la source https://developers.openai.com/siwc/ui-ux-guidelines : l’action initiale se nomme « Continuer avec ChatGPT » ; expliquer avant le témoin que celui-ci consomme le forfait. Après première connexion avec permission forfait, afficher une confirmation acquittable « Vous utilisez votre forfait ChatGPT », une seule fois, et proposer l’accès à la gestion d’usage dans les paramètres ChatGPT via une URL officielle fixe vérifiée. N’inventer aucun quota ou solde. Pour cette petite surface, conserver ces informations dans le panneau et une confirmation protégée au premier succès ; ne pas créer de page facturation.

URL fixe vérifiée en suivant le lien officiel « Manage usage » de cette page : `https://chatgpt.com/settings/usage`.

Un contrôle icône dans la barre ouvre un panneau de connexion non modal, clavier/Escape/focus retour, statut textuel dans ce panneau et nom accessible/infobulle. Signe OpenAI officiel utilisé pour identifier la connexion Codex via ChatGPT ; source SVG : https://raw.githubusercontent.com/openai/sign-in-with-chatgpt-devkit/main/assets/brand/chatgpt-button-black-21.svg (marque distincte du code SDK, attribution et origine à conserver). Gris à froid ; une vérification réussie porte sa portée, pas une promesse de conversation BMad. Conserver l’ouverture projet unique et la navigation existante. Les libellés actuels « La connexion viendra ensuite » devront refléter la nouvelle possibilité.

Bridge métier de connexion dédié et versionné possible, avec validation stricte entrée/sortie/caller et notifications sans secrets ; ne pas fragiliser les contrats/snapshot v1 ni leur `capabilities.codex.available:false` pour le dialogue BMad encore non qualifié. État initial déconnecté ou connexion enregistrée à vérifier, attente navigateur, vérification, succès daté, erreur récupérable/annulation/inconnu ; pas de vert à partir d’un catalogue ou d’un login seul. Fournir annuler, vérifier et déconnecter localement.

Tests avec injections isolées : clés JWT de test/signature réelle, callback invalide, refus, scopes, identité, corruption du coffre, annulation/délais/arrêt, flux bridge ; aucun mock de succès présenté comme preuve live. Qualifications Electron avec profil isolé ; consentement réel dans navigateur système demeure humain. Aucun secret, identité, OAuth URL/code ni réponse brute dans les captures/rapports.
