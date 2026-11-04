// Qualified native005 data replay. It grants no physical file authority and performs no native operation.
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {normalizeGraphify} from '../../src/adapters/analysis/graphify-normalize.ts'
import {validateGraphState} from '../../src/contracts/bmad-graph.ts'
const base='_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe-produit/vertical-005/'
export async function nativeGraphReplay(outcome='interrupted'){
 const report=JSON.parse(await readFile(base+'report.json','utf8')),bytes=await readFile(base+'native-graph.json'),original=JSON.parse(await readFile(base+'original-sources.json','utf8')),assembly=JSON.parse(await readFile('_bmad-output/initiative-madness/tickets/epic-graphe-projet/qualification-graphe-produit/candidate-manifest.json','utf8')),corpus=[]
 for(const [relativePath,source] of Object.entries(original)){if(!/\.(py|ts)$/.test(relativePath))continue;const raw=Buffer.from(source.text);if(createHash('sha256').update(raw).digest('hex')!==source.sha256)throw Error('REPLAY_SOURCE_CHANGED');corpus.push({relativePath,sha256:source.sha256,lineCount:source.text?source.text.split(/\r\n|\r|\n/).length-(source.text.endsWith('\n')?1:0):0,kind:'file'})}
 corpus.sort((a,b)=>a.relativePath.localeCompare(b.relativePath));const snapshot=normalizeGraphify(bytes,{identity:report.first.identity,corpus,coverage:{included:report.first.coverage.included,excluded:report.first.coverage.excluded},observedAt:report.first.freshness.observedAt,assemblyRevision:assembly.assembly.sha256}),{analysisId,sourceRevision,...scope}=snapshot.identity
 const activity={...report.stop.activity,phase:'terminal',outcome,stop:'confirmed'},state={contractVersion:1,scope,lastEventOrder:5,activity,result:{status:'complete',snapshot,error:null},lastComplete:structuredClone(snapshot),freshness:{status:'unverified',sourceRevision,observedAt:null},preservation:{status:'unrecorded',durableAnalysisId:null}};if(!validateGraphState(state).ok)throw Error('INVALID_REPLAY_STATE')
 return {contractVersion:1,sequence:1,projects:[state],fileBindings:[],preparing:null,issues:[]}
}
