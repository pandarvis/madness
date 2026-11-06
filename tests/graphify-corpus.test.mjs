import {realpathSync} from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
test('native corpus includes untracked code only, refuses replaced grants and observes additions',async()=>{const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-corpus-')));try{const project=join(owner,'project'),data=join(owner,'data');await mkdir(project);await mkdir(data);await writeFile(join(project,'a.ts'),'export function first(){return 1}\n');await writeFile(join(project,'.graphifyrc'),'language.tpl=typescript');await writeFile(join(project,'trap.py'),'raise RuntimeError("must never execute")\n');await writeFile(join(project,'package.json'),'{}');await mkdir(join(project,'hooks'));await writeFile(join(project,'hooks/post-commit.py'),'raise RuntimeError("hook must not be copied")');const invoke=req=>{const r=spawnSync(resolve('resources/graphify/assembly/runtime/python.exe'),['-I','-S','-B','-c','import sys;sys.path.insert(0,sys.argv[1]);import graph_capture;graph_capture.main()',resolve('resources/graphify'),JSON.stringify(req)],{encoding:'utf8',timeout:30000,windowsHide:true});assert.equal(r.status,0,r.stderr+r.stdout);const v=JSON.parse(r.stdout);if(v.error)throw Error(v.error);return v};const c=invoke({op:'capture',project,folder:data});assert.deepEqual(c.corpus.map(s=>s.relativePath),['a.ts','trap.py']);assert.equal((await readFile(join(data,'mirror/a.ts'),'utf8')),'export function first(){return 1}\n');await assert.rejects(readFile(join(data,'mirror/package.json')));const before=invoke({op:'terminal',prepared:data});assert.equal(before.sourceState,'unchanged');await writeFile(join(project,'new.ts'),'export const n=2');assert.equal(invoke({op:'terminal',prepared:data}).sourceState,'changed');const privateReceipt=JSON.parse(await readFile(join(data,'files.json'),'utf8'));await rm(join(project,'a.ts'));await writeFile(join(project,'a.ts'),'export function first(){return 1}\n');assert.throws(()=>invoke({op:'files-read',prepared:data,receiptSha:c.receiptSha,producer:'corpus',revision:c.revision,sourceId:privateReceipt.entries[0].sourceId}));}finally{await rm(owner,{recursive:true,force:true})}})


const invokeCapture=(req,resources=resolve('resources/graphify'))=>{const r=spawnSync(resolve('resources/graphify/assembly/runtime/python.exe'),['-I','-S','-B','-X','utf8','-c','import sys;sys.path.insert(0,sys.argv[1]);import graph_capture;graph_capture.main()',resources,JSON.stringify(req)],{encoding:'utf8',timeout:30000,windowsHide:true});const v=JSON.parse(r.stdout);if(v.error)throw Error(v.error);assert.equal(r.status,0,r.stderr+r.stdout);return v}
test('all six admitted code text extensions read the exact originals, retaining UTF8 binary and physical refusals',async()=>{const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-text-')));try{const project=join(owner,'project'),data=join(owner,'data');await mkdir(project);await mkdir(data);const originals={};for(const ext of ['php','swift','kt','scala','vue','svelte']){const name='original.'+ext,text='// original é '+ext+'\n';originals[name]=text;await writeFile(join(project,name),text)}await writeFile(join(project,'invalid.php'),Buffer.from([255,254]));await writeFile(join(project,'binary.swift'),Buffer.from([65,0,66]));const c=invokeCapture({op:'capture',project,folder:data}),read=relative=>invokeCapture({op:'files-read',prepared:data,receiptSha:c.receiptSha,producer:'corpus',revision:c.revision,sourceId:c.sources.find(s=>s.path.replaceAll('\\','/').endsWith('/'+relative)).id});for(const [name,text] of Object.entries(originals)){const observed=read(name);assert.equal(observed.text,text);assert.equal(observed.path.replaceAll('\\','/'),join(project,name).replaceAll('\\','/'))}assert.throws(()=>read('invalid.php'),/PREVIEW_UTF8/);assert.throws(()=>read('binary.swift'),/PREVIEW_BINARY/);await rm(join(project,'original.kt'));await writeFile(join(project,'original.kt'),originals['original.kt']);assert.throws(()=>read('original.kt'),/REFERENCE_CHANGED/)}finally{await rm(owner,{recursive:true,force:true})}})
for(const folder of ['packages','resources'])test('native code inventory and mirror include '+folder+' and terminal observes its source mutation',async()=>{const owner=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-directory-')));try{const project=join(owner,'project'),data=join(owner,'data');await mkdir(join(project,folder),{recursive:true});await mkdir(data);await writeFile(join(project,'index.ts'),'export const entry=1\n');const original='export function nested(){return 2}\n';await writeFile(join(project,folder,'service.ts'),original);const c=invokeCapture({op:'capture',project,folder:data});assert.deepEqual(c.corpus.map(s=>s.relativePath).sort(),['index.ts',folder+'/service.ts'].sort());assert.equal(await readFile(join(data,'mirror',folder,'service.ts'),'utf8'),original);assert.equal(invokeCapture({op:'terminal',prepared:data}).sourceState,'unchanged');await writeFile(join(project,folder,'service.ts'),'export function nested(){return 3}\n');assert.equal(invokeCapture({op:'terminal',prepared:data}).sourceState,'changed')}finally{await rm(owner,{recursive:true,force:true})}})

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
