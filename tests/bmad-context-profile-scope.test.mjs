import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,copyFile,writeFile,readFile,rename,rm,realpath,readdir} from 'node:fs/promises'
import {realpath as nativeRealpath} from 'node:fs'
import {promisify} from 'node:util'
import {join,dirname,resolve,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {FORGE_MANIFEST} from '../src/adapters/bmad/forge-manifest.ts'
import {qualifyForge,ForgeHost} from '../src/adapters/bmad/forge.ts'
import {BmadHelpAdapter} from '../src/adapters/bmad/help.ts'
import {HelpOwnedRun} from '../src/adapters/bmad/help-owned-run.ts'
import {BmadContextAdapter} from '../src/adapters/bmad/context.ts'
import {BmadContextCoordinator} from '../src/core/bmad-context.ts'
test('portée configuration réelle : Forge sans initiative peut init append write finish, config et périmètre restent gardés',async()=>{
 const root=await promisify(nativeRealpath.native)(await mkdtemp(join(tmpdir(),'mctx-scope-'))),project=join(root,'project'),signal=new AbortController().signal
 let helper
 try{
  for(const path of Object.keys(FORGE_MANIFEST)){await mkdir(dirname(join(project,path)),{recursive:true});await copyFile(resolve(path),join(project,path))}
  const config=join(project,'_bmad/config.toml'),bytes=Buffer.from('[core]\noutput_folder = "{project-root}/_bmad-output"\n')
  await writeFile(config,bytes)
  const owner=new HelpOwnedRun(join(root,'owner.json'))
  helper=new BmadHelpAdapter({root:join(root,'runs'),resources:resolve('resources/bmad-help'),owner,roots:p=>[join(p,'.agents/skills')]})
  const adapter=new BmadContextAdapter(helper),contexts=new BmadContextCoordinator({application:{dialogueProject:async id=>({id,rootPath:project})},store:{read:async()=>null,write:async()=>{}},observe:(...a)=>adapter.observe(...a),observeConfiguration:(...a)=>adapter.observeConfiguration(...a)})
  const captured=await contexts.capture('project-a',false,signal)
  assert.equal(captured.scope,'configuration');assert.equal(captured.initiativeId,null)
  const profile=await qualifyForge(project,signal),host=new ForgeHost(profile,signal,undefined,()=>contexts.assertFresh(captured,signal)),observations=[]
  host.bind(async(o,workspace,outcome)=>observations.push({o,workspace,outcome}))
  for(const kind of ['workflow','config','check-sessions','personas'])await host.execute({kind},kind,'turn-1')
  await host.execute({kind:'init',slug:'independent',idea:'Idée synthétique',goal:'Prouver la portée locale'},'init','turn-1')
  await host.execute({kind:'append',type:'note',text:'Note exacte après création.'},'append','turn-2')
  const html='<!doctype html><html lang="fr"><style>body{color:#211f1e}</style><body><svg viewBox="0 0 10 10"><circle r="4"/></svg><h1>CLARIFIED</h1><p>Rapport synthétique complet.</p></body></html>'
  await host.execute({kind:'write',name:'forge-report.html',text:html},'html','turn-3')
  await host.execute({kind:'finish',outcome:'CLARIFIED'},'finish','turn-3')
  const workspace=join(profile.forge.outputBase,'forge-independent')
  assert.equal(await readFile(join(workspace,'forge-report.html'),'utf8'),html)
  assert.match(await readFile(join(workspace,'.memlog.md'),'utf8'),/Note exacte après création/)
  assert.match(await readFile(join(workspace,'.memlog.md'),'utf8'),/status: complete/)
  assert.equal(observations.at(-1).outcome,'CLARIFIED')
  await contexts.assertFresh(captured,signal)
  await writeFile(config,'[core]\noutput_folder = "{project-root}/other-output"\n')
  await assert.rejects(contexts.assertFresh(captured,signal),{code:'PROFILE_CHANGED'})
  await writeFile(config,bytes);await rename(config,config+'.old');await writeFile(config,bytes)
  await assert.rejects(contexts.assertFresh(captured,signal),{code:'PROFILE_CHANGED'})
  assert.deepEqual(await readFile(config),bytes)
  assert.equal(await owner.status(),'stopped');await contexts.shutdown()
  console.log(JSON.stringify({profileScope:{operations:['init','append','write','finish'],closed:'stopped',configChangedRefused:true,sameBytesReplacementRefused:true}}))
 }finally{
  if(helper){assert.equal(await helper.shutdown(),'stopped','Retain fixture without owned stop proof');const receipts=[];for(const name of await readdir(join(root,'runs'))){if(!name.startsWith('operation-'))continue;const execution=JSON.parse(await readFile(join(root,'runs',name,'execution.json'),'utf8'));assert.equal(execution.outcome,'completed');assert.equal(execution.job_active_after_stop,0);receipts.push({operation:name,execution})}const proof=resolve('_bmad-output/initiative-madness/.working/context-review-loop1-profile-scope-final');await mkdir(proof,{recursive:true});await writeFile(join(proof,'receipts.json'),JSON.stringify({root,closed:'stopped',receipts},null,2)+'\n')}
  const actual=await realpath(root);assert.equal(dirname(actual),await realpath(tmpdir()));assert.match(basename(actual),/^mctx-scope-[A-Za-z0-9]+$/)
  await rm(actual,{recursive:true,force:true})
 }
})
