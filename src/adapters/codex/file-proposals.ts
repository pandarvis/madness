import {lstat,readFile,realpath} from 'node:fs/promises'
import {resolve,relative,isAbsolute,sep,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {TextDecoder} from 'node:util'
import {isDeepStrictEqual} from 'node:util'
import {isRecord,MAX_DRAFT_LENGTH} from '../../contracts/index.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
import type {ApprovalFile} from '../../contracts/approvals.ts'
const hash=(bytes:Buffer|string):string=>createHash('sha256').update(bytes).digest('hex')
const inside=(root:string,path:string):boolean=>{const r=relative(root,path);return !!r&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+sep)}
const exact=(v:Record<string,unknown>,keys:string[]):boolean=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k))
/** Appliquer un diff unifié entièrement vérifié ; toute ambiguïté est refusée. */
function patched(before:string,diff:string):string{
 const source=before.split('\n');if(source.at(-1)==='')source.pop()
 const lines=diff.split('\n');if(lines.at(-1)==='')lines.pop()
 const output:string[]=[];let cursor=0,index=0,newline=before.endsWith('\n')
 while(index<lines.length){
  const match=/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?:.*)$/.exec(lines[index++]);if(!match)throw dialogueFailure('OUTPUT_REFUSED')
  const start=Number(match[1]),oldCount=match[2]===undefined?1:Number(match[2]),newStart=Number(match[3]),newCount=match[4]===undefined?1:Number(match[4]),position=oldCount===0?start:start-1
  if(position<cursor||position>source.length)throw dialogueFailure('OUTPUT_REFUSED')
  output.push(...source.slice(cursor,position));cursor=position;if((newCount===0?newStart:newStart-1)!==output.length)throw dialogueFailure('OUTPUT_REFUSED')
  let removed=0,added=0,last=''
  while(index<lines.length&&!lines[index].startsWith('@@ ')){
   const line=lines[index++];if(line==='\\ No newline at end of file'){if(last==='+'||last===' ')newline=false;continue}
   const marker=line[0],value=line.slice(1);if(![' ','-','+'].includes(marker))throw dialogueFailure('OUTPUT_REFUSED')
   if(marker!=='+'&&source[cursor++]!==value)throw dialogueFailure('OUTPUT_REFUSED')
   if(marker!=='+')removed++;if(marker!=='-'){output.push(value);added++;newline=true}last=marker
  }
  if(removed!==oldCount||added!==newCount)throw dialogueFailure('OUTPUT_REFUSED')
 }
 output.push(...source.slice(cursor));if(cursor<source.length)newline=before.endsWith('\n')
 return output.join('\n')+(newline&&output.length?'\n':'')
}
export type CapturedFileProposal={files:ApprovalFile[];assertUnchanged():Promise<void>;inspectEffects(decision?:'accept'|'decline'):Promise<{matches:boolean;files:{path:string;sha256:string|null;matches:boolean}[]}>;same(changes:unknown):boolean}
export async function captureFileProposal(rootPath:string,changes:unknown,protectedRoots:string[]=[]):Promise<CapturedFileProposal>{
 const root=await realpath(rootPath),rootIdentity=await lstat(root,{bigint:true}),declaredRoot=resolve(rootPath),protectedPaths=await Promise.all(protectedRoots.map(async p=>realpath(p).catch(()=>resolve(p)))),snapshots:{path:string;before:Buffer|null;after:Buffer|null}[]=[],files:ApprovalFile[]=[]
 if(!Array.isArray(changes)||!changes.length||changes.length>50)throw dialogueFailure('OUTPUT_REFUSED')
 const normalize=(value:unknown):unknown=>Array.isArray(value)?[...value].sort((a,b)=>String(a.path).localeCompare(String(b.path))):value
 const native=structuredClone(normalize(changes))
 async function safePath(path:string):Promise<void>{
  try{const currentRoot=await lstat(root,{bigint:true});if(currentRoot.isSymbolicLink()||!currentRoot.isDirectory()||currentRoot.dev!==rootIdentity.dev||currentRoot.ino!==rootIdentity.ino||await realpath(root)!==root||await realpath(declaredRoot)!==root)throw Error()}catch{throw dialogueFailure('OUTPUT_REFUSED')}
  if(!inside(root,path)||protectedPaths.some(p=>path.toLowerCase()===p.toLowerCase()||inside(p,path)))throw dialogueFailure('OUTPUT_REFUSED')
  const parts=relative(root,path).split(sep);if(parts.some(p=>['.git','.agents','_bmad','.codex','.aws'].includes(p.toLowerCase())||p.includes(':')||/[. ]$/.test(p)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)))throw dialogueFailure('OUTPUT_REFUSED')
  let current=root;for(let i=0;i<parts.length;i++){current=resolve(current,parts[i]);try{const stat=await lstat(current);if(stat.isSymbolicLink()||i<parts.length-1&&!stat.isDirectory()||i===parts.length-1&&!stat.isFile())throw dialogueFailure('OUTPUT_REFUSED');if(await realpath(current)!==current)throw dialogueFailure('OUTPUT_REFUSED')}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT'&&i===parts.length-1)return;throw error}}
 }
 async function bytes(path:string):Promise<Buffer|null>{await safePath(path);try{const stat=await lstat(path);if(stat.size>MAX_DRAFT_LENGTH||stat.nlink!==1)throw dialogueFailure('OUTPUT_REFUSED');return await readFile(path)}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return null;throw error}}
 for(const change of changes){
  if(!isRecord(change)||!exact(change,['path','kind','diff'])||typeof change.path!=='string'||!change.path.length||change.path.includes('\0')||typeof change.diff!=='string'||change.diff.length>MAX_DRAFT_LENGTH||!isRecord(change.kind))throw dialogueFailure('OUTPUT_REFUSED')
  const kind=change.kind.type;if(!['add','update','delete'].includes(String(kind))||!exact(change.kind,kind==='update'?['type','move_path']:['type'])||kind==='update'&&change.kind.move_path!==null)throw dialogueFailure('OUTPUT_REFUSED')
  const candidate=resolve(root,change.path),path=inside(declaredRoot,candidate)?resolve(root,relative(declaredRoot,candidate)):candidate;if(files.some(f=>f.path.toLowerCase()===path.toLowerCase()))throw dialogueFailure('OUTPUT_REFUSED')
  const before=await bytes(path);if(kind==='add'?before!==null:before===null)throw dialogueFailure('OUTPUT_CONFLICT')
  let previous='';try{if(before)previous=new TextDecoder('utf-8',{fatal:true}).decode(before)}catch{throw dialogueFailure('OUTPUT_REFUSED')}
  if(previous.includes('\0')||change.diff.includes('\0'))throw dialogueFailure('OUTPUT_REFUSED')
  if(kind==='delete'&&previous!==change.diff)throw dialogueFailure('OUTPUT_CONFLICT')
  const after=kind==='delete'?null:Buffer.from(kind==='add'?change.diff:patched(previous,change.diff),'utf8')
  if(after!==null&&after.byteLength>MAX_DRAFT_LENGTH)throw dialogueFailure('OUTPUT_REFUSED')
  files.push({path,kind:kind as ApprovalFile['kind'],diff:change.diff,beforeSha256:before===null?null:hash(before),afterSha256:after===null?null:hash(after)});snapshots.push({path,before,after})
 }
 if(files.reduce((n,f)=>n+f.diff.length,0)>MAX_DRAFT_LENGTH)throw dialogueFailure('OUTPUT_REFUSED')
 return {files,same:changes=>isDeepStrictEqual(native,normalize(changes)),assertUnchanged:async()=>{for(const s of snapshots){const current=await bytes(s.path);if(!isDeepStrictEqual(current,s.before))throw dialogueFailure('OUTPUT_CONFLICT')}},inspectEffects:async(decision='accept')=>{const result=[];for(const s of snapshots){const current=await bytes(s.path);result.push({path:s.path,sha256:current===null?null:hash(current),matches:isDeepStrictEqual(current,decision==='accept'?s.after:s.before)})}return {matches:result.every(f=>f.matches),files:result}}}
}
