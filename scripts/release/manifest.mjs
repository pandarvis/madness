import {readFile, readdir, lstat, writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {dirname, join, relative, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const require=createRequire(import.meta.url)
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex')
const portable=path=>path.replaceAll('\\','/')
const exact=version=>typeof version==='string'&&/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(version)

async function fingerprint(root,path){
 const info=await lstat(path)
 if(!info.isFile()||info.isSymbolicLink())throw Error('UNSAFE_RELEASE_INPUT')
 const bytes=await readFile(path)
 return {path:portable(relative(root,path)),bytes:bytes.length,sha256:sha256(bytes)}
}
async function files(root,path){
 const info=await lstat(path)
 if(info.isSymbolicLink())throw Error('UNSAFE_RELEASE_INPUT')
 if(info.isFile())return [path]
 if(!info.isDirectory())throw Error('UNSAFE_RELEASE_INPUT')
 const entries=await readdir(path)
 return (await Promise.all(entries.sort().map(name=>files(root,join(path,name))))).flat()
}

/** Manifeste stable : ni date de génération, ni chemin absolu, ni environnement. */
export async function createManifest({repository,directory}){
 repository=resolve(repository);directory=resolve(directory)
 const pkg=JSON.parse(await readFile(join(repository,'package.json'),'utf8'))
 const lock=JSON.parse(await readFile(join(repository,'package-lock.json'),'utf8'))
 const config=await readFile(join(repository,'electron-builder.yml'),'utf8')
 for(const [key,value] of [['appId','fr.madness.desktop'],['productName','Madness'],['executableName','Madness'],['deleteAppDataOnUninstall','false']]){
  if(!new RegExp('^\\s*'+key+':\\s*'+value.replaceAll('.','\\.')+'\\s*$','m').test(config))throw Error('IDENTITY_MISMATCH')
 }
 if(pkg.name!=='madness'||!exact(pkg.version))throw Error('IDENTITY_MISMATCH')
 if(lock.lockfileVersion!==3||lock.name!==pkg.name||lock.version!==pkg.version||lock.packages?.['']?.version!==pkg.version)throw Error('LOCK_MISMATCH')
 const versions={}
 for(const section of ['dependencies','devDependencies']){
  if(JSON.stringify(lock.packages[''][section]??{})!==JSON.stringify(pkg[section]??{}))throw Error('LOCK_MISMATCH')
  for(const [name,version]of Object.entries(pkg[section]??{})){
   if(!exact(version)||lock.packages['node_modules/'+name]?.version!==version)throw Error('LOCK_MISMATCH: '+name)
   versions[name]=version
  }
 }
 const asarPath=join(directory,'win-unpacked/resources/app.asar')
 const embedded=JSON.parse(require('@electron/asar').extractFile(asarPath,'package.json').toString('utf8'))
 if(embedded.name!==pkg.name||embedded.version!==pkg.version||JSON.stringify(embedded.dependencies??{})!==JSON.stringify(pkg.dependencies??{}))throw Error('PACKAGED_VERSION_MISMATCH')
 const roots=['package.json','package-lock.json','electron-builder.yml','src','resources']
 for(const name of ['electron.vite.config.ts','tsconfig.json','tsconfig.node.json','tsconfig.web.json','scripts/release','scripts/qualification','tests']){
  try{await lstat(join(repository,name));roots.push(name)}catch(error){if(error.code!=='ENOENT')throw error}
 }
 const inputs=await Promise.all((await Promise.all(roots.map(name=>files(repository,join(repository,name))))).flat().sort().map(path=>fingerprint(repository,path)))
 const installer=join(directory,`Madness-${pkg.version}-x64-setup.exe`)
 const runner=join(directory,'win-unpacked/resources/bmad-script-runner.py')
 if(!Buffer.from(await readFile(runner)).equals(await readFile(join(repository,'resources/bmad-script-runner.py'))))throw Error('RESOURCE_MISMATCH')
 const artifacts=await Promise.all([installer,asarPath,runner].map(path=>fingerprint(directory,path)))
 const profile='bmad-init/payload-v1.json.gz'
 const sourcePath='resources/'+profile
 const sourceProfile=inputs.find(input=>input.path===sourcePath)
 const builder=require('js-yaml').load(config)
 const mappings=[builder.extraResources,builder.win?.extraResources].flatMap(value=>value??[])
 const configured=mappings.some(mapping=>mapping?.from===sourcePath&&mapping.to===profile)
 if(sourceProfile||configured){
  const mismatch=()=>Error('RESOURCE_MISMATCH: '+profile)
  if(!sourceProfile||!configured)throw mismatch()
  const outputProfile=join(directory,'win-unpacked/resources',profile)
  let packaged
  try{
   for(let parent=dirname(outputProfile);;parent=dirname(parent)){
    if(!(await lstat(parent)).isDirectory())throw mismatch()
    if(parent===directory)break
   }
   const stat=await lstat(outputProfile)
   if(!stat.isFile()||stat.nlink!==1)throw mismatch()
   packaged=await fingerprint(directory,outputProfile)
  }catch(error){
   if(error.code==='ENOENT')throw mismatch()
   throw error
  }
  if(packaged.bytes!==sourceProfile.bytes||packaged.sha256!==sourceProfile.sha256)throw mismatch()
  artifacts.push(packaged)
 }
 return {schemaVersion:1,identity:{name:'madness',appId:'fr.madness.desktop',productName:'Madness',executableName:'Madness'},version:pkg.version,versions:Object.fromEntries(Object.entries(versions).sort(([a],[b])=>a.localeCompare(b))),inputs,artifacts,limits:['Empreintes de cette construction ; aucune identité bit à bit entre deux reconstructions NSIS horodatées.','Ce manifeste ne prouve ni signature, ni publication, ni installation, ni connectivité des fournisseurs.']}
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
 const option=name=>process.argv.find(v=>v.startsWith('--'+name+'='))?.slice(name.length+3)
 const directory=resolve(option('directory')??join(repository,'dist/maintenance-pilot'))
 const manifest=await createManifest({repository,directory})
 const output=resolve(option('output')??join(directory,'release-manifest.json'))
 await writeFile(output,JSON.stringify(manifest,null,2)+'\n')
 console.log(JSON.stringify({version:manifest.version,inputs:manifest.inputs.length,artifacts:manifest.artifacts,output}))
}
