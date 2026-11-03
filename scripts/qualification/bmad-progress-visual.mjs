// Visual-only native recapture from an actual, dated Main projection. No collector.
import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,readFile,writeFile,readdir,realpath,stat,rm} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {isSnapshot} from '../../src/contracts/index.ts'
import {isBmadProgressSnapshot,BMAD_PROGRESS_EVENT_CHANNEL} from '../../src/contracts/bmad-progress.ts'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {installWorkspaceObservationRuntime,closeWorkspaceSession,setWorkspaceViewport} from './workspace-design.mjs'
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url))),require=createRequire(import.meta.url)
const input=resolve(process.argv.find(a=>a.startsWith('--from='))?.slice(7)??'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/main-004')
const output=resolve(process.argv.find(a=>a.startsWith('--output='))?.slice(9)??'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/visual-recapture-zoom-001')
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
await mkdir(output,{recursive:true})
const root=await realpath(await mkdtemp(join(tmpdir(),'mprogress-visual-'))),profile=join(root,'profile')
const report={schemaVersion:1,startedAt:new Date().toISOString(),status:'partial',root,source:input,checks:[],cleanup:false,limits:['Visual-only historical projection rehydrated from actual Main004 bytes; no current filesystem observation is claimed.','Selection annexes are synthetic view fixtures derived from the captured identities, not original annex-byte preservation.','No collector/helper/provider/network invoked; no human visual approval or full accessibility audit.']}
let active=null,closure=null
try{
 const receiptBytes=await readFile(join(input,'verification.json')),receipt=JSON.parse(receiptBytes),baseline=await readFile(join(input,'snapshot-after-navigation.json')),snapshot=JSON.parse(baseline)
 assert.equal(receipt.status,'passed');assert.equal(isSnapshot(snapshot),true);assert.equal(sha(baseline),receipt.snapshotAfterNavigationSha256)
 report.sourceReceiptSha256=sha(receiptBytes);report.sourceBaselineSha256=sha(baseline)
 report.sourceExecutableInputs=receipt.inputs;report.currentExecutableInputs={}
 for(const file of ['out/main/index.js','out/preload/index.js','out/renderer/index.html','package.json'])report.currentExecutableInputs[file]=sha(await readFile(join(repository,file)))
 report.currentRendererInputs={}
 for(const file of await readdir(join(repository,'out/renderer/assets')))report.currentRendererInputs[file]=sha(await readFile(join(repository,'out/renderer/assets',file)))
 report.binaryEquivalenceClaim=false
 const projection=receipt['snapshot-project-a'];assert.equal(isBmadProgressSnapshot(projection),true);assert.equal(snapshot.activeProjectId,projection.projectId)
 report.projection={projectId:projection.projectId,initiativeId:projection.initiativeId,revision:projection.revision,contextRevision:projection.contextRevision,observedAt:projection.observedAt}
 // An owned, separately identified view fixture stresses the list without
 // attributing synthetic statements to Main004's native source bytes.
 const longId='project-long-synthetic',longRoot=join(root,'synthetic-long-project'),longInitiative=join(longRoot,'_bmad-output/beta'),longAt=new Date().toISOString(),longLines=['# Synthetic visual qualification only'],longDeclarations=[]
 await mkdir(join(longInitiative,'tickets'),{recursive:true})
 for(let index=0;index<120;index++){const line=longLines.length+1,title='Entrée synthétique de qualification '+(index+1);longLines.push('[[entry]]','id = '+(index+1),'type = "story"','title = "'+title+'"','');longDeclarations.push({sourceId:'source-synthetic-long-entry',container:'.',ticketId:String(index+1),title,field:'existence',value:'entry',line})}
 const longBytes=Buffer.from(longLines.join('\n')+'\n'),longPath=join(longInitiative,'tickets/tickets.toml'),readingBytes=Buffer.from('# Source synthétique\n\n## Résultats synthétiques\nRésultat synthétique de qualification.\n\n## Travail restant synthétique\nTravail restant synthétique, sans agent lancé.\n'),readingPath=join(longInitiative,'synthetic-reading.md')
 await writeFile(longPath,longBytes,{flag:'wx'});await writeFile(readingPath,readingBytes,{flag:'wx'});await writeFile(join(output,'synthetic-long-source.toml'),longBytes,{flag:'wx'});await writeFile(join(output,'synthetic-reading-source.md'),readingBytes,{flag:'wx'})
 const syntheticSource=async(id,path,kind)=>({id,kind,path,relativePath:path.slice(longInitiative.length+1).replaceAll('\\','/'),sha256:sha(await readFile(path)),bytes:(await stat(path)).size,modifiedAt:(await stat(path)).mtime.toISOString()})
 const longProjection={schemaVersion:1,projectId:longId,rootPath:longRoot,rootIdentity:'synthetic-visual-fixture-root',initiativeId:'beta',initiativePath:longInitiative,contextRevision:sha('synthetic-view-context-not-a-native-observation'),revision:sha(Buffer.concat([longBytes,readingBytes])),observedAt:longAt,coverage:'partial',sources:[await syntheticSource('source-synthetic-long-entry',longPath,'entry'),await syntheticSource('source-synthetic-reading',readingPath,'document')],declarations:longDeclarations,excerpts:[{sourceId:'source-synthetic-reading',category:'results',heading:'Résultats synthétiques',text:'Résultat synthétique de qualification.\n\n',startLine:4,endLine:5},{sourceId:'source-synthetic-reading',category:'remaining',heading:'Travail restant synthétique',text:'Travail restant synthétique, sans agent lancé.\n',startLine:7,endLine:7}],problems:['Vue de qualification synthétique : ces120entrées ne sont pas des faits du projet Main004 ; aucun collecteur ni agent lancé.']}
 assert.equal(isBmadProgressSnapshot(longProjection),true)
 const longContext={projectId:longId,initiativeId:'beta',conversationId:'synthetic-long-recap',providerId:'codex',connectionId:'synthetic-no-account'}
 snapshot.projects.push({id:longId,name:'Vue synthétique — liste longue',rootPath:longRoot,openedAt:longAt});snapshot.conversations.push({id:longContext.conversationId,context:longContext,lastKnownActivity:'idle',messages:[{id:'synthetic-recap-text',role:'assistant',text:'Récapitulatif synthétique de qualification, sans agent lancé.'}]});snapshot.drafts.push({projectId:longId,text:'Brouillon synthétique de la vue longue.',savedAt:longAt});assert.equal(isSnapshot(snapshot),true)
 report.syntheticFixture={projectId:longId,projection:longProjection,notCollectorOutput:true};report.limits.push('Long-list cases are a separately identified synthetic view fixture over owned source bytes; Main004 conversations keep their own captured context.')
 const seededBytes=Buffer.from(JSON.stringify(snapshot,null,2)+'\n');report.seededSnapshotSha256=sha(seededBytes)
 await mkdir(join(profile,'bmad-context-v1'),{recursive:true});await writeFile(join(profile,'madness-state-v1.json'),seededBytes,{flag:'wx'})
 for(const project of snapshot.projects){const captured=project.id===longId?longProjection:receipt['snapshot-'+project.id];assert.equal(isBmadProgressSnapshot(captured),true);await writeFile(join(profile,'bmad-context-v1',project.id+'.json'),JSON.stringify({schemaVersion:1,projectId:project.id,rootPath:captured.rootPath,rootIdentity:captured.rootIdentity,revision:1,initiativeId:captured.initiativeId})+'\n',{flag:'wx'})}
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(key.toUpperCase())))
 const app=await electron.launch({executablePath:require('electron'),args:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata')},timeout:30000})
 const owned={app,child:app.process(),closeObserved:false};active=owned;app.once('close',()=>owned.closeObserved=true)
 const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData'),executable:process.execPath}))
 owned.main=await windowsOwnedProcesses.read(runtime.pid);assert.ok(owned.main);assert.equal(runtime.path,profile);assert.equal(resolve(runtime.executable).toLowerCase(),resolve(require('electron')).toLowerCase())
 owned.observationPath=join(output,'observation.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt;report.main=owned.main
 const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessBmadProgress)
 const region=page.getByRole('region',{name:'Reprise du projet',exact:true});await region.waitFor()
 await page.evaluate(()=>window.madnessBmadContext.read())
 await app.evaluate(({BrowserWindow},{channel,projection})=>BrowserWindow.getAllWindows()[0].webContents.send(channel,{contractVersion:1,sequence:100,projects:[{projectId:projection.projectId,generation:1,status:'stale',snapshot:projection,errorCode:null,error:null}]}),{channel:BMAD_PROGRESS_EVENT_CHANNEL,projection})
 await region.getByText(/Dernière observation.*beta.*Observation ancienne/).waitFor();report.checks.push('actual-native-projection-explicitly-historical')
 report.captures=[]
 for(const [name,width,height,theme,zoom,isLong,openDetail] of [['large-dark',1440,920,'dark',1,false,false],['compact-light',720,820,'light',1,false,false],['zoom-200',1440,920,'dark',2,false,false],['long-list',1440,920,'light',1,true,false],['long-detail',1440,920,'dark',1,true,true]]){
  const currentTheme=await page.evaluate(()=>document.documentElement.dataset.theme)
  if(currentTheme!==theme)await page.getByRole('button',{name:theme==='light'?'Passer au thème clair':'Passer au thème sombre',exact:true}).click()
  await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme)
  const appearance=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,body:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(document.documentElement).backgroundColor,workspace:getComputedStyle(document.querySelector('.workspace')).backgroundColor,surface:getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()}))
  assert.equal(appearance.theme,theme);assert.equal(appearance.workspace,theme==='light'?'rgb(246, 240, 228)':'rgb(33, 31, 30)')
  const restoration=await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0],state=()=>({minimized:w.isMinimized(),visible:w.isVisible(),maximized:w.isMaximized(),contentSize:w.getContentSize(),zoom:w.webContents.getZoomFactor()});const before=state();if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1);return {before,after:state()}})
  assert.equal(restoration.after.minimized,false);assert.equal(restoration.after.visible,true)
  const viewportAt100=await setWorkspaceViewport(app,page,{width,height})
  if(isLong&&await page.evaluate(async()=>{const value=await window.madness.readState();return value.value.state.activeProjectId})!==longId){
   await page.locator('.sidebar').getByRole('button',{name:'Ouvrir le projet Vue synthétique — liste longue',exact:true}).click()
   await app.evaluate(({BrowserWindow},{channel,projection})=>BrowserWindow.getAllWindows()[0].webContents.send(channel,{contractVersion:1,sequence:200,projects:[{projectId:projection.projectId,generation:1,status:'stale',snapshot:projection,errorCode:null,error:null}]}),{channel:BMAD_PROGRESS_EVENT_CHANNEL,projection:longProjection})
   await region.getByText(/Dernière observation.*beta.*Observation ancienne/).waitFor()
  }
  await app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom)
  await page.waitForFunction(({width,height,zoom})=>innerWidth===width/zoom&&innerHeight===height/zoom,{width,height,zoom});await page.evaluate(()=>document.fonts.ready)
  await region.locator('h2').evaluate(element=>element.scrollIntoView({block:'start'}))
  const access=region.getByRole('navigation',{name:'Accès aux informations de reprise',exact:true});assert.equal(await access.getByRole('button').count(),4)
  if(openDetail){await region.locator('.resume-states > summary').focus();await page.keyboard.press('Enter');const detail=region.locator('.resume-ticket .resume-proof > summary').first();await detail.focus();await page.keyboard.press('Enter');await detail.evaluate(element=>element.scrollIntoView({block:'start'}))}
  else assert.equal(await region.locator('.resume-states').evaluate(element=>element.open),false)
  await page.mouse.move(0,0);await page.evaluate(()=>{const active=document.activeElement;if(active===document.querySelector('.theme-toggle')&&active instanceof HTMLElement)active.blur()})
  await page.waitForFunction(()=>{const tooltip=document.querySelector('.theme-toggle .command-tooltip');if(!tooltip)return true;const style=getComputedStyle(tooltip);return style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0})
  const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,devicePixelRatio,compact:matchMedia('(max-width:720px)').matches,docked:matchMedia('(min-width:1323px)').matches}))
  assert.equal(viewport.compact,width/zoom<=720);assert.equal(viewport.docked,width/zoom>=1323)
  const nativeAtCapture=await app.evaluate(({BrowserWindow,screen})=>{const w=BrowserWindow.getAllWindows()[0];return {minimized:w.isMinimized(),visible:w.isVisible(),contentSize:w.getContentSize(),zoom:w.webContents.getZoomFactor(),scaleFactor:screen.getDisplayMatching(w.getBounds()).scaleFactor}})
  assert.equal(nativeAtCapture.minimized,false);assert.equal(nativeAtCapture.visible,true)
  const captured=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'))
  const png=Buffer.from(captured,'base64'),pixelWidth=png.readUInt32BE(16),pixelHeight=png.readUInt32BE(20),expected=nativeAtCapture.contentSize.map(size=>Math.round(size*nativeAtCapture.scaleFactor))
  assert.equal(pixelWidth,expected[0]);assert.equal(pixelHeight,expected[1]);const file=join(output,'resume-'+name+'-native.png');await writeFile(file,png,{flag:'wx'})
  report.captures.push({file,fixture:isLong?'explicit-synthetic-owned-long-list':'historical-native-Main004-projection',detailOpen:openDetail,pixels:{width:pixelWidth,height:pixelHeight},sha256:sha(png),expectedFullNativePixels:{width:expected[0],height:expected[1]},method:'BrowserWindow.webContents.capturePage() without rect',appearance,restoration,viewportAt100,viewport,nativeAtCapture,groups:await access.getByRole('button').allTextContents()})
  report.checks.push('native-'+name+'-full-content-frame-and-theme-attested')
 }
 const noHelpers=async()=>{try{return await readdir(join(profile,'bmad-help-runs-v1'))}catch(error){if(error.code==='ENOENT')return [];throw error}}
 assert.deepEqual(await noHelpers(),[]);report.checks.push('no-helper-operation-or-runtime-created')
 const state=await page.evaluate(()=>window.madness.readState());assert.equal(state.ok,true);assert.deepEqual(state.value.state.conversations,snapshot.conversations);assert.deepEqual(state.value.state.drafts,snapshot.drafts)
 closure=await closeWorkspaceSession(active);active=null;assert.equal(closure.cleanupSafe,true);assert.equal(closure.closeError,false);assert.equal(closure.observation.network,0);assert.equal(closure.observation.appServerAttempts,0);assert.deepEqual(await noHelpers(),[]);report.checks.push('owned-main-closed-without-network-or-provider')
 report.status='passed'
}catch(error){report.error=String(error.stack??error);throw error}
finally{
 if(active)try{closure=await closeWorkspaceSession(active)}catch(error){report.closeError=String(error)}
 report.closure=closure
 if(closure?.cleanupSafe){const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^mprogress-visual-[A-Za-z0-9]+$/);await rm(actual,{recursive:true,force:true});report.cleanup=true}
 report.completedAt=new Date().toISOString();await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n')
}
