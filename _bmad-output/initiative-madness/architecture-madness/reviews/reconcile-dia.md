# Réconciliation de la référence DIA — 23 octobre 2026

**Verdict : conforme, aucun écart bloquant.** Le spine utilise DIA comme retour d'expérience du porteur sur Electron dans son environnement. Il n'impose ni Angular, ni la chaîne de construction de DIA, ni un auto-updater. Le choix propre à Madness — electron-vite, React, TypeScript et electron-builder — reste explicite.

## Vérifications

Lecture seule des trois fichiers DIA autorisés, puis du spine et de `.working/maintenance-desktop.md` :

- `apps/desktop/package.json` déclare Electron `^44` et electron-builder `^26.15.3`. Sa commande `package` aboutit à `electron-builder --win zip --x64` ; `electron-builder.yml` confirme le ZIP Windows x64. Ces déclarations ne prouvent ni les versions résolues ni l'exécution réussie du paquet.
- `apps/web/package.json` déclare Angular `^21.2.18`, CLI/build `^21.2.19`, TypeScript `~5.9.2` et Transloco `^8.4.0`. Le document de maintenance restitue correctement ces plages et les distingue des versions résolues. Aucune obligation de les reprendre n'est portée dans le spine.
- Le fonctionnement d'Electron dans l'environnement du porteur est un fait rapporté par celui-ci. Le proxy accepte une version supérieure à un minimum encore à établir ; le spine laisse cette qualification ouverte. Les previews autorisées ne sont pas transformées en exigence de stabilité exclusive.
- AD-9 exige mises à niveau explicites, reconstruction vérifiée, republication et conservation des données hors des binaires. L'auto-updater est explicitement non requis pour la première livraison. Aucun mécanisme de mise à jour automatique de DIA n'est présenté comme une capacité à copier.
- AD-9 et la note de maintenance maintiennent la vérification séparée du réseau et des certificats de chaque connecteur. Le fonctionnement du renderer Electron ne vaut pas preuve pour Codex, Claude Code ou Copilot.

## Précision de portée

La phrase de maintenance « Aucun appel à un updater n'est repéré dans les sources desktop et scripts parcourus » décrit une inspection antérieure plus large que les trois fichiers DIA autorisés pour cette réconciliation. Cette passe constate seulement qu'ils ne déclarent pas de mécanisme d'updater ; elle ne peut pas établir son absence dans tout le code. La confirmation du porteur conserve sa valeur de source déclarative. Aucun changement d'architecture n'en découle ; attribuer explicitement cette absence au porteur éviterait toute ambiguïté de preuve.

Aucun fichier DIA ni autre livrable n'a été modifié par cette réconciliation.
