// Bench-only reporting. This module never controls the product or an external editor.
import {writeFile,rename} from 'node:fs/promises'
import {join} from 'node:path'
import {randomUUID} from 'node:crypto'
const describe=error=>(error?.code?'['+error.code+'] ':'')+String(error?.stack??error)
export function createQualificationReporter(output,report){
 let tail=Promise.resolve(),sequence=0
 return async function checkpoint(stage,details=null){
  report.stage=stage;report.checkpointSequence=++sequence;report.updatedAt=new Date().toISOString()
  report.stages??=[];report.stages.push({sequence,stage,at:report.updatedAt,...(details?{details}: {})})
  const bytes=JSON.stringify(report,null,2),temporary=join(output,'verification.next-'+randomUUID()+'.json')
  const work=tail.then(async()=>{await writeFile(temporary,bytes,{flag:'wx'});await rename(temporary,join(output,'verification.json'))})
  tail=work.catch(()=>{})
  return work
 }
}
export async function finalizeQualification(report,{checkpoint,close,canCleanup,cleanup}){
 let closureFailed=false
 try{
  if(close)try{await close()}catch(error){closureFailed=true;report.closureError=describe(error)}
  report.functionalStatus=report.status
  if(report.externalEditor?.requested&&report.externalEditor.stop!=='stopped'){
   report.cleanup=false;report.cleanupStatus='retained-external-editor-stop-unknown'
  }else if(!closureFailed&&canCleanup()){
   report.cleanupStatus='cleanup-started';await checkpoint('cleanup-started')
   try{await cleanup();report.cleanup=true;report.cleanupStatus='removed-after-owned-stop-proof'}
   catch(error){report.cleanup=false;report.cleanupStatus='retained-cleanup-failed';report.cleanupError=describe(error)}
  }else{report.cleanup=false;report.cleanupStatus='retained-owned-stop-not-proved'}
 }finally{
  if(report.error)report.status='failed'
  else if(report.closureError||report.cleanupError||!report.cleanup)report.status='partial'
  report.finishedAt=new Date().toISOString()
  await checkpoint('finished')
 }
 return report
}
