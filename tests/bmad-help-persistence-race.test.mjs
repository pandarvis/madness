import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {BmadHelpCoordinator} from '../src/core/bmad-help.ts'
const gate=()=>{let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j});return {promise,resolve,reject}}
const bundle=()=>({schemaVersion:1,id:'bundle-race',projectId:'project-race',rootPath:'C:/synthetic',observedAt:'2026-11-02T00:00:00.000Z',revision:'a'.repeat(64),diagnostic:'partial',nativeReady:true,problems:[],documents:[],references:[],sources:[],activeInitiative:null,selectedInitiative:null,outputPath:'C:/synthetic/_bmad-output',inventories:[],knowledgeRaw:'{}',configRaw:'{}',skillPath:'C:/owned/bmad/SKILL.md'})
const context={projectId:'project-race',initiativeId:null,conversationId:'conversation-race',providerId:'codex',connectionId:'connection-race'}
const receipt=(operation,reference=null)=>{const raw='Actual '+operation;return {threadId:'native-thread',turnId:'native-turn',callId:'call-'+operation,operation,reference,sha256:createHash('sha256').update(raw).digest('hex'),raw}}
test('late receipt write acknowledgements never overwrite newer receipts or mark their body durable early',async()=>{
 const waits=[gate(),gate()],entered=[gate(),gate()];let writes=0,stored
 const store={read:async()=>[],write:async record=>{const index=++writes;if(index===2||index===3){entered[index-2].resolve();await waits[index-2].promise}stored=structuredClone(record)}}
 const core=new BmadHelpCoordinator({store,application:{},prepare:async()=>{throw Error('No helper')},profile:async()=>{throw Error('No model')},copy:async()=>{}})
 await core.begin(bundle(),context)
 const first=core.tool(context.conversationId,receipt('knowledge'));await entered[0].promise
 const second=core.tool(context.conversationId,receipt('config'));waits[0].resolve();await first;await entered[1].promise
 const third=core.tool(context.conversationId,receipt('read','inventories'))
 assert.notEqual(core.read().records[0].storage,'stored')
 waits[1].resolve();await Promise.all([second,third])
 assert.deepEqual(stored.tools.map(t=>t.operation),['knowledge','config','read'])
 assert.equal(stored.transmission,'transmitted')
 assert.deepEqual(core.read().records[0].tools,stored.tools)
})
test('an old failed response save preserves the newer full response and retry-save sends nothing',async()=>{
 let stored,writes=0,hold=false,helpers=0,models=0
 const waits=[gate(),gate()],entered=[gate(),gate()]
 const store={read:async()=>[],write:async record=>{const index=++writes;if(hold&&index===5){entered[0].resolve();await waits[0].promise}if(hold&&index===6){entered[1].resolve();await waits[1].promise}stored=structuredClone(record)}}
 const draft={text:'Independent exact project draft'}
 const core=new BmadHelpCoordinator({store,application:{draft},prepare:async()=>{helpers++;throw Error()},profile:async()=>{models++;throw Error()},copy:async()=>{}})
 await core.begin(bundle(),context)
 for(const [operation,reference] of [['knowledge',null],['config',null],['read','inventories']])await core.tool(context.conversationId,receipt(operation,reference))
 hold=true
 const old=core.response(context.conversationId,'local-1','First exact received response.',{threadId:'thread',turnId:'native-1'})
 const rejected=assert.rejects(old,/old disk failure/)
 await entered[0].promise
 const current=core.response(context.conversationId,'local-2','New exact received response.',{threadId:'thread',turnId:'native-2'})
 waits[0].reject(Error('old disk failure'));await rejected;await entered[1].promise
 assert.equal(core.read().records[0].response,'New exact received response.')
 assert.equal(core.read().records[0].turns.length,2)
 assert.notEqual(core.read().records[0].storage,'stored')
 const retry=core.execute({contractVersion:1,correlationId:'retry-save-only-race',type:'retry-save',conversationId:context.conversationId})
 waits[1].resolve();await Promise.all([current,retry])
 assert.equal(stored.response,'New exact received response.')
 assert.deepEqual(stored.turns.map(t=>t.response),['First exact received response.','New exact received response.'])
 assert.equal(core.read().records[0].storage,'stored')
 assert.equal(draft.text,'Independent exact project draft')
 assert.equal(helpers,0);assert.equal(models,0)
})
