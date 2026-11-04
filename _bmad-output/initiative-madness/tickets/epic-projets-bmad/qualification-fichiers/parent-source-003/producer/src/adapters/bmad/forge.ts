import { createHash, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { lstat, mkdir, open, readFile, readdir, realpath, unlink } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { TextDecoder } from 'node:util'
import { dialogueFailure } from '../../contracts/dialogue.ts'
import type { WorkflowObservation, WorkflowRecord } from '../../contracts/dialogue.ts'
import { isRecord } from '../../contracts/index.ts'
import type { BmadProfile } from '../../core/ports.ts'
import { FORGE_MANIFEST } from './forge-manifest.ts'
import { bmadRuntime } from './runtime.ts'
import { stopNative } from '../codex/probe.ts'
const hash = (v: Buffer | string): string => createHash('sha256').update(v).digest('hex')
const missing = (e: unknown): boolean => (e as NodeJS.ErrnoException).code === 'ENOENT'
const inside = (root: string, path: string): boolean => { const d=relative(root,path); return !!d && !isAbsolute(d) && d!=='..' && !d.startsWith('..'+sep) }
/** Chaque composant est vérifié ; aucune jonction/lien ne peut fournir un script ou recevoir une sortie. */
export async function forgePath(root: string, path: string, allowMissing = false): Promise<string> {
  const target = resolve(path)
  if (!inside(root,target)) throw dialogueFailure('OUTPUT_REFUSED')
  const parts=relative(root,target).split(sep); let current=root
  for (const part of parts) { current=join(current,part); try { const info=await lstat(current); if(info.isSymbolicLink() || (await realpath(current)).toLowerCase()!==current.toLowerCase()) throw dialogueFailure('OUTPUT_REFUSED') } catch(e) { if(allowMissing && missing(e)) continue; throw e } }
  return target
}
async function bytes(root: string, path: string, limit=1048576): Promise<Buffer> { await forgePath(root,path); const info=await lstat(path); if(!info.isFile() || info.nlink!==1 || info.size>limit) throw dialogueFailure('OUTPUT_REFUSED'); return readFile(path) }
const decode = (v: Buffer): string => { try { return new TextDecoder('utf-8',{fatal:true}).decode(v) } catch { throw dialogueFailure('OUTPUT_REFUSED') } }
function selfContainedHtml(text:string):boolean {
  if(!/<html[\s>]/i.test(text)||!/<style[\s>]/i.test(text)||!/<svg[\s>]/i.test(text))return false
  if(/<(?:script|iframe|link|object|embed|base)\b|\bon\w+\s*=|\bsrc(?:set)?\s*=|@import\b|<meta\b[^>]*http-equiv/i.test(text))return false
  for(const match of text.matchAll(/url\s*\(([^)]*)\)/gi))if(!match[1].trim().replace(/^['"]|['"]$/g,'').startsWith('#'))return false
  return true
}
async function inputs(root: string): Promise<string> {
  const values: string[]=[]
  const expectedNames=[...new Set(Object.keys(FORGE_MANIFEST).filter(p=>p.startsWith('.agents/skills/')).map(p=>p.split('/')[2]))].sort()
  const actualNames=(await readdir(join(root,'.agents/skills'),{withFileTypes:true})).filter(p=>p.isDirectory()||p.isSymbolicLink()).map(p=>p.name).sort()
  if(JSON.stringify(expectedNames)!==JSON.stringify(actualNames)) throw dialogueFailure('PROFILE_CHANGED')
  for(const [path,expected] of Object.entries(FORGE_MANIFEST)) { const actual=hash(await bytes(root,join(root,path))); if(actual!==expected) throw dialogueFailure('PROFILE_CHANGED'); values.push(path+':'+actual) }
  for(const name of expectedNames) for(const file of ['bmod.toml','customize.toml','roster.toml','SKILL.md']) { const path='.agents/skills/'+name+'/'+file; if(Object.hasOwn(FORGE_MANIFEST,path)) continue; try { await lstat(join(root,path)); throw dialogueFailure('PROFILE_CHANGED') } catch(e) { if(!missing(e)) throw e } }
  values.push('_bmad/config.toml:'+hash(await bytes(root,join(root,'_bmad/config.toml'),32768)))
  const custom=join(root,'_bmad/custom')
  try { await forgePath(root,custom); for(const name of (await readdir(custom)).filter(n=>n.endsWith('.toml')).sort()) values.push('_bmad/custom/'+name+':'+hash(await bytes(root,join(custom,name),32768))) } catch(e) { if(!missing(e)) throw e }
  // Les emplacements de secours des personas ne sont pas couverts par ce profil.
  for(const path of ['.claude/skills/bmad-party-mode','_bmad/skills/bmad-party-mode']) { try { await lstat(join(root,path)); throw dialogueFailure('PROFILE_UNRECOGNIZED') } catch(e) { if(!missing(e)) throw e } }
  return hash(values.join('\n'))
}
export async function runForgeScript(profile: BmadProfile, script: 'workflow'|'config'|'personas'|'memlog', args: string[], signal: AbortSignal, runner=resolve('resources/bmad-script-runner.py'),assertContext?:()=>Promise<void>,onStarted?:()=>void): Promise<string> {
  signal.throwIfAborted()
  const runtime=await bmadRuntime(profile.rootPath)
  signal.throwIfAborted()
  const target=script==='personas'?join(profile.rootPath,'.agents/skills/bmad-forge-idea/scripts/resolve_personas.py'):join(profile.rootPath,'_bmad/scripts',script==='workflow'?'resolve_customization.py':script==='config'?'resolve_config.py':'memlog.py')
  const env={...Object.fromEntries(Object.entries(process.env).filter(([key])=>['SYSTEMROOT','WINDIR','TEMP','TMP','PATH'].includes(key.toUpperCase()))),UV_CACHE_DIR:join(tmpdir(),'madness-uv-cache')}
  await assertContext?.()
  signal.throwIfAborted()
  const child=spawn(runtime.uv,['run','--offline','--no-project','--no-config','--python',runtime.python,'--',runtime.python,'-B','-I','-S',runner,profile.rootPath,target,...args],{cwd:profile.rootPath,env,shell:false,windowsHide:true,stdio:['pipe','pipe','pipe']})
  if(child.pid!==undefined)onStarted?.()
  let count=0, output='', timer: ReturnType<typeof setTimeout> | undefined
  child.stdin.end();child.stdout.setEncoding('utf8');child.stdout.on('data',chunk=>{count+=Buffer.byteLength(chunk);if(count<=1048576)output+=chunk;else child.kill()});child.stderr.on('data',chunk=>{count+=chunk.length;if(count>1048576)child.kill()})
  const abort=():void=>{child.kill()};signal.addEventListener('abort',abort,{once:true})
  try { const code=await Promise.race([new Promise<number|null>((res,rej)=>{child.once('close',res);child.once('error',rej)}),new Promise<never>((_,rej)=>{timer=setTimeout(()=>{child.kill();rej(dialogueFailure('RESOLVER_FAILED'))},30000)})]);signal.throwIfAborted();if(code!==0||count>1048576)throw dialogueFailure('RESOLVER_FAILED');return output }
  finally {clearTimeout(timer);signal.removeEventListener('abort',abort);if(!await stopNative(child))throw dialogueFailure('STOP_UNCONFIRMED')}
}
async function resolved(profile: BmadProfile, kind: 'workflow'|'config'|'personas',signal: AbortSignal,runner?:string): Promise<string> {
  const args=kind==='workflow'?['--project-root',profile.rootPath,'--skill',dirname(profile.skillPath),'--key','workflow']:kind==='config'?['--project-root',profile.rootPath,'--key','core.output_folder','--key','core.active_initiative']:['--project-root',profile.rootPath,'--skill',dirname(profile.skillPath)]
  return runForgeScript(profile,kind,args,signal,runner)
}
/** Lecture bornée du seul frontmatter natif ; le corps du journal n'est jamais retourné. */
async function sessionFrontmatter(root:string,path:string):Promise<Buffer> {
  await forgePath(root,path)
  const info=await lstat(path)
  if(!info.isFile()||info.nlink!==1||info.size>1048576)throw dialogueFailure('OUTPUT_REFUSED')
  const file=await open(path,'r')
  try{
    const opened=await file.stat()
    if(!opened.isFile()||opened.nlink!==1||opened.size!==info.size||opened.dev!==info.dev||opened.ino!==info.ino)throw dialogueFailure('OUTPUT_REFUSED')
    let data=Buffer.alloc(0)
    while(data.length<65536){
      const chunk=Buffer.alloc(Math.min(1024,65536-data.length)),{bytesRead}=await file.read(chunk,0,chunk.length,null)
      if(!bytesRead)throw dialogueFailure('OUTPUT_REFUSED')
      data=Buffer.concat([data,chunk.subarray(0,bytesRead)])
      const end=(data.length===opened.size?/\r?\n---(?:\r?\n|$)/:/\r?\n---\r?\n/).exec(data.toString('latin1'))
      if(end){
        const header=data.subarray(0,end.index+end[0].length),text=decode(header),lines=text.split(/\r?\n/)
        if(lines[0]!=='---')throw dialogueFailure('OUTPUT_REFUSED')
        const fields=new Map<string,string>()
        for(const line of lines.slice(1,lines.indexOf('---',1))){
          const field=/^([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$/.exec(line)
          if(!field||fields.has(field[1])||/[\x00-\x08\x0b-\x1f\x7f]/.test(field[2]))throw dialogueFailure('OUTPUT_REFUSED')
          fields.set(field[1],field[2].trim())
        }
        if(fields.get('status')!=='complete')throw dialogueFailure('RESUME_UNSUPPORTED')
        await forgePath(root,path)
        const current=await lstat(path),after=await file.stat()
        if(current.nlink!==1||current.dev!==opened.dev||current.ino!==opened.ino||after.size!==opened.size||after.mtimeMs!==opened.mtimeMs||after.ctimeMs!==opened.ctimeMs)throw dialogueFailure('OUTPUT_REFUSED')
        return header
      }
    }
    throw dialogueFailure('OUTPUT_REFUSED')
  }finally{await file.close()}
}
async function sessionDirectory(root:string,base:string){
  await forgePath(root,base,true)
  try{const info=await lstat(base);if(!info.isDirectory()||info.isSymbolicLink())throw dialogueFailure('OUTPUT_REFUSED');return info}catch(error){if(missing(error))return null;throw error}
}
async function sessionLocation(root:string,base:string):Promise<{path:string;exists:boolean;sessions:{path:string;status:'complete';sha256:string;bytes:number}[]}> {
  const before=await sessionDirectory(root,base),names=before?await readdir(base,{withFileTypes:true}):[]
  const sessions:{path:string;status:'complete';sha256:string;bytes:number}[]=[]
  for(const item of names.filter(item=>item.name.toLowerCase().startsWith('forge-')).sort((a,b)=>a.name.localeCompare(b.name))){
    const folder=join(base,item.name);await forgePath(root,folder)
    if(!item.isDirectory())throw dialogueFailure('OUTPUT_REFUSED')
    const path=join(folder,'.memlog.md')
    let data:Buffer
    try{data=await sessionFrontmatter(root,path)}catch(error){if(missing(error))throw dialogueFailure('OUTPUT_REFUSED');throw error}
    sessions.push({path,status:'complete',sha256:hash(data),bytes:data.length})
  }
  const after=await sessionDirectory(root,base)
  if(before===null?after!==null:after===null||before.dev!==after.dev||before.ino!==after.ino||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs)throw dialogueFailure('OUTPUT_REFUSED')
  return {path:base,exists:before!==null,sessions}
}
async function sessionCheck(profile:BmadProfile):Promise<string> {
  try{
    const {outputBase,initiativeId}=profile.forge!,outputRoot=initiativeId?dirname(outputBase):outputBase
    const locations=[await sessionLocation(profile.rootPath,outputRoot)]
    if(outputBase!==outputRoot)locations.push(await sessionLocation(profile.rootPath,outputBase))
    return JSON.stringify({observed:true,locations})
  }catch(error){if((error as {code?:string}).code==='RESUME_UNSUPPORTED')throw error;throw dialogueFailure('OUTPUT_REFUSED')}
}
export async function qualifyForge(rootPath:string,signal:AbortSignal,runner?:string):Promise<BmadProfile> {
  let root:string;try{root=await realpath(rootPath)}catch{throw dialogueFailure('PROFILE_ABSENT')}
  let fingerprint:string;try{fingerprint=await inputs(root)}catch(e){if(missing(e))throw dialogueFailure('PROFILE_ABSENT');throw e}
  const profile:BmadProfile={rootPath:root,skillPath:join(root,'.agents/skills/bmad-forge-idea/SKILL.md'),fingerprint,kind:'forge'}
  const workflow=JSON.parse(await resolved(profile,'workflow',signal,runner)).workflow
  if(!isRecord(workflow)||['activation_steps_prepend','activation_steps_append','persistent_facts','on_complete'].some(k=>!Array.isArray(workflow[k])||workflow[k].length!==0)||workflow.forge_output_path!=='{output_folder}/{active_initiative}'||workflow.run_folder_pattern!=='forge-{slug}')throw dialogueFailure('PROFILE_UNRECOGNIZED')
  const config=JSON.parse(await resolved(profile,'config',signal,runner)),initiative=config['core.active_initiative']??null,output=config['core.output_folder']
  if(typeof output!=='string'||initiative!==null&&(typeof initiative!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(initiative)))throw dialogueFailure('PROFILE_UNRECOGNIZED')
  const outputRoot=resolve(root,output.replaceAll('{project-root}',root));await forgePath(root,outputRoot,true)
  const outputBase=initiative?join(outputRoot,initiative):outputRoot;await forgePath(root,outputBase,true)
  await sessionCheck({...profile,forge:{outputBase,initiativeId:initiative,contextDigest:''}})
  const roster=JSON.parse(await resolved(profile,'personas',signal,runner));if(!isRecord(roster)||roster.agents_resolved!==true||!Array.isArray(roster.agents)||!roster.agents.length||!Array.isArray(roster.members)||!Array.isArray(roster.parties))throw dialogueFailure('PROFILE_UNRECOGNIZED')
  const contextDigest=hash(JSON.stringify({workflow,config,roster}))
  if(await inputs(root)!==fingerprint)throw dialogueFailure('PROFILE_CHANGED')
  return {...profile,forge:{outputBase,initiativeId:initiative,contextDigest}}
}
export type ForgeOperation = {kind:'workflow'|'config'|'personas'|'check-sessions'}|{kind:'init';slug:string;idea:string;goal:string}|{kind:'append';type:string;text:string}|{kind:'write';name:'forge-report.html'|'idea';text:string}|{kind:'finish';outcome:'HARDENED'|'KILLED'|'CLARIFIED'}
type ForgeIdentity={dev:bigint;ino:bigint}
export class ForgeHost {
  readonly profile:BmadProfile
  private signal:AbortSignal
  private runner?:string
  private assertContext?:()=>Promise<void>
  private workspace:string|null=null
  private workspaceIdentity:ForgeIdentity|null=null
  private known=new Map<string,string>()
  private blocked=false
  private completed=false
  private resolved=new Set<string>()
  private sessionsChecked=false
  private observer:((o:WorkflowObservation,workspace?:string,outcome?:WorkflowRecord['outcome'])=>Promise<void>)|null=null
  constructor(profile:BmadProfile,signal:AbortSignal,runner?:string,assertContext?:()=>Promise<void>){if(!profile.forge)throw dialogueFailure('PROFILE_UNRECOGNIZED');this.profile=profile;this.signal=signal;this.runner=runner;this.assertContext=assertContext}
  bind(observer:NonNullable<ForgeHost['observer']>):void{this.observer=observer}
  async assert():Promise<void>{this.signal.throwIfAborted();if(this.blocked)throw dialogueFailure('EFFECT_UNKNOWN');if(await inputs(this.profile.rootPath)!==this.profile.fingerprint)throw dialogueFailure('PROFILE_CHANGED')}
  async assertForTurn():Promise<void>{await this.assert();await bmadRuntime(this.profile.rootPath);this.signal.throwIfAborted()}
  async read(path:string):Promise<string>{await this.assert();const full=resolve(this.profile.rootPath,path),p=relative(this.profile.rootPath,full).replaceAll('\\','/');if(!Object.hasOwn(FORGE_MANIFEST,p)&&!['_bmad/config.toml','_bmad/custom/config.toml','_bmad/custom/config.user.toml'].includes(p))throw dialogueFailure('UNSUPPORTED_INTERACTION');return decode(await bytes(this.profile.rootPath,full))}
  private async file(path:string):Promise<Buffer>{const data=await bytes(this.profile.rootPath,path);if(!this.known.has(path)||this.known.get(path)!==hash(data))throw dialogueFailure('OUTPUT_CONFLICT');return data}
  private async ownedWorkspace():Promise<void>{
    if(!this.workspace||!this.workspaceIdentity)throw dialogueFailure('OUTPUT_CONFLICT')
    await forgePath(this.profile.rootPath,this.workspace)
    const current=await lstat(this.workspace,{bigint:true})
    if(!current.isDirectory()||current.isSymbolicLink()||current.dev!==this.workspaceIdentity.dev||current.ino!==this.workspaceIdentity.ino)throw dialogueFailure('OUTPUT_CONFLICT')
  }
  private async ownedTemporary(path:string,identity:ForgeIdentity,published:boolean):Promise<void>{
    await this.ownedWorkspace();await forgePath(this.profile.rootPath,path)
    const current=await lstat(path,{bigint:true})
    if(!current.isFile()||current.isSymbolicLink()||current.nlink!==(published?2n:1n)||current.dev!==identity.dev||current.ino!==identity.ino)throw dialogueFailure('OUTPUT_CONFLICT')
  }
  private async intactWorkspace(temporary?:string):Promise<void>{
    if(!this.workspace)return
    await this.ownedWorkspace()
    for(const name of await readdir(this.workspace)){
      const path=join(this.workspace,name)
      // Aucun fichier inconnu, hardlink ou reste natif .tmp ne doit être écrasé par les scripts.
      if(path===temporary)continue
      if(!this.known.has(path))throw dialogueFailure('OUTPUT_CONFLICT')
      await this.file(path)
    }
    for(const path of this.known.keys())await this.file(path)
  }
  async execute(op:ForgeOperation,callId:string,turnId:string):Promise<string>{
    await this.assert()
    if(['workflow','config','personas'].includes(op.kind)){
      if(op.kind!=='workflow'&&!this.resolved.has('workflow')||op.kind==='personas'&&!this.resolved.has('config'))throw dialogueFailure('UNSUPPORTED_INTERACTION')
      if(!this.observer)throw dialogueFailure('STORAGE_WRITE_FAILED')
      const output=await resolved(this.profile,op.kind as 'workflow'|'config'|'personas',this.signal,this.runner)
      await this.assert()
      await this.observer({id:callId,turnId,operation:'resolve-'+op.kind,phase:'observed',at:new Date().toISOString(),path:null,sha256:hash(output),bytes:Buffer.byteLength(output)})
      this.resolved.add(op.kind)
      return output
    }
    if(!this.observer)throw dialogueFailure('STORAGE_WRITE_FAILED')
    if(this.completed)throw dialogueFailure('OUTPUT_REFUSED')
    if(op.kind==='check-sessions'){
      if(Object.keys(op).length!==1||this.workspace||!this.resolved.has('config'))throw dialogueFailure('UNSUPPORTED_INTERACTION')
      this.sessionsChecked=false
      const output=await sessionCheck(this.profile)
      await this.assert()
      await this.observer({id:callId,turnId,operation:'check-sessions',phase:'observed',at:new Date().toISOString(),path:null,sha256:hash(output),bytes:Buffer.byteLength(output)})
      this.sessionsChecked=true
      return output
    }
    let path:string
    if(op.kind==='init'){
      if(!this.sessionsChecked)throw dialogueFailure('UNSUPPORTED_INTERACTION')
      if(this.workspace||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(op.slug)||op.slug.length>70||!op.idea.trim()||!op.goal.trim()||op.idea.length>10000||op.goal.length>10000)throw dialogueFailure('OUTPUT_REFUSED')
      this.workspace=join(this.profile.forge!.outputBase,'forge-'+op.slug)
      await forgePath(this.profile.rootPath,this.workspace,true)
      try{await lstat(this.workspace);this.workspace=null;throw dialogueFailure('OUTPUT_CONFLICT')}catch(e){if(!missing(e))throw e}
      path=join(this.workspace!,'.memlog.md')
    }else{
      if(!this.workspace)throw dialogueFailure('OUTPUT_REFUSED')
      await this.intactWorkspace()
      path=join(this.workspace,op.kind==='write'?(op.name==='idea'?this.workspace.split(/[\\/]/).at(-1)+'.md':op.name):'.memlog.md')
      if(op.kind==='write') {if(!op.text.trim()||Buffer.byteLength(op.text)>1048576||op.name==='forge-report.html'&&!selfContainedHtml(op.text))throw dialogueFailure('OUTPUT_REFUSED');try{await lstat(path);throw dialogueFailure('OUTPUT_CONFLICT')}catch(e){if(!missing(e))throw e}}
      else await this.file(path)
      if(op.kind==='append'&&(!['decision','assumption','crack','kill','direction','lock','note'].includes(op.type)||!op.text.trim()||op.text.length>10000))throw dialogueFailure('OUTPUT_REFUSED')
      if(op.kind==='finish'){
        if(!['HARDENED','KILLED','CLARIFIED'].includes(op.outcome))throw dialogueFailure('OUTPUT_REFUSED')
        const reportPath=join(this.workspace,'forge-report.html'),report=decode(await this.file(reportPath));if(!selfContainedHtml(report)||!report.includes(op.outcome))throw dialogueFailure('OUTPUT_REFUSED')
        if(op.outcome==='HARDENED'){const md=join(this.workspace,this.workspace.split(/[\\/]/).at(-1)+'.md');await this.file(md);if(!this.known.has(md))throw dialogueFailure('OUTPUT_REFUSED')}
      }
    }
    await forgePath(this.profile.rootPath,path,true)
    const observation:WorkflowObservation={id:callId,turnId,operation:op.kind,phase:'pending',at:new Date().toISOString(),path,sha256:null,bytes:null}
    await this.observer(observation,this.workspace!)
    let started=false
    try{
      this.signal.throwIfAborted()
      await this.assertContext?.()
      const assertScript=async():Promise<void>=>{await this.assertContext?.();await this.assert();await this.intactWorkspace();await forgePath(this.profile.rootPath,path,true);if(op.kind==='init'){try{await lstat(path);throw dialogueFailure('OUTPUT_CONFLICT')}catch(error){if(!missing(error))throw error}}else await this.file(path)}
      if(op.kind==='init'){await sessionCheck(this.profile);await this.assertContext?.();await forgePath(this.profile.rootPath,this.profile.forge!.outputBase,true);await forgePath(this.profile.rootPath,this.workspace!,true);try{await lstat(this.workspace!);throw dialogueFailure('OUTPUT_CONFLICT')}catch(error){if(!missing(error))throw error};this.signal.throwIfAborted();started=true;await mkdir(this.profile.forge!.outputBase,{recursive:true});await forgePath(this.profile.rootPath,this.profile.forge!.outputBase);await mkdir(this.workspace!);await forgePath(this.profile.rootPath,this.workspace!);this.workspaceIdentity=await lstat(this.workspace!,{bigint:true});await runForgeScript(this.profile,'memlog',['init','--workspace',this.workspace!,'--field','idea='+op.idea,'--field','goal='+op.goal],this.signal,this.runner,assertScript)}
      else if(op.kind==='append'){await runForgeScript(this.profile,'memlog',['append','--workspace',this.workspace!,'--type',op.type,'--text',op.text],this.signal,this.runner,assertScript,()=>{started=true})}
      else if(op.kind==='finish'){await runForgeScript(this.profile,'memlog',['set','--workspace',this.workspace!,'--key','status','--value','complete'],this.signal,this.runner,assertScript,()=>{started=true})}
      else if(op.kind==='write'){
        await this.intactWorkspace()
        const temporary=join(this.workspace!,'.madness-'+randomUUID()+'.tmp')
        await forgePath(this.profile.rootPath,temporary,true)
        let identity:ForgeIdentity|null=null,published=false
        try{
          const f=await open(temporary,'wx',0o600);started=true
          try{identity=await f.stat({bigint:true});await f.writeFile(op.text,'utf8');await f.sync()}finally{await f.close()}
          const {link}=await import('node:fs/promises')
          await this.assertContext?.();await this.assert();await this.intactWorkspace(temporary)
          if(!identity)throw dialogueFailure('OUTPUT_CONFLICT')
          await this.ownedTemporary(temporary,identity,false)
          if(hash(await bytes(this.profile.rootPath,temporary))!==hash(op.text))throw dialogueFailure('OUTPUT_CONFLICT')
          await forgePath(this.profile.rootPath,path,true);try{await lstat(path);throw dialogueFailure('OUTPUT_CONFLICT')}catch(error){if(!missing(error))throw error}
          await this.ownedTemporary(temporary,identity,false);this.signal.throwIfAborted()
          // Exclusive publication; cleanup below requires the same owned file and workspace.
          await link(temporary,path);published=true
        }finally{if(identity){await this.ownedTemporary(temporary,identity,published);await unlink(temporary)}}
      }
      const data=await bytes(this.profile.rootPath,path);this.known.set(path,hash(data))
      await this.assert()
      await this.observer({...observation,phase:'observed',at:new Date().toISOString(),sha256:hash(data),bytes:data.length},this.workspace!,op.kind==='finish'?op.outcome:undefined)
      if(op.kind==='finish')this.completed=true
      return JSON.stringify({observed:true,path,sha256:hash(data),bytes:data.length,...(op.kind==='finish'?{outcome:op.outcome,humanAcceptance:'unknown'}:{})})
    }catch(e){this.blocked=started;await this.observer({...observation,phase:started?'unknown':'failed',at:new Date().toISOString()},this.workspace!).catch(()=>{});if(started)throw dialogueFailure('EFFECT_UNKNOWN');throw e}
  }
}
