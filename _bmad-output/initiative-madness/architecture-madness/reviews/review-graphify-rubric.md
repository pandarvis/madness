# Revue rubric — extension Graphify

**Verdict : extension cohérente, avec une correction moyenne à apporter avant finalisation.** AD-10/G5 respectent les choix du porteur et permettent de découper la qualification sans prétendre que Graphify est déjà intégré. L'isolation des écritures entre analyses reste insuffisamment explicite pour garantir le rattachement du graphe au bon projet. Aucun constat critique ou élevé.

## Périmètre

Revue du 23 octobre 2026 limitée à AD-10, G5 et leurs raccordements aux conventions, au seed et à Deferred. La baseline AD-1–AD-9 et ses rapports sont préservés ; elle n'est pas réévaluée ici.

Documents lus : spine actuel, `references/reviewer-gate.md`, `.working/recherche-graphify.md`, `.working/graphify-sources.json`, `PRODUCT.md` et ticket `initiative-madness.md`. Les choix confirmés sont traités comme contraignants : code/modules/fichiers/dépendances d'abord, génération locale à la demande, graphe en V1 après la base Windows/Codex, usage optionnel mais qualification requise pour clôturer la V1. Aucun R25 n'est créé ni supposé adopté.

Il s'agit d'une revue documentaire. Aucun Graphify installé ou exécuté, aucun graphe généré, aucun résultat Windows ni appel de modèle testé par cette revue.

## Constat actionnable

### RUB-G1 — Moyenne — Les processus sont isolés, mais leurs fichiers peuvent encore se croiser

**Emplacement :** AD-10, premier paragraphe ; G5 « écritures/cache confinés ». **Divergence concernée :** adaptateur d'analyse, gestionnaire des espaces temporaires et propriétaire des snapshots.

AD-10 impose un processus isolé par analyse et place CWD, sorties et cache dans « un espace Madness isolé ». Cela exclut les écritures dans le projet, mais ne dit pas explicitement que l'espace d'une analyse doit être distinct de celui des autres analyses. G5 vérifie le confinement et les projets multiples, sans préciser cette séparation. L'isolation de mémoire des processus ne protège pas un même `graphify-out/` de leurs écritures concurrentes.

**Contre-exemple :** l'adaptateur lance une analyse pour le projet A puis une pour B, avec deux processus et deux racines explicites, mais le même répertoire de travail Madness. Les deux CLI écrivent dans le même répertoire de sortie. L'analyse B termine en premier ; l'adaptateur A lit cet export, valide outil/type/schéma, puis lui joint le contexte A de sa demande. Le snapshot est conforme au schéma et stocké hors des sources, mais son graphe appartient à B. La vérification du chemin lors de la sélection d'un nœud arrive trop tard pour corriger ce graphe déjà mal attribué.

**Correction minimale :** imposer des espaces de travail et de sortie distincts par projet **et** analyse, avec résultat corrélé à l'analyse attendue avant normalisation/publication. Un cache mutualisé ne doit être réutilisé que sous une identité de provenance compatible explicitement validée. Aucun format de répertoire, moteur de cache ou identifiant technique précis n'est à imposer dans le spine.

**Traitement proposé :** correction directe d'AD-10 ; inclure la non-collision de deux analyses dans G5. Cela reprend la séparation par projet/analyse déjà proposée dans la recherche et n'exige pas d'exécuter G5 maintenant.

## Good-spine checklist

