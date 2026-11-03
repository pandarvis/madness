// Parent-only, passive instrumentation. No product source, provider arguments or
// permissions are changed. Core control trace remains the sole stdin wrapper.
export async function sampleDialogueWithObservation(session,lastAt=0){
 const state=await session.dialogue(),now=Date.now()
 if(now-lastAt<3000)return {state,observedAt:lastAt,observationError:null}
 try{await session.observe();return {state,observedAt:now,observationError:null}}
 catch(observationError){return {state,observedAt:now,observationError}}
}

export function combinedControlSource(installControlTraceRuntime){
 const source=installControlTraceRuntime.toString(),marker='const inspect=(message,direction,child)=>{'
 if(source.split(marker).length!==2)throw Error('CONTROL_TRACE_SOURCE_CHANGED')
 return source.replace(marker,marker+"\n  try{globalThis.__help22Trace?.observe(message,direction)}catch{}")
}

export function installCombinedTrace(_electron,{source,eventsPath}){
 const previous=globalThis.__epicOneControlTrace,observed=previous?.read()
 if(!previous||observed.attached||observed.events.length!==0||!previous.restore())return false
 delete globalThis.__epicOneControlTrace
 // source is a parent-created derivative of the imported committed observer,
 // never text from a project, provider message or external document.
 const install=(0,eval)('('+source+')')
 if(install(null)!==true)return false
 const fs=process.getBuiltinModule('fs')
 globalThis.__epicOneControlTrace.setOnChange(()=>fs.writeFileSync(eventsPath,JSON.stringify(globalThis.__epicOne.read())+'\n',{mode:0o600}))
 return true
}

export function installHelpObservation(_electron,{outputPath}){
 if(globalThis.__help22Trace)return false
 const cp=process.getBuiltinModule('child_process'),mod=process.getBuiltinModule('module'),crypto=process.getBuiltinModule('crypto'),fs=process.getBuiltinModule('fs')
 const original=cp.spawn,events=[],pending=new Map(),allowed=new Set(['required-context','inventories']);let overflow=false,spawns=0,restored=false
 const hash=s=>crypto.createHash('sha256').update(s).digest('hex')
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)
 const type=v=>v===null?'null':Array.isArray(v)?'array':typeof v
 const token=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,200}$/.test(v)?v:null
 const read=()=>({events:structuredClone(events),overflow,spawns,pending:pending.size,restored})
 const persist=()=>{try{fs.writeFileSync(outputPath,JSON.stringify(read())+'\n',{mode:0o600})}catch{overflow=true}}
 const add=e=>{if(events.length>=300)overflow=true;else events.push(e);persist()}
 const inspect=(m,direction)=>{
  if(!object(m))return
  const p=object(m.params)?m.params:{}
  if(direction==='stdin'&&m.method==='turn/start'){
   const input=Array.isArray(p.input)?p.input:[]
   add({type:'input',skill:input.find(i=>i.type==='skill')?.name??null,skillPath:input.find(i=>i.type==='skill')?.path??null,textSha256:hash(input.filter(i=>i.type==='text').map(i=>i.text).join('\n')),parts:input.length})
  }
  if(direction==='stdout'&&m.method==='item/tool/call'){
   let args=p.arguments;try{if(typeof args==='string')args=JSON.parse(args)}catch{args=null}
   const allKeys=object(args)?Object.keys(args):[],keys=allKeys.slice(0,64),reference=object(args)&&typeof args.reference==='string'?args.reference:null,kind=object(args)&&['knowledge','config'].includes(args.kind)?args.kind:null
   if(allKeys.length>64)overflow=true
   const event={type:'tool-request',tool:token(p.tool),toolSha256:hash(String(p.tool)),argumentsType:type(p.arguments),argumentKeys:keys.map(k=>token(k)??'sha256:'+hash(k)),argumentTypes:keys.map(k=>type(args[k])),kind,reference:reference&&reference.length<=200&&/^(?:source-\d+|required-context|inventories)$/.test(reference)?reference:null,referenceSha256:reference?hash(reference):null,referenceAllowed:reference!==null&&allowed.has(reference),callId:token(p.callId),threadId:token(p.threadId),turnId:token(p.turnId)}
   if(pending.size>=300){overflow=true;persist();return}
   pending.set(m.id,event);add(event)
  }
  if(direction==='stdin'&&!m.method&&pending.has(m.id)){
   const request=pending.get(m.id);pending.delete(m.id)
   add({type:'tool',tool:request.tool,callId:request.callId,threadId:request.threadId,turnId:request.turnId,kind:request.kind,reference:request.reference,success:m.result?.success===true,error:!!m.error,errorCode:typeof m.error?.message==='string'&&/^[A-Z_]{1,100}$/.test(m.error.message)?m.error.message:null,rawSha256:typeof m.result?.contentItems?.[0]?.text==='string'?hash(m.result.contentItems[0].text):null})
  }
 }
 const wrapped=function(){const child=Reflect.apply(original,this,arguments);spawns++;persist();return child}
 cp.spawn=wrapped;mod.syncBuiltinESMExports()
 globalThis.__help22Trace={read,observe:inspect,setAllowedReferences:references=>{for(const id of references)if(typeof id==='string'&&/^(?:source-\d+|required-context|inventories)$/.test(id))allowed.add(id);persist()},restore:()=>{if(cp.spawn!==wrapped)return false;cp.spawn=original;mod.syncBuiltinESMExports();restored=true;persist();return true}}
 persist();return cp.spawn===wrapped
}
