# Relecture indépendante Sofia — epic 2

Date : 28 octobre 2026. Périmètre : Ticket, Set et Dependencies avant approbation déléguée du découpage. Conteneur relu avec `refined: true` ; 16 entrées planifiées, sans feuille ni plan. Cette relecture ne lance aucun Build et ne qualifie aucune capacité du produit.

## Verdict

Couverture R1–R15 et séquencement global cohérents. Trois corrections à trier avant approbation : extraction de quelques exigences, frontière entre contrats de mesure et parcours de rattachement, documentation des risques. Aucun besoin de question humaine supplémentaire identifié sous le mandat délégué. G1/1.11 et la qualification distincte de la refonte demeurent des prérequis ouverts.

## Fix

### F1 — Retirer les fragments de métadonnées source des exigences

`epic-projets-bmad.md:37` (R8), `:41` (R10) et `:55` (C1) conservent après le premier deux-points des fragments comme « l’expérience utilisateur ; contexte § Product Principles ; addendum… ) : ». Le texte métier hérité existe après ces fragments, et les sources complètes sont déjà citées dans l’initiative. Nettoyer ces trois préfixes sans changer les identifiants, leur parent ou le besoin. Les lignes actuelles ne respectent pas les phrases simples et références séparées demandées par Ticket / « Rules the template cannot carry ».

### F2 — Définir la frontière UX du rattachement avant 2.11

L’epic impose en Boundaries (`epic-projets-bmad.md:83`) que Sally complète le parcours R32 avant implémentation. La 2.11 (`tickets/tickets.toml:137–148`) établit les contrats/collecte mais sa vérification demande déjà de « Rattacher plusieurs tours et conversations à des US » et un « changement d’US explicite ». Sally arrive en 2.12, qui dépend de 2.11 et prépare l’affichage 2.13.

Un builder ne peut donc pas savoir si 2.11 doit déjà livrer une nouvelle commande utilisateur de rattachement, alors qu’aucun parcours R32 n’existe encore dans les companions. Lever cette ambiguïté dans les Notes de l’epic et les handoffs : soit 2.11 reste strictement contrats/collecte/persistance, vérifiée par un banc sans nouvelle UI, et 2.12 définit puis 2.13 livre aussi les commandes utilisateur de rattachement ; soit la définition UX nécessaire précède leur implémentation en 2.11. La première option conserve les 16 identifiants et la chaîne actuelle. Les règles de temps et données restent arrêtées par 2.10/Sofia/Winston avant 2.11.

### F3 — Consigner raison métier et contrôle supplémentaire des risques élevés

Le champ `risk` est renseigné sur le conteneur et les 16 entrées, mais aucune raison métier par ticket ni contrôle additionnel identifiable des `high` n’est consigné. « Rules the template cannot carry » exige une raison en une ligne et, pour un ticket à risque élevé, un contrôle au-delà de ses critères. Cela concerne ici 2.1–2.5, 2.7–2.8, 2.10–2.11, 2.13 et 2.16. Les `verify` actuels sont leurs vérifications normales ; la revue finale générale ne précise pas le contrôle supplémentaire propre à chaque risque.

Une courte table dans les Notes de l’epic, référencée par identifiant, peut porter les raisons et contrôles avant extraction des feuilles. Confirmer les niveaux au titre de la délégation existante ; ce constat n’ajoute aucun checkpoint humain routinier. Aucun montant ni estimation de durée n’est à proposer.

## Suggest

### S1 — Nommer le livrable des deux spikes

Les 2.1 et 2.10 nomment leurs questions et leurs consommateurs, mais pas une destination précise des réponses. Consigner dès maintenant le document de profil G2 et le document de décisions Q8/Q9, ou les faire nommer explicitement au début de leurs plans. Cela rend les handoffs vers 2.2 et 2.11 vérifiables sans assimiler un rapport de recherche à une capacité implémentée. Aucun chemin de code n’est nécessaire dans les exigences.

### S2 — Garder explicite la portée initiale de G2

