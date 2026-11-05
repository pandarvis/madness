import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash, randomUUID} from 'node:crypto'
import {mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile} from 'node:fs/promises'
import {dirname, join, resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {BmadInitializationHost, assertInitializationOutsideStorage} from '../src/adapters/bmad/initialization.ts'
import {BmadInitializationStore} from '../src/adapters/persistence/bmad-initialization-store.ts'
import {isInitializationView,validateInitializationRequest} from '../src/contracts/bmad-initialization.ts'
import {BmadInitialization} from '../src/core/bmad-initialization.ts'
import {ActivityAdmission,LifecycleCoordinator} from '../src/core/lifecycle.ts'

const resource = resolve('resources/bmad-init/payload-v1.json.gz')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
async function fixture(t, options = {}) {
 const temp = await mkdtemp(join(await realpath(tmpdir()), 'madness-init-test-'))
 t.after(() => rm(temp, {recursive:true,force:true}))
 const rootPath = join(temp,'targets','positive')
 await mkdir(rootPath,{recursive:true})
 await writeFile(join(rootPath,'sentinel.txt'),'preserved')
 const store = new BmadInitializationStore(join(temp,'sidecar'))
 const host = new BmadInitializationHost(options.resource ?? resource)
 const observe = async () => ({scope:'configuration',initiativeId:null,
  observation:await host.observeAbsence('project',rootPath,new AbortController().signal)})
 const make = (storage = store) => new BmadInitialization({context:{
  capture:observe, assertFresh:async captured=>{
   const current=await observe()
   if(current.observation.revision!==captured.observation.revision)throw Error('stale')
  }, subscribeInvalidation:() => () => {}
 },host,store:storage,admission:new ActivityAdmission(),lifecycle:new LifecycleCoordinator(),newId:randomUUID})
 return {rootPath,store,host,make,service:make(options.store)}
}
const approve = op => ({contractVersion:1,type:'approve',confirmation:'initialize-exact-plan',projectId:op.projectId,
 attemptId:op.attemptId,generation:op.generation,planId:op.plan.id,planRevision:op.plan.revision})
async function ready(service) {
 const result = await service.prepare('project')
 assert.equal(result.ok,true,JSON.stringify(result))
 return result.value
}

test('P1/P3 prepare without changes, consult exact bytes and apply exclusive verified union', async t => {
 const {rootPath,service,store,make} = await fixture(t)
 const plan = await ready(service)
 assert.deepEqual(await readdir(rootPath),['sentinel.txt'])
 assert.equal(plan.plan.additions.length,588)
 const config = plan.plan.additions.find(e => e.path === '_bmad/config.toml')
 const preview = await service.content(plan.attemptId,config.contentId)
 assert.equal(preview.value.bytes,82)
 assert.equal(preview.value.sha256,'e6d0012ed0c41293542422fbcc91577b1b3c73261ee25084b70eced90d5df26c')
 const r = await service.execute(approve(plan))
 assert.equal(r.value.result.outcome,'verified')
 assert.equal(r.value.result.receipt.observedAdditions.length,588)
 assert.equal(hash(await readFile(join(rootPath,'_bmad/config.toml'))),config.sha256)
 assert.equal(await readFile(join(rootPath,'sentinel.txt'),'utf8'),'preserved')
 assert.equal((await service.execute(approve(plan))).ok,false)
 const [saved] = await store.list()
 const reopened = make()
 const historical = reopened.restore(saved).value
 assert.equal(historical.result.outcome,'verified')
 assert.equal(historical.decision,'inactive')
 assert.equal((await reopened.execute(approve(plan))).ok,false)
})
test('P2 closing and P3 mutation refuse application', async t => {
 const {rootPath,service} = await fixture(t)
 const closed = await ready(service)
 const {confirmation,...decision} = approve(closed)
 assert.equal((await service.execute({...decision,type:'close'})).ok,true)
 assert.equal((await service.execute(approve(closed))).ok,false)
 const changed = await ready(service)
 await writeFile(join(rootPath,'sentinel.txt'),'changed')
 assert.equal((await service.execute(approve(changed))).value.result.outcome,'stale')
 assert.deepEqual(await readdir(rootPath),['sentinel.txt'])
})
test('P3 refusal if the checking marker cannot be committed', async t => {
 const {rootPath,service} = await fixture(t,{store:{write:async r => {if(r.phase==='checking') throw Error('storage')}}})
 const plan = await ready(service)
 assert.equal((await service.execute(approve(plan))).value.result.outcome,'stale')
 assert.deepEqual(await readdir(rootPath),['sentinel.txt'])
})
test('P4 restore checking passively and retain target lock', async t => {
 const {rootPath,service,store,make} = await fixture(t)
 const op = await ready(service)
 const marker = {...op,phase:'checking',decision:'consumed',stop:'not-observed',revision:op.revision+1,
  preservation:{status:'stored',durableRevision:op.revision+1}}
 await store.write(marker,op.revision)
 await store.write(marker,op.revision)
 await assert.rejects(store.write({...marker,result:{...marker.result,reason:'different'}},op.revision))
 const restarted = make()
 assert.equal(restarted.restore((await store.list())[0]).value.result.outcome,'unknown')
 assert.equal((await restarted.prepare('project')).ok,false)
 assert.deepEqual(await readdir(rootPath),['sentinel.txt'])
})

test('Initialization IPC rejects raw paths, foreign decisions and foreign state',()=>{
 const envelope={contractVersion:1,correlationId:'request-1',projectId:'project'}
 assert.equal(validateInitializationRequest({...envelope,type:'prepare'}).ok,true)
 assert.equal(validateInitializationRequest({...envelope,type:'prepare',rootPath:'C:/elsewhere'}).ok,false)
 assert.equal(validateInitializationRequest({...envelope,type:'decision',command:{contractVersion:1,type:'approve',
  projectId:'other',attemptId:'attempt',generation:1,planId:'plan',planRevision:'a'.repeat(64),confirmation:'initialize-exact-plan'}}).ok,false)
 assert.equal(isInitializationView({...envelope,sequence:0,operations:[],availability:'available'}),false)
})
test('Native absence refuses a case-insensitive reserved name, then a replaced target',async t=>{
 const {host,rootPath}=await fixture(t)
 const signal=new AbortController().signal
 const absent=await host.observeAbsence('project',rootPath,signal)
 assert.equal(absent.status,'absent')
 await mkdir(join(rootPath,'_BMAD'))
 const occupied=await host.observeAbsence('project',rootPath,signal)
 assert.equal(occupied.status,'unknown')
 assert.deepEqual(occupied.problems,['RESERVED_COLLISION'])
 await rm(rootPath,{recursive:true,force:true})
 await mkdir(rootPath)
 await assert.rejects(host.prepare({projectId:'project',attemptId:'attempt',generation:1,
  context:{scope:'configuration',observation:absent,initiativeId:null}},signal),/TARGET_CHANGED/)
})

test('Q1 refuses a bounded target whose planned union exceeds the byte bound',async t=>{
 const {service,rootPath}=await fixture(t)
 const chunk=Buffer.alloc(1024*1024)
 for(let index=0;index<15;index++)await writeFile(join(rootPath,'preserved-'+index+'.bin'),chunk)
 const before=(await readdir(rootPath)).sort()
 const result=await service.prepare('project')
 assert.equal(result.ok,false)
 assert.equal(service.read().operations[0].result.reason,'TREE_LIMIT')
 assert.deepEqual((await readdir(rootPath)).sort(),before)
})
test('Q2 an unadmitted capture cannot persist even when cancelled while pending',async()=>{
 let release,started
 const waiting=new Promise(resolve=>{release=resolve})
 const entered=new Promise(resolve=>{started=resolve})
 let writes=0
 const service=new BmadInitialization({context:{
  capture:async()=>{started();await waiting;throw Error('storage overlap')},
  assertFresh:async()=>{},subscribeInvalidation:()=>()=>{}
 },host:{prepare:async()=>{throw Error('unexpected host')},authority:()=>undefined},
 store:{write:async()=>{writes++}},admission:new ActivityAdmission(),lifecycle:new LifecycleCoordinator(),newId:randomUUID})
 const preparation=service.prepare('project')
 await entered
 const operation=service.read().operations[0]
 await service.cancelPreparation('project',operation.attemptId,operation.generation)
 release()
 assert.equal((await preparation).ok,false)
 assert.equal(writes,0)
})

test('Q2 storage overlap refuses equality, ancestor and child but admits a prefix sibling',async t=>{
 const {rootPath}=await fixture(t)
 const targets=dirname(rootPath), data=join(targets,'UserData'), child=join(data,'child'), sibling=join(targets,'UserData-copy')
 await mkdir(child,{recursive:true})
 await mkdir(sibling)
 for(const project of [data.toUpperCase(),targets,child]){
  await assert.rejects(assertInitializationOutsideStorage(project,data),/INITIALIZATION_STORAGE_OVERLAP/)
 }
 await assertInitializationOutsideStorage(sibling,data)
})
