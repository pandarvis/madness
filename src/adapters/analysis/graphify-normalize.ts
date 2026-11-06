import {createHash} from 'node:crypto'
import {GRAPH_PROFILE,validateGraphSnapshot} from '../../contracts/bmad-graph.ts'
import type {GraphIdentity,GraphSource,GraphSnapshot,GraphReference} from '../../contracts/bmad-graph.ts'
export type NormalizationContext={identity:GraphIdentity;corpus:GraphSource[];coverage:{included:string[];excluded:string[]};observedAt:string;assemblyRevision:string;limitations?:string[]}
export class IncompatibleGraphifyArtifact extends Error {
 constructor(){super('INCOMPATIBLE_GRAPH')}
}
const absentOrEmptyArray=(value:unknown):boolean=>value===undefined||Array.isArray(value)&&value.length===0
/** Decode only the pinned clustered schema. The corpus is supplied by the original native capture. */
export function normalizeGraphify(bytes:Buffer,context:NormalizationContext):GraphSnapshot{
 const n=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))
 if(n?.graph?.schema_version!==1||n.graph.graphify_version!=='0.9.101'||
    !Array.isArray(n.nodes)||!Array.isArray(n.links)||Object.hasOwn(n,'edges')||
    !absentOrEmptyArray(n.hyperedges)||!absentOrEmptyArray(n.graph.hyperedges))throw new IncompatibleGraphifyArtifact()
 const text=(v:unknown):string=>{if(typeof v!=='string'||!v||v.includes('\0'))throw Error('INVALID_GRAPH');return v}
 const reference=(v:any):GraphReference=>{
  if(v.source_file===undefined||v.source_file===null||v.source_file==='')return {status:'unknown',reason:'absent'}
  const p=text(v.source_file)
  if(/[\\:\x00-\x1f\x7f]/.test(p)||p.split('/').some((s:string)=>!s||s==='.'||s==='..'))throw Error('INVALID_REFERENCE')
  const source=context.corpus.find(s=>s.relativePath===p&&s.kind==='file');if(!source)throw Error('FOREIGN_REFERENCE')
  const raw=v.source_location,value=typeof raw==='number'?raw:typeof raw==='string'&&/^L[1-9][0-9]*$/.test(raw)?Number(raw.slice(1)):null
  if(value!==null&&(!Number.isSafeInteger(value)||value<1||source.lineCount===null||value>source.lineCount))throw Error('INVALID_LINE')
  return {status:'known',relativePath:p,line:value!==null?{status:'known',value}:{status:'unknown',reason:raw===undefined||raw===null||raw===''?'absent':'unrecognized'}}
 }
 const nodes=n.nodes.map((v:any)=>({id:text(v.id),label:text(v.label??v.id),kind:text(v.type??v.file_type??'unknown'),reference:reference(v)})),ids=new Set(nodes.map((v:any)=>v.id))
 const relations=n.links.map((v:any,i:number)=>{
  const explicit=Object.hasOwn(v,'_src')||Object.hasOwn(v,'_tgt');if(explicit&&(!Object.hasOwn(v,'_src')||!Object.hasOwn(v,'_tgt')))throw Error('PARTIAL_DIRECTION')
  const nativeSource=text(v.source),nativeTarget=text(v.target)
  if(!ids.has(nativeSource)||!ids.has(nativeTarget))throw Error('FOREIGN_ENDPOINT')
  const source=explicit?text(v._src):nativeSource,target=explicit?text(v._tgt):nativeTarget
  if(!((source===nativeSource&&target===nativeTarget)||(source===nativeTarget&&target===nativeSource)))throw Error('CONTRADICTORY_DIRECTION')
  return {id:'relation-'+i,source,target,kind:text(v.relation),directionSource:explicit?'explicit-markers':'source-target',confidence:v.confidence,score:v.confidence_score??null,reference:reference(v)}
 })
 const limitations=context.limitations??[]
 const result={schemaVersion:1,identity:context.identity,provenance:{profile:GRAPH_PROFILE,tool:'graphifyy',toolVersion:'0.9.101',nativeSchemaVersion:1,artifact:'clustered-node-link',nativeSha256:createHash('sha256').update(bytes).digest('hex'),assemblyRevision:context.assemblyRevision,normalizerVersion:1},collectedAt:context.observedAt,coverage:{...context.coverage,status:limitations.length?'partial':'complete',limitations},sources:context.corpus,nodes,relations}
 const valid=validateGraphSnapshot(result);if(!valid.ok)throw Error('INVALID_GRAPH:'+valid.issues[0].path);return valid.value
}
