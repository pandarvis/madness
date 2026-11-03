// Read-only PNG alpha inspection: no raster is transformed.
import { readFile, writeFile } from 'node:fs/promises'
import { inflateSync } from 'node:zlib'
const root = new URL('../../../../', import.meta.url)
const provenance = JSON.parse(await readFile(new URL('resources/atelier-cast-v2/provenance.json', root), 'utf8'))
const reports = []
for (const asset of provenance.assets) {
  const bytes = await readFile(new URL(asset.asset, root))
  if (bytes[24] !== 8 || bytes[25] !== 6 || bytes[28] !== 0) throw Error('PNG_FORMAT_UNEXPECTED')
  const chunks = []
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset)
    if (bytes.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length))
    offset += length + 12
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = asset.width * 4
  let previous = Buffer.alloc(asset.width), transparent = 0, solid = 0
  for (let y = 0; y < asset.height; y++) {
    const row = Buffer.alloc(asset.width), start = y * (stride + 1), filter = raw[start]
    for (let x = 0; x < asset.width; x++) {
      const left = x ? row[x - 1] : 0, up = previous[x], upperLeft = x ? previous[x - 1] : 0
      const p = left + up - upperLeft, a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - upperLeft)
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : filter === 4 ? (a <= b && a <= c ? left : b <= c ? up : upperLeft) : NaN
      if (!Number.isFinite(predictor)) throw Error('PNG_FILTER_UNEXPECTED')
      const alpha = row[x] = (raw[start + 1 + x * 4 + 3] + predictor) & 255
      if (!alpha) transparent++
      if (alpha > 128) solid++
    }
    previous = row
  }
  if (!transparent || !solid) throw Error('ALPHA_MISSING:' + asset.name)
  reports.push({ name: asset.name, width: asset.width, height: asset.height, transparentPixels: transparent, solidPixels: solid })
}
await writeFile(new URL('alpha-inspection.json', import.meta.url), JSON.stringify({ mode: 'read-only PNG decode', assets: reports }, null, 2) + '\n')
console.log(JSON.stringify({ status: 'passed', assets: reports.length }))
