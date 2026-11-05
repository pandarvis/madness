// One packaged Windows witness. The click is synthetic and the target is owned.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lstat,mkdir,mkdtemp,readFile,readdir,realpath,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {basename,dirname,isAbsolute,join,resolve} from 'node:path'
import {_electron as electron} from 'playwright-core'
import {emptySnapshot,isSnapshot} from '../../src/contracts/index.ts'
import {BmadInitializationStore} from '../../src/adapters/persistence/bmad-initialization-store.ts'
import {HelpOwnedRun} from '../../src/adapters/bmad/help-owned-run.ts'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {waitForPageCondition} from './page-condition-wait.mjs'
import {closeWorkspaceSession,installWorkspaceObservationRuntime,setWorkspaceViewport} from './workspace-design.mjs'

const option = key => process.argv.find(value=>value.startsWith('--'+key+'='))?.slice(key.length+3)
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const executable = option('executable'), output = option('output')
assert.equal(process.platform,'win32')
assert.ok(executable&&output&&isAbsolute(executable)&&isAbsolute(output),'--executable and --output must be absolute')
const capture = !process.argv.includes('--no-captures')
const application = await realpath(executable)
const resources = join(dirname(application),'resources')
assert.equal(basename(application).toLowerCase(),'madness.exe')
await mkdir(output)
const report = {schemaVersion:1,status:'incomplete',consent:'synthetic-fixture-only',humanAcceptance:false,
 cleanup:false,checks:[],captures:[],viewports:[],limits:['Network and app-server observed after the runtime hook.',
 'The one Windows fixture verifies its exact effects. No human or G3 acceptance is asserted.']}
