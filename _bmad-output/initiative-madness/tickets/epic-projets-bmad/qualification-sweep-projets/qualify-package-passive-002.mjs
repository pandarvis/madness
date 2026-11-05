import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,realpath,rm,lstat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createHash} from 'node:crypto'
import {QuestionStore} from '../../../../../src/adapters/persistence/question-store.ts'
import {initialDialogueState} from '../../../../../src/contracts/dialogue.ts'
import {windowsOwnedProcesses} from '../../../../../src/adapters/codex/owned-run.ts'
import {installWorkspaceObservationRuntime,closeWorkspaceSession,setWorkspaceViewport} from '../../../../../scripts/qualification/workspace-design.mjs'
const sha=b=>createHash('sha256').update(b).digest('hex'),base=resolve('_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-sweep-projets'),output=join(base,'package-passive-002/attempt-003')
await mkdir(output)
const exe=resolve('dist/sweep-reviewed/win-unpacked/Madness.exe'),asar=resolve('dist/sweep-reviewed/win-unpacked/resources/app.asar'),report={schemaVersion:1,mode:'exact-packaged-passive-and-synthetic-presentation',visualBatch:null,capturesRequested:false,captures:[],checks:[],launches:[],closures:[],cleanup:false,asarSha256:sha(await readFile(asar)),limits:['Synthetic stored conversation and inactive question; session-only dialogue presentation. No business command, model, account or integrated native gate exercised.','Network and child counters apply only after the observation hook.','The12CSSpx qualification inset allows one physical pixel for device-scale rounding; full action containment remains strict. No new capture or detector. Ten b0a images remain evidence of the historical package/source capsule only; no human/WCAG acceptance.']}
let root,active=null,safe=true
const tracked=['madness-state-v1.json','language-v1.json','appearance-v1.json','questions-v1/sweep-question.json']
async function bytes(profile){return Object.fromEntries(await Promise.all(tracked.map(async name=>[name,sha(await readFile(join(profile,name)))])))}
async function start(profile){
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(k.toUpperCase())))
 const app=await electron.launch({executablePath:exe,args:[],cwd:resolve(),env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 active={app,child:app.process(),closeObserved:false};const owned=active;app.once('close',()=>owned.closeObserved=true)
 const info=await app.evaluate(({app})=>({pid:process.pid,profile:app.getPath('userData'),version:app.getVersion(),packaged:app.isPackaged}));assert.equal(info.profile,profile);assert.equal(info.version,'0.2.17');assert.equal(info.packaged,true);owned.main=await windowsOwnedProcesses.read(info.pid);assert.ok(owned.main)
 owned.observationPath=join(output,'observation-'+(report.launches.length+1)+'.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt
 await app.evaluate(({ipcMain})=>{globalThis.__sweepCommands=[];for(const [channel,handler]of ipcMain._invokeHandlers){if(!channel.startsWith('madness:'))continue;ipcMain._invokeHandlers.set(channel,async(event,input)=>{globalThis.__sweepCommands.push({channel,type:input?.type??(input?.theme?'set-theme':input?.language?'set-language':'unknown')});return handler(event,input)})}})
 report.launches.push({info,main:owned.main});const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await page.locator('h1').waitFor();return page
}
async function stop(){
 if(!active)return;const owned=active
 try{
  const commands=await owned.app.evaluate(()=>globalThis.__sweepCommands);for(const c of commands)assert.ok(['read','read-state','select-project','set-theme','set-language'].includes(c.type),JSON.stringify(c));report.checks.push({passiveCommands:commands})
 }finally{
  let receipt;try{receipt=await closeWorkspaceSession(owned)}catch(e){safe=false;throw e}
  safe&&=receipt.cleanupSafe;if(receipt.cleanupSafe)active=null;report.closures.push(receipt)
  assert.equal(receipt.cleanupSafe,true);assert.equal(receipt.observation.network,0);assert.equal(receipt.observation.appServerAttempts,0)
 }
}

try{
 root=await realpath(await mkdtemp(join(tmpdir(),'madness-sweep215-')));const profile=join(root,'profile');await mkdir(profile)
 const now=new Date().toISOString(),project={id:'sweep-project',name:'Projet personnel de qualification de la refonte avec un nom réellement très long sans abréviation',rootPath:join(root,'project'),openedAt:now};await mkdir(project.rootPath)
 const context={projectId:project.id,initiativeId:'initiative-test',conversationId:'sweep-history',providerId:'codex',connectionId:'synthetic'}
 const snapshot={schemaVersion:1,revision:1,projects:[project],activeProjectId:project.id,drafts:[{projectId:project.id,text:'Brouillon exact conservé été 日本語',savedAt:now}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'unknown',messages:[{id:'sweep-message',role:'assistant',text:'Historique témoin conservé, sans identité native reconstituée.'}]}]}
 await writeFile(join(profile,tracked[0]),JSON.stringify(snapshot));await writeFile(join(profile,tracked[1]),JSON.stringify({schemaVersion:1,language:'fr'}));await writeFile(join(profile,tracked[2]),JSON.stringify({schemaVersion:1,theme:'dark'}))
 const question={schemaVersion:1,id:'sweep-question',context,requestId:'sweep-request',turnId:'sweep-turn',identity:{kind:'unknown'},fields:[{id:'answer',header:'Voie',prompt:'Question historique témoin',options:[],allowOther:true}],values:{answer:'Réponse conservée'},status:'inactive',reason:'reopened',createdAt:now,expiresAt:null,revision:1,storage:'stored'};await new QuestionStore(join(profile,'questions-v1')).write(question)
 const questionHash=sha(await readFile(join(profile,tracked[3])))
 let page=await start(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('#draft').waitFor();assert.equal(await page.locator('#draft').inputValue(),snapshot.drafts[0].text)
 await active.app.evaluate(({BrowserWindow},state)=>BrowserWindow.getAllWindows()[0].webContents.send('madness:dialogue:event:v1',state),{...initialDialogueState(),sequence:500,status:'idle',context})
 await active.app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];if(w.isMinimized())w.restore();if(w.isMaximized())w.unmaximize();w.show();w.webContents.setZoomFactor(1)})
 for(const language of ['fr','en'])for(const theme of ['dark','light'])for(const size of [{width:1440,height:920},{width:720,height:820}]){
  await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));await setWorkspaceViewport(active.app,page,size)
  if(await page.evaluate(()=>document.documentElement.lang)!==language){await page.locator('.topbar .language-toggle').click();await page.waitForFunction(language=>document.documentElement.lang===language,language)}
  if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme){await page.locator('.topbar .theme-toggle').click();await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme)}
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.allSettled(document.getAnimations().filter(a=>a.playState==='running'&&Number.isFinite(a.effect?.getTiming().iterations)).map(a=>a.finished))})
  await page.locator('main').evaluate(e=>e.scrollTop=0)
  const geometry=await page.evaluate(()=>{const box=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}},composer=document.querySelector('.composer');return {field:box(document.querySelector('#draft')),action:box(composer.querySelector('button[type=submit]')),messages:box(document.querySelector('.conversation-messages')),composer:box(composer),footer:box(document.querySelector('.status-line')),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,insetToleranceCssPx:1/devicePixelRatio,scroll:document.querySelector('main').scrollTop,fonts:{body:document.fonts.check('450 16px Oxanium'),display:document.fonts.check('700 24px \"Barlow Condensed\"')},horizontal:document.documentElement.scrollWidth>innerWidth+1}})
  assert.ok(geometry.dpr>0&&Number.isFinite(geometry.insetToleranceCssPx));assert.ok(geometry.action.bottom<=geometry.viewport[1],JSON.stringify(geometry));assert.equal(geometry.scroll,0);assert.ok(geometry.field.top>=56&&geometry.action.bottom<=geometry.viewport[1]-12+geometry.insetToleranceCssPx,JSON.stringify(geometry));assert.ok(geometry.field.height>=64&&geometry.action.height>=43.99&&geometry.messages.height>=160);assert.ok(geometry.messages.bottom<=geometry.composer.top&&geometry.composer.bottom<=geometry.footer.top);assert.equal(geometry.horizontal,false)
  report.checks.push({language,theme,size,geometry})
 }
 for(const theme of ['dark','light']){
  await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));await setWorkspaceViewport(active.app,page,{width:1650,height:1150});if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme){await page.locator('.topbar .theme-toggle').click();await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme)}
  await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(2));await page.waitForFunction(()=>Math.abs(innerWidth-825)<=1&&Math.abs(innerHeight-575)<=1);await page.locator('.composer button[type=submit]').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);report.checks.push({zoom:2,theme,viewport:await page.evaluate(()=>[innerWidth,innerHeight]),horizontalOverflow:false})
 }
 await active.app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1));await stop();const before=await bytes(profile);assert.equal(before[tracked[3]],questionHash)
 page=await start(profile);assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');await page.getByRole('tab',{name:'Conversation',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),snapshot.drafts[0].text);assert.deepEqual((await page.evaluate(()=>window.madness.readState())).value.state.conversations,snapshot.conversations);await stop();assert.deepEqual(await bytes(profile),before);report.checks.push({passiveReopenByteIdentical:before});report.status='passed'
} catch(e){report.status='failed';report.error={message:e.message,stack:e.stack};throw e}
finally{
 try{await stop()}catch(e){report.closeError=e.message;safe=false}
 if(root&&safe){const actual=await realpath(root),stat=await lstat(actual);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^madness-sweep215-/);assert.equal(stat.isSymbolicLink(),false);await rm(actual,{recursive:true,force:true});report.cleanup=true}
 report.root=root;report.finishedAt=new Date().toISOString();await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,captures:report.captures.length,closures:report.closures.length,cleanup:report.cleanup,asarSha256:report.asarSha256,error:report.error?.message}))
}
