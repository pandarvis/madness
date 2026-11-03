// Main/preload réels, profil synthétique possédé, aucun compte ni modèle.
import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,readdir,realpath,lstat,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {benchOutput} from './epic-one-support.mjs'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {QuestionStore} from '../../src/adapters/persistence/question-store.ts'
import {ApprovalStore} from '../../src/adapters/persistence/approval-store.ts'
import {initialDialogueState,isDialogueMessage} from '../../src/contracts/dialogue.ts'
import {isHelpState,HELP_EVENT_CHANNEL} from '../../src/contracts/bmad-help.ts'

const repository=resolve(fileURLToPath(new URL('../../',import.meta.url))),require=createRequire(import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex')
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))

// Windows can quantize an odd DIP size at fractional scaling (1323 -> 1324 at 125%).
// Prefer exact CSS pixels, otherwise attest <=1px without crossing a layout breakpoint.
export async function setWorkspaceViewport(app,page,size){
 const queries=[['(max-width: 720px)',size.width<=720],['(max-width: 1080px)',size.width<=1080],['(max-width: 1280px)',size.width<=1280],['(min-width: 1323px)',size.width>=1323],['(min-width: 1600px)',size.width>=1600],['(max-height: 700px)',size.height<=700]]
 const attempts=[]
 async function measure(requested){
  const native=await app.evaluate(({BrowserWindow},requested)=>{const w=BrowserWindow.getAllWindows()[0];w.setContentSize(requested.width,requested.height);return {contentSize:w.getContentSize(),zoomFactor:w.webContents.getZoomFactor()}},requested)
  assert.equal(native.zoomFactor,1,'Viewport qualification expects zoom 100%; zoom 200% has its own control.')
  const actual=await page.evaluate(async queries=>{
   const settledBy=await new Promise(resolve=>{let timer;const done=value=>{clearTimeout(timer);resolve(value)};timer=setTimeout(()=>done('bounded-timeout'),250);requestAnimationFrame(()=>requestAnimationFrame(()=>done('animation-frames')))})
   return {width:innerWidth,height:innerHeight,layoutWidth:document.documentElement.getBoundingClientRect().width,devicePixelRatio,settledBy,queries:queries.map(([query,expected])=>({query,expected,matches:matchMedia(query).matches}))}
  },queries)
  const result={requestedNative:requested,native,actual};attempts.push(result);return result
 }
 const appropriate=value=>Math.abs(value.actual.width-size.width)<=1&&Math.abs(value.actual.height-size.height)<=1&&value.actual.queries.every(query=>query.matches===query.expected)
 const exact=value=>appropriate(value)&&value.actual.width===size.width&&value.actual.height===size.height
 let selected
 for(const [dx,dy]of [[0,0],[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){
  const value=await measure({width:size.width+dx,height:size.height+dy})
  if(exact(value))return {requested:size,actual:value.actual,native:value.native,exact:true,limitation:null,attempts}
  if(appropriate(value)&&(!selected||Math.abs(value.actual.width-size.width)+Math.abs(value.actual.height-size.height)<Math.abs(selected.actual.width-size.width)+Math.abs(selected.actual.height-size.height)))selected=value
 }
 assert.ok(selected,'VIEWPORT_UNREACHABLE_WITHIN_ONE_PIXEL_AND_REQUIRED_BREAKPOINTS '+JSON.stringify({requested:size,attempts}))
 const final=await measure(selected.requestedNative)
 assert.ok(appropriate(final),'VIEWPORT_RESTORE_OUTSIDE_REQUIRED_BREAKPOINTS '+JSON.stringify({requested:size,attempts}))
 return {requested:size,actual:final.actual,native:final.native,exact:exact(final),limitation:exact(final)?null:'Native Windows sizing quantization: actual CSS viewport differs by at most 1px; every required layout breakpoint is preserved.',attempts}
}

// Sérialisé par Playwright dans Main. Ne lit ni ne conserve les arguments de
// configuration, l'environnement ou les flux ; seul le sous-programme est reconnu.
export function installWorkspaceObservationRuntime({session},observationPath){
 const cp=process.getBuiltinModule('child_process'),mod=process.getBuiltinModule('module'),fs=process.getBuiltinModule('fs'),original=cp.spawn
 const startedAt=new Date().toISOString();let network=0,appServerAttempts=0,appServers=0,appServerCloses=0,complete=true,restored=false
 const read=()=>({schemaVersion:1,afterHookOnly:true,startedAt,complete,attached:!restored&&cp.spawn===wrapped,network,appServerAttempts,appServers,appServerCloses})
 const persist=()=>{try{fs.writeFileSync(observationPath,JSON.stringify(read())+'\n',{mode:0o600})}catch{complete=false}}
 const wrapped=function(){
  const args=arguments[1],server=Array.isArray(args)&&args[0]==='app-server'
  if(server){appServerAttempts++;persist()}
  const child=Reflect.apply(original,this,arguments)
  if(server){appServers++;persist();child.once('close',()=>{appServerCloses++;persist()})}
  return child
 }
 cp.spawn=wrapped;mod.syncBuiltinESMExports()
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>{network++;persist();callback({cancel:true})})
 globalThis.__workspaceObservation={read,flush:()=>{persist();return read()},restore:()=>{if(cp.spawn!==wrapped)return false;cp.spawn=original;mod.syncBuiltinESMExports();session.defaultSession.webRequest.onBeforeRequest(null);restored=true;persist();return true}}
 persist();return read()
}

// Le wrapper Playwright n'est pas nécessairement le vrai Main Windows.
// Aucune terminaison forcée : une preuve manquante conserve le profil possédé.
export async function closeWorkspaceSession(owned,{readProcess=pid=>windowsOwnedProcesses.read(pid),readObservation=async path=>JSON.parse(await readFile(path,'utf8')),waitMs=5000}={}){
 const child=owned.child??owned.app.process();let observerAvailable=owned.observerAvailable??false,closeError=false
 if(!owned.closeAttempted){
  try{const before=await owned.app.evaluate(()=>globalThis.__workspaceObservation.flush());observerAvailable=before.complete===true&&before.attached===true&&before.startedAt===owned.observationStartedAt}catch{observerAvailable=false}
  owned.observerAvailable=observerAvailable;owned.closeAttempted=true
  try{await owned.app.close()}catch{closeError=true}
 }
 let mainGone=false,current
 if(owned.main){const deadline=Date.now()+waitMs;do{current=await readProcess(owned.main.pid);if(current===null){mainGone=true;break}if(Date.now()>=deadline)break;await pause(100)}while(true)}
 let value;try{value=await readObservation(owned.observationPath)}catch{}
 const count=key=>Number.isSafeInteger(value?.[key])&&value[key]>=0?value[key]:null
 const observation={schemaVersion:value?.schemaVersion===1?1:null,afterHookOnly:value?.afterHookOnly===true,startedAt:value?.startedAt===owned.observationStartedAt?value.startedAt:null,complete:value?.complete===true,attached:value?.attached===true,network:count('network'),appServerAttempts:count('appServerAttempts'),appServers:count('appServers'),appServerCloses:count('appServerCloses')}
 const observerComplete=observerAvailable&&observation.schemaVersion===1&&observation.afterHookOnly&&observation.startedAt!==null&&observation.complete&&observation.attached&&['network','appServerAttempts','appServers','appServerCloses'].every(key=>observation[key]!==null)
 const childrenGone=observerComplete&&observation.appServerAttempts===0&&observation.appServers===0&&observation.appServerCloses===0
 return {main:owned.main??null,wrapperPid:child.pid,wrapperExited:child.exitCode!==null,closeObserved:owned.closeObserved===true,closeError,mainGone,observerComplete,observation,childrenGone,cleanupSafe:mainGone&&owned.closeObserved===true&&childrenGone}
}

export async function runWorkspaceDesign(args=process.argv.slice(2)){
assert.ok(args.some(v=>v.startsWith('--output=')),'Une sortie neuve --output= absolue est obligatoire.')
const output=await benchOutput(null,args),explicit=args.find(v=>v.startsWith('--executable=')),packaged=!!explicit,capture=!args.includes('--no-captures'),executable=explicit?resolve(explicit.slice(13)):require('electron')
const report={schemaVersion:1,startedAt:new Date().toISOString(),status:'partial',mode:packaged?'packaged-isolated':'compiled-isolated',checks:[],measurements:[],viewports:[],workPositions:[],captures:[],launches:[],closeReceipts:[],cleanup:false,limits:['Données et demandes actives synthétiques ; aucun reçu fournisseur, compte ou accord humain déduit.','Contrôles du contenu Electron ; glyphes Windows, mise à l’échelle du système, lecteur d’écran et conformité WCAG non certifiés.','Tailles CSS exactes privilégiées ; quantification Windows limitée à1px et consignée dans viewports, sans franchissement des breakpoints attendus.','Aucune installation personnelle, clôture G1 ni acceptation visuelle humaine.','Réseau bloqué et app-server comptés seulement après installation du hook ; aucune absence d’activité antérieure au hook revendiquée.','Une identité Main, une fermeture observable ou un compteur incomplet interdit le nettoyage du profil. Aucun processus tué par le banc.']}
let app,root,activeSession;const sessions=[]
const pass=name=>report.checks.push(name)
async function stop(){if(!app)return;const receipt=await closeWorkspaceSession(activeSession);report.closeReceipts.push(receipt);assert.equal(receipt.cleanupSafe,true,'OWNED_MAIN_CLOSE_UNCONFIRMED');activeSession.closed=true;app=null;assert.equal(receipt.closeError,false,'PLAYWRIGHT_CLOSE_FAILED');pass('real-windows-main-absent-close-observed-no-app-server-launch-'+sessions.length)}
async function assertNoActivity(){const value=await app.evaluate(()=>globalThis.__workspaceObservation.read());assert.equal(value.complete,true);assert.equal(value.attached,true);assert.equal(value.startedAt,activeSession.observationStartedAt);assert.equal(value.network,0);assert.equal(value.appServerAttempts,0);assert.equal(value.appServers,0);assert.equal(value.appServerCloses,0)}
async function launch(profile){
 assert.ok(!app);assert.equal(process.platform,'win32');const owned={closeObserved:false,closed:false};sessions.push(owned)
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(k.toUpperCase())))
 app=await electron.launch({executablePath:executable,args:packaged?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 owned.app=app;owned.child=app.process();activeSession=owned;app.once('close',()=>{owned.closeObserved=true})
 const runtime=await app.evaluate(({app})=>({pid:process.pid,executable:process.execPath,userData:app.getPath('userData')}));owned.main=await windowsOwnedProcesses.read(runtime.pid)
 assert.ok(owned.main&&owned.main.pid===runtime.pid&&resolve(owned.main.executable).toLowerCase()===resolve(runtime.executable).toLowerCase()&&resolve(runtime.executable).toLowerCase()===resolve(executable).toLowerCase(),'REAL_MAIN_IDENTITY_REQUIRED')
 assert.equal(resolve(runtime.userData),resolve(profile))
 owned.observationPath=join(output,'native-observation-'+sessions.length+'.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt;assert.equal(observation.complete,true);assert.equal(observation.attached,true)
 report.launches.push({main:owned.main,wrapperPid:app.process().pid,observationPath:owned.observationPath,observationStartedAt:owned.observationStartedAt});await assertNoActivity()
 const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await page.locator('h1').waitFor()
 return page
}
async function emit(state){await app.evaluate(({BrowserWindow},state)=>BrowserWindow.getAllWindows()[0].webContents.send('madness:dialogue:event:v1',state),state)}
async function viewport(page,size,label){const result=await setWorkspaceViewport(app,page,size);report.viewports.push({label,...result});return result}
async function shot(page,name){
 await page.evaluate(async()=>{
  let timer
  try{await Promise.race([(async()=>{
   await document.fonts.load('700 32px "Barlow Condensed"'); await document.fonts.ready
   if(!document.fonts.check('700 32px "Barlow Condensed"'))throw Error('DISPLAY_FONT_NOT_READY')
   const images=[...document.images].filter(image=>image.getClientRects().length>0)
   await Promise.all(images.map(image=>image.decode()))
   if(images.some(image=>!image.complete||!image.naturalWidth))throw Error('VISIBLE_PORTRAIT_NOT_READY')
   if([...document.querySelectorAll('.agent-portrait-trigger')].some(trigger=>!trigger.querySelector('img')))throw Error('EXPECTED_PORTRAIT_MISSING')
   const decorations=[]
   const decorationSurfaces=[[document.querySelector('.atelier-header'),null],[document.querySelector('.sidebar'),'::after']]
   for(const element of document.querySelectorAll('.sidebar,.agent-info-panel[open],.navigation-drawer[open],.topbar'))for(const pseudo of [null,'::before','::after'])decorationSurfaces.push([element,pseudo])
   const seenDecorations=new Set()
   for(const [element,pseudo]of decorationSurfaces){
    if(!element)continue;const style=getComputedStyle(element,pseudo)
    if(style.display==='none')continue
    for(const value of [style.backgroundImage,style.borderImageSource])for(const match of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)){
     if(seenDecorations.has(match[1]))continue;seenDecorations.add(match[1]);const image=new Image();image.src=match[1];decorations.push(image.decode())
    }
   }
   await Promise.all(decorations)
   const animations=document.getAnimations().filter(animation=>animation.playState==='running'&&Number.isFinite(animation.effect?.getTiming().iterations))
   await Promise.allSettled(animations.map(animation=>animation.finished))
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('CAPTURE_ASSET_READINESS_TIMEOUT')),15000)})])}finally{clearTimeout(timer)}
 })
 await page.locator('main').evaluate(e=>{e.scrollTop=0});assert.equal(await page.locator('main').evaluate(e=>e.scrollTop),0)
 const state=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,width:innerWidth,height:innerHeight,tab:document.querySelector('[role="tab"][aria-selected="true"]')?.textContent??null,mainScroll:document.querySelector('main').scrollTop,contextOpen:!!document.getElementById('project-context-panel'),connectionOpen:!!document.getElementById('codex-connection-panel'),navigationCollapsed:document.querySelector('.app-shell').classList.contains('nav-compact')}))
 state.zoomFactor=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.getZoomFactor())
 if(capture){const file=name+'.png';const frame=await app.evaluate(({BrowserWindow,screen})=>{const w=BrowserWindow.getAllWindows()[0];return {size:w.getContentSize(),scale:screen.getDisplayMatching(w.getBounds()).scaleFactor}});const nativeZoom=state.zoomFactor!==1;const bytes=nativeZoom?Buffer.from(await app.evaluate(async({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0],size=w.getContentSize();return (await w.webContents.capturePage({x:0,y:0,width:size[0],height:size[1]})).toPNG().toString('base64')}),'base64'):await page.screenshot({animations:'disabled',caret:'hide',scale:'device'});const pixels={width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};assert.ok(Math.abs(pixels.width-frame.size[0]*frame.scale)<=1&&Math.abs(pixels.height-frame.size[1]*frame.scale)<=1,'CAPTURE_MUST_COVER_FULL_NATIVE_CONTENT');await writeFile(join(output,file),bytes);report.captures.push({file,sha256:hash(bytes),method:nativeZoom?'electron-native-full-content-zoom':'playwright-electron-page-screenshot',state,nativeFrame:frame,pixels})}
}
async function geometry(page,label){
 await page.evaluate(async()=>{await Promise.allSettled(document.getAnimations().filter(animation=>animation.playState==='running'&&Number.isFinite(animation.effect?.getTiming().iterations)).map(animation=>animation.finished))})
 const value=await page.evaluate(()=>{
  const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}},toggle=document.querySelector(innerWidth<=720?'.mobile-menu':'.desktop-menu'),area=navigator.windowControlsOverlay.getTitlebarAreaRect()
  const containers=[...document.querySelectorAll('html,body,#root,.app-shell,.app-body,.workspace,.workspace-body,.sidebar,main,.main-inner,[role="tabpanel"],.conversation-messages,.agent-info-panel[open],.agent-panel-heading,.agent-panel-body')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect(),style=getComputedStyle(e);return {element:e.id?'#'+e.id:e.className||e.tagName.toLowerCase(),...box(e),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,overflowX:style.overflowX,overflowY:style.overflowY,horizontalOverflow:e.scrollWidth>e.clientWidth+1,shellOutsideViewport:e.matches('html,body,#root,.app-shell,.app-body,.workspace,.workspace-body,.sidebar,main,.agent-info-panel[open]')&&(r.x< -1||r.right>innerWidth+1||r.y< -1||r.bottom>innerHeight+1)}})
  const footer=document.querySelector('.status-line')?.getBoundingClientRect(),summaries=[...document.querySelectorAll('#panel-conversation > details > summary')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,...box(e)}))
  const caption=document.querySelector('.window-caption-plates')
  return {viewport:{width:innerWidth,height:innerHeight,clientWidth:document.documentElement.clientWidth,clientHeight:document.documentElement.clientHeight},titlebar:box(document.querySelector('.topbar')),area:{x:area.x,y:area.y,width:area.width,height:area.height},caption:caption?{...box(caption),count:caption.children.length,pointer:getComputedStyle(caption).pointerEvents}:null,toggle:box(toggle),rail:document.querySelector('.nav-compact .sidebar .nav-button')?box(document.querySelector('.nav-compact .sidebar .nav-button')):null,commands:[...document.querySelectorAll('.topbar button,.context-trigger')].filter(e=>e.getClientRects().length).map(e=>({label:e.getAttribute('aria-label'),...box(e),region:getComputedStyle(e).getPropertyValue('app-region')})),containers,textFlow:{footerTop:footer?.top??null,summaries,overlap:!!footer&&summaries.some(e=>e.y+e.height>footer.top+1)},overflow:containers.some(e=>e.horizontalOverflow||e.shellOutsideViewport)}
 })
 report.measurements.push({label,...value});assert.equal(value.overflow,false,label+' : débordement')
 assert.equal(value.textFlow.overlap,false,label+' : récupération et statut se chevauchent')
 if(value.caption){assert.equal(value.caption.count,3);assert.equal(value.caption.pointer,'none');assert.ok(Math.abs(value.caption.x-value.area.x-value.area.width)<=1&&Math.abs(value.caption.x+value.caption.width-value.viewport.width)<=1,label+' : alignement des plaques natives')}
 assert.equal(value.toggle.x+value.toggle.width/2,28,label+' : axe de la bascule')
 if(value.rail)assert.equal(value.rail.x+value.rail.width/2,28,label+' : axe du rail')
 for(const command of value.commands){assert.equal(command.width,40,label+' : cible '+command.label);assert.equal(command.height,40,label+' : cible '+command.label);if(command.label!=='Contexte du projet'){assert.equal(command.region,'no-drag');assert.ok(command.x>=value.area.x&&command.x+command.width<=value.area.x+value.area.width+1)}}
}
async function workPosition(page,label,selector,whole=false){
 await page.locator('main').evaluate(e=>{e.scrollTop=0})
 const value=await page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,viewportHeight:innerHeight,mainScroll:document.querySelector('main').scrollTop}})
 report.workPositions.push({label,selector,...value});assert.equal(value.mainScroll,0);assert.ok(value.top>=56&&value.top<value.viewportHeight-40,label+' : point de travail hors premier écran');if(whole)assert.ok(value.bottom<=value.viewportHeight-12,label+' : champ incomplet au premier écran')
}
try{
 root=await realpath(await mkdtemp(join(tmpdir(),'madness-workspace-design-')));const profile=join(root,'profile'),first=join(root,'first'),second=join(root,'second');await mkdir(profile);await mkdir(first);await mkdir(second)
 const context={projectId:'project-workspace',initiativeId:'initiative-synthetique',conversationId:'conversation-selected',providerId:'codex',connectionId:'synthetic'},other={...context,projectId:'project-other',conversationId:'conversation-other'}
 const snapshot={schemaVersion:1,revision:1,projects:[{id:context.projectId,name:'Projet personnel de qualification de la refonte avec un nom réellement très long sans abréviation',rootPath:first,openedAt:new Date().toISOString()},{id:other.projectId,name:'Autre projet avec un nom long et un contexte indépendant',rootPath:second,openedAt:new Date().toISOString()}],activeProjectId:null,drafts:[{projectId:context.projectId,text:'Brouillon enregistré distinct, été 日本語.',savedAt:new Date().toISOString()}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'historical',role:'assistant',text:'Échange historique synthétique. Identité et état du tour inconnus.'}]},{id:other.conversationId,context:other,lastKnownActivity:'idle',messages:[]}]}
 const q={schemaVersion:1,id:'question-workspace',context,requestId:'request-workspace',turnId:'turn-workspace',identity:{kind:'unknown'},fields:[{id:'answer',header:'Direction',prompt:'Quelle direction pour cet échange précis ?',options:[],allowOther:true}],values:{answer:'Réponse historique distincte.'},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 const a={schemaVersion:1,id:'approval-workspace',context,requestId:'request-approval',turnId:'turn-approval',identity:{kind:'unknown'},mode:'file-approval',files:[{path:join(first,'proposition.md'),kind:'add',diff:'Patch complet synthétique sans effet observé.',beforeSha256:null,afterSha256:hash('Patch complet synthétique sans effet observé.')}],reason:'reopened',adjustment:'Ajustement conservé.',adjustmentStatus:'draft',status:'unknown',decision:'accept',transmission:'sent',effect:'unknown',result:null,createdAt:new Date().toISOString(),expiresAt:Date.now()+600000,revision:3,storage:'stored'}
 if(args.includes('--presentation')||args.includes('--controls')||args.includes('--rail')){
  snapshot.projects[0].name='Madness';snapshot.projects[1].name='MIA'
  snapshot.conversations[0].messages=[{id:'presentation-user',role:'user',text:'Je veux un atelier où retrouver mon projet, mes idées et les agents avec qui je travaille.'}]
  snapshot.drafts[0].text='Commençons par le parcours de mon projet.'
 }
 const snapshotPath=join(profile,'madness-state-v1.json');await writeFile(snapshotPath,JSON.stringify(snapshot));await new QuestionStore(join(profile,'questions-v1')).write(q);await new ApprovalStore(join(profile,'approvals-v1')).write(a)
 let page=await launch(profile)
 if(args.includes('--type')){
  report.typography=await page.evaluate(async()=>{
   const sample='Été, œuvre, cœur, où, façade : vérifier le brouillon — 0123456789.'
   const loaded=await document.fonts.load('450 16px "Oxanium"',sample);await document.fonts.ready
   if(!loaded.some(face=>face.family.includes('Oxanium')&&face.status==='loaded'))throw Error('BODY_FONT_NOT_LOADED')
   const body=getComputedStyle(document.body)
   return {family:body.fontFamily,weight:body.fontWeight,sample,loaded:document.fonts.check('450 16px "Oxanium"',sample)}
  });assert.ok(report.typography.family.startsWith('Oxanium'));assert.equal(report.typography.weight,'450');assert.equal(report.typography.loaded,true);pass('local-oxanium-loaded-with-french-reading-sample')
 }
 if(args.includes('--caption')){
  report.caption=await page.evaluate(()=>{const overlay=navigator.windowControlsOverlay,area=overlay.getTitlebarAreaRect(),skin=document.querySelector('.window-caption-plates'),r=skin?.getBoundingClientRect();return {visible:overlay.visible,count:skin?.children.length??0,interactive:skin?.querySelectorAll('button,a,input,[tabindex]').length??0,hidden:skin?.getAttribute('aria-hidden'),pointer:skin?getComputedStyle(skin).pointerEvents:null,area:{x:area.x,y:area.y,width:area.width,height:area.height},skin:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,width:innerWidth}})
  assert.equal(report.caption.count,3,'CAPTION_PLATES_MISSING');assert.equal(report.caption.visible,true);assert.equal(report.caption.interactive,0);assert.equal(report.caption.hidden,'true');assert.equal(report.caption.pointer,'none')
  assert.ok(Math.abs(report.caption.skin.x-report.caption.area.x-report.caption.area.width)<=1);assert.ok(Math.abs(report.caption.skin.x+report.caption.skin.width-report.caption.width)<=1)
  pass('native-caption-region-three-noninteractive-plates-aligned')
  const initialTheme=await page.evaluate(()=>document.documentElement.dataset.theme)
  for(const theme of ['dark','light']){
   if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:'Passer au thème '+(theme==='dark'?'sombre':'clair'),exact:true}).click()
   await page.evaluate(()=>{const probe=document.createElement('fieldset');probe.id='caption-form-probe';probe.className='question-panel';probe.innerHTML='<legend>Témoin de qualification — aucune action du projet</legend><label class="question-option"><input id="skin-checkbox" type="checkbox">Case de test</label><label class="question-option"><input id="skin-radio-a" name="skin-radio" type="radio" checked>Choix A</label><label class="question-option"><input id="skin-radio-b" name="skin-radio" type="radio">Choix B</label><label class="question-option"><input type="checkbox" checked disabled>État indisponible</label>';Object.assign(probe.style,{position:'fixed',zIndex:'90',left:'80px',top:'100px',width:'520px',padding:'24px',background:'var(--panel)',color:'var(--text)'});document.body.append(probe)})
   await page.locator('#skin-checkbox').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#skin-checkbox').isChecked(),true)
   await page.locator('#skin-radio-a').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#skin-radio-b').isChecked(),true)
   assert.equal(await page.locator('#skin-radio-b').evaluate(e=>e.matches(':focus-visible')),true)
   await shot(page,'form-controls-'+theme)
   await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('#skin-checkbox').evaluate(e=>getComputedStyle(e).appearance),'auto')
   await page.emulateMedia({forcedColors:null});await page.locator('#caption-form-probe').evaluate(e=>e.remove())
  }
  if(await page.evaluate(()=>document.documentElement.dataset.theme)!==initialTheme)await page.getByRole('button',{name:'Passer au thème '+(initialTheme==='dark'?'sombre':'clair'),exact:true}).click()
  pass('checkbox-radio-real-keyboard-states-focus-and-forced-colors-css-fallback')
  if(args.includes('--caption-hold')){
   await viewport(page,{width:1320,height:860},'native-caption-inspection')
   if(args.includes('--caption-light')&&await page.evaluate(()=>document.documentElement.dataset.theme)!=='light')await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click()
   await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setTitle('Madness — qualification chrome'))
   const eventsPath=join(output,'native-events.json')
   await app.evaluate(({BrowserWindow},path)=>{const fs=process.getBuiltinModule('node:fs'),w=BrowserWindow.getAllWindows()[0],events=[];const record=event=>{events.push({event,maximized:w.isMaximized(),minimized:w.isMinimized(),bounds:w.getBounds()});fs.writeFileSync(path,JSON.stringify(events,null,2)+'\n')};for(const event of ['maximize','unmaximize','minimize','restore','close'])w.on(event,()=>{record(event);if(event==='close')globalThis.__workspaceObservation.flush()});record('ready')},eventsPath)
   const observed=await app.evaluate(()=>globalThis.__workspaceObservation.flush());assert.ok(observed.complete&&observed.attached);activeSession.observerAvailable=true
   const ready={status:'ready',title:'Madness — qualification chrome',main:activeSession.main,profile,stopFile:join(output,'stop-native-inspection')}
   await writeFile(join(output,'native-ready.json'),JSON.stringify(ready,null,2)+'\n')
   if(args.includes('--caption-close'))await app.evaluate(({BrowserWindow})=>setTimeout(()=>BrowserWindow.getAllWindows()[0].close(),500))
   const deadline=Date.now()+240000
   while(Date.now()<deadline&&!activeSession.closeObserved){try{await readFile(ready.stopFile);break}catch(error){if(error.code!=='ENOENT')throw error}await pause(250)}
   report.limits.push('Pause de qualification native bornée à240s ; le banc n’envoie aucun input Windows.')
   if(activeSession.closeObserved){activeSession.closeAttempted=true;report.nativeCloseSource='external-window-control';const observed=JSON.parse(await readFile(activeSession.observationPath,'utf8'));assert.equal(observed.startedAt,activeSession.observationStartedAt);assert.equal(observed.network,0);assert.equal(observed.appServerAttempts,0)}else await assertNoActivity()
   pass('native-inspection-no-network-or-model-after-hook');report.status='passed';return report
  }
 }
 if(args.includes('--rail')){
  await viewport(page,{width:1320,height:900},'navigation')
  const links=page.locator('.sidebar .project-link')
  const marks=await links.locator('.project-mark').allTextContents();assert.deepEqual(marks,['MA','MIA']);pass('project-marks-distinguish-madness-and-mia')
  await links.first().click()
  report.navigation=[]
  for(const theme of ['light','dark']){
   if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:'Passer au thème '+(theme==='dark'?'sombre':'clair'),exact:true}).click()
   for(const collapsed of [false,true]){
    if(await page.locator('.app-shell').evaluate(e=>e.classList.contains('nav-compact'))!==collapsed)await page.getByRole('button',{name:collapsed?'Réduire la navigation':'Déployer la navigation',exact:true}).click()
    const metrics=await page.evaluate(()=>{
     const rail=document.querySelector('.sidebar'),selected=rail.querySelector('.nav-button.selected'),mark=selected.querySelector('.project-mark'),style=getComputedStyle(rail),button=getComputedStyle(selected)
     const luminance=value=>(value.trim().startsWith('#')?value.trim().slice(1).match(/../g).map(n=>parseInt(n,16)):value.match(/[\d.]+/g).slice(0,3).map(Number)).map(n=>n/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)
     const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05)
     return {width:rail.getBoundingClientRect().width,background:style.backgroundColor,selectedText:contrast(button.color,button.backgroundColor),labelText:contrast(style.color,style.backgroundColor),markText:contrast(getComputedStyle(mark).color,getComputedStyle(mark,'::after').backgroundColor),focus:contrast(style.getPropertyValue('--rail-focus'),style.backgroundColor)}
    });assert.ok(metrics.selectedText>=4.5&&metrics.labelText>=4.5&&metrics.markText>=4.5);assert.ok(metrics.focus>=3);if(collapsed)assert.equal(metrics.width,58)
    report.navigation.push({theme,collapsed,...metrics});await geometry(page,'navigation-'+theme+'-'+(collapsed?'rail':'expanded'));await shot(page,'navigation-'+theme+'-'+(collapsed?'rail':'expanded'))
   }
   await links.first().focus();await page.keyboard.press('Tab');assert.equal(await links.nth(1).evaluate(e=>e===document.activeElement),true)
   await page.keyboard.press('Enter');await page.waitForFunction(async id=>(await window.madness.readState()).value.state.activeProjectId===id,other.projectId)
   await page.getByRole('button',{name:'Déployer la navigation',exact:true}).click()
  }
  await page.getByRole('button',{name:'Accueil',exact:true}).click();pass('navigation-two-themes-targets-contrast-keyboard-exact-project')
 }
 if(args.includes('--controls')){
  report.limits.push('Profil d’aide fictif et gardes de lancement inchangées ; clics renderer et géométrie de déplacement, pas injection souris native Windows.')
  await viewport(page,{width:1440,height:1000},'controls-home')
  await shot(page,'home-controls-dark')
  const before=await page.getByRole('button',{name:'Réduire la navigation',exact:true}).getAttribute('aria-expanded')
  await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click();await page.getByRole('button',{name:'Déployer la navigation',exact:true}).waitFor()
  await page.getByRole('button',{name:'Déployer la navigation',exact:true}).click();assert.equal(before,'true');pass('toolbar-navigation-renderer-click')
  await app.evaluate(({dialog})=>{globalThis.__folderChecks=0;dialog.showOpenDialog=async()=>{globalThis.__folderChecks++;return {canceled:true,filePaths:[]}}})
  await page.getByRole('button',{name:'Ouvrir un projet',exact:true}).click();await page.getByText('Ouverture annulée. Aucun projet ajouté.',{exact:true}).waitFor()
  assert.equal(await app.evaluate(()=>globalThis.__folderChecks),1);pass('toolbar-folder-real-main-cancel-no-project-added')
  await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');pass('toolbar-theme-real-main')
  await page.getByRole('button',{name:/^Connexion Codex :/}).click();await page.locator('#codex-connection-panel').waitFor();await shot(page,'connection-controls-light');await page.keyboard.press('Escape');pass('toolbar-connection-panel-no-verification')
  const collisions=await page.evaluate(()=>{
   const regions=[...document.querySelectorAll('.topbar,.topbar *')].filter(e=>getComputedStyle(e).getPropertyValue('app-region')==='drag').map(e=>e.getBoundingClientRect())
   return [...document.querySelectorAll('.topbar button')].filter(e=>e.getClientRects().length).filter(e=>{const b=e.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;return regions.some(r=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)}).map(e=>e.getAttribute('aria-label'))
  });assert.deepEqual(collisions,[]);pass('toolbar-controls-outside-every-drag-region')
  await page.locator('.project-row').first().click()
  const bundle={schemaVersion:1,id:'controls-help',projectId:context.projectId,rootPath:first,observedAt:new Date().toISOString(),revision:'a'.repeat(64),diagnostic:'partial',nativeReady:false,problems:['Source requise absente dans ce profil de démonstration.'],documents:[{id:'help-doc',source:join(first,'help.md'),snapshot:'help.md',sha256:'b'.repeat(64),bytes:21,text:'Aide locale synthétique',module:'bmm',skills:[]}],references:[{module:'bmm',path:'references-only.md'}],sources:[],activeInitiative:null,selectedInitiative:null,outputPath:null,inventories:[],knowledgeRaw:'{}',configRaw:'{}',skillPath:join(first,'.agents/skills/bmad/SKILL.md')}
  const help={contractVersion:1,sequence:2000,status:'ready',projectId:context.projectId,bundle,records:[],error:null};assert.equal(isHelpState(help),true)
  await app.evaluate(({BrowserWindow},{channel,state})=>BrowserWindow.getAllWindows()[0].webContents.send(channel,state),{channel:HELP_EVENT_CHANNEL,state:help})
  await page.getByRole('button',{name:'Voir les aides',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Demander à BMad',exact:true}).isDisabled(),true)
  pass('help-native-guard-preserved-unqualified-profile')
  for(const size of [{width:1440,height:1000},{width:720,height:920}]){
   await viewport(page,size,'help-controls-'+size.width)
   for(const theme of ['light','dark']){
    if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:'Passer au thème '+(theme==='dark'?'sombre':'clair'),exact:true}).click()
    await page.locator('.help-panel').evaluate(e=>e.scrollIntoView({block:'start'}));await geometry(page,'help-controls-'+size.width+'-'+theme);await shot(page,'help-controls-'+theme+'-'+size.width)
   }
  }
  await assertNoActivity();pass('controls-no-network-or-model-after-hook');report.status='passed';return report
 }
 if(args.includes('--presentation')){
  report.limits.push('Vue de présentation à contenu fictif ; distincte de la matrice de qualification avec noms longs et états critiques.')
  await viewport(page,{width:1440,height:1000},'presentation')
  await page.locator('.project-row').first().click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
  const message={id:'presentation-sally',context,requestId:'presentation-request',turnId:'presentation-turn',order:1,revision:1,text:'Bienvenue à l’atelier.\n\nIci, chaque projet garde son histoire et chaque agent apporte son regard. On clarifie une idée, on dessine un parcours, puis on construit ensemble.\n\nTu gardes la main sur les décisions. Je t’aide à rendre la prochaine étape plus claire.',phase:'complete',storage:'stored',identity:{kind:'attested',name:'Sally',source:'synthetic-presentation-author'}}
  assert.equal(isDialogueMessage(message),true)
  await emit({...initialDialogueState(),sequence:2000,messages:[message]})
  await page.getByRole('button',{name:'Fiche de Sally',exact:true}).waitFor()
  await shot(page,'presentation-dialogue-dark')
  await page.getByRole('button',{name:'Fiche de Sally',exact:true}).click();await page.locator('.agent-info-panel[open]').waitFor()
  await geometry(page,'presentation-profile');await shot(page,'presentation-sally-dark')
  await assertNoActivity();pass('synthetic-presentation-no-model-or-network-after-hook')
  report.status='presentation';return report
 }
 assert.equal((await page.evaluate(()=>window.madnessConnection.read())).state.accountStored,false);assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).questions[0].status,'inactive');pass('no-account-restored-request-inactive')
 await viewport(page,{width:1440,height:920},'home');await shot(page,'home-dark-expanded')
 await page.locator('.project-row').first().click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 await page.locator('#draft').fill('Saisie visible non enregistrée avant navigation et consultation.')
 const contextButton=page.getByRole('button',{name:'Contexte du projet',exact:true});await contextButton.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.id==='project-context-title');await page.getByRole('dialog',{name:'Contexte du projet',exact:true}).getByText(first,{exact:true}).waitFor();await shot(page,'context-dark-desktop');await page.keyboard.press('Escape');assert.equal(await contextButton.evaluate(e=>e===document.activeElement),true);pass('context-complete-keyboard-escape-return-focus')
 await page.getByRole('button',{name:'Préparer un échange',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='mary-title');assert.equal(await page.getByRole('tab',{name:'Parcours',exact:true}).getAttribute('aria-selected'),'true');assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle');await shot(page,'project-dark-expanded');await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),'Saisie visible non enregistrée avant navigation et consultation.');pass('prepare-mount-focus-no-implicit-launch-and-draft-preserved')
 for(const size of [{width:1600,height:1000},{width:1440,height:920},{width:1323,height:920},{width:1320,height:900},{width:720,height:820},{width:600,height:820}]){
  await viewport(page,size,'workspace-'+size.width)
  for(const theme of ['dark','light']){
   if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:'Passer au thème '+(theme==='dark'?'sombre':'clair'),exact:true}).click()
   await geometry(page,size.width+'-'+theme)
   if(size.width>720){await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click();await geometry(page,size.width+'-'+theme+'-collapsed');if(size.width===1440&&theme==='dark')await shot(page,'conversation-dark-rail');await page.getByRole('button',{name:'Déployer la navigation',exact:true}).click()}
   else{await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click();await page.getByRole('dialog',{name:'Madness',exact:true}).getByRole('button',{name:'Ouvrir le projet '+snapshot.projects[0].name,exact:true}).waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).evaluate(e=>e===document.activeElement),true)}
   if(size.width===1440&&theme==='dark'||size.width===720){await workPosition(page,'historical-draft-'+size.width+'-'+theme,'#draft',true);await shot(page,'conversation-'+theme+'-'+size.width)}
   if(size.width===720&&theme==='light'){await page.getByRole('button',{name:/^Connexion Codex :/}).click();await page.waitForFunction(()=>document.activeElement?.id==='codex-connection-title');await shot(page,'connection-light-compact');await page.keyboard.press('Escape')}
  }
 }
 pass('six-widths-two-themes-expanded-collapsed-drawer-long-names-no-overflow-targets-axis-native-exclusion')
  const atelierMessages=['Mary','John','Sofia','Winston','Sally','Amelia','Smithy'].map((name,order)=>({id:'atelier-'+name,context,requestId:'atelier-request',turnId:'atelier-turn',order:order+1,revision:1,text:'Présentation synthétique de '+name+'. La conversation et ses sources restent au centre.',phase:'complete',storage:'stored',identity:{kind:'attested',name,source:'synthetic-native-author-'+name}}))
  assert.ok(atelierMessages.every(isDialogueMessage),'Atelier projections must satisfy the real per-message contract.')
 let atelierSequence=500
 await emit({...initialDialogueState(),sequence:atelierSequence++,context,messages:atelierMessages})
 await viewport(page,{width:1600,height:1000},'seven-agent-full-panels')
 if(await page.evaluate(()=>document.documentElement.dataset.theme)!=='dark')await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).click()
 report.agentViews=[]
 for(const message of atelierMessages){
  const name=message.identity.name,trigger=page.getByRole('button',{name:'Fiche de '+name,exact:true}),viewName='agent-full-'+name.toLowerCase()+'-dark-1600'
  await trigger.click();const panel=page.getByRole('region',{name:'Fiche de '+name,exact:true});await panel.waitFor();await panel.locator('.agent-panel-body').evaluate(e=>{e.scrollTop=0})
  const rendered=await panel.evaluate(async e=>{const image=e.querySelector('.agent-bust img');await image.decode();const r=image.getBoundingClientRect(),frame=e.querySelector('.agent-bust').getBoundingClientRect();return {role:e.querySelector('.agent-role').textContent,assetUrl:image.src,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,image:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},frame:{x:frame.x,y:frame.y,right:frame.right,bottom:frame.bottom},bodyScroll:e.querySelector('.agent-panel-body').scrollTop}})
  assert.ok(rendered.naturalWidth>0&&rendered.naturalHeight>0);assert.ok(basename(new URL(rendered.assetUrl).pathname).startsWith(name.toLowerCase()+'-bust-'));assert.equal(rendered.bodyScroll,0);assert.ok(rendered.image.x>=rendered.frame.x&&rendered.image.y>=rendered.frame.y&&rendered.image.right<=rendered.frame.right&&rendered.image.bottom<=rendered.frame.bottom)
  await panel.getByText(message.identity.source,{exact:true}).waitFor();await geometry(page,viewName);await assertNoActivity();await shot(page,viewName)
  const sourceAsset='src/renderer/src/assets/atelier/'+name.toLowerCase()+'-bust.png'
  report.agentViews.push({name,role:rendered.role,sourceAsset,sourceAssetSha256:hash(await readFile(join(repository,sourceAsset))),renderedAssetUrl:rendered.assetUrl,messageId:message.id,identitySource:message.identity.source,theme:'dark',requestedViewport:{width:1600,height:1000},screenshot:capture?viewName+'.png':null})
  await page.keyboard.press('Escape');await panel.waitFor({state:'detached'});assert.equal(await trigger.evaluate(e=>document.activeElement===e),true)
 }
 assert.equal(report.agentViews.length,7);await writeFile(join(output,'agent-views-index.json'),JSON.stringify({schemaVersion:1,scope:'Seven synthetic attested message authors; static roles and illustrations do not prove activation or installed capabilities.',views:report.agentViews},null,2)+'\n');pass('seven-full-agent-panels-1600-dark-indexed-role-asset-message-source-no-activity')
 for(const size of [{width:1600,height:1000},{width:1440,height:920},{width:1323,height:920},{width:1322,height:920},{width:720,height:820},{width:600,height:820}]){
  await viewport(page,size,'agent-panel-'+size.width)
  for(const theme of ['dark','light']){
   if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:'Passer au thème '+(theme==='dark'?'sombre':'clair'),exact:true}).click()
   const trigger=page.getByRole('button',{name:'Fiche de Sally',exact:true}),beforeWidth=await page.locator('main').evaluate(e=>e.clientWidth)
   await trigger.click();const panel=page.getByRole(size.width>=1323?'region':'dialog',{name:'Fiche de Sally',exact:true});await panel.waitFor();assert.equal(await panel.evaluate(e=>e.matches(':modal')),size.width<1323)
   await panel.getByText('synthetic-native-author-Sally',{exact:true}).waitFor();assert.equal(await panel.getByRole('button').count(),1);assert.equal(await page.locator('#draft').inputValue(),'Saisie visible non enregistrée avant navigation et consultation.')
   if(size.width>=1323)assert.ok(await page.locator('main').evaluate(e=>e.clientWidth)<beforeWidth)
   else{await page.locator('#draft').evaluate(e=>e.focus());assert.equal(await page.locator('#draft').evaluate(e=>document.activeElement===e),false)}
   await geometry(page,'atelier-panel-'+size.width+'-'+theme);await assertNoActivity();await shot(page,'atelier-panel-'+theme+'-'+size.width)
   await page.keyboard.press('Escape');await panel.waitFor({state:'detached'});assert.equal(await trigger.evaluate(e=>document.activeElement===e),true);assert.equal(await page.locator('main').evaluate(e=>e.clientWidth),beforeWidth)
  }
 }
 await emit({...initialDialogueState(),sequence:atelierSequence++,context})
 assert.equal(await page.getByRole('button',{name:'Fiche de Sally',exact:true}).count(),0);await assertNoActivity();pass('atelier-seven-exact-attested-authors-six-widths-both-sides-1323-both-themes-local-panel-inert-focus-width-draft-and-unknown-restoration')
 await viewport(page,{width:1320,height:920},'before-zoom-200');await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(2));await page.waitForFunction(()=>innerWidth<720);await geometry(page,'zoom-200-percent')
 const zoomDraft=page.locator('#draft'),zoomBefore=await zoomDraft.inputValue(),zoomAddition=' — essai zoom';await zoomDraft.focus();await page.keyboard.press('Control+End');await page.keyboard.insertText(zoomAddition);assert.equal(await zoomDraft.inputValue(),zoomBefore+zoomAddition);for(let index=0;index<zoomAddition.length;index++)await page.keyboard.press('Backspace');assert.equal(await zoomDraft.inputValue(),zoomBefore)
 const zoomContext=page.getByRole('button',{name:'Contexte du projet',exact:true});await zoomContext.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.id==='project-context-title');await page.keyboard.press('Escape');assert.equal(await zoomContext.evaluate(e=>e===document.activeElement),true);await shot(page,'conversation-zoom-200');assert.equal(await zoomDraft.inputValue(),'Saisie visible non enregistrée avant navigation et consultation.');await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));pass('actual-electron-zoom-200-percent-keyboard-edit-retract-context-return-no-overflow')
 await page.emulateMedia({reducedMotion:'reduce'});const open=page.getByRole('button',{name:'Ouvrir un projet',exact:true});await open.focus();assert.equal(await open.locator('.command-tooltip').isVisible(),true);assert.equal(await open.locator('svg').evaluate(e=>getComputedStyle(e).animationName),'none');await page.keyboard.press('Escape');assert.equal(await open.locator('.command-tooltip').isVisible(),false);pass('keyboard-help-escape-reduced-motion-static-folder')
 const live={...initialDialogueState(),sequence:1000,status:'waiting-question',context,acknowledged:true,turn:{id:q.turnId,requestId:q.requestId,context,phase:'streaming'},questions:[q],approvals:[a]};await emit(live);await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='question-workspace-title');assert.equal(await page.locator('#conversation-heading').textContent(),'Conversation conversation-selected');assert.equal(await page.locator('[data-question-id="question-workspace"] button[type="submit"]').count(),1);await workPosition(page,'active-question-first-screen','[data-question-id="question-workspace"] textarea',true);pass('exact-active-question-focus-context-visible-field-and-explicit-response');await shot(page,'active-question-light')
 await emit({...live,sequence:1001,status:'waiting-approval',turn:{id:a.turnId,requestId:a.requestId,context,phase:'streaming'},questions:[{...q,status:'inactive',reason:'resolved'}],approvals:[{...a,status:'waiting',reason:null,decision:null,effect:'pending',transmission:'none'}]});await page.getByRole('button',{name:'Retrouver l’opération',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='approval-workspace-title');const approval=page.locator('[data-approval-id="approval-workspace"]');await approval.getByText(a.files[0].diff,{exact:true}).waitFor();assert.equal(await approval.locator('input:checked').count(),0);assert.ok(await approval.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).isVisible());await workPosition(page,'active-approval-first-screen','[data-approval-id="approval-workspace"] .approval-file pre');pass('active-approval-visible-complete-patch-before-textual-choices-no-default');await shot(page,'active-approval-light')
 const global={...initialDialogueState(),sequence:1002,status:'unknown',errorCode:'STOP_UNCONFIRMED',recovery:{...initialDialogueState().recovery,stop:'unconfirmed'}};await emit(global);assert.equal(await page.locator('[data-overview-id="session-recovery"]').isVisible(),true);await page.getByRole('button',{name:'Retrouver la récupération',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='overview-session-recovery');await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).waitFor();pass('global-stop-visible-exact-access-home-no-replay');await shot(page,'global-recovery-light')
 const savedBytes=await readFile(snapshotPath);await page.locator('.project-row').first().click();await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),'Saisie visible non enregistrée avant navigation et consultation.');await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click();await page.waitForFunction(()=>document.getElementById('draft-status')?.textContent==='Brouillon enregistré localement.');assert.notDeepEqual(await readFile(snapshotPath),savedBytes)
 const before={snapshot:await readFile(snapshotPath),question:await readFile(join(profile,'questions-v1',q.id+'.json')),approval:await readFile(join(profile,'approvals-v1',a.id+'.json')),appearance:await readFile(join(profile,'appearance-v1.json'))};await assertNoActivity();await stop();page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),'Saisie visible non enregistrée avant navigation et consultation.');const restored=await page.evaluate(()=>window.madnessDialogue.read());assert.equal(restored.status,'idle');assert.equal(restored.turn,null);assert.equal(restored.approvals[0].effect,'unknown');for(const [name,path]of [['snapshot',snapshotPath],['question',join(profile,'questions-v1',q.id+'.json')],['approval',join(profile,'approvals-v1',a.id+'.json')],['appearance',join(profile,'appearance-v1.json')]])assert.deepEqual(await readFile(path),before[name]);await assertNoActivity();pass('explicit-save-close-reopen-exact-draft-history-preferences-annexes-no-network-or-app-server-after-hook')
 report.atelierSources=[];for(const file of ['src/renderer/src/App.tsx','src/renderer/src/styles.css','src/renderer/src/help.css','src/renderer/src/AgentInfoPanel.tsx','src/renderer/src/AgentPortrait.tsx','src/renderer/src/agentPresentation.ts','resources/THIRD-PARTY-NOTICES.md','notices/atelier-assets.json',...(await readdir(join(repository,'src/renderer/src/assets/atelier'))).map(name=>'src/renderer/src/assets/atelier/'+name)]){const bytes=await readFile(join(repository,file));report.atelierSources.push({file,bytes:bytes.length,sha256:hash(bytes)})}
 report.runtime=await app.evaluate(({app})=>({electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged,version:app.getVersion()}));report.artifact={path:packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js'),sha256:hash(await readFile(packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js')))};report.status='passed'
}catch(error){report.status='failed';report.failure=error instanceof Error?error.stack:String(error);process.exitCode=1}
finally{try{await stop()}catch(error){report.stopFailure=error instanceof Error?error.stack:String(error);report.stopUnconfirmed=true;report.status='failed';process.exitCode=1}if(root&&!app&&sessions.every(owned=>owned.closed===true)){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)===base&&/^madness-workspace-design-[A-Za-z0-9]+$/.test(basename(actual))&&!(await lstat(root)).isSymbolicLink()){await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}}if(root&&!report.cleanup)report.retainedWorkspace=root;report.finishedAt=new Date().toISOString();await writeFile(join(output,'profile.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,cleanup:report.cleanup,failure:report.failure??null}))}
return report
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await runWorkspaceDesign()
