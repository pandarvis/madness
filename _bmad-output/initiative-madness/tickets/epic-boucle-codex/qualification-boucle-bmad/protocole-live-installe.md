# Essai réel installé restant — Forge

Ce protocole prépare la preuve manquante. Il ne prouve aucune exécution modèle, installation ou acceptation humaine. Le parent conduit cet essai après fermeture de tous les bancs UI. Ne pas exécuter le HTML.

## Avant l’essai

- Vérifier la fermeture des processus Madness et la préservation du Snapshot, de l’annexe `workflows-v1` si présente et du compte chiffré normal. Ne pas lire ni copier le contenu du coffre. Une saisie ouverte exige l’intervention du porteur.
- Employer l’installateur `dist/forge-pilot/Madness-0.1.0-x64-setup.exe`. Les digests finaux sont consignés dans `verification.json` après les contrôles paquet.
- Après installation, comparer `resources/app.asar` et `resources/bmad-script-runner.py` avec les fichiers qualifiés. L’installation personnelle n’a pas été modifiée par l’agent d’implémentation.
- Créer un dossier témoin neuf **persistant**, avec les 96 fichiers de `FORGE_MANIFEST` conservés octet pour octet et une configuration locale minimale. Aucun coffre/profil Codex n’est copié. Le témoin reste conservé s’il est référencé par un projet ou une conversation.

Configuration témoin possible dans `_bmad/config.toml` :

```toml
[core]
output_folder = "{project-root}/_bmad-output"
active_initiative = "initiative-temoin"
```

## Ponts exacts utiles

`window.madness` conserve ses six méthodes : `readState()`, `chooseDirectory()`, `selectProject(projectId)`, `saveDraft(projectId, text)`, `setNavigation(collapsed)` et `onStateChanged(listener)` (retour : désinscription). Les commandes retournent le `Reply` v1 existant : `{contractVersion:1, correlationId, ok:true, value:{state,effect}}` ou `{...,ok:false,error}`. `state` conserve projets, conversations, brouillons et Snapshot v1.

`window.madnessDialogue` expose :

```ts
read(): Promise<DialogueState>
qualify(projectId: string): Promise<DialogueState>       // Mary
launch(projectId: string): Promise<DialogueState>        // Mary
qualifyForge(projectId: string): Promise<DialogueState>
launchForge(projectId: string): Promise<DialogueState>
send(projectId: string, conversationId: string, text: string): Promise<DialogueState>
copyWorkflow(conversationId: string, target: 'invocation' | 'workspace'): Promise<DialogueState>
stop(): Promise<DialogueState>
onChanged(listener: (state: DialogueState) => void): () => void
```

`DialogueState` contient exactement : `contractVersion:1`, `sequence`, `status`, `context`, `invocation`, `profile`, `acknowledged`, `errorCode`, `activities`, `workflows`. `context` contient `projectId`, `initiativeId`, `conversationId`, `providerId`, `connectionId`. `profile` est nul ou `{fingerprint,skillPath,outputBase?}`. `workflows` contient les annexes validées ; leur schéma exact et les observations sont définis dans `src/contracts/dialogue.ts`.

Les appels de qualification/lancement/envoi/arrêt retournent l’état immédiat. Attendre ensuite une transition **réellement observée** par `onChanged` ou `read`, en conservant `sequence/status/errorCode`. Pour une qualification : attendre `qualified` et `errorCode:null`, avec `invocation:'$bmad-forge-idea'` et la sortie exacte. Une lecture `qualifying` n’est pas un résultat terminal. Les erreurs de commandes sont dans `state.errorCode` ; un retour de Promise seul ne prouve aucun succès.

Le preload fabrique les enveloppes strictes `{contractVersion:1,correlationId,type,...}` sur `madness:dialogue:command:v1`. Les types Forge sont `qualify-forge`, `launch-forge`, `copy-workflow`. Aucun chemin, script ou outil générique n’est accepté du renderer. Les événements passent par `madness:dialogue:event:v1`.

## Scénario synthétique réel

1. Ouvrir le témoin dans l’application installée, avec le compte propre à Madness normal et le rappel forfait déjà acquitté. Le pilote peut rafraîchir ce compte à la demande de lancement ; aucun login réussi n’est présumé par la présence d’un fichier.
2. Enregistrer un brouillon distinct, par exemple « Brouillon témoin à retrouver ; ne pas envoyer au lancement ».
3. Déployer « Préparer Forge », lire projet/initiative/sortie/effets, puis vérifier le profil sans modèle. Contrôler son état terminal réel.
4. Lancer Forge explicitement. Le premier tour contient uniquement l’entrée native `skill bmad-forge-idea` et `$bmad-forge-idea`. Contrôler que le brouillon demeure intact et que la conversation enregistrée contient l’invocation, pas le brouillon.
5. Attendre `ready`, puis répondre dans cette même conversation avec une nouvelle idée explicitement synthétique et un objectif clair. Utiliser l’action d’envoi de l’UI, ou appeler d’abord `saveDraft(projectId,copieDuTexte)` puis `send(projectId,conversationId,copieDuTexte)`. Capturer le texte une seule fois. Ne pas relancer un effet incertain.
6. Après un échange réel, demander une sortie **CLARIFIED**, sans durcir l’idée. Laisser le modèle conduire le skill natif. Il doit utiliser les outils hôte ; une prose affirmant avoir écrit ne vaut aucune preuve.
7. Exiger les observations durables corrélées des vrais resolvers `workflow`, `config`, `personas`, puis `init` et les entrées du journal, `write` du rapport HTML et `finish`. Pour CLARIFIED : journal et HTML sont obligatoires ; le Markdown ne l’est pas. Lire les octets des fichiers et comparer leurs SHA-256 aux observations. Le rapport doit être autonome, avec CSS/sceau SVG inline et marque CLARIFIED. Ne pas l’exécuter.
8. Contrôler `outcome:'CLARIFIED'` seulement après `finish` observé ; l’acceptation humaine reste inconnue. Conserver séparément la preuve de fin de tour et celle de clôture native.
9. Préparer puis enregistrer un nouveau brouillon de réouverture. Arrêter Codex explicitement et attendre `stopped` sans `STOP_UNCONFIRMED`.
10. Fermer puis rouvrir l’application installée normalement. Vérifier projets, échanges, invocation, contexte, observations, chemins et brouillon identiques. Le dialogue est historique, aucun moteur ni réseau ne reprend automatiquement. Conserver le témoin référencé.

## Réserves

Les interactions structurées, approbations natives, hooks, reprise, autres skills, shell et écritures hors session sont refusés. Le parcours peut donc s’arrêter sur une erreur explicite ; ne pas la contourner ni fabriquer le livrable. Les prérequis BMad/Python/UV restent externes et épinglés. Installateur non signé, icône Electron inchangée, gates et distribution historiques non clos. Une erreur réseau ou authentification manquante laisse la preuve live en attente.
