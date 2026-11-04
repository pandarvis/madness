import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync,spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../../../..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const mkdir=p=>fs.mkdirSync(p,{recursive:true});
const arg=n=>process.argv.find(a=>a.startsWith('--'+n+'='))?.split('=').slice(1).join('=');
const mode=arg('mode');
const assembly=path.join(here,'assembly-manifest.json');
const uv=path.join(os.homedir(),'scoop/apps/uv/0.13.0/uv.exe');
const base=json(path.join(repo,'resources/bmad-help/runtime.json'));
function chain(p){for(let s=path.resolve(p);;s=path.dirname(s)){const st=fs.lstatSync(s);if(st.isSymbolicLink()||(!st.isDirectory()&&st.nlink!==1))throw Error('LINK:'+s);if(path.dirname(s)===s)break;}}
function inventory(root){chain(root);const out=[];function visit(p){for(const d of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,d.name);const s=fs.lstatSync(f);if(s.isSymbolicLink()||(!s.isDirectory()&&s.nlink!==1))throw Error('LINK:'+f);if(s.isDirectory())visit(f);else out.push({name:path.relative(root,f).replaceAll('\\','/'),sha256:sha(fs.readFileSync(f)),bytes:s.size});}}visit(root);return out.sort((a,b)=>a.name.localeCompare(b.name,'en'));}
function check(root,expected){const got=inventory(root);if(JSON.stringify(got.map(({name,sha256})=>({name,sha256})))!==JSON.stringify([...expected].sort((a,b)=>a.name.localeCompare(b.name,'en')).map(({name,sha256})=>({name,sha256}))))throw Error('CLOSED_INVENTORY:'+root);}
function run(exe,args,cwd,env,log){const r=spawnSync(exe,args,{cwd,env,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024,timeout:mode==='run'?3600000:240000});if(log)save(log,{command:[exe,...args],status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});if(r.status!==0)throw Error('COMMAND_FAILED:'+exe+':'+r.stderr);return r.stdout;}
function auditInputs(){const m=json(path.join(repo,'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-reprise-projet/release-manifest-002.json'));return m.inputs.map(r=>({path:r.path,expected:r.sha256,actual:sha(fs.readFileSync(path.join(repo,r.path)))}));}
async function download(url,dest,expected){if(!url.startsWith('https://'))throw Error('TLS_REQUIRED');const res=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!res.ok)throw Error('HTTP:'+res.status+':'+url);const b=Buffer.from(await res.arrayBuffer());if(expected&&sha(b)!==expected)throw Error('DOWNLOAD_HASH');fs.writeFileSync(dest,b);return b;}
async function provision(){
 chain(uv);if(sha(fs.readFileSync(uv))!==base.uvSha256)throw Error('UV_CHANGED');
 const owner=arg('provision-owner')||fs.mkdtempSync(path.join(os.tmpdir(),'mg41-'));chain(owner);for(const n of ['runtime/Lib/site-packages','packages','wheels','cache','home','tmp'])mkdir(path.join(owner,n));
 const env={SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,PATH:path.join(process.env.SYSTEMROOT,'System32'),USERPROFILE:path.join(owner,'home'),HOME:path.join(owner,'home'),TEMP:path.join(owner,'tmp'),TMP:path.join(owner,'tmp'),UV_CACHE_DIR:path.join(owner,'cache'),UV_NATIVE_TLS:'true',UV_NO_CONFIG:'true'};
 const origin=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python');chain(origin);
 for(const f of base.files){const src=path.join(origin,f.name);chain(src);const b=fs.readFileSync(src);if(sha(b)!==f.sha256)throw Error('BASE_HASH:'+f.name);const dest=path.join(owner,'runtime',f.name);mkdir(path.dirname(dest));fs.writeFileSync(dest,b);}
 check(path.join(owner,'runtime'),base.files);
 fs.writeFileSync(path.join(owner,'requirements.in'),'graphifyy==0.9.101\n');
 const lock=path.join(owner,'resolved.lock');
 run(uv,['pip','compile',path.join(owner,'requirements.in'),'--python-version','3.12.14','--python-platform','windows','--only-binary',':all:','--generate-hashes','--no-header','--output-file',lock],owner,env,path.join(owner,'resolve.json'));
 const resolved=fs.readFileSync(lock,'utf8');const versions=[...resolved.matchAll(/^([a-zA-Z0-9_-]+)==([^\s\\]+)/gm)].map(m=>({name:m[1],version:m[2]}));
 const wheels=[];
 for(const d of versions){
  const res=await fetch(`https://pypi.org/pypi/${d.name}/${d.version}/json`,{signal:AbortSignal.timeout(60000)});if(!res.ok)throw Error('PYPI_METADATA:'+d.name);const meta=await res.json();
  const candidates=meta.urls.filter(u=>u.packagetype==='bdist_wheel'&&!u.yanked&&(/-py3-none-any.whl$/.test(u.filename)||(/-(win_amd64)\.whl$/.test(u.filename)&&(/-cp312-cp312-/.test(u.filename)||/-cp3(8|9|10|11|12)-abi3-/.test(u.filename)))));
  if(candidates.length!==1)throw Error('WHEEL_SELECTION:'+d.name+':'+candidates.map(u=>u.filename));const w=candidates[0];
  if(d.name==='graphifyy'&&w.digests.sha256!=='be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c')throw Error('GRAPHIFY_PIN');
  if(!fs.existsSync(path.join(owner,'wheels',w.filename))||sha(fs.readFileSync(path.join(owner,'wheels',w.filename)))!==w.digests.sha256)await download(w.url,path.join(owner,'wheels',w.filename),w.digests.sha256);wheels.push({...d,filename:w.filename,sha256:w.digests.sha256,url:w.url,license:meta.info.license_expression||meta.info.license});
 }
 fs.writeFileSync(path.join(here,'requirements.lock'),wheels.map(w=>`${w.name}==${w.version} --hash=sha256:${w.sha256}`).join('\n')+'\n');
 run(uv,['pip','install','--python',path.join(owner,'runtime/python.exe'),'--no-deps','--no-index','--no-config','--no-cache','--only-binary',':all:','--target',path.join(owner,'packages'),...wheels.map(w=>path.join(owner,'wheels',w.filename))],owner,env,path.join(owner,'install.json'));
 const packages=inventory(path.join(owner,'packages'));const runtime=inventory(path.join(owner,'runtime'));
 const modules=['cli','cluster','__main__','llm','detect','extract','export','paths'].map(n=>({name:'graphify/'+n+'.py',sha256:sha(fs.readFileSync(path.join(owner,'packages/graphify',n+'.py')))}));
 const notices=packages.filter(p=>/dist-info\/(licenses\/|LICENSE|NOTICE|COPYING|METADATA)/i.test(p.name));
 const git='C:/Program Files/Git/cmd/git.exe';chain(git);
 save(assembly,{schemaVersion:1,tool:'graphifyy',version:'0.9.101',created:new Date().toISOString(),owner,pythonVersion:'3.12.14',baseCount:base.files.length,uv:{path:uv,sha256:base.uvSha256},git:{path:git,sha256:sha(fs.readFileSync(git)),version:run(git,['--version'],owner,env)},runtime,packages,wheels,criticalModules:modules,notices,policy:'independent owned copies; binary wheels only; no extras; no site; no bytecode'});
 save(path.join(here,'provision-receipt.json'),{owner,wheels:wheels.length,runtime:runtime.length,packages:packages.length,inputs:auditInputs()});
 console.log(JSON.stringify({owner,wheels:wheels.length,runtime:runtime.length,packages:packages.length}));
}
async function main(){if(mode==='provision')return await provision();const m=json(assembly);check(path.join(m.owner,'runtime'),m.runtime);check(path.join(m.owner,'packages'),m.packages);if(mode==='run'||mode==='verify'){const output=path.resolve(arg('output')||path.join(here,'runs','run-'+crypto.randomUUID()));if(mode==='run'){if(fs.existsSync(output))throw Error('OUTPUT_REUSED');mkdir(output);save(path.join(output,'inputs-before.json'),auditInputs());run(m.uv.path,['run','--offline','--no-project','--no-config','--no-cache','--python',path.join(m.owner,'runtime/python.exe'),'--',path.join(m.owner,'runtime/python.exe'),'-I','-S','-B','-X','utf8',path.join(here,'fixtures.py'),output,assembly,...(arg('case')?['--case='+arg('case')]:[])],m.owner,{SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,PATH:process.env.PATH,TEMP:path.join(m.owner,'tmp'),TMP:path.join(m.owner,'tmp'),UV_CACHE_DIR:path.join(m.owner,'cache')},path.join(output,'matrix-command.json'));save(path.join(output,'inputs-after.json'),auditInputs());console.log(output);}else{console.log(run(path.join(m.owner,'runtime/python.exe'),['-I','-S','-B','-X','utf8',path.join(here,'verify.py'),output,assembly,...(arg('case')?['--case='+arg('case')]:[])],m.owner,{SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,TEMP:path.join(m.owner,'tmp'),TMP:path.join(m.owner,'tmp')},path.join(output,'verify-command.json')));}return;}throw Error('MODE_REQUIRED');}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});


