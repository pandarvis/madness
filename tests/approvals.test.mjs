import assert from 'node:assert/strict'
import {test} from 'node:test'
import {mkdtemp,writeFile,readFile,rm,mkdir,symlink,realpath,rename,lstat,unlink,readdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {isDialogueCommand} from '../src/contracts/dialogue.ts'
import {initialDialogueState,isDialogueState,MAX_SESSION_MESSAGES,MAX_SESSION_TEXT,MAX_TURN_MESSAGES} from '../src/contracts/dialogue.ts'
import {MAX_DRAFT_LENGTH} from '../src/contracts/index.ts'
import {Application} from '../src/core/application.ts'
import {DialogueCoordinator} from '../src/core/dialogue.ts'
import {emptySnapshot} from '../src/contracts/index.ts'
const proposals=await import('../src/adapters/codex/file-proposals.ts').catch(()=>null)
const contracts=await import('../src/contracts/approvals.ts').catch(()=>null)
const stores=await import('../src/adapters/persistence/approval-store.ts').catch(()=>null)
const context={projectId:'p',initiativeId:null,conversationId:'c',providerId:'codex',connectionId:'account'}
const record=()=>({schemaVersion:1,id:'approval-local',context,requestId:'request-local',turnId:'turn-1',identity:{kind:'unknown'},mode:'file-approval',files:[{path:'C:/project/a.md',kind:'add',diff:'été\n',beforeSha256:null,afterSha256:'a'.repeat(64)}],reason:null,adjustment:'',adjustmentStatus:'draft',status:'waiting',decision:null,transmission:'none',effect:'pending',result:null,createdAt:'2026-10-27T00:00:00Z',expiresAt:1800000000000,revision:1,storage:'stored'})
test('approbation stricte : aucun accord global, ID natif, feedback ou champ inconnu',()=>{
 assert.ok(contracts,'Contrat approbation attendu')
 assert.equal(contracts.isApprovalRecord(record()),true)
 assert.equal(contracts.isApprovalRecord({...record(),nativeId:0}),false)
 const command=(type,extra)=>({contractVersion:1,correlationId:'approval-command',type,...extra})
 assert.equal(isDialogueCommand(command('launch',{projectId:'p',mode:'file-approval'})),true)
 assert.equal(isDialogueCommand(command('decide-approval',{approvalId:'approval-local',decision:'accept'})),true)
 assert.equal(isDialogueCommand(command('decide-approval',{approvalId:'approval-local',decision:'acceptForSession'})),false)
 assert.equal(isDialogueCommand(command('decide-approval',{approvalId:'approval-local',decision:'decline',feedback:'inventé'})),false)
})
test('patch mixte : tous les contenus natifs, empreintes et effets ; précondition modifiée refuse tout',async t=>{
 assert.ok(proposals,'Contrôle des propositions attendu')
 const root=await mkdtemp(join(tmpdir(),'madness-approval-files-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 await writeFile(join(root,'a.md'),'ancien\n');await writeFile(join(root,'d.md'),'à retirer\n')
 const changes=[{path:join(root,'a.md'),kind:{type:'update',move_path:null},diff:'@@ -1 +1 @@\n-ancien\n+nouveau\n'},{path:join(root,'b.md'),kind:{type:'add'},diff:'créé\n'},{path:join(root,'d.md'),kind:{type:'delete'},diff:'à retirer\n'}]
 const proposal=await proposals.captureFileProposal(root,changes,[])
 assert.equal(proposal.files.length,3);assert.equal(proposal.files.find(f=>f.kind==='add').diff,'créé\n')
 await proposal.assertUnchanged();await writeFile(join(root,'a.md'),'nouveau\n');await writeFile(join(root,'b.md'),'créé\n');await rm(join(root,'d.md'))
 assert.equal((await proposal.inspectEffects()).matches,true)
 await assert.rejects(proposal.assertUnchanged(),{code:'OUTPUT_CONFLICT'})
})
test('hors projet, protégé, déplacement, portée inconnue et diff incomplet sont refusés',async t=>{
 assert.ok(proposals)
 const root=await mkdtemp(join(tmpdir(),'madness-approval-boundary-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));await writeFile(join(root,'a'),'old\n');await mkdir(join(root,'.git'))
 const change=(path,kind={type:'add'},diff='new\n')=>[{path,kind,diff}]
 for(const changes of [change(join(root,'..','outside')),change(join(root,'.git','config')),change(join(root,'a'),{type:'update',move_path:join(root,'b')},'@@ -1 +1 @@\n-old\n+new\n'),change(join(root,'a'),{type:'unknown'}),change(join(root,'a'),{type:'update',move_path:null},'@@ -1 +1 @@\n-wrong\n+new\n')])await assert.rejects(proposals.captureFileProposal(root,changes,[]))
 await assert.rejects(proposals.captureFileProposal(root,change(join(root,'data','secret')), [join(root,'data')]))
})
test('une racine remplacée par une jonction extérieure retire un ajout absent avant tout accord',async t=>{
 const workspace=await realpath(await mkdtemp(join(tmpdir(),'madness-approval-root-'))),root=join(workspace,'project'),outside=join(workspace,'outside'),original=join(workspace,'original')
 await mkdir(root);await mkdir(outside)
 t.after(async()=>{if((await lstat(root).catch(()=>null))?.isSymbolicLink())await unlink(root);await rm(workspace,{recursive:true,force:true,maxRetries:3})})
 const proposal=await proposals.captureFileProposal(root,[{path:join(root,'nouveau.md'),kind:{type:'add'},diff:'Proposition sans effet.\n'}],[])
 await proposal.assertUnchanged();await rename(root,original);await symlink(outside,root,'junction')
 assert.equal(await realpath(root),outside);await assert.rejects(proposal.assertUnchanged(),{code:'OUTPUT_REFUSED'});assert.deepEqual(await readdir(outside),[])
})
test('un petit diff sur la dernière ligne est refusé si son résultat dépasse la capacité de relecture',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-approval-result-size-')));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const before='a'.repeat(89999)+'\nx',diff='@@ -2 +2 @@\n-x\n\\ No newline at end of file\n+'+'b'.repeat(20001)+'\n';await writeFile(join(root,'grand.md'),before)
 assert.equal(Buffer.byteLength(before),90001);assert.ok(Buffer.byteLength(diff)<21000);assert.equal(90000+20001+1,110002)
 await assert.rejects(proposals.captureFileProposal(root,[{path:join(root,'grand.md'),kind:{type:'update',move_path:null},diff}],[]),{code:'OUTPUT_REFUSED'});assert.equal(await readFile(join(root,'grand.md'),'utf8'),before)
 await assert.rejects(proposals.captureFileProposal(root,[{path:join(root,'utf8.md'),kind:{type:'add'},diff:'é'.repeat(60000)}],[]),{code:'OUTPUT_REFUSED'})
})
test('annexe approbation atomique conserve conflit/version inconnue et toutes les saisies',async t=>{
 assert.ok(stores,'Annexe approbation attendue')
 const root=await mkdtemp(join(tmpdir(),'madness-approval-store-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const store=new stores.ApprovalStore(root),value=record()
 await store.write(value);value.adjustment='Revoir la proposition';value.revision++;await store.write(value)
 assert.deepEqual(await new stores.ApprovalStore(root).read(),[value]);const path=join(root,value.id+'.json');await writeFile(path,JSON.stringify({...value,revision:20}));await assert.rejects(store.write(value),{code:'OUTPUT_CONFLICT'})
 const bytes=JSON.stringify({...value,schemaVersion:2});await writeFile(path,bytes);await assert.rejects(new stores.ApprovalStore(root).read(),{code:'STORAGE_READ_FAILED'});assert.equal(await readFile(path,'utf8'),bytes)
})
async function coordinatorFixture(options={}){
 let snapshot=emptySnapshot(),counter=0,records=[],offered,finish,invalidated,decisions=[],resultResolve,resultReject,turns=0,approvalObserver
 const ready=new Promise(r=>offered=r),done=new Promise(r=>finish=r),retired=new Promise(r=>invalidated=r),result=new Promise((resolve,reject)=>{resultResolve=resolve;resultReject=reject})
 const command=(type,extra={})=>({contractVersion:1,correlationId:'approval-command',type,...extra})
 const application=new Application({store:{read:async()=>structuredClone(snapshot),write:async s=>snapshot=structuredClone(s)},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({name:'Projet',rootPath:options.directory?.()??'C:/project'})});await application.execute(command('choose-directory'))
 const deps={application,approvals:{read:async()=>structuredClone(records),write:async a=>{await options.write?.(a);records=[...records.filter(x=>x.id!==a.id),structuredClone(a)]}},qualify:async()=>({rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async(profile,signal)=>({context:{connectionId:'account',initiativeId:null},turn:async(text,accepted,_m,_q,onApproval)=>{turns++;await accepted();if(turns>1)return options.nextTurn?.(text,_m)??'Ajustement transmis : '+text;approvalObserver=onApproval;await onApproval({files:record().files,identity:{kind:'unknown'},expiresAt:Date.now()+600000},{invalidated:retired,result,decide:async decision=>{decisions.push(decision);await options.decide?.();}});offered();await Promise.race([done,new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error(),{code:'CANCELLED'})),{once:true}))]);signal.throwIfAborted();return 'Tour terminé'},stop:async()=>'stopped'})}
 const dialogue=new DialogueCoordinator(deps);await dialogue.execute(command('launch',{projectId:'id-1',mode:'file-approval'}));await ready
 return {dialogue,deps,application,records:()=>records,command,decisions,finish,invalidated,resultResolve,resultReject,turns:()=>turns,offerApproval:async()=>{let resolveResult;const nextResult=new Promise(r=>resolveResult=r);await approvalObserver({files:record().files,identity:{kind:'unknown'},expiresAt:Date.now()+600000},{invalidated:retired,result:nextResult,decide:async decision=>decisions.push(decision)});return {record:dialogue.read().approvals.at(-1),resolveResult}}}
}
for(const outcome of ['resolve','reject'])test('une décision ancienne retardée ne touche pas la nouvelle conversation et son prochain envoi : '+outcome,async()=>{
 let release,entered;const held=new Promise(r=>release=r),deciding=new Promise(r=>entered=r),f=await coordinatorFixture({decide:async()=>{entered();await held;if(outcome==='reject')throw Object.assign(Error('Old decision rejected'),{code:'CANCELLED'})}}),approval=f.dialogue.read().approvals[0]
 const old=f.dialogue.execute(f.command('decide-approval',{approvalId:approval.id,decision:'accept'}));await deciding
 await f.dialogue.execute(f.command('stop'));await f.dialogue.settled();assert.equal(f.dialogue.read().status,'stopped')
 // Comme le vrai port arrêté, l’issue native ancienne rejette avant la nouvelle
 // session ; sa décision reste retenue et ne se libère qu’après le lancement.
 f.resultReject(Object.assign(Error('Stopped native result'),{code:'CANCELLED'}));await new Promise(r=>setImmediate(r))
 try{
  await f.dialogue.execute(f.command('launch',{projectId:approval.context.projectId}));while(f.turns()<2)await new Promise(r=>setImmediate(r));const fresh=f.dialogue.read();assert.notEqual(fresh.context.conversationId,approval.context.conversationId)
  release();const returned=await old;await f.dialogue.settled();assert.equal(f.dialogue.read().context.conversationId,fresh.context.conversationId);assert.equal(f.dialogue.read().status,'ready');assert.equal(f.dialogue.read().errorCode,null);assert.equal(returned.context.conversationId,fresh.context.conversationId);assert.equal(returned.errorCode,null)
  const historical=f.dialogue.read().approvals.find(a=>a.id===approval.id);assert.equal(historical.status,'unknown');assert.equal(historical.storage,'stored');assert.deepEqual(historical.context,approval.context)
  const text='Message propre à la nouvelle conversation.';await f.dialogue.execute(f.command('send',{projectId:fresh.context.projectId,conversationId:fresh.context.conversationId,text}));await f.dialogue.settled();assert.equal(f.turns(),3);assert.equal(f.dialogue.read().status,'ready');assert.equal(f.dialogue.read().errorCode,null);assert.equal(isDialogueState(f.dialogue.read()),true)
  const saved=await f.application.execute(f.command('read-state'));assert.equal(saved.value.state.conversations.find(c=>c.id===fresh.context.conversationId).messages.some(m=>m.role==='user'&&m.text===text),true)
 }finally{release();await old;await f.dialogue.shutdown()}
})
async function decline(f,a,resolveResult){await f.dialogue.execute(f.command('decide-approval',{approvalId:a.id,decision:'decline'}));resolveResult({nativeStatus:'declined',raw:'patch rejected by user',files:[{path:a.files[0].path,sha256:null,matches:true}]});await new Promise(r=>setImmediate(r))}
async function readyAdjustment(f){const a=f.dialogue.read().approvals[0];await decline(f,a,f.resultResolve);f.finish();await f.dialogue.settled();await f.dialogue.execute(f.command('save-approval',{approvalId:a.id,adjustment:'Ajustement capturé.'}));return a}
test('un ajustement réserve la session avant le disque et refuse un autre ajustement ou un envoi libre',async()=>{
 let held=false,entered,release;const writing=new Promise(r=>entered=r),gate=new Promise(r=>release=r),f=await coordinatorFixture({write:async a=>{if(held&&a.adjustmentStatus==='sending'){entered();await gate}}}),first=f.dialogue.read().approvals[0]
 await decline(f,first,f.resultResolve);const second=await f.offerApproval();await decline(f,second.record,second.resolveResult);f.finish();await f.dialogue.settled()
 for(const a of [first,second.record])await f.dialogue.execute(f.command('save-approval',{approvalId:a.id,adjustment:'Ajustement '+a.id}))
 held=true;const sending=f.dialogue.execute(f.command('send-adjustment',{approvalId:first.id}));await writing
 assert.equal(f.dialogue.read().status,'running');assert.ok((await f.dialogue.execute(f.command('send-adjustment',{approvalId:second.record.id}))).errorCode);assert.ok((await f.dialogue.execute(f.command('send',{projectId:first.context.projectId,conversationId:first.context.conversationId,text:'Envoi concurrent'}))).errorCode)
 release();await sending;await f.dialogue.settled();assert.equal(f.turns(),2);await f.dialogue.shutdown()
})
for(const outcome of ['stop','failure'])test('la réservation d’ajustement préserve '+outcome+' pendant la sauvegarde retenue',async()=>{
 let held=false,entered,release;const writing=new Promise(r=>entered=r),gate=new Promise(r=>release=r),f=await coordinatorFixture({write:async a=>{if(held&&a.adjustmentStatus==='sending'){entered();await gate;if(outcome==='failure')throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'})}}}),a=await readyAdjustment(f)
 held=true;const sending=f.dialogue.execute(f.command('send-adjustment',{approvalId:a.id}));await writing;assert.equal(f.dialogue.read().status,'running')
 if(outcome==='stop')await f.dialogue.execute(f.command('stop'));release();const result=await sending;await f.dialogue.settled();assert.equal(f.turns(),1);assert.equal(f.dialogue.read().approvals[0].adjustment,'Ajustement capturé.')
 if(outcome==='stop')assert.equal(f.dialogue.read().status,'stopped')
 else {assert.equal(result.errorCode,'STORAGE_WRITE_FAILED');assert.equal(f.dialogue.read().status,'ready');assert.equal(f.dialogue.read().approvals[0].adjustmentStatus,'draft');held=false;await f.dialogue.execute(f.command('send-adjustment',{approvalId:a.id}));await f.dialogue.settled();assert.equal(f.turns(),2)}
 await f.dialogue.shutdown()
})
for(const bound of ['messages','text'])test('un ajustement respecte la réserve de session '+bound+' et garde lecture, saisie et arrêt disponibles',async()=>{
 const f=await coordinatorFixture({nextTurn:(text,observe)=>{if(bound==='text')return 'x'.repeat(MAX_DRAFT_LENGTH);const parts=Array.from({length:MAX_TURN_MESSAGES},()=> 'x');parts.forEach((text,i)=>observe({id:'item-'+i,order:i+1,text,completed:true,identity:{kind:'unknown'}}));return parts.join('\n\n')}}),a=await readyAdjustment(f),turnCount=bound==='messages'?9:19
 for(let i=0;i<turnCount;i++){const result=await f.dialogue.execute(f.command('send',{projectId:a.context.projectId,conversationId:a.context.conversationId,text:'Suite'}));assert.equal(result.errorCode,null);await f.dialogue.settled()}
 const before=f.dialogue.read();assert.equal(isDialogueState(before),true);assert.ok(bound==='messages'?before.messages.length>MAX_SESSION_MESSAGES-MAX_TURN_MESSAGES:before.messages.reduce((n,m)=>n+m.text.length,0)>MAX_SESSION_TEXT-MAX_DRAFT_LENGTH)
 assert.equal((await f.dialogue.execute(f.command('send-adjustment',{approvalId:a.id}))).errorCode,'OUTPUT_REFUSED');assert.equal(f.turns(),turnCount+1);assert.equal((await f.dialogue.execute(f.command('read'))).approvals[0].adjustment,'Ajustement capturé.');assert.equal((await f.dialogue.execute(f.command('save-approval',{approvalId:a.id,adjustment:'Saisie disponible à la limite.'}))).errorCode,null);await f.dialogue.execute(f.command('stop'));await f.dialogue.settled();assert.equal(f.dialogue.read().status,'stopped');await f.dialogue.shutdown()
})
test('décision verrouillée avant await, transmission distincte des effets puis ajustement explicite',async()=>{
 let release;const held=new Promise(r=>release=r),f=await coordinatorFixture({decide:()=>held}),a=f.dialogue.read().approvals[0]
 assert.equal(f.dialogue.read().mode,'file-approval');assert.equal(isDialogueState(f.dialogue.read()),true)
 const sending=f.dialogue.execute(f.command('decide-approval',{approvalId:a.id,decision:'decline'}));assert.equal((await f.dialogue.execute(f.command('decide-approval',{approvalId:a.id,decision:'accept'}))).errorCode,'BUSY')
 release();await sending;assert.equal(f.dialogue.read().approvals[0].transmission,'sent');assert.equal(f.dialogue.read().approvals[0].effect,'pending')
 f.resultResolve({nativeStatus:'declined',raw:'patch rejected by user',files:[{path:a.files[0].path,sha256:null,matches:true}]});f.finish();await f.dialogue.settled()
 assert.deepEqual(f.decisions,['decline']);assert.equal(f.dialogue.read().approvals[0].effect,'declined')
 assert.equal((await f.dialogue.execute(f.command('send-adjustment',{approvalId:a.id}))).errorCode,'CONTEXT_MISMATCH');assert.equal(f.turns(),1)
 await f.dialogue.execute(f.command('save-approval',{approvalId:a.id,adjustment:'Créer seulement un résumé.'}));assert.equal(f.turns(),1)
 await f.dialogue.execute(f.command('send-adjustment',{approvalId:a.id}));await f.dialogue.settled();assert.equal(f.turns(),2);assert.equal(f.dialogue.read().approvals[0].adjustment,'Créer seulement un résumé.')
 assert.equal((await f.dialogue.execute(f.command('save-approval',{approvalId:a.id,adjustment:'Remplacement tardif'}))).errorCode,'CONTEXT_MISMATCH');assert.equal(f.dialogue.read().approvals[0].adjustment,'Créer seulement un résumé.')
 await f.dialogue.shutdown()
})
test('restauration sans moteur garde un accord incertain et retire toute commande',async()=>{
 const value={...record(),status:'sending',decision:'accept',transmission:'pending'},application=new Application({store:{read:async()=>emptySnapshot(),write:async()=>{}},newId:()=>'',now:()=>'',chooseDirectory:async()=>null})
 const dialogue=new DialogueCoordinator({application,approvals:{read:async()=>[value],write:async()=>{}},qualify:async()=>{throw Error('Aucun moteur')},open:async()=>{throw Error('Aucun moteur')}})
 const state=await dialogue.execute({contractVersion:1,correlationId:'restore-approval',type:'read'});assert.equal(state.approvals[0].status,'unknown');assert.equal(state.approvals[0].decision,'accept');assert.equal(state.mode,'read-only')
 assert.equal((await dialogue.execute({contractVersion:1,correlationId:'restore-approval',type:'decide-approval',approvalId:value.id,decision:'accept'})).errorCode,'CONTEXT_MISMATCH')
})
test('arrêt pendant sauvegarde retire la commande et conserve la saisie sans transmission',async()=>{
 let release,entered;const held=new Promise(r=>release=r),writing=new Promise(r=>entered=r),f=await coordinatorFixture({write:async a=>{if(a.status==='sending'){entered();await held}}}),a=f.dialogue.read().approvals[0]
 await f.dialogue.execute(f.command('save-approval',{approvalId:a.id,adjustment:'Conserver cette demande.'}));const deciding=f.dialogue.execute(f.command('decide-approval',{approvalId:a.id,decision:'accept'}));await writing
 await f.dialogue.execute(f.command('stop'));release();await deciding;await f.dialogue.settled();assert.deepEqual(f.decisions,[]);assert.equal(f.dialogue.read().approvals[0].adjustment,'Conserver cette demande.');assert.equal(f.dialogue.read().approvals[0].status,'unknown');await f.dialogue.shutdown()
 let directory='C:/project';const moved=await coordinatorFixture({directory:()=>directory}),original=moved.dialogue.read().approvals[0];directory='C:/other-project';await moved.application.execute(moved.command('choose-directory'));await moved.dialogue.settled()
 assert.equal((await moved.dialogue.execute(moved.command('decide-approval',{approvalId:original.id,decision:'accept'}))).errorCode,'CONTEXT_MISMATCH');assert.deepEqual(moved.decisions,[]);assert.equal(moved.dialogue.read().approvals[0].reason,'changed');await moved.dialogue.shutdown()
})
test('un reçu conservé attend le résultat, et un refus disque ultérieur reste inconnu',async()=>{
 let fail=false;const f=await coordinatorFixture({write:async a=>{if(fail&&a.effect==='succeeded')throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'})}}),a=f.dialogue.read().approvals[0]
 await f.dialogue.execute(f.command('decide-approval',{approvalId:a.id,decision:'accept'}));fail=true
 f.resultResolve({nativeStatus:'completed',raw:'Exit code: 0',files:[{path:a.files[0].path,sha256:'a'.repeat(64),matches:true}]});f.finish();await f.dialogue.settled()
 assert.equal(f.dialogue.read().approvals[0].status,'unknown');assert.equal(f.dialogue.read().approvals[0].effect,'unknown');assert.equal(f.dialogue.read().approvals[0].decision,'accept');assert.equal(f.records()[0].status,'unknown');await f.dialogue.shutdown()
})
test('la validation d’une portée mal formée ne lance jamais une exception',()=>{
 for(const files of [[{}],[null],[{path:1}],[{path:null}]])assert.equal(contracts.isApprovalRecord({...record(),files}),false)
})
test('la restauration d’un effet connu garde la preuve tout en retirant tous les choix',async()=>{
 const value={...record(),status:'decided',decision:'accept',transmission:'sent',effect:'succeeded',result:{nativeStatus:'completed',raw:'Exit code: 0',files:[{path:record().files[0].path,sha256:'a'.repeat(64),matches:true}]}},application=new Application({store:{read:async()=>emptySnapshot(),write:async()=>{}},newId:()=>'',now:()=>'',chooseDirectory:async()=>null})
 const dialogue=new DialogueCoordinator({application,approvals:{read:async()=>[value],write:async()=>{}},qualify:async()=>{throw Error()},open:async()=>{throw Error()}}),state=await dialogue.execute({contractVersion:1,correlationId:'restore-approval',type:'read'})
 assert.equal(state.approvals[0].status,'inactive');assert.equal(state.approvals[0].effect,'succeeded');assert.deepEqual(state.approvals[0].result,value.result);assert.equal(state.approvals[0].reason,'reopened')
})
