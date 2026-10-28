import assert from 'node:assert/strict'
import {benchOutput} from './epic-one-support.mjs'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,realpath,lstat,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {QuestionStore} from '../../src/adapters/persistence/question-store.ts'
import {initialDialogueState,isDialogueState} from '../../src/contracts/dialogue.ts'

const require=createRequire(import.meta.url),repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const output=await benchOutput(join(repository,'_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-questions'))
const packaged=process.argv.includes('--packaged'),capture=!process.argv.includes('--no-captures'),arg=process.argv.find(v=>v.startsWith('--executable='))
const executable=arg?resolve(arg.slice(13)):packaged?join(repository,'dist/questions-pilot/win-unpacked/Madness.exe'):require('electron')
const report={schemaVersion:1,observedAt:new Date().toISOString(),mode:packaged?'packaged-isolated-synthetic':'compiled-isolated-synthetic',status:'partial',checks:[],captures:[],cleanup:false,limits:['Main/preload/renderer réels, données et notifications synthétiques ; aucun compte, fournisseur ou modèle.','Les reçus natifs sont exercés par les tests protocole et le spike distinct ; la preuve avec vrai modèle reste séparée.','Aucune acceptation humaine, distribution ni gate historique déduite de ce banc.']}
let running,root
const pass=name=>report.checks.push(name),hash=bytes=>createHash('sha256').update(bytes).digest('hex')
async function stop(){if(!running)return;const child=running.process();try{await running.close()}finally{if(child.exitCode!==null)running=undefined}assert.notEqual(child.exitCode,null)}
async function launch(profile){
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'],env=Object.fromEntries(Object.entries(process.env).filter(([name])=>allowed.includes(name.toUpperCase())))
 running=await electron.launch({executablePath:executable,args:packaged?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 const page=await running.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await page.waitForFunction(async()=>(await window.madness.readState()).ok)
 assert.equal(resolve(await running.evaluate(({app})=>app.getPath('userData'))),resolve(profile))
 await running.evaluate(({session})=>{globalThis.__questionRequests=0;session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_d,callback)=>{globalThis.__questionRequests++;callback({cancel:true})})})
 return page
}
async function inject(state){assert.equal(isDialogueState(state),true);await running.evaluate(({BrowserWindow},value)=>BrowserWindow.getAllWindows()[0].webContents.send('madness:dialogue:event:v1',value),state)}
async function shot(page,name){if(!capture)return;const file=(packaged?'packaged-':'compiled-')+name+'.png';await page.screenshot({path:join(output,file)});report.captures.push(file)}
try{
 await mkdir(output,{recursive:true});root=await realpath(await mkdtemp(join(tmpdir(),'madness-questions-qualification-')))
 const project=join(root,'project'),profile=join(root,'profile');await mkdir(project);await mkdir(profile);await writeFile(join(project,'temoin.txt'),'Projet questions intact.\n')
 const context={projectId:'project-questions',initiativeId:'initiative-temoin',conversationId:'conversation-questions',providerId:'codex',connectionId:'synthetic-account'}
 const snapshot={schemaVersion:1,revision:2,projects:[{id:context.projectId,name:'Projet questions témoin',rootPath:project,openedAt:new Date().toISOString()}],activeProjectId:context.projectId,drafts:[{projectId:context.projectId,text:'Brouillon libre distinct, sans envoi.',savedAt:new Date().toISOString()}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[{id:'historical-question-context',role:'assistant',text:'Contexte synthétique de qualification des questions.'}]}]}
 const record={schemaVersion:1,id:'question-synthetic',context,requestId:'synthetic-question-request',turnId:'turn-questions',identity:{kind:'unknown'},fields:[{id:'field-1',header:'Direction',prompt:'Quelle direction retenir pour ce témoin synthétique ?',options:[{label:'Alpha',description:'Examiner d’abord le parcours de lecture.'},{label:'Beta',description:'Examiner d’abord la préparation du dialogue.'}],allowOther:true},{id:'field-2',header:'Précision',prompt:'Quelle précision souhaitez-vous conserver ?',options:[],allowOther:false}],values:{'field-1':'Alpha','field-2':'Une précision UTF-8 : été, 日本語.'},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:null,revision:1,storage:'stored'}
 const snapshotPath=join(profile,'madness-state-v1.json');await writeFile(snapshotPath,JSON.stringify(snapshot));let snapshotBytes=await readFile(snapshotPath)
 await new QuestionStore(join(profile,'questions-v1')).write(record)
 let page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click();const panel=page.locator('[data-question-id="question-synthetic"]')
 await panel.waitFor();const restored=await page.evaluate(()=>window.madnessDialogue.read())
 assert.equal(restored.status,'idle');assert.equal(restored.turn,null);assert.equal(restored.questions[0].status,'inactive');assert.equal(restored.questions[0].reason,'reopened');assert.equal(await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).count(),0)
 assert.equal(await panel.getByLabel('Votre réponse',{exact:true}).inputValue(),'Une précision UTF-8 : été, 日本語.');assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre distinct, sans envoi.')
 pass('real-main-restores-question-fields-values-as-inactive-without-engine')
 assert.deepEqual((await page.evaluate(()=>Object.keys(window.madness))).sort(),['chooseDirectory','onStateChanged','readState','saveDraft','selectProject','setNavigation'].sort());pass('snapshot-v1-and-six-madness-methods-preserved')
 const rejected=await page.evaluate(()=>window.madnessDialogue.answerQuestion('question-synthetic',{'field-1':'Alpha','field-2':'Réponse ancienne'}));assert.equal(rejected.errorCode,'CONTEXT_MISMATCH')
 const empty=await page.evaluate(()=>window.madnessDialogue.answerQuestion('question-synthetic',{'field-1':' ','field-2':'Texte'}));assert.equal(empty.errorCode,'INVALID_COMMAND');pass('real-preload-rejects-empty-and-historical-answer-without-replay')
 const changed=await page.evaluate(()=>window.madnessDialogue.saveQuestion('question-synthetic',{'field-1':'Beta','field-2':'Saisie historique conservée explicitement.'}));assert.equal(changed.questions[0].storage,'stored');assert.equal(changed.questions[0].status,'inactive')
 pass('real-main-atomic-annex-save-keeps-original-demand-and-free-draft')
 let sequence=100
 let state={...initialDialogueState(),sequence:sequence++,status:'waiting-question',context,acknowledged:true,turn:{id:'turn-questions',requestId:'synthetic-question-request',context,phase:'streaming'},questions:[{...record,values:{},status:'waiting'}]}
 await inject(state);await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).waitFor();assert.equal(await panel.locator('input:checked').count(),0);assert.equal(await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).isDisabled(),true)
 pass('synthetic-active-question-real-options-no-default-and-empty-send-disabled')
 await page.getByRole('tab',{name:'Parcours',exact:true}).click();await page.getByRole('button',{name:'Retrouver la question',exact:true}).click();await panel.waitFor();assert.equal(await page.locator('#draft').inputValue(),'Brouillon libre distinct, sans envoi.')
 pass('waiting-point-return-across-navigation-preserves-free-draft')
 state={...state,sequence:sequence++,questions:[{...record,status:'sending'}]};await inject(state);await panel.getByRole('status').filter({hasText:'Accusé natif et conservation attendus'}).waitFor();assert.equal(await panel.getByText('Réponse envoyée et enregistrée.',{exact:true}).count(),0)
 pass('synthetic-sending-never-claims-ack-before-native-and-storage')
 for(const size of [{width:1320,height:860,name:'desktop'},{width:600,height:800,name:'compact'}]){await running.evaluate(({BrowserWindow},s)=>BrowserWindow.getAllWindows()[0].setContentSize(s.width,s.height),size);await panel.scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await shot(page,size.name)}
 pass('desktop-compact-question-no-horizontal-overflow')
 state={...state,sequence:sequence++,status:'stopped',questions:[{...record,status:'inactive',reason:'stopped'}]};await inject(state);await panel.getByRole('status').filter({hasText:'Demande inactive'}).waitFor();assert.equal(await panel.getByRole('button',{name:'Envoyer cette réponse',exact:true}).count(),0);assert.equal(await panel.getByLabel('Votre réponse',{exact:true}).inputValue(),record.values['field-2'])
 await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();await panel.scrollIntoViewIfNeeded();await shot(page,'inactive-light');pass('inactive-keeps-values-and-controls-disabled-in-both-themes')
 report.runtime=await running.evaluate(({app})=>({electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged}));assert.equal(await running.evaluate(()=>globalThis.__questionRequests),0)
 report.artifact={file:packaged?'resources/app.asar':'out/main/index.js',sha256:hash(await readFile(packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js')))}
 // Le retour explicite vers le projet enregistre sa sélection. La réouverture
 // compare les octets après cette navigation, sans effacer cet effet autorisé.
 snapshotBytes=await readFile(snapshotPath);const stableSnapshot=JSON.parse(snapshotBytes);assert.deepEqual(stableSnapshot.drafts,snapshot.drafts);assert.deepEqual(stableSnapshot.conversations,snapshot.conversations.map(c=>({...c,lastKnownActivity:'unknown'})))
 await stop();assert.deepEqual(await readFile(snapshotPath),snapshotBytes)
 const bytes=await readFile(join(profile,'questions-v1/question-synthetic.json')),durable=JSON.parse(bytes);assert.equal(durable.status,'inactive');assert.equal(durable.values['field-2'],'Saisie historique conservée explicitement.')
 page=await launch(profile);await page.getByRole('tab',{name:'Conversation',exact:true}).click();await page.locator('[data-question-id="question-synthetic"]').waitFor();assert.equal(await page.getByLabel('Votre réponse',{exact:true}).inputValue(),'Saisie historique conservée explicitement.')
 assert.deepEqual(await readFile(join(profile,'questions-v1/question-synthetic.json')),bytes);assert.deepEqual(await readFile(snapshotPath),snapshotBytes);assert.equal(await readFile(join(project,'temoin.txt'),'utf8'),'Projet questions intact.\n');assert.equal(await running.evaluate(()=>globalThis.__questionRequests),0)
 pass('exact-reopen-annex-snapshot-and-project-without-engine-or-network');report.status='isolated-checks-passed-live-proof-separate'
}catch(error){report.failure=error instanceof Error?error.message.slice(0,1000):'unknown';process.exitCode=1}
finally{
 try{await stop()}catch{report.failure='owned-process-stop-unconfirmed';process.exitCode=1}
 if(root&&!running){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)===base&&/^madness-questions-qualification-[A-Za-z0-9]+$/.test(basename(actual))&&!(await lstat(root)).isSymbolicLink()){await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}}
 await writeFile(join(output,packaged?'packaged-profile.json':'compiled-profile.json'),JSON.stringify(report,null,2)+'\n')
 console.log(`Questions : ${report.status} ; ${report.checks.length} contrôles ; nettoyage ${report.cleanup}.`)
}
