import assert from 'node:assert/strict'
import {test} from 'node:test'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
import {DialogueRpc,startDialogueProtocol} from '../src/adapters/codex/dialogue.ts'
function server(mode='normal',commandsByTurn=null){
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough()
 const requests=[];let buffer='',turn=0,index=0
 const defaults=[['bmad_help_native',{kind:'knowledge'}],['bmad_help_native',{kind:'config'}],['bmad_help_read',{reference:'source-1'}],['bmad_help_read',{reference:'inventories'}]]
 let commands=defaults
 const emit=v=>child.stdout.write(JSON.stringify(v)+'\n')
 const complete=()=>{emit({method:'item/completed',params:{threadId:'thread-1',turnId:'turn-'+turn,item:{id:'answer-'+turn,type:'agentMessage',text:'Fin du tour. À vous de répondre.'}}});emit({method:'turn/completed',params:{threadId:'thread-1',turn:{id:'turn-'+turn,status:'completed'}}})}
 const tool=()=>{if(index===commands.length){complete();return}const [name,args]=commands[index++];emit({id:100+index,method:mode==='structured'?'item/tool/requestUserInput':'item/tool/call',params:{threadId:mode==='foreign'||mode==='foreign-check'&&name==='bmad_forge_check_sessions'?'other':'thread-1',turnId:mode==='foreign-check-turn'&&name==='bmad_forge_check_sessions'?'other-turn':'turn-'+turn,callId:mode==='duplicate'?'same':'tool-'+turn+'-'+index,tool:mode==='shell'?'shell':name,arguments:args}})}
 child.stdin.on('data',chunk=>{buffer+=chunk;while(buffer.includes('\n')){const end=buffer.indexOf('\n'),m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);requests.push(m);const reply=result=>emit({id:m.id,result});if(m.method==='initialize')reply({});if(m.method==='model/list')reply({data:[{model:'test-model',hidden:false,isDefault:true}]});if(m.method==='thread/start')reply({thread:{id:'thread-1'},modelProvider:'openai_chatgpt_plan',model:'test-model',sandbox:{type:'readOnly'},approvalPolicy:'never'});if(m.method==='turn/start'){turn++;index=0;commands=commandsByTurn?.[turn-1]??(turn===1?defaults:[]);reply({turn:{id:'turn-'+turn}});tool()}if(m.id>=101&&m.result)tool()}})
 return {child,requests}
}
const commands=[['bmad_help_native',{kind:'knowledge'}],['bmad_help_native',{kind:'config'}],['bmad_help_read',{reference:'source-1'}],['bmad_help_read',{reference:'inventories'}]]
async function helpSession(s,receipts,extra={},protocolOptions={},timeout=2000){
 const signal=new AbortController().signal,rpc=new DialogueRpc(s.child,signal,500)
 const help={bundle:{sources:[],inventories:['initiative/epic']},assertFresh:async()=>{},requiredReferences:()=>['source-1'],resolve:async kind=>JSON.stringify({native:kind}),read:async ref=>'snapshot '+ref,transmitted:async r=>{receipts.push(r)},...extra}
 const session=await startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'C:/owned/bmad/SKILL.md'},help,signal,activity:()=>{},resolve:async()=>{throw Error('Mary')},read:async()=>{throw Error('generic file')},...protocolOptions},timeout)
 return {rpc,session}
}
test('captured context checks pause the native wait budget while local guarded work is bounded separately',async()=>{
 const s=server(),receipts=[]
 const {rpc,session}=await helpSession(s,receipts,{}, {assertContext:async()=>new Promise(r=>setTimeout(r,120))},80)
 try{assert.equal(await session.turn(null,async()=>{}),'Fin du tour. À vous de répondre.');assert.equal(receipts.length,4)}finally{rpc.dispose()}
})
test('help sends exact native skill plus dedicated question and retains written tool receipts',async()=>{
 const s=server(),receipts=[],{rpc,session}=await helpSession(s,receipts)
 try{
  const text=await session.turn(null,async()=>{})
  assert.equal(text,'Fin du tour. À vous de répondre.')
  assert.deepEqual(s.requests.find(r=>r.method==='turn/start').params.input,[{type:'skill',name:'bmad',path:'C:/owned/bmad/SKILL.md'},{type:'text',text:'$bmad\nQue faire ensuite ?'}])
  assert.deepEqual(receipts.map(r=>r.operation),['knowledge','config','read','read'])
  assert.equal(receipts.every(r=>r.threadId==='thread-1'&&r.turnId==='turn-1'),true)
  assert.equal(s.requests.find(r=>r.method==='thread/start').params.dynamicTools.some(t=>t.name==='bmad_resolve'),false)
 }finally{rpc.dispose()}
})
for(const [label,steps] of [['no tools',[]],['no context',commands.slice(0,2)],['missing inventory',commands.slice(0,3)]]){
 test('first help terminal refuses '+label,async()=>{const s=server('normal',[steps]),receipts=[],{rpc,session}=await helpSession(s,receipts);try{await assert.rejects(session.turn(null,async()=>{}),{code:'PROVIDER_FAILED'})}finally{rpc.dispose()}})
}
test('help refuses a foreign tool before calling the native host',async()=>{const s=server('shell'),receipts=[],{rpc,session}=await helpSession(s,receipts);try{await assert.rejects(session.turn(null,async()=>{}),{code:'UNSUPPORTED_INTERACTION'});assert.deepEqual(receipts,[])}finally{rpc.dispose()}})
test('native bundle receipt storage failure cannot produce a completed recommendation',async()=>{const s=server(),receipts=[],{rpc,session}=await helpSession(s,receipts,{transmitted:async()=>{throw Error('disk')}});try{await assert.rejects(session.turn(null,async()=>{}),e=>['STORAGE_WRITE_FAILED','PROVIDER_FAILED'].includes(e.code))}finally{rpc.dispose()}})
test('encoded excessive native response is refused before successful tool transmission',async()=>{
 const s=server(),receipts=[],{rpc,session}=await helpSession(s,receipts,{resolve:async()=>'"'.repeat(600000)})
 try{await assert.rejects(session.turn(null,async()=>{}),{code:'OUTPUT_REFUSED'});assert.deepEqual(receipts,[]);assert.equal(s.requests.some(r=>r.result?.success),false)}finally{rpc.dispose()}
})
test('foreign native thread and duplicate call ids are refused with no successful recommendation',async()=>{
 for(const mode of ['foreign','duplicate']){
  const s=server(mode),receipts=[],{rpc,session}=await helpSession(s,receipts)
  try{await assert.rejects(session.turn(null,async()=>{}),{code:'CONTEXT_MISMATCH'})}finally{rpc.dispose()}
 }
})

