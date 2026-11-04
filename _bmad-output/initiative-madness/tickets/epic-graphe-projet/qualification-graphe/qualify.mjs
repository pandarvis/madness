// Provisioning is separate from the offline analysis path.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import tls from 'node:tls';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../../../..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const mkdir=p=>fs.mkdirSync(p,{recursive:true});
const arg=n=>process.argv.find(a=>a.startsWith('--'+n+'='))?.split('=').slice(1).join('=');
const mode=arg('mode');
const assembly=arg('assembly')?path.resolve(arg('assembly')):path.join(here,'assembly-manifest.json');
const uv=path.join(os.homedir(),'scoop/apps/uv/0.13.0/uv.exe');
const base=json(path.join(repo,'resources/bmad-help/runtime.json'));
const normalize=n=>n.replace(/[-_.]+/g,'-').toLowerCase();
function chain(p){
 for(let s=path.resolve(p);;s=path.dirname(s)){
  const st=fs.lstatSync(s);
  if(st.isSymbolicLink()||(!st.isDirectory()&&st.nlink!==1))throw Error('LINK:'+s);
  if(path.dirname(s)===s)break;
 }
}
function inventory(root){
 chain(root);const out=[];
 function visit(p){for(const d of fs.readdirSync(p,{withFileTypes:true})){
  const f=path.join(p,d.name),s=fs.lstatSync(f);
  if(s.isSymbolicLink()||(!s.isDirectory()&&s.nlink!==1))throw Error('LINK:'+f);
  if(s.isDirectory())visit(f);
  else out.push({name:path.relative(root,f).replaceAll('\\','/'),sha256:sha(fs.readFileSync(f)),bytes:s.size});
 }}
 visit(root);return out.sort((a,b)=>a.name.localeCompare(b.name,'en'));
}
function check(root,expected){
 const shape=rows=>[...rows].sort((a,b)=>a.name.localeCompare(b.name,'en')).map(({name,sha256})=>({name,sha256}));
 if(JSON.stringify(shape(inventory(root)))!==JSON.stringify(shape(expected)))throw Error('CLOSED_INVENTORY:'+root);
}
function run(exe,args,cwd,env,log){
 const r=spawnSync(exe,args,{cwd,env,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024,timeout:mode==='run'?3600000:240000});
 if(log)save(log,{command:[exe,...args],status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});
 if(r.status!==0)throw Error('COMMAND_FAILED:'+exe+':'+(r.error?.message||r.stderr));
 return r.stdout;
}
function auditInputs(){
 const m=json(path.join(repo,'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/release-manifest-002.json'));
 return m.inputs.map(r=>({path:r.path,expected:r.sha256,actual:sha(fs.readFileSync(path.join(repo,r.path)))}));
}
async function fetchJson(url){
 const res=await fetch(url,{signal:AbortSignal.timeout(60000)});
 if(!res.ok)throw Error('HTTP:'+res.status+':'+url);
 return await res.json();
}
async function download(url,dest,expected){
 if(!url.startsWith('https://'))throw Error('TLS_REQUIRED');
 const res=await fetch(url,{signal:AbortSignal.timeout(60000)});
 if(!res.ok)throw Error('HTTP:'+res.status+':'+url);
 const b=Buffer.from(await res.arrayBuffer());
 if(expected&&sha(b)!==expected)throw Error('DOWNLOAD_HASH');
 fs.writeFileSync(dest,b);
}
async function provision(){
 // System CAs augment the normal roots; TLS verification is never disabled.
 tls.setDefaultCACertificates([...tls.getCACertificates('default'),...tls.getCACertificates('system')]);
 chain(uv);if(sha(fs.readFileSync(uv))!==base.uvSha256)throw Error('UV_CHANGED');
 if(path.dirname(assembly)!==here)throw Error('MANIFEST_DESTINATION');
 const requested=arg('provision-owner');
 const owner=requested?path.resolve(requested):fs.mkdtempSync(path.join(os.tmpdir(),'mg41-'));
 const tmp=path.resolve(os.tmpdir());
 if(!owner.startsWith(tmp+path.sep)||!path.basename(owner).startsWith('mg41-'))throw Error('PROVISION_OWNER');
 chain(owner);
 if(requested&&(!fs.existsSync(path.join(owner,'owner.json'))||json(path.join(owner,'owner.json')).purpose!=='graph41-provision'))throw Error('RESUME_OWNER_UNKNOWN');
 save(path.join(owner,'owner.json'),{purpose:'graph41-provision',owner});
 for(const n of ['runtime/Lib/site-packages','packages','wheels','cache','home','tmp'])mkdir(path.join(owner,n));
 if(inventory(path.join(owner,'packages')).length)throw Error('ASSEMBLY_NOT_FRESH');
 const receipt={owner,assembly,started:new Date().toISOString(),fromLock:fs.existsSync(path.join(here,'requirements.lock')),fromOwner:arg('from-owner')||null,steps:[],uvCompileStarted:false,uvInstallStarted:false};
 const receiptName=arg('receipt')||path.basename(assembly,'.json')+'-provision';
 if(!/^[a-zA-Z0-9_-]+$/.test(receiptName))throw Error('RECEIPT_NAME');
 const receiptPath=path.join(here,receiptName+'.json');
 const env={SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,PATH:path.join(process.env.SYSTEMROOT,'System32'),USERPROFILE:path.join(owner,'home'),HOME:path.join(owner,'home'),TEMP:path.join(owner,'tmp'),TMP:path.join(owner,'tmp'),UV_CACHE_DIR:path.join(owner,'cache'),UV_SYSTEM_CERTS:'true',UV_NO_CONFIG:'true'};
 try{
  const origin=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python');chain(origin);
  for(const f of base.files){
   const src=path.join(origin,f.name);chain(src);const b=fs.readFileSync(src);
   if(sha(b)!==f.sha256)throw Error('BASE_HASH:'+f.name);
   const dest=path.join(owner,'runtime',f.name);mkdir(path.dirname(dest));fs.writeFileSync(dest,b);
  }
  check(path.join(owner,'runtime'),base.files);receipt.steps.push('base735-verified-before-uv');
  const lockPath=path.join(here,'requirements.lock');
  let versions=[];
  if(receipt.fromLock){
   versions=fs.readFileSync(lockPath,'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>{
    const v=/^([a-zA-Z0-9_.-]+)==([^\s]+) --hash=sha256:([a-f0-9]{64})$/.exec(line);
    if(!v)throw Error('LOCK_RECORD');return {name:v[1],version:v[2],expected:v[3]};
   });
   if(new Set(versions.map(v=>normalize(v.name))).size!==versions.length)throw Error('LOCK_DUPLICATE');
   if(!versions.some(v=>v.name==='graphifyy'&&v.version==='0.9.101'&&v.expected==='be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c'))throw Error('LOCK_GRAPHIFY_PIN');
   receipt.steps.push('exact-existing-lock-consumed-no-resolution');
  }else{
   fs.writeFileSync(path.join(owner,'requirements.in'),'graphifyy==0.9.101\n');
   const resolved=path.join(owner,'resolved.lock');receipt.uvCompileStarted=true;
   run(uv,['pip','compile',path.join(owner,'requirements.in'),'--python-version','3.12.14','--python-platform','windows','--only-binary',':all:','--generate-hashes','--no-header','--output-file',resolved],owner,env,path.join(owner,'resolve.json'));
   versions=[...fs.readFileSync(resolved,'utf8').matchAll(/^([a-zA-Z0-9_-]+)==([^\s\\]+)/gm)].map(v=>({name:v[1],version:v[2]}));
  }
  const source=arg('from-owner')?path.resolve(arg('from-owner')):null;
  const known=source?json(path.join(here,'assembly-manifest.json')).wheels:null;
  if(source)chain(source);
  const wheels=[];
  for(const d of versions){
   let selected;
   if(source){
    if(!d.expected)throw Error('OFFLINE_COPY_REQUIRES_LOCK');
    selected=known.find(w=>normalize(w.name)===normalize(d.name)&&w.version===d.version&&w.sha256===d.expected);
    if(!selected)throw Error('SOURCE_WHEEL_PROFILE:'+d.name);
    const file=path.join(source,'wheels',selected.filename);chain(file);const bytes=fs.readFileSync(file);
    if(sha(bytes)!==d.expected)throw Error('SOURCE_WHEEL_HASH:'+d.name);
    fs.writeFileSync(path.join(owner,'wheels',selected.filename),bytes);
   }else{
    const meta=await fetchJson(`https://pypi.org/pypi/${d.name}/${d.version}/json`);
    const candidates=meta.urls.filter(w=>w.packagetype==='bdist_wheel'&&!w.yanked&&(!d.expected||w.digests.sha256===d.expected)&&(/-py3-none-any.whl$/.test(w.filename)||(/-win_amd64\.whl$/.test(w.filename)&&(/-cp312-cp312-/.test(w.filename)||/-cp3(8|9|10|11|12)-abi3-/.test(w.filename)))));
    if(candidates.length!==1)throw Error('WHEEL_SELECTION:'+d.name);
    const w=candidates[0];
    selected={name:d.name,version:d.version,filename:w.filename,sha256:w.digests.sha256,url:w.url,license:meta.info.license_expression||meta.info.license};
    await download(w.url,path.join(owner,'wheels',w.filename),selected.sha256);
   }
   if(d.name==='graphifyy'&&selected.sha256!=='be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c')throw Error('GRAPHIFY_PIN');
   wheels.push(selected);
  }
  receipt.steps.push('all-binary-wheel-hashes-verified');
  if(!receipt.fromLock)fs.writeFileSync(lockPath,wheels.map(w=>`${w.name}==${w.version} --hash=sha256:${w.sha256}`).join('\n')+'\n');
  receipt.uvInstallStarted=true;
  run(uv,['pip','install','--python',path.join(owner,'runtime/python.exe'),'--no-deps','--no-index','--no-config','--no-cache','--only-binary',':all:','--target',path.join(owner,'packages'),...wheels.map(w=>path.join(owner,'wheels',w.filename))],owner,env,path.join(owner,'install.json'));
  const packages=inventory(path.join(owner,'packages')),runtime=inventory(path.join(owner,'runtime'));
  const modules=['cli','cluster','__main__','llm','detect','extract','export','paths'].map(n=>({name:'graphify/'+n+'.py',sha256:sha(fs.readFileSync(path.join(owner,'packages/graphify',n+'.py')))}));
  const notices=packages.filter(p=>/dist-info\/(licenses\/|LICENSE|NOTICE|COPYING|METADATA)/i.test(p.name));
  const git='C:/Program Files/Git/cmd/git.exe';chain(git);
  const ps='C:/Users/UP60066553/.pwsh-latest/pwsh.exe';chain(ps);
  save(assembly,{schemaVersion:1,tool:'graphifyy',version:'0.9.101',created:new Date().toISOString(),owner,pythonVersion:'3.12.14',baseCount:base.files.length,uv:{path:uv,sha256:base.uvSha256},git:{path:git,sha256:sha(fs.readFileSync(git)),version:run(git,['--version'],owner,env)},tooling:{node:{path:process.execPath,version:process.version,sha256:sha(fs.readFileSync(process.execPath))},powershell:{path:ps,sha256:sha(fs.readFileSync(ps))}},runtime,packages,wheels,criticalModules:modules,notices,policy:'independent owned copies; binary wheels only; no extras; no site; no bytecode'});
  Object.assign(receipt,{passed:true,wheels:wheels.length,runtime:runtime.length,packages:packages.length,steps:[...receipt.steps,'independent-inventory-recorded'],inputs:auditInputs(),completed:new Date().toISOString()});
  save(receiptPath,receipt);console.log(JSON.stringify({owner,assembly,receipt:receiptPath,wheels:wheels.length,runtime:runtime.length,packages:packages.length}));
 }catch(e){Object.assign(receipt,{passed:false,error:e.message,completed:new Date().toISOString()});save(receiptPath,receipt);throw e;}
}
async function main(){
 if(mode==='provision')return await provision();
 const m=json(assembly);check(path.join(m.owner,'runtime'),m.runtime);check(path.join(m.owner,'packages'),m.packages);
 if(mode!=='run'&&mode!=='verify')throw Error('MODE_REQUIRED');
 const output=path.resolve(arg('output')||path.join(here,'runs','run-'+crypto.randomUUID()));
 if(mode==='run'){
  chain(m.uv.path);
  if(path.resolve(m.uv.path).toLowerCase()!==path.resolve(uv).toLowerCase()||m.uv.sha256!==base.uvSha256||sha(fs.readFileSync(m.uv.path))!==base.uvSha256)throw Error('UV_CHANGED');
  if(fs.existsSync(output))throw Error('OUTPUT_REUSED');mkdir(output);save(path.join(output,'inputs-before.json'),auditInputs());
  run(m.uv.path,['run','--offline','--no-project','--no-config','--no-cache','--python',path.join(m.owner,'runtime/python.exe'),'--',path.join(m.owner,'runtime/python.exe'),'-I','-S','-B','-X','utf8',path.join(here,'fixtures.py'),output,assembly,...(arg('case')?['--case='+arg('case')]:[])],m.owner,{SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,PATH:process.env.PATH,TEMP:path.join(m.owner,'tmp'),TMP:path.join(m.owner,'tmp'),UV_CACHE_DIR:path.join(m.owner,'cache')},path.join(output,'matrix-command.json'));
  save(path.join(output,'inputs-after.json'),auditInputs());console.log(output);
 }else console.log(run(path.join(m.owner,'runtime/python.exe'),['-I','-S','-B','-X','utf8',path.join(here,'verify.py'),output,assembly],m.owner,{SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,TEMP:path.join(m.owner,'tmp'),TMP:path.join(m.owner,'tmp')},path.join(output,'verify-command.json')));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
