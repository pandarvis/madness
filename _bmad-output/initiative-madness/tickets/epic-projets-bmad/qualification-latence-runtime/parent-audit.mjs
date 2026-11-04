import assert from 'node:assert/strict'
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises'
import {resolve,join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {helpResourcePins} from '../../../../../src/adapters/bmad/help-manifest.ts'
const execute=promisify(execFile),q=dirname(fileURLToPath(import.meta.url)),repository=resolve(q,'../../../../..'),packageRoot=join(repository,'dist/runtime-guard-reviewed/win-unpacked'),sha=b=>createHash('sha256').update(b).digest('hex'),baseline='eaecc68b3a232f46d05c69ba14d9158e49c5efac'
const result={at:new Date().toISOString(),baseline,resources:[],protected:[],runtimeFiles:0,packageRoot,whitespaceCheckProfile:'Git defaults with cr-at-eol for the byte-pinned -text native resource; no global config or qualified byte changed'}
for(const root of [join(repository,'resources/bmad-help'),join(packageRoot,'resources/bmad-help')]){
 assert.deepEqual((await readdir(root)).sort(),Object.keys(helpResourcePins).sort(),'complete resource inventory')
 for(const [name,pin] of Object.entries(helpResourcePins)){const path=join(root,name),s=await lstat(path);assert.ok(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1,name+' plain file');const actual=sha(await readFile(path));assert.equal(actual,pin);result.resources.push({root,name,pin,actual,links:s.nlink})}
}
for(const path of ['resources/bmad-help/runtime.json','resources/bmad-help/runtime_guard.py']){const before=(await execute('git',['show',baseline+':'+path],{cwd:repository,encoding:'buffer',maxBuffer:8*1024*1024})).stdout,after=await readFile(join(repository,path));assert.equal(sha(before),sha(after));result.protected.push({path,before:sha(before),after:sha(after)})}
const manifest=JSON.parse(await readFile(join(repository,'resources/bmad-help/runtime.json'),'utf8')),origin=join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/python');for(const record of manifest.files){assert.equal(sha(await readFile(join(origin,record.name))),record.sha256);result.runtimeFiles++}assert.equal(result.runtimeFiles,735)
const {stdout:diff}=await execute('git',['-c','core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol','diff','--check','--','resources/bmad-help/preflight.ps1','src/adapters/bmad/help-manifest.ts','tests/bmad-help-supervision.test.mjs','package.json','package-lock.json'],{cwd:repository});assert.equal(diff,'')
const lock=JSON.parse(await readFile(join(repository,'package-lock.json'),'utf8'));assert.equal(lock.version,'0.2.8');assert.equal(lock.packages[''].version,'0.2.8');const oldLock=JSON.parse((await execute('git',['show',baseline+':package-lock.json'],{cwd:repository,maxBuffer:8*1024*1024})).stdout);const masked=structuredClone(lock);masked.version=oldLock.version;masked.packages[''].version=oldLock.packages[''].version;assert.deepEqual(masked,oldLock,'no dependency or resolution changes')
for(const file of ['resources/app.asar','Madness.exe'])result[file]={sha256:sha(await readFile(join(packageRoot,file)))}
const installer=join(repository,'dist/runtime-guard-reviewed/Madness-0.2.8-x64-setup.exe');result.installer={path:installer,sha256:sha(await readFile(installer))};await writeFile(join(q,'parent-audit-001.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({resources:result.resources.length,runtimeFiles:result.runtimeFiles,protected:result.protected,asar:result['resources/app.asar'],installer:result.installer}))
