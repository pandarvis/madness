# Vérification Windows 0.2.22

Le paquet réunit le correctif d’arrêt après navigation, les drapeaux de langue et la revérification des sources sans miroir. Les deux tests Electron du panneau, les 31 tests de capture, coordination et supervision et les 90 tests locaux d’initialisation ont réussi. La revue Quick a contrôlé les deux correctifs Graphify.

Le témoin du paquet 0.2.22 a ouvert un profil jetable avec un graphe historique synthétique et un inventaire natif réel. Il a vérifié la portée exacte de 0.2.21, puis a relu un original dans le panneau fichier. Les seuls travaux natifs étaient `revalidate` et `files-read`. Il a vérifié l’absence de miroir et d’analyse, les couleurs et le changement de langue au clavier, la conservation du brouillon et des deux sources, l’arrêt du propriétaire et le retrait du profil. Le premier essai avait lu trop tôt une projection historique via un prédicat asynchrone. Le témoin final attend la notification d’état native et contrôle la fraîcheur et le contenu exact de l’aperçu.

- [Témoin final](./witness-revalidation-0.2.22-confirmed/report.json)
- [Manifeste résumé et empreintes](./manifest-summary-0.2.22.json)
- [Témoin d’initialisation sur 0.2.21](../../epic-initialisation-bmad/qualification-paquet-initialisation/witness-0.2.21/receipt.json)
- [Récupération native ciblée sur 0.2.21](./recovery-0.2.21-final/report.json)

Le programme décompressé a servi au témoin, et le paquet NSIS local a été construit et scellé. La qualification du remplacement, les parcours BMad intégrés avec compte et les essais utilisateur restent ouverts. La génération réelle du dépôt Madness reste prouvée sur la 0.2.21. Le retrait automatique des copies produites pendant une génération reste en préparation.
