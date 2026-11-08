import {spawn} from 'node:child_process'
import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {createHash,randomUUID} from 'node:crypto'
import {createReadStream} from 'node:fs'
import {lstat,mkdtemp,realpath,rmdir} from 'node:fs/promises'
import {dirname,isAbsolute,join,relative,sep} from 'node:path'
import {TextDecoder} from 'node:util'
import {dialogueError,dialogueFailure} from '../../contracts/dialogue.ts'
import {isRecord,MAX_DRAFT_LENGTH} from '../../contracts/index.ts'
import {contextId} from '../../contracts/bmad-context.ts'
import type {CapturedBmadContext} from '../../contracts/bmad-context.ts'
import type {BmadProfile,DialogueSession} from '../../core/ports.ts'
import {assertBmadProfile,readBmadFile} from '../bmad/profile.ts'
import type {OwnedRun} from '../codex/owned-run.ts'
import {stopNative} from '../codex/probe.ts'

type NativeSettings={cwd:string;env:NodeJS.ProcessEnv;shell:false;windowsHide:true}
type ProbeOwner=Pick<OwnedRun,'begin'|'capture'|'closed'>

async function recordClose(owner:ProbeOwner,runId:string,closed:boolean,onUnknown:()=>void):Promise<void> {
  try{if(await owner.closed(runId,closed)&&closed)return}catch{/* La preuve n’est pas durable. */}
  onUnknown()
  throw dialogueFailure('STOP_UNCONFIRMED')
}

export async function runClaudeProbe(executable:string,args:string[],settings:NativeSettings,signal:AbortSignal,
  owner:ProbeOwner,onUnknown:()=>void,timeoutMs=10000):Promise<string> {
  signal.throwIfAborted()
  const runId=await owner.begin()
  let child:ChildProcessWithoutNullStreams|undefined,closed=false
  let timer:ReturnType<typeof setTimeout>|undefined,abort:(()=>void)|undefined
  try{
    signal.throwIfAborted()
    const probe=spawn(executable,args,{...settings,stdio:['pipe','pipe','pipe']})
    child=probe
    const output:Buffer[]=[]
    let bytes=0,failed=false
    const limit=(chunk:Buffer):void=>{
      bytes+=chunk.length
      if(bytes>65536){failed=true;probe.kill()}
    }
    probe.stdout.on('data',chunk=>{limit(chunk);if(!failed)output.push(chunk)})
    probe.stderr.on('data',limit)
    probe.stdin.on('error',()=>{failed=true})
    probe.stdout.on('error',()=>{failed=true})
    probe.stderr.on('error',()=>{failed=true})
    probe.on('error',()=>{failed=true})
    const exit=new Promise<number|null>(resolve=>probe.once('close',code=>{closed=true;resolve(code)}))
    let finish!:()=>void
    const ended=new Promise<null>(resolve=>{finish=()=>resolve(null)})
    abort=()=>{failed=true;probe.kill();finish()}
    signal.addEventListener('abort',abort,{once:true})
    timer=setTimeout(abort,timeoutMs)
    probe.stdin.end()
    if(probe.pid){
      // Une sonde rapide peut déjà avoir fermé ses flux. Dans ce cas, close est la preuve.
      await owner.capture(runId,probe.pid,executable).catch(()=>{})
    }
    const code=await Promise.race([exit,ended])
    signal.throwIfAborted()
    if(code!==0||failed)throw dialogueFailure('CLAUDE_FAILED')
    return utf8.decode(Buffer.concat(output))
  }finally{
    clearTimeout(timer)
    if(abort)signal.removeEventListener('abort',abort)
    if(child&&!closed)closed=await stopNative(child).catch(()=>false)
    await recordClose(owner,runId,!child||closed,onUnknown)
  }
}
const version='2.1.318 (Claude Code)'
// Image Windows x64 signée et observée pendant la qualification de la CLI personnelle.
const qualifiedSha256='b9aa5b08dc2cc46ea77d334dce792d1b8fdbb3a43bb290efdebdc905b1181082'
const maxOutput=512*1024
const safetyArgs=['--restricted','--safe-mode']
const utf8=new TextDecoder('utf-8',{fatal:true})
type Source=NonNullable<BmadProfile['catalogSource']>
type Options={
  home:string; appData:string; localAppData:string; temp:string; environment:NodeJS.ProcessEnv;
  owner:OwnedRun; admit():()=>void; assertRecovery():Promise<void>; onUnknown():void
  history?:readonly {role:'user'|'assistant';text:string}[]
}

