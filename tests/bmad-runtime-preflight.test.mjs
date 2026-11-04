import test from 'node:test'
import assert from 'node:assert/strict'
import {access,readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {ownedTemp,finishFixture} from '../_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/fixture.mjs'
test('owned fixture remains intact without a correlated stop proof',async()=>{
 const owner=await ownedTemp('mg-clean-')
 const result=await finishFixture(owner,null)
 assert.equal(result.removed,false)
 await access(join(owner.root,'.latency-owner.json'))
 // No child was launched by this data-only counterexample; explicit never-started proof.
 await finishFixture(owner,{id:owner.id,root:owner.root,controllerComplete:true,states:[{started:false,outcome:'start-failed'}]})
})

import {matrix,edgeMatrix} from '../_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/qualify.mjs'
test('closed Windows runtime repeats all bytes and refuses corruptions before UV substitute',async()=>{const result=await matrix({label:'test'});assert.equal(result.files,735);assert.equal(result.canaryExact,true);assert.equal(result.candidate.results.length,13);console.log(JSON.stringify({symlinkFile:result.symlinkFile,limits:result.limits}))})

test('native long paths, ancestor replacement, count/depth bounds and identity failure remain closed',async()=>{const result=await edgeMatrix();assert.ok(result.longPathChars>260);assert.equal(result.identityFault.results[0].admitted,false)})
