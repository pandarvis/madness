import {createReadStream} from 'node:fs'
import {createInterface} from 'node:readline'
import {readFile,writeFile} from 'node:fs/promises'

// Ce relevé ne conserve ni messages, ni outils, ni données d'authentification.
const file=process.argv[2]
const ledger=JSON.parse(await readFile('_bmad-output/initiative-madness/suivi-us.json','utf8'))
const rows=[]
for await (const line of createInterface({input:createReadStream(file),crlfDelay:Infinity})) {
  let item; try {item=JSON.parse(line)} catch {continue}
  const time=item.timestamp
  if (!time || time<'2026-10-27T00:00:00Z') continue
  if(item.type==='event_msg' && item.payload?.type==='token_count') {
    const info=item.payload.info
    if(info?.total_token_usage) rows.push({time,total:info.total_token_usage,last:info.last_token_usage??null})
  }
}
const windows=ledger.stories.filter(s=>s.recordedStart).map(s=>({story:s.id,start:s.recordedStart,end:s.recordedEnd??new Date().toISOString(),boundary:s.boundary}))
const report={observedAt:new Date().toISOString(),scope:'Ce fil racine uniquement ; inclusion des sous-agents et appels du produit non établie. Les échantillons proches des bornes et les échanges annexes de la fenêtre interdisent une attribution exacte à la seule US.',windows:windows.map(w=>{
 const during=rows.filter(x=>x.time>=w.start&&x.time<=w.end)
 const before=rows.filter(x=>x.time<w.start).at(-1)
 const series=[...(before?[before]:[]),...during]
 const keys=['input_tokens','cached_input_tokens','output_tokens','reasoning_output_tokens','total_tokens']
 const resets=series.slice(1).filter((x,i)=>x.total.total_tokens<series[i].total.total_tokens).length
 const first=before??during[0],last=during.at(-1)
 const delta=first&&last&&!resets?Object.fromEntries(keys.map(k=>[k,(last.total[k]??0)-(first.total[k]??0)])):null
 return {...w,elapsedSeconds:Math.floor((Date.parse(w.end)-Date.parse(w.start))/1000),samples:during.length,beforeTimestamp:before?.time??null,lastTimestamp:last?.time??null,counterResets:resets,usageDelta:delta}
})}
await writeFile('_bmad-output/initiative-madness/.working/us-metadata-observations.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