export function claudeArgs(sessionId:string):string[] {
  return [...safetyArgs,'--print','--input-format','text','--output-format','json','--tools','',
    '--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--disallowedTools','mcp__*',
    '--no-session-persistence','--disable-slash-commands','--no-chrome','--permission-prompts','none','--max-turns','1',
    '--settings','{"disableAllHooks":true}','--session-id',sessionId]
}

export function claudeEnvironment(source:NodeJS.ProcessEnv,home:string,appData:string,localAppData:string,cwd:string):NodeJS.ProcessEnv {
  const systemRoot=Object.entries(source).find(([key])=>key.toUpperCase()==='SYSTEMROOT')?.[1]
  if(!systemRoot||!isAbsolute(systemRoot))throw dialogueFailure('CLAUDE_UNAVAILABLE')
  const network=Object.fromEntries(Object.entries(source).map(([key,value])=>[key.toUpperCase(),value])
    .filter(([key])=>['HTTP_PROXY','HTTPS_PROXY','NO_PROXY','NODE_EXTRA_CA_CERTS'].includes(key!)))
  return {...network,SystemRoot:systemRoot,WINDIR:systemRoot,Path:[join(systemRoot,'System32'),systemRoot].join(';'),
    USERPROFILE:home,HOME:home,APPDATA:appData,LOCALAPPDATA:localAppData,TEMP:cwd,TMP:cwd,DISABLE_AUTOUPDATER:'1'}
}

export function personalSubscription(stdout:string):boolean {
  try{
    const value:unknown=JSON.parse(stdout)
    return isRecord(value)&&value.loggedIn===true&&value.authMethod==='claude.ai'
      &&value.apiProvider==='firstParty'&&(value.subscriptionType==='max'||value.subscriptionType==='pro')
  }catch{return false}
}

export function parseClaudeResult(stdout:string,sessionId:string):string {
  let value:unknown
  try{value=JSON.parse(stdout)}catch{throw dialogueFailure('CLAUDE_FAILED')}
  if(!isRecord(value)||value.type!=='result'||value.session_id!==sessionId)throw dialogueFailure('CLAUDE_FAILED')
  if(value.is_error===true&&typeof value.result==='string'&&isNetworkError(value.result))throw dialogueFailure('CLAUDE_NETWORK_UNAVAILABLE')
  if(value.subtype!=='success'||value.is_error!==false||value.num_turns!==1
    ||typeof value.result!=='string'||!value.result.trim()||value.result.length>MAX_DRAFT_LENGTH)throw dialogueFailure('CLAUDE_FAILED')
  return value.result
}

const isNetworkError=(text:string):boolean=>/\b(?:ENOTFOUND|EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ERR_NETWORK)\b/i.test(text)

export function followUp(history:readonly {role:'user'|'assistant';text:string}[],text:string):string {
  const lines=history.map(m=>(m.role==='user'?'### User':'### Assistant (you)')+'\n\n'+m.text)
  return '\n\n## Conversation so far\n\nContinue the same conversation in character. Earlier turns:\n\n'+lines.join('\n\n')+'\n\n## New user message\n\n'+text
}

