# Protocole natif installé — messages progressifs

Statut initial : **protocole préparé, aucune réussite de 1.4 déduite de ce document**. Le compte rendu final doit identifier séparément le programme testé et chaque résultat observé.

## Conditions

Utiliser le paquet Windows final de 1.4 et le compte propre à Madness, sans copier le coffre. Conserver les variables proxy habituelles et la validation TLS par défaut ; ne consigner que leur présence et les empreintes utiles, jamais les valeurs de secrets. Les versions natives sont comparées aux références locales qualifiées.

Avant remplacement, la personne sauvegarde sa saisie et confirme la fermeture si sa fenêtre est encore ouverte. Comparer les empreintes des données avant/après installation et celles du programme installé au paquet contrôlé. Une authentification réellement nécessaire reste une intervention humaine.

Créer un témoin synthétique dédié pour ne remplacer aucun brouillon existant, y compris celui d'un ancien témoin. Capturer l'état initial, puis ouvrir une nouvelle conversation Mary avec contexte explicite et brouillon distinct. Les anciens projets, conversations et brouillons restent conservés. Après les contrôles, restituer la sélection initiale quand elle existe ; conserver le nouveau témoin désormais lié à l'historique.

## Parcours et mesures

1. Lire le profil puis obtenir une qualification terminale réelle, sans modèle. Enregistrer le brouillon et vérifier qu'il n'est pas envoyé au lancement.
2. Lancer Mary explicitement avec Codex. Installer l'observation des états avant le lancement ; observer la vraie UI après rendu et relever la première réponse visible alors que le tour travaille encore. Conserver séquence locale, contexte et empreinte du texte synthétique observé ; aucun état ni fragment fournisseur n'est fabriqué.
3. Attendre la fin native. Vérifier que le texte complet est conservé, sans doublon, et que le destinataire, l'invocation et l'identité connue ou inconnue correspondent aux preuves. Une fin de tour ne signifie ni acceptation ni fin d'un workflow documentaire.
4. Envoyer un second message synthétique simple, sans demander d'écriture. Vérifier encore la progression, la corrélation et l'absence de réattribution du premier échange. La conservation n'est annoncée qu'après confirmation du port existant.
5. Sauvegarder un nouveau brouillon, demander l'arrêt et attendre sa confirmation réelle. Conserver les derniers états et textes ; un arrêt non confirmé ou une sauvegarde échouée reste un résultat incomplet, jamais une réussite.
6. Fermer puis rouvrir le même programme installé : comparer projets, conversations, messages, observations Forge antérieures et brouillons. L'historique et les métadonnées non attestées sont présentés comme tels ; aucun moteur ou tour ne redémarre.

Les cas étrangers, tardifs, les rafales et erreurs disque sont qualifiés séparément par les tests de protocole, de cœur et d'interface. Leur simulation est étiquetée ; elle ne remplace pas l'observation native précédente.

## Preuves et nettoyage

Le rapport final donne les commandes exécutées, leurs résultats, les empreintes du paquet/installation et la portée exacte des contrôles. Les captures de qualification utilisent des données synthétiques ; toute preuve native reste distincte des fixtures visuelles.

Nettoyer les profils jetables et aides ponctuelles après fermeture des seuls processus appartenant au banc. Préserver le témoin lié à l'historique, les tests automatisés et les preuves utiles. Distribution, G0/G1 et les anciens blocages ne sont pas clôturés par ce parcours personnel.

## Résultat d’exécution

Étapes 1–3, 5 et 6 réussies sur le paquet final : profil qualifié, première réception réellement visible avant fin, conservation, arrêt, réouverture exacte sans moteur/réseau. L’étape 4 est partielle quant à sa mesure préterminale : les deux suivis distincts terminent et sont conservés, mais leur progression n’est pas capturée par le polling de 100 ms et les lectures DOM successives. Les deux assertions de mesure restent consignées ; aucune cause de buffering ni absence de progression n’est prouvée. Aucun replay. Le contrôle natif requis du plan est satisfait sur le premier tour ; le rapport n’affirme pas une mesure complète des trois tours.
