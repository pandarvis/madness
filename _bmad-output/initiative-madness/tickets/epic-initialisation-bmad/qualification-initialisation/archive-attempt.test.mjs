import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {lstat, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {dirname, join, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAttempt} from './archive-attempt.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('archives unique wrapper/config bytes and executes the earlier snapshot after source changes',async()=>{
  const owned=join(here,'.q1-check-'+randomUUID()),marker=randomUUID();
  await mkdir(owned);await writeFile(join(owned,'.ownership'),marker,'utf8');
  let receipt;
  try{
    const wrapper=join(owned,'fake-wrapper.mjs'),guard=join(owned,'guard.json'),root=join(owned,'archives');
    const source="import {readFileSync} from 'node:fs';globalThis.archiveResult={wrapper:'first',config:JSON.parse(readFileSync(process.env.ARCHIVE_CHECK_CONFIG,'utf8')).value};\n";
    await writeFile(wrapper,source,'utf8');await writeFile(guard,'{"value":"first"}\n','utf8');
    const inputs={root,label:'same-label',exe:process.execPath,cwd:owned,env:{},wrapper:{source:wrapper,argIndex:1,url:true},guard:{source:guard,envKey:'ARCHIVE_CHECK_CONFIG'},toolchain:{helpers:[{path:'fake-wrapper.mjs',sha256:sha(source)}]}};
    const first=await archiveAttempt({...inputs,args:['--import','mutable-wrapper','--eval','process.stdout.write(JSON.stringify(globalThis.archiveResult))']});
    const originalManifest=await readFile(first.manifestPath,'utf8'),manifest=JSON.parse(originalManifest);
    assert.equal(manifest.wrapper.sha256,sha(source));assert.equal(manifest.guard.sha256,sha('{"value":"first"}\n'));
    assert.equal(first.manifestSha256,sha(originalManifest));
    const changed=source.replace("wrapper:'first'","wrapper:'second'");await writeFile(wrapper,changed,'utf8');await writeFile(guard,'{"value":"second"}\n','utf8');
    const second=await archiveAttempt({...inputs,args:['-X','utf8','-B','-I','-S','mutable-wrapper','mutable-config'],wrapper:{source:wrapper,argIndex:5},guard:{source:guard,argIndex:6},toolchain:{helpers:[{path:'fake-wrapper.mjs',sha256:sha(changed)}]}});
    assert.notEqual(first.directory,second.directory);assert.equal(await readFile(first.manifestPath,'utf8'),originalManifest);
    assert.equal(await readFile(manifest.wrapper.path,'utf8'),source);assert.equal(await readFile(manifest.guard.path,'utf8'),'{"value":"first"}\n');
    const secondManifest=JSON.parse(await readFile(second.manifestPath,'utf8'));
    assert.equal(second.args[5],secondManifest.wrapper.path);assert.equal(second.args[6],secondManifest.guard.path);
    const child=spawnSync(process.execPath,first.args,{cwd:owned,env:first.env,windowsHide:true,shell:false,encoding:'utf8',timeout:5000});
    assert.ifError(child.error);assert.equal(child.status,0,child.stderr);assert.equal(child.signal,null);assert.deepEqual(JSON.parse(child.stdout),{wrapper:'first',config:'first'});
    receipt={test:'one fake Node child; two unique captures; no actual tool invocation',status:'passed',fakeChildren:1,childExitCode:child.status,childSignal:child.signal,manifestHashes:[first.manifestSha256,second.manifestSha256],earlierSnapshotUnchanged:true,nodeURLAndConfigEnvBinding:true,setupArgumentBinding:true,sourceMutationDoesNotChangeArchivedExecution:true};
  }finally{
    const distance=relative(here,owned);assert.ok(distance.startsWith('.q1-check-')&&!distance.includes(sep));assert.ok(!(await lstat(owned)).isSymbolicLink());assert.equal(await readFile(join(owned,'.ownership'),'utf8'),marker);await rm(owned,{recursive:true});
  }
  await assert.rejects(lstat(owned),{code:'ENOENT'});
  await writeFile(join(here,'q1-patch','check.json'),JSON.stringify({...receipt,ownedCopiesRemoved:true},null,2)+'\n','utf8');
});