| Critère | Évaluation de l'extension |
|---|---|
| Invariants à l'altitude initiative | Bon niveau : port d'analyse commun, rattachement au projet, provenance, fraîcheur, absence de modèle implicite et séparation d'avec les agents/BMad empêchent des divergences entre lots. RUB-G1 complète l'isolation sur disque. |
| Règles applicables et propriétaires | Le cœur possède le port et `GraphSnapshot`, l'adaptateur normalise, la UI ne consomme pas le JSON tiers. Le coordinateur suit analyse et fermeture. Les contrats précèdent leurs consommateurs ; le choix du rendu ne peut les redéfinir. |
| Cohérence avec la baseline | Renderer sans fichiers/processus, validation aux frontières, coordination du cœur, ressources locales et états connus/inconnus sont conservés. Graphify n'est ni un fournisseur d'agent supplémentaire ni une autorité sur les preuves et validations BMad. |
| Fraîcheur et données | Projet/racine/périmètre/révision incluent les changements non commités. Une modification pendant l'analyse interdit d'afficher un résultat actuel. Rafraîchissement et annulation conservent le dernier snapshot complet connu ; provenance et confiance restent visibles. Le sens des relations est normalisé selon le profil observé, sans prendre `directed: false` comme vérité suffisante. |
| UX prioritaire | AD-8 s'applique ; recherche et liste de relations accessibles complètent la visualisation. La sélection rejoint le panneau existant avec vérification de référence. Sally définit la vue avant implémentation ; aucun écran ou parcours Graphify n'est déclaré déjà accepté. |
| Opérations et environnement | Runtime Python/paquet Windows, code-only sans modèle, sorties/cache, interruption, erreurs, performances et accessibilité sur dépôt représentatif sont couverts par G5 ou explicitement délégués avant consommation. L'absence du module ne bloque pas les parcours BMad. RUB-G1 distingue confinement hors projet et séparation entre analyses. |
| Deferred sans différend caché | Rendu, seuils de projection et runtime/profil ont une condition de résolution ; notices au packaging ; enrichissement sémantique et MCP hors premier profil. Aucun propriétaire parallèle des contrats n'est créé. La seule ambiguïté retenue est celle de RUB-G1. |
| Technologies et preuves | Version de paquet `graphifyy` distinguée de la branche `v8`, exigence Python, sources datées et SHA fournis. Le spine annonce une version déclarée dans le dépôt, pas un paquet installé. Le choix du paquet réellement distribué et sa compatibilité restent à G5 ; cette revue ne reproduit pas la recherche amont. |
| Seed minimal et frontière avec le code | Un adaptateur supplémentaire, sans copie d'arbre tiers ni schéma complet. Les détails `_src`/`_tgt` sont bornés au profil observé ; l'invariant est la préservation du sens et de la provenance. Le rendu et les détails du runtime restent au lot concerné. |
| Qualification avant disponibilité | G5 bloque disponibilité du graphe et clôture du périmètre V1 ; G4 distingue désormais parcours BMad qualifiés et V1 complète. Il est légitime de découper ces travaux maintenant, sans considérer leurs preuves comme acquises. |

## Réconciliation produit et ticket

- `PRODUCT.md` contient bien Graphify en V1 après Windows/Codex, avec génération locale à la demande et premier profil code/modules/fichiers/dépendances. AD-10 et G5 traduisent cette décision ; « optionnel » qualifie l'utilisation, sans permettre d'omettre l'outil pour clôturer la V1.
- Le ticket conserve R1–R24 et ne formalise pas encore cette extension. Le spine la nomme comme demande à dériver par Sofia, la distingue dans sa Capability Map et la place dans Deferred pour le découpage. Ce décalage est déclaré ; il ne justifie ni une exigence inventée dans cette revue ni la remise en question du choix utilisateur.
- La priorité UX et les contrats existants restent applicables. Les exigences et les nouveaux détails de parcours doivent être dérivés avec Sofia/Sally avant leurs consommateurs, sans transformer les propositions de la recherche en maquettes approuvées.
- Aucune intégration sémantique aux documents BMad, utilisation obligatoire du graphe ou nouvelle dépendance à un fournisseur de modèle n'est ajoutée.

La correction RUB-G1 suffit au regard de cette revue ; aucune réalisation de G5 ni nouveau choix produit n'est demandé à ce stade.

## Recontrôle ciblé après correction — 23 octobre 2026

**Verdict actuel : RUB-G1 résolu.** Le constat initial ci-dessus est conservé comme historique ; sa réserve est levée dans le spine corrigé.

AD-10 exige maintenant un CWD, des sorties et un cache dans un espace distinct par projet **et** analyse, sans partage avec une autre analyse, ainsi qu'une vérification de l'identité projet/analyse avant publication. G5 reprend le confinement par projet/analyse. Le contre-exemple de deux processus lisant ou écrasant le même export est donc exclu par le contrat commun.

Les effets immédiats des autres précisions ont été vérifiés : `GRAPHIFY_NO_AUTO_REFRESH=1` et `GRAPHIFY_OUT=graphify-out` sont imposés au seul processus enfant ; le chemin relatif reste dans son CWD isolé. Le cœur possède le port, le contrat et les règles communes ; l'adaptateur assure décodage, validation et normalisation selon ce contrat. Deferred ne transfère plus cette propriété. Ces précisions renforcent l'isolation sans affaiblir la frontière cœur/adaptateur ni modifier l'environnement utilisateur.

**Problème nouveau induit : aucun constaté dans ce périmètre.** Ce recontrôle est documentaire et ne valide pas le comportement réel du CLI ; les preuves restent à produire en G5. La finalisation peut se poursuivre au regard de cette revue.
