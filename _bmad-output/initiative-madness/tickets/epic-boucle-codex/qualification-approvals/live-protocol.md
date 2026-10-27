# Parcours personnel1.6 — protocole préparatoire

Ce document prépare la vérification ; il ne rapporte aucune réussite réelle de Madness1.6. Les deux bancs protocol-* emploient un vrai runner avec modèle simulé et gardent une portée distincte.

## Préparation

- Employer un nouveau projet témoin BMad, avec fichiers UTF-8 synthétiques et racine vérifiée sous `.g0-qualification`. Préserver les témoins déjà liés aux conversations, notamment ceux de1.5. Aucune modification du véritable projet de travail ni des fichiers BMad gérés.
- Recontrôler l’absence de fenêtre personnelle ; ne pas fermer une saisie inconnue. Compte Madness existant, rappel forfait déjà acquitté. Aucune nouvelle connexion ni demande de token, sauf erreur nouvelle précisément diagnostiquée.
- Vérifier ASAR externe, bundle réellement chargé, exécutable Main et profil normal. Dans les callbacks Main Playwright, utiliser `process.getBuiltinModule` ; lire l’archive ASAR avec Node externe. Le PID du wrapper Windows ne suffit pas à identifier le Main.
- Capturer les données privées uniquement en mémoire pour comparaison. Aucun screenshot personnel ni copie du coffre. L’observation du runner doit rester passive : aucun changement des arguments, de l’environnement, du trafic ou de la politique.

## Parcours

1. Vérifier la lecture seule initiale et l’absence d’effet au lancement. Choisir explicitement le mode de propositions sur accord, puis invoquer Mary native dans le témoin. Capturer projet/initiative/conversation/connexion et attendre la fin réelle de l’accueil.
2. Demander un patch synthétique précis. Avant tout clic, vérifier dans le vrai formulaire tous les chemins, kinds et contenus proposés, les préconditions et le destinataire attesté ou inconnu. Pour add/delete, le contenu complet n’est pas un diff unifié. Une proposition hors du témoin, une extension de session ou une portée différente impose l’arrêt, sans accord.
3. Autoriser explicitement cette seule demande. Observer la décision au RPC original, puis les événements corrélés d’opération et la relecture des effets. Ne pas confondre clic enregistré, transmission confirmée et exécution. Le terminal du tour ou `serverRequest/resolved` seul ne vaut pas réussite.
4. Faire proposer une modification distincte, puis la refuser. Vérifier qu’elle ne change aucun des fichiers concernés et que le dialogue peut continuer sans permission persistante.
5. Faire une nouvelle proposition, conserver un texte d’ajustement propre à cette demande puis refuser l’opération. Quand le même dialogue est prêt, transmettre explicitement cet ajustement. Vérifier le nouveau tour, la nouvelle proposition et la nouvelle approbation ; l’ancien accord ne s’applique jamais. Aucun champ feedback fictif dans la réponse native.
6. Sur une dernière demande distincte, conserver une saisie sans décision puis arrêter. Vérifier arrêt natif confirmé, contrôles invalidés et refus des anciennes commandes sans effet. Le brouillon libre reste distinct. Pas de replay de demande ou d’effet, même pour réparer le banc.
7. Fermer et rouvrir : comparer contexte, textes, brouillons, questions, approbations et annexes Forge. Les demandes historiques ne redeviennent pas répondables. Mesurer une période bornée sans spawn/réseau après instrumentation ; ne pas prétendre couvrir la période antérieure.

Les cas double clic, échéance locale, écriture refusée, proposition modifiée, chemins protégés, symlinks et terminal avant traitement sont d’abord exercés par les tests et bancs isolés. Ne pas multiplier les tours facturables pour ces seuls cas techniques.

## Preuves et remplacement

Conserver un rapport expurgé avec les contrôles effectivement observés, empreintes, limites et nettoyage. Un essai partiel garde son état ; une nouvelle tentative est réévaluée avec nouveau témoin/nonce et sans rejouer une commande ancienne.

Après revue, installer uniquement le paquet qualifié. Relever récursivement les empreintes des fichiers applicatifs nécessaires, coffre chiffré et Local State compris ; ne pas confondre sous-dossiers runtime et erreurs de données. Un précontrôle Node non nul doit interrompre PowerShell explicitement avant l’installateur. Comparer avant/après, puis contrôler la restauration installée sans fournisseur. Laisser l’application fermée pendant l’enchaînement autonome.
