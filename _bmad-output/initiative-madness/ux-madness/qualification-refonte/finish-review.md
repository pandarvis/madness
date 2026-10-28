disposition: ship

Entrée absente : aucune carte QUALITY BAR distincte n’est fournie pour cette extension du monde hérité ; plafond jugé sur PRODUCT.md, DESIGN.md, EXPERIENCE.md, la direction et les deux références humaines. Sources applicatives échantillonnées, sans audit exhaustif des handlers ; mouvement, lecteur d’écran et éléments Windows hors renderer non observables dans ces PNG.

## persistence

**pass** — Revue par un agent technique frais appliquant la définition officielle `impeccable_finish_reviewer.toml`, sans se présenter comme Sally. PRODUCT.md existe ; DESIGN.md et EXPERIENCE.md, datés du28octobre, décrivent le monde rendu et conservent les capacités futures comme futures. Mode Operate/code-led explicite : aucun comp approuvé, phase de reproduction raster ou diff de comp n’est requis ici. Les références humaines servent la hiérarchie et les commandes compactes ; elles ne constituent pas une composition à reproduire pixel pour pixel.

Les douze PNG requis du répertoire `packaged-visual-round-2/` ont tous été ouverts : `home-dark-expanded.png`, `project-dark-expanded.png`, `conversation-dark-1440.png`, `conversation-dark-rail.png`, `context-dark-desktop.png`, `conversation-dark-720.png`, `conversation-light-720.png`, `connection-light-compact.png`, `conversation-zoom-200.png`, `active-question-light.png`, `active-approval-light.png`, `global-recovery-light.png`. États et noms concordent ; aucun contenu attendu n’est remplacé par un écran vide ou une autre destination. Le haut du contenu est visible. Les captures de viewport coupent normalement leur contenu défilant en pied ; elles ne prétendent pas être des captures de document intégral.

`profile.json` consigne `mainScroll: 0`, thèmes, navigation, panneau, onglet et zoom. Les rasters1800×1150,900×1025 et1650×1150 concordent avec les dimensions CSS1440×920,720×820 et1320×920 à125 %. Le zoom Electron2 produit1650×1150 pour660×460CSS ; ce facteur n’est pas confondu avec le rapport raster/CSS. La zone de barre réservée aux contrôles Windows appartient à l’exclusion native décrite, pas à une région de travail manquante. Les vues720px sont la fenêtre Windows compacte ; aucune application mobile n’est livrée.

Provenance de revue : candidat séparé `dist/workspace-design-final/win-unpacked/Madness.exe`, ASAR `367bc8842b56b8ffe28f0b303ea6dbab9c5b458e65de7cc5fd639c6b308e96cc`, identité commune au manifeste `candidate-final-001/release-manifest.json` et au profil du second tour. Cette revue ne constate aucune installation personnelle.

## fidelity

Inventaire visuel établi avant lecture de la direction : bande supérieure mince avec bascule à gauche et trois utilitaires à droite ; navigation de projets déployée ou rail ; titre de projet et initiative, puis deux onglets ; ligne de récupération ambre avec accès direct ; lecture et champ de saisie centraux ; panneau de contexte flottant à droite ; demandes actives en flux avant l’historique ; clair blanc/lilas alternatif au sombre chaud. La référence humaine demande le gain de place des utilitaires et une conversation centrale ; aucun décor physique ou asset raster focal n’en découle.

