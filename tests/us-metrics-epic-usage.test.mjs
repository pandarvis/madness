import test from 'node:test'
import assert from 'node:assert/strict'
import {epicUsage,usageForObservation} from '../src/core/us-metrics.ts'

const story=(overrides={})=>({
 id:'story-1',projectId:'p',rootPath:'C:/first',rootIdentity:'root-1',
 initiativeId:'alpha',initiativePath:'C:/first/alpha',container:'tickets/epic-a',...overrides
})
const usage=(digest)=>({payloadDigest:digest,runId:'run',sessionId:'session',threadId:'thread',nativeTurnId:'native'})
const record=(id,origin,sample)=>({id,story:origin,usage:sample})
const observation=(recordIds,storyRef='story-1',reason='known')=>({members:{schemaVersion:1,recordIds},storyRef,reason})
test('epic coverage uses original turn scope, counts aliases once and keeps conflicts unknown',()=>{
 const common=usage('one')
 const archive={occurrences:[story({container:'tickets/epic-new'})],turns:[
  record('t1',story(),common),record('alias',story(),common),record('t2',story(),undefined),
  record('conflict-a',story(),common),record('conflict-b',story(),usage('two')),
  record('other',story({id:'story-2',initiativePath:'C:/other/alpha',rootIdentity:'root-2'}),common),
  record('root',story({container:'.'}),common),record('unknown',null,common)
 ]}
 const observations=[
  observation(['t1','alias']),observation(['t2']),observation(['conflict-a','conflict-b']),
  observation(['other'],'story-2'),observation(['root']),observation(['unknown'],null),
  {storyRef:'story-1',reason:'known'}
 ]
 const groups=epicUsage({archive,observations})
 assert.deepEqual(groups.map(({container,initiativePath,identified,sampled})=>({container,initiativePath,identified,sampled})),[
  {container:'tickets/epic-a',initiativePath:'C:/first/alpha',identified:3,sampled:1},
  {container:'tickets/epic-a',initiativePath:'C:/other/alpha',identified:1,sampled:1}
 ])
 assert.equal(usageForObservation(observations[0],[archive.turns[0],archive.turns[1]]),common)
 assert.equal(usageForObservation(observations[2],[archive.turns[3],archive.turns[4]]),null)
 assert.equal(usageForObservation(observation(['t1'],'story-1','conflicting'),[archive.turns[0]]),null)
})
