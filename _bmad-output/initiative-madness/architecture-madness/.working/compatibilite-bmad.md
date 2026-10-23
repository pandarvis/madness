# Compatibilité BMad — installation observée le 23 octobre 2026

La [preuve locale](bmad-installation-observee.json) relève les modules `core-tools`, `method` et `toolsmith`, tous marqués `6.13.0-next`, ainsi que 27 compétences invocables rapportées par `knowledge.py`, sans problème d'inventaire. Ces nombres décrivent ce dépôt ; ils ne sont ni une liste figée du produit, ni une promesse de compatibilité avec toutes les previews v7.

La version des modules est définie dans leurs `bmod.toml`. Les compétences et les métadonnées de module ne jouent pas le même rôle. Le script officiel d'inventaire privilégie les racines projet sur les racines utilisateur et renvoie des problèmes explicites lorsqu'un fichier est inutilisable. Un contrôle limité à un préfixe de version `7` rejetterait l'installation de référence.

## Règles à transmettre au contrat d'architecture

- Identifier le profil de formats et de capacités reconnu : configuration TOML, manifestes des modules, aides, compétences et artefacts. Une version déclarée seule ne suffit pas.
- Séparer présence, diagnostic de compatibilité et disponibilité de chaque action. Une compétence absente n'invalide pas automatiquement toutes les autres.
- Obtenir le catalogue et les aides depuis l'installation réellement utilisée. Les métadonnées ne sont pas des commandes et l'aide n'est pas encore une recommandation produite par un agent.
- Conserver les chemins, le contexte projet/initiative et la fraîcheur des preuves ; une modification externe impose de relire les éléments concernés sans perdre la saisie.
- Qualifier un profil initial contre des installations de test avant de l'annoncer supporté. Les autres previews restent inconnues ou incompatibles avec une explication ; aucune migration automatique vers une ancienne version n'est introduite.

## Qualification de l'initialisation encore ouverte

La référence officielle `bmad/references/setup.md` prescrit l'outillage BMad, un diagnostic en lecture seule et un accord avant suppression ou migration. Elle ne fournit pas, à elle seule, un plan exhaustif de tous les fichiers affectés par les commandes d'installation.

La capacité de présenter les changements exacts avant accord doit donc être prouvée avec l'outillage retenu, en environnement de test contrôlé. Le futur adaptateur d'installation devra lier l'accord à un plan vérifiable et à l'état actuel du dossier ; il ne peut annoncer un succès sur le seul code de sortie du téléchargement. Aucun installateur, migration, mise à jour BMad ou workflow d'agent n'a été exécuté pendant cette investigation.