« Établit G2 » en 2.1 doit rester la qualification des profils, structures, lectures et contrats nécessaires au tracer. La vérification intégrée des fonctionnalités multi-initiative et changements externes est construite en 2.3/2.5 puis consolidée en 2.16. Le texte actuel contient déjà ces limites ; les reprendre dans le verdict de 2.1 évitera qu’un profil qualifié soit lu comme une clôture anticipée du gate intégré.

## Ask

Aucun. Les vrais consentements ou actions réseau à venir restent humains quand nécessaires ; cette revue n’en a demandé ni exécuté aucun.

## Contrôles et preuves

Lectures intégrales : `AGENTS.md` ; `epic-projets-bmad.md` ; son `tickets/tickets.toml` ; l’initiative source ; DESIGN.md, EXPERIENCE.md et le contrat d’architecture companions. Lectures complémentaires : manifeste de l’initiative, décision personnelle locale, plan distinct de refonte, références `validate-checks.md`, `ticket.md`, `validate.md` et `slice.md` de l’invocation Sofia `dd01533c961313eb9047`.

Inspection ciblée des contrats et frontières actuelles : `src/contracts/index.ts`, `src/contracts/dialogue.ts`, `src/core/ports.ts`, profils BMad et ingestion d’événements Codex. Les invocations actuelles sont bornées à Mary/Forge ; le transport ne prouve pas une ingestion des événements d’usage. Le spike G2 et la qualification d’usage sont donc de vrais travaux, correctement placés avant leurs consommateurs. Aucune disponibilité de `bmad` générique ni donnée monétaire n’a été présumée.

La commande demandée a été exécutée avec `login:false` :

```text
uv run --no-cache C:/Sources/madness/.agents/skills/bmad-agent-po/scripts/tickets.py --project-root C:/Sources/madness status epic-projets-bmad
```

Elle a échoué avant `tickets.py`, lors de l’inspection de Python par uv : accès refusé à un fichier temporaire `interpreter-v4` sous le Temp du sandbox. Contrôle de remplacement en lecture seule, sur le même script et les mêmes arguments, avec Python 3.12 existant de `.venv` et `PYTHONDONTWRITEBYTECODE=1` : sortie 0. Résultat concordant avec `.working/sofia-epic2-status.json` : 16 `planned`, `next_id:17`, `unpinned_after:[]`, `undeclared_after:[]`, `order_conflict:[]` ; aucune feuille, aucun drift ni cycle signalé. L’échec uv n’est pas présenté comme un échec du découpage.

### Couverture effective

| Besoin local | Livraisons principales | Intégration |
|---|---|---|
| R1–R4 : projets, diagnostic, initiatives et contexte | 2.1/2.2 référence et aide ; 2.3 multi-initiative ; 2.5 fraîcheur ; 2.9 accueil | 2.16 |
| R5–R7 : preuves, révisions, changements et acceptation | 2.4/2.5 ; 2.8 aperçu ; 2.9 attentes ; 2.11/2.13 mesures sourcées | 2.16 |
| R8–R10 : aide, catalogue, fiches et lancement | 2.1 qualification ; 2.2 tracer ; 2.6 inventaire ; 2.7 lancement | 2.16 |
| R11–R13 : fichiers, navigation et accessibilité | 2.8/2.9 ; contrats 2.12 ; variantes/contrôles 2.14 | 2.16 |
| R14 : français/anglais et deux thèmes | 2.12 contrats avant 2.14 | 2.16 |
| R15 : temps/coût par US | 2.10 décisions et données ; 2.11 contrats/collecte ; 2.12 UX ; 2.13 parcours et affichage selon F2 | 2.16 |

Les `covers` existent tous. Les chevauchements apportent des parties distinctes et la 2.16 contrôle leur intégration ; le sweep n’absorbe aucune exigence. Pas de report implicite de R32, du catalogue complet installé ou des échecs éditeur. Initialisation, graphe/Graphify et suivi de notre développement restent hors de ce lot.

### Dépendances, collisions et ressources

La chaîne 2.1→2.14 est motivée par les handoffs de profils, contexte, preuves/fraîcheur, fiches/lancement, destinations fichiers/accueil puis modèle de mesure. Les références transversales à 1.11 consomment réellement le paquet et les garanties G0/G1. Les opérations touchent les mêmes contrats, cœur, Main/preload et renderer ; la voie ordonnée évite des changements concurrents. Aucune paire d’entrées sans chemin de dépendance ne partage de ressources à exécuter en parallèle.

