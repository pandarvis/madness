import {readdir,readFile,stat} from 'node:fs/promises'
import {join} from 'node:path'

// Qualification-only projection of receipts already emitted by the closed
// helper. Never retain the request, paths, stdout, errors or credentials.
export async function readBmadProgressTimings(runs){
 let entries;try{entries=await readdir(runs,{withFileTypes:true})}catch(e){return {status:e.code==='ENOENT'?'missing':'unreadable',operations:[]}}
 const json=async path=>{try{if((await stat(path)).size>65536)return {status:'oversize'};const value=JSON.parse(await readFile(path,'utf8'));return value&&typeof value==='object'&&!Array.isArray(value)?{status:'present',value}:{status:'unreadable'}}catch(e){return {status:e.code==='ENOENT'?'missing':'unreadable'}}}
 const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0,bool=v=>typeof v==='boolean'
 const fields=(receipt,spec)=>({status:receipt.status,values:Object.fromEntries(Object.entries(spec).filter(([key,valid])=>valid(receipt.value?.[key])).map(([key])=>[key,receipt.value[key]]))})
 const operations=[]
 for(const entry of entries.filter(e=>e.isDirectory()&&e.name.startsWith('operation-')).sort((a,b)=>a.name.localeCompare(b.name))){
  const folder=join(runs,entry.name),[request,phases,native,terminal,execution]=await Promise.all(['request.json','phases.json','native-timings.json','terminal.json','execution.json'].map(file=>json(join(folder,file))))
  operations.push({operation:entry.name,requestStatus:request.status,op:['context','context-config','prepare','fresh','read','native','progress'].includes(request.value?.op)?request.value.op:null,
   phases:fields(phases,{resources_ms:number,runtime_copy_ms:number,runtime_guard_ms:number,native_group_ms:number}),nativeTimings:fields(native,{worker_ms:number,runtime_guard_ms:number}),
   terminal:fields(terminal,{terminal:bool,jobAssigned:bool,jobActive:number,neverStarted:bool}),
   execution:fields(execution,{outcome:v=>['running','completed','cancelled','timeout','supervision-error','start-failed','descendants-stopped','stop-failed','drain-timeout','output-limit','capture-failed','cleanup-failed'].includes(v),exit:Number.isSafeInteger,started:bool,job_assigned_before_resume:bool,active_before_stop:number,job_active_after_stop:number,elapsed_ms:number,stop_ms:number,drain_ms:number})})
 }
 return {status:'present',operations}
}