| Élément ou promesse | État | Constat et autorité |
|---|---|---|
| TYPE | match | Segoe UI, titres600 à26/24px, corps13px et métadonnées12px : caractère et rapports de taille conformes à OWN-WORLD et DESIGN.md. Le maintien explicite de cette famille dans le plan et les contrats gouverne ici le choix de fonte système. Monospace réservé aux chemins, identifiants et patchs. |
| MATERIAL | match | Surfaces planes, filets et SVG en trait conformes au monde d’outil Windows ; aucune peinture, photographie ou matérialité physique promise puis simulée en CSS. Aucun raster produit n’est requis ou caché derrière un aplat. |
| GROUND | match | Le sombre rendu reste anthracite chaud, distinct de la navigation plus sombre ; les tokens source `#211f1e`, `#191817`, `#272423` correspondent à PRODUCT/DESIGN. Terracotta d’action et bleu de repérage sont conservés. Le clair blanc/lilas est l’alternative explicitement conservée par `light-colors`, pas une nouvelle palette déduite par la revue. |
| Barre et ouverture unique | match | Dossier SVG discret, thème et connexion de même poids ; aucune grande commande d’ouverture doublée. Le centre de bascule et celui des icônes du rail restent sur le même axe visible ; le profil les situe à28pxCSS avec cibles40px et barre56px. FIRST VIEWPORT et retour humain du26octobre. |
| En-tête, onglets et navigation | match | Projet long replié sur deux lignes lisibles, initiative dessous et sélection d’onglet soulignée. Les intitulés tronqués du rail déployé restent accompagnés d’un repère distinct ; nom intégral présent au centre. Hiérarchie prévue par DESIGN, sans monogrammeM réintroduit. |
| Conversation et demande active | match | Historique et brouillon occupent Conversation sans blocs de lancement Mary/Forge avant eux. La question active précède les messages conservés ; son champ et son envoi sont visibles dans le premier viewport de référence. `profile.json` situe le champ à676,2–748,2pxCSS sur920px. THESIS et FIRST VIEWPORT. |
| Approbation | match | Nature, destinataire inconnu, portée ponctuelle, échéance et contenu du patch sont visibles avant l’ajustement. Le bas de la capture est une continuation verticale ; les choix ne sont pas prétendus visibles dans le PNG. Le source `ApprovalPanel.tsx` place bien les boutons textuels « Refuser tout le patch » / « Autoriser tout le patch une fois » après les fichiers et la portée, sans choix par défaut. EXPERIENCE, vérité produit sur les décisions. |
| Récupération | match | Rappel court en Conversation ; vue globale nomme arrêt non confirmé, portée globale et nouveaux échanges bloqués avant les détails. Les détails ouverts explicitent la vérification et l’absence de rejeu. Aucun blocage dissimulé par la compacité. FIRST VIEWPORT et EXPERIENCE. |
| Contexte et connexion | match | Contexte complet dans un panneau consultable, origine Windows et activité distinctes des données historiques. Connexion non modale, forfait et consommation du témoin explicités ; aucun compte synthétique présenté comme connecté. STORY et EXPERIENCE. |
| Fenêtre compacte et zoom | adaptation | Repli en tiroir et titre de barre tronqué à720px ; contenu principal, commandes et saisie restent dans la largeur visible. À200 %, la hauteur utile réduit le contenu du premier écran et conserve le défilement. Adaptation justifiée par DESIGN · Responsive et EXPERIENCE · Accessibility Floor ; aucune variante mobile inventée. |
| THESIS | match | L’échange et la réponse occupent le centre ; préparation dans Parcours, contexte sur demande. |
| OWN-WORLD | match | Chrome discret, listes, traits, palette et taille des commandes relient les vues au même outil local Windows. |
| STORY | match | La distinction Parcours/Conversation et l’action secondaire « Préparer un échange » rendent lisible le passage explicite de préparation au travail. La conservation et le mouvement du dossier sont rapportés par le profil/source, pas observés comme une interaction exécutée par le relecteur. |
| FIRST VIEWPORT | match | Le souvenir du premier écran est le projet, son onglet, une intervention éventuellement nécessaire et son point de réponse. Les préparations volumineuses ne reprennent pas cette place. |
| FORM | match | Clé historique `d955fcd3` présente dans les deux contrats de direction ; composition héritée du choix humain, réemploi confirmé dans l’entrée. Aucun nouveau concept roll ou choix de comp n’est prétendu exécuté dans ce lot Operate. |

Vérité : exemples identifiés comme qualification/synthétiques dans l’entrée, l’initiative et les contenus de démonstration ; identités et état du tour inconnus restent inconnus. Pas de réussite fournisseur, catalogue complet, prix ou validation humaine fabriqués dans les vues. `detector.json` contient `[]` ; ce résultat fourni ne remplace pas l’inspection visuelle et n’a pas été relancé.

## ceiling

La carte QUALITY BAR manque ; aucun plafond externe à cette carte ne peut être certifié. Sur les autorités héritées disponibles, cadre, densité de listes, retraits, rapports typographiques, SVG cohérents et profondeur limitée aux panneaux/saisie portent le monde demandé. Les surfaces n’appellent ni texture physique, ni ornement, ni lettrage spectaculaire ; en ajouter contredirait l’outil compact choisi. Le seul moment de mouvement est le dossier, déclaré bref et statique avec mouvement réduit dans le source et le profil ; les images seules n’en certifient pas le rendu temporel.

Le plancher lu ne révèle dans les captures ni kicker décoratif, ni carte répétée comme structure de page, ni glyphe Unicode tenant lieu de système d’icônes, ni dégradé de texte, ni bordure latérale d’accent, ni ombre dure. Sélection, caret, scrollbars, focus et soulignements sont thémés dans `styles.css`. Les écarts intentionnels du monde hérité — SegoeUI et bordure/ombre de saisie — sont explicitement spécifiés par les contrats. Aucun nouvel audit de contraste calculé, de lecteur d’écran ou de mise à l’échelle Windows n’a été réalisé par cette revue.

## material_fixes

Aucun constat matériel sur les preuves et les autorités disponibles. `ship` porte sur la finition de cette surface et de ce candidat séparé ; il n’atteste ni installation personnelle, ni réception d’un modèle, ni qualification réseau, ni conformité WCAG, ni G1, ni acceptation visuelle humaine.

## keep

Conserver les utilitaires compacts à cibles40px, l’échange et sa réponse au centre, les décisions textuelles après leur portée intégrale, la récupération visible et les inconnus explicitement nommés.
