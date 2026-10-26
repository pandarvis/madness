import assert from 'node:assert/strict'
import {test} from 'node:test'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
import {DialogueRpc,startDialogueProtocol} from '../src/adapters/codex/dialogue.ts'
function server(mode='normal',commandsByTurn=null){
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough()
 const requests=[];let buffer='',turn=0,index=0
 const defaults=[['bmad_forge_resolve',{kind:'workflow'}],['bmad_forge_resolve',{kind:'config'}],['bmad_forge_resolve',{kind:'personas'}],['bmad_forge_init',{slug:'test',idea:'Idée témoin',goal:'Tester'}]]
 let commands=defaults
 const emit=v=>child.stdout.write(JSON.stringify(v)+'\n')
 const complete=()=>{emit({method:'item/completed',params:{threadId:'thread-1',turnId:'turn-'+turn,item:{id:'answer-'+turn,type:'agentMessage',text:'Fin du tour. À vous de répondre.'}}});emit({method:'turn/completed',params:{threadId:'thread-1',turn:{id:'turn-'+turn,status:'completed'}}})}
 const tool=()=>{if(index===commands.length){complete();return}const [name,args]=commands[index++];emit({id:100+index,method:mode==='structured'?'item/tool/requestUserInput':'item/tool/call',params:{threadId:mode==='foreign'?'other':'thread-1',turnId:'turn-'+turn,callId:mode==='duplicate'?'same':'tool-'+turn+'-'+index,tool:mode==='shell'?'shell':name,arguments:args}})}
 child.stdin.on('data',chunk=>{buffer+=chunk;while(buffer.includes('\n')){const end=buffer.indexOf('\n'),m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);requests.push(m);const reply=result=>emit({id:m.id,result});if(m.method==='initialize')reply({});if(m.method==='model/list')reply({data:[{model:'test-model',hidden:false,isDefault:true}]});if(m.method==='thread/start')reply({thread:{id:'thread-1'},modelProvider:'openai_chatgpt_plan',model:'test-model',sandbox:{type:'readOnly'},approvalPolicy:'never'});if(m.method==='turn/start'){turn++;index=0;commands=commandsByTurn?.[turn-1]??(turn===1?defaults:[]);reply({turn:{id:'turn-'+turn}});tool()}if(m.id>=101&&m.result)tool()}})
 return {child,requests}
}
test('Forge utilise référence skill native, commandes strictes corrélées et même thread sans brouillon',async()=>{
 const s=server(),signal=new AbortController().signal,rpc=new DialogueRpc(s.child,signal,300),operations=[]
 const forge={profile:{forge:{outputBase:'C:/project/_bmad-output/initiative-test'}},execute:async(op,call,turn)=>{operations.push({op,call,turn});return '{}'}}
 const session=await startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'C:/project/.agents/skills/bmad-forge-idea/SKILL.md'},forge,signal,activity:()=>{},read:async()=>'',resolve:async()=>{throw Error('Mary ne doit pas être utilisée')}},1000)
 const progress=[]
 await session.turn(null,async()=>{},message=>progress.push(message));await session.turn('Ma réponse explicite',async()=>{},message=>progress.push(message))
 assert.equal(progress.length,2);assert.equal(progress.every(m=>m.completed&&m.identity.kind==='unknown'),true)
 const start=s.requests.find(r=>r.method==='thread/start').params,turns=s.requests.filter(r=>r.method==='turn/start')
 assert.equal(start.sandbox,'read-only');assert.equal(start.approvalPolicy,'never');assert.equal(start.dynamicTools.some(t=>t.name==='shell'),false)
 assert.deepEqual(turns[0].params.input,[{type:'skill',name:'bmad-forge-idea',path:'C:/project/.agents/skills/bmad-forge-idea/SKILL.md'},{type:'text',text:'$bmad-forge-idea'}])
 assert.deepEqual(turns[1].params.input,[{type:'text',text:'Ma réponse explicite'}]);assert.equal(turns[0].params.threadId,turns[1].params.threadId)
 assert.deepEqual(operations.map(v=>v.op.kind),['workflow','config','personas','init']);assert.equal(operations.every(v=>v.turn==='turn-1'),true)
 rpc.dispose()
})
for(const mode of ['foreign','duplicate','structured','shell'])test('Forge refuse '+mode+' sans faux résultat',async()=>{
 const s=server(mode),signal=new AbortController().signal,rpc=new DialogueRpc(s.child,signal,300),operations=[]
 try{const session=await startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Forge'},forge:{profile:{forge:{outputBase:'C:/project/_bmad-output'}},execute:async op=>{operations.push(op);return '{}'}},signal,activity:()=>{},read:async()=>'',resolve:async()=>''},500);await assert.rejects(session.turn(null,async()=>{}),e=>['CONTEXT_MISMATCH','UNSUPPORTED_INTERACTION'].includes(e.code));assert.equal(operations.some(op=>op.kind==='init'),false)}finally{rpc.dispose()}
})
const activation=[['bmad_forge_resolve',{kind:'workflow'}],['bmad_forge_resolve',{kind:'config'}]]
const init=['bmad_forge_init',{idea:'Idée témoin nouvelle',goal:'Clarifier les risques',slug:'ordre-natif'}]
const personas=['bmad_forge_resolve',{kind:'personas'}]
const finish=['bmad_forge_finish',{outcome:'CLARIFIED'}]
async function forgeSession(s,operations){
 const signal=new AbortController().signal,rpc=new DialogueRpc(s.child,signal,300)
 const session=await startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'C:/project/.agents/skills/bmad-forge-idea/SKILL.md'},forge:{profile:{forge:{outputBase:'C:/project/_bmad-output/initiative-test'}},execute:async(op,callId,turnId)=>{operations.push({op,callId,turnId});return '{}'}},signal,activity:()=>{},read:async()=>'',resolve:async()=>{throw Error('Mary ne doit pas être utilisée')}},1000)
 return {session,rpc}
}
test('ordre natif installé : init après config, puis personas avant la clôture sur le même thread',async()=>{
 const s=server('normal',[activation,[init,personas,finish]]),operations=[]
 const {session,rpc}=await forgeSession(s,operations)
 try{
  await session.turn(null,async()=>{})
  await session.turn('Nouvelle idée synthétique ; objectif : clarifier les risques.',async()=>{})
  assert.deepEqual(operations.map(v=>v.op.kind),['workflow','config','init','personas','finish'])
  assert.deepEqual(operations.slice(2).map(v=>v.turnId),['turn-2','turn-2','turn-2'])
  assert.deepEqual(operations[2].op,{kind:'init',idea:'Idée témoin nouvelle',goal:'Clarifier les risques',slug:'ordre-natif'})
 }finally{rpc.dispose()}
})
test('init peut précéder personas mais la clôture sans personas est refusée avant l’outil hôte',async()=>{
 const s=server('normal',[activation,[init,finish]]),operations=[]
 const {session,rpc}=await forgeSession(s,operations)
 try{
  await session.turn(null,async()=>{})
  await assert.rejects(session.turn('Nouvelle idée synthétique ; objectif connu.',async()=>{}),{code:'UNSUPPORTED_INTERACTION'})
  assert.deepEqual(operations.map(v=>v.op.kind),['workflow','config','init'])
 }finally{rpc.dispose()}
})
test('init reste refusé avant la résolution de configuration native',async()=>{
 const s=server('normal',[[activation[0],init]]),operations=[]
 const {session,rpc}=await forgeSession(s,operations)
 try{
  await assert.rejects(session.turn(null,async()=>{}),{code:'UNSUPPORTED_INTERACTION'})
  assert.deepEqual(operations.map(v=>v.op.kind),['workflow'])
 }finally{rpc.dispose()}
})
