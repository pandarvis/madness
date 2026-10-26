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
    let dialogue={contractVersion:1,sequence:0,status:'idle',context:{projectId:null,initiativeId:null,conversationId:null,providerId:null,connectionId:null},invocation:'$bmad-agent-analyst',profile:null,acknowledged:false,errorCode:null,activities:[],workflows:[]},dialogueListeners=[],sent=[],copies=[],unknownOnStop=false;
    const notifyDialogue=()=>dialogueListeners.forEach(listener=>listener(dialogue));
    const qualifyForge=async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'qualified',invocation:'$bmad-forge-idea',context:{...dialogue.context,projectId},profile:{fingerprint:'a'.repeat(64),skillPath:'C:/forge/.agents/skills/bmad-forge-idea/SKILL.md',outputBase:'C:/forge/_bmad-output/initiative-test'}};notifyDialogue();return dialogue};
    const launchForge=async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',invocation:'$bmad-forge-idea',context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-forge',providerId:'codex',connectionId:'account-1'},workflows:[{schemaVersion:1,conversationId:'conversation-forge',context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-forge',providerId:'codex',connectionId:'account-1'},invocation:'$bmad-forge-idea',capturedAt:new Date().toISOString(),rootPath:'C:/forge',outputBase:'C:/forge/_bmad-output/initiative-test',contextDigest:'b'.repeat(64),fingerprint:'a'.repeat(64),skillPath:'C:/forge/.agents/skills/bmad-forge-idea/SKILL.md',workspace:'C:/forge/_bmad-output/initiative-test/forge-ui-test',outcome:'open',observations:[]}]};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[{id:'conversation-forge',context:dialogue.context,lastKnownActivity:'idle',messages:[{id:'invocation-forge',role:'user',text:'$bmad-forge-idea'},{id:'welcome-forge',role:'assistant',text:'Quelle idée souhaitez-vous éprouver ? Fin du tour.'}]}]};stateListeners.forEach(listener=>listener({}));notifyDialogue();return dialogue};
    contextBridge.exposeInMainWorld('madnessDialogue',{qualifyForge,launchForge,copyWorkflow:async(conversationId,target)=>{copies.push({conversationId,target});return dialogue},read:()=>Promise.resolve(dialogue),qualify:async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'qualified',context:{...dialogue.context,projectId}};notifyDialogue();return dialogue},launch:async(projectId)=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:'ready',invocation:'$bmad-agent-analyst',acknowledged:true,context:{projectId,initiativeId:'initiative-test',conversationId:'conversation-1',providerId:'codex',connectionId:'account-1'},activities:['Tour terminé']};snapshot={...snapshot,revision:snapshot.revision+1,conversations:[...snapshot.conversations.filter(c=>c.id!=='conversation-1'),{id:'conversation-1',context:dialogue.context,lastKnownActivity:'idle',messages:[{id:'hello',role:'assistant',text:'📊 Bonjour, je suis Mary. Voici mon menu.'}]}]};stateListeners.forEach(listener=>listener({}));notifyDialogue();return dialogue},send:async(projectId,conversationId,text)=>{sent.push({projectId,conversationId,text});dialogue={...dialogue,sequence:dialogue.sequence+1,status:'running',acknowledged:true};notifyDialogue();return dialogue},stop:async()=>{dialogue={...dialogue,sequence:dialogue.sequence+1,status:unknownOnStop?'unknown':'stopped',errorCode:unknownOnStop?'STOP_UNCONFIRMED':null};notifyDialogue();return dialogue},onChanged:listener=>{dialogueListeners.push(listener);return()=>{}}});
    contextBridge.exposeInMainWorld('madnessConnection',{read:reply,connect:reply,verify:()=>{verifies++;return reply()},cancel:reply,disconnect:reply,manageUsage:reply,openPublicKeys:()=>support('openPublicKeys'),copyPublicKeys:()=>support('copyPublicKeys'),acknowledgePlan:()=>{state={...state,sequence:state.sequence+1,status:'error',errorCode:'VAULT_UNREADABLE'};listeners.forEach(listener=>listener(state));return reply()},onChanged:listener=>{listeners.push(listener);return()=>{listeners=listeners.filter(value=>value!==listener)}}});
    contextBridge.exposeInMainWorld('connectionUIFixture',{failAppearance:value=>{appearanceFailure=value},setState:value=>{state={...state,...value,sequence:state.sequence+1};listeners.forEach(listener=>listener(state))},setSnapshot:value=>{snapshot={...snapshot,...value};stateListeners.forEach(listener=>listener({}))},setDialogue:value=>{dialogue={...dialogue,...value,sequence:dialogue.sequence+1};notifyDialogue()},sent:()=>sent,copies:()=>copies,unknownOnStop:()=>{unknownOnStop=true},supportCalls:()=>supportCalls,verifies:()=>verifies,failSupport:action=>{supportFailure=action},deferSupport:()=>{supportDeferred=true},finishSupport:()=>{supportDeferred=false;finishSupport?.()}});
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
test('les articles progressifs gardent leur nœud, identité sourcée, lecture et saisie sans annoncer chaque fragment',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 const context={projectId:'project-stream',initiativeId:'initiative-test',conversationId:'conversation-stream',providerId:'codex',connectionId:'account-1'}
 await page.evaluate(context=>window.connectionUIFixture.setSnapshot({projects:[{id:context.projectId,name:'Projet Flux',rootPath:'C:/stream',openedAt:new Date().toISOString()}],conversations:[{id:context.conversationId,context,lastKnownActivity:'running',messages:[]}]}),context)
 await page.locator('.project-row').click();await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 const message={id:'turn-1-message-1',context,requestId:'request-stream',turnId:'turn-1',order:1,revision:1,text:'Début reçu.',phase:'streaming',storage:'pending',identity:{kind:'unknown'}}
 await page.evaluate(({context,message})=>window.connectionUIFixture.setDialogue({status:'running',context,acknowledged:true,messages:[message],turn:{id:'turn-1',requestId:'request-stream',context,phase:'streaming'}}),{context,message})
 await page.getByText('Début reçu.',{exact:true}).waitFor()
 assert.equal(await page.getByRole('heading',{name:'Agent non identifié · Codex',exact:true}).count(),1)
 await page.locator('#draft').fill('Brouillon courant');await page.locator('#draft').focus()
 await page.evaluate(()=>{window.__streamArticle=document.querySelector('[data-message-id="turn-1-message-1"]');window.__turnStatus=document.querySelector('.turn-status').textContent})
 await page.evaluate(message=>window.connectionUIFixture.setDialogue({messages:[{...message,revision:2,text:'Début reçu. '+('Une ligne de lecture.\n'.repeat(150))}]}),message)
 assert.equal(await page.evaluate(()=>window.__streamArticle===document.querySelector('[data-message-id="turn-1-message-1"]')),true)
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'draft');assert.equal(await page.locator('#draft').inputValue(),'Brouillon courant')
 assert.equal(await page.evaluate(()=>document.querySelector('.turn-status').textContent===window.__turnStatus),true)
 assert.equal(await page.locator('.message-text[aria-live]').count(),0)
 await page.locator('.conversation-messages').evaluate(element=>{element.scrollTop=0;element.dispatchEvent(new Event('scroll'))})
 await page.evaluate(message=>window.connectionUIFixture.setDialogue({messages:[{...message,revision:3,text:'Début reçu. '+('Une ligne de lecture.\n'.repeat(200))}]}),message)
 assert.equal(await page.locator('.conversation-messages').evaluate(element=>element.scrollTop),0)
 await page.evaluate(message=>window.connectionUIFixture.setDialogue({status:'error',errorCode:'STORAGE_WRITE_FAILED',messages:[{...message,revision:4,text:'Début reçu.',phase:'interrupted',storage:'failed'}]}),message)
 await page.getByText('Réponse partielle · conservation non confirmée',{exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('le thème change au clavier sans perdre le brouillon ni le contexte en fenêtre compacte', async () => {
  await launch()
  await page.evaluate(() => window.connectionUIFixture.setSnapshot({ projects:[{id:'project-theme',name:'Projet Thème',rootPath:'C:/theme',openedAt:new Date().toISOString()}] }))
  await page.locator('.project-row').click()
  await page.waitForFunction(() => document.activeElement?.matches('h1') && document.activeElement.textContent === 'Projet Thème')
  await page.getByLabel('Brouillon pour Projet Thème').fill('Une saisie à conserver')
  const toggle = page.getByRole('button', { name:'Passer au thème clair',exact:true })
  await toggle.focus()
  assert.equal(await toggle.evaluate(element=>element===document.activeElement),true)
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light')
  assert.equal(await page.getByRole('button',{name:'Passer au thème sombre',exact:true}).evaluate(element=>element===document.activeElement),true)
  assert.equal(await page.getByLabel('Brouillon pour Projet Thème').inputValue(),'Une saisie à conserver')
  await page.getByRole('button',{name:'Ouvrir la navigation',exact:true}).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByLabel('Brouillon pour Projet Thème').inputValue(),'Une saisie à conserver')
  assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
})
test('Forge prépare la portée inline, exige qualification et lancement explicites puis conserve le brouillon et le destinataire',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-forge',name:'Projet Forge',rootPath:'C:/forge',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.locator('#draft').fill('Brouillon à conserver')
 await page.getByRole('button',{name:'Préparer Forge',exact:true}).click()
 const start=page.getByRole('button',{name:'Lancer Forge avec Codex',exact:true});assert.equal(await start.isDisabled(),true)
 await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click();assert.equal(await start.isEnabled(),true)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.getByText('C:/forge/_bmad-output/initiative-test',{exact:true}).waitFor()
 await start.click();await page.getByLabel('Votre réponse à Forge',{exact:true}).waitFor()
 assert.equal(await page.locator('#draft').inputValue(),'Brouillon à conserver');assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 await page.getByRole('heading',{name:'Résultat observé de Forge',exact:true}).waitFor()
 await page.getByRole('button',{name:'Copier l’invocation',exact:true}).click();await page.getByRole('status').filter({hasText:'Invocation copiée.'}).waitFor()
 await page.getByRole('button',{name:'Envoyer à Forge',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[{projectId:'project-forge',conversationId:'conversation-forge',text:'Brouillon à conserver'}])
})
for(const recipient of ['Forge','Mary'])test('les contrôles partagés sont attribués à la session '+recipient,async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-session',name:'Projet Session',rootPath:'C:/session',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click()
 if(recipient==='Forge'){await page.getByRole('button',{name:'Préparer Forge',exact:true}).click();await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()}
 await page.getByRole('button',{name:'Lancer '+recipient+' avec Codex',exact:true}).click()
 const skillPath='C:/session/.agents/skills/'+(recipient==='Forge'?'bmad-forge-idea':'bmad-agent-analyst')+'/SKILL.md'
 await page.evaluate(profile=>window.connectionUIFixture.setDialogue({profile}),{fingerprint:'a'.repeat(64),skillPath})
 const session=page.getByRole('region',{name:'Session '+recipient+' · Codex',exact:true}),mary=page.locator('[aria-labelledby="mary-title"]')
 assert.equal(await session.count(),1)
 assert.equal(await session.getByRole('button',{name:'Arrêter Codex',exact:true}).isVisible(),true)
 assert.equal(await mary.getByRole('button',{name:'Arrêter Codex',exact:true}).count(),0)
 await session.locator('.dialogue-proof > summary').click();assert.equal(await session.getByText(skillPath,{exact:true}).isVisible(),true)
 assert.equal(await mary.locator('.dialogue-proof').count(),0)
 for(const errorCode of ['BUSY','PROFILE_ABSENT','PLAN_ACK_REQUIRED','CONNECTION_BUSY']){
  await page.evaluate(errorCode=>window.connectionUIFixture.setDialogue({errorCode}),errorCode)
  const text=await session.getByRole('alert').textContent();assert.doesNotMatch(text,/lancer Mary|nécessaires à Mary/)
  assert.equal(await mary.getByRole('alert').count(),0)
 }
 await session.getByRole('button',{name:'Arrêter Codex',exact:true}).click()
 assert.equal((await page.evaluate(()=>window.madnessDialogue.read())).status,'stopped')
 assert.equal(await session.locator('.dialogue-proof').isVisible(),true)
})
for(const prerequisite of ['account','plan'])test('la préparation Forge explique le prérequis '+prerequisite+' et sa récupération en fenêtre compacte',async()=>{
 await launch({status:prerequisite==='account'?'disconnected':'registered',accountStored:prerequisite!=='account',needsPlanAcknowledgement:prerequisite==='plan'})
 if(prerequisite==='plan')await page.keyboard.press('Escape')
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-prerequisite',name:'Projet Prérequis',rootPath:'C:/prerequisite',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.getByRole('button',{name:'Préparer Forge',exact:true}).click();await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click()
 const preparation=page.locator('#forge-preparation'),start=preparation.getByRole('button',{name:'Lancer Forge avec Codex',exact:true})
 await page.getByRole('tab',{name:'Conversation',exact:true}).click()
 assert.equal(await page.locator('.conversation-empty').getByText('Un lancement explicite ouvre une session sans envoyer votre brouillon.',{exact:true}).isVisible(),true)
 assert.equal(await start.isDisabled(),true)
 assert.equal(await preparation.locator('#forge-launch-prerequisite').count(),1)
 assert.equal(await start.getAttribute('aria-describedby'),'forge-launch-prerequisite')
 assert.match(await preparation.locator('#forge-launch-prerequisite').textContent(),prerequisite==='account'?/Connectez d’abord votre compte/:/Acquittez le rappel du forfait/)
 assert.equal(await page.evaluate(()=>innerWidth<=720),true);assert.equal(await preparation.evaluate(element=>element.scrollWidth<=element.clientWidth),true)
 if(prerequisite==='account'){
  await preparation.getByRole('button',{name:'Ouvrir le panneau Codex',exact:true}).click()
  await page.getByRole('dialog',{name:'Connexion Codex',exact:true}).getByRole('button',{name:'Continuer avec ChatGPT',exact:true}).waitFor()
 }else{
  await preparation.getByRole('button',{name:'Relire le rappel du forfait',exact:true}).click()
  await page.getByRole('dialog',{name:'Vous utilisez votre forfait ChatGPT',exact:true}).getByRole('button',{name:'J’ai compris',exact:true}).waitFor()
 }
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.sent()),[])
 assert.equal((await page.evaluate(()=>window.madness.readState())).value.state.conversations.length,0)
})
test('Forge historique après Mary conserve résultat, contexte, observations et copie du chemin correspondant',async()=>{
 await launch({status:'registered',accountStored:true,needsPlanAcknowledgement:false})
 await page.evaluate(()=>window.connectionUIFixture.setSnapshot({projects:[{id:'project-forge',name:'Projet Forge',rootPath:'C:/forge',openedAt:new Date().toISOString()}]}))
 await page.locator('.project-row').click();await page.getByRole('button',{name:'Préparer Forge',exact:true}).click()
 await page.getByRole('button',{name:'Vérifier le profil Forge',exact:true}).click();await page.getByRole('button',{name:'Lancer Forge avec Codex',exact:true}).click()
 await page.evaluate(async()=>{const w=(await window.madnessDialogue.read()).workflows[0],id='conversation-forge-older',older={...w,conversationId:id,context:{...w.context,conversationId:id},workspace:'C:/forge/_bmad-output/initiative-test/forge-older'};window.connectionUIFixture.setDialogue({workflows:[older,{...w,outcome:'CLARIFIED',observations:[{id:'observed-report',turnId:'turn-forge',operation:'write',phase:'observed',at:w.capturedAt,path:w.workspace+'/forge-report.html',sha256:'c'.repeat(64),bytes:123}]}]});const s=(await window.madness.readState()).value.state;window.connectionUIFixture.setSnapshot({conversations:[{id,context:older.context,lastKnownActivity:'idle',messages:[{id:'older-message',role:'assistant',text:'Historique Forge antérieur distinct.'}]},...s.conversations]})})
 await page.getByRole('button',{name:'Arrêter Codex',exact:true}).click();await page.getByRole('button',{name:'Lancer Mary avec Codex',exact:true}).click()
 await page.getByLabel('Votre réponse à Mary',{exact:true}).fill('Brouillon après Mary, à conserver')
 await page.locator('.previous-conversations > summary').click()
 const history=page.locator('.previous-conversations > section').filter({hasText:'Quelle idée souhaitez-vous éprouver ? Fin du tour.'}),result=history.locator('.workflow-observations')
 assert.equal(await result.count(),1)
 assert.equal(await result.getByRole('heading',{name:'Résultat observé de Forge',exact:true}).isVisible(),true)
 assert.equal(await result.getByText('Clôture native observée : CLARIFIED.',{exact:false}).isVisible(),true)
 assert.match(await result.textContent(),/initiative-test.*account-1/)
 await result.locator('details > summary').click()
 assert.equal(await result.getByText('C:/forge/_bmad-output/initiative-test/forge-ui-test/forge-report.html',{exact:true}).isVisible(),true)
 await result.getByRole('button',{name:'Copier le chemin',exact:true}).click()
 assert.equal(await result.getByRole('status').textContent(),'Chemin copié.')
 const older=page.locator('.previous-conversations > section').filter({hasText:'Historique Forge antérieur distinct.'}).locator('.workflow-observations')
 assert.equal(await older.count(),1);assert.equal(await older.getByRole('status').textContent(),'')
 const titles=await page.locator('.workflow-observations h2').evaluateAll(elements=>elements.map(element=>element.id));assert.equal(new Set(titles).size,titles.length)
 assert.deepEqual(await page.evaluate(()=>window.connectionUIFixture.copies()),[{conversationId:'conversation-forge',target:'workspace'}])
 assert.equal(await page.getByLabel('Votre réponse à Mary',{exact:true}).inputValue(),'Brouillon après Mary, à conserver')
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
