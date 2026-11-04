import assert from 'node:assert/strict'
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {helpResourcePins} from '../../src/adapters/bmad/help-manifest.ts'
const require=createRequire(import.meta.url),asar=require('@electron/asar'),candidate=resolve('dist/catalog-reviewed/win-unpacked'),archive=join(candidate,'resources/app.asar'),sha=b=>createHash('sha256').update(b).digest('hex'),files={},resources={}
async function visit(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const name=folder+'/'+entry.name;if(entry.isDirectory())await visit(name);else{const bytes=await readFile(name);assert.deepEqual(asar.extractFile(archive,name.replaceAll('/','\\')),bytes);files[name]=sha(bytes)}}}
await visit('out')
assert.deepEqual((await readdir(join(candidate,'resources/bmad-help'))).sort(),Object.keys(helpResourcePins).sort())
for(const [name,pin] of Object.entries(helpResourcePins)){const source=await readFile(join('resources/bmad-help',name)),packaged=await readFile(join(candidate,'resources/bmad-help',name));assert.equal(sha(source),pin);assert.deepEqual(packaged,source);resources[name]=pin}
const runtime=JSON.parse(await readFile('resources/bmad-help/runtime.json','utf8'));assert.equal(runtime.files.length,735)
const packageJson=JSON.parse(asar.extractFile(archive,'package.json'));assert.equal(packageJson.version,'0.2.10')
const output=resolve('_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-catalogue/final-manifest.json'),manifest={schemaVersion:1,createdAt:new Date().toISOString(),status:'package-audit-passed',candidate,version:packageJson.version,asarSha256:sha(await readFile(archive)),executableSha256:sha(await readFile(join(candidate,'Madness.exe'))),installerSha256:sha(await readFile('dist/catalog-reviewed/Madness-0.2.10-x64-setup.exe')),compiledFiles:files,resources,counts:{compiled:Object.keys(files).length,resources:Object.keys(resources).length,runtimePython:runtime.files.length},installation:false,limits:['Native/UI qualification and visual verdicts remain separate; package identity is not provider execution or human acceptance.']};await mkdir(join(output,'..'),{recursive:true});await writeFile(output,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({status:manifest.status,asarSha256:manifest.asarSha256,counts:manifest.counts}))
