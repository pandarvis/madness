import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {randomUUID} from 'node:crypto'
import {resolve} from 'node:path'
import type {OwnedIdentity,OwnedRunRecord} from '../../contracts/recovery.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
type Store={read():Promise<OwnedRunRecord|null>;write(value:OwnedRunRecord):Promise<void>}
type ProcessControl={read(pid:number):Promise<OwnedIdentity|null>;stop(identity:OwnedIdentity):Promise<boolean>}
const execute=promisify(execFile)
const same=(a:OwnedIdentity,b:OwnedIdentity):boolean=>a.pid===b.pid&&a.startedAt===b.startedAt&&a.executable.toLowerCase()===b.executable.toLowerCase()
const powershell=async(script:string):Promise<string>=>{if(process.platform!=='win32')throw Error('WINDOWS_REQUIRED');return (await execute('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:12000,maxBuffer:65536})).stdout.trim()}
const quoted=(s:string):string=>"'"+s.replaceAll("'","''")+"'"
export const windowsOwnedProcesses:ProcessControl={
 async read(pid){const text=await powershell(`$ErrorActionPreference='Stop'; $p=Get-Process -Id ${pid} -ErrorAction SilentlyContinue; if($null -eq $p){'null';exit}; @{pid=$p.Id;startedAt=$p.StartTime.ToUniversalTime().Ticks.ToString();executable=$p.Path}|ConvertTo-Json -Compress`);const v=JSON.parse(text);if(v===null)return null;if(typeof v.executable!=='string'||!v.executable||typeof v.startedAt!=='string')throw Error();return v},
 async stop(identity){
  // L'objet Process possède le handle vérifié ; aucune commande taskkill récursive ni PID renderer.
  const result=await powershell(`$ErrorActionPreference='Stop'; try{$p=[Diagnostics.Process]::GetProcessById(${identity.pid})}catch [ArgumentException]{'gone';exit}; if($p.StartTime.ToUniversalTime().Ticks.ToString() -ne ${quoted(identity.startedAt)} -or $p.MainModule.FileName -ine ${quoted(identity.executable)}){'different';exit}; $p.Kill(); if($p.WaitForExit(5000)){'stopped'}else{'unknown'}`)
  return ['gone','different','stopped'].includes(result)
 }
}
/** Un seul bail possédé. Les callbacks portent runId et ne peuvent libérer un propriétaire récent. */
export class OwnedRun{
 private store:Store;private processes:ProcessControl;private record:OwnedRunRecord|null=null;private ready:Promise<void>;private locked=false;private activeRun:string|null=null
 constructor(store:Store,processes:ProcessControl=windowsOwnedProcesses){this.store=store;this.processes=processes;this.ready=this.restore();void this.ready.catch(()=>{})}
 private async restore():Promise<void>{this.record=await this.store.read()}
 async healthyActive():Promise<boolean>{await this.ready;return this.activeRun!==null&&this.activeRun===this.record?.runId&&this.record.status==='owned'}
 async status():Promise<'stopped'|'unknown'>{await this.ready;return !this.record||this.record.status==='stopped'?'stopped':'unknown'}
 async begin():Promise<string>{if(this.locked)throw dialogueFailure('STOP_UNCONFIRMED');this.locked=true;try{await this.ready;if(await this.status()!=='stopped')throw dialogueFailure('STOP_UNCONFIRMED');const record:OwnedRunRecord={schemaVersion:1,runId:'run-'+randomUUID(),status:'unknown',identity:null};await this.store.write(record);this.record=record;this.activeRun=record.runId;return record.runId}finally{this.locked=false}}
 async capture(runId:string,pid:number,executable:string):Promise<void>{await this.ready;if(this.record?.runId!==runId||!Number.isSafeInteger(pid)||pid<1)throw dialogueFailure('STOP_UNCONFIRMED');const identity=await this.processes.read(pid);if(!identity||identity.executable.toLowerCase()!==resolve(executable).toLowerCase())throw dialogueFailure('STOP_UNCONFIRMED');const record:OwnedRunRecord={...this.record,status:'owned',identity};await this.store.write(record);this.record=record}
 async closed(runId:string,confirmed:boolean):Promise<boolean>{await this.ready;if(this.record?.runId!==runId)return false;const record:OwnedRunRecord={...this.record,status:confirmed?'stopped':'unknown'};await this.store.write(record);this.record=record;if(confirmed&&this.activeRun===runId)this.activeRun=null;return true}
 async observeStop():Promise<'stopped'|'unknown'>{await this.ready;if(this.locked)return 'unknown';if(!this.record||this.record.status==='stopped')return 'stopped';this.locked=true;const record=this.record;try{if(!record.identity)return 'unknown';const current=await this.processes.read(record.identity.pid);const confirmed=current===null||!same(current,record.identity)||await this.processes.stop(record.identity);await this.closed(record.runId,confirmed);return confirmed?'stopped':'unknown'}catch{return 'unknown'}finally{this.locked=false}}
}
