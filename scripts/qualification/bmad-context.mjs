// Main/preload compilés exacts ; profil possédé, sans compte ni fournisseur.
import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {mkdtemp,mkdir,writeFile,readFile,realpath,rm} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {emptySnapshot,isSnapshot} from '../../src/contracts/index.ts'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {HelpOwnedRun} from '../../src/adapters/bmad/help-owned-run.ts'
import {helpResourcePins} from '../../src/adapters/bmad/help-manifest.ts'
import {installWorkspaceObservationRuntime,closeWorkspaceSession} from './workspace-design.mjs'
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url))),require=createRequire(import.meta.url)
const output=resolve(process.argv.find(a=>a.startsWith('--output='))?.slice(9)??'_bmad-output/initiative-madness/.working/context-compiled')
await mkdir(output,{recursive:true})
const root=await realpath(await mkdtemp(join(tmpdir(),'mctx-main-'))),profile=join(root,'profile'),report={schemaVersion:1,startedAt:new Date().toISOString(),status:'partial',root,launches:[],closures:[],checks:[],inputs:{},cleanup:false,limits:['Réseau/app-server observés après hook seulement ; aucun succès fournisseur ni 2.2/M14 déduit.','Aucune capture visuelle ou validation humaine ; symlink fichier non exercée faute de privilège.']}
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
  snapshot.projects.push({id,name:id,rootPath:project,openedAt:now})
  const conversationId='historical-'+id
  snapshot.conversations.push({id:conversationId,context:{projectId:id,initiativeId:null,conversationId,providerId:'codex',connectionId:'historical-account'},lastKnownActivity:'idle',messages:[{id:'old-message',role:'assistant',text:'Historique inconnu — octets conservés.'}]})
  protectedFiles.push(join(project,'_bmad/config.toml'))
 }
 assert.equal(isSnapshot(snapshot),true)
 const snapshotPath=join(profile,'madness-state-v1.json');await writeFile(snapshotPath,JSON.stringify(snapshot,null,2)+'\n');protectedFiles.push(snapshotPath)
 const before=new Map(await Promise.all(protectedFiles.map(async p=>[p,await readFile(p)])))
 async function launch(){
  const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(k.toUpperCase())))
  const app=await electron.launch({executablePath:require('electron'),args:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata')},timeout:30000})
  const owned={app,child:app.process(),closeObserved:false};active=owned;app.once('close',()=>owned.closeObserved=true)
  const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData'),executable:process.execPath}))
  owned.main=await windowsOwnedProcesses.read(runtime.pid);assert.ok(owned.main);assert.equal(runtime.path,profile);assert.equal(resolve(owned.main.executable).toLowerCase(),resolve(require('electron')).toLowerCase())
  owned.observationPath=join(output,'observation-'+(report.launches.length+1)+'.json');const observation=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath);owned.observationStartedAt=observation.startedAt
  report.launches.push({main:owned.main,profile,observationPath:owned.observationPath})
  const page=await app.firstWindow();await page.waitForFunction(()=>!!window.madnessBmadContext)
  return page
 }
 async function stop(){
  assert.equal(await new HelpOwnedRun(join(profile,'bmad-help-owned-v1.json')).status(),'stopped')
  const receipt=await closeWorkspaceSession(active);report.closures.push(receipt);cleanupSafe=cleanupSafe&&receipt.cleanupSafe;assert.equal(receipt.cleanupSafe,true);assert.equal(receipt.closeError,false);assert.equal(receipt.observation.network,0);active=null
 }
 let page=await launch()
 const concurrent=await page.evaluate(()=>Promise.all(['project-a','project-b'].map(id=>window.madnessBmadContext.observe(id))))
 pass('two-concurrent-project-observations-share-the-owned-helper')
 for(const [id,name] of [['project-a','alpha'],['project-b','beta']]){
  const observed=concurrent[id==='project-a'?0:1],p=observed.projects.find(p=>p.projectId===id)
  assert.equal(p.status,'ready',JSON.stringify(p));assert.equal(p.selection,null)
  const chosen=await page.evaluate(({id,name,revision})=>window.madnessBmadContext.choose(id,name,revision),{id,name,revision:p.observation.revision})
  assert.equal(chosen.projects.find(p=>p.projectId===id).selection.initiativeId,name);assert.equal(chosen.projects.find(p=>p.projectId===id).storage,'stored');pass('compiled-choose-'+id+'-'+name)
 }
 await stop();pass('real-main-and-helper-closed-before-reopen')
 page=await launch()
 for(const [id,name] of [['project-a','alpha'],['project-b','beta']]){
  const state=await page.evaluate(id=>window.madnessBmadContext.observe(id),id),p=state.projects.find(p=>p.projectId===id)
  assert.equal(p.status,'ready');assert.equal(p.selection.initiativeId,name);assert.equal(p.storage,'stored');pass('passive-restoration-'+id+'-'+name)
 }
 const appState=await page.evaluate(()=>window.madness.readState());assert.ok(appState.ok);assert.deepEqual(appState.value.state.conversations,snapshot.conversations);pass('null-history-never-reassigned')
 await stop()
 for(const [path,bytes] of before)assert.deepEqual(await readFile(path),bytes)
 pass('snapshot-history-and-configurations-byte-identical')
 report.status='passed'
}catch(e){report.error=String(e.stack??e);throw e}
finally{
 if(active){try{const receipt=await closeWorkspaceSession(active);report.closures.push(receipt);cleanupSafe=cleanupSafe&&receipt.cleanupSafe}catch{cleanupSafe=false}}
 if(cleanupSafe&&report.closures.length&&report.closures.every(c=>c.cleanupSafe)){const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^mctx-main-[A-Za-z0-9]+$/);await rm(actual,{recursive:true,force:true});report.cleanup=true}
 report.completedAt=new Date().toISOString();await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n')
}
