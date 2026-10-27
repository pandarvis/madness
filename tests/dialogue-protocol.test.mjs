import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { Application } from '../src/core/application.ts'
import { DialogueCoordinator } from '../src/core/dialogue.ts'
import { emptySnapshot } from '../src/contracts/index.ts'
import {releaseVersion} from '../src/adapters/release-version.ts'
const native = await import('../src/adapters/codex/dialogue.ts').catch(() => null)
function server(options = {}) {
  const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough()
  const requests = []; let data = '', turn = 0
  const emit = value => child.stdout.write(JSON.stringify(value) + '\n')
  child.stdin.on('data', chunk => {
    data += chunk
    while (data.includes('\n')) {
      const end = data.indexOf('\n'), message = JSON.parse(data.slice(0, end)); data = data.slice(end + 1); requests.push(message)
      const reply = result => emit({ id: message.id, result })
      if (message.method === 'initialize') { assert.equal(message.params.clientInfo.version,releaseVersion); reply({}) }
      if (message.method === 'model/list') reply({ data: [{ model: 'test-model', isDefault: true, hidden: false }] })
      if (message.method === 'thread/start') reply({ thread: { id: 'thread-1' }, modelProvider: 'openai_chatgpt_plan', model: 'test-model', sandbox: { type: 'readOnly' }, approvalPolicy: 'never' })
      if (message.method === 'turn/start') {
        turn++; options.beforeReply?.(emit,turn);reply({ turn: { id: 'turn-' + turn, status: 'inProgress' } })
        if (options.unsupported) emit({ id: 'bad-request', method: 'item/tool/requestUserInput', params: { threadId: 'thread-1', turnId: 'turn-' + turn } })
        else if (turn === 1) for (const [id, kind] of [[100, 'agent'], [101, 'config']]) emit({ id, method: 'item/tool/call', params: { threadId: options.foreign ? 'foreign' : 'thread-1', turnId: 'turn-' + turn, callId: 'call-' + id, tool: 'bmad_resolve', arguments: { kind } } })
        else complete()
      }
      if (message.id === 101 && message.result) complete()
    }
  })
  function complete() {
    if(options.events){options.events(emit,turn);return}
    if (options.stream) {
      const base = { threadId: 'thread-1', turnId: 'turn-' + turn, itemId: 'answer-' + turn }
      emit({ method:'item/agentMessage/delta', params:{...base,threadId:'foreign',delta:'Étranger'} })
      for (let i=0;i<1200;i++) emit({method:'item/agentMessage/delta',params:{...base,delta:'a'}})
      emit({method:'item/completed',params:{threadId:base.threadId,turnId:base.turnId,item:{type:'agentMessage',id:base.itemId,text:'a'.repeat(1200)}}})
      emit({method:'item/completed',params:{threadId:base.threadId,turnId:base.turnId,item:{type:'agentMessage',id:'other-'+turn,text:'a'.repeat(1200)}}})
    } else emit({ method: 'item/completed', params: { threadId: 'thread-1', turnId: options.badTurn ? 'foreign' : 'turn-' + turn, item: { type: 'agentMessage', id: 'answer-' + turn, text: turn === 1 ? '📊 Mary\nBP · MR · CB' : 'Voici ma réponse.' } } })
    emit({ method: 'turn/completed', params: { threadId: 'thread-1', turn: { id: 'turn-' + turn, status: options.failed ? 'failed' : 'completed' } } })
  }
  return { child, requests, emit }
}

test('les deltas corrélés sont projetés après acquittement, réconciliés par item sans dédoublonner le texte',async()=>{
 const s=server({stream:true}),rpc=new native.DialogueRpc(s.child,new AbortController().signal,300),updates=[]
 let acknowledged=false
 const session=await native.startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Mary'},signal:new AbortController().signal,activity:()=>{},resolve:async kind=>JSON.stringify(kind==='agent'?{agent:{name:'Mary'}}:{}),read:async()=>''},1000)
 try {
  const text=await session.turn(null,async()=>{await new Promise(r=>setTimeout(r,10));acknowledged=true},update=>{assert.equal(acknowledged,true);updates.push(structuredClone(update))})
  assert.equal(text,'a'.repeat(1200)+'\n\n'+'a'.repeat(1200))
  assert.ok(updates.some(u=>!u.completed&&u.text.length>0),'progression avant item complet')
  assert.equal(new Set(updates.map(u=>u.id)).size,2)
  assert.ok(updates.every(u=>!JSON.stringify(u).includes('answer-1')&&!JSON.stringify(u).includes('thread-1')))
  assert.deepEqual(updates.at(-1).identity,{kind:'attested',name:'Mary',source:'bmad_resolve(agent)'})
 }finally{rpc.dispose()}
})

