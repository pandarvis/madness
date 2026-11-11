#!/usr/bin/env node
// node scripts/madness-kit.mjs check <dossier> : valide un kit Madness hors de l'application.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseKitManifest } from '../src/core/kits/manifest.ts'

const [command, folder] = process.argv.slice(2)
if (command !== 'check' || !folder) { console.error('Usage : node scripts/madness-kit.mjs check <dossier>'); process.exit(2) }
let text
try { text = await readFile(join(folder, 'madness-kit.toml'), 'utf8') } catch { console.error('✗ Aucun madness-kit.toml dans ' + folder); process.exit(1) }
const result = parseKitManifest(text)
if (!result.ok) { for (const error of result.errors) console.error('✗ ' + error); process.exit(1) }
console.log('✓ ' + result.kit.name + ' ' + result.kit.version + ' : ' + result.kit.pieces.length + ' pièce(s), ' + result.kit.rules.length + ' règle(s)')
for (const notice of result.notices) console.log('· ' + notice)
