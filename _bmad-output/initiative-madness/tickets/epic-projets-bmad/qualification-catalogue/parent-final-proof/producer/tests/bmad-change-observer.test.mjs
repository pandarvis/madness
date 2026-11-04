import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,writeFile,mkdir,lstat,rename,rm,readdir,readFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {EventEmitter} from 'node:events'
import {BmadChangeObserver} from '../src/adapters/bmad/change-observer.ts'
const digest=v=>createHash('sha256').update(v).digest('hex')
async function hint(path,kind='presence',extra={}){const s=await lstat(path,{bigint:true});return {path,kind,identity:[s.dev.toString(),s.ino.toString()],sha256:null,names:null,directoriesOnly:false,...extra}}
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'madness-refresh-observer-'));t.after(async()=>{assert.ok(root.startsWith(join(tmpdir(),'madness-refresh-observer-')));await rm(root,{recursive:true,force:true})});return root}
function event(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}}
async function bounded(promise){let timer;try{return await Promise.race([promise,new Promise((_,fail)=>timer=setTimeout(()=>fail(Error('watch event missing')),5000))])}finally{clearTimeout(timer)}}
test('F1/F2 real Windows changes, same-byte replacement, deletion and inventory addition invalidate',async t=>{
 const root=await fixture(t),folder=join(root,'project');await mkdir(folder);const path=join(folder,'ticket.md');await writeFile(path,'old bytes');const value={};let notify=event(),events=0
 const hints={version:1,entries:[await hint(folder,'directory',{names:['ticket.md']}),await hint(path,'file',{sha256:digest('old bytes')})]};const observer=new BmadChangeObserver(v=>v===value?hints:undefined);t.after(()=>observer.shutdown());const lease=await observer.attach(value,()=>{events++;notify.resolve()});assert.equal(lease.health,'watching');assert.equal(await lease.reconcile(),true)
 await writeFile(path,'new bytes');await bounded(notify.promise);assert.equal(await lease.reconcile(),false);lease.close()
 for(const action of ['replace','delete','add']){
  const contents=await readdir(folder),entries=[await hint(folder,'directory',{names:contents})];if(contents.includes('ticket.md'))entries.push(await hint(path,'file',{sha256:digest(await readFile(path))}));const v={},o=new BmadChangeObserver(x=>x===v?{version:1,entries}:undefined),received=event(),l=await o.attach(v,()=>received.resolve());assert.equal(l.health,'watching')
  if(action==='replace'){await rename(path,join(folder,'previous.md'));await writeFile(path,'new bytes')}
  if(action==='delete')await rm(path)
  if(action==='add')await writeFile(join(folder,'new-plan.md'),'new plan')
  await bounded(received.promise);assert.equal(await l.reconcile(),false);o.shutdown()
 }
 assert.ok(events>0)
})
test('F2 absent path with several missing parents watches its closest existing ancestor',async t=>{
 const root=await fixture(t),path=join(root,'missing','nested','ticket.md'),value={},received=event(),observer=new BmadChangeObserver(()=>({version:1,entries:[awaitable]}));const awaitable={path,kind:'missing',identity:null,sha256:null,names:null,directoriesOnly:false};t.after(()=>observer.shutdown());const lease=await observer.attach(value,()=>received.resolve());assert.equal(lease.health,'watching');await mkdir(join(root,'missing'));await bounded(received.promise);assert.equal(await lease.reconcile(),true)
})
test('F3 capture-to-attach mutation and replaced directory fail reconciliation',async t=>{
 const root=await fixture(t),folder=join(root,'project');await mkdir(folder);const path=join(folder,'ticket.md');await writeFile(path,'captured');const receipt={version:1,entries:[await hint(folder,'directory'),await hint(path,'file',{sha256:digest('captured')})]};await writeFile(path,'mutated');const observer=new BmadChangeObserver(()=>receipt);t.after(()=>observer.shutdown());const lease=await observer.attach({},()=>{});assert.equal(lease.health,'unavailable');assert.equal(await lease.reconcile(),false)
})
test('F5 filename loss, watch error and bounds degrade synchronously without fabricated freshness',async t=>{
 const root=await fixture(t),entries=[await hint(root,'directory',{names:[]})];let callback,handle,health=[]
 const observer=new BmadChangeObserver(()=>({version:1,entries}),(_path,_options,fn)=>{callback=fn;handle=new EventEmitter();handle.close=()=>{};return handle});t.after(()=>observer.shutdown());const lease=await observer.attach({},h=>health.push(h));callback('rename',null);assert.equal(health.at(-1),'unavailable');handle.emit('error',Error('overflow'));assert.equal(health.at(-1),'unavailable');assert.equal(await lease.reconcile(),false)
 const boundedObserver=new BmadChangeObserver(()=>({version:1,entries:Array(16385).fill(entries[0])}));t.after(()=>boundedObserver.shutdown());assert.equal((await boundedObserver.attach({},()=>{})).health,'unavailable')
})
test('F8 shutdown closes every watch synchronously and ignores late callbacks',async t=>{
 const root=await fixture(t),entries=[await hint(root,'directory',{names:[]})];let callbacks=[],closed=0,events=0
 const observer=new BmadChangeObserver(()=>({version:1,entries}),(_path,_opts,fn)=>{callbacks.push(fn);const handle=new EventEmitter();handle.close=()=>closed++;return handle});const lease=await observer.attach({},()=>events++);observer.shutdown();assert.equal(closed,callbacks.length);for(const callback of callbacks)callback('change','late.md');assert.equal(events,0);assert.equal(await lease.reconcile(),false)
})

