// Horloge locale contrôlée du cœur, sans compte, processus fournisseur ou profil.
import assert from 'node:assert/strict'
import {Application} from '../../src/core/application.ts'
import {DialogueCoordinator} from '../../src/core/dialogue.ts'
import {emptySnapshot} from '../../src/contracts/index.ts'
import {writeFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {claimOutput,publicFailure,check} from './epic-one-support.mjs'

export async function qualifyLocalExpiry(){
 let state=emptySnapshot(),records=[],counter=0,offered,transmitted=0,coordinator,restored
 const offeredPromise=new Promise(r=>{offered=r}),originalNow=Date.now,deadline=originalNow()+1000
 const command=(type,extra={})=>({contractVersion:1,correlationId:'epic-one-local-expiry',type,...extra})
 const application=new Application({store:{read:async()=>structuredClone(state),write:async value=>{state=structuredClone(value)}},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({name:'Projet synthétique expiration',rootPath:'C:/synthetic-epic-one-expiry'})})
 const questions={read:async()=>structuredClone(records),write:async q=>{records=[...records.filter(x=>x.id!==q.id),structuredClone(q)]}}
 await application.execute(command('choose-directory'))
 try{
  coordinator=new DialogueCoordinator({application,questions,qualify:async()=>({rootPath:'C:/synthetic-epic-one-expiry',skillPath:'synthetic-no-model',fingerprint:'a'.repeat(64)}),open:async(_profile,signal)=>({context:{connectionId:'synthetic-account',initiativeId:null},turn:async(_text,accepted,_observe,onQuestion)=>{
   await accepted();await onQuestion({fields:[{id:'field-1',header:'Direction',prompt:'Question locale synthétique',options:[],allowOther:true}],identity:{kind:'unknown'},expiresAt:deadline},{invalidated:new Promise(()=>{}),answer:async()=>{transmitted++}});offered()
   await new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error('CANCELLED'),{code:'CANCELLED'})),{once:true}));return ''
  },stop:async()=>'stopped'})})
  await coordinator.execute(command('launch',{projectId:'id-1'}));await offeredPromise
  const question=coordinator.read().questions[0];assert.equal(question.status,'waiting');assert.equal(question.storage,'stored')
  Date.now=()=>deadline+1
  const refused=await coordinator.execute(command('answer-question',{questionId:question.id,values:{'field-1':'Réponse synthétique locale'}}));assert.equal(refused.errorCode,'CONTEXT_MISMATCH');assert.equal(transmitted,0)
  for(let i=0;i<50&&coordinator.read().questions[0].storage!=='stored';i++)await new Promise(r=>setImmediate(r))
  const expired=coordinator.read().questions[0];assert.equal(expired.status,'inactive');assert.equal(expired.reason,'expired');assert.equal(expired.storage,'stored')
  Date.now=originalNow;await coordinator.shutdown();coordinator=null
  restored=new DialogueCoordinator({application,questions,qualify:async()=>{throw Error('UNEXPECTED_ENGINE')},open:async()=>{throw Error('UNEXPECTED_ENGINE')}})
  await restored.execute(command('read'));assert.equal(restored.read().questions[0].status,'inactive');assert.equal((await restored.execute(command('answer-question',{questionId:question.id,values:{'field-1':'Tardif'}}))).errorCode,'CONTEXT_MISMATCH');assert.equal(transmitted,0)
  return {status:'passed',cleanup:true,transmitted,inactiveAfterReopen:true,checks:['controlled-local-clock-expiry-no-native-response','inactive-after-restore-late-command-rejected'],limits:['Cœur source et horloge contrôlée synthétiques ; aucun runner ni expiration autonome du runner prétendue.']}
 }finally{Date.now=originalNow;await coordinator?.shutdown();await restored?.shutdown()}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const output=process.argv.find(v=>v.startsWith('--output='))?.slice(9);check(output,'FRESH_OUTPUT_REQUIRED');const directory=await claimOutput(output)
 let report;try{report=await qualifyLocalExpiry()}catch(error){report={status:'failed',cleanup:true,failure:publicFailure(error)};process.exitCode=1}
 await writeFile(join(directory,'profile.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))
}