test('one closed context batch satisfies every required source only after its actual written response',async()=>{
 const {helpContextText}=await import('../src/contracts/bmad-help.ts')
 const bundle={sources:[{id:'source-1',snapshot:'C:/owned/project/initiative.md',sha256:'a'.repeat(64),text:'Whole initiative'}],inventories:['epic/']}
 const steps=[commands[0],commands[1],['bmad_help_read',{reference:'required-context'}]],s=server('normal',[steps]),receipts=[]
 const {rpc,session}=await helpSession(s,receipts,{bundle,read:async reference=>{assert.equal(reference,'required-context');return helpContextText(bundle)},preferredReferences:()=>['required-context']})
 try{
  await session.turn(null,async()=>{})
  assert.equal(receipts.length,3)
  assert.equal(receipts[2].reference,'required-context')
  assert.equal(receipts[2].raw,helpContextText(bundle))
  assert.equal(receipts.filter(r=>r.operation==='read').length,1)
 }finally{rpc.dispose()}
})
test('wrong batch mapping is refused before an apparent complete recommendation',async()=>{
 const s=server('normal',[[commands[0],commands[1],['bmad_help_read',{reference:'required-context'}]]]),receipts=[]
 const {rpc,session}=await helpSession(s,receipts,{read:async()=>JSON.stringify({sources:[],inventories:[]})})
 try{await assert.rejects(session.turn(null,async()=>{}),{code:'PROVIDER_FAILED'})}finally{rpc.dispose()}
})

test('cumulative encoded tool buffers are bounded at eight MiB with no fabricated transmission after refusal',async()=>{
 const repeated=[commands[0],commands[1],...Array.from({length:12},()=>commands[2]),commands[3]],s=server('normal',[repeated]),receipts=[]
 const {rpc,session}=await helpSession(s,receipts,{resolve:async()=> 'x'.repeat(700000),read:async()=> 'x'.repeat(700000)})
 try{await assert.rejects(session.turn(null,async()=>{}),{code:'OUTPUT_REFUSED'});assert.ok(receipts.length<repeated.length)}finally{rpc.dispose()}
})
