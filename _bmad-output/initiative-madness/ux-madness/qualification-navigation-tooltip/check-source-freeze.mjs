import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const folder='_bmad-output/initiative-madness/ux-madness/qualification-navigation-tooltip'
const manifest=JSON.parse(await readFile(folder+'/release-manifest.json','utf8'))
for(const item of manifest.inputs)assert.equal(createHash('sha256').update(await readFile(item.path)).digest('hex'),item.sha256,item.path)
await writeFile(folder+'/source-freeze.json',JSON.stringify({status:'passed',version:manifest.version,inputs:manifest.inputs.length,checkedAt:new Date().toISOString()},null,2)+'\n')
console.log(JSON.stringify({status:'passed',inputs:manifest.inputs.length}))
