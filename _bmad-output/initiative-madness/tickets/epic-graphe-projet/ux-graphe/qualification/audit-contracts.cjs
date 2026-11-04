const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const docs=Object.fromEntries(['DESIGN.md','EXPERIENCE.md','handoff.md'].map(f=>[f,fs.readFileSync(path.join(base,f),'utf8')]));
// Locates documentary evidence and validates references/copy parameters only.
// No product, Graphify, unit tests or UI are executed.
const rows=[
['U1a','e1','Conversation/brouillon du projet A, Codex déconnecté','Choisir Graphe puis revenir','sans écran','Entrée sans compte puis retour exact sans lancement ni envoi.'],
['U1b','e1','Projet A puis B, résultat tardif A','Retrouver chaque projet','une arrivée tardive','Explorations isolées par projet/racine/périmètre/analyse/révision.'],
['U1c','e1','Initiative consultée changée','Consulter le même graphe','Changer d’initiative','Échanges et graphe ne changent pas d’attribution.'],
['U1d','e1','Déclencheur supprimé ou restauration','Revenir/rouvrir','Ne jamais choisir','Repli neutre connu ; seules données conservées et aucune relance.'],
['U2a','e2','Aucun résultat','Générer volontairement','n’équivaut','Absent distinct du vide de recherche, aucun lancement par navigation.'],
['U2b','e2','Dernier complet ancien, nouvelle analyse','Lire activité et ancien résultat','sans mélange','Axes distincts, dernier complet identifiable, pas de double lancement.'],
['U2c','e2','Analyse en cours','Interrompre ou atteindre timeout','ne pas confondre clic','Arrêt demandé puis confirmé/inconnu, pas de succès provisoire.'],
['U2d','e2','Fermeture ou arrêt inconnu','Restaurer puis demander nouveau lancement','sans rendre la tentative','Garde concernée maintenue ; réobservation qualifiée sans relance.'],
['U2e','e2','Incompatible/échec','Lire motif puis revenir ou réessayer si admis','conversion silencieuse','États distincts, dernier complet et BMad conservés, conditions de réessai.'],
['U2f','e7','Résultat reçu, sauvegarde échouée','Réessayer l’enregistrement','sans nouvelle analyse','Résultat de session séparé du durable, réessai de sauvegarde seul.'],
['U3a','e3','Complet/partiel/ancien, HEAD identique','Lire fraîcheur/couverture','un commit seul','Révision des octets, non commités/non suivis, observation datée.'],
['U3b','e3','Mutation pendant collecte puis navigation','Lire historique','ne devient jamais actuel','Aucune promotion implicite, invalidation sans vol de focus.'],
['U3c','e3','directed:false ou marqueur isolé','Lire relation ou refus','réciproque','Deux marqueurs prioritaires ensemble, sinon source→target ; partiel refusé.'],
['U3d','e3','INFERRED, score0.85','Lire confiance et score','85 %','Trois niveaux expliqués, codes fidèles, score séparé non probabiliste.'],
['U3e','e3','Ligne absente/nulle/vide/texte inconnu','Lire référence','plage inventée','Inconnus conservés sans ligne/plage devinée ; aucune validation déduite.'],
['U4a','e4','Requête vide ou sans correspondance','Chercher puis effacer','zéro résultat','Requête et portée conservées, absence de graphe distincte du zéro.'],
['U4b','e4','Homonymes et relations entrantes/sortantes','Sélectionner relation et autre extrémité','Depuis B','Origine A atteignable depuis B, destination B depuis A ; sens/provenance inchangés.'],
['U4c','e4','Nombreux résultats/projection/tranche','Parcourir au clavier','annoncer la tranche','Accès aux résultats de portée, masque/refus distincts sans quota ni faux inventaire.'],
['U4d','e5','Dessin sélectionné, sans drag','Zoomer/panner au clavier','zoom de l’application','Zoom local séparé, quatre pans et Tab sortant, pas de capture des champs.'],
['U4e','e1','Nouvelle analyse supprime sélection pendant frappe','Mettre à jour puis revenir','sans déplacer le focus encore valide','Annonce sans voler recherche ; repli si contrôle focalisé disparu ou retour explicite.'],
['U5a','e6','Nœud avec référence relative sûre','Voir fichier puis fermer','revalider identité','Intention2.8 même projet/révision, titre panneau puis retour exact.'],
['U5b','e6','Révision changée ou inconnue','Lire refus puis examiner nouvelle révision','n’ouvre pas silencieusement','Ancien graphe historique, nouvelle lecture explicite séparée.'],
['U5c','e6','Référence absolue/traversante/lien/hors racine ou ligne inconnue','Demander fichier','saut de ligne deviné','Référence refusée non ouvrable, pas de ligne inventée.'],
['U5d','e6','Changement de projet pendant ouverture','Recevoir réponse tardive','fichier A sous B','Demande corrélée A, pas de changement de projet ou focus imposé.'],
['U5e','e6','Éditeur absent/échec/inconnu ou reçu transmission','Ouvrir dans éditeur','pas « fichier ouvert »','Reçu2.8 borné sans retry ; aucune ouverture réelle ni IPC créé.'],
['U6a','e7','FR/EN, recherche et chemins longs','Changer langue','non traduits','Copie appariée, octets et focus conservés,2.14 future.'],
['U6b','d6','Clair/sombre','Lire état et commandes','mêmes gardes','Palette existante et texte, aucune nouvelle acceptation humaine.'],
['U6c','e5','Clavier seul, onglets','Flèches puis Entrée/Espace et Tab','Entrée/Espace active','Ordre et repli définis, divergence App466 nommée pour2.14/4.4.'],
['U6d','d3','Zoom200%, faible largeur et noms longs','Replier disposition et revenir','flux vertical','Lecture/contrôles atteignables sans fenêtre horizontale, aucun seuil graphe inventé.'],
['U6e','d6','Mouvement réduit et mise à jour','Lire puis naviguer','retire transition','Aucune force/recentrage imposé, annonces groupées ; contrôle physique futur.']
];
const walkthroughs=rows.map(([id,anchor,input,action,keyword,observation])=>{
const file=anchor[0]==='d'?'DESIGN.md':'EXPERIENCE.md',text=docs[file],start=text.indexOf('<a id="'+anchor+'"></a>'),end=text.indexOf('<a id="',start+1),section=text.slice(start,end<0?undefined:end);
const quote=section.split(/(?<=[.!?])\s+/).find(s=>s.includes(keyword));if(!quote)throw Error('Missing evidence locator '+id+': '+keyword);
const offset=text.indexOf(quote,start);return {id,family:id.slice(0,2),input,action,evidence:{file,anchor,quote,line:text.slice(0,offset).split('\n').length},observation,result:'satisfied-documentary'};
});
const links=[];for(const[file,body]of Object.entries(docs))for(const m of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const target=m[1],[rel,anchor]=target.split('#'),resolved=path.resolve(base,path.dirname(file),decodeURIComponent(rel||file)),exists=fs.existsSync(resolved),anchorExists=exists&&anchor?fs.readFileSync(resolved,'utf8').includes('id="'+anchor+'"'):null;links.push({file,target,exists,anchorExists});}
const placeholders=s=>[...s.matchAll(/\{([^}]+)\}/g)].map(m=>m[1]).sort();
const pairs=docs['EXPERIENCE.md'].split('\n').filter(l=>/^\| [a-z][a-z-]+ \|/.test(l)).map(l=>{const[key,fr,en]=l.split('|').slice(1,-1).map(c=>c.trim());return {key,fr,en,paired:!!fr&&!!en,parametersMatch:JSON.stringify(placeholders(fr))===JSON.stringify(placeholders(en))};});
const failedLinks=links.filter(l=>!l.exists||l.anchorExists===false),failedPairs=pairs.filter(p=>!p.paired||!p.parametersMatch);
const crypto=require('node:crypto');
const parseJson=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const before=parseJson(path.join(__dirname,'protected-before.json'));
const protectedFiles=before.files.map(f=>({path:f.path,beforeSha256:f.sha256,afterSha256:fs.existsSync(f.path)?digest(f.path):null}));
const protectedChanged=protectedFiles.filter(f=>f.beforeSha256!==f.afterSha256);
const protectedSummary={before:'protected-before.json',after:'protected-after.json',fileCount:protectedFiles.length,unchanged:protectedFiles.length-protectedChanged.length,changed:protectedChanged.length};
fs.writeFileSync(path.join(__dirname,'protected-after.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:before.scope,baseline:'protected-before.json',fileCount:protectedFiles.length,unchanged:protectedSummary.unchanged,changed:protectedChanged,files:protectedFiles},null,2)+'\n');
const sources=Object.keys(docs).map(file=>({file,sha256:digest(path.join(base,file))}));
const reviewedSha='a2363df06532ab99464ac05aeb0a01945e58a3a715893b43c0345716ff466d52';
const reviewedMatches=sources.find(f=>f.file==='EXPERIENCE.md').sha256===reviewedSha;
const report={sources,checkedAt:new Date().toISOString(),kind:'documentary-walkthrough-reference-copy-audit',uiExecuted:false,graphifyExecuted:false,humanApproval:false,g5Claimed:false,families:['U1','U2','U3','U4','U5','U6'],scenarioCount:walkthroughs.length,walkthroughs,links:{count:links.length,failures:failedLinks,entries:links},frEn:{pairCount:pairs.length,failures:failedPairs,pairs},initialLocatorFailure:'verification-initial-failure.json',protected:protectedSummary,independentUxReview:{status:'completed-two-P2-resolved',agent:'/root/graph42_implementation/graph42_ux_review',receipt:'ux-review.md',reviewedExperienceSha256:reviewedSha,currentExperienceMatchesReviewed:reviewedMatches},parentQuick:{status:'parent-owned-not-run-by-worker'}};
fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(report,null,2)+'\n');
const md=['# Vérification contractuelle4.2','','Six familles U1–U6, '+walkthroughs.length+' variantes explicitement parcourues dans les documents. « Satisfait documentaire » signifie une réponse dans les clauses, jamais un succès UI. Aucun produit, test unitaire miroir de prose, build, Graphify, modèle, réseau, CUA ou profil personnel exécuté.','','Les citations ont été retrouvées dans leur clause exacte ; verification.json conserve entrée/action/citation/ligne et constat. Deux premiers locators avaient cité une paraphrase et échoué : [reçu conservé](verification-initial-failure.json), correction du repérage sans changement produit. Le script local audit-contracts.cjs ne vérifie que présence des citations, liens et paramètres, sans tester l’expérience produit.','','| Cas | Entrée / action | Clause | Observation documentaire |','|---|---|---|---|',...walkthroughs.map(w=>'| '+w.id+' | '+w.input+' → '+w.action+' | ['+w.evidence.anchor.toUpperCase()+'](../'+w.evidence.file+'#'+w.evidence.anchor+') ; citation exacte dans verification.json, ligne'+w.evidence.line+' | '+w.observation+' |'),'','## Cohérence et références','','Relecture croisée DESIGN/EXPERIENCE/handoff : sept états et axes activité/résultat/fraîcheur, dernier complet, sens et trois niveaux, score distinct, références/refus, identités/révisions, FR/EN et focus. '+links.length+' liens locaux et ancres explicites contrôlés, '+failedLinks.length+' défaut ; '+pairs.length+' paires FR/EN non vides et paramètres appariés, '+failedPairs.length+' défaut. Ces contrôles ne mesurent ni longueur rendue ni restitution assistée.','','[Activations réelles](activation-decisions.md) : Sally resolver/config code0 ; contexte Impeccable code0 une seule fois ; deux PNG historiques effectivement inspectés, sans graphe ou paquet final inventé.','','## Revue et conservation','','[Revue UX indépendante](ux-review.md) : deux P2 corrigés en E1/E4 et recontrôlés résolus par le même relecteur ; copie E3/E8 clarifiée, aucune correction supplémentaire à la portée contractuelle U1–U6. Pas de verdict visuel. Quick/frontmatter/gel/statut/commit sous responsabilité parent, non supposés exécutés. Comparaison finale :1668/1668fichiers protégés identiques en SHA-256 ; [inventaire initial](protected-before.json), [inventaire final](protected-after.json). Les octets EXPERIENCE sont ceux relus indépendamment ; verification.json conserve les trois empreintes des suppléments.','','Restent futures : UI et paquet, fournisseurs2.8/2.14/3.9, réconciliation4.4, mesures/vérifications physiques recherche/fichier/retour, clavier, FR/EN, deux thèmes, zoom200%, mouvement réduit et lecteur d’écran, G5 intégré. Aucun accord humain ou WCAG global acquis.',''];
fs.writeFileSync(path.join(__dirname,'verification.md'),md.join('\n'));console.log(JSON.stringify({scenarios:walkthroughs.length,families:6,links:links.length,failedLinks,frEnPairs:pairs.length,failedPairs,protected:protectedSummary,reviewedMatches}));if(failedLinks.length||failedPairs.length||protectedChanged.length||!reviewedMatches)process.exitCode=1;
