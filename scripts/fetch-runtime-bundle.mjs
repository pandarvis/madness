// Fetches the runtime bundle that git does not carry: Graphify's closed assembly and the pinned uv.
// Runs after `npm ci`. Does nothing when the local copy already matches every pin.
import {createHash} from 'node:crypto'
import {mkdir,readFile,readdir,rename,rm,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {dirname,join,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const resources=join(root,'resources')
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
const bundle=JSON.parse(await readFile(join(resources,'runtime-bundle.json'),'utf8'))
const assembly=JSON.parse(await readFile(join(resources,'graphify/assembly.json'),'utf8'))

async function listFiles(folder){
  const names=[]
  const visit=async path=>{for(const entry of await readdir(path,{withFileTypes:true})){const child=join(path,entry.name);if(entry.isDirectory())await visit(child);else names.push(relative(folder,child).replaceAll('\\','/'))}}
  await visit(folder)
  return names
}
async function matches(folder){
  try{
    for(const part of ['runtime','packages']){
      const expected=new Map(assembly[part].map(entry=>[entry.name,entry.sha256]))
      const actual=await listFiles(join(folder,'graphify/assembly',part))
      if(actual.length!==expected.size)return false
      for(const name of actual)if(expected.get(name)!==sha(await readFile(join(folder,'graphify/assembly',part,name))))return false
    }
    return sha(await readFile(join(folder,'runtime-tools/uv.exe')))===bundle.uvSha256
  }catch(error){if(error.code==='ENOENT')return false;throw error}
}

if(process.platform!=='win32'||process.env.MADNESS_SKIP_RUNTIME_BUNDLE){console.log('runtime bundle: skipped');process.exit(0)}
if(await matches(resources)){console.log('runtime bundle: already up to date');process.exit(0)}

console.log('runtime bundle: downloading '+Math.round(bundle.bytes/1048576)+' MB')
let archive
try{
  const response=await fetch(bundle.url)
  if(!response.ok)throw Error('HTTP '+response.status)
  archive=Buffer.from(await response.arrayBuffer())
}catch(error){
  // Offline installs stay possible: only the BMad agents and the Graph tab need the bundle.
  console.warn('runtime bundle: download failed ('+error.message+'). BMad agents and the Graph tab stay unavailable until `node scripts/fetch-runtime-bundle.mjs` succeeds.')
  process.exit(0)
}
if(sha(archive)!==bundle.sha256)throw Error('RUNTIME_BUNDLE_CHANGED')

const staging=join(resources,'.rb')
await rm(staging,{recursive:true,force:true})
await mkdir(staging)
try{
  await writeFile(join(staging,'bundle.zip'),archive)
  execFileSync(join(process.env.SystemRoot,'System32/tar.exe'),['-xf','bundle.zip'],{cwd:staging,stdio:'inherit'})
  await rm(join(staging,'bundle.zip'))
  if(!await matches(staging))throw Error('RUNTIME_BUNDLE_MISMATCH: resources/runtime-bundle.json does not match resources/graphify/assembly.json')
  await rm(join(resources,'graphify/assembly'),{recursive:true,force:true})
  await rm(join(resources,'runtime-tools'),{recursive:true,force:true})
  await rename(join(staging,'graphify/assembly'),join(resources,'graphify/assembly'))
  await rename(join(staging,'runtime-tools'),join(resources,'runtime-tools'))
}finally{
  await rm(staging,{recursive:true,force:true})
}
console.log('runtime bundle: installed')
