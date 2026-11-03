import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,rm,realpath} from 'node:fs/promises'
import {join,dirname,basename} from 'node:path'
import {tmpdir} from 'node:os'

test('qualification receipts retain emitted timings and Job state but only request.op',async()=>{
 const {readBmadProgressTimings}=await import('../scripts/qualification/bmad-progress-timings.mjs')
 const root=await mkdtemp(join(tmpdir(),'mprogress-timings-'))
 try{
  const run=join(root,'operation-owned');await mkdir(run)
  const files={'request.json':{op:'progress',credentials:'NEVER_REPORT',project:'NEVER_REPORT'},'phases.json':{resources_ms:11,runtime_copy_ms:12,runtime_guard_ms:13,native_group_ms:14,secret:'NEVER_REPORT'},'native-timings.json':{worker_ms:15,runtime_guard_ms:16,secret:'NEVER_REPORT'},'terminal.json':{terminal:true,jobAssigned:true,jobActive:0,neverStarted:false,secret:'NEVER_REPORT'},'execution.json':{outcome:'completed',exit:0,job_assigned_before_resume:true,job_active_after_stop:0,elapsed_ms:17,error:'NEVER_REPORT'}}
  for(const [file,value] of Object.entries(files))await writeFile(join(run,file),JSON.stringify(value))
  const result=await readBmadProgressTimings(root),receipt=result.operations[0]
  assert.equal(result.status,'present');assert.equal(receipt.op,'progress');assert.deepEqual(receipt.phases.values,{resources_ms:11,runtime_copy_ms:12,runtime_guard_ms:13,native_group_ms:14});assert.deepEqual(receipt.nativeTimings.values,{worker_ms:15,runtime_guard_ms:16});assert.deepEqual(receipt.terminal.values,{terminal:true,jobAssigned:true,jobActive:0,neverStarted:false});assert.deepEqual(receipt.execution.values,{outcome:'completed',exit:0,job_assigned_before_resume:true,job_active_after_stop:0,elapsed_ms:17});assert.equal(JSON.stringify(result).includes('NEVER_REPORT'),false)
  await mkdir(join(root,'operation-incomplete'));const missing=(await readBmadProgressTimings(root)).operations.find(o=>o.operation==='operation-incomplete');assert.equal(missing.op,null);for(const file of ['phases','nativeTimings','terminal','execution'])assert.equal(missing[file].status,'missing')
  assert.deepEqual(await readBmadProgressTimings(join(root,'absent')),{status:'missing',operations:[]})
 }finally{const target=await realpath(root),temporary=await realpath(tmpdir());assert.equal(dirname(target),temporary);assert.ok(basename(target).startsWith('mprogress-timings-'));await rm(target,{recursive:true,force:true})}
})
