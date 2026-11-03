// Explicit public GET only. No helper, OAuth, refresh, verification message or model.
import {readFile,writeFile} from 'node:fs/promises'
import {resolve,join,dirname} from 'node:path'
import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {HelpPersonalSession} from './bmad-help-personal.mjs'
const repository=process.cwd(),require=createRequire(join(repository,'package.json'))
const s=await import(pathToFileURL(join(repository,'scripts/qualification/epic-one-support.mjs')).href)
const option=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3)
if(!process.argv.includes('--public-get-only'))throw Error('Explicit public-get-only action required')
const executable=resolve(option('executable')),destination=await s.claimOutput(resolve(option('output')))
const pkg=JSON.parse(require('@electron/asar').extractFile(join(dirname(executable),'resources/app.asar'),'package.json'))
const report={schemaVersion:1,action:'public-main-get-only',startedAt:new Date().toISOString(),status:'partial',artifact:{executable,version:pkg.version,asarSha256:s.sha256(await readFile(join(dirname(executable),'resources/app.asar')))},limits:['GET seul : ne qualifie pas la réponse native M14 de cet artefact.','GET public depuis le vrai profil/session Main, cache par défaut ; ne prouve pas un POST de renouvellement ni un échange modèle.']}
let session
try{
 const {findNativeExecutable}=await import(pathToFileURL(join(repository,'src/adapters/codex/probe.ts')).href)
 const runnerSha256=s.sha256(await readFile(await findNativeExecutable(process.env.APPDATA)))
 session=new HelpPersonalSession({artifact:{executable,version:pkg.version,electron:JSON.parse(await readFile(join(repository,'node_modules/electron/package.json'),'utf8')).version},output:destination,runnerSha256})
 report.runtime=await session.launch()
 report.network=await session.app.evaluate(async({net,session})=>{
  const observations=[]
  session.defaultSession.webRequest.onHeadersReceived({urls:['https://auth.openai.com/.well-known/jwks.json']},(details,callback)=>{
   const location=Object.entries(details.responseHeaders??{}).find(([key])=>key.toLowerCase()==='location')?.[1]?.[0]
   observations.push({status:details.statusCode,destinationCategory:typeof location==='string'&&/zscaler/i.test(location)?'zscaler':location?'other-redirect':'none'})
   callback({responseHeaders:details.responseHeaders})
  })
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000)
  let result
  try{const response=await net.fetch('https://auth.openai.com/.well-known/jwks.json',{method:'GET',redirect:'error',credentials:'omit',headers:{Accept:'application/json'},signal:controller.signal});const bytes=new Uint8Array(await response.arrayBuffer());result={status:response.status,bytes:bytes.length,ok:response.status===200&&bytes.length<=262144}}
  catch{result={status:null,ok:false}}
  finally{clearTimeout(timer);session.defaultSession.webRequest.onHeadersReceived(null)}
  return {...result,observations,measuredAt:new Date().toISOString()}
 })
 const trace=await session.helpTrace(),native=await session.observe()
 s.check(trace.spawns===0&&native.children.length===0,'PUBLIC_CHECK_STARTED_HELPER_OR_ENGINE')
 report.noHelperOrModel=true;report.close=await session.close();s.assertClosed(report.close)
 report.status=report.network.ok?'public-get-passed':'public-get-blocked'
}catch(error){report.status='failed';report.failure=s.publicFailure(error);if(session?.app)try{report.failureClose=await session.close()}catch{report.closeUnconfirmed=true}}
report.finishedAt=new Date().toISOString();await writeFile(join(destination,'report.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,network:report.network??null,failure:report.failure??null}))
if(report.status==='failed')process.exitCode=1
