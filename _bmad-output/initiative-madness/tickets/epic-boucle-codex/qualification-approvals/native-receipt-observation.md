# Reçu natif1.6 — observation après rétablissement réseau

Le GET Main retourne200 après le clic Zscaler confirmé ; ne pas répéter la question JSON. Les nouvelles erreurs ci-dessous sont des erreurs de corrélation, pas de connexion.

## Faits mesurés

Même runner0.144.6, SHA2564b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7. Essai personnel `live-final-profile.json` : accueil Mary réussi, un accord ponctuel sur trois fichiers, événement natif fileChange completed ; tous les octets/existences correspondent aux trois afterSha256 annoncés. Le produit reste unknown, car son résultat attend un raw du même call_id que l’item fichier.
Sonde distincte native-receipt-probe.json : une nouvelle proposition, un seul refus, événement natif fileChange declined et fichier inchangé vérifié dans native-receipt-effects-audit.json. Le raw réellement reçu est custom_tool_call_output avec output tableau input_text et enveloppe Script failed / Script error: patch rejected by user. Son call_id hash diffère de celui de l’item fichier. La sonde garde une réserve PRIVATE_DRAFT_CHANGED concernant son propre projet réutilisé ; aucun succès global n’en est déduit.
Le diagnostic sans compte protocol-model-profile-detail.json montre les outils dans input.additional_tools, avec exec englobant apply_patch ; ils ne sont pas dans la propriété top-level tools. Désactiver seulement code_mode_host ne change pas cette offre. Pas de modification produit/flags à partir de cette hypothèse réfutée.

## Correction locale retenue pour la relecture

Le reçu d’opération est l’événement natif item/completed de type fileChange, du même thread/tour/item que la proposition et la demande. Après une décision explicitement transmise, ce statut ET la relecture de tous les octets/existences sont indispensables. completed ne peut réussir qu’après accept, declined qu’après decline ; aucun succès depuis texte du modèle, raw d’un autre appel, accord seul ou fichiers seuls. Sans événement natif corrélé, garder unknown et arrêter.
Le raw d’un appel englobant ne prouve pas l’issue de chaque opération interne et peut omettre ses sorties. Il reste diagnostique seulement lorsqu’il est réellement corrélé. ApprovalResult.raw accepte déjà la chaîne vide : ne pas inventer de sortie pour la remplir. Garder nativeStatus, les résultats fichier et les contrôles avant accord. Aucun nouveau champ public, droit, commande, shell, statut ou pont. Les reçus de questions1.5 ne changent pas.
Régression obligatoire : succès/refus depuis fileChange natif + relecture avec raw englobant autre ID et output tableau, y compris raw absent ; raw seul sans fileChange ne vaut rien, mauvaise opération/statut/effets restent refusés ou inconnus. Confirmer aussi un vrai runner avec modèle loopback appelant exec -> tools.apply_patch, sans compte ; conserver le profil direct déjà mesuré. Ce passage n’accorde aucune distribution ni clôture de gate.

La première sonde de callback ancien/nouveau a été interrompue : son faux port résolvait le résultat au lieu de le rejeter à l’arrêt natif, maintenant une settlement artificiellement bloquée. Aucun défaut produit déduit de cette tentative. Reproduction corrigée avec rejet CANCELLED comme le vrai adaptateur, et délai de test borné5s.
