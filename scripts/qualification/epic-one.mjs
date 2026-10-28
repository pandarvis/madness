// Orchestrateur permanent 1.11. Aucun lancement ni accès au profil à l'import.
import {spawn} from 'node:child_process'
import {readFile,writeFile,mkdir,mkdtemp,realpath,rm} from 'node:fs/promises'
import {join,resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {tmpdir} from 'node:os'
import {check,sha256,verifyArtifact,claimOutput,readBenchResult,publicFailure,bounded,delay,assertNoApplication,personalEnvironment,samePath,assertClosed} from './epic-one-support.mjs'
import {windowsOwnedProcesses} from '../../src/adapters/codex/owned-run.ts'
import {defaultManifest,historicalDigests,harnessProvenance} from './epic-one-provenance.mjs'
export {defaultManifest,historicalDigests,harnessProvenance}
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
async function runtimeProbe(artifact){
 const {_electron}=await import('playwright-core'),root=await realpath(await mkdtemp(join(tmpdir(),'madness-epic-one-runtime-'))),profile=join(root,'profile')
 await mkdir(profile);let app,identity,closed=false,closeObserved=false,result
 try{
  const allowed=personalEnvironment({...process.env,MADNESS_DATA_HOME:undefined}),env=Object.fromEntries(Object.entries(allowed).filter(([k])=>!['APPDATA','LOCALAPPDATA'].includes(k.toUpperCase())))
  app=await _electron.launch({executablePath:artifact.executable,args:[],cwd:repository,env:{...env,MADNESS_DATA_HOME:profile,APPDATA:join(profile,'appdata'),LOCALAPPDATA:join(profile,'localappdata')},timeout:30000});app.once('close',()=>{closeObserved=true})
  const runtime=await app.evaluate(({app})=>({pid:process.pid,executable:process.execPath,version:app.getVersion(),name:app.getName(),electron:process.versions.electron,chromium:process.versions.chrome,node:process.versions.node,packaged:app.isPackaged,appPath:app.getAppPath(),userData:app.getPath('userData')}))
  identity=await windowsOwnedProcesses.read(runtime.pid);check(identity&&samePath(identity.executable,artifact.executable),'MAIN_IDENTITY_MISMATCH')
  check(runtime.version===artifact.version&&runtime.electron===artifact.electron&&runtime.name==='madness'&&runtime.packaged&&samePath(runtime.appPath,join(dirname(artifact.executable),'resources/app.asar'))&&samePath(runtime.userData,profile),'RUNTIME_MISMATCH')
  result={version:runtime.version,name:runtime.name,electron:runtime.electron,chromium:runtime.chromium,node:runtime.node,packaged:true,mainPid:runtime.pid,wrapperPid:app.process().pid}
 }finally{
  if(app){await bounded(()=>app.close(),30000,'RUNTIME_CLOSE_TIMEOUT');const mainGone=identity?await windowsOwnedProcesses.read(identity.pid)===null:false;assertClosed({mainGone,childrenGone:true,closeObserved});closed=true}
  if(closed||!app){check(dirname(await realpath(root))===await realpath(tmpdir()),'RUNTIME_WORKSPACE_REFUSED');await rm(root,{recursive:true,force:true,maxRetries:3})}
 }
 return {...result,cleanup:true}
}
async function runChild(script,args,timeoutMs,signal){
 const child=spawn(process.execPath,[join(repository,'scripts/qualification',script),...args],{cwd:repository,env:process.env,shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']})
 let stdout='',stderr='',closed=false
 const append=(current,chunk)=>(current+chunk.toString('utf8')).slice(-262144)
 child.stdout.on('data',b=>{stdout=append(stdout,b)});child.stderr.on('data',b=>{stderr=append(stderr,b)})
 const interrupt=()=>{if(!closed)child.kill('SIGINT')};signal?.addEventListener('abort',interrupt,{once:true})
 const timer=setTimeout(interrupt,timeoutMs)
 try{return await new Promise((res,rej)=>{child.once('error',rej);child.once('close',(code,termination)=>{closed=true;res({exitCode:code,signal:termination,stdout,stdoutSha256:sha256(stdout),stderrSha256:sha256(stderr)})})})}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',interrupt)}
}
export async function runSynthetic({executable,output,manifest=defaultManifest,signal}){
 const destination=await claimOutput(output),report={schemaVersion:1,source:'synthetic-and-native-loopback',startedAt:new Date().toISOString(),status:'partial',steps:[],limits:['Aucun compte, OAuth ou modèle externe ; les réponses loopback sont simulées.','Les bancs utilisent les sources actuelles et le même paquet installé, avec leurs empreintes propres.','Aucun contrôle personnel, accord humain global, G2–G5 étendu ou V1 complète déduit.','Un banc interrompu garde sa preuve et ses espaces si leur fermeture n’est pas établie.']}
 const save=()=>writeFile(join(destination,'report.json'),JSON.stringify(report,null,2)+'\n')
 let before
 try{
  await save();check(process.platform==='win32','WINDOWS_REQUIRED');report.artifact=await verifyArtifact(executable,manifest);report.harness=await harnessProvenance();before=await historicalDigests();report.historicalBefore=before
  await assertNoApplication(executable);report.runtime=await runtimeProbe(report.artifact);await save()
  const steps=[...['forge','conversation','questions','approvals','recovery','overview'].map(name=>({name,source:'synthetic',file:name+'.mjs',receipt:'packaged-profile.json',args:['--packaged','--executable='+executable,'--no-captures']})),{name:'local-expiry',source:'synthetic',file:'epic-one-edges.mjs',receipt:'profile.json',args:[]},...['recovery','overview'].map(name=>({name:name+'-native',source:'loopback',file:name+'-native.mjs',receipt:'native-loopback-profile.json',args:[]})),{name:'windows',source:'synthetic',file:'windows.mjs',args:['--ui-regressions-only','--skip-screenshots','--executable='+executable]}]
  for(const step of steps){
   check(!signal?.aborted,'RUN_INTERRUPTED');await assertNoApplication(executable)
   console.log('Epic 1 : banc '+step.name+' ('+step.source+').')
   const path=join(destination,step.name),run=await runChild(step.file,[...step.args,...(step.receipt?['--output='+path]:[])],300000,signal)
   let result
   if(step.receipt){let receipt;try{receipt=JSON.parse(await readFile(join(path,step.receipt),'utf8'))}catch{receipt=null}result=readBenchResult(step.source,receipt,run.exitCode)}
   else{const matched=/G0 : focused-ui-regressions-passed ; contrôles : (\d+) ; nettoyage : true\./.exec(run.stdout);result={source:step.source,status:run.exitCode===0&&!!matched?'passed':'failed',checks:matched?Number(matched[1]):0,cleanup:!!matched,exitCode:run.exitCode,limits:['Contrôles Windows ciblés, sans écriture de G0 historique.']}}
   report.steps.push({name:step.name,...result,stdoutSha256:run.stdoutSha256,stderrSha256:run.stderrSha256});await save();check(result.status==='passed','BENCH_FAILED');await assertNoApplication(executable)
  }
  report.status='passed-synthetic-only'
 }catch(error){report.status='failed';report.failure=publicFailure(error)}
 finally{
  if(before){try{report.historicalAfter=await historicalDigests();report.historicalUnchanged=JSON.stringify(report.historicalAfter)===JSON.stringify(before);check(report.historicalUnchanged,'HISTORICAL_EVIDENCE_CHANGED')}catch(error){report.status='failed';report.failure=publicFailure(error)}}
  report.finishedAt=new Date().toISOString();await save()
 }
 return report
}
export async function main(args=process.argv.slice(2)){
 if(args.includes('--help')){console.log('node scripts/qualification/epic-one.mjs --mode=synthetic|personal --executable=<absolu> --output=<nouveau absolu> [--manifest=<absolu>] [--action=preflight|run|close-active|child-error|forge-diagnostic] [--archive-witness]');return}
 const option=name=>{const items=args.filter(a=>a.startsWith('--'+name+'='));check(items.length<=1,'DUPLICATE_ARGUMENT');return items[0]?.slice(name.length+3)}
 const mode=option('mode')??'synthetic',executable=option('executable'),output=option('output'),manifest=option('manifest')??defaultManifest
 check(['synthetic','personal'].includes(mode),'MODE_REFUSED');check(executable&&output,'EXECUTABLE_AND_FRESH_OUTPUT_REQUIRED')
 const controller=new AbortController(),interrupt=()=>controller.abort();process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt)
 try{
  const report=mode==='synthetic'?await runSynthetic({executable,output,manifest,signal:controller.signal}):await (await import('./epic-one-personal.mjs')).runPersonal({executable,output,manifest,action:option('action'),archive:args.includes('--archive-witness'),signal:controller.signal})
  console.log(JSON.stringify({status:report.status,source:report.source,failure:report.failure??null}));if(report.status.startsWith('failed'))process.exitCode=1
 }finally{process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt)}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{await main()}catch(error){console.log(JSON.stringify(publicFailure(error)));process.exitCode=1}}
