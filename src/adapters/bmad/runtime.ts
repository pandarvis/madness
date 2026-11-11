import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { dialogueFailure } from '../../contracts/dialogue.ts'
const runtimeFingerprint = '819d83d34e77ad70a198d831e518fa9b398c3a244aa4af77fd8a8934c3821b92'
// La politique historique omet les .pem : ce réglage TLS est vérifié séparément.
const rejectedCaFingerprint = 'c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718'
const uvFingerprint = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
export async function verifyRuntimeFile(path: string, expected: string): Promise<void> { if (!(await lstat(path)).isFile() || createHash('sha256').update(await readFile(path)).digest('hex') !== expected) throw dialogueFailure('RESOLVER_FAILED') }
export async function runtimeTreeFingerprint(root: string): Promise<string> {
  const digest = createHash('sha256')
  const visit = async (path: string, relative: string): Promise<void> => {
    const info = await lstat(path); if (info.isSymbolicLink()) throw dialogueFailure('RESOLVER_FAILED')
    if (info.isDirectory()) { for (const name of (await readdir(path)).sort()) { if (['site-packages', '__pycache__', 'test', 'tests'].includes(name)) continue; await visit(join(path, name), relative ? relative + '/' + name : name) } }
    else if (info.isFile() && /\.(py|exe|dll|pyd|zip|pth)$/i.test(path)) digest.update(relative + ':' + createHash('sha256').update(await readFile(path)).digest('hex') + '\n')
  }
  for (const name of ['python.exe', 'python3.dll', 'python312.dll', 'vcruntime140.dll', 'vcruntime140_1.dll', 'DLLs', 'Lib']) await visit(join(root, name), name)
  return digest.digest('hex')
}
let bundledResources = resolve('resources')
/** Packaged builds keep their resources elsewhere than the working directory. */
export function configureBundledRuntime(resources: string): void { bundledResources = resources }
export function bundledRuntimePaths(): { python: string; uv: string } { return { python: join(bundledResources, 'graphify/assembly/runtime'), uv: join(bundledResources, 'runtime-tools/uv.exe') } }
/** Python et uv viennent de Madness, jamais du projet ni de Codex. -E -s -S excluent site et PYTHON*. */
export async function bmadRuntime(): Promise<{ uv: string; python: string }> {
  const bundled = bundledRuntimePaths()
  let root: string, uv: string
  try { root = await realpath(bundled.python); uv = await realpath(bundled.uv) } catch { throw dialogueFailure('RESOLVER_FAILED') }
  await verifyRuntimeFile(uv, uvFingerprint)
  try { await verifyRuntimeFile(join(root, 'Lib/codex-rejected-cas.pem'), rejectedCaFingerprint) } catch { throw dialogueFailure('RESOLVER_FAILED') }
  if (await runtimeTreeFingerprint(root) !== runtimeFingerprint) throw dialogueFailure('RESOLVER_FAILED')
  return { uv, python: join(root, 'python.exe') }
}
