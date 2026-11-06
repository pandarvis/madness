# Candidat Windows 0.2.18 avec initialisation BMad

L’installateur NSIS x64 `dist/init37-candidate/Madness-0.2.18-x64-setup.exe` est produit avec Electron 45.0.0 et electron-builder 26.18.0. Le [manifeste condensé](manifest-summary.json) identifie les empreintes exactes et le manifeste complet local. L’archive embarquée de 1 331 683 octets correspond au profil local 3.1/3.4, avec 27 compétences et trois records. L’initialisation prépare les ajouts depuis ce profil et vérifie son empreinte sans installer un outil système. La préparation indique séparément un profil absent ou un sceau invalide et invite à vérifier les ressources de Madness.

Sept tests de livraison couvrent l’identité, les versions, la stabilité, les ressources exactes et leur refus. Un test d’hôte ciblé confirme le refus sur profil absent ou corrompu avec cible intacte. Les deux types et la construction du candidat passent.

Le [témoin](receipt.json) utilise l’exécutable dépaqueté du candidat exact. Il vérifie le plan de 588 ajouts avant écriture, la décision, l’union des effets et le reçu durable, puis le retour au brouillon. Accord synthétique, quatre points réussis, dossier et profil témoins nettoyés. Zéro appel réseau observé après instrumentation. Pas de captures pour cette exécution courte.

La construction et le témoin de l’exécutable qualifient ce candidat de développement. Les vérifications d’installation, remplacement, restauration complète, refus natifs et retour éditeur du paquet final restent en 3.9. La participation du porteur et G4 restent en 3.10. Cet installateur non signé reste un candidat local.

Le même Quick a confirmé les deux corrections du manifeste : lecture structurée du YAML pour Windows et refus des jonctions dans le candidat. Le manifeste régénéré conserve les quatre empreintes d’artefacts. Le contrôle des ancêtres externes du futur dossier d’installation appartient à l’hôte runtime.
