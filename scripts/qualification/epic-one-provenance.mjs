// Provenance partagée sans top-level await ni import du point d’entrée CLI.
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {readFile,readdir} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {treeDigests,sha256} from './epic-one-support.mjs'
const repository=resolve(fileURLToPath(new URL('../../',import.meta.url)))
const epic=join(repository,'_bmad-output/initiative-madness/tickets/epic-boucle-codex')
const execute=promisify(execFile)
const histories=['qualification-g0','qualification-boucle-bmad','qualification-conversation','qualification-questions','qualification-approvals','qualification-recovery','qualification-overview','qualification-maintenance','qualification-sweep']
export const defaultManifest=join(epic,'qualification-forge-session-check/installation-final/release-manifest.json')
export async function historicalDigests(){return Object.fromEntries(await Promise.all(histories.map(async name=>[name,await treeDigests(join(epic,name))])))}
export async function harnessProvenance(){
 const files=(await readdir(join(repository,'scripts/qualification'))).filter(n=>n.endsWith('.mjs')).sort()
 return {revision:(await execute('git',['rev-parse','HEAD'],{cwd:repository,windowsHide:true})).stdout.trim(),files:await Promise.all(files.map(async name=>({path:'scripts/qualification/'+name,sha256:sha256(await readFile(join(repository,'scripts/qualification',name)))}))),origin:'Sources courantes du banc ; aucune régénération des inputs du manifeste historique.'}
}
