import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm,link,rename,realpath} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {BmadHelpAdapter} from '../src/adapters/bmad/help.ts'
import {HelpOwnedRun} from '../src/adapters/bmad/help-owned-run.ts'
import {BmadContextAdapter} from '../src/adapters/bmad/context.ts'
import {BmadContextStore} from '../src/adapters/persistence/bmad-context-store.ts'
import {BmadContextCoordinator} from '../src/core/bmad-context.ts'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
const command=(type,fields={})=>({contractVersion:1,correlationId:'native-context-test',type,...fields})
test('real closed Windows helper: two projects, passive restoration, bounded refusals and unchanged configuration/history',async()=>{
 const folder=await realpath(await mkdtemp(join(tmpdir(),'mctx-'))),owner=new HelpOwnedRun(join(folder,'owner.json'))
 let helper
 try{
  const roots=new Map()
  for(const id of ['project-a','project-b']){
   const project=join(folder,id),skills=join(project,'.agents/skills')
   roots.set(id,project);await mkdir(join(skills,'bmod-test'),{recursive:true});await mkdir(join(project,'_bmad'),{recursive:true})
   await writeFile(join(skills,'bmod-test/bmod.toml'),'[bmod]\ncode="test"\nversion="6.13.0-next"\nskills=[]\n')
   await writeFile(join(project,'_bmad/config.toml'),'[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="alpha"\n')
   await writeFile(join(project,'_bmad/config_utils.py'),'raise RuntimeError("PROJECT CODE MUST NEVER RUN")')
   for(const name of ['alpha','beta']){await mkdir(join(project,'_bmad-output',name),{recursive:true});await writeFile(join(project,'_bmad-output',name,name+'.md'),'# '+name+'\n')}
   await writeFile(join(project,'history.json'),'{"initiativeId":null,"messages":["historique exact"]}\n')
  }
  helper=new BmadHelpAdapter({root:join(folder,'runs'),resources:resolve('resources/bmad-help'),owner,roots:project=>[join(project,'.agents/skills')]})
  const adapter=new BmadContextAdapter(helper),store=()=>new BmadContextStore(join(folder,'bmad-context-v1')),deps={application:{dialogueProject:async id=>({id,rootPath:roots.get(id)})},observe:async(...args)=>{try{return await adapter.observe(...args)}catch(e){console.error('native context refusal',e.code,e.detail);throw e}}}
  const before=await Promise.all([...roots.values()].flatMap(p=>['_bmad/config.toml','history.json'].map(async f=>[join(p,f),await readFile(join(p,f))])))
  const c=new BmadContextCoordinator({...deps,store:store()})
  for(const [id,name] of [['project-a','alpha'],['project-b','beta']]){
   await c.execute(command('observe',{projectId:id}))
   const p=c.read().projects.find(p=>p.projectId===id)
   assert.equal(p.status,'ready',JSON.stringify(p))
   assert.equal(p.observation.activeInitiative,'alpha');assert.equal(p.selection,null);assert.deepEqual(p.observation.initiatives.map(i=>i.name),['alpha','beta'])
   await c.execute(command('choose',{projectId:id,initiativeId:name,revision:p.observation.revision}))
   assert.equal(c.read().projects.find(p=>p.projectId===id).storage,'stored')
  }
  await c.shutdown();assert.equal(await owner.status(),'stopped')
  const reopened=new BmadContextCoordinator({...deps,store:store()})
  for(const [id,name] of [['project-a','alpha'],['project-b','beta']]){
   await reopened.execute(command('observe',{projectId:id}))
   assert.equal(reopened.read().projects.find(p=>p.projectId===id).selection.initiativeId,name)
  }
  for(const [path,bytes] of before)assert.deepEqual(await readFile(path),bytes)
  const project=roots.get('project-a'),signal=new AbortController().signal
  const first=await adapter.observe('project-a',project,signal)
  await mkdir(join(project,'_bmad-output/gamma'));await writeFile(join(project,'_bmad-output/gamma/gamma.md'),'# gamma\n')
  const changed=await adapter.observe('project-a',project,signal);assert.notEqual(changed.revision,first.revision);assert.equal(changed.initiatives.length,3)
  const config=join(project,'_bmad/config.toml')
  await writeFile(config,'[core]\noutput_folder="../outside"\n')
  assert.equal((await adapter.observe('project-a',project,signal)).status,'incompatible')
  await writeFile(config,'[core]\noutput_folder="{project-root}/_bmad-output:stream"\n')
  assert.equal((await adapter.observe('project-a',project,signal)).status,'incompatible')
  await writeFile(config,before.find(([p])=>p===config)[1])
  const alpha=join(project,'_bmad-output/alpha/alpha.md')
  await writeFile(alpha,Buffer.from([255,254]));await assert.rejects(adapter.observe('project-a',project,signal))
  await writeFile(alpha,'# alpha\n');const outside=join(folder,'outside.md');await writeFile(outside,'outside sentinel')
  await rm(alpha);await link(outside,alpha);await assert.rejects(adapter.observe('project-a',project,signal));assert.equal(await readFile(outside,'utf8'),'outside sentinel');await rm(alpha);await writeFile(alpha,'# alpha\n')
  const junction=join(project,'_bmad-output/junction')
  await promisify(execFile)('cmd.exe',['/c','mklink','/J',junction,join(project,'_bmad')],{windowsHide:true})
  await assert.rejects(adapter.observe('project-a',project,signal));await rm(junction)
  await writeFile(alpha,Buffer.alloc(1048577,65));await assert.rejects(adapter.observe('project-a',project,signal));await writeFile(alpha,'# alpha\n')
  await rename(join(project,'_bmad-output/alpha'),join(project,'_bmad-output/old-alpha'))
  await mkdir(join(project,'_bmad-output/alpha'));await writeFile(alpha,'# alpha\n')
  assert.notEqual((await adapter.observe('project-a',project,signal)).revision,changed.revision)
  await reopened.shutdown()
  for(const [path,bytes] of before)assert.deepEqual(await readFile(path),bytes)
 }finally{
  const stopped=helper?await helper.shutdown():await owner.status()
  assert.equal(stopped,'stopped','Only closed, owned fixtures may be removed')
  console.log(JSON.stringify({nativeContext:{root:folder,closed:stopped,network:false,provider:false,symlinkFile:'not exercised: existing Windows privilege limit'}}))
  await rm(folder,{recursive:true,force:true})
 }
})