test('native Windows volume64 hints match libuv DWORD32 without rounding the file id',async()=>{const {watcherIdentityMatches}=await import('../src/adapters/bmad/change-observer.ts');const full=8708507883820908980n,inode=9007199257338778n;assert.equal(watcherIdentityMatches([full.toString(),inode.toString()],process.platform==='win32'?BigInt.asUintN(32,full):full,inode),true);assert.equal(watcherIdentityMatches([full.toString(),inode.toString()],process.platform==='win32'?BigInt.asUintN(32,full):full,inode+1n),false)})

test('F5 handle ceiling refuses a wide qualified scope without an unbounded watch allocation',async t=>{
 const root=await fixture(t),entries=[];for(let i=0;i<129;i++){const path=join(root,'dir-'+i,'leaf');await mkdir(path,{recursive:true});entries.push(await hint(path,'directory'))}let handles=0;const observer=new BmadChangeObserver(()=>({version:1,entries}),()=>{handles++;throw Error('must be bounded before allocation')});t.after(()=>observer.shutdown());const lease=await observer.attach({},()=>{});assert.equal(lease.health,'unavailable');assert.equal(handles,0)
})

test('F2 live directory replacement invalidates the old identity without following its new contents',async t=>{
 const root=await fixture(t),folder=join(root,'project');await mkdir(folder);await writeFile(join(folder,'ticket.md'),'captured');const value={},hints={version:1,entries:[await hint(folder,'directory',{names:['ticket.md']}),await hint(join(folder,'ticket.md'),'file',{sha256:digest('captured')})]},received=event(),observer=new BmadChangeObserver(()=>hints);t.after(()=>observer.shutdown());const lease=await observer.attach(value,()=>received.resolve());assert.equal(await lease.reconcile(),true);await rename(folder,folder+'-old');await mkdir(folder);await writeFile(join(folder,'ticket.md'),'captured');await bounded(received.promise);assert.equal(await lease.reconcile(),false)
})

test('F8 shutdown crossing watch creation closes the just-created handle exactly once',async t=>{const root=await fixture(t),entry=await hint(root,'directory',{names:[]});let closes=0;const observer=new BmadChangeObserver(()=>({version:1,entries:[entry]}),()=>{const handle=new EventEmitter();handle.close=()=>closes++;observer.shutdown();return handle});await observer.attach({},()=>{});assert.equal(closes,1)})

test('H2 concurrent scope attachment reserves the total handle ceiling and closes only its partial scope',async t=>{const root=await fixture(t),entry=await hint(root,'directory',{names:[]});let created=0,closed=0,live=0,max=0;const observer=new BmadChangeObserver(()=>({version:1,entries:[entry]}),()=>{created++;live++;max=Math.max(max,live);const handle=new EventEmitter();let released=false;handle.close=()=>{assert.equal(released,false);released=true;closed++;live--};return handle});for(let i=0;i<255;i++)assert.equal((await observer.attach({},()=>{})).health,'watching');assert.equal(live,510);const pair=await Promise.all([observer.attach({},()=>{}),observer.attach({},()=>{})]);assert.ok(max<=512,'peak handles '+max);assert.ok(pair.some(lease=>lease.health==='unavailable'));assert.ok(live>=510,'other scopes must remain attached');observer.shutdown();assert.equal(closed,created);assert.equal(live,0)})