La 2.10 reçoit réellement le paquet figé et le contexte de 2.9, avec rapports/fixtures/prototypes isolés, sans modifier les sources produit. La 2.11 attend bien 2.9 et 2.10. Aucun banc natif concurrent ou partage de profil personnel n’est proposé. La frontière F2 doit toutefois être rendue explicite avant cette entrée.

Le tracer 2.2 est démontrable dans le paquet Windows, avec conversation conservée et refus observables. L’exception plaçant la qualification 2.1 avant ce tracer est une décision datée et déléguée ; elle n’est pas remise en question. Aucun setup humain déjà connu n’est inventé. Le sweep 2.15 attend tous les 2.1–2.14 et reste nettoyage seulement ; l’E2E 2.16 vient ensuite et transmet la contribution éditeur G3 à l’epic 3. La 1.11 et la refonte ne sont pas déduites réussies de ces liens.

### Vérifications exécutables

Les entrées possèdent toutes description et approche `verify`. Elles demandent des observations accessibles dans le paquet, des fixtures ou des rapports ; les effets attendus et refus principaux sont identifiables sans renvoyer au code. À ce niveau de découpage, l’absence de critères de feuille détaillés n’est pas un défaut : aucun bug, `refine=true` ni feuille sans entrée n’est créé. Les plans devront fixer les commandes et témoins concrets, les limites de profil, l’artefact exact, les cas d’erreur et les contrôles supplémentaires des risques élevés. Les vérifications de coût acceptent explicitement l’indisponibilité ; des champs de schéma seuls ne valent pas preuve de données reçues.

Relecture documentaire seulement : aucun compte, modèle, application, réseau, installation ou commit exécuté. Seul ce rapport est ajouté par ce relecteur.

## Recontrôle ciblé — 28 octobre 2026

Le rapport initial ci-dessus reste historique. Ce complément porte sur les fichiers corrigés : 17 entrées, identifiants 1–16 préservés, nouvel identifiant 17, ordre `1 → 17 → 2–10 → 12 → 11 → 13 → 14 → 15 → 16`.

| Constat | Verdict | Preuve de correction ou reliquat |
|---|---|---|
| F1 — Dérivation des exigences | **Résolu** | Comparaison textuelle des lignes métier après leur parenthèse source : 15 exigences et 7 contraintes exactement identiques aux lignes parentes. R8/R10/C1 ne portent plus de fragments de métadonnées. Identifiants et rattachements inchangés. |
| F2 — Frontière UX du rattachement | **Résolu** | La nouvelle 2.17, après 2.1 et avant 2.2, définit les parcours généraux, dont choix d’initiative et fichiers. La 2.12 attend 2.10 et définit R32 avant 2.11/2.13. La 2.11 précise « sans nouvelle UI » dans description et vérification ; la 2.13 livre explicitement le rattachement utilisateur et la consultation. L’inconnue Q8/Q9 est portée une fois par 2.12 et transmise à ses consommateurs par leurs prérequis. |
| F3 — Raisons et contrôles de risque | **Partiel** | `risk: high` est présent sur le conteneur, mais la table de raisons métier et contrôles supplémentaires annoncée par le parent est absente des Notes dans la révision effectivement lue. Le fichier se termine après « Waits on epic-boucle-codex because… ». Les recherches de raisons/contrôles supplémentaires n’en retrouvent aucune. Le passage à `high` ne résout pas à lui seul ce constat. |
| S1 — Destination des spikes | **Résolu** | La 2.1 nomme `qualification-profil-g2/profil-g2.md` ; la 2.10 nomme `qualification-mesures-us/decisions-et-donnees.md` sous l’epic. Ce sont des destinations à produire pendant les spikes, pas des preuves déjà disponibles. |
| S2 — Portée initiale de G2 | **Résolu** | La 2.1 qualifie des primitives et un profil candidat et précise « sans clôturer G2 intégré ». Les fonctionnalités et leur contrôle final restent portés par 2.3/2.5 et 2.16. |

