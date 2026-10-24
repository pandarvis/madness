import assert from 'node:assert/strict'
import { test, before, after } from 'node:test'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { _electron as electron } from 'playwright-core'
import { mkdtemp, writeFile, readFile, rm, realpath } from 'node:fs/promises'
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
    let state={contractVersion:1,sequence:0,status:'disconnected',accountStored:false,verifiedAt:null,errorCode:null,cliVersion:null,needsPlanAcknowledgement:false}, listeners=[];
    const reply=()=>Promise.resolve({contractVersion:1,correlationId:'ui-fixture',state});
    const snapshot={schemaVersion:1,revision:0,projects:[],activeProjectId:null,drafts:[],preferences:{navigationCollapsed:false},conversations:[],capabilities:{codex:{available:false,reasonKey:'codex.unqualified'}},lifecycle:'idle'};
    contextBridge.exposeInMainWorld('madness',{readState:()=>Promise.resolve({ok:true,contractVersion:1,correlationId:'ui-fixture',value:{state:snapshot,effect:'read'}})});
    contextBridge.exposeInMainWorld('madnessConnection',{read:reply,connect:reply,verify:reply,cancel:reply,disconnect:reply,manageUsage:reply,acknowledgePlan:()=>{state={...state,sequence:state.sequence+1,status:'error',errorCode:'VAULT_UNREADABLE'};listeners.forEach(listener=>listener(state));return reply()},onChanged:listener=>{listeners.push(listener);return()=>{listeners=listeners.filter(value=>value!==listener)}}});
    contextBridge.exposeInMainWorld('connectionUIFixture',{setState:value=>{state={...state,...value,sequence:state.sequence+1};listeners.forEach(listener=>listener(state))}});
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
