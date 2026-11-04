import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {resolve,join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../../../..'),q=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex')
const before=await readFile(join(q,'postquick-baseline/main-index.js'),'utf8'),after=await readFile(join(root,'out/main/index.js'),'utf8')
function strip(text){const methods={};for(const [cls,method,next] of [['BmadProgressCoordinator','reconcile','async execute'],['BmadContextCoordinator','async consultSelection','reconcile']]){const c=text.indexOf('var '+cls+' = class {');assert.ok(c>=0);const begin=text.indexOf('\n\t'+method+'(',c),end=text.indexOf('\n\t'+next+'(',begin);assert.ok(begin>c&&end>begin);methods[cls]=text.slice(begin,end);text=text.slice(0,begin)+'\n\t/* qualified '+cls+' method difference */'+text.slice(end)}return {text,methods}}
const a=strip(before),b=strip(after);assert.equal(a.text,b.text,'remaining compiled Main bytes must match')
const prior=JSON.parse(await readFile(join(q,'parent-audit-002.json'),'utf8')),unchanged=[];for(const item of prior.compiled){if(item.path.replaceAll('\\','/').endsWith('out/main/index.js'))continue;assert.equal(sha(await readFile(join(root,item.path))),item.sha256);unchanged.push(item)}assert.equal(unchanged.length,18)
const result={at:new Date().toISOString(),status:'passed',previousAsar:prior.asar.sha256,previousMain:sha(Buffer.from(before)),currentMain:sha(Buffer.from(after)),onlyCompiledChanges:['Progress.reconcile armed scopes including pending/uncertain without retained lease','Context.consultSelection qualified lease rearm, after-await guards and unpublished/displaced closure'],remainingMainBytesIdentical:true,unchangedCompiledFiles:unchanged,methodsBefore:a.methods,methodsAfter:b.methods,globalBinaryEquivalence:false,scope:'Reuse unrelated native/file/UI proofs only at their established scopes; new core52 and final Main focus proof qualify changed branches separately.'}
await writeFile(join(q,'postquick-compiled-diff.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,currentMain:result.currentMain,unchanged:unchanged.length}))
