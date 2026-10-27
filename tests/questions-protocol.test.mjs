import assert from 'node:assert/strict'
import {test} from 'node:test'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
import {DialogueRpc,startDialogueProtocol} from '../src/adapters/codex/dialogue.ts'
function nativeServer(options={}){
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();const requests=[];let buffer='',turn=0
 const emit=value=>child.stdout.write(JSON.stringify(value)+'\n')
 const raw=output=>emit({method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'function_call_output',call_id:'native-call',output}}})
 const complete=()=>{emit({method:'item/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'agentMessage',id:'native-message',text:'Dialogue poursuivi'}}});emit({method:'turn/completed',params:{threadId:'native-thread',turn:{id:'native-turn',status:'completed'}}})}
 child.stdin.on('data',chunk=>{buffer+=chunk;while(buffer.includes('\n')){const end=buffer.indexOf('\n'),m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);requests.push(m);const reply=result=>emit({id:m.id,result})
  if(m.method==='initialize')reply({})
  if(m.method==='model/list')reply({data:[{isDefault:true,hidden:false,model:'test-model'}]})
  if(m.method==='thread/start')reply({thread:{id:'native-thread'},modelProvider:'openai_chatgpt_plan',model:'test-model',sandbox:{type:'readOnly'},approvalPolicy:'never'})
  if(m.method==='turn/start'){turn++;const turnId=turn===1?'native-turn':'native-turn-'+turn;reply({turn:{id:turnId}});if(options.onTurn)options.onTurn(emit,turn,turnId);else for(const [id,kind] of [[100,'agent'],[101,'config']])emit({id,method:'item/tool/call',params:{threadId:'native-thread',turnId,callId:'resolve-'+id,tool:'bmad_resolve',arguments:{kind}}})}
  if(m.id===101&&m.result&&!options.noAutoQuestion)emit({id:0,method:'item/tool/requestUserInput',params:{threadId:'native-thread',turnId:'native-turn',itemId:'native-call',questions:[{id:'native-field',header:'Direction',question:'Quelle direction ?',isOther:true,isSecret:!!options.secret,options:[{label:'Alpha',description:'Voie A'},{label:'Beta',description:'Voie B'}]}],autoResolutionMs:options.expiry??null}})
  if(m.id===0&&m.result){options.onAnswer?.(m);if(options.autoAck){raw(JSON.stringify(m.result));complete()}}
 }});return {child,requests,emit,raw,complete}
}
const opts=signal=>({cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Mary'},signal,activity:()=>{},resolve:async()=>'{"agent":{"name":"Mary"}}',read:async()=>''})
test('RPC zéro conserve son type ; seul raw exact corrélé confirme la réponse après écriture',async()=>{
 const controller=new AbortController(),server=nativeServer(),rpc=new DialogueRpc(server.child,controller.signal,100),offers=[];let ready
 const offered=new Promise(r=>ready=r)
 try{
  const session=await startDialogueProtocol(rpc,opts(controller.signal),200),turn=session.turn(null,async()=>{},()=>{},async(q,handle)=>{offers.push({q,handle});ready()})
  await offered;assert.equal(JSON.stringify(offers[0].q).includes('native-'),false)
  let confirmed=false;const sending=offers[0].handle.answer({'field-1':'Alpha'}).then(()=>confirmed=true)
  while(!server.requests.some(m=>m.id===0&&m.result))await new Promise(r=>setImmediate(r))
  assert.deepEqual(server.requests.find(m=>m.id===0&&m.result),{id:0,result:{answers:{'native-field':{answers:['Alpha']}}}})
  server.emit({method:'serverRequest/resolved',params:{threadId:'native-thread',requestId:0}})
  server.emit({method:'rawResponseItem/completed',params:{threadId:'foreign',turnId:'native-turn',item:{type:'function_call_output',call_id:'native-call',output:JSON.stringify({answers:{'native-field':{answers:['Alpha']}}})}}})
  await new Promise(r=>setImmediate(r));assert.equal(confirmed,false)
  server.raw(JSON.stringify({answers:{'native-field':{answers:['Alpha']}}}));await sending;assert.equal(confirmed,true);server.complete();assert.equal(await turn,'Dialogue poursuivi')
 }finally{controller.abort();rpc.dispose()}
})
for(const mode of ['mismatch','absent','stop','expiry','secret'])test('aucun faux reçu ou réponse automatique : '+mode,async()=>{
 const controller=new AbortController(),server=nativeServer({secret:mode==='secret',expiry:mode==='expiry'?20:null}),rpc=new DialogueRpc(server.child,controller.signal,80);let ready
 const offered=new Promise(r=>ready=r)
 try{
  const session=await startDialogueProtocol(rpc,opts(controller.signal),100),turn=session.turn(null,async()=>{},()=>{},async(q,handle)=>ready({q,handle}));const failed=assert.rejects(turn)
  if(mode==='secret'){await failed;assert.equal(server.requests.some(m=>m.id===0&&m.result),false);return}
  const {handle}=await offered
  if(mode==='stop'){controller.abort();await handle.invalidated}
  else if(mode==='expiry'){await handle.invalidated}
  else {const sending=handle.answer({'field-1':'Alpha'});if(mode==='mismatch')server.raw(JSON.stringify({answers:{'native-field':{answers:['Beta']}}}));await assert.rejects(sending)}
  await failed
  if(mode==='stop'||mode==='expiry')assert.equal(server.requests.some(m=>m.id===0&&m.result),false)
 }finally{controller.abort();rpc.dispose()}
})
test('le délai du tour est suspendu pendant la saisie humaine puis le dialogue poursuit',async()=>{
 const controller=new AbortController(),server=nativeServer({autoAck:true}),rpc=new DialogueRpc(server.child,controller.signal,300);let ready
 const offered=new Promise(r=>ready=r)
 try{const session=await startDialogueProtocol(rpc,opts(controller.signal),40),turn=session.turn(null,async()=>{},()=>{},async(q,handle)=>ready(handle));const handle=await offered;await new Promise(r=>setTimeout(r,100));await handle.answer({'field-1':'Beta'});assert.equal(await turn,'Dialogue poursuivi')}finally{controller.abort();rpc.dispose()}
})
test('deux questions natives concurrentes invalident l’attente sans réponse par défaut',async()=>{
 const controller=new AbortController(),server=nativeServer(),rpc=new DialogueRpc(server.child,controller.signal,100);let ready
 const offered=new Promise(r=>ready=r)
 try{const session=await startDialogueProtocol(rpc,opts(controller.signal),200),turn=session.turn(null,async()=>{},()=>{},async(q,h)=>ready(h));const failed=assert.rejects(turn,{code:'CONTEXT_MISMATCH'}),handle=await offered;server.emit({id:1,method:'item/tool/requestUserInput',params:{threadId:'native-thread',turnId:'native-turn',itemId:'other-call',questions:[]}});await failed;await handle.invalidated;assert.equal(server.requests.some(m=>m.id===0&&m.result),false)}finally{controller.abort();rpc.dispose()}
})
test('un terminal natif pendant la saisie libère le drain sans choisir de réponse',async()=>{
 const controller=new AbortController(),server=nativeServer(),rpc=new DialogueRpc(server.child,controller.signal,100);let ready
 const offered=new Promise(r=>ready=r)
 try{const session=await startDialogueProtocol(rpc,opts(controller.signal),200),turn=session.turn(null,async()=>{},()=>{},async(q,h)=>ready(h));const failed=assert.rejects(turn),handle=await offered;server.complete();await failed;await handle.invalidated;assert.equal(server.requests.some(m=>m.id===0&&m.result),false)}finally{controller.abort();rpc.dispose()}
})
test('un terminal retire la question encore en file derrière un outil et garde le tour suivant utilisable',{timeout:3000},async()=>{
 const controller=new AbortController();let entered,release,offered,turn,following,offers=0
 const configEntered=new Promise(r=>entered=r),held=new Promise(r=>release=r),questionOffered=new Promise(r=>offered=r)
 const question=(turnId,callId)=>({id:0,method:'item/tool/requestUserInput',params:{threadId:'native-thread',turnId,itemId:callId,questions:[{id:'route',header:'Voie',question:'Quelle voie ?',isOther:true,isSecret:false,options:[]}]}})
 const server=nativeServer({noAutoQuestion:true,onTurn:(emit,index,turnId)=>{if(index===1)for(const [id,kind] of [[100,'agent'],[101,'config']])emit({id,method:'item/tool/call',params:{threadId:'native-thread',turnId,callId:'resolve-'+id,tool:'bmad_resolve',arguments:{kind}}});else{emit(question('native-turn','retired-call-late'));emit(question(turnId,'next-call'))}},onAnswer:message=>{
  server.emit({method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn-2',item:{type:'function_call_output',call_id:'next-call',output:JSON.stringify(message.result)}}})
  server.emit({method:'item/completed',params:{threadId:'native-thread',turnId:'native-turn-2',item:{type:'agentMessage',id:'next-message',text:'Suite validée'}}});server.emit({method:'turn/completed',params:{threadId:'native-thread',turn:{id:'native-turn-2',status:'completed'}}})
 }}),rpc=new DialogueRpc(server.child,controller.signal,300)
 try{
  const session=await startDialogueProtocol(rpc,{...opts(controller.signal),resolve:async kind=>{if(kind==='config'){entered();await held}return '{}'}},1000)
  turn=session.turn(null,async()=>{},()=>{},async(_q,handle)=>{offers++;offered(handle)});const settled=turn.then(()=>'settled',()=>'failed')
  await configEntered;server.emit(question('native-turn','retired-call'));server.complete();await new Promise(r=>setImmediate(r));release()
  assert.equal(await Promise.race([settled,questionOffered.then(()=>'offered'),new Promise(r=>setTimeout(()=>r('timeout'),200))]),'settled');assert.equal(offers,0);assert.equal(server.requests.some(m=>m.id===0&&(m.result||m.error)),false)
  following=session.turn('Suite',async()=>{},()=>{},async(_q,handle)=>{offers++;offered(handle)});const handle=await Promise.race([questionOffered,following.then(()=>null,()=>null),new Promise(r=>setTimeout(()=>r(null),200))]);assert.ok(handle,'Le tour suivant doit pouvoir présenter sa propre question');await handle.answer({'field-1':'Réponse suivante'})
  assert.equal(await following,'Suite validée');assert.equal(offers,1);assert.deepEqual(server.requests.filter(m=>m.id===0&&m.result),[{id:0,result:{answers:{route:{answers:['Réponse suivante']}}}}])
 }finally{release?.();controller.abort();rpc.dispose();await turn?.catch(()=>{});await following?.catch(()=>{})}
})
