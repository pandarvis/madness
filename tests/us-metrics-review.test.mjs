import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm,realpath,readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {UsMetricsCoordinator} from '../src/core/us-metrics.ts'
import {UsMetricsStore} from '../src/adapters/persistence/us-metrics-store.ts'
import {BmadHelpAdapter} from '../src/adapters/bmad/help.ts'
import {isBmadProgressSnapshot} from '../src/contracts/bmad-progress.ts'
const context={projectId:'p',initiativeId:'alpha',conversationId:'c',providerId:'codex',connectionId:'account'}
function observation({revision='a',coverage='complete',conflict=false}={}){
 const source={id:'source-entry',path:'C:/project/_bmad-output/alpha/tickets/tickets.toml',relativePath:'tickets/tickets.toml',sha256:'d'.repeat(64),bytes:42,kind:'entry',modifiedAt:'2026-11-05T10:00:00.000Z'}
 const declaration={sourceId:source.id,container:'.',ticketId:'1',title:'Story',field:'existence',value:'entry',line:1},row={sourceId:source.id,container:'.',ticketId:'1',kind:'entry',type:'story',line:1,typeLine:3,identity:'entry-physical'}
 const snapshot={schemaVersion:1,projectId:'p',rootPath:'C:/project',rootIdentity:'physical-root',initiativeId:'alpha',initiativePath:'C:/project/_bmad-output/alpha',contextRevision:'c'.repeat(64),revision:revision.repeat(64),observedAt:'2026-11-05T10:00:00.000Z',coverage,sources:[source],declarations:[declaration],excerpts:[],problems:coverage==='partial'?['Leaf unavailable']:[]}
 const evidence={schemaVersion:1,revision:snapshot.revision,rows:[row]}
 if(conflict){snapshot.sources.push({...source,id:'source-leaf',path:'C:/project/_bmad-output/alpha/tickets/spike.md',relativePath:'tickets/spike.md',kind:'leaf'});snapshot.declarations.push({...declaration,sourceId:'source-leaf',value:'leaf'});evidence.rows.push({...row,sourceId:'source-leaf',kind:'leaf',type:'spike',identity:'leaf-physical'})}
 return {snapshot,authority:{evidence,verify:async()=>{}}}
}
const choose=(storyRef,requestId)=>({contractVersion:1,correlationId:'choose-01',type:'choose',projectId:'p',conversationId:'c',requestId,storyRef,text:'Exact',operation:{type:'send'}})
async function withMetrics(run){const root=await mkdtemp(join(tmpdir(),'madness-metrics-review-'));const c=new UsMetricsCoordinator({store:new UsMetricsStore(root)});try{await run(c)}finally{await c.shutdown();await rm(root,{recursive:true,force:true})}}
test('T1/T2 partial unread conflicting leaf cannot qualify the remaining entry',async()=>{
 await withMetrics(async c=>{
  let f=observation({conflict:true});await c.accept(f.snapshot,f.authority);assert.equal(c.read().projects[0].archive.occurrences.length,0)
  f=observation({revision:'b',coverage:'partial'});await c.accept(f.snapshot,f.authority);assert.equal(c.read().projects[0].archive.occurrences.length,0)
  assert.equal(c.read().projects[0].candidates.some(v=>v.reason==='qualified'),false)
  f=observation({revision:'c'});await c.accept(f.snapshot,f.authority);const p=c.read().projects[0];assert.equal(p.archive.occurrences.length,1);assert.equal(p.candidates[0].reason,'qualified')
 })
})
test('T2/T3 partial observation preserves the occurrence but revokes pending authority and choices',async()=>{
 await withMetrics(async c=>{
  const f=observation();await c.accept(f.snapshot,f.authority);const story=c.read().projects[0].archive.occurrences[0]
  const selected=await c.execute(choose(story.id,'request-1')),instrument=await c.capture(context,'request-1','local-1','Exact',selected.choiceRef)
  const pending=await c.execute(choose(story.id,'request-2')),before=c.read().projects[0].archive
  const partial=observation({revision:'b',coverage:'partial'});await c.accept(partial.snapshot,partial.authority)
  assert.deepEqual(c.read().projects[0].archive,before)
  await assert.rejects(instrument.assertFresh(),{code:'PROFILE_CHANGED'})
  await assert.rejects(c.capture(context,'request-2','local-2','Exact',pending.choiceRef))
  assert.equal((await c.execute(choose(story.id,'request-3'))).choiceRef,null)
  await c.capture(context,'request-4','local-3','Unassigned remains admissible')
  const fresh=observation({revision:'c'});await c.accept(fresh.snapshot,fresh.authority);assert.equal(c.read().projects[0].archive.occurrences[0].id,story.id)
 })
})
for(const includeRows of [false,true])test('T1/T10 refused file grant keeps public progress without metrics authority, rows='+includeRows,async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-metrics-refused-')))
 try{
  const {snapshot,authority}=observation();snapshot.rootPath=root;snapshot.initiativePath=root+'/alpha';for(const source of snapshot.sources)source.path=snapshot.initiativePath+'/'+source.relativePath;if(!includeRows){snapshot.sources=[];snapshot.declarations=[];authority.evidence.rows=[]}
  const {schemaVersion:_,projectId:__,rootPath:___,observedAt:____,...result}=snapshot,hints={version:1,entries:[]},refusal='FILES_BOUND: fixture transport refusal'
  const helper=new BmadHelpAdapter({root:join(root,'operations'),resources:root,owner:{},roots:()=>[]})
  helper.run=async()=>({result,hints,folder:root,fileGrant:{producer:'progress',rootIdentity:result.rootIdentity,revision:result.revision,initiativeId:'alpha',sources:[],refusal},storyEvidence:authority.evidence})
  const value=await helper.observeProgress('p',root,{initiativeId:'alpha',rootIdentity:result.rootIdentity},{revision:result.contextRevision},new AbortController().signal)
  assert.equal(isBmadProgressSnapshot(value),true);assert.equal(helper.filesAuthority(value).refusal,refusal);assert.equal(helper.storyAuthority(value),undefined);assert.equal(helper.dependencies(value),hints)
  await assert.rejects(readFile(join(root,'files.json')),{code:'ENOENT'})
  helper.run=async()=>({result,hints,folder:root,fileGrant:{producer:'progress',rootIdentity:'foreign',revision:result.revision,sources:[],refusal},storyEvidence:authority.evidence})
  await assert.rejects(helper.observeProgress('p',root,{initiativeId:'alpha',rootIdentity:result.rootIdentity},{revision:result.contextRevision},new AbortController().signal),{code:'PROFILE_CHANGED'})
 }finally{await rm(root,{recursive:true,force:true})}
})
test('T3 choose survives an equivalent complete proof carried by a new authority object',async()=>{
 await withMetrics(async c=>{
  const first=observation();await c.accept(first.snapshot,first.authority);const story=c.read().projects[0].archive.occurrences[0]
  const selected=await c.execute(choose(story.id,'request-1')),same=observation();await c.accept(same.snapshot,same.authority)
  const instrument=await c.capture(context,'request-1','local-1','Exact',selected.choiceRef);await instrument.assertFresh()
  const saved=c.read().projects[0].archive.turns[0];assert.equal(saved.story.id,story.id);assert.equal(saved.requestId,'request-1')
 })
})
test('T3 captured effect guard survives an equivalent complete proof carried by a new authority object',async()=>{
 await withMetrics(async c=>{
  const first=observation();await c.accept(first.snapshot,first.authority);const story=c.read().projects[0].archive.occurrences[0],selected=await c.execute(choose(story.id,'request-1'))
  const instrument=await c.capture(context,'request-1','local-1','Exact',selected.choiceRef),same=observation();await c.accept(same.snapshot,same.authority);await instrument.assertFresh()
  assert.equal(c.read().projects[0].archive.turns[0].story.id,story.id)
 })
})
for(const reuseOriginal of [false,true])test('T3 partial recovery never revives revoked instrument or choice, reused authority='+reuseOriginal,async()=>{
 await withMetrics(async c=>{
  const first=observation();await c.accept(first.snapshot,first.authority);const story=c.read().projects[0].archive.occurrences[0],selected=await c.execute(choose(story.id,'request-1'))
  const instrument=await c.capture(context,'request-1','local-1','Exact',selected.choiceRef),pending=await c.execute(choose(story.id,'request-2'))
  const partial=observation({revision:'b',coverage:'partial'});await c.accept(partial.snapshot,partial.authority)
  const recovered=reuseOriginal?first:observation();await c.accept(recovered.snapshot,recovered.authority)
  await assert.rejects(instrument.assertFresh(),{code:'PROFILE_CHANGED'});await assert.rejects(c.capture(context,'request-2','local-2','Exact',pending.choiceRef))
  const fresh=await c.execute(choose(story.id,'request-3')),next=await c.capture(context,'request-3','local-3','Exact',fresh.choiceRef);await next.assertFresh()
  assert.equal(c.read().projects[0].archive.occurrences[0].id,story.id)
 })
})
test('T3 changed complete proof invalidates old capabilities even when the old revision returns',async()=>{
 await withMetrics(async c=>{
  const first=observation();await c.accept(first.snapshot,first.authority);const story=c.read().projects[0].archive.occurrences[0],selected=await c.execute(choose(story.id,'request-1'))
  const instrument=await c.capture(context,'request-1','local-1','Exact',selected.choiceRef),pending=await c.execute(choose(story.id,'request-2')),changed=observation({revision:'b'})
  await c.accept(changed.snapshot,changed.authority);await assert.rejects(instrument.assertFresh(),{code:'PROFILE_CHANGED'})
  await c.accept(first.snapshot,first.authority);await assert.rejects(instrument.assertFresh(),{code:'PROFILE_CHANGED'});await assert.rejects(c.capture(context,'request-2','local-2','Exact',pending.choiceRef),{code:'PROFILE_CHANGED'})
 })
})
test('T3 changed context with identical proof revision rejects old capabilities and admits a fresh choice',async()=>{
 await withMetrics(async c=>{
  const first=observation();await c.accept(first.snapshot,first.authority);const story=c.read().projects[0].archive.occurrences[0],selected=await c.execute(choose(story.id,'request-1'))
  const instrument=await c.capture(context,'request-1','local-1','Exact',selected.choiceRef),pending=await c.execute(choose(story.id,'request-2')),changed=observation();changed.snapshot.contextRevision='e'.repeat(64)
  await c.accept(changed.snapshot,changed.authority);await assert.rejects(instrument.assertFresh(),{code:'PROFILE_CHANGED'});await assert.rejects(c.capture(context,'request-2','local-2','Exact',pending.choiceRef),{code:'PROFILE_CHANGED'})
  const fresh=await c.execute(choose(story.id,'request-3')),next=await c.capture(context,'request-3','local-3','Exact',fresh.choiceRef);await next.assertFresh()
  assert.equal(c.read().projects[0].archive.turns.at(-1).story.contextRevision,'e'.repeat(64))
 })
})
