# Qualification de la charte atelier

État courant : **Build UI terminé**, candidat 0.2.1 non installé. La story 2.2 reste en revue, M14 ouvert.

Lire [la vérification parent](parent-verification.md), [le verdict de finition](finish-verdict.md), [le recontrôle Quick](quick-recheck.md) et [l’index actuel des 31 captures](review-fixed/review-index.json). Cet index porte le paquet ASAR486cfe… : 30 images de la matrice et une recapture native complète à 200 %. Le profile brut garde explicitement l’ancienne coupe rejetée.

Les résultats et rapports ci-dessous sont **historiques**. Ils conservent les échecs intermédiaires ; les premières captures24 et leur paquet fa413… ne sont pas ceux du candidat final. Les corrections de banc, confirmations ciblées, revues, provenance des assets et limites sont documentées dans le rapport parent.

## Historique avant clôture

Les deux premiers essais de readiness de fonte ont échoué avant tout PNG. Le contrôle Main a établi le refus403 de TTF ; seule cette extension est ensuite admise sous la racine renderer confinée. Le rapport natif suivant conserve19contrôles applicables conformes et une anomalie de port préexistante séparée : son statut global reste failed. La synthèse scoped est dérivée, pas une nouvelle exécution verte.

Le premier lot visuel contient5PNG valides inspectés, puis s’arrête sur1323 demandé /1324 obtenu àDPI1.25. Le helper de qualification borné journalise désormais demandé/réel et vérifie le même côté de chaque breakpoint ;1322modal et1324docké ont été observés. Les auteurs synthétiques commencent àorder1 et passent le contrat avant émission. Aucun produit ni pixel modifié pour ces corrections de banc.

Le premier fichier UI complet donne44/45, une égalité de scroll codée70 à la place de la position native70,400… ; le diagnostic a ensuite révélé une vraie perte de focus lorsqu’une fiche de priorité inférieure était rouverte sous une modale. Le correctif conserve cette modale et diffère le reflow. Quatre gardes ciblées passent. Les sorties initiales restent conservées ; aucune suite globale verte n’est déduite.
