import assert from 'node:assert/strict'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, readFile, rm, writeFile, realpath, lstat, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { childEnvironment } from './windows.mjs'
const require = createRequire(import.meta.url)
const repository = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const output = join(repository, '_bmad-output/initiative-madness/qualification-theme')
const explicit = process.argv.find(value => value.startsWith('--executable='))
const report = { observedAt: new Date().toISOString(), status: 'partial', checks: {}, contrasts: {}, screenshots: [], cleanup: false, limits: ['Données témoins sans compte ; aucun agent, OAuth ni réseau fournisseur lancé.', 'Contrastes calculés et clavier ciblé ; aucun audit WCAG complet ni lecteur d’écran.', 'Aucune acceptation visuelle humaine ni installation.'] }
const passed = key => { report.checks[key] = true }
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
let root, base, running
async function stop() {
  if (!running) return
  const owned = running, child = owned.process()
  try { await owned.close() } finally { if (child.exitCode !== null) running = undefined }
  assert.notEqual(child.exitCode, null, 'Arrêt du processus témoin confirmé')
}
async function launch(profile) {
  assert.equal(running, undefined)
  running = await electron.launch({ executablePath: explicit ? resolve(explicit.slice(13)) : require('electron'), args: explicit ? [] : [repository], cwd: repository, env: childEnvironment(process.env, profile), timeout: 30000 })
  const page = await running.firstWindow()
  await page.waitForFunction(() => document.querySelector('.open-project')?.matches(':enabled'))
  assert.equal(resolve(await running.evaluate(({app})=>app.getPath('userData'))),resolve(profile))
  assert.equal(await page.evaluate(()=>location.href),'madness://app/index.html')
  await running.evaluate(({BrowserWindow})=>{
    const w=BrowserWindow.getAllWindows()[0],setOverlay=w.setTitleBarOverlay.bind(w)
    w.setTitleBarOverlay=options=>{setOverlay(options);w.qualificationOverlay=options;w.qualificationOverlayCalls=(w.qualificationOverlayCalls??0)+1}
  })
  return page
}
async function nativeState(page, theme) {
  const state = await running.evaluate(({BrowserWindow,nativeTheme})=>{
    const w=BrowserWindow.getAllWindows()[0], prefs=w.webContents.getLastWebPreferences()
    return { background:w.getBackgroundColor(),theme:nativeTheme.themeSource,overlay:w.qualificationOverlay??null,args:prefs.additionalArguments }
  })
  const colors=theme==='dark'?['#211f1e','#f1ebe6']:['#ffffff','#29282e']
  assert.equal(state.background.toLowerCase(),colors[0]);assert.equal(state.theme,theme)
  // Electron n’expose aucun getter de couleur overlay : observer les vrais appels du setter après amorçage.
  if(state.overlay){assert.equal(state.overlay.color.toLowerCase(),colors[0]);assert.equal(state.overlay.symbolColor.toLowerCase(),colors[1]);assert.equal(state.overlay.height,56)}
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme)
  assert.equal(await page.locator('.topbar').evaluate(element=>getComputedStyle(element).backgroundColor),theme==='dark'?'rgb(33, 31, 30)':'rgb(255, 255, 255)')
  const area=await page.evaluate(()=>{const overlay=navigator.windowControlsOverlay,r=overlay.getTitlebarAreaRect();return {visible:overlay.visible,x:r.x,y:r.y,width:r.width,height:r.height,viewport:innerWidth}})
  assert.equal(area.visible,true);assert.ok(area.width>0&&area.width<area.viewport)
  const bounds=await page.locator('.topbar').boundingBox()
  assert.equal(Math.round(bounds.width),Math.round(area.width));assert.equal(Math.round(bounds.height),56)
  for(const button of await page.locator('.topbar button').all())if(await button.isVisible()){
    const box=await button.boundingBox();assert.ok(box.x>=area.x&&box.x+box.width<=area.x+area.width+1)
    assert.equal(await button.evaluate(element=>getComputedStyle(element).getPropertyValue('app-region')),'no-drag')
  }
}
async function unbootstrappedCanvas(page, theme) {
  const canvas=await page.evaluate(()=>{
    const html=document.documentElement,root=document.getElementById('root')
    const previousTheme=html.getAttribute('data-theme'),previousHidden=root.hidden
    try {
      root.hidden=true;html.removeAttribute('data-theme')
      const style=getComputedStyle(html)
      return {theme:html.getAttribute('data-theme'),rootDisplay:getComputedStyle(root).display,background:style.backgroundColor,colorScheme:style.colorScheme,bodyBackground:getComputedStyle(document.body).backgroundColor}
    } finally {
      if(previousTheme===null)html.removeAttribute('data-theme');else html.setAttribute('data-theme',previousTheme)
      root.hidden=previousHidden
    }
  })
  assert.deepEqual(canvas,{theme:null,rootDisplay:'none',background:'rgba(0, 0, 0, 0)',colorScheme:'normal',bodyBackground:'rgba(0, 0, 0, 0)'})
  // Le canevas et le body transparents laissent apparaître le fond natif courant.
  await nativeState(page,theme)
  passed('unbootstrapped-canvas-'+theme)
}
function luminance(hex) {
  const channels=hex.replace('#','').match(/../g).map(value=>parseInt(value,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]
}
async function contrast(page, theme) {
  const tokens=await page.evaluate(()=>{
    const style=getComputedStyle(document.documentElement)
    const names=['surface','navigation','panel','text','muted','muted-lavender','accent','accent-hover','accent-active','accent-text','accent-soft','selected','selected-text','neutral','neutral-text','error','error-text','success','success-text','waiting','waiting-text','link','focus','selection','selection-text','control-line','tooltip','tooltip-text','recommendation']
    return Object.fromEntries(names.map(name=>[name,style.getPropertyValue('--'+name).trim().replace(/^#fff$/,'#ffffff')]))
  })
  const pairs=[]
  for(const background of ['surface','navigation','panel','recommendation'])for(const foreground of ['text','muted','muted-lavender'])pairs.push([foreground,background,4.5])
  for(const background of ['accent','accent-hover','accent-active'])pairs.push(['accent-text',background,4.5])
  for(const [foreground,background] of [['selected-text','selected'],['selected-text','accent-soft'],['neutral-text','neutral'],['error-text','error'],['success-text','success'],['waiting-text','waiting'],['selection-text','selection'],['tooltip-text','tooltip']])pairs.push([foreground,background,4.5])
  for(const background of ['surface','navigation','panel']){pairs.push(['link',background,4.5]);pairs.push(['focus',background,3]);pairs.push(['control-line',background,3])}
  report.contrasts[theme]=pairs.map(([foreground,background,minimum])=>{
    const a=luminance(tokens[foreground]),b=luminance(tokens[background]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05)
    assert.ok(ratio>=minimum,`${theme} ${foreground}/${background} : ${ratio.toFixed(2)} < ${minimum}`)
    return {foreground,background,ratio:Number(ratio.toFixed(2)),minimum}
  })
}
async function size(page,width,height) {
  await running.evaluate(({BrowserWindow},bounds)=>BrowserWindow.getAllWindows()[0].setContentSize(bounds.width,bounds.height),{width,height})
  await page.waitForFunction(width=>innerWidth===width&&navigator.windowControlsOverlay.getTitlebarAreaRect().width>0,width)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
}
async function capture(page,name) {
  if(process.argv.includes('--skip-screenshots'))return
  // Montrer entièrement le texte et le brouillon sans modifier la composition produit.
  await page.locator('main').evaluate(element=>{element.scrollTop=element.scrollHeight})
  await page.mouse.move(1,Math.max(100,(await page.viewportSize())?.height??100))
  await page.keyboard.press('Escape')
  await running.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.show();w.focus()})
  const native=await running.evaluate(async({BrowserWindow,desktopCapturer,screen})=>{
    const w=BrowserWindow.getAllWindows()[0],bounds=w.getBounds(),scale=screen.getDisplayMatching(bounds).scaleFactor
    const sources=await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:Math.ceil(bounds.width*scale),height:Math.ceil(bounds.height*scale)},fetchWindowIcons:false})
    const owned=sources.find(source=>source.id===w.getMediaSourceId())
    if(!owned||owned.thumbnail.isEmpty())throw Error('OWNED_WINDOW_CAPTURE_UNAVAILABLE')
    return owned.thumbnail.toPNG().toString('base64')
  })
  await writeFile(join(output,'native-'+name+'.png'),Buffer.from(native,'base64'))
  report.screenshots.push('native-'+name+'.png')
}
async function main() {
  try {
    assert.equal(process.platform,'win32');base=await realpath(tmpdir());root=await realpath(await mkdtemp(join(base,'madness-theme-')))
    const profile=join(root,'profile'),project=join(root,'Projet témoin')
    await mkdir(profile);await mkdir(project);await mkdir(output,{recursive:true})
    let page=await launch(profile)
    report.runtime=await running.evaluate(({app})=>({packaged:app.isPackaged,electron:process.versions.electron,chromium:process.versions.chrome}))
    assert.deepEqual(await page.evaluate(()=>window.madnessAppearance.initial),{theme:'dark',warning:null})
    await nativeState(page,'dark');await unbootstrappedCanvas(page,'dark');await contrast(page,'dark');passed('fresh-dark-native-and-renderer')
    await running.evaluate(({dialog},selected)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[selected]})},project)
    await page.getByRole('button',{name:'Ouvrir un projet',exact:true}).click()
    await page.getByRole('heading',{name:'Projet témoin',exact:true}).waitFor()
    await page.getByLabel('Brouillon pour Projet témoin').fill('Brouillon témoin — conservé avec le thème.')
    await page.getByRole('button',{name:'Enregistrer le brouillon',exact:true}).click()
    await page.waitForFunction(()=>document.getElementById('draft-status')?.textContent==='Brouillon enregistré localement.')
    // Historique synthétique strict, sans identité ni connexion enregistrée.
    const snapshotPath=join(profile,'madness-state-v1.json')
    const snapshot=JSON.parse(await readFile(snapshotPath,'utf8')),projectId=snapshot.activeProjectId
    snapshot.conversations=[{id:'conversation-theme',context:{projectId,initiativeId:'initiative-temoin',conversationId:'conversation-theme',providerId:'codex',connectionId:'compte-temoin-absent'},lastKnownActivity:'idle',messages:[{id:'message-theme',role:'assistant',text:'Historique témoin pour vérifier la lisibilité. Aucun agent n’a été lancé.'}]}]
    await stop();await writeFile(snapshotPath,JSON.stringify(snapshot,null,2)+'\n')
    page=await launch(profile);const snapshotBytes=await readFile(snapshotPath)
    await page.getByRole('tab',{name:'Conversation',exact:true}).click()
    await page.getByText('Historique témoin pour vérifier la lisibilité. Aucun agent n’a été lancé.',{exact:true}).waitFor()
    await page.getByLabel('Brouillon pour Projet témoin').fill('Saisie témoin conservée pendant le changement de thème.')
    const control=page.getByRole('button',{name:'Passer au thème clair',exact:true})
    await control.focus();await page.keyboard.press('Enter')
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='light')
    assert.equal(await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).evaluate(element=>element===document.activeElement),true)
    assert.ok(await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).evaluate(element=>parseFloat(getComputedStyle(element).outlineWidth)*devicePixelRatio>=2))
    await nativeState(page,'light');await unbootstrappedCanvas(page,'light');await contrast(page,'light')
    assert.equal(hash(await readFile(snapshotPath)),hash(snapshotBytes));passed('theme-keyboard-keeps-snapshot-and-draft')
    const lightPreference=await readFile(join(profile,'appearance-v1.json'))
    const preferenceModified=(await stat(join(profile,'appearance-v1.json'))).mtimeMs
    const nativeCalls=await running.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].qualificationOverlayCalls)
    await page.reload()
    await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).waitFor({timeout:3000})
    await page.getByLabel('Brouillon pour Projet témoin').waitFor()
    await nativeState(page,'light')
    assert.deepEqual(await readFile(join(profile,'appearance-v1.json')),lightPreference)
    assert.equal((await stat(join(profile,'appearance-v1.json'))).mtimeMs,preferenceModified)
    assert.equal(await running.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].qualificationOverlayCalls),nativeCalls)
    assert.equal(hash(await readFile(snapshotPath)),hash(snapshotBytes))
    assert.equal(await page.getByLabel('Brouillon pour Projet témoin').inputValue(),'Brouillon témoin — conservé avec le thème.')
    passed('renderer-reload-restores-current-theme-without-writing')
    await page.getByLabel('Brouillon pour Projet témoin').fill('Saisie témoin conservée pendant le changement de thème.')
    await size(page,1320,860);await capture(page,'light-desktop')
    await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).click()
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await nativeState(page,'dark')
    await capture(page,'dark-desktop')
    await page.getByRole('button',{name:'Réduire la navigation',exact:true}).click()
    await page.waitForFunction(()=>document.querySelector('.app-shell')?.classList.contains('nav-compact'))
    assert.equal(await page.getByLabel('Brouillon pour Projet témoin').inputValue(),'Saisie témoin conservée pendant le changement de thème.')
    await size(page,600,800);await nativeState(page,'dark')
    await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click();await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).evaluate(element=>element===document.activeElement),true)
    await capture(page,'dark-compact');passed('desktop-compact-navigation-keeps-unsaved-draft')
    const appearancePath=join(profile,'appearance-v1.json'),before=await readFile(appearancePath)
    await assert.rejects(page.evaluate(()=>window.madnessAppearance.setTheme('system')))
    assert.deepEqual(await readFile(appearancePath),before);await nativeState(page,'dark');passed('invalid-enum-has-no-native-or-file-effect')
    const ordered=await page.evaluate(async()=>Promise.all([window.madnessAppearance.setTheme('light'),window.madnessAppearance.read()]))
    assert.deepEqual(ordered,[{theme:'light',warning:null},{theme:'light',warning:null}])
    await page.reload();await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).waitFor()
    await nativeState(page,'light')
    await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).click()
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await nativeState(page,'dark')
    passed('current-read-waits-for-queued-theme-change')
    const foreign=await running.evaluate(async({BrowserWindow},preload)=>{
      const w=new BrowserWindow({show:false,webPreferences:{preload,contextIsolation:true,sandbox:true,nodeIntegration:false,additionalArguments:['--madness-theme=dark']}})
      try{await w.loadURL('madness://app/index.html');return await w.webContents.executeJavaScript('Promise.all([window.madnessAppearance.read(),window.madnessAppearance.setTheme("light")].map(request=>request.then(()=>"accepted",error=>String(error))))')}
      finally{w.destroy()}
    },join(repository,'out/preload/index.js'))
    assert.equal(foreign.length,2);for(const rejection of foreign)assert.match(rejection,/UNTRUSTED_CALLER/)
    assert.deepEqual(await readFile(appearancePath),before);await nativeState(page,'dark');passed('foreign-window-rejected')
    await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='light')
    await stop();page=await launch(profile);await nativeState(page,'light')
    assert.deepEqual(await page.evaluate(()=>window.madnessAppearance.initial),{theme:'light',warning:null})
    assert.equal(await page.getByLabel('Brouillon pour Projet témoin').inputValue(),'Brouillon témoin — conservé avec le thème.')
    const restored=(await page.evaluate(()=>window.madness.readState())).value.state
    assert.equal(restored.conversations[0].messages[0].text,'Historique témoin pour vérifier la lisibilité. Aucun agent n’a été lancé.')
    assert.equal((await page.evaluate(()=>window.madnessConnection.read())).state.accountStored,false)
    assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'idle');passed('light-restored-with-history-without-engine')
    await stop();const invalid='{"schemaVersion":99,"theme":"light"}';await writeFile(appearancePath,invalid)
    page=await launch(profile);await nativeState(page,'dark')
    await page.getByRole('status').filter({hasText:'La préférence de thème ne peut pas être lue'}).waitFor()
    await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='light')
    await nativeState(page,'light');await page.getByRole('status').filter({hasText:'Le thème choisi s’applique à cette session'}).waitFor()
    await page.reload()
    await page.getByRole('status').filter({hasText:'Le thème choisi s’applique à cette session'}).waitFor({timeout:3000})
    await nativeState(page,'light')
    assert.deepEqual(await page.evaluate(()=>window.madnessAppearance.read()),{theme:'light',warning:'save-failed'})
    assert.equal(await readFile(appearancePath,'utf8'),invalid);passed('invalid-file-preserved-with-session-choice-and-warning')
    report.status=report.runtime.packaged?'packaged-theme-checks-passed':'compiled-theme-checks-passed'
  } catch(error) {
    report.failure=error instanceof Error?error.message.slice(0,800):'unknown';console.error(report.failure);process.exitCode=1
  } finally {
    try{await stop()}catch{report.failure='owned-process-stop-unconfirmed';process.exitCode=1}
    if(root&&!running)try{
      const actual=await realpath(root)
      if(dirname(actual)!==base||!/^madness-theme-[A-Za-z0-9]+$/.test(basename(actual))||(await lstat(actual)).isSymbolicLink())throw Error('UNSAFE_CLEANUP')
      await rm(actual,{recursive:true,force:true,maxRetries:3,retryDelay:200});report.cleanup=true
    }catch{report.failure='cleanup-failed';process.exitCode=1}
    if(!report.cleanup)report.status='partial'
    await mkdir(output,{recursive:true});await writeFile(join(output,explicit?'packaged-profile.json':'profile.json'),JSON.stringify(report,null,2)+'\n')
    console.log(`Thème : ${report.status} ; contrôles : ${Object.keys(report.checks).length} ; nettoyage : ${report.cleanup}.`)
  }
}
await main()
