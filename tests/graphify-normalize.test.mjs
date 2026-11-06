import {createHash} from 'node:crypto'
import {realpathSync} from 'node:fs'
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {GraphifyAdapter} from '../src/adapters/analysis/graphify.ts'
import {validateGraphAnalysisEvent} from '../src/contracts/bmad-graph.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeGraphify} from '../src/adapters/analysis/graphify-normalize.ts'
const hash='a'.repeat(64)
const context={identity:{projectId:'p',rootPath:'C:/p',rootIdentity:'physical-root',scopeId:'code',scopeRevision:hash,analysisId:'one',sourceRevision:hash},corpus:[{relativePath:'a.ts',sha256:hash,lineCount:3,kind:'file'}],coverage:{included:['code'],excluded:['configuration']},observedAt:'2026-11-04T12:00:00.000Z',assemblyRevision:hash}
const native=()=>({graph:{schema_version:1,graphify_version:'0.9.101'},directed:false,nodes:[{id:'a',label:'useService()',type:'function',source_file:'a.ts',source_location:'L2'},{id:'b',label:'act()',type:'method'}],links:[{source:'b',target:'a',_src:'a',_tgt:'b',relation:'calls',confidence:'INFERRED',confidence_score:0.85,source_file:'a.ts'}]})
test('native graph preserves marker direction, inferred score and absent line without native data escaping',()=>{const s=normalizeGraphify(Buffer.from(JSON.stringify(native())),context);assert.deepEqual(s.relations.map(r=>[r.source,r.target,r.confidence,r.score,r.reference.line]),[['a','b','INFERRED',0.85,{status:'unknown',reason:'absent'}]]);assert.deepEqual(s.nodes[0].reference,{status:'known',relativePath:'a.ts',line:{status:'known',value:2}});assert.equal('native' in s,false)})
for(const [name,mutate] of [['one marker',v=>delete v.links[0]._tgt],['foreign source',v=>v.nodes[0].source_file='../secret.ts'],['foreign node',v=>v.links[0].target='missing'],['confidence',v=>v.links[0].confidence='CERTAIN'],['schema',v=>v.graph.schema_version=2],['line',v=>v.nodes[0].source_location='L99']])test('refuses '+name,()=>{const v=native();mutate(v);assert.throws(()=>normalizeGraphify(Buffer.from(JSON.stringify(v)),context))})
test('direction markers may reverse the native pair but cannot substitute another node', () => {
 const v = native()
 v.nodes.push({id:'c'})
 v.links[0]._tgt = 'c'
 assert.throws(() => normalizeGraphify(Buffer.from(JSON.stringify(v)), context), /CONTRADICTORY_DIRECTION/)
})
test('source-target keeps orientation despite directed false and unrecognized location stays unknown',()=>{const v=native();delete v.links[0]._src;delete v.links[0]._tgt;v.nodes[0].source_location='unknown';const s=normalizeGraphify(Buffer.from(JSON.stringify(v)),context);assert.equal(s.relations[0].source,'b');assert.deepEqual(s.nodes[0].reference.line,{status:'unknown',reason:'unrecognized'})})

const qualify = '_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe/runs/matrix-006'
test('qualified native corpus retains orientation and provenance without admitting sources outside the supplied corpus', async () => {
 const base = qualify + '/G2-nominal'
 const bytes = await readFile(base + '/native-graph.json')
 const inventory = JSON.parse(await readFile(base + '/source-before.json', 'utf8'))
 const corpus = await Promise.all(Object.entries(inventory).filter(([path]) => /\.(cs|py|ts|js)$/.test(path) || path === 'package.json').map(async ([relativePath, entry]) => {
  const source = await readFile(base + '/corpus/' + relativePath, 'utf8')
  return {relativePath, sha256: entry.sha256, lineCount: (source.match(/[^\r\n]*(?:\r\n|\r|\n)|[^\r\n]+$/g)?.length ?? 0), kind: 'file'}
 }))
 const result = normalizeGraphify(bytes, {...context, corpus})
 assert.deepEqual([result.nodes.length, result.relations.length], [73, 57])
 assert.equal(result.provenance.nativeSha256, createHash('sha256').update(bytes).digest('hex'))
 const call = result.relations.find(r => r.source === 'typed_client_useservice' && r.target === 'typed_service_service_act')
 assert.deepEqual([call?.kind, call?.directionSource, call?.confidence, call?.score], ['calls', 'source-target', 'INFERRED', 0.85])
 assert.throws(() => normalizeGraphify(bytes, {...context, corpus: corpus.filter(s => s.relativePath !== 'package.json')}), /FOREIGN_REFERENCE/)
})
for (const [name, change] of [
 ['mixed links and edges', v => { v.edges = [] }],
 ['malformed root hyperedges', v => { v.hyperedges = {} }],
 ['malformed graph hyperedges', v => { v.graph.hyperedges = '' }],
 ['foreign tool version', v => { v.graph.graphify_version = 'other' }],
]) test('incompatible envelope refuses ' + name, () => {
 const v = native()
 change(v)
 assert.throws(() => normalizeGraphify(Buffer.from(JSON.stringify(v)), context), /INCOMPATIBLE_GRAPH/)
})

