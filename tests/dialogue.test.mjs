import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Application } from '../src/core/application.ts'
import { emptySnapshot, isSnapshot } from '../src/contracts/index.ts'
const contracts = await import('../src/contracts/dialogue.ts').catch(() => null)
const core = await import('../src/core/dialogue.ts').catch(() => null)
function fixture(options = {}) {
  let stored = emptySnapshot(), counter = 0
  const app = new Application({ store: { read: async () => structuredClone(stored), write: async value => { if (options.failWrite?.()) throw Error('disk'); await options.beforeWrite?.(value); stored = structuredClone(value) } }, newId: () => 'id-' + ++counter, now: () => new Date().toISOString(), chooseDirectory: async () => ({ name: 'Projet', rootPath: 'C:/project' }) })
  return { app, stored: () => stored }
}
const command = (type, extra = {}) => ({ contractVersion: 1, correlationId: 'request-' + type, type, ...extra })
test('contrat dialogue refuse propriétés natives, chemins, texte vide et effets implicites', () => {
  assert.ok(contracts, 'Le contrat métier dialogue doit exister')
  assert.equal(contracts.isDialogueCommand(command('launch', { projectId: 'id-1' })), true)
  assert.equal(contracts.isDialogueCommand(command('launch', { projectId: 'id-1', cwd: 'foreign' })), false)
  assert.equal(contracts.isDialogueCommand(command('send', { projectId: 'id-1', conversationId: 'id-2', text: ' ' })), false)
  assert.equal(contracts.isDialogueCommand(command('send', { projectId: 'id-1', conversationId: 'id-2', text: 'Bonjour' })), true)
})
test('qualification bloque le modèle, conversation conserve contexte et accusé durable sans bloquer la navigation', async () => {
  assert.ok(core, 'Le coordinateur dialogue doit exister')
  const f = fixture(); await f.app.execute(command('choose-directory'))
  let allowed = false, opens = 0, release
  const waiting = new Promise(resolve => release = resolve)
  const dialogue = new core.DialogueCoordinator({ application: f.app, qualify: async () => { if (!allowed) throw Object.assign(Error(), { code: 'PROFILE_UNRECOGNIZED' }); return { rootPath: 'C:/project', skillPath: 'C:/project/.agents/skills/bmad-agent-analyst/SKILL.md', fingerprint: 'a'.repeat(64) } }, open: async () => { opens++; return { context: { connectionId: 'registered-account-1', initiativeId: 'initiative-madness' }, turn: async (text, accepted) => { await accepted(); if (text) await waiting; return text ? 'Réponse Mary' : '📊 Mary · menu BP MR' }, stop: async () => 'stopped' } } })
  await dialogue.execute(command('launch', { projectId: 'id-1' })); await dialogue.settled()
  assert.equal(opens, 0); assert.equal(dialogue.read().errorCode, 'PROFILE_UNRECOGNIZED')
  allowed = true; await dialogue.execute(command('launch', { projectId: 'id-1' })); await dialogue.settled()
  const conversationId = dialogue.read().context.conversationId
  assert.equal(dialogue.read().status, 'ready'); assert.equal(opens, 1)
  await dialogue.execute(command('send', { projectId: 'id-1', conversationId, text: 'Bonjour' }))
  const busy = await dialogue.execute(command('send', { projectId: 'id-1', conversationId, text: 'Autre' }))
  assert.equal(busy.errorCode, 'BUSY')
  const nav = await f.app.execute(command('set-navigation', { collapsed: true })); assert.equal(nav.ok, true)
  release(); await dialogue.settled()
  assert.deepEqual(f.stored().conversations[0].messages.map(m => m.text), ['$bmad-agent-analyst', '📊 Mary · menu BP MR', 'Bonjour', 'Réponse Mary'])
  assert.equal(isSnapshot(f.stored()), true)
  assert.equal(f.stored().conversations[0].context.connectionId, 'registered-account-1')
  assert.equal(f.stored().conversations[0].context.initiativeId, 'initiative-madness')
  await dialogue.shutdown()
  const restored = new Application({ ...f.app, store: { read: async () => f.stored() } })
  const state = await restored.execute(command('read-state')); assert.equal(state.ok, true); assert.equal(state.value.state.conversations.length, 1)
})
test('contexte étranger refusé et erreur de sauvegarde ne devient jamais succès', async () => {
  assert.ok(core)
  let fail = false; const f = fixture({ failWrite: () => fail }); await f.app.execute(command('choose-directory'))
  const dialogue = new core.DialogueCoordinator({ application: f.app, qualify: async () => ({ rootPath: 'C:/project', skillPath: 'Mary', fingerprint: 'a'.repeat(64) }), open: async () => ({ context: { connectionId: 'registered-account-1', initiativeId: null }, turn: async (_, accepted) => { await accepted(); return 'Mary' }, stop: async () => 'stopped' }) })
  await dialogue.execute(command('launch', { projectId: 'id-1' })); await dialogue.settled()
  assert.equal((await dialogue.execute(command('send', { projectId: 'foreign', conversationId: dialogue.read().context.conversationId, text: 'Bonjour' }))).errorCode, 'CONTEXT_MISMATCH')
  fail = true
  await dialogue.execute(command('send', { projectId: 'id-1', conversationId: dialogue.read().context.conversationId, text: 'Bonjour' })); await dialogue.settled()
  assert.equal(dialogue.read().errorCode, 'STORAGE_WRITE_FAILED'); assert.notEqual(dialogue.read().status, 'ready')
})
test('arrêt inconnu interdit tout nouveau lancement et garde le dernier contexte', async () => {
  const f = fixture(); await f.app.execute(command('choose-directory'))
  let opens = 0
  const dialogue = new core.DialogueCoordinator({ application:f.app,qualify:async()=>({rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async()=>{opens++;return {context:{connectionId:'account-1',initiativeId:null},turn:async(_,accepted)=>{await accepted();return 'Mary'},stop:async()=> 'unknown'}} })
  await dialogue.execute(command('launch',{projectId:'id-1'}));await dialogue.settled()
  await dialogue.execute(command('stop'));await dialogue.settled()
  assert.equal(dialogue.read().status,'unknown');assert.equal(dialogue.read().errorCode,'STOP_UNCONFIRMED')
  assert.equal((await dialogue.execute(command('launch',{projectId:'id-1'}))).errorCode,'STOP_UNCONFIRMED');assert.equal(opens,1)
  assert.equal(f.stored().conversations[0].lastKnownActivity,'unknown')
  assert.equal(await dialogue.shutdown(),'unknown');assert.equal(f.stored().conversations[0].lastKnownActivity,'unknown')
})
test('annuler pendant la qualification ne lance aucun fournisseur et laisse le brouillon intact', async () => {
  const f = fixture();await f.app.execute(command('choose-directory'));await f.app.execute(command('save-draft',{projectId:'id-1',text:'Ne pas envoyer'}))
  let started=false,opens=0
  const dialogue = new core.DialogueCoordinator({application:f.app,qualify:async(_,signal)=>{started=true;await new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error(),{code:'CANCELLED'})),{once:true}))},open:async()=>{opens++;throw Error()}})
  await dialogue.execute(command('launch',{projectId:'id-1'}));while(!started) await new Promise(resolve=>setTimeout(resolve,1))
  await dialogue.execute(command('stop'));await dialogue.settled()
  assert.equal(dialogue.read().status,'stopped');assert.equal(opens,0);assert.equal(f.stored().drafts[0].text,'Ne pas envoyer')
})
for (const stopOutcome of ['stopped', 'unknown']) test(`arrêter pendant l’écriture finale ferme Codex sans rétablir ready (${stopOutcome})`, async () => {
  let releaseWrite, finalWriteStarted
  const delayedWrite = new Promise(resolve => { releaseWrite = resolve })
  const writingFinal = new Promise(resolve => { finalWriteStarted = resolve })
  const f = fixture({ beforeWrite: async value => { if (value.conversations[0]?.messages.at(-1)?.text === 'Réponse finale' && value.conversations[0]?.lastKnownActivity === 'idle') { finalWriteStarted(); await delayedWrite } } })
  await f.app.execute(command('choose-directory'))
  let stopCalls = 0
  const dialogue = new core.DialogueCoordinator({ application: f.app, qualify: async () => ({ rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64) }), open: async () => ({ context:{connectionId:'account-1',initiativeId:null},turn:async(text,accepted)=>{await accepted();return text ? 'Réponse finale' : 'Accueil Mary'},stop:async()=>{stopCalls++;return stopOutcome} }) })
  await dialogue.execute(command('launch',{projectId:'id-1'}));await dialogue.settled()
  await dialogue.execute(command('send',{projectId:'id-1',conversationId:dialogue.read().context.conversationId,text:'Bonjour'}))
  await writingFinal
  const statuses=[];dialogue.subscribe(state=>statuses.push(state.status))
  assert.equal((await dialogue.execute(command('stop'))).status,'stopping')
  releaseWrite();await dialogue.settled()
  assert.equal(stopCalls,1)
  assert.equal(dialogue.read().status,stopOutcome)
  assert.equal(statuses.includes('ready'),false)
  assert.equal(f.stored().conversations[0].messages.at(-1).text,'Réponse finale')
  assert.equal(f.stored().conversations[0].lastKnownActivity,stopOutcome==='unknown'?'unknown':'idle')
})
