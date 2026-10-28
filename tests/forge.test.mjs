import assert from 'node:assert/strict'
import { test,mock } from 'node:test'
import {createRequire,syncBuiltinESMExports} from 'node:module'
import { mkdtemp,mkdir,copyFile,writeFile,readFile,rm,symlink,link,readdir,rename,unlink } from 'node:fs/promises'
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
async function activate(host,check=true){
  await host.execute({kind:'workflow'},'workflow','turn-1')
  await host.execute({kind:'config'},'config','turn-1')
  if(check)return host.execute({kind:'check-sessions'},'sessions','turn-1')
}
test('Forge réel : resolvers et personas isolés, journal natif, sorties intégrales relues et fin HARDENED',async t=>{
  const root=await fixture(t),marker=join(root,'INJECTED')
  for(const folder of ['','_bmad/scripts','.agents/skills/bmad-forge-idea/scripts'])for(const name of ['json.py','argparse.py','sitecustomize.py'])await writeFile(join(root,folder,name),`open(${JSON.stringify(marker)},'w').write('poison')\nraise Exception('poison')`)
  const signal=new AbortController().signal,profile=await qualifyForge(root,signal)
  assert.equal(profile.kind,'forge');assert.equal(profile.forge.initiativeId,'initiative-test')
  await assert.rejects(readFile(marker),{code:'ENOENT'})
  const host=new ForgeHost(profile,signal),observations=[];host.bind(async(...args)=>observations.push(args))
  await activate(host)
  await host.execute({kind:'personas'},'roster','turn-1')
  await host.execute({kind:'init',slug:'outil-simple',idea:'Une idée test\n'+'é'.repeat(9000),goal:'é'.repeat(9000)},'init','turn-1')
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
  const next=new ForgeHost(await qualifyForge(root,signal),signal);next.bind(async()=>{})
  const nextSessions=JSON.parse(await activate(next)).locations.at(-1).sessions
  assert.equal(nextSessions.length,1);assert.ok(nextSessions[0].bytes>32768)
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
  await activate(host)
  await assert.rejects(host.execute({kind:'init',slug:'../escape',idea:'x',goal:'y'},'bad','turn'),{code:'OUTPUT_REFUSED'})
  await host.execute({kind:'init',slug:'collision',idea:'x',goal:'y'},'init','turn')
  const workspace=join(profile.forge.outputBase,'forge-collision'),html=join(workspace,'forge-report.html')
  await writeFile(html,'extérieur')
  await assert.rejects(host.execute({kind:'write',name:'forge-report.html',text:'nouveau'},'write','turn'),{code:'OUTPUT_CONFLICT'})
  assert.equal(await readFile(html,'utf8'),'extérieur')
  await writeFile(join(workspace,'.memlog.md'),'modification externe')
  await assert.rejects(host.execute({kind:'append',type:'note',text:'écraser'},'append','turn'),{code:'OUTPUT_CONFLICT'})
  const denied=new ForgeHost(profile,signal);denied.bind(async()=>{})
  // Le témoin de collision est inachevé : le retirer avant cette autre activation indépendante.
  await rm(workspace,{recursive:true,force:true});await activate(denied)
  denied.bind(async()=>{throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'})})
  await assert.rejects(denied.execute({kind:'init',slug:'disk-denied',idea:'x',goal:'y'},'init','turn'),{code:'STORAGE_WRITE_FAILED'})
  await assert.rejects(readFile(join(profile.forge.outputBase,'forge-disk-denied/.memlog.md')),{code:'ENOENT'})
  const target=join(root,'hardlink-target');await writeFile(target,'extérieur');const hardlinked=join(root,'hardlink');await link(target,hardlinked)
  await assert.rejects(host.read(hardlinked),{code:'UNSUPPORTED_INTERACTION'})
})
test('échec de sauvegarde après effet reste inconnu et ne permet aucun replay',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal)
  host.bind(async()=>{});await activate(host)
  const events=[];host.bind(async o=>{events.push(o);if(o.phase==='observed')throw Error('disk')})
  await assert.rejects(host.execute({kind:'init',slug:'uncertain',idea:'x',goal:'y'},'init','turn'),{code:'EFFECT_UNKNOWN'})
  assert.equal(events.at(-1).phase,'unknown')
  assert.match(await readFile(join(profile.forge.outputBase,'forge-uncertain/.memlog.md'),'utf8'),/idea: x/)
  await assert.rejects(host.execute({kind:'append',type:'note',text:'ne pas rejouer'},'next','turn'),{code:'EFFECT_UNKNOWN'})
})
test('recherche native : sorties absentes, vides et complètes ; reçu exact sans corps ni effet',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal),observations=[]
  host.bind(async o=>observations.push(o));const absent=JSON.parse(await activate(host))
  assert.equal(absent.observed,true);assert.equal(absent.locations.length,2);assert.equal(absent.locations.every(p=>!p.exists&&p.sessions.length===0),true)
  await assert.rejects(readdir(join(root,'_bmad-output')),{code:'ENOENT'})
  await mkdir(profile.forge.outputBase,{recursive:true})
  assert.equal(JSON.parse(await host.execute({kind:'check-sessions'},'empty','turn-1')).locations.every(p=>p.exists&&p.sessions.length===0),true)
  const headers=['---\nidea: Valeur --- conservée\nstatus: complete\n---\n','---\r\nstatus: complete\r\n---\r\n']
  for(const [index,base] of [join(root,'_bmad-output'),profile.forge.outputBase].entries()){
    const folder=join(base,index===0?'FORGE-complete':'forge-complete');await mkdir(folder)
    await writeFile(join(folder,'.memlog.md'),Buffer.concat([Buffer.from(headers[index]),Buffer.from([0xc0,0x80])]))
  }
  const output=await host.execute({kind:'check-sessions'},'complete','turn-2'),result=JSON.parse(output)
  assert.equal(result.locations.every(p=>p.sessions.length===1),true)
  assert.deepEqual(result.locations.map(p=>p.sessions[0].sha256),headers.map(digest))
  assert.deepEqual(result.locations.map(p=>p.sessions[0].bytes),headers.map(v=>Buffer.byteLength(v)))
  const receipt=observations.at(-1)
  assert.deepEqual({...receipt,at:'dated'},{id:'complete',turnId:'turn-2',operation:'check-sessions',phase:'observed',at:'dated',path:null,sha256:digest(output),bytes:Buffer.byteLength(output)})
  assert.equal(observations.some(o=>o.path!==null),false)
  await assert.rejects(host.read(result.locations[0].sessions[0].path),{code:'UNSUPPORTED_INTERACTION'})
})
for(const location of ['general','initiative'])test('fraîcheur : session inachevée '+location+' apparue après qualification ou contrôle bloque init',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal),observations=[]
  host.bind(async o=>observations.push(o));await activate(host)
  const base=location==='general'?join(root,'_bmad-output'):profile.forge.outputBase,folder=join(base,location==='general'?'Forge-paused':'forge-paused'),content='---\nidea: Inachevée\n---\n'
  await mkdir(folder,{recursive:true});await writeFile(join(folder,'.memlog.md'),content)
  await assert.rejects(host.execute({kind:'init',slug:'fresh',idea:'x',goal:'y'},'new','turn-2'),{code:'RESUME_UNSUPPORTED'})
  await assert.rejects(readFile(join(profile.forge.outputBase,'forge-fresh/.memlog.md')),{code:'ENOENT'})
  assert.equal(observations.some(o=>o.id==='new'&&o.phase==='observed'),false)
  const other=new ForgeHost(profile,signal);other.bind(async o=>observations.push(o));await activate(other,false)
  await assert.rejects(other.execute({kind:'check-sessions'},'stale','turn-2'),{code:'RESUME_UNSUPPORTED'})
  assert.equal(observations.some(o=>o.id==='stale'),false);assert.equal(await readFile(join(folder,'.memlog.md'),'utf8'),content)
})
test('frontières : refus fermés des journaux absents, invalides, trop grands, liens et hardlinks',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal),observations=[]
  host.bind(async o=>observations.push(o));await activate(host,false)
  const folder=join(profile.forge.outputBase,'forge-hostile'),path=join(folder,'.memlog.md');await mkdir(folder,{recursive:true})
  for(const content of [null,'status: complete\n','---\nstatus: complete\n','---\nstatus: complete\nstatus: paused\n---\n','---\ninvalid\nstatus: complete\n---\n',Buffer.from([0xc0,0x80]),'---\nidea: '+ 'x'.repeat(65536)+'\nstatus: complete\n---\n','---\nstatus: complete\n---\n'+'x'.repeat(1048576)]){
    if(content!==null)await writeFile(path,content)
    await assert.rejects(host.execute({kind:'check-sessions'},'invalid','turn-1'),{code:'OUTPUT_REFUSED'})
    if(content!==null)assert.deepEqual(await readFile(path),Buffer.from(content))
  }
  await rm(path);await mkdir(path)
  await assert.rejects(host.execute({kind:'check-sessions'},'directory','turn-1'),{code:'OUTPUT_REFUSED'});await rm(path,{recursive:true})
  await writeFile(path,'---\nstatus: complete\n---\n');const outside=join(root,'outside-secret');await writeFile(outside,'---\nstatus: complete\n---\nSECRET')
  const nativeFs=createRequire(import.meta.url)('node:fs/promises'),original=nativeFs.open
  const denied=mock.method(nativeFs,'open',async(candidate,...args)=>{if(candidate===path)throw Object.assign(Error('refus de lecture synthétique'),{code:'EACCES'});return original(candidate,...args)});syncBuiltinESMExports()
  try{await assert.rejects(host.execute({kind:'check-sessions'},'unreadable','turn-1'),{code:'OUTPUT_REFUSED'})}finally{denied.mock.restore();syncBuiltinESMExports()}
  await rm(path);await link(outside,path)
  await assert.rejects(host.execute({kind:'check-sessions'},'hardlink','turn-1'),{code:'OUTPUT_REFUSED'});await rm(path)
  // Windows autorise les jonctions sans privilège symlink ; les deux passent par la même garde lstat.
  await symlink(process.platform==='win32'?root:outside,path,process.platform==='win32'?'junction':'file')
  await assert.rejects(host.execute({kind:'check-sessions'},'symlink','turn-1'),{code:'OUTPUT_REFUSED'});await rm(path)
  await rm(folder,{recursive:true,force:true});await symlink(root,folder,'junction')
  await assert.rejects(host.execute({kind:'check-sessions'},'junction','turn-1'),{code:'OUTPUT_REFUSED'});await rm(folder)
  assert.equal(await readFile(outside,'utf8'),'---\nstatus: complete\n---\nSECRET')
  assert.equal(observations.some(o=>o.operation==='check-sessions'),false)
})
test('sans initiative, la recherche contrôle une seule fois la sortie générale imposée',async t=>{
  const root=await fixture(t);await writeFile(join(root,'_bmad/config.toml'),'[core]\noutput_folder = "{project-root}/_bmad-output"\n')
  const signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal)
  host.bind(async()=>{});const result=JSON.parse(await activate(host))
  assert.equal(profile.forge.initiativeId,null);assert.equal(result.locations.length,1);assert.equal(result.locations[0].path,profile.forge.outputBase)
})
test('course : une sortie vide remplacée pendant readdir est refusée sans reçu ni lecture externe',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal),observations=[]
  host.bind(async o=>observations.push(o));await activate(host,false)
  const base=profile.forge.outputBase,moved=base+'-moved',external=join(root,'external-output'),secret=join(external,'forge-private/.memlog.md')
  await mkdir(base,{recursive:true});await mkdir(dirname(secret),{recursive:true});await writeFile(secret,'---\nstatus: paused\n---\nSECRET')
  const nativeFs=createRequire(import.meta.url)('node:fs/promises'),original=nativeFs.readdir
  let switched=false,externalRead=false
  const raced=mock.method(nativeFs,'readdir',async(path,...args)=>{
    if(String(path).startsWith(external))externalRead=true
    const entries=await original(path,...args)
    if(path===base&&!switched){switched=true;await rename(base,moved);await symlink(external,base,process.platform==='win32'?'junction':'dir')}
    return entries
  });syncBuiltinESMExports()
  try{await assert.rejects(host.execute({kind:'check-sessions'},'raced-scan','turn-1'),{code:'OUTPUT_REFUSED'})}
  finally{raced.mock.restore();syncBuiltinESMExports();if(switched){await unlink(base);await rename(moved,base)}}
  assert.equal(switched,true);assert.equal(externalRead,false);assert.equal(observations.some(o=>o.id==='raced-scan'),false)
  assert.equal(await readFile(secret,'utf8'),'---\nstatus: paused\n---\nSECRET')
  await rm(base,{recursive:true})
  const originalStat=nativeFs.lstat;let absentReads=0,appeared=false
  const appearance=mock.method(nativeFs,'lstat',async(path,...args)=>{
    try{return await originalStat(path,...args)}catch(error){
      if(path===base&&error.code==='ENOENT'&&++absentReads===2){await mkdir(base);appeared=true}
      throw error
    }
  });syncBuiltinESMExports()
  try{await assert.rejects(host.execute({kind:'check-sessions'},'raced-absence','turn-2'),{code:'OUTPUT_REFUSED'})}
  finally{appearance.mock.restore();syncBuiltinESMExports()}
  assert.equal(appeared,true);assert.equal(observations.some(o=>o.id==='raced-absence'),false)
})
test('ordre hôte et échec de stockage ne créent ni reçu durable ni droit à init',async t=>{
  const root=await fixture(t),signal=new AbortController().signal,profile=await qualifyForge(root,signal),host=new ForgeHost(profile,signal)
  host.bind(async()=>{})
  await assert.rejects(host.execute({kind:'check-sessions'},'early','turn-1'),{code:'UNSUPPORTED_INTERACTION'})
  await activate(host,false)
  await assert.rejects(host.execute({kind:'init',slug:'early',idea:'x',goal:'y'},'init','turn-1'),{code:'UNSUPPORTED_INTERACTION'})
  await assert.rejects(host.execute({kind:'check-sessions',path:'../outside'},'args','turn-1'),{code:'UNSUPPORTED_INTERACTION'})
  host.bind(async()=>{throw Object.assign(Error(),{code:'STORAGE_WRITE_FAILED'})})
  await assert.rejects(host.execute({kind:'check-sessions'},'disk','turn-1'),{code:'STORAGE_WRITE_FAILED'})
  host.bind(async()=>{})
  await assert.rejects(host.execute({kind:'init',slug:'disk',idea:'x',goal:'y'},'init','turn-1'),{code:'UNSUPPORTED_INTERACTION'})
  await host.execute({kind:'check-sessions'},'retry-read','turn-2')
  await host.execute({kind:'init',slug:'valid',idea:'x',goal:'y'},'init','turn-2')
  await assert.rejects(host.execute({kind:'check-sessions'},'late','turn-2'),{code:'UNSUPPORTED_INTERACTION'})
})
