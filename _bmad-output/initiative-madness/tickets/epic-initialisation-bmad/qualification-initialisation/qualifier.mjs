/** 3.1: one local, owned qualification; never an installer entry point for product/user projects. */
import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {lstat, realpath, readdir, readFile, writeFile, mkdir, copyFile, rm, symlink, unlink, rename} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, join, resolve, relative, isAbsolute, sep} from 'node:path';
import {tmpdir} from 'node:os';
import {archiveAttempt} from './archive-attempt.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const repo=resolve(here,'../../../../..');
const expectedRepo='C:/Users/UP60066553/.codex/worktrees/bmad-help-2-2/madness';
assert.equal(repo.toLowerCase(),resolve(expectedRepo).toLowerCase(),'qualification is fixed to its approved worktree');
const finalize=process.argv[2]==='--finalize';
const resume=(process.argv[2]==='--resume'||finalize)?process.argv[3]:null;
if(resume)assert.match(resume,/^run-[a-zA-Z0-9-]+$/);
const id=resume??'run-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8);
const proofs=join(here,'proofs',id),owned=join(here,'.owned-'+id);
const sha=v=>createHash('sha256').update(v).digest('hex');
const json=async(name,value)=>writeFile(join(proofs,name),JSON.stringify(value,null,2)+'\n','utf8');
const within=(root,path)=>{const r=relative(root,path);return !r||!isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+sep);};
const exists=async p=>{try{await lstat(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
async function plain(path){
  const absolute=resolve(path);
  for(let p=absolute;;p=dirname(p)){
    const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('LINK_REFUSED:'+p);
    if(dirname(p)===p)break;
  }
  return absolute;
}
async function tree(root){
  await plain(root);const entries=[];
  const walk=async(path,rel)=>{const s=await lstat(path);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('LINK_REFUSED:'+path);
    if(s.isDirectory()){if(rel)entries.push({path:rel,type:'directory'});for(const name of (await readdir(path)).sort())await walk(join(path,name),rel?rel+'/'+name:name);}
    else if(s.isFile()){const bytes=await readFile(path);entries.push({path:rel,type:'file',bytes:bytes.length,sha256:sha(bytes)});}
    else throw Error('SPECIAL_FILE_REFUSED:'+path);
  };await walk(root,'');return entries;
}
const treeSha=entries=>sha(JSON.stringify(entries));
async function identity(path){await plain(path);const s=await lstat(path);return {path:await realpath(path),dev:s.dev,ino:s.ino};}
async function copyTree(source,target,entries){
  await mkdir(target,{recursive:true});
  for(const entry of entries){const dest=join(target,entry.path);if(entry.type==='directory')await mkdir(dest,{recursive:true});else{await mkdir(dirname(dest),{recursive:true});await copyFile(join(source,entry.path),dest);}}
}
let active=0,uncertain=false;const commands=resume?JSON.parse(await readFile(join(proofs,'commands.json'),'utf8')):[];
async function command(label,exe,args,cwd,env,archive){
  const snapshot=await archiveAttempt({root:join(here,'attempts'),label,exe,args,cwd,env,...archive});
  args=snapshot.args;env=snapshot.env;
  const record={label,exe,args,cwd,archive:{directory:snapshot.directory,manifestPath:snapshot.manifestPath,manifestSha256:snapshot.manifestSha256},startedAt:new Date().toISOString()};commands.push(record);active++;
  return new Promise((res,rej)=>{
    let stdout='',stderr='',timedOut=false;
    const child=spawn(exe,args,{cwd,env,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});record.pid=child.pid;
    const timer=setTimeout(()=>{timedOut=true;uncertain=true;child.kill();},45000);
    child.stdout.on('data',b=>{stdout+=b.toString('utf8');if(stdout.length>4*1024*1024){uncertain=true;child.kill();}});
    child.stderr.on('data',b=>{stderr+=b.toString('utf8');if(stderr.length>4*1024*1024){uncertain=true;child.kill();}});
    child.once('error',error=>{record.spawnError=String(error);});
    child.once('close',async(code,signal)=>{clearTimeout(timer);active--;Object.assign(record,{code,signal,timedOut,closedAt:new Date().toISOString()});
      try{await writeFile(join(proofs,label+'.stdout.txt'),stdout,'utf8');await writeFile(join(proofs,label+'.stderr.txt'),stderr,'utf8');await json('commands.json',commands);
        if(code!==0||timedOut)throw Error(label+': code='+code+' signal='+signal+' '+stderr.slice(-1000));res(stdout);
      }catch(e){rej(e);}
    });
  });
}
async function fixture(name){const root=join(owned,'targets',name+(finalize?'-final':''));await mkdir(join(root,'code'),{recursive:true});await writeFile(join(root,'README.md'),'# Témoin 3.1\nPréexistant — conserver les octets.\n','utf8');await writeFile(join(root,'code','sentinel.txt'),'owned fixture code\r\n','utf8');return root;}
async function captureTarget(root){return {root:await identity(root),parent:await identity(dirname(root)),entries:await tree(root)};}
function checkOutput(value){if(value!=='{project-root}/_bmad-output')throw Error('OUTPUT_REFUSED:'+value);}
function checkSourceString(value){if(!isAbsolute(value)||value.includes('://')||value.startsWith('github:'))throw Error('SOURCE_REFUSED:'+value);}
async function admit(root,capture,payload,consent){
  if(!within(join(owned,'targets'),root)||root===join(owned,'targets'))throw Error('TARGET_NOT_OWNED');
  assert.deepEqual(await identity(root),capture.root,'TARGET_IDENTITY_CHANGED');assert.deepEqual(await identity(dirname(root)),capture.parent,'PARENT_IDENTITY_CHANGED');
  assert.deepEqual(await tree(root),capture.entries,'PRECONDITION_CHANGED');
  for(const reserved of ['.agents','_bmad','_bmad-output','skills-lock.json'])if(await exists(join(root,reserved)))throw Error('COLLISION:'+reserved);
  assert.equal(treeSha(await tree(payload.root)),payload.treeSha,'PAYLOAD_CHANGED');
  checkOutput(payload.outputFolder);
  if(consent?.kind!=='synthetic-fixture-only'||consent.planSha256!==sha(JSON.stringify({target:capture,payload:payload.entries,outputFolder:payload.outputFolder})))throw Error('SIMULATED_CONSENT_MISMATCH');
}
const makeConsent=(capture,payload)=>({kind:'synthetic-fixture-only',humanAcceptance:false,planSha256:sha(JSON.stringify({target:capture,payload:payload.entries,outputFolder:payload.outputFolder}))});
const cases=[];
async function refusal(name,run,root,expected){const before=await tree(root);let error;try{await run();}catch(e){error=String(e.message);}assert.ok(error?.includes(expected),name+': '+error);assert.deepEqual(await tree(root),before,name+': target modified');cases.push({name,result:'refused-by-qualification-harness',expected,error,targetUnchanged:true,toolInvoked:false});}
async function exerciseRefusals(payload){
  const cancel=await fixture('cancel'),cancelBefore=await captureTarget(cancel);await admit(cancel,cancelBefore,payload,makeConsent(cancelBefore,payload));assert.deepEqual(await captureTarget(cancel),cancelBefore);cases.push({name:'I3 cancel-before-application',result:'intact',toolInvoked:false,targetUnchanged:true});
  const stale=await fixture('precondition'),staleBefore=await captureTarget(stale);await writeFile(join(stale,'code','sentinel.txt'),'external fixture change\n','utf8');await refusal('I6 precondition changed',()=>admit(stale,staleBefore,payload,makeConsent(staleBefore,payload)),stale,'PRECONDITION_CHANGED');
  const collision=await fixture('collision');await mkdir(join(collision,'_bmad'));const collisionBefore=await captureTarget(collision);await refusal('I5 collision',()=>admit(collision,collisionBefore,payload,makeConsent(collisionBefore,payload)),collision,'COLLISION:');
  const hostile=await fixture('hostile'),hostileBefore=await captureTarget(hostile);
  for(const output of ['C:/outside-init31','../outside-init31','{project-root}/../outside-init31'])await refusal('I5 hostile output '+output,()=>checkOutput(output),hostile,'OUTPUT_REFUSED');
  await refusal('I5 remote source',()=>checkSourceString('github:bmad-code-org/BMAD-METHOD/skills'),hostile,'SOURCE_REFUSED');
  const external=join(owned,'outside-sentinel');if(!await exists(external)){await mkdir(external);await writeFile(join(external,'sentinel.txt'),'outside links must stay intact','utf8');}const externalBefore=await tree(external);
  const sourceLink=join(owned,'linked-source');await symlink(external,sourceLink,'junction');await refusal('I5 linked source',()=>tree(sourceLink),hostile,'LINK_REFUSED');await unlink(sourceLink);
  const rerouted=await fixture('rerouted'),reroutedBefore=await captureTarget(rerouted),held=rerouted+'-held';await rename(rerouted,held);await symlink(external,rerouted,'junction');let linkError;try{await admit(rerouted,reroutedBefore,payload,makeConsent(reroutedBefore,payload));}catch(e){linkError=e.message;}assert.match(linkError,/LINK_REFUSED/);await unlink(rerouted);await rename(held,rerouted);assert.deepEqual(await captureTarget(rerouted),reroutedBefore);assert.deepEqual(await tree(external),externalBefore);cases.push({name:'I5 target rerouted by junction',result:'refused-by-qualification-harness',error:linkError,toolInvoked:false,targetUnchanged:true,externalSentinelUnchanged:true});
  const parentRoot=join(owned,'targets','parent-reroute'+(finalize?'-final':''));await mkdir(parentRoot);const parentTarget=join(parentRoot,'target');await mkdir(parentTarget);const parentBefore=await captureTarget(parentTarget),parentHeld=parentRoot+'-held';await rename(parentRoot,parentHeld);await symlink(external,parentRoot,'junction');let parentError;try{await admit(parentTarget,parentBefore,payload,makeConsent(parentBefore,payload));}catch(e){parentError=e.message;}assert.match(parentError,/LINK_REFUSED|ENOENT/);await unlink(parentRoot);await rename(parentHeld,parentRoot);assert.deepEqual(await captureTarget(parentTarget),parentBefore);assert.deepEqual(await tree(external),externalBefore);cases.push({name:'I5 parent rerouted',result:'refused-by-qualification-harness',error:parentError,toolInvoked:false,targetUnchanged:true});
  return {external,externalBefore};
}
await mkdir(proofs,{recursive:true});if(!resume){await mkdir(owned);await writeFile(join(owned,'.ownership'),id,'utf8');}else assert.equal(await readFile(join(owned,'.ownership'),'utf8'),id);
const sourceRoot=await realpath(join(repo,'.agents','skills'));
const npmRoot='C:/Users/UP60066553/AppData/Local/npm-cache/_npx/ac0ed6aa23b37c1e';
const cacheModules=join(npmRoot,'node_modules'),cli=join(cacheModules,'skills','dist','cli.mjs');
const sourceBundle=join(owned,'source-bundle'),payloadRoot=join(owned,'payload');
let stage=join(owned,'staging','positive');
const tempRoot=await realpath(tmpdir()),shortRoot=join(tempRoot,'madness-g3-'+id.slice(-8));
if(finalize){
  try{
    const payload={root:payloadRoot,entries:await tree(payloadRoot),outputFolder:'{project-root}/_bmad-output'};payload.treeSha=treeSha(payload.entries);
    const positive=JSON.parse(await readFile(join(proofs,'positive-result.json'),'utf8'));
    const positiveRoot=positive.rootIdentity.path;assert.deepEqual(await tree(positiveRoot),positive.after);assert.equal(payload.treeSha,positive.payloadTreeSha256);
    await exerciseRefusals(payload);
    cases.push({name:'I4 exact bounded application',result:'verified-by-bytes-and-existing-Mary-profile',filesAdded:payload.entries.filter(e=>e.type==='file').length,directoriesAdded:payload.entries.filter(e=>e.type==='directory').length,toolInvoked:false,sentinelsPreserved:true,revalidatedAfterHarnessReportingError:true});
    const source=JSON.parse(await readFile(join(proofs,'source-manifest.json'),'utf8'));
    for(const item of source.source)assert.deepEqual(await tree(join(source.canonicalRoot,item.name)),item.entries);
    const sealed=JSON.parse(await readFile(join(owned,'node-guard.json'),'utf8')).sealed;
    for(const [path,expected] of Object.entries(sealed))assert.equal(sha(await readFile(path)),expected,'cached tool changed:'+path);
    await json('cases.json',cases);await json('preservation.json',{sourceTreeSha256:sha(JSON.stringify(source.source)),sourceUnchanged:true,cachedToolFiles:Object.keys(sealed).length,cachedToolsUnchanged:true,productWritesAttempted:0,profilePersonalAccessed:false,writeEvidence:'guarded mutation records and source/tool hashes reread',nativeAntiRaceGuarantee:false});
    assert.equal(active,0);assert.ok(commands.every(c=>c.closedAt&&!c.timedOut));
    await json('short-staging-final.json',await tree(shortRoot));await plain(shortRoot);assert.ok(within(tempRoot,shortRoot)&&shortRoot!==tempRoot);assert.equal(await readFile(join(shortRoot,'.ownership'),'utf8'),id);await rm(shortRoot,{recursive:true});assert.equal(await exists(shortRoot),false);
    await json('private-final-before-cleanup.json',await tree(owned));await plain(owned);assert.ok(within(here,owned)&&owned.startsWith(join(here,'.owned-run-')));assert.equal(await readFile(join(owned,'.ownership'),'utf8'),id);await rm(owned,{recursive:true});assert.equal(await exists(owned),false);
    const report=JSON.parse(await readFile(join(proofs,'setup-report.json'),'utf8'));
    await json('result.json',{id,status:'qualified-local-profile-with-limits',cases:cases.length,sourceFolders:source.source.length,invocableSkillFolders:source.source.length-3,metadataFolders:3,modules:source.modules,children:commands.map(c=>({label:c.label,pid:c.pid,code:c.code,signal:c.signal,closedAt:c.closedAt})),closed:true,ownedCopiesRemoved:true,retainedUncertainWitnesses:[],limits:['not product G3/G4/G5','upstream commit unknown','bmad-retrospective unavailable','no interrupted effects/global transaction tested','no OS sandbox or native concurrent-writer guarantee','local-source locks excluded; updates/restore unqualified','short canonical Temp staging only; deep Windows path setup refused'],setupCurrent:report.current,finalization:'Only guard cases and byte readback repeated after a manifest-reporting path error; no Skills/setup/application repeated'});
    console.log(JSON.stringify({id,proofs,status:'qualified-local-profile-with-limits',cases:cases.length,closed:true,ownedCopiesRemoved:true}));
  }catch(error){await json('finalization-failure.json',{error:String(error),stack:error.stack,retainedWitness:owned,retainedShortStaging:await exists(shortRoot)?shortRoot:null});console.error(error);process.exitCode=1;}
}else
try{
  // Local bytes are the pin; module metadata naming upstream/main is only declared provenance.
  const modules=[],selected=new Set();
  for(const name of ['bmod-core-tools','bmod-method','bmod-toolsmith']){
    const content=await readFile(join(sourceRoot,name,'bmod.toml'),'utf8');
    const members=[...content.match(/\bskills\s*=\s*\[([\s\S]*?)\]/)[1].matchAll(/"([a-zA-Z0-9_-]+)"/g)].map(m=>m[1]);
    const present=[],absent=[];for(const member of members){if(await exists(join(sourceRoot,member,'SKILL.md'))){selected.add(member);present.push(member);}else absent.push(member);}
    selected.add(name);modules.push({record:name,version:content.match(/version\s*=\s*"([^"]+)"/)[1],declaredSource:'github:bmad-code-org/BMAD-METHOD/skills',upstreamCommit:null,present,absent});
  }
  const source=[];for(const name of [...selected].sort()){const entries=await tree(join(sourceRoot,name));source.push({name,entries});if(!resume)await copyTree(join(sourceRoot,name),join(sourceBundle,name),entries);else assert.deepEqual(await tree(join(sourceBundle,name)),entries);}
  const setupPin=sha(await readFile(join(sourceRoot,'bmad','scripts','setup.py')));
  assert.equal(setupPin,'1de76dce0b4ba702da927d6dc83fd620ec0774aa1c1ab0cc5739167c135f64f8');
  assert.equal(sha(await readFile(cli)),'b7d92e2a619e8982d38390572750efb8c2ec81cdf23c33aed2fa426d080a1e4e');
  assert.equal(sha(await readFile(join(repo,'_bmad/scripts/setup.py'))),setupPin);
  const sourceBefore=sha(JSON.stringify(source));await json(resume?'source-manifest-resume.json':'source-manifest.json',{canonicalRoot:sourceRoot,sourceIdentity:await identity(sourceRoot),localProfile:true,officialRelease:false,upstreamCommit:null,modules,source});
  // Seal only this cached package's locked closure. Never copy the npm cache or install anything.
  const lock=JSON.parse(await readFile(join(npmRoot,'package-lock.json'),'utf8')),sealed={},toolFiles=[];
  for(const packagePath of Object.keys(lock.packages).filter(p=>p))for(const entry of await tree(join(npmRoot,packagePath))){if(entry.type==='file'){const path=join(npmRoot,packagePath,entry.path);sealed[path.toLowerCase()]=entry.sha256;toolFiles.push({...entry,path});}}
  const {bmadRuntime}=await import(pathToFileURL(join(repo,'src/adapters/bmad/runtime.ts')));
  const runtime=await bmadRuntime();
  const toolchain={node:{executable:process.execPath,version:process.version,sha256:sha(await readFile(process.execPath))},python:{executable:runtime.python,sha256:sha(await readFile(runtime.python)),admission:'existing bmadRuntime() complete tree + rejected CA + uv pins, once before campaign'},uvVerifiedNotExecuted:runtime.uv,cacheLock:{path:join(npmRoot,'package-lock.json'),sha256:sha(await readFile(join(npmRoot,'package-lock.json'))),packages:lock.packages},files:toolFiles,helpers:await Promise.all(['qualifier.mjs','archive-attempt.mjs','guard-node.mjs','guard-setup.py'].map(async path=>({path,sha256:sha(await readFile(join(here,path)))})))};
  const temp=join(owned,'temp'),state=join(owned,'state'),childHome=join(owned,'home');
  for(const p of [temp,state,childHome,stage])await mkdir(p,{recursive:true});
  // Child-only values: Skills uses homedir, XDG_STATE_HOME for .skill-lock.json, tmpdir for downloads;
  // Node compile cache disabled, telemetry/audit disabled by observed CLI guards. No parent env mutation.
  const env={SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,TEMP:temp,TMP:temp,HOME:childHome,USERPROFILE:childHome,APPDATA:join(childHome,'appdata'),LOCALAPPDATA:join(childHome,'localappdata'),XDG_STATE_HOME:state,XDG_CONFIG_HOME:join(childHome,'config'),DISABLE_TELEMETRY:'1',DO_NOT_TRACK:'1',NODE_DISABLE_COMPILE_CACHE:'1',NO_COLOR:'1'};
  const guard={writeRoots:[owned],sealed,events:join(proofs,'skills-mutations.jsonl'),imports:join(proofs,'skills-imports.jsonl')};
  // Audit evidence is the only additional writable destination, outside fixture payload.
  guard.writeRoots.push(proofs);const guardPath=join(owned,'node-guard.json');await writeFile(guardPath,JSON.stringify(guard),'utf8');
  const positive=resume?join(owned,'targets','positive'):await fixture('positive'),positiveBefore=await captureTarget(positive);
  await json('environment.json',{child:env,reasons:{HOME_USERPROFILE:'avoid user discovery/global read and global lock fallback',XDG_STATE_HOME:'CLI getSkillLockPath',TEMP_TMP:'CLI tmpdir staging',XDG_CONFIG_HOME:'xdg-basedir imported by agent detection',telemetry:'CLI isEnabled false',compileCache:'no external Node compile cache'},parentEnvironmentChanged:false});
  if(!resume){const beforePrivate=await tree(owned);await json('private-before-skills.json',beforePrivate);
  await command('skills-add',process.execPath,['--import',pathToFileURL(join(here,'guard-node.mjs')).href,cli,'add',sourceBundle,'--agent','codex','--copy','--yes','--skill',...[...selected].sort()],stage,{...env,INIT31_GUARD:guardPath},{wrapper:{source:join(here,'guard-node.mjs'),argIndex:1,url:true},guard:{source:guardPath,envKey:'INIT31_GUARD'},toolchain});
  await json('private-after-skills.json',await tree(owned));}
  assert.deepEqual(await captureTarget(positive),positiveBefore,'target changed during Skills preparation');
  const installedSkills=await readdir(join(stage,'.agents','skills'));assert.deepEqual(installedSkills.sort(),[...selected].sort());
  const skillsCopies=[];for(const name of installedSkills){const actual=await tree(join(stage,'.agents/skills',name)),expected=source.find(s=>s.name===name).entries;
    // Skills deliberately omits Python caches and metadata.json; record every omission.
    const kept=expected.filter(e=>!e.path.split('/').some(p=>['__pycache__','__pypackages__','.git'].includes(p))&&e.path.split('/').at(-1)!=='metadata.json');
    assert.deepEqual(actual,kept,'Skills copy differs:'+name);skillsCopies.push({name,files:actual.filter(e=>e.type==='file').length,excluded:expected.filter(e=>!kept.includes(e))});}
  await json('skills-copy-verification.json',skillsCopies);
  const originalStage=stage,prepared=await tree(stage);
  const shortExists=await exists(shortRoot);if(shortExists)assert.equal(await readFile(join(shortRoot,'.ownership'),'utf8'),id);else{await mkdir(shortRoot);await writeFile(join(shortRoot,'.ownership'),id,'utf8');}stage=join(shortRoot,'positive');if(!shortExists)await copyTree(originalStage,stage,prepared);assert.deepEqual(await tree(stage),prepared);
  await json('short-staging.json',{reason:'deep Windows path setup refused; short owned Temp staging authorized; no general long-path support claim',root:shortRoot,copiedFrom:originalStage,entries:prepared});
  const configTemplate=await readFile(join(stage,'.agents/skills/bmad/assets/config.template.toml'),'utf8');
  assert.match(configTemplate,/output_folder = "\{project-root\}\/_bmad-output"/);
  const extended=p=>resolve(p);
  const setupLabel='setup-'+(commands.filter(c=>c.label.startsWith('setup')).length+1);
  const setupGuard=join(owned,'setup-guard.json');await writeFile(setupGuard,JSON.stringify({writeRoots:[owned,shortRoot,proofs],events:join(proofs,setupLabel+'-mutations.json')}),'utf8');
  const setupOut=await command(setupLabel,runtime.python,['-X','utf8','-B','-I','-S',extended(join(here,'guard-setup.py')),extended(setupGuard),extended(join(stage,'.agents/skills/bmad/scripts/setup.py')),'--project-root',extended(stage),'--skill',extended(join(stage,'.agents/skills/bmad')),'--root',extended(join(stage,'.agents/skills'))],stage,env,{wrapper:{source:join(here,'guard-setup.py'),argIndex:5},guard:{source:setupGuard,argIndex:6},toolchain});
  const report=JSON.parse(setupOut);await json('setup-report.json',report);assert.equal(report.mode,'setup');assert.equal(report.status,'created');assert.equal(report.pending_questions.length,0);assert.equal(report.problems.length,0);
  await json('private-after-setup.json',await tree(owned));assert.deepEqual(await captureTarget(positive),positiveBefore);
  // Keep raw tool receipts in proofs. Their local source paths expire: exclude project lock in transfer.
  const localLock=await readFile(join(stage,'skills-lock.json'),'utf8');await writeFile(join(proofs,'skills-project-lock.raw.json'),localLock,'utf8');
  const stateLock=join(state,'skills','.skill-lock.json');if(await exists(stateLock))await writeFile(join(proofs,'skills-private-lock.raw.json'),await readFile(stateLock));
  const staged=await tree(stage);await json('staged-tree.json',staged);
  const transferEntries=staged.filter(e=>e.path!=='skills-lock.json');await copyTree(stage,payloadRoot,transferEntries);
  const payload={root:payloadRoot,entries:await tree(payloadRoot),outputFolder:'{project-root}/_bmad-output'};payload.treeSha=treeSha(payload.entries);
  const pathLeaks=[];for(const e of payload.entries.filter(e=>e.type==='file')){const text=(await readFile(join(payloadRoot,e.path))).toString('utf8');for(const value of [owned,owned.replaceAll('\\','/'),sourceBundle,sourceBundle.replaceAll('\\','/'),'source-bundle'])if(text.includes(value))pathLeaks.push({path:e.path,value});}
  assert.deepEqual(pathLeaks,[],'temporary paths in payload');
  const consent=makeConsent(positiveBefore,payload);await json('transfer-plan.json',{target:positiveBefore,payload:payload.entries,payloadTreeSha256:payload.treeSha,outputFolder:payload.outputFolder,excluded:[{path:'skills-lock.json',reason:'local-source reference points to private staging; no update/restore claim after removal'}],consent,privateToolEffects:['.agents/skills/*','skills-lock.json','XDG_STATE_HOME/skills/.skill-lock.json','_bmad.setup-<random> renamed to _bmad','_bmad-output'],pathLeaks});
  const {external,externalBefore}=await exerciseRefusals(payload);
  // Only this fixture receives synthetic agreement, bound to the captured plan. No tool in target.
  await admit(positive,positiveBefore,payload,consent);
  for(const e of payload.entries){const dest=join(positive,e.path);assert.ok(within(positive,dest));if(e.type==='directory')await mkdir(dest);else{const content=await readFile(join(payload.root,e.path));assert.equal(sha(content),e.sha256);await writeFile(dest,content,{flag:'wx'});}}
  const final=await tree(positive);assert.deepEqual([...final].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0),[...positiveBefore.entries,...payload.entries].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0),'exact post-application bytes/directories');
  assert.equal(await exists(join(positive,'skills-lock.json')),false);assert.deepEqual(await tree(external),externalBefore);
  const {qualifyBmadProfile}=await import(pathToFileURL(join(repo,'src/adapters/bmad/profile.ts')));const profile=await qualifyBmadProfile(positive);
  await json('positive-result.json',{before:positiveBefore.entries,after:final,rootIdentity:await identity(positive),payloadTreeSha256:payload.treeSha,exactTree:true,sentinelsPreserved:true,profile:{fingerprint:profile.fingerprint,catalogSource:profile.catalogSource,identity:'Mary pilot byte admission only; no model or resolver execution'},toolInvokedInTarget:false});
  cases.push({name:'I4 exact bounded application',result:'verified-by-bytes-and-existing-Mary-profile',filesAdded:payload.entries.filter(e=>e.type==='file').length,directoriesAdded:payload.entries.filter(e=>e.type==='directory').length,toolInvoked:false,sentinelsPreserved:true});
  const sourceAfter=[];for(const name of [...selected].sort())sourceAfter.push({name,entries:await tree(join(sourceRoot,name))});assert.equal(sha(JSON.stringify(sourceAfter)),sourceBefore);
  for(const [path,expected] of Object.entries(sealed))assert.equal(sha(await readFile(path)),expected,'cached tool modified:'+path);
  await json('cases.json',cases);await json('preservation.json',{sourceTreeSha256:sourceBefore,sourceUnchanged:true,cachedToolFiles:toolFiles.length,cachedToolsUnchanged:true,productWritesAttempted:0,profilePersonalAccessed:false,writeEvidence:'Node/Python guarded mutation records; fixture writes only by this qualification script; source and tool hashes reread',nativeAntiRaceGuarantee:false});
  assert.equal(active,0);assert.equal(uncertain,false);await plain(owned);assert.ok(within(here,owned)&&owned.startsWith(join(here,'.owned-run-')));assert.equal(await readFile(join(owned,'.ownership'),'utf8'),id);
  await json('short-staging-final.json',await tree(shortRoot));await plain(shortRoot);assert.ok(within(tempRoot,shortRoot)&&shortRoot!==tempRoot&&shortRoot===join(tempRoot,'madness-g3-'+id.slice(-8)));assert.equal(await readFile(join(shortRoot,'.ownership'),'utf8'),id);await rm(shortRoot,{recursive:true});assert.equal(await exists(shortRoot),false);
  await json('private-final-before-cleanup.json',await tree(owned));await rm(owned,{recursive:true});assert.equal(await exists(owned),false);
  await json('result.json',{id,status:'qualified-local-profile-with-limits',cases:cases.length,sourceFolders:selected.size,invocableSkillFolders:selected.size-3,metadataFolders:3,modules,children:commands.map(c=>({label:c.label,pid:c.pid,code:c.code,signal:c.signal,closedAt:c.closedAt})),closed:true,ownedCopiesRemoved:true,retainedUncertainWitnesses:[],limits:['not product G3/G4/G5','source upstream commit unknown','bmad-retrospective unavailable','no interruption during effects or global transaction tested','no OS sandbox or native concurrent writer protection','local-source locks excluded from payload; future updates/restore not qualified','setup current/exit zero alone not authority'],setupCurrent:report.current});
  console.log(JSON.stringify({id,proofs,status:'qualified-local-profile-with-limits',cases:cases.length,skills:selected.size,closed:true,ownedCopiesRemoved:true}));
}catch(error){await json('commands.json',commands);await json('failure-'+commands.length+'.json',{id,error:String(error),stack:error.stack,active,uncertain,retainedWitness:owned,retainedShortStaging:await exists(shortRoot)?shortRoot:null,cleanup:'retained; do not infer closure or cleanup success'});console.error(error);process.exitCode=1;}
