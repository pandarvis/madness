import assert from 'node:assert/strict'
import {_electron as electron} from 'playwright-core'
import {createRequire} from 'node:module'
import {tmpdir} from 'node:os'
import {dirname,join,basename,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {copyFile,lstat,mkdir,mkdtemp,readFile,readdir,realpath,rm,writeFile} from 'node:fs/promises'
import {PROFILE_FILES} from '../../src/adapters/bmad/profile.ts'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {claimOutput,noLinks,sha256,samePath} from './epic-one-support.mjs'
import {closeWorkspaceSession,installWorkspaceObservationRuntime} from './workspace-design.mjs'
import {waitForPageCondition} from './page-condition-wait.mjs'

const options=process.argv.slice(2)
const live=options.includes('--live'),reopenOnly=options.includes('--reopen-only')
assert.notEqual(live,reopenOnly,'Choose --live (consumes a Claude turn) or --reopen-only (synthetic history).')
const destination=options.find(value=>value.startsWith('--output='))?.slice('--output='.length)
assert.ok(destination,'A fresh --output= directory is required.')
assert.equal(process.platform,'win32')
const output=await claimOutput(destination)
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const executable=createRequire(import.meta.url)('electron')
const report={schemaVersion:1,scenario:live?'compiled-claude-personal-subscription':'compiled-claude-passive-history',status:'partial',checks:[],cleanup:false}
const pass=name=>{report.checks.push(name);console.log(name)}
let active,root,allowCleanup=true
async function stop(){
 if(!active)return
 const observed=await active.app.evaluate(()=>({...globalThis.__claudeWitnessRuns})).catch(()=>null)
 const closed=await closeWorkspaceSession(active)
 let claudeStop=false
 try{
  const state=JSON.parse(await readFile(join(active.profile,'claude-owned-run-v1.json'),'utf8'))
  claudeStop=state.schemaVersion===1&&state.status==='stopped'
 }catch(error){
  claudeStop=error.code==='ENOENT'&&observed?.started===0
 }
 allowCleanup&&=closed.cleanupSafe&&!closed.closeError&&claudeStop
 report.closes??=[]
 report.closes.push({appGone:closed.mainGone,closeObserved:closed.closeObserved,noCodex:closed.childrenGone,claudeStop,networkInElectron:closed.observation.network})
 active=undefined
 assert.equal(allowCleanup,true,'APP_CLOSE_UNCONFIRMED')
}
async function launch(profile,index){
 const keys=new Set(['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH','APPDATA','LOCALAPPDATA','PROGRAMFILES','PROGRAMFILES(X86)','PROGRAMDATA','HTTPS_PROXY','HTTP_PROXY','NO_PROXY','NODE_EXTRA_CA_CERTS','SSL_CERT_FILE'])
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>keys.has(key.toUpperCase())))
 const app=await electron.launch({executablePath:executable,args:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile},timeout:30000})
 active={app,profile,child:app.process(),closeObserved:false}
 const owned=active
 app.once('close',()=>{owned.closeObserved=true})
 const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData')}))
 assert.ok(samePath(runtime.path,profile),'ISOLATED_PROFILE_REQUIRED')
 owned.main=await windowsOwnedProcesses.read(runtime.pid)
 assert.ok(owned.main,'MAIN_IDENTITY_REQUIRED')
 await app.evaluate(()=>{
  const childProcess=process.getBuiltinModule('child_process')
  const modules=process.getBuiltinModule('module')
  const original=childProcess.spawn
  const runs={started:0,closed:0}
  globalThis.__claudeWitnessRuns=runs
  globalThis.__claudeWitnessReportedUsd=null
  childProcess.spawn=function(executable,args,...rest){
   const child=Reflect.apply(original,this,[executable,args,...rest])
   if(/[\\/]claude\.exe$/i.test(executable)&&(args?.includes('-p')||args?.includes('--print'))){
    runs.started++
    let output=''
    child.stdout?.on('data',chunk=>{if(output.length<524288)output+=chunk})
    child.once('close',()=>{
     runs.closed++
     try{
      const receipt=JSON.parse(output)
      if(receipt.type==='result'&&typeof receipt.total_cost_usd==='number'&&Number.isFinite(receipt.total_cost_usd)&&receipt.total_cost_usd>=0)
       globalThis.__claudeWitnessReportedUsd=receipt.total_cost_usd
     }catch{}
    })
   }
   return child
  }
  modules.syncBuiltinESMExports()
 })
 owned.observationPath=join(output,'observer-'+index+'.json')
 const observer=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath)
 owned.observationStartedAt=observer.startedAt
 assert.ok(observer.attached&&observer.complete,'OBSERVER_REQUIRED')
 const page=await app.firstWindow()
 await page.waitForFunction(()=>typeof window.madnessDialogue?.launchClaude==='function')
 await waitForPageCondition(page,async()=>(await window.madness.readState()).ok)
 return page
}
async function enterProject(page){
 const tab=page.getByRole('tab',{name:'Conversation',exact:true})
 if(!await tab.isVisible())await page.getByRole('button',{name:'Ouvrir le projet Témoin Claude',exact:true}).click()
 return tab
}
try{
 root=await realpath(await mkdtemp(join(tmpdir(),'madness-claude-live-')))
 const project=join(root,'project'),profile=join(root,'profile')
 await mkdir(profile)
 const files=[...PROFILE_FILES,'_bmad/config.toml','_bmad-output/initiative-claude-proof/initiative-claude-proof.md']
 for(const path of files){
  const target=join(project,path)
  await mkdir(dirname(target),{recursive:true})
  if(path==='_bmad/config.toml')await writeFile(target,'[core]\nactive_initiative="initiative-claude-proof"\n')
  else if(path.endsWith('initiative-claude-proof.md'))await writeFile(target,'# Témoin synthétique\n')
  else await copyFile(join(repository,path),target)
 }
 async function inventory(folder,at=''){
  const entries=await readdir(folder,{withFileTypes:true})
  const results={}
  for(const entry of entries){
   assert.ok(entry.isFile()||entry.isDirectory(),'Unexpected object in witness project')
   const name=at+entry.name,path=join(folder,entry.name)
   if(entry.isDirectory())Object.assign(results,await inventory(path,name+'/'))
   else results[name]=sha256(await readFile(path))
  }
  return results
 }
 const sources=await inventory(project)
 const original={id:'old-codex',context:{projectId:'claude-witness',initiativeId:null,conversationId:'old-codex',providerId:'codex',connectionId:'old-connection'},lastKnownActivity:'idle',messages:[{id:'old-answer',role:'assistant',text:'Historique Codex de contrôle.'}]}
 const time=new Date().toISOString()
 const seed={schemaVersion:1,revision:3,projects:[{id:'claude-witness',name:'Témoin Claude',rootPath:project,openedAt:time}],activeProjectId:'claude-witness',drafts:[{projectId:'claude-witness',text:'Brouillon témoin conservé.',savedAt:time}],preferences:{navigationCollapsed:false},conversations:[original]}
 const stateFile=join(profile,'madness-state-v1.json')
 if(reopenOnly){
  const recorded={id:'archived-claude',context:{projectId:'claude-witness',initiativeId:'initiative-claude-proof',conversationId:'archived-claude',providerId:'claude-code',connectionId:'synthetic-claude'},lastKnownActivity:'running',messages:[{id:'test-assistant',role:'assistant',text:'Réponse Claude synthétique de contrôle.'}]}
  seed.conversations.push(recorded)
  await writeFile(stateFile,JSON.stringify(seed))
  const page=await launch(profile,1)
  await (await enterProject(page)).click()
  await waitForPageCondition(page,()=>document.querySelector('#conversation-heading')?.textContent.includes('Claude Code'))
  const restored=(await page.evaluate(()=>window.madness.readState())).value.state
  assert.deepEqual(restored.conversations.find(c=>c.id===recorded.id),{...recorded,lastKnownActivity:'unknown'})
  assert.deepEqual(restored.drafts,seed.drafts)
  assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle')
  assert.deepEqual(await active.app.evaluate(()=>({...globalThis.__claudeWitnessRuns})),{started:0,closed:0})
  await page.getByText(recorded.messages[0].text,{exact:true}).waitFor()
  await stop()
  assert.deepEqual(JSON.parse(await readFile(stateFile,'utf8')),seed)
  pass('Réouverture passive de l’historique Claude et Codex, données exactes, aucun processus Claude')
 }else{
 await writeFile(stateFile,JSON.stringify(seed))
 let page=await launch(profile,1)
 const tab=await enterProject(page)
 const button=page.getByRole('button',{name:'Lancer Mary avec Claude Code',exact:true})
 if(!await button.isVisible())await tab.click()
 await button.waitFor()
 await button.focus()
 const attempts=await page.evaluate(()=>window.madnessDialogue.read())
 assert.equal(attempts.status,'idle','PASSIVE_FIRST_OPEN')
 await page.keyboard.press('Enter')
 report.clicked=true
 const state=await waitForPageCondition(page,async()=>{
  const dialogue=await window.madnessDialogue.read()
  return ['stopped','error','unknown'].includes(dialogue.status)?dialogue:false
 },undefined,{timeout:120000,interval:150})
 report.terminal={status:state.status,phase:state.turn?.phase,error:state.errorCode,provider:state.context.providerId,stop:state.recovery.stop,profileCaptured:!!state.profile,activityCount:state.activities.length}
 const helperRoot=join(profile,'bmad-help-runs-v1')
 const operations=await readdir(helperRoot).catch(()=>[])
 report.contextProbes=[]
 for(const operation of operations.filter(name=>/^operation-[a-f0-9-]+$/.test(name))){
  try{
   const task=join(helperRoot,operation)
   const request=JSON.parse(await readFile(join(task,'request.json'),'utf8'))
   const result=JSON.parse(await readFile(join(task,'stdout.json'),'utf8'))
   if(request.op==='context-config')report.contextProbes.push({
    activeStatus:result.activeStatus,contextStatus:result.status,revision:result.revision,sourceCount:result.sources?.length,
    rootMatches:request.project&&samePath(request.project.replace(/^\\\\\?\\/,''),project)
   })
  }catch{}
 }
 report.claudeProcess=await active.app.evaluate(()=>({...globalThis.__claudeWitnessRuns}))
 report.reportedUsd=await active.app.evaluate(()=>globalThis.__claudeWitnessReportedUsd)
 assert.equal(state.errorCode,null,String(state.errorCode))
 assert.equal(state.context.providerId,'claude-code')
 assert.equal(state.context.projectId,'claude-witness')
 assert.equal(state.context.initiativeId,'initiative-claude-proof')
 assert.equal(state.turn?.phase,'completed')
 assert.equal(state.recovery.stop,'clear')
 assert.deepEqual(report.claudeProcess,{started:1,closed:1})
 pass('Un tour Claude Code arrêté et attribué au projet et à l’initiative')
 const durable=(await page.evaluate(()=>window.madness.readState())).value.state
 const saved=durable.conversations.find(c=>c.id===state.context.conversationId)
 const answer=saved?.messages.find(m=>m.role==='assistant')?.text
 assert.ok(answer&&/\bMary\b/i.test(answer)&&/analyst/i.test(answer),'RESPONSE_DOES_NOT_ESTABLISH_MARY')
 report.answer={bytes:Buffer.byteLength(answer),sha256:sha256(answer),mary:true,analyst:true}
 assert.deepEqual(durable.conversations.find(c=>c.id===original.id),original)
 assert.deepEqual(durable.drafts,seed.drafts)
 assert.deepEqual(await inventory(project),sources)
 pass('Source Mary reconnue, historique Codex et brouillon conservés, fichiers exacts')
 await waitForPageCondition(page,()=>document.querySelector('#conversation-heading')?.textContent.includes('Claude Code'))
 pass('Ouverture automatique de la réponse et provenance visibles dans la conversation')
 await stop()
 const stored=JSON.parse(await readFile(join(profile,'madness-state-v1.json'),'utf8'))
 const storedConversation=stored.conversations.find(c=>c.id===saved.id)
 assert.deepEqual(storedConversation?.context,saved.context,'CLAUDE_CONTEXT_ON_DISK')
 assert.deepEqual(storedConversation?.messages,saved.messages,'CLAUDE_MESSAGES_ON_DISK')
 page=await launch(profile,2)
 await (await enterProject(page)).click()
 assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle')
 assert.deepEqual(await active.app.evaluate(()=>({...globalThis.__claudeWitnessRuns})),{started:0,closed:0})
 const reopened=(await page.evaluate(()=>window.madness.readState())).value.state
 const restored=reopened.conversations.find(c=>c.id===saved.id)
 assert.ok(restored,'CLAUDE_CONVERSATION_RESTORED')
 assert.deepEqual(restored.context,saved.context,'CLAUDE_CONTEXT_RESTORED')
 assert.deepEqual(restored.messages,saved.messages,'CLAUDE_MESSAGES_RESTORED')
 assert.ok(['idle','unknown'].includes(restored.lastKnownActivity),'RESTORE_STAYS_PASSIVE')
 assert.deepEqual(reopened.drafts,seed.drafts,'CLAUDE_DRAFT_RESTORED')
 await waitForPageCondition(page,()=>document.querySelector('#conversation-heading')?.textContent.includes('Claude Code'))
 pass('Réouverture passive du résultat, attribution exacte, aucun nouveau tour')
 await stop()
 }
 report.runtimeSha256=sha256(await readFile(join(repository,'out/main/index.js')))
 report.status='passed'
}catch(error){
 report.failure={name:error.name,message:String(error.message).split('\n')[0].slice(0,180)}
 process.exitCode=1
}finally{
 try{await stop()}catch{allowCleanup=false;process.exitCode=1}
 if(root&&allowCleanup&&!active){
  await noLinks(root)
  assert.ok(samePath(dirname(root),await realpath(tmpdir()))&&/^madness-claude-live-[A-Za-z0-9]+$/.test(basename(root)))
  const items=await readdir(root,{recursive:true,withFileTypes:true})
  assert.ok(items.every(item=>!item.isSymbolicLink()),'REPARSE_REFUSED')
  await rm(root,{recursive:true,force:true,maxRetries:3})
  report.cleanup=true
 }
 await writeFile(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n')
 console.log(JSON.stringify(report))
}
