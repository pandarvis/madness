import {waitForPageCondition} from './page-condition-wait.mjs'
import assert from 'node:assert/strict'
import {benchOutput} from './epic-one-support.mjs'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,realpath,lstat,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {Application} from '../../src/core/application.ts'
import {DialogueCoordinator} from '../../src/core/dialogue.ts'
import {JsonStore} from '../../src/adapters/persistence/json-store.ts'
import {WorkflowStore} from '../../src/adapters/persistence/workflow-store.ts'
import {initialDialogueState} from '../../src/contracts/dialogue.ts'

const require=createRequire(import.meta.url),repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const output=await benchOutput(join(repository,'_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-conversation'))
const packaged=process.argv.includes('--packaged'),capture=!process.argv.includes('--no-captures')
const arg=process.argv.find(v=>v.startsWith('--executable=')),executable=arg?resolve(arg.slice(13)):packaged?join(repository,'dist/conversation-pilot/win-unpacked/Madness.exe'):require('electron')
const report={schemaVersion:1,observedAt:new Date().toISOString(),mode:packaged?'packaged-isolated-synthetic':'compiled-isolated-synthetic',status:'partial',checks:[],captures:[],cleanup:false,liveProof:'separate',limits:['Flux synthétique injecté par le banc Main dans le vrai preload/renderer ; aucun fournisseur ni compte.','Persistance du cœur source exercée séparément sur le même profil, application fermée ; aucun faux flux modèle revendiqué.','La preuve native installée, les validations humaines et les gates historiques restent distincts.']}
let running,root
const pass=name=>report.checks.push(name),hash=bytes=>createHash('sha256').update(bytes).digest('hex')
async function stop(){if(!running)return;const child=running.process();try{await running.close()}finally{if(child.exitCode!==null)running=undefined}assert.notEqual(child.exitCode,null)}
async function launch(profile){
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'],env=Object.fromEntries(Object.entries(process.env).filter(([name])=>allowed.includes(name.toUpperCase())))
 running=await electron.launch({executablePath:executable,args:packaged?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 const page=await running.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await waitForPageCondition(page,async()=>(await window.madness.readState()).ok)
 assert.equal(resolve(await running.evaluate(({app})=>app.getPath('userData'))),resolve(profile))
 await running.evaluate(({session})=>{globalThis.__conversationRequests=0;session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_d,callback)=>{globalThis.__conversationRequests++;callback({cancel:true})})})
 return page
}
async function inject(state){await running.evaluate(({BrowserWindow},value)=>BrowserWindow.getAllWindows()[0].webContents.send('madness:dialogue:event:v1',value),state)}
async function shot(page,name){if(capture){const file=(packaged?'packaged-':'compiled-')+name+'.png';await page.screenshot({path:join(output,file)});report.captures.push(file)}}
try{
 await mkdir(output,{recursive:true});root=await realpath(await mkdtemp(join(tmpdir(),'madness-conversation-qualification-')))
 const project=join(root,'project'),profile=join(root,'profile');await mkdir(project);await mkdir(profile);await writeFile(join(project,'temoin.txt'),'Projet témoin inchangé.\n')
 const context={projectId:'project-conversation',initiativeId:'initiative-temoin',conversationId:'conversation-synthetic',providerId:'codex',connectionId:'synthetic-account'}
 const snapshot={schemaVersion:1,revision:3,projects:[{id:context.projectId,name:'Projet conversation témoin',rootPath:project,openedAt:new Date().toISOString()}],activeProjectId:context.projectId,drafts:[{projectId:context.projectId,text:'Brouillon témoin sans envoi.',savedAt:new Date().toISOString()}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[{id:'question',role:'user',text:'Question synthétique du banc.'}]}]}
 const historicalContext={...context,conversationId:'conversation-forge-history'}
 snapshot.conversations.unshift({id:historicalContext.conversationId,context:historicalContext,lastKnownActivity:'idle',messages:[{id:'forge-invocation',role:'user',text:'$bmad-forge-idea'},{id:'forge-answer',role:'assistant',text:'Historique Forge synthétique : résultat observé, acceptation humaine inconnue.'}]})
 const historicalWorkflow={schemaVersion:1,conversationId:historicalContext.conversationId,context:historicalContext,invocation:'$bmad-forge-idea',capturedAt:new Date().toISOString(),rootPath:project,outputBase:join(project,'_bmad-output'),contextDigest:'b'.repeat(64),fingerprint:'a'.repeat(64),skillPath:join(project,'synthetic-forge-SKILL.md'),workspace:join(project,'_bmad-output/forge-temoin'),outcome:'CLARIFIED',observations:[{id:'synthetic-observation',turnId:'synthetic-turn',operation:'write',phase:'observed',at:new Date().toISOString(),path:join(project,'temoin.txt'),sha256:hash(await readFile(join(project,'temoin.txt'))),bytes:Buffer.byteLength('Projet témoin inchangé.\n')}]}
 await new WorkflowStore(join(profile,'workflows-v1')).write(historicalWorkflow)
 const snapshotPath=join(profile,'madness-state-v1.json');await writeFile(snapshotPath,JSON.stringify(snapshot))
 let page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const original=await page.evaluate(()=>window.madnessDialogue.read());assert.equal(original.status,'idle');assert.equal(original.turn,null);assert.deepEqual(original.messages,[])
 pass('real-main-preload-start-without-turn-or-provider')
 let sequence=100
 const first={id:'turn-1-message-1',context,requestId:'synthetic-request',turnId:'turn-1',order:1,revision:1,text:'Début synthétique reçu.',phase:'streaming',storage:'pending',identity:{kind:'unknown'}}
 let state={...initialDialogueState(),sequence:sequence++,status:'running',context,acknowledged:true,workflows:original.workflows,turn:{id:'turn-1',requestId:'synthetic-request',context,phase:'streaming'},messages:[first]}
 await inject(state);await page.getByText(first.text,{exact:true}).waitFor()
 await page.getByRole('heading',{name:'Agent non identifié · Codex',exact:true}).waitFor()
 await page.getByText('Réponse en cours · conservation non confirmée',{exact:true}).waitFor()
 pass('typed-synthetic-progress-visible-before-terminal-with-unknown-identity')
 await page.locator('#draft').fill('Saisie témoin conservée pendant le flux.');await page.locator('#draft').focus()
 if(capture){await running.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(600,900));await page.locator('.conversation-history').scrollIntoViewIfNeeded();await shot(page,'compact');await running.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,860));await page.locator('#draft').focus()}
 await page.evaluate(()=>{window.__conversationArticle=document.querySelector('[data-message-id="turn-1-message-1"]');window.__conversationStatus=document.querySelector('.turn-status').textContent})
 const long='Début synthétique reçu.\n'+('Ligne synthétique pour la lecture et son ancrage.\n'.repeat(150))
 state={...state,sequence:sequence++,messages:[{...first,revision:2,text:long}]};await inject(state)
 await page.waitForFunction(()=>document.querySelector('[data-message-id="turn-1-message-1"] .message-text')?.textContent?.length>1000)
 assert.equal(await page.evaluate(()=>window.__conversationArticle===document.querySelector('[data-message-id="turn-1-message-1"]')),true)
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'draft');assert.equal(await page.locator('#draft').inputValue(),'Saisie témoin conservée pendant le flux.')
 assert.equal(await page.evaluate(()=>document.querySelector('.turn-status').textContent===window.__conversationStatus),true)
 assert.equal(await page.locator('.message-text[aria-live]').count(),0)
 pass('stable-article-input-focus-and-transition-only-announcement')
 await page.locator('.conversation-history > .conversation-messages').evaluate(e=>{e.scrollTop=0;e.dispatchEvent(new Event('scroll'))})
 state={...state,sequence:sequence++,messages:[{...first,revision:3,text:long+'Suite reçue.'}]};await inject(state)
 await page.waitForFunction(()=>document.querySelector('[data-message-id="turn-1-message-1"] .message-text').textContent.endsWith('Suite reçue.'))
 assert.equal(await page.locator('.conversation-history > .conversation-messages').evaluate(e=>e.scrollTop),0)
 await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.equal(await page.locator('.conversation-history > .conversation-messages').evaluate(e=>e.scrollTop),0)
 assert.equal(await page.locator('#draft').inputValue(),'Saisie témoin conservée pendant le flux.')
 pass('reading-anchor-and-draft-survive-progress-and-tab-navigation')
 await page.locator('.conversation-history > .conversation-messages').evaluate(e=>{e.scrollTop=e.scrollHeight;e.dispatchEvent(new Event('scroll'))})
 const second={...first,id:'turn-1-message-2',order:2,revision:1,text:'Texte identique.',identity:{kind:'attested',name:'Mary',source:'bmad_resolve(agent)'}}
 state={...state,sequence:sequence++,messages:[{...state.messages[0],revision:4,text:long+'Suite reçue.\nTexte identique.'},second]};await inject(state)
 await page.locator('[data-message-id="turn-1-message-2"]').waitFor()
 assert.equal(await page.locator('.conversation-history > .conversation-messages').evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop<=24),true)
 await page.getByText('Identité attestée · source :',{exact:false}).waitFor();pass('visible-bottom-follows-and-new-identity-keeps-older-message-unknown')
 await page.locator('[data-message-id="turn-1-message-2"]').scrollIntoViewIfNeeded();await shot(page,'progress')
 state={...state,sequence:sequence++,status:'error',errorCode:'STORAGE_WRITE_FAILED',turn:{...state.turn,phase:'interrupted'},messages:state.messages.map(m=>({...m,phase:'interrupted',storage:'failed'}))};await inject(state)
 await page.getByText('Réponse partielle · conservation non confirmée',{exact:true}).first().waitFor()
 assert.equal(await page.locator('[data-message-id="turn-1-message-1"] h3').textContent(),'Agent non identifié · Codex')
 pass('partial-text-and-unconfirmed-storage-remain-visible-without-success')
 for(const size of [{width:1320,height:860,name:'desktop'},{width:600,height:800,name:'compact'}]){
  await running.evaluate(({BrowserWindow},s)=>BrowserWindow.getAllWindows()[0].setContentSize(s.width,s.height),size)
  await page.locator('.conversation-history').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  if(size.name==='desktop')await shot(page,'desktop')
 }
 pass('desktop-and-compact-history-no-horizontal-overflow')
 await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click()
 await waitForPageCondition(page,async()=>(await window.madness.readState()).value.state.drafts[0].text==='Saisie témoin conservée pendant le flux.')
 assert.equal(await running.evaluate(()=>globalThis.__conversationRequests),0)
 report.runtime=await running.evaluate(({app})=>({electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged}))
 const artifact=packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js');report.artifact={file:packaged?'resources/app.asar':'out/main/index.js',sha256:hash(await readFile(artifact))}
 await stop()
 // Le vrai cœur écrit seulement lorsque le Main de l’application est fermé : aucun conflit masqué.
 const application=new Application({store:new JsonStore(snapshotPath),newId:()=> 'conversation-persisted',now:()=>new Date().toISOString(),chooseDirectory:async()=>null})
 const coordinator=new DialogueCoordinator({application,qualify:async()=>({rootPath:project,skillPath:join(project,'synthetic-SKILL.md'),fingerprint:'a'.repeat(64)}),open:async()=>({context:{connectionId:'synthetic-account',initiativeId:'initiative-temoin'},turn:async(_,accepted,observe)=>{await accepted();for(let i=1;i<=500;i++)observe({id:'first',order:1,text:'a'.repeat(i),completed:i===500,identity:{kind:'unknown'}});observe({id:'second',order:2,text:'a'.repeat(500),completed:true,identity:{kind:'unknown'}});return 'a'.repeat(500)+'\n\n'+'a'.repeat(500)},stop:async()=>'stopped'})})
 await coordinator.execute({contractVersion:1,correlationId:'synthetic-persistence-request',type:'launch',projectId:context.projectId});await coordinator.settled();assert.equal(coordinator.read().status,'ready');await coordinator.shutdown()
 const stored=JSON.parse(await readFile(snapshotPath,'utf8')),messages=stored.conversations.at(-1).messages;assert.deepEqual(messages.map(m=>m.text),['$bmad-agent-analyst','a'.repeat(500),'a'.repeat(500)])
 assert.ok(messages.every(m=>Object.keys(m).sort().join(',')==='id,role,text'));pass('source-core-coalesces-real-snapshot-v1-upserts-without-text-deduplication')
 page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.deepEqual((await page.evaluate(()=>window.madness.readState())).value.state.conversations.at(-1).messages,messages)
 assert.equal(await page.getByRole('heading',{name:'Agent non identifié · Codex',exact:true}).count(),2)
 assert.equal(await page.locator('#draft').inputValue(),'Saisie témoin conservée pendant le flux.')
 const restored=await page.evaluate(()=>window.madnessDialogue.read());assert.equal(restored.status,'idle');assert.equal(restored.turn,null);assert.deepEqual(restored.messages,[])
 assert.deepEqual(restored.workflows,[historicalWorkflow])
 await page.locator('.previous-conversations > summary').click();await page.getByRole('heading',{name:'Résultat observé de Forge',exact:true}).scrollIntoViewIfNeeded()
 await page.getByText('Clôture native observée : CLARIFIED. Acceptation humaine inconnue.',{exact:true}).waitFor()
 await running.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1320,860));await shot(page,'forge-history')
 pass('forge-historical-annex-observations-and-human-acceptance-distinction-preserved')
 assert.equal(await running.evaluate(()=>globalThis.__conversationRequests),0);assert.equal(await readFile(join(project,'temoin.txt'),'utf8'),'Projet témoin inchangé.\n')
 report.snapshot={schemaVersion:stored.schemaVersion,messages:messages.length,sha256:hash(await readFile(snapshotPath))};pass('compiled-or-packaged-reopen-exact-text-draft-unknown-identity-no-engine-network')
 report.status='isolated-checks-passed-native-proof-separate'
}catch(error){report.failure=error instanceof Error?error.message.slice(0,1000):'unknown';process.exitCode=1}
finally{
 try{await stop()}catch{report.failure='owned-process-stop-unconfirmed';process.exitCode=1}
 if(root&&!running){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)===base&&/^madness-conversation-qualification-[A-Za-z0-9]+$/.test(basename(actual))&&!(await lstat(root)).isSymbolicLink()){await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}}
 await writeFile(join(output,packaged?'packaged-profile.json':'compiled-profile.json'),JSON.stringify(report,null,2)+'\n')
 console.log(`Conversation : ${report.status} ; ${report.checks.length} contrôles ; nettoyage ${report.cleanup}.`)
}
