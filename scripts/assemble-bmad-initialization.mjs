import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lstat, mkdir, readFile, realpath, writeFile} from 'node:fs/promises'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {gzipSync} from 'node:zlib'

const root = fileURLToPath(new URL('../',import.meta.url))
const qualification = join(root,'_bmad-output/initiative-madness/tickets/epic-initialisation-bmad/qualification-initialisation')
const proof = join(qualification,'proofs/run-2026-11-05T13-30-02-191Z-69b533a0/transfer-plan.json')
const sha = value => createHash('sha256').update(value).digest('hex')
const {payload,payloadTreeSha256} = JSON.parse(await readFile(proof,'utf8'))
assert.equal(payload.length,588)
assert.equal(payload.filter(row=>row.type==='file').length,462)
assert.equal(sha(JSON.stringify(payload)),payloadTreeSha256)
assert.equal(new Set(payload.map(row=>row.path.toLowerCase())).size,588)

async function source(path) {
 const name = join(root,path)
 assert.equal(await realpath(name),name)
 const stat = await lstat(name)
 assert.ok(stat.isFile() && stat.nlink===1)
 return readFile(name)
}
const configTemplate = (await source('.agents/skills/bmad/assets/config.template.toml')).toString('utf8')
assert.equal(configTemplate.split('{directory_name}').length,2)
const entries = []
for (const row of payload) {
 const {path,type} = row
 assert.match(path,/^(?:\.agents|_bmad|_bmad-output)(?:\/|$)/)
 assert.ok(path.split('/').every(part=>part && part!=='.' && part!=='..' && !/[\\:<>"|?*]/.test(part)))
 if(type==='directory') { entries.push({path,type}); continue }
 assert.equal(type,'file')
 const bytes = path==='_bmad/config.toml'
  ? Buffer.from(configTemplate.replace('{directory_name}','positive'))
  : await source(path)
 assert.equal(bytes.length,row.bytes,path)
 assert.equal(sha(bytes),row.sha256,path)
 entries.push({...row,data:bytes.toString('base64')})
}
const raw = Buffer.from(JSON.stringify({schemaVersion:1,profileId:'local-6.13.0-next',sourceRevision:payloadTreeSha256,entries}))
const compressed = gzipSync(raw,{level:9})
const output = resolve(root,'resources/bmad-init/payload-v1.json.gz')
await mkdir(dirname(output),{recursive:true})
await writeFile(output,compressed)
console.log(JSON.stringify({sourceRevision:payloadTreeSha256,seal:sha(raw),compressed:compressed.length,raw:raw.length}))
