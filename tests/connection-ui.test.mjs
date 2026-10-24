import assert from 'node:assert/strict'
import { test, before, after } from 'node:test'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const repository = fileURLToPath(new URL('../', import.meta.url))
let root, app, page, bundle
before(async () => {
  // Seulement le renderer source : aucun build Main/paquet, réseau ou fournisseur.
  const result = await build({ root: repository, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [react(), { name: 'connection-ui-fixture', resolveId: (id) => id === 'connection-ui-fixture' || id.replaceAll('\\', '/').endsWith('/connection-ui-fixture') ? '\0connection-ui-fixture' : undefined, load: (id) => id === '\0connection-ui-fixture' ? `import {createElement} from 'react'; import {createRoot} from 'react-dom/client'; import {App} from ${JSON.stringify(join(repository, 'src/renderer/src/App.tsx').replaceAll('\\', '/'))}; createRoot(document.getElementById('root')).render(createElement(App));` : undefined }], build: { write: false, minify: false, lib: { entry: 'connection-ui-fixture', formats: ['iife'], name: 'ConnectionUIFixture' } } })
  bundle = (Array.isArray(result) ? result[0] : result).output.find((output) => output.type === 'chunk').code
  root = await realpath(await mkdtemp(join(tmpdir(), 'madness-ui-review-')))
  await writeFile(join(root, 'main.cjs'), `const {app,BrowserWindow,session}=require('electron'); app.setPath('userData',${JSON.stringify(join(root, 'profile'))}); app.whenReady().then(()=>{session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true})); const w=new BrowserWindow({show:false,width:600,height:800,webPreferences:{preload:${JSON.stringify(join(root, 'preload.cjs'))},contextIsolation:true,sandbox:true,nodeIntegration:false}});w.loadFile(${JSON.stringify(join(root, 'index.html'))});});`)
  await writeFile(join(root, 'index.html'), '<!doctype html><html lang="fr"><meta charset="utf-8"><div id="root"></div></html>')
  await writeFile(join(root, 'preload.cjs'), `const {contextBridge}=require('electron');
    let appearanceFailure=false;contextBridge.exposeInMainWorld('madnessAppearance',{initial:{theme:'dark',warning:null},setTheme:async(theme)=>{if(appearanceFailure==='bridge')throw Error('BRIDGE_UNAVAILABLE');return {theme,warning:appearanceFailure?'save-failed':null}}});
    let state={contractVersion:1,sequence:0,status:'disconnected',accountStored:false,verifiedAt:null,errorCode:null,cliVersion:null,needsPlanAcknowledgement:false}, listeners=[],supportCalls=[],supportFailure=null,supportDeferred=false,finishSupport=null,verifies=0;
    const reply=()=>Promise.resolve({contractVersion:1,correlationId:'ui-fixture',state});
    const support=async(action)=>{supportCalls.push(action);if(supportFailure===action)throw Error('PUBLIC_KEYS_SUPPORT_FAILED');if(supportDeferred)await new Promise(resolve=>{finishSupport=resolve});return reply()};
    let snapshot={schemaVersion:1,revision:0,projects:[],activeProjectId:null,drafts:[],preferences:{navigationCollapsed:false},conversations:[],capabilities:{codex:{available:false,reasonKey:'codex.unqualified'}},lifecycle:'idle'}, stateListeners=[];
    const appReply=()=>Promise.resolve({ok:true,contractVersion:1,correlationId:'ui-fixture',value:{state:snapshot,effect:'read'}});
    contextBridge.exposeInMainWorld('madness',{readState:appReply,onStateChanged:listener=>{stateListeners.push(listener);return()=>{}},selectProject:async(projectId)=>{snapshot={...snapshot,revision:snapshot.revision+1,activeProjectId:projectId};return appReply()},saveDraft:async(projectId,text)=>{snapshot={...snapshot,revision:snapshot.revision+1,drafts:[{projectId,text,savedAt:new Date().toISOString()}]};return appReply()},setNavigation:async(collapsed)=>{snapshot={...snapshot,revision:snapshot.revision+1,preferences:{navigationCollapsed:collapsed}};return appReply()}});
    let dialogue={contractVersion:1,sequence:0,status:'idle',context:{projectId:null,initiativeId:null,conversationId:null,providerId:null,connectionId:null},invocation:'$bmad-agent-analyst',profile:null,acknowledged:false,errorCode:null,activities:[]},dialogueListeners=[],sent=[],unknownOnStop=false;
    const notifyDialogue=()=>dialogueListeners.forEach(listener=>listener(dialogue));
    contextBridge.exposeInMainWorld('madnessDialogue',{read:()=>Promise.resolve(dialogue),qualify:async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'qualified',context:{...dialogue.context,projectId}};notifyDialogue();return dialogue},launch:async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',acknowledged:true,context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-1',providerId:'codex',connectionId:'account-1'},activities:['Tour terminé']};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[{id:'conversation-1',context:dialogue.context,lastKnownActivity:'idle',messages:[{id:'hello',role:'assistant',text:'📊 Bonjour, je suis Mary. Voici mon menu.'}]}]};stateListeners.forEach(listener=>listener({}));notifyDialogue();return dialogue},send:async(projectId,conversationId,text)=>{sent.push({projectId,conversationId,text});dialogue={...dialogue,sequence:dialogue.sequence+1,status:'running',acknowledged:true};notifyDialogue();return dialogue},stop:async()=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:unknownOnStop?'unknown':'stopped',errorCode:unknownOnStop?'STOP_UNCONFIRMED':null};notifyDialogue();return dialogue},onChanged:listener=>{dialogueListeners.push(listener);return()=>{}}});
    contextBridge.exposeInMainWorld('madnessConnection',{read:reply,connect:reply,verify:()=>{verifies++;return reply()},cancel:reply,disconnect:reply,manageUsage:reply,openPublicKeys:()=>support('openPublicKeys'),copyPublicKeys:()=>support('copyPublicKeys'),acknowledgePlan:()=>{state={...state,sequence:state.sequence+1,status:'error',errorCode:'VAULT_UNREADABLE'};listeners.forEach(listener=>listener(state));return reply()},onChanged:listener=>{listeners.push(listener);return()=>{listeners=listeners.filter(value=>value!==listener)}}});
    contextBridge.exposeInMainWorld('connectionUIFixture',{failAppearance:value=>{appearanceFailure=value},setState:value=>{state={...state,...value,sequence:state.sequence+1};listeners.forEach(listener=>listener(state))},setSnapshot:value=>{snapshot={...snapshot,...value};stateListeners.forEach(listener=>listener({}))},sent:()=>sent,unknownOnStop:()=>{unknownOnStop=true},supportCalls:()=>supportCalls,verifies:()=>verifies,failSupport:action=>{supportFailure=action},deferSupport:()=>{supportDeferred=true},finishSupport:()=>{supportDeferred=false;finishSupport?.()}});
  `)
})
after(async () => { if (app) await app.close(); if (root) await rm(root, { recursive: true, force: true }) })
async function launch(state = {}) {
  if (app) { await app.close(); app = null }
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP'].includes(key.toUpperCase())))
  app = await electron.launch({ executablePath: require('electron'), args: [join(root, 'main.cjs')], env: { ...env, APPDATA: join(root, 'appdata'), LOCALAPPDATA: join(root, 'localappdata') }, timeout: 30000 })
  page = await app.firstWindow()
  await page.waitForFunction(() => !!window.connectionUIFixture)
  await page.evaluate((value) => window.connectionUIFixture.setState(value), state)
  await page.addStyleTag({ content: await readFile(join(repository, 'src/renderer/src/styles.css'), 'utf8') })
  await page.addScriptTag({ content: bundle })
  await page.getByRole('heading', { name: 'Vos projets, au même endroit', exact: true }).waitFor()
}
test('le thème change au clavier sans perdre le brouillon ni le contexte en fenêtre compacte', async () => {
  await launch()
  await page.evaluate(() => window.connectionUIFixture.setSnapshot({ projects:[{id:'project-theme',name:'Projet Thème',rootPath:'C:/theme',openedAt:new Date().toISOString()}] }))
  await page.locator('.project-row').click()
  await page.getByLabel('Brouillon pour Projet Thème').fill('Une saisie à conserver')
  const toggle = page.getByRole('button', { name:'Passer au thème clair',exact:true })
  await toggle.focus(); await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light')
  assert.equal(await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).evaluate(element=>element===document.activeElement),true)
  assert.equal(await page.getByLabel('Brouillon pour Projet Thème').inputValue(),'Une saisie à conserver')
  await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByLabel('Brouillon pour Projet Thème').inputValue(),'Une saisie à conserver')
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
for (const failure of [true,'bridge']) test(`un thème non sauvegardé garde un avertissement accessible et la saisie (${failure})`, async () => {
  await launch()
  await page.evaluate(value=>window.connectionUIFixture.failAppearance(value),failure)
  await page.getByRole('button',{name:'Passer au thème clair',exact:true}).click()
  await page.getByRole('status').filter({hasText:failure==='bridge'?'Le thème n’a pas pu être changé':'Le thème choisi s’applique à cette session'}).waitFor({timeout:2000})
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),failure==='bridge'?'dark':'light')
  assert.equal(await page.getByRole('heading',{name:'Vos projets, au même endroit',exact:true}).isVisible(),true)
})
test('le rappel forfait affiche l’erreur connue et reste fermable après un échec durable', async () => {
  await launch({ status: 'registered', accountStored: true, needsPlanAcknowledgement: true })
  const confirmation = page.getByRole('dialog', { name: 'Vous utilisez votre forfait ChatGPT', exact: true })
  await confirmation.waitFor(); await page.getByRole('button', { name: 'J’ai compris', exact: true }).click()
  await confirmation.getByRole('alert').filter({ hasText: 'Le coffre local est illisible' }).waitFor({ timeout: 1000 })
  await page.keyboard.press('Escape')
  assert.equal(await confirmation.isVisible(), false)
  await page.getByRole('button', { name: /^Connexion Codex :/ }).click()
  assert.equal(await confirmation.isVisible(), false)
  assert.equal(await page.getByRole('button', { name: 'Déconnecter localement', exact: true }).isVisible(), true)
})
test('Échap ferme le tiroir compact actif et conserve le panneau Codex en arrière-plan', async () => {
  await launch()
  await page.getByRole('button', { name: /^Connexion Codex :/ }).click()
  const connection = page.getByRole('dialog', { name: 'Connexion Codex', exact: true })
  await page.getByRole('button', { name: 'Ouvrir la navigation', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#navigation-drawer').evaluate((element) => element.open), false)
  assert.equal(await connection.isVisible(), true)
})
test('Mary expose son invocation et son forfait puis envoie uniquement le brouillon capturé', async () => {
  await launch({ status: 'registered', accountStored: true })
  await page.evaluate(() => window.connectionUIFixture.setSnapshot({ activeProjectId:'project-1',projects:[{id:'project-1',name:'Projet Mary',rootPath:'C:/project',openedAt:new Date().toISOString()}] }))
  await page.locator('.project-row').waitFor({timeout:1000})
  await page.locator('.project-row').click()
  await page.getByRole('button', { name:'Lancer Mary avec Codex',exact:true }).waitFor({timeout:1000})
  await page.getByRole('button', { name:'Lancer Mary avec Codex',exact:true }).click()
  await page.getByText('📊 Bonjour, je suis Mary. Voici mon menu.',{exact:true}).waitFor()
  await page.getByLabel('Votre réponse à Mary').fill('Bonjour Mary, parlons de mon idée.')
  await page.getByRole('button', { name:'Envoyer à Mary',exact:true }).click()
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[{projectId:'project-1',conversationId:'conversation-1',text:'Bonjour Mary, parlons de mon idée.'}])
  assert.equal(await page.getByLabel('Votre réponse à Mary').inputValue(),'Bonjour Mary, parlons de mon idée.')
  assert.equal(await page.getByRole('button',{name:'Envoyer à Mary',exact:true}).isDisabled(),true)
})
test('un arrêt inconnu depuis un autre projet garde le motif du blocage et le retour au propriétaire', async () => {
  await launch({ status:'registered',accountStored:true })
  await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-a',name:'Projet A',rootPath:'C:/a',openedAt:new Date().toISOString()},{id:'project-b',name:'Projet B',rootPath:'C:/b',openedAt:new Date().toISOString()}]}))
  await page.locator('.project-row').filter({hasText:'Projet A'}).click()
  await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click()
  await page.getByText('📊 Bonjour, je suis Mary. Voici mon menu.',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click()
  await page.getByRole('dialog',{name:'Madness',exact:true}).getByRole('button',{name:'Ouvrir le projet Projet B',exact:true}).click()
  await page.getByRole('heading',{name:'Projet B',exact:true}).waitFor()
  await page.evaluate(()=>window.connectionUIFixture.unknownOnStop())
  await page.getByRole('button',{name:'Arrêter Codex',exact:true}).click()
  const recovery=page.getByRole('alert').filter({hasText:'L’arrêt natif n’est pas confirmé'})
  await recovery.waitFor({timeout:1000})
  assert.equal(await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).isDisabled(),true)
  assert.equal(await page.getByRole('button',{name:'Vérifier ce projet',exact:true}).isDisabled(),true)
  await page.getByRole('button',{name:'Retrouver Projet A',exact:true}).click()
  await page.getByRole('heading',{name:'Projet A',exact:true}).waitFor()
  assert.equal(await recovery.isVisible(),true)
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('l’aide aux clés publiques est absente sans erreur réseau',async()=>{
  await launch({status:'registered',accountStored:true})
  await page.getByRole('button',{name:/^Connexion Codex :/}).click()
  assert.equal(await page.locator('.connection-network-help').count(),0)
})
test('l’aide réseau ouvre ou copie l’unique URL publique sans masquer l’erreur ni relancer Codex',async()=>{
  await launch({status:'error',accountStored:true,errorCode:'NETWORK_UNAVAILABLE'})
  await page.getByRole('button',{name:/^Connexion Codex :/}).click()
  const help=page.locator('.connection-network-help')
  await help.waitFor({timeout:1000})
  assert.equal(await help.getByText('https://auth.openai.com/.well-known/jwks.json',{exact:true}).count(),1)
  const copy=help.getByRole('button',{name:'Copier l’adresse des clés publiques',exact:true})
  assert.equal(await copy.getAttribute('title'),'Copier l’adresse des clés publiques')
  await page.evaluate(()=>window.connectionUIFixture.deferSupport())
  await copy.click()
  assert.equal(await help.getByRole('status').count(),0)
  await page.evaluate(()=>window.connectionUIFixture.finishSupport())
  await help.getByRole('status').filter({hasText:'Adresse copiée.'}).waitFor()
  await help.getByRole('button',{name:'Ouvrir dans le navigateur Windows',exact:true}).click()
  await help.getByRole('status').filter({hasText:'Ouverture demandée dans votre navigateur Windows.'}).waitFor()
  assert.equal(await help.isVisible(),true)
  assert.equal(await page.getByRole('alert').filter({hasText:'Le service ne répond pas.'}).isVisible(),true)
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.supportCalls()),['copyPublicKeys','openPublicKeys'])
  assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
  assert.equal(await help.evaluate(element=>element.scrollWidth<=element.clientWidth),true)
  if(process.env.MADNESS_CAPTURE_SUPPORT==='1'){
    const output=join(repository,'.g0-qualification');await mkdir(output,{recursive:true})
    await page.evaluate(()=>{const label=document.createElement('p');label.className='small muted';label.textContent='Profil synthétique de qualification · aucune connexion réelle';document.getElementById('codex-connection-panel').prepend(label)})
    await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show())
    for(const size of [{width:1320,height:860,name:'desktop'},{width:600,height:800,name:'compact'}]){
      await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),size)
      await page.locator('#codex-connection-panel').evaluate(element=>{element.scrollTop=0})
      await page.screenshot({path:join(output,'support-'+size.name+'.png')})
    }
  }
})
for(const [action,label,message] of [['copyPublicKeys','Copier l’adresse des clés publiques','La copie n’a pas abouti.'],['openPublicKeys','Ouvrir dans le navigateur Windows','Le navigateur Windows n’a pas pu être ouvert.']])test(`l’aide réseau garde une récupération locale après échec ${action}`,async()=>{
  await launch({status:'error',accountStored:true,errorCode:'NETWORK_UNAVAILABLE'})
  await page.getByRole('button',{name:/^Connexion Codex :/}).click()
  const help=page.locator('.connection-network-help');await help.waitFor({timeout:1000})
  await page.evaluate(action=>window.connectionUIFixture.failSupport(action),action)
  await help.getByRole('button',{name:label,exact:true}).click()
  await help.getByRole('alert').filter({hasText:message}).waitFor()
  assert.equal(await help.getByRole('status').count(),0)
  assert.equal(await page.getByRole('alert').filter({hasText:'Le service ne répond pas.'}).isVisible(),true)
  assert.equal(await help.isVisible(),true)
  assert.equal((await page.evaluate(()=>window.madnessConnection.read())).state.errorCode,'NETWORK_UNAVAILABLE')
  assert.equal(await page.evaluate(()=>window.connectionUIFixture.verifies()),0)
})
