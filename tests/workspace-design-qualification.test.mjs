import assert from 'node:assert/strict'
import {test} from 'node:test'
import {EventEmitter} from 'node:events'
import {createContext,runInContext} from 'node:vm'
import * as qualification from '../scripts/qualification/workspace-design.mjs'

const main={pid:2001,startedAt:'100000',executable:'C:/synthetic/electron.exe'}
const observation={schemaVersion:1,afterHookOnly:true,startedAt:'2026-10-28T10:00:00.000Z',complete:true,attached:true,network:0,appServerAttempts:0,appServers:0,appServerCloses:0}
function session({closeObserved=true,native=observation}={}){
 const owned={main,closeObserved:false,observationPath:'C:/synthetic/observation.json',observationStartedAt:observation.startedAt}
 owned.app={process:()=>({pid:1001,exitCode:0}),close:async()=>{owned.closeObserved=closeObserved},evaluate:async()=>native}
 return owned
}

test('la fermeture du wrapper ne prouve pas la disparition du vrai Main Windows',async()=>{
 const owned=session(),reads=[]
 const receipt=await qualification.closeWorkspaceSession(owned,{readProcess:async pid=>{reads.push(pid);return main},readObservation:async()=>observation,waitMs:0})
 assert.deepEqual(reads,[2001]);assert.equal(receipt.wrapperExited,true);assert.equal(receipt.mainGone,false);assert.equal(receipt.cleanupSafe,false)
})
test('la fermeture exige événement close, Main absent et observation complète sans app-server',async()=>{
 for(const [options,native]of [[{closeObserved:false},observation],[{}, {...observation,complete:false}],[{}, {...observation,appServerAttempts:1,appServers:1,appServerCloses:1}],[{}, {...observation,startedAt:'ancien-hook'}]]){
  const receipt=await qualification.closeWorkspaceSession(session(options),{readProcess:async()=>null,readObservation:async()=>native,waitMs:0})
  assert.equal(receipt.mainGone,true);assert.equal(receipt.cleanupSafe,false)
 }
 const receipt=await qualification.closeWorkspaceSession(session(),{readProcess:async()=>null,readObservation:async()=>observation,waitMs:0})
 assert.equal(receipt.closeObserved,true);assert.equal(receipt.mainGone,true);assert.equal(receipt.childrenGone,true);assert.equal(receipt.cleanupSafe,true)
})
test('le compteur passif transmet spawn inchangé sans conserver args, env ni transport',()=>{
 const writes=[],calls=[],child=new EventEmitter(),cp={spawn:function(){calls.push({receiver:this,args:[...arguments]});return child}}
 const original=cp.spawn,webRequest={onBeforeRequest(value,callback){this.callback=callback}},builtins={child_process:cp,module:{syncBuiltinESMExports(){}},fs:{writeFileSync(path,value){assert.equal(path,'C:/synthetic/observation.json');writes.push(value)}}}
 const context=createContext({process:{getBuiltinModule:name=>builtins[name]},electron:{session:{defaultSession:{webRequest}}}})
 context.install=qualification.installWorkspaceObservationRuntime
 runInContext('('+qualification.installWorkspaceObservationRuntime.toString()+')(electron,"C:/synthetic/observation.json")',context)
 const args=['app-server','--listen','stdio://','DO_NOT_EXPORT_ARGUMENT'],settings={env:{ACCESS_TOKEN:'DO_NOT_EXPORT_TOKEN'}}
 assert.equal(cp.spawn('C:/synthetic/codex.exe',args,settings),child);assert.equal(calls[0].receiver,cp);assert.equal(calls[0].args[1],args);assert.equal(calls[0].args[2],settings)
 assert.equal(cp.spawn('other.exe',['--version'],settings),child);child.emit('close',0,null)
 const receipt=JSON.parse(writes.at(-1));assert.equal(receipt.appServerAttempts,1);assert.equal(receipt.appServers,1);assert.equal(receipt.appServerCloses,1)
 assert.doesNotMatch(writes.join(''),/DO_NOT_EXPORT|ACCESS_TOKEN|stdio|codex\.exe|other\.exe/)
 assert.equal(runInContext('globalThis.__workspaceObservation.restore()',context),true);assert.equal(cp.spawn,original)
})
