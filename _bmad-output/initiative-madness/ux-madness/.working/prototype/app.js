(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const shapes = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 11h18"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="m9 5 7 7-7 7"/>',
    arrowRight:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8m-8 4h6"/>',
    catalog:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-9.5A8.5 8.5 0 0 1 10.5 4H19a2 2 0 0 1 2 2Z"/><path d="M7 9h9m-9 4h6"/>',
    link:'<path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 -1)"/>',
    play:'<path d="m8 4 12 8-12 8Z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
    requirements:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9Zm0 9h6m-6 4h6"/>',
    ux:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    architecture:'<rect x="8" y="3" width="8" height="5" rx="1"/><rect x="2" y="16" width="8" height="5" rx="1"/><rect x="14" y="16" width="8" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
    tools:'<path d="M14 6a5 5 0 0 0-6 6L2 18a2.8 2.8 0 0 0 4 4l6-6a5 5 0 0 0 6-6l-3 3-4-4Z" transform="translate(1 -2)"/>',
    stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
    retry:'<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
    send:'<path d="M12 20V4m-6 6 6-6 6 6"/>',
    external:'<path d="M14 3h7v7m0-7L11 13M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v10m12-10a8 8 0 0 1-8 8H6"/>'
  };
  const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${shapes[name] || shapes.file}</svg>`;
  const groups = [
    {id:'cadrage',label:'Cadrage',icon:'compass',description:'Clarifier le problème, les utilisateurs et la promesse.',caption:'Brief proposé · à relire'},
    {id:'exigences',label:'Exigences',icon:'requirements',description:'Préciser les comportements attendus et découper le travail.',caption:'À définir'},
    {id:'ux',label:'Expérience utilisateur',icon:'ux',description:'Éprouver les parcours avant de choisir les détails de l’interface.',caption:'Prochaine action suggérée'},
    {id:'architecture',label:'Architecture',icon:'architecture',description:'Arbitrer les choix techniques à partir des besoins.',caption:'Décisions ouvertes'},
    {id:'realisation',label:'Réalisation & qualité',icon:'code',description:'Préparer, réaliser et vérifier un changement.',caption:'Selon le travail prêt'},
    {id:'transversaux',label:'Outils transversaux',icon:'tools',description:'S’orienter, challenger, relire ou adapter BMad à tout moment.',caption:'À tout moment'}
  ];
  const catalogue = window.CATALOGUE;
  const skill = id => catalogue.find(item => item.id === id);
  const group = id => groups.find(item => item.id === id);
  const navigationPreferenceKey = 'madness.prototype.navigationCompact';
  function readNavigationPreference() {
    try { return localStorage.getItem(navigationPreferenceKey) === 'true'; }
    catch { return false; }
  }
  const state = { view:'home', project:'madness', tab:'overview', stage:'ux', files:true, selectedFile:'brief', query:'', filter:'all', atlasInstalled:false, externalChange:false, sessions:{}, draft:'', navCompact:readNavigationPreference() };
  const navigationTooltip = document.createElement('div');
  navigationTooltip.id = 'navigation-tooltip';
  navigationTooltip.className = 'navigation-tooltip';
  navigationTooltip.setAttribute('role', 'tooltip');
  navigationTooltip.hidden = true;
  document.body.append(navigationTooltip);
  let tooltipOwner;
  let timer, toastTimer;
  const session = () => state.sessions[state.project];
  const projectName = () => state.project === 'atlas' ? 'Atlas' : 'Madness';
  const projectPath = () => state.project === 'atlas' ? 'C:\\Projets\\atlas' : 'C:\\Sources\\madness';
  const installed = () => state.project !== 'atlas' || state.atlasInstalled;
  const inProject = () => state.view === 'project';
  const statusNames = {running:'En cours',answer:'Réponse attendue',approval:'Approbation attendue',completed:'Tour terminé',stopped:'Interrompu',error:'Erreur récupérable'};
  const btn = (action,label,cls='',attrs='') => `<button type="button" data-action="${action}" class="${cls}" ${attrs}>${label}</button>`;
  function announce(text) { $('announcement').textContent = text; }
  function toast(text) { clearTimeout(toastTimer); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => $('toast').hidden = true, 4500); }
  function hideNavigationTooltip() {
    navigationTooltip.hidden = true;
    if (tooltipOwner) tooltipOwner.removeAttribute('aria-describedby');
    tooltipOwner = null;
  }
  function showNavigationTooltip(button) {
    if (innerWidth <= 720 || (!state.navCompact && button.dataset.action !== 'toggle-navigation')) return;
    hideNavigationTooltip();
    tooltipOwner = button;
    navigationTooltip.textContent = button.dataset.navTooltip;
    navigationTooltip.hidden = false;
    button.setAttribute('aria-describedby', 'navigation-tooltip');
    const bounds = button.getBoundingClientRect();
    navigationTooltip.style.left = Math.min(bounds.right + 9, innerWidth - navigationTooltip.offsetWidth - 8) + 'px';
    navigationTooltip.style.top = Math.max(8, Math.min(bounds.top + (bounds.height - navigationTooltip.offsetHeight) / 2, innerHeight - navigationTooltip.offsetHeight - 8)) + 'px';
  }
  function render() {
    hideNavigationTooltip();
    document.querySelector('.app-shell').classList.toggle('nav-compact', state.navCompact);
    renderSidebar(); renderTopbar();
    const isProject = inProject();
    $('workspace-body').classList.toggle('hide-files', !state.files);
    $('workspace-body').classList.toggle('show-files', state.files);
    $('files-panel').hidden = !isProject || !installed();
    $('main').innerHTML = state.view === 'home' ? homeHTML() : state.view === 'catalogue' ? standaloneCatalogue() : projectHTML();
    if (isProject && installed()) renderFiles();
  }
  function renderSidebar() {
    const s = state.sessions.madness;
    const navigationButton = (action, label, glyph, cls='', attrs='') => btn(action, glyph + `<span class="sidebar-label">${label}</span>`, `sidebar-button ${cls}`, `aria-label="${label}" data-nav-tooltip="${label}" ${attrs}`);
    $('project-sidebar').innerHTML = `
      <div class="brand"><span class="brand-mark" aria-hidden="true">${icon('branch')}</span><span class="brand-label">Madness</span><span class="badge">preview</span>${btn('close-sidebar',icon('close'),'icon-button sidebar-close','aria-label="Fermer la navigation"')}</div>
      ${navigationButton('home','Accueil',icon('home'),state.view==='home'?'active':'',state.view==='home'?'aria-current="page"':'')}
      ${navigationButton('open-folder','Ouvrir un projet',icon('plus'))}
      <div class="sidebar-section">Vos projets</div>
      ${btn('project-madness','<span class="project-glyph" aria-hidden="true">M</span><span class="project-name">Madness</span><span class="small-dot" aria-hidden="true"></span>',`sidebar-button sidebar-project ${inProject()&&state.project==='madness'?'active':''}`,`aria-label="Madness — action attendue" data-nav-tooltip="Madness — action attendue" ${inProject()&&state.project==='madness'?'aria-current="page"':''}`)}
      ${btn('project-atlas','<span class="project-glyph" aria-hidden="true">A</span><span class="project-name">Atlas</span>',`sidebar-button sidebar-project ${inProject()&&state.project==='atlas'?'active':''}`,`aria-label="Atlas" data-nav-tooltip="Atlas" ${inProject()&&state.project==='atlas'?'aria-current="page"':''}`)}
      <div class="sidebar-section">Explorer</div>
      ${navigationButton('catalogue','Possibilités BMad',icon('catalog'),state.view==='catalogue'?'active':'',state.view==='catalogue'?'aria-current="page"':'')}
      ${navigationButton('help','Que faire ensuite ?',icon('help'))}
      <div class="sidebar-bottom">
        <div class="sidebar-note">Windows · BMad v7 preview<br>Connexion Codex simulée</div>
        ${s ? `<div class="sidebar-note">Madness : ${statusNames[s.status].toLocaleLowerCase('fr')}</div>` : ''}
      </div>`;
  }
  function renderTopbar() {
    const title = state.view === 'home' ? 'Accueil' : state.view === 'catalogue' ? 'Possibilités BMad' : projectName();
    const navigationLabel = state.navCompact ? 'Déployer la navigation' : 'Réduire la navigation';
    $('topbar').innerHTML = `<div class="breadcrumb">${btn('toggle-sidebar',icon('menu'),'icon-button mobile-navigation','aria-label="Afficher la navigation"')}${btn('toggle-navigation',icon('panel'),'icon-button desktop-navigation',`aria-label="${navigationLabel}" data-nav-tooltip="${navigationLabel}" aria-expanded="${!state.navCompact}" aria-controls="project-sidebar"`)}<span class="root-crumb">Espace local</span><span class="separator">/</span><strong>${title}</strong></div>
      <div class="topbar-right"><div class="connection"><span class="status-dot"></span><span>Codex</span><span>· simulation</span></div>${inProject()&&installed()?btn('toggle-files',icon('panel')+'<span>Fichiers</span>','secondary',`aria-pressed="${state.files}"`):''}</div>`;
  }
  function homeHTML() {
    const s = state.sessions.madness;
    const waitingTitle = s && ['answer','approval','stopped','error'].includes(s.status) ? ({answer:'Sally attend votre réponse',approval:'Une proposition attend votre accord',stopped:'Une conversation à reprendre',error:'Une exécution à réessayer'})[s.status] : 'Le brief de Madness est à relire';
    const waitingText = s && ['answer','approval','stopped','error'].includes(s.status) ? `${skill(s.skill).title} · ${statusNames[s.status]}` : 'La présence du fichier ne vaut pas validation du brief.';
    return `<div class="main-inner home-inner">
      <div class="page-intro"><div><h1>Retrouver le fil de vos projets.</h1><p>Vos attentes, vos livrables et la prochaine action utile, au même endroit.</p></div>${btn('open-folder',icon('plus')+'Ouvrir un projet','primary')}</div>
      <div class="section-heading"><h2>À votre attention</h2><span class="small muted">1 projet attend votre action</span></div>
      <div class="waiting-list">${btn('open-waiting',`<span class="waiting-symbol">${icon('clock')}</span><span class="item-main"><h3>${waitingTitle}</h3><p>Madness · ${waitingText}</p></span><span class="badge amber">À vous</span>${icon('arrow','chevron')}`,'waiting-item')}</div>
      <div class="section-heading"><h2>Projets récents</h2><span class="small muted">Dossiers de démonstration</span></div>
      <div class="project-list">
        ${btn('project-madness',`<span class="project-avatar">M</span><span class="project-info"><h3>Madness</h3><p>C:\\Sources\\madness</p></span><span class="project-meta"><span class="badge purple">BMad v7</span><p>Brief à relire</p></span>${icon('arrow','chevron')}`,'project-row')}
        ${btn('project-atlas',`<span class="project-avatar atlas">A</span><span class="project-info"><h3>Atlas</h3><p>C:\\Projets\\atlas</p></span><span class="project-meta"><span class="badge ${state.atlasInstalled?'purple':''}">${state.atlasInstalled?'BMad v7':'BMad absent'}</span><p>${state.atlasInstalled?'Prêt à explorer':'Premier démarrage'}</p></span>${icon('arrow','chevron')}`,'project-row')}
      </div>
      <div class="home-footnote">${icon('shield')}<span>Explorez librement. Cette maquette ne lit aucun dossier et ne lance aucun agent. Les projets, réponses et changements sont simulés.</span></div>
    </div>`;
  }
  function projectHTML() {
    if (!installed()) return onboardingHTML();
    const s = session();
    const isAtlas = state.project === 'atlas';
    return `<div class="main-inner">
      <div class="project-heading"><div><h1>${projectName()}</h1><p>${escape(projectPath())}</p></div><span class="badge green">${icon('check')}BMad v7 détecté</span></div>
      <div class="project-state"><span class="badge ${isAtlas?'purple':'amber'}">${isAtlas?'Prêt à cadrer':'Cadrage · brief à relire'}</span><span class="state-note">${s ? `Agent : ${statusNames[s.status].toLocaleLowerCase('fr')}` : 'Aucun agent en cours'}</span></div>
      <div class="project-tabs" role="tablist" aria-label="Vues du projet">
        ${btn('tab-overview','Parcours', '',`role="tab" aria-selected="${state.tab==='overview'}"`)}
        ${btn('tab-conversation','Conversation'+(s&&['answer','approval'].includes(s.status)?'<span class="tab-count">1</span>':''),'',`role="tab" aria-selected="${state.tab==='conversation'}"`)}
        ${btn('tab-catalogue','Toutes les possibilités','',`role="tab" aria-selected="${state.tab==='catalogue'}"`)}
      </div>
      ${state.tab==='overview'?overviewHTML():state.tab==='catalogue'?catalogueHTML():conversationHTML()}
    </div>`;
  }
  function overviewHTML() {
    const s = session(), atlas = state.project === 'atlas';
    const completed = s?.status === 'completed' && s.skill === 'bmad-ux';
    return `<div class="evidence-strip">${icon('link')}<span>${atlas?'Installation simulée terminée. Aucun livrable produit pour le moment.':`État fondé sur les fichiers : ${btn('file-brief','brief-madness.md')} est en <strong>brouillon</strong>. ${state.externalChange?'Une modification externe simulée est à examiner.':'Sa validation reste à confirmer.'}`}</span></div>
      <section class="recommendation" aria-labelledby="recommendation-title">
        <h2 id="recommendation-title">${atlas?'Clarifier votre idée avec BMad':completed?'Relire les parcours proposés':'Rendre les trois parcours concrets'}</h2>
        <p>${atlas?'Décrivez ce que vous voulez construire. BMad vous orientera vers les possibilités adaptées au contexte.':completed?'Sally a terminé ce tour. Les documents UX restent des propositions à relire ; votre accord sur leur création ne les valide pas.':'Retrouver un projet, comprendre où il en est, puis agir et répondre. Sally vous aide à éprouver cette expérience avant les choix techniques.'}</p>
        <div class="reason"><strong>Pourquoi maintenant ?</strong> ${atlas?'BMad est présent, mais le projet n’a pas encore de direction formulée.':completed?'Les résultats doivent être compris et discutés avant de définir la suite.':'L’UX est votre priorité. Le brief expose l’intention ; les interactions et les états d’attente restent à éprouver.'}</div>
        <div class="button-row">${completed?btn('file-experience',icon('file')+'Lire les parcours proposés','primary'):btn(atlas?'launch-bmad':'launch-bmad-ux',icon('play')+(atlas?'Demander une orientation':'Concevoir les parcours avec Sally'),'primary')}${btn(atlas?'skill-bmad':'skill-bmad-ux','Voir le détail','secondary')}</div>
        <details><summary>Invocation, entrées et résultat attendu</summary><dl class="detail-grid"><dt>Invocation Codex</dt><dd><code>${atlas?'$bmad':'$bmad-ux'}</code></dd><dt>Entrées</dt><dd>${atlas?'Votre idée et le contexte du dossier.':'Brief, trois parcours cibles et référence Codex Desktop.'}</dd><dt>Résultat</dt><dd>${atlas?'Une orientation expliquée.':'DESIGN.md et EXPERIENCE.md en brouillon, à discuter.'}</dd></dl></details>
      </section>
      <div class="path-heading"><h2>Le parcours de votre projet</h2><p>Des repères pour choisir. Chaque étape ouvre plusieurs possibilités.</p></div>
      <div class="stage-list">${groups.map(item=>stageHTML(item)).join('')}</div>
      <div class="overview-bottom"><span>Une étape suggérée n’est pas un passage obligatoire.</span>${btn('help','Demander à BMad de m’orienter '+icon('arrowRight'))}</div>
      ${state.externalChange?`<div class="activity-line">${icon('file')}<span><strong>Changement externe simulé.</strong> Le brief a été modifié hors de Madness. Son statut reste « brouillon ». L’état de la session externe est inconnu. ${btn('file-brief','Examiner le fichier','text-button')}</span></div>`:''}`;
  }
  function stageHTML(item) {
    const expanded = state.stage === item.id;
    const items = catalogue.filter(action => action.group === item.id);
    return `<section class="stage ${item.id==='ux'?'active':''} ${expanded?'expanded':''}">
      ${btn('stage-'+item.id,`<span class="stage-symbol">${icon(item.icon)}</span><span class="stage-main"><span class="stage-name">${item.label}</span><span class="stage-caption">${state.project==='atlas'?(item.id==='cadrage'?'Première exploration':'Selon vos besoins'):item.caption}</span></span>${icon('arrow','chevron')}`,'stage-toggle',`aria-expanded="${expanded}" aria-controls="stage-${item.id}"`)}
      ${expanded?`<div class="stage-details" id="stage-${item.id}"><p>${item.description}</p><div class="action-list">${items.map(action=>btn('skill-'+action.id,`<span class="action-main"><strong>${action.title}</strong><small>${action.description}</small></span>${icon('arrow','chevron')}`,'action-item')).join('')}</div></div>`:''}
    </section>`;
  }
  function standaloneCatalogue() { return `<div class="main-inner home-inner"><div class="page-intro"><div><h1>Les possibilités BMad</h1><p>Choisissez une intention, puis découvrez l’action qui lui correspond.</p></div></div>${catalogueHTML()}</div>`; }
  function catalogueHTML() {
    return `<section aria-label="Catalogue des compétences"><div class="catalogue-intro"><h2>${state.view==='catalogue'?'Le catalogue installé':'Toutes les possibilités, au même endroit'}</h2><p>27 compétences invocables · BMad v7 preview · catalogue de ce dépôt</p></div>
      <div class="search-wrap">${icon('search')}<label for="catalogue-search" class="sr-only">Rechercher une compétence</label><input id="catalogue-search" type="search" value="${escape(state.query)}" placeholder="Une intention, un agent ou une compétence…" autocomplete="off"></div>
      <div class="filter-row" role="group" aria-label="Filtrer par intention">${btn('filter-all','Tout','',`aria-pressed="${state.filter==='all'}"`)}${groups.map(item=>btn('filter-'+item.id,item.label,'',`aria-pressed="${state.filter===item.id}"`)).join('')}</div>
      <div id="catalogue-results">${catalogueResultsHTML()}</div>
      <div class="unavailable"><strong>Une compétence n’est pas disponible</strong><br><code>bmad-retrospective</code> : frontmatter YAML amont invalide dans cette installation. Les 3 entrées <code>bmod-*</code> sont des métadonnées, pas des actions à lancer.</div>
      <p class="catalogue-count">Invocations affichées pour Codex sous la forme <code>$bmad-ux</code>. Leur syntaxe dépend de l’environnement utilisé.</p></section>`;
  }
  function catalogueResultsHTML() {
    const query = state.query.toLocaleLowerCase('fr').normalize('NFD').replace(/\p{Diacritic}/gu,'');
    const found = catalogue.filter(item => (state.filter==='all'||item.group===state.filter) && `${item.title} ${item.description} ${item.id} ${item.condition}`.toLocaleLowerCase('fr').normalize('NFD').replace(/\p{Diacritic}/gu,'').includes(query));
    return `<p class="catalogue-count">${found.length} possibilité${found.length>1?'s':''}</p><div class="catalogue-list">${found.length?found.map(item=>btn('skill-'+item.id,`${icon(group(item.group).icon,'item-icon')}<span class="catalogue-main"><h3>${item.title}</h3><p>${item.description}</p><code>${item.invocation}</code></span>${icon('arrow','chevron')}`,'catalogue-item')).join(''):'<div class="empty-state"><h3>Aucune possibilité trouvée</h3><p>Essayez « brief », « Sally », « recherche » ou retirez un filtre.</p></div>'}</div>`;
  }
  function onboardingHTML() {
    return `<div class="main-inner"><div class="onboarding"><div class="page-intro"><div><h1>Préparer Atlas pour BMad</h1><p>C:\\Projets\\atlas · dossier de démonstration</p></div></div>
      <div class="diagnostic"><div class="row between"><h2>BMad n’est pas présent</h2><span class="badge amber">Diagnostic simulé</span></div><p>Vous pouvez initialiser BMad v7 pour être accompagné dès la première idée. Les fichiers du projet restent votre point de départ.</p></div>
      <h2>Ce qui serait ajouté</h2><div class="check-line">${icon('folder')}<div><strong>Les compétences BMad v7</strong>Installation locale dans <code>.agents/skills/</code> pour que Codex les utilise.</div></div>
      <div class="check-line">${icon('requirements')}<div><strong>La configuration et le dossier de travail</strong><code>_bmad/</code> pour l’environnement, <code>_bmad-output/</code> pour les livrables.</div></div>
      <div class="check-line">${icon('shield')}<div><strong>Une vérification avant de continuer</strong>Dans le produit, vérifier les prérequis, versions compatibles et accès à Codex avant toute installation.</div></div>
      <div class="button-row" style="margin-top:25px">${btn('confirm-init',icon('plus')+'Simuler l’initialisation de BMad v7','primary')}${btn('home','Revenir à l’accueil','secondary')}</div>
      <p class="onboarding-footnote">Cette action ouvre une confirmation puis simule le résultat. Aucun téléchargement, changement de fichier ou accès Codex n’aura lieu.</p></div></div>`;
  }
  function conversationHTML() {
    const s = session();
    if (!s) return `<div class="session-empty"><h2>Le dialogue garde sa place dans le parcours.</h2><p>Lancez une action pour voir son invocation, répondre à l’agent et retrouver les résultats du tour.</p>${btn('launch-bmad-ux',icon('play')+'Concevoir les parcours avec Sally','primary')}</div>`;
    const ux = s.skill === 'bmad-ux', selected = skill(s.skill);
    const waiting = ['answer','approval'].includes(s.status);
    return `<div class="conversation-title"><h2>${ux?'Les trois parcours de Madness':selected.title}</h2><span class="badge purple">${ux?'Sally':'BMad'} · Codex simulé</span></div>
      <div class="session-command">Invocation : <code>${selected.invocation}</code> · projet ${projectName()}<br>Conversation de démonstration, sans appel à un modèle.</div>
      <div class="session-status ${s.status==='running'?'running':waiting?'waiting':s.status==='error'?'error':''}" role="status"><span class="status-dot"></span><span class="status-label">${statusNames[s.status]}</span>${s.status==='running'?btn('stop',icon('stop')+'Interrompre'):s.status==='stopped'?btn('resume',icon('play')+'Reprendre'):s.status==='error'?btn('retry',icon('retry')+'Réessayer'):s.status==='completed'?'<span class="small">Le workflow reste ouvert</span>':''}</div>
      <div class="messages">${s.messages.map(messageHTML).join('')}${s.status==='running'?`<div class="message"><div class="message-avatar">${ux?'S':'B'}</div><div class="message-content"><div class="message-head">${ux?'Sally':'BMad'}<span>simulation</span></div><div class="loading-line"></div><div class="loading-line short"></div><p class="running-text">Préparation du prochain message…</p></div></div>`:''}</div>
      ${s.status==='stopped'?`<div class="summary-block"><h3>Le contexte est conservé.</h3><p>La simulation est interrompue. Reprenez à l’état précédent pour continuer cette conversation.</p><div class="button-row">${btn('resume',icon('play')+'Reprendre','primary')}</div></div>`:''}
      ${s.status==='error'?`<div class="summary-block"><h3>La réponse simulée a été interrompue.</h3><p>Exemple d’erreur de connexion. Votre réponse et le contexte sont conservés. Réessayez pour revenir au même point.</p><div class="button-row">${btn('retry',icon('retry')+'Réessayer','primary')}</div></div>`:''}
      ${s.status==='approval'?proposalHTML(s):''}
      ${s.status==='completed'?summaryHTML(s):''}
      ${s.status==='answer'?`<form id="reply-form" class="composer"><label for="reply-text">Votre réponse à ${ux?'Sally':'BMad'}</label><textarea id="reply-text" placeholder="Écrivez votre réponse…" required>${escape(state.draft)}</textarea><div class="composer-bottom"><span>Votre réponse reste dans cette démo.</span><button type="submit" class="primary">Envoyer ${icon('send')}</button></div></form>`:''}
      <details class="simulation-tools"><summary>Tester les états de la démonstration</summary><div class="button-row">${btn('simulate-stop','Interruption','',s.status==='completed'?'disabled title="Relancez une conversation pour tester cet état"':'')}${btn('simulate-error','Erreur récupérable','',s.status==='completed'?'disabled title="Relancez une conversation pour tester cet état"':'')}${btn('restart-session','Recommencer ce dialogue')}</div><p style="margin-top:10px">Ces contrôles servent à explorer la maquette ; ils ne font pas partie d’une connexion réelle.</p></details>`;
  }
  function messageHTML(message) {
    const user = message.role === 'user';
    return `<div class="message ${user?'user':''}"><div class="message-avatar">${user?'V':session()?.skill==='bmad-ux'?'S':'B'}</div><div class="message-content"><div class="message-head">${user?'Vous':session()?.skill==='bmad-ux'?'Sally':'BMad'}<span>${user?'réponse de la démo':'réponse simulée'}</span></div><p>${escape(message.text)}</p>${message.quick && session()?.status==='answer'?btn('quick-reply','« Distinguer une proposition d’une décision validée. »','quick-reply'):''}</div></div>`;
  }
  function proposalHTML(s) {
    const ux = s.skill === 'bmad-ux';
    return `<div class="pending-change"><h3>Proposition à confirmer</h3><p>${ux?'Préparer deux brouillons qui distinguent les règles visuelles et les comportements des trois parcours.':'Simuler l’exécution de cette action dans le contexte du projet.'}</p>
      ${ux?'<ul><li><code>DESIGN.md</code> : hiérarchie, panneaux et états visuels.</li><li><code>EXPERIENCE.md</code> : ouvrir, comprendre, agir et reprendre.</li><li>Statut des documents : <strong>brouillon à relire</strong>.</li></ul>':`<ul><li>Compétence : <code>${escape(s.skill)}</code></li><li>Résultat illustratif, sans modification de fichier.</li></ul>`}
      <p>Accepter cette proposition autorise le résultat simulé. Cela ne valide pas les livrables.</p><div class="button-row">${btn('approve-proposal',ux?'Créer les brouillons — simulation':'Accepter — simulation','primary')}${btn('revise-proposal','Demander un ajustement','secondary')}</div></div>`;
  }
  function summaryHTML(s) {
    const ux = s.skill === 'bmad-ux';
    return `<section class="summary-block"><h3>Ce tour est terminé.</h3><p>${ux?'Les parcours sont proposés. Le workflow UX reste ouvert pour vos retours.':'Le résultat illustratif est disponible. Choisissez la suite selon votre besoin.'}</p>
      <dl><dt>Résultat proposé</dt><dd>${ux?'Trois parcours et des règles d’interface, dans deux brouillons de démonstration.':'Une proposition de travail liée à '+escape(skill(s.skill).title.toLocaleLowerCase('fr'))+'.'}</dd><dt>Votre décision</dt><dd>Vous avez accepté la production simulée. Aucun livrable n’est marqué comme validé.</dd><dt>Prochaine action</dt><dd>${ux?'Lire EXPERIENCE.md et signaler ce qui manque ou bloque avant de continuer.':'Examiner la proposition et choisir une action adaptée dans le parcours.'}</dd></dl>
      <div class="button-row">${ux?btn('file-experience',icon('file')+'Lire les parcours','primary'):btn('tab-overview','Retrouver le parcours','primary')}${btn('continue-discussion','Donner un retour','secondary')}</div></section>`;
  }
  function renderFiles() {
    const s = session(), produced = s?.produced, atlas = state.project === 'atlas';
    const fileList = atlas&&!produced ? [] : [{id:'brief',name:'brief-madness.md',status:'Brouillon · à relire'},...(produced?[{id:'design',name:'DESIGN.md',status:'Proposé · simulation'},{id:'experience',name:'EXPERIENCE.md',status:'Proposé · simulation'}]:[])];
    const selected = fileList.find(item=>item.id===state.selectedFile);
    $('files-panel').innerHTML = `<div class="files-header"><h2>Fichiers du projet</h2>${btn('toggle-files',icon('close'),'icon-button files-close','aria-label="Fermer le panneau de fichiers"')}</div><p class="files-hint">Les preuves du parcours, à portée de main.</p>
      <div class="file-group-title"><span>Livrables BMad</span><span>${fileList.length}</span></div>
      ${fileList.length?fileList.map(item=>btn('file-'+item.id,`${icon('file')}<span><span class="file-name">${item.name}</span><span class="file-state">${item.status}</span></span>`,`file-button ${state.selectedFile===item.id?'active':''}`)).join(''):'<p class="file-empty">Vos livrables apparaîtront ici au fil du travail. Un dossier initialisé n’est pas encore un projet cadré.</p>'}
      ${selected?filePreviewHTML(selected):''}
      <div class="source-box">${icon('link')}<span>${state.externalChange?'Modification externe simulée détectée. Session d’origine inconnue.':'Un fichier peut indiquer un statut. Sa présence ne prouve jamais une validation humaine.'}</span></div>
      ${btn('external-change','Simuler un changement externe','text-button','style="margin-top:15px;font-size:11px"')}`;
  }
  function filePreviewHTML(file) {
    return `<section class="file-preview"><div class="file-preview-heading">${file.name}</div><span class="badge amber">${file.id==='brief'?'Brouillon · non validé':'Proposition · non validée'}</span><p class="file-provenance">${file.id==='brief'?'Extrait fidèle du brief du dépôt, figé dans la maquette.':'Contenu illustratif créé par le scénario de démonstration.'}${state.externalChange&&file.id==='brief'?' Changement externe de démonstration, sans inférence sur la conversation.':''}</p><code class="file-path">${escape(filePath(file.id))}</code><div class="file-document">${documentHTML(file.id)}</div><div class="button-row">${btn('open-editor',icon('external')+'Ouvrir dans l’éditeur','secondary')}${btn('file-detail','Agrandir','text-button')}</div></section>`;
  }
  function documentHTML(id) {
    if (id==='brief') return `<h3>Madness — brief produit</h3><h4>Intention et utilisateurs</h4><p>Madness est une interface graphique destinée aux développeurs qui utilisent ou découvrent BMad sur des projets locaux. Le produit doit être distribuable à d’autres développeurs. Sa première version cible Windows, Codex et BMad v7 uniquement.</p><h4>Priorité : l’expérience utilisateur</h4><p>L’UX est la priorité absolue et le premier critère des arbitrages. L’utilisateur doit pouvoir avancer sans connaître les commandes BMad au préalable.</p><h4>Périmètre confirmé</h4><ul><li>Projets locaux et initialisation guidée de BMad v7.</li><li>Catalogue complet, recommandations et dialogue intégré.</li><li>État compréhensible, livrables et modifications externes.</li></ul><h4>Décisions encore ouvertes</h4><p>Le choix Electron ou interface web avec service local, le framework et l’intégration Codex restent à instruire.</p>${state.externalChange?'<h4>Changement externe · exemple</h4><p>Une note a été ajoutée : préciser la reprise après interruption. Son auteur et sa conversation d’origine ne sont pas connus de la maquette.</p>':''}<p class="small">Extrait abrégé. Le brief réel reste draft ; aucune validation n’est apportée par cette démo.</p>`;
    if (id==='design') return `<h3>Madness — règles visuelles proposées</h3><p>Document illustratif, non validé.</p><h4>Une hiérarchie de travail</h4><ul><li>Navigation des projets à gauche.</li><li>État et prochaine action au centre.</li><li>Fichiers et preuves à droite.</li></ul><h4>Des états lisibles</h4><p>Une couleur accompagne un libellé explicite. Le focus clavier reste visible ; les changements de statut sont annoncés.</p><h4>Fenêtre étroite</h4><p>Les panneaux deviennent consultables à la demande, sans perdre le projet actif.</p>`;
    return `<h3>Madness — parcours proposés</h3><p>Document illustratif, non validé.</p><h4>Retrouver son projet</h4><p>L’accueil rassemble les projets récents et les attentes. Le diagnostic précède l’initialisation d’un dossier.</p><h4>Comprendre où l’on en est</h4><p>L’état est relié aux fichiers. Une recommandation expose son objectif, son invocation, ses entrées et son résultat attendu.</p><h4>Agir et poursuivre</h4><p>La conversation montre l’action lancée. Réponse attendue, accord demandé et fin de tour sont distincts.</p><h4>Critère à éprouver</h4><p>L’utilisateur peut expliquer ce qui est proposé, ce qu’il a accepté et ce qui reste à valider.</p>`;
  }
  function filePath(id) { return id==='brief'?'C:\\Sources\\madness\\_bmad-output\\initiative-madness\\brief-madness\\brief-madness.md':`${projectPath()}\\_bmad-output\\initiative-${state.project}\\ux-${state.project}\\${id==='design'?'DESIGN.md':'EXPERIENCE.md'}`; }
  function dialog(title,body,footer='') {
    if ($('dialog').open) $('dialog').close();
    $('dialog-content').innerHTML = `<div class="dialog-header"><h2>${title}</h2>${btn('close-dialog',icon('close'),'icon-button','aria-label="Fermer"')}</div><div class="dialog-body">${body}</div>${footer?`<div class="dialog-footer">${footer}</div>`:''}`;
    $('dialog').showModal();
  }
  function showSkill(id) {
    const selected = skill(id);
    if (!selected) return;
    dialog(selected.title,`<p class="skill-summary">${selected.description}</p><span class="skill-category">${group(selected.group).label} · compétence installée</span>
      <div class="skill-invocation"><code>${selected.invocation}</code>${btn('copy-command-'+id,'Copier')}</div><p class="small">Invocation Codex. La syntaxe et l’intégration diffèrent selon l’environnement.</p>
      <dl class="detail-grid"><dt>Entrées</dt><dd>${selected.inputs}</dd><dt>Résultat</dt><dd>${selected.outputs}</dd></dl>
      <div class="skill-conditions"><strong>Quand l’utiliser</strong>${selected.condition}</div>
      <p class="small">Le lancement ci-dessous illustre l’interface. Il n’invoque pas réellement la compétence ni ses agents.</p>`,btn('close-dialog','Retour','secondary')+btn('launch-'+id,icon('play')+'Lancer — simulation','primary'));
  }
  function openProject(id) {
    state.project = id; state.view = 'project'; state.tab = 'overview'; state.selectedFile='brief';
    $('project-sidebar').parentElement.classList.remove('show-sidebar'); render(); $('main').scrollTop=0;
  }
  function launch(id) {
    if ($('dialog').open) $('dialog').close();
    if (!inProject()) { state.view='project'; state.project='madness'; }
    if (!installed()) { toast('Initialisez d’abord BMad dans ce scénario de démonstration.'); render(); return; }
    const existing = session();
    if (existing && !['completed'].includes(existing.status)) {
      dialog('Un dialogue est déjà ouvert',`<p>${skill(existing.skill).title} attend encore une suite. Vous pouvez le retrouver, ou remplacer ce dialogue dans la démonstration.</p>`,btn('return-session','Retrouver le dialogue','secondary')+btn('replace-session-'+id,'Remplacer dans la démo','primary'));
      return;
    }
    beginSession(id);
  }
  function beginSession(id) {
    clearTimeout(timer); state.tab='conversation'; state.draft='';
    state.sessions[state.project] = {skill:id,status:'running',previous:'answer',messages:[],produced:false}; render(); announce('Lancement simulé de '+skill(id).title+'.');
    const project = state.project;
    timer=setTimeout(()=>{
      const s=state.sessions[project]; if(!s||s.status!=='running')return;
      s.status='answer'; s.messages.push({role:'agent',text:id==='bmad-ux'?'Nous allons travailler les trois moments : retrouver un projet, comprendre son état, puis lancer une action et poursuivre.\n\nQuand vous revenez après une interruption, quel signal doit vous permettre de comprendre immédiatement ce qui vous attend ?':'Vous avez choisi « '+skill(id).title+' ».\n\n'+skill(id).description+'\n\nQuel objectif souhaitez-vous traiter dans ce projet ? Le dialogue qui suit est une illustration générique, pas le workflow réel de cette compétence.',quick:id==='bmad-ux'});
      render(); announce('Réponse attendue. '+(id==='bmad-ux'?'Sally':'BMad')+' a posé une question.');
    },1500);
  }
  function reply(text) {
    const s=session(); if(!s||s.status!=='answer'||!text.trim())return;
    s.messages.push({role:'user',text:text.trim()}); state.draft='';s.status='running';render();
    const project=state.project;
    timer=setTimeout(()=>{
      const current=state.sessions[project];if(!current||current.status!=='running')return;
      current.status='approval';current.messages.push({role:'agent',text:current.skill==='bmad-ux'?'Je propose de rendre l’attente explicite, de relier l’état aux livrables et de terminer chaque tour avec la prochaine action.\n\nJe peux préparer deux brouillons pour matérialiser les trois parcours. Votre accord porte sur cette création simulée ; nous les relirons ensuite.':'Je propose de préparer un premier résultat en tenant compte de votre objectif. Cette démonstration représente une demande de décision ; le vrai workflow dépend de la compétence et du contexte.'});render();announce('Une proposition attend votre accord.');
    },1100);
  }
  function approve() {
    const s=session();if(!s||s.status!=='approval')return;s.status='running';render();const project=state.project;
    timer=setTimeout(()=>{const current=state.sessions[project];if(!current||current.status!=='running')return;current.status='completed';current.produced=current.skill==='bmad-ux';current.messages.push({role:'agent',text:current.skill==='bmad-ux'?'Les brouillons de démonstration sont disponibles dans les fichiers du projet. Ce tour est terminé.\n\nIls restent proposés, non validés. Lisez les parcours, puis dites-moi où vous hésitez : le travail UX se poursuit avec vos retours.':'Le résultat illustratif est prêt à être discuté. Ce tour est terminé ; votre validation reste une étape distincte.'});if(current.produced)state.selectedFile='experience';render();announce('Tour terminé. Les livrables restent des propositions à relire.');},1100);
  }
  function interrupt(error=false) { const s=session();if(!s||s.status==='completed')return;clearTimeout(timer);if(!['stopped','error'].includes(s.status))s.previous=s.status;s.status=error?'error':'stopped';render();announce(error?'Erreur simulée. Le contexte est conservé.':'Simulation interrompue.'); }
  function resume() { const s=session();if(!s)return;s.status=s.previous==='running'?'answer':s.previous||'answer';if(!s.messages.length)s.messages.push({role:'agent',text:'Reprenons les trois parcours. Quel signal doit vous aider à comprendre immédiatement ce qui vous attend ?',quick:s.skill==='bmad-ux'});render();announce('Dialogue repris au dernier point conservé.'); }
  async function copy(text) {
    try { if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(text);toast('Texte copié.'); }
    catch { dialog('Copier le texte',`<p>La copie automatique n’est pas disponible dans ce navigateur. Sélectionnez le texte ci-dessous pour le copier.</p><label for="manual-copy" class="sr-only">Texte à copier</label><textarea id="manual-copy" rows="4" readonly style="width:100%;padding:12px;border:1px solid #ded3e9;margin-top:12px">${escape(text)}</textarea>`,btn('close-dialog','Fermer','secondary'));const field=$('manual-copy');field.focus();field.select(); }
  }
  function action(action) {
    if (action.startsWith('skill-')) return showSkill(action.slice(6));
    if (action.startsWith('launch-')) return launch(action.slice(7));
    if (action.startsWith('copy-command-')) return copy('$'+action.slice(13));
    if (action.startsWith('replace-session-')) { $('dialog').close();return beginSession(action.slice(16)); }
    if (action.startsWith('stage-')) {state.stage=state.stage===action.slice(6)?null:action.slice(6);return render();}
    if (action.startsWith('filter-')) {state.filter=action.slice(7);return render();}
    if (action.startsWith('tab-')) {state.tab=action.slice(4);return render();}
    if (action.startsWith('file-') && ['brief','design','experience'].includes(action.slice(5))) {state.selectedFile=action.slice(5);state.files=true;if(state.view==='home')state.view='project';render();if(innerWidth<1081)$('files-panel').focus();return;}
    switch(action) {
      case 'home': state.view='home';document.querySelector('.app-shell').classList.remove('show-sidebar');render();break;
      case 'project-madness':openProject('madness');break;
      case 'project-atlas':openProject('atlas');break;
      case 'catalogue':state.view='catalogue';document.querySelector('.app-shell').classList.remove('show-sidebar');render();break;
      case 'open-waiting':openProject('madness');if(session()&&['answer','approval','stopped','error'].includes(session().status)){state.tab='conversation';render();}else{state.files=true;state.selectedFile='brief';render();}break;
      case 'open-folder':dialog('Ouvrir un projet',`<p>Dans Madness, vous choisirez un dossier local. Pour cette maquette, explorez l’un de ces deux exemples.</p>${btn('choose-madness',`${icon('folder')}<span class="choice-text"><strong>Madness · projet en cours</strong><small>BMad v7 présent · brief à relire</small></span>${icon('arrow')}`,'demo-choice')}${btn('choose-atlas',`${icon('folder')}<span class="choice-text"><strong>Atlas · nouveau dossier</strong><small>BMad absent · initialisation accompagnée</small></span>${icon('arrow')}`,'demo-choice')}`,btn('close-dialog','Annuler','secondary'));break;
      case 'choose-madness':$('dialog').close();openProject('madness');break;
      case 'choose-atlas':$('dialog').close();openProject('atlas');break;
      case 'confirm-init':dialog('Initialiser BMad dans Atlas ?',`<p>La simulation ajoutera BMad v7 à l’état de ce projet de démonstration.</p><ul><li>Compétences dans <code>.agents/skills/</code></li><li>Configuration dans <code>_bmad/</code></li><li>Espace de livrables dans <code>_bmad-output/</code></li></ul><p>Aucun fichier réel ne sera modifié. Dans le produit, la liste exacte des changements devra être vérifiée avant installation.</p>`,btn('close-dialog','Annuler','secondary')+btn('perform-init','Confirmer la simulation','primary'));break;
      case 'perform-init':$('dialog').close();state.atlasInstalled=true;state.stage='cadrage';state.tab='overview';state.selectedFile=null;render();announce('BMad v7 initialisé dans Atlas, en simulation uniquement.');toast('Atlas est prêt à explorer BMad — simulation terminée.');break;
      case 'toggle-files':state.files=!state.files;render();break;
      case 'toggle-navigation':
        state.navCompact=!state.navCompact;
        try { localStorage.setItem(navigationPreferenceKey, String(state.navCompact)); } catch { /* Keep the preference for this visit when storage is unavailable. */ }
        hideNavigationTooltip();
        document.querySelector('.app-shell').classList.toggle('nav-compact', state.navCompact);
        renderSidebar();renderTopbar();
        document.querySelector('[data-action="toggle-navigation"]').focus();
        announce(state.navCompact?'Navigation réduite en rail d’icônes.':'Navigation déployée.');
        break;
      case 'toggle-sidebar':document.querySelector('.app-shell').classList.toggle('show-sidebar');break;
      case 'close-sidebar':document.querySelector('.app-shell').classList.remove('show-sidebar');break;
      case 'close-dialog':$('dialog').close();break;
      case 'help':showSkill('bmad');break;
      case 'quick-reply':reply('Je veux distinguer une proposition d’une décision validée, et voir ce que je dois faire ensuite.');break;
      case 'approve-proposal':approve();break;
      case 'revise-proposal':session().status='answer';session().messages.push({role:'agent',text:'D’accord. Qu’aimeriez-vous ajuster dans cette proposition avant de continuer ?'});render();announce('Un ajustement est demandé. Votre réponse est attendue.');break;
      case 'continue-discussion':session().status='answer';session().messages.push({role:'agent',text:'Quel parcours ou quel état vous semble encore difficile à comprendre ? Les brouillons restent ouverts à vos retours.'});render();break;
      case 'stop':case 'simulate-stop':interrupt(false);break;
      case 'simulate-error':interrupt(true);break;
      case 'resume':case 'retry':resume();break;
      case 'restart-session':beginSession(session().skill);break;
      case 'return-session':$('dialog').close();state.tab='conversation';render();break;
      case 'open-editor':dialog('Ouvrir dans votre éditeur',`<p>L’intégration desktop n’est pas connectée dans ce prototype. Le bouton du produit ouvrira ce fichier dans votre éditeur.</p><p>Vous pouvez ici copier le chemin de référence. Les documents UX produits par la simulation sont illustratifs ; aucun nouveau fichier n’a été créé.</p><code class="copy-path">${escape(filePath(state.selectedFile))}</code>`,btn('close-dialog','Fermer','secondary')+btn('copy-file-path','Copier le chemin','primary'));break;
      case 'copy-file-path':copy(filePath(state.selectedFile));break;
      case 'file-detail':dialog(state.selectedFile==='brief'?'Brief de Madness':state.selectedFile==='design'?'Règles visuelles proposées':'Parcours proposés',`<div class="badge amber">${state.selectedFile==='brief'?'Extrait du brief réel · brouillon':'Document illustratif · non validé'}</div><div class="file-document">${documentHTML(state.selectedFile)}</div>`,btn('close-dialog','Revenir au projet','secondary'));break;
      case 'external-change':state.externalChange=true;render();announce('Modification externe simulée. La session d’origine n’est pas connue.');toast('Un changement de fichier a été simulé. Aucune conversation externe n’est déduite.');break;
    }
  }
  document.addEventListener('click', event=>{const element=event.target.closest('[data-action]');if(element&&!element.disabled)action(element.dataset.action);});
  document.addEventListener('mouseover', event=>{const button=event.target.closest('[data-nav-tooltip]');if(button&&!button.contains(event.relatedTarget))showNavigationTooltip(button);});
  document.addEventListener('mouseout', event=>{const button=event.target.closest('[data-nav-tooltip]');if(button&&!button.contains(event.relatedTarget)&&document.activeElement!==button)hideNavigationTooltip();});
  document.addEventListener('focusin', event=>{const button=event.target.closest('[data-nav-tooltip]');if(button)showNavigationTooltip(button);});
  document.addEventListener('focusout', event=>{if(event.target===tooltipOwner)hideNavigationTooltip();});
  window.addEventListener('resize', hideNavigationTooltip);
  document.addEventListener('input', event=>{if(event.target.id==='catalogue-search'){state.query=event.target.value;$('catalogue-results').innerHTML=catalogueResultsHTML();}if(event.target.id==='reply-text')state.draft=event.target.value;});
  document.addEventListener('submit',event=>{if(event.target.id==='reply-form'){event.preventDefault();reply($('reply-text').value);}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelector('.app-shell').classList.remove('show-sidebar');hideNavigationTooltip();}});
  $('reset-demo').addEventListener('click',()=>dialog('Réinitialiser la démonstration ?',`<p>Les échanges, l’initialisation d’Atlas et le changement externe simulé seront effacés de cette maquette. Aucun fichier du dépôt n’est concerné.</p>`,btn('close-dialog','Conserver la démo','secondary')+btn('reset-confirm','Réinitialiser','primary')));
  document.addEventListener('click',event=>{if(event.target.closest('[data-action="reset-confirm"]')){clearTimeout(timer);$('dialog').close();Object.assign(state,{view:'home',project:'madness',tab:'overview',stage:'ux',files:true,selectedFile:'brief',query:'',filter:'all',atlasInstalled:false,externalChange:false,sessions:{},draft:''});render();announce('Démonstration réinitialisée.');}});
  $('files-panel').tabIndex=-1;
  render();
})();
