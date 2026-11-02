# Audit indépendant des frontières — premier tour

Relecteur frais `/root/g2_boundary_review`, rôle technique Security Engineer, inspection seule. Aucun rôle Winston, test, édition, réseau ou sous-agent pendant cette lecture. Trois contre-exemples statiques vérifiés par le parent et triés dans le plan :

- Runtime : `fixtures.py:49` épingle seulement deux EXE ; `prototype.py:302` lance le redirecteur venv sans `-S`. Le `pyvenv.cfg` réel hors verrou choisit le home, et site peut charger du code avant `check_lock`/audit. Une réorientation stable laisse les EXE intacts sans garantir le runtime effectif. Aucun tel effet observé ni .pth actuelle repérée. Référence de garde existante : `runtime.ts:8–26`, `profile.ts:65`.
- Roster : `prototype.py:238` utilise le roster, dont `roster.py:151` intercepte ConfigError/OSError et retourne `{}` sans problème. Un TOML de personnalisation invalide passe le préflight UTF-8 puis devient une identité de repli sans erreur, contrairement à l’affirmation du rapport. M7 ne couvre que le chargeur direct.
- Contexte : `prototype.py:345` lit les initiatives par `read_safe` sans plafond cumulé ni reçu propre ;17fichiers de1Mio passent au-delà des16Mio annoncés. Cette voie est utilisée par M1 (`scenarios.py:61`) ; son `source_revision` porte les skills, pas le contexte. Collecte bornée/versionnée et invalidation indépendante nécessaires.

Les refus NTFS et la distinction descriptif/copiable/lançable étaient correctement présentés comme observations locales. Les constats concernent le banc et son handoff2.17/2.2, pas une vulnérabilité démontrée du produit installé. Code et preuves exacts archivés dans `iteration-0.zip` ; correction et recontrôle restent nécessaires.
