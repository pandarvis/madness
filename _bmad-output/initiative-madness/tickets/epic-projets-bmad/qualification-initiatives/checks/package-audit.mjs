import assert from 'node:assert/strict'
import {readFile,readdir,lstat,realpath,writeFile} from 'node:fs/promises'
import {resolve,join,relative,sep} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
const sha=b=>createHash('sha256').update(b).digest('hex'),root=await realpath('.'),dist=await realpath(join(root,'dist')),directory=await realpath(resolve(process.argv[2])),proofPath=resolve(process.argv[3])
assert.ok(directory.toLowerCase().startsWith(dist.toLowerCase()+sep),'CANDIDATE_OUTSIDE_DIST')
const q=join(root,'_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-initiatives'),asar=createRequire(import.meta.url)('@electron/asar'),archive=join(directory,'win-unpacked/resources/app.asar')
const {createManifest}=await import(pathToFileURL(join(root,'scripts/release/manifest.mjs')).href),{helpResourcePins}=await import(pathToFileURL(join(root,'src/adapters/bmad/help-manifest.ts')).href)
const proof=JSON.parse(await readFile(proofPath,'utf8'));assert.equal(proof.schemaVersion,1);assert.equal(proof.status,'passed');assert.equal(proof.cleanup,true);assert.equal(proof.checks.length,8);assert.equal(proof.closures.length,2);assert.deepEqual(Object.keys(proof.inputs).sort(),['out/main/index.js','out/preload/index.js','package.json',...Object.keys(helpResourcePins).map(n=>'resources/bmad-help/'+n)].sort())
for(const close of proof.closures){assert.equal(close.cleanupSafe,true);assert.equal(close.mainGone,true);assert.equal(close.childrenGone,true);assert.equal(close.closeError,false);assert.equal(close.observation.afterHookOnly,true);assert.equal(close.observation.network,0);assert.equal(close.observation.appServerAttempts,0)}
assert.equal(await lstat(proof.root).then(()=>true,e=>e.code==='ENOENT'?false:Promise.reject(e)),false,'NATIVE_FIXTURE_NOT_CLEANED')
for(const [path,hash]of Object.entries(proof.inputs))assert.equal(sha(await readFile(join(root,path))),hash,'NATIVE_INPUT_CHANGED '+path)
async function walk(path){const info=await lstat(path);assert.equal(info.isSymbolicLink(),false);if(info.isFile())return [path];assert.ok(info.isDirectory());return (await Promise.all((await readdir(path)).sort().map(n=>walk(join(path,n))))).flat()}
const outputs=[]
for(const path of await walk(join(root,'out'))){const rel=relative(root,path).replaceAll('\\','/'),bytes=await readFile(path),packed=asar.extractFile(archive,relative(root,path));assert.ok(bytes.equals(packed),'ASAR_OUTPUT_MISMATCH '+rel);outputs.push({path:rel,sha256:sha(bytes),bytes:bytes.length})}
const helperRoot=join(directory,'win-unpacked/resources/bmad-help'),entries=(await readdir(helperRoot)).sort(),pins=Object.keys(helpResourcePins).sort();assert.deepEqual(entries,pins)
const helpers=[]
for(const name of pins){const path=join(helperRoot,name),stat=await lstat(path);assert.ok(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1,'UNSAFE_HELP_RESOURCE '+name);assert.equal(sha(await readFile(join(root,'resources/bmad-help',name))),helpResourcePins[name]);assert.equal(sha(await readFile(path)),helpResourcePins[name]);helpers.push({name,sha256:helpResourcePins[name]})}
assert.ok(!asar.listPackage(archive).some(p=>/^\/?(?:tests|_bmad-output|\.working|\.agents)(?:\/|$)/.test(p.replaceAll('\\','/'))),'NONSHIPPING_FILES_PACKAGED')
const manifest=await createManifest({repository:root,directory});await writeFile(join(directory,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n')
const report={schemaVersion:1,status:'passed',version:manifest.version,candidate:relative(root,directory).replaceAll('\\','/'),nativeProof:relative(root,proofPath).replaceAll('\\','/'),nativeInputCount:Object.keys(proof.inputs).length,outputs,helpers,artifacts:manifest.artifacts,limits:['Le reçu Main porte sur le candidat compilé exact ; comparaison des mêmes octets au paquet, pas une nouvelle exécution personnelle installée.','Réseau/app-server observés après hook uniquement. Aucune qualification fournisseur/2.2M14 ni signature/publication/installation déduite.']};await writeFile(join(q,'package-audit.json'),JSON.stringify(report,null,2)+'\n');await writeFile(join(q,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({status:report.status,version:report.version,nativeInputs:report.nativeInputCount,outputs:outputs.length,helpers:helpers.length,artifacts:report.artifacts}))
