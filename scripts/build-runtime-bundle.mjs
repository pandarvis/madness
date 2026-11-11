// Packs the local Graphify assembly and uv into the zip published as a GitHub prerelease,
// then pins it in resources/runtime-bundle.json. Rerun after every change to assembly.json.
// Usage: node scripts/build-runtime-bundle.mjs --tag=runtime-bundle-1 --out=<folder>
import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {join,resolve} from 'node:path'

const arg=name=>process.argv.find(value=>value.startsWith('--'+name+'='))?.slice(name.length+3)
const tag=arg('tag'),out=arg('out')
if(!tag||!out)throw Error('Usage: --tag=runtime-bundle-N --out=<folder>')
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
const name='madness-'+tag+'.zip',folder=resolve(out),archive=join(folder,name)
await mkdir(folder,{recursive:true})
execFileSync(join(process.env.SystemRoot,'System32/tar.exe'),['-a','-cf',archive,'-C',resolve('resources'),'graphify/assembly','runtime-tools/uv.exe'],{stdio:'inherit'})
const bytes=await readFile(archive),uv=await readFile('resources/runtime-tools/uv.exe')
const manifest={url:'https://github.com/pandarvis/madness/releases/download/'+tag+'/'+name,sha256:sha(bytes),bytes:bytes.length,uvSha256:sha(uv),assemblySha256:sha(await readFile('resources/graphify/assembly.json'))}
await writeFile('resources/runtime-bundle.json',JSON.stringify(manifest,null,2)+'\n')
console.log(JSON.stringify({archive,...manifest}))
