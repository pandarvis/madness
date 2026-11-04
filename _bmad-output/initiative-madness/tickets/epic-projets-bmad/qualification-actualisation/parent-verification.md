# Actualisation des preuves — vérification parent 2.5

État : **built**, après recontrôle des deux constats par le même Quick : résolus, aucun nouveau défaut concret. Aucun correctif de cette story différé ; installation personnelle et gates humains non déduits.

## Résultat produit et portée

Les changements externes invalident les observations armées et regroupent les lectures sur la voie locale existante. La version effectivement affichée conserve sa date, sa révision, ses détails et la saisie ; une nouvelle observation se consulte volontairement. La santé de surveillance, la fraîcheur et l’activité restent distinctes. Les notifications ne constituent jamais une preuve d’auteur ou une autorisation d’effet. Première ouverture et restauration restent passives.

Version logicielle 0.2.9, baseline `bd4b6ea95b42d9abae9f7de488c77d0487a32d96`, gel LF `e871a0b9ca7a4dac67a4bc8906147c36cdb86f19d10e80b68c2bdd2e9017c43a`. Candidat qualifié avant Q1/Q2, non installé, ASAR `16b2f3391740c12a98ee2a0611f428f8a4f91ae3f97b2e7f681487035eb0b105`, NSIS `30444df461c3ba04434ede812a0d54f4dee74c1e5a3465bca2a91adbb2b8ace8`. [Audit parent002](parent-audit-002.json) :28ressources source/paquet,2036fichiers protégés,19sorties compilées et735fichiers runtime identiques ; seules versions root modifiées, résolutions de dépendances conservées.

Les preuves F1/F2/F4/F7 et arrêt actif F8 portent sur ASAR historique `87442da9bd83d1e4420c3f5563f63e517d6f41c4efd9ba4ba3c070a4195dece3`. [Diff compilé F5](focus-recovery-compiled-diff.json) : hors déplacement du listener focus et méthode progress.reconcile, Main identique ;18sorties renderer/preload et14ressources inchangées. Ce réemploi ciblé ne prétend pas une équivalence globale des deux ASAR. Le nouveau F5 est éprouvé sur le candidat final par son reçu distinct ci-dessous.

## Audit de la matrice gelée

Chaque ligne est liée à des cas réellement exécutés ; les totaux de recontrôles ne sont pas additionnés comme cas distincts.

| Ligne | Comportement couvert et reçus |
|---|---|
| F1 | Invalidation synchrone, ancienne version pendant lecture, une suite de rafale : tests F1/F4 verts dans [56cas](logs/core-H2-F8-final-002.log), puis26cas core après correctif F5. Main87442 initial491e…→afterBurstb54a… avec contenu exact External burst29 ; version affichée conservée puis bascule volontaire. |
| F2 | Windows réel : suppression, ajout d’inventaire, absence multi-parents, remplacement mêmes octets et remplacement de répertoire ; cas observer verts, Main87442 remplacements1f71… puis suppression3584…/3sources ; aucune réattribution. |
| F3 | Courses après await/root/sélection, capture→attachement, scopes tardifs et générations : tests core/observer/context et [deux protocoles natifs Windows](logs/native-second.log) verts ; ces protocoles seuls ne prouvent pas le raccord WeakMap, couvert par test enveloppes réellement exécuté dans56cas. |
| F4 | Cent événements / single-flight / une suite, deux projets sérialisés, BUSY différé à libération et STOP_UNCONFIRMED conservé :56cas puis26cas ciblés verts. Main87442 rafale29 réellement relue, nouvelle révision et texte vérifiés ; pas de fournisseur lancé. |
| F5 | filename absent, erreur, bornes128/512, race parallèle514→réservation bornée, réparations UTF8/FILE_LIMIT même inode restent unavailable : tests observer et [refus réel](native-refusals-001/verification.json) verts. Repro inherited uncertainty rouge1≠2 puis26/26verts. [Positif Main final](main-focus-final/verification.json) passed : vraie mutation, notifications interceptées uniquement dans le témoin, focus→reading→révisionaf01… et texte exact Focus recovery external bytes. ;10opérations exit0/Job0, deux fermetures, restauration exacte/passive, cleanuptrue. [Même high résolu](high-recheck-F5-native-001.json),41/41capsule prélaunch vérifiées. Le no-op de deux frames87442 et emit(focus)=true ne prouvent pas une récupération et sont exclus de cette conclusion. |
| F6 | Aide ancienne/non lançable, mutation après préparation/destination et préconditions au point d’effet : tests core+guards verts. [Décision native finale](native-decision-final/) : vraie mutation Windows, helper épinglé refuse STALE_SOURCE avant raw accept, fichier unchanged ; fournisseur RPC synthétique explicitement, pas de tour réel Codex. |
| F7 | App/styles réels :7cas UI puis2recontrôles annonce/Q3 verts, lecture ancienne pendant reading/error, focus composeur, détails/scroll et saisies conservés ; compact/deux thèmes/zoom200. Nouvelle révision reçue ne ferme plus automatiquement les détails selon décision Sally, ancienne attente Q3 explicitement remplacée. |
| F8 | Unsubscribe/timers/watchers immédiats, shutdown pendant construction, changement réel de scope ferme seulement ancien lease, retours tardifs ignorés : ciblés verts. [Arrêt actif Main87442](main-live-stop-final/verification.json) : UV36084 identifié, Job3→0, cancelled/exit1, stop1ms/drain197ms, génération exacte et neverStarted=false ; deux fermetures connues,5opérations avant/après réouverture et données exactes, cleanuptrue. La variante précédente préparation annulée ne prouve pas cet arrêt actif. |

## Revues et corrections

