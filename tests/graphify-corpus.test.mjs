import {createHash} from 'node:crypto'
import {realpathSync} from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm,lstat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
test('native corpus includes untracked code only, refuses replaced grants and observes additions',async()=>{const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-corpus-')));try{const project=join(owner,'project'),data=join(owner,'data');await mkdir(project);await mkdir(data);await writeFile(join(project,'a.ts'),'export function first(){return 1}\n');await writeFile(join(project,'.graphifyrc'),'language.tpl=typescript');await writeFile(join(project,'trap.py'),'raise RuntimeError("must never execute")\n');await writeFile(join(project,'package.json'),'{}');await mkdir(join(project,'hooks'));await writeFile(join(project,'hooks/post-commit.py'),'raise RuntimeError("hook must not be copied")');const invoke=req=>{const r=spawnSync(resolve('resources/graphify/assembly/runtime/python.exe'),['-I','-S','-B','-c','import sys;sys.path.insert(0,sys.argv[1]);import graph_capture;graph_capture.main()',resolve('resources/graphify'),JSON.stringify(req)],{encoding:'utf8',timeout:30000,windowsHide:true});assert.equal(r.status,0,r.stderr+r.stdout);const v=JSON.parse(r.stdout);if(v.error)throw Error(v.error);return v};const c=invoke({op:'capture',project,folder:data});assert.deepEqual(c.corpus.map(s=>s.relativePath),['a.ts','trap.py']);await assert.rejects(lstat(join(data,'mirror')),{code:'ENOENT'});const before=invoke({op:'terminal',prepared:data});assert.equal(before.sourceState,'unchanged');await writeFile(join(project,'new.ts'),'export const n=2');assert.equal(invoke({op:'terminal',prepared:data}).sourceState,'changed');const privateReceipt=JSON.parse(await readFile(join(data,'files.json'),'utf8'));await rm(join(project,'a.ts'));await writeFile(join(project,'a.ts'),'export function first(){return 1}\n');assert.throws(()=>invoke({op:'files-read',prepared:data,receiptSha:c.receiptSha,producer:'corpus',revision:c.revision,sourceId:privateReceipt.entries[0].sourceId}));}finally{await rm(owner,{recursive:true,force:true})}})


const spawnCapture=(req,resources=resolve('resources/graphify'))=>spawnSync(resolve('resources/graphify/assembly/runtime/python.exe'),['-I','-S','-B','-X','utf8','-c','import sys;sys.path.insert(0,sys.argv[1]);import graph_capture;graph_capture.main()',resources,JSON.stringify(req)],{timeout:30000,windowsHide:true})
const invokeCapture=(req,resources)=>{const r=spawnCapture(req,resources);const v=JSON.parse(r.stdout);if(v.error)throw Object.assign(Error(v.error),{exitCode:r.status});assert.equal(r.status,0,r.stderr.toString()+r.stdout.toString());return v}
test('all six admitted code text extensions read the exact originals, retaining UTF8 binary and physical refusals',async()=>{const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-text-')));try{const project=join(owner,'project'),data=join(owner,'data');await mkdir(project);await mkdir(data);const originals={};for(const ext of ['php','swift','kt','scala','vue','svelte']){const name='original.'+ext,text='// original é '+ext+'\n';originals[name]=text;await writeFile(join(project,name),text)}await writeFile(join(project,'invalid.php'),Buffer.from([255,254]));await writeFile(join(project,'binary.swift'),Buffer.from([65,0,66]));const c=invokeCapture({op:'capture',project,folder:data}),read=relative=>invokeCapture({op:'files-read',prepared:data,receiptSha:c.receiptSha,producer:'corpus',revision:c.revision,sourceId:c.sources.find(s=>s.path.replaceAll('\\','/').endsWith('/'+relative)).id});for(const [name,text] of Object.entries(originals)){const observed=read(name);assert.equal(observed.text,text);assert.equal(observed.path.replaceAll('\\','/'),join(project,name).replaceAll('\\','/'))}assert.throws(()=>read('invalid.php'),/PREVIEW_UTF8/);assert.throws(()=>read('binary.swift'),/PREVIEW_BINARY/);await rm(join(project,'original.kt'));await writeFile(join(project,'original.kt'),originals['original.kt']);assert.throws(()=>read('original.kt'),/REFERENCE_CHANGED/)}finally{await rm(owner,{recursive:true,force:true})}})
for(const folder of ['packages','resources'])test('native code inventory includes '+folder+' and terminal observes its source mutation',async()=>{const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-directory-')));try{const project=join(owner,'project'),data=join(owner,'data');await mkdir(join(project,folder),{recursive:true});await mkdir(data);await writeFile(join(project,'index.ts'),'export const entry=1\n');const original='export function nested(){return 2}\n';await writeFile(join(project,folder,'service.ts'),original);const c=invokeCapture({op:'capture',project,folder:data});assert.deepEqual(c.corpus.map(s=>s.relativePath).sort(),['index.ts',folder+'/service.ts'].sort());await assert.rejects(lstat(join(data,'mirror')),{code:'ENOENT'});assert.equal(invokeCapture({op:'terminal',prepared:data}).sourceState,'unchanged');await writeFile(join(project,folder,'service.ts'),'export function nested(){return 3}\n');assert.equal(invokeCapture({op:'terminal',prepared:data}).sourceState,'changed')}finally{await rm(owner,{recursive:true,force:true})}})

test('recognized root Graphify assembly is excluded while ordinary assembly sources remain visible',async()=>{
 const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-assembly-scope-')))
 try{
  const project=join(owner,'project'),runtime=join(project,'resources','graphify'),generated=join(runtime,'assembly')
  const data=join(owner,'data'),ordinary=join(owner,'ordinary'),resources=join(owner,'resources')
  await mkdir(join(generated,'packages'),{recursive:true})
  await mkdir(resources)
  for(const name of ['graph_capture.py','capture.py','files.py'])await writeFile(join(resources,name),await readFile(join('resources/graphify',name)))
  await mkdir(join(project,'assembly'))
  await mkdir(data);await mkdir(ordinary)
  await writeFile(join(generated,'packages','generated.py'),'value = 1')
  await writeFile(join(project,'assembly','normal.py'),'value = 2')
  const manifest=JSON.stringify({runtime:[],packages:[{name:'generated.py'}]})
  await writeFile(join(runtime,'assembly.json'),manifest)
  await writeFile(join(resources,'assembly.json'),manifest)
  const capture=invokeCapture({op:'capture',project,folder:data},resources)
  assert.deepEqual(capture.corpus.map(source=>source.relativePath),['assembly/normal.py'])
  assert.ok(capture.excluded.includes('resources/graphify/assembly'))
  await writeFile(join(generated,'packages','generated.py'),'value = 3')
  assert.equal(invokeCapture({op:'terminal',prepared:data},resources).sourceState,'unchanged')
  await writeFile(join(generated,'ordinary.py'),'extra = True')
  assert.equal(invokeCapture({op:'terminal',prepared:data},resources).sourceState,'changed')
  assert.ok(invokeCapture({op:'capture',project,folder:ordinary},resources).corpus.some(source=>source.relativePath==='resources/graphify/assembly/ordinary.py'))
 }finally{await rm(owner,{recursive:true,force:true})}
})


test('native revalidation preserves the corpus and original-file authority without a code mirror',async()=>{
 const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-revalidate-')))
 try{
  const project=join(owner,'project'),generated=join(owner,'generated'),checked=join(owner,'checked')
  for(const folder of [project,generated,checked])await mkdir(folder)
  const source=join(project,'index.ts'),original='export const entry=1\n'
  await writeFile(source,original)
  const capture=invokeCapture({op:'capture',project,folder:generated})
  const revalidated=invokeCapture({op:'revalidate',project,folder:checked})
  assert.equal(revalidated.revision,capture.revision)
  assert.equal(revalidated.rootIdentity,capture.rootIdentity)
  assert.deepEqual(revalidated.corpus,capture.corpus)
  assert.deepEqual(revalidated.sources,capture.sources)
  await assert.rejects(lstat(join(generated,'mirror')),{code:'ENOENT'})
  await assert.rejects(lstat(join(checked,'mirror')),{code:'ENOENT'})
  const read=()=>invokeCapture({op:'files-read',prepared:checked,receiptSha:revalidated.receiptSha,producer:'corpus',revision:revalidated.revision,sourceId:revalidated.sources[0].id})
  assert.equal(read().text,original)
  await writeFile(source,'export const entry=2\n')
  assert.throws(read,/REFERENCE_CHANGED/)
  await rm(source)
  assert.throws(()=>invokeCapture({op:'revalidate',project,folder:checked}),{message:'NO_CODE_SOURCES',exitCode:2})
 }finally{await rm(owner,{recursive:true,force:true})}
})

test('mirror-input frames exact source bytes and refuses mismatched grants or changed originals',async()=>{
 const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-mirror-input-')))
 try{
  const project=join(owner,'project'),prepared=join(owner,'prepared')
  await mkdir(join(project,'sources'),{recursive:true});await mkdir(prepared)
  const entries=[['a.ts',Buffer.alloc(0)],['sources/é.ts',Buffer.from([255,0,13,10,128,65])]]
  for(const [name,body] of entries)await writeFile(join(project,name),body)
  const capture=invokeCapture({op:'capture',project,folder:prepared})
  const {receiptSha,rootIdentity,revision}=capture
  const request={op:'mirror-input',prepared,receiptSha,rootIdentity,revision}
  const frame=[Buffer.from('MADMSRC1\x02\0\0\0','ascii')]
  for(const [name,body] of entries){
   const path=Buffer.from(name,'utf8')
   const header=Buffer.alloc(8);header.writeUInt32LE(path.length);header.writeUInt32LE(body.length,4)
   frame.push(header,path,body)
  }
  const run=req=>spawnCapture(req)
  const result=run(request)
  assert.equal(result.status,0,result.stderr.toString())
  assert.deepEqual(result.stdout,Buffer.concat(frame))
  await assert.rejects(lstat(join(prepared,'mirror')),{code:'ENOENT'})
  const receipt=await readFile(join(prepared,'files.json'))
  const refuse=(req,code)=>{
   const failure=run(req)
   assert.equal(failure.status,1)
   assert.equal(failure.stdout.length,0)
   assert.match(failure.stderr.toString(),code)
  }
  refuse({...request,receiptSha:'0'.repeat(64)},/RECEIPT_CHANGED/)
  refuse({...request,rootIdentity:'0'.repeat(64)},/GRANT_CHANGED/)
  refuse({...request,revision:'0'.repeat(64)},/GRANT_CHANGED/)
  await writeFile(join(project,'sources','é.ts'),Buffer.from([7]))
  refuse(request,/REFERENCE_CHANGED/)
  assert.deepEqual(await readFile(join(prepared,'files.json')),receipt)
  await assert.rejects(lstat(join(prepared,'mirror')),{code:'ENOENT'})
 }finally{await rm(owner,{recursive:true,force:true})}
})

test('Windows supervision returns a byte array by reference without writing stdout',async()=>{
 const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-binary-capture-')))
 try{
  const quote=value=>"'"+value.replaceAll("'","''")+"'"
  const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
  const script=[
   "$ErrorActionPreference='Stop'",
   '. '+quote(resolve('resources/graphify/preflight.ps1')),
   '. '+quote(resolve('resources/graphify/supervision.ps1')),
   '$owner='+quote(owner),
   '$start=[Diagnostics.ProcessStartInfo]::new()',
   '$start.FileName='+quote(resolve('resources/graphify/assembly/runtime/python.exe')),
   "foreach($arg in @('-I','-S','-B','-c','import sys;sys.stdout.buffer.write(bytes(range(256))*20480);sys.stderr.write(\"diagnostic\")')){$start.ArgumentList.Add($arg)}",
   '$state=$null',
   '$payload=$null',
   "$result=Invoke-BmadSupervised $start 30000 (Join-Path $owner 'state.json') @() $owner (Join-Path $owner 'stdout.bin') (Join-Path $owner 'stderr.log') '' ([ref]$state) -BinaryOutput ([ref]$payload)",
   "if($payload -isnot [byte[]] -or $result.outcome -ne 'completed' -or $result.exit -ne 0 -or $result.job_active_after_stop -ne 0){throw 'BINARY_SUPERVISION_FAILED'}",
   '[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($payload))',
  ].join('\n')
  const output=spawnSync(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{encoding:'utf8',timeout:45000,windowsHide:true})
  assert.equal(output.status,0,output.stderr)
  const block=Buffer.from(Array.from({length:256},(_,i)=>i))
  assert.equal(output.stdout.trim(),createHash('sha256').update(Buffer.concat(Array(20480).fill(block))).digest('hex').toUpperCase())
  assert.equal(await readFile(join(owner,'stderr.log'),'utf8'),'diagnostic')
  await assert.rejects(lstat(join(owner,'stdout.bin')),{code:'ENOENT'})
 }finally{await rm(owner,{recursive:true,force:true})}
})
