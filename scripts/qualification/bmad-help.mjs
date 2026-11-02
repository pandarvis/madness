import {validHelpContextText} from '../../src/contracts/bmad-help.ts'
import {cp,mkdir,writeFile,readFile,rm,readdir} from 'node:fs/promises'
import {resolve,join,dirname,relative,isAbsolute,sep} from 'node:path'
import {randomUUID,createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {BmadHelpAdapter} from '../../src/adapters/bmad/help.ts'
import {HelpOwnedRun} from '../../src/adapters/bmad/help-owned-run.ts'
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
/** Data-only reference fixture. This export never opens a provider or a personal profile. */
export async function createBmadHelpWitness({root,sourceRoot=repository,id='help-'+randomUUID()}){
 const target=resolve(root)
 await mkdir(target,{recursive:false})
 await writeFile(join(target,'.epic-one-witness.json'),JSON.stringify({schemaVersion:1,owner:'madness-epic-one',id,createdAt:new Date().toISOString()})+'\n',{flag:'wx'})
 await mkdir(join(target,'.agents'),{recursive:true})
 await cp(join(sourceRoot,'.agents/skills'),join(target,'.agents/skills'),{recursive:true,dereference:false,errorOnExist:true})
 await mkdir(join(target,'_bmad'),{recursive:true})
 await writeFile(join(target,'_bmad/config.toml'),'[core]\nuser_name = "Sam"\ncommunication_language = "French"\noutput_folder = "{project-root}/_bmad-output"\nactive_initiative = "initiative-help-witness"\n')
 const initiative=join(target,'_bmad-output/initiative-help-witness'),epic=join(initiative,'tickets/epic-next-action')
 await mkdir(join(epic,'tickets'),{recursive:true})
 await writeFile(join(initiative,'initiative-help-witness.md'),'---\ntype: initiative\ntitle: "Témoin possédé : préparer une petite application locale"\nstatus: draft\n---\n# Application locale témoin\n\nLe porteur souhaite une petite application locale pour retrouver ses notes. L’idée vient d’être formulée, aucun brief, PRD ou ticket produit n’est adopté. Il demande Que faire ensuite ? Une recommandation doit expliquer sa raison et proposer les alternatives pertinentes parmi les modules réellement installés. Aucun travail ne doit être lancé.\n')
 await writeFile(join(epic,'epic-next-action.md'),'---\ntype: epic\ntitle: "Clarifier le prochain travail"\nstatus: draft\n---\n# Prochain travail\n\nLe problème et le besoin utilisateur restent à clarifier. Aucun accord humain sur une solution ou livrable. Ce fichier est une donnée synthétique, pas une preuve d’un workflow effectué.\n')
 await writeFile(join(epic,'tickets/tickets.toml'),'[[entry]]\nid = "1"\ntitle = "Clarifier le besoin avant de construire"\nstatus = "todo"\n')
 return {root:target,id,initiative:'initiative-help-witness'}
}
export async function qualifyHelpLocal({root,sourceRoot=repository,resources=join(repository,'resources/bmad-help')}){
 const target=resolve(root);await mkdir(target,{recursive:false})
 const witness=await createBmadHelpWitness({root:join(target,'project'),sourceRoot})
 const owner=new HelpOwnedRun(join(target,'helper-owner.json'))
 const adapter=new BmadHelpAdapter({root:join(target,'operations'),resources,owner,roots:project=>[join(project,'.agents/skills')]})
 const phases=[],measure=async(name,fn)=>{const at=performance.now();const result=await fn();phases.push({name,durationMs:Math.round(performance.now()-at)});return result}
 const signal=new AbortController().signal
 try{
 const bundle=await measure('prepare',()=>adapter.prepare('help-project',witness.root,signal))
 if(!bundle.nativeReady)throw Error('REFERENCE_HELP_NOT_NATIVE_READY: '+bundle.problems.join('; '))
 await measure('fresh',()=>adapter.assertFresh(bundle.id,signal))
 const host=adapter.host(bundle.id,signal)
 const rawKnowledge=await measure('native-knowledge',()=>host.resolve('knowledge'))
 const rawConfig=await measure('native-config',()=>host.resolve('config'))
 if(rawKnowledge!==bundle.knowledgeRaw||rawConfig!==bundle.configRaw)throw Error('NATIVE_CAPTURE_MISMATCH')
 for(const id of host.preferredReferences()){const raw=await measure('read-'+id,()=>host.read(id));if(id==='required-context'&&!validHelpContextText(raw,bundle))throw Error('CONTEXT_MAPPING_MISMATCH')}
 const proof={schemaVersion:1,mode:'synthetic-real-local-helper-no-provider',witness,bundleRevision:bundle.revision,documents:bundle.documents.map(d=>({source:d.source,sha256:d.sha256,bytes:d.bytes,module:d.module})),nativeReady:bundle.nativeReady,problems:bundle.problems,knowledgeExact:rawKnowledge===bundle.knowledgeRaw,configExact:rawConfig===bundle.configRaw,helperStopped:await owner.status(),phases}
 proof.helperStopped=await adapter.shutdown()
 await writeFile(join(target,'proof.json'),JSON.stringify(proof,null,2)+'\n')
 return {bundle,proof}
 }finally{await adapter.shutdown()}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2],root=process.argv[3]
 if(!root||!isAbsolute(root))throw Error('Explicit absolute owned output required')
 if(mode==='witness')console.log(JSON.stringify(await createBmadHelpWitness({root})))
 else if(mode==='local')console.log(JSON.stringify((await qualifyHelpLocal({root})).proof,null,2))
 else throw Error('Use witness|local and an explicit new owned root; no personal/provider mode is implicit.')
}
