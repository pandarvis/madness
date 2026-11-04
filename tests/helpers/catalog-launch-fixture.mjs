import {Application} from '../../src/core/application.ts'
import {BmadCatalogCoordinator} from '../../src/core/bmad-catalog.ts'
import {BmadContextCoordinator} from '../../src/core/bmad-context.ts'
import {BmadCatalogLaunchCoordinator} from '../../src/core/bmad-catalog-launch.ts'
import {DialogueCoordinator} from '../../src/core/dialogue.ts'
import {emptySnapshot} from '../../src/contracts/index.ts'
import {createHash} from 'node:crypto'
export const cmd=(type,x={})=>({contractVersion:1,correlationId:'catalog-launch-test',type,...x})
const sha=s=>createHash('sha256').update(s).digest('hex')
export function catalogSnapshot(projectId='project-a',family='mary'){
 const itemId={mary:'bmad-agent-analyst',forge:'bmad-forge-idea',help:'bmad'}[family],rootPath='C:/catalog-project',text='---\nname: '+itemId+'\ndescription: Synthetic native fixture\n---\n',source={id:'skill-source',path:rootPath+'/.agents/skills/'+itemId+'/SKILL.md',sha256:sha(text),bytes:Buffer.byteLength(text),text},manifest={id:'module-source',path:rootPath+'/.agents/skills/module/bmod.toml',sha256:sha('module'),bytes:6,text:'module'}
 return {schemaVersion:1,projectId,rootPath,rootIdentity:'b'.repeat(64),revision:'a'.repeat(64),observedAt:'2026-11-04T10:00:00.000Z',diagnostic:'candidate-observed',coverage:'complete',roots:[rootPath+'/.agents/skills'],sources:[source,manifest],modules:[{code:'method',folder:'module',version:'6.13.0-next',sourceId:manifest.id}],items:[{id:itemId,name:itemId,module:'method',sourceId:source.id,manifestSourceId:manifest.id,invocation:'$'+itemId,presence:'present',copyable:true,copyReasons:[],documentation:[],launchable:false,launchReason:'Documentary observation only',fields:{purpose:null,inputs:null,conditions:null,effects:null}}],problems:[]}
}
export async function catalogFixture(options={}){
 let snapshot=emptySnapshot(),n=0,opens=0,turns=0,stops=0,qualifications=0,connection='connection-a',selection=0,profileMutation=false,leaseFresh=true
 let observationRevision='c'.repeat(64),value=catalogSnapshot('id-1',options.family??'mary'),notify
 const calls=[],records=[]
 const app=new Application({store:{read:async()=>snapshot,write:async s=>{snapshot=structuredClone(s);await options.snapshotWrite?.(s)}},newId:()=> 'id-'+ ++n,now:()=>new Date().toISOString(),chooseDirectory:async()=>({rootPath:value.rootPath,name:'Synthetic catalogue project'})})
 await app.execute(cmd('choose-directory'))
 const contexts=new BmadContextCoordinator({application:app,store:{read:async()=>null,write:async()=>{}},observeConfiguration:async projectId=>({schemaVersion:1,projectId,rootPath:value.rootPath,rootIdentity:'b'.repeat(64),revision:observationRevision,observedAt:'2026-11-04T10:00:00.000Z',status:'candidate-observed',activeInitiative:null,activeStatus:'absent',sources:[],problems:[]}),observe:async()=>{throw Error('Initiative not required by this synthetic profile')}})
 const baseRead=contexts.read.bind(contexts);contexts.read=()=>{const state=baseRead();if(selection)state.projects=[{projectId:'id-1',selection:{revision:selection}}];return state}
 const catalog=new BmadCatalogCoordinator({application:app,collect:async()=>structuredClone(value),clipboard:{writeText:()=>{throw Error('Copy must never prepare')},readText:()=>''},observation:{attach:async(_v,fn)=>{notify=fn;return {health:'watching',reconcile:async()=>{await options.reconcile?.();return leaseFresh},close(){}}}}})
 await catalog.execute(cmd('collect',{projectId:'id-1'}))
 const deps={catalog,contexts,connectionIdentity:async()=>connection,store:{read:async()=>options.restore??records,write:async r=>{await options.recordWrite?.(r);const index=records.findIndex(v=>v.conversationId===r.conversationId);if(index<0)records.push(structuredClone(r));else records[index]=structuredClone(r)}},qualify:async(family,projectId,root,signal,previous)=>{
  qualifications++;calls.push({operation:'qualify',family});await options.qualify?.(qualifications);signal.throwIfAborted()
  const profile={rootPath:value.rootPath,skillPath:value.sources[0].path,fingerprint:(profileMutation?'d':'e').repeat(64),...(family==='forge'?{kind:'forge',forge:{outputBase:value.rootPath+'/_bmad-output',initiativeId:null,contextDigest:'f'.repeat(64)}}:family==='help'?{kind:'help',help:{bundleId:'synthetic-bundle',initiativeId:null}}:{})}
  return {profile,source:{path:options.foreignSource?'C:/another/SKILL.md':value.sources[0].path,sha256:value.sources[0].sha256,bytes:value.sources[0].bytes}}
 }}
 const launch=new BmadCatalogLaunchCoordinator(deps)
 const dialogue=new DialogueCoordinator({application:app,contexts,catalogLaunch:launch,recovery:{status:async()=>options.unknownStop?'unknown':'stopped',observeStop:async()=>options.unknownStop?'unknown':'stopped'},workflows:{read:async()=>[],write:async()=>{}},questions:{read:async()=>[],write:async()=>{}},approvals:{read:async()=>[],write:async()=>{}},qualify:async()=>{throw Error('Must use captured profile')},open:async(profile,signal,activity,guard)=>{
  opens++;calls.push({operation:'open',profile:structuredClone(profile)});await options.open?.(guard)
  return {context:{connectionId:options.foreignConnection?'foreign-connection':'connection-a',initiativeId:null},stop:async()=>{stops++;return options.stopOutcome??'stopped'},turn:async(input,accepted,observe,onQuestion,onApproval)=>{
   await guard();turns++;calls.push({operation:'turn',input});await options.beforeAck?.();await accepted();await options.turn?.({signal,observe,onQuestion,onApproval,guard})
   return 'Synthetic port response; no native/model evidence.'
  }}
 }})
 const prepare=async(mode='read-only')=>launch.execute(cmd('prepare',{projectId:'id-1',itemId:value.items[0].id,revision:value.revision,mode}))
 const send=async(id=launch.read().preparation?.id)=>{await dialogue.execute(cmd('launch-catalog',{projectId:'id-1',preparationId:id}));await dialogue.settled()}
 return {app,contexts,catalog,launch,dialogue,prepare,send,calls,records,deps,snapshot:()=>structuredClone(snapshot),counts:()=>({opens,turns,stops,qualifications}),setValue:v=>value=v,mutateProfile:()=>profileMutation=true,mutateContext:()=>observationRevision='d'.repeat(64),mutateSelection:()=>selection++,mutateConnection:()=>connection='connection-b',stale:()=>{leaseFresh=false},invalidate:()=>notify('unavailable'),shutdown:async()=>{await dialogue.shutdown();await launch.shutdown();await catalog.shutdown();await contexts.shutdown()}}
}
