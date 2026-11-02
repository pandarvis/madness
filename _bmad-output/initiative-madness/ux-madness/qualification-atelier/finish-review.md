disposition: fix

Entrées manquantes : carte QUALITY BAR indisponible ; reçu indépendant du seed09fa5971/affectation5 non fourni au moment de cette revue. Les journaux comportementaux et le code principal ont été échantillonnés, sans réexécution ; le reste du bundle JavaScript et les autres fichiers produit n’ont pas été relus intégralement. Revue technique de substitution appliquant la définition officielle `impeccable_finish_reviewer.toml`, sans rôle natif spécialisé exposé.

## persistence

Fail — `PRODUCT.md` existe et décrit l’usage personnel local, les thèmes et les décisions explicites. Le contrat de surface existe et porte les cinq blocs. Ce chemin est code-led : absence de comp approuvé, d’état de reproduction et de diff comp non fautive ; l’image approuvée est bien une référence critique.

Le `DESIGN.md` préexistant sous `_bmad-output/initiative-madness/ux-madness/` décrit encore l’ancien monde : `light-colors.surface: #FFFFFF`, accent violet `#654BB0`, titres Segoe UI, absence de Barlow/atelier. Le rendu emploie ivoire, terracotta et Barlow Condensed. La mise à jour annoncée par le documenteur reste due ; elle n’est pas considérée acquise. Les contrats comportementaux doivent être conservés lors de cet alignement.

Check 0 passé : les 24 chemins requis existent, leurs 24 SHA-256 correspondent au paquet, et chaque image a été ouverte. Aucune image vide, noire, hors sujet ou présentée comme un plein document alors qu’elle serait tronquée. Les dimensions physiques sont cohérentes avec DPR1,25 ; `1323` correspond à1324CSS/1655pixels, quantification déclarée restant du côté docké du seuil, et le zoom2 à660CSS/1650pixels. Les captures montrent bien les vues/états nommés, y compris les zones défilantes internes. Le recadrage contextuel corrigé est celui du paquet. Le SHA-256 actuel de l’ASAR est `fa4133881785fa1f70e4a8c4dd2ad2121555751797df10396aa4e70fdb1c14b4`. Le CSS extrait de cet ASAR correspond exactement au CSS compilé local.

## fidelity

Inventaire visuel de la référence critique, établi avant lecture du contrat : atelier de bande dessinée ; cadre continu de plaques pétrole peintes/usées, joints et cuivre ; titres condensés très forts ; onglets de dossiers à angles coupés ; navigation à gauche, dialogue dominant et saisie encadrée ; petites effigies dans les messages et grand portrait à droite avec cartouche terracotta. Cette image ne fixe ici ni matrice de reproduction, ni pixels, ni obligations d’assets. Son apport critique est l’intégration de la matière au cadre lui-même, au-delà des illustrations isolées.

Matrice du rendu contre OWN-WORLD, le handoff et les réponses confirmées, sans comparaison de reproduction à la référence :

| Élément | État | Preuve et portée |
|---|---|---|
| TYPE | match | Barlow Condensed Bold locale et empaquetée : lettres étroites, épaisses, droites, terminaisons franches ; titres/noms distincts du Segoe UI de lecture. Les captures montrent cette voix sans effet de métal ou de craie sur les lettres. |
| MATERIAL — bustes et décors | match | Vrais rasters illustrés, contours encrés et transparence des bustes ; Sally visible en grand, Amelia/Smithy en vignette ; scène d’atelier visible dans la navigation et les bandeaux. Aucun SVG figuratif ou contour organique géométrique de substitution observé. |
| MATERIAL — chrome | contradicted | OWN-WORLD et le handoff promettent matière peinte mate et usure retenue **dans le chrome**. Barre supérieure, navigation et cadre de fiche restent des aplats propres bordés de traits ; les petits `inset 0 -2px` des sélections/commandes simulent une lèvre sans porter cette matière. La matière visible reste dans les images de décor. Correction F2 ; le défaut est circonscrit au chrome, les bustes et les fonds de lecture ne justifient pas une reconstruction complète. |
| GROUND | match | Cible autorisée : anthracite chaud/ivoire du contrat, et non une couleur supposée de la référence. Pixels inspectés : `conversation-dark-1440.png`(1000,325)=`#211F1E` ; `atelier-panel-light-1440.png`(1100,330)=`#F6F0E4` ; fonds de fiche sombre/clair aux points(1650,550)=`#272423`/`#FFF9EF`. Température cohérente avec les tokens servis et la direction. |
| Projet, onglets, conversation, fiche | match | Navigation≈240CSS ; fiche320CSS,350 à1600 ; dialogue central ; grands portraits réservés à la consultation demandée. Les cadres de lecture restent calmes. |
| Bandeau réduit dans Conversation et aux petites tailles | adaptation | Réponses confirmées « Prioritize real conversation and decisions » et FIRST VIEWPORT demandent bandeau réduit/zoom. Son retrait en Conversation rend le brouillon visible au premier écran dans les vues historiques ; il ne remplace aucune action métier. |
| Cartouches et commandes | match | Onglets géométriques coupés et cartouche de nom terracotta ; commandes SVG sobres, cibles40CSS ; boutons de décisions textuels. La géométrie des onglets n’est pas une fausse découpe organique. |
| Identité et fiche informative | match | `agentPresentation` ne reçoit que l’identité native de l’item ; correspondance exacte sur les sept noms attestés. Inconnue et image en erreur gardent un pictogramme SVG neutre. La fiche expose provenance/message et nie explicitement toute preuve d’activité ou de compétence disponible. |
| Couverture visuelle des sept bustes livrés | missing | Le paquet contient les sept fichiers et les contrôles attestent leur montage. Les24 images ne montrent cependant pas Mary/John/Sofia et ne montrent Winston qu’en fragment au bord d’une zone défilante ; un test de chargement ne permet pas d’en juger le rendu. Sally/Amelia/Smithy sont inspectables. Correction F3 de preuve, sans prétendre que les autres assets sont absents du produit. |
| Vérité des démonstrations | match | Messages/historiques et patch d’essai portent leur caractère synthétique ; aucune réussite fournisseur ni activation de rôle ne découle des portraits. Neuf rasters avec métadonnées de prompt selon le scan fourni, provenance et correspondance des dix assets empaquetés documentées. |

