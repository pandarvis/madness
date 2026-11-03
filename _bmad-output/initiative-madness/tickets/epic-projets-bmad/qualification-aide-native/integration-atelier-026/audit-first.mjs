import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=process.cwd(),destination=resolve(process.argv[2]),require=createRequire(join(root,'package.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const sourceManifest='_bmad-output/initiative-madness/ux-madness/qualification-navigation-tooltip/release-manifest.json';
const manifest=JSON.parse(await readFile(join(root,sourceManifest),'utf8'));
const inputs=[]; for(const input of manifest.inputs){const b=await readFile(join(root,input.path)); inputs.push({path:input.path,matches:b.length===input.bytes&&hash(b)===input.sha256});}
const installed='C:/Users/UP60066553/AppData/Local/Programs/Madness/resources',asarPath=join(installed,'app.asar'),asar=require('@electron/asar');
const bytes=await readFile(asarPath),expected=manifest.artifacts.find(a=>a.path.endsWith('/app.asar'));
const resources=[];for(const name of (await readdir(join(root,'resources/bmad-help'))).sort()){const b=await readFile(join(root,'resources/bmad-help',name)),p=await readFile(join(installed,'bmad-help',name));resources.push({path:'bmad-help/'+name,matches:b.equals(p)});}
async function walk(dir,prefix=''){const result=[];for(const item of await readdir(dir,{withFileTypes:true})){const path=prefix?prefix+'/'+item.name:item.name;if(item.isDirectory())result.push(...await walk(join(dir,item.name),path));else result.push(path);}return result;}
const compiled=[];for(const file of await walk(join(root,'out'))){let actual;try{actual=asar.extractFile(asarPath,'out/'+file);}catch{actual=null;}compiled.push({path:'out/'+file,matches:actual!==null&&(await readFile(join(root,'out',file))).equals(actual)});}
const report={schemaVersion:1,action:'post-merge-source-and-installed-artifact-audit',measuredAt:new Date().toISOString(),manifest:sourceManifest,version:manifest.version,asarSha256:hash(bytes),asarMatches:bytes.length===expected.bytes&&hash(bytes)===expected.sha256,sourceInputs:inputs,nativeResources:resources,compiledFiles:compiled,limits:['No model, provider, browser, OAuth or personal-profile mutation.','Compilation equality and source hashes do not close native M14.']};
report.passed=report.asarMatches&&inputs.length===175&&inputs.every(x=>x.matches)&&resources.length===13&&resources.every(x=>x.matches)&&compiled.length>0&&compiled.every(x=>x.matches);
await writeFile(join(destination,'artifact-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,version:report.version,inputs:inputs.length,inputMismatches:inputs.filter(x=>!x.matches),resources:resources.length,resourceMismatches:resources.filter(x=>!x.matches),compiled:compiled.length,compiledMismatches:compiled.filter(x=>!x.matches),asarMatches:report.asarMatches}));if(!report.passed)process.exitCode=1;
