// Callback autonome sérialisable par Playwright ; aucun import à effet de bord.
// Les valeurs privées ne quittent jamais les décodeurs bornés, uniquement des
// catégories/booleans et des hashes de références RPC/thread/tour.
export function observedForgeOperations(observations){
 const known=new Set(['resolve-workflow','resolve-config','check-sessions','resolve-personas','init','append','write','finish'])
 return observations.map(observation=>known.has(observation.operation)?observation.operation:'other')
}

export function installControlTraceRuntime(_electron,options={}){
 if(globalThis.__epicOneControlTrace)return false
 const {createHash}=process.getBuiltinModule('crypto'),{StringDecoder}=process.getBuiltinModule('string_decoder')
 const bound=(value,fallback,maximum)=>Number.isSafeInteger(value)&&value>0&&value<=maximum?value:fallback
 const limits={maxEvents:bound(options.maxEvents,2048,2048),maxLineBytes:bound(options.maxLineBytes,1048576,1048576),maxBytes:bound(options.maxBytes,8388608,8388608)}
 const methods=new Set(['item/tool/call','item/tool/requestUserInput','item/fileChange/requestApproval','item/started','item/completed','rawResponseItem/completed','serverRequest/resolved','turn/started','turn/completed','thread/started','error'])
 const types=new Set(['dynamicToolCall','agentMessage','fileChange','userMessage','reasoning','function_call','custom_tool_call','function_call_output','custom_tool_call_output','commandExecution','webSearch'])
 const toolKeys={bmad_resolve:['kind'],bmad_read_file:['path'],bmad_unsupported:[],bmad_forge_resolve:['kind'],bmad_forge_check_sessions:[],bmad_forge_init:['slug','idea','goal'],bmad_forge_append:['type','text'],bmad_forge_write:['name','text'],bmad_forge_finish:['outcome']}
 const kinds=new Set(['agent','workflow','config','personas','decision','assumption','crack','kill','direction','lock','note'])
 const refusals=new Set(['INVALID_COMMAND','UNTRUSTED_CALLER','BUSY','APP_CLOSING','PROJECT_NOT_FOUND','CONTEXT_MISMATCH','PROFILE_ABSENT','PROFILE_UNRECOGNIZED','PROFILE_CHANGED','RESOLVER_FAILED','NO_ACCOUNT','PLAN_ACK_REQUIRED','CONNECTION_BUSY','PROVIDER_FAILED','UNSUPPORTED_INTERACTION','CANCELLED','STOP_UNCONFIRMED','STORAGE_READ_FAILED','STORAGE_WRITE_FAILED','OUTPUT_REFUSED','OUTPUT_CONFLICT','EFFECT_UNKNOWN','RESUME_UNSUPPORTED','INSPECTION_REQUIRED','INSPECTION_CONFLICT','INSPECTION_STALE'])
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),has=(v,k)=>object(v)&&Object.hasOwn(v,k),type=v=>v===null?'null':Array.isArray(v)?'array':['string','number','boolean','object','undefined'].includes(typeof v)?typeof v:'other'
 const hash=value=>createHash('sha256').update(value).digest('hex'),ref=value=>typeof value==='string'&&value.length<=1024||typeof value==='number'&&Number.isSafeInteger(value)?hash(typeof value+':'+String(value)):null
 const normalize=value=>value.replaceAll('\\','/').replace(/^\.\//,'').toLowerCase(),manifest=(options.manifestPaths??[]).filter(v=>typeof v==='string').map(normalize)
 const pathCategory=value=>{
  if(typeof value!=='string'||value.length>32767)return 'other'
  const path=normalize(value)
  if(/(?:^|\/)forge-\*\/\.memlog\.md$/.test(path))return 'resume-glob'
  if(path==='_bmad/config.toml'||path.endsWith('/_bmad/config.toml'))return 'config'
  if(manifest.some(name=>path===name||path.endsWith('/'+name)))return 'manifest'
  return 'other'
 }
 const events=[],attachments=[];let sequence=0,droppedEvents=0,suppressedDeltas=0,totalBytes=0,onChange=()=>{},attached=false
 const incomplete={eventLimit:false,lineLimit:false,byteLimit:false,parseFailure:false,partialLine:false,observerFailure:false,restoreConflict:false}
 const notify=()=>{try{onChange()}catch{incomplete.observerFailure=true}}
 const emit=value=>{sequence++;if(events.length>=limits.maxEvents){droppedEvents++;incomplete.eventLimit=true;notify();return}events.push({sequence,...value});notify()}
 const inspect=(message,direction,child)=>{
  if(!object(message)){incomplete.parseFailure=true;notify();return}
  if(direction==='stdin'){
   // Une réponse observée n'est pas une preuve d'envoi/ACK. Aucun résultat,
   // argument de tour ou texte d'erreur arbitraire n'est conservé.
   if(!has(message,'method')&&has(message,'id')&&object(message.error))emit({child,direction,type:'refusal',rpcRef:ref(message.id),rpcCode:[-32700,-32600,-32601,-32602,-32603].includes(message.error.code)?message.error.code:'other',refusalCode:refusals.has(message.error.message)?message.error.message:'other'})
   return
  }
  if(!has(message,'id')&&typeof message.method==='string'&&/delta$/i.test(message.method)){suppressedDeltas++;return}
  if(typeof message.method!=='string')return
  const p=object(message.params)?message.params:{},item=object(p.item)?p.item:{},tool=typeof p.tool==='string'&&Object.hasOwn(toolKeys,p.tool)?p.tool:'other'
  let args=p.arguments,jsonValid=false
  if(typeof args==='string'){try{args=JSON.parse(args);jsonValid=true}catch{args=null}}
  else jsonValid=object(args)
  const values=object(args)?args:{},kind=values.kind??values.type,path=values.path??values.pattern??values.glob
  emit({child,direction,type:has(message,'id')?'request':'notification',rpcRef:has(message,'id')?ref(message.id):null,threadRef:ref(p.threadId),turnRef:ref(p.turnId??p.turn?.id),method:methods.has(message.method)?message.method:'other',itemType:types.has(item.type)?item.type:'other',tool,kind:kinds.has(kind)?kind:'other',pathCategory:pathCategory(path),flags:{toolPresent:has(p,'tool'),toolString:typeof p.tool==='string',argumentsPresent:has(p,'arguments'),argumentsType:has(p,'arguments')?type(p.arguments):'missing',argumentsJsonValid:jsonValid,argumentsObject:object(args),kindPresent:has(values,'kind')||has(values,'type'),kindString:typeof kind==='string',pathPresent:has(values,'path')||has(values,'pattern')||has(values,'glob'),pathString:typeof path==='string',extraArgumentKeys:Object.keys(values).some(key=>tool==='other'||!toolKeys[tool].includes(key))}})
 }
 const decoder=(direction,child)=>{
  let buffer='',discarding=false,disabled=false;const utf8=new StringDecoder('utf8')
  const feed=chunk=>{
   if(disabled)return
   try{
    const bytes=typeof chunk==='string'?Buffer.byteLength(chunk):chunk?.byteLength??0;totalBytes+=bytes
    if(totalBytes>limits.maxBytes){incomplete.byteLimit=true;buffer='';disabled=true;notify();return}
    const text=typeof chunk==='string'?chunk:utf8.write(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk))
    for(const part of text.split(/(?<=\n)/)){
     const ended=part.endsWith('\n')
     if(discarding){if(ended)discarding=false;continue}
     if(Buffer.byteLength(buffer)+Buffer.byteLength(part)>limits.maxLineBytes){buffer='';discarding=!ended;incomplete.lineLimit=true;notify();continue}
     buffer+=part
     if(ended){const line=buffer.trim();buffer='';if(!line)continue;let value;try{value=JSON.parse(line)}catch{incomplete.parseFailure=true;notify();continue}inspect(value,direction,child)}
    }
   }catch{incomplete.observerFailure=true;notify()}
  }
  return {feed,finish:()=>{if(buffer.trim()||discarding||utf8.end().length>0){incomplete.partialLine=true;buffer='';notify()}}}
 }
 const attach=(child,childId)=>{
  const stdout=decoder('stdout',childId),stdin=decoder('stdin',childId),stream=child.stdin,originalWrite=stream.write,own=Object.hasOwn(stream,'write'),descriptor=Object.getOwnPropertyDescriptor(stream,'write')
  const observe=chunk=>stdout.feed(chunk)
  const wrappedWrite=function(){
   // Même this, objets, callback, valeur de retour et exception. L'observation
   // vient après l'appel original et ne remplace pas le callback du produit.
   const returned=Reflect.apply(originalWrite,this,arguments);stdin.feed(arguments[0]);return returned
  }
  stream.write=wrappedWrite;child.stdout.on('data',observe);attached=true
  let closed=false
  const restore=()=>{if(closed)return;closed=true;child.stdout.off('data',observe);stdout.finish();stdin.finish();if(stream.write!==wrappedWrite){incomplete.restoreConflict=true;notify();return}if(own)Object.defineProperty(stream,'write',descriptor);else delete stream.write}
  if(typeof child.once==='function')child.once('close',()=>{restore();notify()})
  attachments.push(restore);notify()
 }
 globalThis.__epicOneControlTrace={attach,setOnChange:callback=>{onChange=callback},read:()=>({schemaVersion:1,attached,complete:!Object.values(incomplete).some(Boolean),limits:{...limits},events:events.map(event=>({...event,...(event.flags?{flags:{...event.flags}}:{})})),droppedEvents,suppressedDeltas,incomplete:{...incomplete}}),restore:()=>{for(const stop of attachments.splice(0))stop();attached=false;return !incomplete.restoreConflict}}
 return true
}