| Promesse | Contrôle |
|---|---|
| THESIS | Projet/dialogue/demandes restent repérables ; caractère atelier incomplet dans le cadre lui-même, F2. |
| OWN-WORLD | TYPE et GROUND tenus ; matérialité du chrome non tenue, F2. |
| STORY | Les vues de question, patch et récupération montrent le destinataire/portée et une décision explicite ; la consultation du rôle est locale. Les reçus fournis couvrent brouillon, sélection, retour de focus et inertie, sans nouveau test ici. |
| FIRST VIEWPORT | Hiérarchie projet/onglets/dialogue, portrait40CSS, fiche à la demande et commande d’ouverture unique conservés. Test de mémoire : pétrole/terracotta, onglets de dossiers et bustes sont mémorisables ; les cadres de l’atelier promis ne le sont pas encore. |
| FORM | Le bloc porte bien seed09fa5971/affectation5, mais son texte ne corrobore pas le tirage : reçu des appels dégradés encore manquant, F1. La signature de consultation locale est implémentée ; animation180ms avec coupe géométrique et réduction de mouvement présentes dans le CSS. |

## ceiling

Carte QUALITY BAR absente : aucun plafond de catalogue n’est prétendu atteint. Parmi les dispositifs natifs du monde fourni, le cadre peint/encré et son usure mesurée restent inutilisés sur les zones de chrome effectivement manipulées ; F2 reprend cette promesse déjà écrite, sans exiger boulons, composition ou densité décorative de la référence. Le texte de travail doit rester sans texture.

Les quatre warnings existants ont été triés sans seconde passe du détecteur : `styles.css:337` est la séparation pleine hauteur de la navigation ; `:412` la séparation d’un panneau, au rayon0 ; `:409` une arête supérieure de panneau au rayon4 ; le second warning `:412` d’arrondi ne correspond pas à la règle effective au rayon0. Ces traits assurent les contours encrés du monde fixé, sans liseré latéral de carte d’alerte ; ils ne constituent pas quatre correctifs supplémentaires. Aucun kicker, texte en dégradé ou icône Unicode observé dans les24 captures. La conformité globale WCAG, les glyphes Windows natifs et une validation humaine ne sont pas déduits de cette inspection.

## material_fixes

1. F1 — Check4/FORM : joindre le reçu indépendant du seed09fa5971/affectation5 et des deux appels dégradés, puis corroborer le bloc FORM ; ne pas transformer le résumé du contrat en preuve et ne pas relancer un tirage pour combler l’historique.
2. F2 — Check2/MATERIAL et OWN-WORLD : donner au chrome de navigation et de fiche la matière peinte mate/encrée à usure mesurée promise ; **produce: arêtes de plaques peintes comme assets raster indépendants**, intégrés à une échelle visible, puis retirer les petites lèvres CSS qui en tiennent actuellement lieu ; préserver les surfaces de dialogue/saisie calmes et les cibles/focus existants.
3. F3 — Check5/Truth : fournir dans le paquet des vues du rendu réel permettant d’inspecter Mary, John, Sofia et Winston entier, et un index reliant les sept bustes visibles aux fichiers empaquetés ; conserver les identités synthétiques attestées et n’inférer aucune apparence depuis les seuls tests de chargement.
4. F4 — Check1/Persistence : aligner le DESIGN.md préexistant sur les palettes, la typographie, le chrome, les panneaux320/350 et la transition docké/modale effectivement livrés, avec leurs sources ; préserver les règles de comportement2.17/2.2 et faire contrôler cet alignement après le documenteur.

## keep

Conserver les bustes originaux en petite vignette dans le dialogue, la grande fiche seulement à la demande, les identités exactes ou inconnues, les décisions textuelles explicites, les fonds de lecture calmes et la largeur rendue à la conversation après fermeture.