test('adapter publishes typed format refusal, partial coverage and unknown stop without emitting native data', async () => {
 const root = realpathSync.native(await mkdtemp(join(tmpdir(), 'madness-graph-decode-')))
 try {
  const data = join(root, 'data')
  await mkdir(data)
  await writeFile(join(data, 'files.json'), '{}')
  let stop = 'stopped', interruptAfterRun
  const adapter = new GraphifyAdapter({owner: {status: async () => stop}})
  adapter.run = async ({op},signal,attempt,reportStop) => {
   if(op==='analyze'){reportStop(stop==='stopped');interruptAfterRun?.abort()}
   return {folder: root, result: op === 'capture' ? {
   ...context.identity, revision: hash, observedAt: context.observedAt, corpus: context.corpus,
   sources: [], excluded: [], receiptSha: createHash('sha256').update('{}').digest('hex')
   } : {sourceState: interruptAfterRun?'changed':'unchanged', observedAt: context.observedAt}}
  }
  const {signal} = new AbortController()
  const original = await adapter.capture('p', root, signal)
  const request = {contractVersion: 1, identity: {...context.identity, scopeRevision: adapter.scopeRevision},
   corpus: original.corpus, coverage: context.coverage, generation: 1, correlationId: 'decode'}
  async function analyze(bytes, warning = '', runSignal = signal) {
   await writeFile(join(root, 'native-graph.json'), bytes)
   await writeFile(join(root, 'analysis-stderr.log'), warning)
   const events = []
   await adapter.analyze(request, e => events.push(e), runSignal)
   assert.ok(events.every(e => validateGraphAnalysisEvent(e).ok))
   return events.slice(1)
  }
  const raw = await readFile(qualify + '/G5-raw/native-graph.json')
  const [refusal, stopped] = await analyze(raw)
  assert.deepEqual([refusal.error.code, refusal.error.recovery, stopped.reason, stopped.stop], ['INCOMPATIBLE', 'inspect-profile', 'incompatible', 'confirmed'])
  assert.equal((await analyze(Buffer.from('{')))[0].error.code, 'ANALYSIS_FAILED')
  const graph = native()
  graph.nodes[0].metadata = {html: '<script>owned-native-only</script>'}
  const [result, terminal] = await analyze(JSON.stringify(graph), 'warning C:/owned-native-only/path')
  assert.deepEqual([result.snapshot.coverage.status, terminal.reason], ['partial', 'partial'])
  assert.equal(JSON.stringify(result).includes('owned-native-only'), false)
  stop = 'unknown'
  const unconfirmed = await analyze(raw)
  assert.deepEqual(unconfirmed.map(e => e.error?.code), ['STOP_UNCONFIRMED'])
  stop = 'stopped'
  interruptAfterRun = new AbortController()
  const interrupted = await analyze(JSON.stringify(graph), '', interruptAfterRun.signal)
  assert.deepEqual(interrupted.map(e => [e.type,e.reason,e.stop]), [['stopped','interrupted','confirmed']])
  assert.deepEqual(adapter.facts(original),{sourceState:'changed',observedAt:context.observedAt})
 } finally { await rm(root, {recursive: true, force: true}) }
})


test('native dependency nodes retain their relations without acquiring a project file reference',()=>{
 const v=native()
 for(const [i,specifier] of ['node:fs','playwright-core'].entries()){
  const id='module-'+i
  v.nodes.push({id,label:specifier,type:'module',source_file:specifier})
  v.links.push({source:'a',target:id,relation:'imports',confidence:'EXTRACTED',source_file:'a.ts'})
 }
 const s=normalizeGraphify(Buffer.from(JSON.stringify(v)),context)
 assert.deepEqual(s.nodes.slice(2).map(node=>node.reference),[
  {status:'unknown',reason:'absent'},{status:'unknown',reason:'absent'}
 ])
 assert.equal(s.relations.length,3)
 v.nodes[2].source_file='C:/External/secret.ts'
 v.nodes[2].label=v.nodes[2].source_file
 assert.throws(()=>normalizeGraphify(Buffer.from(JSON.stringify(v)),context),/INVALID_REFERENCE/)
 v.nodes[2].source_file='node:fs'
 v.nodes[2].label='node:fs'
 v.nodes[2].source_location='L1'
 assert.throws(()=>normalizeGraphify(Buffer.from(JSON.stringify(v)),context),/INVALID_REFERENCE/)
})
