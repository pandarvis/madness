// Main/preload compilés exacts ; profil possédé, sans compte ni fournisseur.
import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,readdir,realpath,rm} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {emptySnapshot,isSnapshot} from '../../src/contracts/index.ts'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {HelpOwnedRun} from '../../src/adapters/bmad/help-owned-run.ts'
import {isBmadProgressSnapshot} from '../../src/contracts/bmad-progress.ts'
import {helpResourcePins} from '../../src/adapters/bmad/help-manifest.ts'
import {installWorkspaceObservationRuntime,closeWorkspaceSession,setWorkspaceViewport} from './workspace-design.mjs'
import {readBmadProgressTimings} from './bmad-progress-timings.mjs'
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url))),require=createRequire(import.meta.url)
const output=resolve(process.argv.find(a=>a.startsWith('--output='))?.slice(9)??'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-actualisation/main-001')
const executable=process.argv.find(a=>a.startsWith('--executable='))?.slice(13),screenshots=process.argv.includes('--screenshots')
await mkdir(output,{recursive:true})
// Freeze the actual producer before launching a process; this is not reconstructed after a run.
const producerFiles=['scripts/qualification/bmad-external-refresh.mjs','scripts/qualification/workspace-design.mjs','scripts/qualification/bmad-progress-timings.mjs','src/core/bmad-context.ts','src/core/bmad-progress.ts','src/core/bmad-help.ts','src/core/bmad-observation.ts','src/core/lifecycle.ts','src/adapters/bmad/change-observer.ts','src/adapters/bmad/help.ts','src/adapters/bmad/context.ts','src/adapters/bmad/progress.ts','src/adapters/bmad/help-manifest.ts','src/contracts/bmad-context.ts','src/contracts/bmad-progress.ts','src/contracts/bmad-help.ts','src/main/index.ts','src/preload/index.ts','src/renderer/src/ProjectResume.tsx','src/renderer/src/InitiativeSelector.tsx','src/renderer/src/HelpPanel.tsx','src/renderer/src/strings.ts','src/renderer/src/progress.css','package.json','package-lock.json','out/main/index.js','out/preload/index.js',...Object.keys(helpResourcePins).map(name=>'resources/bmad-help/'+name)]
const capsule={createdAt:new Date().toISOString(),files:{}}
for(const name of producerFiles){const bytes=await readFile(join(repository,name)),target=join(output,'producer',name);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'});capsule.files[name]=createHash('sha256').update(bytes).digest('hex')}
await writeFile(join(output,'producer-manifest.json'),JSON.stringify(capsule,null,2)+'\n',{flag:'wx'})
const root=await realpath(await mkdtemp(join(tmpdir(),'mprogress-main-'))),profile=join(root,'profile'),report={schemaVersion:1,startedAt:new Date().toISOString(),status:'partial',root,launches:[],captures:[],closures:[],checks:[],inputs:{},cleanup:false,limits:['Réseau/app-server observés après hook seulement ; aucune validation fournisseur/humaine déduite. Les événements Windows accélèrent une invalidation sans garantir une couverture totale.','Captures synthétiques seulement si --screenshots ; aucune validation humaine ; symlink fichier non exercée faute de privilège.']}
let active=null,cleanupSafe=true
const sha=b=>createHash('sha256').update(b).digest('hex'),pass=name=>{report.checks.push(name);console.log(name)}
try{
 await mkdir(profile)
 for(const file of ['out/main/index.js','out/preload/index.js','package.json'])report.inputs[file]=sha(await readFile(join(repository,file)))
 for(const [name,pin] of Object.entries(helpResourcePins)){assert.equal(sha(await readFile(join(repository,'resources/bmad-help',name))),pin);report.inputs['resources/bmad-help/'+name]=pin}
 const snapshot=emptySnapshot(),protectedFiles=[]
 for(const id of ['project-a','project-b']){
  const project=join(root,id),now=new Date().toISOString()
  await mkdir(join(project,'_bmad'),{recursive:true});await mkdir(join(project,'.agents/skills/bmod-test'),{recursive:true})
  await writeFile(join(project,'.agents/skills/bmod-test/bmod.toml'),'[bmod]\ncode="test"\nversion="6.13.0-next"\nskills=[]\n')
  await writeFile(join(project,'_bmad/config.toml'),'[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="alpha"\n')
  for(const name of ['alpha','beta']){await mkdir(join(project,'_bmad-output',name),{recursive:true});await writeFile(join(project,'_bmad-output',name,name+'.md'),'# '+name+'\n')}
  const leaves=join(project,'_bmad-output/beta/tickets/epic-a/tickets');await mkdir(leaves,{recursive:true})
  await writeFile(join(leaves,'tickets.toml'),'[[entry]]\nid=1\ntype="story"\ntitle="Entrée sans feuille"\n[[entry]]\nid=2\ntype="story"\ntitle="Déclarations opposées"\n')
  await writeFile(join(leaves,'story-opposition.md'),'---\ntype: story\nid: 2\ntitle: Déclarations opposées\nstatus: in-progress\ntracker_status: done\n---\n\n## Résultats\nRésultat déclaré dans la feuille, à vérifier.\n\n## Travail restant\nProposition conservée : examiner les preuves.\n')
  await writeFile(join(leaves,'story-opposition-plan.md'),'---\ntype: feature\nticket: 2\nstatus: built\n---\n\n## Décisions\nProposition de l’agent : une décision humaine reste inconnue.\n')
  protectedFiles.push(join(leaves,'tickets.toml'),join(leaves,'story-opposition.md'),join(leaves,'story-opposition-plan.md'))
  snapshot.drafts.push({projectId:id,text:'Brouillon synthétique exact 🧭 '+id,savedAt:now})
  snapshot.projects.push({id,name:id,rootPath:project,openedAt:now})
  const conversationId='historical-'+id
  snapshot.conversations.push({id:conversationId,context:{projectId:id,initiativeId:'alpha',conversationId,providerId:'codex',connectionId:'historical-account'},lastKnownActivity:'idle',messages:[{id:'old-message',role:'assistant',text:'Historique inconnu — octets conservés.'}]})
  protectedFiles.push(join(project,'_bmad/config.toml'))
 }
 assert.equal(isSnapshot(snapshot),true)
 const snapshotPath=join(profile,'madness-state-v1.json');await writeFile(snapshotPath,JSON.stringify(snapshot,null,2)+'\n');protectedFiles.push(snapshotPath)
 const before=new Map(await Promise.all(protectedFiles.map(async p=>[p,await readFile(p)])))
 async function launch(){
  const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(k.toUpperCase())))
  const app=await electron.launch({executablePath:executable??require('electron'),args:executable?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata')},timeout:30000})
  const owned={app,child:app.process(),closeObserved:false};active=owned;app.once('close',()=>owned.closeObserved=true)
  const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData'),executable:process.execPath}))
  owned.main=await windowsOwnedProcesses.read(runtime.pid);assert.ok(owned.main);assert.equal(runtime.path,profile);assert.equal(resolve(owned.main.executable).toLowerCase(),resolve(executable??require('electron')).toLowerCase())
  owned.observationPath=join(output,'observation-'+(report.launches.length+1)+'.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt
  report.launches.push({main:owned.main,profile,observationPath:owned.observationPath})
  const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessBmadProgress)
  return page
 }
 async function stop(){
  assert.equal(await new HelpOwnedRun(join(profile,'bmad-help-owned-v1.json')).status(),'stopped')
  const receipt=await closeWorkspaceSession(active);report.closures.push(receipt);cleanupSafe=cleanupSafe&&receipt.cleanupSafe;assert.equal(receipt.cleanupSafe,true);assert.equal(receipt.closeError,false);assert.equal(receipt.observation.network,0);active=null
 }
 let page=await launch()
 const concurrent=await page.evaluate(()=>Promise.all(['project-a','project-b'].map(id=>window.madnessBmadContext.observe(id))))
 pass('two-concurrent-project-observations-share-the-owned-helper')
 for(const [id,name] of [['project-a','beta'],['project-b','beta']]){
  const observed=concurrent[id==='project-a'?0:1],p=observed.projects.find(p=>p.projectId===id)
  assert.equal(p.status,'ready',JSON.stringify(p));assert.equal(p.selection,null)
  const chosen=await page.evaluate(({id,name,revision})=>window.madnessBmadContext.choose(id,name,revision),{id,name,revision:p.observation.revision})
  assert.equal(chosen.projects.find(p=>p.projectId===id).status,'ready',JSON.stringify(chosen.projects.find(p=>p.projectId===id)));assert.equal(chosen.projects.find(p=>p.projectId===id).selection?.initiativeId,name);assert.equal(chosen.projects.find(p=>p.projectId===id).storage,'stored');pass('compiled-choose-'+id+'-'+name)
 }
 for(const id of ['project-a','project-b']){
  const state=await page.evaluate(id=>window.madnessBmadProgress.collect(id),id),value=state.projects.find(p=>p.projectId===id)
  assert.equal(value.status,'ready',JSON.stringify(value));assert.equal(value.snapshot.initiativeId,'beta');assert.equal(isBmadProgressSnapshot(value.snapshot),true)
  assert.deepEqual(value.snapshot.declarations.filter(d=>d.ticketId==='2'&&d.field!=='existence').map(d=>d.value).sort(),['built','done','in-progress'])
  assert.ok(value.snapshot.declarations.some(d=>d.ticketId==='1'&&d.value==='entry'));assert.ok(value.snapshot.excerpts.some(e=>e.category==='remaining'));pass('compiled-local-progress-'+id+'-beta')
  report['snapshot-'+id]=value.snapshot
 }
 assert.deepEqual(await readFile(snapshotPath),before.get(snapshotPath));pass('reading-proofs-does-not-write-navigation-history-or-drafts')
 await page.locator('.project-row').first().click();const resume=page.getByRole('region',{name:'Reprise du projet',exact:true});await resume.waitFor()
 await resume.getByText('Déclarations contradictoires — chaque source est conservée séparément.',{exact:true}).waitFor({state:'attached'})
 assert.equal(await resume.locator('.resume-states').evaluate(element=>element.open),false)
 const postNavigation=await readFile(snapshotPath);report.snapshotAfterNavigationSha256=sha(postNavigation)
 await writeFile(join(output,'snapshot-after-navigation.json'),postNavigation,{flag:'wx'})
 if(screenshots)try{
  for(const [name,width,height,theme,zoom] of [['large-dark',1440,920,'dark',1],['compact-light',720,820,'light',1],['zoom-200',1440,920,'dark',2]]){
   if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.getByRole('button',{name:theme==='light'?'Passer au thème clair':'Passer au thème sombre',exact:true}).click()
   await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme)
   const appearance=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,workspace:getComputedStyle(document.querySelector('.workspace')).backgroundColor}))
   assert.equal(appearance.theme,theme);assert.equal(appearance.workspace,theme==='light'?'rgb(246, 240, 228)':'rgb(33, 31, 30)')
   await page.mouse.move(0,0);await page.evaluate(()=>{const active=document.activeElement;if(active instanceof HTMLButtonElement&&active.getAttribute('aria-label')?.startsWith('Passer au thème'))active.blur()})
   const restoration=await active.app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0],state=()=>({minimized:w.isMinimized(),visible:w.isVisible(),maximized:w.isMaximized(),contentSize:w.getContentSize(),zoom:w.webContents.getZoomFactor()});const before=state();if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1);return {before,after:state()}})
   assert.equal(restoration.after.minimized,false);assert.equal(restoration.after.visible,true)
   const viewportAt100=await setWorkspaceViewport(active.app,page,{width,height})
   await active.app.evaluate(({BrowserWindow},zoom)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(zoom),zoom)
   await page.waitForFunction(({width,height,zoom})=>Math.abs(innerWidth-width/zoom)<=1&&Math.abs(innerHeight-height/zoom)<=1,{width,height,zoom})
   await page.evaluate(()=>document.fonts.ready);await resume.locator('h2').scrollIntoViewIfNeeded()
   const nativeAtCapture=await active.app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];return {minimized:w.isMinimized(),visible:w.isVisible(),contentSize:w.getContentSize(),zoom:w.webContents.getZoomFactor()}})
   assert.equal(nativeAtCapture.minimized,false);assert.equal(nativeAtCapture.visible,true);assert.ok(nativeAtCapture.contentSize.every(value=>value>0))
   const observedViewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,devicePixelRatio,compact:matchMedia('(max-width: 720px)').matches,docked:matchMedia('(min-width: 1323px)').matches}))
   assert.equal(observedViewport.compact,width/zoom<=720);assert.equal(observedViewport.docked,width/zoom>=1323)
   const captured=await active.app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'))
   const png=Buffer.from(captured,'base64'),pixels={width:png.readUInt32BE(16),height:png.readUInt32BE(20)},scale=observedViewport.devicePixelRatio/zoom
   assert.equal(pixels.width,Math.round(nativeAtCapture.contentSize[0]*scale));assert.equal(pixels.height,Math.round(nativeAtCapture.contentSize[1]*scale))
   const path=join(output,'resume-'+name+'.png');await writeFile(path,png,{flag:'wx'});report.captures.push({path,width,height,theme,zoom,appearance,restoration,viewportAt100,nativeAtCapture,observedViewport,pixels,method:'webContents.capturePage without rect'})
  }
  await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1))
 }catch(error){report.captureError=String(error.stack??error)}
 const helperOperations=async()=>(await readdir(join(profile,'bmad-help-runs-v1'),{withFileTypes:true})).filter(entry=>entry.isDirectory()&&entry.name.startsWith('operation-')).map(entry=>entry.name).sort()
 // Real Windows mutations through the compiled Main/preload. The displayed
 // proofs stay at their original revision while the coordinator refreshes.
 const originalSnapshot=report['snapshot-project-a'],target=join(root,'project-a/_bmad-output/beta/tickets/epic-a/tickets/story-opposition-plan.md'),originalBytes=await readFile(target)
 await page.evaluate(()=>{window.refreshEvents=[];window.refreshOff=window.madnessBmadProgress.onChanged(state=>window.refreshEvents.push(structuredClone(state)))})
 const current=()=>page.evaluate(async()=>(await window.madnessBmadProgress.read()).projects.find(p=>p.projectId==='project-a'))
 const waitCurrent=async(previous)=>{await page.waitForFunction(async revision=>{const p=(await window.madnessBmadProgress.read()).projects.find(p=>p.projectId==='project-a');return p?.status==='ready'&&p.freshness==='current'&&!p.queued&&p.snapshot.revision!==revision},previous,{timeout:180000});return current()}
 // No source changes: a focus reconciliation must not launch another helper.
 const focusBefore=await helperOperations();await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].emit('focus'));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.deepEqual(await helperOperations(),focusBefore);pass('F5-focus-without-change-no-helper-operation')
 await writeFile(target,Buffer.concat([originalBytes,Buffer.from('\n## Results\nExternal revision one.\n')]))
 await page.waitForFunction(async()=>{const p=(await window.madnessBmadProgress.read()).projects.find(p=>p.projectId==='project-a');return p?.freshness!=='current'&&p?.status==='reading'},null,{timeout:10000})
 assert.equal((await current()).snapshot.revision,originalSnapshot.revision);pass('F1-invalidation-immediate-old-snapshot-retained-during-read')
 for(let i=0;i<30;i++)await writeFile(target,Buffer.concat([originalBytes,Buffer.from('\n## Results\nExternal burst '+i+'.\n')]))
 const afterBurst=await waitCurrent(originalSnapshot.revision);assert.ok((await page.evaluate(()=>window.refreshEvents)).some(s=>s.projects.some(p=>p.projectId==='project-a'&&p.queued)));pass('F4-real-burst-dirty-trailing-collected')
 assert.ok((await resume.locator('.resume-observation').textContent()).includes('Observation ancienne'));await resume.getByRole('button',{name:'Afficher la nouvelle observation',exact:true}).click();assert.ok((await resume.locator('.resume-observation+ .small').textContent()).includes(afterBurst.snapshot.revision));pass('F7-compiled-displayed-version-switch-is-voluntary')
 const bytes=await readFile(target),backup=target+'.saved';await import('node:fs/promises').then(fs=>fs.rename(target,backup));await writeFile(target,bytes)
 const afterReplacement=await waitCurrent(afterBurst.snapshot.revision);assert.notEqual(afterReplacement.snapshot.revision,afterBurst.snapshot.revision);pass('F2-same-byte-replacement-has-new-identity-and-revision')
 await rm(target);await rm(backup);const afterDelete=await waitCurrent(afterReplacement.snapshot.revision);assert.ok(!afterDelete.snapshot.sources.some(s=>resolve(s.path).toLowerCase()===resolve(target).toLowerCase()));pass('F2-source-deletion-is-new-observation-without-reassignment')
 // Restore only this fixture's owned file, then observe the resulting revision.
 await writeFile(target,originalBytes);await waitCurrent(afterDelete.snapshot.revision);assert.deepEqual(await readFile(target),originalBytes);pass('F8-owned-fixture-source-restored')
 report.refreshEvents=await page.evaluate(()=>{window.refreshOff();return window.refreshEvents});report.producerManifest='producer-manifest.json'
 const operationsBeforeReopen=await helperOperations();report.helperOperationsBeforeReopen=operationsBeforeReopen
 await stop();pass('real-main-and-helper-closed-before-passive-reopen')
 page=await launch()
 const restored=await page.evaluate(()=>window.madnessBmadContext.read())
 for(const id of ['project-a','project-b'])assert.equal(restored.projects.find(p=>p.projectId===id).selection.initiativeId,'beta')
 const passive=await page.evaluate(()=>window.madnessBmadProgress.read());assert.deepEqual(passive.projects,[]);pass('passive-reopen-no-projection-or-helper')
 const appState=await page.evaluate(()=>window.madness.readState());assert.ok(appState.ok);assert.deepEqual(appState.value.state.conversations,snapshot.conversations);assert.deepEqual(appState.value.state.drafts,snapshot.drafts);pass('captured-alpha-history-and-drafts-never-reassigned')
 assert.deepEqual(await readFile(snapshotPath),postNavigation);pass('post-navigation-snapshot-byte-identical-after-passive-reopen')
 report.snapshotAfterPassiveReopenSha256=sha(await readFile(snapshotPath));report.helperOperationsAfterReopen=await helperOperations();assert.deepEqual(report.helperOperationsAfterReopen,operationsBeforeReopen);pass('passive-reopen-created-no-helper-operation')
 await stop()
 for(const [path,bytes] of before)if(path!==snapshotPath)assert.deepEqual(await readFile(path),bytes)
 pass('project-source-files-and-configurations-byte-identical-after-navigation')
 report.status=report.captureError?'functional-passed-visual-refused':'passed'
}catch(e){report.error=String(e.stack??e);throw e}
finally{
 if(active){try{const receipt=await closeWorkspaceSession(active);report.closures.push(receipt);cleanupSafe=cleanupSafe&&receipt.cleanupSafe}catch{cleanupSafe=false}}
 report.helperTimingReceipts=await readBmadProgressTimings(join(profile,'bmad-help-runs-v1'))
 if(cleanupSafe&&report.closures.length&&report.closures.every(c=>c.cleanupSafe)){const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^mprogress-main-[A-Za-z0-9]+$/);await rm(actual,{recursive:true,force:true});report.cleanup=true}
 report.completedAt=new Date().toISOString();await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n')
}
