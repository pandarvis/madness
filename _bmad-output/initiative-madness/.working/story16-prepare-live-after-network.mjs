/** Préparation synthétique uniquement : aucun compte ni fournisseur. */
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {join,resolve,dirname,relative,isAbsolute} from 'node:path'
import {createHash,randomBytes} from 'node:crypto'
import {FORGE_MANIFEST} from '../../../src/adapters/bmad/forge-manifest.ts'
const root=resolve('.'),proof=join(root,'_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-approvals/live-after-network-preparation.json')
try{await readFile(proof);throw Error('PREPARATION_ALREADY_EXISTS')}catch(e){if(e.code!=='ENOENT')throw e}
const witness=join(root,'.g0-qualification','approvals-live-'+randomBytes(4).toString('hex')),sha=b=>createHash('sha256').update(b).digest('hex')
const sources=[]
for(const [name,expected]of Object.entries(FORGE_MANIFEST)){const path=resolve(root,name),rel=relative(root,path);if(!rel||isAbsolute(rel)||rel.startsWith('..'))throw Error('MANIFEST_PATH_REFUSED');const bytes=await readFile(path);if(sha(bytes)!==expected)throw Error('MANIFEST_CHANGED');sources.push({name,bytes})}
await mkdir(witness,{recursive:false})
for(const {name,bytes}of sources){const target=join(witness,name);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'})}
await writeFile(join(witness,'_bmad/config.toml'),'[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="initiative-temoin-1-6"\n',{flag:'wx'})
const base=join(witness,'_bmad-output/initiative-temoin-1-6/essais');await mkdir(base,{recursive:true})
const entries={accord:'# Accord temoin\n\nVersion initiale A0.\n',refus:'# Refus temoin\n\nVersion initiale R0.\n',ajustement:'# Ajustement temoin\n\nVersion initiale J0.\n',suppression:'# Suppression temoin\n\nFichier synthetique possede.\n'},files=[]
for(const [name,content]of Object.entries(entries)){const path=join(base,name+'.md');await writeFile(path,content,{flag:'wx'});files.push({path,sha256:sha(content)})}
files.push({path:join(base,'creation.md'),expected:'absent'})
await writeFile(proof,JSON.stringify({schemaVersion:1,createdAt:new Date().toISOString(),status:'prepared-no-model-run',witness:{root:witness,synthetic:true,bmadFiles:sources.length},files,limits:['Nouveau témoin ; anciens témoins référencés conservés.','Aucun compte, modèle ou approbation lancé par cette préparation.']},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({witness,bmadFiles:sources.length,files:files.length}))
