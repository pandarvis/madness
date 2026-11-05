import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {lstat, mkdir, readFile, writeFile} from 'node:fs/promises';
import {basename, dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

/** Archive once, then bind the child to those bytes. No OS-level immutability/race guarantee. */
export async function archiveAttempt({root,label,exe,args,cwd,env,wrapper,guard,toolchain}){
  root=resolve(root);await mkdir(root,{recursive:true});
  for(let path=root;;path=dirname(path)){assert.ok(!(await lstat(path)).isSymbolicLink(),'archive parent is linked');if(dirname(path)===path)break;}
  const directory=join(root,randomUUID());await mkdir(directory);
  async function snapshot(source){
    const info=await lstat(source);assert.ok(info.isFile()&&!info.isSymbolicLink()&&info.nlink===1,'snapshot source is not a plain file');
    const bytes=await readFile(source),path=join(directory,basename(source));
    await writeFile(path,bytes,{flag:'wx'});
    assert.equal(sha(await readFile(path)),sha(bytes),'archive readback differs');
    return {source:resolve(source),path,bytes:bytes.length,sha256:sha(bytes)};
  }
  const archivedWrapper=await snapshot(wrapper.source),archivedGuard=await snapshot(guard.source);
  const pin=toolchain.helpers?.find(h=>h.path===basename(wrapper.source));
  if(pin)assert.equal(archivedWrapper.sha256,pin.sha256,'wrapper changed after toolchain capture');
  args=[...args];env={...env};
  args[wrapper.argIndex]=wrapper.url?pathToFileURL(archivedWrapper.path).href:archivedWrapper.path;
  if(guard.envKey)env[guard.envKey]=archivedGuard.path;else args[guard.argIndex]=archivedGuard.path;
  const manifestPath=join(directory,'manifest.json');
  const manifest=JSON.stringify({label,archivedAt:new Date().toISOString(),exe,args,cwd,env,wrapper:archivedWrapper,guard:archivedGuard,toolchain},null,2)+'\n';
  await writeFile(manifestPath,manifest,{encoding:'utf8',flag:'wx'});
  assert.equal(await readFile(manifestPath,'utf8'),manifest,'manifest readback differs');
  return {directory,manifestPath,manifestSha256:sha(manifest),args,env};
}
