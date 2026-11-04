import assert from 'node:assert/strict'
import {readFile,readdir,lstat,writeFile} from 'node:fs/promises'
import {resolve,join,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'../../../../..'), execute=promisify(execFile),sha=b=>createHash('sha256').update(b).digest('hex'), require=createRequire(join(repository,'package.json'))
const {helpResourcePins}=await import(pathToFileURL(join(repository,'src/adapters/bmad/help-manifest.ts')).href)
const q=join(repository,'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-actualisation'),pkg=join(repository,'dist/external-refresh-reviewed/win-unpacked'),asar=join(pkg,'resources/app.asar'),extract=require('@electron/asar').extractFile
const result={at:new Date().toISOString(),baseline:'bd4b6ea95b42d9abae9f7de488c77d0487a32d96',resources:[],protected:[],compiled:[],runtimeFiles:0,limitations:['Not installation, human acceptance, G2/G4/G5 or a proof of guaranteed watcher delivery.','Parent independent source/package linkage audit; test cases verified separately.']}
const head=(await execute('git',['rev-parse','HEAD'],{cwd:repository})).stdout.trim();assert.equal(head,result.baseline,'no unexpected commit while implementation pending')
for(const directory of [join(repository,'resources/bmad-help'),join(pkg,'resources/bmad-help')]){
 assert.deepEqual((await readdir(directory)).sort(),Object.keys(helpResourcePins).sort(),'exact resource inventory')
 for(const [name,pin]of Object.entries(helpResourcePins)){const path=join(directory,name),info=await lstat(path);assert.ok(info.isFile()&&!info.isSymbolicLink()&&info.nlink===1);const actual=sha(await readFile(path));assert.equal(actual,pin,name);result.resources.push({directory,name,pin,actual})}
}
const baseline=JSON.parse(await readFile(join(repository,'_bmad-output/initiative-madness/.working/refresh25-protected-baseline.json'),'utf8'))
for(const item of baseline.files){assert.equal(sha(await readFile(join(repository,item.path))),item.sha256,item.path+' protected');result.protected.push(item)}
const runtime=JSON.parse(await readFile(join(repository,'resources/bmad-help/runtime.json'),'utf8')),origin=join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/python')
for(const item of runtime.files){assert.equal(sha(await readFile(join(origin,item.name))),item.sha256,item.name);result.runtimeFiles++}assert.equal(result.runtimeFiles,735)
async function walk(path){const entries=await readdir(path,{withFileTypes:true}),list=[];for(const entry of entries){assert.ok(!entry.isSymbolicLink());const child=join(path,entry.name);list.push(...entry.isDirectory()?await walk(child):[child])}return list}
for(const path of await walk(join(repository,'out'))){const name=relative(repository,path),source=await readFile(path),packaged=extract(asar,name);assert.equal(sha(packaged),sha(source),name+' compiled package bytes');result.compiled.push({path:name,sha256:sha(source)})}
const lock=JSON.parse(await readFile(join(repository,'package-lock.json'),'utf8')),metadata=JSON.parse(await readFile(join(repository,'package.json'),'utf8')),prior=JSON.parse((await execute('git',['show',result.baseline+':package-lock.json'],{cwd:repository,maxBuffer:8*1024*1024})).stdout)
assert.equal(metadata.version,'0.2.9');assert.equal(lock.version,metadata.version);assert.equal(lock.packages[''].version,metadata.version);const masked=structuredClone(lock);masked.version=prior.version;masked.packages[''].version=prior.packages[''].version;assert.deepEqual(masked,prior,'dependency resolutions unchanged')
const embedded=JSON.parse(extract(asar,'package.json').toString('utf8'));assert.equal(embedded.version,metadata.version)
const main=extract(asar,join('out','main','index.js')).toString('utf8');for(const pin of Object.values(helpResourcePins))assert.ok(main.includes(pin),'compiled pin '+pin)
const plan=await readFile(join(repository,'_bmad-output/initiative-madness/tickets/epic-projets-bmad/tickets/story-actualiser-les-preuves-apres-des-changements-externes-plan.md'),'utf8'),approval=JSON.parse(await readFile(join(repository,'_bmad-output/initiative-madness/.working/refresh25-plan-approval.json'),'utf8'));assert.equal(sha(plan.replaceAll('\r\n','\n').match(/<frozen-after-approval[^>]*>[\s\S]*?<\/frozen-after-approval>/)[0]),approval.frozenSha256LF)
result.asar={path:asar,sha256:sha(await readFile(asar))};const installer=join(repository,'dist/external-refresh-reviewed/Madness-0.2.9-x64-setup.exe');result.installer={path:installer,sha256:sha(await readFile(installer))};result.version=metadata.version
await writeFile(join(q,'parent-audit-001.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({resources:result.resources.length,protected:result.protected.length,compiled:result.compiled.length,runtimeFiles:result.runtimeFiles,version:result.version,asar:result.asar,installer:result.installer}))
