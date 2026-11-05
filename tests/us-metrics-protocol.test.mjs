import test from 'node:test'
import assert from 'node:assert/strict'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
import {DialogueRpc,startDialogueProtocol} from '../src/adapters/codex/dialogue.ts'
function fixture(){const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let lines='';child.stdin.on('data',b=>{lines+=b;while(lines.includes('\n')){const end=lines.indexOf('\n'),m=JSON.parse(lines.slice(0,end));lines=lines.slice(end+1);let result
 if(m.method==='initialize')result={};if(m.method==='model/list')result={data:[{model:'test-model',isDefault:true,hidden:false}]};if(m.method==='thread/start')result={thread:{id:'thread'},modelProvider:'openai_chatgpt_plan',model:'test-model',sandbox:{type:'readOnly'},approvalPolicy:'never'}
 if(m.method==='turn/start'){child.stdout.write([{id:m.id,result:{turn:{id:'native',status:'inProgress'}}},{method:'turn/completed',params:{threadId:'thread',turn:{id:'native',status:'failed'}}}].map(v=>JSON.stringify(v)+'\n').join(''));continue}
 if(result)child.stdout.write(JSON.stringify({id:m.id,result})+'\n')
}});return child}
test('T4 receive timing precedes blocked ACK continuation and drain in same JSONL chunk',async()=>{
 const child=fixture(),receipts=[],times=[1000,601000],rpc=new DialogueRpc(child,new AbortController().signal,1000,{clock:()=>times.shift(),domain:'clock',runId:'run',sessionId:'session'})
 const session=await startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Mary'},signal:new AbortController().signal,activity:()=>{},resolve:async()=>'',read:async()=>''},1000)
 let release;const blocked=new Promise(r=>release=r);const work=session.turn(null,async()=>{await blocked},undefined,undefined,undefined,{assertFresh:async()=>{},receive:r=>receipts.push(r)})
 try{await new Promise(r=>setTimeout(r,20));assert.deepEqual(receipts.map(r=>[r.phase,r.at,r.outcome]),[['ack',1000,null],['terminal',601000,'failed']])}finally{release();await work.catch(()=>{});rpc.dispose()}
})
test('T5 close instant is retained at child close and admitted only by ownership confirmation',async()=>{
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let at=1000
 child.stdin.on('data',b=>{const m=JSON.parse(b);child.stdout.write(JSON.stringify({id:m.id,result:{turn:{id:'native',status:'inProgress'}}})+'\n')})
 const receipts=[],rpc=new DialogueRpc(child,new AbortController().signal,1000,{clock:()=>at,domain:'clock',runId:'run',sessionId:'session'});rpc.armTurn('thread',{assertFresh:async()=>{},receive:r=>receipts.push(r)})
 await rpc.call('turn/start',{});rpc.confirmOwnedClose();assert.equal(receipts.length,1)
 at=601000;child.emit('close');assert.equal(receipts.length,1);at=999999;rpc.confirmOwnedClose();assert.deepEqual(receipts.map(r=>[r.phase,r.at]),[['ack',1000],['close',601000]]);rpc.dispose()
})
test('T4/T10 foreign terminal and native duration fields cannot manufacture a local bound',async()=>{
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let at=1000
 child.stdin.on('data',b=>{const m=JSON.parse(b);child.stdout.write(JSON.stringify({id:m.id,result:{turn:{id:'native',status:'inProgress',startedAt:0,durationMs:0}}})+'\n')})
 const receipts=[],rpc=new DialogueRpc(child,new AbortController().signal,1000,{clock:()=>at,domain:'clock',runId:'run',sessionId:'session'});rpc.armTurn('thread',{assertFresh:async()=>{},receive:r=>receipts.push(r)})
 await rpc.call('turn/start',{});child.stdout.write(JSON.stringify({method:'turn/completed',params:{threadId:'foreign',turn:{id:'native',status:'completed',durationMs:0},receipt:{phase:'terminal',at:1000}}})+'\n');assert.deepEqual(receipts.map(r=>r.phase),['ack']);rpc.dispose()
})
test('T6 identical native terminal payload repetition keeps first receipt; changed payload remains a conflict',async()=>{
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let at=1000
 child.stdin.on('data',b=>{const m=JSON.parse(b);child.stdout.write(JSON.stringify({id:m.id,result:{turn:{id:'native',status:'inProgress'}}})+'\n')})
 const receipts=[],rpc=new DialogueRpc(child,new AbortController().signal,1000,{clock:()=>at,domain:'clock',runId:'run',sessionId:'session'});rpc.armTurn('thread',{assertFresh:async()=>{},receive:r=>receipts.push(r)})
 const emit=turn=>child.stdout.write(JSON.stringify({method:'turn/completed',params:{threadId:'thread',turn}})+'\n')
 await rpc.call('turn/start',{});at=601000;emit({id:'native',status:'completed',error:null});at=701000;emit({status:'completed',error:null,id:'native'});assert.equal(receipts.length,2)
 at=801000;emit({id:'native',status:'completed',error:{message:'different native payload'}});assert.equal(receipts.length,3);assert.notEqual(receipts[1].payloadDigest,receipts[2].payloadDigest);rpc.dispose()
})
import {summarizeTurns} from '../src/core/us-metrics.ts'
test('T6 late previous-turn JSONL terminals keep their original observer after the next ACK',async()=>{
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let at=1000,sequence=0
 child.stdin.on('data',b=>{const m=JSON.parse(b);child.stdout.write(JSON.stringify({id:m.id,result:{turn:{id:'native-'+ ++sequence,status:'inProgress'}}})+'\n')})
 const old=[],current=[],rpc=new DialogueRpc(child,new AbortController().signal,1000,{clock:()=>at,domain:'clock',runId:'run',sessionId:'session'})
 const emit=(id,status,error=null)=>child.stdout.write(JSON.stringify({method:'turn/completed',params:{threadId:'thread',turn:{id,status,error}}})+'\n')
 const record=(id,receipts)=>({id,localTurnId:id,requestId:'request-1',context:{projectId:'p',initiativeId:null,conversationId:'c',providerId:'codex',connectionId:'account'},story:null,receipts})
 try{
  rpc.armTurn('thread',{assertFresh:async()=>{},receive:r=>old.push(r)});await rpc.call('turn/start',{});at=601000;emit('native-1','completed')
  at=701000;rpc.armTurn('thread',{assertFresh:async()=>{},receive:r=>current.push(r)});await rpc.call('turn/start',{})
  at=801000;emit('native-1','completed');assert.equal(old.length,2);assert.equal(current.length,1)
  at=901000;emit('native-1','completed',{message:'contradictory late payload'});assert.equal(summarizeTurns([record('old',old)]).knownMs,null)
  assert.equal(old.length,3);assert.equal(current.length,1);assert.equal(old[2].nativeTurnId,'native-1')
  at=1301000;emit('native-2','completed');assert.equal(summarizeTurns([record('current',current)]).knownMs,600000)
 }finally{rpc.dispose()}
})
