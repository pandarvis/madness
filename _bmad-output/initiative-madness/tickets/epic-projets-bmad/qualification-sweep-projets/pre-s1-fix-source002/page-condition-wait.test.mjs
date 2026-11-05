import test from 'node:test'
import assert from 'node:assert/strict'
import {waitForPageCondition} from '../scripts/qualification/page-condition-wait.mjs'
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
test('waits for resolved false values and returns the exact matching value with exact argument',async()=>{
 const arg={projectId:'other'},matched={ready:true},values=[false,false,matched],seen=[]
 const predicate=async id=>id
 const page={evaluate:async(fn,value)=>{assert.equal(fn,predicate);seen.push(value);await pause(3);return values.shift()}}
 assert.equal(await waitForPageCondition(page,predicate,arg,{timeout:200,interval:2}),matched)
 assert.deepEqual(seen,[arg,arg,arg])
})
test('always false expires at the absolute deadline and stops reading',async()=>{
 let calls=0;const page={evaluate:async()=>{calls++;await pause(12);return false}},start=performance.now()
 await assert.rejects(waitForPageCondition(page,()=>false,undefined,{timeout:42,interval:5}),{name:'TimeoutError'})
 assert.ok(performance.now()-start<140);const stopped=calls;await pause(30);assert.equal(calls,stopped)
})
test('a suspended read times out without pretending to cancel it or polling again',async()=>{
 let calls=0,resolve;const page={evaluate:()=>{calls++;return new Promise(r=>resolve=r)}}
 await assert.rejects(waitForPageCondition(page,()=>false,null,{timeout:25,interval:1}),{name:'TimeoutError'})
 resolve(true);await pause(10);assert.equal(calls,1)
})
test('an original evaluation rejection is returned unchanged and no more reads occur',async()=>{
 const original=Error('page rejected');let calls=0
 await assert.rejects(waitForPageCondition({evaluate:async()=>{calls++;throw original}},()=>false,undefined,{timeout:100,interval:1}),e=>e===original)
 await pause(10);assert.equal(calls,1)
})
test('late rejection after timeout is observed without another read',async()=>{
 let reject,calls=0;const task=waitForPageCondition({evaluate:()=>{calls++;return new Promise((_,r)=>reject=r)}},()=>false,undefined,{timeout:20,interval:1})
 await assert.rejects(task,{name:'TimeoutError'});reject(Error('late'));await pause(10);assert.equal(calls,1)
})
test('success and failure clear their deadline timer',async()=>{
 const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout,active=new Set()
 globalThis.setTimeout=(fn,delay,...args)=>{const timer=originalSet(fn,delay,...args);active.add(timer);return timer}
 globalThis.clearTimeout=timer=>{active.delete(timer);return originalClear(timer)}
 try{assert.equal(await waitForPageCondition({evaluate:async()=>true},()=>true),true);assert.equal(active.size,0)
 await assert.rejects(waitForPageCondition({evaluate:async()=>{throw Error('reject')}},()=>true));assert.equal(active.size,0)}finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;for(const timer of active)originalClear(timer)}
})
test('the interval also uses the remaining deadline, without an extra read',async()=>{
 let calls=0;const start=performance.now()
 await assert.rejects(waitForPageCondition({evaluate:async()=>{calls++;return false}},()=>false,undefined,{timeout:25,interval:1000}),{name:'TimeoutError'})
 assert.equal(calls,1);assert.ok(performance.now()-start<140)
})
