import assert from 'node:assert/strict'
import {test} from 'node:test'
import {mkdtemp,writeFile,readFile,rm,mkdir,symlink,unlink,lstat,realpath} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {Application} from '../src/core/application.ts'
import {emptySnapshot} from '../src/contracts/index.ts'
import {DialogueCoordinator} from '../src/core/dialogue.ts'
import {isDialogueCommand} from '../src/contracts/dialogue.ts'
const proposals=await import('../src/adapters/codex/file-proposals.ts')
const stores=await import('../src/adapters/persistence/recovery-store.ts').catch(()=>null)
const owned=await import('../src/adapters/codex/owned-run.ts').catch(()=>null)
const hash=s=>createHash('sha256').update(s).digest('hex')
const command=(type,extra={})=>({contractVersion:1,correlationId:'recovery-command',type,...extra})
const context={projectId:'id-1',initiativeId:null,conversationId:'old',providerId:'codex',connectionId:'account'}
const approval=files=>({schemaVersion:1,id:'old-approval',context,requestId:'old-request',turnId:'old-turn',identity:{kind:'unknown'},mode:'file-approval',files,reason:'stopped',adjustment:'Saisie conservée',adjustmentStatus:'draft',status:'unknown',decision:'accept',transmission:'sent',effect:'unknown',result:null,createdAt:'2026-10-27T00:00:00Z',expiresAt:1800000000000,revision:3,storage:'stored'})

test('commandes fermées de récupération : aucun PID, chemin, observation ou texte fournis par le renderer',()=>{
 assert.equal(isDialogueCommand(command('observe-stop')),true)
 assert.equal(isDialogueCommand(command('inspect-approval',{approvalId:'old-approval'})),true)
 for(const extra of [{pid:12},{path:'C:/secret'},{observation:'after'},{text:'replay'}])assert.equal(isDialogueCommand(command('observe-stop',extra)),false)
 assert.equal(isDialogueCommand(command('inspect-approval',{approvalId:'old-approval',rootPath:'C:/foreign'})),false)
})

test('inspection groupée distingue avant/après/mélange/divergence sans appliquer de diff',async t=>{
 assert.equal(typeof proposals.inspectApprovalFiles,'function','Inspection locale attendue')
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-inspect-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const files=[{path:join(root,'a'),kind:'update',diff:'jamais appliqué',beforeSha256:hash('avant'),afterSha256:hash('après')},{path:join(root,'b'),kind:'add',diff:'b',beforeSha256:null,afterSha256:hash('b')}]
 await writeFile(files[0].path,'avant')
 assert.equal((await proposals.inspectApprovalFiles(root,files)).outcome,'before')
 await writeFile(files[0].path,'après');assert.equal((await proposals.inspectApprovalFiles(root,files)).outcome,'mixed')
 await writeFile(files[1].path,'b');assert.equal((await proposals.inspectApprovalFiles(root,files)).outcome,'after')
 await writeFile(files[0].path,'autre');assert.equal((await proposals.inspectApprovalFiles(root,files)).outcome,'diverged')
 assert.equal(await readFile(files[0].path,'utf8'),'autre')
})

test('inspection refuse liens et racines protégées même pour un ajout absent',async t=>{
 assert.equal(typeof proposals.inspectApprovalFiles,'function')
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-safe-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const file={path:join(root,'.git','config'),kind:'add',diff:'',beforeSha256:null,afterSha256:hash('')};await mkdir(join(root,'.git'))
 await assert.rejects(proposals.inspectApprovalFiles(root,[file]),{code:'OUTPUT_REFUSED'})
 const target=join(root,'real');await mkdir(target);const link=join(root,'link');await symlink(target,link,'junction');t.after(async()=>{if((await lstat(link).catch(()=>null))?.isSymbolicLink())await unlink(link)})
 await assert.rejects(proposals.inspectApprovalFiles(root,[{...file,path:join(link,'absent')}]))
})

test('annexe privée versionnée conserve métadonnées inconnues et détecte une écriture externe',async t=>{
 assert.ok(stores,'Stockage propriétaire attendu')
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-store-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const path=join(root,'owned.json'),store=new stores.RecoveryStore(path)
 assert.equal(await store.read(),null)
 const value={schemaVersion:1,runId:'run-local',status:'unknown',identity:null};await store.write(value)
 assert.deepEqual(await new stores.RecoveryStore(path).read(),value)
 await writeFile(path,JSON.stringify({...value,schemaVersion:2}));await assert.rejects(new stores.RecoveryStore(path).read(),{code:'STORAGE_READ_FAILED'});await assert.rejects(store.write(value))
 assert.equal(JSON.parse(await readFile(path,'utf8')).schemaVersion,2)
})

