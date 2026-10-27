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

## Fréquence Zscaler — précision du27 octobre

Le porteur juge les acquittements répétés trop contraignants et demande si SIWC était la seule voie. Non : la [documentation officielle de l’app-server](https://learn.chatgpt.com/docs/app-server) décrit aussi le mode `chatgpt`, où Codex gère OAuth, la persistance et le renouvellement, et le mode `chatgptAuthTokens`, où l’hôte conserve cette responsabilité. La première voie reste une piste à qualifier pour le cas de distribution privé de Madness ; elle ne garantit pas de supprimer les interceptions du proxy. La clé API constitue une autre voie avec facturation séparée, pas un remplacement silencieux du forfait.

Dans les observations du pilote, le GET public des clés a reçu une redirection307 Zscaler avant le moteur ; après le clic humain, Main a obtenu200. Le compte est resté enregistré. La durée de validité de cet acquittement n’est pas mesurée : aucune fréquence normale ou expiration précise n’est affirmée. L’information « le JSON s’affiche après le clic » est acquise, ne pas la redemander.

Le code actuel ne renouvelle pas les accès à chaque message : la connexion et l’acquisition du dialogue contrôlent une expiration à moins de60secondes. Lorsqu’un refresh est nécessaire, ses clés publiques sont téléchargées avant la rotation. Il n’existe pas de cache durable des clés dans ce pilote. Réduire les accès réseau évitables, avec une politique de fraîcheur et de rotation vérifiable, est une piste technique distincte à instruire ; aucun cache, assouplissement de validation ou changement d’authentification n’est ajouté par cette note.

La récupération1.7 propose le lien public fixe, Ouvrir/Copier et un contrôle réseau seul. Elle facilite un blocage existant ; elle ne prétend pas résoudre sa fréquence. Les conditions1.1, le réseau du processus fournisseur et les éventuelles actions humaines réellement nécessaires restent séparés.
