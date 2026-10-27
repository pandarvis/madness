// Vrai runner et protocole produit, modèle entièrement simulé sur 127.0.0.1.
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {spawn} from 'node:child_process'
import {createHash,randomUUID} from 'node:crypto'
import {mkdir,mkdtemp,readFile,writeFile,realpath,rm,lstat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,dirname,basename,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {DialogueRpc,startDialogueProtocol,assertQuestionRuntime} from '../../../../../src/adapters/codex/dialogue.ts'
import {stopNative} from '../../../../../src/adapters/codex/probe.ts'
const own=fileURLToPath(import.meta.url),output=dirname(own),hash=value=>createHash('sha256').update(value).digest('hex')
const executable='C:/Users/UP60066553/AppData/Roaming/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe'
const report={schemaVersion:1,startedAt:new Date().toISOString(),scope:'Vrai runner0.144.6, exec -> tools.apply_patch ; fournisseur loopback entièrement simulé, sans OAuth/compte/modèle externe.',scriptSha256:hash(await readFile(own)),requests:[],events:[],operations:[],checks:{},cleanup:false,nativeStopped:false}
const controller=new AbortController();let root,child,rpc,server,requests=0,nativeBuffer='',watchdog
function emitResponse(response,item){
 response.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache'})
 const emit=value=>response.write('data: '+JSON.stringify(value)+'\n\n'),id='resp_'+randomUUID()
 emit({type:'response.created',response:{id,status:'in_progress',output:[]}});emit({type:'response.output_item.added',output_index:0,item});emit({type:'response.output_item.done',output_index:0,item});emit({type:'response.completed',response:{id,status:'completed',output:[item],usage:{input_tokens:1,output_tokens:1,total_tokens:2}}});response.end()
}
try{
 await assertQuestionRuntime(executable);report.nativeSha256=hash(await readFile(executable))
 root=await realpath(await mkdtemp(join(tmpdir(),'madness-receipt-loopback-')))
 const project=join(root,'project'),home=join(root,'profile'),skill=join(project,'.agents/skills/bmad-agent-analyst/SKILL.md'),target=join(project,'effect/operation.txt')
 await mkdir(dirname(skill),{recursive:true});await mkdir(dirname(target));await mkdir(home);await mkdir(join(home,'codex-home'))
 await writeFile(skill,'---\nname: bmad-agent-analyst\ndescription: Témoin synthétique du transport natif, sans persona réelle.\n---\nExécuter seulement les opérations synthétiques fournies par le banc.\n')
 const initial='avant\n',accepted='accepté-'+randomUUID()+'\n',refused='refusé-'+randomUUID()+'\n';await writeFile(target,initial)
 const patch=(before,after)=>'*** Begin Patch\n*** Update File: '+target.replaceAll('\\','/')+'\n@@\n-'+before.trimEnd()+'\n+'+after.trimEnd()+'\n*** End Patch'
 const scripts=[`await tools.bmad_resolve({kind:"agent"}); await tools.bmad_resolve({kind:"config"}); text(await tools.apply_patch(${JSON.stringify(patch(initial,accepted))}));`,`text(await tools.apply_patch(${JSON.stringify(patch(accepted,refused))}));`]
 server=createServer(async(request,response)=>{
  try{
   if(request.url!=='/v1/responses'||request.method!=='POST'){response.writeHead(404);response.end();return}
   let bytes='';for await(const chunk of request){bytes+=chunk;if(bytes.length>4000000)throw Error('loopback-request-too-large')}
   const body=JSON.parse(bytes),tools=[...(body.tools??[]),...(body.input??[]).filter(i=>i.type==='additional_tools').flatMap(i=>i.tools??[])];requests++
   report.requests.push({index:requests,model:body.model,authorizationPresent:Object.hasOwn(request.headers,'authorization'),toolNames:tools.map(t=>t.name),inputSha256:hash(JSON.stringify(body.input??[]))})
   assert.equal(tools.some(t=>t.name==='exec'&&t.type==='custom'),true,'Le modèle choisi doit offrir exec natif')
   if(requests<=2)emitResponse(response,{type:'custom_tool_call',id:'fc_exec_'+requests,call_id:'exec_outer_'+requests,name:'exec',input:scripts[requests-1]})
   else if(requests===3)emitResponse(response,{type:'message',id:'synthetic-final',role:'assistant',phase:'final_answer',content:[{type:'output_text',text:'Fin du témoin synthétique : deux choix distincts, aucun accord étendu.'}]})
   else throw Error('unexpected-simulated-request')
  }catch(error){report.providerFailure=String(error);controller.abort();if(!response.headersSent)response.writeHead(500);response.end('bounded-loopback-failed')}
 })
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port
 const settings=['cli_auth_credentials_store="file"','model_provider="openai_chatgpt_plan"','model_providers.openai_chatgpt_plan.name="Synthetic loopback only"',`model_providers.openai_chatgpt_plan.base_url="http://127.0.0.1:${port}/v1"`,'model_providers.openai_chatgpt_plan.wire_api="responses"','model_providers.openai_chatgpt_plan.requires_openai_auth=false','model_providers.openai_chatgpt_plan.supports_websockets=false','model_providers.openai_chatgpt_plan.request_max_retries=0','model_providers.openai_chatgpt_plan.stream_max_retries=0','web_search="disabled"','features.shell_tool=false','features.multi_agent=false','features.apps=false','features.plugins=false','features.default_mode_request_user_input=true','features.respect_system_proxy=false','features.enable_request_compression=false','mcp_servers={}','shell_environment_policy.inherit="none"','project_doc_max_bytes=0']
 const env=Object.fromEntries(Object.entries({PATH:process.env.PATH,SYSTEMROOT:process.env.SYSTEMROOT,WINDIR:process.env.WINDIR,COMSPEC:process.env.COMSPEC,PATHEXT:process.env.PATHEXT,TEMP:home,TMP:home,HOME:home,USERPROFILE:home,APPDATA:join(home,'appdata'),LOCALAPPDATA:join(home,'localappdata'),CODEX_HOME:join(home,'codex-home'),NO_PROXY:'127.0.0.1,localhost',HTTP_PROXY:'',HTTPS_PROXY:'',ALL_PROXY:''}).filter(([,v])=>v!==undefined))
 report.profile={sandbox:'read-only',approvalPolicy:'on-request',approvalsReviewer:'user',shellEnabled:false,credentialsInherited:false};report.fixture={project,target,initialSha256:hash(initial),acceptedSha256:hash(accepted),refusedSha256:hash(refused)}
 child=spawn(executable,['app-server','--listen','stdio://',...settings.flatMap(v=>['-c',v])],{cwd:project,env,shell:false,windowsHide:true,stdio:['pipe','pipe','pipe']})
 child.stdout.setEncoding('utf8');child.stdout.on('data',chunk=>{nativeBuffer+=chunk;while(nativeBuffer.includes('\n')){const end=nativeBuffer.indexOf('\n'),line=nativeBuffer.slice(0,end);nativeBuffer=nativeBuffer.slice(end+1);if(!line.trim())continue;try{const m=JSON.parse(line);if(m.method==='item/fileChange/requestApproval'||['item/started','item/completed'].includes(m.method)&&m.params?.item?.type==='fileChange'||m.method==='rawResponseItem/completed'&&m.params?.item?.type==='custom_tool_call_output')report.events.push(m)}catch{controller.abort()}}})
 let stderr='';child.stderr.on('data',chunk=>{if(stderr.length<12000)stderr+=chunk.toString()})
 rpc=new DialogueRpc(child,controller.signal,10000);watchdog=setTimeout(()=>controller.abort(),45000)
 const protocol=await startDialogueProtocol(rpc,{cwd:project,profile:{rootPath:project,skillPath:skill,mode:'file-approval'},signal:controller.signal,activity:()=>{},resolve:async kind=>kind==='agent'?' {"agent":{"name":"Mary"}}':'{}',read:async()=>''},15000)
 const settlements=[]
 report.finalText=await protocol.turn(null,async()=>{},()=>{},undefined,async(approval,responder)=>{
  const index=report.operations.length,decision=index===0?'accept':'decline';assert.ok(index<2);assert.deepEqual(approval.files.map(f=>[f.path,f.kind]),[[target,'update']]);assert.equal(approval.files[0].beforeSha256,hash(index===0?initial:accepted));assert.equal(approval.files[0].afterSha256,hash(index===0?accepted:refused))
  const operation={decision,announcedFiles:approval.files,transmitted:false,result:null};report.operations.push(operation)
  const task=(async()=>{await responder.decide(decision);operation.transmitted=true;operation.result=await responder.result;operation.actualSha256=hash(await readFile(target));assert.equal(operation.result.nativeStatus,decision==='accept'?'completed':'declined');assert.equal(operation.result.files.every(f=>f.matches),true);assert.equal(operation.actualSha256,hash(accepted))})()
  settlements.push(task);void task.catch(error=>{report.operationFailure=String(error);controller.abort()})
 })
 await Promise.all(settlements);assert.equal(report.operations.length,2);assert.equal(await readFile(target,'utf8'),accepted)
 const approvals=report.events.filter(e=>e.method==='item/fileChange/requestApproval'),completed=report.events.filter(e=>e.method==='item/completed'&&e.params?.item?.type==='fileChange'),raw=report.events.filter(e=>e.method==='rawResponseItem/completed')
 report.checks={productionProtocolSucceeded:true,twoDistinctNativeRequests:approvals.length===2&&approvals[0].params.itemId!==approvals[1].params.itemId,acceptedNativeAndDeclinedNative:completed.map(e=>e.params.item.status).join(',')==='completed,declined',noGrant:approvals.every(e=>e.params.grantRoot===null),everyFileReread:report.operations.every(o=>o.transmitted&&o.result.files.every(f=>f.matches)),outerRawArrayDifferentCallId:raw.length>=2&&raw.every(e=>Array.isArray(e.params.item.output)&&!approvals.some(a=>a.params.itemId===e.params.item.call_id)),noFabricatedRaw:report.operations.every(o=>o.result.raw===''),noAuthorization:report.requests.every(r=>!r.authorizationPresent),acceptedEffectPreservedAfterDecline:true}
 assert.equal(Object.values(report.checks).every(Boolean),true)
 report.status='passed';report.stderrSha256=hash(stderr)
}catch(error){report.status='failed';report.failure=error instanceof Error?error.stack:String(error);process.exitCode=1}
finally{
 clearTimeout(watchdog);controller.abort();report.nativeStopped=child?await stopNative(child):true;rpc?.dispose()
 if(server){server.closeAllConnections();await new Promise(r=>server.close(r))}
 if(root&&report.nativeStopped){const actual=await realpath(root),base=await realpath(tmpdir());if(dirname(actual)!==base||!/^madness-receipt-loopback-[A-Za-z0-9]+$/.test(basename(actual))||(await lstat(root)).isSymbolicLink())throw Error('unsafe-cleanup-target');await rm(actual,{recursive:true,force:true,maxRetries:3});report.cleanup=true}
 if(!report.nativeStopped){report.status='failed';process.exitCode=1}
 report.endedAt=new Date().toISOString();await writeFile(join(output,'native-receipt-codemode-loopback.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,operations:report.operations.length,nativeStopped:report.nativeStopped,cleanup:report.cleanup,failure:report.failure??null}))
}