High indépendant par `/root/refresh25_high_audit`, inspection source/reçus sans lancer de tests :

- H1 : dépendances refusées insuffisantes après réparation en place ; couverture explicitement limitée, vrai repro Windows, même auditeur résolu.
- H2 : borne globale de handles vérifiée avant await pouvait être dépassée par attaches concurrentes ; réservation synchrone avant constructeur et fermeture du scope partiel, rouge514 puis vert, même auditeur résolu.
- H3/F5 composition : handler installé avant création de BrowserWindow et inopérant ; déplacé après création, rouge comportemental sur ancien candidat conservé.
- H4/F5 inherited uncertainty : un lease propre inchangé laissait le doute hérité sans collecte au focus ; une unique collecte qualifiée pour pending/uncertain, passive/BUSY/STOP conservés, rouge puis26/26verts et [même auditeur favorable](high-recheck-F5-001.json).

Aucun élargissement implicite de rôle, schéma durable, coffre, connexion, modèle ou profil personnel. Aucune correction technique du périmètre différée à ce stade ; F5 natif précédent recontrôlé résolu ; Quick a ensuite exposé Q1/Q2, deux corrections privées requises.

## UX et Impeccable

Sally réellement activée avant code, spines/contrats étendus puis structure/prose fraîches et corrections recontrôlées : [relevé](ux/sally-update.md). Impeccable Operate, monde hérité ; deux lots visuels maximum exécutés, une détection [] unique. Quatre rendus retenus ont été ouverts par parent puis relecteur frais ; premier grand clair avec infobulle transitoire exclu et conservé. [Sélection](visual-selection.json), [verdict réel ship](impeccable-finish-review.md) limité au renderer87442 inchangé, [documentation](impeccable-documentation.md) conserve les autorités et signale les dérives historiques sans migration.

Les états de présentation reading/error sont des mocks nommés ; les snapshots réhydratés viennent des vraies observations datées du Main partiel. Aucun G2/G4/G5, WCAG, fraîcheur actuelle ou accord humain déduit des PNG.

## Échecs conservés et hygiène

Main001/002 refusent avant qualification (devicePython64/libuv32 puis liaison WeakMap manquante), corrections et diagnostics sourcés conservés. Main003 afterBurst identique ne qualifie rien ; attribution au tri des récents retirée. Main004 PROFILE_CHANGED conserve sa cause inconnue. Main-final demeure PARTIAL avec STORAGE_READ_FAILED du lecteur d’owner du banc ; ses13groupes réussis sont utilisés dans leur portée, arrêt F8 prouvé séparément. Les premiers essais du banc focus et paquets UNKNOWN restent conservés sans cause antivirus inventée. Les protocoles et cadres de preuve originaux ne sont pas réécrits comme succès.

Les fixtures de cette story sont nettoyées uniquement après fermeture/Job0/identités et cibles canoniques possédées. Anciens témoins à arrêt inconnu non touchés. Profil personnel, projets réels, compte et installation inchangés. Aucun appel fournisseur/réseau ni nouvelle demande Zscaler/OAuth ; absence réseau observée après hook seulement dans Main.

## Quick — deux correctifs résolus

Deux constats vérifiés séparément, chacun medium/patch : Q1 scope armé sans lease ne récupère pas au focus ; Q2 consultation qualifiée ne remplace pas la lease Context et réinvalide des données inchangées aux focus suivants. [Triage exact](quick-review-001.json). Même implémenteur : correctifs minimaux et rouges/verts ; vérification parent et paquet actualisés ci-dessous. Même Quick : les deux résultats indésirables sont résolus, [reçu](quick-recheck-001.json). Aucun ancien reçu transformé en réussite de ces nouveaux cas.

## Candidat après Q1/Q2

ASAR final **508df4ab903d73000a133a7958a87c9623aa765702a54a6944507479c2d766cf**, NSIS **a4aefdeccb04743a10f2a6cda804e2557a1c12b2a3e8f0795b6ef18909d25022**, non installé. Parent :52/52ciblés sans skip, types/build/NSIS0, [audit003](parent-audit-003.json)28ressources/2036protégés/19sorties/735runtime exacts. [Main final](main-postquick-final/verification.json) passed :13checks, deux fermetures connues, réouverture passive et données/opérations exactes, cleanuptrue. Modification réelle et texte exact ; perte de notifications et événement focus simulés dans le témoin, aucun Alt-Tab physique prétendu.

Le [delta compilé postQuick](postquick-compiled-diff.json) isole les deux méthodes par rapport à16b2 ; le reste Main et18sorties sont identiques. La chaîne de réemploi vers87442 demeure limitée aux comportements inchangés, sans équivalence d’ASAR globale. Q2 est aussi éprouvé par vraie écriture Temp et port contrôlé Context+Progress : une récupération, puis deux focus réconciliés sans collecte supplémentaire, avec barrières déterministes. Trois gardes après attente ferment les leases non publiés ; [même high source favorable](high-recheck-Q1-Q2-001.json). Anciennes preuves conservées. Synthèse actuelle : [verification-parent-final.json](verification-parent-final.json).

## Clôture et suite

Matrice F1–F8 auditée, revues high/Quick résolues, aucun correctif2.5 différé. Les limites et rouges historiques ci-dessus restent intacts. Plan marqué built ; commit local des seuls chemins possédés, sans push ni installation personnelle. Le SHA se lit dans Git, sans auto-référence fabriquée.

Suite sous mandat complet : Sofia/REPLAN pour avancer le vrai onglet Graphe après les fichiers associés, puis backlog. Les dépendances4.4 ne changent qu’après ce replan validé ; le graphe n’est pas livré par2.5.
