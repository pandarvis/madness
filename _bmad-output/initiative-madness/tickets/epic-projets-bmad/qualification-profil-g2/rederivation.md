# Reprise1 de la qualification G2

Les deux revues ont fini et les six constats ont été vérifiés par le parent. Leur triage et la Code Map amendée font autorité dans le plan. Aucun changement du bloc figé ni besoin d’arbitrage humain : la qualification doit prouver ses garanties existantes.

Le premier banc et ses16fichiers sont conservés intégralement dans `iteration-0.zip`, SHA-256 `109c937e26b8dd2e3b3dfedf0b0abdae814be089ac36a486f8553cda53b223be`. Archive locale produite par le parent, sans contenu personnel de compte. Elle contient code, sources-lock, preuves et logs avant reprise. Le code courant a été retiré pour re-dérivation conformément au workflow ; consulter ces sources archivées et préserver leurs points solides, sans exécuter leur ancienne voie.

## Six contre-exemples à exercer

1. Deux modules déclarent la même compétence, dont le record désigne seulement le second : l’ancien test global de présence accepte à tort le premier. Prouver la relation réciproque et une contradiction sourcée, sans lancer la compétence.
2. Feuille `status: done` et plan `status: in-progress` : la jointure officielle écrase le champ de feuille. Conserver séparément les preuves de l’entrée, feuille, plan et tracker, contenus/champs et empreintes. Un reçu temporaire supprimé n’est pas un livrable de preuve.
3. Une nouvelle exécution du banc modifie date, UUID, durées et journaux ; vérifier ensuite l’ancien sceau échoue. Vérification existante seule et nouvelle exécution en emplacement neuf doivent réellement fonctionner sans modification des preuves précédentes. Scellement explicite ; aucun rafraîchissement silencieux des pins.
4. Les deux python.exe ne couvrent ni le home choisi par pyvenv.cfg ni les DLL/stdlib/.pth. Employer la base maîtrisée hors projet, `-I -S -B`, environnement filtré et empreinte effective comme dans `runtime.ts`. Éprouver home/venv/site/empreintes sur copies et fixtures seulement ; ne modifier aucun runtime réel. Le lanceur initial de reproduction doit lui aussi éviter la voie venv non isolée. Les scripts Python passent par uv offline/no-project/no-config, sans résolution/installation.
5. `roster.agent_identity` avale ConfigError/OSError : cas d’agent installé avec TOML de personnalisation invalide, distinct de l’appel config direct. Exiger des erreurs sourcées/refus avant utilisation plutôt qu’un repli masqué.
6. `context()` lit17initiatives de1Mio au-delà des16Mio et ne possède pas de révision propre. Borne cumulée, preuve versionnée et invalidation d’initiative à skills inchangés doivent être éprouvées ; ne scanner que les données de contexte exploitées, sans parcourir tout l’output et ses binaires.

## KEEP

Préserver M1–M15 et leurs cas positifs/négatifs, garde native du handle avant lecture, hardlink/jonction/ancêtre remplacé réellement éprouvés ; snapshots sûrs ; fonctions officielles réellement utilisées ; métadonnées et aides séparées de l’exécution ; fusion à trois couches ; inventaire local partiel explicable ; zéro fournisseur/réseau/moteur ; preuves produit/gérées conservées et nettoyage même après échec. Les échecs initiaux restent dans l’archive, pas transformés en succès.

Les faits initiaux restent historiques :15/15tests,87assertions,46contrôles du premier banc,558inputs identiques. Ces nombres ne prouvent pas les six cas nouveaux. Le parent a également relancé15/15 et46/46 ; son premier appel du vérificateur trop précoce a correctement refusé les fixtures encore actives, puis a passé après leur retrait. Un calcul PowerShell de Count sur collection de propriétés a donné faux ; la comparaison Node par558clés et empreintes a confirmé l’égalité complète. Aucun défaut produit déduit de ces erreurs d’instrumentation.

Parent propriétaire de cette note, de l’archive, des rapports de revue, de la continuité et des commits. Le nouveau worker possède les nouveaux fichiers du banc et les notes/tâches du plan hors bloc figé. Il n’est pas seul : respecter les éditions du parent, ne pas les annuler. Ne pas lancer d’autres agents d’implémentation, ne pas toucher produit/managed/AppData. Le profil reste candidat documentaire pour2.17/2.2, G2 intégré ouvert.
