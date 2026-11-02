# Audit indépendant des frontières — tour6, 30 octobre2026

Relecteur frais /root/g2_boundary_final_v5, rôle technique Security Engineer,
inspection seule du même diffqORZJB et des gardes environnantes.

- BV5-1 — run.ps1:90 marqueSupervised avant l'appel ; supervision.ps1:154–156
  valide les destinations et écrit le premier état AVANT son try/finally.
  Si cette écriture échoue après création/copie des ressources, aucun enfant
  ne démarre et ni le finally interne ni le cleanup extérieur conditionnel ne
  s'exécute : OWNED_ALREADY_EXISTS bloque le prochain appel. Mettre cette
  initialisation sous le finally et préserver un secours extérieur pour un
  échec d'entrée. Le parent vérifie/grade/route dans le plan.

## Recontrôle du correctif — résolu

Le même relecteur /root/g2_boundary_final_v5 a réexaminé le chemin BV5-1
après le patch : gardes/écriture initiale dans le try/finally, observation de
l'état transmise par référence et Supervised confirmé seulement au retour.
Le secours extérieur conserve started/PID et retire les ressources possédées.
La preuve ciblée imbriquée confirme les échecs avant/après enfant, job0 et
trois ressources retirées. Verdict : « BV5-1 résolu pour le chemin examiné » ;
aucun problème restant sur ce chemin précis. Inspection seule, sans test
exécuté par le relecteur. Le parent a ensuite exécuté le full finald499…15/15
et les actions107/106/107/106 ; voir parent-verification.md.
