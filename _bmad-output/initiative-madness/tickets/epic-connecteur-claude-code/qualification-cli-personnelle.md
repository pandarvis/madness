# Témoin local de Claude Code sur abonnement

Le 6 novembre 2026, le programme Claude Code 2.1.318 présent sur le poste a déclaré une connexion active `claude.ai`, fournisseur `firstParty`. Le témoin a lancé un seul `claude -p` en mode restreint depuis un dossier vide temporaire, avec outils désactivés, configuration MCP vide et persistance de session désactivée. Le prompt synthétique n’incluait aucun fichier du projet. Le dossier a été retiré après exécution.

| Mesure | Valeur observée |
| --- | --- |
| Sortie | Code 0, JSON `result/success`, réponse témoin attendue |
| Tours et durée | 1, 2 641 ms rapportées par la CLI |
| Champ `total_cost_usd` | 0.0250378 |

Le montant est une valeur émise par le programme. Le test ne prouve aucun prélèvement sur l’abonnement et n’établit pas le comportement des reprises de session ou la déduplication des montants. Aucun identifiant de compte, jeton ou identifiant natif de session n’est conservé.

Le test s’est déroulé directement en CLI. Il ne qualifie pas un parcours dans Madness. Le connecteur personnel doit réutiliser le programme officiel et son mécanisme d’authentification natif. L’aide Anthropic indique que l’usage en mode connecté à un forfait Claude compte dans ses limites. Les conditions applicables aux produits et aux marques restent distinctes du succès technique du témoin.

- [Abonnement et mode CLI](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)
- [Référence des options CLI](https://code.claude.com/docs/en/cli-reference)
- [Résultat et champ USD](https://platform.claude.com/cookbook/claude-agent-sdk-04-migrating-from-openai-agents-sdk)
- [Connexion et marque](https://code.claude.com/docs/en/legal-and-compliance)
