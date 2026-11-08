import assert from 'node:assert/strict'
import {test} from 'node:test'
import {isDialogueCommand} from '../src/contracts/dialogue.ts'
import {Application} from '../src/core/application.ts'
import {DialogueCoordinator} from '../src/core/dialogue.ts'
import {emptySnapshot} from '../src/contracts/index.ts'

const command = (type, extra={}) => ({contractVersion:1, correlationId:'request-'+type, type, ...extra})
const profile = {rootPath:'C:/project', skillPath:'C:/project/SKILL.md', fingerprint:'a'.repeat(64)}
const captured = {scope:'configuration', initiativeId:'initiative-local', observation:{activeStatus:'valid'}}
async function fixture(overrides={}) {
  let stored=emptySnapshot(), id=0
  const dependencies={
    store:{read:async()=>structuredClone(stored),write:async value=>{stored=structuredClone(value)}},
    newId:()=> 'id-'+ ++id, now:()=>new Date().toISOString(),
    chooseDirectory:async()=>({name:'Projet',rootPath:'C:/project'})
  }
  const application=new Application(dependencies)
  await application.execute(command('choose-directory'))
  const dialogue=new DialogueCoordinator({
    application, qualify:async()=>profile, qualifyClaude:async()=>profile,
    contexts:{capture:async()=>captured,assertFresh:async()=>{}},
    open:async()=>({context:{connectionId:'codex-local',initiativeId:captured.initiativeId},turn:async(_,accepted)=>{await accepted();return 'Codex'},stop:async()=> 'stopped'}),
    openClaude:async(_,context)=>({
      context:{connectionId:'claude-local',initiativeId:context.initiativeId},
      turn:async(_,accepted)=>{await accepted();return 'Mary avec Claude Code'},
      stop:async()=> 'stopped'
    }), ...overrides
  })
  return {dialogue, dependencies}
}

test('la commande Claude accepte uniquement le projet et l’enveloppe standard',()=>{
  const valid=command('launch-claude',{projectId:'id-1'})
  assert.equal(isDialogueCommand(valid),true)
  for(const extra of [{providerId:'codex'},{mode:'read-only'},{cwd:'C:/foreign'},{prompt:'text'},{metricsChoice:'choice-1'}])
    assert.equal(isDialogueCommand({...valid,...extra}),false)
})

test('Claude reste ouvert après une réponse durable, Codex garde son propre dialogue',async()=>{
  const {dialogue,dependencies}=await fixture()
  await dialogue.execute(command('launch',{projectId:'id-1'}))
  await dialogue.settled()
  assert.equal(dialogue.read().status,'ready')
  await dialogue.execute(command('stop'))
  await dialogue.settled()
  await dialogue.execute(command('launch-claude',{projectId:'id-1'}))
  await dialogue.settled()
  const state=dialogue.read()
  assert.equal(state.status,'ready')
  assert.equal(state.turn.phase,'completed')
  assert.equal(state.context.providerId,'claude-code')
  assert.equal(state.context.initiativeId,captured.initiativeId)
  await dialogue.execute(command('stop'))
  await dialogue.settled()
  assert.equal(dialogue.read().status,'stopped')
  const reopened=await new Application(dependencies).execute(command('read-state'))
  assert.deepEqual(reopened.value.state.conversations.map(c=>[c.context.providerId,c.lastKnownActivity,c.messages.at(-1).text]),[
    ['codex','idle','Codex'],['claude-code','idle','Mary avec Claude Code']
  ])
})

test('Claude refuse avant lancement si le projet actif diffère ou si le contexte a changé',async()=>{
  let opens=0
  const {dialogue}=await fixture({
    contexts:{capture:async()=>captured,assertFresh:async()=>{throw Object.assign(Error(),{code:'PROFILE_CHANGED'})}},
    openClaude:async()=>{opens++;throw Error('must not open')}
  })
  await dialogue.execute(command('launch-claude',{projectId:'foreign'}))
  await dialogue.settled()
  assert.equal(dialogue.read().errorCode,'CONTEXT_MISMATCH')
  await dialogue.execute(command('launch-claude',{projectId:'id-1'}))
  await dialogue.settled()
  assert.equal(dialogue.read().errorCode,'PROFILE_CHANGED')
  assert.equal(opens,0)
})


for(const outcome of ['stopped','unknown']){
  test('annulation Claude après envoi, sans réponse ni rejeu : '+outcome,async()=>{
    let entered, turns=0
    const waiting=new Promise(resolve=>entered=resolve)
    const {dialogue,dependencies}=await fixture({
      openClaude:async(_,context,signal)=>({
        context:{connectionId:'claude-local',initiativeId:context.initiativeId},
        async turn(_,accepted){
          turns++
          await accepted()
          const cancelled=new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error(),{code:'CANCELLED'})),{once:true}))
          entered()
          return cancelled
        },
        stop:async()=>outcome
      })
    })
    await dialogue.execute(command('launch-claude',{projectId:'id-1'}))
    await waiting
    assert.equal((await dialogue.execute(command('stop'))).status,'stopping')
    await dialogue.settled()
    const state=dialogue.read()
    assert.equal(state.status,outcome)
    assert.equal(state.turn.phase,outcome==='unknown'?'unknown':'interrupted')
    const reopened=await new Application(dependencies).execute(command('read-state'))
    assert.deepEqual(reopened.value.state.conversations[0].messages.map(m=>m.role),['user'])
    if(outcome==='unknown'){
      assert.equal((await dialogue.execute(command('launch',{projectId:'id-1'}))).errorCode,'STOP_UNCONFIRMED')
      assert.equal((await dialogue.execute(command('launch-claude',{projectId:'id-1'}))).errorCode,'STOP_UNCONFIRMED')
    }
    assert.equal(turns,1)
  })
}


test('la file refuse la soumission si un autre projet est devenu actif',async()=>{
  const {dependencies}=await fixture()
  let selected
  const app=new Application({...dependencies,chooseDirectory:async()=>({name:'Autre',rootPath:'C:/other'}),newId:()=> 'other'})
  await app.execute(command('read-state'))
  const opening=app.execute(command('choose-directory'))
  const signal=new AbortController().signal
  await assert.rejects(()=>app.dialogueSubmit('id-1',signal,()=>{selected='id-1'}),{code:'CONTEXT_MISMATCH'})
  assert.equal((await opening).value.state.activeProjectId,'other')
  await app.dialogueSubmit('other',signal,()=>{selected='other'})
  assert.equal(selected,'other')
})


test('la soumission Claude ne relance pas le lecteur de contexte après le démarrage natif',async()=>{
  let waitingForStdin=false,submissions=0
  const {dialogue}=await fixture({
    contexts:{capture:async()=>captured,assertFresh:async()=>{
      assert.equal(waitingForStdin,false,'la vérification complète précède le démarrage')
    }},
    openClaude:async(_,context,_signal,assertContext)=>({
      context:{connectionId:'claude-local',initiativeId:context.initiativeId},
      async turn(_,accepted){
        await assertContext()
        waitingForStdin=true
        await assertContext(()=>{submissions++})
        waitingForStdin=false
        await accepted()
        return 'Réponse'
      },
      stop:async()=> 'stopped'
    })
  })
  await dialogue.execute(command('launch-claude',{projectId:'id-1'}))
  await dialogue.settled()
  assert.equal(submissions,1)
  assert.equal(dialogue.read().turn.phase,'completed')
})