export function buildClaudePrompt(skill:string,source:Pick<Source,'sha256'|'bytes'>,captured:CapturedBmadContext):string {
  const bytes=Buffer.from(skill,'utf8')
  if(bytes.length!==source.bytes||createHash('sha256').update(bytes).digest('hex')!==source.sha256)throw dialogueFailure('PROFILE_CHANGED')
  if(captured.initiativeId!==null&&!contextId(captured.initiativeId))throw dialogueFailure('CONTEXT_MISMATCH')
  return [
    'Madness requests the opening reply of BMad analyst Mary in a single read-only conversation.',
    'Use the pinned BMad skill below as persona and guidance. No tools, files, scripts, menus that trigger actions, or further turns are available.',
    'Greet the user in French, introduce yourself as Mary the business analyst, state the available context, and offer next steps as suggestions. Do not claim to have executed setup, scripts, or workflows.',
    'Active BMad initiative identifier: '+JSON.stringify(captured.initiativeId),
    '',
    '--- BEGIN PINNED MARY SKILL ---',
    skill,
    '--- END PINNED MARY SKILL ---'
  ].join('\n')
}

const absent=(error:unknown):boolean=>(error as NodeJS.ErrnoException).code==='ENOENT'
async function refuseLocalPolicy(settings:NativeSettings,home:string,signal:AbortSignal,options:Options):Promise<void> {
  const {env}=settings
  // Une stratégie locale peut s’appliquer même au profil restreint.
  const roots=new Set(['C:\\Program Files\\ClaudeCode',join(dirname(env.SystemRoot!),'Program Files','ClaudeCode')])
  for(const path of [...Array.from(roots).flatMap(root=>['managed-settings.json','managed-settings.d','managed-mcp.json'].map(name=>join(root,name))),
    join(home,'.claude','remote-settings.json')]){
    try{await lstat(path);throw dialogueFailure('CLAUDE_POLICY_UNSUPPORTED')}
    catch(error){if(!absent(error))throw dialogueFailure('CLAUDE_POLICY_UNSUPPORTED')}
  }
  const script=[
    "$ErrorActionPreference='Stop'",
    "foreach($hive in 'LocalMachine','CurrentUser'){foreach($view in 'Registry64','Registry32'){",
    "$root=[Microsoft.Win32.RegistryKey]::OpenBaseKey($hive,$view)",
    "$key=$root.OpenSubKey('SOFTWARE\\Policies\\ClaudeCode')",
    "if($null -ne $key){'present';exit}",
    "}};'absent'"
  ].join('\n')
  try{
    const stdout=await runClaudeProbe(join(env.SystemRoot!,'System32','WindowsPowerShell','v1.0','powershell.exe'),
      ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],
      settings,signal,options.owner,options.onUnknown,8000)
    if(stdout.trim()!=='absent')throw Error()
  }catch(error){
    if(dialogueError(error,'CLAUDE_POLICY_UNSUPPORTED')==='STOP_UNCONFIRMED')throw error
    signal.throwIfAborted()
    throw dialogueFailure('CLAUDE_POLICY_UNSUPPORTED')
  }
}

async function resolveExecutable(options:Options,signal:AbortSignal):Promise<string> {
  for(const candidate of [
    join(options.home,'.local','bin','claude.exe'),
    join(options.localAppData,'Programs','Claude','claude.exe'),
    join(options.appData,'npm','node_modules','@anthropic-ai','claude-code','bin','claude.exe')
  ]){
    signal.throwIfAborted()
    try{
      const info=await lstat(candidate)
      if(!info.isFile()||info.isSymbolicLink()||(await realpath(candidate)).toLowerCase()!==candidate.toLowerCase())
        throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
      return candidate
    }catch(error){if(!absent(error))throw error}
  }
  throw dialogueFailure('CLAUDE_UNAVAILABLE')
}

const sameBinary=(first:Awaited<ReturnType<typeof binaryStamp>>,second:Awaited<ReturnType<typeof binaryStamp>>):boolean=>
  first.dev===second.dev&&first.ino===second.ino&&first.size===second.size&&first.mtimeNs===second.mtimeNs&&first.ctimeNs===second.ctimeNs
