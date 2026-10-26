import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp,mkdir,copyFile,writeFile,readFile,rm,symlink,link } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join,dirname,resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { FORGE_MANIFEST } from '../src/adapters/bmad/forge-manifest.ts'
import { qualifyForge,ForgeHost,forgePath } from '../src/adapters/bmad/forge.ts'
const digest=v=>createHash('sha256').update(v).digest('hex')
async function fixture(t){
  const root=await mkdtemp(join(tmpdir(),'madness-forge-test-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
  for(const path of Object.keys(FORGE_MANIFEST)){await mkdir(dirname(join(root,path)),{recursive:true});await copyFile(resolve(path),join(root,path))}
  await writeFile(join(root,'_bmad/config.toml'),'[core]\noutput_folder = "{project-root}/_bmad-output"\nactive_initiative = "initiative-test"\n')
  return root
}
test('Forge réel : resolvers et personas isolés, journal natif, sorties intégrales relues et fin HARDENED',async t=>{
  const root=await fixture(t),marker=join(root,'INJECTED')
  for(const folder of ['','_bmad/scripts','.agents/skills/bmad-forge-idea/scripts'])for(const name of ['json.py','argparse.py','sitecustomize.py'])await writeFile(join(root,folder,name),`open(${JSON.stringify(marker)},'w').write('poison')\nraise Exception('poison')`)
  const signal=new AbortController().signal,profile=await qualifyForge(root,signal)
  assert.equal(profile.kind,'forge');assert.equal(profile.forge.initiativeId,'initiative-test')
  await assert.rejects(readFile(marker),{code:'ENOENT'})
  const host=new ForgeHost(profile,signal),observations=[];host.bind(async(...args)=>observations.push(args))
  await host.execute({kind:'personas'},'roster','turn-1')
  await host.execute({kind:'init',slug:'outil-simple',idea:'Une idée test',goal:'Tester les risques'},'init','turn-1')
  const workspace=join(profile.forge.outputBase,'forge-outil-simple')
  assert.match(await readFile(join(workspace,'.memlog.md'),'utf8'),/idea: Une idée test/)
  await host.execute({kind:'append',type:'lock',text:'Décision explicite du témoin.'},'append','turn-2')
  for(const text of ['<html><style>body{}</style><svg/><script>alert(1)</script></html>','<html><style>@import "https://example.invalid";</style><svg></svg></html>'])await assert.rejects(host.execute({kind:'write',name:'forge-report.html',text},'unsafe-html','turn-3'),{code:'OUTPUT_REFUSED'})
  const html='<!doctype html><html lang="fr"><style>body{color:#211f1e}</style><body><svg viewBox="0 0 10 10"><circle r="4"/></svg><h1>HARDENED</h1><p>Rapport synthétique complet.</p></body></html>'
  await host.execute({kind:'write',name:'forge-report.html',text:html},'html','turn-3')
  await assert.rejects(host.execute({kind:'finish',outcome:'HARDENED'},'too-soon','turn-3'),{code:'ENOENT'})
  await host.execute({kind:'write',name:'idea',text:'- Décision maintenue : portée bornée.\n'},'md','turn-3')
  await host.execute({kind:'finish',outcome:'HARDENED'},'finish','turn-3')
  assert.equal(await readFile(join(workspace,'forge-report.html'),'utf8'),html)
  assert.match(await readFile(join(workspace,'.memlog.md'),'utf8'),/status: complete/)
  const receipt=observations.find(([o])=>o.id==='html'&&o.phase==='observed')[0]
  assert.equal(receipt.sha256,digest(html));assert.equal(receipt.bytes,Buffer.byteLength(html))
  assert.equal(observations.at(-1)[2],'HARDENED')
  await assert.rejects(host.execute({kind:'append',type:'note',text:'replay'},'late','turn-4'),{code:'OUTPUT_REFUSED'})
  await assert.rejects(readFile(marker),{code:'ENOENT'})
})
test('profil Forge refuse dépendance modifiée, hooks, sortie hors projet et reprise avant invocation',async t=>{
  const root=await fixture(t),signal=new AbortController().signal
  const script=join(root,'_bmad/scripts/knowledge.py'),original=await readFile(script)
  await writeFile(script,'raise Exception("changed")')
  await assert.rejects(qualifyForge(root,signal),{code:'PROFILE_CHANGED'});await writeFile(script,original)
  await mkdir(join(root,'_bmad/custom'));const override=join(root,'_bmad/custom/bmad-forge-idea.toml')
  await writeFile(override,'[workflow]\non_complete = ["shell arbitrary"]\n')
  await assert.rejects(qualifyForge(root,signal),{code:'PROFILE_UNRECOGNIZED'});await rm(override)
  const config=join(root,'_bmad/config.toml'),base=await readFile(config)
  await writeFile(config,'[core]\noutput_folder = "../outside"\n')
  await assert.rejects(qualifyForge(root,signal),{code:'OUTPUT_REFUSED'});await writeFile(config,base)
  await mkdir(join(root,'_bmad-output/initiative-test/forge-paused'),{recursive:true})
  await writeFile(join(root,'_bmad-output/initiative-test/forge-paused/.memlog.md'),'---\nidea: Inachevée\n---\n')
  await assert.rejects(qualifyForge(root,signal),{code:'RESUME_UNSUPPORTED'})
})
test('sorties bornées : traversée, liens, collision, modification externe et stockage refusé',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal)
  await assert.rejects(forgePath(root,join(root,'../outside'),true),{code:'OUTPUT_REFUSED'})
  const external=await mkdtemp(join(tmpdir(),'madness-forge-external-'));t.after(()=>rm(external,{recursive:true,force:true}))
  await symlink(external,join(root,'linked'),'junction');await assert.rejects(forgePath(root,join(root,'linked/data'),true),{code:'OUTPUT_REFUSED'})
  const host=new ForgeHost(profile,signal);host.bind(async()=>{})
  await assert.rejects(host.execute({kind:'init',slug:'../escape',idea:'x',goal:'y'},'bad','turn'),{code:'OUTPUT_REFUSED'})
  await host.execute({kind:'init',slug:'collision',idea:'x',goal:'y'},'init','turn')
  const workspace=join(profile.forge.outputBase,'forge-collision'),html=join(workspace,'forge-report.html')
  await writeFile(html,'extérieur')
  await assert.rejects(host.execute({kind:'write',name:'forge-report.html',text:'nouveau'},'write','turn'),{code:'OUTPUT_CONFLICT'})
  assert.equal(await readFile(html,'utf8'),'extérieur')
  await writeFile(join(workspace,'.memlog.md'),'modification externe')
  await assert.rejects(host.execute({kind:'append',type:'note',text:'écraser'},'append','turn'),{code:'OUTPUT_CONFLICT'})
  const denied=new ForgeHost(profile,signal);denied.bind(async()=>{throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'})})
  await assert.rejects(denied.execute({kind:'init',slug:'disk-denied',idea:'x',goal:'y'},'init','turn'),{code:'STORAGE_WRITE_FAILED'})
  await assert.rejects(readFile(join(profile.forge.outputBase,'forge-disk-denied/.memlog.md')),{code:'ENOENT'})
  const hardlinked=join(root,'hardlink');await link(html,hardlinked)
  await assert.rejects(host.read(hardlinked),{code:'UNSUPPORTED_INTERACTION'})
})
test('échec de sauvegarde après effet reste inconnu et ne permet aucun replay',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal)
  const events=[];host.bind(async o=>{events.push(o);if(o.phase==='observed')throw Error('disk')})
  await assert.rejects(host.execute({kind:'init',slug:'uncertain',idea:'x',goal:'y'},'init','turn'),{code:'EFFECT_UNKNOWN'})
  assert.equal(events.at(-1).phase,'unknown')
  assert.match(await readFile(join(profile.forge.outputBase,'forge-uncertain/.memlog.md'),'utf8'),/idea: x/)
  await assert.rejects(host.execute({kind:'append',type:'note',text:'ne pas rejouer'},'next','turn'),{code:'EFFECT_UNKNOWN'})
})
