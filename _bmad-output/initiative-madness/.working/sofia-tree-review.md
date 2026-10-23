# Validation Sofia — Tree et Dependencies

Date : 23 octobre 2026. Périmètre : initiative actualisée, manifeste et proposition de quatre epics, avant approbation et création de leurs enveloppes. Contrôle effectué à partir de `validate-checks.md`, sections Tree et Dependencies ; ticket, PRODUCT, brief, addendum, DESIGN, EXPERIENCE et spine final lus. Les arbitrages du 23 octobre prévalent sur les questions historiques des sources.

## Verdict

**Découpage cohérent, présentable à l'approbation du porteur. Aucun défaut mécanique bloquant ni décision produit supplémentaire nécessaire.** Les enveloppes d'epics ne sont pas encore attendues à ce stade.

## Constats

- **Couverture :** R1–R31 ont chacun un propriétaire principal unique dans `tickets.toml` : 31 références, aucun manque, doublon ou identifiant inconnu. Les exigences renvoient à des sources présentes ; les trois contrats adoptés figurent dans `companions`. Les contraintes et le Done when sont repris par les qualifications et les travaux transversaux décrits, au-delà des seuls `covers`.
- **Frontières utilisables :** l'epic 1 livre un dialogue BMad/Codex réel et persistant dans un paquet Windows sur projet de référence ; l'epic 2 étend ce résultat aux projets, initiatives, preuves, aide et catalogue ; l'epic 3 ajoute l'initialisation et la preuve des trois parcours Windows ; l'epic 4 livre le graphe obligatoire pour clôturer la V1. Ce sont des résultats verticaux démontrables, pas des epics séparés par couche technique.
- **Socle et autorités :** G0, contrats communs, contexte, cycle de vie, persistance et paquet appartiennent à l'epic 1 avant leurs consommateurs. La qualification du profil BMad de référence requis pour le premier workflow appartient explicitement à cet epic dans la proposition ; G2 élargit ensuite les profils et diagnostics dans l'epic 2. Le port d'analyse et `GraphSnapshot` restent sous l'autorité du cœur et précèdent les consommateurs de l'epic 4.
- **Dépendances :** 2 attend les contrats, le paquet, la persistance et le dialogue de 1 ; 3 attend le diagnostic, le contexte, les fichiers et l'interface de 2 ; 4 attend la base Windows/Codex vérifiée et réutilise les capacités précédentes. Le dernier lien correspond aussi au périmètre confirmé « graphe après la base Windows/Codex ». La chaîne 1 → 2 → 3 → 4 ne contient aucun cycle et ne laisse pas de branches parallèles susceptibles de modifier sans ordre le même code, schéma, setup ou configuration.
- **Passages :** Boundaries et la table des propriétaires explicitent les sorties produites et leurs consommateurs : catalogue vers lancement Codex, diagnostic vers initialisation, panneau de fichiers vers graphe, paquet et stockage communs. R21/R26 ont un responsable de cohérence sans dispenser les autres epics d'appliquer les contrats à leurs surfaces.
- **UX et livraison :** la base française claire reste acquise. Sally/Impeccable précède les variantes et la nouvelle vue Graphe ; G4/G5 restent des preuves à produire. Les incréments installables ne sont pas présentés comme la V1 complète. Persistance sans relance, remplacement du programme, réseau des connecteurs, confinement Graphify et accessibilité disposent d'un propriétaire ou d'un gate explicite.

## Corrections mécaniques

Aucune requise sur les documents contrôlés.

## Suggestions pour les enveloppes à créer après accord

- Reprendre explicitement dans l'epic 1 la qualification du profil BMad de référence déjà décrite dans la proposition : sa lecture autonome ne doit pas donner l'impression que le premier dialogue attend tout G2.
- Conserver dans chaque enveloppe les passages producteur/consommateur et les obligations transversales de la proposition, notamment lancement/catalogue, persistance, variantes accessibles et paquet final. Cela préserve les limites utiles lors du découpage ultérieur en stories, sans étendre le périmètre.

## Questions produit

Aucune nouvelle. A1 reste la cible de conformité proposée ; Q2/G1, Q3/G2, Q4/G3 et Q7/G5 restent des qualifications planifiées. Les choix confirmés de stack, persistance, langues/thèmes et périmètre Graphe ne sont pas rouverts.

## Trace de vérification

Couverture contrôlée automatiquement par lecture du manifeste et des identifiants R : 31/31, sans doublon ni inconnu. Dépendances contrôlées directement sur les quatre entrées. Le contrôle `tickets.py status` a été exécuté sans cycle ni conflit par l'agent principal ; sa répétition dans ce sous-agent a échoué avant lecture du manifeste, `uv` ne pouvant écrire son cache temporaire d'interpréteur dans le bac à sable Windows. Cette limitation d'environnement ne constitue pas un défaut du découpage.
