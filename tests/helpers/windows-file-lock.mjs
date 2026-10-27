import {spawn} from 'node:child_process'

/** Vrai handle Windows lisible, sans FILE_SHARE_DELETE : rename doit échouer. */
export async function holdWindowsFile(path){
 if(process.platform!=='win32')throw Error('WINDOWS_REQUIRED')
 const script="$f = [System.IO.File]::Open($env:MADNESS_LOCK_PATH, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite); try { [Console]::WriteLine('READY'); [Console]::Out.Flush(); [Console]::ReadLine() | Out-Null } finally { $f.Dispose() }"
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{env:{...process.env,MADNESS_LOCK_PATH:path},windowsHide:true,stdio:['pipe','pipe','pipe']})
 try{await new Promise((resolve,reject)=>{let data='';const timer=setTimeout(()=>reject(Error('LOCK_TIMEOUT')),15000);child.stdout.on('data',chunk=>{data+=chunk;if(data.includes('READY')){clearTimeout(timer);resolve()}});child.once('error',error=>{clearTimeout(timer);reject(error)});child.once('exit',()=>{clearTimeout(timer);reject(Error('LOCK_EXITED'))})})}
 catch(error){child.kill();throw error}
 return {async release(){if(child.exitCode!==null)return;const closed=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('LOCK_STOP_TIMEOUT'))},10000);child.once('exit',code=>{clearTimeout(timer);code===0?resolve():reject(Error('LOCK_STOP_FAILED'))})});child.stdin.end('\n');await closed}}
}
