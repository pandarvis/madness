# Sources primaires pour la frontière d’observation2.5

Consultées le4novembre2026 par le parent. Ces références expliquent une différence possible d’implémentation ; elles ne qualifient ni nos binaires ni un autre volume.

- [Node — fs.watch](https://nodejs.org/api/fs.html) : notifications dépendantes du système, nom éventuellement absent et limites sur déplacement/suppression de répertoires sous Windows. Ce mécanisme ne remplace pas les lectures/contrôles au point d’effet.
- [Microsoft — ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw) : un débordement peut faire perdre le détail des changements ; une réconciliation reste nécessaire.
- [CPython3.12 — os](https://docs.python.org/3.12/whatsnew/3.12.html#os) : les identifiants de volume/fichier peuvent respectivement utiliser64/128bits sous Windows.
- [libuv — implémentation Windows, branche v1.x](https://raw.githubusercontent.com/libuv/libuv/v1.x/src/win/fs.c) : fs__stat_assign_statbuf prend le champ bas du numéro de volume et FileId.QuadPart. Branche mutable consultée à cette date ; les versions effectivement embarquées doivent être consignées dans la qualification.

Le diagnostic local du worker mesure Python dev8708507883820908980 et Node dev3671425460 pour le même volume, avec inode BigInt égal sur14entrées. Cette mesure reste celle de son exécution, à lier à son reçu ; elle n’est pas une identité universelle entre deux volumes. La projection DWORD sert uniquement à l’accélérateur de surveillance. Les identités natives complètes et gardes au point d’effet restent conservées. Un identifiant non représentable ou une métadonnée inconnue reste une limite explicite, jamais une correspondance fabriquée.

Complément vérifié : main-003/verification.json conserve Electron45.0.0, Node24.22.0 et libuv1.52.1 dans launches[0].runtimeVersions. Le [source libuv au tag1.52.1](https://raw.githubusercontent.com/libuv/libuv/v1.52.1/src/win/fs.c) consulté le4novembre confirme le champ bas pour st_dev et FileId.QuadPart pour st_ino ; ce lien stable précise la branche initialement consultée. Le run Main003 reste partiel/rouge : son vecteur de versions est un constat, pas un succès de parcours.