const tempBase = await realpath(tmpdir()), root = await mkdtemp(join(tempBase,'madness-init-witness-'))
const profile = join(root,'profile'), target = join(root,'targets','positive'), projectId = 'initialization-witness'
let owned, launched = false, helperStopped = false
const pass = label => { report.checks.push(label); console.log(label) }
const snapshot = emptySnapshot()
const tree = async (directory,relative='') => {
 const entries = []
 for (const name of (await readdir(directory)).sort()) {
  const path = relative?relative+'/'+name:name, absolute = join(directory,name)
  const stat = await lstat(absolute)
  if (stat.isDirectory()) entries.push({path,kind:'directory'},...await tree(absolute,path))
  else {
   assert.ok(stat.isFile()&&stat.nlink===1)
   const data = await readFile(absolute)
   entries.push({path,kind:'file',bytes:data.length,sha256:sha(data)})
  }
 }
 return entries
}
const byPath = (a,b) => a.path<b.path?-1:a.path>b.path?1:0
async function shot(app,page,name) {
 if (!capture) return
 const metrics=await page.evaluate(async()=>{
  await document.fonts.ready
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
  return {width:innerWidth,height:innerHeight,scale:devicePixelRatio}
 })
 const frame=await app.evaluate(async({BrowserWindow})=>{
  const window=BrowserWindow.getAllWindows()[0]
  const image=await window.webContents.capturePage()
  return {png:image.toPNG().toString('base64'),contentSize:window.getContentSize(),zoom:window.webContents.getZoomFactor()}
 })
 const png=Buffer.from(frame.png,'base64'), pixels={width:png.readUInt32BE(16),height:png.readUInt32BE(20)}
 const scale=metrics.scale/frame.zoom
 assert.ok(Math.abs(pixels.width-frame.contentSize[0]*scale)<=2,'Capture width does not cover the native window')
 assert.ok(Math.abs(pixels.height-frame.contentSize[1]*scale)<=2,'Capture height does not cover the native window')
 const path=join(output,name+'.png')
 await writeFile(path,png,{flag:'wx'})
 report.captures.push({file:basename(path),sha256:sha(png),pixels,metrics,zoom:frame.zoom,method:'native capturePage without rectangle'})
}
try {
 report.asarSha256 = sha(await readFile(join(resources,'app.asar')))
 report.resourceSha256 = sha(await readFile(join(resources,'bmad-init','payload-v1.json.gz')))
 await mkdir(join(target,'code'),{recursive:true})
 await mkdir(profile)
 await writeFile(join(target,'README.md'),'README du témoin.\n')
 await writeFile(join(target,'code','sentinel.txt'),'Sentinelle conservée.\n')
 snapshot.projects.push({id:projectId,name:'positive',rootPath:target,openedAt:new Date().toISOString()})
 snapshot.drafts.push({projectId,text:'Brouillon du témoin conservé.',savedAt:new Date().toISOString()})
 assert.ok(isSnapshot(snapshot))
 await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify(snapshot)+'\n')
 const before = await tree(target)
 const env = Object.fromEntries(Object.entries(process.env).filter(([key])=>
  ['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH'].includes(key.toUpperCase())))
 launched = true
 const app = await electron.launch({executablePath:application,args:[],cwd:root,env:{...env,MADNESS_DATA_HOME:profile,
  APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata')},timeout:30000})
 owned = {app,child:app.process(),closeObserved:false}
 app.once('close',()=>owned.closeObserved=true)
 const runtime=await app.evaluate(({app})=>({pid:process.pid,path:app.getPath('userData'),executable:process.execPath}))
 owned.main=await windowsOwnedProcesses.read(runtime.pid)
 assert.ok(owned.main)
 assert.equal(resolve(owned.main.executable).toLowerCase(),application.toLowerCase())
 assert.equal(resolve(runtime.executable).toLowerCase(),application.toLowerCase())
 assert.equal(resolve(runtime.path),profile)
 owned.observationPath=join(output,'native-observation.json')
 const observer=await app.evaluate(installWorkspaceObservationRuntime,owned.observationPath)
 owned.observationStartedAt=observer.startedAt
 assert.equal(observer.attached,true)
 const page=await app.firstWindow()
 page.setDefaultTimeout(30000)
 await page.waitForFunction(()=>!!window.madnessBmadInitialization&&!!document.querySelector('main'))
 await page.waitForFunction(()=>document.documentElement.lang==='fr'&&document.documentElement.dataset.theme==='dark')
 await page.locator('.sidebar .project-link').first().click()
 await page.getByRole('heading',{name:'positive',exact:true}).waitFor()
 const entry=page.getByRole('button',{name:'Voir le diagnostic',exact:true})
 await entry.click()
 const drawer=page.locator('#project-context-panel')
 await drawer.getByRole('heading',{name:'Diagnostic et initialisation',exact:true}).waitFor()
 await drawer.getByRole('button',{name:'Actualiser le diagnostic',exact:true}).click()
 await drawer.getByRole('button',{name:'Préparer l’initialisation',exact:true}).click()
 const open=drawer.getByRole('button',{name:'Ouvrir la décision',exact:true})
 await open.waitFor()
 const state = await page.evaluate(async projectId=>(await window.madnessBmadInitialization.request({type:'read',projectId})).state,projectId)
 const operation = state.operations.at(-1)
 assert.equal(operation.phase,'ready')
 const plan = operation.plan
 assert.equal(plan.additions.length,588)
 assert.equal(plan.identity.rootPath.toLowerCase(),target.toLowerCase())
 assert.deepEqual(await tree(target),before)
 assert.deepEqual([...plan.preserved].sort(byPath),[...before].sort(byPath))
 const config = plan.additions.find(entry=>entry.path==='_bmad/config.toml')
 assert.equal(config.sha256,'e6d0012ed0c41293542422fbcc91577b1b3c73261ee25084b70eced90d5df26c')
 assert.equal(config.bytes,82)
 pass('P1: displayed exact plan, 588 additions and untouched target')
 if(capture) {
  report.viewports.push(await setWorkspaceViewport(app,page,{width:1320,height:860}))
  await drawer.getByRole('heading',{name:'Diagnostic et initialisation',exact:true}).evaluate(heading=>heading.scrollIntoView({block:'start'}))
  await shot(app,page,'plan-fr-dark')
 }
 await open.click()
 const dialog = page.getByRole('dialog',{name:'Plan d’initialisation',exact:true})
 await dialog.waitFor()
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'initialization-decision-title')
 await dialog.getByText(plan.id,{exact:true}).first().waitFor()
 await dialog.locator('summary').filter({hasText:'Voir tous les ajouts'}).click()
 const preview = dialog.getByRole('button',{name:'Voir le contenu prévu · _bmad/config.toml',exact:true})
 await preview.click()
 const content = await dialog.locator('pre[aria-label="_bmad/config.toml"]').textContent()
 assert.equal(sha(Buffer.from(content)),config.sha256)
 assert.ok(await dialog.evaluate(node=>{
  const close=node.querySelector('header button')?.getBoundingClientRect(), bounds=node.getBoundingClientRect()
  return !!close&&close.top>=bounds.top&&close.bottom<=bounds.bottom
 }),'Decision close remains visible after scrolling its inventory')
 await dialog.locator('summary').filter({hasText:'Voir tous les ajouts'}).click()
 pass('P2: same identity, focus on the neutral title and exact configuration preview')
 await shot(app,page,'decision-fr-dark')
 await dialog.getByRole('button',{name:'Initialiser BMad',exact:true}).click()
 await drawer.getByText('Ajouts vérifiés selon le plan',{exact:true}).waitFor({timeout:120000})
 const after = await tree(target)
 const manifest = plan.additions.map(({contentId,...entry})=>entry)
 assert.deepEqual([...after].sort(byPath),[...before,...manifest].sort(byPath))
 await waitForPageCondition(page,async ({projectId,attemptId})=>(await window.madnessBmadInitialization.request({
  type:'read',projectId
 })).state.operations.some(op=>op.attemptId===attemptId&&op.result.outcome==='verified'&&op.preservation.status==='stored'),
 {projectId,attemptId:operation.attemptId})
 const records = await new BmadInitializationStore(join(profile,'bmad-initialization-v1')).list()
 const saved = records.find(record=>record.attemptId===operation.attemptId)
 assert.equal(saved.result.outcome,'verified')
 assert.equal(saved.result.receipt.unionVerified,true)
 assert.equal(saved.result.receipt.preservedVerified,true)
 assert.equal(saved.result.receipt.observedAdditions.length,588)
 report.plan={id:plan.id,revision:plan.revision,configurationSha256:config.sha256,additions:manifest.length}
 report.before={entries:before.length,sha256:sha(JSON.stringify([...before].sort(byPath)))}
 report.after={entries:after.length,sha256:sha(JSON.stringify([...after].sort(byPath)))}
 report.result={outcome:saved.result.outcome,stop:saved.stop,durableRevision:saved.revision,exactUnion:true}
 pass('P3: exclusive additions, final exhaustive union and matching durable receipt')
 if(capture) {
  await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click()
  await page.getByRole('button',{name:'Switch interface to English',exact:true}).click()
  await page.waitForFunction(()=>document.documentElement.lang==='en'&&document.documentElement.dataset.theme==='light')
  report.viewports.push(await setWorkspaceViewport(app,page,{width:1320,height:860}))
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(2))
  await page.waitForFunction(()=>Math.abs(innerWidth-660)<=1)
  await drawer.getByRole('button',{name:'Return to work',exact:true}).click()
  await page.getByRole('button',{name:'View result',exact:true}).click()
  const verdict=drawer.getByRole('heading',{name:'Additions verified against the plan',exact:true})
  await verdict.waitFor()
  assert.ok(await verdict.evaluate(node=>document.activeElement===node),'View result focuses the verified verdict')
  report.zoom=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scale:devicePixelRatio,language:document.documentElement.lang}))
  await shot(app,page,'result-light-zoom-200')
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(1))
 }
 await drawer.getByRole('button',{name:/Revenir au travail|Return to work/}).click()
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.equal(await page.locator('#draft').inputValue(),snapshot.drafts[0].text)
 pass('Return to the same project preserves its draft')
 report.status='verified'
} catch (error) {
 report.error=String(error?.stack??error)
 throw error
} finally {
 if(owned){
  try {
   report.closure=await closeWorkspaceSession(owned)
   helperStopped=await new HelpOwnedRun(join(profile,'bmad-help-owned-v1.json')).status()==='stopped'
   report.helperStopped=helperStopped
  } catch(error){report.closeFailure=String(error)}
 }
 const safe=(!launched||report.closure?.cleanupSafe===true&&helperStopped)&&dirname(root)===tempBase&&basename(root).startsWith('madness-init-witness-')
 if(safe){await rm(root,{recursive:true,force:true});report.cleanup=true}
 else report.ownedTargetRetained=root
 if(report.status==='verified'&&(!report.cleanup||report.closure?.closeError||report.closure?.observation.network!==0)) report.status='closure-unconfirmed'
 await writeFile(join(output,'receipt.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'})
}
assert.equal(report.status,'verified')
console.log(JSON.stringify({status:report.status,checks:report.checks.length,cleanup:report.cleanup}))
