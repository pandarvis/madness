# Infobulles des projets — vérification ciblée

Le survol des projets du rail compact passait derrière la bannière et les onglets. La correction ajoute une seule propriété produit : `z-index: 10` au parent `.sidebar`, déjà isolé. Le contenu ordinaire, dont les auteurs sticky2, reste dessous ; barre40, panneaux70 et dialogues natifs gardent leur priorité. Charte, dimensions, interactions et données sont conservées.

Le contrôle utilise le vrai composant App dans Electron avec un profil synthétique isolé. La sonde active temporairement pointer-events sur le pseudo-élément uniquement pour mesurer l'ordre réel de peinture via elementFromPoint. Aucun test ne se contente d'attendre une valeur z-index.

- Baseline :4/6 infobulles occultées, échec vérifié sur trois projets/deux thèmes.
- Correctif final :6/6 peintes au premier plan ; UI1 réussie sans skip. Nom long, vrai focus clavier Tab/Shift+Tab, Échap, labels déployés, panneau réellement chevauchant et dialogue modal vérifiés. Aucun message ou aide lancé ; fermeture sans descendants et suppression du seul profil synthétique attestées.
- Types et compilation réussis ; paquet NSIS0.2.7 constitué dans dist/tooltip-projects-reviewed-001. Audit190inputs/19sorties/13ressources exactes. Main et preload sont identiques en octets au candidat010 qualifié en2.2 ; les13ressources natives aussi. Aucun nouvel appel réseau/modèle ni nouvelle preuve M14/WCAG/global V1 revendiqué.
- Impeccable4.3.1 context, harden/craft-floor/polish appliqués. Deux lots visuels inspectés : baseline sombre, puis première correction clair/sombre. Ces PNG correspondent au rang1 ; le CSS final porte le rang10 pour rester devant les auteurs sticky2, vérifié par le contrôle de peinture sans nouvelles captures. Les images ne sont pas présentées comme des captures du paquet final. Géométrie, couleurs, assets et DOM sont inchangés.
- Détecteur exécuté une fois :4alertes déjà présentes avant correction, aucune sur la propriété ajoutée. Bord du rail surchargé à1px par atelier-controls.css et matière des panneaux dans la charte adoptée ; triage documenté, pas de refonte ou réparation de sidecar.

Les erreurs initiales du banc sont conservées : frame de capture d'une fenêtre cachée, libellé du bouton de thème, spécificité pointer-events du pseudo, modalité focus-visible. Les anciens fichiers *before-probe-fix.json sont exclus des verdicts de peinture ; seules red-paint.json et green-paint.json font foi. Les captures historiques restent exploitables visuellement. Journaux bruts compressés sans normalisation, décompression et SHA vérifiés.

Revue Quick :Q1, lien vers ce rapport encore absent lors de l'inspection ; ajout direct du rapport prévu, sans modification produit supplémentaire. Le même relecteur confirme Q1 résolu et aucun constat restant. Aucun correctif produit différé. L'application personnelle n'est ni fermée ni remplacée ; paquet prêt pour installation après cette clôture locale. La2.4 n'est pas lancée par ce bugfix.

## Installation personnelle du 3 novembre 2026

Le candidat exact a été installé sans reconstruire ni relancer les qualifications natives. NSIS termine à0 et l’ASAR installé correspond au manifeste. Les1168entrées critiques et les annexes bmad-context-v1 sont identiques avant/après remplacement puis après réouverture passive. Compte lisible, deux vrais projets, priorité CSS10 effective ; aucun modèle ni requête réseau après instrumentation, aucune capture personnelle. Session possédée fermée et arrêt attesté. Voir [installation](installation-personnelle-001/installation.json) et [réouverture](installation-personnelle-001/passive-reopen.json).
