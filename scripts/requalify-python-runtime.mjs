// Re-pins the closed CPython copy after the Codex primary runtime changed its binaries.
// Same 735-file scope; every pin derived from it is rewritten together so no stale pin survives.
import {readFile,writeFile,lstat} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {createHash} from 'node:crypto'
import {runtimeTreeFingerprint} from '../src/adapters/bmad/runtime.ts'

const sha=b=>createHash('sha256').update(b).digest('hex')
const arg=n=>process.argv.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)
const source=resolve(arg('source')??join(process.env.USERPROFILE??'','.cache/codex-runtimes/codex-primary-runtime/dependencies/python'))

async function replaceExact(path,before,after){
  const text=await readFile(path,'utf8')
  if(before===after)return
  const count=text.split(before).length-1
  if(count<1)throw Error('PIN_NOT_FOUND:'+path+':'+before)
  await writeFile(path,text.replaceAll(before,after))
}

const manifestPath='resources/bmad-help/runtime.json'
const manifest=JSON.parse(await readFile(manifestPath,'utf8'))
const files=[]
for(const entry of manifest.files){
  const path=join(source,entry.name),info=await lstat(path)
  if(!info.isFile()||info.isSymbolicLink())throw Error('RUNTIME_RECORD:'+entry.name)
  files.push({name:entry.name,sha256:sha(await readFile(path))})
}
const treePin=sha(files.map(f=>f.name+':'+f.sha256+'\n').join(''))
const oldTreePin=manifest.sha256
await writeFile(manifestPath,JSON.stringify({...manifest,sha256:treePin,files},null,2)+'\n')
await replaceExact('resources/bmad-help/runtime_guard.py',`TREE_PIN = '${oldTreePin}'`,`TREE_PIN = '${treePin}'`)

const helpPins='src/adapters/bmad/help-manifest.ts'
const {helpResourcePins}=await import('../src/adapters/bmad/help-manifest.ts')
for(const name of ['runtime.json','runtime_guard.py'])
  await replaceExact(helpPins,`"${name}": "${helpResourcePins[name]}"`,`"${name}": "${sha(await readFile('resources/bmad-help/'+name))}"`)

const runtimeSource=await readFile('src/adapters/bmad/runtime.ts','utf8')
const oldFingerprint=/const runtimeFingerprint = '([0-9a-f]{64})'/.exec(runtimeSource)?.[1]
if(!oldFingerprint)throw Error('RUNTIME_PIN_NOT_FOUND')
const fingerprint=await runtimeTreeFingerprint(source)
for(const path of ['src/adapters/bmad/runtime.ts','tests/dialogue-runtime.test.mjs'])await replaceExact(path,oldFingerprint,fingerprint)

console.log(JSON.stringify({source,files:files.length,treePin,runtimeFingerprint:fingerprint}))
