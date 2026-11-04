// Real compiled Main/preload and owned synthetic profile. Native profile qualification is local.
// Successful turns/questions/permissions are separately covered by explicit synthetic core/RPC tests.
import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,readFile,writeFile,copyFile,realpath,rm} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
import {emptySnapshot,isSnapshot} from '../../src/contracts/index.ts'
import {FORGE_MANIFEST} from '../../src/adapters/bmad/forge-manifest.ts'
import {PROFILE_FILES} from '../../src/adapters/bmad/profile.ts'
import {isCatalogLaunchState,isCatalogPreparation} from '../../src/contracts/bmad-catalog-launch.ts'
import {BmadCatalogLaunchStore} from '../../src/adapters/persistence/bmad-catalog-launch-store.ts'
import {OwnedRun,windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {RecoveryStore} from '../../src/adapters/persistence/recovery-store.ts'
import {HelpOwnedRun} from '../../src/adapters/bmad/help-owned-run.ts'
import {catalogFixture} from '../../tests/helpers/catalog-launch-fixture.mjs'
import {installWorkspaceObservationRuntime,closeWorkspaceSession,setWorkspaceViewport} from './workspace-design.mjs'
const repository=process.cwd(),require=createRequire(import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex')
const argument=process.argv.find(v=>v.startsWith('--output='))
assert.ok(argument,'A new owned --output= directory is required')
const output=resolve(argument.slice(9)),executable=process.argv.find(v=>v.startsWith('--executable='))?.slice(13),screenshots=process.argv.includes('--screenshots'),diagnostic=process.argv.includes('--diagnostic-help'),singleMary=process.argv.includes('--single-mary')
assert.ok(!(diagnostic&&singleMary),'--single-mary and --diagnostic-help are separate bounded scenarios')
await mkdir(dirname(output),{recursive:true});await mkdir(output,{recursive:false})
const root=await realpath(await mkdtemp(join(tmpdir(),'mcatalog-launch-'))),profile=join(root,'profile'),projectRoot=join(root,'project')
const report={schemaVersion:1,startedAt:new Date().toISOString(),status:'partial',root,output,mode:singleMary?'single-mary':diagnostic?'diagnostic-help':'all-profiles',directProfiles:singleMary?[]:diagnostic?['bmad']:['bmad-forge-idea','bmad'],viewports:[],qualificationOwnership:[],helpOwnership:[],checks:[],preparations:[],captures:[],launches:[],closures:[],cleanup:false,limits:['No personal profile/account, external provider, model response or installation. Native Windows profile qualification only.','Restored origins are explicitly synthetic port fixtures. They are historical and grant no preparation or execution.','Successful catalogue ACKs, questions, permissions and effects are covered by the source core/RPC/UI tests; this no-account bench cannot claim a native successful turn.','Network/app-server counters cover only activity after the observation hook. No WCAG or human visual acceptance.']}
if(singleMary)report.limits.push('Direct Forge/help preparations are intentionally not run in Mary-only mode; no native qualification or success is claimed for them.')
let active=null,cleanupSafe=true,qualificationRequired=false
const pass=name=>{report.checks.push(name);console.log(name)}
async function put(path,text){await mkdir(dirname(path),{recursive:true});await writeFile(path,text)}
async function normaliseViewport(page,label,{width=1440,height=920,theme='dark',zoom=1}={}){
 await active.app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)})
 const viewport=await setWorkspaceViewport(active.app,page,{width,height})
 if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:theme==='light'?'Passer au thème clair':'Passer au thème sombre',exact:true}).click()
 await active.app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom)
 await page.waitForFunction(({width,height,theme,zoom})=>Math.abs(innerWidth-width/zoom)<=1&&Math.abs(innerHeight-height/zoom)<=1&&document.documentElement.dataset.theme===theme,{width,height,theme,zoom})
 report.viewports.push({label,requested:{width,height,theme,zoom},viewport})
}
async function qualificationObservation(stage){
 const path=join(profile,'bmad-qualification-owned-v1.json');let record=null
 try{record=JSON.parse(await readFile(path,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 const status=await new OwnedRun(new RecoveryStore(path)).status(),present=record!==null
 if(present)qualificationRequired=true
 const observation={stage,path,present,record,status,evidence:present?'durable-record':'initial-no-record',durableStop:present&&record.status==='stopped'&&status==='stopped'}
 report.qualificationOwnership.push(observation);return observation
}
async function qualificationStopped(stage){
 if(!singleMary)return
 if(stage==='after-mary-qualification')qualificationRequired=true
 const observation=await qualificationObservation(stage)
 if(!observation.present){assert.equal(qualificationRequired,false,'MARY_QUALIFICATION_OWNER_MISSING_AFTER_CREATION: '+stage);return}
 qualificationRequired=true
 assert.equal(observation.record.status,'stopped','MARY_QUALIFICATION_OWNER_NOT_STOPPED: '+stage)
 assert.equal(observation.status,'stopped','MARY_QUALIFICATION_RECOVERY_NOT_STOPPED: '+stage)
 assert.notEqual(observation.path,join(profile,'bmad-help-owned-v1.json'),'QUALIFICATION_AND_HELP_OWNERS_MUST_BE_DISTINCT')
}
async function launch(){
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(k.toUpperCase())))
 const app=await electron.launch({executablePath:executable??require('electron'),args:executable?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata')},timeout:30000})
 const owned={app,child:app.process(),closeObserved:false};active=owned;app.once('close',()=>owned.closeObserved=true)
 const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData'),executable:process.execPath,versions:process.versions}));owned.main=await windowsOwnedProcesses.read(runtime.pid);assert.ok(owned.main);assert.equal(runtime.path,profile)
 owned.observationPath=join(output,'observation-'+(report.launches.length+1)+'.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt;report.launches.push({runtime,main:owned.main,observationPath:owned.observationPath})
 const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessCatalogLaunch&&!!window.madnessBmadCatalog);return page
}
async function stop(){
 if(!active)return
 const owned=active,receipt=await closeWorkspaceSession(owned);report.closures.push(receipt);assert.equal(receipt.cleanupSafe,true,'OWNED_MAIN_CLOSE_UNCONFIRMED')
 const helpPath=join(profile,'bmad-help-owned-v1.json'),helpStatus=await new HelpOwnedRun(helpPath).status();report.helpOwnership.push({stage:'after-close-'+report.closures.length,path:helpPath,status:helpStatus});assert.equal(helpStatus,'stopped')
 await qualificationStopped('after-close-'+report.closures.length)
 active=null;assert.equal(receipt.closeError,false,'PLAYWRIGHT_CLOSE_FAILED')
}
async function noProvider(){
 const o=await active.app.evaluate(()=>globalThis.__workspaceObservation.read());assert.equal(o.complete,true);assert.equal(o.network,0);assert.equal(o.appServerAttempts,0);assert.equal(o.appServers,0)
}
async function collect(page){await page.evaluate(()=>window.madnessBmadCatalog.collect('id-1'));const c=await page.evaluate(()=>window.madnessBmadCatalog.read()),p=c.projects.find(p=>p.projectId==='id-1');assert.equal(p.status,'ready');assert.equal(p.freshness,'current');return p}
async function capture(page,name){
 if(!screenshots)return
 await page.evaluate(async()=>{await document.fonts.ready})
 const measure=()=>({innerWidth,innerHeight,devicePixelRatio,theme:document.documentElement.dataset.theme})
 const before=await page.evaluate(measure)
 const native=await active.app.evaluate(async({BrowserWindow})=>{
  const w=BrowserWindow.getAllWindows()[0],wc=w.webContents,before={contentBounds:w.getContentBounds(),zoom:wc.getZoomFactor()},image=await wc.capturePage(),scaleFactors=image.getScaleFactors(),selectedScale=Math.max(...scaleFactors)
  if(!Number.isFinite(selectedScale)||selectedScale<=0)throw Error('NATIVE_CAPTURE_SCALE_UNAVAILABLE')
  // Keep representation tags raw; they are not physical density. Never resize/crop.
  const png=image.toPNG({scaleFactor:selectedScale})
  return {png:png.toString('base64'),scaleFactors,selectedScale,before,after:{contentBounds:w.getContentBounds(),zoom:wc.getZoomFactor()}}
 })
 const after=await page.evaluate(measure),png=Buffer.from(native.png,'base64')
 assert.ok(png.length>=33,'PNG_IHDR_MISSING')
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG_SIGNATURE_INVALID')
 assert.equal(png.readUInt32BE(8),13,'PNG_IHDR_LENGTH_INVALID');assert.equal(png.subarray(12,16).toString('ascii'),'IHDR','PNG_IHDR_NOT_FIRST')
 const ihdr={width:png.readUInt32BE(16),height:png.readUInt32BE(20)},zoom=native.before.zoom,dpr=before.devicePixelRatio
 // innerWidth/Height are integer CSS pixels: allow one CSS pixel of rounding,
 // expressed in native DIPs and raster pixels, plus native pixel rounding.
 const tolerance={contentDips:Math.max(1,zoom),pngPixels:Math.max(1,Math.ceil(dpr))}
 const coherence={tolerance,contentWidthDelta:Math.abs(native.before.contentBounds.width-before.innerWidth*zoom),contentHeightDelta:Math.abs(native.before.contentBounds.height-before.innerHeight*zoom),pngWidthDelta:Math.abs(ihdr.width-before.innerWidth*dpr),pngHeightDelta:Math.abs(ihdr.height-before.innerHeight*dpr)}
 const entry={name,method:'native capturePage() without rectangle, crop or image resize; existing native PNG representation',pngIHDR:ihdr,contentBounds:native.before.contentBounds,innerWidth:before.innerWidth,innerHeight:before.innerHeight,devicePixelRatio:dpr,zoom,theme:before.theme,scaleFactors:native.scaleFactors,selectedScale:native.selectedScale,before,after,nativeAfter:native.after,coherence}
 report.captures.push(entry);await writeFile(join(output,name+'.png'),png,{flag:'wx'})
 assert.deepEqual(after,before,'CAPTURE_VIEWPORT_CHANGED')
 assert.equal(native.after.zoom,zoom,'CAPTURE_ZOOM_CHANGED')
 assert.equal(native.after.contentBounds.width,native.before.contentBounds.width,'CAPTURE_CONTENT_WIDTH_CHANGED');assert.equal(native.after.contentBounds.height,native.before.contentBounds.height,'CAPTURE_CONTENT_HEIGHT_CHANGED')
 assert.ok(ihdr.width>0&&ihdr.height>0&&Number.isFinite(dpr)&&dpr>0&&Number.isFinite(zoom)&&zoom>0,'CAPTURE_DIMENSIONS_INVALID')
 assert.ok(coherence.contentWidthDelta<=tolerance.contentDips&&coherence.contentHeightDelta<=tolerance.contentDips,'NATIVE_CONTENT_AND_CSS_VIEWPORT_DISAGREE: '+JSON.stringify(entry))
 assert.ok(coherence.pngWidthDelta<=tolerance.pngPixels&&coherence.pngHeightDelta<=tolerance.pngPixels,'NATIVE_PNG_AND_VIEWPORT_DISAGREE: '+JSON.stringify(entry))
 if(report.captures.length===1){assert.equal(zoom,1);assert.equal(before.theme,'dark');assert.ok(Math.abs(before.innerWidth-1440)<=1&&Math.abs(before.innerHeight-920)<=1,'FIRST_CAPTURE_MUST_BE_NORMALISED_1440_920')}
}
try{
 report.producer={};for(const name of ['out/main/index.js','out/preload/index.js','package.json','package-lock.json','src/contracts/bmad-catalog-launch.ts','src/core/bmad-catalog-launch.ts','scripts/qualification/catalog-launch.mjs'])report.producer[name]=sha(await readFile(name))
 if(executable)report.candidate={executable:resolve(executable),asarSha256:sha(await readFile(join(dirname(executable),'resources/app.asar')))}
 for(const path of new Set([...Object.keys(FORGE_MANIFEST),...PROFILE_FILES,'.agents/skills/bmad/references/help.md',...['bmod-core-tools','bmod-method','bmod-toolsmith'].map(m=>'.agents/skills/'+m+'/help/help.md')])){
  await mkdir(dirname(join(projectRoot,path)),{recursive:true});await copyFile(join(repository,path),join(projectRoot,path))
 }
 await put(join(projectRoot,'_bmad/config.toml'),'[core]\nproject_name="catalogue-synthetic"\noutput_folder="{project-root}/_bmad-output"\n')
 await mkdir(join(projectRoot,'_bmad-output'),{recursive:true});await mkdir(profile)
 const fixture=await catalogFixture();let historical;try{await fixture.prepare();await fixture.send();historical=fixture.launch.read().records[0]}finally{await fixture.shutdown()}
 const state=emptySnapshot();state.projects=[{id:'id-1',name:'Projet synthétique de lancement catalogue',rootPath:projectRoot,openedAt:new Date().toISOString()}];state.activeProjectId='id-1';state.drafts=[{projectId:'id-1',text:'Brouillon libre synthétique exact 🧭',savedAt:new Date().toISOString()}];state.conversations=[{id:historical.conversationId,context:historical.context,lastKnownActivity:'idle',messages:[{id:'old-synthetic',role:'assistant',text:'Historical synthetic origin, never native acceptance.'}]}];assert.ok(isSnapshot(state))
 await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify(state));const store=new BmadCatalogLaunchStore(join(profile,'catalog-launch-v1'));await store.write(historical)
 let page=await launch();const restored=await page.evaluate(()=>window.madnessCatalogLaunch.read());assert.ok(isCatalogLaunchState(restored));assert.equal(restored.preparation,null);assert.equal(restored.records[0].transmission,'sent');assert.deepEqual((await page.evaluate(()=>window.madnessBmadCatalog.read())).projects,[]);await noProvider();pass('K7 passive origin restore without qualification or collection')
 let catalogue=await collect(page);pass('K2 actual installed winning sources captured')
 await page.getByRole('button',{name:'Ouvrir le projet '+state.projects[0].name,exact:true}).click();await page.getByRole('tab',{name:'Toutes les possibilités',exact:true}).click()
 for(const name of (singleMary?[]:diagnostic?['bmad']:['bmad-forge-idea','bmad'])){
  // collect again is voluntary; it is not a provider operation or a launch.
  catalogue=await collect(page)
  const result=await page.evaluate(({name,revision})=>window.madnessCatalogLaunch.prepare('id-1',name,revision),{name,revision:catalogue.snapshot.revision});report.preparations.push({name,state:result});console.log('Local preparation '+name+': '+result.status);await writeFile(join(output,'progress.json'),JSON.stringify(report,null,2))
  assert.equal(result.status,'prepared',name+': '+result.error);assert.ok(isCatalogPreparation(result.preparation));assert.equal(result.preparation.itemId,name);await noProvider();if(!diagnostic)await page.evaluate(id=>window.madnessCatalogLaunch.cancel(id),result.preparation.id)
 }
 if(!singleMary)pass(diagnostic?'K1 help native profile prepares locally without provider':'K1 Forge and help native profiles prepare locally without provider')
 if(diagnostic){
 const target=report.preparations.at(-1).state.preparation
 await put(join(projectRoot,'_bmad/config.toml'),'[core]\nproject_name="diagnostic-mutation"\noutput_folder="{project-root}/_bmad-output"\n')
 await page.evaluate(id=>window.madnessDialogue.launchCatalog('id-1',id),target.id)
 const deadline=Date.now()+240000;let terminal
 do{terminal=await page.evaluate(()=>window.madnessDialogue.read());if(['error','unknown','stopped'].includes(terminal.status))break;await new Promise(r=>setTimeout(r,50))}while(Date.now()<deadline)
 report.refusal=terminal;assert.equal(terminal.errorCode,'PROFILE_CHANGED');await noProvider();pass('K3 diagnostic help mutation refused before provider')
 }else{
 // Normalise before opening the first captured modal; theme controls stay reachable.
 await normaliseViewport(page,'initial-dark')
 // Exercise the actual UI entry and cancellation using its exact catalogue observation.
 await page.getByRole('button',{name:'Fiche compétence bmad-agent-analyst',exact:true}).click();await capture(page,'qualified-fiche-dark');await page.getByRole('button',{name:'Préparer le lancement',exact:true}).click();await page.locator('#catalog-launch-heading').waitFor({timeout:240000});assert.equal(await page.locator('#draft').inputValue(),state.drafts[0].text)
 await qualificationStopped('after-mary-qualification');await normaliseViewport(page,'prepared-dark');await capture(page,'prepared-dark')
 if(screenshots){for(const [width,height,theme,zoom,name] of [[720,820,'light',1,'prepared-compact-light'],[1440,920,'dark',2,'prepared-zoom200-dark']]){await normaliseViewport(page,name,{width,height,theme,zoom});await page.locator('#catalog-launch-heading').scrollIntoViewIfNeeded();await capture(page,name)}await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1))}
 const p=await page.evaluate(()=>window.madnessCatalogLaunch.read());assert.equal(p.status,'prepared');report.preparations.push({name:'bmad-agent-analyst',state:p});await noProvider();pass('K1 K4 actual UI Mary preparation retains free draft without provider');
 await put(join(projectRoot,'_bmad/config.toml'),'[core]\nproject_name="changed-after-prepare"\noutput_folder="{project-root}/_bmad-output"\n')
 await page.evaluate(id=>window.madnessDialogue.launchCatalog('id-1',id),p.preparation.id)
 const deadline=Date.now()+240000;let final
 do{final=await page.evaluate(()=>window.madnessDialogue.read());if(['error','unknown','stopped'].includes(final.status))break;await new Promise(r=>setTimeout(r,50))}while(Date.now()<deadline)
 report.refusal=final;assert.equal(final.errorCode,'PROFILE_CHANGED');await noProvider();await qualificationStopped('after-mary-refusal');pass('K3 changed configuration refused before provider')
 await page.getByRole('button',{name:'Annuler le lancement',exact:true}).click();await page.getByRole('dialog',{name:'bmad-agent-analyst',exact:true}).waitFor();await page.keyboard.press('Escape');pass('K7 actual UI cancellation returns exact fiche after refusal')
 }
 const saved=JSON.parse(await readFile(join(profile,'madness-state-v1.json'),'utf8'));assert.deepEqual(saved.drafts,state.drafts);assert.deepEqual(saved.conversations,state.conversations);await stop()
 page=await launch();const reopened=await page.evaluate(()=>window.madnessCatalogLaunch.read());assert.equal(reopened.preparation,null);assert.deepEqual(reopened.records,restored.records);assert.deepEqual((await page.evaluate(()=>window.madnessBmadCatalog.read())).projects,[]);await noProvider();await qualificationStopped('after-passive-reopen');await stop();pass('K7 exact passive reopen with owned closure and draft/history preservation')
 report.status='passed'
}catch(error){
 report.error=String(error.stack??error)
 if(active)try{const page=await active.app.firstWindow();report.failureStates=await page.evaluate(async()=>({catalog:await window.madnessBmadCatalog.read(),help:await window.madnessHelp.read(),contexts:await window.madnessBmadContext.read(),launch:await window.madnessCatalogLaunch.read(),dialogue:await window.madnessDialogue.read()}));const owner=JSON.parse(await readFile(join(profile,'bmad-help-owned-v1.json'),'utf8'));report.failureOwnership={owner};for(const name of ['request.json','execution.json','terminal.json'])try{report.failureOwnership[name]=JSON.parse(await readFile(join(owner.folder,name),'utf8'))}catch{}}catch(diagnosticError){report.diagnosticError=String(diagnosticError)}
 if(singleMary)try{report.failureQualificationOwnership=await qualificationObservation('failure-before-close')}catch(ownershipError){report.failureQualificationOwnership={path:join(profile,'bmad-qualification-owned-v1.json'),error:String(ownershipError)}}
 throw error
}
finally{if(active)try{await stop()}catch(error){cleanupSafe=false;report.closureError=String(error)}if(report.status==='passed'&&cleanupSafe&&report.closures.length===report.launches.length&&report.closures.every(r=>r.cleanupSafe)){const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^mcatalog-launch-/);await rm(actual,{recursive:true,force:true});report.cleanup=true}report.finishedAt=new Date().toISOString();await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2))}
