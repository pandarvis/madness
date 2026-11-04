// Visual-only replay of actual dated 2.5 Main observations. State transitions are explicit view mocks; no collector.
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
const input=resolve(process.argv.find(a=>a.startsWith('--from='))?.slice(7)??'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-actualisation/main-final')
const output=resolve(process.argv.find(a=>a.startsWith('--output='))?.slice(9)??'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-actualisation/visual-001')
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
await mkdir(output,{recursive:true})
const producerPath=fileURLToPath(import.meta.url),producerBytes=await readFile(producerPath),producer={at:new Date().toISOString(),script:producerPath,sha256:sha(producerBytes),nodeVersions:process.versions,dependencies:{}}
for(const name of ['scripts/qualification/workspace-design.mjs','src/contracts/bmad-progress.ts','src/contracts/bmad-context.ts','src/renderer/src/ProjectResume.tsx','src/renderer/src/progress.css'])producer.dependencies[name]=sha(await readFile(join(repository,name)))
await writeFile(join(output,'producer-script.mjs.txt'),producerBytes,{flag:'wx'});await writeFile(join(output,'producer-manifest.json'),JSON.stringify(producer,null,2)+'\n',{flag:'wx'})
const root=await realpath(await mkdtemp(join(tmpdir(),'mrefresh-visual-'))),profile=join(root,'profile')
const report={schemaVersion:1,startedAt:new Date().toISOString(),status:'partial',root,source:input,checks:[],cleanup:false,limits:['Actual dated native 2.5 Main snapshots are replayed; reading/error/monitor-health states are explicit presentation mocks, not a new filesystem observation.','Selection annexes are synthetic view fixtures derived from the captured identities, not original annex-byte preservation.','No collector/helper/provider requested; network/app-server observations apply after hook only. No human visual approval or full accessibility audit.']}
let active=null,closure=null,launchRequested=false
try{
 const receiptBytes=await readFile(join(input,'verification.json')),receipt=JSON.parse(receiptBytes),baseline=await readFile(join(input,'snapshot-after-navigation.json')),snapshot=JSON.parse(baseline)
 const partialAllowed=process.argv.includes('--partial-source')&&receipt.status==='partial'
 assert.ok(receipt.status==='passed'||partialAllowed,'source status must be passed or explicitly allowed partial with qualified observations')
 if(partialAllowed){for(const check of ['compiled-local-progress-project-a-beta','compiled-local-progress-project-b-beta','F4-real-burst-dirty-trailing-collected','F7-compiled-displayed-version-switch-is-voluntary','F2-same-byte-replacement-has-new-identity-and-revision','F2-source-deletion-is-new-observation-without-reassignment'])assert.ok(receipt.checks.includes(check),check);assert.equal(receipt.cleanup,true);assert.ok(receipt.closures.length>0&&receipt.closures.every(c=>c.cleanupSafe&&!c.closeError));report.limits.push('Source Main-final remains partial: F8 failed in its observer bank. Only the specifically checked native observations are replayed; this visual run does not qualify F8 or promote that source status.')}
 report.sourceQualificationStatus=receipt.status;report.explicitPartialSource=partialAllowed;assert.equal(isSnapshot(snapshot),true);assert.equal(sha(baseline),receipt.snapshotAfterNavigationSha256)
 report.sourceReceiptSha256=sha(receiptBytes);report.sourceBaselineSha256=sha(baseline)
 report.sourceExecutableInputs=receipt.inputs;report.currentExecutableInputs={}
 for(const file of ['out/main/index.js','out/preload/index.js','out/renderer/index.html','package.json'])report.currentExecutableInputs[file]=sha(await readFile(join(repository,file)))
 report.currentRendererInputs={}
 for(const file of await readdir(join(repository,'out/renderer/assets')))report.currentRendererInputs[file]=sha(await readFile(join(repository,'out/renderer/assets',file)))
 report.binaryEquivalenceClaim=false
 const projection=receipt['snapshot-project-a'];const nextProjection=receipt.afterBurst??receipt['snapshot-project-a-after-burst'];assert.equal(isBmadProgressSnapshot(nextProjection),true);assert.notEqual(nextProjection.revision,projection.revision);assert.ok(nextProjection.excerpts.some(e=>e.text.includes('External burst 29.')));report.nextProjection=nextProjection;assert.equal(isBmadProgressSnapshot(projection),true);assert.equal(snapshot.activeProjectId,projection.projectId)
 report.projection={projectId:projection.projectId,initiativeId:projection.initiativeId,revision:projection.revision,contextRevision:projection.contextRevision,observedAt:projection.observedAt}
 const seededBytes=Buffer.from(JSON.stringify(snapshot,null,2)+'\n');report.seededSnapshotSha256=sha(seededBytes)
 await mkdir(join(profile,'bmad-context-v1'),{recursive:true});await writeFile(join(profile,'madness-state-v1.json'),seededBytes,{flag:'wx'})
 for(const project of snapshot.projects){const captured=receipt['snapshot-'+project.id];assert.equal(isBmadProgressSnapshot(captured),true);await writeFile(join(profile,'bmad-context-v1',project.id+'.json'),JSON.stringify({schemaVersion:1,projectId:project.id,rootPath:captured.rootPath,rootIdentity:captured.rootIdentity,revision:1,initiativeId:captured.initiativeId})+'\n',{flag:'wx'})}
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(key.toUpperCase())))
 launchRequested=true
 const app=await electron.launch({executablePath:require('electron'),args:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata')},timeout:30000})
 const owned={app,child:app.process(),closeObserved:false};active=owned;app.once('close',()=>owned.closeObserved=true)
 const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData'),executable:process.execPath,versions:process.versions}))
 owned.main=await windowsOwnedProcesses.read(runtime.pid);assert.ok(owned.main);assert.equal(runtime.path,profile);assert.equal(resolve(runtime.executable).toLowerCase(),resolve(require('electron')).toLowerCase())
 owned.observationPath=join(output,'observation.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt;report.main=owned.main;report.electronRuntime=runtime.versions
 const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessBmadProgress)
 const region=page.getByRole('region',{name:'Reprise du projet',exact:true});await region.waitFor()
 await page.evaluate(()=>window.madnessBmadContext.read())
 await app.evaluate(({BrowserWindow},{channel,projection})=>BrowserWindow.getAllWindows()[0].webContents.send(channel,{contractVersion:1,sequence:100,projects:[{projectId:projection.projectId,generation:1,status:'stale',freshness:'stale',monitoring:'watching',queued:false,snapshot:projection,errorCode:null,error:null}]}),{channel:BMAD_PROGRESS_EVENT_CHANNEL,projection})
 await region.getByText(/Dernière observation.*beta.*Observation ancienne/).waitFor();report.checks.push('dated-native-projection-replayed-without-collector')
 report.captures=[]
 let sequence=100
 for(const [name,width,height,theme,zoom,view] of [['reading-old-dark',1440,920,'dark',1,'reading'],['new-observation-light',1440,920,'light',1,'ready'],['uncertain-error-compact-light',720,820,'light',1,'error'],['new-observation-zoom-200-dark',1440,920,'dark',2,'ready']]){
  const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7);if(only&&name!==only)continue
  const mocked={projectId:projection.projectId,generation:++sequence,status:view,freshness:view==='ready'?'current':view==='error'?'uncertain':'stale',monitoring:view==='error'?'unavailable':'watching',queued:view==='reading',snapshot:view==='reading'?projection:nextProjection,errorCode:view==='error'?'READ_REFUSED':null,error:view==='error'?'Erreur synthétique de qualification : observation précédente conservée.':null}
  await app.evaluate(({BrowserWindow},{channel,sequence,mocked})=>BrowserWindow.getAllWindows()[0].webContents.send(channel,{contractVersion:1,sequence,projects:[mocked]}),{channel:BMAD_PROGRESS_EVENT_CHANNEL,sequence,mocked})
  if(view==='reading')await region.locator('.resume-activity').waitFor()
  else await region.getByRole('button',{name:'Afficher la nouvelle observation',exact:true}).waitFor()
  if(view==='error')await region.locator('.resume-freshness').waitFor()
  const currentTheme=await page.evaluate(()=>document.documentElement.dataset.theme)
  if(currentTheme!==theme)await page.getByRole('button',{name:theme==='light'?'Passer au thème clair':'Passer au thème sombre',exact:true}).click()
  await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme)
  const appearance=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,body:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(document.documentElement).backgroundColor,workspace:getComputedStyle(document.querySelector('.workspace')).backgroundColor,surface:getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()}))
  assert.equal(appearance.theme,theme);assert.equal(appearance.workspace,theme==='light'?'rgb(246, 240, 228)':'rgb(33, 31, 30)')
  const restoration=await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0],state=()=>({minimized:w.isMinimized(),visible:w.isVisible(),maximized:w.isMaximized(),contentSize:w.getContentSize(),zoom:w.webContents.getZoomFactor()});const before=state();if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1);return {before,after:state()}})
  assert.equal(restoration.after.minimized,false);assert.equal(restoration.after.visible,true)
  const viewportAt100=await setWorkspaceViewport(app,page,{width,height})
  await app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom)
  await page.waitForFunction(({width,height,zoom})=>innerWidth===width/zoom&&innerHeight===height/zoom,{width,height,zoom});await page.evaluate(()=>document.fonts.ready)
  await region.locator('h2').evaluate(element=>element.scrollIntoView({block:'start'}))
  const access=region.getByRole('navigation',{name:'Accès aux informations de reprise',exact:true});assert.equal(await access.getByRole('button').count(),4)
  assert.equal(await region.locator('.resume-states').evaluate(element=>element.open),false)
  await page.mouse.move(0,0);await page.evaluate(()=>{const active=document.activeElement;if(active===document.querySelector('.theme-toggle')&&active instanceof HTMLElement)active.blur()})
  await page.locator('.theme-toggle').focus();await page.keyboard.press('Escape');await page.locator('.theme-toggle').evaluate(element=>element.blur())
  await page.waitForFunction(()=>document.querySelector('.app-shell')?.classList.contains('tooltips-dismissed')&&Array.from(document.querySelectorAll('.command-tooltip')).every(element=>getComputedStyle(element).display==='none'))
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
  const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,devicePixelRatio,compact:matchMedia('(max-width:720px)').matches,docked:matchMedia('(min-width:1323px)').matches}))
  assert.equal(viewport.compact,width/zoom<=720);assert.equal(viewport.docked,width/zoom>=1323)
  const nativeAtCapture=await app.evaluate(({BrowserWindow,screen})=>{const w=BrowserWindow.getAllWindows()[0];return {minimized:w.isMinimized(),visible:w.isVisible(),contentSize:w.getContentSize(),zoom:w.webContents.getZoomFactor(),scaleFactor:screen.getDisplayMatching(w.getBounds()).scaleFactor}})
  assert.equal(nativeAtCapture.minimized,false);assert.equal(nativeAtCapture.visible,true)
  const captured=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'))
  const png=Buffer.from(captured,'base64'),pixelWidth=png.readUInt32BE(16),pixelHeight=png.readUInt32BE(20),expected=nativeAtCapture.contentSize.map(size=>Math.round(size*nativeAtCapture.scaleFactor))
  assert.equal(pixelWidth,expected[0]);assert.equal(pixelHeight,expected[1]);const file=join(output,'resume-'+name+'-native.png');await writeFile(file,png,{flag:'wx'})
  report.captures.push({file,fixture:'dated-native-2.5-snapshots-with-explicit-view-state-mock',viewState:mocked,displayedRevision:projection.revision,pixels:{width:pixelWidth,height:pixelHeight},sha256:sha(png),expectedFullNativePixels:{width:expected[0],height:expected[1]},method:'BrowserWindow.webContents.capturePage() without rect',appearance,restoration,viewportAt100,viewport,nativeAtCapture,groups:await access.getByRole('button').allTextContents()})
  report.checks.push('native-'+name+'-full-content-frame-and-theme-attested')
 }
 const noHelpers=async()=>{try{return await readdir(join(profile,'bmad-help-runs-v1'))}catch(error){if(error.code==='ENOENT')return [];throw error}}
 assert.deepEqual(await noHelpers(),[]);report.checks.push('no-helper-operation-or-runtime-created')
 const state=await page.evaluate(()=>window.madness.readState());assert.equal(state.ok,true);assert.deepEqual(state.value.state.conversations,snapshot.conversations);assert.deepEqual(state.value.state.drafts,snapshot.drafts)
 closure=await closeWorkspaceSession(active);active=null;assert.equal(closure.cleanupSafe,true);assert.equal(closure.closeError,false);assert.equal(closure.observation.network,0);assert.equal(closure.observation.appServerAttempts,0);assert.deepEqual(await noHelpers(),[]);report.checks.push('owned-main-closed-without-network-or-provider')
 for(const [name,hash]of Object.entries(producer.dependencies))assert.equal(sha(await readFile(join(repository,name))),hash,'visual source unchanged '+name)
 assert.equal(sha(await readFile(producerPath)),producer.sha256,'visual producer unchanged');report.producerSha256=producer.sha256
 report.status='passed'
}catch(error){report.error=String(error.stack??error);throw error}
finally{
 if(active)try{closure=await closeWorkspaceSession(active)}catch(error){report.closeError=String(error)}
 report.closure=closure
 if(closure?.cleanupSafe||!launchRequested){const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^mrefresh-visual-[A-Za-z0-9]+$/);await rm(actual,{recursive:true,force:true});report.cleanup=true}
 report.completedAt=new Date().toISOString();await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n')
}
