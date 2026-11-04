import {readFile,writeFile,mkdir,lstat,readdir,open,unlink,rmdir} from 'node:fs/promises'
import {resolve,join,dirname} from 'node:path'
import {createHash} from 'node:crypto'
const sha=b=>createHash('sha256').update(b).digest('hex')
const source=resolve(process.argv.find(a=>a.startsWith('--source='))?.slice(9)??'C:/Users/UP60066553/AppData/Local/Temp/mg41-9NPKXq')
const base='_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/'
const original=JSON.parse(await readFile(base+'assembly-manifest.json','utf8'))
const target=resolve('resources/graphify/assembly')
// Provisioning-only launchers embed the temporary interpreter path; direct_url records embed the wheel staging path. Neither is used by -I -S -m/runpy. Code, native libraries, RECORD and notices remain exact.
const omitted=original.packages.filter(e=>e.name.startsWith('bin/')||e.name.endsWith('/direct_url.json'))
const shipped=original.packages.filter(e=>!omitted.includes(e))
async function safe(p){for(let q=resolve(p);;q=dirname(q)){const s=await lstat(q);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('ASSEMBLY_LINK:'+q);if(dirname(q)===q)break}const f=await open(p,'r');try{const b=await f.stat(),raw=await f.readFile(),a=await f.stat(),named=await lstat(p);if(b.ino!==a.ino||b.ino!==named.ino||b.size!==a.size||b.mtimeMs!==a.mtimeMs)throw Error('ASSEMBLY_CHANGED');return raw}finally{await f.close()}}
async function verifyTree(root,entries){const allowed=new Map(entries.map(e=>[e.name,e]));async function visit(dir,rel=''){for(const n of await readdir(dir)){const key=rel?rel+'/'+n:n,p=join(dir,n),s=await lstat(p);if(s.isSymbolicLink())throw Error('ASSEMBLY_LINK');if(s.isDirectory())await visit(p,key);else{const e=allowed.get(key);if(!e||s.nlink!==1)throw Error('ASSEMBLY_EXTRA:'+key);const b=await safe(p);if(b.length!==e.bytes||sha(b)!==e.sha256)throw Error('ASSEMBLY_CHANGED:'+key);allowed.delete(key)}}}await visit(root);if(allowed.size)throw Error('ASSEMBLY_MISSING')}
for(const part of ['runtime','packages'])await verifyTree(join(source,part),original[part])
for(const e of original.wheels){const b=await safe(join(source,'wheels',e.filename));if(sha(b)!==e.sha256)throw Error('WHEEL_CHANGED')}
for(const e of omitted){const p=join(target,'packages',e.name);try{const b=await safe(p);if(sha(b)!==e.sha256)throw Error('OMITTED_METADATA_CHANGED');await unlink(p)}catch(x){if(x.code!=='ENOENT')throw x}}
try{await rmdir(join(target,'packages/bin'))}catch(x){if(x.code!=='ENOENT')throw x}
for(const part of ['runtime','packages'])for(const e of part==='packages'?shipped:original[part]){const p=join(target,part,e.name);await mkdir(dirname(p),{recursive:true});const bytes=await safe(join(source,part,e.name));if(sha(bytes)!==e.sha256)throw Error('ASSEMBLY_CHANGED');try{await writeFile(p,bytes,{flag:'wx'})}catch(x){if(x.code!=='EEXIST'||sha(await safe(p))!==e.sha256)throw x}}
for(const part of ['runtime','packages'])await verifyTree(join(target,part),part==='packages'?shipped:original[part])
const manifest={schemaVersion:1,tool:'graphifyy',toolVersion:'0.9.101',pythonVersion:'3.12.14',wheelSha256:'be7745d4779e6f604d7412863a79e6570b8d659035d0eaf396f7ba49c3b7997c',runtime:original.runtime,sourcePackageCount:original.packages.length,omittedProvisioningMetadata:omitted,packages:shipped,wheels:original.wheels.map(({name,version,filename,sha256,license})=>({name,version,filename,sha256,license})),notices:original.notices}
await writeFile('resources/graphify/assembly.json',JSON.stringify(manifest,null,2)+'\n')
await writeFile('resources/graphify/requirements.lock',await readFile(base+'requirements.lock'))
await writeFile('resources/graphify/NOTICES.md','# Graphify local assembly\n\n'+original.wheels.map(w=>w.name+' '+w.version+' — '+w.license).join('\n')+'\n\nThe package contains the original distribution metadata and license files, inventoried in assembly.json. Python audit hooks are not an OS sandbox.\n')
console.log(JSON.stringify({runtime:original.runtime.length,sourcePackages:original.packages.length,shippedPackages:shipped.length,wheels:original.wheels.length,assemblySha256:sha(await readFile('resources/graphify/assembly.json'))}))
