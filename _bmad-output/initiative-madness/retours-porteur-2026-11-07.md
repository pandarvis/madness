# Retours du porteur — essai libre du paquet 0.2.23 (7 novembre 2026)

Essai libre de Kévin, en débutant, sur l'installation `%LOCALAPPDATA%\Programs\Madness` (ASAR `64fc47d6…`). Ces retours alimentent la qualification humaine 3.10.

## Accueil

1. **Ouvrir un dossier n'est pas intuitif.** Le seul accès visible est l'icône de dossier, sans libellé, en haut à droite de la barre de titre.
2. **La carte « Commencez par un dossier » est coupée à droite** (fenêtre d'environ 1630 px de large). Son bouton d'ouverture et le logo Codex ne sont pas visibles. Il faut vérifier s'il s'agit d'un débordement de mise en page.
4. **Rien n'indique si un LLM est branché.** Au premier lancement, l'accueil ne montre ni l'état de la connexion (Codex ou Claude Code), ni comment l'établir. Le porteur juge cette première approche « pas terrible ». Il faut un état de connexion visible en permanence et une première étape guidée.
5. **Décision : retirer le thème clair.** Madness devient sombre uniquement. Cela change l'exigence clair/sombre de l'epic 2 (livrée en 2.14) : il faudra mettre à jour l'initiative, les critères qui citent « deux thèmes » (dont 6.2) et les tests de variantes.
6. **Idée : « dynamic island » du fournisseur.** Une icône du LLM actif se déploie au survol pour montrer les logos Anthropic (Claude Code), Codex et GitHub Copilot. Un clic choisit le fournisseur. Si ce fournisseur n'est pas configuré, le clic ouvre l'onglet Réglages. Cela rejoint la 6.2 (sélecteur et Réglages), mais GitHub Copilot est un nouveau fournisseur, hors du périmètre V1 actuel (Codex, plus l'epic 6 Claude Code) : il lui faut son propre epic.
7. **L'onglet Réglages est introuvable.** Il est prévu en 6.2 et n'existe pas encore dans le paquet.
3. **Le texte d'accueil est périmé :** « L'initialisation reste à venir » alors que l'initialisation est livrée (epic 3).
