import assert from 'node:assert/strict'
import {benchOutput} from './epic-one-support.mjs'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,copyFile,realpath,lstat,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve,dirname,basename} from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {FORGE_MANIFEST} from '../../src/adapters/bmad/forge-manifest.ts'
import {qualifyForge,ForgeHost} from '../../src/adapters/bmad/forge.ts'
import {WorkflowStore} from '../../src/adapters/persistence/workflow-store.ts'
const require=createRequire(import.meta.url),repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const output=await benchOutput(join(repository,'_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-boucle-bmad'))
const packaged=process.argv.includes('--packaged'),capture=!process.argv.includes('--no-captures')
const arg=process.argv.find(v=>v.startsWith('--executable=')),executable=arg?resolve(arg.slice(13)):packaged?join(repository,'dist/forge-pilot/win-unpacked/Madness.exe'):require('electron')
const report={schemaVersion:1,observedAt:new Date().toISOString(),mode:packaged?'packaged-isolated-no-provider':'compiled-isolated-no-provider',status:'partial',checks:[],captures:[],cleanup:false,liveProof:'missing',limits:['Sorties synthétiques du banc produites par les vrais scripts et outils hôte ; aucun dialogue modèle exécuté.','Aucun compte ni coffre copié ; authentification et workflow natif live installé sont des preuves distinctes.','Les gates et réserves distribuables historiques restent inchangés.']}
let running,root
const pass=name=>report.checks.push(name)
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
async function stop(){if(!running)return;const process=running.process();await running.close();assert.notEqual(process.exitCode,null);running=undefined}
async function launch(profile){
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'],env=Object.fromEntries(Object.entries(process.env).filter(([key])=>allowed.includes(key.toUpperCase())))
 running=await electron.launch({executablePath:executable,args:packaged?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
 const page=await running.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue);await page.waitForFunction(async()=>(await window.madness.readState()).ok)
 await running.evaluate(({session})=>{globalThis.__forgeRequests=0;session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_d,callback)=>{globalThis.__forgeRequests++;callback({cancel:true})})})
 return page
}
try{
 await mkdir(output,{recursive:true});root=await realpath(await mkdtemp(join(tmpdir(),'madness-forge-qualification-')))
 const project=join(root,'project'),profile=join(root,'profile');await mkdir(project);await mkdir(profile)
 for(const path of Object.keys(FORGE_MANIFEST)){await mkdir(dirname(join(project,path)),{recursive:true});await copyFile(join(repository,path),join(project,path))}
 await writeFile(join(project,'_bmad/config.toml'),'[core]\noutput_folder = "{project-root}/_bmad-output"\nactive_initiative = "initiative-temoin"\n')
 const signal=new AbortController().signal,runner=join(repository,'resources/bmad-script-runner.py'),qualified=await qualifyForge(project,signal,runner)
 report.profile={fingerprint:qualified.fingerprint,contextDigest:qualified.forge.contextDigest,files:Object.keys(FORGE_MANIFEST).length};pass('real-customization-config-personas-and-isolated-subprocesses-qualified')
 const context={projectId:'project-forge',initiativeId:'initiative-temoin',conversationId:'conversation-forge',providerId:'codex',connectionId:'synthetic-account'}
 const record={schemaVersion:1,conversationId:context.conversationId,context,invocation:'$bmad-forge-idea',capturedAt:new Date().toISOString(),rootPath:project,outputBase:qualified.forge.outputBase,contextDigest:qualified.forge.contextDigest,fingerprint:qualified.fingerprint,skillPath:qualified.skillPath,workspace:null,outcome:'open',observations:[]}
 const store=new WorkflowStore(join(profile,'workflows-v1'));await store.write(record)
 const host=new ForgeHost(qualified,signal,runner);host.bind(async(o,workspace,outcome)=>{record.observations.push(o);record.workspace=workspace??record.workspace;record.outcome=outcome??record.outcome;await store.write(record)})
 for(const kind of ['workflow','config'])await host.execute({kind},'resolver-'+kind,'synthetic-turn-1')
 const sessions=await host.execute({kind:'check-sessions'},'session-check','synthetic-turn-1')
 assert.equal(JSON.parse(sessions).observed,true)
 assert.equal(record.observations.at(-1).operation,'check-sessions');assert.equal(record.observations.at(-1).path,null)
 assert.equal(record.observations.at(-1).sha256,hash(sessions));assert.equal(record.observations.at(-1).bytes,Buffer.byteLength(sessions))
 await host.execute({kind:'personas'},'resolver-personas','synthetic-turn-1')
 pass('synthetic-host-requested-session-check-correlated-durable-before-init')
 await host.execute({kind:'init',slug:'qualification',idea:'Idée synthétique du banc',goal:'Vérifier les commandes natives sans modèle'},'init','synthetic-turn-1')
 await host.execute({kind:'append',type:'lock',text:'Donnée synthétique : les observations ne valent aucune acceptation.'},'append','synthetic-turn-2')
 await host.execute({kind:'write',name:'forge-report.html',text:'<!doctype html><html lang="fr"><meta charset="utf-8"><style>body{font:16px system-ui;margin:3rem;color:#211f1e}svg{width:80px}</style><title>Rapport synthétique de qualification</title><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#e49b7a"/></svg><h1>HARDENED · témoin synthétique</h1><p>Rapport du banc hôte, sans modèle ni acceptation humaine.</p></html>'},'html','synthetic-turn-3')
 await host.execute({kind:'write',name:'idea',text:'- Témoin synthétique : journal natif et sorties observées.\n- Aucun résultat produit ou humain inféré.\n'},'markdown','synthetic-turn-3')
 await host.execute({kind:'finish',outcome:'HARDENED'},'finish','synthetic-turn-3')
 const evidence=join(output,'synthetic-output');await mkdir(evidence,{recursive:true});for(const name of ['.memlog.md','forge-report.html','forge-qualification.md']){const data=await readFile(join(record.workspace,name));await writeFile(join(evidence,name),data)}
 report.observations=structuredClone(record.observations);pass('real-memlog-init-append-set-html-and-markdown-bytes-reread')
 const snapshot={schemaVersion:1,revision:3,projects:[{id:'project-forge',name:'Projet Forge témoin',rootPath:project,openedAt:new Date().toISOString()}],activeProjectId:'project-forge',drafts:[{projectId:'project-forge',text:'Brouillon témoin jamais envoyé au lancement.',savedAt:new Date().toISOString()}],preferences:{navigationCollapsed:false},conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[{id:'invocation',role:'user',text:'$bmad-forge-idea'},{id:'answer',role:'assistant',text:'Historique synthétique : fin du tour, prochaine action à l’utilisateur. Les fichiers observés restent distincts de cette prose.'}]}]}
 await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify(snapshot))
 let page=await launch(profile)
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle')
 assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.conversations[0].lastKnownActivity,'unknown')
 await page.getByRole('heading',{name:'Résultat observé de Forge',exact:true}).waitFor()
 assert.equal(await page.getByText('Acceptation humaine inconnue.',{exact:false}).isVisible(),true)
 assert.equal(await page.locator('#draft').inputValue(),snapshot.drafts[0].text);pass('historical-invocation-context-observations-and-draft-restored-without-engine')
 await page.getByRole('button',{name:'Préparer Forge',exact:true}).click()
 await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()
 const qualificationStates=[],deadline=Date.now()+90000
 let finalQualification
 while(Date.now()<deadline){
  finalQualification=await page.evaluate(()=>window.madnessDialogue.read())
  if(qualificationStates.at(-1)?.sequence!==finalQualification.sequence||qualificationStates.at(-1)?.status!==finalQualification.status)qualificationStates.push({sequence:finalQualification.sequence,status:finalQualification.status,errorCode:finalQualification.errorCode})
  if(finalQualification.status==='qualified'||finalQualification.status==='error')break
  await new Promise(resolve=>setTimeout(resolve,200))
 }
 report.qualificationStates=qualificationStates
 assert.equal(finalQualification.status,'qualified',JSON.stringify(qualificationStates))
 assert.equal(await page.getByRole('button',{name:'Lancer Forge avec Codex',exact:true}).isDisabled(),true)
 assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.conversations.length,1)
 assert.equal(await running.evaluate(()=>globalThis.__forgeRequests),0);pass('compiled-or-packaged-forge-profile-qualifies-without-account-network-or-model')
 assert.equal((await page.evaluate(()=>window.madnessDialogue.send('foreign','conversation-forge','Ne pas envoyer'))).errorCode,'CONTEXT_MISMATCH');pass('foreign-conversation-refused-no-replay')
 await page.locator('#draft').fill('Brouillon Forge conservé après navigation et réouverture.')
 await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click()
 await page.waitForFunction(async()=>(await window.madness.readState()).value.state.drafts[0].text==='Brouillon Forge conservé après navigation et réouverture.')
 await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click()
 await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click()
 assert.equal(await page.locator('#draft').inputValue(),'Brouillon Forge conservé après navigation et réouverture.');pass('theme-navigation-and-explicit-draft-save-preserve-context')
 await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).click()
 for(const size of [{width:1320,height:860,name:'desktop'},{width:600,height:800,name:'compact'}]){
  await running.evaluate(({BrowserWindow},s)=>BrowserWindow.getAllWindows()[0].setContentSize(s.width,s.height),size)
  await page.getByRole('heading',{name:'Mettre une idée à l’épreuve',exact:true}).scrollIntoViewIfNeeded()
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  if(capture){const name=(packaged?'packaged-':'compiled-')+size.name+'.png';await page.screenshot({path:join(output,name)});report.captures.push(name)}
 }
 pass('desktop-and-compact-preparation-no-horizontal-overflow')
 report.runtime=await running.evaluate(({app})=>({electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged}))
 const artifact=packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js');report.artifact={file:packaged?'resources/app.asar':'out/main/index.js',sha256:hash(await readFile(artifact))}
 if(packaged)assert.equal(hash(await readFile(join(dirname(executable),'resources/bmad-script-runner.py'))),hash(await readFile(runner)))
 await stop();page=await launch(profile)
 const restored=await page.evaluate(()=>window.madnessDialogue.read());assert.equal(restored.status,'idle');assert.deepEqual(restored.workflows,[record]);assert.equal(await running.evaluate(()=>globalThis.__forgeRequests),0)
 assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.drafts[0].text,'Brouillon Forge conservé après navigation et réouverture.');pass('second-reopen-exact-workflow-record-and-draft-no-provider')
 report.status='checks-passed-live-installed-missing'
}catch(error){report.failure=error instanceof Error?error.message.slice(0,1000):'unknown';process.exitCode=1}
finally{
 try{await stop()}catch{report.failure='owned-process-stop-unconfirmed';process.exitCode=1}
 if(root&&!running){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)===base&&/^madness-forge-qualification-[A-Za-z0-9]+$/.test(basename(actual))&&!(await lstat(root)).isSymbolicLink()){await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}}
 await writeFile(join(output,packaged?'packaged-profile.json':'compiled-profile.json'),JSON.stringify(report,null,2)+'\n')
 console.log(`Forge : ${report.status} ; ${report.checks.length} contrôles ; nettoyage ${report.cleanup}.`)
}
