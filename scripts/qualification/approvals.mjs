import assert from 'node:assert/strict'
import {benchOutput} from './epic-one-support.mjs'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,realpath,lstat,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {ApprovalStore} from '../../src/adapters/persistence/approval-store.ts'
import {initialDialogueState,isDialogueState} from '../../src/contracts/dialogue.ts'
const require=createRequire(import.meta.url),repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const output=await benchOutput(join(repository,'_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-approvals'))
const packaged=process.argv.includes('--packaged'),capture=!process.argv.includes('--no-captures'),arg=process.argv.find(v=>v.startsWith('--executable='))
const executable=arg?resolve(arg.slice(13)):packaged?join(repository,'dist/approvals-pilot/win-unpacked/Madness.exe'):require('electron')
const report={schemaVersion:1,observedAt:new Date().toISOString(),mode:packaged?'packaged-isolated-synthetic':'compiled-isolated-synthetic',status:'partial',checks:[],captures:[],cleanup:false,limits:['Main/preload/renderer réels et états synthétiques ; aucun compte ni fournisseur.','Les décisions et résultats natifs sont vérifiés par les tests protocole ; modèle réel et installation restent des preuves séparées.','Aucune distribution, acceptation visuelle humaine ou clôture des gates historiques déduite.']}
let running,root
const pass=name=>report.checks.push(name),hash=bytes=>createHash('sha256').update(bytes).digest('hex')
async function stop(){if(!running)return;const child=running.process();try{await running.close()}finally{if(child.exitCode!==null)running=undefined}assert.notEqual(child.exitCode,null)}
async function launch(profile){
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'],env=Object.fromEntries(Object.entries(process.env).filter(([key])=>allowed.includes(key.toUpperCase())))
 running=await electron.launch({executablePath:executable,args:packaged?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 const page=await running.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await page.waitForFunction(async()=>(await window.madness.readState()).ok)
 assert.equal(resolve(await running.evaluate(({app})=>app.getPath('userData'))),resolve(profile))
 await running.evaluate(({session})=>{globalThis.__approvalRequests=0;session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_d,callback)=>{globalThis.__approvalRequests++;callback({cancel:true})})})
 return page
}
async function inject(state){assert.equal(isDialogueState(state),true);await running.evaluate(({BrowserWindow},state)=>BrowserWindow.getAllWindows()[0].webContents.send('madness:dialogue:event:v1',state),state)}
async function shot(page,name){if(!capture)return;const file=(packaged?'packaged-':'compiled-')+name+'.png';await page.screenshot({path:join(output,file)});report.captures.push(file)}
try{
 await mkdir(output,{recursive:true});root=await realpath(await mkdtemp(join(tmpdir(),'madness-approvals-qualification-')))
 const project=join(root,'project'),profile=join(root,'profile');await mkdir(project);await mkdir(profile);await writeFile(join(project,'temoin.txt'),'Projet intact.\n')
 const context={projectId:'project-approvals',initiativeId:'initiative-temoin',conversationId:'conversation-approvals',providerId:'codex',connectionId:'synthetic-account'}
 const snapshot={schemaVersion:1,revision:2,projects:[{id:context.projectId,name:'Projet approbations témoin',rootPath:project,openedAt:new Date().toISOString()}],activeProjectId:context.projectId,drafts:[{projectId:context.projectId,text:'Brouillon libre distinct, sans envoi.',savedAt:new Date().toISOString()}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'idle',messages:[{id:'historical-context',role:'assistant',text:'Contexte synthétique de qualification des approbations.'}]}]}
 const record={schemaVersion:1,id:'approval-synthetic',context,requestId:'approval-request',turnId:'turn-approvals',identity:{kind:'unknown'},mode:'file-approval',files:[{path:join(project,'livrable.md'),kind:'add',diff:'Livrable proposé : été, 日本語.\nTous les contenus natifs sont présentés avant le choix.\n',beforeSha256:null,afterSha256:'a'.repeat(64)},{path:join(project,'temoin.txt'),kind:'update',diff:'@@ -1 +1 @@\n-Projet intact.\n+Projet proposé.\n',beforeSha256:'b'.repeat(64),afterSha256:'c'.repeat(64)},{path:join(project,'obsolete.md'),kind:'delete',diff:'Contenu intégral proposé à la suppression.\n',beforeSha256:'d'.repeat(64),afterSha256:null}],reason:null,adjustment:'Ajustement distinct : conserver le témoin.',adjustmentStatus:'draft',status:'waiting',decision:null,transmission:'none',effect:'pending',result:null,createdAt:new Date().toISOString(),expiresAt:Date.now()+600000,revision:1,storage:'stored'}
 const snapshotPath=join(profile,'madness-state-v1.json');await writeFile(snapshotPath,JSON.stringify(snapshot));const snapshotBytes=await readFile(snapshotPath)
 await new ApprovalStore(join(profile,'approvals-v1')).write(record)
 let page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click();let panel=page.locator('[data-approval-id="approval-synthetic"]');await panel.waitFor()
 const restored=await page.evaluate(()=>window.madnessDialogue.read());assert.equal(restored.status,'idle');assert.equal(restored.mode,'read-only');assert.equal(restored.turn,null);assert.equal(restored.approvals[0].status,'inactive');assert.equal(restored.approvals[0].reason,'reopened')
 assert.equal(await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).count(),0);assert.equal(await panel.getByLabel('Ajustement demandé',{exact:true}).inputValue(),record.adjustment);pass('restored-approval-inactive-with-full-scope-adjustment-and-no-engine')
 assert.deepEqual((await page.evaluate(()=>Object.keys(window.madness))).sort(),['chooseDirectory','onStateChanged','readState','saveDraft','selectProject','setNavigation'].sort());pass('snapshot-v1-six-madness-methods-preserved')
 for(const decision of ['accept','decline','acceptForSession']){const state=await page.evaluate(({id,decision})=>window.madnessDialogue.decideApproval(id,decision),{id:record.id,decision});assert.equal(state.errorCode,decision==='acceptForSession'?'INVALID_COMMAND':'CONTEXT_MISMATCH')}
 assert.equal((await page.evaluate(id=>window.madnessDialogue.sendAdjustment(id),record.id)).errorCode,'CONTEXT_MISMATCH');pass('real-bridge-rejects-historical-global-and-implicit-adjustment')
 const saved=await page.evaluate(id=>window.madnessDialogue.saveApproval(id,'Ajustement historique conservé explicitement.'),record.id);assert.equal(saved.approvals[0].storage,'stored');assert.equal(saved.approvals[0].status,'inactive');pass('real-main-atomic-adjustment-storage-independent-of-free-draft')
 let sequence=100;let state={...initialDialogueState(),sequence:sequence++,mode:'file-approval',status:'waiting-approval',context,acknowledged:true,turn:{id:'turn-approvals',requestId:'approval-request',context,phase:'streaming'},approvals:[{...record,adjustment:''}]}
 await inject(state);await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).waitFor();assert.equal(await panel.locator('input:checked').count(),0);assert.equal(await panel.locator('.approval-file').count(),3);assert.equal(await panel.locator('pre').count(),3);pass('full-mixed-patch-before-explicit-whole-operation-choice')
 await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('button',{name:'Retrouver l’opération',exact:true}).click();assert.equal(await page.locator('#draft').inputValue(),snapshot.drafts[0].text);pass('operation-return-preserves-free-draft')
 for(const size of [{width:1320,height:900,name:'desktop'},{width:600,height:850,name:'compact'}]){
  await running.evaluate(({BrowserWindow},s)=>BrowserWindow.getAllWindows()[0].setContentSize(s.width,s.height),size);await panel.locator('h2').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await shot(page,size.name+'-scope');await panel.getByLabel('Ajustement demandé',{exact:true}).scrollIntoViewIfNeeded();await shot(page,size.name+'-choice')
 }
 pass('desktop-compact-full-scope-controls-no-overflow')
 const authorize=panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true});await authorize.focus();assert.equal(await authorize.evaluate(e=>e===document.activeElement),true);pass('explicit-choice-keyboard-focus')
 state={...state,sequence:sequence++,approvals:[{...record,status:'decided',decision:'accept',transmission:'sent',effect:'pending'}]};await inject(state);await panel.getByRole('status').filter({hasText:'Exécution et relecture des effets attendues'}).waitFor();assert.equal(await panel.getByText('Effets vérifiés pour cette opération.',{exact:true}).count(),0);pass('transmitted-decision-does-not-claim-effect-success')
 state={...state,sequence:sequence++,status:'stopped',approvals:[{...record,status:'unknown',reason:'stopped',decision:'accept',transmission:'sent',effect:'unknown'}]};await inject(state);await panel.getByRole('status').filter({hasText:'Décision ou effet inconnu'}).waitFor();assert.equal(await panel.getByRole('button',{name:'Autoriser tout le patch une fois',exact:true}).count(),0)
 await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();await panel.locator('h2').scrollIntoViewIfNeeded();await shot(page,'unknown-light');pass('unknown-stop-preserves-scope-and-withdraws-controls-in-light-theme')
 assert.equal(await running.evaluate(()=>globalThis.__approvalRequests),0);report.runtime=await running.evaluate(({app})=>({electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged}));report.artifact={file:packaged?'resources/app.asar':'out/main/index.js',sha256:hash(await readFile(packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js')))}
 // La navigation de retour enregistre sa sélection, séparément du contenu préservé.
 const stableSnapshot=await readFile(snapshotPath),stable=JSON.parse(stableSnapshot);assert.deepEqual(stable.drafts,snapshot.drafts);assert.deepEqual(stable.conversations,snapshot.conversations)
 await stop();const annexPath=join(profile,'approvals-v1/approval-synthetic.json'),annexBytes=await readFile(annexPath);assert.equal(JSON.parse(annexBytes).adjustment,'Ajustement historique conservé explicitement.');assert.deepEqual(await readFile(snapshotPath),stableSnapshot)
 page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click();panel=page.locator('[data-approval-id="approval-synthetic"]');await panel.waitFor();assert.equal(await panel.getByLabel('Ajustement demandé',{exact:true}).inputValue(),'Ajustement historique conservé explicitement.');assert.deepEqual(await readFile(annexPath),annexBytes);assert.deepEqual(await readFile(snapshotPath),stableSnapshot);assert.equal(await readFile(join(project,'temoin.txt'),'utf8'),'Projet intact.\n');assert.equal(await running.evaluate(()=>globalThis.__approvalRequests),0);pass('exact-reopen-annex-snapshot-and-project-no-engine-network-or-replay')
 report.status='isolated-checks-passed-live-proof-separate';report.originalSnapshotSha256=hash(snapshotBytes)
}catch(error){report.failure=error instanceof Error?error.message.slice(0,1500):'unknown';process.exitCode=1}
finally{
 try{await stop()}catch{report.failure='owned-process-stop-unconfirmed';process.exitCode=1}
 if(root&&!running){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)===base&&/^madness-approvals-qualification-[A-Za-z0-9]+$/.test(basename(actual))&&!(await lstat(root)).isSymbolicLink()){await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}}
 await writeFile(join(output,packaged?'packaged-profile.json':'compiled-profile.json'),JSON.stringify(report,null,2)+'\n');console.log(`Approbations : ${report.status} ; ${report.checks.length} contrôles ; nettoyage ${report.cleanup}.`)
}
