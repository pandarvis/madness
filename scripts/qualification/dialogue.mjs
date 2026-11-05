import {waitForPageCondition} from './page-condition-wait.mjs'
import assert from 'node:assert/strict'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, writeFile, readFile, realpath, lstat, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname, basename } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
const require = createRequire(import.meta.url)
const repository = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const output = join(repository, '_bmad-output/initiative-madness/qualification-dialogue-local')
const packaged = process.argv.includes('--packaged')
const capture = !process.argv.includes('--no-captures')
const arg = process.argv.find(value => value.startsWith('--executable='))
const executable = arg ? resolve(arg.slice('--executable='.length)) : packaged ? join(repository, 'dist/dialogue-pilot/win-unpacked/Madness.exe') : require('electron')
const report = { schemaVersion:1, observedAt:new Date().toISOString(), mode:'isolated-no-provider',status:'partial',checks:[],captures:[],cleanup:false,liveProof:'missing',limits:['Le paquet isolé utilise uniquement des historiques synthétiques, aucun compte ni modèle.','L’essai réel Mary et réponse libre est une preuve distincte.','Anciennes qualifications et gates distribuables inchangés.'] }
let running, root
const pass = name => report.checks.push(name)
async function stop() { if (!running) return; const child=running.process(); await running.close(); assert.notEqual(child.exitCode,null);running=undefined }
async function launch(profile) {
  const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH']
  const env=Object.fromEntries(Object.entries(process.env).filter(([name])=>allowed.includes(name.toUpperCase())))
  running=await electron.launch({executablePath:executable,args:packaged?[]:[repository],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000})
  const page=await running.firstWindow();await page.waitForFunction(()=>!!window.madnessDialogue)
  await waitForPageCondition(page,async()=>(await window.madness.readState()).ok)
  await running.evaluate(({session})=>{globalThis.__dialogueRequests=0;session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>{globalThis.__dialogueRequests++;callback({cancel:true})})})
  return page
}
try {
  await mkdir(output,{recursive:true});root=await realpath(await mkdtemp(join(tmpdir(),'madness-dialogue-')))
  const project=join(root,'projet-bmad-absent'),profile=join(root,'profile');await mkdir(project);await mkdir(profile)
  await writeFile(join(project,'temoin.txt'),'Projet inchangé.\n')
  const context={projectId:'project-1',initiativeId:'initiative-test',conversationId:'conversation-1',providerId:'codex',connectionId:'historical-account'}
  const snapshot={schemaVersion:1,revision:3,projects:[{id:'project-1',name:'Projet témoin',rootPath:project,openedAt:new Date().toISOString()}],activeProjectId:'project-1',drafts:[{projectId:'project-1',text:'Brouillon conservé, sans envoi.',savedAt:new Date().toISOString()}],preferences:{navigationCollapsed:false},conversations:[{id:'conversation-1',context,lastKnownActivity:'running',messages:[{id:'u-1',role:'user',text:'Question historique synthétique.'},{id:'a-1',role:'assistant',text:'Réponse historique synthétique de Mary.'}]}]}
  await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify(snapshot))
  let page=await launch(profile)
  assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle')
  assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.conversations[0].lastKnownActivity,'unknown')
  pass('reopen-historical-running-becomes-unknown-no-engine')
  await page.getByRole('tab',{name:'Conversation',exact:true}).click()
  assert.equal(await page.getByText('Réponse historique synthétique de Mary.',{exact:true}).isVisible(),true)
  assert.equal(await page.locator('#draft').inputValue(),'Brouillon conservé, sans envoi.')
  await page.getByRole('tab',{name:'Parcours',exact:true}).click()
  assert.equal(await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).isDisabled(),true)
  pass('history-draft-and-missing-account-explained')
  await page.getByRole('button',{name:'Vérifier ce projet',exact:true}).click()
  await waitForPageCondition(page,async()=>(await window.madnessDialogue.read()).errorCode==='PROFILE_ABSENT')
  await page.getByRole('alert').filter({hasText:'Les fichiers BMad nécessaires'}).waitFor()
  assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.conversations.length,1)
  assert.equal(await running.evaluate(()=>globalThis.__dialogueRequests),0)
  pass('missing-agent-blocks-before-provider-and-new-conversation')
  const invalid=await page.evaluate(()=>window.madnessDialogue.send('project-1','conversation-1',' '));assert.equal(invalid.errorCode,'INVALID_COMMAND')
  const wrong=await page.evaluate(()=>window.madnessDialogue.send('foreign-project','conversation-1','Ne pas envoyer'));assert.equal(wrong.errorCode,'CONTEXT_MISMATCH')
  pass('empty-and-foreign-context-rejected')
  const foreign=await running.evaluate(async({BrowserWindow,app},preload)=>{const other=new BrowserWindow({show:false,webPreferences:{preload,contextIsolation:true,nodeIntegration:false,sandbox:true}});try{await other.loadURL('madness://app/index.html');return await other.webContents.executeJavaScript('window.madnessDialogue.launch("project-1")')}finally{other.destroy()}},packaged?join(await running.evaluate(({app})=>app.getAppPath()),'out/preload/index.js'):join(repository,'out/preload/index.js'))
  assert.equal(foreign.errorCode,'UNTRUSTED_CALLER');pass('foreign-window-rejected')
  await page.getByRole('tab',{name:'Conversation',exact:true}).click()
  await page.locator('#draft').fill('Brouillon du pilote après navigation.')
  await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click()
  await waitForPageCondition(page,async()=>(await window.madness.readState()).value.state.drafts[0].text==='Brouillon du pilote après navigation.')
  await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click()
  assert.equal(await page.locator('#draft').inputValue(),'Brouillon du pilote après navigation.')
  pass('draft-explicit-save-and-collapse-preserve-input')
  for(const size of [{width:1320,height:860,name:'desktop'},{width:600,height:800,name:'compact'}]) {
    await running.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
    if(capture){const filename='isolated-'+size.name+'.png';await page.screenshot({path:join(output,filename)});report.captures.push(filename)}
  }
  pass('desktop-and-compact-no-horizontal-overflow')
  await stop();page=await launch(profile)
  assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle')
  assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.drafts[0].text,'Brouillon du pilote après navigation.')
  assert.equal(await running.evaluate(()=>globalThis.__dialogueRequests),0)
  assert.equal(await readFile(join(project,'temoin.txt'),'utf8'),'Projet inchangé.\n')
  pass('second-reopen-durable-history-draft-no-network-project-unchanged')
  report.runtime=await running.evaluate(({app})=>({electron:process.versions.electron,chromium:process.versions.chrome,packaged:app.isPackaged}))
  const artifact=packaged?join(dirname(executable),'resources/app.asar'):join(repository,'out/main/index.js')
  report.artifact={file:packaged?'resources/app.asar':'out/main/index.js',sha256:createHash('sha256').update(await readFile(artifact)).digest('hex')}
  report.status='isolated-checks-passed-live-missing'
} catch(error) { report.failure=error instanceof Error?error.message.slice(0,500):'unknown';process.exitCode=1 }
finally {
  try{await stop()}catch{report.status='partial';report.failure='owned-process-stop-unconfirmed';process.exitCode=1}
  if(root&&!running){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)===base&&/^madness-dialogue-[a-zA-Z0-9]+$/.test(basename(actual))&&!(await lstat(root)).isSymbolicLink()){await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}}
  await writeFile(join(output,packaged?'packaged-profile.json':'profile.json'),JSON.stringify(report,null,2)+'\n')
  console.log(`Dialogue : ${report.status} ; ${report.checks.length} contrôles ; nettoyage ${report.cleanup}.`)
}
