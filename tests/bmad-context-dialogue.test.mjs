import test from 'node:test'
import assert from 'node:assert/strict'
import {Application} from '../src/core/application.ts'
import {emptySnapshot} from '../src/contracts/index.ts'
import {DialogueCoordinator} from '../src/core/dialogue.ts'
import {BmadContextCoordinator} from '../src/core/bmad-context.ts'
const cmd=(type,x={})=>({contractVersion:1,correlationId:'context-dialogue-test',type,...x})
async function fixture(options={}){
 let snapshot=emptySnapshot(),counter=0,revision='a'.repeat(64),reads=0,opens=0,turns=0,stops=0
 const application=new Application({store:{read:async()=>snapshot,write:async s=>{snapshot=structuredClone(s);await options.write?.(s,()=>revision='c'.repeat(64))}},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({rootPath:'C:/project',name:'Projet'})})
 await application.execute(cmd('choose-directory'))
 const contexts=new BmadContextCoordinator({application,store:{read:async()=>null,write:async()=>{}},observeConfiguration:async projectId=>{reads++;options.observe?.(reads,()=>revision='c'.repeat(64));return {schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision,observedAt:new Date().toISOString(),status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',sources:[],problems:[]}},observe:async projectId=>{reads++;options.observe?.(reads,()=>revision='c'.repeat(64));if(options.unrelatedRefusal)throw Object.assign(Error(),{code:'RESOLVER_FAILED'});return {schemaVersion:1,projectId,rootPath:'C:/project',rootIdentity:'root',revision,observedAt:new Date().toISOString(),status:'candidate-observed',activeInitiative:'alpha',activeStatus:options.missingDocument?'invalid':'valid',initiatives:(options.missingDocument?[]:['alpha','beta']).map(id=>({id,name:id,path:'C:/project/'+id,source:'C:/project/'+id+'/'+id+'.md',revision:'b'.repeat(64)})),sources:[],problems:[]}}})
 let signal,release,offer;const offered=new Promise(r=>offer=r),waiting=new Promise(r=>release=r),submitted=[]
 const dialogue=new DialogueCoordinator({application,contexts,questions:{read:async()=>[],write:async()=>{}},qualify:async()=>({rootPath:'C:/project',fingerprint:'b'.repeat(64),skillPath:'Mary'}),open:async(_,s,activity,guard)=>{
  opens++;signal=s;options.open?.(()=>revision='c'.repeat(64))
  if(options.openCleanupUnconfirmed){revision='c'.repeat(64);await assert.rejects(guard(),{code:'PROFILE_CHANGED'});throw Object.assign(Error('cleanup unconfirmed before session return'),{code:'STOP_UNCONFIRMED'})}
  return {context:{connectionId:'account-1',initiativeId:'alpha'},stop:async()=>{stops++;release();return options.unknownStop?'unknown':'stopped'},turn:async(_,accepted,observe,onQuestion)=>{
   if(options.ownedEffect){revision='c'.repeat(64);try{await guard()}catch{throw Object.assign(Error(),{code:'EFFECT_UNKNOWN'})}}
   await guard();turns++;await accepted()
   if(options.question){await onQuestion({id:'native-question',fields:[{id:'answer',header:'Direction',prompt:'Quelle direction ?',options:[],allowOther:true}],identity:{kind:'unknown'},expiresAt:null},{invalidated:new Promise(()=>{}),answer:async values=>{submitted.push(values);release()}});offer();await Promise.race([waiting,new Promise((_,reject)=>s.addEventListener('abort',()=>reject(Object.assign(Error(),{code:'CANCELLED'})),{once:true}))]);s.throwIfAborted()}
   return 'Réponse alpha'
  }}
 }})
 return {dialogue,contexts,application,offered,submitted,mutate:()=>revision='c'.repeat(64),counts:()=>({reads,opens,turns,stops}),snapshot:()=>snapshot}
}
for(const options of [{missingDocument:true},{unrelatedRefusal:true}])test('Mary indépendante capture alpha sans dépendre des documents '+JSON.stringify(options),async()=>{
 const f=await fixture(options)
 await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.dialogue.settled()
 assert.equal(f.dialogue.read().status,'ready');assert.equal(f.dialogue.read().errorCode,null)
 assert.equal(f.snapshot().conversations[0].context.initiativeId,'alpha');assert.equal(f.counts().turns,1)
 await f.dialogue.shutdown()
})
test('open refuse la garde puis échoue au nettoyage : arrêt inconnu sans session retournée',async()=>{
 const f=await fixture({openCleanupUnconfirmed:true})
 await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.dialogue.settled()
 const state=f.dialogue.read()
 assert.equal(state.errorCode,'STOP_UNCONFIRMED');assert.equal(state.status,'unknown');assert.equal(state.recovery.stop,'unconfirmed')
 assert.equal(f.counts().opens,1);assert.equal(f.counts().turns,0);assert.equal(f.counts().stops,0);assert.equal(f.snapshot().conversations.length,0)
 const blocked=await f.dialogue.execute(cmd('launch',{projectId:'id-1'}))
 assert.equal(blocked.errorCode,'STOP_UNCONFIRMED');assert.equal(f.counts().opens,1)
})
test('un effet possédé commencé garde EFFECT_UNKNOWN malgré le refus de contexte',async()=>{
 const f=await fixture({ownedEffect:true})
 await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.dialogue.settled()
 assert.equal(f.dialogue.read().errorCode,'EFFECT_UNKNOWN');assert.equal(f.counts().stops,1)
 assert.equal(f.snapshot().conversations[0].context.initiativeId,'alpha')
})
test('source mutation before open rejects without provider ownership or first turn',async()=>{
 const f=await fixture({observe:(n,mutate)=>{if(n===2)mutate()}})
 await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.dialogue.settled()
 assert.equal(f.dialogue.read().errorCode,'PROFILE_CHANGED');assert.equal(f.counts().opens,0);assert.equal(f.counts().turns,0)
})
test('mutation inside open stops actual owner before conversation or turn; unknown remains unknown',async()=>{
 for(const unknownStop of [false,true]){
  const f=await fixture({open:mutate=>mutate(),unknownStop})
  await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.dialogue.settled()
  assert.equal(f.counts().opens,1);assert.equal(f.counts().turns,0);assert.equal(f.counts().stops,1);assert.equal(f.snapshot().conversations.length,0)
  assert.equal(f.dialogue.read().errorCode,unknownStop?'STOP_UNCONFIRMED':'PROFILE_CHANGED')
 }
})
test('mutation after conversation persistence refuses first turn without rewriting capture',async()=>{
 const f=await fixture({write:(s,mutate)=>{if(s.conversations.length)mutate()}})
 await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.dialogue.settled()
 assert.equal(f.counts().turns,0);assert.equal(f.counts().stops,1);assert.equal(f.snapshot().conversations[0].context.initiativeId,'alpha')
})
test('question alpha survives consultation beta; its own changed sources refuse submission',async()=>{
 for(const mutation of [false,true]){
  const f=await fixture({question:true})
  await f.dialogue.execute(cmd('launch',{projectId:'id-1'}));await f.offered
  const q=f.dialogue.read().questions[0]
  await f.contexts.execute(cmd('choose',{projectId:'id-1',initiativeId:'beta',revision:'a'.repeat(64)}))
  assert.equal(f.dialogue.read().questions[0].context.initiativeId,'alpha')
  if(mutation)f.mutate()
  await f.dialogue.execute(cmd('answer-question',{questionId:q.id,values:{answer:'Réponse capturée alpha'}}))
  await f.dialogue.settled()
  assert.equal(f.submitted.length,mutation?0:1)
  assert.equal(f.snapshot().conversations[0].context.initiativeId,'alpha')
  if(mutation)assert.equal(f.dialogue.read().errorCode,'PROFILE_CHANGED')
  await f.dialogue.shutdown()
 }
})