const binaryStamp=(path:string)=>lstat(path,{bigint:true})

async function verifyBinary(executable:string,signal:AbortSignal) {
  const original=await binaryStamp(executable)
  if(!original.isFile()||original.size!==342408352n)throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
  const hash=createHash('sha256')
  for await (const chunk of createReadStream(executable,{signal}))hash.update(chunk)
  if(hash.digest('hex')!==qualifiedSha256||!sameBinary(original,await binaryStamp(executable)))throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
  return original
}

export async function openClaudeDialogue(profile:BmadProfile,captured:CapturedBmadContext,signal:AbortSignal,assertContext:(submit?:()=>void)=>Promise<void>,options:Options):Promise<DialogueSession> {
  if(process.platform!=='win32')throw dialogueFailure('CLAUDE_UNAVAILABLE')
  const source=profile.catalogSource
  if(!source||source.path!==profile.skillPath)throw dialogueFailure('PROFILE_UNRECOGNIZED')
  const release=options.admit()
  let cwd:string|undefined
  try{
    await options.assertRecovery()
    signal.throwIfAborted()
    const executable=await resolveExecutable(options,signal)
    const stamp=await verifyBinary(executable,signal)
    const temp=await realpath(options.temp)
    const distance=relative(profile.rootPath,temp)
    if(!distance||(!isAbsolute(distance)&&distance!=='..'&&!distance.startsWith('..'+sep)))throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
    const isolated=cwd=await mkdtemp(join(temp,'madness-claude-'))
    const env=claudeEnvironment(options.environment,options.home,options.appData,options.localAppData,isolated)
    const settings={cwd:isolated,env,shell:false,windowsHide:true} as const
    await refuseLocalPolicy(settings,options.home,signal,options)
    const probe=(args:string[])=>runClaudeProbe(executable,args,settings,signal,options.owner,options.onUnknown)
    let currentVersion:string
    try{currentVersion=(await probe(['--version'])).trim()}
    catch(error){
      if(dialogueError(error,'CLAUDE_PROFILE_UNSUPPORTED')==='STOP_UNCONFIRMED')throw error
      signal.throwIfAborted()
      throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
    }
    if(currentVersion!==version)throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
    try{
      if(!personalSubscription(await probe([...safetyArgs,'auth','status'])))throw Error()
    }catch(error){
      if(dialogueError(error,'CLAUDE_SUBSCRIPTION_REQUIRED')==='STOP_UNCONFIRMED')throw error
      signal.throwIfAborted()
      throw dialogueFailure('CLAUDE_SUBSCRIPTION_REQUIRED')
    }
    // Each CLI run is stateless (--no-session-persistence): follow-ups resend the exchanged transcript.
    const history:{role:'user'|'assistant';text:string}[]=[...(options.history??[])]
    let used=history.length>0,stopOutcome:'stopped'|'unknown'='stopped'
    const stop=async():Promise<'stopped'|'unknown'>=>{
      if(stopOutcome==='unknown'){
        stopOutcome=await options.owner.observeStop()
        if(stopOutcome==='unknown')return 'unknown'
      }
      release()
      await rmdir(isolated).catch(()=>{})
      return 'stopped'
    }
    return {
      context:{providerId:'claude-code',connectionId:'claude-local-'+randomUUID(),initiativeId:captured.initiativeId},
      async turn(text,accepted,observe){
        if(used&&text===null)throw dialogueFailure('UNSUPPORTED_INTERACTION')
        used=true
        await refuseLocalPolicy(settings,options.home,signal,options)
        if(!sameBinary(stamp,await binaryStamp(executable)))throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
        const prompt=buildClaudePrompt(await readBmadFile(profile,source.path),source,captured)+(text===null?'':followUp(history,text))
        // La CLI attend son entrée pendant un délai court. Terminer la lecture BMad avant son démarrage.
        await assertContext()
        signal.throwIfAborted()
        const runId=await options.owner.begin()
        const sessionId=randomUUID()
        let child:ChildProcessWithoutNullStreams|undefined,closed=false,overflow=false,interrupted=false
        let timer:ReturnType<typeof setTimeout>|undefined
        const abort=():void=>{interrupted=true;child?.kill()}
        try{
          signal.throwIfAborted()
          const process=spawn(executable,claudeArgs(sessionId),{...settings,stdio:['pipe','pipe','pipe']})
          child=process
          let bytes=0,streamError=false
          const stdout:Buffer[]=[],stderr:Buffer[]=[]
          const receive=(target:Buffer[],chunk:Buffer):void=>{
            bytes+=chunk.length
            if(bytes>maxOutput){overflow=true;process.kill();return}
            target.push(chunk)
          }
          process.stdout.on('data',chunk=>receive(stdout,chunk))
          process.stderr.on('data',chunk=>receive(stderr,chunk))
          process.stdin.on('error',()=>{streamError=true})
          process.stdout.on('error',()=>{streamError=true})
          process.stderr.on('error',()=>{streamError=true})
          const exit=new Promise<number|null>(resolve=>{
            process.once('error',()=>{streamError=true})
            process.once('close',code=>{closed=true;resolve(code)})
          })
          let deadline!:()=>void
          const expired=new Promise<null>(resolve=>{deadline=()=>{abort();resolve(null)}})
          timer=setTimeout(deadline,120000)
          signal.addEventListener('abort',deadline,{once:true})
          try{
            if(!process.pid)throw dialogueFailure('CLAUDE_FAILED')
            await options.owner.capture(runId,process.pid,executable)
            await assertBmadProfile(profile)
            if(!sameBinary(stamp,await binaryStamp(executable)))throw dialogueFailure('CLAUDE_PROFILE_UNSUPPORTED')
            let finishWrite!:()=>void
            const written=new Promise<void>(resolve=>{finishWrite=resolve})
            await assertContext(()=>{
              signal.throwIfAborted()
              if(interrupted||overflow||closed||streamError||process.exitCode!==null||process.signalCode!==null)
                throw dialogueFailure('CLAUDE_FAILED')
              process.stdin.write(prompt,'utf8',error=>{streamError ||= !!error;finishWrite()})
              process.stdin.end()
            })
            await Promise.race([written,expired])
            signal.throwIfAborted()
            if(interrupted||overflow||streamError)throw dialogueFailure('CLAUDE_FAILED')
            await accepted()
            const code=await Promise.race([exit,expired])
            signal.throwIfAborted()
            if(interrupted||overflow||streamError)throw dialogueFailure('CLAUDE_FAILED')
            if(code!==0&&isNetworkError(Buffer.concat(stderr).toString('utf8')))throw dialogueFailure('CLAUDE_NETWORK_UNAVAILABLE')
            const answer=parseClaudeResult(utf8.decode(Buffer.concat(stdout)),sessionId)
            if(code!==0)throw dialogueFailure('CLAUDE_FAILED')
            if(text!==null)history.push({role:'user',text})
            history.push({role:'assistant',text:answer})
            observe?.({id:'claude-terminal-result-'+history.length,order:1,text:answer,completed:true,identity:{kind:'attested',name:'Claude Code',source:'claude-code'}})
            return answer
          }finally{
            signal.removeEventListener('abort',deadline)
            if(!closed)closed=await stopNative(process).catch(()=>false)
          }
        }finally{
          clearTimeout(timer)
          await recordClose(options.owner,runId,!child||closed,()=>{
            stopOutcome='unknown'
            options.onUnknown()
          })
        }
      },
      stop
    }
  }catch(error){
    release()
    if(cwd&&dialogueError(error,'CLAUDE_FAILED')!=='STOP_UNCONFIRMED')await rmdir(cwd).catch(()=>{})
    throw error
  }
}
