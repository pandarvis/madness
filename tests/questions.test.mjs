import assert from 'node:assert/strict'
import {test} from 'node:test'
import {mkdtemp,readFile,writeFile,rm,readdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {Application} from '../src/core/application.ts'
import {DialogueCoordinator} from '../src/core/dialogue.ts'
import {emptySnapshot,isSnapshot} from '../src/contracts/index.ts'
import {isDialogueCommand,isDialogueState} from '../src/contracts/dialogue.ts'
const contracts=await import('../src/contracts/questions.ts').catch(()=>null)
const persistence=await import('../src/adapters/persistence/question-store.ts').catch(()=>null)
const command=(type,extra={})=>({contractVersion:1,correlationId:'question-command',type,...extra})
const context={projectId:'id-1',initiativeId:null,conversationId:'id-2',providerId:'codex',connectionId:'account-1'}
const fields=[{id:'field-1',header:'Direction',prompt:'Quelle direction ?',options:[{label:'Alpha',description:'Première voie'},{label:'Beta',description:'Seconde voie'}],allowOther:true}]
const record=()=>({schemaVersion:1,id:'question-local',context,requestId:'launch-request',turnId:'turn-1',identity:{kind:'unknown'},fields,values:{},status:'waiting',reason:null,createdAt:'2026-10-26T20:00:00.000Z',expiresAt:null,revision:1,storage:'stored'})

test('contrat question refuse les secrets, IDs natifs, valeurs vides et champs étrangers',()=>{
 assert.ok(contracts,'Contrat des questions attendu')
 assert.equal(contracts.isQuestionRecord(record()),true)
 assert.equal(contracts.isQuestionRecord({...record(),nativeId:'leak'}),false)
 assert.equal(contracts.isQuestionRecord({...record(),fields:[{...fields[0],isSecret:true}]}),false)
 assert.equal(isDialogueCommand(command('answer-question',{questionId:'question-local',values:{'field-1':'Alpha'}})),true)
 assert.equal(isDialogueCommand(command('answer-question',{questionId:'question-local',values:{'field-1':' '}})),false)
 assert.equal(contracts.validQuestionValues(fields,{'foreign':'Alpha'},false),false)
 assert.equal(contracts.validQuestionValues(fields,{'field-1':'Autre direction'},true),true)
 assert.equal(contracts.validQuestionValues([{...fields[0],allowOther:false}],{'field-1':'Autre direction'},true),false)
})

test('annexe question atomique préserve versions inconnues, conflits et octets refusés',async t=>{
 assert.ok(persistence,'Annexe des questions attendue')
 const root=await mkdtemp(join(tmpdir(),'madness-question-store-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const store=new persistence.QuestionStore(root),value=record();assert.deepEqual(await store.read(),[])
 await store.write(value);value.values={'field-1':'Alpha'};value.revision++;await store.write(value)
 assert.deepEqual(await new persistence.QuestionStore(root).read(),[value]);assert.deepEqual(await readdir(root),['question-local.json'])
 const path=join(root,'question-local.json');await writeFile(path,JSON.stringify({...value,values:{'field-1':'Beta'}}));await assert.rejects(store.write(value),{code:'OUTPUT_CONFLICT'})
 for(const bytes of [Buffer.from(JSON.stringify({...value,schemaVersion:2})),Buffer.from([0xc0,0x80])]){await writeFile(path,bytes);await assert.rejects(new persistence.QuestionStore(root).read(),{code:'STORAGE_READ_FAILED'});assert.deepEqual(await readFile(path),bytes)}
})

async function fixture(options={}){
 let snapshot=emptySnapshot(),counter=0,records=[],questionHandler,releaseTurn,offered
 const offerReady=new Promise(r=>offered=r),turnWait=new Promise(r=>releaseTurn=r)
 const app=new Application({store:{read:async()=>structuredClone(snapshot),write:async value=>{snapshot=structuredClone(value)}},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({name:'Projet',rootPath:'C:/project'})})
 await app.execute(command('choose-directory'));await app.execute(command('save-draft',{projectId:'id-1',text:'Brouillon libre intact'}))
 let invalidate,submitted=[]
 const invalidated=new Promise(r=>invalidate=r)
 const questions=options.questions??{read:async()=>structuredClone(records),write:async value=>{await options.beforeWrite?.(value);if(options.failWrite?.())throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'});records=[...records.filter(q=>q.id!==value.id),structuredClone(value)]}}
 const deps={application:app,questions,qualify:async()=>({rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async(_,signal)=>({context:{connectionId:'account-1',initiativeId:null},turn:async(_,accepted,_observe,onQuestion)=>{await accepted();questionHandler=onQuestion;await onQuestion({id:'question-1',fields,identity:{kind:'unknown'},expiresAt:options.expiresAt??null},{invalidated,answer:async values=>{submitted.push(structuredClone(values));await options.answer?.();releaseTurn()}});offered();await Promise.race([turnWait,new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error(),{code:'CANCELLED'})),{once:true}))]);signal.throwIfAborted();return 'Réponse après question'},stop:async()=>'stopped'})}
 const dialogue=new DialogueCoordinator(deps);await dialogue.execute({...command('launch',{projectId:'id-1'}),correlationId:'launch-request'});await offerReady
 return {dialogue,app,records:()=>records,snapshot:()=>snapshot,submitted,invalidate,releaseTurn,deps,questionHandler}
}
test('question active admet une réponse pendant le tour, un seul envoi, ACK et écriture durable avant sent',async()=>{
 let ack;const waiting=new Promise(r=>ack=r)
 const f=await fixture({answer:()=>waiting}),q=f.dialogue.read().questions[0]
 assert.equal(q.status,'waiting');assert.equal(isDialogueState(f.dialogue.read()),true)
 const saving=await f.dialogue.execute(command('save-question',{questionId:q.id,values:{'field-1':'Alpha'}}));assert.equal(saving.questions[0].values['field-1'],'Alpha')
 const send=f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Alpha'}}))
 const duplicate=await f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Beta'}}));assert.equal(duplicate.errorCode,'BUSY')
 await new Promise(r=>setImmediate(r));assert.equal(f.dialogue.read().questions[0].status,'sending');assert.notEqual(f.records()[0].status,'sent')
 ack();await send;await f.dialogue.settled()
 assert.deepEqual(f.submitted,[{'field-1':'Alpha'}]);assert.equal(f.dialogue.read().questions[0].status,'sent');assert.equal(f.records()[0].status,'sent');assert.equal(f.snapshot().drafts[0].text,'Brouillon libre intact');assert.equal(isSnapshot(f.snapshot()),true)
 await f.dialogue.shutdown()
})
test('invalidation pendant sauvegarde garde la saisie et interdit tout transfert vers une autre demande',async()=>{
 let delay=false,entered,release;const writing=new Promise(r=>entered=r),held=new Promise(r=>release=r)
 const f=await fixture({beforeWrite:async()=>{if(delay){entered();await held}}}),q=f.dialogue.read().questions[0];delay=true
 const sending=f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Alpha'}}));await writing;f.invalidate();await new Promise(r=>setImmediate(r));release();await sending
 assert.equal(f.submitted.length,0);assert.equal(f.dialogue.read().questions[0].values['field-1'],'Alpha');assert.equal(f.dialogue.read().questions[0].status,'inactive')
 await f.dialogue.execute(command('stop'));await f.dialogue.settled()
 const restored=new DialogueCoordinator(f.deps);const state=await restored.execute(command('read'));assert.equal(state.questions[0].status,'inactive');assert.equal(state.questions[0].values['field-1'],'Alpha');assert.equal((await restored.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Beta'}}))).errorCode,'CONTEXT_MISMATCH')
})
test('échec de conservation après reçu ne devient pas sent ; arrêt conserve la réponse',async()=>{
 let fail=false
 const f=await fixture({failWrite:()=>fail,answer:async()=>{fail=true}}),q=f.dialogue.read().questions[0]
 const result=await f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Alpha'}}));assert.equal(result.errorCode,'STORAGE_WRITE_FAILED');assert.notEqual(result.questions[0].status,'sent');assert.equal(result.questions[0].values['field-1'],'Alpha')
 await f.dialogue.settled();await f.dialogue.shutdown()
})
test('la fin native attend la sauvegarde du reçu avant de terminer et garde la question sent',async()=>{
 let writing,release;const started=new Promise(r=>writing=r),held=new Promise(r=>release=r)
 const f=await fixture({beforeWrite:async value=>{if(value.status==='sent'){writing();await held}}}),q=f.dialogue.read().questions[0]
 const sending=f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Alpha'}}));await started
 assert.equal(f.dialogue.read().questions[0].status,'sending');assert.notEqual(f.dialogue.read().status,'ready')
 release();await sending;await f.dialogue.settled();assert.equal(f.dialogue.read().questions[0].status,'sent');assert.equal(f.dialogue.read().status,'ready');await f.dialogue.shutdown()
})
test('une sauvegarde réessayée après refus disque confirme la conservation et libère l’erreur locale',async()=>{
 let fail=false;const f=await fixture({failWrite:()=>fail}),q=f.dialogue.read().questions[0];fail=true
 const refused=await f.dialogue.execute(command('save-question',{questionId:q.id,values:{'field-1':'Alpha'}}));assert.equal(refused.errorCode,'STORAGE_WRITE_FAILED')
 fail=false;const saved=await f.dialogue.execute(command('save-question',{questionId:q.id,values:{'field-1':'Alpha'}}));assert.equal(saved.errorCode,null);assert.equal(saved.questions[0].storage,'stored')
 await f.dialogue.execute(command('stop'));await f.dialogue.settled()
})
test('une réponse déjà inconnue reste inconnue et historique à chaque réouverture',async()=>{
 const value={...record(),status:'unknown',reason:'failed',values:{'field-1':'Alpha'}}
 const application=new Application({store:{read:async()=>emptySnapshot(),write:async()=>{}},newId:()=> 'unused',now:()=>new Date().toISOString(),chooseDirectory:async()=>null})
 const restored=new DialogueCoordinator({application,questions:{read:async()=>[value],write:async()=>{}},qualify:async()=>{throw Error('Aucun moteur')},open:async()=>{throw Error('Aucun moteur')}})
 const state=await restored.execute(command('read'));assert.equal(state.questions[0].status,'unknown');assert.equal(state.questions[0].reason,'reopened');assert.equal((await restored.execute(command('answer-question',{questionId:value.id,values:value.values}))).errorCode,'CONTEXT_MISMATCH')
})

test('arrêt pendant écriture durable du reçu garde l’invalidation et la même projection que le disque',async()=>{
 let entered,release;const held=new Promise(r=>release=r),writing=new Promise(r=>entered=r)
 const f=await fixture({beforeWrite:async value=>{if(value.status==='sent'){entered();await held}}}),q=f.dialogue.read().questions[0]
 const sending=f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Alpha'}}));await writing
 const states=[];f.dialogue.subscribe(state=>states.push(structuredClone(state.questions[0])))
 await f.dialogue.execute(command('stop'));assert.equal(f.dialogue.read().questions[0].status,'inactive');release();await sending;await f.dialogue.settled()
 assert.equal(states.some(value=>value.status==='sent'),false)
 assert.deepEqual(f.dialogue.read().questions[0],f.records()[0]);assert.equal(f.dialogue.read().questions[0].status,'inactive');assert.equal(f.dialogue.read().questions[0].reason,'stopped');assert.equal(f.dialogue.read().questions[0].storage,'stored');assert.equal(f.dialogue.read().questions[0].values['field-1'],'Alpha');assert.deepEqual(f.submitted,[{'field-1':'Alpha'}]);await f.dialogue.shutdown()
})

test('un reçu rejeté après invalidation conserve atomiquement unknown et sa saisie à la réouverture',async t=>{
 const root=await mkdtemp(join(tmpdir(),'madness-question-unknown-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const store=new persistence.QuestionStore(root);let f
 f=await fixture({questions:store,answer:async()=>{f.invalidate();await new Promise(r=>setImmediate(r));throw Object.assign(Error(),{code:'EFFECT_UNKNOWN'})}})
 const original=f.dialogue.read().questions[0],result=await f.dialogue.execute(command('answer-question',{questionId:original.id,values:{'field-1':'Alpha'}}));await f.dialogue.settled()
 const durable=(await new persistence.QuestionStore(root).read())[0]
 assert.equal(result.errorCode,'EFFECT_UNKNOWN');assert.equal(durable.status,'unknown');assert.equal(durable.storage,'stored');assert.equal(durable.revision,original.revision+3);assert.deepEqual(durable.values,{'field-1':'Alpha'});assert.deepEqual(f.dialogue.read().questions[0],durable)
 const restored=new DialogueCoordinator({...f.deps,questions:new persistence.QuestionStore(root)}),state=await restored.execute(command('read'))
 assert.equal(state.questions[0].status,'unknown');assert.equal(state.questions[0].reason,'reopened');assert.equal(state.questions[0].revision,durable.revision);assert.deepEqual(state.questions[0].context,original.context);assert.deepEqual(state.questions[0].values,{'field-1':'Alpha'})
 assert.equal((await restored.execute(command('answer-question',{questionId:original.id,values:{'field-1':'Beta'}}))).errorCode,'CONTEXT_MISMATCH');assert.deepEqual(f.submitted,[{'field-1':'Alpha'}]);await f.dialogue.shutdown()
})
test('le refus de conserver unknown reste explicite après invalidation et rejet du reçu',async()=>{
 let f;f=await fixture({beforeWrite:async value=>{if(value.status==='unknown')throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'})},answer:async()=>{f.invalidate();await new Promise(r=>setImmediate(r));throw Object.assign(Error(),{code:'EFFECT_UNKNOWN'})}})
 const q=f.dialogue.read().questions[0],result=await f.dialogue.execute(command('answer-question',{questionId:q.id,values:{'field-1':'Alpha'}}));await f.dialogue.settled()
 assert.equal(result.errorCode,'STORAGE_WRITE_FAILED');assert.equal(result.questions[0].status,'unknown');assert.equal(result.questions[0].storage,'failed');assert.deepEqual(result.questions[0].values,{'field-1':'Alpha'});assert.deepEqual(f.submitted,[{'field-1':'Alpha'}]);await f.dialogue.shutdown()
})