### Reliquats mécaniques du nouveau séquencement

- La description de 2.14 dit encore « variantes de12 », alors que 2.17 porte désormais les variantes générales et 2.12 seulement celles de R32. Nommer les deux producteurs pour que le handoff corresponde à l’intégralité des surfaces à traduire. Leur accès par la chaîne de dépendances est déjà correct.
- La description du sweep 2.15 limite encore les constats aux « plans1–14 » ; son `after` inclut correctement 17, et les Notes de l’epic décrivent bien le sweep de tous les autres travaux. Inclure explicitement le plan17 dans sa description pour ne pas perdre ses éventuels constats différés.

Ces deux corrections ne demandent ni nouvelle entrée, ni modification des identifiants ou dépendances, ni question humaine. Elles restent à appliquer par le parent, propriétaire des tickets.

### Contrôles structurels et limites de ce recontrôle

Les JSON `status` et `next` actualisés et fournis par le parent ont été relus : 17 `planned`, `next_id:18`, aucune entrée prête ou en cours, `unpinned_after:[]`, `undeclared_after:[]`, `order_conflict:[]`. Les deux seules inconnues sont la qualification de refonte sur 2.1 et Q8/Q9 sur 2.12. Les identifiants des anciennes entrées sont conservés ; le sweep attend aussi 17. La nouvelle chaîne conserve une seule voie pour les ressources partagées et ne crée ni cycle ni collision parallèle.

La commande `uv run --no-cache … tickets.py … status epic-projets-bmad` a été retentée avec `login:false` ; uv a de nouveau échoué sur l’écriture de son fichier temporaire d’inspection d’interpréteur dans le sandbox, avant le script. Aucun lancement Python direct n’a été utilisé pour ce recontrôle : les résultats structurels cités sont ceux des JSON du parent, confrontés au manifeste relu.

La correction ciblée T1 de Sally est observée dans EXPERIENCE.md, Information Architecture : diagnostic complet et G2 appartiennent à l’epic 2 ; l’epic 3 consomme ce diagnostic pour l’initialisation. Sa trace dans `preparation-refonte-2026-10-28/update-contracts.md` conserve les limites de spécification et d’intégration.

Verdict à cet instant : F1/F2/S1/S2 résolus ; F3 partiel et deux descriptions à aligner. Aucun obstacle de périmètre ou besoin de décision humaine supplémentaire identifié. G1/1.11 et refonte restent ouverts ; aucune qualification réelle, aucun Build2, compte, modèle, application, réseau ou commit exécuté par ce relecteur.

## Verdict final des reliquats — 28 octobre 2026

Recontrôle limité aux trois éléments corrigés après le complément précédent, sans rouvrir les constats déjà résolus.

- **F3 résolu.** Les Notes de l’epic contiennent effectivement la décision datée motivant le risque `high` du conteneur et une table des 17 entrées. Chaque ligne donne le niveau et sa raison métier ; chaque entrée `high` nomme un contrôle supplémentaire, notamment relecture indépendante, audit de frontières, essai de course ou contre-exemples. La relecture de matrice/ASAR/runtime et conservation avant clôture couvre aussi le risque de conclusion du conteneur. Il s’agit de contrôles à réaliser, sans réussite anticipée.
- **Handoff 2.14 résolu.** Sa description cite désormais « les variantes générales de17 et les compléments de mesure de12 » sur toutes les surfaces intégrées.
- **Périmètre du sweep 2.15 résolu.** Sa description inclut désormais les constats différés des « plans1–14 et17 », en accord avec son `after` et les Notes.

**Tous les constats F1–F3, suggestions S1/S2 retenues et reliquats de ce rapport sont résolus. Aucun autre reliquat concret n’est observé dans ce recontrôle ciblé.** L’historique des lectures précédentes reste conservé. Cette conclusion porte sur la préparation documentaire du découpage ; elle ne clôt pas G1/1.11 ou la refonte et ne démarre aucun Build2. Aucun code, programme UI, modèle, profil, réseau ou commit exécuté par ce relecteur.
