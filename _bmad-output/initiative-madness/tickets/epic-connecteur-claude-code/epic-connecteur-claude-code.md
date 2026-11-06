---
type: epic
title: "Dialoguer avec Claude Code sur son abonnement"
parent: initiative-madness
covers: ["R34"]
sources: ["_bmad-output/initiative-madness/initiative-madness.md"]
companions: ["_bmad-output/initiative-madness/architecture-madness/architecture-madness.md"]
refined: true
risk: high
---

# Dialoguer avec Claude Code sur son abonnement

## Description

Ajouter un connecteur local pour la CLI officielle Claude Code installée sur le poste Windows. Le porteur s’authentifie dans Claude Code et Madness lui permet d’ouvrir un échange BMad avec cette connexion personnelle. Le [témoin CLI](qualification-cli-personnelle.md) établit la faisabilité locale du premier appel.

## Outcome

Depuis un projet BMad existant, le porteur choisit Claude Code, envoie un message et retrouve la réponse sous le fournisseur et le projet d’origine. L’état de connexion et les capacités sont visibles.

## Requirements

- R1 (R34) — Détecter la CLI et distinguer installation, abonnement connecté, absence de connexion ou mode différent. Lancer un échange explicite avec la CLI publiée. Confiner le périmètre aux capacités qualifiées, observer le résultat et l’arrêt du processus, conserver la conversation par le port commun.
- R2 (R34) — Choisir Claude Code dans l’interface existante et afficher son état, son nom accessible et son nouveau logo lorsque l’actif et ses droits sont établis. Chaque conversation reste liée à son fournisseur initial.

## Constraints

- C1 (C4, C6, C7) — Usage personnel local Windows. L’authentification et les secrets appartiennent à Claude Code. Aucun OAuth propre à Madness, collecte de jetons, changement implicite de facturation, configuration de proxy ou bascule vers une clé API. Une connexion native manquante est une action explicite du porteur.
- C2 (C1, C5) — Charte existante, français et anglais, thèmes clair et sombre. Le badge nomme Claude Code comme fournisseur. Si l’actif officiel ou ses droits manquent, la présentation textuelle reste disponible et le logo reste ouvert.
- C3 (C3, C6) — Une première conversation en lecture seule suffit au témoin. Aucun outil d’écriture, script, plugin ou hook hérité du projet dans ce profil. La reprise passive ne lance aucun moteur. Le développement de 6.1 et 6.2 suit le même ordre de travail sur le cœur et l’interface partagés.

## Done when

1. Le parcours local va de la détection et du choix explicite jusqu’à une réponse BMad réelle dans Madness. Le résultat, le fournisseur et le projet se retrouvent après fermeture et réouverture. Absence du programme, mauvais mode de connexion, arrêt et échec réseau ont des états propres. Rejouer ce parcours sur le prochain paquet Windows qui inclut le connecteur avant de l’annoncer livré.
2. Le contrôle de fournisseur est lisible au clavier et dans les deux langues et thèmes. Le logo officiel est relié à son actif et à son autorisation, ou le point reste ouvert avec une identification textuelle.

## Boundaries

- Extension après le socle Codex. Bedrock, Copilot, prise en charge des sessions externes et écritures Claude relèvent de lots distincts.
- Le champ USD retourné par Claude Code est une piste pour l’epic 5. La comparaison avec la facturation de l’abonnement et sa portée par tour nécessitent leurs propres preuves.

## References

- [Initiative, R34](../../initiative-madness.md)
- [Architecture, connecteurs et identité](../../architecture-madness/architecture-madness.md)
- [Témoin Claude CLI sur abonnement](qualification-cli-personnelle.md)
- [Coût USD par US et epic](../epic-couts-usd/qualification-source-usd.md)

## Notes

- Decision: 2026-11-06 — Partir de la CLI personnelle déjà connectée. Vérifier d’abord le chemin de bout en bout dans Madness. Présenter Claude Code comme fournisseur distinct. La story 6.1 est le premier parcours complet. La 6.1 inclut une commande explicite minimale. La CLI et sa connexion sont déjà présentes sur le poste témoin. La 6.2 rend le choix de fournisseur complet et accessible et la 6.3 isole l’ajout du logo officiel pour que son sourcing n’empêche pas le dialogue.
- Open question: actif exact du nouveau logo et conditions autorisant son incorporation dans Madness.