test('propriétaire restauré : identité différente jamais arrêtée ; identité inaccessible reste bloquante',async()=>{
 assert.ok(owned,'Propriétaire durable attendu')
 let record={schemaVersion:1,runId:'owned',status:'unknown',identity:{pid:123,startedAt:'123456',executable:'C:/codex.exe'}},kills=0
 const store={read:async()=>structuredClone(record),write:async v=>record=structuredClone(v)}
 const run=new owned.OwnedRun(store,{read:async()=>({pid:123,startedAt:'autre',executable:'C:/codex.exe'}),stop:async()=>{kills++;return true}})
 assert.equal(await run.status(),'unknown');assert.equal(await run.observeStop(),'stopped');assert.equal(kills,0)
 record={...record,status:'unknown',identity:null};const uncertain=new owned.OwnedRun(store,{read:async()=>{throw Error()},stop:async()=>{kills++;return true}})
 assert.equal(await uncertain.observeStop(),'unknown');assert.equal(kills,0)
})
test('un callback de fermeture ancien ne libère pas le propriétaire suivant',async()=>{
 let record=null;const processIdentity={pid:123,startedAt:'123456',executable:process.execPath},store={read:async()=>record,write:async v=>record=structuredClone(v)}
 const run=new owned.OwnedRun(store,{read:async()=>processIdentity,stop:async()=>true}),first=await run.begin();await run.capture(first,123,process.execPath);await run.closed(first,true)
 const second=await run.begin();await run.capture(second,123,process.execPath);await run.closed(first,true);assert.equal(await run.status(),'unknown');assert.equal(record.runId,second);await run.closed(second,true)
})
test('stockage du propriétaire refusé empêche tout départ et laisse la preuve précédente intacte',async()=>{
 const previous={schemaVersion:1,runId:'ancien',status:'stopped',identity:null},run=new owned.OwnedRun({read:async()=>previous,write:async()=>{throw Error('disk')}},{read:async()=>{throw Error('never')},stop:async()=>{throw Error('never')}})
 await assert.rejects(run.begin());assert.equal(await run.status(),'stopped');assert.equal(previous.status,'stopped')
})
test('deux départs simultanés réservent un seul propriétaire avant toute attente',async()=>{
 let record=null,writes=0,release,entered;const waiting=new Promise(r=>release=r),writing=new Promise(r=>entered=r)
 const run=new owned.OwnedRun({read:async()=>record,write:async value=>{writes++;entered();await waiting;record=structuredClone(value)}},{read:async()=>null,stop:async()=>true})
 const first=run.begin(),second=run.begin(),rejected=assert.rejects(second,{code:'STOP_UNCONFIRMED'});await writing;release();const owner=await first;await rejected;assert.equal(writes,1);assert.equal(record.runId,owner);await assert.rejects(run.begin(),{code:'STOP_UNCONFIRMED'})
})
test('un départ refusé par le stockage libère son verrou pour la prochaine tentative',async()=>{
 let fail=true,record=null
 const run=new owned.OwnedRun({read:async()=>null,write:async value=>{if(fail)throw Error('disk');record=structuredClone(value)}},{read:async()=>null,stop:async()=>true})
 await assert.rejects(run.begin());fail=false;const id=await run.begin();assert.equal(record.runId,id)
})