test('une identité attestée dans un tour ne réattribue pas les tours suivants sans nouvelle preuve',async()=>{
 const s=server(),rpc=new native.DialogueRpc(s.child,new AbortController().signal,300),updates=[]
 try{
  const session=await native.startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Mary'},signal:new AbortController().signal,activity:()=>{},resolve:async kind=>JSON.stringify(kind==='agent'?{agent:{name:'Mary'}}:{}),read:async()=>''},500)
  await session.turn(null,async()=>{},m=>updates.push(m));assert.equal(updates.at(-1).identity.name,'Mary')
  await session.turn('Quitter le rôle',async()=>{},m=>updates.push(m));assert.deepEqual(updates.at(-1).identity,{kind:'unknown'})
 }finally{rpc.dispose()}
})

const protocolOptions=()=>({cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Mary'},signal:new AbortController().signal,activity:()=>{},resolve:async()=>'{"agent":{"name":"Mary"}}',read:async()=>''})
const delta=(turn,itemId,text,threadId='thread-1')=>({method:'item/agentMessage/delta',params:{threadId,turnId:'turn-'+turn,itemId,delta:text}})
const item=(turn,id,text)=>({method:'item/completed',params:{threadId:'thread-1',turnId:'turn-'+turn,item:{id,type:'agentMessage',text}}})
const terminal=turn=>({method:'turn/completed',params:{threadId:'thread-1',turn:{id:'turn-'+turn,status:'completed'}}})

for(const mode of ['error','abort'])test('les notifications admises sont drainées avant '+mode+' et gardent tout le partiel',async()=>{
 const controller=new AbortController(),updates=[]
 const s=server({events:(_emit,turn)=>{
  const events=[delta(turn,'one','Début '),delta(turn,'one','du texte '),delta(turn,'one','reçu')]
  if(mode==='error')events.push({method:'error',params:{message:'échec natif'}})
  s.child.stdout.write(events.map(value=>JSON.stringify(value)+'\n').join(''))
  if(mode==='abort')controller.abort()
 }}),rpc=new native.DialogueRpc(s.child,controller.signal,300)
 try{
  const session=await native.startDialogueProtocol(rpc,{...protocolOptions(),signal:controller.signal},1000)
  await assert.rejects(session.turn(null,async()=>{},message=>updates.push(message)),{code:mode==='abort'?'CANCELLED':'PROVIDER_FAILED'})
  assert.equal(updates.at(-1)?.text,'Début du texte reçu');assert.equal(updates.at(-1)?.completed,false)
 }finally{rpc.dispose()}
})

for(const mode of ['error','abort'])test('un terminal admis avant '+mode+' ne devient jamais un succès',async()=>{
 const controller=new AbortController(),updates=[]
 const s=server({events:(_emit,turn)=>{
  const events=[delta(turn,'one','Texte '),delta(turn,'one','reçu'),item(turn,'one','Texte reçu'),terminal(turn)]
  if(mode==='error')events.push({method:'error',params:{message:'échec natif'}})
  s.child.stdout.write(events.map(value=>JSON.stringify(value)+'\n').join(''))
  if(mode==='abort')controller.abort()
 }}),rpc=new native.DialogueRpc(s.child,controller.signal,300)
 try{
  const session=await native.startDialogueProtocol(rpc,{...protocolOptions(),signal:controller.signal},1000)
  await assert.rejects(session.turn(null,async()=>{},message=>updates.push(message)),{code:mode==='abort'?'CANCELLED':'PROVIDER_FAILED'})
  assert.equal(updates.at(-1)?.text,'Texte reçu');assert.equal(updates.at(-1)?.completed,true)
 }finally{rpc.dispose()}
})

test('un item démarré vide réserve son ordre dans le cœur et garde son identité pendant l’entrelacement A/B',async()=>{
 const s=server({beforeReply:(emit,turn)=>emit({method:'item/started',params:{threadId:'thread-1',turnId:'turn-'+turn,item:{id:'A',type:'agentMessage',text:''}}}),events:(emit,turn)=>{emit(delta(turn,'B','Second'));emit(item(turn,'B','Second'));emit(item(turn,'A','Premier'));emit(terminal(turn))}}),rpc=new native.DialogueRpc(s.child,new AbortController().signal,300),updates=[]
 let stored=emptySnapshot(),counter=0
 const application=new Application({store:{read:async()=>structuredClone(stored),write:async value=>{stored=structuredClone(value)}},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({name:'Projet',rootPath:'C:/project'})})
 await application.execute({contractVersion:1,correlationId:'choose-project',type:'choose-directory'})
 const protocol=await native.startDialogueProtocol(rpc,protocolOptions(),1000)
 const dialogue=new DialogueCoordinator({application,qualify:async()=>({rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async()=>({context:{connectionId:'account-1',initiativeId:null},turn:(text,accepted,observe)=>protocol.turn(text,accepted,update=>{updates.push(update);observe(update)}),stop:async()=>'stopped'})})
 try{
  await dialogue.execute({contractVersion:1,correlationId:'interleaved-launch',type:'launch',projectId:'id-1'});await dialogue.settled()
  assert.equal(dialogue.read().status,'ready');assert.equal(dialogue.read().errorCode,null)
  assert.deepEqual(updates[0],{id:'message-1',order:1,text:'',completed:false,identity:{kind:'unknown'}})
  assert.deepEqual(dialogue.read().messages.map(m=>({text:m.text,identity:m.identity})),[{text:'Premier',identity:{kind:'unknown'}},{text:'Second',identity:{kind:'attested',name:'Mary',source:'bmad_resolve(agent)'}}])
  assert.deepEqual(stored.conversations[0].messages.map(m=>m.text),['$bmad-agent-analyst','Premier','Second'])
 }finally{await dialogue.shutdown();rpc.dispose()}
})

for(const mode of ['foreign','old-turn','current'])test('le contexte est filtré avant la limite métier d’une rafale agrégée : '+mode,async()=>{
 const s=server({beforeReply:(emit,turn)=>{
  if(turn!==2)return
  const sourceTurn=mode==='old-turn'?1:turn,threadId=mode==='foreign'?'foreign-thread':'thread-1'
  emit(delta(sourceTurn,'burst','x'.repeat(60000),threadId));emit(delta(sourceTurn,'burst','x'.repeat(60000),threadId))
 },events:(emit,turn)=>{emit(item(turn,'valid','Réponse courante '+turn));emit(terminal(turn))}}),rpc=new native.DialogueRpc(s.child,new AbortController().signal,300)
 try{
  const session=await native.startDialogueProtocol(rpc,protocolOptions(),1000),updates=[];await session.turn(null,async()=>{})
  let accepted=false
  const sending=session.turn('Suite',async()=>{accepted=true},message=>updates.push(message))
  if(mode==='current'){
   await assert.rejects(sending,{code:'PROVIDER_FAILED'});assert.equal(accepted,true);assert.equal(updates.at(-1)?.text.length,60000)
  }else{
   assert.equal(await sending,'Réponse courante 2');assert.equal(accepted,true);assert.deepEqual(updates.map(m=>m.text),['Réponse courante 2'])
  }
 }finally{rpc.dispose()}
})
test('événements avant réponse RPC et tardifs sont filtrés ; identité initiale et ordre des items restent figés',async()=>{
 const s=server({beforeReply:(emit,turn)=>emit(delta(turn,'early','Premier')),events:(emit,turn)=>{emit(delta(turn,'second','Second'));emit(item(turn,'second','Second complet'));emit(item(turn,'early','Premier complet'));emit(item(turn,'early','Premier complet'));emit(terminal(turn))}}),rpc=new native.DialogueRpc(s.child,new AbortController().signal,300)
 try{
  const session=await native.startDialogueProtocol(rpc,protocolOptions(),1000),updates=[];let accepted=false
  assert.equal(await session.turn(null,async()=>{accepted=true},m=>{assert.equal(accepted,true);updates.push(m)}),'Premier complet\n\nSecond complet')
  assert.deepEqual(updates[0].identity,{kind:'unknown'});assert.equal(updates.at(-1).identity.kind,'unknown')
  assert.equal(updates.find(m=>m.id==='message-2').identity.name,'Mary')
  s.emit(delta(1,'late','À ignorer'));s.emit(terminal(1));const next=[]
  assert.equal(await session.turn('Suite',async()=>{},m=>next.push(m)),'Premier complet\n\nSecond complet')
  assert.equal(next.some(m=>m.text.includes('ignorer')),false)
 }finally{rpc.dispose()}
})
for(const mode of ['mismatch','incomplete','overflow','invalid-id'])test('flux incohérent ou hors borne refusé : '+mode,async()=>{
 const s=server({events:emit=>{emit(delta(1,mode==='invalid-id'?42:'one',mode==='overflow'?'x'.repeat(100001):'Préfixe'));if(!['incomplete','invalid-id','overflow'].includes(mode))emit(item(1,'one','Autre texte'));emit(terminal(1))}}),rpc=new native.DialogueRpc(s.child,new AbortController().signal,300)
 try{const session=await native.startDialogueProtocol(rpc,protocolOptions(),1000);await assert.rejects(session.turn(null,async()=>{},()=>{}),{code:'PROVIDER_FAILED'})}finally{rpc.dispose()}
})
test('les identifiants des réponses RPC ne sont pas convertis et les appels natifs simultanés ne se confondent pas',async()=>{
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough()
 const rpc=new native.DialogueRpc(child,new AbortController().signal,300)
 try{const request=rpc.call('initialize',{});child.stdout.write(JSON.stringify({id:'1',result:{}})+'\n');await assert.rejects(request,{code:'PROVIDER_FAILED'})}finally{rpc.dispose()}
 const s=server({beforeReply:emit=>{for(const callId of ['call-a','call-b'])emit({id:'same-rpc',method:'item/tool/call',params:{threadId:'thread-1',turnId:'turn-1',callId,tool:'bmad_resolve',arguments:{kind:'agent'}}})}}),other=new native.DialogueRpc(s.child,new AbortController().signal,300)
 try{const session=await native.startDialogueProtocol(other,protocolOptions(),1000);await assert.rejects(session.turn(null,async()=>{}),{code:'CONTEXT_MISMATCH'})}finally{other.dispose()}
})
test('injection native skill et outils bornés produisent accueil puis réponse sur le même thread', async () => {
  assert.ok(native, 'Le dialogue natif doit exister')
  const s = server(), rpc = new native.DialogueRpc(s.child, new AbortController().signal, 300)
  const resolved = [], activity = []
  const session = await native.startDialogueProtocol(rpc, { cwd: 'C:/isolated', profile: { rootPath: 'C:/project', skillPath: 'C:/project/.agents/skills/bmad-agent-analyst/SKILL.md' }, signal: new AbortController().signal, activity: text => activity.push(text), resolve: async kind => { resolved.push(kind); return '{}' }, read: async () => '' }, 500)
  let accepted = 0
  assert.match(await session.turn(null, async () => { accepted++ }), /Mary/)
  assert.equal(await session.turn('Bonjour', async () => { accepted++ }), 'Voici ma réponse.')
  assert.deepEqual(resolved, ['agent', 'config']); assert.equal(accepted, 2)
  const turns = s.requests.filter(r => r.method === 'turn/start')
  assert.equal(turns[0].params.input[0].type, 'skill'); assert.equal(turns[0].params.input[0].name, 'bmad-agent-analyst')
  assert.deepEqual(turns[1].params.input, [{ type: 'text', text: 'Bonjour' }]); assert.equal(turns[1].params.threadId, turns[0].params.threadId)
  const started = s.requests.find(r => r.method === 'thread/start')
  assert.equal(started.params.sandbox, 'read-only'); assert.equal(started.params.approvalPolicy, 'never'); assert.equal(started.params.dynamicTools.length, 3)
  rpc.dispose()
})
test('demandes structurées, contexte étranger et fin native échouée ne sont jamais un succès', async () => {
  assert.ok(native)
  for (const option of [{ unsupported: true }, { foreign: true }, { failed: true }, { badTurn: true }]) {
    const s = server(option), rpc = new native.DialogueRpc(s.child, new AbortController().signal, 100)
    try {
      const session = await native.startDialogueProtocol(rpc, { cwd: 'C:/isolated', profile: { rootPath: 'C:/project', skillPath: 'Mary' }, signal: new AbortController().signal, activity: () => {}, resolve: async () => '{}', read: async () => '' }, 150)
      await assert.rejects(session.turn(null, async () => {}), error => ['UNSUPPORTED_INTERACTION', 'PROVIDER_FAILED', 'CONTEXT_MISMATCH'].includes(error.code))
    } finally { rpc.dispose() }
  }
})
