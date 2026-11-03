import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'

const run = promisify(execFile)
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const source = process.argv.find(arg => arg.startsWith('--source='))?.slice(9)
if (!source) throw Error('SOURCE_REQUIRED')
const directory = join(root, 'resources/branding')
await mkdir(directory, { recursive: true })
const master = join(directory, 'madness-logo.png')
await copyFile(source, master)
const sizes = [16, 24, 32, 48, 64, 128, 256]
const images = []
for (const size of sizes) {
  const path = join(directory, `madness-${size}.png`)
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', master, '-vf', `scale=${size}:${size}:flags=lanczos`, '-frames:v', '1', path])
  const png = await readFile(path)
  if (png.readUInt32BE(16) !== size || png.readUInt32BE(20) !== size || png[25] !== 6) throw Error('RGBA_ICON_REQUIRED')
  let payload = png
  if (size < 256) {
    // Classic bottom-up 32-bit DIB frames work with all Windows icon extractors.
    // Keep the large 256px frame PNG-compressed for Explorer's large thumbnails.
    const { stdout } = await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', path, '-vf', 'vflip', '-f', 'rawvideo', '-pix_fmt', 'bgra', 'pipe:1'], { encoding: 'buffer', maxBuffer: 1024 * 1024 })
    if (stdout.length !== size * size * 4) throw Error('ICON_PIXEL_LENGTH')
    const row = Math.ceil(size / 32) * 4, mask = Buffer.alloc(row * size), dib = Buffer.alloc(40)
    dib.writeUInt32LE(40, 0); dib.writeInt32LE(size, 4); dib.writeInt32LE(size * 2, 8)
    dib.writeUInt16LE(1, 12); dib.writeUInt16LE(32, 14); dib.writeUInt32LE(stdout.length + mask.length, 20)
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (stdout[(y * size + x) * 4 + 3] === 0) mask[y * row + (x >> 3)] |= 1 << (7 - (x & 7))
    payload = Buffer.concat([dib, stdout, mask])
  }
  images.push({ size, png: payload })
}
const header = Buffer.alloc(6 + sizes.length * 16)
header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4)
let offset = header.length
for (const [index, { size, png }] of images.entries()) {
  const position = 6 + index * 16
  header[position] = size === 256 ? 0 : size
  header[position + 1] = size === 256 ? 0 : size
  header.writeUInt16LE(1, position + 4); header.writeUInt16LE(32, position + 6)
  header.writeUInt32LE(png.length, position + 8); header.writeUInt32LE(offset, position + 12)
  offset += png.length
}
const ico = Buffer.concat([header, ...images.map(image => image.png)])
await writeFile(join(directory, 'madness.ico'), ico)
const manifest = { generator: 'image_gen.imagegen intégré', original: source, transparentBackground: true, sizes,
  transformations: 'Redimensionnement Lanczos ; ICO à six frames DIB BGRA avec masque et une frame PNG 256px ; aucun dessin modifié.',
  masterSha256: createHash('sha256').update(await readFile(master)).digest('hex'), icoSha256: createHash('sha256').update(ico).digest('hex') }
await writeFile(join(directory, 'provenance.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest))
