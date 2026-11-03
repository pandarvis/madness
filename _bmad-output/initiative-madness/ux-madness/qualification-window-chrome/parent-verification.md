# Chrome atelier — logiciel 0.2.5 installé

3 novembre 2026. Mandat humain « Habillage atelier complet », puis « Un vrai skin complet sur l’app ! ». Suite du rail0.2.4/fd78875 et de la typographie/casting0.2.3 validés. Aucune story2.5 ou qualification2.2/M14 déduite.

## Livraison et preuve native

Trois plaques encrées à angles coupés et contour fin prolongent les commandes existantes sous Réduire, Agrandir/Restaurer et Fermer. Les glyphes, zones d’action et routine d’arrêt Windows restent natifs ; aucun bouton HTML interactif ni nouvel IPC. Décor aria-hidden/pointer:none, position et unité issues des env Window Controls Overlay, suivi geometrychange et absence sans overlay visible. Le fond natif est transparent hors high contrast ; fallback natif préexistant en high contrast, décor retiré en forced-colors. Les vrais checkbox/radio reçoivent coche/point/mixte, focus et disabled ; appearance:auto en forced-colors. Palette, fontes, casting et rail conservés.

Quatre JPG Windows complets ont été ouverts par le parent et le relecteur frais : light/dark normal/maximized. Les glyphes natifs sont présents dans ces photos, contrairement aux PNG WebContents. Maximise/restaure clair physiquement cliqués. En sombre, réduire→restaurer→maximiser→démaximiser→fermer physiquement observés ; native-actions-dark/native-events.json conserve les transitions. Une première fermeture a été refusée avant input car un hôte contextuel Explorer couvrait la coordonnée ; activation et nouvelle observation ont précédé l’unique retry réussi. Aucun input Explorer, aucun kill. Le premier essai dark-2 avait atteint sa pause240s avant le clic : l’échec de précondition n’est pas un succès de réduction.

Le banc a d’abord échoué sur require inexistant dans Main evaluate (native-probe-dark), puis sur app.process() après destruction Playwright lors de deux fermetures externes. Ces échecs sont conservés. Diagnostic exact dans native-close-diagnostic/profile.json ; le wrapper est désormais capturé au lancement, sans affaiblir les préconditions. Régression dédiée rouge puis verte, quatre tests du banc passent. Native-close-confirmed :5 contrôles, cleanuptrue. Les deux profils retenus ont été relus par identité/Main absent et observation complète avant retrait exact ; retained-profiles-reconciliation.json. Aucun correctif du chemin d’arrêt produit.

## Vérification

- Garde --caption rouge0vs3 sur0.2.4, green10, puis natif final11 et matrice17 avec2thèmes, six largeurs et zoom200. Chaque fermeture est suivie de sa preuve Main/compteurs avant nettoyage.
- Typecheck/build et NSIS réussis. Apparence7 et barre1 passent. Dernier regroupement apparence+banc :11/11 dans le contexte natif autorisé ; premier run sandbox9/11 (save-failed/état non persisté) conservé dans unit-final.log, cause système exacte non prétendue. Aucun code produit modifié pour ce rerun. Aucun global51/51 ni suite backend globale revendiqué.
- Paquet final :11 contrôles/formulaires et17 matrice, cleanuptrue ; checker candidat9/9.
- Détecteur unique :un warning side-tab sur le border-left de la coche10×6px. Faux positif géométrique documenté dans detector-assessment.json ; aucun bord de carte ajouté, aucun deuxième scan.
- Revue fraîche caption_final_review : disposition ship, aucun Critical/Important/Minor. Quatre JPG ouverts, source/rapports relus. Documenter a réconcilié les cinq fichiers du système. Les cases/radios des deux thèmes ont ensuite été ouvertes visuellement par le parent.

## Installation personnelle

Installateur0.2.5 NSIS0 au chemin existant. ASAR a30714c769519d814cb716b1be3eb04ec89d1f220284cb1c32a1c2cd43172aad ; installateur bcecdd6979606bbd8a2aeb4ada9394349deee8cc3326b43f916a459967178dcc. Manifeste175inputs identiques, source-freeze.json et release-manifest.json. LogoM conservé.

838 entrées critiques identiques avant/après installation, puis après réouverture passive et fermeture. Checker personnel9/9 : compte lisible, projets MIA/madness, Oxanium450, aucun tour actif, zéro réseau/app-server après instrumentation et fermeture sûre. Aucun message/modèle/consentement ni nettoyage des projets réels.

Le contrôle Computer Use supplémentaire de la version installée a été arrêté par le porteur avec la touche physique Échap lors de list_windows. Aucun input Windows ultérieur. Aucune nouvelle photo native personnelle ni clic personnel0.2.5 revendiqué ; les preuves natives physiques restent celles du candidat isolé. La vérification passive et la comparaison838 étaient terminées, application fermée.

## Décisions et limites

Helper Bash de suivi indisponible (Bash/E_ACCESSDENIED) : ledger équivalent Node dans le workspace du plan, sans logique produit. Coût si erroné : traçabilité à réconcilier. Les scénarios mis de côté par la revue restent des limites : high contrast Windows réel, Snap hover, DPI matériel/multimoniteur, moteur réellement actif et lecteurs d’écran/WCAG non requalifiés ; chemin métier inchangé. Risque résiduel : défaut dans un environnement ou scénario non exercé. Les anciens lots, casting et gates métier ne sont pas rouverts. Les tests parent n’ont pas été réexécutés par le relecteur ; leurs sorties sont les preuves parent. Packaging/préservation838, laissés de côté à la revue, sont désormais établis ci-dessus. Aucun minor différé.

La branche privée codex/atelier-immersion et son worktree restent locaux sous le mandat existant ; aucun merge, push ou publication. Le dossier de bookkeeping du seul plan est retiré après copie du ledger ici ; aucun workspace voisin touché.
