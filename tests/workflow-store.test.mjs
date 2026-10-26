import assert from 'node:assert/strict'
import { test } from 'node:test'
import {mkdtemp,readFile,writeFile,rm,mkdir,readdir} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {WorkflowStore} from '../src/adapters/persistence/workflow-store.ts'
import {isWorkflowRecord} from '../src/contracts/dialogue.ts'
const record=()=>({schemaVersion:1,conversationId:'conversation-1',context:{projectId:'project-1',initiativeId:'initiative-test',conversationId:'conversation-1',connectionId:'account-1',providerId:'codex'},invocation:'$bmad-forge-idea',capturedAt:new Date().toISOString(),rootPath:'C:/project',outputBase:'C:/project/_bmad-output/initiative-test',contextDigest:'a'.repeat(64),fingerprint:'b'.repeat(64),skillPath:'C:/project/.agents/skills/bmad-forge-idea/SKILL.md',workspace:null,outcome:'open',observations:[]})
test('annexe atomique par conversation restaure contexte et preuves sans migration Snapshot',async t=>{
 const root=await mkdtemp(join(tmpdir(),'madness-workflow-test-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const store=new WorkflowStore(root),r=record();assert.deepEqual(await store.read(),[]);assert.equal(isWorkflowRecord(r),true)
 await store.write(r);r.workspace=r.outputBase+'/forge-test';r.observations.push({id:'call-1',turnId:'turn-2',operation:'init',phase:'pending',at:r.capturedAt,path:r.workspace+'/.memlog.md',sha256:null,bytes:null})
 await store.write(r);assert.deepEqual(await new WorkflowStore(root).read(),[r]);assert.deepEqual(await readdir(root),['conversation-1.json'])
 const file=join(root,'conversation-1.json'),before=await readFile(file)
 await writeFile(file,JSON.stringify({...r,external:true}));await assert.rejects(store.write(r),{code:'STORAGE_READ_FAILED'})
 assert.notDeepEqual(await readFile(file),before)
})
test('version future, UTF-8 invalide, conflit et erreur disque préservent les octets',async t=>{
 const root=await mkdtemp(join(tmpdir(),'madness-workflow-test-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const file=join(root,'conversation-1.json'),r=record(),store=new WorkflowStore(root)
 await store.write(r);await writeFile(file,JSON.stringify({...r,outcome:'CLARIFIED'}));await assert.rejects(store.write(r),{code:'OUTPUT_CONFLICT'})
 for(const content of [JSON.stringify({...r,schemaVersion:2}),Buffer.from([0xc0,0x80])]){await writeFile(file,content);await assert.rejects(new WorkflowStore(root).read(),{code:'STORAGE_READ_FAILED'});assert.deepEqual(await readFile(file),Buffer.from(content))}
 const blocked=join(root,'not-directory');await writeFile(blocked,'keep');await assert.rejects(new WorkflowStore(blocked).write(r),{code:'STORAGE_WRITE_FAILED'});assert.equal(await readFile(blocked,'utf8'),'keep')
 const invalid={...r,conversationId:'../escape'};assert.equal(isWorkflowRecord(invalid),false);await assert.rejects(store.write(invalid),{code:'STORAGE_WRITE_FAILED'})
})
test('200 annexes restent lisibles et modifiables ; la 201e est refusée sans changer les octets',async t=>{
 const root=await mkdtemp(join(tmpdir(),'madness-workflow-limit-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const admitted=Array.from({length:200},(_,i)=>{const r=record(),id='conversation-'+i;return {...r,conversationId:id,context:{...r.context,conversationId:id}}})
 await Promise.all(admitted.map(r=>writeFile(join(root,r.conversationId+'.json'),JSON.stringify(r))))
 const store=new WorkflowStore(root);assert.equal((await store.read()).length,200)
 const names=(await readdir(root)).sort(),before=await Promise.all(names.map(name=>readFile(join(root,name))))
 const extra={...record(),conversationId:'conversation-201',context:{...record().context,conversationId:'conversation-201'}}
 await assert.rejects(store.write(extra),{code:'STORAGE_WRITE_FAILED'})
 assert.deepEqual((await readdir(root)).sort(),names);assert.deepEqual(await Promise.all(names.map(name=>readFile(join(root,name)))),before)
 assert.equal((await new WorkflowStore(root).read()).length,200)
 const update={...admitted[0],outcome:'CLARIFIED'};await store.write(update)
 const restored=await new WorkflowStore(root).read();assert.equal(restored.length,200);assert.equal(restored.find(r=>r.conversationId===update.conversationId).outcome,'CLARIFIED')
})