async function fixture(root,records=[],recovery){
 let snapshot=emptySnapshot(),id=0,opens=0,turns=[],chosenRoot=root
 const app=new Application({store:{read:async()=>structuredClone(snapshot),write:async s=>snapshot=structuredClone(s)},newId:()=> 'id-'+ ++id,now:()=>new Date().toISOString(),chooseDirectory:async()=>({name:'Projet',rootPath:chosenRoot})});await app.execute(command('choose-directory'))
 const deps={application:app,recovery,approvals:{read:async()=>structuredClone(records),write:async()=>{}},inspectApproval:(path,files)=>proposals.inspectApprovalFiles(path,files),qualify:async()=>({rootPath:root,skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async()=>{opens++;return {context:{connectionId:'account',initiativeId:null},turn:async(text,ack)=>{turns.push(text);await ack();return 'Nouveau tour'},stop:async()=>'stopped'}}}
 const dialogue=new DialogueCoordinator(deps);await dialogue.execute(command('read'));return {dialogue,app,deps,changeDirectory:value=>chosenRoot=value,opens:()=>opens,turns:()=>turns}
}
for(const type of ['qualify','launch','qualify-forge'])test('échec de qualification sans dialogue ne récupère jamais le témoin connexion : '+type,async()=>{
 let probeRunning=false,recoveries=0
 const f=await fixture('C:/project',[],{status:async()=>'stopped',observeStop:async()=>{recoveries++;probeRunning=false;return 'stopped'}})
 probeRunning=true;f.deps.qualify=f.deps.qualifyForge=async()=>{throw Object.assign(Error(),{code:'PROFILE_ABSENT'})}
 await f.dialogue.execute(command(type,{projectId:'id-1'}));await f.dialogue.settled();assert.equal(f.dialogue.read().errorCode,'PROFILE_ABSENT');assert.equal(probeRunning,true);assert.equal(recoveries,0);assert.equal(f.opens(),0)
})
test('échec d’un dialogue ouvert ferme son propre contrôle sans observation partagée',async()=>{
 let recoveries=0,stops=0
 const f=await fixture('C:/project',[],{status:async()=>'stopped',observeStop:async()=>{recoveries++;return 'stopped'}})
 f.deps.open=async()=>({context:{connectionId:'account',initiativeId:null},turn:async()=>{throw Object.assign(Error(),{code:'PROVIDER_FAILED'})},stop:async()=>{stops++;return 'stopped'}})
 await f.dialogue.execute(command('launch',{projectId:'id-1'}));await f.dialogue.settled();assert.equal(stops,1);assert.equal(recoveries,0);assert.equal(f.dialogue.read().errorCode,'PROVIDER_FAILED')
})
test('ouverture au résultat d’arrêt inconnu garde le verrou jusqu’à la récupération explicite',async()=>{
 let owner='stopped',recoveries=0
 const f=await fixture('C:/project',[],{status:async()=>owner,observeStop:async()=>{recoveries++;owner='stopped';return 'stopped'}})
 f.deps.open=async()=>{owner='unknown';throw Object.assign(Error(),{code:'STOP_UNCONFIRMED'})}
 await f.dialogue.execute(command('launch',{projectId:'id-1'}));await f.dialogue.settled();assert.equal(f.dialogue.read().status,'unknown');assert.equal(f.dialogue.read().recovery.stop,'unconfirmed');assert.equal(recoveries,0);assert.equal((await f.dialogue.execute(command('launch',{projectId:'id-1'}))).errorCode,'STOP_UNCONFIRMED')
 await f.dialogue.execute(command('observe-stop'));await f.dialogue.settled();assert.equal(recoveries,1);assert.equal(f.dialogue.read().status,'stopped')
})
test('arrêt non confirmé durable bloque après restauration puis réobservation explicite débloque sans moteur',async()=>{
 let status='unknown';const f=await fixture('C:/project',[],{status:async()=>status,observeStop:async()=>status='stopped'})
 assert.equal(f.dialogue.read().errorCode,'STOP_UNCONFIRMED');assert.equal((await f.dialogue.execute(command('launch',{projectId:'id-1'}))).errorCode,'STOP_UNCONFIRMED');assert.equal(f.opens(),0)
 await f.dialogue.execute(command('observe-stop'));await f.dialogue.settled();assert.equal(f.dialogue.read().status,'stopped');assert.equal(f.opens(),0)
})
test('métadonnées de récupération illisibles restent un blocage visible sans moteur',async()=>{
 const f=await fixture('C:/project',[],{status:async()=>{throw Error('future-version')},observeStop:async()=>{throw Error('unknown')}})
 assert.equal(f.dialogue.read().status,'unknown');assert.equal(f.dialogue.read().errorCode,'STORAGE_READ_FAILED');assert.equal(f.dialogue.read().recovery.stop,'unconfirmed');await f.dialogue.execute(command('launch',{projectId:'id-1'}));assert.equal(f.opens(),0)
})
test('accord incertain exige inspection fraîche : aucun ancien accord, texte ou brouillon au nouveau lancement',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-launch-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const path=join(root,'a');await writeFile(path,'avant')
 const record=approval([{path,kind:'update',diff:'ne pas appliquer',beforeSha256:hash('avant'),afterSha256:hash('après')}]),f=await fixture(root,[record]);await f.app.execute(command('save-draft',{projectId:'id-1',text:'Brouillon privé'}))
 await f.dialogue.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await f.dialogue.settled();assert.equal(f.opens(),0);assert.equal(f.dialogue.read().errorCode,'INSPECTION_REQUIRED')
 await f.dialogue.execute(command('inspect-approval',{approvalId:record.id}));await f.dialogue.settled();assert.equal(f.dialogue.read().recovery.observations[0].outcome,'before');assert.equal(f.dialogue.read().approvals[0].effect,'unknown')
 await writeFile(path,'après');await f.dialogue.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await f.dialogue.settled();assert.equal(f.opens(),0);assert.equal(f.dialogue.read().errorCode,'INSPECTION_STALE')
 await f.dialogue.execute(command('inspect-approval',{approvalId:record.id}));await f.dialogue.settled();await f.dialogue.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await f.dialogue.settled();assert.equal(f.opens(),1);assert.deepEqual(f.turns(),[null]);assert.equal(await readFile(path,'utf8'),'après');assert.equal(f.dialogue.read().approvals[0].effect,'unknown');await f.dialogue.shutdown()
})
test('inspection bloque mélange et divergence et ne survit jamais à une nouvelle instance',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-mixed-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const a=join(root,'a'),b=join(root,'b');await writeFile(a,'après');await writeFile(b,'avant')
 const record=approval([a,b].map(path=>({path,kind:'update',diff:'non appliqué',beforeSha256:hash('avant'),afterSha256:hash('après')}))),f=await fixture(root,[record])
 await f.dialogue.execute(command('inspect-approval',{approvalId:record.id}));await f.dialogue.settled();await f.dialogue.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await f.dialogue.settled();assert.equal(f.dialogue.read().errorCode,'INSPECTION_CONFLICT');assert.equal(f.opens(),0)
 await writeFile(b,'après');await f.dialogue.execute(command('inspect-approval',{approvalId:record.id}));await f.dialogue.settled();const restored=new DialogueCoordinator(f.deps);await restored.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await restored.settled();assert.equal(restored.read().errorCode,'INSPECTION_REQUIRED');assert.deepEqual(restored.read().recovery.observations,[]);assert.equal(f.opens(),0)
})
test('inspection réserve avant await et refuse navigation concurrente sans lancer de modèle',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-race-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const path=join(root,'a');await writeFile(path,'avant');let release,entered;const waiting=new Promise(r=>release=r),started=new Promise(r=>entered=r)
 const record=approval([{path,kind:'update',diff:'',beforeSha256:hash('avant'),afterSha256:hash('après')}]),f=await fixture(root,[record]);f.deps.inspectApproval=async()=>{entered();await waiting;return proposals.inspectApprovalFiles(root,record.files)}
 await f.dialogue.execute(command('inspect-approval',{approvalId:record.id}));await started;assert.equal((await f.dialogue.execute(command('launch',{projectId:'id-1'}))).errorCode,'BUSY');f.changeDirectory(root+'-different');await f.app.execute(command('choose-directory'));release();await f.dialogue.settled();assert.equal(f.dialogue.read().errorCode,'CONTEXT_MISMATCH');assert.equal(f.opens(),0);assert.deepEqual(f.dialogue.read().recovery.observations,[])
})
test('une modification pendant ouverture est refusée avant le premier tour avec effets',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-recovery-open-race-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const path=join(root,'a');await writeFile(path,'avant');const record=approval([{path,kind:'update',diff:'',beforeSha256:hash('avant'),afterSha256:hash('après')}]),f=await fixture(root,[record]);await f.dialogue.execute(command('inspect-approval',{approvalId:record.id}));await f.dialogue.settled();let turns=0,stops=0
 f.deps.open=async()=>{await writeFile(path,'après');return {context:{connectionId:'account',initiativeId:null},turn:async()=>{turns++;return 'interdit'},stop:async()=>{stops++;return 'stopped'}}}
 await f.dialogue.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await f.dialogue.settled();assert.equal(turns,0);assert.equal(stops,1);assert.equal(f.dialogue.read().errorCode,'INSPECTION_STALE')
})
