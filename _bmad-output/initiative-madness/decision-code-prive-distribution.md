# Code privé et qualification de distribution

Décision du porteur, 27 octobre2026 : garder le code de Madness privé. La distribution locale gratuite envisagée reste le contexte produit. Aucune publication open source, licence commerciale particulière, clé API ou autre facturation n’est déduite de ce choix.

## Documentation officielle consultée

- [SIWC Quickstart](https://developers.openai.com/siwc/quickstart), consulté le27 octobre : l’usage des forfaits est proposé aux partenaires open source et à certains clients privés sélectionnés. La documentation ne démontre pas que Madness fait partie de ces derniers.
- [SIWC — Overview](https://developers.openai.com/siwc/token-sharing-open-source), consulté le27 octobre : le guide traite les applications open source et hébergées localement ; il renvoie les applications payantes ou distantes vers une demande d’accès.
- [Cookbook — Usage policy and terms](https://learn.chatgpt.com/cookbook/articles/sign-in-with-chatgpt#usage-policy-and-terms), consulté le27 octobre : l’intégration décrite couvre les outils open source et projets personnels locaux, avec vérification des conditions avant distribution.

## Conséquence retenue

Les succès personnels déjà observés restent valables dans leur périmètre. Ils ne démontrent pas, à eux seuls, l’admissibilité d’un nouveau client privé distribué à d’autres personnes. La lecture croisée des pages laisse ce cas précis à établir ; il ne s’agit ni d’une interdiction générale déduite ni d’une autorisation de distribution acquise.

La qualification1.1 reste donc ouverte. Lors de sa réconciliation, examiner la voie officiellement adaptée au client privé et les preuves requises, en préservant le plan historique et ses réserves de nettoyage. Une demande externe peut être préparée, mais aucune soumission, publication ou acceptation de nouvelles conditions n’a été effectuée. Les développements locaux5–9 et la préparation UX peuvent continuer indépendamment.

Le choix privé ne modifie ni le contrat d’architecture adopté ni les limites des autres fournisseurs. Aucun gate ni ticket n’est clôturé par ce document.

## Autre voie à réexaminer dans1.1

La page officielle [Codex App Server — Auth endpoints](https://learn.chatgpt.com/docs/app-server#auth-endpoints), relue le27 octobre, décrit une authentification gérée par Codex pour des applications locales ou open source existantes, et recommande SIWC. Elle exclut les services commerciaux ou hébergés. Cette voie gérée par le CLI est distincte du SIWC propre à Madness déjà livré.

L’app-server est aussi présenté comme une interface pour intégrer Codex dans son produit, avec authentification et approbations. Cela justifie de réexaminer la voie native et les réserves historiques de1.1 avant de conclure qu’un code privé impose une seule solution. La documentation ne qualifie ni le nettoyage de l’ancien essai, ni une nouvelle implémentation de connexion distribuée dans Madness. Aucune bascule d’authentification, nouvelle connexion ou facturation n’a été effectuée pendant cette lecture. La qualification/replan appropriée reste nécessaire ; ne pas transformer cette piste en autorisation déjà acquise.
